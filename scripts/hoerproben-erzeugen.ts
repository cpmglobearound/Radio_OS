// Echte Hörprobe je Stimme × Sprache (07 §5) + automatische Prüfung (Wortgenauigkeit ≥ 97 %, Sprache stimmt, 07 §4.5).
// Aufruf: npx tsx scripts/hoerproben-erzeugen.ts [anbieter] [--neu]
// Ergebnis steht an der Stimme (sprachen[].auto_*). Anbietbar wird eine Stimme erst durch die Freigabe im Admin-Bereich —
// außer mit --auto-freigeben: dann gelten bestandene Sprachen als freigegeben (geprueft_von = "automatisch"), bis ein Mensch widerruft.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '@/lib/db'
import { anbieterFuer } from '@/lib/stimmen/anbieter'
import { PROBETEXTE } from '@/lib/stimmen/probetexte'
import { hoeren, spracheErkannt, wortgenauigkeit } from '@/lib/produktion/hoeren'
import { ff, stilleSchneiden } from '@/lib/produktion/audio'
import { speichern } from '@/lib/speicher'
import { ausgabespracheVon } from '@/lib/sprachen'
import type { StimmSprache } from '@/lib/stimmen/katalog'

const nurAnbieter = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null
const neu = process.argv.includes('--neu'), auto = process.argv.includes('--auto-freigeben')

async function eine(stimmeId: string, sprache: string) {
  const s = await prisma.stimme.findUniqueOrThrow({ where: { id: stimmeId } })
  const t = PROBETEXTE[sprache]
  const { anbieter, stimme } = anbieterFuer(s.id)
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'probe-'))
  try {
    let bestes = { treue: -1, sprache: null as string | null, mp3: Buffer.alloc(0), gehoert: '' }
    for (let v = 1; v <= 2 && bestes.treue < 0.97; v++) {
      const r = await anbieter.sprechen({ text: t.satz, sprache, stimme, name: s.name, persoenlichkeit: 'freundliche Radiostimme', regie: 'freundlich, natürlich, lächelnd', emotion: 'freudig', sendung: 'Klarframe Radio', kontext: [], versuch: v })
      await fs.writeFile(path.join(tmp, 'roh.wav'), r.wav)
      await stilleSchneiden(path.join(tmp, 'roh.wav'), path.join(tmp, 'z.wav'))
      const h = await hoeren(path.join(tmp, 'z.wav'), sprache, t.namen)
      const treue = wortgenauigkeit(t.satz, h.ohne_geraeusche)
      if (treue > bestes.treue) {
        await ff(['-loglevel', 'error', '-i', path.join(tmp, 'z.wav'), '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', path.join(tmp, 'p.mp3')])
        bestes = { treue, sprache: spracheErkannt(h.ohne_geraeusche, sprache.slice(0, 2)), mp3: await fs.readFile(path.join(tmp, 'p.mp3')), gehoert: h.text }
      }
    }
    const key = await speichern(`stimmen/${s.id.replace(':', '_')}/${sprache}.mp3`, bestes.mp3)
    const ziel = ausgabespracheVon(sprache)?.basis
    const bestanden = bestes.treue >= 0.97 && (!bestes.sprache || bestes.sprache === ziel)
    return { key, treue: bestes.treue, bestanden, gehoert: bestes.gehoert }
  } finally { await fs.rm(tmp, { recursive: true, force: true }) }
}

async function main() {
  const stimmen = await prisma.stimme.findMany({ where: nurAnbieter ? { anbieter_id: nurAnbieter } : {}, orderBy: [{ anbieter_id: 'asc' }, { sortierung: 'asc' }] })
  const auftraege = stimmen.flatMap(s => (s.sprachen as unknown as StimmSprache[]).filter(x => PROBETEXTE[x.code]).filter(x => neu || !(s.hoerprobe as Record<string, string>)[x.code]).map(x => ({ s, code: x.code })))
  console.log(`${auftraege.length} Hörproben zu erzeugen`)
  let i = 0, ok = 0
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (i < auftraege.length) {
      const { s, code } = auftraege[i++]
      try {
        const r = await eine(s.id, code)
        // Frisch lesen und nur das eigene Feld ändern (mehrere Sprachen derselben Stimme laufen parallel).
        await prisma.$transaction(async tx => {
          const akt = await tx.stimme.findUniqueOrThrow({ where: { id: s.id } })
          const sprachen = (akt.sprachen as unknown as (StimmSprache & Record<string, unknown>)[]).map(x => x.code !== code ? x : {
            ...x, auto_wortgenauigkeit: Math.round(r.treue * 1000) / 1000, auto_bestanden: r.bestanden, auto_gehoert: r.gehoert, auto_zeit: new Date().toISOString(),
            ...(auto && r.bestanden ? { geprueft: true, muttersprachlich: true, geprueft_von: 'automatisch' } : {}),
          })
          const sichtbar = akt.sichtbar || (auto && sprachen.some(x => x.geprueft))
          await tx.stimme.update({ where: { id: s.id }, data: { sprachen: sprachen as object[], hoerprobe: { ...(akt.hoerprobe as object), [code]: r.key }, ...(sichtbar && !akt.sichtbar ? { sichtbar: true, geprueft_am: new Date(), geprueft_von: 'automatisch (Einrichtung) — menschliche Bestätigung offen' } : {}) } })
        })
        if (r.bestanden) ok++
        console.log(`${s.id} ${code}: ${Math.round(r.treue * 100)} % ${r.bestanden ? 'OK' : 'NICHT bestanden'} — ${r.gehoert.slice(0, 90)}`)
      } catch (e) { console.log(`${s.id} ${code}: FEHLER ${(e as Error).message.slice(0, 160)}`) }
    }
  }))
  console.log(`Fertig: ${ok}/${auftraege.length} bestanden`)
  await prisma.$disconnect()
}
main()
