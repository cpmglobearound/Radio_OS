import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { aktuelleSitzung, ursprungOk, MANDANT_COOKIE } from '@/lib/konto/sitzung'
import { fehler, fehlerAntwort, koerper } from '@/lib/api'
import { guthaben } from '@/lib/abrechnung/kontobuch'
import { cookies } from 'next/headers'

/** Profil + gewählter Mandant + Guthaben (Kopfzeile des Portals). */
export async function GET() {
  const s = await aktuelleSitzung()
  if (!s) return fehler(401, 'nicht_angemeldet', 'nicht_angemeldet')
  return NextResponse.json({ nutzer: s.nutzer, mandant: s.mandant && { id: s.mandant.id, name: s.mandant.name, art: s.mandant.art, land: s.mandant.land, zeitzone: s.mandant.zeitzone, bestellt: !!s.mandant.bestellt_am }, rolle: s.rolle, mandanten: s.mandanten, guthaben_s: s.mandant ? await guthaben(s.mandant.id) : 0 })
}

/** Name, Sprache der Oberfläche, Mandant wechseln. */
export async function PATCH(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    const s = await aktuelleSitzung()
    if (!s) return fehler(401, 'nicht_angemeldet', 'nicht_angemeldet')
    const d = await koerper(req, z.object({ name: z.string().trim().min(2).max(80).optional(), sprache: z.enum(['de', 'en', 'es']).optional(), mandant_id: z.string().optional() }))
    if (d.name || d.sprache) await prisma.nutzer.update({ where: { id: s.nutzer.id }, data: { ...(d.name ? { name: d.name } : {}), ...(d.sprache ? { sprache: d.sprache } : {}) } })
    const res = NextResponse.json({ ok: true })
    if (d.sprache) res.cookies.set('radio_sprache', d.sprache, { path: '/', maxAge: 31536000, sameSite: 'lax' })
    if (d.mandant_id && s.mandanten.some(m => m.id === d.mandant_id)) (await cookies()).set(MANDANT_COOKIE, d.mandant_id, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
    return res
  } catch (e) { return fehlerAntwort(e) }
}
