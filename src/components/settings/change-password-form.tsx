"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/actions/profile";
import { Label, Input, RequiredMark } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/components/ui/toast";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_DASHBOARD_STRINGS } from "@/lib/portal-dashboard-i18n";

export function ChangePasswordForm({ locale }: { locale: DirectoryLocale }) {
  const t = PORTAL_DASHBOARD_STRINGS[locale];
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  useActionToast(state, t.passwordUpdatedToast, { toastErrors: false });

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="currentPassword">
          {t.currentPasswordLabel}
          <RequiredMark />
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <Label htmlFor="newPassword">
          {t.newPasswordLabel}
          <RequiredMark />
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? t.updatingPasswordCta : t.updatePasswordCta}
      </Button>
    </form>
  );
}
