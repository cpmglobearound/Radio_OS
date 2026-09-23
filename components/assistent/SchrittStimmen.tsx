'use client'
// Schritt ④: Zahl der Stimmen, je Sprecher Stimme (Dialog), Name im Programm und Persönlichkeit. Warnt bei gleichen/ähnlichen Stimmen.
import { useState } from 'react'
import Hinweis from '@/components/gemeinsam/Hinweis'
import LeerZustand from '@/components/gemeinsam/LeerZustand'
import HoerKnopf from '@/components/portal/HoerKnopf'
import { usePortal } from '@/components/portal/Kontext'
import { sprecherFarbe } from '@/components/portal/anzeige'
import { fuellen } from '@/components/gemeinsam/format'
import { IconMikro, IconWelle } from '@/components/gemeinsam/Icons'
import { formatVon } from '@/lib/formate'
import { ausgabespracheVon, sprachName, type UiSprache } from '@/lib/sprachen'
import { Abschnitt, Auswahl, FeldFehler, VorschlagChip, Zaehler, fehlerId, segmentKlasse } from './Bausteine'
import StimmDialog, { StimmMerkmale } from './StimmDialog'
import { namensVorschlaege } from './namen'
import { doppelteStimme, feldId, type SchrittProps, type Sprecher, type Stimme } from './zustand'

