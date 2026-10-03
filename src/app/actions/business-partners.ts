"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePartnerAction } from "@/lib/auth/dal";
import { getOwnedListing, readPublishedSnapshot } from "@/lib/directory";
import {
  getOwnedBusinessPartnerLink,
  getOwnedBusinessPartnerInvite,
  searchBusinessPartnerCandidates,
  type BusinessPartnerSearchResult,
} from "@/lib/business-partners";
import { notifyPartnerOfBusinessPartnerRequest, sendBusinessPartnerInvite } from "@/lib/directory-notify";
import { revalidateDirectory } from "@/lib/directory-revalidate";
import { isValidPhoneFormat, normalizePhone, PHONE_FORMAT_HINT } from "@/lib/phone";

const PORTAL_PATH = "/business-portal/business-partners";

// The "add business partner" picker's own live search (see
// BusinessPartnerRequestForm) — partner-gated same as every other
// business-portal action, even though a PUBLISHED listing's name is
// already public on the directory itself, for consistency with every
// other action in this file. excludeListingId is always the partner's own
// listing making the request, so it never shows up as a candidate to
// partner with itself.
export async function searchBusinessPartners(query: string, excludeListingId: string): Promise<BusinessPartnerSearchResult[]> {
  const partner = await requirePartnerAction();
  const listing = await getOwnedListing(excludeListingId, partner.id);
  if (!listing) return [];
  const ownListings = await db.partnerListing.findMany({ where: { partnerId: partner.id }, select: { id: true } });
  return searchBusinessPartnerCandidates(
    query,
    ownListings.map((item) => item.id),
  );
}

const requestSchema = z.object({
  listingId: z.string().trim().min(1, "Choose which of your listings is requesting this."),
  targetListingId: z.string().trim().min(1, "Choose a business to connect with."),
});

export type BusinessPartnerRequestFormState = { error: string } | undefined;

