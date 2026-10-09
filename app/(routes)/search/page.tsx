import Link from "next/link";

import getProducts from "@/actions/get-products";
import Button from "@/components/ui/button";
import Container from "@/components/ui/container";
import ProductCard from "@/components/ui/product-card";
import { SearchTracker } from "@/components/pixel-trackers";
import { normalizeSearchQuery } from "@/lib/search-query";

export const revalidate = 0;

interface SearchPageProps {
  searchParams: {
    q?: string | string[];
  };
}

/**
 * Server-rendered search results. Search state lives in the URL (`?q=`), so
 * it is shareable, refresh-safe and works with Back/Forward. The form is a
 * plain GET form — no client component, no live search.
 */
const SearchPage: React.FC<SearchPageProps> = async ({ searchParams }) => {
  const query = normalizeSearchQuery(searchParams.q);
  // Empty query shows only the form — never lists the whole catalog.
  const products = query ? await getProducts({ q: query }) : [];

  return (
    <div className="bg-background">
      {query && <SearchTracker key={query} query={query} />}
      <Container>
        <div className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-heading text-foreground">
            {query ? `Search results for “${query}”` : "Search"}
          </h1>

          <form
            role="search"
            action="/search"
            method="get"
            className="flex max-w-xl items-center gap-2"
          >
            <label htmlFor="search-q" className="sr-only">
              Search products
            </label>
            <input
              id="search-q"
              type="search"
              name="q"
              defaultValue={query}
              maxLength={100}
              autoFocus={!query}
              autoComplete="off"
              placeholder="Search products"
              className="min-h-[44px] w-full rounded-control border border-border bg-surface px-4 text-body text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
            <Button type="submit">Search</Button>
          </form>

          {query && (
            <div className="mt-6">
              <p className="text-meta text-muted-foreground" role="status">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>

              <div className="mt-4">
                {products.length === 0 ? (
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface-muted px-6 py-16 text-center">
                    <p className="break-words text-body text-muted-foreground">
                      No products found for &ldquo;{query}&rdquo;.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                      <Link
                        href="/search"
                        className="text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground"
                      >
                        Clear search
                      </Link>
                      <Link
                        href="/"
                        className="text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground"
                      >
                        Browse categories
                      </Link>
                    </div>
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
          )}
        </div>
      </Container>
    </div>
  );
};

export default SearchPage;
