// Delivery display rules for the cart, checkout and confirmation. Display
// only: Admin's /cod computes the real fee (the client never sends one).
// Money arrives as decimal strings, so sums, comparisons and differences are
// exact integer math on scaled BigInts; they never go through floats. Numbers
// appear only when formatting for display.

import { OTHER_CITY, PAKISTAN_CITIES } from "./pakistan-cities";

// GET /api/{storeId}/delivery (Admin), or the fallback when it can't be read.
export interface DeliveryInfo {
    /** false = the endpoint failed (fallback below). */
    available: boolean;
    area: "ALL_PAKISTAN" | "SELECTED_CITIES" | string;
    defaultFee: string | null;
    freeDeliveryThreshold: string | null;
    daysMin: number | null;
    daysMax: number | null;
    /** "2–3", or null when unknown. */
    daysLabel: string | null;
    /** fee null = unknown (fallback). */
    cities: Array<{ key: string; name: string; fee: string | null }>;
    otherCityAllowed: boolean;
    lockedCityKey: string | null;
}

// Deploy-order safety: the 12 cities plus Other, fee "Calculated at checkout",
// no nudge, no delivery days.
export const FALLBACK_DELIVERY: DeliveryInfo = {
    available: false,
    area: "ALL_PAKISTAN",
    defaultFee: null,
    freeDeliveryThreshold: null,
    daysMin: null,
    daysMax: null,
    daysLabel: null,
    cities: PAKISTAN_CITIES.map(({ key, name }) => ({ key, name, fee: null })),
    otherCityAllowed: true,
    lockedCityKey: null,
};

// ---- exact decimal-string math ----

const DECIMAL = /^\d+(\.\d+)?$/;

type Amount = { digits: bigint; scale: number };

function parse(value: unknown): Amount | null {
    const text =
        typeof value === "number" && Number.isFinite(value) && value >= 0
            ? String(value)
            : typeof value === "string"
              ? value.trim()
              : "";

    if (!DECIMAL.test(text)) return null;

    const [whole, fraction = ""] = text.split(".");

    return { digits: BigInt(whole + fraction), scale: fraction.length };
}

const pow10 = (n: number) => BigInt("1" + "0".repeat(n));

function align(a: Amount, b: Amount): [bigint, bigint, number] {
    const scale = Math.max(a.scale, b.scale);

    return [a.digits * pow10(scale - a.scale), b.digits * pow10(scale - b.scale), scale];
}

