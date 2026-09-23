'use client'
// Seite „Stimmen": alle freigegebenen Stimmen einer Ausgabesprache anhören, filtern,
// eigenen Text vorlesen lassen und zwei Stimmen als Paar im Musterdialog hören (07 §3).
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AUSGABESPRACHEN, sprachName } from '@/lib/sprachen'
import { musterFuer, type StimmenTexte } from '@/lib/i18n/texte/stimmen'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { IconFunken, IconKreuz, IconLachen, IconMikro, IconPlay, IconPlus, IconFilter, IconGlobus } from '@/components/gemeinsam/Icons'
import HoerKnopf from '@/components/portal/HoerKnopf'
import { usePortal } from '@/components/portal/Kontext'
import Schalter from './Schalter'
import { blobAbspielen, probeHolen } from './probe'

export interface KatalogStimme {
  id: string
  name: string
  anbieter: string
  geschlecht: 'weiblich' | 'maennlich' | 'neutral' | null
  alter: 'jung' | 'mittel' | 'reif' | null
  stil: string[]
  kann_lachen: boolean
  klassen_faktor: number
  sprachen: string[]
  hoerprobe_url: string | null
}

type Daten = { sprache: string; stimmen: KatalogStimme[] } | { sprache: string; fehler: string }
type Geschlecht = 'alle' | 'weiblich' | 'maennlich' | 'neutral'
type Ton =
  | { art: 'text'; id: string; phase: 'laedt' | 'spielt' }
  | { art: 'paar'; schritt: 0 | 1; phase: 'laedt' | 'spielt' }
type Meldung = { art: 'fehler' | 'info' | 'erfolg'; text: string }

const MAX_TEXT = 200
const AKTIV = AUSGABESPRACHEN.filter(s => s.aktiv)
const istLive = (id: string) => id.startsWith('openai-live:')

