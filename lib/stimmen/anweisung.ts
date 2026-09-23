import { sprachName } from '@/lib/sprachen'
import { EMOTION_REGIE, type Emotion } from '@/lib/tonalitaet'
import type { SprechAuftrag } from './anbieter/typ'

/** Anweisung je Zeile (07 §2.1, bewährt in der Demo). Sprache steht fest vorne — GPT-Live wandert sonst mit. */
export function sprechAnweisung(a: SprechAuftrag) {
  const sprache = sprachName(a.sprache, 'de')
  const emo = a.emotion && a.emotion in EMOTION_REGIE ? EMOTION_REGIE[a.emotion as Emotion] : ''
  const kontext = a.kontext.length ? `Davor ${a.kontext.map(k => `hat ${k.sprecher} gesagt: „${k.text}"`).join(', und davor ')} – reagiere im Ton darauf. ` : ''
  const streng = a.versuch > 1 ? ' Halte dich diesmal besonders genau an den Wortlaut und fasse dich kurz: Lachen höchstens eine Sekunde, keine langen Pausen.' : ''
  return `Sprache: ${sprache} (${a.sprache}), muttersprachlich, ohne fremden Akzent. `
    + `Du bist ${a.name}, ${a.persoenlichkeit}, in der Radiosendung „${a.sendung}". `
    + `Du sprichst den Text des Nutzers EXAKT Wort für Wort auf ${sprache} – kein Wort hinzufügen, weglassen oder ändern, keine Antwort, kein Kommentar, nichts vorlesen, was in Klammern stünde. `
    + `Nichtsprachliche Laute wie Lachen, Atmen, Schmunzeln, Seufzen sind erlaubt, wenn die Regie es verlangt. Natürlich, menschlich, wie ein echtes Gespräch unter Kollegen, keine Vorlese-Stimme. `
    + kontext
    + (emo ? `Emotion: ${emo}. ` : '')
    + `Regie für diese Zeile: ${a.regie || 'natürlich'}${streng}`
}

/** Aussprache-Lexikon nur für die Vertonung (Drehbuch bleibt korrekt geschrieben, 07 §4.6). */
export function mitAussprache(text: string, lex?: { wort: string; sprichAls: string }[]) {
  let t = text
  for (const l of lex ?? []) t = t.replace(new RegExp(`\\b${l.wort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), l.sprichAls)
  return t
}
