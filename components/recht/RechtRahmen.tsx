import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { UiSprache } from '@/lib/sprachen'
import type { Abschnitt, RechtTexte } from '@/lib/i18n/texte/recht'
import Sprachwahl from './Sprachwahl'

export type RechtSeite = 'impressum' | 'datenschutz' | 'agb' | 'bot'

const SEITEN: RechtSeite[] = ['impressum', 'datenschutz', 'agb', 'bot']
const EMAIL = 'info@klarframe.com'

/** Macht die Kontaktadresse in Fließtext anklickbar — Texte bleiben reine Zeichenketten. */
export function mitLinks(text: string): ReactNode {
  const teile = text.split(EMAIL)
  if (teile.length === 1) return text
  return teile.flatMap((teil, i) => i === 0 ? [teil] : [
    <a key={i} href={`mailto:${EMAIL}`} className="font-medium text-cyan-text underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan-tief">{EMAIL}</a>,
    teil,
  ])
}

/** Gemeinsamer Rahmen der Rechtsseiten: Kopfzeile mit Logo, Sprachwahl und Rückweg, Inhalt, Fußzeile. */
export default function RechtRahmen({ sprache, t, seite, children }: { sprache: UiSprache; t: RechtTexte['rahmen']; seite: RechtSeite | 'preise'; children: ReactNode }) {
  const jahr = new Date().getFullYear()
  return (
    <>
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-text focus:px-4 focus:py-2 focus:text-white">
        {t.zumInhalt}
      </a>
      <header className="border-b border-linie bg-grund/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={t.startseite} className="flex min-w-0 shrink-0 items-center gap-2.5">
            <Image src="/marke/klarframe-logo-black.png" alt="Klarframe" width={47} height={40} priority className="h-9 w-auto sm:h-10" />
            <span aria-hidden="true" className="h-7 w-px bg-linie-2" />
            <span className="font-display text-[1.3rem] font-medium leading-none tracking-[-.04em] text-text">Radio</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="hidden whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-text-2 transition-colors hover:text-cyan-tief sm:inline-flex">
              ← {t.zurueck}
            </Link>
            <Sprachwahl sprache={sprache} beschriftung={t.sprache} namen={t.sprachen} />
          </div>
        </div>
      </header>

      <main id="inhalt" className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <Link href="/" className="mb-6 inline-flex text-sm font-semibold text-text-2 hover:text-cyan-tief sm:hidden">← {t.zurueck}</Link>
        {children}
      </main>

      <footer className="border-t border-linie bg-karte">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
          <div className="min-w-0">
            <Link href="/" aria-label={t.startseite} className="inline-flex items-center gap-2.5">
              <Image src="/marke/klarframe-logo-black.png" alt="Klarframe" width={47} height={40} className="h-10 w-auto" />
              <span aria-hidden="true" className="h-7 w-px bg-linie-2" />
              <span className="font-display text-xl font-medium leading-none tracking-[-.04em] text-text">Radio</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-leise">{t.fussText}</p>
          </div>
          <nav aria-label={t.rechtliches} className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-[.14em] text-text-2">{t.rechtliches}</p>
            <ul className="mt-3 space-y-2 text-sm text-leise">
              {SEITEN.map(s => (
                <li key={s}>
                  <Link href={`/${s}`} aria-current={s === seite ? 'page' : undefined} className={s === seite ? 'font-semibold text-text' : 'hover:text-text'}>{t[s]}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.konto} className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-[.14em] text-text-2">{t.konto}</p>
            <ul className="mt-3 space-y-2 text-sm text-leise">
              <li><Link href="/registrieren" className="hover:text-text">{t.testen}</Link></li>
              <li><Link href="/anmelden" className="hover:text-text">{t.anmelden}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-linie">
          <p className="mx-auto max-w-5xl px-4 py-5 text-xs text-leise sm:px-6">© {jahr} {t.rechte}</p>
        </div>
      </footer>
    </>
  )
}

/** Titelblock einer Rechtsseite. */
export function SeitenKopf({ kicker, titel, stand, children }: { kicker: string; titel: string; stand?: string; children?: ReactNode }) {
  return (
    <div className="max-w-[72ch]">
      <p className="text-[12px] font-bold uppercase tracking-[.14em] text-cyan-text">{kicker}</p>
      <h1 className="mt-2 break-words font-display text-[2.1rem] font-semibold leading-[1.08] text-text sm:text-5xl">{titel}</h1>
      {stand && <p className="mt-3 text-sm text-leise">{stand}</p>}
      {children && <div className="mt-5 space-y-3 text-[17px] leading-7 text-text-2">{children}</div>}
    </div>
  )
}

/** Abschnitte eines Rechtstexts: Überschrift, Absätze, optionale Liste. */
export function Abschnitte({ liste, praefix, ebene = 'h3' }: { liste: Abschnitt[]; praefix: string; ebene?: 'h2' | 'h3' }) {
  const H = ebene
  return (
    <div className="space-y-8">
      {liste.map((a, i) => (
        <section key={a.titel} id={`${praefix}-${i + 1}`} aria-labelledby={`${praefix}-${i + 1}-titel`} className="scroll-mt-6">
          <H id={`${praefix}-${i + 1}-titel`} className="font-display text-xl font-semibold leading-snug text-text">{a.titel}</H>
          {a.absaetze.map(p => <p key={p} className="mt-2.5 leading-7 text-text-2">{mitLinks(p)}</p>)}
          {a.liste && (
            <ul className="mt-2.5 list-disc space-y-1.5 pl-5 leading-7 text-text-2 marker:text-cyan-tief">
              {a.liste.map(p => <li key={p}>{mitLinks(p)}</li>)}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

/** Teil A (Klarframe-Grundlage) und Teil B (Radio-Ergänzung, sichtbar abgesetzt, mit Prüfvermerk). */
export function ZweiTeile({ t, teilA, teilB, basis, radio }: { t: RechtTexte['rahmen']; teilA: string; teilB: string; basis: Abschnitt[]; radio: Abschnitt[] }) {
  return (
    <div className="mt-10 max-w-[72ch] space-y-12">
      <section aria-labelledby="teil-a">
        <h2 id="teil-a" className="mb-6 border-b border-linie pb-3 font-display text-2xl font-semibold text-text sm:text-[1.7rem]">{teilA}</h2>
        <Abschnitte liste={basis} praefix="a" />
      </section>
      <section aria-labelledby="teil-b" className="karte relative overflow-hidden p-5 sm:p-8">
        <span aria-hidden="true" className="verlauf-grund absolute inset-x-0 top-0 h-1" />
        <p className="inline-flex rounded-full bg-cyan-hell px-3 py-1 text-[12px] font-bold uppercase tracking-[.12em] text-cyan-text">{t.radioMarke}</p>
        <h2 id="teil-b" className="mt-3 font-display text-2xl font-semibold text-text sm:text-[1.7rem]">{teilB}</h2>
        <p role="note" className="mt-4 rounded-xl border border-gelb/30 bg-gelb-hell px-4 py-3 text-sm leading-6 text-text-2">{t.radioPruefung}</p>
        <div className="mt-7">
          <Abschnitte liste={radio} praefix="b" />
        </div>
      </section>
      <p className="text-sm text-leise">{t.fragen} {mitLinks(EMAIL)}</p>
    </div>
  )
}
