import Link from "next/link";

import getCategories from "@/actions/get-categories";
import Container from "@/components/ui/container";

export const revalidate = 0;

/**
 * All categories, two levels (same flat `parentId` matching as MobileNav).
 */
const CategoriesPage = async () => {
  const categories = await getCategories();
  const topLevel = categories.filter((category) => !category.parentId);

  return (
    <div className="bg-background">
      <Container>
        <div className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-heading text-foreground">All categories</h1>

          {topLevel.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 rounded-surface border border-border bg-surface-muted px-6 py-16 text-center">
              <p className="text-body text-muted-foreground">No categories yet.</p>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {topLevel.map((parent) => {
                const children = categories.filter((item) => item.parentId === parent.id);

                return (
                  <section key={parent.id}>
                    <h2 className="text-subheading text-foreground">
                      <Link
                        href={`/category/${parent.id}`}
                        className="rounded-control underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      >
                        {parent.name}
                      </Link>
                    </h2>
                    {children.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/category/${child.id}`}
                              className="inline-flex min-h-[44px] items-center rounded-control text-body text-foreground underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default CategoriesPage;
