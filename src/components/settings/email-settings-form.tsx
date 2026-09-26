"use client";

import { useActionState, useState } from "react";
import { updateEmailSettings } from "@/app/actions/settings";
import { FieldGroup, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/components/ui/toast";

export type EmailSettingsValues = {
  host: string;
  port: number;
  username: string;
  fromName: string;
  fromEmail: string;
  hasPassword: boolean;
};

// Settings → "Email (SMTP)" — new-lead alerts to partners, partner replies
// to leads. Controlled inputs, not defaultValue-based: React 19 resets a
// form's uncontrolled fields back to their defaultValue after any action
// submission, success or failure — with defaultValue this would wipe out
// everything an admin typed the moment a connection test fails, not just
// the intentionally-cleared password. The password field is never
// pre-filled with the real one (the server never sends it back down) —
// left blank on a save, the existing password (if any) is kept; typing a
// new one replaces it. Cleared after a successful save either way, same
// reasoning as ChangePasswordForm: nothing useful to keep in it once it's
// landed.
export function EmailSettingsForm({ settings }: { settings: EmailSettingsValues | null }) {
  const [state, formAction, pending] = useActionState(updateEmailSettings, undefined);
  useActionToast(state, "Saved — connection verified.", { toastErrors: false });

  const [host, setHost] = useState(settings?.host ?? "");
  const [port, setPort] = useState(settings?.port ?? 587);
  const [username, setUsername] = useState(settings?.username ?? "");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState(settings?.fromName ?? "");
  const [fromEmail, setFromEmail] = useState(settings?.fromEmail ?? "");

  // Updating state during render (not in an effect) when `state` has
  // changed since the last render is React's own documented way to sync
  // from it without an extra render round-trip — same pattern
  // partner-listing-form.tsx uses for its own post-save sync.
  const [lastSyncedState, setLastSyncedState] = useState(state);
  if (state !== lastSyncedState) {
    setLastSyncedState(state);
    if (state && "success" in state) setPassword("");
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="SMTP host" htmlFor="host" required>
          <Input id="host" name="host" required value={host} onChange={(event) => setHost(event.target.value)} placeholder="smtp.example.com" />
        </FieldGroup>
        <FieldGroup label="Port" htmlFor="port" required>
          <Input
            id="port"
            name="port"
            type="number"
            required
            value={port}
            onChange={(event) => setPort(Number(event.target.value))}
          />
        </FieldGroup>
        <FieldGroup label="Username" htmlFor="username">
          <Input id="username" name="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="off" />
        </FieldGroup>
        <FieldGroup label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={settings?.hasPassword ? "•••••••• (unchanged)" : ""}
          />
        </FieldGroup>
        <FieldGroup label="From name" htmlFor="fromName">
          <Input id="fromName" name="fromName" value={fromName} onChange={(event) => setFromName(event.target.value)} placeholder="Gotka Business Directory" />
        </FieldGroup>
        <FieldGroup label="From address" htmlFor="fromEmail" required>
          <Input
            id="fromEmail"
            name="fromEmail"
            type="email"
            required
            value={fromEmail}
            onChange={(event) => setFromEmail(event.target.value)}
            placeholder="noreply@example.com"
          />
        </FieldGroup>
      </div>

      {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      <p className="text-xs text-slate-400">
        Saving connects to the server and confirms login before storing anything — nothing is saved if that fails.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "Connecting…" : "Save"}
      </Button>
    </form>
  );
}
