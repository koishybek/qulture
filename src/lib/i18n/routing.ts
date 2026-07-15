import { defaultLocale, isLocale, type Locale } from "./config";

function splitPathSuffix(value: string): [pathname: string, suffix: string] {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const suffixIndex = [queryIndex, hashIndex]
    .filter((index) => index >= 0)
    .reduce((first, index) => Math.min(first, index), value.length);

  return [value.slice(0, suffixIndex), value.slice(suffixIndex)];
}

function normalizeInternalPath(pathname: string): string {
  if (pathname === "" || pathname === "/") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function localeFromPath(pathname: string): Locale {
  const [pathOnly] = splitPathSuffix(normalizeInternalPath(pathname));
  const firstSegment = pathOnly.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function stripLocaleFromPath(pathname: string): string {
  const [pathOnly, suffix] = splitPathSuffix(normalizeInternalPath(pathname));
  const segments = pathOnly.split("/");

  if (isLocale(segments[1])) {
    segments.splice(1, 1);
  }

  const unlocalizedPath = segments.join("/") || "/";
  return `${unlocalizedPath}${suffix}`;
}

/**
 * Prefixes an internal path with a published locale. Existing locale prefixes
 * are replaced, while query strings, hashes, and trailing slashes are kept.
 */
export function localizePath(locale: Locale, pathname = "/"): string {
  const [unlocalizedPath, suffix] = splitPathSuffix(stripLocaleFromPath(pathname));
  const localizedPath = unlocalizedPath === "/" ? `/${locale}` : `/${locale}${unlocalizedPath}`;
  return `${localizedPath}${suffix}`;
}

export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  return localizePath(locale, pathname);
}
