'use client'
// Startseite des Portals: Begrüßung, Guthaben, „Neuer Beitrag", laufende Produktionen (live), Freigaben, letzte Beiträge.
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import StatusChip from '@/components/portal/StatusChip'
import { istFertig, laeuft } from '@/components/portal/anzeige'
import { guthabenStufe, usePortal } from '@/components/portal/Kontext'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { fehlerText } from '@/components/gemeinsam/api'
import { datum, fuellen, mmss } from '@/components/gemeinsam/format'
import { IconDrehbuch, IconGlobus, IconLupe, IconPfeil, IconPlus, IconText, IconUhr, IconWinkel } from '@/components/gemeinsam/Icons'
import type { UebersichtTexte } from '@/lib/i18n/texte/uebersicht'
import BeitragZeile, { beitragDetails, ProbeAbzeichen } from './BeitragZeile'
import Fortschritt from './Fortschritt'
import { beitragHref, seiteLaden, type BeitragKurz, type BeitragSeite, type FormatNamen } from './daten'

const TAKT_MS = 3000

/** Erste Seite der Beiträge; lädt alle 3 s neu, solange einer läuft. Läuft einer zu Ende → Guthaben in der Kopfzeile auffrischen. */
function useBeitraegeLive() {
  const { guthabenNeuLaden } = usePortal()
  const [stand, setStand] = useState<{ daten: BeitragSeite | null; fehler: string | null }>({ daten: null, fehler: null })
  const [versuch, setVersuch] = useState(0)
  const liefen = useRef<Set<string>>(new Set())

  useEffect(() => {
    let aus = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const ab = new AbortController()
    const laden = () => {
      seiteLaden({ signal: ab.signal }).then(r => {
        if (aus) return
        if (!r.ok) {
          setStand(s => ({ ...s, fehler: r.code }))
          if (liefen.current.size) timer = setTimeout(laden, TAKT_MS * 2)   // kurz Netz weg: weiter versuchen
          return
        }
        const jetzt = new Set(r.daten.beitraege.filter(b => laeuft(b.status)).map(b => b.id))
        if ([...liefen.current].some(id => !jetzt.has(id))) guthabenNeuLaden()
        liefen.current = jetzt
        setStand({ daten: r.daten, fehler: null })
        if (jetzt.size) timer = setTimeout(laden, TAKT_MS)
      }).catch(() => { /* abgebrochen */ })
    }
    laden()
    return () => { aus = true; ab.abort(); clearTimeout(timer) }
  }, [versuch, guthabenNeuLaden])

  return { ...stand, nochmal: () => setVersuch(v => v + 1) }
}

function Abschnitt({ titel, text, children, rechts }: { titel: string; text?: string; children: React.ReactNode; rechts?: React.ReactNode }) {
  return (
    <section className="min-w-0" aria-label={titel}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-[-.02em]">{titel}</h2>
          {text && <p className="mt-0.5 text-sm text-leise">{text}</p>}
        </div>
        {rechts}
      </div>
      {children}
    </section>
  )
}

