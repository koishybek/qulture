import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { AIRequestSchema } from "@/lib/ai/schemas";
import { runAIConversation } from "@/lib/ai/service";
import type { AILocale } from "@/lib/ai/types";
import { isSameOrigin, requestIp } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_768;

const apiCopy: Record<
  AILocale,
  {
    forbidden: string;
    rateLimited: string;
    invalidFormat: string;
    invalidRequest: string;
  }
> = {
  ru: {
    forbidden: "Недопустимый источник запроса.",
    rateLimited: "Слишком много запросов. Попробуйте через минуту.",
    invalidFormat: "Некорректный формат запроса.",
    invalidRequest: "Проверьте текст сообщения и контекст запроса.",
  },
  kz: {
    forbidden: "Сұрау көзіне рұқсат жоқ.",
    rateLimited: "Сұраулар тым көп. Бір минуттан кейін қайталап көріңіз.",
    invalidFormat: "Сұрау пішімі қате.",
    invalidRequest: "Хабарлама мәтінін және сұрау контекстін тексеріңіз.",
  },
  en: {
    forbidden: "This request origin is not allowed.",
    rateLimited: "Too many requests. Please try again in a minute.",
    invalidFormat: "The request format is invalid.",
    invalidRequest: "Check the message text and request context.",
  },
};

function headerLocale(request: Request): AILocale {
  const locale = request.headers.get("x-qulture-locale")?.trim().toLowerCase();
  if (locale === "en" || locale === "kz") return locale;
  return "ru";
}

function payloadLocale(payload: unknown, fallback: AILocale): AILocale {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return fallback;
  }
  const locale = (payload as { locale?: unknown }).locale;
  if (locale === "en" || locale === "kz") return locale;
  if (locale === "kk") return "kz";
  return locale === "ru" ? "ru" : fallback;
}

function correlationId(request: Request): string {
  const supplied = request.headers.get("x-correlation-id")?.trim();
  return supplied && /^[a-zA-Z0-9_.:-]{8,80}$/.test(supplied)
    ? supplied
    : randomUUID();
}

async function readJson(request: Request): Promise<unknown> {
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    throw new Error("request_too_large");
  }
  return JSON.parse(body) as unknown;
}

export async function POST(request: Request) {
  const requestCorrelationId = correlationId(request);
  const locale = headerLocale(request);
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { status: "validation_error", correlationId: requestCorrelationId, conversationId: null, message: apiCopy[locale].forbidden, actions: [] },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!consumeRateLimit(`ai:${requestIp(request)}`, 20, 60_000).allowed) {
    return NextResponse.json(
      { status: "unavailable", correlationId: requestCorrelationId, conversationId: null, message: apiCopy[locale].rateLimited, actions: [] },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }
  let payload: unknown;
  try {
    payload = await readJson(request);
  } catch {
    return NextResponse.json(
      {
        status: "validation_error",
        correlationId: requestCorrelationId,
        conversationId: null,
        message: apiCopy[locale].invalidFormat,
        actions: [],
      },
      { status: 400 },
    );
  }

  const parsed = AIRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const responseLocale = payloadLocale(payload, locale);
    return NextResponse.json(
      {
        status: "validation_error",
        correlationId: requestCorrelationId,
        conversationId: null,
        message: apiCopy[responseLocale].invalidRequest,
        actions: [],
        error: {
          code: "invalid_request",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const result = await runAIConversation(parsed.data, {
    correlationId: requestCorrelationId,
    idempotencyKey: request.headers.get("idempotency-key")?.trim() || undefined,
  });

  // Provider outages and a disabled key are normal, renderable AI states. A
  // 200 keeps the rest of the site and the handoff action fully usable.
  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Correlation-Id": requestCorrelationId,
    },
  });
}
