import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";

import getStore from "@/actions/get-store";
import getStorePage from "@/actions/get-store-page";
import ContactWhatsAppButton from "@/components/contact-whatsapp-button";
import LinkRow from "@/components/link-row";
import Container from "@/components/ui/container";
import { whatsappDigits } from "@/lib/order-on-whatsapp";
import { whatsappLink } from "@/lib/payment-accounts";
import { readSocialLinks } from "@/lib/social-links";
import {
    pageDescription,
    splitParagraphs,
    STORE_PAGES,
    type StorePageKind,
} from "@/lib/store-pages";

const titleOf = (kind: StorePageKind) => STORE_PAGES.find((page) => page.kind === kind)!.title;

const readStore = () => {
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;

    return storeId ? getStore(storeId).catch(() => null) : Promise.resolve(null);
};

/** Tab title "About · {Store name}" and a plain-text description. A page that isn't live keeps the layout's title. */
export async function storePageMetadata(kind: StorePageKind): Promise<Metadata> {
    const [store, page] = await Promise.all([readStore(), getStorePage(kind)]);
    if (!page) return {};

    return {
        title: `${titleOf(kind)} · ${store?.name ?? "Store"}`,
        description: pageDescription(page),
    };
}

// Plain text only: no HTML, Markdown or auto-linking. Blank lines split
// paragraphs; single line breaks are kept; dir="auto" so Urdu reads right to left.
const Text = ({ text }: { text: string }) => (
    <div className="space-y-4">
        {splitParagraphs(text).map((paragraph, index) => (
            <p
                key={index}
                dir="auto"
                className="whitespace-pre-line break-words text-body text-foreground"
            >
                {paragraph}
            </p>
        ))}
    </div>
);

/** One store page for its route; a page that isn't live is "Page not found". */
const StorePage = async ({ kind }: { kind: StorePageKind }) => {
    const page = await getStorePage(kind);
    if (!page) notFound();

    // Contact only: the WhatsApp button (number rule as Order on WhatsApp) and the social links.
    let contactExtras: React.ReactNode = null;

    if (page.kind === "contact") {
        const store = await readStore();
        const href = whatsappLink(
            whatsappDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
            "Hi! I have a question.",
        );
        const socialLinks = readSocialLinks(store);

        contactExtras = (
            <>
                {href && (
                    <div className="mt-6">
                        <ContactWhatsAppButton href={href} />
                    </div>
                )}
                <LinkRow
                    className="-ml-3 mt-4 !justify-start !px-0"
                    items={socialLinks.map((link) => ({ ...link, external: true }))}
                />
            </>
        );
    }

    return (
        <div className="bg-background">
            <Container>
                <div className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
                    <h1 className="text-heading text-foreground">{titleOf(kind)}</h1>
                    <div className="mt-4 max-w-2xl">
                        {page.kind === "faq" ? (
                            <div className="space-y-3">
                                {page.items.map((item, index) => (
                                    <details
                                        key={index}
                                        className="group rounded-xl border border-border bg-surface"
                                    >
                                        <summary
                                            dir="auto"
                                            className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-body font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden"
                                        >
                                            <span className="min-w-0 break-words">{item.question}</span>
                                            <ChevronDown
                                                size={20}
                                                aria-hidden="true"
                                                className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                                            />
                                        </summary>
                                        <div className="px-4 pb-4">
                                            <Text text={item.answer} />
                                        </div>
                                    </details>
                                ))}
                            </div>
                        ) : (
                            <>
                                <Text text={page.body} />
                                {contactExtras}
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StorePage;
