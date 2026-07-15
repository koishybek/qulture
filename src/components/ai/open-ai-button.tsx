"use client";

import { ArrowIcon } from "@/components/ui/icons";
import { openAIAssistant } from "@/lib/ai/client-events";

type OpenAIButtonProps = {
  children: React.ReactNode;
  className?: string;
  entryPoint?: string;
  prompt?: string;
  productId?: string;
  productSlug?: string;
  selectedVariantId?: string;
  selectedColor?: string;
  selectedSize?: string;
};

export function OpenAIButton({
  children,
  className = "q-button",
  entryPoint = "site",
  prompt,
  productId,
  productSlug,
  selectedVariantId,
  selectedColor,
  selectedSize,
}: OpenAIButtonProps) {
  return (
    <button
      className={className}
      type="button"
      onClick={() => openAIAssistant({
        entryPoint,
        prompt,
        productId,
        productSlug,
        selectedVariantId,
        selectedColor,
        selectedSize,
      })}
    >
      {children} <ArrowIcon />
    </button>
  );
}
