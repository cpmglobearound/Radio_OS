'use client'
// Drehbuch bearbeiten: je Zeile Sprecher, Emotion, Text, Regie; einfügen, löschen, verschieben. Gespeichert wird im Elternteil.
import type { Dispatch, SetStateAction } from 'react'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { fuellen } from '@/components/gemeinsam/format'
import { IconHoch, IconMuell, IconPlus, IconRunter } from '@/components/gemeinsam/Icons'
import { istFertig, sprecherFarbe } from '@/components/portal/anzeige'
import EmotionWahl from './EmotionWahl'
import { gruppieren, kleinKnopf, sprecherVon } from './Drehbuch'
import type { BeitragDaten } from './typen'

export interface EditZeile {
  /** Stabiler Schlüssel für React (auch für neue Zeilen ohne nr). */
  schluessel: string
  nr?: number
  rolle: string
  text: string
  regie: string
  emotion: string
  luecke_ms: number
  block_id: string | null
}

export const TEXT_MAX = 600
export const REGIE_MAX = 300

/** Vergleichswert ohne die React-Schlüssel — für „ungespeicherte Änderungen?". */
export const entwurfWert = (z: EditZeile[]) => JSON.stringify(z.map(({ schluessel: _s, ...rest }) => { void _s; return rest }))

const iconKnopf = 'inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-linie-2 bg-karte text-text-2 transition-colors hover:border-text hover:text-text disabled:opacity-35 disabled:hover:border-linie-2'