// listingId/targetListingId are both checked before anything is written —
// listingId against the calling partner (same "an id alone doesn't prove
// ownership" discipline as every other partner-gated action), and
// targetListingId against the two things that make it a legitimate
// request: not one of the partner's own other listings (that's branch
// linking, not this), and actually live on the public directory (a
// partner can't request a connection with a listing visitors can't see).
export async function requestBusinessPartner(
  _prevState: BusinessPartnerRequestFormState,
  formData: FormData,
): Promise<BusinessPartnerRequestFormState> {
  const partner = await requirePartnerAction();
  const parsed = requestSchema.safeParse({
    listingId: formData.get("listingId"),
    targetListingId: formData.get("targetListingId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  if (parsed.data.listingId === parsed.data.targetListingId) {
    return { error: "Choose a different business — not your own listing." };
  }

  const listing = await getOwnedListing(parsed.data.listingId, partner.id);
  if (!listing) return { error: "Listing not found." };

  const target = await db.partnerListing.findUnique({ where: { id: parsed.data.targetListingId } });
  if (!target || !readPublishedSnapshot(target.publishedSnapshot)) {
    return { error: "That business couldn't be found." };
  }
  if (target.partnerId === partner.id) {
    return { error: "That's one of your own listings — link it as a branch instead, from its own editor." };
  }

  const existing = await db.businessPartnerLink.findFirst({
    where: {
      OR: [
        { requesterListingId: listing.id, recipientListingId: target.id },
        { requesterListingId: target.id, recipientListingId: listing.id },
      ],
    },
  });
  if (existing) {
    return {
      error:
        existing.status === "ACCEPTED"
          ? "You're already connected with that business."
          : existing.status === "PENDING"
            ? "A request with that business is already pending."
            : "That business previously declined a request — ask them directly before trying again.",
    };
  }

  await db.businessPartnerLink.create({
    data: { requesterListingId: listing.id, recipientListingId: target.id },
  });
  await notifyPartnerOfBusinessPartnerRequest(target, listing);
  revalidatePath(PORTAL_PATH);
  redirect(PORTAL_PATH);
}

// Only the recipient side may accept/decline — the requester already
// expressed their own intent by sending the request.
export async function acceptBusinessPartnerLink(id: string, formData: FormData) {
  void formData;
  const partner = await requirePartnerAction();
  const link = await getOwnedBusinessPartnerLink(id, partner.id);
  if (!link || link.recipientListing.partnerId !== partner.id) throw new Error("Request not found.");
  if (link.status !== "PENDING") throw new Error("This request has already been responded to.");

  await db.businessPartnerLink.update({ where: { id }, data: { status: "ACCEPTED", respondedAt: new Date() } });
  revalidatePath(PORTAL_PATH);
  revalidateDirectory({ slugs: [link.requesterListing.slug, link.recipientListing.slug] });
  redirect(PORTAL_PATH);
}

export async function declineBusinessPartnerLink(id: string, formData: FormData) {
  void formData;
  const partner = await requirePartnerAction();
  const link = await getOwnedBusinessPartnerLink(id, partner.id);
  if (!link || link.recipientListing.partnerId !== partner.id) throw new Error("Request not found.");
  if (link.status !== "PENDING") throw new Error("This request has already been responded to.");

  await db.businessPartnerLink.update({ where: { id }, data: { status: "DECLINED", respondedAt: new Date() } });
  revalidatePath(PORTAL_PATH);
  redirect(PORTAL_PATH);
}

// Either side can remove a connection, whatever its status — the
// requester cancelling a still-pending request, or either partner ending
// an already-ACCEPTED one. Unlike accept/decline, this isn't gated to one
// specific side: getOwnedBusinessPartnerLink itself already only resolves
// a row this partner has a stake in on either side.
export async function removeBusinessPartnerLink(id: string, formData: FormData) {
  void formData;
  const partner = await requirePartnerAction();
  const link = await getOwnedBusinessPartnerLink(id, partner.id);
  if (!link) throw new Error("Request not found.");

  await db.businessPartnerLink.delete({ where: { id } });
  revalidatePath(PORTAL_PATH);
  if (link.status === "ACCEPTED") revalidateDirectory({ slugs: [link.requesterListing.slug, link.recipientListing.slug] });
  redirect(PORTAL_PATH);
}

const inviteSchema = z.object({
  listingId: z.string().trim().min(1, "Choose which of your listings is sending this invite."),
  companyName: z.string().trim().min(1, "Enter the company's name.").max(150),
  contactName: z.string().trim().min(1, "Enter a contact name.").max(100),
  email: z.string().trim().toLowerCase().min(1, "Enter an email address.").email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a contact number.")
    .refine(isValidPhoneFormat, { message: PHONE_FORMAT_HINT }),
});

export type BusinessPartnerInviteFormState = { error: string } | undefined;

// listingId is checked against the calling partner before anything is
// written, same discipline as requestBusinessPartner above. Both send
// channels (see sendBusinessPartnerInvite) are attempted regardless of
// whether the other is configured/succeeds — this row is created either
// way, since the invite itself (and the ability to see/resend it later)
// shouldn't depend on either channel actually working.
export async function createBusinessPartnerInvite(
  _prevState: BusinessPartnerInviteFormState,
  formData: FormData,
): Promise<BusinessPartnerInviteFormState> {
  const partner = await requirePartnerAction();
  const parsed = inviteSchema.safeParse({
    listingId: formData.get("listingId"),
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const listing = await getOwnedListing(parsed.data.listingId, partner.id);
  if (!listing) return { error: "Listing not found." };

  const invite = await db.businessPartnerInvite.create({
    data: {
      inviterListingId: listing.id,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: normalizePhone(parsed.data.phone),
    },
  });
  const { emailSent, whatsappSent } = await sendBusinessPartnerInvite(invite, listing);
  if (emailSent || whatsappSent) {
    await db.businessPartnerInvite.update({
      where: { id: invite.id },
      data: { emailSentAt: emailSent ? new Date() : undefined, whatsappSentAt: whatsappSent ? new Date() : undefined },
    });
  }
  revalidatePath(PORTAL_PATH);
  redirect(PORTAL_PATH);
}

export async function deleteBusinessPartnerInvite(id: string, formData: FormData) {
  void formData;
  const partner = await requirePartnerAction();
  const existing = await getOwnedBusinessPartnerInvite(id, partner.id);
  if (!existing) throw new Error("Invite not found.");
  await db.businessPartnerInvite.delete({ where: { id } });
  revalidatePath(PORTAL_PATH);
  redirect(PORTAL_PATH);
}
