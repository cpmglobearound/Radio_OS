import { NextResponse } from 'next/server'
import { FORMATE } from '@/lib/formate'
import { AUSGABESPRACHEN } from '@/lib/sprachen'
import { REGLER, VORLAGEN, EMOTIONEN } from '@/lib/tonalitaet'
import { THEMENGEBIETE } from '@/lib/themen'

/** Kataloge aus je EINER Stelle (formate, sprachen, tonalität, themen). */
export function GET() {
  return NextResponse.json({ formate: FORMATE, sprachen: AUSGABESPRACHEN.filter(s => s.aktiv), tonalitaet: { regler: REGLER, vorlagen: VORLAGEN, emotionen: EMOTIONEN }, themen: THEMENGEBIETE })
}
