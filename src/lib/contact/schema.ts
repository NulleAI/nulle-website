/**
 * The contact form's shape and rules. Imported by both the browser and
 * the server, so both always agree on what a valid request looks like.
 */

export const intents = [
  { id: "consultation", label: "Book a Consultation" },
  { id: "quote", label: "Request a Quote" },
] as const;

export type Intent = (typeof intents)[number]["id"];

export const needs = [
  { id: "agents", label: "AI agents & automation" },
  { id: "strategy", label: "AI strategy & consulting" },
  { id: "private-ai", label: "Private AI & infrastructure" },
  { id: "software", label: "Custom software & digital products" },
  { id: "unsure", label: "Not sure yet" },
] as const;

export type ContactValues = {
  intent: Intent;
  name: string;
  email: string;
  company: string;
  need: string;
  message: string;
};

export type ContactField = Exclude<keyof ContactValues, "intent">;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const fieldOrder: ContactField[] = ["name", "email", "company", "need", "message"];

export const limits = {
  name: 100,
  email: 200,
  company: 120,
  messageMin: 10,
  messageMax: 4000,
} as const;

export const emptyValues: ContactValues = {
  intent: "consultation",
  name: "",
  email: "",
  company: "",
  need: "",
  message: "",
};

export type ContactState =
  | { status: "idle" }
  | { status: "invalid"; errors: ContactErrors }
  | {
      status: "error";
      reason: "unverified" | "rate_limited" | "not_configured" | "delivery_failed";
      message: string;
    }
  | {
      status: "success";
      /** "sent" means a delivery integration accepted it. "logged" is development only. */
      delivery: "sent" | "logged";
      intent: Intent;
      name: string;
    };

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** Coerce untrusted input into the form's shape. Never throws. */
export function normalize(input: Record<string, unknown>): ContactValues {
  const intent = text(input.intent);
  return {
    intent: intent === "quote" ? "quote" : "consultation",
    name: text(input.name).trim().replace(/\s+/g, " "),
    email: text(input.email).trim(),
    company: text(input.company).trim().replace(/\s+/g, " "),
    need: text(input.need).trim(),
    message: text(input.message).trim().replace(/\r\n/g, "\n"),
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (!values.name) errors.name = "Please enter your name.";
  else if (values.name.length > limits.name) errors.name = "Please shorten your name.";

  if (!values.email) errors.email = "Please enter your business email.";
  else if (values.email.length > limits.email || !EMAIL.test(values.email))
    errors.email = "That email address doesn’t look right.";

  if (!values.company) errors.company = "Please enter your company name.";
  else if (values.company.length > limits.company)
    errors.company = "Please shorten the company name.";

  if (!needs.some((need) => need.id === values.need))
    errors.need = "Please choose the closest option.";

  if (!values.message) errors.message = "Please tell us a little about the project.";
  else if (values.message.length < limits.messageMin)
    errors.message = "A sentence or two will help us prepare.";
  else if (values.message.length > limits.messageMax)
    errors.message = `Please keep this under ${limits.messageMax.toLocaleString("en-US")} characters.`;

  return errors;
}

export function needLabel(id: string): string {
  return needs.find((need) => need.id === id)?.label ?? id;
}

export function intentLabel(intent: Intent): string {
  return intent === "quote" ? "Quote request" : "Consultation request";
}
