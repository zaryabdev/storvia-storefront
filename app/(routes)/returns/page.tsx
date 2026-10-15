import StorePage, { storePageMetadata } from "@/components/store-page";

export const revalidate = 0;

export const generateMetadata = () => storePageMetadata("returns");

const ReturnsPage = () => <StorePage kind="returns" />;

export default ReturnsPage;
