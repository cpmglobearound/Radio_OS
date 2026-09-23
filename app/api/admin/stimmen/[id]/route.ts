import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { nurAdmin } from '@/lib/admin'
import { koerper } from '@/lib/api'
import { protokoll } from '@/lib/protokoll'

// Mensch gibt je Sprache frei (Regel 7, 13 §3): muttersprachlich ja/nein, Merkmale, sichtbar.
const Schema = z.object({
  sprachen: z.array(z.object({ code: z.string().max(10), geprueft: z.boolean(), muttersprachlich: z.boolean() })).optional(),
  sichtbar: z.boolean().optional(), geschlecht: z.enum(['weiblich', 'maennlich', 'neutral']).optional(), alter: z.enum(['jung', 'mittel', 'reif']).optional(),
  stil: z.array(z.string().max(30)).max(8).optional(), kann_lachen: z.boolean().optional(), name: z.string().max(40).optional(),
})

export const PATCH = nurAdmin<{ params: Promise<{ id: string }> }>(async ({ req, s, ctx }) => {
  const id = decodeURIComponent((await ctx.params).id)
  const d = await koerper(req, Schema)
  const alt = await prisma.stimme.findUniqueOrThrow({ where: { id } })
  let sprachen = alt.sprachen as { code: string; geprueft: boolean; muttersprachlich: boolean; geprueft_von?: string }[]
  if (d.sprachen) sprachen = sprachen.map(x => { const n = d.sprachen!.find(y => y.code === x.code); return n ? { ...x, ...n, geprueft_von: s.nutzer.email } : x })
  const s2 = await prisma.stimme.update({ where: { id }, data: {
    sprachen, ...(d.sichtbar !== undefined ? { sichtbar: d.sichtbar } : {}), geschlecht: d.geschlecht ?? alt.geschlecht, alter: d.alter ?? alt.alter,
    stil: d.stil ?? alt.stil, kann_lachen: d.kann_lachen ?? alt.kann_lachen, name: d.name ?? alt.name, geprueft_am: new Date(), geprueft_von: s.nutzer.email,
  } })
  await protokoll({ nutzer_id: s.nutzer.id, aktion: 'admin.stimme_geprueft', ziel_typ: 'stimme', ziel_id: id, daten: d })
  return NextResponse.json({ stimme: s2 })
})
