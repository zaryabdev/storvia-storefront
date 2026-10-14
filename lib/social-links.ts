// The merchant's social profile links for the footer. Admin stores only
// canonical URLs, so anything else is ignored (an older Admin omits the field;
// a malformed value shows nothing). Pure: no React, no fetches.

const MAX_LENGTH = 300;

const NETWORKS = [
    { key: "instagram", label: "Instagram", prefix: "https://www.instagram.com/" },
    { key: "tiktok", label: "TikTok", prefix: "https://www.tiktok.com/@" },
    { key: "facebook", label: "Facebook", prefix: "https://www.facebook.com/" },
] as const;

export type SocialLink = { key: string; label: string; href: string };

/** The set, valid networks in a fixed order: Instagram, TikTok, Facebook. */
export function readSocialLinks(store: unknown): SocialLink[] {
    if (typeof store !== "object" || store === null) return [];

    const links = (store as { socialLinks?: unknown }).socialLinks;
    if (typeof links !== "object" || links === null) return [];

    const result: SocialLink[] = [];

    for (const { key, label, prefix } of NETWORKS) {
        const value = (links as Record<string, unknown>)[key];

        if (
            typeof value === "string" &&
            value.length > prefix.length &&
            value.length <= MAX_LENGTH &&
            value.startsWith(prefix) &&
            !/\s/.test(value)
        ) {
            result.push({ key, label, href: value });
        }
    }

    return result;
}
