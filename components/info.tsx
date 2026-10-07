"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Truck } from "lucide-react";

import Price from "@/components/ui/price";
import Button from "@/components/ui/button";
import { Product } from "@/types";
import useCart from "@/hooks/use-cart";
import useDelivery from "@/hooks/use-delivery";
import { deliveryDaysText } from "@/lib/delivery-display";

interface InfoProps {
  data: Product;
  /**
   * Heading level for the product name. Defaults to `h1` — correct for the
   * product detail page, which has no other page-level heading. The Quick
   * View modal (`PreviewModal`) passes `h2`, since it's an auxiliary
   * overlay on top of a page that may already have its own `h1`.
   */
  titleAs?: "h1" | "h2";
  /**
   * Called when the category link inside this panel is clicked. The
   * product detail page doesn't need this (there's no modal to close).
   * `PreviewModal` passes its own `onClose`, so navigating to the category
   * page also closes Quick View instead of leaving it open and stale on
   * top of the newly-navigated page.
   */
  onNavigate?: () => void;
};

const Info: React.FC<InfoProps> = ({ data, titleAs = "h1", onNavigate }) => {
  const cart = useCart();
  const delivery = useDelivery();
  const [quantity, setQuantity] = useState(1);
  const daysText = deliveryDaysText(delivery);

  const inStock = data.quantity > 0;

  const onAddToCart = () => {
    cart.addItem(data, quantity);
  }

  const nameClassName = "text-heading text-foreground";

  return (
    <div className="flex flex-col gap-y-6">
      <div className="space-y-1">
        {data.category?.id && data.category?.name && (
          <Link
            href={`/category/${data.category.id}`}
            onClick={onNavigate}
            className="inline-block text-meta font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {data.category.name}
          </Link>
        )}
        {titleAs === "h2" ? (
          <h2 className={nameClassName}>{data.name}</h2>
        ) : (
          <h1 className={nameClassName}>{data.name}</h1>
        )}
        <Price price={data?.price} compareAtPrice={data?.compareAtPrice} />
      </div>

      <dl className="flex flex-col gap-y-3 border-y border-border py-6">
        {data.size?.value && (
          <div className="flex items-center gap-x-3">
            <dt className="w-24 shrink-0 text-body font-semibold text-foreground">Size</dt>
            <dd className="text-body text-foreground">{data.size.value}</dd>
          </div>
        )}
        {data.color?.name && (
          <div className="flex items-center gap-x-3">
            <dt className="w-24 shrink-0 text-body font-semibold text-foreground">Color</dt>
            <dd className="flex items-center gap-x-2 text-body text-foreground">
              <span
                aria-hidden="true"
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: data.color.value }}
              />
              {data.color.name}
            </dd>
          </div>
        )}
        <div className="flex items-center gap-x-3">
          <dt className="w-24 shrink-0 text-body font-semibold text-foreground">Availability</dt>
          <dd>
            {inStock ? (
              <span className="text-body font-medium text-success">In stock</span>
            ) : (
              <span className="text-body font-medium text-danger">Out of stock</span>
            )}
          </dd>
        </div>
      </dl>

      {inStock && (
        <div className="flex items-center gap-x-4">
          <span className="text-body font-semibold text-foreground">Quantity</span>
          <div className="flex items-center gap-x-1 rounded-control border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-body text-foreground" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= data.quantity}
              onClick={() => setQuantity((q) => Math.min(data.quantity, q + 1))}
              className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <Button
        onClick={onAddToCart}
        disabled={!inStock}
        className="w-full justify-center gap-2 sm:w-auto"
      >
        {inStock ? "Add to Cart" : "Out of stock"}
        <ShoppingCart size={20} aria-hidden="true" />
      </Button>

      {inStock && (
        <p className="flex items-center gap-x-2 text-meta text-muted-foreground">
          <Truck size={16} aria-hidden="true" />
          {daysText ? `Cash on delivery available · ${daysText}` : "Cash on delivery available"}
        </p>
      )}
    </div>
  );
}

export default Info;
