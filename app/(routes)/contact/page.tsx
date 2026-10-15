import StorePage, { storePageMetadata } from "@/components/store-page";

export const revalidate = 0;

export const generateMetadata = () => storePageMetadata("contact");

const ContactPage = () => <StorePage kind="contact" />;

export default ContactPage;
