import { describe, expect, it } from "vitest";

import { sanitizeMessageForPersistence } from "./adapters";

describe("AI persistence redaction", () => {
  it("always removes contact and address data", () => {
    const safe = sanitizeMessageForPersistence(
      "email: aida@example.com, phone +7 777 123 45 67, address: Astana, Example 10",
      true,
    );

    expect(safe).not.toContain("aida@example.com");
    expect(safe).not.toContain("+7 777 123 45 67");
    expect(safe).not.toContain("Astana, Example 10");
  });

  it("retains measurements only with explicit consent", () => {
    const content = "рост: 178 см, вес: 72 кг";
    expect(sanitizeMessageForPersistence(content, false)).not.toContain("178 см");
    expect(sanitizeMessageForPersistence(content, true)).toContain("178 см");
  });
});
