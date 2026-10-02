import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directoryContactPath } from "@/lib/directory-i18n";
import { DIRECTORY_CONTACT_COPY } from "@/lib/directory-contact-copy";
import {
  DIRECTORY_PUBLISHER,
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { getSiteOrigin } from "@/lib/site-url";
import { whatsAppUrl } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";
import { Mail, MessageCircle, Phone } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const siteOrigin = await getSiteOrigin();
  const copy = DIRECTORY_CONTACT_COPY[resolved];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[resolved];
  const title = `${copy.seoTitle} | ${siteName}`;
  const url = `${siteOrigin}${directoryContactPath(resolved)}`;
  const shareImage = directoryShareImage(siteOrigin, resolved);
  return {
    title,
    description: copy.seoDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, directoryContactPath),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description: copy.seoDescription,
      url,
      siteName,
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[resolved],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: copy.seoDescription,
      images: [shareImage],
    },
  };
}

export default async function DirectoryContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const copy = DIRECTORY_CONTACT_COPY[resolved];
  const { email, telephone } = DIRECTORY_PUBLISHER;

  const contactMethods = [
    {
      key: "email",
      icon: Mail,
      label: copy.emailLabel,
      value: email,
      href: `mailto:${email}`,
    },
    {
      key: "phone",
      icon: Phone,
      label: copy.phoneLabel,
      value: telephone,
      hint: copy.phoneHint,
      href: `tel:${telephone.replace(/\s|-/g, "")}`,
    },
    {
      key: "whatsapp",
      icon: MessageCircle,
      label: copy.whatsAppLabel,
      value: telephone,
      href: whatsAppUrl(telephone),
      external: true,
    },
  ];

  return (
    <div className="w-full px-4 py-16 sm:px-8 sm:py-20">
      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-soft sm:px-12 sm:py-24 dark:border-neutral-800 dark:bg-neutral-900">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-led-soft)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_var(--color-led-soft-dark)_0%,_transparent_60%)]"
        />
        <p className="text-sm font-semibold uppercase tracking-wide text-petrol dark:text-petrol-light">{copy.heroEyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
          {copy.heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{copy.heroSubtitle}</p>
      </section>

      <div className="mx-auto mt-14 max-w-5xl">
        <div className="grid gap-5 sm:grid-cols-3">
          {contactMethods.map(({ key, icon: Icon, label, value, hint, href, external }) => (
            <Card key={key} className="rounded-2xl text-center shadow-soft">
              <CardBody className="flex flex-col items-center gap-2 py-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-led-soft text-petrol dark:bg-led-soft-dark dark:text-petrol-light">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-1 text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">{label}</p>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-base font-medium text-slate-900 hover:text-petrol hover:underline dark:text-slate-100 dark:hover:text-petrol-light"
                >
                  {value}
                </a>
                {hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-10 rounded-2xl shadow-soft">
          <CardBody>
            <h2 className="text-center text-xl font-semibold text-slate-900 dark:text-slate-100">{copy.leadFormHeading}</h2>
            {/* Gotka's own CRM lead-form widget — it injects the actual form
                markup into this div once the embed script below runs, rather
                than this app building/validating/submitting the fields
                itself. lang is this page's own resolved locale so the
                injected form matches whichever of en/zh/ms the visitor is
                on, not a value hardcoded to one language. */}
            <div data-gotech-lead-form className="mt-6" />
            <Script src={`https://crm.gotka.com/embed/lead-form.js?lang=${resolved}`} strategy="afterInteractive" />
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{copy.businessContactNote}</p>
      </div>
    </div>
  );
}
