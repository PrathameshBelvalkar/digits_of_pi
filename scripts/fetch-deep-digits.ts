import fs from "fs";
import path from "path";
import { DEEP_DEPTH, LOCAL_DEPTH } from "../lib/chunk-search";

const OUT_PATH = path.join(process.cwd(), "data", "pi-deep.txt");
const LOCAL_PATH = path.join(process.cwd(), "public", "pi-digits.txt");
const SOURCE =
  "https://stuff.mit.edu/afs/sipb/contrib/pi/pi-billion.txt";
const RANGE_END = DEEP_DEPTH + 8;

async function main() {
  const local = fs.readFileSync(LOCAL_PATH, "utf8").trim();
  if (local.length < LOCAL_DEPTH || !local.startsWith("31415926535897932384")) {
    throw new Error("Local π digits are missing or invalid");
  }

  if (fs.existsSync(OUT_PATH)) {
    const existing = fs.statSync(OUT_PATH).size;
    if (existing >= DEEP_DEPTH) {
      const fh = await fs.promises.open(OUT_PATH, "r");
      const prefix = Buffer.alloc(LOCAL_DEPTH);
      await fh.read(prefix, 0, LOCAL_DEPTH, 0);
      await fh.close();
      if (prefix.toString("ascii") === local.slice(0, LOCAL_DEPTH)) {
        console.log(`Already have ${existing} digits at ${OUT_PATH}`);
        return;
      }
    }
  }

  console.log(`Downloading first ${DEEP_DEPTH.toLocaleString()} digits…`);
  const res = await fetch(SOURCE, {
    headers: { Range: `bytes=0-${RANGE_END}` },
  });
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  const tmp = `${OUT_PATH}.tmp`;
  const out = fs.createWriteStream(tmp);
  const reader = res.body.getReader();
  let count = 0;
  const prefix = Buffer.alloc(LOCAL_DEPTH);

  while (count < DEEP_DEPTH) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    const cleaned = Buffer.alloc(value.length);
    let n = 0;
    for (let i = 0; i < value.length && count + n < DEEP_DEPTH; i++) {
      const b = value[i];
      if (b >= 48 && b <= 57) cleaned[n++] = b;
    }
    if (n === 0) continue;
    const slice = cleaned.subarray(0, n);
    if (count < LOCAL_DEPTH) {
      const need = Math.min(slice.length, LOCAL_DEPTH - count);
      slice.copy(prefix, count, 0, need);
    }
    if (!out.write(slice)) {
      await new Promise<void>((resolve) => out.once("drain", resolve));
    }
    count += n;
    if (count % 5_000_000 === 0) {
      console.log(`Wrote ${count.toLocaleString()} digits`);
    }
  }

  await new Promise<void>((resolve, reject) => {
    out.end(() => resolve());
    out.on("error", reject);
  });

  if (count < DEEP_DEPTH) {
    fs.unlinkSync(tmp);
    throw new Error(`Only received ${count} digits`);
  }

  if (prefix.toString("ascii") !== local.slice(0, LOCAL_DEPTH)) {
    fs.unlinkSync(tmp);
    throw new Error("Downloaded digits do not match local π file");
  }

  fs.renameSync(tmp, OUT_PATH);
  console.log(`Wrote ${OUT_PATH} (${count.toLocaleString()} digits)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
