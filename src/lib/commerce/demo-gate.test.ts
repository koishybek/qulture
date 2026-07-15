import { afterEach, describe, expect, it } from "vitest";

import {
  canPersistDemoModeSetting,
  isDemoCommerceRequested,
  isDemoOrderApiEnabled,
} from "@/lib/commerce/demo-gate";

const originalNodeEnv = process.env.NODE_ENV;
const originalDemoFlag = process.env.QULTURE_DEMO_COMMERCE;

afterEach(() => {
  Object.assign(process.env, {
    NODE_ENV: originalNodeEnv,
    QULTURE_DEMO_COMMERCE: originalDemoFlag,
  });
});

describe("demo commerce gate", () => {
  it("allows query and admin preview settings only outside production", () => {
    Object.assign(process.env, { NODE_ENV: "development", QULTURE_DEMO_COMMERCE: "0" });
    expect(isDemoCommerceRequested("1", false)).toBe(true);
    expect(isDemoCommerceRequested(undefined, true)).toBe(true);
    expect(isDemoOrderApiEnabled()).toBe(true);
    expect(canPersistDemoModeSetting()).toBe(true);
  });

  it("ignores public query and database demo flags in production", () => {
    Object.assign(process.env, { NODE_ENV: "production", QULTURE_DEMO_COMMERCE: "0" });
    expect(isDemoCommerceRequested("1", true)).toBe(false);
    expect(isDemoOrderApiEnabled()).toBe(false);
    expect(canPersistDemoModeSetting()).toBe(false);
  });

  it("requires the explicit server flag for a production preview", () => {
    Object.assign(process.env, { NODE_ENV: "production", QULTURE_DEMO_COMMERCE: "1" });
    expect(isDemoCommerceRequested(undefined, false)).toBe(true);
    expect(isDemoOrderApiEnabled()).toBe(true);
    expect(canPersistDemoModeSetting()).toBe(true);
  });
});
