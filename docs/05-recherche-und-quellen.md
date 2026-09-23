# 05 — Recherche und Quellen („Scraper")

Ziel: Zu **Land, Orten, Themengebieten und Stichworten** einer Sendung aktuelle,
belegbare Fakten finden — aus Quellen in **jeder** Sprache — und sie so ablegen,
dass jede Aussage im späteren Beitrag auf einen wörtlichen Beleg zurückführbar ist.

## 1. Einstellungen, die die Recherche steuern (je Sendung)

| Einstellung | Werte | Wirkung |
|---|---|---|
| **Land** | jedes Land (ISO) | Quellenauswahl, Zeitzone, Behörden-/Wetterquellen |
| **Orte** | beliebig viele; Suche mit Vorschlägen; Kartenansicht; Radius je Ort (km) | Ortsbezug der Themen, Filter „nur mit Ortsbezug" |
| **Themengebiete** | feste Liste (eine Stelle `lib/themen.ts`): Lokales, Politik, Wirtschaft, Immobilien & Wohnen, Arbeit, Verkehr, Wetter & Klima, Umwelt, Gesundheit, Bildung, Kultur, Veranstaltungen, Sport, Tourismus, Gastronomie, Technik, Wissenschaft, Kurioses, Verbraucher, Recht | Suchbegriffe, Quellenwahl, Einordnung |
| **Stichworte** | frei | zusätzlich gesucht, höher gewichtet |
| **Ausschlüsse** | Themen und Stichworte | nie verwenden |
| **Aktualität** | 6 h · 24 h · 48 h · 7 Tage · egal | Höchstalter der Dokumente |
| **Quellenregel** | nur eigene Quellen · eigene + geprüfte Klarframe-Quellen · + offene Websuche | wie weit gesucht wird |
| **Sperrliste** | Domains | nie benutzen |
| **Eigene Inhalte** | Texte, PDFs, Pressemitteilungen, Website des Kunden, RSS des Kunden | für Firmen oft die Hauptquelle (Angebote, Neuigkeiten) |

## 2. Quellenarten und Reihenfolge

1. **Eigene Quellen des Mandanten** (RSS, Website, hochgeladene Texte/PDF).
2. **Geprüfte Klarframe-Quellen** (`Quelle.mandant_id = null`): je Land und
   Region gepflegte Liste — Nachrichten-Feeds, Rathäuser, Behörden,
   Statistikämter, Veranstaltungskalender, Verkehrsmeldungen. Jede Quelle ist
   von einem Menschen auf Nutzungsbedingungen und `robots.txt` geprüft
   (`erlaubt`, `pruef_notiz`) — Regel 7 gilt sinngemäß auch für Quellen.
3. **Strukturierte Daten statt Seiten, wo es sie gibt:**
   - Wetter: Open-Meteo (weltweit), nationale Dienste (DWD, AEMET, Met Office …) über API.
   - Statistiken: offene Datenportale (Eurostat, INE, Destatis …).
   - Veranstaltungen: Kalender-Feeds (iCal) der Gemeinden, wenn vorhanden.
4. **Websuche** über die Suchanbieterschicht (Standard Brave Search API;
   weitere austauschbar). **Nicht** über freie Suchseiten ohne API — in CALL4ME
   hielten die nur wenige Anfragen durch, dann kamen Sperren.
5. **Abruf** der gefundenen Seiten (§3).

## 3. Abruf und Extraktion

- `fetch` mit eigenem User-Agent `KlarframeRadioBot/1.0 (+https://radio.klarframe.com/bot)`
  und einer erklärenden Seite unter dieser Adresse.
- **`robots.txt` wird befolgt** (zwischengespeichert 24 h). Verbot = kein Abruf.
- **Keine Umgehung von Bezahlschranken, Anmeldungen, Captchas.** Erkennt die
  Extraktion eine Bezahlschranke (Textlänge, Marker), wird das Dokument verworfen.
- Höflichkeit: je Domain höchstens 1 Anfrage / 2 s, höchstens 200 / Tag
  (einstellbar je Quelle); Antwort `429`/`503` → Domain 1 h pausieren.
- Extraktion: Mozilla Readability auf dem HTML; Playwright/Chromium **nur**,
  wenn der Text leer bleibt und die Quelle als „braucht Browser" markiert ist
  (Speicher: ein Browser, Seiten nacheinander, harte Zeitgrenze 20 s).
- PDF: Textextraktion (pdf.js); Bilder werden nicht ausgewertet.
- **Entdoppeln:** `url_hash` (normalisierte URL ohne Tracking-Parameter),
  `text_hash`, zusätzlich Ähnlichkeit (SimHash) — dieselbe Agenturmeldung auf
  20 Seiten zählt als **eine** Quelle, nicht als 20 Bestätigungen.
