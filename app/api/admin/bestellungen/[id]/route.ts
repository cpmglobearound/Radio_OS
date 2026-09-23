import { NextResponse } from 'next/server'
import { z } from 'zod'
import { nurAdmin } from '@/lib/admin'
import { koerper } from '@/lib/api'
import { freischalten, stornieren, verlaengern } from '@/lib/abrechnung/bestellung'

/** { aktion: freischalten | stornieren | verlaengern } — nach Zahlungseingang freischalten; Abo monatlich verlängern. */
export const POST = nurAdmin<{ params: Promise<{ id: string }> }>(async ({ req, s, ctx }) => {
  const { id } = await ctx.params
  const d = await koerper(req, z.object({ aktion: z.enum(['freischalten', 'stornieren', 'verlaengern']) }))
  const admin = { id: s.nutzer.id, email: s.nutzer.email }
  if (d.aktion === 'freischalten') await freischalten(id, admin)
  else if (d.aktion === 'verlaengern') await verlaengern(id, admin)
  else await stornieren(id, admin)
  return NextResponse.json({ ok: true })
})
