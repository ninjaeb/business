import type { DirectoryLocale } from "@/lib/directory-i18n";
import { DIRECTORY_PUBLISHER } from "@/lib/directory-seo";

// Privacy Policy and Terms of Service (src/app/[locale]/privacy,
// src/app/[locale]/terms) — unlike every other public page's own *-copy.ts
// file, this one is deliberately NOT translated into zh/ms: these are legal
// documents, and a plausible-sounding but imprecise machine translation of
// one is worse than no translation at all (a visitor relying on it could be
// misled about what it actually says, and a mistranslated legal term is a
// much bigger liability than a mistranslated marketing sentence). Every
// locale route still exists and renders the same English text, with a
// translated notice (LOCALE_ONLY_NOTICE below) explaining why, rather than
// a 404 or a silently-English page with no explanation. draftNotice makes
// explicit, in the page itself, that this is a working draft compiled from
// what this codebase actually does (the data this app collects and why —
// see each section's own comment) and has not been reviewed by a lawyer;
// swap it out once real counsel-reviewed text exists.
export type DirectoryLegalSection = { heading: string; body: string[] };

export type DirectoryLegalCopy = {
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  effectiveDate: string;
  draftNotice: string;
  sections: DirectoryLegalSection[];
};

export const LOCALE_ONLY_NOTICE: Record<DirectoryLocale, string | null> = {
  en: null,
  zh: "本页面目前仅提供英文版本。如本页面与任何翻译版本之间有任何出入，概以英文版本为准。",
  ms: "Halaman ini pada masa ini hanya tersedia dalam Bahasa Inggeris. Sekiranya terdapat percanggahan antara halaman ini dengan mana-mana versi terjemahan, versi Bahasa Inggeris akan diguna pakai.",
};

const EFFECTIVE_DATE = "27 September 2026";

const DRAFT_NOTICE =
  "This is a working draft, describing what this site actually collects and how it's actually used — it has not yet been reviewed by a lawyer and should not be relied on as final legal advice. Contact us (see our Contact page) with any questions.";

export const DIRECTORY_PRIVACY_COPY: DirectoryLegalCopy = {
  seoTitle: "Privacy Policy",
  seoDescription: "How the Gotka Business Directory collects, uses, and protects personal data.",
  heroTitle: "Privacy Policy",
  heroSubtitle: `How ${DIRECTORY_PUBLISHER.name} collects, uses, and protects personal data on the Gotka Business Directory.`,
  effectiveDate: EFFECTIVE_DATE,
  draftNotice: DRAFT_NOTICE,
  sections: [
    {
      heading: "Who this policy covers",
      body: [
        `This policy applies to the Gotka Business Directory, published and operated by ${DIRECTORY_PUBLISHER.name} ("we", "us"). It covers visitors browsing the directory, business owners with a partner account, and anyone who submits an inquiry through a listing's "Get in touch" form.`,
      ],
    },
    {
      heading: "What we collect",
      body: [
        "From a visitor: nothing beyond what your browser sends automatically (see \"Cookies\" below) unless you submit a form.",
        "From an inquiry form: the name, email, phone number, and message you provide, plus which listing you sent it to and, if you followed a referral link, which partner referred you.",
        "From a business partner account: your name, email, phone number, company name, and the content of your business listing (which is public once published).",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "An inquiry you submit through a listing is sent to that business so they can respond to you directly — not used by us for any other purpose.",
        "Partner account data is used to operate your account and listing, and to contact you about them.",
        "We use Google Analytics to understand aggregate traffic to the directory (e.g. which pages are visited, in what volume). This is configured only when a measurement ID is set, and does not include the contents of any form you submit.",
      ],
    },
    {
      heading: "Cookies",
      body: [
        "business_session: keeps you signed in to a partner or admin account. Set only once you sign in.",
        "directory_locale: remembers which of the site's three languages you last viewed.",
        "A theme preference (light/dark), stored locally in your browser.",
      ],
    },
    {
      heading: "Sharing",
      body: [
        "We don't sell personal data. An inquiry's contents go to the business you addressed it to. We may disclose data if required by law.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can ask us to access, correct, or delete personal data we hold about you by contacting us (see our Contact page). A business partner can also update or delete most of their own account and listing data directly from their business portal.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: ["We may update this policy as the site changes. The effective date above reflects the most recent update."],
    },
  ],
};

export const DIRECTORY_TERMS_COPY: DirectoryLegalCopy = {
  seoTitle: "Terms of Service",
  seoDescription: "The terms that govern use of the Gotka Business Directory.",
  heroTitle: "Terms of Service",
  heroSubtitle: `The terms that govern use of the Gotka Business Directory, published and operated by ${DIRECTORY_PUBLISHER.name}.`,
  effectiveDate: EFFECTIVE_DATE,
  draftNotice: DRAFT_NOTICE,
  sections: [
    {
      heading: "Using the directory",
      body: [
        "The directory is free to browse and free to list a business on. By submitting an inquiry, creating a partner account, or publishing a listing, you agree to these terms.",
      ],
    },
    {
      heading: "Business listings",
      body: [
        "A business owner is responsible for the accuracy of their own listing's content. We review a listing before it first goes live, and again for significant later edits, but publication doesn't make us the author or guarantor of a listing's claims.",
        "We may remove or suspend a listing that we can't verify, that misrepresents the business behind it, or that otherwise violates these terms.",
      ],
    },
    {
      heading: "Inquiries and leads",
      body: [
        "A message you submit through a listing's \"Get in touch\" form is sent directly to that business. We aren't a party to whatever happens after that — any deal, transaction, or dispute is between you and the business.",
      ],
    },
    {
      heading: "Acceptable use",
      body: [
        "Don't use the directory to submit false, abusive, or fraudulent content, to scrape or automatically harvest data at scale, or to attempt to compromise the site's security.",
      ],
    },
    {
      heading: "Disclaimer",
      body: [
        'The directory and its content are provided "as is." We don\'t guarantee that any listing is accurate, complete, or currently in business, and we aren\'t liable for a decision you make based on listing content.',
      ],
    },
    {
      heading: "Changes to these terms",
      body: ["We may update these terms as the site changes. The effective date above reflects the most recent update."],
    },
  ],
};
