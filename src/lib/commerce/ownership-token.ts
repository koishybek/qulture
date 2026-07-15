import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const TOKEN_PREFIX = "qot_";
const TOKEN_VERSION = 1;
const DEFAULT_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

export type OwnershipTokenPayload = {
  version: 1;
  orderNumber: string;
  nonce: string;
  expiresAt: number;
};

function signature(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function getOrderTokenSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required for order ownership tokens");
  }

  return "qulture-local-development-order-token-secret";
}

export function createOwnershipToken(
  orderNumber: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const payload: OwnershipTokenPayload = {
    version: TOKEN_VERSION,
    orderNumber,
    nonce: randomBytes(18).toString("base64url"),
    expiresAt: nowSeconds + DEFAULT_LIFETIME_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${TOKEN_PREFIX}${encodedPayload}.${signature(encodedPayload, secret)}`;
}

export function verifyOwnershipToken(
  token: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): OwnershipTokenPayload | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const [encodedPayload, suppliedSignature, extra] = token
    .slice(TOKEN_PREFIX.length)
    .split(".");
  if (!encodedPayload || !suppliedSignature || extra) return null;

  const expectedSignature = signature(encodedPayload, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const value = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<OwnershipTokenPayload>;
    if (
      value.version !== TOKEN_VERSION ||
      typeof value.orderNumber !== "string" ||
      typeof value.nonce !== "string" ||
      typeof value.expiresAt !== "number" ||
      value.expiresAt < nowSeconds
    ) {
      return null;
    }
    return value as OwnershipTokenPayload;
  } catch {
    return null;
  }
}

export function hashOwnershipToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenHashMatches(token: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOwnershipToken(token), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

