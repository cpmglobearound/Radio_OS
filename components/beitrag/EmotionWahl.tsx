'use client'
// Emotion wählen: farbige Chips als echte Radioknöpfe (Pfeiltasten wechseln, Tab springt in die Gruppe).
import { useId } from 'react'
import { EMOTIONEN } from '@/lib/tonalitaet'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import { emotionFarbe } from '@/components/portal/anzeige'

export default function EmotionWahl({ wert, onWahl, label, t, klein = false }: {
  wert: string; onWahl: (e: string) => void; label: string; t: PortalTexte; klein?: boolean
}) {
  const name = useId()
  return (
    <fieldset className="min-w-0">
      <legend className="etikett">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {EMOTIONEN.map(e => {
          const f = emotionFarbe(e)
          const an = wert === e
          return (
            <label key={e} className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border font-semibold transition-shadow has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-tief has-[:focus-visible]:ring-offset-1 ${klein ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} ${an ? `${f.chip} shadow-[0_0_0_2px_currentColor]` : 'border-linie bg-karte text-text-2 hover:border-linie-2'}`}>
              <input type="radio" name={name} value={e} checked={an} onChange={() => onWahl(e)} className="sr-only" />
              <span aria-hidden="true" className={`size-1.5 rounded-full ${f.punkt}`} />
              {t.emotionen[e]}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
