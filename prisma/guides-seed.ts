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
    slug: "selling-online-in-malaysia-setting-up-an-online-shop",
    title: "Selling Online in Malaysia: Setting Up an Online Shop the Right Way",
    seoTitle: "Selling Online in Malaysia: Set Up an Online Shop",
    seoDescription:
      "How Malaysian SMEs can start selling online properly: registration, marketplace vs own website, payments, consumer rules, delivery, and customer data.",
    coverImage: {
      file: "selling-online-in-malaysia-setting-up-an-online-shop-cover.webp",
      mimeType: "image/webp",
      alt: "A woman with glasses working at a laptop in a bright, plant-filled office",
      altTranslations: {
        zh: "一位戴眼镜的女士在摆满绿植的明亮办公室里使用笔记本电脑",
        ms: "Seorang wanita berkaca mata bekerja di komputer riba di pejabat yang cerah dan penuh pokok",
      },
    },
    contentImages: {
      "online-store": {
        file: "selling-online-in-malaysia-setting-up-an-online-shop-laptop.webp",
        mimeType: "image/webp",
        alt: "A woman working on a laptop at a white desk with notes and colour samples",
        altTranslations: {
          zh: "一位女士在摆着便条和色卡的白色书桌前使用笔记本电脑",
          ms: "Seorang wanita menggunakan komputer riba di meja putih dengan nota dan sampel warna",
        },
        after: "Decide where you will sell before you spend money on product photos and advertising.",
        afterTranslations: {
          zh: "在花钱拍产品照片和做广告之前，先决定您要在哪里销售。",
          ms: "Tentukan di mana anda akan berjual sebelum membelanjakan wang untuk gambar produk dan pengiklanan.",
        },
      },
    },
    excerpt:
      "Selling online lets a Malaysian small business reach customers far beyond its street, but it comes with its own legal and practical basics. This guide covers registering the business, choosing between a marketplace and your own website, payment gateways, the consumer protection rules for online sellers, delivery choices, and handling customer data.",
    body: `Selling online is no longer a separate activity from running a business — for many Malaysian SMEs, it is the main channel. A home baker on a marketplace, a boutique with its own website, and a manufacturer selling through social media all face the same question: what do I need in place so that this is a proper business and not a risky side project? Getting the basics right early protects you from fines, chargebacks, and angry customers later.

This is general information, not legal advice. Consumer protection rules, tax treatment, and platform policies change, and they differ by what you sell, so confirm the current position with the relevant authority, such as the Ministry of Domestic Trade and Cost of Living (KPDN) or SSM, before you rely on it.

## 1. Register the business first

Many people start by posting products and think about registration later. It is better to do it first.

### Why registration matters
SSM has stated that online businesses run for profit should be registered, and a registered business name or company is also what marketplaces, payment gateways, and banks will ask for. A business that is not registered may find it hard to open a business bank account or to get a payment gateway approved.

### Choose a structure
A sole proprietorship or partnership is the cheapest and quickest way to start, while a private limited company (Sdn Bhd) separates the owner's personal assets from the business. Our guide on registering a business in Malaysia walks through the options and the SSM steps.

### Check licences and permits
Depending on what you sell, you may need additional approvals, for example for food, cosmetics, health products, or regulated goods. A product that needs approval offline needs it online too, and marketplaces may remove listings that do not meet the rules.

## 2. Choose where you will sell

Decide where you will sell before you spend money on product photos and advertising. The three common routes can also be combined.

### Marketplaces
Platforms such as Shopee, Lazada, and TikTok Shop give you ready-made traffic, built-in payments, and basic dispute handling. The trade-offs are commission and transaction fees that cut into your margin, competition on price from similar sellers, and rules that the platform can change. Fees and policies differ by platform and category, so check the current seller terms before you commit.

### Your own website
A store on a hosted website platform gives you control over branding, pricing, and customer data, and no marketplace commission. The trade-off is that you must bring your own traffic, handle your own payments and customer service, and look after your own security. For a new business with no audience, that can be slow.

### Social media selling
Selling through Facebook, Instagram, or WhatsApp is easy to start, but it is hard to scale and hard to keep records. It is better treated as a way to find customers than as your only system for taking orders and payments.

### A sensible approach
Many SMEs begin on a marketplace to get orders and reviews, then add their own website for repeat customers as they grow. Whichever route you pick, keep your own customer list and records, not only the platform's.

## 3. Take payments safely

Customers expect to pay by card, online banking, or e-wallet, and you need a reliable way to receive that money.

### Payment gateways
A payment gateway lets your website accept online banking, cards, and e-wallets. Use a provider that is properly licensed or approved in Malaysia, compare their transaction fees and settlement times, and check what documents they require, which typically include your business registration and bank account details.

### Marketplace payments
On a marketplace, the platform generally holds the buyer's payment and releases it after delivery is confirmed. Understand the release schedule and any holding period, as it affects your cash flow.

### Cash on delivery and manual transfers
Cash on delivery and bank transfers are common, but they bring risk of refused parcels, fake payment slips, and messy reconciliation. If you use them, confirm that funds have actually arrived before dispatching, and record each order.

### Keep business and personal money apart
Use your business account to receive payments, so your income is clear when it is time to do your accounts and taxes. Our guide on opening a business bank account explains what to prepare.

## 4. Know the consumer protection rules for online sellers

Malaysia has specific rules for online traders under its consumer protection laws. They exist to make sure buyers know who they are dealing with and what they are buying.

### Display your business details
The Consumer Protection (Electronic Trade Transactions) Regulations require online sellers to disclose key information on their website or marketplace profile, commonly including the business name, registration number where one applies, contact details, a description of the goods or services, the full price including any taxes and delivery charges, accepted payment methods, the terms and conditions, and the estimated delivery time. The rules apply to sellers on their own websites and on marketplaces, and marketplace operators have duties of their own. The exact requirements have been amended over time, so confirm the current wording on the KPDN website.

> Treat the product listing as your contract with the buyer. Whatever you show — price, size, colour, stock, delivery time, warranty — is what you are expected to deliver, so describe it accurately and do not advertise what you cannot supply.

### Be clear about the price
Show the full price, including tax and delivery, before the buyer pays. Hidden charges that appear at checkout are a common source of complaints.

### Honour returns and guarantees
The Consumer Protection Act 1999 gives consumers statutory guarantees, including that goods are of acceptable quality and match their description. This is not the same as a general right to return something because the buyer changed their mind, and your own return policy can be more generous than the law, but it cannot take away the rights the law gives. State your return and refund terms clearly, follow them, and keep the process simple. Marketplaces also have their own return rules that sellers must follow.

### Do not mislead
False claims, fake reviews, and misleading photos or discounts are offences, and they damage a new brand faster than anything else. Describe products honestly and use your own photos wherever you can.

### Penalties and complaints
Breaches can lead to enforcement action, and buyers can complain to KPDN or the Tribunal for Consumer Claims. Fine amounts are set in the law and have been revised, so check the current provisions rather than relying on a figure from a blog.

## 5. Plan delivery and returns

Delivery is where online businesses often win or lose repeat customers.

### Choose couriers carefully
Compare local courier and logistics providers on price, coverage, speed, tracking, insurance, and their handling of lost or damaged parcels. Many marketplaces offer integrated shipping that is convenient, but it is worth knowing what it costs.

### Be honest about timing
State realistic delivery times, including for East Malaysia, and update customers if there is a delay. Most complaints come from silence rather than from lateness itself.

### Pack for the journey
Poor packaging costs you replacements and reviews. For fragile or perishable goods, test your packaging before you scale up.

### Decide who pays for returns
Make clear who bears return shipping for faulty, wrong, or changed-mind returns, and put it in your policy before the first order rather than after the first dispute.

### Imports and cross-border sales
If you import goods for resale or sell to customers abroad, extra rules on customs, product standards, and tax can apply. Check these with the Royal Malaysian Customs Department before you commit to stock.

## 6. Handle customer data and taxes properly

### Personal data
Every order gives you names, addresses, phone numbers, and sometimes payment details. The Personal Data Protection Act 2010 applies to commercial transactions, so you need a privacy notice, you should collect only what you need, and you must keep it secure. Our guide on PDPA compliance explains the basics. Never store card details yourself; let the payment gateway handle them.

### Marketing messages
Do not send promotional messages to people who did not agree to receive them, and let customers opt out easily.

### Tax and records
Online income is taxable like any other business income, so keep orders, invoices, payout statements, and expenses. Depending on what you sell and your turnover, sales and service tax may apply, and the e-invoicing rules may reach your business as its turnover grows. Confirm both with the relevant authority and see our guides on SST and e-invoicing.

Once your shop is running, [a free business listing](/en/signup) helps local customers and trade partners find and verify you outside the marketplace, and you can [browse the directory](/en) for local couriers, packaging suppliers, photographers, and accountants who work with online sellers.

## Common mistakes Malaysian SMEs make when selling online

- **Selling without registering.** An unregistered business struggles to get a payment gateway or business account, and exposes the owner to avoidable risk.
- **Hiding the full price or business details.** Missing contact information and surprise delivery charges break the disclosure rules and cost you customers' trust.
- **Depending on one platform for everything.** If your only customer list lives on a marketplace, a policy change or suspended account can stop your income overnight.

## Where to start

- **This week:** Register your business with SSM, open a business bank account, and check whether your products need any licence or approval.
- **Next:** Pick your first sales channel, set up a payment method you trust, and write clear product descriptions and return terms.
- **Then:** Test your delivery process with a few orders, and set up a simple record of orders, payouts, and customer details.
- **Every month:** Review your fees, reviews, returns, and customer data practices, and build your own customer list.

Selling online works best when the basics are boring: a registered business, honest listings, reliable payments, and a delivery process your customers can trust.`,
    faqs: [
      {
        question: "Do I need to register my business to sell online in Malaysia?",
        answer:
          "SSM has stated that online businesses run for profit should be registered, and marketplaces, payment gateways, and banks usually ask for a business registration. Registering first also makes it easier to open a business bank account.",
      },
      {
        question: "Should I sell on a marketplace or build my own website?",
        answer:
          "Marketplaces give you ready-made traffic and payments but charge fees and limit your control, while your own website gives control and no commission but requires your own traffic. Many SMEs start on a marketplace and add their own site as they grow.",
      },
      {
        question: "What business details must an online seller display?",
        answer:
          "The Consumer Protection (Electronic Trade Transactions) Regulations commonly require details such as the business name, registration number where one applies, contact information, a description of the goods, the full price including taxes and delivery, payment methods, terms, and estimated delivery time. Confirm the current requirements on the KPDN website.",
      },
      {
        question: "Do I have to accept returns if the buyer just changes their mind?",
        answer:
          "Not as a general legal right. The Consumer Protection Act 1999 gives guarantees on matters like acceptable quality and matching the description, but a change-of-mind return is usually down to your own policy or the marketplace's rules. State your policy clearly and follow it.",
      },
      {
        question: "How do I accept payments on my own website?",
        answer:
          "Use a payment gateway that is properly licensed or approved in Malaysia. Compare fees and settlement times, expect to provide your business registration and bank details, and never store customers' card details yourself.",
      },
      {
        question: "Is it safe to take orders through WhatsApp or social media?",
        answer:
          "It is an easy way to start, but it is hard to scale and to keep records. Treat it as a way to find customers, confirm that payment has actually arrived before dispatching, and keep a record of every order.",
      },
      {
        question: "Does the PDPA apply to a small online shop?",
        answer:
          "Generally yes. If you collect customers' personal data in commercial transactions, you need a privacy notice, should collect only what you need, and must keep the data secure. Let the payment gateway handle card details, and do not send marketing messages to people who did not agree.",
      },
      {
        question: "Will my online income be taxed?",
        answer:
          "Yes, online income is taxable like other business income, so keep orders, invoices, payout statements, and expenses. Sales and service tax and e-invoicing may also apply depending on what you sell and your turnover, so confirm with the relevant authority.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚网上销售：正确开设网店的方法",
        excerpt:
          "网上销售让马来西亚的小企业可以触达远超门前街道的客户，但它也有自己的法律与实务基础。本指南涵盖注册企业、在电商平台与自家网站之间的选择、支付网关、网络卖家的消费者保护规则、配送选择，以及如何处理客户数据。",
        body: `网上销售已不再是与经营企业分开的活动——对许多马来西亚中小企业来说，它就是主要渠道。在电商平台上的家庭烘焙师、拥有自家网站的精品店、通过社交媒体销售的制造商，都面临同一个问题：我需要具备什么，才能让这成为一门正规的生意，而不是一个有风险的副业？及早做好基础，可以避免日后的罚款、退款纠纷和愤怒的客户。

以下仅为一般资讯，并非法律意见。消费者保护规定、税务处理和平台政策会变动，也因您销售的产品而异，所以在依赖这些内容之前，请向相关机构，例如国内贸易及生活费用部（KPDN）或 SSM，确认最新情况。

## 1. 先注册企业

许多人先发布产品，之后才考虑注册。先注册会更好。

### 为什么注册很重要
SSM 表示，以营利为目的的网上业务应该注册，而电商平台、支付网关和银行要求的也是已注册的商号或公司。未注册的业务可能难以开设企业银行账户，或让支付网关通过审批。

### 选择结构
独资或合伙是最便宜、最快的起步方式，而私人有限公司（Sdn Bhd）则把业主的个人资产与业务分开。我们关于在马来西亚注册企业的指南介绍了各种选择和 SSM 的步骤。

### 检查执照与许可证
视您销售的产品而定，您可能需要额外批准，例如食品、化妆品、保健产品或受管制商品。线下需要批准的产品，线上同样需要，而电商平台可能会下架不符合规定的产品。

## 2. 选择销售地点

在花钱拍产品照片和做广告之前，先决定您要在哪里销售。三种常见途径也可以结合使用。

### 电商平台
Shopee、Lazada 和 TikTok Shop 等平台提供现成的流量、内置的支付和基本的纠纷处理。代价是佣金和交易费会压缩您的利润、与类似卖家的价格竞争，以及平台可以随时更改的规则。费用和政策因平台和类别而异，所以在承诺之前请查看最新的卖家条款。

### 自家网站
在托管网站平台上开设的店铺，让您掌控品牌、定价和客户数据，也没有平台佣金。代价是您必须自己带来流量、自己处理支付和客户服务，并自己负责安全。对没有受众的新企业来说，这可能很慢。

### 社交媒体销售
通过 Facebook、Instagram 或 WhatsApp 销售容易起步，但难以扩展，也难以保存记录。最好把它当作寻找客户的方式，而不是您接收订单和付款的唯一系统。

### 务实的做法
许多中小企业先在电商平台上获得订单和评价，然后随着成长再加开自家网站服务回头客。无论选哪条路，都要保留您自己的客户名单和记录，而不是只依赖平台的。

## 3. 安全地收款

客户期望用银行卡、网上银行或电子钱包付款，而您需要一个可靠的收款方式。

### 支付网关
支付网关让您的网站接受网上银行、银行卡和电子钱包付款。请选择在马来西亚获得适当许可或批准的服务商，比较其交易费用和结算时间，并查看他们要求的文件，通常包括您的企业注册资料和银行账户详情。

### 电商平台的付款
在电商平台上，平台一般会先代收买家的付款，并在确认送达后放款。请了解放款时间表和任何冻结期，因为它会影响您的现金流。

### 货到付款与手动转账
货到付款和银行转账很常见，但会带来包裹被拒收、假付款凭证和对账混乱的风险。如果您使用它们，请在发货前确认款项确实已到账，并记录每一张订单。

### 把公款与私款分开
请使用您的企业账户收款，这样在做账和报税时，您的收入一目了然。我们关于开立企业银行账户的指南说明了需要准备什么。

## 4. 了解网络卖家的消费者保护规则

马来西亚在消费者保护法律下，对网络商家有特定规定。其目的是确保买家知道自己在和谁交易，以及买的是什么。

### 展示您的企业资料
《消费者保护（电子贸易交易）规则》要求网络卖家在自家网站或平台店铺页面披露关键资料，通常包括企业名称、适用时的注册号码、联络方式、商品或服务的描述、含任何税项和运费的全额价格、接受的付款方式、条款与条件，以及预计送达时间。这些规定适用于在自家网站和电商平台上的卖家，平台运营者也有自己的义务。具体要求历年有所修订，所以请在 KPDN 网站确认最新的措辞。

> 把产品列表当作您与买家之间的合同。您所展示的一切——价格、尺寸、颜色、库存、送达时间、保修——都是您被期望交付的内容，所以请准确描述，不要宣传您无法供应的东西。

### 价格要清楚
在买家付款之前，展示包含税项和运费的全额价格。结账时才冒出来的隐藏费用，是投诉的常见来源。

### 履行退货与保证
《1999年消费者保护法令》给予消费者法定保证，包括商品质量可接受并与描述相符。这与“买家改变主意就可以退货”的一般权利并不相同，您自己的退货政策可以比法律更宽松，但不能剥夺法律赋予的权利。请清楚写明您的退货和退款条款，遵守它们，并让流程保持简单。电商平台也有自己的退货规则，卖家必须遵守。

### 不要误导
虚假宣传、虚假评价，以及误导性的照片或折扣都属违法，而且比任何事情都更快损害一个新品牌。请如实描述产品，并尽可能使用您自己的照片。

### 处罚与投诉
违规可能招致执法行动，买家可向 KPDN 或消费者索赔仲裁庭投诉。罚款金额由法律规定且曾被修订，所以请查看现行条文，而不要依赖博客上的数字。

## 5. 规划配送与退货

配送往往决定了网络企业能否赢得回头客。

### 谨慎选择快递
从价格、覆盖范围、速度、追踪、保险，以及处理遗失或损坏包裹的方式，比较本地快递与物流服务商。许多电商平台提供整合的运送服务，很方便，但值得了解其成本。

### 对时间要诚实
注明现实的送达时间，包括东马，并在延误时通知客户。大多数投诉来自沉默，而非延误本身。

### 为旅程做好包装
包装不好会让您损失补发的货品和评价。对于易碎或易腐的商品，请在扩大规模之前先测试您的包装。

### 决定谁付退货费用
说明有瑕疵、寄错或改变主意的退货，退货运费由谁承担，并在第一张订单之前，而不是第一次纠纷之后，就把它写进您的政策。

### 进口与跨境销售
如果您进口货品转售，或向海外客户销售，可能适用额外的海关、产品标准和税务规定。在投入库存之前，请向皇家马来西亚关税局查核。

## 6. 妥善处理客户数据与税务

### 个人数据
每一张订单都会给您姓名、地址、电话号码，有时还有付款资料。《2010年个人数据保护法令》适用于商业交易，所以您需要隐私声明，只应收集所需的资料，并必须确保其安全。我们关于 PDPA 合规的指南说明了基础知识。切勿自己保存银行卡资料，交由支付网关处理。

### 营销信息
不要向没有同意接收的人发送促销信息，并让客户可以轻易退订。

### 税务与记录
网上收入与其他业务收入一样须课税，所以请保留订单、发票、提款结算单和开支。视您销售的产品和营业额而定，可能适用销售与服务税，电子发票规定也可能随着营业额增长而涉及您的企业。请向相关机构确认两者，并参阅我们关于 SST 和电子发票的指南。

当您的网店上线后，[免费的企业列表](/zh/signup)可以帮助本地客户和商业伙伴在电商平台之外找到并核实您，您也可以[浏览名录](/zh)寻找与网络卖家合作的本地快递、包装供应商、摄影师和会计师。

## 马来西亚中小企业网上销售时常犯的错误

- **没有注册就销售。** 未注册的企业很难取得支付网关或企业账户，也让业主面临本可避免的风险。
- **隐藏全额价格或企业资料。** 缺少联络资料和结账时才出现的运费，违反披露规定，也让您失去客户的信任。
- **一切都依赖单一平台。** 如果您唯一的客户名单存在电商平台上，一次政策更改或账户被暂停，就可能让收入一夜之间中断。

## 从哪里开始

- **本周：**向 SSM 注册企业，开立企业银行账户，并查核您的产品是否需要任何执照或批准。
- **接着：**选定第一个销售渠道，设置一个您信任的付款方式，并写好清晰的产品描述和退货条款。
- **然后：**用几张订单测试您的配送流程，并建立一份简单的订单、提款和客户资料记录。
- **每个月：**检讨您的费用、评价、退货和客户数据处理方式，并建立您自己的客户名单。

当基础工作平淡无奇时，网上销售的效果最好：一间注册的企业、诚实的产品列表、可靠的付款，以及客户可以信赖的配送流程。`,
        faqs: [
          {
            question: "在马来西亚网上销售需要注册企业吗？",
            answer:
              "SSM 表示，以营利为目的的网上业务应该注册，而电商平台、支付网关和银行通常会要求企业注册资料。先注册也让开设企业银行账户更容易。",
          },
          {
            question: "应该在电商平台上销售，还是建立自己的网站？",
            answer:
              "电商平台提供现成的流量和支付，但收取费用并限制您的掌控；自家网站让您掌控且没有佣金，但需要自己带来流量。许多中小企业先在电商平台起步，随着成长再加开自己的网站。",
          },
          {
            question: "网络卖家必须展示哪些企业资料？",
            answer:
              "《消费者保护（电子贸易交易）规则》通常要求披露企业名称、适用时的注册号码、联络资料、商品描述、含税项和运费的全额价格、付款方式、条款以及预计送达时间。请在 KPDN 网站确认最新要求。",
          },
          {
            question: "买家只是改变主意，我必须接受退货吗？",
            answer:
              "这不是一般的法律权利。《1999年消费者保护法令》对质量可接受和与描述相符等事项提供保证，但改变主意的退货通常取决于您自己的政策或电商平台的规则。请清楚写明您的政策并遵守。",
          },
          {
            question: "如何在自己的网站上收款？",
            answer:
              "请使用在马来西亚获得适当许可或批准的支付网关。比较费用和结算时间，预备提供企业注册资料和银行详情，并且切勿自己保存客户的银行卡资料。",
          },
          {
            question: "通过 WhatsApp 或社交媒体接单安全吗？",
            answer:
              "这是容易起步的方式，但难以扩展，也难以保存记录。请把它当作寻找客户的方式，在发货前确认款项确实已到账，并记录每一张订单。",
          },
          {
            question: "PDPA 适用于小型网店吗？",
            answer:
              "一般适用。如果您在商业交易中收集客户的个人数据，就需要隐私声明，只应收集所需的资料，并必须确保数据安全。银行卡资料交由支付网关处理，也不要向没有同意的人发送营销信息。",
          },
          {
            question: "我的网上收入需要课税吗？",
            answer:
              "需要，网上收入与其他业务收入一样须课税，所以请保留订单、发票、提款结算单和开支。视您销售的产品和营业额而定，也可能适用销售与服务税和电子发票，请向相关机构确认。",
          },
        ],
      },
      ms: {
        title: "Berjual Dalam Talian di Malaysia: Menyediakan Kedai Dalam Talian dengan Betul",
        excerpt:
          "Berjual dalam talian membolehkan perniagaan kecil Malaysia menjangkau pelanggan jauh melangkaui jalan di hadapan kedainya, tetapi ia datang dengan asas undang-undang dan praktikalnya sendiri. Panduan ini merangkumi pendaftaran perniagaan, memilih antara pasaran dalam talian dan laman web sendiri, get laluan pembayaran, peraturan perlindungan pengguna untuk penjual dalam talian, pilihan penghantaran, dan pengendalian data pelanggan.",
        body: `Berjual dalam talian bukan lagi aktiviti yang berasingan daripada menjalankan perniagaan — bagi ramai PKS Malaysia, ia ialah saluran utama. Pembuat kek di rumah di pasaran dalam talian, butik dengan laman web sendiri dan pengilang yang berjual melalui media sosial semuanya menghadapi soalan yang sama: apa yang perlu ada supaya ini menjadi perniagaan yang sah dan bukan projek sampingan yang berisiko? Menyiapkan asas dengan betul lebih awal melindungi anda daripada denda, tuntutan bayaran balik dan pelanggan yang marah kemudian.

Ini ialah maklumat am, bukan nasihat guaman. Peraturan perlindungan pengguna, layanan cukai dan dasar platform berubah, dan ia berbeza mengikut apa yang anda jual, jadi sahkan kedudukan semasa dengan pihak berkuasa berkaitan, seperti Kementerian Perdagangan Dalam Negeri dan Kos Sara Hidup (KPDN) atau SSM, sebelum anda bergantung padanya.

## 1. Daftarkan perniagaan dahulu

Ramai orang bermula dengan menyiarkan produk dan memikirkan pendaftaran kemudian. Lebih baik melakukannya dahulu.

### Mengapa pendaftaran penting
SSM telah menyatakan bahawa perniagaan dalam talian yang dijalankan untuk keuntungan harus didaftarkan, dan nama perniagaan atau syarikat berdaftar juga yang akan diminta oleh pasaran dalam talian, get laluan pembayaran dan bank. Perniagaan yang tidak berdaftar mungkin sukar membuka akaun bank perniagaan atau mendapat kelulusan get laluan pembayaran.

### Pilih struktur
Pemilikan tunggal atau perkongsian ialah cara paling murah dan pantas untuk bermula, manakala syarikat sendirian berhad (Sdn Bhd) memisahkan aset peribadi pemilik daripada perniagaan. Panduan kami tentang mendaftarkan perniagaan di Malaysia menerangkan pilihan dan langkah SSM.

### Semak lesen dan permit
Bergantung pada apa yang anda jual, anda mungkin memerlukan kelulusan tambahan, contohnya untuk makanan, kosmetik, produk kesihatan atau barangan terkawal. Produk yang memerlukan kelulusan secara luar talian juga memerlukannya dalam talian, dan pasaran dalam talian mungkin membuang penyenaraian yang tidak memenuhi peraturan.

## 2. Pilih di mana anda akan berjual

Tentukan di mana anda akan berjual sebelum membelanjakan wang untuk gambar produk dan pengiklanan. Tiga laluan yang lazim juga boleh digabungkan.

### Pasaran dalam talian
Platform seperti Shopee, Lazada dan TikTok Shop memberi anda trafik sedia ada, pembayaran terbina dan pengendalian pertikaian asas. Pertukarannya ialah komisen dan yuran transaksi yang mengurangkan margin anda, persaingan harga daripada penjual yang serupa, dan peraturan yang boleh diubah oleh platform. Yuran dan dasar berbeza mengikut platform dan kategori, jadi semak terma penjual semasa sebelum anda membuat komitmen.

### Laman web sendiri
Kedai di platform laman web yang dihoskan memberi anda kawalan ke atas penjenamaan, harga dan data pelanggan, dan tiada komisen pasaran. Pertukarannya ialah anda mesti membawa trafik sendiri, mengendalikan pembayaran dan khidmat pelanggan sendiri, serta menjaga keselamatan sendiri. Bagi perniagaan baharu tanpa penonton, ini boleh perlahan.

### Jualan melalui media sosial
Berjual melalui Facebook, Instagram atau WhatsApp mudah dimulakan, tetapi sukar diperluas dan sukar menyimpan rekod. Lebih baik ia dianggap sebagai cara mencari pelanggan dan bukan satu-satunya sistem anda untuk menerima pesanan dan bayaran.

### Pendekatan yang munasabah
Ramai PKS bermula di pasaran dalam talian untuk mendapatkan pesanan dan ulasan, kemudian menambah laman web sendiri untuk pelanggan berulang apabila berkembang. Apa sahaja laluan yang anda pilih, simpan senarai pelanggan dan rekod anda sendiri, bukan hanya milik platform.

## 3. Terima pembayaran dengan selamat

Pelanggan menjangkakan untuk membayar dengan kad, perbankan dalam talian atau e-dompet, dan anda memerlukan cara yang boleh dipercayai untuk menerima wang itu.

### Get laluan pembayaran
Get laluan pembayaran membolehkan laman web anda menerima perbankan dalam talian, kad dan e-dompet. Gunakan penyedia yang dilesenkan atau diluluskan dengan sewajarnya di Malaysia, bandingkan yuran transaksi dan masa penyelesaian mereka, dan semak dokumen yang mereka perlukan, yang lazimnya termasuk pendaftaran perniagaan dan butiran akaun bank anda.

### Pembayaran pasaran dalam talian
Di pasaran dalam talian, platform amnya memegang bayaran pembeli dan melepaskannya selepas penghantaran disahkan. Fahami jadual pelepasan dan sebarang tempoh penahanan, kerana ia menjejaskan aliran tunai anda.

### Tunai semasa penghantaran dan pindahan manual
Tunai semasa penghantaran dan pindahan bank adalah biasa, tetapi membawa risiko bungkusan ditolak, slip bayaran palsu dan pendamaian yang kucar-kacir. Jika anda menggunakannya, sahkan bahawa dana benar-benar telah masuk sebelum menghantar, dan rekodkan setiap pesanan.

### Pisahkan wang perniagaan dan peribadi
Gunakan akaun perniagaan anda untuk menerima bayaran, supaya pendapatan anda jelas apabila tiba masa menyediakan akaun dan cukai. Panduan kami tentang membuka akaun bank perniagaan menerangkan apa yang perlu disediakan.

## 4. Ketahui peraturan perlindungan pengguna untuk penjual dalam talian

Malaysia mempunyai peraturan khusus untuk peniaga dalam talian di bawah undang-undang perlindungan penggunanya. Ia wujud untuk memastikan pembeli tahu siapa yang mereka berurusan dan apa yang mereka beli.

### Paparkan butiran perniagaan anda
Peraturan Perlindungan Pengguna (Transaksi Perdagangan Elektronik) menghendaki penjual dalam talian mendedahkan maklumat utama di laman web atau profil pasaran mereka, lazimnya termasuk nama perniagaan, nombor pendaftaran jika berkenaan, butiran hubungan, penerangan barangan atau perkhidmatan, harga penuh termasuk sebarang cukai dan caj penghantaran, kaedah pembayaran yang diterima, terma dan syarat, serta anggaran masa penghantaran. Peraturan ini terpakai kepada penjual di laman web sendiri dan di pasaran dalam talian, dan pengendali pasaran mempunyai tugas mereka sendiri. Keperluan tepatnya telah dipinda dari semasa ke semasa, jadi sahkan perkataan semasa di laman web KPDN.

> Anggaplah penyenaraian produk sebagai kontrak anda dengan pembeli. Apa sahaja yang anda tunjukkan — harga, saiz, warna, stok, masa penghantaran, waranti — itulah yang dijangka anda sampaikan, jadi terangkan dengan tepat dan jangan mengiklankan apa yang tidak dapat anda bekalkan.

### Jelas tentang harga
Tunjukkan harga penuh, termasuk cukai dan penghantaran, sebelum pembeli membayar. Caj tersembunyi yang muncul semasa pembayaran ialah punca aduan yang lazim.

### Hormati pemulangan dan jaminan
Akta Perlindungan Pengguna 1999 memberi pengguna jaminan berkanun, termasuk bahawa barangan berkualiti boleh diterima dan sepadan dengan penerangannya. Ini tidak sama dengan hak am untuk memulangkan sesuatu kerana pembeli berubah fikiran, dan dasar pemulangan anda sendiri boleh lebih murah hati daripada undang-undang, tetapi ia tidak boleh menarik balik hak yang diberikan undang-undang. Nyatakan terma pemulangan dan bayaran balik dengan jelas, ikutinya, dan pastikan prosesnya mudah. Pasaran dalam talian juga mempunyai peraturan pemulangan sendiri yang mesti dipatuhi penjual.

### Jangan mengelirukan
Dakwaan palsu, ulasan palsu, serta gambar atau diskaun yang mengelirukan adalah kesalahan, dan ia merosakkan jenama baharu lebih cepat daripada apa-apa lagi. Terangkan produk dengan jujur dan gunakan gambar anda sendiri sedapat mungkin.

### Penalti dan aduan
Pelanggaran boleh membawa kepada tindakan penguatkuasaan, dan pembeli boleh mengadu kepada KPDN atau Tribunal Tuntutan Pengguna. Jumlah denda ditetapkan dalam undang-undang dan telah disemak, jadi semak peruntukan semasa dan bukannya bergantung pada angka daripada blog.

## 5. Rancang penghantaran dan pemulangan

Penghantaran ialah tempat perniagaan dalam talian sering menang atau kalah dalam mendapatkan pelanggan berulang.

### Pilih kurier dengan teliti
Bandingkan penyedia kurier dan logistik tempatan dari segi harga, liputan, kelajuan, penjejakan, insurans dan cara mereka mengendalikan bungkusan hilang atau rosak. Banyak pasaran dalam talian menawarkan penghantaran bersepadu yang mudah, tetapi berbaloi mengetahui kosnya.

### Jujur tentang masa
Nyatakan masa penghantaran yang realistik, termasuk ke Malaysia Timur, dan kemas kini pelanggan jika berlaku kelewatan. Kebanyakan aduan datang daripada senyap, bukan daripada kelewatan itu sendiri.

### Bungkus untuk perjalanan
Pembungkusan yang buruk menyebabkan anda kehilangan barangan ganti dan ulasan. Bagi barangan mudah pecah atau mudah rosak, uji pembungkusan anda sebelum meluaskan skala.

### Tentukan siapa membayar pemulangan
Jelaskan siapa menanggung penghantaran pemulangan bagi pemulangan barang rosak, salah atau kerana berubah fikiran, dan masukkannya dalam dasar anda sebelum pesanan pertama dan bukan selepas pertikaian pertama.

### Import dan jualan merentas sempadan
Jika anda mengimport barangan untuk dijual semula atau berjual kepada pelanggan di luar negara, peraturan tambahan tentang kastam, piawaian produk dan cukai mungkin terpakai. Semak perkara ini dengan Jabatan Kastam Diraja Malaysia sebelum anda membuat komitmen terhadap stok.

## 6. Kendalikan data pelanggan dan cukai dengan betul

### Data peribadi
Setiap pesanan memberi anda nama, alamat, nombor telefon dan kadangkala butiran pembayaran. Akta Perlindungan Data Peribadi 2010 terpakai kepada transaksi komersial, jadi anda memerlukan notis privasi, hanya perlu mengumpul apa yang diperlukan, dan mesti memastikannya selamat. Panduan kami tentang pematuhan PDPA menerangkan asasnya. Jangan sekali-kali menyimpan butiran kad sendiri; biarkan get laluan pembayaran mengendalikannya.

### Mesej pemasaran
Jangan hantar mesej promosi kepada orang yang tidak bersetuju untuk menerimanya, dan benarkan pelanggan menarik diri dengan mudah.

### Cukai dan rekod
Pendapatan dalam talian boleh dicukai seperti pendapatan perniagaan lain, jadi simpan pesanan, invois, penyata pembayaran dan perbelanjaan. Bergantung pada apa yang anda jual dan perolehan anda, cukai jualan dan perkhidmatan mungkin terpakai, dan peraturan e-Invois mungkin menjangkau perniagaan anda apabila perolehan meningkat. Sahkan kedua-duanya dengan pihak berkuasa berkaitan dan lihat panduan kami tentang SST dan e-Invois.

Apabila kedai anda beroperasi, [penyenaraian perniagaan percuma](/ms/signup) membantu pelanggan tempatan dan rakan niaga menemui dan mengesahkan anda di luar pasaran dalam talian, dan anda boleh [menyemak imbas direktori](/ms) untuk kurier, pembekal pembungkusan, jurugambar dan akauntan tempatan yang bekerja dengan penjual dalam talian.

## Kesilapan lazim PKS Malaysia semasa berjual dalam talian

- **Berjual tanpa mendaftar.** Perniagaan yang tidak berdaftar sukar mendapat get laluan pembayaran atau akaun perniagaan, dan mendedahkan pemilik kepada risiko yang boleh dielakkan.
- **Menyembunyikan harga penuh atau butiran perniagaan.** Maklumat hubungan yang tiada dan caj penghantaran mengejut melanggar peraturan pendedahan dan menghilangkan kepercayaan pelanggan.
- **Bergantung pada satu platform untuk segala-galanya.** Jika satu-satunya senarai pelanggan anda berada di pasaran dalam talian, perubahan dasar atau akaun yang digantung boleh menghentikan pendapatan anda dalam sekelip mata.

## Di mana hendak bermula

- **Minggu ini:** Daftarkan perniagaan dengan SSM, buka akaun bank perniagaan, dan semak sama ada produk anda memerlukan sebarang lesen atau kelulusan.
- **Seterusnya:** Pilih saluran jualan pertama anda, sediakan kaedah pembayaran yang anda percayai, dan tulis penerangan produk serta terma pemulangan yang jelas.
- **Kemudian:** Uji proses penghantaran anda dengan beberapa pesanan, dan sediakan rekod mudah pesanan, pembayaran dan butiran pelanggan.
- **Setiap bulan:** Semak yuran, ulasan, pemulangan dan amalan data pelanggan anda, dan bina senarai pelanggan anda sendiri.

Berjual dalam talian paling berkesan apabila asasnya membosankan: perniagaan berdaftar, penyenaraian yang jujur, pembayaran yang boleh dipercayai, dan proses penghantaran yang dipercayai pelanggan anda.`,
        faqs: [
          {
            question: "Adakah saya perlu mendaftarkan perniagaan untuk berjual dalam talian di Malaysia?",
            answer:
              "SSM telah menyatakan bahawa perniagaan dalam talian yang dijalankan untuk keuntungan harus didaftarkan, dan pasaran dalam talian, get laluan pembayaran dan bank lazimnya meminta pendaftaran perniagaan. Mendaftar dahulu juga memudahkan pembukaan akaun bank perniagaan.",
          },
          {
            question: "Patutkah saya berjual di pasaran dalam talian atau membina laman web sendiri?",
            answer:
              "Pasaran dalam talian memberi trafik dan pembayaran sedia ada tetapi mengenakan yuran dan menghadkan kawalan anda, manakala laman web sendiri memberi kawalan dan tiada komisen tetapi memerlukan trafik sendiri. Ramai PKS bermula di pasaran dalam talian dan menambah laman sendiri apabila berkembang.",
          },
          {
            question: "Apakah butiran perniagaan yang mesti dipaparkan oleh penjual dalam talian?",
            answer:
              "Peraturan Perlindungan Pengguna (Transaksi Perdagangan Elektronik) lazimnya menghendaki butiran seperti nama perniagaan, nombor pendaftaran jika berkenaan, maklumat hubungan, penerangan barangan, harga penuh termasuk cukai dan penghantaran, kaedah pembayaran, terma dan anggaran masa penghantaran. Sahkan keperluan semasa di laman web KPDN.",
          },
          {
            question: "Adakah saya mesti menerima pemulangan jika pembeli sekadar berubah fikiran?",
            answer:
              "Bukan sebagai hak undang-undang am. Akta Perlindungan Pengguna 1999 memberi jaminan tentang perkara seperti kualiti boleh diterima dan sepadan dengan penerangan, tetapi pemulangan kerana berubah fikiran biasanya bergantung pada dasar anda sendiri atau peraturan pasaran dalam talian. Nyatakan dasar anda dengan jelas dan ikutinya.",
          },
          {
            question: "Bagaimanakah saya menerima pembayaran di laman web sendiri?",
            answer:
              "Gunakan get laluan pembayaran yang dilesenkan atau diluluskan dengan sewajarnya di Malaysia. Bandingkan yuran dan masa penyelesaian, jangkakan perlu mengemukakan pendaftaran perniagaan dan butiran bank, dan jangan sekali-kali menyimpan butiran kad pelanggan sendiri.",
          },
          {
            question: "Adakah selamat menerima pesanan melalui WhatsApp atau media sosial?",
            answer:
              "Ia cara mudah untuk bermula, tetapi sukar diperluas dan sukar menyimpan rekod. Anggaplah ia cara mencari pelanggan, sahkan bahawa bayaran benar-benar telah masuk sebelum menghantar, dan simpan rekod setiap pesanan.",
          },
          {
            question: "Adakah PDPA terpakai kepada kedai dalam talian kecil?",
            answer:
              "Amnya ya. Jika anda mengumpul data peribadi pelanggan dalam transaksi komersial, anda memerlukan notis privasi, hanya patut mengumpul apa yang diperlukan, dan mesti memastikan data itu selamat. Biarkan get laluan pembayaran mengendalikan butiran kad, dan jangan hantar mesej pemasaran kepada orang yang tidak bersetuju.",
          },
          {
            question: "Adakah pendapatan dalam talian saya akan dicukai?",
            answer:
              "Ya, pendapatan dalam talian boleh dicukai seperti pendapatan perniagaan lain, jadi simpan pesanan, invois, penyata pembayaran dan perbelanjaan. Cukai jualan dan perkhidmatan serta e-Invois juga mungkin terpakai bergantung pada apa yang anda jual dan perolehan anda, jadi sahkan dengan pihak berkuasa berkaitan.",
          },
        ],
      },
    },
  },
  {
    slug: "renting-commercial-premises-in-malaysia",
    title: "Renting Commercial Premises in Malaysia: Tenancy Agreements, Deposits, and Stamp Duty",
    seoTitle: "Renting Commercial Premises in Malaysia: Lease Guide",
    seoDescription:
      "What Malaysian SMEs should check before signing a shop or office lease: key terms, deposits, stamp duty, fit-out and signage approvals, and exit options.",
    coverImage: {
      file: "renting-commercial-premises-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "Close-up of a person signing a contract with a pen at an office desk",
      altTranslations: {
        zh: "办公桌前一个人手持钢笔签署合约的特写",
        ms: "Gambar dekat seseorang menandatangani kontrak dengan pen di meja pejabat",
      },
    },
    contentImages: {
      "lease-review": {
        file: "renting-commercial-premises-in-malaysia-lease-review.webp",
        mimeType: "image/webp",
        alt: "A man and a woman reading through printed documents together",
        altTranslations: {
          zh: "一男一女一起查阅打印文件",
          ms: "Seorang lelaki dan seorang wanita membaca dokumen bercetak bersama-sama",
        },
        after: "Read the draft agreement line by line before you hand over a single ringgit beyond the booking deposit.",
        afterTranslations: {
          zh: "在付出订金以外的任何一分钱之前，请逐行细读协议草稿。",
          ms: "Baca draf perjanjian baris demi baris sebelum anda menyerahkan satu ringgit pun selain deposit tempahan.",
        },
      },
    },
    excerpt:
      "Signing a shop or office lease is one of the biggest commitments a small business makes, and it is usually drafted in the landlord's favour. This guide walks through what to check before you sign in Malaysia — the key terms, the usual deposits, stamp duty, fit-out and signage approvals, and how to negotiate or exit a lease without being caught out.",
    body: `For most small businesses, rent is the largest fixed cost after payroll, and the lease behind it can bind you for three years or more. Unlike a residential tenancy, a commercial lease in Malaysia is largely a matter of what the two parties write down, so the agreement you sign matters far more than the handshake that preceded it. Owners who rush in because the location is perfect often discover the costs and restrictions only after they have spent money on renovation.

This is general information, not legal advice. Stamp duty rates, tax treatment, and local council rules change, and they differ by state and by property, so confirm the current position with the relevant authority or a Malaysian lawyer before you commit.

## 1. Check the premises before you negotiate

A good lease on the wrong premises is still a bad deal. Before you talk rent, confirm the basics.

### Confirm who you are dealing with
Ask for proof that the person offering the space actually owns it or is authorised to let it. You can ask for a copy of the title and, for a more certain answer, have a lawyer do an official land search. If the person is a tenant offering a sub-letting, check that their own lease allows it.

### Check that your business is allowed there
A unit may be approved for office use but not for a restaurant, or for retail but not for light manufacturing. Check the permitted use with the local council (PBT), and confirm whether the building has the right fire safety approvals and enough parking, water, and electrical capacity for what you plan to do.

### Visit at different times
Look at the premises on a weekday morning, a busy evening, and a weekend. Foot traffic, noise, parking, flooding, and neighbouring businesses all look different once you see them at the hours you will actually trade.

## 2. Understand the main terms of a commercial tenancy agreement

Read the draft agreement line by line before you hand over a single ringgit beyond the booking deposit. These are the clauses that most often decide whether the lease works for you.

### Rent and what it includes
State the monthly rent, the due date, and the payment method. Ask whether service charges, sinking fund, air-conditioning charges, or property assessment and quit rent are included or billed separately, since these can add noticeably to the real cost.

### The term and the renewal option
Commercial leases commonly run for three years, sometimes with an option to renew for a further term. Malaysia has no general law that gives a commercial tenant an automatic right to renew, so if you want to stay, the option must be written into the agreement, together with how it is exercised and by when.

### Rent review
Look for how rent changes over the term and on renewal. A fixed step-up, such as a set percentage at each renewal, is predictable. "Rent to be reviewed at the landlord's discretion" is not, so ask for a cap or a formula.

### Use, alterations, and assignment
Check that the permitted use covers your actual business, whether you may put up signage, and whether you may assign or sub-let if you ever need to leave early. Landlords often prohibit all three without consent.

### Repairs, insurance, and reinstatement
The agreement should say who fixes what. Pay close attention to the reinstatement clause, which can require you to strip out your fit-out and restore the premises to its original condition when the lease ends. That can be a significant cost, so budget for it at the start.

### Default and termination
See what happens if rent is late and how many days you get to fix a problem. Many agreements let the landlord terminate and re-enter after a short period of arrears, so a cash-flow dip can have severe consequences.

> Whatever the landlord or agent promises verbally, treat it as non-existent unless it is in the signed agreement. If a free rent period, a refurbishment by the landlord, or an agreed rent cap matters to you, get it written into the lease or a signed side letter.

## 3. Know the usual deposits and upfront costs

Landlords generally ask for more upfront than the first month's rent, and the structure is usually negotiable. The amounts below are common practice rather than a legal rule, so confirm the specifics in your own offer.

### Booking deposit
A letter of offer or letter of intent often comes with a booking deposit to take the unit off the market. Check whether it is refundable if the deal falls through, and what the letter binds you to.

### Security deposit
This is typically the equivalent of around two months' rent, held against unpaid rent or damage and refundable at the end of the lease subject to deductions.

### Utility and other deposits
A further deposit, often around half to one month's rent, is common for water and electricity, and sometimes for access cards or similar. Utility providers may also ask for their own deposits.

### Advance rent
The first month's rent is usually paid on signing. Some landlords ask for more, and it is worth negotiating, especially if you are a start-up with limited cash.

### Ask how deposits are returned
Make sure the agreement states when and how deposits are refunded after you move out, and under what conditions the landlord can deduct. Disputes about deposits are among the most common between tenants and landlords.

## 4. Stamp duty on the agreement

A tenancy agreement generally has to be stamped, and an unstamped agreement can be difficult to rely on as evidence in court. Duty is charged on the annual rent and depends on how long the lease runs. The commonly cited rates are, per RM250 or part of it in annual rent, about RM1 for a term up to one year, RM3 for more than one and up to three years, RM5 for more than three and up to five years, and RM7 for terms longer than five years. Rates, exemptions, and the method of calculation have been updated from time to time, so check the current figures before you rely on any of them.

Stamping is done online through the Inland Revenue Board's (LHDN) e-Duti Setem system, and a stamp-duty deadline applies, commonly cited as 30 days from signing, with penalties for late stamping. Confirm the deadline and penalty rates on the official LHDN page. Who pays the duty is a matter of agreement, so settle it before you sign rather than after.

### Leases over three years may need registration
Under the National Land Code, a lease of more than three years generally has to be registered against the land title to protect the tenant's interest, which adds a separate cost and process. Ask your lawyer whether your lease needs it.

### Check the tax treatment of the rent
Service tax has applied to commercial rental and leasing services since 1 July 2025, with registration depending on the landlord's turnover, and the rate and thresholds for small businesses have been reported to have changed since. Ask the landlord whether the quoted rent includes any tax, and confirm the current position with the Royal Malaysian Customs Department.

## 5. Get your approvals in order before fit-out

Signing the lease does not give you the right to open. Many of the approvals you need depend on having the premises.

### Business licence
Most businesses need a licence from the local council for the specific premises, and some need extra approvals, such as health or fire clearance for food outlets. Our guide on business licences and permits covers how this works. Do not renovate before you know the licence is achievable at that address.

### Renovation and fit-out approvals
Structural changes, partitions, signage, and signboards may need approval from the landlord, the building management, and sometimes the council. A fit-out contractor should know the local requirements, but the responsibility to check is yours.

### Signage
Signboards are usually regulated by the council, which often requires an advertisement licence and sets size and placement rules. Confirm what is allowed before you order a sign.

### Time your rent-free period
Many landlords offer a rent-free fit-out period of a few weeks to a few months. Try to negotiate one, and make sure it is long enough for approvals and renovation, so you are not paying rent on a shop that cannot open.

## 6. Negotiate smartly and plan your exit

Most terms are more flexible than a landlord's first draft suggests, particularly if the unit has been empty for a while or you are offering a longer commitment.

### What to negotiate
Aim for a rent-free fit-out period, a cap on increases, a clear renewal option, a smaller security deposit, and reasonable reinstatement obligations. A landlord who will not move on anything is telling you something about the relationship.

### Consider a break clause
A clause that lets you end the lease early after a set period, with notice and perhaps a penalty, protects you if the business does not take off. Landlords often resist it, but even a break after the first year or two is valuable.

### Be careful with personal guarantees
Landlords of small companies often ask the director to guarantee the lease personally. That means your own assets are at risk if the company cannot pay, so understand exactly what you are signing and for how long.

### Know how you can leave
Check the notice period, the rules on assignment or sub-letting, and what you owe if you leave early. If the business fails, a sub-let or assignment, if allowed, may be the cheapest way out.

### Use a lawyer for the final draft
A lawyer's fee for reviewing a commercial lease is small compared with the rent you commit to. If the landlord's lawyer prepares the draft, remember that they act for the landlord, not you.

If you are still comparing locations or looking for a trade partner such as a renovation contractor, [creating a free business listing](/en/signup) helps customers and suppliers find you at your new address, and you can [browse the directory](/en) for local lawyers, contractors, and business advisers.

## Common mistakes Malaysian SMEs make when renting premises

- **Signing before checking the approvals.** A lease on premises that cannot get your licence or permitted use leaves you paying rent on a business that cannot open.
- **Relying on verbal promises.** Free rent periods, repairs, and rent caps that are not in the signed agreement are very hard to enforce later.
- **Forgetting the reinstatement bill.** Stripping out a fit-out at the end of the lease can cost real money, so negotiate it and budget for it from day one.

## Where to start

- **This week:** List your must-haves for a location — permitted use, size, parking, foot traffic — and the maximum all-in monthly cost you can afford.
- **Next:** For any shortlisted unit, check ownership, permitted use, and what the monthly figure really includes.
- **Then:** Negotiate the key terms, get the final draft reviewed by a lawyer, and settle who pays stamp duty before signing.
- **After signing:** Stamp the agreement on time, secure your licences and approvals, and diarise the renewal and notice dates.

A good lease is one you understand completely, can afford comfortably, and can leave without disaster if things change.`,
    faqs: [
      {
        question: "Does a commercial tenancy agreement in Malaysia have to be stamped?",
        answer:
          "Generally yes. Tenancy agreements are subject to stamp duty, and an unstamped agreement can be hard to rely on in court. Stamping is done online through LHDN's e-Duti Setem system, so confirm the current deadline and penalties on the official page.",
      },
      {
        question: "How is stamp duty on a lease calculated?",
        answer:
          "It is based on the annual rent and the length of the term. The commonly cited rates are about RM1, RM3, RM5, or RM7 per RM250 (or part of it) of annual rent, depending on whether the term is up to one year, up to three, up to five, or longer. Rates and rules change, so check the current figures with LHDN.",
      },
      {
        question: "How much deposit do landlords usually ask for?",
        answer:
          "Common practice is a security deposit of around two months' rent, a utility deposit of around half to one month, plus the first month's rent in advance. These are customs rather than legal rules, and they are often negotiable, so check your own offer letter.",
      },
      {
        question: "Does a commercial tenant have a right to renew the lease?",
        answer:
          "Not automatically. Malaysia has no general law that gives a commercial tenant a right to renew, so if you want that option it needs to be written into the agreement, including how and by when you must exercise it.",
      },
      {
        question: "Do I need a business licence before I start renovating?",
        answer:
          "You should check first. Most businesses need a licence from the local council for the specific premises, and some need extra approvals. Confirm that the use and address can be licensed before you spend money on a fit-out.",
      },
      {
        question: "What is a reinstatement clause?",
        answer:
          "It requires you to remove your fit-out and return the premises to its original condition when the lease ends. This can be a significant cost, so read it carefully, try to limit it, and budget for it from the start.",
      },
      {
        question: "Can I leave a commercial lease early?",
        answer:
          "Only as far as the agreement allows. Check for a break clause, the notice period, and whether you can assign or sub-let. Leaving without a right to do so can leave you owing the remaining rent, so negotiate exit options before signing.",
      },
      {
        question: "Should I get a lawyer to review a commercial lease?",
        answer:
          "It is strongly advisable. The cost of a review is small compared with the rent and obligations you commit to. If the landlord's lawyer drafted the agreement, remember that they act for the landlord and not for you.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚租用商业场所：租赁协议、押金与印花税",
        excerpt:
          "签订店铺或办公室租约，是小企业最重大的承诺之一，而租约通常是以房东的利益为出发点起草的。本指南带您了解在马来西亚签约前应检查的事项——主要条款、常见的押金、印花税、装修与招牌的审批，以及如何谈判或退出租约而不被打个措手不及。",
        body: `对大多数小企业来说，租金是仅次于薪资的最大固定开支，而背后的租约可能把您绑上三年或更长时间。与住宅租赁不同，马来西亚的商业租约在很大程度上取决于双方写下了什么，所以您签署的协议，远比之前的口头约定重要。有些企业主因为地点理想而匆忙签约，直到花了装修费用之后，才发现各种成本与限制。

以下仅为一般资讯，并非法律意见。印花税率、税务处理和地方政府规定会变动，也因州属和物业而异，所以在作出承诺之前，请向相关机构或马来西亚律师确认最新情况。

## 1. 谈判之前先检查场所

在错误的场所签下再好的租约，仍然是一笔糟糕的交易。谈租金之前，先确认基本事项。

### 确认您的交易对象
请对方出示证明，说明提供场地的人确实拥有该物业或获授权出租。您可以要求提供地契副本，若想更有把握，可请律师做正式的土地查册。如果对方是转租的租户，请确认其自身的租约是否允许转租。

### 确认您的业务可在该处经营
某个单位可能获准作办公室用途，却不能开餐馆；或获准作零售，却不能做轻型制造。请向地方政府（PBT）查询许可用途，并确认大厦具备适当的消防批准，以及足够的停车位、水和电力容量来配合您的计划。

### 在不同时段实地查看
请在平日早上、繁忙的傍晚和周末各去看一次。客流量、噪音、停车、淹水以及邻近商家，在您实际营业的时段看起来都会不一样。

## 2. 了解商业租赁协议的主要条款

在付出订金以外的任何一分钱之前，请逐行细读协议草稿。以下这些条款，最常决定租约对您是否可行。

### 租金及其包含的项目
写明每月租金、到期日和付款方式。请询问服务费、偿债基金、冷气费，或地税与地租是否包含在内，还是另外收费，因为这些可能明显增加实际成本。

### 租期与续约选择权
商业租约通常为期三年，有时附带再续一期的选择权。马来西亚没有一般性法律赋予商业租户自动续约的权利，所以如果您想继续租下去，就必须把这项选择权写入协议，并写明如何行使以及行使的期限。

### 租金检讨
留意租期内以及续约时租金如何调整。固定的递增幅度，例如每次续约增加某个百分比，是可预测的。“租金由房东酌情检讨”则不然，所以请争取设定上限或计算公式。

### 用途、改建与转让
检查许可用途是否涵盖您的实际业务，您是否可以安装招牌，以及万一需要提早离开时是否可以转让或转租。房东往往在未经同意的情况下禁止这三项。

### 维修、保险与还原
协议应写明谁负责修什么。请特别留意还原条款，它可能要求您在租约结束时拆除装修，并把场所恢复原状。这可能是一笔不小的开支，所以一开始就要编入预算。

### 违约与终止
了解租金逾期会怎样，以及您有多少天时间补救。许多协议允许房东在短期拖欠后终止租约并收回场所，因此现金流一时吃紧，可能带来严重后果。

> 无论房东或中介口头上承诺什么，除非写进已签署的协议，否则一概当作不存在。如果免租期、房东负责翻新或议定的租金上限对您很重要，请把它们写进租约或一份签署的附函。

## 3. 了解常见的押金与前期费用

房东通常要求的前期费用不只是第一个月的租金，而且结构通常可以谈判。以下金额属于常见做法而非法律规定，所以请在您自己的租赁要约中确认具体细节。

### 订金
租赁要约函或意向书通常附带一笔订金，用来把该单位保留下来。请确认交易不成时订金是否可退，以及这封函件对您有什么约束。

### 保证金
通常相当于约两个月的租金，用于抵扣未付租金或损坏，并在租约结束时扣除相关款项后退还。

### 水电及其他押金
水电通常另有一笔押金，常见为半个月至一个月租金，有时也包括门禁卡等。公用事业机构也可能要求自己的押金。

### 预付租金
第一个月的租金通常在签约时支付。有些房东要求更多，值得争取谈判，尤其是现金有限的初创企业。

### 问清楚押金如何退还
确保协议写明您搬走后押金何时、如何退还，以及房东在什么条件下可以扣除。押金纠纷是租户与房东之间最常见的争议之一。

## 4. 协议的印花税

租赁协议一般必须盖印花税，未盖印的协议在法庭上可能难以作为证据。税款按年租金计算，并视租期长短而定。常见的税率是，每 RM250（不足也按一档计）年租金，租期一年或以下约 RM1，超过一年至三年约 RM3，超过三年至五年约 RM5，超过五年则约 RM7。税率、豁免和计算方法时有更新，所以在依赖任何数字之前，请先查核最新资料。

盖印通过内陆税收局（LHDN）的 e-Duti Setem 系统在线办理，并设有盖印期限，一般引述为签约后 30 天，逾期盖印会被罚款。请在 LHDN 官方页面确认期限和罚款标准。谁来付印花税由双方协议，所以请在签约前而不是之后谈妥。

### 超过三年的租约可能需要注册
根据《国家土地法典》，超过三年的租约一般必须在地契上注册，以保障租户的权益，这会增加另一项费用和手续。请向您的律师询问您的租约是否需要注册。

### 检查租金的税务处理
自 2025 年 7 月 1 日起，商业租赁服务须征收服务税，是否须注册取决于房东的营业额，据报小企业适用的税率和门槛此后有所调整。请询问房东所报租金是否含税，并向皇家马来西亚关税局确认最新情况。

## 5. 装修前先办妥各项批准

签了租约并不等于您可以开业。您需要的许多批准，都取决于您已有该场所。

### 营业执照
大多数企业需要就特定场所向地方政府申请执照，有些还需要额外批准，例如食品店须取得卫生或消防许可。我们关于营业执照与许可证的指南说明了运作方式。在确定该地址可以取得执照之前，请不要动工装修。

### 装修与翻修批准
结构改动、隔间、招牌和广告牌，可能需要房东、大厦管理处，有时还有地方政府的批准。装修承包商应该了解当地要求，但查核的责任在您。

### 招牌
招牌通常受地方政府管制，往往需要广告执照，并规定尺寸和位置。订做招牌之前，请先确认什么是允许的。

### 争取免租期
许多房东提供几周至几个月的免租装修期。请尽量争取，并确保长度足够完成批准和装修，这样您就不必为一间无法开业的店铺付租金。

## 6. 聪明地谈判并规划退出

大多数条款比房东的第一份草稿所显示的更有弹性，尤其是单位已空置一段时间，或您愿意承诺更长租期的时候。

### 可以谈判什么
争取免租装修期、加租上限、明确的续约选择权、较少的保证金，以及合理的还原责任。房东若什么都不肯让步，这本身就说明了你们之间的关系。

### 考虑提前终止条款
允许您在一定期限后提前结束租约（须通知，或许附带罚款）的条款，可在生意不如预期时保护您。房东往往抵制，但即使是在第一或第二年后可终止，也很有价值。

### 小心个人担保
小公司的房东常要求董事以个人名义为租约作担保。这意味着公司无力支付时，您自己的资产也会面临风险，所以务必清楚您签的是什么，以及担保多久。

### 清楚怎样才能离开
检查通知期、转让或转租的规定，以及提前离开须支付什么。如果生意失败，转租或转让（如果允许）可能是成本最低的出路。

### 最终草稿请律师审阅
请律师审阅商业租约的费用，与您承诺的租金相比微不足道。如果草稿由房东的律师起草，请记住他们代表的是房东，而不是您。

如果您还在比较地点，或在寻找装修承包商等合作伙伴，[创建免费的企业列表](/zh/signup)可以帮助客户和供应商在您的新地址找到您，您也可以[浏览名录](/zh)寻找本地的律师、承包商和企业顾问。

## 马来西亚中小企业租用场所时常犯的错误

- **在核实批准之前就签约。** 如果租下的场所无法取得您的执照或许可用途，您就得为一间无法开业的店付租金。
- **依赖口头承诺。** 没有写进已签协议的免租期、维修和租金上限，日后很难执行。
- **忘记还原费用。** 租约结束时拆除装修可能花费不菲，所以请从第一天起就谈判这一点并编入预算。

## 从哪里开始

- **本周：**列出您对地点的必备条件——许可用途、面积、停车、客流——以及您能负担的每月总成本上限。
- **接着：**对入围的单位，核实业主身份、许可用途，以及每月数字实际包含什么。
- **然后：**谈判关键条款，请律师审阅最终草稿，并在签约前谈妥谁来付印花税。
- **签约后：**按时缴付印花税，办妥执照和批准，并把续约和通知日期记入日程。

好的租约，是您完全看懂、负担得起，并且在情况变化时能够不致酿成灾难地离开的租约。`,
        faqs: [
          {
            question: "马来西亚的商业租赁协议必须缴付印花税吗？",
            answer:
              "一般需要。租赁协议须缴付印花税，未盖印的协议在法庭上可能难以依赖。盖印通过 LHDN 的 e-Duti Setem 系统在线办理，请在官方页面确认最新的期限和罚款。",
          },
          {
            question: "租约的印花税如何计算？",
            answer:
              "按年租金和租期长短计算。常见的税率是每 RM250（不足也按一档计）年租金约 RM1、RM3、RM5 或 RM7，视租期为一年以内、三年以内、五年以内或更长而定。税率和规定会变动，请向 LHDN 查核最新数字。",
          },
          {
            question: "房东通常要求多少押金？",
            answer:
              "常见做法是约两个月租金的保证金、约半个月至一个月的水电押金，另加预付第一个月租金。这些是惯例而非法律规定，且往往可以谈判，请查看您自己的租赁要约函。",
          },
          {
            question: "商业租户有权续约吗？",
            answer:
              "并非自动享有。马来西亚没有一般性法律赋予商业租户续约权利，所以如果您想要这项选择权，就必须写进协议，包括您必须如何以及在何时之前行使。",
          },
          {
            question: "开始装修之前需要先有营业执照吗？",
            answer:
              "您应该先查清楚。大多数企业需要就特定场所向地方政府申请执照，有些还需要额外批准。在花钱装修之前，请确认该用途和地址可以获发执照。",
          },
          {
            question: "什么是还原条款？",
            answer:
              "它要求您在租约结束时拆除装修，并把场所恢复原状。这可能是一笔不小的开支，所以请仔细阅读、尽量设限，并从一开始就编入预算。",
          },
          {
            question: "我可以提前结束商业租约吗？",
            answer:
              "只能在协议允许的范围内。请查看是否有提前终止条款、通知期，以及是否可以转让或转租。在没有权利的情况下离开，可能要付清剩余的租金，所以请在签约前谈好退出方式。",
          },
          {
            question: "应该请律师审阅商业租约吗？",
            answer:
              "强烈建议。审阅费用与您承诺的租金和义务相比微不足道。如果协议由房东的律师起草，请记住他们代表的是房东，而不是您。",
          },
        ],
      },
      ms: {
        title: "Menyewa Premis Komersial di Malaysia: Perjanjian Penyewaan, Deposit dan Duti Setem",
        excerpt:
          "Menandatangani sewa kedai atau pejabat ialah salah satu komitmen terbesar yang dibuat oleh perniagaan kecil, dan ia biasanya digubal untuk memihak tuan tanah. Panduan ini membincangkan perkara yang perlu disemak sebelum anda menandatangani di Malaysia — terma utama, deposit lazim, duti setem, kelulusan pengubahsuaian dan papan tanda, serta cara berunding atau keluar daripada sewa tanpa tersepit.",
        body: `Bagi kebanyakan perniagaan kecil, sewa ialah kos tetap terbesar selepas gaji, dan perjanjian sewa di sebaliknya boleh mengikat anda selama tiga tahun atau lebih. Berbeza dengan penyewaan kediaman, sewa komersial di Malaysia sebahagian besarnya bergantung pada apa yang ditulis oleh kedua-dua pihak, maka perjanjian yang anda tandatangani jauh lebih penting daripada janji lisan sebelumnya. Pemilik yang tergesa-gesa kerana lokasinya sempurna sering mendapati kos dan sekatan hanya selepas mereka membelanjakan wang untuk ubah suai.

Ini ialah maklumat am, bukan nasihat guaman. Kadar duti setem, layanan cukai dan peraturan pihak berkuasa tempatan berubah, dan ia berbeza mengikut negeri dan hartanah, jadi sahkan kedudukan semasa dengan pihak berkuasa berkaitan atau peguam Malaysia sebelum anda membuat komitmen.

## 1. Semak premis sebelum berunding

Sewa yang baik pada premis yang salah tetap satu perjanjian yang buruk. Sebelum membincangkan sewa, sahkan perkara asas.

### Sahkan siapa yang anda berurusan
Minta bukti bahawa orang yang menawarkan ruang itu benar-benar memilikinya atau diberi kuasa untuk menyewakannya. Anda boleh meminta salinan hak milik dan, untuk jawapan yang lebih pasti, minta peguam membuat carian tanah rasmi. Jika orang itu seorang penyewa yang menawarkan penyewaan semula, semak bahawa sewa mereka sendiri membenarkannya.

### Semak bahawa perniagaan anda dibenarkan di situ
Sesebuah unit mungkin diluluskan untuk kegunaan pejabat tetapi bukan untuk restoran, atau untuk runcit tetapi bukan untuk pembuatan ringan. Semak kegunaan yang dibenarkan dengan pihak berkuasa tempatan (PBT), dan sahkan sama ada bangunan itu mempunyai kelulusan keselamatan kebakaran yang betul serta mencukupi tempat letak kereta, air dan kapasiti elektrik untuk apa yang anda rancang.

### Lawat pada waktu berbeza
Lihat premis pada pagi hari bekerja, petang yang sibuk dan hujung minggu. Aliran pengunjung, bunyi bising, tempat letak kereta, banjir dan perniagaan jiran semuanya kelihatan berbeza apabila dilihat pada waktu anda sebenarnya berniaga.

## 2. Fahami terma utama perjanjian penyewaan komersial

Baca draf perjanjian baris demi baris sebelum anda menyerahkan satu ringgit pun selain deposit tempahan. Inilah klausa yang paling kerap menentukan sama ada sewa itu sesuai untuk anda.

### Sewa dan apa yang termasuk
Nyatakan sewa bulanan, tarikh matang dan kaedah bayaran. Tanya sama ada caj perkhidmatan, dana pembayar hutang, caj penyaman udara, atau cukai taksiran dan cukai tanah termasuk atau dibilkan berasingan, kerana ini boleh menambah kos sebenar dengan ketara.

### Tempoh dan pilihan pembaharuan
Sewa komersial lazimnya berjalan selama tiga tahun, kadangkala dengan pilihan untuk memperbaharui bagi tempoh seterusnya. Malaysia tidak mempunyai undang-undang am yang memberi penyewa komersial hak automatik untuk memperbaharui, jadi jika anda mahu terus kekal, pilihan itu mesti ditulis dalam perjanjian, bersama cara dan tarikh akhir untuk menggunakannya.

### Semakan sewa
Lihat bagaimana sewa berubah sepanjang tempoh dan semasa pembaharuan. Kenaikan tetap, seperti peratusan tertentu pada setiap pembaharuan, boleh diramal. "Sewa akan disemak mengikut budi bicara tuan tanah" tidak boleh, jadi minta had atau formula.

### Kegunaan, pengubahan dan penyerahan hak
Semak bahawa kegunaan yang dibenarkan meliputi perniagaan sebenar anda, sama ada anda boleh memasang papan tanda, dan sama ada anda boleh menyerahkan hak atau menyewakan semula jika anda perlu keluar lebih awal. Tuan tanah sering melarang ketiga-tiganya tanpa persetujuan.

### Pembaikan, insurans dan pemulihan
Perjanjian harus menyatakan siapa membaiki apa. Beri perhatian rapi kepada klausa pemulihan, yang boleh menghendaki anda mencabut ubah suai dan memulihkan premis kepada keadaan asal apabila sewa tamat. Ini boleh menjadi kos yang besar, jadi peruntukkan bajet untuknya sejak awal.

### Keingkaran dan penamatan
Lihat apa yang berlaku jika sewa lewat dan berapa hari anda diberi untuk membetulkan masalah. Banyak perjanjian membenarkan tuan tanah menamatkan dan mengambil semula premis selepas tempoh tunggakan yang singkat, jadi kemerosotan aliran tunai boleh membawa akibat serius.

> Apa sahaja yang dijanjikan oleh tuan tanah atau ejen secara lisan, anggaplah ia tidak wujud melainkan ia terdapat dalam perjanjian yang ditandatangani. Jika tempoh bebas sewa, pengubahsuaian oleh tuan tanah atau had sewa yang dipersetujui penting kepada anda, pastikan ia ditulis dalam perjanjian sewa atau surat sampingan yang ditandatangani.

## 3. Ketahui deposit lazim dan kos pendahuluan

Tuan tanah biasanya meminta lebih daripada sewa bulan pertama di muka, dan strukturnya lazimnya boleh dirundingkan. Jumlah di bawah ialah amalan biasa dan bukan peraturan undang-undang, jadi sahkan butirannya dalam tawaran anda sendiri.

### Deposit tempahan
Surat tawaran atau surat hasrat sering disertakan dengan deposit tempahan untuk menyimpan unit itu. Semak sama ada ia boleh dikembalikan jika perjanjian gagal, dan apa yang surat itu mengikat anda.

### Deposit sekuriti
Ini biasanya bersamaan sekitar dua bulan sewa, dipegang bagi menampung sewa tertunggak atau kerosakan dan boleh dikembalikan pada akhir sewa tertakluk kepada potongan.

### Deposit utiliti dan lain-lain
Deposit tambahan, selalunya sekitar setengah hingga satu bulan sewa, lazim bagi air dan elektrik, dan kadangkala bagi kad akses atau yang seumpamanya. Penyedia utiliti juga mungkin meminta deposit mereka sendiri.

### Sewa pendahuluan
Sewa bulan pertama biasanya dibayar semasa menandatangani. Sesetengah tuan tanah meminta lebih, dan ia berbaloi dirundingkan, terutamanya jika anda syarikat permulaan dengan wang tunai terhad.

### Tanya bagaimana deposit dikembalikan
Pastikan perjanjian menyatakan bila dan bagaimana deposit dikembalikan selepas anda berpindah, dan dalam keadaan apa tuan tanah boleh membuat potongan. Pertikaian tentang deposit antara yang paling kerap berlaku antara penyewa dan tuan tanah.

## 4. Duti setem ke atas perjanjian

Perjanjian penyewaan amnya perlu disetem, dan perjanjian yang tidak disetem boleh sukar dijadikan bukti di mahkamah. Duti dikenakan ke atas sewa tahunan dan bergantung pada tempoh sewa. Kadar yang lazim disebut ialah, bagi setiap RM250 atau sebahagiannya daripada sewa tahunan, kira-kira RM1 bagi tempoh sehingga satu tahun, RM3 bagi lebih satu hingga tiga tahun, RM5 bagi lebih tiga hingga lima tahun, dan RM7 bagi tempoh melebihi lima tahun. Kadar, pengecualian dan kaedah pengiraan telah dikemas kini dari semasa ke semasa, jadi semak angka semasa sebelum bergantung pada mana-mana daripadanya.

Penyetamannya dibuat dalam talian melalui sistem e-Duti Setem Lembaga Hasil Dalam Negeri (LHDN), dan terdapat tarikh akhir penyetaman yang lazim disebut 30 hari dari tarikh menandatangani, dengan penalti bagi penyetaman lewat. Sahkan tarikh akhir dan kadar penalti di laman rasmi LHDN. Siapa yang membayar duti adalah perkara persetujuan, jadi selesaikan sebelum anda menandatangani dan bukan selepasnya.

### Sewa melebihi tiga tahun mungkin perlu didaftarkan
Di bawah Kanun Tanah Negara, sewa melebihi tiga tahun amnya perlu didaftarkan pada hak milik tanah untuk melindungi kepentingan penyewa, yang menambah kos dan proses berasingan. Tanya peguam anda sama ada sewa anda memerlukannya.

### Semak layanan cukai ke atas sewa
Cukai perkhidmatan telah dikenakan ke atas perkhidmatan sewaan dan pajakan komersial sejak 1 Julai 2025, dengan pendaftaran bergantung pada perolehan tuan tanah, dan kadar serta ambang bagi perniagaan kecil dilaporkan telah berubah sejak itu. Tanya tuan tanah sama ada sewa yang disebut termasuk apa-apa cukai, dan sahkan kedudukan semasa dengan Jabatan Kastam Diraja Malaysia.

## 5. Selesaikan kelulusan sebelum ubah suai

Menandatangani sewa tidak memberi anda hak untuk membuka. Banyak kelulusan yang anda perlukan bergantung pada anda sudah memiliki premis tersebut.

### Lesen perniagaan
Kebanyakan perniagaan memerlukan lesen daripada pihak berkuasa tempatan untuk premis tertentu, dan sesetengahnya memerlukan kelulusan tambahan, seperti kelulusan kesihatan atau bomba bagi kedai makanan. Panduan kami tentang lesen dan permit perniagaan menerangkan bagaimana ia berfungsi. Jangan mengubah suai sebelum anda tahu lesen boleh diperoleh di alamat itu.

### Kelulusan ubah suai dan pemasangan
Perubahan struktur, sekatan, papan tanda dan papan iklan mungkin memerlukan kelulusan tuan tanah, pengurusan bangunan, dan kadangkala pihak berkuasa tempatan. Kontraktor ubah suai seharusnya tahu keperluan tempatan, tetapi tanggungjawab menyemak adalah di bahu anda.

### Papan tanda
Papan tanda biasanya dikawal oleh pihak berkuasa tempatan, yang sering memerlukan lesen iklan dan menetapkan peraturan saiz dan kedudukan. Sahkan apa yang dibenarkan sebelum anda menempah papan tanda.

### Rancang tempoh bebas sewa
Banyak tuan tanah menawarkan tempoh ubah suai bebas sewa selama beberapa minggu hingga beberapa bulan. Cuba rundingkan satu, dan pastikan ia cukup panjang untuk kelulusan dan ubah suai, supaya anda tidak membayar sewa bagi kedai yang tidak boleh dibuka.

## 6. Berunding dengan bijak dan rancang jalan keluar

Kebanyakan terma lebih fleksibel daripada yang ditunjukkan oleh draf pertama tuan tanah, terutamanya jika unit itu telah kosong beberapa ketika atau anda menawarkan komitmen yang lebih panjang.

### Apa yang perlu dirundingkan
Sasarkan tempoh ubah suai bebas sewa, had kenaikan, pilihan pembaharuan yang jelas, deposit sekuriti yang lebih kecil, dan obligasi pemulihan yang munasabah. Tuan tanah yang tidak mahu berganjak dalam apa-apa pun sedang memberitahu anda sesuatu tentang hubungan itu.

### Pertimbangkan klausa penamatan awal
Klausa yang membolehkan anda menamatkan sewa lebih awal selepas tempoh tertentu, dengan notis dan mungkin penalti, melindungi anda jika perniagaan tidak berkembang. Tuan tanah sering menentangnya, tetapi walaupun hak penamatan selepas tahun pertama atau kedua amat bernilai.

### Berhati-hati dengan jaminan peribadi
Tuan tanah kepada syarikat kecil sering meminta pengarah menjamin sewa secara peribadi. Ini bermakna aset anda sendiri berisiko jika syarikat tidak mampu membayar, jadi fahami dengan tepat apa yang anda tandatangani dan untuk berapa lama.

### Ketahui bagaimana anda boleh keluar
Semak tempoh notis, peraturan tentang penyerahan hak atau penyewaan semula, dan apa yang anda terhutang jika keluar lebih awal. Jika perniagaan gagal, penyewaan semula atau penyerahan hak, jika dibenarkan, mungkin cara keluar yang paling murah.

### Gunakan peguam untuk draf akhir
Yuran peguam untuk menyemak sewa komersial adalah kecil berbanding sewa yang anda komitkan. Jika peguam tuan tanah menyediakan draf, ingat bahawa mereka bertindak untuk tuan tanah, bukan untuk anda.

Jika anda masih membandingkan lokasi atau mencari rakan niaga seperti kontraktor ubah suai, [membuat penyenaraian perniagaan percuma](/ms/signup) membantu pelanggan dan pembekal menemui anda di alamat baharu, dan anda boleh [menyemak imbas direktori](/ms) untuk peguam, kontraktor dan perunding perniagaan tempatan.

## Kesilapan lazim PKS Malaysia semasa menyewa premis

- **Menandatangani sebelum menyemak kelulusan.** Sewa pada premis yang tidak boleh mendapat lesen atau kegunaan yang dibenarkan anda meninggalkan anda membayar sewa bagi perniagaan yang tidak boleh dibuka.
- **Bergantung pada janji lisan.** Tempoh bebas sewa, pembaikan dan had sewa yang tiada dalam perjanjian bertandatangan sangat sukar dikuatkuasakan kemudian.
- **Melupakan bil pemulihan.** Mencabut ubah suai pada akhir sewa boleh memakan kos sebenar, jadi rundingkannya dan peruntukkan bajet sejak hari pertama.

## Di mana hendak bermula

- **Minggu ini:** Senaraikan keperluan mesti ada untuk lokasi — kegunaan dibenarkan, saiz, tempat letak kereta, aliran pengunjung — dan kos bulanan keseluruhan maksimum yang mampu anda tanggung.
- **Seterusnya:** Bagi mana-mana unit yang disenarai pendek, semak pemilikan, kegunaan yang dibenarkan, dan apa yang sebenarnya termasuk dalam angka bulanan.
- **Kemudian:** Rundingkan terma utama, minta peguam menyemak draf akhir, dan selesaikan siapa yang membayar duti setem sebelum menandatangani.
- **Selepas menandatangani:** Setem perjanjian tepat pada masanya, dapatkan lesen dan kelulusan anda, dan catat tarikh pembaharuan dan notis dalam diari.

Sewa yang baik ialah sewa yang anda fahami sepenuhnya, mampu dibayar dengan selesa, dan boleh ditinggalkan tanpa bencana jika keadaan berubah.`,
        faqs: [
          {
            question: "Adakah perjanjian penyewaan komersial di Malaysia perlu disetem?",
            answer:
              "Amnya ya. Perjanjian penyewaan tertakluk kepada duti setem, dan perjanjian yang tidak disetem boleh sukar dijadikan bukti di mahkamah. Penyetaman dibuat dalam talian melalui sistem e-Duti Setem LHDN, jadi sahkan tarikh akhir dan penalti semasa di laman rasmi.",
          },
          {
            question: "Bagaimanakah duti setem ke atas sewa dikira?",
            answer:
              "Ia berdasarkan sewa tahunan dan tempoh sewa. Kadar yang lazim disebut ialah kira-kira RM1, RM3, RM5 atau RM7 bagi setiap RM250 (atau sebahagiannya) sewa tahunan, bergantung pada sama ada tempohnya sehingga satu tahun, tiga tahun, lima tahun atau lebih lama. Kadar dan peraturan berubah, jadi semak angka semasa dengan LHDN.",
          },
          {
            question: "Berapakah deposit yang biasanya diminta oleh tuan tanah?",
            answer:
              "Amalan lazim ialah deposit sekuriti sekitar dua bulan sewa, deposit utiliti sekitar setengah hingga satu bulan, serta sewa bulan pertama di muka. Ini ialah adat dan bukan peraturan undang-undang, dan ia sering boleh dirundingkan, jadi semak surat tawaran anda sendiri.",
          },
          {
            question: "Adakah penyewa komersial mempunyai hak untuk memperbaharui sewa?",
            answer:
              "Tidak secara automatik. Malaysia tidak mempunyai undang-undang am yang memberi penyewa komersial hak pembaharuan, jadi jika anda mahukan pilihan itu, ia perlu ditulis dalam perjanjian, termasuk bagaimana dan bila anda mesti menggunakannya.",
          },
          {
            question: "Adakah saya perlu lesen perniagaan sebelum mula mengubah suai?",
            answer:
              "Anda patut menyemaknya dahulu. Kebanyakan perniagaan memerlukan lesen daripada pihak berkuasa tempatan untuk premis tertentu, dan sesetengahnya memerlukan kelulusan tambahan. Sahkan bahawa kegunaan dan alamat itu boleh dilesenkan sebelum anda membelanjakan wang untuk ubah suai.",
          },
          {
            question: "Apakah klausa pemulihan?",
            answer:
              "Ia menghendaki anda mencabut ubah suai dan memulangkan premis kepada keadaan asal apabila sewa tamat. Ini boleh menjadi kos yang besar, jadi bacanya dengan teliti, cuba hadkannya, dan peruntukkan bajet untuknya sejak awal.",
          },
          {
            question: "Bolehkah saya keluar daripada sewa komersial lebih awal?",
            answer:
              "Hanya setakat yang dibenarkan oleh perjanjian. Semak klausa penamatan awal, tempoh notis dan sama ada anda boleh menyerahkan hak atau menyewakan semula. Keluar tanpa hak berbuat demikian boleh menyebabkan anda terhutang baki sewa, jadi rundingkan pilihan keluar sebelum menandatangani.",
          },
          {
            question: "Patutkah saya meminta peguam menyemak sewa komersial?",
            answer:
              "Ia amat disyorkan. Kos semakan adalah kecil berbanding sewa dan obligasi yang anda komitkan. Jika peguam tuan tanah menggubal perjanjian itu, ingat bahawa mereka bertindak untuk tuan tanah dan bukan untuk anda.",
          },
        ],
      },
    },
  },
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
  {
    slug: "e-invoicing-in-malaysia-lhdn-mandate",
    title: "Malaysia's e-Invoicing Mandate: What LHDN's e-Invois Rollout Means for Your Business",
    seoTitle: "Malaysia e-Invoicing: LHDN's e-Invois Mandate Explained",
    seoDescription:
      "What LHDN's e-Invoicing mandate actually requires, how to find your phase by turnover, and the practical steps to get your business ready for MyInvois.",
    coverImage: {
      file: "e-invoicing-in-malaysia-lhdn-mandate-cover.webp",
      mimeType: "image/webp",
      alt: "A confident small business owner reviewing a digital invoice on a tablet",
      altTranslations: {
        zh: "一位自信的小企业主用平板电脑查看电子发票",
        ms: "Seorang pemilik perniagaan kecil yang yakin menyemak invois digital pada tablet",
      },
    },
    contentImages: {
      "customer-data": {
        file: "e-invoicing-in-malaysia-lhdn-mandate-customer-data.webp",
        mimeType: "image/webp",
        alt: "A business owner typing customer details into a laptop",
        altTranslations: {
          zh: "一位企业主在笔记本电脑上输入客户资料",
          ms: "Seorang pemilik perniagaan menaip butiran pelanggan ke dalam komputer riba",
        },
        after: "Starting this well before your phase's go-live date, rather than scrambling once it's in force, is the single highest-leverage thing a business in an upcoming phase can do today.",
        afterTranslations: {
          zh: "在您所属阶段正式生效之前尽早开始这项工作,而不是等规定生效后才临时应付,是目前处于即将到来阶段的企业,今天能做的投入产出比最高的一件事。",
          ms: "Memulakan ini jauh sebelum tarikh mula fasa anda, berbanding bertergesa-gesa sebaik sahaja ia berkuat kuasa, adalah satu perkara paling berbaloi yang boleh dilakukan hari ini oleh perniagaan dalam fasa yang akan datang.",
        },
      },
    },
    excerpt:
      "e-Invoicing is a phased, turnover-based mandate from LHDN requiring every applicable sale to be validated through MyInvois before it counts as a proper tax invoice — entirely separate from SST. This guide covers how to find your phase, what you need to issue a compliant e-Invoice, and how to get your business ready before your own go-live date.",
    body: `E-Invoicing is the biggest change to how Malaysian businesses document a sale in years, and unlike SST or EPF, it isn't a new tax or contribution — it's a new, LHDN-validated format every invoice eventually has to be issued in. That distinction matters, because it means e-Invoicing applies to far more businesses than SST ever will, on a phased timeline tied to your turnover rather than to what you sell. This guide covers what e-Invoicing actually requires, how to work out when your business is in scope, and the practical steps to get ready before your own phase arrives.

## 1. Understand what e-Invoicing actually is

An e-Invoice isn't just a PDF invoice emailed to a customer — it's a structured data document (following a format LHDN specifies) that gets validated by LHDN in near-real-time through the MyInvois system before it counts as a legitimate tax invoice. Once validated, LHDN returns a unique identifier and a QR code that goes on the invoice you actually hand to your customer.

This is a genuinely different requirement from SST:

- **SST** is a tax you collect and remit on specific taxable goods or services, only if you're registered.
- **e-Invoicing** is a documentation and reporting requirement for the transaction itself — covering goods, services, and, eventually, most other business transactions — regardless of whether SST applies to you at all.

A business that's never touched SST because it falls under every threshold can still be squarely in scope for e-Invoicing, because the two run on entirely separate rules.

## 2. Know your phase — the mandate isn't "on" for everyone at once

LHDN rolled e-Invoicing out in phases, by annual turnover, rather than switching it on for every business simultaneously — and the phase thresholds and dates have already been revised more than once since the mandate was first announced. The broad shape, as most recently published, phases in from businesses with the highest turnover down to progressively smaller ones over roughly the following couple of years, with each phase preceded by an "interim relaxation period" that softens enforcement right after that phase's go-live date.

> Don't calculate your own phase from a number you remember reading — LHDN has revised both the phase dates and the exemption threshold since the mandate was announced, most recently moving the bottom exemption threshold itself. Check the current phase table on LHDN's own MyInvois portal or a recent official LHDN notice before you plan around a specific date.

### What determines your phase
Your phase is generally based on your business's annual turnover from a specified past financial year, not your current or projected turnover — which means a business that's grown significantly since that reference year could already be in an earlier phase than its current size would suggest, or vice versa for one that's shrunk. Confirm which financial year LHDN is using as the reference point for your business's turnover banding, since this detail is easy to get wrong from memory and directly determines your actual deadline.

### If your turnover sits below the smallest-business exemption threshold
A threshold exists below which a business isn't mandated to implement e-Invoicing at all yet — though this threshold itself has moved since the mandate was introduced, so confirm the current figure rather than one you've seen quoted. Businesses below it can still adopt e-Invoicing voluntarily, which is worth considering if a lot of your customers are already-mandated businesses that would prefer receiving a validated e-Invoice from their suppliers.

## 3. What you actually need to issue a compliant e-Invoice

A handful of pieces need to be in place before your business can issue its first validated e-Invoice:

- **A Tax Identification Number (TIN)** registered with LHDN — the anchor identifier every e-Invoice is tied to, for both you and the buyer.
- **Complete, accurate buyer information** — the buyer's own TIN (for a B2B transaction), registration details, and address, all of which now need to be captured and verified at the point of sale rather than cleaned up later.
- **A way to generate the required data fields** — LHDN's e-Invoice format specifies mandatory fields (item descriptions, tax category, classification codes, and more) well beyond what a simple invoice template usually includes.
- **A submission method** — covered next — that can actually reach LHDN's MyInvois system to get each invoice validated.

### Start with your customer master data now
The single most time-consuming part of getting ready is usually not the technical submission piece — it's going back through your existing customer list to collect TINs and registration details you were never previously required to hold. Starting this well before your phase's go-live date, rather than scrambling once it's in force, is the single highest-leverage thing a business in an upcoming phase can do today.

A simple way to start: add a TIN and registration-number field to whatever form or process you already use to onboard a new B2B customer, so new accounts stop adding to the backlog while you work through existing ones. For a long-standing customer relationship, a short email or call asking for their TIN ahead of your go-live date is usually enough — most businesses that are themselves already in an earlier phase are used to being asked by now.

## 4. Choose how you'll actually submit e-Invoices

LHDN offers more than one way to get an invoice validated, and the right one depends mostly on your transaction volume:

### The MyInvois portal
A free, web-based portal where you manually enter invoice details and submit them one at a time (or via a bulk upload for a batch). This works fine for a low-volume business, but becomes genuinely painful once you're issuing more than a handful of invoices a day.

### API integration
Larger businesses, or anyone issuing invoices in volume, typically connect their existing accounting or point-of-sale system directly to MyInvois via API, so validation happens automatically as part of the normal sales process rather than as a separate manual step.

### A certified service provider (PEPPOL / middleware)
A growing number of accounting software vendors and dedicated e-Invoicing middleware providers now offer built-in MyInvois submission, often the easiest route for an SME that doesn't want to build its own API integration — worth checking whether whatever accounting software you already use has added this as a feature before paying for something new.

## 5. What changes in your day-to-day once you're in scope

Once your phase takes effect, every applicable sale needs validation before (or shortly after, during any relaxation period) it's considered a proper tax invoice — which changes a few habits that may currently be informal:

- **Capturing buyer details at the point of sale**, not after the fact, since missing or wrong buyer data is the most common reason an e-Invoice submission gets rejected or delayed.
- **Issuing a credit note or debit note as its own validated e-Invoice**, rather than an ad-hoc adjustment, for any refund, discount, or correction after the original sale.
- **Keeping validated e-Invoices (and their LHDN-issued unique identifiers) as your actual tax records**, since these — not whatever your own system generates independently — are what LHDN now treats as authoritative.

This also changes what a customer expects from you. A business that's itself already mandated will often ask for your TIN before you've even finished a sale, since they need it to submit their own validated e-Invoice — getting used to supplying it promptly, rather than treating it as an unusual request, is worth doing before it becomes routine on both sides.

Getting this operational shift right matters for more than compliance — a business that's organized and easy to reach tends to also be easier for customers to find and trust, which is exactly what [a free, verified listing here](/en/signup) helps with alongside everything else you're tightening up. It's worth [seeing how other Malaysian businesses present themselves](/en) once their records and public details are in order.

## 6. Use the relaxation period — don't wait for the deadline to actually arrive

Each phase's go-live date typically comes with an interim relaxation period immediately after it, during which LHDN eases strict enforcement (for example, allowing a consolidated e-Invoice covering multiple transactions, rather than demanding full validation of every single one from day one) while businesses adjust. Treat that window as working time to fix real problems — bad customer data, a submission method that doesn't yet work reliably — not as extra time to delay starting. A business that begins testing early in its relaxation period usually finds and fixes its process issues before enforcement tightens; one that waits until the relaxation period is ending is doing first-time troubleshooting under real deadline pressure.

## Common mistakes businesses make with e-Invoicing

- **Confusing e-Invoicing's turnover-based phases with SST's registration thresholds.** They're entirely separate systems with separate rules — being below the SST threshold says nothing about whether you're already in an e-Invoicing phase.
- **Leaving customer TIN and registration data collection until the go-live date.** This is consistently the slowest part of getting ready, and it can't be rushed the week before enforcement starts.
- **Treating the relaxation period as extra time before anything needs to happen.** It's meant for fixing problems you've already found through real testing, not for delaying the first attempt at a validated e-Invoice.

## Where to start this week

- **This week:** Check LHDN's current MyInvois phase table against your business's annual turnover from the correct reference financial year, so you know your actual go-live date rather than a remembered one.
- **If your phase is approaching:** Start pulling together TINs and registration details for your regular customers now, and decide whether the MyInvois portal, an API integration, or a service provider fits your invoice volume.
- **Once you have a submission method:** Run a handful of real invoices through it during any relaxation period, specifically to surface data or process problems while enforcement is still soft.
- **If you're currently below the exemption threshold:** Note the date in your calendar to re-check your turnover banding periodically, since crossing it moves you into scope on LHDN's schedule, not on your own.

E-Invoicing isn't optional once your phase arrives, and the businesses that struggle with it are almost always the ones that treated the go-live date as the start of preparation instead of the end of it.`,
    faqs: [
      {
        question: "Is e-Invoicing a new tax, like SST?",
        answer:
          "No. e-Invoicing is a documentation and validation requirement for how an invoice is issued and recorded, not a tax itself. It applies based on your turnover phase, entirely independent of whether you're registered for or liable to pay SST.",
      },
      {
        question: "When does e-Invoicing become mandatory for my business?",
        answer:
          "It depends on your annual turnover from a specific reference financial year LHDN uses for phase banding, and the phase dates and exemption threshold have both been revised since the mandate was first announced. Check LHDN's current MyInvois phase table directly rather than relying on a date you've seen quoted elsewhere.",
      },
      {
        question: "What's the difference between the MyInvois portal, API integration, and a service provider?",
        answer:
          "The MyInvois portal is a free, manual, web-based way to submit invoices one at a time or in a batch, suited to low volume. API integration connects your existing accounting or POS system directly to MyInvois for automatic validation, while a certified service provider or accounting software add-on offers built-in submission without building your own integration — the right choice depends mainly on how many invoices you issue.",
      },
      {
        question: "What information do I need from a customer to issue them an e-Invoice?",
        answer:
          "For a B2B transaction, you generally need the buyer's own Tax Identification Number (TIN), registration details, and address, captured accurately at the point of sale. Missing or incorrect buyer information is the most common reason an e-Invoice submission gets rejected or delayed.",
      },
      {
        question: "What is the relaxation period, and what should I do during it?",
        answer:
          "Each phase's go-live date is typically followed by an interim relaxation period where enforcement is softer — for example, allowing a consolidated e-Invoice covering multiple transactions rather than demanding full validation from day one. Use it to test your submission process and fix real problems, not as extra time before starting.",
      },
      {
        question: "My business is below the exemption threshold — do I need to do anything yet?",
        answer:
          "Not immediately, though the exemption threshold itself has changed since the mandate was introduced, so confirm the current figure applies to you rather than one you've seen elsewhere. You can still adopt e-Invoicing voluntarily, which is worth considering if many of your customers are already mandated.",
      },
      {
        question: "What changes about how I handle refunds or corrections once I'm in scope?",
        answer:
          "A refund, discount, or correction after the original sale needs to be issued as its own validated e-Invoice (a credit note or debit note), rather than an informal adjustment to the original invoice. This is one of the more common habits businesses have to formalize once their phase takes effect.",
      },
      {
        question: "What's the single most time-consuming part of getting ready for e-Invoicing?",
        answer:
          "Usually not the technical submission setup — it's going back through your existing customer list to collect Tax Identification Numbers and registration details you were never previously required to hold. Starting this well before your phase's go-live date is the highest-leverage thing to do early.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚电子发票规定:LHDN e-Invois 推行对您企业的意义",
        excerpt:
          "电子发票是 LHDN 按营业额分阶段推行的强制规定,要求每一笔适用的销售都需先经 MyInvois 验证,才能算作正式的税务发票——这与 SST 完全是两回事。本指南说明如何判断自己所属的阶段、开出合规电子发票需要准备什么,以及如何在自己的生效日期到来之前做好准备。",
        body: `电子发票(e-Invoicing)是多年来马来西亚企业记录销售方式最大的一次变革,而且与 SST 或 EPF 不同,它并不是新的税种或供款——而是每一张发票最终都必须采用的、经 LHDN 验证的新格式。这个区别很重要,因为这意味着电子发票适用的企业范围,远比 SST 所能覆盖的要广得多,而且其分阶段推行的时间表是按营业额而不是按您销售的商品类型来划分的。本指南将说明电子发票实际要求什么、如何判断您的企业何时被纳入范围,以及在您所属阶段到来之前需要做好哪些实际准备。

## 1. 了解电子发票到底是什么

电子发票不只是用电子邮件发给客户的 PDF 发票——它是一份结构化的数据文件(遵循 LHDN 指定的格式),需要通过 MyInvois 系统由 LHDN 近乎实时地验证,之后才算作合法的税务发票。一旦验证通过,LHDN 会返回一个唯一识别码和一个二维码,这些会印在您实际交给客户的发票上。

这与 SST 是两项截然不同的要求:

- **SST** 是您对特定应税货物或服务所征收并汇缴的税款,前提是您已经注册。
- **电子发票** 则是针对交易本身的文件记录与申报要求——涵盖货物、服务,以及最终大多数其他商业交易——无论您是否需要缴纳 SST,都可能适用。

一家从未接触过 SST、因为各项门槛都未达到的企业,仍然完全可能属于电子发票的适用范围,因为这两套制度各自遵循完全独立的规则。

## 2. 了解您所属的阶段——这项规定并非对所有企业同时生效

LHDN 是按年度营业额分阶段推行电子发票的,而不是让所有企业同时启用——而且自该规定首次公布以来,各阶段的门槛和日期已经调整过不止一次。按照最新公布的大致框架,推行顺序是从营业额最高的企业开始,逐步覆盖到规模较小的企业,大约在接下来的一两年内完成,而每个阶段正式生效后,都会先有一段"过渡宽限期",在此期间执法会相对宽松。

> 不要凭记忆中的数字去推算自己所属的阶段——自该规定公布以来,LHDN 已经调整过阶段日期和豁免门槛,最近一次调整的正是最低豁免门槛本身。在按某个具体日期做规划之前,请到 LHDN 官方的 MyInvois 平台或最近的官方通告上核实当前的阶段表。

### 您所属阶段由什么决定
您所属的阶段通常是根据您企业在某个指定的过去财政年度的年度营业额来判断的,而不是根据您当前或预计的营业额——这意味着,一家自该参考年度以来大幅增长的企业,可能已经落在比其当前规模所显示的更早的阶段;反之,一家规模已缩小的企业也可能是这种情况。请确认 LHDN 用来划分您企业营业额档次的具体财政年度,因为这个细节很容易凭记忆出错,却直接决定了您实际的截止日期。

### 如果您的营业额低于最小型企业的豁免门槛
目前存在一个门槛,低于该门槛的企业暂时无需强制实施电子发票——不过这个门槛本身自规定推出以来已经调整过,所以请核实当前的具体数字,而不要沿用您曾经看到的旧数字。低于该门槛的企业仍然可以自愿采用电子发票,如果您的许多客户本身已经被强制纳入,并且更希望从供应商那里收到经过验证的电子发票,这一点就值得考虑。

## 3. 开出合规电子发票,您实际需要准备什么

在您的企业能够开出第一张通过验证的电子发票之前,有几项准备工作需要到位:

- **在 LHDN 注册的纳税人识别号(TIN)**——这是每一张电子发票所关联的核心识别信息,买卖双方都需要。
- **完整准确的买方信息**——买方自己的 TIN(适用于 B2B 交易)、注册资料和地址,这些信息现在都需要在销售当下就采集并核实,而不是事后再去补齐。
- **生成所需数据字段的方式**——LHDN 的电子发票格式规定了一系列强制字段(产品描述、税务类别、分类代码等),远超一般简单发票模板所包含的内容。
- **提交方式**——下文将详细说明——能够真正连接到 LHDN 的 MyInvois 系统,让每张发票完成验证。

### 现在就着手整理您的客户主数据
准备工作中最耗时的部分,通常并不是技术性的提交环节——而是要回头梳理您现有的客户名单,收集此前从未被要求持有的 TIN 和注册资料。在您所属阶段正式生效之前尽早开始这项工作,而不是等规定生效后才临时应付,是目前处于即将到来阶段的企业,今天能做的投入产出比最高的一件事。

一个简单的入手方式是:在您现有的 B2B 客户开户流程或表格中加入 TIN 和注册号码栏位,这样新开的客户账户就不会继续增加积压,同时您可以专心处理现有客户的数据。对于长期合作的客户,在生效日期之前发一封简短的邮件或打个电话询问其 TIN,通常就足够了——许多本身已经处于更早阶段的企业,如今对这类询问已经相当习惯。

## 4. 选择您实际提交电子发票的方式

LHDN 提供不止一种方式来完成发票验证,具体选择哪一种,主要取决于您的交易量:

### MyInvois 平台
这是一个免费的网页平台,您可以手动逐笔录入发票信息并提交(也可以批量上传一批发票)。对于交易量较低的企业来说完全够用,但一旦您每天开出的发票超过几张,就会变得相当繁琐。

### API 集成
规模较大的企业,或任何交易量较大的企业,通常会将自己现有的会计或销售点(POS)系统通过 API 直接对接 MyInvois,这样验证就会作为正常销售流程的一部分自动完成,而不再是一个额外的手动步骤。

### 认证服务提供商(PEPPOL/中间件)
越来越多的会计软件供应商和专门的电子发票中间件服务商,现在都内置了 MyInvois 提交功能,对于不想自行搭建 API 集成的中小企业来说,这往往是最省事的途径——在为新系统付费之前,值得先查一下您目前使用的会计软件是否已经加入了这项功能。

## 5. 一旦被纳入范围,您的日常运作会有哪些变化

一旦您所属的阶段生效,每一笔适用的销售都需要先完成验证(或在任何宽限期内尽快补验),才能被视为正式的税务发票——这会改变一些目前可能还比较随意的习惯:

- **在销售当下就采集买方信息**,而不是事后补充,因为买方信息缺失或错误,是电子发票提交被拒或延迟最常见的原因。
- **将任何退款、折扣或销售后更正,作为一张独立的经过验证的电子贷项/借项通知单来开具**,而不是临时性的调整。
- **把经过验证的电子发票(以及 LHDN 签发的唯一识别码)当作您真正的税务记录来保存**,因为 LHDN 现在把这些——而不是您自己系统独立生成的任何记录——视为权威依据。

把这个运营层面的转变处理好,意义不仅限于合规本身——一家组织有序、容易联系到的企业,通常也更容易被客户找到并信任,而这正是[在这里建立一份免费、经过核实的列表](/zh/signup)能够配合您其他方面整理工作的地方。也值得[看看其他马来西亚企业在把记录和公开资料整理妥当之后,是如何展示自己的](/zh)。

## 6. 善用宽限期——不要等到截止日期真正到来才行动

每个阶段的生效日期之后,通常都会紧跟一段过渡宽限期,在此期间 LHDN 会放宽严格执法(例如允许用一张汇总电子发票涵盖多笔交易,而不是从第一天起就要求每一笔都单独完成验证),让企业有时间适应。请把这段时间当作解决实际问题的工作期——比如不完整的客户数据、尚未稳定运作的提交方式——而不是可以拖延开始的额外时间。在宽限期一开始就动手测试的企业,通常能在执法收紧之前就发现并解决流程问题;而等到宽限期快结束才动手的企业,则是在真正的截止日期压力下,第一次排查问题。

## 企业在电子发票上最常犯的错误

- **把电子发票按营业额划分的阶段,和 SST 的注册门槛混为一谈。** 这是两套完全独立的制度,各有各的规则——未达到 SST 门槛,并不代表您还没有被纳入电子发票的某个阶段。
- **把收集客户 TIN 和注册资料的工作,一直拖到生效日期才开始。** 这一直是整个准备过程中最耗时的部分,而且不可能在执法开始前的那一周临时赶工完成。
- **把宽限期当作"还不用做任何事"的额外时间。** 它的本意是让您修正已经通过实际测试发现的问题,而不是用来推迟第一次尝试开出经过验证的电子发票。

## 本周可以从这里开始

- **本周:** 对照 LHDN 当前公布的 MyInvois 阶段表,核实您企业在正确参考财政年度的年度营业额,这样您就能知道自己真正的生效日期,而不是凭记忆推算的日期。
- **如果您的阶段即将到来:** 现在就开始为您的常规客户收集 TIN 和注册资料,并根据您的发票量,决定是使用 MyInvois 平台、API 集成,还是服务提供商。
- **一旦确定了提交方式:** 在宽限期内,用一些真实发票实际测试一遍,专门用来在执法仍然宽松的阶段,提前发现数据或流程上的问题。
- **如果您目前低于豁免门槛:** 在日历上标注一个提醒,定期重新核查自己的营业额档次,因为一旦越过门槛,被纳入范围的时间是由 LHDN 的时间表决定的,而不是由您自己决定的。

电子发票一旦进入您所属的阶段,就不再是可选项,而那些真正在其中吃力的企业,几乎都是把生效日期当作"开始准备"而不是"准备结束"的那一类。`,
        faqs: [
      {
        question: "电子发票是像 SST 那样的新税种吗?",
        answer:
          "不是。电子发票是关于发票如何开具和记录的文件与验证要求,本身并不是一种税。它根据您所属的营业额阶段来适用,与您是否已注册或需要缴纳 SST 完全无关。",
      },
      {
        question: "我的企业什么时候会被强制要求实施电子发票?",
        answer:
          "这取决于您在 LHDN 用来划分阶段的某个特定参考财政年度的年度营业额,而阶段日期和豁免门槛,自该规定首次公布以来都已经调整过。请直接查核 LHDN 当前公布的 MyInvois 阶段表,而不要依赖您在其他地方看到的日期。",
      },
      {
        question: "MyInvois 平台、API 集成和服务提供商之间有什么区别?",
        answer:
          "MyInvois 平台是一个免费、手动、基于网页的提交方式,可以逐笔或批量提交发票,适合交易量较低的情况。API 集成会把您现有的会计或 POS 系统直接连接到 MyInvois,实现自动验证;而经认证的服务提供商或会计软件附加功能,则提供内置的提交服务,无需自行搭建集成——具体选择主要取决于您开出发票的数量。",
      },
      {
        question: "我需要从客户那里获取哪些信息才能为他们开出电子发票?",
        answer:
          "对于 B2B 交易,一般需要买方自己的纳税人识别号(TIN)、注册资料和地址,并且需要在销售当下就准确采集。买方信息缺失或错误,是电子发票提交被拒或延迟最常见的原因。",
      },
      {
        question: "宽限期是什么?在此期间我应该做什么?",
        answer:
          "每个阶段的生效日期之后,通常会紧跟一段过渡宽限期,在此期间执法相对宽松——例如允许用一张汇总电子发票涵盖多笔交易,而不是从第一天起就要求每一笔都完成验证。应利用这段时间测试您的提交流程并解决实际问题,而不是把它当作可以拖延开始的额外时间。",
      },
      {
        question: "我的企业营业额低于豁免门槛——现在需要做些什么吗?",
        answer:
          "暂时不需要立即行动,不过自该规定推出以来,豁免门槛本身已经调整过,所以请核实当前适用于您的具体数字,而不要沿用您在别处看到的旧数字。您仍然可以自愿采用电子发票,如果您的许多客户本身已经被强制纳入,这一点就值得考虑。",
      },
      {
        question: "一旦被纳入范围,处理退款或更正的方式会有什么变化?",
        answer:
          "原始销售之后发生的退款、折扣或更正,都需要作为一张独立的、经过验证的电子发票(贷项通知单或借项通知单)来开具,而不是对原始发票做非正式的调整。这是企业一旦所属阶段生效后,最常需要规范化处理的习惯之一。",
      },
      {
        question: "为电子发票做准备,最耗时的部分是什么?",
        answer:
          "通常不是技术性的提交设置——而是要回头梳理您现有的客户名单,收集此前从未被要求持有的纳税人识别号和注册资料。在您所属阶段的生效日期之前尽早开始这项工作,是现在就能做的投入产出比最高的一件事。",
      },
        ],
      },
      ms: {
        title: "Mandat e-Invois Malaysia: Apa Maksud Pelancaran e-Invois LHDN untuk Perniagaan Anda",
        excerpt:
          "e-Invois adalah mandat berfasa berdasarkan hasil jualan daripada LHDN yang memerlukan setiap jualan berkenaan disahkan melalui MyInvois sebelum ia dikira sebagai invois cukai yang sah — sama sekali berasingan daripada SST. Panduan ini merangkumi cara menentukan fasa anda, apa yang diperlukan untuk mengeluarkan e-Invois yang patuh, dan cara menyediakan perniagaan anda sebelum tarikh mula anda sendiri.",
        body: `e-Invois adalah perubahan paling besar dalam cara perniagaan Malaysia mendokumenkan jualan sejak bertahun-tahun, dan tidak seperti SST atau KWSP, ia bukan cukai atau caruman baharu — ia adalah format baharu, disahkan oleh LHDN, yang akhirnya perlu digunakan oleh setiap invois. Perbezaan ini penting, kerana ia bermakna e-Invois terpakai kepada jauh lebih banyak perniagaan berbanding SST, mengikut jadual berfasa berdasarkan hasil jualan anda, bukan apa yang anda jual. Panduan ini merangkumi apa yang sebenarnya dikehendaki oleh e-Invois, cara menentukan bila perniagaan anda termasuk dalam skop, dan langkah praktikal untuk bersedia sebelum fasa anda sendiri tiba.

## 1. Fahami Apa Sebenarnya e-Invois Itu

e-Invois bukan sekadar invois PDF yang dihantar melalui e-mel kepada pelanggan — ia adalah dokumen data berstruktur (mengikut format yang ditetapkan oleh LHDN) yang disahkan oleh LHDN secara hampir masa nyata melalui sistem MyInvois sebelum ia dikira sebagai invois cukai yang sah. Sebaik sahaja disahkan, LHDN mengembalikan pengenal unik dan kod QR yang dimasukkan pada invois yang sebenarnya anda berikan kepada pelanggan.

Ini adalah keperluan yang benar-benar berbeza daripada SST:

- **SST** adalah cukai yang anda kutip dan hantar ke atas barangan atau perkhidmatan boleh cukai tertentu, hanya jika anda berdaftar.
- **e-Invois** pula adalah keperluan dokumentasi dan pelaporan untuk transaksi itu sendiri — merangkumi barangan, perkhidmatan, dan akhirnya kebanyakan transaksi perniagaan lain — tanpa mengira sama ada SST terpakai kepada anda langsung.

Sebuah perniagaan yang tidak pernah terlibat dengan SST kerana jatuh di bawah setiap ambang masih boleh berada tepat dalam skop e-Invois, kerana kedua-dua sistem ini beroperasi di bawah peraturan yang sama sekali berasingan.

## 2. Ketahui Fasa Anda — Mandat Ini Tidak "Aktif" untuk Semua Serentak

LHDN melancarkan e-Invois secara berfasa, mengikut hasil jualan tahunan, bukannya mengaktifkannya untuk semua perniagaan serentak — dan ambang serta tarikh fasa sudah disemak semula lebih daripada sekali sejak mandat ini mula-mula diumumkan. Bentuk umumnya, seperti yang terakhir diterbitkan, berfasa dari perniagaan bergred hasil jualan tertinggi menurun secara beransur-ansur kepada perniagaan yang lebih kecil sepanjang lebih kurang dua tahun akan datang, dengan setiap fasa didahului oleh "tempoh kelonggaran sementara" yang melembutkan penguatkuasaan sejurus selepas tarikh mula fasa tersebut.

> Jangan kira fasa anda sendiri daripada nombor yang anda ingat pernah dibaca — LHDN telah menyemak semula kedua-dua tarikh fasa dan ambang pengecualian sejak mandat ini diumumkan, yang terkini mengubah ambang pengecualian paling bawah itu sendiri. Semak jadual fasa semasa di portal MyInvois rasmi LHDN atau notis rasmi LHDN terkini sebelum anda merancang berdasarkan tarikh tertentu.

### Apa yang Menentukan Fasa Anda
Fasa anda secara amnya berdasarkan hasil jualan tahunan perniagaan anda daripada tahun kewangan tertentu yang lalu, bukan hasil jualan semasa atau yang dijangka — bermakna sebuah perniagaan yang telah berkembang dengan ketara sejak tahun rujukan itu mungkin sudah berada dalam fasa yang lebih awal berbanding apa yang ditunjukkan oleh saiznya sekarang, atau sebaliknya bagi perniagaan yang telah mengecil. Sahkan tahun kewangan mana yang digunakan oleh LHDN sebagai titik rujukan bagi penjejakan hasil jualan perniagaan anda, kerana butiran ini mudah tersilap jika bergantung pada ingatan dan secara langsung menentukan tarikh akhir sebenar anda.

### Jika Hasil Jualan Anda Berada di Bawah Ambang Pengecualian Perniagaan Terkecil
Terdapat satu ambang di mana perniagaan di bawahnya belum diwajibkan melaksanakan e-Invois lagi — walaupun ambang ini sendiri telah berubah sejak mandat diperkenalkan, jadi sahkan angka semasa berbanding angka yang pernah anda lihat disebut. Perniagaan di bawah ambang ini masih boleh melaksanakan e-Invois secara sukarela, yang berbaloi dipertimbangkan sekiranya ramai pelanggan anda sudah pun diwajibkan dan lebih suka menerima e-Invois yang disahkan daripada pembekal mereka.

## 3. Apa yang Sebenarnya Anda Perlukan untuk Mengeluarkan e-Invois yang Patuh

Beberapa perkara perlu disediakan sebelum perniagaan anda boleh mengeluarkan e-Invois pertama yang disahkan:

- **Nombor Pengenalan Cukai (TIN)** yang berdaftar dengan LHDN — pengenal teras yang setiap e-Invois dikaitkan dengannya, bagi anda dan pembeli.
- **Maklumat pembeli yang lengkap dan tepat** — TIN pembeli sendiri (bagi transaksi B2B), butiran pendaftaran, dan alamat, yang kesemuanya kini perlu direkodkan dan disahkan pada titik jualan, bukan dibersihkan kemudian.
- **Cara menjana medan data yang diperlukan** — format e-Invois LHDN menetapkan medan wajib (penerangan item, kategori cukai, kod klasifikasi, dan banyak lagi) yang jauh melangkaui apa yang biasanya terdapat dalam templat invois mudah.
- **Kaedah penyerahan** — dibincangkan seterusnya — yang benar-benar dapat mencapai sistem MyInvois LHDN untuk mengesahkan setiap invois.

### Mulakan dengan Data Induk Pelanggan Anda Sekarang
Bahagian paling memakan masa dalam persediaan ini biasanya bukan bahagian penyerahan teknikal — tetapi menyemak semula senarai pelanggan sedia ada anda untuk mengumpul TIN dan butiran pendaftaran yang sebelum ini tidak pernah diwajibkan untuk anda simpan. Memulakan ini jauh sebelum tarikh mula fasa anda, berbanding bertergesa-gesa sebaik sahaja ia berkuat kuasa, adalah satu perkara paling berbaloi yang boleh dilakukan hari ini oleh perniagaan dalam fasa yang akan datang.

Cara mudah untuk bermula: tambahkan medan TIN dan nombor pendaftaran pada mana-mana borang atau proses yang anda sudah gunakan untuk mendaftarkan pelanggan B2B baharu, supaya akaun baharu tidak terus menambah bebanan sementara anda menyelesaikan yang sedia ada. Bagi hubungan pelanggan yang sudah lama terjalin, satu e-mel atau panggilan ringkas meminta TIN mereka sebelum tarikh mula anda biasanya sudah memadai — kebanyakan perniagaan yang sudah berada dalam fasa lebih awal sudah biasa diminta sebegini.

## 4. Pilih Cara Anda Akan Menyerahkan e-Invois

LHDN menawarkan lebih daripada satu cara untuk mengesahkan invois, dan pilihan yang sesuai kebanyakannya bergantung pada jumlah transaksi anda:

### Portal MyInvois
Portal berasaskan web yang percuma di mana anda memasukkan butiran invois secara manual dan menyerahkannya satu persatu (atau melalui muat naik pukal bagi satu kelompok). Ini berfungsi dengan baik untuk perniagaan bervolum rendah, tetapi menjadi benar-benar menyusahkan sebaik sahaja anda mengeluarkan lebih daripada beberapa invois sehari.

### Integrasi API
Perniagaan yang lebih besar, atau sesiapa yang mengeluarkan invois dalam jumlah yang banyak, biasanya menyambungkan sistem perakaunan atau titik jualan (POS) sedia ada mereka terus ke MyInvois melalui API, supaya pengesahan berlaku secara automatik sebagai sebahagian daripada proses jualan biasa berbanding sebagai langkah manual berasingan.

### Penyedia Perkhidmatan Bertauliah (PEPPOL / Perisian Perantaraan)
Semakin ramai vendor perisian perakaunan dan penyedia perisian perantaraan e-Invois khusus kini menawarkan penyerahan MyInvois terbina dalam, selalunya laluan paling mudah bagi PKS yang tidak mahu membina integrasi API sendiri — berbaloi disemak dahulu sama ada perisian perakaunan yang anda sudah gunakan telah menambah ciri ini sebelum membayar untuk sesuatu yang baharu.

## 5. Apa yang Berubah dalam Operasi Harian Anda Sebaik Sahaja Berada dalam Skop

Sebaik sahaja fasa anda berkuat kuasa, setiap jualan yang berkenaan perlu disahkan sebelum (atau sejurus selepas, semasa mana-mana tempoh kelonggaran) ia dikira sebagai invois cukai yang sah — ini mengubah beberapa tabiat yang mungkin masih tidak formal pada masa ini:

- **Merekod butiran pembeli pada titik jualan**, bukan selepas fakta, kerana data pembeli yang hilang atau salah adalah sebab paling biasa penyerahan e-Invois ditolak atau tertangguh.
- **Mengeluarkan nota kredit atau nota debit sebagai e-Invois tersendiri yang disahkan**, berbanding pelarasan ad hoc, bagi sebarang bayaran balik, diskaun, atau pembetulan selepas jualan asal.
- **Menyimpan e-Invois yang disahkan (dan pengenal unik yang dikeluarkan LHDN) sebagai rekod cukai sebenar anda**, kerana inilah — bukan apa jua yang dijana secara berasingan oleh sistem anda sendiri — yang kini dianggap LHDN sebagai muktamad.

Ini juga mengubah apa yang diharapkan pelanggan daripada anda. Perniagaan yang sudah diwajibkan selalunya akan meminta TIN anda sebelum sesuatu jualan selesai, kerana mereka memerlukannya untuk menyerahkan e-Invois mereka sendiri yang disahkan — membiasakan diri memberikannya dengan segera, berbanding menganggapnya sebagai permintaan luar biasa, wajar dilakukan sebelum ia menjadi rutin bagi kedua-dua pihak.

Memperbetulkan peralihan operasi ini penting bukan sekadar untuk pematuhan — perniagaan yang tersusun dan mudah dihubungi cenderung juga lebih mudah ditemui dan dipercayai oleh pelanggan, dan itulah tepatnya yang dibantu oleh [penyenaraian percuma dan disahkan di sini](/ms/signup) bersama-sama segala yang sedang anda kemaskan. Wajar juga [melihat bagaimana perniagaan Malaysia lain mempersembahkan diri mereka](/ms) sebaik sahaja rekod dan butiran awam mereka sudah teratur.

## 6. Gunakan Tempoh Kelonggaran — Jangan Tunggu Tarikh Akhir Benar-Benar Tiba

Tarikh mula setiap fasa biasanya disertai tempoh kelonggaran sementara sejurus selepasnya, di mana LHDN melonggarkan penguatkuasaan ketat (contohnya, membenarkan e-Invois konsolidasi merangkumi beberapa transaksi, berbanding menuntut pengesahan penuh bagi setiap satu sejak hari pertama) sementara perniagaan menyesuaikan diri. Anggap tempoh itu sebagai masa bekerja untuk membetulkan masalah sebenar — data pelanggan yang tidak lengkap, kaedah penyerahan yang belum berfungsi dengan stabil — bukan sebagai masa tambahan untuk melengah-lengahkan permulaan. Perniagaan yang mula menguji awal dalam tempoh kelonggarannya biasanya menemui dan membetulkan isu prosesnya sebelum penguatkuasaan diperketatkan; yang menunggu sehingga tempoh kelonggaran hampir tamat sedang menyelesaikan masalah buat kali pertama di bawah tekanan tarikh akhir sebenar.

## Kesilapan Biasa Perniagaan dengan e-Invois

- **Mengelirukan fasa e-Invois berasaskan hasil jualan dengan ambang pendaftaran SST.** Kedua-duanya adalah sistem yang sama sekali berasingan dengan peraturan berasingan — berada di bawah ambang SST tidak bermakna apa-apa tentang sama ada anda sudah berada dalam sesuatu fasa e-Invois.
- **Membiarkan pengumpulan data TIN dan pendaftaran pelanggan sehingga tarikh mula.** Ini sentiasa menjadi bahagian paling perlahan dalam persediaan, dan tidak boleh digesa seminggu sebelum penguatkuasaan bermula.
- **Menganggap tempoh kelonggaran sebagai masa tambahan sebelum apa-apa perlu berlaku.** Ia dimaksudkan untuk membetulkan masalah yang sudah anda temui melalui ujian sebenar, bukan untuk melengah-lengahkan percubaan pertama mengeluarkan e-Invois yang disahkan.

## Di Mana Harus Bermula Minggu Ini

- **Minggu ini:** Semak jadual fasa MyInvois semasa LHDN berbanding hasil jualan tahunan perniagaan anda daripada tahun kewangan rujukan yang betul, supaya anda tahu tarikh mula sebenar anda berbanding yang diingat sahaja.
- **Jika fasa anda semakin hampir:** Mula kumpulkan TIN dan butiran pendaftaran untuk pelanggan tetap anda sekarang, dan tentukan sama ada portal MyInvois, integrasi API, atau penyedia perkhidmatan sesuai dengan jumlah invois anda.
- **Sebaik sahaja anda mempunyai kaedah penyerahan:** Jalankan beberapa invois sebenar melaluinya semasa mana-mana tempoh kelonggaran, khusus untuk mendedahkan masalah data atau proses semasa penguatkuasaan masih longgar.
- **Jika anda kini di bawah ambang pengecualian:** Catatkan tarikh dalam kalendar anda untuk menyemak semula penjejakan hasil jualan anda secara berkala, kerana melepasinya meletakkan anda dalam skop mengikut jadual LHDN, bukan jadual anda sendiri.

e-Invois tidak lagi pilihan sebaik sahaja fasa anda tiba, dan perniagaan yang bergelut dengannya hampir selalu adalah yang menganggap tarikh mula sebagai permulaan persediaan dan bukannya penghujungnya.`,
        faqs: [
      {
        question: "Adakah e-Invois cukai baharu, seperti SST?",
        answer:
          "Tidak. e-Invois adalah keperluan dokumentasi dan pengesahan untuk cara invois dikeluarkan dan direkodkan, bukan cukai itu sendiri. Ia terpakai berdasarkan fasa hasil jualan anda, sama sekali tidak bergantung kepada sama ada anda berdaftar atau liabel membayar SST.",
      },
      {
        question: "Bila e-Invois menjadi wajib untuk perniagaan saya?",
        answer:
          "Ia bergantung kepada hasil jualan tahunan anda daripada tahun kewangan rujukan tertentu yang digunakan LHDN untuk penggredan fasa, dan kedua-dua tarikh fasa serta ambang pengecualian telah disemak semula sejak mandat ini mula-mula diumumkan. Semak jadual fasa MyInvois semasa LHDN secara langsung berbanding bergantung kepada tarikh yang pernah anda lihat disebut di tempat lain.",
      },
      {
        question: "Apakah perbezaan antara portal MyInvois, integrasi API, dan penyedia perkhidmatan?",
        answer:
          "Portal MyInvois adalah cara percuma, manual, berasaskan web untuk menyerahkan invois satu persatu atau secara kelompok, sesuai untuk jumlah rendah. Integrasi API menyambungkan sistem perakaunan atau POS sedia ada anda terus ke MyInvois untuk pengesahan automatik, manakala penyedia perkhidmatan bertauliah atau tambahan perisian perakaunan menawarkan penyerahan terbina dalam tanpa membina integrasi sendiri — pilihan yang sesuai kebanyakannya bergantung kepada berapa banyak invois yang anda keluarkan.",
      },
      {
        question: "Maklumat apa yang saya perlukan daripada pelanggan untuk mengeluarkan e-Invois kepada mereka?",
        answer:
          "Bagi transaksi B2B, anda amnya memerlukan Nombor Pengenalan Cukai (TIN) pembeli sendiri, butiran pendaftaran, dan alamat, direkodkan dengan tepat pada titik jualan. Maklumat pembeli yang hilang atau salah adalah sebab paling biasa penyerahan e-Invois ditolak atau tertangguh.",
      },
      {
        question: "Apakah tempoh kelonggaran, dan apa yang perlu saya lakukan semasanya?",
        answer:
          "Tarikh mula setiap fasa biasanya diikuti tempoh kelonggaran sementara di mana penguatkuasaan lebih longgar — contohnya, membenarkan e-Invois konsolidasi merangkumi beberapa transaksi berbanding menuntut pengesahan penuh sejak hari pertama. Gunakan ia untuk menguji proses penyerahan anda dan membetulkan masalah sebenar, bukan sebagai masa tambahan sebelum bermula.",
      },
      {
        question: "Perniagaan saya berada di bawah ambang pengecualian — adakah saya perlu buat apa-apa sekarang?",
        answer:
          "Tidak serta-merta, walaupun ambang pengecualian itu sendiri telah berubah sejak mandat diperkenalkan, jadi sahkan angka semasa terpakai kepada anda berbanding yang pernah anda lihat di tempat lain. Anda masih boleh melaksanakan e-Invois secara sukarela, yang berbaloi dipertimbangkan sekiranya ramai pelanggan anda sudah pun diwajibkan.",
      },
      {
        question: "Apa yang berubah tentang cara saya mengendalikan bayaran balik atau pembetulan sebaik sahaja berada dalam skop?",
        answer:
          "Bayaran balik, diskaun, atau pembetulan selepas jualan asal perlu dikeluarkan sebagai e-Invois tersendiri yang disahkan (nota kredit atau nota debit), berbanding pelarasan tidak formal kepada invois asal. Ini adalah satu daripada tabiat yang lebih biasa perlu diformalkan oleh perniagaan sebaik sahaja fasa mereka berkuat kuasa.",
      },
      {
        question: "Apakah bahagian paling memakan masa dalam bersedia untuk e-Invois?",
        answer:
          "Biasanya bukan persediaan penyerahan teknikal — tetapi menyemak semula senarai pelanggan sedia ada anda untuk mengumpul Nombor Pengenalan Cukai dan butiran pendaftaran yang sebelum ini tidak pernah diwajibkan untuk anda simpan. Memulakan ini jauh sebelum tarikh mula fasa anda adalah perkara paling berbaloi dilakukan awal.",
      },
        ],
      },
    },
  },
  {
    slug: "opening-a-business-bank-account-in-malaysia",
    title: "Opening a Business Bank Account in Malaysia: What SMEs Need to Prepare",
    seoTitle: "Opening a Business Bank Account in Malaysia: SME Guide",
    seoDescription:
      "What documents a Malaysian bank asks for by business structure, how Sdn Bhd requirements differ from a sole proprietorship, and what to compare across banks.",
    coverImage: {
      file: "opening-a-business-bank-account-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A proud small business owner signing paperwork at a bank counter",
      altTranslations: {
        zh: "一位自豪的小企业主在银行柜台签署文件",
        ms: "Seorang pemilik perniagaan kecil yang bangga menandatangani dokumen di kaunter bank",
      },
    },
    contentImages: {
      documents: {
        file: "opening-a-business-bank-account-in-malaysia-documents.webp",
        mimeType: "image/webp",
        alt: "A business owner organizing a folder of business documents at a desk",
        altTranslations: {
          zh: "一位企业主在办公桌前整理一份企业文件夹",
          ms: "Seorang pemilik perniagaan menyusun fail dokumen perniagaan di sebuah meja",
        },
        after: "A bank won't usually reject an application outright over a missing document — it just pauses while you go get it, and that gap is almost always longer than it would have taken to confirm the full checklist before the first visit.",
        afterTranslations: {
          zh: "银行通常不会直接拒绝申请,只是会暂停处理,等您补齐缺失的文件——而这个等待的时间,几乎总是比提前核实完整清单所需的时间要长得多。",
          ms: "Bank biasanya tidak akan menolak permohonan secara terus hanya kerana satu dokumen hilang — ia hanya berhenti seketika sementara anda mendapatkannya, dan jurang itu hampir selalu lebih lama berbanding masa yang diperlukan untuk mengesahkan senarai semak penuh sebelum lawatan pertama.",
        },
      },
    },
    excerpt:
      "What a Malaysian bank asks for to open a business account depends heavily on your business structure — a sole proprietorship clears it in one visit, while a Sdn Bhd's paperwork runs much deeper. This guide covers what to prepare beforehand, how requirements differ by structure, and what's actually worth comparing across banks.",
    body: `A business bank account sounds like a formality until the first time a bank officer asks for a document you didn't know you needed, and the whole application stalls for a week while you track it down. What a Malaysian bank actually asks for depends heavily on your business structure — a sole proprietorship clears this in a single branch visit, while a Sdn Bhd's paperwork runs considerably deeper. This guide covers what to prepare before you walk in, how requirements differ by structure, and what's actually worth comparing across banks beyond the headline numbers.

## 1. Start with your business structure — it decides almost everything else

Malaysian banks treat a sole proprietorship, a partnership, and a Sdn Bhd (private limited company) as genuinely different account types, each with its own document checklist and typically its own processing time.

- **Sole proprietorship** — the lightest requirements of the three, since there's no separate legal entity from you personally; your own identity documents and your SSM registration generally cover most of what's asked.
- **Partnership** — similar to a sole proprietorship but with every partner's identity documents required, plus the partnership deed itself.
- **Sdn Bhd** — the most document-heavy of the three, since the company is its own legal person and the bank needs to establish exactly who can act on its behalf.

Knowing which of these you are before you start matters because a document checklist pulled from the wrong category — assuming a Sdn Bhd's lighter alternative applies to you, for instance — just means a second trip back with what was actually needed the first time.

### Why a Sdn Bhd goes through more scrutiny
A sole proprietorship has no separation between you and the business in the eyes of the law, so the bank is essentially opening an account for a person it can already identify from a MyKad. A Sdn Bhd is its own legal entity, capable of outliving or changing the people who run it, so the bank has to independently establish who is actually authorized to move money on the company's behalf — a materially different, and necessarily more document-heavy, question to answer.

## 2. Gather the documents before you book an appointment

### For a sole proprietorship or partnership
At minimum, expect to bring your own MyKad (or passport, for a foreign business owner), your SSM business registration documents (Form A/Form D under the Registration of Businesses Act, or their current ACE/e-equivalents), and proof of your business address. A partnership adds the same identity documents for every partner, plus the signed partnership deed.

### For a Sdn Bhd
Expect a longer list: the Certificate of Incorporation, the company's constitution (if adopted), a board resolution specifically authorizing the account to be opened and naming the authorized signatories, identity documents for every director, and identity documents for any shareholder holding a meaningful stake (commonly cited around the 25% mark, though this varies by bank's own policy) — a requirement tied to anti-money-laundering rules on identifying a company's real beneficial owners, not a bank being unusually cautious.

> The board resolution is the one document first-time company directors most often forget exists. It's not optional paperwork — it's the bank's actual legal basis for letting specific named individuals operate the account, and most banks have their own template if your company secretary hasn't already drafted one.

### A detail increasingly asked for either way
Several banks now ask for your LHDN Tax Identification Number (TIN) as part of account opening, tied to the broader push toward e-Invoicing and tighter tax-compliance linkage across government and banking systems. Having this ready, rather than discovering it's needed mid-application, is an easy way to avoid a second visit.

## 3. Compare banks on more than the minimum opening deposit

The headline minimum deposit varies noticeably bank to bank and is the number most comparisons lead with, but it's rarely the detail that ends up mattering most day to day. Worth comparing properly before committing:

- **Minimum opening deposit and minimum monthly balance** — some accounts waive monthly fees above a certain balance; falling below it can mean a recurring charge that adds up over a year.
- **Transaction fees**, especially for the payment types your business actually uses often — interbank transfers, cheque deposits, or cash deposits at a branch versus at an ATM/CDM.
- **Online and mobile banking capability**, particularly whether bulk payment (e.g., paying several suppliers or staff at once) and integration with accounting software are supported, since this affects how much manual work your bookkeeping needs month to month.
- **Processing time and onboarding method** — some banks now offer fully digital onboarding for straightforward structures (typically a sole proprietorship or a simple Sdn Bhd with few directors), which can be considerably faster than a branch-only process.

### Don't assume your personal bank is automatically the right choice
It's a reasonable starting point to ask, but a bank that serves you well personally isn't necessarily the one with the best SME terms — rates, fees, and digital tools for business accounts are usually set by a completely different part of the bank than your personal account, so it's worth at least comparing one or two alternatives rather than defaulting to convenience alone.

### Digital-first business banking is worth a look too
Alongside the traditional banks, a growing number of digital-first business accounts and payment platforms now serve Malaysian SMEs, often with faster onboarding, more transparent fee schedules, and stronger built-in accounting integrations than a traditional branch account — though usually without some of the services (large cash handling, certain trade-finance products) a traditional bank still offers. Whether one of these fits depends on how your business actually operates day to day: a retail business handling a lot of cash still generally needs a conventional bank relationship, while a services or e-commerce business transacting mostly online may find a digital-first option genuinely better suited.

## 4. What actually happens once you apply

### Verification takes real time
Banks verify your SSM registration, run standard anti-money-laundering and know-your-customer checks on the business and its individuals, and confirm whatever documents you've submitted. A sole proprietorship or partnership account can often open within a few business days of a complete application; a Sdn Bhd's additional verification steps typically push this out further, commonly cited in the range of about a week to two.

### Incomplete documentation is the single most common delay
A bank won't usually reject an application outright over a missing document — it just pauses while you go get it, and that gap is almost always longer than it would have taken to confirm the full checklist before the first visit. Calling ahead or checking the bank's current published checklist (these are occasionally updated) before booking an appointment is worth the few minutes it takes.

Having a business account that's actually open and functioning matters for more than paying suppliers — it's also one of the details that makes a business look established and worth trusting, which pairs naturally with [listing your business here](/en/signup) once your operational basics are sorted, and it's worth [browsing how other Malaysian SMEs present themselves](/en) for a sense of what a fully set-up business's public presence typically looks like.

## 5. Keep the account useful, not just open

An account that's opened and then barely touched beyond the occasional deposit misses what it's actually for. A few habits worth setting up from day one:

- **Separate every business transaction from personal spending**, even for a sole proprietorship where the law doesn't strictly require it — mixing the two is one of the most common reasons bookkeeping and tax filing become unnecessarily painful later.
- **Set up online/mobile access immediately**, rather than defaulting to branch visits, since most of what a growing business needs (transfers, statements, bulk payments) is faster and better logged digitally.
- **Review your account type periodically as the business grows** — a basic SME account that made sense at a low transaction volume may no longer be the cheapest or most functional option once volume or balance crosses certain thresholds most banks set.

## Common mistakes businesses make opening an account

- **Showing up without the board resolution, for a Sdn Bhd.** It's easy to assume director ID alone is enough — it isn't, and this single missing document is the most common reason a company account opening gets delayed.
- **Comparing banks only on the minimum deposit.** Transaction fees and digital banking capability tend to matter far more over a year of actual use than the one-time opening figure.
- **Mixing personal and business spending from an account meant to separate them.** It defeats much of the point of having a dedicated account in the first place, and makes later bookkeeping and tax filing considerably harder than it needed to be.

## Where to start this week

- **This week:** Confirm your exact business structure (sole proprietorship, partnership, or Sdn Bhd) and pull together the document checklist for that specific category from at least two banks' current published requirements.
- **For a Sdn Bhd:** Get the board resolution authorizing the account and naming signatories drafted and signed before booking an appointment — this is the step most likely to cause a delay if left until the branch visit.
- **Before choosing a bank:** Compare transaction fees and digital banking features, not just the minimum opening deposit, against how your business actually plans to use the account day to day.
- **Once it's open:** Set up online banking immediately and commit to keeping every business transaction separate from personal spending from the very first deposit.

Getting the paperwork right the first time is the difference between a same-week account and a month of back-and-forth — the requirements aren't complicated, they just need to be gathered in full before the bank ever sees them.`,
    faqs: [
      {
        question: "What documents does a sole proprietorship need to open a business bank account in Malaysia?",
        answer:
          "Generally your own MyKad (or passport, for a foreign owner), your SSM business registration documents, and proof of business address. This is the lightest document requirement of the three main business structures.",
      },
      {
        question: "What does a Sdn Bhd need that a sole proprietorship doesn't?",
        answer:
          "A Sdn Bhd additionally needs the Certificate of Incorporation, the company's constitution if adopted, a board resolution authorizing the account and naming signatories, identity documents for every director, and identity documents for shareholders holding a meaningful stake. This reflects the bank independently verifying who can legally act for a separate legal entity.",
      },
      {
        question: "Why is the board resolution so important for a Sdn Bhd account?",
        answer:
          "It's the bank's actual legal basis for letting specific named individuals operate the account on the company's behalf — director identity documents alone aren't sufficient. It's also the single most commonly forgotten document by first-time company directors, and most banks have their own template available.",
      },
      {
        question: "How long does it take to open a business bank account in Malaysia?",
        answer:
          "A sole proprietorship or partnership account can often open within a few business days of a complete application, while a Sdn Bhd's additional verification steps typically push this out further, commonly cited around one to two weeks. Incomplete documentation is the most common cause of delay beyond these typical ranges.",
      },
      {
        question: "Should I just open a business account at my personal bank?",
        answer:
          "It's a reasonable starting point, but not automatically the best choice — business account terms, fees, and digital tools are usually set by a different part of the bank than personal banking, so comparing at least one or two alternatives is worth the time before committing.",
      },
      {
        question: "What should I compare between banks besides the minimum deposit?",
        answer:
          "Transaction fees for the payment types you actually use, minimum monthly balance requirements, online/mobile banking capability (especially bulk payments and accounting software integration), and processing time or digital onboarding options. These tend to matter more over a year of actual use than the one-time opening deposit figure.",
      },
      {
        question: "Do banks ask for a Tax Identification Number (TIN) when opening a business account now?",
        answer:
          "Increasingly, yes — this ties into the broader push toward e-Invoicing and tighter tax-compliance linkage between government and banking systems. Having your TIN ready before applying helps avoid a second visit.",
      },
      {
        question: "Is it important to keep business and personal spending separate, even for a sole proprietorship?",
        answer:
          "Yes, even though the law doesn't strictly require it for a sole proprietorship. Mixing the two is one of the most common reasons bookkeeping and tax filing become unnecessarily complicated later, so a dedicated business account is worth using consistently from the first deposit.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚开立企业银行账户:中小企业需要准备什么",
        excerpt:
          "马来西亚银行开立企业账户实际要求的材料,很大程度上取决于企业组织形式——独资企业一次办理即可搞定,而私人有限公司的文书工作则要繁琐得多。本指南说明需要提前准备什么、不同组织形式的要求有何差异,以及真正值得比较各家银行的地方。",
        body: `企业银行账户听起来像是一件例行小事,直到银行职员第一次向您索要一份您根本不知道需要准备的文件,整个申请就此卡住一个星期,您才意识到事情没那么简单。马来西亚银行实际要求的材料,很大程度上取决于您企业的组织形式——独资企业一次柜台办理就能搞定,而私人有限公司(Sdn Bhd)所需的文书工作则要繁琐得多。本指南将说明在您前往银行之前该准备什么、不同组织形式的要求有何差异,以及除了表面数字之外,真正值得比较各家银行的地方。

## 1. 先确定您的企业组织形式——它几乎决定了后续的一切

马来西亚的银行会把独资企业、合伙企业和私人有限公司(Sdn Bhd)视为完全不同的账户类型,各自有自己的文件清单,通常处理时间也不一样。

- **独资企业**——三者中要求最轻松的一种,因为在法律上它与您个人之间没有分离;一般来说,您本人的身份证件和 SSM 注册资料基本就能满足大部分要求。
- **合伙企业**——与独资企业类似,但需要每一位合伙人的身份证件,以及合伙协议本身。
- **私人有限公司(Sdn Bhd)**——三者中文书要求最繁琐的一种,因为公司是独立的法人,银行需要确切核实到底谁有权代表公司行事。

在开始之前先弄清楚自己属于哪一类,这一点很重要——因为如果套用了错误类别的文件清单(比如误以为私人有限公司可以适用更简单的要求),往往只会导致您第二次跑一趟,补齐第一次本该准备好的材料。

### 为什么私人有限公司会受到更严格的审查
独资企业在法律上与您个人之间没有分离,因此银行实际上是在为一个它已经可以通过身份证确认的自然人开户。而私人有限公司是独立的法人实体,能够在经营者更替或变动之后依然存续,因此银行必须独立核实,到底是谁真正有权代表公司动用资金——这是一个本质上不同、也必然需要更多文件来回答的问题。

## 2. 在预约之前先把文件准备齐全

### 对独资企业或合伙企业而言
至少需要携带您本人的大马卡(或外国企业主的护照)、SSM 企业注册文件(《商业登记法令》下的 A 表/D 表,或其现行的 ACE 电子等效文件),以及企业地址证明。合伙企业则需要在此基础上,为每一位合伙人提供相同的身份证件,并附上已签署的合伙协议。

### 对私人有限公司(Sdn Bhd)而言
需要准备的清单会更长:公司注册证书、公司章程(如已采用)、专门授权开立该账户并指定授权签署人的董事会决议、每一位董事的身份证件,以及持有一定比例股份(常见门槛大致在 25% 左右,但具体以各银行自身政策为准)的任何股东的身份证件——这项要求源自反洗钱规定,目的是核实公司真正的实益拥有人,而不是银行格外谨慎。

> 董事会决议,是首次担任公司董事的人最常忘记还需要这份文件的一项。它并非可有可无的文书——而是银行允许特定具名人士操作该账户的真正法律依据,如果您的公司秘书尚未起草,大多数银行都备有自己的模板可供使用。

### 一项如今越来越常被要求的信息,无论哪种组织形式
不少银行如今会在开户时一并要求提供您的 LHDN 纳税人识别号(TIN),这与电子发票的更广泛推行,以及政府与银行系统之间日益紧密的税务合规联动有关。提前准备好这项信息,而不是等到申请过程中才发现需要,是避免再跑一趟的简单办法。

## 3. 比较银行时,不要只看最低开户存款

表面上的最低开户存款金额在各银行之间差异明显,也是大多数比较文章最先列出的数字,但在日常实际使用中,它往往并不是最终最重要的因素。真正值得仔细比较的包括:

- **最低开户存款与每月最低结余**——部分账户在结余超过一定金额后可豁免月费;一旦低于这个数字,就可能意味着一笔经年累月积少成多的固定费用。
- **交易手续费**,尤其是您企业实际常用的付款方式所对应的费用——银行间转账、支票存款,或是柜台现金存款与 ATM/CDM 存款之间的差异。
- **网上与手机银行功能**,特别是是否支持批量付款(例如一次性支付多家供应商或员工薪水)以及与会计软件的对接,因为这直接影响您每个月账务处理需要多少人工操作。
- **处理时间与开户方式**——部分银行现已针对结构简单的企业(通常是独资企业,或董事人数较少的简单私人有限公司)提供全程线上开户,速度可能比纯柜台办理快得多。

### 不要想当然地认为您个人往来的银行就是最佳选择
以此作为起点去询问是合理的,但一家个人账户体验良好的银行,未必就是中小企业条款最优的那一家——企业账户的利率、费用和数字化工具,通常由银行内部完全不同的部门制定,因此至少比较一两家其他银行,而不是单纯图方便就默认沿用原银行,是值得的。

### 数字优先的企业银行服务同样值得一看
除了传统银行之外,如今越来越多面向马来西亚中小企业的数字优先企业账户和支付平台,往往提供更快的开户流程、更透明的收费结构,以及比传统柜台账户更强的会计软件集成能力——不过通常也少了传统银行仍然提供的部分服务(大额现金处理、某些贸易融资产品)。这类服务是否适合您,取决于您企业日常实际的运作方式:处理大量现金的零售业务,通常仍然需要一家传统银行的关系;而主要以线上方式进行交易的服务型或电商企业,则可能会发现数字优先的选项确实更合适。

## 4. 申请之后实际会发生什么

### 核实需要真实的时间
银行会核实您的 SSM 注册资料,对企业及相关个人进行标准的反洗钱与客户身份核实(KYC)检查,并确认您所提交的各项文件。独资企业或合伙企业的账户,通常能在申请材料齐全后数个工作日内开立;私人有限公司因额外的核实步骤,处理时间通常会更长,常见说法大致在一到两周之间。

### 文件不齐全是最常见的延误原因
银行通常不会直接拒绝申请,只是会暂停处理,等您补齐缺失的文件——而这个等待的时间,几乎总是比提前核实完整清单所需的时间要长得多。在预约之前打电话确认,或查看银行当前公布的清单(这些清单偶尔会更新),花的这几分钟是完全值得的。

拥有一个真正开通并正常运作的企业账户,其意义不仅限于支付供应商款项——它也是让企业显得正规、值得信赖的细节之一,这与在运营基础理顺之后[在这里刊登您的企业](/zh/signup)是相辅相成的,也值得[看看其他马来西亚中小企业是如何展示自己的](/zh),从中了解一家各项基础都已就绪的企业,其公开形象通常是什么样子。

## 5. 让账户保持实际有用,而不只是"开着"

一个开通之后却几乎只用来偶尔存钱的账户,辜负了它本来的用途。从第一天起就值得养成的几个习惯:

- **将每一笔企业交易与个人消费分开**,即使对于法律上并未严格要求这样做的独资企业也是如此——把两者混在一起,是日后记账和报税变得不必要麻烦的最常见原因之一。
- **立即设置网上/手机银行权限**,而不是默认依赖柜台办理,因为一家成长中的企业所需的大部分操作(转账、对账单、批量付款),在线上处理起来更快,记录也更完整。
- **随着企业成长,定期重新审视您的账户类型**——一个在交易量较低时合适的基础中小企业账户,一旦交易量或结余超过各银行自行设定的某些门槛,可能就不再是最划算或最实用的选择。

## 企业开户时最常犯的错误

- **私人有限公司去开户时没带董事会决议。** 很容易误以为只要董事身份证件就够了——其实不然,这一份缺失的文件,正是公司账户开户最常见的延误原因。
- **只比较各银行的最低开户存款。** 从一整年的实际使用来看,交易手续费和数字银行功能往往比一次性的开户金额重要得多。
- **把本该用来分开个人与企业开支的账户,拿来混用。** 这几乎抵消了设立专用账户的本意,也让日后记账和报税变得比原本应有的更加麻烦。

## 本周可以从这里开始

- **本周:** 确认您企业的确切组织形式(独资企业、合伙企业,还是私人有限公司),并针对这一具体类别,从至少两家银行当前公布的要求中,整理出完整的文件清单。
- **如果是私人有限公司:** 在预约之前,先把授权开户并指定签署人的董事会决议起草并签署好——这是最有可能在柜台办理时造成延误的一步。
- **在选择银行之前:** 比较交易手续费和数字银行功能,而不只是最低开户存款金额,并结合您企业日常实际将如何使用这个账户来判断。
- **开户之后:** 立即设置网上银行,并从第一笔存款开始,就坚持把所有企业交易与个人消费分开。

第一次就把文件准备齐全,是"当周就能开户"与"来回折腾一个月"之间的差别——这些要求本身并不复杂,只是需要在银行真正看到它们之前,就已经完整收集到位。`,
        faqs: [
      {
        question: "独资企业在马来西亚开立企业银行账户需要哪些文件?",
        answer:
          "一般需要您本人的大马卡(外国企业主为护照)、SSM 企业注册文件,以及企业地址证明。这是三种主要企业组织形式中要求最轻松的一种。",
      },
      {
        question: "私人有限公司(Sdn Bhd)比独资企业还需要额外准备什么?",
        answer:
          "私人有限公司还需要公司注册证书、公司章程(如已采用)、授权开户并指定签署人的董事会决议、每一位董事的身份证件,以及持有一定比例股份的股东身份证件。这反映出银行需要独立核实,到底谁有权代表这个独立法人实体行事。",
      },
      {
        question: "为什么董事会决议对私人有限公司的开户如此重要?",
        answer:
          "它是银行允许特定具名人士代表公司操作该账户的真正法律依据——仅凭董事身份证件是不够的。它也是首次担任公司董事的人最常忘记的一份文件,而大多数银行都备有自己的模板可供使用。",
      },
      {
        question: "在马来西亚开立企业银行账户需要多长时间?",
        answer:
          "独资企业或合伙企业账户,通常能在申请材料齐全后数个工作日内开立,而私人有限公司因额外的核实步骤,处理时间通常更长,常见说法大致在一到两周之间。文件不齐全是导致超出这些常见时长范围的最常见原因。",
      },
      {
        question: "我应该直接在我个人往来的银行开立企业账户吗?",
        answer:
          "以此作为起点是合理的,但未必就是最佳选择——企业账户的条款、费用和数字化工具,通常由银行内部与个人银行业务不同的部门制定,因此在做决定之前,花时间比较至少一两家其他银行是值得的。",
      },
      {
        question: "除了最低存款之外,我还应该比较银行的哪些方面?",
        answer:
          "您企业实际常用付款方式的交易手续费、每月最低结余要求、网上/手机银行功能(尤其是批量付款和会计软件集成),以及处理时间或数字化开户选项。从一整年的实际使用来看,这些往往比一次性的开户存款金额更重要。",
      },
      {
        question: "银行现在开户时会要求提供纳税人识别号(TIN)吗?",
        answer:
          "越来越多银行会这样要求——这与电子发票的更广泛推行,以及政府与银行系统之间日益紧密的税务合规联动有关。在申请之前提前准备好您的 TIN,有助于避免再跑一趟。",
      },
      {
        question: "即使是独资企业,把企业开支和个人开支分开也很重要吗?",
        answer:
          "是的,即便法律上对独资企业并未严格要求这样做。把两者混在一起,是日后记账和报税变得不必要复杂的最常见原因之一,因此从第一笔存款开始,就持续使用专用的企业账户是值得的。",
      },
        ],
      },
      ms: {
        title: "Membuka Akaun Bank Perniagaan di Malaysia: Apa yang Perlu Disediakan PKS",
        excerpt:
          "Apa yang diminta bank Malaysia untuk membuka akaun perniagaan sangat bergantung kepada struktur perniagaan anda — milikan tunggal boleh diselesaikan dalam satu lawatan, manakala kerja kertas Sdn Bhd jauh lebih mendalam. Panduan ini merangkumi apa yang perlu disediakan terlebih dahulu, bagaimana keperluan berbeza mengikut struktur, dan apa yang sebenarnya berbaloi dibandingkan merentasi bank.",
        body: `Akaun bank perniagaan kedengaran seperti formaliti sehingga kali pertama pegawai bank meminta dokumen yang anda tidak tahu diperlukan, dan keseluruhan permohonan tergendala selama seminggu sementara anda mencarinya. Apa yang sebenarnya diminta oleh bank Malaysia sangat bergantung pada struktur perniagaan anda — milikan tunggal boleh diselesaikan dalam satu lawatan cawangan, manakala kerja kertas Sdn Bhd jauh lebih mendalam. Panduan ini merangkumi apa yang perlu disediakan sebelum anda melangkah masuk, bagaimana keperluan berbeza mengikut struktur, dan apa yang sebenarnya berbaloi dibandingkan merentasi bank selain daripada angka utama.

## 1. Mulakan dengan Struktur Perniagaan Anda — Ia Menentukan Hampir Semua yang Lain

Bank Malaysia melayan milikan tunggal, perkongsian, dan Sdn Bhd (syarikat sendirian berhad) sebagai jenis akaun yang benar-benar berbeza, masing-masing dengan senarai semak dokumen tersendiri dan biasanya tempoh pemprosesannya sendiri.

- **Milikan tunggal** — keperluan paling ringan antara ketiga-tiganya, kerana tiada entiti undang-undang berasingan daripada diri anda sendiri; dokumen pengenalan diri anda dan pendaftaran SSM anda amnya merangkumi kebanyakan apa yang diminta.
- **Perkongsian** — sama seperti milikan tunggal tetapi dengan dokumen pengenalan diri setiap rakan kongsi diperlukan, ditambah surat ikatan perkongsian itu sendiri.
- **Sdn Bhd** — paling banyak memerlukan dokumen antara ketiga-tiganya, kerana syarikat adalah entiti undang-undangnya sendiri dan bank perlu menentukan dengan tepat siapa yang boleh bertindak bagi pihaknya.

Mengetahui yang mana satu anda sebelum anda bermula adalah penting kerana senarai semak dokumen yang diambil daripada kategori yang salah — menganggap alternatif Sdn Bhd yang lebih ringan terpakai kepada anda, misalnya — hanya bermakna satu lagi perjalanan balik dengan apa yang sebenarnya diperlukan pada kali pertama.

### Mengapa Sdn Bhd Melalui Pemeriksaan yang Lebih Teliti
Milikan tunggal tiada pemisahan antara anda dan perniagaan pada pandangan undang-undang, jadi bank pada asasnya membuka akaun untuk seseorang yang sudah boleh dikenal pasti melalui MyKad. Sdn Bhd adalah entiti undang-undangnya sendiri, mampu terus wujud melebihi atau berubah daripada orang yang menjalankannya, jadi bank perlu menentukan secara bebas siapa yang sebenarnya diberi kuasa untuk menggerakkan wang bagi pihak syarikat — soalan yang jauh berbeza, dan semestinya lebih memerlukan dokumen, untuk dijawab.

## 2. Kumpulkan Dokumen Sebelum Menempah Janji Temu

### Bagi Milikan Tunggal atau Perkongsian
Pada tahap minimum, jangkakan untuk membawa MyKad anda sendiri (atau pasport, bagi pemilik perniagaan asing), dokumen pendaftaran perniagaan SSM anda (Borang A/Borang D di bawah Akta Pendaftaran Perniagaan, atau ACE/e-setara semasanya), dan bukti alamat perniagaan anda. Perkongsian menambah dokumen pengenalan diri yang sama bagi setiap rakan kongsi, ditambah surat ikatan perkongsian yang telah ditandatangani.

### Bagi Sdn Bhd
Jangkakan senarai yang lebih panjang: Sijil Pemerbadanan, perlembagaan syarikat (jika diguna pakai), resolusi lembaga pengarah yang khusus memberi kuasa akaun dibuka dan menamakan penandatangan yang dibenarkan, dokumen pengenalan diri bagi setiap pengarah, dan dokumen pengenalan diri bagi mana-mana pemegang saham yang memiliki pegangan yang bermakna (biasa disebut sekitar paras 25%, walaupun ini berbeza mengikut dasar bank masing-masing) — keperluan yang berkait dengan peraturan anti-pengubahan wang haram untuk mengenal pasti pemilik manfaat sebenar syarikat, bukan bank yang luar biasa berhati-hati.

> Resolusi lembaga pengarah adalah satu dokumen yang paling kerap dilupakan kewujudannya oleh pengarah syarikat kali pertama. Ia bukan kerja kertas pilihan — ia adalah asas undang-undang sebenar bank untuk membenarkan individu tertentu yang dinamakan mengendalikan akaun, dan kebanyakan bank mempunyai templat mereka sendiri jika setiausaha syarikat anda belum merangkanya.

### Satu Butiran yang Semakin Diminta Tanpa Mengira Struktur
Beberapa bank kini turut meminta Nombor Pengenalan Cukai (TIN) LHDN anda sebagai sebahagian daripada pembukaan akaun, berkait dengan dorongan yang lebih luas ke arah e-Invois dan pautan pematuhan cukai yang lebih ketat merentasi sistem kerajaan dan perbankan. Menyediakan ini terlebih dahulu, berbanding mendapati ia diperlukan di tengah-tengah permohonan, adalah cara mudah mengelakkan satu lagi lawatan.

## 3. Bandingkan Bank Berdasarkan Lebih daripada Deposit Minimum

Deposit minimum pembukaan yang menjadi tajuk utama berbeza dengan ketara dari satu bank ke bank lain dan merupakan angka yang paling kerap diutamakan dalam perbandingan, tetapi ia jarang menjadi butiran yang paling penting dalam penggunaan harian. Wajar dibandingkan dengan teliti sebelum membuat komitmen:

- **Deposit minimum pembukaan dan baki minimum bulanan** — sesetengah akaun mengecualikan yuran bulanan di atas baki tertentu; jatuh di bawahnya boleh bermakna caj berulang yang bertambah sepanjang tahun.
- **Yuran transaksi**, terutamanya bagi jenis pembayaran yang kerap digunakan oleh perniagaan anda — pemindahan antara bank, deposit cek, atau deposit tunai di cawangan berbanding di ATM/CDM.
- **Keupayaan perbankan dalam talian dan mudah alih**, khususnya sama ada pembayaran pukal (contohnya, membayar beberapa pembekal atau kakitangan sekali gus) dan integrasi dengan perisian perakaunan disokong, kerana ini menjejaskan berapa banyak kerja manual yang diperlukan pembukuan anda dari bulan ke bulan.
- **Masa pemprosesan dan kaedah pengambilan pelanggan** — sesetengah bank kini menawarkan pengambilan pelanggan sepenuhnya digital bagi struktur mudah (biasanya milikan tunggal atau Sdn Bhd mudah dengan sedikit pengarah), yang boleh jauh lebih pantas berbanding proses hanya-cawangan.

### Jangan Anggap Bank Peribadi Anda Semestinya Pilihan Terbaik
Ia adalah titik permulaan yang munasabah untuk ditanya, tetapi bank yang melayan anda dengan baik secara peribadi tidak semestinya yang mempunyai terma PKS terbaik — kadar, yuran, dan alat digital untuk akaun perniagaan biasanya ditetapkan oleh bahagian bank yang sama sekali berbeza daripada akaun peribadi anda, jadi berbaloi sekurang-kurangnya membandingkan satu atau dua alternatif berbanding hanya memilih kemudahan semata-mata.

### Perbankan Perniagaan Digital-Dahulu Juga Wajar Dilihat
Selain bank tradisional, semakin ramai akaun perniagaan digital-dahulu dan platform pembayaran kini melayan PKS Malaysia, selalunya dengan pengambilan pelanggan yang lebih pantas, jadual yuran yang lebih telus, dan integrasi perakaunan terbina dalam yang lebih kukuh berbanding akaun cawangan tradisional — walaupun biasanya tanpa sesetengah perkhidmatan (pengendalian tunai jumlah besar, produk pembiayaan perdagangan tertentu) yang masih ditawarkan oleh bank tradisional. Sama ada salah satu daripadanya sesuai bergantung kepada bagaimana perniagaan anda sebenarnya beroperasi dari hari ke hari: perniagaan runcit yang mengendalikan banyak tunai masih amnya memerlukan hubungan bank konvensional, manakala perniagaan perkhidmatan atau e-dagang yang bertransaksi kebanyakannya dalam talian mungkin mendapati pilihan digital-dahulu benar-benar lebih sesuai.

## 4. Apa yang Sebenarnya Berlaku Sebaik Sahaja Anda Memohon

### Pengesahan Mengambil Masa yang Sebenar
Bank mengesahkan pendaftaran SSM anda, menjalankan semakan anti-pengubahan wang haram dan ketahui-pelanggan-anda (KYC) piawai ke atas perniagaan dan individunya, dan mengesahkan apa jua dokumen yang anda serahkan. Akaun milikan tunggal atau perkongsian selalunya boleh dibuka dalam beberapa hari bekerja selepas permohonan yang lengkap; langkah pengesahan tambahan Sdn Bhd biasanya menolak tempoh ini lebih jauh, biasa disebut dalam lingkungan seminggu hingga dua minggu.

### Dokumentasi Tidak Lengkap adalah Punca Kelewatan Paling Biasa
Bank biasanya tidak akan menolak permohonan secara terus hanya kerana satu dokumen hilang — ia hanya berhenti seketika sementara anda mendapatkannya, dan jurang itu hampir selalu lebih lama berbanding masa yang diperlukan untuk mengesahkan senarai semak penuh sebelum lawatan pertama. Menelefon terlebih dahulu atau menyemak senarai semak semasa yang diterbitkan bank (ini kadangkala dikemas kini) sebelum menempah janji temu berbaloi dengan beberapa minit yang diambilnya.

Memiliki akaun perniagaan yang benar-benar dibuka dan berfungsi penting bukan sekadar untuk membayar pembekal — ia juga salah satu butiran yang menjadikan perniagaan kelihatan mantap dan patut dipercayai, yang sejajar secara semula jadi dengan [menyenaraikan perniagaan anda di sini](/ms/signup) sebaik sahaja asas operasi anda sudah teratur, dan wajar juga [melihat bagaimana PKS Malaysia lain mempersembahkan diri mereka](/ms) untuk mendapat gambaran bagaimana kehadiran awam sebuah perniagaan yang sudah lengkap ditubuhkan biasanya kelihatan.

## 5. Kekalkan Akaun Berguna, Bukan Sekadar Dibuka

Akaun yang dibuka kemudian jarang disentuh selain deposit sesekali, terlepas apa yang sebenarnya menjadi tujuannya. Beberapa tabiat yang wajar disediakan sejak hari pertama:

- **Asingkan setiap transaksi perniagaan daripada perbelanjaan peribadi**, walaupun bagi milikan tunggal yang tidak diwajibkan secara ketat oleh undang-undang — mencampurkan kedua-duanya adalah salah satu sebab paling biasa pembukuan dan pemfailan cukai menjadi lebih menyusahkan daripada sepatutnya kemudian.
- **Sediakan akses dalam talian/mudah alih dengan segera**, berbanding bergantung kepada lawatan cawangan secara lalai, kerana kebanyakan apa yang diperlukan oleh perniagaan yang berkembang (pemindahan, penyata, pembayaran pukal) adalah lebih pantas dan direkodkan dengan lebih baik secara digital.
- **Semak semula jenis akaun anda secara berkala apabila perniagaan berkembang** — akaun PKS asas yang sesuai pada jumlah transaksi rendah mungkin tidak lagi menjadi pilihan paling murah atau paling berfungsi sebaik sahaja jumlah atau baki melepasi ambang tertentu yang ditetapkan kebanyakan bank.

## Kesilapan Biasa Perniagaan Membuka Akaun

- **Muncul tanpa resolusi lembaga pengarah, bagi Sdn Bhd.** Mudah untuk menganggap kad pengenalan pengarah sahaja sudah memadai — sebenarnya tidak, dan satu dokumen yang hilang ini adalah sebab paling biasa pembukaan akaun syarikat tertangguh.
- **Membandingkan bank hanya berdasarkan deposit minimum.** Yuran transaksi dan keupayaan perbankan digital cenderung lebih penting berbanding angka pembukaan sekali sahaja sepanjang setahun penggunaan sebenar.
- **Mencampurkan perbelanjaan peribadi dan perniagaan daripada akaun yang sepatutnya memisahkan kedua-duanya.** Ia menggagalkan sebahagian besar tujuan memiliki akaun khusus pada mulanya, dan menjadikan pembukuan serta pemfailan cukai kemudian jauh lebih sukar daripada sepatutnya.

## Di Mana Harus Bermula Minggu Ini

- **Minggu ini:** Sahkan struktur perniagaan tepat anda (milikan tunggal, perkongsian, atau Sdn Bhd) dan kumpulkan senarai semak dokumen untuk kategori khusus itu daripada sekurang-kurangnya dua keperluan semasa yang diterbitkan bank.
- **Bagi Sdn Bhd:** Dapatkan resolusi lembaga pengarah yang memberi kuasa akaun dan menamakan penandatangan dirangka dan ditandatangani sebelum menempah janji temu — ini adalah langkah yang paling berkemungkinan menyebabkan kelewatan jika dibiarkan sehingga lawatan cawangan.
- **Sebelum memilih bank:** Bandingkan yuran transaksi dan ciri perbankan digital, bukan sekadar deposit minimum pembukaan, berbanding bagaimana perniagaan anda sebenarnya merancang untuk menggunakan akaun itu dari hari ke hari.
- **Sebaik sahaja dibuka:** Sediakan perbankan dalam talian dengan segera dan komited untuk mengekalkan setiap transaksi perniagaan berasingan daripada perbelanjaan peribadi sejak deposit pertama.

Memperbetulkan kerja kertas pada kali pertama adalah perbezaan antara akaun yang siap dalam minggu yang sama dan sebulan tolak-ansur — keperluannya tidak rumit, ia hanya perlu dikumpulkan dengan lengkap sebelum bank melihatnya.`,
        faqs: [
      {
        question: "Apakah dokumen yang diperlukan milikan tunggal untuk membuka akaun bank perniagaan di Malaysia?",
        answer:
          "Amnya MyKad anda sendiri (atau pasport, bagi pemilik asing), dokumen pendaftaran perniagaan SSM anda, dan bukti alamat perniagaan. Ini adalah keperluan dokumen paling ringan antara tiga struktur perniagaan utama.",
      },
      {
        question: "Apakah yang diperlukan Sdn Bhd yang tidak diperlukan milikan tunggal?",
        answer:
          "Sdn Bhd tambahan memerlukan Sijil Pemerbadanan, perlembagaan syarikat jika diguna pakai, resolusi lembaga pengarah yang memberi kuasa akaun dan menamakan penandatangan, dokumen pengenalan diri bagi setiap pengarah, dan dokumen pengenalan diri bagi pemegang saham yang memiliki pegangan yang bermakna. Ini mencerminkan bank yang secara bebas mengesahkan siapa yang boleh bertindak secara sah bagi entiti undang-undang yang berasingan.",
      },
      {
        question: "Mengapa resolusi lembaga pengarah begitu penting untuk akaun Sdn Bhd?",
        answer:
          "Ia adalah asas undang-undang sebenar bank untuk membenarkan individu tertentu yang dinamakan mengendalikan akaun bagi pihak syarikat — dokumen pengenalan diri pengarah sahaja tidak mencukupi. Ia juga dokumen yang paling kerap dilupakan oleh pengarah syarikat kali pertama, dan kebanyakan bank mempunyai templat mereka sendiri yang tersedia.",
      },
      {
        question: "Berapa lama masa diperlukan untuk membuka akaun bank perniagaan di Malaysia?",
        answer:
          "Akaun milikan tunggal atau perkongsian selalunya boleh dibuka dalam beberapa hari bekerja selepas permohonan yang lengkap, manakala langkah pengesahan tambahan Sdn Bhd biasanya menolak tempoh ini lebih jauh, biasa disebut sekitar seminggu hingga dua minggu. Dokumentasi tidak lengkap adalah punca paling biasa kelewatan melebihi lingkungan biasa ini.",
      },
      {
        question: "Patutkah saya terus membuka akaun perniagaan di bank peribadi saya?",
        answer:
          "Ia adalah titik permulaan yang munasabah, tetapi tidak semestinya pilihan terbaik — terma, yuran, dan alat digital akaun perniagaan biasanya ditetapkan oleh bahagian bank yang berbeza daripada perbankan peribadi, jadi membandingkan sekurang-kurangnya satu atau dua alternatif berbaloi dengan masa yang diambil sebelum membuat komitmen.",
      },
      {
        question: "Apakah yang perlu saya bandingkan antara bank selain deposit minimum?",
        answer:
          "Yuran transaksi bagi jenis pembayaran yang sebenarnya anda gunakan, keperluan baki minimum bulanan, keupayaan perbankan dalam talian/mudah alih (terutamanya pembayaran pukal dan integrasi perisian perakaunan), dan masa pemprosesan atau pilihan pengambilan pelanggan digital. Ini cenderung lebih penting berbanding angka deposit pembukaan sekali sahaja sepanjang setahun penggunaan sebenar.",
      },
      {
        question: "Adakah bank kini meminta Nombor Pengenalan Cukai (TIN) semasa membuka akaun perniagaan?",
        answer:
          "Semakin kerap, ya — ini berkait dengan dorongan yang lebih luas ke arah e-Invois dan pautan pematuhan cukai yang lebih ketat antara sistem kerajaan dan perbankan. Menyediakan TIN anda sebelum memohon membantu mengelakkan satu lagi lawatan.",
      },
      {
        question: "Adakah penting untuk mengasingkan perbelanjaan perniagaan dan peribadi, walaupun bagi milikan tunggal?",
        answer:
          "Ya, walaupun undang-undang tidak mewajibkannya secara ketat bagi milikan tunggal. Mencampurkan kedua-duanya adalah salah satu sebab paling biasa pembukuan dan pemfailan cukai menjadi rumit secara tidak perlu kemudian, jadi akaun perniagaan khusus berbaloi digunakan secara konsisten sejak deposit pertama.",
      },
        ],
      },
    },
  },
  {
    slug: "trademark-registration-in-malaysia",
    title: "Trademark Registration in Malaysia: Protecting Your Business Name and Logo",
    seoTitle: "Trademark Registration in Malaysia: MyIPO Guide",
    seoDescription:
      "How trademark registration with MyIPO differs from SSM registration, the clearance search and classification process, and what it costs and takes.",
    coverImage: {
      file: "trademark-registration-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A confident small business owner looking proudly at their own logo on a tablet",
      altTranslations: {
        zh: "一位自信的小企业主自豪地在平板电脑上查看自己的标志",
        ms: "Seorang pemilik perniagaan kecil yang yakin melihat logo perniagaannya sendiri dengan bangga pada tablet",
      },
    },
    contentImages: {
      search: {
        file: "trademark-registration-in-malaysia-search.webp",
        mimeType: "image/webp",
        alt: "A business owner searching on a laptop at a desk",
        altTranslations: {
          zh: "一位企业主在办公桌前用笔记本电脑进行检索",
          ms: "Seorang pemilik perniagaan membuat carian pada komputer riba di sebuah meja",
        },
        after: "Before filing, search MyIPO's trademark database (and ideally a broader web/business-name search) for anything identical or confusingly similar to your proposed mark, in the classes relevant to your business.",
        afterTranslations: {
          zh: "在提交申请之前,请在 MyIPO 的商标数据库中(最好也进行更广泛的网络/企业名称搜索)检索是否已有与您拟用标记完全相同或容易混淆的内容,并限定在与您企业相关的类别范围内。",
          ms: "Sebelum memfailkan, cari pangkalan data tanda dagangan MyIPO (dan sebaik-baiknya carian web/nama perniagaan yang lebih luas) untuk apa-apa yang sama atau mengelirukan serupa dengan tanda yang anda cadangkan, dalam kelas yang berkaitan dengan perniagaan anda.",
        },
      },
    },
    excerpt:
      "Registering a business with SSM doesn't make its name or logo legally exclusive to you — only a registered trademark through MyIPO does that. This guide covers when registration is worth it, how the clearance search and classification process works, and what it realistically costs and takes.",
    body: `A surprising number of Malaysian business owners assume that registering a company with SSM also protects the business name and logo the way a trademark does. It doesn't — SSM registration confirms your business exists and is legally allowed to trade under that name, but it does nothing to stop another business in a different state, or even the same street, from using a confusingly similar name or logo for the same kind of goods or services. Trademark registration, handled by a completely separate body (MyIPO, the Intellectual Property Corporation of Malaysia), is what actually gives you an exclusive legal right to a brand. This guide covers when that distinction actually matters for an SME, how the registration process works, and what it realistically costs and takes.

## 1. Understand what SSM registration doesn't protect

SSM's business and company registration checks that your proposed name isn't already taken by another registered entity — but that check is against other registered names, not against trademarks, and it says nothing about logos, taglines, or product names at all. Two completely unrelated businesses, registered years apart under SSM, can legally hold very similar trading names if neither has gone on to register a trademark.

This becomes a real problem the moment your business is successful enough that someone else wants to trade on its reputation — a copycat competitor using a similar name, a counterfeit product carrying your logo, or simply another business genuinely unaware of you adopting a name close enough to cause customer confusion. Without a registered trademark, your main recourse is the common-law tort of "passing off," which requires proving you've built up real reputation under the mark — a slower, costlier, and less certain fight than simply pointing to a trademark certificate.

## 2. Decide whether registration is actually worth it for your business

Not every business needs to register a trademark immediately, and it's worth being honest about where you actually sit before spending the money.

### Registration is clearly worth prioritizing if:
- You're building a brand you intend to franchise, license, or expand into other states or countries.
- Your name, logo, or product branding is a meaningful part of how customers choose you over a competitor (as opposed to, say, a purely local service business where reputation travels by word of mouth and location).
- You've noticed, or expect, direct competitors in your exact space who might be tempted to ride on your branding once it gains traction.

### It's reasonable to delay if:
- You're pre-revenue or still actively iterating on your name or branding — registering now just means potentially re-registering later at full cost.
- Your business is small, hyper-local, and unlikely to face brand confusion with anyone outside your immediate area.

> A trademark doesn't protect an idea or a product — it protects a specific mark (a name, logo, or combination) tied to specific classes of goods or services. Before spending on registration, be clear on exactly what mark, in exactly what form, you actually want locked down, since that's what gets examined and, eventually, protected.

## 3. Do a clearance search before you file

Before filing, search MyIPO's trademark database (and ideally a broader web/business-name search) for anything identical or confusingly similar to your proposed mark, in the classes relevant to your business. This matters for two reasons: it tells you whether your own mark is likely to get opposed or refused, and it flags whether you might already be infringing someone else's registered mark without realizing it — a far cheaper problem to discover now than after you've built a brand around it.

### A DIY search isn't the same as a professional clearance search
MyIPO's own database search is free and a reasonable first pass, but it only catches exact or near-exact matches in its own records — it won't catch an unregistered but actively-used similar name, a mark pending examination that hasn't published yet, or a close phonetic/visual similarity a human examiner might flag. For a brand you're genuinely committing to, a trademark agent's professional clearance search is worth the added cost precisely because it catches what a free database search misses.

## 4. Get your classes right — this is where most first-time filers go wrong

Malaysia uses the Nice Classification system, which groups every type of goods and service into one of 45 numbered classes. Your trademark application is filed against specific classes, and protection only extends to the classes you've actually registered in — a mark registered for restaurant services (one class) gives you no protection if someone else uses a similar mark for clothing (a different class entirely), even if it's the exact same name.

### Common classification mistakes
- **Registering too narrowly**, missing a class your business is likely to expand into, and having to file (and pay) again later.
- **Registering too broadly**, in classes you'll never actually use, which adds cost without adding real protection.
- **Describing goods/services too vaguely**, which examiners can query or reject, slowing down the whole application.

A multi-class application (listing several relevant classes in one filing) is allowed and common — MyIPO charges per class rather than per application, so the cost scales with how many classes you genuinely need, not with how many separate applications you file.

MyIPO has also offered a reduced per-class fee for smaller applicants in the past, tied to an annual turnover threshold — confirm on MyIPO's own fee schedule whether such a concession currently applies and what the qualifying turnover figure is, since this kind of SME-targeted discount is exactly the sort of detail that gets introduced, adjusted, or removed over time.

## 5. What the filing and examination process actually involves

1. **File the application** through MyIPO's online IP portal (or on paper), specifying the mark, the classes, and the applicant's details.
2. **Formality and substantive examination** — MyIPO checks the application is complete and then examines whether the mark is actually registrable: distinctive enough, not confusingly similar to an existing registered mark, and not falling into a prohibited category (purely descriptive terms, for instance, are a common reason for refusal).
3. **Publication in the Official Journal** — once accepted, the mark is published for a window during which any third party can file an opposition if they believe it conflicts with their own rights.
4. **Registration**, if no opposition is filed (or if an opposition is resolved in your favor).

### Set your expectations on timeline realistically
A straightforward, unopposed application commonly takes well over a year from filing to final registration — sources vary, but ranges well into the double digits of months are typical, not the few weeks a first-time applicant sometimes expects. Confirm current processing times on MyIPO's own portal rather than planning a launch around an assumed date, since examination backlogs and opposition timelines both vary.

Protecting your brand on paper matters more once people can actually find you using it — [a free, verified listing here](/en/signup) is one more place your registered business name and branding show up consistently, and it's worth [seeing how other Malaysian businesses present their branding](/en) once their trademark and public presence are both in order.

## 6. Know what registration actually gives you — and what it doesn't

A registered trademark gives you the exclusive right to use that mark for the registered classes nationwide, the ability to license or sell the mark as an asset, standing to take direct legal action (rather than the harder passing-off route) against infringers, and the right to use the ® symbol once registration is granted.

What it doesn't give you: protection outside Malaysia (trademark rights are territorial — a separate application, or an international filing route, is needed for other countries), protection for classes you haven't registered in, or protection against a name that's merely similar in spirit but genuinely distinguishable to an average consumer. It's also not permanent without upkeep — registration needs periodic renewal to stay valid, generally filed through MyIPO's portal ahead of the expiry date, with a grace period available (at a higher fee) if a renewal is filed late.

## Common mistakes businesses make with trademark registration

- **Assuming SSM registration already protects the brand.** It confirms your business name is registered, not that your name or logo is legally exclusive to you — those are two entirely different protections from two entirely different bodies.
- **Filing in the wrong classes, or too few of them.** Protection is scoped exactly to what you've registered; a mark that's strong in theory but filed under the wrong class offers little real protection for how your business actually operates.
- **Skipping the clearance search to save time or money upfront.** Discovering a conflict during MyIPO's own examination, or worse, after launch, costs far more in delay and rebranding than a proper search would have cost at the start.

## Where to start this week

- **This week:** Search MyIPO's trademark database for your proposed name/logo, and separately search the general web and business registries for anything similar in your industry.
- **If the search comes back clear:** List out every class of goods or services genuinely relevant to your business now and over the next few years, so your filing covers what you'll actually need.
- **Before filing:** Decide whether to file yourself through MyIPO's portal or use a trademark agent — a professional clearance search and filing review is worth it for a brand you're genuinely committing to long-term.
- **After filing:** Note the publication date once your application is accepted, and keep an eye on the Official Journal during the opposition window, since that's the stage where a genuine conflict is most likely to surface.

Registering early, before a brand has real value worth fighting over, is almost always cheaper and simpler than registering after a dispute has already started — the paperwork doesn't get any easier by waiting, and the thing you're protecting only gets more valuable.`,
    faqs: [
      {
        question: "Does registering my company with SSM also protect my business name as a trademark?",
        answer:
          "No. SSM registration only confirms your business name isn't already taken by another registered entity and that you're legally allowed to trade under it — it does nothing to stop a different business from using a confusingly similar name, logo, or tagline. Only a registered trademark through MyIPO gives you an exclusive legal right to a brand.",
      },
      {
        question: "How much does trademark registration cost in Malaysia?",
        answer:
          "MyIPO charges a fee per class of goods or services, commonly cited around several hundred ringgit per class, with a reduced rate sometimes available for smaller applicants below a turnover threshold. Confirm the current fee schedule directly on MyIPO's portal, since fees and any SME concessions are revised from time to time.",
      },
      {
        question: "How long does trademark registration take in Malaysia?",
        answer:
          "A straightforward, unopposed application commonly takes well over a year from filing to final registration, running through formality examination, substantive examination, and a publication/opposition period. Confirm current processing times on MyIPO's own portal rather than planning around an assumed date, since backlogs and opposition timelines vary.",
      },
      {
        question: "What is a clearance search, and do I really need one?",
        answer:
          "A clearance search checks whether an identical or confusingly similar mark already exists before you file, reducing the risk of opposition, refusal, or accidentally infringing someone else's existing mark. MyIPO's own free database search is a reasonable first pass, but a professional agent's clearance search catches more — unregistered but actively used names, pending applications, and close phonetic or visual similarities — and is worth it for a brand you're genuinely committing to.",
      },
      {
        question: "What are trademark classes, and why do they matter?",
        answer:
          "Malaysia uses the Nice Classification system, which groups all goods and services into 45 numbered classes, and your protection only extends to the classes you've actually registered in. A mark registered for one class (say, restaurant services) gives no protection against a similar mark used for an unrelated class (say, clothing), even with an identical name.",
      },
      {
        question: "Can I register a trademark for multiple classes in one application?",
        answer:
          "Yes, a multi-class application listing several relevant classes in a single filing is allowed and common. MyIPO charges per class rather than per application, so the cost scales with how many classes you actually need rather than how many separate filings you submit.",
      },
      {
        question: "Does a Malaysian trademark protect my brand in other countries?",
        answer:
          "No. Trademark rights are territorial, so a Malaysian registration only protects you within Malaysia — protecting your brand elsewhere requires a separate application in that country or an international filing route. If you plan to expand regionally or globally, this is worth planning for early.",
      },
      {
        question: "Do I need to renew a trademark registration, or is it permanent once granted?",
        answer:
          "Registration isn't permanent without upkeep — it needs periodic renewal to stay valid, generally filed through MyIPO ahead of the expiry date. A grace period is available at a higher fee if a renewal is filed late, but letting it lapse entirely means losing the protection.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚商标注册:保护您的企业名称与标志",
        excerpt:
          "向 SSM 注册企业,并不会让您的名称或标志在法律上归您独家所有——只有通过 MyIPO 注册商标才能做到这一点。本指南说明何时值得注册、清查检索与分类流程如何运作,以及实际需要花费多少成本和时间。",
        body: `不少马来西亚企业主以为,向 SSM 注册公司,也能像商标一样保护企业名称和标志。事实并非如此——SSM 注册只是确认您的企业确实存在,并且合法可以用该名称经营,但它完全无法阻止另一家位于不同州属、甚至同一条街上的企业,针对同类商品或服务使用一个容易混淆的相似名称或标志。商标注册由一个完全独立的机构(马来西亚知识产权局 MyIPO)负责,它才是真正赋予您对一个品牌享有专属法律权利的途径。本指南将说明这个区别对中小企业何时真正重要、注册流程如何运作,以及实际需要花费多少成本和时间。

## 1. 了解 SSM 注册无法保护的部分

SSM 的商业与公司注册,只会核实您拟用的名称是否已被另一个已注册实体占用——但这项核查只针对其他已注册名称,并不涉及商标,也完全不涉及标志、广告语或产品名称。两家完全不相关的企业,即便在 SSM 注册时间相隔多年,也完全可能合法持有非常相似的经营名称,只要两者都没有去注册商标。

一旦您的企业成功到足以让别人想借其声誉获利,这就会变成一个真正的问题——可能是使用相似名称的山寨竞争对手、冒用您标志的仿冒产品,又或者只是另一家企业确实不知情地采用了一个足以让顾客混淆的相近名称。在没有注册商标的情况下,您主要的救济途径是普通法上的"假冒"(passing off)侵权之诉,这需要您证明自己已经在该商标下建立起真实的声誉——这远比直接出示一张商标注册证书要来得缓慢、昂贵,结果也更不确定。

## 2. 判断注册对您的企业是否真的划算

并非每家企业都需要立即注册商标,在花钱之前,诚实评估自己实际所处的阶段是值得的。

### 以下情况明显值得优先注册:
- 您正在打造一个计划日后特许经营、授权,或拓展到其他州属甚至其他国家的品牌。
- 您的名称、标志或产品品牌,是顾客在您和竞争对手之间做选择时的重要考量因素(而不是像纯粹依靠口碑和地理位置传播的本地服务型企业那样)。
- 您已经注意到,或预期在自己所在的确切领域会出现直接竞争对手,一旦您的品牌站稳脚跟,他们可能会被诱惑搭您品牌的便车。

### 以下情况可以合理地延后:
- 您的企业尚未产生营收,或仍在积极调整自己的名称或品牌——现在注册,很可能意味着日后还要全额再注册一次。
- 您的企业规模小、高度本地化,不太可能与您所在范围之外的任何人发生品牌混淆的情况。

> 商标保护的不是一个创意或一款产品——它保护的是绑定在特定商品或服务类别上的某个具体标记(名称、标志,或二者的组合)。在花钱注册之前,先清楚您实际想要锁定的,到底是什么标记、以什么具体形式呈现,因为这正是日后会被审查、并最终受到保护的对象。

## 3. 提交申请前,先做一次清查检索

在提交申请之前,请在 MyIPO 的商标数据库中(最好也进行更广泛的网络/企业名称搜索)检索是否已有与您拟用标记完全相同或容易混淆的内容,并限定在与您企业相关的类别范围内。这一点很重要,原因有二:它能告诉您自己的标记是否有可能遭到异议或驳回;也能提醒您,是否可能在不知情的情况下已经侵犯了他人已注册的商标——现在发现这个问题的成本,远比等到您已经围绕它打造出品牌之后才发现要低得多。

### 自行检索与专业清查检索并不相同
MyIPO 自己的数据库检索是免费的,作为初步筛查是合理的,但它只能捕捉到自身记录中完全相同或近乎相同的内容——它捕捉不到尚未注册但正在实际使用的相似名称,也捕捉不到正在审查、尚未公告的待批标记,更捕捉不到人工审查员可能会标记出来的语音或视觉上的相近之处。对于您真正打算长期投入的品牌来说,商标代理人提供的专业清查检索,正是因为能捕捉到免费数据库检索所遗漏的内容,才值得多花这笔钱。

## 4. 把类别选对——这是首次申请者最常出错的地方

马来西亚采用尼斯分类(Nice Classification)制度,将每一类商品和服务归入45个编号类别中的某一类。您的商标申请是针对特定类别提交的,保护范围也仅延伸至您实际注册的类别——一个为餐饮服务(一个类别)注册的商标,如果有人针对服装(完全不同的另一个类别)使用相似标记,即便名称完全相同,您也没有任何保护可言。

### 常见的分类错误
- **注册范围过窄**,遗漏了企业未来可能拓展进入的类别,日后不得不重新提交申请(并再次付费)。
- **注册范围过宽**,涵盖了您实际上永远不会用到的类别,只增加成本却没有增加实际保护。
- **商品/服务描述过于模糊**,审查员可能会就此提出质询或驳回,拖慢整个申请流程。

一次申请涵盖多个类别(在一份申请中列出若干相关类别)是被允许且常见的做法——MyIPO 是按类别收费,而不是按申请件数收费,所以成本会随着您真正需要的类别数量而变化,而不是随您提交了多少份独立申请而变化。

MyIPO 过去也曾针对规模较小的申请人,按年度营业额门槛提供过较低的单类别费率——请到 MyIPO 自己的收费表上核实,目前是否仍有这类优惠,以及符合资格的营业额具体数字,因为这类专门面向中小企业的折扣,正是会随时间被推出、调整或取消的细节。

## 5. 提交申请与审查流程实际包括哪些步骤

1. **提交申请**——通过 MyIPO 的在线知识产权平台(或以纸质方式),列明标记内容、类别以及申请人信息。
2. **形式审查与实质审查**——MyIPO 先核实申请文件是否完整,然后审查该标记是否真正具备可注册性:显著性是否足够、是否与已注册商标构成混淆性近似,以及是否落入被禁止的类别(例如,纯描述性词语就是常见的驳回原因)。
3. **在官方公报上公告**——一旦获接受,该标记会进入一段公告期,在此期间任何第三方如认为该标记与自身权利冲突,均可提出异议。
4. **注册完成**,前提是没有人提出异议(或异议已以对您有利的方式解决)。

### 对时间线要有切合实际的预期
一份顺利、未遭异议的申请,从提交到最终注册,通常会耗时超过一年——不同来源给出的数字有所差异,但普遍落在两位数的月份区间,而不是首次申请者有时以为的短短几周。请直接以 MyIPO 官方平台公布的当前处理时间为准来规划,而不要按假设的日期安排开业计划,因为审查积压和异议处理的时间都会有所波动。

一旦人们能够真正用这个名称找到您,把品牌在纸面上保护好就变得更加重要——[在这里建立一份免费、经过核实的列表](/zh/signup)是让您已注册的企业名称和品牌在更多地方一致出现的又一种方式,也值得[看看其他马来西亚企业在商标和公开形象都已理顺之后,是如何展示自己品牌的](/zh)。

## 6. 弄清楚注册到底能给您带来什么——又不能给您带来什么

注册商标能让您在全国范围内,针对已注册的类别,享有该标记的专属使用权;能将该商标作为资产进行授权或转让出售;能让您在对抗侵权者时直接提起法律诉讼(而不必走更艰难的"假冒"诉讼路径);并且在注册获批后,有权使用 ® 标志。

它不能给您带来的是:马来西亚境外的保护(商标权具有地域性——在其他国家需要单独申请,或通过国际申请途径办理)、您未曾注册的类别的保护,以及针对那些精神上相似、但对一般消费者而言确实能够区分开来的名称的保护。它也并非一劳永逸、无需维护——注册需要定期续展才能继续有效,通常在到期日之前通过 MyIPO 平台办理,若逾期办理续展,则可在缴纳更高费用的前提下,适用一段宽限期。

## 企业在商标注册上最常犯的错误

- **以为 SSM 注册已经保护了品牌。** 它只能确认您的企业名称已经注册,并不代表您的名称或标志在法律上归您独家所有——这是两个完全独立机构提供的两种完全不同的保护。
- **注册在错误的类别,或类别数量太少。** 保护范围精确对应您实际注册的内容;一个理论上很强、但注册在错误类别下的标记,对您企业实际的运营方式而言,几乎起不到真正的保护作用。
- **为了省时省钱,一开始就跳过清查检索。** 在 MyIPO 自己的审查阶段才发现冲突,或者更糟糕的是,在品牌已经推出之后才发现,所造成的延误和重新塑造品牌的成本,远远高于一开始好好做一次检索的费用。

## 本周可以从这里开始

- **本周:** 在 MyIPO 商标数据库中检索您拟用的名称/标志,并另外在普通网络和企业注册记录中,检索您所在行业是否已有类似的内容。
- **如果检索结果显示没有冲突:** 列出目前以及未来几年内,与您企业真正相关的每一个商品或服务类别,确保您的申请涵盖日后实际会用到的范围。
- **在提交申请之前:** 决定是自行通过 MyIPO 平台提交,还是委托商标代理人办理——对于您真正打算长期投入的品牌而言,专业的清查检索和申请审核是值得的投入。
- **提交申请之后:** 记下申请获接受后的公告日期,并在异议期内留意官方公报,因为这正是真正的冲突最有可能浮现的阶段。

在品牌真正具有值得去争取的价值之前就提前注册,几乎总是比纠纷已经发生之后才注册来得更便宜、更简单——等待并不会让这些手续变得更容易,而您正在保护的东西,只会随着时间变得越来越有价值。`,
        faqs: [
      {
        question: "向 SSM 注册公司,是否也能让我的企业名称获得商标式的保护?",
        answer:
          "不能。SSM 注册只能确认您的企业名称尚未被其他已注册实体占用,并且您可以合法以该名称经营——它完全无法阻止另一家企业使用容易混淆的相似名称、标志或广告语。只有通过 MyIPO 注册商标,才能让您对一个品牌享有专属法律权利。",
      },
      {
        question: "在马来西亚注册商标需要多少费用?",
        answer:
          "MyIPO 按商品或服务类别收费,常见说法是每个类别数百令吉左右,对于营业额低于某个门槛的较小申请人,有时还提供较低的费率。请直接到 MyIPO 平台核实当前的收费表,因为费用以及任何中小企业优惠都会不时调整。",
      },
      {
        question: "在马来西亚注册商标需要多长时间?",
        answer:
          "一份顺利、未遭异议的申请,从提交到最终注册,通常会耗时超过一年,需经过形式审查、实质审查,以及公告/异议期。请以 MyIPO 官方平台公布的当前处理时间为准来规划,而不要按假设的日期安排,因为审查积压和异议处理的时间都会有所波动。",
      },
      {
        question: "什么是清查检索?我真的需要做吗?",
        answer:
          "清查检索是在您提交申请之前,核查是否已存在完全相同或容易混淆的相似标记,从而降低遭到异议、驳回,或无意中侵犯他人现有商标的风险。MyIPO 自己的免费数据库检索,作为初步筛查是合理的,但专业代理人提供的清查检索能捕捉到更多——尚未注册但正在实际使用的名称、正在审查中的申请,以及语音或视觉上的相近之处——对于您真正打算长期投入的品牌而言,这笔投入是值得的。",
      },
      {
        question: "什么是商标类别?为什么它很重要?",
        answer:
          "马来西亚采用尼斯分类制度,将所有商品和服务归入45个编号类别,您的保护范围仅延伸至您实际注册的类别。一个为某一类别(比如餐饮服务)注册的商标,对用于不相关类别(比如服装)的相似商标没有任何保护作用,即便名称完全相同。",
      },
      {
        question: "我可以在一份申请中为多个类别注册商标吗?",
        answer:
          "可以,在一份申请中列出若干相关类别的多类别申请是被允许且常见的做法。MyIPO 是按类别收费,而不是按申请件数收费,所以成本会随您实际需要的类别数量而变化,而不是随您提交了多少份独立申请而变化。",
      },
      {
        question: "马来西亚的商标注册能保护我的品牌在其他国家的权益吗?",
        answer:
          "不能。商标权具有地域性,马来西亚的注册只能在马来西亚境内保护您——要在其他地方保护您的品牌,需要在该国单独申请,或通过国际申请途径办理。如果您计划拓展到区域或全球市场,这一点值得提早规划。",
      },
      {
        question: "商标注册需要续展吗,还是一旦获批就永久有效?",
        answer:
          "注册并非一劳永逸、无需维护——需要定期续展才能继续有效,通常在到期日之前通过 MyIPO 办理。如果逾期办理续展,可在缴纳更高费用的前提下适用一段宽限期,但如果完全放任失效,就意味着失去这份保护。",
      },
        ],
      },
      ms: {
        title: "Pendaftaran Tanda Dagangan di Malaysia: Melindungi Nama dan Logo Perniagaan Anda",
        excerpt:
          "Mendaftarkan perniagaan dengan SSM tidak menjadikan nama atau logonya secara sah eksklusif kepada anda — hanya tanda dagangan berdaftar melalui MyIPO yang berbuat demikian. Panduan ini merangkumi bila pendaftaran berbaloi, bagaimana proses carian kelegaan dan klasifikasi berfungsi, dan kos serta masa yang secara realistiknya diperlukan.",
        body: `Ramai pemilik perniagaan Malaysia yang mengejutkan menganggap bahawa mendaftarkan syarikat dengan SSM turut melindungi nama dan logo perniagaan sebagaimana sesuatu tanda dagangan. Hakikatnya tidak begitu — pendaftaran SSM mengesahkan bahawa perniagaan anda wujud dan dibenarkan secara sah berniaga menggunakan nama tersebut, tetapi ia tidak menghalang langsung perniagaan lain di negeri berlainan, atau malah di jalan yang sama, daripada menggunakan nama atau logo yang mengelirukan dan serupa untuk jenis barangan atau perkhidmatan yang sama. Pendaftaran tanda dagangan, yang dikendalikan oleh badan yang sama sekali berasingan (MyIPO, Perbadanan Harta Intelek Malaysia), adalah apa yang sebenarnya memberikan anda hak eksklusif dari segi undang-undang ke atas sesebuah jenama. Panduan ini merangkumi bila perbezaan ini sebenarnya penting bagi PKS, bagaimana proses pendaftaran berfungsi, dan kos serta masa yang secara realistiknya diperlukan.

## 1. Fahami Apa yang Tidak Dilindungi oleh Pendaftaran SSM

Pendaftaran perniagaan dan syarikat SSM menyemak sama ada nama yang anda cadangkan sudah diambil oleh entiti berdaftar lain — tetapi semakan itu adalah terhadap nama berdaftar lain, bukan terhadap tanda dagangan, dan ia langsung tidak menyentuh logo, slogan, atau nama produk. Dua perniagaan yang sama sekali tidak berkaitan, didaftarkan bertahun-tahun berbeza di bawah SSM, boleh secara sah memegang nama perdagangan yang sangat serupa selagi tiada satu pun daripadanya mendaftarkan tanda dagangan.

Ini menjadi masalah sebenar sebaik sahaja perniagaan anda cukup berjaya sehingga seseorang lain mahu menumpang reputasinya — pesaing peniru yang menggunakan nama serupa, produk tiruan yang membawa logo anda, atau sekadar perniagaan lain yang benar-benar tidak sedar mengambil nama yang cukup hampir untuk mengelirukan pelanggan. Tanpa tanda dagangan berdaftar, jalan utama anda adalah tort undang-undang lazim "passing off," yang memerlukan anda membuktikan anda telah membina reputasi sebenar di bawah tanda itu — pertarungan yang lebih perlahan, lebih mahal, dan kurang pasti berbanding sekadar menunjukkan sijil tanda dagangan.

## 2. Tentukan Sama Ada Pendaftaran Benar-Benar Berbaloi untuk Perniagaan Anda

Tidak setiap perniagaan perlu mendaftarkan tanda dagangan dengan segera, dan wajar bersikap jujur tentang di mana kedudukan sebenar anda sebelum membelanjakan wang.

### Pendaftaran jelas wajar diutamakan jika:
- Anda sedang membina jenama yang anda berhasrat untuk difranchiskan, dilesenkan, atau diperluas ke negeri atau negara lain.
- Nama, logo, atau penjenamaan produk anda adalah bahagian bermakna dalam cara pelanggan memilih anda berbanding pesaing (berbanding, katakanlah, perniagaan perkhidmatan tempatan semata-mata di mana reputasi tersebar melalui mulut ke mulut dan lokasi).
- Anda telah menyedari, atau menjangkakan, pesaing langsung dalam ruang anda yang tepat yang mungkin tergoda untuk menumpang penjenamaan anda sebaik sahaja ia mendapat momentum.

### Wajar untuk ditangguhkan jika:
- Anda belum menjana hasil atau masih aktif meminda nama atau penjenamaan anda — mendaftar sekarang mungkin hanya bermakna berpotensi mendaftar semula kemudian dengan kos penuh.
- Perniagaan anda kecil, sangat tempatan, dan tidak berkemungkinan menghadapi kekeliruan jenama dengan sesiapa di luar kawasan terdekat anda.

> Tanda dagangan tidak melindungi idea atau produk — ia melindungi tanda tertentu (nama, logo, atau gabungan) yang terikat kepada kelas barangan atau perkhidmatan tertentu. Sebelum membelanjakan untuk pendaftaran, jelaskan dengan tepat tanda apa, dalam bentuk apa, yang sebenarnya anda mahu kunci, kerana itulah yang akan diperiksa dan, akhirnya, dilindungi.

## 3. Jalankan Carian Kelegaan Sebelum Memfailkan

Sebelum memfailkan, cari pangkalan data tanda dagangan MyIPO (dan sebaik-baiknya carian web/nama perniagaan yang lebih luas) untuk apa-apa yang sama atau mengelirukan serupa dengan tanda yang anda cadangkan, dalam kelas yang berkaitan dengan perniagaan anda. Ini penting atas dua sebab: ia memberitahu anda sama ada tanda anda sendiri berkemungkinan dibantah atau ditolak, dan ia menandakan sama ada anda mungkin sudah melanggar tanda berdaftar orang lain tanpa menyedarinya — masalah yang jauh lebih murah untuk ditemui sekarang berbanding selepas anda membina jenama di sekelilingnya.

### Carian Sendiri Bukan Sama dengan Carian Kelegaan Profesional
Carian pangkalan data MyIPO sendiri adalah percuma dan merupakan semakan awal yang munasabah, tetapi ia hanya menangkap padanan tepat atau hampir tepat dalam rekodnya sendiri — ia tidak akan menangkap nama serupa yang tidak berdaftar tetapi digunakan secara aktif, tanda yang masih dalam pemeriksaan dan belum diterbitkan, atau persamaan fonetik/visual hampir yang mungkin ditandakan oleh pemeriksa manusia. Bagi jenama yang benar-benar anda komited, carian kelegaan profesional oleh ejen tanda dagangan berbaloi dengan kos tambahan justeru kerana ia menangkap apa yang terlepas oleh carian pangkalan data percuma.

## 4. Betulkan Kelas Anda — Di Sinilah Kebanyakan Pemfail Kali Pertama Tersilap

Malaysia menggunakan sistem Klasifikasi Nice, yang mengumpulkan setiap jenis barangan dan perkhidmatan ke dalam salah satu daripada 45 kelas bernombor. Permohonan tanda dagangan anda difailkan terhadap kelas tertentu, dan perlindungan hanya meliputi kelas yang sebenarnya anda daftarkan — tanda yang didaftarkan untuk perkhidmatan restoran (satu kelas) tidak memberikan sebarang perlindungan jika seseorang lain menggunakan tanda serupa untuk pakaian (kelas yang sama sekali berbeza), walaupun ia nama yang sama persis.

### Kesilapan Klasifikasi Biasa
- **Mendaftar terlalu sempit**, terlepas kelas yang perniagaan anda berkemungkinan berkembang ke dalamnya, dan terpaksa memfailkan (serta membayar) semula kemudian.
- **Mendaftar terlalu luas**, dalam kelas yang anda tidak akan pernah gunakan, yang menambah kos tanpa menambah perlindungan sebenar.
- **Menggambarkan barangan/perkhidmatan terlalu kabur**, yang boleh dipersoalkan atau ditolak oleh pemeriksa, melambatkan keseluruhan permohonan.

Permohonan berbilang kelas (menyenaraikan beberapa kelas berkaitan dalam satu pemfailan) dibenarkan dan biasa — MyIPO mengenakan caj mengikut kelas berbanding mengikut permohonan, jadi kos berskala mengikut berapa banyak kelas yang sebenarnya anda perlukan, bukan berapa banyak permohonan berasingan yang anda failkan.

MyIPO juga pernah menawarkan kadar caj sekelas yang dikurangkan bagi pemohon yang lebih kecil, terikat kepada ambang hasil jualan tahunan — sahkan pada jadual yuran MyIPO sendiri sama ada konsesi sedemikian terpakai sekarang dan apakah angka hasil jualan yang layak, kerana diskaun yang disasarkan khusus untuk PKS ini adalah jenis butiran yang diperkenalkan, dilaraskan, atau dimansuhkan dari semasa ke semasa.

## 5. Apa yang Sebenarnya Terlibat dalam Proses Pemfailan dan Pemeriksaan

1. **Failkan permohonan** melalui portal harta intelek dalam talian MyIPO (atau di atas kertas), menyatakan tanda, kelas, dan butiran pemohon.
2. **Pemeriksaan formaliti dan substantif** — MyIPO menyemak permohonan lengkap dan kemudian memeriksa sama ada tanda itu sebenarnya boleh didaftarkan: cukup tersendiri, tidak mengelirukan serupa dengan tanda berdaftar sedia ada, dan tidak jatuh ke dalam kategori yang dilarang (istilah yang semata-mata deskriptif, misalnya, adalah sebab biasa penolakan).
3. **Penerbitan dalam Jurnal Rasmi** — sebaik sahaja diterima, tanda itu diterbitkan untuk satu tempoh di mana mana-mana pihak ketiga boleh memfailkan bantahan jika mereka percaya ia bercanggah dengan hak mereka sendiri.
4. **Pendaftaran**, jika tiada bantahan difailkan (atau jika bantahan diselesaikan memihak kepada anda).

### Tetapkan Jangkaan Anda tentang Garis Masa secara Realistik
Permohonan yang mudah dan tidak dibantah biasanya mengambil masa lebih setahun dari pemfailan hingga pendaftaran akhir — sumber berbeza-beza, tetapi julat yang jauh ke dalam dua digit bulan adalah biasa, bukan beberapa minggu yang kadangkala dijangkakan oleh pemohon kali pertama. Sahkan masa pemprosesan semasa di portal MyIPO sendiri berbanding merancang pelancaran berdasarkan tarikh yang diandaikan, kerana kelewatan pemeriksaan dan garis masa bantahan kedua-duanya berbeza-beza.

Melindungi jenama anda di atas kertas menjadi lebih penting sebaik sahaja orang ramai benar-benar boleh menemui anda menggunakannya — [penyenaraian percuma dan disahkan di sini](/ms/signup) adalah satu lagi tempat nama perniagaan berdaftar dan penjenamaan anda muncul secara konsisten, dan wajar juga [melihat bagaimana perniagaan Malaysia lain mempersembahkan penjenamaan mereka](/ms) sebaik sahaja tanda dagangan dan kehadiran awam mereka kedua-duanya teratur.

## 6. Ketahui Apa yang Sebenarnya Diberikan oleh Pendaftaran — dan Apa yang Tidak

Tanda dagangan berdaftar memberikan anda hak eksklusif untuk menggunakan tanda itu bagi kelas berdaftar di seluruh negara, keupayaan untuk melesenkan atau menjual tanda itu sebagai aset, kedudukan untuk mengambil tindakan undang-undang langsung (berbanding laluan passing-off yang lebih sukar) terhadap pelanggar, dan hak untuk menggunakan simbol ® sebaik sahaja pendaftaran diluluskan.

Apa yang ia tidak berikan kepada anda: perlindungan di luar Malaysia (hak tanda dagangan bersifat wilayah — permohonan berasingan, atau laluan pemfailan antarabangsa, diperlukan untuk negara lain), perlindungan untuk kelas yang anda belum daftarkan, atau perlindungan terhadap nama yang sekadar serupa dari segi semangat tetapi benar-benar boleh dibezakan oleh pengguna biasa. Ia juga tidak kekal tanpa penyelenggaraan — pendaftaran memerlukan pembaharuan berkala untuk kekal sah, biasanya difailkan melalui portal MyIPO sebelum tarikh luput, dengan tempoh kelonggaran tersedia (pada yuran lebih tinggi) jika pembaharuan difailkan lewat.

## Kesilapan Biasa Perniagaan dengan Pendaftaran Tanda Dagangan

- **Menganggap pendaftaran SSM sudah melindungi jenama.** Ia mengesahkan nama perniagaan anda berdaftar, bukan bahawa nama atau logo anda secara sah eksklusif kepada anda — itu dua perlindungan yang sama sekali berbeza daripada dua badan yang sama sekali berbeza.
- **Memfailkan dalam kelas yang salah, atau terlalu sedikit daripadanya.** Perlindungan dilingkup tepat kepada apa yang anda daftarkan; tanda yang kuat secara teori tetapi difailkan di bawah kelas yang salah menawarkan sedikit perlindungan sebenar untuk cara perniagaan anda sebenarnya beroperasi.
- **Melangkau carian kelegaan untuk menjimatkan masa atau wang di peringkat awal.** Menemui percanggahan semasa pemeriksaan MyIPO sendiri, atau lebih teruk, selepas pelancaran, menelan kos yang jauh lebih besar dari segi kelewatan dan penjenamaan semula berbanding kos carian yang betul pada permulaan.

## Di Mana Harus Bermula Minggu Ini

- **Minggu ini:** Cari pangkalan data tanda dagangan MyIPO untuk nama/logo yang anda cadangkan, dan secara berasingan cari web umum serta daftar perniagaan untuk apa-apa yang serupa dalam industri anda.
- **Jika carian kembali bersih:** Senaraikan setiap kelas barangan atau perkhidmatan yang benar-benar berkaitan dengan perniagaan anda sekarang dan beberapa tahun akan datang, supaya pemfailan anda merangkumi apa yang sebenarnya anda perlukan.
- **Sebelum memfailkan:** Tentukan sama ada untuk memfailkan sendiri melalui portal MyIPO atau menggunakan ejen tanda dagangan — carian kelegaan profesional dan semakan pemfailan berbaloi bagi jenama yang benar-benar anda komited dalam jangka panjang.
- **Selepas memfailkan:** Catatkan tarikh penerbitan sebaik sahaja permohonan anda diterima, dan perhatikan Jurnal Rasmi semasa tempoh bantahan, kerana itulah peringkat di mana percanggahan sebenar paling berkemungkinan muncul.

Mendaftar lebih awal, sebelum jenama mempunyai nilai sebenar yang berbaloi diperjuangkan, hampir selalu lebih murah dan lebih mudah berbanding mendaftar selepas pertikaian sudah bermula — kerja kertas tidak menjadi lebih mudah dengan menunggu, dan apa yang anda lindungi hanya menjadi semakin bernilai.`,
        faqs: [
      {
        question: "Adakah mendaftarkan syarikat saya dengan SSM turut melindungi nama perniagaan saya sebagai tanda dagangan?",
        answer:
          "Tidak. Pendaftaran SSM hanya mengesahkan nama perniagaan anda belum diambil oleh entiti berdaftar lain dan anda dibenarkan secara sah berniaga menggunakannya — ia tidak menghalang perniagaan lain daripada menggunakan nama, logo, atau slogan yang mengelirukan serupa. Hanya tanda dagangan berdaftar melalui MyIPO memberikan anda hak eksklusif dari segi undang-undang ke atas sesebuah jenama.",
      },
      {
        question: "Berapakah kos pendaftaran tanda dagangan di Malaysia?",
        answer:
          "MyIPO mengenakan yuran mengikut kelas barangan atau perkhidmatan, biasa disebut sekitar beberapa ratus ringgit setiap kelas, dengan kadar lebih rendah kadangkala tersedia untuk pemohon yang lebih kecil di bawah ambang hasil jualan tertentu. Sahkan jadual yuran semasa secara langsung di portal MyIPO, kerana yuran dan sebarang konsesi PKS disemak semula dari semasa ke semasa.",
      },
      {
        question: "Berapa lama masa diperlukan untuk pendaftaran tanda dagangan di Malaysia?",
        answer:
          "Permohonan yang mudah dan tidak dibantah biasanya mengambil masa lebih setahun dari pemfailan hingga pendaftaran akhir, melalui pemeriksaan formaliti, pemeriksaan substantif, dan tempoh penerbitan/bantahan. Sahkan masa pemprosesan semasa di portal MyIPO sendiri berbanding merancang berdasarkan tarikh yang diandaikan, kerana kelewatan dan garis masa bantahan berbeza-beza.",
      },
      {
        question: "Apakah carian kelegaan, dan adakah saya benar-benar memerlukannya?",
        answer:
          "Carian kelegaan menyemak sama ada tanda yang sama atau mengelirukan serupa sudah wujud sebelum anda memfailkan, mengurangkan risiko bantahan, penolakan, atau secara tidak sengaja melanggar tanda sedia ada orang lain. Carian pangkalan data percuma MyIPO sendiri adalah semakan awal yang munasabah, tetapi carian kelegaan oleh ejen profesional menangkap lebih banyak — nama tidak berdaftar tetapi digunakan secara aktif, permohonan yang masih diperiksa, dan persamaan fonetik atau visual yang hampir — dan berbaloi bagi jenama yang benar-benar anda komited.",
      },
      {
        question: "Apakah kelas tanda dagangan, dan mengapa ia penting?",
        answer:
          "Malaysia menggunakan sistem Klasifikasi Nice, yang mengumpulkan semua barangan dan perkhidmatan ke dalam 45 kelas bernombor, dan perlindungan anda hanya meliputi kelas yang sebenarnya anda daftarkan. Tanda yang didaftarkan untuk satu kelas (katakan, perkhidmatan restoran) tidak memberikan perlindungan terhadap tanda serupa yang digunakan untuk kelas yang tidak berkaitan (katakan, pakaian), walaupun dengan nama yang sama persis.",
      },
      {
        question: "Bolehkah saya mendaftarkan tanda dagangan untuk beberapa kelas dalam satu permohonan?",
        answer:
          "Boleh, permohonan berbilang kelas yang menyenaraikan beberapa kelas berkaitan dalam satu pemfailan dibenarkan dan biasa. MyIPO mengenakan caj mengikut kelas berbanding mengikut permohonan, jadi kos berskala mengikut berapa banyak kelas yang sebenarnya anda perlukan berbanding berapa banyak pemfailan berasingan yang anda serahkan.",
      },
      {
        question: "Adakah tanda dagangan Malaysia melindungi jenama saya di negara lain?",
        answer:
          "Tidak. Hak tanda dagangan bersifat wilayah, jadi pendaftaran Malaysia hanya melindungi anda di dalam Malaysia — melindungi jenama anda di tempat lain memerlukan permohonan berasingan di negara itu atau laluan pemfailan antarabangsa. Jika anda merancang untuk berkembang secara serantau atau global, ini wajar dirancang lebih awal.",
      },
      {
        question: "Perlukah saya memperbaharui pendaftaran tanda dagangan, atau adakah ia kekal sebaik sahaja diluluskan?",
        answer:
          "Pendaftaran tidak kekal tanpa penyelenggaraan — ia memerlukan pembaharuan berkala untuk kekal sah, biasanya difailkan melalui MyIPO sebelum tarikh luput. Tempoh kelonggaran tersedia pada yuran lebih tinggi jika pembaharuan difailkan lewat, tetapi membiarkannya luput sepenuhnya bermakna kehilangan perlindungan itu.",
      },
        ],
      },
    },
  },
  {
    slug: "pdpa-compliance-for-malaysian-smes",
    title: "PDPA Compliance for Malaysian SMEs: What the Personal Data Protection Act Requires",
    seoTitle: "PDPA Compliance Guide for Malaysian SMEs",
    seoDescription:
      "Who the PDPA applies to, the core obligations a typical Malaysian SME must meet, and practical steps to become compliant without a legal team.",
    coverImage: {
      file: "pdpa-compliance-for-malaysian-smes-cover.webp",
      mimeType: "image/webp",
      alt: "A confident small business owner reviewing a privacy policy document on a tablet",
      altTranslations: {
        zh: "一位自信的小企业主在平板电脑上查看隐私政策文件",
        ms: "Seorang pemilik perniagaan kecil yang yakin menyemak dokumen dasar privasi pada tablet",
      },
    },
    contentImages: {
      audit: {
        file: "pdpa-compliance-for-malaysian-smes-audit.webp",
        mimeType: "image/webp",
        alt: "A business owner reviewing customer records in a binder at a desk",
        altTranslations: {
          zh: "一位企业主在办公桌前查看文件夹中的客户记录",
          ms: "Seorang pemilik perniagaan menyemak rekod pelanggan dalam fail binder di sebuah meja",
        },
        after: "A short internal audit, done once and then repeated periodically, is the foundation everything else in this guide rests on.",
        afterTranslations: {
          zh: "做一次简短的内部盘点,先做一遍,再定期重复,是本指南其余所有内容的基础。",
          ms: "Audit dalaman ringkas, dilakukan sekali dan kemudian diulang secara berkala, adalah asas kepada segala-galanya yang lain dalam panduan ini.",
        },
      },
    },
    excerpt:
      "If your business collects customer names, phone numbers, or payment details, the Personal Data Protection Act already applies to you. This guide covers who's in scope, the core obligations most Malaysian SMEs need to meet since the 2024 amendment, and the practical habits that get you compliant without a legal team.",
    body: `If your business collects a customer's name, phone number, email, or payment details — which is to say, almost every Malaysian SME — the Personal Data Protection Act (PDPA) already applies to you, whether or not you've thought about it. A significant amendment to the Act took effect in stages through 2025, tightening several obligations and introducing new ones (including, for some businesses, a mandatory Data Protection Officer). This guide covers who the PDPA actually applies to, the core obligations a typical SME needs to meet, and the practical steps to get compliant without needing a dedicated legal team.

## 1. Work out whether — and how — the PDPA applies to you

The PDPA applies to any person or business that processes personal data in connection with commercial transactions in Malaysia. In practice, that's an extremely wide net: a customer database, a mailing list, CCTV footage capturing faces at your premises, an online order form, even a simple spreadsheet of client contacts all count as processing personal data.

### You're almost certainly covered if you:
- Collect customer names, contact details, or payment information for sales, bookings, or service delivery.
- Run any kind of loyalty program, mailing list, or customer account system.
- Use CCTV, access control, or any system that records identifiable individuals.
- Employ staff, since employee records are personal data too, separate from customer data entirely.

### A narrower, more significant obligation applies to some businesses
The 2024 amendment introduced a mandatory Data Protection Officer (DPO) requirement for businesses that process personal data at significant volume or in sensitive categories — the exact thresholds and criteria are set out in the Commissioner's own guidelines and have been reported differently across sources, so check the Personal Data Protection Department's (JPDP) current guidance directly to confirm whether your business crosses that line, rather than assuming either way from a secondhand summary.

## 2. Understand the core obligations that apply to most SMEs

Even a business well below any DPO threshold still has to meet the PDPA's core principles, which run through everything else in this guide:

### Notice and consent
Tell individuals, at or before the point you collect their data, what you're collecting, why, and who it might be disclosed to — typically through a privacy notice on your website or at the point of collection. Consent should generally be informed and specific, not buried in unrelated terms and conditions someone is unlikely to actually read.

### Purpose limitation
Only use personal data for the purpose you disclosed when you collected it. Using a customer's phone number (collected for order updates) to send unrelated marketing messages, without separate consent for that purpose, is a common and avoidable breach.

### Data security
Keep personal data reasonably secure against loss, misuse, and unauthorized access — covering both digital security (access controls, encryption where appropriate) and physical security (locked filing cabinets, restricted staff access to customer records).

> The PDPA doesn't expect a small business to have enterprise-grade security infrastructure — it expects security measures proportionate to the sensitivity and volume of the data you actually hold. A simple customer contact list and a database of payment card details warrant genuinely different levels of protection, and treating them identically either over-invests in the former or under-protects the latter.

### Retention limitation
Don't keep personal data longer than necessary for the purpose it was collected for. A former customer's full order history sitting in your system indefinitely, with no retention policy at all, is itself a compliance gap — even if nothing has gone wrong with it yet.

### Data breach notification
Recent amendments introduced mandatory breach notification obligations — if personal data under your control is compromised in a way likely to cause significant harm, you're required to notify the Commissioner (and, in some cases, affected individuals) within a set timeframe. Confirm the current notification deadline and threshold criteria on the JPDP's own guidance, since this is one of the more recently introduced obligations and the practical detail matters.

### Cross-border data transfer
If any part of your operation sends personal data outside Malaysia — a cloud accounting tool hosted overseas, a regional head office, an overseas fulfillment partner — recent changes to the Act have also revised the conditions under which that's permitted, moving toward a framework closer to adequacy-style assessment rather than a simple consent-only basis. This is easy to overlook because it often happens invisibly, through whatever software or hosting a business already uses, so it's worth actually listing which of your tools store data on servers outside the country and checking the current rules against that list.

## 3. Get your privacy notice and consent mechanics right

A clear, accessible privacy notice is the single most visible piece of PDPA compliance, and the one most SMEs can fix fastest:

1. **State what data you collect** — be specific rather than generic (name, phone, email, payment details, rather than a vague "information you provide").
2. **State why you collect it** — order fulfillment, account management, marketing (if applicable, and only with appropriate consent), legal/regulatory requirements.
3. **State who it might be disclosed to** — a payment processor, a delivery partner, a cloud hosting provider — rather than leaving this implicit.
4. **Give a way to withdraw consent or ask questions** — a contact point for data-related requests, which the PDPA requires you to actually act on, not just publish for appearance's sake.

Being genuinely findable and transparent matters here too — a business that's easy to locate and verify tends to also read as more trustworthy with people's data, and [a free, verified listing here](/en/signup) is a small but real part of presenting your business as legitimate and accountable while you tighten up the compliance side. It's also worth [looking at how other Malaysian businesses present themselves publicly](/en) for a sense of how a well-run SME typically communicates with its customers.

## 4. Build a few practical habits, not a compliance department

Full PDPA compliance for a typical SME is less about hiring specialist staff and more about a handful of consistent habits:

### Know what data you actually hold
Many small businesses genuinely don't have a clear picture of every place customer data ends up — a POS system, a spreadsheet, a WhatsApp Business chat log, a physical form filed in a drawer. A short internal audit, done once and then repeated periodically, is the foundation everything else in this guide rests on.

### Limit who on your team can access what
Not every staff member needs access to full customer payment details or contact lists — restricting access to what each role actually needs is both a security measure and, in the event of a breach, a factor in how seriously the incident is treated.

### Have a simple, written process for a data request or complaint
If a customer asks what data you hold on them, asks you to delete it, or complains about how it's been used, having even a one-page internal process for who handles that and how quickly, beats improvising one under pressure the first time it actually happens.

### Review your vendors and third-party tools, not just your own systems
A POS system, an email marketing platform, a delivery app integration, a cloud accounting tool — each one that touches customer data is effectively processing it on your behalf, and your own compliance depends partly on theirs. Checking that a vendor has reasonable security practices and a clear data-handling policy before adopting a new tool is a cheap habit that avoids inheriting a vendor's data problem as your own liability later.

## Common mistakes Malaysian SMEs make with PDPA compliance

- **Assuming the PDPA only applies to large companies or tech businesses.** Any business processing personal data for commercial purposes is covered, regardless of size — a five-person retail shop with a customer mailing list is just as in scope as a large corporation.
- **Repurposing customer data without separate consent.** Collecting a phone number for delivery updates and later using it for marketing blasts, without having disclosed or obtained consent for that second purpose, is one of the most common and easily avoided breaches.
- **Having a privacy notice that exists but isn't followed.** Publishing a privacy policy and then not actually honoring a customer's deletion request, or not notifying anyone after a real data breach, is arguably worse than having no stated policy at all, since it demonstrates the gap between what you claim and what you do.

## Where to start this week

- **This week:** Do a quick internal audit of every place your business stores personal data — customer records, employee files, CCTV footage, mailing lists — and note who can access each one.
- **If you don't have a privacy notice:** Draft a short, specific one covering what you collect, why, and who it's shared with, and publish it somewhere customers will actually see it, such as at checkout or on your signup form.
- **If you're unsure whether the DPO requirement applies to you:** Check the current thresholds and criteria directly on the JPDP's own guidance rather than relying on a secondhand summary, since this is one of the more recently introduced and actively discussed parts of the amended Act.
- **Ongoing:** Set a recurring review (annually is reasonable for most SMEs) to re-check what data you hold, whether you still need all of it, and whether your privacy notice still accurately describes what you actually do.

None of this requires a legal department — it requires knowing what data you hold, being honest with customers about what you do with it, and keeping that promise consistently, which is most of what the PDPA actually asks of a business your size.`,
    faqs: [
      {
        question: "Does the PDPA apply to a small business, or only large companies?",
        answer:
          "It applies to any person or business processing personal data in connection with commercial transactions in Malaysia, regardless of size. A small retail shop with a customer mailing list is just as much in scope as a large corporation — size alone doesn't exempt a business.",
      },
      {
        question: "What counts as \"personal data\" under the PDPA?",
        answer:
          "Anything that can identify an individual, directly or indirectly — names, phone numbers, email addresses, payment details, and even CCTV footage capturing recognizable faces. A simple spreadsheet of customer contacts or an employee record both count as personal data being processed.",
      },
      {
        question: "Does my business need a Data Protection Officer (DPO)?",
        answer:
          "A mandatory DPO requirement applies to businesses processing personal data at significant volume or in sensitive categories, with the exact thresholds set out in the Commissioner's own guidelines. Check the Personal Data Protection Department's (JPDP) current guidance directly to confirm whether your business crosses that line, since sources report the criteria differently.",
      },
      {
        question: "What needs to be in a privacy notice?",
        answer:
          "A clear privacy notice should state what data you collect, why you collect it, who it might be disclosed to, and how someone can withdraw consent or ask questions about their data. It should be specific rather than generic, and published somewhere customers will actually see it, such as at checkout or on a signup form.",
      },
      {
        question: "Can I use a customer's phone number for marketing if I collected it for order updates?",
        answer:
          "Not without separate consent for that purpose. Using personal data beyond the purpose it was originally disclosed for — a common example being repurposing delivery contact details for marketing — is one of the most common and easily avoided PDPA breaches.",
      },
      {
        question: "What happens if my business has a data breach?",
        answer:
          "Recent amendments introduced mandatory breach notification obligations — if personal data under your control is compromised in a way likely to cause significant harm, you're required to notify the Commissioner, and in some cases affected individuals, within a set timeframe. Confirm the current deadline and threshold criteria on the JPDP's own guidance.",
      },
      {
        question: "How long can I keep customer personal data?",
        answer:
          "Only as long as necessary for the purpose it was collected for — indefinitely retaining a former customer's full data with no retention policy at all is itself a compliance gap, even without an actual incident. Setting a periodic review to reassess what you still need is a reasonable practical step.",
      },
      {
        question: "Do I need a lawyer or compliance department to become PDPA compliant?",
        answer:
          "Not for most SMEs. Compliance is mostly about a handful of consistent habits — knowing what data you hold, having a clear privacy notice, limiting who can access what, and having a simple process for data requests — rather than specialist staff, unless your business crosses into the higher-volume or sensitive-data territory that triggers the DPO requirement.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚中小企业的 PDPA 合规指南:个人数据保护法要求什么",
        excerpt:
          "如果您的企业会收集客户姓名、电话号码或付款信息,《个人数据保护法》早已适用于您。本指南说明哪些企业属于适用范围、自2024年修订以来大多数马来西亚中小企业需要履行的核心义务,以及无需专门法律团队也能做到合规的实际做法。",
        body: `如果您的企业会收集客户的姓名、电话号码、电子邮箱或付款信息——也就是说,几乎所有马来西亚中小企业——那么《个人数据保护法》(PDPA)无论您是否想过这件事,早已适用于您。该法令的一项重大修订在2025年分阶段生效,收紧了若干项义务,同时也引入了一些新义务(其中包括,对部分企业而言,强制设立数据保护官)。本指南将说明 PDPA 实际适用于谁、典型中小企业需要履行的核心义务,以及无需专门法律团队也能做到合规的实际步骤。

## 1. 判断 PDPA 是否、以及如何适用于您

PDPA 适用于任何在马来西亚从事商业交易过程中处理个人数据的个人或企业。实际上,这个范围极其广泛:客户数据库、邮寄名单、在营业场所拍摄到人脸的闭路电视录像、在线订单表格,甚至一份简单的客户联系人电子表格,都算作处理个人数据。

### 以下情况几乎可以肯定适用于您:
- 为销售、预订或提供服务而收集客户姓名、联系方式或付款信息。
- 运营任何形式的会员忠诚计划、邮寄名单或客户账户系统。
- 使用闭路电视、门禁系统,或任何记录可识别个人身份信息的系统。
- 雇用员工,因为员工记录同样属于个人数据,与客户数据完全是另一回事。

### 一项更窄、但对部分企业更为重大的义务
2024年的修订为处理大量个人数据、或处理敏感类别数据的企业引入了强制性数据保护官(DPO)要求——具体的门槛和标准载于专员(Commissioner)自己发布的指南中,不同信息来源对此报道不一,因此请直接核实个人数据保护局(JPDP)当前发布的指南,确认您的企业是否越过了那条线,而不要凭二手摘要就假设结论。

## 2. 了解适用于大多数中小企业的核心义务

即便远未达到 DPO 门槛的企业,仍然需要遵守贯穿本指南其余部分的 PDPA 核心原则:

### 告知与同意
在收集个人数据之时或之前,告知相关人士您收集了什么、为何收集,以及可能会披露给谁——通常通过网站上的隐私声明,或在收集数据的当下提供。同意一般应当是在充分知情、针对具体用途的情况下给出的,而不是埋没在他人不太可能真正阅读的无关条款与条件之中。

### 目的限制
个人数据只能用于您收集时所披露的目的。将为订单更新而收集的客户电话号码,在未另行征得同意的情况下用于推送无关的营销信息,是一种常见却完全可以避免的违规行为。

### 数据安全
对个人数据采取合理的安全措施,防止丢失、滥用和未经授权的访问——既包括数字层面的安全(访问控制、适当情况下的加密),也包括物理层面的安全(上锁的文件柜、限制员工接触客户记录的权限)。

> PDPA 并不期望一家小企业拥有企业级的安全基础设施——它期望的是与您实际持有的数据的敏感程度和数量相称的安全措施。一份简单的客户联系人名单,和一个存有支付卡信息的数据库,理应获得截然不同程度的保护,把二者一视同仁,要么是对前者过度投入,要么是对后者保护不足。

### 保留期限限制
不要将个人数据保留超过其收集目的所需要的时间。一位已不再光顾的客户的完整订单记录,如果无限期地留存在您的系统中,却完全没有任何保留政策,本身就是一个合规缺口——即便目前它还没有出什么问题。

### 数据泄露通知
最近的修订引入了强制性的数据泄露通知义务——如果您掌控下的个人数据遭到泄露,且有可能造成重大损害,您就需要在规定时限内通知专员(在某些情况下还需通知受影响的个人)。请直接核实 JPDP 当前发布的指南中有关通知期限和门槛标准的具体规定,因为这是较新引入的义务之一,实际细节非常重要。

### 跨境数据传输
如果您业务的任何一环会将个人数据传输到马来西亚境外——例如托管在海外的云端会计工具、区域总部,或海外履约合作伙伴——该法令近期的修订也调整了允许此类传输的条件,逐渐转向更接近"充分性评估"的框架,而不只是单纯以同意作为依据。这一点很容易被忽视,因为它往往是通过企业本已在使用的软件或主机服务悄然发生的,因此值得实际列出您所用工具中,哪些是将数据存储在境外服务器上的,并将这份清单对照当前规定逐一核实。

## 3. 把隐私声明和同意机制做对

一份清晰、容易获取的隐私声明,是 PDPA 合规中最显眼的一环,也是大多数中小企业能最快补齐的一环:

1. **说明您收集了哪些数据**——具体说明,而不是泛泛而谈(姓名、电话、电子邮箱、付款信息,而不是含糊的"您提供的信息")。
2. **说明您为何收集这些数据**——履行订单、账户管理、营销(如适用,且仅在获得相应同意的前提下)、法律/监管要求。
3. **说明可能会披露给谁**——支付处理商、配送合作伙伴、云托管服务商——而不是把这一点留在暗处不说明。
4. **提供撤回同意或提出疑问的渠道**——一个处理数据相关请求的联系方式,而 PDPA 要求您真正去响应处理这些请求,而不只是为了面子而公布出来。

在这方面,真正容易被找到、保持透明同样重要——一家容易被定位和核实的企业,往往在处理他人数据时也显得更值得信赖,而[在这里建立一份免费、经过核实的列表](/zh/signup),正是在您理顺合规事宜的同时,呈现企业合法合规、负责任形象的一个虽小但真实的部分。也值得[看看其他马来西亚企业通常如何在公开场合与客户沟通](/zh),从中获得一些参考。

## 4. 养成几个实际习惯,而不是成立一个合规部门

对于典型的中小企业而言,全面的 PDPA 合规,与其说是要聘请专职人员,不如说是要养成几个一以贯之的习惯:

### 弄清楚自己到底掌握了哪些数据
许多小企业其实并不清楚客户数据最终会流向哪些地方——POS 系统、电子表格、WhatsApp Business 聊天记录、抽屉里归档的纸质表格。做一次简短的内部盘点,先做一遍,再定期重复,是本指南其余所有内容的基础。

### 限制团队中谁能访问哪些数据
并非每一位员工都需要访问完整的客户付款信息或联系人名单——将访问权限限制在每个岗位实际需要的范围内,既是一项安全措施,也会在发生数据泄露事件时,成为该事件被认真对待程度的一个考量因素。

### 为数据请求或投诉准备一套简单的书面流程
如果客户询问您持有他们哪些数据、要求删除数据,或者投诉数据的使用方式,哪怕只有一页纸的内部流程,说明由谁来处理、多快处理,也胜过等到第一次真正发生时才临时现想办法应付。

### 不只审视自己的系统,也要审视供应商和第三方工具
POS 系统、电子邮件营销平台、配送应用对接、云端会计工具——每一个接触到客户数据的工具,实际上都是在代表您处理这些数据,而您自身的合规水平,部分取决于它们的合规水平。在采用一项新工具之前,核实该供应商是否具备合理的安全实践和清晰的数据处理政策,是一个成本低廉的习惯,能避免日后把供应商的数据问题,变成您自己要承担的责任。

## 马来西亚中小企业在 PDPA 合规上最常犯的错误

- **以为 PDPA 只适用于大公司或科技企业。** 任何为商业目的处理个人数据的企业都在适用范围内,与规模无关——一家拥有客户邮寄名单的五人零售小店,与一家大型企业一样,同样在适用范围之内。
- **未经另行同意就挪用客户数据。** 为配送更新收集电话号码,之后未披露或未取得该第二用途的同意,就用来发送营销短信,是最常见、也最容易避免的违规行为之一。
- **隐私政策只是摆设,并未真正落实。** 公布了隐私政策,却没有真正履行客户的删除请求,或者在真正发生数据泄露后没有通知任何人——这可以说比根本没有公布政策更糟糕,因为它暴露出您所宣称的与实际所做的之间的落差。

## 本周可以从这里开始

- **本周:** 对企业存储个人数据的每一个地方——客户记录、员工档案、闭路电视录像、邮寄名单——做一次快速的内部盘点,并记下谁能够访问每一处。
- **如果您还没有隐私声明:** 起草一份简短、具体的声明,说明您收集了什么、为何收集、分享给了谁,并把它发布在客户真正能看到的地方,例如结账页面或注册表单上。
- **如果您不确定 DPO 要求是否适用于您:** 直接查核 JPDP 当前发布的门槛和标准,而不要依赖二手摘要,因为这是修订后法令中较新引入、也正在被广泛讨论的部分之一。
- **持续进行:** 设定一个定期复查机制(对大多数中小企业而言,每年一次是合理的),重新核查自己持有哪些数据、是否仍然需要全部保留,以及隐私声明是否仍然准确反映您实际的做法。

这一切都不需要一个法务部门——它需要的是清楚知道自己持有哪些数据、如实告诉客户您会如何处理这些数据,并始终如一地兑现这个承诺,而这正是 PDPA 对您这个规模的企业实际要求的大部分内容。`,
        faqs: [
      {
        question: "PDPA 适用于小企业,还是只适用于大公司?",
        answer:
          "它适用于任何在马来西亚从事商业交易过程中处理个人数据的个人或企业,与规模无关。一家拥有客户邮寄名单的小型零售店,与一家大型企业一样,同样在适用范围之内——规模本身并不能让企业获得豁免。",
      },
      {
        question: "在 PDPA 下,什么算作\"个人数据\"?",
        answer:
          "任何能够直接或间接识别出某个人身份的信息——姓名、电话号码、电子邮箱地址、付款信息,甚至是拍到可辨认面孔的闭路电视录像。一份简单的客户联系人电子表格,或一份员工记录,都算作正在被处理的个人数据。",
      },
      {
        question: "我的企业需要设立数据保护官(DPO)吗?",
        answer:
          "强制性 DPO 要求适用于处理大量个人数据、或处理敏感类别数据的企业,具体门槛载于专员自己发布的指南中。请直接核实个人数据保护局(JPDP)当前发布的指南,确认您的企业是否越过了那条线,因为不同信息来源对相关标准的报道不尽相同。",
      },
      {
        question: "隐私声明应该包含哪些内容?",
        answer:
          "一份清晰的隐私声明应说明您收集了哪些数据、为何收集、可能会披露给谁,以及个人如何撤回同意或就其数据提出疑问。内容应当具体,而不是泛泛而谈,并发布在客户真正能看到的地方,例如结账页面或注册表单上。",
      },
      {
        question: "如果我收集客户电话号码是为了订单更新,之后可以用来做营销吗?",
        answer:
          "不可以,除非为该用途另行取得同意。将个人数据用于最初披露目的之外的用途——一个常见例子就是把为配送而收集的联系方式挪用于营销——是最常见、也最容易避免的 PDPA 违规行为之一。",
      },
      {
        question: "如果我的企业发生数据泄露,会怎样?",
        answer:
          "最近的修订引入了强制性的数据泄露通知义务——如果您掌控下的个人数据遭到泄露,且有可能造成重大损害,您需要在规定时限内通知专员,在某些情况下还需通知受影响的个人。请直接核实 JPDP 当前发布的指南中有关期限和门槛标准的具体规定。",
      },
      {
        question: "客户的个人数据我可以保留多久?",
        answer:
          "只能保留到实现其收集目的所必需的时长——即便没有真正发生事故,无限期保留一位已不再光顾的客户的完整数据、且完全没有任何保留政策,本身就是一个合规缺口。设定定期复查,重新评估自己是否仍然需要这些数据,是一个合理的实际做法。",
      },
      {
        question: "要做到 PDPA 合规,我需要聘请律师或成立合规部门吗?",
        answer:
          "对大多数中小企业而言不需要。合规主要依靠养成几个一以贯之的习惯——清楚知道自己持有哪些数据、拥有清晰的隐私声明、限制谁能访问哪些数据,以及为数据请求准备一套简单的流程——而不是依靠专职人员,除非您的企业已经进入触发 DPO 要求的大数据量或敏感数据范畴。",
      },
        ],
      },
      ms: {
        title: "Pematuhan PDPA untuk PKS Malaysia: Apa yang Dikehendaki Akta Perlindungan Data Peribadi",
        excerpt:
          "Jika perniagaan anda mengumpul nama, nombor telefon, atau butiran pembayaran pelanggan, Akta Perlindungan Data Peribadi sudah terpakai kepada anda. Panduan ini merangkumi siapa yang terlibat, tanggungjawab teras yang perlu dipenuhi kebanyakan PKS Malaysia sejak pindaan 2024, dan tabiat praktikal yang menjadikan anda patuh tanpa pasukan guaman.",
        body: `Jika perniagaan anda mengumpul nama, nombor telefon, e-mel, atau butiran pembayaran pelanggan — iaitu, hampir setiap PKS Malaysia — Akta Perlindungan Data Peribadi (PDPA) sudah terpakai kepada anda, sama ada anda pernah memikirkannya atau tidak. Pindaan besar kepada Akta itu berkuat kuasa secara berfasa sepanjang 2025, mengetatkan beberapa tanggungjawab dan memperkenalkan yang baharu (termasuk, bagi sesetengah perniagaan, Pegawai Perlindungan Data yang wajib). Panduan ini merangkumi siapa yang sebenarnya terpakai PDPA, tanggungjawab teras yang perlu dipenuhi oleh PKS biasa, dan langkah praktikal untuk menjadi patuh tanpa memerlukan pasukan guaman khusus.

## 1. Tentukan Sama Ada — dan Bagaimana — PDPA Terpakai kepada Anda

PDPA terpakai kepada mana-mana orang atau perniagaan yang memproses data peribadi berkaitan transaksi komersial di Malaysia. Pada hakikatnya, ini adalah jaringan yang sangat luas: pangkalan data pelanggan, senarai mel, rakaman CCTV yang menangkap wajah di premis anda, borang pesanan dalam talian, malah hamparan ringkas hubungan pelanggan, kesemuanya dikira sebagai pemprosesan data peribadi.

### Anda hampir pasti terlibat jika anda:
- Mengumpul nama pelanggan, butiran hubungan, atau maklumat pembayaran untuk jualan, tempahan, atau penyampaian perkhidmatan.
- Menjalankan apa jua jenis program kesetiaan, senarai mel, atau sistem akaun pelanggan.
- Menggunakan CCTV, kawalan akses, atau mana-mana sistem yang merekodkan individu yang boleh dikenal pasti.
- Mengambil kakitangan, kerana rekod pekerja juga data peribadi, sama sekali berasingan daripada data pelanggan.

### Tanggungjawab yang Lebih Sempit, tetapi Lebih Besar, Terpakai kepada Sesetengah Perniagaan
Pindaan 2024 memperkenalkan keperluan Pegawai Perlindungan Data (DPO) wajib bagi perniagaan yang memproses data peribadi pada jumlah yang ketara atau dalam kategori sensitif — ambang dan kriteria tepat ditetapkan dalam garis panduan Pesuruhjaya sendiri dan telah dilaporkan secara berbeza merentasi sumber, jadi semak garis panduan semasa Jabatan Perlindungan Data Peribadi (JPDP) secara langsung untuk mengesahkan sama ada perniagaan anda melepasi garis itu, berbanding menganggap sebelah pihak daripada ringkasan sumber kedua.

## 2. Fahami Tanggungjawab Teras yang Terpakai kepada Kebanyakan PKS

Walaupun perniagaan yang jauh di bawah mana-mana ambang DPO masih perlu memenuhi prinsip teras PDPA, yang mengalir melalui segala-galanya yang lain dalam panduan ini:

### Notis dan Persetujuan
Beritahu individu, pada atau sebelum titik anda mengumpul data mereka, apa yang anda kumpul, mengapa, dan kepada siapa ia mungkin didedahkan — biasanya melalui notis privasi di laman web anda atau pada titik pengumpulan. Persetujuan amnya perlu termaklum dan khusus, bukan tersembunyi dalam terma dan syarat yang tidak berkaitan yang jarang dibaca sesiapa.

### Had Tujuan
Hanya gunakan data peribadi untuk tujuan yang anda dedahkan semasa anda mengumpulnya. Menggunakan nombor telefon pelanggan (dikumpul untuk kemas kini pesanan) untuk menghantar mesej pemasaran yang tidak berkaitan, tanpa persetujuan berasingan untuk tujuan itu, adalah pelanggaran yang biasa dan boleh dielakkan.

### Keselamatan Data
Pastikan data peribadi selamat secara munasabah daripada kehilangan, penyalahgunaan, dan akses tanpa kebenaran — merangkumi kedua-dua keselamatan digital (kawalan akses, penyulitan jika sesuai) dan keselamatan fizikal (kabinet fail berkunci, akses kakitangan terhad kepada rekod pelanggan).

> PDPA tidak mengharapkan perniagaan kecil mempunyai infrastruktur keselamatan bertaraf perusahaan besar — ia mengharapkan langkah keselamatan yang berkadar dengan sensitiviti dan jumlah data yang sebenarnya anda pegang. Senarai hubungan pelanggan yang ringkas dan pangkalan data butiran kad pembayaran wajar mendapat tahap perlindungan yang benar-benar berbeza, dan melayan kedua-duanya secara sama sama ada terlebih melabur pada yang pertama atau kurang melindungi yang kedua.

### Had Penyimpanan
Jangan simpan data peribadi lebih lama daripada yang diperlukan untuk tujuan ia dikumpul. Sejarah pesanan penuh bekas pelanggan yang kekal dalam sistem anda tanpa had, tanpa sebarang dasar penyimpanan langsung, adalah sendirinya jurang pematuhan — walaupun belum ada apa-apa yang salah dengannya setakat ini.

### Notifikasi Pelanggaran Data
Pindaan terkini memperkenalkan tanggungjawab notifikasi pelanggaran wajib — jika data peribadi di bawah kawalan anda terjejas dengan cara yang berkemungkinan menyebabkan kemudaratan ketara, anda dikehendaki memberitahu Pesuruhjaya (dan, dalam sesetengah kes, individu yang terjejas) dalam tempoh masa yang ditetapkan. Sahkan tarikh akhir notifikasi semasa dan kriteria ambang pada garis panduan JPDP sendiri, kerana ini adalah satu daripada tanggungjawab yang lebih baharu diperkenalkan dan butiran praktikalnya penting.

### Pemindahan Data Rentas Sempadan
Jika mana-mana bahagian operasi anda menghantar data peribadi ke luar Malaysia — alat perakaunan awan yang dihoskan di luar negara, pejabat ibu serantau, rakan kongsi pemenuhan pesanan luar negara — perubahan terkini kepada Akta turut menyemak semula syarat di mana ini dibenarkan, beralih ke arah kerangka yang lebih hampir dengan penilaian bertaraf kecukupan berbanding asas persetujuan semata-mata. Ini mudah terlepas pandang kerana ia sering berlaku secara tidak kelihatan, melalui perisian atau pengehosan yang perniagaan sudah gunakan, jadi wajar untuk benar-benar menyenaraikan alat mana yang anda gunakan yang menyimpan data pada pelayan di luar negara dan menyemak peraturan semasa terhadap senarai itu.

## 3. Betulkan Notis Privasi dan Mekanik Persetujuan Anda

Notis privasi yang jelas dan mudah diakses adalah bahagian pematuhan PDPA yang paling kelihatan, dan yang paling pantas boleh diperbetulkan oleh kebanyakan PKS:

1. **Nyatakan data apa yang anda kumpul** — jadilah spesifik berbanding generik (nama, telefon, e-mel, butiran pembayaran, berbanding "maklumat yang anda berikan" yang kabur).
2. **Nyatakan mengapa anda mengumpulnya** — pemenuhan pesanan, pengurusan akaun, pemasaran (jika berkenaan, dan hanya dengan persetujuan yang sesuai), keperluan undang-undang/peraturan.
3. **Nyatakan kepada siapa ia mungkin didedahkan** — pemproses pembayaran, rakan kongsi penghantaran, penyedia pengehosan awan — berbanding membiarkan ini tersirat.
4. **Berikan cara untuk menarik balik persetujuan atau bertanya soalan** — titik hubungan untuk permintaan berkaitan data, yang dikehendaki PDPA untuk anda benar-benar bertindak ke atasnya, bukan sekadar menerbitkannya untuk rupa sahaja.

Benar-benar mudah ditemui dan telus juga penting di sini — perniagaan yang mudah dicari dan disahkan cenderung turut dibaca sebagai lebih dipercayai dengan data orang, dan [penyenaraian percuma dan disahkan di sini](/ms/signup) adalah bahagian kecil tetapi nyata dalam mempersembahkan perniagaan anda sebagai sah dan bertanggungjawab sementara anda mengetatkan aspek pematuhan. Wajar juga [melihat bagaimana perniagaan Malaysia lain mempersembahkan diri mereka secara awam](/ms) untuk mendapat gambaran bagaimana PKS yang diuruskan dengan baik biasanya berkomunikasi dengan pelanggan mereka.

## 4. Bina Beberapa Tabiat Praktikal, Bukan Jabatan Pematuhan

Pematuhan PDPA sepenuhnya bagi PKS biasa kurang mengenai mengupah kakitangan pakar dan lebih mengenai beberapa tabiat konsisten:

### Ketahui Data Apa yang Sebenarnya Anda Pegang
Ramai perniagaan kecil sebenarnya tidak mempunyai gambaran jelas tentang setiap tempat data pelanggan berakhir — sistem POS, hamparan, log sembang WhatsApp Business, borang fizikal yang difailkan dalam laci. Audit dalaman ringkas, dilakukan sekali dan kemudian diulang secara berkala, adalah asas kepada segala-galanya yang lain dalam panduan ini.

### Hadkan Siapa dalam Pasukan Anda yang Boleh Mengakses Apa
Bukan setiap ahli kakitangan memerlukan akses kepada butiran pembayaran penuh pelanggan atau senarai hubungan — mengehadkan akses kepada apa yang sebenarnya diperlukan setiap peranan adalah kedua-dua langkah keselamatan dan, sekiranya berlaku pelanggaran, faktor dalam betapa seriusnya insiden itu dilayan.

### Miliki Proses Bertulis yang Ringkas untuk Permintaan atau Aduan Data
Jika pelanggan bertanya data apa yang anda pegang tentang mereka, meminta anda memadamnya, atau mengadu tentang bagaimana ia digunakan, mempunyai proses dalaman walaupun satu halaman tentang siapa mengendalikannya dan secepat mana, mengatasi mengimprovisasi satu di bawah tekanan kali pertama ia benar-benar berlaku.

### Semak Vendor dan Alat Pihak Ketiga Anda, Bukan Hanya Sistem Anda Sendiri
Sistem POS, platform pemasaran e-mel, integrasi aplikasi penghantaran, alat perakaunan awan — setiap satu yang menyentuh data pelanggan secara berkesan memprosesnya bagi pihak anda, dan pematuhan anda sendiri bergantung sebahagiannya kepada pematuhan mereka. Menyemak bahawa vendor mempunyai amalan keselamatan yang munasabah dan dasar pengendalian data yang jelas sebelum menggunakan alat baharu adalah tabiat murah yang mengelakkan anda mewarisi masalah data vendor sebagai liabiliti anda sendiri kemudian.

## Kesilapan Biasa PKS Malaysia dengan Pematuhan PDPA

- **Menganggap PDPA hanya terpakai kepada syarikat besar atau perniagaan teknologi.** Mana-mana perniagaan yang memproses data peribadi untuk tujuan komersial dilingkupi, tanpa mengira saiz — kedai runcit lima orang dengan senarai mel pelanggan sama terlibat seperti sebuah korporat besar.
- **Menggunakan semula data pelanggan tanpa persetujuan berasingan.** Mengumpul nombor telefon untuk kemas kini penghantaran dan kemudian menggunakannya untuk letupan pemasaran, tanpa mendedahkan atau mendapatkan persetujuan untuk tujuan kedua itu, adalah salah satu pelanggaran paling biasa dan mudah dielakkan.
- **Mempunyai notis privasi yang wujud tetapi tidak dipatuhi.** Menerbitkan dasar privasi dan kemudian tidak benar-benar menghormati permintaan pemadaman pelanggan, atau tidak memberitahu sesiapa selepas pelanggaran data sebenar, boleh dikatakan lebih teruk daripada tidak mempunyai dasar yang dinyatakan langsung, kerana ia menunjukkan jurang antara apa yang anda dakwa dan apa yang anda lakukan.

## Di Mana Harus Bermula Minggu Ini

- **Minggu ini:** Lakukan audit dalaman pantas ke atas setiap tempat perniagaan anda menyimpan data peribadi — rekod pelanggan, fail pekerja, rakaman CCTV, senarai mel — dan catatkan siapa yang boleh mengakses setiap satu.
- **Jika anda tiada notis privasi:** Rangka satu yang ringkas dan khusus merangkumi apa yang anda kumpul, mengapa, dan kepada siapa ia dikongsi, dan terbitkan di suatu tempat pelanggan akan benar-benar melihatnya, seperti semasa pembayaran atau pada borang pendaftaran anda.
- **Jika anda tidak pasti sama ada keperluan DPO terpakai kepada anda:** Semak ambang dan kriteria semasa secara langsung pada garis panduan JPDP sendiri berbanding bergantung kepada ringkasan sumber kedua, kerana ini adalah satu daripada bahagian Akta yang dipinda yang lebih baharu diperkenalkan dan dibincangkan secara aktif.
- **Berterusan:** Tetapkan semakan berulang (tahunan adalah munasabah bagi kebanyakan PKS) untuk menyemak semula data apa yang anda pegang, sama ada anda masih memerlukan semuanya, dan sama ada notis privasi anda masih tepat menggambarkan apa yang sebenarnya anda lakukan.

Tiada satu pun daripada ini memerlukan jabatan guaman — ia memerlukan mengetahui data apa yang anda pegang, bersikap jujur dengan pelanggan tentang apa yang anda lakukan dengannya, dan mengekalkan janji itu secara konsisten, yang merupakan kebanyakan daripada apa yang sebenarnya diminta PDPA daripada perniagaan bersaiz anda.`,
        faqs: [
      {
        question: "Adakah PDPA terpakai kepada perniagaan kecil, atau hanya syarikat besar?",
        answer:
          "Ia terpakai kepada mana-mana orang atau perniagaan yang memproses data peribadi berkaitan transaksi komersial di Malaysia, tanpa mengira saiz. Kedai runcit kecil dengan senarai mel pelanggan sama terlibat seperti sebuah korporat besar — saiz semata-mata tidak mengecualikan sesebuah perniagaan.",
      },
      {
        question: "Apakah yang dikira sebagai \"data peribadi\" di bawah PDPA?",
        answer:
          "Apa jua yang boleh mengenal pasti seseorang individu, secara langsung atau tidak langsung — nama, nombor telefon, alamat e-mel, butiran pembayaran, malah rakaman CCTV yang menangkap wajah yang boleh dikenali. Hamparan ringkas hubungan pelanggan atau rekod pekerja kedua-duanya dikira sebagai data peribadi yang sedang diproses.",
      },
      {
        question: "Adakah perniagaan saya memerlukan Pegawai Perlindungan Data (DPO)?",
        answer:
          "Keperluan DPO wajib terpakai kepada perniagaan yang memproses data peribadi pada jumlah yang ketara atau dalam kategori sensitif, dengan ambang tepat ditetapkan dalam garis panduan Pesuruhjaya sendiri. Semak garis panduan semasa Jabatan Perlindungan Data Peribadi (JPDP) secara langsung untuk mengesahkan sama ada perniagaan anda melepasi garis itu, kerana sumber melaporkan kriteria secara berbeza.",
      },
      {
        question: "Apakah yang perlu ada dalam notis privasi?",
        answer:
          "Notis privasi yang jelas perlu menyatakan data apa yang anda kumpul, mengapa anda mengumpulnya, kepada siapa ia mungkin didedahkan, dan bagaimana seseorang boleh menarik balik persetujuan atau bertanya soalan tentang data mereka. Ia perlu spesifik berbanding generik, dan diterbitkan di suatu tempat pelanggan akan benar-benar melihatnya, seperti semasa pembayaran atau pada borang pendaftaran.",
      },
      {
        question: "Bolehkah saya menggunakan nombor telefon pelanggan untuk pemasaran jika saya mengumpulnya untuk kemas kini pesanan?",
        answer:
          "Tidak tanpa persetujuan berasingan untuk tujuan itu. Menggunakan data peribadi melangkaui tujuan yang asalnya didedahkan — contoh biasa ialah menggunakan semula butiran hubungan penghantaran untuk pemasaran — adalah salah satu pelanggaran PDPA paling biasa dan mudah dielakkan.",
      },
      {
        question: "Apa yang berlaku jika perniagaan saya mengalami pelanggaran data?",
        answer:
          "Pindaan terkini memperkenalkan tanggungjawab notifikasi pelanggaran wajib — jika data peribadi di bawah kawalan anda terjejas dengan cara yang berkemungkinan menyebabkan kemudaratan ketara, anda dikehendaki memberitahu Pesuruhjaya, dan dalam sesetengah kes individu yang terjejas, dalam tempoh masa yang ditetapkan. Sahkan tarikh akhir semasa dan kriteria ambang pada garis panduan JPDP sendiri.",
      },
      {
        question: "Berapa lama saya boleh menyimpan data peribadi pelanggan?",
        answer:
          "Hanya selama yang diperlukan untuk tujuan ia dikumpul — menyimpan data penuh bekas pelanggan tanpa had tanpa sebarang dasar penyimpanan langsung adalah sendirinya jurang pematuhan, walaupun tanpa insiden sebenar. Menetapkan semakan berkala untuk menilai semula apa yang masih anda perlukan adalah langkah praktikal yang munasabah.",
      },
      {
        question: "Perlukah saya seorang peguam atau jabatan pematuhan untuk menjadi patuh PDPA?",
        answer:
          "Tidak bagi kebanyakan PKS. Pematuhan kebanyakannya mengenai beberapa tabiat konsisten — mengetahui data apa yang anda pegang, mempunyai notis privasi yang jelas, mengehadkan siapa boleh mengakses apa, dan mempunyai proses ringkas untuk permintaan data — berbanding kakitangan pakar, kecuali perniagaan anda melangkaui ke wilayah jumlah tinggi atau data sensitif yang mencetuskan keperluan DPO.",
      },
        ],
      },
    },
  },
  {
    slug: "terminating-an-employee-in-malaysia",
    title: "Terminating an Employee in Malaysia: Notice, Termination Benefits, and Doing It Right",
    seoTitle: "Terminating an Employee in Malaysia: Notice & Benefits",
    seoDescription:
      "Notice periods, termination benefits, the misconduct inquiry and the paperwork for ending an employee's job in Malaysia without an unfair dismissal claim.",
    coverImage: {
      file: "terminating-an-employee-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A Malaysian business owner having a calm, professional one-to-one conversation with an employee across a desk",
      altTranslations: {
        zh: "一位马来西亚企业主隔着办公桌与员工进行冷静、专业的一对一谈话",
        ms: "Seorang pemilik perniagaan Malaysia berbual secara tenang dan profesional empat mata dengan seorang pekerja di meja",
      },
    },
    contentImages: {
      process: {
        file: "terminating-an-employee-in-malaysia-process.webp",
        mimeType: "image/webp",
        alt: "A manager and an employee reviewing a written termination letter and documents together",
        altTranslations: {
          zh: "一位经理与员工一起查阅书面终止信函和相关文件",
          ms: "Seorang pengurus dan seorang pekerja menyemak surat penamatan bertulis dan dokumen bersama-sama",
        },
        after: "Put the reason for the termination, the last working day and the exact amounts you are paying in one written letter, and keep a signed copy.",
        afterTranslations: {
          zh: "请把终止雇佣的原因、最后工作日以及您支付的确切金额写在同一封书面信函中,并保留一份签收的副本。",
          ms: "Letakkan sebab penamatan, hari bekerja terakhir dan jumlah tepat yang anda bayar dalam satu surat bertulis, dan simpan salinan yang ditandatangani.",
        },
      },
    },
    excerpt:
      "Ending someone's employment is one of the easiest things for a small business to get wrong, and the mistakes usually surface months later as an unfair dismissal claim. This guide covers the notice period, termination benefits, the misconduct inquiry and the paperwork that closes a termination properly.",
    body: `Few moments in running a small business are as uncomfortable as ending someone's employment, and few are as easy to get wrong. The rules in Malaysia are not especially complicated, but they punish shortcuts: a termination done in a hurry, with no written reason and a vague final payment, is exactly what turns into an unfair dismissal claim months later. This guide walks through what an SME owner should do in practice, from deciding what kind of exit you are dealing with to the paperwork that closes it properly. It is general information based on the Employment Act 1955 and related rules as we understand them, not legal advice, so check the current text or a qualified professional before acting on a specific case.

## 1. Work out which kind of exit this actually is

Almost everything that follows depends on the label, so decide it first and be honest about it. In practice there are four situations small businesses run into:

- **Termination with notice** — either side ends the contract by giving the notice the contract requires, for example because the role is not working out and there is no single serious incident to point to.
- **Retrenchment or lay-off** — the job itself is no longer needed because of restructuring, a closure, or a downturn. It is not about the employee's conduct or ability.
- **Dismissal for misconduct** — a serious breach of the terms of service, such as theft, fraud, serious insubordination, or repeated absence without leave.
- **Poor performance** — an employee who consistently does not meet reasonable standards despite being told so and given the chance to improve.

The most common and most expensive error is mislabelling. Calling a retrenchment "misconduct" to avoid paying termination benefits, or skipping the warnings that a performance dismissal needs, usually makes a bad situation worse once someone reviews the file.

## 2. Check the notice period before anything else

Start with the employment contract, because it normally sets how much notice each side must give. Where a contract is silent on notice, the Employment Act sets default periods based on length of service: generally four weeks for under two years, six weeks for two years to under five years, and eight weeks for five years or more. Treat those as the reference points and check the current text of the Act, since how they interact with a contract that states a shorter or longer period is exactly the kind of point worth confirming with a professional.

Three practical points matter here:

- **Notice is counted in calendar terms**, so state the last working day clearly rather than leaving the employee to calculate it.
- **Pay in lieu of notice** is a common way to end employment immediately: you pay the wages the employee would have earned over the notice period instead of requiring them to work it out. Say in the letter that this is what you are doing, and base the amount on the proper wage figure.
- **Probation is not a legal grey zone.** Probationary employees are still employees, and the contract's probation terms, including a shorter notice period, should be followed exactly, with a written outcome rather than a verbal "it's not working out".

## 3. Calculate termination benefits for retrenchment and lay-off

When an employee is let go because the business no longer needs the role, termination or lay-off benefits are generally payable on top of notice, provided the employee has completed the minimum period of service (commonly stated as at least twelve months). The statutory minimums set out in regulations under the Act (which date from 1980) are usually quoted as:

- **10 days' wages** for each year of service if the employee has worked for under two years,
- **15 days' wages** for each year of service for two years to under five years, and
- **20 days' wages** for each year of service for five years or more,

with incomplete years generally pro-rated by month and the daily wage based on the employee's average over the preceding twelve months. As an illustration only, an employee with six years of service and an average daily wage of RM120 would work out at about 6 × 20 × RM120 = RM14,400 plus a pro-rated amount for the extra months. Treat the figures as the minimum: your contract, an offer letter, or your own policy may promise more, and then more is what you owe.

Benefits are generally not payable where employment ends for misconduct or the employee resigns, but that is exactly why mislabelling a retrenchment is risky. If the real reason was that the job disappeared, an employee or the Labour Department will treat it as retrenchment regardless of what the letter says.

## 4. Run a proper process for misconduct and performance cases

For misconduct, the Employment Act contemplates dismissal without notice only after a due inquiry. That means the employee is told what they are accused of, has a genuine opportunity to respond, and you decide based on what you find. The Act also allows an employer to suspend an employee during the inquiry, at reduced pay and for a limited period, but check the current rules before relying on that.

A sound sequence for a small business looks like this:

### Step 1: Gather the facts first
Write down what happened, when, and who saw it. Keep original records such as attendance sheets, messages, CCTV or system logs rather than summaries of them.

### Step 2: Put the allegation in writing
Give the employee a letter that states the specific alleged misconduct, the date and place, and when and where the inquiry will be held, with reasonable time to prepare.

### Step 3: Hold the inquiry and record it
Let the employee respond fully. Have a second person present, take minutes, and let the employee review or sign them. A decision made before the employee has been heard is the single biggest reason dismissals are found unfair.

### Step 4: Decide proportionately
Match the outcome to the finding: a written warning, a final warning, or dismissal for serious or repeated cases. Record why you chose it.

For poor performance the same fairness principles apply with a different path: set clear expectations, document the gap, give written warnings and a genuine period to improve, and only then terminate with notice.

> A fair termination is rarely lost on the decision itself; it is lost on the process around it. If you can show the employee knew the standard, was told in writing when they fell short, and had a real chance to respond, you are in a far stronger position than any amount of arguing about whether the reason was good enough.

## 5. Do the paperwork that closes the termination properly

A termination is not finished when the employee leaves the building. Put the reason for the termination, the last working day and the exact amounts you are paying in one written letter, and keep a signed copy. Then complete the following:

- **Final wages and entitlements.** Pay outstanding wages, any unpaid overtime or allowances, and a payout for accrued unused annual leave where your policy or the Act requires it. The Act sets deadlines for paying wages on termination, so do not let the final payment drift.
- **EPF, SOCSO and EIS.** Pay the employer and employee contributions on the final wages by the usual due dates. The employee may be eligible to apply for Employment Insurance System (EIS) benefits after losing a job, so make sure your contributions are up to date.
- **Tax notification (Form CP22A).** Employers are generally expected to notify the Inland Revenue Board (LHDN) of an employee's cessation of employment using Form CP22A, and in some situations to hold back payments until LHDN clears the employee. Timing and scope depend on the circumstances, so confirm the current LHDN requirement when you plan the exit.
- **Company property and records.** Collect the laptop, access cards and keys, switch off system access on the last day, and keep the personnel file, including the letter and any inquiry records, for as long as a claim could still be brought.
- **Statement of service or reference.** Agree in advance what you will say if asked, and keep it factual.

## 6. Know what happens if the employee challenges it

An employee who believes they were dismissed without just cause or excuse can make a representation under the Industrial Relations Act 1967 to the Department of Industrial Relations, generally within 60 days of the dismissal, and the usual remedy sought is reinstatement. If conciliation fails, the matter can be referred to the Industrial Court, which looks at whether there was a genuine reason and whether the process was fair. Wage disputes, such as unpaid final wages or termination benefits, go through the Labour Department instead.

Two things follow from that. First, the burden in practice sits on the employer to show the reason and the process, which is why the paper trail matters. Second, a clean, respectful exit is often the cheapest outcome: a clear letter, correct payment on time, and a calm conversation resolve most disputes before they start.

If you need HR or legal help with a sensitive case, it is worth finding a Malaysian consultant or employment lawyer through [the Gotka business directory](/en) before you act rather than after a claim arrives.

## Common mistakes businesses make when terminating employees

- **Terminating first and documenting later.** Backdating a warning or writing the reason after the fact is easy to spot and destroys credibility. Write things down as they happen.
- **Skipping the inquiry for a "clear-cut" misconduct case.** Even when you are certain, dismissing without letting the employee respond is the most common reason a dismissal is held to be unfair.
- **Confusing notice, benefits and final pay.** They are three different payments with different rules. Itemise each one in the letter so nothing is missed or double-counted.

## Where to start this week

Pull out your standard employment contract and check what it says about notice, probation and termination, because most disputes begin with an unclear clause. If you employ people, put a short written procedure in place now: how warnings are issued, how an inquiry is run, and who signs off on a termination. If you also run a service business and want customers to find you while you build a stronger team, [create a free listing on Gotka](/en/signup) so your business is easy to find while you put these basics in order.`,
    faqs: [
      {
        question: "Do I need a reason to terminate an employee in Malaysia?",
        answer:
          "In practice, yes. Even where you give the contractual notice, an employee covered by the Industrial Relations Act can claim dismissal without just cause or excuse, so a genuine, documented reason is what protects you. Having the reason and the process recorded before you act is far safer than explaining it afterwards.",
      },
      {
        question: "Can I pay salary in lieu of notice instead of letting the employee work it out?",
        answer:
          "Generally yes, and it is a common way to end employment immediately. You pay the wages the employee would have earned over the notice period, and the letter should say clearly that this is what the payment is. Check the contract and the Employment Act for the correct notice length and wage basis.",
      },
      {
        question: "Are termination benefits payable if I dismiss someone for misconduct?",
        answer:
          "Termination or lay-off benefits are generally linked to retrenchment and lay-off, not to dismissal for misconduct or resignation. That is why the reason must be genuine: if the real reason was that the job was no longer needed, calling it misconduct will not remove the obligation to pay benefits.",
      },
      {
        question: "How much termination benefit do I owe a retrenched employee?",
        answer:
          "The minimums are usually quoted as 10, 15 or 20 days' wages for each year of service, depending on whether the employee has served under two years, two to under five years, or five years or more. Incomplete years are generally pro-rated. Your contract or policy may promise more, and then the higher amount is what applies.",
      },
      {
        question: "How long does an employee have to challenge a dismissal?",
        answer:
          "An employee who believes they were dismissed without just cause or excuse can generally make a representation to the Department of Industrial Relations within 60 days of the dismissal. The time limit can be counted differently where notice was given, so treat 60 days as a rule of thumb and keep your records for at least that long.",
      },
      {
        question: "What must I pay on the employee's last day?",
        answer:
          "Outstanding wages, any overtime or allowances owed, pay in lieu of notice if that is what you chose, termination benefits where they apply, and a payout for accrued unused annual leave where your policy or the Act requires it. Also pay the final EPF, SOCSO and EIS contributions on time. The Act sets deadlines for wages on termination, so confirm them before the date.",
      },
      {
        question: "What is Form CP22A and do I have to submit it?",
        answer:
          "CP22A is the form employers use to tell the Inland Revenue Board (LHDN) that an employee's employment has ended. Employers are generally expected to submit it for a departing employee, and in some cases to hold back payments until LHDN clears the employee. The timing and scope depend on the case, so check LHDN's current guidance when you plan the exit.",
      },
      {
        question: "Can I terminate an employee on probation without notice?",
        answer:
          "Not automatically. A probationary employee is still an employee, and the contract's probation terms, including any shorter notice period, should be followed exactly. If you want to end probation early, do it in writing under those terms, and avoid ending it for reasons the law treats as protected, such as pregnancy.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚终止员工雇佣:通知期、终止福利与正确的处理方式",
        excerpt:
          "终止员工雇佣是小企业最容易出错的事情之一,而这些错误往往在数月后以不公平解雇索赔的形式浮现。本指南涵盖通知期、终止福利、不当行为调查以及妥善结束终止程序所需的文书工作。",
        body: `在经营小企业的过程中,很少有什么时刻比终止一个人的雇佣更令人不安,也很少有什么事情比这更容易出错。马来西亚的规则并不特别复杂,但它们会惩罚走捷径:匆忙进行的终止,没有书面理由,最终付款含糊不清,正是几个月后演变成不公平解雇索赔的典型情形。本指南介绍中小企业主在实践中应当怎么做,从判断您面对的是哪一种离职,到妥善结束整个程序所需的文书工作。以下内容是基于我们所理解的《1955 年雇佣法令》及相关规定的一般信息,并非法律意见,针对具体个案采取行动之前,请核对最新条文或咨询合格的专业人士。

## 1. 先弄清楚这究竟是哪一种离职

后面几乎所有事情都取决于这个定性,所以请先作出判断,并且要诚实面对。在实践中,小企业通常会遇到四种情形:

- **提前通知终止** — 任何一方按合同要求提前通知即可终止合同,例如这个岗位不合适,但又没有某一件严重事件可以指出。
- **裁员或停工** — 由于重组、结业或经济低迷,这个职位本身已不再需要。这与员工的操守或能力无关。
- **因不当行为而解雇** — 严重违反服务条件,例如盗窃、欺诈、严重不服从上级,或屡次无故缺勤。
- **工作表现不佳** — 员工虽然已被告知并获得改进机会,仍持续达不到合理的标准。

最常见也代价最高的错误是定性错误。为了不支付终止福利而把裁员称作「不当行为」,或是省略了因绩效问题解雇本应有的警告,一旦有人审查档案,通常只会让糟糕的局面更糟。

## 2. 首先核对通知期

首先查看雇佣合同,因为合同通常规定了双方各自须提前多久通知。如果合同对通知期没有规定,《雇佣法令》会根据服务年资设定默认期限:一般是服务不足两年为四周,两年至不足五年为六周,五年或以上为八周。请把这些视为参考标准,并核对法令的最新条文,因为它们与规定了更短或更长期限的合同之间如何相互作用,恰恰是值得向专业人士确认的事项。

这里有三个实务要点:

- **通知期按日历时间计算**,所以请清楚写明最后工作日,而不是让员工自己去推算。
- **以薪代通知** 是立即结束雇佣的常见做法:您支付员工在通知期内本可赚取的工资,而不是要求其做满通知期。请在信中说明这就是您所做的,并以正确的工资数额为基础计算。
- **试用期并非法律灰色地带。** 试用期员工仍然是员工,合同中的试用期条款,包括较短的通知期,都应严格遵守,并以书面形式告知结果,而不是口头说一句「不太合适」。

## 3. 计算裁员和停工的终止福利

当员工是因为企业不再需要该职位而被辞退时,除了通知期之外,通常还须支付终止或停工福利,前提是员工已完成最低服务年期(通常说法是至少十二个月)。根据该法令下的规定(可追溯至 1980 年)所设的法定最低标准,通常被引述为:

- 服务不足两年者,每服务一年支付 **10 天工资**,
- 服务两年至不足五年者,每服务一年支付 **15 天工资**,以及
- 服务五年或以上者,每服务一年支付 **20 天工资**,

不足一年的部分一般按月比例计算,日薪则以员工过去十二个月的平均值为基础。仅作举例:一名服务六年、平均日薪为 RM120 的员工,大约为 6 × 20 × RM120 = RM14,400,另加多出月份的按比例金额。请把这些数字视为最低标准:您的合同、聘书或公司政策可能承诺了更多,届时应付的就是更多的那个数额。

因不当行为而终止雇佣或员工自行辞职时,一般无需支付福利,但这恰恰就是错误定性裁员存在风险的原因。如果真正的原因是职位消失了,无论信函上怎么写,员工或劳工局都会将其视为裁员。

## 4. 为不当行为和绩效个案走正确的程序

对于不当行为,《雇佣法令》设想的是只有经过适当调查之后才可无须通知而解雇。也就是说,员工要被告知被指控的内容,有真正的机会作出回应,然后您根据调查结果作出决定。该法令也允许雇主在调查期间以减薪方式、在有限期间内将员工停职,但依赖这一点之前请核对现行规定。

对小企业来说,一个稳妥的顺序如下:

### 第一步:先收集事实
写下发生了什么、何时发生、谁看到了。请保留考勤表、消息、闭路电视或系统日志等原始记录,而不是它们的摘要。

### 第二步:以书面形式提出指控
给员工一封信,写明具体被指控的不当行为、日期和地点,以及调查的时间和地点,并给予合理的准备时间。

### 第三步:举行调查并做好记录
让员工充分作出回应。安排第二位人员在场、作会议记录,并让员工审阅或签署。在员工被听取意见之前就作出决定,是解雇被认定为不公平的最大单一原因。

### 第四步:作出相称的处理
让结果与调查结论相称:书面警告、最后警告,或针对严重或屡次的个案予以解雇。请记录您选择这样处理的原因。

对于工作表现不佳,同样的公平原则适用,只是路径不同:设定明确的期望,记录差距,发出书面警告并给予真正的改进期,然后才提前通知终止。

> 一次公平的终止很少是输在决定本身,而是输在围绕它的程序。如果您能证明员工知道标准、在未达标时被书面告知,并有真正的机会作出回应,那么您的处境会比任何关于理由是否足够充分的争辩都要有利得多。

## 5. 做好文书工作,妥善结束终止程序

员工离开办公室并不意味着终止已经完成。请把终止雇佣的原因、最后工作日以及您支付的确切金额写在同一封书面信函中,并保留一份签收的副本。然后完成以下事项:

- **最终工资和应得款项。** 支付未付的工资、任何未付的加班费或津贴,以及在您的政策或法令要求的情况下,支付累积未休年假的折现。法令对终止时的工资支付设有期限,所以不要让最后一笔付款拖延。
- **EPF、SOCSO 和 EIS。** 按惯常的到期日缴付最终工资的雇主和雇员供款。员工失业后可能有资格申请就业保险制度(EIS)福利,所以请确保您的供款是最新的。
- **税务通知(CP22A 表格)。** 一般预期雇主须使用 CP22A 表格通知内陆税收局(LHDN)员工的雇佣已终止,而在某些情形下,还须扣留款项直到 LHDN 清税为止。时间和范围视具体情况而定,所以在规划离职时请确认 LHDN 的现行要求。
- **公司财物和记录。** 收回笔记本电脑、门禁卡和钥匙,在最后一天关闭系统访问权限,并在索赔仍有可能提出的期间内保存人事档案,包括信函和任何调查记录。
- **服务证明或推荐。** 预先商定如果被问到时您会说什么,并保持陈述属实。

## 6. 了解员工提出异议时会发生什么

认为自己在没有正当理由或借口的情况下被解雇的员工,可以根据《1967 年劳资关系法令》向劳资关系局提出申诉,一般须在被解雇后 60 天内提出,通常寻求的补救是复职。如果调解失败,案件可被转交劳资法庭,由其审查是否有真正的理由以及程序是否公平。工资纠纷,例如未付的最终工资或终止福利,则通过劳工局处理。

由此可得出两点。第一,在实践中,说明理由和程序的举证责任落在雇主身上,这就是书面记录至关重要的原因。第二,干净、尊重的离职往往是代价最低的结果:一封清楚的信函、准确按时的付款,以及一次平静的谈话,就能在纠纷发生之前化解大多数问题。

如果您在处理敏感个案时需要人力资源或法律协助,值得在采取行动之前,而不是在收到索赔之后,通过 [Gotka 企业名录](/zh) 寻找马来西亚的顾问或劳资律师。

## 企业在终止员工雇佣时常犯的错误

- **先终止、后补记录。** 倒填警告日期或事后才写原因很容易被看穿,并会摧毁可信度。请在事情发生时就写下来。
- **在「明摆着」的不当行为个案中省略调查。** 即便您非常确定,在不让员工回应的情况下就解雇,仍是解雇被认定为不公平的最常见原因。
- **混淆通知、福利和最终付款。** 它们是三项不同的付款,规则也各不相同。请在信中逐项列明,避免遗漏或重复计算。

## 本周从哪里开始

拿出您的标准雇佣合同,查看其中关于通知期、试用期和终止的规定,因为大多数纠纷都始于含糊不清的条款。如果您雇有员工,请现在就建立一套简短的书面程序:如何发出警告、如何进行调查,以及由谁批准终止。如果您同时经营服务型业务,希望在建设更强团队的同时让客户找到您,请[在 Gotka 创建免费企业名录](/zh/signup),让您在理顺这些基本事项期间,企业依然容易被找到。`,
        faqs: [
          {
            question: "在马来西亚终止员工雇佣需要理由吗?",
            answer:
              "实践中需要。即使您给予了合同规定的通知期,受《劳资关系法令》保护的员工仍可声称自己被无正当理由或借口解雇,所以一个真实且有记录的理由才能保护您。在采取行动之前就记录好理由和程序,远比事后再解释要安全得多。",
          },
          {
            question: "我可以以薪代通知,而不让员工做满通知期吗?",
            answer:
              "一般可以,这也是立即结束雇佣的常见做法。您支付员工在通知期内本可赚取的工资,信中应清楚说明这笔款项就是为此而付。请核对合同和《雇佣法令》以确定正确的通知期长度和工资计算基础。",
          },
          {
            question: "如果我因不当行为解雇员工,还需要支付终止福利吗?",
            answer:
              "终止或停工福利一般与裁员和停工相关,而不是因不当行为而解雇或员工辞职。这正是理由必须真实的原因:如果真正的原因是该职位不再被需要,把它称作不当行为并不能免除支付福利的义务。",
          },
          {
            question: "我应向被裁员的员工支付多少终止福利?",
            answer:
              "最低标准通常被引述为每服务一年支付 10、15 或 20 天工资,取决于员工服务不足两年、两年至不足五年,还是五年或以上。不足一年的部分一般按比例计算。您的合同或政策可能承诺了更多,那样适用的就是更高的数额。",
          },
          {
            question: "员工有多长时间可以对解雇提出异议?",
            answer:
              "认为自己被无正当理由或借口解雇的员工,一般可在被解雇后 60 天内向劳资关系局提出申诉。如果已给予通知期,时限的计算可能有所不同,所以请把 60 天视为经验法则,并将记录至少保存这么长时间。",
          },
          {
            question: "员工最后一天我必须支付哪些款项?",
            answer:
              "未付的工资、应付的加班费或津贴、若您选择以薪代通知则支付代通知金、适用时的终止福利,以及在您的政策或法令要求的情况下支付累积未休年假的折现。同时要按时缴付最后的 EPF、SOCSO 和 EIS 供款。法令对终止时的工资设有期限,所以请在日期之前确认。",
          },
          {
            question: "CP22A 表格是什么?我必须提交吗?",
            answer:
              "CP22A 是雇主用来通知内陆税收局(LHDN)员工雇佣已终止的表格。一般预期雇主须为离职员工提交,在某些情况下还须扣留款项直到 LHDN 清税。时间和范围视个案而定,所以在规划离职时请查看 LHDN 的现行指引。",
          },
          {
            question: "我可以不经通知就终止试用期员工吗?",
            answer:
              "不能自动如此。试用期员工仍然是员工,合同中的试用期条款,包括任何较短的通知期,都应严格遵守。如果您想提前结束试用期,请依据这些条款以书面形式进行,并避免基于法律视为受保护的理由,例如怀孕。",
          },
        ],
      },
      ms: {
        title: "Menamatkan Perkhidmatan Pekerja di Malaysia: Notis, Faedah Penamatan dan Cara yang Betul",
        excerpt:
          "Menamatkan pekerjaan seseorang ialah salah satu perkara yang paling mudah dilakukan dengan salah oleh perniagaan kecil, dan kesilapan itu biasanya timbul beberapa bulan kemudian sebagai tuntutan buang kerja tidak adil. Panduan ini merangkumi tempoh notis, faedah penamatan, siasatan salah laku dan kerja dokumen yang menutup penamatan dengan betul.",
        body: `Jarang ada saat dalam menjalankan perniagaan kecil yang sesukar menamatkan pekerjaan seseorang, dan jarang ada perkara yang semudah itu untuk dilakukan dengan salah. Peraturan di Malaysia tidaklah terlalu rumit, tetapi ia menghukum jalan pintas: penamatan yang dibuat tergesa-gesa, tanpa sebab bertulis dan bayaran akhir yang kabur, adalah tepat sekali jenis kes yang bertukar menjadi tuntutan buang kerja tidak adil beberapa bulan kemudian. Panduan ini menerangkan apa yang patut dilakukan oleh pemilik PKS dalam praktik, daripada menentukan jenis perpisahan yang anda hadapi sehingga kerja dokumen yang menutupnya dengan betul. Ia maklumat am berdasarkan Akta Kerja 1955 dan peraturan berkaitan seperti yang kami fahami, bukan nasihat undang-undang, jadi semak teks terkini atau rujuk profesional yang layak sebelum bertindak dalam kes tertentu.

## 1. Tentukan jenis perpisahan yang sebenarnya

Hampir semua yang berikutnya bergantung pada label ini, jadi tentukannya dahulu dan jujurlah tentangnya. Dalam praktik, terdapat empat keadaan yang biasa dihadapi perniagaan kecil:

- **Penamatan dengan notis** — mana-mana pihak menamatkan kontrak dengan memberi notis yang dikehendaki kontrak, contohnya kerana peranan itu tidak berjalan baik dan tiada satu insiden serius yang boleh ditunjukkan.
- **Pemberhentian atau lay-off** — jawatan itu sendiri tidak lagi diperlukan kerana penyusunan semula, penutupan atau kemerosotan ekonomi. Ia tiada kaitan dengan kelakuan atau keupayaan pekerja.
- **Pemecatan kerana salah laku** — pelanggaran serius terhadap terma perkhidmatan, seperti kecurian, penipuan, ingkar arahan yang serius, atau ketidakhadiran berulang tanpa cuti.
- **Prestasi lemah** — pekerja yang secara konsisten tidak mencapai piawaian munasabah walaupun telah dimaklumkan dan diberi peluang untuk memperbaiki diri.

Kesilapan yang paling biasa dan paling mahal ialah salah melabel. Menggelar pemberhentian sebagai “salah laku” untuk mengelak membayar faedah penamatan, atau melangkau amaran yang diperlukan dalam pemecatan prestasi, biasanya memburukkan keadaan apabila fail disemak oleh orang lain.

## 2. Semak tempoh notis sebelum apa-apa lagi

Mulakan dengan kontrak pekerjaan, kerana ia biasanya menetapkan berapa lama notis yang mesti diberikan oleh setiap pihak. Jika kontrak tidak menyatakan notis, Akta Kerja menetapkan tempoh lalai berdasarkan tempoh perkhidmatan: umumnya empat minggu bagi kurang daripada dua tahun, enam minggu bagi dua tahun hingga kurang daripada lima tahun, dan lapan minggu bagi lima tahun atau lebih. Anggaplah ini sebagai titik rujukan dan semak teks terkini Akta, kerana cara ia berinteraksi dengan kontrak yang menyatakan tempoh lebih pendek atau lebih panjang ialah perkara yang wajar disahkan dengan profesional.

Tiga perkara praktikal penting di sini:

- **Notis dikira dalam masa kalendar**, jadi nyatakan hari bekerja terakhir dengan jelas dan jangan biarkan pekerja mengiranya sendiri.
- **Gaji sebagai ganti notis** ialah cara biasa untuk menamatkan pekerjaan serta-merta: anda membayar gaji yang akan diperoleh pekerja sepanjang tempoh notis dan bukannya meminta mereka bekerja hingga habis tempoh itu. Nyatakan dalam surat bahawa inilah yang anda lakukan, dan kira jumlahnya berdasarkan angka gaji yang betul.
- **Percubaan bukan kawasan kelabu undang-undang.** Pekerja dalam percubaan tetap pekerja, dan terma percubaan dalam kontrak, termasuk tempoh notis yang lebih pendek, mesti dipatuhi dengan tepat, dengan keputusan secara bertulis dan bukan sekadar “nampaknya tak sesuai” secara lisan.

## 3. Kira faedah penamatan bagi pemberhentian dan lay-off

Apabila seorang pekerja dilepaskan kerana perniagaan tidak lagi memerlukan jawatan itu, faedah penamatan atau lay-off umumnya perlu dibayar selain notis, dengan syarat pekerja telah melengkapkan tempoh perkhidmatan minimum (lazimnya dinyatakan sekurang-kurangnya dua belas bulan). Minimum berkanun yang ditetapkan dalam peraturan di bawah Akta (bertarikh sejak 1980) lazimnya disebut sebagai:

- **10 hari gaji** bagi setiap tahun perkhidmatan jika pekerja telah berkhidmat kurang daripada dua tahun,
- **15 hari gaji** bagi setiap tahun perkhidmatan bagi dua tahun hingga kurang daripada lima tahun, dan
- **20 hari gaji** bagi setiap tahun perkhidmatan bagi lima tahun atau lebih,

dengan tahun yang tidak lengkap umumnya dikira secara pro rata mengikut bulan dan gaji harian berdasarkan purata pekerja bagi dua belas bulan sebelumnya. Sebagai ilustrasi sahaja, pekerja dengan enam tahun perkhidmatan dan purata gaji harian RM120 akan menjadi lebih kurang 6 × 20 × RM120 = RM14,400 ditambah jumlah pro rata untuk bulan tambahan. Anggaplah angka ini sebagai minimum: kontrak, surat tawaran atau dasar syarikat anda mungkin menjanjikan lebih, dan jika begitu, lebih itulah yang anda hutang.

Faedah umumnya tidak perlu dibayar apabila pekerjaan tamat kerana salah laku atau pekerja meletak jawatan, tetapi itulah sebabnya salah melabel pemberhentian adalah berisiko. Jika sebab sebenar ialah jawatan itu hilang, pekerja atau Jabatan Tenaga Kerja akan menganggapnya sebagai pemberhentian walau apa sahaja yang tertulis dalam surat.

## 4. Jalankan proses yang betul bagi kes salah laku dan prestasi

Bagi salah laku, Akta Kerja membayangkan pemecatan tanpa notis hanya selepas siasatan yang wajar. Ini bermakna pekerja diberitahu apa yang dituduh, mempunyai peluang sebenar untuk menjawab, dan anda memutuskan berdasarkan apa yang anda temui. Akta juga membenarkan majikan menggantung pekerja semasa siasatan, dengan gaji dikurangkan dan untuk tempoh terhad, tetapi semak peraturan semasa sebelum bergantung pada perkara itu.

Urutan yang kukuh untuk perniagaan kecil adalah seperti berikut:

### Langkah 1: Kumpulkan fakta dahulu
Tuliskan apa yang berlaku, bila, dan siapa yang melihatnya. Simpan rekod asal seperti helaian kehadiran, mesej, CCTV atau log sistem dan bukannya ringkasannya.

### Langkah 2: Nyatakan tuduhan secara bertulis
Berikan pekerja surat yang menyatakan salah laku khusus yang dituduh, tarikh dan tempat, serta bila dan di mana siasatan akan diadakan, dengan masa yang munasabah untuk bersedia.

### Langkah 3: Adakan siasatan dan rekodkannya
Biarkan pekerja menjawab sepenuhnya. Hadirkan orang kedua, ambil minit, dan biarkan pekerja menyemak atau menandatanganinya. Keputusan yang dibuat sebelum pekerja didengar ialah sebab tunggal terbesar pemecatan didapati tidak adil.

### Langkah 4: Putuskan secara berpadanan
Padankan hasilnya dengan penemuan: amaran bertulis, amaran akhir, atau pemecatan bagi kes yang serius atau berulang. Rekodkan sebab anda memilihnya.

Bagi prestasi lemah, prinsip keadilan yang sama terpakai dengan laluan yang berbeza: tetapkan jangkaan yang jelas, dokumenkan jurangnya, beri amaran bertulis dan tempoh sebenar untuk memperbaiki diri, dan barulah menamatkan dengan notis.

> Penamatan yang adil jarang kalah pada keputusan itu sendiri; ia kalah pada proses di sekelilingnya. Jika anda boleh menunjukkan bahawa pekerja tahu piawaiannya, dimaklumkan secara bertulis apabila gagal mencapainya, dan mempunyai peluang sebenar untuk menjawab, anda berada dalam kedudukan yang jauh lebih kukuh berbanding sebarang perbalahan tentang sama ada sebabnya cukup baik.

## 5. Lakukan kerja dokumen yang menutup penamatan dengan betul

Penamatan belum selesai apabila pekerja keluar dari pejabat. Letakkan sebab penamatan, hari bekerja terakhir dan jumlah tepat yang anda bayar dalam satu surat bertulis, dan simpan salinan yang ditandatangani. Kemudian lengkapkan perkara berikut:

- **Gaji akhir dan hak.** Bayar gaji tertunggak, sebarang kerja lebih masa atau elaun yang belum dibayar, dan bayaran bagi cuti tahunan terkumpul yang tidak digunakan jika dasar anda atau Akta menghendakinya. Akta menetapkan tarikh akhir bagi pembayaran gaji semasa penamatan, jadi jangan biarkan bayaran akhir tertangguh.
- **KWSP, PERKESO dan SIP.** Bayar caruman majikan dan pekerja ke atas gaji akhir pada tarikh akhir biasa. Pekerja mungkin layak memohon faedah Sistem Insurans Pekerjaan (SIP) selepas kehilangan kerja, jadi pastikan caruman anda terkini.
- **Notifikasi cukai (Borang CP22A).** Majikan umumnya dijangka memaklumkan Lembaga Hasil Dalam Negeri (LHDN) tentang penamatan pekerjaan menggunakan Borang CP22A, dan dalam sesetengah keadaan menahan bayaran sehingga LHDN membenarkan. Masa dan skop bergantung pada keadaan, jadi sahkan keperluan semasa LHDN apabila anda merancang perpisahan itu.
- **Harta dan rekod syarikat.** Kutip komputer riba, kad akses dan kunci, tutup akses sistem pada hari terakhir, dan simpan fail kakitangan, termasuk surat dan sebarang rekod siasatan, selagi tuntutan masih boleh dibuat.
- **Surat perkhidmatan atau rujukan.** Putuskan lebih awal apa yang akan anda katakan jika ditanya, dan kekalkan ia berdasarkan fakta.

## 6. Ketahui apa yang berlaku jika pekerja mencabarnya

Pekerja yang percaya mereka dipecat tanpa sebab atau alasan yang adil boleh membuat representasi di bawah Akta Perhubungan Perusahaan 1967 kepada Jabatan Perhubungan Perusahaan, umumnya dalam tempoh 60 hari selepas pemecatan, dan remedi yang lazim dipohon ialah penggantian semula. Jika pendamaian gagal, perkara itu boleh dirujuk kepada Mahkamah Perusahaan, yang meneliti sama ada terdapat sebab yang tulen dan sama ada prosesnya adil. Pertikaian gaji, seperti gaji akhir atau faedah penamatan yang tidak dibayar, melalui Jabatan Tenaga Kerja.

Dua perkara berikutan daripada ini. Pertama, dalam praktik beban untuk menunjukkan sebab dan proses terletak pada majikan, itulah sebabnya jejak dokumen penting. Kedua, perpisahan yang bersih dan penuh hormat selalunya hasil yang paling murah: surat yang jelas, bayaran yang betul tepat pada masanya, dan perbualan yang tenang menyelesaikan kebanyakan pertikaian sebelum ia bermula.

Jika anda memerlukan bantuan HR atau undang-undang untuk kes yang sensitif, wajar mencari perunding Malaysia atau peguam pekerjaan melalui [direktori perniagaan Gotka](/ms) sebelum anda bertindak dan bukannya selepas tuntutan tiba.

## Kesilapan biasa perniagaan semasa menamatkan pekerja

- **Menamatkan dahulu, mendokumenkan kemudian.** Mengundurkan tarikh amaran atau menulis sebab selepas kejadian mudah dikesan dan memusnahkan kredibiliti. Tuliskan sesuatu semasa ia berlaku.
- **Melangkau siasatan bagi kes salah laku yang “jelas”.** Walaupun anda yakin, memecat tanpa membenarkan pekerja menjawab ialah sebab paling biasa pemecatan dianggap tidak adil.
- **Mengelirukan notis, faedah dan gaji akhir.** Ia tiga bayaran berbeza dengan peraturan berbeza. Senaraikan setiap satu dalam surat supaya tiada yang tertinggal atau dikira dua kali.

## Di mana untuk bermula minggu ini

Keluarkan kontrak pekerjaan standard anda dan semak apa yang dinyatakannya tentang notis, percubaan dan penamatan, kerana kebanyakan pertikaian bermula dengan klausa yang tidak jelas. Jika anda mengambil pekerja, wujudkan prosedur bertulis ringkas sekarang: bagaimana amaran dikeluarkan, bagaimana siasatan dijalankan, dan siapa meluluskan penamatan. Jika anda juga menjalankan perniagaan perkhidmatan dan mahu pelanggan menemui anda ketika membina pasukan yang lebih kukuh, [buat penyenaraian percuma di Gotka](/ms/signup) supaya perniagaan anda mudah ditemui sementara anda menyusun perkara asas ini.`,
        faqs: [
          {
            question: "Adakah saya memerlukan sebab untuk menamatkan pekerja di Malaysia?",
            answer:
              "Dalam praktik, ya. Walaupun anda memberi notis kontrak, pekerja yang dilindungi Akta Perhubungan Perusahaan boleh menuntut dipecat tanpa sebab atau alasan yang adil, jadi sebab yang tulen dan didokumenkan itulah yang melindungi anda. Merekodkan sebab dan proses sebelum anda bertindak jauh lebih selamat berbanding menjelaskannya selepas itu.",
          },
          {
            question: "Bolehkah saya membayar gaji sebagai ganti notis dan bukannya membiarkan pekerja bekerja hingga habis notis?",
            answer:
              "Umumnya boleh, dan ia cara biasa untuk menamatkan pekerjaan serta-merta. Anda membayar gaji yang akan diperoleh pekerja sepanjang tempoh notis, dan surat hendaklah menyatakan dengan jelas bahawa itulah bayaran tersebut. Semak kontrak dan Akta Kerja untuk panjang notis dan asas gaji yang betul.",
          },
          {
            question: "Adakah faedah penamatan perlu dibayar jika saya memecat seseorang kerana salah laku?",
            answer:
              "Faedah penamatan atau lay-off umumnya dikaitkan dengan pemberhentian dan lay-off, bukan pemecatan kerana salah laku atau peletakan jawatan. Itulah sebabnya sebab itu mesti tulen: jika sebab sebenar ialah jawatan itu tidak lagi diperlukan, menggelarnya salah laku tidak akan menghapuskan kewajipan membayar faedah.",
          },
          {
            question: "Berapakah faedah penamatan yang saya hutang kepada pekerja yang diberhentikan?",
            answer:
              "Minimum lazimnya disebut sebagai 10, 15 atau 20 hari gaji bagi setiap tahun perkhidmatan, bergantung pada sama ada pekerja telah berkhidmat kurang daripada dua tahun, dua hingga kurang daripada lima tahun, atau lima tahun atau lebih. Tahun yang tidak lengkap umumnya dikira pro rata. Kontrak atau dasar anda mungkin menjanjikan lebih, dan jika begitu jumlah yang lebih tinggi itulah yang terpakai.",
          },
          {
            question: "Berapa lama pekerja ada untuk mencabar pemecatan?",
            answer:
              "Pekerja yang percaya mereka dipecat tanpa sebab atau alasan yang adil umumnya boleh membuat representasi kepada Jabatan Perhubungan Perusahaan dalam tempoh 60 hari selepas pemecatan. Had masa boleh dikira secara berbeza apabila notis diberikan, jadi anggaplah 60 hari sebagai panduan kasar dan simpan rekod anda sekurang-kurangnya selama itu.",
          },
          {
            question: "Apakah yang mesti saya bayar pada hari terakhir pekerja?",
            answer:
              "Gaji tertunggak, sebarang kerja lebih masa atau elaun yang terhutang, gaji sebagai ganti notis jika itu pilihan anda, faedah penamatan jika terpakai, dan bayaran bagi cuti tahunan terkumpul yang tidak digunakan jika dasar anda atau Akta menghendakinya. Bayar juga caruman akhir KWSP, PERKESO dan SIP tepat pada masanya. Akta menetapkan tarikh akhir bagi gaji semasa penamatan, jadi sahkan sebelum tarikh itu.",
          },
          {
            question: "Apakah Borang CP22A dan adakah saya mesti menghantarnya?",
            answer:
              "CP22A ialah borang yang digunakan majikan untuk memaklumkan Lembaga Hasil Dalam Negeri (LHDN) bahawa pekerjaan seorang pekerja telah tamat. Majikan umumnya dijangka menghantarnya bagi pekerja yang berhenti, dan dalam sesetengah kes menahan bayaran sehingga LHDN membenarkan. Masa dan skop bergantung pada kes, jadi semak panduan semasa LHDN apabila anda merancang perpisahan itu.",
          },
          {
            question: "Bolehkah saya menamatkan pekerja dalam percubaan tanpa notis?",
            answer:
              "Tidak secara automatik. Pekerja dalam percubaan tetap pekerja, dan terma percubaan dalam kontrak, termasuk sebarang tempoh notis yang lebih pendek, mesti dipatuhi dengan tepat. Jika anda mahu menamatkan percubaan lebih awal, lakukannya secara bertulis di bawah terma tersebut, dan elakkan menamatkannya atas sebab yang dilindungi undang-undang, seperti kehamilan.",
          },
        ],
      },
    },
  },
  {
    slug: "sme-grants-and-funding-in-malaysia",
    title: "SME Grants and Funding in Malaysia: Where to Look Before You Borrow",
    seoTitle: "SME Grants and Funding in Malaysia: Where to Look",
    seoDescription:
      "Government-backed grants, micro-financing and guarantees open to Malaysian SMEs, how eligibility works, and how to compare a grant with a loan.",
    coverImage: {
      file: "sme-grants-and-funding-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A hopeful small business owner at a desk with a laptop and paperwork, researching funding options",
      altTranslations: {
        zh: "一位满怀希望的小企业主坐在办公桌前,面前是笔记本电脑和文件,正在研究融资选择",
        ms: "Seorang pemilik perniagaan kecil yang penuh harapan di meja dengan komputer riba dan dokumen, sedang meneliti pilihan pembiayaan",
      },
    },
    contentImages: {
      compare: {
        file: "sme-grants-and-funding-in-malaysia-compare.webp",
        mimeType: "image/webp",
        alt: "Two business partners comparing financing documents with a calculator",
        altTranslations: {
          zh: "两位生意伙伴用计算器对比融资文件",
          ms: "Dua rakan kongsi perniagaan membandingkan dokumen pembiayaan dengan kalkulator",
        },
        after: "Put the offers side by side and ask what each one costs you in total, not just what it costs you per month.",
        afterTranslations: {
          zh: "把各项方案并排摆在一起,问问每一项总共要花您多少钱,而不只是每月要还多少。",
          ms: "Letakkan semua tawaran bersebelahan dan tanyakan berapakah jumlah kos setiap satu kepada anda, bukan sekadar berapa bayaran bulanannya.",
        },
      },
    },
    excerpt:
      "Before taking a bank loan, it pays to know what grants, micro-financing and guarantee schemes Malaysian SMEs can actually tap. This guide maps the main sources, explains how eligibility usually works, and shows how to compare a grant against a loan before committing to either.",
    body: `Most Malaysian small business owners think of funding as a single decision: go to a bank, ask for a loan. In reality there is a whole layer of government-backed support sitting before and alongside the bank — matching grants, subsidised micro-financing, and guarantee schemes that make it easier for a bank to say yes. None of it is free money in the sense that you can simply walk in and collect it, but knowing it exists can change both how much you borrow and what you pay for it.

One caution up front: schemes, budgets, caps and eligibility rules in this area change often, sometimes within the same year, and some are time-limited or run out of funds. Treat every figure you read in a guide like this one as a pointer, not a promise, and confirm the current terms on the agency's own official page before you plan around them.

## 1. Know the three kinds of funding on offer

It helps to separate what you are actually looking for, because the paperwork, risk and timing are very different.

- **Grants.** Money you do not repay, but usually tied to conditions — you spend on approved items, often with your own matching contribution, and you prove it afterwards.
- **Government-backed financing.** Loans or Islamic financing from government agencies or banks under a special programme, typically with a subsidised profit rate or a longer tenure than you would get on your own.
- **Guarantees.** Not money at all, but a promise to the bank that a guarantee agency will cover part of the loss if you default. They matter most when you have a viable business but not enough collateral.

Many owners end up combining them: a guarantee to get the loan approved, and a matching grant to cover part of the specific thing you are buying.

## 2. Look at grants first, especially for digital and export costs

Grants are the cheapest funding when you qualify, so they deserve the first look. The ones most relevant to a small business tend to fall into a few areas.

### Digitalisation grants

Recent budgets have repeatedly set aside money to help small businesses adopt digital tools — accounting software, point-of-sale, e-commerce, e-invoicing systems and similar. Programmes in this space have been described as matching grants, where the government covers a share of approved costs up to a modest cap, and you pay the rest. They have often been run through agencies such as SME Corp, MDEC and Bank Simpanan Nasional (BSN), frequently with the purchase made through a registered technology provider. Check which agency currently administers the scheme, which providers are accepted, and whether the budget is still open.

### Export and market development grants

If you sell, or want to sell, abroad, MATRADE has run market development support that reimburses part of the cost of things like trade fairs and overseas promotion, with applications handled through its online platform. This is a reimbursement model, so you normally need the cash to spend first.

### Sector, state and agency programmes

Beyond the national headline schemes, there are programmes tied to a sector (agriculture, manufacturing, tourism, creative content), a state government, a development agency, or a specific community. These are easy to miss because they are not widely advertised. Ask the business support officer at your local SME Corp or state agency office what is currently open — a ten-minute conversation can surface schemes you will not find on a search engine.

> A grant is rarely a way to fund a business that does not yet have a plan — it is a way to pay for part of something you were already going to do. Decide what you need first, then look for the scheme that covers it, rather than reshaping your plans around whatever funding happens to be open.

## 3. Understand the government-backed financing options

When a grant does not cover enough, or does not exist for what you need, the next layer is government-backed financing.

### Micro-financing for very small businesses

Agencies such as TEKUN Nasional and BSN have run micro-financing for small traders and micro-businesses, often at subsidised profit rates and with smaller ticket sizes than a commercial bank would bother with. Budgets have in recent years earmarked dedicated allocations for micro-loans through these channels. The maximum amount, the rate and who qualifies (some programmes are aimed at particular groups) differ between agencies and change over time, so read the current terms rather than relying on what a friend was offered last year.

### Development financial institutions and agency funds

Institutions such as Bank Rakyat, SME Bank, MARA and others offer financing aimed at specific kinds of SMEs, including entrepreneurs in particular communities or sectors. Their products often come with advisory support in addition to the loan itself.

### Bank Negara Malaysia funds channelled through banks

Bank Negara Malaysia has, from time to time, set up funds that commercial banks lend out on its behalf — sometimes for working capital, sometimes for specific purposes such as automation or recovery after a shock — usually at a capped rate and with a cap per borrower. You apply through a participating bank, not to the central bank directly, and these funds can be time-limited or close once the allocation is used up, so ask your bank which ones are currently open before you accept a standard product.

## 4. Use guarantees when collateral is the obstacle

Plenty of viable small businesses are turned down not because the idea is weak, but because they have no property or assets to pledge. This is where credit guarantee schemes come in. Syarikat Jaminan Pembiayaan Perniagaan (SJPP) and Credit Guarantee Corporation (CGC) offer guarantees that cover a portion of the financing, which lowers the bank's risk and makes approval more likely. In some special programmes the guaranteed portion and the guarantee period have been raised temporarily.

You do not usually apply to the guarantee agency yourself. You apply to a participating bank or financial institution and ask whether a guarantee-backed product suits your case. Be aware that a guarantee fee is generally part of the cost, and a guarantee does not mean you are off the hook — the bank can still pursue you, and the agency may then recover from you after paying out.

## 5. Check eligibility honestly before you spend time applying

Most schemes screen on a similar handful of things, and checking them first saves weeks of wasted effort.

- **Registration and ownership.** Registration with SSM, and often a minimum level of Malaysian ownership.
- **Business size.** Whether you meet the SME definition used by SME Corp, which depends on sector, turnover and number of employees.
- **Track record.** Some schemes require a minimum period of operation, such as several months or a year of trading.
- **Compliance.** A clean tax and statutory standing, and in some cases a clear CCRIS and credit record.
- **Purpose.** Whether what you want to spend the money on is actually covered. A grant for software will not fund a delivery van.

Gather your SSM documents, recent bank statements, financial statements or management accounts, and a short, plain-language explanation of what you will do with the money. Having these ready is half the application, and a vague or inconsistent set of documents is one of the most common reasons applications stall.

## 6. Compare a grant against a loan properly

Once you know your options, resist the urge to pick the one with the smallest monthly number. A loan, even a cheap one, is a commitment that must be repaid whether or not the project works. A grant carries conditions, timing risk and sometimes a cash-flow gap, because many are paid as reimbursements.

Put the offers side by side and ask what each one costs you in total, not just what it costs you per month. For a loan, work out the total repayment over the full tenure, including any processing, stamp duty, guarantee or insurance fees, and compare it with the amount you actually receive. For a grant, count your own matching contribution, the time and paperwork it takes, and how long you will wait before the money arrives.

### Questions worth asking about every option

1. What is the total amount I will pay or put in, from start to finish?
2. When does the money actually arrive, and do I have to pay first and be reimbursed later?
3. What happens if the project is delayed, cancelled, or changes scope?
4. Can the funding be combined with another scheme, or does taking one rule out the other?
5. Does the money cover exactly what I need, or will I have to top up the difference?

The best answer is often a mix: a matching grant for the specific tool or event, a small subsidised loan for working capital, and no more borrowing than the plan truly needs.

## 7. Common mistakes to avoid

- **Chasing the scheme instead of the need.** Owners sometimes change what they buy just to qualify for a scheme, then end up with something that does not help the business. Start from the business need and only then see what funding fits.
- **Relying on outdated information.** Budgets run out, caps change and schemes are renamed. Confirm with the agency or a participating bank that a scheme is still open and what its current terms are before you put effort into an application.
- **Ignoring the true cost of the "cheap" option.** A low headline rate can be offset by fees, a short tenure that strains cash flow, or conditions that tie you down. Compare total cost and flexibility, not just the headline number.

## 8. Where to start

This week, list what you actually need money for and roughly how much, then book a short conversation with your nearest SME Corp or state business-support office and your own bank's SME relationship officer to ask which schemes are open right now. Gather your SSM documents and recent accounts into one folder so you can apply quickly when something fits. It also helps to be easy to verify: [a free, verified listing](/en/signup) gives lenders, agencies and customers one more consistent place to confirm that your business is real and active, and it is worth [browsing the directory](/en) to see how other Malaysian businesses present themselves.`,
    faqs: [
      {
        question: "What is the difference between an SME grant and an SME loan in Malaysia?",
        answer:
          "A grant is money you generally do not repay, but it comes with conditions: you spend on approved items, often with your own matching contribution, and you provide proof afterwards. A loan or financing facility must be repaid with profit or interest regardless of how the project turns out. Grants are cheaper when you qualify, but they are limited in size and availability.",
      },
      {
        question: "Where should a Malaysian SME start looking for government funding?",
        answer:
          "A practical starting point is your nearest SME Corp or state business-support office, plus the websites of agencies that run schemes such as BSN, TEKUN Nasional, MDEC and MATRADE. Ask your bank's SME officer which government-backed or Bank Negara-linked facilities are currently open. Programmes and budgets change often, so always confirm current terms on the official page.",
      },
      {
        question: "Do I need to be registered with SSM to apply for SME grants or financing?",
        answer:
          "In almost every case, yes. Most schemes require your business to be registered with SSM, and many also look at your ownership structure and whether you meet the SME definition used by SME Corp. Some micro-financing for small traders has looser requirements, so check the specific scheme.",
      },
      {
        question: "What is a credit guarantee and do I apply to the guarantee agency?",
        answer:
          "A credit guarantee is a promise by an agency such as SJPP or CGC to cover part of a bank's loss if you default, which makes the bank more willing to lend when you lack collateral. You normally apply through a participating bank or financial institution rather than directly to the guarantee agency. A guarantee fee is usually part of the cost, and you remain responsible for the debt.",
      },
      {
        question: "Can a very small or home-based business get micro-financing?",
        answer:
          "Often yes. Agencies such as TEKUN Nasional and BSN have run micro-financing aimed at small traders and micro-businesses, usually in smaller amounts and sometimes at subsidised rates. The maximum amount, the rate and who qualifies differ by programme and change over time, so read the current terms before you apply.",
      },
      {
        question: "Can I combine a grant and a loan for the same project?",
        answer:
          "Sometimes, but it depends on each scheme's rules. Some programmes do not allow you to claim the same cost under more than one scheme. A common approach is to use a matching grant for a specific purchase and a loan for working capital. Ask each agency whether stacking is allowed before you commit.",
      },
      {
        question: "Why do many grants reimburse after I spend instead of paying upfront?",
        answer:
          "Many grants are structured as reimbursements so the agency can verify that the money was spent on approved items. That means you usually need enough cash or credit to pay first and claim later. Factor this timing gap into your cash flow, and ask the agency how long reimbursements typically take.",
      },
      {
        question: "How do I know whether a funding scheme is still open?",
        answer:
          "Check the administering agency's official website or contact them directly, and ask a participating bank if the scheme is lent out through banks. Funds can close early when the allocation is used up, and articles or social media posts may be out of date. Treat any amount or rate you read online as indicative until confirmed.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚中小企业补助与融资:借贷之前先看哪里",
        excerpt:
          "在向银行贷款之前,先了解马来西亚中小企业真正能申请到的补助、微型融资和担保计划,会让您更有底气。本指南梳理主要来源,说明资格审核通常如何运作,并教您在做决定前如何比较补助与贷款。",
        body: `大多数马来西亚小企业主把融资看成一个单一的决定:去银行申请贷款。实际上,在银行之前和之外,还有一整层政府支持的资源——配套补助、贴补的微型融资,以及让银行更容易点头的担保计划。这些并不是您走进去就能领取的免费资金,但知道它们的存在,可能会改变您借多少钱,以及为此付出多少成本。

先提醒一点:这一领域的计划、预算、上限和资格规定经常变动,有时同一年内就会调整,有些还有期限或额度用完即止。请把本指南里的每一个数字当作线索而不是保证,并在制定计划之前,到相关机构的官方网页确认最新条件。

## 1. 了解三种不同类型的资金

先分清您到底在找什么,因为文件、风险和时间表都大不相同。

- **补助(Grant)。** 不需要偿还的资金,但通常附带条件——您只能花在获批准的项目上,往往需要自己配套出一部分,事后还要提交证明。
- **政府支持的融资。** 由政府机构或银行在特别计划下提供的贷款或伊斯兰融资,通常有贴补的利润率,或比您自行申请更长的还款期。
- **担保。** 它本身不是钱,而是担保机构向银行承诺,一旦您违约会承担部分损失。当您的生意可行但缺乏抵押品时,担保最有用。

许多企业主最后会组合使用:用担保让贷款获批,再用配套补助支付某项具体的采购。

## 2. 先看补助,尤其是数码化和出口方面

符合条件时,补助是最便宜的资金,所以值得优先考虑。与小企业最相关的补助大致集中在几个领域。

### 数码化补助

近年的财政预算反复拨出资金,协助小企业采用数码工具——会计软件、销售点系统、电子商务、电子发票系统等。这类计划被描述为配套补助,即政府承担获批费用的一部分(有一定上限),其余由您自行支付。它们常通过 SME Corp、MDEC 和国民储蓄银行(BSN)等机构推行,采购往往要通过注册的技术供应商进行。请确认目前由哪个机构负责、接受哪些供应商,以及预算是否仍然开放。

### 出口与市场开拓补助

如果您已经在或想要向海外销售,MATRADE 曾提供市场开拓支援,补偿部分贸易展览和海外推广等费用,申请通过其线上平台办理。这是报销制,所以您通常需要先垫付现金。

### 行业、州属和机构计划

除了全国性的主打计划,还有与特定行业(农业、制造业、旅游业、创意内容)、州政府、发展机构或特定群体挂钩的计划。它们不常被广泛宣传,所以容易错过。不妨问问您当地 SME Corp 或州属机构办事处的商业辅导人员目前有哪些计划开放——十分钟的交谈,可能让您发现在搜索引擎上找不到的资源。

> 补助很少是用来资助一个还没有计划的生意——它是用来支付您本来就打算做的事情的一部分。先决定您需要什么,再去找能覆盖它的计划,而不是为了迁就碰巧开放的资金而改变自己的计划。

## 3. 了解政府支持的融资选项

当补助不够用,或者您需要的项目没有对应补助时,下一层就是政府支持的融资。

### 面向微型企业的微型融资

TEKUN Nasional 和 BSN 等机构曾为小贩和微型企业提供微型融资,通常利润率有贴补,金额也比商业银行愿意处理的更小。近年的预算也为通过这些渠道发放的微型贷款拨出专门的额度。最高金额、利率和资格(有些计划针对特定群体)因机构而异,并且会随时间变化,所以请阅读最新条件,而不要只依赖朋友去年得到的方案。

### 发展金融机构与机构基金

农民银行(Bank Rakyat)、中小企业银行(SME Bank)、MARA 等机构提供针对特定类型中小企业的融资,包括特定群体或行业的创业者。它们的产品除了贷款本身,往往还附带辅导支援。

### 通过银行发放的国家银行基金

马来西亚国家银行(BNM)不时会设立由商业银行代为放贷的基金——有时用于营运资金,有时用于自动化或受冲击后的复苏等特定用途——通常有利率上限,并对每位借款人设有金额上限。您要通过参与的银行申请,而不是直接向央行申请;这些基金可能有期限,或在额度用完后关闭,所以在接受标准产品之前,请先问您的银行目前有哪些基金开放。

## 4. 当抵押品成为障碍时,善用担保

许多可行的小企业被拒绝,并不是因为想法不好,而是因为没有可抵押的房产或资产。这时信用担保计划就派上用场了。企业融资担保公司(SJPP)和马来西亚信用担保公司(CGC)提供担保,覆盖融资的一部分,降低银行的风险,让获批的可能性更高。在某些特别计划中,担保比例和担保期限曾被暂时提高。

您通常不需要自己向担保机构申请,而是向参与的银行或金融机构申请,并询问有担保支持的产品是否适合您的情况。请注意,担保费通常是成本的一部分,而且担保并不代表您就没有责任——银行仍然可以向您追讨,担保机构赔付后也可能向您追偿。

## 5. 花时间申请之前,先诚实检查资格

大多数计划会筛选类似的几项条件,先检查一遍可以省下好几周的无用功。

- **注册与股权。** 在 SSM 注册,通常还要求一定比例的马来西亚人持股。
- **企业规模。** 是否符合 SME Corp 采用的中小企业定义,它取决于行业、营业额和员工人数。
- **营运记录。** 有些计划要求最低营运期限,例如几个月或一年的营业记录。
- **合规。** 税务和法定事项良好,有时还需要良好的 CCRIS 和信用记录。
- **用途。** 您想花钱的项目是否在涵盖范围内。资助软件的补助不会用来买送货货车。

把您的 SSM 文件、近期银行月结单、财务报表或管理账目,以及一份简短、通俗地说明您将如何使用这笔钱的文字准备好。文件齐全就等于完成了一半的申请,而文件含糊或前后不一致,是申请被搁置最常见的原因之一。

## 6. 正确地比较补助与贷款

了解了自己的选择之后,请克制只挑每月数字最小的那个的冲动。贷款即使很便宜,也是无论项目成败都必须偿还的承诺。补助则附带条件、时间风险,有时还有现金流缺口,因为许多补助是以报销方式发放的。

把各项方案并排摆在一起,问问每一项总共要花您多少钱,而不只是每月要还多少。对于贷款,算出整个还款期内的总还款额,包括手续费、印花税、担保费或保险费,并与您实际拿到的金额比较。对于补助,把您自己的配套出资、所需的时间和文书工作,以及资金到账前要等多久都算进去。

### 对每个选项都值得问的问题

1. 从头到尾,我总共要付出或投入多少?
2. 资金实际何时到账?我是否必须先垫付再报销?
3. 如果项目延误、取消或范围改变,会怎样?
4. 这项资金能否与其他计划合并使用,还是接受了一项就不能再申请另一项?
5. 这笔钱刚好够我需要的吗,还是我得自己补足差额?

最好的答案往往是组合:用配套补助支付特定的工具或活动,用小额贴补贷款解决营运资金,借款不超过计划真正需要的额度。

## 7. 常见错误

- **追着计划跑,而不是追着需求走。** 有些企业主为了符合某个计划而改变采购内容,结果买了对生意没有帮助的东西。应该先从业务需求出发,再看有什么资金适合。
- **依赖过时的信息。** 预算会用完,上限会调整,计划会改名。在投入精力申请之前,请向机构或参与的银行确认该计划仍然开放以及目前的条件。
- **忽视“便宜”选项的真实成本。** 较低的名义利率可能被各种费用、压缩现金流的短期限,或把您绑住的条件所抵消。请比较总成本和灵活性,而不只是名义数字。

## 8. 从哪里开始

本周先列出您实际需要资金做什么,以及大约需要多少,然后约您最近的 SME Corp 或州属商业辅导办事处,以及您自己银行的中小企业客户经理做一次简短交谈,问问目前有哪些计划开放。把您的 SSM 文件和近期账目整理到同一个文件夹里,这样在有合适的计划时就能快速申请。让别人容易核实您的企业也有帮助:[一份免费且经过核实的列表](/zh/signup)为贷款机构、政府机构和客户多提供了一个一致的地方,来确认您的企业真实存在且仍在营运,也值得[浏览目录](/zh),看看其他马来西亚企业是如何展示自己的。`,
        faqs: [
          {
            question: "在马来西亚,中小企业补助与中小企业贷款有什么区别?",
            answer:
              "补助通常是不需要偿还的资金,但附带条件:您只能花在获批准的项目上,往往需要自己配套出资,事后还要提供证明。贷款或融资则无论项目结果如何,都必须连同利润或利息一起偿还。符合条件时补助更便宜,但金额和名额都有限。",
          },
          {
            question: "马来西亚中小企业应该从哪里开始寻找政府资金?",
            answer:
              "实用的起点是您最近的 SME Corp 或州属商业辅导办事处,以及 BSN、TEKUN Nasional、MDEC 和 MATRADE 等推行计划的机构网站。也可以问问您银行的中小企业客户经理,目前有哪些政府支持或与国家银行相关的融资开放。计划和预算经常变动,所以请务必到官方网页确认最新条件。",
          },
          {
            question: "申请中小企业补助或融资,一定要在 SSM 注册吗?",
            answer:
              "几乎所有情况下都需要。大多数计划要求您的企业在 SSM 注册,许多还会审查股权结构,以及是否符合 SME Corp 采用的中小企业定义。一些面向小贩的微型融资要求较宽松,所以请核对具体计划。",
          },
          {
            question: "什么是信用担保?我需要向担保机构申请吗?",
            answer:
              "信用担保是 SJPP 或 CGC 等机构承诺在您违约时承担银行的部分损失,让银行在您缺乏抵押品时更愿意放贷。您通常是通过参与的银行或金融机构申请,而不是直接向担保机构申请。担保费通常是成本的一部分,而且债务责任仍然在您身上。",
          },
          {
            question: "非常小或在家经营的生意能取得微型融资吗?",
            answer:
              "通常可以。TEKUN Nasional 和 BSN 等机构曾提供面向小贩和微型企业的微型融资,金额通常较小,有时利率有贴补。最高金额、利率和资格因计划而异,并会随时间变化,所以申请前请先阅读最新条件。",
          },
          {
            question: "同一个项目可以同时使用补助和贷款吗?",
            answer:
              "有时可以,但要看各计划的规定。有些计划不允许同一笔费用在多个计划下重复申请。常见的做法是用配套补助支付某项具体采购,用贷款解决营运资金。在承诺之前,请先向各机构确认是否允许叠加。",
          },
          {
            question: "为什么许多补助是先花钱再报销,而不是预先拨款?",
            answer:
              "许多补助采用报销方式,是为了让机构能核实款项确实花在获批的项目上。这意味着您通常需要有足够的现金或信贷先垫付,事后再申请报销。请把这段时间差纳入现金流规划,并向机构询问报销通常需要多久。",
          },
          {
            question: "我怎么知道某个资金计划是否仍然开放?",
            answer:
              "请查看负责机构的官方网站或直接联系他们;如果计划是通过银行放贷的,也可以问问参与的银行。额度用完后基金可能提前关闭,网络文章或社交媒体帖子也可能已经过时。在得到确认之前,请把网上看到的任何金额或利率视为参考。",
          },
        ],
      },
      ms: {
        title: "Geran dan Pembiayaan PKS di Malaysia: Di Mana Hendak Mencari Sebelum Anda Berhutang",
        excerpt:
          "Sebelum mengambil pinjaman bank, ada baiknya anda tahu geran, pembiayaan mikro dan skim jaminan yang sebenarnya boleh diakses oleh PKS Malaysia. Panduan ini memetakan sumber utama, menerangkan cara kelayakan biasanya berfungsi, dan menunjukkan cara membandingkan geran dengan pinjaman sebelum anda memilih salah satu.",
        body: `Kebanyakan pemilik perniagaan kecil di Malaysia menganggap pembiayaan sebagai satu keputusan sahaja: pergi ke bank dan mohon pinjaman. Hakikatnya, terdapat satu lapisan sokongan yang disokong kerajaan sebelum dan di samping bank — geran padanan, pembiayaan mikro yang disubsidi, dan skim jaminan yang menjadikan bank lebih mudah untuk bersetuju. Semua ini bukan wang percuma yang boleh anda ambil begitu sahaja, tetapi mengetahui kewujudannya boleh mengubah berapa banyak yang anda pinjam dan berapa kos yang anda tanggung.

Satu peringatan awal: skim, bajet, had dan syarat kelayakan dalam bidang ini kerap berubah, kadangkala dalam tahun yang sama, dan ada yang terhad masa atau habis apabila dana diguna sepenuhnya. Anggaplah setiap angka dalam panduan seperti ini sebagai petunjuk dan bukan janji, dan sahkan terma semasa di laman web rasmi agensi sebelum anda merancang berdasarkannya.

## 1. Kenali tiga jenis pembiayaan yang ditawarkan

Adalah berguna untuk membezakan apa yang sebenarnya anda cari, kerana dokumen, risiko dan tempoh masanya sangat berbeza.

- **Geran.** Wang yang tidak perlu dibayar balik, tetapi biasanya disertai syarat — anda berbelanja untuk item yang diluluskan, selalunya dengan sumbangan padanan anda sendiri, dan anda membuktikannya selepas itu.
- **Pembiayaan disokong kerajaan.** Pinjaman atau pembiayaan Islam daripada agensi kerajaan atau bank di bawah program khas, lazimnya dengan kadar keuntungan yang disubsidi atau tempoh yang lebih panjang daripada yang anda perolehi sendiri.
- **Jaminan.** Bukan wang, tetapi janji kepada bank bahawa agensi penjamin akan menanggung sebahagian kerugian jika anda mungkir. Ia paling penting apabila perniagaan anda berdaya maju tetapi tidak mempunyai cukup cagaran.

Ramai pemilik akhirnya menggabungkannya: jaminan untuk mendapatkan kelulusan pinjaman, dan geran padanan untuk menampung sebahagian daripada pembelian tertentu.

## 2. Lihat geran dahulu, terutamanya untuk kos digital dan eksport

Geran ialah pembiayaan paling murah apabila anda layak, jadi ia wajar dilihat dahulu. Yang paling relevan untuk perniagaan kecil biasanya tertumpu pada beberapa bidang.

### Geran pendigitalan

Bajet kebelakangan ini berulang kali memperuntukkan dana untuk membantu perniagaan kecil menggunakan alat digital — perisian perakaunan, sistem terminal jualan, e-dagang, sistem e-invois dan seumpamanya. Program dalam bidang ini digambarkan sebagai geran padanan, iaitu kerajaan menanggung sebahagian kos yang diluluskan sehingga had yang sederhana, dan anda membayar selebihnya. Ia sering dilaksanakan melalui agensi seperti SME Corp, MDEC dan Bank Simpanan Nasional (BSN), dengan pembelian kerap dibuat melalui penyedia teknologi berdaftar. Semak agensi mana yang kini mentadbir skim itu, penyedia mana yang diterima, dan sama ada bajetnya masih terbuka.

### Geran eksport dan pembangunan pasaran

Jika anda menjual, atau mahu menjual, ke luar negara, MATRADE pernah menyediakan sokongan pembangunan pasaran yang menggantikan sebahagian kos seperti pameran perdagangan dan promosi luar negara, dengan permohonan dikendalikan melalui platform dalam talian mereka. Ini ialah model bayaran balik, jadi anda biasanya perlu mempunyai wang tunai untuk berbelanja terlebih dahulu.

### Program sektor, negeri dan agensi

Selain skim utama peringkat kebangsaan, terdapat program yang dikaitkan dengan sektor (pertanian, pembuatan, pelancongan, kandungan kreatif), kerajaan negeri, agensi pembangunan atau komuniti tertentu. Ia mudah terlepas pandang kerana tidak diiklankan secara meluas. Tanyakan pegawai sokongan perniagaan di pejabat SME Corp atau agensi negeri tempatan anda apa yang sedang dibuka — perbualan sepuluh minit boleh mendedahkan skim yang tidak akan anda temui di enjin carian.

> Geran jarang menjadi cara untuk membiayai perniagaan yang belum mempunyai pelan — ia cara untuk membayar sebahagian daripada sesuatu yang memang sudah anda rancang. Tentukan dahulu apa yang anda perlukan, kemudian cari skim yang menampungnya, dan jangan ubah pelan anda semata-mata mengikut pembiayaan yang kebetulan terbuka.

## 3. Fahami pilihan pembiayaan disokong kerajaan

Apabila geran tidak mencukupi, atau tidak wujud untuk keperluan anda, lapisan seterusnya ialah pembiayaan disokong kerajaan.

### Pembiayaan mikro untuk perniagaan yang sangat kecil

Agensi seperti TEKUN Nasional dan BSN pernah menyediakan pembiayaan mikro untuk peniaga kecil dan perniagaan mikro, selalunya pada kadar keuntungan yang disubsidi dan dengan jumlah yang lebih kecil daripada yang sanggup dikendalikan bank komersial. Bajet kebelakangan ini turut memperuntukkan dana khusus untuk pinjaman mikro melalui saluran ini. Jumlah maksimum, kadar dan siapa yang layak (sesetengah program disasarkan kepada kumpulan tertentu) berbeza antara agensi dan berubah mengikut masa, jadi baca terma semasa dan jangan bergantung pada tawaran yang diterima rakan anda tahun lalu.

### Institusi kewangan pembangunan dan dana agensi

Institusi seperti Bank Rakyat, SME Bank, MARA dan lain-lain menawarkan pembiayaan yang disasarkan kepada jenis PKS tertentu, termasuk usahawan dalam komuniti atau sektor tertentu. Produk mereka sering disertakan dengan sokongan nasihat selain pinjaman itu sendiri.

### Dana Bank Negara Malaysia yang disalurkan melalui bank

Bank Negara Malaysia dari semasa ke semasa menubuhkan dana yang dipinjamkan oleh bank komersial bagi pihaknya — kadangkala untuk modal kerja, kadangkala untuk tujuan khusus seperti automasi atau pemulihan selepas kejutan — biasanya dengan kadar yang dihadkan dan had bagi setiap peminjam. Anda memohon melalui bank yang mengambil bahagian, bukan terus kepada bank pusat, dan dana ini boleh terhad masa atau ditutup apabila peruntukan habis digunakan, jadi tanya bank anda dana mana yang sedang dibuka sebelum anda menerima produk standard.

## 4. Gunakan jaminan apabila cagaran menjadi halangan

Banyak perniagaan kecil yang berdaya maju ditolak bukan kerana idea mereka lemah, tetapi kerana tiada hartanah atau aset untuk dicagarkan. Di sinilah skim jaminan kredit berperanan. Syarikat Jaminan Pembiayaan Perniagaan (SJPP) dan Credit Guarantee Corporation (CGC) menawarkan jaminan yang menampung sebahagian daripada pembiayaan, yang mengurangkan risiko bank dan menjadikan kelulusan lebih berkemungkinan. Dalam sesetengah program khas, bahagian yang dijamin dan tempoh jaminan pernah dinaikkan buat sementara waktu.

Anda biasanya tidak memohon sendiri kepada agensi penjamin. Anda memohon kepada bank atau institusi kewangan yang mengambil bahagian dan bertanya sama ada produk yang disokong jaminan sesuai untuk kes anda. Ketahuilah bahawa yuran jaminan lazimnya sebahagian daripada kos, dan jaminan tidak bermakna anda terlepas — bank masih boleh menuntut daripada anda, dan agensi mungkin menuntut balik daripada anda selepas membayar.

## 5. Semak kelayakan dengan jujur sebelum anda membazir masa memohon

Kebanyakan skim menapis berdasarkan beberapa perkara yang sama, dan menyemaknya terlebih dahulu menjimatkan berminggu-minggu usaha yang sia-sia.

- **Pendaftaran dan pemilikan.** Pendaftaran dengan SSM, dan selalunya tahap minimum pemilikan rakyat Malaysia.
- **Saiz perniagaan.** Sama ada anda memenuhi takrifan PKS yang digunakan oleh SME Corp, yang bergantung pada sektor, perolehan dan bilangan pekerja.
- **Rekod prestasi.** Sesetengah skim memerlukan tempoh operasi minimum, seperti beberapa bulan atau setahun berniaga.
- **Pematuhan.** Kedudukan cukai dan berkanun yang baik, dan dalam sesetengah kes rekod CCRIS dan kredit yang bersih.
- **Tujuan.** Sama ada perkara yang ingin anda belanjakan dilindungi. Geran untuk perisian tidak akan membiayai van penghantaran.

Kumpulkan dokumen SSM anda, penyata bank terkini, penyata kewangan atau akaun pengurusan, dan penjelasan ringkas dalam bahasa mudah tentang apa yang akan anda lakukan dengan wang itu. Mempunyai semua ini siap sudah separuh daripada permohonan, dan dokumen yang kabur atau tidak konsisten ialah antara sebab paling biasa permohonan tersekat.

## 6. Bandingkan geran dengan pinjaman dengan betul

Setelah anda tahu pilihan anda, tahan keinginan untuk memilih yang mempunyai angka bulanan terkecil. Pinjaman, walaupun murah, ialah komitmen yang mesti dibayar balik sama ada projek berjaya atau tidak. Geran pula disertai syarat, risiko masa dan kadangkala jurang aliran tunai, kerana banyak yang dibayar sebagai bayaran balik.

Letakkan semua tawaran bersebelahan dan tanyakan berapakah jumlah kos setiap satu kepada anda, bukan sekadar berapa bayaran bulanannya. Bagi pinjaman, kira jumlah bayaran balik sepanjang tempoh penuh, termasuk yuran pemprosesan, duti setem, yuran jaminan atau insurans, dan bandingkan dengan jumlah yang sebenarnya anda terima. Bagi geran, kira sumbangan padanan anda sendiri, masa dan kerja dokumen yang diperlukan, dan berapa lama anda akan menunggu sebelum wang tiba.

### Soalan yang berbaloi ditanya tentang setiap pilihan

1. Berapakah jumlah yang akan saya bayar atau laburkan dari mula hingga akhir?
2. Bilakah wang sebenarnya tiba, dan adakah saya perlu membayar dahulu dan dibayar balik kemudian?
3. Apa yang berlaku jika projek ditangguhkan, dibatalkan atau berubah skop?
4. Bolehkah pembiayaan ini digabungkan dengan skim lain, atau mengambil satu menghalang yang lain?
5. Adakah wang itu menampung tepat apa yang saya perlukan, atau saya perlu menampung bezanya?

Jawapan terbaik selalunya gabungan: geran padanan untuk alat atau acara tertentu, pinjaman kecil bersubsidi untuk modal kerja, dan tidak meminjam lebih daripada yang benar-benar diperlukan oleh pelan anda.

## 7. Kesilapan lazim yang perlu dielakkan

- **Mengejar skim dan bukannya keperluan.** Sesetengah pemilik mengubah apa yang mereka beli semata-mata untuk layak bagi sesuatu skim, lalu berakhir dengan sesuatu yang tidak membantu perniagaan. Mulakan daripada keperluan perniagaan, kemudian lihat pembiayaan yang sesuai.
- **Bergantung pada maklumat yang sudah lapuk.** Bajet habis, had berubah dan skim dinamakan semula. Sahkan dengan agensi atau bank yang mengambil bahagian bahawa skim itu masih terbuka dan apa terma semasanya sebelum anda melaburkan usaha dalam permohonan.
- **Mengabaikan kos sebenar pilihan yang "murah".** Kadar tajuk yang rendah boleh diimbangi oleh yuran, tempoh pendek yang menekan aliran tunai, atau syarat yang mengikat anda. Bandingkan jumlah kos dan fleksibiliti, bukan sekadar angka tajuk.

## 8. Di mana hendak bermula

Minggu ini, senaraikan untuk apa sebenarnya anda memerlukan wang dan kira-kira berapa banyak, kemudian buat temu janji ringkas dengan pejabat sokongan perniagaan SME Corp atau negeri yang terdekat dan pegawai perhubungan PKS di bank anda sendiri untuk bertanya skim mana yang sedang dibuka. Kumpulkan dokumen SSM dan akaun terkini anda dalam satu folder supaya anda boleh memohon dengan cepat apabila ada yang sesuai. Ia juga membantu jika perniagaan anda mudah disahkan: [penyenaraian percuma yang disahkan](/ms/signup) memberi pemberi pinjaman, agensi dan pelanggan satu lagi tempat yang konsisten untuk mengesahkan bahawa perniagaan anda benar dan aktif, dan berbaloi untuk [menyemak imbas direktori](/ms) bagi melihat bagaimana perniagaan Malaysia lain mempersembahkan diri mereka.`,
        faqs: [
          {
            question: "Apakah perbezaan antara geran PKS dengan pinjaman PKS di Malaysia?",
            answer:
              "Geran biasanya wang yang tidak perlu dibayar balik, tetapi disertai syarat: anda berbelanja untuk item yang diluluskan, selalunya dengan sumbangan padanan anda sendiri, dan menyediakan bukti selepas itu. Pinjaman atau kemudahan pembiayaan mesti dibayar balik dengan keuntungan atau faedah tanpa mengira hasil projek. Geran lebih murah apabila anda layak, tetapi saiz dan ketersediaannya terhad.",
          },
          {
            question: "Di mana PKS Malaysia harus mula mencari pembiayaan kerajaan?",
            answer:
              "Titik permulaan yang praktikal ialah pejabat sokongan perniagaan SME Corp atau negeri yang terdekat, serta laman web agensi yang menjalankan skim seperti BSN, TEKUN Nasional, MDEC dan MATRADE. Tanya pegawai PKS di bank anda kemudahan mana yang disokong kerajaan atau dikaitkan dengan Bank Negara yang sedang dibuka. Program dan bajet kerap berubah, jadi sentiasa sahkan terma semasa di laman rasmi.",
          },
          {
            question: "Adakah saya perlu berdaftar dengan SSM untuk memohon geran atau pembiayaan PKS?",
            answer:
              "Dalam hampir semua kes, ya. Kebanyakan skim memerlukan perniagaan anda berdaftar dengan SSM, dan ramai juga menyemak struktur pemilikan serta sama ada anda memenuhi takrifan PKS yang digunakan oleh SME Corp. Sesetengah pembiayaan mikro untuk peniaga kecil mempunyai syarat yang lebih longgar, jadi semak skim yang khusus.",
          },
          {
            question: "Apakah jaminan kredit dan adakah saya memohon kepada agensi penjamin?",
            answer:
              "Jaminan kredit ialah janji oleh agensi seperti SJPP atau CGC untuk menanggung sebahagian kerugian bank jika anda mungkir, yang menjadikan bank lebih sanggup meminjamkan apabila anda tiada cagaran. Anda biasanya memohon melalui bank atau institusi kewangan yang mengambil bahagian dan bukannya terus kepada agensi penjamin. Yuran jaminan biasanya sebahagian daripada kos, dan anda masih bertanggungjawab ke atas hutang itu.",
          },
          {
            question: "Bolehkah perniagaan yang sangat kecil atau berasaskan rumah mendapat pembiayaan mikro?",
            answer:
              "Selalunya boleh. Agensi seperti TEKUN Nasional dan BSN pernah menyediakan pembiayaan mikro untuk peniaga kecil dan perniagaan mikro, biasanya dalam jumlah yang lebih kecil dan kadangkala pada kadar yang disubsidi. Jumlah maksimum, kadar dan kelayakan berbeza mengikut program dan berubah dari semasa ke semasa, jadi baca terma semasa sebelum memohon.",
          },
          {
            question: "Bolehkah saya menggabungkan geran dan pinjaman untuk projek yang sama?",
            answer:
              "Kadangkala boleh, tetapi bergantung pada peraturan setiap skim. Sesetengah program tidak membenarkan anda menuntut kos yang sama di bawah lebih daripada satu skim. Pendekatan biasa ialah menggunakan geran padanan untuk pembelian tertentu dan pinjaman untuk modal kerja. Tanya setiap agensi sama ada penggabungan dibenarkan sebelum anda membuat komitmen.",
          },
          {
            question: "Mengapa banyak geran membayar balik selepas saya berbelanja dan bukannya membayar di awal?",
            answer:
              "Banyak geran distruktur sebagai bayaran balik supaya agensi boleh mengesahkan bahawa wang dibelanjakan untuk item yang diluluskan. Ini bermakna anda biasanya memerlukan wang tunai atau kredit yang mencukupi untuk membayar dahulu dan menuntut kemudian. Masukkan jurang masa ini dalam aliran tunai anda, dan tanya agensi berapa lama bayaran balik biasanya mengambil masa.",
          },
          {
            question: "Bagaimana saya tahu sama ada sesuatu skim pembiayaan masih dibuka?",
            answer:
              "Semak laman web rasmi agensi yang mentadbir atau hubungi mereka terus, dan tanya bank yang mengambil bahagian jika skim itu disalurkan melalui bank. Dana boleh ditutup lebih awal apabila peruntukan habis, dan artikel atau hantaran media sosial mungkin sudah lapuk. Anggap sebarang jumlah atau kadar yang anda baca dalam talian sebagai petunjuk sehingga disahkan.",
          },
        ],
      },
    },
  },
  {
    slug: "business-insurance-for-malaysian-smes",
    title: "Business Insurance for Malaysian SMEs: What You Actually Need to Cover",
    seoTitle: "Business Insurance for Malaysian SMEs: What to Cover",
    seoDescription:
      "Fire, public liability, SOCSO vs private cover, professional indemnity and business interruption: what a Malaysian SME needs, and claim traps to avoid.",
    coverImage: {
      file: "business-insurance-for-malaysian-smes-cover.webp",
      mimeType: "image/webp",
      alt: "A smiling business owner working at his desk on a computer in a bright office",
      altTranslations: {
        zh: "一位面带微笑的企业主在明亮的办公室里用电脑工作",
        ms: "Seorang pemilik perniagaan tersenyum sambil bekerja pada komputer di pejabat yang cerah",
      },
    },
    contentImages: {
      "policy-review": {
        file: "business-insurance-for-malaysian-smes-policy-review.webp",
        mimeType: "image/webp",
        alt: "Two colleagues going through a binder of documents together in an office",
        altTranslations: {
          zh: "两位同事在办公室里一起翻阅文件夹中的文件",
          ms: "Dua rakan sekerja menyemak fail dokumen bersama-sama di pejabat",
        },
        after: "Review each policy against your real situation, not just the premium quote.",
        afterTranslations: {
          zh: "请对照您的实际情况来审视每一份保单，而不是只看保费报价。",
          ms: "Semak setiap polisi berdasarkan situasi sebenar anda, bukan sekadar sebut harga premium.",
        },
      },
    },
    excerpt:
      "Most small businesses are either uninsured or insured for the wrong things. This guide explains the main policies a Malaysian SME should consider — fire and property, public liability, workers' injury cover through SOCSO versus private plans, professional indemnity, and business interruption — what each does and doesn't cover, and the traps that get claims rejected.",
    body: `Insurance is the purchase most small business owners put off, because the premium is certain and the loss is not. Then a fire, a customer injury, or a burst pipe happens and the difference between a business that recovers and one that closes can come down to a single piece of paper. The goal of this guide is not to sell you every policy that exists. It is to help you work out which risks could actually sink your business, which policies address them, and where claims most often go wrong.

This is general information, not financial or insurance advice. Products, wording, and legal requirements vary by insurer and change over time, so confirm details with a licensed insurance agent or broker and read the policy document before buying.

## 1. Start with risks, not products

The wrong way to buy insurance is to ask "what policies are there?" The right way is to list what could realistically happen to your business and rank it by how badly it would hurt.

### Ask three questions about each risk
- **How likely is it?** A kitchen fire is far more likely in a food business than in a design studio.
- **How bad would it be?** Could you absorb the cost from savings, or would it end the business?
- **Is someone else relying on you?** Landlords, lenders, and large customers often require specific cover as a condition of dealing with you, which turns "optional" into "mandatory".

Risks that are frequent but small are usually cheaper to absorb yourself. Risks that are rare but catastrophic are what insurance is actually for. That is where most of your budget should go.

## 2. Fire and property cover

For anyone with premises, stock, or equipment, this is usually the first policy to look at. It covers physical loss or damage to your property from named perils, with fire being the core one, and extensions can add things like flood, burglary, or equipment breakdown.

### Decide what you are insuring
Separate the building (if you own it), your renovations and fittings, your equipment, and your stock. Each needs its own sum insured, and a landlord's policy typically covers the building but not your contents.

### Beware underinsurance and the average clause
If you insure your property for less than it is really worth and then make a claim, many policies apply an "average clause", which means the insurer pays only a proportion of the loss. Insure for a figure that reflects the real replacement cost, and review it as prices and your stock levels change. Industry bodies publish rebuilding-cost estimators for buildings, which can help as a rough guide.

### Takaful is an option
If you prefer a Shariah-compliant arrangement, takaful providers offer equivalent products. Compare the cover, not just the label.

## 3. Public liability

Public liability pays when a customer, visitor, or other third party suffers injury or property damage that you are legally liable for — a customer slips on a wet floor, or a falling signboard damages a parked car. It is typically not compulsory for most businesses by law, but a landlord, a shopping centre, an event organiser, or a corporate customer may require it, and the legal costs of defending even a weak claim can be significant.

Check the limit per claim, whether legal costs sit inside or on top of that limit, and any exclusions for activities your business actually does.

## 4. Protecting your people: SOCSO and private cover

### Employment injury under SOCSO
Employers covered by the Employees' Social Security Act 1969 contribute to SOCSO (PERKESO), whose Employment Injury Scheme provides benefits to eligible employees injured at work or while commuting for work. Foreign workers have also been brought under the Employment Injury Scheme in recent years. Registering and contributing correctly is a legal duty, and it is also your first layer of protection for work injuries. Check PERKESO's current guidance on who must be registered and which benefits apply.

### Where private cover fits
SOCSO is a safety net with defined benefits, not a full replacement for private medical or group insurance. Private personal accident, group hospitalisation, or group life policies can fill gaps and help you retain staff. Foreign workers may also have separate medical or hospitalisation insurance requirements, so confirm what applies to your workforce.

### Do not confuse SOCSO with employer liability
SOCSO benefits are paid under a statutory scheme. If you want protection against claims beyond the statutory scheme, ask a broker whether an employer's liability or similar extension makes sense for your business.

## 5. Professional indemnity

If you give advice, design, or specialist services — consulting, accounting, architecture, IT, marketing, engineering — a mistake can cost your client money, and they may sue you for it. Professional indemnity covers the legal costs and damages from claims of negligence or errors in your professional work. Some professions and some contracts make it effectively mandatory.

Pay attention to the retroactive date and whether cover is "claims made", because many policies only respond to claims first made during the policy period. Letting a policy lapse can leave past work uncovered.

## 6. Business interruption

Fire insurance pays to repair your property. It does not usually pay your rent, wages, and loan instalments while you cannot trade. Business interruption cover is designed to replace lost gross profit and ongoing costs after an insured event, such as a fire that closes your shop for months.

Surveys of Malaysian SMEs have repeatedly found far more businesses exposed to interruption than are covered for it. If your business would struggle to survive three months of closure, this cover deserves a hard look. Note that it is normally triggered by physical damage from an insured peril, not by a drop in demand.

## 7. Other covers worth knowing about

- **Motor and commercial vehicle.** If you use vehicles, third-party motor cover is a legal requirement for the vehicles themselves. Check commercial use is declared.
- **Goods in transit and stock.** Relevant if you ship or deliver goods.
- **Product liability.** For manufacturers and food producers whose products could harm a customer.
- **Cyber and data.** Increasingly relevant for businesses holding customer data or selling online.
- **Money, fidelity, and cash-in-transit.** For businesses handling significant cash or exposed to employee dishonesty.
- **Bundled small-business packages.** Several insurers sell packages for shops, restaurants, and offices that combine fire, theft, liability, and more. They can be a cost-effective starting point if the cover matches your risks.

> The most useful habit is to read the "what is not covered" section first. Exclusions, conditions, and warranties — such as security requirements or maintenance obligations — decide whether a claim is paid, and they are what most owners skip.

## 8. Choose cover and a provider sensibly

Review each policy against your real situation, not just the premium quote. A few practical rules help:

1. **Use a licensed intermediary.** Insurers and intermediaries operate under Bank Negara Malaysia's regulatory framework, so check that an agent or broker is properly licensed.
2. **Get at least two or three quotes.** Compare sums insured, excesses, exclusions, and extensions, not only the price.
3. **Choose sensible excesses.** A higher excess lowers the premium, but only if you could genuinely afford to pay it in a bad month.
4. **Declare everything honestly.** Accurate answers about your premises, activities, and claims history protect your claim later.
5. **Keep a record.** Store the policy, schedule, and endorsements somewhere you can find them in an emergency, and note renewal dates.
6. **Know the complaint route.** If a claim dispute cannot be resolved with the insurer, there is an independent dispute resolution body for financial consumers. Check the current options.

Being easy to find and verify also matters to the partners and customers who ask about your cover — [a free, verified listing here](/en/signup) helps present your business as established and trustworthy, and you can [browse the directory](/en) for local insurance agents and brokers who work with small businesses.

## Common mistakes Malaysian SMEs make with business insurance

- **Underinsuring to save on premium.** A sum insured far below real replacement value can trigger the average clause, leaving you paying much of the loss yourself.
- **Assuming fire cover also covers lost income.** Without business interruption cover, the repair bill might be paid while your rent, wages, and loan repayments are not.
- **Not disclosing changes.** A new activity, a different use of the premises, or an expanded stock room that you never told the insurer about can give grounds to reduce or reject a claim.

## Where to start

- **This week:** List your five biggest ways to lose money — fire, theft, a customer injury, a key person unavailable, a long closure — and put a rough cost next to each.
- **Next:** Check what you already have, including landlord cover, SOCSO registration, and any bank-required policies, and note what is missing.
- **Then:** Ask a licensed agent or broker for quotes on the one or two gaps that could actually end the business, and compare exclusions as carefully as prices.
- **Every year:** Re-check sums insured and renewals, and update your insurer when your premises, stock, activities, or headcount change.

Good insurance is not about covering everything. It is about making sure the worst realistic day for your business is one you can recover from.`,
    faqs: [
      {
        question: "What insurance does a small business in Malaysia legally have to have?",
        answer:
          "It depends on your business. Employers covered by the Employees' Social Security Act must register and contribute to SOCSO, and third-party motor cover is required for vehicles. Many other policies, such as fire and public liability, are not generally compulsory by law but may be required by a landlord, lender, or customer. Check your lease and contracts, and confirm current legal requirements with the relevant authority.",
      },
      {
        question: "What does fire insurance cover, and is it enough?",
        answer:
          "Fire insurance covers physical loss or damage to your property from named perils, mainly fire, with optional extensions such as flood or burglary. It usually does not replace lost income while you cannot trade, which is what business interruption cover is for. Make sure the sum insured reflects the real replacement cost to avoid the average clause.",
      },
      {
        question: "What is the average clause?",
        answer:
          "If your property is insured for less than its real value, many policies apply an average clause, meaning the insurer pays only a proportion of any loss. Insuring for a realistic replacement value, and reviewing it regularly, is the main protection.",
      },
      {
        question: "Do I still need private insurance if my staff are covered by SOCSO?",
        answer:
          "SOCSO's Employment Injury Scheme provides statutory benefits for eligible workplace injuries, but it is a safety net rather than full cover. Private personal accident, group hospitalisation, or group life plans can fill gaps and help retain staff. Foreign workers may have separate insurance requirements, so check what applies to your workforce.",
      },
      {
        question: "Who needs professional indemnity insurance?",
        answer:
          "Anyone who gives advice, design, or specialist services where an error could cost a client money, such as consultants, accountants, IT firms, and designers. Some professions and contracts effectively require it. Check whether the policy is claims-made and what its retroactive date is.",
      },
      {
        question: "What is business interruption insurance?",
        answer:
          "It replaces lost gross profit and ongoing costs, such as rent and wages, after an insured event like a fire closes your premises. It is normally triggered by physical damage from an insured peril rather than by a fall in demand, and it is often bought alongside fire cover.",
      },
      {
        question: "Why do insurance claims get rejected?",
        answer:
          "Common reasons include underinsurance, failing to disclose changes in your activities or premises, breaching policy conditions or warranties such as security requirements, claiming for an excluded event, and notifying the insurer too late. Reading the exclusions and conditions before you buy reduces the risk.",
      },
      {
        question: "How do I choose an insurance provider?",
        answer:
          "Use a properly licensed agent or broker, get several quotes, and compare sums insured, excesses, exclusions, and extensions rather than just the price. Takaful is available if you prefer a Shariah-compliant option. Keep your policy documents and renewal dates in one place.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚中小企业的商业保险：您真正需要投保什么",
        excerpt:
          "大多数小企业要么没有投保，要么投保的并不是真正需要的险种。本指南说明马来西亚中小企业应考虑的主要保单——火险与财产险、公共责任险、通过 SOCSO 与私人计划提供的员工工伤保障、专业赔偿险和营业中断险——它们分别保什么、不保什么，以及哪些陷阱会导致理赔被拒。",
        body: `保险是大多数小企业主最容易拖延的支出，因为保费是确定的，而损失却不确定。然后火灾、顾客受伤或水管爆裂真的发生了，企业是能恢复还是就此倒闭，可能就取决于一份保单。本指南的目的不是向您推销所有存在的保险，而是帮助您弄清楚，哪些风险真的可能压垮您的企业、有哪些保单可以应对，以及理赔最常在哪里出问题。

以下仅为一般资讯，并非财务或保险建议。产品、条款和法律规定因保险公司而异，也会随时间变化，购买前请向持牌保险代理或经纪确认细节，并阅读保单文件。

## 1. 从风险出发，而不是从产品出发

购买保险的错误方式，是问“有哪些保单？”正确的方式是列出您的企业现实中可能发生的事，并按对企业的伤害程度排序。

### 对每项风险问三个问题
- **发生的可能性有多大？** 餐饮企业发生厨房火灾的可能性，远高于设计工作室。
- **后果有多严重？** 您能用储蓄承担这笔费用，还是会让企业倒闭？
- **是否有人依赖您？** 房东、贷款机构和大客户常常要求您投保特定险种，作为与您往来的条件，这会让“可选”变成“必须”。

经常发生但金额小的风险，通常自己承担更划算。罕见但后果严重的风险，才是保险真正的用途，也是您大部分预算应该投放的地方。

## 2. 火险与财产险

对任何拥有经营场所、存货或设备的企业，这通常是首先要考虑的保单。它承保您的财产因列明风险而受到的实质损失或损坏，核心是火灾，附加条款可以加入水灾、盗窃或设备故障等。

### 先决定要保什么
把建筑物（如果是您自己的）、您的装修和固定设施、设备以及存货分开。每一项都需要各自的保额，而房东的保单通常只保建筑物，不保您的物品。

### 小心保额不足与比例分摊条款
如果您投保的金额低于财产的真实价值，之后再索赔，许多保单会适用“比例分摊条款”（average clause），也就是保险公司只赔付损失的一部分。请按真实的重置成本投保，并随着价格和存货水平的变化定期检视。业界机构公布的重建成本估算工具，可作为粗略的参考。

### 回教保险（Takaful）也是选择
如果您偏好符合伊斯兰教法的安排，回教保险（takaful）公司提供对等的产品。请比较保障内容，而不是只看名称。

## 3. 公共责任险

公共责任险赔付顾客、访客或其他第三方因您而遭受的人身伤害或财产损失，且您在法律上须负责——例如顾客在湿滑的地板上滑倒，或掉下的招牌砸坏了停放的汽车。对大多数企业而言，法律上通常并不强制，但房东、购物中心、活动主办方或企业客户可能要求投保，而且即使是站不住脚的索赔，辩护的法律费用也可能相当可观。

请查看每宗索赔的限额、法律费用是计入还是在限额之外，以及对您企业实际从事的活动有哪些除外责任。

## 4. 保障您的员工：SOCSO 与私人保障

### SOCSO 下的工伤保障
受《1969 年雇员社会保险法令》约束的雇主须向 SOCSO（PERKESO）供款，其雇佣伤害计划（Employment Injury Scheme）为符合资格的雇员，在工作中或上下班途中受伤时提供福利。近年来，外籍员工也已被纳入雇佣伤害计划。正确注册和供款是法律义务，也是您应对工伤的第一层保护。请查看 PERKESO 的最新指引，了解谁必须注册以及适用哪些福利。

### 私人保障的定位
SOCSO 是提供固定福利的安全网，并不能完全取代私人医疗或团体保险。私人的个人意外险、团体住院险或团体人寿险，可以弥补缺口并帮助您留住员工。外籍员工也可能有单独的医疗或住院保险要求，所以请确认适用于您员工的规定。

### 不要把 SOCSO 与雇主责任险混为一谈
SOCSO 福利是依法定计划支付的。如果您希望对法定计划之外的索赔也有保障，请询问经纪，雇主责任险或类似的附加保障是否适合您的企业。

## 5. 专业赔偿险

如果您提供意见、设计或专业服务——咨询、会计、建筑、资讯科技、营销、工程——一个错误可能让客户蒙受金钱损失，他们也可能因此起诉您。专业赔偿险涵盖因您专业工作中的疏忽或错误而被索赔的法律费用与赔偿。某些专业和某些合约实际上要求必须投保。

请留意“追溯日期”，以及保单是否为“索赔提出制”（claims made），因为许多保单只对在保单期间首次提出的索赔作出回应。让保单失效，可能使过去的工作失去保障。

## 6. 营业中断险

火险赔付的是修复您的财产，通常并不赔付您无法营业期间的租金、工资和贷款分期。营业中断险旨在发生受保事故（例如火灾导致您的店铺关闭数月）之后，补偿损失的毛利和持续的开支。

对马来西亚中小企业的调查一再发现，面临营业中断风险的企业，远多于已购买相关保障的企业。如果您的企业撑不过三个月的停业，这项保障值得认真考虑。请注意，它通常由受保风险造成的实质损失触发，而不是由需求下滑触发。

## 7. 值得了解的其他保障

- **汽车与商业车辆。** 如果您使用车辆，车辆本身的第三者汽车保险是法律要求。请确认已申报商业用途。
- **运输中货物与存货。** 适用于运送或配送货物的企业。
- **产品责任险。** 适用于其产品可能伤害顾客的制造商和食品生产商。
- **网络与数据保险。** 对持有客户资料或网上销售的企业越来越重要。
- **现金、诚信与押运现金保险。** 适用于处理大量现金或面临员工不诚实风险的企业。
- **小企业综合套装保险。** 多家保险公司为店铺、餐馆和办公室推出结合火险、盗窃险、责任险等的套装。如果保障符合您的风险，它们可以是一个划算的起点。

> 最有用的习惯，是先读“不保什么”的部分。除外责任、条件和保证条款——例如保安要求或维修义务——决定了理赔是否会获得赔付，而这些正是大多数企业主跳过不看的内容。

## 8. 明智地选择保障与提供者

请对照您的实际情况来审视每一份保单，而不是只看保费报价。几条实用规则有帮助：

1. **通过持牌中介。** 保险公司和中介机构受国家银行的监管框架约束，所以请确认代理或经纪是否持有正式执照。
2. **至少取得两三份报价。** 比较保额、自负额、除外责任和附加条款，而不只是价格。
3. **选择合理的自负额。** 较高的自负额可以降低保费，但前提是在不景气的月份您真的付得起。
4. **如实申报一切。** 对您的经营场所、业务活动和索赔记录作出准确的回答，会在日后保护您的理赔。
5. **保存记录。** 把保单、保险明细表和批单存放在紧急时找得到的地方，并记下续保日期。
6. **了解投诉途径。** 如果理赔争议无法与保险公司解决，金融消费者有独立的争议解决机构。请查看目前的选项。

对于询问您保障情况的合作伙伴和客户来说，容易被找到和验证也很重要——[在这里免费创建认证列表](/zh/signup)有助于展示您的企业稳健可信，您也可以[浏览目录](/zh)，找到与小企业合作的本地保险代理和经纪。

## 马来西亚中小企业在商业保险上常犯的错误

- **为省保费而保额不足。** 保额远低于真实重置价值，可能触发比例分摊条款，使您自己承担大部分损失。
- **以为火险也保收入损失。** 没有营业中断险，修复费用也许能获得赔付，而您的租金、工资和贷款还款却没有。
- **没有申报变更。** 新增的业务活动、经营场所的不同用途，或扩大的存货室，如果您从未告知保险公司，可能成为减少或拒绝理赔的理由。

## 从哪里开始

- **本周：** 列出您最大的五种亏损方式——火灾、盗窃、顾客受伤、关键人员缺席、长期停业——并在每一项旁写下粗略的成本。
- **接下来：** 检查您已经拥有的保障，包括房东的保险、SOCSO 注册和银行要求的任何保单，并记下欠缺的部分。
- **然后：** 就那一两个真正可能令企业倒闭的缺口，向持牌代理或经纪取得报价，并像比较价格一样仔细比较除外责任。
- **每年：** 重新检查保额和续保，并在您的经营场所、存货、业务活动或员工人数有变化时通知保险公司。

好的保险不是什么都保，而是确保您企业最坏的现实一天，仍是您能够恢复的一天。`,
        faqs: [
          {
            question: "在马来西亚，小企业在法律上必须投保哪些保险？",
            answer:
              "视您的企业而定。受《雇员社会保险法令》约束的雇主必须向 SOCSO 注册并供款，车辆须有第三者汽车保险。许多其他保单，例如火险和公共责任险，一般法律上并不强制，但房东、贷款机构或客户可能要求。请查看您的租约和合约，并向相关机构确认目前的法律要求。",
          },
          {
            question: "火险保什么？这样就够了吗？",
            answer:
              "火险承保您的财产因列明风险（主要是火灾）而受到的实质损失或损坏，并可附加水灾或盗窃等选项。它通常不赔付您无法营业期间损失的收入，那是营业中断险的用途。请确保保额反映真实的重置成本，以避免比例分摊条款。",
          },
          {
            question: "什么是比例分摊条款（average clause）？",
            answer:
              "如果您的财产投保金额低于其真实价值，许多保单会适用比例分摊条款，也就是保险公司只赔付损失的一部分。按现实的重置价值投保并定期检视，是主要的保护方式。",
          },
          {
            question: "员工已有 SOCSO 保障，我还需要私人保险吗？",
            answer:
              "SOCSO 的雇佣伤害计划为符合资格的工伤提供法定福利，但那是安全网，并非完整保障。私人的个人意外险、团体住院险或团体人寿险可以弥补缺口并帮助留住员工。外籍员工可能有单独的保险要求，请确认适用于您员工的规定。",
          },
          {
            question: "谁需要专业赔偿险？",
            answer:
              "任何提供意见、设计或专业服务，且错误可能令客户蒙受金钱损失的人，例如顾问、会计师、资讯科技公司和设计师。某些专业和合约实际上要求投保。请查看保单是否为索赔提出制，以及其追溯日期是什么。",
          },
          {
            question: "什么是营业中断险？",
            answer:
              "它在发生受保事故（例如火灾令您的经营场所关闭）之后，补偿损失的毛利和持续的开支，例如租金和工资。它通常由受保风险造成的实质损失触发，而不是由需求下降触发，且常常与火险一起购买。",
          },
          {
            question: "为什么保险理赔会被拒绝？",
            answer:
              "常见原因包括保额不足、没有申报业务活动或经营场所的变更、违反保单条件或保证条款（例如保安要求）、对除外事故提出索赔，以及太迟通知保险公司。购买前阅读除外责任和条件，可以降低风险。",
          },
          {
            question: "我该如何选择保险提供者？",
            answer:
              "通过持有正式执照的代理或经纪，取得多份报价，并比较保额、自负额、除外责任和附加条款，而不只是价格。如果您偏好符合伊斯兰教法的选择，也可以选回教保险（takaful）。请把保单文件和续保日期放在同一个地方。",
          },
        ],
      },
      ms: {
        title: "Insurans Perniagaan untuk PKS Malaysia: Apa yang Sebenarnya Perlu Anda Lindungi",
        excerpt:
          "Kebanyakan perniagaan kecil sama ada tidak diinsuranskan atau diinsuranskan untuk perkara yang salah. Panduan ini menerangkan polisi utama yang patut dipertimbangkan oleh PKS Malaysia — kebakaran dan harta, liabiliti awam, perlindungan kecederaan pekerja melalui PERKESO berbanding pelan swasta, indemniti profesional, dan gangguan perniagaan — apa yang dilindungi dan tidak dilindungi oleh setiap satu, serta perangkap yang menyebabkan tuntutan ditolak.",
        body: `Insurans ialah pembelian yang paling kerap ditangguhkan oleh pemilik perniagaan kecil, kerana premiumnya pasti manakala kerugiannya tidak. Kemudian kebakaran, kecederaan pelanggan, atau paip pecah berlaku dan perbezaan antara perniagaan yang pulih dengan yang ditutup boleh bergantung pada sehelai kertas. Tujuan panduan ini bukan untuk menjual setiap polisi yang wujud kepada anda. Ia untuk membantu anda memikirkan risiko mana yang benar-benar boleh menenggelamkan perniagaan anda, polisi mana yang menanganinya, dan di mana tuntutan paling kerap menjadi masalah.

Ini ialah maklumat am, bukan nasihat kewangan atau insurans. Produk, perkataan polisi, dan keperluan undang-undang berbeza mengikut penanggung insurans dan berubah dari semasa ke semasa, jadi sahkan butirannya dengan ejen atau broker insurans berlesen dan baca dokumen polisi sebelum membeli.

## 1. Mulakan dengan risiko, bukan produk

Cara yang salah untuk membeli insurans ialah bertanya "apa polisi yang ada?" Cara yang betul ialah menyenaraikan apa yang secara realistik boleh berlaku kepada perniagaan anda dan menyusunnya mengikut betapa teruk kesannya.

### Tanya tiga soalan tentang setiap risiko
- **Sejauh mana kemungkinannya?** Kebakaran dapur jauh lebih mungkin berlaku dalam perniagaan makanan berbanding studio reka bentuk.
- **Seteruk mana kesannya?** Bolehkah anda menanggung kosnya daripada simpanan, atau adakah ia akan menamatkan perniagaan?
- **Adakah orang lain bergantung kepada anda?** Tuan tanah, pemberi pinjaman, dan pelanggan besar sering memerlukan perlindungan tertentu sebagai syarat berurusan dengan anda, yang menukar "pilihan" kepada "wajib".

Risiko yang kerap tetapi kecil biasanya lebih murah untuk anda tanggung sendiri. Risiko yang jarang tetapi dahsyat ialah tujuan sebenar insurans. Di situlah kebanyakan bajet anda patut disalurkan.

## 2. Perlindungan kebakaran dan harta

Bagi sesiapa yang mempunyai premis, stok, atau peralatan, ini biasanya polisi pertama yang perlu dilihat. Ia melindungi kehilangan atau kerosakan fizikal pada harta anda daripada risiko yang dinamakan, dengan kebakaran sebagai teras, dan lanjutan boleh menambah perkara seperti banjir, pecah rumah, atau kerosakan peralatan.

### Tentukan apa yang anda insuranskan
Asingkan bangunan (jika anda memilikinya), ubah suai dan lekapan anda, peralatan anda, dan stok anda. Setiap satu memerlukan jumlah diinsuranskan sendiri, dan polisi tuan tanah lazimnya melindungi bangunan tetapi bukan kandungan anda.

### Berhati-hati dengan kurang insurans dan fasal purata
Jika anda menginsuranskan harta anda pada nilai yang kurang daripada sebenar dan kemudian membuat tuntutan, banyak polisi menggunakan "fasal purata" (average clause), bermakna penanggung insurans hanya membayar sebahagian daripada kerugian. Insuranskan pada angka yang mencerminkan kos penggantian sebenar, dan semaknya apabila harga dan paras stok anda berubah. Badan industri menerbitkan penganggar kos pembinaan semula untuk bangunan, yang boleh membantu sebagai panduan kasar.

### Takaful ialah satu pilihan
Jika anda lebih suka pengaturan yang patuh Syariah, penyedia takaful menawarkan produk yang setara. Bandingkan perlindungan, bukan sekadar label.

## 3. Liabiliti awam

Liabiliti awam membayar apabila pelanggan, pelawat, atau pihak ketiga lain mengalami kecederaan atau kerosakan harta yang anda bertanggungjawab dari segi undang-undang — pelanggan tergelincir di lantai basah, atau papan tanda jatuh merosakkan kereta yang diparkir. Ia lazimnya tidak diwajibkan oleh undang-undang untuk kebanyakan perniagaan, tetapi tuan tanah, pusat membeli-belah, penganjur acara, atau pelanggan korporat mungkin memerlukannya, dan kos undang-undang untuk membela walaupun tuntutan yang lemah boleh menjadi besar.

Semak had bagi setiap tuntutan, sama ada kos undang-undang berada di dalam atau di atas had itu, dan sebarang pengecualian untuk aktiviti yang sebenarnya dilakukan oleh perniagaan anda.

## 4. Melindungi pekerja anda: PERKESO dan perlindungan swasta

### Kecederaan pekerjaan di bawah PERKESO
Majikan yang dilindungi Akta Keselamatan Sosial Pekerja 1969 mencarum kepada PERKESO, yang Skim Bencana Kerja menyediakan faedah kepada pekerja yang layak yang tercedera semasa bekerja atau ketika berulang-alik untuk bekerja. Pekerja asing juga telah dibawa ke bawah Skim Bencana Kerja sejak beberapa tahun kebelakangan ini. Mendaftar dan mencarum dengan betul ialah kewajipan undang-undang, dan ia juga lapisan pertama perlindungan anda untuk kecederaan kerja. Semak panduan semasa PERKESO tentang siapa yang mesti didaftarkan dan faedah mana yang terpakai.

### Di mana perlindungan swasta sesuai
PERKESO ialah jaring keselamatan dengan faedah yang ditetapkan, bukan pengganti penuh kepada insurans perubatan atau kumpulan swasta. Polisi kemalangan diri, hospitalisasi kumpulan, atau hayat kumpulan swasta boleh mengisi jurang dan membantu anda mengekalkan kakitangan. Pekerja asing mungkin juga mempunyai keperluan insurans perubatan atau hospitalisasi yang berasingan, jadi sahkan apa yang terpakai kepada tenaga kerja anda.

### Jangan keliru antara PERKESO dengan liabiliti majikan
Faedah PERKESO dibayar di bawah skim berkanun. Jika anda mahu perlindungan terhadap tuntutan di luar skim berkanun, tanya broker sama ada liabiliti majikan atau lanjutan yang serupa sesuai untuk perniagaan anda.

## 5. Indemniti profesional

Jika anda memberi nasihat, reka bentuk, atau perkhidmatan pakar — perundingan, perakaunan, seni bina, IT, pemasaran, kejuruteraan — satu kesilapan boleh merugikan pelanggan anda dan mereka mungkin menyaman anda. Indemniti profesional melindungi kos undang-undang dan ganti rugi daripada tuntutan kecuaian atau kesilapan dalam kerja profesional anda. Sesetengah profesion dan sesetengah kontrak menjadikannya hampir wajib.

Beri perhatian kepada tarikh retroaktif dan sama ada perlindungan itu "berasaskan tuntutan" (claims made), kerana banyak polisi hanya memberi tindak balas kepada tuntutan yang dibuat buat kali pertama dalam tempoh polisi. Membiarkan polisi luput boleh menyebabkan kerja lalu tidak dilindungi.

## 6. Gangguan perniagaan

Insurans kebakaran membayar untuk membaiki harta anda. Ia biasanya tidak membayar sewa, gaji, dan ansuran pinjaman anda semasa anda tidak dapat berniaga. Perlindungan gangguan perniagaan direka untuk menggantikan keuntungan kasar yang hilang dan kos berterusan selepas peristiwa yang diinsuranskan, seperti kebakaran yang menutup kedai anda selama berbulan-bulan.

Tinjauan terhadap PKS Malaysia berulang kali mendapati jauh lebih banyak perniagaan terdedah kepada gangguan berbanding yang dilindungi. Jika perniagaan anda akan bergelut untuk bertahan tiga bulan penutupan, perlindungan ini wajar diberi pertimbangan serius. Perhatikan bahawa ia biasanya dicetuskan oleh kerosakan fizikal daripada risiko yang diinsuranskan, bukan oleh kejatuhan permintaan.

## 7. Perlindungan lain yang patut diketahui

- **Motor dan kenderaan komersial.** Jika anda menggunakan kenderaan, perlindungan motor pihak ketiga ialah keperluan undang-undang untuk kenderaan itu sendiri. Pastikan penggunaan komersial diisytiharkan.
- **Barangan dalam transit dan stok.** Berkaitan jika anda menghantar atau menyampaikan barangan.
- **Liabiliti produk.** Untuk pengilang dan pengeluar makanan yang produknya boleh mencederakan pelanggan.
- **Siber dan data.** Semakin relevan untuk perniagaan yang menyimpan data pelanggan atau menjual dalam talian.
- **Wang, kejujuran, dan wang tunai dalam transit.** Untuk perniagaan yang mengendalikan wang tunai yang besar atau terdedah kepada ketidakjujuran pekerja.
- **Pakej perniagaan kecil yang digabungkan.** Beberapa penanggung insurans menjual pakej untuk kedai, restoran, dan pejabat yang menggabungkan kebakaran, kecurian, liabiliti, dan lain-lain. Ia boleh menjadi titik permulaan yang menjimatkan kos jika perlindungan itu sepadan dengan risiko anda.

> Tabiat yang paling berguna ialah membaca bahagian "apa yang tidak dilindungi" dahulu. Pengecualian, syarat, dan waranti — seperti keperluan keselamatan atau kewajipan penyelenggaraan — menentukan sama ada tuntutan dibayar, dan itulah yang kebanyakan pemilik langkau.

## 8. Pilih perlindungan dan penyedia dengan bijak

Semak setiap polisi berdasarkan situasi sebenar anda, bukan sekadar sebut harga premium. Beberapa peraturan praktikal membantu:

1. **Gunakan perantara berlesen.** Penanggung insurans dan perantara beroperasi di bawah kerangka kawal selia Bank Negara Malaysia, jadi semak bahawa ejen atau broker berlesen dengan betul.
2. **Dapatkan sekurang-kurangnya dua atau tiga sebut harga.** Bandingkan jumlah diinsuranskan, ekses, pengecualian, dan lanjutan, bukan hanya harga.
3. **Pilih ekses yang munasabah.** Ekses yang lebih tinggi menurunkan premium, tetapi hanya jika anda benar-benar mampu membayarnya dalam bulan yang buruk.
4. **Isytihar segala-galanya dengan jujur.** Jawapan yang tepat tentang premis, aktiviti, dan sejarah tuntutan anda melindungi tuntutan anda kemudian.
5. **Simpan rekod.** Simpan polisi, jadual, dan endorsmen di tempat yang boleh anda temui semasa kecemasan, dan catat tarikh pembaharuan.
6. **Ketahui saluran aduan.** Jika pertikaian tuntutan tidak dapat diselesaikan dengan penanggung insurans, terdapat badan penyelesaian pertikaian bebas untuk pengguna kewangan. Semak pilihan semasa.

Mudah ditemui dan disahkan juga penting kepada rakan kongsi dan pelanggan yang bertanya tentang perlindungan anda — [penyenaraian percuma dan disahkan di sini](/ms/signup) membantu membentangkan perniagaan anda sebagai mantap dan boleh dipercayai, dan anda boleh [layari direktori](/ms) untuk ejen dan broker insurans tempatan yang bekerja dengan perniagaan kecil.

## Kesilapan lazim PKS Malaysia dengan insurans perniagaan

- **Kurang menginsuranskan untuk menjimatkan premium.** Jumlah diinsuranskan yang jauh di bawah nilai penggantian sebenar boleh mencetuskan fasal purata, menyebabkan anda menanggung sebahagian besar kerugian sendiri.
- **Menganggap perlindungan kebakaran turut melindungi pendapatan yang hilang.** Tanpa perlindungan gangguan perniagaan, bil pembaikan mungkin dibayar sementara sewa, gaji, dan bayaran pinjaman anda tidak.
- **Tidak mendedahkan perubahan.** Aktiviti baharu, penggunaan premis yang berbeza, atau bilik stok yang diperluas yang tidak pernah anda beritahu penanggung insurans boleh memberi alasan untuk mengurangkan atau menolak tuntutan.

## Di mana untuk bermula

- **Minggu ini:** Senaraikan lima cara terbesar anda boleh kerugian — kebakaran, kecurian, kecederaan pelanggan, kakitangan utama tidak hadir, penutupan yang panjang — dan letakkan kos kasar di sebelah setiap satu.
- **Seterusnya:** Semak apa yang sudah anda ada, termasuk perlindungan tuan tanah, pendaftaran PERKESO, dan sebarang polisi yang diperlukan bank, dan catat apa yang tiada.
- **Kemudian:** Minta sebut harga daripada ejen atau broker berlesen untuk satu atau dua jurang yang benar-benar boleh menamatkan perniagaan, dan bandingkan pengecualian sama teliti seperti harga.
- **Setiap tahun:** Semak semula jumlah diinsuranskan dan pembaharuan, dan kemas kini penanggung insurans anda apabila premis, stok, aktiviti, atau bilangan kakitangan berubah.

Insurans yang baik bukan tentang melindungi segala-galanya. Ia tentang memastikan hari paling teruk yang realistik bagi perniagaan anda ialah hari yang boleh anda pulih daripadanya.`,
        faqs: [
          {
            question: "Insurans apakah yang wajib dimiliki perniagaan kecil di Malaysia dari segi undang-undang?",
            answer:
              "Ia bergantung pada perniagaan anda. Majikan yang dilindungi Akta Keselamatan Sosial Pekerja mesti mendaftar dan mencarum kepada PERKESO, dan perlindungan motor pihak ketiga diperlukan untuk kenderaan. Banyak polisi lain, seperti kebakaran dan liabiliti awam, amnya tidak diwajibkan oleh undang-undang tetapi mungkin diperlukan oleh tuan tanah, pemberi pinjaman, atau pelanggan. Semak pajakan dan kontrak anda, dan sahkan keperluan undang-undang semasa dengan pihak berkuasa berkaitan.",
          },
          {
            question: "Apakah yang dilindungi oleh insurans kebakaran, dan adakah ia mencukupi?",
            answer:
              "Insurans kebakaran melindungi kehilangan atau kerosakan fizikal pada harta anda daripada risiko yang dinamakan, terutamanya kebakaran, dengan lanjutan pilihan seperti banjir atau pecah rumah. Ia biasanya tidak menggantikan pendapatan yang hilang semasa anda tidak dapat berniaga, yang menjadi tujuan perlindungan gangguan perniagaan. Pastikan jumlah diinsuranskan mencerminkan kos penggantian sebenar untuk mengelakkan fasal purata.",
          },
          {
            question: "Apakah fasal purata (average clause)?",
            answer:
              "Jika harta anda diinsuranskan pada nilai yang kurang daripada nilai sebenar, banyak polisi menggunakan fasal purata, bermakna penanggung insurans hanya membayar sebahagian daripada sebarang kerugian. Menginsuranskan pada nilai penggantian yang realistik, dan menyemaknya secara berkala, ialah perlindungan utama.",
          },
          {
            question: "Adakah saya masih memerlukan insurans swasta jika kakitangan saya dilindungi PERKESO?",
            answer:
              "Skim Bencana Kerja PERKESO menyediakan faedah berkanun untuk kecederaan tempat kerja yang layak, tetapi ia jaring keselamatan dan bukan perlindungan penuh. Polisi kemalangan diri, hospitalisasi kumpulan, atau hayat kumpulan swasta boleh mengisi jurang dan membantu mengekalkan kakitangan. Pekerja asing mungkin mempunyai keperluan insurans yang berasingan, jadi semak apa yang terpakai kepada tenaga kerja anda.",
          },
          {
            question: "Siapa yang memerlukan insurans indemniti profesional?",
            answer:
              "Sesiapa yang memberi nasihat, reka bentuk, atau perkhidmatan pakar yang kesilapannya boleh merugikan pelanggan, seperti perunding, akauntan, firma IT, dan pereka. Sesetengah profesion dan kontrak hampir mewajibkannya. Semak sama ada polisi itu berasaskan tuntutan dan apakah tarikh retroaktifnya.",
          },
          {
            question: "Apakah insurans gangguan perniagaan?",
            answer:
              "Ia menggantikan keuntungan kasar yang hilang dan kos berterusan, seperti sewa dan gaji, selepas peristiwa yang diinsuranskan seperti kebakaran menutup premis anda. Ia biasanya dicetuskan oleh kerosakan fizikal daripada risiko yang diinsuranskan dan bukan oleh kejatuhan permintaan, dan sering dibeli bersama perlindungan kebakaran.",
          },
          {
            question: "Mengapakah tuntutan insurans ditolak?",
            answer:
              "Sebab biasa termasuk kurang insurans, gagal mendedahkan perubahan dalam aktiviti atau premis anda, melanggar syarat atau waranti polisi seperti keperluan keselamatan, menuntut untuk peristiwa yang dikecualikan, dan memaklumkan penanggung insurans terlalu lewat. Membaca pengecualian dan syarat sebelum membeli mengurangkan risiko.",
          },
          {
            question: "Bagaimana saya memilih penyedia insurans?",
            answer:
              "Gunakan ejen atau broker yang berlesen dengan betul, dapatkan beberapa sebut harga, dan bandingkan jumlah diinsuranskan, ekses, pengecualian, dan lanjutan dan bukan hanya harga. Takaful tersedia jika anda lebih suka pilihan yang patuh Syariah. Simpan dokumen polisi dan tarikh pembaharuan di satu tempat.",
          },
        ],
      },
    },
  },
  {
    slug: "small-business-tax-calendar-in-malaysia",
    title: "Doing Business Taxes in Malaysia: A Small Business Owner's Annual Tax Calendar",
    seoTitle: "Malaysia Small Business Tax Calendar: Form B, C, CP204",
    seoDescription:
      "Sole proprietor vs company tax filing in Malaysia: Form B, Form C, CP204 instalments, record-keeping, deductible expenses and the deadlines to calendar.",
    coverImage: {
      file: "small-business-tax-calendar-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A business owner working through her finances with a calculator and paperwork at a bright desk",
      altTranslations: {
        zh: "一位企业主在明亮的办公桌前，用计算器和文件整理财务",
        ms: "Seorang pemilik perniagaan menyemak kewangannya dengan kalkulator dan dokumen di meja yang cerah",
      },
    },
    contentImages: {
      records: {
        file: "small-business-tax-calendar-in-malaysia-records.webp",
        mimeType: "image/webp",
        alt: "A businesswoman reaching for a stack of files at a desk beside a laptop and notebooks",
        altTranslations: {
          zh: "一位女企业家在办公桌前伸手去拿一叠文件，旁边是笔记本电脑和笔记本",
          ms: "Seorang ahli perniagaan wanita mencapai timbunan fail di meja bersebelahan komputer riba dan buku nota",
        },
        after: "Keep your records in one place from day one, because every deadline in this calendar depends on them.",
        afterTranslations: {
          zh: "从第一天起就把记录集中保存在一个地方，因为这份日历上的每个截止日期都依赖它们。",
          ms: "Simpan rekod anda di satu tempat sejak hari pertama, kerana setiap tarikh akhir dalam kalendar ini bergantung padanya.",
        },
      },
    },
    excerpt:
      "Late filing and missed instalments are the most avoidable tax problems a Malaysian small business can have. This guide explains how a sole proprietor and a company file differently (Form B versus Form C), how CP204 instalments work, what records to keep and which expenses are commonly deductible, and the deadlines worth putting in your calendar.",
    body: `Most tax penalties on small businesses are not about cheating. They are about missing a date, not keeping a receipt, or not realising a payment was due. A simple annual calendar fixes most of that. This guide walks through how a sole proprietor and a company file differently in Malaysia, what instalments and records are involved, and the dates worth putting in your phone today.

Tax deadlines, rates, and procedures are revised often, sometimes by short-notice extensions or Budget announcements. Treat the dates and figures here as a starting point and confirm them on the Inland Revenue Board's (LHDN / Hasil) official website or with a licensed tax agent before relying on them.

## 1. Know which kind of taxpayer you are

The first fork in the road is your legal structure, because it decides which form you file and when.

### Sole proprietor or partnership
A sole proprietorship is not a separate legal entity. Your business profit is treated as your personal income and taxed at individual rates, filed on your own income tax return. A partnership files a partnership return, and each partner declares their share on their own return.

### Company (Sdn Bhd)
A company is a separate taxpayer. It files its own return, pays tax on its own profits at corporate rates, and any salary or dividends you take out are a separate matter on your personal return. Qualifying small companies have historically benefited from lower tiered rates on part of their income, so check the current rates and conditions.

### Why it matters
The structure decides the form, the deadline, and whether instalment payments apply. If you are unsure which applies, check your SSM registration and your LHDN account type, and ask a tax agent if you are still unclear.

## 2. Sole proprietors: Form B and personal instalments

### Filing the return
Individuals with business income generally file Form B (as opposed to Form BE, which is for those with only employment income). The deadline for the year of assessment has typically been 30 June of the following year for manual filing, with a short extension for e-Filing through MyTax, often to 15 July. Always check the current year's dates, because they can change.

### Business accounts come first
Form B asks you to report your business income, so you will need to prepare a simple profit and loss statement, and in many cases a set of accounts or supporting schedules. Keeping your books up to date through the year makes this a matter of hours rather than weeks.

### Instalment payments
Individuals with business income may be expected to pay tax by instalments during the year, often called CP500, based on the previous year's tax. Check your LHDN notices and MyTax account to see what applies to you, and mark the instalment dates.

### Don't forget your personal reliefs
Individual reliefs, rebates, and deductions can reduce your tax bill, but you need the supporting documents. Collect receipts for relief-eligible items through the year so you are not hunting for them in June.

## 3. Companies: Form C and CP204

### Filing the return
A company files Form C, and the deadline is generally seven months after the end of its financial year. If your year ends on 31 December, that puts the deadline at the end of July the following year. Companies are expected to file through e-Filing. Make sure your accounts are finalised in time, since many companies also have to coordinate with an auditor or accountant to produce the figures first.

### Estimating your tax: CP204
Companies are required to submit an estimate of the tax payable for each financial year (Form CP204) and then pay it in monthly instalments. Timing rules for the estimate differ between new and existing companies, and sources describe them in different ways, so check LHDN's current guidance and your own schedule rather than assuming a date.

### Revising the estimate
A company can usually revise its estimate during the year, at specified points such as around the sixth and ninth month of the basis period, and in some periods the eleventh month as well. Where the final tax turns out to be much higher than the estimate, a penalty on the underpayment can apply, so revising early when profits grow is cheaper than being surprised later. Confirm the revision windows in force for your year.

### Penalties for late or underpaid instalments
Late or short instalment payments can attract a percentage penalty, and the rate has historically been around 10% on the shortfall. Treat instalment dates as firm deadlines and set a reminder a few days before each one.

> A good rule of thumb for a company: if your profits are clearly heading well above your estimate, revise the CP204 estimate in the next available window instead of waiting. Paying a bit more tax earlier is usually cheaper than paying a penalty later.

## 4. Records: what to keep, and for how long

Everything in this calendar depends on your records, and LHDN expects you to be able to back up what you declare.

Keep your records in one place from day one, because every deadline in this calendar depends on them. At a minimum, keep:

1. **Sales records.** Invoices, receipts, and point-of-sale reports.
2. **Purchase and expense records.** Supplier invoices, receipts, and bills, with the date, amount, and what it was for.
3. **Bank statements.** Business account statements, reconciled to your books.
4. **Payroll records.** Payslips, EPF, SOCSO, EIS, and income tax deduction records for employees.
5. **Assets.** Purchase documents for equipment, vehicles, and other items you may claim capital allowances on.
6. **Tax correspondence.** Notices, assessments, and proof of payment.

### How long to keep them
Records are commonly required to be kept for several years — seven years is the figure often cited — but confirm the current requirement with LHDN. A digital copy that is clear and well organised is usually easier to manage than boxes of paper, though check what LHDN accepts for your situation.

### Keep business and personal money separate
Mixing personal and business spending makes it hard to prove what is a deductible expense. A separate business bank account is one of the cheapest ways to keep your tax life clean.

## 5. Commonly deductible expenses

In general, expenses incurred wholly and exclusively in producing your business income are deductible, while private or capital items are not (capital items may qualify for capital allowances instead). Typical examples include:

- **Staff costs.** Salaries, wages, bonuses, and employer contributions to EPF, SOCSO, and EIS.
- **Rent and utilities.** For business premises.
- **Cost of goods sold.** Stock and materials you resell or use.
- **Professional fees.** Accounting, audit, and certain legal fees.
- **Marketing.** Advertising and promotion.
- **Repairs and maintenance.** For business assets.
- **Insurance.** Business insurance premiums.
- **Capital allowances.** On qualifying equipment and vehicles, instead of deducting the full cost at once.

### Watch what is restricted
Some categories, such as entertainment, private motor expenses, and non-business items, are restricted or non-deductible. Specific rules and incentives change, so check current guidance for the item you are claiming.

## 6. Build your annual calendar

Here is a simple structure to adapt to your own financial year and structure. Confirm all dates on the official sites.

### Every month
- **Payroll deductions and contributions.** Employer payments such as PCB (monthly tax deductions), EPF, SOCSO, and EIS generally fall due by the middle of the following month.
- **Close your books.** Reconcile the bank account and file receipts, so the year-end is not a pile-up.
- **Company instalments.** Pay your CP204 instalments on the due dates if you are a company.

### Early in the year
- **Employee tax forms.** Employers are generally expected to give staff their annual employment income statements (Form EA) by the end of February.
- **Employer's return.** Form E, the employer's annual return, is generally due by 31 March.

### Mid-year
- **Sole proprietors.** Form B around 30 June (e-Filing a little later), so have your accounts ready in May.
- **Instalment revisions.** Review your CP204 estimate at the revision windows if you are a company.

### After your financial year-end
- **Companies.** Form C is due seven months after year-end, so book your accountant or auditor early.
- **New estimate.** Plan the next year's CP204 estimate ahead of the new financial year.

You can also tie in your other compliance dates, such as SST returns and e-invoicing duties if they apply to you. Being easy to find and verify also helps with banks, partners, and customers who check you out — [a free, verified listing here](/en/signup) is a small way to show your business is established, and you can [browse the directory](/en) for local accountants and tax agents who handle these filings every year.

## Common mistakes Malaysian small businesses make with tax

- **Treating the deadline as the starting date.** Starting your accounts in the week the return is due almost guarantees errors or a late filing. Close each month as you go.
- **Ignoring the instalment estimate.** Companies that never revise a CP204 estimate, or sole proprietors who miss instalment dates, create avoidable penalties even if the final return is filed on time.
- **Mixing personal and business money.** Without clean separation, you cannot prove what is deductible, and you may lose legitimate claims or invite questions.

## Where to start

- **This week:** Confirm your tax structure and your financial year-end, and look up your next filing deadline on the official LHDN site.
- **Next:** Put the dates from section 6 into a shared calendar with reminders a few weeks before each one, and note who is responsible for each.
- **Then:** Set up a simple, consistent record system — a separate business bank account, a folder structure, and a monthly book-closing habit.
- **Ongoing:** Talk to a licensed tax agent or accountant at least once a year, ideally before your year-end, to check estimates, reliefs, and any rule changes.

Good tax compliance is mostly calendar discipline: know your dates, keep your records, and revise before a surprise turns into a penalty.`,
    faqs: [
      {
        question: "What is the difference between Form B and Form C?",
        answer:
          "Form B is generally used by individuals with business income, such as sole proprietors, while Form C is the income tax return for companies. They have different deadlines and different instalment rules, so first confirm which type of taxpayer you are.",
      },
      {
        question: "When is the deadline to file Form B for a sole proprietor?",
        answer:
          "It has typically been 30 June of the following year for manual filing, with a short extension for e-Filing, often to 15 July. Deadlines can change, so check LHDN's official site for the current year.",
      },
      {
        question: "When must a company file Form C?",
        answer:
          "Generally seven months after the end of the company's financial year. For a 31 December year-end, that is around the end of July the following year. Confirm on LHDN's site, and plan your accounts or audit well ahead.",
      },
      {
        question: "What is CP204?",
        answer:
          "CP204 is the form a company uses to submit an estimate of its tax payable for the financial year, which is then paid in monthly instalments. Timing rules differ for new and existing companies, and you can generally revise the estimate at set points during the year, so check LHDN's current guidance.",
      },
      {
        question: "What happens if I underestimate my tax or pay instalments late?",
        answer:
          "A penalty may apply on underpaid or late instalments, historically a percentage of the shortfall around 10%, and a large gap between the estimate and the final tax can also attract a penalty. Revising your estimate early when profits grow is usually cheaper than being penalised later.",
      },
      {
        question: "What records do I need to keep, and for how long?",
        answer:
          "Keep sales records, purchase and expense receipts, bank statements, payroll records, asset purchase documents, and tax correspondence. Records are commonly required to be kept for several years, often cited as seven, but confirm the current requirement with LHDN.",
      },
      {
        question: "Which business expenses are generally deductible?",
        answer:
          "Expenses incurred wholly and exclusively in producing business income, such as staff costs, rent and utilities for business premises, cost of goods sold, professional fees, marketing, repairs, and insurance. Capital items may qualify for capital allowances instead, and some categories, like entertainment, are restricted.",
      },
      {
        question: "Do I need a tax agent or accountant?",
        answer:
          "It is not legally required for a simple return, but a licensed tax agent or accountant can save time, catch missed deductions and reliefs, and help you avoid penalties, especially for companies. Even one check-in a year, ideally before your year-end, is worthwhile.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚办理营业税务：小企业主的年度税务日历",
        excerpt:
          "逾期申报和漏缴分期税款，是马来西亚小企业最可避免的税务问题。本指南说明独资经营者与公司在申报上有何不同（Form B 对 Form C）、CP204 分期税款如何运作、应保存哪些记录、哪些开支通常可扣除，以及值得写进日历的截止日期。",
        body: `小企业面对的大多数税务罚款，并不是因为作弊，而是因为错过日期、没有保存收据，或没有意识到有一笔款项到期。一份简单的年度日历就能解决大部分问题。本指南介绍在马来西亚，独资经营者和公司在申报上有何不同、涉及哪些分期税款和记录，以及今天就值得写进手机的日期。

税务截止日期、税率和程序经常修订，有时是临时延期，有时是财政预算案宣布的变动。请把这里的日期和数字当作起点，在依赖它们之前，到内陆税收局（LHDN / Hasil）的官方网站确认，或向持牌税务代理查询。

## 1. 先弄清楚您是哪一种纳税人

第一个分岔口是您的法律结构，因为它决定您要提交哪一份表格以及何时提交。

### 独资经营者或合伙
独资经营并不是独立的法律实体。您的业务利润被视为您的个人收入，按个人税率课税，在您自己的所得税报税表上申报。合伙企业提交合伙报税表，每位合伙人在自己的报税表上申报各自的份额。

### 公司（私人有限公司 Sdn Bhd）
公司是独立的纳税人。它提交自己的报税表，按企业税率就自己的利润纳税，而您从公司领取的薪水或股息，则是您个人报税表上的另一回事。符合条件的小型公司历来可以就部分收入享受较低的累进税率，所以请查核目前的税率和条件。

### 为什么这很重要
结构决定了表格、截止日期，以及是否适用分期缴税。如果您不确定适用哪一种，请查看您的 SSM 注册和 LHDN 账户类型，如果仍不清楚，请询问税务代理。

## 2. 独资经营者：Form B 与个人分期税款

### 提交报税表
有营业收入的个人一般提交 Form B（相对于仅有受薪收入者使用的 Form BE）。某一课税年度的截止日期，历来是次年 6 月 30 日（人工申报），电子申报（通过 MyTax）则略有宽限，通常到 7 月 15 日。请务必查看当年的日期，因为它们可能改变。

### 先做好业务账目
Form B 要求您申报营业收入，所以您需要准备一份简单的损益表，在许多情况下还需要一套账目或辅助附表。全年都及时更新账簿，会让这件事只需要几个小时，而不是几个星期。

### 分期缴税
有营业收入的个人可能需要在年内分期缴税，通常称为 CP500，依据上一年的税额。请查看您的 LHDN 通知和 MyTax 账户，了解适用于您的情况，并标记分期缴付日期。

### 别忘了个人税务减免
个人减免、税务回扣和扣除可以降低您的税单，但您需要有证明文件。请在全年收集可享减免的项目的收据，这样您就不必在六月四处翻找。

## 3. 公司：Form C 与 CP204

### 提交报税表
公司提交 Form C，截止日期一般是财政年度结束后七个月。如果您的财政年度在 12 月 31 日结束，截止日期就是次年 7 月底。公司应通过电子申报提交。请确保账目及时定稿，因为许多公司还需要先与审计师或会计师协调，才能得出数字。

### 估算您的税款：CP204
公司须就每个财政年度提交应缴税款的估算（Form CP204），然后分月分期缴付。估算的时间规则，新公司与现有公司不同，而各来源的描述也不一致，所以请查核 LHDN 的最新指引和您自己的时间表，而不要想当然地假设日期。

### 修订估算
公司通常可以在年内的特定时间点修订其估算，例如基准期的大约第六个月和第九个月，在某些年度还包括第十一个月。如果最终税款远高于估算，可能会对少缴的部分处以罚款，所以在利润增长时及早修订，比日后措手不及更划算。请确认适用于您那一年的修订窗口。

### 逾期或少缴分期税款的罚款
逾期或少缴分期税款，可能被处以按比例计算的罚款，历来的比率约为不足额的 10%。请把分期缴付日期视为硬性截止日期，并在每次到期前几天设置提醒。

> 对公司而言，一个好的经验法则是：如果您的利润明显会大幅超过估算，请在下一个可用的窗口修订 CP204 估算，而不是等待。提早多缴一点税，通常比日后缴罚款更划算。

## 4. 记录：保存什么，保存多久

这份日历上的一切都依赖于您的记录，而 LHDN 期望您能够证明您所申报的内容。

从第一天起就把记录集中保存在一个地方，因为这份日历上的每个截止日期都依赖它们。至少应保存：

1. **销售记录。** 发票、收据和销售点报告。
2. **采购和开支记录。** 供应商发票、收据和账单，注明日期、金额和用途。
3. **银行月结单。** 企业账户的月结单，并与账簿核对。
4. **薪资记录。** 员工的薪资单、EPF、SOCSO、EIS 和所得税扣除记录。
5. **资产。** 设备、车辆及其他您可能申请资本免税额的项目的购买文件。
6. **税务往来文件。** 通知、评税单和缴款证明。

### 保存多久
记录通常须保存数年——常被引用的是七年——但请向 LHDN 确认目前的要求。清晰且整理有序的电子副本，通常比一箱箱的纸质文件更容易管理，不过请查核 LHDN 在您的情况下接受什么。

### 把企业与个人的钱分开
个人和业务支出混在一起，会让您难以证明哪些是可扣除的开支。一个独立的企业银行账户，是让您的税务保持清晰最便宜的方法之一。

## 5. 常见的可扣除开支

一般而言，为产生营业收入而完全且专门发生的开支是可扣除的，而私人或资本性项目则不可以（资本性项目可能改为符合资本免税额）。典型的例子包括：

- **员工成本。** 薪水、工资、花红，以及雇主对 EPF、SOCSO 和 EIS 的供款。
- **租金与水电费。** 针对经营场所。
- **销货成本。** 您转售或使用的存货和材料。
- **专业费用。** 会计、审计和某些法律费用。
- **营销。** 广告与推广。
- **维修与保养。** 针对业务资产。
- **保险。** 商业保险保费。
- **资本免税额。** 针对符合条件的设备和车辆，而不是一次性扣除全部成本。

### 留意受限制的项目
某些类别，例如娱乐、私人汽车开支和非业务项目，受到限制或不可扣除。具体规则和优惠会变动，所以请查核您所申报项目的最新指引。

## 6. 建立您的年度日历

以下是一个简单的结构，请按您自己的财政年度和结构调整。请在官方网站确认所有日期。

### 每个月
- **薪资扣款与供款。** 雇主的付款，例如 PCB（每月税款扣除）、EPF、SOCSO 和 EIS，一般在次月中旬前到期。
- **结账。** 核对银行账户并归档收据，让年底不致堆积如山。
- **公司分期税款。** 如果您是公司，请在到期日缴付 CP204 分期税款。

### 年初
- **员工税务表格。** 雇主一般须在二月底前，把年度受薪收入报表（Form EA）交给员工。
- **雇主报税表。** Form E，即雇主年度报税表，一般在 3 月 31 日前到期。

### 年中
- **独资经营者。** Form B 约在 6 月 30 日（电子申报稍晚），所以请在五月前备妥账目。
- **分期税款修订。** 如果您是公司，请在修订窗口检视您的 CP204 估算。

### 财政年度结束后
- **公司。** Form C 在年结后七个月到期，所以请提早预约您的会计师或审计师。
- **新的估算。** 在新财政年度开始前，规划下一年的 CP204 估算。

您也可以把其他合规日期，例如销售与服务税（SST）申报和电子发票义务（如适用于您），一并纳入。对于查核您的银行、合作伙伴和客户来说，容易被找到和验证也有帮助——[在这里免费创建认证列表](/zh/signup)，是展示您的企业稳健的一个小小方式，您也可以[浏览目录](/zh)，找到每年都在处理这些申报的本地会计师和税务代理。

## 马来西亚小企业在税务上常犯的错误

- **把截止日期当成开始日期。** 在报税表到期的那一周才开始整理账目，几乎必然导致错误或逾期申报。请逐月结账。
- **忽略分期税款的估算。** 从不修订 CP204 估算的公司，或错过分期缴付日期的独资经营者，即使最终报税表按时提交，也会产生本可避免的罚款。
- **把个人与企业的钱混在一起。** 没有清楚的区分，您就无法证明哪些可以扣除，可能会失去合理的申报，或招来质疑。

## 从哪里开始

- **本周：** 确认您的税务结构和财政年度结束日，并在 LHDN 官方网站查看您下一个申报截止日期。
- **接下来：** 把第 6 节的日期放进共用日历，并在每个日期前几周设置提醒，注明由谁负责。
- **然后：** 建立一个简单且一致的记录系统——独立的企业银行账户、文件夹结构，以及每月结账的习惯。
- **持续做：** 每年至少与持牌税务代理或会计师谈一次，最好在年结之前，检查估算、减免以及任何规则变动。

良好的税务合规，主要是日历上的自律：知道您的日期，保存您的记录，并在意外变成罚款之前就去修订。`,
        faqs: [
          {
            question: "Form B 和 Form C 有什么区别？",
            answer:
              "Form B 一般由有营业收入的个人使用，例如独资经营者，而 Form C 是公司的所得税报税表。它们的截止日期和分期缴税规则不同，所以请先确认您属于哪一种纳税人。",
          },
          {
            question: "独资经营者提交 Form B 的截止日期是什么时候？",
            answer:
              "人工申报历来是次年 6 月 30 日，电子申报略有宽限，通常到 7 月 15 日。截止日期可能改变，所以请到 LHDN 官方网站查核当年的日期。",
          },
          {
            question: "公司必须在什么时候提交 Form C？",
            answer:
              "一般是公司财政年度结束后七个月。若财政年度在 12 月 31 日结束，则约在次年 7 月底。请到 LHDN 网站确认，并提早规划您的账目或审计。",
          },
          {
            question: "CP204 是什么？",
            answer:
              "CP204 是公司用来提交该财政年度应缴税款估算的表格，之后按月分期缴付。新公司与现有公司的时间规则不同，您一般也可以在年内特定时间点修订估算，所以请查核 LHDN 的最新指引。",
          },
          {
            question: "如果我低估税款或延迟缴付分期税款，会怎样？",
            answer:
              "对少缴或逾期的分期税款可能处以罚款，历来是不足额的约 10%，而估算与最终税款之间差距过大，也可能被罚款。在利润增长时及早修订估算，通常比日后被罚款更划算。",
          },
          {
            question: "我需要保存哪些记录？要保存多久？",
            answer:
              "请保存销售记录、采购和开支收据、银行月结单、薪资记录、资产购买文件和税务往来文件。记录通常须保存数年，常被引用的是七年，但请向 LHDN 确认目前的要求。",
          },
          {
            question: "哪些业务开支一般是可扣除的？",
            answer:
              "为产生营业收入而完全且专门发生的开支，例如员工成本、经营场所的租金和水电费、销货成本、专业费用、营销、维修和保险。资本性项目可能改为符合资本免税额，而某些类别（如娱乐）受到限制。",
          },
          {
            question: "我需要税务代理或会计师吗？",
            answer:
              "对简单的报税表，法律上并不要求，但持牌税务代理或会计师可以节省时间、发现被遗漏的扣除和减免，并帮助您避免罚款，对公司尤其如此。即使每年只咨询一次，最好在年结之前，也是值得的。",
          },
        ],
      },
      ms: {
        title: "Menguruskan Cukai Perniagaan di Malaysia: Kalendar Cukai Tahunan untuk Pemilik Perniagaan Kecil",
        excerpt:
          "Pemfailan lewat dan ansuran yang terlepas ialah masalah cukai yang paling boleh dielakkan oleh perniagaan kecil Malaysia. Panduan ini menerangkan bagaimana pemilik tunggal dan syarikat memfailkan secara berbeza (Borang B berbanding Borang C), bagaimana ansuran CP204 berfungsi, rekod apa yang perlu disimpan dan perbelanjaan mana yang lazimnya boleh ditolak, serta tarikh akhir yang wajar dimasukkan dalam kalendar anda.",
        body: `Kebanyakan penalti cukai ke atas perniagaan kecil bukan tentang menipu. Ia tentang terlepas tarikh, tidak menyimpan resit, atau tidak sedar bahawa sesuatu bayaran telah sampai tempoh. Kalendar tahunan yang mudah menyelesaikan kebanyakan daripadanya. Panduan ini menerangkan bagaimana pemilik tunggal dan syarikat memfailkan secara berbeza di Malaysia, ansuran dan rekod yang terlibat, serta tarikh yang wajar dimasukkan ke dalam telefon anda hari ini.

Tarikh akhir cukai, kadar, dan prosedur kerap disemak, kadangkala melalui lanjutan pada saat akhir atau pengumuman Bajet. Anggaplah tarikh dan angka di sini sebagai titik permulaan dan sahkan di laman web rasmi Lembaga Hasil Dalam Negeri (LHDN / Hasil) atau dengan ejen cukai berlesen sebelum bergantung padanya.

## 1. Ketahui jenis pembayar cukai anda

Persimpangan pertama ialah struktur undang-undang anda, kerana ia menentukan borang yang anda failkan dan bila.

### Pemilik tunggal atau perkongsian
Pemilikan tunggal bukan entiti undang-undang yang berasingan. Keuntungan perniagaan anda dianggap sebagai pendapatan peribadi anda dan dicukai pada kadar individu, difailkan pada borang nyata cukai pendapatan anda sendiri. Perkongsian memfailkan borang nyata perkongsian, dan setiap rakan kongsi mengisytiharkan bahagian masing-masing pada borang nyata sendiri.

### Syarikat (Sdn Bhd)
Syarikat ialah pembayar cukai yang berasingan. Ia memfailkan borang nyatanya sendiri, membayar cukai atas keuntungannya sendiri pada kadar korporat, dan sebarang gaji atau dividen yang anda ambil ialah perkara berasingan pada borang nyata peribadi anda. Syarikat kecil yang layak secara sejarahnya mendapat manfaat daripada kadar berperingkat yang lebih rendah ke atas sebahagian pendapatannya, jadi semak kadar dan syarat semasa.

### Mengapa ia penting
Struktur menentukan borang, tarikh akhir, dan sama ada bayaran ansuran terpakai. Jika anda tidak pasti yang mana satu terpakai, semak pendaftaran SSM dan jenis akaun LHDN anda, dan tanya ejen cukai jika anda masih tidak jelas.

## 2. Pemilik tunggal: Borang B dan ansuran peribadi

### Memfailkan borang nyata
Individu yang mempunyai pendapatan perniagaan amnya memfailkan Borang B (berbeza daripada Borang BE, untuk mereka yang hanya mempunyai pendapatan pekerjaan). Tarikh akhir untuk tahun taksiran lazimnya ialah 30 Jun tahun berikutnya untuk pemfailan manual, dengan lanjutan singkat untuk e-Filing melalui MyTax, selalunya hingga 15 Julai. Sentiasa semak tarikh tahun semasa, kerana ia boleh berubah.

### Akaun perniagaan didahulukan
Borang B meminta anda melaporkan pendapatan perniagaan, jadi anda perlu menyediakan penyata untung rugi yang ringkas, dan dalam banyak kes satu set akaun atau jadual sokongan. Mengemas kini buku anda sepanjang tahun menjadikan ini urusan beberapa jam dan bukan berminggu-minggu.

### Bayaran ansuran
Individu yang mempunyai pendapatan perniagaan mungkin dijangka membayar cukai secara ansuran dalam tahun itu, yang selalunya dipanggil CP500, berdasarkan cukai tahun sebelumnya. Semak notis LHDN dan akaun MyTax anda untuk melihat apa yang terpakai kepada anda, dan tandakan tarikh ansuran.

### Jangan lupa pelepasan peribadi anda
Pelepasan, rebat, dan potongan individu boleh mengurangkan bil cukai anda, tetapi anda memerlukan dokumen sokongan. Kumpulkan resit untuk item yang layak pelepasan sepanjang tahun supaya anda tidak mencarinya pada bulan Jun.

## 3. Syarikat: Borang C dan CP204

### Memfailkan borang nyata
Syarikat memfailkan Borang C, dan tarikh akhirnya amnya tujuh bulan selepas tamat tahun kewangannya. Jika tahun anda berakhir pada 31 Disember, itu meletakkan tarikh akhir pada penghujung Julai tahun berikutnya. Syarikat dijangka memfailkan melalui e-Filing. Pastikan akaun anda dimuktamadkan tepat pada masanya, kerana banyak syarikat juga perlu berkoordinasi dengan juruaudit atau akauntan untuk menghasilkan angka terlebih dahulu.

### Menganggar cukai anda: CP204
Syarikat dikehendaki mengemukakan anggaran cukai yang kena dibayar bagi setiap tahun kewangan (Borang CP204) dan kemudian membayarnya secara ansuran bulanan. Peraturan masa untuk anggaran berbeza antara syarikat baharu dan sedia ada, dan sumber menggambarkannya dengan cara yang berbeza, jadi semak panduan semasa LHDN dan jadual anda sendiri dan bukannya menganggap sesuatu tarikh.

### Menyemak semula anggaran
Syarikat lazimnya boleh menyemak semula anggarannya dalam tahun itu, pada titik tertentu seperti sekitar bulan keenam dan kesembilan tempoh asas, dan dalam sesetengah tempoh bulan kesebelas juga. Jika cukai akhir ternyata jauh lebih tinggi daripada anggaran, penalti ke atas kurang bayaran boleh dikenakan, jadi menyemak semula awal apabila keuntungan meningkat lebih murah daripada terkejut kemudian. Sahkan tetingkap semakan yang berkuat kuasa untuk tahun anda.

### Penalti untuk ansuran yang lewat atau kurang dibayar
Ansuran yang lewat atau kurang dibayar boleh dikenakan penalti peratusan, dan kadarnya secara sejarahnya sekitar 10% ke atas kekurangan itu. Anggap tarikh ansuran sebagai tarikh akhir yang tegas dan tetapkan peringatan beberapa hari sebelum setiap satu.

> Peraturan praktikal yang baik untuk syarikat: jika keuntungan anda jelas menuju jauh melebihi anggaran, semak semula anggaran CP204 dalam tetingkap seterusnya yang ada dan bukannya menunggu. Membayar cukai sedikit lebih awal biasanya lebih murah daripada membayar penalti kemudian.

## 4. Rekod: apa yang perlu disimpan, dan untuk berapa lama

Segala-galanya dalam kalendar ini bergantung pada rekod anda, dan LHDN menjangkakan anda dapat menyokong apa yang anda isytiharkan.

Simpan rekod anda di satu tempat sejak hari pertama, kerana setiap tarikh akhir dalam kalendar ini bergantung padanya. Sekurang-kurangnya, simpan:

1. **Rekod jualan.** Invois, resit, dan laporan titik jualan.
2. **Rekod pembelian dan perbelanjaan.** Invois pembekal, resit, dan bil, dengan tarikh, jumlah, dan tujuannya.
3. **Penyata bank.** Penyata akaun perniagaan, diselaraskan dengan buku anda.
4. **Rekod gaji.** Slip gaji, KWSP, PERKESO, SIP, dan rekod potongan cukai pendapatan untuk pekerja.
5. **Aset.** Dokumen pembelian untuk peralatan, kenderaan, dan item lain yang mungkin anda tuntut elaun modal.
6. **Surat-menyurat cukai.** Notis, taksiran, dan bukti pembayaran.

### Berapa lama untuk menyimpannya
Rekod lazimnya dikehendaki disimpan selama beberapa tahun — tujuh tahun ialah angka yang sering disebut — tetapi sahkan keperluan semasa dengan LHDN. Salinan digital yang jelas dan tersusun biasanya lebih mudah diurus daripada kotak kertas, walaupun semak apa yang LHDN terima untuk situasi anda.

### Asingkan wang perniagaan dan peribadi
Mencampurkan perbelanjaan peribadi dan perniagaan menyukarkan anda membuktikan apa yang merupakan perbelanjaan yang boleh ditolak. Akaun bank perniagaan yang berasingan ialah salah satu cara termurah untuk memastikan urusan cukai anda bersih.

## 5. Perbelanjaan yang lazimnya boleh ditolak

Secara amnya, perbelanjaan yang ditanggung sepenuhnya dan semata-mata dalam menghasilkan pendapatan perniagaan anda boleh ditolak, manakala item peribadi atau modal tidak boleh (item modal mungkin layak mendapat elaun modal sebaliknya). Contoh tipikal termasuk:

- **Kos kakitangan.** Gaji, upah, bonus, dan caruman majikan kepada KWSP, PERKESO, dan SIP.
- **Sewa dan utiliti.** Untuk premis perniagaan.
- **Kos barang dijual.** Stok dan bahan yang anda jual semula atau gunakan.
- **Yuran profesional.** Yuran perakaunan, audit, dan sesetengah yuran guaman.
- **Pemasaran.** Pengiklanan dan promosi.
- **Pembaikan dan penyelenggaraan.** Untuk aset perniagaan.
- **Insurans.** Premium insurans perniagaan.
- **Elaun modal.** Ke atas peralatan dan kenderaan yang layak, dan bukannya menolak kos penuh sekali gus.

### Perhatikan apa yang dihadkan
Sesetengah kategori, seperti hiburan, perbelanjaan motor peribadi, dan item bukan perniagaan, dihadkan atau tidak boleh ditolak. Peraturan dan insentif tertentu berubah, jadi semak panduan semasa untuk item yang anda tuntut.

## 6. Bina kalendar tahunan anda

Berikut ialah struktur mudah untuk disesuaikan dengan tahun kewangan dan struktur anda sendiri. Sahkan semua tarikh di laman web rasmi.

### Setiap bulan
- **Potongan gaji dan caruman.** Bayaran majikan seperti PCB (potongan cukai bulanan), KWSP, PERKESO, dan SIP amnya perlu dibayar menjelang pertengahan bulan berikutnya.
- **Tutup buku anda.** Selaraskan akaun bank dan failkan resit, supaya hujung tahun tidak bertimbun.
- **Ansuran syarikat.** Bayar ansuran CP204 anda pada tarikh matang jika anda sebuah syarikat.

### Awal tahun
- **Borang cukai pekerja.** Majikan amnya dijangka memberi kakitangan penyata pendapatan pekerjaan tahunan (Borang EA) menjelang akhir Februari.
- **Borang nyata majikan.** Borang E, borang nyata tahunan majikan, amnya perlu dikemukakan menjelang 31 Mac.

### Pertengahan tahun
- **Pemilik tunggal.** Borang B sekitar 30 Jun (e-Filing sedikit lewat), jadi sediakan akaun anda pada bulan Mei.
- **Semakan semula ansuran.** Semak anggaran CP204 anda pada tetingkap semakan jika anda sebuah syarikat.

### Selepas akhir tahun kewangan anda
- **Syarikat.** Borang C perlu dikemukakan tujuh bulan selepas akhir tahun, jadi tempah akauntan atau juruaudit anda awal.
- **Anggaran baharu.** Rancang anggaran CP204 tahun berikutnya sebelum tahun kewangan baharu.

Anda juga boleh mengaitkan tarikh pematuhan lain, seperti penyata SST dan kewajipan e-invois jika ia terpakai kepada anda. Mudah ditemui dan disahkan juga membantu dengan bank, rakan kongsi, dan pelanggan yang menyemak anda — [penyenaraian percuma dan disahkan di sini](/ms/signup) ialah cara kecil untuk menunjukkan perniagaan anda mantap, dan anda boleh [layari direktori](/ms) untuk akauntan dan ejen cukai tempatan yang mengendalikan pemfailan ini setiap tahun.

## Kesilapan lazim perniagaan kecil Malaysia dengan cukai

- **Menganggap tarikh akhir sebagai tarikh mula.** Memulakan akaun anda pada minggu borang nyata perlu dikemukakan hampir pasti menyebabkan kesilapan atau pemfailan lewat. Tutup setiap bulan semasa anda berjalan.
- **Mengabaikan anggaran ansuran.** Syarikat yang tidak pernah menyemak semula anggaran CP204, atau pemilik tunggal yang terlepas tarikh ansuran, mencipta penalti yang boleh dielakkan walaupun borang nyata akhir difailkan tepat pada masanya.
- **Mencampurkan wang peribadi dan perniagaan.** Tanpa pengasingan yang bersih, anda tidak dapat membuktikan apa yang boleh ditolak, dan anda mungkin kehilangan tuntutan yang sah atau mengundang pertanyaan.

## Di mana untuk bermula

- **Minggu ini:** Sahkan struktur cukai dan akhir tahun kewangan anda, dan cari tarikh akhir pemfailan seterusnya di laman web rasmi LHDN.
- **Seterusnya:** Letakkan tarikh daripada bahagian 6 ke dalam kalendar bersama dengan peringatan beberapa minggu sebelum setiap satu, dan catat siapa yang bertanggungjawab untuk setiap satu.
- **Kemudian:** Sediakan sistem rekod yang ringkas dan konsisten — akaun bank perniagaan yang berasingan, struktur folder, dan tabiat menutup buku setiap bulan.
- **Berterusan:** Berbincang dengan ejen cukai atau akauntan berlesen sekurang-kurangnya setahun sekali, sebaik-baiknya sebelum akhir tahun anda, untuk menyemak anggaran, pelepasan, dan sebarang perubahan peraturan.

Pematuhan cukai yang baik kebanyakannya ialah disiplin kalendar: ketahui tarikh anda, simpan rekod anda, dan semak semula sebelum kejutan bertukar menjadi penalti.`,
        faqs: [
          {
            question: "Apakah perbezaan antara Borang B dan Borang C?",
            answer:
              "Borang B amnya digunakan oleh individu yang mempunyai pendapatan perniagaan, seperti pemilik tunggal, manakala Borang C ialah borang nyata cukai pendapatan untuk syarikat. Ia mempunyai tarikh akhir dan peraturan ansuran yang berbeza, jadi sahkan dahulu jenis pembayar cukai anda.",
          },
          {
            question: "Bilakah tarikh akhir memfailkan Borang B untuk pemilik tunggal?",
            answer:
              "Secara lazimnya 30 Jun tahun berikutnya untuk pemfailan manual, dengan lanjutan singkat untuk e-Filing, selalunya hingga 15 Julai. Tarikh akhir boleh berubah, jadi semak laman web rasmi LHDN untuk tahun semasa.",
          },
          {
            question: "Bilakah syarikat mesti memfailkan Borang C?",
            answer:
              "Amnya tujuh bulan selepas tamat tahun kewangan syarikat. Bagi tahun kewangan yang berakhir 31 Disember, itu sekitar penghujung Julai tahun berikutnya. Sahkan di laman web LHDN, dan rancang akaun atau audit anda jauh lebih awal.",
          },
          {
            question: "Apakah CP204?",
            answer:
              "CP204 ialah borang yang digunakan syarikat untuk mengemukakan anggaran cukai yang kena dibayar bagi tahun kewangan, yang kemudiannya dibayar secara ansuran bulanan. Peraturan masa berbeza untuk syarikat baharu dan sedia ada, dan anda amnya boleh menyemak semula anggaran pada titik tertentu dalam tahun itu, jadi semak panduan semasa LHDN.",
          },
          {
            question: "Apa yang berlaku jika saya terkurang anggar cukai atau membayar ansuran lewat?",
            answer:
              "Penalti mungkin dikenakan ke atas ansuran yang kurang dibayar atau lewat, secara sejarahnya peratusan daripada kekurangan sekitar 10%, dan jurang besar antara anggaran dan cukai akhir juga boleh dikenakan penalti. Menyemak semula anggaran awal apabila keuntungan meningkat biasanya lebih murah daripada dikenakan penalti kemudian.",
          },
          {
            question: "Apakah rekod yang perlu saya simpan, dan untuk berapa lama?",
            answer:
              "Simpan rekod jualan, resit pembelian dan perbelanjaan, penyata bank, rekod gaji, dokumen pembelian aset, dan surat-menyurat cukai. Rekod lazimnya dikehendaki disimpan selama beberapa tahun, yang sering disebut tujuh tahun, tetapi sahkan keperluan semasa dengan LHDN.",
          },
          {
            question: "Perbelanjaan perniagaan manakah yang amnya boleh ditolak?",
            answer:
              "Perbelanjaan yang ditanggung sepenuhnya dan semata-mata dalam menghasilkan pendapatan perniagaan, seperti kos kakitangan, sewa dan utiliti untuk premis perniagaan, kos barang dijual, yuran profesional, pemasaran, pembaikan, dan insurans. Item modal mungkin layak mendapat elaun modal sebaliknya, dan sesetengah kategori, seperti hiburan, dihadkan.",
          },
          {
            question: "Adakah saya memerlukan ejen cukai atau akauntan?",
            answer:
              "Ia tidak diwajibkan oleh undang-undang untuk borang nyata yang mudah, tetapi ejen cukai atau akauntan berlesen boleh menjimatkan masa, mengesan potongan dan pelepasan yang terlepas, dan membantu anda mengelakkan penalti, terutamanya untuk syarikat. Walaupun sekali setahun, sebaik-baiknya sebelum akhir tahun anda, ia berbaloi.",
          },
        ],
      },
    },
  },
  {
    slug: "employee-leave-and-public-holidays-in-malaysia",
    title: "Employee Leave and Public Holidays in Malaysia: What the Employment Act Requires",
    seoTitle: "Employee Leave & Public Holidays in Malaysia Guide",
    seoDescription:
      "Annual, sick, hospitalisation, maternity and paternity leave under Malaysia's Employment Act, plus public holidays, leave payout and records for employers.",
    coverImage: {
      file: "employee-leave-and-public-holidays-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "Two colleagues going over plans together in a work meeting",
      altTranslations: {
        zh: "两位同事在工作会议中一起讨论计划",
        ms: "Dua rakan sekerja membincangkan rancangan bersama dalam mesyuarat kerja",
      },
    },
    contentImages: {
      records: {
        file: "employee-leave-and-public-holidays-in-malaysia-records.webp",
        mimeType: "image/webp",
        alt: "Two young women reviewing a folder of documents at their office desks",
        altTranslations: {
          zh: "两位年轻女性在办公桌前查看一份文件夹中的文件",
          ms: "Dua wanita muda menyemak fail dokumen di meja pejabat mereka",
        },
        after: "Treat your leave records as payroll records, not as a favour to staff.",
        afterTranslations: {
          zh: "请把休假记录当作薪资记录来对待，而不是对员工的一种人情。",
          ms: "Layan rekod cuti sebagai rekod gaji, bukan sebagai budi kepada kakitangan.",
        },
      },
    },
    excerpt:
      "Leave disputes are among the most common payroll problems for small employers, and most of them start with not knowing the statutory minimums. This guide covers annual, sick, hospitalisation, maternity and paternity leave under the Employment Act, how public holidays work (including when one falls on a rest day), how to handle unused leave, and the records that keep payroll disputes from starting.",
    body: `Leave is one of the first things a new employee asks about and one of the last things a busy owner has written down properly. Most leave disputes are not about generosity. They are about an owner not knowing the legal minimum, a contract that says one thing while payroll does another, or no record of what was actually taken. This guide walks through the statutory leave and public holiday rules that typically apply under Malaysia's Employment Act 1955, and the habits that stop small problems from becoming claims.

Leave entitlements, who is covered, and the exact figures have been amended over the years, and some rules differ in Sabah and Sarawak, which have their own labour laws. Treat the numbers below as the commonly stated minimums, and confirm them against the current Act or the Labour Department (JTKSM) before relying on them in a contract or a dispute.

## 1. Check who the Act covers and what your contract adds

The Employment Act covers employees regardless of salary since the 2022 amendments took effect, but certain provisions still apply differently to employees earning above a set monthly threshold, historically RM4,000, unless they fall into specified categories. Overtime-related rules are the best-known example.

### The Act is a floor, not a ceiling
Your employment contract, staff handbook, or company policy can give more than the statutory minimum, and when it does, the more generous term is what you have promised. It cannot give less. If your contract says 10 days of annual leave for someone with six years of service, the statutory figure of 16 still applies.

### Know which law applies to you
Employees in Peninsular Malaysia and Labuan fall under the Employment Act. Sabah and Sarawak have separate ordinances with their own provisions. If you operate across regions, check each.

## 2. Annual leave

Paid annual leave increases with length of service. The commonly stated minimums are:

- **Less than 2 years of service:** 8 days a year
- **2 years up to 5 years:** 12 days a year
- **5 years or more:** 16 days a year

### How it builds
Annual leave is generally earned after the first 12 months of service, with the entitlement for an incomplete year calculated proportionally in some cases, so check how your contract and the Act treat a new starter in their first year.

### Who approves it and when
Employers usually set the process for applying and approving leave, and can reasonably decide timing around business needs. What an employer cannot do is refuse to grant the statutory entitlement at all. Write your approval process into your handbook.

## 3. Sick leave and hospitalisation leave

Paid sick leave is separate from annual leave and rises with service. The tiers are commonly stated as 14 days for under 2 years, 18 days for 2 to under 5 years, and 22 days for 5 years or more, though some summaries list slightly different middle-tier figures, so confirm the current Act.

### Hospitalisation leave sits on top
Where an employee is hospitalised, the Act provides for a separate, longer allowance of paid hospitalisation leave, commonly stated as up to 60 days a year in total including sick leave.

### The medical certificate rule
Sick leave is generally supported by a certificate from a registered medical practitioner or a dental practitioner, and there are rules on how quickly an employee must inform you and on what to do when the employee cannot get a certificate. Put your notification rule in writing, such as "call or message your supervisor before the start of your shift on the first day", so it is clear.

> Putting your leave rules in writing is the cheapest dispute prevention there is. A one-page leave policy — who approves, how much notice is needed, what proof is required, and how unused days are treated — turns most disagreements into a lookup.

## 4. Maternity, paternity, and other family leave

### Maternity leave
Eligible female employees are entitled to paid maternity leave of 98 consecutive days under the amended Act, which replaced the earlier 60 days. The Act also protects employees from being terminated because of pregnancy, with limited exceptions, and the burden is on the employer to show the termination was for another reason. Check the current conditions on eligibility, notice, and pay.

### Paternity leave
The amended Act introduced paternity leave, commonly stated as 7 consecutive days, with conditions such as being married, giving notice, and a limit on the number of births it applies to. Confirm the current conditions.

### Other statutory and contractual leave
Depending on your workplace, you may also deal with compassionate leave, marriage leave, examination leave, or unpaid leave. These are often set by contract or policy rather than the Act, so decide your position and put it in writing rather than deciding each time someone asks.

## 5. Public holidays

### The minimum number
Covered employees are entitled to at least 11 paid public holidays a year. Several of them are mandatory and fixed by law, such as National Day, Malaysia Day, Labour Day, and the birthday of the Yang di-Pertuan Agong and of the state ruler or Yang di-Pertua Negeri. The employer may choose the remainder from the gazetted list, and must tell employees in advance which days apply. For employees in the Federal Territories, a Federal Territory Day holiday is also gazetted.

### When a holiday falls on a rest day
If a public holiday falls on an employee's weekly rest day, the Act generally provides that the next working day becomes the paid holiday. For a holiday that falls on a day an employee would normally work, the employee is entitled to the paid day off.

### Working on a public holiday
If you need someone to work on a public holiday, the Act sets a higher rate of pay, and there are separate rules for overtime on a holiday. The exact multiples depend on whether the employee is paid daily, hourly, or monthly, and different HR guides describe the calculation differently. Look up the current section of the Act or ask the Labour Department before running payroll, and do not rely on a single blog's formula.

### Substituting a holiday
In some cases an employer may substitute a different day for a gazetted holiday, but the Act sets conditions, such as notice to the employee. Do not swap holidays informally.

### Extra holidays are announced year to year
The government gazettes additional or one-off holidays, sometimes at short notice, such as a state-specific or special holiday. Check the current year's list and tell staff early.

## 6. Handle unused leave and leaving staff

### Carry-over and expiry
The Act sets minimum entitlements but is less detailed on carry-forward. Whether unused annual leave carries into next year, expires, or is paid out is usually set by your contract or policy, so decide this deliberately and apply it consistently.

### Payment on termination
When employment ends, accrued but unused leave that you are required to pay out is part of the final pay, along with wages and any notice pay or termination benefits. Calculate it with the correct daily rate of pay, and include it in the final payslip so nothing is missed.

### Leave during notice
Whether an employee may use leave during the notice period is a matter for your policy and agreement. State the position in the termination letter so there are no surprises.

## 7. Keep leave records you can defend

Treat your leave records as payroll records, not as a favour to staff. If a dispute goes to the Labour Department, your records are the evidence.

1. **Keep a leave ledger for each employee.** Opening balance, days earned, days taken with dates, and closing balance.
2. **Keep approvals in writing.** A WhatsApp message or email chain is better than nothing, but a leave form or a simple HR tool is better still.
3. **File medical certificates.** Store sick leave proof with the leave record, keeping personal data secure.
4. **Reconcile with payroll each month.** Unpaid leave should be deducted correctly, and paid leave should not be.
5. **Keep records for several years.** Employment records are generally expected to be retained for a period after employment ends, so check the current requirement.

If you are updating your handbook, a clear leave policy helps hiring too — [a free, verified listing here](/en/signup) helps candidates find and trust your business, and you can [browse the directory](/en) for local HR and payroll service providers who set up leave systems for small teams.

## Common mistakes Malaysian SMEs make with leave and public holidays

- **Offering less than the statutory minimum in the contract.** A contract that gives fewer days than the Act does not override the Act, and can leave you owing the difference.
- **Getting public holiday pay wrong.** Treating a holiday on a rest day as simply lost, or paying the wrong rate for holiday work, are two of the most frequent payroll errors.
- **Having no written leave policy or records.** Without a ledger and written rules, every dispute becomes one person's word against another's.

## Where to start

- **This week:** Check your contracts against the minimum annual, sick, hospitalisation, maternity, and paternity figures, and fix any that fall short.
- **Next:** Write a one-page leave policy covering approval, notice, medical certificates, carry-over, and payout, and share it with staff.
- **Then:** Set up a leave ledger for each employee and reconcile it with payroll every month.
- **Every year:** Publish your public holiday list early in the year, and check for newly gazetted days.

Getting leave right is mostly about knowing the floor, writing down your own rules, and keeping a record that shows you followed them.`,
    faqs: [
      {
        question: "How much annual leave must a Malaysian employer give under the Employment Act?",
        answer:
          "The commonly stated minimums are 8 days a year for under 2 years of service, 12 days for 2 to under 5 years, and 16 days for 5 years or more. Your contract can give more but not less. Confirm the current figures against the Act or the Labour Department.",
      },
      {
        question: "How many days of paid sick leave are employees entitled to?",
        answer:
          "Commonly stated as 14 days for under 2 years of service, 18 days for 2 to under 5 years, and 22 days for 5 years or more, with a separate, longer allowance of up to 60 days in total if hospitalised. Some summaries list slightly different middle-tier figures, so check the current Act.",
      },
      {
        question: "How long is maternity leave in Malaysia?",
        answer:
          "Eligible female employees are entitled to 98 consecutive days of paid maternity leave under the amended Employment Act, which replaced the earlier 60 days. Check the current conditions on eligibility, notice, and pay.",
      },
      {
        question: "Is paternity leave a legal requirement?",
        answer:
          "The amended Employment Act introduced paternity leave, commonly stated as 7 consecutive days, subject to conditions such as being married, giving notice, and a limit on how many births it covers. Confirm the current conditions before relying on it.",
      },
      {
        question: "How many public holidays must I give my employees?",
        answer:
          "Covered employees are entitled to at least 11 paid public holidays a year, including several mandatory ones such as National Day, Malaysia Day, Labour Day, and the birthdays of the Yang di-Pertuan Agong and the state ruler. You choose the rest from the gazetted list and must tell staff in advance.",
      },
      {
        question: "What happens if a public holiday falls on an employee's rest day?",
        answer:
          "The Act generally provides that the next working day becomes the paid holiday. Check the current wording and any rules about substituting another day before you plan payroll.",
      },
      {
        question: "Do I have to pay out unused annual leave when someone leaves?",
        answer:
          "Accrued, unused leave that you are required to pay out forms part of the final pay, calculated at the correct daily rate. Whether unused leave carries over or expires during employment is usually set by your contract or policy, so decide this and put it in writing.",
      },
      {
        question: "What leave records should a small business keep?",
        answer:
          "A leave ledger per employee showing opening balance, days earned, days taken with dates, and closing balance, plus written approvals and medical certificates, reconciled with payroll each month. Keep them for several years after employment ends and confirm the current retention requirement.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚的员工休假与公共假期：《雇佣法令》有哪些要求",
        excerpt:
          "休假纠纷是小雇主最常见的薪资问题之一，而大多数都源于不清楚法定最低标准。本指南说明《雇佣法令》下的年假、病假、住院假、产假和陪产假，公共假期如何运作（包括假期落在休息日时怎么办），如何处理未休的假期，以及防止薪资纠纷发生的记录。",
        body: `休假是新员工最早问到的事情之一，也是忙碌的企业主最晚才好好写下来的事情之一。大多数休假纠纷并不是慷慨与否的问题，而是企业主不知道法定最低标准，合约说一套而薪资处理却是另一套，或者对实际休了多少假没有记录。本指南介绍马来西亚《1955 年雇佣法令》下通常适用的法定休假和公共假期规则，以及避免小问题演变成申诉的习惯。

休假权益、适用对象和确切数字多年来都有修订，而沙巴和砂拉越有各自的劳工法，部分规定有所不同。请把下面的数字当作常被引用的最低标准，在写进合约或用于处理纠纷之前，请对照现行法令或劳工局（JTKSM）加以确认。

## 1. 先确认法令涵盖谁，以及您的合约另外给了什么

自 2022 年修正案生效后，《雇佣法令》涵盖所有员工，不论薪水高低，但某些条文对月薪高于一定门槛（历来是 RM4,000）的员工仍有不同的适用方式，除非他们属于特定类别。与加班相关的规定是最广为人知的例子。

### 法令是底线，不是上限
您的雇佣合约、员工手册或公司政策可以给予高于法定最低标准的待遇，一旦给了，您承诺的就是那个更优厚的条款。但不能低于法定标准。如果您的合约对一位服务六年的员工只给 10 天年假，法定的 16 天仍然适用。

### 清楚哪一部法律适用于您
西马和纳闽的员工适用《雇佣法令》。沙巴和砂拉越有各自的法令及规定。如果您跨地区经营，请逐一查核。

## 2. 年假

带薪年假随服务年资增加。常被引用的最低标准是：

- **服务不满 2 年：** 每年 8 天
- **服务 2 年至不满 5 年：** 每年 12 天
- **服务 5 年或以上：** 每年 16 天

### 如何累积
年假一般在服务满 12 个月后获得，不足一年的部分在某些情况下按比例计算，所以请查核您的合约和法令如何对待第一年的新员工。

### 谁批准、何时批准
雇主通常订立申请和批准休假的流程，也可以根据业务需要合理地决定时间。雇主不能做的，是完全拒绝给予法定的权益。请把您的批准流程写进员工手册。

## 3. 病假与住院假

带薪病假与年假分开，并随年资增加。常被引用的等级是：服务不满 2 年为 14 天，2 年至不满 5 年为 18 天，5 年或以上为 22 天，不过有些摘要列出的中间等级数字略有不同，所以请确认现行法令。

### 住院假另外计算
当员工住院时，法令规定了另一项更长的带薪住院假，常被引用的是包括病假在内每年合计最多 60 天。

### 医药证明书的规定
病假一般须有注册医生或牙医出具的证明书，另有规定员工须多快通知您，以及在无法取得证明书时该怎么办。请把您的通知规则写下来，例如“在第一天上班前致电或讯息通知您的主管”，让规则一目了然。

> 把您的休假规则写下来，是成本最低的纠纷预防措施。一页纸的休假政策——谁批准、需要多少通知时间、需要什么证明，以及未休的假期如何处理——可以把大多数分歧变成一次查表。

## 4. 产假、陪产假及其他家庭假期

### 产假
符合资格的女性员工，依修正后的法令享有连续 98 天的带薪产假，取代了此前的 60 天。法令也保护员工不会因怀孕而被终止雇佣，仅有少数例外，而且雇主有责任证明终止是出于其他原因。请查核目前关于资格、通知和薪酬的条件。

### 陪产假
修正后的法令引入了陪产假，常被引用的是连续 7 天，并附有条件，例如已婚、提前通知，以及对适用生育次数的限制。请确认目前的条件。

### 其他法定及合约假期
视您的工作场所而定，您可能还要处理恩恤假、婚假、考试假或无薪假。这些通常由合约或政策而非法令规定，所以请决定您的立场并写下来，而不是每次有人提出时才临时决定。

## 5. 公共假期

### 最低天数
受保障的员工每年至少享有 11 天带薪公共假期。其中几天是法律规定的强制假期，例如国庆日、马来西亚日、劳动节，以及最高元首和州元首或州长的诞辰。其余的可由雇主从宪报公布的假期中选择，并须提前告知员工适用的日子。对联邦直辖区的员工，联邦直辖区日也列入宪报假期。

### 假期落在休息日时
如果公共假期落在员工每周的休息日，法令一般规定下一个工作日成为带薪假期。对于落在员工本来要上班的日子的假期，员工有权享有带薪休假。

### 在公共假期上班
如果您需要员工在公共假期上班，法令规定了较高的薪酬率，另有关于假期加班的规则。确切的倍数取决于员工是按日、按小时还是按月计薪，而不同的人力资源指南对计算方式的描述也不同。运行薪资之前，请查阅法令的现行条文或询问劳工局，不要依赖某一篇博客的公式。

### 调换假期
在某些情况下，雇主可以用另一天替代宪报公布的假期，但法令设有条件，例如须通知员工。请不要随意私下调换假期。

### 额外假期逐年公布
政府会宪报公布额外或一次性的假期，有时较为仓促，例如各州特定假期或特别假期。请查看当年的名单并及早告知员工。

## 6. 处理未休的假期与离职员工

### 结转与失效
法令规定了最低权益，但对结转的规定较为简略。未休的年假是否结转到下一年、是否作废或折现，通常由您的合约或政策决定，所以请有意识地做出决定并一致地执行。

### 终止雇佣时的付款
雇佣关系结束时，已累积但未休、您必须折现的假期，是最后薪资的一部分，连同工资及任何通知期工资或终止福利。请用正确的日薪率计算，并列入最后的薪资单，以免遗漏。

### 通知期间的休假
员工能否在通知期内休假，由您的政策和协议决定。请在终止信中说明立场，以免出现意外。

## 7. 保存经得起检验的休假记录

请把休假记录当作薪资记录来对待，而不是对员工的一种人情。如果纠纷闹到劳工局，您的记录就是证据。

1. **为每位员工建立休假总账。** 期初余额、已获得的天数、已休天数及日期，以及期末余额。
2. **以书面保存批准。** WhatsApp 讯息或电邮往来总比没有好，但休假表格或简单的人力资源工具更好。
3. **归档医药证明书。** 把病假证明与休假记录一起存放，并确保个人资料安全。
4. **每月与薪资核对。** 无薪假应正确扣除，带薪假则不应扣除。
5. **保存记录数年。** 雇佣记录一般预期在雇佣关系结束后保留一段时间，所以请查核目前的要求。

如果您正在更新员工手册，清晰的休假政策也有助于招聘——[在这里免费创建认证列表](/zh/signup)，有助于求职者找到并信任您的企业，您也可以[浏览目录](/zh)，找到为小团队建立休假系统的本地人力资源和薪资服务商。

## 马来西亚中小企业在休假与公共假期上常犯的错误

- **合约给的低于法定最低标准。** 合约给的天数少于法令，并不能凌驾于法令之上，可能让您欠下差额。
- **算错公共假期薪酬。** 把落在休息日的假期当作白白失去，或为假期上班支付错误的薪酬率，是最常见的两种薪资错误。
- **没有书面休假政策或记录。** 没有总账和书面规则，每一次纠纷都会变成各执一词。

## 从哪里开始

- **本周：** 对照年假、病假、住院假、产假和陪产假的最低数字检查您的合约，并修正不足之处。
- **接下来：** 写一页休假政策，涵盖批准、通知、医药证明书、结转和折现，并与员工分享。
- **然后：** 为每位员工建立休假总账，并每月与薪资核对。
- **每年：** 在年初及早公布您的公共假期名单，并留意新公布的假期。

把休假做好，主要就是了解底线、写下自己的规则，并保存一份证明您遵守了规则的记录。`,
        faqs: [
          {
            question: "根据《雇佣法令》，马来西亚雇主必须给多少年假？",
            answer:
              "常被引用的最低标准是：服务不满 2 年每年 8 天，2 年至不满 5 年为 12 天，5 年或以上为 16 天。您的合约可以给更多，但不能更少。请对照法令或劳工局确认现行数字。",
          },
          {
            question: "员工有权享有多少天带薪病假？",
            answer:
              "常被引用的是：服务不满 2 年为 14 天，2 年至不满 5 年为 18 天，5 年或以上为 22 天，另有住院时合计最多 60 天的更长假期。有些摘要列出的中间等级数字略有不同，所以请查核现行法令。",
          },
          {
            question: "马来西亚的产假有多长？",
            answer:
              "符合资格的女性员工，依修正后的《雇佣法令》享有连续 98 天的带薪产假，取代了此前的 60 天。请查核目前关于资格、通知和薪酬的条件。",
          },
          {
            question: "陪产假是法律规定的吗？",
            answer:
              "修正后的《雇佣法令》引入了陪产假，常被引用的是连续 7 天，并附有条件，例如已婚、提前通知，以及对适用生育次数的限制。依赖它之前，请确认目前的条件。",
          },
          {
            question: "我必须给员工多少天公共假期？",
            answer:
              "受保障的员工每年至少享有 11 天带薪公共假期，其中包括几天强制假期，例如国庆日、马来西亚日、劳动节，以及最高元首和州元首的诞辰。其余的由您从宪报公布的名单中选择，并须提前告知员工。",
          },
          {
            question: "如果公共假期落在员工的休息日，会怎样？",
            answer:
              "法令一般规定下一个工作日成为带薪假期。规划薪资之前，请查核现行的措辞，以及关于调换其他日子的规则。",
          },
          {
            question: "员工离职时，我必须折现未休的年假吗？",
            answer:
              "已累积、您必须折现的未休假期，属于最后薪资的一部分，按正确的日薪率计算。未休假期在雇佣期间是否结转或作废，通常由您的合约或政策决定，所以请做出决定并写下来。",
          },
          {
            question: "小企业应该保存哪些休假记录？",
            answer:
              "为每位员工保存休假总账，列明期初余额、已获得天数、已休天数及日期和期末余额，另加书面批准和医药证明书，并每月与薪资核对。在雇佣关系结束后保存数年，并确认目前的保存要求。",
          },
        ],
      },
      ms: {
        title: "Cuti Pekerja dan Cuti Umum di Malaysia: Apa yang Dikehendaki Akta Kerja",
        excerpt:
          "Pertikaian cuti ialah antara masalah gaji yang paling biasa bagi majikan kecil, dan kebanyakannya bermula dengan tidak mengetahui minimum berkanun. Panduan ini merangkumi cuti tahunan, cuti sakit, cuti hospitalisasi, cuti bersalin dan cuti paterniti di bawah Akta Kerja, bagaimana cuti umum berfungsi (termasuk apabila ia jatuh pada hari rehat), cara menangani cuti yang tidak digunakan, dan rekod yang menghalang pertikaian gaji daripada bermula.",
        body: `Cuti ialah salah satu perkara pertama yang ditanya oleh pekerja baharu dan salah satu perkara terakhir yang ditulis dengan betul oleh pemilik yang sibuk. Kebanyakan pertikaian cuti bukan tentang kemurahan hati. Ia tentang pemilik yang tidak mengetahui minimum undang-undang, kontrak yang menyatakan satu perkara manakala gaji melakukan perkara lain, atau tiada rekod tentang apa yang sebenarnya diambil. Panduan ini menerangkan peraturan cuti berkanun dan cuti umum yang lazimnya terpakai di bawah Akta Kerja 1955 Malaysia, dan tabiat yang menghalang masalah kecil daripada menjadi tuntutan.

Hak cuti, siapa yang dilindungi, dan angka tepat telah dipinda dari tahun ke tahun, dan sesetengah peraturan berbeza di Sabah dan Sarawak, yang mempunyai undang-undang buruh sendiri. Anggaplah nombor di bawah sebagai minimum yang lazim dinyatakan, dan sahkan dengan Akta semasa atau Jabatan Tenaga Kerja (JTKSM) sebelum bergantung padanya dalam kontrak atau pertikaian.

## 1. Semak siapa yang dilindungi Akta dan apa yang ditambah oleh kontrak anda

Akta Kerja meliputi pekerja tanpa mengira gaji sejak pindaan 2022 berkuat kuasa, tetapi sesetengah peruntukan masih terpakai secara berbeza kepada pekerja yang berpendapatan melebihi ambang bulanan tertentu, secara sejarahnya RM4,000, melainkan mereka tergolong dalam kategori tertentu. Peraturan berkaitan kerja lebih masa ialah contoh yang paling dikenali.

### Akta ialah lantai, bukan siling
Kontrak pekerjaan, buku panduan kakitangan, atau dasar syarikat anda boleh memberi lebih daripada minimum berkanun, dan apabila ia berbuat demikian, terma yang lebih murah hati itulah yang telah anda janjikan. Ia tidak boleh memberi kurang. Jika kontrak anda menyatakan 10 hari cuti tahunan untuk seseorang yang berkhidmat enam tahun, angka berkanun 16 hari masih terpakai.

### Ketahui undang-undang mana yang terpakai kepada anda
Pekerja di Semenanjung Malaysia dan Labuan tertakluk kepada Akta Kerja. Sabah dan Sarawak mempunyai ordinan berasingan dengan peruntukan tersendiri. Jika anda beroperasi merentasi wilayah, semak setiap satu.

## 2. Cuti tahunan

Cuti tahunan berbayar meningkat mengikut tempoh perkhidmatan. Minimum yang lazim dinyatakan ialah:

- **Kurang 2 tahun perkhidmatan:** 8 hari setahun
- **2 tahun hingga kurang 5 tahun:** 12 hari setahun
- **5 tahun atau lebih:** 16 hari setahun

### Bagaimana ia terkumpul
Cuti tahunan amnya diperoleh selepas 12 bulan pertama perkhidmatan, dengan hak bagi tahun yang tidak lengkap dikira secara berkadar dalam sesetengah kes, jadi semak bagaimana kontrak dan Akta anda melayan pekerja baharu pada tahun pertama mereka.

### Siapa yang meluluskan dan bila
Majikan lazimnya menetapkan proses memohon dan meluluskan cuti, dan boleh menentukan masa dengan munasabah berdasarkan keperluan perniagaan. Apa yang tidak boleh dilakukan majikan ialah menolak sama sekali pemberian hak berkanun. Tuliskan proses kelulusan anda dalam buku panduan.

## 3. Cuti sakit dan cuti hospitalisasi

Cuti sakit berbayar adalah berasingan daripada cuti tahunan dan meningkat mengikut tempoh perkhidmatan. Tahapnya lazim dinyatakan sebagai 14 hari untuk kurang 2 tahun, 18 hari untuk 2 hingga kurang 5 tahun, dan 22 hari untuk 5 tahun atau lebih, walaupun sesetengah ringkasan menyenaraikan angka tahap tengah yang sedikit berbeza, jadi sahkan Akta semasa.

### Cuti hospitalisasi diletakkan di atasnya
Apabila pekerja dimasukkan ke hospital, Akta memperuntukkan elaun cuti hospitalisasi berbayar yang berasingan dan lebih panjang, yang lazim dinyatakan sebagai sehingga 60 hari setahun secara keseluruhan termasuk cuti sakit.

### Peraturan sijil perubatan
Cuti sakit amnya disokong oleh sijil daripada pengamal perubatan berdaftar atau pengamal pergigian, dan terdapat peraturan tentang betapa cepat pekerja mesti memaklumkan anda dan tentang apa yang perlu dilakukan apabila pekerja tidak dapat memperoleh sijil. Tuliskan peraturan pemberitahuan anda, seperti "telefon atau hantar mesej kepada penyelia anda sebelum syif bermula pada hari pertama", supaya ia jelas.

> Menulis peraturan cuti anda ialah pencegahan pertikaian yang paling murah. Dasar cuti satu halaman — siapa yang meluluskan, berapa lama notis diperlukan, bukti apa yang diperlukan, dan bagaimana hari yang tidak digunakan dilayan — menukarkan kebanyakan perselisihan kepada satu rujukan.

## 4. Cuti bersalin, paterniti, dan cuti keluarga lain

### Cuti bersalin
Pekerja wanita yang layak berhak mendapat cuti bersalin berbayar selama 98 hari berturut-turut di bawah Akta yang dipinda, yang menggantikan 60 hari terdahulu. Akta juga melindungi pekerja daripada ditamatkan perkhidmatan kerana kehamilan, dengan pengecualian terhad, dan majikan menanggung beban untuk menunjukkan penamatan itu atas sebab lain. Semak syarat semasa tentang kelayakan, notis, dan gaji.

### Cuti paterniti
Akta yang dipinda memperkenalkan cuti paterniti, yang lazim dinyatakan sebagai 7 hari berturut-turut, dengan syarat seperti telah berkahwin, memberi notis, dan had bilangan kelahiran yang dilindunginya. Sahkan syarat semasa.

### Cuti berkanun dan kontrak yang lain
Bergantung pada tempat kerja anda, anda mungkin juga berurusan dengan cuti ihsan, cuti perkahwinan, cuti peperiksaan, atau cuti tanpa gaji. Ini selalunya ditetapkan oleh kontrak atau dasar dan bukannya Akta, jadi tentukan pendirian anda dan tuliskannya dan bukannya memutuskan setiap kali seseorang bertanya.

## 5. Cuti umum

### Bilangan minimum
Pekerja yang dilindungi berhak mendapat sekurang-kurangnya 11 hari cuti umum berbayar setahun. Beberapa daripadanya adalah wajib dan ditetapkan oleh undang-undang, seperti Hari Kebangsaan, Hari Malaysia, Hari Pekerja, dan hari keputeraan Yang di-Pertuan Agong dan Sultan negeri atau Yang di-Pertua Negeri. Majikan boleh memilih baki daripada senarai yang diwartakan, dan mesti memberitahu pekerja lebih awal hari mana yang terpakai. Bagi pekerja di Wilayah Persekutuan, cuti Hari Wilayah Persekutuan juga diwartakan.

### Apabila cuti jatuh pada hari rehat
Jika cuti umum jatuh pada hari rehat mingguan pekerja, Akta amnya memperuntukkan bahawa hari bekerja berikutnya menjadi cuti berbayar. Bagi cuti yang jatuh pada hari yang lazimnya pekerja bekerja, pekerja berhak mendapat hari cuti berbayar.

### Bekerja pada cuti umum
Jika anda memerlukan seseorang bekerja pada cuti umum, Akta menetapkan kadar bayaran yang lebih tinggi, dan terdapat peraturan berasingan untuk kerja lebih masa pada cuti. Gandaan yang tepat bergantung pada sama ada pekerja dibayar harian, sejam, atau bulanan, dan panduan HR yang berbeza menerangkan pengiraan secara berbeza. Rujuk seksyen semasa Akta atau tanya Jabatan Tenaga Kerja sebelum menjalankan gaji, dan jangan bergantung pada formula satu blog sahaja.

### Menggantikan cuti
Dalam sesetengah kes majikan boleh menggantikan hari lain bagi cuti yang diwartakan, tetapi Akta menetapkan syarat, seperti notis kepada pekerja. Jangan tukar cuti secara tidak rasmi.

### Cuti tambahan diumumkan dari tahun ke tahun
Kerajaan mewartakan cuti tambahan atau sekali sahaja, kadangkala dengan notis singkat, seperti cuti khusus negeri atau cuti khas. Semak senarai tahun semasa dan beritahu kakitangan awal.

## 6. Uruskan cuti yang tidak digunakan dan kakitangan yang meninggalkan

### Bawa ke hadapan dan tamat tempoh
Akta menetapkan hak minimum tetapi kurang terperinci tentang bawa ke hadapan. Sama ada cuti tahunan yang tidak digunakan dibawa ke tahun depan, luput, atau dibayar lazimnya ditetapkan oleh kontrak atau dasar anda, jadi putuskan perkara ini dengan sengaja dan gunakannya secara konsisten.

### Bayaran semasa penamatan
Apabila pekerjaan tamat, cuti terakru tetapi tidak digunakan yang anda wajib bayar ialah sebahagian daripada gaji akhir, bersama gaji dan sebarang gaji notis atau faedah penamatan. Kira dengan kadar upah harian yang betul, dan sertakan dalam slip gaji akhir supaya tiada yang tertinggal.

### Cuti semasa notis
Sama ada pekerja boleh menggunakan cuti semasa tempoh notis ialah perkara untuk dasar dan perjanjian anda. Nyatakan pendirian dalam surat penamatan supaya tiada kejutan.

## 7. Simpan rekod cuti yang boleh anda pertahankan

Layan rekod cuti sebagai rekod gaji, bukan sebagai budi kepada kakitangan. Jika pertikaian sampai ke Jabatan Tenaga Kerja, rekod anda ialah buktinya.

1. **Simpan lejar cuti untuk setiap pekerja.** Baki permulaan, hari diperoleh, hari diambil dengan tarikh, dan baki penutup.
2. **Simpan kelulusan secara bertulis.** Mesej WhatsApp atau rantaian e-mel lebih baik daripada tiada, tetapi borang cuti atau alat HR yang mudah lebih baik lagi.
3. **Failkan sijil perubatan.** Simpan bukti cuti sakit bersama rekod cuti, sambil memastikan data peribadi selamat.
4. **Selaraskan dengan gaji setiap bulan.** Cuti tanpa gaji hendaklah ditolak dengan betul, dan cuti berbayar tidak.
5. **Simpan rekod selama beberapa tahun.** Rekod pekerjaan amnya dijangka disimpan untuk satu tempoh selepas pekerjaan tamat, jadi semak keperluan semasa.

Jika anda mengemas kini buku panduan, dasar cuti yang jelas juga membantu pengambilan pekerja — [penyenaraian percuma dan disahkan di sini](/ms/signup) membantu calon menemui dan mempercayai perniagaan anda, dan anda boleh [layari direktori](/ms) untuk penyedia perkhidmatan HR dan gaji tempatan yang menyediakan sistem cuti untuk pasukan kecil.

## Kesilapan lazim PKS Malaysia dengan cuti dan cuti umum

- **Menawarkan kurang daripada minimum berkanun dalam kontrak.** Kontrak yang memberi hari yang lebih sedikit daripada Akta tidak mengatasi Akta, dan boleh menyebabkan anda berhutang perbezaannya.
- **Tersalah bayaran cuti umum.** Menganggap cuti pada hari rehat sebagai hilang begitu sahaja, atau membayar kadar yang salah untuk kerja cuti, ialah dua daripada kesilapan gaji yang paling kerap.
- **Tiada dasar cuti bertulis atau rekod.** Tanpa lejar dan peraturan bertulis, setiap pertikaian menjadi kata seorang lawan kata seorang lagi.

## Di mana untuk bermula

- **Minggu ini:** Semak kontrak anda berbanding angka minimum cuti tahunan, sakit, hospitalisasi, bersalin, dan paterniti, dan betulkan mana-mana yang kurang.
- **Seterusnya:** Tulis dasar cuti satu halaman yang merangkumi kelulusan, notis, sijil perubatan, bawa ke hadapan, dan bayaran, dan kongsikannya dengan kakitangan.
- **Kemudian:** Sediakan lejar cuti untuk setiap pekerja dan selaraskannya dengan gaji setiap bulan.
- **Setiap tahun:** Terbitkan senarai cuti umum anda awal tahun, dan semak hari yang baru diwartakan.

Mendapatkan cuti dengan betul kebanyakannya tentang mengetahui lantai, menulis peraturan anda sendiri, dan menyimpan rekod yang menunjukkan anda mengikutinya.`,
        faqs: [
          {
            question: "Berapa banyak cuti tahunan yang mesti diberikan majikan Malaysia di bawah Akta Kerja?",
            answer:
              "Minimum yang lazim dinyatakan ialah 8 hari setahun untuk kurang 2 tahun perkhidmatan, 12 hari untuk 2 hingga kurang 5 tahun, dan 16 hari untuk 5 tahun atau lebih. Kontrak anda boleh memberi lebih tetapi tidak kurang. Sahkan angka semasa dengan Akta atau Jabatan Tenaga Kerja.",
          },
          {
            question: "Berapa hari cuti sakit berbayar yang menjadi hak pekerja?",
            answer:
              "Lazim dinyatakan sebagai 14 hari untuk kurang 2 tahun perkhidmatan, 18 hari untuk 2 hingga kurang 5 tahun, dan 22 hari untuk 5 tahun atau lebih, dengan elaun berasingan yang lebih panjang sehingga 60 hari secara keseluruhan jika dimasukkan ke hospital. Sesetengah ringkasan menyenaraikan angka tahap tengah yang sedikit berbeza, jadi semak Akta semasa.",
          },
          {
            question: "Berapa lamakah cuti bersalin di Malaysia?",
            answer:
              "Pekerja wanita yang layak berhak mendapat 98 hari berturut-turut cuti bersalin berbayar di bawah Akta Kerja yang dipinda, yang menggantikan 60 hari terdahulu. Semak syarat semasa tentang kelayakan, notis, dan gaji.",
          },
          {
            question: "Adakah cuti paterniti keperluan undang-undang?",
            answer:
              "Akta Kerja yang dipinda memperkenalkan cuti paterniti, yang lazim dinyatakan sebagai 7 hari berturut-turut, tertakluk kepada syarat seperti telah berkahwin, memberi notis, dan had bilangan kelahiran yang dilindunginya. Sahkan syarat semasa sebelum bergantung padanya.",
          },
          {
            question: "Berapa banyak cuti umum yang mesti saya berikan kepada pekerja?",
            answer:
              "Pekerja yang dilindungi berhak mendapat sekurang-kurangnya 11 hari cuti umum berbayar setahun, termasuk beberapa yang wajib seperti Hari Kebangsaan, Hari Malaysia, Hari Pekerja, dan hari keputeraan Yang di-Pertuan Agong dan Sultan negeri. Anda memilih selebihnya daripada senarai yang diwartakan dan mesti memberitahu kakitangan lebih awal.",
          },
          {
            question: "Apa yang berlaku jika cuti umum jatuh pada hari rehat pekerja?",
            answer:
              "Akta amnya memperuntukkan bahawa hari bekerja berikutnya menjadi cuti berbayar. Semak perkataan semasa dan sebarang peraturan tentang menggantikan hari lain sebelum anda merancang gaji.",
          },
          {
            question: "Adakah saya perlu membayar cuti tahunan yang tidak digunakan apabila seseorang berhenti?",
            answer:
              "Cuti terakru yang tidak digunakan yang anda wajib bayar membentuk sebahagian daripada gaji akhir, dikira pada kadar harian yang betul. Sama ada cuti yang tidak digunakan dibawa ke hadapan atau luput semasa pekerjaan lazimnya ditetapkan oleh kontrak atau dasar anda, jadi putuskan dan tuliskannya.",
          },
          {
            question: "Apakah rekod cuti yang perlu disimpan oleh perniagaan kecil?",
            answer:
              "Lejar cuti bagi setiap pekerja yang menunjukkan baki permulaan, hari diperoleh, hari diambil dengan tarikh, dan baki penutup, serta kelulusan bertulis dan sijil perubatan, diselaraskan dengan gaji setiap bulan. Simpan selama beberapa tahun selepas pekerjaan tamat dan sahkan keperluan penyimpanan semasa.",
          },
        ],
      },
    },
  },
  {
    slug: "collecting-late-payments-in-malaysia",
    title: "Collecting Late Payments in Malaysia: From Reminder to Letter of Demand to Small Claims",
    seoTitle: "Collecting Late Payments in Malaysia: Step-by-Step",
    seoDescription:
      "How Malaysian SMEs can chase overdue invoices: payment terms, reminders, a letter of demand, small claims versus court, limitation, and prevention.",
    coverImage: {
      file: "collecting-late-payments-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A businesswoman taking notes while on a phone call at her desk",
      altTranslations: {
        zh: "一位女企业家在办公桌前一边通电话一边做笔记",
        ms: "Seorang ahli perniagaan wanita mencatat nota semasa membuat panggilan telefon di mejanya",
      },
    },
    contentImages: {
      "demand-letter": {
        file: "collecting-late-payments-in-malaysia-demand-letter.webp",
        mimeType: "image/webp",
        alt: "Close-up of hands signing a document at an office desk",
        altTranslations: {
          zh: "办公桌前签署文件的双手特写",
          ms: "Gambar dekat tangan menandatangani dokumen di meja pejabat",
        },
        after: "Send the letter of demand only after you have your paper trail in order.",
        afterTranslations: {
          zh: "请先把书面记录整理好，再发出催款函。",
          ms: "Hantar surat tuntutan hanya selepas anda menyusun jejak dokumen anda dengan teratur.",
        },
      },
    },
    excerpt:
      "A late-paying customer can hurt a small business more than a slow month of sales. This guide lays out a practical escalation path for overdue invoices in Malaysia — clear payment terms, polite reminders, a letter of demand, small claims versus a regular court action, the limitation period, and the habits that stop invoices going overdue in the first place.",
    body: `For a small business, an unpaid invoice is not just an accounting entry. It is rent, wages, and supplier payments you have already committed to and cannot cover. Many owners hesitate to chase because they fear losing the customer, then wait so long that the debt becomes harder to collect. The better approach is a calm, escalating process that you follow every time, so chasing a payment is routine rather than a confrontation.

This is general information, not legal advice. Court procedures, monetary limits, and forms change, and some details below vary by situation, so confirm the current position with the court registry, the relevant court's official guidance, or a Malaysian lawyer before starting a claim.

## 1. Prevent the problem before it starts

The cheapest collection is the one you never need. Most late payments can be reduced by what you do before you deliver.

### Put the terms in writing
Every sale should have written terms covering the price, the payment due date (for example, 30 days from invoice date), accepted payment methods, and what happens if payment is late. A quotation, purchase order, or signed agreement that the customer accepted is far stronger evidence than a conversation.

### Decide on late fees and interest in advance
You can generally only charge a late fee or contractual interest if the customer agreed to it beforehand, so put it in your terms and invoice. Keep it reasonable, because courts can look unfavourably on penalties that are excessive.

### Check new customers
For a significant order, check that the business is real and registered, ask for trade references, and consider a deposit or staged payments for new or large accounts. Reliable customers will usually accept this.

### Invoice promptly and clearly
Send the invoice the day you deliver. Include the invoice number, date, due date, amount, what was supplied, and how to pay. Many late payments are simply invoices that were sent late or were unclear.

## 2. Build a reminder routine

Once an invoice is due, the goal is a prompt, courteous, documented follow-up. A simple routine you apply to everyone keeps it impersonal.

1. **A few days before the due date.** A friendly reminder that the invoice is due on a specific date.
2. **The day after the due date.** A short message asking whether the invoice has been received and when payment will be made.
3. **About a week late.** A firmer reminder by email, with the invoice attached, and a phone call if you have a contact there.
4. **Two to three weeks late.** A formal written reminder stating the amount, the original due date, any contractual late fee, and a clear deadline to pay.

### Keep everything in writing
Phone calls are useful, but follow up each one with a message that records what was agreed ("As discussed today, you will pay by Friday"). Those messages are evidence later.

### Find out what is really going on
A customer who is late because of a cash-flow squeeze may agree a short instalment plan, which is better than nothing. A customer who is disputing the quality of what you supplied needs a different conversation. Understanding the reason tells you whether to negotiate or escalate.

## 3. Consider a negotiated settlement

If the customer is willing but struggling, a written payment plan can recover the money faster and cheaper than court. Keep it simple:

- Confirm the amount owed and that it is not disputed.
- Agree specific dates and amounts, not "when I can".
- State in writing that the full balance becomes due immediately if an instalment is missed.
- Get the customer to sign or confirm by email.

### Be careful with partial payments
Accepting a smaller amount "in full and final settlement" can close the matter for good. Do not agree to this unless you intend to, and read any settlement wording carefully.

## 4. Send a letter of demand

A letter of demand is a formal written notice that the debt is owed and that you will take legal action if it is not paid by a stated date. For most ordinary invoice claims it is not a strict legal precondition, but it is standard practice, it shows the court you gave a fair chance, and it often prompts payment on its own.

Send the letter of demand only after you have your paper trail in order. The strongest letters are short, factual, and backed by documents:

1. **Identify the parties and the debt.** Full legal names, invoice numbers, dates, and the exact amount.
2. **State the basis.** What was supplied or agreed and when, referencing the quotation, order, or contract.
3. **Give a deadline.** Seven to fourteen days is common, stated as a firm date.
4. **State the consequence.** That you will begin legal proceedings, and claim interest and costs where your agreement allows, if the deadline is missed.
5. **Attach copies.** Invoices, delivery orders, statements, and key correspondence.
6. **Send it so you can prove delivery.** Use registered post and email, and keep the receipts.

### Consider a lawyer's letter
A letter on a law firm's letterhead often carries more weight and costs relatively little compared with the debt. It also tells you early whether your claim is as strong as you think.

### A statutory demand is a different, serious tool
For company debtors, a formal statutory demand under the Companies Act can be a step towards winding up a company that cannot pay a sufficiently large, undisputed debt, and the rules and thresholds are technical. It is a separate route with real consequences, including costs risk if the debt is disputed, so take legal advice before using it.

## 5. Choose the right forum if they still don't pay

If the customer ignores the letter, you are deciding between letting it go and starting a claim. Weigh the amount, the strength of your documents, and whether the customer can actually pay.

> Winning a judgment is not the same as getting paid. Before you spend money on court, ask honestly whether the customer has the assets, income, or bank balance to pay a judgment, and whether the debt is large enough to justify the cost and time.

### The Tribunal for Consumer Claims is probably not for you
This tribunal handles claims brought by consumers against traders over goods and services bought for personal use. It is generally not the forum for a business chasing an unpaid commercial invoice, so do not plan around it.

### Small claims
Malaysia has a simplified small claims procedure in the Magistrates' Court for low-value claims, designed to be quick and inexpensive and often without lawyers. The monetary cap and the rules on who can use it have been revised over time, with a figure of about RM5,000 commonly cited, so check the current limit and eligibility, including whether a company can claim. If your debt falls within it, it can be a practical route for small unpaid invoices.

### Magistrates' Court and Sessions Court
For larger amounts, the civil claim goes to the Magistrates' Court or the Sessions Court, depending on the amount, each with its own monetary jurisdiction that changes with amendments. These are normal civil actions involving a writ or summons, a statement of claim, and a defence if the customer contests it. You will usually want a lawyer, and costs and timelines are higher.

### High Court
Very large claims go to the High Court. For a typical SME invoice dispute, you will rarely be here, but it matters if the debt is substantial.

### Other options
Some contracts require mediation or arbitration first, so check what your agreement says. A debt recovery agent or a lawyer working on a fee arrangement can also take the chasing off your hands, though you should be clear on their fees and conduct.

## 6. Watch the limitation period

You cannot sue forever. Under the Limitation Act 1953, a claim founded on a contract is generally barred after six years from the date the cause of action arose, typically when the payment became due and was missed. Acknowledging the debt or making a part payment can affect the clock, and there are exceptions, so do not leave an old debt untouched. If an invoice is approaching two or three years old, get advice rather than hoping.

### Keep your evidence
Preserve invoices, delivery orders signed by the customer, contracts, correspondence, and statements of account. A signed delivery order showing the customer received the goods is among the most useful documents you can have.

## 7. Protect your business while you chase

- **Stop supply, or move to prepayment.** Continuing to deliver to a customer who has not paid grows the debt. Pause further credit until the overdue amount is settled.
- **Check your own commitments.** If a major customer's delay affects your ability to pay suppliers, speak to them early rather than letting your own records slip.
- **Review your credit policy.** Each late payer is a lesson. Tighten terms, shorten credit periods, or require deposits for risky accounts.

Making your business easy to find and verify also helps build the kind of customer relationships that pay on time — [a free, verified listing here](/en/signup) is a small way to show you are an established business, and you can [browse the directory](/en) for local lawyers, accountants, and debt recovery professionals who help small businesses with exactly this.

## Common mistakes Malaysian SMEs make when chasing payments

- **Having no written terms.** If the due date, price, and scope were agreed only verbally, every dispute becomes one person's word against another's.
- **Waiting too long to follow up.** Debts tend to get harder to collect the older they are, and an unchased invoice signals that payment is optional.
- **Going to court without checking the customer can pay.** A judgment against a customer with no assets or income costs you legal fees and still leaves the invoice unpaid.

## Where to start

- **This week:** List every overdue invoice with the customer, amount, due date, and what you have already done to chase it.
- **Next:** Send a firm written reminder for anything more than two or three weeks overdue, and a letter of demand for anything seriously late and undisputed.
- **Then:** Update your quotation and invoice templates with clear payment terms, a due date, and an agreed late-payment clause.
- **Every month:** Review your aged debtors list, and make a calm chasing routine part of your admin, not a crisis.

Collecting what you are owed is mostly about being clear before the sale, consistent after it, and realistic about when a legal claim is worth the cost.`,
    faqs: [
      {
        question: "When should I start chasing an overdue invoice in Malaysia?",
        answer:
          "Start immediately, with a polite reminder around the due date and a follow-up the day after. Debts usually become harder to collect the older they are, and a consistent reminder routine signals that payment terms are taken seriously.",
      },
      {
        question: "Can I charge interest or a late fee on overdue invoices?",
        answer:
          "Generally only if the customer agreed to it in advance, so put the late fee or interest rate in your written terms and on your invoice. Keep it reasonable, since courts may look unfavourably on excessive penalties.",
      },
      {
        question: "What is a letter of demand and do I need one?",
        answer:
          "A letter of demand is a formal written notice that the debt is owed and that you will begin legal action if it is not paid by a stated date. For ordinary invoice claims it is usually not a strict legal requirement, but it is standard practice and often prompts payment.",
      },
      {
        question: "What should a letter of demand include?",
        answer:
          "The full names of the parties, the invoice numbers, dates, and the exact amount, the basis of the debt, a firm deadline (commonly seven to fourteen days), the consequence of non-payment, and copies of supporting documents. Send it by a method you can prove, such as registered post and email.",
      },
      {
        question: "Can I use the Tribunal for Consumer Claims to collect a business invoice?",
        answer:
          "Generally no. That tribunal deals with claims brought by consumers against traders for goods and services bought for personal use. A business chasing an unpaid commercial invoice normally looks at small claims or a civil action in the Magistrates' or Sessions Court.",
      },
      {
        question: "Is there a small claims procedure for unpaid invoices?",
        answer:
          "Malaysia has a simplified small claims procedure in the Magistrates' Court for low-value claims, often cited at about RM5,000, but the cap and eligibility rules have been revised, so confirm the current limit and whether a company can use it before filing.",
      },
      {
        question: "How long do I have to sue for an unpaid debt?",
        answer:
          "Under the Limitation Act 1953, claims founded on a contract are generally barred after six years from when the cause of action arose, usually when the payment became due and was missed. Acknowledgement or part payment can affect the clock, and there are exceptions, so get advice on older debts.",
      },
      {
        question: "How can I stop customers paying late in the first place?",
        answer:
          "Put clear written terms and a due date on every quotation and invoice, agree late-payment terms in advance, check new customers and consider deposits for large or new accounts, invoice on the day of delivery, and run a consistent reminder routine.",
      },
    ],
    translations: {
      zh: {
        title: "在马来西亚追收逾期货款：从提醒、催款函到小额索偿",
        excerpt:
          "客户拖欠货款，对小企业的伤害可能比一个销售淡月更大。本指南为马来西亚逾期发票提出一条实用的逐步升级路径——清晰的付款条款、礼貌的提醒、催款函、小额索偿与一般法庭诉讼的选择、诉讼时效，以及从一开始就防止发票逾期的习惯。",
        body: `对小企业来说，一张未付的发票不只是账目上的一个条目。它是您已经承诺却无力支付的租金、工资和供应商款项。许多企业主因为怕失去客户而不敢追款，然后拖了太久，让债务变得更难收回。更好的做法是建立一套冷静、逐步升级的流程，每次都照着做，让追款成为日常事务，而不是一场对峙。

以下仅为一般资讯，并非法律意见。法庭程序、金额限制和表格会变动，下面的一些细节也因情况而异，所以在提出索偿之前，请向法庭登记处、相关法庭的官方指引或马来西亚律师确认最新情况。

## 1. 在问题发生之前先预防

最便宜的追收，是您根本不需要进行的追收。大多数逾期付款，都可以通过交货前的做法来减少。

### 把条款写下来
每一笔销售都应有书面条款，涵盖价格、付款到期日（例如发票日期起 30 天）、接受的付款方式，以及逾期付款会怎样。客户接受的报价单、采购订单或已签署的协议，比一次口头交谈有力得多。

### 事先决定滞纳金与利息
一般只有在客户事先同意的情况下，您才能收取滞纳金或合约利息，所以请把它写进您的条款和发票。请保持合理，因为法庭可能对过高的罚款持不利看法。

### 审查新客户
对于较大的订单，请确认该企业真实且已注册，索取商业参考人，并对新客户或大客户考虑收取订金或分期付款。可靠的客户通常会接受。

### 及时且清晰地开发票
交货当天就发出发票。注明发票编号、日期、到期日、金额、供应的内容以及付款方式。许多逾期付款，其实只是发票发得太晚或不够清楚。

## 2. 建立提醒流程

一旦发票到期，目标是及时、礼貌且有记录的跟进。对每个人都适用的简单流程，能让整件事保持对事不对人。

1. **到期日前几天。** 友好地提醒发票将在某个具体日期到期。
2. **到期日的隔天。** 简短的讯息，询问发票是否已收到，以及何时付款。
3. **逾期约一周。** 以电邮发出较严厉的提醒，附上发票，如果对方有联络人，也打个电话。
4. **逾期两到三周。** 正式的书面提醒，列明金额、原定到期日、任何合约滞纳金，以及清楚的付款期限。

### 一切都要有书面记录
电话很有用，但每次通话后都要用讯息跟进，记录所商定的内容（“按今天所谈，您将在星期五前付款”）。这些讯息日后就是证据。

### 弄清楚到底发生了什么
因现金流紧张而逾期的客户，也许会同意一个简短的分期付款计划，这总比什么都没有好。对您所供应的质量有争议的客户，则需要另一种沟通。了解原因，才知道该协商还是升级处理。

## 3. 考虑协商和解

如果客户愿意但手头紧，书面的付款计划可以比法庭更快、更便宜地追回款项。请保持简单：

- 确认所欠金额，且没有争议。
- 约定具体的日期和金额，而不是“等我有能力的时候”。
- 以书面注明，如果错过任何一期，全部余额即时到期。
- 让客户签署或以电邮确认。

### 小心部分付款
接受较少的金额作为“全部及最终清偿”，可能会永久了结此事。除非您打算如此，否则不要同意，并仔细阅读任何和解的措辞。

## 4. 发出催款函

催款函是一份正式的书面通知，说明该债务已到期，并表示如果不在指定日期前付款，您将采取法律行动。对大多数普通发票索偿而言，它并非严格的法律前提条件，但它是标准做法，向法庭表明您已给过公平的机会，而且往往本身就能促使对方付款。

请先把书面记录整理好，再发出催款函。最有力的函件简短、事实清楚，并有文件支持：

1. **注明双方和债务。** 全名、发票编号、日期和确切金额。
2. **说明依据。** 何时供应或约定了什么，并引用报价单、订单或合约。
3. **给出期限。** 七到十四天是常见的，以明确的日期表示。
4. **说明后果。** 如果错过期限，您将展开法律程序，并在协议允许的情况下索取利息和诉讼费用。
5. **附上副本。** 发票、送货单、对账单和关键往来函件。
6. **以可证明送达的方式发送。** 使用挂号邮寄和电邮，并保留收据。

### 考虑由律师发函
由律师事务所信笺发出的函件，往往更有分量，而且与债务相比成本相对较低。它也能让您及早知道，您的索偿是否像您想的那样站得住脚。

### 法定催缴书是另一种严肃的工具
对于公司债务人，根据《公司法》发出的正式法定催缴书，可能是迈向清盘一家无力偿还足够大额且无争议债务的公司的一步，而规则和门槛相当技术性。这是一条另行的途径，会带来实际后果，包括债务有争议时的费用风险，所以使用之前请先寻求法律意见。

## 5. 如果对方仍不付款，选择正确的审理场所

如果客户无视催款函，您就要在放弃与展开索偿之间做出选择。请权衡金额、文件的力度，以及客户是否真的付得起。

> 赢得判决并不等于收到款项。在花钱打官司之前，请诚实地问自己，客户是否有资产、收入或银行存款来支付判决金额，以及这笔债务是否大到值得付出这些成本和时间。

### 消费者索偿仲裁庭大概并不适合您
该仲裁庭处理的是消费者因个人用途购买的商品和服务，而向商家提出的索偿。它一般不是企业追收未付商业发票的场所，所以不要围绕它来规划。

### 小额索偿
马来西亚在推事庭设有针对小额索偿的简化程序，旨在快速且低成本，通常无需律师。金额上限以及谁可以使用的规则，多年来都有修订，常被引用的数字约为 RM5,000，所以请查核目前的上限和资格，包括公司是否可以提出索偿。如果您的债务在其范围内，它可以是追收小额未付发票的实用途径。

### 推事庭与会话庭
对于较大的金额，民事索偿会交由推事庭或会话庭审理，视金额而定，各自的金额管辖权会随修订而变动。这些是正常的民事诉讼，涉及令状或传票、索偿陈述书，以及客户提出抗辩时的答辩状。您通常需要律师，费用和时间也更高。

### 高等法院
金额非常大的索偿交由高等法院审理。对于典型的中小企业发票纠纷，您很少会走到这一步，但如果债务巨大，则要留意。

### 其他选择
有些合约要求先进行调解或仲裁，所以请查看您的协议怎么说。债务追收代理，或按收费安排工作的律师，也可以替您接手追款，不过您应当清楚他们的收费和行为准则。

## 6. 留意诉讼时效

您不能永远起诉下去。根据《1953 年时效法令》，基于合约的索偿，一般在诉因产生之日起六年后即被时效禁止，通常是从付款到期且被错过时起算。承认债务或部分付款可能影响时效的计算，而且设有例外，所以不要放着旧债不管。如果一张发票接近两三年，请寻求意见，而不是抱着希望干等。

### 保存您的证据
保存发票、客户签收的送货单、合约、往来函件和对账单。显示客户已收到货物的已签收送货单，是您能拥有的最有用的文件之一。

## 7. 追款期间保护好您的企业

- **停止供货，或改为预付。** 继续向未付款的客户交货，只会让债务越滚越大。在逾期款项结清之前，暂停进一步的赊账。
- **检查您自己的承诺。** 如果某位大客户的拖延影响了您支付供应商的能力，请及早与他们沟通，而不要让自己的记录出现疏漏。
- **检视您的信贷政策。** 每一位逾期付款者都是一次教训。收紧条款、缩短信贷期，或对高风险账户要求订金。

让您的企业容易被找到和验证，也有助于建立按时付款的客户关系——[在这里免费创建认证列表](/zh/signup)，是展示您是一家成熟企业的一个小小方式，您也可以[浏览目录](/zh)，找到专门帮助小企业处理这类事务的本地律师、会计师和债务追收专业人士。

## 马来西亚中小企业在追款时常犯的错误

- **没有书面条款。** 如果到期日、价格和范围只是口头约定，每一次纠纷都会变成各执一词。
- **太晚才跟进。** 债务越老越难收回，而不追的发票，会让对方觉得付款是可有可无的。
- **没有确认客户付得起就上法庭。** 对一个没有资产或收入的客户取得判决，会让您付出律师费，发票却依然未付。

## 从哪里开始

- **本周：** 列出每一张逾期发票，注明客户、金额、到期日，以及您已经做过哪些追款动作。
- **接下来：** 对逾期超过两三周的款项发出严厉的书面提醒，对严重逾期且无争议的款项发出催款函。
- **然后：** 在您的报价单和发票模板中加入清晰的付款条款、到期日和约定的逾期付款条款。
- **每个月：** 检视您的账龄应收账款清单，让冷静的追款流程成为日常行政的一部分，而不是一场危机。

收回您应得的款项，主要就是在销售之前把话说清楚，在销售之后保持一致，并对法律索偿是否值得付出成本保持现实的态度。`,
        faqs: [
          {
            question: "在马来西亚，我应该什么时候开始追收逾期发票？",
            answer:
              "立即开始，在到期日前后发出礼貌的提醒，并在隔天跟进。债务通常越老越难收回，而一致的提醒流程表明您重视付款条款。",
          },
          {
            question: "我可以对逾期发票收取利息或滞纳金吗？",
            answer:
              "一般只有在客户事先同意的情况下才可以，所以请把滞纳金或利率写进您的书面条款和发票。请保持合理，因为法庭可能对过高的罚款持不利看法。",
          },
          {
            question: "什么是催款函？我需要发吗？",
            answer:
              "催款函是一份正式的书面通知，说明债务已到期，并表示如果不在指定日期前付款，您将展开法律行动。对普通发票索偿而言，它通常并非严格的法律要求，但它是标准做法，往往能促使对方付款。",
          },
          {
            question: "催款函应该包含哪些内容？",
            answer:
              "双方的全名、发票编号、日期和确切金额、债务的依据、明确的期限（常见为七到十四天）、不付款的后果，以及证明文件的副本。请以您能证明送达的方式发送，例如挂号邮寄加电邮。",
          },
          {
            question: "我可以用消费者索偿仲裁庭来追收商业发票吗？",
            answer:
              "一般不可以。该仲裁庭处理的是消费者因个人用途购买的商品和服务，而向商家提出的索偿。追收未付商业发票的企业，通常考虑小额索偿或在推事庭或会话庭提出民事诉讼。",
          },
          {
            question: "未付发票有小额索偿程序吗？",
            answer:
              "马来西亚在推事庭设有针对小额索偿的简化程序，常被引用的上限约为 RM5,000，但上限和资格规则曾有修订，所以在提出申请前，请确认目前的上限，以及公司是否可以使用。",
          },
          {
            question: "我有多长时间可以就未付债务提出起诉？",
            answer:
              "根据《1953 年时效法令》，基于合约的索偿，一般在诉因产生之日起六年后即被时效禁止，通常从付款到期且被错过时起算。承认债务或部分付款可能影响时效，而且设有例外，所以对较旧的债务请寻求意见。",
          },
          {
            question: "我怎样才能从一开始就避免客户逾期付款？",
            answer:
              "在每份报价单和发票上注明清晰的书面条款和到期日，事先约定逾期付款条款，审查新客户并对大客户或新客户考虑收取订金，在交货当天开发票，并执行一致的提醒流程。",
          },
        ],
      },
      ms: {
        title: "Menuntut Bayaran Lewat di Malaysia: Dari Peringatan ke Surat Tuntutan hingga Tuntutan Kecil",
        excerpt:
          "Pelanggan yang lewat membayar boleh memudaratkan perniagaan kecil lebih daripada bulan jualan yang perlahan. Panduan ini menggariskan laluan peningkatan yang praktikal untuk invois tertunggak di Malaysia — terma pembayaran yang jelas, peringatan yang sopan, surat tuntutan, tuntutan kecil berbanding tindakan mahkamah biasa, tempoh had masa, dan tabiat yang menghalang invois menjadi tertunggak sejak awal lagi.",
        body: `Bagi perniagaan kecil, invois yang tidak dibayar bukan sekadar catatan perakaunan. Ia ialah sewa, gaji, dan bayaran pembekal yang telah anda komitkan dan tidak mampu tampung. Ramai pemilik teragak-agak untuk menuntut kerana takut kehilangan pelanggan, kemudian menunggu terlalu lama sehingga hutang itu menjadi lebih sukar dikutip. Pendekatan yang lebih baik ialah proses yang tenang dan meningkat secara beransur-ansur yang anda ikuti setiap kali, supaya menuntut bayaran menjadi rutin dan bukan konfrontasi.

Ini ialah maklumat am, bukan nasihat undang-undang. Prosedur mahkamah, had kewangan, dan borang berubah, dan sesetengah butiran di bawah berbeza mengikut keadaan, jadi sahkan kedudukan semasa dengan pendaftaran mahkamah, panduan rasmi mahkamah berkaitan, atau peguam Malaysia sebelum memulakan tuntutan.

## 1. Cegah masalah sebelum ia bermula

Kutipan yang paling murah ialah yang tidak pernah anda perlukan. Kebanyakan bayaran lewat boleh dikurangkan melalui apa yang anda lakukan sebelum menyerahkan barangan.

### Tulis terma secara bertulis
Setiap jualan hendaklah mempunyai terma bertulis yang merangkumi harga, tarikh matang pembayaran (contohnya, 30 hari dari tarikh invois), kaedah pembayaran yang diterima, dan apa yang berlaku jika pembayaran lewat. Sebut harga, pesanan pembelian, atau perjanjian bertandatangan yang diterima pelanggan ialah bukti yang jauh lebih kukuh daripada perbualan.

### Tentukan yuran lewat dan faedah lebih awal
Anda amnya hanya boleh mengenakan yuran lewat atau faedah kontrak jika pelanggan bersetuju terlebih dahulu, jadi letakkannya dalam terma dan invois anda. Pastikan ia munasabah, kerana mahkamah boleh memandang negatif terhadap penalti yang keterlaluan.

### Semak pelanggan baharu
Untuk pesanan yang besar, semak bahawa perniagaan itu benar dan berdaftar, minta rujukan dagangan, dan pertimbangkan deposit atau bayaran berperingkat untuk akaun baharu atau besar. Pelanggan yang boleh dipercayai lazimnya akan menerima ini.

### Keluarkan invois dengan segera dan jelas
Hantar invois pada hari anda menyerahkan barangan. Sertakan nombor invois, tarikh, tarikh matang, jumlah, apa yang dibekalkan, dan cara membayar. Banyak bayaran lewat hanyalah invois yang dihantar lewat atau tidak jelas.

## 2. Bina rutin peringatan

Apabila invois sudah matang, matlamatnya ialah susulan yang pantas, sopan, dan didokumenkan. Rutin mudah yang anda gunakan kepada semua orang menjadikannya tidak peribadi.

1. **Beberapa hari sebelum tarikh matang.** Peringatan mesra bahawa invois akan matang pada tarikh tertentu.
2. **Sehari selepas tarikh matang.** Mesej ringkas bertanya sama ada invois telah diterima dan bila bayaran akan dibuat.
3. **Kira-kira seminggu lewat.** Peringatan yang lebih tegas melalui e-mel, dengan invois dilampirkan, dan panggilan telefon jika anda mempunyai hubungan di sana.
4. **Dua hingga tiga minggu lewat.** Peringatan bertulis rasmi yang menyatakan jumlah, tarikh matang asal, sebarang yuran lewat kontrak, dan tarikh akhir yang jelas untuk membayar.

### Simpan semuanya secara bertulis
Panggilan telefon berguna, tetapi susuli setiap satu dengan mesej yang merekodkan apa yang dipersetujui ("Seperti dibincangkan hari ini, anda akan membayar menjelang Jumaat"). Mesej-mesej itu menjadi bukti kemudian.

### Ketahui apa yang sebenarnya berlaku
Pelanggan yang lewat kerana kesempitan aliran tunai mungkin bersetuju dengan pelan ansuran ringkas, yang lebih baik daripada tiada apa-apa. Pelanggan yang mempertikaikan kualiti apa yang anda bekalkan memerlukan perbualan yang berbeza. Memahami sebabnya memberitahu anda sama ada untuk berunding atau meningkatkan tindakan.

## 3. Pertimbangkan penyelesaian yang dirundingkan

Jika pelanggan sanggup tetapi bergelut, pelan pembayaran bertulis boleh mendapatkan semula wang dengan lebih pantas dan murah daripada mahkamah. Jadikan ia mudah:

- Sahkan jumlah yang terhutang dan bahawa ia tidak dipertikaikan.
- Setujui tarikh dan jumlah tertentu, bukan "bila saya mampu".
- Nyatakan secara bertulis bahawa baki penuh menjadi matang serta-merta jika ansuran terlepas.
- Minta pelanggan menandatangani atau mengesahkan melalui e-mel.

### Berhati-hati dengan bayaran separa
Menerima jumlah yang lebih kecil sebagai "penyelesaian penuh dan muktamad" boleh menutup perkara itu selama-lamanya. Jangan bersetuju melainkan anda berniat demikian, dan baca teliti sebarang perkataan penyelesaian.

## 4. Hantar surat tuntutan

Surat tuntutan ialah notis bertulis rasmi bahawa hutang itu terhutang dan bahawa anda akan mengambil tindakan undang-undang jika ia tidak dibayar menjelang tarikh yang dinyatakan. Bagi kebanyakan tuntutan invois biasa ia bukan prasyarat undang-undang yang ketat, tetapi ia amalan standard, ia menunjukkan kepada mahkamah bahawa anda memberi peluang yang adil, dan ia selalunya mendorong pembayaran dengan sendirinya.

Hantar surat tuntutan hanya selepas anda menyusun jejak dokumen anda dengan teratur. Surat yang paling kukuh ialah ringkas, berfakta, dan disokong oleh dokumen:

1. **Kenal pasti pihak dan hutang.** Nama penuh, nombor invois, tarikh, dan jumlah tepat.
2. **Nyatakan asas.** Apa yang dibekalkan atau dipersetujui dan bila, merujuk sebut harga, pesanan, atau kontrak.
3. **Beri tarikh akhir.** Tujuh hingga empat belas hari adalah lazim, dinyatakan sebagai tarikh yang tegas.
4. **Nyatakan akibatnya.** Bahawa anda akan memulakan prosiding undang-undang, dan menuntut faedah dan kos jika perjanjian anda membenarkan, jika tarikh akhir terlepas.
5. **Lampirkan salinan.** Invois, order penghantaran, penyata, dan surat-menyurat utama.
6. **Hantar supaya anda boleh membuktikan penghantaran.** Gunakan pos berdaftar dan e-mel, dan simpan resit.

### Pertimbangkan surat daripada peguam
Surat pada kepala surat firma guaman selalunya mempunyai bobot lebih dan kosnya agak kecil berbanding hutang. Ia juga memberitahu anda lebih awal sama ada tuntutan anda sekukuh yang anda fikirkan.

### Tuntutan berkanun ialah alat yang berbeza dan serius
Bagi penghutang syarikat, tuntutan berkanun rasmi di bawah Akta Syarikat boleh menjadi langkah ke arah penggulungan syarikat yang tidak mampu membayar hutang yang cukup besar dan tidak dipertikaikan, dan peraturan serta ambangnya bersifat teknikal. Ia ialah laluan berasingan dengan akibat sebenar, termasuk risiko kos jika hutang dipertikaikan, jadi dapatkan nasihat undang-undang sebelum menggunakannya.

## 5. Pilih forum yang betul jika mereka masih tidak membayar

Jika pelanggan mengabaikan surat itu, anda memilih antara melepaskannya dan memulakan tuntutan. Timbang jumlah, kekuatan dokumen anda, dan sama ada pelanggan benar-benar mampu membayar.

> Memenangi penghakiman tidak sama dengan dibayar. Sebelum anda membelanjakan wang di mahkamah, tanya dengan jujur sama ada pelanggan mempunyai aset, pendapatan, atau baki bank untuk membayar penghakiman, dan sama ada hutang itu cukup besar untuk membenarkan kos dan masa.

### Tribunal Tuntutan Pengguna mungkin bukan untuk anda
Tribunal ini mengendalikan tuntutan yang dibawa oleh pengguna terhadap peniaga mengenai barangan dan perkhidmatan yang dibeli untuk kegunaan peribadi. Ia amnya bukan forum untuk perniagaan yang menuntut invois komersial yang tidak dibayar, jadi jangan merancang berdasarkannya.

### Tuntutan kecil
Malaysia mempunyai prosedur tuntutan kecil yang dipermudahkan di Mahkamah Majistret untuk tuntutan bernilai rendah, direka supaya cepat dan murah dan selalunya tanpa peguam. Had kewangan dan peraturan tentang siapa yang boleh menggunakannya telah disemak dari semasa ke semasa, dengan angka sekitar RM5,000 lazim disebut, jadi semak had dan kelayakan semasa, termasuk sama ada syarikat boleh menuntut. Jika hutang anda berada dalam lingkungannya, ia boleh menjadi laluan praktikal untuk invois kecil yang tidak dibayar.

### Mahkamah Majistret dan Mahkamah Sesyen
Untuk jumlah yang lebih besar, tuntutan sivil dibawa ke Mahkamah Majistret atau Mahkamah Sesyen, bergantung pada jumlah, masing-masing dengan bidang kuasa kewangan sendiri yang berubah dengan pindaan. Ini ialah tindakan sivil biasa yang melibatkan writ atau saman, pernyataan tuntutan, dan pembelaan jika pelanggan mencabarnya. Anda lazimnya mahukan peguam, dan kos serta garis masa adalah lebih tinggi.

### Mahkamah Tinggi
Tuntutan yang sangat besar dibawa ke Mahkamah Tinggi. Untuk pertikaian invois PKS yang tipikal, anda jarang berada di sini, tetapi ia penting jika hutang itu besar.

### Pilihan lain
Sesetengah kontrak memerlukan pengantaraan atau timbang tara dahulu, jadi semak apa yang dinyatakan perjanjian anda. Ejen pemulihan hutang atau peguam yang bekerja dengan susunan yuran juga boleh mengambil alih kerja menuntut, walaupun anda perlu jelas tentang yuran dan tingkah laku mereka.

## 6. Perhatikan tempoh had masa

Anda tidak boleh menyaman selama-lamanya. Di bawah Akta Had Masa 1953, tuntutan yang berasaskan kontrak amnya terhalang selepas enam tahun dari tarikh sebab tindakan bermula, lazimnya apabila bayaran menjadi matang dan terlepas. Mengakui hutang atau membuat bayaran separa boleh menjejaskan jam itu, dan terdapat pengecualian, jadi jangan biarkan hutang lama tidak disentuh. Jika invois menghampiri dua atau tiga tahun, dapatkan nasihat dan bukannya berharap.

### Simpan bukti anda
Simpan invois, order penghantaran yang ditandatangani pelanggan, kontrak, surat-menyurat, dan penyata akaun. Order penghantaran bertandatangan yang menunjukkan pelanggan menerima barangan ialah antara dokumen paling berguna yang boleh anda miliki.

## 7. Lindungi perniagaan anda semasa menuntut

- **Hentikan bekalan, atau beralih kepada bayaran pendahuluan.** Terus menghantar kepada pelanggan yang belum membayar hanya menambah hutang. Hentikan kredit selanjutnya sehingga jumlah tertunggak diselesaikan.
- **Semak komitmen anda sendiri.** Jika kelewatan pelanggan utama menjejaskan keupayaan anda membayar pembekal, bercakap dengan mereka lebih awal dan jangan biarkan rekod anda sendiri tergelincir.
- **Semak dasar kredit anda.** Setiap pembayar lewat ialah pengajaran. Ketatkan terma, pendekkan tempoh kredit, atau minta deposit untuk akaun berisiko.

Menjadikan perniagaan anda mudah ditemui dan disahkan juga membantu membina hubungan pelanggan yang membayar tepat pada masanya — [penyenaraian percuma dan disahkan di sini](/ms/signup) ialah cara kecil untuk menunjukkan anda perniagaan yang mantap, dan anda boleh [layari direktori](/ms) untuk peguam, akauntan, dan profesional pemulihan hutang tempatan yang membantu perniagaan kecil dengan perkara ini.

## Kesilapan lazim PKS Malaysia ketika menuntut bayaran

- **Tiada terma bertulis.** Jika tarikh matang, harga, dan skop dipersetujui secara lisan sahaja, setiap pertikaian menjadi kata seorang lawan kata seorang lagi.
- **Menunggu terlalu lama untuk menyusuli.** Hutang cenderung menjadi lebih sukar dikutip semakin lama usianya, dan invois yang tidak dituntut memberi isyarat bahawa pembayaran adalah pilihan.
- **Pergi ke mahkamah tanpa menyemak pelanggan mampu membayar.** Penghakiman terhadap pelanggan yang tiada aset atau pendapatan menelan yuran guaman anda dan invois tetap tidak dibayar.

## Di mana untuk bermula

- **Minggu ini:** Senaraikan setiap invois tertunggak dengan pelanggan, jumlah, tarikh matang, dan apa yang telah anda lakukan untuk menuntutnya.
- **Seterusnya:** Hantar peringatan bertulis yang tegas untuk apa-apa yang tertunggak lebih dua atau tiga minggu, dan surat tuntutan untuk apa-apa yang sangat lewat dan tidak dipertikaikan.
- **Kemudian:** Kemas kini templat sebut harga dan invois anda dengan terma pembayaran yang jelas, tarikh matang, dan fasal bayaran lewat yang dipersetujui.
- **Setiap bulan:** Semak senarai penghutang mengikut usia anda, dan jadikan rutin menuntut yang tenang sebahagian daripada pentadbiran anda, bukan krisis.

Mengutip apa yang terhutang kepada anda kebanyakannya tentang bersikap jelas sebelum jualan, konsisten selepasnya, dan realistik tentang bila tuntutan undang-undang berbaloi dengan kosnya.`,
        faqs: [
          {
            question: "Bilakah saya patut mula menuntut invois tertunggak di Malaysia?",
            answer:
              "Mulakan serta-merta, dengan peringatan sopan sekitar tarikh matang dan susulan pada hari berikutnya. Hutang lazimnya menjadi lebih sukar dikutip semakin lama usianya, dan rutin peringatan yang konsisten menandakan bahawa terma pembayaran dipandang serius.",
          },
          {
            question: "Bolehkah saya mengenakan faedah atau yuran lewat ke atas invois tertunggak?",
            answer:
              "Amnya hanya jika pelanggan bersetuju terlebih dahulu, jadi letakkan yuran lewat atau kadar faedah dalam terma bertulis dan invois anda. Pastikan ia munasabah, kerana mahkamah mungkin memandang negatif terhadap penalti yang keterlaluan.",
          },
          {
            question: "Apakah surat tuntutan dan adakah saya memerlukannya?",
            answer:
              "Surat tuntutan ialah notis bertulis rasmi bahawa hutang itu terhutang dan bahawa anda akan memulakan tindakan undang-undang jika ia tidak dibayar menjelang tarikh yang dinyatakan. Untuk tuntutan invois biasa ia lazimnya bukan keperluan undang-undang yang ketat, tetapi ia amalan standard dan selalunya mendorong pembayaran.",
          },
          {
            question: "Apakah yang perlu ada dalam surat tuntutan?",
            answer:
              "Nama penuh pihak-pihak, nombor invois, tarikh, dan jumlah tepat, asas hutang, tarikh akhir yang tegas (lazimnya tujuh hingga empat belas hari), akibat tidak membayar, dan salinan dokumen sokongan. Hantar melalui kaedah yang boleh anda buktikan, seperti pos berdaftar dan e-mel.",
          },
          {
            question: "Bolehkah saya menggunakan Tribunal Tuntutan Pengguna untuk menuntut invois perniagaan?",
            answer:
              "Amnya tidak. Tribunal itu mengendalikan tuntutan yang dibawa oleh pengguna terhadap peniaga bagi barangan dan perkhidmatan yang dibeli untuk kegunaan peribadi. Perniagaan yang menuntut invois komersial yang tidak dibayar lazimnya melihat tuntutan kecil atau tindakan sivil di Mahkamah Majistret atau Mahkamah Sesyen.",
          },
          {
            question: "Adakah terdapat prosedur tuntutan kecil untuk invois yang tidak dibayar?",
            answer:
              "Malaysia mempunyai prosedur tuntutan kecil yang dipermudahkan di Mahkamah Majistret untuk tuntutan bernilai rendah, sering disebut sekitar RM5,000, tetapi had dan peraturan kelayakan telah disemak, jadi sahkan had semasa dan sama ada syarikat boleh menggunakannya sebelum memfailkan.",
          },
          {
            question: "Berapa lama saya mempunyai masa untuk menyaman hutang yang tidak dibayar?",
            answer:
              "Di bawah Akta Had Masa 1953, tuntutan yang berasaskan kontrak amnya terhalang selepas enam tahun dari tarikh sebab tindakan bermula, biasanya apabila bayaran menjadi matang dan terlepas. Pengakuan atau bayaran separa boleh menjejaskan jam itu, dan terdapat pengecualian, jadi dapatkan nasihat untuk hutang yang lebih lama.",
          },
          {
            question: "Bagaimana saya boleh menghalang pelanggan membayar lewat sejak awal lagi?",
            answer:
              "Letakkan terma bertulis yang jelas dan tarikh matang pada setiap sebut harga dan invois, setujui terma bayaran lewat lebih awal, semak pelanggan baharu dan pertimbangkan deposit untuk akaun besar atau baharu, keluarkan invois pada hari penghantaran, dan jalankan rutin peringatan yang konsisten.",
          },
        ],
      },
    },
  },
  {
    slug: "contracts-and-terms-for-small-businesses-in-malaysia",
    title: "Writing Contracts and Terms and Conditions for Your Small Business in Malaysia",
    seoTitle: "Contracts and Terms for Small Businesses in Malaysia",
    seoDescription:
      "How Malaysian SMEs can write contracts and terms: key clauses, how contracts are formed, e-signatures, stamp duty, and when to use a lawyer.",
    coverImage: {
      file: "contracts-and-terms-for-small-businesses-in-malaysia-cover.webp",
      mimeType: "image/webp",
      alt: "A man in glasses and a blazer signing a document on a clipboard at a desk beside large windows",
      altTranslations: {
        zh: "一位戴眼镜、身穿西装外套的男士在靠近大窗户的桌前，在写字板上的文件上签名",
        ms: "Seorang lelaki berkaca mata dan berjaket menandatangani dokumen pada papan klip di meja berhampiran tingkap besar",
      },
    },
    contentImages: {
      "signing-form": {
        file: "contracts-and-terms-for-small-businesses-in-malaysia-signing.webp",
        mimeType: "image/webp",
        alt: "Close-up of a hand signing a printed form with a blue pen at a white table",
        altTranslations: {
          zh: "在白色桌面上用蓝色笔在打印表格上签名的手部特写",
          ms: "Gambar dekat tangan menandatangani borang bercetak dengan pen biru di meja putih",
        },
        after: "Put your standard terms in writing before the first customer signs, not after the first dispute.",
        afterTranslations: {
          zh: "请在第一位客户签约之前就把您的标准条款写下来，而不是等到第一次纠纷之后。",
          ms: "Tulis terma standard anda sebelum pelanggan pertama menandatangani, bukan selepas pertikaian pertama.",
        },
      },
    },
    excerpt:
      "Most small business disputes are not about the law, they are about what was never written down. This guide explains how contracts work in Malaysia, which clauses every small business should cover, how to write customer terms and supplier agreements, when electronic signatures and stamp duty matter, and when to pay for a lawyer's review.",
    body: `Most small business disagreements start the same way: one side remembers the deal one way, the other remembers it differently, and there is nothing in writing to settle it. A short, clear contract does not make you look distrustful. It protects both sides, shortens arguments, and often decides whether a late payment, a faulty delivery, or a departing partner becomes a manageable problem or a lawsuit.

This is general information, not legal advice. Contract law, consumer protection rules, and stamp duty requirements are specific to the type of agreement and change from time to time, so confirm the position with a Malaysian lawyer, especially for high-value or unusual deals, before you rely on any template or checklist.

## 1. Understand how a contract is formed

### The basic ingredients
Under Malaysia's Contracts Act 1950, an agreement generally becomes an enforceable contract when there is an offer and an acceptance, something of value exchanged, parties who are legally capable of contracting, free consent, and a lawful purpose. A quotation that the customer accepts can already be a contract, even without a formal document.

### Verbal contracts are valid but hard to prove
Many contracts do not need to be in writing to be binding, but if the other side disputes what was agreed, you have to prove it. Some types of agreement, such as certain guarantees and dealings in land, have special requirements, so ask a lawyer before relying on a handshake for anything significant.

### Emails and messages count
Written offers and acceptances by email or messaging apps can form part of the agreement. Treat them seriously, confirm key points in writing, and keep them.

## 2. Know the documents a small business typically needs

### Customer terms and conditions
Standard terms for selling goods or services that apply to every customer, covering price, payment, delivery, returns, warranty, and liability.

### Service or project agreement
For custom work, such as design, construction, consulting, or software, a signed agreement that defines the scope, timeline, deliverables, price, and what happens if the scope changes.

### Supplier and subcontractor agreements
These set out what you will buy, at what price, with what quality standards, delivery times, and consequences for failure.

### Employment contracts
Staff need written terms too. Our guide on hiring your first employee covers the basics, and the guides on employee leave and terminating an employee cover the rules you must respect.

### Partnership or shareholders' agreement
If more than one person owns the business, record who contributes what, who decides, how profits are shared, and what happens when someone leaves or the partners disagree. This agreement is often the most valuable and the most neglected.

### Non-disclosure agreements
When you share confidential information with a partner, supplier, or contractor, an NDA sets out what must stay private and for how long.

## 3. Cover the clauses that matter

Every contract is different, but these clauses decide most disputes.

### Parties and scope
Name the parties exactly, using their full legal names and registration numbers, and describe precisely what is being sold or done. Vague scope is the leading cause of disputes in service contracts.

### Price and payment
State the total price or rate, what is included, the taxes that apply, the due date, accepted payment methods, and any deposit or milestone payments. Our guide on collecting late payments explains how to build a late-payment clause and chase invoices.

### Delivery and acceptance
Say when and where goods or services will be delivered, how the customer will confirm acceptance, and what happens if they do not respond.

### Warranties and defects
Be clear about what you promise, for how long, and how problems are reported and fixed. Do not promise more than you can deliver.

### Limiting liability
Many businesses cap their liability, such as to the contract price. The law limits how far you can exclude responsibility, particularly for consumers and for terms that are unreasonable, so keep such clauses reasonable and have a lawyer review them.

### Termination
State how either side can end the contract, the notice period, and what happens to payments and work in progress when it does.

### Intellectual property and confidentiality
Say who owns the work product, what the customer can use it for, and what information must stay confidential. If you are building a brand, see our guide on trademark registration.

### Dispute resolution and governing law
Choose Malaysian law, say where disputes will be handled, and consider requiring a step such as negotiation or mediation before court. Some businesses choose arbitration, which has its own costs and rules.

> Put the contract in plain language. A clause that nobody can understand is one a court may read against the person who wrote it, and a customer who understands your terms is far less likely to dispute them later.

## 4. Write customer terms the right way

### Get your terms in front of the customer

Put your standard terms in writing before the first customer signs, not after the first dispute. Terms only bind a customer if they were reasonably brought to their attention before the deal was made. Include them on quotations, order forms, invoices, and your website checkout, and make sure the customer actually has to accept them.

### Be fair in consumer deals
Where you sell to consumers on standard-form terms, the Consumer Protection Act 1999 has rules on unfair contract terms, so avoid one-sided clauses such as excluding all responsibility or letting you change the price at will. Our guide on selling online covers the other rules that apply to online sellers.

### Penalty and late-fee clauses
A clause that fixes a payment on breach may be reduced by a court if it is excessive compared with the real loss, so set late fees and cancellation charges at reasonable levels.

### Keep it short and current
A two-page set of clear terms that you actually use is better than a ten-page one nobody reads. Review them every year or when your business changes.

## 5. Sign and store contracts properly

### Who should sign
Make sure the person signing has the authority to bind their business. For a company, this is usually a director or an authorised signatory, and you should check their position, not only their word.

### Electronic signatures
Electronic contracts and signatures are generally recognised under Malaysian law, but the rules and the level of evidence differ by the type of document and the signature method. For high-value or sensitive contracts, ask your lawyer whether a particular e-signature tool is suitable.

### Initial every page and date it
For printed contracts, initial each page, date the signing, and make sure each party keeps a complete signed copy. Attach any schedules, quotations, or drawings the contract refers to.

### Keep your copies safely
Store signed contracts in a secure place with a back-up, in an order that you can find quickly. Contract records are also business records that your accountant and, for tax purposes, the authorities may ask to see, as explained in our bookkeeping guide.

## 6. Know when stamp duty and a lawyer matter

### Stamp duty
Some documents must be stamped, such as tenancy agreements, and an unstamped document can be difficult to use in court. Many ordinary commercial contracts are not subject to a standard duty, but the rules depend on the type of document, so check with a lawyer or the Inland Revenue Board. Our guide on renting commercial premises explains stamp duty on leases.

### When to use a lawyer
Get a lawyer to draft or review contracts that involve large sums, long terms, exclusivity, intellectual property, shareholder arrangements, guarantees, or land. A lawyer's fee is small compared with the cost of a bad clause.

### How to get value from a lawyer
Bring a clear summary of the deal, any drafts you already have, and a list of your biggest worries. Ask for a template that you can reuse for routine deals, so you are not paying for the same review every time.

### Do not copy blindly
Free templates can be a useful starting point, but a template from another country or industry may not fit Malaysian law or your business. Adapt it, and have it checked.

If you are looking for a lawyer, an accountant, or a business adviser, you can [browse the directory](/en) for local professionals, and [creating a free business listing](/en/signup) helps new clients and suppliers find and verify your business before they sign with you.

## Common mistakes Malaysian SMEs make with contracts

- **Relying on a handshake.** Verbal deals are hard to prove, and memories diverge fast once money is involved.
- **Leaving out the scope or the payment terms.** Vague scope and unclear due dates are behind most disputes.
- **Copying a template without adapting it.** An unsuitable template can be unenforceable, or can promise things you never intended.

## Where to start

- **This week:** List the types of deals you make most often, and check which have written terms and which do not.
- **Next:** Draft a short set of customer terms and a basic service agreement covering scope, price, payment, delivery, warranty, liability, and termination.
- **Then:** Have a lawyer review them, and ask for a reusable template.
- **From now on:** Use them on every quotation, invoice, and online checkout, store signed copies safely, and review the terms once a year.

A good contract is not about expecting the worst from people, it is about making sure everyone remembers the deal the same way.`,
    faqs: [
      {
        question: "Is a verbal agreement legally binding in Malaysia?",
        answer:
          "Many contracts do not need to be in writing to be binding, but if the other side disputes what was agreed, you have to prove it. Some types of agreement have special requirements, so put important deals in writing and ask a lawyer about anything significant.",
      },
      {
        question: "What makes a contract valid in Malaysia?",
        answer:
          "Under the Contracts Act 1950, an agreement generally needs an offer and acceptance, something of value exchanged, parties capable of contracting, free consent, and a lawful purpose. A quotation that the customer accepts can already form a contract.",
      },
      {
        question: "What should a small business's terms and conditions include?",
        answer:
          "Price, payment terms and due date, delivery, acceptance, warranties and returns, limits on liability, termination, confidentiality, and governing law and dispute resolution. Keep them clear, fair, and in plain language.",
      },
      {
        question: "Are electronic signatures valid in Malaysia?",
        answer:
          "Electronic contracts and signatures are generally recognised, but the rules and the evidence needed vary by the type of document and the signature method. For high-value or sensitive contracts, ask a lawyer whether your e-signature tool is suitable.",
      },
      {
        question: "Can I limit my liability in a contract?",
        answer:
          "Often yes, such as by capping it at the contract price, but the law restricts how far you can exclude responsibility, especially for consumers and unreasonable terms. Keep limits reasonable and have a lawyer review them.",
      },
      {
        question: "Do contracts need to be stamped?",
        answer:
          "Some documents, such as tenancy agreements, generally must be stamped, and an unstamped document can be hard to use in court. Many ordinary commercial contracts are not subject to a standard duty, but it depends on the type of document, so check with a lawyer or the Inland Revenue Board.",
      },
      {
        question: "Can I charge a fixed penalty for late payment or cancellation?",
        answer:
          "You can agree late-payment or cancellation charges, but a court may reduce a sum that is excessive compared with the real loss. Keep such charges reasonable and state them clearly in your terms.",
      },
      {
        question: "When should I hire a lawyer to review a contract?",
        answer:
          "For large sums, long terms, exclusivity, intellectual property, shareholder arrangements, guarantees, or land. Ask for a reusable template for your routine deals so you do not pay for the same review every time.",
      },
    ],
    translations: {
      zh: {
        title: "为您的马来西亚小企业撰写合约及条款与条件",
        excerpt:
          "大多数小企业纠纷与法律无关，而是源于从未写下来的事项。本指南说明合约在马来西亚如何运作、每家小企业都应涵盖哪些条款、如何撰写客户条款和供应商协议、电子签名和印花税何时重要，以及何时值得花钱请律师审阅。",
        body: `大多数小企业的分歧都以同样的方式开始：一方记得交易是这样，另一方记得是那样，而没有任何书面文件可以裁决。一份简短、清晰的合约并不会让您显得不信任对方。它保护双方、缩短争论，并往往决定一次逾期付款、一次有问题的交货或一位离开的合伙人，会成为可处理的问题还是一场官司。

以下仅为一般资讯，并非法律意见。合约法、消费者保护规定和印花税要求，因协议类型而异，也会不时变动，所以在依赖任何模板或清单之前，请向马来西亚律师确认，尤其是高价值或特殊的交易。

## 1. 了解合约如何成立

### 基本要素
根据马来西亚《1950年合约法令》，协议一般在有要约和承诺、有价值的交换、各方具有订约的法律能力、自由同意以及合法目的时，成为可执行的合约。客户接受的一份报价单，即使没有正式文件，也可能已经是合约。

### 口头合约有效但难以证明
许多合约不必以书面形式才有约束力，但如果对方对所议定的内容有争议，您就必须证明。某些类型的协议，例如某些担保和土地交易，有特殊要求，所以在对任何重大事项依赖口头约定之前，请先咨询律师。

### 电邮和讯息也算数
通过电邮或通讯应用程序发出的书面要约和承诺，可以构成协议的一部分。请认真对待，以书面确认关键要点，并保存下来。

## 2. 了解小企业通常需要的文件

### 客户条款与条件
适用于每一位客户的、销售商品或服务的标准条款，涵盖价格、付款、交货、退货、保修和责任。

### 服务或项目协议
对于定制工作，例如设计、建筑、咨询或软件，一份已签署的协议，界定范围、时间表、交付成果、价格，以及范围变更时会怎样。

### 供应商与分包商协议
这些协议列明您将购买什么、价格、质量标准、交货时间，以及未能履行的后果。

### 雇佣合约
员工也需要书面条款。我们关于雇用第一位员工的指南涵盖了基础知识，而关于员工休假和终止员工雇佣的指南，则涵盖了您必须遵守的规则。

### 合伙或股东协议
如果企业有多于一位拥有人，请记录谁出什么、谁做决定、利润如何分配，以及有人离开或合伙人意见不合时会怎样。这份协议往往最有价值，也最常被忽视。

### 保密协议
当您与合作伙伴、供应商或承包商分享机密资料时，保密协议会列明什么必须保密以及保密多久。

## 3. 涵盖重要的条款

每份合约都不同，但这些条款决定了大多数纠纷。

### 各方与范围
准确写出各方，使用其完整的法定名称和注册号码，并精确描述所销售或所做的事项。含糊的范围是服务合约纠纷的首要原因。

### 价格与付款
说明总价或费率、包含什么、适用的税项、到期日、接受的付款方式，以及任何订金或阶段付款。我们关于追收逾期货款的指南，说明了如何建立逾期付款条款和追收发票。

### 交付与验收
说明商品或服务将于何时何地交付、客户如何确认验收，以及他们没有回应时会怎样。

### 保证与瑕疵
清楚说明您承诺什么、多长时间，以及如何报告和修复问题。不要承诺超出您能交付的范围。

### 限制责任
许多企业会限制自己的责任，例如以合约价格为上限。法律限制您能在多大程度上免除责任，特别是对消费者和不合理的条款，所以请保持这类条款合理，并请律师审阅。

### 终止
说明任何一方如何结束合约、通知期，以及终止时付款和进行中的工作会怎样。

### 知识产权与保密
说明工作成果归谁所有、客户可以用它做什么，以及哪些资料必须保密。如果您在建立品牌，请参阅我们关于商标注册的指南。

### 争议解决与适用法律
选择马来西亚法律，说明争议将在哪里处理，并考虑要求在诉讼之前先进行谈判或调解等步骤。有些企业选择仲裁，它有自己的费用和规则。

> 请用平实的语言撰写合约。没有人看得懂的条款，法庭可能会作出对撰写者不利的解读，而理解您条款的客户，日后争议的可能性要小得多。

## 4. 以正确的方式撰写客户条款

### 让客户看到您的条款

请在第一位客户签约之前就把您的标准条款写下来，而不是等到第一次纠纷之后。条款只有在交易达成之前已合理地引起客户注意时，才对客户有约束力。请把它们放在报价单、订单、发票和您的网站结账页面上，并确保客户确实必须接受它们。

### 对消费者交易要公平
当您以标准格式条款向消费者销售时，《1999年消费者保护法令》对不公平合约条款有规定，所以请避免片面的条款，例如免除一切责任或让您可以随意更改价格。我们关于网上销售的指南涵盖了适用于网络卖家的其他规则。

### 罚款与滞纳金条款
如果一项在违约时固定支付金额的条款，与实际损失相比过高，法庭可能会予以减少，所以请把滞纳金和取消费用定在合理的水平。

### 保持简短并与时俱进
一份您确实会使用的两页清晰条款，胜过没有人读的十页条款。请每年或在您的业务变化时检讨一次。

## 5. 妥善签署并保存合约

### 谁应该签署
确保签署的人有权约束其企业。对公司来说，通常是董事或授权签署人，您应该查核他们的职位，而不只是听他们说。

### 电子签名
电子合约和签名在马来西亚法律下一般获得承认，但规则和证据水平因文件类型和签名方法而异。对于高价值或敏感的合约，请询问您的律师某个电子签名工具是否合适。

### 每页签名缩写并注明日期
对于打印的合约，请在每一页签名缩写、注明签署日期，并确保各方都保留一份完整的已签署副本。附上合约所提到的任何附表、报价单或图纸。

### 妥善保管您的副本
把已签署的合约存放在安全、有备份的地方，并整理成您能快速找到的顺序。合约记录也是商业记录，您的会计师以及，就税务而言，主管机构可能会要求查看，正如我们的簿记指南所说明的。

## 6. 知道印花税与律师何时重要

### 印花税
某些文件必须盖印花税，例如租赁协议，而未盖印的文件在法庭上可能难以使用。许多一般的商业合约并不适用标准税款，但规则取决于文件类型，所以请向律师或内陆税收局查核。我们关于租用商业场所的指南说明了租约的印花税。

### 何时使用律师
涉及大额款项、长期限、独家、知识产权、股东安排、担保或土地的合约，请律师起草或审阅。律师费与一个糟糕条款的代价相比微不足道。

### 如何从律师那里获得价值
带上清晰的交易摘要、您已有的任何草稿，以及您最担心的事项清单。请他们提供一份可重复使用的模板，用于日常交易，这样您就不必每次都为同样的审阅付费。

### 不要盲目照抄
免费模板可以作为有用的起点，但来自其他国家或行业的模板，可能不符合马来西亚法律或您的业务。请加以调整，并请人检查。

如果您在寻找律师、会计师或商业顾问，可以[浏览名录](/zh)寻找本地专业人士，而[创建免费的企业列表](/zh/signup)可以帮助新客户和供应商在与您签约之前找到并核实您的企业。

## 马来西亚中小企业在合约上常犯的错误

- **依赖口头约定。** 口头交易难以证明，而一旦涉及金钱，记忆很快就会出现分歧。
- **遗漏范围或付款条款。** 含糊的范围和不清楚的到期日，是大多数纠纷的背后原因。
- **没有调整就照抄模板。** 不合适的模板可能无法执行，或承诺了您从未打算承诺的事。

## 从哪里开始

- **本周：**列出您最常做的交易类型，并查核哪些有书面条款、哪些没有。
- **接着：**起草一套简短的客户条款和基本的服务协议，涵盖范围、价格、付款、交货、保修、责任和终止。
- **然后：**请律师审阅，并要求一份可重复使用的模板。
- **从现在起：**在每一份报价单、发票和网上结账页面使用它们，妥善保存已签署的副本，并每年检讨一次条款。

好的合约并不是对人抱最坏的期待，而是确保每个人都以同样的方式记得这笔交易。`,
        faqs: [
          {
            question: "在马来西亚，口头协议具有法律约束力吗？",
            answer:
              "许多合约不必以书面形式才有约束力，但如果对方对所议定的内容有争议，您就必须证明。某些类型的协议有特殊要求，所以请把重要交易写成书面，并就任何重大事项咨询律师。",
          },
          {
            question: "在马来西亚，什么使合约有效？",
            answer:
              "根据《1950年合约法令》，协议一般需要有要约和承诺、有价值的交换、有订约能力的各方、自由同意以及合法目的。客户接受的一份报价单，可能已经构成合约。",
          },
          {
            question: "小企业的条款与条件应该包括什么？",
            answer:
              "价格、付款条款和到期日、交货、验收、保修和退货、责任限制、终止、保密，以及适用法律和争议解决。请保持清晰、公平，并使用平实的语言。",
          },
          {
            question: "电子签名在马来西亚有效吗？",
            answer:
              "电子合约和签名一般获得承认，但规则和所需证据因文件类型和签名方法而异。对于高价值或敏感的合约，请询问律师您的电子签名工具是否合适。",
          },
          {
            question: "我可以在合约中限制自己的责任吗？",
            answer:
              "通常可以，例如以合约价格为上限，但法律限制您能在多大程度上免除责任，特别是对消费者和不合理的条款。请保持限制合理，并请律师审阅。",
          },
          {
            question: "合约需要盖印花税吗？",
            answer:
              "某些文件，例如租赁协议，一般必须盖印花税，而未盖印的文件在法庭上可能难以使用。许多一般的商业合约并不适用标准税款，但取决于文件类型，所以请向律师或内陆税收局查核。",
          },
          {
            question: "我可以对逾期付款或取消收取固定罚款吗？",
            answer:
              "您可以约定逾期付款或取消费用，但如果金额与实际损失相比过高，法庭可能会予以减少。请保持这些费用合理，并在条款中清楚说明。",
          },
          {
            question: "何时应该请律师审阅合约？",
            answer:
              "涉及大额款项、长期限、独家、知识产权、股东安排、担保或土地时。请为您的日常交易要求一份可重复使用的模板，这样您就不必每次都为同样的审阅付费。",
          },
        ],
      },
      ms: {
        title: "Menulis Kontrak serta Terma dan Syarat untuk Perniagaan Kecil Anda di Malaysia",
        excerpt:
          "Kebanyakan pertikaian perniagaan kecil bukan tentang undang-undang, tetapi tentang apa yang tidak pernah ditulis. Panduan ini menerangkan cara kontrak berfungsi di Malaysia, klausa yang patut dirangkumi setiap perniagaan kecil, cara menulis terma pelanggan dan perjanjian pembekal, bila tandatangan elektronik dan duti setem penting, dan bila berbaloi membayar untuk semakan peguam.",
        body: `Kebanyakan perselisihan perniagaan kecil bermula dengan cara yang sama: satu pihak mengingati perjanjian dengan satu cara, pihak lain mengingatinya secara berbeza, dan tiada apa-apa bertulis untuk menyelesaikannya. Kontrak yang ringkas dan jelas tidak membuatkan anda kelihatan tidak mempercayai. Ia melindungi kedua-dua pihak, memendekkan pertengkaran, dan sering menentukan sama ada bayaran lewat, penghantaran yang rosak atau rakan kongsi yang keluar menjadi masalah yang boleh diurus atau satu tindakan mahkamah.

Ini ialah maklumat am, bukan nasihat guaman. Undang-undang kontrak, peraturan perlindungan pengguna dan keperluan duti setem bergantung pada jenis perjanjian dan berubah dari semasa ke semasa, jadi sahkan kedudukan dengan peguam Malaysia, terutamanya bagi perjanjian bernilai tinggi atau luar biasa, sebelum anda bergantung pada mana-mana templat atau senarai semak.

## 1. Fahami bagaimana kontrak terbentuk

### Bahan asas
Di bawah Akta Kontrak 1950 Malaysia, perjanjian amnya menjadi kontrak yang boleh dikuatkuasakan apabila terdapat tawaran dan penerimaan, sesuatu yang bernilai ditukar, pihak yang berkelayakan di sisi undang-undang untuk berkontrak, persetujuan bebas, dan tujuan yang sah. Sebut harga yang diterima pelanggan mungkin sudah menjadi kontrak, walaupun tanpa dokumen rasmi.

### Kontrak lisan sah tetapi sukar dibuktikan
Banyak kontrak tidak perlu bertulis untuk mengikat, tetapi jika pihak lain mempertikaikan apa yang dipersetujui, anda perlu membuktikannya. Sesetengah jenis perjanjian, seperti jaminan tertentu dan urusan tanah, mempunyai keperluan khas, jadi tanya peguam sebelum bergantung pada janji lisan untuk apa-apa yang penting.

### E-mel dan mesej juga dikira
Tawaran dan penerimaan bertulis melalui e-mel atau aplikasi pesanan boleh menjadi sebahagian daripada perjanjian. Ambil serius, sahkan perkara utama secara bertulis, dan simpannya.

## 2. Ketahui dokumen yang lazimnya diperlukan perniagaan kecil

### Terma dan syarat pelanggan
Terma standard untuk menjual barangan atau perkhidmatan yang terpakai kepada setiap pelanggan, meliputi harga, bayaran, penghantaran, pemulangan, waranti dan liabiliti.

### Perjanjian perkhidmatan atau projek
Bagi kerja khas, seperti reka bentuk, pembinaan, perundingan atau perisian, perjanjian bertandatangan yang menentukan skop, garis masa, hasil kerja, harga, dan apa yang berlaku jika skop berubah.

### Perjanjian pembekal dan subkontraktor
Ini menyatakan apa yang akan anda beli, pada harga berapa, dengan piawaian kualiti, masa penghantaran dan akibat kegagalan apa.

### Kontrak pekerjaan
Kakitangan juga memerlukan terma bertulis. Panduan kami tentang mengambil pekerja pertama merangkumi asasnya, dan panduan tentang cuti pekerja dan menamatkan perkhidmatan pekerja merangkumi peraturan yang mesti anda hormati.

### Perjanjian perkongsian atau pemegang saham
Jika lebih daripada seorang memiliki perniagaan, rekodkan siapa menyumbang apa, siapa membuat keputusan, bagaimana keuntungan dikongsi, dan apa yang berlaku apabila seseorang keluar atau rakan kongsi tidak bersetuju. Perjanjian ini sering paling bernilai dan paling diabaikan.

### Perjanjian kerahsiaan
Apabila anda berkongsi maklumat sulit dengan rakan kongsi, pembekal atau kontraktor, perjanjian kerahsiaan (NDA) menyatakan apa yang mesti kekal peribadi dan untuk berapa lama.

## 3. Rangkumi klausa yang penting

Setiap kontrak berbeza, tetapi klausa ini menentukan kebanyakan pertikaian.

### Pihak dan skop
Namakan pihak dengan tepat, menggunakan nama undang-undang penuh dan nombor pendaftaran mereka, dan terangkan dengan tepat apa yang dijual atau dilakukan. Skop yang kabur ialah punca utama pertikaian dalam kontrak perkhidmatan.

### Harga dan bayaran
Nyatakan jumlah harga atau kadar, apa yang termasuk, cukai yang terpakai, tarikh matang, kaedah bayaran yang diterima, dan sebarang deposit atau bayaran peringkat. Panduan kami tentang menuntut bayaran lewat menerangkan cara membina klausa bayaran lewat dan mengejar invois.

### Penghantaran dan penerimaan
Nyatakan bila dan di mana barangan atau perkhidmatan akan dihantar, bagaimana pelanggan akan mengesahkan penerimaan, dan apa yang berlaku jika mereka tidak menjawab.

### Waranti dan kecacatan
Jelas tentang apa yang anda janjikan, untuk berapa lama, dan bagaimana masalah dilaporkan dan dibaiki. Jangan menjanjikan lebih daripada yang boleh anda sampaikan.

### Menghadkan liabiliti
Banyak perniagaan menghadkan liabiliti mereka, seperti kepada harga kontrak. Undang-undang menghadkan setakat mana anda boleh mengecualikan tanggungjawab, terutamanya bagi pengguna dan terma yang tidak munasabah, jadi pastikan klausa sedemikian munasabah dan minta peguam menyemaknya.

### Penamatan
Nyatakan bagaimana mana-mana pihak boleh menamatkan kontrak, tempoh notis, dan apa yang berlaku kepada bayaran dan kerja dalam proses apabila ia ditamatkan.

### Harta intelek dan kerahsiaan
Nyatakan siapa memiliki hasil kerja, untuk apa pelanggan boleh menggunakannya, dan maklumat apa yang mesti dirahsiakan. Jika anda membina jenama, lihat panduan kami tentang pendaftaran tanda dagangan.

### Penyelesaian pertikaian dan undang-undang yang mentadbir
Pilih undang-undang Malaysia, nyatakan di mana pertikaian akan dikendalikan, dan pertimbangkan untuk menghendaki langkah seperti rundingan atau pengantaraan sebelum mahkamah. Sesetengah perniagaan memilih timbang tara, yang mempunyai kos dan peraturan tersendiri.

> Tulis kontrak dalam bahasa yang mudah. Klausa yang tiada siapa faham ialah klausa yang mungkin ditafsirkan oleh mahkamah terhadap orang yang menulisnya, dan pelanggan yang memahami terma anda jauh kurang berkemungkinan mempertikaikannya kemudian.

## 4. Tulis terma pelanggan dengan cara yang betul

### Bawa terma anda ke hadapan pelanggan

Tulis terma standard anda sebelum pelanggan pertama menandatangani, bukan selepas pertikaian pertama. Terma hanya mengikat pelanggan jika ia dibawa ke perhatian mereka secara munasabah sebelum perjanjian dibuat. Sertakan ia pada sebut harga, borang pesanan, invois dan pembayaran laman web anda, dan pastikan pelanggan sebenarnya perlu menerimanya.

### Bersikap adil dalam urusan pengguna
Apabila anda menjual kepada pengguna dengan terma borang standard, Akta Perlindungan Pengguna 1999 mempunyai peraturan tentang terma kontrak yang tidak adil, jadi elakkan klausa berat sebelah seperti mengecualikan semua tanggungjawab atau membenarkan anda mengubah harga sesuka hati. Panduan kami tentang berjual dalam talian merangkumi peraturan lain yang terpakai kepada penjual dalam talian.

### Klausa penalti dan yuran lewat
Klausa yang menetapkan bayaran apabila berlaku pelanggaran mungkin dikurangkan oleh mahkamah jika ia keterlaluan berbanding kerugian sebenar, jadi tetapkan yuran lewat dan caj pembatalan pada tahap yang munasabah.

### Pastikan ringkas dan terkini
Dua halaman terma yang jelas yang benar-benar anda gunakan lebih baik daripada sepuluh halaman yang tiada siapa baca. Semaknya setiap tahun atau apabila perniagaan anda berubah.

## 5. Tandatangan dan simpan kontrak dengan betul

### Siapa yang patut menandatangani
Pastikan orang yang menandatangani mempunyai kuasa untuk mengikat perniagaan mereka. Bagi syarikat, ini biasanya pengarah atau penandatangan yang diberi kuasa, dan anda patut menyemak jawatan mereka, bukan sekadar kata-kata mereka.

### Tandatangan elektronik
Kontrak dan tandatangan elektronik amnya diiktiraf di bawah undang-undang Malaysia, tetapi peraturan dan tahap bukti berbeza mengikut jenis dokumen dan kaedah tandatangan. Bagi kontrak bernilai tinggi atau sensitif, tanya peguam anda sama ada alat tandatangan elektronik tertentu sesuai.

### Parafkan setiap halaman dan nyatakan tarikh
Bagi kontrak bercetak, parafkan setiap halaman, nyatakan tarikh menandatangani, dan pastikan setiap pihak menyimpan salinan bertandatangan yang lengkap. Lampirkan sebarang jadual, sebut harga atau lukisan yang dirujuk oleh kontrak.

### Simpan salinan anda dengan selamat
Simpan kontrak bertandatangan di tempat selamat dengan sandaran, dalam susunan yang boleh anda cari dengan cepat. Rekod kontrak juga ialah rekod perniagaan yang mungkin diminta oleh akauntan anda dan, bagi tujuan cukai, pihak berkuasa, seperti yang diterangkan dalam panduan simpan kira kami.

## 6. Ketahui bila duti setem dan peguam penting

### Duti setem
Sesetengah dokumen mesti disetem, seperti perjanjian penyewaan, dan dokumen yang tidak disetem boleh sukar digunakan di mahkamah. Banyak kontrak komersial biasa tidak tertakluk kepada duti standard, tetapi peraturan bergantung pada jenis dokumen, jadi semak dengan peguam atau Lembaga Hasil Dalam Negeri. Panduan kami tentang menyewa premis komersial menerangkan duti setem ke atas sewa.

### Bila hendak menggunakan peguam
Minta peguam menggubal atau menyemak kontrak yang melibatkan jumlah besar, tempoh panjang, eksklusiviti, harta intelek, aturan pemegang saham, jaminan atau tanah. Yuran peguam adalah kecil berbanding kos klausa yang buruk.

### Cara mendapat nilai daripada peguam
Bawa ringkasan jelas perjanjian, sebarang draf yang sudah ada, dan senarai kebimbangan terbesar anda. Minta templat yang boleh anda gunakan semula untuk urusan rutin, supaya anda tidak membayar untuk semakan yang sama setiap kali.

### Jangan salin secara membuta tuli
Templat percuma boleh menjadi titik permulaan yang berguna, tetapi templat dari negara atau industri lain mungkin tidak sesuai dengan undang-undang Malaysia atau perniagaan anda. Sesuaikannya, dan minta ia disemak.

Jika anda mencari peguam, akauntan atau penasihat perniagaan, anda boleh [menyemak imbas direktori](/ms) untuk profesional tempatan, dan [membuat penyenaraian perniagaan percuma](/ms/signup) membantu pelanggan dan pembekal baharu menemui serta mengesahkan perniagaan anda sebelum mereka menandatangani dengan anda.

## Kesilapan lazim PKS Malaysia dengan kontrak

- **Bergantung pada janji lisan.** Perjanjian lisan sukar dibuktikan, dan ingatan cepat berbeza apabila wang terlibat.
- **Meninggalkan skop atau terma bayaran.** Skop yang kabur dan tarikh matang yang tidak jelas ialah punca kebanyakan pertikaian.
- **Menyalin templat tanpa menyesuaikannya.** Templat yang tidak sesuai boleh tidak dapat dikuatkuasakan, atau menjanjikan perkara yang tidak pernah anda niatkan.

## Di mana hendak bermula

- **Minggu ini:** Senaraikan jenis urusan yang paling kerap anda buat, dan semak yang mana ada terma bertulis dan yang mana tiada.
- **Seterusnya:** Draf set ringkas terma pelanggan dan perjanjian perkhidmatan asas yang merangkumi skop, harga, bayaran, penghantaran, waranti, liabiliti dan penamatan.
- **Kemudian:** Minta peguam menyemaknya, dan minta templat yang boleh digunakan semula.
- **Mulai sekarang:** Gunakannya pada setiap sebut harga, invois dan pembayaran dalam talian, simpan salinan bertandatangan dengan selamat, dan semak terma setahun sekali.

Kontrak yang baik bukan tentang menjangka yang terburuk daripada orang, tetapi tentang memastikan semua orang mengingati perjanjian itu dengan cara yang sama.`,
        faqs: [
          {
            question: "Adakah perjanjian lisan mengikat di sisi undang-undang di Malaysia?",
            answer:
              "Banyak kontrak tidak perlu bertulis untuk mengikat, tetapi jika pihak lain mempertikaikan apa yang dipersetujui, anda perlu membuktikannya. Sesetengah jenis perjanjian mempunyai keperluan khas, jadi tulis urusan penting dan tanya peguam tentang apa-apa yang penting.",
          },
          {
            question: "Apakah yang menjadikan kontrak sah di Malaysia?",
            answer:
              "Di bawah Akta Kontrak 1950, perjanjian amnya memerlukan tawaran dan penerimaan, sesuatu yang bernilai ditukar, pihak yang berkelayakan berkontrak, persetujuan bebas, dan tujuan yang sah. Sebut harga yang diterima pelanggan mungkin sudah membentuk kontrak.",
          },
          {
            question: "Apakah yang patut disertakan dalam terma dan syarat perniagaan kecil?",
            answer:
              "Harga, terma bayaran dan tarikh matang, penghantaran, penerimaan, waranti dan pemulangan, had liabiliti, penamatan, kerahsiaan, serta undang-undang yang mentadbir dan penyelesaian pertikaian. Pastikan ia jelas, adil dan dalam bahasa yang mudah.",
          },
          {
            question: "Adakah tandatangan elektronik sah di Malaysia?",
            answer:
              "Kontrak dan tandatangan elektronik amnya diiktiraf, tetapi peraturan dan bukti yang diperlukan berbeza mengikut jenis dokumen dan kaedah tandatangan. Bagi kontrak bernilai tinggi atau sensitif, tanya peguam sama ada alat tandatangan elektronik anda sesuai.",
          },
          {
            question: "Bolehkah saya menghadkan liabiliti saya dalam kontrak?",
            answer:
              "Selalunya boleh, seperti menghadkannya kepada harga kontrak, tetapi undang-undang menyekat setakat mana anda boleh mengecualikan tanggungjawab, terutamanya bagi pengguna dan terma yang tidak munasabah. Pastikan had munasabah dan minta peguam menyemaknya.",
          },
          {
            question: "Adakah kontrak perlu disetem?",
            answer:
              "Sesetengah dokumen, seperti perjanjian penyewaan, amnya mesti disetem, dan dokumen yang tidak disetem boleh sukar digunakan di mahkamah. Banyak kontrak komersial biasa tidak tertakluk kepada duti standard, tetapi bergantung pada jenis dokumen, jadi semak dengan peguam atau Lembaga Hasil Dalam Negeri.",
          },
          {
            question: "Bolehkah saya mengenakan penalti tetap untuk bayaran lewat atau pembatalan?",
            answer:
              "Anda boleh bersetuju tentang caj bayaran lewat atau pembatalan, tetapi mahkamah mungkin mengurangkan jumlah yang keterlaluan berbanding kerugian sebenar. Pastikan caj itu munasabah dan nyatakannya dengan jelas dalam terma anda.",
          },
          {
            question: "Bilakah saya patut mengupah peguam untuk menyemak kontrak?",
            answer:
              "Untuk jumlah besar, tempoh panjang, eksklusiviti, harta intelek, aturan pemegang saham, jaminan atau tanah. Minta templat yang boleh digunakan semula untuk urusan rutin anda supaya anda tidak membayar untuk semakan yang sama setiap kali.",
          },
        ],
      },
    },
  },
  {
    slug: "tax-deductions-and-incentives-for-malaysian-smes",
    title: "Tax Deductions and Incentives for Malaysian SMEs: What You Can Claim",
    seoTitle: "Tax Deductions and Incentives for Malaysian SMEs",
    seoDescription:
      "What Malaysian SMEs can generally deduct: allowable expenses, capital allowances, staff costs, SME tax rates, incentives, and the records to keep.",
    coverImage: {
      file: "tax-deductions-and-incentives-for-malaysian-smes-cover.webp",
      mimeType: "image/webp",
      alt: "A smiling woman at a sunny desk holding a pen over a calculator and notebook, with a laptop beside her",
      altTranslations: {
        zh: "一位微笑的女士坐在阳光明媚的书桌前，手持笔放在计算器和笔记本上，旁边是笔记本电脑",
        ms: "Seorang wanita tersenyum di meja yang cerah memegang pen di atas kalkulator dan buku nota, dengan komputer riba di sebelahnya",
      },
    },
    contentImages: {
      "claims-desk": {
        file: "tax-deductions-and-incentives-for-malaysian-smes-claims.webp",
        mimeType: "image/webp",
        alt: "A woman in a blazer writing in a notebook at her desk beside a laptop with a sticky note",
        altTranslations: {
          zh: "一位身穿西装外套的女士在书桌前的笔记本上书写，旁边是贴着便利贴的笔记本电脑",
          ms: "Seorang wanita berjaket menulis dalam buku nota di mejanya di sebelah komputer riba yang ditampal nota lekat",
        },
        after: "Keep a claim file for every deduction, because a deduction you cannot document is one LHDN can disallow.",
        afterTranslations: {
          zh: "请为每一项扣除保存一份申报文件，因为您无法提供凭证的扣除，LHDN 可以不予接受。",
          ms: "Simpan fail tuntutan bagi setiap potongan, kerana potongan yang tidak dapat anda dokumenkan ialah potongan yang boleh ditolak oleh LHDN.",
        },
      },
    },
    excerpt:
      "Paying the right amount of tax, not more and not less, depends on knowing what you can legitimately deduct. This guide explains the general rules on allowable and non-allowable expenses, capital allowances on equipment, staff and training costs, the SME tax rates and common incentives, and the records you need to support every claim.",
    body: `Many small business owners either overpay tax because they do not know what they can deduct, or underpay it because they claim things they should not and hope nobody checks. Both are expensive. The first costs you cash every year, and the second can bring back-tax, penalties, and a very unpleasant audit. The answer is to understand the principles, claim what you are entitled to, and keep proof.

This is general information, not tax advice. Tax rates, allowances, caps, and incentives are revised often, typically with each annual Budget, and they depend on your business structure and facts, so confirm the current position with the Inland Revenue Board (LHDN) or a qualified tax adviser before you rely on it.

## 1. Understand the basic principle of a deduction

### Taxable income is profit, not sales
Tax is calculated on your adjusted income, which starts from your business revenue and subtracts the expenses the tax law allows. The more legitimate deductions you identify, the lower the profit you are taxed on.

### The key test
In general, an expense is deductible if it was incurred wholly and exclusively in producing your business income, and it is not capital in nature or specifically prohibited by the law. The wording and exceptions are detailed, so treat this as the rule of thumb, not the full test.

### Your structure matters
A company is taxed as a separate entity, while a sole proprietor or partnership pays tax on business profits through the owners' personal tax returns. Some reliefs and rates apply only to one or the other, so check which framework applies to you.

## 2. Know the common allowable expenses

These are the expenses that businesses most often claim, subject to the conditions above.

### Operating costs
Rent for business premises, utilities, telephone and internet used for business, repairs and maintenance, stationery, software subscriptions, and similar day-to-day costs.

### Cost of goods and direct costs
The cost of stock, raw materials, and direct labour that go into what you sell.

### Marketing and advertising
Online and offline advertising, website running costs, and promotional material generally qualify, though some one-off or capital-type items, such as building a large asset, may be treated differently.

### Professional fees
Accounting, audit, legal fees for ordinary business matters, and company secretarial fees are often deductible, while some fees linked to capital items, such as buying property, may not be.

### Interest and finance costs
Interest on money borrowed for business purposes can often be deducted, subject to the rules, while interest on personal borrowing cannot.

### Bad debts
A debt that you have specifically identified as bad or doubtful may be deductible if it meets the conditions, which is another reason to keep strong records of how you chased it. See our guide on collecting late payments.

## 3. Know what you generally cannot deduct

### Private and domestic expenses
Personal spending, family costs, and anything unrelated to earning business income are not deductible, which is why mixing personal and business money is so costly. See our guide on bookkeeping basics.

### Capital expenditure
Buying equipment, vehicles, and property is generally not deducted in full as an expense. Instead, it may qualify for capital allowances, as explained below.

### Fines and penalties
Penalties and compounds imposed for breaking the law are generally not deductible, which includes late-filing and late-payment penalties.

### Restricted items
Some categories are partly or fully restricted, such as certain entertainment costs, expenses on some types of private vehicles, and gifts. The limits are specific and change, so confirm them before you claim.

### Income tax itself
Income tax paid is not an expense for tax purposes.

## 4. Claim capital allowances on equipment

### What they are
Because you cannot deduct the cost of equipment in one go, the law lets you claim capital allowances, which are tax relief spread over time, on qualifying assets such as machinery, equipment, computers, and some vehicles.

### How they work
Allowances are typically made up of an initial allowance in the first year and annual allowances after that, at rates that depend on the type of asset. The rates and conditions are set in the tax legislation and are reviewed from time to time.

### Small-value assets
There is a more generous treatment for low-value assets, which can be written off faster, with limits per item and per year that differ for SMEs and other businesses. Confirm the current thresholds before buying.

### Keep an asset register
List each asset with its date, cost, and supplier invoice. You need these details to work out allowances and to deal with any later sale or disposal.

### Be careful with cars
Cars used for business have specific limits on the cost on which you can claim allowances, and the treatment depends on the type of vehicle. Do not assume a luxury car is fully claimable.

## 5. Claim staff and training costs

### Salaries and benefits
Employee salaries, bonuses, and many staff benefits are deductible when they are for the business, along with the employer's statutory contributions such as EPF, SOCSO, and EIS, which are explained in our guide on hiring your first employee. The exact treatment of some benefits differs, so check the rules.

### Training
Training that improves your staff's skills for the business may be deductible, and there are schemes, such as through the Human Resource Development Corporation, that offer support or enhanced treatment in some cases. Check which programmes and conditions apply.

### Directors' and owners' pay
A company can deduct reasonable remuneration paid to directors, but a sole proprietor cannot deduct their own drawings as a salary, since the profit is already their income.

## 6. Know the SME tax rates and common incentives

### The SME corporate tax rate
Resident companies that meet the conditions for small and medium enterprises, which currently include limits on paid-up capital and gross business income and restrictions on foreign or large-company ownership, have been taxed at lower rates on the first slices of chargeable income than the standard corporate rate. The bands, rates, and conditions have been revised before, so confirm the current rates and your eligibility with LHDN.

### Incentives and schemes
Governments also offer incentives from time to time, such as allowances or enhanced deductions for specific activities, including some digitalisation costs. Our guide on SME grants and funding covers support beyond tax, and our guide on e-invoicing explains an obligation that has sometimes come with related incentives.

### Incentives change often
Many incentives are time-limited, require approval, or apply only to specific sectors, so do not plan around one until you have confirmed that it is still available and that you qualify.

### Do not chase a tax saving that wrecks the business
Spending money just to get a deduction still costs you most of that money. A deduction reduces the cost of a genuine expense, it does not make it free.

## 7. Keep the records that support every claim

> A deduction is only as good as the evidence behind it. If LHDN questions a claim and you cannot produce the invoice, the proof of payment, and a reason the expense was for the business, you should expect the deduction to be disallowed and a penalty to follow.

### What to keep
Keep invoices and receipts addressed to your business, proof of payment, contracts, asset records, payroll records, and a short note on the business reason for any unusual expense.

### How long
LHDN has long expected records to be kept for about seven years, but confirm the current requirement with LHDN or your accountant. Our bookkeeping guide explains what to keep and how to organise it.

### Claim file
Keep a claim file for every deduction, because a deduction you cannot document is one LHDN can disallow. A simple folder, physical or digital, for each year and each category is enough.

### Work with your accountant
Share your records early rather than at the filing deadline, ask what you may be missing, and make sure the figures in your tax return match your accounts.

If you want help from a tax adviser or accountant, you can [browse the directory](/en) for local professionals, and [creating a free business listing](/en/signup) helps new customers and partners find and verify your business.

## Common mistakes Malaysian SMEs make with tax deductions

- **Claiming personal expenses as business costs.** It is the most common reason for disallowed deductions and penalties.
- **Missing legitimate claims.** Owners who do not keep records often forget capital allowances, bad debts, and small recurring costs.
- **Relying on advice that is out of date.** Rates, caps, and incentives change with each Budget, so last year's rule may not apply.

## Where to start

- **This week:** Collect your invoices, receipts, and asset records for the year, and separate business from personal spending.
- **Next:** Set up an asset register and a claim folder for each category of expense.
- **Then:** Ask your accountant which allowances, rates, and incentives apply to you this year.
- **Every year:** Review your claims after each Budget announcement, and plan large purchases with the tax treatment in mind.

Tax planning for a small business is mostly good records and no surprises, and the owners who keep both pay the right amount, not a penny more.`,
    faqs: [
      {
        question: "What expenses can a Malaysian business generally deduct from its taxable income?",
        answer:
          "In general, expenses incurred wholly and exclusively in producing business income that are not capital in nature or specifically prohibited, such as rent, utilities, stock, marketing, professional fees, staff costs, and business-related interest. Confirm the detailed rules with LHDN or a tax adviser.",
      },
      {
        question: "Can I deduct personal expenses through my business?",
        answer:
          "No. Private and domestic expenses are not deductible, and claiming them is a common reason for disallowed deductions, back-tax, and penalties. Keep business and personal money separate.",
      },
      {
        question: "What are capital allowances?",
        answer:
          "Because the cost of equipment, vehicles, and similar assets is not deducted in one go, the law allows capital allowances, which spread tax relief over time on qualifying assets. Rates, small-value asset rules, and limits change, so check the current figures.",
      },
      {
        question: "Can I deduct the cost of a car I use for business?",
        answer:
          "Possibly, but there are specific limits on the cost on which allowances can be claimed, and the treatment depends on the type of vehicle and its use. Do not assume a luxury car is fully claimable, and confirm the rules before you buy.",
      },
      {
        question: "Are fines and penalties deductible?",
        answer:
          "Generally no. Penalties and compounds imposed for breaking the law, including late-filing or late-payment penalties, are not deductible.",
      },
      {
        question: "Is there a lower tax rate for SMEs in Malaysia?",
        answer:
          "Resident companies that meet the SME conditions, including limits on paid-up capital and gross business income and restrictions on foreign or large-company ownership, have been taxed at lower rates on the first slices of chargeable income. The bands and conditions change, so confirm the current rates with LHDN.",
      },
      {
        question: "Can a sole proprietor deduct their own salary?",
        answer:
          "No. A sole proprietor's drawings are not a deductible salary because the profit is already their income. A company can deduct reasonable remuneration paid to its directors.",
      },
      {
        question: "What records do I need to support a tax deduction?",
        answer:
          "Invoices and receipts addressed to your business, proof of payment, contracts, asset and payroll records, and a note on the business reason for unusual expenses. LHDN has long expected records to be kept for about seven years, but confirm the current requirement.",
      },
    ],
    translations: {
      zh: {
        title: "马来西亚中小企业的税务扣除与优惠：您可以申报什么",
        excerpt:
          "缴付正确的税额，不多也不少，取决于您知道可以合法扣除什么。本指南说明可扣除与不可扣除开支的一般规则、设备的资本免税额、员工和培训成本、中小企业税率和常见优惠，以及支持每一项申报所需的记录。",
        body: `许多小企业主要么因为不知道可以扣除什么而多缴税，要么因为申报了不该申报的项目并希望没有人检查而少缴税。两者都代价高昂。前者每年都让您损失现金，后者则可能带来补税、罚款和非常不愉快的审计。答案是了解原则，申报您有权申报的项目，并保存凭证。

以下仅为一般资讯，并非税务意见。税率、免税额、上限和优惠经常修订，通常随每年的财政预算案而变，并且取决于您的企业结构和具体情况，所以在依赖这些内容之前，请向内陆税收局（LHDN）或合格的税务顾问确认最新情况。

## 1. 了解扣除的基本原则

### 应税收入是利润，而不是销售额
税款是根据您的调整后收入计算的，它从您的营业收入开始，减去税法允许的开支。您找出的合法扣除越多，被课税的利润就越低。

### 关键的测试
一般而言，如果一项开支完全且专门为产生您的营业收入而发生，并且不属于资本性质，也不被法律明确禁止，它就是可扣除的。措辞和例外情况很详细，所以请把这当作经验法则，而不是完整的测试。

### 您的结构很重要
公司作为独立的实体被课税，而独资或合伙企业则通过业主的个人报税表就营业利润缴税。有些免税额和税率只适用于其中一种，所以请查核适用于您的是哪个框架。

## 2. 了解常见的可扣除开支

这些是企业最常申报的开支，须符合上述条件。

### 营运成本
营业场所的租金、水电、用于业务的电话和网络、维修和保养、文具、软件订阅，以及类似的日常成本。

### 销货成本和直接成本
进入您所销售商品的存货、原料和直接人工成本。

### 营销与广告
线上和线下广告、网站运作成本和宣传材料一般符合资格，不过某些一次性或资本性质的项目，例如建造大型资产，可能会被区别对待。

### 专业费用
会计、审计、一般业务事项的法律费用和公司秘书费用通常可扣除，而与资本项目有关的某些费用，例如购置物业，则可能不可扣除。

### 利息与融资成本
为业务目的所借款项的利息通常可以扣除，须符合规则，而个人借款的利息则不能。

### 坏账
您已明确认定为坏账或呆账的债务，如果符合条件，可能可以扣除，这也是您要保存追收过程的有力记录的另一个原因。请参阅我们关于追收逾期货款的指南。

## 3. 了解一般不可扣除的项目

### 私人和家庭开支
个人开销、家庭成本和任何与赚取营业收入无关的项目都不可扣除，这就是为什么公私资金混在一起代价如此高昂。请参阅我们关于簿记基础的指南。

### 资本支出
购买设备、车辆和物业一般不能作为开支全额扣除。相反，它们可能符合资本免税额，如下文所述。

### 罚款和罚金
因违法而被征收的罚款和罚单一般不可扣除，包括逾期递交和逾期缴付的罚款。

### 受限制的项目
有些类别被部分或完全限制，例如某些招待费用、某些类型私家车的开支，以及礼品。限制是具体的且会变动，所以在申报之前请先确认。

### 所得税本身
已缴付的所得税，就税务而言不属于开支。

## 4. 就设备申报资本免税额

### 它们是什么
由于您无法一次性扣除设备的成本，法律允许您就机器、设备、电脑和某些车辆等合格资产申报资本免税额，也就是分期给予的税务减免。

### 如何运作
免税额通常由第一年的初期免税额和之后的年度免税额组成，税率取决于资产的类型。税率和条件由税法规定，并不时检讨。

### 小额资产
对低价值资产有较宽松的处理，可以更快冲销，每件和每年的限额对中小企业与其他企业不同。购买之前，请确认现行的门槛。

### 保存资产登记册
列出每项资产的日期、成本和供应商发票。您需要这些资料来计算免税额，并处理日后任何出售或处置。

### 小心汽车
用于业务的汽车，其可申报免税额的成本有特定限制，处理方式取决于车辆类型。不要假设豪华汽车可以全额申报。

## 5. 申报员工和培训成本

### 薪水和福利
员工的薪水、花红和许多员工福利，在是为了业务时可以扣除，雇主的法定供款，例如 EPF、SOCSO 和 EIS 也一样，我们关于雇用第一位员工的指南有说明。某些福利的具体处理不同，所以请查核规则。

### 培训
提升员工业务技能的培训可能可以扣除，而且有一些计划，例如通过人力资源发展机构，在某些情况下提供支持或加强的处理。请查核适用的计划和条件。

### 董事和业主的薪酬
公司可以扣除支付给董事的合理酬金，但独资业主不能把自己的提款作为薪水扣除，因为利润本身就是其收入。

## 6. 了解中小企业税率和常见优惠

### 中小企业公司税率
符合中小企业条件的居民公司，目前的条件包括对实收资本和总营业收入的限制，以及对外资或大型公司持股的限制，在应税收入的头几个档次，被课以比标准公司税率更低的税率。这些档次、税率和条件以前曾被修订，所以请向 LHDN 确认现行税率及您的资格。

### 优惠和计划
政府也不时提供优惠，例如针对特定活动的免税额或加强扣除，包括某些数码化成本。我们关于中小企业补助与融资的指南涵盖税务之外的支持，而关于电子发票的指南则说明了一项有时附带相关优惠的义务。

### 优惠经常变动
许多优惠有时限、需要批准，或只适用于特定行业，所以在确认它仍然可用且您符合资格之前，不要围绕它做规划。

### 不要追求会拖垮业务的节税
仅仅为了得到扣除而花钱，仍然会让您花掉大部分的钱。扣除降低的是一项真实开支的成本，并不会让它变成免费。

## 7. 保存支持每一项申报的记录

> 扣除的可靠程度，取决于其背后的凭证。如果 LHDN 质疑某项申报，而您无法提供发票、付款证明，以及该开支是为了业务的理由，您应该预期扣除会被不予接受，并随后被罚款。

### 要保存什么
保存以您的企业为抬头的发票和收据、付款证明、合约、资产记录、薪资记录，以及对任何不寻常开支的业务理由的简短说明。

### 保存多久
LHDN 长期以来期望记录保存约七年，但请向 LHDN 或您的会计师确认现行要求。我们的簿记指南说明了要保存什么以及如何整理。

### 申报文件
请为每一项扣除保存一份申报文件，因为您无法提供凭证的扣除，LHDN 可以不予接受。每一年和每一个类别用一个简单的文件夹，纸本或数码的都可以。

### 与您的会计师合作
及早分享您的记录，而不是等到申报截止日，询问您可能遗漏了什么，并确保您报税表上的数字与您的账目相符。

如果您想得到税务顾问或会计师的协助，可以[浏览名录](/zh)寻找本地专业人士，而[创建免费的企业列表](/zh/signup)可以帮助新客户和合作伙伴找到并核实您的企业。

## 马来西亚中小企业在税务扣除上常犯的错误

- **把个人开支当作业务成本申报。** 这是扣除被不予接受和被罚款最常见的原因。
- **遗漏合法的申报。** 不保存记录的业主，常常忘记资本免税额、坏账和小额的经常性成本。
- **依赖过时的意见。** 税率、上限和优惠随每次财政预算案而变，所以去年的规定可能不再适用。

## 从哪里开始

- **本周：**收集您这一年的发票、收据和资产记录，并把公私开销分开。
- **接着：**建立资产登记册，并为每一类开支设一个申报文件夹。
- **然后：**询问您的会计师今年有哪些免税额、税率和优惠适用于您。
- **每年：**在每次财政预算案公布之后检讨您的申报，并在规划大额购买时考虑税务处理。

小企业的税务规划，大多是良好的记录和没有意外，而两者兼备的企业主，缴的税刚刚好，一分钱也不多。`,
        faqs: [
          {
            question: "马来西亚企业一般可以从应税收入中扣除哪些开支？",
            answer:
              "一般而言，是完全且专门为产生营业收入而发生、不属于资本性质也未被明确禁止的开支，例如租金、水电、存货、营销、专业费用、员工成本和与业务有关的利息。请向 LHDN 或税务顾问确认详细规则。",
          },
          {
            question: "我可以通过企业扣除个人开支吗？",
            answer:
              "不可以。私人和家庭开支不可扣除，申报它们是扣除被不予接受、补税和罚款的常见原因。请把公私资金分开。",
          },
          {
            question: "什么是资本免税额？",
            answer:
              "由于设备、车辆和类似资产的成本不能一次性扣除，法律允许就合格资产申报资本免税额，把税务减免分摊到各个时期。税率、小额资产规则和限额会变动，请查核现行数字。",
          },
          {
            question: "我可以扣除用于业务的汽车成本吗？",
            answer:
              "可能可以，但对可申报免税额的成本有特定限制，处理方式取决于车辆类型及其用途。不要假设豪华汽车可以全额申报，并在购买之前确认规则。",
          },
          {
            question: "罚款和罚金可以扣除吗？",
            answer:
              "一般不可以。因违法而被征收的罚款和罚单，包括逾期递交或逾期缴付的罚款，均不可扣除。",
          },
          {
            question: "马来西亚对中小企业有较低的税率吗？",
            answer:
              "符合中小企业条件的居民公司，包括对实收资本和总营业收入的限制以及对外资或大型公司持股的限制，在应税收入的头几个档次被课以较低的税率。档次和条件会变动，所以请向 LHDN 确认现行税率。",
          },
          {
            question: "独资业主可以扣除自己的薪水吗？",
            answer:
              "不可以。独资业主的提款不是可扣除的薪水，因为利润本身就是其收入。公司则可以扣除支付给董事的合理酬金。",
          },
          {
            question: "支持税务扣除需要哪些记录？",
            answer:
              "以您的企业为抬头的发票和收据、付款证明、合约、资产和薪资记录，以及对不寻常开支的业务理由的说明。LHDN 长期以来期望记录保存约七年，但请确认现行要求。",
          },
        ],
      },
      ms: {
        title: "Potongan Cukai dan Insentif untuk PKS Malaysia: Apa yang Boleh Anda Tuntut",
        excerpt:
          "Membayar jumlah cukai yang betul, tidak lebih dan tidak kurang, bergantung pada mengetahui apa yang boleh anda potong secara sah. Panduan ini menerangkan peraturan am tentang perbelanjaan yang dibenarkan dan tidak dibenarkan, elaun modal ke atas peralatan, kos kakitangan dan latihan, kadar cukai PKS dan insentif lazim, serta rekod yang anda perlukan untuk menyokong setiap tuntutan.",
        body: `Ramai pemilik perniagaan kecil sama ada membayar cukai berlebihan kerana tidak tahu apa yang boleh dipotong, atau membayar terlalu kurang kerana menuntut perkara yang tidak sepatutnya dan berharap tiada siapa menyemak. Kedua-duanya mahal. Yang pertama menyebabkan anda kehilangan wang tunai setiap tahun, dan yang kedua boleh membawa cukai tertunggak, penalti dan audit yang sangat tidak menyenangkan. Jawapannya ialah memahami prinsip, menuntut apa yang anda berhak, dan menyimpan bukti.

Ini ialah maklumat am, bukan nasihat cukai. Kadar cukai, elaun, had dan insentif sering disemak, lazimnya dengan setiap Bajet tahunan, dan ia bergantung pada struktur dan fakta perniagaan anda, jadi sahkan kedudukan semasa dengan Lembaga Hasil Dalam Negeri (LHDN) atau perunding cukai bertauliah sebelum anda bergantung padanya.

## 1. Fahami prinsip asas potongan

### Pendapatan boleh cukai ialah keuntungan, bukan jualan
Cukai dikira ke atas pendapatan terlaras anda, yang bermula daripada hasil perniagaan anda dan menolak perbelanjaan yang dibenarkan oleh undang-undang cukai. Semakin banyak potongan sah yang anda kenal pasti, semakin rendah keuntungan yang dicukai.

### Ujian utama
Secara am, sesuatu perbelanjaan boleh dipotong jika ia ditanggung sepenuhnya dan semata-mata untuk menjana pendapatan perniagaan anda, dan ia bukan bersifat modal atau dilarang secara khusus oleh undang-undang. Perkataan dan pengecualiannya terperinci, jadi anggaplah ini sebagai kaedah praktikal, bukan ujian penuh.

### Struktur anda penting
Syarikat dicukai sebagai entiti berasingan, manakala pemilik tunggal atau perkongsian membayar cukai ke atas keuntungan perniagaan melalui borang cukai peribadi pemilik. Sesetengah pelepasan dan kadar hanya terpakai kepada salah satu, jadi semak kerangka mana yang terpakai kepada anda.

## 2. Ketahui perbelanjaan lazim yang dibenarkan

Ini ialah perbelanjaan yang paling kerap dituntut oleh perniagaan, tertakluk kepada syarat di atas.

### Kos operasi
Sewa premis perniagaan, utiliti, telefon dan internet yang digunakan untuk perniagaan, pembaikan dan penyelenggaraan, alat tulis, langganan perisian dan kos harian yang serupa.

### Kos barangan dan kos langsung
Kos stok, bahan mentah dan buruh langsung yang masuk ke dalam apa yang anda jual.

### Pemasaran dan pengiklanan
Pengiklanan dalam talian dan luar talian, kos menjalankan laman web dan bahan promosi amnya layak, walaupun sesetengah item sekali sahaja atau bersifat modal, seperti membina aset besar, mungkin dilayan secara berbeza.

### Yuran profesional
Perakaunan, audit, yuran guaman bagi perkara perniagaan biasa dan yuran setiausaha syarikat sering boleh dipotong, manakala sesetengah yuran yang berkaitan dengan item modal, seperti membeli hartanah, mungkin tidak boleh.

### Faedah dan kos pembiayaan
Faedah ke atas wang yang dipinjam untuk tujuan perniagaan sering boleh dipotong, tertakluk kepada peraturan, manakala faedah ke atas pinjaman peribadi tidak boleh.

### Hutang lapuk
Hutang yang anda kenal pasti secara khusus sebagai lapuk atau ragu mungkin boleh dipotong jika ia memenuhi syarat, yang menjadi satu lagi sebab untuk menyimpan rekod yang kukuh tentang bagaimana anda mengejarnya. Lihat panduan kami tentang menuntut bayaran lewat.

## 3. Ketahui apa yang amnya tidak boleh dipotong

### Perbelanjaan peribadi dan rumah tangga
Perbelanjaan peribadi, kos keluarga dan apa-apa yang tidak berkaitan dengan memperoleh pendapatan perniagaan tidak boleh dipotong, itulah sebabnya mencampurkan wang peribadi dan perniagaan sangat mahal. Lihat panduan kami tentang asas simpan kira.

### Perbelanjaan modal
Membeli peralatan, kenderaan dan hartanah amnya tidak dipotong sepenuhnya sebagai perbelanjaan. Sebaliknya, ia mungkin layak mendapat elaun modal, seperti yang diterangkan di bawah.

### Denda dan penalti
Penalti dan kompaun yang dikenakan kerana melanggar undang-undang amnya tidak boleh dipotong, termasuk penalti pemfailan lewat dan bayaran lewat.

### Item terhad
Sesetengah kategori terhad sebahagian atau sepenuhnya, seperti kos hiburan tertentu, perbelanjaan ke atas jenis kenderaan persendirian tertentu, dan hadiah. Had adalah khusus dan berubah, jadi sahkannya sebelum anda menuntut.

### Cukai pendapatan itu sendiri
Cukai pendapatan yang dibayar bukan perbelanjaan bagi tujuan cukai.

## 4. Tuntut elaun modal ke atas peralatan

### Apa itu
Oleh sebab anda tidak boleh memotong kos peralatan sekaligus, undang-undang membenarkan anda menuntut elaun modal, iaitu pelepasan cukai yang disebarkan sepanjang masa, ke atas aset layak seperti jentera, peralatan, komputer dan sesetengah kenderaan.

### Bagaimana ia berfungsi
Elaun lazimnya terdiri daripada elaun permulaan pada tahun pertama dan elaun tahunan selepas itu, pada kadar yang bergantung pada jenis aset. Kadar dan syarat ditetapkan dalam perundangan cukai dan disemak dari semasa ke semasa.

### Aset bernilai kecil
Terdapat layanan yang lebih murah hati bagi aset bernilai rendah, yang boleh dihapus kira dengan lebih pantas, dengan had bagi setiap item dan setiap tahun yang berbeza bagi PKS dan perniagaan lain. Sahkan ambang semasa sebelum membeli.

### Simpan daftar aset
Senaraikan setiap aset dengan tarikh, kos dan invois pembekalnya. Anda memerlukan butiran ini untuk mengira elaun dan untuk berurusan dengan sebarang jualan atau pelupusan kemudian.

### Berhati-hati dengan kereta
Kereta yang digunakan untuk perniagaan mempunyai had khusus ke atas kos yang boleh dituntut elaun, dan layanannya bergantung pada jenis kenderaan. Jangan anggap kereta mewah boleh dituntut sepenuhnya.

## 5. Tuntut kos kakitangan dan latihan

### Gaji dan faedah
Gaji pekerja, bonus dan banyak faedah kakitangan boleh dipotong apabila ia untuk perniagaan, bersama caruman berkanun majikan seperti KWSP, PERKESO dan SIP, yang diterangkan dalam panduan kami tentang mengambil pekerja pertama. Layanan tepat bagi sesetengah faedah berbeza, jadi semak peraturan.

### Latihan
Latihan yang meningkatkan kemahiran kakitangan anda untuk perniagaan mungkin boleh dipotong, dan terdapat skim, seperti melalui Perbadanan Pembangunan Sumber Manusia, yang menawarkan sokongan atau layanan dipertingkat dalam sesetengah kes. Semak program dan syarat yang terpakai.

### Gaji pengarah dan pemilik
Syarikat boleh memotong saraan munasabah yang dibayar kepada pengarah, tetapi pemilik tunggal tidak boleh memotong pengeluaran sendiri sebagai gaji, kerana keuntungan itu sudah menjadi pendapatan mereka.

## 6. Ketahui kadar cukai PKS dan insentif lazim

### Kadar cukai korporat PKS
Syarikat pemastautin yang memenuhi syarat bagi perusahaan kecil dan sederhana, yang pada masa ini termasuk had ke atas modal berbayar dan pendapatan kasar perniagaan serta sekatan ke atas pemilikan asing atau syarikat besar, telah dicukai pada kadar lebih rendah ke atas bahagian pertama pendapatan bercukai berbanding kadar korporat standard. Peringkat, kadar dan syarat telah disemak sebelum ini, jadi sahkan kadar semasa dan kelayakan anda dengan LHDN.

### Insentif dan skim
Kerajaan juga menawarkan insentif dari semasa ke semasa, seperti elaun atau potongan dipertingkat bagi aktiviti tertentu, termasuk sesetengah kos pendigitalan. Panduan kami tentang geran dan pembiayaan PKS merangkumi sokongan selain cukai, dan panduan tentang e-Invois menerangkan satu kewajipan yang kadangkala disertai insentif berkaitan.

### Insentif sering berubah
Banyak insentif terhad masa, memerlukan kelulusan atau terpakai kepada sektor tertentu sahaja, jadi jangan merancang berdasarkan satu sehingga anda mengesahkan ia masih tersedia dan anda layak.

### Jangan mengejar penjimatan cukai yang merosakkan perniagaan
Membelanjakan wang semata-mata untuk mendapat potongan tetap menelan kebanyakan wang itu. Potongan mengurangkan kos perbelanjaan yang sebenar, ia tidak menjadikannya percuma.

## 7. Simpan rekod yang menyokong setiap tuntutan

> Potongan hanya sebaik bukti di sebaliknya. Jika LHDN mempersoalkan tuntutan dan anda tidak dapat mengemukakan invois, bukti bayaran dan sebab perbelanjaan itu untuk perniagaan, anda patut menjangka potongan akan ditolak dan penalti akan menyusul.

### Apa yang perlu disimpan
Simpan invois dan resit yang dialamatkan kepada perniagaan anda, bukti bayaran, kontrak, rekod aset, rekod gaji, dan nota ringkas tentang sebab perniagaan bagi sebarang perbelanjaan luar biasa.

### Berapa lama
LHDN sejak lama menjangkakan rekod disimpan sekitar tujuh tahun, tetapi sahkan keperluan semasa dengan LHDN atau akauntan anda. Panduan simpan kira kami menerangkan apa yang perlu disimpan dan cara menyusunnya.

### Fail tuntutan
Simpan fail tuntutan bagi setiap potongan, kerana potongan yang tidak dapat anda dokumenkan ialah potongan yang boleh ditolak oleh LHDN. Folder mudah, fizikal atau digital, bagi setiap tahun dan setiap kategori sudah memadai.

### Bekerjasama dengan akauntan anda
Kongsi rekod anda lebih awal dan bukannya pada tarikh akhir pemfailan, tanya apa yang mungkin anda terlepas, dan pastikan angka dalam borang cukai anda sepadan dengan akaun anda.

Jika anda mahu bantuan daripada perunding cukai atau akauntan, anda boleh [menyemak imbas direktori](/ms) untuk profesional tempatan, dan [membuat penyenaraian perniagaan percuma](/ms/signup) membantu pelanggan dan rakan baharu menemui serta mengesahkan perniagaan anda.

## Kesilapan lazim PKS Malaysia dengan potongan cukai

- **Menuntut perbelanjaan peribadi sebagai kos perniagaan.** Ia punca paling lazim potongan ditolak dan penalti dikenakan.
- **Terlepas tuntutan yang sah.** Pemilik yang tidak menyimpan rekod sering terlupa elaun modal, hutang lapuk dan kos berulang yang kecil.
- **Bergantung pada nasihat yang sudah lapuk.** Kadar, had dan insentif berubah dengan setiap Bajet, jadi peraturan tahun lepas mungkin tidak terpakai.

## Di mana hendak bermula

- **Minggu ini:** Kumpulkan invois, resit dan rekod aset anda untuk tahun itu, dan asingkan perbelanjaan perniagaan daripada peribadi.
- **Seterusnya:** Wujudkan daftar aset dan folder tuntutan bagi setiap kategori perbelanjaan.
- **Kemudian:** Tanya akauntan anda elaun, kadar dan insentif mana yang terpakai kepada anda tahun ini.
- **Setiap tahun:** Semak tuntutan anda selepas setiap pengumuman Bajet, dan rancang pembelian besar dengan mengambil kira layanan cukai.

Perancangan cukai bagi perniagaan kecil kebanyakannya rekod yang baik dan tiada kejutan, dan pemilik yang menyimpan kedua-duanya membayar jumlah yang betul, tidak sesen pun lebih.`,
        faqs: [
          {
            question: "Apakah perbelanjaan yang amnya boleh dipotong oleh perniagaan Malaysia daripada pendapatan bercukainya?",
            answer:
              "Secara am, perbelanjaan yang ditanggung sepenuhnya dan semata-mata untuk menjana pendapatan perniagaan yang bukan bersifat modal atau dilarang secara khusus, seperti sewa, utiliti, stok, pemasaran, yuran profesional, kos kakitangan dan faedah berkaitan perniagaan. Sahkan peraturan terperinci dengan LHDN atau perunding cukai.",
          },
          {
            question: "Bolehkah saya memotong perbelanjaan peribadi melalui perniagaan saya?",
            answer:
              "Tidak. Perbelanjaan peribadi dan rumah tangga tidak boleh dipotong, dan menuntutnya ialah punca lazim potongan ditolak, cukai tertunggak dan penalti. Pastikan wang perniagaan dan peribadi berasingan.",
          },
          {
            question: "Apakah elaun modal?",
            answer:
              "Oleh sebab kos peralatan, kenderaan dan aset yang serupa tidak dipotong sekaligus, undang-undang membenarkan elaun modal, yang menyebarkan pelepasan cukai sepanjang masa ke atas aset layak. Kadar, peraturan aset bernilai kecil dan had berubah, jadi semak angka semasa.",
          },
          {
            question: "Bolehkah saya memotong kos kereta yang saya gunakan untuk perniagaan?",
            answer:
              "Mungkin, tetapi terdapat had khusus ke atas kos yang boleh dituntut elaun, dan layanannya bergantung pada jenis kenderaan dan penggunaannya. Jangan anggap kereta mewah boleh dituntut sepenuhnya, dan sahkan peraturan sebelum anda membeli.",
          },
          {
            question: "Adakah denda dan penalti boleh dipotong?",
            answer:
              "Amnya tidak. Penalti dan kompaun yang dikenakan kerana melanggar undang-undang, termasuk penalti pemfailan lewat atau bayaran lewat, tidak boleh dipotong.",
          },
          {
            question: "Adakah terdapat kadar cukai yang lebih rendah untuk PKS di Malaysia?",
            answer:
              "Syarikat pemastautin yang memenuhi syarat PKS, termasuk had ke atas modal berbayar dan pendapatan kasar perniagaan serta sekatan ke atas pemilikan asing atau syarikat besar, telah dicukai pada kadar lebih rendah ke atas bahagian pertama pendapatan bercukai. Peringkat dan syarat berubah, jadi sahkan kadar semasa dengan LHDN.",
          },
          {
            question: "Bolehkah pemilik tunggal memotong gaji sendiri?",
            answer:
              "Tidak. Pengeluaran pemilik tunggal bukan gaji yang boleh dipotong kerana keuntungan itu sudah menjadi pendapatannya. Syarikat boleh memotong saraan munasabah yang dibayar kepada pengarahnya.",
          },
          {
            question: "Apakah rekod yang saya perlukan untuk menyokong potongan cukai?",
            answer:
              "Invois dan resit yang dialamatkan kepada perniagaan anda, bukti bayaran, kontrak, rekod aset dan gaji, serta nota tentang sebab perniagaan bagi perbelanjaan luar biasa. LHDN sejak lama menjangkakan rekod disimpan sekitar tujuh tahun, tetapi sahkan keperluan semasa.",
          },
        ],
      },
    },
  },
];
