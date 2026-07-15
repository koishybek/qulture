import type { Locale } from "@/lib/i18n";

export type CommerceLocale = Locale;

export type CommerceLocalizedText = {
  en?: string | null;
  ru?: string | null;
  kz?: string | null;
};

function clean(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

/**
 * Resolves a commerce string without ever falling back from English to a
 * Russian or Kazakh source value. This is important for partial catalogue
 * translations: English visitors get deliberate neutral copy instead of an
 * unexpected language switch.
 */
export function localizedCommerceText(
  locale: CommerceLocale,
  values: CommerceLocalizedText,
  englishFallback: string,
): string {
  const localized = clean(values[locale]);
  if (localized) return localized;

  if (locale === "en") return englishFallback;
  return clean(values[locale === "ru" ? "kz" : "ru"]) ?? englishFallback;
}

export function commerceText(
  locale: CommerceLocale,
  english: string,
  russian: string,
  kazakh: string,
): string {
  return locale === "en" ? english : locale === "ru" ? russian : kazakh;
}

export function commerceTextMap(
  values: CommerceLocalizedText,
  englishFallback: string,
): Record<CommerceLocale, string> {
  return {
    en: localizedCommerceText("en", values, englishFallback),
    ru: localizedCommerceText("ru", values, englishFallback),
    kz: localizedCommerceText("kz", values, englishFallback),
  };
}

export function commerceIntlLocale(locale: CommerceLocale): string {
  return locale === "en" ? "en-KZ" : locale === "ru" ? "ru-KZ" : "kk-KZ";
}

export function isUnlocalizedEnglish(value: string): boolean {
  return /\p{Script=Cyrillic}/u.test(value);
}
