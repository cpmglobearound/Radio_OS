'use client'
// Alle Beiträge der Firma mit Filter nach Stand, „Mehr laden" und Live-Fortschritt für laufende Beiträge.
//
// Filter und API: GET /api/v1/beitraege kennt nur einen exakten `status=`. Jeder Filter hat deshalb eine oder mehrere
// „Quellen" (je Quelle eine seitenweise Anfrage mit eigenem Cursor) und optional eine Bedingung im Browser:
//   Alle            → eine Quelle ohne status
//   In Arbeit       → Quelle ohne status, im Browser auf laeuft() gefiltert (die API hat dafür keinen Wert)
//   Wartet auf Freig→ status=freigabe
//   Fertig          → zwei Quellen status=fertig + status=fertig_mit_hinweisen, nach Datum zusammengeführt
//   Fehlgeschlagen  → status=fehlgeschlagen
// Beim Zusammenführen zeigen wir nur Beiträge bis zur „Grenze": dem jüngsten der jeweils ältesten geladenen Einträge aller
// Quellen, die noch mehr haben. Ältere könnten in einer anderen Quelle fehlen — sie erscheinen nach „Mehr laden" in der
// richtigen Reihenfolge. So bleibt die Liste lückenlos nach Datum sortiert.
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { laeuft } from '@/components/portal/anzeige'
import { usePortal } from '@/components/portal/Kontext'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import { IconFilter, IconListe, IconPlus } from '@/components/gemeinsam/Icons'
import type { UebersichtTexte } from '@/lib/i18n/texte/uebersicht'
import BeitragZeile, { BeitragKopf } from './BeitragZeile'
import { FILTER, seiteLaden, type BeitragKurz, type FilterId, type FormatNamen } from './daten'

const QUELLEN: Record<FilterId, (string | undefined)[]> = {
  alle: [undefined],
  arbeit: [undefined],
  freigabe: ['freigabe'],
  fertig: ['fertig', 'fertig_mit_hinweisen'],
  fehler: ['fehlgeschlagen'],
}
const PASST: Partial<Record<FilterId, (b: BeitragKurz) => boolean>> = { arbeit: b => laeuft(b.status) }

const TAKT_MS = 3000

interface Quelle { status?: string; eintraege: BeitragKurz[]; cursor: string | null }
interface Stand { filter: FilterId; quellen: Quelle[] }

const neuerZuerst = (a: BeitragKurz, b: BeitragKurz) => (a.erstellt_am < b.erstellt_am ? 1 : a.erstellt_am > b.erstellt_am ? -1 : a.id < b.id ? 1 : -1)

function zusammenfuehren(quellen: Quelle[]) {
  const alle = quellen.flatMap(q => q.eintraege).sort(neuerZuerst)
  const grenzen = quellen.filter(q => q.cursor && q.eintraege.length).map(q => q.eintraege[q.eintraege.length - 1].erstellt_am)
  if (!grenzen.length) return alle
  const grenze = grenzen.reduce((a, b) => (a > b ? a : b))
  return alle.filter(b => b.erstellt_am >= grenze)
}

async function quellenLaden(filter: FilterId, vorher: Quelle[] | null, signal?: AbortSignal) {
  const basis: Quelle[] = vorher ?? QUELLEN[filter].map(status => ({ status, eintraege: [], cursor: null }))
  const erg = await Promise.all(basis.map(async q => {
    if (vorher && !q.cursor) return { q, ok: true as const }
    const r = await seiteLaden({ status: q.status, cursor: vorher ? q.cursor : null, signal })
    if (!r.ok) return { q, ok: false as const, code: r.code }
    const bekannt = new Set(q.eintraege.map(b => b.id))
    return { q: { ...q, eintraege: [...q.eintraege, ...r.daten.beitraege.filter(b => !bekannt.has(b.id))], cursor: r.daten.next_cursor }, ok: true as const }
  }))
  const fehler = erg.find(e => !e.ok)
  return { quellen: erg.map(e => e.q), fehler: fehler && !fehler.ok ? fehler.code : null }
}

