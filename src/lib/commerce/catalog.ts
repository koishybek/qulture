import { db } from "@/lib/db";
import { cache } from "react";
import {
  commerceTextMap,
  localizedCommerceText,
  type CommerceLocale,
} from "@/lib/commerce/locale";

export type DemoVariantView = {
  id: string;
  size: string;
  sku: string;
  stock: number;
  available: number;
  color: string;
  colorByLocale: Record<CommerceLocale, string>;
};

export type DemoProductView = {
  id: string;
  slug: string;
  name: string;
  nameByLocale: Record<CommerceLocale, string>;
  description: string;
  category: "TOP" | "BOTTOM" | string;
  price: number;
  currency: "KZT";
  variants: DemoVariantView[];
};

export type DemoBundleView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  discountPercent: number;
  products: Array<DemoProductView & { role: "top" | "pants" }>;
};

function productName(
  product: { nameEn: string | null; nameRu: string; nameKz: string },
  locale: CommerceLocale,
): string {
  return localizedCommerceText(
    locale,
    { en: product.nameEn, ru: product.nameRu, kz: product.nameKz },
    "QULTURE demo product",
  );
}

function productDescription(
  product: {
    descriptionEn: string | null;
    descriptionRu: string;
    descriptionKz: string;
  },
  locale: CommerceLocale,
): string {
  return localizedCommerceText(
    locale,
    { en: product.descriptionEn, ru: product.descriptionRu, kz: product.descriptionKz },
    "Demo data for interface verification only. This is not a public product.",
  );
}

function toDemoProduct(
  product: {
    id: string;
    slug: string;
    nameEn: string | null;
    nameRu: string;
    nameKz: string;
    descriptionEn: string | null;
    descriptionRu: string;
    descriptionKz: string;
    category: string;
    priceMinor: number | null;
    currency: string;
    variants: Array<{
      id: string;
      sizeLabel: string;
      sku: string;
      stock: number;
      reservedStock: number;
      colorNameRu: string;
      colorNameKz: string;
      colorNameEn: string | null;
    }>;
  },
  locale: CommerceLocale,
): DemoProductView {
  if (product.priceMinor === null || product.currency !== "KZT") {
    throw new Error(`Invalid demo price fixture: ${product.slug}`);
  }

  return {
    id: product.id,
    slug: product.slug,
    name: productName(product, locale),
    nameByLocale: commerceTextMap(
      { en: product.nameEn, ru: product.nameRu, kz: product.nameKz },
      "QULTURE demo product",
    ),
    description: productDescription(product, locale),
    category: product.category,
    price: product.priceMinor,
    currency: "KZT",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.sizeLabel,
      sku: variant.sku,
      stock: variant.stock,
      available: Math.max(0, variant.stock - variant.reservedStock),
      color: localizedCommerceText(
        locale,
        { en: variant.colorNameEn, ru: variant.colorNameRu, kz: variant.colorNameKz },
        "Demo graphite",
      ),
      colorByLocale: commerceTextMap(
        { en: variant.colorNameEn, ru: variant.colorNameRu, kz: variant.colorNameKz },
        "Demo graphite",
      ),
    })),
  };
}

const demoProductInclude = {
  variants: {
    where: { isDemo: true, active: true },
    orderBy: { sizeLabel: "asc" as const },
  },
};

export const getCommerceSettings = cache(async function getCommerceSettings() {
  return db.siteSettings.findUnique({
    where: { id: "default" },
    select: {
      siteMode: true,
      demoMode: true,
      catalogVisible: true,
      controlledPreview: true,
    },
  });
});

export async function getDemoProducts(
  locale: CommerceLocale,
): Promise<DemoProductView[]> {
  const products = await db.product.findMany({
    where: { isDemo: true, status: "DRAFT" },
    include: demoProductInclude,
    orderBy: { category: "desc" },
  });

  return products.map((product) => toDemoProduct(product, locale));
}

export async function getDemoProduct(
  slug: string,
  locale: CommerceLocale,
): Promise<DemoProductView | null> {
  const product = await db.product.findFirst({
    where: { slug, isDemo: true, status: "DRAFT" },
    include: demoProductInclude,
  });

  return product ? toDemoProduct(product, locale) : null;
}

export async function getDemoCollection(
  slug: string,
  locale: CommerceLocale,
): Promise<{
  slug: string;
  name: string;
  description: string;
  products: DemoProductView[];
} | null> {
  const collection = await db.collection.findFirst({
    where: { slug, isDemo: true, status: "DRAFT" },
    include: {
      products: {
        where: { isDemo: true, status: "DRAFT" },
        include: demoProductInclude,
      },
    },
  });

  if (!collection) return null;

  return {
    slug: collection.slug,
    name: localizedCommerceText(
      locale,
      { en: collection.nameEn, ru: collection.nameRu, kz: collection.nameKz },
      "QULTURE demo collection",
    ),
    description: localizedCommerceText(
      locale,
      {
        en: collection.descriptionEn,
        ru: collection.descriptionRu,
        kz: collection.descriptionKz,
      },
      "Demo data for interface verification only.",
    ),
    products: collection.products.map((product) => toDemoProduct(product, locale)),
  };
}

export async function getDemoBundle(
  locale: CommerceLocale,
): Promise<DemoBundleView | null> {
  const bundle = await db.bundle.findFirst({
    where: { isDemo: true, status: "DRAFT" },
    include: {
      components: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: { include: demoProductInclude },
        },
      },
    },
  });

  if (!bundle) return null;

  const discountPercent =
    bundle.discountType === "PERCENTAGE" ? bundle.discountValue / 100 : 0;

  return {
    id: bundle.id,
    slug: bundle.slug,
    name: localizedCommerceText(
      locale,
      { en: bundle.nameEn, ru: bundle.nameRu, kz: bundle.nameKz },
      "QULTURE demo set",
    ),
    description: localizedCommerceText(
      locale,
      { en: bundle.descriptionEn, ru: bundle.descriptionRu, kz: bundle.descriptionKz },
      "Demo data for interface verification only.",
    ),
    discountPercent,
    products: bundle.components.map((component) => ({
      ...toDemoProduct(component.product, locale),
      role: component.role === "BOTTOM" ? "pants" : "top",
    })),
  };
}
