import Link from "next/link";

import getStore from "@/actions/get-store";

/**
 * Server Component (matches Navbar) so it can read the real Store name
 * instead of the previous hardcoded "Store, Inc." placeholder. Same
 * storeId env var / getStore() call Navbar already makes — Next dedupes
 * identical fetches within one render, so this isn't a second network
 * request. Falls back to "Store" (same convention as Navbar's own logo
 * fallback) rather than throwing: a real fetch failure already surfaces via
 * Navbar's unguarded call to app/global-error.tsx, so Footer doesn't need
 * to be a second failure point for what's ultimately decorative text.
 */
const Footer = async () => {
    const year = new Date().getFullYear();
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;
    const store = storeId ? await getStore(storeId).catch(() => null) : null;
    const name = store?.name ?? "Store";

    return (
        <footer className="bg-white border-t">
            <div className="py-10 mx-auto">
                <p className="mb-3 text-center">
                    <Link
                        href="/track"
                        className="inline-flex min-h-[44px] items-center text-sm text-black underline underline-offset-2 hover:text-muted-foreground"
                    >
                        Track your order
                    </Link>
                </p>
                <p className="text-xs text-center text-black">
                    &copy; {year} {name}. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
