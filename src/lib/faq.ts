import { apps, company, engagement, site } from "@/lib/site";

/**
 * Questions people ask about Nulle, answered in plain sentences.
 *
 * The homepage shows these and the FAQPage structured data repeats them
 * word for word, which is what search engines expect. Every answer comes
 * from facts stated elsewhere on the site or confirmed by Nulle; add
 * nothing here that the business has not said.
 */

const writeToUs = site.contactEmail ? `, or email ${site.contactEmail}` : "";
const appNames = apps.map((app) => app.name).join(" and ");

export const faq = [
  {
    question: "What does Nulle do?",
    answer: `${company.summary} We design and build intelligent solutions that simplify how businesses work: AI agents and automation, AI strategy and consulting, private AI and infrastructure, and custom software and mobile apps.`,
  },
  {
    question: "Where is Nulle based, and who do you work with?",
    answer: `Nulle is based in ${company.basedIn}, and works with businesses across ${company.serves}, including teams that handle confidential information, such as law firms and healthcare practices.`,
  },
  {
    question: "Who founded Nulle?",
    answer: `Nulle was founded in ${company.foundingYear} by Jerry Cox and Rahiem Klugh, two software engineers who have shipped enterprise software since 2011, with 30 years of combined experience. Jerry leads product and engineering. Rahiem leads strategy and partnerships.`,
  },
  {
    question: "How does working with Nulle start?",
    answer: `Every engagement starts with a free ${engagement.consultationMinutes}-minute consultation. We use it to learn how your business actually works, so what we recommend is based on accurate information. Book one through the contact form${writeToUs}.`,
  },
  {
    question: "How long does a project take?",
    answer: `Typical timelines run ${engagement.typicalTimeline}. The exact timeline is set during the consultation and depends on the scope of work.`,
  },
  {
    question: "How much does it cost?",
    answer: `Pricing depends on the scope of work. We set a starting price after the free ${engagement.consultationMinutes}-minute consultation, once we understand what you need.`,
  },
  {
    question: "What is private AI?",
    answer:
      "Private AI is AI that works with your own knowledge, in an environment you control: private AI assistants, internal knowledge systems, and controlled AI deployments. It is designed for teams that handle confidential information, such as law firms and healthcare practices.",
  },
  {
    question: "Can Nulle set up an AI receptionist for my business?",
    answer:
      "Yes. AI receptionists are part of our AI agents and automation work, alongside customer support agents, automated scheduling, lead qualification, and business process automation. Calls are answered, questions handled, and appointments booked, without adding to your team’s day.",
  },
  {
    question: "Do you build iOS and Android apps?",
    answer: `Yes. We build native iOS and Android apps, custom business apps, consumer digital products, AI integrations, and internal platforms. Our own apps on the App Store include ${appNames}.`,
  },
] as const;
