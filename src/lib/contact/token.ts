import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * A signed, timestamped token the form requests when a visitor first
 * interacts with it. Requiring one means a submission must come from a
 * browser that ran the page, and must take at least a few seconds —
 * which most automated spam does not.
 */

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

let processSecret: string | undefined;

function secret(): string {
  // A stable secret keeps tokens valid across server instances. Without
  // one configured we fall back to a per-process secret, which is fine
  // for a single server and for local development.
  const configured =
    process.env.CONTACT_FORM_SECRET ||
    process.env.RESEND_API_KEY ||
    process.env.CONTACT_WEBHOOK_URL;
  if (configured) return configured;
  processSecret ??= randomBytes(32).toString("hex");
  return processSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueToken(now: number = Date.now()): string {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(issuedAt)}`;
}

export type TokenCheck = "ok" | "missing" | "invalid" | "too_fast" | "expired";

export function checkToken(token: string, now: number = Date.now()): TokenCheck {
  if (!token) return "missing";

  const [issuedAt, signature, ...rest] = token.split(".");
  if (!issuedAt || !signature || rest.length || !/^\d{10,16}$/.test(issuedAt)) return "invalid";

  const expected = Buffer.from(sign(issuedAt));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return "invalid";

  const age = now - Number(issuedAt);
  if (age < MIN_AGE_MS) return "too_fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}
