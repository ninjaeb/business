import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";
import { GUIDES, type GuideImage, type GuideContentImage } from "./guides-seed";

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
}

// Editorial content, not system vocabulary — unlike BUSINESS_CATEGORIES
// above, a guide's own title/excerpt/body/seo fields are only ever written
// here once: once a slug exists, further text edits/unpublishing are the
// admin UI's job. This is what lets new guides go live the ordinary way
// (append to guides-seed.ts, push, deploy) without a direct production DB
// connection or an admin session. coverImage is the one field this keeps
// managing after creation — see attachCoverImage below — since it also
// needs to work as a backfill for a guide published before it had one.
//
// No regenerateSitemapFile()/notifyIndexNow() call here, unlike
// publishGuideAction — both live under src/lib, which (via directory-i18n.ts
// and friends) pulls in the `server-only` package, and that throws
// unconditionally outside Next's own module resolution, which this plain
// tsx/Prisma-CLI script doesn't have. The sitemap doesn't need it anyway:
// instrumentation.ts already regenerates public/sitemap.xml (DirectoryGuide
// rows included) on every process boot, and runSeed() in deploy.ts runs
// right before the restart that triggers exactly that boot. Only the
// IndexNow ping is lost — new guides are still discovered on the next
// regular sitemap crawl, just not instantly pinged.
async function seedGuides() {
  let author: { id: string } | null = null;

  for (const guide of GUIDES) {
    let record = await db.directoryGuide.findUnique({ where: { slug: guide.slug }, select: { id: true, body: true } });

    if (!record) {
      author ??= await db.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (!author) {
        console.log(`Skipping new guide "${guide.title}" — no ADMIN account exists yet to attribute it to.`);
        continue;
      }
      record = await db.directoryGuide.create({
        data: {
          slug: guide.slug,
          title: guide.title,
          excerpt: guide.excerpt,
          body: guide.body,
          seoTitle: guide.seoTitle,
          seoDescription: guide.seoDescription,
          status: "PUBLISHED",
          publishedAt: new Date(),
          authorId: author.id,
        },
        select: { id: true, body: true },
      });
      console.log(`Published guide: ${guide.title}`);
    }

    if (guide.coverImage) record.body = await attachCoverImage(record.id, record.body, guide.coverImage, guide.title);
    if (guide.contentImages) {
      record.body = await attachContentImages(record.id, record.body, guide.contentImages, guide.title);
    }
  }
}

// Idempotent per guide (checked via whether a DirectoryListingImage already
// points at it), so this both attaches a new guide's cover image on first
// creation above and backfills one onto a guide that was already seeded
// before coverImage existed — a plain base64-in-Postgres DirectoryListingImage
// row, the same storage and /api/directory-images/{id} route every other
// image in this app already uses, so no next.config.ts/CSP change is
// needed. The file itself is pre-optimized (see guides-seed.ts's own
// comment) and just read straight off disk here. Returns the guide's new
// body so a later step (attachContentImages) keeps working off the current
// text instead of the stale copy read before this ran.
async function attachCoverImage(guideId: string, body: string, coverImage: GuideImage, guideTitle: string): Promise<string> {
  const hasImage = await db.directoryListingImage.findFirst({ where: { guideId }, select: { id: true } });
  if (hasImage) return body;

  const bytes = readFileSync(path.join(__dirname, "guide-images", coverImage.file));
  const image = await db.directoryListingImage.create({
    data: { mimeType: coverImage.mimeType, data: bytes.toString("base64"), guideId },
    select: { id: true },
  });
  const nextBody = `![${coverImage.alt}](/api/directory-images/${image.id})\n\n${body}`;
  await db.directoryGuide.update({ where: { id: guideId }, data: { body: nextBody } });
  console.log(`Attached cover image to guide: ${guideTitle}`);
  return nextBody;
}

// Inserts each image right after its `after` anchor text (see
// GuideContentImage's own comment) as its own paragraph. Idempotency is
// checked via whether that exact `![alt](` markdown is already in `body` —
// not a DirectoryListingImage lookup, since a guide can have several
// content images and "any image exists" wouldn't say which ones are
// already placed. A missing anchor (prose edited since) is logged and
// skipped rather than failing the whole deploy over one image.
async function attachContentImages(
  guideId: string,
  body: string,
  images: Record<string, GuideContentImage>,
  guideTitle: string,
): Promise<string> {
  let nextBody = body;
  let attachedAny = false;

  for (const [key, img] of Object.entries(images)) {
    const marker = `![${img.alt}](`;
    if (nextBody.includes(marker)) continue;

    const anchorIndex = nextBody.indexOf(img.after);
    if (anchorIndex === -1) {
      console.log(`Could not place content image "${key}" on guide "${guideTitle}" — anchor text not found in its current body.`);
      continue;
    }
    const insertAt = anchorIndex + img.after.length;

    const bytes = readFileSync(path.join(__dirname, "guide-images", img.file));
    const image = await db.directoryListingImage.create({
      data: { mimeType: img.mimeType, data: bytes.toString("base64"), guideId },
      select: { id: true },
    });
    nextBody = `${nextBody.slice(0, insertAt)}\n\n![${img.alt}](/api/directory-images/${image.id})${nextBody.slice(insertAt)}`;
    attachedAny = true;
  }

  if (attachedAny) {
    await db.directoryGuide.update({ where: { id: guideId }, data: { body: nextBody } });
    console.log(`Attached content image(s) to guide: ${guideTitle}`);
  }
  return nextBody;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
