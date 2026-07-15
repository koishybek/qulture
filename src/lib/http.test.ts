import { describe, expect, it } from "vitest";

import { isSameOrigin } from "@/lib/http";

describe("same-origin request guard", () => {
  it("uses the actual Host header when a framework canonicalizes request.url", () => {
    const request = new Request("http://localhost:3200/api/orders", {
      headers: {
        host: "127.0.0.1:3200",
        origin: "http://127.0.0.1:3200",
      },
    });
    expect(isSameOrigin(request)).toBe(true);
  });

  it("rejects a browser origin from another host", () => {
    const request = new Request("http://localhost:3200/api/orders", {
      headers: {
        host: "shop.example.com",
        origin: "https://attacker.example",
      },
    });
    expect(isSameOrigin(request)).toBe(false);
  });
});
