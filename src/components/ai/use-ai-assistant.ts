"use client";

import { useCallback, useEffect, useId } from "react";

import {
  openAIAssistant,
  registerAIProductContext,
  type AIOpenDetail,
  type AIProductContext,
} from "@/lib/ai/client-events";

type RegisteredProductContext = Omit<AIProductContext, "registrationId">;

/** Registers only non-PII product/variant state for the global AI panel. */
export function useAIProductContext(context: RegisteredProductContext): void {
  const reactId = useId();
  const {
    onConfirmAddToCart,
    productId,
    productSlug,
    selectedColor,
    selectedSize,
    selectedVariantId,
  } = context;
  useEffect(
    () =>
      registerAIProductContext({
        onConfirmAddToCart,
        productId,
        productSlug,
        selectedColor,
        selectedSize,
        selectedVariantId,
        registrationId: `ai-product-${reactId}`,
      }),
    [
      onConfirmAddToCart,
      productId,
      productSlug,
      reactId,
      selectedColor,
      selectedSize,
      selectedVariantId,
    ],
  );
}

export function useOpenAIAssistant(defaults: AIOpenDetail = {}) {
  const {
    entryPoint,
    productId,
    productSlug,
    prompt,
    selectedColor,
    selectedSize,
    selectedVariantId,
  } = defaults;
  return useCallback(
    (overrides: AIOpenDetail = {}) =>
      openAIAssistant({
        entryPoint,
        productId,
        productSlug,
        prompt,
        selectedColor,
        selectedSize,
        selectedVariantId,
        ...overrides,
      }),
    [
      entryPoint,
      productId,
      productSlug,
      prompt,
      selectedColor,
      selectedSize,
      selectedVariantId,
    ],
  );
}
