import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { aktuelleSitzung, darf } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import ausspracheTexte from '@/lib/i18n/texte/aussprache'
import AusspracheLexikon from '@/components/aussprache/AusspracheLexikon'

export async function generateMetadata(): Promise<Metadata> {
  return { title: ausspracheTexte[await uiSprache()].meta.titel }
}

/** Aussprache-Lexikon (07 §4.6) — nur Redaktion und höher; die API verlangt dieselbe Rolle. */
export default async function AusspracheSeite() {
  const s = await aktuelleSitzung()
  if (!s) redirect('/anmelden')
  if (!darf(s.rolle, 'redaktion')) redirect('/portal')
  const sprache = await uiSprache()
  return <AusspracheLexikon t={ausspracheTexte[sprache]} />
}
