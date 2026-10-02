"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { DIRECTORY_PUBLISHER } from "@/lib/directory-seo";
import { whatsAppUrl } from "@/lib/format";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";
import { ExternalLink } from "@/components/ui/external-link";

// Every static top-level page under /[locale]/... (see the folders directly
// inside src/app/[locale]/) — anything NOT in this list is a listing's own
// slug (directoryListingPath) or one of its subpages (photos, testimonials,
// products-services, ...), which already renders its own fixed bottom bar
// (the Services/Get in touch jump bar) and RecommendBar pinned above it —
// see DirectoryChrome footer's own comment on that pb-40. A third floating
// button stacked on top of those would collide with the jump bar and crowd
// an already-busy corner, so this button hides itself there instead of
// trying to coexist with them. Deliberately an allowlist, not a denylist of
// known listing subpaths: a new static page added here later and forgotten
// in this list just hides the button on it (safe), where the reverse
// mistake would silently collide with a listing page's own bars.
const STATIC_TOP_LEVEL_SEGMENTS = new Set([
  "about",
  "benefits",
  "business",
  "categories",
  "category",
  "contact",
  "directory",
  "editorial-policy",
  "guides",
  "industries",
  "industry",
  "location",
  "locations",
  "news",
  "privacy",
  "products",
  "signup",
  "terms",
]);

// gotka.com's own real footer (see DirectoryChrome) has a floating
// WhatsApp/Message-us pair in the bottom-right corner — this is the
// WhatsApp half, reusing the same real contact number the Contact page and
// Organization JSON-LD already publish (DIRECTORY_PUBLISHER). There's no
// "Message us" counterpart: that button on gotka.com opens a live-chat
// widget this app has no backend for, so adding a lookalike button that
// goes nowhere would be worse than not having it.
export function FloatingWhatsAppButton({ locale }: { locale: DirectoryLocale }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] is the locale itself (en/zh/ms) for every directory page;
  // anything outside that tree (e.g. /business-portal/login) has no
  // competing fixed bottom bar either, so it falls through to "show".
  const isDirectoryPage = segments[0] === locale;
  const isListingPage = isDirectoryPage && segments.length > 1 && !STATIC_TOP_LEVEL_SEGMENTS.has(segments[1]);
  if (isListingPage) return null;

  const t = DIRECTORY_STRINGS[locale];
  return (
    <ExternalLink
      href={whatsAppUrl(DIRECTORY_PUBLISHER.telephone, t.footerWhatsAppMessage)}
      className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-led px-5 py-3 font-semibold text-led-ink shadow-lg transition-colors hover:bg-led-hover active:bg-led-active"
    >
      <MessageCircle className="h-5 w-5" />
      {t.footerWhatsAppCta}
    </ExternalLink>
  );
}
