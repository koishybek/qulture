import { z } from "zod";

import { AI_TOOL_NAMES, TOOL_STATUSES } from "@/lib/ai/types";

const nullableShortText = z.string().trim().min(1).max(160).nullable();
const nullableIdentifier = z.string().trim().min(1).max(128).nullable();
// Keep this pattern intentionally simple: Responses API strict tool schemas do
// not accept the lookarounds emitted by Zod's built-in HTML5 email pattern.
// The deterministic adapter validates the value again before persistence.
const nullableEmail = z
  .string()
  .trim()
  .max(254)
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  .nullable();
const nullablePhone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,24}$/)
  .nullable();
const localeSchema = z.enum(["ru", "kz", "kk"]).transform((locale) =>
  locale === "kk" ? "kz" : locale,
);

export const ToolStatusSchema = z.enum(TOOL_STATUSES);
export const AIToolNameSchema = z.enum(AI_TOOL_NAMES);

export const GetProductInputSchema = z
  .object({
    productId: nullableIdentifier.describe("Published product ID, or null."),
    slug: nullableIdentifier.describe("Published product slug, or null."),
  })
  .strict();

export const GetStockInputSchema = z
  .object({
    productId: z.string().trim().min(1).max(128),
    variantId: nullableIdentifier,
    color: nullableShortText,
    size: nullableShortText,
  })
  .strict();

export const RecommendSizeInputSchema = z
  .object({
    productId: z.string().trim().min(1).max(128),
    fitProfile: nullableShortText,
    heightCm: z.number().min(90).max(240).nullable(),
    weightKg: z.number().min(25).max(300).nullable(),
    usualSize: nullableShortText,
    chestCm: z.number().min(45).max(220).nullable(),
    waistCm: z.number().min(40).max(220).nullable(),
    hipsCm: z.number().min(45).max(240).nullable(),
    fitPreference: z.enum(["slim", "regular", "relaxed", "oversized"]).nullable(),
    layer: z.enum(["none", "thin", "mid", "heavy"]).nullable(),
    measurementConsent: z.boolean().describe(
      "True only when the user explicitly consented to using body measurements for this request.",
    ),
  })
  .strict();

export const CompareProductsInputSchema = z
  .object({
    productIds: z.array(z.string().trim().min(1).max(128)).min(2).max(3),
  })
  .strict();

export const BundleItemInputSchema = z
  .object({
    productId: z.string().trim().min(1).max(128),
    variantId: nullableIdentifier,
    size: nullableShortText,
  })
  .strict();

export const BuildBundleInputSchema = z
  .object({ items: z.array(BundleItemInputSchema).min(1).max(4) })
  .strict();

export const AddToCartInputSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().trim().min(1).max(128),
            variantId: z.string().trim().min(1).max(128),
            quantity: z.number().int().min(1).max(10),
          })
          .strict(),
      )
      .min(1)
      .max(8),
    idempotencyKey: z.string().trim().min(8).max(128).nullable(),
  })
  .strict();

export const SearchKnowledgeInputSchema = z
  .object({
    query: z.string().trim().min(2).max(300),
    productId: nullableIdentifier,
    scope: nullableShortText,
    limit: z.number().int().min(1).max(5),
  })
  .strict();

export const CreateWaitlistInputSchema = z
  .object({
    productId: nullableIdentifier,
    variantId: nullableIdentifier,
    color: nullableShortText,
    size: nullableShortText,
    city: nullableShortText,
    name: z.string().trim().min(1).max(160),
    email: nullableEmail,
    phone: nullablePhone,
    contactPurpose: z.enum(["launch", "restock", "product_question", "size_help"]),
    serviceConsent: z.boolean(),
    restockConsent: z.boolean(),
    marketingConsent: z.boolean(),
    source: z.string().trim().min(1).max(80),
    idempotencyKey: z.string().trim().min(8).max(128).nullable(),
  })
  .strict()
  .refine((value) => value.email !== null || value.phone !== null, {
    message: "Email or phone is required.",
    path: ["email"],
  })
  .refine((value) => value.serviceConsent, {
    message: "Service consent is required.",
    path: ["serviceConsent"],
  });

