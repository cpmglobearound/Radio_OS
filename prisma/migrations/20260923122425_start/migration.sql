-- CreateTable
CREATE TABLE "Mandant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "art" TEXT NOT NULL DEFAULT 'firma',
    "eltern_id" TEXT,
    "land" TEXT,
    "zeitzone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "sprache_oberflaeche" TEXT NOT NULL DEFAULT 'de',
    "rechnungs_name" TEXT,
    "rechnungs_adresse" JSONB,
    "ust_id" TEXT,
    "stripe_kunde_id" TEXT,
    "tarif_id" TEXT,
    "bestellt_am" TIMESTAMP(3),
    "bestellter_preis_eur" DOUBLE PRECISION,
    "sonderpreis_eur" DOUBLE PRECISION,
    "sonderpreis_notiz" TEXT,
    "gesperrt_grund" TEXT,
    "geloescht_am" TIMESTAMP(3),
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mandant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nutzer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_bestaetigt_am" TIMESTAMP(3),
    "passwort_hash" TEXT,
    "name" TEXT NOT NULL,
    "sprache" TEXT NOT NULL DEFAULT 'de',
    "sitzung_version" INTEGER NOT NULL DEFAULT 1,
    "zwei_faktor_geheim" TEXT,
    "ist_klarframe_admin" BOOLEAN NOT NULL DEFAULT false,
    "letzte_anmeldung" TIMESTAMP(3),
    "fehlversuche" INTEGER NOT NULL DEFAULT 0,
    "gesperrt_bis" TIMESTAMP(3),
    "geloescht_am" TIMESTAMP(3),
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nutzer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mitgliedschaft" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "nutzer_id" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "eingeladen_von" TEXT,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mitgliedschaft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einladung" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "gueltig_bis" TIMESTAMP(3) NOT NULL,
    "angenommen_am" TIMESTAMP(3),

    CONSTRAINT "Einladung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EinmalToken" (
    "id" TEXT NOT NULL,
    "nutzer_id" TEXT NOT NULL,
    "zweck" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "daten" JSONB,
    "gueltig_bis" TIMESTAMP(3) NOT NULL,
    "benutzt_am" TIMESTAMP(3),

    CONSTRAINT "EinmalToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSchluessel" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "praefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "rechte" TEXT[],
    "zuletzt_benutzt" TIMESTAMP(3),
    "widerrufen_am" TIMESTAMP(3),
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiSchluessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protokoll" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT,
    "nutzer_id" TEXT,
    "aktion" TEXT NOT NULL,
    "ziel_typ" TEXT,
    "ziel_id" TEXT,
    "daten" JSONB,
    "ip_hash" TEXT,
    "zeit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Protokoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sendung" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "sprache" TEXT NOT NULL,
    "ziel_laenge_s" INTEGER NOT NULL,
    "stimmen" JSONB NOT NULL,
    "tonalitaet" JSONB NOT NULL,
    "themen" JSONB NOT NULL,
    "region" JSONB NOT NULL,
    "quellen_regel" JSONB NOT NULL,
    "aufbau" JSONB,
    "freigabe_noetig" BOOLEAN NOT NULL DEFAULT false,
    "zeitplan" JSONB,
    "zeitzone" TEXT,
    "ausliefern_an" TEXT[],
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "naechster_lauf" TIMESTAMP(3),
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert_am" TIMESTAMP(3) NOT NULL,
    "stand" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Sendung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beitrag" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "sendung_id" TEXT,
    "titel" TEXT NOT NULL,
    "einstellungen" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "fortschritt" JSONB,
    "fehler" TEXT,
    "fehler_technisch" TEXT,
    "ist_probe" BOOLEAN NOT NULL DEFAULT false,
    "reserviert_s" INTEGER NOT NULL DEFAULT 0,
    "laenge_s" DOUBLE PRECISION,
    "abgerechnet_s" INTEGER,
    "stimmklassen_faktor" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "audio_master" TEXT,
    "audio_mp3" TEXT,
    "kapitel" JSONB,
    "shownotes" TEXT,
    "kosten" JSONB,
    "eingaben" JSONB,
    "pruefung" JSONB,
    "drehbuch" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fertig_am" TIMESTAMP(3),

    CONSTRAINT "Beitrag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Themenblock" (
    "id" TEXT NOT NULL,
    "beitrag_id" TEXT NOT NULL,
    "reihenfolge" INTEGER NOT NULL,
    "thema" TEXT NOT NULL,
    "blickwinkel" TEXT,
    "zusammenfassung" TEXT,

    CONSTRAINT "Themenblock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zeile" (
    "id" TEXT NOT NULL,
    "beitrag_id" TEXT NOT NULL,
    "block_id" TEXT,
    "nr" INTEGER NOT NULL,
    "rolle" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "regie" TEXT,
    "luecke_ms" INTEGER NOT NULL DEFAULT 280,
    "fakt_ids" TEXT[],
    "audio" TEXT,
    "dauer_s" DOUBLE PRECISION,
    "gehoert" TEXT,
    "wortgenauigkeit" DOUBLE PRECISION,
    "versuche" INTEGER NOT NULL DEFAULT 0,
    "warnung" TEXT,

    CONSTRAINT "Zeile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quelle" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT,
    "art" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sprache" TEXT,
    "land" TEXT,
    "orte" TEXT[],
    "themen" TEXT[],
    "vertrauen" INTEGER NOT NULL DEFAULT 3,
    "erlaubt" BOOLEAN NOT NULL DEFAULT true,
    "pruef_notiz" TEXT,
    "letzter_abruf" TIMESTAMP(3),
    "letzter_fehler" TEXT,

    CONSTRAINT "Quelle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokument" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "url_hash" TEXT NOT NULL,
    "quelle_id" TEXT,
    "titel" TEXT,
    "sprache" TEXT,
    "veroeffentlicht_am" TIMESTAMP(3),
    "abgerufen_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "text_hash" TEXT NOT NULL,
    "land" TEXT,
    "orte" TEXT[],
    "themen" TEXT[],

    CONSTRAINT "Dokument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fakt" (
    "id" TEXT NOT NULL,
    "beitrag_id" TEXT NOT NULL,
    "aussage" TEXT NOT NULL,
    "zahl" TEXT,
    "dokument_id" TEXT NOT NULL,
    "zitat" TEXT NOT NULL,
    "quelle_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "datum" TIMESTAMP(3),
    "gewicht" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Fakt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StimmAnbieter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "klassen_faktor" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "faehigkeiten" JSONB NOT NULL,
    "kosten" JSONB NOT NULL,

    CONSTRAINT "StimmAnbieter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stimme" (
    "id" TEXT NOT NULL,
    "anbieter_id" TEXT NOT NULL,
    "anbieter_stimm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "geschlecht" TEXT,
    "alter" TEXT,
    "sprachen" JSONB NOT NULL,
    "stil" TEXT[],
    "kann_lachen" BOOLEAN NOT NULL DEFAULT false,
    "hoerprobe" JSONB NOT NULL,
    "geprueft_am" TIMESTAMP(3),
    "geprueft_von" TEXT,
    "sichtbar" BOOLEAN NOT NULL DEFAULT false,
    "klon_von_person" BOOLEAN NOT NULL DEFAULT false,
    "einwilligung_dokument" TEXT,
    "sortierung" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stimme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StimmFavorit" (
    "mandant_id" TEXT NOT NULL,
    "stimme_id" TEXT NOT NULL,
    "notiz" TEXT,

    CONSTRAINT "StimmFavorit_pkey" PRIMARY KEY ("mandant_id","stimme_id")
);

-- CreateTable
CREATE TABLE "Aussprache" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT,
    "sprache" TEXT NOT NULL,
    "wort" TEXT NOT NULL,
    "sprich_als" TEXT NOT NULL,

    CONSTRAINT "Aussprache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuslieferungsZiel" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "einstellungen" JSONB NOT NULL,
    "dateiformat" JSONB NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "zuletzt_ok" TIMESTAMP(3),
    "zuletzt_fehler" TEXT,

    CONSTRAINT "AuslieferungsZiel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zustellung" (
    "id" TEXT NOT NULL,
    "beitrag_id" TEXT NOT NULL,
    "ziel_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "versuche" INTEGER NOT NULL DEFAULT 0,
    "nachweis" JSONB,
    "fehler" TEXT,
    "zeit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zustellung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamProgramm" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mount" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "zugang" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StreamProgramm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarif" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preis_eur" DOUBLE PRECISION NOT NULL,
    "minuten_inkl" INTEGER NOT NULL,
    "max_sendungen" INTEGER,
    "max_nutzer" INTEGER,
    "auslieferung" TEXT[],
    "stripe_preis_id" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tarif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buchung" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "sekunden" INTEGER NOT NULL,
    "beitrag_id" TEXT,
    "gueltig_bis" TIMESTAMP(3),
    "notiz" TEXT,
    "stripe_ref" TEXT,
    "zeit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buchung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einzelpreis" (
    "id" TEXT NOT NULL,
    "bis_minuten" INTEGER NOT NULL,
    "preis_eur" DOUBLE PRECISION NOT NULL,
    "je_weitere_minute_eur" DOUBLE PRECISION,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Einzelpreis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nachkaufpaket" (
    "id" TEXT NOT NULL,
    "minuten" INTEGER NOT NULL,
    "preis_eur" DOUBLE PRECISION NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Nachkaufpaket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einstellung" (
    "schluessel" TEXT NOT NULL,
    "wert" JSONB NOT NULL,

    CONSTRAINT "Einstellung_pkey" PRIMARY KEY ("schluessel")
);

-- CreateTable
CREATE TABLE "Ratenzaehler" (
    "id" TEXT NOT NULL,
    "anzahl" INTEGER NOT NULL DEFAULT 0,
    "bis" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ratenzaehler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mandant_stripe_kunde_id_key" ON "Mandant"("stripe_kunde_id");

-- CreateIndex
CREATE INDEX "Mandant_eltern_id_idx" ON "Mandant"("eltern_id");

-- CreateIndex
CREATE UNIQUE INDEX "Nutzer_email_key" ON "Nutzer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mitgliedschaft_mandant_id_nutzer_id_key" ON "Mitgliedschaft"("mandant_id", "nutzer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Einladung_token_hash_key" ON "Einladung"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "EinmalToken_token_hash_key" ON "EinmalToken"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSchluessel_hash_key" ON "ApiSchluessel"("hash");

-- CreateIndex
CREATE INDEX "Protokoll_mandant_id_zeit_idx" ON "Protokoll"("mandant_id", "zeit");

-- CreateIndex
CREATE INDEX "Sendung_aktiv_naechster_lauf_idx" ON "Sendung"("aktiv", "naechster_lauf");

-- CreateIndex
CREATE INDEX "Beitrag_mandant_id_erstellt_am_idx" ON "Beitrag"("mandant_id", "erstellt_am");

-- CreateIndex
CREATE INDEX "Beitrag_status_idx" ON "Beitrag"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Zeile_beitrag_id_nr_key" ON "Zeile"("beitrag_id", "nr");

-- CreateIndex
CREATE UNIQUE INDEX "Dokument_url_hash_key" ON "Dokument"("url_hash");

-- CreateIndex
CREATE INDEX "Dokument_abgerufen_am_idx" ON "Dokument"("abgerufen_am");

-- CreateIndex
CREATE INDEX "Stimme_anbieter_id_sichtbar_idx" ON "Stimme"("anbieter_id", "sichtbar");

-- CreateIndex
CREATE UNIQUE INDEX "Aussprache_mandant_id_sprache_wort_key" ON "Aussprache"("mandant_id", "sprache", "wort");

-- CreateIndex
CREATE UNIQUE INDEX "StreamProgramm_mount_key" ON "StreamProgramm"("mount");

-- CreateIndex
CREATE INDEX "Buchung_mandant_id_zeit_idx" ON "Buchung"("mandant_id", "zeit");

-- CreateIndex
CREATE UNIQUE INDEX "Einzelpreis_bis_minuten_key" ON "Einzelpreis"("bis_minuten");

-- AddForeignKey
ALTER TABLE "Mitgliedschaft" ADD CONSTRAINT "Mitgliedschaft_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mitgliedschaft" ADD CONSTRAINT "Mitgliedschaft_nutzer_id_fkey" FOREIGN KEY ("nutzer_id") REFERENCES "Nutzer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiSchluessel" ADD CONSTRAINT "ApiSchluessel_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sendung" ADD CONSTRAINT "Sendung_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beitrag" ADD CONSTRAINT "Beitrag_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beitrag" ADD CONSTRAINT "Beitrag_sendung_id_fkey" FOREIGN KEY ("sendung_id") REFERENCES "Sendung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Themenblock" ADD CONSTRAINT "Themenblock_beitrag_id_fkey" FOREIGN KEY ("beitrag_id") REFERENCES "Beitrag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zeile" ADD CONSTRAINT "Zeile_beitrag_id_fkey" FOREIGN KEY ("beitrag_id") REFERENCES "Beitrag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quelle" ADD CONSTRAINT "Quelle_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fakt" ADD CONSTRAINT "Fakt_beitrag_id_fkey" FOREIGN KEY ("beitrag_id") REFERENCES "Beitrag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StimmFavorit" ADD CONSTRAINT "StimmFavorit_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuslieferungsZiel" ADD CONSTRAINT "AuslieferungsZiel_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zustellung" ADD CONSTRAINT "Zustellung_beitrag_id_fkey" FOREIGN KEY ("beitrag_id") REFERENCES "Beitrag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buchung" ADD CONSTRAINT "Buchung_mandant_id_fkey" FOREIGN KEY ("mandant_id") REFERENCES "Mandant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
