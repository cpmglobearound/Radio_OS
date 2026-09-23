import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mitSitzung, koerper, ApiFehler } from '@/lib/api'
import { abrufen } from '@/lib/recherche/abruf'
import { rate } from '@/lib/rate'

/** Webseite testweise abrufen und den gelesenen Text zeigen (11 §2 „Quelle abrufen"). */
export const POST = mitSitzung('redaktion', async ({ req, s }) => {
  if (!(await rate('quelle_test', s.mandant!.id, 60, 3600))) throw new ApiFehler(429, 'zu_viele', 'zu_viele')
  const d = await koerper(req, z.object({ url: z.string().url().max(2000) }))
  const [r] = await abrufen([d.url])
  return NextResponse.json({ ok: !r?.fehler, fehler: r?.fehler ?? null, titel: r?.titel ?? null, auszug: r?.text?.slice(0, 1500) ?? null, zeichen: r?.text?.length ?? 0 })
})
