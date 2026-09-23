// Texte der Preisseite (/preise) — DE/EN/ES. Zahlen kommen aus dem Katalog (lib/abrechnung/katalog.ts), nie aus diesen Texten.
const de = {
  meta: { titel: 'Preise', beschreibung: 'Einzelbeiträge, Abos und Minuten für Klarframe Radio — der Preis steht vor dem Start fest.' },
  kicker: 'Preise',
  titel: 'Klare Preise. Vorher bekannt.',
  einleitung: 'Sie sehen den Preis, bevor ein Beitrag entsteht. Abgerechnet wird die Länge des fertigen Audios – ein, zwei oder drei Stimmen kosten gleich viel.',
  einzel: {
    titel: 'Einzelbeitrag', text: 'Für den gelegentlichen Beitrag. Ohne Abo. Sie wählen die Länge vorher; die Stufe ist eine Obergrenze.',
    bis: 'bis {n} Minuten', weitere: 'Über {n} Minuten: {preis} je weitere Minute', typisch: ['Nachrichtenblock, Themenbeitrag, Glosse', 'Magazinstück, kurzer Podcast', 'Podcast-Folge', 'Podcast-Folge, Themenstrecke', 'Magazin, langer Podcast', 'Sondersendung', 'Stundensendung'],
  },
  abo: { titel: 'Abos mit Minuten', text: 'Für regelmäßige Sendungen mit Zeitplan. Die Minuten gelten für alle Längen und Formate – von 20 Sekunden bis 60 Minuten.', monat: 'im Monat', minuten: '{n} Minuten im Monat', jeMinute: '{preis} je Minute', sendungen: '{n} Sendungen mit Zeitplan', sendung1: '1 Sendung mit Zeitplan', sendungenAlle: 'Beliebig viele Sendungen', nutzer: '{n} Nutzer', beliebt: 'Für Sender', auslieferung: { download: 'Download', feed: 'Podcast-Feed', stream: 'Stream', webhook: 'Webhook', sftp: 'SFTP', s3: 'S3', playout: 'Sendeprogramm (Playout)' } as Record<string, string> },
  nachkauf: { titel: 'Minuten nachkaufen', text: 'Zu jedem Abo. Gültig bis Ende des Folgemonats.', paket: '{n} Minuten' },
  probe: { titel: 'Kostenlos testen', text: '{n} Minuten nach der Registrierung. Ohne Zahlungsdaten. Probebeiträge können Sie anhören; herunterladen und ausliefern geht nach der Bestellung.', knopf: 'Kostenlos testen' },
  regeln: {
    titel: 'Gut zu wissen',
    liste: [
      'Alle Preise netto zuzüglich Mehrwertsteuer.',
      'Der Preis steht vor dem Start fest. Wird ein Beitrag etwas länger als gewählt, tragen wir den Überhang.',
      'Reichen die Minuten nicht, startet nichts – es wird nie heimlich nachberechnet. Sie können jederzeit Minuten nachkaufen.',
      'Neu gesprochene Zeilen durch unsere automatische Prüfung kosten Sie nichts. Fehlgeschlagene Beiträge kosten nichts.',
      'Abos sind monatlich kündbar. Nicht verbrauchte Monatsminuten verfallen am Monatsende.',
      'Lange Beiträge bis 60 Minuten: Die Plattform plant die Themenblöcke, recherchiert jeden einzeln und setzt Kapitelmarken.',
    ],
  },
  anfrage: { titel: 'Individuell', text: 'Agenturen mit mehreren Kunden, eigene Konnektoren ins Sendeprogramm oder besondere Mengen? Schreiben Sie uns an info@klarframe.com.' },
  netto: 'netto',
}
const en: typeof de = {
  meta: { titel: 'Pricing', beschreibung: 'Single pieces, subscriptions and minutes for Klarframe Radio — you know the price before you start.' },
  kicker: 'Pricing',
  titel: 'Clear prices. Known upfront.',
  einleitung: 'You see the price before a piece is made. We bill the length of the finished audio – one, two or three voices cost the same.',
  einzel: {
    titel: 'Single piece', text: 'For the occasional piece. No subscription. You choose the length beforehand; each tier is a ceiling.',
    bis: 'up to {n} minutes', weitere: 'Over {n} minutes: {preis} per additional minute', typisch: ['News bulletin, feature, commentary', 'Magazine item, short podcast', 'Podcast episode', 'Podcast episode, themed segment', 'Magazine, long podcast', 'Special', 'One-hour programme'],
  },
  abo: { titel: 'Subscriptions with minutes', text: 'For regular programmes on a schedule. Minutes work for every length and format – from 20 seconds to 60 minutes.', monat: 'per month', minuten: '{n} minutes a month', jeMinute: '{preis} per minute', sendungen: '{n} scheduled shows', sendung1: '1 scheduled show', sendungenAlle: 'Unlimited shows', nutzer: '{n} users', beliebt: 'For stations', auslieferung: { download: 'Download', feed: 'Podcast feed', stream: 'Stream', webhook: 'Webhook', sftp: 'SFTP', s3: 'S3', playout: 'Playout system' } as Record<string, string> },
  nachkauf: { titel: 'Top-up minutes', text: 'For any subscription. Valid until the end of the following month.', paket: '{n} minutes' },
  probe: { titel: 'Try it free', text: '{n} minutes once you’ve signed up. No payment details. You can listen to trial pieces; downloading and delivery unlock after you order.', knopf: 'Try it free' },
  regeln: {
    titel: 'Good to know',
    liste: [
      'All prices are net, plus VAT.',
      'The price is fixed before you start. If a piece runs slightly longer than chosen, we cover the difference.',
      'If you’re out of minutes, nothing starts – we never charge extra behind your back. You can top up at any time.',
      'Lines re-recorded by our automatic check cost you nothing. Failed pieces cost nothing.',
      'Subscriptions can be cancelled monthly. Unused monthly minutes expire at the end of the month.',
      'Long pieces up to 60 minutes: the platform plans the segments, researches each one and adds chapter markers.',
    ],
  },
  anfrage: { titel: 'Custom', text: 'Agencies with several clients, custom connectors into your playout, or special volumes? Write to info@klarframe.com.' },
  netto: 'net',
}
const es: typeof de = {
  meta: { titel: 'Precios', beschreibung: 'Piezas sueltas, suscripciones y minutos de Klarframe Radio: sabes el precio antes de empezar.' },
  kicker: 'Precios',
  titel: 'Precios claros. Conocidos de antemano.',
  einleitung: 'Ves el precio antes de que se cree una pieza. Se cobra la duración del audio terminado: una, dos o tres voces cuestan lo mismo.',
  einzel: {
    titel: 'Pieza suelta', text: 'Para una pieza de vez en cuando. Sin suscripción. Eliges la duración antes; cada tramo es un máximo.',
    bis: 'hasta {n} minutos', weitere: 'Más de {n} minutos: {preis} por minuto adicional', typisch: ['Boletín, reportaje, columna', 'Pieza de magacín, pódcast corto', 'Episodio de pódcast', 'Episodio de pódcast, especial temático', 'Magacín, pódcast largo', 'Programa especial', 'Programa de una hora'],
  },
  abo: { titel: 'Suscripciones con minutos', text: 'Para programas periódicos con horario. Los minutos valen para cualquier duración y formato: de veinte segundos a sesenta minutos.', monat: 'al mes', minuten: '{n} minutos al mes', jeMinute: '{preis} por minuto', sendungen: '{n} programas con horario', sendung1: '1 programa con horario', sendungenAlle: 'Programas ilimitados', nutzer: '{n} usuarios', beliebt: 'Para emisoras', auslieferung: { download: 'Descarga', feed: 'Feed de pódcast', stream: 'Streaming', webhook: 'Webhook', sftp: 'SFTP', s3: 'S3', playout: 'Sistema de emisión' } as Record<string, string> },
  nachkauf: { titel: 'Comprar más minutos', text: 'Para cualquier suscripción. Válidos hasta el final del mes siguiente.', paket: '{n} minutos' },
  probe: { titel: 'Pruébalo gratis', text: '{n} minutos al registrarte. Sin datos de pago. Puedes escuchar las piezas de prueba; la descarga y el envío se activan al contratar.', knopf: 'Pruébalo gratis' },
  regeln: {
    titel: 'Conviene saber',
    liste: [
      'Todos los precios son netos, más IVA.',
      'El precio queda fijado antes de empezar. Si una pieza dura algo más de lo elegido, corre de nuestra cuenta.',
      'Si no te quedan minutos, no se inicia nada: nunca cobramos de más a escondidas. Puedes comprar minutos cuando quieras.',
      'Las líneas que nuestra revisión automática vuelve a grabar no te cuestan nada. Las piezas fallidas tampoco.',
      'Las suscripciones se pueden cancelar cada mes. Los minutos mensuales no usados caducan a final de mes.',
      'Piezas largas de hasta 60 minutos: la plataforma planifica los bloques, investiga cada uno y añade marcas de capítulo.',
    ],
  },
  anfrage: { titel: 'A medida', text: '¿Agencias con varios clientes, conectores propios con tu sistema de emisión o volúmenes especiales? Escríbenos a info@klarframe.com.' },
  netto: 'neto',
}
const texte = { de, en, es }
export default texte
export type PreisTexte = typeof de
