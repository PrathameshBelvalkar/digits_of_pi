export const SITE_NAME = "Digits of π";
export const SITE_TAGLINE = "Find Your Number in π";
export const SITE_DESCRIPTION =
  "Search a 3–8 digit number and watch the canvas fly to its first appearance in π. Local lookup for the first million digits, with deep search when needed.";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
