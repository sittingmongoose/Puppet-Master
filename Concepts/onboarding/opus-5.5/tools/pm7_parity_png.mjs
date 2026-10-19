/* Dependency-free Chrome screenshot PNG codec and exact RGBA comparison. */
import { deflateSync, inflateSync } from 'node:zlib';

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const table = Array.from({ length: 256 }, (_, i) => {
  for (let k = 0; k < 8; k++) i = (i & 1) ? 0xedb88320 ^ (i >>> 1) : i >>> 1;
  return i >>> 0;
});
function crc(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]), out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length); body.copy(out, 4); out.writeUInt32BE(crc(body), body.length + 4);
  return out;
}
export function encodePng({ width, height, data }) {
  if (data.length !== width * height * 4) throw Error('Invalid RGBA length');
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) Buffer.from(data.buffer, data.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  return Buffer.concat([signature, chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const paeth = (a, b, c) => {
  const p = a + b - c, x = Math.abs(p - a), y = Math.abs(p - b), z = Math.abs(p - c);
  return x <= y && x <= z ? a : y <= z ? b : c;
};
export function decodePng(bytes) {
  if (!bytes.subarray(0, 8).equals(signature)) throw Error('Not a PNG');
  let width, height, channels, ended = false;
  const parts = [];
  for (let p = 8; p < bytes.length;) {
    const n = bytes.readUInt32BE(p), type = bytes.toString('ascii', p + 4, p + 8), end = p + n + 12;
    if (end > bytes.length || crc(bytes.subarray(p + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw Error('Invalid PNG chunk/CRC');
    const data = bytes.subarray(p + 8, end - 4);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || ![2, 6].includes(data[9]) || data[10] || data[11] || data[12]) throw Error('Only non-interlaced 8-bit RGB/RGBA PNGs are supported');
      channels = data[9] === 6 ? 4 : 3;
    } else if (type === 'IDAT') parts.push(data);
    else if (type === 'IEND') { ended = true; break; }
    p = end;
  }
  if (!ended || !width || !height || width * height > 100_000_000) throw Error('Invalid PNG dimensions/end');
  const raw = inflateSync(Buffer.concat(parts)), stride = width * channels;
  if (raw.length !== (stride + 1) * height) throw Error('Invalid PNG scanline length');
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw Error('Invalid PNG filter');
    if (filter === 0) { raw.copy(pixels, y * stride, y * (stride + 1) + 1, (y + 1) * (stride + 1)); continue; }
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= channels ? pixels[i - channels] : 0;
      const b = y ? pixels[i - stride] : 0, c = y && x >= channels ? pixels[i - stride - channels] : 0;
      const prediction = filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : paeth(a, b, c);
      pixels[i] = (raw[y * (stride + 1) + x + 1] + prediction) & 255;
    }
  }
  if (channels === 4) return { width, height, data: pixels };
  const data = Buffer.alloc(width * height * 4, 255);
  for (let i = 0, j = 0; i < pixels.length; i += 3, j += 4) pixels.copy(data, j, i, i + 3);
  return { width, height, data };
}
export function diffPng(baseline, candidate, tolerance = 0, maxDiffPixels = 0) {
  const a = decodePng(baseline);
  if (baseline.equals(candidate)) return { width: a.width, height: a.height, rawDiffPixels: 0, diffPixels: 0, maxChannelDelta: 0, bounds: null, pass: true, heatmap: null };
  const b = decodePng(candidate);
  if (a.width !== b.width || a.height !== b.height) throw Error('Screenshot dimensions differ');
  const heat = Buffer.alloc(a.data.length), bounds = [a.width, a.height, -1, -1];
  let rawDiffPixels = 0, diffPixels = 0, maxChannelDelta = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    let delta = 0;
    for (let c = 0; c < 4; c++) delta = Math.max(delta, Math.abs(a.data[i + c] - b.data[i + c]));
    if (delta) rawDiffPixels++;
    if (delta > tolerance) {
      diffPixels++; const x = (i / 4) % a.width, y = Math.floor(i / 4 / a.width);
      bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
    }
    maxChannelDelta = Math.max(maxChannelDelta, delta);
    heat[i] = delta ? 255 : 0; heat[i + 1] = delta ? Math.min(255, delta * 4) : 0; heat[i + 3] = 255;
  }
  return { width: a.width, height: a.height, rawDiffPixels, diffPixels, maxChannelDelta,
    bounds: bounds[2] < 0 ? null : bounds, pass: diffPixels <= maxDiffPixels,
    heatmap: rawDiffPixels ? encodePng({ ...a, data: heat }) : null };
}
