import { describe, expect, it } from "vitest";

import {
  createOwnershipToken,
  hashOwnershipToken,
  tokenHashMatches,
  verifyOwnershipToken,
} from "./ownership-token";

const secret = "a-test-secret-that-is-not-used-outside-tests";

describe("order ownership token", () => {
  it("round-trips a signed, unexpired order payload", () => {
    const token = createOwnershipToken("Q-D20260715-ABC123", secret, 1_000);
    const payload = verifyOwnershipToken(token, secret, 1_001);

    expect(payload?.orderNumber).toBe("Q-D20260715-ABC123");
    expect(tokenHashMatches(token, hashOwnershipToken(token))).toBe(true);
  });

  it("rejects tampering and a different secret", () => {
    const token = createOwnershipToken("Q-D20260715-ABC123", secret, 1_000);
    expect(verifyOwnershipToken(`${token}x`, secret, 1_001)).toBeNull();
    expect(verifyOwnershipToken(token, "wrong-secret", 1_001)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = createOwnershipToken("Q-D20260715-ABC123", secret, 1_000);
    expect(verifyOwnershipToken(token, secret, 3_000_000)).toBeNull();
  });
});

