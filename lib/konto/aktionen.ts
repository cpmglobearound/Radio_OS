import { prisma } from '@/lib/db'
import { sendeMail } from '@/lib/mail'
import mailTexte, { fuellen } from '@/lib/i18n/texte/mail'
import type { UiSprache } from '@/lib/sprachen'
import { passwortHash, passwortPruefen, passwortProblem } from './passwort'
import { tokenEinloesen, tokenErzeugen } from './token'
import { protokoll } from '@/lib/protokoll'
import { ApiFehler } from '@/lib/api'

const APP = () => process.env.APP_URL || 'https://radio.klarframe.com'
// Standard-Zeitzone je Land (Rückfall Europe/Berlin); Oberfläche lässt ändern.
const ZEITZONE: Record<string, string> = { ES: 'Europe/Madrid', DE: 'Europe/Berlin', AT: 'Europe/Vienna', CH: 'Europe/Zurich', GB: 'Europe/London', IE: 'Europe/Dublin', FR: 'Europe/Paris', IT: 'Europe/Rome', PT: 'Europe/Lisbon', NL: 'Europe/Amsterdam', US: 'America/New_York', MX: 'America/Mexico_City', AR: 'America/Argentina/Buenos_Aires' }
const WEGWERF = new Set(['mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'trashmail.com', 'yopmail.com', 'sharklasers.com', 'getnada.com', 'temp-mail.org', 'dispostable.com'])

export async function registrieren(a: { name: string; email: string; passwort: string; firma: string; art: string; land: string; sprache: UiSprache; werbung: boolean; agb_version: string; ip_hash: string }) {
  const email = a.email.trim().toLowerCase()
  if (WEGWERF.has(email.split('@')[1] ?? '')) throw new ApiFehler(400, 'wegwerf_email', 'wegwerf_email')
  const problem = passwortProblem(a.passwort)
  if (problem) throw new ApiFehler(400, problem, problem)
  const t = mailTexte[a.sprache]
  const vorhanden = await prisma.nutzer.findUnique({ where: { email } })
  if (vorhanden) {
    // Keine Aufzählung von Konten (04 §7): gleiche Antwort, Hinweis-Mail an die Adresse.
    await sendeMail(email, t.vorhanden_betreff, t.vorhanden_betreff, [t.vorhanden_text], { text: t.anmelden_knopf, url: `${APP()}/anmelden` }).catch(console.error)
    return
  }
  const probe = await prisma.einstellung.findUnique({ where: { schluessel: 'probe_sekunden' } })
  const nutzer = await prisma.$transaction(async tx => {
    const n = await tx.nutzer.create({ data: { email, name: a.name.trim(), passwort_hash: await passwortHash(a.passwort), sprache: a.sprache } })
    const m = await tx.mandant.create({ data: { name: a.firma.trim(), art: a.art, land: a.land, zeitzone: ZEITZONE[a.land] ?? 'Europe/Berlin', sprache_oberflaeche: a.sprache } })
    await tx.mitgliedschaft.create({ data: { mandant_id: m.id, nutzer_id: n.id, rolle: 'inhaber' } })
    await tx.buchung.create({ data: { mandant_id: m.id, art: 'probe', sekunden: Number(probe?.wert ?? 600), notiz: 'Probeminuten nach Registrierung' } })
    await tx.protokoll.create({ data: { mandant_id: m.id, nutzer_id: n.id, aktion: 'konto.registriert', daten: { agb_version: a.agb_version, agb_zeit: new Date().toISOString(), werbung: a.werbung }, ip_hash: a.ip_hash } })
    return n
  })
  await bestaetigungSenden(nutzer.id)
  // Benachrichtigung an Klarframe (04 §1.4)
  if (process.env.ADMIN_EMAIL) sendeMail(process.env.ADMIN_EMAIL, `Neue Registrierung: ${a.firma}`, 'Neue Registrierung', [`Name: ${a.name}`, `Firma/Sender: ${a.firma} (${a.art})`, `Land: ${a.land}`, `E-Mail: ${email}`]).catch(console.error)
  return nutzer
}

export async function bestaetigungSenden(nutzerId: string) {
  const n = await prisma.nutzer.findUniqueOrThrow({ where: { id: nutzerId } })
  if (n.email_bestaetigt_am) return
  const t = mailTexte[(n.sprache as UiSprache) ?? 'de'] ?? mailTexte.de
  const token = await tokenErzeugen(n.id, 'email_bestaetigen')
  await sendeMail(n.email, t.bestaetigen_betreff, t.bestaetigen_titel, [t.bestaetigen_text, t.gueltig_24h], { text: t.bestaetigen_knopf, url: `${APP()}/email-bestaetigen?token=${token}` })
}

export async function emailBestaetigen(token: string) {
  const t = await tokenEinloesen(token, 'email_bestaetigen')
  if (!t) return null
  const n = await prisma.nutzer.update({ where: { id: t.nutzer_id }, data: { email_bestaetigt_am: new Date() } })
  await protokoll({ nutzer_id: n.id, aktion: 'konto.email_bestaetigt' })
  return n
}

/** Anmeldung (04 §2): gleiche Meldung bei allen Fehlern, 5 Fehlversuche → 15 min Sperre. */
export async function anmelden(emailRoh: string, passwort: string, ip_hash: string) {
  const email = emailRoh.trim().toLowerCase()
  const n = await prisma.nutzer.findUnique({ where: { email } })
  if (!n || n.geloescht_am) { await passwortPruefen(passwort, '$2a$12$0000000000000000000000000000000000000000000000000000'); return null }
  if (n.gesperrt_bis && n.gesperrt_bis > new Date()) return 'gesperrt' as const
  if (!(await passwortPruefen(passwort, n.passwort_hash))) {
    const f = n.fehlversuche + 1
    await prisma.nutzer.update({ where: { id: n.id }, data: { fehlversuche: f >= 5 ? 0 : f, gesperrt_bis: f >= 5 ? new Date(Date.now() + 15 * 60_000) : null } })
    await protokoll({ nutzer_id: n.id, aktion: 'konto.anmeldung_fehlgeschlagen', ip_hash })
    return null
  }
  await prisma.nutzer.update({ where: { id: n.id }, data: { fehlversuche: 0, gesperrt_bis: null, letzte_anmeldung: new Date() } })
  await protokoll({ nutzer_id: n.id, aktion: 'konto.angemeldet', ip_hash })
  return n
}

export async function anmeldelinkSenden(emailRoh: string, sprache: UiSprache) {
  const n = await prisma.nutzer.findUnique({ where: { email: emailRoh.trim().toLowerCase() } })
  if (!n || n.geloescht_am) return
  const t = mailTexte[(n.sprache as UiSprache) ?? sprache] ?? mailTexte[sprache]
  const token = await tokenErzeugen(n.id, 'anmelden')
  await sendeMail(n.email, t.link_betreff, t.link_titel, [t.link_text, t.nicht_angefordert], { text: t.anmelden_knopf, url: `${APP()}/api/auth/anmeldelink?token=${token}` })
}

export async function anmeldelinkEinloesen(token: string) {
  const t = await tokenEinloesen(token, 'anmelden')
  if (!t) return null
  // Magic-Link belegt den Besitz der Adresse → gilt auch als Bestätigung.
  return prisma.nutzer.update({ where: { id: t.nutzer_id }, data: { letzte_anmeldung: new Date(), email_bestaetigt_am: new Date(), fehlversuche: 0, gesperrt_bis: null } })
}

export async function passwortVergessen(emailRoh: string, sprache: UiSprache) {
  const n = await prisma.nutzer.findUnique({ where: { email: emailRoh.trim().toLowerCase() } })
  if (!n || n.geloescht_am) return
  const t = mailTexte[(n.sprache as UiSprache) ?? sprache] ?? mailTexte[sprache]
  const token = await tokenErzeugen(n.id, 'passwort')
  await sendeMail(n.email, t.passwort_betreff, t.passwort_titel, [t.passwort_text, t.nicht_angefordert], { text: t.passwort_knopf, url: `${APP()}/passwort-neu?token=${token}` })
}

/** Neues Passwort: beendet alle Sitzungen (sitzung_version++), Hinweis-Mail. */
export async function passwortSetzen(nutzerId: string, neu: string) {
  const problem = passwortProblem(neu)
  if (problem) throw new ApiFehler(400, problem, problem)
  const n = await prisma.nutzer.update({ where: { id: nutzerId }, data: { passwort_hash: await passwortHash(neu), sitzung_version: { increment: 1 }, fehlversuche: 0, gesperrt_bis: null } })
  const t = mailTexte[(n.sprache as UiSprache) ?? 'de'] ?? mailTexte.de
  await sendeMail(n.email, t.passwort_geaendert_betreff, t.passwort_geaendert_betreff, [t.passwort_geaendert_text], { text: t.anmelden_knopf, url: `${APP()}/passwort-vergessen` }).catch(console.error)
  await protokoll({ nutzer_id: n.id, aktion: 'konto.passwort_geaendert' })
  return n
}
export async function passwortNeuMitToken(token: string, neu: string) {
  const problem = passwortProblem(neu)
  if (problem) throw new ApiFehler(400, problem, problem)
  const t = await tokenEinloesen(token, 'passwort')
  if (!t) throw new ApiFehler(400, 'token_ungueltig', 'token_ungueltig')
  return passwortSetzen(t.nutzer_id, neu)
}
export { fuellen }
