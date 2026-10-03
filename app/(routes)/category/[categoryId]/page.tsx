import Link from "next/link";
import { notFound } from 'next/navigation';

import Container from '@/components/ui/container';
import Billboard from '@/components/ui/billboard';
import ProductCard from '@/components/ui/product-card';
import { cn } from '@/lib/utils';

import getProducts from "@/actions/get-products";
import getCategory from '@/actions/get-category';
import getCategories from '@/actions/get-categories';
import getSizes from '@/actions/get-sizes';
import getColors from '@/actions/get-colors';

import CategoryNav from './components/category-nav';
import Filter from './components/filter';
import MobileFilters from './components/mobile-filters';

export const revalidate = 0;

interface CategoryPageProps {
  params: {
    categoryId: string;
  },
  searchParams: {
    colorId: string;
    sizeId: string;
  }
}

const CategoryPage: React.FC<CategoryPageProps> = async ({
  params,
  searchParams
}) => {
  const products = await getProducts({
    categoryId: params.categoryId,
    colorId: searchParams.colorId,
    sizeId: searchParams.sizeId,
    includeChildCategories: true,
  });
  const sizes = await getSizes();
  const colors = await getColors();
  const category = await getCategory(params.categoryId);
  const categories = await getCategories();

  // Admin returns HTTP 200 with a `null` body for an unknown category id
  // (same contract as getProduct — see product/[productId]/page.tsx).
  // Previously unguarded: an invalid categoryId threw a TypeError on
  // `category.name` below with no error boundary to catch it.
  if (!category) {
    notFound();
  }

  // Two-level hierarchy: a top-level category shows its own children,
  // a child category shows its parent's family (itself and its siblings).
  const parent = category.parentId
    ? categories.find((item) => item.id === category.parentId)
    : category;
  const children = parent
    ? categories.filter((item) => item.parentId === parent.id)
    : [];
  const family = parent && children.length > 0 ? { parent, children } : null;
  // Breadcrumb parent: only when the current category is a child.
  const breadcrumbParent = category.parentId ? parent : undefined;

  // Product count reflects exactly what this (unpaginated) request
  // returned — never a global/paginated total.
  const activeFilterCount = [searchParams.sizeId, searchParams.colorId].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;
  const clearFiltersHref = `/category/${category.id}`;

  return (
    <div className="bg-background">
      <Container>
        {category.billboard && (
          <Billboard
            data={category.billboard}
            // Shorter than the homepage hero (which uses aspect-[4/5] at
            // the smallest breakpoint) — the category billboard is
            // secondary context here, not the page's main visual.
            aspectClassName="aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1]"
          />
        )}
        <div className={cn("px-4 sm:px-6 lg:px-8 pb-24", !category.billboard && "pt-8")}>
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground">
              <li>
                <Link href="/" className="rounded-control underline-offset-2 hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  Home
                </Link>
              </li>
              {breadcrumbParent && (
                <>
                  <li aria-hidden="true">/</li>
                  <li className="min-w-0 break-words">
                    <Link
                      href={`/category/${breadcrumbParent.id}`}
                      className="rounded-control underline-offset-2 hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      {breadcrumbParent.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="min-w-0 break-words text-foreground">
                {category.name}
              </li>
            </ol>
          </nav>

          <h1 className="mb-4 text-heading text-foreground">{category.name}</h1>

          {family && (
            <CategoryNav
              parent={family.parent}
              items={family.children}
              activeId={category.id}
            />
          )}

          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
            <div className="hidden lg:block">
              {hasActiveFilters && (
                <div className="mb-4 flex justify-end">
                  <Link
                    href={clearFiltersHref}
                    className="text-meta font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Clear filters
                  </Link>
                </div>
              )}
              <Filter
                valueKey="sizeId"
                name="Sizes"
                data={sizes}
              />
              <Filter
                valueKey="colorId"
                name="Colors"
                data={colors}
              />
            </div>
            <div className="mt-6 lg:col-span-4 lg:mt-0">
              <div className="flex items-center justify-between gap-4">
                <MobileFilters
                  sizes={sizes}
                  colors={colors}
                  activeFilterCount={activeFilterCount}
                />
                <p className="text-meta text-muted-foreground">
                  {products.length} {products.length === 1 ? "product" : "products"}
                </p>
              </div>

              <div className="mt-4">
                {products.length === 0 ? (
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface-muted px-6 py-16 text-center">
                    <p className="text-body text-muted-foreground">
                      No products found — try adjusting your filters.
                    </p>
                    {hasActiveFilters && (
                      <Link
                        href={clearFiltersHref}
                        className="text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground"
                      >
                        Clear filters
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((item) => (
                      <ProductCard key={item.id} data={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryPage;
