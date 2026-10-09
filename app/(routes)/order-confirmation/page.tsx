"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Container from "@/components/ui/container";
import Skeleton from "@/components/ui/skeleton";
import { readLastOrderConfirmation } from "@/lib/order-confirmation";
import { trackPurchase } from "@/lib/pixels";
import { OrderResponse } from "@/types";

import OrderSuccessCard from "../cart/components/order-success-card";

export const revalidate = 0;

/**
 * Reads the just-placed order back from sessionStorage (written by
 * `/checkout` — see `lib/order-confirmation.ts`). No Admin lookup request
 * happens here; there is no order-status/history API in this app. If
 * nothing is stored (direct visit, expired session, different browser
 * tab), this shows a graceful message instead of fabricating an order or
 * redirect-looping.
 */
const OrderConfirmationPage = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [order, setOrder] = useState<OrderResponse | null>(null);

    useEffect(() => {
        const stored = readLastOrderConfirmation();
        setOrder(stored);
        setIsMounted(true);
        // Purchase from Admin's stored response, at most once per order
        // (remembered by tracking id; a refresh or Back fires nothing).
        if (stored) trackPurchase(stored);
    }, []);

    // Reading sessionStorage must happen client-side after mount (same
    // reasoning as the cart/checkout hydration gate) — render a brief
    // skeleton rather than flashing the "not found" state first.
    if (!isMounted) {
        return (
            <div className="bg-background">
                <Container>
                    <div className="px-4 py-16 sm:px-6 lg:px-8" role="status" aria-live="polite">
                        <span className="sr-only">Loading…</span>
                        <Skeleton className="h-9 w-56" />
                        <Skeleton className="mx-auto mt-8 h-72 w-full max-w-2xl rounded-surface" />
                    </div>
                </Container>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-background">
                <Container>
                    <div className="px-4 py-16 sm:px-6 lg:px-8">
                        <h1 className="text-heading text-foreground">Order Confirmation</h1>
                        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface-muted px-6 py-20 text-center">
                            <p className="text-subheading text-foreground">
                                No recent order confirmation was found
                            </p>
                            <p className="text-body text-muted-foreground">
                                This can happen if this page was opened directly, or the
                                confirmation is no longer available in this browser session.
                            </p>
                            <Link
                                href="/"
                                className="mt-2 text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                                Continue Shopping
                            </Link>
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
                    <h1 className="text-heading text-foreground">Order Confirmation</h1>
                    {/* mx-auto: previously left-pinned at its max-w-2xl cap
                        on any viewport wider than ~700px, leaving a large
                        dead gap on the right on tablet/desktop. */}
                    <div className="mt-8 flex justify-center">
                        <OrderSuccessCard order={order} />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default OrderConfirmationPage;
