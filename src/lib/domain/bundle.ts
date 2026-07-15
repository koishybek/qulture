import { assertMinorUnits, clampDiscount } from "./money";

export interface StockedVariant {
  id: string;
  size: string;
  stock: number;
  reservedStock: number;
  active: boolean;
}

export interface BundleSelection {
  componentId: string;
  productId: string;
  role: string;
  requiredQuantity?: number;
  variant: StockedVariant | null;
}

export interface BundleComponentAvailability {
  componentId: string;
  productId: string;
  role: string;
  variantId: string | null;
  size: string | null;
  availableUnits: number;
  requiredUnits: number;
  available: boolean;
  reason: "available" | "variant_not_selected" | "variant_inactive" | "insufficient_stock";
}

export interface BundleAvailability {
  available: boolean;
  requestedQuantity: number;
  maxBundleQuantity: number;
  components: BundleComponentAvailability[];
  unavailableComponentIds: string[];
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${field} must be a positive safe integer`);
  }
  return value;
}

export function variantAvailableStock(variant: Pick<StockedVariant, "stock" | "reservedStock" | "active">): number {
  if (!variant.active) {
    return 0;
  }

  return Math.max(0, variant.stock - variant.reservedStock);
}

export function calculateBundleAvailability(
  selections: readonly BundleSelection[],
  requestedQuantity = 1,
): BundleAvailability {
  positiveInteger(requestedQuantity, "requestedQuantity");

  if (selections.length === 0) {
    return {
      available: false,
      requestedQuantity,
      maxBundleQuantity: 0,
      components: [],
      unavailableComponentIds: [],
    };
  }

  const components = selections.map<BundleComponentAvailability>((selection) => {
    const requiredUnits = positiveInteger(
      selection.requiredQuantity ?? 1,
      `requiredQuantity:${selection.componentId}`,
    );

    if (!selection.variant) {
      return {
        componentId: selection.componentId,
        productId: selection.productId,
        role: selection.role,
        variantId: null,
        size: null,
        availableUnits: 0,
        requiredUnits,
        available: false,
        reason: "variant_not_selected",
      };
    }

    const availableUnits = variantAvailableStock(selection.variant);
    const enoughForRequest = availableUnits >= requiredUnits * requestedQuantity;

    return {
      componentId: selection.componentId,
      productId: selection.productId,
      role: selection.role,
      variantId: selection.variant.id,
      size: selection.variant.size,
      availableUnits,
      requiredUnits,
      available: selection.variant.active && enoughForRequest,
      reason: !selection.variant.active
        ? "variant_inactive"
        : enoughForRequest
          ? "available"
          : "insufficient_stock",
    };
  });

  const maxBundleQuantity = components.reduce(
    (current, component) =>
      Math.min(current, Math.floor(component.availableUnits / component.requiredUnits)),
    Number.POSITIVE_INFINITY,
  );
  const normalizedMaximum = Number.isFinite(maxBundleQuantity) ? maxBundleQuantity : 0;
  const unavailableComponentIds = components
    .filter((component) => !component.available)
    .map((component) => component.componentId);

  return {
    available: unavailableComponentIds.length === 0 && normalizedMaximum >= requestedQuantity,
    requestedQuantity,
    maxBundleQuantity: normalizedMaximum,
    components,
    unavailableComponentIds,
  };
}

export interface BundlePriceLine {
  componentId: string;
  unitPriceMinor: number;
  quantity?: number;
}

export type BundleDiscount =
  | { type: "PERCENTAGE"; value: number }
  | { type: "FIXED"; value: number };

export interface BundleTotals {
  subtotalMinor: number;
  discountMinor: number;
  savingsMinor: number;
  totalMinor: number;
  lineTotals: Array<{ componentId: string; totalMinor: number }>;
}

export function calculateBundleTotals(
  lines: readonly BundlePriceLine[],
  discount: BundleDiscount,
): BundleTotals {
  const lineTotals = lines.map((line) => {
    assertMinorUnits(line.unitPriceMinor, `unitPriceMinor:${line.componentId}`);
    const quantity = positiveInteger(line.quantity ?? 1, `quantity:${line.componentId}`);
    const totalMinor = line.unitPriceMinor * quantity;
    assertMinorUnits(totalMinor, `lineTotal:${line.componentId}`);
    return { componentId: line.componentId, totalMinor };
  });
  const subtotalMinor = lineTotals.reduce((sum, line) => sum + line.totalMinor, 0);
  assertMinorUnits(subtotalMinor, "subtotalMinor");

  let rawDiscountMinor: number;
  if (discount.type === "PERCENTAGE") {
    if (!Number.isSafeInteger(discount.value) || discount.value < 0 || discount.value > 10_000) {
      throw new RangeError("percentage discount value must be between 0 and 10000 basis points");
    }
    rawDiscountMinor = Math.round((subtotalMinor * discount.value) / 10_000);
  } else {
    assertMinorUnits(discount.value, "fixed discount value");
    rawDiscountMinor = discount.value;
  }

  const discountMinor = clampDiscount(rawDiscountMinor, subtotalMinor);
  return {
    subtotalMinor,
    discountMinor,
    savingsMinor: discountMinor,
    totalMinor: subtotalMinor - discountMinor,
    lineTotals,
  };
}
