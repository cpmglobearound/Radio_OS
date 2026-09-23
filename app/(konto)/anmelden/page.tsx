import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { aktuelleSitzung } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import kontoTexte from '@/lib/i18n/texte/konto'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import Anmelden from '@/components/konto/Anmelden'

export async function generateMetadata(): Promise<Metadata> {
  return { title: kontoTexte[await uiSprache()].meta.anmelden }
}

export default async function AnmeldenSeite({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await aktuelleSitzung()) redirect('/portal')
  const sprache = await uiSprache()
  const { link } = await searchParams
  return <Anmelden t={kontoTexte[sprache]} g={gemeinsamTexte[sprache]} linkUngueltig={link === 'ungueltig'} />
}
