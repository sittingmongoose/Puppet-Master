// Renders what the concept pages play, offline, and writes WAV files for tools/measure.mjs.
//   browser-check run tools/checks/render.check.mjs --set out=/abs/scratch/dir [--set only=c1-friendly] [--set kinds=journey,full,talk,reel]
// journey: the tune from Pip asleep through every chapter (56 s); full: everything playing (32 s); talk: Pip's lines, no
// music; reel: the window's sounds one after another, no music.
import fs from 'node:fs';
import path from 'node:path';
const CONCEPTS = ['c1', 'c2', 'c3'], KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
const LINES = [['Oh! Hi. I\'m Pip.', 'happy'], ['Shall we set things up together?', 'idle'], ['Hmm, that key didn\'t work.', 'oops'], ['Right here works great.', 'happy'], ['What shall we call it?', 'wonder'], ['We\'re ready. Let\'s make something!', 'happy']];
const REEL = ['tap', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'key', 'key', 'key', 'warn', 'lower', 'land', 'lift', 'hop', 'sparkle', 'tip', 'tick', 'block', 'power', 'chapter', 'open', 'close', 'cheer', 'confetti'];
function specs(concept, kit, kinds) {
	const out = [];
	if (kinds.includes('journey')) {
		const idx = [0, 2, 3, 9, 10];
		const script = [{ at: 0, asleep: true, chapter: 0, index: 0 }, { at: 9, asleep: false, play: 'wake' }];
		[1, 2, 3, 4].forEach((ch, i) => { const at = 18 + i * 9.5; script.push({ at, chapter: ch, index: idx[ch], play: 'next', op: { chapter: ch } }); script.push({ at: at + 0.3, play: 'chapter', op: { chapter: ch } }); });
		script.push({ at: 30, flag: ['work', true] }, { at: 36, flag: ['work', false] }, { at: 40, flag: ['power', true] });
		out.push({ kind: 'journey', spec: { concept, kit, seconds: 58, asleep: true, script } });
	}
	if (kinds.includes('full')) out.push({ kind: 'full', spec: { concept, kit, seconds: 34, chapter: 4, index: 10, asleep: false } });
	if (kinds.includes('talk')) { let at = 0.3; const script = LINES.map(([say, mood]) => { const e = { at, say, mood }; at += 0.6 + say.length / 28; return e; }); out.push({ kind: 'talk', spec: { concept, kit, seconds: at + 1, music: false, script } }); }
	if (kinds.includes('reel')) { let at = 0.3; const script = []; REEL.forEach((play, i) => { script.push({ at, play, op: { index: i % 4, count: 4, chapter: 2 } }); at += /confetti|open|close|chapter/.test(play) ? 2.6 : /key/.test(play) ? 0.16 : 0.9; }); out.push({ kind: 'reel', spec: { concept, kit, seconds: at + 2, music: false, chapter: 2, script } }); }
	if (kinds.includes('jam')) { const script = []; let at = 4; ['select', 'next', 'toggleOn', 'tick', 'block', 'select', 'chapter', 'cheer'].forEach((play, i) => { script.push({ at, play, op: { index: i % 4, count: 4 } }); at += 1.73; }); script.push({ at: 19, say: 'Right here works great.', mood: 'happy' }); out.push({ kind: 'jam', spec: { concept, kit, seconds: 24, chapter: 2, index: 5, asleep: false, script } }); }
	return out;
}
export const tests = {
	async 'render'(t) {
		const out = t.args.out; if (!out) throw new Error('--set out=<folder> is required');
		fs.mkdirSync(out, { recursive: true });
		const only = t.args.only ? String(t.args.only).split(',') : null, kinds = String(t.args.kinds || 'journey,full,talk,reel').split(',');
		await t.goto('tools/render.html');
		await t.page.waitForFunction(() => !!(window.PipSound && window.PS5 && window.PS5.concepts.c3));
		let n = 0;
		for (const c of CONCEPTS) for (const k of KITS) {
			if (only && !only.some((o) => (c + '-' + k).startsWith(o))) continue;
			for (const { kind, spec } of specs(c, k, kinds)) {
				const r = await t.page.evaluate(async (s) => { const t0 = performance.now(); const b = await PipSound.render(s); return { b64: PipSound.wavBase64(b), ms: Math.round(performance.now() - t0) }; }, spec);
				fs.writeFileSync(path.join(out, `${c}-${k}-${kind}.wav`), Buffer.from(r.b64, 'base64'));
				n++; t.log(`${c}-${k}-${kind}: ${spec.seconds.toFixed(0)} s rendered in ${r.ms} ms`);
			}
		}
		await t.check(`rendered ${n} files`, n > 0);
	}
};
