"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

import Container from "@/components/ui/container";
import Currency from "@/components/ui/currency";
import Skeleton from "@/components/ui/skeleton";
import useCart from "@/hooks/use-cart";
import { writeLastOrderConfirmation } from "@/lib/order-confirmation";
import { CreateOrderPayload } from "@/types";

import CODDetailsForm from "../cart/components/cod-details-form";

export const revalidate = 0;

/**
 * Storvia's own internal COD checkout page. This is NOT a restored
 * Stripe/card flow — there is no payment gateway involved anywhere here,
 * only the same Cash-on-Delivery order-creation POST that previously ran
 * inside a Cart modal. See storvia-ai-context (projects/storefront/CONTEXT.md).
 */
const CheckoutPage = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<{
        message: string;
        unavailableProductIds: string[];
    } | null>(null);
    const router = useRouter();

    const items = useCart((state) => state.items);
    const removeAll = useCart((state) => state.removeAll);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const orderItems = useMemo(
        () => items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        [items],
    );

    const totalPrice = useMemo(
        () => items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0),
        [items],
    );

    const submitCOD = useCallback(
        async (payload: CreateOrderPayload) => {
            if (orderItems.length === 0) return;

            try {
                setSubmitting(true);
                setSubmitError(null);
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/cod`,
                    payload,
                );

                writeLastOrderConfirmation(res.data);
                removeAll();
                toast.success("Order placed.");
                // `replace`, not `push`: once the order is placed and the
                // cart cleared, there is nothing useful left on this page
                // to come back to — see Task 8 report Section 9 for the
                // full reasoning (the empty-cart guard below would already
                // prevent a real resubmission via Back, but `replace` also
                // avoids leaving a pointless "cart is empty" checkout page
                // in history between the confirmation and the cart).
                router.replace("/order-confirmation");
            } catch (error: any) {
                // Admin's /cod route returns two distinct error shapes
                // (verified against storvia-admin/app/api/[storeId]/cod/route.ts):
                // a bare string for generic/validation failures, and a JSON
                // body `{ error, message, items }` specifically for a stock
                // mismatch (`ORDER_NOT_PLACEABLE`) — `items` lists each
                // unavailable line by productId/reason. The previous version
                // only ever read the string case, silently discarding
                // Admin's real message whenever it was the JSON shape —
                // which is exactly the stock/pricing-mismatch case this
                // hardening pass is meant to surface.
                const data = error?.response?.data;
                let msg = "We couldn't place your order. Please review your details and try again.";
                let unavailableProductIds: string[] = [];

                if (typeof data === "string" && data) {
                    msg = data;
                } else if (data && typeof data.message === "string") {
                    msg = data.message;
                    if (Array.isArray(data.items)) {
                        unavailableProductIds = data.items
                            .map((entry: { productId?: unknown }) => entry?.productId)
                            .filter((id: unknown): id is string => typeof id === "string");
                    }
                }

                toast.error(msg);
                // Toast is transient — a persistent inline banner (below)
                // stays visible so a shopper who misses the toast, or is
                // using a screen reader, still sees why the order didn't go
                // through. Cart and form values are deliberately left
                // untouched (no removeAll()) so the shopper can retry.
                setSubmitError({ message: msg, unavailableProductIds });
            } finally {
                setSubmitting(false);
            }
        },
        [orderItems, removeAll, router],
    );

    // Same genuine hydration boundary as the Cart page (Task 7) — the cart
    // lives in localStorage and cannot be known during SSR.
    if (!isMounted) {
        return (
            <div className="bg-background">
                <Container>
                    <div className="px-4 py-16 sm:px-6 lg:px-8" role="status" aria-live="polite">
                        <span className="sr-only">Loading…</span>
                        <Skeleton className="h-9 w-40" />
                        <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
                            <div className="space-y-6 lg:col-span-7">
                                <Skeleton className="h-40 w-full rounded-surface" />
                                <Skeleton className="h-40 w-full rounded-surface" />
                            </div>
                            <div className="mt-8 space-y-6 lg:col-span-5 lg:mt-0">
                                <Skeleton className="h-48 w-full rounded-surface" />
                                <Skeleton className="h-28 w-full rounded-surface" />
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-background">
                <Container>
                    <div className="px-4 py-16 sm:px-6 lg:px-8">
                        <h1 className="text-heading text-foreground">Checkout</h1>
                        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface-muted px-6 py-20 text-center">
                            <p className="text-subheading text-foreground">Your cart is empty</p>
                            <p className="text-body text-muted-foreground">
                                Add products before continuing to checkout.
                            </p>
                            <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
                                <Link
                                    href="/"
                                    className="text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                >
                                    Continue Shopping
                                </Link>
                                <Link
                                    href="/cart"
                                    className="text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                >
                                    Back to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="bg-background">
            <Container>
                <div className="px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-heading text-foreground">Checkout</h1>

                    {submitError && (
                        <div
                            role="alert"
                            className="mt-6 rounded-surface border border-danger bg-surface-muted px-4 py-3 text-body text-danger"
                        >
                            <p className="font-medium">{submitError.message}</p>
                            {submitError.unavailableProductIds.length > 0 && (
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-meta">
                                    {items
                                        .filter((item) =>
                                            submitError.unavailableProductIds.includes(item.product.id),
                                        )
                                        .map((item) => (
                                            <li key={item.product.id}>{item.product.name}</li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="mt-8">
                        <CODDetailsForm
                            items={orderItems}
                            submitting={submitting}
                            onCancel={() => router.push("/cart")}
                            onSubmit={submitCOD}
                        >
                            {/* Order Summary — real cart snapshot only, display-only
                                and non-authoritative; Admin recalculates from
                                productId+quantity at order time. The payload built
                                inside CODDetailsForm never includes a price. */}
                            <div className="rounded-surface border border-border bg-surface-muted p-6">
                                <h2 className="text-subheading text-foreground">Order Summary</h2>
                                <ul className="mt-4 space-y-3">
                                    {items.map((item) => (
                                        <li
                                            key={item.product.id}
                                            className="flex items-start justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-body font-medium text-foreground">
                                                    {item.product.name}
                                                </p>
                                                <div className="flex items-center gap-1 text-meta text-muted-foreground">
                                                    <span>Qty {item.quantity} ×</span>
                                                    <Currency value={item.product.price} noDecimals />
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-body font-medium text-foreground">
                                                <Currency
                                                    value={Number(item.product.price) * item.quantity}
                                                    noDecimals
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                    <span className="text-body font-medium text-foreground">Total</span>
                                    <Currency value={totalPrice} />
                                </div>
                            </div>

                            {/* Payment Method — read-only/selected state. COD is the
                                only method; this never implies other options exist. */}
                            <div className="rounded-surface border border-border bg-surface-muted p-6">
                                <h2 className="text-subheading text-foreground">Payment Method</h2>
                                <div className="mt-4 flex items-center gap-3 rounded-control border border-primary bg-surface px-4 py-3">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                    >
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-body font-medium text-foreground">Cash on Delivery</p>
                                        <p className="text-meta text-muted-foreground">
                                            Pay with cash when your order arrives
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CODDetailsForm>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CheckoutPage;
