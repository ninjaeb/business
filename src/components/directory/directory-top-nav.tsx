import Link from "next/link";

// A second, always-visible row under the header's logo/language/theme row —
// unlike DirectoryNavMenu's hamburger, these four destinations (browse by
// category, browse by location, latest products, news & promotions) are
// core enough to the directory that they shouldn't be hidden behind a click.
// Plain server-rendered links, no client state: horizontal scroll on narrow
// screens (rather than wrapping or hiding an item) keeps every link visible
// at any width, matching the header row above it.
export function DirectoryTopNav({
  navLabel,
  items,
}: {
  navLabel: string;
  items: { href: string; label: string }[];
}) {
  return (
    <nav
      aria-label={navLabel}
      className="flex gap-4 overflow-x-auto whitespace-nowrap border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:border-neutral-800 dark:text-slate-300 sm:px-8"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 transition-colors hover:text-petrol dark:hover:text-petrol-light"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
