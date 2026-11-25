/**
 * What Nulle offers. The Expertise section shows these; the structured
 * data and /llms.txt describe the same four services from this list, so
 * the page and what search engines read never drift apart.
 *
 * `id` matches the "need" options in the contact form.
 */
export const services = [
  {
    id: "agents",
    index: "01",
    title: "AI Agents & Automation",
    summary:
      "Calls answered, questions handled, and appointments booked, without adding to your team’s day.",
    includes: [
      "AI receptionists",
      "Customer support agents",
      "Automated scheduling",
      "Lead qualification",
      "Business process automation",
    ],
  },
  {
    id: "strategy",
    index: "02",
    title: "AI Strategy & Consulting",
    summary:
      "We look at how your business really runs, find where AI will make a difference, and give you a practical plan to get there.",
    includes: [
      "Operations review",
      "Opportunity mapping",
      "Workflow improvement",
      "Implementation planning",
    ],
  },
  {
    id: "private-ai",
    index: "03",
    title: "Private AI & Infrastructure",
    summary:
      "AI that works with your own knowledge, in an environment you control. Designed for teams that handle confidential information, such as law firms and healthcare practices.",
    includes: [
      "Private AI assistants",
      "Internal knowledge systems",
      "Controlled AI deployments",
    ],
  },
  {
    id: "software",
    index: "04",
    title: "Custom Software & Mobile Apps",
    summary:
      "From intelligent business tools to beautifully engineered iOS and Android applications, we turn ambitious ideas into production-ready software.",
    includes: [
      "Native iOS & Android apps",
      "Custom business apps",
      "Consumer digital products",
      "AI integrations",
      "Internal platforms",
    ],
    platforms: true,
  },
] as const;
