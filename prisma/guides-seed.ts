// Keyed by locale minus "en" (English is always the `alt`/`after` field
// itself), same convention as DirectoryGuideTranslations in
// src/lib/directory-guides.ts.
type NonEnglishLocale = "zh" | "ms";

export type GuideImage = {
  // File name under prisma/guide-images/, read and embedded as a
  // DirectoryListingImage row at seed time (see seed.ts) — same
  // base64-in-Postgres storage and /api/directory-images/* serving every
  // other image in this app uses, so no next.config.ts/CSP change is
  // needed. Pre-optimize it yourself (see src/lib/image-optimize.ts's
  // optimizeImageForWeb, GALLERY_PHOTO_MAX_DIMENSION) before dropping it in
  // this folder — seed.ts stores the file as-is.
  file: string;
  mimeType: string;
  alt: string;
  // Translated alt text for a locale whose `translations` entry exists —
  // the same underlying image/URL is reused across all locales (a photo
  // isn't language-specific), only its alt text differs. Falls back to the
  // English `alt` for a locale with no entry here.
  altTranslations?: Partial<Record<NonEnglishLocale, string>>;
};

export type GuideContentImage = GuideImage & {
  // Exact text the image is inserted right after, as its own paragraph —
  // must appear exactly once in `body`. Keep this frozen once a guide has
  // shipped with it even if the surrounding prose is later rewritten (see
  // composeGuideBody in seed.ts): include this sentence verbatim somewhere
  // in the new body so the image keeps landing in the same place, rather
  // than changing both at once and losing track of where it ends up.
  after: string;
  // Same idea as `after`, but matched against each locale's own translated
  // body text (which reads nothing like the English prose) — required for
  // the image to also appear in a translation, since there's no English
  // text to find there.
  afterTranslations?: Partial<Record<NonEnglishLocale, string>>;
};

// FaqEntry (src/lib/directory.ts), duplicated locally rather than imported
// — this file stays free of any src/lib import (several of which pull in
// `server-only`) so it can be read by both seed.ts and, eventually, a
// non-seed context without that throwing.
export type GuideFaqEntry = { question: string; answer: string };

export type GuideTranslationEntry = { title: string; excerpt: string; body: string; faqs: GuideFaqEntry[] };

export type GuideSeed = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
  // FAQPage schema (see buildFaqJsonLd) plus a visible accordion on the
  // guide's own page (GuideDetailContent) — the SEO payoff is the rich
  // result; the GEO one is a reader's (or an AI answer engine's) most
  // likely follow-up questions already answered in a directly quotable
  // Q&A shape, rather than buried mid-paragraph in the body above.
  faqs?: GuideFaqEntry[];
  coverImage?: GuideImage;
  // Inline images placed further down in the body, keyed by a short name
  // (see GuideContentImage's `after` field for how placement works).
  contentImages?: Record<string, GuideContentImage>;
  // Translated copies of title/excerpt/body/faqs — see seed.ts's
  // composeGuideTranslations, which also splices coverImage/contentImages
  // into each translated body (reusing the same already-uploaded image
  // URLs, not re-uploading per locale).
  translations?: Partial<Record<NonEnglishLocale, GuideTranslationEntry>>;
};

