'use client'
// Konto: Persönliches (Name, Sprache, E-Mail, Rolle, Firma), Passwort ändern, überall abmelden, Konto löschen.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition, type FormEvent, type ReactNode } from 'react'
import { usePortal } from '@/components/portal/Kontext'
import Dialog from '@/components/gemeinsam/Dialog'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { api, fehlerText } from '@/components/gemeinsam/api'
import { fuellen } from '@/components/gemeinsam/format'
import { IconAbmelden, IconAuge, IconAugeZu, IconMuell, IconPerson, IconSchloss, IconWarnung } from '@/components/gemeinsam/Icons'
import { OBERFLAECHE, type UiSprache } from '@/lib/sprachen'
import type { KontoSeiteTexte } from '@/lib/i18n/texte/konto-seite'

const MIN_PASSWORT = 12

function Karte({ titel, icon, satz, children, rot = false, id }: { titel: string; icon: ReactNode; satz?: string; children: ReactNode; rot?: boolean; id: string }) {
  return (
    <section aria-labelledby={id} className={`karte p-5 sm:p-6 ${rot ? '!border-rot/40' : ''}`}>
      <h2 id={id} className={`flex items-center gap-2.5 text-xl font-semibold ${rot ? 'text-[#a32424]' : ''}`}>
        <span aria-hidden="true" className={`flex size-9 items-center justify-center rounded-xl ${rot ? 'bg-rot-hell text-rot' : 'bg-cyan-hell text-cyan-tief'}`}>{icon}</span>
        {titel}
      </h2>
      {satz && <p className="mt-2 max-w-2xl text-[15px] leading-6 text-leise">{satz}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** Passwortfeld mit Auge (zeigen/verbergen). */
function PasswortFeld({ label, wert, setWert, autoComplete, hilfe, k, fehlerId }: {
  label: string; wert: string; setWert: (s: string) => void; autoComplete: string; hilfe?: string; k: KontoSeiteTexte; fehlerId?: string
}) {
  const id = useId()
  const [zeigen, setZeigen] = useState(false)
  const beschrieben = [hilfe ? `${id}-h` : '', fehlerId ?? ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="etikett">{label}</label>
      <div className="relative">
        <input id={id} type={zeigen ? 'text' : 'password'} value={wert} onChange={e => setWert(e.target.value)} autoComplete={autoComplete}
          aria-describedby={beschrieben} className="feld pr-12" maxLength={200} />
        <button type="button" onClick={() => setZeigen(z => !z)} aria-label={zeigen ? k.passwort.verbergen : k.passwort.zeigen} aria-pressed={zeigen}
          className="absolute inset-y-0 right-1 my-auto inline-flex size-10 items-center justify-center rounded-full text-leise hover:text-text">
          {zeigen ? <IconAugeZu className="size-5" /> : <IconAuge className="size-5" />}
        </button>
      </div>
      {hilfe && <p id={`${id}-h`} className="hinweis mt-1.5">{hilfe}</p>}
    </div>
  )
}

/** Grobe Stärke: Länge zählt am meisten, dazu Vielfalt der Zeichen. 0 = zu kurz, 1–3 = ok/gut/sehr gut. */
function staerke(pw: string) {
  if (pw.length < MIN_PASSWORT) return 0
  const arten = [/[a-zäöüß]/, /[A-ZÄÖÜ]/, /\d/, /[^A-Za-z0-9äöüÄÖÜß]/].filter(r => r.test(pw)).length
  const punkte = (pw.length >= 16 ? 1 : 0) + (pw.length >= 20 ? 1 : 0) + (arten >= 3 ? 1 : 0) + (new Set(pw).size >= 8 ? 0 : -1)
  return Math.max(1, Math.min(3, 1 + punkte))
}

function StaerkeAnzeige({ pw, k }: { pw: string; k: KontoSeiteTexte }) {
  if (!pw) return null
  const s = staerke(pw)
  const text = s === 0 ? fuellen(k.passwort.stufen.zuKurz, { n: MIN_PASSWORT - pw.length }) : s === 1 ? k.passwort.stufen.ok : s === 2 ? k.passwort.stufen.gut : k.passwort.stufen.stark
  const farbe = s === 0 ? 'bg-rot' : s === 1 ? 'bg-gelb' : 'bg-gruen'
  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map(i => <span key={i} className={`h-1.5 rounded-full transition-colors ${i <= s ? farbe : 'bg-grund-2'}`} />)}
      </div>
      <p className={`mt-1 text-sm ${s === 0 ? 'text-[#a32424]' : 'text-leise'}`} aria-live="polite">
        <span className="sr-only">{k.passwort.staerke}: </span>{text}
      </p>
    </div>
  )
}

function Persoenlich({ k }: { k: KontoSeiteTexte }) {
  const { g, t, sprache, nutzer, mandant, rolle } = usePortal()
  const router = useRouter()
  const [name, setName] = useState(nutzer.name)
  const [nameStand, setNameStand] = useState<{ art: 'ruhe' | 'laeuft' | 'ok' } | { art: 'fehler'; text: string }>({ art: 'ruhe' })
  const [neueSprache, setNeueSprache] = useState<UiSprache | null>(null)
  const [spracheFehler, setSpracheFehler] = useState<string | null>(null)
  const [aktualisiert, starte] = useTransition()
  const nameId = useId()
  const spracheId = useId()

  async function nameSpeichern(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2 || n.length > 80) { setNameStand({ art: 'fehler', text: k.persoenlich.nameZuKurz }); return }
    setNameStand({ art: 'laeuft' })
    const r = await api('/api/konto', { method: 'PATCH', body: { name: n } })
    if (!r.ok) { setNameStand({ art: 'fehler', text: fehlerText(r.code, g.fehler) }); return }
    setNameStand({ art: 'ok' })
    starte(() => router.refresh())
  }

  async function spracheWechseln(s: UiSprache) {
    setNeueSprache(s)
    setSpracheFehler(null)
    const r = await api('/api/konto', { method: 'PATCH', body: { sprache: s } })
    if (!r.ok) { setNeueSprache(null); setSpracheFehler(fehlerText(r.code, g.fehler)); return }
    starte(() => { router.refresh(); setNeueSprache(null) })
  }

  const unveraendert = name.trim() === nutzer.name
  return (
    <Karte id="k-persoenlich" titel={k.persoenlich.titel} icon={<IconPerson className="size-5" />}>
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={nameSpeichern} className="min-w-0" noValidate>
          <label htmlFor={nameId} className="etikett">{k.persoenlich.name}</label>
          <div className="flex flex-wrap gap-2">
            <input id={nameId} value={name} onChange={e => { setName(e.target.value); if (nameStand.art !== 'laeuft') setNameStand({ art: 'ruhe' }) }}
              autoComplete="name" maxLength={80} aria-describedby={`${nameId}-h ${nameId}-s`} aria-invalid={nameStand.art === 'fehler'}
              className="feld min-w-0 flex-1 basis-48" />
            <button type="submit" disabled={nameStand.art === 'laeuft' || unveraendert} className="knopf knopf-haupt">
              {nameStand.art === 'laeuft' ? g.laedt : g.knopf.speichern}
            </button>
          </div>
          <p id={`${nameId}-h`} className="hinweis mt-1.5">{k.persoenlich.nameHilfe}</p>
          <div id={`${nameId}-s`} aria-live="polite" className="mt-2 empty:hidden">
            {nameStand.art === 'ok' && <Hinweis art="erfolg">{k.persoenlich.nameGespeichert}</Hinweis>}
            {nameStand.art === 'fehler' && <Hinweis art="fehler">{nameStand.text}</Hinweis>}
          </div>
        </form>

        <div className="min-w-0">
          <label htmlFor={spracheId} className="etikett">{k.persoenlich.sprache}</label>
          <select id={spracheId} value={neueSprache ?? sprache} disabled={neueSprache !== null || aktualisiert}
            onChange={e => spracheWechseln(e.target.value as UiSprache)} aria-describedby={`${spracheId}-h`} className="feld">
            {OBERFLAECHE.map(s => <option key={s} value={s} lang={s}>{g.sprachen[s]}</option>)}
          </select>
          <p id={`${spracheId}-h`} className="hinweis mt-1.5">{k.persoenlich.spracheHilfe}</p>
          {spracheFehler && <Hinweis art="fehler" className="mt-2">{spracheFehler}</Hinweis>}
        </div>
      </div>

      <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-linie pt-5 md:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-sm font-medium text-text-2">{k.persoenlich.email}</dt>
          <dd className="mt-1">
            <span className="break-all font-semibold">{nutzer.email}</span>{' '}
            <span className={`ml-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${nutzer.bestaetigt ? 'border-gruen/25 bg-gruen-hell text-[#0a6e5f]' : 'border-gelb/25 bg-gelb-hell text-[#8a4b05]'}`}>
              {nutzer.bestaetigt ? k.persoenlich.bestaetigt : k.persoenlich.unbestaetigt}
            </span>
            <p className="hinweis mt-1">{k.persoenlich.emailHilfe}</p>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm font-medium text-text-2">{k.persoenlich.firma}</dt>
          <dd className="mt-1 break-words font-semibold">{mandant.name}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm font-medium text-text-2">{k.persoenlich.rolle}</dt>
          <dd className="mt-1">
            <span className="font-semibold">{t.kopf.rolle[rolle]}</span>
            <p className="hinweis mt-1">{k.persoenlich.rollen[rolle]}</p>
          </dd>
        </div>
      </dl>
    </Karte>
  )
}

