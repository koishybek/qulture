import type { ContentSection, FaqItem, FaqPage, LegalPage, RelatedLink } from "@/content/types";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";

export type ManagedContentPage = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  requiresApproval: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  version: number;
};

export type ManagedTranslation = {
  namespace: string;
  key: string;
  value: string;
};

const MAX_SECTIONS = 40;
const MAX_ITEMS = 80;
const MAX_LIST_ITEMS = 60;
const MAX_TEXT = 20_000;

function text(value: unknown, maximum = MAX_TEXT): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maximum) : undefined;
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_LIST_ITEMS)
      .map((item) => text(item, 5_000))
      .filter((item): item is string => Boolean(item));
  }
  const raw = text(value);
  if (!raw) return [];
  const parsed = parseJson(raw);
  if (Array.isArray(parsed)) return list(parsed);
  return raw.split(/\n\s*\n|\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, MAX_LIST_ITEMS);
}

function safeId(value: unknown, fallback: string): string {
  const candidate = text(value, 100)?.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return candidate || fallback;
}

function sectionsFromValue(value: unknown, prefix: string): ContentSection[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_SECTIONS).flatMap((entry, index) => {
    const source = object(entry);
    const title = text(source?.title, 500);
    const paragraphs = list(source?.paragraphs);
    if (!source || !title || paragraphs.length === 0) return [];
    const bullets = list(source.bullets);
    return [{
      id: safeId(source.id, `${prefix}-${index + 1}`),
      eyebrow: text(source.eyebrow, 300),
      title,
      paragraphs,
      bullets: bullets.length ? bullets : undefined,
      note: text(source.note, 5_000),
    }];
  });
}

function pageObject(page: ManagedContentPage): Record<string, unknown> | null {
  return object(parseJson(page.content));
}

function pageSections(page: ManagedContentPage, index: number): ContentSection[] {
  const parsed = parseJson(page.content);
  const parsedObject = object(parsed);
  const structured = sectionsFromValue(Array.isArray(parsed) ? parsed : parsedObject?.sections, `cms-${page.slug}`);
  if (structured.length) return structured;
  if (parsed !== null && (Array.isArray(parsed) || parsedObject)) return [];

  const paragraphs = list(page.content);
  return paragraphs.length ? [{ id: `cms-${safeId(page.slug, String(index + 1))}`, title: page.title, paragraphs }] : [];
}

function relatedLinks(value: unknown): RelatedLink[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap((entry) => {
    const source = object(entry);
    const href = text(source?.href, 300);
    const label = text(source?.label, 300);
    if (!href || !label || !href.startsWith("/") || href.startsWith("//")) return [];
    return [{ href, label, description: text(source?.description, 1_000) }];
  });
}

function faqItemsFromPage(page: ManagedContentPage): FaqItem[] {
  const parsed = parseJson(page.content);
  const parsedObject = object(parsed);
  if (Array.isArray(parsedObject?.items)) {
    return parsedObject.items.slice(0, MAX_ITEMS).flatMap((entry, index) => {
      const source = object(entry);
      const question = text(source?.question, 1_000);
      const answer = list(source?.answer);
      if (!source || !question || answer.length === 0) return [];
      return [{
        id: safeId(source.id, `cms-faq-${index + 1}`),
        question,
        answer,
        links: relatedLinks(source.links),
      }];
    });
  }

  const sections = pageSections(page, 0);
  if (sections.length) {
    return sections.map((section) => ({
      id: section.id,
      question: section.title,
      answer: section.paragraphs,
    }));
  }
  return [];
}

function translationMap(records: readonly ManagedTranslation[], slugs: readonly string[]): Map<string, string> {
  const namespaceOrder: string[] = [];
  for (const slug of [...slugs].reverse()) {
    namespaceOrder.push(slug, `page.${slug}`);
  }
  const rank = new Map(namespaceOrder.map((namespace, index) => [namespace, index]));
  const sorted = [...records].sort((left, right) => (rank.get(left.namespace) ?? -1) - (rank.get(right.namespace) ?? -1));
  const result = new Map<string, string>();
  for (const record of sorted) result.set(record.key, record.value.trim());
  return result;
}

function translatedSections(sections: readonly ContentSection[], translations: Map<string, string>): ContentSection[] {
  return sections.map((section) => {
    const prefix = `section.${section.id}`;
    const paragraphs = list(translations.get(`${prefix}.paragraphs`));
    const bullets = list(translations.get(`${prefix}.bullets`));
    return {
      ...section,
      eyebrow: translations.get(`${prefix}.eyebrow`) || section.eyebrow,
      title: translations.get(`${prefix}.title`) || section.title,
      paragraphs: paragraphs.length ? paragraphs : section.paragraphs,
      bullets: bullets.length ? bullets : section.bullets,
      note: translations.get(`${prefix}.note`) || section.note,
    };
  });
}

function translatedFaqItems(items: readonly FaqItem[], translations: Map<string, string>): FaqItem[] {
  return items.map((item) => {
    const prefix = `item.${item.id}`;
    const answer = list(translations.get(`${prefix}.answer`));
    return {
      ...item,
      question: translations.get(`${prefix}.question`) || item.question,
      answer: answer.length ? answer : item.answer,
    };
  });
}

