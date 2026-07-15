import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "qulture_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function configuredPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

function sessionSecret() {
  const dedicatedSecret = process.env.SESSION_SECRET?.trim();
  if (dedicatedSecret) return dedicatedSecret;
  return process.env.NODE_ENV === "production" ? null : configuredPassword();
}

function sign(value: string) {
  const secret = sessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminEnabled() {
  return Boolean(configuredPassword() && sessionSecret());
}

export function verifyAdminPassword(candidate: string) {
  const password = configuredPassword();
  return Boolean(password && safeEqual(candidate, password));
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const value = `admin.${expiresAt}`;
  return { token: `${value}.${sign(value)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifyAdminSession(token: string | undefined) {
  if (!token || !isAdminEnabled()) return false;
  const [role, expires, signature] = token.split(".");
  if (role !== "admin" || !expires || !signature) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(`${role}.${expires}`));
}

export async function hasAdminSession() {
  return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function setAdminSessionCookie() {
  const session = createAdminSession();
  (await cookies()).set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
}

export async function clearAdminSessionCookie() {
  (await cookies()).set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
