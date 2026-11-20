// Renders what the pages play, offline, and writes WAV files for tools/measure.mjs and for a listener.
//   browser-check run tools/checks/render.check.mjs --set out=/abs/scratch/dir [--set kits=friendly,glass] [--set songs=encore,band]
//       [--set kinds=talk,voices,reel,journey,full,jam,busy] [--set trace=/abs/trace.json]
// talk: Pip's six lines in the look's voice, no music.      voices: the same lines in each other take of the voice.
// reel: the window's sounds one after another, no music.    journey: one song from Pip asleep through every chapter
// (60 s, with the clicks a person makes on the way).        full: one song with everything playing (34 s).
// jam: the look's own song with clicks and a line on top.   busy: the worst moment a click can cause, five times.
// trace: a walk recorded on the page (page.check.mjs writes one), played back exactly.
import fs from 'node:fs';
import path from 'node:path';
export const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
export const SONGS = ['encore', 'band', 'waltz', 'original'];
export const LINES = [['Oh! Hi. I\'m Pip.', 'happy'], ['Shall we set things up together?', 'idle'], ['Hmm, that key didn\'t work.', 'oops'], ['Right here works great.', 'happy'], ['What shall we call it?', 'wonder'], ['We\'re ready. Let\'s make something!', 'happy']];
export const REEL = ['tap', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'key', 'key', 'key', 'warn', 'lower', 'land', 'lift', 'hop', 'sparkle', 'tip', 'tick', 'block', 'power', 'chapter', 'open', 'close', 'cheer', 'confetti'];
export function reelScript() { let at = 0.3; const script = []; REEL.forEach((play, i) => { script.push({ at, play, op: { index: i % 4, count: 4, chapter: 2 } }); at += /confetti|open|close|chapter/.test(play) ? 2.6 : /key/.test(play) ? 0.16 : 0.9; }); return { script, seconds: at + 2 }; }
export function talkScript() { let at = 0.3; const script = LINES.map(([say, mood]) => { const e = { at, say, mood }; at += 0.6 + say.length / 28; return e; }); return { script, seconds: at + 1 }; }
// the journey: asleep, the wake at 9 s, a new chapter at 18, 27.5, 37 and 46.5 s (the window's own two calls for it:
// 'next' with the chapter, and the stage's 'chapter' a moment later), and a plain next screen in between
export function journeyScript() {
	const idx = [0, 2, 3, 9, 10], script = [{ at: 0, asleep: true, chapter: 0, index: 0 }, { at: 9, asleep: false, play: 'wake' }];
	[1, 2, 3, 4].forEach((ch, i) => {
		const at = 18 + i * 9.5; script.push({ at, chapter: ch, index: idx[ch], play: 'next', op: { chapter: ch } }, { at: at + 0.3, play: 'chapter', op: { chapter: ch } });
		if (i < 3) script.push({ at: at + 4.7, index: idx[ch] + 1, play: 'next', op: { chapter: ch } });
	});
	script.push({ at: 30, flag: ['work', true] }, { at: 36, flag: ['work', false] }, { at: 40, flag: ['power', true] });
	return { script, seconds: 60 };
}
// what one Continue can set off at once: the step, the stage's chapter sting, props leaving and arriving, Pip's
// happy sound, and the new screen's line
export function busyScript() {
	const script = []; let at = 3;
	[1, 2, 3, 4, 4].forEach((ch, i) => {
		script.push({ at, chapter: ch, index: 2 + i, play: 'next', op: { chapter: ch } }, { at: at + 0.02, play: 'happy' }, { at: at + 0.05, play: 'lift' }, { at: at + 0.08, play: 'lift' }, { at: at + 0.12, play: 'lower' }, { at: at + 0.2, play: 'lower' },
			{ at: at + 0.3, play: 'chapter', op: { chapter: ch } }, { at: at + 0.34, play: 'land' }, { at: at + 0.4, play: 'land' }, { at: at + 0.46, play: 'land' }, { at: at + 0.5, play: 'sparkle' }, { at: at + 0.12, say: LINES[i % LINES.length][0], mood: LINES[i % LINES.length][1] },
			{ at: at + 2.6, play: 'tap' }, { at: at + 2.61, play: 'select' }, { at: at + 2.63, play: 'cheer' }, { at: at + 2.7, play: 'sparkle' }, { at: at + 2.75, say: 'Right here works great.', mood: 'happy' });
		at += 5.4;
	});
	return { script, seconds: at + 2 };
}
function specs(kit, kinds, songs, alts, def) {
	const out = [];
	if (kinds.includes('talk')) { const s = talkScript(); out.push({ name: `${kit}-talk`, spec: { kit, seconds: s.seconds, music: false, script: s.script } }); }
	if (kinds.includes('voices')) alts.forEach((alt) => { const s = talkScript(); out.push({ name: `${kit}-talk~${alt}`, spec: { kit, voice: alt, seconds: s.seconds, music: false, script: s.script } }); });
	if (kinds.includes('reel')) { const s = reelScript(); out.push({ name: `${kit}-reel`, spec: { kit, seconds: s.seconds, music: false, chapter: 2, script: s.script } }); }
	songs.forEach((song) => {
		if (kinds.includes('journey')) { const s = journeyScript(); out.push({ name: `${kit}-${song}-journey`, spec: { kit, song, seconds: s.seconds, asleep: true, script: s.script } }); }
		if (kinds.includes('full')) out.push({ name: `${kit}-${song}-full`, spec: { kit, song, seconds: 34, chapter: 4, index: 10, asleep: false } });
	});
	if (kinds.includes('jam')) { const script = []; let at = 4; ['select', 'next', 'toggleOn', 'tick', 'block', 'select', 'tip', 'cheer'].forEach((play, i) => { script.push({ at, play, op: { index: i % 4, count: 4 } }); at += 1.73; }); script.push({ at: 19, say: 'Right here works great.', mood: 'happy' }); out.push({ name: `${kit}-jam`, spec: { kit, song: def, seconds: 24, chapter: 2, index: 5, asleep: false, script } }); }
	if (kinds.includes('busy')) { const s = busyScript(); out.push({ name: `${kit}-busy`, spec: { kit, song: def, seconds: s.seconds, chapter: 0, index: 1, asleep: false, script: s.script } }); }
	return out;
}
export const tests = {
	async 'render'(t) {
		const out = t.args.out; if (!out) throw new Error('--set out=<folder> is required');
		fs.mkdirSync(out, { recursive: true });
		const kits = t.args.kits ? String(t.args.kits).split(',') : KITS, songs = t.args.songs ? String(t.args.songs).split(',') : SONGS;
		const kinds = String(t.args.kinds || 'talk,reel,journey,full,jam,busy').split(',');
		await t.goto('tools/render.html');
		await t.page.waitForFunction(() => !!(window.PipSound && window.PS5 && window.PS5.SONGS));
		let n = 0;
		const render = async (name, spec) => {
			const r = await t.page.evaluate(async (s) => { const t0 = performance.now(); const b = await PipSound.render(s); return { b64: PipSound.wavBase64(b), ms: Math.round(performance.now() - t0), err: PS5.errors.slice(-3) }; }, spec);
			fs.writeFileSync(path.join(out, name + '.wav'), Buffer.from(r.b64, 'base64'));
			n++; t.log(`${name}: ${spec.seconds.toFixed(0)} s rendered in ${r.ms} ms`);
			if (r.err.length) throw new Error(`${name}: ${r.err.join(' | ')}`);
		};
		for (const kit of kits) {
			const info = await t.page.evaluate((k) => ({ alts: Object.keys(PS5.voice.ALT[k] || {}), def: PS5.DEFAULT_SONG[k] }), kit);
			for (const { name, spec } of specs(kit, kinds, songs, info.alts, info.def)) await render(name, spec);
		}
		if (t.args.trace) {
			// a walk recorded on the page: { kit, song, seconds, script }
			const T = JSON.parse(fs.readFileSync(String(t.args.trace), 'utf8'));
			for (const w of [].concat(T)) await render(w.name || `${w.kit}-walk`, w);
		}
		await t.check(`rendered ${n} files`, n > 0);
	}
};
