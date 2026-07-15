import type { Metadata } from "next";

import { LegalPageView } from "@/components/content/content-page";
import { CookiePreferencesButton } from "@/components/content/cookie-preferences-button";
import { createPageMetadata } from "@/content/metadata";
import { cookiesContent } from "@/content/policies";
import { parseLocale } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/content/public-content";

type CookiesPageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CookiesPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, cookiesContent[locale], ["cookies"]);
  return createPageMetadata(locale, { path: "/cookies", seo: page.seo });
}

export default async function CookiesPage({ params }: CookiesPageProps) {
  const locale = parseLocale((await params).locale);
  const label = locale === "ru" ? "Изменить настройки cookie" : "Cookie баптауларын өзгерту";
  const page = await getPublicLegalPage(locale, cookiesContent[locale], ["cookies"]);
  return (
    <LegalPageView
      action={<CookiePreferencesButton label={label} />}
      locale={locale}
      page={page}
    />
  );
}
