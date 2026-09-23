import { prisma } from '@/lib/db'

export async function protokoll(a: { mandant_id?: string | null; nutzer_id?: string | null; aktion: string; ziel_typ?: string; ziel_id?: string; daten?: object; ip_hash?: string }) {
  await prisma.protokoll.create({ data: { ...a, daten: a.daten ?? undefined } }).catch(e => console.error('protokoll', e))
}
