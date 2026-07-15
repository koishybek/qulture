import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearAdminSessionCookie,
  isAdminEnabled,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { isSameOrigin, jsonError, requestIp } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminEnabled()) return jsonError("admin_disabled", 503);
  if (!isSameOrigin(request)) return jsonError("invalid_origin", 403);
  if (!consumeRateLimit(`admin-login:${requestIp(request)}`, 5, 15 * 60_000).allowed) {
    return jsonError("too_many_attempts", 429);
  }

  const parsed = z.object({ password: z.string().min(1).max(256) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return jsonError("invalid_credentials", 401);
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return jsonError("invalid_origin", 403);
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
