import type { DirectoryLeadStatus, Industry, PartnerDealStatus, PartnerListingStatus } from "@/generated/prisma/client";

export const INDUSTRIES: Industry[] = [
  "TECHNOLOGY",
  "RETAIL_ECOMMERCE",
  "HEALTHCARE",
  "FINANCE_BANKING",
  "MANUFACTURING",
  "CONSTRUCTION_REAL_ESTATE",
  "EDUCATION",
  "HOSPITALITY_TOURISM",
  "PROFESSIONAL_SERVICES",
  "MEDIA_ENTERTAINMENT",
  "TRANSPORTATION_LOGISTICS",
  "AGRICULTURE",
  "ENERGY_UTILITIES",
  "GOVERNMENT_NONPROFIT",
  "TELECOMMUNICATIONS",
  "AUTOMOTIVE",
  "FOOD_BEVERAGE",
  "LEGAL",
  "MARKETING_ADVERTISING",
  "OTHER",
];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  TECHNOLOGY: "Technology",
  RETAIL_ECOMMERCE: "Retail & E-commerce",
  HEALTHCARE: "Healthcare",
  FINANCE_BANKING: "Finance & Banking",
  MANUFACTURING: "Manufacturing",
  CONSTRUCTION_REAL_ESTATE: "Construction & Real Estate",
  EDUCATION: "Education",
  HOSPITALITY_TOURISM: "Hospitality & Tourism",
  PROFESSIONAL_SERVICES: "Professional Services",
  MEDIA_ENTERTAINMENT: "Media & Entertainment",
  TRANSPORTATION_LOGISTICS: "Transportation & Logistics",
  AGRICULTURE: "Agriculture",
  ENERGY_UTILITIES: "Energy & Utilities",
  GOVERNMENT_NONPROFIT: "Government & Nonprofit",
  TELECOMMUNICATIONS: "Telecommunications",
  AUTOMOTIVE: "Automotive",
  FOOD_BEVERAGE: "Food & Beverage",
  LEGAL: "Legal",
  MARKETING_ADVERTISING: "Marketing & Advertising",
  OTHER: "Other",
};

// Common free-text spellings/synonyms mapped onto the curated Industry enum
// — used by "AI Auto Create" to reconcile a model-returned industry code.
const INDUSTRY_ALIASES: Record<Industry, string[]> = {
  TECHNOLOGY: ["technology", "tech", "it", "software", "saas", "information technology"],
  RETAIL_ECOMMERCE: ["retail", "ecommerce", "e-commerce", "shop", "store", "commerce"],
  HEALTHCARE: ["healthcare", "health", "medical", "hospital", "clinic", "pharma", "pharmaceutical"],
  FINANCE_BANKING: ["finance", "banking", "bank", "financial services", "insurance", "fintech"],
  MANUFACTURING: ["manufacturing", "factory", "industrial", "production"],
  CONSTRUCTION_REAL_ESTATE: ["construction", "real estate", "realty", "property", "properties"],
  EDUCATION: ["education", "school", "university", "college", "academic", "e-learning", "elearning"],
  HOSPITALITY_TOURISM: ["hospitality", "tourism", "hotel", "travel", "resort"],
  PROFESSIONAL_SERVICES: ["professional services", "consulting", "consultancy", "services"],
  MEDIA_ENTERTAINMENT: ["media", "entertainment", "film", "music", "publishing", "broadcasting"],
  TRANSPORTATION_LOGISTICS: ["transportation", "logistics", "shipping", "freight", "transport", "delivery"],
  AGRICULTURE: ["agriculture", "farming", "agri", "agribusiness"],
  ENERGY_UTILITIES: ["energy", "utilities", "utility", "power", "oil and gas", "oil & gas"],
  GOVERNMENT_NONPROFIT: ["government", "nonprofit", "non-profit", "ngo", "public sector", "charity"],
  TELECOMMUNICATIONS: ["telecommunications", "telecom", "telco"],
  AUTOMOTIVE: ["automotive", "auto", "car", "vehicle", "cars"],
  FOOD_BEVERAGE: ["food", "beverage", "f&b", "restaurant", "catering"],
  LEGAL: ["legal", "law", "law firm", "attorney"],
  MARKETING_ADVERTISING: ["marketing", "advertising", "ads", "agency", "pr", "public relations"],
  OTHER: ["other", "misc", "miscellaneous"],
};

export function matchIndustry(rawValue: string): Industry | null {
  const normalized = rawValue.trim().toLowerCase().replace(/[&/]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  for (const industry of INDUSTRIES) {
    if (INDUSTRY_ALIASES[industry].some((alias) => alias === normalized)) return industry;
  }
  for (const industry of INDUSTRIES) {
    if (INDUSTRY_ALIASES[industry].some((alias) => normalized.includes(alias))) return industry;
  }
  return null;
}

export const PARTNER_LISTING_STATUS_LABELS: Record<PartnerListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Changes requested",
};

export const PARTNER_LISTING_STATUS_BADGE_CLASSES: Record<PartnerListingStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/30",
  PENDING_REVIEW:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-500/30",
  PUBLISHED:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-500/30",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-500/30",
};

// Declared in the order the partner's status picker lists them.
export const DIRECTORY_LEAD_STATUSES: DirectoryLeadStatus[] = ["NEW", "PICKED_UP", "CONTACTED", "QUOTED", "WON", "LOST"];

export const DIRECTORY_LEAD_STATUS_LABELS: Record<DirectoryLeadStatus, string> = {
  NEW: "New",
  PICKED_UP: "Picked up",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  WON: "Won",
  LOST: "Lost",
};

export const DIRECTORY_LEAD_STATUS_BADGE_CLASSES: Record<DirectoryLeadStatus, string> = {
  NEW: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-500/30",
  PICKED_UP:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-500/30",
  CONTACTED:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-500/30",
  QUOTED:
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-500/30",
  WON: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-500/30",
  LOST: "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/30",
};
