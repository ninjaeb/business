import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  Clapperboard,
  Cpu,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  Megaphone,
  Palmtree,
  Radio,
  Scale,
  ShoppingBag,
  Sprout,
  Tag,
  Truck,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Industry } from "@/generated/prisma/client";
import { INDUSTRIES, INDUSTRY_LABELS } from "@/lib/labels";
import { slugify } from "@/lib/slug";
import { DIRECTORY_SITE_NAME_BY_LOCALE } from "@/lib/directory-seo";
import { INDUSTRY_LABELS_BY_LOCALE, type DirectoryLocale } from "@/lib/directory-i18n";

// Purely decorative — one representative icon per Industry, not an attempt
// to classify a business more precisely than its own chosen category
// already does. Shared by ListingCard's cover-photo badge and
// IndustriesIndexContent's own listing rows.
export const INDUSTRY_ICONS: Record<Industry, LucideIcon> = {
  TECHNOLOGY: Cpu,
  RETAIL_ECOMMERCE: ShoppingBag,
  HEALTHCARE: HeartPulse,
  FINANCE_BANKING: Banknote,
  MANUFACTURING: Factory,
  CONSTRUCTION_REAL_ESTATE: Building2,
  EDUCATION: GraduationCap,
  HOSPITALITY_TOURISM: Palmtree,
  PROFESSIONAL_SERVICES: Briefcase,
  MEDIA_ENTERTAINMENT: Clapperboard,
  TRANSPORTATION_LOGISTICS: Truck,
  AGRICULTURE: Sprout,
  ENERGY_UTILITIES: Zap,
  GOVERNMENT_NONPROFIT: Landmark,
  TELECOMMUNICATIONS: Radio,
  AUTOMOTIVE: Car,
  FOOD_BEVERAGE: UtensilsCrossed,
  LEGAL: Scale,
  MARKETING_ADVERTISING: Megaphone,
  OTHER: Tag,
};

// A friendly industry page's own URL slug is derived from the English label
// (slugify("Food & Beverage") -> "food-beverage"), same convention as
// categoryPath — reads like words in the URL bar rather than the enum's own
// SCREAMING_SNAKE_CASE. Industry is a fixed, small enum (unlike
// BusinessCategory, a DB table), so this needs no async lookup the way
// findCategoryBySlug does.
export function industrySlug(industry: Industry): string {
  return slugify(INDUSTRY_LABELS[industry]);
}

export function findIndustryBySlug(slug: string): Industry | null {
  return INDUSTRIES.find((industry) => industrySlug(industry) === slug) ?? null;
}

// Same shape as categoryPath in directory-category-labels.ts.
export function industryPath(industry: Industry, locale: DirectoryLocale): string {
  return `/${locale}/industry/${industrySlug(industry)}`;
}

export function industryPageTitle(industry: Industry, locale: DirectoryLocale): string {
  const label = INDUSTRY_LABELS_BY_LOCALE[locale][industry];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[locale];
  if (locale === "zh") return `${label} 企业 | ${siteName}`;
  if (locale === "ms") return `Perniagaan ${label} | ${siteName}`;
  return `${label} Businesses | ${siteName}`;
}

export function industryPageHeading(industry: Industry, locale: DirectoryLocale): string {
  const label = INDUSTRY_LABELS_BY_LOCALE[locale][industry];
  if (locale === "zh") return `${label} 企业`;
  if (locale === "ms") return `Perniagaan ${label}`;
  return `${label} businesses`;
}

