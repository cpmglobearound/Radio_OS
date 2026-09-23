'use client'
// Passwort vergessen: E-Mail eingeben → immer dieselbe Erfolgsansicht (verrät nicht, ob es das Konto gibt).
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { api, fehlerText } from '@/components/gemeinsam/api'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconMail, IconPfeilLinks } from '@/components/gemeinsam/Icons'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { KontoTexte } from '@/lib/i18n/texte/konto'
import Karte from './Karte'
import Feld from './Feld'
import { Adresse, EMAIL_MUSTER, Einblenden, SendeKnopf, mitTeilen } from './Teile'

export default function PasswortVergessen({ t, g }: { t: KontoTexte; g: GemeinsamTexte }) {
  const p = t.passwortVergessen
  const [email, setEmail] = useState('')
  const [feldFehler, setFeldFehler] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const [gesendet, setGesendet] = useState(false)

  async function absenden(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFehler(null)
    if (!EMAIL_MUSTER.test(email.trim())) {
      setFeldFehler(t.pruefen.email)
      ;(e.currentTarget.elements.namedItem('email') as HTMLElement | null)?.focus()
      return
    }
    setLaeuft(true)
    const r = await api('/api/auth/passwort-vergessen', { body: { email: email.trim() } })
    setLaeuft(false)
    if (r.ok) setGesendet(true)
    else setFehler(r.code)
  }

  const zurueck = (
    <Link href="/anmelden" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-text hover:underline">
      <IconPfeilLinks className="size-4" />{p.zurueck}
    </Link>
  )

  if (gesendet) {
    return (
      <Karte titel={t.allgemein.postfach} icon={<IconMail className="size-6" />}>
        <Einblenden schluessel="gesendet">
          <Hinweis art="erfolg">{mitTeilen(p.fertigText, { email: <Adresse>{email.trim()}</Adresse> })}</Hinweis>
          <p className="hinweis mt-4">{t.allgemein.spam}</p>
          <button type="button" onClick={() => setGesendet(false)} className="knopf knopf-zweit mt-6 w-full">{t.allgemein.andereAdresse}</button>
          <div className="text-center">{zurueck}</div>
        </Einblenden>
      </Karte>
    )
  }

  return (
    <Karte titel={p.titel} unterzeile={p.unterzeile}>
      <form onSubmit={absenden} noValidate className="grid gap-4">
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
          onChange={e => { setEmail(e.target.value); setFeldFehler(null) }}
          fehler={feldFehler}
          required
        />
        <div aria-live="polite" className="empty:hidden">
          {fehler && <Hinweis art="fehler">{fehlerText(fehler, g.fehler)}</Hinweis>}
        </div>
        <SendeKnopf laeuft={laeuft} text={p.knopf} sendet={t.allgemein.sendet} />
      </form>
      <div className="text-center">{zurueck}</div>
    </Karte>
  )
}
