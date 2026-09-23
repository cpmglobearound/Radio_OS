'use client'
// Fertiger Beitrag: Player mit Kapiteln, Download (erst nach Bestellung), Prüfhinweise in einfacher Sprache.
import Link from 'next/link'
import type { UiSprache } from '@/lib/sprachen'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import Player from '@/components/portal/Player'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { fuellen, locale, mmss } from '@/components/gemeinsam/format'
import { IconDownload } from '@/components/gemeinsam/Icons'
import type { Beitrag } from './typen'

/** Prüfhinweis-Code (z. B. „laenge:95:120") → Satz. Unbekannte Codes → null (werden nicht gezeigt). */
export function hinweisText(code: string, tb: BeitragTexte, sprache: UiSprache): string | null {
  const [art, a, b] = code.split(':')
  const zahl = (x: string | undefined, stellen = 0) => {
    const n = Number(x)
    return Number.isFinite(n) ? new Intl.NumberFormat(locale(sprache), { maximumFractionDigits: stellen }).format(n) : null
  }
  switch (art) {
    case 'laenge': {
      const ist = Number(a), ziel = Number(b)
      return Number.isFinite(ist) && Number.isFinite(ziel) ? fuellen(tb.hinweise.laenge, { ist: mmss(ist), ziel: mmss(ziel) }) : null
    }
    case 'lautheit': return tb.hinweise.lautheit
    case 'stille': { const s = zahl(a, 1); return s ? fuellen(tb.hinweise.stille, { s }) : null }
    case 'gesamt': { const p = zahl(a); return p ? fuellen(tb.hinweise.gesamt, { p }) : null }
    case 'zeilen_warnung': {
      const n = Number(a)
      if (!Number.isFinite(n) || n < 1) return null
      return n === 1 ? tb.hinweise.zeilen_warnung_eins : fuellen(tb.hinweise.zeilen_warnung, { n })
    }
    default: return null
  }
}

export default function Hoeren({ beitrag: b, g, tb, sprache }: { beitrag: Beitrag; g: GemeinsamTexte; tb: BeitragTexte; sprache: UiSprache }) {
  const quelle = `/api/v1/beitraege/${b.id}/audio`
  const hinweise = (b.pruefung?.hinweise ?? []).map(h => hinweisText(h, tb, sprache)).filter((h): h is string => !!h)

  return (
    <section aria-labelledby="hoeren-titel" className="karte grid gap-5 p-5 sm:p-7">
      <h2 id="hoeren-titel" className="text-xl font-semibold">{tb.fertig.titel}</h2>
      <Player quelle={`${quelle}?v=${b.version}`} titel={b.titel} laenge={b.laenge_s} kapitel={b.kapitel ?? []} t={g.player} />

      {b.bestellt ? (
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <a href={`${quelle}?download=1`} download className="knopf knopf-haupt text-sm"><IconDownload className="size-4" /> {tb.fertig.mp3}</a>
            <a href={`${quelle}?format=wav&download=1`} download className="knopf knopf-zweit text-sm"><IconDownload className="size-4" /> {tb.fertig.wav}</a>
          </div>
          <p className="hinweis">{tb.fertig.wavHinweis}</p>
        </div>
      ) : (
        <Hinweis art="info" aktion={<Link href="/portal/guthaben" className="knopf knopf-zweit px-4 py-2 text-sm">{tb.fertig.bestellen}</Link>}>
          {tb.fertig.nichtBestellt}
        </Hinweis>
      )}

      {hinweise.length > 0 && (
        <Hinweis art="warnung">
          <p className="font-semibold">{tb.fertig.hinweiseTitel}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {hinweise.map(h => <li key={h}>{h}</li>)}
          </ul>
        </Hinweis>
      )}
    </section>
  )
}
