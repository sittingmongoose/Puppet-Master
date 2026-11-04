// Decoder contract tests, including real ffmpeg invalid-input and lossless synthetic frame fixtures.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pip-scan-selftest-'));
const scanner = fileURLToPath(new URL('./pip_body_scan.mjs', import.meta.url));
let checks = 0;
const scan = (file, env = process.env) => spawnSync(process.execPath, [scanner, file, '--crop', '0,0,64,64'], { env, encoding: 'utf8' });
try {
  const invalid = path.join(root, 'invalid.mp4'); fs.writeFileSync(invalid, 'not a movie');
  assert.equal(scan(invalid).status, 2); checks++;
  for (const vanish of [false, true]) {
    const raw = Buffer.alloc(64 * 64 * 3 * 121);
    for (let f = 0; f < 121; f++) for (let i = 0; i < 64 * 64; i++) {
      const o = (f * 64 * 64 + i) * 3;
      raw[o + 1] = vanish && f === 60 ? 0 : 86; raw[o + 2] = vanish && f === 60 ? 0 : 179;
    }
    const movie = path.join(root, `fixture-${vanish}.nut`);
    const enc = spawnSync('ffmpeg', ['-v', 'error', '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', '64x64', '-framerate', '60', '-i', 'pipe:0', '-c:v', 'rawvideo', movie], { input: raw });
    assert.equal(enc.status, 0, enc.stderr.toString());
    const result = scan(movie), data = JSON.parse(result.stdout);
    assert.equal(result.status, vanish ? 1 : 0); assert.equal(data.frames, 121);
    assert.deepEqual(data.dips.map((d) => d.frame), vanish ? [60] : []); checks++;
  }
  // Faults are independent: zero frames with exit 0, complete frame then failure, partial trailing frame.
  const bin = path.join(root, 'bin'); fs.mkdirSync(bin);
  for (const [bytes, exit] of [[0, 0], [64 * 64 * 3, 1], [64 * 64 * 3 + 1, 0]]) {
    fs.writeFileSync(path.join(bin, 'ffmpeg'), `#!${process.execPath}\nprocess.stdout.write(Buffer.alloc(${bytes}), () => process.exit(${exit}));\n`, { mode: 0o755 });
    assert.equal(scan(invalid, { ...process.env, PATH: bin }).status, 2); checks++;
  }
  fs.unlinkSync(path.join(bin, 'ffmpeg'));
  assert.equal(scan(invalid, { ...process.env, PATH: bin }).status, 2); checks++;
  console.log(`PASS ${checks}: invalid input, valid decode, one-frame dropout, zero frames, failed decoder, trailing bytes, missing decoder`);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