- **Sprache erkennen**, **Veröffentlichungsdatum** (Metadaten, sonst Text,
  sonst Abrufzeit + Kennzeichen „Datum unsicher").
- **Ortsbezug:** Ortsnamen im Text → Abgleich mit einem Ortsverzeichnis
  (GeoNames-Auszug je Land, lokal in der Datenbank) → Koordinaten → Abstand zu
  den Sendungsorten. Mehrdeutige Namen (z. B. „Santa Ponsa" vs. andere) nur
  mit Landkontext.
- **Themen-Einordnung:** Sprachmodell ordnet in die feste Liste aus `lib/themen.ts`
  ein (keine freien Etiketten).
- **Fremdlisten seitenweise** (Regel 6): Suchergebnisse und Feeds werden bis zum
  Ende geblättert bzw. die angegebene Gesamtzahl wird gegengezählt.

## 4. Themenvorschläge

Für eine Sendung oder im Einzelauftrag schlägt die Recherche **Themen** vor:

1. Dokumente der letzten Aktualitätsspanne zu Land/Orten/Gebieten sammeln.
2. Zu **Geschichten** bündeln (ähnliche Dokumente = eine Geschichte).
3. Je Geschichte bewerten: Ortsnähe, Aktualität, Zahl **unabhängiger** Quellen,
   Vertrauen der Quellen, Passung zu Themengebieten/Stichworten, Neuheit
   (nicht schon in den letzten Beiträgen dieser Sendung vorgekommen —
   Wiederholungssperre 7 Tage, einstellbar).
4. **Tonalitäts-Passung** (siehe 06 §4): Geschichten über Todesfälle, schwere
   Verbrechen, Suizid, Katastrophen, Kinder als Opfer werden als **sensibel**
   markiert — dort wird Humor später hart abgeschaltet; in Formaten
   „Glosse/Comedy" werden sie gar nicht erst vorgeschlagen.
5. Oberfläche: Liste mit Titel, einem Satz, Quellenzahl, Alter, Ort, Kennzeichen
   „sensibel". Der Redakteur hakt an, sortiert, verwirft — oder überlässt es der
   Automatik (Sendung mit Zeitplan).

## 5. Fakten sammeln — mit Beweispflicht

Für jedes gewählte Thema zieht ein Sprachmodell **Fakten** aus den Dokumenten:

- Ausgabe streng als JSON: `{ aussage, zahl?, dokument_id, zitat }`.
- **`zitat` muss wörtlich im Dokumenttext stehen.** Das prüft **Code**, nicht das
  Modell (normalisierter Teilstring-Vergleich). Fehlt das Zitat → Fakt verworfen.
- **`zahl` muss wörtlich im Zitat stehen** (gleiche Regel wie Auto Bid im
  Fullstacks-Projekt: „Wert muss wörtlich im Beleg stehen" — nie lockern).
- Bei Themengebiet `Politik`, `Recht`, `Gesundheit` und Format `nachrichten`:
  Kernaussagen brauchen **zwei unabhängige Quellen** oder eine Primärquelle
  (Behörde, Gericht, Unternehmen selbst). Sonst wird die Aussage im Drehbuch
  als Quelle zugeschrieben („Laut Mallorca Magazin …") oder weggelassen.
- Fakten speichern Quelle, URL, Datum. Die **Shownotes** eines Beitrags
  listen die Quellen (für Podcast-Feeds und die Redaktion).

## 6. Urheberrecht in der Recherche

- Wir übernehmen **Fakten**, nie Formulierungen. Das Drehbuch wird frei
  geschrieben (06). Eine Prüfung (06 §6) vergleicht das Drehbuch mit den
  Quelltexten auf lange wörtliche Übereinstimmungen (> 12 Wörter am Stück) und
  schreibt solche Stellen neu.
- Direkte Zitate von Personen nur kurz, gekennzeichnet („sagt …") und mit Quelle.
- Dokumenttexte werden nie ausgeliefert und nach 90 Tagen gelöscht.
- Der Bot hat eine Informationsseite und eine Kontaktadresse für Sperrwünsche;
  Sperrwünsche landen sofort auf der globalen Sperrliste.

## 7. Kosten und Grenzen

- Suche: höchstens N Anfragen je Beitrag (Standard 8), Abrufe höchstens 40.
- Zwischenspeicher: dieselbe URL wird innerhalb von 6 h nicht erneut geladen;
  Themen einer Region werden zwischen Sendungen **verschiedener Mandanten**
  geteilt (Dokumente sind öffentlich), die **Auswahl, Fakten und Drehbücher
  nie** (die gehören dem Mandanten).
- Wenn die Recherche nichts Brauchbares findet: der Beitrag wird **nicht**
  erfunden. Status `fehlgeschlagen` mit Meldung „Zu diesem Thema haben wir in
  den letzten 24 Stunden keine belastbaren Quellen gefunden", keine Minuten
  verbraucht, bei Zeitplan-Sendungen Mail an die Redaktion.
