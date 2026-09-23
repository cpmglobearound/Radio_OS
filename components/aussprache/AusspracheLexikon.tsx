'use client'
// Seite „Aussprache" (07 §4.6): Namen mit richtiger Aussprache je Ausgabesprache eintragen, anhören, ändern, löschen.
// Globale Einträge (Klarframe) gelten für alle Kunden — sehen darf sie jeder aus der Redaktion, ändern nur der Admin.
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AUSGABESPRACHEN, sprachName } from '@/lib/sprachen'
import { probeSatz, type AusspracheTexte } from '@/lib/i18n/texte/aussprache'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { IconFilter, IconGlobus, IconKreuz, IconLupe, IconMuell, IconPlay, IconPlus, IconStift, IconText } from '@/components/gemeinsam/Icons'
import { Bestaetigen } from '@/components/beitrag/Dialoge'
import { usePortal } from '@/components/portal/Kontext'
import Schalter from '@/components/stimmen/Schalter'
import { blobAbspielen } from '@/components/stimmen/probe'
import { ausspracheProbe, ausspracheRegie } from './probe'

interface Eintrag { id: string; sprache: string; wort: string; sprich_als: string; global: boolean }
type Daten = { eintraege: Eintrag[]; darfGlobal: boolean } | { fehler: string }
type Ton = { id: string; wort: string; name: string; phase: 'laedt' | 'spielt' }
type Meldung = { art: 'fehler' | 'info' | 'erfolg'; text: string }
type Filter = 'alle' | 'eigene' | 'klarframe'
type Stimme = { id: string; name: string } | null

const MAX_WORT = 80
const MAX_SPRICH = 120
const AKTIV = AUSGABESPRACHEN.filter(s => s.aktiv)
const basisVon = (code: string) => AUSGABESPRACHEN.find(s => s.code === code)?.basis ?? code.slice(0, 2)

