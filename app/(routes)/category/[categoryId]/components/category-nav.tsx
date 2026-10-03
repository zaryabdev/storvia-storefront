import Link from "next/link";

import { cn } from "@/lib/utils";
import { Category } from "@/types";

interface CategoryNavProps {
  parent: Category;
  items: Category[];
  activeId: string;
};

/**
 * Category chip row (all breakpoints): "All {parent}" + the parent's
 * children. Links are navigation (aria-current), not toggles; chip classes
 * mirror filter.tsx's active/inactive pair. Links deliberately carry no
 * query params — switching category resets the size/color filters, as the
 * previous vertical list did.
 */
const CategoryNav: React.FC<CategoryNavProps> = ({
  parent,
  items,
  activeId,
}) => {
  const routes = [
    { id: parent.id, label: `All ${parent.name}` },
    ...items.map((item) => ({ id: item.id, label: item.name })),
  ];

  return (
    <nav aria-label="Categories" className="mb-4">
      <ul className="flex snap-x scroll-px-1 gap-2 overflow-x-auto p-1">
        {routes.map((route) => {
          const active = route.id === activeId;

          return (
            <li key={route.id} className="flex-none snap-start">
              <Link
                href={`/category/${route.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  'inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border px-4 text-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-foreground hover:bg-surface-muted',
                )}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryNav;
