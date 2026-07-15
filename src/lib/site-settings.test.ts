import { describe, expect, it } from "vitest";

import { publicDefaultLocale } from "./site-settings";

describe("publicDefaultLocale", () => {
  it("maps supported database locales to public route prefixes", () => {
    expect(publicDefaultLocale("EN")).toBe("en");
    expect(publicDefaultLocale("RU")).toBe("ru");
    expect(publicDefaultLocale("KZ")).toBe("kz");
  });

  it("falls back safely to the default public locale", () => {
    expect(publicDefaultLocale("DE")).toBe("en");
    expect(publicDefaultLocale(undefined)).toBe("en");
  });
});
