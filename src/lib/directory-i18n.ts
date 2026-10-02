import type { Industry } from "@/generated/prisma/client";
import { BUSINESS_NAV_ITEMS } from "@/lib/business-nav-items";
import { INDUSTRY_LABELS, VIDEO_CATEGORY_LABELS, type VideoCategory } from "@/lib/labels";

// Same three languages as the public /lead form (src/lib/lead-form-i18n.ts)
// but kept as its own copy rather than shared — that file's locale type and
// list are specific to the lead-capture widget's own module state, and this
// one's locale is read server-side from a cookie (see directory-locale.ts)
// rather than localStorage, so the two aren't actually interchangeable.
export type DirectoryLocale = "en" | "zh" | "ms";

export const DIRECTORY_LOCALES: { code: DirectoryLocale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "ms", label: "BM" },
];

// The directory home page's own title, in each language — shared rather
// than kept as a local const in src/app/[locale]/business/page.tsx (where
// it originated) so a "Home" breadcrumb entry elsewhere in the tree (the
// category page, a single listing's own page) names the same page the same
// way instead of drifting into its own wording over time.
export const DIRECTORY_HOME_TITLE_BY_LOCALE: Record<DirectoryLocale, string> = {
  en: "Business Directory",
  zh: "企业目录",
  ms: "Direktori Perniagaan",
};

// Every directory URL carries its language as a leading path segment —
// /en, /zh/some-company, /ms/signup — English included, rather than a
// bare default-locale URL, so all three languages are equally real,
// bookmarkable, crawlable pages (see sitemap-generator.ts) instead of one
// "canonical" version plus query-param/cookie variants. The whole public
// directory sits directly under its locale segment now — no /business or
// /directory word in between (the tree's own folder name, and every old
// link, was /directory, then /business, until each was dropped in turn for
// a friendlier public URL). The signed-in partner portal used to share the
// /business word — it's since moved to its own /business-portal
// (src/app/business-portal/), which isn't locale-prefixed either way, so
// it was never a routing conflict, just a naming one. Every old
// /[locale]/business/* and /directory/* URL, prefixed or not, still
// resolves — see src/app/[locale]/business/, src/app/directory/ and
// src/app/[locale]/directory/ — as a permanent redirect into here, for old
// links/bookmarks/SEO.
export function directoryHomePath(locale: DirectoryLocale): string {
  return `/${locale}`;
}

export function directorySignupPath(locale: DirectoryLocale): string {
  return `/${locale}/signup`;
}

export function directoryBenefitsPath(locale: DirectoryLocale): string {
  return `/${locale}/benefits`;
}

export function directoryAboutPath(locale: DirectoryLocale): string {
  return `/${locale}/about`;
}

export function directoryContactPath(locale: DirectoryLocale): string {
  return `/${locale}/contact`;
}

// Privacy/Terms deliberately stay English-only content (see
// directory-legal-copy.ts's own comment on why), but still get a real path
// under every locale segment — a zh/ms visitor gets the same URL shape as
// every other page, with a translated notice pointing at the English text,
// rather than a bare unprefixed /privacy that would break that convention.
export function directoryPrivacyPath(locale: DirectoryLocale): string {
  return `/${locale}/privacy`;
}

export function directoryTermsPath(locale: DirectoryLocale): string {
  return `/${locale}/terms`;
}

export function directoryEditorialPolicyPath(locale: DirectoryLocale): string {
  return `/${locale}/editorial-policy`;
}

// A listing's own page is just /en/some-company — shorter and friendlier
// to share than every other directory URL, since it's the one visitors
// actually pass around. Lives at src/app/[locale]/[slug], a sibling of
// every static directory folder below (category, location, industry,
// categories, locations, products, news, signup, benefits) rather than
// nested under any of them; Next.js resolves those static folders ahead of
// this dynamic one, so a listing at one of those exact slugs is the one
// tradeoff of dropping the old /business segment — same as a listing
// slugged "business" or "directory" already couldn't reach its own page
// either, back when those were the static siblings doing the same job.
// Every old /[locale]/business/<slug> URL still resolves — see
// src/app/[locale]/business/[slug]/ — as a permanent redirect into here,
// for old links/bookmarks/SEO.
export function directoryListingPath(locale: DirectoryLocale, slug: string): string {
  return `/${locale}/${slug}`;
}

// A listing's own sections, each its own real page/route (see
// src/app/[locale]/[slug]/layout.tsx and its sibling section folders)
// rather than an anchor within the single page they used to be — a
// visitor, a search engine, and an AI crawler can all now link straight
// to (say) just this business's Products & Services instead of the whole
// listing. About has no path of its own: it's what the bare listing URL
// above already shows, same as it always has. Hours has no path of its
// own either — folded into Visit us below, since a "when/where to visit"
// page reads more naturally with both than as two separate one-fact pages.
export function directoryListingServicesPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/products-services`;
}

export function directoryListingPhotosPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/photos`;
}

export function directoryListingVideosPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/videos`;
}

export function directoryListingNewsPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/news`;
}

export function directoryListingPromotionsPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/promotions`;
}

export function directoryListingVisitPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/visit`;
}

export function directoryListingFaqPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/faq`;
}

// Unlike every other section path above, this tab always appears (see
// sectionLinks in layout.tsx) — even a listing with zero testimonials yet
// still needs a reachable page for the write-a-testimonial form itself.
export function directoryListingTestimonialsPath(locale: DirectoryLocale, slug: string): string {
  return `${directoryListingPath(locale, slug)}/testimonials`;
}

// The main top-nav's four destinations (directory-top-nav.tsx) — real
// index/feed pages, distinct from the existing per-category (categoryPath)
// / per-location (locationPath) pages they each link out to.
export function directoryCategoriesIndexPath(locale: DirectoryLocale): string {
  return `/${locale}/categories`;
}

export function directoryLocationsIndexPath(locale: DirectoryLocale): string {
  return `/${locale}/locations`;
}

export function directoryProductsPath(locale: DirectoryLocale): string {
  return `/${locale}/products`;
}

export function directoryNewsPath(locale: DirectoryLocale): string {
  return `/${locale}/news`;
}

export function directoryIndustriesIndexPath(locale: DirectoryLocale): string {
  return `/${locale}/industries`;
}

export function directoryGuidesPath(locale: DirectoryLocale): string {
  return `/${locale}/guides`;
}

export function directoryGuidePath(locale: DirectoryLocale, slug: string): string {
  return `${directoryGuidesPath(locale)}/${slug}`;
}

export const DEFAULT_DIRECTORY_LOCALE: DirectoryLocale = "en";

// Fills in DirectoryStrings.recommendMessage's {business}/{url} tokens —
// see that field's own comment for why this is plain substitution rather
// than a template literal built where the message is used.
export function formatRecommendMessage(template: string, business: string, url: string): string {
  return template.replace("{business}", business).replace("{url}", url);
}

// Fills in DirectoryStrings.contactWhatsAppMessage's {business} token — see
// that field's own comment.
export function formatContactWhatsAppMessage(template: string, business: string): string {
  return template.replace("{business}", business);
}

// Fills in DirectoryStrings.footerCopyright's {year} token — see that
// field's own comment.
export function formatFooterCopyright(template: string, year: number): string {
  return template.replace("{year}", String(year));
}

// Fills in DirectoryStrings.testimonialFormPhotosUploading's {done}/{total}
// tokens — see that field's own comment.
export function formatTestimonialPhotosUploading(template: string, done: number, total: number): string {
  return template.replace("{done}", String(done)).replace("{total}", String(total));
}

// Fills in DirectoryStrings.searchViewAllResults's {query} token — see that
// field's own comment for why this is plain substitution, not a template
// literal built where the message is used.
export function formatSearchViewAllResults(template: string, query: string): string {
  return template.replace("{query}", query);
}

// A listing's view-count line — plural-aware (English needs "1 view" vs
// "N views"), which is exactly why this can't be a plain DIRECTORY_STRINGS
// template string the way recommendMessage above is: it has to branch on
// count, and DIRECTORY_STRINGS itself gets passed whole into "use client"
// components (DirectorySearch) on the home/category/location pages, where a
// function value in that object throws at render ("Functions cannot be
// passed directly to Client Components"). Kept as its own plain function
// instead, called only from server-only contexts — the listing detail page
// directly, and toDirectoryGridListing (src/lib/directory.ts) on behalf of
// every card grid — same reasoning as DirectoryHomeCopy.listingCount, which
// lives outside DIRECTORY_STRINGS for the same reason.
export function formatViewsLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count.toLocaleString()} 次浏览`;
  if (locale === "ms") return `${count.toLocaleString()} paparan`;
  return count === 1 ? "1 view" : `${count.toLocaleString()} views`;
}

// An album's photo count, shown on its cover card in the album grid (see
// AlbumGrid) — plural-aware and kept as its own function for the same
// reason as formatViewsLabel above: it branches on count, and
// DIRECTORY_STRINGS can't hold a function value once it's passed whole into
// a "use client" component.
export function formatPhotoCountLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count.toLocaleString()} 张照片`;
  if (locale === "ms") return `${count.toLocaleString()} foto`;
  return count === 1 ? "1 photo" : `${count.toLocaleString()} photos`;
}

// The Photos page's own meta description for one named album (see
// generateMetadata in photos/page.tsx) — describes exactly what's on that
// page instead of falling back to the whole listing's tagline/About text,
// the way every other section page still does. Kept as its own function
// for the same reason as formatPhotoCountLabel above: it interpolates the
// album and company name, which DIRECTORY_STRINGS can't hold as a function
// once passed whole into a "use client" component.
export function formatAlbumMetaDescription(albumName: string, photoCount: number, companyName: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `查看 ${companyName} 的「${albumName}」相册中的 ${photoCount.toLocaleString()} 张照片。`;
  if (locale === "ms") return `Lihat ${photoCount.toLocaleString()} foto dalam album "${albumName}" oleh ${companyName}.`;
  return `View ${photoCount.toLocaleString()} photo${photoCount === 1 ? "" : "s"} from ${companyName}'s "${albumName}" album.`;
}

