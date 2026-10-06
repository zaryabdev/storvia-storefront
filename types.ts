export interface Product {
    id: string;
    category: Category;
    name: string;
    price: string;
    quantity: number;
    isFeatured: boolean;
    size: Size;
    color: Color;
    images: Image[];
}

export interface Image {
    id: string;
    url: string;
}

export type BillboardLayout = "SPLIT" | "FULL_BLEED" | "HEADING_LED";

export interface BillboardImage {
    id: string;
    url: string;
    position?: number;
}

// The homepage-only fields are optional so an Admin without them still works
// (see `components/home-hero.tsx` for the fallbacks). `imageUrl` is the cover
// (= first photo) and is all the category banner uses.
export interface Billboard {
    id: string;
    label: string;
    imageUrl: string;
    layout?: BillboardLayout;
    subheading?: string | null;
    showSearch?: boolean;
    ctaLabel?: string | null;
    ctaCategoryId?: string | null;
    ctaCategory?: { id: string; name: string } | null;
    images?: BillboardImage[];
}

export interface Category {
    id: string;
    name: string;
    parentId: string | null;
    billboardId: string | null;
    // Curated icon key (lib/category-icons.ts); optional so an older Admin
    // without the field still works. Unknown keys render nothing.
    iconKey?: string | null;
    // Only included by the single-category endpoint, not the category list.
    billboard?: Billboard | null;
}

export interface Size {
    id: string;
    name: string;
    value: string;
}

export interface Color {
    id: string;
    name: string;
    value: string;
}

export type OrderResponse = {
    orderId: string;
    trackingId: string;
    status: "DRAFT" | "CONFIRMED" | "DELIVERED" | "CANCELED" | string;
    paymentMethod: "COD" | "STRIPE" | string;
    totalPrice: number;
    store: { id: string; name: string };
    products: Array<{
        id: string;
        name: string;
        price: string | number;
        quantity: number;
        size?: { id: string; name: string; value: string };
        color?: { id: string; name: string; value: string };
    }>;

    // ✅ new (optional so nothing breaks)
    customerName?: string;
    email?: string;
    phone?: string;

    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    customerNotes?: string;

    // if you still return it
    address?: string;
};

export type CreateOrderPayload = {
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: "COD";
    customer?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    shipping?: {
        line1: string;
        line2?: string;
        city: string;
        postalCode?: string;
        country?: string; // "PK"
        notes?: string;
    };
    notes?: string;
};

export type Store = {
    id: string;
    name: string;
    logoUrl: string | null;
    // Optional: an older Admin without the field omits it.
    faviconUrl?: string | null;
};
