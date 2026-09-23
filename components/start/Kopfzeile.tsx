'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { UiSprache } from '@/lib/sprachen'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { IconKreuz, IconMenue, IconPfeil } from './Icons'

const SPRACHEN: UiSprache[] = ['de', 'en', 'es']

function SprachUmschalter({ sprache, t }: { sprache: UiSprache; t: StartTexte }) {
  const router = useRouter()
  const [wartet, starte] = useTransition()
  const [gewaehlt, setGewaehlt] = useState(sprache)

  async function wechseln(s: UiSprache) {
    if (s === gewaehlt) return
    setGewaehlt(s)
    const res = await fetch('/api/sprache', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sprache: s }) }).catch(() => null)
    if (!res?.ok) { setGewaehlt(sprache); return }
    starte(() => router.refresh())
  }

  return (
    <div role="group" aria-label={t.nav.sprache} className={`relative flex items-center rounded-full border border-linie bg-karte/80 p-0.5 text-[12px] font-semibold ${wartet ? 'opacity-60' : ''}`}>
      {SPRACHEN.map(s => (
        <button
          key={s}
          type="button"
          lang={s}
          aria-pressed={gewaehlt === s}
          aria-label={t.allgemein.sprachen[s]}
          onClick={() => wechseln(s)}
          className={`relative rounded-full px-2 py-1.5 uppercase transition-colors sm:px-2.5 ${gewaehlt === s ? 'text-white' : 'text-leise hover:text-text'}`}
        >
          {gewaehlt === s && <motion.span layoutId="sprache-aktiv" className="absolute inset-0 rounded-full bg-text" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="relative">{s}</span>
        </button>
      ))}
    </div>
  )
}

export default function Kopfzeile({ sprache, t }: { sprache: UiSprache; t: StartTexte }) {
  const [offen, setOffen] = useState(false)
  const gescrollt = useSyncExternalStore(
    melden => {
      window.addEventListener('scroll', melden, { passive: true })
      return () => window.removeEventListener('scroll', melden)
    },
    () => window.scrollY > 12,
    () => false,
  )

  useEffect(() => {
    if (!offen) return
    const taste = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffen(false) }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [offen])

  const links = [
    { href: '#hoeren', text: t.nav.hoeren },
    { href: '#ablauf', text: t.nav.ablauf },
    { href: '#fuer-wen', text: t.nav.fuerWen },
    { href: '#formate', text: t.nav.formate },
    { href: '#preise', text: t.nav.preise },
    { href: '#fragen', text: t.nav.fragen },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-300 ${gescrollt || offen ? 'border-b border-linie/80 bg-grund/85 shadow-[0_8px_30px_-18px_rgb(24_26_50/.25)] backdrop-blur-xl' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-8">
        <Link href="/" aria-label={t.nav.startseite} className="flex min-w-0 shrink-0 items-center gap-2.5">
          <Image src="/marke/klarframe-logo-black.png" alt="Klarframe" width={47} height={40} priority className="h-10 w-auto" />
          <span aria-hidden="true" className="h-7 w-px bg-linie-2" />
          <span className="font-display text-[1.35rem] font-medium leading-none tracking-[-.04em] text-text">Radio</span>
        </Link>

        <nav aria-label={t.nav.hauptnav} className="hidden items-center gap-6 text-[15px] font-medium text-leise xl:flex">
          {links.map(l => (
            <a key={l.href} href={l.href} className="whitespace-nowrap transition-colors hover:text-text">{l.text}</a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <SprachUmschalter sprache={sprache} t={t} />
          <Link href="/anmelden" className="hidden whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-text-2 transition-colors hover:text-cyan-tief sm:inline-flex">
            {t.nav.anmelden}
          </Link>
          <Link href="/registrieren" className="knopf knopf-haupt group hidden !px-4 !py-2.5 text-sm md:inline-flex">
            {t.nav.testen}
            <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-linie bg-karte text-text xl:hidden"
            aria-expanded={offen}
            aria-controls="mobil-menue"
            aria-label={offen ? t.nav.menueZu : t.nav.menue}
            onClick={() => setOffen(o => !o)}
          >
            {offen ? <IconKreuz className="size-5" /> : <IconMenue className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {offen && (
          <motion.nav
            id="mobil-menue"
            aria-label={t.nav.hauptnav}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden xl:hidden"
          >
            <ul className="mx-auto grid max-w-7xl gap-1 px-4 pb-5 pt-1 sm:px-5">
              {links.map(l => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOffen(false)} className="block rounded-xl px-3 py-3 font-display text-xl font-medium tracking-[-.02em] text-text hover:bg-karte-2">
                    {l.text}
                  </a>
                </li>
              ))}
              <li className="mt-3 flex flex-wrap gap-2">
                <Link href="/registrieren" className="knopf knopf-haupt flex-1">{t.nav.testen}</Link>
                <Link href="/anmelden" className="knopf knopf-zweit flex-1">{t.nav.anmelden}</Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
