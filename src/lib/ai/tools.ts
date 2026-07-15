import { zodResponsesFunction } from "openai/helpers/zod";
import type { FunctionTool } from "openai/resources/responses/responses";
import { z, type ZodType } from "zod";

import { defaultAIDataAdapter } from "@/lib/ai/adapters";
import { logAIEvent } from "@/lib/ai/logger";
import {
  AddToCartInputSchema,
  aiToolSchemas,
  BuildBundleInputSchema,
  CompareProductsInputSchema,
  CreateHandoffInputSchema,
  CreateWaitlistInputSchema,
  GetOrderStatusInputSchema,
  GetProductInputSchema,
  GetStockInputSchema,
  RecommendSizeInputSchema,
  SearchKnowledgeInputSchema,
} from "@/lib/ai/schemas";
import type {
  SizeRecommendation,
  SizeRecommendationInput,
  SizeRuleSet,
} from "@/lib/domain/size-engine";
import { recommendSize } from "@/lib/domain/size-engine";
import type {
  AILocale,
  AIToolName,
  ToolDataAdapter,
  ToolResult,
  ToolRuntimeContext,
} from "@/lib/ai/types";
import {
  AIDataUnavailableError,
  AIDataValidationError,
  AIToolTimeoutError,
} from "@/lib/ai/types";

const TOOL_TIMEOUT_MS = 5_000;

const descriptions: Record<AIToolName, string> = {
  get_product:
    "Return only a real, published QULTURE product and its published variants. Use before stating product details or price.",
  get_stock:
    "Return current backend stock for a published product/variant. Always use before claiming availability or incoming ETA.",
  recommend_size:
    "Run the deterministic QULTURE size engine. Never infer or calculate a size outside this tool. Null recommendation means no exact size may be stated.",
  compare_products:
    "Compare two or three published products using backend data only. Missing fields must remain missing.",
  build_bundle:
    "Validate a proposed set of published products, independently selected variants and sizes. Do not invent bundle discounts.",
  add_to_cart:
    "Validate cart items and return a confirmation intent only. This tool never mutates the cart; the user must confirm in the UI.",
  search_knowledge:
    "Search only published or approved QULTURE knowledge. Use for materials, technology, climate, delivery, returns and brand facts.",
  create_waitlist:
    "Create or deduplicate a waitlist lead. Service, restock and marketing consent are independent and must reflect the user's explicit choices.",
  create_handoff:
    "Create an idempotent ticket for a human QULTURE consultant when information is missing, confidence is low, an error occurs, or the user asks.",
  get_order_status:
    "Return a sanitized order status only after order number and matching email or phone authorize the lookup.",
};

function responseTool(name: AIToolName, schema: ZodType): FunctionTool {
  return zodResponsesFunction({
    name,
    description: descriptions[name],
    parameters: schema,
  }) as FunctionTool;
}

export const openAITools: FunctionTool[] = [
  responseTool("get_product", GetProductInputSchema),
  responseTool("get_stock", GetStockInputSchema),
  responseTool("recommend_size", RecommendSizeInputSchema),
  responseTool("compare_products", CompareProductsInputSchema),
  responseTool("build_bundle", BuildBundleInputSchema),
  responseTool("add_to_cart", AddToCartInputSchema),
  responseTool("search_knowledge", SearchKnowledgeInputSchema),
  responseTool("create_waitlist", CreateWaitlistInputSchema),
  responseTool("create_handoff", CreateHandoffInputSchema),
  responseTool("get_order_status", GetOrderStatusInputSchema),
];

export function isAIToolName(value: string): value is AIToolName {
  return Object.hasOwn(aiToolSchemas, value);
}

function localized(
  locale: AILocale,
  ru: string,
  kz: string,
): string {
  return locale === "kz" ? kz : ru;
}

function result<T>(
  tool: AIToolName | "unknown",
  context: ToolRuntimeContext,
  value: Omit<ToolResult<T>, "tool" | "correlationId">,
): ToolResult<T> {
  return {
    tool,
    correlationId: context.correlationId,
    ...value,
  };
}

function success<T>(
  tool: AIToolName,
  context: ToolRuntimeContext,
  data: T,
): ToolResult<T> {
  return result(tool, context, { status: "success", data, error: null });
}

function validationError(
  tool: AIToolName | "unknown",
  context: ToolRuntimeContext,
  message: string,
  issues?: Array<{ path: string; message: string }>,
): ToolResult {
  return result(tool, context, {
    status: "validation_error",
    data: null,
    error: { code: "invalid_tool_arguments", message, issues },
  });
}

