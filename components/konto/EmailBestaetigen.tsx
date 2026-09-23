'use client'
// Link aus der Bestätigungsmail: beim Laden genau EINMAL bestätigen (auch im StrictMode), dann weiter ins Portal.
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, fehlerText } from '@/components/gemeinsam/api'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { IconHaken, IconMail, IconPfeil, IconWarnung } from '@/components/gemeinsam/Icons'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { KontoTexte } from '@/lib/i18n/texte/konto'
import Karte from './Karte'
import { Einblenden } from './Teile'

const WEITER_MS = 3000

type Zustand = { art: 'laedt' } | { art: 'ok' } | { art: 'ungueltig' } | { art: 'fehler'; code: string }

export default function EmailBestaetigen({ t, g, token, angemeldet, bestaetigt }: {
  t: KontoTexte
  g: GemeinsamTexte
  token: string
  angemeldet: boolean
  bestaetigt: boolean
}) {
  const router = useRouter()
  const e = t.emailBestaetigen
  const [zustand, setZustand] = useState<Zustand>(token ? { art: 'laedt' } : { art: 'ungueltig' })
  const [erneut, setErneut] = useState<'bereit' | 'laeuft' | 'ok' | string>('bereit')
  const gestartet = useRef(false)

  const bestaetigen = useCallback(() => {
    return api('/api/auth/email-bestaetigen', { body: { token } }).then(r => {
      if (r.ok) { setZustand({ art: 'ok' }); router.refresh() }
      else if (r.code === 'token_ungueltig') setZustand({ art: 'ungueltig' })
      else setZustand({ art: 'fehler', code: r.code })
    })
  }, [token, router])

  // Einmal-Link: der Ref verhindert den zweiten Aufruf, den der StrictMode im Entwickeln auslöst.
  useEffect(() => {
    if (!token || gestartet.current) return
    gestartet.current = true
    void bestaetigen()
  }, [token, bestaetigen])

  useEffect(() => {
    if (zustand.art !== 'ok') return
    const z = setTimeout(() => router.replace('/portal'), WEITER_MS)
    return () => clearTimeout(z)
  }, [zustand.art, router])

  function nochmal() {
    setZustand({ art: 'laedt' })
    void bestaetigen()
  }

  async function mailErneut() {
    setErneut('laeuft')
    const r = await api('/api/auth/email-erneut', { method: 'POST' })
    setErneut(r.ok ? 'ok' : r.code)
  }

  const insPortal = (
    <Link href="/portal" className="knopf knopf-haupt group mt-6 w-full">
      {t.allgemein.insPortal}
      <IconPfeil className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )

  if (zustand.art === 'laedt') {
    return (
      <Karte titel={e.laedtTitel} icon={<span aria-hidden="true" className="size-6 animate-spin rounded-full border-[3px] border-cyan-tief/25 border-t-cyan-tief" />}>
        <p role="status" className="text-[15px] leading-7 text-leise">{e.laedtText}</p>
      </Karte>
    )
  }

  if (zustand.art === 'ok') {
    return (
      <Karte titel={e.okTitel} icon={<IconHaken className="size-6" />}>
        <Einblenden schluessel="ok">
          <Hinweis art="erfolg">{e.okText}</Hinweis>
          <p className="hinweis mt-4">{t.allgemein.weiterGleich}</p>
          {insPortal}
        </Einblenden>
      </Karte>
    )
  }

  if (zustand.art === 'fehler') {
    return (
      <Karte titel={e.fehlerTitel} icon={<IconWarnung className="size-6" />}>
        <Einblenden schluessel="fehler">
          <Hinweis art="fehler">{fehlerText(zustand.code, g.fehler)}</Hinweis>
          <button type="button" onClick={nochmal} className="knopf knopf-haupt mt-6 w-full">{g.knopf.nochmal}</button>
        </Einblenden>
      </Karte>
    )
  }

  // Link ungültig — wer schon bestätigt ist, braucht nichts mehr zu tun.
  if (angemeldet && bestaetigt) {
    return (
      <Karte titel={e.schonTitel} icon={<IconHaken className="size-6" />}>
        <p className="text-[15px] leading-7 text-text-2">{e.schonText}</p>
        {insPortal}
      </Karte>
    )
  }

  return (
    <Karte titel={e.ungueltigTitel} icon={<IconWarnung className="size-6" />}>
      <Einblenden schluessel="ungueltig">
        <p className="text-[15px] leading-7 text-text-2">{e.ungueltigText} {angemeldet ? e.ungueltigAngemeldet : e.ungueltigAbgemeldet}</p>
        {angemeldet ? (
          <>
            <div aria-live="polite" className="mt-4 empty:hidden">
              {erneut === 'ok' && <Hinweis art="erfolg">{e.erneutOk}</Hinweis>}
              {erneut !== 'ok' && erneut !== 'bereit' && erneut !== 'laeuft' && <Hinweis art="fehler">{fehlerText(erneut, g.fehler)}</Hinweis>}
            </div>
            {erneut !== 'ok' && (
              <button type="button" onClick={mailErneut} disabled={erneut === 'laeuft'} className="knopf knopf-haupt mt-6 w-full">
                <IconMail className="size-4" />
                {erneut === 'laeuft' ? t.allgemein.sendet : e.erneut}
              </button>
            )}
            <Link href="/portal" className="knopf knopf-zweit mt-3 w-full">{t.allgemein.insPortal}</Link>
          </>
        ) : (
          <Link href="/anmelden" className="knopf knopf-haupt mt-6 w-full">{t.allgemein.zurAnmeldung}</Link>
        )}
      </Einblenden>
    </Karte>
  )
}
