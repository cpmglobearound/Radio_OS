# 07 — Stimmen und Sprachen

Oliver: „Ich will aus der Auswahl **alle Stimmen** wählen können, auch so was wie
**Gleam**." Und: „Auch die **Ausgabesprache** kann man wählen, und die ist dann
**muttersprachlich**."

## 1. Anbieter und ihre Stimmen

Alle Anbieter hängen an **einer** Anbieterschicht (`lib/stimmen/anbieter/*.ts`),
jeder mit derselben Schnittstelle (§2). Die Oberfläche kennt keine Anbieter-
Sonderfälle — sie zeigt einen gemeinsamen Katalog.

| Anbieter-ID | Was | Stimmen (Stand Voice OS 23.09.2026) | Stärken | Grenzen |
|---|---|---|---|---|
| `openai-audio` | `gpt-audio-1.5` (Chat mit Audioausgabe) | marin, cedar, alloy, ash, ballad, coral, echo, sage, shimmer, verse (Liste per Abgleich bestätigen) | **echtes Lachen, Atmen, Seufzen**, folgt Regie gut, mehrsprachig — **in der Demo benutzt** (Lena = marin, Jan = cedar) | weicht beim ersten Versuch öfter vom Wortlaut ab → Nachhören Pflicht |
| `openai-live` | GPT-Live (Echtzeitmodell, im Voice OS als Bauart `gpt-live`) | **22 Stimmen:** marin, quartz, ripple, vesper, willow, stone, **gleam**, meridian, bossa, tempo, beacon, delta, cinder, alloy, ash, ballad, coral, echo, sage, shimmer, verse, cedar | sehr natürlich, lebendig, mehrsprachig; **Gleam & Co. gibt es nur hier** | ist für Gespräche gebaut: Vertonung über eine Sitzung „sprich exakt diesen Text" (siehe §2.2); Sprache kann mitwandern → Sprache im Prompt fest, Nachhören Pflicht |
| `openai-tts` | `gpt-4o-mini-tts` | wie `openai-audio` (klassische Stimmen) | günstig, schnell, sehr wortgetreu, Anweisungen für Stil | lacht nicht echt → für Nachrichten, Durchsagen |
| `elevenlabs` | Eleven v3 / Multilingual | kuratierte Auswahl aus der Bibliothek + eigene Stimmen | sehr ausdrucksstark, Regie-Tags im Text (z. B. Lachen), Dialogfunktion für mehrere Sprecher | teurer (Stimmklasse Premium); Bibliothek enthält Klone — **nur geprüfte** anbieten |
| `cartesia` | Sonic | kuratierte Auswahl | Stimmung vorgebbar, kann an passender Stelle echt lachen, schnell | Sprachabdeckung je Stimme prüfen |
| `fish` | Fish Audio | kuratierte Auswahl (Bibliothek gesperrt wie im Voice OS) | weitere deutsche und spanische Stimmen | etwas langsamer; Bibliothek voller ungeprüfter Klone |
| später: `google`, `azure` | Gemini-TTS, Azure Neural | viele regionale Varianten (es-MX, de-CH, fr-CA …) | breiteste Abdeckung regionaler **Muttersprachen**, SSML/Aussprache | Ausdruck geringer |

**Regel 7 gilt:** Der Abgleich (`scripts/stimmen-abgleichen.ts`, täglich)
findet neue Stimmen bei allen Anbietern — **blätternd bis zum Ende und
gegengezählt** — und legt sie mit `geprueft_am = null` an. Sichtbar werden sie
erst, wenn ein Klarframe-Admin sie angehört und je Sprache freigegeben hat
(13 §3). Stimmen, die nach einer realen Person klingen oder als Klon einer
Person gekennzeichnet sind, werden nie ohne Einwilligung freigegeben (14 §4).

## 2. Die Anbieterschnittstelle

```ts
interface StimmAnbieter {
  id: string
  faehigkeiten: {
    lachen: boolean; regieAlsText: boolean; regieAlsTags: boolean
    mehrsprecher: boolean; aussprache: 'lexikon' | 'ssml' | 'phonetisch' | 'keine'
    maxZeichen: number; sprachen: string[]          // BCP-47
  }
  sprechen(a: {
    text: string; regie?: string; stimme: string; sprache: string
    kontext?: { vorherSprecher: string; vorherText: string }
    persoenlichkeit?: string; tempo?: 'langsam' | 'normal' | 'zuegig'
    aussprache?: { wort: string; sprichAls: string }[]
  }): Promise<{ wav: Buffer; abtastrate: number; kosten_usd: number; roh?: unknown }>
  katalog(): AsyncIterable<AnbieterStimme>   // blättert selbst bis zum Ende
}
```

