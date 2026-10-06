"use client";

import NextImage from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSnapCarousel } from "@/hooks/use-snap-carousel";
import { cn } from "@/lib/utils";
import { Image } from "@/types";

import GalleryTab from "./gallery-tab";

interface GalleryProps {
  images: Image[];
  /** Real, product-specific alt text for the main image (no more `alt=""`
   * on meaningful product photography). */
  productName: string;
  /**
   * Priority-load the first image. Defaults to false so PreviewModal — which
   * opens well after initial page load via a user click, and is never the
   * page's LCP candidate — never marks its image priority. The product
   * detail page passes `priority`, since its gallery genuinely is the LCP
   * candidate there. Every other photo is always lazy.
   */
  priority?: boolean;
}

const IMAGE_SIZES = "(min-width: 1024px) 50vw, 100vw";
const IMAGE_CLASS = "object-contain object-center p-2";

// Photo 1 keeps the product name as its alt; later photos are numbered.
const altFor = (productName: string, index: number) =>
  index === 0 ? productName : `${productName}, photo ${index + 1}`;

const Gallery: React.FC<GalleryProps> = ({
  images = [],
  productName,
  priority = false,
}) => {
  // Graceful empty state: no images at all — a plain token surface,
  // matching the same no-image fallback treatment already established for
  // Billboard (a plain `bg-surface-muted` box) rather than inventing a new
  // pattern or attempting next/image with an undefined src.
  if (images.length === 0) {
    return <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface-muted" />;
  }

  // Exactly one photo: no carousel, dots, arrows or swipe container.
  if (images.length === 1) {
    return (
      <div className="flex flex-col gap-4">
        <div className="aspect-square w-full overflow-hidden rounded-xl">
          <div className="relative aspect-square h-full w-full overflow-hidden rounded-control bg-surface-muted">
            <NextImage
              fill
              src={images[0].url}
              alt={productName}
              priority={priority}
              sizes={IMAGE_SIZES}
              className={IMAGE_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }

  return <PhotoCarousel images={images} productName={productName} priority={priority} />;
};

const PhotoCarousel: React.FC<GalleryProps> = ({ images, productName, priority }) => {
  const total = images.length;
  const { index, goTo, onKeyDown, stripRef, slideRef } = useSnapCarousel(total);

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40 md:flex";

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Product photos"
      onKeyDown={onKeyDown}
      className="flex flex-col gap-4"
    >
      <div className="relative">
        <div
          ref={stripRef}
          tabIndex={0}
          className="relative flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, imageIndex) => (
            <div
              key={image.id}
              ref={slideRef(imageIndex)}
              role="group"
              aria-roledescription="slide"
              aria-label={`Photo ${imageIndex + 1} of ${total}`}
              className="aspect-square w-full flex-none snap-center"
            >
              <div className="relative aspect-square h-full w-full overflow-hidden rounded-control bg-surface-muted">
                <NextImage
                  fill
                  src={image.url}
                  alt={altFor(productName, imageIndex)}
                  priority={priority && imageIndex === 0}
                  sizes={IMAGE_SIZES}
                  className={IMAGE_CLASS}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Previous photo"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          className={cn(arrowClass, "left-2")}
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          disabled={index === total - 1}
          onClick={() => goTo(index + 1)}
          className={cn(arrowClass, "right-2")}
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      {/* Phones: dots replace the thumbnails. */}
      <div className="flex flex-wrap items-center justify-center gap-1 md:hidden">
        {images.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            aria-label={`Show photo ${imageIndex + 1} of ${total}`}
            aria-current={imageIndex === index ? "true" : undefined}
            onClick={() => goTo(imageIndex)}
            className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                imageIndex === index ? "bg-primary" : "bg-border",
              )}
            />
          </button>
        ))}
      </div>

      {/* md and up: the existing thumbnail row. */}
      <div className="hidden gap-3 overflow-x-auto pb-1 md:flex">
        {images.map((image, imageIndex) => (
          <GalleryTab
            key={image.id}
            image={image}
            productName={productName}
            index={imageIndex}
            selected={imageIndex === index}
            onSelect={goTo}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
