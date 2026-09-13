import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/birthday-in-pi", label: "Birthday in π" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteNav({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <nav
      aria-label="Site"
      className={cn(
        "flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm",
        compact ? "text-muted-foreground" : "text-foreground/80",
        className
      )}
    >
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
