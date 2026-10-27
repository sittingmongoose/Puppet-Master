#!/usr/bin/env node
/* Pip's sound levels: renders every kit x event (and Pip's voice, and every loop) offline in a headless GPU browser
   (agent-browser) through sound.js and reports peak, active RMS, length, DC and how much sits above 10 kHz.
   Fails (exit 1) on clipping (peak above -1 dBFS), NaN, silence or DC.

     PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node tools/sound_levels.mjs           check
     PLAYWRIGHT_CORE=... node tools/sound_levels.mjs --write                                       measure, write the
                                                                    TRIM and MAKEUP blocks into sound.js, then check
   playwright-core is only used for connectOverCDP: `npm i playwright-core` anywhere and point PLAYWRIGHT_CORE at it. */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright-core'); } catch (e) { pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core'); }
const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOUND = path.join(HERE, 'sound.js');
const URL_ = pathToFileURL(path.join(HERE, 'sounds.html')).href;
const WRITE = process.argv.includes('--write');

async function measure(page, mode) {
  return page.evaluate(async (mode) => {
    const P = window.PipSound, out = [];
    const raw = mode === 'raw';
    for (const kit of P.KITS) {
      const jobs = P.EVENTS.map((e) => ['play', e]).concat([['say', 'say']], P.LOOPS.map((l) => ['loop', l]));
      for (const [kind, name] of jobs) {
        const buf = await P._render(kit, kind, name, {}, { raw, notrim: raw, seconds: kind === 'loop' ? 8 : undefined });
        const s = P._stats(buf, { whole: kind === 'loop' });
        const key = kind === 'loop' ? 'loop:' + name : name;
        const subtle = (P.SUBTLE[kit] || []).indexOf(name) >= 0;
        out.push(Object.assign({ kit, kind, name, key, target: P.TARGET[key] - (subtle ? 7 : 0) + (((P.OFFSET || {})[kit] || {})[key] || 0) }, s));
      }
    }
    return { rows: out, chain: await P._chainGain(), makeup: P._MAKEUP };
  }, mode);
}

function writeBlock(src, tag, value) {
  const re = new RegExp(`/\\* ${tag}:begin \\*/[\\s\\S]*?/\\* ${tag}:end \\*/`);
  if (!re.test(src)) throw new Error('no ' + tag + ' block in sound.js');
  return src.replace(re, `/* ${tag}:begin */${value}/* ${tag}:end */`);
}

const s = JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank']).toString());
let browser, failed = 0;
try {
  browser = await pw.chromium.connectOverCDP(s.cdp_endpoint);
  const page = browser.contexts()[0].pages()[0];
  page.on('pageerror', (e) => { console.log('pageerror', String(e)); failed++; });
  await page.goto(URL_, { waitUntil: 'load' });
  if (WRITE) {
    const m = await measure(page, 'raw'), trim = {};
    m.rows.forEach((r) => {
      if (r.rmsDb < -150) return;
      // as loud as it is heard (A-weighted), but never more than 3 dB over the target in plain energy: a low thump or
      // hum would otherwise be raised until it booms on speakers that can play it
      (trim[r.kit] = trim[r.kit] || {})[r.key] = Math.round(Math.max(-30, Math.min(30, r.target - r.rmsDb, r.target + 3 - r.rmsZ)) * 2) / 2;
    });
    let src = readFileSync(SOUND, 'utf8');
    const makeup = Math.round(m.chain * 1000) / 1000;
    src = writeBlock(src, 'TRIM', JSON.stringify(trim));
    src = writeBlock(src, 'MAKEUP', String(makeup));
    writeFileSync(SOUND, src);
    console.log(`wrote TRIM for ${Object.keys(trim).length} kits; chain make-up ${makeup}`);
    await page.reload({ waitUntil: 'load' });
  }
  const m = await measure(page, 'check');
  console.log(`chain gain below threshold: ${m.chain.toFixed(3)} (MAKEUP in sound.js: ${m.makeup})`);
  const bad = [], warn = [];
  m.rows.forEach((r) => {
    const why = [];
    if (r.nan) why.push(`NaN x${r.nan}`);
    if (r.peakDb > -1) why.push(`peak ${r.peakDb}`);
    if (r.rmsDb < -70) why.push('silent');
    if (Math.abs(r.dc) > 0.005) why.push(`DC ${r.dc}`);
    if (why.length) bad.push(`${r.kit}/${r.key}: ${why.join(', ')}`);
    if (!why.length && Math.abs(r.rmsDb - r.target) > 4 && r.rmsZ < r.target + 2.5) warn.push(`${r.kit}/${r.key}: ${r.rmsDb} vs ${r.target}`);
    if (r.hfDb > -10 && r.dur > 0.3) warn.push(`${r.kit}/${r.key}: bright above 10 kHz (${r.hfDb} dB)`);
  });
  const kits = [...new Set(m.rows.map((r) => r.kit))];
  console.log('\nkit        events  rms (min/median/max)   peak max  longest');
  kits.forEach((k) => {
    const rs = m.rows.filter((r) => r.kit === k), v = rs.map((r) => r.rmsDb).sort((a, b) => a - b);
    const pk = Math.max(...rs.map((r) => r.peakDb)), lg = rs.reduce((a, r) => (r.dur > a.dur ? r : a), rs[0]);
    console.log(`${k.padEnd(10)} ${String(rs.length).padStart(6)}  ${v[0]} / ${v[Math.floor(v.length / 2)]} / ${v[v.length - 1]}`.padEnd(46) + `${pk}`.padStart(8) + `  ${lg.key} ${lg.dur}s`);
  });
  const groups = { ui: ['tap', 'hover', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'key'], foley: ['lower', 'land', 'lift', 'hop', 'rail', 'sparkle'], voice: ['say', 'wake', 'sleep', 'think', 'happy', 'wink', 'alert'], stings: ['cheer', 'chapter', 'power', 'tick', 'block'], big: ['confetti', 'crew'], loops: ['loop:snore', 'loop:work', 'loop:power', 'loop:swing', 'loop:bed'] };
  console.log('\ngroup   mean rms per kit (' + kits.join(', ') + ')');
  Object.entries(groups).forEach(([g, keys]) => {
    console.log(g.padEnd(7) + ' ' + kits.map((k) => { const rs = m.rows.filter((r) => r.kit === k && keys.includes(r.key)); return (rs.reduce((a, r) => a + r.rmsDb, 0) / rs.length).toFixed(1); }).join('  '));
  });
  if (warn.length) console.log('\nwarnings:\n  ' + warn.join('\n  '));
  if (bad.length) { console.log('\nFAILURES:\n  ' + bad.join('\n  ')); failed += bad.length; }
  writeFileSync('/tmp/opus-snd-levels.json', JSON.stringify(m.rows, null, 1));
  console.log(`\n${m.rows.length} takes; ${bad.length} failures, ${warn.length} warnings (full table: /tmp/opus-snd-levels.json)`);
} finally {
  if (browser) await browser.close().catch(() => {});
  execFileSync('agent-browser', ['stop', s.id]);
}
process.exit(failed ? 1 : 0);
