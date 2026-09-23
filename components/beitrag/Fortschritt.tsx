'use client'
// Große Fortschrittsanzeige, solange der Beitrag entsteht: fünf Stufen, Prozentbalken, verständliche Meldung.
import { motion, useReducedMotion } from 'framer-motion'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import { STUFEN, meldungText, stufeIndex } from '@/components/portal/anzeige'
import { fuellen } from '@/components/gemeinsam/format'
import { IconHaken, IconMail } from '@/components/gemeinsam/Icons'
import type { Beitrag } from './typen'

export default function Fortschritt({ beitrag, t, tb }: { beitrag: Beitrag; t: PortalTexte; tb: BeitragTexte }) {
  const ruhig = useReducedMotion()
  const aktiv = stufeIndex(beitrag.status, beitrag.fortschritt?.meldung)
  const prozent = Math.max(2, Math.min(100, Math.round(beitrag.fortschritt?.prozent ?? 0)))
  const meldung = meldungText(beitrag.fortschritt?.meldung, t)

  return (
    <section aria-labelledby="fortschritt-titel" className="karte overflow-hidden p-5 sm:p-7">
      <h2 id="fortschritt-titel" className="text-xl font-semibold sm:text-2xl">{tb.fortschritt.titel}</h2>

      <ol aria-label={tb.fortschritt.stufen} className="mt-5 grid gap-2 sm:grid-cols-5 sm:gap-3">
        {STUFEN.map((s, i) => {
          const zustand = i < aktiv ? 'erledigt' : i === aktiv ? 'aktiv' : 'offen'
          return (
            <li key={s} className="flex min-w-0 items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
              <span className="relative flex size-9 shrink-0 items-center justify-center">
                {zustand === 'aktiv' && !ruhig && (
                  <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-cyan/30"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
                )}
                <span className={`relative flex size-9 items-center justify-center rounded-full text-sm font-semibold ${
                  zustand === 'erledigt' ? 'bg-gruen text-white' : zustand === 'aktiv' ? 'verlauf-grund text-white' : 'border border-linie-2 bg-karte text-leise'}`}>
                  {zustand === 'erledigt' ? <IconHaken className="size-5" /> : i + 1}
                </span>
              </span>
              <span className="min-w-0">
                <span className={`block break-words text-sm font-semibold ${zustand === 'offen' ? 'text-leise' : 'text-text'}`}>{t.stufen[s]}</span>
                <span className="block text-xs text-leise">{tb.fortschritt[zustand]}</span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-6">
        <div className="h-3 w-full overflow-hidden rounded-full bg-linie" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prozent} aria-valuetext={fuellen(tb.fortschritt.prozent, { n: prozent })} aria-label={tb.fortschritt.titel}>
          <motion.div className="verlauf-grund h-full rounded-full" initial={false} animate={{ width: `${prozent}%` }} transition={ruhig ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }} />
        </div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p aria-live="polite" className="min-w-0 break-words text-base font-medium text-text">{meldung}</p>
          <p className="text-sm tabular-nums text-leise">{fuellen(tb.fortschritt.prozent, { n: prozent })}</p>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-2xl bg-grund-2 px-4 py-3 text-sm text-text-2">
        <IconMail className="mt-0.5 size-5 shrink-0 text-leise" />
        <span>{tb.fortschritt.schliessen}</span>
      </p>
    </section>
  )
}
