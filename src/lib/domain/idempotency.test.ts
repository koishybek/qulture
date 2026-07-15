import { describe, expect, it, vi } from "vitest";

import {
  fingerprintRequest,
  IdempotencyConflictError,
  IdempotencyCoordinator,
} from "./idempotency";

describe("idempotency", () => {
  it("creates an order once and replays the original result", async () => {
    const coordinator = new IdempotencyCoordinator();
    const createOrder = vi.fn(async () => ({ id: "order-1", number: "Q-0001" }));
    const payload = { cartId: "cart-1", totalMinor: 150_000 };

    const [first, replay] = await Promise.all([
      coordinator.run("order", "checkout-1", payload, createOrder),
      coordinator.run("order", "checkout-1", payload, createOrder),
    ]);

    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(first.value).toEqual(replay.value);
    expect([first.replayed, replay.replayed].sort()).toEqual([false, true]);
  });

  it("rejects reuse of a key for a different request", async () => {
    const coordinator = new IdempotencyCoordinator();
    await coordinator.run("order", "checkout-1", { totalMinor: 100 }, async () => "ok");

    await expect(
      coordinator.run("order", "checkout-1", { totalMinor: 101 }, async () => "wrong"),
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it("fingerprints equivalent object key orders identically", () => {
    expect(fingerprintRequest({ b: 2, a: 1 })).toBe(fingerprintRequest({ a: 1, b: 2 }));
  });
});