### 2.1 `openai-audio` (so lief die Demo — Referenz `referenz/demo-mallorca/produzieren.mjs`)

System-Anweisung je Zeile:
> „Du bist {Name}, {Persönlichkeit}, in der Radiosendung „{Titel}". Du sprichst
> den Text des Nutzers EXAKT Wort für Wort auf {Sprache} – kein Wort hinzufügen,
> weglassen oder ändern, keine Antwort, kein Kommentar. Nichtsprachliche Laute
> wie Lachen, Atmen, Schmunzeln, Seufzen sind erlaubt, wenn die Regie es
> verlangt. Natürlich, menschlich, wie ein echtes Gespräch unter Kollegen,
> keine Vorlese-Stimme. Davor hat {anderer} gesagt: „{vorige Zeile}" – reagiere
> im Ton darauf. Regie für diese Zeile: {Regie}"

Ab Versuch 2 zusätzlich: „Halte dich diesmal besonders genau an den Wortlaut
und fasse dich kurz: Lachen höchstens eine Sekunde, keine langen Pausen."

### 2.2 `openai-live` (Gleam und die übrigen GPT-Live-Stimmen)

Vertonung über eine kurze Echtzeitsitzung je Zeile (oder je Block mit einer
Zeile pro Antwort): Sitzungsanweisung wie §2.1, Eingabe als Text, Audio der
Antwort mitschneiden, Sitzung schließen. **Phase 0 (15 §1)** belegt vor dem
Bau: Wortgenauigkeit ≥ 95 % nach höchstens 4 Versuchen, Sprache bleibt fest,
Kosten je Minute. Erfahrungen aus Voice OS, die hier gelten:
- GPT-Live hat nur wenige Konfigurationsfelder — **alles Ausdrucksstarke ist
  Prompt** und wirkt nur weit vorne in der Anweisung.
- GPT-Live **wechselt die Sprache mit**, wenn der Gegenüber die Sprache
  wechselt. Hier gibt es kein Gegenüber; die Sprache steht fest in der
  Anweisung, das Nachhören prüft sie (Spracherkennung meldet die Sprache).
- Jede GPT-Live-Stimme hat im Voice OS eine echte Hörprobe — hier je
  **Ausgabesprache** eine eigene (§5).

## 3. Stimmenauswahl in der Oberfläche

Seite `/stimmen` (und als Auswahldialog überall, wo eine Stimme gewählt wird):

- **Filter:** Sprache + Variante (nur Stimmen, die dafür **muttersprachlich
  freigegeben** sind; Schalter „auch nicht-muttersprachliche zeigen" mit
  Warnhinweis), Geschlecht, Alter, Stil (warm, seriös, jugendlich, tief, hell,
  energisch …), „kann lachen", Anbieter, Stimmklasse (Standard/Premium).
- **Karte je Stimme:** Name, Anbieter (dezent), Stilwörter, Klassenfaktor,
  Knopf ▶ Hörprobe **in der gewählten Sprache**, ☆ Favorit.
- **„Mit meinem Text anhören":** bis 200 Zeichen, eigene Regie; kostenlos bis
  20 Proben/Tag je Mandant (danach gesperrt bis morgen, Hinweis).
- **Vergleichen:** bis 4 Stimmen mit demselben Satz nacheinander.
- **Paar anhören:** zwei gewählte Stimmen sprechen einen kurzen Musterdialog
  (klingen sie gut zusammen? unterscheidbar?).
- **Rolle zuweisen:** Stimme → Rolle der Sendung (Moderation A/B, Sprecher,
  Nachrichten) + Name im Programm + Persönlichkeit (Freitext mit Vorschlägen).
- Alle Stimmen aller Anbieter erscheinen **in einer Liste** — einschließlich
  Gleam und aller GPT-Live-Stimmen.

## 4. Ausgabesprache — muttersprachlich, nicht übersetzt

**Grundsatz:** Ein Beitrag wird **in** der Zielsprache geschrieben und
gesprochen, nicht aus einer anderen übersetzt. Die Quellen dürfen in jeder
Sprache sein (die Demo nutzte deutsche und spanische Quellen für einen
deutschen Beitrag).

Die Liste der Sprachen steht an **einer** Stelle, `lib/sprachen.ts`, als
**Sprache + Variante** (BCP-47), z. B.:

