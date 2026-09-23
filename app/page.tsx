import fs from 'node:fs'
import { mitPreisen, preisKatalog, preisPlatzhalter } from '@/lib/abrechnung/katalog'
import path from 'node:path'
import type { Metadata } from 'next'
import { uiSprache } from '@/lib/i18n'
import texte, { type StartTexte } from '@/lib/i18n/texte/start'
import type { UiSprache } from '@/lib/sprachen'
import { HOERBEISPIELE } from '@/lib/hoerbeispiele'
import Ablauf from '@/components/start/Ablauf'
import { BewegungsRahmen } from '@/components/start/Bewegung'
import { Formate, SprachenStimmen } from '@/components/start/FormateUndStimmen'
import Fragen from '@/components/start/Fragen'
import Fusszeile from '@/components/start/Fusszeile'
import Hero from '@/components/start/Hero'
import Hoerbeispiele, { type BeispielAnzeige } from '@/components/start/Hoerbeispiele'
import Kopfzeile from '@/components/start/Kopfzeile'
import { Abschluss, Preise, Vertrauen } from '@/components/start/VertrauenPreise'
import { DreiWege, Sprecher } from '@/components/start/WegeUndSprecher'
import Zielgruppen from '@/components/start/Zielgruppen'

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await uiSprache()
  const t = mitPreisen(texte[sprache], preisPlatzhalter(await preisKatalog(), sprache))
  return {
    title: { absolute: t.meta.titel },
    description: t.meta.beschreibung,
    // Sprache kommt per Cookie — alle Fassungen liegen unter derselben Adresse.
    alternates: { canonical: '/', languages: { de: '/', en: '/', es: '/', 'x-default': '/' } },
    openGraph: {
      title: t.meta.titel,
      description: t.meta.beschreibung,
      type: 'website',
      url: '/',
      siteName: 'Klarframe Radio',
      locale: OG_LOCALE[sprache],
      alternateLocale: Object.values(OG_LOCALE).filter(l => l !== OG_LOCALE[sprache]),
      images: [{ url: '/marke/klarframe-logo-black.png', width: 759, height: 646, alt: 'Klarframe' }],
    },
  }
}

const OG_LOCALE: Record<UiSprache, string> = { de: 'de_DE', en: 'en_GB', es: 'es_ES' }

/** Strukturierte Daten (schema.org) für Suchmaschinen und KI-Modelle. */
function strukturierteDaten(t: StartTexte, sprache: UiSprache, abPreis: number) {
  const basis = (process.env.APP_URL || 'https://radio.klarframe.com').replace(/\/$/, '')
  const organisation = {
    '@type': 'Organization',
    '@id': 'https://klarframe.com/#organisation',
    name: 'Klarframe',
    url: 'https://klarframe.com',
    logo: `${basis}/marke/klarframe-logo-black.png`,
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organisation,
      {
        '@type': 'SoftwareApplication',
        '@id': `${basis}/#produkt`,
        name: 'Klarframe Radio',
        url: `${basis}/`,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        description: t.meta.beschreibung,
        inLanguage: sprache,
        availableLanguage: ['de', 'es', 'en'],
        publisher: { '@id': organisation['@id'] },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: String(abPreis),
          url: `${basis}/preise`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${basis}/#fragen`,
        inLanguage: sprache,
        mainEntity: t.fragen.liste.map(q => ({
          '@type': 'Question',
          name: q.f,
          acceptedAnswer: { '@type': 'Answer', text: q.a },
        })),
      },
    ],
  }
}

/** Nur Hörbeispiele zeigen, deren Datei wirklich da ist — das in der aktuellen Sprache zuerst. */
function vorhandeneBeispiele(sprache: string): BeispielAnzeige[] {
  const ordner = path.join(process.cwd(), 'public', 'hoerbeispiele')
  return HOERBEISPIELE
    .filter(b => fs.existsSync(path.join(ordner, path.basename(b.datei))))
    .sort((a, b) => Number(b.sprache === sprache) - Number(a.sprache === sprache))
    .map(b => ({
      id: b.id,
      sprache: b.sprache,
      quelle: `/hoerbeispiele/${encodeURIComponent(path.basename(b.datei))}`,
      titel: b.titel,
      sprecher: b.sprecher,
      laenge_s: b.laenge_s,
    }))
}

export default async function Startseite() {
  const sprache = await uiSprache()
  const katalog = await preisKatalog()
  // Preise kommen aus dem Katalog (Datenbank), die Texte tragen nur Platzhalter (17).
  const t = mitPreisen(texte[sprache], preisPlatzhalter(katalog, sprache))
  const beispiele = vorhandeneBeispiele(sprache)

  return (
    <BewegungsRahmen>
      <script
        type="application/ld+json"
        // JSON-LD: „<" maskieren, damit kein Text das Script-Element beenden kann.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten(t, sprache, katalog.einzel[0]?.preis_eur ?? 0)).replace(/</g, '\\u003c') }}
      />
      <div className="relative overflow-x-clip">
        <a href="#inhalt" className="sr-only z-[60] rounded-full bg-text px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          {t.allgemein.zumInhalt}
        </a>
        <Kopfzeile sprache={sprache} t={t} />
        <main id="inhalt">
          <Hero t={t} />
          <Hoerbeispiele t={t} beispiele={beispiele} />
          <Ablauf t={t} />
          <DreiWege t={t} />
          <Sprecher t={t} />
          <Zielgruppen t={t} />
          <Formate t={t} />
          <SprachenStimmen t={t} />
          <Vertrauen t={t} />
          <Preise t={t} />
          <Fragen t={t} />
          <Abschluss t={t} />
        </main>
        <Fusszeile t={t} />
      </div>
    </BewegungsRahmen>
  )
}
