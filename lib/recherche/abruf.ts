import { spawn } from 'node:child_process'
import dns from 'node:dns/promises'
import net from 'node:net'
import path from 'node:path'
import { prisma } from '@/lib/db'
import { hash } from '@/lib/krypto'

const PYTHON = process.env.SCRAPLING_PYTHON || '/opt/klarframe-radio/venv/bin/python'
const SKRIPT = path.join(process.cwd(), 'lib/recherche/abruf.py')

export interface Abgerufen { url: string; titel?: string; datum?: string; sprache?: string; seite?: string; text?: string; fehler?: string }

/** SSRF-Schutz (14 §6): keine internen Adressen. */
function intern(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
  }
  const x = ip.toLowerCase()
  return x === '::1' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe80') || x.startsWith('::ffff:127.') || x === '::'
}
export async function adresseErlaubt(url: string) {
  try {
    const u = new URL(url)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    if (u.port && !['80', '443', ''].includes(u.port)) return false
    const ips = await dns.lookup(u.hostname, { all: true })
    return ips.length > 0 && !ips.some(i => intern(i.address))
  } catch { return false }
}

/** Normalisierte URL ohne Tracking-Parameter (Entdoppeln, 05 §3). */
export function normUrl(url: string) {
  try {
    const u = new URL(url); u.hash = ''
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|mc_|ref$|ocid)/i.test(k)) u.searchParams.delete(k)
    return u.toString()
  } catch { return url }
}

/** Ruft Seiten über Scrapling ab (robots.txt, Höflichkeit je Domain) und legt sie als Dokument ab (6 h Zwischenspeicher). */
export async function abrufen(urls: string[]): Promise<(Abgerufen & { dokument_id?: string })[]> {
  const eindeutig = [...new Set(urls.map(normUrl))]
  const ergebnisse: (Abgerufen & { dokument_id?: string })[] = []
  const offen: string[] = []
  for (const u of eindeutig) {
    if (!(await adresseErlaubt(u))) { ergebnisse.push({ url: u, fehler: 'adresse_gesperrt' }); continue }
    const d = await prisma.dokument.findUnique({ where: { url_hash: hash(u) } })
    if (d && d.abgerufen_am > new Date(Date.now() - 6 * 3600_000)) ergebnisse.push({ url: u, titel: d.titel ?? undefined, text: d.text, sprache: d.sprache ?? undefined, dokument_id: d.id, datum: d.veroeffentlicht_am?.toISOString() })
    else offen.push(u)
  }
  if (offen.length) {
    const roh = await new Promise<string>((resolve, reject) => {
      const p = spawn(PYTHON, [SKRIPT], { stdio: ['pipe', 'pipe', 'pipe'] })
      let out = ''; p.stdout.on('data', c => (out += c))
      const timer = setTimeout(() => p.kill('SIGKILL'), 180_000)
      p.on('close', () => { clearTimeout(timer); resolve(out) }); p.on('error', reject)
      p.stdin.end(JSON.stringify({ urls: offen }))
    })
    for (const zeile of roh.split('\n').filter(Boolean)) {
      let e: Abgerufen
      try { e = JSON.parse(zeile) } catch { continue }
      if (e.fehler || !e.text) { ergebnisse.push(e); continue }
      const datum = e.datum && !isNaN(Date.parse(e.datum)) ? new Date(e.datum) : null
      const d = await prisma.dokument.upsert({
        where: { url_hash: hash(e.url) },
        create: { url: e.url, url_hash: hash(e.url), titel: e.titel?.slice(0, 500), sprache: e.sprache?.slice(0, 10), veroeffentlicht_am: datum, text: e.text, text_hash: hash(e.text) },
        update: { titel: e.titel?.slice(0, 500), text: e.text, text_hash: hash(e.text), abgerufen_am: new Date(), veroeffentlicht_am: datum },
      })
      ergebnisse.push({ ...e, dokument_id: d.id })
    }
  }
  return ergebnisse
}

/** Eigene Texte des Kunden als Dokument ablegen (Beleg-Grundlage wie eine Webseite). */
export async function textAlsDokument(text: string, titel: string, mandantId: string) {
  const url = `eigener-text://${mandantId}/${hash(text).slice(0, 16)}`
  return prisma.dokument.upsert({
    where: { url_hash: hash(url) }, create: { url, url_hash: hash(url), titel, text, text_hash: hash(text) }, update: { abgerufen_am: new Date() },
  })
}
