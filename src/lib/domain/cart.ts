import { assertMinorUnits, clampDiscount } from "./money";

export interface CartPriceLine {
  id: string;
  unitPriceMinor: number;
  quantity: number;
  /** Total discount for this line, not per unit. */
  discountMinor?: number;
}

export interface CartTotalsOptions {
  deliveryMinor?: number;
  cartDiscountMinor?: number;
}

export interface CartTotals {
  subtotalMinor: number;
  itemDiscountMinor: number;
  cartDiscountMinor: number;
  discountMinor: number;
  deliveryMinor: number;
  totalMinor: number;
  lines: Array<{
    id: string;
    subtotalMinor: number;
    discountMinor: number;
    totalMinor: number;
  }>;
}

export function calculateCartTotals(
  inputLines: readonly CartPriceLine[],
  options: CartTotalsOptions = {},
): CartTotals {
  const lines = inputLines.map((line) => {
    assertMinorUnits(line.unitPriceMinor, `unitPriceMinor:${line.id}`);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new RangeError(`quantity:${line.id} must be a positive safe integer`);
    }

    const subtotalMinor = line.unitPriceMinor * line.quantity;
    assertMinorUnits(subtotalMinor, `subtotalMinor:${line.id}`);
    const discountMinor = clampDiscount(line.discountMinor ?? 0, subtotalMinor);
    return {
      id: line.id,
      subtotalMinor,
      discountMinor,
      totalMinor: subtotalMinor - discountMinor,
    };
  });

  const subtotalMinor = lines.reduce((sum, line) => sum + line.subtotalMinor, 0);
  const itemDiscountMinor = lines.reduce((sum, line) => sum + line.discountMinor, 0);
  const subtotalAfterItems = subtotalMinor - itemDiscountMinor;
  const cartDiscountMinor = clampDiscount(
    options.cartDiscountMinor ?? 0,
    subtotalAfterItems,
  );
  const deliveryMinor = options.deliveryMinor ?? 0;
  assertMinorUnits(deliveryMinor, "deliveryMinor");

  return {
    subtotalMinor,
    itemDiscountMinor,
    cartDiscountMinor,
    discountMinor: itemDiscountMinor + cartDiscountMinor,
    deliveryMinor,
    totalMinor: subtotalAfterItems - cartDiscountMinor + deliveryMinor,
    lines,
  };
}
