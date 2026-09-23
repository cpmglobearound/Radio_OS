'use client'
// Guthaben: Minuten übrig (groß, farbig), Anteil an der Gutschrift, Minuten bestellen (per Rechnung), Kontobuch, wie abgerechnet wird.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { guthabenStufe, usePortal, type Guthaben } from '@/components/portal/Kontext'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { datumZeit, fuellen, mmss, mmssVorzeichen } from '@/components/gemeinsam/format'
import { IconBeleg, IconInfo, IconPfeil, IconPlus, IconRunter, IconUhr, IconWinkel } from '@/components/gemeinsam/Icons'
import { darf } from '@/components/portal/rechte'
import BestellBereich from '@/components/bestellung/BestellBereich'
import type { UebersichtTexte } from '@/lib/i18n/texte/uebersicht'
import type { BestellTexte } from '@/lib/i18n/texte/bestellung'
import { beitragHref } from './daten'

interface Buchung { id: string; art: string; sekunden: number; beitrag_id: string | null; notiz: string | null; zeit: string }
type Antwort = Guthaben & { buchungen: Buchung[] }

const FARBE = {
  gruen: { text: 'text-[#0a6e5f]', balken: 'bg-gruen' },
  gelb: { text: 'text-[#8a4b05]', balken: 'bg-gelb' },
  rot: { text: 'text-[#a32424]', balken: 'bg-rot' },
}

function artText(art: string, u: UebersichtTexte) {
  return (u.guthaben.art as Record<string, { name: string; text: string }>)[art] ?? u.guthaben.art.unbekannt
}

function Betrag({ s }: { s: number }) {
  return <span className={`font-semibold tabular-nums ${s < 0 ? 'text-[#a32424]' : s > 0 ? 'text-[#0a6e5f]' : 'text-leise'}`}>{mmssVorzeichen(s)}</span>
}

function BuchungInhalt({ b, u }: { b: Buchung; u: UebersichtTexte }) {
  const a = artText(b.art, u)
  const notiz = b.notiz ? (u.guthaben.notiz[b.notiz] ?? b.notiz) : null
  return (
    <>
      <span className="block font-semibold text-text">{a.name}</span>
      {(a.text || notiz) && <span className="block break-words text-sm text-leise">{[a.text, notiz].filter(Boolean).join(' — ')}</span>}
    </>
  )
}

function BeitragLink({ id, u }: { id: string; u: UebersichtTexte }) {
  return (
    <Link href={beitragHref(id)} className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-text underline-offset-2 hover:underline">
      {u.guthaben.zumBeitrag}<IconWinkel className="size-3.5" />
    </Link>
  )
}

