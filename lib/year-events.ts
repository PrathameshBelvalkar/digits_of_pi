import yearData from "@/data/what-happnen-year.json";
import { fieldSize, pointAtIndex } from "@/lib/canvas-layout";

export type YearEventRaw = {
  id: number;
  year: number;
  event: string;
};

export type YearEvent = YearEventRaw & {
  index: number;
  query: string;
};

export function resolveYearEvents(
  digits: string,
  maxIndex: number
): YearEvent[] {
  if (!digits) return [];
  const out: YearEvent[] = [];
  for (const item of yearData as YearEventRaw[]) {
    const query = String(item.year);
    const index = digits.indexOf(query);
    if (index < 0) continue;
    if (index + query.length > maxIndex) continue;
    out.push({ ...item, index, query });
  }
  return out;
}

export function spreadYearEvents(
  digits: string,
  maxIndex: number,
  take = 16
): YearEvent[] {
  if (!digits || take <= 0 || maxIndex <= 0) return [];
  const candidates: YearEvent[] = [];
  for (const item of yearData as YearEventRaw[]) {
    const query = String(item.year);
    let from = 0;
    while (from < maxIndex) {
      const index = digits.indexOf(query, from);
      if (index < 0 || index + query.length > maxIndex) break;
      candidates.push({ ...item, index, query });
      from = index + 1;
    }
  }
  if (candidates.length === 0) return [];

  const pts = candidates.map((c) => {
    const mid = c.index + Math.floor((c.query.length - 1) / 2);
    return pointAtIndex(mid, maxIndex);
  });

  const { width, height } = fieldSize(maxIndex);
  const cols = Math.max(2, Math.round(Math.sqrt(take * (width / Math.max(height, 1)))));
  const rows = Math.max(2, Math.ceil(take / cols));
  const cellW = width / cols;
  const cellH = height / rows;
  const originX = -width / 2 + cellW / 2;
  const originY = -height / 2 + cellH / 2;
  const minDist2 = (Math.min(cellW, cellH) * 0.42) ** 2;
  const usedYears = new Set<number>();
  const usedCand = new Set<number>();
  const picked: number[] = [];

  for (let r = 0; r < rows && picked.length < take; r++) {
    for (let c = 0; c < cols && picked.length < take; c++) {
      const tx = originX + c * cellW;
      const ty = originY + r * cellH;
      let bestI = -1;
      let bestD = Infinity;
      for (let i = 0; i < candidates.length; i++) {
        if (usedCand.has(i) || usedYears.has(candidates[i].year)) continue;
        let close = false;
        for (const j of picked) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          if (dx * dx + dy * dy < minDist2) {
            close = true;
            break;
          }
        }
        if (close) continue;
        const dx = pts[i].x - tx;
        const dy = pts[i].y - ty;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      if (bestI < 0) continue;
      picked.push(bestI);
      usedCand.add(bestI);
      usedYears.add(candidates[bestI].year);
    }
  }

  while (picked.length < take) {
    let bestI = -1;
    let bestD = -1;
    for (let i = 0; i < candidates.length; i++) {
      if (usedCand.has(i) || usedYears.has(candidates[i].year)) continue;
      let minD = Infinity;
      for (const j of picked) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = dx * dx + dy * dy;
        if (d < minD) minD = d;
      }
      if (picked.length === 0) minD = 0;
      if (minD > bestD) {
        bestD = minD;
        bestI = i;
      }
    }
    if (bestI < 0) break;
    picked.push(bestI);
    usedCand.add(bestI);
    usedYears.add(candidates[bestI].year);
  }

  return picked.map((i) => candidates[i]);
}
