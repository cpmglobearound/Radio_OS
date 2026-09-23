import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import kontoTexte from '@/lib/i18n/texte/konto-seite'
import KontoSeite from '@/components/uebersicht/KontoSeite'

export async function generateMetadata(): Promise<Metadata> {
  return { title: kontoTexte[await uiSprache()].meta.titel }
}

export default async function KontoPortal() {
  return <KontoSeite k={kontoTexte[await uiSprache()]} />
}
