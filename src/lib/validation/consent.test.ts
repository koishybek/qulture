import { describe, expect, it } from "vitest";

import {
  canSendWaitlistMessage,
  hasConsent,
  resolveConsentChoice,
  waitlistConsentSchema,
} from "./consent";

describe("consent separation", () => {
  it("allows analytics without silently enabling marketing", () => {
    const consent = resolveConsentChoice({
      type: "custom",
      policyVersion: "2026-07-draft",
      analytics: true,
      marketing: false,
    });

    expect(hasConsent(consent, "necessary")).toBe(true);
    expect(hasConsent(consent, "analytics")).toBe(true);
    expect(hasConsent(consent, "marketing")).toBe(false);
  });

  it("keeps service, restock, and marketing permissions independent", () => {
    const consent = waitlistConsentSchema.parse({
      serviceConsent: true,
      restockConsent: true,
      marketingConsent: false,
    });

    expect(canSendWaitlistMessage(consent, "service")).toBe(true);
    expect(canSendWaitlistMessage(consent, "restock")).toBe(true);
    expect(canSendWaitlistMessage(consent, "marketing")).toBe(false);
  });
});