export type DirectoryTestimonialFormErrorCode =
  | "body_required"
  | "rating_required"
  | "rate_limited"
  | "listing_not_found"
  | "not_signed_in"
  | "already_submitted"
  // A signed-in business (PARTNER) account trying to review its own listing
  // — see submitDirectoryTestimonial's own comment.
  | "own_listing"
  | "invalid_submission"
  | "generic";

// registerVisitor/registerTestimonialAuthor/loginVisitor in
// src/app/actions/visitor-auth.ts — the account gate in front of
// TestimonialForm (see TestimonialAuthForm).
export type VisitorAuthErrorCode =
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "phone_required"
  | "phone_invalid"
  | "password_length"
  | "password_required"
  // Business-account signup only (see registerTestimonialAuthor) — a user
  // account never shows or requires these two fields.
  | "company_required"
  | "title_required"
  | "email_taken"
  | "invalid_credentials"
  | "rate_limited"
  | "invalid_submission"
  | "generic"
  // "Continue with Google" (see signInVisitorWithGoogle in
  // src/app/actions/visitor-auth.ts) — google_failed/email_unverified match
  // the partner Google flow's own wording; wrong_role is explicit rather
  // than the generic invalid_credentials above, same reasoning as
  // registerOrSignInPartnerWithGoogle's own comment: Google already vouches
  // for this email, so confirming it belongs to a different account type
  // here leaks nothing this visitor doesn't already know.
  | "google_failed"
  | "wrong_role"
  | "email_unverified";

export type DirectoryLeadFormErrorCode =
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "phone_required"
  | "phone_invalid"
  | "message_required"
  | "rate_limited"
  | "listing_not_found"
  | "invalid_submission"
  | "generic";

export type DirectoryDayLabels = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

