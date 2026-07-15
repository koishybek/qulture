import { describe, expect, it } from "vitest";

import { commerceTextMap, localizedCommerceText } from "./locale";

describe("commerce locale helpers", () => {
  it("uses the English field when it exists", () => {
    expect(
      localizedCommerceText(
        "en",
        { en: "City top", ru: "Городской верх", kz: "Қалалық үстіңгі бөлік" },
        "QULTURE product",
      ),
    ).toBe("City top");
  });

  it("never falls back to Russian or Kazakh on English pages", () => {
    expect(
      localizedCommerceText(
        "en",
        { ru: "Городской верх", kz: "Қалалық үстіңгі бөлік" },
        "English details coming soon.",
      ),
    ).toBe("English details coming soon.");
  });

  it("creates a complete locale map with a safe English fallback", () => {
    expect(
      commerceTextMap(
        { en: null, ru: "Графит", kz: "Графит" },
        "Graphite",
      ),
    ).toEqual({ en: "Graphite", ru: "Графит", kz: "Графит" });
  });
});
