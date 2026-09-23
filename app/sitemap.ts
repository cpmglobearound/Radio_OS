import type { MetadataRoute } from 'next'

const BASIS = (process.env.APP_URL || 'https://radio.klarframe.com').replace(/\/$/, '')

/** Öffentliche Seiten für Suchmaschinen. Sprache wechselt per Cookie unter derselben Adresse. */
export default function sitemap(): MetadataRoute.Sitemap {
  const heute = new Date()
  const seiten: { pfad: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
    { pfad: '/', changeFrequency: 'weekly', priority: 1 },
    { pfad: '/registrieren', changeFrequency: 'monthly', priority: 0.8 },
    { pfad: '/anmelden', changeFrequency: 'yearly', priority: 0.4 },
    { pfad: '/bot', changeFrequency: 'yearly', priority: 0.5 },
    { pfad: '/datenschutz', changeFrequency: 'monthly', priority: 0.3 },
    { pfad: '/agb', changeFrequency: 'monthly', priority: 0.3 },
    { pfad: '/preise', changeFrequency: 'monthly', priority: 0.9 },
    { pfad: '/impressum', changeFrequency: 'yearly', priority: 0.3 },
  ]
  return seiten.map(s => ({ url: `${BASIS}${s.pfad}`, lastModified: heute, changeFrequency: s.changeFrequency, priority: s.priority }))
}
