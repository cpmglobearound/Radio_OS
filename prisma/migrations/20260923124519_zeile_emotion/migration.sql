-- AlterTable
ALTER TABLE "Zeile" ADD COLUMN     "befunde" JSONB,
ADD COLUMN     "emotion" TEXT,
ADD COLUMN     "kosten_usd" DOUBLE PRECISION NOT NULL DEFAULT 0;
