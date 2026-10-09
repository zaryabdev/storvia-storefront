"use client";

import { useEffect, useRef } from "react";

import { trackSearch, trackViewContent } from "@/lib/pixels";

// Small render-nothing trackers for server-rendered pages. Each ref absorbs
// React Strict Mode's double effect in dev, so an event fires once per view.

/** PDP only (Quick View never renders it). Keyed by product id on the page. */
export function ViewContentTracker({ id, name, price }: { id: string; name: string; price: string }) {
    const tracked = useRef<string | null>(null);

    useEffect(() => {
        if (tracked.current === id) return;
        tracked.current = id;
        trackViewContent({ id, name, price });
    }, [id, name, price]);

    return null;
}

/** /search with a non-empty query, once per distinct query shown. */
export function SearchTracker({ query }: { query: string }) {
    const tracked = useRef<string | null>(null);

    useEffect(() => {
        const q = query.trim();
        if (!q || tracked.current === q) return;
        tracked.current = q;
        trackSearch(q);
    }, [query]);

    return null;
}
