'use client'
// Portal-Hülle: Seitenleiste (Desktop) bzw. Menü (Handy), Kopfzeile mit Firma, Guthaben, Sprache, Abmelden, Hinweisbänder.
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { darf } from './rechte'
import Logo from '@/components/gemeinsam/Logo'
import SprachUmschalter from '@/components/gemeinsam/SprachUmschalter'
import Hinweis from '@/components/gemeinsam/Hinweis'
import { api } from '@/components/gemeinsam/api'
import { fuellen, mmss } from '@/components/gemeinsam/format'
import { IconAbmelden, IconBeleg, IconHaus, IconKreuz, IconListe, IconMenue, IconMikro, IconPerson, IconPlus, IconSchild, IconText, IconUhr } from '@/components/gemeinsam/Icons'
import { useOffeneBestellungen } from '@/components/bestellung/useOffeneBestellungen'
import { guthabenStufe, usePortal } from './Kontext'

type Punkt = { href: string; text: string; icon: ReactNode; exakt?: boolean; zahl?: number | null }

function useNavPunkte(): Punkt[] {
  const { t, rolle, nutzer } = usePortal()
  const offen = useOffeneBestellungen(nutzer.ist_admin)
  const p: Punkt[] = [{ href: '/portal', text: t.nav.uebersicht, icon: <IconHaus className="size-5" />, exakt: true }]
  if (darf(rolle, 'redaktion')) p.push({ href: '/portal/neu', text: t.nav.neu, icon: <IconPlus className="size-5" /> })
  p.push({ href: '/portal/beitraege', text: t.nav.beitraege, icon: <IconListe className="size-5" /> })
  p.push({ href: '/portal/stimmen', text: t.nav.stimmen, icon: <IconMikro className="size-5" /> })
  if (darf(rolle, 'redaktion')) p.push({ href: '/portal/aussprache', text: t.nav.aussprache, icon: <IconText className="size-5" /> })
  if (darf(rolle, 'redaktion')) p.push({ href: '/portal/guthaben', text: t.nav.guthaben, icon: <IconUhr className="size-5" /> })
  p.push({ href: '/portal/konto', text: t.nav.konto, icon: <IconPerson className="size-5" /> })
  if (nutzer.ist_admin) p.push({ href: '/portal/admin/stimmen', text: t.nav.admin, icon: <IconSchild className="size-5" /> })
  if (nutzer.ist_admin) p.push({ href: '/portal/admin/bestellungen', text: t.nav.adminBestellungen, icon: <IconBeleg className="size-5" />, zahl: offen })
  return p
}

function aktiv(pfad: string, p: Punkt) {
  return p.exakt ? pfad === p.href : pfad === p.href || pfad.startsWith(p.href + '/')
}

