import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  productFindFirst: vi.fn(),
  variantFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    product: { findFirst: mocks.productFindFirst },
    variant: { findMany: mocks.variantFindMany },
  },
}));

import { defaultAIDataAdapter } from "./adapters";

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: "product-1",
    slug: "city-shell",
    nameRu: "Городская оболочка",
    nameKz: "Қалалық қабық",
    nameEn: "City shell",
    descriptionRu: "Русское описание",
    descriptionKz: "Қазақша сипаттама",
    descriptionEn: "English description",
    category: "outerwear",
    priceMinor: 54_000,
    comparePriceMinor: null,
    currency: "KZT",
    isPreorder: false,
    preorderEta: null,
    variants: [
      {
        id: "variant-1",
        productId: "product-1",
        colorCode: "graphite",
        colorNameRu: "Графит",
        colorNameKz: "Графит",
        colorNameEn: "Graphite",
        sizeLabel: "M",
        stock: 3,
        reservedStock: 0,
        priceMinor: null,
        incomingEta: null,
        leadTimeDays: null,
      },
    ],
    ...overrides,
  };
}

describe("AI adapter English localization", () => {
  beforeEach(() => {
    mocks.productFindFirst.mockReset();
    mocks.variantFindMany.mockReset();
  });

  it("uses English product fields and never falls back to Russian", async () => {
    mocks.productFindFirst.mockResolvedValue(product());

    const result = await defaultAIDataAdapter.getPublishedProduct({
      productId: "product-1",
      slug: null,
      locale: "en",
    });

    expect(result).toMatchObject({
      name: "City shell",
      description: "English description",
      variants: [{ colorName: "Graphite" }],
    });
    expect(JSON.stringify(result)).not.toContain("Городская оболочка");
    expect(JSON.stringify(result)).not.toContain("Русское описание");
  });

  it("withholds a product when required English copy is missing", async () => {
    mocks.productFindFirst.mockResolvedValue(product({ nameEn: null }));

    await expect(
      defaultAIDataAdapter.getPublishedProduct({
        productId: "product-1",
        slug: null,
        locale: "en",
      }),
    ).resolves.toBeNull();
  });

  it("does not expose a stock row whose English color label is missing", async () => {
    mocks.productFindFirst.mockResolvedValue({ id: "product-1" });
    mocks.variantFindMany.mockResolvedValue([
      {
        id: "variant-1",
        productId: "product-1",
        colorCode: "graphite",
        colorNameRu: "Графит",
        colorNameKz: "Графит",
        colorNameEn: null,
        sizeLabel: "M",
        stock: 3,
        reservedStock: 0,
        incomingEta: null,
        leadTimeDays: null,
      },
    ]);

    await expect(
      defaultAIDataAdapter.getPublishedStock({
        productId: "product-1",
        variantId: null,
        color: null,
        size: null,
        locale: "en",
      }),
    ).resolves.toEqual([]);
  });
});
