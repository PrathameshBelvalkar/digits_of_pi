import type { Metadata } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/seo/DocumentShell";
import { articleJsonLd, JsonLd, webPageJsonLd } from "@/lib/seo";

const TITLE = "How searching the digits of π works";
const DESCRIPTION =
  "Learn how Digits of π finds your number: local search of the first million digits in your browser, then partner deep search across hundreds of millions to billions of digits.";
const PUBLISHED = "2026-09-13";

export const metadata: Metadata = {
  title: "How it works",
  description: DESCRIPTION,
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <DocumentShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/how-it-works",
            name: TITLE,
            description: DESCRIPTION,
          }),
          articleJsonLd({
            path: "/how-it-works",
            headline: TITLE,
            description: DESCRIPTION,
            datePublished: PUBLISHED,
          }),
        ]}
      />
      <article className="prose-pi space-y-6 text-foreground">
        <header className="space-y-3">
          <p className="font-serif text-[11px] tracking-[0.18em] uppercase text-accent">
            Guide
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
            {TITLE}
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
            Digits of π is built so most searches stay private and instant: the
            first 1,000,000 digits live in your browser. When a longer sequence
            is missing from that window, the app asks trusted deep-search
            partners — and always shows where the match sits on the spiral.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">What you type</h2>
          <p className="text-foreground/80 leading-relaxed">
            Enter any sequence of 3 to 8 digits — a birthday like{" "}
            <span className="font-mono text-accent">0314</span>, a year like{" "}
            <span className="font-mono text-accent">1998</span>, or a favorite
            run of digits. The tool looks for the{" "}
            <strong>first occurrence</strong> of that exact digit string in π
            after the decimal point.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Step 1 — Local million-digit search</h2>
          <p className="text-foreground/80 leading-relaxed">
            On load, the app fetches <code className="font-mono text-sm">pi-digits.txt</code>{" "}
            (one million digits) and searches entirely in your browser. Short
            sequences almost always appear in this range. Nothing about a local
            hit is sent to our servers or to partner APIs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Step 2 — Deep search when needed</h2>
          <p className="text-foreground/80 leading-relaxed">
            If your query has 5–8 digits and is not found in the first million,
            Digits of π calls a small server route that queries partners in
            order:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-foreground/80 leading-relaxed">
            <li>
              <a
                href="https://www.angio.net/pi/"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline"
              >
                The Pi-Search Page at angio.net
              </a>{" "}
              — on the order of 200 million digits.
            </li>
            <li>
              <a
                href="https://pisearch.joshkeegan.co.uk/"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline"
              >
                PiSearch by Josh Keegan
              </a>{" "}
              — up to about 5 billion digits.
            </li>
          </ol>
          <p className="text-foreground/80 leading-relaxed">
            When a partner returns a hit, the UI credits them and focuses the
            canvas on a window around that index. See{" "}
            <Link
              href="/privacy"
              className="text-accent underline-offset-4 hover:underline"
            >
              Privacy
            </Link>{" "}
            for exactly what leaves your device.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">How the visualization works</h2>
          <p className="text-foreground/80 leading-relaxed">
            Each colored dot is one digit of π. Size and color map to the digit
            value 0–9. Rings spiral outward from the start of π so nearby digits
            stay visually close. When a match is found, the camera flies to that
            stretch of the spiral and highlights your sequence.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Why almost every number appears</h2>
          <p className="text-foreground/80 leading-relaxed">
            π is believed to be a normal irrational: its digits do not fall into
            a simple repeating pattern. In practice, short finite sequences show
            up somewhere in a long enough expansion. That does not mean every
            possible long string has been verified — only that searching a few
            digits is a reliable, playful way to locate a personal number in the
            constant.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl">Try it yourself</h2>
          <p className="text-foreground/80 leading-relaxed">
            Looking for a birthday or anniversary? Start on{" "}
            <Link
              href="/birthday-in-pi"
              className="text-accent underline-offset-4 hover:underline"
            >
              Birthday in π
            </Link>
            , or jump straight to the{" "}
            <Link
              href="/"
              className="text-accent underline-offset-4 hover:underline"
            >
              interactive search
            </Link>
            .
          </p>
        </section>
      </article>
    </DocumentShell>
  );
}
