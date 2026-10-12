import type { OrderResponse } from "@/types";

/**
 * sessionStorage key carrying the just-placed order's OrderResponse from
 * `/checkout` to `/order-confirmation` across that one page navigation.
 *
 * This is explicitly NOT order history: there is no array of past orders,
 * nothing here is ever sent back to the server, and a later order simply
 * overwrites this same key. It exists only so the confirmation page
 * survives a refresh or brief back-navigation within the same browser
 * tab/session — sessionStorage (unlike localStorage) clears when the tab
 * closes, which is the intended lifecycle here.
 */
export const LAST_ORDER_CONFIRMATION_KEY = "storvia-last-order-confirmation";

/**
 * Minimal validation of a stored order. Entries written before bank transfer
 * may lack `paymentMethod` / `paymentAccounts`: they behave as COD (no
 * payment panel). Never fabricates a fallback order.
 */
export function normalizeStoredOrder(parsed: unknown): OrderResponse | null {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const order = parsed as Record<string, unknown>;
    if (typeof order.orderId !== "string" || typeof order.trackingId !== "string") return null;

    return {
        ...(order as unknown as OrderResponse),
        paymentMethod: (typeof order.paymentMethod === "string" ? order.paymentMethod : "COD") as OrderResponse["paymentMethod"],
        paymentAccounts: Array.isArray(order.paymentAccounts) ? order.paymentAccounts : null,
    };
}

/**
 * Reads and minimally validates the stored order. Returns null if nothing
 * is stored, the value can't be parsed, sessionStorage is unavailable
 * (private browsing, etc.), or the parsed value doesn't look like a real
 * OrderResponse — never fabricates a fallback order.
 */
export function readLastOrderConfirmation(): OrderResponse | null {
    try {
        const raw = sessionStorage.getItem(LAST_ORDER_CONFIRMATION_KEY);
        if (!raw) return null;

        return normalizeStoredOrder(JSON.parse(raw));
    } catch {
        return null;
    }
}

/**
 * Stores the order returned by a successful `/checkout` submission (incl.
 * `paymentMethod` and `paymentAccounts`). Failures
 * (private browsing, storage quota) are swallowed — the order was still
 * placed successfully server-side; the confirmation page just won't have
 * anything to read back in that edge case.
 */
export function writeLastOrderConfirmation(order: OrderResponse): void {
    try {
        sessionStorage.setItem(LAST_ORDER_CONFIRMATION_KEY, JSON.stringify(order));
    } catch {
        // ignore — see comment above
    }
}
