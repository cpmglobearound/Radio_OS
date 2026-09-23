// Schlichter Rahmen der öffentlichen Konto-Seiten: Logo + Sprache oben, Karte in der Mitte, Rechtliches unten.
import Link from 'next/link'
import { uiSprache } from '@/lib/i18n'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import kontoTexte from '@/lib/i18n/texte/konto'
import Logo from '@/components/gemeinsam/Logo'
import SprachUmschalter from '@/components/gemeinsam/SprachUmschalter'

export default async function KontoLayout({ children }: { children: React.ReactNode }) {
  const sprache = await uiSprache()
  const g = gemeinsamTexte[sprache]
  const t = kontoTexte[sprache].rahmen
  const links = [
    { href: '/impressum', text: t.impressum },
    { href: '/datenschutz', text: t.datenschutz },
    { href: '/agb', text: t.agb },
  ]
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-grund">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[28rem] bg-[radial-gradient(60%_60%_at_20%_0%,rgb(0_200_255/.10),transparent_70%),radial-gradient(50%_50%_at_90%_10%,rgb(139_92_246/.10),transparent_70%)]" />
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-text focus:px-4 focus:py-2 focus:text-white">
        {g.zumInhalt}
      </a>
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Logo href="/" label={g.startseite} />
        <SprachUmschalter sprache={sprache} namen={g.sprachen} label={g.spracheWaehlen} ziel="cookie" />
      </header>
      <main id="inhalt" className="relative flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:items-center sm:px-6 sm:pt-6">
        {children}
      </main>
      <footer className="relative px-4 pb-6 text-sm text-leise sm:px-6">
        <nav aria-label={t.fussNav} className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="rounded-sm transition-colors hover:text-text">{l.text}</Link>
          ))}
          <span>© Klarframe</span>
        </nav>
      </footer>
    </div>
  )
}