export type DirectoryStrings = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  // The header's own always-present search box (directory-chrome.tsx /
  // header-search.tsx) — shorter than searchPlaceholder above, which fills
  // the whole width of the home page's big hero search instead.
  headerSearchPlaceholder: string;
  // The header search dropdown's three result groups — Business, then
  // servicesHeading/updatesHeading below reused as the other two group
  // headings rather than duplicating near-identical strings.
  searchSectionBusiness: string;
  searchNoResults: string;
  // The dropdown's "see all results" link, {query} replaced with what was
  // typed — see formatSearchViewAllResults below (plain string
  // substitution, not a template literal, since this is localized data).
  searchViewAllResults: string;
  // A category page's "see other categories" links, below its results —
  // the only way to reach a sibling category without going back to the
  // directory home (see category-page-content.tsx).
  otherCategoriesHeading: string;
  // Same idea, for a location page's sibling states (see
  // location-page-content.tsx).
  otherLocationsHeading: string;
  // Same idea, for an industry page's sibling industries (see
  // industry-page-content.tsx).
  otherIndustriesHeading: string;
  noResultsTitle: string;
  noResultsDescription: string;
  viewListing: string;
  servicesHeading: string;
  // The new top nav bar (directory-top-nav.tsx) and the index/feed pages
  // it links to — All Business (categories index), Location (locations
  // index), Latest Products. The fourth item, News & Promotions, reuses
  // updatesHeading/newsLabel/promotionLabel below rather than duplicating
  // near-identical strings.
  topNavLabel: string;
  navAllBusiness: string;
  navLocations: string;
  navLatestProducts: string;
  navIndustries: string;
  navGuides: string;
  categoriesIndexHeading: string;
  categoriesIndexDescription: string;
  categoriesIndexEmptyTitle: string;
  categoriesIndexEmptyDescription: string;
  industriesIndexHeading: string;
  industriesIndexDescription: string;
  industriesIndexEmptyTitle: string;
  industriesIndexEmptyDescription: string;
  locationsIndexHeading: string;
  locationsIndexDescription: string;
  locationsIndexEmptyTitle: string;
  locationsIndexEmptyDescription: string;
  latestProductsHeading: string;
  latestProductsDescription: string;
  latestProductsEmptyTitle: string;
  latestProductsEmptyDescription: string;
  // The /news feed's own subheading/empty state — its H1 reuses
  // updatesHeading itself (the listing page's own "News & Promotions" card
  // title), since this page is exactly that content aggregated site-wide.
  newsFeedDescription: string;
  newsFeedEmptyTitle: string;
  newsFeedEmptyDescription: string;
  // The /guides index and each guide's own detail page (src/app/[locale]/
  // guides) — admin-authored pillar content, unlike every other nav
  // destination above which is generated straight from listing data.
  guidesIndexHeading: string;
  guidesIndexDescription: string;
  guidesIndexEmptyTitle: string;
  guidesIndexEmptyDescription: string;
  guidePublishedOnLabel: string;
  // Shown alongside guidePublishedOnLabel only when a guide's updatedAt is
  // meaningfully later than its publishedAt (see GuideDetailContent) — the
  // visible counterpart to buildGuideJsonLd's own dateModified, so a
  // revised guide gives the same freshness signal to a reader that it
  // already gives a crawler.
  guideUpdatedOnLabel: string;
  // A visible counterpart to buildGuideJsonLd's own organization-level
  // author/publisher — the same "attributed to the team, not an invented
  // personal byline" choice, just readable on the page itself rather than
  // only in structured data. Links to /about, which spells out who that
  // team is and how a guide's own content gets reviewed.
  guideByLabel: string;
  guideReadMoreLabel: string;
  guideRelatedHeading: string;
  // Heading above a guide's own FAQ accordion (see GuideDetailContent) —
  // only rendered when that guide actually has faqs set.
  guideFaqHeading: string;
  // Heading above the Guides index page's own grid of everything past the
  // first three featured guides (see GuidesIndexContent) — only rendered
  // once there are more than three published guides to show there.
  guidesLatestHeading: string;
  // The listing page's two "other businesses" sections — newest published
  // listings overall, and other listings in the same state but a different
  // industry (see latestListings/nearbyListingsExcludingIndustry in
  // src/lib/directory.ts). Deliberately not grouped by this listing's own
  // category/industry, unlike the section these replaced.
  latestBusinessesHeading: string;
  nearbyBusinessesHeading: string;
  aboutHeading: string;
  // The section wrapping Video and Photos together (see VideoGallery's own
  // placement in [locale]/[slug]/page.tsx) — videoHeading/photosHeading
  // still exist as the two sub-headings shown when a listing has both.
  mediaHeading: string;
  videoHeading: string;
  // A persistent escape hatch inside the video lightbox, alongside the
  // embedded iframe — not a fallback shown only when the embed fails (an
  // embed failing, like YouTube's "Sign in to confirm you're not a bot"
  // gate some visitors' networks trigger, isn't detectable from a
  // cross-origin iframe), so a visitor whose embed doesn't play always has
  // a working way to actually watch it. A "{provider}" token gets replaced
  // with the actual brand name (VIDEO_PROVIDER_DISPLAY_NAMES in
  // lib/directory.ts, never itself translated) — its own word order in the
  // phrase is written to read naturally in this language, which isn't the
  // same order in every locale (contrast "Watch on {provider}" with
  // Chinese's "在{provider}观看", verb last).
  watchOnProviderLabel: string;
  photosHeading: string;
  // The Photos page's own album-grid view (see AlbumGrid) — the link back
  // out of one album's own photos, and the fallback heading over any photos
  // that aren't in a named album (see DirectoryListingImage.gallery), shown
  // beneath the album grid rather than left unreachable.
  backToAlbumsLabel: string;
  otherPhotosLabel: string;
  updatesHeading: string;
  newsLabel: string;
  promotionLabel: string;
  // The Promotions page's own heading (English pluralizes; newsLabel above
  // doubles as the News page's heading unchanged, since "News" is already
  // the same word singular or plural).
  promotionsHeading: string;
  faqHeading: string;
  testimonialsHeading: string;
  visitHeading: string;
  // Other locations of the same business, linked from the partner side —
  // only shown on the Visit us page when at least one exists.
  branchesHeading: string;
  hoursHeading: string;
  hoursOpenLabel: string;
  hoursOpenTodayLabel: string;
  hoursClosedLabel: string;
  hoursClosedTodayLabel: string;
  // The small badge next to the Hours heading itself — isOpenNow's
  // right-now verdict, distinct from hoursOpenTodayLabel/hoursClosedTodayLabel
  // above (those label a whole day's row in the table; this is a single
  // point-in-time status). Only rendered when the listing has a timezone
  // set, since isOpenNow can't tell without one.
  hoursOpenNowBadge: string;
  hoursClosedNowBadge: string;
  // The Visit us page's turn-by-turn directions buttons — "Google Maps" and
  // "Waze" are brand names left untranslated, same as elsewhere in this file.
  navigateGoogleMapsLabel: string;
  navigateWazeLabel: string;
  dayLabels: DirectoryDayLabels;
  websiteLabel: string;
  locationLabel: string;
  // aria-label on the header's Google rating badge (see PartnerListing.
  // googleRating's own comment in prisma/schema.prisma) — the visible text
  // is just the number/star/review count, universal enough to skip
  // translation, but a screen reader still needs "Google rating" spelled
  // out rather than reading a bare "4.6 (128)".
  googleRatingLabel: string;
  // The listing page's "Recommend" affordances, open to every visitor —
  // the header button, and the sticky bottom-bar button (see the listing
  // layout's own nav). Both share one referral-tracking link (?r=<referral
  // code>, see recommendUrl) and this same pre-written message for the
  // email/WhatsApp/native-share options (Copy link still copies that same
  // tracking link). {business} and {url} are replaced with the listing's
  // name and the tracking link itself — plain string substitution, not a
  // template literal, since this is localized data, not code.
  recommendLabel: string;
  recommendMessage: string;
  // The header's plain Share button — ShareButton's own `label` prop
  // defaults to unlocalized English "Share", so every caller that isn't
  // fine with that (this one included) passes this instead.
  shareLabel: string;
  contactHeading: string;
  contactSubheading: string;
  // The "Get in touch" card's Call/WhatsApp buttons — only rendered when the
  // listing has its own PartnerListing.phone set (see that field's own
  // comment for why it's separate from the account-level User.phone that's
  // deliberately never shown). contactWhatsAppMessage's {business} token is
  // filled in with the listing's own name via formatContactWhatsAppMessage
  // below, same plain-substitution convention as recommendMessage.
  contactCallCta: string;
  contactWhatsAppCta: string;
  contactWhatsAppMessage: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formPhoneHint: string;
  formCompanyLabel: string;
  formCompanyPlaceholder: string;
  formMessageLabel: string;
  formMessagePlaceholder: string;
  formSubmit: string;
  formSubmitting: string;
  formSuccess: string;
  errors: Record<DirectoryLeadFormErrorCode, string>;
  // The Testimonials page (see src/app/[locale]/[slug]/testimonials/page.tsx
  // and TestimonialForm) — testimonialsIntro/testimonialsEmpty describe the
  // page itself; the rest is the write-a-testimonial form below it.
  testimonialsIntro: string;
  testimonialsEmpty: string;
  // Sits right above the page's own "Write a testimonial" button —
  // testimonialsEmpty above only shows once there are zero APPROVED
  // testimonials, so this is what invites one regardless of whether any
  // exist yet.
  testimonialsCta: string;
  // The account gate in front of the form below (see TestimonialAuthForm) —
  // name/email/phone/password field labels are the existing signup* keys
  // above, reused as-is rather than duplicated, since the copy is identical
  // ("Name", "Email", "Phone", "Password").
  testimonialAuthHeading: string;
  testimonialAuthIntro: string;
  // Both optional — a visitor's employer/role, shown alongside their name on
  // the testimonial for credibility (same User.companyName/title columns a
  // PARTNER profile already has). Separate from signupCompanyLabel above:
  // that one means "the business you're registering", which reads wrong
  // here, where it means "who you work for" instead.
  testimonialCompanyLabel: string;
  testimonialCompanyPlaceholder: string;
  testimonialPositionLabel: string;
  testimonialPositionPlaceholder: string;
  testimonialSignupTab: string;
  testimonialLoginTab: string;
  // The account-type toggle shown only on the Create-account side (see
  // TestimonialAuthForm) — picking "Business account" is what makes
  // testimonialCompanyLabel/testimonialPositionLabel below required instead
  // of optional, and creates a real PARTNER account (the same account type
  // business-portal login uses) rather than a VISITOR one.
  testimonialAccountTypeUser: string;
  testimonialAccountTypeBusiness: string;
  testimonialLoginSubmit: string;
  testimonialLoginSubmitting: string;
  testimonialSwitchToLogin: string;
  testimonialSwitchToSignup: string;
  testimonialAuthErrors: Record<VisitorAuthErrorCode, string>;
  // Shown instead of the form once a signed-in visitor already has a
  // testimonial on this listing (see the @@unique([listingId, authorId])
  // constraint on DirectoryTestimonial) — testimonialAlreadySubmittedNote is
  // only shown for a REJECTED one, alongside its own reviewNote text.
  testimonialAlreadySubmittedTitle: string;
  testimonialAlreadySubmittedPending: string;
  testimonialAlreadySubmittedApproved: string;
  testimonialAlreadySubmittedRejected: string;
  // "Posting as {name}" above the form fields, plus a log-out link right
  // next to it — both plain prefix/label text, the name/link itself
  // rendered separately (no {token} to fill in, unlike e.g.
  // contactWhatsAppMessage).
  testimonialLoggedInAs: string;
  testimonialLogout: string;
  testimonialFormHeading: string;
  testimonialFormRatingLabel: string;
  testimonialFormBodyLabel: string;
  testimonialFormBodyPlaceholder: string;
  // A short writing guide for a visitor staring at a blank textarea — three
  // prompts (Impact/Experience/Verdict), each a bold label plus its own
  // question, shown as a small box above the field.
  testimonialFormGuideHeading: string;
  testimonialFormGuideImpactLabel: string;
  testimonialFormGuideImpactQuestion: string;
  testimonialFormGuideExperienceLabel: string;
  testimonialFormGuideExperienceQuestion: string;
  testimonialFormGuideVerdictLabel: string;
  testimonialFormGuideVerdictQuestion: string;
  // The optional photo picker under the body field (see uploadTestimonialPhoto
  // in src/app/actions/testimonials.ts) — testimonialFormPhotosUploading has
  // a {done}/{total} token, filled in via formatTestimonialPhotosUploading.
  testimonialFormPhotosLabel: string;
  testimonialFormPhotosCta: string;
  testimonialFormPhotosUploading: string;
  testimonialFormPhotosTooMany: string;
  // "Rewrite with AI" button on the testimonial body — only shown when
  // isAiConfigured() (see rewriteTestimonialWithAi in
  // src/app/actions/testimonials.ts), same gating as every other AI-assist
  // button in the partner editor, just on a public, unauthenticated form
  // this time. testimonialFormRewriteDescription explains what it actually
  // does (tightens wording, doesn't invent content) to a first-time visitor
  // who's never seen this app's other AI-assist buttons before.
  testimonialFormRewriteCta: string;
  testimonialFormRewriteDescription: string;
  testimonialFormRewriting: string;
  testimonialFormSubmit: string;
  testimonialFormSubmitting: string;
  testimonialFormSuccess: string;
  // Shown after a successful submission, only when the listing has a
  // googleReviewUrl set — copies the just-submitted text to the clipboard
  // and opens that link, same "copy + open" pattern as the partner side's
  // own "Post to Google" (see postToGoogle in updates-editor.tsx).
  testimonialGoogleCta: string;
  testimonialGoogleCopied: string;
  testimonialErrors: Record<DirectoryTestimonialFormErrorCode, string>;
  // The header's "Skip to main content" link (see DirectoryChrome) — visible
  // only once focused (first Tab stop on the page), so a keyboard/screen
  // reader visitor can jump past the header's nav links straight to the
  // page's own content instead of tabbing through all of them first.
  skipToContentLabel: string;
  stickyNavLabel: string;
  // aria-label for the header's own jump-to-section tab strip (see
  // ListingSectionNav) — same "read by assistive tech, not shown as text"
  // role as breadcrumbNavLabel below.
  sectionNavLabel: string;
  // aria-label for the visible breadcrumb trail (see
  // directory-breadcrumbs.tsx) — read by assistive tech, not shown as text.
  breadcrumbNavLabel: string;
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundBackCta: string;
  footerTagline: string;
  // The footer's own column headings and WhatsApp CTA — see
  // DirectoryChrome's footer, redesigned to match gotka.com's own real
  // footer (dark background, logo/tagline/social column + grouped link
  // columns + a floating "WhatsApp us" button, all reusing
  // DIRECTORY_PUBLISHER/DIRECTORY_SAME_AS, the same real contact details
  // the Contact page and Organization JSON-LD already use).
  footerDirectoryHeading: string;
  footerExploreHeading: string;
  footerLegalHeading: string;
  footerContactHeading: string;
  footerWhatsAppCta: string;
  footerWhatsAppMessage: string;
  // {year} token, filled by formatFooterCopyright below.
  footerCopyright: string;
  backToDirectory: string;
  brandName: string;
  navLoginRegister: string;
  navMyBusiness: string;
  navAddBusiness: string;
  navPartnership: string;
  navGoToCrm: string;
  navSignOut: string;
  // The business-portal's own page names (BUSINESS_NAV_ITEMS, keyed by
  // href below) — the portal itself is English-only by design (see
  // src/app/layout.tsx), but this same list also renders inside the
  // trilingual directory's own hamburger menu (see localizedBusinessNavItems
  // below and DirectoryNavMenu), where it needs to match whatever language
  // the rest of that menu is already in.
  navDashboard: string;
  navMyListings: string;
  navBusinessLeads: string;
  navCompanies: string;
  navContacts: string;
  navDeals: string;
  navTasks: string;
  navProfile: string;
  listBusinessCta: string;
  benefitsNavLabel: string;
  aboutNavLabel: string;
  contactNavLabel: string;
  privacyNavLabel: string;
  termsNavLabel: string;
  editorialPolicyNavLabel: string;
  signupHeading: string;
  signupSubheading: string;
  signupCompanyLabel: string;
  signupCompanyPlaceholder: string;
  signupNameLabel: string;
  signupNamePlaceholder: string;
  signupEmailLabel: string;
  signupEmailPlaceholder: string;
  signupPhoneLabel: string;
  signupPhonePlaceholder: string;
  signupPhoneHint: string;
  signupPasswordLabel: string;
  signupPasswordHint: string;
  signupSubmit: string;
  signupSubmitting: string;
  signupOrDivider: string;
  signupGoogleCta: string;
  signupAlreadyPartner: string;
  signupSignInLink: string;
  signupErrors: Record<PartnerSignupErrorCode, string>;
};

export type PartnerSignupErrorCode =
  | "company_required"
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "phone_invalid"
  | "password_length"
  | "email_taken"
  | "rate_limited"
  | "invalid_submission"
  | "generic"
  | "google_failed"
  | "google_unavailable"
  | "email_unverified"
  | "wrong_role";

