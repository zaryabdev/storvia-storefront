import { parseStorePage, type StorePageContent, type StorePageKind } from "@/lib/store-pages";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// One store page (Admin GET /api/{storeId}/pages/{kind}). Never throws: a
// non-OK response (an Admin deployed before store pages), a network error,
// non-JSON, `null` (page off or unknown) or a body of the wrong shape all give
// null, which the routes turn into "Page not found". Same `no-store` caching
// as getStore.
const getStorePage = async (kind: StorePageKind): Promise<StorePageContent | null> => {
    try {
        const res = await fetch(`${API_URL}/pages/${kind}`, { cache: "no-store" });

        if (!res.ok) return null;

        return parseStorePage(kind, await res.json());
    } catch {
        return null;
    }
};

export default getStorePage;
