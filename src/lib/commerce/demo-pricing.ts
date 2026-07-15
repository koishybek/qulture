import { calculateCartTotals } from "@/lib/domain/cart";

export type DemoPriceLineInput = {
  variantId: string;
  quantity: number;
  bundleGroupId?: string;
};

export type DemoPriceVariant = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  sku: string;
  color: string;
  size: string;
  available: number;
  unitPriceMinor: number;
};

export type DemoBundleDefinition = {
  id: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  components: Array<{ productId: string; role: string }>;
};

export type PricedDemoLine = DemoPriceVariant & {
  quantity: number;
  discountMinor: number;
  totalMinor: number;
  bundleId?: string;
  bundleGroupId?: string;
  componentRole?: string;
};

export type PricedDemoOrder = {
  lines: PricedDemoLine[];
  subtotalMinor: number;
  discountMinor: number;
  deliveryMinor: number;
  totalMinor: number;
};

export class DemoOrderValidationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "VARIANT_UNAVAILABLE"
      | "INSUFFICIENT_STOCK"
      | "INVALID_PRICE",
  ) {
    super(message);
    this.name = "DemoOrderValidationError";
  }
}

function allocateDiscount(
  lines: Array<{ index: number; subtotalMinor: number }>,
  totalDiscount: number,
): Map<number, number> {
  const allocations = new Map<number, number>();
  const groupSubtotal = lines.reduce((sum, line) => sum + line.subtotalMinor, 0);
  let allocated = 0;

  lines.forEach((line, position) => {
    const isLast = position === lines.length - 1;
    const discount = isLast
      ? totalDiscount - allocated
      : Math.round((totalDiscount * line.subtotalMinor) / groupSubtotal);
    allocations.set(line.index, discount);
    allocated += discount;
  });

  return allocations;
}

function findMatchingBundle(
  group: Array<{ productId: string; quantity: number }>,
  bundles: readonly DemoBundleDefinition[],
): DemoBundleDefinition | undefined {
  const groupProductIds = new Set(group.map((line) => line.productId));
  const quantities = new Set(group.map((line) => line.quantity));
  if (quantities.size !== 1) return undefined;

  return bundles.find((bundle) => {
    const componentIds = new Set(bundle.components.map((item) => item.productId));
    return (
      componentIds.size === groupProductIds.size &&
      [...componentIds].every((id) => groupProductIds.has(id))
    );
  });
}

export function priceDemoOrder(
  inputs: readonly DemoPriceLineInput[],
  variants: readonly DemoPriceVariant[],
  bundles: readonly DemoBundleDefinition[],
): PricedDemoOrder {
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const requestedByVariant = new Map<string, number>();

  const draftLines = inputs.map((input) => {
    const variant = variantsById.get(input.variantId);
    if (!variant) {
      throw new DemoOrderValidationError(
        `Demo variant is unavailable: ${input.variantId}`,
        "VARIANT_UNAVAILABLE",
      );
    }
    if (!Number.isSafeInteger(variant.unitPriceMinor) || variant.unitPriceMinor < 0) {
      throw new DemoOrderValidationError(
        `Demo variant has no valid price: ${input.variantId}`,
        "INVALID_PRICE",
      );
    }
    const requested = (requestedByVariant.get(variant.id) ?? 0) + input.quantity;
    requestedByVariant.set(variant.id, requested);
    if (requested > variant.available) {
      throw new DemoOrderValidationError(
        `Insufficient demo stock: ${variant.id}`,
        "INSUFFICIENT_STOCK",
      );
    }

    return {
      ...variant,
      quantity: input.quantity,
      bundleGroupId: input.bundleGroupId,
      discountMinor: 0,
      totalMinor: variant.unitPriceMinor * input.quantity,
      bundleId: undefined as string | undefined,
      componentRole: undefined as string | undefined,
    };
  });

  const groups = new Map<string, number[]>();
  draftLines.forEach((line, index) => {
    if (!line.bundleGroupId) return;
    groups.set(line.bundleGroupId, [
      ...(groups.get(line.bundleGroupId) ?? []),
      index,
    ]);
  });

  for (const indexes of groups.values()) {
    const groupLines = indexes.map((index) => draftLines[index]);
    const bundle = findMatchingBundle(groupLines, bundles);
    if (!bundle) continue;

    const groupSubtotal = groupLines.reduce(
      (sum, line) => sum + line.unitPriceMinor * line.quantity,
      0,
    );
    const quantity = groupLines[0]?.quantity ?? 1;
    const requestedDiscount =
      bundle.discountType === "PERCENTAGE"
        ? Math.round((groupSubtotal * bundle.discountValue) / 10_000)
        : bundle.discountValue * quantity;
    const totalDiscount = Math.min(groupSubtotal, requestedDiscount);
    const allocations = allocateDiscount(
      indexes.map((index) => ({
        index,
        subtotalMinor: draftLines[index].unitPriceMinor * draftLines[index].quantity,
      })),
      totalDiscount,
    );

    for (const index of indexes) {
      const line = draftLines[index];
      const component = bundle.components.find(
        (item) => item.productId === line.productId,
      );
      line.bundleId = bundle.id;
      line.componentRole = component?.role;
      line.discountMinor = allocations.get(index) ?? 0;
      line.totalMinor = line.unitPriceMinor * line.quantity - line.discountMinor;
    }
  }

  const totals = calculateCartTotals(
    draftLines.map((line, index) => ({
      id: String(index),
      unitPriceMinor: line.unitPriceMinor,
      quantity: line.quantity,
      discountMinor: line.discountMinor,
    })),
  );

  return {
    lines: draftLines,
    subtotalMinor: totals.subtotalMinor,
    discountMinor: totals.discountMinor,
    deliveryMinor: totals.deliveryMinor,
    totalMinor: totals.totalMinor,
  };
}

