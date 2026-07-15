import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { AIRequestSchema } from "@/lib/ai/schemas";
import { runAIConversation } from "@/lib/ai/service";
import { isSameOrigin, requestIp } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_768;

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
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { status: "validation_error", correlationId: requestCorrelationId, conversationId: null, message: "forbidden", actions: [] },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!consumeRateLimit(`ai:${requestIp(request)}`, 20, 60_000).allowed) {
    return NextResponse.json(
      { status: "unavailable", correlationId: requestCorrelationId, conversationId: null, message: "Слишком много запросов. Попробуйте через минуту.", actions: [] },
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
        message: "Некорректный формат запроса.",
        actions: [],
      },
      { status: 400 },
    );
  }

  const parsed = AIRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "validation_error",
        correlationId: requestCorrelationId,
        conversationId: null,
        message: "Проверьте текст сообщения и контекст запроса.",
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
