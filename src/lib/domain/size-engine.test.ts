import { describe, expect, it } from "vitest";

import { recommendSize, type SizeRuleSet } from "./size-engine";

const approvedRules: SizeRuleSet = {
  version: "fit-v1",
  status: "APPROVED",
  garmentMeasurementsApproved: true,
  sizes: [
    {
      size: "M",
      ranges: {
        heightCm: { min: 168, max: 180 },
        weightKg: { min: 60, max: 75 },
        chestCm: { min: 88, max: 96 },
        waistCm: { min: 74, max: 82 },
      },
    },
    {
      size: "L",
      ranges: {
        heightCm: { min: 176, max: 188 },
        weightKg: { min: 75, max: 90 },
        chestCm: { min: 96, max: 104 },
        waistCm: { min: 82, max: 90 },
      },
    },
  ],
};

describe("deterministic size engine", () => {
  it("returns high confidence when several approved ranges agree", () => {
    const result = recommendSize({
      rules: approvedRules,
      heightCm: 176,
      weightKg: 70,
      chestCm: 93,
      waistCm: 79,
      usualSize: "M",
      fitPreference: "REGULAR",
      layer: "THIN",
    });

    expect(result).toMatchObject({
      recommendedSize: "M",
      alternativeSize: "L",
      confidence: "high",
      ruleVersion: "fit-v1",
    });
  });

  it("returns no recommendation without approved size data", () => {
    const result = recommendSize({ heightCm: 176, weightKg: 70, usualSize: "M" });

    expect(result.recommendedSize).toBeNull();
    expect(result.confidence).toBe("none");
    expect(result.missingInputs).toContain("approvedSizeRules");
  });

  it("does not use an unapproved garment chart", () => {
    const result = recommendSize({
      heightCm: 176,
      weightKg: 70,
      rules: { ...approvedRules, garmentMeasurementsApproved: false },
    });

    expect(result.recommendedSize).toBeNull();
    expect(result.missingInputs).toEqual(["approvedGarmentMeasurements"]);
  });

  it("does not force a recommendation when no approved range matches", () => {
    const result = recommendSize({
      heightCm: 205,
      weightKg: 120,
      chestCm: 125,
      waistCm: 115,
      rules: approvedRules,
    });

    expect(result.recommendedSize).toBeNull();
    expect(result.confidence).toBe("none");
    expect(result.missingInputs).toContain("matchingSizeRange");
  });
});
