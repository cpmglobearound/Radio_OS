# Changelog — Klarframe Radio

## 2026-09-23 — Erster Stand (live auf radio.klarframe.com)

- Plattform nach Bauplan (docs/00–18): Next.js 16, PostgreSQL/Prisma, Warteschlange (pg-boss), Arbeiter-Dienst.
- Konten: Registrierung (10 Probeminuten), E-Mail-Bestätigung, Passwort- und Link-Anmeldung, Passwort vergessen, Konto löschen; DE/EN/ES.
- Produktion: drei Eingabewege (eigene Texte, Webseiten per Scrapling, KI-Recherche über OpenAI-Websuche + Kimi), Fakten mit Beweispflicht,
  Drehbuch mit Emotion je Zeile, Prüfungen (Belege, Taktregel, KI-Kennung, Übernahme, Sprecheranteile), Überarbeiten per Prompt,
  Stimmen über drei Anbieter (GPT-Audio, GPT-Live inkl. Gleam, Sprachausgabe), Nachhören je Zeile mit bis zu 4 Versuchen,
  Schnitt mit Lautheitsnorm und Kapitelmarken; lange Beiträge bis 60 Minuten (Themenplan, blockweises Drehbuch, Schnitt in Etappen).
- Portal: Assistent „Neuer Beitrag", Beitragsansicht mit Player und Drehbuch-Editor, Stimmenkatalog, Minutenzähler, Kontobuch,
  Admin: Stimmenfreigabe, Bestellungen (per E-Mail, Freischalten nach Zahlung).
- Startseite (Framer Motion, Three.js), Preise aus dem Katalog (mind. 75 % Marge, docs/17 §8), Rechtsseiten, sitemap/robots/llms.txt.
- Betrieb: `scripts/bauen.sh` (Ausrollen ohne Ausfall mit automatischem Rückfall), `/api/health`.
- Prüfskripte: `scripts/matrix-pruefen.ts` (9 Kombinationen, alle grün), `scripts/produktion-pruefen.ts`.
