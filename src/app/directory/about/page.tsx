import { permanentRedirect } from "next/navigation";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { directoryAboutPath } from "@/lib/directory-i18n";

// The target for DirectoryChrome's own footer link when it's rendered with
// no locale in context (see its localeProp fallback — business-portal's
// login layout is the one real caller) — same reasoning as
// src/app/directory/benefits/page.tsx, just without that one's "old
// bookmarks" history: /about is a new page, so this exists purely so that
// fallback never 404s, not to catch a URL this page used to live at.
export default async function DirectoryAboutRedirect() {
  const locale = await getDirectoryLocale();
  permanentRedirect(directoryAboutPath(locale));
}
