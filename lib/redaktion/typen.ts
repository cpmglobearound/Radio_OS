import type { Tonalitaet, Emotion } from '@/lib/tonalitaet'
import type { Funktion } from '@/lib/formate'

export interface SprecherEinstellung { rolle: string; stimme: string; name: string; persoenlichkeit: string; funktion: Funktion }

/** Eingefrorene Einstellungen eines Beitrags (Beitrag.einstellungen). */
export interface BeitragEinstellungen {
  format: string
  sprache: string                 // BCP-47, z. B. de-DE
  ziel_laenge_s: number
  sprecher: SprecherEinstellung[]
  tonalitaet: Tonalitaet
  sendungsname: string
  region?: { land?: string; orte?: string[] }
  quelle: 'text' | 'webseiten' | 'recherche'
  themen: { titel: string; text?: string; urls?: string[] }[]
  anweisung?: string              // freie Wünsche des Kunden
  freigabe_noetig: boolean
  aktualitaet_h?: number
  kennung_position: 'anfang' | 'ende'
  lautheit_lufs: number           // −23 Rundfunk (Sender), −16 Podcast/Stream (08 §2.4)
  ist_probe: boolean
  wortrate?: number                // gemessenes Sprechtempo der gewählten Stimmen (Wörter/min bei Tempo normal)
}

export interface FaktKurz { id: string; aussage: string; zahl: string | null; quelle: string; datum: string | null }
export interface BlockPlan { id: string; thema: string; sensibel: boolean; fakten: FaktKurz[] }

export interface DrehbuchZeile { rolle: string; block: string; text: string; regie: string; emotion: Emotion; luecke_ms: number; fakten: string[]; namen?: { wort: string; aussprache: string }[]; befunde?: { art: string; text: string; hart: boolean }[] }
export interface Drehbuch { titel: string; bloecke: { id: string; thema: string; blickwinkel: string }[]; zeilen: DrehbuchZeile[] }
