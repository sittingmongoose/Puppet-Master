/* frames-win.mjs: find each mark's first frame in a film by the corner marker's colour, then cut contact sheets of the
 * frames that follow it, cropped to the mark's region, every frame labelled with its number after the mark.
 *   node frames.mjs <label> [frames=48] [perSheet=24] [only=<substring>]
 * Writes <label>-frames/<mark>-<k>.png and <label>-frames/index.json. */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';

const [label, N = '48', PER = '24', only = ''] = process.argv.slice(2);
const DIR = 'C:/Users/sitti/pm-lg-films', FF = 'ffmpeg';
const film = JSON.parse(readFileSync(`${DIR}/${label}.json`, 'utf8'));
const mp4 = `${DIR}/${label}.mp4`;
const outDir = `${DIR}/${label}-frames`;
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
/* the marker: one averaged pixel per frame */
const raw = spawnSync(FF, ['-v', 'error', '-hwaccel', 'cuda', '-i', mp4, '-vf', 'crop=8:8:1908:1068,scale=1:1:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 }).stdout;
const px = []; for (let i = 0; i + 2 < raw.length; i += 3) px.push([raw[i], raw[i + 1], raw[i + 2]]);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
let from = 0; const found = [];
for (const m of film.marks) {
  const c = hex(m.color); let f = -1;
  for (let i = from; i < px.length; i++) if (px[i].every((v, k) => Math.abs(v - c[k]) < 60)) { f = i; break; }
  found.push({ name: m.name, frame: f, region: m.region }); if (f >= 0) from = f + 1;
}
const font = "fontfile='C\\:/Windows/Fonts/consola.ttf'";
for (let k = 0; k < found.length; k++) {
  const m = found[k]; if (m.frame < 0 || !m.region || (only && !m.name.includes(only))) continue;
  const end = Math.min(px.length - 1, k + 1 < found.length && found[k + 1].frame > 0 ? found[k + 1].frame - 1 : m.frame + Number(N), m.frame + Number(N));
  let [x, y, w, h] = m.region; const pad = 14;
  x = Math.max(0, x - pad); y = Math.max(0, y - pad); w = Math.min(1920 - x, w + 2 * pad); h = Math.min(1080 - y, h + 2 * pad);
  if (m.region[3] > 400) h = Math.min(h, 640);   /* the rail: its icons, not the whole column */
  if (m.region[2] < 120) w = Math.min(1920 - x, w + 40);
  const cols = Math.max(1, Math.min(12, Math.floor(1800 / w))), per = Math.min(Number(PER), cols * Math.max(1, Math.floor(1500 / (h + 18))));
  const rows = Math.ceil(per / cols), safe = m.name.replace(/[^a-z0-9]+/gi, '_');
  for (let a = m.frame - 2, part = 0; a <= end; a += per, part++) {
    const b = Math.min(end, a + per - 1);
    const vf = `select='between(n\\,${a}\\,${b})',crop=${w}:${h}:${x}:${y},pad=${w}:${h + 18}:0:18:black,` +
      `drawtext=${font}:text='%{eif\\:n+${a - m.frame}\\:d}':x=4:y=2:fontsize=14:fontcolor=white,tile=${cols}x${rows}:padding=2:color=0x303030`;
    execFileSync(FF, ['-v', 'error', '-y', '-i', mp4, '-vf', vf, '-frames:v', '1', '-fps_mode', 'passthrough', `${outDir}/${safe}-${part}.png`]);
  }
  m.sheets = Math.ceil((end - m.frame + 3) / per); m.end = end;
}
writeFileSync(`${outDir}/index.json`, JSON.stringify({ frames: px.length, marks: found }, null, 1));
console.log(JSON.stringify({ frames: px.length, marks: found.map((m) => [m.name, m.frame, m.end]) }));
