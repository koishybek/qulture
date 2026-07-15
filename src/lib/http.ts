import { NextResponse } from "next/server";
import { isIP } from "node:net";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { ok: false, message, ...(details === undefined ? {} : { details }) },
    { status },
  );
}

export function errorResponse(error: unknown, fallback = "request_failed") {
  if (error instanceof ZodError) {
    return jsonError("validation_failed", 422, error.flatten());
  }

  if (error instanceof SyntaxError) {
    return jsonError("invalid_json", 400);
  }

  return jsonError(fallback, 500);
}

export function requestIp(request: Request) {
  const trustsProxyHeaders =
    process.env.TRUST_PROXY_HEADERS === "true" ||
    process.env.VERCEL === "1" ||
    process.env.CF_PAGES === "1";
  if (!trustsProxyHeaders) return "untrusted-client";

  // Trusted proxies append the closest observed address to the right. Reading
  // the last valid value prevents a caller-controlled prefix from bypassing a
  // per-client limit.
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (forwarded && isIP(forwarded)) return forwarded;
  if (realIp && isIP(realIp)) return realIp;
  return "unknown-client";
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const trustsProxyHeaders =
      process.env.TRUST_PROXY_HEADERS === "true" ||
      process.env.VERCEL === "1" ||
      process.env.CF_PAGES === "1";
    const forwardedHost = trustsProxyHeaders
      ? request.headers.get("x-forwarded-host")?.split(",").at(-1)?.trim()
      : null;
    const requestHost =
      forwardedHost || request.headers.get("host")?.trim() || new URL(request.url).host;
    return originHost === requestHost.toLowerCase();
  } catch {
    return false;
  }
}
