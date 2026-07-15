import Link from "next/link";

import { localizePath, type Locale } from "@/lib/i18n";
import type { FaqPage } from "@/content/types";
import { PageFrame, RelatedLinks } from "./content-page";

const faqListLabels: Record<Locale, string> = {
  en: "Questions",
  ru: "Список вопросов",
  kz: "Сұрақтар тізімі",
};

export function FaqPageView({ locale, page }: { locale: Locale; page: FaqPage }) {
  const listLabel = faqListLabels[locale];

  return (
    <PageFrame eyebrow={page.eyebrow} lead={page.lead} status={page.status} title={page.title}>
      <div className="q-page-body">
        <div className="q-prose">
          <div aria-label={listLabel}>
            {page.items.map((item) => (
              <section aria-labelledby={`${item.id}-question`} id={item.id} key={item.id}>
                <h2 id={`${item.id}-question`}>{item.question}</h2>
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {item.links?.map((link) => (
                  <Link className="q-text-link" href={localizePath(locale, link.href)} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </section>
            ))}
          </div>
          {page.related && page.related.length > 0 ? (
            <RelatedLinks links={page.related} locale={locale} />
          ) : null}
        </div>
      </div>
    </PageFrame>
  );
}
