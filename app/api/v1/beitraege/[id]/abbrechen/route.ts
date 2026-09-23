import { NextResponse } from 'next/server'
import { mitSitzung, ApiFehler } from '@/lib/api'
import { beitragVon } from '@/lib/mandant/zugriff'
import { abbrechen } from '@/lib/produktion/strecke'
import { protokoll } from '@/lib/protokoll'

/** Laufenden Beitrag abbrechen: Reservierung zurück, 0 Minuten verbraucht. */
export const POST = mitSitzung<{ params: Promise<{ id: string }> }>('redaktion', async ({ s, ctx }) => {
  const { id } = await ctx.params
  await beitragVon(s.mandant!.id, id)
  if (!(await abbrechen(id))) throw new ApiFehler(409, 'status', 'status')
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'beitrag.abgebrochen', ziel_typ: 'beitrag', ziel_id: id })
  return NextResponse.json({ ok: true })
})
