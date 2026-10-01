import { Badge } from "@/components/ui/badge";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";
import { cn } from "@/lib/utils";
import type { ListingUpdateEntry } from "@/lib/directory";

// A News/Promotion post's own dateline (see ListingUpdateEntry.postedAt),
// shown next to its title the way a news feed or blog normally dates its
// posts — matches the visiting locale, unlike the post's own English-only
// title/body (posts aren't translated at all — see ListingUpdateEntry's own
// comment in src/lib/directory.ts).
function formatUpdatePostedAt(postedAt: string, locale: DirectoryLocale): string {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${postedAt}T00:00:00`),
  );
}

// A single News/Promotion card — a promotion gets a soft brand-tinted card
// (same bg-led-soft token the Hours table's own "today" row highlight uses)
// rather than relying on its small badge alone to read as the more
// time-sensitive, actionable kind of the two. Shared by the News and
// Promotions pages (src/app/[locale]/[slug]/news/ and .../promotions/) —
// each renders only its own kind, but the card itself doesn't need to know
// that to render correctly.
export function UpdateItem({ update, locale }: { update: ListingUpdateEntry; locale: DirectoryLocale }) {
  const t = DIRECTORY_STRINGS[locale];
  const isPromotion = update.kind === "PROMOTION";
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        isPromotion
          ? "border-led/30 bg-led-soft dark:border-led/20 dark:bg-led-soft-dark"
          : "border-slate-200 dark:border-neutral-800",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            isPromotion ? "bg-led text-led-ink ring-0" : "bg-slate-100 text-slate-600 ring-0 dark:bg-neutral-800 dark:text-slate-300"
          }
        >
          {isPromotion ? t.promotionLabel : t.newsLabel}
        </Badge>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{update.title}</h3>
        {update.postedAt && (
          <time dateTime={update.postedAt} className="text-xs text-slate-400">
            {formatUpdatePostedAt(update.postedAt, locale)}
          </time>
        )}
      </div>
      <div className="mt-1 text-base text-slate-600 dark:text-slate-300">
        {renderMarkdownLite(update.body, undefined, { zoomableImages: true })}
      </div>
    </div>
  );
}
