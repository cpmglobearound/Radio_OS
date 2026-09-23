import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { aktuelleSitzung, sitzungSetzen, ursprungOk } from '@/lib/konto/sitzung'
import { fehler, fehlerAntwort, koerper } from '@/lib/api'
import { passwortPruefen } from '@/lib/konto/passwort'
import { passwortSetzen } from '@/lib/konto/aktionen'

/** Passwort ändern: altes + neues; beendet alle anderen Sitzungen, diese bleibt angemeldet. */
export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    const s = await aktuelleSitzung()
    if (!s) return fehler(401, 'nicht_angemeldet', 'nicht_angemeldet')
    const d = await koerper(req, z.object({ alt: z.string().max(200), neu: z.string().max(200) }))
    const n = await prisma.nutzer.findUniqueOrThrow({ where: { id: s.nutzer.id } })
    if (!(await passwortPruefen(d.alt, n.passwort_hash))) return fehler(400, 'falsch', 'falsch')
    const neu = await passwortSetzen(n.id, d.neu)
    await sitzungSetzen(neu.id, neu.sitzung_version)
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}
