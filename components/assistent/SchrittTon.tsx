'use client'
// Schritt ⑤: Ton (Vorlagen + Feinabstimmung aller Regler), Emotionen, Wünsche, Drehbuch-Prüfung, Sendungsname.
import { usePortal } from '@/components/portal/Kontext'
import EmotionChip from '@/components/portal/EmotionChip'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { fuellen } from '@/components/gemeinsam/format'
import { formatVon } from '@/lib/formate'
import { ausgabespracheVon } from '@/lib/sprachen'
import { EMOTIONEN, REGLER, VORLAGEN, type Tonalitaet } from '@/lib/tonalitaet'
import { Abschnitt, Aufklapper, Auswahl, FeldFehler, Schalter, Zaehler, fehlerId, karteKlasse, segmentKlasse } from './Bausteine'
import { feldId, type SchrittProps, type Stimme, type VorlageId } from './zustand'

type Segment = Exclude<keyof typeof REGLER, 'humor'>
const SEGMENTE: Segment[] = ['lachen', 'haltung', 'waerme', 'energie', 'tempo', 'niveau', 'zielgruppe']

function HumorPunkte({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={label}>
      {[1, 2, 3, 4].map(i => <span key={i} aria-hidden="true" className={`size-2 rounded-full ${i <= n ? 'bg-rosa' : 'bg-linie-2'}`} />)}
    </span>
  )
}

