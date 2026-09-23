# 02 — Architektur

## 1. Überblick

```
                        radio.klarframe.com (Nginx, TLS)
                                   │
          ┌────────────────────────┼─────────────────────────┐
          │                        │                         │
   Portal + API (Next.js)    Stream-Ausgang (Icecast)   Feeds/Downloads (signierte URLs)
          │                        ▲                         ▲
          ▼                        │                         │
     PostgreSQL  ◄──────── Warteschlange (pg-boss) ─────────┤
          ▲                        │                         │
          │         ┌──────────────┼───────────────┬─────────┴──────────┐
          │         ▼              ▼               ▼                    ▼
          │   Arbeiter        Arbeiter         Arbeiter            Arbeiter
          │   RECHERCHE       REDAKTION        PRODUKTION          AUSLIEFERUNG
          │   (Suche, Feeds,  (Themen,         (Stimmen, Nach-     (SFTP, S3, Webhook,
          │    Abruf, Fakten)  Drehbuch,        hören, Schnitt,     Playout, Feed,
          │                    Prüfung)         Lautheit, MP3)      Stream-Einspielung)
          │                                            │
          └─────────────── Objektspeicher (S3-kompatibel) ◄┘  Audio, Zwischenstände
                                   │
                         Zeitplaner (jede Minute): fällige Sendungen → Aufträge
```

## 2. Server

- **Eigener Server**, getrennt von Voice OS, CALL4ME, Social (Regel 12).
  Vorschlag: Hetzner Cloud, Standort Nürnberg oder Falkenstein (EU, DSGVO),
  Größe zum Start 8 vCPU (dediziert) / 32 GB RAM / 240 GB — Schnitt und
  Spracherkennung laufen auf der CPU, Stimmen und Texte bei den Anbietern.
- Ubuntu 24.04 LTS, automatische Sicherheitsupdates **mit Ausnahme** der
  Dienste von Radio OS für automatische Neustarts (Lehre Voice OS: ein
  Updatelauf hat alle laufenden Dienste mitten am Tag neu gestartet). Neustarts
  der Arbeiter nur, wenn keine Produktion läuft (Arbeiter beenden sich sauber
  nach dem laufenden Schritt; siehe 13).
- DNS: `radio.klarframe.com` → Server. Optional `stream.radio.klarframe.com`
  für Icecast, `cdn.radio.klarframe.com` für Downloads (später CDN).
- SSH nur mit Schlüssel, kein Root-Login mit Passwort, Firewall: 22 (nur
  bekannte Adressen), 80, 443, 8000 (Icecast, falls nicht hinter Nginx).

## 3. Technikwahl (bewusst wie Voice OS, damit dasselbe Team es pflegen kann)

| Teil | Wahl | Warum |
|---|---|---|
| Portal + API | **Next.js 16** (App Router), React 19, TypeScript streng | wie Voice OS; eine Codebasis für Seiten und Schnittstellen |
| Oberfläche | Tailwind 4, shadcn/ui, `motion` | wie Voice OS; Klarframe-Stil |
| Datenbank | **PostgreSQL 16** + **Prisma 6** | wie Voice OS; Migrationen versioniert |
| Warteschlange | **pg-boss** (auf derselben PostgreSQL) | kein zusätzlicher Dienst (kein Redis), Aufträge überleben Neustarts, Wiederholungen eingebaut |
| Arbeiter | Node 22, eigene systemd-Dienste je Arbeiterart | getrennt neu startbar, eigene Speichergrenzen (cgroup) |
| Sprachmodelle (Text) | Vercel AI SDK (`ai` v6) mit OpenAI als Standard; Anbieter austauschbar | wie Voice OS |
| Stimmen | eigene Anbieterschicht (siehe 07) | viele Anbieter, eine Schnittstelle |
| Spracherkennung (Nachhören) | OpenAI `gpt-4o-transcribe` (Standard), austauschbar | in der Demo bewährt |
| Audio | **ffmpeg 7** (statisch gebaut, fest eingecheckte Version im Server-Setup, nicht im Repo) | Schnitt, Lautheit (EBU R128), Formate |
| Abruf von Webseiten | `fetch` + Readability; **Playwright/Chromium** nur, wo nötig | JS-Seiten; Speicher schonen |
| Suche | Anbieterschicht: Brave Search API (Standard), weitere austauschbar | freie Suchquellen halten nur wenige Anfragen durch (CALL4ME-Erfahrung) |
| Objektspeicher | S3-kompatibel (Hetzner Object Storage) | Audio wächst schnell; Server-Platte bleibt klein |
| Stream | **Icecast 2** + **Liquidsoap** | Standard im Radio; Liquidsoap spielt Programmpläne ab |
| E-Mail | SMTP (eigener Absender `radio@klarframe.com`) | Bestätigungen, Berichte, Alarme |
| Zahlungen | **Stripe** (Abos, Einmalkäufe, Rechnungen, Steuer) | siehe 10 |
| Überwachung | eigene `/api/health` + Wächter-Timer + Mail-Alarm | Muster aus Voice OS (siehe 13) |

