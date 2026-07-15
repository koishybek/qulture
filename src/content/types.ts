import type { Localized } from "@/lib/i18n";

export type PageSeo = {
  title: string;
  description: string;
};

export type ContentSection = {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  note?: string;
};

export type RelatedLink = {
  href: string;
  label: string;
  description?: string;
};

export type EditorialPage = {
  seo: PageSeo;
  eyebrow: string;
  title: string;
  lead: string;
  status?: string;
  sections: readonly ContentSection[];
  related?: readonly RelatedLink[];
};

export type LegalStatus = {
  label: string;
  message: string;
  version: string;
  effectiveLabel: string;
};

export type LegalPage = EditorialPage & {
  legalStatus: LegalStatus;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: readonly string[];
  links?: readonly RelatedLink[];
};

export type FaqPage = Omit<EditorialPage, "sections"> & {
  sections: readonly ContentSection[];
  items: readonly FaqItem[];
};

export type JournalArticle = {
  slug: string;
  seo: PageSeo;
  title: string;
  excerpt: string;
  eyebrow: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  author?: string;
  coverImage?: string;
  isFallback: boolean;
  sections: readonly ContentSection[];
};

export type LocalizedEditorialPage = Localized<EditorialPage>;
export type LocalizedLegalPage = Localized<LegalPage>;
export type LocalizedFaqPage = Localized<FaqPage>;
export type LocalizedJournalArticle = Localized<JournalArticle>;
