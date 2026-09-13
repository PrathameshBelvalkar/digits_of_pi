import type { Metadata } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/seo/DocumentShell";
import { articleJsonLd, JsonLd, webPageJsonLd } from "@/lib/seo";

const TITLE = "Find your birthday in the digits of π";
const DESCRIPTION =
  "Search your birthday or birth year in π. Digits of π flies the canvas to the first matching digits and lets you share or save the result.";
const PUBLISHED = "2026-09-13";

export const metadata: Metadata = {
  title: "Birthday in π",
  description: DESCRIPTION,
  alternates: { canonical: "/birthday-in-pi" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/birthday-in-pi",
  },
};

export default function BirthdayInPiPage() {
  return (
    <DocumentShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/birthday-in-pi",
            name: TITLE,
            description: DESCRIPTION,
          }),
          articleJsonLd({
            path: "/birthday-in-pi",
            headline: TITLE,
            description: DESCRIPTION,
            datePublished: PUBLISHED,
          }),
        ]}
      />
      <article className="space-y-6 text-foreground">
        <header className="space-y-3">
          <p className="font-serif text-[11px] tracking-[0.18em] uppercase text-accent">
            Popular search
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
            {TITLE}
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
            Your birthday is a short string of digits. Somewhere in the endless
            expansion of π, that string almost certainly appears. Digits of π
            finds the first match and shows it on a living spiral of colored
            digits — a shareable slice of the constant with your number marked.
          </p>
          <p>
            <Link
              href="/?n=314"
              className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Search a birthday now
            </Link>
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">How to encode a birthday</h2>
          <p className="text-foreground/80 leading-relaxed">
            Use digits only — no dashes or slashes. Common patterns:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
            <li>
              <strong>Month + day</strong> — March 14 becomes{" "}
              <span className="font-mono text-accent">0314</span> or{" "}
              <span className="font-mono text-accent">314</span>.
            </li>
            <li>
              <strong>Day + month</strong> — if you write dates that way, keep
              your usual order so the sequence feels personal.
            </li>
            <li>
              <strong>Year</strong> —{" "}
              <span className="font-mono text-accent">1998</span>,{" "}
              <span className="font-mono text-accent">2001</span>, and similar
              four-digit years.
            </li>
            <li>
              <strong>Full short date</strong> — up to 8 digits, for example{" "}
              <span className="font-mono text-accent">03141998</span>.
            </li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            The tool accepts 3–8 digits. Shorter queries appear sooner in π;
            longer ones may need deep search beyond the first million digits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">What “found at digit N” means</h2>
          <p className="text-foreground/80 leading-relaxed">
            The index is the position after the decimal point where your
            sequence begins. Digit 1 is the first digit after the point (the
            “1” in 3.14159…). If the result says digit 1,592, your birthday
            string starts 1,592 digits into π. The canvas flies there and
            highlights the match so you can see the neighboring digits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Sharing without spammy URLs</h2>
          <p className="text-foreground/80 leading-relaxed">
            After a find, use Share to copy a short message plus a link like{" "}
            <code className="font-mono text-sm">/?n=0314</code>. That parameter
            only pre-fills a search; search engines should treat the canonical
            page as the homepage. We intentionally do{" "}
            <strong>not</strong> create a separate public page for every
            possible birthday — that would be thin, repetitive content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Pi Day and beyond</h2>
          <p className="text-foreground/80 leading-relaxed">
            March 14 (3/14) is a natural day to explore π, but any date works.
            Try an anniversary year, a house number, or a lucky sequence. For
            the technical pipeline behind local and deep search, read{" "}
            <Link
              href="/how-it-works"
              className="text-accent underline-offset-4 hover:underline"
            >
              How it works
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Open the tool</h2>
          <p className="text-foreground/80 leading-relaxed">
            Ready to look?{" "}
            <Link
              href="/"
              className="text-accent underline-offset-4 hover:underline"
            >
              Find your number in π
            </Link>
            .
          </p>
        </section>
      </article>
    </DocumentShell>
  );
}
