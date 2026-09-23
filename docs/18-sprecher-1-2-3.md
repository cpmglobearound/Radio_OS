# 18 — Ein, zwei oder drei Sprecher

Jeder Beitrag hat **1, 2 oder 3 Sprecher**. Die Zahl wählt der Kunde im
Assistenten (Schritt „Format") bzw. in der Sendung; jedes Format sagt, welche
Zahlen es erlaubt (`lib/formate.ts`: `sprecher_min`, `sprecher_max`,
`sprecher_standard`). Die Technik ist für alle gleich: Drehbuch mit Rollen →
jede Zeile mit der Stimme ihrer Rolle → Schnitt. Was sich ändert, sind
**Drehbuchregeln, Stimmenwahl und Schnitt**.

## 1. Übersicht

| | **1 Sprecher** | **2 Sprecher** | **3 Sprecher** |
|---|---|---|---|
| Wirkung | klar, seriös, kompakt | lebendig, Gespräch, Pointen durch Reaktion | Runde, Diskussion, Show-Charakter |
| Typische Formate | Nachrichten, Wetter, Durchsage, Themenbeitrag, Moderation zwischen Titeln, Tagesbriefing | Podcast/Zwiegespräch, Morgenshow, Glosse im Dialog, Interview-Stil | Talkrunde, Pro & Contra mit Moderation, Quiz/Show, Magazin mit Reporter, Comedy-Runde |
| Rollen (Vorlagen) | Sprecher/in | Moderation A + B (z. B. „die Neugierige" + „der Faktenfeste") · Moderation + Experte | Moderation + zwei Gäste · Moderation + Pro + Contra · Moderation + Co-Moderation + Reporter/in vor Ort |
| Empfohlene Länge | 0:10–10 min | 2–30 min | 5–60 min |
| Schwierigkeit | gering | mittel | hoch (Unterscheidbarkeit, Sprecherwechsel) |
| Preis | nach Länge (17) | gleich wie 1 Sprecher | gleich wie 1 Sprecher (Vorschlag; siehe 16 Nr. 12) |

Die Demo „Inselfunk" ist ein **2-Sprecher**-Beitrag (Lena = Marin, Jan = Cedar).

## 2. Ein Sprecher

- Drehbuch in Absätzen (Zeilen bis ~45 Wörter), Blöcke mit Übergangssätzen.
- Regie variiert **innerhalb** der Stimme (ernst → warm → locker), sonst wird es monoton:
  der Redaktions-Prompt setzt je Block eine Stimmung.
- Humor: trockene Einschübe, rhetorische Fragen an die Hörer, keine Pointen,
  die ein Gegenüber bräuchten.
- Lachen: höchstens „schmunzelnd gesprochen", kein Lachen über eigene Witze
  (klingt allein schnell unnatürlich).
- Schnitt: Pausen zwischen Absätzen 350–600 ms, Blockwechsel mit Klang.

## 3. Zwei Sprecher

- Rollen **gegensätzlich** anlegen (neugierig/faktenfest, locker/ernst,
  Einsteiger/Kenner) — Reibung macht das Gespräch.
- Zeilen **kurz und im Wechsel**, Reaktionen („Oh nein.", „Pro Monat."),
  angefangene Sätze, die der andere beendet („siebzig Quadratmeter …" /
  „… sind rund dreizehnhundertfünfzig Euro").
- Jede Zeile bekommt die vorige als Kontext (reagiert im Ton).
- Pointen: einer baut auf, der andere setzt — oder umgekehrt trocken; Lachen
  meist beim **Zuhörenden**, nicht beim Pointengeber (Demo: Jan trocken, Lena lacht).
- Schnitt: Lücken 40–300 ms, Ins-Wort-Fallen mit kleiner Überlappung
  (bis −300 ms), Reaktionen dicht an der vorigen Zeile.
- Stimmen: deutlich unterscheidbar (Geschlecht, Tonhöhe oder Klangfarbe);
  die Prüfung „Paar anhören" (07 §3) ist im Assistenten der Standard.

## 4. Drei Sprecher

Drei Stimmen klingen nur gut, wenn Hörer **jederzeit wissen, wer spricht**.
Dafür gelten zusätzliche Pflichtregeln:

1. **Klare Rollen mit Funktion:** Eine Moderation führt immer (eröffnet,
   verteilt das Wort, fasst zusammen, schließt). Die zwei anderen haben
   verschiedene Aufgaben/Standpunkte (Pro/Contra, Experte/Betroffener,
   Reporter vor Ort/Studio). Keine zwei Rollen mit gleicher Funktion.
2. **Drei deutlich verschiedene Stimmen:** Die Stimmenwahl verlangt
   Unterschiede in mindestens zwei Merkmalen (Geschlecht, Tonlage, Alter,
   Tempo, Klangfarbe). Die Oberfläche warnt, wenn zwei Stimmen zu ähnlich
   sind (Vergleich der Stilmerkmale + Hinweis „Paar/Trio anhören").
3. **Namen im Gespräch:** Die Moderation spricht die anderen in den ersten
   zwei Minuten mehrfach mit Namen an und übergibt ausdrücklich
   („Carmen, wie siehst du das?"). Danach mindestens bei jedem Themenwechsel.
4. **Vorstellung am Anfang:** Jede Stimme sagt früh einen eigenen Satz, damit
   das Ohr sie lernt.
5. **Wortanteile ausgewogen:** Moderation 30–45 %, die beiden anderen je
   25–40 %. Die Drehbuchprüfung misst die Anteile (Wörter je Rolle) und
   schreibt nach, wenn eine Rolle verstummt.
6. **Kein Durcheinander:** Überlappungen nur zwischen **zwei** Stimmen
   gleichzeitig, nie alle drei; höchstens eine Überlappung je 30 Sekunden.
7. **Kontext je Zeile:** Die Stimme bekommt die **zwei** vorigen Zeilen mit
   Sprechernamen (wer hat was gesagt), damit Reaktionen stimmen.
8. **Stereo (optional):** Für Podcasts/Streams können die drei Stimmen leicht
   im Stereobild verteilt werden (Moderation Mitte, Gäste leicht links/rechts,
   ±20 %). Für Radio-Playouts standardmäßig **Mono-kompatibel** bzw. Mono.
9. **Länge:** 3 Sprecher ab 5 Minuten empfohlen; darunter warnt der Assistent
   („Für kurze Beiträge wirken 1–2 Stimmen klarer").

Typische Vorlagen für 3 Sprecher:

| Vorlage | Rollen | Beispiel |
|---|---|---|
| **Talkrunde** | Moderation, Gast 1, Gast 2 | „Mieten auf Mallorca: eine Vermieterin und ein Saisonarbeiter im Gespräch" (fiktive, als KI gekennzeichnete Rollen, Fakten aus Quellen) |
| **Pro & Contra** | Moderation, Pro, Contra | „Ferienwohnungsverbot in Palma — richtig oder falsch?" |
| **Magazin mit Reporter** | Moderation, Co-Moderation, Reporter/in vor Ort | Reporterin „meldet sich" aus Sóller |
| **Comedy-Runde** | Moderation, zwei Pointengeber | Wochenrückblick mit Humor-Stufe 3–4 |
| **Quiz** | Moderation, zwei Mitspieler | Fragen zu Themen der Woche |

**Wichtig bei Rollen, die Menschen darstellen** (Gäste, Betroffene): Sie sind
**fiktiv** und als KI erkennbar; sie geben keine erfundenen Erlebnisse als
wahr aus. Was sie an Fakten sagen, muss belegt sein wie jede andere Zeile
(Fakten-Deckung 06 §6). Meinungen sind als Meinung der Rolle erkennbar
(„Aus meiner Sicht …"). Nie echte, namentlich bekannte Personen nachspielen (14 §1).

## 5. Umsetzung im Code

- `lib/formate.ts` je Format: `sprecher_min`, `sprecher_max`,
  `sprecher_standard`, `rollen_vorlagen[]`.
- `Sendung.stimmen` / Drehbuch `sprecher`: 1–3 Einträge mit `rolle`, `stimm_id`,
  `name_im_programm`, `persoenlichkeit`, `funktion` (fuehrt | gast | pro |
  contra | reporter | experte | co_moderation).
- Redaktions-Prompts je Sprecherzahl (`lib/redaktion/prompts/drehbuch-1.md`,
  `-2.md`, `-3.md`) mit den Regeln oben.
- Zusätzliche Drehbuchprüfungen für 3 Sprecher: Wortanteile, Namensnennung,
  Überlappungsregel, Vorstellung am Anfang.
- Stimmen-Ähnlichkeitswarnung (Stilmerkmale; später Klangvergleich per
  Audio-Merkmal).
- Schnitt: Kontext der zwei vorigen Zeilen; optional Stereo-Verteilung je
  Ausgabeformat.
- Prüfskript `scripts/sprecher-pruefen.ts`: je Sprecherzahl ein Referenz-
  beitrag (1: 60 s Nachrichten, 2: 3 min Zwiegespräch, 3: 5 min Pro & Contra);
  Erwartung: alle Zeilen der richtigen Stimme zugeordnet (Nachhören +
  Sprecher-Zuordnung), Anteile im Rahmen, Länge in Toleranz.
