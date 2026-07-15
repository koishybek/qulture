import { NextResponse } from "next/server";

import { IdempotencyConflictError } from "@/lib/domain/idempotency";
import { DemoOrderValidationError } from "@/lib/commerce/demo-pricing";
import {
  createDemoOrder,
  IdempotencyInProgressError,
} from "@/lib/commerce/order-service";
import { demoOrderRequestSchema } from "@/lib/commerce/schemas";
import { isDemoOrderApiEnabled } from "@/lib/commerce/demo-gate";
import { db } from "@/lib/db";
import { isSameOrigin, requestIp } from "@/lib/http";
import {
  canCapturePiiUnderPolicy,
  DEFAULT_CONSENT_POLICY_VERSION,
} from "@/lib/privacy/pii-policy";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
  }
  const rate = consumeRateLimit(`demo-order:${requestIp(request)}`, 6, 10 * 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "rate_limited" },
      { status: 429, headers: { ...NO_STORE_HEADERS, "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } },
    );
  }
  if (!isDemoOrderApiEnabled()) {
    return NextResponse.json({ message: "not_found" }, { status: 404, headers: NO_STORE_HEADERS });
  }
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
    select: { consentPolicyVersion: true },
  });
  const policyVersion =
    settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
  if (!canCapturePiiUnderPolicy({ policyVersion })) {
    return NextResponse.json(
      { message: "draft_policy_capture_disabled" },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 64_000) {
    return NextResponse.json(
      { message: "request_too_large" },
      { status: 413, headers: NO_STORE_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "invalid_json" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const parsed = demoOrderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "invalid_order", issues: parsed.error.flatten().fieldErrors },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const headerKey = request.headers.get("idempotency-key")?.trim();
  const bodyKey = parsed.data.idempotencyKey;
  if (headerKey && bodyKey && headerKey !== bodyKey) {
    return NextResponse.json(
      { message: "idempotency_key_mismatch" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }
  const idempotencyKey = headerKey || bodyKey;
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    return NextResponse.json(
      { message: "idempotency_key_required" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const result = await createDemoOrder(parsed.data, idempotencyKey);
    return NextResponse.json(result.response, {
      status: result.replayed ? 200 : 201,
      headers: {
        ...NO_STORE_HEADERS,
        "Idempotency-Replayed": result.replayed ? "true" : "false",
      },
    });
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return NextResponse.json(
        { message: "idempotency_conflict" },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }
    if (error instanceof IdempotencyInProgressError) {
      return NextResponse.json(
        { message: "order_in_progress" },
        { status: 409, headers: { ...NO_STORE_HEADERS, "Retry-After": "1" } },
      );
    }
    if (error instanceof DemoOrderValidationError) {
      const status = error.code === "INSUFFICIENT_STOCK" ? 409 : 400;
      return NextResponse.json(
        { message: error.code.toLowerCase() },
        { status, headers: NO_STORE_HEADERS },
      );
    }
    console.error("Demo order creation failed", error);
    return NextResponse.json(
      { message: "order_failed" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
