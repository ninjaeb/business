import type { AnchorHTMLAttributes } from "react";

// A plain <a target="_blank"> needs rel="noopener noreferrer nofollow"
// re-added by hand at every call site, and it's easy for a new outbound
// link (a partner's website, a Google Maps/WhatsApp deep link, a social
// profile, ...) to go out without it. This makes that the default instead
// of something to remember: anything that leaves the site renders through
// here, not a bare <a>.
export function ExternalLink({
  rel = "noopener noreferrer nofollow",
  target = "_blank",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target={target} rel={rel} {...props} />;
}
