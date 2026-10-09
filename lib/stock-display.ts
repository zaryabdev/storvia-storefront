// Admin's ready-made stock message (`stockDisplay` on the public product
// reads; the rules live in Admin's lib/stock.ts). Display only: the
// Storefront never computes thresholds or modes itself.

export type StockDisplay = { kind: "low" | "count"; quantity: number };

// The value to render, or null for null, missing (older Admin) or anything
// malformed (not an object, unknown kind, quantity not a positive integer).
export function readStockDisplay(value: unknown): StockDisplay | null {
    if (typeof value !== "object" || value === null) return null;

    const { kind, quantity } = value as Record<string, unknown>;

    if (kind !== "low" && kind !== "count") return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return null;

    return { kind, quantity };
}
