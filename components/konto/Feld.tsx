'use client'
// Eingabefeld mit Label, Hinweis und Fehler direkt am Feld (aria-invalid + aria-describedby).
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

/** IDs für Hinweis/Fehler — Fehler zuerst, damit er zuerst vorgelesen wird. */
export function beschreibung(id: string, fehler?: string | null, hinweis?: ReactNode) {
  const teile = [fehler ? `${id}-fehler` : '', hinweis ? `${id}-hinweis` : ''].filter(Boolean)
  return teile.length ? teile.join(' ') : undefined
}

export function FeldRahmen({ id, label, fehler, hinweis, zusatz, children }: {
  id: string
  label: ReactNode
  fehler?: string | null
  hinweis?: ReactNode
  /** Rechts neben dem Label, z. B. ein Link „Passwort vergessen?". */
  zusatz?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <label htmlFor={id} className="etikett">{label}</label>
        {zusatz && <div className="mb-[.35rem] text-sm">{zusatz}</div>}
      </div>
      {children}
      {fehler && <p id={`${id}-fehler`} className="mt-1.5 text-sm font-medium text-[#a32424]">{fehler}</p>}
      {hinweis && <div id={`${id}-hinweis`} className="hinweis mt-1.5">{hinweis}</div>}
    </div>
  )
}

export default function Feld({ label, fehler, hinweis, zusatz, id: eigeneId, className = '', ...rest }: {
  label: ReactNode
  fehler?: string | null
  hinweis?: ReactNode
  zusatz?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId()
  const id = eigeneId ?? auto
  return (
    <FeldRahmen id={id} label={label} fehler={fehler} hinweis={hinweis} zusatz={zusatz}>
      <input
        id={id}
        aria-invalid={fehler ? true : undefined}
        aria-describedby={beschreibung(id, fehler, hinweis)}
        className={`feld ${fehler ? '!border-rot' : ''} ${className}`}
        {...rest}
      />
    </FeldRahmen>
  )
}
