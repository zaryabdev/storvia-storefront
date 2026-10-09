import { notFound } from 'next/navigation';

import ProductList from '@/components/product-list'
import Gallery from '@/components/gallery';
import Info from '@/components/info';
import { ViewContentTracker } from '@/components/pixel-trackers';
import getProduct from '@/actions/get-product';
import getProducts from '@/actions/get-products';
import Container from '@/components/ui/container';

export const revalidate = 0;

interface ProductPageProps {
  params: {
    productId: string;
  },
}

// Related Products is a quick browsing aid, not a second catalog page — cap
// it so it can't grow unbounded in a large category. 8 gives exactly two
// full rows at the 4-column desktop grid width used below.
const RELATED_PRODUCTS_LIMIT = 8;

const ProductPage: React.FC<ProductPageProps> = async ({
  params
 }) => {
  const product = await getProduct(params.productId);

  // Admin returns HTTP 200 with a `null` body for an unknown product id
  // (verified against the Admin route directly — Prisma `findUnique`
  // passed straight to `NextResponse.json`, no 404 status). A genuine
  // fetch failure instead throws inside getProduct and is caught by
  // this route's error.tsx, so reaching here with a falsy product means
  // the product truly doesn't exist.
  if (!product) {
    notFound();
  }

  const suggestedProducts = await getProducts({
    categoryId: product?.category?.id
  });

  // Exclude the current product from its own "related" list, and cap the
  // count — both are plain array operations on the data already returned,
  // not a new API/commerce capability.
  const relatedProducts = suggestedProducts
    .filter((item) => item.id !== product.id)
    .slice(0, RELATED_PRODUCTS_LIMIT);

  return (
    <div className="bg-background">
      <ViewContentTracker key={product.id} id={product.id} name={product.name} price={product.price} />
      <Container>
        <div className="flex flex-col gap-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* Two-column split lowered to `md` (768px) — the gallery/info
              content is simple enough (one image panel, one text panel) to
              use the extra tablet width instead of staying stacked all the
              way to `lg`, unlike Cart/Checkout's denser form content. */}
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12">
            <Gallery images={product.images} productName={product.name} priority />
            <div className="mt-8 md:mt-0">
              <Info data={product} />
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <ProductList
              title="Related Products"
              items={relatedProducts}
              headingClassName="text-heading text-foreground"
              gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
            />
          )}
        </div>
      </Container>
    </div>
  )
}

export default ProductPage;
