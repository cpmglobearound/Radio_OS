'use client'
// Stimmwahl als Dialog: Filter nach Geschlecht, Hörprobe, „Mit meinem Text anhören", besonders natürliche Stimmen zuerst.
import { useEffect, useRef, useState } from 'react'
import Dialog from '@/components/gemeinsam/Dialog'
import Hinweis from '@/components/gemeinsam/Hinweis'
import HoerKnopf from '@/components/portal/HoerKnopf'
import { usePortal } from '@/components/portal/Kontext'
import { fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import { IconFunken, IconHaken, IconLachen, IconWelle } from '@/components/gemeinsam/Icons'
import type { AssistentTexte } from '@/lib/i18n/texte/assistent'
import { Auswahl, segmentKlasse } from './Bausteine'
import { istLive, type Stimme } from './zustand'

type Filter = 'alle' | 'weiblich' | 'maennlich' | 'neutral'

export function StimmMerkmale({ s, t }: { s: Stimme; t: AssistentTexte['stimmen'] }) {
  const teile = [s.geschlecht ? t.geschlecht[s.geschlecht] : null, s.alter ? t.alter[s.alter] : null].filter(Boolean)
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {istLive(s.id) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f3efff] px-2 py-0.5 text-[11px] font-semibold text-[#5b36c4]">
          <IconFunken className="size-3.5" />{t.natuerlich}
        </span>
      )}
      {s.kann_lachen && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6d8] px-2 py-0.5 text-[11px] font-semibold text-[#7a5200]">
          <IconLachen className="size-3.5" />{t.kannLachen}
        </span>
      )}
      {teile.length > 0 && <span className="text-xs text-leise">{teile.join(' · ')}</span>}
    </span>
  )
}

