export {
  defaultLocale,
  isLocale,
  localeNames,
  locales,
  parseLocale,
  plannedLocales,
  tryParseLocale,
  type Locale,
  type Localized,
  type PlannedLocale,
} from "./config";
export { getDictionary, type SiteDictionary } from "./dictionaries";
export {
  localeFromPath,
  localizePath,
  replaceLocaleInPath,
  stripLocaleFromPath,
} from "./routing";
