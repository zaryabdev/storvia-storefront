"use client";

import { Expand, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/button";
import Price from "@/components/ui/price";
import IconButton from "@/components/ui/icon-button";
import useCart from "@/hooks/use-cart";
import usePreviewModal from "@/hooks/use-preview-modal";
import { getSale } from "@/lib/sale-price";
import { Product } from "@/types";

interface ProductCardProps {
    data: Product;
}

/**
 * Shared across Homepage (Featured Products), the category/PLP grid, and
 * PDP's "Related Items" (via ProductList). One canonical card — no forked
 * variants. Column counts differ per context via each grid's own container
 * classes, not via this component.
 *
 * Markup note: navigation (`Link`) and the two actions (Quick view,
 * Add to Cart) are DOM siblings inside a single relatively-positioned
 * wrapper, not nested inside one another. `Link` wraps only the
 * non-interactive card body (image + name/price/meta); the actions are
 * separate `<button>`-based controls positioned alongside/over it. This
 * avoids interactive-inside-interactive markup, which is invalid HTML and
 * breaks keyboard/screen-reader navigation.
 */
const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
    const previewModal = usePreviewModal();
    const cart = useCart();

    const inStock = data.quantity > 0;
    const sale = getSale(data.price, data.compareAtPrice);

    const onPreview = () => {
        previewModal.onOpen(data);
    };

    const onAddToCart = () => {
        if (!inStock) return;
        cart.addItem(data);
    };

    return (
        <div className="relative flex h-full flex-col justify-between gap-3 rounded-surface border border-border bg-surface p-3">
            <Link
                href={`/product/${data.id}`}
                className="flex flex-col gap-3 rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
                <div className="relative aspect-square overflow-hidden rounded-control bg-surface-muted">
                    {data.images?.[0]?.url && (
                        <Image
                            src={data.images[0].url}
                            alt={data.name}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                            className="object-contain p-2"
                        />
                    )}
                    {(!inStock || (sale && sale.percentOff > 0)) && (
                        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                            {sale && sale.percentOff > 0 && (
                                // The sale text for screen readers is in <Price>; the badge is visual.
                                <span aria-hidden="true" className="inline-flex items-center rounded-full bg-danger px-2 py-1 text-meta font-semibold text-danger-foreground">
                                    −{sale.percentOff}%
                                </span>
                            )}
                            {!inStock && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-1 text-meta font-medium text-primary-foreground">
                                    Out of stock
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    {data.category?.name && (
                        <p className="text-meta text-muted-foreground">{data.category.name}</p>
                    )}
                    <p className="line-clamp-2 text-body font-semibold text-foreground">
                        {data.name}
                    </p>
                    {(data.size?.value || data.color?.name) && (
                        <div className="flex items-center gap-x-3 text-meta text-muted-foreground">
                            {data.size?.value && <span>Size: {data.size.value}</span>}
                            {data.color?.name && <span>{data.color.name}</span>}
                        </div>
                    )}
                    <Price price={data.price} compareAtPrice={data.compareAtPrice} />
                </div>
            </Link>

            {/* Quick view: desktop-only overlay, sibling of the Link (not
                nested inside it), always visible at `lg` (no hover-gating). */}
            <IconButton
                onClick={onPreview}
                aria-label="Quick view"
                icon={<Expand size={18} />}
                className="absolute right-5 top-5 hidden lg:inline-flex"
            />

            {/* Add to Cart: separate semantic control, always visible at
                every breakpoint, sibling of the Link. */}
            <Button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                className="w-full justify-center gap-2"
            >
                {inStock ? (
                    <>
                        Add to Cart
                        <ShoppingCart size={18} aria-hidden="true" />
                    </>
                ) : (
                    "Out of stock"
                )}
            </Button>
        </div>
    );
};

export default ProductCard;
