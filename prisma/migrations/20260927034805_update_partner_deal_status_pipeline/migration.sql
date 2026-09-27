-- Replace the old Open/Won/Lost PartnerDealStatus with a 5-stage pipeline
-- (Discovery, Proposal, Negotiation, Closed Won, Closed Lost). Done as a
-- type swap rather than ALTER TYPE ... ADD VALUE (Postgres won't let a
-- value added that way be used later in the same transaction), so the old
-- values can be mapped to their pipeline equivalents in the same migration
-- that removes them. Existing deals have no recorded sub-stage, so every
-- still-open deal becomes the pipeline's first stage (Discovery) rather
-- than losing its open/closed status outright; Won/Lost map onto the new
-- Closed Won/Closed Lost.
CREATE TYPE "PartnerDealStatus_new" AS ENUM ('DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

ALTER TABLE "PartnerDeal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PartnerDeal" ALTER COLUMN "status" TYPE "PartnerDealStatus_new" USING (
  CASE "status"::text
    WHEN 'OPEN' THEN 'DISCOVERY'
    WHEN 'WON' THEN 'CLOSED_WON'
    WHEN 'LOST' THEN 'CLOSED_LOST'
  END
)::"PartnerDealStatus_new";

ALTER TYPE "PartnerDealStatus" RENAME TO "PartnerDealStatus_old";
ALTER TYPE "PartnerDealStatus_new" RENAME TO "PartnerDealStatus";
DROP TYPE "PartnerDealStatus_old";

ALTER TABLE "PartnerDeal" ALTER COLUMN "status" SET DEFAULT 'DISCOVERY';
