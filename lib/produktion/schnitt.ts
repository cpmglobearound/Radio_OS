import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { dauer, ff, laengsteStille, lautheit } from './audio'

// Eigene, selbst erzeugte Klänge (keine fremden Rechte, 08 §2.2) — weicher Dreiklang wie in der Demo.
async function klang(toene: [number, number][], datei: string, lautstaerke = 0.18) {
  const expr = toene.map(([f, t]) => `${lautstaerke}*between(t,${t},9)*exp(-2.6*(t-${t}))*(sin(2*PI*${f}*t)+0.35*sin(4*PI*${f}*t))`).join('+')
  await ff(['-loglevel', 'error', '-f', 'lavfi', '-i', `aevalsrc='${expr}':s=24000:d=2.6`, '-af', 'afade=t=out:st=2.0:d=0.6', '-ac', '1', datei])
}
const AUF = [[523.25, 0], [659.25, 0.16], [783.99, 0.32], [1046.5, 0.5]] as [number, number][]
const AB = [[1046.5, 0], [783.99, 0.16], [659.25, 0.32], [523.25, 0.5]] as [number, number][]
const UEBERGANG = [[659.25, 0], [987.77, 0.14]] as [number, number][]

/** Dateien an festen Zeitpunkten übereinanderlegen (Überlappungen erlaubt), mono 48 kHz. */
async function mischen(dateien: string[], lage: number[], aus: string) {
  const filter = dateien.map((_, i) => `[${i}:a]aresample=48000,adelay=${Math.round(lage[i] * 1000)}:all=1[a${i}]`).join(';')
    + ';' + dateien.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${dateien.length}:normalize=0:dropout_transition=0[m]`
  await ff(['-loglevel', 'error', ...dateien.flatMap(e => ['-i', e]), '-filter_complex', filter, '-map', '[m]', '-ac', '1', '-ar', '48000', aus])
}

export interface SchnittZeile { wav: Buffer; sek: number; luecke_ms: number; rolle: string; block: string | null }

/**
 * Schnitt (08 §2): Zeitleiste mit Lücken (Überlappung nur zwischen verschiedenen Rollen), Klänge an Anfang/Blockwechsel/Ende,
 * zweistufige Lautheitsnorm, Ausgaben MP3 + WAV-Master, Kapitelmarken je Block.
 */
export async function schneiden(a: { zeilen: SchnittZeile[]; blockTitel: Record<string, string>; ziel_lufs: number; titel: string; sendung: string; sprache: string; beitrag_id: string }) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'radio-schnitt-'))
  try {
    const auf = path.join(tmp, 'auf.wav'), ab = path.join(tmp, 'ab.wav'), ueb = path.join(tmp, 'ueb.wav')
    await klang(AUF, auf); await klang(AB, ab); await klang(UEBERGANG, ueb, 0.12)
    const eingaben: string[] = [auf], lage: number[] = [0]
    const kapitel: { start_s: number; titel: string; block_id: string | null }[] = []
    let t = 1.35, vorigeRolle = '', vorigerBlock: string | null = null
    for (let i = 0; i < a.zeilen.length; i++) {
      const z = a.zeilen[i]
      const datei = path.join(tmp, `z${i}.wav`); await fs.writeFile(datei, z.wav)
      if (i > 0) {
        let luecke = z.luecke_ms / 1000
        if (luecke < 0 && z.rolle === vorigeRolle) luecke = 0.12   // keine Überlappung derselben Stimme
        if (z.block !== vorigerBlock && z.block) { eingaben.push(ueb); lage.push(t + 0.15); luecke = Math.max(luecke, 1.0) }
        t += luecke
      }
      if (z.block !== vorigerBlock || i === 0) kapitel.push({ start_s: Math.max(0, t - (i === 0 ? 1.35 : 0)), titel: (z.block && a.blockTitel[z.block]) || a.titel, block_id: z.block })
      eingaben.push(datei); lage.push(Math.max(0, t))
      t += z.sek; vorigeRolle = z.rolle; vorigerBlock = z.block
    }
    eingaben.push(ab); lage.push(t + 0.3)
    const roh = path.join(tmp, 'roh.wav')
    // Lange Beiträge (hunderte Zeilen): erst in Teilstücken mischen, dann die Teilstücke — gleiche Zeitleiste, beliebige Länge.
    const TEIL = 60
    if (eingaben.length <= TEIL) await mischen(eingaben, lage, roh)
    else {
      const teile: string[] = [], teilLage: number[] = []
      for (let k = 0; k < eingaben.length; k += TEIL) {
        const ein = eingaben.slice(k, k + TEIL), lg = lage.slice(k, k + TEIL), start = Math.min(...lg)
        const datei = path.join(tmp, `teil${k}.wav`)
        await mischen(ein, lg.map(x => x - start), datei)
        teile.push(datei); teilLage.push(start)
      }
      await mischen(teile, teilLage, roh)
    }
    // Zweistufiges loudnorm: messen, dann setzen (08 §2.4).
    const m = await lautheit(roh)
    const norm = `loudnorm=I=${a.ziel_lufs}:TP=-1.5:LRA=11:measured_I=${m.lufs}:measured_TP=${m.true_peak}:measured_LRA=${m.lra}:measured_thresh=${m.thresh}:offset=${m.offset}:linear=true`
    const master = path.join(tmp, 'master.wav'), mp3 = path.join(tmp, 'beitrag.mp3')
    const meta = ['-metadata', `title=${a.titel}`, '-metadata', `album=${a.sendung}`, '-metadata', 'artist=Klarframe Radio (KI-Stimmen)', '-metadata', `language=${a.sprache}`,
      '-metadata', `comment=KI-generierte Stimmen / AI-generated voices. Beitrag ${a.beitrag_id}. Quellen in den Shownotes.`, '-metadata', `date=${new Date().toISOString().slice(0, 10)}`]
    await ff(['-loglevel', 'error', '-i', roh, '-af', `${norm},aresample=48000`, '-c:a', 'pcm_s24le', ...meta, master])
    await ff(['-loglevel', 'error', '-i', master, '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '192k', '-id3v2_version', '3', ...meta, mp3])
    const laenge = await dauer(mp3)
    const l = await lautheit(mp3)
    const stille = await laengsteStille(mp3, '-50dB', 1.5)
    return { master: await fs.readFile(master), mp3: await fs.readFile(mp3), laenge_s: laenge, lufs: l.lufs, true_peak: l.true_peak, laengste_stille_s: stille, kapitel }
  } finally { await fs.rm(tmp, { recursive: true, force: true }) }
}
