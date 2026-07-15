import type { Metadata } from "next";

import { EditorialPageView } from "@/components/content/content-page";
import { technologyContent } from "@/content/editorial-pages";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";

type TechnologyPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: TechnologyPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  return createPageMetadata(locale, { path: "/technology", seo: technologyContent[locale].seo });
}

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const locale = parseLocale((await params).locale);
  return <EditorialPageView locale={locale} page={technologyContent[locale]} />;
}
