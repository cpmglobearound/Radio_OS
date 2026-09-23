'use client'
// „Minuten bestellen" auf /portal/guthaben: Pakete je Art (Abo, Nachkauf, Einzelbeitrag) → Dialog → Bestellung per E-Mail.
// Kein Online-Bezahlen: Klarframe schickt die Rechnung und schaltet nach Zahlung frei. Nur Inhaber/Admin des Kontos.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { usePortal } from '@/components/portal/Kontext'
import { darf } from '@/components/portal/rechte'
import { api } from '@/components/gemeinsam/api'
import Dialog from '@/components/gemeinsam/Dialog'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import { datum, fuellen } from '@/components/gemeinsam/format'
import { IconBeleg, IconHaken, IconKreuz, IconMail } from '@/components/gemeinsam/Icons'
import type { BestellTexte } from '@/lib/i18n/texte/bestellung'
import { BestellChip, bestellFehler, euro, jeMinute, paketName, type BestellArt, type Bestellung } from './gemeinsam'

interface Abo { id: string; name: string; minuten: number; preis_eur: number; max_sendungen: number | null; max_nutzer: number | null }
interface Paket { id: string; minuten: number; preis_eur: number }
interface Daten { abos: Abo[]; nachkauf: Paket[]; einzel: Paket[]; aktuelles_abo: string | null; bestellungen: Bestellung[] }
interface Wahl { art: BestellArt; id: string; name: string; preis: number; proMonat: boolean }

const ARTEN: BestellArt[] = ['abo', 'nachkauf', 'einzel']
const MAX_NOTIZ = 1000

