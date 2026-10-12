"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PAYMENT_TEXT } from "@/lib/payment-guides";
import { cn } from "@/lib/utils";

// The Clipboard API needs a secure context and permission; older or in-app
// browsers lack it. Fall back to a hidden textarea + execCommand("copy").
async function copyText(value: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return true;
        }
    } catch {
        // fall through to the fallback
    }

    try {
        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "0";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        area.setSelectionRange(0, value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok;
    } catch {
        return false;
    }
}

/**
 * Copies `value` (already in the form to paste, e.g. an IBAN without spaces).
 * `what` names it for screen readers: aria-label "Copy IBAN", then "IBAN
 * copied" announced politely. Visible feedback: "Copied" for 2 seconds, or a
 * hint to copy by hand when copying isn't possible.
 */
export default function CopyButton({
    value,
    what,
    className,
}: {
    value: string;
    what: string;
    className?: string;
}) {
    const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
    const timer = useRef<number>();

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const onClick = async () => {
        const ok = await copyText(value);
        setState(ok ? "copied" : "failed");
        window.clearTimeout(timer.current);
        if (ok) timer.current = window.setTimeout(() => setState("idle"), 2000);
    };

    return (
        <div className={cn("shrink-0", className)}>
            <button
                type="button"
                onClick={onClick}
                aria-label={PAYMENT_TEXT.copyLabel(what)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-control border border-border bg-surface px-3 text-meta font-medium text-foreground hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
                {state === "copied" ? (
                    <Check size={16} aria-hidden className="text-success" />
                ) : (
                    <Copy size={16} aria-hidden />
                )}
                <span aria-hidden>{state === "copied" ? PAYMENT_TEXT.copied : PAYMENT_TEXT.copy}</span>
            </button>
            <span role="status" aria-live="polite" className="sr-only">
                {state === "copied" ? PAYMENT_TEXT.copiedAnnouncement(what) : ""}
            </span>
            {state === "failed" && (
                <p role="alert" className="mt-1 max-w-[12rem] text-meta text-danger">
                    {PAYMENT_TEXT.copyFailed}
                </p>
            )}
        </div>
    );
}
