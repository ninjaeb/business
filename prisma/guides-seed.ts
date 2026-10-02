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
];
