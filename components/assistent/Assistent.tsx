'use client'
// Assistent „Neuer Beitrag": sechs Schritte mit Fortschrittsleiste, Prüfung je Schritt, Zustand in sessionStorage,
// Vorbefüllung aus einem früheren Beitrag (?von=…). Die Seite lädt diese Komponente; sie läuft nur im Browser
// (sessionStorage), damit es keine Unterschiede zwischen Server- und Browser-Darstellung gibt.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { usePortal } from '@/components/portal/Kontext'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import Dialog from '@/components/gemeinsam/Dialog'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconHaken, IconNeu, IconPfeil, IconPfeilLinks } from '@/components/gemeinsam/Icons'
import type { AssistentTexte } from '@/lib/i18n/texte/assistent'
import { fokussieren } from './Bausteine'
import SchrittInhalt from './SchrittInhalt'
import SchrittFormat, { type FormatNamen } from './SchrittFormat'
import SchrittSprache from './SchrittSprache'
import SchrittStimmen from './SchrittStimmen'
import SchrittTon from './SchrittTon'
import SchrittUebersicht from './SchrittUebersicht'
import {
  SCHRITTE, ausFruehererEinstellung, entwurfLaden, entwurfLoeschen, entwurfSpeichern, pruefen, startEntwurf,
  type Entwurf, type FruehereEinstellungen, type Quelle, type Stimme,
} from './zustand'

interface Props { t: AssistentTexte; formatNamen: FormatNamen; von: string | null }

const nichts = () => () => {}

export default function Assistent(props: Props) {
  // Erst im Browser zeichnen (sessionStorage) — auf dem Server und beim ersten Hydrieren ein ruhiger Platzhalter.
  const imBrowser = useSyncExternalStore(nichts, () => true, () => false)
  if (!imBrowser) return <div className="karte h-64 animate-pulse" aria-hidden="true" />
  return <AssistentInnen {...props} />
}

const TITEL_ID = 'a-schritt-titel'