## 4. Die Produktionsstrecke als Auftragskette

Ein Beitrag durchläuft feste **Stufen**. Jede Stufe ist ein eigener Auftrag in
der Warteschlange, schreibt ihr Ergebnis in die Datenbank/den Speicher und
stößt die nächste an. Fällt ein Schritt aus, wird **nur dieser** wiederholt.

| Stufe | Auftrag | Ergebnis | Wiederholung |
|---|---|---|---|
| 1 | `recherche.sammeln` | Quellen + Fakten (mit Herkunft) | 3×, dann Beitrag „Recherche fehlgeschlagen" |
| 2 | `redaktion.themen` | Themenauswahl + Blickwinkel | 3× |
| 3 | `redaktion.drehbuch` | Drehbuch (JSON, Zeilen mit Sprecher/Regie) | 3× |
| 4 | `redaktion.pruefen` | Faktenprüfung + Sprachprüfung, Befunde | 2×; bei harten Befunden zurück zu 3 (höchstens 2 Runden) |
| (4b) | *Freigabe durch Redakteur* | falls für die Sendung verlangt: Pause bis „Vertonen" | — |
| 5 | `produktion.zeile` (je Zeile, parallel) | geprüfte Audiodatei je Zeile | bis 4 Versuche je Zeile (siehe 08) |
| 6 | `produktion.schnitt` | fertiges Master-WAV + MP3 + Kapitelmarken | 2× |
| 7 | `produktion.abnahme` | Endkontrolle (Länge, Lautheit, Stille, Wortvergleich ganzes Stück) | — |
| 8 | `auslieferung.*` (je Ziel) | Nachweis der Zustellung je Ziel | 5× mit wachsendem Abstand, dann Alarm |

Regeln:
- **Idempotent:** Jeder Auftrag trägt `beitrag_id` + `stufe` + `versuch`. Ein
  doppelt gestarteter Auftrag erkennt, dass sein Ergebnis schon da ist.
- **Zwischenstände bleiben** 30 Tage (Zeilen-Audio, Rohdaten der Recherche),
  damit „nur Zeile 12 neu sprechen" ohne Neuproduktion geht.
- **Parallelität** je Anbieter begrenzt (z. B. höchstens 6 gleichzeitige
  Stimm-Aufrufe je Anbieterschlüssel), sonst drosseln die Anbieter.
- **Fortschritt** jeder Stufe wird in `Produktion.fortschritt` geschrieben; das
  Portal zeigt ihn live (Server-Sent Events).

## 5. Ordnerstruktur (Vorschlag)

```
app/                 Next.js-Seiten und API-Routen
  (oeffentlich)/     Startseite, Preise, Anmeldung, Registrierung, Rechtliches
  portal/            angemeldeter Bereich
  admin/             Klarframe-Admin
  api/               Schnittstellen (siehe 12)
lib/
  formate.ts         EINE Stelle für Formate
  tonalitaet.ts      EINE Stelle für Tonalitätsregler
  sprachen.ts        EINE Stelle für Sprachen/Varianten
  tarife.ts          Tarifregeln (Preise kommen aus der Datenbank)
  recherche/         Suche, Feeds, Abruf, Extraktion, Fakten
  redaktion/         Themen, Drehbuch, Prüfung, Prompts
  stimmen/           Anbieterschicht, Katalog, Aussprache
  produktion/        Zeile sprechen, Nachhören, Schnitt, Lautheit
  auslieferung/      Download, Feed, Stream, Konnektoren
  abrechnung/        Guthaben, Reservierung, Stripe
  mandant/           Konten, Rechte, Löschen
arbeiter/            Einstiegspunkte der Arbeiterdienste
prisma/              Schema + Migrationen
scripts/             Prüfskripte (siehe 15), Wartung
deploy/              systemd-Einheiten, Nginx, Icecast, Liquidsoap
docs/                dieser Plan
```
