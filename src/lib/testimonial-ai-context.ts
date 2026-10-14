import type { ServiceEntry } from "@/lib/directory";

// What the "Suggest a ready-to-use testimonial" button tells the model about
// the business — kept out of the server action so it's a plain function that
// can be checked on its own (a "use server" file can only export async
// functions, and this is the part worth being certain of: a suggestion about
// a service the customer never used reads as fake, and would be published
// under their name).
//
// Two ways a customer can have named what they used:
//   - requestServiceTitle: a Request Testimonial link, whose owner picked the
//     service(s) when creating it — stored as one string, multiple picks
//     joined with ", " (see testimonial-request-links actions). Matched back
//     to the listing's own services by title rather than split on commas,
//     since a title can itself contain one.
//   - selectedTitles: the optional "which service did you use?" chips on the
//     on-listing form, exact titles.
// With neither, the suggestions draw on everything the business offers.

export type TestimonialIdeasFocus = {
  requestServiceTitle?: string | null;
  selectedTitles?: string[];
};

export type TestimonialIdeasListing = {
  companyName: string;
  tagline: string | null;
  description: string | null;
  services: ServiceEntry[];
};

export function resolveFocusedServices(
  services: ServiceEntry[],
  focus: TestimonialIdeasFocus,
): { matched: ServiceEntry[]; freeText: string | null } {
  const selected = (focus.selectedTitles ?? []).map((title) => title.trim().toLowerCase()).filter(Boolean);
  const requested = focus.requestServiceTitle?.trim() ?? "";

  if (selected.length > 0) {
    const matched = services.filter((service) => selected.includes(service.title.trim().toLowerCase()));
    return { matched, freeText: null };
  }
  if (requested) {
    const lowered = requested.toLowerCase();
    const matched = services.filter((service) => {
      const title = service.title.trim().toLowerCase();
      return title.length > 0 && lowered.includes(title);
    });
    // A link's service text that no longer matches any current service (the
    // service was renamed or removed after the link was made) is still what
    // the owner said this customer used — focus on it as plain text rather
    // than silently falling back to the whole catalogue.
    return { matched, freeText: matched.length === 0 ? requested : null };
  }
  return { matched: [], freeText: null };
}

export function hasFocus(focus: TestimonialIdeasFocus): boolean {
  return Boolean(focus.requestServiceTitle?.trim()) || (focus.selectedTitles ?? []).some((title) => title.trim());
}

function describeService(service: ServiceEntry): string {
  return `- ${service.title}${service.description ? `: ${service.description}` : ""}`;
}

export function buildTestimonialIdeasContext(listing: TestimonialIdeasListing, locale: string, focus: TestimonialIdeasFocus): string {
  const { matched, freeText } = resolveFocusedServices(listing.services, focus);
  const focused = matched.length > 0 || freeText !== null;

  const parts: (string | null)[] = [`Business: ${listing.companyName}`, listing.tagline ? `Tagline: ${listing.tagline}` : null];

  if (focused) {
    // Deliberately leaves out the business's About text and its other
    // services: anything the model can see it can drift toward, and the whole
    // point here is a testimonial about only what this customer used.
    const used = matched.length > 0 ? matched.map(describeService).join("\n") : `- ${freeText}`;
    parts.push(
      `The customer used ONLY the following product(s)/service(s). Write every testimonial about them alone and never mention anything else this business offers:\n${used}`,
    );
  } else {
    parts.push(
      listing.description ? `About: ${listing.description}` : null,
      listing.services.length > 0 ? `Products/services:\n${listing.services.map(describeService).join("\n")}` : null,
    );
  }

  parts.push(`Respond in this language: ${locale}`);
  return parts.filter(Boolean).join("\n\n");
}
