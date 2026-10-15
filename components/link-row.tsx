import Link from "next/link";

export type LinkRowItem = { key: string; label: string; href: string; external?: boolean };

const LINK_CLASS =
    "inline-flex min-h-[44px] items-center px-3 text-sm text-black underline underline-offset-2 hover:text-muted-foreground";

/**
 * Plain text links separated by "·": the footer's pages and social rows, and
 * the social row on the Contact page. External links open in a new tab and
 * their accessible name ends "(opens in a new tab)".
 */
const LinkRow = ({ items, className }: { items: LinkRowItem[]; className?: string }) => {
    if (items.length === 0) return null;

    return (
        <ul className={`flex flex-wrap items-center justify-center gap-x-1 px-4 ${className ?? ""}`}>
            {items.map((item, index) => (
                <li key={item.key} className="flex items-center">
                    {index > 0 && (
                        <span aria-hidden="true" className="text-sm text-black">
                            ·
                        </span>
                    )}
                    {item.external ? (
                        <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${item.label} (opens in a new tab)`}
                            className={LINK_CLASS}
                        >
                            {item.label}
                        </a>
                    ) : (
                        <Link href={item.href} className={LINK_CLASS}>
                            {item.label}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default LinkRow;
