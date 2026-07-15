import { describe, expect, it } from "vitest";

import {
  parseAIClientState,
  redactSensitiveSessionText,
  serializeAIClientState,
} from "@/lib/ai/client-state";

describe("AI session state", () => {
  it("redacts contact details and unconsented body measurements", () => {
    const safe = redactSensitiveSessionText(
      "email aida@example.com, телефон +7 777 123 45 67, рост 178 см, вес 72 кг",
      false,
    );
    expect(safe).not.toContain("aida@example.com");
    expect(safe).not.toContain("+7 777 123 45 67");
    expect(safe).not.toContain("178 см");
    expect(safe).not.toContain("72 кг");
  });

  it("keeps measurements only after explicit consent and limits restored messages", () => {
    const raw = serializeAIClientState({
      conversationId: "11111111-1111-4111-8111-111111111111",
      measurementConsent: true,
      messages: Array.from({ length: 35 }, (_, index) => ({
        id: `message-${index}`,
        role: "user" as const,
        content: index === 34 ? "рост 178 см" : `message ${index}`,
      })),
    });
    const restored = parseAIClientState(raw);
    expect(restored?.measurementConsent).toBe(true);
    expect(restored?.messages).toHaveLength(30);
    expect(restored?.messages.at(-1)?.content).toContain("178 см");
  });

  it("rejects malformed or oversized persisted state", () => {
    expect(parseAIClientState("not-json")).toBeNull();
    expect(
      parseAIClientState(
        JSON.stringify({ version: 1, measurementConsent: false, messages: [], extra: true }),
      ),
    ).toBeNull();
  });
});
