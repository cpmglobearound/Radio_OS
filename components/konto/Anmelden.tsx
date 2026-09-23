'use client'
// Anmelden: mit Passwort ODER mit Link per E-Mail. Nach Erfolg ins Portal.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'
import { api, fehlerText } from '@/components/gemeinsam/api'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconMail, IconSchloss } from '@/components/gemeinsam/Icons'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { KontoTexte } from '@/lib/i18n/texte/konto'
import Karte from './Karte'
import Feld from './Feld'
import PasswortFeld from './PasswortFeld'
import { Adresse, EMAIL_MUSTER, Einblenden, SendeKnopf, mitTeilen } from './Teile'

type Weg = 'passwort' | 'link'

export default function Anmelden({ t, g, linkUngueltig }: { t: KontoTexte; g: GemeinsamTexte; linkUngueltig: boolean }) {
  const router = useRouter()
  const a = t.anmelden
  const [weg, setWeg] = useState<Weg>(linkUngueltig ? 'link' : 'passwort')
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [feldFehler, setFeldFehler] = useState<{ email?: string; passwort?: string }>({})
  /** Fehlercode der API — der Satz dazu kommt aus fehlerText(). */
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const [linkGesendet, setLinkGesendet] = useState(false)
  const [angemeldet, setAngemeldet] = useState(false)

  function wegWechseln(w: Weg) {
    setWeg(w)
    setFehler(null)
    setFeldFehler({})
  }

  async function mitPasswort(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = {
      email: EMAIL_MUSTER.test(email.trim()) ? undefined : t.pruefen.email,
      passwort: passwort ? undefined : t.pruefen.passwortLeer,
    }
    setFeldFehler(f)
    setFehler(null)
    if (f.email || f.passwort) {
      (e.currentTarget.elements.namedItem(f.email ? 'email' : 'passwort') as HTMLElement | null)?.focus()
      return
    }
    setLaeuft(true)
    const r = await api('/api/auth/anmelden', { body: { email: email.trim(), passwort } })
    if (r.ok) {
      setAngemeldet(true)
      router.replace('/portal')
      router.refresh()
      return
    }
    setLaeuft(false)
    setFehler(r.code)
  }

  async function mitLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fe = EMAIL_MUSTER.test(email.trim()) ? undefined : t.pruefen.email
    setFeldFehler({ email: fe })
    setFehler(null)
    if (fe) {
      (e.currentTarget.elements.namedItem('email') as HTMLElement | null)?.focus()
      return
    }
    setLaeuft(true)
    const r = await api('/api/auth/anmeldelink', { body: { email: email.trim() } })
    setLaeuft(false)
    if (r.ok) setLinkGesendet(true)
    else setFehler(r.code)
  }

  if (linkGesendet) {
    return (
      <Karte titel={t.allgemein.postfach} icon={<IconMail className="size-6" />}>
        <Einblenden schluessel="gesendet">
          <Hinweis art="erfolg">{mitTeilen(a.linkGesendet, { email: <Adresse>{email.trim()}</Adresse> })}</Hinweis>
          <p className="hinweis mt-4">{t.allgemein.spam}</p>
          <button type="button" onClick={() => setLinkGesendet(false)} className="knopf knopf-zweit mt-6 w-full">{t.allgemein.andereAdresse}</button>
        </Einblenden>
      </Karte>
    )
  }

  const wege: { id: Weg; text: string; icon: ReactNode }[] = [
    { id: 'passwort', text: a.mitPasswort, icon: <IconSchloss className="size-4" /> },
    { id: 'link', text: a.mitLink, icon: <IconMail className="size-4" /> },
  ]

  return (
    <Karte titel={a.titel} unterzeile={a.unterzeile}>
      {linkUngueltig && <Hinweis art="warnung" className="mb-5">{a.linkUngueltig}</Hinweis>}

      <div role="group" aria-label={a.wege} className="grid grid-cols-2 gap-1 rounded-2xl border border-linie bg-grund-2 p-1">
        {wege.map(w => (
          <button
            key={w.id}
            type="button"
            aria-pressed={weg === w.id}
            onClick={() => wegWechseln(w.id)}
            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-center text-sm font-semibold leading-tight transition-colors ${weg === w.id ? 'bg-karte text-text shadow-sm' : 'text-leise hover:text-text'}`}
          >
            <span className="shrink-0">{w.icon}</span>
            <span className="min-w-0">{w.text}</span>
          </button>
        ))}
      </div>

      <Einblenden schluessel={weg}>
        {weg === 'passwort' ? (
          <form onSubmit={mitPasswort} noValidate className="mt-6 grid gap-4">
            <Feld
              label={t.allgemein.email}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={t.allgemein.emailPlatzhalter}
              value={email}
              onChange={e => { setEmail(e.target.value); setFeldFehler(f => ({ ...f, email: undefined })) }}
              fehler={feldFehler.email}
              required
            />
            <PasswortFeld
              label={t.allgemein.passwort}
              wert={passwort}
              onWert={w => { setPasswort(w); setFeldFehler(f => ({ ...f, passwort: undefined })) }}
              autoComplete="current-password"
              texte={t.allgemein}
              fehler={feldFehler.passwort}
              zusatz={<Link href="/passwort-vergessen" className="font-medium text-cyan-text hover:underline">{a.vergessen}</Link>}
              required
            />
            <div aria-live="polite" className="empty:hidden">
              {fehler && (
                <Hinweis
                  art="fehler"
                  aktion={fehler === 'gesperrt' ? <button type="button" onClick={() => wegWechseln('link')} className="knopf knopf-zweit !px-3 !py-1.5 text-sm">{a.linkNutzen}</button> : undefined}
                >
                  {fehlerText(fehler, g.fehler)}
                </Hinweis>
              )}
              {angemeldet && <Hinweis art="erfolg">{a.angemeldet}</Hinweis>}
            </div>
            <SendeKnopf laeuft={laeuft} text={a.knopf} sendet={t.allgemein.sendet} />
          </form>
        ) : (
          <form onSubmit={mitLink} noValidate className="mt-6 grid gap-4">
            <p className="text-[15px] leading-7 text-text-2">{a.linkErklaerung}</p>
            <Feld
              label={t.allgemein.email}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={t.allgemein.emailPlatzhalter}
              value={email}
              onChange={e => { setEmail(e.target.value); setFeldFehler({}) }}
              fehler={feldFehler.email}
              required
            />
            <div aria-live="polite" className="empty:hidden">
              {fehler && <Hinweis art="fehler">{fehlerText(fehler, g.fehler)}</Hinweis>}
            </div>
            <SendeKnopf laeuft={laeuft} text={a.linkKnopf} sendet={t.allgemein.sendet} />
          </form>
        )}
      </Einblenden>

      <p className="mt-6 border-t border-linie pt-5 text-center text-sm text-leise">
        {a.neuHier}{' '}
        <Link href="/registrieren" className="font-semibold text-cyan-text hover:underline">{a.registrieren}</Link>
      </p>
    </Karte>
  )
}