function NavListe({ onKlick }: { onKlick?: () => void }) {
  const { t } = usePortal()
  const pfad = usePathname()
  const punkte = useNavPunkte()
  return (
    <ul className="grid gap-1">
      {punkte.map(p => {
        const a = aktiv(pfad, p)
        return (
          <li key={p.href}>
            <Link href={p.href} onClick={onKlick} aria-current={a ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${a ? 'text-text' : 'text-leise hover:bg-karte hover:text-text'}`}>
              {a && <motion.span layoutId="nav-aktiv" className="absolute inset-0 rounded-xl border border-linie bg-karte shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className={`relative ${a ? 'text-cyan-tief' : ''}`}>{p.icon}</span>
              <span className="relative min-w-0 truncate">{p.text}</span>
              {!!p.zahl && <span className="relative ml-auto shrink-0 rounded-full bg-gelb-hell px-2 py-0.5 text-xs font-semibold tabular-nums text-[#8a4b05]"><span aria-hidden="true">{p.zahl}</span><span className="sr-only">{fuellen(t.nav.offen, { n: p.zahl })}</span></span>}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function GuthabenChip() {
  const { t, guthaben } = usePortal()
  const stufe = guthabenStufe(guthaben)
  const farbe = stufe === 'gruen' ? 'border-gruen/30 bg-gruen-hell text-[#0a6e5f]' : stufe === 'gelb' ? 'border-gelb/30 bg-gelb-hell text-[#8a4b05]' : 'border-rot/30 bg-rot-hell text-[#a32424]'
  const zeit = mmss(guthaben.sekunden)
  return (
    <Link href="/portal/guthaben" aria-label={fuellen(t.kopf.guthabenLabel, { zeit })}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold tabular-nums ${farbe}`}>
      <IconUhr className="size-4" />
      {fuellen(t.kopf.guthaben, { zeit })}
    </Link>
  )
}

function FirmaWahl({ id }: { id: string }) {
  const { t, mandant, mandanten } = usePortal()
  const router = useRouter()
  const [wechselt, setWechselt] = useState(false)
  if (mandanten.length < 2) return <span className="min-w-0 truncate font-display text-base font-semibold text-text">{mandant.name}</span>
  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="sr-only">{t.kopf.firmaWechseln}</span>
      <select id={id} value={mandant.id} disabled={wechselt}
        onChange={async e => {
          setWechselt(true)
          const r = await api('/api/konto', { method: 'PATCH', body: { mandant_id: e.target.value } })
          if (r.ok) { router.push('/portal'); router.refresh() }
          setWechselt(false)
        }}
        className="min-w-0 max-w-[16rem] truncate rounded-full border border-linie bg-karte py-1.5 pl-3 pr-8 font-display text-[15px] font-semibold text-text">
        {mandanten.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    </label>
  )
}

function Abmelden({ mitText = false }: { mitText?: boolean }) {
  const { t } = usePortal()
  const router = useRouter()
  const [laeuft, setLaeuft] = useState(false)
  return (
    <button type="button" disabled={laeuft}
      onClick={async () => { setLaeuft(true); await api('/api/auth/abmelden', { body: {} }); router.replace('/anmelden'); router.refresh() }}
      aria-label={laeuft ? t.kopf.abmeldenLaeuft : t.kopf.abmelden}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold text-text-2 transition-colors hover:bg-grund-2 hover:text-text disabled:opacity-50 ${mitText ? 'px-3 py-2' : 'size-10'}`}>
      <IconAbmelden className="size-5" />
      {mitText && <span>{t.kopf.abmelden}</span>}
    </button>
  )
}

function Baender() {
  const { t, nutzer, mandant, guthaben } = usePortal()
  const [gesendet, setGesendet] = useState<'nein' | 'laeuft' | 'ja'>('nein')
  return (
    <div className="grid gap-2 empty:hidden">
      {!nutzer.bestaetigt && (
        <Hinweis art="warnung" aktion={gesendet === 'ja' ? undefined : (
          <button type="button" disabled={gesendet === 'laeuft'} className="knopf knopf-zweit !py-1.5 !px-3.5 text-sm"
            onClick={async () => { setGesendet('laeuft'); const r = await api('/api/auth/email-erneut', { body: {} }); setGesendet(r.ok ? 'ja' : 'nein') }}>
            {t.band.mailErneut}
          </button>
        )}>
          {gesendet === 'ja' ? t.band.mailGesendet : t.band.unbestaetigt}
        </Hinweis>
      )}
      {mandant.gesperrt && <Hinweis art="fehler">{t.band.gesperrt}</Hinweis>}
      {!mandant.bestellt && <Hinweis art="info">{fuellen(t.band.probe, { zeit: mmss(guthaben.sekunden) })}</Hinweis>}
    </div>
  )
}

export default function Rahmen({ children }: { children: ReactNode }) {
  const { t, g, sprache, nutzer, rolle } = usePortal()
  const [menue, setMenue] = useState(false)
  const pfad = usePathname()
  const [pfadVorher, setPfadVorher] = useState(pfad)
  if (pfad !== pfadVorher) { setPfadVorher(pfad); setMenue(false) }

  useEffect(() => {
    if (!menue) return
    const taste = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenue(false) }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [menue])

  return (
    <div className="min-h-dvh bg-grund">
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-text focus:px-4 focus:py-2 focus:text-white">{g.zumInhalt}</a>

      {/* Seitenleiste ab lg */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-linie bg-grund-2/60 px-4 py-5 lg:flex">
        <div className="px-2"><Logo href="/portal" label={t.nav.portal} /></div>
        <nav aria-label={t.nav.bereich} className="mt-8 flex-1 overflow-y-auto"><NavListe /></nav>
        <div className="mt-4 border-t border-linie px-2 pt-4">
          <p className="truncate text-sm font-semibold text-text">{nutzer.name}</p>
          <p className="truncate text-xs text-leise">{nutzer.email}</p>
          <p className="mt-1 text-xs text-leise">{t.kopf.rolle[rolle]}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-linie/80 bg-grund/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><Logo href="/portal" label={t.nav.portal} klein /></div>
              <div className="hidden min-w-0 sm:flex lg:flex"><FirmaWahl id="firma-oben" /></div>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <GuthabenChip />
              <div className="hidden md:block"><SprachUmschalter sprache={sprache} namen={g.sprachen} label={g.spracheWaehlen} ziel="konto" /></div>
              <div className="hidden lg:block"><Abmelden /></div>
              <button type="button" onClick={() => setMenue(m => !m)} aria-expanded={menue} aria-controls="portal-menue" aria-label={menue ? t.nav.menueZu : t.nav.menue}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-linie bg-karte text-text lg:hidden">
                {menue ? <IconKreuz className="size-5" /> : <IconMenue className="size-5" />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {menue && (
              <motion.div id="portal-menue" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden lg:hidden">
                <div className="mx-auto grid max-w-6xl gap-4 px-4 pb-5 pt-2 sm:px-6">
                  <div className="sm:hidden"><FirmaWahl id="firma-menue" /></div>
                  <nav aria-label={t.nav.bereich}><NavListe onKlick={() => setMenue(false)} /></nav>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linie pt-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{nutzer.name}</p>
                      <p className="truncate text-xs text-leise">{nutzer.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SprachUmschalter sprache={sprache} namen={g.sprachen} label={g.spracheWaehlen} ziel="konto" />
                      <Abmelden mitText />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main id="inhalt" className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
          <Baender />
          <div className="mt-5 min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
