"use client";

import NextImage from "next/image";
import { Tab } from "@headlessui/react";

import { Image } from "@/types";

import GalleryTab from "./gallery-tab";

interface GalleryProps {
  images: Image[];
  /** Real, product-specific alt text for the main image (no more `alt=""`
   * on meaningful product photography). */
  productName: string;
  /**
   * Priority-load the initially active image. Defaults to false so
   * PreviewModal — which opens well after initial page load via a user
   * click, and is never the page's LCP candidate — never marks its image
   * priority. The product detail page passes `priority`, since its
   * gallery genuinely is the LCP candidate there.
   */
  priority?: boolean;
}

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

  return (
    <Tab.Group as="div" className="flex flex-col gap-4">
      <Tab.Panels className="aspect-square w-full overflow-hidden rounded-xl">
        {images.map((image, index) => (
          <Tab.Panel key={image.id}>
            <div className="relative aspect-square h-full w-full overflow-hidden rounded-control bg-surface-muted">
              <NextImage
                fill
                src={image.url}
                alt={productName}
                priority={priority && index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain object-center p-2"
              />
            </div>
          </Tab.Panel>
        ))}
      </Tab.Panels>

      {/* Touch-friendly thumbnail row, visible at every breakpoint (mobile
          previously had no way to switch images at all — the thumbnail
          list was `hidden` below `sm`). Only shown when there's something
          to switch between. */}
      {images.length > 1 && (
        <Tab.List className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <GalleryTab
              key={image.id}
              image={image}
              productName={productName}
              index={index}
            />
          ))}
        </Tab.List>
      )}
    </Tab.Group>
  );
}

export default Gallery;