export const CreateHandoffInputSchema = z
  .object({
    conversationId: nullableIdentifier,
    reason: z.enum([
      "missing_information",
      "low_confidence",
      "product_question",
      "size_help",
      "order_help",
      "user_request",
      "technical_error",
    ]),
    userQuestion: z.string().trim().min(2).max(2_000),
    productId: nullableIdentifier,
    selectedVariantId: nullableIdentifier,
    aiConfidence: z.enum(["high", "medium", "low"]).nullable(),
    summary: z.string().trim().min(1).max(1_000).nullable(),
    contactName: nullableShortText,
    contactEmail: nullableEmail,
    contactPhone: nullablePhone,
    idempotencyKey: z.string().trim().min(8).max(128).nullable(),
  })
  .strict();

export const GetOrderStatusInputSchema = z
  .object({
    orderNumber: z.string().trim().min(3).max(80),
    email: nullableEmail,
    phone: nullablePhone,
  })
  .strict();

export const aiToolSchemas = {
  get_product: GetProductInputSchema,
  get_stock: GetStockInputSchema,
  recommend_size: RecommendSizeInputSchema,
  compare_products: CompareProductsInputSchema,
  build_bundle: BuildBundleInputSchema,
  add_to_cart: AddToCartInputSchema,
  search_knowledge: SearchKnowledgeInputSchema,
  create_waitlist: CreateWaitlistInputSchema,
  create_handoff: CreateHandoffInputSchema,
  get_order_status: GetOrderStatusInputSchema,
} as const;

export const AIActionSchema = z
  .object({
    kind: z.enum([
      "ask",
      "open_product",
      "open_waitlist",
      "open_handoff",
      "confirm_add_to_cart",
      "check_order",
    ]),
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(300),
  })
  .strict();

export const AIAssistantOutputSchema = z
  .object({
    answer: z.string().trim().min(1).max(2_000),
    actions: z.array(AIActionSchema).min(1).max(3),
  })
  .strict();

export const AICartContextItemSchema = z
  .object({
    productId: z.string().trim().min(1).max(128),
    variantId: z.string().trim().min(1).max(128).nullable().optional(),
    quantity: z.number().int().min(1).max(10),
  })
  .strict();

export const AIRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2_000),
    conversationId: z.string().uuid().nullable().optional(),
    locale: localeSchema.default("ru"),
    context: z
      .object({
        currentPage: z.string().trim().max(300).nullable().optional(),
        productId: z.string().trim().max(128).nullable().optional(),
        selectedVariantId: z.string().trim().max(128).nullable().optional(),
        selectedColor: z.string().trim().max(160).nullable().optional(),
        selectedSize: z.string().trim().max(80).nullable().optional(),
        cart: z.array(AICartContextItemSchema).max(30).optional(),
        entryPoint: z.string().trim().max(80).nullable().optional(),
        sessionId: z.string().trim().min(1).max(128).nullable().optional(),
        measurementConsent: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const HandoffRequestSchema = CreateHandoffInputSchema.omit({
  conversationId: true,
  idempotencyKey: true,
}).extend({
  conversationId: z.string().uuid().nullable().optional(),
  idempotencyKey: z.string().trim().min(8).max(128).nullable().optional(),
  locale: localeSchema.optional(),
  measurementConsent: z.boolean().optional(),
  contactConsent: z.literal(true, { error: "Contact consent is required." }),
  policyVersion: z.string().trim().min(1).max(80),
}).refine((value) => value.contactEmail !== null || value.contactPhone !== null, {
  message: "Email or phone is required.",
  path: ["contactEmail"],
});

export type AIRequest = z.infer<typeof AIRequestSchema>;
export type AIAssistantOutput = z.infer<typeof AIAssistantOutputSchema>;
export type AIAction = z.infer<typeof AIActionSchema>;
export type HandoffRequest = z.infer<typeof HandoffRequestSchema>;
