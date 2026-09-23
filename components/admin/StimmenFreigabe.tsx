'use client'
// Admin: Freigabe-Warteschlange der Stimmen (13 §3, Regel 7). Filter nach Zustand je Sprache, gruppiert je Anbieter.
// Änderungen gehen sofort per PATCH (optimistisch); schlägt das fehl, kommt der alte Stand der geänderten Felder zurück.
import { useEffect, useId, useRef, useState } from 'react'
import type { AdminTexte } from '@/lib/i18n/texte/admin'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { IconHaken, IconKreuz, IconMikro } from '@/components/gemeinsam/Icons'
import { usePortal } from '@/components/portal/Kontext'
import StimmKarte from './StimmKarte'
import { passtZu, ZUSTAENDE, type AdminPatch, type AdminStimme, type Filter } from './typen'

type Daten = { stimmen: AdminStimme[] } | { fehler: string }
type Meldung = { art: 'fehler' | 'erfolg'; text: string }

/** Nur die im PATCH genannten Felder auf den alten Stand zurücksetzen — spätere andere Änderungen bleiben. */
function zuruecksetzen(akt: AdminStimme, alt: AdminStimme, body: AdminPatch): AdminStimme {
  const n: AdminStimme = { ...akt }
  for (const k of ['sichtbar', 'geschlecht', 'alter', 'stil', 'kann_lachen', 'name'] as const) {
    if (body[k] !== undefined) (n as unknown as Record<string, unknown>)[k] = alt[k]
  }
  if (body.sprachen) {
    const codes = new Set(body.sprachen.map(x => x.code))
    n.sprachen = akt.sprachen.map(sp => (codes.has(sp.code) ? alt.sprachen.find(a => a.code === sp.code) ?? sp : sp))
  }
  return n
}

