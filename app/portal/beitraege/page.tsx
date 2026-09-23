import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import uebersichtTexte from '@/lib/i18n/texte/uebersicht'
import startTexte from '@/lib/i18n/texte/start'
import BeitragsListe from '@/components/uebersicht/BeitragsListe'
import { istFilter } from '@/components/uebersicht/daten'

export async function generateMetadata(): Promise<Metadata> {
  return { title: uebersichtTexte[await uiSprache()].meta.beitraege }
}

export default async function BeitraegeSeite({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sprache = await uiSprache()
  const { filter } = await searchParams
  const formate = Object.fromEntries(Object.entries(startTexte[sprache].formate.namen).map(([id, f]) => [id, f.name]))
  return <BeitragsListe u={uebersichtTexte[sprache]} formate={formate} startFilter={istFilter(filter) ? filter : 'alle'} />
}
