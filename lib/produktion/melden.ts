import { prisma } from '@/lib/db'
import { sendeMail } from '@/lib/mail'
import mailTexte, { fuellen } from '@/lib/i18n/texte/mail'
import { minSek } from '@/lib/abrechnung/kontobuch'
import { alsUiSprache } from '@/lib/i18n'

const GRUND: Record<string, Record<'de' | 'en' | 'es', string>> = {
  keine_quellen: { de: 'Zu diesem Thema haben wir keine belastbaren Quellen gefunden.', en: 'We couldn’t find reliable sources on this topic.', es: 'No hemos encontrado fuentes fiables sobre este tema.' },
  seiten_leer: { de: 'Die angegebenen Webseiten ließen sich nicht lesen oder enthielten keine prüfbaren Fakten.', en: 'The web pages could not be read or contained no verifiable facts.', es: 'No hemos podido leer las páginas web o no contenían datos verificables.' },
  text_leer: { de: 'In Ihrem Text haben wir keine prüfbaren Fakten gefunden.', en: 'We found no verifiable facts in your text.', es: 'No hemos encontrado datos verificables en tu texto.' },
  technik: { de: 'Ein technischer Fehler ist aufgetreten. Wir sind informiert.', en: 'A technical error occurred. We have been notified.', es: 'Se ha producido un error técnico. Ya estamos avisados.' },
}
export const grundText = (code: string, s: 'de' | 'en' | 'es') => GRUND[code]?.[s] ?? code

/** Mail an den Auftraggeber: fertig / fehlgeschlagen / Freigabe nötig. Fehler beim Versand brechen die Produktion nie ab. */
export async function beitragFertigMelden(id: string, anlass?: 'freigabe') {
  const b = await prisma.beitrag.findUniqueOrThrow({ where: { id } })
  const e = b.einstellungen as { erstellt_von?: string }
  if (!e.erstellt_von) return
  const n = await prisma.nutzer.findUnique({ where: { id: e.erstellt_von } })
  if (!n || n.geloescht_am) return
  const s = alsUiSprache(n.sprache) ?? 'de'
  const t = mailTexte[s]
  const url = `${process.env.APP_URL}/portal/beitraege/${id}`
  if (anlass === 'freigabe') return sendeMail(n.email, '✎ ' + b.titel, b.titel, [s === 'de' ? 'Das Drehbuch ist fertig und wartet auf Ihre Freigabe.' : s === 'es' ? 'El guion está listo y espera tu aprobación.' : 'The script is ready and awaiting your approval.'], { text: t.anhoeren_knopf, url })
  if (b.status === 'fehlgeschlagen') return sendeMail(n.email, t.fehler_betreff, t.fehler_betreff, [fuellen(t.fehler_text, { titel: b.titel, grund: grundText(b.fehler ?? 'technik', s) })], { text: t.anhoeren_knopf, url })
  return sendeMail(n.email, t.fertig_betreff, t.fertig_betreff, [fuellen(t.fertig_text, { titel: b.titel, laenge: minSek(b.laenge_s ?? 0) })], { text: t.anhoeren_knopf, url })
}
