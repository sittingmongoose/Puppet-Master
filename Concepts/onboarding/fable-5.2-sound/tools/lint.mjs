// Checks every tune on paper: bar counts, every melody note against the chord under it, leaps. No sound is made.
// usage: node tools/lint.mjs
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js', 'audio');
const win = { requestAnimationFrame: () => 0, performance: { now: () => 0 }, setTimeout, addEventListener() {}, location: { search: '' }, document: { addEventListener() {}, createElement: () => ({}) } }; win.window = win;
const ctx = vm.createContext(win);
for (const f of ['core.js', 'inst.js', 'music.js', 'voice.js', 'sfx.js', 'concept1.js', 'concept2.js', 'concept3.js']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
const PS = win.PS5; let bad = 0, n = 0;
for (const c of Object.values(PS.concepts)) for (const [look, L] of Object.entries(c.looks)) {
  n++;
  try {
    const C = PS.music.compile(L.song), issues = PS.music.lint(L.song);
    const secs = Object.values(C.sections).map((s) => `${s.name}:${s.bars}`).join(' ');
    const bar = (L.song.meter * 60) / L.song.bpm;
    console.log(`${L.song.id.padEnd(13)} ${String(L.song.bpm).padStart(3)} bpm ${L.song.meter}/x  bar ${bar.toFixed(2)} s  sections ${secs}  notes to make ${C.need.size}${issues.length ? '' : '  ok'}`);
    issues.forEach((i) => { bad++; console.log('   ! ' + i); });
    for (const g of ['gest']) if (!PS.sfx[c[g]]) { bad++; console.log('   ! no gesture set ' + c[g]); }
    for (const role of Object.values(L.pal)) if (typeof role === 'string' && !PS.inst.DEF[role] && !PS.inst.SYNTH[role] && !PS.inst.DRUM[role] && !/^nz/.test(role)) { bad++; console.log('   ! palette names nothing: ' + role); }
    for (const [tn, T] of Object.entries(L.song.tracks)) if (T.inst && !PS.inst.DEF[T.inst] && !PS.inst.SYNTH[T.inst]) { bad++; console.log(`   ! ${tn}: no instrument ${T.inst}`); }
  } catch (e) { bad++; console.log(`${L.song.id}: ${e.message}`); }
}
console.log(`${n} tunes, ${bad} problem${bad === 1 ? '' : 's'}`);
process.exit(bad ? 1 : 0);
