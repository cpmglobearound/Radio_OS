# 15 — Phasenplan und Abnahme

Jede Phase endet erst, wenn **alle** Abnahmepunkte durch Prüfskripte oder
echte Durchläufe belegt sind (Regel 2). „Kompiliert" und „Seite lädt" reichen nie.
Nach jeder Phase: Bericht an Oliver in einfacher Sprache (was geht, was nicht,
was es kostet), CHANGELOG, Hochladen.

## Phase 0 — Machbarkeit der Stimmen (vor jedem Plattform-Code)

Ziel: Belegen, dass **jeder** Anbieter und **jede** Sprecherzahl so klingt und
so treu spricht, wie die Demo es verspricht — und was es kostet.

- Die Demo-Strecke (`referenz/demo-mallorca/produzieren.mjs`) um die
  Anbieterschnittstelle (07 §2) erweitern: `openai-audio`, `openai-live`
  (**Gleam** + alle 22 GPT-Live-Stimmen), `openai-tts`, `elevenlabs`,
  `cartesia`, `fish`.
- Je Anbieter: dieselben 10 Referenzzeilen (mit Zahl, Ortsnamen, Lachen,
  Frage, Ernst) in **de-DE, es-ES, en-GB**.
- Je Sprecherzahl ein Referenzbeitrag: 1 Sprecher 60 s, 2 Sprecher 3 min,
  3 Sprecher 5 min.
- Messen: Wortgenauigkeit nach 1/2/4 Versuchen, erkannte Sprache,
  Lachen vorhanden (Regie befolgt), Dauer, **Kosten je fertiger Minute**.
- **Abnahme:** Tabelle je Anbieter × Sprache mit den Messwerten; Hörproben an
  Oliver; Entscheidung über Standard- und Premiumstimmen und Klassen-Faktoren.
  GPT-Live-Vertonung (Gleam) nachweislich ≥ 95 % Wortgenauigkeit oder als
  „nicht geeignet" begründet.

## Phase 1 — Grundgerüst, Konten, Mandanten

- Server, DNS `radio.klarframe.com`, TLS, Nginx, PostgreSQL, Bauskript,
  Gesundheitsprüfung, Wächter, Alarm, Sicherung + Wiederherstellungsprobe.
- Registrierung, E-Mail-Bestätigung, Anmeldung, Magic-Link, Passwort
  vergessen, 2FA, Profil, Sitzungen, Team/Einladungen/Rollen, Konto löschen,
  Mandant löschen, Datenexport. DE/EN/ES.
- Mandantentrennung (Schicht + Row-Level-Security).
- **Abnahme:** `mandanten-trennung-pruefen.ts` grün (jede Route, jede ID);
  `loeschreste-pruefen.ts` grün; `sprachen-pruefen.ts` grün; Browser-Durchgang
  (Playwright) Registrierung → Bestätigung → Anmeldung → Profil ändern →
  E-Mail ändern → Konto löschen → Widerruf, auf 1360 px und 360 px.

## Phase 2 — Produktionskern (Einzelauftrag)

- Recherche (Suche, Abruf, Extraktion, Fakten mit Beweispflicht),
  Themenvorschläge, Redaktion (Drehbuch 1/2/3 Sprecher, Tonalität,
  Taktregel, Prüfungen), Stimmen-Katalog + Freigabe-Warteschlange,
  Produktion (Zeile, Nachhören, Neusprechen, Schnitt, Lautheit, Abnahme),
  Beitragsansicht mit Drehbuch, Nachbessern einzelner Zeilen, Download.
