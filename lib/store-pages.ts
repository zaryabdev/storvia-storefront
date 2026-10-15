// The merchant's store pages (About, Contact, Returns & exchanges, FAQ).
// Admin returns only live pages; everything is re-checked here so an older or
// misbehaving Admin shows nothing instead of breaking. Pure: no React, no fetches.

export type StorePageKind = "about" | "contact" | "returns" | "faq";

export type FaqItem = { question: string; answer: string };

export type StorePageContent =
    | { kind: "about" | "contact" | "returns"; body: string }
    | { kind: "faq"; items: FaqItem[] };

/** In footer order. `title` is both the page heading and the footer link text. */
export const STORE_PAGES: ReadonlyArray<{ kind: StorePageKind; title: string; href: string }> = [
    { kind: "about", title: "About", href: "/about" },
    { kind: "contact", title: "Contact", href: "/contact" },
    { kind: "returns", title: "Returns & exchanges", href: "/returns" },
    { kind: "faq", title: "FAQ", href: "/faq" },
];

// Admin's limits, in code points.
const BODY_LIMITS = { about: 5000, contact: 2000, returns: 5000 } as const;
const MAX_QUESTION = 200;
const MAX_ANSWER = 1000;
const MAX_ITEMS = 20;
const DESCRIPTION_LENGTH = 155;

const cap = (value: string, max: number) => Array.from(value).slice(0, max).join("").trim();

/** The pages whose flag is exactly `true`, in footer order. */
export function readLivePages(store: unknown) {
    if (typeof store !== "object" || store === null) return [];

    const pages = (store as { pages?: unknown }).pages;
    if (typeof pages !== "object" || pages === null) return [];

    return STORE_PAGES.filter(({ kind }) => (pages as Record<string, unknown>)[kind] === true);
}

/** Admin's `GET /pages/{kind}` body as a page, or null when it isn't a valid live page. */
export function parseStorePage(kind: StorePageKind, data: unknown): StorePageContent | null {
    if (typeof data !== "object" || data === null) return null;

    const record = data as Record<string, unknown>;
    if (record.kind !== kind) return null;

    if (kind === "faq") {
        if (!Array.isArray(record.items)) return null;

        const items: FaqItem[] = [];

        for (const item of record.items) {
            if (items.length === MAX_ITEMS) break;
            if (typeof item !== "object" || item === null) continue;

            const { question, answer } = item as Record<string, unknown>;
            if (typeof question !== "string" || typeof answer !== "string") continue;

            const q = cap(question, MAX_QUESTION);
            const a = cap(answer, MAX_ANSWER);
            if (q && a) items.push({ question: q, answer: a });
        }

        return items.length > 0 ? { kind, items } : null;
    }

    if (typeof record.body !== "string") return null;

    const body = cap(record.body, BODY_LIMITS[kind]);

    return body ? { kind, body } : null;
}

/** A blank line starts a new paragraph; single line breaks stay inside one. */
export function splitParagraphs(text: string): string[] {
    return text
        .replace(/\r\n?/g, "\n")
        .split(/\n[^\S\n]*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

/** Plain-text meta description: the first ~155 characters of the page (FAQ: the first question). */
export function pageDescription(page: StorePageContent): string {
    const text = page.kind === "faq" ? page.items[0].question : page.body;

    return Array.from(text.replace(/\s+/g, " ").trim())
        .slice(0, DESCRIPTION_LENGTH)
        .join("")
        .trim();
}
