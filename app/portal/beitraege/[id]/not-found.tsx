import Link from 'next/link'
import { uiSprache } from '@/lib/i18n'
import { aktuelleSitzung, darf } from '@/lib/konto/sitzung'
import beitragTexte from '@/lib/i18n/texte/beitrag'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { IconListe } from '@/components/gemeinsam/Icons'

/** Beitrag gibt es nicht (gelöscht, falscher Link oder aus einer anderen Firma): erklären und zur Liste führen. */
export default async function BeitragNichtGefunden() {
  const t = beitragTexte[await uiSprache()].nichtGefunden
  const s = await aktuelleSitzung()
  return (
    <LeerZustand icon={<IconListe className="size-7" />} titel={t.titel} text={t.text}>
      <Link href="/portal/beitraege" className="knopf knopf-haupt">{t.liste}</Link>
      {s && darf(s.rolle, 'redaktion') && <Link href="/portal/neu" className="knopf knopf-zweit">{t.neu}</Link>}
    </LeerZustand>
  )
}