export default function StimmenKatalog({ t }: { t: StimmenTexte }) {
  const { sprache: ui, g, darfBearbeiten } = usePortal()
  const ruhig = useReducedMotion()
  const textId = useId()

  const [sprache, setSprache] = useState(() => (AKTIV.find(s => s.basis === ui) ?? AKTIV[0])?.code ?? 'de-DE')
  const [daten, setDaten] = useState<Daten | null>(null)
  const [versuch, setVersuch] = useState(0)
  const [geschlecht, setGeschlecht] = useState<Geschlecht>('alle')
  const [nurLachen, setNurLachen] = useState(false)
  const [anbieter, setAnbieter] = useState('')
  const [text, setText] = useState(() => musterFuer(sprache).beispiel)
  const [paar, setPaar] = useState<string[]>([])
  const [ton, setTon] = useState<Ton | null>(null)
  const [meldung, setMeldung] = useState<Meldung | null>(null)
  const lauf = useRef<AbortController | null>(null)

  // Stimmen der gewählten Sprache laden (setState nur im Callback).
  useEffect(() => {
    let aus = false
    api<{ stimmen: KatalogStimme[] }>(`/api/v1/stimmen?sprache=${encodeURIComponent(sprache)}`).then(r => {
      if (aus) return
      setDaten(r.ok ? { sprache, stimmen: r.daten.stimmen } : { sprache, fehler: r.code })
    })
    return () => { aus = true }
  }, [sprache, versuch])

  // Beim Verlassen der Seite laufenden Ton beenden.
  useEffect(() => () => lauf.current?.abort(), [])

  const aktuell = daten && daten.sprache === sprache ? daten : null
  const alleStimmen = aktuell && 'stimmen' in aktuell
    ? [...aktuell.stimmen].sort((a, b) => Number(istLive(b.id)) - Number(istLive(a.id)))
    : []
  const anbieterListe = [...new Set(alleStimmen.map(s => s.anbieter))].sort()
  const anbieterAktiv = anbieter && anbieterListe.includes(anbieter) ? anbieter : ''
  const gefiltert = alleStimmen.filter(s =>
    (geschlecht === 'alle' || s.geschlecht === geschlecht) && (!nurLachen || s.kann_lachen) && (!anbieterAktiv || s.anbieter === anbieterAktiv))
  const filterAktiv = geschlecht !== 'alle' || nurLachen || !!anbieterAktiv
  const paarGueltig = paar.filter(id => alleStimmen.some(s => s.id === id))
  const stimmeA = alleStimmen.find(s => s.id === paarGueltig[0])
  const stimmeB = alleStimmen.find(s => s.id === paarGueltig[1])
  const textOk = text.trim().length >= 2
  const nameVon = (id: string) => alleStimmen.find(s => s.id === id)?.name ?? ''

  function spracheWechseln(code: string) {
    if (code === sprache) return
    stoppen()
    // Unveränderter Beispielsatz folgt der Sprache; eigener Text bleibt.
    if (text === musterFuer(sprache).beispiel) setText(musterFuer(code).beispiel)
    setSprache(code)
    setMeldung(null)
  }

  function filterZuruecksetzen() {
    setGeschlecht('alle'); setNurLachen(false); setAnbieter('')
  }

  function stoppen() {
    lauf.current?.abort()
    lauf.current = null
    setTon(null)
  }

  function probeFehler(code: string) {
    return (t.fehler as Record<string, string>)[code] ?? fehlerText(code, g.fehler)
  }

  /** Startet einen neuen Ablauf; gibt den Controller und eine Prüfung „bin ich noch dran?" zurück. */
  function neuerLauf() {
    lauf.current?.abort()
    const c = new AbortController()
    lauf.current = c
    return { c, dran: () => lauf.current === c }
  }

  async function mitMeinemText(s: KatalogStimme) {
    if (ton?.art === 'text' && ton.id === s.id) { stoppen(); setMeldung({ art: 'info', text: t.ton.angehalten }); return }
    const { c, dran } = neuerLauf()
    setMeldung(null)
    setTon({ art: 'text', id: s.id, phase: 'laedt' })
    try {
      const r = await probeHolen(s.id, text.trim(), sprache, c.signal)
      if (!dran()) return
      if (!r.ok) { setTon(null); setMeldung({ art: 'fehler', text: probeFehler(r.code) }); return }
      setTon({ art: 'text', id: s.id, phase: 'spielt' })
      await blobAbspielen(r.blob, c.signal)
      if (dran()) { setTon(null); lauf.current = null }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError' || !dran()) return
      setTon(null); lauf.current = null
      setMeldung({ art: 'fehler', text: t.fehler.abspielen })
    }
  }

  async function paarAnhoeren() {
    if (!stimmeA || !stimmeB) return
    const { c, dran } = neuerLauf()
    const muster = musterFuer(sprache)
    const folge = [{ s: stimmeA, satz: muster.a }, { s: stimmeB, satz: muster.b }] as const
    setMeldung(null)
    try {
      // B wird schon geholt, während A spricht — so folgt die Antwort ohne lange Pause.
      setTon({ art: 'paar', schritt: 0, phase: 'laedt' })
      const holA = probeHolen(folge[0].s.id, folge[0].satz, sprache, c.signal)
      const holB = holA.then(r => (r.ok ? probeHolen(folge[1].s.id, folge[1].satz, sprache, c.signal) : r))
      holB.catch(() => {})   // Abbruch während A: kein „unbehandelter" Fehler im Hintergrund
      for (const [i, hol] of [holA, holB].entries()) {
        const schritt = i as 0 | 1
        setTon({ art: 'paar', schritt, phase: 'laedt' })
        const r = await hol
        if (!dran()) return
        if (!r.ok) { setTon(null); lauf.current = null; setMeldung({ art: 'fehler', text: probeFehler(r.code) }); return }
        setTon({ art: 'paar', schritt, phase: 'spielt' })
        const w = await blobAbspielen(r.blob, c.signal)
        if (!dran()) return
        if (w === 'gestoppt') { c.abort(); setTon(null); lauf.current = null; return }
      }
      setTon(null); lauf.current = null
      setMeldung({ art: 'erfolg', text: t.paar.fertig })
    } catch (e) {
      if ((e as Error)?.name === 'AbortError' || !dran()) return
      setTon(null); lauf.current = null
      setMeldung({ art: 'fehler', text: t.fehler.abspielen })
    }
  }

  function paarUmschalten(id: string) {
    if (ton?.art === 'paar') stoppen()
    if (paarGueltig.includes(id)) { setPaar(paarGueltig.filter(x => x !== id)); return }
    if (paarGueltig.length >= 2) { setMeldung({ art: 'info', text: t.paar.voll }); return }
    setPaar([...paarGueltig, id])
  }

  // Statuszeile (vorgelesen): was gerade passiert.
  let status = ''
  if (ton?.art === 'text') status = fuellen(ton.phase === 'laedt' ? t.ton.vorbereiten : t.ton.spricht, { name: nameVon(ton.id) })
  if (ton?.art === 'paar') {
    const s = ton.schritt === 0 ? stimmeA : stimmeB
    status = fuellen(ton.phase === 'laedt' ? t.paar.vorbereiten : t.paar.spricht, { rolle: ton.schritt === 0 ? t.paar.stimmeA : t.paar.stimmeB, name: s?.name ?? '' })
  }

  const andereSprachen = AKTIV.filter(s => s.code !== sprache)

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{t.titel}</h1>
          <p className="mt-2 max-w-2xl text-leise">{t.einleitung}</p>
        </div>
        {darfBearbeiten && (
          <Link href="/portal/neu" className="knopf knopf-haupt shrink-0"><IconPlus className="size-5" />{t.neuerBeitrag}</Link>
        )}
      </header>

      {/* Sprache + Filter */}
      <section aria-label={t.filter.bereich} className="karte min-w-0 space-y-4 p-4 sm:p-5">
        <div className="min-w-0">
          <div id={`${textId}-sp`} className="etikett flex items-center gap-1.5"><IconGlobus className="size-4" />{t.sprache.label}</div>
          <div role="group" aria-labelledby={`${textId}-sp`} aria-describedby={`${textId}-sph`} className="flex flex-wrap gap-2">
            {AKTIV.map(s => (
              <button key={s.code} type="button" lang={s.basis} aria-pressed={s.code === sprache} onClick={() => spracheWechseln(s.code)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${s.code === sprache ? 'border-text bg-text text-white' : 'border-linie-2 bg-karte text-text hover:border-text'}`}>
                {sprachName(s.code, ui)}
              </button>
            ))}
          </div>
          <p id={`${textId}-sph`} className="hinweis mt-1.5">{t.sprache.hilfe}</p>
        </div>

        <div className="flex min-w-0 flex-wrap items-end gap-x-6 gap-y-4 border-t border-linie pt-4">
          <div className="min-w-0">
            <div id={`${textId}-ge`} className="etikett flex items-center gap-1.5"><IconFilter className="size-4" />{t.filter.geschlecht}</div>
            <div role="group" aria-labelledby={`${textId}-ge`} className="flex flex-wrap gap-1.5">
              {(['alle', 'weiblich', 'maennlich', 'neutral'] as const).map(w => (
                <button key={w} type="button" aria-pressed={geschlecht === w} onClick={() => setGeschlecht(w)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${geschlecht === w ? 'border-cyan-tief bg-cyan-hell text-cyan-text' : 'border-linie-2 bg-karte text-text-2 hover:border-text'}`}>
                  {t.filter[w]}
                </button>
              ))}
            </div>
          </div>
          <Schalter an={nurLachen} onWechsel={setNurLachen} label={<span className="inline-flex items-center gap-1.5"><IconLachen className="size-4" />{t.filter.lachen}</span>} className="pb-1.5" />
          {anbieterListe.length > 1 && (
            <div className="min-w-0">
              <label htmlFor={`${textId}-an`} className="block text-xs font-medium text-leise">{t.filter.anbieter}</label>
              <select id={`${textId}-an`} value={anbieterAktiv} onChange={e => setAnbieter(e.target.value)}
                className="mt-1 max-w-full rounded-lg border border-linie bg-karte px-2.5 py-1.5 text-sm text-text-2 focus:border-cyan-tief focus:outline-none focus:ring-2 focus:ring-cyan-hell">
                <option value="">{t.filter.alleAnbieter}</option>
                {anbieterListe.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
          {filterAktiv && (
            <button type="button" onClick={filterZuruecksetzen} className="pb-1.5 text-sm font-medium text-cyan-text underline-offset-4 hover:underline">
              {t.filter.zuruecksetzen}
            </button>
          )}
        </div>
      </section>

      {/* Eigener Text + Paar (nur Redaktion; die Probe-API verlangt diese Rolle) */}
      {darfBearbeiten && (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <section aria-labelledby={`${textId}-et`} className="karte min-w-0 p-4 sm:p-5">
            <h2 id={`${textId}-et`} className="text-lg font-semibold">{t.eigenerText.titel}</h2>
            <p className="mt-1 text-sm text-leise">{t.eigenerText.text}</p>
            <label htmlFor={`${textId}-tx`} className="etikett mt-3">{t.eigenerText.label}</label>
            <textarea id={`${textId}-tx`} value={text} maxLength={MAX_TEXT} rows={3} lang={sprache}
              onChange={e => setText(e.target.value.slice(0, MAX_TEXT))}
              aria-describedby={`${textId}-tz`} className="feld resize-y" />
            <div id={`${textId}-tz`} className="mt-1.5 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-leise">
              <span>{textOk ? t.eigenerText.limit : <span className="text-[#a32424]">{t.eigenerText.zuKurz}</span>}</span>
              <span aria-live="polite">{fuellen(t.eigenerText.zaehler, { n: text.length, max: MAX_TEXT })}</span>
            </div>
          </section>

          <section aria-labelledby={`${textId}-pa`} className="karte min-w-0 p-4 sm:p-5">
            <h2 id={`${textId}-pa`} className="text-lg font-semibold">{t.paar.titel}</h2>
            <p className="mt-1 text-sm text-leise">{t.paar.text}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[stimmeA, stimmeB].map((s, i) => {
                const rolle = i === 0 ? t.paar.stimmeA : t.paar.stimmeB
                const spricht = ton?.art === 'paar' && ton.schritt === i
                return (
                  <li key={i} className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 ${spricht ? 'border-cyan-tief bg-cyan-hell' : 'border-linie bg-grund'}`}>
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-cyan-tief text-white' : 'bg-violett text-white'}`}>{i === 0 ? 'A' : 'B'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="sr-only">{rolle}: </span>
                      {s ? <span className="block break-words font-semibold">{s.name}</span> : <span className="block text-sm text-leise">{t.paar.leer}</span>}
                    </span>
                    {s && (
                      <button type="button" onClick={() => paarUmschalten(s.id)} aria-label={fuellen(t.paar.entfernen, { name: s.name })}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-leise hover:bg-karte hover:text-text">
                        <IconKreuz className="size-4" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ton?.art === 'paar' ? (
                <button type="button" onClick={() => { stoppen(); setMeldung({ art: 'info', text: t.ton.angehalten }) }} className="knopf knopf-zweit">
                  <IconKreuz className="size-4" />{t.paar.abbrechen}
                </button>
              ) : (
                <button type="button" onClick={paarAnhoeren} disabled={!stimmeA || !stimmeB} className="knopf knopf-bunt">
                  <IconPlay className="size-4" />{t.paar.starten}
                </button>
              )}
              {paarGueltig.length < 2 && (
                <span className="text-sm text-leise">{paarGueltig.length === 0 ? t.paar.nochZwei : t.paar.nochEine}</span>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Status und Meldungen */}
      <div aria-live="polite" className="min-w-0 empty:hidden">
        {status && (
          <div className="flex items-center gap-2 rounded-2xl border border-cyan/30 bg-cyan-hell px-4 py-3 text-sm font-medium text-cyan-text">
            <span aria-hidden="true" className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <motion.span key={i} className="inline-block h-3 w-1 rounded-full bg-cyan-tief"
                  animate={ruhig ? undefined : { scaleY: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </span>
            <span className="min-w-0 break-words">{status}</span>
          </div>
        )}
      </div>
      {meldung && !status && (
        <Hinweis art={meldung.art} aktion={
          <button type="button" onClick={() => setMeldung(null)} aria-label={g.knopf.schliessen} className="inline-flex size-7 items-center justify-center rounded-full hover:bg-karte/60">
            <IconKreuz className="size-4" />
          </button>
        }>{meldung.text}</Hinweis>
      )}

      {/* Liste */}
      {!aktuell ? (
        <p role="status" className="karte animate-pulse p-6 text-leise">{t.laedt}</p>
      ) : 'fehler' in aktuell ? (
        <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit py-2">{g.knopf.nochmal}</button>}>
          {t.fehler.laden} {fehlerText(aktuell.fehler, g.fehler)}
        </Hinweis>
      ) : alleStimmen.length === 0 ? (
        <LeerZustand icon={<IconMikro className="size-7" />} titel={t.leer.titel}
          text={fuellen(andereSprachen.length ? t.leer.text : t.leer.ohneAndere, { sprache: sprachName(sprache, ui) })}>
          {andereSprachen.map(s => (
            <button key={s.code} type="button" onClick={() => spracheWechseln(s.code)} className="knopf knopf-zweit">
              <IconGlobus className="size-4" />{sprachName(s.code, ui)}
            </button>
          ))}
        </LeerZustand>
      ) : gefiltert.length === 0 ? (
        <LeerZustand icon={<IconFilter className="size-7" />} titel={t.leerFilter.titel} text={t.leerFilter.text}>
          <button type="button" onClick={filterZuruecksetzen} className="knopf knopf-haupt">{t.filter.zuruecksetzen}</button>
        </LeerZustand>
      ) : (
        <>
          <p className="text-sm text-leise" aria-live="polite">
            {gefiltert.length === 1 ? t.filter.anzahlEins : fuellen(t.filter.anzahl, { n: gefiltert.length })}
          </p>
          <ul className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {gefiltert.map((s, i) => {
              const imPaar = paarGueltig.indexOf(s.id)
              const tonHier = ton?.art === 'text' && ton.id === s.id ? ton : null
              const merkmale = [s.geschlecht && t.geschlecht[s.geschlecht], s.alter && t.alter[s.alter]].filter(Boolean).join(' · ')
              return (
                <motion.li key={s.id} className="min-w-0"
                  initial={ruhig ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: ruhig ? 0 : Math.min(i, 12) * 0.03 }}>
                  <article aria-labelledby={`${textId}-${i}`}
                    className={`karte flex h-full min-w-0 flex-col gap-3 p-4 sm:p-5 ${imPaar >= 0 ? 'ring-2 ring-offset-2 ' + (imPaar === 0 ? 'ring-cyan-tief' : 'ring-violett') : ''}`}>
                    <div className="flex min-w-0 items-start gap-3">
                      {s.hoerprobe_url ? (
                        <HoerKnopf quelle={s.hoerprobe_url} label={fuellen(t.karte.hoerprobe, { name: s.name })} anhaltenLabel={t.karte.hoerprobeAnhalten}
                          onFehler={() => setMeldung({ art: 'fehler', text: fuellen(t.karte.hoerprobeFehler, { name: s.name }) })} />
                      ) : (
                        <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-linie-2 text-leise">
                          <IconPlay className="ml-0.5 size-4 opacity-40" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 id={`${textId}-${i}`} className="break-words text-lg font-semibold leading-tight">{s.name}</h3>
                        {merkmale && <p className="mt-0.5 text-sm text-leise">{merkmale}</p>}
                        {!s.hoerprobe_url && <p className="mt-0.5 text-xs text-leise">{t.karte.keineHoerprobe}</p>}
                      </div>
                      {imPaar >= 0 && (
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${imPaar === 0 ? 'bg-cyan-tief' : 'bg-violett'}`}
                          title={fuellen(t.karte.imPaar, { rolle: imPaar === 0 ? 'A' : 'B' })}>
                          <span aria-hidden="true">{imPaar === 0 ? 'A' : 'B'}</span>
                          <span className="sr-only">{fuellen(t.karte.imPaar, { rolle: imPaar === 0 ? 'A' : 'B' })}</span>
                        </span>
                      )}
                    </div>

                    {(istLive(s.id) || s.kann_lachen) && (
                      <div className="flex flex-wrap gap-1.5">
                        {istLive(s.id) && (
                          <span className="inline-flex items-center gap-1 rounded-full verlauf-grund px-2.5 py-1 text-xs font-semibold text-white">
                            <IconFunken className="size-3.5" />{t.karte.natuerlich}
                          </span>
                        )}
                        {s.kann_lachen && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gelb-hell px-2.5 py-1 text-xs font-semibold text-[#8a4b05]">
                            <IconLachen className="size-3.5" />{t.karte.lachen}
                          </span>
                        )}
                      </div>
                    )}

                    {s.stil.length > 0 && (
                      <ul aria-label={t.karte.stil} className="flex flex-wrap gap-1.5">
                        {s.stil.map(w => (
                          <li key={w} lang="de" className="rounded-full border border-linie bg-grund px-2.5 py-0.5 text-xs text-text-2">{w}</li>
                        ))}
                      </ul>
                    )}

                    {darfBearbeiten && (
                      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-linie pt-3">
                        <button type="button" onClick={() => mitMeinemText(s)} disabled={!tonHier && !textOk}
                          aria-label={tonHier ? t.karte.anhalten : fuellen(t.karte.mitTextLabel, { name: s.name })}
                          className={`knopf px-3.5 py-2 text-sm ${tonHier ? 'knopf-haupt' : 'knopf-zweit'} ${tonHier?.phase === 'laedt' ? 'animate-pulse' : ''}`}>
                          {tonHier ? <IconKreuz className="size-4" /> : <IconPlay className="size-4" />}
                          {tonHier ? (tonHier.phase === 'laedt' ? t.karte.bereitet : t.karte.anhalten) : t.karte.mitText}
                        </button>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-2">
                          <input type="checkbox" checked={imPaar >= 0} onChange={() => paarUmschalten(s.id)}
                            className="size-4 accent-[#008fb8]" />
                          {t.karte.fuerPaar}
                        </label>
                      </div>
                    )}

                    <p className={`text-[11px] text-leise ${darfBearbeiten ? '' : 'mt-auto'}`}>{fuellen(t.karte.anbieter, { name: s.anbieter })}</p>
                  </article>
                </motion.li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
