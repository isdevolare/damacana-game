// Generate placeholder PNG icons (192, 512, apple) — pure Node, no deps.
// Produces a tiny PNG with a solid background and a purple drop.
// Spec-compliant: 8-bit RGBA, single IDAT, manual zlib stored (uncompressed) deflate.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import path from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');
mkdirSync(PUBLIC, { recursive: true });

function makePng(size, drawer) {
  const w = size, h = size;
  const channels = 4;
  const raw = Buffer.alloc(w * h * channels);
  // background gradient-ish
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * channels;
      const cx = (x - w / 2) / (w / 2);
      const cy = (y - h / 2) / (h / 2);
      const d = Math.sqrt(cx * cx + cy * cy);
      const bg = Math.max(0, 1 - d) * 25;
      raw[i] = 5 + bg;       // R
      raw[i + 1] = 1 + bg;   // G
      raw[i + 2] = 13 + bg;  // B
      raw[i + 3] = 255;
    }
  }
  drawer(raw, w, h);
  return encodePng(raw, w, h);
}

function setPx(raw, w, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= w || y >= w) return;
  const i = (y * w + x) * 4;
  // alpha blend over current
  const ia = a / 255;
  raw[i] = Math.round(raw[i] * (1 - ia) + r * ia);
  raw[i + 1] = Math.round(raw[i + 1] * (1 - ia) + g * ia);
  raw[i + 2] = Math.round(raw[i + 2] * (1 - ia) + b * ia);
  raw[i + 3] = 255;
}

function drawDrop(raw, w, h) {
  const cx = w / 2;
  const cy = h / 2 + h * 0.05;
  const rx = w * 0.28;
  const ry = h * 0.35;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const stretch = ny < 0 ? ny * 1.6 : ny;
      const d = nx * nx + stretch * stretch;
      if (d <= 1) {
        const inner = 1 - d;
        const r = Math.round(184 - 60 * (1 - inner));
        const g = Math.round(122 + 50 * inner);
        const b = Math.round(255 - 10 * (1 - inner));
        setPx(raw, w, x, y, r, g, b, 255);
      }
    }
  }
  // highlight
  const hcx = cx - rx * 0.35;
  const hcy = cy - ry * 0.3;
  const hr = rx * 0.18;
  for (let y = -hr; y < hr; y++) {
    for (let x = -hr * 0.7; x < hr * 0.7; x++) {
      const d = (x * x) / (hr * 0.7 * hr * 0.7) + (y * y) / (hr * hr);
      if (d <= 1) setPx(raw, w, Math.round(hcx + x), Math.round(hcy + y), 255, 255, 255, 180);
    }
  }
}

// ---------- PNG encoding ----------
function encodePng(raw, w, h) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = chunk('IHDR', ihdr);

  // add filter byte per row
  const rowBytes = w * 4;
  const filtered = Buffer.alloc((rowBytes + 1) * h);
  for (let y = 0; y < h; y++) {
    filtered[y * (rowBytes + 1)] = 0;
    raw.copy(filtered, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }
  const compressed = zlib.deflateSync(filtered);
  const idat = chunk('IDAT', compressed);

  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idat, iend]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

let crcTable;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const png192 = makePng(192, drawDrop);
const png512 = makePng(512, drawDrop);
const appleTouch = makePng(180, drawDrop);
writeFileSync(path.join(PUBLIC, 'icon-192.png'), png192);
writeFileSync(path.join(PUBLIC, 'icon-512.png'), png512);
writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), appleTouch);
console.log('Wrote icon-192.png, icon-512.png, apple-touch-icon.png');
