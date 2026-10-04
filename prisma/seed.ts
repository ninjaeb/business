import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";
import { Prisma } from "../src/generated/prisma/client";
import { GUIDES, type GuideImage, type GuideSeed, type GuideFaqEntry } from "./guides-seed";

// A curated, fixed starter vocabulary for the partner listing picker — the
// category list isn't admin-editable at all (only deletable, see
// src/app/actions/business-categories.ts), so seeding it well up front is
// the only way it gets populated. Fixed, readable ids rather than generated
// cuids — more debuggable for what are effectively system rows, and lets
// this seed run be idempotent (upsert, never duplicates).
const BUSINESS_CATEGORIES: [id: string, name: string][] = [
  ["category-accounting-bookkeeping", "Accounting & Bookkeeping"],
  ["category-advertising-agency", "Advertising Agency"],
  ["category-agriculture-farming", "Agriculture & Farming"],
  ["category-air-conditioning-hvac", "Air Conditioning & HVAC"],
  ["category-animation-motion-graphics", "Animation & Motion Graphics"],
  ["category-app-development", "App Development"],
  ["category-architecture", "Architecture"],
  ["category-auto-repair-maintenance", "Auto Repair & Maintenance"],
  ["category-automotive-dealership", "Automotive Dealership"],
  ["category-aviation-services", "Aviation Services"],
  ["category-bakery-confectionery", "Bakery & Confectionery"],
  ["category-banking-financial-services", "Banking & Financial Services"],
  ["category-beauty-spa-wellness", "Beauty, Spa & Wellness"],
  ["category-branding-graphic-design", "Branding & Graphic Design"],
  ["category-business-consulting", "Business Consulting"],
  ["category-car-rental", "Car Rental"],
  ["category-catering", "Catering"],
  ["category-childcare-early-education", "Childcare & Early Education"],
  ["category-cleaning-services", "Cleaning Services"],
  ["category-cloud-it-infrastructure", "Cloud & IT Infrastructure"],
  ["category-construction", "Construction"],
  ["category-content-marketing", "Content Marketing"],
  ["category-courier-delivery", "Courier & Delivery"],
  ["category-cybersecurity", "Cybersecurity"],
  ["category-data-analytics-bi", "Data Analytics & BI"],
  ["category-dental-services", "Dental Services"],
  ["category-digital-marketing", "Digital Marketing"],
  ["category-ecommerce", "E-commerce"],
  ["category-education-training", "Education & Training"],
  ["category-electrical-services", "Electrical Services"],
  ["category-electronics-appliances", "Electronics & Appliances"],
  ["category-engineering-services", "Engineering Services"],
  ["category-entertainment-events", "Entertainment & Events"],
  ["category-event-planning", "Event Planning"],
  ["category-fashion-apparel", "Fashion & Apparel"],
  ["category-financial-advisory", "Financial Advisory"],
  ["category-fitness-gym", "Fitness & Gym"],
  ["category-food-beverage", "Food & Beverage"],
  ["category-freight-shipping", "Freight & Shipping"],
  ["category-furniture-home-decor", "Furniture & Home Decor"],
  ["category-general-trading", "General Trading"],
  ["category-government-public-sector", "Government & Public Sector"],
  ["category-hardware-tools", "Hardware & Tools"],
  ["category-healthcare-services", "Healthcare Services"],
  ["category-hr-recruitment", "HR & Recruitment"],
  ["category-import-export", "Import & Export"],
  ["category-industrial-equipment", "Industrial Equipment"],
  ["category-insurance", "Insurance"],
  ["category-interior-design", "Interior Design"],
  ["category-it-support-managed-services", "IT Support & Managed Services"],
  ["category-landscaping-gardening", "Landscaping & Gardening"],
  ["category-legal-services", "Legal Services"],
  ["category-logistics-supply-chain", "Logistics & Supply Chain"],
  ["category-manufacturing", "Manufacturing"],
  ["category-marketing-agency", "Marketing Agency"],
  ["category-media-production", "Media Production"],
  ["category-medical-equipment", "Medical Equipment"],
  ["category-non-profit-ngo", "Non-Profit & NGO"],
  ["category-office-supplies", "Office Supplies"],
  ["category-packaging", "Packaging"],
  ["category-pet-services-veterinary", "Pet Services & Veterinary"],
  ["category-photography-videography", "Photography & Videography"],
  ["category-plumbing-services", "Plumbing Services"],
  ["category-printing-publishing", "Printing & Publishing"],
  ["category-property-management", "Property Management"],
  ["category-public-relations", "Public Relations"],
  ["category-real-estate-agency", "Real Estate Agency"],
  ["category-renewable-solar-energy", "Renewable & Solar Energy"],
  ["category-restaurant-cafe", "Restaurant & Cafe"],
  ["category-retail", "Retail"],
  ["category-security-services", "Security Services"],
  ["category-seo-services", "SEO Services"],
  ["category-social-media-marketing", "Social Media Marketing"],
  ["category-software-development", "Software Development"],
  ["category-sports-recreation", "Sports & Recreation"],
  ["category-telecommunications", "Telecommunications"],
  ["category-transportation", "Transportation"],
  ["category-travel-tourism", "Travel & Tourism"],
  ["category-tutoring-coaching", "Tutoring & Coaching"],
  ["category-video-production", "Video Production"],
  ["category-warehousing", "Warehousing"],
  ["category-web-design", "Web Design"],
  ["category-web-development", "Web Development"],
  ["category-wedding-services", "Wedding Services"],
  ["category-wholesale-distribution", "Wholesale & Distribution"],
  ["category-medical-clinic-gp", "Medical Clinic & GP"],
  ["category-pharmacy", "Pharmacy"],
  ["category-physiotherapy-rehabilitation", "Physiotherapy & Rehabilitation"],
  ["category-traditional-complementary-medicine", "Traditional & Complementary Medicine"],
  ["category-optical-eyewear", "Optical & Eyewear"],
  ["category-nursing-home-care", "Nursing & Home Care"],
  ["category-aesthetic-cosmetic-clinic", "Aesthetic & Cosmetic Clinic"],
  ["category-mental-health-counselling", "Mental Health & Counselling"],
  ["category-nutrition-dietetics", "Nutrition & Dietetics"],
  ["category-hair-salon-barbershop", "Hair Salon & Barbershop"],
  ["category-nail-salon", "Nail Salon"],
  ["category-tattoo-piercing-studio", "Tattoo & Piercing Studio"],
  ["category-company-secretarial-services", "Company Secretarial Services"],
  ["category-tax-agent-advisory", "Tax Agent & Advisory"],
  ["category-trademark-ip-services", "Trademark & IP Services"],
  ["category-notary-commissioner-oaths", "Notary & Commissioner for Oaths"],
  ["category-insurance-broker-agency", "Insurance Broker & Agency"],
  ["category-money-changer-remittance", "Money Changer & Remittance"],
  ["category-islamic-finance-banking", "Islamic Finance & Banking"],
  ["category-payment-gateway-fintech", "Payment Gateway & Fintech"],
  ["category-investment-wealth-management", "Investment & Wealth Management"],
  ["category-stockbroking-unit-trust", "Stockbroking & Unit Trust"],
  ["category-debt-collection-recovery", "Debt Collection & Recovery"],
  ["category-pawnbroking", "Pawnbroking"],
  ["category-renovation-remodeling", "Renovation & Remodeling"],
  ["category-roofing-services", "Roofing Services"],
  ["category-waterproofing-services", "Waterproofing Services"],
  ["category-glass-aluminum-works", "Glass & Aluminum Works"],
  ["category-signage-fabrication", "Signage & Fabrication"],
  ["category-scaffolding-formwork", "Scaffolding & Formwork"],
  ["category-welding-metalwork", "Welding & Metalwork"],
  ["category-flooring-tiling", "Flooring & Tiling"],
  ["category-painting-services", "Painting Services"],
  ["category-plastics-rubber-manufacturing", "Plastics & Rubber Manufacturing"],
  ["category-metal-fabrication", "Metal Fabrication"],
  ["category-food-beverage-manufacturing", "Food & Beverage Manufacturing"],
  ["category-textile-garment-manufacturing", "Textile & Garment Manufacturing"],
  ["category-furniture-manufacturing", "Furniture Manufacturing"],
  ["category-supermarket-grocery", "Supermarket & Grocery"],
  ["category-convenience-store", "Convenience Store"],
  ["category-jewelry-watches", "Jewelry & Watches"],
  ["category-bookstore-stationery", "Bookstore & Stationery"],
  ["category-food-truck-hawker", "Food Truck & Hawker"],
  ["category-bar-nightlife", "Bar & Nightlife"],
  ["category-coffee-roaster-cafe-supply", "Coffee Roaster & Café Supply"],
  ["category-hotel-resort", "Hotel & Resort"],
  ["category-homestay-vacation-rental", "Homestay & Vacation Rental"],
  ["category-car-wash-detailing", "Car Wash & Detailing"],
  ["category-tyre-shop-wheel-services", "Tyre Shop & Wheel Services"],
  ["category-motorcycle-dealership-repair", "Motorcycle Dealership & Repair"],
  ["category-livestock-poultry-farming", "Livestock & Poultry Farming"],
  ["category-fisheries-aquaculture", "Fisheries & Aquaculture"],
  ["category-agrotechnology", "Agrotechnology"],
  ["category-oil-gas-services", "Oil & Gas Services"],
  ["category-waste-management-recycling", "Waste Management & Recycling"],
  ["category-environmental-esg-consulting", "Environmental & ESG Consulting"],
  ["category-kindergarten-preschool", "Kindergarten & Preschool"],
  ["category-international-private-school", "International & Private School"],
  ["category-driving-school", "Driving School"],
  ["category-language-school", "Language School"],
  ["category-vocational-skills-training", "Vocational & Skills Training"],
  ["category-martial-arts-combat-sports", "Martial Arts & Combat Sports"],
  ["category-game-development", "Game Development"],
  ["category-blockchain-web3", "Blockchain & Web3"],
  ["category-ai-machine-learning-consulting", "AI & Machine Learning Consulting"],
  ["category-iot-embedded-systems", "IoT & Embedded Systems"],
  ["category-pest-control-services", "Pest Control Services"],
  ["category-domestic-helper-maid-agency", "Domestic Helper & Maid Agency"],
  ["category-funeral-bereavement-services", "Funeral & Bereavement Services"],
  ["category-locksmith-services", "Locksmith Services"],
  ["category-moving-relocation-services", "Moving & Relocation Services"],
  ["category-translation-interpretation", "Translation & Interpretation"],
  ["category-market-research", "Market Research"],
  ["category-business-process-outsourcing", "Business Process Outsourcing (BPO)"],
  ["category-talent-influencer-agency", "Talent & Influencer Agency"],
  // Added after a gap-analysis against Google Business Profile's own
  // category taxonomy — everyday consumer-facing local business types this
  // list was thin on (this seed otherwise skews heavily B2B/professional),
  // plus one Malaysia-specific addition (confinement centers).
  ["category-laundry-dry-cleaning", "Laundry & Dry Cleaning"],
  ["category-self-storage", "Self-Storage"],
  ["category-coworking-space", "Co-working Space"],
  ["category-ice-cream-dessert-shop", "Ice Cream & Dessert Shop"],
  ["category-florist", "Florist"],
  ["category-mobile-phone-accessories-store", "Mobile Phone & Accessories Store"],
  ["category-toy-store", "Toy Store"],
  ["category-baby-kids-store", "Baby & Kids Store"],
  ["category-vape-shop", "Vape Shop"],
  ["category-sporting-goods-store", "Sporting Goods Store"],
  ["category-petrol-gas-station", "Petrol & Gas Station"],
  ["category-ev-charging-sales", "EV Charging & Sales"],
  ["category-auto-glass-windscreen", "Auto Glass & Windscreen"],
  ["category-chiropractor", "Chiropractor"],
  ["category-confinement-maternity-center", "Confinement & Maternity Center"],
  ["category-fertility-clinic", "Fertility Clinic"],
  ["category-kitchen-cabinet-carpentry", "Kitchen Cabinet & Carpentry"],
  ["category-curtain-blinds-upholstery", "Curtain, Blinds & Upholstery"],
  ["category-swimming-pool-services", "Swimming Pool Services"],
  ["category-party-event-rental", "Party & Event Rental"],
  // Round 2 of the Google Business Profile gap analysis — specialty
  // retail/trade/professional types the seed was still missing, plus one
  // more Malaysia-specific addition (religious schools).
  ["category-butcher-meat-shop", "Butcher & Meat Shop"],
  ["category-seafood-wet-market", "Seafood & Wet Market"],
  ["category-tailor-alteration-services", "Tailor & Alteration Services"],
  ["category-phone-computer-repair-shop", "Phone & Computer Repair Shop"],
  ["category-property-developer", "Property Developer"],
  ["category-property-valuation-services", "Property Valuation Services"],
  ["category-musical-instrument-store", "Musical Instrument Store"],
  ["category-art-gallery", "Art Gallery"],
  ["category-art-supplies-store", "Art Supplies Store"],
  ["category-licensed-moneylender", "Licensed Moneylender"],
  ["category-religious-school-tahfiz-madrasah", "Religious School (Tahfiz/Madrasah)"],
];

