import { beforeEach, describe, expect, it, vi } from "vitest";

import { executeAITool } from "@/lib/ai/tools";
import type { ToolDataAdapter } from "@/lib/ai/types";

function adapter(overrides: Partial<ToolDataAdapter> = {}): ToolDataAdapter {
  return {
    getPublishedProduct: vi.fn(async () => null),
    getPublishedStock: vi.fn(async () => []),
    getApprovedSizeRules: vi.fn(async () => null),
    searchPublishedKnowledge: vi.fn(async () => []),
    createWaitlistLead: vi.fn(async () => ({ accepted: true })),
    createHandoffTicket: vi.fn(async () => ({ accepted: true })),
    getAuthorizedOrderStatus: vi.fn(async () => ({
      authorized: false as const,
      found: false,
    })),
    ...overrides,
  };
}

const context = {
  correlationId: "corr-test-123",
  locale: "ru" as const,
  conversationId: "conversation-test",
};

describe("AI tool execution", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("always returns the standard machine-readable result shape", async () => {
    const result = await executeAITool("get_product", "{broken", context, {
      adapter: adapter(),
    });

    expect(result).toEqual({
      status: "validation_error",
      tool: "get_product",
      correlationId: "corr-test-123",
      data: null,
      error: {
        code: "invalid_tool_arguments",
        message: expect.any(String),
        issues: expect.any(Array),
      },
    });
  });

  it("does not recommend an exact size when approved rules are absent", async () => {
    const data = adapter({ getApprovedSizeRules: vi.fn(async () => null) });
    const result = await executeAITool(
      "recommend_size",
      {
        productId: "product-1",
        fitProfile: null,
        heightCm: null,
        weightKg: null,
        usualSize: "M",
        chestCm: null,
        waistCm: null,
        hipsCm: null,
        fitPreference: "regular",
        layer: "thin",
        measurementConsent: false,
      },
      context,
      { adapter: data },
    );

    expect(result.status).toBe("success");
    expect(result.data).toMatchObject({
      exactRecommendationAvailable: false,
      recommendation: {
        recommendedSize: null,
        confidence: "none",
        ruleVersion: null,
      },
    });
  });

  it("blocks body measurements before the deterministic engine without consent", async () => {
    const sizeRecommender = vi.fn();
    const result = await executeAITool(
      "recommend_size",
      {
        productId: "product-1",
        fitProfile: null,
        heightCm: null,
        weightKg: null,
        usualSize: null,
        chestCm: 96,
        waistCm: null,
        hipsCm: null,
        fitPreference: null,
        layer: null,
        measurementConsent: false,
      },
      context,
      { adapter: adapter(), sizeRecommender },
    );

    expect(result.status).toBe("validation_error");
    expect(sizeRecommender).not.toHaveBeenCalled();
  });

  it("returns a confirmation intent and never reports a cart mutation", async () => {
    const data = adapter({
      getPublishedStock: vi.fn(async () => [
        {
          variantId: "variant-1",
          productId: "product-1",
          colorCode: "graphite",
          colorName: "Графит",
          size: "M",
          available: true,
          availableQuantity: 2,
          incomingEta: null,
          leadTimeDays: null,
        },
      ]),
    });
    const result = await executeAITool(
      "add_to_cart",
      {
        items: [{ productId: "product-1", variantId: "variant-1", quantity: 1 }],
        idempotencyKey: "cart-intent-123",
      },
      context,
      { adapter: data },
    );

    expect(result).toMatchObject({
      status: "success",
      data: {
        intentId: "cart-intent-123",
        requiresConfirmation: true,
        cartMutated: false,
      },
    });
  });

  it("passes verified handoff consent context to persistence", async () => {
    const createHandoffTicket = vi.fn(async () => ({ accepted: true }));
    const result = await executeAITool(
      "create_handoff",
      {
        conversationId: null,
        reason: "user_request",
        userQuestion: "Передайте вопрос",
        productId: null,
        selectedVariantId: null,
        aiConfidence: null,
        summary: null,
        contactName: "Айжан",
        contactEmail: "aizhan@example.com",
        contactPhone: null,
        idempotencyKey: "handoff-tool-123",
      },
      {
        ...context,
        contactConsent: true,
        policyVersion: "2026-07-draft",
      },
      { adapter: adapter({ createHandoffTicket }) },
    );

    expect(result.status).toBe("success");
    expect(createHandoffTicket).toHaveBeenCalledWith(expect.objectContaining({
      contactConsent: true,
      policyVersion: "2026-07-draft",
    }));
  });
});
