import type { Metadata } from 'next'
import { aktuelleSitzung } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import kontoTexte from '@/lib/i18n/texte/konto'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import EmailBestaetigen from '@/components/konto/EmailBestaetigen'

export async function generateMetadata(): Promise<Metadata> {
  return { title: kontoTexte[await uiSprache()].meta.emailBestaetigen, robots: { index: false, follow: false } }
}

export default async function EmailBestaetigenSeite({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sprache, sitzung, { token }] = await Promise.all([uiSprache(), aktuelleSitzung(), searchParams])
  return (
    <EmailBestaetigen
      t={kontoTexte[sprache]}
      g={gemeinsamTexte[sprache]}
      token={typeof token === 'string' ? token : ''}
      angemeldet={!!sitzung}
      bestaetigt={!!sitzung?.nutzer.bestaetigt}
    />
  )
}