function PaketKarte({ kopf, preis, zeilen, markiert, marke, knopf }: { kopf: ReactNode; preis: ReactNode; zeilen: string[]; markiert?: boolean; marke?: string; knopf: ReactNode }) {
  return (
    <li className={`karte relative flex min-w-0 flex-col gap-3 p-5 ${markiert ? '!border-cyan-tief ring-2 ring-cyan-hell' : ''}`}>
      {marke && <span className="inline-flex w-fit items-center gap-1 rounded-full bg-cyan-hell px-2.5 py-1 text-xs font-semibold text-cyan-text"><IconHaken className="size-3.5" />{marke}</span>}
      <div className="min-w-0 break-words">{kopf}</div>
      <div className="min-w-0">{preis}</div>
      {zeilen.length > 0 && (
        <ul className="grid gap-1 text-sm text-text-2">
          {zeilen.map(z => <li key={z} className="flex gap-2"><IconHaken aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gruen" /><span className="min-w-0">{z}</span></li>)}
        </ul>
      )}
      <div className="mt-auto pt-1">{knopf}</div>
    </li>
  )
}

export default function BestellBereich({ t }: { t: BestellTexte }) {
  const { g, rolle, sprache } = usePortal()
  const id = useId()
  const darfBestellen = darf(rolle, 'admin')
  const [daten, setDaten] = useState<Daten | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [versuch, setVersuch] = useState(0)
  const [artWahl, setArtWahl] = useState<BestellArt>('abo')
  const reiter = useRef<(HTMLButtonElement | null)[]>([])
  const [wahl, setWahl] = useState<Wahl | null>(null)
  const [notiz, setNotiz] = useState('')
  const [sendet, setSendet] = useState(false)
  const [dialogFehler, setDialogFehler] = useState<string | null>(null)
  const [erfolg, setErfolg] = useState(false)

  useEffect(() => {
    if (!darfBestellen) return
    let aus = false
    api<Daten>('/api/v1/bestellungen').then(r => {
      if (aus) return
      if (r.ok) { setDaten(r.daten); setLadeFehler(null) } else setLadeFehler(r.code)
    })
    return () => { aus = true }
  }, [versuch, darfBestellen])

  const kopf = (
    <>
      <h2 id={`${id}-t`} className="text-xl font-semibold tracking-[-.02em]">{t.bereich.titel}</h2>
      <p className="mb-3 mt-0.5 max-w-2xl text-sm text-leise">{t.bereich.satz}</p>
    </>
  )

  // Redaktion/Hören: der Satz „Bestellen kann der Inhaber …" steht schon in der Karte oben auf der Guthaben-Seite.
  if (!darfBestellen) return null

  const vorhanden = daten ? ARTEN.filter(a => (a === 'abo' ? daten.abos : daten[a]).length > 0) : []
  const art = vorhanden.includes(artWahl) ? artWahl : vorhanden[0] ?? 'abo'
  const abos = new Map((daten?.abos ?? []).map(a => [a.id, a.name]))

  function taste(e: KeyboardEvent, i: number) {
    const n = vorhanden.length
    const ziel = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (ziel < 0) return
    e.preventDefault()
    setArtWahl(vorhanden[ziel])
    reiter.current[ziel]?.focus()
  }

  function oeffnen(w: Wahl) {
    setWahl(w); setNotiz(''); setDialogFehler(null); setErfolg(false)
  }

  async function bestellen() {
    if (!wahl) return
    setSendet(true); setDialogFehler(null)
    const n = notiz.trim()
    const r = await api<{ id: string; status: string }>('/api/v1/bestellungen', { body: { art: wahl.art, produkt_id: wahl.id, ...(n ? { notiz: n } : {}) } })
    setSendet(false)
    if (!r.ok) { setDialogFehler(bestellFehler(r.code, t, g.fehler)); return }
    setWahl(null); setErfolg(true); setVersuch(v => v + 1)
  }

  const knopf = (w: Wahl) => (
    <button type="button" onClick={() => oeffnen(w)} aria-label={fuellen(t.knopf.bestellenLabel, { paket: w.name })} className="knopf knopf-haupt w-full">
      {t.knopf.bestellen}
    </button>
  )
  const netto = <span className="text-sm text-leise">{t.bereich.netto}</span>

  let karten: ReactNode = null
  if (daten && art === 'abo') {
    karten = daten.abos.map(a => {
      const w: Wahl = { art: 'abo', id: a.id, name: paketName({ art: 'abo', minuten: a.minuten }, t, a.name), preis: a.preis_eur, proMonat: true }
      const aktuell = daten.aktuelles_abo === a.id
      return (
        <PaketKarte key={a.id} markiert={aktuell} marke={aktuell ? t.abo.aktuell : undefined}
          kopf={<><h3 className="font-display text-2xl font-semibold tracking-[-.03em]">{a.name}</h3><p className="text-[15px] font-medium text-text-2">{fuellen(t.abo.minuten, { min: a.minuten })}</p></>}
          preis={<p className="flex flex-wrap items-baseline gap-x-1.5"><span className="text-3xl font-semibold tabular-nums tracking-[-.03em]">{euro(a.preis_eur, sprache)}</span><span className="text-sm font-medium text-text-2">{t.abo.proMonat}</span>{netto}</p>}
          zeilen={[
            fuellen(t.abo.jeMinute, { preis: jeMinute(a.preis_eur, a.minuten, sprache) }),
            a.max_sendungen == null ? t.abo.sendungenFrei : a.max_sendungen === 1 ? t.abo.sendung1 : fuellen(t.abo.sendungen, { n: a.max_sendungen }),
            a.max_nutzer == null ? t.abo.nutzerFrei : fuellen(t.abo.nutzer, { n: a.max_nutzer }),
          ]}
          knopf={knopf(w)} />
      )
    })
  } else if (daten && art === 'nachkauf') {
    karten = daten.nachkauf.map(p => (
      <PaketKarte key={p.id}
        kopf={<h3 className="font-display text-2xl font-semibold tracking-[-.03em]">{fuellen(t.nachkauf.minuten, { min: p.minuten })}</h3>}
        preis={<p className="flex flex-wrap items-baseline gap-x-1.5"><span className="text-3xl font-semibold tabular-nums tracking-[-.03em]">{euro(p.preis_eur, sprache)}</span>{netto}</p>}
        zeilen={[fuellen(t.nachkauf.jeMinute, { preis: jeMinute(p.preis_eur, p.minuten, sprache) })]}
        knopf={knopf({ art: 'nachkauf', id: p.id, name: paketName({ art: 'nachkauf', minuten: p.minuten }, t), preis: p.preis_eur, proMonat: false })} />
    ))
  } else if (daten && art === 'einzel') {
    karten = daten.einzel.map(p => (
      <PaketKarte key={p.id}
        kopf={<h3 className="font-display text-2xl font-semibold tracking-[-.03em]">{fuellen(t.einzel.bis, { min: p.minuten })}</h3>}
        preis={<p className="flex flex-wrap items-baseline gap-x-1.5"><span className="text-3xl font-semibold tabular-nums tracking-[-.03em]">{euro(p.preis_eur, sprache)}</span><span className="text-sm font-medium text-text-2">{t.einzel.einmal}</span>{netto}</p>}
        zeilen={[]}
        knopf={knopf({ art: 'einzel', id: p.id, name: paketName({ art: 'einzel', minuten: p.minuten }, t), preis: p.preis_eur, proMonat: false })} />
    ))
  }

  return (
    <section id="bestellen" aria-labelledby={`${id}-t`} className="grid min-w-0 scroll-mt-24 gap-4">
      <div>{kopf}</div>

      {erfolg && (
        <Hinweis art="erfolg" aktion={
          <button type="button" onClick={() => setErfolg(false)} aria-label={g.knopf.schliessen} className="inline-flex size-7 items-center justify-center rounded-full hover:bg-karte/60">
            <IconKreuz className="size-4" />
          </button>
        }>{t.erfolg}</Hinweis>
      )}

      {ladeFehler && !daten && (
        <Hinweis art="fehler" aktion={<button type="button" onClick={() => setVersuch(v => v + 1)} className="knopf knopf-zweit !px-3.5 !py-1.5 text-sm">{g.knopf.nochmal}</button>}>
          {t.bereich.ladeFehler} {bestellFehler(ladeFehler, t, g.fehler)}
        </Hinweis>
      )}

      {!daten && !ladeFehler && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          <p className="sr-only" role="status">{t.bereich.laedt}</p>
          {[0, 1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse rounded-[var(--radius-kf)] bg-grund-2" />)}
        </div>
      )}

      {daten && vorhanden.length === 0 && <Hinweis art="info">{t.bereich.leer}</Hinweis>}

      {daten && vorhanden.length > 0 && (
        <div className="grid min-w-0 gap-4">
          <div role="tablist" aria-label={t.bereich.reiter} className="flex w-full flex-wrap gap-1 rounded-[1.4rem] border border-linie bg-grund-2/60 p-1 sm:w-fit sm:rounded-full">
            {vorhanden.map((a, i) => {
              const an = a === art
              return (
                <button key={a} ref={el => { reiter.current[i] = el }} type="button" role="tab" id={`${id}-r-${a}`}
                  aria-selected={an} aria-controls={`${id}-feld`} tabIndex={an ? 0 : -1}
                  onClick={() => setArtWahl(a)} onKeyDown={e => taste(e, i)}
                  className={`min-w-0 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none sm:text-[15px] ${an ? 'bg-text text-white' : 'text-leise hover:bg-karte hover:text-text'}`}>
                  {t.arten[a].reiter}
                </button>
              )
            })}
          </div>
          <div id={`${id}-feld`} role="tabpanel" aria-labelledby={`${id}-r-${art}`} className="grid min-w-0 gap-3">
            <p className="text-[15px] text-text-2">{t.arten[art].satz}</p>
            <ul className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">{karten}</ul>
          </div>
        </div>
      )}

      {daten && (
        <div className="mt-4 min-w-0">
          <h3 className="text-lg font-semibold tracking-[-.02em]">{t.liste.titel}</h3>
          <p className="mb-3 mt-0.5 text-sm text-leise">{t.liste.satz}</p>
          {daten.bestellungen.length === 0 ? (
            <LeerZustand icon={<IconBeleg className="size-7" />} titel={t.liste.leerTitel} text={t.liste.leerText} />
          ) : (
            <ul className="divide-y divide-linie overflow-hidden rounded-[var(--radius-kf)] border border-linie bg-karte">
              {daten.bestellungen.map(b => (
                <li key={b.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                  <span className="text-sm text-leise">{datum(b.erstellt_am, sprache)}</span>
                  <span className="min-w-0">
                    <span className="block break-words font-semibold text-text">{paketName(b, t, abos.get(b.produkt_id))}</span>
                    {b.status === 'freigeschaltet' && b.erledigt_am && <span className="block text-sm text-leise">{fuellen(t.liste.erledigt, { datum: datum(b.erledigt_am, sprache) })}</span>}
                  </span>
                  <span className="flex flex-wrap items-center justify-between gap-2 sm:contents">
                    <span className="text-sm font-semibold tabular-nums text-text sm:text-right">
                      {euro(b.preis_eur, sprache)} <span className="font-normal text-leise">{t.bereich.netto}</span>
                    </span>
                    <span className="sm:justify-self-end"><BestellChip status={b.status} t={t} /></span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Dialog offen={!!wahl} onSchliessen={() => setWahl(null)} titel={t.dialog.titel} beschreibung={t.dialog.satz} schliessenText={g.knopf.schliessen} sperren={sendet}
        fuss={<>
          <button type="button" onClick={() => setWahl(null)} disabled={sendet} className="knopf knopf-zweit">{g.knopf.abbrechen}</button>
          <button type="submit" form={`${id}-form`} disabled={sendet} className="knopf knopf-haupt"><IconMail className="size-5" />{sendet ? t.knopf.laeuft : t.knopf.verbindlich}</button>
        </>}>
        {wahl && (
          <form id={`${id}-form`} onSubmit={e => { e.preventDefault(); bestellen() }} className="grid gap-4">
            <dl className="grid gap-2 rounded-2xl border border-linie bg-grund-2/60 p-4 text-sm">
              <div className="grid gap-0.5">
                <dt className="text-leise">{t.dialog.paket}</dt>
                <dd className="break-words font-semibold text-text">{wahl.name}</dd>
              </div>
              <div className="grid gap-0.5">
                <dt className="text-leise">{t.dialog.preis}</dt>
                <dd className="font-semibold tabular-nums text-text">
                  {euro(wahl.preis, sprache)}{wahl.proMonat ? ` ${t.abo.proMonat}` : ''} <span className="font-normal text-leise">{t.bereich.netto}</span>
                </dd>
              </div>
            </dl>
            <div>
              <label htmlFor={`${id}-notiz`} className="etikett">{t.dialog.notiz}</label>
              <textarea id={`${id}-notiz`} value={notiz} onChange={e => setNotiz(e.target.value)} maxLength={MAX_NOTIZ} rows={3} disabled={sendet}
                aria-describedby={`${id}-notiz-h`} className="feld resize-y" />
              <p id={`${id}-notiz-h`} className="mt-1 flex flex-wrap justify-between gap-x-3 text-xs text-leise">
                <span>{t.dialog.notizHilfe}</span>
                <span className="tabular-nums">{fuellen(t.dialog.zeichen, { n: notiz.length, max: MAX_NOTIZ })}</span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">{t.dialog.wieTitel}</h3>
              <ol className="mt-2 grid gap-2 text-sm leading-6 text-text-2">
                {t.dialog.wie.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-hell text-xs font-bold text-cyan-text">{i + 1}</span>
                    <span className="min-w-0">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
            {dialogFehler && <Hinweis art="fehler">{dialogFehler}</Hinweis>}
          </form>
        )}
      </Dialog>
    </section>
  )
}
