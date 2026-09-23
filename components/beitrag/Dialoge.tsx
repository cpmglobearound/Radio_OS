'use client'
// Dialoge der Beitragsansicht: Zeile neu sprechen, Mit KI überarbeiten, Bestätigen (Löschen, Verwerfen).
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import Dialog from '@/components/gemeinsam/Dialog'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import { IconFunken, IconMikro } from '@/components/gemeinsam/Icons'
import { istEmotion } from '@/components/portal/anzeige'
import EmotionWahl from './EmotionWahl'
import type { BeitragDaten, KiBereich, Zeile } from './typen'

/** Ja/Nein im Seitenstil (statt confirm). */
export function Bestaetigen({ offen, titel, text, ja, nein, laeuft, laeuftText, fehler, gefaehrlich = false, onJa, onNein, schliessenText }: {
  offen: boolean; titel: string; text: ReactNode; ja: string; nein: string; laeuft?: boolean; laeuftText?: string; fehler?: string | null
  gefaehrlich?: boolean; onJa: () => void; onNein: () => void; schliessenText: string
}) {
  return (
    <Dialog offen={offen} onSchliessen={onNein} titel={titel} schliessenText={schliessenText} sperren={laeuft}
      fuss={<>
        <button type="button" className="knopf knopf-zweit" onClick={onNein} disabled={laeuft}>{nein}</button>
        <button type="button" className={`knopf ${gefaehrlich ? 'bg-rot text-white hover:opacity-90' : 'knopf-haupt'}`} onClick={onJa} disabled={laeuft}>
          {laeuft ? (laeuftText ?? ja) : ja}
        </button>
      </>}>
      <div className="grid gap-3 text-sm leading-6 text-text-2">
        {text}
        {fehler && <Hinweis art="fehler">{fehler}</Hinweis>}
      </div>
    </Dialog>
  )
}

/** Eine Zeile zum Neusprechen vormerken (optional neue Regie und Emotion). */
export function NeuSprechenDialog({ zeile, beitragId, t, g, tb, onFertig, onSchliessen }: {
  zeile: Zeile; beitragId: string; t: PortalTexte; g: GemeinsamTexte; tb: BeitragTexte
  onFertig: () => void; onSchliessen: () => void
}) {
  const [regie, setRegie] = useState(zeile.regie ?? '')
  const [emotion, setEmotion] = useState<string>(istEmotion(zeile.emotion) ? zeile.emotion : 'warm')
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const id = useId()

  async function senden(e: FormEvent) {
    e.preventDefault()
    setLaeuft(true)
    setFehler(null)
    const r = await api(`/api/v1/beitraege/${beitragId}/zeilen/${zeile.nr}/neu`, { body: { regie, emotion } })
    setLaeuft(false)
    if (r.ok) onFertig()
    else setFehler(fehlerText(r.code, g.fehler))
  }

  return (
    <Dialog offen onSchliessen={onSchliessen} titel={fuellen(tb.neuSprechen.titel, { nr: zeile.nr })} beschreibung={tb.neuSprechen.text}
      schliessenText={g.knopf.schliessen} sperren={laeuft} breit
      fuss={<>
        <button type="button" className="knopf knopf-zweit" onClick={onSchliessen} disabled={laeuft}>{g.knopf.abbrechen}</button>
        <button type="submit" form={`${id}-f`} className="knopf knopf-haupt" disabled={laeuft}>
          <IconMikro className="size-4" /> {laeuft ? tb.neuSprechen.laeuft : tb.neuSprechen.knopf}
        </button>
      </>}>
      <form id={`${id}-f`} onSubmit={senden} className="grid gap-4">
        <blockquote className="break-words rounded-xl bg-grund-2 px-3 py-2 text-sm text-text-2">{zeile.text}</blockquote>
        <div>
          <label htmlFor={`${id}-r`} className="etikett">{tb.neuSprechen.regie}</label>
          <input id={`${id}-r`} className="feld" value={regie} maxLength={300} onChange={e => setRegie(e.target.value)} placeholder={tb.editor.regiePlatzhalter} />
        </div>
        <EmotionWahl wert={emotion} onWahl={setEmotion} label={tb.neuSprechen.emotion} t={t} />
        {fehler && <Hinweis art="fehler">{fehler}</Hinweis>}
      </form>
    </Dialog>
  )
}

type Bereich = 'ganz' | 'block' | 'zeile'

