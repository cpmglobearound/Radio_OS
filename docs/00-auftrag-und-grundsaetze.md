# 00 — Auftrag und Grundsätze

## 1. Auftrag in einem Satz

Baue unter **radio.klarframe.com** eine mandantenfähige Plattform, auf der
Radiosender und Firmen **sendefertige Wortbeiträge** bestellen, einstellen,
anhören, herunterladen oder automatisch geliefert bekommen — recherchiert,
geschrieben und gesprochen von KI, in der gewählten Sprache **muttersprachlich**,
in der gewählten Tonalität, mit den Stimmen, die der Kunde auswählt.

## 2. Zielgruppen

| Zielgruppe | Was sie will | Wie sie es bekommt |
|---|---|---|
| **Radiosender** (lokal, regional, Spartensender, Web-Radios) | Nachrichten, Wetter, Verkehr, Themenstrecken, Nacht-/Wochenendmoderation, mehrsprachige Fassungen, Podcasts aus eigenen Themen | Dateien mit Metadaten direkt ins Playout (Konnektor), Download, API |
| **Firmen** (Handel, Hotels, Praxen, Industrie, Verbände) | Ladenfunk, Hotelradio, Durchsagen, Firmen-Podcast, interne Nachrichten zum Anhören | Stream, Download, Podcast-Feed, Webhook |
| **Agenturen** (später) | Beiträge für mehrere eigene Kunden | Agentur-Mandant mit Unter-Mandanten (siehe 04) |

Musik ist **nicht** Teil des Produkts (Lizenzen liegen beim Sender bzw. sind
Sache des Kunden). Wir liefern **Wort** plus eigene, selbst erzeugte Klänge
(Jingles, Betten), an denen keine fremden Rechte hängen.

## 3. Feste Regeln (nicht verhandelbar)

Diese Regeln stammen aus dem Betrieb der Schwesterprodukte (Klarframe Voice OS,
CALL4ME, Klarframe Social). Jede ist aus einem echten, teuren Fehler entstanden.

1. **Global denken — nie für einen Kunden, ein Land oder eine Sprache bauen.**
   Kein Land, keine Stadt, keine Sprache, keine Zeitzone fest im Code. Alles
   kommt aus Einstellungen des Mandanten oder aus Daten. Sprachabhängige
   Prüfungen (z. B. Wortlisten) nur als Rückfalllinie, nie als Hauptweg.
2. **„Meldet Erfolg, wirkt nicht" ist der Hauptfeind.** Jede Funktion gilt erst
   als fertig, wenn ein Prüfskript das **Ergebnis** nachweist (die Datei liegt
   beim Kunden an, die Stimme sagt den Text, der Konnektor hat übertragen) —
   nicht, wenn der Aufruf `200` liefert.
3. **Eine Aufzählung, eine Stelle.** Formate, Anbieter, Tarife, Sprachen,
   Tonalitäten stehen je an **genau einer** Stelle im Code (eine Datei, eine
   Tabelle). Alle anderen Stellen fragen dort nach. Im Voice OS stand dieselbe
   Aufzählung an 14 Orten; vier davon brachen still, als eine neue Art dazukam.
4. **Sperre statt Nachberechnung.** Ist ein Kontingent verbraucht, wird nicht
   heimlich weiterproduziert und nachberechnet, sondern angehalten — mit klarem
   Hinweis und einem Knopf „Minuten nachkaufen".
5. **Der bestellte Preis ist die Obergrenze.** Steigt der Katalogpreis, bleibt
   der Bestandskunde beim bestellten; sinkt er, gilt der niedrigere sofort.
6. **Fremdlisten kommen seitenweise.** Jede Liste eines Fremdanbieters
   (Stimmen, Suchergebnisse, Feeds) wird bis zum Ende durchgeblättert und
   gegengezählt. Im Voice OS lieferte ein Anbieter 10 statt 121 Einträgen — mit
   HTTP 200 und ohne Meldung.
7. **Stimmen nur geprüft anbieten.** Ein Abgleich darf neue Stimmen *finden*,
   *anbieten* darf sie nur ein Mensch nach Prüfung. Im Voice OS waren sechs Tage
   lang 102 ungeprüfte Stimmklone wählbar, darunter Klone realer Politiker.
