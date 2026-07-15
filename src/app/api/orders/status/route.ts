import { NextResponse } from "next/server";
import { z } from "zod";

import { getDemoOrderStatus } from "@/lib/commerce/order-service";
import { isSameOrigin, requestIp } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
};

const lookupSchema = z.object({
  orderNumber: z.string().trim().min(8).max(80),
  proof: z.string().trim().min(3).max(1_000),
}).strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: "forbidden" },
      { status: 403, headers: NO_STORE_HEADERS },
    );
  }
  const rate = consumeRateLimit(`order-status:${requestIp(request)}`, 30, 10 * 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "rate_limited" },
      { status: 429, headers: { ...NO_STORE_HEADERS, "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "order_not_found" },
      { status: 404, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const order = await getDemoOrderStatus(
      parsed.data.orderNumber,
      parsed.data.proof,
    );
    if (!order) {
      return NextResponse.json(
        { message: "order_not_found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(order, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Demo order status lookup failed", error);
    return NextResponse.json(
      { message: "order_status_unavailable" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
