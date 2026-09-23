'use client'
import { motion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { AbschnittKopf, Staffel, auftauchen } from './Bewegung'
import { IconGlobus, IconLupe, IconText } from './Icons'

const WEG_SYMBOLE = [IconText, IconGlobus, IconLupe]
const WEG_FARBEN = ['from-cyan/25', 'from-violett/25', 'from-rosa/25']

export function DreiWege({ t }: { t: StartTexte }) {
  const w = t.wege
  return (
    <section id="wege" aria-labelledby="wege-titel" className="scroll-mt-20 border-y border-linie/70 bg-karte/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="wege-titel" kicker={w.kicker} titel={w.titel} titelBunt={w.titelBunt} text={w.text} />
        <Staffel als="ol" className="mt-16 grid gap-5 md:grid-cols-3">
          {w.liste.map((weg, i) => {
            const S = WEG_SYMBOLE[i]
            return (
              <motion.li
                key={weg.titel}
                variants={auftauchen}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-[1.8rem] border border-linie bg-karte p-7 shadow-[0_1px_2px_rgb(24_26_50/.04),0_8px_24px_-12px_rgb(24_26_50/.08)] transition-shadow hover:shadow-[0_24px_50px_-24px_rgb(24_26_50/.3)]"
              >
                <div aria-hidden="true" className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br ${WEG_FARBEN[i]} to-transparent opacity-70 blur-2xl transition-opacity group-hover:opacity-100`} />
                <div className="relative flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-linie bg-grund text-cyan-tief"><S className="size-5" /></span>
                  <span className="font-display text-5xl font-medium tracking-[-.05em] text-linie-2" aria-hidden="true">{i + 1}</span>
                </div>
                <h3 className="relative mt-7 font-display text-3xl font-medium tracking-[-.03em] text-text">{weg.titel}</h3>
                <p className="relative mt-3 text-[15px] leading-7 text-leise">{weg.text}</p>
                <div className="relative mt-auto pt-6">
                  <div className="rounded-xl border border-dashed border-linie-2 bg-grund px-3.5 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-leise">{weg.beispielKopf}</p>
                    <p className="mt-1 break-words text-[14px] font-medium text-text-2">{weg.beispiel}</p>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </Staffel>
      </div>
    </section>
  )
}

const PUNKT = ['bg-gradient-to-br from-cyan to-violett', 'bg-gradient-to-br from-violett to-rosa', 'bg-gradient-to-br from-rosa to-cyan']

export function Sprecher({ t }: { t: StartTexte }) {
  const s = t.sprecher
  return (
    <section id="stimmen-zahl" aria-labelledby="sprecher-titel" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="sprecher-titel" kicker={s.kicker} titel={s.titel} titelBunt={s.titelBunt} text={s.text} />
        <Staffel className="mt-16 grid gap-5 lg:grid-cols-3">
          {s.karten.map(k => (
            <motion.article
              key={k.zahl}
              variants={auftauchen}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="karte flex min-w-0 flex-col !rounded-[1.8rem] p-7"
            >
              <div className="flex items-baseline gap-3">
                <span className="verlauf-text font-display text-7xl font-medium leading-none tracking-[-.06em]">{k.zahl}</span>
                <div className="flex -space-x-1.5" aria-hidden="true">
                  {Array.from({ length: Number(k.zahl) }, (_, i) => (
                    <span key={i} className={`size-5 rounded-full border-2 border-karte ${PUNKT[i]}`} />
                  ))}
                </div>
              </div>
              <h3 className="mt-5 font-display text-3xl font-medium tracking-[-.03em] text-text">{k.titel}</h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[.12em] text-cyan-text">{k.wirkung}</p>
              <p className="mt-4 text-[15px] leading-7 text-leise">{k.fuer}</p>
              <div className="mt-auto space-y-2 pt-6">
                {k.zeilen.map((z, i) => (
                  <div key={i} className={`flex gap-2.5 ${i % 2 === 1 ? 'flex-row-reverse text-right' : ''}`}>
                    <span className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${PUNKT[i]}`} aria-hidden="true">{z.wer.slice(0, 1)}</span>
                    <p className={`min-w-0 rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${i % 2 === 1 ? 'rounded-tr-md bg-text text-white' : 'rounded-tl-md bg-karte-2 text-text-2'}`}>
                      <span className={`block text-[11px] font-bold ${i % 2 === 1 ? 'text-white/70' : 'text-leise'}`}>{z.wer}</span>
                      {z.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </Staffel>
      </div>
    </section>
  )
}
