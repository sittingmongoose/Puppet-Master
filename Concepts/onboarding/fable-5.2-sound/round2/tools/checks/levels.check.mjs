// Matches levels across the six looks and their songs, by measurement. Renders every event, Pip's line (in the look's
// voice and in each other take of it) and each song alone, offline, reads its loudness (BS.1770) in the page, and writes
// js/audio/levels.js: how many dB each event, the voice and each song must move to reach its target. It also reads how
// much of each event lies under 120 Hz: none of the window's sounds may thump. Run it again after changing an
// instrument, a gesture, a voice or a song:
//   browser-check run tools/checks/levels.check.mjs [--set write=1] [--set only=glass,nier]
// Without write=1 it only reports how far each is from its target (after the trims already in levels.js).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './browser-check.config.mjs';
const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
// loudest 400 ms of each event (LUFS); Pip's line and a song are integrated loudness. The stage's own noises (a prop
// lowered, set down, lifted; a hop; a sparkle) sit well under a click's answer.
export const TARGET = { tap: -40, hover: -44, key: -40, select: -33, toggleOn: -35, toggleOff: -36, next: -32, back: -34, open: -30, close: -31, warn: -31, lower: -41, ghost: -44, land: -41, lift: -44,
	hop: -40, swing: -45, tryOn: -31, sparkle: -38, confetti: -25, chapter: -29, tick: -33, block: -32, power: -33, score: -42, lock: -38, decode: -41, slice: -41, degauss: -36, feed: -38, powerOn: -31, powerOff: -33,
	rail: -40, tip: -35, cheer: -31, crew: -26, snore: -45, think: -38, wake: -29, sleep: -32, happy: -29, wink: -31, alert: -29, say: -26, music: -30 };
