import type { Metadata } from "next";

import { LegalPageView } from "@/components/content/content-page";
import { createPageMetadata } from "@/content/metadata";
import { privacyContent } from "@/content/policies";
import { parseLocale } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/content/public-content";

type PrivacyPageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, privacyContent[locale], ["privacy"]);
  return createPageMetadata(locale, { path: "/privacy", seo: page.seo });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, privacyContent[locale], ["privacy"]);
  return <LegalPageView locale={locale} page={page} />;
}