export default function SchrittTon({ e, setE, fehler, t, stimmen }: SchrittProps & { stimmen: Stimme[] | null }) {
  const { t: pt, mandant } = usePortal()
  const tt = t.ton
  const f = formatVon(e.format)
  const humorAus = f ? !f.humor_erlaubt : false
  const gewaehlte = e.sprecher.slice(0, e.sprecherzahl).map(s => stimmen?.find(v => v.id === s.stimme)).filter(Boolean) as Stimme[]
  const keinLachen = gewaehlte.length > 0 && gewaehlte.every(s => !s.kann_lachen)
  const anreden = ausgabespracheVon(e.sprache)?.anrede ?? []
  const vorlagen = Object.keys(VORLAGEN) as VorlageId[]

  /** Ein Regler geändert → eigene Mischung (Vorlage zeigt „angepasst"). */
  const regler = <K extends keyof Tonalitaet>(k: K, w: Tonalitaet[K]) =>
    setE(v => ({ ...v, ton: { ...v.ton, [k]: w }, angepasst: k === 'anrede' ? v.angepasst : true }))

  const idAnw = feldId.anweisung, idSend = feldId.sendungsname
  const humorWert = humorAus ? 0 : e.ton.humor

  return (
    <div className="grid min-w-0 gap-8">
      <div className="min-w-0">
        <Auswahl label={tt.vorlagenLabel} werte={vorlagen} wert={e.vorlage}
          onWahl={k => setE(v => ({ ...v, vorlage: k, angepasst: false, ton: { ...VORLAGEN[k], anrede: v.ton.anrede } }))}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" knopfKlasse={karteKlasse}
          inhalt={(k, aktiv) => {
            const v = VORLAGEN[k]
            const text = tt.vorlagen[k as keyof typeof tt.vorlagen]
            return (
              <>
                <span className="flex w-full flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold text-text">{text?.name ?? k}</span>
                  {aktiv && e.angepasst && <span className="rounded-full bg-gelb-hell px-2 py-0.5 text-[11px] font-semibold text-[#8a4b05]">{tt.angepasst}</span>}
                </span>
                <span className="text-sm leading-6 text-text-2">{text?.text}</span>
                <span className="mt-auto flex items-center gap-2 pt-1.5 text-xs text-leise">
                  <HumorPunkte n={humorAus ? 0 : v.humor} label={fuellen(tt.humorPunkte, { n: humorAus ? 0 : v.humor })} />
                  <span aria-hidden="true">{tt.regler.humor}</span>
                </span>
              </>
            )
          }} />
        {!e.vorlage && <p className="mt-2 text-sm font-medium text-text-2">{tt.eigeneMischung}</p>}
      </div>

      <Hinweis art="info">{tt.taktHinweis}</Hinweis>

      <Aufklapper titel={tt.fein} text={tt.feinText} anfangsOffen={e.angepasst}>
        <div className="grid min-w-0 gap-6">
          {humorAus && <Hinweis art="warnung">{tt.humorGesperrt}</Hinweis>}

          <div className="min-w-0">
            <label htmlFor="a-humor" className="etikett">{tt.regler.humor}</label>
            <p className="hinweis -mt-1 mb-2">{tt.reglerHilfe.humor}</p>
            <input id="a-humor" type="range" min={0} max={4} step={1} value={humorWert} disabled={humorAus}
              aria-valuetext={tt.werte.humor[humorWert]}
              onChange={x => regler('humor', Number(x.target.value) as Tonalitaet['humor'])}
              className="w-full accent-[#8b5cf6] disabled:opacity-45" />
            <div aria-hidden="true" className="mt-1 grid grid-cols-5 text-center text-[11px] text-leise sm:text-xs">
              {tt.werte.humor.map((w, i) => (
                <span key={w} className={`min-w-0 break-words first:text-left last:text-right ${i === humorWert ? 'font-semibold text-text' : ''}`}>{w}</span>
              ))}
            </div>
          </div>

          {SEGMENTE.map(k => {
            const gesperrt = k === 'lachen' && (humorAus || keinLachen)
            const werte = REGLER[k] as readonly string[]
            const wert = gesperrt ? 'nie' : (e.ton[k] as string)
            return (
              <div key={k} className="min-w-0">
                <p id={`a-regler-${k}`} className="etikett">{tt.regler[k]}</p>
                <p className="hinweis -mt-1 mb-2">{tt.reglerHilfe[k]}</p>
                <Auswahl beschriftetVon={`a-regler-${k}`} werte={werte} wert={wert} deaktiviert={() => gesperrt}
                  onWahl={w => regler(k, w as Tonalitaet[typeof k])} className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse}
                  inhalt={w => (tt.werte[k] as Record<string, string>)[w] ?? w} />
                {k === 'lachen' && keinLachen && !humorAus && <p className="mt-2 text-sm text-[#8a4b05]">{tt.lachenKeineStimme}</p>}
              </div>
            )
          })}

          {anreden.length > 1 && (
            <div className="min-w-0">
              <p id="a-regler-anrede" className="etikett">{tt.regler.anrede}</p>
              <p className="hinweis -mt-1 mb-2">{tt.reglerHilfe.anrede}</p>
              <Auswahl beschriftetVon="a-regler-anrede" werte={anreden} wert={e.ton.anrede ?? ausgabespracheVon(e.sprache)?.anrede_standard ?? null}
                onWahl={w => regler('anrede', w)} className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse} inhalt={w => w} />
            </div>
          )}
        </div>
      </Aufklapper>

      <Abschnitt titel={tt.emotionenTitel} text={tt.emotionenText} id="a-emotionen-titel">
        <ul className="flex flex-wrap gap-2" aria-labelledby="a-emotionen-titel">
          {EMOTIONEN.map(em => <li key={em}><EmotionChip emotion={em} t={pt} className="px-3 py-1 text-xs" /></li>)}
        </ul>
      </Abschnitt>

      <div className="min-w-0">
        <label htmlFor={idAnw} className="etikett">{tt.anweisung} <span className="font-normal text-leise">({t.optional})</span></label>
        <p id={`${idAnw}-hilfe`} className="hinweis -mt-1 mb-2">{tt.anweisungHilfe}</p>
        <textarea id={idAnw} className="feld min-h-28 resize-y leading-6" rows={4} maxLength={2000} value={e.anweisung} placeholder={tt.anweisungPlatz}
          aria-invalid={fehler[idAnw] ? true : undefined} aria-describedby={`${idAnw}-hilfe ${idAnw}-zaehler${fehler[idAnw] ? ` ${fehlerId(idAnw)}` : ''}`}
          onChange={x => { const anweisung = x.target.value; setE(v => ({ ...v, anweisung })) }} />
        <div id={`${idAnw}-zaehler`} className="mt-1 text-right">
          <Zaehler n={e.anweisung.length} max={2000} warnAb={1900} text={fuellen(t.zeichen, { n: e.anweisung.length, max: 2000 })} />
        </div>
        <FeldFehler id={idAnw} text={fehler[idAnw]} />
      </div>

      <div className="karte p-4 sm:p-5">
        <Schalter an={e.freigabe_noetig} onAendern={an => setE(v => ({ ...v, freigabe_noetig: an }))} label={tt.freigabe}
          text={e.freigabe_noetig ? tt.freigabeAn : tt.freigabeAus} />
      </div>

      <Aufklapper titel={tt.weitere} anfangsOffen={!!e.sendungsname || e.kennung_position !== 'anfang' || !!fehler[idSend]}>
        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor={idSend} className="etikett">{tt.sendungsname} <span className="font-normal text-leise">({t.optional})</span></label>
            <input id={idSend} className="feld" maxLength={120} value={e.sendungsname} placeholder={mandant.name}
              aria-invalid={fehler[idSend] ? true : undefined} aria-describedby={`${idSend}-hilfe${fehler[idSend] ? ` ${fehlerId(idSend)}` : ''}`}
              onChange={x => { const sendungsname = x.target.value; setE(v => ({ ...v, sendungsname })) }} />
            <p id={`${idSend}-hilfe`} className="hinweis mt-1.5">{fuellen(tt.sendungsnameHilfe, { name: mandant.name })}</p>
            <FeldFehler id={idSend} text={fehler[idSend]} />
          </div>
          <div className="min-w-0">
            <p id="a-kennung" className="etikett">{tt.kennung}</p>
            <Auswahl beschriftetVon="a-kennung" werte={['anfang', 'ende'] as const} wert={e.kennung_position}
              onWahl={w => setE(v => ({ ...v, kennung_position: w }))} className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse}
              inhalt={w => tt.kennungWerte[w]} />
          </div>
        </div>
      </Aufklapper>
    </div>
  )
}
