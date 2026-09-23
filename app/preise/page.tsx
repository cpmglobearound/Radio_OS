import type { Metadata } from 'next'
import Link from 'next/link'
import { uiSprache } from '@/lib/i18n'
import recht from '@/lib/i18n/texte/recht'
import texte from '@/lib/i18n/texte/preise'
import RechtRahmen, { SeitenKopf, mitLinks } from '@/components/recht/RechtRahmen'
import { rechtMetadaten } from '@/components/recht/metadaten'
import { euro, preisKatalog } from '@/lib/abrechnung/katalog'
import { fuellen } from '@/lib/i18n/texte/mail'

// Preisseite — alle Zahlen aus dem Katalog (Datenbank). Ändert Klarframe einen Preis, ändert sich diese Seite mit.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await uiSprache()
  return rechtMetadaten('/preise', sprache, texte[sprache].meta)
}

export default async function PreisSeite() {
  const sprache = await uiSprache()
  const t = texte[sprache]
  const k = await preisKatalog()
  const letzte = k.einzel.at(-1)
  const beliebt = k.tarife.find(x => x.id === 'sender')?.id
  return (
    <RechtRahmen sprache={sprache} t={recht[sprache].rahmen} seite="preise">
      <SeitenKopf kicker={t.kicker} titel={t.titel}><p>{t.einleitung}</p></SeitenKopf>

      <section aria-labelledby="einzel" className="mt-12">
        <h2 id="einzel" className="text-2xl font-semibold">{t.einzel.titel}</h2>
        <p className="mt-2 max-w-[70ch] text-leise">{t.einzel.text}</p>
        <div className="karte mt-5 overflow-hidden">
          <ul className="divide-y divide-linie">
            {k.einzel.map((s, i) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5 sm:px-7">
                <span className="min-w-0">
                  <span className="font-semibold">{fuellen(t.einzel.bis, { n: String(s.bis_minuten) })}</span>
                  {t.einzel.typisch[i] && <span className="ml-2 text-sm text-leise">{t.einzel.typisch[i]}</span>}
                </span>
                <span className="font-display text-xl font-semibold tabular-nums">{euro(s.preis_eur, sprache)}</span>
              </li>
            ))}
          </ul>
          {letzte?.je_weitere_minute_eur != null && (
            <p className="border-t border-linie bg-grund-2 px-5 py-3 text-sm text-text-2 sm:px-7">{fuellen(t.einzel.weitere, { n: String(letzte.bis_minuten), preis: euro(letzte.je_weitere_minute_eur, sprache) })}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="abo" className="mt-14">
        <h2 id="abo" className="text-2xl font-semibold">{t.abo.titel}</h2>
        <p className="mt-2 max-w-[70ch] text-leise">{t.abo.text}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {k.tarife.map(x => (
            <div key={x.id} className={`karte relative flex min-w-0 flex-col p-5 ${x.id === beliebt ? 'ring-2 ring-cyan-tief' : ''}`}>
              {x.id === beliebt && <span className="absolute -top-3 left-5 rounded-full bg-text px-3 py-1 text-xs font-semibold text-white">{t.abo.beliebt}</span>}
              <h3 className="text-lg font-semibold">{x.name}</h3>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{euro(x.preis_eur, sprache)}<span className="ml-1 text-sm font-normal text-leise">{t.abo.monat}</span></p>
              <p className="mt-1 text-sm text-leise">{fuellen(t.abo.jeMinute, { preis: euro(Math.round((x.preis_eur / x.minuten_inkl) * 100) / 100, sprache) })}</p>
              <ul className="mt-4 grid gap-1.5 text-sm">
                <li>✓ {fuellen(t.abo.minuten, { n: x.minuten_inkl.toLocaleString(sprache) })}</li>
                <li>✓ {x.max_sendungen == null ? t.abo.sendungenAlle : x.max_sendungen === 1 ? t.abo.sendung1 : fuellen(t.abo.sendungen, { n: String(x.max_sendungen) })}</li>
                {x.max_nutzer != null && <li>✓ {fuellen(t.abo.nutzer, { n: String(x.max_nutzer) })}</li>}
                <li className="text-leise">{x.auslieferung.map(a => t.abo.auslieferung[a] ?? a).join(' · ')}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="nachkauf" className="karte p-5 sm:p-7">
          <h2 id="nachkauf" className="text-xl font-semibold">{t.nachkauf.titel}</h2>
          <p className="mt-1 text-sm text-leise">{t.nachkauf.text}</p>
          <ul className="mt-4 divide-y divide-linie">
            {k.nachkauf.map(n => (
              <li key={n.id} className="flex items-baseline justify-between gap-4 py-2.5">
                <span>{fuellen(t.nachkauf.paket, { n: String(n.minuten) })}</span>
                <span className="font-semibold tabular-nums">{euro(n.preis_eur, sprache)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="probe" className="karte flex flex-col justify-between gap-4 bg-cyan-hell/40 p-5 sm:p-7">
          <div>
            <h2 id="probe" className="text-xl font-semibold">{t.probe.titel}</h2>
            <p className="mt-2 text-text-2">{fuellen(t.probe.text, { n: String(k.probe_minuten) })}</p>
          </div>
          <Link href="/registrieren" className="knopf knopf-haupt self-start">{t.probe.knopf} →</Link>
        </section>
      </div>

      <section aria-labelledby="regeln" className="mt-14 max-w-[72ch]">
        <h2 id="regeln" className="text-xl font-semibold">{t.regeln.titel}</h2>
        <ul className="mt-4 grid gap-2.5">
          {t.regeln.liste.map(r => <li key={r} className="flex gap-2.5"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-tief" />{r}</li>)}
        </ul>
        <h2 className="mt-10 text-xl font-semibold">{t.anfrage.titel}</h2>
        <p className="mt-2">{mitLinks(t.anfrage.text)}</p>
      </section>
    </RechtRahmen>
  )
}
