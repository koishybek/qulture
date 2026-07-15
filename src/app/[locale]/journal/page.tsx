import type { Metadata } from "next";

import { JournalIndexView } from "@/components/content/journal-pages";
import { getJournalArticles, journalIndexContent } from "@/content/journal";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";

type JournalPageProps = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: JournalPageProps): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  return createPageMetadata(locale, { path: "/journal", seo: journalIndexContent[locale].seo });
}

export default async function JournalPage({ params }: JournalPageProps) {
  const locale = parseLocale((await params).locale);
  const articles = await getJournalArticles(locale);
  return <JournalIndexView articles={articles} locale={locale} page={journalIndexContent[locale]} />;
}
