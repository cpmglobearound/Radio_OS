// Bausteine für Bestellungen (Kunde und Admin): Datenform, Preisanzeige, Paketname in der Sprache der Oberfläche, Status-Chip.
import type { UiSprache } from '@/lib/sprachen'
import type { BestellTexte } from '@/lib/i18n/texte/bestellung'
import { fuellen, locale } from '@/components/gemeinsam/format'

export type BestellArt = 'abo' | 'nachkauf' | 'einzel'
export type BestellStatus = 'offen' | 'freigeschaltet' | 'storniert'

export interface Bestellung {
  id: string; art: BestellArt; produkt_id: string; bezeichnung: string; minuten: number; preis_eur: number
  notiz: string | null; status: BestellStatus; erstellt_am: string; erledigt_am: string | null
}

/**
 * Euro-Betrag wie `euro()` aus lib/abrechnung/katalog.ts (ganze Beträge ohne Nachkommastellen).
 * Dort nicht importierbar, weil die Datei die Datenbank lädt (serverseitig).
 */
export { euro } from '@/lib/abrechnung/format'
import { euro } from '@/lib/abrechnung/format'

/** Preis je Minute, auf Cent gerundet. */
export function jeMinute(preis: number, minuten: number, sprache: UiSprache) {
  return minuten > 0 ? euro(Math.round((preis / minuten) * 100) / 100, sprache) : '—'
}

/** Paketname in der Sprache der Oberfläche (die gespeicherte Bezeichnung ist immer Deutsch). */
export function paketName(b: { art: BestellArt; minuten: number }, t: BestellTexte, aboName?: string) {
  if (b.art === 'abo') return aboName ? fuellen(t.produkt.abo, { name: aboName, min: b.minuten }) : fuellen(t.abo.minuten, { min: b.minuten })
  return fuellen(t.produkt[b.art], { min: b.minuten })
}

const CHIP: Record<BestellStatus, string> = {
  offen: 'border-gelb/30 bg-gelb-hell text-[#8a4b05]',
  freigeschaltet: 'border-gruen/30 bg-gruen-hell text-[#0a6e5f]',
  storniert: 'border-linie-2 bg-grund-2 text-leise',
}

export function BestellChip({ status, t }: { status: BestellStatus; t: BestellTexte }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${CHIP[status] ?? CHIP.storniert}`}>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-current" />
      <span className="min-w-0 break-words">{t.status[status] ?? status}</span>
    </span>
  )
}

/** Fehlercode → Satz: erst die Bestell-eigenen Sätze, dann die allgemeinen. */
export function bestellFehler(code: string, t: BestellTexte, allgemein: Record<string, string>) {
  return t.fehler[code] ?? allgemein[code] ?? allgemein.unbekannt
}
