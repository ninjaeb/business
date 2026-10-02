"use client";

import { useTransition } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { markDirectoryLeadContacted } from "@/app/actions/directory";
import { whatsAppUrl } from "@/lib/format";

// Clicking any of these is a real contact attempt, same as sending a reply
// through the form below — so it advances the lead's status the same way
// (see markDirectoryLeadContacted), fire-and-forget: the mailto:/tel:/
// wa.me navigation itself is what the partner actually clicked for, this
// just rides along with it rather than gating it.
export function DirectoryLeadContactLinks({
  leadId,
  email,
  phone,
  whatsAppMessage,
}: {
  leadId: string;
  email: string;
  phone: string | null;
  whatsAppMessage: string;
}) {
  const [, startTransition] = useTransition();

  function markContacted() {
    startTransition(() => markDirectoryLeadContacted(leadId));
  }

  return (
    <>
      <a
        href={`mailto:${email}`}
        onClick={markContacted}
        className="inline-flex items-center gap-1 hover:text-petrol dark:hover:text-petrol-light"
      >
        <Mail className="h-3.5 w-3.5" />
        {email}
      </a>
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={markContacted}
          className="inline-flex items-center gap-1 hover:text-petrol dark:hover:text-petrol-light"
        >
          <Phone className="h-3.5 w-3.5" />
          {phone}
        </a>
      )}
      {phone && (
        <a
          href={whatsAppUrl(phone, whatsAppMessage)}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={markContacted}
          className="inline-flex items-center gap-1 hover:text-petrol dark:hover:text-petrol-light"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      )}
    </>
  );
}
