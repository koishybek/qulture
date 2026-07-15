import type { AIAction } from "@/lib/ai/schemas";
import type { AILocale } from "@/lib/ai/types";

export type ConfirmCartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type ResolvedAIAction =
  | { type: "prompt"; prompt: string }
  | { type: "navigate"; href: string }
  | { type: "handoff" }
  | { type: "confirm_cart"; items: ConfirmCartItem[] }
  | { type: "invalid" };

const IDENTIFIER_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parsedObject(value: string): Record<string, unknown> | null {
  try {
    return record(JSON.parse(value));
  } catch {
    return null;
  }
}

function productSlug(value: string, locale: AILocale): string | null {
  const trimmed = value.trim();
  const parsed = parsedObject(trimmed);
  const candidate = typeof parsed?.slug === "string" ? parsed.slug.trim() : trimmed;
  if (SLUG_PATTERN.test(candidate)) return candidate;

  const prefix = `/${locale}/product/`;
  if (!candidate.startsWith(prefix)) return null;
  const pathSlug = candidate.slice(prefix.length);
  return SLUG_PATTERN.test(pathSlug) ? pathSlug : null;
}

function cartItems(value: string): ConfirmCartItem[] | null {
  const parsed = parsedObject(value);
  if (!parsed || !Array.isArray(parsed.items) || parsed.items.length < 1 || parsed.items.length > 8) {
    return null;
  }

  const items: ConfirmCartItem[] = [];
  const variants = new Set<string>();
  for (const rawItem of parsed.items) {
    const item = record(rawItem);
    if (
      !item ||
      typeof item.productId !== "string" ||
      !IDENTIFIER_PATTERN.test(item.productId) ||
      typeof item.variantId !== "string" ||
      !IDENTIFIER_PATTERN.test(item.variantId) ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
    ) {
      return null;
    }
    const identity = `${item.productId}:${item.variantId}`;
    if (variants.has(identity)) return null;
    variants.add(identity);
    items.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    });
  }
  return items;
}

/**
 * Converts model-provided actions into a small allowlisted client command set.
 * No arbitrary URL or JavaScript value can cross this boundary.
 */
export function resolveAIAction(
  action: AIAction,
  locale: AILocale,
): ResolvedAIAction {
  switch (action.kind) {
    case "ask":
      return action.value.trim()
        ? { type: "prompt", prompt: action.value.trim() }
        : { type: "invalid" };
    case "open_product": {
      const slug = productSlug(action.value, locale);
      return slug
        ? { type: "navigate", href: `/${locale}/product/${encodeURIComponent(slug)}` }
        : { type: "invalid" };
    }
    case "open_waitlist":
      return { type: "navigate", href: `/${locale}/waitlist` };
    case "open_handoff":
      return { type: "handoff" };
    case "confirm_add_to_cart": {
      const items = cartItems(action.value);
      return items ? { type: "confirm_cart", items } : { type: "invalid" };
    }
    case "check_order":
      // Order number/contact values from model output are deliberately ignored.
      // The dedicated form performs its own proof check.
      return { type: "navigate", href: `/${locale}/order-status` };
  }
}
