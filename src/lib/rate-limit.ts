/**
 * In-memory rate limiter for login and sensitive endpoints.
 * For production at scale, use Redis or similar.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_ADMIN_REQUESTS = 100;

function getKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

function getOrCreate(key: string, maxAttempts: number): { count: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }
  if (now >= entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }
  entry.count += 1;
  return entry;
}

/** Returns true if allowed, false if rate limited. */
export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const key = getKey("login", ip);
  const { count, resetAt } = getOrCreate(key, MAX_LOGIN_ATTEMPTS);
  if (count > MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, retryAfterMs: resetAt - Date.now() };
  }
  return { allowed: true };
}

/** Returns true if allowed, false if rate limited. */
export function checkAdminApiRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const key = getKey("admin-api", ip);
  const { count, resetAt } = getOrCreate(key, MAX_ADMIN_REQUESTS);
  if (count > MAX_ADMIN_REQUESTS) {
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
