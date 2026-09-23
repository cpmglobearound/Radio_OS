'use client'
// Eine Stimme in der Admin-Freigabe: Sichtbarkeit, Merkmale (mit Speichern-Knopf) und je Sprache Hörprobe,
// Ergebnis der automatischen Prüfung und die Schalter „muttersprachlich" / „freigegeben" (sofort gespeichert).
import { useId, useState, type KeyboardEvent } from 'react'
import { sprachName } from '@/lib/sprachen'
import type { AdminTexte } from '@/lib/i18n/texte/admin'
import { fuellen, locale } from '@/components/gemeinsam/format'
import { IconHaken, IconInfo, IconKreuz, IconSchloss } from '@/components/gemeinsam/Icons'
import HoerKnopf from '@/components/portal/HoerKnopf'
import { usePortal } from '@/components/portal/Kontext'
import Schalter from '@/components/stimmen/Schalter'
import { fuerKunden, zustandVon, type AdminPatch, type AdminSprache, type AdminStimme, type Filter, type Zustand } from './typen'

type Merkmale = Pick<AdminStimme, 'name' | 'geschlecht' | 'alter' | 'stil' | 'kann_lachen'>
const MAX_STIL = 8
const MAX_WORT = 30

const merkmaleVon = (s: AdminStimme): Merkmale => ({ name: s.name, geschlecht: s.geschlecht, alter: s.alter, stil: s.stil, kann_lachen: s.kann_lachen })
const gleich = (a: Merkmale, b: Merkmale) =>
  a.name === b.name && a.geschlecht === b.geschlecht && a.alter === b.alter && a.kann_lachen === b.kann_lachen && a.stil.join('\u0000') === b.stil.join('\u0000')

const ZUSTAND_FARBE: Record<Zustand, string> = {
  offen: 'bg-grund-2 text-text-2',
  automatisch: 'bg-gelb-hell text-[#8a4b05]',
  freigegeben: 'bg-gruen-hell text-[#0a6e5f]',
  abgelehnt: 'bg-rot-hell text-[#a32424]',
}

