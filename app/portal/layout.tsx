import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { aktuelleSitzung, darf } from '@/lib/konto/sitzung'
import { minutenZaehler } from '@/lib/abrechnung/kontobuch'
import { uiSprache } from '@/lib/i18n'
import portalTexte from '@/lib/i18n/texte/portal'
import gemeinsamTexte from '@/lib/i18n/texte/gemeinsam'
import { PortalKontext } from '@/components/portal/Kontext'
import Rahmen from '@/components/portal/Rahmen'
import Hinweis from '@/components/gemeinsam/Hinweis'
import Logo from '@/components/gemeinsam/Logo'

export async function generateMetadata(): Promise<Metadata> {
  const t = portalTexte[await uiSprache()]
  return { title: { default: t.meta.titel, template: '%s · Klarframe Radio' }, robots: { index: false, follow: false } }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const s = await aktuelleSitzung()
  if (!s) redirect('/anmelden')
  const sprache = await uiSprache()
  const t = portalTexte[sprache]
  const g = gemeinsamTexte[sprache]

  // Ohne Firma gibt es im Portal nichts zu tun — erklären statt leerer Seiten.
  if (!s.mandant) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4">
        <Logo label={g.startseite} />
        <Hinweis art="warnung">{g.fehler.kein_mandant}</Hinweis>
      </main>
    )
  }

  const z = await minutenZaehler(s.mandant.id)
  return (
    <PortalKontext key={s.mandant.id} wert={{
      sprache, t, g,
      nutzer: { name: s.nutzer.name, email: s.nutzer.email, bestaetigt: s.nutzer.bestaetigt, ist_admin: s.nutzer.ist_admin },
      mandant: { id: s.mandant.id, name: s.mandant.name, bestellt: !!s.mandant.bestellt_am, gesperrt: !!s.mandant.gesperrt_grund },
      mandanten: s.mandanten,
      rolle: s.rolle,
      darfBearbeiten: darf(s.rolle, 'redaktion'),
      guthaben: { sekunden: z.sekunden, gutschrift_sekunden: z.gutschrift_sekunden, warnen: z.gutschrift_sekunden > 0 && z.sekunden / z.gutschrift_sekunden < 0.2, bestellt: !!s.mandant.bestellt_am, verbraucht_monat_s: z.verbraucht_monat_s, reserviert_s: z.reserviert_s, laufend: z.laufend, beitraege_monat: z.beitraege_monat },
    }}>
      <Rahmen>{children}</Rahmen>
    </PortalKontext>
  )
}
