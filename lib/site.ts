export const SITE_NAME = "Digits of π";
export const SITE_TAGLINE = "Find Your Number in π";
export const SITE_DESCRIPTION =
  "Search a 3–8 digit number and watch the canvas fly to its first appearance in π. Local lookup for the first million digits, with deep search when needed.";

function normalizeSiteUrl(raw: string): string {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return normalizeSiteUrl(fromEnv);

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercelHost) return normalizeSiteUrl(vercelHost);

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
