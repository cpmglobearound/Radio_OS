'use client'
// Registrierung (docs/04 §1): Konto + Firma anlegen, 10 Probeminuten. Prüft Eingaben vorab und zeigt Fehler direkt am Feld.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { api, fehlerText } from '@/components/gemeinsam/api'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconHaken, IconMail } from '@/components/gemeinsam/Icons'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { KontoTexte } from '@/lib/i18n/texte/konto'
import Karte from './Karte'
import Feld, { FeldRahmen, beschreibung } from './Feld'
import PasswortFeld from './PasswortFeld'
import { MIN_PASSWORT } from './staerke'
import { Adresse, EMAIL_MUSTER, Einblenden, SendeKnopf, mitTeilen } from './Teile'

type Art = 'firma' | 'sender' | 'agentur'
type Schluessel = 'name' | 'email' | 'passwort' | 'firma' | 'art' | 'agb'
type Fehler = Partial<Record<Schluessel, string>>

const ARTEN: Art[] = ['firma', 'sender', 'agentur']
/** Reihenfolge der Felder im Formular — der erste Fehler bekommt den Fokus. */
const REIHENFOLGE: Schluessel[] = ['name', 'email', 'passwort', 'firma', 'art', 'agb']
/** API-Code → Feld, an dem der Fehler steht. */
const CODE_FELD: Partial<Record<string, Schluessel>> = { zu_kurz: 'passwort', zu_haeufig: 'passwort', wegwerf_email: 'email' }

