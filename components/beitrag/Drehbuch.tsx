'use client'
// Drehbuch zum Lesen (und Transkript): Zeilen nach Blöcken, Sprecherfarbe, Emotion, ▶ je Zeile, Belege, Prüfhinweise.
import { useId, useState, type ReactNode } from 'react'
import type { UiSprache } from '@/lib/sprachen'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import EmotionChip from '@/components/portal/EmotionChip'
import HoerKnopf from '@/components/portal/HoerKnopf'
import { istFertig, sprecherFarbe } from '@/components/portal/anzeige'
import { datum, fuellen } from '@/components/gemeinsam/format'
import { IconBeleg, IconExtern, IconFunken, IconMikro, IconWarnung } from '@/components/gemeinsam/Icons'
import type { BeitragDaten, Block, Fakt, Hervor, KiBereich, Zeile } from './typen'

export const kleinKnopf = 'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-linie-2 bg-karte px-3 py-1 text-xs font-semibold text-text-2 transition-colors hover:border-text hover:text-text disabled:opacity-50'

/** Aufeinanderfolgende Zeilen desselben Blocks zusammenfassen (Reihenfolge bleibt wie im Drehbuch). */
export function gruppieren<Z extends { block_id: string | null }>(zeilen: Z[], bloecke: Block[]) {
  const gruppen: { block: Block | null; zeilen: Z[] }[] = []
  for (const z of zeilen) {
    const block = bloecke.find(b => b.id === z.block_id) ?? null
    const letzte = gruppen.at(-1)
    if (letzte && letzte.block?.id === block?.id) letzte.zeilen.push(z)
    else gruppen.push({ block, zeilen: [z] })
  }
  return gruppen
}

/** Sprechername und Funktion (Moderation, Gast …) zu einer Rolle. */
export function sprecherVon(daten: BeitragDaten, rolle: string, t: PortalTexte) {
  const s = daten.beitrag.einstellungen?.sprecher?.find(x => x.rolle === rolle)
  const funktion = s?.funktion ? ((t.funktion as Record<string, string>)[s.funktion] ?? '') : ''
  return { name: s?.name || rolle, funktion }
}

