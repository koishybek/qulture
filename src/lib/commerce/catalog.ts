import { db } from "@/lib/db";
import { cache } from "react";

export type DemoVariantView = {
  id: string;
  size: string;
  sku: string;
  stock: number;
  available: number;
  color: string;
};

export type DemoProductView = {
  id: string;
  slug: string;
  name: string;
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
  product: { nameRu: string; nameKz: string },
  locale: "ru" | "kz",
): string {
  return locale === "kz" ? product.nameKz : product.nameRu;
}

function productDescription(
  product: { descriptionRu: string; descriptionKz: string },
  locale: "ru" | "kz",
): string {
  return locale === "kz" ? product.descriptionKz : product.descriptionRu;
}

function toDemoProduct(
  product: {
    id: string;
    slug: string;
    nameRu: string;
    nameKz: string;
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
    }>;
  },
  locale: "ru" | "kz",
): DemoProductView {
  if (product.priceMinor === null || product.currency !== "KZT") {
    throw new Error(`Invalid demo price fixture: ${product.slug}`);
  }

  return {
    id: product.id,
    slug: product.slug,
    name: productName(product, locale),
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
      color: locale === "kz" ? variant.colorNameKz : variant.colorNameRu,
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
  locale: "ru" | "kz",
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
  locale: "ru" | "kz",
): Promise<DemoProductView | null> {
  const product = await db.product.findFirst({
    where: { slug, isDemo: true, status: "DRAFT" },
    include: demoProductInclude,
  });

  return product ? toDemoProduct(product, locale) : null;
}

export async function getDemoCollection(
  slug: string,
  locale: "ru" | "kz",
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
    name: locale === "kz" ? collection.nameKz : collection.nameRu,
    description:
      (locale === "kz" ? collection.descriptionKz : collection.descriptionRu) ?? "",
    products: collection.products.map((product) => toDemoProduct(product, locale)),
  };
}

export async function getDemoBundle(
  locale: "ru" | "kz",
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
    name: locale === "kz" ? bundle.nameKz : bundle.nameRu,
    description:
      (locale === "kz" ? bundle.descriptionKz : bundle.descriptionRu) ?? "",
    discountPercent,
    products: bundle.components.map((component) => ({
      ...toDemoProduct(component.product, locale),
      role: component.role === "BOTTOM" ? "pants" : "top",
    })),
  };
}
