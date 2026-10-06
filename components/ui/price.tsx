import Currency from "@/components/ui/currency";
import { formatPkr, getSale } from "@/lib/sale-price";

interface PriceProps {
    price?: string | number;
    compareAtPrice?: string | number | null;
    /** Classes for the main (actual) price, e.g. a larger size on the PDP. */
    className?: string;
}

/**
 * The product price. Without a valid sale (`compareAtPrice` strictly above
 * `price`) it is exactly the plain <Currency> as before. With one: the sale
 * price prominently, the compare-at price crossed out and muted in a <del>,
 * and screen-reader text "Sale price Rs X, was Rs Y" in place of the visuals.
 */
const Price: React.FC<PriceProps> = ({ price, compareAtPrice, className }) => {
    const sale = getSale(price, compareAtPrice);

    if (!sale) {
        return <Currency value={price} className={className} />;
    }

    return (
        <div>
            <span className="sr-only">
                Sale price {formatPkr(price)}, was {formatPkr(compareAtPrice)}
            </span>
            <div aria-hidden="true" className="flex flex-wrap items-baseline gap-x-2">
                <Currency value={price} className={className} />
                <del className="text-meta text-muted-foreground">{formatPkr(compareAtPrice)}</del>
            </div>
        </div>
    );
};

export default Price;