const EVENTS = Object.keys(TARGET).filter((e) => e !== 'say' && e !== 'music');
// a click is over before a loudness meter has seen it, so a short sound is also held under a peak (dBFS): the meter alone would turn it up too far
const CLICK = new Set(['tap', 'hover', 'key', 'score', 'lock', 'decode', 'rail', 'tick', 'slice', 'feed', 'think', 'lift', 'lower', 'ghost', 'swing', 'snore', 'land', 'hop']);
const PEAK = (ev) => (CLICK.has(ev) ? -20 : -12);
// the most an event may carry under 120 Hz, against its whole (dB, loudest tenth of a second): above this it is a thump
const LOW_MAX = -12;
// Pip's wordless sounds are a voice, not a knock: the low-end test is for the window's and the stage's sounds
const VOICED = new Set(['think', 'wake', 'sleep', 'happy', 'wink', 'alert']);
export const tests = {
	async 'levels'(t) {
		const only = t.args.only ? String(t.args.only).split(',') : null, write = !!t.args.write;
		await t.goto('tools/render.html' + (write ? '?notrims=1' : ''));
		await t.page.waitForFunction(() => !!(window.PipSound && window.PS5 && window.PS5.SONGS));
		if (write) await t.page.evaluate(() => { window.PS5.TRIMS = {}; });
		const file = path.join(ROOT, 'js', 'audio', 'levels.js');
		let old = {}; try { old = JSON.parse(/\/\* TRIMS:begin \*\/([\s\S]*?)\/\* TRIMS:end \*\//.exec(fs.readFileSync(file, 'utf8'))[1]); } catch (e) { /* first run */ }
		const out = {}; if (write && only) Object.assign(out, old);
		let n = 0, off = 0, main = 0, thumps = [];
		for (const k of KITS) {
			if (only && !only.includes(k)) continue;
			const m = await t.page.evaluate(async ({ k, EVENTS }) => {
				const P = window.PipSound, PS = window.PS5, r = { ev: {}, say: {}, music: {} };
				for (const ev of EVENTS) { const b = await P.render({ kit: k, seconds: ev === 'confetti' || ev === 'crew' ? 5 : ev === 'snore' ? 4.5 : 3, music: false, chapter: 2, script: [{ at: 0.2, play: ev === 'tryOn' ? 'sig' : ev, op: { index: 1, count: 4, len: 160 } }] }); const l = P.loudness(b); r.ev[ev] = { m: l.momentary, peak: l.peak, low: l.low }; }
				const LINES = [{ at: 0.2, say: 'Shall we set things up together? Right here works great.', mood: 'idle' }, { at: 4.4, say: "We're ready. Let's make something!", mood: 'happy' }];
				for (const v of [null].concat(Object.keys(PS.voice.ALT[k] || {}))) { const b = await P.render({ kit: k, voice: v, seconds: 8, music: false, script: LINES }); r.say[v || ''] = P.loudness(b).integrated; }
				for (const e of PS.SONGS[k]) { const b = await P.render({ kit: k, song: e.id, seconds: 40, chapter: 4, index: 10 }); r.music[e.song.id] = P.loudness(b).integrated; }
				return r;
			}, { k, EVENTS });
			const trims = {}; let line = '';
			for (const ev of EVENTS) {
				const x = m.ev[ev]; if (x.m <= -90) continue;                 // this look does not make that sound (hover outside NieR)
				const d = TARGET[ev] - x.m, cap = PEAK(ev) - x.peak; n++;
				if (x.low > LOW_MAX && !VOICED.has(ev)) thumps.push(`${k} ${ev} ${x.low} dB`);
				if (write) trims[ev] = Math.max(-18, Math.round(Math.min(d, cap, 12) * 2) / 2);
				else if (d < cap - 0.5) { if (Math.abs(d) > 2) { off++; line += ` ${ev} ${d > 0 ? '+' : ''}${d.toFixed(1)}`; } }
				else if (x.peak > PEAK(ev) + 1.5) { off++; line += ` ${ev} peak ${x.peak}`; }
			}
			for (const v of Object.keys(m.say)) {
				const d = TARGET.say - m.say[v];
				if (write) { if (v) out[k + '~' + v] = { say: Math.round(d * 2) / 2 }; else trims.say = Math.round(d * 2) / 2; }
				else { main = Math.max(main, Math.abs(d)); if (Math.abs(d) > 1) line += ` say${v ? '~' + v : ''} ${d > 0 ? '+' : ''}${d.toFixed(1)}`; }
			}
			for (const id of Object.keys(m.music)) {
				const d = TARGET.music - m.music[id];
				if (write) out[id] = { music: Math.round(d * 2) / 2 };
				else { main = Math.max(main, Math.abs(d)); if (Math.abs(d) > 1) line += ` ${id} ${d > 0 ? '+' : ''}${d.toFixed(1)}`; }
			}
			if (write) out[k] = trims;
			t.log(`${k}: say ${m.say['']} LUFS; songs ${Object.values(m.music).join(', ')} LUFS${write ? '' : (line ? '; off target:' + line : '; all on target')}`);
		}
		await t.check(`no event thumps (nothing over ${LOW_MAX} dB under 120 Hz)${thumps.length ? ': ' + thumps.join('; ') : ''}`, thumps.length === 0);
		if (write) {
			const body = '{\n' + Object.keys(out).sort().map((id) => `    ${JSON.stringify(id)}: ${JSON.stringify(out[id])}`).join(',\n') + '\n  }';
			fs.writeFileSync(file, `/* Pip's sound, round two (Fable 5.2). levels.js: measured, not written by hand (tools/checks/levels.check.mjs --set write=1).\n   For each look: the dB each event and Pip's line ("say") move to sit at its target loudness; "look~take" is another\n   take of the look's voice; a song's id has the dB that song moves ("music"). So a look is never louder than its\n   neighbour and changing the song never jumps. */\n(function (G) {\n  'use strict';\n  if (/[?&]notrims=1/.test(location.search)) return;\n  const T = /* TRIMS:begin */${body}/* TRIMS:end */;\n  G.PS5.TRIMS = T;\n})(window);\n`);
			await t.check(`wrote trims for ${Object.keys(out).length} entries`, true);
		} else {
			await t.check(`every spoken line and song within 1 dB of target (worst ${main.toFixed(1)} dB)`, main <= 1, 'run again with --set write=1');
			await t.check(`events within 2 dB of target, or held by the peak ceiling or the trim's floor: ${off} of ${n} are not (allowed: 5 %)`, off <= n * 0.05, 'run again with --set write=1');
		}
	}
};
