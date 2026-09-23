'use client'
// Animierter Fortschrittsbalken eines laufenden Beitrags, darunter (optional) der Satz, was gerade passiert.
import { motion, useReducedMotion } from 'framer-motion'
import { meldungText } from '@/components/portal/anzeige'
import { usePortal } from '@/components/portal/Kontext'
import type { UebersichtTexte } from '@/lib/i18n/texte/uebersicht'
import { prozent, type BeitragKurz } from './daten'

export default function Fortschritt({ b, u, klein = false }: { b: BeitragKurz; u: UebersichtTexte; klein?: boolean }) {
  const { t } = usePortal()
  const ruhig = useReducedMotion()
  const p = prozent(b)
  const satz = meldungText(b.fortschritt?.meldung, t)
  return (
    <div className="min-w-0">
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p} aria-valuetext={`${p} % — ${satz}`} aria-label={u.beitrag.fortschritt}
        className={`relative overflow-hidden rounded-full bg-grund-2 ${klein ? 'h-1.5' : 'h-2.5'}`}>
        <motion.div className="verlauf-grund absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: `${p}%` }}
          transition={ruhig ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}>
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/30 motion-safe:animate-pulse" />
        </motion.div>
      </div>
      {!klein && (
        <p className="mt-2 flex items-baseline justify-between gap-3 text-sm text-leise">
          <span className="min-w-0 break-words" aria-live="polite">{satz}</span>
          <span className="shrink-0 font-semibold tabular-nums text-text-2">{p} %</span>
        </p>
      )}
    </div>
  )
}
