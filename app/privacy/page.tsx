import type { Metadata } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/seo/DocumentShell";
import { JsonLd, pageOpenGraph, webPageJsonLd } from "@/lib/seo";

const TITLE = "Privacy — Digits of π";
const DESCRIPTION =
  "How Digits of π handles lookups: the first million digits are searched in your browser; deep search for 5–8 digit misses may send the query to independent third-party π search services via our server.";

export const metadata: Metadata = {
  title: "Privacy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: pageOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: "/privacy",
  }),
};

export default function PrivacyPage() {
  return (
    <DocumentShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/privacy",
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <article className="space-y-6 text-foreground">
        <header className="space-y-3">
          <p className="font-serif text-[11px] tracking-[0.18em] uppercase text-accent">
            Trust
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
            Privacy
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
            Digits of π is designed so everyday searches stay on your device.
            Deep search is optional and only used when a longer sequence is not
            found in the first million digits.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">What stays in your browser</h2>
          <p className="text-foreground/80 leading-relaxed">
            The file <code className="font-mono text-sm">/pi-digits.txt</code>{" "}
            (1,000,000 digits) is downloaded to your browser. Matching against
            that file happens locally with JavaScript. For those hits we do not
            need to send your number to our API or to any third-party search
            service. Canvas pan, zoom, and image export also run on your device.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">When a query leaves your device</h2>
          <p className="text-foreground/80 leading-relaxed">
            If your sequence has <strong>5 to 8 digits</strong> and is not found
            locally, the app sends that digit string to our server route{" "}
            <code className="font-mono text-sm">POST /api/pi-search</code>. The
            server may then query independent third-party π search services
            (angio.net, then PiSearch) and return the position and a small
            context window. Only the numeric query is required for that request
            — not your name, email, or account.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Those services are independent and operate under their own terms and
            infrastructure. Digits of π is not affiliated with them. We credit
            them in the UI when their data powers a result. See{" "}
            <Link
              href="/terms"
              className="text-accent underline-offset-4 hover:underline"
            >
              Terms
            </Link>{" "}
            for full third-party disclaimers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">What we do not do</h2>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
            <li>We do not require sign-in to search.</li>
            <li>
              We do not publish a public index of everyone’s searched numbers.
            </li>
            <li>
              We do not create separate SEO landing pages for each possible
              query.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Logs and hosting</h2>
          <p className="text-foreground/80 leading-relaxed">
            Like most websites, hosting providers may retain standard request
            logs (IP address, timestamp, URL path). Deep-search POSTs may appear
            in those logs. Avoid searching numbers you consider sensitive if you
            do not want them to transit the network.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Share links</h2>
          <p className="text-foreground/80 leading-relaxed">
            Optional share links use a <code className="font-mono text-sm">?n=</code>{" "}
            query parameter so someone else can open the same search. That
            parameter lives in the URL you choose to send; it is not a private
            channel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Learn more</h2>
          <p className="text-foreground/80 leading-relaxed">
            See{" "}
            <Link
              href="/how-it-works"
              className="text-accent underline-offset-4 hover:underline"
            >
              How it works
            </Link>{" "}
            for the full pipeline,{" "}
            <Link
              href="/terms"
              className="text-accent underline-offset-4 hover:underline"
            >
              Terms
            </Link>{" "}
            for usage rules, or return to the{" "}
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
