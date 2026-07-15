import { createHash } from "node:crypto";

export class IdempotencyConflictError extends Error {
  constructor() {
    super("The idempotency key was already used with a different request payload.");
    this.name = "IdempotencyConflictError";
  }
}

function canonicalize(value: unknown, seen: Set<object>): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Idempotency payload cannot contain non-finite numbers");
    }
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item, seen));
  }
  if (typeof value === "object") {
    if (seen.has(value)) {
      throw new TypeError("Idempotency payload cannot contain circular references");
    }
    seen.add(value);
    const record = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      if (record[key] !== undefined) {
        result[key] = canonicalize(record[key], seen);
      }
    }
    seen.delete(value);
    return result;
  }

  throw new TypeError(`Unsupported idempotency payload value: ${typeof value}`);
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(canonicalize(value, new Set()));
}

export function fingerprintRequest(value: unknown): string {
  return createHash("sha256").update(stableSerialize(value)).digest("hex");
}

interface MemoryEntry<T> {
  fingerprint: string;
  promise: Promise<T>;
}

export interface IdempotentResult<T> {
  value: T;
  replayed: boolean;
  fingerprint: string;
}

/**
 * Process-local coordination for tests and single-process development.
 * Production handlers should persist the same fingerprint in IdempotencyRecord.
 */
export class IdempotencyCoordinator {
  private readonly entries = new Map<string, MemoryEntry<unknown>>();

  async run<T>(
    scope: string,
    key: string,
    payload: unknown,
    operation: () => Promise<T>,
  ): Promise<IdempotentResult<T>> {
    const normalizedScope = scope.trim();
    const normalizedKey = key.trim();
    if (!normalizedScope || !normalizedKey) {
      throw new TypeError("Idempotency scope and key are required");
    }

    const mapKey = `${normalizedScope}:${normalizedKey}`;
    const fingerprint = fingerprintRequest(payload);
    const existing = this.entries.get(mapKey) as MemoryEntry<T> | undefined;
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new IdempotencyConflictError();
      }
      return {
        value: await existing.promise,
        replayed: true,
        fingerprint,
      };
    }

    const promise = operation();
    this.entries.set(mapKey, { fingerprint, promise });
    try {
      return { value: await promise, replayed: false, fingerprint };
    } catch (error) {
      this.entries.delete(mapKey);
      throw error;
    }
  }

  clear(): void {
    this.entries.clear();
  }
}
