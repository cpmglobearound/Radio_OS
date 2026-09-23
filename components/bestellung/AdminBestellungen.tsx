'use client'
// Admin: Bestellungen per E-Mail abarbeiten. Nach Zahlungseingang freischalten, sonst stornieren; Abos monatlich verlängern.
// Je Zustand eine Anfrage (die API liefert höchstens 200 je Abruf) — so stimmen die Zahlen an den Filtern.
import { useEffect, useId, useState, type ReactNode } from 'react'
import { usePortal } from '@/components/portal/Kontext'
import { api } from '@/components/gemeinsam/api'
import Dialog from '@/components/gemeinsam/Dialog'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { datumZeit, fuellen, locale } from '@/components/gemeinsam/format'
import { IconBeleg, IconHaken, IconKreuz, IconNeu } from '@/components/gemeinsam/Icons'
import type { UiSprache } from '@/lib/sprachen'
import type { BestellTexte } from '@/lib/i18n/texte/bestellung'
import { BestellChip, bestellFehler, euro, type BestellStatus, type Bestellung } from './gemeinsam'
import { BESTELLUNGEN_GEAENDERT } from './useOffeneBestellungen'

interface AdminBestellung extends Bestellung {
  nutzer_id: string; erledigt_von: string | null
  mandant?: { id: string; name: string; art: string; land: string | null; tarif_id: string | null }
  nutzer?: { id: string; name: string; email: string }
}
type Filter = BestellStatus | 'alle'
type Aktion = 'freischalten' | 'stornieren' | 'verlaengern'
type Meldung = { art: 'fehler' | 'erfolg'; text: string }

const STATUS: BestellStatus[] = ['offen', 'freigeschaltet', 'storniert']
const FILTER: Filter[] = ['offen', 'freigeschaltet', 'storniert', 'alle']

function landName(land: string | null | undefined, sprache: UiSprache) {
  if (!land) return null
  try { return new Intl.DisplayNames([locale(sprache)], { type: 'region' }).of(land.toUpperCase()) ?? land } catch { return land }
}

function Feld({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-leise">{titel}</dt>
      <dd className="mt-0.5 min-w-0 break-words text-[15px] text-text">{children}</dd>
    </div>
  )
}

