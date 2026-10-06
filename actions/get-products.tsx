import { Product } from "@/types";
import qs from "query-string";

const URL=`${process.env.NEXT_PUBLIC_API_URL}/products`;

interface Query {
  categoryId?: string;
  colorId?: string;
  sizeId?: string;
  isFeatured?: boolean;
  // Opt-in only: expands a top-level categoryId to include its immediate
  // children. Omitted/false keeps categoryId an exact match.
  includeChildCategories?: boolean;
  // Storefront search text. Omitted when empty so existing callers and
  // their request URLs are unchanged.
  q?: string;
  // Newest-first cap (the API accepts 1–50 and ignores invalid values).
  limit?: number;
}

const getProducts = async (query: Query): Promise<Product[]> => {
  const url = qs.stringifyUrl({
    url: URL,
    query: {
      colorId: query.colorId,
      sizeId: query.sizeId,
      categoryId: query.categoryId,
      isFeatured: query.isFeatured,
      includeChildCategories: query.includeChildCategories || undefined,
      q: query.q || undefined,
      limit: query.limit || undefined,
    },
  });

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`getProducts failed (${res.status}): ${text.slice(0, 120)}`);
  }

  return res.json();
};

export default getProducts;
