import Link from "next/link";

import { localizePath, type Locale } from "@/lib/i18n";
import type {
  ContentSection,
  EditorialPage,
  LegalPage,
  LegalStatus,
  RelatedLink,
} from "@/content/types";

const relatedLinksLabels: Record<Locale, string> = {
  en: "Related pages",
  ru: "Связанные разделы",
  kz: "Қатысты бөлімдер",
};

type PageFrameProps = {
  eyebrow: string;
  title: string;
  lead: string;
  status?: string;
  children: React.ReactNode;
};

export function PageFrame({ eyebrow, title, lead, status, children }: PageFrameProps) {
  return (
    <article aria-labelledby="page-title" className="q-page">
      <header className="q-page-header">
        <div>
          <p className="q-kicker">{eyebrow}</p>
          <h1 className="q-display q-display--medium" id="page-title">
            {title}
          </h1>
        </div>
        <div>
          <p className="q-lead">{lead}</p>
          {status ? <p className="q-meta q-muted">{status}</p> : null}
        </div>
      </header>
      {children}
    </article>
  );
}

export function DraftNotice({ status }: { status: LegalStatus }) {
  return (
    <aside aria-label={status.label} className="q-legal-draft" role="note">
      <strong>{status.label}</strong>
      <p>{status.message}</p>
      <p>
        {status.version} · {status.effectiveLabel}
      </p>
    </aside>
  );
}

export function ContentSections({ sections }: { sections: readonly ContentSection[] }) {
  return (
    <>
      {sections.map((section) => {
        const headingId = `${section.id}-title`;
        return (
          <section aria-labelledby={headingId} id={section.id} key={section.id}>
            {section.eyebrow ? <p className="q-kicker q-muted">{section.eyebrow}</p> : null}
            <h2 id={headingId}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.note ? (
              <aside className="q-rule q-muted" role="note">
                <p>{section.note}</p>
              </aside>
            ) : null}
          </section>
        );
      })}
    </>
  );
}

export function RelatedLinks({
  locale,
  links,
}: {
  locale: Locale;
  links: readonly RelatedLink[];
}) {
  const label = relatedLinksLabels[locale];

  return (
    <nav aria-label={label} className="q-rule">
      <h2>{label}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link className="q-text-link" href={localizePath(locale, link.href)}>
              {link.label}
            </Link>
            {link.description ? <p className="q-muted">{link.description}</p> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function EditorialPageView({
  locale,
  page,
}: {
  locale: Locale;
  page: EditorialPage;
}) {
  return (
    <PageFrame eyebrow={page.eyebrow} lead={page.lead} status={page.status} title={page.title}>
      <div className="q-page-body">
        <div className="q-prose">
          <ContentSections sections={page.sections} />
          {page.related && page.related.length > 0 ? (
            <RelatedLinks links={page.related} locale={locale} />
          ) : null}
        </div>
      </div>
    </PageFrame>
  );
}

export function LegalPageView({
  locale,
  page,
  action,
}: {
  locale: Locale;
  page: LegalPage;
  action?: React.ReactNode;
}) {
  return (
    <PageFrame eyebrow={page.eyebrow} lead={page.lead} status={page.status} title={page.title}>
      <div className="q-page-body">
        <div className="q-prose">
          <DraftNotice status={page.legalStatus} />
          {action}
          <ContentSections sections={page.sections} />
          {page.related && page.related.length > 0 ? (
            <RelatedLinks links={page.related} locale={locale} />
          ) : null}
        </div>
      </div>
    </PageFrame>
  );
}
