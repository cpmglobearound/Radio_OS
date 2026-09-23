import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import kontoTexte from '@/lib/i18n/texte/konto'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import PasswortVergessen from '@/components/konto/PasswortVergessen'

export async function generateMetadata(): Promise<Metadata> {
  return { title: kontoTexte[await uiSprache()].meta.passwortVergessen, robots: { index: false } }
}

export default async function PasswortVergessenSeite() {
  const sprache = await uiSprache()
  return <PasswortVergessen t={kontoTexte[sprache]} g={gemeinsamTexte[sprache]} />
}
