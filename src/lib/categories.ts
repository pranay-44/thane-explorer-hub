export const CATEGORIES = [
  "Food & Dining",
  "Lakes & Nature",
  "Temples & Heritage",
  "Parks & Leisure",
  "Historical Sites",
  "Other Attractions",
] as const;

export type Category = (typeof CATEGORIES)[number];

type CategoryMeta = {
  badge: string;
  fallbackImage: string;
  dot: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  "Food & Dining": {
    badge: "bg-cat-food/15 text-cat-food ring-1 ring-cat-food/30",
    fallbackImage: "/images/cat-food.jpg",
    dot: "bg-cat-food",
  },
  "Lakes & Nature": {
    badge: "bg-cat-lakes/15 text-cat-lakes ring-1 ring-cat-lakes/30",
    fallbackImage: "/images/cat-lakes.jpg",
    dot: "bg-cat-lakes",
  },
  "Temples & Heritage": {
    badge: "bg-cat-temples/15 text-cat-temples ring-1 ring-cat-temples/30",
    fallbackImage: "/images/cat-temples.jpg",
    dot: "bg-cat-temples",
  },
  "Parks & Leisure": {
    badge: "bg-cat-parks/15 text-cat-parks ring-1 ring-cat-parks/30",
    fallbackImage: "/images/cat-parks.jpg",
    dot: "bg-cat-parks",
  },
  "Historical Sites": {
    badge: "bg-cat-historical/15 text-cat-historical ring-1 ring-cat-historical/30",
    fallbackImage: "/images/cat-historical.jpg",
    dot: "bg-cat-historical",
  },
  "Other Attractions": {
    badge: "bg-cat-other/15 text-cat-other ring-1 ring-cat-other/30",
    fallbackImage: "/images/cat-other.jpg",
    dot: "bg-cat-other",
  },
};

export function categoryMeta(category: string): CategoryMeta {
  return (
    CATEGORY_META[category as Category] ?? CATEGORY_META["Other Attractions"]
  );
}

/**
 * Cover images are either a static path (seed data) or a storage object key
 * (`<userId>/<file>.webp`) served through the public image proxy route.
 */
export function postImageSrc(imageUrl: string | null, category: string): string {
  if (!imageUrl) return categoryMeta(category).fallbackImage;
  if (imageUrl.startsWith("/") || imageUrl.startsWith("http")) return imageUrl;
  return `/api/public/post-image/${imageUrl}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const PAGE_SIZE = 12;
