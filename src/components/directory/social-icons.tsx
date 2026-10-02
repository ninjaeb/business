// Simple single-color glyphs for DIRECTORY_SAME_AS's two profiles (see
// directory-chrome.tsx's footer) — inline SVG, same reasoning as
// google-icon.tsx: lucide-react dropped brand icons, so there's no
// dependency-free way to get these from the icon set already in use.
export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.2-1.5 1.5-1.5h1.6V4.3C15.9 4.2 15 4 14 4c-2.2 0-3.5 1.3-3.5 3.8V10.5H8v3h2.5V21h3Z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 8.5H4.11V20h2.83V8.5ZM5.53 3.5a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3ZM20 20v-6.4c0-3.42-1.83-5.01-4.27-5.01-1.97 0-2.85 1.08-3.34 1.84V8.5H9.56c.04.84 0 11.5 0 11.5h2.83v-6.42c0-.34.02-.68.13-.93.27-.68.9-1.38 1.96-1.38 1.38 0 1.93 1.05 1.93 2.6V20H20Z" />
    </svg>
  );
}
