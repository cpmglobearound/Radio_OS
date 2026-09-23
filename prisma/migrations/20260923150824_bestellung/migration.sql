-- CreateTable
CREATE TABLE "Bestellung" (
    "id" TEXT NOT NULL,
    "mandant_id" TEXT NOT NULL,
    "nutzer_id" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "produkt_id" TEXT NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "minuten" INTEGER NOT NULL,
    "preis_eur" DOUBLE PRECISION NOT NULL,
    "notiz" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "erledigt_am" TIMESTAMP(3),
    "erledigt_von" TEXT,

    CONSTRAINT "Bestellung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bestellung_mandant_id_erstellt_am_idx" ON "Bestellung"("mandant_id", "erstellt_am");

-- CreateIndex
CREATE INDEX "Bestellung_status_idx" ON "Bestellung"("status");
