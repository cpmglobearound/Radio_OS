import type { StimmAnbieter, SprechAuftrag } from './typ'
import { sprechAnweisung } from '../anweisung'

// GPT-Live (gpt-live-1) über wss://api.openai.com/v1/live/sessions — die einzige Quelle für Gleam & Co. (07 §2.2).
// Erprobt am 23.09.2026: Skript als Entwickler-Nachricht in `input` = wortgetreu (7/7), Regie wirkt über die Anweisung.
// Ohne Eingangs-Audio schweigt das Modell → Stille in Echtzeit senden. Kein Ende-Signal → Ende über Transkript + Pause.
export const LIVE_STIMMEN = ['marin', 'quartz', 'ripple', 'vesper', 'willow', 'stone', 'gleam', 'meridian', 'bossa', 'tempo', 'beacon', 'delta', 'cinder', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'cedar']
const RATE = 24000, BPS = RATE * 2

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

function wav(pcm: Buffer) {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12)
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24)
  h.writeUInt32LE(BPS, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

function einmal(a: SprechAuftrag): Promise<{ pcm: Buffer; sekunden_abgerechnet: number }> {
  const text = a.text
  const instructions = [
    'Du bist eine Sprecherin/ein Sprecher, die/der ein Skript vorliest. Du führst kein Gespräch.',
    'Sprich das Skript genau einmal, exakt Wort für Wort, in der vorgegebenen Sprache. Füge nichts hinzu: keine Begrüßung, keine Einleitung, keinen Nachsatz, keine Frage. Lass nichts weg und ändere nichts. Nach dem letzten Wort schweigst du.',
    `Rolle, Sprache und Sprechweise (nur WIE, nicht WAS du sagst): ${sprechAnweisung(a)}`,
  ].join('\n')
  const ziel = norm(text).split(' '), letztes = ziel.at(-1)
  return new Promise((resolve, reject) => {
    const WS = WebSocket as unknown as new (url: string, opts: { headers: Record<string, string> }) => WebSocket
    const ws = new WS('wss://api.openai.com/v1/live/sessions', { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } })
    const chunks: Buffer[] = []
    let bytes = 0, transcript = '', fertigBeiMs: number | null = null, ersterTon: number | null = null, lautBis = 0, schnitt: number | null = null
    let stille: ReturnType<typeof setInterval> | undefined, closing = false, erledigt = false, sekunden = 0, fehler: string | null = null
    const send = (o: object) => ws.readyState === 1 && ws.send(JSON.stringify(o))
    const beenden = () => { if (closing) return; closing = true; clearInterval(stille); send({ type: 'session.close' }); setTimeout(() => ws.close(), 3000) }
    const zeit = setTimeout(() => { fehler ??= 'zeitlimit'; beenden() }, Math.max(45_000, ziel.length * 900 + 20_000))
    const abschluss = () => {
      if (erledigt) return; erledigt = true; clearTimeout(zeit); clearInterval(stille)
      let pcm = Buffer.concat(chunks)
      const start = Math.max(0, Math.floor(((ersterTon ?? 0) - 300) / 1000 * RATE) * 2)
      const ende = schnitt !== null ? Math.min(pcm.length, Math.floor(schnitt / 1000 * RATE) * 2) : pcm.length
      pcm = pcm.subarray(start, ende)
      let e = pcm.length - 2; while (e > 0 && Math.abs(pcm.readInt16LE(e)) < 300) e -= 2
      pcm = pcm.subarray(0, Math.min(pcm.length, e + 2 + (RATE / 5) * 2))
      if (!pcm.length || fertigBeiMs === null) return reject(new Error(`openai-live: ${fehler ?? 'Skript nicht vollständig gesprochen'} (${transcript.slice(0, 120)})`))
      resolve({ pcm, sekunden_abgerechnet: sekunden || bytes / BPS })
    }
    ws.onopen = () => send({ type: 'session.start', session: {
      model: process.env.MODELL_LIVE || 'gpt-live-1', instructions,
      input: [{ type: 'message', role: 'developer', content: [{ type: 'input_text', text: `SKRIPT (wörtlich sprechen):\n«${text}»` }] }],
      audio: { format: { type: 'audio/pcm', rate: RATE }, output: { voice: a.stimme } },
    } })
    ws.onmessage = ev => {
      const m = JSON.parse(String(ev.data))
      if (m.type === 'session.started') {
        const s20 = Buffer.alloc(BPS / 50).toString('base64')
        stille = setInterval(() => send({ type: 'session.input_audio.append', audio: s20 }), 20)
        send({ type: 'session.commentary.append', delegation_id: null, content: 'Sprich jetzt das Skript, wörtlich.' })
      } else if (m.type === 'session.output_audio.delta') {
        const b = Buffer.from(m.delta, 'base64'); chunks.push(b); bytes += b.length
        for (let i = 0; i < b.length; i += 2) if (Math.abs(b.readInt16LE(i)) > 300) { lautBis = ((bytes - b.length + i) / BPS) * 1000; ersterTon ??= lautBis }
        const jetzt = (bytes / BPS) * 1000
        if (fertigBeiMs !== null && !closing) {
          if (jetzt - lautBis >= 250 && lautBis >= fertigBeiMs - 300) { schnitt = lautBis + 150; beenden() }
          else if (jetzt >= fertigBeiMs + 1500) { schnitt = fertigBeiMs + 350; beenden() }
        }
      } else if (m.type === 'session.output_transcript.delta') {
        transcript += m.delta
        const w = norm(transcript).split(' ')
        if (fertigBeiMs === null && w.length >= ziel.length && letztes && w.includes(letztes)) {
          fertigBeiMs = m.end_ms
          setTimeout(() => { if (!closing) { schnitt = lautBis + 150; beenden() } }, 1500)
        }
      } else if (m.type === 'error') { fehler = JSON.stringify(m.error).slice(0, 200); beenden() }
      else if (m.type === 'session.closed') { sekunden = Number(m.usage?.seconds ?? 0); abschluss(); ws.close() }
    }
    ws.onclose = () => abschluss()
    ws.onerror = () => { fehler ??= 'verbindung'; }
  })
}

export const openaiLive: StimmAnbieter = {
  id: 'openai-live', name: 'GPT-Live',
  faehigkeiten: { lachen: true, regieAlsText: true, mehrsprecher: false, maxZeichen: 1500, sprachen: ['de-DE', 'es-ES', 'en-GB'] },
  async sprechen(a) {
    let letzter: unknown
    for (let v = 1; v <= 2; v++) {
      try {
        const r = await einmal(a)
        // Abrechnung je Sitzungssekunde: 0,05 $/min (developers.openai.com/api/docs/pricing, 23.09.2026).
        return { wav: wav(r.pcm), kosten_usd: (r.sekunden_abgerechnet / 60) * 0.05 }
      } catch (e) { letzter = e; await new Promise(res => setTimeout(res, 1500 * v)) }
    }
    throw letzter
  },
}
