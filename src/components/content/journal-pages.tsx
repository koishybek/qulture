import Link from "next/link";

import type { JournalArticle } from "@/content/types";
import { localizePath, type Locale } from "@/lib/i18n";
import { ContentSections, PageFrame } from "./content-page";

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-KZ" : "kk-KZ", {
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
  const listLabel = locale === "ru" ? "Опубликованные материалы" : "Жарияланған материалдар";

  return (
    <PageFrame eyebrow={page.eyebrow} lead={page.lead} status={page.status} title={page.title}>
      <div className="q-page-body">
        <div className="q-prose">
          <section aria-labelledby="journal-list-title">
            <h2 id="journal-list-title">{listLabel}</h2>
            {articles.length > 0 ? (
              <ol>
                {articles.map((article) => (
                  <li key={article.slug}>
                    <article aria-labelledby={`${article.slug}-title`}>
                      <p className="q-meta">
                        <time dateTime={article.publishedAt}>{formatDate(locale, article.publishedAt)}</time>
                        {" · "}
                        {article.readingMinutes} {locale === "ru" ? "мин чтения" : "мин оқу"}
                      </p>
                      <h3 id={`${article.slug}-title`}>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <Link
                        aria-label={`${locale === "ru" ? "Читать" : "Оқу"}: ${article.title}`}
                        className="q-text-link"
                        href={localizePath(locale, `/journal/${article.slug}`)}
                      >
                        {locale === "ru" ? "Читать заметку" : "Жазбаны оқу"}
                      </Link>
                    </article>
                  </li>
                ))}
              </ol>
            ) : (
              <p>
                {locale === "ru"
                  ? "Опубликованных материалов пока нет. Мы не показываем пустые или демонстрационные статьи."
                  : "Әзірге жарияланған материал жоқ. Біз бос немесе демонстрациялық мақалаларды көрсетпейміз."}
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
  return (
    <PageFrame
      eyebrow={article.eyebrow}
      lead={article.excerpt}
      status={`${formatDate(locale, article.publishedAt)} · ${article.readingMinutes} ${
        locale === "ru" ? "мин чтения" : "мин оқу"
      }`}
      title={article.title}
    >
      <div className="q-page-body">
        <div className="q-prose">
          <ContentSections sections={article.sections} />
          <nav aria-label={locale === "ru" ? "Назад в журнал" : "Журналға оралу"} className="q-rule">
            <Link className="q-text-link" href={localizePath(locale, "/journal")}>
              {locale === "ru" ? "Вернуться в журнал" : "Журналға оралу"}
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
    inLanguage: locale === "ru" ? "ru-KZ" : "kk-KZ",
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