export default function Registrieren({ t, g, laender, vorschlagLand }: {
  t: KontoTexte
  g: GemeinsamTexte
  laender: { code: string; name: string }[]
  vorschlagLand: string
}) {
  const router = useRouter()
  const r = t.registrieren
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [firma, setFirma] = useState('')
  const [art, setArt] = useState<Art | null>(null)
  const [land, setLand] = useState(vorschlagLand)
  const [agb, setAgb] = useState(false)
  const [werbung, setWerbung] = useState(false)
  const [website, setWebsite] = useState('')
  const [fehler, setFehler] = useState<Fehler>({})
  const [allgemein, setAllgemein] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const [fertig, setFertig] = useState<'postfach' | 'portal' | null>(null)

  const weg = (k: Schluessel) => setFehler(f => (f[k] ? { ...f, [k]: undefined } : f))

  function pruefen(): Fehler {
    const n = name.trim().length
    return {
      name: n < 2 || n > 80 ? t.pruefen.name : undefined,
      email: EMAIL_MUSTER.test(email.trim()) ? undefined : t.pruefen.email,
      passwort: [...passwort].length < MIN_PASSWORT ? t.pruefen.passwort : undefined,
      firma: firma.trim().length < 2 ? t.pruefen.firma : undefined,
      art: art ? undefined : t.pruefen.art,
      agb: agb ? undefined : t.pruefen.agb,
    }
  }

  function fokus(form: HTMLFormElement, k: Schluessel) {
    const el = form.elements.namedItem(k)
    const ziel = el instanceof RadioNodeList ? (el[0] as HTMLElement | undefined) : (el as HTMLElement | null)
    ziel?.focus()
  }

  async function absenden(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = pruefen()
    setFehler(f)
    setAllgemein(null)
    const erster = REIHENFOLGE.find(k => f[k])
    if (erster) { setAllgemein('pruefen'); fokus(form, erster); return }

    setLaeuft(true)
    const antwort = await api<{ ok: boolean; angemeldet: boolean }>('/api/auth/registrieren', {
      body: { name: name.trim(), email: email.trim(), passwort, firma: firma.trim(), art, land, agb: true, werbung, website },
    })
    if (antwort.ok) {
      if (antwort.daten.angemeldet) {
        setFertig('portal')
        router.replace('/portal')
        router.refresh()
      } else {
        setLaeuft(false)
        setFertig('postfach')
      }
      return
    }
    setLaeuft(false)
    const feld = CODE_FELD[antwort.code]
    if (feld) {
      setFehler({ [feld]: fehlerText(antwort.code, g.fehler) })
      fokus(form, feld)
    } else {
      setAllgemein(antwort.code)
    }
  }

  if (fertig === 'postfach') {
    return (
      <Karte titel={t.allgemein.postfach} icon={<IconMail className="size-6" />}>
        <Einblenden schluessel="postfach">
          <Hinweis art="erfolg">{mitTeilen(r.fertigText, { email: <Adresse>{email.trim()}</Adresse> })}</Hinweis>
          <p className="hinweis mt-4">{t.allgemein.spam}</p>
          <Link href="/anmelden" className="knopf knopf-haupt mt-6 w-full">{t.allgemein.zurAnmeldung}</Link>
        </Einblenden>
      </Karte>
    )
  }

  const neuerTab = <span className="sr-only"> {t.allgemein.neuerTab}</span>
  const artFehlerId = 'reg-art-fehler'

  return (
    <Karte
      breit
      titel={r.titel}
      unterzeile={
        <>
          <p>{r.unterzeile}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {r.nutzen.map(n => (
              <li key={n} className="inline-flex items-center gap-1.5 rounded-full bg-cyan-hell px-3 py-1 text-sm font-semibold text-cyan-text">
                <IconHaken className="size-4" />{n}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <form onSubmit={absenden} noValidate className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Feld
            label={r.name}
            name="name"
            autoComplete="name"
            maxLength={80}
            placeholder={r.namePlatzhalter}
            value={name}
            onChange={e => { setName(e.target.value); weg('name') }}
            fehler={fehler.name}
            required
          />
          <Feld
            label={t.allgemein.email}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={200}
            placeholder={t.allgemein.emailPlatzhalter}
            value={email}
            onChange={e => { setEmail(e.target.value); weg('email') }}
            fehler={fehler.email}
            required
          />
        </div>

        <PasswortFeld
          label={t.allgemein.passwort}
          wert={passwort}
          onWert={w => { setPasswort(w); weg('passwort') }}
          autoComplete="new-password"
          texte={t.allgemein}
          staerke={t.staerke}
          fehler={fehler.passwort}
          required
        />

        <Feld
          label={r.firma}
          name="firma"
          autoComplete="organization"
          maxLength={120}
          value={firma}
          onChange={e => { setFirma(e.target.value); weg('firma') }}
          fehler={fehler.firma}
          hinweis={r.firmaHinweis}
          required
        />

        <fieldset aria-describedby={fehler.art ? artFehlerId : undefined} className="min-w-0">
          <legend className="etikett">{r.art}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ARTEN.map(a => (
              <label
                key={a}
                className={`relative flex min-w-0 cursor-pointer flex-col rounded-2xl border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan-tief ${art === a ? 'border-cyan-tief bg-cyan-hell/60 shadow-[0_0_0_1px_var(--color-cyan-tief)]' : fehler.art ? 'border-rot bg-karte hover:bg-grund' : 'border-linie-2 bg-karte hover:bg-grund'}`}
              >
                <input
                  type="radio"
                  name="art"
                  value={a}
                  checked={art === a}
                  onChange={() => { setArt(a); weg('art') }}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2 font-semibold text-text">
                  {r.arten[a].name}
                  <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${art === a ? 'border-cyan-tief bg-cyan-tief text-white' : 'border-linie-2'}`}>
                    {art === a && <IconHaken className="size-3.5" />}
                  </span>
                </span>
                <span className="mt-0.5 text-sm leading-5 text-leise">{r.arten[a].text}</span>
              </label>
            ))}
          </div>
          {fehler.art && <p id={artFehlerId} className="mt-1.5 text-sm font-medium text-[#a32424]">{fehler.art}</p>}
        </fieldset>

        <FeldRahmen id="reg-land" label={r.land} hinweis={r.landHinweis}>
          <select
            id="reg-land"
            name="land"
            autoComplete="country"
            value={land}
            onChange={e => setLand(e.target.value)}
            aria-describedby={beschreibung('reg-land', null, r.landHinweis)}
            className="feld"
          >
            {laender.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </FeldRahmen>

        {/* Honigtopf für Bots: für Menschen unsichtbar, nicht per Tab erreichbar, bleibt leer. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="reg-website">{r.honigtopf}</label>
          <input id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
        </div>

        <div className="grid gap-3">
          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-6 text-text-2">
              <input
                type="checkbox"
                name="agb"
                checked={agb}
                onChange={e => { setAgb(e.target.checked); weg('agb') }}
                aria-invalid={fehler.agb ? true : undefined}
                aria-describedby={fehler.agb ? 'reg-agb-fehler' : undefined}
                className="mt-1 size-5 shrink-0 accent-cyan-tief"
              />
              <span className="min-w-0">
                {mitTeilen(r.agb, {
                  agb: <Link href="/agb" target="_blank" rel="noopener" className="font-semibold text-cyan-text underline underline-offset-2">{r.agbLink}{neuerTab}</Link>,
                  datenschutz: <Link href="/datenschutz" target="_blank" rel="noopener" className="font-semibold text-cyan-text underline underline-offset-2">{r.datenschutzLink}{neuerTab}</Link>,
                })}
              </span>
            </label>
            {fehler.agb && <p id="reg-agb-fehler" className="ml-8 mt-1 text-sm font-medium text-[#a32424]">{fehler.agb}</p>}
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-6 text-text-2">
            <input type="checkbox" name="werbung" checked={werbung} onChange={e => setWerbung(e.target.checked)} className="mt-1 size-5 shrink-0 accent-cyan-tief" />
            <span className="min-w-0">{r.werbung}</span>
          </label>
        </div>

        <div aria-live="polite" className="empty:hidden">
          {allgemein && <Hinweis art="fehler">{allgemein === 'pruefen' ? t.pruefen.oben : fehlerText(allgemein, g.fehler)}</Hinweis>}
          {fertig === 'portal' && <Hinweis art="erfolg">{t.anmelden.angemeldet}</Hinweis>}
        </div>

        <SendeKnopf laeuft={laeuft} text={r.knopf} sendet={t.allgemein.sendet} />
      </form>

      <p className="mt-6 border-t border-linie pt-5 text-center text-sm text-leise">
        {r.schonKonto}{' '}
        <Link href="/anmelden" className="font-semibold text-cyan-text hover:underline">{r.anmelden}</Link>
      </p>
    </Karte>
  )
}
