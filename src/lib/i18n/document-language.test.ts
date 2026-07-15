import { describe, expect, it } from "vitest";

import {
  documentLanguageFromPathname,
  parseDocumentLanguage,
} from "@/lib/i18n/document-language";

describe("document language", () => {
  it("maps the public KZ route to the BCP 47 Kazakh code", () => {
    expect(documentLanguageFromPathname("/kz/product/city-shell")).toBe("kk");
    expect(documentLanguageFromPathname("/ru/product/city-shell")).toBe("ru");
  });

  it("uses Russian for unlocalized and untrusted header values", () => {
    expect(documentLanguageFromPathname("/admin")).toBe("ru");
    expect(parseDocumentLanguage("en")).toBe("ru");
    expect(parseDocumentLanguage("kk")).toBe("kk");
  });
});
