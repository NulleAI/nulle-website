"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";

import { requestFormToken, submitContact } from "@/app/actions/contact";
import { Arrow } from "@/components/ui/Arrow";
import {
  emptyValues,
  fieldOrder,
  intents,
  limits,
  needs,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactState,
  type ContactValues,
} from "@/lib/contact/schema";

type ContactFormProps = {
  /** Public booking page. When set, visitors can pick a time themselves. */
  schedulingUrl: string | null;
};

const initialState: ContactState = { status: "idle" };

export function ContactForm({ schedulingUrl }: ContactFormProps) {
  const id = useId();
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [token, setToken] = useState("");

  // When the server answers, its field errors replace whatever was showing.
  const [answered, setAnswered] = useState(state);
  if (state !== answered) {
    setAnswered(state);
    if (state.status === "invalid") setErrors(state.errors);
  }

  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const tokenRequested = useRef(false);

  // The form asks for its signed token as soon as it nears the screen,
  // so a real visitor always has one, and it is always a few seconds old
  // by the time they send. Focus and touch are a fallback.
  const requestToken = () => {
    if (tokenRequested.current) return;
    tokenRequested.current = true;
    requestFormToken()
      .then(setToken)
      .catch(() => {
        tokenRequested.current = false;
      });
  };

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          requestToken();
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  // After a response: move focus somewhere useful. A token is only
  // renewed if the server could not verify the one it was sent.
  useEffect(() => {
    if (state.status === "success") confirmationRef.current?.focus();
    if (state.status === "invalid") focusFirstInvalid(formRef.current, state.errors);
    if (state.status === "error" && state.reason === "unverified") {
      tokenRequested.current = false;
      requestToken();
    }
  }, [state]);

  const update = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== "intent") setErrors((current) => ({ ...current, [field]: undefined }));
  };

  // Submission is dispatched by hand rather than through the form's
  // `action`, so React does not reset the fields when the server answers
  // and a visitor never has to retype anything after an error.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const found = validateContact({
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      company: values.company.trim(),
      message: values.message.trim(),
    });
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstInvalid(formRef.current, found);
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  if (state.status === "success") {
    return (
      <Confirmation
        ref={confirmationRef}
        state={state}
        email={values.email}
        schedulingUrl={schedulingUrl}
      />
    );
  }

  const describe = (field: ContactField) => (errors[field] ? `${id}-${field}-error` : undefined);
  const showScheduling = schedulingUrl && values.intent === "consultation";

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      onFocusCapture={requestToken}
      onPointerDownCapture={requestToken}
      noValidate
      aria-label="Contact Nulle"
      className="flex flex-col gap-9"
    >
      {/* Request type: the section's two calls to action */}
      <fieldset>
        <legend className="label">I’d like to</legend>
        <div className="mt-4 flex gap-2.5">
          {intents.map((intent) => (
            <label
              key={intent.id}
              className="btn flex-1 border border-line-strong px-3 text-[0.875rem] text-fg-soft sm:flex-none sm:px-6 sm:text-[0.9375rem] has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-[var(--focus)] hover:border-fg hover:text-fg has-[:checked]:hover:text-bg"
            >
              <input
                type="radio"
                name="intent"
                value={intent.id}
                checked={values.intent === intent.id}
                onChange={() => update("intent", intent.id)}
                className="sr-only"
              />
              {intent.label}
            </label>
          ))}
        </div>
        {showScheduling && (
          <p className="mt-5 text-[0.9375rem] text-fg-mute">
            Prefer to choose a time now?{" "}
            <a href={schedulingUrl} target="_blank" rel="noreferrer" className="quiet-link">
              Open our calendar
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}
      </fieldset>

      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Name" error={errors.name} errorId={`${id}-name-error`}>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={limits.name}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            className="field-input"
          />
        </Field>

        <Field
          id={`${id}-email`}
          label="Business email"
          error={errors.email}
          errorId={`${id}-email-error`}
        >
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={limits.email}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
            className="field-input"
          />
        </Field>

        <Field
          id={`${id}-company`}
          label="Company name"
          error={errors.company}
          errorId={`${id}-company-error`}
        >
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            required
            maxLength={limits.company}
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describe("company")}
            className="field-input"
          />
        </Field>

        <Field
          id={`${id}-need`}
          label="What you need help with"
          error={errors.need}
          errorId={`${id}-need-error`}
        >
          <select
            id={`${id}-need`}
            name="need"
            required
            value={values.need}
            onChange={(event) => update("need", event.target.value)}
            aria-invalid={Boolean(errors.need)}
            aria-describedby={describe("need")}
            className={`field-input ${values.need ? "" : "!text-fg-mute"}`}
          >
            <option value="" disabled>
              Choose one
            </option>
            {needs.map((need) => (
              <option key={need.id} value={need.id}>
                {need.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field
            id={`${id}-message`}
            label="Brief project description"
            error={errors.message}
            errorId={`${id}-message-error`}
          >
            <textarea
              id={`${id}-message`}
              name="message"
              required
              rows={4}
              maxLength={limits.messageMax}
              value={values.message}
              onChange={(event) => update("message", event.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describe("message")}
              placeholder="What are you trying to improve, and what does success look like?"
              className="field-input"
            />
          </Field>
        </div>
      </div>

      {/* Spam checks. The first is hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="nulle_reference" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="token" value={token} readOnly />

      <div className="flex flex-col gap-6">
        {state.status === "error" && (
          <p role="alert" className="border-l-2 border-alert pl-4 text-[0.9375rem] text-alert">
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <button type="submit" disabled={pending} className="btn btn-primary min-w-[10.5rem]">
            {pending ? (
              "Sending…"
            ) : (
              <>
                Send Request
                <Arrow />
              </>
            )}
          </button>
          <p className="max-w-[34ch] text-[0.8125rem] leading-snug text-fg-mute">
            Your details are used only to respond to your request. See our{" "}
            <Link href="/privacy" className="quiet-link">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </div>
    </form>
  );
}

function focusFirstInvalid(form: HTMLFormElement | null, found: ContactErrors) {
  const first = fieldOrder.find((field) => found[field]);
  if (first) form?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  errorId: string;
  children: React.ReactNode;
};

function Field({ id, label, error, errorId, children }: FieldProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      <p
        id={errorId}
        aria-live="polite"
        className={`text-[0.8125rem] leading-snug text-alert ${error ? "mt-2.5" : ""}`}
      >
        {error}
      </p>
    </div>
  );
}

type ConfirmationProps = {
  ref: React.Ref<HTMLDivElement>;
  state: Extract<ContactState, { status: "success" }>;
  email: string;
  schedulingUrl: string | null;
};

function Confirmation({ ref, state, email, schedulingUrl }: ConfirmationProps) {
  const firstName = state.name.split(" ")[0];
  const consultation = state.intent === "consultation";
  const logged = state.delivery === "logged";

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="flex flex-col items-start gap-6 border-t border-line-strong pt-8 outline-none"
    >
      <p className="label flex items-center gap-3">
        <span aria-hidden="true" className="accent-fill block size-[7px] rounded-full" />
        {logged ? "Validated, not sent" : "Request received"}
      </p>

      <h3 className="title">{logged ? "The form works." : `Thank you, ${firstName}.`}</h3>

      {logged ? (
        <p className="max-w-[46ch] text-fg-soft">
          This is a development build with no delivery integration configured. Your request passed
          every check and was written to the server log, but no email was sent and nothing was
          booked. See the README to connect email or a webhook.
        </p>
      ) : (
        <p className="max-w-[46ch] text-fg-soft">
          {consultation
            ? `Your consultation request is with us. We’ll reply to ${email.trim()} to arrange a time.`
            : `Your quote request is with us. We’ll reply to ${email.trim()} with next steps.`}
        </p>
      )}

      {!logged && consultation && schedulingUrl && (
        <a href={schedulingUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
          Choose a Time Now
          <Arrow direction="up-right" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}
