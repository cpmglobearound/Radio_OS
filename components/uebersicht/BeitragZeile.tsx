'use client'
// Ein Beitrag in einer Liste: Handy = Karte, ab md = dichte Zeile (Spalten wie der Kopf in <BeitragKopf>).
// ▶ nur bei fertigen Beiträgen; bei laufenden ein kleiner Fortschrittsbalken; bei fehlgeschlagenen der Grund.
import Link from 'next/link'
import { useState } from 'react'
import HoerKnopf from '@/components/portal/HoerKnopf'
import StatusChip from '@/components/portal/StatusChip'
import { beitragFehlerText, istFertig, laeuft } from '@/components/portal/anzeige'
import { usePortal } from '@/components/portal/Kontext'
import { datum, fuellen } from '@/components/gemeinsam/format'
import { IconDrehbuch, IconNeu, IconWarnung } from '@/components/gemeinsam/Icons'
import { sprachName, type UiSprache } from '@/lib/sprachen'
import type { UebersichtTexte } from '@/lib/i18n/texte/uebersicht'
import Fortschritt from './Fortschritt'
import { audioQuelle, beitragHref, laengeText, type BeitragKurz, type FormatNamen } from './daten'

/** Spalten ab md: Inhalt | Stand | Länge | Datum. */
const SPALTEN = 'md:grid md:grid-cols-[minmax(0,1fr)_12rem_5.5rem_7rem] md:items-center md:gap-4'

export function ProbeAbzeichen({ u }: { u: UebersichtTexte }) {
  return (
    <span title={u.beitrag.probeErklaerung} className="inline-flex items-center rounded-full border border-violett/25 bg-[#f3efff] px-2 py-0.5 text-[11px] font-semibold text-[#5b36c4]">
      {u.beitrag.probe}<span className="sr-only"> — {u.beitrag.probeErklaerung}</span>
    </span>
  )
}

/** Unterzeile: Format · Sprache · Stimmen. */
export function beitragDetails(b: BeitragKurz, u: UebersichtTexte, formate: FormatNamen, sprache: UiSprache) {
  const teile = [
    b.format ? formate[b.format] ?? u.beitrag.formatUnbekannt : '',
    b.sprache ? sprachName(b.sprache, sprache) : '',
    b.sprecher.length ? b.sprecher.join(', ') : '',
  ]
  return teile.filter(Boolean).join(' · ')
}

/** Spaltenkopf für die dichte Ansicht (nur ab md sichtbar, für Vorleser ausgeblendet — jede Zeile ist selbsterklärend). */
export function BeitragKopf({ u }: { u: UebersichtTexte }) {
  return (
    <div aria-hidden="true" className="hidden border-b border-linie px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-leise md:flex md:gap-3">
      <span className="w-10 shrink-0" />
      <div className={`min-w-0 flex-1 ${SPALTEN}`}>
        <span>{u.liste.spalten.titel}</span>
        <span>{u.liste.spalten.stand}</span>
        <span>{u.liste.spalten.laenge}</span>
        <span>{u.liste.spalten.datum}</span>
      </div>
    </div>
  )
}

export default function BeitragZeile({ b, u, formate }: { b: BeitragKurz; u: UebersichtTexte; formate: FormatNamen }) {
  const { t, sprache, darfBearbeiten } = usePortal()
  const [tonFehler, setTonFehler] = useState(false)
  const titel = b.titel || u.beitrag.ohneTitel
  const fertig = istFertig(b.status)
  const details = beitragDetails(b, u, formate, sprache)
  const laenge = laengeText(b, u, sprache)

  return (
    <li className="rounded-2xl border border-linie bg-karte p-4 shadow-[0_1px_2px_rgb(24_26_50/.04)] md:rounded-none md:border-0 md:bg-transparent md:px-4 md:py-3 md:shadow-none md:transition-colors md:hover:bg-grund/70">
      <div className="flex items-start gap-3 md:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center">
          {fertig ? (
            <HoerKnopf quelle={audioQuelle(b.id)} label={fuellen(u.beitrag.anhoeren, { titel })} anhaltenLabel={fuellen(u.beitrag.anhalten, { titel })} onFehler={() => setTonFehler(true)} />
          ) : (
            <span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-full ${b.status === 'fehlgeschlagen' ? 'bg-rot-hell text-rot' : 'bg-grund-2 text-leise'}`}>
              {b.status === 'fehlgeschlagen' ? <IconWarnung className="size-4" /> : <IconDrehbuch className="size-4" />}
            </span>
          )}
        </div>

        <div className={`min-w-0 flex-1 ${SPALTEN}`}>
          <div className="min-w-0">
            <Link href={beitragHref(b.id)} className="break-words font-semibold text-text underline-offset-2 hover:underline focus-visible:underline">
              {titel}
            </Link>
            {details && <p className="mt-0.5 break-words text-sm text-leise">{details}</p>}
            {laeuft(b.status) && <div className="mt-2 max-w-sm"><Fortschritt b={b} u={u} klein /></div>}
            {b.status === 'fehlgeschlagen' && (
              <p className="mt-1.5 break-words text-sm text-[#a32424]">
                {beitragFehlerText(b.fehler, t)} {u.beitrag.nichtAbgebucht}
                {darfBearbeiten && (
                  <>
                    {' '}
                    <Link href={`/portal/neu?von=${encodeURIComponent(b.id)}`} className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
                      <IconNeu className="size-3.5" />{u.beitrag.neuVersuchen}
                    </Link>
                  </>
                )}
              </p>
            )}
            {tonFehler && <p role="alert" className="mt-1.5 text-sm text-[#8a4b05]">{u.beitrag.tonFehler}</p>}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm md:contents">
            <span className="flex min-w-0 flex-wrap items-center gap-1.5 md:mt-0">
              <StatusChip status={b.status} t={t} klein />
              {b.ist_probe && <ProbeAbzeichen u={u} />}
            </span>
            <span className="tabular-nums text-text-2">{laenge}</span>
            <span className="text-leise">{datum(b.erstellt_am, sprache)}</span>
          </div>
        </div>
      </div>
    </li>
  )
}
