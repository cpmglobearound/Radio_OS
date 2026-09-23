import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { aktuelleSitzung, darf } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import uebersichtTexte from '@/lib/i18n/texte/uebersicht'
import bestellTexte from '@/lib/i18n/texte/bestellung'
import GuthabenSeite from '@/components/uebersicht/GuthabenSeite'

export async function generateMetadata(): Promise<Metadata> {
  return { title: uebersichtTexte[await uiSprache()].meta.guthaben }
}

/** Eigene Preisseite gibt es (noch) nicht — die Preise stehen auf der Startseite im Abschnitt #preise. */
const PREISE_HREF = '/#preise'

export default async function GuthabenPortal() {
  const s = await aktuelleSitzung()
  if (!s) redirect('/anmelden')
  if (!darf(s.rolle, 'redaktion')) redirect('/portal')
  const sprache = await uiSprache()
  return <GuthabenSeite u={uebersichtTexte[sprache]} b={bestellTexte[sprache]} preiseHref={PREISE_HREF} />
}
