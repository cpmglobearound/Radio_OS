import fs from 'node:fs/promises'
import path from 'node:path'
import { preisKatalog, preisPlatzhalter } from '@/lib/abrechnung/katalog'

// llms-full.txt für KI-Modelle — Preise aus dem Katalog (eine Stelle), Vorlage in seo/llms-full.txt.
export const dynamic = 'force-dynamic'
export async function GET() {
  const vorlage = await fs.readFile(path.join(process.cwd(), 'seo/llms-full.txt'), 'utf8')
  const w = preisPlatzhalter(await preisKatalog(), 'en')
  return new Response(vorlage.replace(/\{(einzel|einzel_min|abo|abo_min|probe_min|max_min)\}/g, (_, k: string) => w[k] ?? ''), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}
