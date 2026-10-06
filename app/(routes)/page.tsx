import Link from "next/link";

import getCategories from "@/actions/get-categories";
import getHomepageBillboard from "@/actions/get-homepage-billboard";
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import HomeHero from "@/components/home-hero";
import CategoryIcon from "@/components/category-icon";
import Container from "@/components/ui/container";

export const revalidate = 0;

const NEW_ARRIVALS_COUNT = 8;

const HomePage = async () => {
    const [products, billboard, categories, newest] = await Promise.all([
        getProducts({ isFeatured: true }),
        getHomepageBillboard(),
        getCategories(),
        getProducts({ limit: NEW_ARRIVALS_COUNT }),
    ]);

    // Newest first from the API; slice anyway so an Admin that ignores
    // `limit` still shows exactly 8.
    const newArrivals = newest.slice(0, NEW_ARRIVALS_COUNT);

    const topLevelCategories = categories.filter((category) => !category.parentId);

    return (
        <Container>
            <div className="flex flex-col gap-y-12 pb-10 lg:gap-y-16">
                {/* The hero owns the page's single <h1> (billboard label, or
                    the Store name when there is no homepage billboard). */}
                <HomeHero billboard={billboard} />

                <div className="flex flex-col gap-y-12 px-4 sm:px-6 lg:gap-y-16 lg:px-8">
                    {topLevelCategories.length > 0 && (
                        <section aria-labelledby="shop-by-category-heading" className="space-y-4">
                            <div className="flex items-baseline justify-between gap-4">
                                <h2
                                    id="shop-by-category-heading"
                                    className="text-heading text-foreground"
                                >
                                    Shop by category
                                </h2>
                                <Link
                                    href="/categories"
                                    className="shrink-0 rounded-control text-body font-semibold text-foreground underline underline-offset-2 hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                >
                                    Show all<span className="sr-only"> categories</span>
                                </Link>
                            </div>
                            {/* Horizontal scroller: padding keeps focus rings
                                (2px outline + 2px offset) from being clipped
                                by overflow. Native scrolling, so keyboard Tab
                                scrolls focused tiles into view. */}
                            <ul className="flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto p-1">
                                {topLevelCategories.map((category) => (
                                    <li key={category.id} className="flex-none snap-start">
                                        <Link
                                            href={`/category/${category.id}`}
                                            className="flex min-h-[56px] w-[8.5rem] items-center justify-center gap-2 rounded-control bg-surface-muted px-4 py-3 text-center text-body font-semibold text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-40"
                                        >
                                            <CategoryIcon iconKey={category.iconKey} />
                                            <span className="line-clamp-2 break-words">{category.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {products.length > 0 && (
                        <ProductList
                            title="Featured"
                            headingAs="h2"
                            items={products}
                            headingClassName="text-heading text-foreground"
                            gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
                        />
                    )}

                    {newArrivals.length > 0 && (
                        <ProductList
                            title="New arrivals"
                            headingAs="h2"
                            items={newArrivals}
                            headingClassName="text-heading text-foreground"
                            gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
                        />
                    )}
                </div>
            </div>
        </Container>
    );
};

export default HomePage;
