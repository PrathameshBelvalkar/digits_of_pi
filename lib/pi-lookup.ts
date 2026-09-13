import index34 from "@/data/pi-index-3-4.json";
import { DEEP_DEPTH, LOCAL_DEPTH } from "@/lib/chunk-search";

let cachedDigits: string | null = null;

export async function loadPiDigits(): Promise<string> {
  if (cachedDigits) return cachedDigits;
  const res = await fetch("/pi-digits.txt");
  cachedDigits = (await res.text()).trim();
  return cachedDigits;
}

export function setPiDigits(digits: string) {
  cachedDigits = digits;
}

export type FindResult = {
  index: number;
  query: string;
  context: string;
  window?: string;
  windowOffset?: number;
  depth?: number;
  source?: "local" | "angio" | "pisearch";
  occurrences?: number;
};

export function findNumber(
  input: string,
  digits?: string
): FindResult | null {
  const query = input.replace(/\D/g, "");
  if (query.length < 3 || query.length > 8) return null;

  if (query.length <= 4) {
    const precomputed = (index34 as Record<string, number>)[query];
    if (precomputed !== undefined) {
      const source = digits ?? cachedDigits ?? "";
      const start = Math.max(0, precomputed - 4);
      const end = Math.min(source.length, precomputed + query.length + 4);
      const context =
        source.length > 0
          ? `${start > 0 ? "…" : ""}${source.slice(start, end)}${end < source.length ? "…" : ""}`
          : query;
      return { index: precomputed, query, context, depth: LOCAL_DEPTH, source: "local" };
    }
  }

  const source = digits ?? cachedDigits;
  if (!source) return null;

  const index = source.indexOf(query);
  if (index === -1) return null;

  const start = Math.max(0, index - 4);
  const end = Math.min(source.length, index + query.length + 4);
  const context = `${start > 0 ? "…" : ""}${source.slice(start, end)}${end < source.length ? "…" : ""}`;

  return { index, query, context, depth: LOCAL_DEPTH, source: "local" };
}

export async function searchDeepNumber(
  input: string,
  signal?: AbortSignal
): Promise<FindResult | null> {
  const query = input.replace(/\D/g, "");
  if (query.length < 5 || query.length > 8) return null;

  const res = await fetch("/api/pi-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (res.status === 503) {
    throw new Error("deep-missing");
  }

  if (!res.ok) {
    throw new Error("deep-failed");
  }

  const data = (await res.json()) as {
    found?: boolean;
    result?: FindResult;
    remoteError?: boolean;
  };

  if (data.remoteError) {
    throw new Error("deep-failed");
  }

  if (!data.found || !data.result) return null;
  return data.result;
}

export const DIGIT_DEPTH = 5_000_000_000;
export { LOCAL_DEPTH, DEEP_DEPTH };
