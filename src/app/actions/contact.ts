"use server";

import { headers } from "next/headers";

import { deliver } from "@/lib/contact/deliver";
import { allowRequest, clientKey } from "@/lib/contact/rate-limit";
import { normalize, validateContact, type ContactState } from "@/lib/contact/schema";
import { checkToken, issueToken } from "@/lib/contact/token";
import { site } from "@/lib/site";

/** Honeypot field. Real visitors never see or fill it. */
const HONEYPOT = "nulle_reference";

const fallback = site.contactEmail ? ` You can also reach us at ${site.contactEmail}.` : "";

/** Called by the form the first time a visitor interacts with it. */
export async function requestFormToken(): Promise<string> {
  return issueToken();
}

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // 1. Spam: a filled honeypot is never a person.
  if (String(formData.get(HONEYPOT) ?? "").trim() !== "") {
    return {
      status: "error",
      reason: "unverified",
      message: `We couldn’t process this submission.${fallback}`,
    };
  }

  // 2. Validation, with the same rules the browser applies.
  const values = normalize(Object.fromEntries(formData));
  const errors = validateContact(values);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  // 3. Spam: the signed timing token.
  const token = checkToken(String(formData.get("token") ?? ""));
  if (token === "too_fast") {
    return {
      status: "error",
      reason: "unverified",
      message: "That was quick. Please wait a few seconds and send again.",
    };
  }
  if (token !== "ok") {
    return {
      status: "error",
      reason: "unverified",
      message: "We couldn’t verify this submission. Please send it once more.",
    };
  }

  // 4. Rate limit per client.
  if (!allowRequest(clientKey(await headers()))) {
    return {
      status: "error",
      reason: "rate_limited",
      message: `Too many requests from this connection. Please try again in a few minutes.${fallback}`,
    };
  }

  // 5. Delivery. We only report success when something accepted it.
  const result = await deliver(values);
  if (result.ok) {
    return { status: "success", delivery: "sent", intent: values.intent, name: values.name };
  }

  if (result.reason === "not_configured") {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] No delivery integration configured. Request logged only:\n", values);
      return { status: "success", delivery: "logged", intent: values.intent, name: values.name };
    }
    console.error("[contact] A request was received but no delivery integration is configured.");
    return {
      status: "error",
      reason: "not_configured",
      message: `This form isn’t connected to our inbox yet, so your message was not sent.${fallback}`,
    };
  }

  return {
    status: "error",
    reason: "delivery_failed",
    message: `Something went wrong on our side and your message was not sent. Please try again.${fallback}`,
  };
}
