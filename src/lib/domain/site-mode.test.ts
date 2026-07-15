import { describe, expect, it } from "vitest";

import {
  canExposeProduct,
  canExposeProductPrice,
  getSiteCapabilities,
} from "./site-mode";

describe("site mode", () => {
  it("keeps checkout and prices disabled in pre-launch", () => {
    const settings = {
      siteMode: "PRE_LAUNCH" as const,
      catalogVisible: true,
      controlledPreview: true,
      demoMode: false,
    };

    expect(getSiteCapabilities(settings)).toMatchObject({
      canBrowseCatalog: true,
      canCheckout: false,
      canShowPrices: false,
    });
    expect(
      canExposeProductPrice(
        { status: "PREVIEW", isDemo: false, priceMinor: 50_000 },
        settings,
      ),
    ).toBe(false);
  });

  it("enables published commerce products without exposing demo records", () => {
    const settings = {
      siteMode: "COMMERCE" as const,
      catalogVisible: true,
      demoMode: false,
    };

    expect(canExposeProduct({ status: "ACTIVE", isDemo: false }, settings)).toBe(true);
    expect(
      canExposeProduct(
        { status: "DRAFT", isDemo: true },
        settings,
        { allowDemoRoute: true },
      ),
    ).toBe(false);
  });

  it("requires both demo mode and an explicit demo route", () => {
    const settings = {
      siteMode: "PRE_LAUNCH" as const,
      catalogVisible: false,
      demoMode: true,
    };
    const demo = { status: "DRAFT" as const, isDemo: true, priceMinor: 10_000 };

    expect(canExposeProduct(demo, settings)).toBe(false);
    expect(canExposeProduct(demo, settings, { allowDemoRoute: true })).toBe(true);
    expect(canExposeProductPrice(demo, settings, { allowDemoRoute: true })).toBe(true);
  });
});
