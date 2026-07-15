import type { Metadata } from "next";

import { LegalPageView } from "@/components/content/content-page";
import { createPageMetadata } from "@/content/metadata";
import { termsContent } from "@/content/policies";
import { parseLocale } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/content/public-content";

type TermsPageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, termsContent[locale], ["terms"]);
  return createPageMetadata(locale, { path: "/terms", seo: page.seo });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, termsContent[locale], ["terms"]);
  return <LegalPageView locale={locale} page={page} />;
}
