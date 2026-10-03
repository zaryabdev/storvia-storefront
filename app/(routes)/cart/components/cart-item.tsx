import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Currency from "@/components/ui/currency";
import IconButton from "@/components/ui/icon-button";
import useCart from "@/hooks/use-cart";
import { Product } from "@/types";

interface CartItemProps {
    data: Product;
    quantity: number;
}

/**
 * Reads/writes the cart exclusively through the existing `useCart` store
 * actions (`decrementItem`/`incrementItem`/`removeItem`) — no clamp logic is
 * duplicated here; the store already clamps to `data.quantity` on increment.
 */
const CartItem: React.FC<CartItemProps> = ({ data, quantity }) => {
    const cart = useCart();

    const outOfStock = data.quantity <= 0;
    const canDecrement = quantity > 1;
    const canIncrement = !outOfStock && quantity < data.quantity;

    const onRemove = () => {
        cart.removeItem(data.id);
    };

    return (
        <li className="flex gap-4 border-b border-border py-6">
            <Link
                href={`/product/${data.id}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:h-32 sm:w-32"
            >
                {data.images?.[0]?.url && (
                    <Image
                        fill
                        src={data.images[0].url}
                        alt={data.name}
                        sizes="(min-width: 640px) 128px, 96px"
                        className="object-contain object-center p-1"
                    />
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={`/product/${data.id}`}
                            className="line-clamp-2 text-body font-semibold text-foreground hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                            {data.name}
                        </Link>

                        {(data.color?.name || data.size?.name) && (
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-meta text-muted-foreground">
                                {data.color?.name && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span
                                            aria-hidden="true"
                                            className="h-3 w-3 rounded-full border border-border"
                                            style={{ backgroundColor: data.color.value }}
                                        />
                                        {data.color.name}
                                    </span>
                                )}
                                {data.size?.name && <span>Size: {data.size.name}</span>}
                            </div>
                        )}
                    </div>

                    <IconButton
                        onClick={onRemove}
                        aria-label={`Remove ${data.name} from cart`}
                        icon={<X size={16} />}
                        className="shrink-0"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-control border border-border">
                            <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={!canDecrement}
                                onClick={() => cart.decrementItem(data.id)}
                                className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                                <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="w-6 text-center text-body text-foreground" aria-live="polite">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={!canIncrement}
                                onClick={() => cart.incrementItem(data.id)}
                                className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                                <Plus size={14} aria-hidden="true" />
                            </button>
                        </div>

                        {outOfStock && (
                            <span className="text-meta font-medium text-danger">Out of stock</span>
                        )}
                    </div>

                    <div aria-live="polite" className="flex flex-col items-end">
                        <Currency value={Number(data.price) * quantity} noDecimals />
                        {quantity > 1 && (
                            <div className="flex items-center gap-1 text-meta text-muted-foreground">
                                <span>{quantity} ×</span>
                                <Currency
                                    value={data.price}
                                    noDecimals
                                    className="font-normal text-muted-foreground"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
};

export default CartItem;
