"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePartnerAction } from "@/lib/auth/dal";
import { getOwnedListing } from "@/lib/directory";
import { getOwnedTestimonialRequestLink } from "@/lib/testimonial-request-links";

const createSchema = z.object({
  listingId: z.string().trim().min(1, "Choose a listing."),
  // Several service titles, comma-joined (see the form's own
  // MultiCombobox) — 300 comfortably fits a handful of the 80-char titles
  // services-editor.tsx allows, well short of this column's own unbounded
  // length.
  serviceTitle: z.string().trim().max(300).optional(),
  customerName: z.string().trim().max(100).optional(),
  customerCompany: z.string().trim().max(150).optional(),
  customerTitle: z.string().trim().max(100).optional(),
  note: z.string().trim().max(150).optional(),
});

export type TestimonialRequestLinkFormState = { error: string } | undefined;

// listingId is checked against the calling partner before anything is
// written — same "an id alone doesn't prove ownership" discipline as
// createPartnerCompany's own sibling actions, just checked against the
// listing rather than a bare partnerId column since this row is
// listing-scoped (see TestimonialRequestLink's own comment).
export async function createTestimonialRequestLink(
  _prevState: TestimonialRequestLinkFormState,
  formData: FormData,
): Promise<TestimonialRequestLinkFormState> {
  const partner = await requirePartnerAction();
  // MultiCombobox submits one "serviceTitles" input per selection (same
  // shape a group of same-named checkboxes would have); the no-services
  // fallback <Input> submits the same name with a single typed value —
  // either way, getAll + join is how multiple picks become the one
  // serviceTitle string this row actually stores (see its own comment).
  const serviceTitles = formData
    .getAll("serviceTitles")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const parsed = createSchema.safeParse({
    listingId: formData.get("listingId"),
    serviceTitle: serviceTitles.length > 0 ? serviceTitles.join(", ") : undefined,
    customerName: formData.get("customerName") || undefined,
    customerCompany: formData.get("customerCompany") || undefined,
    customerTitle: formData.get("customerTitle") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const listing = await getOwnedListing(parsed.data.listingId, partner.id);
  if (!listing) return { error: "Listing not found." };

  await db.testimonialRequestLink.create({
    data: {
      listingId: listing.id,
      serviceTitle: parsed.data.serviceTitle || null,
      customerName: parsed.data.customerName || null,
      customerCompany: parsed.data.customerCompany || null,
      customerTitle: parsed.data.customerTitle || null,
      note: parsed.data.note || null,
    },
  });
  revalidatePath("/business-portal/testimonial-links");
  redirect("/business-portal/testimonial-links");
}

export async function deleteTestimonialRequestLink(id: string, formData: FormData) {
  void formData;
  const partner = await requirePartnerAction();
  const existing = await getOwnedTestimonialRequestLink(id, partner.id);
  if (!existing) throw new Error("Link not found.");
  await db.testimonialRequestLink.delete({ where: { id } });
  revalidatePath("/business-portal/testimonial-links");
  redirect("/business-portal/testimonial-links");
}
