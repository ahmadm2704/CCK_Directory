// One-off script: remove the white background from the CCK crest logo,
// keeping interior white details (candle, text ring) intact by only
// flood-filling from the image border.
const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "brand", "cck-crest.png");
const OUT = path.join(__dirname, "..", "public", "brand", "cck-crest.png");
const WHITE_THRESHOLD = 235; // min R/G/B to count as "background white"

async function main() {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const isBackground = new Uint8Array(width * height);
  const stack = [];

  function idx(x, y) {
    return y * width + x;
  }
  function isWhiteAt(x, y) {
    const i = idx(x, y) * channels;
    return data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD;
  }

  for (let x = 0; x < width; x++) {
    stack.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    stack.push([0, y], [width - 1, y]);
  }

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = idx(x, y);
    if (isBackground[p]) continue;
    if (!isWhiteAt(x, y)) continue;
    isBackground[p] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  let cleared = 0;
  for (let p = 0; p < width * height; p++) {
    if (isBackground[p]) {
      data[p * channels + 3] = 0;
      cleared++;
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT);
  console.log(`Done. Cleared ${cleared} / ${width * height} pixels as background.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
