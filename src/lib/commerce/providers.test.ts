import { afterEach, describe, expect, it } from "vitest";

import {
  developmentMockPaymentProvider,
  getProductionCommerceReadiness,
  isProductionCommerceReady,
} from "./providers";

const ORIGINAL_PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER;

afterEach(() => {
  if (ORIGINAL_PAYMENT_PROVIDER === undefined) {
    delete process.env.PAYMENT_PROVIDER;
  } else {
    process.env.PAYMENT_PROVIDER = ORIGINAL_PAYMENT_PROVIDER;
  }
});

describe("commerce provider boundary", () => {
  it("keeps the development payment adapter test-only", async () => {
    await expect(
      developmentMockPaymentProvider.authorize({
        amountMinor: 100,
        currency: "KZT",
        orderReference: "real-order",
        idempotencyKey: "idempotency-key",
        isTest: false,
      }),
    ).rejects.toThrow(/test-only/i);
  });

  it("returns a paid reference for a positive test amount", async () => {
    const result = await developmentMockPaymentProvider.authorize({
      amountMinor: 100,
      currency: "KZT",
      orderReference: "test-order",
      idempotencyKey: "idempotency-key",
      isTest: true,
    });

    expect(result.status).toBe("PAID");
    expect(result.reference).toMatch(/^mock_[a-f0-9]+$/);
  });

  it("does not treat an environment label as an implemented adapter", () => {
    process.env.PAYMENT_PROVIDER = "future-provider";
    const states = getProductionCommerceReadiness();
    const payment = states.find((state) => state.kind === "payment");

    expect(payment).toMatchObject({
      configured: false,
      provider: "future-provider",
      reason: "adapter_not_implemented",
    });
    expect(isProductionCommerceReady(states)).toBe(false);
  });
});
