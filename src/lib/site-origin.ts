export type SiteOriginEnvironment = {
  NODE_ENV?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
};

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "127.0.0.1" ||
    normalized.startsWith("127.") ||
    normalized === "[::1]" ||
    normalized === "::1"
  );
}

function normalizeOrigin(value: string, production: boolean): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("/")) return null;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//iu.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }
    if (
      production &&
      (url.protocol !== "https:" || isLocalHostname(url.hostname))
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Returns the configured public origin. Development deliberately falls back
 * to localhost; production deliberately returns null instead of inventing it.
 */
export function configuredSiteOrigin(
  environment: SiteOriginEnvironment = process.env,
): string | null {
  const production = environment.NODE_ENV === "production";
  const candidates = [
    environment.NEXT_PUBLIC_SITE_URL,
    environment.VERCEL_PROJECT_PRODUCTION_URL,
    environment.VERCEL_URL,
    environment.NEXT_PUBLIC_VERCEL_URL,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const origin = normalizeOrigin(candidate, production);
    if (origin) return origin;
  }
  return production ? null : "http://localhost:3000";
}

export function absoluteSiteUrl(
  origin: string | null,
  pathname: string,
): string | null {
  if (!origin || !pathname || pathname.startsWith("//")) return null;
  try {
    const url = new URL(pathname.startsWith("/") ? pathname : `/${pathname}`, `${origin}/`);
    return url.origin === origin ? url.toString() : null;
  } catch {
    return null;
  }
}