async function main() {
  for (const [id, name] of BUSINESS_CATEGORIES) {
    await db.businessCategory.upsert({
      where: { id },
      create: { id, name },
      update: { name },
    });
  }
  console.log(`Seeded ${BUSINESS_CATEGORIES.length} business categories.`);

  await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  console.log("Ensured Settings singleton row exists.");

  await seedGuides();
  await migrateUpdatesToPartnerPosts();
}

// One-time, idempotent data migration: PartnerListing.updates JSON entries
// (the old News & Promotions tab inside the full listing editor, since
// retired — see src/components/directory/partner-listing-form.tsx's own
// comment) become real PartnerPost rows, so every News/Promotion item —
// written the old way or the new instant-post way — lives in one place and
// is manageable from /business-portal/posts. "updates is now empty, on both
// copies below" is this migration's own completion marker: the old tab is
// gone, nothing writes a non-empty `updates` anymore, so a listing this
// already visited can never have fresh JSON to pick up on a later run.
// Deliberately not imported from src/lib/directory.ts (the real
// ListingUpdateEntry/sanitizeUpdateEntry machinery) — that file pulls in
// `server-only` (via directory-i18n.ts and friends), which throws outside
// Next's own module resolution; this plain tsx/Prisma-CLI script has none,
// same reason seedGuides() above never calls regenerateSitemapFile() either.
// Translated (zh/ms) copies of a migrated entry, if any existed in
// `translations.zh.updates`/`translations.ms.updates`, are NOT carried
// over — PartnerPost has no locale of its own by design (see
// src/lib/partner-posts.ts's own comment); a migrated post reads in
// English on every locale going forward, same as every new post already
// does.
//
// The live `updates` column isn't the only copy: publishedSnapshot (see
// buildPublishedSnapshot/readPublishedSnapshot in src/lib/directory.ts) is
// a separate, frozen JSON blob taken at last publish, and it's what the
// public Posts page actually renders (getPublishedListingBySlug reads the
// snapshot, never the live row). Migrating only the live column would
// leave every already-published listing's old entries still visible from
// its stale snapshot, now duplicated right next to the very PartnerPost
// rows just migrated from the same content. Both copies get cleared below;
// the live row is the migration source whenever it has anything (it's the
// partner's own most recent save), falling back to the snapshot's own copy
// only when the live row is already empty — a draft cleared without ever
// being republished — so a still-visible published entry is never silently
// dropped.
async function migrateUpdatesToPartnerPosts() {
  const listings = await db.partnerListing.findMany({
    select: { id: true, partnerId: true, updates: true, publishedSnapshot: true },
  });

  let migratedListings = 0;
  let migratedPosts = 0;
  for (const listing of listings) {
    const liveRaw = Array.isArray(listing.updates) ? listing.updates : [];
    const snapshot = listing.publishedSnapshot;
    const snapshotRaw =
      snapshot && typeof snapshot === "object" && Array.isArray((snapshot as Record<string, unknown>).updates)
        ? ((snapshot as Record<string, unknown>).updates as unknown[])
        : [];
    if (liveRaw.length === 0 && snapshotRaw.length === 0) continue;

    const raw = liveRaw.length > 0 ? liveRaw : snapshotRaw;
    for (const value of raw) {
      if (!value || typeof value !== "object") continue;
      const entry = value as Record<string, unknown>;
      const title = typeof entry.title === "string" ? entry.title.trim() : "";
      const body = typeof entry.body === "string" ? entry.body.trim() : "";
      if (!title || !body) continue;
      const kind = entry.kind === "PROMOTION" ? "PROMOTION" : "NEWS";
      const postedAt = typeof entry.postedAt === "string" && !Number.isNaN(Date.parse(entry.postedAt)) ? new Date(entry.postedAt) : new Date();
      const endDate = typeof entry.endDate === "string" && !Number.isNaN(Date.parse(entry.endDate)) ? new Date(entry.endDate) : null;

      await db.partnerPost.create({
        data: { listingId: listing.id, partnerId: listing.partnerId, kind, title, body, createdAt: postedAt, endDate },
      });
      migratedPosts++;
    }

    // Clear both copies so the public page only ever shows this content via
    // PartnerPost from now on. Cleared regardless of how many entries
    // actually migrated (even zero, if every entry in a malformed array
    // failed the title/body check above) — this is the marker that this
    // listing has been visited, so a later run never re-reads it.
    if (snapshotRaw.length > 0) {
      await db.partnerListing.update({
        where: { id: listing.id },
        data: { updates: [], publishedSnapshot: { ...(snapshot as Record<string, unknown>), updates: [] } as Prisma.InputJsonValue },
      });
    } else {
      await db.partnerListing.update({ where: { id: listing.id }, data: { updates: [] } });
    }
    migratedListings++;
  }

  if (migratedListings > 0) {
    console.log(`Migrated ${migratedPosts} News/Promotion post(s) from ${migratedListings} listing(s) into PartnerPost.`);
  }
}

