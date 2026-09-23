// Sprechtempo aller fertigen Beiträge in die Stimmen übernehmen (einmalig bzw. nach Änderungen an der Messung).
import { prisma } from '@/lib/db'
import { wortrateNachfuehren } from '@/lib/produktion/strecke'
import type { BeitragEinstellungen } from '@/lib/redaktion/typen'

async function main() {
  const bs = await prisma.beitrag.findMany({ where: { status: { in: ['fertig', 'fertig_mit_hinweisen'] } }, orderBy: { fertig_am: 'asc' } })
  for (const b of bs) await wortrateNachfuehren(b.einstellungen as unknown as BeitragEinstellungen, await prisma.zeile.findMany({ where: { beitrag_id: b.id } }))
  for (const s of await prisma.stimme.findMany({ where: { wortrate: { not: undefined } } })) if (s.wortrate) console.log(s.id, JSON.stringify(s.wortrate))
}
main().then(() => process.exit(0))
