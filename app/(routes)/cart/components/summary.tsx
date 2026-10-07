"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import DeliveryNudge from "@/components/delivery-nudge";
import useCart from "@/hooks/use-cart";
import useDelivery from "@/hooks/use-delivery";
import { addAmounts, deliveryLine, freeDeliveryNudge, itemsSubtotal } from "@/lib/delivery-display";

/**
 * Purely presentational + navigational — no order submission happens here.
 * "Continue to Checkout" navigates to `/checkout`. Subtotal, delivery and
 * total are client-side display computations from the cart snapshot and the
 * Store's public delivery settings (exact decimal-string math, no floats);
 * Admin re-prices and computes the delivery fee authoritatively at order time.
 * Before a city is chosen, delivery is "Free", the locked city's exact fee,
 * or "Calculated at checkout".
 */
const Summary = () => {
    const items = useCart((state) => state.items);
    const delivery = useDelivery();
    const router = useRouter();

    const subtotal = useMemo(
        () => itemsSubtotal(items.map((item) => ({ price: item.product.price, quantity: item.quantity }))),
        [items],
    );
    const line = deliveryLine(delivery, subtotal);
    const nudge = freeDeliveryNudge(delivery, subtotal);
    const total =
        line.kind === "free" ? subtotal : line.kind === "fee" ? addAmounts(subtotal, line.fee) : null;

    return (
        <div className="rounded-surface border border-border bg-surface-muted p-6">
            <h2 className="text-subheading text-foreground">Order Summary</h2>

            <dl className="mt-6 space-y-3 border-t border-border pt-4 text-body">
                <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>
                        <Currency value={subtotal} className="font-medium" />
                    </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className="text-right font-medium text-foreground">
                        {line.kind === "free" ? (
                            "Free"
                        ) : line.kind === "fee" ? (
                            <Currency value={line.fee} className="font-medium" />
                        ) : (
                            <span className="text-meta text-muted-foreground">Calculated at checkout</span>
                        )}
                    </dd>
                </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-body font-medium text-foreground">
                    {total === null ? "Total (before delivery)" : "Total"}
                </span>
                <div aria-live="polite">
                    <Currency value={total ?? subtotal} />
                </div>
            </div>

            {items.length > 0 && <DeliveryNudge nudge={nudge} className="mt-4" />}

            <Button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="mt-6 w-full justify-center"
            >
                Continue to Checkout
            </Button>

            {items.length > 0 && (
                <p className="mt-3 text-center text-meta text-muted-foreground">
                    Pay with cash on delivery
                </p>
            )}
        </div>
    );
};

export default Summary;
