"use client";

import { MessageCircle } from "lucide-react";

import { trackContact } from "@/lib/pixels";

/** The Contact page's WhatsApp button. One Contact pixel event per tap, no payload (like the float button). */
const ContactWhatsAppButton = ({ href }: { href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp (opens in a new tab)"
        onClick={() => trackContact()}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-body font-semibold text-foreground transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
    >
        Chat on WhatsApp
        <MessageCircle size={20} aria-hidden="true" />
    </a>
);

export default ContactWhatsAppButton;
