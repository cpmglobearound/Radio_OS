import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import kontoTexte from '@/lib/i18n/texte/konto'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import PasswortNeu from '@/components/konto/PasswortNeu'

export async function generateMetadata(): Promise<Metadata> {
  return { title: kontoTexte[await uiSprache()].meta.passwortNeu, robots: { index: false, follow: false } }
}

export default async function PasswortNeuSeite({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sprache = await uiSprache()
  const { token } = await searchParams
  return <PasswortNeu t={kontoTexte[sprache]} g={gemeinsamTexte[sprache]} token={typeof token === 'string' ? token : ''} />
}
