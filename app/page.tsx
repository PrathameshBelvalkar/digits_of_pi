import type { Metadata } from "next";
import { PiApp } from "@/components/PiApp";
import { JsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TAGLINE },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/",
          name: SITE_TAGLINE,
          description: SITE_DESCRIPTION,
        })}
      />
      <PiApp />
    </>
  );
}
