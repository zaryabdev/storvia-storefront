import StorePage, { storePageMetadata } from "@/components/store-page";

export const revalidate = 0;

export const generateMetadata = () => storePageMetadata("about");

const AboutPage = () => <StorePage kind="about" />;

export default AboutPage;
