export type Point = { x: number; y: number };

export const LAYOUT = {
  spacing: 9,
  aspect: 16 / 9,
} as const;

export const DIGIT_PALETTE_HEX = [
  "#f1c7dd",
  "#827775",
  "#b09977",
  "#b7cc94",
  "#e3337e",
  "#0b326b",
  "#f5bd42",
  "#966eac",
  "#f05129",
  "#7bcbc0",
] as const;

function fieldDims(count: number, aspect = LAYOUT.aspect) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
  const rows = Math.max(1, Math.ceil(count / cols));
  return { cols, rows };
}

function jitter(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function pointAtIndex(
  index: number,
  count = Math.max(index + 1, 1),
  spacing = LAYOUT.spacing,
  aspect = LAYOUT.aspect
): Point {
  const { cols, rows } = fieldDims(count, aspect);
  const row = Math.floor(index / cols);
  let col = index % cols;
  if (row % 2 === 1) col = cols - 1 - col;
  const jx = (jitter(index) - 0.5) * spacing * 0.35;
  const jy = (jitter(index + 17) - 0.5) * spacing * 0.35;
  return {
    x: (col - (cols - 1) / 2) * spacing + jx,
    y: (row - (rows - 1) / 2) * spacing + jy,
  };
}

export function fieldSize(
  count: number,
  spacing = LAYOUT.spacing,
  aspect = LAYOUT.aspect
): { cols: number; rows: number; width: number; height: number } {
  const { cols, rows } = fieldDims(count, aspect);
  return {
    cols,
    rows,
    width: cols * spacing,
    height: rows * spacing,
  };
}

export function fieldLayout(
  count: number,
  spacing = LAYOUT.spacing,
  aspect = LAYOUT.aspect
): Point[] {
  const points: Point[] = new Array(count);
  for (let i = 0; i < count; i++) {
    points[i] = pointAtIndex(i, count, spacing, aspect);
  }
  return points;
}

export function concentricLayout(
  count: number,
  centerX = 0,
  centerY = 0,
  minR = 6,
  spacing = LAYOUT.spacing
): Point[] {
  const points: Point[] = [];
  let placed = 0;
  let ring = 0;

  while (placed < count) {
    const r = minR + ring * spacing;
    const capacity = Math.max(1, Math.floor((2 * Math.PI * r) / spacing));
    const angleStep = (2 * Math.PI) / capacity;

    for (let i = 0; i < capacity && placed < count; i++) {
      const angle = i * angleStep + ring * 0.22;
      points.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
      placed++;
    }
    ring++;
  }

  return points;
}

export function digitRadius(digit: number): number {
  const radii = [2.6, 3.1, 4.3, 5.6, 6.8, 8.0, 9.2, 10.4, 11.7, 12.9];
  return radii[digit] ?? 2.6;
}

export function layoutRadius(
  count: number,
  spacing = LAYOUT.spacing,
  aspect = LAYOUT.aspect
): number {
  const { cols, rows } = fieldDims(count, aspect);
  return Math.hypot(cols * spacing, rows * spacing) / 2;
}

export function rotatePoint(p: Point, angle: number): Point {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}