8. **Keine Geheimnisse im Repository.** Nie. Ein einmal hochgeladener Schlüssel
   gilt als verbrannt. Ein Prüfschritt vor jedem Hochladen sucht danach.
9. **Neue Felder statt Bedeutungswechsel.** Eine öffentliche API-Antwort ändert
   nie den Typ oder die Bedeutung eines bestehenden Feldes (Apps und Konnektoren
   werden nicht mit dem Server ausgerollt). Neues kommt als neues Feld.
10. **Nie im laufenden Betrieb bauen.** Erst Typprüfung, dann Dienst anhalten,
    bauen, alten Bau als Rückfall behalten, starten, Startseite und Anmeldung
    prüfen (Muster: `portal-bauen.sh` im Voice OS).
11. **Nach jedem Ausrollen eine echte Produktion.** Ein kurzer Beitrag wird
    automatisch erzeugt und nachgehört. Grün ist erst, was hörbar stimmt.
12. **Nie Projekte vermischen.** Radio OS hat eigenen Server, eigene Datenbank,
    eigenes Repository, eigene Zugänge. Code darf aus dem Voice OS **nachgebaut**
    werden, aber nichts wird geteilt oder gegenseitig aufgerufen.
13. **Einfache Sprache in der Oberfläche.** Der Kunde ist kein Techniker.
    Keine Fachbegriffe ohne Erklärung, keine englischen Wörter in deutschen
    Texten, wo es ein deutsches gibt. Jede Fehlermeldung sagt, was zu tun ist.

## 4. Was „fertig" heißt

Eine Funktion ist fertig, wenn:
- sie in DE, EN und ES bedienbar ist (Oberfläche),
- sie für jede Rolle geprüft ist (Inhaber, Redakteur, Hörer/Leser, Klarframe-Admin),
- ein Prüfskript in `scripts/` sie **Ende-zu-Ende** belegt,
- ihr Fehlerfall geprüft ist (Fremdanbieter antwortet nicht, Kontingent leer,
  Quelle nicht erreichbar),
- sie auf dem Handy ab 360 px Breite ohne waagerechtes Scrollen funktioniert,
- sie im CHANGELOG steht.

## 5. Gelernte Lektionen aus dem Demo-Lauf (23.09.2026)

Aus der Produktion „Inselfunk — Mieten auf Mallorca" (siehe `referenz/`):

- **Das Sprachmodell weicht manchmal vom Text ab** — in 9 von 29 Zeilen beim
  ersten Versuch. Beispiele: „Näherblick" statt „Meerblick" (die Pointe!),
  „Achtzig" verschluckt, „behaltet" im Lachen untergegangen.
  → **Jede Zeile wird nachgehört** (Spracherkennung) und mit dem Drehbuch
  verglichen; bei Abweichung neu gesprochen, bis zu 4-mal. Nach allen
  Versuchen: die beste Fassung + Warnung an die Redaktion. Das ist Pflicht,
  nicht Kür.
- **Die Nachprüfung selbst braucht Hilfe:** Zahlen kamen als Ziffern zurück
  („19,30" statt „neunzehn Euro dreißig"), der Markenname als „ClearFrame".
  → Der Spracherkennung werden Eigennamen und die Bitte „Zahlen als Wörter"
  mitgegeben; Lachen/Seufzen werden als Geräusch markiert und vor dem
  Vergleich entfernt.
- **Regie wirkt.** „Achtzig klar betonen" oder „erst den Satz, dann lachen"
  behob die Fehler beim ersten neuen Versuch.
- **Lachen verlängert Zeilen stark** (ein Satz mit 6 Wörtern: 12 s roh).
  → Höchstdauer je Zeile (Wörter × 0,62 s + 2,2 s) als Prüfung; Stille vorn
  und hinten wird abgeschnitten, die Pausen setzt der Schnitt.
- **Zeilenweise sprechen mit Kontext** („davor hat Jan gesagt …") ergibt
  natürliche Reaktionen, ohne dass zwei Live-Agenten frei reden müssen.
- **Drehbuch vor Stimme:** Zwei Agenten, die live frei miteinander reden,
  wiederholen sich, verlieren den Faden und lassen sich vorher nicht prüfen.
  Deshalb: immer erst Drehbuch, dann Vertonung.
