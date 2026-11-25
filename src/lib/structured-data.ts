import { faq } from "@/lib/faq";
import { founders, type Founder } from "@/lib/founders";
import { services } from "@/lib/services";
import { address, apps, company, site } from "@/lib/site";

/**
 * schema.org structured data, as one connected graph per page.
 *
 * Nodes refer to each other by `@id`, so search engines and AI systems
 * read Nulle, its founders, services, and apps as one entity rather than
 * as loose facts. Everything is built from the same data the page shows.
 */

const id = {
  organization: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  home: `${site.url}/#webpage`,
  faq: `${site.url}/#faq`,
  foundersPage: `${site.url}/founders#webpage`,
  person: (founder: Founder) => `${site.url}/founders#${slug(founder.name)}`,
  service: (serviceId: string) => `${site.url}/#service-${serviceId}`,
  app: (name: string) => `${site.url}/#app-${slug(name)}`,
};

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const absolute = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

const areaServed = [
  {
    "@type": "City",
    name: "Atlanta",
    containedInPlace: { "@type": "State", name: "Georgia" },
  },
  { "@type": "Place", name: "Southeastern United States" },
];

/** The company. `withServices` adds the catalog, whose Service nodes appear only in the homepage graph. */
function organization({ withServices = true } = {}) {
  return {
    "@type": "Organization",
    "@id": id.organization,
    name: site.name,
    legalName: company.legalName,
    alternateName: company.alternateName,
    url: `${site.url}/`,
    logo: { "@type": "ImageObject", url: `${site.url}/icon.png`, width: 512, height: 512 },
    slogan: site.tagline,
    description: `${company.summary} ${site.description}`,
    foundingDate: company.foundingYear,
    foundingLocation: { "@type": "Place", name: company.basedIn },
    founder: founders.map((founder) => ({ "@id": id.person(founder) })),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${address.street}, ${address.unit}`,
      addressLocality: address.locality,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: "US",
    },
    areaServed,
    ...(site.contactEmail ? { email: site.contactEmail } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: `${site.url}/#contact`,
      ...(site.contactEmail ? { email: site.contactEmail } : {}),
      areaServed,
      availableLanguage: "English",
    },
    sameAs: [site.instagramUrl],
    knowsAbout: [
      "Artificial intelligence consulting",
      "AI agents and automation",
      "AI receptionists",
      "AI strategy",
      "Private AI infrastructure",
      "Custom software development",
      "iOS and Android app development",
    ],
    ...(withServices
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "AI consulting and engineering services",
            itemListElement: services.map((service) => ({
              "@type": "Offer",
              itemOffered: { "@id": id.service(service.id) },
            })),
          },
        }
      : {}),
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": id.website,
    url: `${site.url}/`,
    name: site.name,
    alternateName: company.alternateName,
    publisher: { "@id": id.organization },
    inLanguage: "en-US",
  };
}

function serviceNodes() {
  return services.map((service) => ({
    "@type": "Service",
    "@id": id.service(service.id),
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url: `${site.url}/#expertise`,
    provider: { "@id": id.organization },
    areaServed,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.title,
      itemListElement: service.includes.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  }));
}

function appNodes() {
  return apps.map((app) => ({
    "@type": "MobileApplication",
    "@id": id.app(app.name),
    name: app.name,
    description: app.summary,
    operatingSystem: "iOS",
    url: app.url,
    installUrl: app.url,
    publisher: { "@id": id.organization },
    author: { "@id": id.organization },
  }));
}

function person(founder: Founder) {
  return {
    "@type": "Person",
    "@id": id.person(founder),
    name: founder.name,
    jobTitle: founder.role,
    description: founder.bio,
    image: absolute(founder.portrait.src),
    url: `${site.url}/founders`,
    worksFor: { "@id": id.organization },
    knowsAbout: founder.focus,
    sameAs: [founder.profile],
  };
}

function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** The homepage: the company, its site, services, apps, founders, and FAQ. */
export function homeStructuredData() {
  return graph([
    organization(),
    website(),
    {
      "@type": "WebPage",
      "@id": id.home,
      url: `${site.url}/`,
      name: `${site.name} — ${site.tagline}`,
      description: site.description,
      isPartOf: { "@id": id.website },
      about: { "@id": id.organization },
      inLanguage: "en-US",
    },
    ...serviceNodes(),
    ...appNodes(),
    ...founders.map(person),
    {
      "@type": "FAQPage",
      "@id": id.faq,
      url: `${site.url}/#faq`,
      isPartOf: { "@id": id.website },
      about: { "@id": id.organization },
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ]);
}

/** The founders page: who they are, and the company they built. */
export function foundersStructuredData() {
  return graph([
    {
      "@type": "AboutPage",
      "@id": id.foundersPage,
      url: `${site.url}/founders`,
      name: `Founders — ${site.name}`,
      isPartOf: { "@id": id.website },
      about: { "@id": id.organization },
      mainEntity: founders.map((founder) => ({ "@id": id.person(founder) })),
      inLanguage: "en-US",
    },
    ...founders.map(person),
    organization({ withServices: false }),
    website(),
  ]);
}

/** Serialize for a <script type="application/ld+json">, with `<` escaped so no tag can close it early. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
