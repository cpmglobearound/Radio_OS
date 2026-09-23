// Einfache, nachvollziehbare Passwort-Stärke: Länge und Mischung. Der Server prüft zusätzlich gegen bekannte Passwörter.
export const MIN_PASSWORT = 12

export type Stufe = 'schwach' | 'mittel' | 'stark'

export function passwortStaerke(pw: string): { stufe: Stufe; punkte: 1 | 2 | 3 } {
  const zeichen = [...pw].length
  const klassen = [/[a-zäöüß]/, /[A-ZÄÖÜ]/, /\d/, /[^\p{L}\d]/u].filter(r => r.test(pw)).length
  const verschiedene = new Set(pw.toLowerCase()).size
  if (zeichen < MIN_PASSWORT || verschiedene < 5) return { stufe: 'schwach', punkte: 1 }
  const extra = (zeichen >= 16 ? 1 : 0) + (zeichen >= 20 ? 1 : 0) + (klassen >= 3 ? 1 : 0) + (klassen >= 4 ? 1 : 0)
  return extra >= 2 ? { stufe: 'stark', punkte: 3 } : { stufe: 'mittel', punkte: 2 }
}
