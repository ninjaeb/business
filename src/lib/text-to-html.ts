// Converts plain text into a minimal, safe HTML email body: escape it so no
// tag in the text can be interpreted as markup, then turn newlines into
// <br> so paragraph/line breaks the text already has are preserved.
//
// A fresh, tiny reimplementation, not a port — the source CRM's textToHtml
// lives in src/lib/email.ts, a 1000+-line file that also pulls in IMAP-sync
// npm packages this app has no use for.
const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export function textToHtml(text: string): string {
  return escapeHtml(text).replace(/\r\n|\r|\n/g, "<br>");
}
