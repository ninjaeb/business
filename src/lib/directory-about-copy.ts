import type { DirectoryLocale } from "@/lib/directory-i18n";

// The public "who runs this and how listings are reviewed" page
// (src/app/[locale]/about) — same pattern as directory-benefits-copy.ts:
// kept as its own copy file so the page component stays a plain layout and
// every claim is checked in one place. Every claim here is something this
// codebase actually does (the admin approval queue, the per-language pages,
// DirectoryGuide's own authorId) rather than invented editorial credentials
// — there's no named "editor" or "reviewer" bio anywhere in this app, and
// this page deliberately doesn't invent one; it attributes review and guide
// content to the Gotka Business Directory team as a whole, the same
// organization-level attribution buildGuideJsonLd/buildUpdatesJsonLd already
// use in their own structured data (see directory-seo.ts).
export type DirectoryAboutItem = { title: string; body: string };
export type DirectoryAboutGroup = { heading: string; items: DirectoryAboutItem[] };

export type DirectoryAboutCopy = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  groups: DirectoryAboutGroup[];
  ctaHeading: string;
  ctaBody: string;
};

export const DIRECTORY_ABOUT_COPY: Record<DirectoryLocale, DirectoryAboutCopy> = {
  en: {
    seoTitle: "About the Gotka Business Directory",
    seoDescription:
      "Who publishes the Gotka Business Directory, how every listing is reviewed before it goes live, and who writes the directory's guides.",
    heroEyebrow: "About this directory",
    heroTitle: "Who runs this directory, and how listings are reviewed",
    heroSubtitle:
      "The Gotka Business Directory is published by Gotka Technologies. Here's what that means for what you see on it.",
    groups: [
      {
        heading: "Who publishes this directory",
        items: [
          {
            title: "Gotka Technologies",
            body: "The Gotka Business Directory is published and operated by Gotka Technologies — gotka.com is our own site, and this directory is one of the things we build and run.",
          },
          {
            title: "One directory, three languages",
            body: "Every page exists in English, Chinese, and Malay, maintained as one directory rather than three separate translated copies.",
          },
        ],
      },
      {
        heading: "How we review listings",
        items: [
          {
            title: "Checked before it goes live",
            body: "A business owner submits and edits their own listing, but nothing appears on the public directory until our team has reviewed it.",
          },
          {
            title: "Reviewed again for significant changes",
            body: "A listing that's already live can still have its later updates checked before they replace what visitors see, rather than every edit going straight to the public page unreviewed.",
          },
          {
            title: "Removed if it doesn't hold up",
            body: "A listing we can't verify, or that misrepresents the business behind it, doesn't stay published.",
          },
        ],
      },
      {
        heading: "Our guides",
        items: [
          {
            title: "Written by our own team",
            body: "Guides on this directory are written by the Gotka Business Directory team — the same team responsible for reviewing listings — not submitted by businesses.",
          },
        ],
      },
    ],
    ctaHeading: "Want your business listed here?",
    ctaBody: "Submit your listing — our team reviews it before it goes live.",
  },
  zh: {
    seoTitle: "关于 Gotka 企业目录",
    seoDescription: "谁发布了 Gotka 企业目录、每个刊登条目在上线前如何接受审核，以及目录的指南文章由谁撰写。",
    heroEyebrow: "关于本目录",
    heroTitle: "本目录由谁运营，刊登条目又是如何审核的",
    heroSubtitle: "Gotka 企业目录由 Gotka Technologies 发布。以下说明您在本目录上看到的内容意味着什么。",
    groups: [
      {
        heading: "谁发布本目录",
        items: [
          {
            title: "Gotka Technologies",
            body: "Gotka 企业目录由 Gotka Technologies 发布并运营——gotka.com 是我们自己的网站，本目录正是我们构建和运营的项目之一。",
          },
          {
            title: "一个目录，三种语言",
            body: "每个页面都提供英文、中文和马来文版本，作为同一个目录维护，而非三份各自独立的翻译副本。",
          },
        ],
      },
      {
        heading: "我们如何审核刊登条目",
        items: [
          {
            title: "上线前先经过审核",
            body: "企业主提交并编辑自己的刊登条目，但在我们团队审核之前，任何内容都不会出现在公开目录上。",
          },
          {
            title: "重大更改会再次审核",
            body: "已经上线的刊登条目,其后续更新在替换访客所见内容之前仍会接受检查,而不是每次编辑都未经审核直接生效。",
          },
          {
            title: "无法核实的条目会被下架",
            body: "如果一个刊登条目无法核实,或歪曲了其背后企业的真实情况,便不会继续保留在线上。",
          },
        ],
      },
      {
        heading: "我们的指南文章",
        items: [
          {
            title: "由我们自己的团队撰写",
            body: "本目录上的指南文章由 Gotka 企业目录团队撰写——即负责审核刊登条目的同一个团队——而非由企业提交。",
          },
        ],
      },
    ],
    ctaHeading: "想在这里刊登您的企业吗？",
    ctaBody: "提交您的刊登条目——我们的团队会在它上线前进行审核。",
  },
  ms: {
    seoTitle: "Tentang Direktori Perniagaan Gotka",
    seoDescription:
      "Siapa yang menerbitkan Direktori Perniagaan Gotka, bagaimana setiap senarai disemak sebelum disiarkan, dan siapa yang menulis panduan direktori ini.",
    heroEyebrow: "Tentang direktori ini",
    heroTitle: "Siapa yang menguruskan direktori ini, dan bagaimana senarai disemak",
    heroSubtitle:
      "Direktori Perniagaan Gotka diterbitkan oleh Gotka Technologies. Ini yang dimaksudkan untuk apa yang anda lihat di sini.",
    groups: [
      {
        heading: "Siapa yang menerbitkan direktori ini",
        items: [
          {
            title: "Gotka Technologies",
            body: "Direktori Perniagaan Gotka diterbitkan dan dikendalikan oleh Gotka Technologies — gotka.com ialah laman web kami sendiri, dan direktori ini adalah salah satu produk yang kami bina dan kendalikan.",
          },
          {
            title: "Satu direktori, tiga bahasa",
            body: "Setiap halaman wujud dalam bahasa Inggeris, Cina, dan Melayu, dikekalkan sebagai satu direktori dan bukan tiga salinan terjemahan berasingan.",
          },
        ],
      },
      {
        heading: "Bagaimana kami menyemak senarai",
        items: [
          {
            title: "Disemak sebelum disiarkan",
            body: "Pemilik perniagaan menghantar dan mengemas kini senarai mereka sendiri, tetapi tiada apa-apa dipaparkan di direktori awam sehingga pasukan kami menyemaknya.",
          },
          {
            title: "Disemak semula untuk perubahan penting",
            body: "Senarai yang sudah disiarkan masih boleh disemak sebelum kemas kininya menggantikan apa yang dilihat pelawat — bukan setiap suntingan terus disiarkan tanpa semakan.",
          },
          {
            title: "Dialih keluar jika tidak sah",
            body: "Senarai yang tidak dapat kami sahkan, atau yang menyalahgambarkan perniagaan di sebaliknya, tidak kekal disiarkan.",
          },
        ],
      },
      {
        heading: "Panduan kami",
        items: [
          {
            title: "Ditulis oleh pasukan kami sendiri",
            body: "Panduan di direktori ini ditulis oleh pasukan Direktori Perniagaan Gotka — pasukan yang sama yang bertanggungjawab menyemak senarai — bukan dihantar oleh perniagaan.",
          },
        ],
      },
    ],
    ctaHeading: "Mahu perniagaan anda disenaraikan di sini?",
    ctaBody: "Hantar senarai anda — pasukan kami menyemaknya sebelum ia disiarkan.",
  },
};
