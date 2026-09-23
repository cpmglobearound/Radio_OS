import type { StimmAnbieter } from './typ'
import { sprechAnweisung } from '../anweisung'

// gpt-audio-1.5: echtes Lachen/Atmen, folgt Regie — so lief die Demo (Lena = marin, Jan = cedar).
export const openaiAudio: StimmAnbieter = {
  id: 'openai-audio', name: 'OpenAI Audio',
  faehigkeiten: { lachen: true, regieAlsText: true, mehrsprecher: false, maxZeichen: 1200, sprachen: ['de-DE', 'es-ES', 'en-GB'] },
  async sprechen(a) {
    let letzter: unknown
    for (let v = 1; v <= 3; v++) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: process.env.MODELL_AUDIO || 'gpt-audio-1.5', modalities: ['text', 'audio'], audio: { voice: a.stimme, format: 'wav' },
          messages: [{ role: 'system', content: sprechAnweisung(a) }, { role: 'user', content: a.text }] }),
        signal: AbortSignal.timeout(120_000),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.choices?.[0]?.message?.audio?.data) {
        const u = d.usage ?? {}
        // Schätzung: Audio-Ausgabe ~ $64/1M Tokens, Text-Eingabe ~ $2.5/1M
        const kosten = ((u.completion_tokens_details?.audio_tokens ?? u.completion_tokens ?? 0) * 64 + (u.prompt_tokens ?? 0) * 2.5) / 1e6
        return { wav: Buffer.from(d.choices[0].message.audio.data, 'base64'), kosten_usd: kosten }
      }
      letzter = new Error(`openai-audio ${r.status}: ${JSON.stringify(d).slice(0, 200)}`)
      if (r.status < 500 && r.status !== 429) break
      await new Promise(res => setTimeout(res, 2000 * v))
    }
    throw letzter
  },
}
