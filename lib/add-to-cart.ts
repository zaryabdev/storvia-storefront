import useCart from "@/hooks/use-cart";
import { trackAddToCart } from "@/lib/pixels";
import { Product } from "@/types";

const quantityInCart = (productId: string) =>
    useCart.getState().items.find((item) => item.product.id === productId)?.quantity ?? 0;

/**
 * The PDP / Quick View / product-card add: the cart's own `addItem`
 * (unchanged), plus an AddToCart pixel event for the quantity actually added
 * (nothing when out of stock or already at the stock limit).
 */
export function addToCartAndTrack(product: Product, quantity = 1) {
    const before = quantityInCart(product.id);
    useCart.getState().addItem(product, quantity);
    const added = quantityInCart(product.id) - before;

    if (added > 0) {
        trackAddToCart({ id: product.id, name: product.name, price: product.price }, added);
    }
}
