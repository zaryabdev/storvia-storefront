import ProductCard from "@/components/ui/product-card";
import { Product } from "@/types";
import NoResults from "@/components/ui/no-results";

interface ProductListProps {
  title: string;
  items: Product[];
  /**
   * Optional overrides, defaulting to this component's original classes so
   * existing call sites (e.g. the product detail page's "Related Items")
   * render exactly as before unless they explicitly opt in to something
   * else (e.g. the homepage's "Featured Products" section).
   */
  headingClassName?: string;
  gridClassName?: string;
  /** Heading element; defaults to `h3` (unchanged for existing call sites). */
  headingAs?: "h2" | "h3";
}

const ProductList: React.FC<ProductListProps> = ({
  title,
  items,
  headingClassName = "font-bold text-3xl",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
  headingAs: Heading = "h3",
}) => {
  return (
    <div className="space-y-4">
      <Heading className={headingClassName}>{title}</Heading>
      {items.length === 0 && <NoResults />}
      <div className={gridClassName}>
        {items.map((item) => (
          <ProductCard key={item.id} data={item} />
        ))}
      </div>
    </div>
   );
}

export default ProductList;
