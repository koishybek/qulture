import { describe, expect, it } from "vitest";

import { InvalidWaitlistContextError, selectVerifiedWaitlistVariant } from "./context";

const variants = [
  { id: "v-graphite-m", colorCode: "graphite", colorNameRu: "Графит", colorNameKz: "Графит", sizeLabel: "M" },
  { id: "v-sand-m", colorCode: "sand", colorNameRu: "Песочный", colorNameKz: "Құм", sizeLabel: "M" },
];

describe("waitlist catalog context", () => {
  it("derives canonical color and size from a matching variant id", () => {
    expect(selectVerifiedWaitlistVariant(variants, {
      variantId: "v-graphite-m",
      color: "ГРАФИТ",
      size: "m",
    })).toEqual(variants[0]);
  });

  it("rejects a variant paired with tampered labels", () => {
    expect(() => selectVerifiedWaitlistVariant(variants, {
      variantId: "v-graphite-m",
      color: "sand",
      size: "M",
    })).toThrow(InvalidWaitlistContextError);
  });

  it("rejects ambiguous label-only context", () => {
    expect(() => selectVerifiedWaitlistVariant(variants, { size: "M" })).toThrow(InvalidWaitlistContextError);
  });
});
