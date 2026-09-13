"use client";

import { useState } from "react";
import { PiCanvas, DEFAULT_CAMERA, type Camera } from "@/components/PiCanvas";

type ExploreCanvasProps = {
  digits: string;
};

export function ExploreCanvas({ digits }: ExploreCanvasProps) {
  const [camera, setCamera] = useState<Camera>({ ...DEFAULT_CAMERA });

  return (
    <div className="relative size-full">
      <PiCanvas
        digits={digits}
        highlightIndex={null}
        highlightLength={0}
        camera={camera}
        onCameraChange={setCamera}
        interactive
        maxDots={25000}
        yearTipLimit={16}
      />
      <p className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/70 px-3 py-1 rounded-full backdrop-blur-sm">
        Drag to pan · scroll to zoom
      </p>
    </div>
  );
}
