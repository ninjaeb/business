import type { DirectoryLocale } from "@/lib/directory-i18n";

// The public "how our guides get written" page (src/app/[locale]/
// editorial-policy) — same file-per-page pattern as directory-about-copy.ts.
// Expands on (rather than repeats) the About page's brief "Our guides"
// section: sourcing, corrections, and the guides/listings independence
// point below are all real, checkable facts about this codebase (no
// sponsorship field anywhere on DirectoryGuide — see prisma/schema.prisma
// — so "not a paid placement" is a structural fact, not a promise), same
// standard as directory-about-copy.ts's own comment holds itself to.
export type DirectoryEditorialPolicyItem = { title: string; body: string };
export type DirectoryEditorialPolicyGroup = { heading: string; items: DirectoryEditorialPolicyItem[] };

export type DirectoryEditorialPolicyCopy = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  groups: DirectoryEditorialPolicyGroup[];
};

export const DIRECTORY_EDITORIAL_POLICY_COPY: Record<DirectoryLocale, DirectoryEditorialPolicyCopy> = {
  en: {
    seoTitle: "Editorial Policy",
    seoDescription: "How guides on the Gotka Business Directory are written, sourced, kept up to date, and corrected.",
    heroEyebrow: "How we write our guides",
    heroTitle: "Editorial Policy",
    heroSubtitle: "How guides on this directory are written, sourced, and kept accurate — separate from listing content, which businesses write themselves.",
    groups: [
      {
        heading: "Who writes our guides",
        items: [
          {
            title: "Written by our own team",
            body: "Every guide is written by the Gotka Business Directory team, the same team that reviews business listings before they go live — not submitted by a business or an outside contributor.",
          },
          {
            title: "Not a paid placement",
            body: "A business can't pay to be featured, mentioned, or ranked favorably in a guide. Guides and paid or free business listings are entirely separate systems in how this site is built.",
          },
        ],
      },
      {
        heading: "Sourcing",
        items: [
          {
            title: "Linking to primary sources",
            body: "Where a guide makes a factual claim that isn't simply about how this directory itself works, we aim to link to an authoritative outside source for it rather than stating it unsupported.",
          },
        ],
      },
      {
        heading: "Keeping guides current",
        items: [
          {
            title: "Revisited, not just published once",
            body: "A guide's page shows both when it was first published and, once it's been substantively revised, when it was last updated — so it's clear whether what you're reading reflects a recent check or an older one.",
          },
        ],
      },
      {
        heading: "Corrections",
        items: [
          {
            title: "Tell us if something's wrong",
            body: "If you spot an inaccuracy in a guide, contact us (see our Contact page) and we'll review and correct it.",
          },
        ],
      },
    ],
  },
  zh: {
    seoTitle: "编辑政策",
    seoDescription: "Gotka 企业目录的指南文章是如何撰写、引用资料来源、保持更新以及如何更正的。",
    heroEyebrow: "我们如何撰写指南",
    heroTitle: "编辑政策",
    heroSubtitle: "本目录的指南文章是如何撰写、引用资料来源以及保持准确的——这与由企业自行撰写的刊登内容是完全独立的两套系统。",
    groups: [
      {
        heading: "谁撰写我们的指南",
        items: [
          {
            title: "由我们自己的团队撰写",
            body: "每篇指南都由 Gotka 企业目录团队撰写——即负责在刊登条目上线前进行审核的同一个团队——而非由企业或外部撰稿人提交。",
          },
          {
            title: "并非付费置入内容",
            body: "企业无法付费在指南中获得推荐、提及或更高的排名。指南与付费或免费的企业刊登，在本网站的架构上是完全独立的两套系统。",
          },
        ],
      },
      {
        heading: "资料来源",
        items: [
          {
            title: "链接至原始资料来源",
            body: "如果指南中提出的事实性说法并非单纯关于本目录自身的运作方式，我们会尽量链接到权威的外部资料来源，而非无根据地陈述。",
          },
        ],
      },
      {
        heading: "保持指南内容更新",
        items: [
          {
            title: "会持续复查，而非只发布一次",
            body: "每篇指南页面都会显示其首次发布的时间，以及（在经过实质性修订后）最近一次更新的时间——让读者清楚知道所看到的内容是近期核实过的，还是较早之前的版本。",
          },
        ],
      },
      {
        heading: "更正",
        items: [
          {
            title: "发现错误请告诉我们",
            body: "如果您在指南中发现不准确之处，请联系我们（见「联系我们」页面），我们会进行核实并更正。",
          },
        ],
      },
    ],
  },
  ms: {
    seoTitle: "Dasar Editorial",
    seoDescription: "Bagaimana panduan di Direktori Perniagaan Gotka ditulis, dirujuk sumbernya, dikemas kini, dan dibetulkan.",
    heroEyebrow: "Bagaimana kami menulis panduan kami",
    heroTitle: "Dasar Editorial",
    heroSubtitle: "Bagaimana panduan di direktori ini ditulis, dirujuk sumbernya, dan dikekalkan ketepatannya — berasingan daripada kandungan penyenaraian, yang ditulis sendiri oleh perniagaan.",
    groups: [
      {
        heading: "Siapa yang menulis panduan kami",
        items: [
          {
            title: "Ditulis oleh pasukan kami sendiri",
            body: "Setiap panduan ditulis oleh pasukan Direktori Perniagaan Gotka, pasukan yang sama yang menyemak senarai perniagaan sebelum disiarkan — bukan dihantar oleh perniagaan atau penulis luar.",
          },
          {
            title: "Bukan penempatan berbayar",
            body: "Sesebuah perniagaan tidak boleh membayar untuk ditonjolkan, disebut, atau diberi kedudukan lebih baik dalam sesebuah panduan. Panduan dan penyenaraian perniagaan (berbayar atau percuma) adalah dua sistem yang sepenuhnya berasingan dalam pembinaan laman web ini.",
          },
        ],
      },
      {
        heading: "Sumber rujukan",
        items: [
          {
            title: "Memautkan kepada sumber utama",
            body: "Apabila sesebuah panduan membuat dakwaan fakta yang bukan sekadar tentang cara direktori ini beroperasi, kami cuba memautkan kepada sumber luar yang sahih, bukan menyatakannya tanpa sokongan.",
          },
        ],
      },
      {
        heading: "Mengekalkan panduan terkini",
        items: [
          {
            title: "Disemak semula, bukan sekadar disiarkan sekali",
            body: "Halaman setiap panduan menunjukkan bila ia pertama kali disiarkan dan, sebaik sahaja disemak semula secara substantif, bila ia terakhir dikemas kini — jadi jelas sama ada kandungan yang anda baca mencerminkan semakan terkini atau semakan lama.",
          },
        ],
      },
      {
        heading: "Pembetulan",
        items: [
          {
            title: "Maklumkan kepada kami jika ada kesilapan",
            body: "Jika anda perasan sebarang ketidaktepatan dalam sesebuah panduan, hubungi kami (lihat halaman Hubungi Kami) dan kami akan menyemak serta membetulkannya.",
          },
        ],
      },
    ],
  },
};
