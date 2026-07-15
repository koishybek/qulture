import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { locales, localizePath } from "@/lib/i18n";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

const publicPaths = [
  "",
  "/shop",
  "/technology",
  "/technology/materials",
  "/technology/climate-logic",
  "/journal",
  "/journal/building-qulture-openly",
  "/about",
  "/waitlist",
  "/delivery-and-returns",
  "/faq",
  "/contacts",
  "/privacy",
  "/terms",
  "/cookies",
  "/consent",
];

function languageAlternates(origin: string, path: string) {
  const english = absoluteSiteUrl(origin, localizePath("en", path))!;
  const russian = absoluteSiteUrl(origin, localizePath("ru", path))!;
  const kazakh = absoluteSiteUrl(origin, localizePath("kz", path))!;

  return {
    en: english,
    ru: russian,
    kk: kazakh,
    "x-default": english,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = configuredSiteOrigin();
  if (!origin) return [];
  const now = new Date();
  const settings = await db.siteSettings.findUnique({ where: { id: "default" }, select: { siteMode: true, catalogVisible: true } });
  const commerceOpen = settings?.siteMode === "COMMERCE" && settings.catalogVisible;
  const [products, collections] = commerceOpen ? await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE", isDemo: false }, select: { slug: true, updatedAt: true } }),
    db.collection.findMany({ where: { status: "PUBLISHED", isDemo: false }, select: { slug: true, updatedAt: true } }),
  ]) : [[], []];
  const staticEntries = locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: absoluteSiteUrl(origin, localizePath(locale, path))!,
      lastModified: now,
      changeFrequency: path === "" || path === "/journal" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : path === "/waitlist" ? 0.8 : 0.6,
      alternates: {
        languages: languageAlternates(origin, path),
      },
    })),
  );
  const commerceEntries = locales.flatMap((locale) => [
    ...products.map((product) => ({ path: `/product/${product.slug}`, updatedAt: product.updatedAt })),
    ...collections.map((collection) => ({ path: `/collections/${collection.slug}`, updatedAt: collection.updatedAt })),
  ].map(({ path, updatedAt }) => ({
    url: absoluteSiteUrl(origin, localizePath(locale, path))!,
    lastModified: updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: {
      languages: languageAlternates(origin, path),
    },
  })));
  return [...staticEntries, ...commerceEntries];
}
