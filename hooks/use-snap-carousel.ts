"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared state for a CSS scroll-snap carousel (product gallery, homepage
 * hero): one active index driven by swiping (IntersectionObserver, threshold
 * 0.6) and by programmatic moves (dots, arrows, thumbnails, keys). Moves are
 * clamped (no wrap), smooth unless `prefers-reduced-motion` (then they jump).
 * There is no autoplay.
 */
export function useSnapCarousel(total: number) {
  const [index, setIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  // While we scroll programmatically (dot, arrow, thumbnail, key), the active
  // index is already set; ignore the observer until the scroll settles.
  const lockObserver = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (target: number) => {
      const next = Math.min(Math.max(target, 0), total - 1);
      const strip = stripRef.current;
      const slide = slideRefs.current[next];

      setIndex(next);

      if (!strip || !slide) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (lockObserver.current) {
        clearTimeout(lockObserver.current);
      }
      lockObserver.current = setTimeout(() => {
        lockObserver.current = null;
      }, reduceMotion ? 100 : 700);

      strip.scrollTo({ left: slide.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [total],
  );

  // Swiping: the slide that is mostly in view becomes the active one.
  useEffect(() => {
    const strip = stripRef.current;

    if (!strip || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockObserver.current) {
          return;
        }

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slideIndex = slideRefs.current.indexOf(entry.target as HTMLDivElement);

            if (slideIndex >= 0) {
              setIndex(slideIndex);
            }
          }
        }
      },
      { root: strip, threshold: 0.6 },
    );

    slideRefs.current.forEach((slide) => slide && observer.observe(slide));

    return () => {
      observer.disconnect();
      if (lockObserver.current) {
        clearTimeout(lockObserver.current);
      }
    };
  }, [total]);

  // Left/Right arrow keys move between slides while focus is inside.
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  };

  const slideRef = (slideIndex: number) => (node: HTMLDivElement | null) => {
    slideRefs.current[slideIndex] = node;
  };

  return { index, goTo, onKeyDown, stripRef, slideRef };
}
