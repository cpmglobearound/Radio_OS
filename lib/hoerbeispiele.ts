// Hörbeispiele für die Startseite — echte Produktionen der Plattform (je Sprache zwei Sprecher).
// Die Audiodateien liegen in public/hoerbeispiele/<datei>; fehlt eine Datei, blendet die Startseite das Beispiel aus.
export interface Hoerbeispiel {
  id: string
  sprache: 'de' | 'en' | 'es'
  datei: string              // relativ zu /hoerbeispiele/
  titel: string
  sprecher: string[]         // Namen im Programm
  laenge_s: number
  format: string             // Kennung aus lib/formate.ts
}

// Stand 23.09.2026: echte Produktionen der Plattform — Morgenshow „fröhlich mit Humor", zwei Stimmen, Mallorca-Nachrichten.
// Archiv aller Hörbeispiele: /var/lib/klarframe-radio/hoerbeispiele/
export const HOERBEISPIELE: Hoerbeispiel[] = [
  { id: 'mallorca-de', sprache: 'de', datei: 'mallorca-de.mp3', titel: 'Inselfunk am Morgen — Mallorcas Herbst zwischen Markt und Meer', sprecher: ['Lena', 'Jan'], laenge_s: 127, format: 'zwiegespraech' },
  { id: 'mallorca-es', sprache: 'es', datei: 'mallorca-es.mp3', titel: 'Radio Isla — Otoño fuera, cifras dentro', sprecher: ['Lucía', 'Pablo'], laenge_s: 123, format: 'zwiegespraech' },
  { id: 'mallorca-en', sprache: 'en', datei: 'mallorca-en.mp3', titel: 'Island Radio — Mallorca in Autumn: Sun, Sweets and Rent', sprecher: ['Emma', 'Oliver'], laenge_s: 108, format: 'zwiegespraech' },
]
