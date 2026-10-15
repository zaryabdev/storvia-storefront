import StorePage, { storePageMetadata } from "@/components/store-page";

export const revalidate = 0;

export const generateMetadata = () => storePageMetadata("faq");

const FAQPage = () => <StorePage kind="faq" />;

export default FAQPage;
