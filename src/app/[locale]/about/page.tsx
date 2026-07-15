import type { Metadata } from "next";

import { EditorialPageView } from "@/components/content/content-page";
import { aboutContent } from "@/content/editorial-pages";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";

type AboutPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  return createPageMetadata(locale, { path: "/about", seo: aboutContent[locale].seo });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const locale = parseLocale((await params).locale);
  return <EditorialPageView locale={locale} page={aboutContent[locale]} />;
}
