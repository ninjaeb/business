import Link from "next/link";

export type AlbumSummary = { name: string; coverSrc: string; coverAlt: string; countLabel: string; href: string };

// A Facebook-style photo album grid — one card per distinct
// DirectoryListingImage.gallery value on this listing (see PhotoLightbox for
// why that's a partner's own free-text label, not a fixed enum), each
// showing its first photo as the cover, its name, and how many photos it
// holds. Rendered on the Photos page instead of a flat/grouped grid once a
// listing has at least one named album — see photos/page.tsx.
export function AlbumGrid({ albums }: { albums: AlbumSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {albums.map((album) => (
        <Link
          key={album.name}
          href={album.href}
          className="group block overflow-hidden rounded-md ring-1 ring-slate-200 transition-colors hover:ring-petrol/40 dark:ring-neutral-800 dark:hover:ring-petrol-light/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images, same reasoning as ListingLogo */}
          <img
            src={album.coverSrc}
            alt={album.coverAlt}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="space-y-0.5 p-2">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{album.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{album.countLabel}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
