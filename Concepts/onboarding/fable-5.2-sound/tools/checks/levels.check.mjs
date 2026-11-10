// Matches levels across the three concepts and six looks, by measurement. Renders every event, Pip's line and each
// tune alone, offline, reads its loudness (BS.1770) in the page, and writes js/audio/levels.js: for each look, how many
// dB each event, the voice and the tune must move to reach its target. Run it again after changing an instrument, a
// gesture or a tune:
//   browser-check run tools/checks/levels.check.mjs [--set write=1] [--set only=c2-glass]
// Without write=1 it only reports how far each is from its target (after the trims already in levels.js).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './browser-check.config.mjs';
const CONCEPTS = ['c1', 'c2', 'c3'], KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
// loudest 400 ms of each event (LUFS); Pip's line and the tune are integrated loudness
export const TARGET = { tap: -40, hover: -44, key: -40, select: -33, toggleOn: -35, toggleOff: -36, next: -32, back: -34, open: -29, close: -30, warn: -30, lower: -37, ghost: -44, land: -35, lift: -39,
	hop: -36, swing: -44, tryOn: -31, sparkle: -35, confetti: -24, chapter: -28, tick: -33, block: -31, power: -32, score: -42, lock: -38, decode: -40, slice: -40, degauss: -35, feed: -36, powerOn: -31, powerOff: -33,
	rail: -40, tip: -35, cheer: -29, crew: -25, snore: -45, think: -38, wake: -29, sleep: -32, happy: -29, wink: -31, alert: -29, say: -26, music: -30 };
const EVENTS = Object.keys(TARGET).filter((e) => e !== 'say' && e !== 'music');
// a click is over before a loudness meter has seen it, so a short sound is also held under a peak (dBFS): the meter alone would turn it up too far
const CLICK = new Set(['tap', 'hover', 'key', 'score', 'lock', 'decode', 'rail', 'tick', 'slice', 'feed', 'think', 'lift', 'lower', 'ghost', 'swing', 'snore']);
const PEAK = (ev) => (CLICK.has(ev) ? -20 : -12);
export const tests = {
	async 'levels'(t) {
		const only = t.args.only ? String(t.args.only).split(',') : null, write = !!t.args.write;
		await t.goto('tools/render.html' + (write ? '?notrims=1' : ''));
		await t.page.waitForFunction(() => !!(window.PipSound && window.PS5 && window.PS5.concepts.c3));
		if (write) await t.page.evaluate(() => { window.PS5.TRIMS = {}; });
		const file = path.join(ROOT, 'js', 'audio', 'levels.js');
		let old = {}; try { old = JSON.parse(/\/\* TRIMS:begin \*\/([\s\S]*?)\/\* TRIMS:end \*\//.exec(fs.readFileSync(file, 'utf8'))[1]); } catch (e) { /* first run */ }
		const out = write ? Object.assign({}, old) : {}; let worst = 0, n = 0, off = 0, main = 0;
		for (const c of CONCEPTS) for (const k of KITS) {
			const id = c + '-' + k; if (only && !only.includes(id)) continue;
			const m = await t.page.evaluate(async ({ c, k, EVENTS }) => {
				const P = window.PipSound, r = {};
				for (const ev of EVENTS) { const b = await P.render({ concept: c, kit: k, seconds: ev === 'confetti' || ev === 'crew' ? 5 : ev === 'snore' ? 4.5 : 3, music: false, chapter: 2, script: [{ at: 0.2, play: ev === 'tryOn' ? 'sig' : ev, op: { index: 1, count: 4, chapter: 2, len: 160 } }] }); const l = P.loudness(b); r[ev] = l.momentary; r['peak:' + ev] = l.peak; }
				let b = await P.render({ concept: c, kit: k, seconds: 7.5, music: false, script: [{ at: 0.2, say: 'Shall we set things up together? Right here works great.', mood: 'idle' }, { at: 4.2, say: "We're ready. Let's make something!", mood: 'happy' }] }); r.say = P.loudness(b).integrated;
				b = await P.render({ concept: c, kit: k, seconds: 40, chapter: 4, index: 10 }); r.music = P.loudness(b).integrated;
				return r;
			}, { c, k, EVENTS });
			const trims = {}; let line = '';
			for (const ev of Object.keys(TARGET)) {
				if (m[ev] <= -90) continue;                                 // this look does not make that sound (hover outside NieR)
				const d = TARGET[ev] - m[ev]; if (ev !== 'say' && ev !== 'music') n++;
				const pk = m['peak:' + ev], cap = pk == null ? 99 : PEAK(ev) - pk;
				if (write) trims[ev] = Math.max(-18, Math.round(Math.min(d, cap, 12) * 2) / 2);
				else if (ev === 'say' || ev === 'music') { main = Math.max(main, Math.abs(d)); if (Math.abs(d) > 1) line += ` ${ev} ${d > 0 ? '+' : ''}${d.toFixed(1)}`; }
				else if (d < cap - 0.5 || pk == null) { worst = Math.max(worst, Math.abs(d)); if (Math.abs(d) > 2) { off++; line += ` ${ev} ${d > 0 ? '+' : ''}${d.toFixed(1)}`; } }
				else if (pk > PEAK(ev) + 1.5) { off++; line += ` ${ev} peak ${pk}`; }
			}
			if (write) out[id] = trims;
			t.log(`${id}: say ${m.say} LUFS, tune ${m.music} LUFS${write ? '' : (line ? '; off target:' + line : '; all within 1.5 dB')}`);
		}
		if (write) {
			const body = '{\n' + Object.keys(out).sort().map((id) => `    ${JSON.stringify(id)}: ${JSON.stringify(out[id])}`).join(',\n') + '\n  }';
			fs.writeFileSync(file, `/* Pip's sound (Fable 5.2). levels.js: measured, not written by hand (tools/checks/levels.check.mjs --set write=1).\n   For each concept and look: the dB each event, Pip's line ("say") and the tune ("music") move to sit at its target\n   loudness, so a look is never louder than its neighbour and switching concepts never jumps. */\n(function (G) {\n  'use strict';\n  if (/[?&]notrims=1/.test(location.search)) return;\n  const T = /* TRIMS:begin */${body}/* TRIMS:end */;\n  const PS = G.PS5; PS.TRIMS = {};\n  Object.keys(T).forEach((id) => { PS.TRIMS[id] = T[id]; });\n})(window);\n`);
			await t.check(`wrote trims for ${Object.keys(out).length} looks`, true);
		} else {
			await t.check(`every look's spoken line and tune within 1 dB of target (worst ${main.toFixed(1)} dB)`, main <= 1, 'run again with --set write=1');
			// a few sounds cannot reach their target: a click held under its peak ceiling, Pip's long "hmm" at the trim's floor
			await t.check(`events within 2 dB of target, or held by the peak ceiling or the trim's floor: ${off} of ${n} are not (allowed: 5 %)`, off <= n * 0.05, 'run again with --set write=1');
		}
	}
};
