import type { DirectoryLocale } from "@/lib/directory-i18n";

// The public "how to reach Gotka Technologies" page (src/app/[locale]/
// contact) — same file-per-page pattern as directory-about-copy.ts/
// directory-benefits-copy.ts. Unlike those two, this page's actual contact
// details (email/phone/address) live in directory-seo.ts's
// DIRECTORY_PUBLISHER, not here — this file is just the page's own labels/
// intro copy in each language, kept separate from the (locale-independent)
// contact details themselves so there's one place to update a phone number
// or address, not three.
export type DirectoryContactCopy = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  emailLabel: string;
  phoneLabel: string;
  phoneHint: string;
  whatsAppLabel: string;
  addressLabel: string;
  businessContactNote: string;
};

export const DIRECTORY_CONTACT_COPY: Record<DirectoryLocale, DirectoryContactCopy> = {
  en: {
    seoTitle: "Contact Gotka Technologies",
    seoDescription:
      "How to reach Gotka Technologies, the team that publishes and operates the Gotka Business Directory — email, phone, WhatsApp, and our office address.",
    heroEyebrow: "Get in touch",
    heroTitle: "Contact Gotka Technologies",
    heroSubtitle: "We publish and operate the Gotka Business Directory. Here's how to reach us directly.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    phoneHint: "Mon–Fri, 9am–6pm MYT",
    whatsAppLabel: "WhatsApp",
    addressLabel: "Address",
    businessContactNote:
      "Looking to reach a specific business listed in the directory instead? Use the \"Get in touch\" form on that business's own listing page — it goes straight to them, not to us.",
  },
  zh: {
    seoTitle: "联系 Gotka Technologies",
    seoDescription: "如何联系 Gotka Technologies——负责发布和运营 Gotka 企业目录的团队。包括电邮、电话、WhatsApp 以及我们的办公地址。",
    heroEyebrow: "联系我们",
    heroTitle: "联系 Gotka Technologies",
    heroSubtitle: "我们负责发布和运营 Gotka 企业目录。以下是直接联系我们的方式。",
    emailLabel: "电邮",
    phoneLabel: "电话",
    phoneHint: "星期一至星期五，早上9点至下午6点（马来西亚时间）",
    whatsAppLabel: "WhatsApp",
    addressLabel: "地址",
    businessContactNote: "想联系目录中的某家企业？请使用该企业刊登页面上的「联系我们」表单——信息会直接发送给该企业，而非我们。",
  },
  ms: {
    seoTitle: "Hubungi Gotka Technologies",
    seoDescription:
      "Cara menghubungi Gotka Technologies, pasukan yang menerbitkan dan mengendalikan Direktori Perniagaan Gotka — e-mel, telefon, WhatsApp, dan alamat pejabat kami.",
    heroEyebrow: "Hubungi kami",
    heroTitle: "Hubungi Gotka Technologies",
    heroSubtitle: "Kami menerbitkan dan mengendalikan Direktori Perniagaan Gotka. Berikut cara untuk menghubungi kami secara terus.",
    emailLabel: "E-mel",
    phoneLabel: "Telefon",
    phoneHint: "Isnin–Jumaat, 9 pagi–6 petang (MYT)",
    whatsAppLabel: "WhatsApp",
    addressLabel: "Alamat",
    businessContactNote:
      "Ingin menghubungi perniagaan tertentu yang disenaraikan dalam direktori? Gunakan borang \"Hubungi kami\" pada halaman penyenaraian perniagaan tersebut — ia terus sampai kepada mereka, bukan kepada kami.",
  },
};
