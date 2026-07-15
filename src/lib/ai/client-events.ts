import type { ConfirmCartItem } from "@/lib/ai/client-actions";

export const AI_OPEN_EVENT = "qulture:open-ai";
export const AI_CONTEXT_EVENT = "qulture:ai-context";

export type AIProductContext = {
  registrationId: string;
  productId: string;
  productSlug?: string;
  selectedVariantId?: string;
  selectedColor?: string;
  selectedSize?: string;
  onConfirmAddToCart?: (
    items: ConfirmCartItem[],
  ) => boolean | Promise<boolean>;
};

export type AIOpenDetail = {
  entryPoint?: string;
  prompt?: string;
  productId?: string;
  productSlug?: string;
  selectedVariantId?: string;
  selectedColor?: string;
  selectedSize?: string;
};

export type AIContextEventDetail =
  | { type: "register"; context: AIProductContext }
  | { type: "clear"; registrationId: string };

let currentProductContext: AIProductContext | null = null;

export function getCurrentAIProductContext(): AIProductContext | null {
  return currentProductContext;
}

export function registerAIProductContext(context: AIProductContext): () => void {
  currentProductContext = context;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<AIContextEventDetail>(AI_CONTEXT_EVENT, {
        detail: { type: "register", context },
      }),
    );
  }

  return () => {
    if (currentProductContext?.registrationId !== context.registrationId) return;
    currentProductContext = null;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<AIContextEventDetail>(AI_CONTEXT_EVENT, {
          detail: { type: "clear", registrationId: context.registrationId },
        }),
      );
    }
  };
}

export function openAIAssistant(detail: AIOpenDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AIOpenDetail>(AI_OPEN_EVENT, { detail }));
}
