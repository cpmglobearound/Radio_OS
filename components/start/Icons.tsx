// Schlichte Strich-Symbole (24×24, currentColor) — ohne zusätzliche Bibliothek.
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
export const IconHaken = (p: P) => <Basis {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Basis>
export const IconMenue = (p: P) => <Basis {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Basis>
export const IconKreuz = (p: P) => <Basis {...p}><path d="M6 6l12 12M18 6L6 18" /></Basis>
export const IconPlus = (p: P) => <Basis {...p}><path d="M12 5v14M5 12h14" /></Basis>
export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
)
export const IconPause = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
)
export const IconText = (p: P) => <Basis {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></Basis>
export const IconGlobus = (p: P) => <Basis {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" /></Basis>
export const IconLupe = (p: P) => <Basis {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Basis>
export const IconDrehbuch = (p: P) => <Basis {...p}><path d="M4 5h11M4 10h16M4 15h9M4 20h13" /></Basis>
export const IconMikro = (p: P) => <Basis {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></Basis>
export const IconSenden = (p: P) => <Basis {...p}><circle cx="12" cy="12" r="2" /><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 5.3a9.5 9.5 0 0 0 0 13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4" /></Basis>
export const IconBeleg = (p: P) => <Basis {...p}><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></Basis>
export const IconOhr = (p: P) => <Basis {...p}><path d="M7 9a5 5 0 0 1 10 0c0 3-2.5 3.8-3.2 6-.5 1.6-1.4 3-3.3 3A2.5 2.5 0 0 1 8 15.5" /><path d="M10 9.5a2 2 0 0 1 4 0" /></Basis>
export const IconKi = (p: P) => <Basis {...p}><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M9 2.5V5M15 2.5V5M9 19v2.5M15 19v2.5M2.5 9H5M2.5 15H5M19 9h2.5M19 15h2.5M9.5 14.5l1.4-5h.2l1.4 5M10 13h2.5M15 9.5v5" /></Basis>
export const IconSchloss = (p: P) => <Basis {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" /></Basis>
export const IconRadio = (p: P) => <Basis {...p}><rect x="3" y="8" width="18" height="12" rx="2.5" /><path d="M7 8l10-4.5" /><circle cx="15.5" cy="14" r="2.5" /><path d="M6.5 12.5h3M6.5 15.5h3" /></Basis>
export const IconLaden = (p: P) => <Basis {...p}><path d="M4 9.5L5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12.5V20h13v-7.5M10 20v-4.5h4V20" /></Basis>
export const IconDownload = (p: P) => <Basis {...p}><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14" /></Basis>
export const IconFeed = (p: P) => <Basis {...p}><path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8" /><circle cx="6" cy="18" r="1.5" /></Basis>
export const IconWelle = (p: P) => <Basis {...p}><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" /></Basis>
