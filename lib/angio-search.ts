import type { FindResult } from "@/lib/pi-lookup";

export const ANGIO_DEPTH = 200_000_000;
export const ANGIO_URL = "https://www.angio.net/newpi/piquery";
export const ANGIO_CREDIT_URL = "https://www.angio.net/pi/";
export const ANGIO_CREDIT = "Pi-Search Page at angio.net";

type AngioHit = {
  k?: string;
  st?: number;
  status?: string;
  p?: number;
  db?: string;
  da?: string;
  c?: number;
};

type AngioResponse = {
  status?: string;
  r?: AngioHit[];
};

export async function searchAngio(
  query: string,
  signal?: AbortSignal
): Promise<FindResult | null> {
  const res = await fetch(ANGIO_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://www.angio.net",
      referer: "https://www.angio.net/pi/",
    },
    body: new URLSearchParams({ q: query }).toString(),
    signal,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as AngioResponse;
  const hit = data.r?.[0];
  if (!hit || hit.status !== "found" || typeof hit.p !== "number") {
    return null;
  }

  const before = String(hit.db ?? "").replace(/\D/g, "");
  const after = String(hit.da ?? "").replace(/\D/g, "");
  const window = `${before}${query}${after}`;
  const ctxBefore = before.slice(-4);
  const ctxAfter = after.slice(0, 4);
  const context = `${before.length > 0 ? "…" : ""}${ctxBefore}${query}${ctxAfter}${
    after.length > 0 ? "…" : ""
  }`;

  return {
    index: hit.p,
    query,
    context,
    window,
    windowOffset: Math.max(0, hit.p - before.length),
    depth: ANGIO_DEPTH,
    source: "angio",
    occurrences: typeof hit.c === "number" ? hit.c : undefined,
  };
}
