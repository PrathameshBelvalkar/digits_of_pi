import type { FindResult } from "@/lib/pi-lookup";

export const PISEARCH_DEPTH = 5_000_000_000;
export const PISEARCH_URL =
  "https://v2.api.pisearch.joshkeegan.co.uk/api/v1/Lookup";
export const PISEARCH_CREDIT_URL = "https://pisearch.joshkeegan.co.uk/";
export const PISEARCH_CREDIT = "pisearch.joshkeegan.co.uk";

type PisearchResponse = {
  resultId?: number | null;
  resultStringIdx?: number | null;
  surroundingDigits?: { before?: string; after?: string } | null;
  numResults?: number;
};

export async function searchPisearch(
  query: string,
  signal?: AbortSignal
): Promise<FindResult | null> {
  const url = new URL(PISEARCH_URL);
  url.searchParams.set("namedDigits", "pi");
  url.searchParams.set("find", query);
  url.searchParams.set("resultId", "0");

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      origin: "https://pisearch.joshkeegan.co.uk",
      referer: "https://pisearch.joshkeegan.co.uk/",
    },
    signal,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as PisearchResponse;
  if (
    !data.numResults ||
    typeof data.resultStringIdx !== "number" ||
    data.resultStringIdx < 0
  ) {
    return null;
  }

  const before = String(data.surroundingDigits?.before ?? "").replace(/\D/g, "");
  const after = String(data.surroundingDigits?.after ?? "").replace(/\D/g, "");
  const window = `${before}${query}${after}`;
  const ctxBefore = before.slice(-4);
  const ctxAfter = after.slice(0, 4);
  const index = data.resultStringIdx + 1;
  const context = `${before.length > 0 ? "…" : ""}${ctxBefore}${query}${ctxAfter}${
    after.length > 0 ? "…" : ""
  }`;

  return {
    index,
    query,
    context,
    window,
    windowOffset: Math.max(0, index - before.length),
    depth: PISEARCH_DEPTH,
    source: "pisearch",
    occurrences: data.numResults,
  };
}
