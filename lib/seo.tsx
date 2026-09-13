import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
  };
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_TAGLINE,
    url: absoluteUrl("/"),
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    description: SITE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function webPageJsonLd(input: {
  path: string;
  name: string;
  description: string;
  type?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}

export function articleJsonLd(input: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
