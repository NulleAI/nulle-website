/**
 * Authored content for the "Intelligence in Practice" demonstration.
 *
 * Everything here is illustrative and deterministic. No model is called
 * and no real business, person, or document is represented.
 */

export const scenarios = [
  {
    id: "receptionist",
    letter: "A",
    title: "AI Receptionist",
    short: "Receptionist",
    value: "Fewer missed opportunities, and less time spent managing routine calls.",
    note: "Illustrative demonstration. A simplified example, not a client project.",
  },
  {
    id: "workflow",
    letter: "B",
    title: "Intelligent Workflow",
    short: "Workflow",
    value: "Less repetitive work, and more time for the decisions that matter.",
    note: "Illustrative demonstration. A simplified example, not a client project.",
  },
  {
    id: "private",
    letter: "C",
    title: "Private AI",
    short: "Private AI",
    value: "Faster access to what your organization already knows, within a controlled environment.",
    note: "Illustrative demonstration, fictional documents. Real security and compliance depend on how each system is built and governed.",
  },
] as const;

export type ScenarioId = (typeof scenarios)[number]["id"];

/* ---------------------------------------------------------------- A */

export type TranscriptLine = {
  speaker: "ai" | "caller";
  text: string;
  /** What the system took from this line. Shown beneath it. */
  understood?: string;
};

export type CallRequest = {
  id: string;
  label: string;
  finalStep: string;
  lines: TranscriptLine[];
  outcome: { title: string; detail: string };
};

export const callRequests: CallRequest[] = [
  {
    id: "book",
    label: "Book a visit",
    finalStep: "Appointment scheduled",
    lines: [
      { speaker: "ai", text: "Thank you for calling. How can I help?" },
      {
        speaker: "caller",
        text: "Hi. I’d like to book a check-up sometime next week.",
        understood: "New appointment · Check-up · Next week",
      },
      {
        speaker: "ai",
        text: "Of course. I have Tuesday at 10:30 or Thursday at 2:00. Which suits you?",
      },
      { speaker: "caller", text: "Thursday at 2 works." },
      {
        speaker: "ai",
        text: "You’re booked for Thursday at 2:00 PM. I’ll send a confirmation by text.",
      },
    ],
    outcome: {
      title: "Appointment scheduled",
      detail: "Thursday, 2:00 PM · Calendar updated · Confirmation sent",
    },
  },
  {
    id: "hours",
    label: "Ask about hours",
    finalStep: "Question answered",
    lines: [
      { speaker: "ai", text: "Thank you for calling. How can I help?" },
      {
        speaker: "caller",
        text: "Are you open on Saturdays?",
        understood: "Question · Opening hours · Saturday",
      },
      {
        speaker: "ai",
        text: "We are, from 9:00 to 1:00 on Saturdays. Would you like me to book a time?",
      },
      { speaker: "caller", text: "Not today, thanks. That’s all I needed." },
      { speaker: "ai", text: "Glad to help. Have a good evening." },
    ],
    outcome: {
      title: "Question answered",
      detail: "No one interrupted · Call summary saved for the team",
    },
  },
  {
    id: "move",
    label: "Reschedule",
    finalStep: "Appointment moved",
    lines: [
      { speaker: "ai", text: "Thank you for calling. How can I help?" },
      {
        speaker: "caller",
        text: "I need to move my appointment on Friday.",
        understood: "Reschedule · Existing appointment · Friday",
      },
      {
        speaker: "ai",
        text: "No problem. I can offer Monday at 9:15 or Wednesday at 4:30.",
      },
      { speaker: "caller", text: "Monday, please." },
      { speaker: "ai", text: "Done. You’re now booked for Monday at 9:15 AM." },
    ],
    outcome: {
      title: "Appointment moved",
      detail: "Monday, 9:15 AM · Calendar updated · Friday slot released",
    },
  },
];

/* ---------------------------------------------------------------- B */

export const workflowTasks = [
  { title: "Incoming lead", before: "Waiting in an inbox", after: "Captured as it arrives" },
  { title: "Email response", before: "Written by hand", after: "Reply drafted for you" },
  { title: "Data entry", before: "Copied across by hand", after: "Recorded automatically" },
  { title: "Follow-up", before: "Easy to forget", after: "Scheduled" },
] as const;

export const workflowStatus = {
  before: "Four separate tasks, each waiting on someone.",
  after: "One connected flow, moving as work arrives.",
} as const;

export const workflowOutcome = {
  title: "Routine work handled",
  detail: "Your attention goes to the decisions only you can make",
} as const;

/* ---------------------------------------------------------------- C */

export type KnowledgeQuestion = {
  id: string;
  label: string;
  question: string;
  sources: { title: string; kind: string; match?: boolean }[];
  answer: string;
  citation: string;
};

export const knowledgeQuestions: KnowledgeQuestion[] = [
  {
    id: "onboarding",
    label: "Client onboarding",
    question: "What are the steps for onboarding a new client?",
    sources: [
      { title: "Client Intake Procedure", kind: "Policy · Section 2", match: true },
      { title: "Engagement Letter Template", kind: "Template" },
      { title: "Conflict Check Guidelines", kind: "Policy" },
    ],
    answer:
      "New clients go through three steps: a conflict check, a signed engagement letter, and an intake call within five business days.",
    citation: "Client Intake Procedure, section 2",
  },
  {
    id: "retention",
    label: "File retention",
    question: "How long do we keep closed client files?",
    sources: [
      { title: "Records Retention Policy", kind: "Policy · Section 4", match: true },
      { title: "File Closing Checklist", kind: "Checklist" },
      { title: "Data Handling Guidelines", kind: "Policy" },
    ],
    answer:
      "Closed client files are kept for seven years, then reviewed before secure disposal.",
    citation: "Records Retention Policy, section 4",
  },
  {
    id: "fees",
    label: "Fee approvals",
    question: "Who approves a fee adjustment above the standard rate?",
    sources: [
      { title: "Billing Guidelines", kind: "Policy · Section 3", match: true },
      { title: "Rate Card", kind: "Reference" },
      { title: "Engagement Letter Template", kind: "Template" },
    ],
    answer:
      "Adjustments above the standard rate need approval from the supervising partner before the invoice is issued.",
    citation: "Billing Guidelines, section 3",
  },
];
