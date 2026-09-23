'use client'
// Schritt ③: Sprache des Beitrags (aktive Ausgabesprachen aus lib/sprachen).
import { IconGlobus } from '@/components/gemeinsam/Icons'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { ausgabespracheVon, landName, sprachName, type UiSprache } from '@/lib/sprachen'
import { Auswahl, FeldFehler, karteKlasse } from './Bausteine'
import { aktiveSprachen, feldId, type SchrittProps } from './zustand'

export default function SchrittSprache({ e, setE, fehler, t, ui }: SchrittProps & { ui: UiSprache }) {
  const ts = t.sprache
  return (
    <div className="grid min-w-0 gap-5">
      <div className="min-w-0">
        <Auswahl id={feldId.sprache} label={ts.label} werte={aktiveSprachen().map(s => s.code)} wert={e.sprache || null} fehler={fehler[feldId.sprache]}
          onWahl={code => setE(v => {
            if (v.sprache === code) return v
            const a = ausgabespracheVon(code)
            const anrede = a && v.ton.anrede && a.anrede.includes(v.ton.anrede) ? v.ton.anrede : a?.anrede_standard
            return { ...v, sprache: code, ton: { ...v.ton, anrede } }
          })}
          className="grid gap-3 sm:grid-cols-3" knopfKlasse={karteKlasse}
          inhalt={(code, aktiv) => {
            const a = ausgabespracheVon(code)!
            return (
              <>
                <span className={`mb-1 flex size-10 items-center justify-center rounded-xl ${aktiv ? 'verlauf-grund text-white' : 'bg-cyan-hell text-cyan-tief'}`}>
                  <IconGlobus className="size-5" />
                </span>
                <span className="font-display text-lg font-semibold capitalize text-text">{sprachName(a.basis, ui)}</span>
                <span className="text-sm text-leise">{landName(a.land, ui)}</span>
              </>
            )
          }} />
        <FeldFehler id={feldId.sprache} text={fehler[feldId.sprache]} />
      </div>
      <Hinweis art="info">{ts.hinweis}</Hinweis>
    </div>
  )
}
