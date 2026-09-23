// Probetexte je Sprache (07 §5): Moderation + Zahl + Ortsname in einem Satz; Lachen nur bei kann_lachen.
export const PROBETEXTE: Record<string, { satz: string; lachen: string; namen: string[] }> = {
  'de-DE': { satz: 'Guten Morgen! Hier ist Klarframe Radio. In Palma kostet der Quadratmeter jetzt neunzehn Euro dreißig — und wir erklären, warum.', lachen: 'Meerblick? Ja, auf dem Poster im Flur!', namen: ['Klarframe', 'Palma'] },
  'es-ES': { satz: '¡Buenos días! Esto es Klarframe Radio. En Palma, el metro cuadrado ya cuesta diecinueve euros con treinta, y os contamos por qué.', lachen: '¿Vistas al mar? ¡Sí, en el póster del pasillo!', namen: ['Klarframe', 'Palma'] },
  'en-GB': { satz: 'Good morning! This is Klarframe Radio. In Palma, a square metre now costs nineteen euros thirty — and we’ll explain why.', lachen: 'Sea view? Yes, on the poster in the hallway!', namen: ['Klarframe', 'Palma'] },
}
