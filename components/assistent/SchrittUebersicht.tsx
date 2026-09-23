'use client'
// Schritt ⑥: alles auf einen Blick, Kostenvoranschlag (automatisch) und „Beitrag erzeugen".
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePortal } from '@/components/portal/Kontext'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen, locale, mmss } from '@/components/gemeinsam/format'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconFunken, IconMail, IconStift, IconUhr } from '@/components/gemeinsam/Icons'
import { formatVon, type FormatId } from '@/lib/formate'
import { ausgabespracheVon, landName, sprachName, type UiSprache } from '@/lib/sprachen'
import type { AssistentTexte } from '@/lib/i18n/texte/assistent'
import type { FormatNamen } from './SchrittFormat'
import { AKTUALITAET, SCHRITTE, alsAuftrag, dauerText, entwurfLoeschen, type Entwurf, type Stimme } from './zustand'

interface Voranschlag {
  stufe: string; preis_eur: number | null; reservierte_sekunden: number; guthaben: number; guthaben_danach: number
  reicht: boolean; stimmklassen_faktor: number; begruendung: string[]; ist_probe: boolean
}

/** Fehler-Code → Schritt, in dem man ihn beheben kann. */
const SCHRITT_FUER: Record<string, number> = { sprecherzahl: 3, stimme_nicht_frei: 3, stimmen_gleich: 3, text_zu_kurz: 0, urls_fehlen: 0 }