export const DIRECTORY_STRINGS: Record<DirectoryLocale, DirectoryStrings> = {
  en: {
    heroEyebrow: "Trusted Local Businesses",
    heroTitle: "Find the right business for your project",
    heroSubtitle: "Browse trusted businesses and reach out directly.",
    searchPlaceholder: "Search by company, service, industry or category…",
    headerSearchPlaceholder: "Search businesses, products, news…",
    searchSectionBusiness: "Business",
    searchNoResults: "No results found",
    searchViewAllResults: "See all results for “{query}”",
    otherCategoriesHeading: "Browse other categories",
    otherLocationsHeading: "Browse other locations",
    otherIndustriesHeading: "Browse other industries",
    noResultsTitle: "No businesses found",
    noResultsDescription: "Try a different search or industry filter.",
    viewListing: "View details",
    servicesHeading: "Products & Services",
    topNavLabel: "Browse",
    navAllBusiness: "All Business",
    navLocations: "Location",
    navLatestProducts: "Latest Products",
    navIndustries: "Industries",
    navGuides: "Guides",
    categoriesIndexHeading: "All Business Categories",
    categoriesIndexDescription: "Every category in the Gotka Business Directory, with how many businesses are listed in each.",
    categoriesIndexEmptyTitle: "No categories yet",
    categoriesIndexEmptyDescription: "Check back soon — categories will appear here.",
    industriesIndexHeading: "All Industries",
    industriesIndexDescription: "Every industry in the Gotka Business Directory, with how many businesses are listed in each.",
    industriesIndexEmptyTitle: "No industries yet",
    industriesIndexEmptyDescription: "Check back soon — industries will appear here.",
    locationsIndexHeading: "All Locations",
    locationsIndexDescription: "Every state and region with a business listed in the Gotka Business Directory.",
    locationsIndexEmptyTitle: "No locations yet",
    locationsIndexEmptyDescription: "Check back soon — locations will appear here as businesses join the directory.",
    latestProductsHeading: "Latest Products & Services",
    latestProductsDescription: "Recently added products and services from businesses across the directory.",
    latestProductsEmptyTitle: "No products yet",
    latestProductsEmptyDescription: "Check back soon — businesses are adding their products and services.",
    newsFeedDescription: "Current news and promotions from businesses across the directory.",
    newsFeedEmptyTitle: "No news or promotions yet",
    newsFeedEmptyDescription: "Check back soon for updates from businesses in the directory.",
    guidesIndexHeading: "Guides",
    guidesIndexDescription: "In-depth guides to help you choose and compare businesses in the Gotka network.",
    guidesIndexEmptyTitle: "No guides yet",
    guidesIndexEmptyDescription: "Check back soon — guides will appear here.",
    guidePublishedOnLabel: "Published",
    guideUpdatedOnLabel: "Updated",
    guideByLabel: "By the Gotka Business Directory team",
    guideReadMoreLabel: "Read guide",
    guideRelatedHeading: "Related guides",
    guideFaqHeading: "Frequently asked questions",
    guidesLatestHeading: "More guides",
    latestBusinessesHeading: "Latest Businesses",
    nearbyBusinessesHeading: "Businesses Near You",
    aboutHeading: "About",
    mediaHeading: "Photo and Video",
    videoHeading: "Videos",
    watchOnProviderLabel: "Watch on {provider}",
    photosHeading: "Photos",
    backToAlbumsLabel: "Back to albums",
    otherPhotosLabel: "Other photos",
    updatesHeading: "News & Promotions",
    newsLabel: "News",
    promotionLabel: "Promotion",
    promotionsHeading: "Promotions",
    faqHeading: "FAQ",
    testimonialsHeading: "Testimonials",
    visitHeading: "Visit us",
    branchesHeading: "Other locations",
    hoursHeading: "Hours",
    hoursOpenLabel: "Open",
    hoursOpenTodayLabel: "Open today",
    hoursClosedLabel: "Closed",
    hoursClosedTodayLabel: "Closed today",
    hoursOpenNowBadge: "Open now",
    hoursClosedNowBadge: "Closed now",
    navigateGoogleMapsLabel: "Navigate with Google Maps",
    navigateWazeLabel: "Navigate with Waze",
    dayLabels: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    websiteLabel: "Website",
    locationLabel: "Location",
    googleRatingLabel: "Google rating",
    recommendLabel: "Recommend Business",
    recommendMessage: "I recommend {business} — check them out on the Business Directory: {url}",
    shareLabel: "Share Business",
    contactHeading: "Get in touch",
    contactSubheading: "Send a message directly to this business — they'll reply to the email address and contact number you provide.",
    contactCallCta: "Call",
    contactWhatsAppCta: "WhatsApp",
    contactWhatsAppMessage: "Sending from Gotka Business Directory. Hi, I'm interested in {business}. Could you share more details?",
    formNameLabel: "Name",
    formNamePlaceholder: "Jane Smith",
    formEmailLabel: "Email",
    formEmailPlaceholder: "jane@company.com",
    formPhoneLabel: "Phone",
    formPhonePlaceholder: "+60 12 345 6789",
    formPhoneHint: "Include the country code with a + sign, e.g. +60 12 345 6789.",
    formCompanyLabel: "Company",
    formCompanyPlaceholder: "Optional",
    formMessageLabel: "What do you need help with?",
    formMessagePlaceholder: "Tell us a bit about your project…",
    formSubmit: "Send message",
    formSubmitting: "Sending…",
    formSuccess: "Thanks! Your message has been sent — the business will reply to your email directly.",
    errors: {
      name_required: "Name is required",
      email_required: "Email is required",
      email_invalid: "Enter a valid email",
      phone_required: "Phone number is required",
      phone_invalid: "Include the country code with a + sign, e.g. +60 12 345 6789.",
      message_required: "Tell us a bit about what you need",
      rate_limited: "Too many attempts — please wait a few minutes and try again.",
      listing_not_found: "This listing is no longer available.",
      invalid_submission: "Please check the form and try again.",
      generic: "Something went wrong. Please try again.",
    },
    testimonialsIntro: "Real feedback from customers who've worked with this business.",
    testimonialsEmpty: "No testimonials yet — be the first to leave one.",
    testimonialsCta: "Had a good experience? Share it — it helps other visitors decide, and takes less than a minute.",
    testimonialAuthHeading: "Sign in to write a testimonial",
    testimonialAuthIntro:
      "Sign in with Google, or create a free account with your name, email and phone — takes less than a minute.",
    testimonialCompanyLabel: "Company name",
    testimonialCompanyPlaceholder: "Acme Sdn Bhd",
    testimonialPositionLabel: "Position",
    testimonialPositionPlaceholder: "Marketing Director",
    testimonialSignupTab: "Create account",
    testimonialLoginTab: "Log in",
    testimonialAccountTypeUser: "User account",
    testimonialAccountTypeBusiness: "Business account",
    testimonialLoginSubmit: "Log in",
    testimonialLoginSubmitting: "Logging in…",
    testimonialSwitchToLogin: "Already have an account? Log in",
    testimonialSwitchToSignup: "New here? Create an account",
    testimonialAuthErrors: {
      name_required: "Name is required",
      email_required: "Email is required",
      email_invalid: "Enter a valid email",
      phone_required: "Phone is required",
      phone_invalid: "Enter a valid phone number, e.g. +60 12 345 6789",
      password_length: "Password must be at least 8 characters",
      password_required: "Password is required",
      company_required: "Company name is required",
      title_required: "Position is required",
      email_taken: "That email already has an account — try logging in instead.",
      invalid_credentials: "Incorrect email or password.",
      rate_limited: "Too many attempts — please wait a few minutes and try again.",
      invalid_submission: "Please check the form and try again.",
      generic: "Something went wrong. Please try again.",
      google_failed: "Google sign-in failed. Please try again.",
      wrong_role: "That Google account is already linked to a business account here. Sign in with a different Google account, or use email and password below.",
      email_unverified: "That Google account's email address isn't verified.",
    },
    testimonialAlreadySubmittedTitle: "You've already reviewed this business",
    testimonialAlreadySubmittedPending: "Your testimonial is still awaiting approval from the business.",
    testimonialAlreadySubmittedApproved: "Your testimonial is live on this page — thanks for sharing it.",
    testimonialAlreadySubmittedRejected: "The business didn't approve your testimonial.",
    testimonialLoggedInAs: "Posting as",
    testimonialLogout: "Not you? Log out",
    testimonialFormHeading: "Write a testimonial",
    testimonialFormRatingLabel: "Rating",
    testimonialFormBodyLabel: "Your testimonial",
    testimonialFormBodyPlaceholder: "What was it like working with this business?",
    testimonialFormGuideHeading: "Not sure what to write? Consider:",
    testimonialFormGuideImpactLabel: "The Impact",
    testimonialFormGuideImpactQuestion:
      "What problem did we solve, or what results did you achieve (e.g., saved time, boosted sales, a smooth launch)?",
    testimonialFormGuideExperienceLabel: "The Experience",
    testimonialFormGuideExperienceQuestion: "What stood out most (e.g., speed, communication, technical expertise)?",
    testimonialFormGuideVerdictLabel: "The Verdict",
    testimonialFormGuideVerdictQuestion: "Who would you recommend us to, and why?",
    testimonialFormPhotosLabel: "Photos (optional)",
    testimonialFormPhotosCta: "Add photos",
    testimonialFormPhotosUploading: "Uploading photo {done}/{total}…",
    testimonialFormPhotosTooMany: "Up to 4 photos per testimonial.",
    testimonialFormRewriteCta: "Rewrite with AI",
    testimonialFormRewriteDescription: "Cleans up grammar and wording — keeps what you said, just easier to read.",
    testimonialFormRewriting: "Rewriting…",
    testimonialFormSubmit: "Submit testimonial",
    testimonialFormSubmitting: "Submitting…",
    testimonialFormSuccess: "Thanks! Your testimonial is awaiting approval before it shows publicly.",
    testimonialGoogleCta: "Leave it on Google too",
    testimonialGoogleCopied: "Copied — paste it into the review box that just opened.",
    testimonialErrors: {
      body_required: "Write a few words about your experience",
      rating_required: "Please select a rating",
      rate_limited: "Too many attempts — please wait a few minutes and try again.",
      listing_not_found: "This listing is no longer available.",
      not_signed_in: "Sign in first, then write your testimonial.",
      already_submitted: "You've already reviewed this business.",
      own_listing: "You can't write a testimonial for your own business.",
      invalid_submission: "Please check the form and try again.",
      generic: "Something went wrong. Please try again.",
    },
    skipToContentLabel: "Skip to main content",
    stickyNavLabel: "Quick links",
    sectionNavLabel: "Page sections",
    breadcrumbNavLabel: "Breadcrumb",
    notFoundTitle: "This page isn't in the directory",
    notFoundDescription:
      "The business or category you're looking for may have moved, been unpublished, or never existed. Check the link, or browse the directory from the start.",
    notFoundBackCta: "Browse the directory",
    footerTagline: "A directory of trusted businesses in the Gotka network.",
    footerDirectoryHeading: "Directory",
    footerExploreHeading: "Explore",
    footerLegalHeading: "Legal",
    footerContactHeading: "Talk to us",
    footerWhatsAppCta: "WhatsApp us",
    footerWhatsAppMessage: "Hi, I have a question about the Gotka Business Directory.",
    footerCopyright: "© {year} Gotka Technologies. All rights reserved.",
    backToDirectory: "Back to directory",
    brandName: "Business Directory",
    navLoginRegister: "Business Login",
    navMyBusiness: "My business",
    navAddBusiness: "Add Business",
    navDashboard: "Dashboard",
    navMyListings: "My Business",
    navBusinessLeads: "Business Leads",
    navCompanies: "Companies",
    navContacts: "Contacts",
    navDeals: "Deals",
    navTasks: "Tasks",
    navProfile: "Profile",
    navPartnership: "Partnership",
    navGoToCrm: "Go to CRM",
    navSignOut: "Sign out",
    listBusinessCta: "List your business",
    benefitsNavLabel: "Why list your business",
    aboutNavLabel: "About",
    contactNavLabel: "Contact",
    privacyNavLabel: "Privacy Policy",
    termsNavLabel: "Terms of Service",
    editorialPolicyNavLabel: "Editorial Policy",
    signupHeading: "List your business",
    signupSubheading: "Join the business directory and start receiving inquiries directly from visitors.",
    signupCompanyLabel: "Business name",
    signupCompanyPlaceholder: "Acme Sdn Bhd",
    signupNameLabel: "Your name",
    signupNamePlaceholder: "Jane Smith",
    signupEmailLabel: "Email",
    signupEmailPlaceholder: "jane@company.com",
    signupPhoneLabel: "Phone",
    signupPhonePlaceholder: "+60 12 345 6789",
    signupPhoneHint: "Include the country code with a + sign, e.g. +60 12 345 6789.",
    signupPasswordLabel: "Password",
    signupPasswordHint: "At least 8 characters.",
    signupSubmit: "Create account",
    signupSubmitting: "Creating account…",
    signupOrDivider: "or",
    signupGoogleCta: "Continue with Google",
    signupAlreadyPartner: "Already have an account?",
    signupSignInLink: "Sign in",
    signupErrors: {
      company_required: "Business name is required",
      name_required: "Your name is required",
      email_required: "Email is required",
      email_invalid: "Enter a valid email",
      phone_invalid: "Include the country code with a + sign, e.g. +60 12 345 6789.",
      password_length: "Password must be at least 8 characters",
      email_taken: "An account with that email already exists. Try signing in instead.",
      rate_limited: "Too many attempts — please wait a few minutes and try again.",
      invalid_submission: "Please check the form and try again.",
      generic: "Something went wrong. Please try again.",
      google_failed: "Google sign-in failed. Please try again.",
      google_unavailable: "Google sign-in isn't available right now.",
      email_unverified: "Your Google account's email isn't verified.",
      wrong_role: "That Google account belongs to a staff member. Staff sign in at /system/login.",
    },
  },
  zh: {
    heroEyebrow: "值得信赖的本地企业",
    heroTitle: "为您的项目寻找合适的企业",
    heroSubtitle: "浏览值得信赖的企业，并直接联系他们。",
    searchPlaceholder: "按公司、服务、行业或类别搜索…",
    headerSearchPlaceholder: "搜索企业、产品、新闻…",
    searchSectionBusiness: "企业",
    searchNoResults: "未找到结果",
    searchViewAllResults: "查看“{query}”的所有结果",
    otherCategoriesHeading: "浏览其他类别",
    otherLocationsHeading: "浏览其他地区",
    otherIndustriesHeading: "浏览其他行业",
    noResultsTitle: "未找到企业",
    noResultsDescription: "请尝试其他搜索词或行业筛选。",
    viewListing: "查看详情",
    servicesHeading: "产品与服务",
    topNavLabel: "浏览",
    navAllBusiness: "所有企业",
    navLocations: "地区",
    navLatestProducts: "最新产品",
    navIndustries: "行业",
    navGuides: "指南",
    categoriesIndexHeading: "所有企业类别",
    categoriesIndexDescription: "Gotka 商业目录中的每一个类别，以及各类别下的企业数量。",
    categoriesIndexEmptyTitle: "暂无类别",
    categoriesIndexEmptyDescription: "请稍后再来查看——类别将显示在这里。",
    industriesIndexHeading: "所有行业",
    industriesIndexDescription: "Gotka 商业目录中的每一个行业，以及各行业下的企业数量。",
    industriesIndexEmptyTitle: "暂无行业",
    industriesIndexEmptyDescription: "请稍后再来查看——行业将显示在这里。",
    locationsIndexHeading: "所有地区",
    locationsIndexDescription: "Gotka 商业目录中每个有企业上榜的州属与地区。",
    locationsIndexEmptyTitle: "暂无地区",
    locationsIndexEmptyDescription: "请稍后再来查看——随着企业加入目录，地区将显示在这里。",
    latestProductsHeading: "最新产品与服务",
    latestProductsDescription: "来自目录中各企业最新添加的产品与服务。",
    latestProductsEmptyTitle: "暂无产品",
    latestProductsEmptyDescription: "请稍后再来查看——企业正在添加产品与服务。",
    newsFeedDescription: "来自目录中各企业的最新新闻与促销信息。",
    newsFeedEmptyTitle: "暂无新闻或促销",
    newsFeedEmptyDescription: "请稍后再来查看目录中企业的最新动态。",
    guidesIndexHeading: "指南",
    guidesIndexDescription: "深入指南，助您在 Gotka 网络中选择和比较企业。",
    guidesIndexEmptyTitle: "暂无指南",
    guidesIndexEmptyDescription: "请稍后再来查看——指南将显示在这里。",
    guidePublishedOnLabel: "发布于",
    guideUpdatedOnLabel: "更新于",
    guideByLabel: "作者：Gotka 企业目录团队",
    guideReadMoreLabel: "阅读指南",
    guideRelatedHeading: "相关指南",
    guideFaqHeading: "常见问题",
    guidesLatestHeading: "更多指南",
    latestBusinessesHeading: "最新企业",
    nearbyBusinessesHeading: "附近企业",
    aboutHeading: "关于",
    mediaHeading: "照片与视频",
    videoHeading: "视频",
    watchOnProviderLabel: "在{provider}观看",
    photosHeading: "照片",
    backToAlbumsLabel: "返回相册",
    otherPhotosLabel: "其他照片",
    updatesHeading: "新闻与促销",
    newsLabel: "新闻",
    promotionLabel: "促销",
    promotionsHeading: "促销",
    faqHeading: "常见问题",
    testimonialsHeading: "客户评价",
    visitHeading: "联系地址",
    branchesHeading: "其他分店",
    hoursHeading: "营业时间",
    hoursOpenLabel: "营业",
    hoursOpenTodayLabel: "今日营业",
    hoursClosedLabel: "休息",
    hoursClosedTodayLabel: "今日休息",
    hoursOpenNowBadge: "营业中",
    hoursClosedNowBadge: "已休息",
    navigateGoogleMapsLabel: "使用谷歌地图导航",
    navigateWazeLabel: "使用 Waze 导航",
    dayLabels: {
      monday: "星期一",
      tuesday: "星期二",
      wednesday: "星期三",
      thursday: "星期四",
      friday: "星期五",
      saturday: "星期六",
      sunday: "星期日",
    },
    websiteLabel: "网站",
    recommendLabel: "推荐企业",
    recommendMessage: "我推荐 {business}——快来企业目录看看：{url}",
    shareLabel: "分享企业",
    locationLabel: "地点",
    googleRatingLabel: "Google 评分",
    contactHeading: "联系我们",
    contactSubheading: "直接给这家企业发送信息——他们会回复您提供的电子邮件地址和联系电话。",
    contactCallCta: "致电",
    contactWhatsAppCta: "WhatsApp",
    contactWhatsAppMessage: "发自 Gotka 商业目录。您好，我对 {business} 感兴趣，可以提供更多详情吗？",
    formNameLabel: "姓名",
    formNamePlaceholder: "Jane Smith",
    formEmailLabel: "电子邮件",
    formEmailPlaceholder: "jane@company.com",
    formPhoneLabel: "电话号码",
    formPhonePlaceholder: "+60 12 345 6789",
    formPhoneHint: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
    formCompanyLabel: "公司",
    formCompanyPlaceholder: "选填",
    formMessageLabel: "您需要什么帮助？",
    formMessagePlaceholder: "简单介绍一下您的项目…",
    formSubmit: "发送信息",
    formSubmitting: "发送中…",
    formSuccess: "谢谢！您的信息已发送——该企业会直接回复您的电子邮件。",
    errors: {
      name_required: "请填写姓名",
      email_required: "请填写电子邮件",
      email_invalid: "请输入有效的电子邮件地址",
      phone_required: "请填写电话号码",
      phone_invalid: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
      message_required: "请简单说明您需要的帮助",
      rate_limited: "尝试次数过多，请稍等几分钟后再试。",
      listing_not_found: "该合作伙伴的资料已下架。",
      invalid_submission: "请检查表单内容后重试。",
      generic: "出现错误，请重试。",
    },
    testimonialsIntro: "来自曾与该企业合作的客户的真实反馈。",
    testimonialsEmpty: "暂无评价——成为第一个留下评价的人。",
    testimonialsCta: "有过愉快的体验吗？分享出来——这能帮助其他访客做决定，只需不到一分钟。",
    testimonialAuthHeading: "登录后即可撰写评价",
    testimonialAuthIntro: "使用 Google 登录，或创建一个免费账户，填写姓名、电子邮件和电话——不到一分钟即可完成。",
    testimonialCompanyLabel: "公司名称",
    testimonialCompanyPlaceholder: "Acme Sdn Bhd",
    testimonialPositionLabel: "职位",
    testimonialPositionPlaceholder: "市场总监",
    testimonialSignupTab: "创建账户",
    testimonialLoginTab: "登录",
    testimonialAccountTypeUser: "个人账户",
    testimonialAccountTypeBusiness: "商家账户",
    testimonialLoginSubmit: "登录",
    testimonialLoginSubmitting: "登录中…",
    testimonialSwitchToLogin: "已有账户？登录",
    testimonialSwitchToSignup: "还没有账户？创建一个",
    testimonialAuthErrors: {
      name_required: "请填写姓名",
      email_required: "请填写电子邮件",
      email_invalid: "请输入有效的电子邮件",
      phone_required: "请填写电话号码",
      phone_invalid: "请输入有效的电话号码，例如 +60 12 345 6789",
      password_length: "密码至少需要 8 个字符",
      password_required: "请填写密码",
      company_required: "请填写公司名称",
      title_required: "请填写职位",
      email_taken: "该电子邮件已有账户——请改用登录。",
      invalid_credentials: "电子邮件或密码不正确。",
      rate_limited: "尝试次数过多，请稍等几分钟后再试。",
      invalid_submission: "请检查表单内容后重试。",
      generic: "出现错误，请重试。",
      google_failed: "Google 登录失败，请重试。",
      wrong_role: "该 Google 账户已关联本站的商家账户。请使用其他 Google 账户登录，或在下方使用电子邮件和密码。",
      email_unverified: "该 Google 账户的电子邮件地址未经验证。",
    },
    testimonialAlreadySubmittedTitle: "您已评价过该企业",
    testimonialAlreadySubmittedPending: "您的评价仍在等待该企业审核。",
    testimonialAlreadySubmittedApproved: "您的评价已在本页公开显示——感谢您的分享。",
    testimonialAlreadySubmittedRejected: "该企业未通过您的评价。",
    testimonialLoggedInAs: "以此身份发布：",
    testimonialLogout: "不是您本人？登出",
    testimonialFormHeading: "撰写评价",
    testimonialFormRatingLabel: "评分",
    testimonialFormBodyLabel: "您的评价",
    testimonialFormBodyPlaceholder: "与该企业合作的体验如何？",
    testimonialFormGuideHeading: "不知道写什么？可以参考：",
    testimonialFormGuideImpactLabel: "成效",
    testimonialFormGuideImpactQuestion: "我们解决了什么问题，或您获得了什么成果（例如：节省时间、提升业绩、顺利上线）？",
    testimonialFormGuideExperienceLabel: "体验",
    testimonialFormGuideExperienceQuestion: "哪方面让您印象最深刻（例如：速度、沟通、专业能力）？",
    testimonialFormGuideVerdictLabel: "评价",
    testimonialFormGuideVerdictQuestion: "您会将我们推荐给谁，为什么？",
    testimonialFormPhotosLabel: "照片（可选）",
    testimonialFormPhotosCta: "添加照片",
    testimonialFormPhotosUploading: "正在上传照片 {done}/{total}…",
    testimonialFormPhotosTooMany: "每条评价最多可上传 4 张照片。",
    testimonialFormRewriteCta: "用 AI 润色",
    testimonialFormRewriteDescription: "润色语法和措辞——保留您的原意，只是更易读。",
    testimonialFormRewriting: "润色中…",
    testimonialFormSubmit: "提交评价",
    testimonialFormSubmitting: "提交中…",
    testimonialFormSuccess: "谢谢！您的评价将在审核通过后公开显示。",
    testimonialGoogleCta: "同时发布到 Google",
    testimonialGoogleCopied: "已复制——请粘贴到刚打开的评价框中。",
    testimonialErrors: {
      body_required: "请简单描述您的体验",
      rating_required: "请选择评分",
      rate_limited: "尝试次数过多，请稍等几分钟后再试。",
      listing_not_found: "该合作伙伴的资料已下架。",
      not_signed_in: "请先登录，然后再撰写您的评价。",
      already_submitted: "您已评价过该企业。",
      own_listing: "您不能为自己的企业撰写评价。",
      invalid_submission: "请检查表单内容后重试。",
      generic: "出现错误，请重试。",
    },
    skipToContentLabel: "跳到主要内容",
    stickyNavLabel: "快捷链接",
    sectionNavLabel: "页面导航",
    breadcrumbNavLabel: "面包屑导航",
    notFoundTitle: "目录中没有这个页面",
    notFoundDescription: "您查找的企业或类别可能已迁移、已下架，或从未存在。请检查链接，或从头浏览目录。",
    notFoundBackCta: "浏览目录",
    footerTagline: "Gotka 网络中值得信赖的企业目录。",
    footerDirectoryHeading: "目录",
    footerExploreHeading: "浏览",
    footerLegalHeading: "法律",
    footerContactHeading: "联系我们",
    footerWhatsAppCta: "WhatsApp 联系我们",
    footerWhatsAppMessage: "您好，我想咨询有关 Gotka 企业目录的问题。",
    footerCopyright: "© {year} Gotka Technologies. 保留所有权利。",
    backToDirectory: "返回目录",
    brandName: "企业目录",
    navLoginRegister: "企业登录",
    navMyBusiness: "我的企业",
    navAddBusiness: "添加企业",
    navDashboard: "仪表盘",
    navMyListings: "我的企业",
    navBusinessLeads: "商业线索",
    navCompanies: "公司",
    navContacts: "联系人",
    navDeals: "交易",
    navTasks: "任务",
    navProfile: "个人资料",
    navPartnership: "合作伙伴关系",
    navGoToCrm: "前往 CRM",
    navSignOut: "退出登录",
    listBusinessCta: "刊登您的企业",
    benefitsNavLabel: "为什么要刊登您的企业",
    aboutNavLabel: "关于我们",
    contactNavLabel: "联系我们",
    privacyNavLabel: "隐私政策",
    termsNavLabel: "服务条款",
    editorialPolicyNavLabel: "编辑政策",
    signupHeading: "刊登您的企业",
    signupSubheading: "加入企业目录，直接从访客那里获得咨询。",
    signupCompanyLabel: "企业名称",
    signupCompanyPlaceholder: "Acme Sdn Bhd",
    signupNameLabel: "您的姓名",
    signupNamePlaceholder: "Jane Smith",
    signupEmailLabel: "电子邮件",
    signupEmailPlaceholder: "jane@company.com",
    signupPhoneLabel: "电话号码",
    signupPhonePlaceholder: "+60 12 345 6789",
    signupPhoneHint: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
    signupPasswordLabel: "密码",
    signupPasswordHint: "至少 8 个字符。",
    signupSubmit: "创建账户",
    signupSubmitting: "正在创建账户…",
    signupOrDivider: "或",
    signupGoogleCta: "使用 Google 继续",
    signupAlreadyPartner: "已经有账户？",
    signupSignInLink: "登录",
    signupErrors: {
      company_required: "请填写企业名称",
      name_required: "请填写您的姓名",
      email_required: "请填写电子邮件",
      email_invalid: "请输入有效的电子邮件地址",
      phone_invalid: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
      password_length: "密码至少需要 8 个字符",
      email_taken: "该电子邮件已注册账户，请尝试登录。",
      rate_limited: "尝试次数过多，请稍等几分钟后再试。",
      invalid_submission: "请检查表单内容后重试。",
      generic: "出现错误，请重试。",
      google_failed: "Google 登录失败，请重试。",
      google_unavailable: "Google 登录目前不可用。",
      email_unverified: "您的 Google 账户电子邮件尚未验证。",
      wrong_role: "该 Google 账户属于员工账号。员工请在 /system/login 登录。",
    },
  },
  ms: {
    heroEyebrow: "Perniagaan Tempatan Dipercayai",
    heroTitle: "Cari perniagaan yang sesuai untuk projek anda",
    heroSubtitle: "Semak imbas perniagaan yang dipercayai dan hubungi terus.",
    searchPlaceholder: "Cari mengikut syarikat, perkhidmatan, industri atau kategori…",
    headerSearchPlaceholder: "Cari perniagaan, produk, berita…",
    searchSectionBusiness: "Perniagaan",
    searchNoResults: "Tiada hasil dijumpai",
    searchViewAllResults: "Lihat semua hasil untuk “{query}”",
    otherCategoriesHeading: "Semak imbas kategori lain",
    otherLocationsHeading: "Semak imbas lokasi lain",
    otherIndustriesHeading: "Semak imbas industri lain",
    noResultsTitle: "Tiada perniagaan dijumpai",
    noResultsDescription: "Cuba carian atau penapis industri yang lain.",
    viewListing: "Lihat butiran",
    servicesHeading: "Produk & Perkhidmatan",
    topNavLabel: "Semak Imbas",
    navAllBusiness: "Semua Perniagaan",
    navLocations: "Lokasi",
    navLatestProducts: "Produk Terkini",
    navIndustries: "Industri",
    navGuides: "Panduan",
    categoriesIndexHeading: "Semua Kategori Perniagaan",
    categoriesIndexDescription: "Setiap kategori dalam Direktori Perniagaan Gotka, berserta bilangan perniagaan yang tersenarai dalam setiap satu.",
    categoriesIndexEmptyTitle: "Belum ada kategori",
    categoriesIndexEmptyDescription: "Sila semak semula tidak lama lagi — kategori akan dipaparkan di sini.",
    industriesIndexHeading: "Semua Industri",
    industriesIndexDescription: "Setiap industri dalam Direktori Perniagaan Gotka, berserta bilangan perniagaan yang tersenarai dalam setiap satu.",
    industriesIndexEmptyTitle: "Belum ada industri",
    industriesIndexEmptyDescription: "Sila semak semula tidak lama lagi — industri akan dipaparkan di sini.",
    locationsIndexHeading: "Semua Lokasi",
    locationsIndexDescription: "Setiap negeri dan kawasan yang mempunyai perniagaan tersenarai dalam Direktori Perniagaan Gotka.",
    locationsIndexEmptyTitle: "Belum ada lokasi",
    locationsIndexEmptyDescription: "Sila semak semula tidak lama lagi — lokasi akan dipaparkan di sini apabila perniagaan menyertai direktori.",
    latestProductsHeading: "Produk & Perkhidmatan Terkini",
    latestProductsDescription: "Produk dan perkhidmatan yang baru ditambah oleh perniagaan di seluruh direktori.",
    latestProductsEmptyTitle: "Belum ada produk",
    latestProductsEmptyDescription: "Sila semak semula tidak lama lagi — perniagaan sedang menambah produk dan perkhidmatan mereka.",
    newsFeedDescription: "Berita dan promosi terkini daripada perniagaan di seluruh direktori.",
    newsFeedEmptyTitle: "Belum ada berita atau promosi",
    newsFeedEmptyDescription: "Sila semak semula tidak lama lagi untuk kemas kini daripada perniagaan dalam direktori.",
    guidesIndexHeading: "Panduan",
    guidesIndexDescription: "Panduan mendalam untuk membantu anda memilih dan membandingkan perniagaan dalam rangkaian Gotka.",
    guidesIndexEmptyTitle: "Belum ada panduan",
    guidesIndexEmptyDescription: "Sila semak semula tidak lama lagi — panduan akan dipaparkan di sini.",
    guidePublishedOnLabel: "Diterbitkan",
    guideUpdatedOnLabel: "Dikemas kini",
    guideByLabel: "Oleh pasukan Direktori Perniagaan Gotka",
    guideReadMoreLabel: "Baca panduan",
    guideRelatedHeading: "Panduan berkaitan",
    guideFaqHeading: "Soalan lazim",
    guidesLatestHeading: "Lebih banyak panduan",
    latestBusinessesHeading: "Perniagaan Terkini",
    nearbyBusinessesHeading: "Perniagaan Berhampiran",
    aboutHeading: "Tentang",
    mediaHeading: "Foto & Video",
    videoHeading: "Video",
    watchOnProviderLabel: "Tonton di {provider}",
    photosHeading: "Foto",
    backToAlbumsLabel: "Kembali ke album",
    otherPhotosLabel: "Foto lain",
    updatesHeading: "Berita & Promosi",
    newsLabel: "Berita",
    promotionLabel: "Promosi",
    promotionsHeading: "Promosi",
    faqHeading: "Soalan lazim",
    testimonialsHeading: "Testimoni",
    visitHeading: "Lawati kami",
    branchesHeading: "Lokasi lain",
    hoursHeading: "Waktu Operasi",
    hoursOpenLabel: "Buka",
    hoursOpenTodayLabel: "Buka hari ini",
    hoursClosedLabel: "Tutup",
    hoursClosedTodayLabel: "Tutup hari ini",
    hoursOpenNowBadge: "Buka sekarang",
    hoursClosedNowBadge: "Tutup sekarang",
    navigateGoogleMapsLabel: "Navigasi dengan Google Maps",
    navigateWazeLabel: "Navigasi dengan Waze",
    dayLabels: {
      monday: "Isnin",
      tuesday: "Selasa",
      wednesday: "Rabu",
      thursday: "Khamis",
      friday: "Jumaat",
      saturday: "Sabtu",
      sunday: "Ahad",
    },
    websiteLabel: "Laman web",
    recommendLabel: "Syorkan Perniagaan",
    recommendMessage: "Saya syorkan {business} — lihat mereka di Direktori Perniagaan: {url}",
    shareLabel: "Kongsi Perniagaan",
    locationLabel: "Lokasi",
    googleRatingLabel: "Penilaian Google",
    contactHeading: "Hubungi kami",
    contactSubheading: "Hantar mesej terus kepada perniagaan ini — mereka akan membalas ke alamat e-mel dan nombor telefon yang anda berikan.",
    contactCallCta: "Hubungi",
    contactWhatsAppCta: "WhatsApp",
    contactWhatsAppMessage: "Dihantar dari Direktori Perniagaan Gotka. Hai, saya berminat dengan {business}. Bolehkah anda kongsikan maklumat lanjut?",
    formNameLabel: "Nama",
    formNamePlaceholder: "Jane Smith",
    formEmailLabel: "E-mel",
    formEmailPlaceholder: "jane@company.com",
    formPhoneLabel: "Nombor Telefon",
    formPhonePlaceholder: "+60 12 345 6789",
    formPhoneHint: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
    formCompanyLabel: "Syarikat",
    formCompanyPlaceholder: "Pilihan",
    formMessageLabel: "Apakah bantuan yang anda perlukan?",
    formMessagePlaceholder: "Ceritakan sedikit tentang projek anda…",
    formSubmit: "Hantar mesej",
    formSubmitting: "Menghantar…",
    formSuccess: "Terima kasih! Mesej anda telah dihantar — perniagaan ini akan membalas terus ke e-mel anda.",
    errors: {
      name_required: "Nama diperlukan",
      email_required: "E-mel diperlukan",
      email_invalid: "Sila masukkan e-mel yang sah",
      phone_required: "Nombor telefon diperlukan",
      phone_invalid: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
      message_required: "Beritahu kami sedikit tentang apa yang anda perlukan",
      rate_limited: "Terlalu banyak percubaan — sila tunggu beberapa minit dan cuba lagi.",
      listing_not_found: "Penyenaraian ini tidak lagi tersedia.",
      invalid_submission: "Sila semak borang dan cuba lagi.",
      generic: "Berlaku ralat. Sila cuba lagi.",
    },
    testimonialsIntro: "Maklum balas sebenar daripada pelanggan yang pernah berurusan dengan perniagaan ini.",
    testimonialsEmpty: "Belum ada testimoni — jadilah yang pertama meninggalkan satu.",
    testimonialsCta: "Ada pengalaman yang baik? Kongsikan — ia membantu pelawat lain membuat keputusan, dan mengambil masa kurang seminit.",
    testimonialAuthHeading: "Log masuk untuk menulis testimoni",
    testimonialAuthIntro:
      "Log masuk dengan Google, atau cipta akaun percuma dengan nama, e-mel dan nombor telefon anda — mengambil masa kurang seminit.",
    testimonialCompanyLabel: "Nama syarikat",
    testimonialCompanyPlaceholder: "Acme Sdn Bhd",
    testimonialPositionLabel: "Jawatan",
    testimonialPositionPlaceholder: "Pengarah Pemasaran",
    testimonialSignupTab: "Cipta akaun",
    testimonialLoginTab: "Log masuk",
    testimonialAccountTypeUser: "Akaun pengguna",
    testimonialAccountTypeBusiness: "Akaun perniagaan",
    testimonialLoginSubmit: "Log masuk",
    testimonialLoginSubmitting: "Melog masuk…",
    testimonialSwitchToLogin: "Sudah ada akaun? Log masuk",
    testimonialSwitchToSignup: "Baru di sini? Cipta akaun",
    testimonialAuthErrors: {
      name_required: "Nama diperlukan",
      email_required: "E-mel diperlukan",
      email_invalid: "Masukkan e-mel yang sah",
      phone_required: "Nombor telefon diperlukan",
      phone_invalid: "Masukkan nombor telefon yang sah, contohnya +60 12 345 6789",
      password_length: "Kata laluan mestilah sekurang-kurangnya 8 aksara",
      password_required: "Kata laluan diperlukan",
      company_required: "Nama syarikat diperlukan",
      title_required: "Jawatan diperlukan",
      email_taken: "E-mel itu sudah mempunyai akaun — cuba log masuk sebaliknya.",
      invalid_credentials: "E-mel atau kata laluan tidak betul.",
      rate_limited: "Terlalu banyak percubaan — sila tunggu beberapa minit dan cuba lagi.",
      invalid_submission: "Sila semak borang dan cuba lagi.",
      generic: "Berlaku ralat. Sila cuba lagi.",
      google_failed: "Log masuk Google gagal. Sila cuba lagi.",
      wrong_role: "Akaun Google itu sudah dikaitkan dengan akaun perniagaan di sini. Log masuk dengan akaun Google lain, atau gunakan e-mel dan kata laluan di bawah.",
      email_unverified: "Alamat e-mel akaun Google itu tidak disahkan.",
    },
    testimonialAlreadySubmittedTitle: "Anda sudah menilai perniagaan ini",
    testimonialAlreadySubmittedPending: "Testimoni anda masih menunggu kelulusan daripada perniagaan ini.",
    testimonialAlreadySubmittedApproved: "Testimoni anda kini dipaparkan di halaman ini — terima kasih kerana berkongsi.",
    testimonialAlreadySubmittedRejected: "Perniagaan ini tidak meluluskan testimoni anda.",
    testimonialLoggedInAs: "Menyiarkan sebagai",
    testimonialLogout: "Bukan anda? Log keluar",
    testimonialFormHeading: "Tulis testimoni",
    testimonialFormRatingLabel: "Penilaian",
    testimonialFormBodyLabel: "Testimoni anda",
    testimonialFormBodyPlaceholder: "Bagaimana pengalaman anda berurusan dengan perniagaan ini?",
    testimonialFormGuideHeading: "Tidak pasti apa nak tulis? Pertimbangkan:",
    testimonialFormGuideImpactLabel: "Impak",
    testimonialFormGuideImpactQuestion:
      "Masalah apa yang kami selesaikan, atau hasil apa yang anda perolehi (contohnya: menjimatkan masa, meningkatkan jualan, pelancaran yang lancar)?",
    testimonialFormGuideExperienceLabel: "Pengalaman",
    testimonialFormGuideExperienceQuestion: "Apa yang paling menonjol (contohnya: kelajuan, komunikasi, kepakaran teknikal)?",
    testimonialFormGuideVerdictLabel: "Kesimpulan",
    testimonialFormGuideVerdictQuestion: "Kepada siapa anda akan mengesyorkan kami, dan mengapa?",
    testimonialFormPhotosLabel: "Foto (pilihan)",
    testimonialFormPhotosCta: "Tambah foto",
    testimonialFormPhotosUploading: "Memuat naik foto {done}/{total}…",
    testimonialFormPhotosTooMany: "Sehingga 4 foto setiap testimoni.",
    testimonialFormRewriteCta: "Tulis semula dengan AI",
    testimonialFormRewriteDescription: "Membersihkan tatabahasa dan gaya bahasa — mengekalkan apa yang anda tulis, cuma lebih mudah dibaca.",
    testimonialFormRewriting: "Menulis semula…",
    testimonialFormSubmit: "Hantar testimoni",
    testimonialFormSubmitting: "Menghantar…",
    testimonialFormSuccess: "Terima kasih! Testimoni anda menunggu kelulusan sebelum dipaparkan secara terbuka.",
    testimonialGoogleCta: "Hantar ke Google juga",
    testimonialGoogleCopied: "Disalin — tampal ke dalam kotak ulasan yang baru dibuka.",
    testimonialErrors: {
      body_required: "Tulis beberapa patah perkataan tentang pengalaman anda",
      rating_required: "Sila pilih penilaian",
      rate_limited: "Terlalu banyak percubaan — sila tunggu beberapa minit dan cuba lagi.",
      listing_not_found: "Penyenaraian ini tidak lagi tersedia.",
      not_signed_in: "Log masuk dahulu, kemudian tulis testimoni anda.",
      already_submitted: "Anda sudah menilai perniagaan ini.",
      own_listing: "Anda tidak boleh menulis testimoni untuk perniagaan anda sendiri.",
      invalid_submission: "Sila semak borang dan cuba lagi.",
      generic: "Berlaku ralat. Sila cuba lagi.",
    },
    skipToContentLabel: "Langkau ke kandungan utama",
    stickyNavLabel: "Pautan pantas",
    sectionNavLabel: "Bahagian halaman",
    breadcrumbNavLabel: "Navigasi laluan",
    notFoundTitle: "Halaman ini tiada dalam direktori",
    notFoundDescription:
      "Perniagaan atau kategori yang anda cari mungkin telah berpindah, ditarik balik, atau tidak pernah wujud. Semak pautan itu, atau layari direktori dari mula.",
    notFoundBackCta: "Layari direktori",
    footerTagline: "Direktori perniagaan yang dipercayai dalam rangkaian Gotka.",
    footerDirectoryHeading: "Direktori",
    footerExploreHeading: "Terokai",
    footerLegalHeading: "Perundangan",
    footerContactHeading: "Hubungi kami",
    footerWhatsAppCta: "WhatsApp kami",
    footerWhatsAppMessage: "Hai, saya ada soalan mengenai Direktori Perniagaan Gotka.",
    footerCopyright: "© {year} Gotka Technologies. Hak cipta terpelihara.",
    backToDirectory: "Kembali ke direktori",
    brandName: "Direktori Perniagaan",
    navLoginRegister: "Log Masuk Perniagaan",
    navMyBusiness: "Perniagaan saya",
    navAddBusiness: "Tambah Perniagaan",
    navDashboard: "Papan Pemuka",
    navMyListings: "Perniagaan saya",
    navBusinessLeads: "Petunjuk Perniagaan",
    navCompanies: "Syarikat",
    navContacts: "Kenalan",
    navDeals: "Urus Niaga",
    navTasks: "Tugasan",
    navProfile: "Profil",
    navPartnership: "Perkongsian",
    navGoToCrm: "Pergi ke CRM",
    navSignOut: "Log keluar",
    listBusinessCta: "Senaraikan perniagaan anda",
    benefitsNavLabel: "Kenapa senaraikan perniagaan anda",
    aboutNavLabel: "Tentang kami",
    contactNavLabel: "Hubungi kami",
    privacyNavLabel: "Dasar Privasi",
    termsNavLabel: "Terma Perkhidmatan",
    editorialPolicyNavLabel: "Dasar Editorial",
    signupHeading: "Senaraikan perniagaan anda",
    signupSubheading: "Sertai direktori perniagaan dan mula menerima pertanyaan terus daripada pelawat.",
    signupCompanyLabel: "Nama perniagaan",
    signupCompanyPlaceholder: "Acme Sdn Bhd",
    signupNameLabel: "Nama anda",
    signupNamePlaceholder: "Jane Smith",
    signupEmailLabel: "E-mel",
    signupEmailPlaceholder: "jane@company.com",
    signupPhoneLabel: "Nombor Telefon",
    signupPhonePlaceholder: "+60 12 345 6789",
    signupPhoneHint: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
    signupPasswordLabel: "Kata laluan",
    signupPasswordHint: "Sekurang-kurangnya 8 aksara.",
    signupSubmit: "Cipta akaun",
    signupSubmitting: "Mencipta akaun…",
    signupOrDivider: "atau",
    signupGoogleCta: "Teruskan dengan Google",
    signupAlreadyPartner: "Sudah mempunyai akaun?",
    signupSignInLink: "Log masuk",
    signupErrors: {
      company_required: "Nama perniagaan diperlukan",
      name_required: "Nama anda diperlukan",
      email_required: "E-mel diperlukan",
      email_invalid: "Sila masukkan e-mel yang sah",
      phone_invalid: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
      password_length: "Kata laluan mesti sekurang-kurangnya 8 aksara",
      email_taken: "Akaun dengan e-mel itu sudah wujud. Cuba log masuk sebaliknya.",
      rate_limited: "Terlalu banyak percubaan — sila tunggu beberapa minit dan cuba lagi.",
      invalid_submission: "Sila semak borang dan cuba lagi.",
      generic: "Berlaku ralat. Sila cuba lagi.",
      google_failed: "Log masuk Google gagal. Sila cuba lagi.",
      google_unavailable: "Log masuk Google tidak tersedia sekarang.",
      email_unverified: "E-mel akaun Google anda belum disahkan.",
      wrong_role: "Akaun Google itu milik kakitangan. Kakitangan log masuk di /system/login.",
    },
  },
};

