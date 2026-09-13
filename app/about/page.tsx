import type { Metadata } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/seo/DocumentShell";
import { JsonLd, webPageJsonLd } from "@/lib/seo";

const TITLE = "About Digits of π";
const DESCRIPTION =
  "Digits of π is an educational web app that finds numbers in π and visualizes them on a concentric-ring canvas, with credits to deep-search partners.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <DocumentShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/about",
          name: TITLE,
          description: DESCRIPTION,
          type: "AboutPage",
        })}
      />
      <article className="space-y-6 text-foreground">
        <header className="space-y-3">
          <p className="font-serif text-[11px] tracking-[0.18em] uppercase text-accent">
            Project
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
            {TITLE}
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
            Digits of π turns a familiar curiosity — “is my number inside π?” —
            into something you can see. Search a short digit string, then watch
            the canvas travel along a spiral of colored digits to the first
            match.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">What this project is</h2>
          <p className="text-foreground/80 leading-relaxed">
            It is a free educational WebApplication built with Next.js. The
            primary experience is client-side: one million digits of π load into
            the browser for instant lookup and visualization. Explore mode lets
            you pan the spiral without a specific query. Search mode focuses on
            finding and highlighting a sequence.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">What this project is not</h2>
          <p className="text-foreground/80 leading-relaxed">
            It is not a proof of mathematical normality, not a substitute for
            research-grade digit archives, and not a service that stores your
            searches as a public catalog. Deep results rely on external experts
            who maintain much larger digit databases.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Credits and sources</h2>
          <p className="text-foreground/80 leading-relaxed">
            When a number is missing from the first million digits, Digits of π
            may query:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
            <li>
              <a
                href="https://www.angio.net/pi/"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline"
              >
                The Pi-Search Page (angio.net)
              </a>
            </li>
            <li>
              <a
                href="https://pisearch.joshkeegan.co.uk/"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline"
              >
                PiSearch by Josh Keegan
              </a>
            </li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            Those projects deserve the credit for deep digit coverage. This app
            focuses on presentation, education, and a shareable visual moment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Limitations</h2>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
            <li>Queries are limited to 3–8 digits.</li>
            <li>
              Partner APIs can be slow or unavailable; local search still works
              for the first million digits.
            </li>
            <li>
              Canvas rendering caps how many dots draw at once for performance.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Privacy and learning more</h2>
          <p className="text-foreground/80 leading-relaxed">
            Read{" "}
            <Link
              href="/privacy"
              className="text-accent underline-offset-4 hover:underline"
            >
              Privacy
            </Link>{" "}
            for an accurate description of local vs remote lookup, or{" "}
            <Link
              href="/how-it-works"
              className="text-accent underline-offset-4 hover:underline"
            >
              How it works
            </Link>{" "}
            for the search pipeline. Then{" "}
            <Link
              href="/"
              className="text-accent underline-offset-4 hover:underline"
            >
              try the tool
            </Link>
            .
          </p>
        </section>
      </article>
    </DocumentShell>
  );
}
