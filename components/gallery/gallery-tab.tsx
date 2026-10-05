"use client";

import NextImage from "next/image";

import { cn } from "@/lib/utils";
import { Image } from "@/types";

interface GalleryTabProps {
  image: Image;
  /** Real, product-specific name used to build this thumbnail's accessible
   * label (the image itself stays `alt=""` to avoid double-announcing). */
  productName: string;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}

const GalleryTab: React.FC<GalleryTabProps> = ({
  image,
  productName,
  index,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      aria-label={`Show image ${index + 1} of ${productName}`}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(index)}
      className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:h-20 sm:w-20"
    >
      <NextImage
        fill
        src={image.url}
        alt=""
        sizes="80px"
        className="object-contain object-center p-1"
      />
      {/* Selected state is conveyed to assistive tech by `aria-current`; this
          ring is the sighted-user visual equivalent, not the only signal. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-control ring-2 ring-inset',
          selected ? 'ring-primary' : 'ring-transparent',
        )}
      />
    </button>
  );
}

export default GalleryTab;
