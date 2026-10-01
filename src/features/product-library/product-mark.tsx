import type { LibraryProduct } from "@/features/product-library/product-library-types";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: { tile: "size-9", art: "h-6 w-6" },
  md: { tile: "size-10", art: "h-7 w-7" },
  lg: { tile: "size-12", art: "h-8 w-8" },
};

/**
 * A product, as its own small picture: its colour, with its pack or device
 * on it. The way a brand is recognised across the library, so a list of
 * claims, a filter and a detail page all show the same face for it.
 */
export function ProductMark({
  product,
  size = "md",
  className,
}: {
  product: Pick<LibraryProduct, "gradient" | "type" | "referenceImageUrl">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-control", s.tile, className)}
      style={{ background: product.gradient }}
    >
      <ProductArtwork kind={product.type} photoUrl={product.referenceImageUrl} className={cn("relative", s.art)} />
    </span>
  );
}
