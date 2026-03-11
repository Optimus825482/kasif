/**
 * In-memory rate limiter for login and sensitive endpoints.
 * For production at scale, use Redis or similar.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_ADMIN_REQUESTS = 100;
const MAX_EVENTS_PER_MINUTE = 120;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

function getKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

function getOrCreate(key: string): { count: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }
  entry.count += 1;
  return entry;
}

/** Returns true if allowed, false if rate limited. */
export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const key = getKey("login", ip);
  const { count, resetAt } = getOrCreate(key);
  if (count > MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, retryAfterMs: resetAt - Date.now() };
  }
  return { allowed: true };
}

/** Returns true if allowed, false if rate limited. */
export function checkAdminApiRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const key = getKey("admin-api", ip);
  const { count, resetAt } = getOrCreate(key);
  if (count > MAX_ADMIN_REQUESTS) {
    return { allowed: false, retryAfterMs: resetAt - Date.now() };
  }
  return { allowed: true };
}

/** Events API: IP bazlı dakikalık limit (spam/DoS önleme). */
export function checkEventsRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const key = getKey("events", ip);
  const { count, resetAt } = getOrCreate(key);
  if (count > MAX_EVENTS_PER_MINUTE) {
    return { allowed: false, retryAfterMs: resetAt - Date.now() };
  }
  return { allowed: true };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