function PasswortAendern({ k }: { k: KontoSeiteTexte }) {
  const { g } = usePortal()
  const [alt, setAlt] = useState('')
  const [neu, setNeu] = useState('')
  const [wieder, setWieder] = useState('')
  const [stand, setStand] = useState<{ art: 'ruhe' | 'laeuft' | 'ok' } | { art: 'fehler'; text: string }>({ art: 'ruhe' })
  const statusId = useId()
  const ungleich = wieder.length > 0 && neu !== wieder

  async function senden(e: FormEvent) {
    e.preventDefault()
    if (neu.length < MIN_PASSWORT) { setStand({ art: 'fehler', text: g.fehler.zu_kurz }); return }
    if (neu !== wieder) { setStand({ art: 'fehler', text: k.passwort.ungleich }); return }
    setStand({ art: 'laeuft' })
    const r = await api('/api/konto/passwort', { body: { alt, neu } })
    if (!r.ok) { setStand({ art: 'fehler', text: r.code === 'falsch' ? k.passwort.falsch : fehlerText(r.code, g.fehler) }); return }
    setAlt(''); setNeu(''); setWieder('')
    setStand({ art: 'ok' })
  }

  const eingabe = (f: (s: string) => void) => (s: string) => { f(s); if (stand.art === 'fehler' || stand.art === 'ok') setStand({ art: 'ruhe' }) }
  return (
    <Karte id="k-passwort" titel={k.passwort.titel} satz={k.passwort.satz} icon={<IconSchloss className="size-5" />}>
      <form onSubmit={senden} noValidate className="grid max-w-xl gap-4">
        <PasswortFeld label={k.passwort.alt} wert={alt} setWert={eingabe(setAlt)} autoComplete="current-password" k={k} />
        <div>
          <PasswortFeld label={k.passwort.neu} wert={neu} setWert={eingabe(setNeu)} autoComplete="new-password" hilfe={k.passwort.neuHilfe} k={k} />
          <StaerkeAnzeige pw={neu} k={k} />
        </div>
        <div>
          <PasswortFeld label={k.passwort.wiederholen} wert={wieder} setWert={eingabe(setWieder)} autoComplete="new-password" k={k} fehlerId={ungleich ? `${statusId}-u` : undefined} />
          {ungleich && <p id={`${statusId}-u`} className="mt-1.5 text-sm text-[#a32424]">{k.passwort.ungleich}</p>}
        </div>
        <div aria-live="polite" className="empty:hidden">
          {stand.art === 'ok' && <Hinweis art="erfolg">{k.passwort.erfolg}</Hinweis>}
          {stand.art === 'fehler' && <Hinweis art="fehler">{stand.text}</Hinweis>}
        </div>
        <div>
          <button type="submit" disabled={stand.art === 'laeuft' || !alt || !neu || !wieder} className="knopf knopf-haupt">
            {stand.art === 'laeuft' ? k.passwort.laeuft : k.passwort.speichern}
          </button>
        </div>
        <p className="hinweis">
          {k.passwort.ohnePasswort}{' '}
          <Link href="/passwort-vergessen" className="font-semibold text-cyan-text underline underline-offset-2">{k.passwort.ohnePasswortLink}</Link>
        </p>
      </form>
    </Karte>
  )
}

