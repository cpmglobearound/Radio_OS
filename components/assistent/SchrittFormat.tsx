'use client'
// Schritt ②: Format (Karten aus lib/formate) und Länge (Stufen innerhalb der Grenzen des Formats oder eigene Länge).
import { useState } from 'react'
import { FORMATE, formatVon, type FormatId } from '@/lib/formate'
import type { StartTexte } from '@/lib/i18n/texte/start'
import { fuellen } from '@/components/gemeinsam/format'
import { IconMikro, IconUhr } from '@/components/gemeinsam/Icons'
import { Abschnitt, Auswahl, FeldFehler, fehlerId, karteKlasse, segmentKlasse } from './Bausteine'
import { dauerText, feldId, laengenStufen, mitFormat, type SchrittProps } from './zustand'

export type FormatNamen = StartTexte['formate']['namen']

export default function SchrittFormat({ e, setE, fehler, t, formatNamen }: SchrittProps & { formatNamen: FormatNamen }) {
  const tf = t.format
  const f = formatVon(e.format)
  const stufen = f ? laengenStufen(f) : []
  const aufStufe = f ? !e.eigeneLaenge && stufen.includes(Math.round(e.laenge_min * 60)) : false
  // Eingabefeld für die eigene Länge: eigener Text, damit „1," beim Tippen nicht verschwindet.
  const [eigenText, setEigenText] = useState(() => (Number.isFinite(e.laenge_min) ? String(e.laenge_min) : ''))

  const stimmenText = (id: FormatId) => {
    const x = formatVon(id)!
    if (x.sprecher_min === x.sprecher_max) return x.sprecher_min === 1 ? tf.eineStimme : fuellen(tf.festStimmen, { a: x.sprecher_min })
    return fuellen(tf.stimmen, { a: x.sprecher_min, b: x.sprecher_max })
  }

  return (
    <div className="grid min-w-0 gap-8">
      <div className="min-w-0">
        <Auswahl id={feldId.format} label={tf.formatLabel} werte={FORMATE.map(x => x.id)} wert={(e.format || null) as FormatId | null} fehler={fehler[feldId.format]}
          onWahl={id => setE(v => mitFormat(v, id))}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" knopfKlasse={karteKlasse}
          inhalt={id => {
            const x = formatVon(id)!
            return (
              <>
                <span className="font-display text-base font-semibold text-text">{formatNamen[id].name}</span>
                <span className="text-sm leading-6 text-text-2">{formatNamen[id].text}</span>
                <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1.5 text-xs text-leise">
                  <span className="inline-flex items-center gap-1"><IconMikro className="size-3.5" />{stimmenText(id)}</span>
                  <span className="inline-flex items-center gap-1"><IconUhr className="size-3.5" />{fuellen(tf.typisch, { d: dauerText(x.laenge_standard_s, tf) })}</span>
                </span>
              </>
            )
          }} />
        <FeldFehler id={feldId.format} text={fehler[feldId.format]} />
      </div>

      <Abschnitt titel={tf.laengeTitel} id="a-laenge-titel"
        text={f ? fuellen(tf.laengeText, { a: dauerText(f.laenge_min_s, tf), b: dauerText(f.laenge_max_s, tf) }) : tf.formatZuerst}>
        {f && (
          <div id={feldId.laenge} className="grid min-w-0 gap-4">
            <Auswahl label={tf.laengeLabel} werte={[...stufen, -1]} wert={aufStufe ? Math.round(e.laenge_min * 60) : -1}
              onWahl={s => {
                if (s === -1) {
                  setEigenText(String(e.laenge_min))
                  setE(v => ({ ...v, eigeneLaenge: true }))
                  requestAnimationFrame(() => document.getElementById('a-laenge-eigen')?.focus())
                } else setE(v => ({ ...v, laenge_min: s / 60, eigeneLaenge: false }))
              }}
              className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse}
              inhalt={s => s === -1 ? tf.eigene : (
                <>
                  {dauerText(s, tf)}
                  {s === f.laenge_standard_s && <span className="ml-1.5 text-xs opacity-75">· {tf.typischKurz}</span>}
                </>
              )} />
            {!aufStufe && (
              <div className="max-w-xs">
                <label htmlFor="a-laenge-eigen" className="etikett">{tf.eigeneLabel}</label>
                <input id="a-laenge-eigen" type="number" inputMode="decimal" step={0.25} className="feld"
                  min={Math.max(0.25, f.laenge_min_s / 60)} max={Math.min(120, f.laenge_max_s / 60)} value={eigenText}
                  aria-invalid={fehler[feldId.laenge] ? true : undefined}
                  aria-describedby={`a-laenge-eigen-hilfe${fehler[feldId.laenge] ? ` ${fehlerId(feldId.laenge)}` : ''}`}
                  onChange={x => {
                    const roh = x.target.value
                    setEigenText(roh)
                    const n = Number(roh.replace(',', '.'))
                    setE(v => ({ ...v, eigeneLaenge: true, laenge_min: roh.trim() && Number.isFinite(n) ? n : NaN }))
                  }} />
                <p id="a-laenge-eigen-hilfe" className="hinweis mt-1.5">{tf.eigeneHilfe}</p>
              </div>
            )}
            <FeldFehler id={feldId.laenge} text={fehler[feldId.laenge]} />
          </div>
        )}
      </Abschnitt>
    </div>
  )
}
