"use client";

import { useActionState, useState } from "react";
import { updateWhatsAppSettings } from "@/app/actions/settings";
import { FieldGroup, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/components/ui/toast";

export type WhatsAppSettingsValues = {
  phoneNumberId: string;
  displayPhoneNumber: string | null;
};

// Settings → "WhatsApp" — new-lead pings to partners, via the official Meta
// WhatsApp Business Platform (Cloud API). Controlled inputs, not
// defaultValue-based — see EmailSettingsForm's own comment for why
// (React 19 resets a form's uncontrolled fields after any submission,
// success or failure, which would otherwise wipe the phone number ID too
// the moment a connection test fails). The access token field is never
// pre-filled with the real one (the server never sends it back down) —
// left blank on a save, the existing token (if any) is kept; typing a new
// one replaces it. Cleared after a successful save either way, same
// reasoning as EmailSettingsForm's own password field.
export function WhatsAppSettingsForm({ settings }: { settings: WhatsAppSettingsValues | null }) {
  const [state, formAction, pending] = useActionState(updateWhatsAppSettings, undefined);
  useActionToast(state, "Saved — connection verified.", { toastErrors: false });

  const [phoneNumberId, setPhoneNumberId] = useState(settings?.phoneNumberId ?? "");
  const [accessToken, setAccessToken] = useState("");

  // Updating state during render (not in an effect) when `state` has
  // changed since the last render is React's own documented way to sync
  // from it without an extra render round-trip — same pattern
  // partner-listing-form.tsx uses for its own post-save sync.
  const [lastSyncedState, setLastSyncedState] = useState(state);
  if (state !== lastSyncedState) {
    setLastSyncedState(state);
    if (state && "success" in state) setAccessToken("");
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Phone number ID" htmlFor="phoneNumberId" required>
          <Input
            id="phoneNumberId"
            name="phoneNumberId"
            required
            value={phoneNumberId}
            onChange={(event) => setPhoneNumberId(event.target.value)}
            autoComplete="off"
          />
        </FieldGroup>
        <FieldGroup label="Access token" htmlFor="accessToken">
          <Input
            id="accessToken"
            name="accessToken"
            type="password"
            autoComplete="off"
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            placeholder={settings ? "•••••••• (unchanged)" : ""}
          />
        </FieldGroup>
      </div>

      {settings?.displayPhoneNumber && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Connected: <strong>{settings.displayPhoneNumber}</strong>
        </p>
      )}

      {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      <p className="text-xs text-slate-400">
        Saving confirms the phone number ID and access token actually match with Meta before storing anything — nothing is
        saved if that fails. From Meta App Dashboard → WhatsApp → API Setup — see the README&apos;s WhatsApp notifications
        section for the full setup and the message template a partner ping needs.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "Connecting…" : "Save"}
      </Button>
    </form>
  );
}
