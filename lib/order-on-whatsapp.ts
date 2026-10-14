// "Order on WhatsApp" on the product page and Quick View. The customer sends a
// prefilled message to the merchant; no order is created. Pure.

import { formatRupees } from "./delivery-display";
import { plainRupees } from "./payment-accounts";

/** The digits of NEXT_PUBLIC_WHATSAPP_NUMBER (it isn't validated elsewhere); null under 10 digits. */
export function whatsappDigits(raw: string | null | undefined): string | null {
    const digits = (raw ?? "").replace(/\D/g, "");

    return digits.length >= 10 ? digits : null;
}

/**
 * "Hi! I'd like to order:\nName (Size, Color)\nRs 1,500 × 3\nhttps://…/product/id"
 * The brackets hold whichever of size and color exist, and are left out when
 * neither does. `price` is the product's price, never compareAtPrice.
 */
export function buildOrderWhatsAppMessage(order: {
    name: string;
    size?: string | null;
    color?: string | null;
    price: string;
    quantity: number;
    url: string;
}): string {
    const options = [order.size, order.color]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
        .join(", ");

    return [
        "Hi! I'd like to order:",
        options ? `${order.name} (${options})` : order.name,
        `${plainRupees(formatRupees(order.price))} × ${order.quantity}`,
        order.url,
    ].join("\n");
}
