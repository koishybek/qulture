import { describe, expect, it } from "vitest";

import { parseWaitlistInput, waitlistInputSchema } from "./waitlist";

const validInput = {
  productId: "demo-top",
  color: "Graphite",
  size: "M",
  city: "Almaty",
  name: "Aruzhan",
  email: "USER@Example.com",
  contactPurpose: "LAUNCH" as const,
  serviceConsent: true as const,
  restockConsent: false,
  marketingConsent: false,
  policyVersion: "2026-07-draft",
  language: "KZ" as const,
  source: "waitlist-modal",
};

describe("waitlist validation", () => {
  it("requires a contact and service consent", () => {
    const result = waitlistInputSchema.safeParse({
      ...validInput,
      email: undefined,
      phone: undefined,
      serviceConsent: false,
    });

    expect(result.success).toBe(false);
  });

  it("requires explicit restock consent for a restock purpose", () => {
    const result = waitlistInputSchema.safeParse({
      ...validInput,
      contactPurpose: "RESTOCK",
      restockConsent: false,
    });

    expect(result.success).toBe(false);
  });

  it("requires the exact policy version shown with the form", () => {
    const result = waitlistInputSchema.safeParse({
      ...validInput,
      policyVersion: "",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes identity before producing a non-PII dedup key", () => {
    const first = parseWaitlistInput(validInput);
    const second = parseWaitlistInput({
      ...validInput,
      email: " user@example.com ",
      color: "graphite",
      size: "m",
    });

    expect(first.email).toBe("user@example.com");
    expect(first.dedupKey).toBe(second.dedupKey);
    expect(first.dedupKey).not.toContain("user@example.com");
  });
});
