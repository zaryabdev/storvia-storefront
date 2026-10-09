// Meta Pixel + TikTok Pixel event helpers (rules: storvia-ai-context
// DECISIONS.md → Ads integrations). Every helper is SSR-safe, never throws
// and is a silent no-op for a pixel the Store has not activated. No customer
// data is ever sent: only product ids, names, quantities, prices, the search
// text and the order tracking id (as the de-duplication event id).
//
// Early events: the base code is injected by `next/script` after hydration,
// so a page effect can call a helper before `fbq` / `ttq` exist. Calls made
// before a pixel is ready are queued (per pixel, capped) and replayed in
// order once its base code has run (it calls `window.__storviaPixelReady`).
// Calls for a pixel that is not active are dropped.

import type { OrderResponse } from "@/types";

type PixelKey = "meta" | "tiktok";
type Fbq = (...args: unknown[]) => void;
type Ttq = {
    page: () => void;
    track: (event: string, params?: Record<string, unknown>, options?: Record<string, unknown>) => void;
};

declare global {
    interface Window {
        fbq?: Fbq;
        ttq?: Ttq;
        __storviaPixelReady?: (key: PixelKey) => void;
    }
}

const CURRENCY = "PKR";
const MAX_PENDING = 50;
const PURCHASE_KEY_PREFIX = "storvia-pixel-purchase:";

// Shapes the Pixels component accepts; anything else is never put in a script.
export const META_PIXEL_ID_PATTERN = /^[0-9]{10,20}$/;
export const TIKTOK_PIXEL_ID_PATTERN = /^[A-Za-z0-9]{15,30}$/;

// null = not configured yet (the Pixels component has not rendered).
const enabled: Record<PixelKey, boolean | null> = { meta: null, tiktok: null };
const ready: Record<PixelKey, boolean> = { meta: false, tiktok: false };
const pending: Record<PixelKey, Array<() => void>> = { meta: [], tiktok: [] };

const isBrowser = () => typeof window !== "undefined";

const safely = (fn: () => void) => {
    try {
        fn();
    } catch {
        // Tracking must never break the shop.
    }
};

function run(key: PixelKey, fn: () => void) {
    if (!isBrowser() || enabled[key] === false) return;

    if (ready[key]) {
        safely(fn);
        return;
    }

    if (pending[key].length < MAX_PENDING) pending[key].push(fn);
}

function markReady(key: PixelKey) {
    if (ready[key] || enabled[key] !== true) return;
    ready[key] = true;
    const queued = pending[key].splice(0);
    queued.forEach(safely);
}

if (isBrowser()) {
    window.__storviaPixelReady = markReady;
}

/**
 * Called by the Pixels component while it renders (client only), before any
 * page effect can send an event. Inactive pixels drop their queued calls.
 */
export function configurePixels(active: { meta: boolean; tiktok: boolean }) {
    if (!isBrowser()) return;

    (Object.keys(active) as PixelKey[]).forEach((key) => {
        enabled[key] = active[key];
        if (!active[key]) pending[key] = [];
    });
}

const meta = (...args: unknown[]) => run("meta", () => window.fbq?.(...args));
const tiktok = (fn: (ttq: Ttq) => void) =>
    run("tiktok", () => {
        if (window.ttq) fn(window.ttq);
    });

