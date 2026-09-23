# 06 — Redaktion und Drehbuch

Aus Fakten werden **eigene Geschichten** und daraus ein **Drehbuch**: Zeile für
Zeile, mit Sprecher, Text und Regie. Erst das fertige, geprüfte Drehbuch wird
vertont (Regel aus der Demo: nie zwei Live-Agenten frei reden lassen).

## 1. Ablauf

1. **Blickwinkel finden** (je Thema): Was ist die Geschichte für *diese*
   Hörer an *diesem* Ort? Beispiel Demo: nicht „Mietpreise steigen", sondern
   „Die Insel sucht Personal — und das Personal sucht eine Wohnung".
2. **Aufbau planen:** Blöcke, Reihenfolge, Übergänge, An-/Abmoderation,
   KI-Kennung, Pointenplätze (bei Humor), ernste Stellen.
3. **Drehbuch schreiben** — direkt in der Ausgabesprache (siehe 07 §4, nie
   übersetzen).
4. **Prüfen** (§6) — bei harten Befunden zurück zu 3 (höchstens 2 Runden).
5. **Freigabe** durch die Redaktion, falls für die Sendung eingestellt.

## 2. Drehbuch-Format (verbindlich, JSON)

```json
{
  "titel": "Inselfunk — Mieten auf Mallorca",
  "sprache": "de-DE",
  "sprecher": {
    "moderation_a": { "name": "Lena", "stimme": "openai-audio:marin", "persoenlichkeit": "warm, neugierig, lacht leicht und ansteckend" },
    "moderation_b": { "name": "Jan",  "stimme": "openai-live:gleam", "persoenlichkeit": "trocken-humorvoll, faktenfest, ruhig" }
  },
  "bloecke": [{ "id": "b1", "thema": "Mieten", "blickwinkel": "…" }],
  "zeilen": [
    { "nr": 1, "rolle": "moderation_a", "block": "b1", "text": "Guten Morgen, Mallorca! Hier ist Lena …", "regie": "Fröhlich, energiegeladen", "luecke_ms": 0, "fakten": [] },
    { "nr": 4, "rolle": "moderation_b", "block": "b1", "text": "Laut idealista liegen die Balearen im August bei zwanzig Euro pro Quadratmeter.", "regie": "Sachlich, klar", "fakten": ["f1"] }
  ]
}
```

Regeln für den Text:
- **Zahlen, Daten, Uhrzeiten, Währungen, Abkürzungen als gesprochene Wörter**
  in der Zielsprache („neunzehn Euro dreißig", „diecinueve euros con treinta").
  Zusätzlich wandelt ein **Sprach-Normalisierer** (Code, je Sprache) übrig
  gebliebene Ziffern um, bevor vertont wird.
- Keine Klammern, keine Regieanweisungen im Text (die stehen in `regie`).
  In der Demo wurde „[lacht herzlich]" im Text sonst mitgesprochen bzw. verwirrte die Prüfung.
- Zeilen höchstens ~45 Wörter (lange Zeilen verlieren Betonung und sind
  schwerer neu zu sprechen).
- Übergabe-Zeilen mit „…" am Ende/Anfang für angefangene Sätze („Hier ist Lena …" / „… und Jan").
- `luecke_ms`: Standard 280; kurze Reaktion 60–150; Ins-Wort-fallen 40; negativ = Überlappung (höchstens −300).

## 3. Tonalität — die Regler (eine Stelle: `lib/tonalitaet.ts`)

| Regler | Stufen | Wirkung im Drehbuch | Wirkung in der Stimme |
|---|---|---|---|
| **Humor** | 0 aus · 1 dezent · 2 locker · 3 verspielt · 4 Comedy | Zahl und Art der Pointen (0: keine; 2: 1–2 je Block, trocken; 4: Pointendichte, Überzeichnung) | Regie „schmunzelnd", „trocken" |
| **Lachen** | nie · selten · natürlich · oft | wo ein Lachen hinpasst (nur nach echten Pointen) | Regie „kurz auflachen", „lachend" — nur bei Stimmen mit `kann_lachen` |
| **Ernsthaftigkeit / Haltung** | nachrichtlich-neutral · einordnend · meinungsfreudig | 0: keine Wertung, Zuschreibung jeder Aussage; 2: Glosse erlaubt, klar als Meinung erkennbar | ruhiger bzw. pointierter Vortrag |
| **Wärme / Empathie** | sachlich · freundlich · herzlich | Ansprache, Mitgefühl bei Betroffenen | Regie „warm", „mitfühlend" |
| **Energie** | ruhig · normal · lebhaft | Satzlänge, Ausrufe | Tempo, Lautstärke-Dynamik |
| **Tempo** | langsam · normal · zügig | Wörter je Minute (siehe §5) | Sprechgeschwindigkeit |
| **Sprachniveau** | einfach · normal · gehoben | Wortwahl, Satzbau (einfach = kurze Sätze, keine Fremdwörter) | — |
| **Anrede** | je Sprache: du/ihr/Sie · tú/vosotros/usted · … | Hörer-Ansprache | — |
| **Zielgruppe** | allgemein · jung · älter · Fachpublikum · Familien | Beispiele, Bezüge, Erklärtiefe | — |
| **Regionalfarbe** | aus · leicht | ortsübliche Begriffe/Grüße (nur geprüfte Liste je Region), **kein** gespielter Dialekt | — |

Voreinstellungen (Vorlagen) zum Anklicken, z. B.
„Nachrichten seriös", „Morgenshow locker", „Ernst, aber mit Humor" (= Demo:
Humor 2, Lachen natürlich, einordnend, herzlich), „Glosse", „Ladenfunk freundlich".

