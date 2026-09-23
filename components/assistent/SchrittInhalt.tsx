'use client'
// Schritt ①: Weg zum Inhalt (eigene Texte / Webseiten / Recherche) und je Thema ein Block.
import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { usePortal } from '@/components/portal/Kontext'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen, locale } from '@/components/gemeinsam/format'
import { IconGlobus, IconLupe, IconMuell, IconPlus, IconText, IconKreuz } from '@/components/gemeinsam/Icons'
import type { AssistentTexte } from '@/lib/i18n/texte/assistent'
import type { UiSprache } from '@/lib/sprachen'
import { Abschnitt, Auswahl, ChipsEingabe, FeldFehler, Zaehler, fehlerId, karteKlasse, segmentKlasse } from './Bausteine'
import {
  AKTUALITAET, MAX_ORTE, MAX_THEMEN, MAX_URLS, TEXT_MAX, TEXT_MIN, feldId, neueId,
  type Quelle, type SchrittProps, type Thema,
} from './zustand'

const WEGE: { id: Quelle; Icon: typeof IconText }[] = [
  { id: 'text', Icon: IconText },
  { id: 'webseiten', Icon: IconGlobus },
  { id: 'recherche', Icon: IconLupe },
]

/** Regionen, die kein Land sind (EU, UN, Platzhalter …). */
const KEIN_LAND = new Set(['AC', 'CP', 'DG', 'EA', 'EU', 'EZ', 'IC', 'QO', 'TA', 'UN', 'XA', 'XB', 'ZZ'])

function laenderListe(ui: UiSprache) {
  const liste: { code: string; name: string }[] = []
  let dn: Intl.DisplayNames
  try { dn = new Intl.DisplayNames([ui], { type: 'region' }) } catch { return liste }
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b)
      if (KEIN_LAND.has(code)) continue
      try {
        const name = dn.of(code)
        if (name && name !== code) liste.push({ code, name })
      } catch { /* unbekannt */ }
    }
  }
  return liste.sort((x, y) => x.name.localeCompare(y.name, ui))
}

