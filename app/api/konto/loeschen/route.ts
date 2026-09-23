import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { aktuelleSitzung, sitzungLoeschen, ursprungOk } from '@/lib/konto/sitzung'
import { fehler, fehlerAntwort, koerper } from '@/lib/api'
import { passwortPruefen } from '@/lib/konto/passwort'
import { protokoll } from '@/lib/protokoll'

/**
 * Konto löschen (04 §6): sofort gesperrt + abgemeldet (geloescht_am), endgültige Löschung nach 14 Tagen durch den nächtlichen Lauf.
 * Einziger Inhaber eines Mandanten mit weiteren Mitgliedern: erst übertragen oder Mandant mitlöschen.
 */
export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    const s = await aktuelleSitzung()
    if (!s) return fehler(401, 'nicht_angemeldet', 'nicht_angemeldet')
    const d = await koerper(req, z.object({ passwort: z.string().max(200), mandant_mitloeschen: z.boolean().default(false) }))
    const n = await prisma.nutzer.findUniqueOrThrow({ where: { id: s.nutzer.id }, include: { mitgliedschaften: true } })
    if (!(await passwortPruefen(d.passwort, n.passwort_hash))) return fehler(400, 'falsch', 'falsch')
    for (const m of n.mitgliedschaften.filter(x => x.rolle === 'inhaber')) {
      const andere = await prisma.mitgliedschaft.count({ where: { mandant_id: m.mandant_id, nutzer_id: { not: n.id } } })
      if (andere > 0 && !d.mandant_mitloeschen) return fehler(409, 'inhaber_uebertragen', 'inhaber_uebertragen')
      await prisma.mandant.update({ where: { id: m.mandant_id }, data: { geloescht_am: new Date() } })
    }
    await prisma.nutzer.update({ where: { id: n.id }, data: { geloescht_am: new Date(), sitzung_version: { increment: 1 } } })
    await protokoll({ nutzer_id: n.id, aktion: 'konto.geloescht' })
    await sitzungLoeschen()
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}
