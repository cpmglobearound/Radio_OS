// Die eine Anbieterschnittstelle (07 §2). Die Oberfläche kennt keine Anbieter-Sonderfälle.
export interface SprechAuftrag {
  text: string
  sprache: string                 // BCP-47
  stimme: string                  // anbieter_stimm_id
  name: string                    // Name im Programm
  persoenlichkeit: string
  regie?: string
  emotion?: string                // Umsetzung aus EMOTION_REGIE
  sendung: string
  kontext: { sprecher: string; text: string }[]   // vorige Zeile(n) — bei 3 Sprechern zwei
  versuch: number
  aussprache?: { wort: string; sprichAls: string }[]
}
export interface SprechErgebnis { wav: Buffer; kosten_usd: number }
export interface Faehigkeiten { lachen: boolean; regieAlsText: boolean; mehrsprecher: boolean; maxZeichen: number; sprachen: string[] }

export interface StimmAnbieter {
  id: string
  name: string
  faehigkeiten: Faehigkeiten
  sprechen(a: SprechAuftrag): Promise<SprechErgebnis>
}
