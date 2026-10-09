// Guest order tracking: Admin's public POST /api/{storeId}/track-order.
// Display only; money stays decimal strings (formatted with formatRupees).

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