function AssistentInnen({ t, formatNamen, von }: Props) {
  const { sprache: ui, g } = usePortal()
  const router = useRouter()
  const ruhig = useReducedMotion()
  const [e, setEntwurf] = useState<Entwurf>(() => entwurfLaden(ui))
  const [vonStand, setVonStand] = useState<'laedt' | 'fehler' | null>(von ? 'laedt' : null)
  const [zeigeFehler, setZeigeFehler] = useState<ReadonlySet<number>>(new Set())
  const [neuOffen, setNeuOffen] = useState(false)
  const fokusNachWechsel = useRef<string | null>(null)
  const aktuell = useRef(e)
  useEffect(() => { aktuell.current = e })

  const setE = useCallback((f: (x: Entwurf) => Entwurf) => setEntwurf(f), [])

  // Jede Änderung sichern (Neu laden verliert nichts).
  useEffect(() => { entwurfSpeichern(e) }, [e])

  // Vorbefüllung aus einem früheren Beitrag — hat Vorrang vor dem gespeicherten Entwurf.
  useEffect(() => {
    if (!von) return
    let aus = false
    api<{ beitrag: { titel: string; einstellungen: FruehereEinstellungen | null; eingaben: { quelle?: Quelle; themen?: FruehereEinstellungen['themen'] } | null } }>(
      `/api/v1/beitraege/${encodeURIComponent(von)}`,
    ).then(r => {
      if (aus) return
      if (!r.ok) { setVonStand('fehler'); return }
      const b = r.daten.beitrag
      setEntwurf(ausFruehererEinstellung(ui, b.titel, b.einstellungen ?? {}, b.eingaben ?? undefined))
      setZeigeFehler(new Set())
      setVonStand(null)
      // Adresse ohne ?von=, damit „Neu laden" den bearbeiteten Stand behält.
      router.replace('/portal/neu', { scroll: false })
    })
    return () => { aus = true }
  }, [von, ui, router])

  // Stimmen je Sprache laden; ungültig gewordene Auswahl zurücksetzen.
  const [stimmenStand, setStimmenStand] = useState<{ sprache: string; liste: Stimme[] | null; fehler: string | null; zurueckgesetzt: boolean } | null>(null)
  const [stimmenVersuch, setStimmenVersuch] = useState(0)
  useEffect(() => {
    let aus = false
    const sprache = e.sprache
    api<{ stimmen: Stimme[] }>(`/api/v1/stimmen?sprache=${encodeURIComponent(sprache)}`).then(r => {
      if (aus) return
      if (!r.ok) { setStimmenStand({ sprache, liste: null, fehler: fehlerText(r.code, g.fehler), zurueckgesetzt: false }); return }
      const liste = r.daten.stimmen
      const ids = new Set(liste.map(s => s.id))
      const ungueltig = (v: Entwurf) => v.sprache === sprache && v.sprecher.some(s => s.stimme && !ids.has(s.stimme))
      const zurueck = ungueltig(aktuell.current)
      setEntwurf(v => (ungueltig(v) ? { ...v, sprecher: v.sprecher.map(s => (s.stimme && !ids.has(s.stimme) ? { ...s, stimme: '' } : s)) } : v))
      setStimmenStand({ sprache, liste, fehler: null, zurueckgesetzt: zurueck })
    })
    return () => { aus = true }
  }, [e.sprache, stimmenVersuch, g.fehler])
  const stimmenAktuell = stimmenStand?.sprache === e.sprache ? stimmenStand : null
  const stimmen = stimmenAktuell?.liste ?? null

  // Nach einem Schrittwechsel: Fokus auf die Überschrift (oder aufs erste Problem).
  useEffect(() => {
    const ziel = fokusNachWechsel.current
    if (!ziel) return
    fokusNachWechsel.current = null
    if (ziel === TITEL_ID) {
      const h = document.getElementById(TITEL_ID)
      h?.focus({ preventScroll: true })
      h?.scrollIntoView({ block: 'start', behavior: ruhig ? 'auto' : 'smooth' })
    } else fokussieren(ziel)
  }, [e.schritt, ruhig])

  const fehlerFuer = (s: number) => pruefen(s, e, t.fehler, t.format, stimmen)
  const fehler = zeigeFehler.has(e.schritt) ? fehlerFuer(e.schritt) : {}

  function wechseln(ziel: number, fokus: string = TITEL_ID) {
    fokusNachWechsel.current = fokus
    setEntwurf(v => ({ ...v, schritt: ziel, erreicht: Math.max(v.erreicht, ziel) }))
  }

  /** Zu einem Schritt springen; vorwärts nur, wenn alle Schritte davor in Ordnung sind. */
  function gehe(ziel: number) {
    if (ziel === e.schritt) return
    if (ziel > e.schritt) {
      for (let s = e.schritt; s < ziel; s++) {
        const f = Object.keys(fehlerFuer(s))
        if (f.length) {
          setZeigeFehler(v => new Set(v).add(s))
          if (s === e.schritt) { requestAnimationFrame(() => fokussieren(f[0])); return }
          wechseln(s, f[0])
          return
        }
      }
    }
    wechseln(ziel)
  }

  function neuBeginnen() {
    entwurfLoeschen()
    setEntwurf({ ...startEntwurf(ui) })
    setZeigeFehler(new Set())
    setNeuOffen(false)
    fokusNachWechsel.current = TITEL_ID
    requestAnimationFrame(() => document.getElementById(TITEL_ID)?.focus())
  }

  const letzter = SCHRITTE.length - 1
  const schrittTexte = { 0: t.inhalt, 1: t.format, 2: t.sprache, 3: t.stimmen, 4: t.ton, 5: t.uebersicht }[e.schritt as 0 | 1 | 2 | 3 | 4 | 5]
  const hatFehler = Object.keys(fehler).length > 0

  if (vonStand === 'laedt') {
    return <p role="status" className="karte animate-pulse px-5 py-8 text-center text-leise">{t.uebernahmeLaedt}</p>
  }

  return (
    <div className="grid min-w-0 gap-6">
      {vonStand === 'fehler' && <Hinweis art="warnung">{t.uebernahmeFehler}</Hinweis>}
      {e.uebernommen && <Hinweis art="info">{fuellen(t.uebernommen, { titel: e.uebernommen })}</Hinweis>}

      <Fortschritt t={t} schritt={e.schritt} erreicht={e.erreicht} gehe={gehe} />

      <motion.section key={e.schritt} aria-labelledby={TITEL_ID} className="grid min-w-0 gap-6"
        initial={ruhig ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
        <header className="min-w-0">
          <p className="text-sm font-semibold text-cyan-text">{fuellen(t.fortschritt.schritt, { n: e.schritt + 1, m: SCHRITTE.length })}</p>
          <h2 id={TITEL_ID} tabIndex={-1} className="mt-0.5 scroll-mt-24 text-2xl font-semibold tracking-[-.02em] text-text outline-none sm:text-3xl">{schrittTexte.titel}</h2>
          <p className="mt-1 text-leise">{schrittTexte.text}</p>
        </header>

        {hatFehler && <Hinweis art="fehler">{t.fehler.pruefen}</Hinweis>}

        {e.schritt === 0 && <SchrittInhalt e={e} setE={setE} fehler={fehler} t={t} ui={ui} />}
        {e.schritt === 1 && <SchrittFormat e={e} setE={setE} fehler={fehler} t={t} formatNamen={formatNamen} />}
        {e.schritt === 2 && <SchrittSprache e={e} setE={setE} fehler={fehler} t={t} ui={ui} />}
        {e.schritt === 3 && (
          <SchrittStimmen e={e} setE={setE} fehler={fehler} t={t} ui={ui} stimmen={stimmen}
            ladeFehler={stimmenAktuell?.fehler ?? null} neuLaden={() => setStimmenVersuch(v => v + 1)}
            zurSprache={() => wechseln(2)} zurueckgesetzt={!!stimmenAktuell?.zurueckgesetzt && e.sprecher.slice(0, e.sprecherzahl).some(s => !s.stimme)} />
        )}
        {e.schritt === 4 && <SchrittTon e={e} setE={setE} fehler={fehler} t={t} stimmen={stimmen} />}
        {e.schritt === 5 && <SchrittUebersicht e={e} t={t} ui={ui} stimmen={stimmen} formatNamen={formatNamen} gehe={gehe} />}
      </motion.section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linie pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {e.schritt > 0 && (
            <button type="button" className="knopf knopf-zweit" onClick={() => gehe(e.schritt - 1)}>
              <IconPfeilLinks className="size-4" />{t.nav.zurueck}
            </button>
          )}
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-leise hover:bg-grund-2 hover:text-text"
            onClick={() => setNeuOffen(true)}>
            <IconNeu className="size-4" />{t.nav.neuBeginnen}
          </button>
        </div>
        {e.schritt < letzter && (
          <button type="button" className="knopf knopf-haupt ml-auto" onClick={() => gehe(e.schritt + 1)}>
            {e.schritt === letzter - 1 ? t.nav.zurUebersicht : t.nav.weiter}<IconPfeil className="size-4" />
          </button>
        )}
      </div>
      <p className="-mt-3 text-xs text-leise">{t.gemerkt}</p>

      <Dialog offen={neuOffen} onSchliessen={() => setNeuOffen(false)} titel={t.neu.titel} beschreibung={t.neu.text} schliessenText={g.knopf.schliessen}
        fuss={
          <>
            <button type="button" className="knopf knopf-zweit" onClick={() => setNeuOffen(false)}>{t.neu.nein}</button>
            <button type="button" className="knopf bg-rot text-white" onClick={neuBeginnen}>{t.neu.ja}</button>
          </>
        } />
    </div>
  )
}

/** Fortschrittsleiste: nummerierte Schritte; erreichte sind anklickbar. */
function Fortschritt({ t, schritt, erreicht, gehe }: { t: AssistentTexte; schritt: number; erreicht: number; gehe: (s: number) => void }) {
  return (
    <nav aria-label={t.fortschritt.label} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 sm:gap-2">
        {SCHRITTE.map((k, i) => {
          const aktuell = i === schritt
          const erledigt = i <= erreicht && !aktuell
          const name = t.schritte[k]
          return (
            <li key={k} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <button type="button" disabled={!erledigt} onClick={() => gehe(i)} aria-current={aktuell ? 'step' : undefined}
                aria-label={`${i + 1}. ${name}${aktuell ? '' : erledigt ? ` — ${t.fortschritt.erledigt}` : ` — ${t.fortschritt.offen}`}`}
                className={`group flex min-w-0 items-center gap-2 rounded-full text-left ${erledigt ? 'cursor-pointer' : 'cursor-default'}`}>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:size-9 ${aktuell
                  ? 'verlauf-grund text-white shadow-[0_6px_16px_-6px_rgb(139_92_246/.7)]'
                  : erledigt ? 'bg-cyan-hell text-cyan-text group-hover:bg-cyan group-hover:text-white' : 'border border-linie-2 bg-karte text-leise'}`}>
                  {erledigt && i < schritt ? <IconHaken className="size-4" /> : i + 1}
                </span>
                <span className={`hidden min-w-0 truncate text-sm lg:block ${aktuell ? 'font-semibold text-text' : erledigt ? 'text-text-2 group-hover:underline' : 'text-leise'}`}>{name}</span>
              </button>
              {i < SCHRITTE.length - 1 && <span aria-hidden="true" className={`h-0.5 min-w-2 flex-1 rounded-full ${i < erreicht ? 'bg-cyan/50' : 'bg-linie'}`} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
