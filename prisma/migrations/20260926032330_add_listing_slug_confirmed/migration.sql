-- AlterTable
-- Backfilled true for every existing row (their slug has already had its
-- "first save" one way or another, whether that was ever explicit or not —
-- this migration must never retroactively rewrite a slug that's already
-- live); the column's default then drops to false so only a listing created
-- after this migration starts out eligible for the auto-adopt-on-first-save
-- behavior in saveListingFields.
ALTER TABLE "PartnerListing" ADD COLUMN     "slugConfirmed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PartnerListing" ALTER COLUMN "slugConfirmed" SET DEFAULT false;
