'use client'
import Link from 'next/link'
import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import type { UiSprache } from '@/lib/sprachen'
import AudioPlayer from './AudioPlayer'
import { AbschnittKopf, Einblenden } from './Bewegung'
import { IconPfeil, IconWelle } from './Icons'

export interface BeispielAnzeige {
  id: string
  sprache: UiSprache
  quelle: string
  titel: string
  sprecher: string[]
  laenge_s: number
}

function dauer(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
}

export default function Hoerbeispiele({ t, beispiele }: { t: StartTexte; beispiele: BeispielAnzeige[] }) {
  const [aktivId, setAktivId] = useState(beispiele[0]?.id)
  const reiter = useRef<(HTMLButtonElement | null)[]>([])
  const aktiv = beispiele.find(b => b.id === aktivId) ?? beispiele[0]
  const h = t.hoeren

  function tasteReiter(e: KeyboardEvent, i: number) {
    const n = beispiele.length
    const ziel = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (ziel < 0) return
    e.preventDefault()
    setAktivId(beispiele[ziel].id)
    reiter.current[ziel]?.focus()
  }

  return (
    <section id="hoeren" aria-labelledby="hoeren-titel" className="scroll-mt-20 border-y border-linie/70 bg-karte/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="hoeren-titel" kicker={h.kicker} titel={h.titel} titelBunt={h.titelBunt} text={h.text} />

        <Einblenden className="mx-auto mt-14 max-w-4xl" verzoegerung={0.1}>
          {aktiv ? (
            <div className="karte relative overflow-hidden !rounded-[1.8rem] p-5 sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-violett/10 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-cyan/10 blur-3xl" />

              {beispiele.length > 1 && (
                <div role="tablist" aria-label={h.reiter} className="relative mb-7 flex flex-wrap gap-1 rounded-full border border-linie bg-grund p-1 sm:inline-flex">
                  {beispiele.map((b, i) => {
                    const an = b.id === aktiv.id
                    return (
                      <button
                        key={b.id}
                        ref={el => { reiter.current[i] = el }}
                        role="tab"
                        type="button"
                        id={`reiter-${b.id}`}
                        aria-selected={an}
                        aria-controls={`feld-${b.id}`}
                        tabIndex={an ? 0 : -1}
                        onClick={() => setAktivId(b.id)}
                        onKeyDown={e => tasteReiter(e, i)}
                        lang={b.sprache}
                        className={`relative flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${an ? 'text-white' : 'text-leise hover:text-text'}`}
                      >
                        {an && <motion.span layoutId="hoeren-reiter" className="absolute inset-0 rounded-full bg-text" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                        <span className="relative">{t.allgemein.sprachen[b.sprache]}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={aktiv.id}
                  id={`feld-${aktiv.id}`}
                  role={beispiele.length > 1 ? 'tabpanel' : undefined}
                  aria-labelledby={beispiele.length > 1 ? `reiter-${aktiv.id}` : undefined}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 lang={aktiv.sprache} className="font-display text-2xl font-medium tracking-[-.03em] text-text sm:text-3xl">{aktiv.titel}</h3>
                      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-leise">
                        <div className="flex gap-1.5"><dt className="font-semibold text-text-2">{h.sprecher}:</dt><dd>{aktiv.sprecher.join(' & ')}</dd></div>
                        <div className="flex gap-1.5"><dt className="font-semibold text-text-2">{h.format}:</dt><dd>{h.formatName}</dd></div>
                        <div className="flex gap-1.5"><dt className="font-semibold text-text-2">{h.laenge}:</dt><dd>{dauer(aktiv.laenge_s)}</dd></div>
                      </dl>
                    </div>
                    <div className="flex -space-x-2" aria-hidden="true">
                      {aktiv.sprecher.map((s, i) => (
                        <span key={s} className={`flex size-11 items-center justify-center rounded-full border-2 border-karte font-display text-sm font-bold text-white ${i === 0 ? 'bg-gradient-to-br from-cyan to-violett' : 'bg-gradient-to-br from-violett to-rosa'}`}>
                          {s.slice(0, 1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-7">
                    <AudioPlayer key={aktiv.id} quelle={aktiv.quelle} titel={aktiv.titel} laenge={aktiv.laenge_s} t={h.player} saat={aktiv.id} />
                  </div>
                </motion.div>
              </AnimatePresence>

              <p className="relative mt-6 border-t border-linie pt-4 text-sm text-leise">{h.hinweis}</p>
            </div>
          ) : (
            <div className="karte flex flex-col items-center !rounded-[1.8rem] px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl verlauf-grund text-white"><IconWelle className="size-7" /></span>
              <h3 className="mt-5 font-display text-2xl font-medium tracking-[-.03em] text-text">{h.platzhalterTitel}</h3>
              <p className="mt-3 max-w-lg text-leise">{h.platzhalterText}</p>
              <Link href="/registrieren" className="knopf knopf-haupt group mt-7">
                {h.platzhalterKnopf}
                <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </Einblenden>
      </div>
    </section>
  )
}
