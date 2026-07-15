import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { HandoffRequestSchema } from "@/lib/ai/schemas";
import { executeAITool } from "@/lib/ai/tools";
import type { AILocale } from "@/lib/ai/types";
import { db } from "@/lib/db";
import { isSameOrigin, requestIp } from "@/lib/http";
import {
  canCapturePiiUnderPolicy,
  DEFAULT_CONSENT_POLICY_VERSION,
} from "@/lib/privacy/pii-policy";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_768;

const apiCopy: Record<
  AILocale,
  {
    forbidden: string;
    rateLimited: string;
    policyUnavailable: string;
    captureDisabled: string;
    invalidRequest: string;
    checkData: string;
    policyChanged: string;
    keyRequired: string;
  }
> = {
  ru: {
    forbidden: "Недопустимый источник запроса.",
    rateLimited: "Повторите запрос позже.",
    policyUnavailable: "Не удалось проверить версию политики.",
    captureDisabled: "Сбор контактов отключён до утверждения политики.",
    invalidRequest: "Некорректный формат запроса.",
    checkData: "Проверьте данные передачи вопроса.",
    policyChanged: "Версия политики изменилась. Обновите страницу.",
    keyRequired: "Для безопасной отправки нужен Idempotency-Key.",
  },
  kz: {
    forbidden: "Сұрау көзіне рұқсат жоқ.",
    rateLimited: "Сұрауды кейінірек қайталаңыз.",
    policyUnavailable: "Саясат нұсқасын тексеру мүмкін болмады.",
    captureDisabled: "Саясат бекітілгенге дейін байланыс деректерін жинау өшірілген.",
    invalidRequest: "Сұрау пішімі қате.",
    checkData: "Сұрақты жіберу деректерін тексеріңіз.",
    policyChanged: "Саясат нұсқасы өзгерді. Бетті жаңартыңыз.",
    keyRequired: "Қауіпсіз жіберу үшін Idempotency-Key қажет.",
  },
  en: {
    forbidden: "This request origin is not allowed.",
    rateLimited: "Please try again later.",
    policyUnavailable: "We could not verify the policy version.",
    captureDisabled: "Contact collection is disabled until the policy is approved.",
    invalidRequest: "The request format is invalid.",
    checkData: "Check the handoff details.",
    policyChanged: "The policy version changed. Refresh the page.",
    keyRequired: "An Idempotency-Key is required to submit safely.",
  },
};

function headerLocale(request: Request): AILocale {
  const locale = request.headers.get("x-qulture-locale")?.trim().toLowerCase();
  if (locale === "en" || locale === "kz") return locale;
  return "ru";
}

function requestCorrelationId(request: Request): string {
  const supplied = request.headers.get("x-correlation-id")?.trim();
  return supplied && /^[a-zA-Z0-9_.:-]{8,80}$/.test(supplied)
    ? supplied
    : randomUUID();
}

export async function POST(request: Request) {
  const correlationId = requestCorrelationId(request);
  const requestLocale = headerLocale(request);
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { status: "validation_error", tool: "create_handoff", correlationId, data: null, error: { code: "invalid_origin", message: apiCopy[requestLocale].forbidden } },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!consumeRateLimit(`handoff:${requestIp(request)}`, 8, 10 * 60_000).allowed) {
    return NextResponse.json(
      { status: "unavailable", tool: "create_handoff", correlationId, data: null, error: { code: "too_many_requests", message: apiCopy[requestLocale].rateLimited } },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "600" } },
    );
  }
  let policyVersion: string;
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
      select: { consentPolicyVersion: true },
    });
    policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
  } catch {
    return NextResponse.json(
      { status: "unavailable", tool: "create_handoff", correlationId, data: null, error: { code: "policy_unavailable", message: apiCopy[requestLocale].policyUnavailable } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!canCapturePiiUnderPolicy({ policyVersion })) {
    return NextResponse.json(
      { status: "unavailable", tool: "create_handoff", correlationId, data: null, error: { code: "draft_policy_capture_disabled", message: apiCopy[requestLocale].captureDisabled } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  let raw: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      throw new Error("request_too_large");
    }
    raw = JSON.parse(body) as unknown;
  } catch {
    return NextResponse.json(
      {
        status: "validation_error",
        tool: "create_handoff",
        correlationId,
        data: null,
        error: { code: "invalid_request", message: apiCopy[requestLocale].invalidRequest },
      },
      { status: 400 },
    );
  }

  const parsed = HandoffRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "validation_error",
        tool: "create_handoff",
        correlationId,
        data: null,
        error: {
          code: "invalid_request",
          message: apiCopy[requestLocale].checkData,
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }
  if (parsed.data.policyVersion !== policyVersion) {
    return NextResponse.json(
      { status: "validation_error", tool: "create_handoff", correlationId, data: null, error: { code: "policy_version_changed", message: apiCopy[parsed.data.locale ?? requestLocale].policyChanged } },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }

  const headerKey = request.headers.get("idempotency-key")?.trim() || null;
  const idempotencyKey = parsed.data.idempotencyKey ?? headerKey;
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return NextResponse.json(
      {
        status: "validation_error",
        tool: "create_handoff",
        correlationId,
        data: null,
        error: {
          code: "idempotency_key_required",
          message: apiCopy[parsed.data.locale ?? requestLocale].keyRequired,
        },
      },
      { status: 400 },
    );
  }

  const {
    locale = "ru",
    measurementConsent = false,
    contactConsent,
    policyVersion: submittedPolicyVersion,
    ...input
  } = parsed.data;
  const result = await executeAITool(
    "create_handoff",
    {
      ...input,
      conversationId: input.conversationId ?? null,
      idempotencyKey,
    },
    {
      correlationId,
      locale,
      conversationId: input.conversationId ?? undefined,
      requestIdempotencyKey: idempotencyKey,
      measurementConsent,
      contactConsent,
      policyVersion: submittedPolicyVersion,
    },
  );

  const statusCode =
    result.status === "success"
      ? 201
      : result.status === "validation_error"
        ? 400
        : result.status === "timeout"
          ? 504
          : 503;
  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store",
      "X-Correlation-Id": correlationId,
    },
  });
}
