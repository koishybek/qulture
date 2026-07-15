import OpenAI, { APIConnectionTimeoutError } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResponseInput } from "openai/resources/responses/responses";
import { randomUUID } from "node:crypto";

import {
  loadConversationHistory,
  persistConversationMessage,
  resolveConversationId,
} from "@/lib/ai/adapters";
import { logAIEvent } from "@/lib/ai/logger";
import {
  HANDOFF_ACTIONS,
  UNAVAILABLE_MESSAGES,
  buildSystemPrompt,
} from "@/lib/ai/prompt";
import {
  AIAssistantOutputSchema,
  type AIAction,
  type AIRequest,
} from "@/lib/ai/schemas";
import { executeAITool, openAITools } from "@/lib/ai/tools";
import type { AILocale, ToolRuntimeContext, ToolStatus } from "@/lib/ai/types";

const DEFAULT_OPENAI_MODEL = "gpt-5.6-luna";
const MAX_TOOL_ROUNDS = 4;
const MAX_RESPONSE_ROUNDS = MAX_TOOL_ROUNDS + 1;
const MAX_TOTAL_TOOL_CALLS = 10;
const MAX_CALLS_PER_ROUND = 6;

type ProviderOutputItem = Record<string, unknown> & { type: string };

export type AIProviderResponse = {
  id: string;
  output: ProviderOutputItem[];
  outputText: string;
  outputParsed: unknown;
  requestId?: string;
};

export type AIProviderRequest = {
  model: string;
  instructions: string;
  input: unknown[];
  tools: typeof openAITools;
  maxOutputTokens: number;
};

export type AIProvider = {
  createResponse(request: AIProviderRequest): Promise<AIProviderResponse>;
};

export type OpenAIConfig = {
  enabled: boolean;
  apiKey: string | null;
  model: string;
};

export type AIServiceResult = {
  status: ToolStatus;
  correlationId: string;
  conversationId: string;
  message: string;
  actions: AIAction[];
};

type ServiceOptions = {
  correlationId: string;
  idempotencyKey?: string;
  env?: Record<string, string | undefined>;
  provider?: AIProvider;
  persistence?: boolean;
};

export function resolveOpenAIConfig(
  env: Record<string, string | undefined> = process.env,
): OpenAIConfig {
  const preferred = env.OPENAI_KEY?.trim();
  const fallback = env.OPENAI_API_KEY?.trim();
  const apiKey = preferred || fallback || null;
  return {
    enabled: apiKey !== null,
    apiKey,
    model: env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
  };
}

function createOpenAIProvider(apiKey: string): AIProvider {
  const client = new OpenAI({
    apiKey,
    maxRetries: 1,
    timeout: 15_000,
  });
  const format = zodTextFormat(AIAssistantOutputSchema, "qulture_ai_reply");

  return {
    async createResponse(request) {
      const response = await client.responses.parse({
        model: request.model,
        instructions: request.instructions,
        input: request.input as ResponseInput,
        tools: request.tools,
        parallel_tool_calls: false,
        store: false,
        include: ["reasoning.encrypted_content"],
        max_output_tokens: request.maxOutputTokens,
        text: { format },
      });

      return {
        id: response.id,
        output: response.output as unknown as ProviderOutputItem[],
        outputText: response.output_text,
        outputParsed: response.output_parsed,
        requestId: response._request_id ?? undefined,
      };
    },
  };
}

function isFunctionCall(
  item: ProviderOutputItem,
): item is ProviderOutputItem & {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
} {
  return (
    item.type === "function_call" &&
    typeof item.call_id === "string" &&
    typeof item.name === "string" &&
    typeof item.arguments === "string"
  );
}

function buildInterfaceContext(request: AIRequest): string {
  const context = request.context;
  if (!context) return request.message;

  const safeContext = {
    locale: request.locale,
    currentPage: context.currentPage ?? null,
    productId: context.productId ?? null,
    selectedVariantId: context.selectedVariantId ?? null,
    selectedColor: context.selectedColor ?? null,
    selectedSize: context.selectedSize ?? null,
    cart: context.cart ?? [],
    entryPoint: context.entryPoint ?? null,
    measurementConsent: context.measurementConsent === true,
  };
  return request.locale === "kz"
    ? `Интерфейс контексті (бұл өнім фактілерінің көзі емес): ${JSON.stringify(safeContext)}\n\nПайдаланушы сұрағы:\n${request.message}`
    : `Контекст интерфейса (это не источник фактов о товаре): ${JSON.stringify(safeContext)}\n\nВопрос пользователя:\n${request.message}`;
}

