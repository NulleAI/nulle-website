import { faq } from "@/lib/faq";
import { founders } from "@/lib/founders";
import { services } from "@/lib/services";
import { address, apps, company, engagement, site } from "@/lib/site";

/**
 * /llms.txt: a plain Markdown summary of Nulle for AI assistants, in the
 * format proposed at llmstxt.org. Built from the same data as the pages,
 * and prerendered at build time because it reads nothing at request time.
 */
function body(): string {
  const contact = site.contactEmail
    ? `${site.contactEmail}, or the contact form at ${site.url}/#contact`
    : `the contact form at ${site.url}/#contact`;

  return [
    `# ${site.name}`,
    "",
    `> ${company.summary} ${site.description}`,
    "",
    `- Legal name: ${company.legalName}`,
    `- Founded: ${company.foundingYear}, in ${company.basedIn}`,
    `- Serves: ${company.serves}`,
    `- Website: ${site.url}/`,
    `- Contact: ${contact}`,
    `- Mailing address: ${address.street}, ${address.unit}, ${address.locality}, ${address.region} ${address.postalCode}`,
    "",
    "## Services",
    "",
    ...services.map(
      (service) => `- [${service.title}](${site.url}/#expertise): ${service.summary} Includes: ${service.includes.join(", ")}.`,
    ),
    "",
    "## Working with Nulle",
    "",
    `- Every engagement starts with a free ${engagement.consultationMinutes}-minute consultation: ${site.url}/#contact`,
    `- Typical timelines run ${engagement.typicalTimeline}, set during the consultation and depending on the scope of work.`,
    "- Pricing depends on the scope of work and is set after the consultation.",
    "",
    "## Founders",
    "",
    ...founders.map(
      (founder) => `- [${founder.name}](${site.url}/founders), ${founder.role}: ${founder.summary} LinkedIn: ${founder.profile}`,
    ),
    "",
    "## Apps by Nulle",
    "",
    ...apps.map((app) => `- [${app.name}](${app.url}): ${app.summary}`),
    "",
    "## Questions",
    "",
    ...faq.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## Pages",
    "",
    `- [Home](${site.url}/): services, examples, approach, founders, FAQ, and contact`,
    `- [Founders](${site.url}/founders): Jerry Cox and Rahiem Klugh`,
    `- [Privacy](${site.url}/privacy)`,
    `- [Terms](${site.url}/terms)`,
    "",
  ].join("\n");
}

export function GET() {
  return new Response(body(), {
    // Markdown, served as plain text: what most crawlers and browsers expect from a .txt file.
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