export default function AusspracheLexikon({ t }: { t: AusspracheTexte }) {
  const { sprache: ui, g, nutzer } = usePortal()
  const ruhig = useReducedMotion()
  const id = useId()
  const wortRef = useRef<HTMLInputElement>(null)
  const sprichRef = useRef<HTMLInputElement>(null)

  const [sprache, setSprache] = useState(() => (AKTIV.find(s => s.basis === ui) ?? AKTIV[0])?.code ?? 'de-DE')
  const [daten, setDaten] = useState<Daten | null>(null)
  const [versuch, setVersuch] = useState(0)
  const [suche, setSuche] = useState('')
  const [filter, setFilter] = useState<Filter>('alle')
  const [wort, setWort] = useState('')
  const [sprich, setSprich] = useState('')
  const [global, setGlobal] = useState(false)
  const [sendet, setSendet] = useState(false)
  const [formFehler, setFormFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<Meldung | null>(null)
  const [ton, setTon] = useState<Ton | null>(null)
  const [loeschZiel, setLoeschZiel] = useState<Eintrag | null>(null)
  const [loescht, setLoescht] = useState(false)
  const [loeschFehler, setLoeschFehler] = useState<string | null>(null)
  const lauf = useRef<AbortController | null>(null)
  const stimmen = useRef<Record<string, Stimme>>({})

  // Alle Einträge (eigene + globale, alle Sprachen) laden — die Reiter zeigen, wo es Einträge gibt.
  // Beim Neuladen bleibt die alte Liste stehen, bis die neue da ist (kein Flackern).
  useEffect(() => {
    let aus = false
    api<{ eintraege: Eintrag[]; darf_global: boolean }>('/api/v1/aussprache').then(r => {
      if (aus) return
      setDaten(r.ok ? { eintraege: r.daten.eintraege, darfGlobal: r.daten.darf_global } : { fehler: r.code })
    })
    return () => { aus = true }
  }, [versuch])

  // Beim Verlassen der Seite laufenden Ton beenden.
  useEffect(() => () => lauf.current?.abort(), [])

  const alle = daten && 'eintraege' in daten ? daten.eintraege : []
  const admin = daten && 'eintraege' in daten ? daten.darfGlobal : nutzer.ist_admin
  const zahl = (code: string) => alle.filter(e => e.sprache === code).length
  // Aktive Sprachen zuerst; inaktive nur mit Einträgen oder für den Admin.
  const sprachen = AUSGABESPRACHEN
    .filter(s => s.aktiv || admin || zahl(s.code) > 0 || s.code === sprache)
    .sort((a, b) => Number(b.aktiv) - Number(a.aktiv))
  const hier = alle.filter(e => e.sprache === sprache)
  const mitBeiden = hier.some(e => e.global) && hier.some(e => !e.global)
  const filterWirksam: Filter = mitBeiden ? filter : 'alle'
  const s = suche.trim().toLocaleLowerCase()
  const gefiltert = hier.filter(e =>
    (filterWirksam === 'alle' || (filterWirksam === 'klarframe') === e.global) &&
    (!s || e.wort.toLocaleLowerCase().includes(s) || e.sprich_als.toLocaleLowerCase().includes(s)))
  const globalWirksam = admin && global
  const vorhanden = hier.find(e => e.wort === wort.trim() && e.global === globalWirksam)
  const spracheName = sprachName(sprache, ui)
  const basis = basisVon(sprache)

  function stoppen() {
    lauf.current?.abort()
    lauf.current = null
    setTon(null)
  }

  function spracheWechseln(code: string) {
    if (code === sprache) return
    stoppen()
    setSprache(code)
    setMeldung(null)
    setFormFehler(null)
    setFilter('alle')
  }

  function neuerLauf() {
    lauf.current?.abort()
    const c = new AbortController()
    lauf.current = c
    return { c, dran: () => lauf.current === c }
  }

  function tonFehler(code: string) {
    return (t.fehler as Record<string, string>)[code] ?? fehlerText(code, g.fehler)
  }

  async function anhoeren(e: Eintrag) {
    if (ton?.id === e.id) { stoppen(); setMeldung({ art: 'info', text: t.ton.angehalten }); return }
    const { c, dran } = neuerLauf()
    setMeldung(null)
    setTon({ id: e.id, wort: e.wort, name: '', phase: 'laedt' })
    const aufhoeren = (m?: Meldung) => { setTon(null); lauf.current = null; if (m) setMeldung(m) }
    try {
      // Erste freigegebene Stimme der Sprache (einmal je Sprache holen).
      let st = stimmen.current[e.sprache]
      if (st === undefined) {
        const r = await api<{ stimmen: { id: string; name: string }[] }>(`/api/v1/stimmen?sprache=${encodeURIComponent(e.sprache)}`, { signal: c.signal })
        if (!dran()) return
        if (!r.ok) { aufhoeren({ art: 'fehler', text: fehlerText(r.code, g.fehler) }); return }
        const erste = r.daten.stimmen[0]
        st = erste ? { id: erste.id, name: erste.name } : null
        stimmen.current[e.sprache] = st
      }
      if (!st) { aufhoeren({ art: 'info', text: t.fehler.keineStimme }); return }
      setTon({ id: e.id, wort: e.wort, name: st.name, phase: 'laedt' })
      const r = await ausspracheProbe(st.id, probeSatz(e.sprache, e.wort), e.sprache, ausspracheRegie(e.wort, e.sprich_als), c.signal)
      if (!dran()) return
      if (!r.ok) { aufhoeren({ art: 'fehler', text: tonFehler(r.code) }); return }
      setTon({ id: e.id, wort: e.wort, name: st.name, phase: 'spielt' })
      await blobAbspielen(r.blob, c.signal)
      if (dran()) aufhoeren()
    } catch (err) {
      if ((err as Error)?.name === 'AbortError' || !dran()) return
      aufhoeren({ art: 'fehler', text: t.fehler.abspielen })
    }
  }

  async function speichern(ev: FormEvent) {
    ev.preventDefault()
    const w = wort.trim()
    const sa = sprich.trim()
    if (!w || !sa) { setFormFehler(t.fehler.eingabe); (w ? sprichRef : wortRef).current?.focus(); return }
    setSendet(true)
    setFormFehler(null)
    setMeldung(null)
    const ersetzt = !!vorhanden
    const r = await api('/api/v1/aussprache', { body: { sprache, wort: w, sprich_als: sa, ...(globalWirksam ? { global: true } : {}) } })
    setSendet(false)
    if (!r.ok) { setFormFehler(tonFehler(r.code)); return }
    setWort(''); setSprich(''); setGlobal(false); setSuche(''); setFilter('alle')
    setMeldung({ art: 'erfolg', text: fuellen(ersetzt ? t.meldung.ersetzt : t.meldung.gespeichert, { wort: w }) })
    setVersuch(v => v + 1)
    wortRef.current?.focus()
  }

  function aendern(e: Eintrag) {
    setWort(e.wort); setSprich(e.sprich_als); setGlobal(e.global); setFormFehler(null)
    sprichRef.current?.focus()
    sprichRef.current?.select()
  }

  async function loeschen() {
    if (!loeschZiel) return
    const e = loeschZiel
    setLoescht(true)
    setLoeschFehler(null)
    const r = await api(`/api/v1/aussprache/${encodeURIComponent(e.id)}`, { method: 'DELETE' })
    setLoescht(false)
    if (!r.ok && r.code !== 'nicht_gefunden') { setLoeschFehler(tonFehler(r.code)); return }
    if (ton?.id === e.id) stoppen()
    setLoeschZiel(null)
    setMeldung(r.ok ? { art: 'erfolg', text: fuellen(t.meldung.geloescht, { wort: e.wort }) } : { art: 'fehler', text: t.fehler.nicht_gefunden })
    setVersuch(v => v + 1)
  }

  const status = ton ? fuellen(ton.phase === 'laedt' ? (ton.name ? t.ton.vorbereiten : t.liste.bereitet) : t.ton.spricht, { name: ton.name, wort: ton.wort }) : ''

  return (
    <div className="min-w-0 space-y-6">
      {/* Kopf: was ist das, was passiert danach */}
      <header className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{t.titel}</h1>
        <div className="mt-2 max-w-2xl space-y-2 text-leise">
          {t.einleitung.map(p => <p key={p}>{p}</p>)}
        </div>
        <p className="mt-3 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-linie bg-karte px-3.5 py-2 text-sm">
          <span className="font-medium text-leise">{t.beispiel.label}:</span>
          <span lang="ca" className="font-semibold text-text">{t.beispiel.wort}</span>
          <span aria-hidden="true" className="text-leise">→</span>
          <span className="sr-only">{t.liste.sprichAls}</span>
          <span className="rounded-full bg-cyan-hell px-2.5 py-0.5 font-semibold text-cyan-text">{t.beispiel.sprich}</span>
        </p>
      </header>

      {/* Sprache */}
      <section aria-labelledby={`${id}-sp`} className="karte min-w-0 p-4 sm:p-5">
        <div id={`${id}-sp`} className="etikett flex items-center gap-1.5"><IconGlobus className="size-4" />{t.sprache.label}</div>
        <div role="group" aria-labelledby={`${id}-sp`} aria-describedby={`${id}-sph`} className="flex flex-wrap gap-2">
          {sprachen.map(sp => {
            const n = zahl(sp.code)
            const an = sp.code === sprache
            return (
              <button key={sp.code} type="button" lang={sp.basis} aria-pressed={an} onClick={() => spracheWechseln(sp.code)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${an ? 'border-text bg-text text-white' : 'border-linie-2 bg-karte text-text hover:border-text'}`}>
                <span className="min-w-0 break-words text-left">
                  {sprachName(sp.code, ui)}
                  {!sp.aktiv && <span className={`block text-[11px] font-normal ${an ? 'text-white/80' : 'text-leise'}`} lang={ui}>{t.sprache.intern}</span>}
                </span>
                {n > 0 && (
                  <span className={`shrink-0 rounded-full px-1.5 text-xs tabular-nums ${an ? 'bg-white/20' : 'bg-grund-2 text-text-2'}`}>
                    <span aria-hidden="true">{n}</span><span className="sr-only" lang={ui}>{fuellen(t.sprache.anzahl, { n })}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p id={`${id}-sph`} className="hinweis mt-1.5">{t.sprache.hilfe}</p>
      </section>

      {/* Formular */}
      <section aria-labelledby={`${id}-ft`} className="karte min-w-0 p-4 sm:p-5">
        <h2 id={`${id}-ft`} className="text-lg font-semibold">{t.form.titel}</h2>
        <p className="mt-1 text-sm text-leise">{fuellen(t.form.text, { sprache: spracheName })}</p>
        <form onSubmit={speichern} noValidate className="mt-4 grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor={`${id}-w`} className="etikett">{t.form.wort}</label>
              <input id={`${id}-w`} ref={wortRef} value={wort} maxLength={MAX_WORT} lang={basis} autoComplete="off" required
                onChange={e => { setWort(e.target.value.slice(0, MAX_WORT)); setFormFehler(null) }}
                aria-describedby={`${id}-wh${vorhanden ? ` ${id}-wd` : ''}`} className="feld" />
              <p id={`${id}-wh`} className="hinweis mt-1.5">{t.form.wortHilfe}</p>
              {vorhanden && <p id={`${id}-wd`} className="mt-1.5 text-sm text-[#8a4b05]">{fuellen(t.form.schonDa, { wort: vorhanden.wort })}</p>}
            </div>
            <div className="min-w-0">
              <label htmlFor={`${id}-s`} className="etikett">{t.form.sprich}</label>
              <input id={`${id}-s`} ref={sprichRef} value={sprich} maxLength={MAX_SPRICH} autoComplete="off" required spellCheck={false}
                onChange={e => { setSprich(e.target.value.slice(0, MAX_SPRICH)); setFormFehler(null) }}
                aria-describedby={`${id}-sh`} className="feld" />
              <p id={`${id}-sh`} className="hinweis mt-1.5">{t.form.sprichHilfe}</p>
              {sprich.length > MAX_SPRICH - 20 && (
                <p className="mt-1 text-right text-xs text-leise" aria-live="polite">{fuellen(t.form.zaehler, { n: sprich.length, max: MAX_SPRICH })}</p>
              )}
            </div>
          </div>
          {admin && <Schalter an={global} onWechsel={setGlobal} label={t.form.global} hilfe={t.form.globalHilfe} />}
          {formFehler && <Hinweis art="fehler">{formFehler}</Hinweis>}
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={sendet} className="knopf knopf-haupt">
              <IconPlus className="size-5" />{sendet ? t.form.speichert : t.form.speichern}
            </button>
            {(wort || sprich) && !sendet && (
              <button type="button" onClick={() => { setWort(''); setSprich(''); setGlobal(false); setFormFehler(null); wortRef.current?.focus() }} className="knopf knopf-zweit">
                {t.form.leeren}
              </button>
            )}
          </div>
        </form>
      </section>

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
      {!daten ? (
        <p role="status" className="karte animate-pulse p-6 text-leise">{t.laedt}</p>
      ) : 'fehler' in daten ? (
        <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit py-2">{g.knopf.nochmal}</button>}>
          {t.fehler.laden} {fehlerText(daten.fehler, g.fehler)}
        </Hinweis>
      ) : hier.length === 0 ? (
        <LeerZustand icon={<IconText className="size-7" />} titel={fuellen(t.leer.titel, { sprache: spracheName })} text={t.leer.text}>
          <button type="button" onClick={() => wortRef.current?.focus()} className="knopf knopf-haupt"><IconPlus className="size-5" />{t.leer.knopf}</button>
        </LeerZustand>
      ) : (
        <section aria-labelledby={`${id}-lt`} className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 id={`${id}-lt`} className="text-lg font-semibold">{t.liste.titel}</h2>
              <p className="text-sm text-leise" aria-live="polite">
                {gefiltert.length === 1 ? t.liste.anzahlEins : fuellen(t.liste.anzahl, { n: gefiltert.length })} · {t.ton.limit}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-end gap-3">
              {mitBeiden && (
                <div className="min-w-0">
                  <div id={`${id}-fi`} className="sr-only">{t.liste.filter}</div>
                  <div role="group" aria-labelledby={`${id}-fi`} className="flex flex-wrap gap-1.5">
                    <IconFilter aria-hidden="true" className="size-4 self-center text-leise" />
                    {(['alle', 'eigene', 'klarframe'] as const).map(f => (
                      <button key={f} type="button" aria-pressed={filterWirksam === f} onClick={() => setFilter(f)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${filterWirksam === f ? 'border-cyan-tief bg-cyan-hell text-cyan-text' : 'border-linie-2 bg-karte text-text-2 hover:border-text'}`}>
                        {t.liste[f]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="relative w-full min-w-0 sm:w-64">
                <label htmlFor={`${id}-q`} className="sr-only">{t.liste.suche}</label>
                <IconLupe aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-leise" />
                <input id={`${id}-q`} type="search" value={suche} onChange={e => setSuche(e.target.value)} placeholder={t.liste.suchePlatzhalter}
                  autoComplete="off" className="feld !py-2 !pl-9 text-sm" />
              </div>
            </div>
          </div>

          {gefiltert.length === 0 ? (
            <LeerZustand icon={<IconLupe className="size-7" />} titel={t.leerSuche.titel} text={t.leerSuche.text}>
              <button type="button" onClick={() => { setSuche(''); setFilter('alle') }} className="knopf knopf-zweit">{t.leerSuche.zuruecksetzen}</button>
              {suche.trim() && (
                <button type="button" onClick={() => { setWort(suche.trim().slice(0, MAX_WORT)); setSuche(''); setGlobal(false); sprichRef.current?.focus() }} className="knopf knopf-haupt">
                  <IconPlus className="size-5" />{fuellen(t.leerSuche.eintragen, { wort: suche.trim() })}
                </button>
              )}
            </LeerZustand>
          ) : (
            <ul className="karte min-w-0 divide-y divide-linie overflow-hidden p-0">
              {gefiltert.map(e => {
                const tonHier = ton?.id === e.id ? ton : null
                const darfAendern = !e.global || admin
                return (
                  <li key={e.id} className={`flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5 ${tonHier ? 'bg-cyan-hell/40' : ''}`}>
                    <div className="min-w-0 flex-1 basis-56">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span lang={basis} className="min-w-0 break-words font-semibold text-text">{e.wort}</span>
                        {e.global && (
                          <span title={t.liste.klarframeHilfe} className="inline-flex items-center rounded-full verlauf-grund px-2 py-0.5 text-[11px] font-semibold text-white">
                            {t.liste.klarframe}<span className="sr-only">: {t.liste.klarframeHilfe}</span>
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 min-w-0 break-words text-sm text-text-2">
                        <span className="sr-only">{t.liste.sprichAls} </span>
                        <span aria-hidden="true" className="text-leise">→ </span>
                        <span className="font-medium text-cyan-text">{e.sprich_als}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button type="button" onClick={() => anhoeren(e)}
                        aria-label={tonHier ? t.liste.anhalten : fuellen(t.liste.anhoerenLabel, { wort: e.wort })}
                        className={`knopf px-3.5 py-2 text-sm ${tonHier ? 'knopf-haupt' : 'knopf-zweit'} ${tonHier?.phase === 'laedt' ? 'animate-pulse' : ''}`}>
                        {tonHier ? <IconKreuz className="size-4" /> : <IconPlay className="size-4" />}
                        {tonHier ? (tonHier.phase === 'laedt' ? t.liste.bereitet : t.liste.anhalten) : t.liste.anhoeren}
                      </button>
                      {darfAendern && (
                        <>
                          <button type="button" onClick={() => aendern(e)} aria-label={fuellen(t.liste.aendernLabel, { wort: e.wort })} title={t.liste.aendern}
                            className="inline-flex size-10 items-center justify-center rounded-full text-text-2 transition-colors hover:bg-grund-2 hover:text-text">
                            <IconStift className="size-5" />
                          </button>
                          <button type="button" onClick={() => { setLoeschFehler(null); setLoeschZiel(e) }} aria-label={fuellen(t.liste.loeschenLabel, { wort: e.wort })} title={t.liste.loeschen}
                            className="inline-flex size-10 items-center justify-center rounded-full text-text-2 transition-colors hover:bg-rot-hell hover:text-[#a32424]">
                            <IconMuell className="size-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      <Bestaetigen offen={!!loeschZiel} titel={t.loeschen.titel} gefaehrlich
        text={<p>{fuellen(t.loeschen.text, { wort: loeschZiel?.wort ?? '' })}</p>}
        ja={t.loeschen.ja} nein={t.loeschen.nein} laeuft={loescht} laeuftText={t.loeschen.laeuft} fehler={loeschFehler}
        onJa={loeschen} onNein={() => { if (!loescht) setLoeschZiel(null) }} schliessenText={g.knopf.schliessen} />
    </div>
  )
}
