import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "The terms that apply when you use the Nulle website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms"
      title="Website terms."
      updated="November 2026"
      intro="These terms cover your use of this website. Any work we do together is governed by a separate written agreement."
      sections={[
        {
          heading: "Using this website",
          body: (
            <p>
              This website describes Nulle and the services we offer. The information here is
              general and is not professional, legal, or technical advice for your particular
              situation.
            </p>
          ),
        },
        {
          heading: "Illustrative demonstrations",
          body: (
            <p>
              The interactive scenarios on this website are simplified, authored examples. They do
              not show client projects, and they are not a promise of specific results, security,
              confidentiality, or regulatory compliance. What a real system delivers depends on how
              it is designed, deployed, and governed.
            </p>
          ),
        },
        {
          heading: "Our content",
          body: (
            <p>
              The Nulle name and logo, and the text and design of this website, belong to Nulle.
              Please do not reuse them without our permission.
            </p>
          ),
        },
        {
          heading: "Other websites",
          body: (
            <p>
              This website may link to services run by other companies, such as a scheduling page.
              We are not responsible for their content or practices.
            </p>
          ),
        },
        {
          heading: "No warranty",
          body: (
            <p>
              We work to keep this website accurate and available, but it is provided as it is,
              without warranties of any kind. To the extent the law allows, Nulle is not liable for
              losses that result from relying on it.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              We may update these terms from time to time. The current version is always the one
              published on this page.
            </p>
          ),
        },
      ]}
    />
  );
}
