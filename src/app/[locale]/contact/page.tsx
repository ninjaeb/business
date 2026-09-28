import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

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
  const { email, telephone, address } = DIRECTORY_PUBLISHER;
  const addressLines = [address.streetAddress, `${address.postalCode} ${address.addressLocality}`, `${address.addressRegion}, Malaysia`];

  return (
    <div className="w-full px-4 py-12 sm:px-8">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-petrol dark:text-petrol-light">{copy.heroEyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">{copy.heroTitle}</h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{copy.heroSubtitle}</p>
      </section>

      <div className="mx-auto mt-10 max-w-xl">
        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-petrol dark:text-petrol-light" />
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">{copy.emailLabel}</p>
                <a href={`mailto:${email}`} className="text-base text-slate-900 hover:text-petrol hover:underline dark:text-slate-100 dark:hover:text-petrol-light">
                  {email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-petrol dark:text-petrol-light" />
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">{copy.phoneLabel}</p>
                <a href={`tel:${telephone.replace(/\s|-/g, "")}`} className="text-base text-slate-900 hover:text-petrol hover:underline dark:text-slate-100 dark:hover:text-petrol-light">
                  {telephone}
                </a>
                <p className="text-sm text-slate-500 dark:text-slate-400">{copy.phoneHint}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-petrol dark:text-petrol-light" />
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">{copy.whatsAppLabel}</p>
                <a
                  href={whatsAppUrl(telephone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-slate-900 hover:text-petrol hover:underline dark:text-slate-100 dark:hover:text-petrol-light"
                >
                  {telephone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-petrol dark:text-petrol-light" />
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">{copy.addressLabel}</p>
                {addressLines.map((line) => (
                  <p key={line} className="text-base text-slate-900 dark:text-slate-100">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{copy.businessContactNote}</p>
      </div>
    </div>
  );
}