// Each entry here is this guide's single source of truth: seed.ts's
// seedGuides() creates it on first sight of a new slug, then re-syncs every
// scalar field (title/excerpt/body/seoTitle/seoDescription/faqs/
// translations) to whatever's written here on every subsequent deploy —
// editing this file and shipping it is how an already-published guide's
// content actually changes, the same way every edit to this one guide so
// far (its cover image, its inline WhatsApp photo, its zh/ms translations)
// has been made. publishedAt/status are the one exception: set once, at
// creation, and left alone after that, so re-running the seed never
// silently re-publishes a guide an admin has since unpublished through
// /admin/guides. There's no separate admin-UI editor for faqs/translations
// yet (unlike title/excerpt/body/seoTitle/seoDescription, which an admin
// can also hand-edit there) — until one exists, this file is the only way
// either gets written.
export const GUIDES: GuideSeed[] = [
  {
    slug: "get-your-business-found-online-malaysia",
    title: "How to Get Your Business Found Online in Malaysia",
    seoTitle: "Get Found Online in Malaysia: A Step-by-Step SEO Guide",
    seoDescription:
      "A step-by-step local SEO guide for Malaysian businesses: Google Business Profile, a website, directory listings, NAP consistency, reviews, and WhatsApp.",
    coverImage: {
      file: "get-your-business-found-online-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A confident small business owner standing in her shop",
      altTranslations: {
        zh: "一位自信的小企业主站在自己的店里",
        ms: "Seorang pemilik perniagaan kecil yang yakin berdiri di kedainya",
      },
    },
    contentImages: {
      whatsapp: {
        file: "get-your-business-found-online-malaysia-whatsapp.webp",
        mimeType: "image/webp",
        alt: "A business owner smiling while checking messages on his phone",
        altTranslations: {
          zh: "一位企业主面带微笑地查看手机上的消息",
          ms: "Seorang pemilik perniagaan tersenyum sambil menyemak mesej di telefonnya",
        },
        after:
          "Set up a WhatsApp Business account (free, separate from WhatsApp Business Platform/API used for automated notifications), fill in your business profile, and use it as the number you put on your website and listings alongside your regular phone number.",
        afterTranslations: {
          zh: "注册一个 WhatsApp Business 账号（免费，与用于自动通知的 WhatsApp Business Platform/API 是两回事），填写好企业资料，并将这个号码与您常规的电话号码一起，放在您的网站和各个列表上。",
          ms: "Daftarkan akaun WhatsApp Business (percuma, berbeza daripada WhatsApp Business Platform/API yang digunakan untuk notifikasi automatik), lengkapkan profil perniagaan anda, dan gunakan nombor ini sebagai nombor yang anda letakkan pada laman web dan penyenaraian anda bersama nombor telefon biasa anda.",
        },
      },
    },
    excerpt:
      "A practical order of operations for Malaysian business owners: Google Business Profile, a real website, directory listings, consistent contact details, reviews, and WhatsApp — the channels people actually use to find and vet a business here, done in the sequence that pays off fastest.",
    body: `"Being online" and "being findable" are not the same thing. A Facebook page nobody can search for, or a website with no listing anywhere else pointing at it, is online — it just isn't findable by someone who doesn't already know your business exists. That's what local SEO actually means for a small or mid-sized Malaysian business: not outranking a national brand for a generic keyword, but reliably showing up — on Google, on Maps, in an AI chatbot's answer — when someone nearby searches for exactly what you do. This guide covers the handful of things that actually move a business from invisible to findable in Malaysia, roughly in the order they pay off.

## 1. Claim and fully complete your Google Business Profile

Before a website, before social media, this is the single highest-leverage thing a local business can do. It's what shows up on Google Maps, on Waze (which pulls its own business listings from Google), and in the "local pack" above regular search results when someone searches for what you do near them.

### Verify it properly
Google confirms ownership by phone, postcard, or video, depending on your business type — use your business's real registered or trading name, the one on your signage and your SSM registration, not a shortened or stylized version you'd never actually search for.

### Fill in every field Google gives you, not just the required ones
- Primary and secondary categories (be specific — "Nasi Lemak Restaurant" beats "Restaurant" if that's genuinely what you serve).
- Your exact service area or physical address, opening hours (including public holidays), and a phone number that's actually answered.
- At least a handful of real photos: your shopfront, your interior, your products or work — Google weighs listings with real photos more favorably than ones with none.
- The products or services list, which doubles as more searchable text tied to your business.

### Keep it updated
Holiday hours, a temporary closure, a changed address — an out-of-date profile actively works against you, and is one of the few things on this list that costs nothing but a few minutes to fix.

## 2. Build a real website — even one page

A website doesn't need to be elaborate to do its job. At minimum, it needs to say what you do, where you are, and how to reach you, on a page Google can actually crawl and index. A business with no website of its own is entirely dependent on other platforms to be found, and has no page of its own to send people to.

A few basics make a real difference: a page that loads quickly and works on a phone screen (most searches in Malaysia happen on mobile), a clear page title, and your actual service area and service names written out in plain text somewhere on the page — not just implied by a logo or a photo. That's the whole of "on-page SEO" that matters at this stage; none of it requires a developer.

If a full custom site isn't realistic yet, a single well-built page beats no page — it's still something you own, that ranks under your own name, and that every other channel (a directory listing, a Google Business Profile link, a WhatsApp bio) can point back to.

## 3. List your business in more than one directory

A Google Business Profile is itself a kind of directory listing, but it's not the only one worth having. Each additional, legitimate directory listing is another place someone can discover you, another page search engines associate with your business name, and another data point an AI assistant can cross-check before recommending you with any confidence.

> The payoff isn't any single listing — it's the pattern. The more places consistently say "this business exists, here's how to reach it," the more a search engine, an AI answer engine, and a visitor all trust that it's real.

[Listing your business here](/en/signup) is one option — it's free, takes a few minutes to submit, and goes live once reviewed. The same logic applies to any other reputable directory relevant to your industry or area; there's no reason to stop at one, and no reason not to [browse what's already listed](/en) to see the kind of detail a strong listing includes.

## 4. Make your contact details consistent everywhere

Business name, address, and phone number (often shortened to "NAP") should match exactly across every place they appear — your website, your Google Business Profile, every directory listing, your social pages. "Jalan Ampang" in one place and "Jln Ampang" in another, "No. 12" versus "12", a unit number included on one listing and dropped on another, or a landline on one listing and a mobile number on another, looks like two different businesses rather than one — to both a visitor and a search engine trying to decide whether they're the same place.

- Pick one canonical way to write your business name, address (down to the unit/lot number and building name, if you have one), and phone number.
- Update every existing listing to match it, not just new ones going forward.
- Re-check this any time you move, rebrand, or change numbers.

## 5. Collect reviews, and actually reply to them

Reviews do two jobs at once: they influence whether a person chooses you over the next search result, and they're a signal search engines read when deciding how prominently to show a business. Neither job gets done by reviews that sit there unanswered.

- Ask satisfied customers directly, right after a good interaction — most people are willing if asked, and most never think to do it unprompted. A simple QR code at the counter linking straight to your Google review page removes the only friction most customers would otherwise face.
- Reply to every review, good or bad, on both Google and Facebook. A thoughtful reply to a bad review often reassures a future customer more than another five-star review would.
- Never buy or fake reviews. Platforms actively detect and penalize this, and it's exactly the kind of thing that undoes everything else in this guide at once.

## 6. Use WhatsApp Business, not just a phone number

A phone number printed on a listing means someone has to call during business hours and hope you pick up. A WhatsApp Business number means they can message any time, see your business profile and catalog, and get a reply when you're free — without either side playing phone tag, and without you needing to be glued to the phone all day the way a voice call demands.

Set up a WhatsApp Business account (free, separate from WhatsApp Business Platform/API used for automated notifications), fill in your business profile, and use it as the number you put on your website and listings alongside your regular phone number.

Once it's set up, a few features are worth turning on right away: a catalog of your products or services (so a customer can browse without you typing out a price list every time), a greeting message for a first-time chat, and an away message for outside business hours so nobody's left wondering if you've seen their message at all.

## 7. Show up where people are already scrolling

A Google Business Profile and a website cover search intent — someone already looking for what you offer. A Facebook Page and, depending on your business, an Instagram or TikTok account cover discovery intent — someone who wasn't looking for you yet, but sees a post, a reel, or a friend's share and decides to check you out.

A Facebook Page (not a personal profile, which can't be found by strangers searching) is the baseline — link it from your Google Business Profile's own "social profiles" field, and keep its own name/address/phone consistent with everything else, same as step 4. Instagram and TikTok matter more for visually driven businesses — food, retail, beauty, events — than for, say, a plumbing or accounting business, so weigh the effort against what your customers actually use to decide where to go.

None of this needs to mean posting daily. Existing, being findable, and being consistent with your other listings matters far more than volume.

## 8. Check what's actually working, every month

Everything above compounds, but only if you occasionally look at what's paying off. Google Business Profile's own Performance tab shows how people found you (a direct search for your name versus a discovery search for what you do) and what they did next — called, asked for directions, or visited your website. It takes about fifteen minutes a month, and it's the only way to know whether step 3's extra directory listings, step 5's review push, or step 7's social presence is actually bringing anyone in.

The simplest version of this costs nothing: ask new customers how they heard about you, and keep a running tally. Over a few months, a pattern becomes obvious — and tells you exactly where to spend more effort next.

## Common mistakes that undo all of this

- **Only doing one of the above.** A perfect Google Business Profile with no website, or a great website nobody's heard of, both cap out well below what doing several of these together achieves.
- **Setting it up once and never touching it again.** Hours change, phone numbers change, photos go stale — an abandoned, outdated listing can hurt more than having none.
- **Inconsistent details across platforms**, covered in step 4, but worth repeating: it's the single most common self-inflicted problem, and the easiest one to actually go back and fix this week.

## Where to start this week

Spread across four weeks rather than attempted all at once, this becomes manageable even alongside running the business itself:

- **Week 1:** Claim and fully fill in your Google Business Profile — it's free, it's fast, and it's the one most people check first.
- **Week 2:** Build or finish your website (or one page), and write down the exact way you'll present your name, address, and phone number everywhere from now on.
- **Week 3:** Submit your business to a couple of directories (including this one), and start asking recent customers for a review.
- **Week 4:** Set up WhatsApp Business and, if it fits your business, a Facebook Page.

Everything compounds from there: a website to point directory listings at, directory listings to build the consistency search engines (and AI answer engines) reward, and reviews and WhatsApp to turn that visibility into actual conversations with customers.`,
    faqs: [
      {
        question: "How long does it take for a new business to show up on Google Search in Malaysia?",
        answer:
          "A verified Google Business Profile can appear in Google Maps and local search results within a few days of verification, though full visibility typically builds over several weeks as Google gathers more signals — photos, reviews, and consistent details elsewhere. A brand-new website usually takes longer, often a few weeks to a few months, to be fully crawled and ranked.",
      },
      {
        question: "Is a Google Business Profile free to set up?",
        answer:
          "Yes. Creating, verifying, and maintaining a Google Business Profile costs nothing — there's no paid tier required to appear on Google Maps or in local search results. The only cost is the time it takes to fill it in properly and keep it updated.",
      },
      {
        question: "I already have a Facebook Page — do I still need a separate website?",
        answer:
          "Yes, if findability matters to you. A Facebook Page depends on Facebook's own search and algorithm, and most people still check Google before visiting an unfamiliar business. A website is something you own outright, that ranks under your own name on Google, and that every other listing — including your Facebook Page — can link back to.",
      },
      {
        question: "What does \"NAP consistency\" mean, and why does it matter for local SEO?",
        answer:
          "NAP stands for Name, Address, and Phone number — the three details that should be written identically everywhere your business appears online. Search engines use matching NAP details across multiple sites as a trust signal that a listing is accurate and genuine; inconsistent details, like a different phone number on one directory than another, can make a search engine less confident the listings refer to the same real business.",
      },
      {
        question: "How many business directories should I actually list my business on?",
        answer:
          "There's no fixed number, but more than one is the point — each legitimate, relevant directory is another place to be found and another consistent data point search engines and AI tools can confirm your business against. Start with directories relevant to your industry or area, keep every listing's details identical, and add more over time rather than trying to do all of them at once.",
      },
      {
        question: "Should I reply to negative reviews, or just leave them alone?",
        answer:
          "Always reply, calmly and specifically, rather than leaving it unanswered. A thoughtful response to a negative review is often more persuasive to a future customer than another five-star review, since it shows how the business actually handles problems — and ignoring it reads as confirmation of the complaint either way.",
      },
      {
        question: "Is WhatsApp Business free, and how is it different from a regular WhatsApp account?",
        answer:
          "WhatsApp Business is free to download and use. It adds a business profile, a product catalog, and automated greeting/away messages and quick replies — features a regular personal account doesn't have. It's separate from the paid WhatsApp Business Platform/API, which is built for large-scale automated messaging, not a single small business's day-to-day chats.",
      },
      {
        question: "What's the single fastest way to get a new business found online in Malaysia?",
        answer:
          "Claim and fully complete a Google Business Profile first — it's free, usually the fastest of everything in this guide to show results, and the listing most people check before anything else. Everything after that (a website, more directories, reviews, WhatsApp Business) compounds on top of it, but Google Business Profile alone gets you found the soonest.",
      },
    ],
    translations: {
      zh: {
        title: "如何让您的企业在马来西亚更容易在网上被找到",
        excerpt:
          "为马来西亚企业主提供的实用操作顺序：Google 商家资料、真正的网站、目录列表、一致的联系方式、评价，以及 WhatsApp——这些都是人们在本地实际用来寻找和核实企业的渠道，按照见效最快的顺序逐一说明。",
        body: `"上线"和"能被找到"并不是一回事。一个没人能搜索到的 Facebook 专页，或者一个没有任何其他地方链接过来的网站，确实是"上线"了——但如果别人原本不知道您的企业存在，就无法找到它。这正是"本地 SEO"（本地搜索引擎优化）对马来西亚中小企业真正的意义：不是要在某个泛泛的关键词上压过全国性大品牌，而是要在 Google、Google 地图，乃至 AI 聊天机器人给出的答案里，当附近有人搜索您所提供的服务时，可靠地被找到。本指南将介绍真正能让企业在马来西亚从"看不见"变成"找得到"的几个关键做法，大致按照见效快慢的顺序排列。

## 1. 认领并完整填写您的 Google 商家资料

在建立网站、经营社交媒体之前，这是本地企业能做的、投入产出比最高的一件事。当有人在附近搜索您所提供的服务时，Google 地图、Waze（其商家资料本身就来自 Google）以及搜索结果上方的"本地结果"区块显示的正是这份资料。

### 正确完成验证
Google 会根据您的企业类型，通过电话、明信片或视频方式进行确认——请使用您企业的真实注册名称或招牌上使用的名称，也就是与您 SSM 注册资料一致的名称，而不是一个被简化或改动过、顾客实际搜索时根本不会用到的版本。

### 填写 Google 提供的每一个栏位，而不只是必填项
- 主要和次要类别（越具体越好——如果您实际卖的是椰浆饭，"椰浆饭餐馆"会比笼统的"餐馆"更准确）。
- 准确的服务范围或实体地址、营业时间（包括公共假期），以及一个真正有人接听的电话号码。
- 至少几张真实的照片：您的店面、室内环境、产品或作品——相比完全没有照片的列表，Google 会更青睐配有真实照片的列表。
- 产品或服务列表，这同时也增加了与您企业相关、可被搜索到的文字内容。

### 保持资料更新
节假日营业时间、临时停业、地址变更等——过时的资料反而会对您不利，而这恰恰是本清单中少数几件只需花几分钟就能修正的事情之一。

## 2. 建立一个真正的网站——哪怕只有一页

网站不需要做得多复杂才能发挥作用。最基本的要求是：在一个 Google 能够抓取和收录的页面上，清楚说明您做什么、您在哪里，以及如何联系您。一家没有自己网站的企业，完全依赖其他平台才能被找到，也没有一个属于自己的页面可以引导顾客前往。

有几个基本要点会带来明显差别：页面加载速度快，并且在手机屏幕上也能正常显示（马来西亚大多数搜索都发生在手机上）；清晰的页面标题；以及在页面某处用文字清楚写出您实际的服务范围和服务项目名称——而不是只靠一个标志或一张照片来暗示。在这个阶段，这就是"页面 SEO"真正重要的全部内容，完全不需要请程序员来做。

如果暂时没有条件建立完整的定制网站，一个做得扎实的单页网站也胜过完全没有——它仍然是属于您自己的资产，能以您的名义被收录，并且目录列表、Google 商家资料链接、WhatsApp 简介等其他所有渠道都可以指向它。

## 3. 不要只在一个目录中列出

Google 商家资料本身也是一种目录列表，但并非唯一值得拥有的。每多一个正规的目录列表，就多一个让人发现您的渠道，多一个搜索引擎用来关联您企业名称的页面，也多一个 AI 助手在有把握地推荐您之前可以交叉核实的信息来源。

> 真正带来价值的不是某一个单独的列表，而是这种整体模式。越多地方一致地传达"这家企业确实存在，这是联系方式"，搜索引擎、AI 问答工具，以及访客就越会相信它是真实可靠的。

[在这里刊登您的企业](/zh/signup)就是其中一个选择——免费，提交只需几分钟，经过审核后即可上线。同样的道理也适用于任何其他与您所在行业或地区相关的正规目录，没有理由只满足于一个；您也不妨先[浏览一下已经刊登的企业](/zh)，看看一份出色的列表通常会包含哪些细节。

## 4. 让您的联系方式在各处保持一致

企业名称、地址和电话号码（常简称为"NAP"）应该在所有出现的地方完全一致——您的网站、Google 商家资料、每一个目录列表，以及社交媒体主页。如果一处写的是"Jalan Ampang"，另一处写的是"Jln Ampang"；一处写"No. 12"，另一处写"12"；某个列表写了门牌/单位号，另一个却漏掉了；或者一个列表用的是固定电话、另一个用的是手机号码——无论对访客还是对正在判断这是否是同一家企业的搜索引擎来说，看起来都像是两家不同的企业。

- 为您的企业名称、地址（精确到门牌/单位号，以及楼宇名称，如果有的话）和电话号码确定一种统一的标准写法。
- 更新所有现有的列表以保持一致，而不只是针对日后新增的列表。
- 每次搬迁、更换品牌形象或更改号码时，都要重新检查这一点。

## 5. 收集评价，并且认真回复

评价同时发挥着两个作用：它会影响顾客是选择您，还是选择搜索结果中的下一家；同时它也是搜索引擎判断该如何突出展示一家企业的信号之一。如果评价始终无人回应，这两个作用都无法真正发挥。

- 在一次良好的互动之后，直接向满意的顾客提出请求——大多数人只要被问到都愿意配合，但很少有人会主动想到要这样做。在柜台放一个直接链接到您 Google 评价页面的二维码，能消除大多数顾客原本会遇到的唯一障碍。
- 对每一条评价都给予回复，无论是在 Google 还是 Facebook 上，也无论好评还是差评。一条用心的差评回复，往往比再多一条五星好评更能让未来的顾客安心。
- 切勿购买或伪造评价。各平台都会主动侦测并处罚这种行为，而且这恰恰会让本指南中提到的其他所有努力功亏一篑。

## 6. 使用 WhatsApp Business，而不只是一个电话号码

列表上印着的电话号码，意味着顾客必须在营业时间内拨打，还得祈祷您能接听。而 WhatsApp Business 号码则让他们可以随时发消息、查看您的企业资料和产品目录，并在您有空时得到回复——双方都不必反复"电话捉迷藏"，您也不必像接电话那样一整天都守着手机。

注册一个 WhatsApp Business 账号（免费，与用于自动通知的 WhatsApp Business Platform/API 是两回事），填写好企业资料，并将这个号码与您常规的电话号码一起，放在您的网站和各个列表上。

设置完成后，有几项功能值得立即启用：产品或服务目录（这样顾客就能自行浏览，您也不必每次都手动打出价目表）、首次聊天时的问候语，以及营业时间以外的自动回复，这样对方就不会怀疑您是否看到了他们的消息。

## 7. 出现在大家本来就在滑动浏览的地方

Google 商家资料和网站覆盖的是"搜索意图"——也就是已经在寻找您所提供服务的人。而 Facebook 专页，以及视您的业务性质而定的 Instagram 或 TikTok 账号，覆盖的则是"发现意图"——也就是原本并没有在找您，但看到一则帖文、一段短视频，或朋友的分享后，决定进一步了解您的人。

Facebook 专页（而不是个人账号，因为陌生人无法通过搜索找到个人账号）是最基本的一步——把它链接到您 Google 商家资料里的"社交资料"栏位，并像第 4 点所说的那样，保持名称、地址、电话号码的一致。Instagram 和 TikTok 对以视觉为主的业务——餐饮、零售、美容、活动——会比对水电或会计这类业务更有帮助，所以请根据顾客实际使用的渠道来决定值得投入多少精力。

这并不意味着您必须每天发帖。相比发帖频率，存在感、能被找到，以及与其他列表信息保持一致，才是真正重要的。

## 8. 每月检查一下实际效果

以上这些做法都会逐步累加效果，但前提是您要不时留意哪些真正见效。Google 商家资料自带的"效果"分析页面，会显示人们是如何找到您的（直接搜索您的企业名称，还是搜索您所提供的服务），以及他们接下来做了什么——拨打电话、查询路线，还是访问您的网站。每月只需花大约十五分钟查看，这也是唯一能确认第 3 点新增的目录列表、第 5 点推动的评价，或是第 7 点的社交媒体存在感，是否真的带来了顾客的方法。

最简单的版本完全不花钱：直接询问新顾客是从哪里得知您的，并做个简单记录。坚持几个月后，规律自然会浮现——并告诉您接下来该把精力花在哪里。

## 会让这一切努力白费的常见错误

- **只做到上面其中一项。** 一份完美的 Google 商家资料如果没有配上网站，或者一个优秀的网站却无人知晓，效果都远不如把几项结合起来做。
- **设置一次之后就再也不更新。** 营业时间会变、电话号码会变、照片也会过时——一个被放任不管、信息过时的列表，造成的伤害可能比完全没有列表还大。
- **各平台信息不一致**，第 4 点已经提到，但值得再强调一次：这是最常见、也是企业自己造成的问题，同时也是本周就能动手修正的最简单的一项。

## 本周可以从这里开始

把以下内容分摊到四周内完成，而不是试图一次做完，即使一边还要兼顾日常经营，也能从容应对：

- **第 1 周：** 认领并完整填写您的 Google 商家资料——它免费、快速，也是大多数人最先查看的地方。
- **第 2 周：** 建立或完善您的网站（哪怕只有一页），并确定日后在各处统一使用的企业名称、地址和电话号码写法。
- **第 3 周：** 把您的企业提交到一两个目录（包括本目录），并开始向近期的顾客索取评价。
- **第 4 周：** 设置 WhatsApp Business，如果适合您的业务，再开设一个 Facebook 专页。

此后的一切都会层层累加：有了网站，目录列表就有了可以指向的目标；有了目录列表，就能建立起搜索引擎（以及 AI 问答工具）所看重的一致性；再加上评价和 WhatsApp，就能把这些曝光真正转化为与顾客之间的实际对话。`,
        faqs: [
          {
            question: "在马来西亚，新企业要多久才会在 Google 搜索中出现？",
            answer:
              "经过验证的 Google 商家资料，通常在验证完成后几天内就能出现在 Google 地图和本地搜索结果中，不过完整的可见度通常需要几周时间逐步建立，因为 Google 会持续收集照片、评价以及其他地方一致信息等信号。全新的网站通常需要更长时间——往往是几周到几个月——才能被完整抓取并获得排名。",
          },
          {
            question: "Google 商家资料是免费的吗？",
            answer:
              "是的。创建、验证和维护 Google 商家资料完全免费——要出现在 Google 地图或本地搜索结果中，并不需要任何付费方案。唯一的成本是您花在认真填写并持续更新资料上的时间。",
          },
          {
            question: "我已经有 Facebook 专页了，还需要单独建一个网站吗？",
            answer:
              "如果您在意能否被找到，答案是需要。Facebook 专页依赖于 Facebook 自身的搜索和算法，而大多数人在光顾一家不熟悉的企业之前，仍然习惯先用 Google 搜索一下。网站则是您完全拥有的资产，能以您自己的名义在 Google 上获得排名，而包括 Facebook 专页在内的其他所有列表，都可以反过来链接到它。",
          },
          {
            question: "什么是“NAP 一致性”？它对本地 SEO 为什么重要？",
            answer:
              "NAP 指的是企业名称（Name）、地址（Address）和电话号码（Phone），这三项信息应该在您企业出现的所有网络渠道上写法完全一致。搜索引擎会把多个网站上一致的 NAP 信息，当作判断一份列表真实准确的信任信号；如果信息不一致，比如不同目录上的电话号码不一样，搜索引擎就可能无法确信这些列表指向的是同一家真实存在的企业。",
          },
          {
            question: "我的企业到底应该在多少个目录上刊登？",
            answer:
              "没有固定的数字，但重点就在于“不止一个”——每一个正规且相关的目录，都是一个可以被发现的新渠道，也是搜索引擎和 AI 工具可以用来核实您企业信息的又一个一致数据点。可以先从与您所在行业或地区相关的目录开始，确保每一份列表的信息完全一致，再随着时间逐步增加，而不是一次性全部完成。",
          },
          {
            question: "遇到差评应该回复，还是不理会就好？",
            answer:
              "一定要回复，而且语气要冷静、内容要具体，不要置之不理。一条用心的差评回复，往往比再多一条五星好评更能打动未来的顾客，因为它展示了企业真正处理问题的方式——而选择不回复，无论如何都会被解读为默认了对方的投诉。",
          },
          {
            question: "WhatsApp Business 是免费的吗？它和普通的 WhatsApp 账号有什么不同？",
            answer:
              "WhatsApp Business 可以免费下载和使用。它增加了企业资料、产品目录、自动问候语和自动回复，以及快捷回复等功能，这些都是普通个人 WhatsApp 账号所没有的。它与付费的 WhatsApp Business Platform/API 是两回事，后者是为大规模自动化信息发送而设计的，并不适用于单一小企业的日常聊天。",
          },
          {
            question: "在马来西亚，让新企业被找到最快的方法是什么？",
            answer:
              "首先认领并完整填写 Google 商家资料——它免费，通常是本指南中见效最快的一步，也是大多数人在做其他事情之前最先查看的列表。之后的一切（网站、更多目录、评价、WhatsApp Business）都会在此基础上不断累加效果，但单靠 Google 商家资料，就能让您最快被找到。",
          },
        ],
      },
      ms: {
        title: "Cara Memastikan Perniagaan Anda Mudah Ditemui Dalam Talian di Malaysia",
        excerpt:
          "Susunan tindakan praktikal untuk pemilik perniagaan di Malaysia: Profil Perniagaan Google, laman web sebenar, penyenaraian direktori, maklumat hubungan yang konsisten, ulasan, dan WhatsApp — saluran yang benar-benar digunakan orang untuk mencari dan menyemak sesebuah perniagaan di sini, disusun mengikut turutan yang memberi hasil paling pantas.",
        body: `"Berada dalam talian" dan "mudah ditemui" bukanlah perkara yang sama. Halaman Facebook yang tidak dapat dicari oleh sesiapa, atau laman web yang tiada mana-mana tempat lain memautkannya, memang berada dalam talian — tetapi ia tidak akan ditemui oleh sesiapa yang belum tahu perniagaan anda wujud. Inilah sebenarnya maksud "SEO tempatan" bagi perniagaan kecil atau sederhana di Malaysia: bukan untuk mengatasi jenama kebangsaan bagi kata kunci yang umum, tetapi untuk sentiasa muncul — di Google, di Google Maps, malah dalam jawapan chatbot AI — apabila seseorang berhampiran mencari perkhidmatan yang anda tawarkan. Panduan ini merangkumi beberapa perkara yang benar-benar menjadikan sesebuah perniagaan mudah ditemui di Malaysia, lebih kurang mengikut turutan hasil yang paling memberangsangkan.

## 1. Tuntut dan Lengkapkan Sepenuhnya Profil Perniagaan Google Anda

Sebelum laman web, sebelum media sosial, inilah satu perkara yang memberi impak paling besar yang boleh dilakukan oleh perniagaan tempatan. Inilah yang dipaparkan pada Google Maps, pada Waze (yang turut mengambil penyenaraian perniagaannya sendiri daripada Google), dan dalam "local pack" di atas keputusan carian biasa apabila seseorang mencari perkhidmatan anda berhampiran mereka.

### Sahkan dengan Betul
Google akan mengesahkan melalui panggilan telefon, poskad, atau video, bergantung pada jenis perniagaan anda — gunakan nama perniagaan sebenar yang berdaftar atau nama yang digunakan pada papan tanda anda, iaitu nama yang sepadan dengan pendaftaran SSM anda, bukan versi yang dipendekkan atau diubah suai yang tidak akan pernah dicari oleh pelanggan sebenar.

### Isi Setiap Ruangan yang Disediakan oleh Google, Bukan Sekadar yang Wajib
- Kategori utama dan kategori kedua (jadilah spesifik — "Restoran Nasi Lemak" lebih tepat berbanding "Restoran" sekiranya itulah yang sebenarnya anda jual).
- Kawasan perkhidmatan atau alamat fizikal yang tepat, waktu operasi (termasuk cuti umum), dan nombor telefon yang benar-benar dijawab.
- Sekurang-kurangnya beberapa foto sebenar: kedai anda, bahagian dalam, produk atau hasil kerja anda — Google lebih memihak kepada penyenaraian dengan foto sebenar berbanding yang tiada langsung.
- Senarai produk atau perkhidmatan, yang turut berfungsi sebagai teks tambahan yang boleh dicari berkaitan perniagaan anda.

### Pastikan Ia Sentiasa Dikemas Kini
Waktu cuti, penutupan sementara, perubahan alamat — profil yang lapuk sebenarnya memudaratkan perniagaan anda, dan ini salah satu daripada sedikit perkara dalam senarai ini yang hanya memerlukan beberapa minit untuk diperbetulkan.

## 2. Bina Laman Web Sebenar — Walaupun Hanya Satu Halaman

Laman web tidak perlu rumit untuk berfungsi. Pada tahap minimum, ia perlu menyatakan apa yang anda lakukan, lokasi anda, dan cara menghubungi anda, pada satu halaman yang benar-benar boleh diimbas dan diindeks oleh Google. Perniagaan yang tiada laman web sendiri bergantung sepenuhnya kepada platform lain untuk ditemui, dan tiada halaman sendiri untuk dirujuk kepada orang ramai.

Beberapa perkara asas memberi perbezaan yang ketara: halaman yang pantas dimuatkan dan berfungsi pada skrin telefon (kebanyakan carian di Malaysia dilakukan melalui telefon bimbit), tajuk halaman yang jelas, serta kawasan dan nama perkhidmatan sebenar anda ditulis dengan jelas dalam teks di suatu tempat pada halaman tersebut — bukan sekadar tersirat melalui logo atau foto. Itulah keseluruhan "SEO pada halaman" yang penting pada peringkat ini; tiada satu pun daripadanya memerlukan seorang pembangun web.

Jika laman web tersuai yang lengkap belum praktikal buat masa ini, satu halaman yang dibina dengan baik lebih baik daripada tiada langsung — ia tetap sesuatu yang anda miliki, yang tersenarai di bawah nama anda sendiri, dan yang setiap saluran lain (penyenaraian direktori, pautan Profil Perniagaan Google, bio WhatsApp) boleh rujuk kembali kepadanya.

## 3. Senaraikan Perniagaan Anda Dalam Lebih Daripada Satu Direktori

Profil Perniagaan Google itu sendiri adalah sejenis penyenaraian direktori, tetapi ia bukan satu-satunya yang berbaloi untuk dimiliki. Setiap penyenaraian direktori yang sah tambahan adalah satu lagi tempat untuk orang menemui anda, satu lagi halaman yang dikaitkan oleh enjin carian dengan nama perniagaan anda, dan satu lagi titik data yang boleh disemak silang oleh pembantu AI sebelum mengesyorkan anda dengan yakin.

> Hasilnya bukan terletak pada mana-mana satu penyenaraian — tetapi pada corak keseluruhannya. Semakin banyak tempat yang secara konsisten menyatakan "perniagaan ini wujud, inilah cara menghubunginya," semakin enjin carian, alat jawapan AI, dan pelawat mempercayai bahawa ia benar-benar wujud.

[Senaraikan perniagaan anda di sini](/ms/signup) adalah satu pilihan — ia percuma, hanya mengambil masa beberapa minit untuk dihantar dan akan disiarkan sebaik sahaja disemak. Logik yang sama terpakai kepada mana-mana direktori lain yang bereputasi baik dan relevan dengan industri atau kawasan anda; tiada sebab untuk berhenti pada satu sahaja, dan tiada salahnya untuk [melihat apa yang telah disenaraikan](/ms) bagi memahami jenis butiran yang terdapat pada penyenaraian yang kukuh.

## 4. Pastikan Maklumat Hubungan Anda Konsisten Di Mana-Mana

Nama perniagaan, alamat, dan nombor telefon (sering disingkatkan sebagai "NAP") perlu sepadan dengan tepat di setiap tempat ia dipaparkan — laman web anda, Profil Perniagaan Google, setiap penyenaraian direktori, dan halaman media sosial anda. "Jalan Ampang" di satu tempat dan "Jln Ampang" di tempat lain; "No. 12" berbanding "12"; nombor unit yang disertakan pada satu penyenaraian tetapi tertinggal pada yang lain; atau talian tetap pada satu penyenaraian dan nombor mudah alih pada penyenaraian lain — semuanya kelihatan seperti dua perniagaan yang berbeza, bukan satu, bagi kedua-dua pelawat dan enjin carian yang cuba menentukan sama ada ia tempat yang sama.

- Tetapkan satu cara baku untuk menulis nama perniagaan, alamat (sehingga ke nombor unit/lot, dan nama bangunan, jika berkenaan), dan nombor telefon anda.
- Kemas kini semua penyenaraian sedia ada supaya sepadan, bukan hanya penyenaraian baharu selepas ini.
- Semak semula perkara ini setiap kali anda berpindah, menjenamakan semula, atau menukar nombor.

## 5. Kumpulkan Ulasan, dan Benar-Benar Membalasnya

Ulasan memainkan dua peranan sekali gus: ia mempengaruhi sama ada seseorang memilih perniagaan anda berbanding keputusan carian seterusnya, dan ia juga merupakan isyarat yang digunakan enjin carian untuk menentukan sejauh mana menonjolkan sesebuah perniagaan. Kedua-dua peranan ini tidak akan tercapai jika ulasan dibiarkan tanpa dijawab.

- Minta secara langsung daripada pelanggan yang berpuas hati, sejurus selepas interaksi yang baik — kebanyakan orang sanggup melakukannya jika diminta, tetapi kebanyakan tidak akan terfikir untuk berbuat demikian tanpa diminta. Kod QR yang ringkas di kaunter, yang terus memautkan ke halaman ulasan Google anda, menghapuskan satu-satunya halangan yang biasanya dihadapi pelanggan.
- Balas setiap ulasan, di Google mahupun Facebook, baik mahupun buruk. Balasan yang bersungguh-sungguh kepada ulasan buruk selalunya lebih meyakinkan bakal pelanggan berbanding satu lagi ulasan lima bintang.
- Jangan sesekali membeli atau memalsukan ulasan. Platform secara aktif mengesan dan menghukum perbuatan ini, dan ia boleh meruntuhkan segala usaha lain dalam panduan ini serta-merta.

## 6. Gunakan WhatsApp Business, Bukan Sekadar Nombor Telefon

Nombor telefon yang tertera pada penyenaraian bermakna seseorang perlu menelefon semasa waktu operasi dan berharap anda menjawabnya. Nombor WhatsApp Business pula membolehkan mereka menghantar mesej pada bila-bila masa, melihat profil perniagaan dan katalog anda, dan mendapat balasan apabila anda lapang — tanpa mana-mana pihak perlu "kejar-mengejar" melalui telefon, dan tanpa anda perlu sentiasa berada di telefon sepanjang hari seperti yang dituntut oleh panggilan suara.

Daftarkan akaun WhatsApp Business (percuma, berbeza daripada WhatsApp Business Platform/API yang digunakan untuk notifikasi automatik), lengkapkan profil perniagaan anda, dan gunakan nombor ini sebagai nombor yang anda letakkan pada laman web dan penyenaraian anda bersama nombor telefon biasa anda.

Sebaik sahaja disediakan, beberapa ciri wajar diaktifkan dengan segera: katalog produk atau perkhidmatan anda (supaya pelanggan boleh melayari sendiri tanpa anda perlu menaip senarai harga setiap kali), mesej ucapan untuk perbualan kali pertama, dan mesej ketiadaan di luar waktu operasi supaya tiada sesiapa tertanya-tanya sama ada mesej mereka telah dilihat.

## 7. Wujud di Tempat Orang Ramai Sudah Melayari

Profil Perniagaan Google dan laman web menangkap niat carian — iaitu seseorang yang sudah mencari apa yang anda tawarkan. Halaman Facebook, dan bergantung kepada jenis perniagaan anda, akaun Instagram atau TikTok pula menangkap niat penemuan — iaitu seseorang yang belum lagi mencari anda, tetapi melihat satu hantaran, reel, atau perkongsian rakan, lalu memutuskan untuk melihat lebih lanjut.

Halaman Facebook (bukan profil peribadi, yang tidak boleh ditemui oleh orang ramai melalui carian) adalah asas minimum — pautkan ia daripada ruangan "profil sosial" pada Profil Perniagaan Google anda sendiri, dan pastikan nama/alamat/nombor telefonnya konsisten dengan semua yang lain, sama seperti langkah 4. Instagram dan TikTok lebih bermakna untuk perniagaan yang berasaskan visual — makanan, runcit, kecantikan, acara — berbanding, katakanlah, perniagaan paip atau perakaunan, jadi timbangkan usaha yang diperlukan berbanding apa yang sebenarnya digunakan pelanggan anda untuk membuat keputusan.

Ini tidak bermakna anda perlu berhantar setiap hari. Kewujudan, kebolehtemuan, dan konsistensi dengan penyenaraian lain anda jauh lebih penting berbanding kekerapan.

## 8. Semak Apa yang Benar-Benar Berkesan, Setiap Bulan

Segala-galanya di atas memberi kesan berganda, tetapi hanya jika anda sekali-sekala menyemak apa yang benar-benar membuahkan hasil. Tab Prestasi pada Profil Perniagaan Google menunjukkan bagaimana orang menemui anda (carian terus untuk nama perniagaan anda berbanding carian penemuan untuk perkhidmatan anda) dan apa yang mereka lakukan seterusnya — menelefon, meminta arah, atau melawat laman web anda. Ia hanya mengambil masa lebih kurang lima belas minit sebulan, dan inilah satu-satunya cara untuk mengetahui sama ada penyenaraian direktori tambahan daripada langkah 3, usaha ulasan daripada langkah 5, atau kehadiran media sosial daripada langkah 7 benar-benar membawa pelanggan.

Versi paling ringkas bagi perkara ini tidak memerlukan sebarang kos: tanya pelanggan baharu bagaimana mereka mengetahui tentang anda, dan simpan rekod ringkas. Selepas beberapa bulan, corak tertentu akan menjadi jelas — dan memberitahu anda dengan tepat di mana perlu memberi lebih tumpuan seterusnya.

## Kesilapan Biasa yang Menjejaskan Semua Usaha Ini

- **Hanya melakukan satu daripada perkara di atas.** Profil Perniagaan Google yang sempurna tanpa laman web, atau laman web yang hebat tetapi tiada sesiapa mengetahuinya, kedua-duanya memberi hasil yang jauh lebih rendah berbanding melakukan beberapa perkara ini bersama-sama.
- **Menyediakannya sekali sahaja dan tidak menyentuhnya lagi.** Waktu operasi berubah, nombor telefon berubah, foto menjadi lapuk — penyenaraian yang diabaikan dan lapuk boleh memudaratkan lebih daripada tiada penyenaraian langsung.
- **Maklumat tidak konsisten merentasi platform**, seperti yang dibincangkan dalam langkah 4, namun wajar diulangi: inilah masalah paling biasa yang dicetuskan sendiri oleh perniagaan, dan juga yang paling mudah untuk diperbetulkan minggu ini juga.

## Di Mana Harus Bermula Minggu Ini

Dibahagikan kepada empat minggu dan bukannya cuba diselesaikan sekali gus, ini menjadi lebih terkawal walaupun sambil menguruskan perniagaan itu sendiri:

- **Minggu 1:** Tuntut dan lengkapkan sepenuhnya Profil Perniagaan Google anda — ia percuma, pantas, dan merupakan perkara pertama yang disemak oleh kebanyakan orang.
- **Minggu 2:** Bina atau lengkapkan laman web anda (atau satu halaman), dan tetapkan cara tepat anda akan memaparkan nama, alamat, dan nombor telefon anda di mana-mana sahaja mulai sekarang.
- **Minggu 3:** Hantarkan perniagaan anda ke beberapa direktori (termasuk yang ini), dan mula meminta ulasan daripada pelanggan terkini.
- **Minggu 4:** Sediakan WhatsApp Business dan, jika sesuai dengan perniagaan anda, satu Halaman Facebook.

Segala-galanya yang lain akan berkembang dari situ: laman web untuk dirujuk oleh penyenaraian direktori, penyenaraian direktori untuk membina konsistensi yang dihargai oleh enjin carian (dan alat jawapan AI), serta ulasan dan WhatsApp untuk mengubah keterlihatan itu menjadi perbualan sebenar dengan pelanggan.`,
        faqs: [
          {
            question: "Berapa lamakah masa yang diambil untuk perniagaan baharu muncul di carian Google di Malaysia?",
            answer:
              "Profil Perniagaan Google yang telah disahkan boleh muncul di Google Maps dan keputusan carian tempatan dalam masa beberapa hari selepas pengesahan, walaupun keterlihatan penuh biasanya terbina selama beberapa minggu apabila Google mengumpul lebih banyak isyarat — foto, ulasan, dan maklumat konsisten di tempat lain. Laman web baharu pula biasanya mengambil masa lebih lama, selalunya beberapa minggu hingga beberapa bulan, untuk diimbas sepenuhnya dan mendapat kedudukan carian.",
          },
          {
            question: "Adakah Profil Perniagaan Google percuma untuk disediakan?",
            answer:
              "Ya. Mencipta, mengesahkan, dan mengemas kini Profil Perniagaan Google tidak dikenakan sebarang kos — tiada pelan berbayar diperlukan untuk muncul di Google Maps atau keputusan carian tempatan. Satu-satunya kos ialah masa yang diambil untuk mengisinya dengan lengkap dan mengemas kininya.",
          },
          {
            question: "Saya sudah ada Halaman Facebook — adakah saya masih perlukan laman web yang berasingan?",
            answer:
              "Ya, sekiranya kebolehtemuan penting bagi anda. Halaman Facebook bergantung kepada carian dan algoritma Facebook sendiri, manakala kebanyakan orang masih menyemak Google terlebih dahulu sebelum melawat perniagaan yang tidak dikenali. Laman web pula adalah sesuatu yang anda miliki sepenuhnya, yang mendapat kedudukan di Google di bawah nama anda sendiri, dan setiap penyenaraian lain — termasuk Halaman Facebook anda — boleh memaut kembali kepadanya.",
          },
          {
            question: "Apakah maksud \"konsistensi NAP\", dan mengapa ia penting untuk SEO tempatan?",
            answer:
              "NAP merujuk kepada Nama, Alamat, dan Nombor telefon — tiga butiran yang perlu ditulis sama persis di setiap tempat perniagaan anda dipaparkan dalam talian. Enjin carian menganggap maklumat NAP yang konsisten merentasi pelbagai laman sebagai isyarat kepercayaan bahawa penyenaraian itu tepat; maklumat tidak konsisten, seperti nombor telefon berbeza pada direktori berlainan, boleh menyebabkan enjin carian kurang yakin penyenaraian itu merujuk perniagaan yang sama.",
          },
          {
            question: "Berapa banyakkah direktori perniagaan yang perlu saya senaraikan perniagaan saya?",
            answer:
              "Tiada bilangan tetap, tetapi intinya ialah lebih daripada satu — setiap direktori yang sah dan relevan adalah satu lagi tempat untuk ditemui dan satu lagi titik data konsisten yang boleh disahkan oleh enjin carian serta alat AI terhadap perniagaan anda. Mulakan dengan direktori yang relevan dengan industri atau kawasan anda, pastikan butiran setiap penyenaraian sama persis, dan tambah lebih banyak dari semasa ke semasa berbanding cuba melakukan semuanya sekali gus.",
          },
          {
            question: "Patutkah saya membalas ulasan negatif, atau biarkan sahaja?",
            answer:
              "Sentiasa balas, dengan tenang dan spesifik, berbanding membiarkannya tanpa jawapan. Balasan yang bersungguh-sungguh kepada ulasan negatif selalunya lebih meyakinkan bakal pelanggan berbanding satu lagi ulasan lima bintang, kerana ia menunjukkan bagaimana perniagaan itu sebenarnya menangani masalah — dan mengabaikannya pula boleh ditafsirkan sebagai mengesahkan aduan tersebut.",
          },
          {
            question: "Adakah WhatsApp Business percuma, dan apakah bezanya dengan akaun WhatsApp biasa?",
            answer:
              "WhatsApp Business percuma untuk dimuat turun dan digunakan. Ia menambah profil perniagaan, katalog produk, mesej ucapan dan ketiadaan automatik, serta balasan pantas — ciri-ciri yang tiada pada akaun WhatsApp peribadi biasa. Ia berbeza daripada WhatsApp Business Platform/API yang berbayar, yang direka untuk penghantaran mesej automatik berskala besar, bukan untuk perbualan harian sesebuah perniagaan kecil.",
          },
          {
            question: "Apakah cara paling pantas untuk memastikan perniagaan baharu ditemui dalam talian di Malaysia?",
            answer:
              "Tuntut dan lengkapkan sepenuhnya Profil Perniagaan Google terlebih dahulu — ia percuma, biasanya paling pantas menunjukkan hasil berbanding segala-galanya dalam panduan ini, dan merupakan penyenaraian pertama yang disemak oleh kebanyakan orang. Segala-galanya selepas itu (laman web, lebih banyak direktori, ulasan, WhatsApp Business) memberi kesan berganda di atasnya, tetapi Profil Perniagaan Google sahaja sudah memastikan anda ditemui dengan paling pantas.",
          },
        ],
      },
    },
  },
  {
    slug: "how-to-register-a-business-in-malaysia-ssm",
    title: "How to Register a Business in Malaysia: SSM Registration Step by Step",
    seoTitle: "SSM Business Registration in Malaysia: Step-by-Step Guide",
    seoDescription:
      "A step-by-step guide to registering a business in Malaysia with SSM: sole proprietorship vs Sdn Bhd, costs, documents, timelines, and what to do after.",
    coverImage: {
      file: "how-to-register-a-business-in-malaysia-ssm-cover.webp",
      mimeType: "image/webp",
      alt: "A Malaysian business owner reviewing registration paperwork at a desk with a laptop",
      altTranslations: {
        zh: "一位马来西亚企业主在办公桌前查看注册文件,身旁放着笔记本电脑",
        ms: "Seorang pemilik perniagaan Malaysia menyemak dokumen pendaftaran di meja bersama komputer riba",
      },
    },
    contentImages: {
      bankAccount: {
        file: "how-to-register-a-business-in-malaysia-ssm-bank-account.webp",
        mimeType: "image/webp",
        alt: "A business owner opening a business bank account with a bank officer",
        altTranslations: {
          zh: "一位企业主正在银行职员的协助下开设商业银行账户",
          ms: "Seorang pemilik perniagaan membuka akaun bank perniagaan bersama pegawai bank",
        },
        after: "**Opening a business bank account** usually needs more than the registration certificate alone.",
        afterTranslations: {
          zh: "**开设商业银行账户**通常需要的不止是注册证书本身。",
          ms: "**Membuka akaun bank perniagaan** biasanya memerlukan lebih daripada sekadar sijil pendaftaran sahaja.",
        },
      },
    },
    excerpt:
      "A practical walkthrough for Malaysian business owners deciding between registering a sole proprietorship or partnership and incorporating a Sdn Bhd — what each path actually costs, requires, and protects you from. It also covers the post-registration steps people skip: opening a business bank account, displaying your registration number, and the separate local council and sector licenses that SSM registration alone doesn't cover.",
    body: `Every legal business in Malaysia — from a home bakery taking orders over WhatsApp to a five-person consultancy — has to pass through SSM (Suruhanjaya Syarikat Malaysia, the Companies Commission of Malaysia) before it can legally trade, issue a proper invoice, or open a business bank account. What trips up most first-time owners isn't the paperwork itself — it's not knowing which of two very different registration paths actually fits them, and finding out only afterward what each one does and doesn't give them. This guide walks through both paths from name search to post-registration housekeeping, and flags the parts of "being registered" that people routinely assume are covered when they aren't.

## 1. Decide: sole proprietorship/partnership or Sdn Bhd

There are two structurally different ways to register a business with SSM, and the choice shapes almost everything that follows.

A **sole proprietorship** (one owner) or **partnership** (two to twenty owners) is registered under the Registration of Businesses Act 1956. It's simple, cheap, and fast — but legally, there's no separation between you and the business. The business isn't incorporated; it's just you, trading under a registered name.

A **private limited company (Sdn Bhd)** is incorporated under the Companies Act 2016 as a separate legal person. It can own property, sign contracts, and be sued in its own name — and critically, it shields its owners' personal assets in a way a sole proprietorship or partnership cannot.

The practical differences that matter most to a first-time owner:

- **Cost.** A sole proprietorship or partnership is cheap to set up — roughly RM60 for a business name search and registration, though SSM's own fee schedule is the source of truth since this changes. A Sdn Bhd costs more to incorporate, with the fee tiered to share capital, and it carries an ongoing cost a sole proprietorship doesn't: a company secretary's annual fee.
- **Speed.** Business name registration can be approved almost instantly through EzBiz Online if the name is available and the application is clean. Sdn Bhd incorporation usually takes a little longer, since more documents and parties are involved, though it's usually a matter of days, not weeks.
- **Personal liability.** This is the big one. As a sole proprietor or partner, you are personally and unlimited liable for the business's debts — if the business can't pay, creditors can come after your personal assets. A Sdn Bhd's liability is generally limited to what shareholders put into it.
- **Credibility.** Banks, larger suppliers, corporate clients, and government tenders often take a Sdn Bhd more seriously, partly because of the governance and disclosure that comes with incorporation. A sole proprietorship is usually perfectly fine for a business dealing directly with retail customers.
- **Business bank account.** Both structures can open a business bank account, but a sole proprietorship typically opens a "business current account" tied to the owner's name, while a Sdn Bhd opens a true corporate account in the company's own name.
- **Company secretary.** Mandatory for a Sdn Bhd — every private limited company must appoint a licensed company secretary within 30 days of incorporation. A sole proprietorship or partnership needs no secretary at all.

If you're testing an idea, working solo, or running a small retail or service business with modest risk, a sole proprietorship or partnership is usually the faster, cheaper starting point. If you're raising capital, bringing in partners as shareholders, signing larger contracts, or want liability protection from day one, incorporating a Sdn Bhd is usually worth the extra cost and process.

## 2. Register a sole proprietorship or partnership

### Name search and reservation

Start with a name search on EzBiz Online (SSM's self-service portal) to check your preferred business name is available and doesn't infringe on an existing registration or trademark. Once available, you reserve it — a reservation is typically valid for a limited window, so don't search months ahead of when you plan to register.

### Documents you'll need

You'll need a copy of your identity card (or passport for a non-citizen, where permitted), your business address (a home address is fine for most trades, though check whether your tenancy agreement or strata by-laws restrict business use), and the nature of your business expressed through SSM's business activity codes. For a partnership, it's worth drawing up a simple partnership agreement covering profit-sharing and what happens if a partner exits, even though SSM doesn't require one.

### Submission and processing

Submit through EzBiz Online, paying the registration fee online, or in person at an SSM counter or authorized service center if you'd rather have someone walk you through it. For a straightforward application with no name conflicts, approval is often same-day or within one to two business days; anything needing manual review — an unusual name, a flagged activity code — can take longer.

### Renewal — and what happens if you let it lapse

Business registration isn't permanent. You choose a validity period — typically 1, 3, or 5 years — and renew before it expires. If you let it lapse, the registration becomes invalid: you're technically trading under an unregistered name, which is an offence, and your business name can become available for someone else to register out from under you. Renewal is straightforward and cheap compared to the hassle of registering from scratch again, so it's worth calendaring well before the expiry date rather than finding out when a bank or supplier asks for a current registration and you don't have one.

## 3. Incorporate a Sdn Bhd

### Name search via MyCoID/EzBiz

Name search for a company works the same way in principle — through MyCoID 2016 or EzBiz Online — but the rules are stricter. The name can't be identical or confusingly similar to an existing company, can't imply a government or royal connection without approval, and certain words (bank, finance, university, and similar) need sign-off from the relevant regulator before SSM will approve them.

### Appoint a company secretary

This step is mandatory and has no sole-proprietorship equivalent: every Sdn Bhd must appoint a company secretary who is either a member of a prescribed professional body or licensed by SSM, within 30 days of incorporation. The secretary isn't just a formality — they're responsible for statutory filings, maintaining the company's registers, and keeping the company compliant with the Companies Act going forward, so this is a relationship worth choosing carefully rather than rushing.

### Directors and shareholders

A Sdn Bhd needs at least one director and one shareholder (the same person can be both), and at least one director must ordinarily reside in Malaysia — check SSM's current requirement here directly, since the specifics around residency and minimum director counts are exactly the kind of detail that gets refined over time. Shareholders can be individuals or, in many cases, corporate entities, and foreign ownership is permitted for most business activities subject to sector-specific restrictions.

### The Super Form and incorporation documents

Incorporation is done through SSM's Super Form, which consolidates what used to be several separate forms — company particulars, director and shareholder details, registered address, and the company's constitution (optional under the Companies Act 2016; if you don't adopt one, standard default provisions apply). Your company secretary will typically prepare and lodge this on your behalf.

### Processing time and what happens next

Once documents are complete and there are no queries, incorporation is often processed within a few business days. SSM issues a Notice of Registration confirming the company exists as a legal entity — this has effectively replaced the old physical Certificate of Incorporation as proof of incorporation. From there, the company needs to open a corporate bank account, and ongoing obligations begin immediately: filing an annual return with SSM every year, keeping financial records, and (unless the company qualifies for audit exemption) appointing an auditor. None of this is optional housekeeping — it's the tradeoff for the liability protection and credibility a Sdn Bhd provides.

## 4. After you're registered — what owners often miss

Getting the registration certificate or Notice of Registration feels like the finish line, but a few things routinely catch new owners out afterward.

**Display your registration number.** Once registered, your business registration number (and for a Sdn Bhd, the full company name) needs to appear on your signage, invoices, receipts, and official letterhead. Leaving it off isn't just sloppy — it can attract a compound.

**Opening a business bank account** usually needs more than the registration certificate alone. Expect banks to ask for the owners' or directors' identity documents, your SSM business profile (from SSM's e-info system), proof of your business address, and for a Sdn Bhd, a board resolution authorizing the account along with certified copies of the Super Form. Check with your chosen bank beforehand, since requirements vary slightly between banks.

> Registering with SSM makes your business legal. It doesn't make it licensed to operate from your premises, or findable by the customers you're registering it for — those come from separate steps that too many owners quietly assume are already covered.

That first gap matters enough to say plainly: **SSM registration is not a business premise license.** Operating from a physical location — a shoplot, a kitchen, an office — almost always also requires a separate license from your local council (Majlis Perbandaran or Majlis Daerah, or DBKL in Kuala Lumpur), and certain sectors (food, health, education, financial services, and others) need their own regulatory licenses on top of that. That's genuinely a separate topic with its own process per council and per sector, so treat SSM registration as step one of several, not the whole journey.

The second gap is visibility. A registration number doesn't make customers find you — once you're registered, it's worth [listing your business on Gotka](/en/signup) so people searching for what you do can actually find it, and it's worth a look through [what other Malaysian businesses have listed](/en) to see how competitors and nearby businesses present themselves once they're set up.

One last note: SSM's forms, fees, and requirements do get updated — the figures and steps here are accurate as a general guide, but before you submit anything or budget for it, confirm the current details on SSM's own site (ssm-einfo.my or ssm.com.my) rather than treating this guide as the final word.

## Common mistakes that undo all of this

- **Assuming registration equals permission to operate.** A valid SSM registration says nothing about whether your local council allows a business at that address, or whether your sector needs its own license — check both separately.
- **Letting the registration lapse and finding out at the worst time.** The moment a bank, supplier, or tender process asks for a current registration and yours expired six months ago is not the moment to discover it.
- **Treating the company secretary appointment as a later problem for a Sdn Bhd.** It's a 30-day statutory deadline, not a nice-to-have, and leaving it undone creates compliance exposure from day one.

## Where to start

1. Decide your structure first, based on liability and how fast you plan to grow — not on which one sounds more "official."
2. Run a name search on EzBiz Online (or MyCoID for a company) before you commit to a name on signage or packaging.
3. Gather your documents — IC, business address, and for a Sdn Bhd, your prospective director and shareholder details — before you start the online application.
4. For a Sdn Bhd, line up a licensed company secretary early; you'll need them to lodge the Super Form, not just to tick a box afterward.
5. Once you have your registration number, open your business bank account and get your registration displayed on your signage and invoices.
6. Separately, check your local council and sector licensing requirements — don't assume SSM registration covers them.
7. List your business so the registration actually translates into customers finding you.`,
    faqs: [
      {
        question: "How long does it take to register a business with SSM in Malaysia?",
        answer:
          "Sole proprietorship or partnership name registration can be approved almost instantly through EzBiz Online if the name is available, often within a day or two in practice. Incorporating a Sdn Bhd usually takes a little longer because more documents and parties are involved, but it is still typically completed within a few business days once everything is in order. Delays mostly come from name conflicts or missing documents rather than the process itself.",
      },
      {
        question: "Do I need to appoint a company secretary if I register as a sole proprietor or in a partnership?",
        answer:
          "No. A company secretary is a requirement under the Companies Act 2016 for incorporated companies, including a Sdn Bhd, not for a sole proprietorship or partnership registered under the Registration of Businesses Act 1956. Sole proprietors and partners can handle their own SSM filings and renewals directly without appointing anyone.",
      },
      {
        question: "How much does it cost to register a business with SSM?",
        answer:
          "Costs vary by structure: a sole proprietorship or partnership is comparatively cheap, roughly RM60 for a business name search and registration, while incorporating a Sdn Bhd costs more and is tiered to the company's share capital, plus an ongoing company secretary fee. These figures are a general guide only — SSM periodically updates its fee schedule, so check ssm-einfo.my or ssm.com.my for the current amounts before budgeting.",
      },
      {
        question: "Can a foreigner register a business or incorporate a company in Malaysia?",
        answer:
          "Sole proprietorships and partnerships registered under the Registration of Businesses Act are generally restricted to Malaysian citizens and permanent residents. Foreigners wanting to run a business in Malaysia typically do so by incorporating a Sdn Bhd, subject to director residency and sector-specific foreign ownership rules, so it's worth confirming the current requirements with SSM or a company secretary before assuming either path is open to you.",
      },
      {
        question: "What happens if I forget to renew my business registration?",
        answer:
          "If your sole proprietorship or partnership registration lapses, it becomes invalid, and continuing to trade under it can be treated as operating an unregistered business, which is an offence. Your registered business name can also become available for someone else to register once yours lapses. Renewing before the expiry date is far simpler and cheaper than dealing with a lapsed registration later.",
      },
      {
        question: "Is incorporating a Sdn Bhd always better than registering a sole proprietorship?",
        answer:
          "Not necessarily — it depends on your risk, growth plans, and how much process you're ready to take on. A Sdn Bhd offers limited liability and tends to carry more credibility with banks and larger clients, but it comes with a mandatory company secretary, more paperwork, and ongoing compliance obligations like annual returns. Many small, low-risk businesses are genuinely better served starting as a sole proprietorship and converting to a Sdn Bhd later if they grow.",
      },
      {
        question: "Does SSM registration give me permission to operate from my shop or office?",
        answer:
          "No — SSM registration confirms your business exists legally, but it doesn't cover whether your local council (Majlis Perbandaran, Majlis Daerah, or DBKL) permits a business to operate at that specific address. Most physical premises need a separate business premise license from the local council, and certain sectors need additional regulatory licenses on top of that. Treat SSM registration as one step, not the whole process of being allowed to open your doors.",
      },
      {
        question: "Can I complete the entire SSM registration process online?",
        answer:
          "Largely yes — both business name registration and Sdn Bhd incorporation can be started and often completed through SSM's EzBiz Online or MyCoID portals without visiting a counter in person. Some situations, like unusual business names, certain foreign ownership structures, or document queries, may still require additional steps or a visit to an SSM service center. Checking SSM's site before you start tells you if your specific situation qualifies for a fully online process.",
      },
    ],
    translations: {
      zh: {
        title: "如何在马来西亚注册企业:SSM注册分步指南",
        excerpt:
          "面向马来西亚企业主的实用指南,讲解如何在注册独资企业/合伙企业与成立私人有限公司(Sdn Bhd)之间做选择——每条路径实际需要花多少钱、需要什么条件,以及能提供哪些保障。本文还涵盖许多企业主容易忽略的注册后步骤:开设商业银行账户、展示注册号,以及SSM注册本身并不包含的地方议会执照和行业执照。",
        body: `在马来西亚,从靠WhatsApp接单的家庭烘焙坊,到五人规模的咨询公司,每一家合法经营的企业都必须先通过SSM(Suruhanjaya Syarikat Malaysia,马来西亚公司委员会)的注册,才能合法营业、开具正规发票或开设商业银行账户。真正让大多数初次创业者感到困惑的,往往不是文书本身,而是不清楚两条截然不同的注册路径究竟哪一条适合自己,直到注册完成后才发现每条路径各自提供(以及不提供)什么。本文将完整梳理这两条路径——从名称查询到注册后的各项事务——并指出人们常常误以为"注册完成"就已经涵盖、实则并未涵盖的部分。

## 1. 先决定:独资/合伙企业,还是私人有限公司(Sdn Bhd)

在SSM注册企业有两条结构完全不同的路径,你的选择会影响接下来的几乎所有事情。

**独资企业**(一名业主)或**合伙企业**(两至二十名业主)依据《1956年商业登记法令》(Registration of Businesses Act 1956)注册。手续简单、费用低、速度快——但在法律上,你和企业之间没有任何区隔。这类企业并未"法人化";本质上就是你本人以一个注册名称在经营。

**私人有限公司(Sdn Bhd)**依据《2016年公司法令》(Companies Act 2016)注册成立,是一个独立的法人实体。它可以以自己的名义持有财产、签订合同、被起诉——更重要的是,它能以独资企业或合伙企业无法做到的方式,保护业主的个人资产。

对初次创业者而言,以下几点实际差异最为关键:

- **费用。** 独资企业或合伙企业的注册成本较低——商业名称查询及注册大致为RM60左右,但具体金额会变动,应以SSM官方收费表为准。Sdn Bhd的注册费用更高,按注册资本分级收取,并且还会产生独资企业没有的持续性费用:公司秘书的年费。
- **速度。** 如果名称可用且申请资料齐全,通过EzBiz Online注册商业名称几乎可以即时获批。Sdn Bhd的注册通常需要稍长时间,因为涉及的文件和相关方更多,但只要资料齐备,一般也只需几个工作日,而非数周。
- **个人责任。** 这是最关键的区别。作为独资业主或合伙人,你对企业的债务承担个人无限责任——一旦企业无法偿债,债权人可以追讨你的个人资产。Sdn Bhd的责任则通常以股东的出资额为限。
- **信誉度。** 银行、较大的供应商、企业客户以及政府招标项目,往往更认可Sdn Bhd,部分原因在于公司化带来的治理与披露要求。而对于直接面向零售顾客的业务,独资企业通常已经完全够用。
- **商业银行账户。** 两种结构都可以开设商业银行账户,但独资企业通常开立的是挂在业主名下的"商业往来账户",而Sdn Bhd开立的是以公司自身名义开设的真正的企业账户。
- **公司秘书。** 对Sdn Bhd而言是强制要求——每一家私人有限公司都必须在注册成立后30天内委任一名持牌公司秘书。独资企业或合伙企业则完全不需要公司秘书。

如果你只是想试水一个想法、独自经营,或是经营一家风险较低的小型零售或服务业务,独资企业或合伙企业通常是更快、更省钱的起点。如果你需要融资、引入合伙人作为股东、签订较大金额的合同,或者希望从一开始就获得责任保护,那么注册Sdn Bhd所付出的额外成本和手续通常是值得的。

## 2. 注册独资企业或合伙企业

### 名称查询与预留

首先在EzBiz Online(SSM的自助服务平台)上进行名称查询,确认你心仪的商业名称可用,且不会与现有注册或商标冲突。确认可用后即可预留该名称——预留通常只在有限期限内有效,因此不要在计划注册前好几个月就提前查询。

### 需要准备的文件

你需要准备身份证副本(非公民在允许的情况下可使用护照)、商业地址(大多数行业使用住家地址即可,但要确认租约或分层地契条规是否限制商业用途),以及通过SSM的商业活动代码表达清楚的经营性质。对于合伙企业,虽然SSM注册本身并不要求,但建议另行拟定一份简单的合伙协议,明确利润分配方式以及合伙人退出时的处理办法。

### 提交与审批

可以通过EzBiz Online在线提交并缴纳注册费,也可以亲自前往SSM柜台或授权服务中心办理,如果你希望有人全程协助的话。对于名称没有冲突、资料齐全的简单申请,批核往往是当天完成,或在一到两个工作日内完成;需要人工审核的情况——例如名称较为特殊,或经营活动代码被标记——则可能需要更长时间。

### 续期——以及过期后会发生什么

商业注册并非永久有效。你可以选择注册有效期——通常为1年、3年或5年——并需在到期前续期。一旦让注册过期,该注册即失效:你实际上是在以一个未注册的名称营业,这属于违法行为,而你原本的商业名称也可能被他人注册走。相较于重新从头办理注册的麻烦,续期既简单又便宜,因此最好提前在日历上标注到期日,而不是等到银行或供应商要求提供有效注册证明时才发现自己的注册早已过期。

## 3. 注册成立Sdn Bhd(私人有限公司)

### 通过MyCoID/EzBiz查询名称

公司名称查询的原理与上文类似——通过MyCoID 2016或EzBiz Online进行——但规则更为严格。公司名称不能与现有公司名称相同或高度相似,不能在未经批准的情况下暗示与政府或皇室有关联,而某些字眼(如银行、金融、大学等)需要先获得相关监管机构批准,SSM才会予以核准。

### 委任公司秘书

这一步是强制性的,独资企业没有对应的要求:每一家Sdn Bhd都必须在注册成立后30天内,委任一名受认可专业团体成员资格、或持有SSM执照的公司秘书。公司秘书并不只是走个形式——他们负责法定文件的呈报、维护公司的各项登记册,并确保公司持续符合《公司法令》的要求,因此这是一段值得谨慎挑选、而非仓促决定的合作关系。

### 董事与股东

Sdn Bhd至少需要一名董事和一名股东(可以是同一人),且至少须有一名董事通常居住在马来西亚——这一点请直接向SSM确认最新要求,因为有关居住地和最低董事人数的具体规定,正是会随时间调整的细节。股东可以是个人,在许多情况下也可以是法人实体,而大多数行业都允许外资持股,但须遵守相关行业的特定限制。

### Super Form与注册所需文件

公司注册通过SSM的Super Form办理,这份表格整合了过去多份独立表格的内容——公司基本资料、董事与股东详情、注册地址,以及公司章程(《2016年公司法令》下为可选项;若不另行采用,则适用标准的默认条款)。通常由你的公司秘书代为准备并呈交这份表格。

### 审批时间及注册完成后的事项

只要文件齐全且无需进一步查询,注册通常可在几个工作日内完成。SSM会发出一份注册通知书(Notice of Registration),确认公司已作为合法实体成立——这实际上已经取代了旧有的实体版公司注册证书(Certificate of Incorporation),成为证明公司注册成立的文件。此后,公司需要开设企业银行账户,而持续性的义务也随之开始:每年须向SSM呈交周年报表、保存财务记录,并且(除非公司符合审计豁免资格)须委任审计师。这些都不是可有可无的行政手续——而是换取Sdn Bhd所带来的责任保护与信誉的代价。

## 4. 注册完成后——企业主常常忽略的事

拿到注册证书或注册通知书,感觉像是走到了终点,但实际上有几件事常常让新业主后知后觉。

**展示你的注册号。** 注册完成后,你的商业注册号(对Sdn Bhd而言,还包括完整的公司名称)需要出现在招牌、发票、收据和公司官方信头上。遗漏这一点不只是不够严谨——还可能招致罚款。

**开设商业银行账户**通常需要的不止是注册证书本身。银行一般还会要求提供业主或董事的身份证明文件、你的SSM企业资料(取自SSM的e-info系统)、营业地址证明;对Sdn Bhd而言,还需要一份授权开户的董事会决议,以及Super Form的核证副本。建议在前往银行之前先与你选定的银行确认具体所需文件,因为不同银行的要求会略有差异。

> 在SSM完成注册,只是让你的企业合法存在。它并不代表你已获准在该营业地点经营,也不代表你要争取的顾客就能找到你——这些都需要另外的步骤才能实现,而许多业主却在不知不觉中,默认这些都已经一并解决了。

第一个常被忽略的空白,值得直白地说清楚:**SSM注册并不等于营业执照。** 在实体地点经营——无论是店铺、厨房还是办公室——几乎都还需要向当地地方政府(市政局Majlis Perbandaran、县议会Majlis Daerah,吉隆坡则是DBKL)另行申请营业执照,而某些行业(如餐饮、医疗、教育、金融服务等)还需要在此之上另外取得相应的监管执照。这确实是一个独立的课题,各个地方政府、各个行业的流程都不尽相同,因此应将SSM注册视为整个过程中的第一步,而非全部。

第二个常被忽略的空白,是能见度。拥有一个注册号,并不会让顾客自然而然找到你——注册完成后,不妨[在Gotka上为你的企业建立列表](/zh/signup),让搜索相关服务的人能够真正找到你,也值得花点时间[浏览其他马来西亚企业的列表](/zh),看看同行和周边商家在注册完成后是如何展示自己的。

最后补充一点,适用于以上所有内容:SSM的表格、收费与要求确实会不时更新——本文所列的数字与步骤仅作为一般性指引,在你实际提交申请或编列预算之前,请以SSM官方网站(ssm-einfo.my或ssm.com.my)上的最新信息为准,而不要把本文当作最终依据。

## 容易让前面所有努力功亏一篑的常见错误

- **以为注册等于获准营业。** 有效的SSM注册并不能说明当地政府是否允许在该地址经营业务,也不能说明你所在的行业是否需要另外的执照——这两者都需要分别核实。
- **让注册过期,却在最糟的时刻才发现。** 银行、供应商或招标项目要求提供有效注册证明的那一刻,不应该是你才发现自己的注册早已在六个月前过期的时刻。
- **把Sdn Bhd的公司秘书委任当作可以之后再处理的小事。** 这是一个30天的法定期限,不是可有可无的选项,拖延未办会从第一天起就带来合规风险。

## 从哪里开始

1. 先根据责任承担和你计划的发展速度来决定企业结构——而不是看哪个名称听起来更"正式"。
2. 在你把名称印上招牌或包装之前,先在EzBiz Online(公司则用MyCoID)上进行名称查询。
3. 准备好所需文件——身份证、商业地址,如果是Sdn Bhd,还包括拟任董事与股东的详细资料——再开始在线申请。
4. 如果是注册Sdn Bhd,提早物色一位持牌公司秘书;你需要他们来呈交Super Form,而不只是事后补办手续。
5. 拿到注册号后,开设商业银行账户,并将注册信息展示在招牌和发票上。
6. 另外,务必核实当地政府及所在行业的执照要求——不要以为SSM注册已经涵盖了这些。
7. 为你的企业建立列表,让注册真正转化为能找到你的顾客。`,
        faqs: [
          {
            question: "在马来西亚通过SSM注册企业需要多长时间?",
            answer:
              "如果名称可用,通过EzBiz Online注册独资企业或合伙企业的名称,几乎可以即时获批,实际操作中往往一到两天内就能完成。注册Sdn Bhd通常需要稍长一些时间,因为涉及的文件和相关方更多,但只要资料齐备,一般也只需几个工作日即可完成。拖延的主要原因通常是名称冲突或文件缺失,而非流程本身。",
          },
          {
            question: "如果我注册的是独资企业或合伙企业,是否需要委任公司秘书?",
            answer:
              "不需要。公司秘书是《2016年公司法令》对注册成立的公司(包括Sdn Bhd)的要求,并不适用于依据《1956年商业登记法令》注册的独资企业或合伙企业。独资业主和合伙人可以自行处理SSM的申报与续期事宜,无需委任任何人。",
          },
          {
            question: "通过SSM注册企业需要花多少钱?",
            answer:
              "费用因企业结构而异:独资企业或合伙企业的费用相对较低,商业名称查询及注册大致为RM60左右;而注册Sdn Bhd的费用更高,按公司注册资本分级收取,另外还需支付持续性的公司秘书费用。以上数字仅作一般参考——SSM会不时更新其收费表,因此在编列预算前,请到ssm-einfo.my或ssm.com.my查询当前的具体金额。",
          },
          {
            question: "外国人可以在马来西亚注册商业或成立公司吗?",
            answer:
              "依据《商业登记法令》注册的独资企业和合伙企业,一般仅限马来西亚公民和永久居民申请。希望在马来西亚经营业务的外国人,通常会选择注册成立Sdn Bhd,但须遵守董事居住地要求以及特定行业的外资持股限制,因此在认定自己适用哪条路径之前,最好先向SSM或公司秘书确认最新要求。",
          },
          {
            question: "如果我忘记续期商业注册,会发生什么?",
            answer:
              "如果你的独资企业或合伙企业注册过期,该注册即告失效,继续以此营业可能被视为经营未注册业务,这属于违法行为。一旦你的注册过期,原本的商业名称也可能被他人注册走。相比日后处理已过期的注册,在到期前完成续期要简单且便宜得多。",
          },
          {
            question: "注册Sdn Bhd是否总是比注册独资企业更好?",
            answer:
              "不一定——这取决于你所能承受的风险、发展计划,以及你愿意承担多少行政手续。Sdn Bhd提供有限责任保护,在银行和大客户眼中通常也更具信誉,但随之而来的是强制委任公司秘书、更多文书工作,以及周年报表等持续性合规义务。许多规模小、风险低的企业,其实更适合先以独资企业起步,待日后发展壮大后再转为Sdn Bhd。",
          },
          {
            question: "SSM注册是否意味着我已获准在店铺或办公室营业?",
            answer:
              "不是——SSM注册只确认你的企业已合法存在,但并不涵盖当地政府(市政局、县议会,或吉隆坡的DBKL)是否允许在该特定地址经营业务。大多数实体营业地点还需要向当地政府另外申请营业执照,某些行业还需要在此之上取得额外的监管执照。请把SSM注册视为整个「获准开门营业」过程中的一个环节,而非全部。",
          },
          {
            question: "我可以完全在线完成整个SSM注册流程吗?",
            answer:
              "在很大程度上可以——无论是商业名称注册还是Sdn Bhd的成立,都可以通过SSM的EzBiz Online或MyCoID平台在线启动,并且往往无需亲自前往柜台即可完成。但某些情况,例如名称较为特殊、涉及特定的外资持股结构,或文件需要进一步核实,可能仍需额外步骤或前往SSM服务中心办理。建议在开始前先查阅SSM官网,确认你的具体情况是否适用完全在线的流程。",
          },
        ],
      },
      ms: {
        title: "Cara Mendaftarkan Perniagaan di Malaysia: Langkah demi Langkah Pendaftaran SSM",
        excerpt:
          "Panduan praktikal untuk pemilik perniagaan di Malaysia yang perlu membuat keputusan antara mendaftarkan perniagaan tunggal/perkongsian atau menubuhkan syarikat sendirian berhad (Sdn Bhd) — berapa kos sebenar, apa yang diperlukan, dan perlindungan yang ditawarkan oleh setiap laluan. Panduan ini turut merangkumi langkah selepas pendaftaran yang sering terlepas pandang: membuka akaun bank perniagaan, memaparkan nombor pendaftaran anda, serta lesen pihak berkuasa tempatan dan sektor yang tidak termasuk dalam pendaftaran SSM sahaja.",
        body: `Setiap perniagaan yang sah di Malaysia — daripada perusahaan bakeri rumah yang menerima tempahan melalui WhatsApp, hingga firma perunding lima orang — perlu melalui SSM (Suruhanjaya Syarikat Malaysia) sebelum ia boleh beroperasi secara sah, mengeluarkan invois yang betul, atau membuka akaun bank perniagaan. Perkara yang sering mengelirukan pemilik perniagaan kali pertama bukanlah kerja kertas itu sendiri — tetapi ketidakpastian tentang laluan pendaftaran manakah antara dua laluan yang sangat berbeza yang benar-benar sesuai dengan mereka, dan baru menyedari selepas itu apa yang disediakan (dan tidak disediakan) oleh setiap laluan. Panduan ini menerangkan kedua-dua laluan secara menyeluruh — daripada carian nama hinggalah urusan selepas pendaftaran — dan menegaskan bahagian "sudah berdaftar" yang sering disangka pemilik perniagaan sudah termasuk, sedangkan sebenarnya tidak.

## 1. Tentukan: perniagaan tunggal/perkongsian atau Sdn Bhd

Terdapat dua laluan yang berbeza dari segi struktur untuk mendaftarkan perniagaan dengan SSM, dan pilihan ini mempengaruhi hampir segala-galanya yang berikutnya.

**Perniagaan tunggal** (seorang pemilik) atau **perkongsian** (dua hingga dua puluh pemilik) didaftarkan di bawah Akta Pendaftaran Perniagaan 1956. Ia mudah, murah, dan pantas — tetapi dari segi undang-undang, tiada pemisahan antara anda dan perniagaan tersebut. Perniagaan ini tidak diperbadankan; ia hanyalah anda sendiri, berniaga di bawah nama yang berdaftar.

**Syarikat sendirian berhad (Sdn Bhd)** diperbadankan di bawah Akta Syarikat 2016 sebagai entiti undang-undang yang berasingan. Ia boleh memiliki harta, menandatangani kontrak, dan disaman atas namanya sendiri — dan yang lebih penting, ia melindungi aset peribadi pemiliknya dengan cara yang tidak dapat dilakukan oleh perniagaan tunggal atau perkongsian.

Perbezaan praktikal yang paling penting kepada pemilik perniagaan kali pertama:

- **Kos.** Perniagaan tunggal atau perkongsian murah untuk ditubuhkan — lebih kurang RM60 untuk carian nama perniagaan dan pendaftaran, walaupun jadual yuran rasmi SSM adalah rujukan sebenar kerana ini boleh berubah. Sdn Bhd memerlukan kos penubuhan yang lebih tinggi, mengikut tahap modal saham, dan membawa kos berterusan yang tiada pada perniagaan tunggal: yuran tahunan setiausaha syarikat.
- **Kelajuan.** Pendaftaran nama perniagaan boleh diluluskan hampir serta-merta melalui EzBiz Online jika nama itu tersedia dan permohonan itu lengkap. Penubuhan Sdn Bhd biasanya mengambil sedikit masa lebih lama kerana lebih banyak dokumen dan pihak yang terlibat, tetapi ia biasanya masih mengambil masa beberapa hari bekerja sahaja, bukan beberapa minggu, apabila semuanya teratur.
- **Liabiliti peribadi.** Inilah perbezaan yang paling penting. Sebagai pemilik tunggal atau rakan kongsi, anda bertanggungjawab secara peribadi dan tanpa had terhadap hutang perniagaan — jika perniagaan tidak mampu membayar, pemiutang boleh menuntut aset peribadi anda. Liabiliti Sdn Bhd pula umumnya terhad kepada apa yang disumbangkan oleh pemegang saham.
- **Kredibiliti.** Bank, pembekal yang lebih besar, pelanggan korporat, dan tender kerajaan selalunya lebih memandang serius sebuah Sdn Bhd, sebahagiannya kerana tadbir urus dan pendedahan yang disyaratkan ke atas syarikat yang diperbadankan. Perniagaan tunggal biasanya memadai sepenuhnya untuk perniagaan yang berurusan terus dengan pelanggan runcit.
- **Akaun bank perniagaan.** Kedua-dua struktur boleh membuka akaun bank perniagaan, tetapi perniagaan tunggal biasanya membuka "akaun semasa perniagaan" atas nama pemilik, manakala Sdn Bhd membuka akaun korporat sebenar atas nama syarikat itu sendiri.
- **Setiausaha syarikat.** Wajib untuk Sdn Bhd — setiap syarikat sendirian berhad mesti melantik seorang setiausaha syarikat berlesen dalam tempoh 30 hari selepas penubuhan. Perniagaan tunggal atau perkongsian langsung tidak memerlukan setiausaha.

Jika anda sekadar menguji sesuatu idea, bekerja sendirian, atau menjalankan perniagaan runcit atau perkhidmatan kecil dengan risiko yang sederhana, perniagaan tunggal atau perkongsian biasanya merupakan titik permulaan yang lebih pantas dan lebih murah. Jika anda sedang mengumpul modal, membawa masuk rakan kongsi sebagai pemegang saham, menandatangani kontrak yang lebih besar, atau mahukan perlindungan liabiliti sejak awal, menubuhkan Sdn Bhd biasanya berbaloi dengan kos dan proses tambahan tersebut.

## 2. Daftarkan perniagaan tunggal atau perkongsian

### Carian dan tempahan nama

Mulakan dengan carian nama di EzBiz Online (portal layanan sendiri SSM) untuk memastikan nama perniagaan pilihan anda tersedia dan tidak melanggar pendaftaran atau tanda dagangan sedia ada. Setelah tersedia, anda boleh menempah nama tersebut — tempahan biasanya hanya sah dalam tempoh terhad, jadi jangan membuat carian terlalu awal, berbulan-bulan sebelum anda bercadang untuk mendaftar.

### Dokumen yang diperlukan

Anda memerlukan salinan kad pengenalan (atau pasport bagi bukan warganegara, jika dibenarkan), alamat perniagaan (alamat rumah biasanya memadai bagi kebanyakan jenis perniagaan, tetapi semak sama ada perjanjian sewa atau undang-undang kecil strata anda mengehadkan penggunaan untuk perniagaan), serta sifat perniagaan anda yang dinyatakan melalui kod aktiviti perniagaan SSM. Bagi perkongsian, walaupun SSM tidak mewajibkannya untuk pendaftaran, adalah wajar untuk menyediakan perjanjian perkongsian ringkas yang merangkumi pembahagian keuntungan dan apa yang berlaku sekiranya seorang rakan kongsi keluar.

### Penyerahan dan pemprosesan

Serahkan melalui EzBiz Online dengan membayar yuran pendaftaran dalam talian, atau secara bersemuka di kaunter SSM atau pusat perkhidmatan yang diberi kuasa jika anda lebih suka dibimbing sepanjang proses. Bagi permohonan yang mudah tanpa konflik nama, kelulusan selalunya diperoleh pada hari yang sama atau dalam tempoh satu hingga dua hari bekerja; apa-apa yang memerlukan semakan manual — nama yang luar biasa, atau kod aktiviti yang ditanda — boleh mengambil masa lebih lama.

### Pembaharuan — dan apa yang berlaku jika anda membiarkannya luput

Pendaftaran perniagaan bukanlah kekal selama-lamanya. Anda memilih tempoh sah laku — biasanya 1, 3, atau 5 tahun — dan perlu membaharuinya sebelum ia tamat tempoh. Jika anda membiarkannya luput, pendaftaran itu menjadi tidak sah: anda secara teknikalnya berniaga di bawah nama yang tidak berdaftar, yang merupakan satu kesalahan, dan nama perniagaan anda boleh menjadi tersedia untuk didaftarkan oleh orang lain. Pembaharuan adalah mudah dan murah berbanding kesulitan mendaftar semula dari awal, jadi eloklah anda menandakan tarikh tamat tempoh dalam kalendar jauh lebih awal, berbanding baru menyedarinya apabila bank atau pembekal meminta pendaftaran semasa yang anda tidak miliki.

## 3. Menubuhkan Sdn Bhd

### Carian nama melalui MyCoID/EzBiz

Carian nama bagi sebuah syarikat pada dasarnya berfungsi sama — melalui MyCoID 2016 atau EzBiz Online — tetapi peraturannya lebih ketat. Nama tersebut tidak boleh sama atau mengelirukan kerana terlalu serupa dengan syarikat sedia ada, tidak boleh membawa maksud perkaitan dengan kerajaan atau diraja tanpa kelulusan, dan perkataan tertentu (seperti bank, kewangan, universiti) memerlukan kelulusan daripada badan pengawal selia berkenaan sebelum SSM meluluskannya.

### Lantik setiausaha syarikat

Langkah ini adalah wajib dan tiada persamaan dengan perniagaan tunggal: setiap Sdn Bhd mesti melantik seorang setiausaha syarikat yang merupakan ahli badan profesional yang ditetapkan, atau berlesen oleh SSM, dalam tempoh 30 hari selepas penubuhan. Setiausaha syarikat bukan sekadar formaliti — mereka bertanggungjawab terhadap penyerahan dokumen berkanun, menyelenggara daftar-daftar syarikat, dan memastikan syarikat terus mematuhi Akta Syarikat, jadi ini adalah hubungan yang wajar dipilih dengan teliti, bukan dibuat secara tergesa-gesa.

### Pengarah dan pemegang saham

Sdn Bhd memerlukan sekurang-kurangnya seorang pengarah dan seorang pemegang saham (boleh orang yang sama), dan sekurang-kurangnya seorang pengarah mesti bermastautin di Malaysia — sila semak terus dengan SSM keperluan semasa di sini, kerana butiran mengenai mastautin dan bilangan minimum pengarah adalah jenis perincian yang kerap dikemas kini dari semasa ke semasa. Pemegang saham boleh terdiri daripada individu, dan dalam banyak keadaan juga entiti korporat, manakala pemilikan asing dibenarkan bagi kebanyakan aktiviti perniagaan tertakluk kepada sekatan khusus sektor tertentu.

### Super Form dan dokumen penubuhan

Penubuhan dilakukan melalui Super Form SSM, yang menggabungkan apa yang dahulunya beberapa borang berasingan — butiran syarikat, butiran pengarah dan pemegang saham, alamat berdaftar, serta perlembagaan syarikat (pilihan di bawah Akta Syarikat 2016; jika anda tidak menggunakannya, peruntukan lalai standard akan terpakai). Setiausaha syarikat anda biasanya akan menyediakan dan menyerahkan borang ini bagi pihak anda.

### Tempoh pemprosesan dan apa yang berlaku seterusnya

Apabila dokumen lengkap dan tiada pertanyaan tambahan, penubuhan selalunya diproses dalam beberapa hari bekerja. SSM akan mengeluarkan Notis Pendaftaran yang mengesahkan syarikat itu wujud sebagai entiti undang-undang — ini pada dasarnya telah menggantikan Sijil Pemerbadanan fizikal yang lama sebagai bukti penubuhan. Selepas itu, syarikat perlu membuka akaun bank korporat, dan kewajipan berterusan bermula serta-merta: menyerahkan penyata tahunan kepada SSM setiap tahun, menyimpan rekod kewangan, dan (melainkan syarikat layak untuk pengecualian audit) melantik juruaudit. Semua ini bukan kerja pentadbiran pilihan — ia adalah pertukaran bagi perlindungan liabiliti dan kredibiliti yang ditawarkan oleh sebuah Sdn Bhd.

## 4. Selepas anda berdaftar — perkara yang sering terlepas pandang

Menerima sijil pendaftaran atau Notis Pendaftaran mungkin terasa seperti garis penamat, tetapi terdapat beberapa perkara yang sering menjengkelkan pemilik perniagaan baharu selepas itu.

**Paparkan nombor pendaftaran anda.** Selepas berdaftar, nombor pendaftaran perniagaan anda (dan bagi Sdn Bhd, nama penuh syarikat) perlu dipaparkan pada papan tanda, invois, resit, dan kepala surat rasmi anda. Mengetepikan perkara ini bukan sahaja tidak kemas — ia juga boleh mengakibatkan kompaun.

**Membuka akaun bank perniagaan** biasanya memerlukan lebih daripada sekadar sijil pendaftaran sahaja. Jangkakan bank meminta dokumen pengenalan diri pemilik atau pengarah, profil perniagaan SSM anda (diambil daripada sistem e-info SSM), bukti alamat perniagaan anda, dan bagi Sdn Bhd, resolusi lembaga pengarah yang membenarkan pembukaan akaun berserta salinan Super Form yang disahkan. Eloklah anda menyemak dengan bank pilihan anda apa yang mereka perlukan sebelum pergi, kerana keperluan sedikit berbeza antara satu bank dengan bank yang lain.

> Mendaftar dengan SSM menjadikan perniagaan anda sah dari segi undang-undang. Ia tidak menjadikannya berlesen untuk beroperasi di premis anda, atau mudah dijumpai oleh pelanggan yang anda daftarkan perniagaan ini untuk mereka — itu semua datang daripada langkah-langkah berasingan yang sering disangka pemilik perniagaan sudah termasuk, sedangkan sebenarnya tidak.

Jurang pertama ini penting untuk dinyatakan dengan jelas: **pendaftaran SSM bukanlah lesen premis perniagaan.** Beroperasi dari lokasi fizikal — lot kedai, dapur, atau pejabat — hampir selalu juga memerlukan lesen berasingan daripada pihak berkuasa tempatan anda (Majlis Perbandaran atau Majlis Daerah, atau DBKL di Kuala Lumpur), dan sektor-sektor tertentu (makanan, kesihatan, pendidikan, perkhidmatan kewangan, dan lain-lain) memerlukan lesen pengawalseliaan tersendiri di atas itu. Ini sememangnya satu topik berasingan dengan prosesnya sendiri mengikut setiap majlis dan setiap sektor, jadi anggaplah pendaftaran SSM sebagai langkah pertama daripada beberapa langkah, bukan keseluruhan perjalanan.

Jurang kedua ialah keterlihatan. Nombor pendaftaran tidak dengan sendirinya menjadikan pelanggan menjumpai anda — setelah berdaftar, eloklah anda [senaraikan perniagaan anda di Gotka](/ms/signup) supaya orang yang mencari apa yang anda tawarkan benar-benar dapat menjumpainya, dan juga berbaloi untuk [meninjau apa yang disenaraikan oleh perniagaan Malaysia lain](/ms) untuk melihat bagaimana pesaing dan perniagaan berdekatan mempersembahkan diri mereka setelah mereka bersedia.

Satu nota terakhir yang terpakai kepada semua perkara di atas: borang, yuran, dan keperluan SSM memang dikemas kini dari semasa ke semasa — angka dan langkah dalam panduan ini adalah tepat sebagai panduan am, tetapi sebelum anda menghantar apa-apa permohonan atau membuat belanjawan untuknya, sahkan butiran semasa di laman web SSM sendiri (ssm-einfo.my atau ssm.com.my), bukannya menganggap panduan ini sebagai kata putus.

## Kesilapan biasa yang menggagalkan semua usaha ini

- **Menganggap pendaftaran bermaksud kebenaran untuk beroperasi.** Pendaftaran SSM yang sah tidak memberitahu sama ada pihak berkuasa tempatan anda membenarkan perniagaan di alamat tersebut, atau sama ada sektor anda memerlukan lesennya sendiri — kedua-duanya perlu disemak secara berasingan.
- **Membiarkan pendaftaran luput dan baru menyedarinya pada saat yang paling tidak sesuai.** Saat bank, pembekal, atau proses tender meminta pendaftaran semasa dan pendaftaran anda telah tamat tempoh enam bulan lalu bukanlah saat yang sesuai untuk menyedari perkara ini.
- **Menganggap lantikan setiausaha syarikat bagi Sdn Bhd sebagai perkara yang boleh diuruskan kemudian.** Ia adalah tarikh akhir berkanun selama 30 hari, bukan sesuatu yang boleh ditangguhkan, dan membiarkannya tidak selesai mewujudkan risiko pematuhan sejak hari pertama.

## Dari mana hendak bermula

1. Tentukan struktur anda dahulu, berdasarkan liabiliti dan kelajuan pertumbuhan yang anda rancangkan — bukan berdasarkan nama mana yang kedengaran lebih "rasmi".
2. Jalankan carian nama di EzBiz Online (atau MyCoID bagi syarikat) sebelum anda mengesahkan nama pada papan tanda atau pembungkusan.
3. Kumpulkan dokumen anda — kad pengenalan, alamat perniagaan, dan bagi Sdn Bhd, butiran bakal pengarah dan pemegang saham — sebelum memulakan permohonan dalam talian.
4. Bagi Sdn Bhd, cari seorang setiausaha syarikat berlesen lebih awal; anda memerlukan mereka untuk menyerahkan Super Form, bukan sekadar sebagai syarat yang ditandakan selepas itu.
5. Setelah mendapat nombor pendaftaran anda, buka akaun bank perniagaan anda dan pastikan pendaftaran anda dipaparkan pada papan tanda dan invois.
6. Secara berasingan, semak keperluan lesen pihak berkuasa tempatan dan sektor anda — jangan menganggap pendaftaran SSM telah merangkumi semuanya.
7. Senaraikan perniagaan anda supaya pendaftaran itu benar-benar membawa kepada pelanggan yang menjumpai anda.`,
        faqs: [
          {
            question: "Berapa lama masa yang diperlukan untuk mendaftarkan perniagaan dengan SSM di Malaysia?",
            answer:
              "Pendaftaran nama perniagaan tunggal atau perkongsian boleh diluluskan hampir serta-merta melalui EzBiz Online jika nama itu tersedia, dan selalunya siap dalam masa satu hingga dua hari dalam amalan sebenar. Penubuhan Sdn Bhd biasanya mengambil masa sedikit lebih lama kerana lebih banyak dokumen dan pihak yang terlibat, tetapi ia tetap biasanya siap dalam beberapa hari bekerja apabila semuanya teratur. Kelewatan kebanyakannya berpunca daripada konflik nama atau dokumen yang tidak lengkap, bukan proses itu sendiri.",
          },
          {
            question: "Perlukah saya melantik setiausaha syarikat jika saya mendaftar sebagai pemilik tunggal atau perkongsian?",
            answer:
              "Tidak. Setiausaha syarikat adalah keperluan di bawah Akta Syarikat 2016 bagi syarikat yang diperbadankan, termasuk Sdn Bhd, bukan bagi perniagaan tunggal atau perkongsian yang didaftarkan di bawah Akta Pendaftaran Perniagaan 1956. Pemilik tunggal dan rakan kongsi boleh menguruskan sendiri penyerahan dan pembaharuan SSM mereka tanpa perlu melantik sesiapa.",
          },
          {
            question: "Berapakah kos untuk mendaftarkan perniagaan dengan SSM?",
            answer:
              "Kos berbeza mengikut struktur: perniagaan tunggal atau perkongsian agak murah, lebih kurang RM60 untuk carian nama perniagaan dan pendaftaran, manakala penubuhan Sdn Bhd memerlukan kos yang lebih tinggi dan mengikut tahap modal saham syarikat, ditambah pula dengan yuran setiausaha syarikat yang berterusan. Angka-angka ini hanyalah panduan am — SSM mengemas kini jadual yurannya dari semasa ke semasa, jadi semak di ssm-einfo.my atau ssm.com.my untuk jumlah semasa sebelum membuat belanjawan.",
          },
          {
            question: "Bolehkah warga asing mendaftarkan perniagaan atau menubuhkan syarikat di Malaysia?",
            answer:
              "Perniagaan tunggal dan perkongsian yang didaftarkan di bawah Akta Pendaftaran Perniagaan umumnya terhad kepada warganegara Malaysia dan penduduk tetap. Warga asing yang ingin menjalankan perniagaan di Malaysia biasanya berbuat demikian dengan menubuhkan Sdn Bhd, tertakluk kepada keperluan mastautin pengarah dan peraturan pemilikan asing khusus sektor, jadi eloklah mengesahkan keperluan semasa dengan SSM atau setiausaha syarikat sebelum menganggap mana-mana laluan itu terbuka kepada anda.",
          },
          {
            question: "Apa yang berlaku jika saya terlupa membaharui pendaftaran perniagaan saya?",
            answer:
              "Jika pendaftaran perniagaan tunggal atau perkongsian anda luput, ia menjadi tidak sah, dan terus berniaga di bawahnya boleh dianggap sebagai mengendalikan perniagaan yang tidak berdaftar, iaitu satu kesalahan. Nama perniagaan berdaftar anda juga boleh menjadi tersedia untuk didaftarkan oleh orang lain sebaik sahaja ia luput. Membaharui sebelum tarikh tamat tempoh jauh lebih mudah dan murah berbanding menguruskan pendaftaran yang telah luput kemudian.",
          },
          {
            question: "Adakah menubuhkan Sdn Bhd sentiasa lebih baik daripada mendaftarkan perniagaan tunggal?",
            answer:
              "Tidak semestinya — ia bergantung kepada risiko, rancangan pertumbuhan anda, dan sejauh mana anda bersedia menguruskan proses tambahan. Sdn Bhd menawarkan liabiliti terhad dan cenderung membawa lebih kredibiliti dengan bank dan pelanggan yang lebih besar, tetapi ia disertai dengan lantikan setiausaha syarikat yang wajib, lebih banyak kerja kertas, dan kewajipan pematuhan berterusan seperti penyata tahunan. Banyak perniagaan kecil dan berisiko rendah sebenarnya lebih sesuai bermula sebagai perniagaan tunggal dan ditukar kepada Sdn Bhd kemudian apabila ia berkembang.",
          },
          {
            question: "Adakah pendaftaran SSM memberikan saya kebenaran untuk beroperasi dari kedai atau pejabat saya?",
            answer:
              "Tidak — pendaftaran SSM hanya mengesahkan bahawa perniagaan anda wujud secara sah, tetapi tidak merangkumi sama ada pihak berkuasa tempatan anda (Majlis Perbandaran, Majlis Daerah, atau DBKL) membenarkan perniagaan beroperasi di alamat tertentu itu. Kebanyakan premis fizikal memerlukan lesen premis perniagaan berasingan daripada pihak berkuasa tempatan, dan sektor-sektor tertentu memerlukan lesen pengawalseliaan tambahan di atas itu. Anggaplah pendaftaran SSM sebagai satu langkah, bukan keseluruhan proses untuk dibenarkan membuka perniagaan anda.",
          },
          {
            question: "Bolehkah saya menyelesaikan keseluruhan proses pendaftaran SSM secara dalam talian?",
            answer:
              "Secara besarnya, ya — baik pendaftaran nama perniagaan mahupun penubuhan Sdn Bhd boleh dimulakan dan selalunya diselesaikan sepenuhnya melalui portal EzBiz Online atau MyCoID SSM tanpa perlu hadir ke kaunter secara bersemuka. Sesetengah keadaan, seperti nama perniagaan yang luar biasa, struktur pemilikan asing tertentu, atau pertanyaan berkaitan dokumen, mungkin masih memerlukan langkah tambahan atau lawatan ke pusat perkhidmatan SSM. Menyemak laman web SSM sebelum anda bermula akan memberitahu anda sama ada keadaan khusus anda layak untuk proses sepenuhnya dalam talian.",
          },
        ],
      },
    },
  },
  {
    slug: "business-licenses-and-permits-in-malaysia",
    title: "Business Licenses and Permits in Malaysia: What You Need Before You Open",
    seoTitle: "Business Licenses and Permits in Malaysia: A Guide",
    seoDescription:
      "A practical guide to the business premise license, signboard license, Bomba approval, and sector-specific permits you need before opening in Malaysia.",
    coverImage: {
      file: "business-licenses-and-permits-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A proud Malaysian small business owner holding a business license certificate in front of their shopfront",
      altTranslations: {
        zh: "一位自豪的马来西亚小企业主在店门前拿着营业执照",
        ms: "Seorang pemilik perniagaan kecil Malaysia yang bangga memegang sijil lesen perniagaan di hadapan kedainya",
      },
    },
    contentImages: {
      signboard: {
        file: "business-licenses-and-permits-in-malaysia-signboard.webp",
        mimeType: "image/webp",
        alt: "A worker installing a signboard above a small shop storefront",
        altTranslations: {
          zh: "一名工人正在小商店门面上方安装招牌",
          ms: "Seorang pekerja memasang papan tanda di atas sebuah kedai kecil",
        },
        after:
          "Any exterior signage — your main shopfront sign, a lightbox, a hanging sign, banners — needs its own license from the same local council: the lesen papan tanda, or lesen iklan.",
        afterTranslations: {
          zh: "任何外部招牌——无论是正门招牌、灯箱、悬挂式招牌还是横幅——都需要向同一个地方议会单独申请执照,即 lesen papan tanda 或 lesen iklan。",
          ms: "Sebarang papan tanda luaran — papan tanda utama kedai anda, lightbox, papan tanda tergantung, sepanduk — memerlukan lesennya sendiri daripada majlis tempatan yang sama: lesen papan tanda, atau lesen iklan.",
        },
      },
    },
    excerpt:
      "Once your business is registered with SSM, a separate stack of approvals decides whether you can actually open the doors — the local council's premise and signboard licenses, Bomba's fire safety sign-off, and whatever certification your sector requires on top. This guide walks through what a typical Malaysian business needs, in the order that actually works, plus the delays and costs to realistically expect along the way.",
    body: `Registering your business with SSM gets you a certificate and a legal identity. It doesn't get you permission to actually open your doors. That permission comes from a separate, and much less talked about, stack of licenses and approvals — issued mostly by your local council, with a few sector-specific regulators layered on top depending on what you do. This guide picks up where SSM registration leaves off: once your business is registered and you're ready to find and fit out a physical premises, here's what you still need before you can legally trade.

Every one of these is administered locally or by sector, which means two businesses doing the same thing in two different towns can face different forms, different documents, and different fees. Treat the specifics below as a map of what to expect, not a fixed price list — the only way to get exact requirements is to ask the council and regulator that actually cover your business.

## 1. The business premise license, from your local council

The core license nearly every physical business needs is the business premise license — lesen premis perniagaan — issued by the Majlis Perbandaran, Majlis Bandaraya, or Majlis Daerah (the local council, or Pihak Berkuasa Tempatan/PBT) covering the exact address where you operate. If you have a shop, a café, a salon, an office that sees clients, or a workshop with a physical address, you need this, full stop. It's entirely separate from your SSM registration: SSM makes your business exist as a legal entity or trade name; the premise license is the local authority's permission for that entity to operate at that specific address.

There's no single national system for this — each council runs its own application process, whether that's DBKL in Kuala Lumpur, MBPJ in Petaling Jaya, MBSA in Shah Alam, MPAJ in Ampang Jaya, or any of the dozens of others across the country. You apply to whichever one covers your premises.

### What you'll typically need to submit
- Your SSM business registration or company profile
- Identification documents for the owner(s) or directors
- A tenancy agreement or proof of ownership for the premises
- A floor plan and photographs of the premises
- Sometimes a letter of consent from the landlord, or from the joint management body if you're in a strata-titled shoplot or mall

The license fee itself is usually modest — often in the low hundreds of ringgit, though this varies considerably by council, by business category, and by the floor area of your premises — and it's typically renewed annually. A quick way to sanity-check whether a location even suits your business is to browse what's already listed nearby on [Gotka](/en); if a street is full of clinics and offices and nothing retail, that's often a sign of how the area is zoned before you've asked anyone.

## 2. The signboard license — a separate, often-missed application

Putting up a shop sign feels like part of opening, not a separate bureaucratic step — which is exactly why so many new owners miss it. Any exterior signage — your main shopfront sign, a lightbox, a hanging sign, banners — needs its own license from the same local council: the lesen papan tanda, or lesen iklan. It is not covered by your premise license, even though both come from the same office.

Fees for this one are usually scaled to the signboard's size (often per square foot) and whether it's illuminated, and it generally needs renewing on a similar annual cycle to the premise license. Because it's handled by the same council department, it's worth applying for it at the same time as your premise license rather than treating it as an afterthought once the sign is already up — a sign installed without approval can mean a compound, or simply an order to take it down right after you've paid to put it up.

## 3. Fire safety (Bomba) approval

For most commercial premises above a certain size, or of certain types — multi-storey units, kitchens with cooking equipment, premises where the public gathers, workshops or factories handling flammable materials — you'll need approval from the Jabatan Bomba dan Penyelamat Malaysia (JBPM), Malaysia's Fire and Rescue Department, commonly just called Bomba.

A Bomba inspection checks things like fire extinguishers and their placement, clearly marked and unobstructed emergency exits, fire alarm and detection systems where required, adequate exit widths, and compliant electrical and gas installations. The specific threshold that triggers this — floor area, number of storeys, occupancy load — is set jointly by the council and Bomba, and it differs from one council to another, so it's worth confirming directly rather than assuming your premises is exempt.

This step is worth planning for early, because it commonly becomes the bottleneck in the whole process: Bomba generally needs your renovation and fit-out to already be complete and matching what you submitted before they'll even schedule an inspection, and most councils won't issue the premise license until Bomba has signed off.

## 4. Sector-specific licenses to check for your business

The premise license, signboard license, and Bomba approval are the general layer almost every physical business deals with. On top of that, many sectors carry their own specific licensing requirements.

### If you're in food and beverage
- You'll need health and food handling certification from your local council's health department, covering things like kitchen hygiene, food storage, and pest control.
- Anyone who handles food or utensils needs a typhoid injection and a food handler's health card, obtained through a health screening at a government clinic or an approved panel clinic, and renewed periodically.

### For other sectors
Childcare centres register with the Social Welfare Department (JKM); education and tuition centres typically register with the Ministry of Education; manpower and employment agencies are licensed under the Ministry of Human Resources; money services businesses such as money changing or remittance are licensed by Bank Negara Malaysia; and beauty, spa, and wellness businesses often have their own additional local requirements on top of the general premise license. This isn't an exhaustive list, and it isn't meant to be — sector rules also get updated more often than the general three above, so build in a little slack. The reliable move is to check directly with your local council and the ministry or regulator that oversees your specific industry for what applies to you.

## 5. Halal certification — optional, but commercially valuable

Unlike everything above, Halal certification isn't a legal requirement to operate. It's an optional certification, issued by JAKIM (Jabatan Kemajuan Islam Malaysia) or a JAKIM-recognised state Islamic religious department (JAIN), that confirms your products or premises meet Halal standards. For food and beverage businesses, and for cosmetics or pharmaceutical products, it's one of the most commercially valuable certifications available in a Muslim-majority market — it signals trust to a large share of your potential customers before they've tried anything you sell.

The process runs on its own track and takes longer than the general licenses above: it involves a formal application, a review of your ingredients and supply chain, and a physical audit of your premises or factory against the Halal standard (MS 1500). Certification is valid for a set period and needs renewing. Because of the extra documentation and the audit, most businesses only start this process once their premises, suppliers, and basic operations are already stable — not as something to chase in the same week as the premise license.

## 6. Getting the sequencing right

Laid out in the order that actually works, the sequence looks roughly like this: confirm your premises is zoned and approved for the type of business you're running, before you sign a tenancy agreement. Complete your renovation and fit-out to a standard that will pass both fire safety and, if relevant, health department inspection. Apply for Bomba approval where your business requires it — this is frequently a supporting document the council needs before it will issue the premise license. Submit the premise license application itself. Apply for the signboard license, ideally alongside it. Arrange any sector-specific certification your business needs, such as food handling certification and staff health cards, which can often run in parallel with the premise license application. Consider Halal certification once you're operational and stable, if it fits your market.

> A business license isn't paperwork to clear on the way to opening — it's the set of approvals that makes everything else about the business enforceable, insurable, and real in the eyes of the authorities who can otherwise shut it down.

Realistic timelines vary enormously by council workload and how complete your application is, but a straightforward case commonly runs a few weeks to a couple of months from a complete submission. The delays that stretch it further are almost always the same three: incomplete documents (a missing tenancy agreement, floor plan, or IC copy sends the whole file back), premises that turn out not to be zoned or approved for your type of business once the council actually looks, and renovation that isn't finished — or doesn't match what was submitted — when an inspection is scheduled, forcing it to be rebooked.

Operating without the licenses you need carries real consequences, stated plainly rather than as a scare tactic: local councils can issue compounds (fines) for operating without a premise or signboard license, can order a business to stop operating or close the premises, and repeated non-compliance can affect your ability to get licenses approved in future. None of this is unusual or severe when caught early — it's simply the practical reason it's worth getting the paperwork right before you open rather than after.

Once your licenses are in hand and the doors are genuinely open, it's worth putting that compliance work to use. [Listing your business on Gotka](/en/signup) means the customers searching locally for exactly what you offer can actually find you — the same local visibility this stack of approvals exists to make possible.

## Common mistakes that undo all of this

- **Applying for the premise license and assuming the signboard is covered.** They're separate applications to the same council, and skipping the second one is the single most common gap new owners discover only after their sign is already up.
- **Signing a tenancy agreement before checking zoning.** A premises that looks right can still be zoned for a different type of business entirely, and that's not something a landlord is obliged to flag for you.
- **Booking a Bomba or health inspection before renovation is actually finished.** An inspection against work that isn't complete, or doesn't match the plans submitted, usually means a failed inspection and a second booking — which is where most of the lost time in this whole process comes from.

## Where to start

- **Before signing anything**: confirm with the local council that the premises is zoned and approved for your type of business.
- **While finalising the premises**: start gathering your SSM documents, tenancy agreement, floor plan, and photographs for the premise license application.
- **During renovation**: build to a standard that will pass a Bomba inspection, if your business requires one, and get that inspection done before you expect the premise license to be issued.
- **Once the premises is ready**: submit the premise license and signboard license applications together at your local council.
- **Before opening, if you're F&B**: arrange food handler health screenings and apply for food handling certification with the council's health department.
- **Once you're stable and open**: look into Halal certification if it genuinely fits your market, and treat everything in this guide as a starting map — confirm the current forms, documents, and fees with your own council directly, since they do change.`,
    faqs: [
      {
        question: "Do I still need a business premise license if I've already registered my business with SSM?",
        answer:
          "Yes — SSM registration and the business premise license are two separate things. SSM registration makes your business a recognised legal entity or trade name, while the premise license is permission from your local council to operate at a specific physical address. Almost every business with a shop, office, or other physical premises needs both.",
      },
      {
        question: "Which authority do I apply to for a business premise license in Malaysia?",
        answer:
          "You apply to the local council — the Majlis Perbandaran, Majlis Bandaraya, or Majlis Daerah — that covers the exact address of your premises, such as DBKL in Kuala Lumpur or MBPJ in Petaling Jaya. There's no single national portal for this, since each council runs its own application process and requirements. Check directly with the council covering your address for its specific forms and documents.",
      },
      {
        question: "How much does a business premise license cost in Malaysia?",
        answer:
          "The fee varies by council, by business category, and by the floor area of your premises, so there's no single fixed figure. It's often in the low hundreds of ringgit for the license itself, though this can be higher for larger premises or certain business types. Confirm the exact fee with your local council before budgeting for it.",
      },
      {
        question: "Is Bomba fire department approval required before I can open my business?",
        answer:
          "For most commercial premises above a certain size, or of certain types such as multi-storey units or kitchens with cooking equipment, yes — Bomba approval is typically required before your local council will issue the premise license. A Bomba inspection checks things like fire extinguishers, emergency exits, and alarm systems. Very small or low-risk premises may be exempt, but this is decided by the council and Bomba jointly, so it's worth confirming rather than assuming.",
      },
      {
        question: "What's the difference between a premise license and a signboard license?",
        answer:
          "The premise license gives you permission to operate your business at a specific address, while the signboard license is separate approval specifically for any exterior signage, such as your shopfront sign or a lightbox. Both are issued by the same local council but require separate applications and separate fees. New business owners often apply for only the first and are caught out when their signage needs its own approval too.",
      },
      {
        question: "Is Halal certification mandatory for food and beverage businesses in Malaysia?",
        answer:
          "No, Halal certification is optional rather than a legal requirement to operate. It's issued by JAKIM or a JAKIM-recognised state Islamic religious department, and it's commercially valuable for food, cosmetics, and pharmaceutical businesses that want to build trust with Malaysia's Muslim-majority market. Many businesses pursue it once their operations are already stable, since the application process includes a premises or factory audit.",
      },
      {
        question: "What happens if I operate a business in Malaysia without the licenses it needs?",
        answer:
          "Local councils can issue compounds, which are fines, for operating without a required premise or signboard license. They can also order the business to stop operating or close the premises until the right approvals are in place, and repeated non-compliance can make it harder to get licenses approved in future. These are routine enforcement outcomes rather than rare or extreme ones, which is why it's worth sorting licensing out before opening.",
      },
      {
        question: "How long does it take to get all the licenses needed to open a business in Malaysia?",
        answer:
          "It varies significantly by council workload and how complete your application is, but a straightforward case commonly takes a few weeks to a couple of months from a complete submission. The most common causes of delay are incomplete documents, premises that turn out not to be zoned for your type of business, and renovations that aren't finished or don't match what was submitted when an inspection is scheduled. Starting the process as early as possible, and confirming requirements with your council upfront, is the best way to avoid these delays.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚营业执照与许可证:开业前你需要准备什么",
        excerpt:
          "企业完成 SSM 注册之后,真正决定你能否开门营业的,是另一套审批——地方议会核发的营业执照与招牌执照、Bomba 的消防安全批准,以及你所属行业可能要求的各项认证。本指南将按照实际可行的顺序,说明一家典型的马来西亚企业需要办理哪些手续,以及过程中应该预期的延误与费用。",
        body: `在 SSM 完成商业注册,能让你拿到证书、获得合法身份,但并不代表你可以就此开门营业。真正决定你能否营业的,是另一套较少被提及的执照与审批流程——主要由你所在地的地方议会发出,再加上若干行业专属的监管机构,视你的业务类型而定。本指南从 SSM 注册完成之后讲起:一旦企业完成注册、准备寻找并装修实体店面,接下来你还需要办理哪些手续才能合法营业。

每一项执照都由地方或行业主管机构各自管理,这意味着即使是同类型的生意,在不同市镇申请所需的表格、文件和费用也可能不同。请把下文内容当作一份预期地图,而非固定的价目表——要获得准确的要求,唯一的办法是直接询问负责你所在地点和行业的议会与监管机构。

## 1. 地方议会核发的营业执照

几乎每一家有实体店面的企业都需要的核心执照,就是营业执照——马来文称为 lesen premis perniagaan,由管辖你营业地址的 Majlis Perbandaran(市议会)、Majlis Bandaraya(市政局)或 Majlis Daerah(县议会,统称地方议会/Pihak Berkuasa Tempatan,PBT)核发。只要你开的是店铺、咖啡馆、美容院、有客户上门的办公室,或是有实体地址的工作坊,都必须申请这项执照,没有例外。它与你的 SSM 注册完全是两回事:SSM 让你的企业成为合法实体或商号;营业执照则是地方政府允许该实体在这一具体地址营业的许可。

这项申请并没有统一的全国系统——每个地方议会都有自己的申请流程,例如吉隆坡的 DBKL、八打灵再也的 MBPJ、莎阿南的 MBSA、安邦再也的 MPAJ,以及全国其他数十个议会。你需要向管辖你店面所在地的那一个议会提出申请。

### 通常需要提交的文件
- SSM 商业注册证书或公司资料
- 业主或董事的身份证明文件
- 店面的租赁合约或产权证明
- 店面平面图及现场照片
- 若店面位于分层地契商场或商业区,有时还需业主或管理机构出具的同意书

执照本身的费用通常不算高——往往是数百令吉左右,具体视议会、行业类别及店面面积而有所不同——一般每年需要续期一次。想初步判断某个地点是否适合你的生意,一个简单的方法是先到 [Gotka](/zh) 看看附近已经有哪些商家挂牌;如果一整条街都是诊所和办公室、几乎没有零售店,这往往已经透露了该区域的用途分区情况,不必等到询问才知道。

## 2. 招牌执照——一项常被新手忽略的独立申请

挂一块店招在很多人看来只是开业的一部分,而不是另一道行政手续——这正是许多新店主忽略它的原因。任何外部招牌——无论是正门招牌、灯箱、悬挂式招牌还是横幅——都需要向同一个地方议会单独申请执照,即 lesen papan tanda 或 lesen iklan。即使出自同一个部门,它也不包含在你的营业执照之内。

这项执照的费用通常按招牌尺寸计算(常以平方尺为单位),并视乎是否带灯光照明,续期周期也大致与营业执照相同,通常为一年一次。由于由同一个议会部门处理,建议与营业执照同时申请,而不是等招牌都装好了才想起这回事——未经批准就安装招牌,轻则被罚款(compound),重则可能在你刚花钱装好招牌后就被勒令拆除。

## 3. 消防安全(Bomba)批准

对于面积超过一定规模,或属于特定类型的商业场所——例如多层建筑、设有烹饪设备的厨房、会有公众聚集的场所,或处理易燃物料的工厂与工作坊——你都需要取得 Jabatan Bomba dan Penyelamat Malaysia(JBPM,马来西亚消防与拯救局,通常简称 Bomba)的批准。

Bomba 的检查项目包括灭火器及其摆放位置、标示清楚且畅通无阻的紧急出口、按要求设置的火警警报与侦测系统、足够宽度的逃生通道,以及合规的电气与燃气装置。具体触发这项要求的门槛——店面面积、楼层数目、容纳人数——由议会与 Bomba 共同设定,且各议会之间并不完全一致,因此务必直接确认,而不要想当然地认为自己的场所可以豁免。

这一步值得尽早规划,因为它往往会成为整个流程中最容易卡住的一环:Bomba 通常要求装修工程已经完成、且与你提交的图纸相符,才会安排检查;而大多数议会在 Bomba 批准之前,也不会核发营业执照。

## 4. 需留意的行业专属执照

营业执照、招牌执照与 Bomba 批准,是几乎所有实体商业都要面对的通用层面。在此之上,许多行业还有各自专属的执照要求。

### 若你从事餐饮业
- 你需要向地方议会卫生部门申请健康与食品处理认证,内容涵盖厨房卫生、食品储存及防虫害等方面。
- 所有接触食品或餐具的员工,都需要接种伤寒疫苗并领取食品处理员健康卡,这需要到政府诊所或指定的特约诊所接受健康检查,并需定期更新。

### 其他行业
托儿所需向社会福利局(JKM)注册;教育及补习中心通常需向教育部注册;人力资源与就业中介机构需取得人力资源部的执照;货币服务业务,例如货币兑换或汇款服务,则由国家银行(Bank Negara Malaysia)核发执照;美容、水疗及养生类商家往往在营业执照之外,还有各自额外的地方性要求。这份清单并不详尽,也无意详尽——而且行业相关规定的更新频率,通常比上述三项通用执照更高,因此最好预留一些缓冲时间。稳妥的做法,是直接向你所在地的议会以及负责监管你所属行业的部门或主管机构,确认具体适用于你的要求。

## 5. 清真认证——非强制,但具有商业价值

与以上各项不同,清真(Halal)认证并非合法营业的必要条件,而是一项可选的认证,由 JAKIM(伊斯兰教发展局)或获 JAKIM 认可的州属伊斯兰宗教局(JAIN)核发,用以确认你的产品或场所符合清真标准。对餐饮业者,以及化妆品或药品相关业务而言,这是在以穆斯林为多数人口的市场中,最具商业价值的认证之一——它能在顾客尝试你的产品之前,就先建立起信任感。

这项认证的流程与上述执照各自独立,所需时间也更长:包括正式申请、对原料与供应链的审查,以及依据清真标准(MS 1500)对店面或工厂进行实地稽核。认证有效期有一定年限,到期需要续证。由于涉及额外的文件准备与现场稽核,大多数商家会在店面、供应商及基本运营都已经稳定之后,才启动这项申请,而不会急于与营业执照同步办理。

## 6. 把申请顺序安排对

按照真正行得通的顺序排列,大致流程是这样的:在签署租赁合约之前,先确认该店面的用途分区获准用于你所经营的业务类型;完成装修,使其能够同时通过消防安全检查,以及(如适用)卫生部门的检查;若你的业务需要,先申请 Bomba 批准——这往往是议会核发营业执照前所需的支持文件之一;接着提交营业执照申请本身;同时申请招牌执照,最好与营业执照一并办理;安排业务所需的行业专属认证,例如食品处理认证与员工健康卡,这些通常可以与营业执照申请同步进行;待营业稳定之后,再视你的目标市场考虑是否申请清真认证。

> 营业执照不是开业路上需要应付过去的手续,而是一整套审批,使你的生意在那些有权令你停业的当局眼中,真正具备可执行、可投保、合法存在的地位。

实际所需时间因议会工作量和申请材料的完整度而有很大差异,但在材料齐全的情况下,一宗普通案例通常需要数周到两个月左右。拖慢进度的原因几乎总是那三种:文件不齐全(缺少租赁合约、平面图或身份证副本,会导致整份申请被退回)、店面经议会审核后才发现并非核准用于你所经营的业务类型,以及预约检查时装修尚未完工,或与提交的图纸不符,导致检查失败、必须重新预约。

未取得所需执照就营业,会带来实实在在的后果,这里只是如实陈述,而非危言耸听:地方议会可就无营业执照或招牌执照营业开出罚款(compound),可勒令企业停业或封闭店面,而屡次违规还可能影响日后申请执照获批的机会。只要及早处理,这些情况都谈不上罕见或严重——这正是为什么在开业之前把手续办妥,会比事后补办划算得多的实际原因。

一旦执照齐备、店面真正开门营业,不妨让这些合规努力真正发挥作用。[在 Gotka 上为你的企业建立店铺资料](/zh/signup),能让在本地搜索你所提供服务的顾客真正找到你——而这正是这一整套审批流程,最终想要实现的本地曝光度。

## 常见的疏漏

- **只申请了营业执照,以为招牌也包含在内。** 这是向同一个议会提出的两项独立申请,漏办第二项,是新店主最常在招牌已经挂上之后才发现的疏漏。
- **在确认用途分区之前就签了租约。** 一个看起来很合适的店面,实际用途分区完全可能对应另一种业务类型,而这通常不是业主有义务主动告诉你的事。
- **在装修尚未完工前就预约 Bomba 或卫生检查。** 针对尚未完成、或与提交图纸不符的工程进行检查,通常意味着检查不合格,必须重新预约——这也是整个流程中拖慢进度的最主要原因。

## 从哪里开始

- **签约之前**:先向地方议会确认,该店面的用途分区获准用于你所经营的业务类型。
- **敲定店面的同时**:开始准备 SSM 文件、租赁合约、平面图及现场照片,为营业执照申请做准备。
- **装修期间**:按照能够通过 Bomba 检查的标准施工(如适用),并在预期取得营业执照之前完成该项检查。
- **店面准备就绪后**:向地方议会一并提交营业执照与招牌执照申请。
- **若从事餐饮业,在开业前**:安排员工接受食品处理员健康检查,并向议会卫生部门申请食品处理认证。
- **营业稳定之后**:若清真认证确实契合你的目标市场,可以考虑申请;并请将本指南视为一份起点地图——具体的表格、文件与费用仍需直接向你所在地的议会确认,因为这些规定会不断变化。`,
        faqs: [
          {
            question: "已经在 SSM 完成商业注册,是否还需要申请营业执照?",
            answer:
              "是的——SSM 注册与营业执照是两件不同的事。SSM 注册让你的企业成为获认可的合法实体或商号,而营业执照则是地方议会授权该实体在特定实体地址营业的许可。几乎所有拥有店铺、办公室或其他实体场所的企业,这两项都需要办理。",
          },
          {
            question: "在马来西亚申请营业执照,应该向哪个单位提出?",
            answer:
              "你需要向管辖你店面地址的地方议会提出申请,例如吉隆坡的 DBKL,或八打灵再也的 MBPJ,即 Majlis Perbandaran、Majlis Bandaraya 或 Majlis Daerah。这项申请没有统一的全国平台,因为每个议会都有各自的申请流程与要求。请直接向管辖你所在地址的议会确认具体表格与所需文件。",
          },
          {
            question: "在马来西亚申请营业执照大约需要多少费用?",
            answer:
              "费用会因议会、行业类别及店面面积而异,并没有统一的固定金额。执照本身的费用通常是数百令吉左右,但较大的店面或某些行业类型可能费用更高。实际金额请在预算前直接向你所在地的议会确认。",
          },
          {
            question: "开业前是否一定需要取得 Bomba(消防局)的批准?",
            answer:
              "对于面积超过一定规模,或属于多层建筑、设有烹饪设备的厨房等特定类型的商业场所而言,答案通常是需要——地方议会一般会要求先取得 Bomba 批准,才会核发营业执照。Bomba 的检查内容包括灭火器、紧急出口及警报系统等。面积很小、风险较低的场所有时可获豁免,但这由议会与 Bomba 共同决定,务必先行确认,而非自行假设。",
          },
          {
            question: "营业执照与招牌执照有什么区别?",
            answer:
              "营业执照授权你在特定地址经营业务,而招牌执照则是专门针对店外招牌(例如正门招牌或灯箱)的另一项独立批准。两者虽由同一个地方议会核发,但申请和收费都是分开的。许多新店主只申请了前者,直到招牌需要另行批准时才意外发现这一点。",
          },
          {
            question: "餐饮业者是否必须取得清真认证?",
            answer:
              "不需要,清真认证是可选的,并非合法营业的强制要求。它由 JAKIM 或获其认可的州属伊斯兰宗教局核发,对希望赢得马来西亚穆斯林多数市场信任的餐饮、化妆品及药品企业而言,具有很高的商业价值。由于申请流程包含店面或工厂稽核,许多企业会选择在运营已经稳定之后才申请。",
          },
          {
            question: "如果企业在未取得所需执照的情况下营业,会有什么后果?",
            answer:
              "地方议会可就无营业执照或招牌执照营业开出罚款(compound)。议会也可以勒令企业停止营业或关闭店面,直到相关执照获批为止,而屡次违规还可能影响日后申请执照获批的机会。这些都是常规的执法措施,而非罕见或极端的处罚,因此在开业前把执照办妥,会比事后补救更划算。",
          },
          {
            question: "在马来西亚开业需要办理的所有执照,大概需要多长时间?",
            answer:
              "所需时间因议会的工作量以及申请材料的完整度而有很大差异,但在材料齐全的情况下,一宗普通案例通常需要数周到两个月左右。最常见的延误原因包括文件不齐全、店面经审核后才发现并非核准用于你所经营的业务类型,以及预约检查时装修尚未完工或与提交资料不符。尽早启动流程,并提前向议会确认所需要求,是避免这些延误的最佳方法。",
          },
        ],
      },
      ms: {
        title: "Lesen dan Permit Perniagaan di Malaysia: Apa yang Anda Perlukan Sebelum Membuka Perniagaan",
        excerpt:
          "Sebaik sahaja perniagaan anda berdaftar dengan SSM, satu lagi siri kelulusan menentukan sama ada anda benar-benar boleh membuka perniagaan — lesen premis dan papan tanda daripada majlis tempatan, kelulusan keselamatan kebakaran daripada Bomba, dan sebarang pensijilan yang diperlukan oleh sektor anda. Panduan ini menerangkan apa yang diperlukan oleh perniagaan biasa di Malaysia, mengikut turutan yang benar-benar berkesan, berserta kelewatan dan kos yang wajar dijangka sepanjang proses tersebut.",
        body: `Mendaftarkan perniagaan anda dengan SSM memberi anda sijil dan identiti sah di sisi undang-undang. Ia tidak memberi anda kebenaran untuk terus membuka pintu kedai. Kebenaran itu datang daripada satu lagi siri lesen dan kelulusan yang kurang dibincangkan — kebanyakannya dikeluarkan oleh pihak berkuasa tempatan anda, dengan beberapa pengawal selia khusus mengikut sektor di atasnya, bergantung kepada jenis perniagaan anda. Panduan ini bermula selepas pendaftaran SSM selesai: sebaik sahaja perniagaan anda berdaftar dan anda bersedia mencari serta menyiapkan premis fizikal, inilah yang masih perlu anda uruskan sebelum boleh beroperasi secara sah.

Setiap satu daripada lesen ini ditadbir secara tempatan atau mengikut sektor, bermakna dua perniagaan yang menjalankan perkara sama di dua bandar berbeza boleh menghadapi borang, dokumen, dan yuran yang berbeza. Anggap butiran di bawah sebagai gambaran umum tentang apa yang perlu dijangka, bukan senarai harga tetap — satu-satunya cara untuk mengetahui keperluan sebenar adalah dengan bertanya terus kepada majlis dan pengawal selia yang menguruskan kawasan dan sektor perniagaan anda.

## 1. Lesen premis perniagaan daripada pihak berkuasa tempatan anda

Lesen teras yang hampir semua perniagaan berpremis fizikal perlukan ialah lesen premis perniagaan, dikeluarkan oleh Majlis Perbandaran, Majlis Bandaraya, atau Majlis Daerah (pihak berkuasa tempatan, atau Pihak Berkuasa Tempatan/PBT) yang menguruskan kawasan di mana premis anda berada. Jika anda mempunyai kedai, kafe, salon, pejabat yang menerima pelanggan, atau bengkel dengan alamat fizikal, anda memerlukan lesen ini — tiada pengecualian. Ia sama sekali berasingan daripada pendaftaran SSM anda: SSM menjadikan perniagaan anda sebagai entiti sah atau nama perdagangan; lesen premis pula adalah kebenaran daripada pihak berkuasa tempatan untuk entiti itu beroperasi di alamat tersebut secara khusus.

Tiada satu sistem kebangsaan yang seragam untuk ini — setiap majlis menjalankan proses permohonannya sendiri, sama ada DBKL di Kuala Lumpur, MBPJ di Petaling Jaya, MBSA di Shah Alam, MPAJ di Ampang Jaya, atau mana-mana daripada puluhan majlis lain di seluruh negara. Anda memohon kepada majlis yang menguruskan kawasan premis anda.

### Dokumen yang biasanya diperlukan
- Pendaftaran perniagaan atau profil syarikat SSM anda
- Dokumen pengenalan diri pemilik atau pengarah
- Perjanjian sewa atau bukti pemilikan premis
- Pelan lantai dan gambar premis
- Kadangkala surat kebenaran daripada tuan tanah, atau badan pengurusan bersama jika anda berada di kedai bertingkat atau pusat membeli-belah bermilik strata

Yuran lesen itu sendiri biasanya tidak tinggi — selalunya dalam lingkungan beberapa ratus ringgit, walaupun ini berbeza mengikut majlis, kategori perniagaan, dan keluasan lantai premis anda — dan biasanya perlu diperbaharui setiap tahun. Satu cara mudah untuk menilai sama ada sesuatu lokasi sesuai untuk perniagaan anda ialah dengan melayari apa yang sudah tersenarai berhampiran di [Gotka](/ms); jika satu jalan itu dipenuhi klinik dan pejabat tanpa sebarang kedai runcit, itu selalunya sudah menunjukkan jenis zon kawasan tersebut sebelum anda sempat bertanya sesiapa pun.

## 2. Lesen papan tanda — permohonan berasingan yang sering terlepas pandang

Memasang papan tanda kedai terasa seperti sebahagian daripada proses pembukaan, bukan satu langkah birokrasi berasingan — dan itulah sebabnya ramai pemilik baharu terlepas pandang akannya. Sebarang papan tanda luaran — papan tanda utama kedai anda, lightbox, papan tanda tergantung, sepanduk — memerlukan lesennya sendiri daripada majlis tempatan yang sama: lesen papan tanda, atau lesen iklan. Ia tidak termasuk dalam lesen premis anda, walaupun kedua-duanya dikeluarkan oleh pejabat yang sama.

Yuran untuk lesen ini biasanya dikira berdasarkan saiz papan tanda (selalunya mengikut kaki persegi) dan sama ada ia bercahaya, dan ia umumnya perlu diperbaharui pada kitaran tahunan yang serupa dengan lesen premis. Oleh kerana ia diuruskan oleh jabatan majlis yang sama, lebih baik memohonnya pada masa yang sama dengan lesen premis anda, bukannya selepas papan tanda sudah dipasang — papan tanda yang dipasang tanpa kelulusan boleh membawa kepada kompaun, atau arahan untuk menanggalkannya sejurus selepas anda membelanjakan wang untuk memasangnya.

## 3. Kelulusan keselamatan kebakaran (Bomba)

Bagi kebanyakan premis komersial yang melebihi saiz tertentu, atau jenis tertentu — unit bertingkat, dapur dengan peralatan memasak, premis yang menerima orang ramai, bengkel atau kilang yang mengendalikan bahan mudah terbakar — anda memerlukan kelulusan daripada Jabatan Bomba dan Penyelamat Malaysia (JBPM), biasa dipanggil Bomba sahaja.

Pemeriksaan Bomba menyemak perkara seperti alat pemadam api dan kedudukannya, pintu kecemasan yang ditanda jelas dan tidak terhalang, sistem penggera dan pengesan kebakaran jika diperlukan, lebar laluan keluar yang mencukupi, serta pendawaian elektrik dan pemasangan gas yang mematuhi piawaian. Had khusus yang mencetuskan keperluan ini — keluasan lantai, bilangan tingkat, kapasiti penghuni — ditetapkan bersama oleh majlis dan Bomba, dan ia berbeza antara satu majlis dengan majlis lain, jadi lebih baik disahkan terus berbanding diandaikan premis anda dikecualikan.

Langkah ini wajar dirancang lebih awal, kerana ia sering menjadi kelompongan utama dalam keseluruhan proses: Bomba umumnya memerlukan kerja ubah suai dan pemasangan premis anda sudah siap sepenuhnya dan sepadan dengan apa yang anda kemukakan, sebelum mereka menjadualkan pemeriksaan — dan kebanyakan majlis tidak akan mengeluarkan lesen premis sehingga Bomba memberikan kelulusan.

## 4. Lesen khusus sektor yang perlu disemak untuk perniagaan anda

Lesen premis, lesen papan tanda, dan kelulusan Bomba adalah lapisan umum yang hampir semua perniagaan berpremis fizikal perlu uruskan. Selain itu, banyak sektor mempunyai keperluan pelesenan khusus tersendiri.

### Jika anda dalam bidang makanan dan minuman
- Anda memerlukan pensijilan kesihatan dan pengendalian makanan daripada jabatan kesihatan majlis tempatan anda, merangkumi perkara seperti kebersihan dapur, penyimpanan makanan, dan kawalan perosak.
- Sesiapa yang mengendalikan makanan atau peralatan memasak memerlukan suntikan taifoid dan kad kesihatan pengendali makanan, yang diperoleh melalui pemeriksaan kesihatan di klinik kerajaan atau klinik panel yang diluluskan, dan perlu diperbaharui secara berkala.

### Untuk sektor lain
Pusat jagaan kanak-kanak berdaftar dengan Jabatan Kebajikan Masyarakat (JKM); pusat pendidikan dan tuisyen biasanya berdaftar dengan Kementerian Pendidikan; agensi tenaga kerja dan pekerjaan dilesenkan di bawah Kementerian Sumber Manusia; perniagaan perkhidmatan wang seperti penukaran matawang atau kiriman wang dilesenkan oleh Bank Negara Malaysia; dan perniagaan kecantikan, spa, serta kesejahteraan selalunya mempunyai keperluan tempatan tambahan tersendiri di atas lesen premis am. Senarai ini tidak lengkap, dan memang tidak bertujuan untuk lengkap — peraturan sektor juga dikemas kini lebih kerap berbanding tiga lesen am di atas, jadi peruntukkan sedikit ruang masa tambahan. Langkah yang boleh dipercayai ialah menyemak terus dengan majlis tempatan anda serta kementerian atau pengawal selia yang mengawasi sektor khusus anda, untuk mengetahui apa yang terpakai kepada anda.

## 5. Pensijilan Halal — pilihan, tetapi bernilai dari segi komersial

Berbeza daripada semua yang disebut di atas, pensijilan Halal bukan keperluan undang-undang untuk beroperasi. Ia adalah pensijilan pilihan, dikeluarkan oleh JAKIM (Jabatan Kemajuan Islam Malaysia) atau jabatan agama Islam negeri yang diiktiraf oleh JAKIM (JAIN), yang mengesahkan produk atau premis anda memenuhi piawaian Halal. Bagi perniagaan makanan dan minuman, serta produk kosmetik atau farmaseutikal, ia merupakan salah satu pensijilan paling bernilai dari segi komersial di pasaran majoriti Muslim — ia memberi isyarat kepercayaan kepada sebahagian besar bakal pelanggan anda, sebelum mereka sempat mencuba apa-apa yang anda jual.

Proses ini berjalan di landasannya sendiri dan mengambil masa lebih lama berbanding lesen am di atas: ia melibatkan permohonan rasmi, semakan terhadap bahan-bahan dan rantaian bekalan anda, serta audit fizikal ke atas premis atau kilang anda berdasarkan piawaian Halal (MS 1500). Pensijilan ini sah untuk tempoh tertentu dan perlu diperbaharui. Disebabkan dokumentasi tambahan dan audit yang terlibat, kebanyakan perniagaan hanya memulakan proses ini sebaik sahaja premis, pembekal, dan operasi asas mereka sudah stabil — bukan sesuatu yang dikejar pada minggu yang sama dengan lesen premis.

## 6. Menyusun urutan permohonan dengan betul

Disusun mengikut turutan yang benar-benar berkesan, urutannya kira-kira begini: sahkan premis anda berada dalam zon dan diluluskan untuk jenis perniagaan yang anda jalankan, sebelum anda menandatangani perjanjian sewa. Siapkan kerja ubah suai dan pemasangan anda mengikut piawaian yang akan lulus pemeriksaan keselamatan kebakaran dan, jika berkaitan, pemeriksaan jabatan kesihatan. Mohon kelulusan Bomba di mana perniagaan anda memerlukannya — ini sering menjadi dokumen sokongan yang diperlukan oleh majlis sebelum ia mengeluarkan lesen premis. Kemukakan permohonan lesen premis itu sendiri. Mohon lesen papan tanda, sebaik-baiknya serentak dengannya. Uruskan sebarang pensijilan khusus sektor yang diperlukan oleh perniagaan anda, seperti pensijilan pengendalian makanan dan kad kesihatan kakitangan, yang selalunya boleh berjalan selari dengan permohonan lesen premis. Pertimbangkan pensijilan Halal sebaik sahaja anda sudah beroperasi dan stabil, jika ia sesuai dengan pasaran anda.

> Lesen perniagaan bukanlah kerja kertas yang perlu diselesaikan sebelum membuka perniagaan — ia adalah satu siri kelulusan yang menjadikan segala-galanya tentang perniagaan anda boleh dikuatkuasakan, boleh dilindungi insurans, dan sah di mata pihak berkuasa yang sebaliknya boleh menutup perniagaan anda.

Tempoh masa sebenar berbeza-beza mengikut beban kerja majlis dan tahap kelengkapan permohonan anda, tetapi kes yang mudah biasanya mengambil masa beberapa minggu hingga dua bulan daripada penyerahan yang lengkap. Kelewatan yang memanjangkan tempoh ini hampir selalu berpunca daripada tiga perkara yang sama: dokumen tidak lengkap (perjanjian sewa, pelan lantai, atau salinan kad pengenalan yang tertinggal menyebabkan keseluruhan fail dikembalikan), premis yang didapati tidak berada dalam zon atau tidak diluluskan untuk jenis perniagaan anda setelah majlis menyemaknya, dan kerja ubah suai yang belum siap — atau tidak sepadan dengan apa yang dikemukakan — apabila pemeriksaan dijadualkan, menyebabkan ia perlu dijadualkan semula.

Beroperasi tanpa lesen yang diperlukan membawa akibat sebenar, dinyatakan secara jujur dan bukan sebagai taktik menakut-nakutkan: majlis tempatan boleh mengeluarkan kompaun (denda) kerana beroperasi tanpa lesen premis atau lesen papan tanda, boleh mengarahkan perniagaan berhenti beroperasi atau menutup premis, dan ketidakpatuhan berulang boleh menjejaskan keupayaan anda untuk mendapatkan kelulusan lesen pada masa hadapan. Tiada satu pun daripada ini luar biasa atau teruk jika dikesan awal — ia hanyalah sebab praktikal mengapa wajar menyelesaikan kerja kertas dengan betul sebelum anda membuka perniagaan, bukan selepasnya.

Setelah lesen anda lengkap dan perniagaan benar-benar beroperasi, wajar memanfaatkan hasil kerja pematuhan itu. [Senaraikan perniagaan anda di Gotka](/ms/signup) bermakna pelanggan yang mencari secara tempatan untuk perkhidmatan yang anda tawarkan benar-benar dapat menemui anda — iaitu keterlihatan tempatan yang menjadi tujuan keseluruhan siri kelulusan ini wujud.

## Kesilapan biasa yang menjejaskan semua usaha ini

- **Memohon lesen premis dan menganggap papan tanda sudah termasuk.** Kedua-duanya adalah permohonan berasingan kepada majlis yang sama, dan terlepas pandang yang kedua ini adalah kelompongan paling biasa yang disedari oleh pemilik baharu hanya selepas papan tanda mereka sudah terpasang.
- **Menandatangani perjanjian sewa sebelum menyemak zon kawasan.** Premis yang kelihatan sesuai masih boleh berada dalam zon untuk jenis perniagaan yang sama sekali berbeza, dan ini bukan sesuatu yang tuan tanah wajib maklumkan kepada anda.
- **Menempah pemeriksaan Bomba atau kesihatan sebelum kerja ubah suai benar-benar siap.** Pemeriksaan terhadap kerja yang belum lengkap, atau tidak sepadan dengan pelan yang dikemukakan, biasanya bermakna pemeriksaan gagal dan tempahan kedua — dan inilah punca utama kehilangan masa dalam keseluruhan proses ini.

## Di mana untuk bermula

- **Sebelum menandatangani apa-apa**: sahkan dengan majlis tempatan bahawa premis tersebut berada dalam zon dan diluluskan untuk jenis perniagaan anda.
- **Semasa memuktamadkan premis**: mula mengumpulkan dokumen SSM, perjanjian sewa, pelan lantai, dan gambar untuk permohonan lesen premis.
- **Semasa ubah suai**: bina mengikut piawaian yang akan lulus pemeriksaan Bomba, jika perniagaan anda memerlukannya, dan selesaikan pemeriksaan itu sebelum anda menjangkakan lesen premis dikeluarkan.
- **Sebaik sahaja premis sudah sedia**: kemukakan permohonan lesen premis dan lesen papan tanda bersama-sama di majlis tempatan anda.
- **Sebelum membuka, jika anda dalam bidang F&B**: aturkan pemeriksaan kesihatan pengendali makanan dan mohon pensijilan pengendalian makanan dengan jabatan kesihatan majlis.
- **Sebaik sahaja anda stabil dan beroperasi**: pertimbangkan pensijilan Halal jika ia benar-benar sesuai dengan pasaran anda, dan anggap keseluruhan panduan ini sebagai peta permulaan — sahkan borang, dokumen, dan yuran semasa terus dengan majlis anda sendiri, kerana semua ini boleh berubah dari semasa ke semasa.`,
        faqs: [
          {
            question: "Adakah saya masih memerlukan lesen premis perniagaan jika perniagaan saya sudah berdaftar dengan SSM?",
            answer:
              "Ya — pendaftaran SSM dan lesen premis perniagaan adalah dua perkara yang berasingan. Pendaftaran SSM menjadikan perniagaan anda sebagai entiti sah atau nama perdagangan yang diiktiraf, manakala lesen premis adalah kebenaran daripada majlis tempatan anda untuk beroperasi di alamat fizikal tertentu. Hampir semua perniagaan yang mempunyai kedai, pejabat, atau premis fizikal lain memerlukan kedua-duanya.",
          },
          {
            question: "Pihak berkuasa mana yang perlu saya hubungi untuk memohon lesen premis perniagaan di Malaysia?",
            answer:
              "Anda memohon kepada majlis tempatan — Majlis Perbandaran, Majlis Bandaraya, atau Majlis Daerah — yang menguruskan alamat sebenar premis anda, seperti DBKL di Kuala Lumpur atau MBPJ di Petaling Jaya. Tiada satu portal kebangsaan yang seragam untuk ini, kerana setiap majlis menjalankan proses permohonan dan keperluannya sendiri. Semak terus dengan majlis yang menguruskan alamat anda untuk borang dan dokumen khususnya.",
          },
          {
            question: "Berapakah kos lesen premis perniagaan di Malaysia?",
            answer:
              "Yuran berbeza mengikut majlis, kategori perniagaan, dan keluasan lantai premis anda, jadi tiada satu angka tetap yang sama untuk semua. Yuran lesen itu sendiri selalunya dalam lingkungan beberapa ratus ringgit, walaupun ini boleh lebih tinggi untuk premis yang lebih besar atau jenis perniagaan tertentu. Sahkan yuran sebenar dengan majlis tempatan anda sebelum membuat belanjawan.",
          },
          {
            question: "Adakah kelulusan Bomba diperlukan sebelum saya boleh membuka perniagaan saya?",
            answer:
              "Bagi kebanyakan premis komersial yang melebihi saiz tertentu, atau jenis tertentu seperti unit bertingkat atau dapur dengan peralatan memasak, ya — kelulusan Bomba biasanya diperlukan sebelum majlis tempatan anda mengeluarkan lesen premis. Pemeriksaan Bomba menyemak perkara seperti alat pemadam api, pintu kecemasan, dan sistem penggera. Premis yang sangat kecil atau berisiko rendah mungkin dikecualikan, tetapi ini ditentukan bersama oleh majlis dan Bomba, jadi wajar disahkan dan bukan diandaikan.",
          },
          {
            question: "Apakah perbezaan antara lesen premis dan lesen papan tanda?",
            answer:
              "Lesen premis memberi anda kebenaran untuk beroperasi di alamat tertentu, manakala lesen papan tanda adalah kelulusan berasingan khusus untuk sebarang papan tanda luaran, seperti papan tanda kedai atau lightbox anda. Kedua-duanya dikeluarkan oleh majlis tempatan yang sama tetapi memerlukan permohonan dan yuran yang berasingan. Pemilik perniagaan baharu sering hanya memohon yang pertama dan terkejut apabila mendapati papan tanda mereka turut memerlukan kelulusan tersendiri.",
          },
          {
            question: "Adakah pensijilan Halal diwajibkan bagi perniagaan makanan dan minuman di Malaysia?",
            answer:
              "Tidak, pensijilan Halal adalah pilihan dan bukan keperluan undang-undang untuk beroperasi. Ia dikeluarkan oleh JAKIM atau jabatan agama Islam negeri yang diiktiraf oleh JAKIM, dan ia bernilai dari segi komersial bagi perniagaan makanan, kosmetik, dan farmaseutikal yang ingin membina kepercayaan dengan pasaran majoriti Muslim di Malaysia. Ramai perniagaan memohonnya sebaik sahaja operasi mereka sudah stabil, kerana proses permohonan melibatkan audit premis atau kilang.",
          },
          {
            question: "Apakah akibatnya jika saya mengendalikan perniagaan di Malaysia tanpa lesen yang diperlukan?",
            answer:
              "Majlis tempatan boleh mengeluarkan kompaun, iaitu denda, kerana beroperasi tanpa lesen premis atau lesen papan tanda yang diperlukan. Mereka juga boleh mengarahkan perniagaan berhenti beroperasi atau menutup premis sehingga kelulusan yang betul diperoleh, dan ketidakpatuhan berulang boleh menyukarkan anda mendapatkan kelulusan lesen pada masa hadapan. Ini adalah akibat penguatkuasaan yang rutin dan bukan sesuatu yang jarang atau melampau, dan itulah sebabnya wajar menyelesaikan urusan pelesenan sebelum membuka perniagaan.",
          },
          {
            question: "Berapa lamakah masa yang diperlukan untuk mendapatkan semua lesen bagi membuka perniagaan di Malaysia?",
            answer:
              "Tempoh ini berbeza-beza dengan ketara mengikut beban kerja majlis dan tahap kelengkapan permohonan anda, tetapi kes yang mudah biasanya mengambil masa beberapa minggu hingga dua bulan daripada penyerahan yang lengkap. Punca kelewatan yang paling biasa ialah dokumen tidak lengkap, premis yang didapati tidak berada dalam zon untuk jenis perniagaan anda, dan kerja ubah suai yang belum siap atau tidak sepadan dengan apa yang dikemukakan apabila pemeriksaan dijadualkan. Memulakan proses seawal mungkin, dan mengesahkan keperluan dengan majlis anda terlebih dahulu, adalah cara terbaik untuk mengelakkan kelewatan ini.",
          },
        ],
      },
    },
  },
  {
    slug: "hiring-your-first-employee-in-malaysia-epf-socso-eis",
    title: "Hiring Your First Employee in Malaysia: EPF, SOCSO, EIS and Payroll Basics",
    seoTitle: "Hiring Your First Employee in Malaysia: EPF & SOCSO Guide",
    seoDescription:
      "A first-time Malaysian employer's guide to EPF, SOCSO, EIS registration, payroll deadlines, and the paperwork you need before and after your first hire.",
    coverImage: {
      file: "hiring-your-first-employee-in-malaysia-epf-socso-eis-cover.webp",
      mimeType: "image/webp",
      alt: "A small business owner welcoming and shaking hands with a new employee in their shop",
      altTranslations: {
        zh: "一位小企业主在店里欢迎并与新员工握手",
        ms: "Seorang pemilik perniagaan kecil menyambut dan bersalaman dengan pekerja baharu di kedainya",
      },
    },
    contentImages: {
      paperwork: {
        file: "hiring-your-first-employee-in-malaysia-epf-socso-eis-paperwork.webp",
        mimeType: "image/webp",
        alt: "A business owner organizing a new employee's paperwork at a desk",
        altTranslations: {
          zh: "一位企业主在办公桌前整理新员工的文件",
          ms: "Seorang pemilik perniagaan menyusun kerja kertas pekerja baharu di sebuah meja",
        },
        after: "Keep a simple personnel file per employee from day one: contract, IC copy, bank details, and any later amendments (salary changes, promotions).",
        afterTranslations: {
          zh: "从第一天起,为每位员工建立一份简单的人事档案:合约、身份证副本、银行资料,以及日后的任何变更(加薪、晋升等)。",
          ms: "Simpan satu fail peribadi yang ringkas untuk setiap pekerja sejak hari pertama: kontrak, salinan kad pengenalan, butiran bank, dan sebarang pindaan kemudian (perubahan gaji, kenaikan pangkat).",
        },
      },
    },
    excerpt:
      "Hiring your first employee in Malaysia means registering with EPF, SOCSO/EIS, and LHDN, each with its own deadline and paperwork. This guide walks through what a first-time employer needs to set up before day one, how the statutory contributions actually work, and the payroll habits that keep you compliant every month after.",
    body: `Hiring your first employee changes what kind of business you're running — not just in headcount, but in paperwork. The moment someone goes on payroll, you take on legal obligations to three different statutory bodies (EPF, SOCSO/EIS, and LHDN) that didn't apply when it was just you, a partner, or contractors invoiced on their own EPF/SST number. None of it is especially hard, but it has to happen in the right order and on time, or the penalties and back-payments land on you, not the new hire. This guide covers what a first-time Malaysian employer actually needs to do, from the week before someone starts to the first few payroll cycles after.

## 1. Register as an employer before your first hire's first day

Three separate registrations need to exist before you run your first payroll, and each is with a different agency:

- **EPF (KWSP)** — register as an employer to get an employer reference number, then register the new employee under it.
- **SOCSO and EIS (PERKESO)** — one registration covers both; PERKESO treats them as a single employer account with two schemes under it.
- **LHDN (Inland Revenue Board)** — register for an employer (E) number if you don't already have one, so you can remit the employee's monthly tax deduction.

Each agency's own portal (EPF's i-Akaun, PERKESO's ASSIST, and LHDN's e-Daftar/MyTax) handles the actual registration, and each publishes its own deadline for how soon after a first hire this has to be done — commonly cited as within days to a few weeks, depending on the agency. Rather than working from a half-remembered number, check the current deadline on each agency's own site before your hire's start date, since missed-registration penalties are enforced on the employer, not waived for a first-timer.

### What you'll need on hand
Your business registration details (SSM), your own IC, and the new employee's IC and bank account details — EPF and SOCSO contributions are credited electronically, so a wrong account number delays the employee's own contribution record, not just your filing.

## 2. Put the paperwork in place before, not after, day one

A written employment contract (or at minimum an offer letter covering position, salary, working hours, and notice period) should exist before the first day, both because the Employment Act expects it for most categories of employee and because it's the document you'll refer back to the first time a dispute over leave, overtime, or termination comes up.

Two LHDN forms matter early:
- **CP22** — notifies LHDN of a new employee, filed within a set number of days of their start date (confirm the current deadline with LHDN, as it has changed before and isn't worth guessing at).
- **CP22A/CP22B** — the equivalent form for when an employee leaves, which matters later but is worth knowing exists now.

Keep a simple personnel file per employee from day one: contract, IC copy, bank details, and any later amendments (salary changes, promotions). It's the first thing an EPF or SOCSO audit asks for, and the easiest thing to have ready if you built the habit early rather than reconstructing it under pressure later.

It's also worth reading the Employment Act's basic entitlements before you draft that first contract, even if your hire doesn't fall under its stricter wage-based coverage — annual and sick leave minimums, rest days, and overtime rules are the kind of thing a new employee (or a labour officer, if a complaint is ever filed) will expect you to already know, not look up for the first time after a dispute starts.

## 3. Understand what EPF, SOCSO, and EIS actually cost both of you

These three deductions are the core of Malaysian payroll, and each works slightly differently:

### EPF (retirement savings)
Both employer and employee contribute a percentage of monthly wages into the employee's EPF account. For a Malaysian citizen or permanent resident under 60, the employee's share and the employer's share are both set out in EPF's own contribution schedule (the Third Schedule), and the employer's percentage can actually shift depending on the wage band, so don't assume one flat number applies at every salary level. EPF's official contribution rate table is the only source worth calculating from — it's revised from time to time, and a rate you read in an old blog post may already be out of date.

### SOCSO (injury and invalidity protection)
SOCSO covers two schemes — the Employment Injury Scheme and the Invalidity Pension Scheme — funded by a small employer contribution and a smaller employee contribution, calculated against a monthly wage ceiling that PERKESO periodically revises upward. Confirm the current ceiling and both percentages on PERKESO's own site rather than a fixed figure here, precisely because that ceiling has moved in recent years and is exactly the kind of number this guide won't pretend to freeze in place.

### EIS (unemployment protection)
A smaller, separate contribution — split evenly between employer and employee — funds short-term financial support and job-search assistance if the employee is later retrenched. It's collected together with SOCSO on the same PERKESO schedule, so once you've set up one, setting up the other is mostly a formality.

> Treat the EPF/SOCSO/EIS rate tables the way you'd treat an exchange rate, not a fact you memorize once — look up the current published schedule every time you onboard a new hire or adjust a salary, because all three have been revised in the past and will likely be revised again.

## 4. Set up Monthly Tax Deduction (PCB/MTD) correctly from the first payslip

Separately from EPF/SOCSO/EIS, you're required to deduct Monthly Tax Deduction (known as PCB, from its Malay name, or MTD) from an employee's salary and remit it to LHDN — this is an advance on the employee's own annual income tax, not an employer cost, but calculating it wrong is still the employer's problem to fix. LHDN publishes an official PCB calculator and schedule; most Malaysian payroll software (and LHDN's own calculator, for a manual spot-check) applies it automatically based on the employee's monthly salary, marital status, and number of children claimed — details worth collecting on a short form during onboarding, since getting them wrong under-deducts now and creates a shortfall the employee discovers at tax-filing time.

## 5. Build a payroll calendar and keep to it

Once registrations and the first payslip are sorted, the ongoing job is mostly about timing: EPF, SOCSO/EIS, and PCB each have their own monthly remittance deadline to the respective agency, typically within the first two to three weeks of the following month — confirm the exact day for each on their current portals, since this is another figure agencies adjust from time to time. Missing any of them, even by a day, commonly triggers a late-payment penalty that's entirely avoidable with a calendar reminder.

A simple monthly routine that covers most small employers:
- Run payroll and issue payslips on a fixed date each month.
- Submit and pay EPF, SOCSO/EIS, and PCB for that month by their respective deadlines.
- Keep digital copies of every submission receipt — EPF, PERKESO, and LHDN all generate one, and an audit years later is far less stressful with a complete folder than a gap you have to explain.

## 6. Decide early: run it yourself, or get help

A single employee is manageable on a spreadsheet plus the three agencies' own portals, if you're disciplined about the calendar above. Once you're hiring a second or third person, most small Malaysian employers move to either a payroll software subscription (which calculates EPF/SOCSO/EIS/PCB automatically and files some of it directly) or an outsourced payroll/accounting firm that handles the filings on your behalf for a monthly fee. Neither is mandatory at one employee, but deciding before you actually need it — rather than mid-crisis after a missed deadline — is the cheaper way to make that call.

Weigh it against what a missed or late filing actually costs: a payroll subscription or an accounting retainer is a predictable monthly line item, while a penalty for a late EPF or SOCSO payment, or the back-and-forth of correcting a wrong PCB deduction months after the fact, tends to cost more in both money and your own time than the service you were trying to avoid paying for.

Getting your business itself easier to find matters just as much once you're hiring — a growing team usually means a growing customer base too, and [listing your business here](/en/signup) alongside the operational side covered in this guide is a free, fast way to be found by the customers that first employee will help you serve. It's worth [browsing what else is listed](/en) to see how other Malaysian SMEs — many of them first-time employers not long ago — present themselves once they've scaled past a one-person operation.

## Common mistakes first-time employers make

- **Registering with EPF or SOCSO after the employee has already started working.** All three agencies calculate contributions from the actual start date, not the registration date, so a late registration still means back-payment for the gap, plus a possible penalty on top.
- **Copying a contribution rate from an old article or template instead of checking the current schedule.** EPF, SOCSO, and EIS rates and wage ceilings have all changed in recent years — a number that was correct eighteen months ago may already be wrong.
- **Treating PCB/MTD as optional for a small first hire.** It's a legal deduction obligation regardless of headcount, and under-deducting it doesn't disappear — it becomes the employee's tax shortfall, and your credibility problem, come filing season.

## Where to start this week

- **Today:** Gather your SSM registration details and the new hire's IC and bank account number, and check EPF, PERKESO, and LHDN's current registration deadlines so you know exactly what date you're working against.
- **Before their first day:** Register as an employer with EPF and PERKESO, get a written contract signed, and set up (or confirm you already have) an LHDN employer number.
- **Within the first pay cycle:** File CP22, confirm the current EPF/SOCSO/EIS rates against each agency's own schedule, and run your first payslip with PCB calculated through LHDN's calculator or your payroll software.
- **Every month after:** Pay EPF, SOCSO/EIS, and PCB by their deadlines, and keep every submission receipt in one folder.

Do this once, properly, and every hire after the first is mostly repetition — the real cost of getting it wrong isn't the paperwork itself, it's the back-payments and penalties that stack up while nobody's checking.`,
    faqs: [
      {
        question: "Do I need to register with EPF and SOCSO for just one employee?",
        answer:
          "Yes. Registration obligations apply from your very first employee, regardless of headcount — there's no exemption for a single hire. The same applies to registering an LHDN employer number if you don't already have one.",
      },
      {
        question: "What is the difference between EPF, SOCSO, and EIS?",
        answer:
          "EPF is a retirement savings scheme, with both employer and employee contributing a percentage of monthly wages into the employee's own account. SOCSO covers workplace injury and invalidity protection, while EIS provides short-term financial support if an employee is later retrenched. SOCSO and EIS are administered together by PERKESO, while EPF is a separate agency entirely.",
      },
      {
        question: "How soon after hiring do I need to register as an employer?",
        answer:
          "Each agency — EPF, PERKESO, and LHDN — sets its own deadline, and these have been known to change, so check the current requirement on each agency's own portal before your hire's start date rather than relying on a remembered figure. Treat it as something to confirm per hire, not something you look up once and reuse indefinitely.",
      },
      {
        question: "What is PCB/MTD, and is it different from EPF?",
        answer:
          "PCB (Potongan Cukai Bulanan), also called MTD (Monthly Tax Deduction), is a monthly advance deduction toward an employee's annual income tax, remitted to LHDN. It's entirely separate from EPF, SOCSO, and EIS, which are all social security and retirement contributions rather than income tax.",
      },
      {
        question: "Do foreign employees need to be registered for EPF and SOCSO too?",
        answer:
          "Generally yes for SOCSO, and EPF coverage for foreign workers has also been extended in recent changes to Malaysian regulations — confirm the current rules and rates for foreign employees on EPF's and PERKESO's own sites, since this is an area that has changed and may continue to.",
      },
      {
        question: "What happens if I register late or miss a monthly contribution?",
        answer:
          "Contributions are typically calculated from the employee's actual start date regardless of when you registered, so a late registration usually still means paying the backdated amount, often alongside a penalty. A missed monthly payment deadline commonly triggers a late-payment charge as well, so it's worth fixing promptly rather than letting it compound across more months.",
      },
      {
        question: "Do I need a written employment contract for my first hire?",
        answer:
          "A written contract, or at minimum a clear offer letter covering role, salary, hours, and notice period, is strongly expected under the Employment Act for most categories of employee and is the document you'll rely on if any dispute comes up later. Treat it as a basic requirement rather than an optional formality, even for a very small or informal first hire.",
      },
      {
        question: "Should I handle payroll myself or hire a payroll service for one employee?",
        answer:
          "For a single employee, many first-time employers manage it themselves using a spreadsheet and each agency's own portal, provided they're disciplined about the monthly filing calendar. As headcount grows, payroll software or an outsourced provider tends to become worth the monthly cost — deciding before you actually need it, rather than after a missed deadline, is usually the better time to make that call.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚雇用第一位员工:EPF、SOCSO、EIS 与薪酬基础知识",
        excerpt:
          "在马来西亚雇用第一位员工,意味着要向 EPF、SOCSO/EIS 与 LHDN 办理注册,每个机构各有自己的期限与文书要求。本指南将说明首次雇主在员工上班第一天之前需要准备什么、法定供款实际如何运作,以及此后每个月保持合规所需养成的薪酬习惯。",
        body: `雇用第一位员工,会改变您所经营的企业的性质——不只是人数上的变化,更是文书与合规责任上的变化。从有人正式上薪水册的那一刻起,您就要对三个不同的法定机构(公积金局 EPF、社会保险机构 SOCSO/EIS,以及税收局 LHDN)承担法律义务,而这些义务在您单独经营,或与合伙人、以自己公积金/SST账号开发票的承包商合作时都不存在。这些手续本身并不特别困难,但必须按正确顺序、按时完成,否则罚款和补缴的责任会落在您身上,而不是新员工身上。本指南将说明马来西亚首次雇主在员工入职前一周到最初几个发薪周期,实际需要做的事情。

## 1. 在第一位员工上班前,先完成雇主注册

在您发出第一份薪水单之前,需要完成三项各自独立的注册,每一项对应不同的机构:

- **公积金局(EPF/KWSP)**——注册为雇主以取得雇主参考号,然后在该号码下为新员工注册。
- **社险局与就业保险(SOCSO 与 EIS,统称 PERKESO)**——一次注册即可同时涵盖两个计划;PERKESO 将二者视为同一雇主账户下的两套制度。
- **税收局(LHDN)**——如果您还没有雇主(E)号,需要先申请,这样才能为员工代缴每月预扣税款。

每个机构自己的平台(EPF 的 i-Akaun、PERKESO 的 ASSIST,以及 LHDN 的 e-Daftar/MyTax)负责实际的注册流程,而每个机构也各自公布了首次雇用员工后必须完成注册的期限——常见说法是在数日至数周之内,具体视机构而定。与其凭一个模糊的记忆数字行事,请在员工入职日期之前,直接到各机构官网核实当前的期限,因为未按时注册的罚则是针对雇主执行的,并不会因为是第一次雇人而被豁免。

### 提前准备好这些资料
您的企业注册资料(SSM)、您本人的身份证,以及新员工的身份证和银行账户信息——EPF 和 SOCSO 的供款都是以电子方式入账的,账号填错不仅会耽误您的申报,也会影响该员工自己的供款记录。

## 2. 在第一天上班前,而不是之后,把文书工作准备妥当

一份书面雇佣合约(至少也应是一份涵盖职位、薪资、工作时间和通知期的聘书)应在第一天上班前就已存在,原因有两个:《雇佣法令》对大多数类别的员工都要求有这样的文件;而且这正是日后第一次就休假、加班或解雇发生争议时,您会翻回去查阅的文件。

两份 LHDN 表格值得在早期留意:
- **CP22**——用于通知 LHDN 有新员工入职,需在入职后的规定天数内提交(具体期限请以 LHDN 当前公布的为准,因为这一期限过去曾经调整过,不值得凭猜测行事)。
- **CP22A/CP22B**——员工离职时对应使用的表格,目前虽不紧急,但值得先了解它的存在。

从第一天起,为每位员工建立一份简单的人事档案:合约、身份证副本、银行资料,以及日后的任何变更(加薪、晋升等)。这是 EPF 或 SOCSO 审查时第一个会要求查看的东西,如果从一开始就养成这个习惯,远比日后在压力之下临时拼凑要轻松得多。

在起草第一份合约之前,也值得先读一读《雇佣法令》规定的基本权益,即使您的雇员未必落入该法令按薪资门槛规定的严格适用范围——年假、病假的最低天数、休息日和加班规则,都是新员工(或者一旦有人投诉,劳工官员)会预期您早已了解,而不是等纠纷发生了才临时去查的内容。

## 3. 弄清楚 EPF、SOCSO 与 EIS 到底各自要缴多少

这三项扣款是马来西亚薪酬体系的核心,但三者的运作方式各不相同:

### EPF(退休储蓄)
雇主与雇员都按月薪的一定比例,向该员工的 EPF 账户供款。对于60岁以下的马来西亚公民或永久居民,雇员与雇主各自应缴的比例都列在 EPF 自己公布的供款表(第三附表)中,而雇主的比例实际上会随薪资档次而变化,所以不要以为同一个比例适用于所有薪资水平。EPF 官方公布的供款比例表,才是唯一值得据以计算的依据——它会不时修订,您在某篇旧文章里读到的比例,很可能早已过时。

### SOCSO(工伤与伤残保障)
SOCSO 涵盖两项计划——工伤保险计划与伤残抚恤金计划——由雇主缴纳较小比例、雇员缴纳更小比例的供款共同支持,计算时则对月薪设有一个上限,而 PERKESO 会不时向上调整这个上限。请直接到 PERKESO 官网核实当前的上限与两项比例,而不要依赖本文给出的固定数字——正因为这个上限近年来调整过,才是本指南不会在此处为您"钉死"一个数字的原因。

### EIS(失业保障)
这是一项较小、独立的供款——由雇主与雇员平均分摊——用于在员工日后被裁员时,提供短期经济援助与求职协助。它与 SOCSO 使用同一张 PERKESO 供款表一并征收,所以一旦您设置好其中一项,设置另一项基本只是手续上的事。

> 对待 EPF/SOCSO/EIS 的供款比例表,应该像对待汇率一样——不是记一次就一成不变的事实。每次有新员工入职,或调整薪资时,都应重新查阅当前公布的表格,因为这三项比例过去都曾调整过,日后也很可能再次调整。

## 4. 从第一张薪水单开始,就正确设置月度预扣税(PCB/MTD)

除了 EPF/SOCSO/EIS 之外,您还需要从员工薪资中扣除月度预扣税(马来文简称 PCB,英文常称 MTD),并汇缴给 LHDN——这是员工自己全年所得税的预缴,而不是雇主的成本,但算错了仍然是雇主要负责纠正的问题。LHDN 公布了官方的 PCB 计算器与计算表;大多数马来西亚薪酬软件(以及用于人工核对的 LHDN 官方计算器)都会根据员工的月薪、婚姻状况和所申报的子女人数自动计算——这些资料值得在入职时用一张简短表格收集齐全,因为一旦填错,现在少扣的部分,日后报税时就会变成员工自己要补的税务缺口。

## 5. 建立薪酬日历,并严格遵守

一旦完成注册并发出第一张薪水单,接下来主要的工作就是把握时间:EPF、SOCSO/EIS 与 PCB 各自有向相应机构汇缴的月度期限,通常是在次月的头两到三周内——具体日期请以各机构当前公布的为准,因为这也是机构会不时调整的数字。任何一项迟交,即使只迟一天,通常都会触发原本完全可以避免的逾期罚款。

大多数小雇主适用的简单月度流程:
- 每月固定一个日期发薪并发出薪水单。
- 在各自的期限前,为当月申报并缴纳 EPF、SOCSO/EIS 和 PCB。
- 保留每一次申报的电子收据副本——EPF、PERKESO 和 LHDN 都会生成收据;多年后被审查时,有一份完整的记录远比留下空白、事后再去解释要轻松得多。

## 6. 早做决定:自己处理,还是寻求协助

如果您能严格遵守上文所说的日历,单一员工的情况下,用一份表格加上三个机构各自的平台就足以应付。一旦您雇用到第二、第三位员工,大多数马来西亚中小企业会转向两种做法之一:订阅薪酬软件(自动计算 EPF/SOCSO/EIS/PCB,部分还能直接代为申报),或委托一家代理薪酬/会计业务的公司,按月收费代您处理申报。两者在只有一名员工时都不是强制性的,但提前做好决定——而不是在错过期限后手忙脚乱地临时决定——成本要低得多。

把这个决定,与迟交或错报实际造成的代价作个比较:薪酬软件订阅或会计代理费,是可预期、固定的每月支出;而因 EPF 或 SOCSO 逾期缴款被罚款,或是数月后才去纠正一个算错的 PCB 扣款,所耗费的金钱和您自己的时间,往往都超过了您原本想省下的那笔服务费。

让您的企业本身更容易被找到,在开始招聘之后同样重要——团队扩大通常也意味着客户群在扩大,在处理好本指南所涉及的运营事项之余,[在这里刊登您的企业](/zh/signup)是免费且快速的做法,能让第一位员工日后要服务的客户找到您。也值得[浏览一下其他已经刊登的企业](/zh),看看其他马来西亚中小企业——其中不少也曾是不久前的首次雇主——在规模超过一人经营之后,是如何呈现自己的。

## 首次雇主最常犯的错误

- **在员工已经开始上班之后,才向 EPF 或 SOCSO 办理注册。** 三个机构都是按实际入职日期计算供款,而不是按注册日期,所以迟办注册仍然意味着要补缴这段期间的供款,甚至可能还要额外罚款。
- **直接照搬旧文章或旧模板里的供款比例,而不去核实当前的表格。** EPF、SOCSO 与 EIS 的比例和薪资上限近年都曾调整——十八个月前还正确的数字,现在很可能已经过时。
- **认为第一位员工人数少,PCB/MTD 就可以先不管。** 这是法定的扣缴义务,与雇员人数无关,而少扣的部分并不会自动消失——它会变成员工自己的税务缺口,也会变成报税季节您自己的信誉问题。

## 本周可以从这里开始

- **今天:** 准备好您的 SSM 注册资料,以及新员工的身份证和银行账户号码,并查核 EPF、PERKESO 与 LHDN 当前公布的注册期限,明确自己正对着哪个具体日期。
- **在员工第一天上班前:** 向 EPF 与 PERKESO 办理雇主注册,签署一份书面合约,并设置好(或确认已有)LHDN 雇主号。
- **在第一个发薪周期内:** 提交 CP22,对照各机构当前公布的表格核实 EPF/SOCSO/EIS 的比例,并通过 LHDN 的计算器或您的薪酬软件,计算 PCB 后发出第一张薪水单。
- **此后每个月:** 在期限前缴纳 EPF、SOCSO/EIS 和 PCB,并把每一次申报的收据统一归档保存。

把这件事一次做对、做扎实,之后每一次雇人基本上就是重复流程——真正的代价从来不是这些文书手续本身,而是在没人留意的时候,悄悄累积起来的补缴款和罚款。`,
        faqs: [
      {
        question: "如果我只雇用一名员工,也需要注册 EPF 和 SOCSO 吗?",
        answer:
          "需要。注册义务从您雇用的第一位员工开始就适用,与雇员人数无关——并不存在\"只雇一人可豁免\"的情况。如果您还没有 LHDN 雇主号,同样需要申请。",
      },
      {
        question: "EPF、SOCSO 和 EIS 有什么区别?",
        answer:
          "EPF 是退休储蓄计划,雇主与雇员都按月薪的一定比例,向该员工自己的账户供款。SOCSO 提供工伤与伤残保障,而 EIS 则在员工日后被裁员时提供短期经济援助。SOCSO 与 EIS 由 PERKESO 统一管理,而 EPF 则是完全独立的另一个机构。",
      },
      {
        question: "雇用员工后,我需要多快完成雇主注册?",
        answer:
          "EPF、PERKESO 与 LHDN 各自设定自己的期限,而这些期限过去都曾经调整过,所以请在员工入职日期之前,到各机构官网核实当前的要求,而不要依赖记忆中的数字。应把它当作每次雇人都要重新核实的事项,而不是查一次就永久沿用。",
      },
      {
        question: "PCB/MTD 是什么?它和 EPF 有什么不同?",
        answer:
          "PCB(月度预扣税,英文也称 MTD)是按月预先从员工薪资中扣缴、用于抵缴其全年所得税的款项,汇缴给 LHDN。它与 EPF、SOCSO、EIS 完全不同——后三者都是社会保障与退休供款,而不是所得税。",
      },
      {
        question: "外籍员工也需要注册 EPF 和 SOCSO 吗?",
        answer:
          "就 SOCSO 而言,一般是需要的;而近年马来西亚法规的调整也将 EPF 的覆盖范围扩大到了外籍员工——由于这是一个曾经变化、且可能继续变化的领域,请直接到 EPF 和 PERKESO 官网核实适用于外籍员工的当前规则与比例。",
      },
      {
        question: "如果我注册迟了,或错过了某个月的供款,会怎样?",
        answer:
          "供款通常是按员工实际入职日期计算的,而不是按注册日期,所以迟注册通常仍然意味着要补缴这段期间的款项,往往还要加上罚款。错过某月的缴款期限,通常同样会触发逾期罚款,因此应尽快纠正,而不要让问题在接下来的几个月里持续累积。",
      },
      {
        question: "我雇用第一位员工,需要书面雇佣合约吗?",
        answer:
          "对于大多数类别的员工,《雇佣法令》都明确要求有书面合约,至少也应是一份清楚说明职位、薪资、工作时间和通知期的聘书——这正是日后一旦发生争议时,您会依据的文件。即使第一位员工是非常小规模或较为随意的安排,也应把它当作基本要求,而不是可以省略的形式。",
      },
      {
        question: "对于一名员工,我应该自己处理薪酬,还是请薪酬服务代劳?",
        answer:
          "对于单一员工,许多首次雇主会自己用一份表格加上各机构的官方平台来处理,只要能严格遵守每月的申报日历。随着员工人数增加,薪酬软件或外包服务商通常就值得每月支付的费用——提前做好决定,而不是等错过期限之后才决定,通常是更好的时机。",
      },
        ],
      },
      ms: {
        title: "Mengambil Pekerja Pertama di Malaysia: Asas KWSP, SOCSO, EIS dan Gaji",
        excerpt:
          "Mengambil pekerja pertama anda di Malaysia bermakna mendaftar dengan KWSP, SOCSO/EIS, dan LHDN, masing-masing dengan tarikh akhir dan kerja kertas tersendiri. Panduan ini merangkumi apa yang perlu disediakan oleh majikan kali pertama sebelum hari pertama, bagaimana caruman berkanun sebenarnya berfungsi, dan tabiat gaji yang mengekalkan kepatuhan anda setiap bulan selepas itu.",
        body: `Mengambil pekerja pertama anda mengubah jenis perniagaan yang anda jalankan — bukan sekadar dari segi bilangan pekerja, tetapi dari segi kerja kertas dan kepatuhan. Sebaik sahaja seseorang berada dalam senarai gaji, anda memikul tanggungjawab undang-undang kepada tiga badan berkanun yang berbeza (KWSP, PERKESO untuk SOCSO/EIS, dan LHDN) — tanggungjawab yang tidak terpakai semasa anda bekerja sendirian, bersama rakan kongsi, atau dengan kontraktor yang menghantar invois menggunakan nombor KWSP/SST mereka sendiri. Tidak satu pun daripada ini terlalu rumit, tetapi semuanya perlu dilakukan dalam susunan yang betul dan tepat pada masanya, atau penalti dan bayaran tertunggak akan menjadi tanggungan anda, bukan pekerja baharu itu. Panduan ini merangkumi apa yang sebenarnya perlu dilakukan oleh majikan kali pertama di Malaysia, dari seminggu sebelum seseorang mula bekerja hingga beberapa kitaran gaji pertama selepas itu.

## 1. Daftar sebagai Majikan Sebelum Hari Pertama Pekerja Anda

Tiga pendaftaran berasingan perlu wujud sebelum anda menjalankan gaji pertama anda, dan setiap satu dikendalikan oleh agensi yang berbeza:

- **KWSP (EPF)** — daftar sebagai majikan untuk mendapatkan nombor rujukan majikan, kemudian daftarkan pekerja baharu di bawah nombor tersebut.
- **SOCSO dan EIS (PERKESO)** — satu pendaftaran merangkumi kedua-duanya; PERKESO menganggapnya sebagai satu akaun majikan dengan dua skim di bawahnya.
- **LHDN** — daftar untuk nombor majikan (E) jika anda belum mempunyainya, supaya anda boleh menghantar potongan cukai bulanan pekerja.

Portal rasmi setiap agensi (i-Akaun KWSP, ASSIST PERKESO, dan e-Daftar/MyTax LHDN) mengendalikan pendaftaran sebenar, dan setiap agensi menetapkan tempoh masa tersendiri untuk pendaftaran ini selepas pengambilan pekerja pertama — biasanya disebut dalam lingkungan beberapa hari hingga beberapa minggu, bergantung pada agensi tersebut. Daripada bertindak berdasarkan nombor yang diingati separuh-separuh, semak tarikh akhir semasa di laman web rasmi setiap agensi sebelum tarikh mula pekerja anda, kerana penalti kerana lewat mendaftar dikenakan kepada majikan dan tidak digugurkan hanya kerana ini kali pertama anda mengambil pekerja.

### Apa yang Perlu Disediakan
Butiran pendaftaran perniagaan anda (SSM), kad pengenalan anda sendiri, serta kad pengenalan dan butiran akaun bank pekerja baharu — caruman KWSP dan SOCSO dikreditkan secara elektronik, jadi nombor akaun yang salah akan melambatkan bukan sahaja penyerahan anda tetapi juga rekod caruman pekerja itu sendiri.

## 2. Sediakan Kerja Kertas Sebelum, Bukan Selepas, Hari Pertama

Kontrak pekerjaan bertulis (atau sekurang-kurangnya surat tawaran yang merangkumi jawatan, gaji, waktu bekerja, dan tempoh notis) sepatutnya wujud sebelum hari pertama bekerja, atas dua sebab: Akta Kerja menetapkan keperluan ini untuk kebanyakan kategori pekerja, dan inilah dokumen yang akan anda rujuk semula apabila pertikaian pertama mengenai cuti, kerja lebih masa, atau penamatan tercetus.

Dua borang LHDN penting pada peringkat awal:
- **CP22** — memberitahu LHDN tentang pekerja baharu, difailkan dalam tempoh hari tertentu selepas tarikh mula bekerja (sahkan tempoh semasa dengan LHDN, kerana ia pernah berubah dan tidak wajar diandaikan begitu sahaja).
- **CP22A/CP22B** — borang yang setara apabila seorang pekerja berhenti kerja, yang relevan kemudian tetapi wajar diketahui kewujudannya dari sekarang.

Simpan satu fail peribadi yang ringkas untuk setiap pekerja sejak hari pertama: kontrak, salinan kad pengenalan, butiran bank, dan sebarang pindaan kemudian (perubahan gaji, kenaikan pangkat). Inilah perkara pertama yang akan diminta oleh audit KWSP atau SOCSO, dan paling mudah disediakan jika anda membentuk tabiat ini dari awal berbanding terpaksa menyusunnya semula di bawah tekanan kemudian.

Wajar juga membaca hak asas di bawah Akta Kerja sebelum anda merangka kontrak pertama itu, walaupun pekerja anda mungkin tidak termasuk dalam liputan ketat berasaskan gaji akta tersebut — had minimum cuti tahunan dan cuti sakit, hari rehat, dan peraturan kerja lebih masa adalah perkara yang pekerja baharu (atau pegawai buruh, sekiranya ada aduan difailkan) akan menjangkakan anda sudah ketahui, bukan sesuatu yang anda cari buat pertama kali selepas pertikaian bermula.

## 3. Fahami Apa yang Sebenarnya Perlu Dibayar oleh Kedua-dua Pihak untuk KWSP, SOCSO, dan EIS

Tiga potongan ini adalah teras sistem gaji di Malaysia, dan setiap satu berfungsi dengan cara yang sedikit berbeza:

### KWSP (Simpanan Persaraan)
Majikan dan pekerja kedua-duanya menyumbang peratusan gaji bulanan ke dalam akaun KWSP pekerja. Bagi warganegara Malaysia atau penduduk tetap di bawah umur 60 tahun, bahagian pekerja dan bahagian majikan kedua-duanya ditetapkan dalam jadual caruman rasmi KWSP (Jadual Ketiga), dan peratusan majikan sebenarnya boleh berubah mengikut peringkat gaji, jadi jangan anggap satu nombor tetap terpakai pada semua tahap gaji. Jadual kadar caruman rasmi KWSP adalah satu-satunya sumber yang wajar digunakan untuk pengiraan — ia disemak dari semasa ke semasa, dan kadar yang anda baca dalam artikel blog lama mungkin sudah tidak terkini.

### SOCSO (Perlindungan Kemalangan dan Hilang Upaya)
SOCSO merangkumi dua skim — Skim Bencana Pekerjaan dan Skim Pencen Hilang Upaya — dibiayai melalui caruman majikan yang kecil dan caruman pekerja yang lebih kecil lagi, dikira berdasarkan siling gaji bulanan yang disemak semula oleh PERKESO dari semasa ke semasa ke arah yang lebih tinggi. Sahkan siling semasa dan kedua-dua peratusan di laman web rasmi PERKESO berbanding bergantung pada angka tetap di sini — justru kerana siling tersebut telah berubah dalam tahun-tahun kebelakangan ini, itulah sebabnya panduan ini tidak membekukan satu nombor di sini.

### EIS (Perlindungan Pengangguran)
Satu caruman yang lebih kecil dan berasingan — dibahagi sama rata antara majikan dan pekerja — membiayai bantuan kewangan jangka pendek dan bantuan mencari kerja sekiranya pekerja kemudiannya diberhentikan kerja. Ia dikumpul bersama SOCSO menggunakan jadual PERKESO yang sama, jadi sebaik sahaja anda menyediakan satu, menyediakan yang satu lagi hanyalah formaliti.

> Layan jadual kadar KWSP/SOCSO/EIS sebagaimana anda melayan kadar tukaran matawang, bukan fakta yang anda hafal sekali sahaja — semak jadual rasmi semasa setiap kali anda mengambil pekerja baharu atau melaraskan gaji, kerana ketiga-tiganya pernah disemak semula pada masa lalu dan berkemungkinan akan disemak semula lagi.

## 4. Sediakan Potongan Cukai Bulanan (PCB/MTD) dengan Betul Sejak Slip Gaji Pertama

Berasingan daripada KWSP/SOCSO/EIS, anda dikehendaki memotong Potongan Cukai Bulanan (PCB, atau MTD) daripada gaji pekerja dan menghantarnya kepada LHDN — ini adalah bayaran pendahuluan untuk cukai pendapatan tahunan pekerja itu sendiri, bukan kos majikan, tetapi mengira secara salah masih menjadi masalah majikan untuk diperbetulkan. LHDN menerbitkan kalkulator dan jadual PCB rasmi; kebanyakan perisian gaji Malaysia (dan kalkulator rasmi LHDN, untuk semakan manual) mengaplikasikannya secara automatik berdasarkan gaji bulanan pekerja, status perkahwinan, dan bilangan anak yang dituntut — butiran yang wajar dikumpul melalui borang ringkas semasa pengambilan pekerja, kerana mengisi secara salah kini bermakna mengurangkan potongan sekarang dan mewujudkan kekurangan yang akan ditemui oleh pekerja semasa memfailkan cukai kemudian.

## 5. Bina Kalendar Gaji dan Patuhi Ia

Sebaik sahaja pendaftaran dan slip gaji pertama selesai, kerja berterusan kebanyakannya tentang masa: KWSP, SOCSO/EIS, dan PCB masing-masing mempunyai tarikh akhir penghantaran bulanan tersendiri kepada agensi masing-masing, biasanya dalam dua hingga tiga minggu pertama bulan berikutnya — sahkan tarikh tepat untuk setiap satu di portal semasa masing-masing, kerana ini juga nombor yang kadangkala dilaraskan oleh agensi. Terlepas mana-mana satu, walaupun hanya sehari, biasanya mencetuskan penalti lewat bayar yang sepenuhnya boleh dielakkan dengan peringatan kalendar.

Rutin bulanan ringkas yang merangkumi kebanyakan majikan kecil:
- Jalankan gaji dan keluarkan slip gaji pada tarikh tetap setiap bulan.
- Hantar dan bayar KWSP, SOCSO/EIS, dan PCB untuk bulan tersebut mengikut tarikh akhir masing-masing.
- Simpan salinan digital setiap resit penghantaran — KWSP, PERKESO, dan LHDN semuanya menjana satu; audit bertahun-tahun kemudian jauh lebih tidak tertekan dengan fail yang lengkap berbanding jurang yang perlu anda jelaskan.

## 6. Buat Keputusan Lebih Awal: Uruskan Sendiri, atau Dapatkan Bantuan

Seorang pekerja tunggal boleh diuruskan dengan hamparan (spreadsheet) ditambah portal ketiga-tiga agensi, sekiranya anda berdisiplin dengan kalendar di atas. Sebaik sahaja anda mengambil pekerja kedua atau ketiga, kebanyakan majikan kecil Malaysia beralih kepada sama ada subskripsi perisian gaji (yang mengira KWSP/SOCSO/EIS/PCB secara automatik dan memfailkan sebahagiannya secara terus) atau firma gaji/perakaunan luar yang mengendalikan penyerahan bagi pihak anda dengan bayaran bulanan. Tidak satu pun wajib pada tahap seorang pekerja, tetapi membuat keputusan sebelum anda benar-benar memerlukannya — berbanding di tengah-tengah krisis selepas tarikh akhir terlepas — adalah cara yang lebih murah untuk membuat keputusan itu.

Timbangkan ini berbanding kos sebenar penyerahan yang terlepas atau lewat: subskripsi gaji atau bayaran retainer perakaunan adalah perbelanjaan bulanan yang boleh dijangka, sementara penalti kerana bayaran KWSP atau SOCSO yang lewat, atau kerumitan membetulkan potongan PCB yang salah berbulan-bulan kemudian, selalunya menelan kos yang lebih besar dari segi wang dan masa anda sendiri berbanding perkhidmatan yang anda cuba elakkan membayar pada mulanya.

Memastikan perniagaan anda sendiri lebih mudah ditemui juga penting sebaik sahaja anda mula mengambil pekerja — pasukan yang semakin besar biasanya bermakna pangkalan pelanggan yang semakin besar juga, dan [menyenaraikan perniagaan anda di sini](/ms/signup) bersama aspek operasi yang dirangkumi dalam panduan ini adalah cara percuma dan pantas untuk ditemui oleh pelanggan yang akan dibantu oleh pekerja pertama itu. Wajar juga [melihat apa yang telah disenaraikan](/ms) untuk melihat bagaimana PKS Malaysia lain — ramai antaranya juga pernah menjadi majikan kali pertama tidak lama dahulu — mempersembahkan diri mereka sebaik sahaja berkembang melangkasi operasi seorang.

## Kesilapan Biasa yang Dilakukan oleh Majikan Kali Pertama

- **Mendaftar dengan KWSP atau SOCSO selepas pekerja sudah mula bekerja.** Ketiga-tiga agensi mengira caruman daripada tarikh mula sebenar, bukan tarikh pendaftaran, jadi pendaftaran yang lewat masih bermakna bayaran tertunggak untuk jurang tersebut, ditambah kemungkinan penalti.
- **Menyalin kadar caruman daripada artikel atau templat lama tanpa menyemak jadual semasa.** Kadar dan siling gaji KWSP, SOCSO, dan EIS semuanya pernah berubah dalam tahun-tahun kebelakangan ini — nombor yang betul lapan belas bulan dahulu mungkin sudah tidak tepat.
- **Menganggap PCB/MTD sebagai pilihan untuk pekerja pertama yang kecil.** Ia adalah tanggungjawab potongan undang-undang tanpa mengira bilangan pekerja, dan kekurangan potongan tidak hilang begitu sahaja — ia menjadi kekurangan cukai pekerja, dan masalah kredibiliti anda sendiri apabila musim memfailkan cukai tiba.

## Di Mana Harus Bermula Minggu Ini

- **Hari ini:** Kumpulkan butiran pendaftaran SSM anda serta kad pengenalan dan nombor akaun bank pekerja baharu, dan semak tarikh akhir pendaftaran semasa KWSP, PERKESO, dan LHDN supaya anda tahu dengan tepat tarikh yang anda kejar.
- **Sebelum hari pertama mereka:** Daftar sebagai majikan dengan KWSP dan PERKESO, dapatkan kontrak bertulis yang ditandatangani, dan sediakan (atau sahkan anda sudah mempunyai) nombor majikan LHDN.
- **Dalam kitaran gaji pertama:** Failkan CP22, sahkan kadar KWSP/SOCSO/EIS semasa berbanding jadual rasmi setiap agensi, dan jalankan slip gaji pertama anda dengan PCB dikira melalui kalkulator LHDN atau perisian gaji anda.
- **Setiap bulan selepas itu:** Bayar KWSP, SOCSO/EIS, dan PCB mengikut tarikh akhir masing-masing, dan simpan setiap resit penyerahan dalam satu fail.

Lakukan ini sekali dengan betul, dan setiap pengambilan pekerja selepas yang pertama kebanyakannya hanya pengulangan — kos sebenar melakukan ini secara salah bukan kerja kertas itu sendiri, tetapi bayaran tertunggak dan penalti yang bertimbun semasa tidak ada sesiapa yang menyemak.`,
        faqs: [
      {
        question: "Adakah saya perlu mendaftar dengan KWSP dan SOCSO untuk hanya seorang pekerja?",
        answer:
          "Ya. Tanggungjawab pendaftaran terpakai sejak pekerja pertama anda, tanpa mengira bilangan pekerja — tiada pengecualian untuk pengambilan seorang pekerja sahaja. Perkara yang sama terpakai untuk mendaftar nombor majikan LHDN jika anda belum memilikinya.",
      },
      {
        question: "Apakah perbezaan antara KWSP, SOCSO, dan EIS?",
        answer:
          "KWSP adalah skim simpanan persaraan, di mana majikan dan pekerja kedua-duanya menyumbang peratusan gaji bulanan ke dalam akaun pekerja itu sendiri. SOCSO merangkumi perlindungan kemalangan pekerjaan dan hilang upaya, manakala EIS menyediakan bantuan kewangan jangka pendek sekiranya pekerja kemudiannya diberhentikan kerja. SOCSO dan EIS ditadbir bersama oleh PERKESO, manakala KWSP adalah agensi yang sepenuhnya berasingan.",
      },
      {
        question: "Berapa cepat selepas mengambil pekerja saya perlu mendaftar sebagai majikan?",
        answer:
          "Setiap agensi — KWSP, PERKESO, dan LHDN — menetapkan tarikh akhir tersendiri, dan ini pernah berubah sebelum ini, jadi semak keperluan semasa di portal rasmi setiap agensi sebelum tarikh mula pekerja anda, bukannya bergantung pada nombor yang diingati. Anggap ini sebagai sesuatu yang perlu disahkan bagi setiap pengambilan pekerja, bukan sesuatu yang disemak sekali dan digunakan selama-lamanya.",
      },
      {
        question: "Apakah PCB/MTD, dan adakah ia berbeza daripada KWSP?",
        answer:
          "PCB (Potongan Cukai Bulanan), juga dipanggil MTD, adalah potongan pendahuluan bulanan ke arah cukai pendapatan tahunan pekerja, dihantar kepada LHDN. Ia sepenuhnya berasingan daripada KWSP, SOCSO, dan EIS, yang semuanya adalah caruman keselamatan sosial dan persaraan, bukan cukai pendapatan.",
      },
      {
        question: "Adakah pekerja asing juga perlu didaftarkan untuk KWSP dan SOCSO?",
        answer:
          "Secara umum, ya untuk SOCSO, dan liputan KWSP untuk pekerja asing juga telah diperluaskan menerusi perubahan terkini kepada peraturan Malaysia — sahkan peraturan dan kadar semasa untuk pekerja asing di laman web rasmi KWSP dan PERKESO, kerana ini adalah bidang yang telah berubah dan mungkin terus berubah.",
      },
      {
        question: "Apa yang berlaku jika saya mendaftar lewat atau terlepas caruman bulanan?",
        answer:
          "Caruman biasanya dikira berdasarkan tarikh mula sebenar pekerja, tanpa mengira bila anda mendaftar, jadi pendaftaran lewat biasanya masih bermakna anda perlu membayar jumlah tertunggak, selalunya disertai penalti. Terlepas tarikh akhir bayaran bulanan juga biasanya mencetuskan caj lewat bayar, jadi wajar diperbetulkan dengan segera berbanding dibiarkan bertimbun merentasi lebih banyak bulan.",
      },
      {
        question: "Adakah saya perlukan kontrak pekerjaan bertulis untuk pekerja pertama saya?",
        answer:
          "Kontrak bertulis, atau sekurang-kurangnya surat tawaran yang jelas merangkumi jawatan, gaji, waktu bekerja, dan tempoh notis, amat dijangkakan di bawah Akta Kerja bagi kebanyakan kategori pekerja, dan inilah dokumen yang akan anda rujuk sekiranya pertikaian timbul kemudian. Anggap ia sebagai keperluan asas, bukan formaliti pilihan, walaupun untuk pengambilan pekerja pertama yang sangat kecil atau tidak formal.",
      },
      {
        question: "Patutkah saya menguruskan gaji sendiri atau mengupah perkhidmatan gaji untuk seorang pekerja?",
        answer:
          "Bagi seorang pekerja, ramai majikan kali pertama menguruskannya sendiri menggunakan hamparan (spreadsheet) dan portal rasmi setiap agensi, selagi mereka berdisiplin dengan kalendar penyerahan bulanan. Apabila bilangan pekerja bertambah, perisian gaji atau penyedia luar biasanya menjadi berbaloi dengan kos bulanannya — membuat keputusan sebelum anda benar-benar memerlukannya, berbanding selepas tarikh akhir terlepas, biasanya masa yang lebih baik untuk membuat keputusan itu.",
      },
        ],
      },
    },
  },
  {
    slug: "sst-registration-in-malaysia",
    title: "SST Registration in Malaysia: Do You Need to Register for Sales and Service Tax?",
    seoTitle: "SST Registration in Malaysia: Do You Need to Register?",
    seoDescription:
      "How to work out whether your Malaysian business must register for SST, how Sales Tax and Service Tax differ, registration thresholds, and the MySST process.",
    coverImage: {
      file: "sst-registration-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A confident small business owner reviewing invoices and receipts at the counter of their shop",
      altTranslations: {
        zh: "一位自信的小企业主在店铺柜台查看发票与收据",
        ms: "Seorang pemilik perniagaan kecil yang yakin menyemak invois dan resit di kaunter kedainya",
      },
    },
    contentImages: {
      turnover: {
        file: "sst-registration-in-malaysia-turnover.webp",
        mimeType: "image/webp",
        alt: "A business owner checking financial records and sales figures on a laptop at their shop counter",
        altTranslations: {
          zh: "一位企业主在店铺柜台用笔记本电脑查看财务记录与销售数字",
          ms: "Seorang pemilik perniagaan menyemak rekod kewangan dan angka jualan pada komputer riba di kaunter kedainya",
        },
        after: "Build a habit of checking your trailing 12-month taxable turnover periodically, not just once when you first worried about it, so registration happens because you planned for it rather than because RMCD flagged it first.",
        afterTranslations: {
          zh: "请养成定期核查滚动12个月应税营业额的习惯,而不只是在第一次担心这个问题时查一次,这样注册才会是您提前规划好的结果,而不是被 RMCD 先一步发现的结果。",
          ms: "Bina tabiat menyemak hasil jualan boleh cukai bergolek 12 bulan anda secara berkala, bukan hanya sekali apabila anda mula-mula bimbang tentangnya, supaya pendaftaran berlaku kerana anda merancangnya, bukan kerana RMCD yang menyedarinya terlebih dahulu.",
        },
      },
    },
    excerpt:
      "SST registration becomes mandatory once a Malaysian business crosses its specific turnover threshold, but Sales Tax and Service Tax work differently and thresholds vary by category. This guide covers how to check whether you need to register, how to register through MySST, and what changes for your business once you are.",
    body: `"Do I need to register for SST?" is one of the most common questions a growing Malaysian SME eventually asks, usually right around the point revenue starts climbing fast enough that the answer might have quietly changed. Sales and Service Tax (SST) registration isn't optional once you cross the relevant threshold — it's a legal obligation enforced by the Royal Malaysian Customs Department (RMCD/Kastam) — but it's also not one single rule that applies the same way to every business. This guide covers how to work out whether you need to register, how the two taxes actually differ, how registration itself works, and what changes for your business once you are.

## 1. Understand that "SST" is actually two separate taxes

Sales Tax and Service Tax are run under one administrative umbrella but apply to genuinely different things, and mixing them up is the single most common source of confusion for a first-time registrant.

- **Sales Tax** applies to taxable goods — generally charged once, at the manufacturer or importer level, and baked into the price by the time it reaches a retailer. Most retailers and traders never register for sales tax themselves; it's typically a manufacturer's or importer's obligation.
- **Service Tax** applies to specific categories of taxable services — things like food and beverage services, professional services (legal, accounting, consultancy, and others), telecommunications, and a growing list of other prescribed categories. This is the one most Malaysian SMEs in retail, F&B, and services actually need to think about.

Which one (or both) applies to you depends entirely on what your business does, not its size alone — a small manufacturer can owe sales tax, while a large but non-taxable-service business might owe nothing at all.

## 2. Check your registration threshold — and don't assume it's the same for every business

The commonly cited baseline threshold is RM500,000 in taxable turnover over any 12-month period, and for a long list of service categories and for most sales-tax-liable manufacturers, that's exactly the number that triggers mandatory registration. But several specific service categories have their own, different threshold set by RMCD — some sit well above RM500,000, and a small number of categories (certain professional and customs-related services among them) have no minimum threshold at all, meaning registration is required regardless of turnover.

### How to check which threshold actually applies to you
Because thresholds vary by the specific service category your business falls under, and RMCD updates its schedules from time to time, don't rely on a number you read somewhere once — check the current Service Tax Regulations' registration threshold schedule, or confirm directly through the MySST portal or an RMCD counter, against the exact category your business operates under.

> The RM500,000 figure gets repeated everywhere because it's the baseline most businesses land on — but "most" isn't "all," and the one category your business actually falls under is the only number that matters. Confirm it specifically rather than assuming the commonly quoted figure applies to you.

To make this concrete: food and beverage outlets (restaurants, cafes, catering) have historically sat at a higher threshold than the common RM500,000 baseline, while categories like hotels and similar accommodation, and a number of professional services, are typically cited at the RM500,000 level — and a handful of categories, such as certain customs agents and some professional services, have no threshold at all. Rental or leasing and construction services have also been cited at different threshold levels across different RMCD updates. None of these specific figures should be taken as fixed without checking the current schedule yourself — thresholds by category are exactly the kind of detail that gets revised as the scope of taxable services expands, which it has done more than once in recent years.

The 12-month period itself is a rolling window, not a calendar year — RMCD looks at your turnover over the preceding 12 months (or your reasonably projected turnover for the coming 12 months, if you expect to cross the threshold). That means a business can become liable to register mid-year, the moment a trailing 12-month total crosses the line, not just at year-end.

## 3. Registering once you've confirmed you're liable

Registration is done through the MySST portal (RMCD's online system), and once you've confirmed which threshold applies and that you've crossed it, registration itself is a fairly standard process:

1. Prepare your business registration documents (SSM), recent financial records showing the turnover that triggered registration, and your business bank account details.
2. Submit the registration application through MySST, selecting the correct taxable category for what your business actually does.
3. RMCD reviews and approves the application, after which you're issued an SST registration number.

RMCD sets a deadline for registering once you become liable — commonly cited as within a set number of days of crossing the threshold — so confirm the current deadline on MySST rather than treating "I'll get to it next quarter" as a safe assumption; operating above the threshold without registering is itself a compliance breach, independent of whether you've started charging SST yet.

### If you've already crossed the threshold and haven't registered
This isn't a rare situation — plenty of growing businesses realize months after the fact that a busy quarter pushed them over. RMCD generally expects backdated registration from the date liability actually started, which can mean working out SST on sales already made without having charged it, plus a possible penalty for the late registration itself. The earlier this is sorted out directly with RMCD or through an accountant, the smaller that gap tends to stay — leaving it to compound across more filing periods only makes the eventual conversation harder.

## 4. What actually changes once you're registered

Registration isn't the end of the process — it's the point where new obligations start:

- **Charging SST on your invoices.** Once registered, you charge the applicable SST rate on your taxable goods or services and show it clearly on invoices and receipts, the same way a non-registered business doesn't.
- **Filing returns on schedule.** Registered businesses file an SST return (commonly every two months, though confirm your specific filing cycle on MySST) declaring the tax collected, and pay what's due by the filing deadline.
- **Keeping proper records.** Invoices, credit notes, and supporting documents need to be kept for the period RMCD requires, since they're exactly what an audit will ask to see first.
- **Updating your pricing and accounting systems.** Whatever you use to invoice and do your books needs to actually calculate and display SST correctly from the registration date forward — retrofitting this after the fact, on invoices already issued, is far more painful than setting it up before you need it.

A listing that's easy to find matters here too — a business taking on the extra admin of SST registration is usually a business that's growing, and [creating a free listing](/en/signup) is one more way new customers find you while you're sorting out the compliance side. Looking at [how other registered Malaysian businesses present their services](/en) is also a reasonable way to see what a maturing SME's public presence typically looks like.

## 5. Consider voluntary registration, even below the threshold

A business under the threshold isn't barred from registering — RMCD allows voluntary registration for a business that wants to register before it's legally required to. This is worth weighing, not assuming either way: some B2B service providers register early because their own customers (often larger, registered businesses) expect a proper SST-compliant invoice; others stay unregistered as long as possible to avoid the added admin and the price increase SST effectively represents to an end customer. There's no universally right answer — it depends on who your customers are and whether they care about a registered invoice.

## 6. Keep watching your rolling 12-month turnover after you've dealt with this

SST liability isn't a one-time check — a business that's comfortably under the threshold today can cross it eight months from now on genuinely good news (a big new client, a busy season, a successful new product line). Build a habit of checking your trailing 12-month taxable turnover periodically, not just once when you first worried about it, so registration happens because you planned for it rather than because RMCD flagged it first.

## Common mistakes businesses make with SST registration

- **Assuming RM500,000 is a universal number.** Several service categories have their own, different threshold, and a handful have no minimum at all — the number that matters is the one for your specific category, not the one everyone quotes.
- **Confusing Sales Tax and Service Tax as one single rule.** They apply to different things, are usually relevant to different kinds of businesses, and conflating the two leads to registering under (or assuming you're exempt from) the wrong one.
- **Waiting for RMCD to notice before registering.** Liability starts the moment your rolling 12-month turnover crosses the threshold, not when a notice arrives — operating unregistered past that point is a compliance gap you created, even if nobody's flagged it yet.

## Where to start this week

- **This week:** Pull your trailing 12-month taxable turnover and identify the exact service (or goods) category your business operates under, then check that category's specific threshold on MySST or the current Service Tax Regulations schedule.
- **If you're over the threshold:** Gather your SSM documents and financial records, and start the MySST registration application — don't wait for a quieter month, since the registration deadline runs from when you crossed the threshold, not from when it's convenient.
- **If you're close to the threshold:** Decide now whether you'd rather register voluntarily on your own timeline or wait until you're legally required to, and loop in your accountant either way.
- **Either way:** Set a recurring quarterly reminder to re-check your rolling 12-month turnover, so the next time this question comes up, you're the one who noticed first.

Getting this right once — the correct category, the correct threshold, registered on time — means every return after that is routine. Getting it wrong, or late, is what turns a straightforward compliance task into back taxes, penalties, and an audit conversation you'd rather not be having.`,
    faqs: [
      {
        question: "What is the SST registration threshold in Malaysia?",
        answer:
          "The commonly cited baseline is RM500,000 in taxable turnover over any rolling 12-month period, which applies to most sales-tax-liable manufacturers and a long list of service categories. However, several specific service categories have their own, different threshold — some higher, and a few with no minimum at all — so confirm the exact figure for your specific category rather than assuming the common number applies.",
      },
      {
        question: "What's the difference between Sales Tax and Service Tax?",
        answer:
          "Sales Tax applies to taxable goods and is typically a manufacturer's or importer's obligation, usually already built into the price by the time it reaches a retailer. Service Tax applies to specific prescribed categories of taxable services, such as food and beverage, professional services, and telecommunications, and is the one most retail, F&B, and service-based SMEs actually need to think about.",
      },
      {
        question: "How do I register for SST?",
        answer:
          "Registration is done through the MySST portal: prepare your SSM documents, financial records showing the turnover that triggered registration, and your business bank details, then submit the application selecting the correct taxable category for your business. RMCD reviews the application and issues an SST registration number once approved.",
      },
      {
        question: "What happens if I don't register once I'm over the threshold?",
        answer:
          "Operating above the threshold without registering is a compliance breach in itself, regardless of whether you've started charging SST. RMCD generally expects backdated registration from the date liability actually started, which can mean calculating SST on sales already made plus a possible penalty for the late registration — so this is worth resolving as soon as it's noticed rather than left to compound.",
      },
      {
        question: "Can I register for SST voluntarily if I'm below the threshold?",
        answer:
          "Yes, RMCD allows voluntary registration for a business that wants to register before it's legally required to. Some businesses do this because their own customers expect a properly SST-compliant invoice, while others wait until registration is mandatory to avoid the added admin and price impact — there's no universally right choice, and it depends on your customers.",
      },
      {
        question: "How often do I need to file SST returns once registered?",
        answer:
          "Filing is commonly every two months, though the exact cycle should be confirmed on the MySST portal for your specific registration, since this can vary. Each return declares the tax collected for the period and is due alongside payment by the filing deadline.",
      },
      {
        question: "Does the SST threshold apply to a calendar year or a rolling period?",
        answer:
          "It's a rolling 12-month period, not a fixed calendar year — RMCD looks at your trailing 12 months of turnover (or your reasonably projected turnover for the coming 12 months if you expect to cross the threshold), meaning liability can begin mid-year the moment that rolling total crosses the line.",
      },
      {
        question: "Do all types of businesses have the same SST registration threshold?",
        answer:
          "No. While RM500,000 is the commonly cited baseline, specific service categories set their own thresholds under RMCD's own schedule — some considerably higher, and a small number with no minimum threshold at all, meaning registration is mandatory regardless of turnover. Always confirm the figure for your specific category rather than assuming the general number applies.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚 SST 注册:您需要注册销售与服务税吗?",
        excerpt:
          "马来西亚企业一旦超过其所属类别的特定营业额门槛,SST 注册就成为强制义务,但销售税与服务税的运作方式不同,门槛也因类别而异。本指南说明如何判断是否需要注册、如何通过 MySST 办理注册,以及注册之后您的企业会有哪些变化。",
        body: `"我需要注册 SST 吗?"是马来西亚成长型中小企业迟早都会问到的一个常见问题,而且通常正好是在营业额增长到答案可能已经悄然改变的那个节点上才会想到问。销售与服务税(SST)注册一旦超过相关门槛,就不再是可选项——这是由马来西亚皇家关税局(RMCD/Kastam)执行的法定义务——但它也不是对每家企业都一体适用的单一规则。本指南将说明如何判断自己是否需要注册、这两种税究竟有何不同、注册本身如何操作,以及一旦注册之后,您的企业会有哪些变化。

## 1. 了解"SST"实际上是两种不同的税

销售税和服务税虽然由同一个行政机构统一管理,但适用的对象截然不同,而把两者混为一谈,正是首次申请注册者最常见的困惑来源。

- **销售税**适用于应税货物——通常在制造商或进口商环节一次性征收,到达零售商手中时税款已经计入价格。大多数零售商和贸易商自己并不需要注册销售税;这通常是制造商或进口商的义务。
- **服务税**适用于特定类别的应税服务——例如餐饮服务、专业服务(法律、会计、咨询等)、电信,以及一份不断扩充的其他规定类别清单。这正是大多数从事零售、餐饮和服务业的马来西亚中小企业真正需要留意的一种税。

您的企业是否(以及是否同时)适用这两种税,完全取决于您实际从事的业务内容,而不只是规模大小——一家小型制造商可能需要缴纳销售税,而一家规模较大但不提供应税服务的企业,可能反而完全不需要缴税。

## 2. 核实您的注册门槛——并且不要假设所有企业都适用同一个数字

常被提及的基本门槛是过去任意12个月内应税营业额达到50万令吉,对于一长串服务类别和大多数应缴销售税的制造商而言,这正是触发强制注册的确切数字。但若干特定服务类别有 RMCD 自行设定的、不同的门槛——其中一些明显高于50万令吉,而少数类别(其中包括某些专业服务和海关相关服务)则根本没有最低门槛,意味着无论营业额多少都必须注册。

### 如何核实真正适用于您的门槛
由于门槛会因具体服务类别而异,而 RMCD 也会不时更新其规定,所以不要仅凭某次读到的数字就下结论——请核实当前《服务税条例》中的注册门槛表,或直接通过 MySST 平台或 RMCD 柜台,针对您企业实际所属的具体类别进行确认。

具体来说:餐饮场所(餐馆、咖啡馆、餐饮服务)历来的门槛通常高于常见的50万令吉基准,而酒店及类似住宿场所,以及一些专业服务类别,通常是按50万令吉这个水平计算的——还有少数类别,例如某些海关代理和部分专业服务,则完全没有门槛。租赁业务和建筑服务在 RMCD 不同时期的更新中,也曾被引用过不同的门槛水平。在未亲自核实当前规定表之前,不应把这些具体数字当作一成不变的事实——按类别划分的门槛恰恰是最容易随应税服务范围扩大(而这种扩大近年已发生过不止一次)而被修订的细节。

> 50万令吉这个数字之所以到处都在被引用,是因为大多数企业恰好落在这个基准上——但"大多数"不等于"全部",真正重要的,是适用于您企业所属那个具体类别的数字。请针对该类别具体核实,而不要假设人人都在谈论的那个数字就一定适用于您。

这12个月本身是一个滚动期间,而不是日历年度——RMCD 看的是您过去12个月的营业额(或者,如果您预计会超过门槛,也会看未来12个月的合理预测营业额)。这意味着企业可能在年中的任何时候,只要滚动12个月的总额一旦越过这条线,就立即产生注册义务,而不是只在年底才算账。

## 3. 一旦确认有义务注册,该如何办理

注册通过 MySST 平台(RMCD 的在线系统)办理,一旦您确认了适用的门槛且已经超过,注册本身是一个相当标准的流程:

1. 准备好您的企业注册文件(SSM)、显示触发注册的营业额的近期财务记录,以及您的企业银行账户资料。
2. 通过 MySST 提交注册申请,选择与您企业实际经营业务相符的正确应税类别。
3. RMCD 审核并批准申请后,会发给您一个 SST 注册号。

RMCD 对一旦产生注册义务后应在多长时间内完成注册设有期限——常见说法是在超过门槛后的规定天数之内——所以请以 MySST 当前公布的期限为准,而不要把"等下个季度再处理"当作安全的假设;在超过门槛却未注册的情况下继续经营,本身就已构成合规违规,与您是否已经开始征收 SST 无关。

### 如果您已经超过门槛却还未注册
这种情况并不罕见——不少正在成长的企业,是事后才发现某个繁忙的季度已经让自己越过了门槛。RMCD 通常会要求从实际产生义务之日起补办注册,这可能意味着要为已经完成、但当时未征收 SST 的销售补算税款,还可能因迟注册而面临罚款。越早直接与 RMCD 沟通或通过会计师处理,这个缺口往往就能控制得越小——拖延只会让问题随着更多申报周期而不断累积,最终让这场必要的对话变得更加难以应付。

## 4. 注册之后,实际会有哪些变化

注册并不是流程的终点——而是新义务开始的起点:

- **在发票上征收 SST。** 注册之后,您需要对应税货物或服务按适用税率征收 SST,并在发票和收据上清楚列明——这正是未注册企业所不需要做的事。
- **按期申报。** 注册企业需要按期(通常是每两个月,具体申报周期请以 MySST 为准)提交 SST 申报表,申报所征收的税款,并在申报期限前缴清应缴金额。
- **妥善保存记录。** 发票、信用票据及相关支持文件,需要按 RMCD 要求的期限保存,因为这正是审查时首先会被要求查看的内容。
- **更新您的定价与会计系统。** 您用来开发票和做账的系统,从注册生效日起就必须能够正确计算并显示 SST——等发票已经开出之后再去补救,远比提前设置好要痛苦得多。

在这里,一份容易被找到的列表同样重要——愿意承担 SST 注册这份额外行政工作的企业,通常也是在成长中的企业,而[创建一份免费列表](/zh/signup)正是在您处理合规事宜的同时,让新客户找到您的另一种方式。看看[其他已完成注册的马来西亚企业如何展示自己的服务](/zh),也不失为了解一家趋于成熟的中小企业,典型的公开形象大致是什么样子的一个合理方式。

## 5. 即使未达门槛,也可以考虑自愿注册

未达门槛的企业,并不被禁止注册——RMCD 允许希望在法定义务产生之前就提前注册的企业进行自愿注册。这一点值得权衡,而不是一概而论:一些B2B服务提供商会提早注册,因为他们自己的客户(往往是规模更大、已注册的企业)期望收到符合SST规范的正规发票;另一些企业则会尽量维持不注册的状态,以避免额外的行政负担,以及SST实际上对终端客户造成的价格上涨。这里并没有放之四海而皆准的答案——取决于您的客户是谁,以及他们是否在意收到一份注册企业开出的发票。

## 6. 处理好这件事之后,仍要持续关注滚动12个月的营业额

SST义务的判断并非一次性的检查——一家今天还舒适地处于门槛之下的企业,完全可能在八个月后,因为真正的好消息(一位大客户、一个旺季、一款畅销的新产品)而越过门槛。请养成定期核查滚动12个月应税营业额的习惯,而不只是在第一次担心这个问题时查一次,这样注册才会是您提前规划好的结果,而不是被 RMCD 先一步发现的结果。

## 企业在 SST 注册上最常犯的错误

- **假设50万令吉是一个放之四海而皆准的数字。** 若干服务类别有各自不同的门槛,还有少数类别根本没有最低门槛——真正重要的数字,是适用于您具体类别的那个,而不是大家都在引用的那个。
- **把销售税和服务税当成同一条规则来理解。** 二者适用于不同的对象,通常也与不同类型的企业相关,把两者混为一谈,很容易导致注册了错误的税种(或误以为自己可以豁免)。
- **等RMCD主动发现才去注册。** 义务从滚动12个月营业额越过门槛的那一刻起就已产生,而不是从通知送达的那一刻才开始——在那之后继续未注册经营,就是您自己造成的合规缺口,即便目前还没有人指出来。

## 本周可以从这里开始

- **本周:** 梳理您过去12个月的应税营业额,确认您企业实际所属的服务(或货物)类别,然后在 MySST 或当前《服务税条例》门槛表上核实该类别的具体门槛。
- **如果您已超过门槛:** 准备好您的 SSM 文件和财务记录,立即开始 MySST 注册申请——不要等到"比较空"的月份,因为注册期限是从您越过门槛那一刻起算,而不是从方便处理的时候起算。
- **如果您接近门槛:** 现在就决定,您更倾向于按自己的时间表自愿注册,还是等到法定义务产生才注册,并无论如何都让您的会计师参与讨论。
- **无论哪种情况:** 设定一个每季度重复提醒,定期重新核查您滚动12个月的营业额,这样下次这个问题再出现时,第一个注意到的就是您自己。

把类别、门槛和注册时间这几件事一次做对,之后每一次申报都会变得例行化。而一旦做错,或者拖延,一件原本简单的合规事项,就会变成补税、罚款,以及您本不想面对的那场审查谈话。`,
        faqs: [
      {
        question: "马来西亚的 SST 注册门槛是多少?",
        answer:
          "常被提及的基本门槛,是在任意滚动12个月期间内应税营业额达到50万令吉,这适用于大多数应缴销售税的制造商,以及一长串服务类别。不过,若干特定服务类别有自己不同的门槛——有些更高,还有少数完全没有最低门槛——所以请核实适用于您具体类别的确切数字,而不要假设这个常见数字一定适用于您。",
      },
      {
        question: "销售税和服务税有什么区别?",
        answer:
          "销售税适用于应税货物,通常是制造商或进口商的义务,到达零售商环节时税款通常已经计入价格。服务税适用于特定规定类别的应税服务,例如餐饮、专业服务和电信,这正是大多数零售、餐饮和服务型中小企业真正需要考虑的税种。",
      },
      {
        question: "我该如何注册 SST?",
        answer:
          "注册通过 MySST 平台办理:先准备好您的 SSM 文件、能显示触发注册的营业额的财务记录,以及您的企业银行资料,然后提交申请,并选择与您企业业务相符的正确应税类别。RMCD 审核申请并在批准后发出 SST 注册号。",
      },
      {
        question: "如果我超过门槛却不注册,会怎样?",
        answer:
          "在超过门槛却未注册的情况下继续经营,本身就已构成合规违规,无论您是否已开始征收 SST。RMCD 通常会要求从实际产生义务之日起补办注册,这可能意味着要为已完成的销售补算 SST,还可能因迟注册而被罚款——因此一旦察觉,就应尽快处理,而不是让问题继续累积。",
      },
      {
        question: "如果我的营业额低于门槛,可以自愿注册 SST 吗?",
        answer:
          "可以。RMCD 允许希望在法定义务产生之前就提前注册的企业进行自愿注册。有些企业这样做,是因为他们自己的客户期望收到符合 SST 规范的正规发票;另一些企业则会等到强制注册时才注册,以避免额外的行政负担和价格影响——这里没有放之四海而皆准的正确选择,取决于您的客户是谁。",
      },
      {
        question: "注册后,我需要多久申报一次 SST?",
        answer:
          "申报通常是每两个月一次,但具体周期应以您注册时在 MySST 平台上核实的信息为准,因为这可能有所不同。每份申报表需要申报该期间所征收的税款,并在申报期限前连同款项一并缴清。",
      },
      {
        question: "SST 门槛是按日历年度计算,还是按滚动期间计算?",
        answer:
          "是按滚动12个月期间计算,而不是固定的日历年度——RMCD 看的是您过去12个月的营业额(或者,如果您预计会超过门槛,也会看未来12个月的合理预测营业额),这意味着一旦滚动总额越过门槛,义务就可能在年中的任何时候开始。",
      },
      {
        question: "所有类型的企业,SST 注册门槛都一样吗?",
        answer:
          "不一样。虽然50万令吉是常被提及的基本门槛,但特定服务类别会在 RMCD 自己的规定表中设定各自的门槛——有些明显更高,还有少数完全没有最低门槛,意味着无论营业额多少都必须注册。请始终核实适用于您具体类别的数字,而不要假设通用数字就适用于您。",
      },
        ],
      },
      ms: {
        title: "Pendaftaran SST di Malaysia: Perlukah Anda Mendaftar untuk Cukai Jualan dan Perkhidmatan?",
        excerpt:
          "Pendaftaran SST menjadi wajib sebaik sahaja sesebuah perniagaan Malaysia melepasi ambang hasil jualan khusus kategorinya, tetapi Cukai Jualan dan Cukai Perkhidmatan berfungsi secara berbeza dan ambangnya berbeza mengikut kategori. Panduan ini merangkumi cara menyemak sama ada anda perlu mendaftar, cara mendaftar melalui MySST, dan apa yang berubah untuk perniagaan anda sebaik sahaja anda berdaftar.",
        body: `"Perlukah saya mendaftar untuk SST?" adalah salah satu soalan yang paling kerap ditanya oleh PKS Malaysia yang semakin berkembang, biasanya tepat pada waktu hasil jualan meningkat cukup pantas sehingga jawapannya mungkin sudah berubah secara senyap. Pendaftaran Cukai Jualan dan Perkhidmatan (SST) bukanlah pilihan sebaik sahaja anda melepasi ambang yang berkaitan — ia adalah tanggungjawab undang-undang yang dikuatkuasakan oleh Jabatan Kastam Diraja Malaysia (RMCD/Kastam) — tetapi ia juga bukan satu peraturan tunggal yang terpakai sama rata kepada setiap perniagaan. Panduan ini merangkumi cara menentukan sama ada anda perlu mendaftar, cara kedua-dua cukai ini sebenarnya berbeza, cara pendaftaran itu sendiri berfungsi, dan apa yang berubah untuk perniagaan anda sebaik sahaja anda berdaftar.

## 1. Fahami bahawa "SST" Sebenarnya Dua Cukai yang Berasingan

Cukai Jualan dan Cukai Perkhidmatan ditadbir di bawah satu payung pentadbiran yang sama tetapi terpakai kepada perkara yang benar-benar berbeza, dan mengelirukan kedua-duanya adalah sumber kekeliruan paling biasa bagi pendaftar kali pertama.

- **Cukai Jualan** terpakai kepada barangan boleh cukai — umumnya dikenakan sekali, pada peringkat pengilang atau pengimport, dan sudah termasuk dalam harga apabila ia tiba di peringkat peruncit. Kebanyakan peruncit dan peniaga sendiri tidak perlu mendaftar cukai jualan; ia biasanya tanggungjawab pengilang atau pengimport.
- **Cukai Perkhidmatan** terpakai kepada kategori perkhidmatan boleh cukai tertentu — seperti perkhidmatan makanan dan minuman, perkhidmatan profesional (undang-undang, perakaunan, perundingan, dan lain-lain), telekomunikasi, dan senarai kategori lain yang ditetapkan yang semakin bertambah. Inilah yang perlu benar-benar difikirkan oleh kebanyakan PKS Malaysia dalam bidang peruncitan, F&B, dan perkhidmatan.

Sama ada satu (atau kedua-duanya) terpakai kepada anda bergantung sepenuhnya kepada apa yang perniagaan anda lakukan, bukan saiznya semata-mata — pengilang kecil mungkin terhutang cukai jualan, manakala perniagaan yang lebih besar tetapi tidak menawarkan perkhidmatan boleh cukai mungkin tidak terhutang apa-apa sama sekali.

## 2. Semak Ambang Pendaftaran Anda — dan Jangan Anggap Ia Sama untuk Setiap Perniagaan

Ambang asas yang biasa disebut ialah RM500,000 hasil boleh cukai dalam mana-mana tempoh 12 bulan, dan bagi senarai panjang kategori perkhidmatan serta kebanyakan pengilang yang terhutang cukai jualan, itulah nombor tepat yang mencetuskan pendaftaran mandatori. Tetapi beberapa kategori perkhidmatan tertentu mempunyai ambang mereka sendiri yang berbeza, ditetapkan oleh RMCD — sebahagiannya jauh lebih tinggi daripada RM500,000, dan beberapa kategori kecil (termasuk perkhidmatan profesional dan berkaitan kastam tertentu) tidak mempunyai ambang minimum sama sekali, bermakna pendaftaran diwajibkan tanpa mengira hasil jualan.

### Bagaimana Menyemak Ambang yang Sebenarnya Terpakai kepada Anda
Oleh kerana ambang berbeza mengikut kategori perkhidmatan tertentu, dan RMCD mengemas kini jadualnya dari semasa ke semasa, jangan bergantung pada nombor yang pernah anda baca sekali — semak jadual ambang pendaftaran semasa dalam Peraturan Cukai Perkhidmatan, atau sahkan terus melalui portal MySST atau kaunter RMCD, berdasarkan kategori tepat yang perniagaan anda beroperasi di bawahnya.

Secara konkrit: premis makanan dan minuman (restoran, kafe, katering) secara sejarahnya berada pada ambang yang lebih tinggi daripada garis dasar RM500,000 yang biasa, manakala hotel dan penginapan serupa, serta beberapa kategori perkhidmatan profesional, biasanya disebut pada tahap RM500,000 — dan beberapa kategori, seperti ejen kastam tertentu dan beberapa perkhidmatan profesional, tidak mempunyai ambang sama sekali. Perkhidmatan pajakan atau sewaan serta perkhidmatan pembinaan juga pernah disebut pada tahap ambang yang berbeza merentasi kemas kini RMCD yang berlainan. Tidak satu pun daripada angka khusus ini sepatutnya diambil sebagai tetap tanpa menyemak jadual semasa sendiri — ambang mengikut kategori adalah jenis butiran yang disemak semula apabila skop perkhidmatan boleh cukai berkembang, yang telah berlaku lebih daripada sekali dalam tahun-tahun kebelakangan ini.

> Angka RM500,000 diulang di mana-mana kerana ia adalah garis dasar yang paling ramai perniagaan hinggapi — tetapi "kebanyakan" bukan "semua," dan satu-satunya nombor yang penting adalah kategori yang perniagaan anda sebenarnya terletak di bawahnya. Sahkan secara khusus berbanding menganggap angka yang kerap disebut itu terpakai kepada anda.

Tempoh 12 bulan itu sendiri adalah tempoh bergolek, bukan tahun kalendar — RMCD melihat hasil jualan anda sepanjang 12 bulan sebelumnya (atau hasil jualan yang dijangka secara munasabah bagi 12 bulan akan datang, sekiranya anda menjangka akan melepasi ambang). Ini bermakna sebuah perniagaan boleh menjadi liabel untuk mendaftar pada bila-bila masa dalam tahun, sebaik sahaja jumlah bergolek 12 bulan melepasi garis tersebut, bukan hanya pada penghujung tahun.

## 3. Mendaftar Sebaik Sahaja Anda Mengesahkan Liabiliti Anda

Pendaftaran dilakukan melalui portal MySST (sistem dalam talian RMCD), dan sebaik sahaja anda mengesahkan ambang yang terpakai dan bahawa anda telah melepasinya, pendaftaran itu sendiri adalah proses yang agak piawai:

1. Sediakan dokumen pendaftaran perniagaan anda (SSM), rekod kewangan terkini yang menunjukkan hasil jualan yang mencetuskan pendaftaran, dan butiran akaun bank perniagaan anda.
2. Serahkan permohonan pendaftaran melalui MySST, pilih kategori boleh cukai yang betul untuk apa yang sebenarnya dilakukan oleh perniagaan anda.
3. RMCD menyemak dan meluluskan permohonan, selepas itu anda akan diberikan nombor pendaftaran SST.

RMCD menetapkan tarikh akhir untuk mendaftar sebaik sahaja anda menjadi liabel — biasanya disebut dalam tempoh hari tertentu selepas melepasi ambang — jadi sahkan tarikh akhir semasa di MySST berbanding menganggap "saya akan uruskan suku tahun depan" sebagai andaian yang selamat; beroperasi melebihi ambang tanpa mendaftar adalah sendirinya satu pelanggaran pematuhan, tanpa mengira sama ada anda sudah mula mengenakan SST atau belum.

### Jika Anda Sudah Melepasi Ambang dan Belum Mendaftar
Ini bukan situasi yang jarang terjadi — ramai perniagaan yang sedang berkembang menyedari berbulan-bulan selepas itu bahawa suku tahun yang sibuk telah melepasikan mereka. RMCD umumnya menjangkakan pendaftaran kebelakangan dari tarikh liabiliti sebenarnya bermula, yang boleh bermakna mengira SST untuk jualan yang sudah dibuat tanpa pernah mengenakannya, ditambah kemungkinan penalti kerana pendaftaran lewat itu sendiri. Lebih awal ini diselesaikan terus dengan RMCD atau melalui akauntan, lebih kecil jurang itu cenderung kekal — membiarkannya tanpa tindakan merentasi lebih banyak tempoh penyerahan hanya menjadikan perbualan akhirnya lebih sukar.

## 4. Apa yang Sebenarnya Berubah Sebaik Sahaja Anda Berdaftar

Pendaftaran bukan penghujung proses — ia adalah titik di mana tanggungjawab baharu bermula:

- **Mengenakan SST pada invois anda.** Sebaik sahaja berdaftar, anda mengenakan kadar SST yang berkenaan pada barangan atau perkhidmatan boleh cukai anda dan menunjukkannya dengan jelas pada invois dan resit, sesuatu yang tidak dilakukan oleh perniagaan yang tidak berdaftar.
- **Memfailkan penyata mengikut jadual.** Perniagaan berdaftar memfailkan penyata SST (biasanya setiap dua bulan, walaupun sahkan kitaran pemfailan khusus anda di MySST) yang mengisytiharkan cukai yang dikutip, dan membayar jumlah yang perlu dibayar menjelang tarikh akhir pemfailan.
- **Menyimpan rekod yang betul.** Invois, nota kredit, dan dokumen sokongan perlu disimpan untuk tempoh yang dikehendaki oleh RMCD, kerana itulah perkara pertama yang akan diminta oleh sebarang audit.
- **Mengemas kini sistem penetapan harga dan perakaunan anda.** Apa jua yang anda gunakan untuk menghantar invois dan menguruskan akaun perlu benar-benar mengira dan memaparkan SST dengan betul sejak tarikh pendaftaran — membaikinya selepas fakta, pada invois yang sudah dikeluarkan, jauh lebih menyakitkan berbanding menyediakannya sebelum anda memerlukannya.

Penyenaraian yang mudah ditemui juga penting di sini — perniagaan yang mengambil langkah tambahan pendaftaran SST biasanya adalah perniagaan yang sedang berkembang, dan [mencipta penyenaraian percuma](/ms/signup) adalah satu lagi cara pelanggan baharu menemui anda sementara anda menguruskan aspek pematuhan. Melihat [bagaimana perniagaan Malaysia lain yang berdaftar mempersembahkan perkhidmatan mereka](/ms) juga merupakan cara yang munasabah untuk melihat seperti apa kehadiran awam biasa sebuah PKS yang semakin matang.

## 5. Pertimbangkan Pendaftaran Secara Sukarela, Walaupun di Bawah Ambang

Perniagaan di bawah ambang tidak dihalang daripada mendaftar — RMCD membenarkan pendaftaran sukarela bagi perniagaan yang ingin mendaftar sebelum ia diwajibkan secara undang-undang. Ini wajar dipertimbangkan, bukan diandaikan sebelah pihak sahaja: sesetengah penyedia perkhidmatan B2B mendaftar lebih awal kerana pelanggan mereka sendiri (selalunya perniagaan yang lebih besar dan berdaftar) mengharapkan invois yang patuh SST dengan betul; yang lain kekal tidak berdaftar selama mungkin untuk mengelakkan beban pentadbiran tambahan dan kenaikan harga yang secara berkesan diwakili oleh SST kepada pelanggan akhir. Tiada jawapan yang betul secara universal — ia bergantung kepada siapa pelanggan anda dan sama ada mereka mengambil berat tentang invois berdaftar.

## 6. Teruskan Memantau Hasil Jualan Bergolek 12 Bulan Anda Selepas Ini

Liabiliti SST bukan semakan sekali sahaja — perniagaan yang selesa di bawah ambang hari ini boleh melepasinya lapan bulan dari sekarang atas berita yang benar-benar baik (pelanggan baharu yang besar, musim sibuk, barisan produk baharu yang berjaya). Bina tabiat menyemak hasil jualan boleh cukai bergolek 12 bulan anda secara berkala, bukan hanya sekali apabila anda mula-mula bimbang tentangnya, supaya pendaftaran berlaku kerana anda merancangnya, bukan kerana RMCD yang menyedarinya terlebih dahulu.

## Kesilapan Biasa Perniagaan dengan Pendaftaran SST

- **Menganggap RM500,000 adalah nombor universal.** Beberapa kategori perkhidmatan mempunyai ambang mereka sendiri yang berbeza, dan beberapa langsung tidak mempunyai minimum — nombor yang penting adalah yang terpakai kepada kategori khusus anda, bukan yang disebut oleh semua orang.
- **Mengelirukan Cukai Jualan dan Cukai Perkhidmatan sebagai satu peraturan tunggal.** Kedua-duanya terpakai kepada perkara yang berbeza, biasanya relevan kepada jenis perniagaan yang berbeza, dan mencampurkan kedua-duanya membawa kepada mendaftar di bawah (atau menganggap dikecualikan daripada) cukai yang salah.
- **Menunggu RMCD menyedarinya sebelum mendaftar.** Liabiliti bermula sebaik sahaja hasil jualan bergolek 12 bulan anda melepasi ambang, bukan apabila notis tiba — beroperasi tanpa berdaftar selepas titik itu adalah jurang pematuhan yang anda ciptakan sendiri, walaupun belum sesiapa menandakannya lagi.

## Di Mana Harus Bermula Minggu Ini

- **Minggu ini:** Semak hasil jualan boleh cukai bergolek 12 bulan anda dan kenal pasti kategori perkhidmatan (atau barangan) tepat yang perniagaan anda beroperasi di bawahnya, kemudian semak ambang khusus kategori itu di MySST atau jadual Peraturan Cukai Perkhidmatan semasa.
- **Jika anda melepasi ambang:** Kumpulkan dokumen SSM dan rekod kewangan anda, dan mulakan permohonan pendaftaran MySST — jangan tunggu bulan yang lebih lapang, kerana tarikh akhir pendaftaran bermula dari bila anda melepasi ambang, bukan dari bila ia lebih mudah.
- **Jika anda hampir dengan ambang:** Tentukan sekarang sama ada anda lebih suka mendaftar secara sukarela mengikut jadual anda sendiri atau menunggu sehingga diwajibkan secara undang-undang, dan libatkan akauntan anda sama ada apa pun keputusannya.
- **Apa jua keadaannya:** Tetapkan peringatan suku tahunan berulang untuk menyemak semula hasil jualan bergolek 12 bulan anda, supaya kali seterusnya soalan ini timbul, andalah yang menyedarinya terlebih dahulu.

Betulkan kategori, ambang, dan masa pendaftaran sekali sahaja, dan setiap penyata selepas itu menjadi rutin. Melakukannya secara salah, atau lewat, mengubah tugas pematuhan yang sepatutnya mudah menjadi cukai tertunggak, penalti, dan perbualan audit yang anda lebih suka tidak hadapi.`,
        faqs: [
      {
        question: "Apakah ambang pendaftaran SST di Malaysia?",
        answer:
          "Garis dasar yang biasa disebut ialah RM500,000 hasil jualan boleh cukai dalam mana-mana tempoh bergolek 12 bulan, yang terpakai kepada kebanyakan pengilang yang terhutang cukai jualan dan senarai panjang kategori perkhidmatan. Walau bagaimanapun, beberapa kategori perkhidmatan tertentu mempunyai ambang mereka sendiri yang berbeza — sebahagiannya lebih tinggi, dan beberapa langsung tidak mempunyai minimum — jadi sahkan angka tepat untuk kategori khusus anda berbanding menganggap nombor umum itu terpakai.",
      },
      {
        question: "Apakah perbezaan antara Cukai Jualan dan Cukai Perkhidmatan?",
        answer:
          "Cukai Jualan terpakai kepada barangan boleh cukai dan biasanya tanggungjawab pengilang atau pengimport, selalunya sudah termasuk dalam harga apabila tiba di peringkat peruncit. Cukai Perkhidmatan terpakai kepada kategori perkhidmatan boleh cukai tertentu yang ditetapkan, seperti makanan dan minuman, perkhidmatan profesional, dan telekomunikasi, dan inilah yang perlu benar-benar difikirkan oleh kebanyakan PKS peruncitan, F&B, dan perkhidmatan.",
      },
      {
        question: "Bagaimana saya mendaftar untuk SST?",
        answer:
          "Pendaftaran dilakukan melalui portal MySST: sediakan dokumen SSM anda, rekod kewangan yang menunjukkan hasil jualan yang mencetuskan pendaftaran, dan butiran bank perniagaan anda, kemudian serahkan permohonan dengan memilih kategori boleh cukai yang betul untuk perniagaan anda. RMCD menyemak permohonan dan mengeluarkan nombor pendaftaran SST sebaik sahaja diluluskan.",
      },
      {
        question: "Apa yang berlaku jika saya tidak mendaftar sebaik sahaja saya melepasi ambang?",
        answer:
          "Beroperasi melebihi ambang tanpa mendaftar adalah pelanggaran pematuhan tersendiri, tanpa mengira sama ada anda sudah mula mengenakan SST. RMCD umumnya menjangkakan pendaftaran kebelakangan dari tarikh liabiliti sebenarnya bermula, yang boleh bermakna mengira SST untuk jualan yang sudah dibuat ditambah kemungkinan penalti kerana pendaftaran lewat — jadi ini wajar diselesaikan sebaik sahaja disedari berbanding dibiarkan bertimbun.",
      },
      {
        question: "Bolehkah saya mendaftar SST secara sukarela jika saya di bawah ambang?",
        answer:
          "Ya, RMCD membenarkan pendaftaran sukarela bagi perniagaan yang ingin mendaftar sebelum diwajibkan secara undang-undang. Sesetengah perniagaan melakukan ini kerana pelanggan mereka sendiri mengharapkan invois yang patuh SST dengan betul, manakala yang lain menunggu sehingga pendaftaran diwajibkan untuk mengelakkan beban pentadbiran tambahan dan kesan harga — tiada pilihan yang betul secara universal, dan ia bergantung kepada pelanggan anda.",
      },
      {
        question: "Berapa kerap saya perlu memfailkan penyata SST sebaik sahaja berdaftar?",
        answer:
          "Pemfailan biasanya setiap dua bulan, walaupun kitaran tepat perlu disahkan di portal MySST untuk pendaftaran khusus anda, kerana ini boleh berbeza-beza. Setiap penyata mengisytiharkan cukai yang dikutip untuk tempoh tersebut dan perlu dibayar sekali dengan bayaran menjelang tarikh akhir pemfailan.",
      },
      {
        question: "Adakah ambang SST terpakai kepada tahun kalendar atau tempoh bergolek?",
        answer:
          "Ia adalah tempoh bergolek 12 bulan, bukan tahun kalendar yang tetap — RMCD melihat hasil jualan 12 bulan sebelumnya anda (atau hasil jualan yang dijangka secara munasabah bagi 12 bulan akan datang sekiranya anda menjangka akan melepasi ambang), bermakna liabiliti boleh bermula pada bila-bila masa dalam tahun sebaik sahaja jumlah bergolek itu melepasi garis tersebut.",
      },
      {
        question: "Adakah semua jenis perniagaan mempunyai ambang pendaftaran SST yang sama?",
        answer:
          "Tidak. Walaupun RM500,000 adalah garis dasar yang biasa disebut, kategori perkhidmatan tertentu menetapkan ambang mereka sendiri di bawah jadual RMCD sendiri — sebahagiannya jauh lebih tinggi, dan beberapa langsung tidak mempunyai ambang minimum, bermakna pendaftaran diwajibkan tanpa mengira hasil jualan. Sentiasa sahkan angka untuk kategori khusus anda berbanding menganggap nombor umum itu terpakai.",
      },
        ],
      },
    },
  },
];
