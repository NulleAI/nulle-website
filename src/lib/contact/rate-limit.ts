import "server-only";

/**
 * A small in-memory sliding-window limiter: at most MAX_REQUESTS
 * accepted submissions per client per window.
 *
 * It holds state per server process. On a single long-running server
 * that is exact. On serverless platforms each instance counts
 * separately, so treat it as a first line of defence and add the
 * platform's own rate limiting or firewall in front for stricter control.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_CLIENTS = 5_000;

const requests = new Map<string, number[]>();

export function allowRequest(client: string, now: number = Date.now()): boolean {
  const recent = (requests.get(client) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    requests.set(client, recent);
    return false;
  }

  recent.push(now);
  requests.set(client, recent);

  if (requests.size > MAX_TRACKED_CLIENTS) {
    for (const [key, times] of requests) {
      if (times.every((time) => now - time >= WINDOW_MS)) requests.delete(key);
    }
  }

  return true;
}

export function clientKey(headers: Headers): string {
  // DigitalOcean App Platform puts the visitor's address in
  // do-connecting-ip. Prefer it: the first x-forwarded-for entry is
  // whatever the visitor sent, so it can be changed to dodge the limit.
  const platform = headers.get("do-connecting-ip")?.trim();
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return platform || forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