| Code | Anzeigename | Start |
|---|---|---|
| `de-DE` / `de-AT` / `de-CH` | Deutsch (Deutschland / Österreich / Schweiz) | de-DE sofort, AT/CH Phase 3 |
| `es-ES` / `es-MX` / `es-AR` / `es-US` | Spanisch (Spanien / Mexiko / Argentinien / USA) | es-ES sofort |
| `en-GB` / `en-US` / `en-IE` / `en-AU` | Englisch (… ) | en-GB sofort |
| `ca-ES` | Katalanisch (inkl. Hinweis Mallorquinisch) | Phase 3 — wichtig für Balearen/Katalonien |
| `fr-FR` / `it-IT` / `pt-PT` / `pt-BR` / `nl-NL` / `pl-PL` / … | weitere | Phase 4, je nach Stimmenabdeckung |

Was „muttersprachlich" konkret heißt — **jeder Punkt ist Pflicht und prüfbar:**

1. **Geschrieben in der Variante:** Der Drehbuch-Prompt schreibt als
   Muttersprachler aus dem Land der Variante (Wortwahl: „Aufzug/Lift",
   „ordenador/computadora", „coche/carro", „Jänner" in AT …).
2. **Muttersprachlicher Lektor** (06 §6) prüft auf Übersetzungsdeutsch,
   falsche Redewendungen, falsche Anrede.
3. **Formate der Region:** Zahlen, Dezimalzeichen, Datum, Uhrzeit (24 h/12 h),
   Währung, Maßeinheiten (km/miles, °C/°F) — alles aus `Intl`/CLDR je Variante,
   ausgeschrieben durch den Sprach-Normalisierer.
4. **Anrede-Konventionen** je Sprache (du/Sie, tú/usted, vosotros/ustedes,
   vous/tu) aus der Tonalität, mit sinnvollem Standard je Variante.
5. **Stimme ist für diese Variante freigegeben:** Nur Stimmen mit
   `sprachen[].muttersprachlich = true` **und** `geprueft = true` für genau
   diese Variante werden vorgeschlagen. Freigabe durch einen Menschen, der die
   Sprache spricht (Hörprobe + 3 Prüfsätze mit Zahlen, Namen, Fragen), plus
   automatische Prüfung: Wortgenauigkeit ≥ 97 % und erkannte Sprache korrekt.
6. **Aussprache-Lexikon** je Sprache (global + je Mandant): Ortsnamen
   („Sóller", „Port de Sóller", „Palma", „Sa Pobla"), Firmennamen („Klarframe"),
   Fremdwörter. Umsetzung je Anbieter: Lexikon/SSML, sonst phonetische
   Umschreibung im Text **nur für die Vertonung** (das Drehbuch bleibt korrekt geschrieben).
7. **Kulturelle Bezüge:** Humor, Redewendungen, Beispiele passen zur Region
   (der Prompt bekommt Land + Region + Zielgruppe).
8. **Nachhören in der Zielsprache:** Die Spracherkennung läuft mit der
   Zielsprache; weicht die **erkannte Sprache** ab, ist die Zeile durchgefallen.
9. **Hilfsangebote, Rechtliches, KI-Kennung** in der Sprache und für das Land
   des Publikums.

### Mehrere Sprachfassungen

Eine Sendung kann **mehrere Ausgabesprachen** haben. Dann entsteht je Sprache
ein **eigener** Beitrag aus denselben Fakten — eigenes Drehbuch, eigene
Stimmen (je Sprache zugewiesen), eigene Pointen. Die Beiträge sind als
„Sprachfassungen" verknüpft. Minuten zählen je Fassung.

## 5. Hörproben

- Jede sichtbare Stimme hat je freigegebener Sprache eine **echte** Hörprobe
  (kein Ersatz durch eine andere Stimme — Lehre Voice OS: dort hatten GPT-Live-
  Stimmen zuerst Hörproben aus einem anderen Modell).
- Probetexte je Sprache in `lib/stimmen/probetexte.ts`: ein Satz Moderation,
  ein Satz mit Zahl und Ortsnamen, ein Satz mit Lachen (nur bei `kann_lachen`).
- Erzeugt durch `scripts/hoerproben-erzeugen.ts`, abgelegt im Objektspeicher,
  ausgeliefert mit langem Cache.

## 6. Eigene Stimmen (Stimmklon)

Für Sender, die ihre echten Moderatoren als KI-Stimme wollen:
- Nur mit **schriftlicher Einwilligung** der Person (Vorlage in 14 §4),
  hochgeladen und gespeichert (`einwilligung_dokument`).
- Aufnahme nach Anbietervorgaben (ElevenLabs/Cartesia „professional clone"),
  Einrichtung durch Klarframe (Individuell-Tarif oder Einrichtungspreis).
- Die Stimme ist **nur für diesen Mandanten** sichtbar.
- Widerruf der Einwilligung → Stimme sofort gesperrt, beim Anbieter gelöscht,
  bestehende Beiträge bleiben, neue sind unmöglich (protokolliert).
