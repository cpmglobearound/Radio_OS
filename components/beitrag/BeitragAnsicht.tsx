'use client'
// Beitragsansicht: lädt den Beitrag, hält ihn aktuell, solange er entsteht (alle 2 s), und bündelt alle Aktionen:
// freigeben, Änderungen vertonen, Drehbuch bearbeiten, Zeile neu sprechen, mit KI überarbeiten, löschen.
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { BeitragTexte } from '@/lib/i18n/texte/beitrag'
import { usePortal } from '@/components/portal/Kontext'
import { beitragFehlerText, istEmotion, istFertig, laeuft } from '@/components/portal/anzeige'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconFunken, IconMikro, IconPfeilLinks, IconStift } from '@/components/gemeinsam/Icons'
import Kopf from './Kopf'
import Fortschritt from './Fortschritt'
import Hoeren from './Hoeren'
import Drehbuch, { kleinKnopf } from './Drehbuch'
import Editor, { entwurfWert, type EditZeile } from './Editor'
import Quellen from './Quellen'
import { Bestaetigen, KiDialog, NeuSprechenDialog } from './Dialoge'
import type { BeitragDaten, FormatNamen, Hervor, KiBereich, Zeile } from './typen'

type Meldung = { art: 'erfolg' | 'fehler' | 'info'; text: string; guthaben?: boolean }

