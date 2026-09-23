import { prisma } from '@/lib/db'
import { ApiFehler } from '@/lib/api'
import { sendeMail } from '@/lib/mail'
import { protokoll } from '@/lib/protokoll'
import { euro } from './katalog'
import { alsUiSprache } from '@/lib/i18n'
import type { UiSprache } from '@/lib/sprachen'
import type { Sitzung } from '@/lib/konto/sitzung'

// Bestellung per E-Mail (Entscheidung Oliver 23.09.2026: kein Online-Bezahlen). Kunde bestellt → Mail an Klarframe →
// Rechnung/Zahlung außerhalb → Klarframe schaltet frei → Minuten ins Kontobuch, Download/Auslieferung offen.
export type Art = 'abo' | 'nachkauf' | 'einzel'

const T: Record<UiSprache, Record<string, string>> = {
  de: { abo: 'Abo {name} · {min} Minuten im Monat', nachkauf: 'Nachkauf {min} Minuten', einzel: 'Einzelbeitrag bis {min} Minuten',
    kBetreff: 'Ihre Bestellung bei Klarframe Radio', kTitel: 'Danke für Ihre Bestellung', kText: 'Wir haben Ihre Bestellung erhalten: {produkt} für {preis} (netto, zzgl. MwSt.). Sie bekommen von uns die Rechnung per E-Mail. Sobald die Zahlung da ist, schalten wir die Minuten frei — Sie bekommen dann eine kurze Nachricht.',
    fBetreff: 'Ihre Minuten sind freigeschaltet', fTitel: 'Freigeschaltet', fText: '{produkt} ist freigeschaltet. Ihnen stehen jetzt {min} Minuten zur Verfügung. Herunterladen und Ausliefern sind offen.', knopf: 'Zum Portal' },
  en: { abo: '{name} subscription · {min} minutes a month', nachkauf: 'Top-up {min} minutes', einzel: 'Single piece up to {min} minutes',
    kBetreff: 'Your order with Klarframe Radio', kTitel: 'Thank you for your order', kText: 'We’ve received your order: {produkt} for {preis} (net, plus VAT). We’ll email you the invoice. As soon as payment arrives we’ll unlock your minutes and let you know.',
    fBetreff: 'Your minutes are unlocked', fTitel: 'Unlocked', fText: '{produkt} is now active. You have {min} minutes available. Downloads and delivery are unlocked.', knopf: 'Go to portal' },
  es: { abo: 'Suscripción {name} · {min} minutos al mes', nachkauf: 'Recarga de {min} minutos', einzel: 'Pieza suelta de hasta {min} minutos',
    kBetreff: 'Tu pedido en Klarframe Radio', kTitel: 'Gracias por tu pedido', kText: 'Hemos recibido tu pedido: {produkt} por {preis} (neto, más IVA). Te enviaremos la factura por correo. En cuanto recibamos el pago, activaremos tus minutos y te avisaremos.',
    fBetreff: 'Tus minutos ya están activos', fTitel: 'Activado', fText: '{produkt} ya está activo. Tienes {min} minutos disponibles. La descarga y el envío están desbloqueados.', knopf: 'Ir al portal' },
}
const f = (s: string, w: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => w[k] ?? '')

/** Was bestellbar ist — direkt aus dem Katalog. */
export async function produkt(art: Art, id: string) {
  if (art === 'abo') { const t = await prisma.tarif.findFirst({ where: { id, aktiv: true } }); return t && { minuten: t.minuten_inkl, preis: t.preis_eur, name: t.name } }
  if (art === 'nachkauf') { const n = await prisma.nachkaufpaket.findFirst({ where: { id, aktiv: true } }); return n && { minuten: n.minuten, preis: n.preis_eur, name: '' } }
  const e = await prisma.einzelpreis.findFirst({ where: { id, aktiv: true } }); return e && { minuten: e.bis_minuten, preis: e.preis_eur, name: '' }
}

