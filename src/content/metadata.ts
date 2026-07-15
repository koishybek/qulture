import type { Metadata } from "next";

import { localizePath, type Locale } from "@/lib/i18n";
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
  ru: "ru_KZ",
  kz: "kk_KZ",
};

export function createPageMetadata(locale: Locale, options: MetadataOptions): Metadata {
  const origin = configuredSiteOrigin();
  const canonicalPath = localizePath(locale, options.path);
  const canonical = absoluteSiteUrl(origin, canonicalPath);
  const alternateLocale: Locale = locale === "ru" ? "kz" : "ru";
  const baseOpenGraph = {
    title: options.seo.title,
    description: options.seo.description,
    ...(canonical ? { url: canonical } : {}),
    locale: openGraphLocales[locale],
    alternateLocale: [openGraphLocales[alternateLocale]],
  };

  return {
    title: options.seo.title,
    description: options.seo.description,
    ...(canonical
      ? {
          alternates: {
            canonical,
            languages: {
              ru: absoluteSiteUrl(origin, localizePath("ru", options.path))!,
              kk: absoluteSiteUrl(origin, localizePath("kz", options.path))!,
            },
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
