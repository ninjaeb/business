import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Clock, MapPin } from "lucide-react";
import {
  currentDayInTimezone,
  DAYS_OF_WEEK,
  getPublishedBranchListings,
  getPublishedListingBySlug,
  isOpenNow,
  type OperatingHours,
} from "@/lib/directory";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingPath, directoryListingVisitPath, type DirectoryStrings } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { GoogleMapsIcon } from "@/components/directory/google-maps-icon";
import { WazeIcon } from "@/components/directory/waze-icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) return {};

  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[resolved];
  return buildListingMetadata({
    listing,
    siteOrigin,
    locale: resolved,
    pageUrl: `${siteOrigin}${directoryListingVisitPath(resolved, slug)}`,
    pathFor: (code) => directoryListingVisitPath(code, slug),
    sectionHeading: t.visitHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

type HoursRow = { day: string; label: string; status: string; isToday: boolean };

// One row per day of the week (Monday–Sunday, always all seven) rather than
// collapsing consecutive matching days into a range — this is the display
// table on the Visit us page; buildJsonLd's own openingHours (see the
// shared layout) still uses the compact grouped form, which is what
// schema.org actually wants.
function buildHoursRows(hours: OperatingHours, t: DirectoryStrings, timezone: string | null): HoursRow[] {
  // Prefer the listing's own timezone for "today" — an older listing with
  // none set falls back to the server's local day rather than showing no
  // highlight at all.
  const jsDay = new Date().getDay(); // 0 (Sun) .. 6 (Sat)
  const serverTodayKey = DAYS_OF_WEEK[(jsDay + 6) % 7]; // rotate to our Monday-first order
  const todayKey = (timezone && currentDayInTimezone(timezone)) || serverTodayKey;
  return DAYS_OF_WEEK.map((day) => {
    const isToday = day === todayKey;
    const dayHours = hours[day];
    const status = dayHours
      ? `${isToday ? t.hoursOpenTodayLabel : t.hoursOpenLabel}: ${dayHours.open} – ${dayHours.close}`
      : isToday
        ? t.hoursClosedTodayLabel
        : t.hoursClosedLabel;
    return { day, label: t.dayLabels[day], status, isToday };
  });
}

// Directions, not just a pin — google.com/maps/dir (unlike the address
// link's own /maps/search) and waze.com/ul?navigate=yes both drop a visitor
// straight into turn-by-turn navigation, on mobile handing off to each
// app's own native client the same way a tel:/mailto: link would.
function googleMapsDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.replace(/\n/g, ", "))}`;
}

function wazeDirectionsUrl(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address.replace(/\n/g, ", "))}&navigate=yes`;
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();
  const mapAddress = listing.address;
  const branches = await getPublishedBranchListings(listing.id);
  if (!mapAddress && !listing.operatingHours && branches.length === 0) notFound();

  const t = DIRECTORY_STRINGS[resolved];

  return (
    <div className="space-y-6">
      <div className={cn("grid gap-6", mapAddress && listing.operatingHours ? "sm:grid-cols-2" : "")}>
        {mapAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.visitHeading}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress.replace(/\n/g, ", "))}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-start gap-2 text-base text-slate-600 hover:text-petrol hover:underline dark:text-slate-300 dark:hover:text-petrol-light"
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <span className="whitespace-pre-wrap">{listing.address}</span>
              </a>
              <div className="flex flex-wrap gap-2">
                <a
                  href={googleMapsDirectionsUrl(mapAddress)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className={buttonClasses("secondary", "sm")}
                >
                  <GoogleMapsIcon className="h-4 w-4" />
                  {t.navigateGoogleMapsLabel}
                </a>
                <a
                  href={wazeDirectionsUrl(mapAddress)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className={buttonClasses("secondary", "sm")}
                >
                  <WazeIcon className="h-4 w-4" />
                  {t.navigateWazeLabel}
                </a>
              </div>
              <iframe
                title={`${listing.companyName} on the map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress.replace(/\n/g, ", "))}&output=embed`}
                className="h-96 w-full rounded-md border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </CardBody>
          </Card>
        )}
        {listing.operatingHours && (
          <Card>
            <CardHeader className="gap-2">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <Clock className="h-4 w-4 text-slate-400" />
                {t.hoursHeading}
              </CardTitle>
              {listing.timezone &&
                (() => {
                  const openNow = isOpenNow(listing.operatingHours, listing.timezone);
                  if (openNow === null) return null;
                  return (
                    <Badge
                      className={
                        openNow
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400"
                      }
                    >
                      {openNow ? t.hoursOpenNowBadge : t.hoursClosedNowBadge}
                    </Badge>
                  );
                })()}
            </CardHeader>
            <CardBody>
              <div className="overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800">
                <table className="w-full text-base">
                  <tbody>
                    {buildHoursRows(listing.operatingHours, t, listing.timezone).map((row) => (
                      <tr
                        key={row.day}
                        className={cn(
                          "border-b border-slate-200 last:border-b-0 dark:border-neutral-800",
                          row.isToday && "bg-led-soft dark:bg-led-soft-dark",
                        )}
                      >
                        <td
                          className={cn(
                            "px-3 py-2 font-semibold text-slate-700 dark:text-slate-300",
                            row.isToday && "text-petrol-ink dark:text-petrol-light",
                          )}
                        >
                          {row.label}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-slate-600 dark:text-slate-300",
                            row.isToday && "font-semibold text-petrol-ink dark:text-petrol-light",
                          )}
                        >
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
      {branches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-base">
              <Building2 className="h-4 w-4 text-slate-400" />
              {t.branchesHeading}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {branches.map((branch) => (
                <li key={branch.slug} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={directoryListingVisitPath(resolved, branch.slug)}
                    className="font-medium text-slate-800 hover:text-petrol hover:underline dark:text-slate-200 dark:hover:text-petrol-light"
                  >
                    {branch.companyName}
                  </Link>
                  {branch.address && (
                    <p className="mt-0.5 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-pre-wrap">{branch.address}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
