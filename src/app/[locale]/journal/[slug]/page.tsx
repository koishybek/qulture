import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleStructuredData, JournalArticleView } from "@/components/content/journal-pages";
import { getJournalArticle, journalStaticSlugs } from "@/content/journal";
import { createPageMetadata } from "@/content/metadata";
import { parseLocale } from "@/lib/i18n";

type JournalArticlePageProps = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return journalStaticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JournalArticlePageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = parseLocale(rawLocale);
  const article = await getJournalArticle(locale, slug);

  if (!article) {
    return {};
  }

  return createPageMetadata(locale, {
    path: `/journal/${article.slug}`,
    seo: article.seo,
    type: "article",
    publishedAt: article.publishedAt,
    modifiedAt: article.updatedAt,
  });
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = parseLocale(rawLocale);
  const article = await getJournalArticle(locale, slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleStructuredData article={article} locale={locale} />
      <JournalArticleView article={article} locale={locale} />
    </>
  );
}
