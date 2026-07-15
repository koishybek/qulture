export const locales = ["ru", "kz"] as const;

export const plannedLocales = ["ru", "kz", "en"] as const;

export type Locale = (typeof locales)[number];
export type PlannedLocale = (typeof plannedLocales)[number];

export const defaultLocale: Locale = "ru";

export const localeNames: Record<Locale, string> = {
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
