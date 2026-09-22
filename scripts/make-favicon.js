// One-off script: build src/app/favicon.ico from the CCK crest source image.
// Removes the white background (same flood-fill approach as
// make-transparent-crest.js) so the crest sits cleanly in browser tabs,
// then packs multiple resolutions into a single .ico container.
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SRC = process.argv[2] || path.join("D:", "CCK", "media wall", "download.png");
const OUT = path.join(__dirname, "..", "src", "app", "favicon.ico");
const SIZES = [16, 32, 48, 64, 128, 256];
const WHITE_THRESHOLD = 235;

async function removeWhiteBackground(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const isBackground = new Uint8Array(width * height);
  const stack = [];

  const idx = (x, y) => y * width + x;
  const isWhiteAt = (x, y) => {
    const i = idx(x, y) * channels;
    return data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD;
  };

  for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = idx(x, y);
    if (isBackground[p]) continue;
    if (!isWhiteAt(x, y)) continue;
    isBackground[p] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  for (let p = 0; p < width * height; p++) {
    if (isBackground[p]) data[p * channels + 3] = 0;
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  let offset = headerSize;
  const entries = [];
  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(buffer.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset
    offset += buffer.length;
    entries.push(entry);
  }

  header.set(Buffer.concat(entries), 6);
  return Buffer.concat([header, ...pngBuffers.map((p) => p.buffer)]);
}

async function main() {
  const transparentPng = await removeWhiteBackground(SRC);

  const pngBuffers = await Promise.all(
    SIZES.map(async (size) => ({
      size,
      buffer: await sharp(transparentPng)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
    }))
  );

  fs.writeFileSync(OUT, buildIco(pngBuffers));
  console.log(`Wrote ${OUT} (${pngBuffers.length} sizes: ${SIZES.join(", ")})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