function unavailable(
  tool: AIToolName,
  context: ToolRuntimeContext,
  code = "data_unavailable",
): ToolResult {
  return result(tool, context, {
    status: "unavailable",
    data: null,
    error: {
      code,
      message: localized(
        context.locale,
        "Подтверждённые данные сейчас недоступны. Предложите передачу вопроса команде.",
        "Расталған деректер қазір қолжетімсіз. Сұрақты командаға беруді ұсыныңыз.",
      ),
    },
  });
}

function timeoutResult(
  tool: AIToolName,
  context: ToolRuntimeContext,
): ToolResult {
  return result(tool, context, {
    status: "timeout",
    data: null,
    error: {
      code: "tool_timeout",
      message: localized(
        context.locale,
        "Проверка заняла слишком много времени. Предложите повторить или передать вопрос команде.",
        "Тексеру тым ұзаққа созылды. Қайталауды немесе сұрақты командаға беруді ұсыныңыз.",
      ),
    },
  });
}

function parseArguments(name: AIToolName, raw: string | unknown) {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return {
        success: false as const,
        issues: [{ path: "", message: "Arguments must be valid JSON." }],
      };
    }
  }

  const parsed = aiToolSchemas[name].safeParse(value);
  if (!parsed.success) {
    return {
      success: false as const,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return { success: true as const, data: parsed.data };
}

async function withTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new AIToolTimeoutError()), TOOL_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function mutationKey(
  provided: string | null,
  context: ToolRuntimeContext,
  tool: AIToolName,
): string {
  return (
    provided ??
    context.requestIdempotencyKey ??
    `${context.correlationId}:${tool}`
  );
}

function sizeInput(
  input: typeof RecommendSizeInputSchema._output,
  rules: SizeRuleSet | null,
): SizeRecommendationInput {
  const fitPreference =
    input.fitPreference === "slim"
      ? "CLOSE"
      : input.fitPreference === "regular"
        ? "REGULAR"
        : input.fitPreference === "relaxed" || input.fitPreference === "oversized"
          ? "RELAXED"
          : undefined;
  const layer =
    input.layer === "none"
      ? "NONE"
      : input.layer === "thin"
        ? "THIN"
        : input.layer === "mid"
          ? "MID"
          : input.layer === "heavy"
            ? "THICK"
            : undefined;

  return {
    productId: input.productId,
    fitProfile: input.fitProfile ?? undefined,
    heightCm: input.heightCm ?? undefined,
    weightKg: input.weightKg ?? undefined,
    usualSize: input.usualSize ?? undefined,
    chestCm: input.chestCm ?? undefined,
    waistCm: input.waistCm ?? undefined,
    hipsCm: input.hipsCm ?? undefined,
    fitPreference,
    layer,
    rules,
  };
}

const NumericRangeSchema = z
  .object({ min: z.number(), max: z.number() })
  .strict()
  .refine((range) => range.max >= range.min);
