"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { WhatIsThisDialog } from "@/components/WhatIsThisDialog";
import { DigitLegend } from "@/components/DigitLegend";
import type { FindResult } from "@/lib/pi-lookup";
import {
  Minus,
  Plus,
  ShareNetwork,
  DownloadSimple,
  ArrowClockwise,
} from "@phosphor-icons/react";

type SearchPanelProps = {
  onSearch: (value: string) => void;
  onShare: () => void;
  onExport: () => void;
  onRefresh: () => void;
  result: FindResult | null;
  initialValue?: string;
  searching?: boolean;
  ready?: boolean;
};

export function SearchPanel({
  onSearch,
  onShare,
  onExport,
  onRefresh,
  result,
  initialValue = "",
  searching = false,
  ready = true,
}: SearchPanelProps) {
  const [length, setLength] = useState(
    Math.min(8, Math.max(3, initialValue.length || 4))
  );
  const [value, setValue] = useState(initialValue.slice(0, length));

  useEffect(() => {
    if (initialValue) {
      const len = Math.min(8, Math.max(3, initialValue.length));
      setLength(len);
      setValue(initialValue.slice(0, len));
    }
  }, [initialValue]);

  function changeLength(delta: number) {
    const next = Math.min(8, Math.max(3, length + delta));
    setLength(next);
    setValue((v) => v.slice(0, next));
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (value.length === length) onSearch(value);
  }

  return (
    <Card
      size="sm"
      className="w-full max-w-full shadow-lg ring-border/50 bg-card/90 backdrop-blur-md overflow-hidden"
    >
      <CardHeader className="!flex !flex-col gap-2 sm:gap-3 space-y-0 !grid-cols-none">
        <div className="flex w-full items-center justify-between gap-3">
          <p className="font-serif text-[11px] tracking-[0.18em] uppercase text-accent">
            Slice of pi
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRefresh}
            aria-label="Refresh view"
            className="shrink-0"
          >
            <ArrowClockwise />
          </Button>
        </div>
        <CardTitle className="hidden sm:block font-serif text-xl sm:text-[1.65rem] leading-snug text-foreground">
          Your number is <em className="italic text-foreground">hiding</em>{" "}
          inside π.
        </CardTitle>
        <CardDescription className="hidden sm:block font-serif text-sm sm:text-[0.95rem] leading-relaxed text-foreground/75">
          π never repeats and never ends, so every number you love is in there
          somewhere. Type a number — a birthday, a year — and fly to the exact
          place it first appears.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{length} digits</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => changeLength(-1)}
                disabled={length <= 3}
                aria-label="Fewer digits"
              >
                <Minus />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => changeLength(1)}
                disabled={length >= 8}
                aria-label="More digits"
              >
                <Plus />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <InputOTP
              maxLength={length}
              value={value}
              onChange={setValue}
              pattern="[0-9]*"
              inputMode="numeric"
              containerClassName="justify-start"
            >
              <InputOTPGroup className="bg-muted/70">
                {Array.from({ length }).map((_, i) => (
                  <InputOTPSlot
                    key={`${length}-${i}`}
                    index={i}
                    className="size-8 sm:size-9 text-base font-mono"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 sm:h-10 px-4 sm:px-5 text-sm shrink-0"
              disabled={value.length !== length || searching || !ready}
            >
              Find it
            </Button>
          </div>

          {searching ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Searching…
            </p>
          ) : null}
        </form>

        {result && (
          <div
            className="rounded-xl bg-secondary/60 px-3 py-2.5 sm:px-4 sm:py-3 text-sm space-y-2"
            role="status"
          >
            <p className="font-medium text-foreground">
              Found{" "}
              <span className="font-mono text-accent">{result.query}</span> at
              digit {result.index.toLocaleString()}
            </p>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {(() => {
                const q = result.query;
                const i = result.context.indexOf(q);
                if (i < 0) return result.context;
                return (
                  <>
                    {result.context.slice(0, i)}
                    <mark className="rounded-sm bg-accent/35 text-foreground px-0.5 not-italic">
                      {q}
                    </mark>
                    {result.context.slice(i + q.length)}
                  </>
                );
              })()}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onShare}
              >
                <ShareNetwork data-icon="inline-start" />
                Share
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <DownloadSimple data-icon="inline-start" />
                Save image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                aria-label="Refresh"
              >
                <ArrowClockwise data-icon="inline-start" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 sm:gap-3">
        <DigitLegend />
        <WhatIsThisDialog />
      </CardFooter>
    </Card>
  );
}
