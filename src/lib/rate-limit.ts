type Bucket = { count: number; resetAt: number };

const globalBuckets = globalThis as typeof globalThis & {
  __qultureRateLimits?: Map<string, Bucket>;
};

const buckets = globalBuckets.__qultureRateLimits ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") globalBuckets.__qultureRateLimits = buckets;
let operations = 0;

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size > 10_000) {
    const oldestKey = buckets.keys().next().value as string | undefined;
    if (!oldestKey) break;
    buckets.delete(oldestKey);
  }
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  operations += 1;
  if (operations % 100 === 0 || buckets.size > 10_000) pruneExpired(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}
