import { NextResponse } from 'next/server'
import { mitSitzung } from '@/lib/api'
import { minutenZaehler } from '@/lib/abrechnung/kontobuch'
import { prisma } from '@/lib/db'

/** Guthaben + Minutenzähler (neue Felder ergänzt, bestehende unverändert — Regel 9). */
export const GET = mitSitzung('hoeren', async ({ s }) => {
  const [z, buchungen] = await Promise.all([minutenZaehler(s.mandant!.id), prisma.buchung.findMany({ where: { mandant_id: s.mandant!.id }, orderBy: { zeit: 'desc' }, take: 50 })])
  return NextResponse.json({ ...z, warnen: z.gutschrift_sekunden > 0 && z.sekunden / z.gutschrift_sekunden < 0.2, bestellt: !!s.mandant!.bestellt_am, buchungen })
})
