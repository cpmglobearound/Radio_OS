import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const run = promisify(execFile)
const FFMPEG = process.env.FFMPEG || 'ffmpeg'

export async function ff(args: string[]) {
  const { stderr } = await run(FFMPEG, ['-hide_banner', '-nostats', '-y', ...args], { maxBuffer: 64 * 1024 * 1024 })
  return stderr
}
export async function dauer(datei: string) {
  try { await run(FFMPEG, ['-hide_banner', '-i', datei]) } catch (e) {
    const m = String((e as { stderr?: string }).stderr).match(/Duration: (\d+):(\d+):([\d.]+)/)
    if (m) return +m[1] * 3600 + +m[2] * 60 + +m[3]
  }
  return 0
}
/** Stille vorn/hinten abschneiden (−45 dB, Rest 50/80 ms) — die Pausen setzt der Schnitt (08 §1.3). */
export async function stilleSchneiden(ein: string, aus: string) {
  await ff(['-loglevel', 'error', '-i', ein, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse', '-ar', '24000', '-ac', '1', aus])
}
/** Längste Stille mitten im Stück (für Aussetzer-Prüfung). */
export async function laengsteStille(datei: string, schwelle = '-45dB', min = 0.6) {
  const err = await ff(['-i', datei, '-af', `silencedetect=noise=${schwelle}:d=${min}`, '-f', 'null', '-'])
  return Math.max(0, ...[...err.matchAll(/silence_duration: ([\d.]+)/g)].map(m => +m[1]))
}
/** Lautheit messen (EBU R128). */
export async function lautheit(datei: string) {
  const err = await ff(['-i', datei, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'])
  const j = JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1))
  return { lufs: +j.input_i, true_peak: +j.input_tp, lra: +j.input_lra, thresh: +j.input_thresh, offset: +j.target_offset }
}
