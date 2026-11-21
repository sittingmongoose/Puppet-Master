// Checks every tune on paper: bar counts, every melody note against the chord under it, leaps. No sound is made.
// usage: node tools/lint.mjs
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js', 'audio');
const win = { requestAnimationFrame: () => 0, performance: { now: () => 0 }, setTimeout, clearTimeout, addEventListener() {}, location: { search: '', href: '' }, navigator: {}, document: { addEventListener() {}, createElement: () => ({}) } }; win.window = win;
const ctx = vm.createContext(win);
for (const f of ['core.js', 'inst.js', 'music.js', 'voice.js', 'sfx.js', 'concept1.js', 'concept2.js', 'concept3.js', 'original.js', 'looks.js']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
const PS = win.PS5; let bad = 0, n = 0;
const known = (name) => !!(PS.inst.DEF[name] || PS.inst.SYNTH[name] || PS.inst.DRUM[name]) || /^nz/.test(name);
for (const kit of PS.KITS) {
  const L = PS.LOOKS[kit];
  for (const role of Object.values(L.pal)) if (typeof role === 'string' && !known(role)) { bad++; console.log(`   ! ${kit}: palette names nothing: ${role}`); }
  if (!PS.SONGS[kit].some((e) => e.id === PS.DEFAULT_SONG[kit])) { bad++; console.log(`   ! ${kit}: no default song`); }
  if (PS.SONGS[kit].length !== 4) { bad++; console.log(`   ! ${kit}: ${PS.SONGS[kit].length} songs, not four`); }
  for (const e of PS.SONGS[kit]) {
    n++; const song = e.song, mark = e.id === PS.DEFAULT_SONG[kit] ? ' *' : '';
    if (song.kind === 'orig') { console.log(`${(kit + ' ' + e.id).padEnd(20)} ${String(song.bpm).padStart(5)} bpm  the tune of today, 8 bars  ok${mark}`); continue; }
    try {
      const C = PS.music.compile(song), issues = PS.music.lint(song);
      const secs = Object.values(C.sections).map((s) => `${s.name}:${s.bars}`).join(' ');
      const bar = (song.meter * 60) / song.bpm;
      console.log(`${(kit + ' ' + e.id).padEnd(20)} ${String(song.bpm).padStart(5)} bpm ${song.meter}/x  bar ${bar.toFixed(2)} s  ${song.title.padEnd(24)} sections ${secs}  notes to make ${C.need.size}${issues.length ? '' : '  ok'}${mark}`);
      issues.forEach((i) => { bad++; console.log('   ! ' + i); });
      for (const [tn, T] of Object.entries(song.tracks)) if (T.inst && !PS.inst.DEF[T.inst] && !PS.inst.SYNTH[T.inst]) { bad++; console.log(`   ! ${tn}: no instrument ${T.inst}`); }
      if (!PS.ROOMS[song.room]) { bad++; console.log(`   ! no room ${song.room}`); }
    } catch (err) { bad++; console.log(`${song.id}: ${err.message}`); }
  }
}
// every sound the window and the stage ask for has a gesture in every look
const EVENTS = ['tap', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'open', 'close', 'key', 'warn', 'lower', 'ghost', 'land', 'lift', 'hop', 'swing', 'tryOn', 'sparkle', 'confetti', 'chapter', 'tick', 'block', 'power', 'score', 'lock', 'decode', 'slice', 'degauss', 'feed', 'powerOn', 'powerOff', 'rail', 'tip', 'cheer', 'crew', 'snore', 'hover'];
for (const ev of EVENTS) if (!PS.sfx.SET[ev]) { bad++; console.log(`   ! no gesture for ${ev}`); }
console.log(`${n} songs (* the look's default), ${bad} problem${bad === 1 ? '' : 's'}`);
process.exit(bad ? 1 : 0);
