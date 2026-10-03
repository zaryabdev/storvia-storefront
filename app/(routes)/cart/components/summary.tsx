"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";

/**
 * Purely presentational + navigational — no order submission happens here
 * anymore (see Task 8). "Continue to Checkout" navigates to `/checkout`;
 * it does not touch cart quantities/totals and does not call the `/cod`
 * endpoint itself. Only Subtotal/Total are shown — there is no shipping,
 * tax, or discount concept anywhere in `CreateOrderPayload`/`OrderResponse`
 * (see Task 7 report for the single-"Total"-line rationale, unchanged
 * here). This total is a client-side display computation from the current
 * cart snapshot only — Admin re-prices and validates authoritatively at
 * order time.
 */
const Summary = () => {
    const items = useCart((state) => state.items);
    const router = useRouter();

    const totalPrice = useMemo(
        () => items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0),
        [items],
    );

    return (
        <div className="rounded-surface border border-border bg-surface-muted p-6">
            <h2 className="text-subheading text-foreground">Order Summary</h2>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-body font-medium text-foreground">Total</span>
                <div aria-live="polite">
                    <Currency value={totalPrice} />
                </div>
            </div>

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
