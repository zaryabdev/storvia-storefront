// Guest order tracking: Admin's public POST /api/{storeId}/track-order.
// Display only; money stays decimal strings (formatted with formatRupees).

import { PAYMENT_TEXT } from "./payment-guides";

export type TrackedStatus = "DRAFT" | "CONFIRMED" | "DELIVERED" | "CANCELED";

export interface TrackedOrder {
    trackingId: string;
    status: TrackedStatus;
    createdAt: string;
    confirmedAt: string | null;
    items: Array<{
        name: string;
        size: string | null;
        color: string | null;
        quantity: number;
        unitPrice: string;
        lineTotal: string;
    }>;
    subtotal: string;
    deliveryFee: string | null;
    total: string;
    currency: string;
    city: string;
    deliveryDays: string;
    /** Since bank transfer; null when an older Admin omits them. */
    paymentMethod: string | null;
    isPaid: boolean | null;
    /** An array only for an unpaid, not canceled BANK_TRANSFER order (may be []); else null. */
    paymentAccounts: unknown[] | null;
}

export type TrackResult =
    | { ok: true; order: TrackedOrder }
    | { ok: false; message: string };

export const TRACK_GENERIC_ERROR = "Something went wrong. Please try again.";

const STATUSES: TrackedStatus[] = ["DRAFT", "CONFIRMED", "DELIVERED", "CANCELED"];

const isString = (v: unknown): v is string => typeof v === "string";
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === "string";

/** Minimal shape check; anything else counts as an unexpected body. */
function readOrder(body: unknown): TrackedOrder | null {
    const order = (body as { order?: Record<string, unknown> } | null)?.order;
    if (!order || typeof order !== "object") return null;

    const items = order.items;
    if (
        !isString(order.trackingId) ||
        !STATUSES.includes(order.status as TrackedStatus) ||
        !isString(order.createdAt) ||
        !isNullableString(order.confirmedAt ?? null) ||
        !Array.isArray(items) ||
        !isString(order.subtotal) ||
        !isString(order.total) ||
        !isNullableString(order.deliveryFee ?? null)
    ) {
        return null;
    }

    for (const item of items) {
        if (
            !item ||
            !isString(item.name) ||
            !isNullableString(item.size ?? null) ||
            !isNullableString(item.color ?? null) ||
            typeof item.quantity !== "number" ||
            !isString(item.lineTotal)
        ) {
            return null;
        }
    }

    return {
        trackingId: order.trackingId,
        status: order.status as TrackedStatus,
        createdAt: order.createdAt,
        confirmedAt: (order.confirmedAt as string | null | undefined) ?? null,
        items: items as TrackedOrder["items"],
        subtotal: order.subtotal,
        deliveryFee: (order.deliveryFee as string | null | undefined) ?? null,
        total: order.total,
        currency: isString(order.currency) ? order.currency : "PKR",
        city: isString(order.city) ? order.city : "",
        deliveryDays: isString(order.deliveryDays) ? order.deliveryDays : "",
        paymentMethod: isString(order.paymentMethod) ? order.paymentMethod : null,
        isPaid: typeof order.isPaid === "boolean" ? order.isPaid : null,
        paymentAccounts: Array.isArray(order.paymentAccounts) ? order.paymentAccounts : null,
    };
}

/** Never throws. The phone goes only in the POST body. */
export async function trackOrder(trackingId: string, phone: string, signal?: AbortSignal): Promise<TrackResult> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/track-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackingId, phone }),
            cache: "no-store",
            signal,
        });
        const body = await res.json().catch(() => null);

        if (res.ok) {
            const order = readOrder(body);

            return order ? { ok: true, order } : { ok: false, message: TRACK_GENERIC_ERROR };
        }

        if ((res.status === 404 || res.status === 400) && body && isString(body.message) && body.message) {
            return { ok: false, message: body.message };
        }

        return { ok: false, message: TRACK_GENERIC_ERROR };
    } catch {
        return { ok: false, message: TRACK_GENERIC_ERROR };
    }
}

/** "9 Oct 2026" in Pakistan time; "" for an unparseable date. */
export function formatPakistanDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

    return `${get("day")} ${get("month")} ${get("year")}`;
}

export const STATUS_TEXT: Record<TrackedStatus, string> = {
    DRAFT: "Order received — awaiting confirmation",
    CONFIRMED: "Confirmed — being prepared",
    DELIVERED: "Delivered",
    CANCELED: "This order was canceled. If you have questions, message the store on WhatsApp.",
};

/** Steps done out of Received → Confirmed → Delivered; 0 = no indicator. */
export const STEPS_DONE: Record<TrackedStatus, number> = {
    DRAFT: 1,
    CONFIRMED: 2,
    DELIVERED: 3,
    CANCELED: 0,
};

/**
 * The "Payment" line: "Cash on delivery", "Bank transfer · Awaiting payment"
 * or "Bank transfer · Payment received"; null (no line) for an older Admin,
 * STRIPE or an unknown method. A canceled unpaid bank transfer says only
 * "Bank transfer", so nobody is asked to pay for a canceled order.
 */
export function paymentLine(order: Pick<TrackedOrder, "paymentMethod" | "isPaid" | "status">): string | null {
    if (order.paymentMethod === "COD") return PAYMENT_TEXT.trackCod;
    if (order.paymentMethod !== "BANK_TRANSFER") return null;
    if (order.isPaid === true) return PAYMENT_TEXT.trackReceived;
    if (order.isPaid === false && order.status !== "CANCELED") return PAYMENT_TEXT.trackAwaiting;

    return PAYMENT_TEXT.trackBank;
}

/** Show the payment panel: a BANK_TRANSFER order for which Admin returned an accounts array. */
export const showPaymentPanel = (order: Pick<TrackedOrder, "paymentMethod" | "paymentAccounts">) =>
    order.paymentMethod === "BANK_TRANSFER" && Array.isArray(order.paymentAccounts);
