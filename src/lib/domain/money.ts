export function assertMinorUnits(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative safe integer`);
  }
}

export function clampDiscount(discountMinor: number, subtotalMinor: number): number {
  assertMinorUnits(discountMinor, "discountMinor");
  assertMinorUnits(subtotalMinor, "subtotalMinor");
  return Math.min(discountMinor, subtotalMinor);
}
