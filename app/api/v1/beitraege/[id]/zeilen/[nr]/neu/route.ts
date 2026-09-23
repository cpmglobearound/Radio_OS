import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mitSitzung, koerper, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'
import { beitragVon } from '@/lib/mandant/zugriff'
import { EMOTIONEN } from '@/lib/tonalitaet'

type Ctx = { params: Promise<{ id: string; nr: string }> }

/** Eine Zeile neu sprechen (gleiche Stimme, optional neue Regie/Emotion/Text) → Zeile wird zur Vertonung markiert; „Neu vertonen" startet. */
export const POST = mitSitzung<Ctx>('redaktion', async ({ req, s, ctx }) => {
  const { id, nr } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  if (!['fertig', 'fertig_mit_hinweisen', 'freigabe'].includes(b.status)) throw new ApiFehler(409, 'status', 'status')
  const d = await koerper(req, z.object({ text: z.string().trim().min(1).max(600).optional(), regie: z.string().max(300).optional(), emotion: z.enum(EMOTIONEN).optional() }))
  const zeile = await prisma.zeile.findFirst({ where: { beitrag_id: id, nr: Number(nr) } })
  if (!zeile) throw new ApiFehler(404, 'nicht_gefunden', 'nicht_gefunden')
  await prisma.zeile.update({ where: { id: zeile.id }, data: {
    audio: null, text: d.text ?? zeile.text, regie: d.regie ?? zeile.regie, emotion: d.emotion ?? zeile.emotion,
    ...(d.text && d.text !== zeile.text ? { fakt_ids: [], befunde: [{ art: 'von_hand', text: 'von_hand', hart: false }] } : {}),
  } })
  return NextResponse.json({ ok: true })
})
