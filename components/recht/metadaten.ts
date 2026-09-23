import type { Metadata } from 'next'
import type { UiSprache } from '@/lib/sprachen'

const OG_LOCALE: Record<UiSprache, string> = { de: 'de_DE', en: 'en_GB', es: 'es_ES' }

/** Metadaten einer Rechtsseite. Sprache kommt per Cookie — alle Fassungen liegen unter derselben Adresse. */
export function rechtMetadaten(pfad: string, sprache: UiSprache, meta: { titel: string; beschreibung: string }): Metadata {
  return {
    title: meta.titel,
    description: meta.beschreibung,
    alternates: { canonical: pfad, languages: { de: pfad, en: pfad, es: pfad, 'x-default': pfad } },
    openGraph: {
      title: `${meta.titel} · Klarframe Radio`,
      description: meta.beschreibung,
      type: 'website',
      url: pfad,
      siteName: 'Klarframe Radio',
      locale: OG_LOCALE[sprache],
    },
  }
}
