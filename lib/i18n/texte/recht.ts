// Texte der Rechtsseiten (Impressum, Datenschutz, AGB, Bot-Info) in DE/EN/ES.
// Grundlage: klarframe.com (Impressum, /de|en|es/datenschutz, /de|en|es/agb), abgerufen am 23.09.2026.
// Die Abschnitte „für Klarframe Radio" sind Ergänzungen nach docs/05, 10, 13, 14, 17 — vor dem Start anwaltlich prüfen (docs/16 Nr. 16).
// Fehlende Schlüssel in en/es brechen die Typprüfung.

import type { Texte } from '@/lib/i18n'

export interface Abschnitt {
  titel: string
  absaetze: string[]
  liste?: string[]
}

/** Impressum-Angaben — wörtlich von klarframe.com/impressum, nicht verändern. */
export const IMPRESSUM = {
  verantwortlich: ['Oliver Condurache', 'Michael Vogel'],
  anschrift: ['Carrer Primavera 8', '07010 Palma, Spanien'],
  email: 'info@klarframe.com',
  nif: '20890460C',
} as const

const de = {
  rahmen: {
    startseite: 'Klarframe Radio — zur Startseite',
    zurueck: 'Zur Startseite',
    sprache: 'Sprache der Seite',
    sprachen: { de: 'Deutsch', en: 'English', es: 'Español' },
    zumInhalt: 'Zum Inhalt springen',
    fussText: 'Sendefertige Radio- und Podcast-Beiträge mit KI-Stimmen.',
    rechtliches: 'Rechtliches',
    konto: 'Konto',
    anmelden: 'Anmelden',
    testen: 'Kostenlos testen',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    agb: 'AGB',
    bot: 'Für Webseitenbetreiber',
    rechte: 'Klarframe',
    stand: 'Stand: 23.09.2026',
    radioMarke: 'Ergänzung für Klarframe Radio',
    radioPruefung: 'Diese Ergänzungen für Klarframe Radio lassen wir vor dem offiziellen Start von einer Anwältin oder einem Anwalt prüfen. Bis dahin kann sich der Wortlaut noch ändern.',
    fragen: 'Fragen? Schreiben Sie uns:',
  },
  impressum: {
    meta: { titel: 'Impressum', beschreibung: 'Impressum von Klarframe Radio (radio.klarframe.com): Anbieter, Anschrift, Kontakt und NIF.' },
    kicker: 'Rechtliches',
    titel: 'Impressum',
    einleitung: 'Klarframe Radio ist ein Angebot von Klarframe.',
    verantwortlich: 'Verantwortlich',
    anschrift: 'Anschrift',
    email: 'E-Mail',
    nif: 'NIF',
  },
  datenschutz: {
    meta: { titel: 'Datenschutz', beschreibung: 'Datenschutzerklärung von Klarframe Radio: welche Daten wir verarbeiten, wo sie liegen, welche Dienste beteiligt sind und welche Rechte Sie haben.' },
    kicker: 'Rechtliches',
    titel: 'Datenschutz',
    einleitung: 'Diese Datenschutzerklärung erklärt, welche personenbezogenen Daten Klarframe bei Klarframe Radio (radio.klarframe.com) verarbeitet, wofür sie verwendet werden und welche Rechte Sie haben. Teil A sind die allgemeinen Datenschutzinformationen von Klarframe. Teil B ergänzt, was speziell für Klarframe Radio gilt.',
    teilA: 'Teil A — Allgemeine Datenschutzinformationen von Klarframe',
    teilB: 'Teil B — Was speziell für Klarframe Radio gilt',
    basis: [
      { titel: '1. Verantwortlicher', absaetze: ['Verantwortlich für die Verarbeitung personenbezogener Daten ist:', 'Klarframe, Carrer Primavera 8, 07010 Palma, Spanien, info@klarframe.com'] },
      {
        titel: '2. Wofür wir Daten verarbeiten',
        absaetze: [],
        liste: [
          'Bereitstellung, Sicherheit und technische Stabilität der Website und des Dienstes Klarframe Radio.',
          'Bearbeitung von Nachrichten, Kontaktanfragen, Registrierungen und Bestellvorgängen.',
          'Erstellung der Radio- und Podcast-Beiträge, die Sie im Portal in Auftrag geben. Dabei werden Ihre Eingaben, Texte und Quellen verarbeitet, damit der gewünschte Beitrag entstehen kann.',
          'Erfüllung gesetzlicher Pflichten sowie Wahrung und Durchsetzung rechtlicher Ansprüche.',
        ],
      },
      { titel: '3. Welche Daten betroffen sein können', absaetze: ['Je nach Nutzung können Name, E-Mail-Adresse, Unternehmen, Nachricht, Bestellinformationen, technische Verbindungsdaten (z. B. IP-Adresse, Zeitpunkt, Browser und angeforderte Ressource) sowie die von Ihnen freiwillig eingegebenen Inhalte verarbeitet werden. Bitte geben Sie keine besonderen Kategorien personenbezogener Daten oder vertraulichen Zugangsdaten in Texte für Beiträge ein.'] },
      { titel: '4. Rechtsgrundlagen', absaetze: ['Die Verarbeitung erfolgt – abhängig vom konkreten Vorgang – auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen oder Vertrag), Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Pflichten) und Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen, insbesondere sichere und funktionsfähige Systeme). Eine erteilte Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden.'] },
      { titel: '5. Eingesetzte Dienste und Empfänger', absaetze: ['Für Hosting, E-Mail und KI-Funktionen setzen wir sorgfältig ausgewählte technische Dienstleister als Auftragsverarbeiter ein. Welche das bei Klarframe Radio sind, steht in Teil B. Daten werden nicht zu Werbezwecken verkauft. Übermittlungen in Drittländer erfolgen nur, wenn die gesetzlichen Voraussetzungen und geeignete Garantien erfüllt sind.'] },
      { titel: '6. Speicherdauer', absaetze: ['Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Danach werden sie gelöscht oder anonymisiert. Die konkreten Fristen für Klarframe Radio stehen in Teil B.'] },
      { titel: '7. Ihre Rechte', absaetze: ['Sie können Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und – soweit die Voraussetzungen vorliegen – Widerspruch gegen die Verarbeitung verlangen. Sie können eine Einwilligung jederzeit widerrufen. Schreiben Sie dazu an info@klarframe.com. Außerdem haben Sie das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, insbesondere bei der spanischen Agencia Española de Protección de Datos (AEPD).'] },
      { titel: '8. Sicherheit und Cookies', absaetze: ['Wir verwenden technische und organisatorische Maßnahmen, um Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Die Website verwendet nur Speichermechanismen, die für ihre Kernfunktionen notwendig sind (siehe Teil B). Klarframe Radio verwendet keine Webanalyse und keine Werbe-Tracker.'] },
      { titel: '9. Aktualisierungen', absaetze: ['Wir können diese Datenschutzerklärung anpassen, wenn sich Funktionen, eingesetzte Dienste oder rechtliche Anforderungen ändern. Maßgeblich ist die jeweils auf dieser Seite veröffentlichte Fassung. Für individuelle Kundenprojekte können zusätzliche Vereinbarungen und Hinweise gelten.'] },
    ] as Abschnitt[],
    radio: [
      {
        titel: 'B1. Welche Daten Klarframe Radio verarbeitet',
        absaetze: [],
        liste: [
          'Konto-Daten: Name, E-Mail-Adresse, Firma oder Sender, Art des Betriebs, Land und Sprache. Ihr Passwort speichern wir nie im Klartext, sondern nur als verschlüsselten Prüfwert.',
          'Ihre Inhalte: Themen, eigene Texte und Webseiten-Adressen, die Sie für einen Beitrag angeben, sowie Einstellungen Ihrer Sendungen.',
          'Ergebnisse: gefundene Quellen, erzeugte Drehbücher und das fertige Audio.',
          'Protokoll: wichtige Vorgänge im Konto (z. B. Anmeldung, Bestellung, Löschung) mit Zeitpunkt und einem gekürzten, verschlüsselten Wert der IP-Adresse (IP-Hash). Die vollständige IP-Adresse speichern wir dort nicht.',
          'Zugangsdaten für die Auslieferung (z. B. zu Ihrem Server) speichern wir nur verschlüsselt und zeigen sie nie wieder an.',
          'Wenn Sie bei der Registrierung zustimmen, schicken wir Ihnen Neuigkeiten per E-Mail. Diese Zustimmung können Sie jederzeit widerrufen.',
        ],
      },
      {
        titel: 'B2. Wofür und auf welcher Grundlage',
        absaetze: [
          'Konto, Beiträge und Abrechnung: zur Erfüllung des Vertrags (Art. 6 Abs. 1 lit. b DSGVO). Protokoll und Schutz vor Missbrauch: berechtigtes Interesse an einem sicheren Dienst (Art. 6 Abs. 1 lit. f DSGVO). Neuigkeiten per E-Mail: nur mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).',
          'Für Inhalte, die Sie als Kunde einbringen (z. B. eigene Texte mit Namen von Personen), verarbeiten wir die Daten in Ihrem Auftrag (Auftragsverarbeitung nach Art. 28 DSGVO). Fragen dazu beantworten wir unter info@klarframe.com.',
        ],
      },
      {
        titel: 'B3. Wo Ihre Daten liegen',
        absaetze: ['Server und Speicher stehen in der EU (Hetzner, Deutschland). Für Recherche, Text und Stimme nutzen wir KI-Dienste. Dafür werden die jeweils nötigen Inhalte an diese Dienste geschickt – nur so viel, wie für den Arbeitsschritt nötig ist.'],
      },
      {
        titel: 'B4. Unterauftragnehmer',
        absaetze: ['Diese Dienstleister arbeiten für uns an Klarframe Radio:'],
        liste: [
          'Hetzner Online (Deutschland, EU): Server und Speicher.',
          'OpenAI (USA): Sprachmodelle für Recherche und Drehbuch, KI-Stimmen und Spracherkennung zum Nachhören. Übermittlung in die USA auf Grundlage des EU-US Data Privacy Framework bzw. der Standardvertragsklauseln der EU-Kommission.',
          'Moonshot AI / Kimi (Anbieter außerhalb der EU): Websuche für die Recherche. Dabei handelt es sich um eine Übermittlung in ein Drittland. Übermittelt werden nur Suchbegriffe zum Thema, keine personenbezogenen Daten unserer Kunden.',
          'Hostinger: Versand von E-Mails (z. B. Bestätigung der E-Mail-Adresse, Hinweise zum Konto).',
        ],
      },
      {
        titel: 'B5. Cookies',
        absaetze: ['Klarframe Radio setzt nur Cookies, die technisch nötig sind. Dafür brauchen wir keine Einwilligung. Werbe- oder Analyse-Cookies gibt es nicht.'],
        liste: [
          'radio_session – hält Sie angemeldet (bis zu 30 Tage, wird bei Nutzung verlängert).',
          'radio_mandant – merkt sich, in welchem Konto (Sender oder Firma) Sie gerade arbeiten.',
          'radio_sprache – merkt sich die Sprache der Oberfläche (1 Jahr).',
        ],
      },
      {
        titel: 'B6. Wie lange wir Daten aufbewahren',
        absaetze: [],
        liste: [
          'Quelltexte aus der Recherche und aus Ihren Angaben: 90 Tage.',
          'Zwischenstände (z. B. Audio einzelner Zeilen, ältere Fassungen): 30 Tage.',
          'Fertige Beiträge: solange Ihr Konto besteht – Sie können sie jederzeit selbst löschen. Probe-Beiträge: 30 Tage.',
          'Protokoll: 1 Jahr, danach anonymisiert.',
          'Gelöschte Konten: endgültig nach 14 Tagen gelöscht.',
          'Gesetzliche Aufbewahrungspflichten (z. B. für Rechnungen) bleiben unberührt.',
        ],
      },
      {
        titel: 'B7. Kennzeichnung als KI-Inhalt',
        absaetze: ['Nach der europäischen KI-Verordnung (EU AI Act, Art. 50) kennzeichnen wir jeden Beitrag: Er enthält eine gesprochene Kennung, dass die Stimmen von einer KI stammen, und zusätzlich einen maschinenlesbaren Vermerk in den Metadaten der Audiodatei.'],
      },
      {
        titel: 'B8. Personen in Beiträgen',
        absaetze: ['Nachrichten nennen Personen nur, wenn sie öffentlich von Bedeutung sind und in den Quellen genannt werden. Privatpersonen kommen in Glossen und heiteren Formaten nicht vor.'],
      },
    ] as Abschnitt[],
  },
  agb: {
    meta: { titel: 'AGB', beschreibung: 'Allgemeine Geschäftsbedingungen von Klarframe mit den Ergänzungen für Klarframe Radio: Leistung, Probeminuten, Minuten-Abrechnung, Verantwortung und Regeln für Inhalte.' },
    kicker: 'Rechtliches',
    titel: 'Allgemeine Geschäftsbedingungen',
    einleitung: 'Diese Bedingungen gelten für die digitalen Produkte, Services, Demos, Automatisierungen, Agenten, Portale und individuell vereinbarten Leistungen von Klarframe – und damit auch für Klarframe Radio. Teil A sind die allgemeinen Bedingungen von Klarframe. Teil B ergänzt, was speziell für Klarframe Radio gilt.',
    vorbemerkung: 'Individuelle Leistungsbeschreibungen, Angebote und Bestellbestätigungen können diese Rahmenbedingungen ergänzen. Zwingende gesetzliche Rechte, insbesondere von Verbrauchern, bleiben unberührt.',
    teilA: 'Teil A — Allgemeine Geschäftsbedingungen von Klarframe',
    teilB: 'Teil B — Was speziell für Klarframe Radio gilt',
    basis: [
      { titel: '1. Anbieter und Geltungsbereich', absaetze: ['Anbieter ist Klarframe, vertreten durch Oliver Condurache und Michael Vogel, Carrer Primavera 8, 07010 Palma, Spanien, NIF 20890460C, E-Mail: info@klarframe.com. Diese Bedingungen gelten für Verträge über Klarframe-Produkte und -Leistungen mit Unternehmen und, soweit angeboten, mit Verbrauchern.'] },
      { titel: '2. Leistungen von Klarframe', absaetze: ['Klarframe entwickelt und betreibt unter anderem KI-Automatisierungen, Voice- und Video-Agenten, Wissens- und Prozesssysteme, Übersetzungs- und Kommunikationslösungen, Webseiten, Portale sowie Beratungs- und Integrationsleistungen. Der genaue Leistungsumfang ergibt sich aus der jeweiligen Produktbeschreibung, dem individuellen Angebot oder der Bestellbestätigung.'] },
      { titel: '3. Vertragsschluss und Zugang', absaetze: ['Darstellungen auf Webseiten und in Demos sind grundsätzlich unverbindlich. Ein Vertrag kommt durch ein von Klarframe bestätigtes Angebot, eine Bestellbestätigung oder eine ausdrücklich bestätigte Bestellung zustande. Zugangsdaten sind persönlich zu behandeln und vor dem Zugriff Dritter zu schützen.'] },
      { titel: '4. Preise, Steuern und Abrechnung', absaetze: ['Es gelten die im Angebot oder Bestellvorgang ausgewiesenen Preise. Preise können netto oder brutto ausgewiesen werden; die anwendbare Umsatzsteuer wird nach den gesetzlichen Regeln bestimmt. Bei Unternehmen aus anderen EU-Mitgliedstaaten kann bei Vorliegen einer gültigen Umsatzsteuer-Identifikationsnummer das Reverse-Charge-Verfahren angewendet werden. Individuelle Leistungen, Nutzungsentgelte und Drittanbieter-Kosten werden im jeweiligen Angebot beschrieben.'] },
      {
        titel: '5. Mitwirkungspflichten des Kunden',
        absaetze: [],
        liste: [
          'Der Kunde stellt erforderliche Informationen, Zugänge, Inhalte und Ansprechpartner rechtzeitig und rechtmäßig bereit.',
          'Der Kunde darf Systeme, Agenten, Daten und Automatisierungen nur für rechtmäßige Zwecke und unter Beachtung von Datenschutz-, Wettbewerbs-, Urheber- und Telekommunikationsrecht nutzen.',
          'Der Kunde prüft Antworten, Vorschläge, Übersetzungen und Automatisierungsergebnisse vor wichtigen Entscheidungen oder Außenkommunikation angemessen durch Menschen.',
          'Zugangsdaten, API-Schlüssel und vertrauliche Inhalte dürfen nicht an unbefugte Dritte weitergegeben werden.',
        ],
      },
      { titel: '6. KI-Funktionen und Drittanbieter', absaetze: ['KI-Systeme erzeugen Ergebnisse probabilistisch. Sie können unvollständig, ungenau oder missverständlich sein und ersetzen keine rechtliche, medizinische, steuerliche oder sonstige Fachberatung. Je nach Produkt werden Drittanbieter wie Hosting-, Kommunikations-, Sprach-, Video-, Analyse- oder KI-Dienste eingebunden. Ihre technischen Bedingungen und Verfügbarkeit können die Leistung beeinflussen; Klarframe informiert über wesentliche Abhängigkeiten, soweit sie für das jeweilige Angebot relevant sind.'] },
      { titel: '7. Rechte an Inhalten und Ergebnissen', absaetze: ['Der Kunde bleibt für von ihm bereitgestellte Inhalte verantwortlich und muss über die erforderlichen Rechte verfügen. Rechte an Klarframe-Software, Vorlagen, Marken, Konzepten und wiederverwendbaren Komponenten verbleiben bei Klarframe oder den jeweiligen Rechteinhabern. Nutzungsrechte an individuell bereitgestellten Ergebnissen richten sich nach dem Angebot; gesetzlich zulässige Rechte Dritter bleiben vorbehalten.'] },
      { titel: '8. Verfügbarkeit und Änderungen', absaetze: ['Klarframe bemüht sich um eine zuverlässige Verfügbarkeit, schuldet aber keine ununterbrochene oder bestimmte Verfügbarkeit, sofern nicht ausdrücklich vereinbart. Wartung, Sicherheitsmaßnahmen, höhere Gewalt sowie Störungen bei Drittanbietern können die Nutzung vorübergehend einschränken. Klarframe darf Funktionen weiterentwickeln, wenn der vereinbarte Kernnutzen erhalten bleibt.'] },
      { titel: '9. Haftung', absaetze: ['Klarframe haftet unbeschränkt bei Vorsatz, grober Fahrlässigkeit sowie bei Schäden aus der Verletzung von Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet Klarframe nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren, typischen Schaden. Zwingende gesetzliche Haftungsregeln und Verbraucherrechte bleiben unberührt.'] },
      { titel: '10. Laufzeit und Beendigung', absaetze: ['Laufzeit, Kündigungsfristen und Folgen der Beendigung ergeben sich aus dem jeweiligen Angebot oder Vertrag. Bei schwerwiegenden Verstößen, rechtswidriger Nutzung oder Gefährdung von Systemen kann Klarframe Zugänge vorübergehend sperren oder den Vertrag aus wichtigem Grund beenden. Gesetzliche Kündigungsrechte bleiben bestehen.'] },
      { titel: '11. Verbraucher und Widerruf', absaetze: ['Soweit ein Kunde Verbraucher ist, gelten die gesetzlichen Informations- und Widerrufsrechte, sofern keine gesetzliche Ausnahme greift. Die erforderlichen Informationen und gegebenenfalls ein Muster-Widerrufsformular werden vor einem entsprechenden Vertragsschluss bereitgestellt. Beginnt eine digitale oder individuelle Leistung auf ausdrücklichen Wunsch vor Ablauf einer Widerrufsfrist, gelten die gesetzlichen Voraussetzungen und Folgen.'] },
      { titel: '12. Datenschutz und Vertraulichkeit', absaetze: ['Die Verarbeitung personenbezogener Daten wird in der jeweils passenden Klarframe-Datenschutzerklärung erläutert. Vertrauliche Informationen der jeweils anderen Partei werden angemessen geschützt und nur zur Durchführung des Vertrags verwendet, soweit keine gesetzliche Offenlegungspflicht besteht.'] },
      { titel: '13. Recht und Gerichtsstand', absaetze: ['Es gilt spanisches Recht. Für Verbraucher gelten zusätzlich die zwingenden Schutzvorschriften und Gerichtsstände ihres gewöhnlichen Aufenthalts. Für Unternehmer ist, soweit rechtlich zulässig, Palma de Mallorca als Gerichtsstand vereinbart.'] },
    ] as Abschnitt[],
    radio: [
      {
        titel: 'B1. Was Klarframe Radio leistet',
        absaetze: ['Klarframe Radio erstellt sendefertige Radio- und Podcast-Beiträge. Sie wählen einen von drei Wegen: eigene Texte, Webseiten-Adressen oder ein Thema, zu dem Klarframe Radio selbst recherchiert. Daraus entsteht ein Drehbuch, das ein, zwei oder drei KI-Stimmen sprechen. Jede gesprochene Zeile wird automatisch nachgehört. Den fertigen Beitrag erhalten Sie je nach Tarif als Download, per Feed oder über weitere Wege der Auslieferung.'],
      },
      {
        titel: 'B2. Probeminuten',
        absaetze: ['Nach der Registrierung erhalten Sie 10 Probeminuten, ohne Zahlungsdaten. Probe-Beiträge können Sie im Portal anhören. Herunterladen oder ausliefern lassen sie sich erst nach einer Bestellung. Probe-Beiträge enden mit einem gesprochenen Hinweis, dass es sich um eine Hörprobe handelt, und werden nach 30 Tagen gelöscht.'],
      },
      {
        titel: 'B3. Abrechnung nach Minuten',
        absaetze: [],
        liste: [
          'Abgerechnet werden die Sekunden fertigen Audios.',
          'Vor jedem Start sehen Sie die Ziellänge und wie viele Minuten dafür reserviert werden. Berechnet wird die tatsächliche Länge – höchstens die Ziellänge plus 15 Prozent. Der bestellte Preis ist die Obergrenze.',
          'Schlägt ein Beitrag fehl, werden keine Minuten verbraucht.',
          'Reicht Ihr Guthaben nicht, startet der Beitrag nicht. Geplante Beiträge pausieren, und wir informieren Sie per E-Mail. Es gibt keine Nachberechnung.',
          'Monatsminuten eines Abos verfallen am Monatsende. Nachgekaufte Minuten gelten bis zum Ende des Folgemonats.',
          'Es gelten die Preise, die vor der Bestellung angezeigt werden.',
        ],
      },
      {
        titel: 'B4. Ihre Verantwortung für die Veröffentlichung',
        absaetze: [
          'Klarframe Radio liefert Beiträge mit Belegen: Jede Zahl ist mit einer Quelle verknüpft. Ob und wann ein Beitrag gesendet oder veröffentlicht wird, entscheiden Sie. Dafür tragen Sie die Verantwortung.',
          'Für Nachrichten empfehlen wir, das Drehbuch vor der Vertonung durch Ihre eigene Redaktion freigeben zu lassen. Diese Freigabe können Sie im Portal einschalten.',
          'Pflichten aus dem Rundfunkrecht (z. B. eine Zulassung) betreffen den Sender, nicht Klarframe als Zulieferer.',
        ],
      },
      {
        titel: 'B5. Eigene Inhalte und Quellen',
        absaetze: ['Für Texte und Webseiten, die Sie angeben, brauchen Sie die nötigen Rechte. Bei der Recherche übernimmt Klarframe Radio Fakten, nie Formulierungen: Das Drehbuch wird neu geschrieben, lange wörtliche Übernahmen werden automatisch erkannt und umformuliert.'],
      },
      {
        titel: 'B6. Verbotene Inhalte',
        absaetze: ['Klarframe Radio erzeugt nie:'],
        liste: [
          'Hetze, Diskriminierung oder Gewaltverherrlichung,',
          'Wahlbeeinflussung durch Falschinformation,',
          'Werbung für verbotene Produkte,',
          'medizinische oder finanzielle Heilsversprechen,',
          'Inhalte über Privatpersonen ohne öffentliches Interesse,',
          'Nachahmung realer Personen.',
        ],
      },
      {
        titel: 'B7. Was bei einem Verstoß passiert',
        absaetze: ['Erkennt unsere Prüfung einen solchen Inhalt, wird der Beitrag gestoppt. Bei schweren oder wiederholten Verstößen gilt Teil A Nr. 10.'],
      },
      {
        titel: 'B8. Stimmen',
        absaetze: ['Wir setzen nur geprüfte Stimmen ein. Keine Stimme ist einer realen, bekannten Person nachempfunden. In Formaten wie dem Interview sprechen nur erfundene Rollen (z. B. „unser KI-Experte"); echte Personen werden nie nachgesprochen, und Zitate werden nie als Originalton ausgegeben. Eine eigene Stimme (Stimmklon) gibt es nur nach gesonderter Vereinbarung und mit schriftlicher Einwilligung der Person.'],
      },
      {
        titel: 'B9. Kennzeichnung als KI-Inhalt',
        absaetze: ['Jeder Beitrag enthält eine gesprochene Kennung, dass die Stimmen von einer KI stammen, und einen Vermerk in den Metadaten der Audiodatei (EU AI Act, Art. 50). Diese Kennzeichnung ist Pflicht. Bitte entfernen Sie sie nicht.'],
      },
    ] as Abschnitt[],
  },
  bot: {
    meta: { titel: 'KlarframeRadioBot — Info für Webseitenbetreiber', beschreibung: 'Was der Recherche-Bot KlarframeRadioBot tut, welche Regeln er befolgt und wie Sie ihn für Ihre Webseite sperren.' },
    kicker: 'Für Webseitenbetreiber',
    titel: 'KlarframeRadioBot',
    einleitung: 'Sie haben diesen Namen in den Zugriffsdaten Ihrer Webseite gesehen? Hier erfahren Sie, was unser Recherche-Bot tut und wie Sie ihn sperren können.',
    kennungTitel: 'So meldet sich der Bot',
    abschnitte: [
      {
        titel: 'Was der Bot tut',
        absaetze: [
          'Klarframe Radio erstellt Radio- und Podcast-Beiträge. Damit jede Aussage belegt ist, liest der Bot öffentlich zugängliche Artikel und prüft Fakten mit ihrer Quelle.',
          'Wir übernehmen Fakten, nie Formulierungen. Jedes Drehbuch wird neu geschrieben. Ihre Texte werden nicht weitergegeben und nach 90 Tagen gelöscht.',
        ],
      },
      {
        titel: 'Welche Regeln er befolgt',
        absaetze: [],
        liste: [
          'Er befolgt Ihre robots.txt. Ist ein Abruf dort verboten, findet er nicht statt.',
          'Er erkennt maschinenlesbare Nutzungsvorbehalte für Text- und Data-Mining.',
          'Höchstens eine Anfrage alle 2 Sekunden je Domain.',
          'Bei Überlastung Ihres Servers (Antwort 429 oder 503) pausiert er Ihre Domain für eine Stunde.',
          'Keine Umgehung von Bezahlschranken, Anmeldungen oder Captchas.',
        ],
      },
      {
        titel: 'So sperren Sie den Bot',
        absaetze: ['Tragen Sie diese Zeilen in die Datei robots.txt Ihrer Webseite ein. Der Bot hält sich spätestens nach 24 Stunden daran.'],
      },
      {
        titel: 'Sperrwunsch oder Frage',
        absaetze: ['Schreiben Sie an info@klarframe.com und nennen Sie Ihre Domain. Wir setzen sie sofort auf unsere Sperrliste.'],
      },
    ] as Abschnitt[],
  },
}

