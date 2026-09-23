'use client'
// Kleine Bausteine des Assistenten: Auswahlgruppen (Tastatur wie Radio-Knöpfe), Fehler am Feld, Zähler, Chips, Schalter.
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { IconKreuz, IconPlus, IconWinkelUnten } from '@/components/gemeinsam/Icons'

/** Fokus auf ein Feld (per id) — ist es selbst nicht fokussierbar, dann auf das erste Bedienelement darin. */
export function fokussieren(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const ziel = el.matches('input,textarea,select,button,[tabindex]')
    ? el
    : el.querySelector<HTMLElement>('[aria-checked="true"],[tabindex="0"],button:not([disabled]),input,textarea,select')
  ziel?.focus({ preventScroll: true })
  ;(ziel ?? el).scrollIntoView({ block: 'center', behavior: 'smooth' })
}

export const fehlerId = (id: string) => `${id}-fehler`

export function FeldFehler({ id, text }: { id: string; text?: string }) {
  if (!text) return null
  return <p id={fehlerId(id)} className="mt-1.5 text-sm font-medium text-[#a32424]">{text}</p>
}

export function Zaehler({ n, max, text, warnAb }: { n: number; max: number; text: string; warnAb?: number }) {
  const zuViel = n > max
  return (
    <span className={`text-xs tabular-nums ${zuViel ? 'font-semibold text-[#a32424]' : warnAb !== undefined && n >= warnAb ? 'text-[#8a4b05]' : 'text-leise'}`}>
      {text}
    </span>
  )
}

/**
 * Auswahl wie Radio-Knöpfe: Pfeiltasten wandern und wählen, nur das gewählte Element ist per Tab erreichbar.
 * `inhalt` zeichnet jede Option (Karte, Segment …).
 */
