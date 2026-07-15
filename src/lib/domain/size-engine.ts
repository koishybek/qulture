export type SizeConfidence = "none" | "low" | "medium" | "high";
export type SizeRuleStatus = "DRAFT" | "APPROVED" | "ARCHIVED";
export type FitPreference = "CLOSE" | "REGULAR" | "RELAXED";
export type LayerPreference = "NONE" | "THIN" | "MID" | "THICK";

export type MeasurementKey =
  | "heightCm"
  | "weightKg"
  | "chestCm"
  | "waistCm"
  | "hipsCm";

export interface NumericRange {
  min: number;
  max: number;
}

export interface SizeRangeRule {
  size: string;
  ranges: Partial<Record<MeasurementKey, NumericRange>>;
}

export interface SizeRuleSet {
  version: string;
  status: SizeRuleStatus;
  garmentMeasurementsApproved: boolean;
  sizes: SizeRangeRule[];
}

export interface SizeRecommendationInput {
  productId?: string;
  fitProfile?: string;
  heightCm?: number;
  weightKg?: number;
  usualSize?: string;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  fitPreference?: FitPreference;
  layer?: LayerPreference;
  rules?: SizeRuleSet | null;
}

export interface SizeRecommendation {
  recommendedSize: string | null;
  alternativeSize: string | null;
  confidence: SizeConfidence;
  reasons: string[];
  ruleVersion: string | null;
  missingInputs: string[];
}

const measurementKeys: readonly MeasurementKey[] = [
  "heightCm",
  "weightKg",
  "chestCm",
  "waistCm",
  "hipsCm",
];

interface CandidateScore {
  size: string;
  score: number;
  compared: number;
  inside: number;
  outside: number;
}

function unavailable(
  reasons: string[],
  missingInputs: string[],
  ruleVersion: string | null,
): SizeRecommendation {
  return {
    recommendedSize: null,
    alternativeSize: null,
    confidence: "none",
    reasons,
    ruleVersion,
    missingInputs: [...new Set(missingInputs)],
  };
}

function validRange(range: NumericRange | undefined): range is NumericRange {
  return Boolean(
    range &&
      Number.isFinite(range.min) &&
      Number.isFinite(range.max) &&
      range.max >= range.min,
  );
}

function scoreRange(value: number, range: NumericRange): { score: number; inside: boolean } {
  const span = Math.max(range.max - range.min, 1);
  if (value >= range.min && value <= range.max) {
    const center = (range.min + range.max) / 2;
    const centrality = 1 - Math.min(1, Math.abs(value - center) / (span / 2 || 1));
    return { score: 3 + centrality, inside: true };
  }

  const distance = value < range.min ? range.min - value : value - range.max;
  return { score: -2 - (distance / span) * 4, inside: false };
}

function preferenceIndex(input: SizeRecommendationInput, sizes: readonly SizeRangeRule[]): number | null {
  if (!input.usualSize) {
    return null;
  }

  const usualIndex = sizes.findIndex(
    (rule) => rule.size.toLocaleUpperCase() === input.usualSize?.trim().toLocaleUpperCase(),
  );
  if (usualIndex < 0) {
    return null;
  }

  const wantsMoreRoom =
    input.fitPreference === "RELAXED" ||
    input.layer === "MID" ||
    input.layer === "THICK";
  const wantsLessRoom = input.fitPreference === "CLOSE" && input.layer !== "THICK";
  return Math.max(
    0,
    Math.min(sizes.length - 1, usualIndex + (wantsMoreRoom ? 1 : wantsLessRoom ? -1 : 0)),
  );
}

export function recommendSize(input: SizeRecommendationInput): SizeRecommendation {
  const rules = input.rules;
  if (!rules) {
    return unavailable(
      ["No approved size rule set is available."],
      ["approvedSizeRules", "approvedGarmentMeasurements"],
      null,
    );
  }

  if (rules.status !== "APPROVED") {
    return unavailable(
      ["The available size rules are not approved."],
      ["approvedSizeRules"],
      rules.version,
    );
  }

  if (!rules.garmentMeasurementsApproved) {
    return unavailable(
      ["Garment measurements have not been approved."],
      ["approvedGarmentMeasurements"],
      rules.version,
    );
  }

  const sizes = rules.sizes.filter(
    (rule) =>
      rule.size.trim().length > 0 &&
      measurementKeys.some((key) => validRange(rule.ranges[key])),
  );
  if (sizes.length === 0) {
    return unavailable(
      ["The approved rule set has no usable size ranges."],
      ["sizeRanges"],
      rules.version,
    );
  }

  const expectedMeasurements = measurementKeys.filter((key) =>
    sizes.some((size) => validRange(size.ranges[key])),
  );
  const missingInputs: string[] = expectedMeasurements.filter(
    (key) => !Number.isFinite(input[key]),
  );
  if (!input.usualSize) {
    missingInputs.push("usualSize");
  }

  const preferredIndex = preferenceIndex(input, sizes);
  const scores = sizes.map<CandidateScore>((sizeRule, index) => {
    let score = 0;
    let compared = 0;
    let inside = 0;
    let outside = 0;

    for (const key of measurementKeys) {
      const value = input[key];
      const range = sizeRule.ranges[key];
      if (!Number.isFinite(value) || !validRange(range)) {
        continue;
      }

      const result = scoreRange(value as number, range);
      score += result.score;
      compared += 1;
      if (result.inside) {
        inside += 1;
      } else {
        outside += 1;
      }
    }

    if (input.usualSize?.trim().toLocaleUpperCase() === sizeRule.size.toLocaleUpperCase()) {
      score += 1.5;
    }
    if (preferredIndex === index) {
      score += 1;
    }

    return { size: sizeRule.size, score, compared, inside, outside };
  });

  const hasComparableMeasurement = scores.some((candidate) => candidate.compared > 0);
  const hasKnownUsualSize = sizes.some(
    (rule) => rule.size.toLocaleUpperCase() === input.usualSize?.trim().toLocaleUpperCase(),
  );
  if (!hasComparableMeasurement && !hasKnownUsualSize) {
    return unavailable(
      ["More user measurements or a known usual size are required."],
      missingInputs,
      rules.version,
    );
  }

  scores.sort((left, right) => right.score - left.score);
  const winner = scores[0];
  const runnerUp = scores[1];
  const margin = runnerUp ? winner.score - runnerUp.score : winner.score;

  if (winner.compared > 0 && winner.inside === 0) {
    return unavailable(
      ["The supplied measurements do not fall inside an approved size range."],
      [...missingInputs, "matchingSizeRange"],
      rules.version,
    );
  }

  let confidence: SizeConfidence = "low";
  if (winner.compared >= 3 && winner.outside === 0 && margin >= 1) {
    confidence = "high";
  } else if (winner.compared >= 2 && winner.inside >= 1 && winner.outside <= 1) {
    confidence = "medium";
  }

  const reasons = [
    winner.compared > 0
      ? `${winner.inside} of ${winner.compared} supplied measurements fall inside ${winner.size} ranges.`
      : `The usual size matches ${winner.size}.`,
  ];
  if (input.fitPreference === "RELAXED") {
    reasons.push("The relaxed fit preference was included in the comparison.");
  }
  if (input.layer === "MID" || input.layer === "THICK") {
    reasons.push("Layering preference was included in the comparison.");
  }

  return {
    recommendedSize: winner.size,
    alternativeSize: runnerUp?.size ?? null,
    confidence,
    reasons,
    ruleVersion: rules.version,
    missingInputs: [...new Set(missingInputs)],
  };
}