// BUSINESS_NAV_ITEMS (src/lib/business-nav-items.ts) gives the portal's own
// English page names — right for PartnerNavMenu/PartnerSidebar, which live
// outside the locale-prefixed directory tree, but wrong for that same list
// rendered inside DirectoryNavMenu, which does live inside it and needs to
// match whichever of the three languages that menu is already showing.
// Zips those hrefs (unlocalized, and never shown directly) with the
// translated labels above, in the same fixed order.
export function localizedBusinessNavItems(locale: DirectoryLocale): { href: string; label: string }[] {
  const t = DIRECTORY_STRINGS[locale];
  const labels: Record<string, string> = {
    "/business-portal": t.navDashboard,
    "/business-portal/listings": t.navMyListings,
    "/business-portal/business-leads": t.navBusinessLeads,
    "/business-portal/companies": t.navCompanies,
    "/business-portal/contacts": t.navContacts,
    "/business-portal/deals": t.navDeals,
    "/business-portal/tasks": t.navTasks,
    "/business-portal/profile": t.navProfile,
  };
  return BUSINESS_NAV_ITEMS.map((item) => ({ href: item.href, label: labels[item.href] ?? item.label }));
}

// Industry is a fixed enum shared with the internal /system CRM (see
// INDUSTRY_LABELS in src/lib/labels.ts, English-only — that side isn't
// trilingual, see src/app/system/(dashboard)/settings/directory/page.tsx's
// own comment on why). The public directory needs the same 20 values in
// all three locales; "en" reuses INDUSTRY_LABELS directly rather than
// duplicating those strings a second time.
export const INDUSTRY_LABELS_BY_LOCALE: Record<DirectoryLocale, Record<Industry, string>> = {
  en: INDUSTRY_LABELS,
  zh: {
    TECHNOLOGY: "科技",
    RETAIL_ECOMMERCE: "零售与电子商务",
    HEALTHCARE: "医疗保健",
    FINANCE_BANKING: "金融与银行",
    MANUFACTURING: "制造业",
    CONSTRUCTION_REAL_ESTATE: "建筑与房地产",
    EDUCATION: "教育",
    HOSPITALITY_TOURISM: "酒店与旅游",
    PROFESSIONAL_SERVICES: "专业服务",
    MEDIA_ENTERTAINMENT: "媒体与娱乐",
    TRANSPORTATION_LOGISTICS: "运输与物流",
    AGRICULTURE: "农业",
    ENERGY_UTILITIES: "能源与公用事业",
    GOVERNMENT_NONPROFIT: "政府与非营利组织",
    TELECOMMUNICATIONS: "电信",
    AUTOMOTIVE: "汽车",
    FOOD_BEVERAGE: "餐饮",
    LEGAL: "法律",
    MARKETING_ADVERTISING: "市场营销与广告",
    OTHER: "其他",
  },
  ms: {
    TECHNOLOGY: "Teknologi",
    RETAIL_ECOMMERCE: "Runcit & E-dagang",
    HEALTHCARE: "Penjagaan Kesihatan",
    FINANCE_BANKING: "Kewangan & Perbankan",
    MANUFACTURING: "Pembuatan",
    CONSTRUCTION_REAL_ESTATE: "Pembinaan & Hartanah",
    EDUCATION: "Pendidikan",
    HOSPITALITY_TOURISM: "Hospitaliti & Pelancongan",
    PROFESSIONAL_SERVICES: "Perkhidmatan Profesional",
    MEDIA_ENTERTAINMENT: "Media & Hiburan",
    TRANSPORTATION_LOGISTICS: "Pengangkutan & Logistik",
    AGRICULTURE: "Pertanian",
    ENERGY_UTILITIES: "Tenaga & Utiliti",
    GOVERNMENT_NONPROFIT: "Kerajaan & Bukan Untung",
    TELECOMMUNICATIONS: "Telekomunikasi",
    AUTOMOTIVE: "Automotif",
    FOOD_BEVERAGE: "Makanan & Minuman",
    LEGAL: "Undang-undang",
    MARKETING_ADVERTISING: "Pemasaran & Pengiklanan",
    OTHER: "Lain-lain",
  },
};

// Same reasoning as INDUSTRY_LABELS_BY_LOCALE just above: "en" reuses
// VIDEO_CATEGORY_LABELS (src/lib/labels.ts) directly rather than duplicating
// those strings a second time.
export const VIDEO_CATEGORY_LABELS_BY_LOCALE: Record<DirectoryLocale, Record<VideoCategory, string>> = {
  en: VIDEO_CATEGORY_LABELS,
  zh: {
    OVERVIEW: "概览",
    TOUR: "导览",
    PRODUCT_SERVICE: "产品/服务",
    TESTIMONIAL: "客户评价",
    PROMOTIONAL: "宣传",
    EVENT: "活动",
    OTHER: "其他",
  },
  ms: {
    OVERVIEW: "Gambaran Keseluruhan",
    TOUR: "Lawatan",
    PRODUCT_SERVICE: "Produk/Perkhidmatan",
    TESTIMONIAL: "Testimoni",
    PROMOTIONAL: "Promosi",
    EVENT: "Acara",
    OTHER: "Lain-lain",
  },
};
