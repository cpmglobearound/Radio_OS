// EINE Stelle für Formate (Regel 3). Oberfläche, Preis, Drehbuch und Prüfungen fragen nur hier nach.
export type FormatId =
  | 'nachrichten' | 'wetter' | 'themenblock' | 'zwiegespraech' | 'magazin' | 'glosse'
  | 'interview' | 'moderation' | 'durchsage' | 'veranstaltungen' | 'tagesbriefing' | 'talkrunde'

export type Funktion = 'fuehrt' | 'co_moderation' | 'gast' | 'pro' | 'contra' | 'reporter' | 'experte' | 'sprecher'

// Längen: Sender können bis 60 Minuten je Beitrag erzeugen (lange Formate werden abschnittsweise geschrieben, siehe lib/redaktion/drehbuch.ts).
export interface Format {
  id: FormatId
  sprecher_min: 1 | 2 | 3
  sprecher_max: 1 | 2 | 3
  sprecher_standard: 1 | 2 | 3
  laenge_min_s: number
  laenge_max_s: number
  laenge_standard_s: number
  humor_erlaubt: boolean
  wortgenauigkeit_min: number        // 08 §1.5
  rollen: Funktion[][]               // Vorlage je Sprecherzahl (Index = Zahl − 1)
}

const R1: Funktion[] = ['sprecher']
const R2: Funktion[] = ['fuehrt', 'co_moderation']
const R3: Funktion[] = ['fuehrt', 'pro', 'contra']

export const FORMATE: Format[] = [
  { id: 'nachrichten', sprecher_min: 1, sprecher_max: 1, sprecher_standard: 1, laenge_min_s: 45, laenge_max_s: 900, laenge_standard_s: 90, humor_erlaubt: false, wortgenauigkeit_min: 0.95, rollen: [R1] },
  { id: 'wetter', sprecher_min: 1, sprecher_max: 1, sprecher_standard: 1, laenge_min_s: 30, laenge_max_s: 120, laenge_standard_s: 45, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1] },
  { id: 'themenblock', sprecher_min: 1, sprecher_max: 2, sprecher_standard: 1, laenge_min_s: 60, laenge_max_s: 3600, laenge_standard_s: 180, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, R2] },
  { id: 'zwiegespraech', sprecher_min: 2, sprecher_max: 2, sprecher_standard: 2, laenge_min_s: 120, laenge_max_s: 3600, laenge_standard_s: 180, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, R2] },
  { id: 'magazin', sprecher_min: 1, sprecher_max: 3, sprecher_standard: 2, laenge_min_s: 300, laenge_max_s: 3600, laenge_standard_s: 600, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, R2, ['fuehrt', 'co_moderation', 'reporter']] },
  { id: 'glosse', sprecher_min: 1, sprecher_max: 3, sprecher_standard: 1, laenge_min_s: 60, laenge_max_s: 900, laenge_standard_s: 120, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, R2, ['fuehrt', 'gast', 'gast']] },
  { id: 'interview', sprecher_min: 2, sprecher_max: 3, sprecher_standard: 2, laenge_min_s: 180, laenge_max_s: 3600, laenge_standard_s: 300, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, ['fuehrt', 'experte'], ['fuehrt', 'experte', 'experte']] },
  { id: 'moderation', sprecher_min: 1, sprecher_max: 1, sprecher_standard: 1, laenge_min_s: 10, laenge_max_s: 60, laenge_standard_s: 30, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1] },
  { id: 'durchsage', sprecher_min: 1, sprecher_max: 1, sprecher_standard: 1, laenge_min_s: 10, laenge_max_s: 60, laenge_standard_s: 20, humor_erlaubt: true, wortgenauigkeit_min: 0.95, rollen: [R1] },
  { id: 'veranstaltungen', sprecher_min: 1, sprecher_max: 2, sprecher_standard: 1, laenge_min_s: 60, laenge_max_s: 1800, laenge_standard_s: 90, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, R2] },
  { id: 'tagesbriefing', sprecher_min: 1, sprecher_max: 1, sprecher_standard: 1, laenge_min_s: 180, laenge_max_s: 1800, laenge_standard_s: 300, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1] },
  { id: 'talkrunde', sprecher_min: 3, sprecher_max: 3, sprecher_standard: 3, laenge_min_s: 300, laenge_max_s: 3600, laenge_standard_s: 300, humor_erlaubt: true, wortgenauigkeit_min: 0.9, rollen: [R1, R2, R3] },
]

export const formatVon = (id: string) => FORMATE.find(f => f.id === id)
