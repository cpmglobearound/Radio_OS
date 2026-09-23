import { z } from 'zod'
import { mitSitzung, koerper, ApiFehler } from '@/lib/api'
import { anbietbareStimmen } from '@/lib/stimmen/katalog'
import { anbieterFuer } from '@/lib/stimmen/anbieter'
import { rate } from '@/lib/rate'
import { prisma } from '@/lib/db'

/** „Mit meinem Text anhören" (07 §3): bis 200 Zeichen, kostenlos bis N Proben/Tag je Mandant. */
export const POST = mitSitzung<{ params: Promise<{ id: string }> }>('redaktion', async ({ req, s, ctx }) => {
  const { id } = await ctx.params
  const d = await koerper(req, z.object({ text: z.string().trim().min(2).max(200), sprache: z.string().max(10), regie: z.string().max(200).optional() }))
  const stimme = (await anbietbareStimmen(d.sprache)).find(x => x.id === decodeURIComponent(id))
  if (!stimme) throw new ApiFehler(404, 'nicht_gefunden', 'nicht_gefunden')
  const max = Number((await prisma.einstellung.findUnique({ where: { schluessel: 'stimmproben_pro_tag' } }))?.wert ?? 20)
  if (!(await rate('stimmprobe', s.mandant!.id, max, 86400))) throw new ApiFehler(429, 'proben_limit', 'proben_limit')
  const { anbieter, stimme: sid } = anbieterFuer(stimme.id)
  const r = await anbieter.sprechen({ text: d.text, sprache: d.sprache, stimme: sid, name: stimme.name, persoenlichkeit: stimme.stil.join(', '), regie: d.regie, sendung: 'Hörprobe', kontext: [], versuch: 1 })
  return new Response(new Uint8Array(r.wav), { headers: { 'content-type': 'audio/wav', 'cache-control': 'no-store' } })
})
