export const locales = ["en", "ru", "kz"] as const;

export const plannedLocales = ["en", "ru", "kz"] as const;

export type Locale = (typeof locales)[number];
export type PlannedLocale = (typeof plannedLocales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  kz: "Қазақша",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function tryParseLocale(value: unknown): Locale | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return isLocale(normalized) ? normalized : null;
}

export function parseLocale(value: unknown): Locale {
  return tryParseLocale(value) ?? defaultLocale;
}

export type Localized<T> = Record<Locale, T> &
  Partial<Record<Exclude<PlannedLocale, Locale>, T>>;
