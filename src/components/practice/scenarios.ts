/**
 * Authored content for "See what's possible".
 *
 * Everything here is illustrative and deterministic. No model is called
 * and no real business, person, document, or app is represented.
 */

const NOTE = "Illustrative demonstration. A simplified example, not a client project.";

export const demos = [
  {
    id: "receptionist",
    label: "AI Receptionist",
    title: "Every call answered, even after hours.",
    summary:
      "A customer calls after you’ve closed. The AI receptionist answers, helps, and books the appointment.",
    note: NOTE,
  },
  {
    id: "automation",
    label: "Automation",
    title: "The busywork, handled.",
    summary:
      "A new lead arrives. The reply, the CRM record, and the follow-up happen on their own.",
    note: NOTE,
  },
  {
    id: "private",
    label: "Private AI",
    title: "Answers from your own documents.",
    summary:
      "Your team asks in plain words. The answer comes only from approved company documents, with its source attached.",
    note: "Illustrative demonstration with fictional documents. Real security and compliance depend on how each system is built and governed.",
  },
  {
    id: "mobile",
    label: "Mobile Apps",
    title: "Your idea. Beautifully built.",
    summary: "Custom iOS and Android applications engineered around your business and your customers.",
    note: "Illustrative concept, not a delivered client app.",
  },
] as const;

export type DemoId = (typeof demos)[number]["id"];

export const demoById = <T extends DemoId>(id: T) =>
  demos.find((demo) => demo.id === id) as Extract<(typeof demos)[number], { id: T }>;

/* ------------------------------------------------- AI Receptionist */

export type Call = {
  lines: { speaker: "caller" | "ai"; text: string }[];
  result: { title: string; detail: string; note: string };
};

export const calls: Call[] = [
  {
    lines: [
      { speaker: "caller", text: "Hi, I’d like to book a check-up next week." },
      { speaker: "ai", text: "Of course. I have Thursday at 2:00 PM. Does that work?" },
      { speaker: "caller", text: "Perfect, thank you." },
    ],
    result: {
      title: "Appointment booked",
      detail: "Thursday, 2:00 PM · Check-up",
      note: "Confirmation sent by text",
    },
  },
  {
    lines: [
      { speaker: "caller", text: "I need to move my appointment on Friday." },
      { speaker: "ai", text: "No problem. I can offer Monday at 9:15 AM." },
      { speaker: "caller", text: "Monday works. Thanks." },
    ],
    result: {
      title: "Appointment moved",
      detail: "Monday, 9:15 AM",
      note: "Calendar updated · Friday slot released",
    },
  },
  {
    lines: [
      { speaker: "caller", text: "Are you open on Saturdays?" },
      { speaker: "ai", text: "We are, from 9:00 AM to 1:00 PM. Shall I book a time?" },
      { speaker: "caller", text: "Not today, that’s all I needed." },
    ],
    result: {
      title: "Question answered",
      detail: "Saturday hours shared",
      note: "Call summary saved for your team",
    },
  },
];

/* ------------------------------------------------------ Automation */

export const automationSteps = [
  { title: "New lead received", detail: "A website enquiry from Alex Rivera" },
  { title: "Personalized reply prepared", detail: "Answers the question and suggests a time" },
  { title: "Added to your CRM", detail: "Contact, source and notes recorded" },
  { title: "Follow-up scheduled", detail: "A reminder for Tuesday, 10:00 AM" },
] as const;

export const automationOutcome = {
  title: "Handled automatically",
  detail: "Nothing to copy, paste, or remember. Ready for your review.",
} as const;

/* ------------------------------------------------------ Private AI */

export type KnowledgeQuestion = {
  question: string;
  sources: { title: string; kind: string; match?: boolean }[];
  answer: string;
  citation: string;
};

export const knowledgeQuestions: KnowledgeQuestion[] = [
  {
    question: "What is our client onboarding process?",
    sources: [
      { title: "Client Intake Procedure", kind: "Policy", match: true },
      { title: "Engagement Letter Template", kind: "Template" },
      { title: "Conflict Check Guidelines", kind: "Policy" },
    ],
    answer:
      "Three steps: a conflict check, a signed engagement letter, then an intake call within five business days.",
    citation: "Client Intake Procedure, section 2",
  },
  {
    question: "How long do we keep closed client files?",
    sources: [
      { title: "Records Retention Policy", kind: "Policy", match: true },
      { title: "File Closing Checklist", kind: "Checklist" },
      { title: "Data Handling Guidelines", kind: "Policy" },
    ],
    answer: "Seven years. Files are then reviewed before secure disposal.",
    citation: "Records Retention Policy, section 4",
  },
  {
    question: "Who approves a fee above the standard rate?",
    sources: [
      { title: "Billing Guidelines", kind: "Policy", match: true },
      { title: "Rate Card", kind: "Reference" },
      { title: "Engagement Letter Template", kind: "Template" },
    ],
    answer: "The supervising partner, before the invoice is issued.",
    citation: "Billing Guidelines, section 3",
  },
];
