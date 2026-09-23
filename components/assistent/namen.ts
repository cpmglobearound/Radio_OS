// Namensvorschläge für Sprecher je Sprache des Beitrags (Basis-Sprache), nach Stimme weiblich/männlich.
// Das sind Vorschläge zum Anklicken — jeder Name ist frei änderbar.
import type { Ausgabesprache } from '@/lib/sprachen'
import type { Stimme } from './zustand'

const NAMEN: Record<Ausgabesprache['basis'], { w: string[]; m: string[] }> = {
  de: { w: ['Lena', 'Carmen', 'Anna', 'Julia', 'Sophie', 'Miriam'], m: ['Jan', 'Tobias', 'Lukas', 'David', 'Felix', 'Max'] },
  es: { w: ['Lucía', 'Carmen', 'Marta', 'Elena', 'Paula', 'Sara'], m: ['Pablo', 'Javier', 'Diego', 'Álvaro', 'Daniel', 'Hugo'] },
  en: { w: ['Emma', 'Olivia', 'Sophie', 'Grace', 'Chloe', 'Amelia'], m: ['James', 'Tom', 'Oliver', 'Harry', 'Jack', 'George'] },
  ca: { w: ['Laia', 'Núria', 'Marta', 'Aina', 'Júlia'], m: ['Jordi', 'Pau', 'Marc', 'Arnau', 'Pol'] },
  fr: { w: ['Camille', 'Léa', 'Chloé', 'Manon', 'Julie'], m: ['Lucas', 'Hugo', 'Louis', 'Thomas', 'Paul'] },
  it: { w: ['Giulia', 'Sofia', 'Chiara', 'Martina', 'Sara'], m: ['Luca', 'Marco', 'Matteo', 'Andrea', 'Davide'] },
}

/** Vorschläge passend zum Geschlecht der Stimme (sonst gemischt), ohne schon vergebene Namen. */
export function namensVorschlaege(basis: Ausgabesprache['basis'] | undefined, geschlecht: Stimme['geschlecht'] | undefined, vergeben: string[], anzahl = 5) {
  const n = NAMEN[basis ?? 'de'] ?? NAMEN.de
  let liste: string[]
  if (geschlecht === 'weiblich') liste = n.w
  else if (geschlecht === 'maennlich') liste = n.m
  else liste = n.w.flatMap((w, i) => [w, n.m[i]].filter(Boolean))
  const belegt = new Set(vergeben.map(x => x.trim().toLowerCase()))
  return liste.filter(x => !belegt.has(x.toLowerCase())).slice(0, anzahl)
}