export default function SchrittInhalt({ e, setE, fehler, t, ui }: SchrittProps & { ui: UiSprache }) {
  const ti = t.inhalt
  const ruhig = useReducedMotion()
  const laender = useMemo(() => laenderListe(ui), [ui])

  const themaAendern = (id: string, f: (x: Thema) => Thema) =>
    setE(v => ({ ...v, themen: v.themen.map(x => (x.id === id ? f(x) : x)) }))

  return (
    <div className="grid min-w-0 gap-8">
      <div className="min-w-0">
        <Auswahl id={feldId.quelle} label={ti.wegLabel} werte={WEGE.map(w => w.id)} wert={e.quelle} fehler={fehler[feldId.quelle]}
          onWahl={q => setE(v => ({ ...v, quelle: q }))}
          className="grid gap-3 sm:grid-cols-3"
          knopfKlasse={karteKlasse}
          inhalt={(q, aktiv) => {
            const { Icon } = WEGE.find(w => w.id === q)!
            const w = ti.wege[q]
            return (
              <>
                <span className={`mb-1 flex size-11 items-center justify-center rounded-xl ${aktiv ? 'verlauf-grund text-white' : 'bg-cyan-hell text-cyan-tief'}`}>
                  <Icon className="size-6" />
                </span>
                <span className="font-display text-lg font-semibold text-text">{w.name}</span>
                <span className="text-sm leading-6 text-text-2">{w.text}</span>
                <span className="mt-auto pt-1 text-xs italic text-leise">{w.beispiel}</span>
              </>
            )
          }} />
        <FeldFehler id={feldId.quelle} text={fehler[feldId.quelle]} />
      </div>

      {e.quelle && (
        <Abschnitt titel={ti.themenTitel} text={ti.themenText} id="a-themen-titel">
          <div className="grid gap-4">
            {e.themen.map((th, i) => (
              <motion.div key={th.id} initial={ruhig ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className="karte min-w-0 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="font-display text-base font-semibold text-text">{fuellen(ti.thema, { n: i + 1 })}</h4>
                  {e.themen.length > 1 && (
                    <button type="button" onClick={() => setE(v => ({ ...v, themen: v.themen.filter(x => x.id !== th.id) }))}
                      aria-label={fuellen(ti.themaEntfernen, { n: i + 1 })}
                      className="inline-flex size-9 items-center justify-center rounded-full text-leise hover:bg-rot-hell hover:text-[#a32424]">
                      <IconMuell className="size-5" />
                    </button>
                  )}
                </div>
                <ThemaFelder th={th} quelle={e.quelle!} fehler={fehler} t={t} aendern={f => themaAendern(th.id, f)} />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="knopf knopf-zweit" disabled={e.themen.length >= MAX_THEMEN}
              onClick={() => {
                const id = neueId()
                setE(v => ({ ...v, themen: [...v.themen, { id, titel: '', text: '', urls: [''] }] }))
                requestAnimationFrame(() => document.getElementById(feldId.titel(id))?.focus())
              }}>
              <IconPlus className="size-4" />{ti.themaPlus}
            </button>
            <span className="hinweis">{fuellen(ti.themaMax, { n: MAX_THEMEN })}</span>
          </div>
        </Abschnitt>
      )}

      {e.quelle === 'recherche' && (
        <Abschnitt titel={ti.rechercheTitel} text={ti.rechercheText} id="a-recherche-titel">
          <div className="karte grid min-w-0 gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <div className="min-w-0">
              <label htmlFor="a-land" className="etikett">{ti.land}</label>
              <select id="a-land" className="feld" value={e.land} onChange={x => setE(v => ({ ...v, land: x.target.value }))}>
                <option value="">{ti.landKeins}</option>
                {laender.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <ChipsEingabe id="a-orte" label={`${ti.orte} (${t.optional})`} hilfe={ti.orteHilfe} platz={ti.ortePlatz} werte={e.orte} max={MAX_ORTE} maxLaenge={80}
              onAendern={o => setE(v => ({ ...v, orte: o }))} hinzuText={ti.orteHinzu} entfernenText={o => fuellen(ti.ortEntfernen, { ort: o })} maxText={ti.orteMax} />
            <div className="min-w-0 sm:col-span-2">
              <p id="a-aktualitaet-l" className="etikett">{ti.aktualitaet}</p>
              <Auswahl beschriftetVon="a-aktualitaet-l" werte={AKTUALITAET.map(a => a.h)} wert={e.aktualitaet_h}
                onWahl={h => setE(v => ({ ...v, aktualitaet_h: h }))} className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse}
                inhalt={h => ti.aktualitaetWerte[AKTUALITAET.find(a => a.h === h)!.k]} />
            </div>
          </div>
        </Abschnitt>
      )}
    </div>
  )
}

function ThemaFelder({ th, quelle, fehler, t, aendern }: {
  th: Thema; quelle: Quelle; fehler: SchrittProps['fehler']; t: AssistentTexte; aendern: (f: (x: Thema) => Thema) => void
}) {
  const { sprache } = usePortal()
  const ti = t.inhalt
  const zahl = (n: number) => n.toLocaleString(locale(sprache))
  const idTitel = feldId.titel(th.id)
  const idText = feldId.text(th.id)
  const recherche = quelle === 'recherche'
  const laenge = th.text.trim().length
  return (
    <div className="grid min-w-0 gap-4">
      <div className="min-w-0">
        <label htmlFor={idTitel} className="etikett">{recherche ? ti.rechercheLabel : ti.titelLabel}</label>
        <input id={idTitel} className="feld" value={th.titel} maxLength={200} placeholder={recherche ? ti.recherchePlatz : ti.titelPlatz}
          aria-invalid={fehler[idTitel] ? true : undefined} aria-describedby={fehler[idTitel] ? fehlerId(idTitel) : undefined}
          onChange={x => { const titel = x.target.value; aendern(v => ({ ...v, titel })) }} />
        <FeldFehler id={idTitel} text={fehler[idTitel]} />
      </div>

      {quelle === 'text' && (
        <div className="min-w-0">
          <label htmlFor={idText} className="etikett">{ti.textLabel}</label>
          <textarea id={idText} className="feld min-h-44 resize-y leading-6" rows={8} value={th.text} maxLength={TEXT_MAX} placeholder={ti.textPlatz}
            aria-invalid={fehler[idText] ? true : undefined} aria-describedby={`${idText}-zaehler${fehler[idText] ? ` ${fehlerId(idText)}` : ''}`}
            onChange={x => { const text = x.target.value; aendern(v => ({ ...v, text })) }} />
          <div id={`${idText}-zaehler`} className="mt-1 flex flex-wrap justify-between gap-2">
            <span className="text-xs text-leise">{laenge < TEXT_MIN ? fuellen(ti.textNochMin, { n: TEXT_MIN - laenge }) : ''}</span>
            <Zaehler n={th.text.length} max={TEXT_MAX} warnAb={TEXT_MAX * 0.95}
              text={fuellen(t.zeichen, { n: zahl(th.text.length), max: zahl(TEXT_MAX) })} />
          </div>
          <FeldFehler id={idText} text={fehler[idText]} />
        </div>
      )}

      {quelle === 'webseiten' && <Webseiten th={th} fehler={fehler} t={t} aendern={aendern} />}
    </div>
  )
}

interface TestErgebnis { laedt: boolean; ok?: boolean; titel?: string | null; auszug?: string | null; zeichen?: number; fehler?: string }

function quellFehler(code: string | null | undefined, q: AssistentTexte['inhalt']['quellFehler']) {
  const c = code ?? ''
  if (c === 'robots' || c === 'adresse_gesperrt' || c === 'zu_wenig_text' || c === 'http_404') return q[c]
  if (/^http_4\d\d$/.test(c)) return q.http_4xx
  if (/^http_5\d\d$/.test(c)) return q.http_5xx
  if (c.startsWith('abruf')) return q.abruf
  return q.unbekannt
}

function Webseiten({ th, fehler, t, aendern }: { th: Thema; fehler: SchrittProps['fehler']; t: AssistentTexte; aendern: (f: (x: Thema) => Thema) => void }) {
  const { g, sprache } = usePortal()
  const ti = t.inhalt
  const [tests, setTests] = useState<Record<string, TestErgebnis>>({})

  async function pruefen(url: string) {
    const u = url.trim()
    if (!u) return
    setTests(v => ({ ...v, [u]: { laedt: true } }))
    const r = await api<{ ok: boolean; fehler: string | null; titel: string | null; auszug: string | null; zeichen: number }>('/api/v1/quellen/test', { body: { url: u } })
    let erg: TestErgebnis
    if (!r.ok) erg = { laedt: false, ok: false, fehler: r.code === 'eingabe' ? t.fehler.urlFalsch : fehlerText(r.code, g.fehler) }
    else if (!r.daten.ok || !r.daten.zeichen) erg = { laedt: false, ok: false, fehler: quellFehler(r.daten.fehler ?? 'zu_wenig_text', ti.quellFehler) }
    else erg = { laedt: false, ok: true, titel: r.daten.titel, auszug: r.daten.auszug, zeichen: r.daten.zeichen }
    setTests(v => ({ ...v, [u]: erg }))
  }

  return (
    <fieldset className="min-w-0">
      <legend className="etikett">{ti.urlsLabel}</legend>
      <p className="hinweis -mt-1 mb-3">{ti.urlsHilfe}</p>
      <ul className="grid gap-3">
        {th.urls.map((url, i) => {
          const id = feldId.url(th.id, i)
          const test = tests[url.trim()]
          return (
            <li key={i} className="min-w-0">
              <label htmlFor={id} className="sr-only">{fuellen(ti.urlLabel, { n: i + 1 })}</label>
              <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap">
                <input id={id} type="url" inputMode="url" autoComplete="url" className="feld min-w-0 flex-1 basis-full sm:basis-auto" value={url} placeholder={ti.urlPlatz} maxLength={2000}
                  aria-invalid={fehler[id] ? true : undefined} aria-describedby={fehler[id] ? fehlerId(id) : undefined}
                  onChange={x => { const neu = x.target.value; aendern(v => ({ ...v, urls: v.urls.map((a, j) => (j === i ? neu : a)) })) }} />
                <button type="button" className="knopf knopf-zweit shrink-0 px-4" disabled={!url.trim() || test?.laedt} onClick={() => pruefen(url)}>
                  {test?.laedt ? ti.prueft : ti.pruefen}
                </button>
                {th.urls.length > 1 && (
                  <button type="button" aria-label={fuellen(ti.urlEntfernen, { n: i + 1 })}
                    onClick={() => aendern(v => ({ ...v, urls: v.urls.filter((_, j) => j !== i) }))}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-leise hover:bg-rot-hell hover:text-[#a32424]">
                    <IconKreuz className="size-5" />
                  </button>
                )}
              </div>
              <FeldFehler id={id} text={fehler[id]} />
              <div aria-live="polite">
                {test && !test.laedt && test.ok && (
                  <div className="mt-2 rounded-xl border border-gruen/30 bg-gruen-hell px-3 py-2 text-sm text-[#0a6e5f]">
                    <p className="break-words font-semibold">{test.titel || ti.ohneTitel}</p>
                    <p>{fuellen(ti.gelesen, { n: (test.zeichen ?? 0).toLocaleString(locale(sprache)) })}</p>
                    {test.auszug && (
                      <details className="mt-1">
                        <summary className="cursor-pointer font-medium underline-offset-2 hover:underline">{ti.auszug}</summary>
                        <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-line break-words text-text-2">{test.auszug}</p>
                      </details>
                    )}
                  </div>
                )}
                {test && !test.laedt && !test.ok && (
                  <p className="mt-2 rounded-xl border border-rot/30 bg-rot-hell px-3 py-2 text-sm text-[#a32424]">{test.fehler}</p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {th.urls.length < MAX_URLS && (
        <button type="button" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-text hover:underline"
          onClick={() => {
            const i = th.urls.length
            aendern(v => ({ ...v, urls: [...v.urls, ''] }))
            requestAnimationFrame(() => document.getElementById(feldId.url(th.id, i))?.focus())
          }}>
          <IconPlus className="size-4" />{ti.urlPlus}
        </button>
      )}
    </fieldset>
  )
}
