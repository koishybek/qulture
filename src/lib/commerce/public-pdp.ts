import type {
  PublicCatalogLocale,
  PublicMediaView,
  PublicVariantView,
} from "@/lib/commerce/public-catalog";

export function publicProductSelectionKey(productId: string): string {
  return `qulture-product-selection-v1:${productId}`;
}

export function publicProductGallery(
  productMedia: readonly PublicMediaView[],
  variantMedia: readonly PublicMediaView[] = [],
): PublicMediaView[] {
  const seen = new Set<string>();
  const gallery: PublicMediaView[] = [];
  for (const item of [...variantMedia, ...productMedia]) {
    if (seen.has(item.src)) continue;
    seen.add(item.src);
    gallery.push(item);
  }
  return gallery;
}

export function variantForColor(
  variants: readonly PublicVariantView[],
  colorCode: string,
  preferredSize?: string,
): PublicVariantView | undefined {
  const matching = variants.filter((variant) => variant.colorCode === colorCode);
  return (
    matching.find(
      (variant) => variant.size === preferredSize && variant.canAddToCart,
    ) ??
    matching.find((variant) => variant.canAddToCart) ??
    matching.find((variant) => variant.size === preferredSize) ??
    matching[0]
  );
}

export function restockWaitlistHref(
  locale: PublicCatalogLocale,
  productId: string,
  variantId: string,
): string {
  const query = new URLSearchParams({
    product: productId,
    variant: variantId,
    intent: "restock",
  });
  return `/${locale}/waitlist?${query.toString()}`;
}
