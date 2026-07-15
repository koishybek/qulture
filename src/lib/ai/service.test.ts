import { beforeEach, describe, expect, it, vi } from "vitest";

import { UNAVAILABLE_MESSAGES } from "@/lib/ai/prompt";
import {
  type AIProviderRequest,
  runAIConversation,
  resolveOpenAIConfig,
} from "@/lib/ai/service";

const request = {
  message: "Что есть в наличии?",
  locale: "ru" as const,
  context: {
    currentPage: "/ru",
    entryPoint: "test",
    sessionId: "ai-test-session",
  },
};

describe("AI service fallback and language behavior", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  it("prefers OPENAI_KEY, supports OPENAI_API_KEY, and uses the required model default", () => {
    expect(
      resolveOpenAIConfig({ OPENAI_KEY: "preferred", OPENAI_API_KEY: "fallback" }),
    ).toEqual({ enabled: true, apiKey: "preferred", model: "gpt-5.6-luna" });
    expect(resolveOpenAIConfig({ OPENAI_API_KEY: "fallback", OPENAI_MODEL: "model-x" }))
      .toEqual({ enabled: true, apiKey: "fallback", model: "model-x" });
  });

  it("returns the exact graceful Russian state without a key and never calls a provider", async () => {
    const provider = { createResponse: vi.fn() };
    const result = await runAIConversation(request, {
      correlationId: "correlation-no-key",
      env: { OPENAI_KEY: "", OPENAI_API_KEY: "" },
      provider,
      persistence: false,
    });

    expect(provider.createResponse).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: "unavailable",
      correlationId: "correlation-no-key",
      message: UNAVAILABLE_MESSAGES.ru,
      actions: [{ kind: "open_handoff" }],
    });
  });

  it("returns a structured Kazakh answer from an injected provider without a live call", async () => {
    let observedRequest: AIProviderRequest | undefined;
    const provider = {
      createResponse: vi.fn(async (providerRequest: AIProviderRequest) => {
        observedRequest = providerRequest;
        return {
          id: "response-test",
          output: [{ type: "message" }],
          outputText: "",
          outputParsed: {
            answer: "Расталған ақпаратты тексеремін.",
            actions: [
              {
                kind: "ask",
                label: "Өнімді көрсету",
                value: "Қай өнім туралы сұрап тұрсыз?",
              },
            ],
          },
          requestId: "request-test",
        };
      }),
    };
    const result = await runAIConversation(
      { ...request, locale: "kz", message: "Қандай өнім бар?" },
      {
        correlationId: "correlation-provider",
        env: { OPENAI_KEY: "test-only-key" },
        provider,
        persistence: false,
      },
    );

    expect(result.status).toBe("success");
    expect(result.message).toBe("Расталған ақпаратты тексеремін.");
    expect(provider.createResponse).toHaveBeenCalledOnce();
    expect(observedRequest).toBeDefined();
    expect(observedRequest?.instructions).toContain("Тек қазақ тілінде жауап бер");
  });

  it("returns a structured English answer without falling back to Russian instructions", async () => {
    let observedRequest: AIProviderRequest | undefined;
    const provider = {
      createResponse: vi.fn(async (providerRequest: AIProviderRequest) => {
        observedRequest = providerRequest;
        return {
          id: "response-en-test",
          output: [{ type: "message" }],
          outputText: "",
          outputParsed: {
            answer: "I will check the confirmed information.",
            actions: [
              {
                kind: "ask",
                label: "Choose a product",
                value: "Which product would you like to explore?",
              },
            ],
          },
          requestId: "request-en-test",
        };
      }),
    };

    const result = await runAIConversation(
      { ...request, locale: "en", message: "What products are available?" },
      {
        correlationId: "correlation-en-provider",
        env: { OPENAI_KEY: "test-only-key" },
        provider,
        persistence: false,
      },
    );

    expect(result.status).toBe("success");
    expect(result.message).toBe("I will check the confirmed information.");
    expect(observedRequest?.instructions).toContain("Reply only in English");
    expect(observedRequest?.input).toContainEqual(
      expect.objectContaining({ content: expect.stringContaining("Interface context") }),
    );
  });

  it("preserves model output and returns standardized function results in a bounded tool loop", async () => {
    const requests: AIProviderRequest[] = [];
    const provider = {
      createResponse: vi.fn(async (providerRequest: AIProviderRequest) => {
        requests.push(providerRequest);
        if (requests.length === 1) {
          return {
            id: "response-tool-call",
            output: [
              { type: "reasoning", id: "reasoning-1" },
              {
                type: "function_call",
                call_id: "call-1",
                name: "get_product",
                arguments: "{}",
              },
            ],
            outputText: "",
            outputParsed: null,
          };
        }
        return {
          id: "response-final",
          output: [{ type: "message" }],
          outputText: "",
          outputParsed: {
            answer: "У меня нет подтверждённой информации по этому вопросу.",
            actions: [
              {
                kind: "open_handoff",
                label: "Передать вопрос",
                value: "Передать мой вопрос команде",
              },
            ],
          },
        };
      }),
    };

    const result = await runAIConversation(request, {
      correlationId: "correlation-tool-loop",
      env: { OPENAI_KEY: "test-only-key" },
      provider,
      persistence: false,
    });

    expect(result.status).toBe("success");
    expect(provider.createResponse).toHaveBeenCalledTimes(2);
    expect(requests[1]?.input).toContainEqual({ type: "reasoning", id: "reasoning-1" });
    const functionOutput = requests[1]?.input.find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        item.type === "function_call_output",
    ) as { output?: string } | undefined;
    expect(JSON.parse(functionOutput?.output ?? "{}")).toMatchObject({
      status: "validation_error",
      tool: "get_product",
      correlationId: "correlation-tool-loop",
    });
  });
});
