import { Metadata } from "next";
import { Urbanist } from "next/font/google";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ModalProvider from "@/providers/modal-provider";
import ToastProvider from "@/providers/toast-provider";
import getStore from "@/actions/get-store";
import getDelivery from "@/actions/get-delivery";
import DeliveryProvider from "@/providers/delivery-provider";

import WhatsAppFloat from "@/components/ui/whatspp-float";
import "./globals.css";

const font = Urbanist({ subsets: ["latin"] });

// Neutral fallback tab icon for a Store without its own favicon: never the
// Storvia mark, never the Next.js default. No file-based app/favicon.ico or
// app/icon.* may exist, or it would override these metadata icons.
const DEFAULT_ICONS: Metadata["icons"] = {
    icon: [
        { url: "/default-favicon.svg", type: "image/svg+xml" },
        { url: "/default-favicon.png", type: "image/png" },
    ],
    apple: "/default-favicon.png",
};

// Same store-id env var and getStore() call Navbar already makes — Next
// dedupes identical fetches within one render, so this isn't a second
// network request. Falls back to a generic title/description rather than
// throwing: Navbar's own unguarded getStore() call already throws to
// app/global-error.tsx on a real failure, so metadata doesn't need to be a
// second, redundant failure point — it only needs to degrade gracefully.
export async function generateMetadata(): Promise<Metadata> {
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;
    const store = storeId ? await getStore(storeId).catch(() => null) : null;
    const name = store?.name ?? "Store";
    const faviconUrl = store?.faviconUrl;

    return {
        title: name,
        description: `${name} - The place for all your purchases.`,
        icons: faviconUrl
            ? { icon: faviconUrl, apple: faviconUrl }
            : DEFAULT_ICONS,
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Never throws (falls back), so a missing delivery endpoint can't break pages.
    const delivery = await getDelivery();

    return (
        <html lang="en">
            <body className={`${font.className} min-h-screen flex flex-col`}>
                <DeliveryProvider value={delivery}>
                    <ToastProvider />
                    <ModalProvider />
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <WhatsAppFloat message="Hi! I want to place an order." />
                </DeliveryProvider>
            </body>
        </html>
    );
}
