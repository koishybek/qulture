import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import {
  DOCUMENT_LANGUAGE_HEADER,
  parseDocumentLanguage,
} from "@/lib/i18n/document-language";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

import "./globals.css";

const siteOrigin = configuredSiteOrigin();
const englishCanonical = absoluteSiteUrl(siteOrigin, "/en");
const russianCanonical = absoluteSiteUrl(siteOrigin, "/ru");
const kazakhCanonical = absoluteSiteUrl(siteOrigin, "/kz");
const heroImage = absoluteSiteUrl(siteOrigin, "/media/hero/hero-poster.png");

export const metadata: Metadata = {
  ...(siteOrigin ? { metadataBase: new URL(siteOrigin) } : {}),
  title: {
    default: "QULTURE — Designed for changing climates",
    template: "%s — QULTURE",
  },
  description:
    "Urban apparel designed for wind, layers, and movement. QULTURE, Astana.",
  applicationName: "QULTURE",
  ...(englishCanonical && russianCanonical && kazakhCanonical
    ? {
        alternates: {
          canonical: englishCanonical,
          languages: {
            en: englishCanonical,
            ru: russianCanonical,
            kk: kazakhCanonical,
            "x-default": englishCanonical,
          },
        },
      }
    : {}),
  openGraph: {
    type: "website",
    siteName: "QULTURE",
    title: "QULTURE — Designed for changing climates",
    description:
      "Urban apparel designed for wind, layers, and movement. QULTURE, Astana.",
    locale: "en_US",
    alternateLocale: ["ru_KZ", "kk_KZ"],
    ...(heroImage
      ? { images: [{ url: heroImage, width: 1024, height: 576 }] }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    ...(heroImage ? { images: [heroImage] } : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const language = parseDocumentLanguage(
    requestHeaders.get(DOCUMENT_LANGUAGE_HEADER),
  );
  return (
    <html lang={language} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
