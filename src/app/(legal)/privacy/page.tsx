import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/site/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Nulle handles the information you share through this website.",
  alternates: { canonical: "/privacy" },
};

const reachUs = site.contactEmail ? (
  <>
    email{" "}
    <a href={`mailto:${site.contactEmail}`} className="quiet-link">
      {site.contactEmail}
    </a>
  </>
) : (
  <>
    use the{" "}
    <Link href="/#contact" className="quiet-link">
      contact form
    </Link>
  </>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Privacy notice."
      updated="November 2026"
      intro="We collect as little as we can, and only what we need to reply to you. This notice explains what that is and what we do with it."
      sections={[
        {
          heading: "What we collect",
          body: (
            <>
              <p>
                When you send a request through the contact form, we receive what you enter: your
                name, business email, company name, the kind of help you are looking for, and your
                project description.
              </p>
              <p>
                To protect the form from abuse, the server briefly reads the network address a
                request comes from in order to limit repeated submissions. It is held in memory for
                a few minutes and is not saved with your request.
              </p>
            </>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <>
              <p>
                We use your details to respond to your request and, if you choose to go further, to
                discuss and plan work together. We do not sell your information or use it for
                advertising.
              </p>
            </>
          ),
        },
        {
          heading: "Cookies and tracking",
          body: (
            <p>
              This website does not set cookies and does not use analytics or advertising trackers.
            </p>
          ),
        },
        {
          heading: "Services we rely on",
          body: (
            <>
              <p>
                Requests are delivered to us through service providers that process them on our
                behalf, such as an email delivery service and our hosting provider.
              </p>
              <p>
                If you follow a link to book a time, the booking takes place on a separate
                scheduling service, which has its own privacy terms.
              </p>
            </>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              We keep your request for as long as it takes to respond and to continue any
              conversation that follows. You can ask us to delete it at any time.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              To see, correct, or delete the information you have shared with us, {reachUs}. We
              will respond as soon as we reasonably can.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              If this notice changes, the updated version will be published on this page with a new
              date.
            </p>
          ),
        },
      ]}
    />
  );
}