export default function Editor({ daten, zeilen, setZeilen, zeigeFehler, t, tb }: {
  daten: BeitragDaten
  zeilen: EditZeile[]
  setZeilen: Dispatch<SetStateAction<EditZeile[] | null>>
  zeigeFehler: boolean
  t: PortalTexte
  tb: BeitragTexte
}) {
  const sprecher = daten.beitrag.einstellungen?.sprecher ?? []
  const fertig = istFertig(daten.beitrag.status)
  const mehrereBloecke = daten.bloecke.length > 1
  const index = new Map(zeilen.map((z, i) => [z.schluessel, i]))

  function aendern(schluessel: string, teil: Partial<EditZeile>) {
    setZeilen(alt => alt && alt.map(z => (z.schluessel === schluessel ? { ...z, ...teil } : z)))
  }
  function fokus(elementId: string) {
    requestAnimationFrame(() => document.getElementById(elementId)?.focus())
  }
  function einfuegen(i: number) {
    const vorbild = zeilen[i]
    const neu: EditZeile = {
      schluessel: `neu-${crypto.randomUUID()}`, rolle: vorbild?.rolle ?? sprecher[0]?.rolle ?? 'sprecher_1',
      text: '', regie: '', emotion: 'warm', luecke_ms: 280, block_id: vorbild?.block_id ?? null,
    }
    setZeilen(alt => alt && [...alt.slice(0, i + 1), neu, ...alt.slice(i + 1)])
    fokus(`text-${neu.schluessel}`)
  }
  function loeschen(i: number) {
    const nachbar = zeilen[i + 1] ?? zeilen[i - 1]
    setZeilen(alt => alt && alt.filter((_, j) => j !== i))
    if (nachbar) fokus(`text-${nachbar.schluessel}`)
  }
  function schieben(i: number, richtung: -1 | 1, knopf: 'hoch' | 'runter') {
    const j = i + richtung
    if (j < 0 || j >= zeilen.length) return
    const z = zeilen[i]
    // An einer Blockgrenze wechselt die Zeile zuerst nur in den Nachbarblock (gleiche Stelle), sonst tauscht sie den Platz.
    const blockWechsel = mehrereBloecke && zeilen[j].block_id !== z.block_id
    setZeilen(alt => {
      if (!alt) return alt
      const neu = [...alt]
      if (blockWechsel) neu[i] = { ...alt[i], block_id: alt[j].block_id }
      else [neu[i], neu[j]] = [alt[j], alt[i]]
      return neu
    })
    const neuIndex = blockWechsel ? i : j
    const amRand = neuIndex + richtung < 0 || neuIndex + richtung >= zeilen.length
    fokus(`${amRand ? (knopf === 'hoch' ? 'runter' : 'hoch') : knopf}-${z.schluessel}`)
  }

  const leere = zeilen.filter(z => !z.text.trim()).length

  return (
    <div className="grid gap-4">
      <Hinweis art="info">
        {tb.editor.hinweis}
        {fertig && <> {tb.editor.hinweisFertig}</>}
      </Hinweis>
      {zeigeFehler && leere > 0 && <Hinweis art="fehler">{tb.editor.fehlerLeer}</Hinweis>}

      {gruppieren(zeilen, daten.bloecke).map((g, gi, gruppen) => (
        <div key={`${g.block?.id ?? 'ohne'}-${gi}`} className="grid min-w-0 gap-3">
          {mehrereBloecke && <h3 className="break-words border-b border-linie pb-2 text-lg font-semibold">{g.block?.thema ?? (gi === 0 ? tb.drehbuch.anmoderation : gi === gruppen.length - 1 ? tb.drehbuch.abmoderation : tb.drehbuch.ohneBlock)}</h3>}
          <ol className="grid gap-3">
            {g.zeilen.map(z => {
              const i = index.get(z.schluessel) ?? 0
              const nr = i + 1
              const farbe = sprecherFarbe(z.rolle)
              const leer = zeigeFehler && !z.text.trim()
              const id = z.schluessel
              return (
                <li key={id} className={`min-w-0 rounded-2xl border border-l-4 bg-karte p-4 sm:p-5 ${farbe.rand} ${leer ? 'border-rot/50' : 'border-linie'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-text-2">
                      {fuellen(tb.drehbuch.zeile, { nr })}
                      {z.nr === undefined && <span className="rounded-full bg-cyan-hell px-2 py-0.5 text-[11px] font-semibold text-cyan-text">{tb.editor.neu}</span>}
                    </p>
                    <div className="flex gap-1.5">
                      <button type="button" id={`hoch-${id}`} className={iconKnopf} disabled={i === 0} onClick={() => schieben(i, -1, 'hoch')} aria-label={fuellen(tb.editor.hoch, { nr })}>
                        <IconHoch className="size-4" />
                      </button>
                      <button type="button" id={`runter-${id}`} className={iconKnopf} disabled={i === zeilen.length - 1} onClick={() => schieben(i, 1, 'runter')} aria-label={fuellen(tb.editor.runter, { nr })}>
                        <IconRunter className="size-4" />
                      </button>
                      <button type="button" className={`${iconKnopf} hover:border-rot hover:text-[#a32424]`} disabled={zeilen.length <= 1} onClick={() => loeschen(i)}
                        aria-label={fuellen(tb.editor.loeschenLabel, { nr })} title={zeilen.length <= 1 ? tb.editor.letzte : tb.editor.loeschen}>
                        <IconMuell className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                      <div className="min-w-0">
                        <label htmlFor={`rolle-${id}`} className="etikett">{tb.editor.sprecher}</label>
                        <select id={`rolle-${id}`} className="feld" value={z.rolle} onChange={e => aendern(id, { rolle: e.target.value })}>
                          {sprecher.map(s => {
                            const sp = sprecherVon(daten, s.rolle, t)
                            return <option key={s.rolle} value={s.rolle}>{sp.funktion ? `${sp.name} (${sp.funktion})` : sp.name}</option>
                          })}
                          {!sprecher.some(s => s.rolle === z.rolle) && <option value={z.rolle}>{z.rolle}</option>}
                        </select>
                      </div>
                      <EmotionWahl wert={z.emotion} onWahl={e => aendern(id, { emotion: e })} label={tb.editor.emotion} t={t} klein />
                    </div>
                    <div>
                      <label htmlFor={`text-${id}`} className="etikett">{tb.editor.text}</label>
                      <textarea id={`text-${id}`} className={`feld min-h-24 resize-y text-base leading-7 ${leer ? 'border-rot' : ''}`} rows={3} maxLength={TEXT_MAX}
                        value={z.text} onChange={e => aendern(id, { text: e.target.value })}
                        aria-invalid={leer} aria-describedby={`zaehler-${id}${leer ? ` fehler-${id}` : ''}`} />
                      <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs">
                        <span id={`fehler-${id}`} className="text-[#a32424]">{leer ? tb.editor.leer : ''}</span>
                        <span id={`zaehler-${id}`} className={`tabular-nums ${z.text.length > TEXT_MAX - 40 ? 'text-[#8a4b05]' : 'text-leise'}`}>
                          {fuellen(tb.editor.zeichen, { n: z.text.length, max: TEXT_MAX })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`regie-${id}`} className="etikett">{tb.editor.regie}</label>
                      <input id={`regie-${id}`} className="feld text-sm" maxLength={REGIE_MAX} value={z.regie} placeholder={tb.editor.regiePlatzhalter}
                        onChange={e => aendern(id, { regie: e.target.value })} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <button type="button" className={kleinKnopf} onClick={() => einfuegen(i)} aria-label={fuellen(tb.editor.einfuegenLabel, { nr })}>
                      <IconPlus className="size-4" /> {tb.editor.einfuegen}
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </div>
  )
}