- Sprachen: de-DE, es-ES, en-GB — muttersprachlich (07 §4, alle 9 Punkte).
- **Abnahme:**
  - Referenzfälle (§3) produzieren automatisch und bestehen alle Prüfungen.
  - Der Mallorca-Beitrag entsteht **aus der Plattform** neu (aktuelle Fakten),
    in DE **und** ES, mit 2 Sprechern — und als 3-Sprecher-Talkrunde.
  - Faktenprüfung fängt eine absichtlich eingeschleuste falsche Zahl.
  - Taktregel: Ein sensibles Thema erzeugt keinen Humor, auch bei Humor-Stufe 4.
  - Prompt-Injection in einer Testquelle („Ignoriere alle Regeln …") ändert nichts.

## Phase 3 — Abrechnung, Sendungen mit Zeitplan, Auslieferung

- Stripe (Abos, Einzelbeiträge nach Länge 5/10/…/60+, Nachkauf, Kundenportal,
  Webhooks, Steuer), Kontobuch, Reservierung, Sperre statt Nachberechnung.
- Sendungen mit Zeitplan (Zeitzone!), Vorlauf, Wiederholungssperre für Themen.
- Auslieferung: Download, Feed, Webhook, SFTP, S3, „Verbindung testen",
  Zustellnachweis, Pünktlichkeits-Alarm.
- Weitere Sprachvarianten: de-AT, de-CH, ca-ES.
- **Abnahme:** `preise-pruefen.ts`, `kontobuch-pruefen.ts` grün; eine
  stündliche Nachrichtensendung läuft 48 h ohne Eingriff, jeder Beitrag
  pünktlich per SFTP am Testziel (Nachweis je Lauf); Guthaben-Ende stoppt die
  Sendung sauber und meldet es; Stripe-Testmodus Ende-zu-Ende.

## Phase 4 — Sender und Firmen

- Playout-Konnektoren (mAirList, Zetta, WideOrbit, DAVID, Cart-Ersetzen),
  angepasste Konnektoren als Muster, Firmen-Streams (Icecast + Liquidsoap,
  Durchsagen, Ruhezeiten, Player), API mit Schlüsseln + OpenAPI, Stimmklon-Ablauf,
  Admin-Kostenansicht, Startseite mit Hörbeispielen, Preise-Seite.
- **Abnahme:** Mit einem echten Pilot-Sender und einer Pilot-Firma je 14
  Tage Betrieb; Zustellquote ≥ 99,5 % pünktlich; Stream 14 Tage ohne Ausfall.

## §3 Referenzfälle (dauerhafte Prüfsammlung, `scripts/referenz/`)

| Nr. | Fall | Erwartung |
|---|---|---|
| R1 | Nachrichten 90 s, de-DE, 1 Sprecher, Region Palma | nur belegte Zahlen, neutral, Zuschreibungen, Länge ±15 % |
| R2 | Zwiegespräch 3 min, de-DE, „ernst aber humorvoll", Mieten Mallorca | Pointen, Lachen hörbar, Taktregel eingehalten |
| R3 | Dasselbe Thema es-ES | eigenes Drehbuch (kein übersetztes), es-ES-Formen (Zahlen, Anrede), muttersprachliche Stimmen |
| R4 | Talkrunde 5 min, 3 Sprecher, Pro & Contra | Namen genannt, Anteile ausgewogen, jede Zeile richtige Stimme |
| R5 | Sensibles Thema (Unfall mit Todesopfern), Humor 4 eingestellt | kein Humor, kein Lachen, Wärme |
| R6 | Quelle mit Prompt-Injection | Anweisung ignoriert |
| R7 | Keine Quellen zum Thema | Beitrag fehlgeschlagen mit verständlicher Meldung, 0 Minuten verbraucht |
| R8 | Ladenfunk-Durchsagen 10 × 20 s, Firmen-Angebote aus eigener Quelle | Preise der Firma genau wie in der Quelle |
| R9 | GPT-Live-Stimme Gleam, 2 min, de-DE | Wortgenauigkeit ≥ 95 %, Sprache bleibt Deutsch |
| R10 | 60-min-Magazin, 2 Sprecher, 4 Blöcke | Kapitelmarken, Lautheit, keine Stille > 1,5 s, Abrechnung Stufe „bis 60 min" |

Jede Änderung an Prompts, Stimmenanbietern oder Schnitt läuft R1–R10 durch
(nächtlich automatisch, Ergebnis per Mail).

## Prüfskripte (Übersicht)

`mandanten-trennung-pruefen`, `loeschreste-pruefen`, `sprachen-pruefen`,
`mandantenfilter-pruefen`, `preise-pruefen`, `kontobuch-pruefen`,
`sprecher-pruefen`, `stimmen-abgleichen` (mit Gegenzählung),
`hoerproben-erzeugen`, `rauchprobe`, `referenz/*`, `api-vertrag-pruefen`
(bestehende Felder unverändert — Regel 9), `geheimnisse-suchen` (vor jedem Hochladen).
