import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import stimmenTexte from '@/lib/i18n/texte/stimmen'
import StimmenKatalog from '@/components/stimmen/StimmenKatalog'

export async function generateMetadata(): Promise<Metadata> {
  return { title: stimmenTexte[await uiSprache()].meta.titel }
}

/** Stimmen anhören (alle Rollen). Eigener Text und „Paar anhören" nur für die Redaktion — das regelt die Komponente. */
export default async function StimmenSeite() {
  const sprache = await uiSprache()
  return <StimmenKatalog t={stimmenTexte[sprache]} />
}