export async function bestellen(s: Sitzung, art: Art, produktId: string, notiz?: string) {
  const m = s.mandant!
  const p = await produkt(art, produktId)
  if (!p) throw new ApiFehler(404, 'nicht_gefunden', 'nicht_gefunden')
  const sprache = alsUiSprache(s.nutzer.sprache) ?? 'de'
  // Sonderpreis gilt als Obergrenze wie im Katalog; der bestellte Preis wird eingefroren (Regel 5).
  const preis = m.sonderpreis_eur != null && art === 'abo' ? Math.min(m.sonderpreis_eur, p.preis) : p.preis
  const bezeichnung = f(T.de[art], { name: p.name, min: String(p.minuten) })
  const b = await prisma.bestellung.create({ data: { mandant_id: m.id, nutzer_id: s.nutzer.id, art, produkt_id: produktId, bezeichnung, minuten: p.minuten, preis_eur: preis, notiz: notiz?.slice(0, 1000) || null } })
  await protokoll({ mandant_id: m.id, nutzer_id: s.nutzer.id, aktion: 'bestellung.aufgegeben', ziel_typ: 'bestellung', ziel_id: b.id, daten: { art, produktId, preis } })
  const tk = T[sprache], produktText = f(tk[art], { name: p.name, min: String(p.minuten) })
  const app = process.env.APP_URL || 'https://radio.klarframe.com'
  await Promise.allSettled([
    process.env.ADMIN_EMAIL && sendeMail(process.env.ADMIN_EMAIL, `Neue Bestellung: ${bezeichnung} — ${m.name}`, 'Neue Bestellung', [
      `<b>${bezeichnung}</b> für <b>${euro(preis, 'de')}</b> netto`,
      `Firma/Sender: ${m.name} (${m.art}, ${m.land ?? '—'})`, `Besteller: ${s.nutzer.name} &lt;${s.nutzer.email}&gt;`,
      m.rechnungs_name ? `Rechnungsname: ${m.rechnungs_name}` : '', m.ust_id ? `USt-ID: ${m.ust_id}` : '',
      notiz ? `Hinweis des Kunden: ${notiz.replace(/</g, '&lt;')}` : '', 'Nach Zahlungseingang im Admin-Bereich freischalten.',
    ].filter(Boolean), { text: 'Bestellungen öffnen', url: `${app}/portal/admin/bestellungen` }),
    sendeMail(s.nutzer.email, tk.kBetreff, tk.kTitel, [f(tk.kText, { produkt: produktText, preis: euro(preis, sprache) })], { text: tk.knopf, url: `${app}/portal/guthaben` }),
  ])
  return b
}

function monatsende(plus = 0) { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1 + plus, 0, 23, 59, 59)) }

/** Klarframe schaltet frei (nach Zahlung): Gutschrift ins Kontobuch, Mandant gilt als bestellt. Idempotent über den Status. */
export async function freischalten(id: string, admin: { id: string; email: string }) {
  const b = await prisma.$transaction(async tx => {
    const b = await tx.bestellung.findUniqueOrThrow({ where: { id } })
    if (b.status !== 'offen') throw new ApiFehler(409, 'status', 'status')
    const art = b.art === 'abo' ? 'monat_gutschrift' : b.art === 'nachkauf' ? 'nachkauf' : 'einzelkauf'
    await tx.buchung.create({ data: { mandant_id: b.mandant_id, art, sekunden: b.minuten * 60, gueltig_bis: b.art === 'abo' ? monatsende() : b.art === 'nachkauf' ? monatsende(1) : null, notiz: `Bestellung ${b.bezeichnung}`, stripe_ref: `bestellung:${b.id}` } })
    const m = await tx.mandant.findUniqueOrThrow({ where: { id: b.mandant_id } })
    await tx.mandant.update({ where: { id: b.mandant_id }, data: {
      bestellt_am: m.bestellt_am ?? new Date(),
      ...(b.art === 'abo' ? { tarif_id: b.produkt_id, bestellter_preis_eur: m.bestellter_preis_eur == null ? b.preis_eur : Math.min(m.bestellter_preis_eur, b.preis_eur) } : {}),
    } })
    return tx.bestellung.update({ where: { id }, data: { status: 'freigeschaltet', erledigt_am: new Date(), erledigt_von: admin.email } })
  })
  await protokoll({ mandant_id: b.mandant_id, nutzer_id: admin.id, aktion: 'admin.bestellung_freigeschaltet', ziel_typ: 'bestellung', ziel_id: b.id })
  const n = await prisma.nutzer.findUnique({ where: { id: b.nutzer_id } })
  if (n && !n.geloescht_am) {
    const sp = alsUiSprache(n.sprache) ?? 'de', tk = T[sp]
    const p = await produkt(b.art as Art, b.produkt_id)
    await sendeMail(n.email, tk.fBetreff, tk.fTitel, [f(tk.fText, { produkt: f(tk[b.art], { name: p?.name ?? '', min: String(b.minuten) }), min: String(b.minuten) })], { text: tk.knopf, url: `${process.env.APP_URL}/portal` }).catch(console.error)
  }
  return b
}

/** Abo für den nächsten Monat verlängern (nach Zahlung): neue, sofort freigeschaltete Bestellung mit gleichem Produkt und Preis. */
export async function verlaengern(id: string, admin: { id: string; email: string }) {
  const alt = await prisma.bestellung.findUniqueOrThrow({ where: { id } })
  if (alt.art !== 'abo' || alt.status !== 'freigeschaltet') throw new ApiFehler(409, 'status', 'status')
  const neu = await prisma.bestellung.create({ data: { mandant_id: alt.mandant_id, nutzer_id: alt.nutzer_id, art: 'abo', produkt_id: alt.produkt_id, bezeichnung: alt.bezeichnung, minuten: alt.minuten, preis_eur: alt.preis_eur, notiz: 'Verlängerung' } })
  return freischalten(neu.id, admin)
}

export async function stornieren(id: string, admin: { id: string; email: string }) {
  const r = await prisma.bestellung.updateMany({ where: { id, status: 'offen' }, data: { status: 'storniert', erledigt_am: new Date(), erledigt_von: admin.email } })
  if (!r.count) throw new ApiFehler(409, 'status', 'status')
  await protokoll({ nutzer_id: admin.id, aktion: 'admin.bestellung_storniert', ziel_typ: 'bestellung', ziel_id: id })
}
