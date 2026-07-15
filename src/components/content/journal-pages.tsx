import Link from "next/link";

import type { JournalArticle } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n";
import { ContentSections, PageFrame } from "./content-page";

const journalLocales: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-KZ",
  kz: "kk-KZ",
};

const journalCopy: Record<
  Locale,
  {
    listLabel: string;
    minutes: string;
    read: string;
    readArticle: string;
    empty: string;
    backToJournal: string;
  }
> = {
  en: {
    listLabel: "Published articles",
    minutes: "min read",
    read: "Read",
    readArticle: "Read article",
    empty: "There are no published articles yet. We do not show empty or demonstration stories.",
    backToJournal: "Back to journal",
  },
  ru: {
    listLabel: "Опубликованные материалы",
    minutes: "мин чтения",
    read: "Читать",
    readArticle: "Читать заметку",
    empty: "Опубликованных материалов пока нет. Мы не показываем пустые или демонстрационные статьи.",
    backToJournal: "Вернуться в журнал",
  },
  kz: {
    listLabel: "Жарияланған материалдар",
    minutes: "мин оқу",
    read: "Оқу",
    readArticle: "Жазбаны оқу",
    empty: "Әзірге жарияланған материал жоқ. Біз бос немесе демонстрациялық мақалаларды көрсетпейміз.",
    backToJournal: "Журналға оралу",
  },
};

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(journalLocales[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function JournalIndexView({
  locale,
  page,
  articles,
}: {
  locale: Locale;
  page: {
    eyebrow: string;
    title: string;
    lead: string;
    status?: string;
  };
  articles: readonly JournalArticle[];
}) {
  const copy = journalCopy[locale];

  return (
    <PageFrame eyebrow={page.eyebrow} lead={page.lead} status={page.status} title={page.title}>
      <div className="q-page-body">
        <div className="q-prose">
          <section aria-labelledby="journal-list-title">
            <h2 id="journal-list-title">{copy.listLabel}</h2>
            {articles.length > 0 ? (
              <ol>
                {articles.map((article) => (
                  <li key={article.slug}>
                    <article aria-labelledby={`${article.slug}-title`}>
                      <p className="q-meta">
                        <time dateTime={article.publishedAt}>{formatDate(locale, article.publishedAt)}</time>
                        {" · "}
                        {article.readingMinutes} {copy.minutes}
                      </p>
                      <h3 id={`${article.slug}-title`}>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <Link
                        aria-label={`${copy.read}: ${article.title}`}
                        className="q-text-link"
                        href={localizePath(locale, `/journal/${article.slug}`)}
                      >
                        {copy.readArticle}
                      </Link>
                    </article>
                  </li>
                ))}
              </ol>
            ) : (
              <p>
                {copy.empty}
              </p>
            )}
          </section>
        </div>
      </div>
    </PageFrame>
  );
}

export function JournalArticleView({
  locale,
  article,
}: {
  locale: Locale;
  article: JournalArticle;
}) {
  const copy = journalCopy[locale];

  return (
    <PageFrame
      eyebrow={article.eyebrow}
      lead={article.excerpt}
      status={`${formatDate(locale, article.publishedAt)} · ${article.readingMinutes} ${copy.minutes}`}
      title={article.title}
    >
      <div className="q-page-body">
        <div className="q-prose">
          <ContentSections sections={article.sections} />
          <nav aria-label={copy.backToJournal} className="q-rule">
            <Link className="q-text-link" href={localizePath(locale, "/journal")}>
              {copy.backToJournal}
            </Link>
          </nav>
        </div>
      </div>
    </PageFrame>
  );
}

export function ArticleStructuredData({
  locale,
  article,
}: {
  locale: Locale;
  article: JournalArticle;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: locale === "en" ? "en" : journalLocales[locale],
    mainEntityOfPage: localizePath(locale, `/journal/${article.slug}`),
    author: {
      "@type": "Organization",
      name: article.author ?? "QULTURE",
    },
    publisher: {
      "@type": "Organization",
      name: "QULTURE",
    },
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</gu, "\\u003c") }}
      type="application/ld+json"
    />
  );
}
