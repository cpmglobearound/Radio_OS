import type { UiSprache } from '@/lib/sprachen'

// Euro-Anzeige — ohne Datenbankzugriff, damit Server UND Browser dieselbe Formatierung nutzen.
const LOCALE: Record<UiSprache, string> = { de: 'de-DE', en: 'en-GB', es: 'es-ES' }
export function euro(betrag: number, sprache: UiSprache) {
  return new Intl.NumberFormat(LOCALE[sprache], { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(betrag) ? 0 : 2, maximumFractionDigits: 2 }).format(betrag)
}
