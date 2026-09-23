import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { anbieterFuer } from '@/lib/stimmen/anbieter'
import { ausgabespracheVon } from '@/lib/sprachen'
import { dauer, laengsteStille, stilleSchneiden } from './audio'
import { fehlendePflichtwoerter, hoeren, spracheErkannt, woerter, wortgenauigkeit, ziffernAusschreiben } from './hoeren'
import type { SprechAuftrag } from '@/lib/stimmen/anbieter/typ'

export interface ZeilenErgebnis { wav: Buffer; sek: number; gehoert: string; treue: number; versuche: number; warnung: string | null; kosten_usd: number }

/**
 * Eine Zeile sprechen, nachhören, prüfen — bis 4 Versuche (08 §1). Nach allen Versuchen: beste Fassung + Warnung.
 * Kosten der automatischen Wiederholungen trägt Klarframe (17 §2), sie werden nur intern erfasst.
 */
export async function zeileSprechen(a: Omit<SprechAuftrag, 'versuch' | 'stimme'> & { stimm_id: string; mindest_treue: number; pflichtwoerter: string[] }): Promise<ZeilenErgebnis> {
  const { anbieter, stimme } = anbieterFuer(a.stimm_id)
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'radio-zeile-'))
  const n = woerter(a.text).length
  const hoechst = n * 0.62 + 2.2, mindest = n * 0.22
  const ziel = ausgabespracheVon(a.sprache)?.basis ?? a.sprache.slice(0, 2)
  let bestes: (ZeilenErgebnis & { wertung: number }) | null = null
  let kosten = 0
  try {
    for (let v = 1; v <= 4; v++) {
      const roh = path.join(tmp, `roh-${v}.wav`), fertig = path.join(tmp, `z-${v}.wav`)
      const s = await anbieter.sprechen({ ...a, stimme, versuch: v })
      kosten += s.kosten_usd
      await fs.writeFile(roh, s.wav)
      await stilleSchneiden(roh, fertig)
      const sek = await dauer(fertig)
      const h = await hoeren(fertig, a.sprache, a.pflichtwoerter); kosten += sek / 60 * 0.006
      let treue = wortgenauigkeit(a.text, h.ohne_geraeusche)
      const zahlFehler: string[] = []
      if (/\d/.test(h.ohne_geraeusche)) {
        const z = await ziffernAusschreiben(h.ohne_geraeusche, a.sprache, a.text)
        h.ohne_geraeusche = z.text
        treue = wortgenauigkeit(a.text, h.ohne_geraeusche)
        // Jede gehörte Zahl muss genau so im Drehbuch stehen (08 §1.5: Zahlen exakt, egal wie hoch der Wert).
        const soll = ' ' + woerter(a.text).join(' ') + ' '
        for (const zahl of z.zahlen) if (!soll.includes(' ' + woerter(zahl).join(' ') + ' ')) zahlFehler.push(zahl)
      }
      const fehlt = fehlendePflichtwoerter(a.text, h.ohne_geraeusche, a.pflichtwoerter)
      const sprache = spracheErkannt(h.ohne_geraeusche, ziel)
      const luecke = sek > 3 ? await laengsteStille(fertig, '-45dB', 1.2) : 0
      const gruende: string[] = []
      if (treue < a.mindest_treue) gruende.push(`Wortgenauigkeit ${Math.round(treue * 100)} %`)
      if (fehlt.length) gruende.push(`nicht gehört: ${fehlt.join(', ')}`)
      if (zahlFehler.length) gruende.push(`Zahl anders gesprochen: ${zahlFehler.join(', ')}`)
      if (sek > hoechst) gruende.push(`zu lang (${sek.toFixed(1)} s, höchstens ${hoechst.toFixed(1)} s)`)
      if (sek < mindest) gruende.push(`zu kurz (${sek.toFixed(1)} s)`)
      if (sprache && sprache !== ziel) gruende.push(`falsche Sprache (${sprache})`)
      if (luecke >= 1.2) gruende.push(`Aussetzer ${luecke.toFixed(1)} s`)
      const wav = await fs.readFile(fertig)
      const wertung = treue - Math.max(0, sek - hoechst) * 0.05 - fehlt.length * 0.05 - (sprache && sprache !== ziel ? 1 : 0)
      const erg = { wav, sek, gehoert: h.text, treue, versuche: v, warnung: gruende.length ? gruende.join('; ') : null, kosten_usd: kosten, wertung }
      if (!bestes || wertung > bestes.wertung) bestes = erg
      if (!gruende.length) return { ...erg, kosten_usd: kosten }
    }
    return { ...bestes!, versuche: 4, kosten_usd: kosten, warnung: 'Keine Fassung bestand alle Prüfungen: ' + bestes!.warnung }
  } finally { await fs.rm(tmp, { recursive: true, force: true }) }
}
