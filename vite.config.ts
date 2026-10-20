import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';

// Generator for the Odisea thick blue capital "O" app icons
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type: string, data: Buffer): Buffer {
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

function createPng(width: number, height: number, rgbaBuffer: Buffer): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0;
    rgbaBuffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function renderThickOPng(size: number): Buffer {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const Rout = size * 0.38;
  const Rin = size * 0.19;
  const cornerRadius = size * 0.19;

  const SAMPLES = 4;
  const step = 1 / SAMPLES;

  let idx = 0;
  for (let y = 0; y < size; y++) {
    const t = y / size;
    const rBlue = Math.round(10 * (1 - t) + 0 * t);
    const gBlue = Math.round(132 * (1 - t) + 102 * t);
    const bBlue = Math.round(255 * (1 - t) + 230 * t);

    for (let x = 0; x < size; x++) {
      let hitsO = 0;
      let hitsCard = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        const py = y + (sy + 0.5) * step;
        const dy = py - cy;
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = x + (sx + 0.5) * step;
          const dx = px - cx;

          // Check rounded card (white background)
          const qx = Math.abs(dx) - (size / 2 - cornerRadius);
          const qy = Math.abs(dy) - (size / 2 - cornerRadius);
          const distCard = Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - cornerRadius;
          if (distCard <= 0) {
            hitsCard++;
          }

          // Check circle ring "O"
          const distFromCenter = Math.hypot(dx, dy);
          if (distFromCenter <= Rout && distFromCenter >= Rin) {
            hitsO++;
          }
        }
      }

      if (hitsCard > 0) {
        const cardAlpha = hitsCard / (SAMPLES * SAMPLES);
        const oCoverage = hitsO / (SAMPLES * SAMPLES);

        // Blend white background (#ffffff) with blue "O"
        const rPix = Math.round(255 * (1 - oCoverage) + rBlue * oCoverage);
        const gPix = Math.round(255 * (1 - oCoverage) + gBlue * oCoverage);
        const bPix = Math.round(255 * (1 - oCoverage) + bBlue * oCoverage);
        const aPix = Math.round(cardAlpha * 255);

        buf[idx] = rPix;
        buf[idx + 1] = gPix;
        buf[idx + 2] = bPix;
        buf[idx + 3] = aPix;
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

function generateIcons() {
  try {
    const iconsDir = path.resolve(__dirname, 'src-tauri/icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(iconsDir, '32x32.png'), renderThickOPng(32));
    fs.writeFileSync(path.join(iconsDir, '128x128.png'), renderThickOPng(128));
    fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), renderThickOPng(256));
    fs.writeFileSync(path.join(iconsDir, 'icon.png'), renderThickOPng(512));
  } catch (e) {
    console.warn('Could not generate icons in vite.config:', e);
  }
}

// Automatically ensure icons are generated when Vite config loads
generateIcons();

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**', '**/odisea_data/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
