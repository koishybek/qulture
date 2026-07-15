import { describe, expect, it } from "vitest";

import {
  localeFromPath,
  localizePath,
  parseLocale,
  replaceLocaleInPath,
  stripLocaleFromPath,
  tryParseLocale,
} from "./index";

describe("locale parsing", () => {
  it("accepts published locale codes independent of input casing", () => {
    expect(tryParseLocale(" en ")).toBe("en");
    expect(tryParseLocale(" ru ")).toBe("ru");
    expect(tryParseLocale("KZ")).toBe("kz");
  });

  it("rejects unknown locale codes", () => {
    expect(tryParseLocale("de")).toBeNull();
    expect(tryParseLocale(undefined)).toBeNull();
  });

  it("uses English as the safe fallback", () => {
    expect(parseLocale("unknown")).toBe("en");
    expect(localeFromPath("/kz/technology")).toBe("kz");
    expect(localeFromPath("/journal")).toBe("en");
  });
});

describe("localized path handling", () => {
  it("adds and replaces only the leading locale segment", () => {
    expect(localizePath("en", "/technology")).toBe("/en/technology");
    expect(localizePath("ru", "/technology")).toBe("/ru/technology");
    expect(localizePath("kz", "/ru/journal/building-qulture-openly")).toBe(
      "/kz/journal/building-qulture-openly",
    );
    expect(replaceLocaleInPath("/culture/ru/story", "kz")).toBe("/kz/culture/ru/story");
  });

  it("preserves query, hash, and trailing slash when switching locale", () => {
    expect(replaceLocaleInPath("/ru/journal/?topic=process#articles", "kz")).toBe(
      "/kz/journal/?topic=process#articles",
    );
    expect(stripLocaleFromPath("/kz/faq?from=footer#delivery")).toBe(
      "/faq?from=footer#delivery",
    );
  });

  it("handles a localized root without producing a double slash", () => {
    expect(localizePath("ru", "/")).toBe("/ru");
    expect(replaceLocaleInPath("/ru", "kz")).toBe("/kz");
  });
});
