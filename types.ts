export interface Product {
    id: string;
    category: Category;
    name: string;
    price: string;
    // Display-only "was" price (decimal string). Absent/null/not above `price` = no sale.
    compareAtPrice?: string | null;
    quantity: number;
    // Admin's ready-made stock message; null/absent = show nothing. Read it
    // through lib/stock-display.ts (readStockDisplay).
    stockDisplay?: { kind: "low" | "count"; quantity: number } | null;
    isFeatured: boolean;
    createdAt?: string;
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

// STRIPE is an inert legacy value; only COD and BANK_TRANSFER are placed.
// Any other value shows no payment panel.
export type PaymentMethod = "COD" | "BANK_TRANSFER" | "STRIPE";

// What a checkout may send (Admin's POST /api/{storeId}/checkout).
export type CheckoutPaymentMethod = "COD" | "BANK_TRANSFER";

export type PaymentAccountType = "BANK" | "JAZZCASH" | "EASYPAISA";

// Admin's public payment-account shape (no ids, in the merchant's order;
// `iban` normalised). Read it through lib/payment-accounts.ts
// (readPaymentAccounts), which skips accounts that can't be shown.
export interface PaymentAccount {
    type: PaymentAccountType;
    accountTitle: string;
    bankName: string | null;
    iban: string | null;
    accountNumber: string | null;
    raastId: string | null;
    walletNumber: string | null;
    tillId: string | null;
    qrImageUrl: string | null;
    note: string | null;
}

export type OrderResponse = {
    orderId: string;
    trackingId: string;
    status: "DRAFT" | "CONFIRMED" | "DELIVERED" | "CANCELED" | string;
    paymentMethod: PaymentMethod;
    /** BANK_TRANSFER: the Store's accounts at checkout; else null. Older entries lack it. */
    paymentAccounts?: PaymentAccount[] | null;
    totalPrice: number;
    /** Decimal strings from Admin. Optional: older Admin responses lack deliveryFee. */
    subtotal?: string | null;
    deliveryFee?: string | null;
    total?: string | null;
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
    paymentMethod: CheckoutPaymentMethod;
    customer?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    shipping?: {
        line1: string;
        line2?: string;
        city: string; // display name ("Other city" for any other town)
        cityKey?: string; // lib/pakistan-cities.ts key, "other" included
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
    // Ad pixels: the id while that integration is active, else null.
    // Optional: an older Admin without the fields omits them.
    metaPixelId?: string | null;
    tiktokPixelId?: string | null;
    // Bank transfer is available (enabled and at least one account).
    // Optional: an older Admin without the field omits it (= COD only).
    bankTransferEnabled?: boolean;
    // Announcement bar text (only while Admin has it on), and the merchant's
    // social profile URLs. Optional: an older Admin without the fields omits
    // them. Read them through components/announcement-bar.tsx and
    // lib/social-links.ts, never directly.
    announcement?: string | null;
    socialLinks?: {
        instagram?: string | null;
        tiktok?: string | null;
        facebook?: string | null;
    } | null;
    // Which store pages are live (booleans only, never text). Optional: an
    // older Admin omits it. Read through lib/store-pages.ts, never directly.
    pages?: {
        about?: boolean;
        contact?: boolean;
        returns?: boolean;
        faq?: boolean;
    } | null;
};
