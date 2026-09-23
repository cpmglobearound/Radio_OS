# 01 — Produkt und Pakete

## 1. Die Grundbegriffe (so heißen sie überall — Code, Oberfläche, API)

| Begriff | Bedeutung | Beispiel |
|---|---|---|
| **Mandant** | Ein Kunde (Sender, Firma, Agentur). Alles gehört genau einem Mandanten. | „Radio Costa Blanca" |
| **Sendung** (engl. `show`) | Eine wiederkehrende Reihe mit festen Einstellungen: Format, Sprache, Stimmen, Tonalität, Themen, Region, Länge, Zeitplan, Auslieferung. | „Inselfunk am Morgen", werktags 7:00, 4 Minuten |
| **Beitrag** (engl. `episode`) | Ein einzelnes fertiges Stück Audio einer Sendung oder ein Einzelauftrag. | „Inselfunk 24.09.2026" |
| **Themenblock** (engl. `block`) | Ein Abschnitt innerhalb eines Beitrags zu einem Thema. Ein Beitrag hat 1–n Blöcke. | „Mieten", „Wetter", „Veranstaltungen" |
| **Format** | Die Machart: wie viele Stimmen, welcher Aufbau, welche Regeln. | Nachrichten, Zwiegespräch, Glosse … |
| **Tonalität** | Wie es klingt: Humor, Lachen, Ernst, Wärme, Tempo, Sprache der Hörer. | „ernst aber humorvoll" |
| **Minuten** | Die Abrechnungseinheit: Sekunden fertigen Audios, auf die Sekunde genau. | 3:13 min = 193 s |
| **Auslieferung** | Wohin ein fertiger Beitrag geht. | Download, Stream, Feed, Konnektor |

## 2. Was der Kunde tun kann

### 2.1 Einzelauftrag „Themenblock erzeugen" (sofort)

1. Thema eingeben **oder** aus Vorschlägen wählen (die Recherche schlägt
   aktuelle Themen zu Land, Ort und Themengebiet vor, siehe 05).
2. Einstellungen wählen: Format, Sprache (+ Variante), Stimme(n), Tonalität,
   **Ziellänge in Minuten**.
3. Die Plattform zeigt **vor dem Start**: geschätzte Länge, die dafür
   reservierten Minuten, das verbleibende Guthaben danach.
4. „Erzeugen" → Fortschritt live (Recherche → Drehbuch → Prüfung → Stimmen →
   Schnitt). Dauer typischerweise 1–4 Minuten.
5. Optional **Drehbuch vorher freigeben** (Einstellung je Sendung): Die
   Produktion hält nach dem Drehbuch an, der Redakteur liest, ändert einzelne
   Zeilen oder lässt neu schreiben, dann „Vertonen".