export default function Drehbuch({ daten, t, tb, sprache, hervor, darfAendern, kopfAktionen, untertitel, onNeuSprechen, onKi }: {
  daten: BeitragDaten
  t: PortalTexte
  tb: BeitragTexte
  sprache: UiSprache
  hervor: Hervor | null
  /** Knöpfe „Neu sprechen" / „Mit KI überarbeiten" je Zeile und Block zeigen. */
  darfAendern: boolean
  kopfAktionen?: ReactNode
  /** Satz unter der Überschrift (sonst „Das ist auch das Transkript …"). */
  untertitel?: string
  onNeuSprechen: (z: Zeile) => void
  onKi: (b: KiBereich) => void
}) {
  const faktNach = new Map(daten.fakten.map(f => [f.id, f]))
  const gruppen = gruppieren(daten.zeilen, daten.bloecke)
  const mehrereBloecke = gruppen.length > 1 || daten.bloecke.length > 1

  return (
    <section aria-labelledby="drehbuch-titel" className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="drehbuch-titel" className="text-2xl font-semibold">{tb.drehbuch.titel}</h2>
          <p className="mt-1 text-sm text-leise">{untertitel ?? tb.drehbuch.text}</p>
        </div>
        {kopfAktionen && <div className="flex flex-wrap gap-2">{kopfAktionen}</div>}
      </div>

      <div className="mt-5 grid gap-6">
        {gruppen.map((g, gi) => (
          <div key={`${g.block?.id ?? 'ohne'}-${gi}`} className="grid min-w-0 gap-3">
            {mehrereBloecke && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linie pb-2">
                <h3 className="min-w-0 break-words text-lg font-semibold">{g.block?.thema ?? (gi === 0 ? tb.drehbuch.anmoderation : gi === gruppen.length - 1 ? tb.drehbuch.abmoderation : tb.drehbuch.ohneBlock)}</h3>
                {darfAendern && g.block && (
                  <button type="button" className={kleinKnopf} aria-label={fuellen(tb.drehbuch.kiBlockLabel, { thema: g.block.thema })}
                    onClick={() => onKi({ art: 'block', block_id: g.block!.id, thema: g.block!.thema })}>
                    <IconFunken className="size-4" /> {tb.drehbuch.kiBlock}
                  </button>
                )}
              </div>
            )}
            <ol className="grid gap-3">
              {g.zeilen.map(z => (
                <ZeileAnsicht key={z.nr} zeile={z} daten={daten} faktNach={faktNach} t={t} tb={tb} sprache={sprache}
                  hervorgehoben={!!hervor?.nrs.includes(z.nr)} darfAendern={darfAendern}
                  onNeuSprechen={() => onNeuSprechen(z)} onKi={() => onKi({ art: 'zeile', nr: z.nr, block_id: z.block_id })} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}

function ZeileAnsicht({ zeile: z, daten, faktNach, t, tb, sprache, hervorgehoben, darfAendern, onNeuSprechen, onKi }: {
  zeile: Zeile; daten: BeitragDaten; faktNach: Map<string, Fakt>; t: PortalTexte; tb: BeitragTexte; sprache: UiSprache
  hervorgehoben: boolean; darfAendern: boolean; onNeuSprechen: () => void; onKi: () => void
}) {
  const [belegeOffen, setBelegeOffen] = useState(false)
  const [tonFehler, setTonFehler] = useState(false)
  const id = useId()
  const b = daten.beitrag
  const farbe = sprecherFarbe(z.rolle)
  const sp = sprecherVon(daten, z.rolle, t)
  const fertig = istFertig(b.status)
  const befunde = (z.befunde ?? []).filter(x => x && typeof x.art === 'string')
  const unsauber = z.hat_audio && (!!z.warnung || (z.wortgenauigkeit != null && z.wortgenauigkeit < 0.97))
  const prozent = z.wortgenauigkeit != null ? Math.round(z.wortgenauigkeit * 100) : null
  const belegZahl = z.fakt_ids.length

  return (
    <li className={`min-w-0 rounded-2xl border border-l-4 bg-karte px-4 py-3 sm:px-5 ${farbe.rand} ${hervorgehoben ? 'border-cyan shadow-[0_0_0_3px_var(--color-cyan-hell)]' : 'border-linie'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="sr-only">{fuellen(tb.drehbuch.zeile, { nr: z.nr })}: </span>
        <span className={`inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold ${farbe.text}`}>
          <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${farbe.punkt}`} />
          <span className="break-words">{sp.name}</span>
        </span>
        {sp.funktion && <span className="text-xs text-leise">{sp.funktion}</span>}
        <EmotionChip emotion={z.emotion} t={t} />
        {hervorgehoben && <span className="rounded-full bg-cyan-hell px-2 py-0.5 text-[11px] font-semibold text-cyan-text">{tb.drehbuch.geaendert}</span>}
        <span className="ml-auto flex items-center gap-2">
          {z.hat_audio ? (
            <HoerKnopf quelle={`/api/v1/beitraege/${b.id}/zeilen/${z.nr}/audio?v=${b.version}`} groesse="klein"
              label={fuellen(tb.drehbuch.anhoeren, { nr: z.nr })} anhaltenLabel={fuellen(tb.drehbuch.anhalten, { nr: z.nr })}
              onFehler={() => setTonFehler(true)} />
          ) : fertig ? (
            <span className="rounded-full border border-dashed border-linie-2 px-2 py-0.5 text-[11px] font-medium text-leise">{tb.drehbuch.nichtGesprochen}</span>
          ) : null}
        </span>
      </div>

      <p className="mt-2 break-words text-base leading-7 text-text">{z.text}</p>
      {z.regie && <p className="mt-1 break-words text-sm italic text-leise"><span className="sr-only">{tb.drehbuch.regie}: </span>{z.regie}</p>}
      {tonFehler && <p role="status" className="mt-1 text-xs text-[#8a4b05]">{tb.drehbuch.tonFehler}</p>}

      {(befunde.length > 0 || unsauber || belegZahl > 0 || darfAendern) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {unsauber && (
            <span title={tb.drehbuch.wortgetreuErklaerung}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${z.warnung ? 'border border-gelb/30 bg-gelb-hell text-[#8a4b05]' : 'text-leise'}`}>
              {z.warnung && <IconWarnung className="size-3.5" />}
              {z.warnung ? tb.drehbuch.warnung : ''}
              {z.warnung && prozent != null ? ' · ' : ''}
              {prozent != null ? fuellen(tb.drehbuch.wortgetreu, { n: prozent }) : ''}
            </span>
          )}
          {befunde.map((f, i) => {
            const text = (tb.befunde as Record<string, string>)[f.art]
            return (
              <span key={`${f.art}-${i}`} className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${f.hart ? 'border-rot/30 bg-rot-hell text-[#a32424]' : 'border-gelb/30 bg-gelb-hell text-[#8a4b05]'}`}>
                {f.hart && <IconWarnung className="size-3.5 shrink-0" />}
                <span className={text ? '' : 'break-words'}>{text ?? f.text}</span>
              </span>
            )
          })}
          {belegZahl > 0 && (
            <button type="button" className={kleinKnopf} aria-expanded={belegeOffen} aria-controls={`${id}-belege`} onClick={() => setBelegeOffen(o => !o)}>
              <IconBeleg className="size-4" />
              {belegeOffen ? tb.drehbuch.belegeZu : belegZahl === 1 ? tb.drehbuch.belegEins : fuellen(tb.drehbuch.belege, { n: belegZahl })}
            </button>
          )}
          {darfAendern && (
            <span className="ml-auto flex flex-wrap gap-1.5">
              {fertig && (
                <button type="button" className={kleinKnopf} onClick={onNeuSprechen} aria-label={fuellen(tb.drehbuch.neuSprechenLabel, { nr: z.nr })}>
                  <IconMikro className="size-4" /> {tb.drehbuch.neuSprechen}
                </button>
              )}
              <button type="button" className={kleinKnopf} onClick={onKi} aria-label={fuellen(tb.drehbuch.kiZeileLabel, { nr: z.nr })}>
                <IconFunken className="size-4" /> {tb.drehbuch.kiZeile}
              </button>
            </span>
          )}
        </div>
      )}

      {belegZahl > 0 && belegeOffen && (
        <ul id={`${id}-belege`} aria-label={fuellen(tb.drehbuch.belegeTitel, { nr: z.nr })} className="mt-3 grid gap-2">
          {z.fakt_ids.map(fid => {
            const f = faktNach.get(fid)
            if (!f) return <li key={fid} className="rounded-xl bg-grund-2 px-3 py-2 text-sm text-leise">{tb.drehbuch.faktFehlt}</li>
            return (
              <li key={fid} className="min-w-0 rounded-xl bg-grund-2 px-3 py-2.5 text-sm">
                <p className="break-words text-text">{f.aussage}</p>
                {f.zahl && <p className="mt-1 text-xs text-text-2"><span className="font-semibold">{tb.drehbuch.zahl}:</span> {f.zahl}</p>}
                {f.zitat && <blockquote className="mt-1.5 break-words border-l-2 border-linie-2 pl-2 text-xs italic text-text-2"><q>{f.zitat}</q></blockquote>}
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-leise">
                  <span className="break-words font-medium text-text-2">{f.url ? f.quelle_name : tb.drehbuch.eigenerText}</span>
                  {f.datum && <span>{datum(f.datum, sprache)}</span>}
                  {f.url && (
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-cyan-text underline-offset-2 hover:underline">
                      {tb.drehbuch.quelleOeffnen} <IconExtern className="size-3.5" />
                    </a>
                  )}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
