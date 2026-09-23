'use client'
// „So entsteht ein Beitrag": fünf Schritte, links die Liste, rechts ein kleines Bild der echten Oberfläche.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { AbschnittKopf } from './Bewegung'
import { IconBeleg, IconDownload, IconDrehbuch, IconFeed, IconGlobus, IconHaken, IconLupe, IconMikro, IconPause, IconPlay, IconRadio, IconSenden, IconText } from './Icons'

type M = StartTexte['ablauf']['mock']
const DAUER_MS = 5200
const SYMBOLE = [IconText, IconLupe, IconDrehbuch, IconMikro, IconSenden]

const zeile = {
  aus: { opacity: 0, x: -10 },
  an: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.12, duration: 0.4 } }),
}

function Sprecherpunkt({ wer, erster }: { wer: string; erster: string }) {
  return (
    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${wer === erster ? 'bg-gradient-to-br from-cyan to-violett' : 'bg-gradient-to-br from-violett to-rosa'}`}>
      {wer.slice(0, 1)}
    </span>
  )
}

function Eingabe({ m }: { m: M }) {
  const e = m.eingabe
  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-2xl bg-grund-2 p-1 text-[12px] font-semibold">
        {e.reiter.map((r, i) => {
          const S = [IconText, IconGlobus, IconLupe][i]
          return (
            <span key={r} className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 ${i === 2 ? 'bg-karte text-text shadow-sm' : 'text-leise'}`}>
              <S className="size-3.5" />{r}
            </span>
          )
        })}
      </div>
      <p className="mt-5 text-[13px] font-semibold text-text-2">{e.feld}</p>
      <div className="mt-2 rounded-xl border border-cyan-tief bg-karte px-3.5 py-3 text-[15px] text-text shadow-[0_0_0_3px_var(--color-cyan-hell)]">
        <motion.span initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 1.3, ease: 'linear' }} className="inline-block">
          {e.wert}
        </motion.span>
        <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-text" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {e.wahl.map((w, i) => (
          <motion.span key={w} custom={i} variants={zeile} initial="aus" animate="an" className="rounded-full border border-linie bg-karte px-3 py-1.5 text-[12px] font-semibold text-text-2">
            {w}
          </motion.span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-linie pt-4">
        <span className="text-[12px] text-leise">{e.preis}</span>
        <span className="knopf knopf-bunt !px-4 !py-2 text-[13px]">{e.knopf}</span>
      </div>
    </div>
  )
}

function Recherche({ m }: { m: M }) {
  const r = m.recherche
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[.14em] text-leise">{r.kopf}</p>
      <ul className="mt-3 space-y-2">
        {r.quellen.map((q, i) => (
          <motion.li key={q.name + q.datum} custom={i} variants={zeile} initial="aus" animate="an" className="flex items-center gap-3 rounded-xl border border-linie bg-karte px-3 py-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-karte-2 text-[11px] font-bold text-text-2">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text">{q.name}</span>
            <span className="shrink-0 text-[12px] tabular-nums text-leise">{q.datum}</span>
            <IconHaken className="size-4 shrink-0 text-gruen" />
          </motion.li>
        ))}
      </ul>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-4 rounded-xl border border-gruen/30 bg-gruen-hell px-3.5 py-3">
        <p className="text-[14px] font-semibold text-text">{r.fakt}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-[#07715f]"><IconBeleg className="size-4" />{r.belegt}</p>
      </motion.div>
    </div>
  )
}

