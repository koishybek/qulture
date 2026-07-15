import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDemoPage } from "@/components/commerce/product-demo-page";
import { ShopControlledPreview } from "@/components/commerce/shop-controlled-preview";
import { PublicProductPage } from "@/components/commerce/public-product-page";
import { getCommerceSettings, getDemoProduct } from "@/lib/commerce/catalog";
import { isDemoCommerceRequested } from "@/lib/commerce/demo-gate";
import { getPublicProduct } from "@/lib/commerce/public-catalog";
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
  if (demo) return { title: "Demo product", robots: { index: false, follow: false } };
  if (isLocale(locale) && settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const product = await getPublicProduct(slug, locale);
    if (product) {
      const origin = configuredSiteOrigin();
      const canonical = absoluteSiteUrl(origin, `/${locale}/product/${slug}`);
      const englishCanonical = absoluteSiteUrl(origin, `/en/product/${slug}`);
      const russianCanonical = absoluteSiteUrl(origin, `/ru/product/${slug}`);
      const kazakhCanonical = absoluteSiteUrl(origin, `/kz/product/${slug}`);
      const images = product.media.flatMap((item) => {
        const url = absoluteSiteUrl(origin, item.src);
        return url ? [{ url, alt: item.alt }] : [];
      });
      return {
        title: product.name,
        description: product.description,
        ...(canonical && englishCanonical && russianCanonical && kazakhCanonical
          ? {
              alternates: {
                canonical,
                languages: {
                  en: englishCanonical,
                  ru: russianCanonical,
                  kk: kazakhCanonical,
                  "x-default": englishCanonical,
                },
              },
            }
          : {}),
        ...(images.length > 0 ? { openGraph: { images } } : {}),
      };
    }
  }
  return {
    title: "Product preview",
    robots: { index: false, follow: true },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [{ locale, slug }, query, settings] = await Promise.all([
    params,
    searchParams,
    getCommerceSettings(),
  ]);
  if (!isLocale(locale)) notFound();
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  if (demo) {
    const product = await getDemoProduct(slug, locale);
    if (!product) notFound();
    return <ProductDemoPage locale={locale} product={product} />;
  }
  if (settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const product = await getPublicProduct(slug, locale);
    if (!product) notFound();
    const siteOrigin = configuredSiteOrigin();
    const productUrl = absoluteSiteUrl(siteOrigin, `/${locale}/product/${product.slug}`);
    const offers = product.variants.filter((variant) => variant.canAddToCart && variant.priceMinor !== null).map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      priceCurrency: product.currency,
      price: variant.priceMinor,
      ...(productUrl ? { url: productUrl } : {}),
      availability: `https://schema.org/${variant.availability === "preorder" ? "PreOrder" : variant.availability === "low_stock" ? "LimitedAvailability" : "InStock"}`,
    }));
    const productImages = product.media.flatMap((item) => {
      const url = absoluteSiteUrl(siteOrigin, item.src);
      return url ? [url] : [];
    });
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: product.variants[0]?.sku,
      ...(productImages.length > 0 ? { image: productImages } : {}),
      ...(offers.length ? { offers } : {}),
    };
    return <><PublicProductPage locale={locale} product={product} /><script dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} type="application/ld+json" /></>;
  }
  if (settings?.controlledPreview !== true) notFound();
  return <ShopControlledPreview context="product" locale={locale} />;
}
