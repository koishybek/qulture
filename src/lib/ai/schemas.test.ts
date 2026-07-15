import { describe, expect, it } from "vitest";

import {
  AIRequestSchema,
  AIAssistantOutputSchema,
  CreateWaitlistInputSchema,
  HandoffRequestSchema,
  RecommendSizeInputSchema,
} from "@/lib/ai/schemas";
import { openAITools } from "@/lib/ai/tools";

describe("AI schemas", () => {
  it("keeps every Responses API tool in strict JSON-schema mode", () => {
    expect(openAITools).toHaveLength(10);
    for (const tool of openAITools) {
      expect(tool.type).toBe("function");
      expect(tool.strict).toBe(true);
      expect(tool.parameters).toMatchObject({
        type: "object",
        additionalProperties: false,
      });

      const parameters = tool.parameters as {
        properties?: Record<string, unknown>;
        required?: string[];
      };
      expect(new Set(parameters.required)).toEqual(
        new Set(Object.keys(parameters.properties ?? {})),
      );
      expect(JSON.stringify(tool.parameters)).not.toMatch(/\(\?[=!<]/);
    }
  });

  it("rejects body measurements without explicit consent at the contract boundary", () => {
    const base = {
      productId: "product-1",
      fitProfile: null,
      heightCm: null,
      weightKg: null,
      usualSize: null,
      chestCm: 98,
      waistCm: null,
      hipsCm: null,
      fitPreference: null,
      layer: null,
      measurementConsent: false,
    };

    // The schema preserves the consent bit for the deterministic executor,
    // which performs the policy rejection before calling the size engine.
    expect(RecommendSizeInputSchema.parse(base).measurementConsent).toBe(false);
    expect(
      RecommendSizeInputSchema.safeParse({ ...base, hiddenField: "not allowed" }).success,
    ).toBe(false);
  });

  it("separates service, restock and marketing consent", () => {
    const lead = {
      productId: null,
      variantId: null,
      color: null,
      size: null,
      city: "Алматы",
      name: "Айжан",
      email: "aizhan@example.com",
      phone: null,
      contactPurpose: "launch" as const,
      serviceConsent: true,
      restockConsent: false,
      marketingConsent: false,
      source: "ai",
      idempotencyKey: "waitlist-123",
    };

    const parsed = CreateWaitlistInputSchema.parse(lead);
    expect(parsed.serviceConsent).toBe(true);
    expect(parsed.restockConsent).toBe(false);
    expect(parsed.marketingConsent).toBe(false);
    expect(
      CreateWaitlistInputSchema.safeParse({ ...lead, serviceConsent: false }).success,
    ).toBe(false);
  });

  it("requires a contact, explicit service consent and policy version for handoff PII", () => {
    const request = {
      conversationId: null,
      reason: "user_request" as const,
      userQuestion: "Передайте вопрос команде",
      productId: null,
      selectedVariantId: null,
      aiConfidence: null,
      summary: null,
      contactName: "Айжан",
      contactEmail: "aizhan@example.com",
      contactPhone: null,
      idempotencyKey: "handoff-123",
      locale: "ru" as const,
      measurementConsent: false,
      contactConsent: true as const,
      policyVersion: "2026-07-draft",
    };

    expect(HandoffRequestSchema.parse(request).contactConsent).toBe(true);
    expect(HandoffRequestSchema.safeParse({ ...request, contactConsent: false }).success).toBe(false);
    expect(HandoffRequestSchema.safeParse({ ...request, contactEmail: null }).success).toBe(false);
  });

  it("enforces one to three next actions", () => {
    expect(
      AIAssistantOutputSchema.safeParse({ answer: "Короткий ответ.", actions: [] })
        .success,
    ).toBe(false);
    expect(
      AIAssistantOutputSchema.safeParse({
        answer: "Короткий ответ.",
        actions: Array.from({ length: 4 }, (_, index) => ({
          kind: "ask",
          label: `Действие ${index}`,
          value: `Вопрос ${index}`,
        })),
      }).success,
    ).toBe(false);
  });

  it("accepts only non-PII product, variant and cart interface context", () => {
    const parsed = AIRequestSchema.parse({
      message: "Подскажи размер",
      locale: "ru",
      context: {
        currentPage: "/ru/product/city-shell",
        productId: "product-1",
        selectedVariantId: "variant-1",
        selectedColor: "graphite",
        selectedSize: "L",
        cart: [{ productId: "product-2", variantId: "variant-2", quantity: 1 }],
        entryPoint: "pdp",
        sessionId: "session-123",
        measurementConsent: false,
      },
    });
    expect(parsed.context?.selectedVariantId).toBe("variant-1");
    expect(
      AIRequestSchema.safeParse({
        ...parsed,
        context: { ...parsed.context, email: "not-allowed@example.com" },
      }).success,
    ).toBe(false);
  });
});
