/**
 * Klarframe Radio — Demo-Produktion: Drehbuch → Stimmen → Prüfung → Schnitt → MP3.
 *
 *   klarframe-mit-env node produzieren.mjs folgen/<folge>
 *
 * Jede Zeile wird von `gpt-audio-1.5` gesprochen (kann echt lachen, atmen,
 * schmunzeln). Danach hört ein zweites Modell (`gpt-4o-transcribe`) nach, ob
 * WORTGETREU gesprochen wurde, und ob die Zeile nicht ins Endlose lacht.
 * Fällt eine Prüfung durch, wird die Zeile neu gesprochen (höchstens 4-mal).
 * Fertige Zeilen werden zwischengespeichert — ein zweiter Lauf spricht nur,
 * was sich im Drehbuch geändert hat.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const FFMPEG = path.join(path.dirname(new URL(import.meta.url).pathname), 'bin/ffmpeg')
const K = process.env.OPENAI_API_KEY
if (!K) { console.error('OPENAI_API_KEY fehlt (klarframe-mit-env …)'); process.exit(2) }
const ORDNER = path.resolve(process.argv[2] || 'folgen/mallorca-mieten')
const buch = JSON.parse(fs.readFileSync(path.join(ORDNER, 'drehbuch.json'), 'utf8'))
const CLIPS = path.join(ORDNER, 'clips'); fs.mkdirSync(CLIPS, { recursive: true })
const ff = (...a) => execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...a])
const dauer = f => { const s = execFileSync(FFMPEG, ['-hide_banner', '-i', f, '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] }).toString() + ''; return s }
function laenge(f) {
  try { execFileSync(FFMPEG, ['-hide_banner', '-i', f], { stdio: 'pipe' }) } catch (e) {
    const m = String(e.stderr).match(/Duration: (\d+):(\d+):([\d.]+)/); if (m) return +m[1] * 3600 + +m[2] * 60 + +m[3]
  }
  return 0
}
const SPRACHE = { de: 'Deutsch', es: 'Spanisch', en: 'Englisch' }[buch.sprache] || 'Deutsch'

const woerter = t => t.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ß ]+/g, ' ').split(/\s+/).filter(Boolean)
function aehnlich(a, b) {
  const x = woerter(a), y = woerter(b)
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)])
  for (let j = 1; j <= y.length; j++) d[0][j] = j
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1))
  return 1 - d[x.length][y.length] / Math.max(x.length, 1)
}

async function sprechen(z, i, versuch) {
  const s = buch.sprecher[z.wer]
  const vorher = buch.zeilen[i - 1]
  const streng = versuch > 1 ? ' Halte dich diesmal besonders genau an den Wortlaut und fasse dich kurz: Lachen höchstens eine Sekunde, keine langen Pausen.' : ''
  const system = `Du bist ${z.wer === 'lena' ? 'Lena' : 'Jan'}, ${s.rolle}, in der Radiosendung „${buch.titel}“. `
    + `Du sprichst den Text des Nutzers EXAKT Wort für Wort auf ${SPRACHE} – kein Wort hinzufügen, weglassen oder ändern, keine Antwort, kein Kommentar, nichts vorlesen, was in Klammern stünde. `
    + `Nichtsprachliche Laute wie Lachen, Atmen, Schmunzeln, Seufzen sind erlaubt, wenn die Regie es verlangt. Natürlich, menschlich, wie ein echtes Gespräch unter Kollegen, keine Vorlese-Stimme. `
    + (vorher ? `Davor hat ${vorher.wer === 'lena' ? 'Lena' : 'Jan'} gesagt: „${vorher.text}“ – reagiere im Ton darauf. ` : '')
    + `Regie für diese Zeile: ${z.regie}${streng}`
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${K}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-audio-1.5', modalities: ['text', 'audio'], audio: { voice: s.stimme, format: 'wav' }, messages: [{ role: 'system', content: system }, { role: 'user', content: z.text }] }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 300))
  return Buffer.from(d.choices[0].message.audio.data, 'base64')
}

async function hoeren(datei) {
  const fd = new FormData(); fd.append('model', 'gpt-4o-transcribe'); fd.append('language', buch.sprache); fd.append('prompt', `Radiosendung. Namen: Klarframe, idealista, Sóller, Port de Sóller, Palma, Mallorca, Lena, Jan. Zahlen als Wörter ausschreiben. Lachen, Seufzen und Atmen als (lacht), (seufzt), (atmet) in Klammern notieren.`); fd.append('file', new Blob([fs.readFileSync(datei)]), 'x.wav')
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${K}` }, body: fd })
  const d = await r.json(); return (d.text || '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
}

async function zeile(z, i) {
  const nr = String(i + 1).padStart(2, '0')
  const schluessel = crypto.createHash('sha1').update(JSON.stringify([z, buch.sprecher[z.wer], buch.zeilen[i - 1]?.text])).digest('hex').slice(0, 12)
  const ziel = path.join(CLIPS, `${nr}.wav`), meta = path.join(CLIPS, `${nr}.json`)
  if (fs.existsSync(ziel) && fs.existsSync(meta) && JSON.parse(fs.readFileSync(meta, 'utf8')).schluessel === schluessel) return JSON.parse(fs.readFileSync(meta, 'utf8'))
  let bestes = null
  for (let v = 1; v <= 4; v++) {
    const roh = path.join(CLIPS, `${nr}-roh.wav`)
    fs.writeFileSync(roh, await sprechen(z, i, v))
    // Stille vorn und hinten abschneiden — die Lücken setzt der Schnitt.
    ff('-i', roh, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse', '-ar', '24000', '-ac', '1', ziel)
    fs.unlinkSync(roh)
    const sek = laenge(ziel), gehoert = await hoeren(ziel), treue = aehnlich(z.text, gehoert)
    const hoechst = woerter(z.text).length * 0.62 + 2.2
    const ok = treue >= 0.9 && sek <= hoechst
    console.log(`  ${nr} ${z.wer.padEnd(4)} Versuch ${v}: ${sek.toFixed(1)} s (max ${hoechst.toFixed(1)}), Wortgenauigkeit ${(treue * 100).toFixed(0)} % ${ok ? 'OK' : '→ neu'}`)
    const ergebnis = { schluessel, sek, treue, gehoert, versuche: v }
    if (!bestes || (treue - Math.max(0, sek - hoechst) * 0.05) > (bestes.treue - Math.max(0, bestes.sek - hoechst) * 0.05)) { bestes = ergebnis; fs.copyFileSync(ziel, ziel + '.bestes') }
    if (ok) { fs.writeFileSync(meta, JSON.stringify(ergebnis, null, 1)); fs.rmSync(ziel + '.bestes', { force: true }); return ergebnis }
  }
  fs.renameSync(ziel + '.bestes', ziel)
  fs.writeFileSync(meta, JSON.stringify({ ...bestes, warnung: 'keine Fassung bestand alle Prüfungen' }, null, 1))
  return { ...bestes, warnung: true }
}

console.log(`\n═══ ${buch.titel} — ${buch.zeilen.length} Zeilen`)
const ergebnisse = new Array(buch.zeilen.length)
let naechste = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (naechste < buch.zeilen.length) { const i = naechste++; ergebnisse[i] = await zeile(buch.zeilen[i], i) }
}))

// ── Schnitt: Zeitleiste mit natürlichen Lücken, kurze Überlappungen erlaubt ──
const jingleAn = path.join(ORDNER, 'jingle-an.wav'), jingleAus = path.join(ORDNER, 'jingle-aus.wav')
// Ein eigener, weicher Dreiklang (keine fremde Musik, keine Lizenzfragen).
const klang = (töne, datei) => ff('-f', 'lavfi', '-i', `aevalsrc='${töne.map(([f, t]) => `0.18*between(t,${t},9)*exp(-2.6*(t-${t}))*(sin(2*PI*${f}*t)+0.35*sin(4*PI*${f}*t))`).join('+')}':s=24000:d=2.6`, '-af', 'afade=t=out:st=2.0:d=0.6', '-ac', '1', datei)
klang([[523.25, 0], [659.25, 0.16], [783.99, 0.32], [1046.5, 0.5]], jingleAn)
klang([[1046.5, 0], [783.99, 0.16], [659.25, 0.32], [523.25, 0.5]], jingleAus)

const eingaben = [jingleAn], lage = [0]
let t = 1.35
buch.zeilen.forEach((z, i) => {
  const nr = String(i + 1).padStart(2, '0')
  eingaben.push(path.join(CLIPS, `${nr}.wav`)); lage.push(t)
  const naechsteLuecke = (buch.zeilen[i + 1]?.luecke ?? 280) / 1000
  t += ergebnisse[i].sek + naechsteLuecke
})
eingaben.push(jingleAus); lage.push(t + 0.3)
const filter = eingaben.map((_, i) => `[${i}:a]adelay=${Math.round(lage[i] * 1000)}:all=1[a${i}]`).join(';')
  + ';' + eingaben.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${eingaben.length}:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=44100[aus]`
const mp3 = path.join(ORDNER, `${path.basename(ORDNER)}.mp3`)
ff(...eingaben.flatMap(e => ['-i', e]), '-filter_complex', filter, '-map', '[aus]', '-c:a', 'libmp3lame', '-b:a', '192k', '-id3v2_version', '3', '-metadata', `title=${buch.titel}`, '-metadata', 'artist=Klarframe Radio (KI-Stimmen)', '-metadata', 'comment=KI-generierte Stimmen. Quellen im Drehbuch.', mp3)

const warn = ergebnisse.filter(e => e.warnung).length
console.log(`\nFertig: ${mp3} — ${laenge(mp3).toFixed(0)} s, ${warn ? `${warn} Zeile(n) mit Warnung` : 'alle Zeilen geprüft'}`)
fs.writeFileSync(path.join(ORDNER, 'protokoll.json'), JSON.stringify(ergebnisse.map((e, i) => ({ zeile: i + 1, wer: buch.zeilen[i].wer, soll: buch.zeilen[i].text, gehoert: e.gehoert, sek: e.sek, wortgenauigkeit: e.treue, versuche: e.versuche, warnung: e.warnung || undefined })), null, 1))
