import Link from "next/link";
import NextImage from "next/image";
import { Search } from "lucide-react";

import getStore from "@/actions/get-store";
import HeroCarousel from "@/components/hero-carousel";
import { cn } from "@/lib/utils";
import { Billboard, BillboardLayout } from "@/types";

interface HomeHeroProps {
    billboard: Billboard | null;
}

const LAYOUTS: BillboardLayout[] = ["SPLIT", "FULL_BLEED", "HEADING_LED"];

// Same `sizes` as before for the split photo column.
const SPLIT_SIZES = "(max-width: 359px) 100vw, (min-width: 1280px) 480px, 40vw";
const SPLIT_ASPECT = "aspect-[16/9] min-[360px]:aspect-[4/5] md:aspect-[4/3]";
// Heading-led: the photo spans the tinted panel (max-w-7xl minus padding).
const WIDE_SIZES = "(min-width: 1280px) 1120px, 100vw";
const WIDE_ASPECT = "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]";

const SearchForm = ({ className }: { className?: string }) => (
    <form
        role="search"
        action="/search"
        method="get"
        className={cn("flex w-full items-center rounded-full bg-surface p-1 shadow-sm", className)}
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
);

// Primary button: dark on the light layouts, light on full-bleed.
const CtaLink = ({ href, label, onDark }: { href: string; label: string; onDark?: boolean }) => (
    <Link
        href={href}
        className={cn(
            "inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-body font-semibold transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            onDark
                ? "bg-white text-foreground focus-visible:outline-white"
                : "bg-primary text-primary-foreground focus-visible:outline-focus",
        )}
    >
        {label}
    </Link>
);

// One photo: a plain (priority) image. Two or more: the carousel.
const HeroPhotos = ({
    photos,
    sizes,
    aspect,
}: {
    photos: string[];
    sizes: string;
    aspect: string;
}) =>
    photos.length > 1 ? (
        <HeroCarousel photos={photos} sizes={sizes} slideClassName={aspect} />
    ) : (
        <div className={cn("relative overflow-hidden rounded-control", aspect)}>
            {/* Decorative: the label is already the <h1>. */}
            <NextImage
                src={photos[0]}
                alt=""
                fill
                priority
                sizes={sizes}
                className="object-cover object-center"
            />
        </div>
    );

/**
 * Homepage hero (Server Component). The heading is always the page's single
 * <h1>: the billboard label, or the Store name when there is no billboard.
 *
 * With a homepage billboard, `layout` picks the design:
 * - SPLIT (default): tinted panel, text + search left, photo right.
 * - FULL_BLEED: the photo fills the hero (≤60svh on phones, up to 80vh on
 *   desktop) under a dark gradient scrim; white text at the bottom.
 * - HEADING_LED: tinted panel, big centered heading, search, wide photo.
 * Subheading, search (`showSearch`) and button (`ctaLabel` → category) are
 * optional. 2+ photos render a carousel (only the photos rotate).
 *
 * Fallbacks for an Admin without these fields: `images` → `[imageUrl]`,
 * `layout` → SPLIT, `showSearch` → true. Without a billboard the tinted
 * panel shows the Store name + search, no image (unchanged).
 *
 * Everything on the tint uses `text-foreground` — `muted-foreground` is only
 * 4.28:1 on `surface-tint`. The search input sits on a white `surface` pill
 * so its muted placeholder keeps proper contrast.
 */
const HomeHero = async ({ billboard }: HomeHeroProps) => {
    let heading = billboard?.label;

    if (!heading) {
        // Same (request-memoized) getStore() call Navbar/Footer/metadata make;
        // same "Store" fallback as Footer.
        const storeId = process.env.NEXT_PUBLIC_STORE_ID;
        const store = storeId ? await getStore(storeId).catch(() => null) : null;
        heading = store?.name ?? "Store";
    }

    const photos = billboard?.images?.length
        ? billboard.images.map((image) => image.url)
        : billboard?.imageUrl
          ? [billboard.imageUrl]
          : [];
    const hasImage = photos.length > 0;
    const layout: BillboardLayout =
        hasImage && billboard?.layout && LAYOUTS.includes(billboard.layout)
            ? billboard.layout
            : "SPLIT";
    const showSearch = billboard?.showSearch ?? true;
    const subheading = billboard?.subheading?.trim() || null;
    const cta =
        billboard?.ctaLabel && billboard.ctaCategory
            ? { label: billboard.ctaLabel, href: `/category/${billboard.ctaCategory.id}` }
            : null;

    if (layout === "FULL_BLEED") {
        const isCarousel = photos.length > 1;

        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="relative flex h-[60svh] min-h-fit flex-col justify-end overflow-hidden rounded-surface bg-foreground md:h-[70vh] lg:h-[80vh]">
                    {isCarousel ? (
                        <HeroCarousel photos={photos} sizes="100vw" fill />
                    ) : (
                        <NextImage
                            src={photos[0]}
                            alt=""
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    )}
                    {/* Scrim: keeps white text readable on any photo. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/15"
                    />
                    {/* Text lets swipes through to the photos; controls opt back in. */}
                    <div
                        className={cn(
                            "pointer-events-none relative z-10 w-full max-w-3xl px-5 pb-6 pt-16 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)] sm:px-8 sm:pb-8 md:px-16 md:pb-12",
                            isCarousel && "pb-12 sm:pb-12 md:pb-14",
                        )}
                    >
                        <h1 className="break-words text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                            {heading}
                        </h1>
                        {subheading && (
                            <p className="mt-3 break-words text-body text-white sm:text-lg">{subheading}</p>
                        )}
                        {showSearch && <SearchForm className="pointer-events-auto mt-5 max-w-xl sm:mt-6" />}
                        {cta && (
                            <div className="pointer-events-auto mt-5 w-fit">
                                <CtaLink href={cta.href} label={cta.label} onDark />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (layout === "HEADING_LED") {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="rounded-surface bg-surface-tint p-5 sm:p-8 md:p-10 lg:p-12">
                    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                        <h1 className="break-words text-3xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                            {heading}
                        </h1>
                        {subheading && (
                            <p className="mt-3 break-words text-body text-foreground sm:text-lg">{subheading}</p>
                        )}
                        {showSearch && <SearchForm className="mt-5 max-w-xl text-left sm:mt-6" />}
                        {cta && (
                            <div className="mt-5">
                                <CtaLink href={cta.href} label={cta.label} />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 sm:mt-8 md:mt-10">
                        <HeroPhotos photos={photos} sizes={WIDE_SIZES} aspect={WIDE_ASPECT} />
                    </div>
                </div>
            </div>
        );
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
                    {subheading && (
                        <p className="mt-3 break-words text-body text-foreground">{subheading}</p>
                    )}
                    {showSearch && <SearchForm className="mt-5 sm:mt-6" />}
                    {cta && (
                        <div className="mt-5">
                            <CtaLink href={cta.href} label={cta.label} />
                        </div>
                    )}
                </div>

                {hasImage && (
                    <HeroPhotos photos={photos} sizes={SPLIT_SIZES} aspect={SPLIT_ASPECT} />
                )}
            </div>
        </div>
    );
};

export default HomeHero;
