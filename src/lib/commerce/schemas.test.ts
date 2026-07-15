import { describe, expect, it } from "vitest";

import { demoOrderRequestSchema } from "./schemas";

const validOrder = {
  locale: "ru",
  customer: {
    name: "Demo User",
    email: "demo@example.com",
    phone: "+7 700 000 00 00",
  },
  delivery: {
    city: "Astana",
    address: "Demo street 1",
    method: "mock_courier",
  },
  paymentMethod: "development_mock",
  termsAccepted: true,
  serviceConsent: true,
  lines: [
    {
      variantId: "variant-1",
      quantity: 1,
      unitPrice: 1,
      name: "untrusted client value",
    },
  ],
};

describe("demoOrderRequestSchema", () => {
  it("keeps only the identifiers needed for server-side pricing", () => {
    const result = demoOrderRequestSchema.parse(validOrder);
    expect(result.lines).toEqual([{ variantId: "variant-1", quantity: 1 }]);
  });

  it("requires sale terms and service consent", () => {
    expect(
      demoOrderRequestSchema.safeParse({ ...validOrder, termsAccepted: false }).success,
    ).toBe(false);
    expect(
      demoOrderRequestSchema.safeParse({ ...validOrder, serviceConsent: false }).success,
    ).toBe(false);
  });

  it("rejects non-mock payments and malformed phone contacts", () => {
    expect(
      demoOrderRequestSchema.safeParse({
        ...validOrder,
        paymentMethod: "card",
      }).success,
    ).toBe(false);
    expect(
      demoOrderRequestSchema.safeParse({
        ...validOrder,
        customer: { ...validOrder.customer, phone: "not a phone" },
      }).success,
    ).toBe(false);
  });
});

