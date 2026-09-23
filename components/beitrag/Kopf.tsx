'use client'
// Kopf der Beitragsansicht: Titel, Angaben als Chips, Aktionen (Ähnlichen Beitrag erzeugen, Löschen).
import Link from 'next/link'
import type { UiSprache } from '@/lib/sprachen'
import { sprachName } from '@/lib/sprachen'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import StatusChip from '@/components/portal/StatusChip'
import { laeuft, sprecherFarbe } from '@/components/portal/anzeige'
import { datum, fuellen, mmss } from '@/components/gemeinsam/format'
import { IconMuell, IconNeu } from '@/components/gemeinsam/Icons'
import type { Beitrag, FormatNamen } from './typen'

const LOESCHBAR = ['fertig', 'fertig_mit_hinweisen', 'fehlgeschlagen', 'freigabe']
export const darfLoeschen = (status: string) => LOESCHBAR.includes(status)

const chip = 'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-linie bg-karte px-2.5 py-1 text-xs font-medium text-text-2'

export default function Kopf({ beitrag: b, t, tb, sprache, formatNamen, darfBearbeiten, onLoeschen }: {
  beitrag: Beitrag; t: PortalTexte; tb: BeitragTexte; sprache: UiSprache; formatNamen: FormatNamen
  darfBearbeiten: boolean; onLoeschen: () => void
}) {
  const e = b.einstellungen ?? {}
  const formatName = e.format ? (formatNamen[e.format]?.name ?? e.format) : null
  const sprecher = e.sprecher ?? []
  const loeschbar = darfLoeschen(b.status)
  const nochInArbeit = laeuft(b.status)

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 flex-1 basis-80">
        <h1 className="break-words text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{b.titel}</h1>
        <p className="mt-2 text-leise">{darfBearbeiten ? tb.kopf.untertitel : tb.kopf.untertitelHoeren}</p>
        <ul aria-label={tb.kopf.infos} className="mt-4 flex flex-wrap items-center gap-1.5">
          <li className="max-w-full"><StatusChip status={b.status} t={t} /></li>
          {b.ist_probe && <li><span className={`${chip} border-violett/30 bg-[#f3efff] font-semibold text-[#5b36c4]`}>{t.probe}</span></li>}
          {formatName && <li className="max-w-full"><span className={chip}><span className="sr-only">{tb.kopf.format}: </span>{formatName}</span></li>}
          {e.sprache && <li className="max-w-full"><span className={chip}><span className="sr-only">{tb.kopf.sprache}: </span>{sprachName(e.sprache, sprache)}</span></li>}
          {sprecher.length > 0 && (
            <li className="max-w-full">
              <span className={`${chip} flex-wrap`}>
                <span className="sr-only">{tb.kopf.sprecher}: </span>
                {sprecher.map((s, i) => (
                  <span key={s.rolle} className="inline-flex items-center gap-1">
                    <span aria-hidden="true" className={`size-2 rounded-full ${sprecherFarbe(s.rolle).punkt}`} />
                    <span className={sprecherFarbe(s.rolle).text}>{s.name}</span>
                    {i < sprecher.length - 1 && <span aria-hidden="true" className="text-leise">·</span>}
                  </span>
                ))}
              </span>
            </li>
          )}
          {(b.laenge_s || e.ziel_laenge_s) ? (
            <li className="max-w-full">
              <span className={`${chip} tabular-nums`}>
                <span className="sr-only">{tb.kopf.laenge}: </span>
                {b.laenge_s ? mmss(b.laenge_s) : fuellen(tb.kopf.ziel, { zeit: mmss(e.ziel_laenge_s) })}
              </span>
            </li>
          ) : null}
          <li className="max-w-full"><span className={`${chip} border-transparent bg-transparent px-1 text-leise`}>{fuellen(tb.kopf.erstellt, { datum: datum(b.erstellt_am, sprache) })}</span></li>
        </ul>
      </div>

      {darfBearbeiten && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={tb.kopf.aktionen}>
          <Link href={`/portal/neu?von=${encodeURIComponent(b.id)}`} className="knopf knopf-zweit text-sm">
            <IconNeu className="size-4" /> {tb.kopf.aehnlich}
          </Link>
          {(loeschbar || nochInArbeit) && (
            <div className="grid gap-1">
              <button type="button" className="knopf knopf-zweit text-sm text-[#a32424]" onClick={onLoeschen} disabled={!loeschbar}
                aria-describedby={loeschbar ? undefined : 'loeschen-gesperrt'}>
                <IconMuell className="size-4" /> {tb.kopf.loeschen}
              </button>
              {!loeschbar && <p id="loeschen-gesperrt" className="max-w-48 text-xs text-leise">{tb.kopf.loeschenGesperrt}</p>}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