// Editorial content, not system vocabulary — but unlike coverImage/
// contentImages/translations before this comment was last true, every
// scalar field here (title/excerpt/body/seoTitle/seoDescription/faqs/
// translations) is now re-synced to guides-seed.ts on every run, not just
// at creation. That's what actually lets editing this file and shipping it
// change an already-published guide's content: every edit made to this
// one guide so far (its cover image, its inline WhatsApp photo, its zh/ms
// translations, and now this rewrite) was made exactly that way, not
// through /admin/guides. status/publishedAt are the one exception — set
// once at creation and left alone after, so re-running this never silently
// re-publishes a guide an admin has since unpublished through the admin
// UI, which remains the only way to change those two or to retire a guide
// this file still lists.
//
// A guide's own images are fully owned by this file too: wiped and
// re-uploaded fresh on every run (cheap — a couple of small WebP files)
// rather than patched in place, so the body below always embeds a
// known-fresh URL instead of hunting for an old one by alt text or by
// matching anchor prose against whatever's already stored.
//
// No regenerateSitemapFile()/notifyIndexNow() call here, unlike
// publishGuideAction — both live under src/lib, which (via directory-i18n.ts
// and friends) pulls in the `server-only` package, and that throws
// unconditionally outside Next's own module resolution, which this plain
// tsx/Prisma-CLI script doesn't have. The sitemap doesn't need it anyway:
// instrumentation.ts already regenerates public/sitemap.xml (DirectoryGuide
// rows included) on every process boot, and runSeed() in deploy.ts runs
// right before the restart that triggers exactly that boot. Only the
// IndexNow ping is lost — an edited guide is still discovered on the next
// regular sitemap crawl, just not instantly pinged.
async function seedGuides() {
  let author: { id: string } | null = null;

  for (const guide of GUIDES) {
    let record = await db.directoryGuide.findUnique({ where: { slug: guide.slug }, select: { id: true, publishedAt: true } });

    if (!record) {
      author ??= await db.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (!author) {
        console.log(`Skipping new guide "${guide.title}" — no ADMIN account exists yet to attribute it to.`);
        continue;
      }
      record = await db.directoryGuide.create({
        data: { slug: guide.slug, title: guide.title, excerpt: "", body: "", authorId: author.id },
        select: { id: true, publishedAt: true },
      });
      console.log(`Created guide: ${guide.title}`);
    }

    await db.directoryListingImage.deleteMany({ where: { guideId: record.id } });
    const coverImageUrl = guide.coverImage ? await uploadGuideImage(record.id, guide.coverImage) : null;
    const contentImageUrls: Record<string, string> = {};
    if (guide.contentImages) {
      for (const [key, img] of Object.entries(guide.contentImages)) {
        contentImageUrls[key] = await uploadGuideImage(record.id, img);
      }
    }

    const body = composeGuideBody(guide, coverImageUrl, contentImageUrls);
    const translations = composeGuideTranslations(guide, coverImageUrl, contentImageUrls);

    await db.directoryGuide.update({
      where: { id: record.id },
      data: {
        title: guide.title,
        excerpt: guide.excerpt,
        body,
        seoTitle: guide.seoTitle ?? null,
        seoDescription: guide.seoDescription ?? null,
        faqs: guide.faqs ?? [],
        translations,
        status: "PUBLISHED",
        publishedAt: record.publishedAt ?? new Date(),
      },
    });
    console.log(`Synced guide content: ${guide.title}`);
  }
}

