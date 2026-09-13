"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SearchPanel } from "@/components/SearchPanel";
import {
  PiCanvas,
  DEFAULT_CAMERA,
  type Camera,
  type PiCanvasHandle,
} from "@/components/PiCanvas";
import { ExploreCanvas } from "@/components/ExploreCanvas";
import { ANGIO_CREDIT, ANGIO_CREDIT_URL } from "@/lib/angio-search";
import { PISEARCH_CREDIT, PISEARCH_CREDIT_URL } from "@/lib/pisearch";
import {
  findNumber,
  loadPiDigits,
  searchDeepNumber,
  type FindResult,
} from "@/lib/pi-lookup";
import { cn } from "@/lib/utils";

type Mode = "search" | "explore";

function showSourceToast(source: FindResult["source"]) {
  if (source === "angio") {
    toast(
      <span>
        Result via{" "}
        <a
          href={ANGIO_CREDIT_URL}
          target="_blank"
          rel="noreferrer"
          className="underline font-medium"
        >
          angio.net
        </a>
      </span>
    );
    return;
  }
  if (source === "pisearch") {
    toast(
      <span>
        Result via{" "}
        <a
          href={PISEARCH_CREDIT_URL}
          target="_blank"
          rel="noreferrer"
          className="underline font-medium"
        >
          {PISEARCH_CREDIT}
        </a>
      </span>
    );
  }
}

function canvasDigits(base: string, result: FindResult | null) {
  return result?.window ?? base;
}

function localHighlight(result: FindResult | null) {
  if (!result) return null;
  if (result.window != null && result.windowOffset != null) {
    return result.index - result.windowOffset;
  }
  return result.index;
}

