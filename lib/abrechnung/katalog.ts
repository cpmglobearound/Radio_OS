import { prisma } from '@/lib/db'
import type { UiSprache } from '@/lib/sprachen'

// Preise stehen im Katalog (Datenbank), nie im Code (17). Alle Anzeigen lesen hier.
export async function preisKatalog() {
  const [einzel, tarife, nachkauf, probe] = await Promise.all([
    prisma.einzelpreis.findMany({ where: { aktiv: true }, orderBy: { bis_minuten: 'asc' } }),
    prisma.tarif.findMany({ where: { aktiv: true }, orderBy: { preis_eur: 'asc' } }),
    prisma.nachkaufpaket.findMany({ where: { aktiv: true }, orderBy: { minuten: 'asc' } }),
    prisma.einstellung.findUnique({ where: { schluessel: 'probe_sekunden' } }),
  ])
  return { einzel, tarife, nachkauf, probe_minuten: Math.round(Number(probe?.wert ?? 600) / 60) }
}
export type PreisKatalog = Awaited<ReturnType<typeof preisKatalog>>

export { euro } from './format'
import { euro } from './format'

/** Werte für Platzhalter in Texten: {einzel} {einzel_min} {abo} {abo_min} {probe_min} {max_min}. */
export function preisPlatzhalter(k: PreisKatalog, sprache: UiSprache): Record<string, string> {
  const e0 = k.einzel[0], t0 = k.tarife[0]
  return {
    einzel: e0 ? euro(e0.preis_eur, sprache) : '—', einzel_min: String(e0?.bis_minuten ?? ''),
    abo: t0 ? euro(t0.preis_eur, sprache) : '—', abo_min: String(t0?.minuten_inkl ?? ''),
    probe_min: String(k.probe_minuten), max_min: String(k.einzel.at(-1)?.bis_minuten ?? 60),
  }
}
/** Platzhalter in einem ganzen Textobjekt ersetzen. */
export function mitPreisen<T>(texte: T, werte: Record<string, string>): T {
  return JSON.parse(JSON.stringify(texte).replace(/\{(einzel|einzel_min|abo|abo_min|probe_min|max_min)\}/g, (_, k: string) => werte[k] ?? ''))
}
