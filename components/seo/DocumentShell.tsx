import Link from "next/link";
import { SiteNav } from "@/components/seo/SiteNav";
import { SITE_NAME } from "@/lib/site";

export function DocumentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-serif text-lg text-foreground/85 hover:text-foreground"
          >
            {SITE_NAME}
          </Link>
          <SiteNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-6 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Try the search
            </Link>
            {" — find your number in π."}
          </p>
          <SiteNav compact />
        </div>
      </footer>
    </div>
  );
}
