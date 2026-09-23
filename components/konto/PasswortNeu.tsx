'use client'
// Neues Passwort über den Link aus der Mail. Danach angemeldet, alle anderen Geräte abgemeldet → weiter ins Portal.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { api, fehlerText } from '@/components/gemeinsam/api'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconPfeil, IconSchild, IconWarnung } from '@/components/gemeinsam/Icons'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { KontoTexte } from '@/lib/i18n/texte/konto'
import Karte from './Karte'
import PasswortFeld from './PasswortFeld'
import { MIN_PASSWORT } from './staerke'
import { Einblenden, SendeKnopf } from './Teile'

const WEITER_MS = 4000

export function LinkUngueltig({ titel, text, knopf, href }: { titel: string; text: string; knopf: string; href: string }) {
  return (
    <Karte titel={titel} icon={<IconWarnung className="size-6" />}>
      <Einblenden schluessel="ungueltig">
        <p className="text-[15px] leading-7 text-text-2">{text}</p>
        <Link href={href} className="knopf knopf-haupt mt-6 w-full">{knopf}</Link>
      </Einblenden>
    </Karte>
  )
}

export default function PasswortNeu({ t, g, token }: { t: KontoTexte; g: GemeinsamTexte; token: string }) {
  const router = useRouter()
  const p = t.passwortNeu
  const [passwort, setPasswort] = useState('')
  const [wiederholung, setWiederholung] = useState('')
  const [fehler, setFehler] = useState<{ passwort?: string; wiederholung?: string }>({})
  const [allgemein, setAllgemein] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const [zustand, setZustand] = useState<'form' | 'fertig' | 'ungueltig'>(token ? 'form' : 'ungueltig')

  // Nach Erfolg kurz den Hinweis zeigen, dann von selbst ins Portal.
  useEffect(() => {
    if (zustand !== 'fertig') return
    const z = setTimeout(() => router.replace('/portal'), WEITER_MS)
    return () => clearTimeout(z)
  }, [zustand, router])

  async function absenden(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = {
      passwort: [...passwort].length < MIN_PASSWORT ? t.pruefen.passwort : undefined,
      wiederholung: wiederholung !== passwort ? t.pruefen.wiederholung : undefined,
    }
    setFehler(f)
    setAllgemein(null)
    if (f.passwort || f.wiederholung) {
      (form.elements.namedItem(f.passwort ? 'passwort' : 'wiederholung') as HTMLElement | null)?.focus()
      return
    }
    setLaeuft(true)
    const r = await api('/api/auth/passwort-neu', { body: { token, passwort } })
    setLaeuft(false)
    if (r.ok) { setZustand('fertig'); router.refresh(); return }
    if (r.code === 'token_ungueltig') { setZustand('ungueltig'); return }
    if (r.code === 'zu_kurz' || r.code === 'zu_haeufig') {
      setFehler({ passwort: fehlerText(r.code, g.fehler) })
      ;(form.elements.namedItem('passwort') as HTMLElement | null)?.focus()
      return
    }
    setAllgemein(r.code)
  }

  if (zustand === 'ungueltig') {
    return <LinkUngueltig titel={p.ungueltigTitel} text={p.ungueltigText} knopf={p.neuerLink} href="/passwort-vergessen" />
  }

  if (zustand === 'fertig') {
    return (
      <Karte titel={p.fertigTitel} icon={<IconSchild className="size-6" />}>
        <Einblenden schluessel="fertig">
          <Hinweis art="erfolg">{p.fertigText}</Hinweis>
          <p className="hinweis mt-4">{t.allgemein.weiterGleich}</p>
          <Link href="/portal" className="knopf knopf-haupt group mt-6 w-full">
            {t.allgemein.insPortal}
            <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Einblenden>
      </Karte>
    )
  }

  return (
    <Karte titel={p.titel} unterzeile={p.unterzeile}>
      <form onSubmit={absenden} noValidate className="grid gap-4">
        <PasswortFeld
          label={p.neu}
          name="passwort"
          wert={passwort}
          onWert={w => { setPasswort(w); setFehler(f => ({ ...f, passwort: undefined })) }}
          autoComplete="new-password"
          texte={t.allgemein}
          staerke={t.staerke}
          fehler={fehler.passwort}
          required
        />
        <PasswortFeld
          label={p.wiederholen}
          name="wiederholung"
          wert={wiederholung}
          onWert={w => { setWiederholung(w); setFehler(f => ({ ...f, wiederholung: undefined })) }}
          autoComplete="new-password"
          texte={t.allgemein}
          fehler={fehler.wiederholung}
          required
        />
        <div aria-live="polite" className="empty:hidden">
          {allgemein && <Hinweis art="fehler">{fehlerText(allgemein, g.fehler)}</Hinweis>}
        </div>
        <SendeKnopf laeuft={laeuft} text={p.knopf} sendet={t.allgemein.sendet} />
      </form>
    </Karte>
  )
}
