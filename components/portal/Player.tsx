'use client'
// Beitrags-Player: Abspielen/Anhalten, ±10 s, Fortschrittsbalken mit Kapitel-Marken, Zeit, volle Tastaturbedienung.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import { mmss } from '@/components/gemeinsam/format'
import { IconPause, IconPlay, IconVor10, IconZurueck10 } from '@/components/gemeinsam/Icons'

export interface Kapitel { start_s: number; titel: string }

export default function Player({ quelle, titel, laenge, kapitel = [], t, kompakt = false }: {
  quelle: string; titel: string; laenge?: number | null; kapitel?: Kapitel[]; t: GemeinsamTexte['player']; kompakt?: boolean
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const [spielt, setSpielt] = useState(false)
  const [pos, setPos] = useState(0)
  const [dauer, setDauer] = useState(laenge ?? 0)
  const [fehler, setFehler] = useState(false)
  const anteil = dauer > 0 ? Math.min(1, pos / dauer) : 0

  useEffect(() => {
    const a = audio.current
    if (!a) return
    const zeit = () => setPos(a.currentTime)
    const meta = () => { if (Number.isFinite(a.duration) && a.duration > 0) setDauer(a.duration) }
    const an = () => setSpielt(true)
    const aus = () => setSpielt(false)
    const kaputt = () => { setFehler(true); setSpielt(false) }
    a.addEventListener('timeupdate', zeit)
    a.addEventListener('loadedmetadata', meta)
    a.addEventListener('play', an)
    a.addEventListener('pause', aus)
    a.addEventListener('ended', aus)
    a.addEventListener('error', kaputt)
    return () => {
      a.removeEventListener('timeupdate', zeit)
      a.removeEventListener('loadedmetadata', meta)
      a.removeEventListener('play', an)
      a.removeEventListener('pause', aus)
      a.removeEventListener('ended', aus)
      a.removeEventListener('error', kaputt)
    }
  }, [])

  // Nur ein Ton gleichzeitig im Portal.
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
    const ziel = Math.max(0, Math.min(dauer || a.duration || 0, s))
    a.currentTime = ziel
    setPos(ziel)
  }
  function taste(e: KeyboardEvent<HTMLDivElement>) {
    const tasten: Record<string, () => void> = {
      ArrowRight: () => springen(pos + 5), ArrowUp: () => springen(pos + 5),
      ArrowLeft: () => springen(pos - 5), ArrowDown: () => springen(pos - 5),
      PageUp: () => springen(pos + 30), PageDown: () => springen(pos - 30),
      Home: () => springen(0), End: () => springen(dauer), ' ': umschalten, Enter: umschalten,
    }
    const f = tasten[e.key]
    if (f) { e.preventDefault(); f() }
  }

  const aktKapitel = [...kapitel].reverse().find(k => pos >= k.start_s)

  return (
    <div className="min-w-0">
      <audio ref={audio} src={quelle} preload="metadata" />
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.button
          type="button" onClick={umschalten} disabled={fehler} whileTap={{ scale: 0.92 }}
          aria-label={`${spielt ? t.anhalten : t.abspielen}: ${titel}`}
          className={`relative flex shrink-0 items-center justify-center rounded-full bg-text text-white shadow-[0_14px_30px_-12px_rgb(139_92_246/.7)] transition-transform hover:-translate-y-0.5 disabled:opacity-40 ${kompakt ? 'size-11' : 'size-14'}`}
        >
          {spielt ? <IconPause className="size-5" /> : <IconPlay className="ml-0.5 size-5" />}
        </motion.button>
        {!kompakt && (
          <button type="button" onClick={() => springen(pos - 10)} aria-label={t.zurueck} className="hidden size-10 shrink-0 items-center justify-center rounded-full text-leise hover:bg-grund-2 hover:text-text sm:inline-flex">
            <IconZurueck10 className="size-6" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div
            role="slider" tabIndex={0}
            aria-label={`${t.position}: ${titel}`}
            aria-valuemin={0} aria-valuemax={Math.round(dauer)} aria-valuenow={Math.round(pos)}
            aria-valuetext={`${mmss(pos)} ${t.von} ${mmss(dauer)}`}
            onKeyDown={taste}
            onClick={e => { const r = e.currentTarget.getBoundingClientRect(); springen(((e.clientX - r.left) / r.width) * dauer) }}
            className="group relative flex h-8 cursor-pointer items-center"
          >
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-linie">
              <div className="verlauf-grund absolute inset-y-0 left-0 rounded-full" style={{ width: `${anteil * 100}%` }} />
            </div>
            {dauer > 0 && kapitel.filter(k => k.start_s > 0.5).map(k => (
              <span key={`${k.start_s}-${k.titel}`} aria-hidden="true" title={k.titel} className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded bg-text/60" style={{ left: `${Math.min(100, (k.start_s / dauer) * 100)}%` }} />
            ))}
            <span aria-hidden="true" className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-text shadow transition-transform group-hover:scale-110" style={{ left: `${anteil * 100}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs font-medium tabular-nums text-leise">
            <span>{mmss(pos)}</span>
            {aktKapitel && kapitel.length > 1 && <span className="min-w-0 truncate text-text-2">{aktKapitel.titel}</span>}
            <span>{mmss(dauer)}</span>
          </div>
        </div>
        {!kompakt && (
          <button type="button" onClick={() => springen(pos + 10)} aria-label={t.vor} className="hidden size-10 shrink-0 items-center justify-center rounded-full text-leise hover:bg-grund-2 hover:text-text sm:inline-flex">
            <IconVor10 className="size-6" />
          </button>
        )}
      </div>
      <p className="sr-only">{t.tasten}</p>
      {!kompakt && kapitel.length > 1 && (
        <nav aria-label={t.kapitel} className="mt-3">
          <ol className="flex flex-wrap gap-1.5">
            {kapitel.map((k, i) => (
              <li key={`${k.start_s}-${i}`} className="min-w-0 max-w-full">
                <button type="button" onClick={() => { springen(k.start_s); audio.current?.play().catch(() => setFehler(true)) }}
                  className={`flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${aktKapitel === k ? 'border-text bg-text text-white' : 'border-linie bg-karte text-text-2 hover:border-linie-2'}`}>
                  <span className="tabular-nums opacity-70">{mmss(k.start_s)}</span>
                  <span className="truncate">{k.titel}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {fehler && <p role="status" className="mt-3 rounded-xl border border-gelb/30 bg-gelb-hell px-3 py-2 text-sm text-text-2">{t.fehler}</p>}
    </div>
  )
}
