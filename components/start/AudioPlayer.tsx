'use client'
// Eigener Player: Abspielen/Anhalten, Wellenform als Fortschritt (klick- und tastaturbedienbar), Zeit.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IconPause, IconPlay } from './Icons'

export interface PlayerTexte {
  abspielen: string
  anhalten: string
  position: string
  von: string
  fehler: string
  tasten: string
}

function zeit(s: number) {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** Feste, aber lebendig wirkende Balkenhöhen je Beitrag (gleich auf Server und im Browser). */
function balken(saat: string, anzahl: number) {
  let h = 2166136261
  for (const c of saat) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const werte: number[] = []
  for (let i = 0; i < anzahl; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    const zufall = ((h >>> 0) % 1000) / 1000
    const huelle = 0.55 + 0.45 * Math.sin((i / anzahl) * Math.PI * 3.2 + 0.6) ** 2
    werte.push(Math.max(0.14, Math.min(1, (0.25 + zufall * 0.75) * huelle)))
  }
  return werte
}

export default function AudioPlayer({ quelle, titel, laenge, t, saat }: { quelle: string; titel: string; laenge: number; t: PlayerTexte; saat: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [spielt, setSpielt] = useState(false)
  const [pos, setPos] = useState(0)
  const [dauer, setDauer] = useState(laenge)
  const [fehler, setFehler] = useState(false)
  const ruhig = useReducedMotion() ?? false
  const werte = useMemo(() => balken(saat, 64), [saat])
  const anteil = dauer > 0 ? Math.min(1, pos / dauer) : 0

  useEffect(() => {
    const a = audio.current
    if (!a) return
    const zeitAkt = () => setPos(a.currentTime)
    const meta = () => { if (Number.isFinite(a.duration) && a.duration > 0) setDauer(a.duration) }
    const an = () => setSpielt(true)
    const aus = () => setSpielt(false)
    const kaputt = () => { setFehler(true); setSpielt(false) }
    a.addEventListener('timeupdate', zeitAkt)
    a.addEventListener('loadedmetadata', meta)
    a.addEventListener('play', an)
    a.addEventListener('pause', aus)
    a.addEventListener('ended', aus)
    a.addEventListener('error', kaputt)
    return () => {
      a.removeEventListener('timeupdate', zeitAkt)
      a.removeEventListener('loadedmetadata', meta)
      a.removeEventListener('play', an)
      a.removeEventListener('pause', aus)
      a.removeEventListener('ended', aus)
      a.removeEventListener('error', kaputt)
    }
  }, [])

  // Nur ein Beispiel gleichzeitig: startet ein anderer Player, hält dieser an.
  useEffect(() => {
    const anderer = (e: Event) => { if (e.target !== audio.current) audio.current?.pause() }
    document.addEventListener('play', anderer, true)
    return () => document.removeEventListener('play', anderer, true)
  }, [])

  function umschalten() {
    const a = audio.current
    if (!a) return
    if (a.paused) a.play().catch(() => setFehler(true))
    else a.pause()
  }

  function springen(s: number) {
    const a = audio.current
    if (!a) return
    const ziel = Math.max(0, Math.min(dauer || 0, s))
    a.currentTime = ziel
    setPos(ziel)
  }

  function taste(e: KeyboardEvent<HTMLDivElement>) {
    const tasten: Record<string, () => void> = {
      ArrowRight: () => springen(pos + 5),
      ArrowUp: () => springen(pos + 5),
      ArrowLeft: () => springen(pos - 5),
      ArrowDown: () => springen(pos - 5),
      PageUp: () => springen(pos + 30),
      PageDown: () => springen(pos - 30),
      Home: () => springen(0),
      End: () => springen(dauer),
      ' ': umschalten,
      Enter: umschalten,
    }
    const f = tasten[e.key]
    if (f) { e.preventDefault(); f() }
  }

  const hinweisId = `${saat}-tasten`

  return (
    <div className="min-w-0">
      <audio ref={audio} src={quelle} preload="metadata" />
      <div className="flex items-center gap-4 sm:gap-5">
        <motion.button
          type="button"
          onClick={umschalten}
          disabled={fehler}
          whileTap={{ scale: 0.92 }}
          aria-label={`${spielt ? t.anhalten : t.abspielen}: ${titel}`}
          className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-text text-white shadow-[0_14px_30px_-12px_rgb(139_92_246/.7)] transition-transform hover:-translate-y-0.5 disabled:opacity-40 sm:size-16"
        >
          {spielt && !ruhig && <span className="absolute inset-0 animate-ping rounded-full bg-violett/25" aria-hidden="true" />}
          {spielt ? <IconPause className="relative size-6" /> : <IconPlay className="relative ml-1 size-6" />}
        </motion.button>

        <div className="min-w-0 flex-1">
          <div
            role="slider"
            tabIndex={0}
            aria-label={`${t.position}: ${titel}`}
            aria-valuemin={0}
            aria-valuemax={Math.round(dauer)}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${zeit(pos)} ${t.von} ${zeit(dauer)}`}
            aria-describedby={hinweisId}
            onKeyDown={taste}
            onClick={e => {
              const r = e.currentTarget.getBoundingClientRect()
              springen(((e.clientX - r.left) / r.width) * dauer)
            }}
            className="group relative flex h-16 cursor-pointer items-center gap-[2px] rounded-xl px-1 sm:gap-[3px]"
          >
            {werte.map((w, i) => {
              const gespielt = i / werte.length < anteil
              return (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className={`min-w-0 flex-1 rounded-full transition-colors duration-200 ${gespielt ? 'bg-gradient-to-t from-cyan-tief via-violett to-rosa' : 'bg-linie-2 group-hover:bg-leise/40'}`}
                  style={{ height: `${Math.round(w * 100)}%`, originY: 0.5 }}
                  animate={spielt && !ruhig ? { scaleY: [1, 0.55 + ((i * 7) % 5) / 10, 1.08, 1] } : { scaleY: 1 }}
                  transition={spielt && !ruhig ? { duration: 0.8 + (i % 6) * 0.11, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                />
              )
            })}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-medium tabular-nums text-leise">
            <span>{zeit(pos)}</span>
            <span>{zeit(dauer)}</span>
          </div>
        </div>
      </div>
      <p id={hinweisId} className="sr-only">{t.tasten}</p>
      {fehler && <p role="status" className="mt-3 rounded-xl border border-gelb/30 bg-gelb-hell px-3 py-2 text-sm text-text-2">{t.fehler}</p>}
    </div>
  )
}
