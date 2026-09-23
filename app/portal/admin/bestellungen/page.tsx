import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { aktuelleSitzung } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import bestellTexte from '@/lib/i18n/texte/bestellung'
import AdminBestellungen from '@/components/bestellung/AdminBestellungen'

export async function generateMetadata(): Promise<Metadata> {
  return { title: bestellTexte[await uiSprache()].meta.admin }
}

/** Bestellungen per E-Mail freischalten/stornieren — nur Klarframe-Admins, alle anderen sehen „nicht gefunden". */
export default async function AdminBestellungenSeite() {
  const s = await aktuelleSitzung()
  if (!s?.nutzer.ist_admin) notFound()
  const sprache = await uiSprache()
  return <AdminBestellungen t={bestellTexte[sprache]} />
}
