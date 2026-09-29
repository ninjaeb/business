import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STAR_COUNT = 5;

// A 5-star visual for a 0-5 rating (currently only ever a listing's Google
// rating — see PartnerListing.googleRating in prisma/schema.prisma). Each
// star fills to the exact fraction of `rating` it covers — a 4.3 renders
// four full stars and one 30%-filled, not rounded to the nearest whole or
// half star — via an empty outline star with a full amber one clipped on
// top to that fraction's width, same "two overlaid icons" technique most
// partial-star ratings use since there's no native partial-fill on an SVG
// icon otherwise. Purely decorative (aria-hidden) — the caller is
// responsible for a visible or aria-label numeric rating alongside it, the
// same way GoogleRatingBadge and ListingCard both already show the plain
// number next to this.
export function StarRating({ rating, size = "h-4 w-4", className }: { rating: number; size?: string; className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)} aria-hidden="true">
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span key={index} className="relative inline-block">
            <Star className={cn(size, "text-slate-300 dark:text-neutral-600")} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn(size, "fill-amber-400 text-amber-400")} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
