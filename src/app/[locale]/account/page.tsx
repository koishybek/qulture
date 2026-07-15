import type { Metadata } from "next";

import { EditorialPageView } from "@/components/content/content-page";
import { accountContent } from "@/content/editorial-pages";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";

type AccountPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  return createPageMetadata(locale, {
    path: "/account",
    seo: accountContent[locale].seo,
    noIndex: true,
  });
}

export default async function AccountPage({ params }: AccountPageProps) {
  const locale = parseLocale((await params).locale);
  return <EditorialPageView locale={locale} page={accountContent[locale]} />;
}
