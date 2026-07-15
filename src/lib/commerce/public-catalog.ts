import { cache } from "react";

import { db } from "@/lib/db";

export type PublicCatalogLocale = "ru" | "kz";

export type PublicMediaView = {
  src: string;
  alt: string;
};

export type PublicAvailability =
  | "in_stock"
  | "low_stock"
  | "preorder"
  | "unavailable";

export type PublicVariantView = {
  id: string;
  sku: string;
  size: string;
  colorCode: string;
  color: string;
  availableUnits: number;
  availability: PublicAvailability;
  priceMinor: number | null;
  comparePriceMinor: number | null;
  incomingEta: string | null;
  leadTimeDays: number | null;
  media: PublicMediaView[];
  canAddToCart: boolean;
};

export type PublicProductView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  role: "top" | "pants" | "single";
  currency: string;
  priceFromMinor: number | null;
  priceToMinor: number | null;
  comparePriceMinor: number | null;
  isPreorder: boolean;
  preorderEta: string | null;
  media: PublicMediaView[];
  technologyTags: string[];
  care: string | null;
  buildSetSlug: string | null;
  variants: PublicVariantView[];
  hasPurchasableVariant: boolean;
};

export type PublicCollectionSummary = {
  slug: string;
  name: string;
  description: string | null;
  heroMedia: PublicMediaView[];
  productCount: number;
};

export type PublicCollectionView = PublicCollectionSummary & {
  products: PublicProductView[];
};

export type PublicBundleDiscount =
  | { type: "PERCENTAGE"; value: number; percent: number }
  | { type: "FIXED"; value: number; percent: null };

export type PublicBundleComponentView = {
  id: string;
  role: "top" | "pants" | "single";
  requiredQuantity: number;
  allowSeparatePurchase: boolean;
  product: PublicProductView;
};

export type PublicBundleView = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  currency: string;
  discount: PublicBundleDiscount;
  media: PublicMediaView[];
  components: PublicBundleComponentView[];
};

export type PublicCatalogView = {
  products: PublicProductView[];
  collections: PublicCollectionSummary[];
  bundles: PublicBundleView[];
};

type ProductRecord = {
  id: string;
  slug: string;
  nameRu: string;
  nameKz: string;
  descriptionRu: string;
  descriptionKz: string;
  category: string;
  priceMinor: number | null;
  comparePriceMinor: number | null;
  currency: string;
  isPreorder: boolean;
  preorderEta: Date | null;
  media: unknown;
  technologyTags: unknown;
  careRu: string | null;
  careKz: string | null;
  bundleComponents?: Array<{ bundle: { slug: string } }>;
  variants: VariantRecord[];
};

type VariantRecord = {
  id: string;
  sku: string;
  sizeLabel: string;
  colorCode: string;
  colorNameRu: string;
  colorNameKz: string;
  stock: number;
  reservedStock: number;
  priceMinor: number | null;
  comparePriceMinor: number | null;
  incomingEta: Date | null;
  leadTimeDays: number | null;
  media: unknown;
};

const activeVariantQuery = {
  where: { active: true, isDemo: false },
  orderBy: [
    { colorCode: "asc" as const },
    { sizeLabel: "asc" as const },
  ],
};

const activeProductQuery = {
  where: { status: "ACTIVE" as const, isDemo: false },
  include: {
    variants: activeVariantQuery,
    bundleComponents: {
      where: { bundle: { status: "ACTIVE" as const, isDemo: false } },
      select: { bundle: { select: { slug: true } } },
      take: 1,
    },
  },
  orderBy: [
    { publishedAt: "desc" as const },
    { createdAt: "desc" as const },
  ],
};

function localized(
  locale: PublicCatalogLocale,
  ru: string,
  kz: string,
): string {
  return locale === "kz" ? kz : ru;
}

function optionalLocalized(
  locale: PublicCatalogLocale,
  ru: string | null,
  kz: string | null,
): string | null {
  const value = locale === "kz" ? kz : ru;
  return value?.trim() || null;
}