export function Auswahl<T extends string | number>({ id, label, beschriftetVon, werte, wert, onWahl, inhalt, className = '', knopfKlasse, deaktiviert, fehler }: {
  id?: string
  label?: string
  beschriftetVon?: string
  werte: readonly T[]
  wert: T | null
  onWahl: (w: T) => void
  inhalt: (w: T, aktiv: boolean) => ReactNode
  className?: string
  knopfKlasse: (aktiv: boolean, aus: boolean) => string
  deaktiviert?: (w: T) => boolean
  fehler?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const erlaubt = werte.filter(w => !deaktiviert?.(w))
  const tabZiel = wert !== null && erlaubt.includes(wert) ? wert : erlaubt[0]

  function taste(e: KeyboardEvent<HTMLButtonElement>, w: T) {
    const vor = e.key === 'ArrowRight' || e.key === 'ArrowDown'
    const zur = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
    if (!vor && !zur && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const i = erlaubt.indexOf(w)
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? erlaubt.length - 1 : (i + (vor ? 1 : -1) + erlaubt.length) % erlaubt.length
    const neu = erlaubt[n]
    onWahl(neu)
    ref.current?.querySelector<HTMLButtonElement>(`[data-wert="${String(neu)}"]`)?.focus()
  }

  return (
    <div ref={ref} id={id} role="radiogroup" aria-label={label} aria-labelledby={beschriftetVon}
      aria-invalid={fehler ? true : undefined} aria-describedby={fehler && id ? fehlerId(id) : undefined} className={className}>
      {werte.map(w => {
        const aktiv = w === wert
        const aus = !!deaktiviert?.(w)
        return (
          <button key={String(w)} type="button" role="radio" aria-checked={aktiv} disabled={aus} data-wert={String(w)}
            tabIndex={w === tabZiel ? 0 : -1} onClick={() => onWahl(w)} onKeyDown={e => taste(e, w)} className={knopfKlasse(aktiv, aus)}>
            {inhalt(w, aktiv)}
          </button>
        )
      })}
    </div>
  )
}

/** Segment-Knöpfe (klein, nebeneinander, brechen um). */
export const segmentKlasse = (aktiv: boolean, aus: boolean) =>
  `min-h-10 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${aktiv
    ? 'border-text bg-text text-white'
    : 'border-linie-2 bg-karte text-text-2 hover:border-text'} ${aus ? 'cursor-not-allowed opacity-45 hover:border-linie-2' : ''}`

/** Große Auswahlkarten. */
export const karteKlasse = (aktiv: boolean, aus: boolean) =>
  `relative flex h-full min-w-0 flex-col items-start gap-1.5 rounded-2xl border-2 bg-karte p-4 text-left transition-[border-color,box-shadow,transform] ${aktiv
    ? 'border-cyan-tief shadow-[0_0_0_4px_var(--color-cyan-hell)]'
    : 'border-linie hover:-translate-y-px hover:border-linie-2'} ${aus ? 'cursor-not-allowed opacity-45' : ''}`

/** Kleiner Chip (Vorschlag zum Anklicken). */
export function VorschlagChip({ children, onClick, aktiv = false, label }: { children: ReactNode; onClick: () => void; aktiv?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={aktiv} aria-label={label}
      className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${aktiv ? 'border-cyan-tief bg-cyan-hell text-cyan-text' : 'border-linie bg-grund text-text-2 hover:border-linie-2 hover:bg-karte'}`}>
      {children}
    </button>
  )
}

/** Eingabe für Stichwörter/Orte als Chips (Enter oder Komma fügt hinzu). */
export function ChipsEingabe({ id, label, hilfe, platz, werte, max, maxLaenge, onAendern, hinzuText, entfernenText, maxText }: {
  id: string; label: string; hilfe: string; platz: string; werte: string[]; max: number; maxLaenge: number
  onAendern: (w: string[]) => void; hinzuText: string; entfernenText: (w: string) => string; maxText: string
}) {
  const [eingabe, setEingabe] = useState('')
  const voll = werte.length >= max
  function hinzu() {
    const w = eingabe.trim().replace(/,$/, '').trim().slice(0, maxLaenge)
    if (!w || voll) return
    if (!werte.some(x => x.toLowerCase() === w.toLowerCase())) onAendern([...werte, w])
    setEingabe('')
  }
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="etikett">{label}</label>
      {werte.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label={label}>
          {werte.map(w => (
            <li key={w} className="inline-flex max-w-full items-center gap-1 rounded-full border border-linie bg-grund-2 py-0.5 pl-3 pr-1 text-sm text-text-2">
              <span className="min-w-0 truncate">{w}</span>
              <button type="button" onClick={() => onAendern(werte.filter(x => x !== w))} aria-label={entfernenText(w)}
                className="inline-flex size-6 items-center justify-center rounded-full text-leise hover:bg-karte hover:text-text">
                <IconKreuz className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex min-w-0 gap-2">
        <input id={id} className="feld min-w-0 flex-1" value={eingabe} placeholder={platz} disabled={voll} maxLength={maxLaenge}
          aria-describedby={`${id}-hilfe`}
          onChange={e => setEingabe(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); hinzu() } }} />
        <button type="button" onClick={hinzu} disabled={voll || !eingabe.trim()} className="knopf knopf-zweit shrink-0 px-4">
          <IconPlus className="size-4" /><span className="sr-only sm:not-sr-only">{hinzuText}</span>
        </button>
      </div>
      <p id={`${id}-hilfe`} className="hinweis mt-1.5">{voll ? maxText : hilfe}</p>
    </div>
  )
}

/** Ein/Aus-Schalter (role=switch) mit Erklärung. */
export function Schalter({ an, onAendern, label, text }: { an: boolean; onAendern: (an: boolean) => void; label: string; text: ReactNode }) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button type="button" role="switch" aria-checked={an} aria-labelledby={`${id}-l`} aria-describedby={`${id}-t`} onClick={() => onAendern(!an)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${an ? 'bg-cyan-tief' : 'bg-linie-2'}`}>
        <span aria-hidden="true" className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${an ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <div className="min-w-0">
        <p id={`${id}-l`} className="font-medium text-text">{label}</p>
        <p id={`${id}-t`} className="mt-0.5 text-sm leading-6 text-leise">{text}</p>
      </div>
    </div>
  )
}

/** Aufklappbarer Bereich mit Knopf (aria-expanded). */
export function Aufklapper({ titel, text, children, anfangsOffen = false }: { titel: string; text?: string; children: ReactNode; anfangsOffen?: boolean }) {
  const [offen, setOffen] = useState(anfangsOffen)
  const id = useId()
  return (
    <div className="karte overflow-hidden">
      <button type="button" aria-expanded={offen} aria-controls={id} onClick={() => setOffen(o => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-grund sm:px-5">
        <span className="min-w-0">
          <span className="block font-display font-semibold text-text">{titel}</span>
          {text && <span className="mt-0.5 block text-sm text-leise">{text}</span>}
        </span>
        <IconWinkelUnten className={`size-5 shrink-0 text-leise transition-transform ${offen ? 'rotate-180' : ''}`} />
      </button>
      <div id={id} hidden={!offen} className="border-t border-linie px-4 py-4 sm:px-5">{children}</div>
    </div>
  )
}

/** Abschnittsüberschrift im Schritt. */
export function Abschnitt({ titel, text, children, id }: { titel: string; text?: string; children: ReactNode; id?: string }) {
  return (
    <section className="min-w-0" aria-labelledby={id}>
      <h3 id={id} className="text-lg font-semibold text-text">{titel}</h3>
      {text && <p className="mt-0.5 text-sm text-leise">{text}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}
