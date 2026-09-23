import { prisma } from '@/lib/db'
import { hash, zufall } from '@/lib/krypto'

export type Zweck = 'email_bestaetigen' | 'passwort' | 'anmelden' | 'konto_loeschen' | 'email_aendern'
const DAUER_MIN: Record<Zweck, number> = { email_bestaetigen: 24 * 60, passwort: 60, anmelden: 15, konto_loeschen: 14 * 24 * 60, email_aendern: 24 * 60 }

/** Einmal-Token: nur der Hash wird gespeichert (04 §7). */
export async function tokenErzeugen(nutzerId: string, zweck: Zweck, daten?: object) {
  const token = zufall(32)
  await prisma.einmalToken.create({ data: { nutzer_id: nutzerId, zweck, token_hash: hash(token), daten: daten ?? undefined, gueltig_bis: new Date(Date.now() + DAUER_MIN[zweck] * 60_000) } })
  return token
}

/** Einlösen: atomar, genau einmal. */
export async function tokenEinloesen(token: string, zweck: Zweck) {
  const t = await prisma.einmalToken.findUnique({ where: { token_hash: hash(token || '') } })
  if (!t || t.zweck !== zweck || t.benutzt_am || t.gueltig_bis < new Date()) return null
  const r = await prisma.einmalToken.updateMany({ where: { id: t.id, benutzt_am: null }, data: { benutzt_am: new Date() } })
  return r.count === 1 ? t : null
}
