import type { Metadata } from 'next'
import { Bricolage_Grotesque, Barlow } from 'next/font/google'
import { uiSprache } from '@/lib/i18n'
import './globals.css'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' })
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-barlow', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://radio.klarframe.com'),
  title: { default: 'Klarframe Radio', template: '%s · Klarframe Radio' },
  description: 'Sendefertige Radio- und Podcast-Beiträge mit KI-Stimmen — recherchiert, geschrieben, gesprochen.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sprache = await uiSprache()
  return (
    <html lang={sprache} className={`${bricolage.variable} ${barlow.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
