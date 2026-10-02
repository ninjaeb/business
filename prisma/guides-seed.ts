export type GuideSeed = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
};

// Each entry here is created once, the first time its slug doesn't already
// exist in DirectoryGuide (see seedGuides() in seed.ts) — appending to this
// array is how new guides go live: push a commit, the next deploy's seed
// run creates it. Once a slug exists, the seed never touches that row again
// (no update-on-every-run, unlike BUSINESS_CATEGORIES above) — editing or
// unpublishing an already-seeded guide from here on is the admin UI's job,
// not this file's.
export const GUIDES: GuideSeed[] = [
  {
    slug: "get-your-business-found-online-malaysia",
    title: "How to Get Your Business Found Online in Malaysia",
    excerpt:
      "A practical order of operations for Malaysian business owners: Google Business Profile, a real website, directory listings, consistent contact details, reviews, and WhatsApp — the channels people actually use to find and vet a business here, done in the sequence that pays off fastest.",
    body: `"Being online" and "being findable" are not the same thing. A Facebook page nobody can search for, or a website with no listing anywhere else pointing at it, is online — it just isn't findable by someone who doesn't already know your business exists. This guide covers the handful of things that actually move a business from invisible to findable, roughly in the order they pay off.

## 1. Claim your Google Business Profile first

Before a website, before social media, this is the single highest-leverage thing a local business can do. It's what shows up on Google Maps and in the "local pack" above regular search results when someone searches for what you do near them.

- Verify the listing (Google will confirm by phone, postcard, or video, depending on your business type).
- Fill in every field: category, service area, opening hours, phone number, and at least a few real photos.
- Keep it updated — holiday hours, a temporary closure, a changed address. An out-of-date profile actively works against you.

## 2. Build a real website — even one page

A website doesn't need to be elaborate to do its job. At minimum, it needs to say what you do, where you are, and how to reach you, on a page Google can actually crawl and index. A business with no website of its own is entirely dependent on other platforms to be found, and has no page of its own to send people to.

If a full custom site isn't realistic yet, a single well-built page beats no page — it's still something you own, that ranks under your own name, and that every other channel (a directory listing, a Google Business Profile link, a WhatsApp bio) can point back to.

## 3. Get listed in more than one directory

A Google Business Profile is itself a kind of directory listing, but it's not the only one worth having. Each additional, legitimate directory listing is another place someone can discover you, and another page search engines associate with your business name.

> The payoff isn't any single listing — it's the pattern. The more places consistently say "this business exists, here's how to reach it," the more a search engine (and a visitor) trusts that it's real.

This directory is one option — a free listing here takes a few minutes to submit and goes live once reviewed. The same logic applies to any other reputable directory relevant to your industry or area; there's no reason to stop at one.

## 4. Make your contact details consistent everywhere

Business name, address, and phone number (often shortened to "NAP") should match exactly across every place they appear — your website, your Google Business Profile, every directory listing, your social pages. "Jalan Ampang" in one place and "Jln Ampang" in another, or a landline on one listing and a mobile number on another, looks like two different businesses rather than one.

- Pick one canonical way to write your business name, address, and phone number.
- Update every existing listing to match it, not just new ones going forward.
- Re-check this any time you move, rebrand, or change numbers.

## 5. Collect reviews, and actually reply to them

Reviews do two jobs at once: they influence whether a person chooses you over the next search result, and they're a signal search engines read when deciding how prominently to show a business. Neither job gets done by reviews that sit there unanswered.

- Ask satisfied customers directly, right after a good interaction — most people are willing if asked, and most never think to do it unprompted.
- Reply to every review, good or bad. A thoughtful reply to a bad review often reassures a future customer more than another five-star review would.
- Never buy or fake reviews. Platforms actively detect and penalize this, and it's exactly the kind of thing that undoes everything else in this guide at once.

## 6. Use WhatsApp Business, not just a phone number

A phone number printed on a listing means someone has to call during business hours and hope you pick up. A WhatsApp Business number means they can message any time, see your business profile and catalog, and get a reply when you're free — without either side playing phone tag.

Set up a WhatsApp Business account (free, separate from WhatsApp Business Platform/API used for automated notifications), fill in your business profile, and use it as the number you put on your website and listings alongside your regular phone number.

## Common mistakes that undo all of this

- **Only doing one of the above.** A perfect Google Business Profile with no website, or a great website nobody's heard of, both cap out well below what doing several of these together achieves.
- **Setting it up once and never touching it again.** Hours change, phone numbers change, photos go stale — an abandoned, outdated listing can hurt more than having none.
- **Inconsistent details across platforms**, covered above, but worth repeating: it's the single most common self-inflicted problem.

## Where to start this week

If none of this exists yet, start with the Google Business Profile — it's free, it's fast, and it's the one most people check first. Then build or finish a website, however simple. Everything else compounds from there: a website to point directory listings at, directory listings to build the consistency search engines reward, and reviews and WhatsApp to turn that visibility into actual conversations with customers.`,
  },
];
