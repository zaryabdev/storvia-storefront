import NextImage from "next/image";
import { Search } from "lucide-react";

import getStore from "@/actions/get-store";
import { Billboard } from "@/types";

interface HomeHeroProps {
    billboard: Billboard | null;
}

/**
 * Homepage hero panel (Server Component). With a homepage billboard: label
 * as the page's single <h1> + search on the left, billboard image on the
 * right. Without one: same tinted panel, Store name as <h1> + search, no
 * image column.
 *
 * Everything on the tint uses `text-foreground` — `muted-foreground` is only
 * 4.28:1 on `surface-tint`. The search input sits on a white `surface` pill
 * so its muted placeholder keeps proper contrast.
 */
const HomeHero = async ({ billboard }: HomeHeroProps) => {
    const hasImage = Boolean(billboard?.imageUrl);
    let heading = billboard?.label;

    if (!heading) {
        // Same (request-memoized) getStore() call Navbar/Footer/metadata make;
        // same "Store" fallback as Footer.
        const storeId = process.env.NEXT_PUBLIC_STORE_ID;
        const store = storeId ? await getStore(storeId).catch(() => null) : null;
        heading = store?.name ?? "Store";
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div
                className={
                    hasImage
                        ? "grid grid-cols-1 items-center gap-6 rounded-surface bg-surface-tint p-5 min-[360px]:grid-cols-[3fr_2fr] min-[360px]:gap-4 sm:p-8 md:gap-10 md:p-10 lg:p-12"
                        : "rounded-surface bg-surface-tint p-5 sm:p-8 md:p-10 lg:p-12"
                }
            >
                <div className="min-w-0">
                    <h1 className="break-words text-2xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                        {heading}
                    </h1>

                    <form
                        role="search"
                        action="/search"
                        method="get"
                        className="mt-5 flex w-full items-center rounded-full bg-surface p-1 shadow-sm sm:mt-6"
                    >
                        <label htmlFor="home-hero-search-q" className="sr-only">
                            Search products
                        </label>
                        <input
                            id="home-hero-search-q"
                            type="search"
                            name="q"
                            maxLength={100}
                            autoComplete="off"
                            placeholder="Search products"
                            className="min-h-[44px] min-w-0 flex-1 rounded-full bg-transparent px-4 text-body text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                            <Search size={20} aria-hidden="true" />
                        </button>
                    </form>
                </div>

                {hasImage && billboard && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-control min-[360px]:aspect-[4/5] md:aspect-[4/3]">
                        {/* Decorative: the label is already the adjacent <h1>. */}
                        <NextImage
                            src={billboard.imageUrl}
                            alt=""
                            fill
                            priority
                            sizes="(max-width: 359px) 100vw, (min-width: 1280px) 480px, 40vw"
                            className="object-cover object-center"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeHero;
