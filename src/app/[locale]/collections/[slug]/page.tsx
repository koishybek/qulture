import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopControlledPreview } from "@/components/commerce/shop-controlled-preview";
import { ShopDemoPage } from "@/components/commerce/shop-demo-page";
import { PublicCatalogPage } from "@/components/commerce/public-catalog-page";
import { getCommerceSettings, getDemoCollection } from "@/lib/commerce/catalog";
import { isDemoCommerceRequested } from "@/lib/commerce/demo-gate";
import { getPublicCollection } from "@/lib/commerce/public-catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ demo?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale, slug }, query, settings] = await Promise.all([params, searchParams, getCommerceSettings()]);
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  if (demo) return { title: "Demo collection", robots: { index: false, follow: false } };
  if (isLocale(locale) && settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const collection = await getPublicCollection(slug, locale);
    if (collection) {
      const origin = configuredSiteOrigin();
      const canonical = absoluteSiteUrl(origin, `/${locale}/collections/${slug}`);
      return {
        title: collection.name,
        description: collection.description ?? undefined,
        ...(canonical
          ? {
              alternates: {
                canonical,
                languages: {
                  ru: absoluteSiteUrl(origin, `/ru/collections/${slug}`)!,
                  kk: absoluteSiteUrl(origin, `/kz/collections/${slug}`)!,
                },
              },
            }
          : {}),
      };
    }
  }
  return {
    title: "Collection preview",
    robots: { index: false, follow: true },
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const [{ locale, slug }, query, settings] = await Promise.all([
    params,
    searchParams,
    getCommerceSettings(),
  ]);
  if (!isLocale(locale)) notFound();
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  if (demo) {
    const collection = await getDemoCollection(slug, locale);
    if (!collection) notFound();
    return <ShopDemoPage collectionName={collection.name} locale={locale} products={collection.products} />;
  }
  if (settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const collection = await getPublicCollection(slug, locale);
    if (!collection) notFound();
    return <PublicCatalogPage description={collection.description} eyebrow="QULTURE / COLLECTION" locale={locale} products={collection.products} title={collection.name} />;
  }
  if (settings?.controlledPreview !== true) notFound();
  return <ShopControlledPreview context="collection" locale={locale} />;
}
