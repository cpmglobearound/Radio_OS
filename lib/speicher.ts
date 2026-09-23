import fs from 'node:fs/promises'
import path from 'node:path'

// Speicher-Schlüssel beginnen mit m/<mandant_id>/… (04 §5). Heute lokale Platte; S3 später über dieselbe Schnittstelle.
const WURZEL = process.env.SPEICHER_ORDNER || '/var/lib/klarframe-radio/speicher'

export function speicherPfad(schluessel: string) {
  const p = path.resolve(WURZEL, schluessel)
  if (!p.startsWith(path.resolve(WURZEL) + path.sep)) throw new Error('Ungültiger Speicherschlüssel')
  return p
}
export async function speichern(schluessel: string, daten: Buffer) {
  const p = speicherPfad(schluessel)
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p + '.tmp', daten); await fs.rename(p + '.tmp', p)
  return schluessel
}
export const lesen = (schluessel: string) => fs.readFile(speicherPfad(schluessel))
export const existiert = (schluessel: string) => fs.access(speicherPfad(schluessel)).then(() => true, () => false)
export async function loeschenPraefix(praefix: string) { await fs.rm(speicherPfad(praefix), { recursive: true, force: true }) }