## 4. Die Taktregel (hart, nicht abschaltbar)

Wie im Voice OS: Bei **sensiblen Themen** (05 §4 — Tod, schwere Verbrechen,
Suizid, Katastrophen, Kinder als Opfer, Krankheit einzelner Personen) gilt
für den ganzen Block: Humor 0, Lachen nie, Wärme mindestens freundlich.
Nie ein Witz über Betroffene. Humor zielt auf **Umstände und Absurditäten**,
nie auf Menschen in Not (Demo: gelacht wird über „Meerblick auf dem Poster",
nicht über die Leute im Campingbus). Suizid-Themen folgen den gängigen
Medienleitlinien (keine Methoden, Hilfsangebot des Landes nennen — Nummer
aus `lib/hilfsangebote.ts` je Land, geprüft).

## 5. Länge treffen

Die Ziellänge wird in Wörter umgerechnet — **je Sprache und Tempo** aus einer
Tabelle in `lib/sprachen.ts`, die nach echten Produktionen nachgestellt wird
(Startwerte, gesprochene Wörter je Minute bei „normal"):

| Sprache | ruhig | normal | zügig |
|---|---|---|---|
| Deutsch | 120 | 140 | 160 |
| Englisch | 135 | 155 | 175 |
| Spanisch | 145 | 165 | 185 |
| Französisch | 140 | 160 | 180 |
| Italienisch | 140 | 160 | 180 |

Zusätzlich Zuschlag für Lachen und Pausen (Demo: 29 Zeilen, ~480 Wörter → 193 s).
Nach jeder Produktion wird das Verhältnis gemessen und die Tabelle je
Stimme/Sprache nachgeführt (`Stimme` bekommt eine gemessene Wortrate).
Toleranz der fertigen Länge: ±15 %. Abgerechnet wird die echte Länge,
höchstens aber Ziellänge + 15 % (der Überhang geht zulasten Klarframe).

## 6. Prüfungen am Drehbuch (vor der Vertonung)

| Prüfung | Wie | Bei Befund |
|---|---|---|
| **Fakten-Deckung** | Jede Zahl, jedes Datum, jeder Eigenname im Text muss in einem verlinkten Fakt vorkommen (Code-Abgleich nach Normalisierung) | Zeile neu schreiben lassen; nach 2 Runden Zeile streichen |
| **Aussagen-Prüfung** | Zweites Modell liest Drehbuch + Fakten und markiert jede Behauptung, die die Fakten nicht tragen | wie oben |
| **Zuschreibung** | Umstrittene Aussagen tragen „laut …" | ergänzen |
| **Übernahme-Prüfung** | Keine > 12 Wörter am Stück wörtlich aus einem Quelltext | umschreiben |
| **Taktregel** | sensibler Block ohne Humor/Lachen | Regie/Zeilen korrigieren |
| **Muttersprachlichkeit** | Muttersprachlicher Lektor (Modell mit Rolle „Redakteur aus <Land>") markiert Übersetzungsdeutsch, falsche Redewendungen, falsche Anrede, falsche Zahl-/Datumsform | umschreiben |
| **KI-Kennung** | Beitrag enthält die gesprochene KI-Kennung (Einstellung der Sendung, Pflicht; siehe 14) | ergänzen |
| **Länge** | geschätzte Dauer in Toleranz | kürzen/ergänzen |
| **Verbotenes** | Ausschlüsse der Sendung, Sperrwörter, Werbeaussagen ohne Beleg (Firmen), Heilversprechen | streichen |

Die Befunde stehen in der Redaktionsansicht neben der Zeile (gelb = geändert
durch Prüfung, rot = konnte nicht behoben werden).

## 7. Redaktionsansicht (für Menschen)

- Zeilenliste mit Sprecherfarbe, Text, Regie, belegenden Fakten (aufklappbar
  mit Quelle und Zitat).
- Zeile bearbeiten (Text/Regie), Zeile löschen, Zeile einfügen, Sprecher tauschen.
- „Diesen Block neu schreiben" mit optionaler Anweisung („lustiger", „kürzer",
  „mehr über Palma").
- Ändert ein Mensch eine Zeile, läuft für **diese** Zeile die Fakten-Deckung
  erneut; eine vom Menschen eingefügte Zahl ohne Fakt wird markiert, aber nicht
  verhindert (Verantwortung liegt dann beim Redakteur; protokolliert).
- „Freigeben und vertonen".

## 8. Prompts

Prompts liegen als versionierte Dateien in `lib/redaktion/prompts/` (eine
Datei je Stufe und Format, Platzhalter für Tonalität, Sprache, Fakten).
Jede Produktion speichert die Prompt-Version. Prompts sind **Code**: Änderungen
nur mit Prüflauf gegen die Referenzfälle (15 §3).
Grundsätze, die in allen Drehbuch-Prompts stehen:
1. „Schreibe gesprochene Sprache, nicht Schriftsprache. Kurze Sätze. Eine Idee pro Satz."
2. „Verwende ausschließlich die gelieferten Fakten. Erfinde keine Zahlen, Namen, Zitate, Orte."
3. „Schreibe direkt in <Sprache-Variante> wie ein Muttersprachler aus <Land>. Übersetze nicht."
4. „Humor zielt auf Umstände, nie auf Betroffene." + Taktregel.
5. Die Rollen der Sprecher und ihre Persönlichkeit; sie reden miteinander, nicht nebeneinander (reagieren, ergänzen, widersprechen freundlich).
