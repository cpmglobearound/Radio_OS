'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { IconHaken, IconPfeil, IconPlay } from './Icons'

// Three.js nur im Browser laden — kein Server-Rendern, eigener kleiner Code-Block.
const HeroSzene = dynamic(() => import('./HeroSzene'), { ssr: false })

function useMedium(abfrage: string) {
  return useSyncExternalStore(
    melden => {
      const m = window.matchMedia(abfrage)
      m.addEventListener('change', melden)
      return () => m.removeEventListener('change', melden)
    },
    () => window.matchMedia(abfrage).matches,
    () => false,
  )
}

/** Karte „Beitrag entsteht": die vier Stationen laufen nacheinander durch. */
function LiveKarte({ t, ruhig }: { t: StartTexte; ruhig: boolean }) {
  const [schritt, setSchritt] = useState(0)
  const chips = t.hero.chips
  useEffect(() => {
    if (ruhig) return
    const id = window.setInterval(() => setSchritt(s => (s + 1) % (chips.length + 2)), 1500)
    return () => window.clearInterval(id)
  }, [ruhig, chips.length])
  const aktiv = ruhig ? chips.length : schritt

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="karte relative w-full max-w-md !rounded-[1.6rem] bg-karte/85 p-5 backdrop-blur-xl sm:p-6"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-leise">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-2 animate-ping rounded-full bg-rosa opacity-60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-rosa" />
          </span>
          {t.hero.live}
        </span>
        <span className="rounded-full bg-karte-2 px-2.5 py-1 text-[11px] font-semibold text-text-2">{t.ablauf.mock.eingabe.wahl[0]}</span>
      </div>
      <p className="mt-3 font-display text-xl font-medium tracking-[-.02em] text-text">{t.ablauf.mock.fertig.titel}</p>

      <ol className="mt-5 space-y-2.5">
        {chips.map((c, i) => {
          const fertig = i < aktiv
          const laeuft = i === aktiv
          return (
            <li key={c.kopf} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-500 ${fertig ? 'border-linie bg-karte' : laeuft ? 'border-cyan/50 bg-cyan-hell/60' : 'border-transparent bg-grund-2/60 opacity-60'}`}>
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-500 ${fertig ? 'bg-gruen' : laeuft ? 'verlauf-grund' : 'bg-linie-2'}`}>
                {fertig ? <IconHaken className="size-4" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-text">{c.kopf}</span>
                <span className="block truncate text-[13px] text-leise">{c.text}</span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-text px-3 py-2.5 text-white">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-text"><IconPlay className="ml-0.5 size-3.5" /></span>
        <span className="flex h-8 min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
          {Array.from({ length: 36 }, (_, i) => (
            <motion.span
              key={i}
              className="w-[3px] shrink-0 rounded-full bg-gradient-to-t from-cyan via-violett to-rosa"
              style={{ height: `${22 + ((i * 37) % 60)}%` }}
              animate={ruhig || aktiv < chips.length ? undefined : { scaleY: [1, 0.35 + ((i * 13) % 7) / 10, 1] }}
              transition={{ duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-white/70">{t.ablauf.mock.fertig.werte[0]}</span>
      </div>
    </motion.div>
  )
}

export default function Hero({ t }: { t: StartTexte }) {
  const bereich = useRef<HTMLElement>(null)
  const ruhig = useReducedMotion() ?? false
  const klein = useMedium('(max-width: 767px)')
  const [sichtbar, setSichtbar] = useState(true)

  useEffect(() => {
    const el = bereich.current
    if (!el) return
    const beob = new IntersectionObserver(([e]) => setSichtbar(e.isIntersecting), { threshold: 0 })
    beob.observe(el)
    return () => beob.disconnect()
  }, [])

  const worte = t.hero.titel.split(' ')

  return (
    <section ref={bereich} aria-labelledby="hero-titel" className="relative isolate overflow-hidden">
      {/* heller Grund mit weichen Farbflecken und feinem Raster, wie voice.klarframe.com — nur hell */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 [background-image:radial-gradient(circle_at_12%_10%,rgb(0_200_255/.14),transparent_34%),radial-gradient(circle_at_88%_8%,rgb(139_92_246/.14),transparent_36%),radial-gradient(circle_at_60%_95%,rgb(236_72_153/.10),transparent_42%),linear-gradient(rgb(24_26_50/.035)_1px,transparent_1px),linear-gradient(90deg,rgb(24_26_50/.035)_1px,transparent_1px)] [background-size:auto,auto,auto,56px_56px,56px_56px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_42%,rgb(0_0_0/.35)_62%,black_82%,black_94%,transparent_100%)]">
        <HeroSzene ruhig={ruhig} klein={klein} sichtbar={sichtbar} quelle={bereich} />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-28 pt-12 sm:px-5 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-52 lg:pt-20">
        <div className="min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-linie bg-karte/80 px-3.5 py-2 text-xs font-semibold text-text-2 backdrop-blur"
          >
            <span className="size-2 rounded-full verlauf-grund" />
            {t.hero.kicker}
          </motion.p>

          <h1 id="hero-titel" className="font-display text-[clamp(2.3rem,6vw,4.9rem)] font-medium leading-[1.02] tracking-[-.05em] text-text [overflow-wrap:anywhere] sm:[overflow-wrap:normal]">
            <span className="block">
              {worte.map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: '0.4em' }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}{i < worte.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="verlauf-text block pb-2"
              initial={{ opacity: 0, y: '0.3em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 + worte.length * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              {t.hero.titelBunt}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-7 max-w-xl text-lg leading-8 text-text-2/80"
          >
            {t.hero.text}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link href="/registrieren" className="knopf knopf-haupt group !px-6 !py-3.5">
              {t.hero.knopfTesten}
              <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#hoeren" className="knopf knopf-zweit group !px-6 !py-3.5">
              <span className="flex size-6 items-center justify-center rounded-full verlauf-grund text-white"><IconPlay className="ml-px size-3" /></span>
              {t.hero.knopfHoeren}
            </a>
          </motion.div>

          <motion.ul
            initial="aus"
            animate="an"
            variants={{ aus: {}, an: { transition: { staggerChildren: 0.08, delayChildren: 0.75 } } }}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-leise"
          >
            {t.hero.punkte.map(p => (
              <motion.li key={p} variants={{ aus: { opacity: 0, y: 8 }, an: { opacity: 1, y: 0 } }} className="flex items-center gap-2">
                <IconHaken className="size-4 text-gruen" />
                {p}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="flex min-w-0 justify-center lg:justify-end">
          <LiveKarte t={t} ruhig={ruhig} />
        </div>
      </div>
    </section>
  )
}
