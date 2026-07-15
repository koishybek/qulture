import type { Metadata } from "next";

import { LegalPageView } from "@/components/content/content-page";
import { CookiePreferencesButton } from "@/components/content/cookie-preferences-button";
import { createPageMetadata } from "@/content/metadata";
import { cookiesContent } from "@/content/policies";
import { parseLocale, type Locale } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/content/public-content";

type CookiesPageProps = { params: Promise<{ locale: string }> };

const cookiePreferencesLabels: Record<Locale, string> = {
  en: "Change cookie settings",
  ru: "Изменить настройки cookie",
  kz: "Cookie баптауларын өзгерту",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CookiesPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, cookiesContent[locale], ["cookies"]);
  return createPageMetadata(locale, { path: "/cookies", seo: page.seo });
}

export default async function CookiesPage({ params }: CookiesPageProps) {
  const locale = parseLocale((await params).locale);
  const label = cookiePreferencesLabels[locale];
  const page = await getPublicLegalPage(locale, cookiesContent[locale], ["cookies"]);
  return (
    <LegalPageView
      action={<CookiePreferencesButton label={label} />}
      locale={locale}
      page={page}
    />
  );
}
