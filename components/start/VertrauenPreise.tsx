'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { AbschnittKopf, Einblenden, Staffel, auftauchen } from './Bewegung'
import { IconBeleg, IconKi, IconOhr, IconPfeil, IconSchloss } from './Icons'

const V_SYMBOLE = [IconBeleg, IconOhr, IconKi, IconSchloss]

export function Vertrauen({ t }: { t: StartTexte }) {
  const v = t.vertrauen
  return (
    <section id="vertrauen" aria-labelledby="vertrauen-titel" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="vertrauen-titel" kicker={v.kicker} titel={v.titel} text={v.text} />
        <Staffel als="ul" className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {v.liste.map((p, i) => {
            const S = V_SYMBOLE[i]
            return (
              <motion.li key={p.titel} variants={auftauchen} className="karte group min-w-0 !rounded-[1.6rem] p-6">
                <motion.span
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  className="flex size-12 items-center justify-center rounded-2xl verlauf-grund text-white shadow-[0_12px_28px_-12px_rgb(139_92_246/.7)]"
                >
                  <S className="size-6" />
                </motion.span>
                <h3 className="mt-6 font-display text-2xl font-medium tracking-[-.03em] text-text">{p.titel}</h3>
                <p className="mt-3 text-[15px] leading-7 text-leise">{p.text}</p>
              </motion.li>
            )
          })}
        </Staffel>
      </div>
    </section>
  )
}

export function Preise({ t }: { t: StartTexte }) {
  const p = t.preise
  return (
    <section id="preise" aria-labelledby="preise-titel" className="scroll-mt-20 border-y border-linie/70 bg-karte/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="preise-titel" kicker={p.kicker} titel={p.titel} titelBunt={p.titelBunt} text={p.text} />
        <Staffel als="ul" className="mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-3">
          {p.karten.map((k, i) => {
            const mitte = i === 1
            return (
              <motion.li
                key={k.titel}
                variants={auftauchen}
                whileHover={{ y: -6 }}
                className={`relative flex min-w-0 flex-col rounded-[1.8rem] p-7 ${mitte ? 'bg-text text-white shadow-[0_30px_60px_-30px_rgb(24_26_50/.6)]' : 'border border-linie bg-karte'}`}
              >
                {mitte && (
                  <>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.8rem] bg-[radial-gradient(circle_at_85%_0%,rgb(139_92_246/.45),transparent_50%),radial-gradient(circle_at_0%_100%,rgb(0_200_255/.25),transparent_50%)]" />
                    <span className="absolute -top-3 left-7 rounded-full verlauf-grund px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-white">{p.beliebt}</span>
                  </>
                )}
                <h3 className={`relative text-sm font-bold uppercase tracking-[.14em] ${mitte ? 'text-white/75' : 'text-leise'}`}>{k.titel}</h3>
                <p className="relative mt-4 font-display text-5xl font-medium tracking-[-.05em]">{k.preis}</p>
                <p className={`relative mt-1 font-semibold ${mitte ? 'text-cyan' : 'text-cyan-text'}`}>{k.zusatz}</p>
                <p className={`relative mt-5 text-[15px] leading-7 ${mitte ? 'text-white/75' : 'text-leise'}`}>{k.text}</p>
              </motion.li>
            )
          })}
        </Staffel>
        <Einblenden className="mt-10 flex flex-col items-center gap-4 text-center">
          <Link href="/preise" className="knopf knopf-zweit group">
            {p.knopf}
            <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-sm text-leise">{p.steuer}</p>
        </Einblenden>
      </div>
    </section>
  )
}

export function Abschluss({ t }: { t: StartTexte }) {
  const a = t.abschluss
  return (
    <section aria-labelledby="abschluss-titel" className="px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
      <Einblenden className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] bg-text px-6 py-16 text-center text-white sm:px-12 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgb(0_200_255/.35),transparent_40%),radial-gradient(circle_at_85%_15%,rgb(139_92_246/.4),transparent_42%),radial-gradient(circle_at_50%_110%,rgb(236_72_153/.35),transparent_45%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-end justify-center gap-[5px] opacity-30">
          {Array.from({ length: 60 }, (_, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-white"
              style={{ height: `${20 + ((i * 41) % 80)}%` }}
              animate={{ scaleY: [1, 0.4 + ((i * 7) % 6) / 10, 1] }}
              transition={{ duration: 1.2 + (i % 7) * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <h2 id="abschluss-titel" className="relative font-display text-4xl font-medium leading-[1.05] tracking-[-.04em] sm:text-6xl">
          {a.titel}
          <span className="block bg-gradient-to-r from-cyan via-[#b9a3ff] to-[#ff8cc6] bg-clip-text pb-1 text-transparent">{a.titelBunt}</span>
        </h2>
        <p className="relative mx-auto mt-6 max-w-xl text-lg leading-8 text-white/75">{a.text}</p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/registrieren" className="knopf group bg-white !px-6 !py-3.5 text-text hover:-translate-y-0.5">
            {a.knopf}
            <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/preise" className="knopf border border-white/25 !px-6 !py-3.5 text-white hover:bg-white/10">{a.knopf2}</Link>
        </div>
      </Einblenden>
    </section>
  )
}