export default function BeitragAnsicht({ id, tb, formatNamen }: { id: string; tb: BeitragTexte; formatNamen: FormatNamen }) {
  const { sprache, t, g, darfBearbeiten, guthabenNeuLaden } = usePortal()
  const router = useRouter()
  const url = `/api/v1/beitraege/${encodeURIComponent(id)}`

  const [daten, setDaten] = useState<BeitragDaten | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [versuch, setVersuch] = useState(0)
  const statusVorher = useRef<string | null>(null)

  const [meldung, setMeldung] = useState<Meldung | null>(null)
  const [hervor, setHervor] = useState<Hervor | null>(null)
  const [aktion, setAktion] = useState<'freigeben' | 'vertonen' | null>(null)

  const [entwurf, setEntwurf] = useState<EditZeile[] | null>(null)
  const [ausgang, setAusgang] = useState('')
  const [zeigeFehler, setZeigeFehler] = useState(false)
  const [speichert, setSpeichert] = useState(false)
  const [verwerfenOffen, setVerwerfenOffen] = useState(false)

  const [loeschenOffen, setLoeschenOffen] = useState(false)
  const [loescht, setLoescht] = useState(false)
  const [loeschFehler, setLoeschFehler] = useState<string | null>(null)
  const [neuSprechen, setNeuSprechen] = useState<Zeile | null>(null)
  const [kiStart, setKiStart] = useState<KiBereich | null>(null)

  /** Neue Daten übernehmen; wird aus „läuft" ein Endzustand, das Guthaben in der Kopfzeile auffrischen. */
  const uebernehmen = useCallback((d: BeitragDaten) => {
    const vorher = statusVorher.current
    if (vorher && laeuft(vorher) && !laeuft(d.beitrag.status)) guthabenNeuLaden()
    statusVorher.current = d.beitrag.status
    setDaten(d)
    setLadeFehler(null)
  }, [guthabenNeuLaden])

  const neuLaden = useCallback(async () => {
    const r = await api<BeitragDaten>(url)
    if (r.ok) uebernehmen(r.daten)
    else setLadeFehler(r.code)
  }, [url, uebernehmen])

  // Erstes Laden (und „Noch einmal laden").
  useEffect(() => {
    let aus = false
    api<BeitragDaten>(url).then(r => {
      if (aus) return
      if (r.ok) uebernehmen(r.daten)
      else setLadeFehler(r.code)
    })
    return () => { aus = true }
  }, [url, versuch, uebernehmen])

  // Solange der Beitrag entsteht: alle 2 s neu laden. Ist der Tab verdeckt, wird nicht gefragt.
  const status = daten?.beitrag.status ?? null
  const polling = !!status && laeuft(status)
  useEffect(() => {
    if (!polling) return
    let aus = false
    let uhr: ReturnType<typeof setTimeout> | undefined
    const runde = () => {
      uhr = setTimeout(() => {
        if (aus) return
        if (document.visibilityState === 'hidden') { runde(); return }
        api<BeitragDaten>(url).then(r => {
          if (aus) return
          if (r.ok) uebernehmen(r.daten)
          runde()
        })
      }, 2000)
    }
    runde()
    return () => { aus = true; clearTimeout(uhr) }
  }, [polling, url, uebernehmen])

  // Ungespeicherte Änderungen: Warnung beim Verlassen der Seite.
  const geaendert = entwurf !== null && entwurfWert(entwurf) !== ausgang
  useEffect(() => {
    if (!geaendert) return
    const warnen = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warnen)
    return () => window.removeEventListener('beforeunload', warnen)
  }, [geaendert])

  // ——— Laden / Fehler ———
  if (!daten) {
    return (
      <div className="grid gap-6">
        <ZurueckLink text={tb.zurueck} />
        {ladeFehler ? (
          <Hinweis art="fehler" aktion={<button type="button" className="knopf knopf-zweit px-4 py-2 text-sm" onClick={() => { setLadeFehler(null); setVersuch(v => v + 1) }}>{tb.laden.nochmal}</button>}>
            {ladeFehler === 'nicht_gefunden' ? g.fehler.nicht_gefunden : `${tb.laden.fehler} ${fehlerText(ladeFehler, g.fehler)}`}
          </Hinweis>
        ) : (
          <div role="status" className="grid gap-4" aria-label={tb.laden.laedt}>
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-linie" />
            <div className="h-5 w-1/2 animate-pulse rounded-lg bg-linie" />
            <div className="h-40 animate-pulse rounded-2xl bg-linie/70" />
            <span className="sr-only">{tb.laden.laedt}</span>
          </div>
        )}
      </div>
    )
  }

  const b = daten.beitrag
  const fertig = istFertig(b.status)
  const inFreigabe = b.status === 'freigabe'
  const bearbeitbar = darfBearbeiten && (inFreigabe || fertig)
  const ohneAudio = fertig ? daten.zeilen.filter(z => !z.hat_audio).length : 0
  const idle = !aktion && !speichert

  // ——— Aktionen ———
  async function freigeben(art: 'freigeben' | 'vertonen') {
    setAktion(art)
    setMeldung(null)
    const r = await api(`${url}/freigeben`, { method: 'POST' })
    setAktion(null)
    if (r.ok) {
      setHervor(null)
      if (art === 'vertonen') setMeldung({ art: 'erfolg', text: tb.vertonen.gestartet })
      guthabenNeuLaden()
      await neuLaden()
      return
    }
    if (r.code === 'guthaben') setMeldung({ art: 'fehler', text: tb.vertonen.guthaben, guthaben: true })
    else if (r.code === 'nichts_geaendert') { setMeldung({ art: 'info', text: tb.vertonen.nichts }); await neuLaden() }
    else setMeldung({ art: 'fehler', text: fehlerText(r.code, g.fehler) })
  }

  function bearbeitenStarten() {
    const z: EditZeile[] = daten!.zeilen.map(x => ({
      schluessel: `z${x.nr}`, nr: x.nr, rolle: x.rolle, text: x.text, regie: x.regie ?? '',
      emotion: istEmotion(x.emotion) ? x.emotion : 'warm', luecke_ms: x.luecke_ms, block_id: x.block_id,
    }))
    setEntwurf(z)
    setAusgang(entwurfWert(z))
    setZeigeFehler(false)
    setMeldung(null)
  }

  function abbrechen() {
    if (geaendert) setVerwerfenOffen(true)
    else setEntwurf(null)
  }

  async function speichern() {
    if (!entwurf) return
    const leer = entwurf.find(z => !z.text.trim())
    if (leer) {
      setZeigeFehler(true)
      requestAnimationFrame(() => document.getElementById(`text-${leer.schluessel}`)?.focus())
      return
    }
    setSpeichert(true)
    setMeldung(null)
    const r = await api<{ ok: boolean; geaendert: number[]; neu_vertonen: boolean }>(`${url}/drehbuch`, {
      method: 'PATCH',
      body: {
        zeilen: entwurf.map(z => ({
          ...(z.nr !== undefined ? { nr: z.nr } : {}), rolle: z.rolle, text: z.text.trim(), regie: z.regie,
          emotion: z.emotion, luecke_ms: z.luecke_ms, block_id: z.block_id,
        })),
      },
    })
    setSpeichert(false)
    if (!r.ok) { setMeldung({ art: 'fehler', text: fehlerText(r.code, g.fehler) }); return }
    const nrs = r.daten.geaendert ?? []
    setEntwurf(null)
    setHervor(nrs.length ? { nrs, art: 'hand' } : null)
    if (!nrs.length) setMeldung({ art: 'info', text: tb.editor.nichtsGeaendert })
    else if (inFreigabe) setMeldung({ art: 'erfolg', text: tb.editor.gespeichertFreigabe })
    else setMeldung({ art: 'erfolg', text: tb.editor.gespeichert })
    await neuLaden()
  }

  async function loeschen() {
    setLoescht(true)
    setLoeschFehler(null)
    const r = await api(url, { method: 'DELETE' })
    if (r.ok) {
      guthabenNeuLaden()
      router.push('/portal/beitraege')
      return
    }
    setLoescht(false)
    setLoeschFehler(fehlerText(r.code, g.fehler))
  }

  // ——— Bänder ———
  const vertonenKnopf = (
    <button type="button" className="knopf knopf-bunt text-sm" onClick={() => freigeben('vertonen')} disabled={!idle || entwurf !== null}>
      <IconMikro className="size-4" />
      {aktion === 'vertonen' ? tb.vertonen.laeuft : ohneAudio === 1 ? tb.vertonen.knopfEins : fuellen(tb.vertonen.knopf, { n: ohneAudio })}
    </button>
  )
  const bandText = hervor?.art === 'ki'
    ? (ohneAudio === 1 ? tb.vertonen.bandKiEins : fuellen(tb.vertonen.bandKi, { n: ohneAudio }))
    : (ohneAudio === 1 ? tb.vertonen.bandEins : fuellen(tb.vertonen.band, { n: ohneAudio }))

  const drehbuchAktionen = bearbeitbar && !entwurf ? (
    <>
      <button type="button" className="knopf knopf-zweit text-sm" onClick={bearbeitenStarten} disabled={!idle}>
        <IconStift className="size-4" /> {tb.drehbuch.bearbeiten}
      </button>
      <button type="button" className="knopf knopf-zweit text-sm" onClick={() => setKiStart({ art: 'ganz' })} disabled={!idle}>
        <IconFunken className="size-4" /> {tb.drehbuch.ki}
      </button>
    </>
  ) : null

  return (
    <div className="grid min-w-0 gap-8">
      <ZurueckLink text={tb.zurueck} />

      <Kopf beitrag={b} t={t} tb={tb} sprache={sprache} formatNamen={formatNamen} darfBearbeiten={darfBearbeiten}
        onLoeschen={() => { setLoeschFehler(null); setLoeschenOffen(true) }} />

      <div aria-live="polite" className="empty:hidden">
        {meldung && (
          <Hinweis art={meldung.art} aktion={meldung.guthaben ? <Link href="/portal/guthaben" className="knopf knopf-haupt px-4 py-2 text-sm">{tb.vertonen.nachkaufen}</Link> : undefined}>
            {meldung.text}
          </Hinweis>
        )}
        {ladeFehler && <Hinweis art="fehler" className={meldung ? 'mt-3' : ''}>{fehlerText(ladeFehler, g.fehler)}</Hinweis>}
      </div>

      {laeuft(b.status) && <Fortschritt beitrag={b} t={t} tb={tb} />}

      {b.status === 'fehlgeschlagen' && (
        <section className="karte grid gap-4 p-5 sm:p-7" aria-labelledby="fehl-titel">
          <h2 id="fehl-titel" className="text-xl font-semibold">{tb.fehlgeschlagen.titel}</h2>
          <Hinweis art="fehler">
            <p>{beitragFehlerText(b.fehler, t)}</p>
            <p className="mt-1 font-semibold">{t.beitragFehler.nichtAbgebucht}</p>
          </Hinweis>
          <div className="flex flex-wrap gap-2">
            {darfBearbeiten && <Link href={`/portal/neu?von=${encodeURIComponent(b.id)}`} className="knopf knopf-haupt">{tb.fehlgeschlagen.nochmal}</Link>}
            <Link href="/portal/beitraege" className="knopf knopf-zweit">{tb.fehlgeschlagen.liste}</Link>
          </div>
        </section>
      )}

      {inFreigabe && (
        <section aria-labelledby="freigabe-titel" className="rounded-[1.25rem] border border-violett/25 bg-[#f3efff] p-5 sm:p-6">
          <h2 id="freigabe-titel" className="text-xl font-semibold text-[#3b2386]">{tb.freigabe.titel}</h2>
          {darfBearbeiten ? (
            <>
              <p className="mt-2 max-w-2xl text-text-2">{tb.freigabe.text}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" className="knopf knopf-bunt px-6 py-3.5 text-base" onClick={() => freigeben('freigeben')} disabled={!idle || entwurf !== null}>
                  <IconMikro className="size-5" /> {aktion === 'freigeben' ? tb.freigabe.laeuft : tb.freigabe.knopf}
                </button>
                {entwurf !== null && <p className="text-sm text-[#5b36c4]">{tb.freigabe.erstSpeichern}</p>}
              </div>
            </>
          ) : (
            <p className="mt-2 text-text-2">{tb.freigabe.hoeren}</p>
          )}
        </section>
      )}

      {fertig && <Hoeren beitrag={b} g={g} tb={tb} sprache={sprache} />}

      {fertig && darfBearbeiten && ohneAudio > 0 && !entwurf && (
        <section aria-label={bandText} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-cyan/30 bg-cyan-hell px-5 py-4">
          <div className="min-w-0">
            <p className="font-semibold text-cyan-text">{bandText}</p>
            <p className="text-sm text-text-2">{tb.vertonen.kosten}</p>
          </div>
          {vertonenKnopf}
        </section>
      )}

      {entwurf ? (
        <section aria-labelledby="editor-titel" className="grid min-w-0 gap-4">
          <div className="min-w-0">
            <h2 id="editor-titel" className="text-2xl font-semibold">{tb.drehbuch.bearbeiten}</h2>
            <p className="mt-1 text-sm text-leise">{fuellen(tb.editor.zeilen, { n: entwurf.length })}</p>
          </div>
          <Editor daten={daten} zeilen={entwurf} setZeilen={setEntwurf} zeigeFehler={zeigeFehler} t={t} tb={tb} />
          <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-linie bg-karte/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgb(24_26_50/.35)] backdrop-blur pb-[max(.75rem,env(safe-area-inset-bottom))]">
            {geaendert && <p className="mr-auto text-sm text-leise">{tb.editor.ungespeichert}</p>}
            <button type="button" className="knopf knopf-zweit" onClick={abbrechen} disabled={speichert}>{tb.editor.abbrechen}</button>
            <button type="button" className="knopf knopf-haupt" onClick={speichern} disabled={speichert}>{speichert ? tb.editor.speichert : tb.editor.speichern}</button>
          </div>
        </section>
      ) : daten.zeilen.length > 0 ? (
        <Drehbuch daten={daten} t={t} tb={tb} sprache={sprache} hervor={hervor} darfAendern={bearbeitbar && idle}
          kopfAktionen={drehbuchAktionen} untertitel={laeuft(b.status) ? tb.fortschritt.drehbuchVorschau : undefined} onNeuSprechen={setNeuSprechen} onKi={setKiStart} />
      ) : null}

      {!laeuft(b.status) && <Quellen daten={daten} tb={tb} sprache={sprache} />}

      {/* ——— Dialoge ——— */}
      <Bestaetigen offen={loeschenOffen} titel={tb.loeschen.titel} schliessenText={g.knopf.schliessen} gefaehrlich
        text={<><p>{fuellen(tb.loeschen.text, { titel: b.titel })}</p>{inFreigabe && <p>{tb.loeschen.freigabe}</p>}</>}
        ja={tb.loeschen.ja} nein={g.knopf.abbrechen} laeuft={loescht} laeuftText={tb.loeschen.laeuft} fehler={loeschFehler}
        onJa={loeschen} onNein={() => { if (!loescht) setLoeschenOffen(false) }} />

      <Bestaetigen offen={verwerfenOffen} titel={tb.editor.verwerfenTitel} schliessenText={g.knopf.schliessen} gefaehrlich
        text={<p>{tb.editor.verwerfenText}</p>} ja={tb.editor.verwerfenJa} nein={tb.editor.weiter}
        onJa={() => { setVerwerfenOffen(false); setEntwurf(null); setZeigeFehler(false) }} onNein={() => setVerwerfenOffen(false)} />

      {neuSprechen && (
        <NeuSprechenDialog zeile={neuSprechen} beitragId={b.id} t={t} g={g} tb={tb} onSchliessen={() => setNeuSprechen(null)}
          onFertig={async () => {
            const nr = neuSprechen.nr
            setNeuSprechen(null)
            setHervor(h => ({ nrs: [...(h?.nrs ?? []).filter(x => x !== nr), nr], art: h?.art ?? 'hand' }))
            setMeldung({ art: 'erfolg', text: tb.neuSprechen.danach })
            await neuLaden()
          }} />
      )}

      {kiStart && (
        <KiDialog start={kiStart} daten={daten} g={g} tb={tb} onSchliessen={() => setKiStart(null)}
          onFertig={async nrs => {
            setKiStart(null)
            setHervor(nrs.length ? { nrs, art: 'ki' } : null)
            // Bei fertigen Beiträgen sagt das Band „… neu geschrieben — jetzt neu vertonen?" schon alles.
            setMeldung(!nrs.length ? { art: 'info', text: tb.ki.keine }
              : fertig ? null
              : { art: 'erfolg', text: nrs.length === 1 ? tb.ki.fertigEins : fuellen(tb.ki.fertig, { n: nrs.length }) })
            await neuLaden()
          }} />
      )}
    </div>
  )
}

function ZurueckLink({ text }: { text: string }) {
  return (
    <Link href="/portal/beitraege" className={`${kleinKnopf} w-fit text-sm`}>
      <IconPfeilLinks className="size-4" /> {text}
    </Link>
  )
}
