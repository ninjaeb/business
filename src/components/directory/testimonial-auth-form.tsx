"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginVisitor, registerVisitor, registerTestimonialAuthor, signInVisitorWithGoogle } from "@/app/actions/visitor-auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";

// Minimal ambient shape for Google Identity Services' own client-side SDK
// (loaded below via next/script) — see signInVisitorWithGoogle's own comment
// for why this dialog uses that id_token flow instead of the partner pages'
// full-page /api/auth/google redirect.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; text?: string; shape?: string; width?: number },
          ) => void;
        };
      };
    };
  }
}

// The account gate in front of TestimonialForm (see WriteTestimonialButton,
// which renders this instead of the testimonial form until onAuthenticated
// fires). Two tabs sharing one honeypot/render-timing shape as every other
// public form in this app (see submitDirectoryTestimonial's own comment) —
// registerVisitor/registerTestimonialAuthor/loginVisitor never redirect, so
// switching tabs or succeeding never navigates away from wherever this
// dialog is already open. The Google button above them follows the same
// "never navigate away" rule via a different mechanism (see the effect
// below) — it only ever creates/signs into a VISITOR account; a "Business
// account" signup only exists via the password form below, since choosing
// an account type up front has no Google-button equivalent (Google's own
// button is a single fixed widget, not a form field this could branch on).
//
// The Create-account side has its own secondary toggle, user vs. business
// (see accountType below) — not a VISITOR-vs-PARTNER distinction this
// component makes up on its own, but the same real account types/roles the
// rest of the app already has (a VISITOR exists only to write
// testimonials; a PARTNER is the same login a business owner uses in
// business-portal). Business account signup additionally requires company
// name and job title, and creates (and signs into) a real PARTNER account
// — including the same starter draft listing registerPartnerWithPassword
// always seeds — rather than a lighter, testimonial-only account.
export function TestimonialAuthForm({
  locale,
  googleClientId,
  onAuthenticated,
}: {
  locale: DirectoryLocale;
  // Null when Google sign-in isn't configured (see getPublicGoogleClientId)
  // — the button and its divider just don't render, same as the partner
  // signup/login pages' own googleEnabled gate.
  googleClientId: string | null;
  onAuthenticated: (name: string) => void;
}) {
  const t = DIRECTORY_STRINGS[locale];
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [accountType, setAccountType] = useState<"user" | "business">("user");
  const [signupState, signupAction, signupPending] = useActionState(registerVisitor, undefined);
  const [businessSignupState, businessSignupAction, businessSignupPending] = useActionState(
    registerTestimonialAuthor,
    undefined,
  );
  const [loginState, loginAction, loginPending] = useActionState(loginVisitor, undefined);
  const [renderedAt] = useState(() => Date.now());
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Handing the name up in an effect, not during render — both actions
  // resolve to {status:"success", name}, and onAuthenticated flips state on
  // the parent (WriteTestimonialButton), which must not happen synchronously
  // inside this component's own render.
  useEffect(() => {
    if (signupState?.status === "success") onAuthenticated(signupState.name);
  }, [signupState, onAuthenticated]);
  useEffect(() => {
    if (businessSignupState?.status === "success") onAuthenticated(businessSignupState.name);
  }, [businessSignupState, onAuthenticated]);
  useEffect(() => {
    if (loginState?.status === "success") onAuthenticated(loginState.name);
  }, [loginState, onAuthenticated]);

  // Wires up Google's own button once its script has loaded — renderButton
  // draws Google's branded button into googleButtonRef itself (there's no
  // form to submit; the click is entirely inside Google's iframe), and its
  // callback hands the resulting id_token to signInVisitorWithGoogle, the
  // same way signupAction/loginAction above hand off their FormData.
  useEffect(() => {
    if (!googleClientId || !googleScriptLoaded) return;
    const container = googleButtonRef.current;
    if (!container || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        setGoogleError(null);
        signInVisitorWithGoogle(response.credential)
          .then((result) => {
            if (result.status === "ok") {
              onAuthenticated(result.name);
            } else {
              setGoogleError(t.testimonialAuthErrors[result.code]);
            }
          })
          .catch(() => setGoogleError(t.testimonialAuthErrors.google_failed));
      },
    });
    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 320,
    });
  }, [googleClientId, googleScriptLoaded, onAuthenticated, t.testimonialAuthErrors]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.testimonialAuthHeading}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.testimonialAuthIntro}</p>
      </div>

      {googleClientId && (
        <div className="space-y-3">
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => setGoogleScriptLoaded(true)}
            onError={() => setGoogleError(t.testimonialAuthErrors.google_failed)}
          />
          {/* googleButtonRef's own div is left with no React children ever —
              renderButton (the effect above) writes into it directly via
              the DOM, outside React's reconciliation, and a React child
              there would risk a reconciliation conflict the moment that
              direct write and a later React re-render touch the same node.
              The skeleton below is an absolutely-positioned sibling instead,
              and min-h on the wrapper (Google's own "large" rectangular
              button renders ~40px tall) reserves real layout space so a
              slow or blocked accounts.google.com script leaves a visible,
              obviously-loading placeholder here instead of an empty
              0-height div that looks identical to "there's no Google option
              at all" — the divider just below it would otherwise be the
              only sign this block exists. */}
          <div className="relative flex min-h-[40px] items-center justify-center">
            <div ref={googleButtonRef} className="flex justify-center" />
            {!googleScriptLoaded && !googleError && (
              <div className="absolute inset-0 h-10 w-full max-w-[320px] animate-pulse rounded-md bg-slate-200 dark:bg-neutral-800" />
            )}
          </div>
          {googleError && <p className="text-sm text-rose-600 dark:text-rose-400">{googleError}</p>}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.signupOrDivider}</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
          </div>
        </div>
      )}

      <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
            tab === "signup"
              ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t.testimonialSignupTab}
        </button>
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
            tab === "login"
              ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t.testimonialLoginTab}
        </button>
      </div>

      {tab === "signup" ? (
        <form
          action={accountType === "business" ? businessSignupAction : signupAction}
          className="space-y-3"
        >
          {/* Honeypot: hidden from real visitors, often filled in by bots. */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="visitor-signup-website">Leave this field blank</label>
            <input id="visitor-signup-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="renderedAt" value={renderedAt} />

          {/* User vs. business — a real account-type choice (VISITOR vs.
              PARTNER, see this component's own top comment), not just which
              fields show. Login has no equivalent toggle: an existing
              account's type is already fixed, so loginAction below accepts
              either role as-is. */}
          <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setAccountType("user")}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
                accountType === "user"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {t.testimonialAccountTypeUser}
            </button>
            <button
              type="button"
              onClick={() => setAccountType("business")}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium transition-colors ${
                accountType === "business"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {t.testimonialAccountTypeBusiness}
            </button>
          </div>

          {accountType === "business" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldGroup label={t.testimonialCompanyLabel} htmlFor="visitor-signup-company" required>
                <Input
                  id="visitor-signup-company"
                  name="companyName"
                  required
                  placeholder={t.testimonialCompanyPlaceholder}
                  className="text-base"
                />
              </FieldGroup>
              <FieldGroup label={t.testimonialPositionLabel} htmlFor="visitor-signup-title" required>
                <Input
                  id="visitor-signup-title"
                  name="title"
                  required
                  placeholder={t.testimonialPositionPlaceholder}
                  className="text-base"
                />
              </FieldGroup>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup label={t.signupNameLabel} htmlFor="visitor-signup-name" required>
              <Input id="visitor-signup-name" name="name" required placeholder={t.signupNamePlaceholder} className="text-base" />
            </FieldGroup>
            <FieldGroup label={t.signupPhoneLabel} htmlFor="visitor-signup-phone" required>
              <Input
                id="visitor-signup-phone"
                name="phone"
                type="tel"
                required
                placeholder={t.signupPhonePlaceholder}
                className="text-base"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.signupPhoneHint}</p>
            </FieldGroup>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup label={t.signupEmailLabel} htmlFor="visitor-signup-email" required>
              <Input
                id="visitor-signup-email"
                name="email"
                type="email"
                required
                placeholder={t.signupEmailPlaceholder}
                className="text-base"
              />
            </FieldGroup>
            <FieldGroup label={t.signupPasswordLabel} htmlFor="visitor-signup-password" required>
              <Input id="visitor-signup-password" name="password" type="password" required minLength={8} className="text-base" />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.signupPasswordHint}</p>
            </FieldGroup>
          </div>

          {(() => {
            const activeState = accountType === "business" ? businessSignupState : signupState;
            return (
              activeState?.status === "error" && (
                <p className="text-sm text-rose-600 dark:text-rose-400">{t.testimonialAuthErrors[activeState.code]}</p>
              )
            );
          })()}

          <Button
            type="submit"
            disabled={accountType === "business" ? businessSignupPending : signupPending}
            className="h-11 w-full text-base"
          >
            {(accountType === "business" ? businessSignupPending : signupPending) ? t.signupSubmitting : t.signupSubmit}
          </Button>
          <button
            type="button"
            onClick={() => setTab("login")}
            className="w-full text-center text-sm font-medium text-petrol hover:underline dark:text-petrol-light"
          >
            {t.testimonialSwitchToLogin}
          </button>
        </form>
      ) : (
        <form action={loginAction} className="space-y-3">
          <FieldGroup label={t.signupEmailLabel} htmlFor="visitor-login-email" required>
            <Input
              id="visitor-login-email"
              name="email"
              type="email"
              required
              placeholder={t.signupEmailPlaceholder}
              className="text-base"
            />
          </FieldGroup>
          <FieldGroup label={t.signupPasswordLabel} htmlFor="visitor-login-password" required>
            <Input id="visitor-login-password" name="password" type="password" required className="text-base" />
          </FieldGroup>

          {loginState?.status === "error" && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{t.testimonialAuthErrors[loginState.code]}</p>
          )}

          <Button type="submit" disabled={loginPending} className="h-11 w-full text-base">
            {loginPending ? t.testimonialLoginSubmitting : t.testimonialLoginSubmit}
          </Button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className="w-full text-center text-sm font-medium text-petrol hover:underline dark:text-petrol-light"
          >
            {t.testimonialSwitchToSignup}
          </button>
        </form>
      )}
    </div>
  );
}
