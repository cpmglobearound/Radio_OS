# 17 — Preise

> **Alle Zahlen sind Vorschläge.** Die Entscheidung trifft Oliver (siehe 16).
> Preise stehen im **Katalog** (Datenbank), nie im Code — der Code muss mit
> jeder Zahl funktionieren. Alle Preise netto zzgl. USt.

## 1. Kostenbasis (warum die Preise so aussehen)

Was eine **fertige Minute** Klarframe kostet (Schätzung, wird in Phase 0 an
echten Produktionen gemessen und in der Admin-Ansicht laufend angezeigt):

| Posten | Standardstimmen (OpenAI) | Premiumstimmen (z. B. ElevenLabs) |
|---|---|---|
| Recherche (Suche, Abrufe) je Minute Beitrag | 0,02–0,05 € | 0,02–0,05 € |
| Texte (Themen, Drehbuch, Prüfungen) | 0,03–0,08 € | 0,03–0,08 € |
| Stimme inkl. Neusprechen (Demo: 9 von 29 Zeilen wiederholt → Faktor ~1,4) | 0,20–0,45 € | 0,60–1,20 € |
| Nachhören (Spracherkennung, je Versuch) | 0,01–0,02 € | 0,01–0,02 € |
| Server, Speicher, Auslieferung | 0,02 € | 0,02 € |
| **Summe je fertiger Minute** | **≈ 0,30–0,60 €** | **≈ 0,70–1,40 €** |

Daraus: Premiumstimmen verbrauchen Minuten mit **Faktor 1,5**. Die Preise
unten lassen auch im günstigsten Abo mindestens ~50 % Rohmarge.

## 2. Einzelbeiträge — „Themenblock kaufen" (ohne Abo)

Für Kunden, die gelegentlich einen Beitrag brauchen. Länge **vorher wählen**,
Preis steht vor dem Start fest. Ein oder zwei Stimmen: gleicher Preis.

| Länge | Preis | je Minute | typisch für |
|---|---|---|---|
| **bis 5 min** | **19 €** | 3,80 € | Nachrichtenblock, Themenbeitrag, Glosse |
| **bis 10 min** | **34 €** | 3,40 € | Magazinstück, kurzer Podcast |
| **bis 15 min** | **48 €** | 3,20 € | Podcast-Folge |
| **bis 20 min** | **59 €** | 2,95 € | Podcast-Folge, Themenstrecke |
| **bis 30 min** | **84 €** | 2,80 € | Magazin, langer Podcast |
| **bis 45 min** | **119 €** | 2,64 € | Sondersendung |
| **bis 60 min** | **149 €** | 2,48 € | Stundensendung |
| **über 60 min** | **149 € + 2,20 € je weitere Minute** | ≤ 2,48 € | Langformate; ab 120 min „auf Anfrage" (Einzelangebot) |

Regeln:
- Die Stufe ist eine **Obergrenze**: Ein Beitrag „bis 10 min", der 9:20 lang
  wird, kostet 34 €. Wird er länger als die Stufe (Toleranz +15 %), trägt
  Klarframe den Überhang.
- **Premiumstimmen:** +50 % auf den Stufenpreis.
- **Weitere Sprachfassung** desselben Beitrags (gleiche Recherche, eigenes
  muttersprachliches Drehbuch): −25 % auf den Stufenpreis je zusätzlicher Sprache.
- **Drehbuch ohne Vertonung** (nur Text mit Quellen): 30 % des Stufenpreises.
- **Nachbessern:** Neusprechen einzelner Zeilen auf Kundenwunsch kostet deren
  Sekunden zum Minutenpreis der Stufe; Korrekturen durch unsere automatische
  Prüfung kosten nichts.
- Einzelbeiträge werden sofort per Karte/SEPA (Stripe Checkout) bezahlt.
  Download erst nach Zahlung.

## 3. Abos — Minuten je Monat

Für regelmäßige Nutzung deutlich günstiger je Minute. Die Minuten gelten für
**alle** Längen und Formate (5 min, 10 min, 60 min … beliebig gemischt).

