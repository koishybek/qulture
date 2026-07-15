import type { Metadata } from "next";

import { FaqPageView } from "@/components/content/faq-page";
import { faqContent } from "@/content/faq";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";
import { getPublicFaqPage } from "@/lib/content/public-content";

type FaqRouteProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: FaqRouteProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicFaqPage(locale, faqContent[locale]);
  return createPageMetadata(locale, { path: "/faq", seo: page.seo });
}

export default async function FaqRoute({ params }: FaqRouteProps) {
  const locale = parseLocale((await params).locale);
  const page = await getPublicFaqPage(locale, faqContent[locale]);
  return <FaqPageView locale={locale} page={page} />;
}
