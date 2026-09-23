import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import texte from '@/lib/i18n/texte/recht'
import RechtRahmen, { Abschnitte, SeitenKopf } from '@/components/recht/RechtRahmen'
import { rechtMetadaten } from '@/components/recht/metadaten'

const KENNUNG = 'KlarframeRadioBot/1.0 (+https://radio.klarframe.com/bot)'
const SPERRE = 'User-agent: KlarframeRadioBot\nDisallow: /'

function Code({ children, label }: { children: string; label: string }) {
  return (
    <pre aria-label={label} className="mt-3 overflow-x-auto whitespace-pre-wrap [overflow-wrap:anywhere] rounded-xl border border-linie bg-grund-2 px-4 py-3 font-mono text-[14px] leading-6 text-text">
      <code>{children}</code>
    </pre>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await uiSprache()
  return rechtMetadaten('/bot', sprache, texte[sprache].bot.meta)
}

export default async function BotSeite() {
  const sprache = await uiSprache()
  const t = texte[sprache]
  const b = t.bot
  const [tut, regeln, sperren, kontakt] = b.abschnitte
  return (
    <RechtRahmen sprache={sprache} t={t.rahmen} seite="bot">
      <SeitenKopf kicker={b.kicker} titel={b.titel}>
        <p>{b.einleitung}</p>
      </SeitenKopf>
      <div className="mt-10 max-w-[72ch] space-y-10">
        <section aria-labelledby="kennung" className="karte p-5 sm:p-7">
          <h2 id="kennung" className="font-display text-xl font-semibold text-text">{b.kennungTitel}</h2>
          <Code label={b.kennungTitel}>{KENNUNG}</Code>
        </section>
        <Abschnitte liste={[tut, regeln]} praefix="bot" ebene="h2" />
        <section aria-labelledby="sperren" className="karte relative overflow-hidden p-5 sm:p-7">
          <span aria-hidden="true" className="verlauf-grund absolute inset-x-0 top-0 h-1" />
          <h2 id="sperren" className="font-display text-xl font-semibold text-text">{sperren.titel}</h2>
          {sperren.absaetze.map(p => <p key={p} className="mt-2.5 leading-7 text-text-2">{p}</p>)}
          <Code label="robots.txt">{SPERRE}</Code>
        </section>
        <Abschnitte liste={[kontakt]} praefix="kontakt" ebene="h2" />
      </div>
    </RechtRahmen>
  )
}
