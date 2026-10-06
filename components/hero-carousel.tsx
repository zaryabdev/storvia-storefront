"use client";

import NextImage from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useSnapCarousel } from "@/hooks/use-snap-carousel";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  /** Two or more photo URLs, in the merchant's order. */
  photos: string[];
  sizes: string;
  /**
   * Full-bleed: the carousel fills its positioned parent (absolute inset-0),
   * controls are white over the photo and sit above the hero text (z-20).
   * Otherwise it is an inline photo box with dots below it.
   */
  fill?: boolean;
  /** Aspect classes for each slide (inline mode only). */
  slideClassName?: string;
}

/**
 * Homepage hero photo carousel (2+ photos). Same scroll-snap behavior as the
 * product gallery (`useSnapCarousel`): swipe, dots at every size, arrows from
 * `md`, Left/Right keys on the photo strip, no autoplay, reduced motion jumps.
 * Photos are decorative (the heading is the hero's <h1>); slides are labelled
 * "Slide N of M". Only the first photo is `priority`; the rest are lazy.
 */
const HeroCarousel: React.FC<HeroCarouselProps> = ({
  photos,
  sizes,
  fill = false,
  slideClassName,
}) => {
  const total = photos.length;
  const { index, goTo, onKeyDown, stripRef, slideRef } = useSnapCarousel(total);

  const arrowClass = cn(
    "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40 md:flex",
    fill ? "z-20" : "z-10",
  );

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured photos"
      className={cn(fill ? "absolute inset-0" : "flex min-w-0 flex-col gap-3")}
    >
      {/* Keys only on the strip + arrows, never on the hero's search input. */}
      <div onKeyDown={onKeyDown} className={cn("relative", fill && "h-full")}>
        <div
          ref={stripRef}
          tabIndex={0}
          className={cn(
            "flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus [&::-webkit-scrollbar]:hidden",
            fill
              ? "h-full focus-visible:-outline-offset-4"
              : "rounded-control focus-visible:outline-offset-2",
          )}
        >
          {photos.map((url, photoIndex) => (
            <div
              key={`${url}-${photoIndex}`}
              ref={slideRef(photoIndex)}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${photoIndex + 1} of ${total}`}
              className={cn(
                "relative w-full flex-none snap-center overflow-hidden",
                fill ? "h-full" : slideClassName,
              )}
            >
              <NextImage
                src={url}
                alt=""
                fill
                priority={photoIndex === 0}
                sizes={sizes}
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Previous slide"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          className={cn(arrowClass, "left-2")}
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          disabled={index === total - 1}
          onClick={() => goTo(index + 1)}
          className={cn(arrowClass, "right-2")}
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-1",
          fill && "absolute inset-x-0 bottom-2 z-20",
        )}
      >
        {photos.map((url, photoIndex) => (
          <button
            key={`${url}-${photoIndex}`}
            type="button"
            aria-label={`Show slide ${photoIndex + 1} of ${total}`}
            aria-current={photoIndex === index ? "true" : undefined}
            onClick={() => goTo(photoIndex)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              fill ? "focus-visible:outline-white" : "focus-visible:outline-focus",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                fill
                  ? photoIndex === index ? "bg-white" : "bg-white/50"
                  : photoIndex === index ? "bg-primary" : "bg-foreground/25",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