export default function StimmDialog({ offen, onSchliessen, nr, stimmen, gewaehlt, belegt, onWahl, sprache, t }: {
  offen: boolean
  onSchliessen: () => void
  /** Sprecher-Nummer (1-basiert). */
  nr: number
  stimmen: Stimme[]
  gewaehlt: string
  /** Stimm-id → Sprecher-Nummer (andere Sprecher). */
  belegt: Record<string, number>
  onWahl: (s: Stimme) => void
  sprache: string
  t: AssistentTexte['stimmen']
}) {
  const { g } = usePortal()
  const [filter, setFilter] = useState<Filter>('alle')
  const [probeText, setProbeText] = useState('')
  const [probeLaedt, setProbeLaedt] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const ton = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const r = ton
    // Nur ein Ton gleichzeitig: startet eine Hörprobe, hält der eigene Probetext an.
    const anderer = (e: Event) => { if (r.current && e.target !== r.current) r.current.pause() }
    document.addEventListener('play', anderer, true)
    return () => { document.removeEventListener('play', anderer, true); r.current?.pause(); r.current?.remove() }
  }, [])

  const vorhanden = (['weiblich', 'maennlich', 'neutral'] as const).filter(x => stimmen.some(s => s.geschlecht === x))
  const filterWerte: Filter[] = ['alle', ...vorhanden]
  const aktiverFilter: Filter = filterWerte.includes(filter) ? filter : 'alle'
  const sichtbar = stimmen
    .filter(s => aktiverFilter === 'alle' || s.geschlecht === aktiverFilter)
    .sort((a, b) => Number(istLive(b.id)) - Number(istLive(a.id)))

  async function eigeneProbe(s: Stimme) {
    const text = probeText.trim()
    if (text.length < 2) { setMeldung(t.eigenerTextFehlt); document.getElementById('a-probetext')?.focus(); return }
    setProbeLaedt(s.id); setMeldung(null)
    try {
      const res = await fetch(`/api/v1/stimmen/${encodeURIComponent(s.id)}/probe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, sprache }), cache: 'no-store',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        const code = typeof j?.code === 'string' ? j.code : null
        setMeldung(code === 'proben_limit' ? t.probeLimit : code && code !== 'intern' && code !== 'unbekannt' ? fehlerText(code, g.fehler) : t.probeFehler)
        return
      }
      const url = URL.createObjectURL(await res.blob())
      ton.current?.pause(); ton.current?.remove()
      const a = new Audio(url)
      a.addEventListener('ended', () => { URL.revokeObjectURL(url); a.remove() })
      a.addEventListener('error', () => setMeldung(t.probeFehler))
      document.body.appendChild(a)   // damit andere ▶-Knöpfe anhalten
      ton.current = a
      await a.play().catch(() => setMeldung(t.probeFehler))
    } catch {
      setMeldung(fehlerText('netz', g.fehler))
    } finally {
      setProbeLaedt(null)
    }
  }

  return (
    <Dialog offen={offen} onSchliessen={onSchliessen} titel={fuellen(t.dialogTitel, { n: nr })} beschreibung={t.dialogText} schliessenText={g.knopf.schliessen} breit
      fuss={<button type="button" className="knopf knopf-zweit" onClick={onSchliessen}>{g.knopf.schliessen}</button>}>
      <div className="grid gap-4">
        {filterWerte.length > 2 && (
          <Auswahl label={t.filter} werte={filterWerte} wert={aktiverFilter} onWahl={setFilter} className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse}
            inhalt={f => (f === 'alle' ? t.alle : t.geschlecht[f])} />
        )}

        <details className="rounded-2xl border border-linie bg-grund px-4 py-3">
          <summary className="cursor-pointer font-medium text-text">{t.eigenerText}</summary>
          <div className="mt-3">
            <label htmlFor="a-probetext" className="etikett">{t.eigenerTextLabel}</label>
            <textarea id="a-probetext" className="feld resize-y" rows={2} maxLength={200} value={probeText} placeholder={t.eigenerTextPlatz}
              aria-describedby="a-probetext-hilfe" onChange={e => setProbeText(e.target.value)} />
            <p id="a-probetext-hilfe" className="hinweis mt-1.5 flex flex-wrap justify-between gap-2">
              <span>{t.eigenerTextHilfe}</span><span className="tabular-nums">{probeText.length}/200</span>
            </p>
          </div>
        </details>

        <div aria-live="polite">{meldung && <Hinweis art="warnung">{meldung}</Hinweis>}</div>

        {sichtbar.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-linie-2 px-4 py-6 text-center text-sm text-leise">
            <p>{t.keineTreffer}</p>
            <button type="button" className="knopf knopf-zweit mt-3" onClick={() => setFilter('alle')}>{t.filterZuruecksetzen}</button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {sichtbar.map(s => {
              const aktiv = s.id === gewaehlt
              const live = istLive(s.id)
              const bei = belegt[s.id]
              return (
                <li key={s.id} className={`flex min-w-0 flex-col gap-2 rounded-2xl border-2 p-3.5 ${aktiv ? 'border-cyan-tief bg-cyan-hell/40' : live ? 'border-violett/40 bg-[#faf8ff]' : 'border-linie bg-karte'}`}>
                  <div className="flex min-w-0 items-start gap-3">
                    {s.hoerprobe_url ? (
                      <HoerKnopf quelle={s.hoerprobe_url} label={fuellen(t.hoerprobe, { name: s.name })} anhaltenLabel={t.anhalten}
                        onFehler={() => setMeldung(t.hoerprobeFehler)} />
                    ) : (
                      <span title={t.keineHoerprobe} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-grund-2 text-leise">
                        <IconWelle className="size-4" /><span className="sr-only">{t.keineHoerprobe}</span>
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-display font-semibold text-text">{s.name}</p>
                      {s.stil.length > 0 && <p className="break-words text-sm text-text-2">{s.stil.join(' · ')}</p>}
                    </div>
                  </div>
                  <StimmMerkmale s={s} t={t} />
                  <p className="text-[11px] text-leise">{fuellen(t.anbieter, { name: s.anbieter })}</p>
                  {bei && <p className="text-xs font-medium text-[#8a4b05]">{fuellen(t.schonBei, { n: bei })}</p>}
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <button type="button" onClick={() => onWahl(s)} aria-pressed={aktiv}
                      className={`knopf flex-1 px-4 py-2 text-sm ${aktiv ? 'knopf-haupt' : 'knopf-zweit'}`}>
                      {aktiv ? <><IconHaken className="size-4" />{t.gewaehlt}</> : t.nehmen}
                    </button>
                    <button type="button" onClick={() => eigeneProbe(s)} disabled={probeLaedt !== null}
                      aria-label={fuellen(t.eigenerTextKnopfLabel, { name: s.name })}
                      className="knopf knopf-zweit px-3.5 py-2 text-sm">
                      {probeLaedt === s.id ? t.eigenerTextLaedt : t.eigenerTextKnopf}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Dialog>
  )
}
