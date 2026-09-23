// Beitragsliste aus GET /api/v1/beitraege — Typen und kleine Helfer, die Übersicht und Liste teilen.
import { api } from '@/components/gemeinsam/api'
import { fuellen, locale, mmss } from '@/components/gemeinsam/format'
import type { UiSprache } from '@/lib/sprachen'
import type { UebersichtTexte } from '@/lib/i18n/texte/uebersicht'

export interface BeitragKurz {
  id: string
  titel: string
  status: string
  fortschritt: { stufe?: string; prozent?: number; meldung?: string } | null
  laenge_s: number | null
  erstellt_am: string
  fertig_am: string | null
  ist_probe: boolean
  fehler: string | null
  format?: string
  sprache?: string
  sprecher: string[]
  ziel_laenge_s?: number
}

export interface BeitragSeite { beitraege: BeitragKurz[]; next_cursor: string | null }

/** Filter der Beitragsliste (?filter=…). */
export const FILTER = ['alle', 'arbeit', 'freigabe', 'fertig', 'fehler'] as const
export type FilterId = (typeof FILTER)[number]
export const istFilter = (x: unknown): x is FilterId => typeof x === 'string' && (FILTER as readonly string[]).includes(x)

/** Formatnamen (aus den Texten der Startseite), vom Server als Prop übergeben: formatId → Name. */
export type FormatNamen = Record<string, string>

export const beitragHref = (id: string) => `/portal/beitraege/${encodeURIComponent(id)}`
export const audioQuelle = (id: string) => `/api/v1/beitraege/${encodeURIComponent(id)}/audio`

export function seiteLaden(o: { status?: string; cursor?: string | null; signal?: AbortSignal } = {}) {
  const p = new URLSearchParams()
  if (o.status) p.set('status', o.status)
  if (o.cursor) p.set('cursor', o.cursor)
  const q = p.toString()
  return api<BeitragSeite>(`/api/v1/beitraege${q ? `?${q}` : ''}`, { signal: o.signal })
}

/** Länge: echte Länge „2:31 min", sonst Ziel „ca. 3 min", sonst leer. */
export function laengeText(b: BeitragKurz, u: UebersichtTexte, sprache: UiSprache) {
  if (b.laenge_s) return fuellen(u.beitrag.laenge, { zeit: mmss(b.laenge_s) })
  if (b.ziel_laenge_s) {
    const n = new Intl.NumberFormat(locale(sprache), { maximumFractionDigits: 1 }).format(b.ziel_laenge_s / 60)
    return fuellen(u.beitrag.zielLaenge, { n })
  }
  return ''
}

/** Prozent 0–100 (fehlende Angabe → kleiner Anfangswert, damit der Balken sichtbar ist). */
export const prozent = (b: BeitragKurz) => Math.min(100, Math.max(3, Math.round(b.fortschritt?.prozent ?? 3)))
