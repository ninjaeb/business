"use client";

import { useActionState, useEffect, useState } from "react";
import { loginVisitor, registerVisitor } from "@/app/actions/visitor-auth";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input } from "@/components/ui/field";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";

// The account gate in front of TestimonialForm (see WriteTestimonialButton,
// which renders this instead of the testimonial form until onAuthenticated
// fires). Two tabs sharing one honeypot/render-timing shape as every other
// public form in this app (see submitDirectoryTestimonial's own comment) —
// registerVisitor/loginVisitor never redirect, so switching tabs or
// succeeding never navigates away from wherever this dialog is already
// open.
export function TestimonialAuthForm({
  locale,
  onAuthenticated,
}: {
  locale: DirectoryLocale;
  onAuthenticated: (name: string) => void;
}) {
  const t = DIRECTORY_STRINGS[locale];
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [signupState, signupAction, signupPending] = useActionState(registerVisitor, undefined);
  const [loginState, loginAction, loginPending] = useActionState(loginVisitor, undefined);
  const [renderedAt] = useState(() => Date.now());

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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.testimonialAuthHeading}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.testimonialAuthIntro}</p>
      </div>

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
