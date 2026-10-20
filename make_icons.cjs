const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

fs.writeFileSync(path.resolve(__dirname, 'debug_test.txt'), 'hello from ' + __dirname);

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const typeBuf = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0; // Filter 0
    rgbaBuffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function renderThickO(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  // Proportions for thick bold capital "O"
  const RoutX = size * 0.385;
  const RoutY = size * 0.425;
  const RinX = size * 0.200;
  const RinY = size * 0.240;

  // 4x4 sub-pixel grid for smooth anti-aliasing
  const SAMPLES = 4;
  const step = 1 / SAMPLES;

  let idx = 0;
  for (let y = 0; y < size; y++) {
    const t = y / size;
    // Gradient from vibrant Apple blue (#0A84FF) to deep royal blue (#0066E6)
    const r = Math.round(10 * (1 - t) + 0 * t);
    const g = Math.round(132 * (1 - t) + 102 * t);
    const b = Math.round(255 * (1 - t) + 230 * t);

    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        const py = y + (sy + 0.5) * step - cy;
        const normYOut = py / RoutY;
        const normYIn = py / RinY;

        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = x + (sx + 0.5) * step - cx;
          const normXOut = px / RoutX;
          const normXIn = px / RinX;

          const dOut = normXOut * normXOut + normYOut * normYOut;
          const dIn = normXIn * normXIn + normYIn * normYIn;

          if (dOut <= 1.0 && dIn >= 1.0) {
            hits++;
          }
        }
      }

      if (hits > 0) {
        const alpha = Math.round((hits / (SAMPLES * SAMPLES)) * 255);
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = alpha;
      } else {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
      idx += 4;
    }
  }

  return createPng(size, size, buf);
}

function createIco(pngEntries) {
  const count = pngEntries.length;
  const header = Buffer.alloc(6 + count * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  for (let i = 0; i < count; i++) {
    const { width, height, buffer } = pngEntries[i];
    const entryOffset = 6 + i * 16;
    header.writeUInt8(width >= 256 ? 0 : width, entryOffset);
    header.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4); // Planes
    header.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    header.writeUInt32LE(buffer.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...pngEntries.map(p => p.buffer)]);
}

// Generate all sizes
const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
const pngs = {};

for (const s of sizes) {
  pngs[s] = renderThickO(s);
}

const iconsDir = path.resolve(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Write PNG icons for Tauri
fs.writeFileSync(path.join(iconsDir, '32x32.png'), pngs[32]);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), pngs[128]);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), pngs[256]);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), pngs[512]);

// 2. Build multi-resolution ICO (16, 24, 32, 48, 64, 128, 256)
const icoEntries = [16, 24, 32, 48, 64, 128, 256].map(s => ({
  width: s,
  height: s,
  buffer: pngs[s]
}));
const icoBuffer = createIco(icoEntries);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

// 3. Write SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="odiseaBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0A84FF" />
      <stop offset="100%" stop-color="#0066E6" />
    </linearGradient>
  </defs>
  <path fill-rule="evenodd" clip-rule="evenodd" d="
    M 256 38.4
    C 364.887 38.4 453.12 135.808 453.12 256
    C 453.12 376.192 364.887 473.6 256 473.6
    C 147.113 473.6 58.88 376.192 58.88 256
    C 58.88 135.808 147.113 38.4 256 38.4
    Z
    M 256 133.12
    C 199.344 133.12 153.6 188.134 153.6 256
    C 153.6 323.866 199.344 378.88 256 378.88
    C 312.656 378.88 358.4 323.866 358.4 256
    C 358.4 188.134 312.656 133.12 256 133.12
    Z
  " fill="url(#odiseaBlueGrad)" />
</svg>`;

const publicDir = path.resolve(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'odisea-icon.svg'), svg);
fs.writeFileSync(path.join(publicDir, 'vite.svg'), svg);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

console.log('Icons successfully generated!');