function toText({ digits, scale }: Amount): string {
    const negative = digits < BigInt(0);
    const raw = (negative ? -digits : digits).toString().padStart(scale + 1, "0");
    const whole = raw.slice(0, raw.length - scale);
    const fraction = raw.slice(raw.length - scale).replace(/0+$/, "");

    return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

const isZero = (value: string | null) => {
    const amount = parse(value);

    return amount !== null && amount.digits === BigInt(0);
};

/** a >= b, exactly. */
function gte(a: string, b: string): boolean {
    const pa = parse(a);
    const pb = parse(b);
    if (!pa || !pb) return false;
    const [x, y] = align(pa, pb);

    return x >= y;
}

/** a + b as a decimal string (invalid parts count as 0). */
export function addAmounts(a: string, b: string): string {
    const [x, y, scale] = align(parse(a) ?? { digits: BigInt(0), scale: 0 }, parse(b) ?? { digits: BigInt(0), scale: 0 });

    return toText({ digits: x + y, scale });
}

/** Items subtotal: sum of price × quantity, as a decimal string. */
export function itemsSubtotal(items: Array<{ price: string | number; quantity: number }>): string {
    let sum: Amount = { digits: BigInt(0), scale: 0 };

    for (const { price, quantity } of items) {
        const p = parse(price);
        if (!p || !Number.isInteger(quantity) || quantity < 0) continue;
        const [x, y, scale] = align(sum, { digits: p.digits * BigInt(quantity), scale: p.scale });
        sum = { digits: x + y, scale };
    }

    return toText(sum);
}

// ---- delivery rules (mirror Admin's lib/delivery.ts) ----

/** The fee for a chosen city before the threshold; null = unknown or not served. */
function baseFee(delivery: DeliveryInfo, cityKey: string): string | null {
    if (cityKey === OTHER_CITY.key) return delivery.otherCityAllowed ? delivery.defaultFee : null;

    return delivery.cities.find((city) => city.key === cityKey)?.fee ?? null;
}

const thresholdMet = (delivery: DeliveryInfo, subtotal: string) =>
    delivery.available &&
    delivery.freeDeliveryThreshold !== null &&
    gte(subtotal, delivery.freeDeliveryThreshold);

/** True when every city a customer can pick is free (fee 0, no override above 0). */
function everywhereFree(delivery: DeliveryInfo): boolean {
    return (
        delivery.available &&
        delivery.cities.every((city) => isZero(city.fee)) &&
        (!delivery.otherCityAllowed || isZero(delivery.defaultFee))
    );
}

/** The fee for an order to `cityKey` (threshold applied), or null when unknown. */
export function deliveryFeeFor(delivery: DeliveryInfo, cityKey: string | null, subtotal: string): string | null {
    if (!delivery.available || !cityKey) return null;

    const fee = baseFee(delivery, cityKey);
    if (fee === null) return null;

    return thresholdMet(delivery, subtotal) ? "0" : fee;
}

export type DeliveryLine =
    | { kind: "free" }
    | { kind: "fee"; fee: string }
    | { kind: "calculated" };

/**
 * The delivery line before a city is known (the cart), or for a chosen city
 * (checkout). "Free" when everything is free or the threshold is met; the
 * exact fee for a locked or chosen city; otherwise "Calculated at checkout".
 */
export function deliveryLine(delivery: DeliveryInfo, subtotal: string, cityKey: string | null = null): DeliveryLine {
    if (!delivery.available) return { kind: "calculated" };
    if (everywhereFree(delivery) || thresholdMet(delivery, subtotal)) return { kind: "free" };

    const fee = deliveryFeeFor(delivery, cityKey ?? delivery.lockedCityKey, subtotal);

    if (fee === null) return { kind: "calculated" };

    return isZero(fee) ? { kind: "free" } : { kind: "fee", fee };
}

export type DeliveryNudge = { kind: "remaining"; amount: string } | { kind: "met" };

/**
 * "Add Rs X more for free delivery" when a threshold is set, the subtotal is
 * below it and the applicable fee is above 0 (the chosen/locked city's fee;
 * with no city yet, any non-free city counts). "You've got free delivery!"
 * once the threshold is met. null = nothing to show (or no data).
 */
export function freeDeliveryNudge(delivery: DeliveryInfo, subtotal: string, cityKey: string | null = null): DeliveryNudge | null {
    if (!delivery.available || delivery.freeDeliveryThreshold === null) return null;
    if (thresholdMet(delivery, subtotal)) return { kind: "met" };

    const key = cityKey ?? delivery.lockedCityKey;
    const fee = key ? baseFee(delivery, key) : null;
    const charged = key ? fee !== null && !isZero(fee) : !everywhereFree(delivery);

    if (!charged) return null;

    const t = parse(delivery.freeDeliveryThreshold);
    const s = parse(subtotal);
    if (!t || !s) return null;

    const [tx, sx, scale] = align(t, s);

    return { kind: "remaining", amount: toText({ digits: tx - sx, scale }) };
}

/** "Rs 3,000", or "Rs 0.50" when the amount has a fraction. Display only. */
export function formatRupees(value: string): string {
    const amount = parse(value);
    const fractional = amount !== null && amount.digits % pow10(amount.scale) !== BigInt(0);

    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: fractional ? 2 : 0,
        maximumFractionDigits: fractional ? 2 : 0,
    }).format(Number(value));
}

/** "Delivery in 2–3 days" / "Delivery in 1 day"; null when unknown. */
export function deliveryDaysText(delivery: DeliveryInfo): string | null {
    if (!delivery.daysLabel) return null;

    return `Delivery in ${delivery.daysLabel} ${delivery.daysLabel === "1" ? "day" : "days"}`;
}
