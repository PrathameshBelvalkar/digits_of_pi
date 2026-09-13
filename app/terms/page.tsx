import type { Metadata } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/seo/DocumentShell";
import { JsonLd, pageOpenGraph, webPageJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const TITLE = "Terms of Service — Digits of π";
const DESCRIPTION =
  "Terms for using Digits of π: educational use, no warranty, third-party search disclaimers, privacy pointer, and export guidelines.";

export const metadata: Metadata = {
  title: "Terms",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: pageOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: "/terms",
  }),
};

export default function TermsPage() {
  return (
    <DocumentShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/terms",
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <article className="space-y-6 text-foreground">
        <header className="space-y-3">
          <p className="font-serif text-[11px] tracking-[0.18em] uppercase text-accent">
            Legal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
            These terms describe how you may use {SITE_NAME}. They are a clear
            self-serve summary for this small educational project — not a
            substitute for professional legal advice.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Purpose</h2>
          <p className="text-foreground/80 leading-relaxed">
            {SITE_NAME} is an educational and recreational web app. You may
            search short digit sequences in π, explore the visualization, share
            results, and export images for personal, non-commercial use unless
            you have separate permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">No warranty</h2>
          <p className="text-foreground/80 leading-relaxed">
            The service is provided “as is,” without warranties of any kind —
            express or implied — including accuracy, availability, fitness for a
            particular purpose, or uninterrupted operation. Search results may
            be incomplete, delayed, or unavailable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Queries and limits</h2>
          <p className="text-foreground/80 leading-relaxed">
            Queries are limited to 3–8 digits. Local search covers the first
            million digits in your browser. Longer misses may use deep lookup.
            Do not use the tool to harass others, overload the service, or
            attempt unauthorized access to systems.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Third-party π search services</h2>
          <p className="text-foreground/80 leading-relaxed">
            For some deep lookups, {SITE_NAME} may contact independent
            third-party services such as{" "}
            <a
              href="https://www.angio.net/pi/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              The Pi-Search Page (angio.net)
            </a>{" "}
            and{" "}
            <a
              href="https://pisearch.joshkeegan.co.uk/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              PiSearch by Josh Keegan
            </a>{" "}
            through our <code className="font-mono text-sm">/api/pi-search</code>{" "}
            route.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            {SITE_NAME} is{" "}
            <strong>not affiliated with, sponsored by, endorsed by, or in
            partnership with</strong>{" "}
            those projects. They own their tools and data. Their own terms,
            policies, and availability may apply when their services are
            contacted. When a result comes from one of them, we show credit in
            the UI.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Privacy</h2>
          <p className="text-foreground/80 leading-relaxed">
            How local vs remote lookup works is described on the{" "}
            <Link
              href="/privacy"
              className="text-accent underline-offset-4 hover:underline"
            >
              Privacy
            </Link>{" "}
            page. Hosting providers may keep standard request logs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Exports and sharing</h2>
          <p className="text-foreground/80 leading-relaxed">
            PNG and SVG exports are generated on your device for personal
            non-commercial use by default. You are responsible for how you share
            screenshots, downloads, and share links (including{" "}
            <code className="font-mono text-sm">?n=</code> URLs).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Limitation of liability</h2>
          <p className="text-foreground/80 leading-relaxed">
            To the fullest extent permitted by law, the operators of {SITE_NAME}{" "}
            are not liable for any indirect, incidental, special, consequential,
            or punitive damages, or any loss of data, profits, or goodwill,
            arising from your use of the site or reliance on search results.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Changes</h2>
          <p className="text-foreground/80 leading-relaxed">
            These terms may be updated from time to time. Continued use of the
            site after changes are posted constitutes acceptance of the updated
            terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Learn more</h2>
          <p className="text-foreground/80 leading-relaxed">
            See{" "}
            <Link
              href="/about"
              className="text-accent underline-offset-4 hover:underline"
            >
              About
            </Link>
            ,{" "}
            <Link
              href="/privacy"
              className="text-accent underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
            , or return to the{" "}
            <Link
              href="/"
              className="text-accent underline-offset-4 hover:underline"
            >
              search tool
            </Link>
            .
          </p>
        </section>
      </article>
    </DocumentShell>
  );
}
