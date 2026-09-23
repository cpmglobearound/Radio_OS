import { cookies, headers } from 'next/headers'
import { OBERFLAECHE, type UiSprache } from '@/lib/sprachen'

export const SPRACH_COOKIE = 'radio_sprache'

export function alsUiSprache(x: string | null | undefined): UiSprache | null {
  const b = (x || '').slice(0, 2).toLowerCase()
  return (OBERFLAECHE as readonly string[]).includes(b) ? (b as UiSprache) : null
}

/** Sprache der Oberfläche: Cookie → Browser → Deutsch. */
export async function uiSprache(): Promise<UiSprache> {
  const c = (await cookies()).get(SPRACH_COOKIE)?.value
  const aus = alsUiSprache(c)
  if (aus) return aus
  const al = (await headers()).get('accept-language') || ''
  for (const teil of al.split(',')) { const s = alsUiSprache(teil.trim()); if (s) return s }
  return 'de'
}

/** Jede Textdatei: const de = {...}; export default { de, en: {...} satisfies typeof de, es: ... } — fehlende Schlüssel brechen die Typprüfung. */
export type Texte<T> = Record<UiSprache, T>
