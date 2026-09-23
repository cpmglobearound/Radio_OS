// Kleine Anzeige-Helfer (ohne Fachwörter, in der Sprache der Oberfläche).
import type { UiSprache } from '@/lib/sprachen'

/** Sekunden → „m:ss" (ohne Vorzeichen). */
export function mmss(s: number | null | undefined) {
  const v = Math.max(0, Math.round(Math.abs(s ?? 0)))
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`
}

/** Sekunden → „+m:ss" / „−m:ss". */
export function mmssVorzeichen(s: number) {
  return `${s < 0 ? '−' : '+'}${mmss(s)}`
}

/** Platzhalter {name} füllen. */
export function fuellen(text: string, werte: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => (k in werte ? String(werte[k]) : `{${k}}`))
}

const LOCALE: Record<UiSprache, string> = { de: 'de-DE', en: 'en-GB', es: 'es-ES' }
export const locale = (s: UiSprache) => LOCALE[s]

export function datumZeit(iso: string | Date | null | undefined, s: UiSprache) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(LOCALE[s], { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}
export function datum(iso: string | Date | null | undefined, s: UiSprache) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(LOCALE[s], { dateStyle: 'medium' }).format(new Date(iso))
}
