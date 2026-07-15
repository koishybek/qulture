import { db } from "@/lib/db";

export type WaitlistCatalogContextInput = {
  productId?: string;
  variantId?: string;
  color?: string;
  size?: string;
};

export type WaitlistVariantCandidate = {
  id: string;
  colorCode: string;
  colorNameRu: string;
  colorNameKz: string;
  sizeLabel: string;
};

export class InvalidWaitlistContextError extends Error {
  constructor() {
    super("Invalid or ambiguous public catalog context");
    this.name = "InvalidWaitlistContextError";
  }
}

function normalized(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase("ru-RU") ?? "";
}

function matchesColor(candidate: WaitlistVariantCandidate, color: string): boolean {
  const target = normalized(color);
  return [candidate.colorCode, candidate.colorNameRu, candidate.colorNameKz]
    .some((value) => normalized(value) === target);
}

export function selectVerifiedWaitlistVariant(
  candidates: readonly WaitlistVariantCandidate[],
  input: Pick<WaitlistCatalogContextInput, "variantId" | "color" | "size">,
): WaitlistVariantCandidate | null {
  if (input.variantId) {
    const candidate = candidates.find((item) => item.id === input.variantId);
    if (!candidate) throw new InvalidWaitlistContextError();
    if (input.color && !matchesColor(candidate, input.color)) throw new InvalidWaitlistContextError();
    if (input.size && normalized(candidate.sizeLabel) !== normalized(input.size)) throw new InvalidWaitlistContextError();
    return candidate;
  }

  if (!input.color && !input.size) return null;
  const matches = candidates.filter((candidate) => (
    (!input.color || matchesColor(candidate, input.color)) &&
    (!input.size || normalized(candidate.sizeLabel) === normalized(input.size))
  ));
  if (matches.length !== 1) throw new InvalidWaitlistContextError();
  return matches[0] ?? null;
}

export async function verifyWaitlistCatalogContext(input: WaitlistCatalogContextInput) {
  const hasContext = Boolean(input.productId || input.variantId || input.color || input.size);
  if (!hasContext) return { productId: undefined, variantId: undefined, color: undefined, size: undefined };
  if (!input.productId) throw new InvalidWaitlistContextError();

  const product = await db.product.findFirst({
    where: { id: input.productId, status: "ACTIVE", isDemo: false },
    select: {
      id: true,
      variants: {
        where: { active: true, isDemo: false },
        select: { id: true, colorCode: true, colorNameRu: true, colorNameKz: true, sizeLabel: true },
      },
    },
  });
  if (!product) throw new InvalidWaitlistContextError();

  const variant = selectVerifiedWaitlistVariant(product.variants, input);
  return {
    productId: product.id,
    variantId: variant?.id,
    color: variant?.colorCode,
    size: variant?.sizeLabel,
  };
}
