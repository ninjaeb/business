"use client";

import { useActionState, useMemo, useState } from "react";
import type { ServiceEntry } from "@/lib/directory";
import type { TestimonialRequestLinkFormState } from "@/app/actions/testimonial-request-links";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_TESTIMONIALS_STRINGS } from "@/lib/portal-testimonials-i18n";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { MultiCombobox } from "@/components/ui/multi-combobox";

export function TestimonialRequestLinkForm({
  action,
  listings,
  initialValues,
  locale,
  submitLabel,
  pendingLabel,
}: {
  action: (prevState: TestimonialRequestLinkFormState, formData: FormData) => Promise<TestimonialRequestLinkFormState>;
  // Already parsed server-side (see new/page.tsx's own comment on why) —
  // just the id/name/services slice this form needs, not a full
  // PartnerListing row.
  listings: { id: string; companyName: string; services: ServiceEntry[] }[];
  // Present only on the edit page (see [id]/edit/page.tsx) — prefills every
  // field from the existing row. Undefined means create mode.
  initialValues?: {
    listingId: string;
    customerName: string;
    customerTitle: string;
    customerCompany: string;
    serviceTitles: string[];
    note: string;
  };
  locale: DirectoryLocale;
  // Defaults to this locale's own "Create link"/"Creating…" (the new-link
  // page's own case) — the edit page passes its "Save changes"/"Saving…"
  // explicitly instead (see [id]/edit/page.tsx).
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const t = PORTAL_TESTIMONIALS_STRINGS[locale];
  const resolvedSubmitLabel = submitLabel ?? t.createLinkCta;
  const resolvedPendingLabel = pendingLabel ?? t.creatingCta;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [listingId, setListingId] = useState(initialValues?.listingId ?? listings[0]?.id);

  // Options track whichever listing is currently selected — a partner with
  // more than one listing sees that listing's own services, not a merged
  // list across all of them, since "Web Design" on listing A has nothing to
  // do with listing B.
  const serviceOptions = useMemo(() => {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return [];
    return listing.services.map((service) => ({ value: service.title, label: service.title }));
  }, [listings, listingId]);

  return (
    <form action={formAction} className="space-y-4">
      {listings.length > 1 && (
        <FieldGroup label={t.formListingLabel} htmlFor="listingId" required>
          <Select
            id="listingId"
            name="listingId"
            required
            value={listingId}
            onChange={(event) => setListingId(event.target.value)}
          >
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.companyName}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
      {listings.length === 1 && <input type="hidden" name="listingId" value={listings[0].id} />}

      {/* Prefills the standalone form's own name/company/title fields (see
          StandaloneTestimonialForm) — all optional, and still editable by
          the customer before they submit, so a guess here that's wrong or
          incomplete costs nothing. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.formCustomerNameLabel} htmlFor="customerName">
          <Input id="customerName" name="customerName" placeholder={t.formCustomerNamePlaceholder} defaultValue={initialValues?.customerName} />
        </FieldGroup>
        <FieldGroup label={t.formCustomerTitleLabel} htmlFor="customerTitle">
          <Input
            id="customerTitle"
            name="customerTitle"
            placeholder={t.formCustomerTitlePlaceholder}
            defaultValue={initialValues?.customerTitle}
          />
        </FieldGroup>
      </div>
      <FieldGroup label={t.formCustomerCompanyLabel} htmlFor="customerCompany">
        <Input
          id="customerCompany"
          name="customerCompany"
          placeholder={t.formCustomerCompanyPlaceholder}
          defaultValue={initialValues?.customerCompany}
        />
      </FieldGroup>

      <FieldGroup label={t.formServiceLabel} htmlFor="serviceTitles">
        {serviceOptions.length > 0 ? (
          <MultiCombobox
            // Forces a remount on every listing switch — MultiCombobox
            // tracks its own selection internally and never clears it when
            // its `options` prop changes, so without this a selection made
            // for one listing would silently keep submitting as a hidden
            // input after switching to another listing whose services
            // don't include it at all (invisible in the chip UI, since
            // those chips are filtered against the new options, but still
            // present in `selected` and still posted on submit).
            key={listingId}
            id="serviceTitles"
            name="serviceTitles"
            options={serviceOptions}
            defaultValue={listingId === initialValues?.listingId ? initialValues?.serviceTitles : undefined}
            placeholder={t.formServiceSearchPlaceholder}
            emptyMessage={t.formServiceEmptyMessage}
          />
        ) : (
          // Falls back to free text when the selected listing has no
          // formal services of its own on file yet. Same remount-on-switch
          // reasoning as the MultiCombobox branch above.
          <Input
            key={listingId}
            id="serviceTitles"
            name="serviceTitles"
            placeholder={t.formServiceFreeTextPlaceholder}
            autoComplete="off"
            defaultValue={listingId === initialValues?.listingId ? initialValues?.serviceTitles?.join(", ") : undefined}
          />
        )}
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t.formServiceHint}</p>
      </FieldGroup>

      <FieldGroup label={t.formNoteLabel} htmlFor="note">
        <Input id="note" name="note" placeholder={t.formNotePlaceholder} defaultValue={initialValues?.note} />
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t.formNoteHint}</p>
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? resolvedPendingLabel : resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
}
