"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DIGIT_PALETTE_HEX } from "@/lib/canvas-layout";

export function DigitLegend() {
  const digits = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Digit color legend">
      {digits.map((d) => (
        <Tooltip key={d}>
          <TooltipTrigger
            className="size-3 rounded-full border border-border/40 cursor-default"
            style={{ backgroundColor: DIGIT_PALETTE_HEX[d] }}
            aria-label={`Digit ${d}`}
          />
          <TooltipContent>Digit {d}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
