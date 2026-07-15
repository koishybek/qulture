import { describe, expect, it } from "vitest";

import { publicDefaultLocale } from "./site-settings";

describe("publicDefaultLocale", () => {
  it("maps supported database locales to public route prefixes", () => {
    expect(publicDefaultLocale("RU")).toBe("ru");
    expect(publicDefaultLocale("KZ")).toBe("kz");
  });

  it("falls back safely when an unsupported planned locale is stored", () => {
    expect(publicDefaultLocale("EN")).toBe("ru");
    expect(publicDefaultLocale(undefined)).toBe("ru");
  });
});
