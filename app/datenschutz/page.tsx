import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import texte from '@/lib/i18n/texte/recht'
import RechtRahmen, { SeitenKopf, ZweiTeile } from '@/components/recht/RechtRahmen'
import { rechtMetadaten } from '@/components/recht/metadaten'

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await uiSprache()
  return rechtMetadaten('/datenschutz', sprache, texte[sprache].datenschutz.meta)
}

export default async function DatenschutzSeite() {
  const sprache = await uiSprache()
  const t = texte[sprache]
  const s = t.datenschutz
  return (
    <RechtRahmen sprache={sprache} t={t.rahmen} seite="datenschutz">
      <SeitenKopf kicker={s.kicker} titel={s.titel} stand={t.rahmen.stand}>
        <p>{s.einleitung}</p>
      </SeitenKopf>
      <ZweiTeile t={t.rahmen} teilA={s.teilA} teilB={s.teilB} basis={s.basis} radio={s.radio} />
    </RechtRahmen>
  )
}
