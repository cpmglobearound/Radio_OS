# 11 — Oberfläche: alle Seiten

Stil: **Klarframe-Seitenstil** wie voice.klarframe.com — dunkler Grund,
Verläufe Cyan → Violett → Rosa, Schriften Bricolage Grotesque (Überschriften)
und Barlow (Text), KF-Monogramm als Favicon. Hell/Dunkel umschaltbar.
Drei Sprachen (DE/EN/ES) für **jeden** Text inkl. Fehlermeldungen, E-Mails,
Rechtstexte-Hinweise; ein Prüfskript `scripts/sprachen-pruefen.ts` findet
fehlende Übersetzungen (Lehre Voice OS: 56 fehlende bei 925 Texten, still).
Handy ab 360 px ohne waagerechtes Scrollen (`min-w-0` an Flex/Grid-Kindern —
die häufigste Ursache im Voice OS).

## 1. Öffentlich

| Pfad | Inhalt |
|---|---|
| `/` | Startseite: Nutzen in einem Satz, **Hörbeispiele** (Demo „Inselfunk" u. a.) mit Player, Formate, Zielgruppen (Sender/Firmen), Sprachen, Stimmen-Vorgeschmack, Preise-Teaser, Ablauf in 4 Schritten, FAQ, Aufruf „Kostenlos testen". Keine unbeweisbaren Superlative („die einzige Plattform"). |
| `/preise` | Abos, Einzelbeiträge nach Länge, Nachkauf, Zusätze — aus dem Katalog, nie fest im Code |
| `/stimmen-hoeren` | Öffentliche Auswahl an Stimmen mit Hörproben je Sprache |
| `/registrieren`, `/anmelden`, `/passwort-vergessen`, `/passwort-neu`, `/email-bestaetigen`, `/einladung/[token]` | siehe 04 |
| `/bot` | Info für Webseitenbetreiber: was unser Recherche-Bot tut, Sperrwunsch-Formular |
| `/impressum`, `/datenschutz`, `/agb`, `/avv` | Rechtstexte (Inhalte liefert Klarframe) |
| `/hoeren/[mount]` | Player eines öffentlichen Firmen-Streams |

## 2. Portal (angemeldet)

Seitenleiste: Übersicht · Neuer Beitrag · Beiträge · Sendungen · Stimmen ·
Quellen · Auslieferung · Team · Abrechnung · Einstellungen. Kopfzeile:
Mandanten-Umschalter, Guthabenanzeige, Sprache, Konto.

| Pfad | Inhalt und Knöpfe |
|---|---|
| `/portal` | Übersicht: Guthaben, laufende Produktionen (live), letzte Beiträge mit Player, nächste Zeitplan-Läufe, Zustellungsprobleme (rot), „Neuer Beitrag" groß |
| `/portal/neu` | **Assistent „Neuer Beitrag"** in 5 Schritten: ① Thema (Freitext **oder** Vorschläge aus der Recherche zu Land/Orten/Gebieten, mit Quellenzahl und Kennzeichen „sensibel") ② Format + **Länge (5/10/15/20/30/45/60/eigene)** ③ Sprache + Variante (+ weitere Sprachfassungen) ④ Stimmen (Auswahldialog 07 §3) + Namen im Programm ⑤ Tonalität (Vorlagen + Regler) → Zusammenfassung mit **Preis/Minuten vorher** → „Erzeugen" |
| `/portal/beitraege` | Liste mit Filter (Sendung, Status, Sprache, Zeitraum), Mehrfachauswahl → ZIP-Download / Ausliefern |
| `/portal/beitraege/[id]` | Player mit Wellenform + Kapiteln; Status/Fortschritt live; **Drehbuch-Ansicht** Zeile für Zeile (Sprecher, Text, Regie, Belege, Prüfbefunde; ▶ je Zeile; „neu sprechen", „ändern und neu sprechen"); Quellen/Shownotes; Versionen; Auslieferungen mit Nachweis; Download |
| `/portal/beitraege/[id]/freigabe` | Drehbuch-Freigabe (06 §7) |
| `/portal/sendungen` | Liste, „Neue Sendung" |
| `/portal/sendungen/[id]` | Reiter: Grundlagen (Name, Format, Länge, Sprache/n) · Themen & Region (Land, Orte mit Karte, Gebiete, Stichworte, Ausschlüsse, Aktualität) · Stimmen & Rollen · Tonalität · Aufbau (An-/Abmoderation, Kennung, Klänge) · Zeitplan (einfacher Planer: Tage, Uhrzeiten, stündlich von–bis; Vorschau „nächste 10 Läufe" in der Zeitzone der Sendung) · Auslieferung · Verlauf. Speichern mit Konfliktschutz (`stand`). „Jetzt einmal erzeugen" |
| `/portal/stimmen` | Katalog aller freigegebenen Stimmen aller Anbieter (inkl. GPT-Live wie Gleam), Filter, Hörproben je Sprache, „mit meinem Text anhören", Vergleichen, Paar anhören, Favoriten |
| `/portal/quellen` | eigene Quellen (RSS, Webseiten, Texte/PDF hochladen), Sperrliste, Test „Quelle abrufen" mit Vorschau des extrahierten Texts |
| `/portal/aussprache` | Aussprache-Lexikon des Mandanten, ▶ Probe |
| `/portal/auslieferung` | Ziele (Download-Voreinstellungen, Feeds, Streams, Webhook, SFTP, S3, Playout), „Verbindung testen", Zustellprotokoll |
| `/portal/streams/[id]` | Programmplan, Durchsagen, Ruhezeiten, Player, Hörerzahlen |
| `/portal/team` | Mitglieder, Rollen, einladen, entfernen |
| `/portal/abrechnung` | 10 §4 |
| `/portal/einstellungen` | 04 §4, API-Schlüssel, Protokoll |
| `/konto` | 04 §3 |

## 3. Verhalten, das überall gilt

- **Speicherkonflikt:** Zwei offene Tabs überschreiben sich nicht still;
  bei veraltetem Stand fragt die Seite „Inzwischen geändert — neu laden oder
  trotzdem speichern?".
- **Fortschritt** live per Server-Sent Events; Seite darf geschlossen werden,
  Mail/Benachrichtigung bei Fertigstellung (Einstellung).
- **Fehlertexte** sagen, was zu tun ist („Die Quelle antwortet nicht. Wir
  versuchen es in 10 Minuten erneut." statt „Error 503").
- **Leere Zustände** erklären den nächsten Schritt mit Knopf.
- **Ansicht unverständlich?** (Lehre Voice OS) Selten die Beschriftung —
  meist falsche Kategorie oder zwei Fragen in einer. Jede Seite beantwortet
  **eine** Frage.
- Barrierefreiheit: Tastaturbedienung, Kontraste, Beschriftungen für
  Bildschirmleser, Player mit Tasten bedienbar, **Transkript zu jedem Beitrag**.