export default function SchrittUebersicht({ e, t, ui, stimmen, formatNamen, gehe }: {
  e: Entwurf; t: AssistentTexte; ui: UiSprache; stimmen: Stimme[] | null; formatNamen: FormatNamen; gehe: (schritt: number) => void
}) {
  const { g, t: pt, nutzer, mandant, guthabenNeuLaden } = usePortal()
  const router = useRouter()
  const tu = t.uebersicht
  const tk = tu.kosten
  const auftrag = useMemo(() => alsAuftrag(e), [e])
  const schluessel = JSON.stringify(auftrag)

  // Kostenvoranschlag: automatisch beim Betreten und nach jeder Änderung.
  const [versuch, setVersuch] = useState(0)
  const [kv, setKv] = useState<{ fuer: string; daten?: Voranschlag; code?: string } | null>(null)
  useEffect(() => {
    let aus = false
    api<Voranschlag>('/api/v1/beitraege/kostenvoranschlag', { body: JSON.parse(schluessel) }).then(r => {
      if (!aus) setKv(r.ok ? { fuer: `${schluessel}#${versuch}`, daten: r.daten } : { fuer: `${schluessel}#${versuch}`, code: r.code })
    })
    return () => { aus = true }
  }, [schluessel, versuch])
  const kvLaedt = !kv || kv.fuer !== `${schluessel}#${versuch}`

  const [sendet, setSendet] = useState(false)
  const sperre = useRef(false)
  const [erzeugFehler, setErzeugFehler] = useState<string | null>(null)
  const [mail, setMail] = useState<'offen' | 'sendet' | 'gesendet' | 'fehler'>('offen')

  async function erzeugen() {
    if (sperre.current) return
    sperre.current = true
    setSendet(true)
    setErzeugFehler(null)
    const r = await api<{ id: string; status: string }>('/api/v1/beitraege', { body: auftrag })
    if (r.ok) {
      entwurfLoeschen()
      guthabenNeuLaden()
      router.push(`/portal/beitraege/${r.daten.id}`)
      return   // Sperre bleibt: die Seite wechselt gleich.
    }
    sperre.current = false
    setSendet(false)
    setErzeugFehler(r.code)
  }

  async function mailSenden() {
    setMail('sendet')
    const r = await api('/api/auth/email-erneut', { method: 'POST', body: {} })
    setMail(r.ok ? 'gesendet' : 'fehler')
  }

  const f = formatVon(e.format)
  const schrittName = (i: number) => t.schritte[SCHRITTE[i]]
  const zumSchritt = (code: string) => SCHRITT_FUER[code] !== undefined && (
    <button type="button" className="knopf knopf-zweit px-4 py-2 text-sm" onClick={() => gehe(SCHRITT_FUER[code])}>
      {fuellen(tk.zumSchritt, { schritt: schrittName(SCHRITT_FUER[code]) })}
    </button>
  )
  const zeit = (s: number) => fuellen(tk.zeit, { t: `${s < 0 ? '−' : ''}${mmss(s)}` })
  const sprache = ausgabespracheVon(e.sprache)
  const vorlageName = e.vorlage ? t.ton.vorlagen[e.vorlage as keyof typeof t.ton.vorlagen]?.name ?? e.vorlage : t.ton.eigeneMischung
  const emailOffen = !nutzer.bestaetigt || erzeugFehler === 'email_unbestaetigt'
  const gesperrt = mandant.gesperrt || erzeugFehler === 'gesperrt'
  const zuWenig = kv?.daten?.reicht === false || erzeugFehler === 'guthaben'
  const nachkaufen = <Link href="/portal/guthaben" className="knopf knopf-haupt px-4 py-2 text-sm">{tk.nachkaufen}</Link>

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
      <div className="grid min-w-0 gap-4">
        <Block titel={t.schritte.inhalt} aendern={() => gehe(0)} tu={tu}>
          <Zeile k={tu.weg} v={e.quelle ? t.inhalt.wege[e.quelle].name : '—'} />
          <Zeile k={tu.themen} v={
            <ol className="grid gap-1">
              {e.themen.map((th, i) => (
                <li key={th.id} className="break-words">
                  <span className="text-leise">{i + 1}. </span>{th.titel.trim() || '—'}
                  {e.quelle === 'text' && <span className="text-leise"> · {fuellen(tu.zeichen, { n: th.text.trim().length.toLocaleString(locale(ui)) })}</span>}
                  {e.quelle === 'webseiten' && (() => {
                    const n = th.urls.filter(u => u.trim()).length
                    return <span className="text-leise"> · {n === 1 ? tu.eineWebseite : fuellen(tu.webseiten, { n })}</span>
                  })()}
                </li>
              ))}
            </ol>
          } />
          {e.quelle === 'recherche' && (
            <>
              <Zeile k={tu.region} v={[e.land ? landName(e.land, ui) : t.inhalt.landKeins, ...e.orte].join(' · ')} />
              <Zeile k={tu.aktualitaet} v={t.inhalt.aktualitaetWerte[AKTUALITAET.find(a => a.h === e.aktualitaet_h)?.k ?? 'w2']} />
            </>
          )}
        </Block>

        <Block titel={t.schritte.format} aendern={() => gehe(1)} tu={tu}>
          <Zeile k={tu.format} v={f ? formatNamen[f.id as FormatId].name : '—'} />
          <Zeile k={tu.laenge} v={Number.isFinite(e.laenge_min) ? dauerText(e.laenge_min * 60, t.format) : '—'} />
        </Block>

        <Block titel={t.schritte.sprache} aendern={() => gehe(2)} tu={tu}>
          <Zeile k={tu.sprache} v={sprache ? `${sprachName(sprache.basis, ui)} (${landName(sprache.land, ui)})` : '—'} />
        </Block>

        <Block titel={t.schritte.stimmen} aendern={() => gehe(3)} tu={tu}>
          <ul className="grid gap-1.5 text-sm">
            {e.sprecher.slice(0, e.sprecherzahl).map((s, i) => {
              const st = stimmen?.find(v => v.id === s.stimme)
              const rolle = f?.rollen[e.sprecherzahl - 1]?.[i] ?? 'sprecher'
              return (
                <li key={i} className="break-words">
                  <span className="font-semibold text-text">{s.name.trim() || '—'}</span>
                  <span className="text-leise"> · {pt.funktion[rolle]} · {st?.name ?? '—'}</span>
                  {s.persoenlichkeit.trim() && <span className="block text-leise">{s.persoenlichkeit.trim()}</span>}
                </li>
              )
            })}
          </ul>
        </Block>

        <Block titel={t.schritte.ton} aendern={() => gehe(4)} tu={tu}>
          <Zeile k={tu.ton} v={`${vorlageName}${e.vorlage && e.angepasst ? ` (${t.ton.angepasst})` : ''}`} />
          <Zeile k={tu.anweisung} v={e.anweisung.trim() ? <span className="line-clamp-3 whitespace-pre-line">{e.anweisung.trim()}</span> : tu.keine} />
          <Zeile k={tu.freigabe} v={e.freigabe_noetig ? tu.ja : tu.nein} />
          <Zeile k={tu.sendung} v={`${e.sendungsname.trim() || mandant.name} · ${t.ton.kennungWerte[e.kennung_position]}`} />
        </Block>
      </div>

      <aside className="grid min-w-0 gap-4 lg:sticky lg:top-24" aria-labelledby="a-kosten-titel">
        <section className="karte overflow-hidden">
          <div className="verlauf-grund h-1.5" aria-hidden="true" />
          <div className="p-4 sm:p-5">
            <h3 id="a-kosten-titel" className="flex items-center gap-2 text-lg font-semibold text-text"><IconUhr className="size-5 text-cyan-tief" />{tk.titel}</h3>
            <div aria-live="polite" aria-busy={kvLaedt} className="mt-3">
              {kvLaedt ? (
                <p className="animate-pulse text-sm text-leise">{tk.laedt}</p>
              ) : kv?.daten ? (
                <>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <dt className="text-text-2">{tk.reserviert}</dt>
                      <dd className="text-right">
                        <span className="font-display text-2xl font-semibold tabular-nums text-text">{zeit(kv.daten.reservierte_sekunden)}</span>
                        {kv.daten.ist_probe && <span className="block text-xs text-leise">{tk.probe}</span>}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-3 border-t border-linie pt-2">
                      <dt className="text-text-2">{tk.guthabenJetzt}</dt><dd className="tabular-nums">{zeit(kv.daten.guthaben)}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-3">
                      <dt className="text-text-2">{tk.danach}</dt>
                      <dd className={`font-semibold tabular-nums ${kv.daten.guthaben_danach < 0 ? 'text-[#a32424]' : 'text-text'}`}>{zeit(kv.daten.guthaben_danach)}</dd>
                    </div>
                    {!kv.daten.ist_probe && kv.daten.preis_eur != null && (
                      <div className="flex flex-wrap justify-between gap-x-3 border-t border-linie pt-2">
                        <dt className="text-text-2">{tk.preis}</dt>
                        <dd className="tabular-nums">{new Intl.NumberFormat(locale(ui), { style: 'currency', currency: 'EUR' }).format(kv.daten.preis_eur)}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-3 text-xs leading-5 text-leise">{tk.erklaerung}</p>
                </>
              ) : kv?.code ? (
                <Hinweis art="fehler" aktion={zumSchritt(kv.code) || (
                  <button type="button" className="knopf knopf-zweit px-4 py-2 text-sm" onClick={() => setVersuch(v => v + 1)}>{tk.nochmal}</button>
                )}>
                  {fehlerText(kv.code, g.fehler)}
                </Hinweis>
              ) : null}
            </div>
          </div>
        </section>

        <div aria-live="polite" className="grid gap-3 empty:hidden">
          {zuWenig && <Hinweis art="warnung" aktion={nachkaufen}>{tk.reichtNicht}</Hinweis>}
          {emailOffen && (
            <Hinweis art="warnung" aktion={mail !== 'gesendet' && (
              <button type="button" className="knopf knopf-zweit px-4 py-2 text-sm" disabled={mail === 'sendet'} onClick={mailSenden}>
                <IconMail className="size-4" />{tu.emailKnopf}
              </button>
            )}>
              {tu.emailText}
              {mail === 'gesendet' && <span className="mt-1 block font-semibold">{tu.emailGesendet}</span>}
              {mail === 'fehler' && <span className="mt-1 block font-semibold">{g.fehler.unbekannt}</span>}
            </Hinweis>
          )}
          {gesperrt && <Hinweis art="fehler">{tu.gesperrt}</Hinweis>}
          {erzeugFehler && !['email_unbestaetigt', 'gesperrt', 'guthaben'].includes(erzeugFehler) && (
            <Hinweis art="fehler" aktion={zumSchritt(erzeugFehler)}>{fehlerText(erzeugFehler, g.fehler)}</Hinweis>
          )}
        </div>

        <div className="grid gap-2">
          <button type="button" onClick={erzeugen} disabled={sendet || gesperrt || zuWenig || (!!kv?.code && !kvLaedt)}
            aria-busy={sendet} className="knopf knopf-bunt w-full px-6 py-4 text-lg">
            <IconFunken className={`size-5 ${sendet ? 'animate-spin' : ''}`} />{sendet ? tu.erzeugtLaeuft : tu.erzeugen}
          </button>
          <p className="text-center text-sm text-leise">{tu.danach}</p>
        </div>
      </aside>
    </div>
  )
}

function Block({ titel, aendern, tu, children }: { titel: string; aendern: () => void; tu: AssistentTexte['uebersicht']; children: ReactNode }) {
  return (
    <section className="karte min-w-0 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text">{titel}</h3>
        <button type="button" onClick={aendern} aria-label={fuellen(tu.aendernLabel, { abschnitt: titel })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-cyan-text hover:bg-cyan-hell">
          <IconStift className="size-4" />{tu.aendern}
        </button>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  )
}

function Zeile({ k, v }: { k: string; v: ReactNode }) {
  return (
    <dl className="grid min-w-0 gap-0.5 text-sm sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-3">
      <dt className="text-leise">{k}</dt>
      <dd className="min-w-0 break-words text-text">{v}</dd>
    </dl>
  )
}