export default function BeitragsListe({ u, formate, startFilter }: { u: UebersichtTexte; formate: FormatNamen; startFilter: FilterId }) {
  const { g, darfBearbeiten, guthabenNeuLaden } = usePortal()
  const [filter, setFilter] = useState<FilterId>(startFilter)
  const [stand, setStand] = useState<Stand | null>(null)
  const [fehler, setFehler] = useState<{ filter: FilterId; code: string } | null>(null)
  const [versuch, setVersuch] = useState(0)
  const [mehr, setMehr] = useState<'ruhe' | 'laedt' | 'fehler'>('ruhe')

  // Erste Seite je Filter. Solange stand.filter ≠ filter, zeigt die Seite „lädt".
  useEffect(() => {
    let aus = false
    const ab = new AbortController()
    quellenLaden(filter, null, ab.signal).then(r => {
      if (aus) return
      if (r.fehler) { setFehler({ filter, code: r.fehler }); return }
      setFehler(null)
      setMehr('ruhe')
      setStand({ filter, quellen: r.quellen })
    }).catch(() => { /* abgebrochen */ })
    return () => { aus = true; ab.abort() }
  }, [filter, versuch])

  const aktuell = stand?.filter === filter ? stand : null
  const zusammen = useMemo(() => (aktuell ? zusammenfuehren(aktuell.quellen) : []), [aktuell])
  const passt = PASST[filter]
  const sichtbar = passt ? zusammen.filter(passt) : zusammen
  const hatMehr = !!aktuell?.quellen.some(q => q.cursor)
  const laufendeIds = sichtbar.filter(b => laeuft(b.status)).map(b => b.id).join(',')

  // Live: solange sichtbare Beiträge laufen, alle 3 s die neueste Seite holen und diese Einträge auffrischen.
  const liefen = useRef<string[]>([])
  useEffect(() => { liefen.current = laufendeIds ? laufendeIds.split(',') : [] }, [laufendeIds])
  useEffect(() => {
    if (!laufendeIds) return
    let aus = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const ab = new AbortController()
    const runde = () => {
      seiteLaden({ signal: ab.signal }).then(r => {
        if (aus) return
        if (r.ok) {
          const neu = new Map(r.daten.beitraege.map(b => [b.id, b]))
          if (liefen.current.some(id => { const b = neu.get(id); return b && !laeuft(b.status) })) guthabenNeuLaden()
          setStand(s => s && { ...s, quellen: s.quellen.map(q => ({ ...q, eintraege: q.eintraege.map(b => neu.get(b.id) ?? b) })) })
        }
        timer = setTimeout(runde, r.ok ? TAKT_MS : TAKT_MS * 2)
      }).catch(() => { /* abgebrochen */ })
    }
    timer = setTimeout(runde, TAKT_MS)
    return () => { aus = true; ab.abort(); clearTimeout(timer) }
  }, [laufendeIds, guthabenNeuLaden])

  function waehlen(f: FilterId) {
    if (f === filter) return
    setFilter(f)
    const url = new URL(window.location.href)
    if (f === 'alle') url.searchParams.delete('filter'); else url.searchParams.set('filter', f)
    window.history.replaceState(window.history.state, '', url)
  }

  async function mehrLaden() {
    if (!aktuell || mehr === 'laedt') return
    setMehr('laedt')
    const r = await quellenLaden(aktuell.filter, aktuell.quellen)
    setStand(s => (s && s.filter === aktuell.filter ? { ...s, quellen: r.quellen } : s))
    setMehr(r.fehler ? 'fehler' : 'ruhe')
  }

  const fehlerJetzt = fehler?.filter === filter ? fehler.code : null
  const nichtsDa = aktuell && filter === 'alle' && zusammen.length === 0 && !hatMehr

  return (
    <div className="grid min-w-0 gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{u.liste.titel}</h1>
          <p className="mt-2 max-w-2xl text-leise">{u.liste.satz}</p>
        </div>
        {darfBearbeiten && <Link href="/portal/neu" className="knopf knopf-bunt w-full sm:w-auto"><IconPlus className="size-5" />{u.liste.neu}</Link>}
      </header>

      <div role="group" aria-label={u.liste.filterLabel} className="flex flex-wrap items-center gap-2">
        <IconFilter aria-hidden="true" className="size-4 text-leise" />
        {FILTER.map(f => (
          <button key={f} type="button" aria-pressed={f === filter} onClick={() => waehlen(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${f === filter ? 'border-text bg-text text-white' : 'border-linie-2 bg-karte text-text-2 hover:border-text hover:text-text'}`}>
            {u.liste.filter[f]}
          </button>
        ))}
      </div>

      {fehlerJetzt && (
        <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit !px-3.5 !py-1.5 text-sm">{g.knopf.nochmal}</button>}>
          {fehlerText(fehlerJetzt, g.fehler)}
        </Hinweis>
      )}

      {!aktuell && !fehlerJetzt && (
        <div className="grid gap-3" aria-busy="true">
          <p className="sr-only" role="status">{g.laedt}</p>
          {[0, 1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-grund-2" />)}
        </div>
      )}

      {aktuell && nichtsDa && (
        <LeerZustand icon={<IconListe className="size-7" />} titel={u.liste.leerTitel} text={darfBearbeiten ? u.liste.leerText : u.liste.leerTextHoeren}>
          {darfBearbeiten && <Link href="/portal/neu" className="knopf knopf-bunt"><IconPlus className="size-5" />{u.liste.neu}</Link>}
        </LeerZustand>
      )}

      {aktuell && !nichtsDa && sichtbar.length === 0 && (
        <LeerZustand icon={<IconFilter className="size-7" />} titel={u.liste.filterLeerTitel} text={hatMehr ? u.liste.filterLeerMehr : u.liste.filterLeerText}>
          {hatMehr && <button type="button" onClick={mehrLaden} disabled={mehr === 'laedt'} className="knopf knopf-zweit">{mehr === 'laedt' ? g.laedt : g.knopf.mehrLaden}</button>}
          <button type="button" onClick={() => waehlen('alle')} className="knopf knopf-haupt">{u.liste.filterZuruecksetzen}</button>
        </LeerZustand>
      )}

      {aktuell && sichtbar.length > 0 && (
        <div className="grid gap-4">
          <p className="text-sm text-leise" role="status">{sichtbar.length === 1 ? u.liste.anzahlEins : fuellen(u.liste.anzahl, { n: sichtbar.length })}</p>
          <div className="md:overflow-hidden md:rounded-[var(--radius-kf)] md:border md:border-linie md:bg-karte">
            <BeitragKopf u={u} />
            <ul className="grid gap-3 md:gap-0 md:divide-y md:divide-linie">
              {sichtbar.map(b => <BeitragZeile key={b.id} b={b} u={u} formate={formate} />)}
            </ul>
          </div>
          {mehr === 'fehler' && <Hinweis art="fehler">{u.liste.mehrFehler}</Hinweis>}
          {hatMehr
            ? <div className="flex justify-center"><button type="button" onClick={mehrLaden} disabled={mehr === 'laedt'} className="knopf knopf-zweit">{mehr === 'laedt' ? g.laedt : g.knopf.mehrLaden}</button></div>
            : <p className="text-center text-sm text-leise">{u.liste.ende}</p>}
        </div>
      )}
    </div>
  )
}