export function PiApp() {
  const [mode, setMode] = useState<Mode>("search");
  const [digits, setDigits] = useState("");
  const [result, setResult] = useState<FindResult | null>(null);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [searching, setSearching] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [viewKey, setViewKey] = useState(0);
  const canvasRef = useRef<PiCanvasHandle>(null);
  const abortRef = useRef<AbortController | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [focusAnchor, setFocusAnchor] = useState({ x: 0.5, y: 0.5 });
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [shareSeed, setShareSeed] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("n")?.replace(/\D/g, "") ?? "";
    if (raw.length >= 3 && raw.length <= 8) {
      setShareSeed(raw);
      setPendingQuery(raw);
    }
  }, []);

  useEffect(() => {
    loadPiDigits()
      .then(setDigits)
      .catch(() => toast.error("Could not load π digits"));
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const measure = () => {
      const s = shell.getBoundingClientRect();
      if (s.width < 1 || s.height < 1) return;
      const header = headerRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      const topPad = header ? Math.max(0, header.bottom - s.top) : 0;
      if (!panel || mode !== "search") {
        const next = { x: 0.5, y: 0.5 };
        setFocusAnchor((prev) =>
          prev.x === next.x && prev.y === next.y ? prev : next
        );
        return;
      }
      const pl = panel.left - s.left;
      const pr = panel.right - s.left;
      const pt = panel.top - s.top;
      const pb = panel.bottom - s.top;
      const regions = [
        { l: 0, t: topPad, r: s.width, b: pt },
        { l: 0, t: pb, r: s.width, b: s.height },
        { l: 0, t: topPad, r: pl, b: s.height },
        { l: pr, t: topPad, r: s.width, b: s.height },
      ];
      let best = regions[0];
      let bestA = 0;
      for (const r of regions) {
        const w = Math.max(0, r.r - r.l);
        const h = Math.max(0, r.b - r.t);
        const a = w * h;
        if (a > bestA) {
          bestA = a;
          best = r;
        }
      }
      const next = {
        x: Math.round(((best.l + best.r) / 2 / s.width) * 100) / 100,
        y: Math.round(((best.t + best.b) / 2 / s.height) * 100) / 100,
      };
      if (bestA < 120 * 80) {
        next.x = 0.5;
        next.y = Math.round(((topPad + 48) / s.height) * 100) / 100;
      }
      setFocusAnchor((prev) =>
        prev.x === next.x && prev.y === next.y ? prev : next
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(shell);
    const panel = panelRef.current;
    if (panel) ro.observe(panel);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mode, result]);

  const runSearch = useCallback(
    async (value: string) => {
      if (!digits) return;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const query = value.replace(/\D/g, "");
      setSearching(true);
      setResult(null);
      if (query.length >= 3 && query.length <= 8) {
        const next = new URL(window.location.href);
        next.searchParams.set("n", query);
        window.history.replaceState({}, "", `${next.pathname}?n=${query}`);
      }
      try {
        const found = findNumber(value, digits);
        if (found) {
          if (ac.signal.aborted) return;
          setResult(found);
          setLiveMessage(
            `Found ${found.query} at digit ${found.index.toLocaleString()}`
          );
          return;
        }

        if (query.length >= 5) {
          const deep = await searchDeepNumber(query, ac.signal);
          if (ac.signal.aborted) return;
          if (deep) {
            setResult(deep);
            showSourceToast(deep.source);
            setLiveMessage(
              `Found ${deep.query} at digit ${deep.index.toLocaleString()}`
            );
            return;
          }
        }

        if (ac.signal.aborted) return;
        toast.error(
          "Number not found in the first 5,000,000,000 digits — try another"
        );
        setResult(null);
        setLiveMessage(`${value} was not found`);
      } catch {
        if (ac.signal.aborted) return;
        toast.error("Deep search failed — try again");
        setResult(null);
        setLiveMessage(`${value} was not found`);
      } finally {
        if (!ac.signal.aborted) setSearching(false);
      }
    },
    [digits]
  );

  useEffect(() => {
    if (!digits || !pendingQuery) return;
    const q = pendingQuery;
    setPendingQuery(null);
    void runSearch(q);
  }, [digits, pendingQuery, runSearch]);

  function handleShare() {
    if (!result) return;
    const via =
      result.source === "angio"
        ? ` — via ${ANGIO_CREDIT}`
        : result.source === "pisearch"
          ? ` — via ${PISEARCH_CREDIT}`
          : "";
    const shareUrl = `${window.location.origin}/?n=${result.query}`;
    const text = `Found ${result.query} at digit ${result.index.toLocaleString()} of π — ${result.context}${via}\n${shareUrl}`;
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied result"),
      () => toast.error("Could not copy")
    );
  }

  function exportInfo() {
    return result
      ? {
          query: result.query,
          index: result.index,
          context: result.context,
        }
      : null;
  }

  function handleExportPng() {
    const data = canvasRef.current?.exportImage(exportInfo());
    if (!data) {
      toast.error("Nothing to export yet");
      return;
    }
    const a = document.createElement("a");
    a.href = data;
    a.download = `pi-${result?.query ?? "digits"}.png`;
    a.click();
    toast.success("PNG saved");
  }

  function handleExportSvg() {
    toast.message("Generating SVG…");
    window.setTimeout(() => {
      const svg = canvasRef.current?.exportSvg(exportInfo());
      if (!svg) {
        toast.error("Nothing to export yet");
        return;
      }
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pi-${result?.query ?? "digits"}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("SVG saved");
    }, 0);
  }

  function resetView() {
    abortRef.current?.abort();
    setSearching(false);
    setCamera({ ...DEFAULT_CAMERA });
    setResult(null);
    setLiveMessage("");
    setShareSeed("");
    setViewKey((k) => k + 1);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  const viewDigits = canvasDigits(digits, result);
  const highlightIndex = localHighlight(result);
  const highlightLength = result?.query.length ?? 0;

  return (
    <div
      ref={shellRef}
      className="relative h-dvh w-full overflow-hidden bg-background"
    >
      <div className="absolute inset-0">
        {digits && mode === "search" && (
          <PiCanvas
            key={viewKey}
            ref={canvasRef}
            digits={viewDigits}
            highlightIndex={highlightIndex}
            highlightLength={highlightLength}
            camera={camera}
            onCameraChange={setCamera}
            interactive
            rotating={!result}
            enableYearEvents={!result?.window}
            focusAnchor={focusAnchor}
            maxDots={Math.min(
              viewDigits.length,
              Math.max(
                25000,
                Math.min(
                  80000,
                  (highlightIndex ?? 0) + highlightLength + 200
                )
              )
            )}
          />
        )}
        {digits && mode === "explore" && <ExploreCanvas digits={digits} />}
        {!digits && (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            Loading π…
          </div>
        )}
      </div>

      <div className="relative z-10 flex h-full flex-col pointer-events-none">
        <header
          ref={headerRef}
          className="pointer-events-auto flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4"
        >
          <button
            type="button"
            onClick={resetView}
            className="font-serif text-lg text-foreground/80 hover:text-foreground transition-colors bg-transparent border-0 cursor-pointer"
          >
            digits of π
          </button>
          <div className="flex rounded-full bg-card/90 p-1 shadow-sm ring-1 ring-border backdrop-blur-sm">
            {(["search", "explore"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm capitalize transition-colors cursor-pointer border-0",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </header>

        <main className="relative flex flex-1 items-end sm:items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8 min-h-0">
          {mode === "search" && (
            <div
              ref={panelRef}
              className="pointer-events-auto w-full max-w-[26rem] max-h-[min(52dvh,36rem)] sm:max-h-[min(78vh,40rem)] overflow-y-auto overscroll-contain rounded-xl"
            >
              <SearchPanel
                onSearch={runSearch}
                onShare={handleShare}
                onExportPng={handleExportPng}
                onExportSvg={handleExportSvg}
                onRefresh={resetView}
                result={result}
                initialValue={shareSeed}
                searching={searching}
                ready={Boolean(digits)}
              />
            </div>
          )}
          {mode === "search" && (
            <p className="pointer-events-none absolute bottom-4 right-4 sm:right-8 text-xs text-muted-foreground/80 hidden sm:block">
              Drag to pan · scroll to zoom
            </p>
          )}
        </main>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}
