// Every page in the business portal, in menu order. The single source of
// truth for the portal's own hamburger and the public directory's hamburger
// when a signed-in business owner is browsing it, so the two always list
// the same pages, ordered the same way. Unlike the source CRM's version of
// this file, there is no separate PARTNERSHIP_NAV_ITEMS group here — this
// app's referral system is attribution only (see PartnerListing.referralCode,
// DirectoryLead.referrerId), never a commission/payout ledger, so it's
// surfaced as a section of the Dashboard below rather than a nav group of
// its own.
export const BUSINESS_NAV_ITEMS = [
  { href: "/business-portal", label: "Dashboard" },
  { href: "/business-portal/listings", label: "My Business" },
  { href: "/business-portal/testimonials", label: "Testimonials" },
  { href: "/business-portal/business-leads", label: "Business Leads" },
  { href: "/business-portal/companies", label: "Companies" },
  { href: "/business-portal/contacts", label: "Contacts" },
  { href: "/business-portal/deals", label: "Deals" },
  { href: "/business-portal/tasks", label: "Tasks" },
  { href: "/business-portal/profile", label: "Profile" },
] as const;
