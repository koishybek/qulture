type AnalyticsPayload = Record<string, string | number | boolean | null>;

const SENSITIVE_KEYS = /email|phone|address|name|card|password|measurement|message/i;

export function trackEvent(
  name: string,
  payload: AnalyticsPayload = {},
  options: { locale?: "ru" | "kz"; category?: "NECESSARY" | "ANALYTICS" | "MARKETING" } = {},
) {
  const category = options.category ?? "ANALYTICS";
  if (category !== "NECESSARY" && typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("qulture-consent-v1") ?? "{}") as { analytics?: boolean; marketing?: boolean };
      if (category === "ANALYTICS" && stored.analytics !== true) return;
      if (category === "MARKETING" && stored.marketing !== true) return;
    } catch {
      return;
    }
  }
  const safePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => !SENSITIVE_KEYS.test(key)));
  void fetch("/api/analytics", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      payload: safePayload,
      locale: options.locale,
      category,
    }),
  }).catch(() => undefined);
}
