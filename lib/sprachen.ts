// EINE Stelle für Ausgabesprachen (BCP-47 mit Variante) und Oberflächensprachen.
export const OBERFLAECHE = ['de', 'en', 'es'] as const
export type UiSprache = (typeof OBERFLAECHE)[number]

export interface Ausgabesprache {
  code: string
  basis: 'de' | 'es' | 'en' | 'ca' | 'fr' | 'it'
  land: string
  aktiv: boolean
  wpm: { langsam: number; normal: number; zuegig: number }   // 06 §5 — gesprochene Wörter je Minute
  anrede: string[]
  anrede_standard: string
}

export const AUSGABESPRACHEN: Ausgabesprache[] = [
  { code: 'de-DE', basis: 'de', land: 'DE', aktiv: true, wpm: { langsam: 120, normal: 140, zuegig: 160 }, anrede: ['du', 'ihr', 'Sie'], anrede_standard: 'ihr' },
  { code: 'es-ES', basis: 'es', land: 'ES', aktiv: true, wpm: { langsam: 145, normal: 165, zuegig: 185 }, anrede: ['tú', 'vosotros', 'usted', 'ustedes'], anrede_standard: 'vosotros' },
  { code: 'en-GB', basis: 'en', land: 'GB', aktiv: true, wpm: { langsam: 135, normal: 155, zuegig: 175 }, anrede: ['you'], anrede_standard: 'you' },
  { code: 'de-AT', basis: 'de', land: 'AT', aktiv: false, wpm: { langsam: 120, normal: 140, zuegig: 160 }, anrede: ['du', 'ihr', 'Sie'], anrede_standard: 'ihr' },
  { code: 'de-CH', basis: 'de', land: 'CH', aktiv: false, wpm: { langsam: 115, normal: 135, zuegig: 155 }, anrede: ['du', 'ihr', 'Sie'], anrede_standard: 'ihr' },
  { code: 'ca-ES', basis: 'ca', land: 'ES', aktiv: false, wpm: { langsam: 140, normal: 160, zuegig: 180 }, anrede: ['tu', 'vosaltres', 'vostè'], anrede_standard: 'vosaltres' },
]

export const ausgabespracheVon = (code: string) => AUSGABESPRACHEN.find(s => s.code === code)

/** Anzeigename in der Oberflächensprache — aus Intl, nicht fest im Code. */
export function sprachName(code: string, ui: UiSprache) {
  try { return new Intl.DisplayNames([ui], { type: 'language' }).of(code) ?? code } catch { return code }
}
export function landName(land: string, ui: UiSprache) {
  try { return new Intl.DisplayNames([ui], { type: 'region' }).of(land) ?? land } catch { return land }
}