// A plain base64-in-Postgres DirectoryListingImage row, the same storage
// and /api/directory-images/{id} route every other image in this app
// already uses, so no next.config.ts/CSP change is needed. The file itself
// is pre-optimized (see guides-seed.ts's own comment) and just read
// straight off disk here.
async function uploadGuideImage(guideId: string, image: GuideImage): Promise<string> {
  const bytes = readFileSync(path.join(__dirname, "guide-images", image.file));
  const created = await db.directoryListingImage.create({
    data: { mimeType: image.mimeType, data: bytes.toString("base64"), guideId },
    select: { id: true },
  });
  return `/api/directory-images/${created.id}`;
}

// Splices contentImages into `rawBody` right after each one's `after`
// anchor text (see GuideContentImage's own comment on why that sentence
// must stay frozen once shipped), then prepends coverImage — in that
// order, since inserting content images first means their anchor-text
// search runs against `rawBody` exactly as written, unaffected by
// whatever's about to be prepended in front of it. locale selects which
// translated alt/anchor text to match against (undefined for English,
// where `img.after`/`img.alt` are used directly); a missing anchor (prose
// rewritten since without updating `after`) is logged and skipped rather
// than failing the whole deploy over one image.
function composeGuideBody(
  guide: GuideSeed,
  coverImageUrl: string | null,
  contentImageUrls: Record<string, string>,
  locale?: "zh" | "ms",
  rawBody: string = guide.body,
): string {
  let body = rawBody;

  if (guide.contentImages) {
    for (const [key, img] of Object.entries(guide.contentImages)) {
      const anchor = locale ? img.afterTranslations?.[locale] : img.after;
      if (!anchor) continue;
      const anchorIndex = body.indexOf(anchor);
      if (anchorIndex === -1) {
        console.log(`Could not place content image "${key}" on guide "${guide.title}" (locale: ${locale ?? "en"}) — anchor text not found.`);
        continue;
      }
      const insertAt = anchorIndex + anchor.length;
      const alt = locale ? (img.altTranslations?.[locale] ?? img.alt) : img.alt;
      body = `${body.slice(0, insertAt)}\n\n![${alt}](${contentImageUrls[key]})${body.slice(insertAt)}`;
    }
  }

  if (guide.coverImage && coverImageUrl) {
    const alt = locale ? (guide.coverImage.altTranslations?.[locale] ?? guide.coverImage.alt) : guide.coverImage.alt;
    body = `![${alt}](${coverImageUrl})\n\n${body}`;
  }

  return body;
}

function composeGuideTranslations(
  guide: GuideSeed,
  coverImageUrl: string | null,
  contentImageUrls: Record<string, string>,
): Record<string, { title: string; excerpt: string; body: string; faqs: GuideFaqEntry[] }> {
  const translations: Record<string, { title: string; excerpt: string; body: string; faqs: GuideFaqEntry[] }> = {};
  if (!guide.translations) return translations;

  for (const locale of ["zh", "ms"] as const) {
    const entry = guide.translations[locale];
    if (!entry) continue;
    translations[locale] = {
      title: entry.title,
      excerpt: entry.excerpt,
      body: composeGuideBody(guide, coverImageUrl, contentImageUrls, locale, entry.body),
      faqs: entry.faqs ?? [],
    };
  }
  return translations;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
