import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import uebersichtTexte from '@/lib/i18n/texte/uebersicht'
import startTexte from '@/lib/i18n/texte/start'
import Uebersicht from '@/components/uebersicht/Uebersicht'

export async function generateMetadata(): Promise<Metadata> {
  return { title: uebersichtTexte[await uiSprache()].meta.uebersicht }
}

export default async function PortalStart() {
  const sprache = await uiSprache()
  // Formatnamen wie auf der Startseite (eine Stelle), nur die Namen an den Browser.
  const formate = Object.fromEntries(Object.entries(startTexte[sprache].formate.namen).map(([id, f]) => [id, f.name]))
  return <Uebersicht u={uebersichtTexte[sprache]} formate={formate} />
}
