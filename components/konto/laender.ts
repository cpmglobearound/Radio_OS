// Alle Länder nach ISO 3166-1 (alpha-2). Namen kommen aus Intl.DisplayNames in der Sprache der Oberfläche —
// so steht nirgends eine eigene Namensliste, die veralten könnte.
import type { UiSprache } from '@/lib/sprachen'
import { locale } from '@/components/gemeinsam/format'

export const LAENDER = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
  'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
  'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  'QA',
  'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'UM', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
  'WF', 'WS',
  'YE', 'YT',
  'ZA', 'ZM', 'ZW',
] as const

const MENGE: ReadonlySet<string> = new Set(LAENDER)

/** Sprache ohne Region → naheliegendes Land. */
const SPRACHE_ZU_LAND: Record<string, string> = {
  de: 'DE', es: 'ES', en: 'GB', fr: 'FR', it: 'IT', pt: 'PT', nl: 'NL', pl: 'PL', da: 'DK', sv: 'SE', nb: 'NO', fi: 'FI', cs: 'CZ', ca: 'ES', eu: 'ES', gl: 'ES',
}

/** Länderliste mit Namen in der Sprache der Oberfläche, alphabetisch. Läuft auf dem Server (keine Unterschiede beim Hydrieren). */
export function laenderListe(sprache: UiSprache): { code: string; name: string }[] {
  const loc = locale(sprache)
  let namen: Intl.DisplayNames | null = null
  try { namen = new Intl.DisplayNames([loc], { type: 'region' }) } catch { namen = null }
  return LAENDER
    .map(code => ({ code, name: namen?.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, loc))
}

/** Vorschlag aus dem Accept-Language-Kopf: erst eine genannte Region (de-AT → AT), sonst die Sprache (de → DE), sonst DE. */
export function landVorschlag(acceptLanguage: string | null | undefined): string {
  const tags = (acceptLanguage || '').split(',').map(t => t.split(';')[0].trim()).filter(Boolean)
  for (const t of tags) {
    const region = /^[a-z]{2,3}[-_]([a-z]{2})(?:[-_]|$)/i.exec(t)?.[1]?.toUpperCase()
    if (region && MENGE.has(region)) return region
  }
  for (const t of tags) {
    const land = SPRACHE_ZU_LAND[t.slice(0, 2).toLowerCase()]
    if (land) return land
  }
  return 'DE'
}
