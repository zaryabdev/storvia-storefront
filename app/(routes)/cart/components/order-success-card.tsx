"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import useDelivery from "@/hooks/use-delivery";
import { deliveryDaysText, formatRupees } from "@/lib/delivery-display";
import { formatMoney } from "@/lib/money";
import { OrderResponse } from "@/types";

function normalizeColorHex(hex?: string) {
    if (!hex) return null;
    const v = hex.trim();
    if (!v) return null;
    return v.startsWith("#") ? v : `#${v}`;
}

/**
 * Reused as the /order-confirmation route's presentation component
 * (previously rendered inline in Cart after a modal-based submission — see
 * Task 8). "Continue shopping" is now always a real navigation to the
 * homepage rather than a callback resetting local Cart state, since this
 * component's only remaining caller is a standalone confirmation page.
 *
 * Only real `OrderResponse` fields are shown (tracking ID, status, total,
 * store, line items) — nothing is invented, and `order.status` is rendered
 * verbatim as returned by Admin rather than relabeled to a specific word
 * like "Confirmed" that the actual order lifecycle may not use.
 */
export default function OrderSuccessCard({
    order,
}: {
    order: OrderResponse;
}) {
    const [copied, setCopied] = useState(false);
    const daysText = deliveryDaysText(useDelivery());

    // Admin's authoritative breakdown (decimal strings). Older responses
    // without deliveryFee show only the total, as before.
    const breakdown =
        typeof order.deliveryFee === "string" && typeof order.subtotal === "string"
            ? {
                  subtotal: formatRupees(order.subtotal),
                  delivery: /^0*(\.0*)?$/.test(order.deliveryFee) ? "Free" : formatRupees(order.deliveryFee),
              }
            : null;

    const total = useMemo(() => {
        // Prefer the authoritative server-returned total; only fall back to
        // a computed one if the server didn't return a number.
        if (typeof order.totalPrice === "number") return order.totalPrice;

        return order.products.reduce((sum, p) => sum + Number(p.price ?? 0) * (p.quantity ?? 1), 0);
    }, [order.totalPrice, order.products]);

    const onCopyTracking = async () => {
        try {
            await navigator.clipboard.writeText(order.trackingId);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            // silent; clipboard access can be denied by the browser
        }
    };

    return (
        <div className="w-full max-w-2xl rounded-surface border border-border bg-surface">
            {/* Header */}
            <div className="border-b border-border p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-meta font-medium text-success">
                            Order placed
                        </div>
                        <h2 className="mt-1 text-subheading text-foreground">
                            Thanks! We’ve received your order.
                        </h2>
                        <p className="mt-2 text-body text-muted-foreground">
                            Store:{" "}
                            <span className="font-medium text-foreground">
                                {order.store?.name}
                            </span>
                        </p>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-meta text-muted-foreground">
                        {order.paymentMethod}
                    </span>
                </div>

                {/* Meta */}
                <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="rounded-control bg-surface-muted p-3">
                        <div className="text-meta text-muted-foreground">Tracking</div>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="font-mono text-body text-foreground">
                                {order.trackingId}
                            </div>
                            <button
                                onClick={onCopyTracking}
                                aria-live="polite"
                                className="rounded-control border border-border bg-surface px-2 py-1 text-meta text-foreground hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                type="button"
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-control bg-surface-muted p-3">
                        <div className="text-meta text-muted-foreground">Status</div>
                        <div className="mt-1 text-body font-medium text-foreground">
                            {order.status}
                        </div>
                    </div>

                    <div className="rounded-control bg-surface-muted p-3">
                        {breakdown && (
                            <dl className="mb-2 space-y-1 border-b border-border pb-2 text-meta">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Subtotal</dt>
                                    <dd className="text-foreground">{breakdown.subtotal}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Delivery</dt>
                                    <dd className="text-foreground">{breakdown.delivery}</dd>
                                </div>
                            </dl>
                        )}
                        <div className="text-meta text-muted-foreground">Total</div>
                        <div className="mt-1 text-body font-semibold text-foreground">
                            {typeof order.total === "string" ? formatRupees(order.total) : formatMoney(total, { noDecimals: true })}
                        </div>
                        {daysText && <p className="mt-2 text-meta text-muted-foreground">{daysText}</p>}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="p-6">
                <h3 className="text-body font-semibold text-foreground">Items</h3>

                <ul className="mt-3 divide-y divide-border">
                    {order.products.map((p) => {
                        const hex = normalizeColorHex(p.color?.value);
                        return (
                            <li
                                key={p.id}
                                className="flex items-start justify-between gap-4 py-4"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-body font-medium text-foreground">
                                        {p.name}
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-meta text-muted-foreground">
                                        <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1">
                                            Qty:{" "}
                                            <span className="font-medium text-foreground">
                                                {p.quantity ?? 1}
                                            </span>
                                        </span>

                                        {p.size?.name ? (
                                            <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1">
                                                Size:{" "}
                                                <span className="font-medium text-foreground">
                                                    {p.size.name}
                                                </span>
                                            </span>
                                        ) : null}

                                        {p.color?.name ? (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1">
                                                <span
                                                    className="h-3 w-3 rounded-full border border-border"
                                                    style={
                                                        hex
                                                            ? { backgroundColor: hex }
                                                            : undefined
                                                    }
                                                    aria-hidden
                                                />
                                                Color:{" "}
                                                <span className="font-medium text-foreground">
                                                    {p.color.name}
                                                </span>
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="shrink-0 text-body font-semibold text-foreground">
                                    {formatMoney(Number(p.price ?? 0) * (p.quantity ?? 1), {
                                        noDecimals: true,
                                    })}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Link
                        href="/"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-5 py-2.5 text-body font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                        Continue shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
