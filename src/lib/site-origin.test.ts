import { describe, expect, it } from "vitest";

import {
  absoluteSiteUrl,
  configuredSiteOrigin,
} from "@/lib/site-origin";

describe("configured site origin", () => {
  it("uses localhost only outside production", () => {
    expect(configuredSiteOrigin({ NODE_ENV: "development" })).toBe(
      "http://localhost:3000",
    );
    expect(configuredSiteOrigin({ NODE_ENV: "production" })).toBeNull();
  });

  it("normalizes an explicit HTTPS site URL to its origin", () => {
    expect(
      configuredSiteOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://qulture.example/catalog?q=1#top",
      }),
    ).toBe("https://qulture.example");
  });

  it("rejects insecure production origins and falls through to Vercel", () => {
    expect(
      configuredSiteOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        VERCEL_PROJECT_PRODUCTION_URL: "qulture.vercel.app",
      }),
    ).toBe("https://qulture.vercel.app");
  });

  it("rejects credentials and non-HTTP protocols", () => {
    expect(
      configuredSiteOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://user:secret@example.com",
      }),
    ).toBeNull();
    expect(
      configuredSiteOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "javascript://example.com",
      }),
    ).toBeNull();
  });

  it("joins only same-origin site paths", () => {
    expect(absoluteSiteUrl("https://qulture.example", "/kz/shop?q=coat")).toBe(
      "https://qulture.example/kz/shop?q=coat",
    );
    expect(
      absoluteSiteUrl("https://qulture.example", "//evil.example/path"),
    ).toBeNull();
    expect(absoluteSiteUrl(null, "/ru")).toBeNull();
  });
});
