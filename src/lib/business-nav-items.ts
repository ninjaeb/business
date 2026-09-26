// Every page in the business portal, in menu order. The single source of
// truth for the portal's own hamburger and the public directory's hamburger
// when a signed-in business owner is browsing it, so the two always list
// the same pages, ordered the same way. Unlike the source CRM's version of
// this file, there is no separate PARTNERSHIP_NAV_ITEMS group here — this
// app has no affiliate/referral-commission system for a partner to have a
// second nav group about.
export const BUSINESS_NAV_ITEMS = [
  { href: "/business-portal", label: "Overview" },
  { href: "/business-portal/listings", label: "My listings" },
  { href: "/business-portal/business-leads", label: "Business Leads" },
  { href: "/business-portal/profile", label: "Profile" },
] as const;
