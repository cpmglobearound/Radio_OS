'use client'
// Dialog im Seitenstil (statt confirm/alert): natives <dialog> → Fokus bleibt im Dialog, Escape schließt.
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconKreuz } from './Icons'

export default function Dialog({ offen, onSchliessen, titel, beschreibung, children, fuss, schliessenText, breit = false, sperren = false }: {
  offen: boolean
  onSchliessen: () => void
  titel: string
  beschreibung?: ReactNode
  children?: ReactNode
  /** Knöpfe unten (rechts). */
  fuss?: ReactNode
  schliessenText: string
  breit?: boolean
  /** Während etwas läuft: Schließen per Escape/Hintergrund verhindern. */
  sperren?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (offen && !d.open) d.showModal()
    if (!offen && d.open) d.close()
  }, [offen])

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-t`}
      aria-describedby={beschreibung ? `${id}-b` : undefined}
      onCancel={e => { e.preventDefault(); if (!sperren) onSchliessen() }}
      onClick={e => { if (e.target === e.currentTarget && !sperren) onSchliessen() }}
      className={`m-auto w-[calc(100%-1.5rem)] ${breit ? 'max-w-2xl' : 'max-w-lg'} max-h-[calc(100dvh-2rem)] overflow-visible rounded-[1.25rem] border border-linie bg-karte p-0 text-text shadow-[0_30px_80px_-20px_rgb(24_26_50/.45)] backdrop:bg-text/40 backdrop:backdrop-blur-sm open:animate-[dialog-ein_.18s_ease-out]`}
    >
      <style>{'@keyframes dialog-ein{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}'}</style>
      {offen && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-linie px-5 pb-3 pt-4 sm:px-6">
            <div className="min-w-0">
              <h2 id={`${id}-t`} className="text-lg font-semibold text-text sm:text-xl">{titel}</h2>
              {beschreibung && <div id={`${id}-b`} className="mt-1 text-sm text-leise">{beschreibung}</div>}
            </div>
            <button type="button" onClick={onSchliessen} disabled={sperren} aria-label={schliessenText} className="-mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-leise hover:bg-grund-2 hover:text-text disabled:opacity-40">
              <IconKreuz className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
          {fuss && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-linie px-5 py-3 sm:px-6">{fuss}</div>}
        </div>
      )}
    </dialog>
  )
}
