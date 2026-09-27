"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Eye, Link2, Megaphone, Trash2 } from "lucide-react";
import { bulkLinkListingsAsBranches, deleteListingAction } from "@/app/actions/directory";
import type { PartnerListingStatus } from "@/generated/prisma/client";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { ListingLogo } from "@/components/directory/listing-logo";
import { useToast } from "@/components/ui/toast";
import { PARTNER_LISTING_STATUS_BADGE_CLASSES, PARTNER_LISTING_STATUS_LABELS } from "@/lib/labels";

export type MyBusinessListingCard = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  status: PartnerListingStatus;
  publicUrl: string | null;
  currentUpdatesUrl: string | null;
  trackedViewCount: number;
  viewBreakdown: { locale: DirectoryLocale; label: string; count: number; href: string }[];
  canDelete: boolean;
};

// Lets a partner with several locations tick two or more at once and link
// them all together as branches of each other in one action (see
// bulkLinkListingsAsBranches), rather than opening each listing's own
// editor to add the others one at a time through its "Linked branches"
// field (PartnerListingForm). Selection only makes sense with at least two
// listings to choose from — PartnerListingsPage doesn't even mount this
// below that.
export function MyBusinessListingsGrid({ listings }: { listings: MyBusinessListingCard[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleLinkSelected() {
    const ids = [...selected];
    startTransition(async () => {
      const result = await bulkLinkListingsAsBranches(ids);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.linkedCount > 0
          ? `Linked ${ids.length} listings as branches of each other.`
          : "Those listings are already linked as branches of each other.",
      );
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-3">
      {/* Floating rather than inline so it stays reachable without scrolling
          back up, however far down the grid the selected cards are — fixed
          to the viewport (not sticky) so it never shifts the grid above it.
          The sm:left offset clears PartnerLayout's persistent sidebar
          (w-60 = 15rem) plus <main>'s own sm:px-8 (2rem) so the bar lines up
          with the grid's own left edge instead of hiding behind the rail. */}
      {selected.size > 0 && (
        <div className="fixed inset-x-4 bottom-6 z-30 flex items-center justify-between gap-3 rounded-md border border-petrol/30 bg-led-soft px-4 py-2.5 text-sm shadow-lg dark:bg-led-soft-dark sm:inset-x-8 sm:left-[17rem]">
          <span className="font-medium text-petrol-ink dark:text-petrol-light">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-slate-500 hover:underline dark:text-slate-400"
            >
              Clear
            </button>
            <Button type="button" size="sm" disabled={selected.size < 2 || pending} onClick={handleLinkSelected}>
              <Link2 className="h-4 w-4" />
              {pending ? "Linking…" : "Link as branches"}
            </Button>
          </div>
        </div>
      )}

      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", selected.size > 0 && "pb-20")}>
        {listings.map((listing) => (
          <Card key={listing.id} className="relative">
            <label className="absolute right-4 top-4 flex h-5 w-5 cursor-pointer items-center justify-center">
              <span className="sr-only">Select {listing.companyName}</span>
              <input
                type="checkbox"
                checked={selected.has(listing.id)}
                onChange={() => toggle(listing.id)}
                className="h-4 w-4 rounded border-slate-300 text-petrol focus-visible:ring-2 focus-visible:ring-petrol dark:border-neutral-600"
              />
            </label>
            <CardBody className="space-y-3">
              <div className="flex items-start gap-3 pr-6">
                <ListingLogo name={listing.companyName} logoUrl={listing.logoUrl} className="h-10 w-10 shrink-0 text-sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800 dark:text-slate-200">{listing.companyName}</p>
                  <Badge className={PARTNER_LISTING_STATUS_BADGE_CLASSES[listing.status]}>
                    {PARTNER_LISTING_STATUS_LABELS[listing.status]}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <Link href={`/business-portal/listings/${listing.id}`} className={buttonClasses("secondary", "sm")}>
                  Edit
                </Link>
                {listing.canDelete && (
                  <form action={deleteListingAction.bind(null, listing.id)}>
                    <ConfirmSubmitButton confirmMessage={`Delete the draft "${listing.companyName}"? This can't be undone.`}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                )}
                {listing.publicUrl && (
                  <Link
                    href={listing.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-petrol hover:underline dark:text-petrol-light"
                  >
                    View public listing
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                {listing.currentUpdatesUrl && (
                  <Link
                    href={listing.currentUpdatesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-petrol hover:underline dark:text-petrol-light"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    News & Promotions
                  </Link>
                )}
                {listing.publicUrl && (
                  <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {listing.trackedViewCount.toLocaleString()} view{listing.trackedViewCount === 1 ? "" : "s"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      (
                      {listing.viewBreakdown.map(({ locale, label, count, href }, i) => (
                        <Fragment key={locale}>
                          {i > 0 && " · "}
                          <Link
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-petrol hover:underline dark:hover:text-petrol-light"
                          >
                            {label} {count.toLocaleString()}
                          </Link>
                        </Fragment>
                      ))}
                      )
                    </span>
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