export type RechtTexte = typeof de

const en: RechtTexte = {
  rahmen: {
    startseite: 'Klarframe Radio — home',
    zurueck: 'Back to home',
    sprache: 'Page language',
    sprachen: { de: 'Deutsch', en: 'English', es: 'Español' },
    zumInhalt: 'Skip to content',
    fussText: 'Broadcast-ready radio and podcast pieces with AI voices.',
    rechtliches: 'Legal',
    konto: 'Account',
    anmelden: 'Log in',
    testen: 'Try it free',
    impressum: 'Legal notice',
    datenschutz: 'Privacy',
    agb: 'Terms',
    bot: 'For website owners',
    rechte: 'Klarframe',
    stand: 'Updated: 23 September 2026',
    radioMarke: 'Addition for Klarframe Radio',
    radioPruefung: 'We will have these additions for Klarframe Radio reviewed by a lawyer before the official launch. Until then, the wording may still change.',
    fragen: 'Questions? Write to us:',
  },
  impressum: {
    meta: { titel: 'Legal notice', beschreibung: 'Legal notice for Klarframe Radio (radio.klarframe.com): provider, address, contact and tax ID (NIF).' },
    kicker: 'Legal',
    titel: 'Legal notice',
    einleitung: 'Klarframe Radio is a service by Klarframe.',
    verantwortlich: 'Responsible',
    anschrift: 'Address',
    email: 'Email',
    nif: 'NIF',
  },
  datenschutz: {
    meta: { titel: 'Privacy policy', beschreibung: 'Privacy policy of Klarframe Radio: which data we process, where it is stored, which providers are involved and which rights you have.' },
    kicker: 'Legal',
    titel: 'Privacy policy',
    einleitung: 'This privacy policy explains which personal data Klarframe processes for Klarframe Radio (radio.klarframe.com), why we use it and which rights you have. Part A is Klarframe’s general privacy information. Part B adds what applies specifically to Klarframe Radio.',
    teilA: 'Part A — General privacy information from Klarframe',
    teilB: 'Part B — What applies specifically to Klarframe Radio',
    basis: [
      { titel: '1. Controller', absaetze: ['The controller responsible for processing personal data is:', 'Klarframe, Carrer Primavera 8, 07010 Palma, Spain, info@klarframe.com'] },
      {
        titel: '2. Why we process data',
        absaetze: [],
        liste: [
          'Providing, securing and technically operating the website and the Klarframe Radio service.',
          'Handling messages, contact requests, sign-ups and order processes.',
          'Producing the radio and podcast pieces you order in the portal. Your inputs, texts and sources are processed so the requested piece can be made.',
          'Complying with legal obligations and establishing, exercising or defending legal claims.',
        ],
      },
      { titel: '3. Data that may be involved', absaetze: ['Depending on how you use Klarframe Radio, this may include your name, email address, company, message, order information, technical connection data (such as IP address, time, browser and requested resource), and content you voluntarily enter. Please do not enter special-category personal data or confidential credentials into texts for pieces.'] },
      { titel: '4. Legal bases', absaetze: ['Depending on the situation, processing is based on Article 6(1)(a) GDPR (consent), Article 6(1)(b) GDPR (pre-contractual steps or contract), Article 6(1)(c) GDPR (legal obligation) or Article 6(1)(f) GDPR (legitimate interests, especially secure and reliable systems). You may withdraw consent at any time with effect for the future.'] },
      { titel: '5. Services and recipients', absaetze: ['For hosting, email and AI features, carefully selected technical providers process data on our behalf. Part B lists the ones used for Klarframe Radio. We do not sell personal data for advertising. Transfers outside the EEA take place only where the legal requirements and appropriate safeguards are met.'] },
      { titel: '6. Retention', absaetze: ['We keep personal data only for as long as necessary for the relevant purpose or as required by law. It is then deleted or anonymised. The specific periods for Klarframe Radio are listed in Part B.'] },
      { titel: '7. Your rights', absaetze: ['You may request access, rectification, erasure, restriction of processing and data portability, and you may object where the legal requirements are met. You can withdraw consent at any time. Contact info@klarframe.com. You also have the right to lodge a complaint with a data protection supervisory authority, in particular the Spanish Agencia Española de Protección de Datos (AEPD).'] },
      { titel: '8. Security and cookies', absaetze: ['We use technical and organisational measures to protect data against loss, misuse and unauthorised access. The website only uses storage mechanisms that are necessary for its core functions (see Part B). Klarframe Radio uses no web analytics and no advertising trackers.'] },
      { titel: '9. Updates', absaetze: ['We may update this policy when features, providers or legal requirements change. The version published on this page is the applicable version. Individual customer projects may have additional agreements and notices.'] },
    ],
    radio: [
      {
        titel: 'B1. What data Klarframe Radio processes',
        absaetze: [],
        liste: [
          'Account data: name, email address, company or station, type of business, country and language. We never store your password in plain text, only as an encrypted check value.',
          'Your content: topics, your own texts and website addresses you provide for a piece, plus the settings of your shows.',
          'Results: sources found, generated scripts and the finished audio.',
          'Log: important account events (e.g. log-in, order, deletion) with the time and a shortened, encrypted value of the IP address (IP hash). We do not store the full IP address there.',
          'Access details for delivery (e.g. to your server) are stored encrypted only and never shown again.',
          'If you agree when signing up, we send you news by email. You can withdraw this consent at any time.',
        ],
      },
      {
        titel: 'B2. Purposes and legal bases',
        absaetze: [
          'Account, pieces and billing: to perform the contract (Art. 6(1)(b) GDPR). Log and abuse prevention: legitimate interest in a secure service (Art. 6(1)(f) GDPR). News by email: only with your consent (Art. 6(1)(a) GDPR).',
          'For content you bring in as a customer (e.g. your own texts naming people), we process the data on your behalf (processing under Art. 28 GDPR). Questions: info@klarframe.com.',
        ],
      },
      {
        titel: 'B3. Where your data is stored',
        absaetze: ['Servers and storage are in the EU (Hetzner, Germany). For research, writing and voices we use AI services. Only the content needed for each step is sent to them.'],
      },
      {
        titel: 'B4. Sub-processors',
        absaetze: ['These providers work for us on Klarframe Radio:'],
        liste: [
          'Hetzner Online (Germany, EU): servers and storage.',
          'OpenAI (USA): language models for research and scripts, AI voices and speech recognition for checking each line. Transfer to the USA based on the EU-US Data Privacy Framework or the European Commission’s Standard Contractual Clauses.',
          'Moonshot AI / Kimi (provider outside the EU): web search for research. This is a transfer to a third country. Only search terms about the topic are sent — no personal data of our customers.',
          'Hostinger: sending emails (e.g. email address confirmation, account notices).',
        ],
      },
      {
        titel: 'B5. Cookies',
        absaetze: ['Klarframe Radio only sets cookies that are technically necessary. No consent is needed for them. There are no advertising or analytics cookies.'],
        liste: [
          'radio_session – keeps you logged in (up to 30 days, extended while you use it).',
          'radio_mandant – remembers which account (station or company) you are working in.',
          'radio_sprache – remembers the interface language (1 year).',
        ],
      },
      {
        titel: 'B6. How long we keep data',
        absaetze: [],
        liste: [
          'Source texts from research and from your input: 90 days.',
          'Intermediate files (e.g. audio of single lines, older versions): 30 days.',
          'Finished pieces: as long as your account exists — you can delete them at any time. Trial pieces: 30 days.',
          'Log: 1 year, then anonymised.',
          'Deleted accounts: permanently deleted after 14 days.',
          'Statutory retention duties (e.g. for invoices) remain unaffected.',
        ],
      },
      {
        titel: 'B7. Labelling as AI content',
        absaetze: ['Under the EU AI Act (Art. 50) we label every piece: it contains a spoken notice that the voices are AI-generated, plus a machine-readable note in the audio file’s metadata.'],
      },
      {
        titel: 'B8. People in pieces',
        absaetze: ['News pieces only name people who are of public relevance and named in the sources. Private individuals never appear in satirical or light-hearted formats.'],
      },
    ],
  },
  agb: {
    meta: { titel: 'Terms', beschreibung: 'Klarframe’s general terms with the additions for Klarframe Radio: service, trial minutes, billing by the minute, responsibility and content rules.' },
    kicker: 'Legal',
    titel: 'General Terms and Conditions',
    einleitung: 'These terms apply to Klarframe digital products, services, demos, automations, agents, portals and individually agreed implementation work — and therefore also to Klarframe Radio. Part A is Klarframe’s general terms. Part B adds what applies specifically to Klarframe Radio.',
    vorbemerkung: 'Individual scopes of work, offers and order confirmations may supplement these framework terms. Mandatory statutory rights, especially consumer rights, remain unaffected.',
    teilA: 'Part A — General Terms and Conditions of Klarframe',
    teilB: 'Part B — What applies specifically to Klarframe Radio',
    basis: [
      { titel: '1. Provider and scope', absaetze: ['The provider is Klarframe, represented by Oliver Condurache and Michael Vogel, Carrer Primavera 8, 07010 Palma, Spain, NIF 20890460C, email: info@klarframe.com. These terms apply to contracts for Klarframe products and services with businesses and, where offered, consumers.'] },
      { titel: '2. Klarframe services', absaetze: ['Klarframe develops and operates AI automations, voice and video agents, knowledge and process systems, translation and communication solutions, websites, portals, and consulting and integration services. The exact scope is defined by the relevant product description, individual offer or order confirmation.'] },
      { titel: '3. Contract and access', absaetze: ['Website and demo presentations are generally non-binding. A contract is formed through an offer confirmed by Klarframe, an order confirmation or an expressly confirmed order. Access credentials must be kept personal and protected from third-party access.'] },
      { titel: '4. Prices, taxes and billing', absaetze: ['The prices shown in the offer or order process apply. Prices may be shown net or gross; applicable VAT is determined under the law. For businesses in another EU Member State with a valid VAT ID, the reverse-charge procedure may apply. Individual work, usage fees and third-party costs are described in the relevant offer.'] },
      {
        titel: '5. Customer responsibilities',
        absaetze: [],
        liste: [
          'The customer provides required information, access, content and contacts on time and lawfully.',
          'The customer uses systems, agents, data and automations only for lawful purposes and in compliance with privacy, competition, copyright and telecommunications law.',
          'The customer appropriately reviews answers, suggestions, translations and automation results with a human before important decisions or external communications.',
          'Credentials, API keys and confidential content must not be disclosed to unauthorised third parties.',
        ],
      },
      { titel: '6. AI features and third parties', absaetze: ['AI systems produce probabilistic outputs. They may be incomplete, inaccurate or ambiguous and do not replace legal, medical, tax or other professional advice. Depending on the product, hosting, communications, speech, video, analytics or AI providers may be integrated. Their technical terms and availability can affect the service; Klarframe will communicate material dependencies where relevant to the offer.'] },
      { titel: '7. Content and output rights', absaetze: ['The customer remains responsible for supplied content and must hold the necessary rights. Rights in Klarframe software, templates, brands, concepts and reusable components remain with Klarframe or the relevant rights holders. Usage rights for individually delivered results follow the offer; statutory third-party rights remain reserved.'] },
      { titel: '8. Availability and changes', absaetze: ['Klarframe aims for reliable availability but does not promise uninterrupted or specific availability unless expressly agreed. Maintenance, security measures, force majeure and third-party outages may temporarily limit use. Klarframe may evolve features where the agreed core benefit is preserved.'] },
      { titel: '9. Liability', absaetze: ['Klarframe is fully liable for intent, gross negligence and injury to life, body or health. For ordinary negligence, liability is limited to breaches of essential contractual duties and the foreseeable, typical loss. Mandatory statutory liability rules and consumer rights remain unaffected.'] },
      { titel: '10. Term and termination', absaetze: ['Term, notice periods and effects of termination are set out in the relevant offer or contract. In case of serious breach, unlawful use or risk to systems, Klarframe may suspend access or terminate for good cause. Statutory termination rights remain unaffected.'] },
      { titel: '11. Consumers and withdrawal', absaetze: ['Where a customer is a consumer, statutory information and withdrawal rights apply unless a statutory exception applies. Required information and, where applicable, a model withdrawal form are provided before the relevant contract is concluded. If digital or individual services start before a withdrawal period ends at the consumer’s express request, the statutory requirements and consequences apply.'] },
      { titel: '12. Privacy and confidentiality', absaetze: ['Processing of personal data is explained in the applicable Klarframe privacy notice. Each party will protect the other party’s confidential information appropriately and use it only to perform the contract, unless disclosure is required by law.'] },
      { titel: '13. Governing law and venue', absaetze: ['Spanish law applies. Consumers also retain the mandatory protections and venues of their habitual residence. For businesses, to the extent legally permitted, Palma de Mallorca is agreed as the venue.'] },
    ],
    radio: [
      {
        titel: 'B1. What Klarframe Radio provides',
        absaetze: ['Klarframe Radio produces broadcast-ready radio and podcast pieces. You choose one of three ways: your own texts, website addresses, or a topic that Klarframe Radio researches itself. From this, a script is written and spoken by one, two or three AI voices. Every spoken line is checked automatically. Depending on your plan, you receive the finished piece as a download, via feed or through other delivery options.'],
      },
      {
        titel: 'B2. Trial minutes',
        absaetze: ['After signing up you get 10 trial minutes, without payment details. You can listen to trial pieces in the portal. They can only be downloaded or delivered after an order. Trial pieces end with a spoken notice that they are a sample and are deleted after 30 days.'],
      },
      {
        titel: 'B3. Billing by the minute',
        absaetze: [],
        liste: [
          'We bill the seconds of finished audio.',
          'Before each start you see the target length and how many minutes are reserved for it. We charge the actual length — at most the target length plus 15 percent. The price you ordered is the upper limit.',
          'If a piece fails, no minutes are used.',
          'If your balance is not enough, the piece does not start. Scheduled pieces pause and we let you know by email. There is no additional charge afterwards.',
          'Monthly minutes of a plan expire at the end of the month. Extra minutes you buy are valid until the end of the following month.',
          'The prices shown before ordering apply.',
        ],
      },
      {
        titel: 'B4. Your responsibility for publication',
        absaetze: [
          'Klarframe Radio delivers pieces with evidence: every number is linked to a source. You decide whether and when a piece is broadcast or published, and you are responsible for it.',
          'For news, we recommend having your own newsroom approve the script before it is voiced. You can switch on this approval step in the portal.',
          'Broadcasting-law duties (e.g. a licence) apply to the station, not to Klarframe as a supplier.',
        ],
      },
      {
        titel: 'B5. Your own content and sources',
        absaetze: ['You need the necessary rights for texts and websites you provide. In research, Klarframe Radio takes facts, never wording: the script is written from scratch, and long verbatim passages are detected and rewritten automatically.'],
      },
      {
        titel: 'B6. Prohibited content',
        absaetze: ['Klarframe Radio never produces:'],
        liste: [
          'hate speech, discrimination or glorification of violence,',
          'election manipulation through false information,',
          'advertising for prohibited products,',
          'medical or financial miracle promises,',
          'content about private individuals without public interest,',
          'imitation of real people.',
        ],
      },
      {
        titel: 'B7. What happens in case of a breach',
        absaetze: ['If our checks detect such content, the piece is stopped. For serious or repeated breaches, Part A no. 10 applies.'],
      },
      {
        titel: 'B8. Voices',
        absaetze: ['We only use vetted voices. No voice is modelled on a real, well-known person. In formats such as the interview, only fictional roles speak (e.g. “our AI expert”); real people are never imitated, and quotes are never presented as original recordings. A custom voice (voice clone) is only available under a separate agreement and with the written consent of the person.'],
      },
      {
        titel: 'B9. Labelling as AI content',
        absaetze: ['Every piece contains a spoken notice that the voices are AI-generated and a note in the audio file’s metadata (EU AI Act, Art. 50). This labelling is mandatory. Please do not remove it.'],
      },
    ],
  },
  bot: {
    meta: { titel: 'KlarframeRadioBot — info for website owners', beschreibung: 'What the research bot KlarframeRadioBot does, which rules it follows and how to block it on your website.' },
    kicker: 'For website owners',
    titel: 'KlarframeRadioBot',
    einleitung: 'Seen this name in your website’s access logs? Here you can find out what our research bot does and how to block it.',
    kennungTitel: 'How the bot identifies itself',
    abschnitte: [
      {
        titel: 'What the bot does',
        absaetze: [
          'Klarframe Radio produces radio and podcast pieces. To back every statement with evidence, the bot reads publicly accessible articles and checks facts against their source.',
          'We take facts, never wording. Every script is written from scratch. Your texts are not passed on and are deleted after 90 days.',
        ],
      },
      {
        titel: 'Which rules it follows',
        absaetze: [],
        liste: [
          'It follows your robots.txt. If a fetch is disallowed there, it does not happen.',
          'It recognises machine-readable text and data mining reservations.',
          'At most one request every 2 seconds per domain.',
          'If your server is overloaded (response 429 or 503), it pauses your domain for one hour.',
          'It never bypasses paywalls, logins or captchas.',
        ],
      },
      {
        titel: 'How to block the bot',
        absaetze: ['Add these lines to your website’s robots.txt file. The bot follows them within 24 hours at the latest.'],
      },
      {
        titel: 'Block request or question',
        absaetze: ['Write to info@klarframe.com and name your domain. We add it to our block list right away.'],
      },
    ],
  },
}

