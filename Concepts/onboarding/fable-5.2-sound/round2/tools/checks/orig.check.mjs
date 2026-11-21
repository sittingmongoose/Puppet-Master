// Renders PMConcept7's sound of today (the Pip concept's sound.js) to WAV, for comparison with the new sound:
// Pip's lines (talk), each look's tune through the five chapters (music), and the window's sounds one by one (reel).
//   browser-check run tools/checks/orig.check.mjs --set out=/abs/scratch/dir [--set kits=friendly,glass] [--set kinds=talk,music,reel]
import fs from 'node:fs';
import path from 'node:path';
const THEME = { friendly: 'friendly-dark', glass: 'glass-dark', basic: 'basic-dark', phosphor: 'retro-dark', teletype: 'retro-light', nier: 'nier-dark' };
export const LINES = [['Oh! Hi. I\'m Pip.', 'happy'], ['Shall we set things up together?', 'idle'], ['Hmm, that key didn\'t work.', 'oops'], ['Right here works great.', 'happy'], ['What shall we call it?', 'wonder'], ['We\'re ready. Let\'s make something!', 'happy']];
export const REEL = ['tap', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'key', 'key', 'key', 'warn', 'lower', 'land', 'lift', 'hop', 'sparkle', 'tip', 'tick', 'block', 'power', 'chapter', 'open', 'close', 'cheer', 'confetti'];
export const reelTimes = () => { let at = 0.3; return REEL.map((play) => { const e = { at, play }; at += /confetti|open|close|chapter/.test(play) ? 2.6 : /key/.test(play) ? 0.16 : 0.9; return e; }); };
function entries(kit, kind) {
	const theme = THEME[kit], out = [];
	if (kind === 'talk') { let at = 0.3; LINES.forEach(([text, mood]) => { out.push({ t: at, kind: 'say', text, opts: { mood }, theme }); at += 0.6 + text.length / 28; }); return { out, seconds: at + 1 }; }
	if (kind === 'music') {
		// the tune alone: twice round in the first chapter, then on through the others as the window does it
		out.push({ t: 0, kind: 'loop', name: 'bed', opts: { level: 1 }, theme });
		[1, 2, 3, 4].forEach((ch, i) => out.push({ t: 34 + i * 9, kind: 'play', name: 'next', opts: { chapter: ch }, theme }));
		return { out, seconds: 72 };
	}
	const R = reelTimes(); R.forEach((e, i) => out.push({ t: e.at, kind: 'play', name: e.play, opts: { index: i % 4, count: 4, chapter: 2 }, theme }));
	return { out, seconds: R[R.length - 1].at + 4 };
}
export const tests = {
	async 'render today'(t) {
		const out = t.args.out; if (!out) throw new Error('--set out=<folder> is required');
		fs.mkdirSync(out, { recursive: true });
		const kits = t.args.kits ? String(t.args.kits).split(',') : Object.keys(THEME), kinds = String(t.args.kinds || 'talk,music,reel').split(',');
		await t.goto('tools/orig-render.html');
		await t.page.waitForFunction(() => !!(window.PipSound && window.PipSound.renderTimeline));
		let n = 0;
		for (const kit of kits) for (const kind of kinds) {
			const e = entries(kit, kind);
			const b64 = await t.page.evaluate(async ({ list, seconds }) => window.PipSound.renderTimeline(list, seconds), { list: e.out, seconds: e.seconds });
			fs.writeFileSync(path.join(out, `orig-${kit}-${kind}.wav`), Buffer.from(b64, 'base64'));
			n++; t.log(`orig-${kit}-${kind}: ${e.seconds.toFixed(0)} s`);
		}
		await t.check(`rendered ${n} files`, n > 0);
	}
};