6. Ergebnis anhören, Zeile für Zeile nachbessern („diese Zeile neu sprechen",
   „diese Zeile umschreiben"), herunterladen (MP3/WAV) oder ausliefern.

### 2.2 Sendung mit Zeitplan (automatisch)

Eine Sendung produziert selbstständig nach Zeitplan, z. B.
- Nachrichten **stündlich** 6–22 Uhr, 90 Sekunden, Ortsbezug Alicante,
- Podcast **wöchentlich** Montag 6 Uhr, 12 Minuten, zwei Stimmen,
- Ladenfunk **täglich** 5 Uhr, 20 Durchsagen + 6 Themenbeiträge.

Jeder Lauf prüft vorher das Guthaben (Sperre statt Nachberechnung) und liefert
über die eingestellten Wege aus. Zeitzone kommt aus der Sendung (Standard:
Zeitzone des Mandanten), **nie** aus dem Server.

### 2.3 Programm-Stream (Firmen)

Aus einer oder mehreren Sendungen plus eigenen Klängen entsteht ein
durchgehender Stream (Ladenfunk, Hotelradio). Siehe 09.

### 2.4 Individuelle Konnektoren (auf Anfrage)

Für Sender: direkte Lieferung ins Playout (mAirList, RCS Zetta/GSelector,
WideOrbit, DAVID/DigaSystem, Radioboss, SAM Broadcaster, Myriad u. a.) per
Ordner-Übergabe (SFTP), API oder Datenbankformat. Standard-Konnektoren sind
selbst einstellbar (SFTP, S3, Webhook, Feed); **angepasste** Konnektoren richtet
Klarframe ein (Einrichtungspreis + Monatsbetrag). Siehe 09.

## 3. Die Formate (eine Stelle: `lib/formate.ts`)

| Kennung | Name | Stimmen | Aufbau | Typische Länge |
|---|---|---|---|---|
| `nachrichten` | Nachrichten | 1 | 3–6 Meldungen, neutral, keine Meinung, Quellenlage klar | 1–3 min |
| `wetter` | Wetter | 1 | Wetterdaten des Ortes, lebendig erzählt | 0:30–1 min |
| `themenblock` | Themenbeitrag | 1 | Ein Thema erklärt, Einstieg–Kern–Ausblick | 1–5 min |
| `zwiegespraech` | Podcast / Zwiegespräch | 2 | Zwei Moderatoren im Gespräch, Rollen, Reaktionen, Pointen | 3–30 min |
| `magazin` | Magazin | 1–3 | Mehrere Themenblöcke mit Überleitungen, An- und Abmoderation | 5–30 min |
| `glosse` | Glosse / Comedy | 1–3 | Zugespitzte, humorvolle Betrachtung eines echten Themas | 1–4 min |
| `interview` | Interview-Stil | 2–3 | Fragender und Experte (KI, gekennzeichnet), Fakten aus Quellen | 3–15 min |
| `moderation` | Moderation zwischen Titeln | 1 | Kurze An-/Absagen passend zu einer vom Sender gelieferten Titelliste | je 10–40 s |
| `durchsage` | Durchsage / Ansage | 1 | Kurze Hinweise, Angebote, Öffnungszeiten (Firmen) | 10–40 s |
| `veranstaltungen` | Veranstaltungstipps | 1–2 | Termine der Region aus Quellen | 1–3 min |
| `tagesbriefing` | Tagesbriefing | 1 | Persönliche Themenauswahl, kompakt | 3–8 min |
| `talkrunde` | Talkrunde / Pro & Contra | 3 | Moderation führt, zwei Gäste mit verschiedenen Standpunkten | 5–60 min |

Sprecherzahl 1, 2 oder 3 je Format: siehe **[18 — Ein, zwei, drei Sprecher](18-sprecher-1-2-3.md)**.

Neue Formate kommen **nur** in `lib/formate.ts` dazu; Oberfläche, Preisrechnung,
Drehbuchregeln und Prüfungen fragen dort nach.

## 4. Pakete und Preise

Alle Preise, Abos, Einzelbeiträge (5 min, 10 min … bis 60 min und mehr),
Nachkauf und Zusätze stehen in **[17 — Preise](17-preise.md)**. Hier nur die
Regeln, die das Produkt prägen:

- **Länge vorher wählen:** Vor jedem Start stehen Stufe, Preis bzw.
  reservierte Minuten fest.
- **Zwei Stimmen** kosten nicht doppelt — abgerechnet wird die Länge des
  fertigen Audios.
- **Premiumstimmen** verbrauchen einen Faktor (Vorschlag 1,5), vor dem Start angezeigt.
- **Nicht abgerechnet** werden: Testhören einzelner Stimmen, fehlgeschlagene
  Produktionen, Neusprechen durch die automatische Prüfung.
- **Probe:** 10 Probeminuten; Probebeiträge im Portal hörbar, **Download,
  Feed, Stream und Konnektoren erst nach der Bestellung** (dieselbe Regel wie
  Link/Widget im Voice OS). Probebeiträge enden mit „Eine Hörprobe von
  Klarframe Radio".
- Monatlich kündbar; Kontingente verfallen am Monatsende (Nachkauf: +1 Monat).

## 5. Kostenmodell (für die Preisprüfung, Admin-Ansicht)

Jede Produktion protokolliert ihre echten Kosten je Schritt:
`recherche_eur` (Suche, Abrufe), `text_eur` (Sprachmodell-Tokens für Themen,
Drehbuch, Prüfung), `stimme_eur` (je Anbieter: Zeichen oder Audio-Tokens),
`nachhoeren_eur` (Spracherkennung), `neusprech_anteil` (Kosten der Wiederholungen).
Die Admin-Übersicht zeigt **Kosten je fertiger Minute** je Format, Sprache und
Anbieter — Grundlage für Preise und Stimmklassen-Faktoren. Kunden sehen diese
Zahlen nie (Betriebsinterna, Marge).
