'use client'
// Kleiner ▶-Knopf (Listen, Zeilen, Hörproben). Lädt den Ton erst beim ersten Klick. Nur ein Ton gleichzeitig.
import { useEffect, useRef, useState } from 'react'
import { IconPause, IconPlay } from '@/components/gemeinsam/Icons'

export default function HoerKnopf({ quelle, label, anhaltenLabel, groesse = 'mittel', onFehler, className = '' }: {
  quelle: string; label: string; anhaltenLabel: string; groesse?: 'klein' | 'mittel'; onFehler?: () => void; className?: string
}) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [spielt, setSpielt] = useState(false)
  const [laedt, setLaedt] = useState(false)

  useEffect(() => {
    const anderer = (e: Event) => { if (ref.current && e.target !== ref.current) ref.current.pause() }
    document.addEventListener('play', anderer, true)
    return () => { document.removeEventListener("play", anderer, true); const a = ref.current; a?.pause(); a?.remove() }
  }, [])

  function umschalten() {
    let a = ref.current
    if (!a || a.src !== new URL(quelle, location.href).href) {
      a?.pause()
      a = new Audio(quelle)
      a.addEventListener('play', () => { setSpielt(true); setLaedt(false) })
      a.addEventListener('pause', () => setSpielt(false))
      a.addEventListener('ended', () => setSpielt(false))
      a.addEventListener('error', () => { setSpielt(false); setLaedt(false); onFehler?.() })
      document.body.appendChild(a)   // damit der „nur ein Ton"-Wächter das play-Ereignis sieht
      ref.current = a
    }
    if (a.paused) { setLaedt(true); a.play().catch(() => { setLaedt(false); onFehler?.() }) } else a.pause()
  }

  const g = groesse === 'klein' ? 'size-8' : 'size-10'
  return (
    <button type="button" onClick={umschalten} aria-label={spielt ? anhaltenLabel : label} aria-pressed={spielt}
      className={`inline-flex ${g} shrink-0 items-center justify-center rounded-full transition-colors ${spielt ? 'bg-text text-white' : 'border border-linie-2 bg-karte text-text hover:border-text'} ${laedt ? 'animate-pulse' : ''} ${className}`}>
      {spielt ? <IconPause className="size-4" /> : <IconPlay className="ml-0.5 size-4" />}
    </button>
  )
}
