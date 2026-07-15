export const DOCUMENT_LANGUAGE_HEADER = "x-qulture-document-language";

export type DocumentLanguage = "en" | "ru" | "kk";

export function documentLanguageFromPathname(pathname: string): DocumentLanguage {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (firstSegment === "kz") return "kk";
  if (firstSegment === "ru") return "ru";
  return "en";
}

export function parseDocumentLanguage(value: string | null): DocumentLanguage {
  return value === "kk" || value === "ru" || value === "en" ? value : "en";
}
