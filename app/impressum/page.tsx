import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { uiSprache } from '@/lib/i18n'
import texte, { IMPRESSUM } from '@/lib/i18n/texte/recht'
import RechtRahmen, { SeitenKopf } from '@/components/recht/RechtRahmen'
import { rechtMetadaten } from '@/components/recht/metadaten'

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await uiSprache()
  return rechtMetadaten('/impressum', sprache, texte[sprache].impressum.meta)
}

export default async function ImpressumSeite() {
  const sprache = await uiSprache()
  const t = texte[sprache]
  const i = t.impressum
  const zeilen: { name: string; wert: ReactNode }[] = [
    { name: i.verantwortlich, wert: IMPRESSUM.verantwortlich.map(n => <span key={n} className="block">{n}</span>) },
    { name: i.anschrift, wert: IMPRESSUM.anschrift.map(z => <span key={z} className="block">{z}</span>) },
    { name: i.email, wert: <a href={`mailto:${IMPRESSUM.email}`} className="font-medium text-cyan-text underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan-tief">{IMPRESSUM.email}</a> },
    { name: i.nif, wert: IMPRESSUM.nif },
  ]
  return (
    <RechtRahmen sprache={sprache} t={t.rahmen} seite="impressum">
      <SeitenKopf kicker={i.kicker} titel={i.titel}>
        <p>{i.einleitung}</p>
      </SeitenKopf>
      <dl className="karte mt-10 max-w-[72ch] divide-y divide-linie">
        {zeilen.map(z => (
          <div key={z.name} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6 sm:px-7">
            <dt className="text-[12px] font-bold uppercase tracking-[.14em] text-leise sm:pt-1">{z.name}</dt>
            <dd className="text-[17px] leading-7 text-text">{z.wert}</dd>
          </div>
        ))}
      </dl>
    </RechtRahmen>
  )
}
