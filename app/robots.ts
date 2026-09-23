import type { MetadataRoute } from 'next'

const BASIS = (process.env.APP_URL || 'https://radio.klarframe.com').replace(/\/$/, '')

/** Geschützte Bereiche (Portal, Konto, API) sind für alle Crawler gesperrt. */
const GESPERRT = ['/portal', '/api/', '/konto']

/** KI-Crawler dürfen die öffentlichen Seiten ausdrücklich lesen — Klarframe Radio soll in KI-Antworten auffindbar sein. */
const KI_CRAWLER = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: GESPERRT },
      { userAgent: KI_CRAWLER, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow: GESPERRT },
    ],
    sitemap: `${BASIS}/sitemap.xml`,
    host: BASIS,
  }
}