function GuthabenKachel({ u }: { u: UebersichtTexte }) {
  const { guthaben, darfBearbeiten } = usePortal()
  const stufe = guthabenStufe(guthaben)
  const farbe = stufe === 'gruen' ? 'text-[#0a6e5f]' : stufe === 'gelb' ? 'text-[#8a4b05]' : 'text-[#a32424]'
  const rand = stufe === 'gruen' ? 'bg-gruen' : stufe === 'gelb' ? 'bg-gelb' : 'bg-rot'
  const zeit = mmss(guthaben.sekunden)
  const unter = guthaben.sekunden <= 0 ? u.start.guthabenLeer : !guthaben.bestellt ? u.start.guthabenProbe : null
  const inhalt = (
    <>
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${rand}`} />
      <span className="flex items-center gap-2 text-sm font-medium text-leise"><IconUhr className="size-4" />{u.start.guthabenTitel}</span>
      <span className={`mt-1 block font-display text-3xl font-semibold tabular-nums tracking-[-.03em] sm:text-4xl ${farbe}`}>
        {fuellen(u.start.guthabenWert, { zeit })}
      </span>
      {unter && <span className="mt-1 block text-sm text-leise">{unter}</span>}
      <MinutenZaehler u={u} />
      {darfBearbeiten && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-text">
          {u.start.guthabenLink}<IconWinkel className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </>
  )
  const klasse = 'karte group relative block overflow-hidden p-5 pl-6'
  // „Nur anhören" hat keine Guthaben-Seite → Kachel ohne Link.
  return darfBearbeiten
    ? <Link href="/portal/guthaben" aria-label={fuellen(u.start.guthabenLabel, { zeit })} className={`${klasse} transition-shadow hover:shadow-lg`}>{inhalt}</Link>
    : <div className={klasse}>{inhalt}</div>
}

/** Minutenzähler: verbraucht (Monat) · reserviert (läuft) · übrig — als Balken und Zahlen. */
function MinutenZaehler({ u }: { u: UebersichtTexte }) {
  const { guthaben: g } = usePortal()
  const verbraucht = g.verbraucht_monat_s ?? 0, reserviert = g.reserviert_s ?? 0, uebrig = Math.max(0, g.sekunden)
  const gesamt = Math.max(1, verbraucht + reserviert + uebrig)
  const anteil = (x: number) => `${Math.max(0, Math.min(100, (x / gesamt) * 100))}%`
  const min = (s: number) => fuellen(u.start.zaehlerMin, { zeit: mmss(s) })
  const [eins, viele] = u.start.zaehlerLaufend.split('|')
  return (
    <span className="mt-4 block">
      <span role="img" aria-label={fuellen(u.start.zaehlerBalken, { a: mmss(verbraucht), b: mmss(gesamt) })} className="flex h-2.5 w-full overflow-hidden rounded-full bg-grund-2">
        <span className="h-full bg-violett" style={{ width: anteil(verbraucht) }} />
        <span className="h-full animate-pulse bg-cyan" style={{ width: anteil(reserviert) }} />
      </span>
      <span className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
        <span className="min-w-0"><span className="mr-1.5 inline-block size-2 rounded-full bg-violett align-middle" />{u.start.zaehlerVerbraucht}: <b className="tabular-nums">{min(verbraucht)}</b></span>
        <span className="min-w-0"><span className="mr-1.5 inline-block size-2 rounded-full bg-cyan align-middle" />{u.start.zaehlerReserviert}: <b className="tabular-nums">{min(reserviert)}</b>{(g.laufend ?? 0) > 0 && <span className="text-leise"> · {fuellen((g.laufend ?? 0) === 1 ? eins : viele ?? eins, { n: String(g.laufend) })}</span>}</span>
        <span className="min-w-0">{u.start.zaehlerBeitraege}: <b className="tabular-nums">{g.beitraege_monat ?? 0}</b></span>
      </span>
    </span>
  )
}

function NeuKachel({ u }: { u: UebersichtTexte }) {
  return (
    <div className="karte flex flex-col justify-between gap-4 p-5">
      <p className="text-[15px] leading-6 text-text-2">{u.start.neuText}</p>
      <Link href="/portal/neu" className="knopf knopf-bunt w-full py-3.5 text-base sm:w-auto sm:self-start">
        <IconPlus className="size-5" />{u.start.neu}
      </Link>
    </div>
  )
}

function LaufendKarte({ b, u, formate }: { b: BeitragKurz; u: UebersichtTexte; formate: FormatNamen }) {
  const { t, sprache } = usePortal()
  const details = beitragDetails(b, u, formate, sprache)
  return (
    <Link href={beitragHref(b.id)} className="karte group block p-4 transition-shadow hover:shadow-lg sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold text-text group-hover:underline">{b.titel || u.beitrag.ohneTitel}</h3>
          {details && <p className="mt-0.5 break-words text-sm text-leise">{details}</p>}
        </div>
        <span className="flex shrink-0 flex-wrap items-center gap-1.5">
          <StatusChip status={b.status} t={t} />
          {b.ist_probe && <ProbeAbzeichen u={u} />}
        </span>
      </div>
      <div className="mt-4"><Fortschritt b={b} u={u} /></div>
    </Link>
  )
}

function FreigabeKarte({ b, u, formate }: { b: BeitragKurz; u: UebersichtTexte; formate: FormatNamen }) {
  const { sprache } = usePortal()
  const details = beitragDetails(b, u, formate, sprache)
  return (
    <div className="karte flex flex-wrap items-center gap-x-4 gap-y-3 border-violett/30 p-4 sm:p-5">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f3efff] text-[#5b36c4]"><IconDrehbuch className="size-5" /></span>
      <div className="min-w-0 flex-1 basis-48">
        <h3 className="break-words text-base font-semibold">{b.titel || u.beitrag.ohneTitel}</h3>
        <p className="mt-0.5 break-words text-sm text-leise">{[details, datum(b.erstellt_am, sprache)].filter(Boolean).join(' · ')}</p>
      </div>
      <Link href={beitragHref(b.id)} className="knopf knopf-haupt w-full sm:w-auto">
        {u.start.drehbuchPruefen}<IconPfeil className="size-4" />
      </Link>
    </div>
  )
}

function Leer({ u }: { u: UebersichtTexte }) {
  const { darfBearbeiten } = usePortal()
  if (!darfBearbeiten) return <LeerZustand icon={<IconDrehbuch className="size-7" />} titel={u.start.leerTitel} text={u.start.leerHoeren} />
  const wege = [
    { k: 'text' as const, icon: <IconText className="size-6" /> },
    { k: 'webseiten' as const, icon: <IconGlobus className="size-6" /> },
    { k: 'recherche' as const, icon: <IconLupe className="size-6" /> },
  ]
  return (
    <section className="karte px-5 py-8 sm:px-8 sm:py-10" aria-labelledby="leer-titel">
      <h2 id="leer-titel" className="text-2xl font-semibold tracking-[-.02em] sm:text-3xl">{u.start.leerTitel}</h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-leise">{u.start.leerText}</p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {wege.map(({ k, icon }, i) => (
          <li key={k} className="min-w-0 rounded-2xl border border-linie bg-grund p-4">
            <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl bg-cyan-hell text-cyan-tief">{icon}</span>
            <h3 className="mt-3 text-base font-semibold"><span className="sr-only">{i + 1}. </span>{u.start.weg[k].titel}</h3>
            <p className="mt-1 break-words text-sm leading-6 text-leise">{u.start.weg[k].text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href="/portal/neu" className="knopf knopf-bunt w-full px-7 py-3.5 text-base sm:w-auto"><IconPlus className="size-5" />{u.start.erster}</Link>
        <p className="text-sm text-leise">{u.start.probeHinweis}</p>
      </div>
    </section>
  )
}

export default function Uebersicht({ u, formate }: { u: UebersichtTexte; formate: FormatNamen }) {
  const { g, nutzer, darfBearbeiten } = usePortal()
  const ruhig = useReducedMotion()
  const { daten, fehler, nochmal } = useBeitraegeLive()
  const vorname = nutzer.name.trim().split(/\s+/)[0]

  const liste = daten?.beitraege ?? []
  const laufende = liste.filter(b => laeuft(b.status))
  const freigaben = liste.filter(b => b.status === 'freigabe')
  const letzte = liste.filter(b => istFertig(b.status)).slice(0, 5)
  const leer = daten !== null && liste.length === 0
  const ein = ruhig ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } }

  return (
    <div className="grid min-w-0 gap-8">
      <header>
        <h1 className="break-words text-3xl font-semibold tracking-[-.03em] sm:text-4xl">
          {vorname ? fuellen(u.start.hallo, { name: vorname }) : u.start.halloOhneName}
        </h1>
        <p className="mt-2 text-leise">{u.start.satz}</p>
      </header>

      <div className={`grid gap-4 ${darfBearbeiten ? 'md:grid-cols-2' : ''}`}>
        <GuthabenKachel u={u} />
        {darfBearbeiten && <NeuKachel u={u} />}
      </div>

      {fehler && !daten && (
        <Hinweis art="fehler" aktion={<button type="button" onClick={nochmal} className="knopf knopf-zweit !px-3.5 !py-1.5 text-sm">{g.knopf.nochmal}</button>}>
          {u.start.ladeFehler} {fehlerText(fehler, g.fehler)}
        </Hinweis>
      )}

      {!daten && !fehler && (
        <div className="grid gap-3" aria-busy="true">
          <p className="sr-only" role="status">{g.laedt}</p>
          {[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-grund-2" />)}
        </div>
      )}

      {leer && <Leer u={u} />}

      {freigaben.length > 0 && (
        <Abschnitt titel={u.start.freigabeTitel} text={u.start.freigabeText}>
          <div className="grid gap-3">{freigaben.map(b => <FreigabeKarte key={b.id} b={b} u={u} formate={formate} />)}</div>
        </Abschnitt>
      )}

      {laufende.length > 0 && (
        <Abschnitt titel={u.start.laufendTitel} text={u.start.laufendText}>
          <ul className="grid gap-3 lg:grid-cols-2">
            <AnimatePresence initial={false}>
              {laufende.map(b => (
                <motion.li key={b.id} layout={!ruhig} {...ein} className="min-w-0"><LaufendKarte b={b} u={u} formate={formate} /></motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Abschnitt>
      )}

      {daten && !leer && (
        <Abschnitt titel={u.start.letzteTitel}
          rechts={<Link href="/portal/beitraege" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-text hover:underline">{u.start.alle}<IconWinkel className="size-4" /></Link>}>
          {letzte.length ? (
            <ul className="grid gap-3 md:gap-0 md:divide-y md:divide-linie md:overflow-hidden md:rounded-[var(--radius-kf)] md:border md:border-linie md:bg-karte">
              {letzte.map(b => <BeitragZeile key={b.id} b={b} u={u} formate={formate} />)}
            </ul>
          ) : (
            <p className="karte px-5 py-6 text-sm text-leise">{u.start.letzteLeer}</p>
          )}
        </Abschnitt>
      )}
    </div>
  )
}
