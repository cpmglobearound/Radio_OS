import crypto from 'node:crypto'

export const zufall = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url')
export const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

function geheimnis(name: 'SITZUNG_GEHEIMNIS' | 'DATEN_SCHLUESSEL') {
  const v = process.env[name]
  if (!v || v.length < 32) throw new Error(`${name} fehlt oder ist zu kurz`)
  return v
}

export function signieren(wert: string) {
  const sig = crypto.createHmac('sha256', geheimnis('SITZUNG_GEHEIMNIS')).update(wert).digest('base64url')
  return `${wert}.${sig}`
}
export function pruefeSignatur(signiert: string): string | null {
  const i = signiert.lastIndexOf('.')
  if (i < 1) return null
  const wert = signiert.slice(0, i)
  const erwartet = signieren(wert)
  const a = Buffer.from(erwartet), b = Buffer.from(signiert)
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? wert : null
}

/** AES-256-GCM für Zugangsdaten der Kunden (14 §5). */
export function verschluesseln(klartext: string) {
  const key = Buffer.from(geheimnis('DATEN_SCHLUESSEL'), 'hex')
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key, iv)
  const daten = Buffer.concat([c.update(klartext, 'utf8'), c.final()])
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), daten.toString('base64url')].join(':')
}
export function entschluesseln(s: string) {
  const [v, iv, tag, daten] = s.split(':')
  if (v !== 'v1') throw new Error('Unbekanntes Format')
  const key = Buffer.from(geheimnis('DATEN_SCHLUESSEL'), 'hex')
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'))
  d.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([d.update(Buffer.from(daten, 'base64url')), d.final()]).toString('utf8')
}