function offlineResult(
  locale: AILocale,
  correlationId: string,
  conversationId: string,
  status: "unavailable" | "timeout" = "unavailable",
): AIServiceResult {
  return {
    status,
    correlationId,
    conversationId,
    message: UNAVAILABLE_MESSAGES[locale],
    actions: [HANDOFF_ACTIONS[locale]],
  };
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof APIConnectionTimeoutError ||
    (error instanceof Error && /timeout|timed out|aborted/i.test(error.message))
  );
}

async function persist(
  request: AIRequest,
  conversationId: string,
  correlationId: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  const sessionId = request.context?.sessionId ?? `anonymous:${conversationId}`;
  await persistConversationMessage({
    conversationId,
    sessionId,
    locale: request.locale,
    role,
    content,
    correlationId,
    context: request.context,
    measurementConsent: request.context?.measurementConsent === true,
  });
}

export async function runAIConversation(
  request: AIRequest,
  options: ServiceOptions,
): Promise<AIServiceResult> {
  const config = resolveOpenAIConfig(options.env);
  const persistenceEnabled = options.persistence !== false;
  const conversationId = persistenceEnabled
    ? await resolveConversationId({
        requestedId: request.conversationId,
        sessionId: request.context?.sessionId,
      })
    : request.conversationId ?? randomUUID();
  const history = persistenceEnabled
    ? await loadConversationHistory(conversationId)
    : [];
  if (persistenceEnabled) {
    await persist(request, conversationId, options.correlationId, "user", request.message);
  }

  if (!config.enabled || !config.apiKey) {
    const fallback = offlineResult(
      request.locale,
      options.correlationId,
      conversationId,
    );
    if (persistenceEnabled) {
      await persist(request, conversationId, options.correlationId, "assistant", fallback.message);
    }
    logAIEvent("warn", {
      event: "response_complete",
      correlationId: options.correlationId,
      status: fallback.status,
      rounds: 0,
    });
    return fallback;
  }

  const provider = options.provider ?? createOpenAIProvider(config.apiKey);
  const input: unknown[] = [
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "user", content: buildInterfaceContext(request) },
  ];
  const toolContext: ToolRuntimeContext = {
    correlationId: options.correlationId,
    locale: request.locale,
    conversationId,
    sessionId: request.context?.sessionId ?? undefined,
    requestIdempotencyKey: options.idempotencyKey,
    measurementConsent: request.context?.measurementConsent === true,
  };

  let totalToolCalls = 0;
  try {
    for (let round = 1; round <= MAX_RESPONSE_ROUNDS; round += 1) {
      const response = await provider.createResponse({
        model: config.model,
        instructions: buildSystemPrompt(request.locale),
        input,
        tools: openAITools,
        maxOutputTokens: 700,
      });
      const calls = response.output.filter(isFunctionCall);

      if (calls.length === 0) {
        const parsed = AIAssistantOutputSchema.safeParse(response.outputParsed);
        if (!parsed.success) {
          throw new Error("Provider returned an invalid structured response.");
        }
        const completed: AIServiceResult = {
          status: "success",
          correlationId: options.correlationId,
          conversationId,
          message: parsed.data.answer,
          actions: parsed.data.actions,
        };
        if (persistenceEnabled) {
          await persist(
            request,
            conversationId,
            options.correlationId,
            "assistant",
            completed.message,
          );
        }
        logAIEvent("info", {
          event: "response_complete",
          correlationId: options.correlationId,
          status: completed.status,
          providerRequestId: response.requestId,
          rounds: round,
        });
        return completed;
      }

      if (
        round > MAX_TOOL_ROUNDS ||
        calls.length > MAX_CALLS_PER_ROUND ||
        totalToolCalls + calls.length > MAX_TOTAL_TOOL_CALLS
      ) {
        throw new Error("Tool call bound exceeded.");
      }
      totalToolCalls += calls.length;

      // Preserve every model output item, including reasoning items, before
      // appending function outputs for the next stateless Responses API round.
      input.push(...response.output);
      for (const call of calls) {
        const toolResult = await executeAITool(
          call.name,
          call.arguments,
          toolContext,
        );
        input.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(toolResult),
        });
      }
    }
  } catch (error) {
    const timedOut = isTimeoutError(error);
    const fallback = offlineResult(
      request.locale,
      options.correlationId,
      conversationId,
      timedOut ? "timeout" : "unavailable",
    );
    if (persistenceEnabled) {
      await persist(request, conversationId, options.correlationId, "assistant", fallback.message);
    }
    logAIEvent("error", {
      event: "response_complete",
      correlationId: options.correlationId,
      status: fallback.status,
    });
    return fallback;
  }

  const boundedFallback = offlineResult(
    request.locale,
    options.correlationId,
    conversationId,
  );
  if (persistenceEnabled) {
    await persist(
      request,
      conversationId,
      options.correlationId,
      "assistant",
      boundedFallback.message,
    );
  }
  return boundedFallback;
}
