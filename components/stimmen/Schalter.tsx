'use client'
// Ein/Aus-Schalter (role="switch", aria-checked) mit sichtbarer Beschriftung. Tastatur: Leertaste/Enter wie jeder Knopf.
import { useId, type ReactNode } from 'react'

export default function Schalter({ an, onWechsel, label, hilfe, deaktiviert = false, klein = false, className = '' }: {
  an: boolean
  onWechsel: (an: boolean) => void
  label: ReactNode
  hilfe?: ReactNode
  deaktiviert?: boolean
  klein?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={`flex min-w-0 items-start gap-2.5 ${className}`}>
      <button
        id={`${id}-b`}
        type="button"
        role="switch"
        aria-checked={an}
        aria-labelledby={`${id}-l`}
        aria-describedby={hilfe ? `${id}-h` : undefined}
        disabled={deaktiviert}
        onClick={() => onWechsel(!an)}
        className={`relative mt-0.5 inline-flex shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-tief disabled:cursor-not-allowed disabled:opacity-50 ${klein ? 'h-5 w-9' : 'h-6 w-11'} ${an ? 'bg-cyan-tief' : 'bg-linie-2'}`}
      >
        <span aria-hidden="true" className={`inline-block rounded-full bg-white shadow transition-transform ${klein ? 'size-4' : 'size-5'} ${an ? (klein ? 'translate-x-[18px]' : 'translate-x-[22px]') : 'translate-x-0.5'}`} />
      </button>
      <div className="min-w-0">
        <label id={`${id}-l`} htmlFor={`${id}-b`} className={`block cursor-pointer break-words text-text-2 ${klein ? 'text-[13px]' : 'text-sm'} font-medium`}>{label}</label>
        {hilfe && <span id={`${id}-h`} className="block break-words text-xs text-leise">{hilfe}</span>}
      </div>
    </div>
  )
}