export default function StimmenFreigabe({ t }: { t: AdminTexte }) {
  const { g, nutzer } = usePortal()
  const id = useId()
  const [daten, setDaten] = useState<Daten | null>(null)
  const [versuch, setVersuch] = useState(0)
  const [filterWahl, setFilterWahl] = useState<Filter | null>(null)
  // Bearbeitete Stimmen bleiben im aktuellen Filter stehen, bis der Filter wechselt — sonst verschwindet die Karte mitten in der Arbeit.
  const [behalten, setBehalten] = useState<string[]>([])
  const [meldung, setMeldung] = useState<Meldung | null>(null)
  const stand = useRef(new Map<string, number>())

  useEffect(() => {
    let aus = false
    api<{ stimmen: AdminStimme[] }>('/api/admin/stimmen').then(r => {
      if (!aus) setDaten(r.ok ? { stimmen: r.daten.stimmen } : { fehler: r.code })
    })
    return () => { aus = true }
  }, [versuch])

  const stimmen = daten && 'stimmen' in daten ? daten.stimmen : []
  const anzahl = Object.fromEntries((['alle', ...ZUSTAENDE] as Filter[]).map(f => [f, stimmen.filter(s => passtZu(s, f)).length])) as Record<Filter, number>
  const filter: Filter = filterWahl ?? (anzahl.automatisch ? 'automatisch' : anzahl.offen ? 'offen' : 'alle')
  const sichtbare = stimmen.filter(s => passtZu(s, filter) || behalten.includes(s.id))
  const gruppen: [string, AdminStimme[]][] = []
  for (const s of sichtbare) {
    const gr = gruppen.find(([a]) => a === s.anbieter_id)
    if (gr) gr[1].push(s)
    else gruppen.push([s.anbieter_id, [s]])
  }

  function filterWaehlen(f: Filter) {
    setFilterWahl(f)
    setBehalten([])
  }

  function ersetzen(sid: string, f: (s: AdminStimme) => AdminStimme) {
    setDaten(d => (d && 'stimmen' in d ? { stimmen: d.stimmen.map(s => (s.id === sid ? f(s) : s)) } : d))
  }

  /** PATCH mit optimistischem Stand. Gibt true zurück, wenn gespeichert. */
  async function patchen(vorher: AdminStimme, body: AdminPatch, nachher: AdminStimme): Promise<boolean> {
    const sid = vorher.id
    const nr = (stand.current.get(sid) ?? 0) + 1
    stand.current.set(sid, nr)
    setMeldung(null)
    setBehalten(b => (b.includes(sid) ? b : [...b, sid]))
    ersetzen(sid, () => nachher)
    const r = await api<{ stimme: Omit<AdminStimme, 'hoerproben'> }>(`/api/admin/stimmen/${encodeURIComponent(sid)}`, { method: 'PATCH', body })
    if (!r.ok) {
      ersetzen(sid, akt => zuruecksetzen(akt, vorher, body))
      const genauer = (t.fehler as Record<string, string>)[r.code]
      setMeldung({ art: 'fehler', text: `${vorher.name}: ${t.fehler.speichern} ${genauer ?? fehlerText(r.code, g.fehler)}` })
      return false
    }
    // Nur die Antwort der jüngsten Änderung übernehmen; Hörproben-Adressen stehen nur in der Liste.
    if (stand.current.get(sid) === nr) ersetzen(sid, akt => ({ ...r.daten.stimme, hoerproben: akt.hoerproben }))
    return true
  }

  const FILTER: Filter[] = ['offen', 'automatisch', 'freigegeben', 'abgelehnt', 'alle']

  return (
    <div className="min-w-0 space-y-6">
      <header className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{t.titel}</h1>
        <p className="mt-2 max-w-2xl text-leise">{t.einleitung}</p>
      </header>

      <Hinweis art="warnung">{t.band}</Hinweis>

      {daten && 'stimmen' in daten && (
        <div className="min-w-0">
          <div id={`${id}-f`} className="etikett">{t.filter.label}</div>
          <div role="group" aria-labelledby={`${id}-f`} className="flex flex-wrap gap-2">
            {FILTER.map(f => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => filterWaehlen(f)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors ${filter === f ? 'border-text bg-text text-white' : 'border-linie-2 bg-karte text-text-2 hover:border-text'}`}>
                <span className="min-w-0 break-words">{t.filter[f]}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${filter === f ? 'bg-white/20' : f === 'automatisch' && anzahl[f] ? 'bg-gelb-hell text-[#8a4b05]' : 'bg-grund-2 text-leise'}`}>{anzahl[f]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {meldung && (
        <Hinweis art={meldung.art} aktion={
          <button type="button" onClick={() => setMeldung(null)} aria-label={g.knopf.schliessen} className="inline-flex size-7 items-center justify-center rounded-full hover:bg-karte/60">
            <IconKreuz className="size-4" />
          </button>
        }>{meldung.text}</Hinweis>
      )}

      {!daten ? (
        <p role="status" className="karte animate-pulse p-6 text-leise">{t.laedt}</p>
      ) : 'fehler' in daten ? (
        <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit py-2">{g.knopf.nochmal}</button>}>
          {t.ladeFehler} {fehlerText(daten.fehler, g.fehler)}
        </Hinweis>
      ) : sichtbare.length === 0 ? (
        <LeerZustand icon={filter === 'alle' ? <IconMikro className="size-7" /> : <IconHaken className="size-7" />} titel={t.leer.titel} text={t.leer.text}>
          {filter !== 'alle' && <button type="button" onClick={() => filterWaehlen('alle')} className="knopf knopf-haupt">{t.leer.alle}</button>}
        </LeerZustand>
      ) : (
        gruppen.map(([anbieter, liste]) => (
          <section key={anbieter} aria-labelledby={`${id}-${anbieter}`} className="min-w-0 space-y-3">
            <h2 id={`${id}-${anbieter}`} className="break-words text-xl font-semibold">
              {fuellen(t.anbieter, { name: anbieter, n: liste.length })}
            </h2>
            <ul className="grid min-w-0 gap-4">
              {liste.map(s => (
                <li key={s.id} className="min-w-0">
                  <StimmKarte s={s} t={t} filter={filter} email={nutzer.email} patchen={patchen} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
