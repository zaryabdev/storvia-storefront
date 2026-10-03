"use client";

import NextImage from "next/image";
import { Tab } from "@headlessui/react";

import { cn } from "@/lib/utils";
import { Image } from "@/types";

interface GalleryTabProps {
  image: Image;
  /** Real, product-specific name used to build this thumbnail's accessible
   * label (the image itself stays `alt=""` to avoid double-announcing). */
  productName: string;
  index: number;
}

const GalleryTab: React.FC<GalleryTabProps> = ({
  image,
  productName,
  index,
}) => {
  return (
    <Tab
      aria-label={`Show image ${index + 1} of ${productName}`}
      className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:h-20 sm:w-20"
    >
      {({ selected }) => (
        <>
          <NextImage
            fill
            src={image.url}
            alt=""
            sizes="80px"
            className="object-contain object-center p-1"
          />
          {/* Selected state is already conveyed to assistive tech via
              Headless UI's own `aria-selected` on the tab; this ring is the
              sighted-user visual equivalent, not the only signal. */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-control ring-2 ring-inset',
              selected ? 'ring-primary' : 'ring-transparent',
            )}
          />
        </>
      )}
    </Tab>
  );
}

export default GalleryTab;
