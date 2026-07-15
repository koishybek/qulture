export const DOCUMENT_LANGUAGE_HEADER = "x-qulture-document-language";

export type DocumentLanguage = "ru" | "kk";

export function documentLanguageFromPathname(pathname: string): DocumentLanguage {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return firstSegment === "kz" ? "kk" : "ru";
}

export function parseDocumentLanguage(value: string | null): DocumentLanguage {
  return value === "kk" ? "kk" : "ru";
}
