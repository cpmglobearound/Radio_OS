import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { signieren, pruefeSignatur } from '@/lib/krypto'

export const SITZUNG_COOKIE = 'radio_session'
export const MANDANT_COOKIE = 'radio_mandant'
const DAUER_S = 60 * 60 * 24 * 30   // 30 Tage gleitend (04 §2)

export type Rolle = 'inhaber' | 'admin' | 'redaktion' | 'hoeren'
const RANG: Record<Rolle, number> = { hoeren: 1, redaktion: 2, admin: 3, inhaber: 4 }
export const darf = (rolle: Rolle, mindestens: Rolle) => RANG[rolle] >= RANG[mindestens]

export function sitzungWert(nutzerId: string, version: number) {
  return signieren(`${nutzerId}|${version}|${Math.floor(Date.now() / 1000) + DAUER_S}`)
}
export const cookieOptionen = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: DAUER_S }

export async function sitzungSetzen(nutzerId: string, version: number) {
  (await cookies()).set(SITZUNG_COOKIE, sitzungWert(nutzerId, version), cookieOptionen)
}
export async function sitzungLoeschen() {
  const c = await cookies(); c.delete(SITZUNG_COOKIE); c.delete(MANDANT_COOKIE)
}

/** Aktuelle Sitzung inkl. gewähltem Mandanten. Prüft sitzung_version gegen die DB (Überall-abmelden wirkt sofort). */
export async function aktuelleSitzung() {
  const c = await cookies()
  const roh = c.get(SITZUNG_COOKIE)?.value
  const wert = roh ? pruefeSignatur(roh) : null
  if (!wert) return null
  const [nutzerId, version, ablauf] = wert.split('|')
  if (Number(ablauf) < Date.now() / 1000) return null
  const nutzer = await prisma.nutzer.findUnique({
    where: { id: nutzerId },
    include: { mitgliedschaften: { include: { mandant: true }, orderBy: { erstellt_am: 'asc' } } },
  })
  if (!nutzer || nutzer.geloescht_am || nutzer.sitzung_version !== Number(version)) return null
  const aktiv = nutzer.mitgliedschaften.filter(m => !m.mandant.geloescht_am)
  const gewaehlt = c.get(MANDANT_COOKIE)?.value
  const mitgliedschaft = aktiv.find(m => m.mandant_id === gewaehlt) ?? aktiv[0] ?? null
  return {
    nutzer: { id: nutzer.id, email: nutzer.email, name: nutzer.name, sprache: nutzer.sprache, bestaetigt: !!nutzer.email_bestaetigt_am, ist_admin: nutzer.ist_klarframe_admin },
    mandant: mitgliedschaft?.mandant ?? null,
    rolle: (mitgliedschaft?.rolle ?? 'hoeren') as Rolle,
    mandanten: aktiv.map(m => ({ id: m.mandant_id, name: m.mandant.name, rolle: m.rolle })),
  }
}
export type Sitzung = NonNullable<Awaited<ReturnType<typeof aktuelleSitzung>>>

/** CSRF (04 §7): ändernde Anfragen nur vom eigenen Ursprung. */
export async function ursprungOk() {
  const h = await headers()
  const origin = h.get('origin')
  if (!origin) return true   // gleiche Seite ohne Origin (z. B. Navigation); SameSite=Lax schützt zusätzlich
  const erlaubt = new URL(process.env.APP_URL || 'https://radio.klarframe.com').origin
  return origin === erlaubt || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost'))
}

export async function ipHash() {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || '0'
  const teile = ip.includes(':') ? ip.split(':').slice(0, 4).join(':') : ip.split('.').slice(0, 3).join('.')  // gekürzt (14 §5)
  const { hash } = await import('@/lib/krypto')
  return hash(teile + (process.env.SITZUNG_GEHEIMNIS || '')).slice(0, 16)
}
