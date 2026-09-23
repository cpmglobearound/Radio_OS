'use client'
import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { AbschnittKopf, Einblenden } from './Bewegung'
import { IconLaden, IconRadio } from './Icons'

type Art = 'sender' | 'firmen'
const ARTEN: Art[] = ['sender', 'firmen']

export default function Zielgruppen({ t }: { t: StartTexte }) {
  const z = t.zielgruppen
  const [art, setArt] = useState<Art>('sender')
  const reiter = useRef<(HTMLButtonElement | null)[]>([])
  const g = z[art]

  function taste(e: KeyboardEvent, i: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = (i + 1) % 2
    setArt(ARTEN[n])
    reiter.current[n]?.focus()
  }

  return (
    <section id="fuer-wen" aria-labelledby="fuer-wen-titel" className="scroll-mt-20 border-y border-linie/70 bg-karte/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="fuer-wen-titel" kicker={z.kicker} titel={z.titel} text={z.text} />

        <Einblenden className="mt-12 flex justify-center">
          <div role="tablist" aria-label={z.reiter} className="flex w-full max-w-md gap-1 rounded-full border border-linie bg-grund p-1">
            {ARTEN.map((a, i) => {
              const an = a === art
              const S = a === 'sender' ? IconRadio : IconLaden
              return (
                <button
                  key={a}
                  ref={el => { reiter.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`ziel-${a}`}
                  aria-selected={an}
                  aria-controls="ziel-feld"
                  tabIndex={an ? 0 : -1}
                  onClick={() => setArt(a)}
                  onKeyDown={e => taste(e, i)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors sm:text-[15px] ${an ? 'text-white' : 'text-leise hover:text-text'}`}
                >
                  {an && <motion.span layoutId="ziel-reiter" className="absolute inset-0 rounded-full bg-text" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  <S className="relative size-4" />
                  <span className="relative">{z[a].reiter}</span>
                </button>
              )
            })}
          </div>
        </Einblenden>

        <div id="ziel-feld" role="tabpanel" aria-labelledby={`ziel-${art}`} className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div key={art} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
              <div className="min-w-0">
                <h3 className="font-display text-3xl font-medium leading-[1.08] tracking-[-.04em] text-text sm:text-4xl">{g.titel}</h3>
                <p className="mt-4 text-lg leading-8 text-leise">{g.text}</p>
                <p className="mt-6 inline-flex rounded-full bg-cyan-hell px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.12em] text-cyan-text">{t.allgemein.beispiel}</p>
              </div>
              {/* Tagesablauf als Zeitleiste */}
              <ol className="relative min-w-0 space-y-4 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-[2px] before:rounded-full before:bg-gradient-to-b before:from-cyan before:via-violett before:to-rosa">
                {g.szenen.map((s, i) => (
                  <motion.li
                    key={s.titel}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.1, duration: 0.4 }}
                    className="relative pl-9"
                  >
                    <span aria-hidden="true" className="absolute left-0 top-6 size-4 rounded-full border-[3px] border-karte bg-violett shadow-[0_0_0_2px_rgb(139_92_246/.25)]" />
                    <div className="karte p-5 transition-transform hover:-translate-y-0.5">
                      <p className="font-display text-sm font-bold tabular-nums tracking-[.02em] text-cyan-text">{s.zeit}</p>
                      <h4 className="mt-1 font-display text-xl font-medium tracking-[-.02em] text-text">{s.titel}</h4>
                      <p className="mt-2 text-[15px] leading-7 text-leise">{s.text}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
