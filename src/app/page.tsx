import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { About } from "@/components/sections/About";
import { Approach } from "@/components/sections/Approach";
import { Contact } from "@/components/sections/Contact";
import { Expertise } from "@/components/sections/Expertise";
import { FAQ } from "@/components/sections/FAQ";
import { Founders } from "@/components/sections/Founders";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Practice } from "@/components/sections/Practice";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { Logo } from "@/components/site/Logo";
import { homeStructuredData } from "@/lib/structured-data";

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
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ScrollMotion />
      <JsonLd data={homeStructuredData()} />
    </>
  );
}