/** „Mit KI überarbeiten": Bereich wählen, Anweisung schreiben (mit Vorschlägen), dann bis zu 2 Minuten warten. */
export function KiDialog({ start, daten, g, tb, onFertig, onSchliessen }: {
  start: KiBereich; daten: BeitragDaten; g: GemeinsamTexte; tb: BeitragTexte
  onFertig: (geaendert: number[]) => void; onSchliessen: () => void
}) {
  const ruhig = useReducedMotion()
  const id = useId()
  const feld = useRef<HTMLTextAreaElement>(null)
  const blockId = start.art === 'ganz' ? null : start.block_id
  const block = blockId ? daten.bloecke.find(b => b.id === blockId) ?? null : null
  const [bereich, setBereich] = useState<Bereich>(start.art)
  const [anweisung, setAnweisung] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const [feldFehler, setFeldFehler] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const optionen: { wert: Bereich; text: string }[] = [
    { wert: 'ganz', text: tb.ki.ganz },
    ...(block ? [{ wert: 'block' as const, text: fuellen(tb.ki.block, { thema: block.thema }) }] : []),
    ...(start.art === 'zeile' ? [{ wert: 'zeile' as const, text: fuellen(tb.ki.zeile, { nr: start.nr }) }] : []),
  ]

  function vorschlag(text: string, cursorAnsEnde = false) {
    const neu = anweisung.trim() ? `${anweisung.replace(/[\s,]+$/, '')}, ${text}` : text
    setAnweisung(neu)
    setFeldFehler(false)
    if (cursorAnsEnde) requestAnimationFrame(() => { const f = feld.current; if (f) { f.focus(); f.setSelectionRange(neu.length, neu.length) } })
  }

  async function senden(e: FormEvent) {
    e.preventDefault()
    if (anweisung.trim().length < 3) { setFeldFehler(true); feld.current?.focus(); return }
    setLaeuft(true)
    setFehler(null)
    const body: { anweisung: string; block_id?: string; zeile?: number } = { anweisung: anweisung.trim() }
    if (bereich === 'block' && block) body.block_id = block.id
    if (bereich === 'zeile' && start.art === 'zeile') body.zeile = start.nr
    const r = await api<{ ok: boolean; geaendert: number[]; neu_vertonen: boolean }>(`/api/v1/beitraege/${daten.beitrag.id}/ueberarbeiten`, { body })
    setLaeuft(false)
    if (r.ok) onFertig(r.daten.geaendert ?? [])
    else setFehler(r.code === 'zu_viele' ? tb.ki.zu_viele : r.code === 'status' ? tb.ki.status : fehlerText(r.code, g.fehler))
  }

  const vorschlaege = [tb.ki.v.lustiger, tb.ki.v.ernster, tb.ki.v.kuerzer, tb.ki.v.emotion, tb.ki.v.einfacher]

  return (
    <Dialog offen onSchliessen={onSchliessen} titel={tb.ki.titel} beschreibung={laeuft ? undefined : tb.ki.text}
      schliessenText={g.knopf.schliessen} sperren={laeuft} breit
      fuss={laeuft ? undefined : <>
        <button type="button" className="knopf knopf-zweit" onClick={onSchliessen}>{g.knopf.abbrechen}</button>
        <button type="submit" form={`${id}-f`} className="knopf knopf-bunt"><IconFunken className="size-4" /> {tb.ki.knopf}</button>
      </>}>
      {laeuft ? (
        <div role="status" aria-live="polite" className="grid justify-items-center gap-4 py-8 text-center">
          <span className="relative flex size-16 items-center justify-center">
            <motion.span aria-hidden="true" className="verlauf-grund absolute inset-0 rounded-full opacity-25"
              animate={ruhig ? undefined : { scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.span aria-hidden="true" className="verlauf-grund flex size-12 items-center justify-center rounded-full text-white"
              animate={ruhig ? undefined : { rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              <IconFunken className="size-6" />
            </motion.span>
          </span>
          <p className="text-lg font-semibold text-text">{tb.ki.laeuftTitel}</p>
          <p className="max-w-sm text-sm text-leise">{tb.ki.laeuftText}</p>
        </div>
      ) : (
        <form id={`${id}-f`} onSubmit={senden} className="grid gap-5" noValidate>
          {optionen.length > 1 && (
            <fieldset className="min-w-0">
              <legend className="etikett">{tb.ki.bereich}</legend>
              <div className="grid gap-2">
                {optionen.map(o => (
                  <label key={o.wert} className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-tief ${bereich === o.wert ? 'border-text bg-grund-2 font-semibold' : 'border-linie hover:border-linie-2'}`}>
                    <input type="radio" name={`${id}-b`} value={o.wert} checked={bereich === o.wert} onChange={() => setBereich(o.wert)} className="mt-0.5 accent-[#181a32]" />
                    <span className="min-w-0 break-words">{o.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div>
            <label htmlFor={`${id}-a`} className="etikett">{tb.ki.anweisung}</label>
            <textarea id={`${id}-a`} ref={feld} className="feld min-h-28 resize-y" value={anweisung} maxLength={2000} rows={4}
              placeholder={tb.ki.platzhalter} aria-invalid={feldFehler} aria-describedby={feldFehler ? `${id}-e` : undefined}
              onChange={e => { setAnweisung(e.target.value); if (feldFehler) setFeldFehler(false) }} />
            {feldFehler && <p id={`${id}-e`} className="mt-1 text-sm text-[#a32424]">{tb.ki.zuKurz}</p>}
          </div>
          <div>
            <p className="etikett" id={`${id}-v`}>{tb.ki.vorschlaege}</p>
            <div role="group" aria-labelledby={`${id}-v`} className="flex flex-wrap gap-1.5">
              {vorschlaege.map(text => (
                <button key={text} type="button" onClick={() => vorschlag(text)}
                  className="rounded-full border border-linie-2 bg-karte px-3 py-1 text-sm font-medium text-text-2 hover:border-text hover:text-text">
                  {text}
                </button>
              ))}
              <button type="button" onClick={() => vorschlag(tb.ki.mehrUeber, true)}
                className="rounded-full border border-linie-2 bg-karte px-3 py-1 text-sm font-medium text-text-2 hover:border-text hover:text-text">
                {tb.ki.v.mehrUeber}
              </button>
            </div>
          </div>
          {fehler && <Hinweis art="fehler">{fehler}</Hinweis>}
        </form>
      )}
    </Dialog>
  )
}