export default function StimmKarte({ s, t, filter, email, patchen }: {
  s: AdminStimme
  t: AdminTexte
  filter: Filter
  email: string
  patchen: (vorher: AdminStimme, body: AdminPatch, nachher: AdminStimme) => Promise<boolean>
}) {
  const { sprache: ui } = usePortal()
  const id = useId()
  const [entwurf, setEntwurf] = useState<Merkmale>(() => merkmaleVon(s))
  const [neuWort, setNeuWort] = useState('')
  const [speichert, setSpeichert] = useState(false)
  const [gespeichert, setGespeichert] = useState(false)
  const [probeFehler, setProbeFehler] = useState<string | null>(null)

  const geaendert = !gleich(entwurf, merkmaleVon(s))
  const nameOk = entwurf.name.trim().length > 0 && entwurf.name.length <= 40

  function aendern(m: Partial<Merkmale>) {
    setEntwurf(e => ({ ...e, ...m }))
    setGespeichert(false)
  }

  function wortHinzu() {
    const w = neuWort.trim().replace(/,+$/, '').trim().slice(0, MAX_WORT)
    if (!w || entwurf.stil.length >= MAX_STIL) return
    if (!entwurf.stil.includes(w)) aendern({ stil: [...entwurf.stil, w] })
    setNeuWort('')
  }

  function wortTaste(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); wortHinzu() }
  }

  async function merkmaleSpeichern() {
    const body: AdminPatch = { name: entwurf.name.trim(), stil: entwurf.stil, kann_lachen: entwurf.kann_lachen }
    if (entwurf.geschlecht) body.geschlecht = entwurf.geschlecht
    if (entwurf.alter) body.alter = entwurf.alter
    setSpeichert(true)
    const ok = await patchen(s, body, { ...s, ...entwurf, name: entwurf.name.trim() })
    setSpeichert(false)
    setGespeichert(ok)
    if (ok) setEntwurf(e => ({ ...e, name: e.name.trim() }))
  }

  function sichtbarSetzen(an: boolean) {
    patchen(s, { sichtbar: an }, { ...s, sichtbar: an, geprueft_am: s.geprueft_am ?? new Date().toISOString(), geprueft_von: email })
  }

  function spracheSetzen(sp: AdminSprache, neu: { geprueft: boolean; muttersprachlich: boolean }) {
    const nachher: AdminStimme = {
      ...s,
      geprueft_am: s.geprueft_am ?? new Date().toISOString(),
      geprueft_von: email,
      sprachen: s.sprachen.map(x => (x.code === sp.code ? { ...x, ...neu, geprueft_von: email } : x)),
    }
    patchen(s, { sprachen: [{ code: sp.code, ...neu }] }, nachher)
  }

  const prozent = (x: number) => (x * 100).toLocaleString(locale(ui), { maximumFractionDigits: 1 })

  return (
    <article aria-labelledby={`${id}-n`} className="karte min-w-0 p-4 sm:p-5">
      {/* Kopf: Name, Kennungen, sichtbar */}
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h3 id={`${id}-n`} className="break-words text-xl font-semibold">{s.name}</h3>
          <p className="mt-0.5 break-all font-mono text-[11px] text-leise">{s.id} · {s.anbieter_stimm_id}</p>
          {s.geprueft_von && <p className="mt-0.5 break-words text-xs text-leise">{fuellen(t.karte.geprueftVon, { wer: s.geprueft_von })}</p>}
        </div>
        <Schalter an={s.sichtbar} onWechsel={sichtbarSetzen} label={t.karte.sichtbar} hilfe={t.karte.sichtbarHilfe} className="max-w-xs" />
      </div>

      {/* Merkmale */}
      <fieldset className="mt-4 min-w-0 rounded-2xl border border-linie p-3 sm:p-4">
        <legend className="px-1 text-sm font-semibold text-text-2">{t.karte.merkmale}</legend>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
          <div className="min-w-0">
            <label htmlFor={`${id}-name`} className="etikett">{t.karte.name}</label>
            <input id={`${id}-name`} value={entwurf.name} maxLength={40} onChange={e => aendern({ name: e.target.value })} className="feld py-2" aria-invalid={!nameOk} />
          </div>
          <div className="min-w-0">
            <label htmlFor={`${id}-ge`} className="etikett">{t.karte.geschlecht}</label>
            <select id={`${id}-ge`} value={entwurf.geschlecht ?? ''} onChange={e => aendern({ geschlecht: e.target.value as Merkmale['geschlecht'] })} className="feld py-2">
              {!entwurf.geschlecht && <option value="" disabled>—</option>}
              {(['weiblich', 'maennlich', 'neutral'] as const).map(w => <option key={w} value={w}>{t.geschlecht[w]}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor={`${id}-al`} className="etikett">{t.karte.alter}</label>
            <select id={`${id}-al`} value={entwurf.alter ?? ''} onChange={e => aendern({ alter: e.target.value as Merkmale['alter'] })} className="feld py-2">
              {!entwurf.alter && <option value="" disabled>—</option>}
              {(['jung', 'mittel', 'reif'] as const).map(w => <option key={w} value={w}>{t.alter[w]}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <label htmlFor={`${id}-st`} className="etikett">{t.karte.stil}</label>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {entwurf.stil.map(w => (
              <span key={w} lang="de" className="inline-flex max-w-full items-center gap-1 rounded-full border border-linie bg-grund py-0.5 pl-2.5 pr-1 text-xs text-text-2">
                <span className="min-w-0 break-all">{w}</span>
                <button type="button" onClick={() => aendern({ stil: entwurf.stil.filter(x => x !== w) })} aria-label={fuellen(t.karte.stilEntfernen, { wort: w })}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full hover:bg-linie">
                  <IconKreuz className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex min-w-0 flex-wrap gap-2">
            <input id={`${id}-st`} value={neuWort} maxLength={MAX_WORT + 1} onChange={e => setNeuWort(e.target.value)} onKeyDown={wortTaste} onBlur={wortHinzu}
              disabled={entwurf.stil.length >= MAX_STIL} placeholder={t.karte.stilNeu} aria-describedby={`${id}-sth`} lang="de"
              className="feld min-w-0 flex-1 basis-40 py-2" />
            <button type="button" onClick={wortHinzu} disabled={!neuWort.trim() || entwurf.stil.length >= MAX_STIL} className="knopf knopf-zweit px-4 py-2 text-sm">{t.karte.stilHinzu}</button>
          </div>
          <p id={`${id}-sth`} className="hinweis mt-1 text-xs">{entwurf.stil.length >= MAX_STIL ? t.karte.stilVoll : t.karte.stilHilfe}</p>
        </div>

        <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
          <Schalter an={entwurf.kann_lachen} onWechsel={an => aendern({ kann_lachen: an })} label={t.karte.lachen} />
          <div className="flex flex-wrap items-center gap-2">
            <span aria-live="polite" className="text-xs text-leise">
              {geaendert ? t.karte.ungespeichert : gespeichert ? <span className="inline-flex items-center gap-1 text-[#0a6e5f]"><IconHaken className="size-3.5" />{t.karte.gespeichert}</span> : ''}
            </span>
            {geaendert && (
              <button type="button" onClick={() => { setEntwurf(merkmaleVon(s)); setNeuWort('') }} disabled={speichert} className="knopf knopf-zweit px-4 py-2 text-sm">{t.karte.zuruecksetzen}</button>
            )}
            <button type="button" onClick={merkmaleSpeichern} disabled={!geaendert || !nameOk || speichert} className="knopf knopf-haupt px-4 py-2 text-sm">
              {speichert ? t.karte.speichert : t.karte.speichern}
            </button>
          </div>
        </div>
      </fieldset>

      {/* Sprachen */}
      <h4 className="mt-5 text-base font-semibold">{t.sprache.ueberschrift}</h4>
      {probeFehler && <p role="alert" className="mt-1 text-sm text-[#a32424]">{probeFehler}</p>}
      <ul className="mt-2 grid min-w-0 gap-2">
        {s.sprachen.map(sp => {
          const z = zustandVon(sp)
          const passt = filter !== 'alle' && z === filter
          const url = s.hoerproben[sp.code]
          const name = sprachName(sp.code, ui)
          const kunden = fuerKunden(s, sp)
          return (
            <li key={sp.code} className={`min-w-0 rounded-2xl border p-3 transition-colors ${passt ? 'border-cyan-tief bg-cyan-hell/50' : 'border-linie bg-grund'}`}>
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                {url ? (
                  <HoerKnopf quelle={url} groesse="klein" label={fuellen(t.sprache.hoerprobe, { sprache: name })} anhaltenLabel={t.sprache.hoerprobeAnhalten}
                    onFehler={() => setProbeFehler(`${name}: ${t.sprache.hoerprobeFehler}`)} />
                ) : (
                  <span className="text-xs text-leise">{t.sprache.keineHoerprobe}</span>
                )}
                <span className="min-w-0 font-semibold">{name} <span className="font-mono text-xs font-normal text-leise">{sp.code}</span></span>
                {z && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ZUSTAND_FARBE[z]}`}>{t.sprache.zustand[z]}</span>}
                <span className={`inline-flex items-center gap-1 text-xs ${kunden ? 'text-[#0a6e5f]' : 'text-leise'}`}>
                  {kunden ? <IconHaken className="size-3.5" /> : <IconSchloss className="size-3.5" />}
                  {kunden ? t.sprache.kunden : t.sprache.kundenNicht}
                </span>
              </div>

              <div className="mt-2 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                {/* Automatische Prüfung */}
                <div className="min-w-0 text-sm">
                  <span className="text-xs font-medium text-leise">{t.sprache.auto}: </span>
                  {sp.auto_wortgenauigkeit == null && sp.auto_bestanden == null ? (
                    <span className="text-xs text-leise">{t.sprache.autoKeine}</span>
                  ) : (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {sp.auto_wortgenauigkeit != null && <span className="tabular-nums">{fuellen(t.sprache.wortgenauigkeit, { n: prozent(sp.auto_wortgenauigkeit) })}</span>}
                      {sp.auto_bestanden != null && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sp.auto_bestanden ? 'bg-gruen-hell text-[#0a6e5f]' : 'bg-rot-hell text-[#a32424]'}`}>
                          {sp.auto_bestanden ? t.sprache.bestanden : t.sprache.durchgefallen}
                        </span>
                      )}
                    </span>
                  )}
                  {sp.auto_gehoert && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs font-medium text-cyan-text">{t.sprache.gehoert}</summary>
                      <p lang={sp.code} className="mt-1 break-words rounded-lg bg-karte px-2.5 py-1.5 text-xs leading-5 text-text-2">{sp.auto_gehoert}</p>
                    </details>
                  )}
                  <p className="mt-1 break-words text-xs text-leise">
                    {fuellen(t.sprache.geprueftVon, { wer: !sp.geprueft_von ? t.sprache.niemand : sp.geprueft_von === 'automatisch' ? t.sprache.automatisch : sp.geprueft_von })}
                  </p>
                </div>

                {/* Entscheidung */}
                <div className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-2">
                  <Schalter klein an={sp.muttersprachlich} onWechsel={an => spracheSetzen(sp, { geprueft: sp.geprueft, muttersprachlich: an })}
                    label={<>{t.sprache.muttersprachlich}<span className="sr-only"> ({name})</span></>} />
                  <Schalter klein an={sp.geprueft} onWechsel={an => spracheSetzen(sp, { geprueft: an, muttersprachlich: sp.muttersprachlich })}
                    label={<>{t.sprache.freigegeben}<span className="sr-only"> ({name})</span></>} />
                  {z === 'automatisch' && (
                    <div className="flex w-full flex-wrap gap-2">
                      <button type="button" onClick={() => spracheSetzen(sp, { geprueft: true, muttersprachlich: true })} className="knopf knopf-haupt px-3.5 py-1.5 text-sm">
                        <IconHaken className="size-4" />{t.sprache.bestaetigen}<span className="sr-only"> ({name})</span>
                      </button>
                      <button type="button" onClick={() => spracheSetzen(sp, { geprueft: false, muttersprachlich: sp.muttersprachlich })} className="knopf knopf-zweit px-3.5 py-1.5 text-sm text-[#a32424]">
                        <IconSchloss className="size-4" />{t.sprache.sperren}<span className="sr-only"> ({name})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-3 flex items-start gap-1.5 text-xs text-leise"><IconInfo className="mt-px size-3.5 shrink-0" />{t.karte.kundenRegel}</p>
    </article>
  )
}