function UeberallAbmelden({ k }: { k: KontoSeiteTexte }) {
  const { g } = usePortal()
  const router = useRouter()
  const [offen, setOffen] = useState(false)
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  async function abmelden() {
    setLaeuft(true)
    setFehler(null)
    const r = await api('/api/auth/abmelden', { body: { ueberall: true } })
    if (!r.ok) { setLaeuft(false); setFehler(fehlerText(r.code, g.fehler)); return }
    router.replace('/anmelden')
    router.refresh()
  }

  return (
    <Karte id="k-sitzungen" titel={k.sitzungen.titel} satz={k.sitzungen.satz} icon={<IconAbmelden className="size-5" />}>
      <button type="button" onClick={() => { setFehler(null); setOffen(true) }} className="knopf knopf-zweit"><IconAbmelden className="size-5" />{k.sitzungen.knopf}</button>
      <Dialog offen={offen} onSchliessen={() => setOffen(false)} titel={k.sitzungen.dialogTitel} schliessenText={g.knopf.schliessen} sperren={laeuft}
        fuss={<>
          <button type="button" onClick={() => setOffen(false)} disabled={laeuft} className="knopf knopf-zweit">{g.knopf.abbrechen}</button>
          <button type="button" onClick={abmelden} disabled={laeuft} className="knopf knopf-haupt">{laeuft ? k.sitzungen.laeuft : k.sitzungen.bestaetigen}</button>
        </>}>
        <p className="text-[15px] leading-6 text-text-2">{k.sitzungen.dialogText}</p>
        {fehler && <Hinweis art="fehler" className="mt-3">{fehler}</Hinweis>}
      </Dialog>
    </Karte>
  )
}

