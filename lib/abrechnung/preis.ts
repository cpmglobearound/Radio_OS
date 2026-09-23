import { prisma } from '@/lib/db'

export const TOLERANZ = 1.15

/** EINE Preisberechnung (17 §7). Oberfläche, API und Checkout rufen nur diese Funktion. */
export async function preisFuer(a: { laenge_min: number; stimmklasse_faktor: number; sprachfassungen?: number; nur_drehbuch?: boolean; mandant?: { sonderpreis_eur: number | null; bestellter_preis_eur: number | null } | null }) {
  const stufen = await prisma.einzelpreis.findMany({ where: { aktiv: true }, orderBy: { bis_minuten: 'asc' } })
  const begruendung: string[] = []
  const laenge = Math.max(0, a.laenge_min)
  let stufe = stufen.find(s => laenge <= s.bis_minuten)
  let preis: number | null = null
  if (stufe) { preis = stufe.preis_eur; begruendung.push(`stufe_bis_${stufe.bis_minuten}`) }
  else {
    stufe = stufen.at(-1)
    if (stufe && stufe.je_weitere_minute_eur != null && laenge <= 120) {
      preis = stufe.preis_eur + Math.ceil(laenge - stufe.bis_minuten) * stufe.je_weitere_minute_eur
      begruendung.push(`ueber_${stufe.bis_minuten}`)
    } else begruendung.push('auf_anfrage')
  }
  if (preis != null && a.stimmklasse_faktor > 1) { preis *= a.stimmklasse_faktor; begruendung.push('premium') }
  const fassungen = Math.max(1, a.sprachfassungen ?? 1)
  if (preis != null && fassungen > 1) { preis = preis + (fassungen - 1) * preis * 0.75; begruendung.push('sprachfassungen') }
  if (preis != null && a.nur_drehbuch) { preis *= 0.3; begruendung.push('nur_drehbuch') }
  // Sonderpreis: auf null prüfen, nicht auf Wahrheit — 0 € ist gültig (Lehre Voice OS).
  if (a.mandant?.sonderpreis_eur != null) { preis = a.mandant.sonderpreis_eur; begruendung.push('sonderpreis') }
  const reservierte_sekunden = a.nur_drehbuch ? 0 : Math.ceil(laenge * 60 * TOLERANZ * a.stimmklasse_faktor) * fassungen
  return { stufe: stufe?.bis_minuten ?? null, preis_eur: preis == null ? null : Math.round(preis * 100) / 100, reservierte_sekunden, begruendung }
}
