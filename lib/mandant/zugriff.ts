import { prisma } from '@/lib/db'
import { ApiFehler } from '@/lib/api'

// Mandantentrennung (04 §5): Zugriffe auf Mandantendaten NUR über diese Schicht. Fremde IDs → 404, nie 403 (nichts verraten).
export async function beitragVon(mandantId: string, id: string) {
  const b = await prisma.beitrag.findFirst({ where: { id, mandant_id: mandantId } })
  if (!b) throw new ApiFehler(404, 'nicht_gefunden', 'nicht_gefunden')
  return b
}
export const beitraegeVon = (mandantId: string, a: { status?: string; cursor?: string; anzahl?: number } = {}) =>
  prisma.beitrag.findMany({
    where: { mandant_id: mandantId, ...(a.status ? { status: a.status } : {}) }, orderBy: { erstellt_am: 'desc' }, take: (a.anzahl ?? 30) + 1,
    ...(a.cursor ? { cursor: { id: a.cursor }, skip: 1 } : {}),
    select: { id: true, titel: true, status: true, fortschritt: true, laenge_s: true, erstellt_am: true, fertig_am: true, ist_probe: true, einstellungen: true, fehler: true },
  })