export default function SchrittStimmen({ e, setE, fehler, t, ui, stimmen, ladeFehler, neuLaden, zurSprache, zurueckgesetzt }: SchrittProps & {
  ui: UiSprache
  stimmen: Stimme[] | null
  ladeFehler: string | null
  neuLaden: () => void
  zurSprache: () => void
  zurueckgesetzt: boolean
}) {
  const { t: pt, g } = usePortal()
  const ts = t.stimmen
  const f = formatVon(e.format)
  const [dialog, setDialog] = useState<number | null>(null)
  const zahlen = f ? Array.from({ length: f.sprecher_max - f.sprecher_min + 1 }, (_, i) => f.sprecher_min + i) : [1, 2, 3]
  const basis = ausgabespracheVon(e.sprache)?.basis
  const genutzt = e.sprecher.slice(0, e.sprecherzahl)
  const stimmeVon = (id: string) => stimmen?.find(s => s.id === id)

  const sprecherAendern = (i: number, x: Partial<Sprecher>) =>
    setE(v => ({ ...v, sprecher: v.sprecher.map((s, j) => (j === i ? { ...s, ...x } : s)) }))

  if (ladeFehler) {
    return <Hinweis art="fehler" aktion={<button type="button" className="knopf knopf-zweit px-4 py-2 text-sm" onClick={neuLaden}>{g.knopf.nochmal}</button>}>{ts.ladenFehler} {ladeFehler}</Hinweis>
  }
  if (!stimmen) {
    return <p role="status" className="karte flex items-center gap-3 px-5 py-6 text-leise"><IconWelle className="size-5 animate-pulse text-cyan-tief" />{ts.laden}</p>
  }
  if (stimmen.length === 0) {
    return (
      <LeerZustand icon={<IconMikro className="size-7" />} titel={ts.leerTitel} text={fuellen(ts.leerText, { sprache: sprachName(e.sprache, ui) })}>
        <button type="button" className="knopf knopf-haupt" onClick={zurSprache}>{ts.leerKnopf}</button>
      </LeerZustand>
    )
  }

  // Ähnliche Stimmen: gleiches Geschlecht und gleiches Alter (nur wenn beides bekannt ist).
  const aehnlich: [number, number][] = []
  for (let a = 0; a < genutzt.length; a++) {
    for (let b = a + 1; b < genutzt.length; b++) {
      const x = stimmeVon(genutzt[a].stimme), y = stimmeVon(genutzt[b].stimme)
      if (x && y && x.id !== y.id && x.geschlecht && x.alter && x.geschlecht === y.geschlecht && x.alter === y.alter) aehnlich.push([a + 1, b + 1])
    }
  }

  const belegtFuer = (i: number) => Object.fromEntries(genutzt.map((s, j) => [s.stimme, j + 1] as const).filter(([id, j]) => id && j !== i + 1))

  return (
    <div className="grid min-w-0 gap-8">
      {zurueckgesetzt && <Hinweis art="warnung">{ts.zurueckgesetzt}</Hinweis>}

      <Abschnitt titel={ts.anzahl} id="a-anzahl-titel">
        {zahlen.length > 1 ? (
          <Auswahl beschriftetVon="a-anzahl-titel" werte={zahlen} wert={e.sprecherzahl} onWahl={n => setE(v => ({ ...v, sprecherzahl: n }))}
            className="flex flex-wrap gap-2" knopfKlasse={segmentKlasse}
            inhalt={n => (n === 1 ? ts.eineStimme : fuellen(ts.mehrStimmen, { n }))} />
        ) : (
          <p className="text-sm text-text-2">{fuellen(ts.anzahlFest, { n: zahlen[0] })}</p>
        )}
        {e.sprecherzahl === 3 && e.laenge_min < 5 && <Hinweis art="info" className="mt-3">{ts.kurzHinweis}</Hinweis>}
      </Abschnitt>

      <ol className="grid min-w-0 gap-4">
        {genutzt.map((sp, i) => {
          const rolle = f?.rollen[e.sprecherzahl - 1]?.[i] ?? 'sprecher'
          const farbe = sprecherFarbe(`sprecher_${i + 1}`)
          const st = stimmeVon(sp.stimme)
          const idStimme = feldId.stimme(i), idName = feldId.name(i), idPers = feldId.persoenlichkeit(i)
          const andereNamen = genutzt.filter((_, j) => j !== i).map(x => x.name)
          const namen = namensVorschlaege(basis, st?.geschlecht, andereNamen)
          return (
            <li key={i} className={`karte min-w-0 border-l-4 p-4 sm:p-5 ${farbe.rand}`}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${farbe.punkt}`} />
                <h3 className="text-lg font-semibold text-text">{fuellen(ts.sprecher, { n: i + 1 })}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${farbe.hell} ${farbe.text}`}>
                  {fuellen(ts.aufgabe, { rolle: pt.funktion[rolle] })}
                </span>
              </div>

              <div className="grid min-w-0 gap-5">
                <div className="min-w-0">
                  <p className="etikett">{ts.stimme}</p>
                  <div className={`flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border p-3 ${fehler[idStimme] ? 'border-rot/50 bg-rot-hell' : 'border-linie bg-grund'}`}>
                    {st ? (
                      <>
                        {st.hoerprobe_url && <HoerKnopf quelle={st.hoerprobe_url} label={fuellen(ts.hoerprobe, { name: st.name })} anhaltenLabel={ts.anhalten} />}
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-display font-semibold text-text">{st.name}</p>
                          {st.stil.length > 0 && <p className="break-words text-sm text-text-2">{st.stil.join(' · ')}</p>}
                          <div className="mt-1"><StimmMerkmale s={st} t={ts} /></div>
                        </div>
                      </>
                    ) : (
                      <p className="min-w-0 flex-1 text-sm text-leise">{ts.keineStimme}</p>
                    )}
                    <button id={idStimme} type="button" onClick={() => setDialog(i)}
                      aria-describedby={fehler[idStimme] ? fehlerId(idStimme) : undefined}
                      className={`knopf shrink-0 px-4 py-2 text-sm ${st ? 'knopf-zweit' : 'knopf-haupt'}`}>
                      {st ? ts.aendern : ts.waehlen}
                    </button>
                  </div>
                  <FeldFehler id={idStimme} text={fehler[idStimme]} />
                </div>

                <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor={idName} className="etikett">{ts.name}</label>
                    <input id={idName} className="feld" value={sp.name} maxLength={40} placeholder={ts.namePlatz} autoComplete="off"
                      aria-invalid={fehler[idName] ? true : undefined} aria-describedby={`${idName}-hilfe${fehler[idName] ? ` ${fehlerId(idName)}` : ''}`}
                      onChange={x => sprecherAendern(i, { name: x.target.value })} />
                    <p id={`${idName}-hilfe`} className="hinweis mt-1.5">{ts.nameHilfe}</p>
                    <FeldFehler id={idName} text={fehler[idName]} />
                    {namen.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={`${ts.vorschlaege}: ${ts.name}`}>
                        <span className="text-xs text-leise">{ts.vorschlaege}:</span>
                        {namen.map(n => <VorschlagChip key={n} aktiv={sp.name.trim() === n} onClick={() => sprecherAendern(i, { name: n })}>{n}</VorschlagChip>)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label htmlFor={idPers} className="etikett">{ts.persoenlichkeit} <span className="font-normal text-leise">({t.optional})</span></label>
                    <textarea id={idPers} className="feld resize-y" rows={2} value={sp.persoenlichkeit} maxLength={300}
                      aria-invalid={fehler[idPers] ? true : undefined} aria-describedby={`${idPers}-hilfe${fehler[idPers] ? ` ${fehlerId(idPers)}` : ''}`}
                      onChange={x => sprecherAendern(i, { persoenlichkeit: x.target.value })} />
                    <p id={`${idPers}-hilfe`} className="hinweis mt-1.5 flex flex-wrap justify-between gap-2">
                      <span>{ts.persoenlichkeitHilfe}</span>
                      <Zaehler n={sp.persoenlichkeit.length} max={300} warnAb={280} text={`${sp.persoenlichkeit.length}/300`} />
                    </p>
                    <FeldFehler id={idPers} text={fehler[idPers]} />
                    <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={`${ts.vorschlaege}: ${ts.persoenlichkeit}`}>
                      <span className="text-xs text-leise">{ts.vorschlaege}:</span>
                      {ts.persoenlichkeitVorschlaege.map(p => {
                        const drin = sp.persoenlichkeit.toLowerCase().includes(p.toLowerCase())
                        return (
                          <VorschlagChip key={p} aktiv={drin} onClick={() => {
                            const alt = sp.persoenlichkeit.trim()
                            const neu = drin ? alt : alt ? `${alt}, ${p}` : p
                            sprecherAendern(i, { persoenlichkeit: neu.slice(0, 300) })
                          }}>{p}</VorschlagChip>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div aria-live="polite" className="grid gap-3 empty:hidden">
        {doppelteStimme(e) && <Hinweis art="fehler">{ts.gleicheStimme}</Hinweis>}
        {aehnlich.map(([a, b]) => <Hinweis key={`${a}-${b}`} art="warnung">{fuellen(ts.aehnlich, { a, b })}</Hinweis>)}
      </div>

      {dialog !== null && (
        <StimmDialog offen nr={dialog + 1} stimmen={stimmen} gewaehlt={e.sprecher[dialog].stimme} belegt={belegtFuer(dialog)} sprache={e.sprache} t={ts}
          onSchliessen={() => setDialog(null)}
          onWahl={s => {
            const i = dialog
            setE(v => ({
              ...v,
              sprecher: v.sprecher.map((x, j) => {
                if (j !== i) return x
                // Leerer Name → passenden Vorschlag eintragen (frei änderbar).
                const andere = v.sprecher.slice(0, v.sprecherzahl).filter((_, k) => k !== i).map(y => y.name)
                const name = x.name.trim() ? x.name : namensVorschlaege(basis, s.geschlecht, andere, 1)[0] ?? ''
                return { ...x, stimme: s.id, name }
              }),
            }))
            setDialog(null)
            requestAnimationFrame(() => document.getElementById(feldId.stimme(i))?.focus())
          }} />
      )}
    </div>
  )
}
