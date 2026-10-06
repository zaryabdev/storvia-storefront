// Sale-price display rules (display only: carts, checkout and orders always
// use the real `price`). Money arrives as decimal strings, so the comparison
// and the discount percentage are exact integer math on scaled BigInts; they
// never go through floats.

const DECIMAL = /^\d+(\.\d+)?$/;

// "2600.50" -> { digits: 260050n, scale: 2 }
function parse(value: unknown): { digits: bigint; scale: number } | null {
    const text = typeof value === "number" && Number.isFinite(value) ? String(value) : typeof value === "string" ? value.trim() : "";

    if (!DECIMAL.test(text)) {
        return null;
    }

    const [whole, fraction = ""] = text.split(".");

    return { digits: BigInt(whole + fraction), scale: fraction.length };
}

export interface Sale {
    /** Whole percent off, rounded DOWN so it never overstates the discount (1–99). */
    percentOff: number;
}

// A sale exists only when `compareAtPrice` is a valid decimal strictly greater
// than `price`; anything else (missing, null, equal, lower, garbage) is no sale.
export function getSale(price: unknown, compareAtPrice: unknown): Sale | null {
    const p = parse(price);
    const c = parse(compareAtPrice);

    if (!p || !c) {
        return null;
    }

    const scale = Math.max(p.scale, c.scale);
    const pScaled = p.digits * pow10(scale - p.scale);
    const cScaled = c.digits * pow10(scale - c.scale);

    if (pScaled <= BigInt(0) || cScaled <= pScaled) {
        return null;
    }

    // floor((c - p) * 100 / c): BigInt division truncates, and all values are positive.
    const percentOff = Number(((cScaled - pScaled) * BigInt(100)) / cScaled);

    // A sub-1% difference rounds down to 0: show the crossed-out price but no badge.
    return { percentOff };
}

function pow10(n: number): bigint {
    return BigInt("1" + "0".repeat(n));
}

// Same format as <Currency noDecimals>: "Rs 2,200" (for screen-reader text).
const formatter = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

export const formatPkr = (value: unknown) => formatter.format(Number(value));