export default function AdminBestellungen({ t }: { t: BestellTexte }) {
  const { g, sprache } = usePortal()
  const id = useId()
  const a = t.admin
  const [daten, setDaten] = useState<Record<BestellStatus, AdminBestellung[]> | { fehler: string } | null>(null)
  const [versuch, setVersuch] = useState(0)
  const [filter, setFilter] = useState<Filter>('offen')
  const [laeuft, setLaeuft] = useState<string | null>(null)
  const [frage, setFrage] = useState<{ b: AdminBestellung; aktion: 'stornieren' | 'verlaengern' } | null>(null)
  const [meldung, setMeldung] = useState<Meldung | null>(null)

  useEffect(() => {
    let aus = false
    Promise.all(STATUS.map(s => api<{ bestellungen: AdminBestellung[] }>(`/api/admin/bestellungen?status=${s}`))).then(rs => {
      if (aus) return
      const kaputt = rs.find(r => !r.ok)
      if (kaputt && !kaputt.ok) { setDaten({ fehler: kaputt.code }); return }
      setDaten(Object.fromEntries(STATUS.map((s, i) => { const r = rs[i]; return [s, r.ok ? r.daten.bestellungen : []] })) as Record<BestellStatus, AdminBestellung[]>)
    })
    return () => { aus = true }
  }, [versuch])

  const listen = daten && !('fehler' in daten) ? daten : null
  const anzahl = (f: Filter) => (listen ? (f === 'alle' ? STATUS.reduce((n, s) => n + listen[s].length, 0) : listen[f].length) : 0)
  const sichtbar = listen
    ? filter === 'alle' ? STATUS.flatMap(s => listen[s]).sort((x, y) => y.erstellt_am.localeCompare(x.erstellt_am)) : listen[filter]
    : []

  const paket = (b: AdminBestellung) => b.bezeichnung
  const firma = (b: AdminBestellung) => b.mandant?.name ?? a.unbekannt

  async function ausfuehren(b: AdminBestellung, aktion: Aktion) {
    setLaeuft(b.id); setMeldung(null)
    const r = await api(`/api/admin/bestellungen/${encodeURIComponent(b.id)}`, { body: { aktion } })
    setLaeuft(null); setFrage(null)
    if (!r.ok) { setMeldung({ art: 'fehler', text: `${paket(b)} — ${firma(b)}: ${bestellFehler(r.code, t, g.fehler)}` }); setVersuch(v => v + 1); return }
    setMeldung({ art: 'erfolg', text: `${paket(b)} — ${firma(b)}: ${a.erfolg[aktion]}` })
    setVersuch(v => v + 1)
    window.dispatchEvent(new Event(BESTELLUNGEN_GEAENDERT))
  }

  return (
    <div className="min-w-0 space-y-6">
      <header className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{a.titel}</h1>
        <p className="mt-2 max-w-2xl text-leise">{a.einleitung}</p>
      </header>

      {listen && (
        <div className="min-w-0">
          <div id={`${id}-f`} className="etikett">{a.filter.label}</div>
          <div role="group" aria-labelledby={`${id}-f`} className="flex flex-wrap gap-2">
            {FILTER.map(f => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors ${filter === f ? 'border-text bg-text text-white' : 'border-linie-2 bg-karte text-text-2 hover:border-text'}`}>
                <span className="min-w-0 break-words">{a.filter[f]}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${filter === f ? 'bg-white/20' : f === 'offen' && anzahl(f) ? 'bg-gelb-hell text-[#8a4b05]' : 'bg-grund-2 text-leise'}`}>{anzahl(f)}</span>
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
        <p role="status" className="karte animate-pulse p-6 text-leise">{a.laedt}</p>
      ) : 'fehler' in daten ? (
        <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit py-2">{g.knopf.nochmal}</button>}>
          {a.ladeFehler} {bestellFehler(daten.fehler, t, g.fehler)}
        </Hinweis>
      ) : sichtbar.length === 0 ? (
        <LeerZustand icon={filter === 'offen' ? <IconHaken className="size-7" /> : <IconBeleg className="size-7" />} titel={a.leer.titel} text={a.leer.text}>
          {filter !== 'alle' && <button type="button" onClick={() => setFilter('alle')} className="knopf knopf-haupt">{a.leer.alle}</button>}
        </LeerZustand>
      ) : (
        <ul className="grid min-w-0 gap-4">
          {sichtbar.map(b => {
            const land = landName(b.mandant?.land, sprache)
            const artName = b.mandant ? a.art[b.mandant.art] ?? b.mandant.art : null
            const beschaeftigt = laeuft === b.id
            return (
              <li key={b.id} className="karte min-w-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-leise">{datumZeit(b.erstellt_am, sprache)}</p>
                    <h2 className="mt-0.5 break-words text-lg font-semibold">{paket(b)}</h2>
                  </div>
                  <BestellChip status={b.status} t={t} />
                </div>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Feld titel={a.firma}>
                    <span className="block font-semibold">{firma(b)}</span>
                    {(artName || land) && <span className="block text-sm text-leise">{[artName, land].filter(Boolean).join(' · ')}</span>}
                  </Feld>
                  <Feld titel={a.besteller}>
                    <span className="block">{b.nutzer?.name ?? a.unbekannt}</span>
                    {b.nutzer?.email && <a href={`mailto:${b.nutzer.email}`} className="block break-all text-sm font-semibold text-cyan-text underline-offset-2 hover:underline">{b.nutzer.email}</a>}
                  </Feld>
                  <Feld titel={a.preis}>
                    <span className="font-semibold tabular-nums">{euro(b.preis_eur, sprache)}</span> <span className="text-sm text-leise">{t.bereich.netto}</span>
                  </Feld>
                  <Feld titel={a.hinweis}>
                    {b.notiz ? <span className="whitespace-pre-line">{b.notiz}</span> : <span className="text-leise">{a.keinHinweis}</span>}
                  </Feld>
                </dl>
                {b.erledigt_am && (
                  <p className="mt-3 text-sm text-leise">{fuellen(a.erledigt, { datum: datumZeit(b.erledigt_am, sprache), wer: b.erledigt_von ?? a.unbekannt })}</p>
                )}
                {(b.status === 'offen' || (b.status === 'freigeschaltet' && b.art === 'abo')) && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-linie pt-4">
                    {b.status === 'offen' && <>
                      <button type="button" disabled={!!laeuft} onClick={() => ausfuehren(b, 'freischalten')} className="knopf knopf-haupt">
                        <IconHaken className="size-5" />{beschaeftigt ? a.knopf.laeuft : a.knopf.freischalten}
                      </button>
                      <button type="button" disabled={!!laeuft} onClick={() => setFrage({ b, aktion: 'stornieren' })} className="knopf knopf-zweit">{a.knopf.stornieren}</button>
                    </>}
                    {b.status === 'freigeschaltet' && b.art === 'abo' && (
                      <button type="button" disabled={!!laeuft} onClick={() => setFrage({ b, aktion: 'verlaengern' })} className="knopf knopf-zweit">
                        <IconNeu className="size-5" />{beschaeftigt ? a.knopf.laeuft : a.knopf.verlaengern}
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <Dialog offen={!!frage} onSchliessen={() => setFrage(null)} titel={frage ? a.frage[frage.aktion].titel : ''} schliessenText={g.knopf.schliessen} sperren={!!laeuft}
        fuss={frage && <>
          <button type="button" onClick={() => setFrage(null)} disabled={!!laeuft} className="knopf knopf-zweit">{g.knopf.abbrechen}</button>
          <button type="button" onClick={() => ausfuehren(frage.b, frage.aktion)} disabled={!!laeuft}
            className={`knopf ${frage.aktion === 'stornieren' ? 'bg-rot text-white' : 'knopf-haupt'}`}>
            {laeuft ? a.knopf.laeuft : a.frage[frage.aktion].knopf}
          </button>
        </>}>
        {frage && <p className="text-[15px] leading-7 text-text-2">{fuellen(a.frage[frage.aktion].text, { paket: paket(frage.b), firma: firma(frage.b) })}</p>}
      </Dialog>
    </div>
  )
}
