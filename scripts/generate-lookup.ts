import fs from "fs";
import path from "path";

const DIGITS_PATH = path.join(process.cwd(), "public", "pi-digits.txt");
const OUT_PATH = path.join(process.cwd(), "data", "pi-index-3-4.json");

function pad(n: number, len: number): string {
  return n.toString().padStart(len, "0");
}

function buildIndex(digits: string, length: number): Record<string, number> {
  const index: Record<string, number> = {};
  const total = 10 ** length;
  for (let i = 0; i < total; i++) {
    const key = pad(i, length);
    const pos = digits.indexOf(key);
    if (pos === -1) {
      throw new Error(`Missing ${length}-digit combo: ${key}`);
    }
    index[key] = pos;
  }
  return index;
}

const digits = fs.readFileSync(DIGITS_PATH, "utf8").trim();
if (digits.length < 1_000_000) {
  throw new Error(`Expected 1M digits, got ${digits.length}`);
}
if (!digits.startsWith("31415926535897932384")) {
  throw new Error("π digits checksum failed");
}

console.log(`Loaded ${digits.length} digits`);

const index3 = buildIndex(digits, 3);
console.log(`3-digit: ${Object.keys(index3).length} entries`);

const index4 = buildIndex(digits, 4);
console.log(`4-digit: ${Object.keys(index4).length} entries`);

const combined = { ...index3, ...index4 };
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(combined));
console.log(`Wrote ${OUT_PATH}`);
