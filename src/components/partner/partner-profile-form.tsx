"use client";

import { useActionState, useSyncExternalStore } from "react";
import { updatePartnerProfile } from "@/app/actions/partner-profile";
import { Label, Input, RequiredMark, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PHONE_FORMAT_HINT } from "@/lib/phone";
import { DEFAULT_PARTNER_CURRENCY } from "@/lib/format";
import { useActionToast } from "@/components/ui/toast";

// A fixed list of IANA zone names, the same in every environment (unlike
// the *current* zone below, it doesn't depend on where the browser
// actually is) — safe to compute once, and identically on the server and
// the client, so it can never cause a hydration mismatch.
const TIMEZONES = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

// Unlike TIMEZONES, this can't be Intl.supportedValuesOf("currency") — that
// list isn't guaranteed identical between Node's ICU data (server render)
// and the browser's own (client render); Sierra Leone's code alone renders
// as "SLL" on one and "SLE" on the other, which is a real hydration
// mismatch, not a hypothetical one. A short, hand-picked list sidesteps
// that entirely, and doubles as a much more usable dropdown than every
// ISO 4217 code for a directory whose partners are all in or trading with
// this one region.
const CURRENCIES = ["MYR", "SGD", "IDR", "THB", "PHP", "VND", "BND", "CNY", "HKD", "TWD", "JPY", "KRW", "INR", "GBP", "AUD", "USD", "EUR"];

// The browser's own region only ever narrows down to a currency for the
// handful of countries this directory actually does business in — anything
// else (or a region Intl can't resolve) falls back to MYR, this directory's
// home-market currency, same spirit as the account-wide Settings.currency
// default (src/lib/settings.ts) but scoped to one partner's own CRM values.
const CURRENCY_BY_REGION: Record<string, string> = {
  MY: "MYR",
  SG: "SGD",
  ID: "IDR",
  TH: "THB",
  PH: "PHP",
  VN: "VND",
  BN: "BND",
  CN: "CNY",
  HK: "HKD",
  TW: "TWD",
  JP: "JPY",
  KR: "KRW",
  IN: "INR",
  GB: "GBP",
  AU: "AUD",
  US: "USD",
};

function detectBrowserCurrency(): string {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return (region && CURRENCY_BY_REGION[region]) || DEFAULT_PARTNER_CURRENCY;
  } catch {
    return DEFAULT_PARTNER_CURRENCY;
  }
}

export function PartnerProfileForm({
  name,
  companyName,
  email,
  title,
  phone,
  timezone,
  currency,
}: {
  name: string;
  companyName: string | null;
  email: string;
  title: string | null;
  phone: string | null;
  timezone: string | null;
  currency: string | null;
}) {
  const [state, formAction, pending] = useActionState(updatePartnerProfile, undefined);
  useActionToast(state, "Profile updated.", { toastErrors: false });

  // After a successful save, the action's own returned value is the
  // source of truth for what's now saved — not the `timezone` prop.
  // Next's action-triggered page refresh (revalidatePath) resolves that
  // prop too late to rely on here: it can still hand the client a render
  // generated just before this mutation landed, one save behind.
  const savedTimezone = state && "success" in state ? state.timezone : timezone;

  // The browser's own timezone never changes at runtime, so this needs no
  // real subscription, just a way to read it after hydration without the
  // server (which has no browser timezone to agree with) and client
  // disagreeing about the very first render. Only ever used as a fallback
  // (see timezoneDefault below): a zone the partner's already saved is
  // never silently overwritten by it.
  const detectedTimezone = useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "",
  );
  const timezoneDefault = savedTimezone || detectedTimezone;

  // Same fallback shape as timezone above, but detectBrowserCurrency
  // already resolves to a real currency (never "") — there's no IANA
  // zone name it could get wrong, just a best-guess mapping that always
  // has MYR to fall back on.
  const savedCurrency = state && "success" in state ? state.currency : currency;
  const detectedCurrency = useSyncExternalStore(
    () => () => {},
    detectBrowserCurrency,
    () => DEFAULT_PARTNER_CURRENCY,
  );
  const currencyDefault = savedCurrency || detectedCurrency;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">
          Name
          <RequiredMark />
        </Label>
        <Input id="name" name="name" required defaultValue={name} />
      </div>

      <div>
        <Label htmlFor="companyName">
          Company name
          <RequiredMark />
        </Label>
        <Input id="companyName" name="companyName" required defaultValue={companyName ?? ""} />
      </div>

      <div>
        <Label htmlFor="email">
          Email
          <RequiredMark />
        </Label>
        <Input id="email" name="email" type="email" required defaultValue={email} />
        <p className="mt-1 text-xs text-slate-400">Used to sign in, and where nothing else applies.</p>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={title ?? ""} />
      </div>

      <div>
        <Label htmlFor="phone">
          Contact phone
          <RequiredMark />
        </Label>
        <Input id="phone" name="phone" type="tel" required defaultValue={phone ?? ""} placeholder="+60 12 345 6789" />
        <p className="mt-1 text-xs text-slate-400">
          {PHONE_FORMAT_HINT} Used to WhatsApp you when a directory inquiry comes in — never shown on your public
          listing, and never given to visitors.
        </p>
      </div>

      <div>
        <Label htmlFor="timezone">Timezone</Label>
        {/* Uncontrolled (defaultValue, not value+onChange) — matching
            Name/Company name/etc. above, and deliberately so: a
            React 19 action resets its <form> on a successful submit,
            reverting every field to its default. An uncontrolled field's
            default is a real "selected" attribute baked into the DOM, so
            that reset just reaffirms the same value; a controlled select's
            "selected" option only ever lives in React's virtual value, so
            the same reset would silently blank it out instead. Keying on
            timezoneDefault forces a fresh mount — and a fresh default —
            whenever the true value changes (after a save, or once the
            browser's own zone resolves post-hydration). */}
        <Select key={timezoneDefault} id="timezone" name="timezone" defaultValue={timezoneDefault}>
          <option value="">Select a timezone…</option>
          {!TIMEZONES.includes(timezoneDefault) && timezoneDefault && (
            <option value={timezoneDefault}>{timezoneDefault}</option>
          )}
          {TIMEZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-400">
          Detected from your browser — correct it if you&apos;re somewhere else. Used to show visitors whether your
          listings are open right now.
        </p>
      </div>

      <div>
        <Label htmlFor="currency">Currency</Label>
        {/* Uncontrolled + keyed on currencyDefault, same reasoning as
            Timezone above. */}
        <Select key={currencyDefault} id="currency" name="currency" defaultValue={currencyDefault}>
          {!CURRENCIES.includes(currencyDefault) && (
            <option value={currencyDefault}>{currencyDefault}</option>
          )}
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-400">
          Guessed from your browser — correct it if you bill in something else. Used for deal and lead values across
          your CRM.
        </p>
      </div>

      {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
      >
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
