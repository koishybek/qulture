import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BuildSetDemoPage } from "@/components/commerce/build-set-demo-page";
import { ShopControlledPreview } from "@/components/commerce/shop-controlled-preview";
import { PublicBuildSetPage } from "@/components/commerce/public-build-set-page";
import { getCommerceSettings, getDemoBundle } from "@/lib/commerce/catalog";
import { isDemoCommerceRequested } from "@/lib/commerce/demo-gate";
import { getPublicBundle } from "@/lib/commerce/public-catalog";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    bundle?: string | string[];
    demo?: string | string[];
  }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale }, query, settings] = await Promise.all([params, searchParams, getCommerceSettings()]);
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  if (demo) return { title: "Demo build a set", robots: { index: false, follow: false } };
  if (isLocale(locale) && settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const bundleSlug = typeof query.bundle === "string" ? query.bundle : undefined;
    const bundle = await getPublicBundle(locale, bundleSlug);
    if (bundle) return { title: bundle.name, description: bundle.description ?? undefined };
  }
  return {
    title: "Build a set",
  };
}

export default async function BuildASetPage({ params, searchParams }: PageProps) {
  const [{ locale }, query, settings] = await Promise.all([
    params,
    searchParams,
    getCommerceSettings(),
  ]);
  if (!isLocale(locale)) notFound();
  const demo = isDemoCommerceRequested(query.demo, settings?.demoMode);
  if (demo) {
    const bundle = await getDemoBundle(locale);
    if (!bundle) notFound();
    return <BuildSetDemoPage bundle={bundle} locale={locale} />;
  }
  if (settings?.siteMode === "COMMERCE" && settings.catalogVisible) {
    const bundleSlug = typeof query.bundle === "string" ? query.bundle : undefined;
    const bundle = await getPublicBundle(locale, bundleSlug);
    if (!bundle) return <ShopControlledPreview context="set" locale={locale} />;
    return <PublicBuildSetPage bundle={bundle} locale={locale} />;
  }
  if (settings?.controlledPreview !== true) notFound();
  return <ShopControlledPreview context="set" locale={locale} />;
}
