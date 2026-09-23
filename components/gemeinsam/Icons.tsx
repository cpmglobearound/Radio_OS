// Schlichte Strich-Symbole (24×24, currentColor) für Portal und Konto-Seiten — ohne zusätzliche Bibliothek.
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

function Basis({ children, ...p }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {children}
    </svg>
  )
}

export const IconPfeil = (p: P) => <Basis {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Basis>
export const IconPfeilLinks = (p: P) => <Basis {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Basis>
export const IconWinkel = (p: P) => <Basis {...p}><path d="M9 6l6 6-6 6" /></Basis>
export const IconWinkelUnten = (p: P) => <Basis {...p}><path d="M6 9l6 6 6-6" /></Basis>
export const IconHoch = (p: P) => <Basis {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Basis>
export const IconRunter = (p: P) => <Basis {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Basis>
export const IconHaken = (p: P) => <Basis {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Basis>
export const IconMenue = (p: P) => <Basis {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Basis>
export const IconKreuz = (p: P) => <Basis {...p}><path d="M6 6l12 12M18 6L6 18" /></Basis>
export const IconPlus = (p: P) => <Basis {...p}><path d="M12 5v14M5 12h14" /></Basis>
export const IconHaus = (p: P) => <Basis {...p}><path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5" /></Basis>
export const IconListe = (p: P) => <Basis {...p}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></Basis>
export const IconMikro = (p: P) => <Basis {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></Basis>
export const IconUhr = (p: P) => <Basis {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Basis>
export const IconPerson = (p: P) => <Basis {...p}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></Basis>
export const IconSchild = (p: P) => <Basis {...p}><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></Basis>
export const IconAbmelden = (p: P) => <Basis {...p}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" /></Basis>
export const IconStift = (p: P) => <Basis {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></Basis>
export const IconMuell = (p: P) => <Basis {...p}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" /></Basis>
export const IconFunken = (p: P) => <Basis {...p}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></Basis>
export const IconNeu = (p: P) => <Basis {...p}><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" /></Basis>
export const IconWarnung = (p: P) => <Basis {...p}><path d="M12 4l9 16H3z" /><path d="M12 10v4.5M12 17.5v.01" /></Basis>
export const IconInfo = (p: P) => <Basis {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.01" /></Basis>
export const IconExtern = (p: P) => <Basis {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Basis>
export const IconDownload = (p: P) => <Basis {...p}><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14" /></Basis>
export const IconText = (p: P) => <Basis {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></Basis>
export const IconGlobus = (p: P) => <Basis {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" /></Basis>
export const IconLupe = (p: P) => <Basis {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Basis>
export const IconDrehbuch = (p: P) => <Basis {...p}><path d="M4 5h11M4 10h16M4 15h9M4 20h13" /></Basis>
export const IconBeleg = (p: P) => <Basis {...p}><path d="M9 7h8M9 11h8M9 15h5" /><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /></Basis>
export const IconWelle = (p: P) => <Basis {...p}><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" /></Basis>
export const IconMail = (p: P) => <Basis {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></Basis>
export const IconSchloss = (p: P) => <Basis {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" /></Basis>
export const IconAuge = (p: P) => <Basis {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></Basis>
export const IconAugeZu = (p: P) => <Basis {...p}><path d="M4 4l16 16M10 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.9 3.7M6.5 7.4A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1" /></Basis>
export const IconFilter = (p: P) => <Basis {...p}><path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" /></Basis>
export const IconLachen = (p: P) => <Basis {...p}><circle cx="12" cy="12" r="8.5" /><path d="M8 14c1 1.8 2.4 2.7 4 2.7s3-.9 4-2.7M9 9.5v.5M15 9.5v.5" /></Basis>
export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
)
export const IconPause = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
)
export const IconZurueck10 = (p: P) => <Basis {...p}><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5" /><text x="12" y="15.5" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">10</text></Basis>
export const IconVor10 = (p: P) => <Basis {...p}><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5M20 4v4.5h-4.5" /><text x="12" y="15.5" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">10</text></Basis>
