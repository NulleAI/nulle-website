import "server-only";

import { site } from "@/lib/site";

import { intentLabel, needLabel, type ContactValues } from "./schema";

/**
 * Delivery of contact requests.
 *
 * Two channels, each switched on by environment variables:
 *
 *   Email    RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL
 *   Webhook  CONTACT_WEBHOOK_URL (Slack, Zapier, Make, a CRM, your own API)
 *
 * If neither is configured, nothing is sent and the caller is told so.
 * A request counts as delivered when at least one channel accepts it.
 */

const TIMEOUT_MS = 10_000;

export type DeliveryResult =
  | { ok: true; channels: string[] }
  | { ok: false; reason: "not_configured" | "failed" };

type Channel = { name: string; send: (values: ContactValues) => Promise<void> };

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function subject(values: ContactValues): string {
  return singleLine(`${intentLabel(values.intent)}: ${values.name}, ${values.company}`);
}

function body(values: ContactValues): string {
  return [
    `${intentLabel(values.intent)} from the ${site.name} website`,
    "",
    `Name:     ${values.name}`,
    `Email:    ${values.email}`,
    `Company:  ${values.company}`,
    `Needs:    ${needLabel(values.need)}`,
    "",
    "Project description:",
    values.message,
    "",
    "—",
    `Sent from the contact form at ${site.url}`,
  ].join("\n");
}

async function post(url: string, init: RequestInit, name: string): Promise<void> {
  const response = await fetch(url, {
    ...init,
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`${name} responded ${response.status}${detail ? `: ${detail}` : ""}`);
  }
}

function emailChannel(): Channel | null {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return null;

  return {
    name: "email",
    send: (values) =>
      post(
        "https://api.resend.com/emails",
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: to.split(",").map((address) => address.trim()),
            reply_to: values.email,
            subject: subject(values),
            text: body(values),
          }),
        },
        "Resend",
      ),
  };
}

function webhookChannel(): Channel | null {
  const raw = process.env.CONTACT_WEBHOOK_URL;
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    console.error("[contact] CONTACT_WEBHOOK_URL is not a valid URL; webhook delivery is off.");
    return null;
  }
  // Plain http is accepted outside production only, for local testing.
  if (url.protocol !== "https:" && process.env.NODE_ENV === "production") {
    console.error("[contact] CONTACT_WEBHOOK_URL must use https; webhook delivery is off.");
    return null;
  }

  return {
    name: "webhook",
    send: (values) =>
      post(
        url.toString(),
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: `${site.name} website`,
            type: values.intent,
            subject: subject(values),
            text: body(values),
            name: values.name,
            email: values.email,
            company: values.company,
            need: needLabel(values.need),
            message: values.message,
            submittedAt: new Date().toISOString(),
          }),
        },
        "Webhook",
      ),
  };
}

export function deliveryConfigured(): boolean {
  return Boolean(emailChannel() || webhookChannel());
}

export async function deliver(values: ContactValues): Promise<DeliveryResult> {
  const channels = [emailChannel(), webhookChannel()].filter(
    (channel): channel is Channel => channel !== null,
  );
  if (!channels.length) return { ok: false, reason: "not_configured" };

  const results = await Promise.allSettled(channels.map((channel) => channel.send(values)));

  const delivered: string[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") delivered.push(channels[index].name);
    else console.error(`[contact] ${channels[index].name} delivery failed:`, result.reason);
  });

  return delivered.length ? { ok: true, channels: delivered } : { ok: false, reason: "failed" };
}
