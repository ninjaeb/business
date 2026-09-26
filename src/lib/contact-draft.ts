import type { PartnerCompanyOption } from "@/lib/partner-companies";

// Shared shape for a not-yet-saved PartnerContact pulled from a quick-import
// source (a scanned business card, an imported vCard) — fed into
// PartnerContactForm's `prefill` prop so the user can review/edit before
// saving, the same way both sources end up producing.
//
// `company` carries both id and name (not just id) because it may be a
// company that didn't exist until this exact request created it — the
// name lets the client merge it into its already-rendered company list,
// which was fetched before that company existed.
//
// Unlike the source CRM's version of this file, `company` is typed against
// PartnerCompanyOption (src/lib/partner-companies.ts) rather than a
// staff-only CompanyOption — this app has no staff CRM company table at
// all, so this file has zero dependency on anything staff-only.
export type ContactDraft = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  company: PartnerCompanyOption | null;
};
