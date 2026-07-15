import type { Metadata } from "next";

import { locales, localizePath, type Locale } from "@/lib/i18n";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";
import type { PageSeo } from "./types";

type MetadataOptions = {
  path: string;
  seo: PageSeo;
  type?: "website" | "article";
  publishedAt?: string;
  modifiedAt?: string;
  noIndex?: boolean;
};

const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_KZ",
  kz: "kk_KZ",
};

function localizedLanguageAlternates(origin: string | null, path: string) {
  const english = absoluteSiteUrl(origin, localizePath("en", path));
  const russian = absoluteSiteUrl(origin, localizePath("ru", path));
  const kazakh = absoluteSiteUrl(origin, localizePath("kz", path));

  if (!english || !russian || !kazakh) return null;

  return {
    en: english,
    ru: russian,
    kk: kazakh,
    "x-default": english,
  };
}

export function createPageMetadata(locale: Locale, options: MetadataOptions): Metadata {
  const origin = configuredSiteOrigin();
  const canonicalPath = localizePath(locale, options.path);
  const canonical = absoluteSiteUrl(origin, canonicalPath);
  const languageAlternates = localizedLanguageAlternates(origin, options.path);
  const alternateOpenGraphLocales = locales
    .filter((candidate) => candidate !== locale)
    .map((candidate) => openGraphLocales[candidate]);
  const baseOpenGraph = {
    title: options.seo.title,
    description: options.seo.description,
    ...(canonical ? { url: canonical } : {}),
    locale: openGraphLocales[locale],
    alternateLocale: alternateOpenGraphLocales,
  };

  return {
    title: options.seo.title,
    description: options.seo.description,
    ...(canonical && languageAlternates
      ? {
          alternates: {
            canonical,
            languages: languageAlternates,
          },
        }
      : {}),
    openGraph:
      options.type === "article"
        ? {
            ...baseOpenGraph,
            type: "article",
            publishedTime: options.publishedAt,
            modifiedTime: options.modifiedAt,
          }
        : { ...baseOpenGraph, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: options.seo.title,
      description: options.seo.description,
    },
    robots: options.noIndex ? { index: false, follow: false } : undefined,
  };
}
