interface RateLimitInput {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitInput) {
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1) };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - existing.count) };
}

export function getRateLimitKey(request: Request, scope: string, identifier?: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${scope}:${identifier ?? forwardedFor ?? realIp ?? "anonymous"}`;
}

export function resetRateLimitsForTests() {
  buckets.clear();
}
