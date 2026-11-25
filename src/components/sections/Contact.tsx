import { ContactForm } from "@/components/contact/ContactForm";
import { Lines } from "@/components/ui/Lines";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { site } from "@/lib/site";

/** Section 09. One clear next step. */
export function Contact() {
  return (
    <section id="contact" data-header-theme="dark" className="theme-dark">
      <div className="shell section-y">
        <SectionLabel index="09">Contact</SectionLabel>
        <h2 className="display mt-10 md:mt-14">
          <Lines lines={["Let’s build", "what’s next."]} />
        </h2>

        <div className="mt-16 grid gap-x-6 gap-y-14 md:mt-28 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <p className="lead text-fg-soft" data-reveal>
              Tell us what you’re working on. We’ll help you explore what’s possible.
            </p>
            {site.contactEmail && (
              <p className="mt-10 flex flex-col gap-3" data-reveal>
                <span className="label">Or write to us</span>
                <a href={`mailto:${site.contactEmail}`} className="quiet-link self-start">
                  {site.contactEmail}
                </a>
              </p>
            )}
          </div>

          <div className="md:col-span-7 lg:col-span-6 lg:col-start-7" data-reveal>
            <ContactForm schedulingUrl={site.schedulingUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