const es: RechtTexte = {
  rahmen: {
    startseite: 'Klarframe Radio — inicio',
    zurueck: 'Volver al inicio',
    sprache: 'Idioma de la página',
    sprachen: { de: 'Deutsch', en: 'English', es: 'Español' },
    zumInhalt: 'Ir al contenido',
    fussText: 'Piezas de radio y pódcast listas para emitir, con voces de IA.',
    rechtliches: 'Legal',
    konto: 'Cuenta',
    anmelden: 'Iniciar sesión',
    testen: 'Probar gratis',
    impressum: 'Aviso legal',
    datenschutz: 'Privacidad',
    agb: 'Términos',
    bot: 'Para webmasters',
    rechte: 'Klarframe',
    stand: 'Actualizado: 23/09/2026',
    radioMarke: 'Complemento para Klarframe Radio',
    radioPruefung: 'Antes del lanzamiento oficial, un abogado o una abogada revisará estos complementos para Klarframe Radio. Hasta entonces, el texto aún puede cambiar.',
    fragen: '¿Preguntas? Escríbenos:',
  },
  impressum: {
    meta: { titel: 'Aviso legal', beschreibung: 'Aviso legal de Klarframe Radio (radio.klarframe.com): titular, dirección, contacto y NIF.' },
    kicker: 'Legal',
    titel: 'Aviso legal',
    einleitung: 'Klarframe Radio es un servicio de Klarframe.',
    verantwortlich: 'Responsables',
    anschrift: 'Dirección',
    email: 'Correo electrónico',
    nif: 'NIF',
  },
  datenschutz: {
    meta: { titel: 'Política de privacidad', beschreibung: 'Política de privacidad de Klarframe Radio: qué datos tratamos, dónde se guardan, qué proveedores intervienen y qué derechos tienes.' },
    kicker: 'Legal',
    titel: 'Política de privacidad',
    einleitung: 'Esta política explica qué datos personales trata Klarframe en Klarframe Radio (radio.klarframe.com), para qué los usamos y qué derechos tienes. La parte A es la información general de privacidad de Klarframe. La parte B añade lo que se aplica específicamente a Klarframe Radio.',
    teilA: 'Parte A — Información general de privacidad de Klarframe',
    teilB: 'Parte B — Lo que se aplica específicamente a Klarframe Radio',
    basis: [
      { titel: '1. Responsable del tratamiento', absaetze: ['El responsable del tratamiento de los datos personales es:', 'Klarframe, Carrer Primavera 8, 07010 Palma, España, info@klarframe.com'] },
      {
        titel: '2. Para qué tratamos datos',
        absaetze: [],
        liste: [
          'Prestar, proteger y mantener técnicamente el sitio web y el servicio Klarframe Radio.',
          'Gestionar mensajes, solicitudes de contacto, registros y procesos de pedido.',
          'Producir las piezas de radio y pódcast que encargas en el portal. Para ello se tratan tus entradas, textos y fuentes.',
          'Cumplir obligaciones legales y formular o defender reclamaciones.',
        ],
      },
      { titel: '3. Datos que pueden verse implicados', absaetze: ['Según el uso, pueden tratarse nombre, correo electrónico, empresa, mensaje, información de pedidos, datos técnicos de conexión (como IP, hora, navegador y recurso solicitado) y el contenido que introduzcas voluntariamente. No introduzcas categorías especiales de datos ni credenciales confidenciales en los textos para piezas.'] },
      { titel: '4. Bases jurídicas', absaetze: ['Según el caso, el tratamiento se basa en el artículo 6.1.a RGPD (consentimiento), 6.1.b RGPD (medidas precontractuales o contrato), 6.1.c RGPD (obligación legal) o 6.1.f RGPD (interés legítimo, especialmente sistemas seguros y fiables). Puedes retirar tu consentimiento en cualquier momento con efectos futuros.'] },
      { titel: '5. Servicios y destinatarios', absaetze: ['Para alojamiento, correo electrónico y funciones de IA, proveedores técnicos seleccionados tratan datos por nuestra cuenta. En la parte B figuran los que usa Klarframe Radio. No vendemos datos personales para publicidad. Las transferencias fuera del EEE solo se realizan con requisitos legales y garantías adecuadas.'] },
      { titel: '6. Conservación', absaetze: ['Conservamos los datos personales solo durante el tiempo necesario para la finalidad correspondiente o durante los plazos legales. Después se eliminan o anonimizan. Los plazos concretos de Klarframe Radio figuran en la parte B.'] },
      { titel: '7. Tus derechos', absaetze: ['Puedes solicitar acceso, rectificación, supresión, limitación y portabilidad, y oponerte cuando se cumplan los requisitos legales. Puedes retirar tu consentimiento en cualquier momento. Escribe a info@klarframe.com. También puedes reclamar ante una autoridad de control, en particular ante la Agencia Española de Protección de Datos (AEPD).'] },
      { titel: '8. Seguridad y cookies', absaetze: ['Aplicamos medidas técnicas y organizativas para proteger los datos frente a pérdida, uso indebido y acceso no autorizado. El sitio solo usa mecanismos de almacenamiento necesarios para sus funciones básicas (ver parte B). Klarframe Radio no utiliza analítica web ni rastreadores publicitarios.'] },
      { titel: '9. Actualizaciones', absaetze: ['Podemos actualizar esta política cuando cambien las funciones, los proveedores o las exigencias legales. La versión publicada en esta página es la aplicable. Los proyectos individuales de clientes pueden tener acuerdos y avisos adicionales.'] },
    ],
    radio: [
      {
        titel: 'B1. Qué datos trata Klarframe Radio',
        absaetze: [],
        liste: [
          'Datos de la cuenta: nombre, correo electrónico, empresa o emisora, tipo de actividad, país e idioma. Nunca guardamos tu contraseña en texto legible, solo como valor de comprobación cifrado.',
          'Tus contenidos: temas, textos propios y direcciones web que indicas para una pieza, además de los ajustes de tus programas.',
          'Resultados: fuentes encontradas, guiones generados y el audio terminado.',
          'Registro: operaciones importantes de la cuenta (p. ej. inicio de sesión, pedido, eliminación) con la hora y un valor abreviado y cifrado de la dirección IP (hash de IP). La IP completa no se guarda ahí.',
          'Los datos de acceso para la entrega (p. ej. a tu servidor) solo se guardan cifrados y nunca se vuelven a mostrar.',
          'Si lo aceptas al registrarte, te enviamos novedades por correo. Puedes retirar este consentimiento en cualquier momento.',
        ],
      },
      {
        titel: 'B2. Finalidades y bases jurídicas',
        absaetze: [
          'Cuenta, piezas y facturación: para cumplir el contrato (art. 6.1.b RGPD). Registro y prevención de abusos: interés legítimo en un servicio seguro (art. 6.1.f RGPD). Novedades por correo: solo con tu consentimiento (art. 6.1.a RGPD).',
          'Para los contenidos que aportas como cliente (p. ej. textos propios que nombran a personas), tratamos los datos por tu cuenta (encargo del tratamiento según el art. 28 RGPD). Consultas: info@klarframe.com.',
        ],
      },
      {
        titel: 'B3. Dónde se guardan tus datos',
        absaetze: ['Los servidores y el almacenamiento están en la UE (Hetzner, Alemania). Para la investigación, la redacción y las voces usamos servicios de IA. A ellos solo se envía el contenido necesario para cada paso.'],
      },
      {
        titel: 'B4. Subencargados',
        absaetze: ['Estos proveedores trabajan para nosotros en Klarframe Radio:'],
        liste: [
          'Hetzner Online (Alemania, UE): servidores y almacenamiento.',
          'OpenAI (EE. UU.): modelos de lenguaje para investigación y guion, voces de IA y reconocimiento de voz para comprobar cada línea. Transferencia a EE. UU. basada en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo de la Comisión Europea.',
          'Moonshot AI / Kimi (proveedor fuera de la UE): búsqueda web para la investigación. Se trata de una transferencia a un tercer país. Solo se envían términos de búsqueda sobre el tema, nunca datos personales de nuestros clientes.',
          'Hostinger: envío de correos (p. ej. confirmación de la dirección de correo, avisos de la cuenta).',
        ],
      },
      {
        titel: 'B5. Cookies',
        absaetze: ['Klarframe Radio solo usa cookies técnicamente necesarias. No requieren consentimiento. No hay cookies publicitarias ni de analítica.'],
        liste: [
          'radio_session – mantiene tu sesión iniciada (hasta 30 días, se prolonga mientras la usas).',
          'radio_mandant – recuerda en qué cuenta (emisora o empresa) estás trabajando.',
          'radio_sprache – recuerda el idioma de la interfaz (1 año).',
        ],
      },
      {
        titel: 'B6. Cuánto tiempo guardamos los datos',
        absaetze: [],
        liste: [
          'Textos fuente de la investigación y de tus indicaciones: 90 días.',
          'Estados intermedios (p. ej. audio de líneas sueltas, versiones anteriores): 30 días.',
          'Piezas terminadas: mientras exista tu cuenta; puedes borrarlas cuando quieras. Piezas de prueba: 30 días.',
          'Registro: 1 año, después se anonimiza.',
          'Cuentas eliminadas: se borran definitivamente a los 14 días.',
          'Se mantienen las obligaciones legales de conservación (p. ej. de facturas).',
        ],
      },
      {
        titel: 'B7. Identificación como contenido de IA',
        absaetze: ['Conforme al Reglamento europeo de IA (AI Act, art. 50), identificamos cada pieza: contiene un aviso hablado de que las voces son de IA y, además, una nota legible por máquina en los metadatos del archivo de audio.'],
      },
      {
        titel: 'B8. Personas en las piezas',
        absaetze: ['Las noticias solo nombran a personas de relevancia pública que aparecen en las fuentes. Las personas privadas nunca aparecen en formatos satíricos o de humor.'],
      },
    ],
  },
  agb: {
    meta: { titel: 'Términos y condiciones', beschreibung: 'Términos generales de Klarframe con los complementos para Klarframe Radio: servicio, minutos de prueba, facturación por minutos, responsabilidad y reglas de contenido.' },
    kicker: 'Legal',
    titel: 'Términos y condiciones generales',
    einleitung: 'Estas condiciones se aplican a los productos digitales, servicios, demos, automatizaciones, agentes, portales y trabajos de implementación acordados con Klarframe, y por tanto también a Klarframe Radio. La parte A son las condiciones generales de Klarframe. La parte B añade lo que se aplica específicamente a Klarframe Radio.',
    vorbemerkung: 'Las ofertas, confirmaciones de pedido y descripciones individuales pueden completar estas condiciones marco. Los derechos legales imperativos, especialmente los de consumidores, no se ven afectados.',
    teilA: 'Parte A — Términos y condiciones generales de Klarframe',
    teilB: 'Parte B — Lo que se aplica específicamente a Klarframe Radio',
    basis: [
      { titel: '1. Proveedor y ámbito', absaetze: ['El proveedor es Klarframe, representado por Oliver Condurache y Michael Vogel, Carrer Primavera 8, 07010 Palma, España, NIF 20890460C, correo: info@klarframe.com. Estas condiciones se aplican a contratos de productos y servicios Klarframe con empresas y, cuando se ofrezcan, consumidores.'] },
      { titel: '2. Servicios de Klarframe', absaetze: ['Klarframe desarrolla y opera automatizaciones con IA, agentes de voz y vídeo, sistemas de conocimiento y procesos, soluciones de traducción y comunicación, sitios web, portales y servicios de consultoría e integración. El alcance exacto se define en la descripción del producto, la oferta o la confirmación del pedido.'] },
      { titel: '3. Contrato y acceso', absaetze: ['Las presentaciones de la web y las demos son, por regla general, no vinculantes. El contrato se formaliza mediante una oferta confirmada por Klarframe, una confirmación de pedido o un pedido expresamente confirmado. Las credenciales deben mantenerse personales y protegidas frente a terceros.'] },
      { titel: '4. Precios, impuestos y facturación', absaetze: ['Se aplican los precios indicados en la oferta o en el proceso de pedido. Los precios pueden mostrarse netos o brutos; el IVA aplicable se determina conforme a la ley. Para empresas de otro Estado miembro de la UE con un NIF-IVA válido puede aplicarse la inversión del sujeto pasivo. Los trabajos individuales, tarifas de uso y costes de terceros se describen en la oferta correspondiente.'] },
      {
        titel: '5. Obligaciones del cliente',
        absaetze: [],
        liste: [
          'El cliente facilita a tiempo y de forma lícita la información, accesos, contenidos y contactos necesarios.',
          'El cliente utilizará sistemas, agentes, datos y automatizaciones solo para fines lícitos y respetando la normativa de privacidad, competencia, propiedad intelectual y telecomunicaciones.',
          'Antes de decisiones importantes o comunicaciones externas, el cliente revisará adecuadamente con una persona las respuestas, sugerencias, traducciones y resultados de automatización.',
          'No se compartirán credenciales, claves API ni contenidos confidenciales con terceros no autorizados.',
        ],
      },
      { titel: '6. Funciones de IA y terceros', absaetze: ['Los sistemas de IA generan resultados probabilísticos. Pueden ser incompletos, inexactos o ambiguos y no sustituyen asesoramiento jurídico, médico, fiscal u otro asesoramiento profesional. Según el producto, pueden integrarse proveedores de alojamiento, comunicaciones, voz, vídeo, analítica o IA. Sus condiciones y disponibilidad pueden afectar al servicio; Klarframe comunicará las dependencias relevantes para la oferta.'] },
      { titel: '7. Contenidos y derechos de uso', absaetze: ['El cliente es responsable de los contenidos que aporta y debe disponer de los derechos necesarios. Los derechos sobre el software, plantillas, marcas, conceptos y componentes reutilizables de Klarframe permanecen en Klarframe o en sus titulares. Los derechos de uso de los resultados individuales se rigen por la oferta; se reservan los derechos legales de terceros.'] },
      { titel: '8. Disponibilidad y cambios', absaetze: ['Klarframe procura una disponibilidad fiable, pero no garantiza una disponibilidad continua o concreta salvo acuerdo expreso. El mantenimiento, las medidas de seguridad, la fuerza mayor y las interrupciones de terceros pueden limitar temporalmente el uso. Klarframe puede evolucionar las funciones si se mantiene el beneficio esencial acordado.'] },
      { titel: '9. Responsabilidad', absaetze: ['Klarframe responde sin limitación en caso de dolo, negligencia grave y daños a la vida, integridad física o salud. En caso de negligencia leve, la responsabilidad se limita al incumplimiento de obligaciones esenciales y al daño previsible y típico. Se mantienen las normas imperativas y los derechos de los consumidores.'] },
      { titel: '10. Duración y terminación', absaetze: ['La duración, los plazos de preaviso y las consecuencias de la terminación se establecen en la oferta o contrato correspondiente. En caso de incumplimiento grave, uso ilícito o riesgo para los sistemas, Klarframe puede suspender el acceso o resolver por causa justificada. Se mantienen los derechos legales de terminación.'] },
      { titel: '11. Consumidores y desistimiento', absaetze: ['Cuando el cliente sea consumidor, se aplican los derechos legales de información y desistimiento salvo que exista una excepción legal. La información necesaria y, cuando proceda, un formulario modelo se facilitarán antes de celebrar el contrato. Si los servicios digitales o individuales comienzan antes de finalizar el plazo de desistimiento a petición expresa del consumidor, se aplican los requisitos y consecuencias legales.'] },
      { titel: '12. Privacidad y confidencialidad', absaetze: ['El tratamiento de datos personales se explica en la política de privacidad aplicable de Klarframe. Cada parte protegerá adecuadamente la información confidencial de la otra y la utilizará solo para ejecutar el contrato, salvo obligación legal de divulgación.'] },
      { titel: '13. Ley aplicable y jurisdicción', absaetze: ['Se aplica el derecho español. Los consumidores conservan además la protección y los tribunales imperativos de su residencia habitual. Para empresas, en la medida permitida por la ley, se acuerda Palma de Mallorca como fuero.'] },
    ],
    radio: [
      {
        titel: 'B1. Qué ofrece Klarframe Radio',
        absaetze: ['Klarframe Radio produce piezas de radio y pódcast listas para emitir. Eliges uno de tres caminos: textos propios, direcciones web o un tema que Klarframe Radio investiga por sí mismo. A partir de ahí se escribe un guion que leen una, dos o tres voces de IA. Cada línea hablada se comprueba automáticamente. Según tu plan, recibes la pieza terminada como descarga, por feed o por otras vías de entrega.'],
      },
      {
        titel: 'B2. Minutos de prueba',
        absaetze: ['Al registrarte recibes 10 minutos de prueba, sin datos de pago. Puedes escuchar las piezas de prueba en el portal. Solo se pueden descargar o entregar después de un pedido. Las piezas de prueba terminan con un aviso hablado de que son una muestra y se eliminan a los 30 días.'],
      },
      {
        titel: 'B3. Facturación por minutos',
        absaetze: [],
        liste: [
          'Se facturan los segundos de audio terminado.',
          'Antes de cada inicio ves la duración objetivo y cuántos minutos se reservan. Se cobra la duración real, como máximo la duración objetivo más un 15 por ciento. El precio pedido es el límite máximo.',
          'Si una pieza falla, no se consumen minutos.',
          'Si tu saldo no alcanza, la pieza no se inicia. Las piezas programadas se pausan y te avisamos por correo. No hay cargos posteriores.',
          'Los minutos mensuales de un plan caducan a final de mes. Los minutos adicionales comprados valen hasta el final del mes siguiente.',
          'Se aplican los precios mostrados antes del pedido.',
        ],
      },
      {
        titel: 'B4. Tu responsabilidad sobre la publicación',
        absaetze: [
          'Klarframe Radio entrega piezas con pruebas: cada cifra está vinculada a una fuente. Tú decides si y cuándo se emite o publica una pieza, y eres responsable de ello.',
          'Para noticias, recomendamos que tu propia redacción apruebe el guion antes de locutarlo. Puedes activar esta aprobación en el portal.',
          'Las obligaciones del derecho audiovisual (p. ej. una licencia) corresponden a la emisora, no a Klarframe como proveedor.',
        ],
      },
      {
        titel: 'B5. Contenidos propios y fuentes',
        absaetze: ['Necesitas los derechos necesarios sobre los textos y webs que indiques. En la investigación, Klarframe Radio toma hechos, nunca formulaciones: el guion se escribe de nuevo, y los fragmentos largos copiados literalmente se detectan y se reescriben automáticamente.'],
      },
      {
        titel: 'B6. Contenidos prohibidos',
        absaetze: ['Klarframe Radio nunca produce:'],
        liste: [
          'discurso de odio, discriminación o apología de la violencia,',
          'manipulación electoral mediante desinformación,',
          'publicidad de productos prohibidos,',
          'promesas milagrosas médicas o financieras,',
          'contenidos sobre personas privadas sin interés público,',
          'imitación de personas reales.',
        ],
      },
      {
        titel: 'B7. Qué pasa en caso de infracción',
        absaetze: ['Si nuestras comprobaciones detectan un contenido así, la pieza se detiene. En caso de infracciones graves o repetidas, se aplica la parte A n.º 10.'],
      },
      {
        titel: 'B8. Voces',
        absaetze: ['Solo usamos voces verificadas. Ninguna voz imita a una persona real conocida. En formatos como la entrevista solo hablan papeles ficticios (p. ej. «nuestro experto de IA»); nunca se imita a personas reales ni se presentan citas como grabaciones originales. Una voz propia (clon de voz) solo es posible con un acuerdo aparte y con el consentimiento por escrito de la persona.'],
      },
      {
        titel: 'B9. Identificación como contenido de IA',
        absaetze: ['Cada pieza contiene un aviso hablado de que las voces son de IA y una nota en los metadatos del archivo de audio (AI Act, art. 50). Esta identificación es obligatoria. Por favor, no la elimines.'],
      },
    ],
  },
  bot: {
    meta: { titel: 'KlarframeRadioBot — información para webmasters', beschreibung: 'Qué hace el bot de investigación KlarframeRadioBot, qué reglas sigue y cómo bloquearlo en tu web.' },
    kicker: 'Para webmasters',
    titel: 'KlarframeRadioBot',
    einleitung: '¿Has visto este nombre en los registros de acceso de tu web? Aquí te explicamos qué hace nuestro bot de investigación y cómo bloquearlo.',
    kennungTitel: 'Cómo se identifica el bot',
    abschnitte: [
      {
        titel: 'Qué hace el bot',
        absaetze: [
          'Klarframe Radio produce piezas de radio y pódcast. Para que cada afirmación tenga respaldo, el bot lee artículos de acceso público y comprueba los hechos con su fuente.',
          'Tomamos hechos, nunca formulaciones. Cada guion se escribe de nuevo. Tus textos no se comparten y se borran a los 90 días.',
        ],
      },
      {
        titel: 'Qué reglas sigue',
        absaetze: [],
        liste: [
          'Respeta tu robots.txt. Si allí se prohíbe una consulta, no se realiza.',
          'Reconoce las reservas de minería de textos y datos legibles por máquina.',
          'Como máximo una petición cada 2 segundos por dominio.',
          'Si tu servidor está sobrecargado (respuesta 429 o 503), pausa tu dominio durante una hora.',
          'Nunca elude muros de pago, inicios de sesión ni captchas.',
        ],
      },
      {
        titel: 'Cómo bloquear el bot',
        absaetze: ['Añade estas líneas al archivo robots.txt de tu web. El bot las respeta como muy tarde en 24 horas.'],
      },
      {
        titel: 'Solicitud de bloqueo o pregunta',
        absaetze: ['Escribe a info@klarframe.com e indica tu dominio. Lo añadimos de inmediato a nuestra lista de bloqueo.'],
      },
    ],
  },
}

const recht: Texte<RechtTexte> = { de, en, es }
export default recht