/** Admin's decimal string (or number) as a number rounded to 2 dp; 0 if not a number. */
export function toAmount(value: string | number | null | undefined): number {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

type PixelProduct = { id: string; name: string; price: string | number };
type PixelLine = PixelProduct & { quantity: number };

const ttContents = (lines: PixelLine[]) =>
    lines.map((line) => ({
        content_id: line.id,
        content_type: "product",
        content_name: line.name,
        quantity: line.quantity,
        price: toAmount(line.price),
    }));

const linesValue = (lines: PixelLine[]) =>
    toAmount(lines.reduce((sum, line) => sum + toAmount(line.price) * line.quantity, 0));

export function trackPageView() {
    meta("track", "PageView");
    tiktok((ttq) => ttq.page());
}

/** PDP only (not Quick View), once per product view. */
export function trackViewContent(product: PixelProduct) {
    const price = toAmount(product.price);

    meta("track", "ViewContent", {
        content_ids: [product.id],
        content_type: "product",
        content_name: product.name,
        value: price,
        currency: CURRENCY,
    });
    tiktok((ttq) =>
        ttq.track("ViewContent", {
            contents: ttContents([{ ...product, quantity: 1 }]),
            value: price,
            currency: CURRENCY,
        }),
    );
}

/** A successful add from the PDP, Quick View or a product card. */
export function trackAddToCart(product: PixelProduct, quantity: number) {
    if (!(quantity > 0)) return;
    const line = { ...product, quantity };
    const value = linesValue([line]);

    meta("track", "AddToCart", {
        content_ids: [product.id],
        contents: [{ id: product.id, quantity }],
        content_type: "product",
        content_name: product.name,
        value,
        currency: CURRENCY,
    });
    tiktok((ttq) =>
        ttq.track("AddToCart", { contents: ttContents([line]), value, currency: CURRENCY }),
    );
}

/** Once per /checkout visit, with the (non-empty) cart. */
export function trackInitiateCheckout(lines: PixelLine[]) {
    if (lines.length === 0) return;
    const value = linesValue(lines);

    meta("track", "InitiateCheckout", {
        content_ids: lines.map((line) => line.id),
        contents: lines.map((line) => ({ id: line.id, quantity: line.quantity })),
        content_type: "product",
        num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
        value,
        currency: CURRENCY,
    });
    tiktok((ttq) =>
        ttq.track("InitiateCheckout", { contents: ttContents(lines), value, currency: CURRENCY }),
    );
}

const purchaseKey = (key: PixelKey, trackingId: string) =>
    `${PURCHASE_KEY_PREFIX}${key}:${trackingId}`;
// Fallback when sessionStorage is unavailable: at most once per page lifetime.
const purchasedInMemory = new Set<string>();

function purchaseSent(key: PixelKey, trackingId: string): boolean {
    if (purchasedInMemory.has(purchaseKey(key, trackingId))) return true;
    try {
        return sessionStorage.getItem(purchaseKey(key, trackingId)) !== null;
    } catch {
        return false;
    }
}

function markPurchaseSent(key: PixelKey, trackingId: string) {
    purchasedInMemory.add(purchaseKey(key, trackingId));
    try {
        sessionStorage.setItem(purchaseKey(key, trackingId), "1");
    } catch {
        // In-memory fallback above.
    }
}

/**
 * The confirmation page's stored Admin OrderResponse (never the browser
 * cart). Value = the order total incl. delivery (`total`, else the older
 * `totalPrice`). At most once per order and pixel: each pixel is marked
 * (`storvia-pixel-purchase:<pixel>:<trackingId>`) only when the event is
 * actually handed to fbq / ttq, including from the early-event queue. A
 * Purchase still queued when the shopper leaves is sent on their next visit
 * to the confirmation page in this tab; one already sent is never repeated.
 */
export function trackPurchase(order: OrderResponse) {
    if (!isBrowser() || !order?.trackingId) return;
    const trackingId = order.trackingId;

    // Checked before queueing and again at dispatch, so a second call while
    // the first is still queued (e.g. Strict Mode) sends nothing extra.
    const sendOnce = (key: PixelKey, send: () => void) => {
        if (purchaseSent(key, trackingId)) return;
        run(key, () => {
            if (purchaseSent(key, trackingId)) return;
            send();
            markPurchaseSent(key, trackingId);
        });
    };

    safely(() => {
        const lines: PixelLine[] = (order.products ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));
        const value = toAmount(order.total ?? order.totalPrice);

        sendOnce("meta", () =>
            window.fbq?.(
                "track",
                "Purchase",
                {
                    content_ids: lines.map((line) => line.id),
                    contents: lines.map((line) => ({ id: line.id, quantity: line.quantity })),
                    content_type: "product",
                    num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
                    value,
                    currency: CURRENCY,
                },
                { eventID: trackingId },
            ),
        );
        sendOnce("tiktok", () =>
            window.ttq?.track(
                "CompletePayment",
                { contents: ttContents(lines), value, currency: CURRENCY },
                { event_id: trackingId },
            ),
        );
    });
}

/** Every tap of the WhatsApp float button. */
export function trackContact() {
    meta("track", "Contact");
    tiktok((ttq) => ttq.track("Contact"));
}

/** /search with a non-empty (trimmed) query. */
export function trackSearch(query: string) {
    const q = query.trim();
    if (!q) return;

    meta("track", "Search", { search_string: q });
    tiktok((ttq) => ttq.track("Search", { query: q }));
}
