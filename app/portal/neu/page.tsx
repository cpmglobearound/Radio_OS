import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { aktuelleSitzung, darf } from '@/lib/konto/sitzung'
import { uiSprache } from '@/lib/i18n'
import assistentTexte from '@/lib/i18n/texte/assistent'
import startTexte from '@/lib/i18n/texte/start'
import Assistent from '@/components/assistent/Assistent'

export async function generateMetadata(): Promise<Metadata> {
  return { title: assistentTexte[await uiSprache()].meta.titel }
}

/** Assistent „Neuer Beitrag" — nur Redaktion und höher. `?von={beitrag_id}` übernimmt die Einstellungen eines früheren Beitrags. */
export default async function NeuerBeitragSeite({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const s = await aktuelleSitzung()
  if (!s) redirect('/anmelden')
  if (!darf(s.rolle, 'redaktion')) redirect('/portal')
  const sprache = await uiSprache()
  const t = assistentTexte[sprache]
  const roh = (await searchParams).von
  const von = typeof roh === 'string' && /^[\w-]{1,64}$/.test(roh) ? roh : null

  return (
    <div className="grid min-w-0 gap-6">
      <header className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{t.kopf.titel}</h1>
        <p className="mt-2 max-w-2xl text-leise">{t.kopf.text}</p>
      </header>
      <Assistent t={t} formatNamen={startTexte[sprache].formate.namen} von={von} />
    </div>
  )
}
