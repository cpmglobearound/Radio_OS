'use client'
import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { AbschnittKopf, Staffel, auftauchen } from './Bewegung'
import { IconPlus } from './Icons'

export default function Fragen({ t }: { t: StartTexte }) {
  const f = t.fragen
  const [offen, setOffen] = useState<number | null>(0)
  const basis = useId()

  return (
    <section id="fragen" aria-labelledby="fragen-titel" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-5 lg:px-8 lg:py-28">
        <AbschnittKopf id="fragen-titel" kicker={f.kicker} titel={f.titel} />
        <Staffel className="mx-auto mt-14 max-w-3xl space-y-3">
          {f.liste.map((q, i) => {
            const auf = offen === i
            const knopfId = `${basis}-k${i}`
            const feldId = `${basis}-f${i}`
            return (
              <motion.div key={q.f} variants={auftauchen} className={`rounded-2xl border bg-karte transition-[border-color,box-shadow] ${auf ? 'border-violett/35 shadow-[0_18px_40px_-26px_rgb(139_92_246/.5)]' : 'border-linie'}`}>
                <h3>
                  <button
                    type="button"
                    id={knopfId}
                    aria-expanded={auf}
                    aria-controls={feldId}
                    onClick={() => setOffen(auf ? null : i)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-display text-lg font-medium tracking-[-.02em] text-text sm:px-6 sm:py-5 sm:text-xl"
                  >
                    <span className="min-w-0">{q.f}</span>
                    <motion.span animate={{ rotate: auf ? 45 : 0 }} transition={{ duration: 0.25 }} className={`flex size-8 shrink-0 items-center justify-center rounded-full ${auf ? 'verlauf-grund text-white' : 'bg-karte-2 text-text-2'}`}>
                      <IconPlus className="size-4" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {auf && (
                    <motion.div
                      id={feldId}
                      role="region"
                      aria-labelledby={knopfId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[16px] leading-7 text-leise sm:px-6 sm:pb-6">{q.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </Staffel>
      </div>
    </section>
  )
}
