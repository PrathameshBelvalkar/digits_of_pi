export const LOCAL_DEPTH = 1_000_000;
export const DEEP_DEPTH = 50_000_000;
export const SEARCH_CHUNK = 256 * 1024;
export const VIEW_WINDOW = 24_000;

export type ChunkHit = {
  index: number;
  context: string;
  window: string;
  windowOffset: number;
};

export type SearchState = {
  prev: Buffer;
  offset: number;
};

export function createSearchState(offset: number): SearchState {
  return { prev: Buffer.alloc(0), offset };
}

export function searchChunk(
  state: SearchState,
  chunk: Buffer,
  needle: Buffer
): { hit: ChunkHit | null; state: SearchState } {
  if (chunk.length === 0) {
    return { hit: null, state };
  }

  const combined = state.prev.length
    ? Buffer.concat([state.prev, chunk])
    : chunk;
  const searchFrom = Math.max(0, state.prev.length - Math.max(0, needle.length - 1));
  const found = combined.indexOf(needle, searchFrom);

  if (found !== -1) {
    const index = state.offset - state.prev.length + found;
    const ctxStart = Math.max(0, found - 4);
    const ctxEnd = Math.min(combined.length, found + needle.length + 4);
    const context = `${
      ctxStart > 0 || index > 4 ? "…" : ""
    }${combined.subarray(ctxStart, ctxEnd).toString("ascii")}${
      ctxEnd < combined.length ? "…" : ""
    }`;
    const prefix = Math.floor(VIEW_WINDOW / 3);
    const winStart = Math.max(0, found - prefix);
    const winEnd = Math.min(combined.length, winStart + VIEW_WINDOW);
    return {
      hit: {
        index,
        context,
        window: combined.subarray(winStart, winEnd).toString("ascii"),
        windowOffset: index - (found - winStart),
      },
      state: {
        prev: combined.subarray(Math.max(0, combined.length - VIEW_WINDOW)),
        offset: state.offset + chunk.length,
      },
    };
  }

  return {
    hit: null,
    state: {
      prev: combined.subarray(Math.max(0, combined.length - VIEW_WINDOW)),
      offset: state.offset + chunk.length,
    },
  };
}
