import type { Metadata } from "next";

import { LegalPageView } from "@/components/content/content-page";
import { createPageMetadata } from "@/content/metadata";
import { deliveryAndReturnsContent } from "@/content/policies";
import { parseLocale } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/content/public-content";

type DeliveryPageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: DeliveryPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, deliveryAndReturnsContent[locale], ["delivery-and-returns", "delivery", "returns"]);
  return createPageMetadata(locale, {
    path: "/delivery-and-returns",
    seo: page.seo,
  });
}

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const locale = parseLocale((await params).locale);
  const page = await getPublicLegalPage(locale, deliveryAndReturnsContent[locale], ["delivery-and-returns", "delivery", "returns"]);
  return <LegalPageView locale={locale} page={page} />;
}
