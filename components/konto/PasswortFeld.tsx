'use client'
// Passwortfeld mit Knopf zum Anzeigen und optionaler Stärkeanzeige (Balken + Wort + kurzer Tipp).
import { useId, useState, type ReactNode } from 'react'
import { IconAuge, IconAugeZu } from '@/components/gemeinsam/Icons'
import { fuellen } from '@/components/gemeinsam/format'
import type { KontoTexte } from '@/lib/i18n/texte/konto'
import { FeldRahmen, beschreibung } from './Feld'
import { MIN_PASSWORT, passwortStaerke } from './staerke'

const FARBE = { schwach: 'bg-rot', mittel: 'bg-gelb', stark: 'bg-gruen' }
const WORTFARBE = { schwach: 'text-[#a32424]', mittel: 'text-[#8a4b05]', stark: 'text-[#0a6e5f]' }

function StaerkeAnzeige({ wert, t }: { wert: string; t: KontoTexte['staerke'] }) {
  if (!wert) return <>{t.mindestens}</>
  const { stufe, punkte } = passwortStaerke(wert)
  const fehlen = MIN_PASSWORT - [...wert].length
  const tipp = fehlen > 0 ? fuellen(t.nochZeichen, { n: fehlen }) : stufe === 'stark' ? t.gut : /^[\p{L}]+$/u.test(wert) ? t.tippMischung : t.tippLaenge
  return (
    <div>
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="grid flex-1 grid-cols-3 gap-1.5">
          {[1, 2, 3].map(i => (
            <span key={i} className={`h-1.5 rounded-full transition-colors duration-300 ${i <= punkte ? FARBE[stufe] : 'bg-linie'}`} />
          ))}
        </div>
        <span className={`shrink-0 text-sm font-semibold ${WORTFARBE[stufe]}`}>{t.titel}: {t.stufe[stufe]}</span>
      </div>
      <p className="mt-1" aria-live="polite">{tipp}</p>
    </div>
  )
}

export default function PasswortFeld({ label, wert, onWert, fehler, hinweis, zusatz, name = 'passwort', autoComplete, texte, staerke, id: eigeneId, required }: {
  label: ReactNode
  wert: string
  onWert: (w: string) => void
  fehler?: string | null
  hinweis?: ReactNode
  zusatz?: ReactNode
  name?: string
  autoComplete: 'current-password' | 'new-password'
  texte: { anzeigen: string; verbergen: string }
  /** Mit Texten → Stärkeanzeige unter dem Feld (statt `hinweis`). */
  staerke?: KontoTexte['staerke']
  id?: string
  required?: boolean
}) {
  const auto = useId()
  const id = eigeneId ?? auto
  const [sichtbar, setSichtbar] = useState(false)
  const unten = staerke ? <StaerkeAnzeige wert={wert} t={staerke} /> : hinweis
  return (
    <FeldRahmen id={id} label={label} fehler={fehler} hinweis={unten} zusatz={zusatz}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={sichtbar ? 'text' : 'password'}
          value={wert}
          onChange={e => onWert(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required={required}
          aria-invalid={fehler ? true : undefined}
          aria-describedby={beschreibung(id, fehler, unten)}
          className={`feld !pr-12 ${fehler ? '!border-rot' : ''}`}
        />
        <button
          type="button"
          onClick={() => setSichtbar(s => !s)}
          aria-label={sichtbar ? texte.verbergen : texte.anzeigen}
          aria-pressed={sichtbar}
          aria-controls={id}
          className="absolute inset-y-0 right-1 my-auto inline-flex size-10 items-center justify-center rounded-full text-leise transition-colors hover:bg-grund-2 hover:text-text"
        >
          {sichtbar ? <IconAugeZu className="size-5" /> : <IconAuge className="size-5" />}
        </button>
      </div>
    </FeldRahmen>
  )
}
