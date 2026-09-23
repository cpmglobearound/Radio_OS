import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { aktuelleSitzung } from '@/lib/konto/sitzung'
import { beitragVon } from '@/lib/mandant/zugriff'
import { uiSprache } from '@/lib/i18n'
import beitragTexte from '@/lib/i18n/texte/beitrag'
import startTexte from '@/lib/i18n/texte/start'
import BeitragAnsicht from '@/components/beitrag/BeitragAnsicht'

type Props = { params: Promise<{ id: string }> }

/** Beitrag der aktuellen Firma oder null (fremde oder gelöschte Beiträge gibt es für diese Sitzung nicht). */
async function beitragOderNull(id: string) {
  const s = await aktuelleSitzung()
  if (!s?.mandant) return null
  return beitragVon(s.mandant.id, id).catch(() => null)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const b = await beitragOderNull(id)
  return { title: b?.titel || beitragTexte[await uiSprache()].meta.titel }
}

export default async function BeitragSeite({ params }: Props) {
  const { id } = await params
  const b = await beitragOderNull(id)
  if (!b) notFound()
  const sprache = await uiSprache()
  const formatNamen = Object.fromEntries(Object.entries(startTexte[sprache].formate.namen).map(([k, v]) => [k, { name: v.name }]))
  return <BeitragAnsicht key={b.id} id={b.id} tb={beitragTexte[sprache]} formatNamen={formatNamen} />
}