// What each industry actually covers, not a generic "browse trusted
// businesses" line — used as this page's own SEO meta description (see
// industryPageDescription) so a search result actually says something
// specific about the industry rather than repeating the same template 20
// times over with only the label swapped out.
const INDUSTRY_DESCRIPTIONS: Record<Industry, { en: string; zh: string; ms: string }> = {
  TECHNOLOGY: {
    en: "Technology businesses build software, hardware, IT systems, and digital products — from startups to enterprise solution providers.",
    zh: "科技行业企业开发软件、硬件、信息系统和数字产品，从初创公司到企业级解决方案提供商。",
    ms: "Perniagaan Teknologi membangunkan perisian, perkakasan, sistem IT dan produk digital — daripada syarikat permulaan hingga penyedia penyelesaian korporat.",
  },
  RETAIL_ECOMMERCE: {
    en: "Retail & E-commerce businesses sell goods in stores and online, from independent shops to full-scale online retailers.",
    zh: "零售与电商企业通过实体店和网络销售商品，涵盖从独立小店到大型网络零售商。",
    ms: "Perniagaan Runcit & E-dagang menjual barangan di kedai dan dalam talian, merangkumi kedai persendirian hingga peruncit dalam talian berskala besar.",
  },
  HEALTHCARE: {
    en: "Healthcare businesses provide medical care, clinical services, and health-related products, from clinics and specialists to health suppliers.",
    zh: "医疗保健企业提供医疗护理、临床服务及相关产品，包括诊所、专科医生和医疗用品供应商。",
    ms: "Perniagaan Penjagaan Kesihatan menyediakan rawatan perubatan, perkhidmatan klinikal dan produk kesihatan, daripada klinik hingga pembekal kesihatan.",
  },
  FINANCE_BANKING: {
    en: "Finance & Banking businesses offer banking, lending, investment, and financial planning services for individuals and companies.",
    zh: "金融与银行企业为个人和企业提供银行、贷款、投资和理财规划服务。",
    ms: "Perniagaan Kewangan & Perbankan menawarkan perbankan, pinjaman, pelaburan dan perancangan kewangan untuk individu dan syarikat.",
  },
  MANUFACTURING: {
    en: "Manufacturing businesses produce goods at scale, from raw-material processing to finished products across industries.",
    zh: "制造业企业进行规模化生产，涵盖从原材料加工到各行业成品制造。",
    ms: "Perniagaan Perkilangan menghasilkan barangan secara berskala, daripada pemprosesan bahan mentah hingga produk siap dalam pelbagai industri.",
  },
  CONSTRUCTION_REAL_ESTATE: {
    en: "Construction & Real Estate businesses build, renovate, sell, and manage residential and commercial properties.",
    zh: "建筑与房地产企业负责住宅和商业物业的建造、翻新、销售与管理。",
    ms: "Perniagaan Pembinaan & Hartanah membina, mengubah suai, menjual dan menguruskan hartanah kediaman dan komersial.",
  },
  EDUCATION: {
    en: "Education businesses teach and train, spanning schools, tuition centres, vocational courses, and professional development.",
    zh: "教育行业企业从事教学与培训，涵盖学校、补习中心、职业课程及专业进修。",
    ms: "Perniagaan Pendidikan mengajar dan melatih, merangkumi sekolah, pusat tuisyen, kursus vokasional dan pembangunan profesional.",
  },
  HOSPITALITY_TOURISM: {
    en: "Hospitality & Tourism businesses run hotels, restaurants, and travel services, and create experiences for guests and travellers.",
    zh: "酒店旅游企业经营酒店、餐厅、旅游服务，为宾客和旅客提供各种体验。",
    ms: "Perniagaan Hospitaliti & Pelancongan mengendalikan hotel, restoran dan perkhidmatan pelancongan untuk tetamu dan pelancong.",
  },
  PROFESSIONAL_SERVICES: {
    en: "Professional Services businesses offer expert advisory work — consulting, accounting, and other specialist services.",
    zh: "专业服务企业提供专业咨询工作，包括顾问、会计等专业服务。",
    ms: "Perkhidmatan Profesional menawarkan kerja nasihat pakar — perundingan, perakaunan dan perkhidmatan khusus lain.",
  },
  MEDIA_ENTERTAINMENT: {
    en: "Media & Entertainment businesses create content, run events, and entertain audiences across film, music, and digital media.",
    zh: "媒体与娱乐企业制作内容、举办活动，通过影视、音乐和数字媒体娱乐大众。",
    ms: "Perniagaan Media & Hiburan menghasilkan kandungan, menganjurkan acara dan menghiburkan penonton melalui filem, muzik dan media digital.",
  },
  TRANSPORTATION_LOGISTICS: {
    en: "Transportation & Logistics businesses move people and goods, covering freight, courier, warehousing, and fleet services.",
    zh: "运输与物流企业负责人员与货物运送，涵盖货运、快递、仓储及车队服务。",
    ms: "Perniagaan Pengangkutan & Logistik menggerakkan orang dan barangan, merangkumi perkhidmatan kargo, kurier, gudang dan armada.",
  },
  AGRICULTURE: {
    en: "Agriculture businesses grow crops, raise livestock, and supply farming equipment, inputs, and agri-services.",
    zh: "农业企业种植农作物、饲养牲畜，并供应农业设备、原料及相关服务。",
    ms: "Perniagaan Pertanian menanam tanaman, memelihara ternakan serta membekalkan peralatan dan perkhidmatan pertanian.",
  },
  ENERGY_UTILITIES: {
    en: "Energy & Utilities businesses generate, distribute, and manage power, water, and renewable energy resources.",
    zh: "能源与公用事业企业负责电力、水务及可再生能源的生产、分配与管理。",
    ms: "Perniagaan Tenaga & Utiliti menjana, mengagih dan menguruskan sumber kuasa, air dan tenaga boleh diperbaharui.",
  },
  GOVERNMENT_NONPROFIT: {
    en: "Government & Nonprofit organisations deliver public services, advocacy work, and community programmes.",
    zh: "政府与非营利组织提供公共服务、倡导工作及社区项目。",
    ms: "Kerajaan & Badan Bukan Untung menyampaikan perkhidmatan awam, advokasi dan program komuniti.",
  },
  TELECOMMUNICATIONS: {
    en: "Telecommunications businesses provide phone, internet, and network connectivity services for consumers and companies.",
    zh: "电信企业为消费者和企业提供电话、网络及连接服务。",
    ms: "Perniagaan Telekomunikasi menyediakan perkhidmatan telefon, internet dan sambungan rangkaian untuk pengguna dan syarikat.",
  },
  AUTOMOTIVE: {
    en: "Automotive businesses sell, service, and supply vehicles and parts — from dealerships to repair and detailing shops.",
    zh: "汽车行业企业销售、维修并供应车辆与零件，涵盖经销商至维修美容店。",
    ms: "Perniagaan Automotif menjual, menyelenggara dan membekalkan kenderaan serta alat ganti — daripada penjual hingga bengkel pembaikan.",
  },
  FOOD_BEVERAGE: {
    en: "Food & Beverage businesses prepare and sell food and drink, from restaurants and cafés to manufacturers and suppliers.",
    zh: "餐饮企业制作并销售食品饮料，涵盖餐厅、咖啡馆至生产商与供应商。",
    ms: "Perniagaan Makanan & Minuman menyediakan dan menjual makanan serta minuman, daripada restoran hingga pengeluar dan pembekal.",
  },
  LEGAL: {
    en: "Legal businesses provide legal advice, representation, and compliance services for individuals and companies.",
    zh: "法律服务企业为个人和企业提供法律咨询、代理及合规服务。",
    ms: "Perkhidmatan Guaman menyediakan nasihat undang-undang, perwakilan dan pematuhan untuk individu dan syarikat.",
  },
  MARKETING_ADVERTISING: {
    en: "Marketing & Advertising businesses build brands and campaigns — from agencies to specialist marketing services.",
    zh: "营销与广告企业打造品牌与营销活动，涵盖广告代理至专业营销服务。",
    ms: "Perniagaan Pemasaran & Pengiklanan membina jenama dan kempen — daripada agensi hingga perkhidmatan pemasaran khusus.",
  },
  OTHER: {
    en: "A broad mix of businesses that don't fit neatly into the categories above, still verified and ready to work with.",
    zh: "其他类别涵盖不完全属于以上分类、但同样经过验证并可信赖合作的各类企业。",
    ms: "Kategori Lain merangkumi pelbagai perniagaan yang tidak tergolong dalam kategori di atas, tetap disahkan dan sedia untuk bekerjasama.",
  },
};

export function industryPageDescription(industry: Industry, locale: DirectoryLocale): string {
  return INDUSTRY_DESCRIPTIONS[industry][locale];
}