function isMinorUnits(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

export function safeInternalMediaPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.includes("\0")
  ) {
    return null;
  }

  const pathOnly = candidate.split(/[?#]/, 1)[0] ?? "";
  try {
    const decodedSegments = decodeURIComponent(pathOnly).split("/");
    if (decodedSegments.includes("..")) return null;
  } catch {
    return null;
  }
  return candidate;
}

function mediaAlt(
  item: Record<string, unknown>,
  locale: PublicCatalogLocale,
  fallbackAlt: string,
): string {
  const localizedAlt = locale === "kz" ? item.altKz : item.altRu;
  if (typeof localizedAlt === "string" && localizedAlt.trim()) {
    return localizedAlt.trim();
  }
  if (item.alt && typeof item.alt === "object" && !Array.isArray(item.alt)) {
    const fromMap = (item.alt as Record<string, unknown>)[locale];
    if (typeof fromMap === "string" && fromMap.trim()) return fromMap.trim();
  }
  return typeof item.alt === "string" && item.alt.trim()
    ? item.alt.trim()
    : fallbackAlt;
}

/**
 * Accepts simple paths, media objects, or common `items`/`images`/`gallery`
 * containers. External and traversal paths are deliberately discarded.
 */
export function parsePublicMedia(
  value: unknown,
  locale: PublicCatalogLocale,
  fallbackAlt: string,
): PublicMediaView[] {
  const parsed: PublicMediaView[] = [];
  const seen = new Set<string>();

  function append(candidate: unknown): void {
    if (parsed.length >= 12 || candidate === null || candidate === undefined) {
      return;
    }
    if (typeof candidate === "string") {
      const src = safeInternalMediaPath(candidate);
      if (src && !seen.has(src)) {
        seen.add(src);
        parsed.push({ src, alt: fallbackAlt });
      }
      return;
    }
    if (Array.isArray(candidate)) {
      for (const item of candidate) append(item);
      return;
    }
    if (typeof candidate !== "object") return;

    const item = candidate as Record<string, unknown>;
    const src = safeInternalMediaPath(item.src ?? item.path ?? item.url);
    if (src && !seen.has(src)) {
      seen.add(src);
      parsed.push({ src, alt: mediaAlt(item, locale, fallbackAlt) });
    }
    for (const key of ["items", "images", "gallery", "media"] as const) {
      if (item[key] !== candidate) append(item[key]);
    }
  }

  append(value);
  return parsed;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function productRole(category: string): "top" | "pants" | "single" {
  const normalized = category.trim().toLowerCase();
  if (
    normalized.includes("bottom") ||
    normalized.includes("pant") ||
    normalized.includes("trouser")
  ) {
    return "pants";
  }
  if (
    normalized.includes("top") ||
    normalized.includes("jacket") ||
    normalized.includes("outer")
  ) {
    return "top";
  }
  return "single";
}

function componentRole(role: string): "top" | "pants" | "single" {
  return productRole(role);
}

function effectivePrice(
  productPriceMinor: number | null,
  variantPriceMinor: number | null,
): number | null {
  const value = variantPriceMinor ?? productPriceMinor;
  return isMinorUnits(value) ? value : null;
}

function availability(
  availableUnits: number,
  isPreorder: boolean,
): PublicAvailability {
  if (availableUnits > 2) return "in_stock";
  if (availableUnits > 0) return "low_stock";
  return isPreorder ? "preorder" : "unavailable";
}

function toPublicProduct(
  product: ProductRecord,
  locale: PublicCatalogLocale,
): PublicProductView {
  const name = localized(locale, product.nameRu, product.nameKz);
  const variants = product.variants.map<PublicVariantView>((variant) => {
    const availableUnits = Math.max(0, variant.stock - variant.reservedStock);
    const priceMinor = effectivePrice(product.priceMinor, variant.priceMinor);
    const comparePriceMinor = effectivePrice(
      product.comparePriceMinor,
      variant.comparePriceMinor,
    );
    const state = availability(availableUnits, product.isPreorder);
    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.sizeLabel,
      colorCode: variant.colorCode,
      color: localized(locale, variant.colorNameRu, variant.colorNameKz),
      availableUnits,
      availability: state,
      priceMinor,
      comparePriceMinor:
        comparePriceMinor !== null &&
        priceMinor !== null &&
        comparePriceMinor > priceMinor
          ? comparePriceMinor
          : null,
      incomingEta: (variant.incomingEta ?? product.preorderEta)?.toISOString() ?? null,
      leadTimeDays: variant.leadTimeDays,
      media: parsePublicMedia(variant.media, locale, name),
      canAddToCart:
        product.currency === "KZT" &&
        priceMinor !== null &&
        state !== "unavailable",
    };
  });
  const variantPrices = variants.flatMap((variant) =>
    variant.priceMinor === null ? [] : [variant.priceMinor],
  );
  const basePrice = isMinorUnits(product.priceMinor) ? product.priceMinor : null;
  const prices = variantPrices.length > 0
    ? variantPrices
    : basePrice === null
      ? []
      : [basePrice];
  const comparePriceMinor = isMinorUnits(product.comparePriceMinor)
    ? product.comparePriceMinor
    : null;

  return {
    id: product.id,
    slug: product.slug,
    name,
    description: localized(
      locale,
      product.descriptionRu,
      product.descriptionKz,
    ),
    category: product.category,
    role: productRole(product.category),
    currency: product.currency,
    priceFromMinor: prices.length > 0 ? Math.min(...prices) : null,
    priceToMinor: prices.length > 0 ? Math.max(...prices) : null,
    comparePriceMinor:
      comparePriceMinor !== null &&
      prices.length > 0 &&
      comparePriceMinor > Math.min(...prices)
        ? comparePriceMinor
        : null,
    isPreorder: product.isPreorder,
    preorderEta: product.preorderEta?.toISOString() ?? null,
    media: parsePublicMedia(product.media, locale, name),
    technologyTags: stringList(product.technologyTags),
    care: optionalLocalized(locale, product.careRu, product.careKz),
    buildSetSlug: product.bundleComponents?.[0]?.bundle.slug ?? null,
    variants,
    hasPurchasableVariant: variants.some((variant) => variant.canAddToCart),
  };
}

function toCollectionSummary(
  collection: {
    slug: string;
    nameRu: string;
    nameKz: string;
    descriptionRu: string | null;
    descriptionKz: string | null;
    heroMedia: unknown;
    products: Array<{ id: string }>;
  },
  locale: PublicCatalogLocale,
): PublicCollectionSummary {
  const name = localized(locale, collection.nameRu, collection.nameKz);
  return {
    slug: collection.slug,
    name,
    description: optionalLocalized(
      locale,
      collection.descriptionRu,
      collection.descriptionKz,
    ),
    heroMedia: parsePublicMedia(collection.heroMedia, locale, name),
    productCount: collection.products.length,
  };
}

function toPublicBundle(
  bundle: {
    id: string;
    slug: string;
    nameRu: string;
    nameKz: string;
    descriptionRu: string | null;
    descriptionKz: string | null;
    currency: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    media: unknown;
    components: Array<{
      id: string;
      role: string;
      requiredQuantity: number;
      allowSeparatePurchase: boolean;
      product: ProductRecord & { isDemo: boolean; status: string };
    }>;
  },
  locale: PublicCatalogLocale,
): PublicBundleView | null {
  if (
    !Number.isSafeInteger(bundle.discountValue) ||
    bundle.discountValue < 0 ||
    (bundle.discountType === "PERCENTAGE" && bundle.discountValue > 10_000) ||
    bundle.components.length === 0 ||
    bundle.components.some(
      (component) =>
        component.product.isDemo ||
        component.product.status !== "ACTIVE" ||
        !Number.isSafeInteger(component.requiredQuantity) ||
        component.requiredQuantity < 1,
    )
  ) {
    return null;
  }
  const name = localized(locale, bundle.nameRu, bundle.nameKz);
  return {
    id: bundle.id,
    slug: bundle.slug,
    name,
    description: optionalLocalized(
      locale,
      bundle.descriptionRu,
      bundle.descriptionKz,
    ),
    currency: bundle.currency,
    discount:
      bundle.discountType === "PERCENTAGE"
        ? {
            type: "PERCENTAGE",
            value: bundle.discountValue,
            percent: bundle.discountValue / 100,
          }
        : { type: "FIXED", value: bundle.discountValue, percent: null },
    media: parsePublicMedia(bundle.media, locale, name),
    components: bundle.components.map((component) => {
      const product = toPublicProduct(component.product, locale);
      const explicitRole = componentRole(component.role);
      return {
        id: component.id,
        role: explicitRole === "single" ? product.role : explicitRole,
        requiredQuantity: component.requiredQuantity,
        allowSeparatePurchase: component.allowSeparatePurchase,
        product,
      };
    }),
  };
}

/**
 * Public getters intentionally do not read SiteSettings. Route callers must
 * first gate `siteMode === COMMERCE && catalogVisible === true`.
 */
export const getPublicProducts = cache(async function getPublicProducts(
  locale: PublicCatalogLocale,
): Promise<PublicProductView[]> {
  const products = await db.product.findMany(activeProductQuery);
  return products.map((product) => toPublicProduct(product, locale));
});

export const getPublicProduct = cache(async function getPublicProduct(
  slug: string,
  locale: PublicCatalogLocale,
): Promise<PublicProductView | null> {
  const product = await db.product.findFirst({
    where: { slug, status: "ACTIVE", isDemo: false },
    include: {
      variants: activeVariantQuery,
      bundleComponents: {
        where: { bundle: { status: "ACTIVE", isDemo: false } },
        select: { bundle: { select: { slug: true } } },
        take: 1,
      },
    },
  });
  return product ? toPublicProduct(product, locale) : null;
});

export const getPublicCollections = cache(async function getPublicCollections(
  locale: PublicCatalogLocale,
): Promise<PublicCollectionSummary[]> {
  const collections = await db.collection.findMany({
    where: { status: "PUBLISHED", isDemo: false },
    include: {
      products: {
        where: { status: "ACTIVE", isDemo: false },
        select: { id: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
  });
  return collections.map((collection) =>
    toCollectionSummary(collection, locale),
  );
});

export const getPublicCollection = cache(async function getPublicCollection(
  slug: string,
  locale: PublicCatalogLocale,
): Promise<PublicCollectionView | null> {
  const collection = await db.collection.findFirst({
    where: { slug, status: "PUBLISHED", isDemo: false },
    include: { products: activeProductQuery },
  });
  if (!collection) return null;
  return {
    ...toCollectionSummary(collection, locale),
    products: collection.products.map((product) =>
      toPublicProduct(product, locale),
    ),
  };
});

export const getPublicBundles = cache(async function getPublicBundles(
  locale: PublicCatalogLocale,
): Promise<PublicBundleView[]> {
  const bundles = await db.bundle.findMany({
    where: { status: "ACTIVE", isDemo: false },
    include: {
      components: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: { include: { variants: activeVariantQuery } },
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return bundles.flatMap((bundle) => {
    const view = toPublicBundle(bundle, locale);
    return view ? [view] : [];
  });
});

export const getPublicBundle = cache(async function getPublicBundle(
  locale: PublicCatalogLocale,
  slug?: string,
): Promise<PublicBundleView | null> {
  const bundles = await getPublicBundles(locale);
  return slug
    ? bundles.find((bundle) => bundle.slug === slug) ?? null
    : bundles[0] ?? null;
});

export async function getPublicCatalog(
  locale: PublicCatalogLocale,
): Promise<PublicCatalogView> {
  const [products, collections, bundles] = await Promise.all([
    getPublicProducts(locale),
    getPublicCollections(locale),
    getPublicBundles(locale),
  ]);
  return { products, collections, bundles };
}
