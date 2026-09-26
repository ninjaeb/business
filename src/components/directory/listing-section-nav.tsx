// A tab-like row of jump links to this listing's own sections (About,
// Services, News & Promotions, etc.) — plain anchors to each section's own
// id (see the Card ids in [slug]/page.tsx), not real show/hide tabs: every
// section still renders (and stays crawlable/scrollable) all the time, this
// just gives a visitor already on the page a fast way to a specific one.
// Server-rendered, like the rest of the header — no active-section
// highlighting, which would need scroll-spy JS this page doesn't otherwise
// need.
export function ListingSectionNav({
  sections,
  navLabel,
}: {
  sections: { href: string; label: string }[];
  navLabel: string;
}) {
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label={navLabel}
      className="mt-4 -mb-4 flex gap-5 overflow-x-auto border-t border-slate-200 pt-0.5 dark:border-neutral-800"
    >
      {sections.map((section) => (
        <a
          key={section.href}
          href={section.href}
          className="shrink-0 whitespace-nowrap border-b-2 border-transparent py-3 text-sm font-medium text-slate-500 transition-colors hover:border-petrol/40 hover:text-petrol-ink dark:text-slate-400 dark:hover:text-petrol-light"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