const SizeRuleSetSchema = z
  .object({
    version: z.string().min(1),
    status: z.literal("APPROVED"),
    garmentMeasurementsApproved: z.literal(true),
    sizes: z
      .array(
        z
          .object({
            size: z.string().min(1),
            ranges: z
              .object({
                heightCm: NumericRangeSchema.optional(),
                weightKg: NumericRangeSchema.optional(),
                chestCm: NumericRangeSchema.optional(),
                waistCm: NumericRangeSchema.optional(),
                hipsCm: NumericRangeSchema.optional(),
              })
              .strict(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type ToolExecutionDependencies = {
  adapter?: ToolDataAdapter;
  sizeRecommender?: (input: SizeRecommendationInput) => SizeRecommendation;
};

async function runValidatedTool(
  name: AIToolName,
  args: Record<string, unknown>,
  context: ToolRuntimeContext,
  adapter: ToolDataAdapter,
  sizeRecommender: (input: SizeRecommendationInput) => SizeRecommendation,
): Promise<ToolResult> {
  switch (name) {
    case "get_product": {
      const input = GetProductInputSchema.parse(args);
      if (!input.productId && !input.slug) {
        return validationError(
          name,
          context,
          "productId or slug is required.",
          [{ path: "productId", message: "productId or slug is required." }],
        );
      }
      const product = await adapter.getPublishedProduct({ ...input, locale: context.locale });
      return product ? success(name, context, { product }) : unavailable(name, context, "product_not_found");
    }

    case "get_stock": {
      const input = GetStockInputSchema.parse(args);
      const stock = await adapter.getPublishedStock({ ...input, locale: context.locale });
      return stock.length > 0
        ? success(name, context, { stock })
        : unavailable(name, context, "stock_not_found");
    }

    case "recommend_size": {
      const input = RecommendSizeInputSchema.parse(args);
      const bodyMeasurementsPresent =
        input.heightCm !== null ||
        input.weightKg !== null ||
        input.chestCm !== null ||
        input.waistCm !== null ||
        input.hipsCm !== null;
      if (
        bodyMeasurementsPresent &&
        (!input.measurementConsent || context.measurementConsent !== true)
      ) {
        return validationError(
          name,
          context,
          localized(
            context.locale,
            "Для использования параметров тела нужно отдельное согласие.",
            "Дене өлшемдерін пайдалану үшін бөлек келісім қажет.",
          ),
          [
            {
              path: "measurementConsent",
              message: "Explicit measurement consent is required.",
            },
          ],
        );
      }
      const rawRules = await adapter.getApprovedSizeRules(input.productId);
      const parsedRules = SizeRuleSetSchema.safeParse(rawRules);
      const rules: SizeRuleSet | null = parsedRules.success ? parsedRules.data : null;
      const recommendation = sizeRecommender(sizeInput(input, rules));
      return success(name, context, {
        recommendation,
        exactRecommendationAvailable: recommendation.recommendedSize !== null,
      });
    }

    case "compare_products": {
      const input = CompareProductsInputSchema.parse(args);
      const uniqueIds = [...new Set(input.productIds)];
      if (uniqueIds.length !== input.productIds.length) {
        return validationError(name, context, "Product IDs must be distinct.");
      }
      const products = await Promise.all(
        uniqueIds.map((productId) =>
          adapter.getPublishedProduct({
            productId,
            slug: null,
            locale: context.locale,
          }),
        ),
      );
      const missingProductIds = uniqueIds.filter((_id, index) => products[index] === null);
      return success(name, context, {
        products: products.filter((product) => product !== null),
        missingProductIds,
      });
    }

    case "build_bundle": {
      const input = BuildBundleInputSchema.parse(args);
      const selections = await Promise.all(
        input.items.map(async (item) => {
          const product = await adapter.getPublishedProduct({
            productId: item.productId,
            slug: null,
            locale: context.locale,
          });
          if (!product) {
            return {
              productId: item.productId,
              variantId: item.variantId,
              size: item.size,
              valid: false,
              available: false,
              price: null,
            };
          }
          const stock = await adapter.getPublishedStock({
            productId: item.productId,
            variantId: item.variantId,
            color: null,
            size: item.size,
            locale: context.locale,
          });
          const candidates = product.variants.filter(
            (variant) => item.size === null || variant.size === item.size,
          );
          const selectedVariant = item.variantId
            ? product.variants.find((variant) => variant.id === item.variantId)
            : candidates.length === 1
              ? candidates[0]
              : undefined;
          return {
            productId: item.productId,
            productName: product.name,
            variantId: selectedVariant?.id ?? item.variantId,
            size: selectedVariant?.size ?? item.size,
            valid: selectedVariant !== undefined,
            available: stock.some((stockItem) => stockItem.available),
            price: selectedVariant?.price ?? product.price,
          };
        }),
      );
      const amounts = selections.map((selection) => selection.price?.amountMinor);
      const currencies = new Set(
        selections
          .map((selection) => selection.price?.currency)
          .filter((currency): currency is string => currency !== undefined),
      );
      const canTotal =
        amounts.every((amount): amount is number => typeof amount === "number") &&
        currencies.size === 1;
      return success(name, context, {
        selections,
        bundleAvailable: selections.every(
          (selection) => selection.valid && selection.available,
        ),
        pricing: canTotal
          ? {
              subtotalMinor: amounts.reduce((sum, amount) => sum + amount, 0),
              currency: [...currencies][0],
              discount: null,
            }
          : null,
      });
    }

    case "add_to_cart": {
      const input = AddToCartInputSchema.parse(args);
      const availability = await Promise.all(
        input.items.map(async (item) => {
          const stock = await adapter.getPublishedStock({
            productId: item.productId,
            variantId: item.variantId,
            color: null,
            size: null,
            locale: context.locale,
          });
          return stock.some(
            (stockItem) =>
              stockItem.variantId === item.variantId &&
              stockItem.availableQuantity >= item.quantity,
          );
        }),
      );
      if (availability.some((available) => !available)) {
        return validationError(
          name,
          context,
          localized(
            context.locale,
            "Один или несколько вариантов недоступны в выбранном количестве.",
            "Бір немесе бірнеше нұсқа таңдалған мөлшерде қолжетімсіз.",
          ),
        );
      }
      return success(name, context, {
        intentId: mutationKey(input.idempotencyKey, context, name),
        items: input.items,
        requiresConfirmation: true,
        cartMutated: false,
      });
    }

    case "search_knowledge": {
      const input = SearchKnowledgeInputSchema.parse(args);
      const items = await adapter.searchPublishedKnowledge({
        ...input,
        locale: context.locale,
      });
      return success(name, context, {
        items,
        confirmedInformationFound: items.length > 0,
      });
    }

    case "create_waitlist": {
      const input = CreateWaitlistInputSchema.parse(args);
      const data = await adapter.createWaitlistLead({
        ...input,
        locale: context.locale,
        source: "ai",
        idempotencyKey: mutationKey(input.idempotencyKey, context, name),
      });
      return success(name, context, data);
    }

    case "create_handoff": {
      const input = CreateHandoffInputSchema.parse(args);
      const data = await adapter.createHandoffTicket({
        ...input,
        conversationId: input.conversationId ?? context.conversationId ?? null,
        idempotencyKey: mutationKey(input.idempotencyKey, context, name),
        measurementConsent: context.measurementConsent === true,
        contactConsent: context.contactConsent === true,
        policyVersion: context.policyVersion,
      });
      return success(name, context, data);
    }

    case "get_order_status": {
      const input = GetOrderStatusInputSchema.parse(args);
      if (!input.email && !input.phone) {
        return result(name, context, {
          status: "unauthorized",
          data: null,
          error: {
            code: "order_verification_required",
            message: localized(
              context.locale,
              "Для проверки заказа нужны номер заказа и совпадающий email или телефон.",
              "Тапсырысты тексеру үшін тапсырыс нөмірі және сәйкес email немесе телефон қажет.",
            ),
          },
        });
      }
      const lookup = await adapter.getAuthorizedOrderStatus(input);
      if (!lookup.authorized) {
        return result(name, context, {
          status: lookup.found ? "unauthorized" : "unavailable",
          data: null,
          error: {
            code: lookup.found ? "order_verification_failed" : "order_not_found",
            message: localized(
              context.locale,
              "Заказ не найден или контакт не совпадает.",
              "Тапсырыс табылмады немесе байланыс дерегі сәйкес емес.",
            ),
          },
        });
      }
      return success(name, context, { order: lookup.order });
    }
  }
}

export async function executeAITool(
  name: string,
  rawArguments: string | unknown,
  context: ToolRuntimeContext,
  dependencies: ToolExecutionDependencies = {},
): Promise<ToolResult> {
  if (!isAIToolName(name)) {
    return validationError(
      "unknown",
      context,
      "Unknown tool name.",
      [{ path: "tool", message: "Unknown tool name." }],
    );
  }

  const startedAt = Date.now();
  const parsed = parseArguments(name, rawArguments);
  if (!parsed.success) {
    const failed = validationError(
      name,
      context,
      localized(
        context.locale,
        "Параметры инструмента не прошли проверку.",
        "Құрал параметрлері тексеруден өтпеді.",
      ),
      parsed.issues,
    );
    logAIEvent("warn", {
      event: "tool_complete",
      correlationId: context.correlationId,
      tool: name,
      status: failed.status,
      durationMs: Date.now() - startedAt,
    });
    return failed;
  }

  let completed: ToolResult;
  try {
    completed = await withTimeout(
      runValidatedTool(
        name,
        parsed.data as Record<string, unknown>,
        context,
        dependencies.adapter ?? defaultAIDataAdapter,
        dependencies.sizeRecommender ?? recommendSize,
      ),
    );
  } catch (error) {
    if (error instanceof AIToolTimeoutError) {
      completed = timeoutResult(name, context);
    } else if (error instanceof AIDataValidationError) {
      completed = validationError(
        name,
        context,
        localized(
          context.locale,
          "Указанные данные не прошли проверку.",
          "Көрсетілген деректер тексеруден өтпеді.",
        ),
      );
    } else if (error instanceof AIDataUnavailableError) {
      completed = unavailable(name, context);
    } else {
      completed = unavailable(name, context);
    }
  }

  logAIEvent(completed.status === "success" ? "info" : "warn", {
    event: "tool_complete",
    correlationId: context.correlationId,
    tool: name,
    status: completed.status,
    durationMs: Date.now() - startedAt,
  });
  return completed;
}
