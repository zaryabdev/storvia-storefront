// The product description from Admin's single-product read
// (`GET /products/{id}`; the list reads leave it out). Plain text, LF line
// breaks, at most 5,000 code points. Re-checked here so an older or
// misbehaving Admin shows nothing instead of breaking. Pure: no React, no fetches.

const MAX_LENGTH = 5000;
const META_LENGTH = 155;

/** The description to show, or null for missing, null, a non-string or blank text. */
export function readProductDescription(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const text = value.trim();
    if (!text) return null;

    return Array.from(text).slice(0, MAX_LENGTH).join("");
}

/** Plain-text meta description: the first 155 characters, whitespace collapsed. */
export function productMetaDescription(description: string): string {
    return Array.from(description.replace(/\s+/g, " ").trim())
        .slice(0, META_LENGTH)
        .join("")
        .trim();
}
