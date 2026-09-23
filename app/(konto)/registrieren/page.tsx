import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { aktuelleSitzung } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import kontoTexte from '@/lib/i18n/texte/konto'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import Registrieren from '@/components/konto/Registrieren'
import { laenderListe, landVorschlag } from '@/components/konto/laender'

export async function generateMetadata(): Promise<Metadata> {
  return { title: kontoTexte[await uiSprache()].meta.registrieren }
}

export default async function RegistrierenSeite() {
  if (await aktuelleSitzung()) redirect('/portal')
  const sprache = await uiSprache()
  // Land-Vorschlag aus der Browsersprache — schon auf dem Server, damit die Auswahl beim Laden nicht springt.
  const vorschlag = landVorschlag((await headers()).get('accept-language'))
  return <Registrieren t={kontoTexte[sprache]} g={gemeinsamTexte[sprache]} laender={laenderListe(sprache)} vorschlagLand={vorschlag} />
}
