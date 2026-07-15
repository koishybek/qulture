import type { Metadata } from "next";

import { LegalPageView } from "@/components/content/content-page";
import { CookiePreferencesButton } from "@/components/content/cookie-preferences-button";
import { createPageMetadata } from "@/content/metadata";
import { consentContent } from "@/content/policies";
import { parseLocale } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/content/public-content";

type ConsentPageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ConsentPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, consentContent[locale], ["consent"]);
  return createPageMetadata(locale, { path: "/consent", seo: page.seo });
}

export default async function ConsentPage({ params }: ConsentPageProps) {
  const locale = parseLocale((await params).locale);
  const label = locale === "ru" ? "Открыть настройки данных" : "Дерек баптауларын ашу";
  const page = await getPublicLegalPage(locale, consentContent[locale], ["consent"]);
  return (
    <LegalPageView
      action={<CookiePreferencesButton label={label} />}
      locale={locale}
      page={page}
    />
  );
}
