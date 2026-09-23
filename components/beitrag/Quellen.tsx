'use client'
// Quellen (gruppiert nach Herkunft), Shownotes und die Einstellungen des Beitrags — jeweils aufklappbar.
import type { ReactNode } from 'react'
import type { UiSprache } from '@/lib/sprachen'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import { datum, fuellen } from '@/components/gemeinsam/format'
import { IconExtern, IconWinkelUnten } from '@/components/gemeinsam/Icons'
import type { BeitragDaten, Fakt } from './typen'

function Klappe({ titel, text, children }: { titel: string; text?: string; children: ReactNode }) {
  return (
    <details className="karte group min-w-0 p-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-[inherit] px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-display text-lg font-semibold">{titel}</span>
          {text && <span className="mt-0.5 block text-sm text-leise">{text}</span>}
        </span>
        <IconWinkelUnten className="mt-1 size-5 shrink-0 text-leise transition-transform group-open:rotate-180" />
      </summary>
      <div className="min-w-0 border-t border-linie px-5 py-4 sm:px-6">{children}</div>
    </details>
  )
}

export default function Quellen({ daten, tb, sprache }: { daten: BeitragDaten; tb: BeitragTexte; sprache: UiSprache }) {
  const b = daten.beitrag
  const e = b.einstellungen ?? {}

  // Gruppiert nach Quelle (Name + Adresse); eigene Texte haben keine Adresse.
  const gruppen = new Map<string, { name: string; url: string | null; datum: string | null; fakten: Fakt[] }>()
  for (const f of daten.fakten) {
    const schluessel = f.url ? `${f.quelle_name}|${f.url}` : `eigen|${f.quelle_name}`
    const g = gruppen.get(schluessel) ?? { name: f.quelle_name, url: f.url, datum: f.datum, fakten: [] }
    g.fakten.push(f)
    gruppen.set(schluessel, g)
  }
  const quellen = [...gruppen.values()]

  const ton = typeof e.tonalitaet === 'object' && e.tonalitaet ? e.tonalitaet : null
  const w = tb.einstellungen.werte
  const tonZeilen = ton ? Object.entries(ton)
    .filter(([k, v]) => v !== undefined && v !== null && v !== '' && tb.einstellungen.regler[k])
    .map(([k, v]) => [tb.einstellungen.regler[k], w[k]?.[String(v)] ?? String(v)] as const) : []

  return (
    <div className="grid gap-3">
      {quellen.length > 0 && (
        <Klappe titel={tb.quellen.titel} text={tb.quellen.text}>
          <ul className="grid gap-3">
            {quellen.map(q => (
              <li key={`${q.name}|${q.url ?? ''}`} className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="break-words font-semibold text-text">{q.url ? q.name : tb.quellen.eigenerText}</span>
                  {q.datum && <span className="text-xs text-leise">{datum(q.datum, sprache)}</span>}
                  <span className="text-xs text-leise">{q.fakten.length === 1 ? tb.quellen.faktEins : fuellen(tb.quellen.fakten, { n: q.fakten.length })}</span>
                </div>
                {q.url && (
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex max-w-full items-center gap-1 text-sm text-cyan-text underline-offset-2 hover:underline">
                    <span className="truncate">{q.url.replace(/^https?:\/\//, '')}</span>
                    <IconExtern className="size-3.5 shrink-0" />
                    <span className="sr-only">({tb.quellen.oeffnen})</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Klappe>
      )}

      {b.shownotes && (
        <Klappe titel={tb.quellen.shownotes} text={tb.quellen.shownotesText}>
          <p className="whitespace-pre-line break-words text-sm leading-6 text-text-2 [overflow-wrap:anywhere]">{b.shownotes}</p>
        </Klappe>
      )}

      <Klappe titel={tb.einstellungen.titel}>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
          {e.quelle && <Paar k={tb.einstellungen.quelle} v={tb.einstellungen.quellen[e.quelle] ?? e.quelle} />}
          {e.themen && e.themen.length > 0 && (
            <Paar k={tb.einstellungen.themen} v={<ul className="grid gap-0.5">{e.themen.map((th, i) => <li key={i} className="break-words">{th.titel}</li>)}</ul>} />
          )}
          {e.sendungsname && <Paar k={tb.einstellungen.sendung} v={e.sendungsname} />}
          {tonZeilen.length > 0 && (
            <Paar k={tb.einstellungen.ton} v={
              <ul className="flex flex-wrap gap-1.5">
                {tonZeilen.map(([k, v]) => <li key={k} className="rounded-full bg-grund-2 px-2.5 py-0.5 text-xs"><span className="text-leise">{k}:</span> {v}</li>)}
              </ul>
            } />
          )}
          {typeof e.tonalitaet === 'string' && <Paar k={tb.einstellungen.ton} v={e.tonalitaet} />}
          {e.anweisung && <Paar k={tb.einstellungen.anweisung} v={<span className="whitespace-pre-line break-words">{e.anweisung}</span>} />}
          {typeof e.freigabe_noetig === 'boolean' && <Paar k={tb.einstellungen.freigabe} v={e.freigabe_noetig ? tb.einstellungen.ja : tb.einstellungen.nein} />}
        </dl>
      </Klappe>
    </div>
  )
}

function Paar({ k, v }: { k: string; v: ReactNode }) {
  return (
    <>
      <dt className="font-medium text-leise">{k}</dt>
      <dd className="min-w-0 text-text">{v}</dd>
    </>
  )
}
