import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopControlledPreview } from "@/components/commerce/shop-controlled-preview";
import { ShopDemoPage } from "@/components/commerce/shop-demo-page";
import { PublicCatalogPage } from "@/components/commerce/public-catalog-page";
import { getCommerceSettings, getDemoProducts } from "@/lib/commerce/catalog";
import { isDemoCommerceRequested } from "@/lib/commerce/demo-gate";
import { getPublicCatalog } from "@/lib/commerce/public-catalog";
import { commerceText } from "@/lib/commerce/locale";
import { isLocale } from "@/lib/i18n";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    demo?: string | string[];
    q?: string | string[];
    search?: string | string[];
  }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale }, query, settings] = await Promise.all([params, searchParams, getCommerceSettings()]);
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  const origin = configuredSiteOrigin();
  const canonical = isLocale(locale)
    ? absoluteSiteUrl(origin, `/${locale}/shop`)
    : null;
  return {
    title: demo
      ? "Demo catalog"
      : isLocale(locale)
        ? commerceText(locale, "Shop", "Магазин", "Каталог")
        : "Shop",
    robots: demo ? { index: false, follow: false } : undefined,
    ...(!demo && canonical
      ? {
          alternates: {
            canonical,
            languages: {
              en: absoluteSiteUrl(origin, "/en/shop")!,
              ru: absoluteSiteUrl(origin, "/ru/shop")!,
              kk: absoluteSiteUrl(origin, "/kz/shop")!,
              "x-default": absoluteSiteUrl(origin, "/en/shop")!,
            },
          },
        }
      : {}),
  };
}

export default async function ShopPage({ params, searchParams }: PageProps) {
  const [{ locale }, query, settings] = await Promise.all([
    params,
    searchParams,
    getCommerceSettings(),
  ]);
  if (!isLocale(locale)) notFound();
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  const searchQuery = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const searchOpen = query.search === "1" || Boolean(searchQuery);
  if (demo) {
    const products = await getDemoProducts(locale);
    return <ShopDemoPage locale={locale} products={products} />;
  }
  if (settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const catalog = await getPublicCatalog(locale);
    return <PublicCatalogPage bundles={catalog.bundles} collections={catalog.collections} locale={locale} products={catalog.products} searchOpen={searchOpen} searchQuery={searchQuery} />;
  }
  if (settings?.controlledPreview !== true) notFound();
  return <ShopControlledPreview locale={locale} searchRequested={searchOpen} />;
}