function KontoLoeschen({ k }: { k: KontoSeiteTexte }) {
  const { g, mandant, mandanten } = usePortal()
  const router = useRouter()
  const [offen, setOffen] = useState(false)
  const [passwort, setPasswort] = useState('')
  const [inhaber, setInhaber] = useState(false)       // Server hat „inhaber_uebertragen" gemeldet
  const [mitloeschen, setMitloeschen] = useState(false)
  const [stand, setStand] = useState<{ art: 'ruhe' | 'laeuft' | 'ok' } | { art: 'fehler'; text: string }>({ art: 'ruhe' })
  const mitId = useId()

  // Firmen, deren Inhaber ich bin (die API prüft alle davon); sonst die aktuelle Firma.
  const firmen = mandanten.filter(m => m.rolle === 'inhaber').map(m => m.name)
  const firma = (firmen.length ? firmen : [mandant.name]).join(', ')

  function oeffnen() { setPasswort(''); setInhaber(false); setMitloeschen(false); setStand({ art: 'ruhe' }); setOffen(true) }

  async function loeschen(e: FormEvent) {
    e.preventDefault()
    setStand({ art: 'laeuft' })
    const r = await api('/api/konto/loeschen', { body: { passwort, mandant_mitloeschen: inhaber && mitloeschen } })
    if (r.ok) { setStand({ art: 'ok' }); return }
    if (r.code === 'inhaber_uebertragen') { setInhaber(true); setStand({ art: 'ruhe' }); return }
    setStand({ art: 'fehler', text: r.code === 'falsch' ? k.loeschen.falsch : fehlerText(r.code, g.fehler) })
  }

  const fertig = stand.art === 'ok'
  const laeuft = stand.art === 'laeuft'
  return (
    <Karte id="k-loeschen" rot titel={k.loeschen.titel} satz={k.loeschen.satz} icon={<IconMuell className="size-5" />}>
      <button type="button" onClick={oeffnen} className="knopf border border-rot/40 bg-karte text-[#a32424] hover:bg-rot-hell"><IconMuell className="size-5" />{k.loeschen.knopf}</button>
      <Dialog offen={offen} onSchliessen={() => { if (fertig) router.replace('/anmelden'); else setOffen(false) }} sperren={laeuft}
        titel={fertig ? k.loeschen.erfolgTitel : k.loeschen.dialogTitel} schliessenText={g.knopf.schliessen}
        fuss={fertig
          ? <button type="button" onClick={() => router.replace('/anmelden')} className="knopf knopf-haupt">{k.loeschen.weiter}</button>
          : <>
              <button type="button" onClick={() => setOffen(false)} disabled={laeuft} className="knopf knopf-zweit">{g.knopf.abbrechen}</button>
              <button type="submit" form="konto-loeschen" disabled={laeuft || !passwort || (inhaber && !mitloeschen)} className="knopf bg-rot text-white">
                {laeuft ? k.loeschen.laeuft : k.loeschen.bestaetigen}
              </button>
            </>}>
        {fertig ? (
          <Hinweis art="erfolg">{k.loeschen.erfolgText}</Hinweis>
        ) : (
          <form id="konto-loeschen" onSubmit={loeschen} noValidate className="grid gap-4">
            <Hinweis art="warnung">{k.loeschen.erklaerung}</Hinweis>
            <PasswortFeld label={k.loeschen.passwort} wert={passwort} setWert={s => { setPasswort(s); if (stand.art === 'fehler') setStand({ art: 'ruhe' }) }} autoComplete="current-password" k={k} />
            {inhaber && (
              <div className="rounded-2xl border border-rot/30 bg-rot-hell p-4">
                <p className="flex items-center gap-2 font-semibold text-[#a32424]"><IconWarnung className="size-5 shrink-0" />{k.loeschen.inhaberTitel}</p>
                <p className="mt-1 text-sm leading-6 text-text-2">{k.loeschen.inhaberText}</p>
                <div className="mt-3 flex items-start gap-3">
                  <input id={mitId} type="checkbox" checked={mitloeschen} onChange={e => setMitloeschen(e.target.checked)} aria-describedby={`${mitId}-h`}
                    className="mt-1 size-5 shrink-0 accent-[#e03e3e]" />
                  <div className="min-w-0">
                    <label htmlFor={mitId} className="break-words font-semibold text-text">{fuellen(k.loeschen.mitloeschen, { firma })}</label>
                    <p id={`${mitId}-h`} className="hinweis mt-0.5">{k.loeschen.mitloeschenHilfe}</p>
                  </div>
                </div>
              </div>
            )}
            {stand.art === 'fehler' && <Hinweis art="fehler">{stand.text}</Hinweis>}
          </form>
        )}
      </Dialog>
    </Karte>
  )
}

export default function KontoSeite({ k }: { k: KontoSeiteTexte }) {
  return (
    <div className="grid min-w-0 gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{k.titel}</h1>
        <p className="mt-2 max-w-2xl text-leise">{k.satz}</p>
      </header>
      <Persoenlich k={k} />
      <PasswortAendern k={k} />
      <UeberallAbmelden k={k} />
      <KontoLoeschen k={k} />
    </div>
  )
}
