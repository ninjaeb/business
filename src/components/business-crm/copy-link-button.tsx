"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_TESTIMONIALS_STRINGS } from "@/lib/portal-testimonials-i18n";
import { buttonClasses } from "@/components/ui/button";

// A small "Copy" button for a testimonial request link's own row (see
// /business-portal/testimonial-links) — plain navigator.clipboard, no
// server round trip, since the URL is already fully formed server-side and
// handed in as a prop.
export function CopyLinkButton({ url, locale }: { url: string; locale: DirectoryLocale }) {
  const t = PORTAL_TESTIMONIALS_STRINGS[locale];
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className={buttonClasses("secondary", "sm")}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {t.copiedCta}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {t.copyLinkCta}
        </>
      )}
    </button>
  );
}
