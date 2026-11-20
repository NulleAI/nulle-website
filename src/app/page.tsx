import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { About } from "@/components/sections/About";
import { Approach } from "@/components/sections/Approach";
import { Contact } from "@/components/sections/Contact";
import { Expertise } from "@/components/sections/Expertise";
import { Founders } from "@/components/sections/Founders";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Practice } from "@/components/sections/Practice";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";
import { address, site } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  slogan: site.tagline,
  description: site.description,
  logo: `${site.url}/icon.png`,
  ...(site.contactEmail ? { email: site.contactEmail } : {}),
  address: {
    "@type": "PostalAddress",
    streetAddress: `${address.street}, ${address.unit}`,
    addressLocality: address.locality,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressCountry: "US",
  },
  knowsAbout: [
    "Artificial intelligence consulting",
    "AI agents and automation",
    "Private AI infrastructure",
    "Custom software development",
  ],
};

export default function Home() {
  return (
    <>
      <a href="#main" className="btn btn-primary btn-sm skip-link">
        Skip to content
      </a>
      <Header logo={<Logo priority />} />
      <main id="main">
        <Hero />
        <Philosophy />
        <Expertise />
        <Practice />
        <Approach />
        <About />
        <Founders />
        <Contact />
      </main>
      <Footer />
      <ScrollMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
