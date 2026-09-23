import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Öffentlich: { ok, version }. Prüft Datenbank, Speicher und Lesbarkeit der Geheimnisse (Lehre Voice OS: Rechte 600 legten alles lahm). */
export async function GET() {
  const pruefungen: Record<string, boolean> = {}
  try { await prisma.$queryRaw`SELECT 1`; pruefungen.datenbank = true } catch { pruefungen.datenbank = false }
  try { await fs.access(process.env.SPEICHER_ORDNER || '/var/lib/klarframe-radio/speicher'); pruefungen.speicher = true } catch { pruefungen.speicher = false }
  pruefungen.geheimnisse = !!process.env.OPENAI_API_KEY && !!process.env.SITZUNG_GEHEIMNIS
  const ok = Object.values(pruefungen).every(Boolean)
  return NextResponse.json({ ok, version: process.env.RADIO_VERSION || 'dev', pruefungen }, { status: ok ? 200 : 503 })
}
