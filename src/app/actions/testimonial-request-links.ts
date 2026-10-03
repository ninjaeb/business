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
  serviceTitle: z.string().trim().max(150).optional(),
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
  const parsed = createSchema.safeParse({
    listingId: formData.get("listingId"),
    serviceTitle: formData.get("serviceTitle") || undefined,
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
