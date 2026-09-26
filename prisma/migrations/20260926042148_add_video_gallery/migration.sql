-- Single-video PartnerListing.videoUrl is replaced by a gallery
-- (PartnerListing.videos, a VideoEntry[] JSON array — see src/lib/directory.ts).
-- Add the new column first so the backfill below has somewhere to write.
ALTER TABLE "PartnerListing" ADD COLUMN "videos" JSONB;

-- Carry forward any listing that already had a single video into the new
-- gallery, as its one entry (uncategorized, untitled — a partner can fill
-- those in from the editor same as anything else) rather than silently
-- dropping it.
UPDATE "PartnerListing"
SET "videos" = jsonb_build_array(
  jsonb_build_object('url', "videoUrl", 'title', '', 'category', 'OTHER', 'thumbnailUrl', NULL)
)
WHERE "videoUrl" IS NOT NULL;

-- Now safe to drop the old single-video column.
ALTER TABLE "PartnerListing" DROP COLUMN "videoUrl";
