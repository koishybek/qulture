import { describe, expect, it } from "vitest";

import { canCapturePiiUnderPolicy, isDraftPolicyVersion } from "./pii-policy";

describe("draft PII capture policy", () => {
  it("recognizes explicit draft policy versions", () => {
    expect(isDraftPolicyVersion("2026-07-draft")).toBe(true);
    expect(isDraftPolicyVersion("DRAFT 2026-07-15")).toBe(true);
    expect(isDraftPolicyVersion("2026-08-approved")).toBe(false);
  });

  it("rejects production capture under a draft unless explicitly enabled", () => {
    expect(canCapturePiiUnderPolicy({ policyVersion: "2026-07-draft", nodeEnv: "production", explicitOptIn: "" })).toBe(false);
    expect(canCapturePiiUnderPolicy({ policyVersion: "2026-07-draft", nodeEnv: "production", explicitOptIn: "true" })).toBe(true);
    expect(canCapturePiiUnderPolicy({ policyVersion: "2026-07-draft", nodeEnv: "production", explicitOptIn: "1" })).toBe(true);
  });

  it("allows local development and non-draft production policies", () => {
    expect(canCapturePiiUnderPolicy({ policyVersion: "2026-07-draft", nodeEnv: "development" })).toBe(true);
    expect(canCapturePiiUnderPolicy({ policyVersion: "2026-08-approved", nodeEnv: "production" })).toBe(true);
  });
});