export function mergeManagedLegalPage(
  fallback: LegalPage,
  pages: readonly ManagedContentPage[],
  translationRecords: readonly ManagedTranslation[],
  slugs: readonly string[],
): LegalPage {
  const validPages = pages.map((page, index) => ({ page, sections: pageSections(page, index) }))
    .filter((entry) => entry.sections.length > 0);
  const primary = validPages[0]?.page;
  const presentation = primary ? pageObject(primary) : null;
  const managedSections = validPages.flatMap((entry) => entry.sections);
  const managedRelated = relatedLinks(presentation?.related);
  const base: LegalPage = primary ? {
    ...fallback,
    seo: {
      title: primary.seoTitle?.trim() || primary.title,
      description: primary.seoDescription?.trim() || primary.excerpt?.trim() || fallback.seo.description,
    },
    eyebrow: text(presentation?.eyebrow, 300) || fallback.eyebrow,
    title: primary.title,
    lead: primary.excerpt?.trim() || fallback.lead,
    status: text(presentation?.status, 500) || fallback.status,
    sections: managedSections.length ? managedSections : fallback.sections,
    related: managedRelated.length ? managedRelated : fallback.related,
    // PUBLISHED means publicly visible, not legally approved. The reviewed
    // static warning remains until an explicit legal-approval model exists.
    legalStatus: fallback.legalStatus,
  } : fallback;

  const translations = translationMap(translationRecords, slugs);
  return {
    ...base,
    seo: {
      title: translations.get("seo.title") || base.seo.title,
      description: translations.get("seo.description") || base.seo.description,
    },
    eyebrow: translations.get("eyebrow") || base.eyebrow,
    title: translations.get("title") || base.title,
    lead: translations.get("lead") || base.lead,
    status: translations.get("status") || base.status,
    sections: translatedSections(base.sections, translations),
  };
}

export function mergeManagedFaqPage(
  fallback: FaqPage,
  pages: readonly ManagedContentPage[],
  translationRecords: readonly ManagedTranslation[],
  slugs: readonly string[],
): FaqPage {
  const validPages = pages.map((page) => ({ page, items: faqItemsFromPage(page) }))
    .filter((entry) => entry.items.length > 0);
  const primary = validPages[0]?.page;
  const presentation = primary ? pageObject(primary) : null;
  const managedItems = validPages[0]?.items ?? [];
  const managedSections = primary ? sectionsFromValue(presentation?.sections, `cms-${primary.slug}`) : [];
  const managedRelated = relatedLinks(presentation?.related);
  const base: FaqPage = primary ? {
    ...fallback,
    seo: {
      title: primary.seoTitle?.trim() || primary.title,
      description: primary.seoDescription?.trim() || primary.excerpt?.trim() || fallback.seo.description,
    },
    eyebrow: text(presentation?.eyebrow, 300) || fallback.eyebrow,
    title: primary.title,
    lead: primary.excerpt?.trim() || fallback.lead,
    status: text(presentation?.status, 500) || fallback.status,
    sections: managedSections.length ? managedSections : fallback.sections,
    items: managedItems.length ? managedItems : fallback.items,
    related: managedRelated.length ? managedRelated : fallback.related,
  } : fallback;

  const translations = translationMap(translationRecords, slugs);
  return {
    ...base,
    seo: {
      title: translations.get("seo.title") || base.seo.title,
      description: translations.get("seo.description") || base.seo.description,
    },
    eyebrow: translations.get("eyebrow") || base.eyebrow,
    title: translations.get("title") || base.title,
    lead: translations.get("lead") || base.lead,
    status: translations.get("status") || base.status,
    sections: translatedSections(base.sections, translations),
    items: translatedFaqItems(base.items, translations),
  };
}

async function loadManagedContent(locale: Locale, slugs: readonly string[]) {
  const databaseLocale = locale === "kz" ? "KZ" : "RU";
  const namespaces = slugs.flatMap((slug) => [slug, `page.${slug}`]);
  try {
    const [rawPages, translations] = await Promise.all([
      db.contentPage.findMany({
        where: { locale: databaseLocale, slug: { in: [...slugs] }, status: "PUBLISHED" },
        select: {
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          requiresApproval: true,
          seoTitle: true,
          seoDescription: true,
          version: true,
        },
      }),
      db.translation.findMany({
        where: { locale: databaseLocale, namespace: { in: namespaces }, status: "PUBLISHED" },
        select: { namespace: true, key: true, value: true },
      }),
    ]);
    const pageBySlug = new Map(rawPages.map((page) => [page.slug, page]));
    const pages = slugs.flatMap((slug) => {
      const page = pageBySlug.get(slug);
      return page ? [page] : [];
    });
    return { pages, translations };
  } catch {
    return { pages: [], translations: [] };
  }
}

export async function getPublicLegalPage(
  locale: Locale,
  fallback: LegalPage,
  slugs: readonly string[],
): Promise<LegalPage> {
  const managed = await loadManagedContent(locale, slugs);
  return mergeManagedLegalPage(fallback, managed.pages, managed.translations, slugs);
}

export async function getPublicFaqPage(
  locale: Locale,
  fallback: FaqPage,
  slugs: readonly string[] = ["faq"],
): Promise<FaqPage> {
  const managed = await loadManagedContent(locale, slugs);
  return mergeManagedFaqPage(fallback, managed.pages, managed.translations, slugs);
}
