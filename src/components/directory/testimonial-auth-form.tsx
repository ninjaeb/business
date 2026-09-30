"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginVisitor, registerVisitor, signInVisitorWithGoogle } from "@/app/actions/visitor-auth";
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
// registerVisitor/loginVisitor never redirect, so switching tabs or
// succeeding never navigates away from wherever this dialog is already
// open. The Google button above them follows the same "never navigate away"
// rule via a different mechanism (see the effect below).
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
  const [signupState, signupAction, signupPending] = useActionState(registerVisitor, undefined);
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
          />
          <div ref={googleButtonRef} className="flex justify-center" />
          {googleError && <p className="text-sm text-rose-600 dark:text-rose-400">{googleError}</p>}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.signupOrDivider}</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
          </div>
        </div>
      )}

      <div className="flex gap-1 rounded-md bg-slate-100 p-1 text-sm dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
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
          className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
            tab === "login"
              ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t.testimonialLoginTab}
        </button>
      </div>

      {tab === "signup" ? (
        <form action={signupAction} className="space-y-3">
          {/* Honeypot: hidden from real visitors, often filled in by bots. */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="visitor-signup-website">Leave this field blank</label>
            <input id="visitor-signup-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="renderedAt" value={renderedAt} />

          <FieldGroup label={t.signupNameLabel} htmlFor="visitor-signup-name" required>
            <Input id="visitor-signup-name" name="name" required placeholder={t.signupNamePlaceholder} className="text-base" />
          </FieldGroup>
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
          <FieldGroup label={t.signupPasswordLabel} htmlFor="visitor-signup-password" required>
            <Input id="visitor-signup-password" name="password" type="password" required minLength={8} className="text-base" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.signupPasswordHint}</p>
          </FieldGroup>

          {signupState?.status === "error" && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{t.testimonialAuthErrors[signupState.code]}</p>
          )}

          <Button type="submit" disabled={signupPending} className="h-11 w-full text-base">
            {signupPending ? t.signupSubmitting : t.signupSubmit}
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
