import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Sample the white S used in the site header, before the SigmaCX wordmark.
const source = new URL("../public/media/logo-white.png", import.meta.url);
const { data, info } = await sharp(fileURLToPath(source))
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const inside = (x, y) => {
  const offset = (y * info.width + x) * info.channels;
  return data[offset + 3] > 128 && data[offset] > 200 && data[offset + 1] > 200 && data[offset + 2] > 200;
};
// The first empty column after the symbol separates it from the lettering.
let symbolEnd = 0;
let symbolStarted = false;
for (let x = 0; x < info.width; x++) {
  let occupied = false;
  for (let y = 0; y < info.height && !occupied; y++) occupied = inside(x, y);
  if (occupied) symbolStarted = true;
  else if (symbolStarted) {
    symbolEnd = x;
    break;
  }
}
if (!symbolEnd) throw new Error("Could not separate the S from the SigmaCX lettering");
let left = info.width, right = 0, top = info.height, bottom = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < symbolEnd; x++) {
    if (!inside(x, y)) continue;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
}
if (right <= left || bottom <= top) throw new Error("Sigma mark is empty");
const halton = (index, base) => {
  let value = 0, fraction = 1;
  while (index > 0) {
    fraction /= base;
    value += fraction * (index % base);
    index = Math.floor(index / base);
  }
  return value;
};
const samples = [];
const scale = 2.2 / (bottom - top);
for (let index = 1; samples.length < 4096; index++) {
  const x = left + halton(index, 2) * (right - left);
  const y = top + halton(index, 3) * (bottom - top);
  if (!inside(Math.round(x), Math.round(y))) continue;
  samples.push([
    Number(((x - (left + right) / 2) * scale).toFixed(5)),
    Number((((top + bottom) / 2 - y) * scale).toFixed(5)),
  ]);
}
await fs.writeFile(new URL("../src/components/sigmaLogoPoints.json", import.meta.url), `${JSON.stringify(samples)}\n`);
