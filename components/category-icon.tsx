import { CATEGORY_ICONS, isCategoryIconKey } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  iconKey?: string | null;
  className?: string;
}

/**
 * The Category's curated icon (lib/category-icons.ts). Decorative: the
 * category name next to it stays the label. An unknown key or no key
 * renders nothing, so icon-less categories look exactly as before.
 */
const CategoryIcon: React.FC<CategoryIconProps> = ({ iconKey, className }) => {
  if (!isCategoryIconKey(iconKey)) {
    return null;
  }

  const Icon = CATEGORY_ICONS[iconKey].icon;

  return <Icon size={18} aria-hidden="true" className={cn("shrink-0", className)} />;
};

export default CategoryIcon;
