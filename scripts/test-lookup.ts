import fs from "fs";
import path from "path";
import { findNumber, setPiDigits } from "../lib/pi-lookup";
import { createSearchState, searchChunk } from "../lib/chunk-search";

const digits = fs
  .readFileSync(path.join(process.cwd(), "public", "pi-digits.txt"), "utf8")
  .trim();
setPiDigits(digits);

let failed = 0;

for (let len = 3; len <= 4; len++) {
  for (let i = 0; i < 10 ** len; i++) {
    const key = i.toString().padStart(len, "0");
    const result = findNumber(key, digits);
    if (!result || result.index < 0) {
      console.error(`FAIL: ${key}`);
      failed++;
    } else if (digits.slice(result.index, result.index + len) !== key) {
      console.error(`MISMATCH: ${key} at ${result.index}`);
      failed++;
    }
  }
}

const known = findNumber("1415", digits);
if (!known || digits.slice(known.index, known.index + 4) !== "1415") {
  console.error("FAIL known 1415");
  failed++;
}

const long = findNumber("14159265", digits);
if (!long || long.index !== 1) {
  console.error("FAIL 14159265 expected index 1, got", long);
  failed++;
}

const needle = Buffer.from("999888");
const first = searchChunk(
  createSearchState(100),
  Buffer.from("12345999"),
  needle
);
const second = searchChunk(first.state, Buffer.from("888321"), needle);
if (!second.hit || second.hit.index !== 105) {
  console.error("FAIL chunk overlap", second.hit);
  failed++;
} else if (second.hit.window.indexOf("999888") < 0) {
  console.error("FAIL chunk window", second.hit.window);
  failed++;
}

if (failed > 0) {
  console.error(`${failed} failures`);
  process.exit(1);
}

console.log("All lookup tests passed");