| Abo | Minuten/Monat | Preis/Monat | je Minute | enthalten |
|---|---|---|---|---|
| **Start** | 60 | **129 €** | 2,15 € | 1 Sendung mit Zeitplan, 2 Nutzer, Download + Feed |
| **Pro** | 240 | **390 €** | 1,63 € | 5 Sendungen, 5 Nutzer, + Stream, Webhook, SFTP/S3 |
| **Sender** | 900 | **990 €** | 1,10 € | 25 Sendungen, 15 Nutzer, + Standard-Playout-Konnektor, API |
| **Sender XL** | 2.400 | **2.290 €** | 0,95 € | unbegrenzte Sendungen, 40 Nutzer, 2 Playout-Konnektoren, bevorzugte Produktion |
| **Individuell** | nach Absprache | auf Anfrage | ab ~0,80 € | Unter-Mandanten (Agenturen), angepasste Konnektoren, Stimmklon, SLA |

Was das in Beiträgen bedeutet (Beispiele für die Verkaufsseite):
- **Start (60 min):** z. B. 12 × 5-min-Beiträge **oder** 6 × 10 min **oder** eine 60-min-Sendung im Monat.
- **Pro (240 min):** z. B. werktäglicher 10-min-Podcast (≈ 220 min).
- **Sender (900 min):** z. B. stündliche 2-min-Nachrichten von 6–20 Uhr an Werktagen (≈ 15 × 2 × 22 = 660 min) + wöchentliche 60-min-Sendung.
- **Sender XL (2.400 min):** z. B. Nachrichten rund um die Uhr in zwei Sprachen.

Regeln:
- Jahreszahlung: 2 Monate geschenkt (−16,7 %).
- Nicht verbrauchte Monatsminuten verfallen am Monatsende.
- Premiumstimmen verbrauchen Minuten mit Faktor 1,5 (vor dem Start angezeigt).
- Monatlich kündbar (Jahresabo: zum Ende der Laufzeit).

## 4. Minuten nachkaufen (zu jedem Abo)

| Paket | Preis | je Minute | gültig |
|---|---|---|---|
| 30 min | 69 € | 2,30 € | bis Ende des Folgemonats |
| 120 min | 249 € | 2,08 € | bis Ende des Folgemonats |
| 500 min | 899 € | 1,80 € | bis Ende des Folgemonats |

Im Abo ist der Nachkauf nie teurer als der Einzelbeitrag gleicher Länge.

## 5. Zusätze

| Zusatz | Preis (Vorschlag) |
|---|---|
| Standard-Konnektor (SFTP, S3, Webhook, Feed) | im Abo enthalten (je nach Stufe) |
| Standard-Playout-Konnektor (mAirList, Zetta, WideOrbit, DAVID …) | ab Abo „Sender" enthalten; sonst 49 €/Monat |
| **Angepasster Konnektor** (Senderspezifika, eigene API, Datenbank) | Einrichtung ab 490 € + ab 49 €/Monat Pflege |
| Firmen-Stream (Ladenfunk/Hotelradio) je weiterem Stream | 29 €/Monat (erster im Pro enthalten) |
| Stimmklon (eigene Moderatorenstimme, mit Einwilligung) | Einrichtung 390 € + 29 €/Monat |
| Zusätzliche Sprachvariante außerhalb DE/EN/ES (sobald verfügbar) | ohne Aufpreis |
| Drehbuch-Freigabe durch Klarframe-Redaktion (Mensch liest gegen) | 0,90 € je Minute (optional, später) |

## 6. Probe

- 10 Probeminuten nach Registrierung, ohne Zahlungsmittel.
- Probebeiträge: im Portal anhören, **nicht** herunterladen/ausliefern; am
  Ende der gesprochene Hinweis „Eine Hörprobe von Klarframe Radio".

## 7. Umsetzung im Code

- Tabelle `Tarif` (Abos), neue Tabelle `Einzelpreis` (`bis_minuten`,
  `preis_eur`, `je_weitere_minute_eur`, `aktiv`) und `Nachkaufpaket`.
- **Eine** Preisberechnung `lib/abrechnung/preis.ts`:
  `preisFuer({ laenge_min, stimmklasse, sprachfassungen, nur_drehbuch, mandant })`
  → `{ stufe, preis_eur, reservierte_sekunden, begruendung[] }`.
  Oberfläche, API, Checkout und Rechnung rufen **nur** diese Funktion.
- Prüfskript `scripts/preise-pruefen.ts`: jede Stufengrenze (4:59, 5:00,
  5:01, 60:00, 61:00, 120:00), Premium-Faktor, Sprachfassungs-Rabatt,
  Sonderpreis 0 €, bestellter Preis als Obergrenze.
