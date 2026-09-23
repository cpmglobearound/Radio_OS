'use client'
import { motion } from 'framer-motion'
import { FORMATE } from '@/lib/formate'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { AbschnittKopf, Einblenden, Staffel, auftauchen } from './Bewegung'

function fuellen(vorlage: string, werte: Record<string, string | number>) {
  return vorlage.replace(/\{(\w+)\}/g, (_, k: string) => String(werte[k] ?? ''))
}

function laenge(s: number, f: StartTexte['formate']) {
  return s < 120 ? fuellen(f.sekunden, { n: s }) : fuellen(f.minuten, { n: Math.round(s / 60) })
}

export function Formate({ t }: { t: StartTexte }) {
  const f = t.formate
  return (
    <section id="formate" aria-labelledby="formate-titel" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="formate-titel" kicker={f.kicker} titel={f.titel} titelBunt={f.titelBunt} text={f.text} />
        <Staffel als="ul" className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FORMATE.map(fm => {
            const n = f.namen[fm.id]
            const stimmen = fm.sprecher_min === fm.sprecher_max
              ? (fm.sprecher_min === 1 ? f.eineStimme : fuellen(f.festStimmen, { a: fm.sprecher_min }))
              : fuellen(f.stimmen, { a: fm.sprecher_min, b: fm.sprecher_max })
            return (
              <motion.li
                key={fm.id}
                variants={auftauchen}
                whileHover={{ y: -4 }}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-linie bg-karte p-5 transition-[border-color,box-shadow] hover:border-violett/40 hover:shadow-[0_18px_40px_-24px_rgb(139_92_246/.45)]"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 verlauf-grund transition-transform duration-300 group-hover:scale-x-100" />
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-medium tracking-[-.02em] text-text">{n.name}</h3>
                  <span className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3].map(k => (
                      <span key={k} className={`size-2 rounded-full ${k <= fm.sprecher_max ? (k <= fm.sprecher_min ? 'bg-violett' : 'bg-violett/35') : 'bg-linie'}`} />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-6 text-leise">{n.text}</p>
                <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-text-2">
                  <span>{stimmen}</span>
                  <span aria-hidden="true" className="text-linie-2">·</span>
                  <span>{fuellen(f.typisch, { d: laenge(fm.laenge_standard_s, f) })}</span>
                </p>
              </motion.li>
            )
          })}
        </Staffel>
      </div>
    </section>
  )
}

export function SprachenStimmen({ t }: { t: StartTexte }) {
  const s = t.stimmen
  const LANG = ['de', 'es', 'en']
  return (
    <section id="sprachen" aria-labelledby="sprachen-titel" className="scroll-mt-20 border-y border-linie/70 bg-karte/60">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-5 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="min-w-0">
          <AbschnittKopf id="sprachen-titel" kicker={s.kicker} titel={s.titel} titelBunt={s.titelBunt} text={s.text} mittig={false} />
          <Einblenden verzoegerung={0.1} className="mt-8">
            <p className="text-[12px] font-bold uppercase tracking-[.14em] text-leise">{s.tonKopf}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {s.toene.map(ton => (
                <li key={ton} className="rounded-full border border-linie bg-karte px-3.5 py-2 text-sm font-semibold text-text-2 transition-colors hover:border-violett/40 hover:text-text">{ton}</li>
              ))}
            </ul>
          </Einblenden>
        </div>

        <div className="min-w-0 space-y-5">
          <Einblenden>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[.14em] text-leise">{s.sprachenKopf}</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {s.sprachen.map((sp, i) => (
                <motion.li
                  key={sp.name}
                  lang={LANG[i]}
                  whileHover={{ y: -4, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
                  className="karte relative min-w-0 overflow-hidden p-5"
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 verlauf-grund opacity-80" />
                  <p className="font-display text-2xl font-medium tracking-[-.03em] text-text">{sp.name}</p>
                  <p className="text-sm text-leise">{sp.land}</p>
                  <p className="mt-4 font-display text-lg font-medium text-cyan-text">{sp.gruss}</p>
                </motion.li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-leise">{s.mehr}</p>
          </Einblenden>

          <Einblenden verzoegerung={0.15}>
            <figure className="karte overflow-hidden !rounded-[1.6rem]">
              <figcaption className="border-b border-linie bg-grund px-5 py-3 text-[12px] font-bold uppercase tracking-[.14em] text-leise">{s.beispielKopf}</figcaption>
              <div className="flex gap-3 p-5">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-violett font-display font-bold text-white">{s.beispielWer.slice(0, 1)}</span>
                <div className="min-w-0">
                  <p className="text-sm"><span className="font-bold text-text">{s.beispielWer}</span></p>
                  <p className="mt-1 inline-flex rounded-md bg-rosa/10 px-2 py-0.5 text-[13px] font-semibold italic text-[#b0266f]">{s.beispielRegie}</p>
                  <p className="mt-2 text-[16px] leading-7 text-text-2">{s.beispielText}</p>
                </div>
              </div>
            </figure>
          </Einblenden>
        </div>
      </div>
    </section>
  )
}
