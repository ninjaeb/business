import type { Metadata } from "next";
import { isGoogleAuthConfigured } from "@/lib/auth/google";
import { getSiteOrigin } from "@/lib/site-url";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalDashboardStrings, type PortalGoogleLoginErrorCode } from "@/lib/portal-dashboard-i18n";
import { BusinessLoginForm } from "@/components/directory/business-login-form";

export async function generateMetadata(): Promise<Metadata> {
  const [siteOrigin, locale] = await Promise.all([getSiteOrigin(), getDirectoryLocale()]);
  const t = getPortalDashboardStrings(locale);
  // Same fallback mark used for the public directory listing pages
  // (src/app/[locale]/business/[slug]/page.tsx) when a page has no image
  // of its own to share — there's nothing listing-specific to show here.
  const imageUrl = `${siteOrigin}/icon-192.png`;
  return {
    title: t.loginTitle,
    description: t.loginDescription,
    alternates: { canonical: `${siteOrigin}/business-portal/login` },
    robots: { index: false, follow: false },
    openGraph: {
      title: t.loginTitle,
      description: t.loginDescription,
      siteName: t.loginSiteName,
      type: "website",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary",
      title: t.loginTitle,
      description: t.loginDescription,
      images: [imageUrl],
    },
  };
}

export default async function BusinessLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, locale] = await Promise.all([searchParams, getDirectoryLocale()]);
  const t = getPortalDashboardStrings(locale);
  // This app has one Google flow, shared by partner and admin accounts —
  // it only refuses a match against a non-partner account (see
  // registerOrSignInPartnerWithGoogle in src/lib/partner-signup.ts). An
  // admin still signs in fine with email + password below.
  const initialError = error
    ? t.googleErrors[error as PortalGoogleLoginErrorCode] ?? t.googleErrorFallback
    : undefined;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-8">
      <BusinessLoginForm googleEnabled={isGoogleAuthConfigured()} initialError={initialError} locale={locale} />
    </div>
  );
}
