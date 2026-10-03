"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Container from '@/components/ui/container';
import Skeleton from '@/components/ui/skeleton';
import useCart from '@/hooks/use-cart';

import Summary from './components/summary'
import CartItem from './components/cart-item';

export const revalidate = 0;

const CartPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // The cart lives entirely in localStorage via Zustand's `persist` — it
  // genuinely cannot be known during SSR, so this gate stays (unlike the
  // Currency fix from Task 2, this is a real hydration boundary, not a
  // false one). Render a lightweight skeleton instead of a blank page
  // while waiting for it.
  if (!isMounted) {
    return (
      <div className="bg-background">
        <Container>
          <div className="px-4 py-16 sm:px-6 lg:px-8" role="status" aria-live="polite">
            <span className="sr-only">Loading…</span>
            <Skeleton className="h-9 w-48" />
            <div className="mt-12 md:grid md:grid-cols-12 md:items-start md:gap-x-8 lg:gap-x-12">
              <div className="space-y-6 md:col-span-7">
                {[0, 1].map((row) => (
                  <div key={row} className="flex gap-4 border-b border-border py-6">
                    <Skeleton className="h-24 w-24 shrink-0 rounded-control sm:h-32 sm:w-32" />
                    <div className="flex flex-1 flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <Skeleton className="h-11 w-28 rounded-control" />
                        <div className="space-y-1">
                          <Skeleton className="ml-auto h-5 w-20" />
                          <Skeleton className="ml-auto h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 md:col-span-5 md:mt-0">
                <div className="rounded-surface border border-border bg-surface-muted p-6">
                  <Skeleton className="h-6 w-36" />
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="mt-6 h-11 w-full rounded-full" />
                  <Skeleton className="mx-auto mt-3 h-4 w-40" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Total units across all lines — the same definition of "item" the
  // navbar's cart badge already uses (Task 3), so this count is consistent
  // with what the shopper saw before landing here, not a different metric.
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="bg-background">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-heading text-foreground">Shopping Cart</h1>
          {cart.items.length > 0 && (
            <p className="mt-1 text-body text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          )}

          {cart.items.length === 0 ? (
            <div className="mx-auto mt-12 flex max-w-xl flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface-muted px-6 py-20 text-center">
              <p className="text-subheading text-foreground">Your cart is empty</p>
              <p className="text-body text-muted-foreground">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Link
                href="/"
                className="mt-2 text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-12 md:grid md:grid-cols-12 md:items-start md:gap-x-8 lg:gap-x-12">
              {/* Split lowered to `md` (768px) — cart-item rows (image +
                  name + qty controls) already render comfortably at
                  narrower mobile widths than a `md` column gets, so there's
                  no reason to keep this stacked through the whole tablet
                  range. */}
              <ul className="md:col-span-7">
                {cart.items.map((item) => (
                  <CartItem key={item.product.id} data={item.product} quantity={item.quantity} />
                ))}
              </ul>
              <div className="mt-10 md:sticky md:top-8 md:col-span-5 md:mt-0">
                <Summary />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
};

export default CartPage;
