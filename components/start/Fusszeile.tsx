import Image from 'next/image'
import Link from 'next/link'
import type { StartTexte } from '@/lib/i18n/texte/start'

export default function Fusszeile({ t }: { t: StartTexte }) {
  const f = t.fuss
  const jahr = new Date().getFullYear()
  return (
    <footer className="border-t border-linie bg-karte">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-5 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="min-w-0">
          <Link href="/" aria-label={t.nav.startseite} className="inline-flex items-center gap-2.5">
            <Image src="/marke/klarframe-logo-black.png" alt="Klarframe" width={56} height={48} className="h-12 w-auto" />
            <span aria-hidden="true" className="h-8 w-px bg-linie-2" />
            <span className="font-display text-2xl font-medium leading-none tracking-[-.04em] text-text">Radio</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-leise">{f.text}</p>
        </div>
        <nav aria-label={f.produkt} className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[.14em] text-text-2">{f.produkt}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-leise">
            <li><a href="#hoeren" className="hover:text-text">{t.nav.hoeren}</a></li>
            <li><a href="#ablauf" className="hover:text-text">{t.nav.ablauf}</a></li>
            <li><Link href="/preise" className="hover:text-text">{t.nav.preise}</Link></li>
            <li><Link href="/registrieren" className="hover:text-text">{t.nav.testen}</Link></li>
          </ul>
        </nav>
        <nav aria-label={f.rechtliches} className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[.14em] text-text-2">{f.rechtliches}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-leise">
            <li><Link href="/impressum" className="hover:text-text">{f.impressum}</Link></li>
            <li><Link href="/datenschutz" className="hover:text-text">{f.datenschutz}</Link></li>
            <li><Link href="/agb" className="hover:text-text">{f.agb}</Link></li>
            <li><Link href="/bot" className="hover:text-text">{f.bot}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-linie">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-leise sm:px-5 lg:px-8">© {jahr} {f.rechte}</p>
      </div>
    </footer>
  )
}
