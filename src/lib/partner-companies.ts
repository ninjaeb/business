import { db } from "@/lib/db";

export type PartnerCompanyOption = { id: string; name: string };
export type PartnerCompanyHints = { website?: string | null; phone?: string | null; address?: string | null };

// Same find-or-create-by-name convention as findOrCreateCompanyByName
// (the source CRM's src/lib/companies.ts, which has no counterpart in this
// app), but scoped to one partner's own PartnerCompany rows rather than a
// system-wide Company table — a business card or vCard imported into the
// business portal should only ever match/create a company that partner can
// already see.
//
// `hints` only ever fill a blank — website/phone/address the company
// doesn't have yet — never overwrite something already there, same policy
// findOrCreateCompanyByName follows.
export async function findOrCreatePartnerCompanyByName(
  partnerId: string,
  name: string,
  hints: PartnerCompanyHints = {},
): Promise<PartnerCompanyOption | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const website = hints.website?.trim() || null;
  const phone = hints.phone?.trim() || null;
  const address = hints.address?.trim() || null;

  const existing = await db.partnerCompany.findFirst({
    where: { partnerId, name: trimmed },
    select: { id: true, name: true, website: true, phone: true, address: true },
  });
  if (existing) {
    const fill: { website?: string; phone?: string; address?: string } = {};
    if (!existing.website && website) fill.website = website;
    if (!existing.phone && phone) fill.phone = phone;
    if (!existing.address && address) fill.address = address;
    if (Object.keys(fill).length > 0) {
      await db.partnerCompany.update({ where: { id: existing.id }, data: fill });
    }
    return { id: existing.id, name: existing.name };
  }

  return db.partnerCompany.create({
    data: { name: trimmed, partnerId, website, phone, address },
    select: { id: true, name: true },
  });
}

// Free/personal email providers — a contact's address at one of these says
// nothing about their employer's actual domain, so deriveCompanyDomain
// below refuses to guess from them rather than filling a company's website
// with "gmail.com". Relocated here (rather than a `@/lib/companies`, which
// doesn't exist in this app — that's the source CRM's staff-side
// company-lookup file) since this app's only company-domain consumers are
// partner-scoped: the business-card scan and vCard import actions below.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "gmx.com",
  "163.com",
  "126.com",
  "qq.com",
]);

// A contact's own email domain is a reasonable stand-in for their
// employer's website when nothing else says otherwise (business card scan,
// vCard import) — but only for a domain that actually looks like a
// business one, not a free/personal provider.
export function deriveCompanyDomain(email: string): string | null {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain || !domain.includes(".")) return null;
  if (FREE_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

// Strips a printed/typed website down to a bare domain — "https://www.acme.com/contact"
// or "www.Acme.com" both become "acme.com" — so it stores the same shape
// deriveCompanyDomain above produces from an email address.
export function normalizeDomain(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withoutProtocol = trimmed.replace(/^[a-z]+:\/\//i, "");
  const host = withoutProtocol.split(/[/?#]/)[0].replace(/^www\./i, "").toLowerCase();
  return host.includes(".") ? host : null;
}
