import type { Metadata } from "next";

import { EditorialPageView } from "@/components/content/content-page";
import { contactsContent } from "@/content/editorial-pages";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";

type ContactsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ContactsPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  return createPageMetadata(locale, { path: "/contacts", seo: contactsContent[locale].seo });
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const locale = parseLocale((await params).locale);
  return <EditorialPageView locale={locale} page={contactsContent[locale]} />;
}