function Drehbuch({ m }: { m: M }) {
  const d = m.drehbuch
  const erster = d.zeilen[0].wer
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[.14em] text-leise">{d.kopf}</p>
      <ol className="mt-3 space-y-2">
        {d.zeilen.map((z, i) => (
          <motion.li key={i} custom={i} variants={zeile} initial="aus" animate="an" className="flex gap-3 rounded-xl border border-linie bg-karte px-3 py-2.5">
            <Sprecherpunkt wer={z.wer} erster={erster} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 text-[12px]">
                <span className="font-bold text-text">{z.wer}</span>
                <span className="italic text-leise">{z.regie}</span>
              </p>
              <p className="mt-0.5 text-[14px] leading-snug text-text-2">{z.text}</p>
            </div>
            {z.beleg && (
              <span className="flex h-fit shrink-0 items-center gap-1 rounded-full bg-gruen-hell px-2 py-1 text-[11px] font-bold text-[#07715f]">
                <IconHaken className="size-3" />{z.beleg}
              </span>
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

function Stimmen({ m }: { m: M }) {
  const s = m.stimmen
  const erster = s.zeilen[0].wer
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[.14em] text-leise">{s.kopf}</p>
      <ol className="mt-3 space-y-2">
        {s.zeilen.map((z, i) => (
          <motion.li key={i} custom={i} variants={zeile} initial="aus" animate="an" className="flex items-center gap-3 rounded-xl border border-linie bg-karte px-3 py-2.5">
            <Sprecherpunkt wer={z.wer} erster={erster} />
            <span className="flex h-5 w-16 shrink-0 items-center gap-[2px]" aria-hidden="true">
              {Array.from({ length: 12 }, (_, k) => (
                <span key={k} className="w-[3px] rounded-full bg-violett/60" style={{ height: `${25 + ((k * 29 + i * 17) % 70)}%` }} />
              ))}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-text-2">{z.text}</span>
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.25 }} className="flex shrink-0 items-center gap-1 rounded-full bg-gruen-hell px-2 py-1 text-[11px] font-bold text-[#07715f]">
              <IconHaken className="size-3" /><span className="hidden sm:inline">{z.status}</span>
            </motion.span>
          </motion.li>
        ))}
      </ol>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-grund-2">
          <motion.div className="h-full rounded-full verlauf-grund" initial={{ width: '8%' }} animate={{ width: '100%' }} transition={{ duration: 1.6, ease: 'easeOut' }} />
        </div>
        <p className="mt-2 text-[12px] font-semibold text-text-2">{s.fortschritt}</p>
      </div>
    </div>
  )
}

function Fertig({ m }: { m: M }) {
  const f = m.fertig
  const ZS = [IconDownload, IconFeed, IconSenden, IconRadio]
  return (
    <div>
      <div className="rounded-2xl bg-text p-4 text-white">
        <p className="font-display text-lg font-medium tracking-[-.02em]">{f.titel}</p>
        <div className="mt-3 flex h-10 items-center gap-[3px]" aria-hidden="true">
          {Array.from({ length: 44 }, (_, k) => (
            <motion.span key={k} initial={{ scaleY: 0.1 }} animate={{ scaleY: 1 }} transition={{ delay: k * 0.015, duration: 0.3 }} className="min-w-0 flex-1 rounded-full bg-gradient-to-t from-cyan via-violett to-rosa" style={{ height: `${20 + ((k * 37) % 80)}%` }} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {f.werte.map(w => <span key={w} className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-white/85">{w}</span>)}
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {f.ziele.map((z, i) => {
          const S = ZS[i]
          return (
            <motion.li key={z} custom={i} variants={zeile} initial="aus" animate="an" className="flex min-w-0 items-center gap-2 rounded-xl border border-linie bg-karte px-3 py-2.5">
              <S className="size-4 shrink-0 text-cyan-tief" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text">{z}</span>
              <IconHaken className="size-4 shrink-0 text-gruen" aria-label={f.geliefert} />
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

const BILDER = [Eingabe, Recherche, Drehbuch, Stimmen, Fertig]

export default function Ablauf({ t }: { t: StartTexte }) {
  const a = t.ablauf
  const [aktiv, setAktiv] = useState(0)
  const [pausiert, setPausiert] = useState(false)
  const [schwebt, setSchwebt] = useState(false)
  const ruhig = useReducedMotion() ?? false
  const bereich = useRef<HTMLDivElement>(null)
  const imBild = useInView(bereich, { amount: 0.35 })
  const laeuft = !ruhig && !pausiert && !schwebt && imBild

  useEffect(() => {
    if (!laeuft) return
    const id = window.setTimeout(() => setAktiv(i => (i + 1) % a.schritte.length), DAUER_MS)
    return () => window.clearTimeout(id)
  }, [laeuft, aktiv, a.schritte.length])

  const Bild = BILDER[aktiv]

  return (
    <section id="ablauf" aria-labelledby="ablauf-titel" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-32">
        <AbschnittKopf id="ablauf-titel" kicker={a.kicker} titel={a.titel} titelBunt={a.titelBunt} text={a.text} />

        <div
          ref={bereich}
          className="mt-16 grid items-start gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12"
          onMouseEnter={() => setSchwebt(true)}
          onMouseLeave={() => setSchwebt(false)}
          onFocus={() => setSchwebt(true)}
          onBlur={() => setSchwebt(false)}
        >
          <div className="min-w-0">
            <ol className="relative space-y-2">
              {a.schritte.map((s, i) => {
                const an = i === aktiv
                const S = SYMBOLE[i]
                return (
                  <li key={s.titel}>
                    <button
                      type="button"
                      onClick={() => setAktiv(i)}
                      aria-current={an ? 'step' : undefined}
                      className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${an ? 'border-linie bg-karte shadow-[0_18px_40px_-24px_rgb(24_26_50/.35)]' : 'border-transparent hover:bg-karte/60'}`}
                    >
                      <span className="flex items-start gap-4">
                        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${an ? 'verlauf-grund text-white' : 'bg-karte-2 text-text-2'}`}>
                          <S className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[12px] font-bold uppercase tracking-[.14em] text-leise">{a.schrittLabel} {i + 1}</span>
                          <span className="mt-0.5 block font-display text-xl font-medium tracking-[-.02em] text-text sm:text-2xl">{s.titel}</span>
                          <AnimatePresence initial={false}>
                            {an && (
                              <motion.span
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="block overflow-hidden"
                              >
                                <span className="block pt-2 text-[15px] leading-7 text-leise">{s.text}</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                      </span>
                      {an && (
                        <motion.span
                          key={`balken-${aktiv}-${laeuft}`}
                          aria-hidden="true"
                          className="absolute bottom-0 left-0 h-[3px] verlauf-grund"
                          initial={{ width: laeuft ? '0%' : '100%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: laeuft ? DAUER_MS / 1000 : 0, ease: 'linear' }}
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
            {!ruhig && (
              <button type="button" onClick={() => setPausiert(p => !p)} className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold text-leise hover:text-text">
                {pausiert ? <IconPlay className="size-3.5" /> : <IconPause className="size-3.5" />}
                {pausiert ? a.weiter : a.anhalten}
              </button>
            )}
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgb(0_200_255/.16),transparent_55%),radial-gradient(circle_at_80%_90%,rgb(236_72_153/.13),transparent_55%)] blur-xl" />
              <div className="karte overflow-hidden !rounded-[1.6rem]">
                <div className="flex items-center gap-2 border-b border-linie bg-grund px-4 py-3">
                  <span className="size-2.5 rounded-full bg-rot/70" aria-hidden="true" />
                  <span className="size-2.5 rounded-full bg-gelb/70" aria-hidden="true" />
                  <span className="size-2.5 rounded-full bg-gruen/70" aria-hidden="true" />
                  <span className="ml-2 truncate text-[12px] font-semibold text-leise">{a.mock.fenster} · {a.schrittLabel} {aktiv + 1}/{a.schritte.length}</span>
                </div>
                <div className="min-h-[25rem] p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={aktiv}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Bild m={a.mock} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
