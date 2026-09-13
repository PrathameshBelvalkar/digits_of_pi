"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  fieldLayout,
  fieldSize,
  digitRadius,
  DIGIT_PALETTE_HEX,
  pointAtIndex,
  type Point,
} from "@/lib/canvas-layout";
import {
  resolveYearEvents,
  spreadYearEvents,
  type YearEvent,
} from "@/lib/year-events";

export type Camera = { x: number; y: number; scale: number };

export type ExportInfo = {
  query: string;
  index: number;
  context: string;
};

export type PiCanvasHandle = {
  exportImage: (info?: ExportInfo | null) => string | null;
  getCamera: () => Camera;
};

type PiCanvasProps = {
  digits: string;
  highlightIndex: number | null;
  highlightLength: number;
  camera: Camera;
  onCameraChange?: (camera: Camera) => void;
  interactive?: boolean;
  maxDots?: number;
  rotating?: boolean;
  enableYearEvents?: boolean;
  yearTipLimit?: number;
  focusAnchor?: { x: number; y: number };
};

export const DEFAULT_CAMERA: Camera = { x: 0, y: 0, scale: 1 };

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function drawYearCard(
  ctx: CanvasRenderingContext2D,
  yearTip: YearEvent,
  tipAnchor: { x: number; y: number; r: number },
  w: number,
  h: number,
  compact = false
) {
  const boxW = compact ? 168 : 200;
  const title = yearTip.query.split("").join(" ");
  ctx.font = compact
    ? "11px Merriweather, Georgia, serif"
    : "12px Merriweather, Georgia, serif";
  const eventLines = wrapText(
    ctx,
    yearTip.event,
    boxW - 28,
    compact ? 2 : 3
  );
  const titleSize = compact ? 18 : 22;
  const boxH = (compact ? 24 : 28) + eventLines.length * (compact ? 14 : 16) + 16;
  let boxX = Math.min(Math.max(12, tipAnchor.x - boxW / 2), w - boxW - 12);
  let boxY = Math.max(12, tipAnchor.y - boxH - (compact ? 36 : 56));
  if (boxY + boxH + 8 > tipAnchor.y) {
    boxY = Math.min(h - boxH - 12, tipAnchor.y + tipAnchor.r + 18);
  }

  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = "#6B6B6B";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(boxX + boxW / 2, boxY + (boxY > tipAnchor.y ? 0 : boxH));
  ctx.lineTo(tipAnchor.x, tipAnchor.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  const rr = 10;
  ctx.beginPath();
  ctx.moveTo(boxX + rr, boxY);
  ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, rr);
  ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, rr);
  ctx.arcTo(boxX, boxY + boxH, boxX, boxY, rr);
  ctx.arcTo(boxX, boxY, boxX + boxW, boxY, rr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1A2F28";
  ctx.font = `600 ${titleSize}px Merriweather, Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText(title, boxX + boxW / 2, boxY + (compact ? 22 : 28));
  ctx.font = compact
    ? "11px Merriweather, Georgia, serif"
    : "12px Merriweather, Georgia, serif";
  ctx.fillStyle = "#5A6B63";
  eventLines.forEach((line, i) => {
    ctx.fillText(
      line,
      boxX + boxW / 2,
      boxY + (compact ? 40 : 48) + i * (compact ? 14 : 16)
    );
  });
  ctx.textAlign = "left";
}

export const PiCanvas = forwardRef<PiCanvasHandle, PiCanvasProps>(
  function PiCanvas(
    {
      digits,
      highlightIndex,
      highlightLength,
      camera,
      onCameraChange,
      interactive = true,
      maxDots = 25000,
      rotating = true,
      enableYearEvents = true,
      yearTipLimit = 1,
      focusAnchor = { x: 0.5, y: 0.5 },
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const tileRef = useRef({ width: 1, height: 1 });
    const cameraRef = useRef<Camera>(camera);
    const animRef = useRef<number | null>(null);
    const driftRef = useRef<number | null>(null);
    const driftOffsetRef = useRef({ x: 0, y: 0 });
    const pauseDriftRef = useRef(false);
    const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
    const onCameraChangeRef = useRef(onCameraChange);
    onCameraChangeRef.current = onCameraChange;
    const focusAnchorRef = useRef(focusAnchor);
    focusAnchorRef.current = focusAnchor;
    const drawRef = useRef<() => void>(() => {});
    const yearsRef = useRef<YearEvent[]>([]);
    const yearTipsRef = useRef<YearEvent[]>([]);
    const yearCursorRef = useRef(0);
    const digitsRef = useRef(digits);
    const digitsVersionRef = useRef(0);
    if (digitsRef.current !== digits) {
      digitsRef.current = digits;
      digitsVersionRef.current += 1;
    }
    const digitsVersion = digitsVersionRef.current;

    const renderCount = Math.min(digits.length || 0, maxDots);

    useEffect(() => {
      pointsRef.current = fieldLayout(renderCount);
      tileRef.current = fieldSize(renderCount);
      if (!enableYearEvents) {
        yearsRef.current = [];
        yearTipsRef.current = [];
        return;
      }
      if (yearTipLimit > 1) {
        yearsRef.current = spreadYearEvents(
          digitsRef.current,
          renderCount,
          yearTipLimit
        );
        yearTipsRef.current = yearsRef.current;
      } else {
        yearsRef.current = resolveYearEvents(digitsRef.current, renderCount);
      }
    }, [renderCount, digitsVersion, enableYearEvents, yearTipLimit]);

    useEffect(() => {
      if (highlightIndex !== null) {
        yearTipsRef.current = [];
        drawRef.current();
        return;
      }

      if (yearTipLimit > 1) {
        yearTipsRef.current = yearsRef.current;
        drawRef.current();
        return;
      }

      const pickTip = () => {
        const canvas = canvasRef.current;
        if (!canvas || !digitsRef.current) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (w === 0 || h === 0) return;

        const cam = cameraRef.current;
        const drift = driftOffsetRef.current;
        const cx = w / 2 + cam.x + drift.x;
        const cy = h / 2 + cam.y + drift.y;
        const scale = cam.scale;
        const tileW = tileRef.current.width;
        const tileH = tileRef.current.height;
        const points = pointsRef.current;
        const years = yearsRef.current;
        const visible: YearEvent[] = [];

        for (const y of years) {
          const mid = y.index + Math.floor((y.query.length - 1) / 2);
          const p =
            points[mid] ?? pointAtIndex(mid, Math.max(renderCount, mid + 1));
          const viewX = (w / 2 - cx) / scale;
          const viewY = (h / 2 - cy) / scale;
          const tx = Math.round((viewX - p.x) / tileW);
          const ty = Math.round((viewY - p.y) / tileH);
          const sx = cx + (p.x + tx * tileW) * scale;
          const sy = cy + (p.y + ty * tileH) * scale;
          if (sx >= 40 && sx <= w - 40 && sy >= 80 && sy <= h - 40) {
            visible.push(y);
          }
        }

        if (visible.length === 0) {
          yearTipsRef.current = [];
        } else {
          const pick = visible[yearCursorRef.current % visible.length];
          yearCursorRef.current += 1;
          yearTipsRef.current = [pick];
        }
        drawRef.current();
      };

      pickTip();
      const id = window.setInterval(pickTip, 15000);
      return () => window.clearInterval(id);
    }, [digitsVersion, highlightIndex, renderCount, yearTipLimit]);

    const drawScene = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        w: number,
        h: number,
        opts?: { forExport?: boolean; info?: ExportInfo | null }
      ) => {
        const source = digitsRef.current;
        if (!source) return;

        if (opts?.forExport) {
          ctx.fillStyle = "#F4F1EA";
          ctx.fillRect(0, 0, w, h);
        } else {
          ctx.clearRect(0, 0, w, h);
        }

        const cam = cameraRef.current;
        const drift = driftOffsetRef.current;
        const cx = w / 2 + cam.x + drift.x;
        const cy = h / 2 + cam.y + drift.y;
        const points = pointsRef.current;
        const scale = cam.scale;
        const tileW = tileRef.current.width;
        const tileH = tileRef.current.height;
        const tileWs = tileW * scale;
        const tileHs = tileH * scale;

        const hasMatch = highlightIndex !== null && highlightLength > 0;
        const yearTips = !hasMatch ? yearTipsRef.current : [];
        const focusIndex = hasMatch ? highlightIndex! : null;
        const focusLength = hasMatch ? highlightLength : 0;
        const hasFocus = focusIndex !== null && focusLength > 0;
        const focusEnd = hasFocus ? focusIndex + focusLength : -1;

        let focusOx = 0;
        let focusOy = 0;
        if (hasFocus) {
          const mid =
            focusIndex! + Math.floor(Math.max(0, focusLength - 1) / 2);
          const midP =
            points[mid] ??
            pointAtIndex(mid, Math.max(renderCount, mid + 1));
          const viewCenterX = (w / 2 - cx) / scale;
          const viewCenterY = (h / 2 - cy) / scale;
          const nearestTx = Math.round((viewCenterX - midP.x) / tileW);
          const nearestTy = Math.round((viewCenterY - midP.y) / tileH);
          focusOx = nearestTx * tileWs;
          focusOy = nearestTy * tileHs;
        }

        const yearFoci: { x: number; y: number }[] = [];
        if (!hasMatch && yearTips.length > 0) {
          const viewCenterX = (w / 2 - cx) / scale;
          const viewCenterY = (h / 2 - cy) / scale;
          for (const tip of yearTips) {
            const mid =
              tip.index + Math.floor((tip.query.length - 1) / 2);
            const midP =
              points[mid] ??
              pointAtIndex(mid, Math.max(renderCount, mid + 1));
            const nearestTx = Math.round((viewCenterX - midP.x) / tileW);
            const nearestTy = Math.round((viewCenterY - midP.y) / tileH);
            const sx = cx + midP.x * scale + nearestTx * tileWs;
            const sy = cy + midP.y * scale + nearestTy * tileHs;
            if (sx < -80 || sy < -80 || sx > w + 80 || sy > h + 80) continue;
            yearFoci.push({ x: sx, y: sy });
          }
        }
        const localFade = yearFoci.length > 0;
        const fadeRadius =
          Math.min(w, h) * (yearFoci.length > 1 ? 0.1 : 0.22);

        const lodStep =
          scale < 0.5 ? 4 : scale < 0.85 ? 2 : renderCount > 40000 ? 2 : 1;

        const pad = 24;
        const tx0 = Math.floor((-cx - pad) / tileWs) - 1;
        const tx1 = Math.ceil((w - cx + pad) / tileWs) + 1;
        const ty0 = Math.floor((-cy - pad) / tileHs) - 1;
        const ty1 = Math.ceil((h - cy + pad) / tileHs) + 1;

        for (let ty = ty0; ty <= ty1; ty++) {
          for (let tx = tx0; tx <= tx1; tx++) {
            const ox = tx * tileWs;
            const oy = ty * tileHs;
            for (let i = 0; i < points.length; i += lodStep) {
              if (hasFocus && i >= focusIndex! && i < focusEnd) continue;
              const p = points[i];
              const sx = cx + p.x * scale + ox;
              const sy = cy + p.y * scale + oy;
              if (sx < -20 || sy < -20 || sx > w + 20 || sy > h + 20) continue;

              if (hasMatch) {
                ctx.globalAlpha = 0.12;
              } else if (localFade) {
                let d = Infinity;
                for (const f of yearFoci) {
                  const fd = Math.hypot(sx - f.x, sy - f.y);
                  if (fd < d) d = fd;
                }
                if (d > fadeRadius) {
                  ctx.globalAlpha = 1;
                } else {
                  ctx.globalAlpha = 0.12 + 0.88 * (d / fadeRadius);
                }
              } else {
                ctx.globalAlpha = 1;
              }

              const digit = Number(source[i]);
              const r =
                digitRadius(digit) *
                0.55 *
                Math.min(scale, 2.2) *
                (lodStep > 1 ? 1.15 : 1);
              ctx.beginPath();
              ctx.arc(sx, sy, r, 0, Math.PI * 2);
              ctx.fillStyle = DIGIT_PALETTE_HEX[digit] ?? DIGIT_PALETTE_HEX[0];
              ctx.fill();
            }
          }
        }

        if (hasFocus) {
          const bridge: { x: number; y: number; digit: number; r: number }[] =
            [];
          for (let i = 0; i < focusLength; i++) {
            const idx = focusIndex! + i;
            if (idx >= source.length) break;
            const raw =
              points[idx] ?? pointAtIndex(idx, Math.max(renderCount, idx + 1));
            const digit = Number(source[idx]);
            const r = digitRadius(digit) * 0.75 * Math.min(scale, 2.2);
            bridge.push({
              x: cx + raw.x * scale + focusOx,
              y: cy + raw.y * scale + focusOy,
              digit,
              r,
            });
          }

          if (bridge.length > 1) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "#5C4030";
            ctx.lineWidth = Math.max(1.25, 1.5 * Math.min(scale, 1.4));
            ctx.lineCap = "round";
            for (let i = 0; i < bridge.length - 1; i++) {
              const a = bridge[i];
              const b = bridge[i + 1];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy);
              if (dist <= a.r + b.r + 1) continue;
              const ux = dx / dist;
              const uy = dy / dist;
              ctx.beginPath();
              ctx.moveTo(a.x + ux * a.r, a.y + uy * a.r);
              ctx.lineTo(b.x - ux * b.r, b.y - uy * b.r);
              ctx.stroke();
            }
          }

          ctx.globalAlpha = 1;
          for (const node of bridge) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            ctx.fillStyle = DIGIT_PALETTE_HEX[node.digit];
            ctx.fill();
          }
        }

        if (!hasMatch && yearTips.length > 0) {
          for (const tip of yearTips) {
            const mid =
              tip.index + Math.floor((tip.query.length - 1) / 2);
            const midP =
              points[mid] ??
              pointAtIndex(mid, Math.max(renderCount, mid + 1));
            const viewCenterX = (w / 2 - cx) / scale;
            const viewCenterY = (h / 2 - cy) / scale;
            const nearestTx = Math.round((viewCenterX - midP.x) / tileW);
            const nearestTy = Math.round((viewCenterY - midP.y) / tileH);
            const ox = nearestTx * tileWs;
            const oy = nearestTy * tileHs;
            const bridge: { x: number; y: number; digit: number; r: number }[] =
              [];
            for (let i = 0; i < tip.query.length; i++) {
              const idx = tip.index + i;
              if (idx >= source.length) break;
              const raw =
                points[idx] ??
                pointAtIndex(idx, Math.max(renderCount, idx + 1));
              const digit = Number(source[idx]);
              const r = digitRadius(digit) * 0.75 * Math.min(scale, 2.2);
              bridge.push({
                x: cx + raw.x * scale + ox,
                y: cy + raw.y * scale + oy,
                digit,
                r,
              });
            }
            if (bridge.length === 0) continue;
            const anchor = bridge[Math.floor(bridge.length / 2)];
            if (
              anchor.x < -40 ||
              anchor.y < -40 ||
              anchor.x > w + 40 ||
              anchor.y > h + 40
            ) {
              continue;
            }
            ctx.globalAlpha = 1;
            if (bridge.length > 1) {
              ctx.strokeStyle = "#5C4030";
              ctx.lineWidth = Math.max(1.25, 1.5 * Math.min(scale, 1.4));
              ctx.lineCap = "round";
              for (let i = 0; i < bridge.length - 1; i++) {
                const a = bridge[i];
                const b = bridge[i + 1];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);
                if (dist <= a.r + b.r + 1) continue;
                const ux = dx / dist;
                const uy = dy / dist;
                ctx.beginPath();
                ctx.moveTo(a.x + ux * a.r, a.y + uy * a.r);
                ctx.lineTo(b.x - ux * b.r, b.y - uy * b.r);
                ctx.stroke();
              }
            }
            for (const node of bridge) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
              ctx.fillStyle = DIGIT_PALETTE_HEX[node.digit];
              ctx.fill();
            }
            drawYearCard(ctx, tip, anchor, w, h, yearTips.length > 1);
          }
        }

        ctx.globalAlpha = 1;

        if (opts?.forExport && opts.info) {
          const padBox = 28;
          const boxH = 96;
          ctx.fillStyle = "rgba(253, 251, 247, 0.94)";
          ctx.fillRect(0, h - boxH, w, boxH);
          ctx.fillStyle = "#1A2F28";
          ctx.font = "600 15px Merriweather, Georgia, serif";
          ctx.fillText("digits of π", padBox, h - boxH + 28);
          ctx.font = "500 18px Outfit, system-ui, sans-serif";
          ctx.fillText(
            `Found ${opts.info.query} at digit ${opts.info.index.toLocaleString()}`,
            padBox,
            h - boxH + 54
          );
          ctx.font = "13px Fira Code, ui-monospace, monospace";
          ctx.fillStyle = "#4A6B5C";
          ctx.fillText(opts.info.context, padBox, h - boxH + 76);
          ctx.fillStyle = "#C9892A";
          ctx.font = "12px Outfit, system-ui, sans-serif";
          // const badge = "never leaves your browser";
          // const tw = ctx.measureText(badge).width;
          // ctx.fillText(badge, w - padBox - tw, h - boxH + 28);
        }
      },
      [digitsVersion, highlightIndex, highlightLength, renderCount]
    );

    const draw = useCallback(
      function drawCanvas() {
        const canvas = canvasRef.current;
        if (!canvas || !digitsRef.current) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (w === 0 || h === 0) return;
        if (
          canvas.width !== Math.floor(w * dpr) ||
          canvas.height !== Math.floor(h * dpr)
        ) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawScene(ctx, w, h);
      },
      [digitsVersion, drawScene]
    );

    useEffect(() => {
      drawRef.current = draw;
    });

    useImperativeHandle(ref, () => ({
      exportImage: (info) => {
        const canvas = canvasRef.current;
        if (!canvas || !digitsRef.current) return null;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const off = document.createElement("canvas");
        off.width = Math.floor(w * dpr);
        off.height = Math.floor(h * dpr);
        const ctx = off.getContext("2d");
        if (!ctx) return null;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawScene(ctx, w, h, { forExport: true, info });
        return off.toDataURL("image/png");
      },
      getCamera: () => cameraRef.current,
    }));

    useEffect(() => {
      cameraRef.current = camera;
      draw();
    }, [camera, draw]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ro = new ResizeObserver(() => draw());
      ro.observe(canvas);
      draw();
      return () => ro.disconnect();
    }, [draw]);

    useEffect(() => {
      pauseDriftRef.current = highlightIndex !== null;
    }, [highlightIndex]);

    useEffect(() => {
      if (!rotating || prefersReducedMotion()) return;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(48, now - last);
        last = now;
        if (!pauseDriftRef.current && !dragRef.current.active) {
          const scale = cameraRef.current.scale;
          const tileWs = tileRef.current.width * scale;
          const tileHs = tileRef.current.height * scale;
          driftOffsetRef.current.x += dt * 0.012;
          driftOffsetRef.current.y += dt * 0.007;
          if (tileWs > 0) {
            driftOffsetRef.current.x =
              ((driftOffsetRef.current.x % tileWs) + tileWs) % tileWs;
          }
          if (tileHs > 0) {
            driftOffsetRef.current.y =
              ((driftOffsetRef.current.y % tileHs) + tileHs) % tileHs;
          }
          drawRef.current();
        }
        driftRef.current = requestAnimationFrame(tick);
      };
      const resume = () => {
        last = performance.now();
        if (driftRef.current) cancelAnimationFrame(driftRef.current);
        driftRef.current = requestAnimationFrame(tick);
      };
      driftRef.current = requestAnimationFrame(tick);
      document.addEventListener("visibilitychange", resume);
      window.addEventListener("focus", resume);
      return () => {
        document.removeEventListener("visibilitychange", resume);
        window.removeEventListener("focus", resume);
        if (driftRef.current) cancelAnimationFrame(driftRef.current);
      };
    }, [rotating]);

    useEffect(() => {
      if (highlightIndex === null) return;

      const mid =
        highlightIndex + Math.floor(Math.max(0, highlightLength - 1) / 2);
      const target =
        pointsRef.current[mid] ??
        pointsRef.current[highlightIndex] ??
        pointAtIndex(highlightIndex, Math.max(renderCount, highlightIndex + 1));

      const canvas = canvasRef.current;
      const w = canvas?.clientWidth || window.innerWidth;
      const h = canvas?.clientHeight || window.innerHeight;
      const zoom = h < 720 ? 2.9 : 3.8;
      const drift = driftOffsetRef.current;
      const cam = cameraRef.current;
      const tileW = tileRef.current.width;
      const tileH = tileRef.current.height;
      const viewX = (-cam.x - drift.x) / cam.scale;
      const viewY = (-cam.y - drift.y) / cam.scale;
      const nearestTx = Math.round((viewX - target.x) / tileW);
      const nearestTy = Math.round((viewY - target.y) / tileH);
      const aimX = target.x + nearestTx * tileW;
      const aimY = target.y + nearestTy * tileH;
      const anchor = focusAnchorRef.current;
      const ax = Math.min(0.82, Math.max(0.18, anchor.x)) * w;
      const ay = Math.min(0.82, Math.max(0.16, anchor.y)) * h;

      const start = { ...cam };
      const end: Camera = {
        x: ax - w / 2 - aimX * zoom - drift.x,
        y: ay - h / 2 - aimY * zoom - drift.y,
        scale: zoom,
      };

      if (prefersReducedMotion()) {
        cameraRef.current = end;
        onCameraChangeRef.current?.(end);
        drawRef.current();
        return;
      }

      const duration = 1400;
      const t0 = performance.now();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = ease(t);
        const next: Camera = {
          x: start.x + (end.x - start.x) * e,
          y: start.y + (end.y - start.y) * e,
          scale: start.scale + (end.scale - start.scale) * e,
        };
        cameraRef.current = next;
        drawRef.current();
        if (t < 1) animRef.current = requestAnimationFrame(tick);
        else onCameraChangeRef.current?.(next);
      };
      animRef.current = requestAnimationFrame(tick);
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }, [highlightIndex, highlightLength, renderCount]);

    function onPointerDown(e: React.PointerEvent) {
      if (!interactive) return;
      dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: React.PointerEvent) {
      if (!interactive || !dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      const next: Camera = {
        ...cameraRef.current,
        x: cameraRef.current.x + dx,
        y: cameraRef.current.y + dy,
      };
      cameraRef.current = next;
      onCameraChangeRef.current?.(next);
      draw();
    }

    function onPointerUp() {
      dragRef.current.active = false;
    }

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !interactive) return;

      const zoomAt = (clientX: number, clientY: number, factor: number) => {
        const cam = cameraRef.current;
        const nextScale = Math.min(18, Math.max(0.35, cam.scale * factor));
        if (nextScale === cam.scale) return;
        const rect = canvas.getBoundingClientRect();
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const cx = canvas.clientWidth / 2;
        const cy = canvas.clientHeight / 2;
        const drift = driftOffsetRef.current;
        const wx = (mx - cx - cam.x - drift.x) / cam.scale;
        const wy = (my - cy - cam.y - drift.y) / cam.scale;
        const next: Camera = {
          scale: nextScale,
          x: mx - cx - wx * nextScale - drift.x,
          y: my - cy - wy * nextScale - drift.y,
        };
        cameraRef.current = next;
        onCameraChangeRef.current?.(next);
        drawRef.current();
      };

      const onWheelNative = (e: WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        zoomAt(e.clientX, e.clientY, factor);
      };

      const blockGesture = (e: Event) => e.preventDefault();

      canvas.addEventListener("wheel", onWheelNative, { passive: false });
      canvas.addEventListener("gesturestart", blockGesture, {
        passive: false,
      } as AddEventListenerOptions);
      canvas.addEventListener("gesturechange", blockGesture, {
        passive: false,
      } as AddEventListenerOptions);
      return () => {
        canvas.removeEventListener("wheel", onWheelNative);
        canvas.removeEventListener("gesturestart", blockGesture);
        canvas.removeEventListener("gesturechange", blockGesture);
      };
    }, [interactive]);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full touch-none cursor-grab active:cursor-grabbing overscroll-none"
        role="img"
        aria-label="Visualization of π digits as colored dots"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    );
  }
);
