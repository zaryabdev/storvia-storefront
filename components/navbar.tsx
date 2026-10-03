import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import getCategories from "@/actions/get-categories";
import getStore from "@/actions/get-store";
import MainNav from "@/components/main-nav";
import MobileNav from "@/components/mobile-nav";
import NavbarActions from "@/components/navbar-actions";
import Container from "@/components/ui/container";

const Navbar = async () => {
    const categories = await getCategories();
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;
    const store = storeId ? await getStore(storeId) : null;

    return (
        <div className="border-b border-border bg-surface">
            <Container>
                <div className="relative grid grid-cols-[minmax(96px,1fr)_minmax(0,auto)_minmax(96px,1fr)] items-center h-16 gap-x-2 px-4 sm:px-6 lg:flex lg:gap-x-3 lg:px-8">
                    <div className="flex justify-start lg:hidden">
                        <MobileNav categories={categories} />
                    </div>

                    <Link
                        href="/"
                        className="flex min-w-0 items-center justify-center gap-x-2"
                    >
                        {store?.logoUrl ? (
                            <div className="relative h-[36px] w-[120px] max-w-full">
                                <Image
                                    src={store.logoUrl}
                                    alt={store?.name ?? "Store logo"}
                                    fill
                                    sizes="120px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        ) : (
                            <p className="truncate text-xl font-bold text-foreground">
                                {store?.name ?? "STORE"}
                            </p>
                        )}
                    </Link>

                    <div className="hidden lg:block">
                        <MainNav data={categories} />
                    </div>

                    <div className="ml-auto flex items-center justify-end gap-x-2">
                        <Link
                            href="/search"
                            aria-label="Search"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:scale-110 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                            <Search size={20} aria-hidden="true" />
                        </Link>
                        <NavbarActions />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Navbar;