function Kontobuch({ buchungen, u }: { buchungen: Buchung[]; u: UebersichtTexte }) {
  const { sprache } = usePortal()
  return (
    <>
      {/* Handy: Liste */}
      <ul className="grid gap-2 md:hidden">
        {buchungen.map(b => (
          <li key={b.id} className="rounded-2xl border border-linie bg-karte p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><BuchungInhalt b={b} u={u} /></div>
              <Betrag s={b.sekunden} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-leise">
              <span>{datumZeit(b.zeit, sprache)}</span>
              {b.beitrag_id && <BeitragLink id={b.beitrag_id} u={u} />}
            </div>
          </li>
        ))}
      </ul>
      {/* Ab md: Tabelle */}
      <div className="hidden overflow-hidden rounded-[var(--radius-kf)] border border-linie bg-karte md:block">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">{u.guthaben.buchTitel}</caption>
          <thead className="border-b border-linie text-xs uppercase tracking-wide text-leise">
            <tr>
              <th scope="col" className="w-44 px-4 py-2.5 font-semibold">{u.guthaben.spalten.datum}</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">{u.guthaben.spalten.art}</th>
              <th scope="col" className="w-36 px-4 py-2.5 font-semibold">{u.guthaben.spalten.beitrag}</th>
              <th scope="col" className="w-28 px-4 py-2.5 text-right font-semibold">{u.guthaben.spalten.sekunden}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linie">
            {buchungen.map(b => (
              <tr key={b.id} className="align-top">
                <td className="px-4 py-3 text-leise">{datumZeit(b.zeit, sprache)}</td>
                <td className="px-4 py-3"><BuchungInhalt b={b} u={u} /></td>
                <td className="px-4 py-3">{b.beitrag_id ? <BeitragLink id={b.beitrag_id} u={u} /> : <span aria-hidden="true" className="text-leise">—</span>}</td>
                <td className="px-4 py-3 text-right"><Betrag s={b.sekunden} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function GuthabenSeite({ u, b, preiseHref }: { u: UebersichtTexte; b: BestellTexte; preiseHref: string }) {
  const { g, rolle, guthaben: kopf } = usePortal()
  const ruhig = useReducedMotion()
  const [daten, setDaten] = useState<Antwort | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [versuch, setVersuch] = useState(0)

  useEffect(() => {
    let aus = false
    api<Antwort>('/api/v1/guthaben').then(r => {
      if (aus) return
      if (r.ok) { setDaten(r.daten); setFehler(null) } else setFehler(r.code)
    })
    return () => { aus = true }
  }, [versuch])

  // Bis das Kontobuch da ist, zeigen wir die Werte der Kopfzeile — kein leerer Kasten.
  const gh: Guthaben = daten ?? kopf
  const stufe = guthabenStufe(gh)
  const f = FARBE[stufe]
  const anteil = gh.gutschrift_sekunden > 0 ? Math.min(100, Math.max(0, Math.round((gh.sekunden / gh.gutschrift_sekunden) * 100))) : gh.sekunden > 0 ? 100 : 0
  const darfBestellen = darf(rolle, 'admin')

  return (
    <div className="grid min-w-0 gap-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{u.guthaben.titel}</h1>
        <p className="mt-2 max-w-2xl text-leise">{u.guthaben.satz}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="karte p-5 sm:p-6" aria-labelledby="guthaben-wert">
          <p className="flex items-center gap-2 text-sm font-medium text-leise"><IconUhr className="size-4" />{u.start.guthabenTitel}</p>
          <p id="guthaben-wert" className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className={`font-display text-5xl font-semibold tabular-nums tracking-[-.04em] sm:text-6xl ${f.text}`}>{mmss(gh.sekunden)}</span>
            <span className="text-lg font-semibold text-text-2">{u.guthaben.uebrig}</span>
          </p>
          {gh.gutschrift_sekunden > 0 && (
            <div className="mt-4">
              <div role="progressbar" aria-label={u.guthaben.anteil} aria-valuemin={0} aria-valuemax={100} aria-valuenow={anteil} className="h-3 overflow-hidden rounded-full bg-grund-2">
                <motion.div className={`h-full rounded-full ${f.balken}`} initial={ruhig ? false : { width: 0 }} animate={{ width: `${anteil}%` }} transition={{ duration: ruhig ? 0 : 0.8, ease: 'easeOut' }} />
              </div>
              <p className="mt-2 text-sm text-leise">{fuellen(u.guthaben.vonGesamt, { zeit: mmss(gh.gutschrift_sekunden) })}</p>
            </div>
          )}
          <div className="mt-4 grid gap-2">
            {gh.sekunden <= 0 ? <Hinweis art="fehler">{u.guthaben.leer}</Hinweis> : stufe !== 'gruen' ? <Hinweis art="warnung">{u.guthaben.knapp}</Hinweis> : null}
            {!gh.bestellt && <Hinweis art="info">{u.guthaben.probe}</Hinweis>}
          </div>
        </section>

        <section className="karte flex flex-col gap-4 border-cyan/30 p-5 sm:p-6" aria-labelledby="kaufen-titel">
          <h2 id="kaufen-titel" className="text-xl font-semibold">{u.guthaben.kaufenTitel}</h2>
          <p className="text-[15px] leading-7 text-text-2">{darfBestellen ? u.guthaben.kaufenText : b.bereich.keineRechte}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            {darfBestellen && <a href="#bestellen" className="knopf knopf-haupt">{u.guthaben.kaufenKnopf}<IconRunter className="size-4" /></a>}
            <Link href={preiseHref} className="knopf knopf-zweit">{u.guthaben.preise}<IconPfeil className="size-4" /></Link>
          </div>
        </section>
      </div>

      <BestellBereich t={b} />

      <section className="rounded-[var(--radius-kf)] border border-linie bg-grund-2/60 p-5 sm:p-6" aria-labelledby="wie-titel">
        <h2 id="wie-titel" className="flex items-center gap-2 text-lg font-semibold"><IconInfo className="size-5 text-cyan-tief" />{u.guthaben.wieTitel}</h2>
        <ol className="mt-3 grid gap-2 text-[15px] leading-6 text-text-2 sm:grid-cols-2">
          {u.guthaben.wie.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-karte text-xs font-bold text-cyan-text">{i + 1}</span>
              <span className="min-w-0">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="buch-titel" className="min-w-0">
        <h2 id="buch-titel" className="text-xl font-semibold tracking-[-.02em]">{u.guthaben.buchTitel}</h2>
        <p className="mb-3 mt-0.5 text-sm text-leise">{u.guthaben.buchSatz}</p>
        {fehler && !daten && (
          <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit !px-3.5 !py-1.5 text-sm">{g.knopf.nochmal}</button>}>
            {u.guthaben.ladeFehler} {fehlerText(fehler, g.fehler)}
          </Hinweis>
        )}
        {!daten && !fehler && (
          <div className="grid gap-2" aria-busy="true">
            <p className="sr-only" role="status">{g.laedt}</p>
            {[0, 1, 2].map(i => <div key={i} className="h-14 animate-pulse rounded-2xl bg-grund-2" />)}
          </div>
        )}
        {daten && daten.buchungen.length === 0 && (
          <LeerZustand icon={<IconBeleg className="size-7" />} titel={u.guthaben.leerTitel} text={u.guthaben.leerText}>
            <Link href="/portal/neu" className="knopf knopf-bunt"><IconPlus className="size-5" />{u.guthaben.leerKnopf}</Link>
          </LeerZustand>
        )}
        {daten && daten.buchungen.length > 0 && <Kontobuch buchungen={daten.buchungen} u={u} />}
      </section>
    </div>
  )
}
