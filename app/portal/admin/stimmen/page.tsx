import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { aktuelleSitzung } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import adminTexte from '@/lib/i18n/texte/admin'
import StimmenFreigabe from '@/components/admin/StimmenFreigabe'

export async function generateMetadata(): Promise<Metadata> {
  return { title: adminTexte[await uiSprache()].meta.titel }
}

/** Freigabe der Stimmen je Sprache (13 §3) — nur Klarframe-Admins, alle anderen sehen „nicht gefunden". */
export default async function AdminStimmenSeite() {
  const s = await aktuelleSitzung()
  if (!s?.nutzer.ist_admin) notFound()
  const sprache = await uiSprache()
  return <StimmenFreigabe t={adminTexte[sprache]} />
}
