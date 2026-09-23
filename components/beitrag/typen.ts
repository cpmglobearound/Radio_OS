// Form der Antwort von GET /api/v1/beitraege/{id} — so, wie die Beitragsansicht sie liest.
// Alles, was die Datenbank als JSON speichert, ist hier bewusst locker (optional) typisiert.

export interface Befund { art: string; text: string; hart: boolean }

export interface Zeile {
  nr: number
  rolle: string
  block_id: string | null
  text: string
  regie: string | null
  emotion: string | null
  luecke_ms: number
  fakt_ids: string[]
  befunde: Befund[] | null
  hat_audio: boolean
  dauer_s: number | null
  wortgenauigkeit: number | null
  versuche: number
  warnung: string | null
  gehoert: string | null
}

export interface Fakt {
  id: string
  aussage: string
  zahl: string | null
  zitat: string
  quelle_name: string
  url: string | null
  datum: string | null
  themenblock_id: string | null
}

export interface Block { id: string; thema: string; blickwinkel: string | null }

export interface SprecherEinstellung { rolle: string; stimme: string; name: string; persoenlichkeit?: string; funktion?: string }

export interface Einstellungen {
  format?: string
  sprache?: string
  ziel_laenge_s?: number
  sprecher?: SprecherEinstellung[]
  tonalitaet?: Record<string, string | number | undefined> | string
  sendungsname?: string
  quelle?: string
  themen?: { titel: string; text?: string; urls?: string[] }[]
  anweisung?: string
  freigabe_noetig?: boolean
}

export interface Beitrag {
  id: string
  titel: string
  status: string
  fortschritt: { stufe?: string; prozent?: number; meldung?: string } | null
  fehler: string | null
  laenge_s: number | null
  kapitel: { start_s: number; titel: string; block_id?: string | null }[] | null
  shownotes: string | null
  pruefung: { hinweise?: string[]; lufs?: number; true_peak?: number; gesamt_wortgenauigkeit?: number | null } | null
  einstellungen: Einstellungen | null
  ist_probe: boolean
  version: number
  bestellt: boolean
  erstellt_am: string
  fertig_am: string | null
}

export interface BeitragDaten { beitrag: Beitrag; bloecke: Block[]; zeilen: Zeile[]; fakten: Fakt[] }

/** Formatnamen wie auf der Startseite (formatId → Name). */
export type FormatNamen = Record<string, { name: string }>

/** Welche Zeilen zuletzt geändert wurden (hervorheben) und woher. */
export interface Hervor { nrs: number[]; art: 'hand' | 'ki' }

/** Wofür „Mit KI überarbeiten" geöffnet wurde. */
export type KiBereich = { art: 'ganz' } | { art: 'block'; block_id: string; thema: string } | { art: 'zeile'; nr: number; block_id: string | null }
