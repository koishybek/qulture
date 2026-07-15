import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import {
  DOCUMENT_LANGUAGE_HEADER,
  parseDocumentLanguage,
} from "@/lib/i18n/document-language";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

import "./globals.css";

const siteOrigin = configuredSiteOrigin();
const defaultCanonical = absoluteSiteUrl(siteOrigin, "/ru");
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
    "Городская одежда для ветра, слоёв и движения. QULTURE, Astana.",
  applicationName: "QULTURE",
  ...(defaultCanonical && russianCanonical && kazakhCanonical
    ? {
        alternates: {
          canonical: defaultCanonical,
          languages: { ru: russianCanonical, kk: kazakhCanonical },
        },
      }
    : {}),
  openGraph: {
    type: "website",
    siteName: "QULTURE",
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
