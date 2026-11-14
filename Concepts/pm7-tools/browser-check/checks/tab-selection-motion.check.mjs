// Stream F, Jared's QA of 2026-11-13 (streams/F/jared-qa-20261113/JARED-QA.md): the switcher's selection motion.
// - FO-195, the left rail's Files switcher (Explorer / Changed / Open): "I love the new animation, but it can get a little
//   buggy when switching back and forth between the tabs. It almost jumps twice." The chip is carried to the pressed tab
//   (Friendly's hop, Basic's snap); when the app chooses it, the tab shows its word and grows, and the carried block was
//   made again from its trip's start toward the new box at the same age, so it jumped (19 px left in one frame, triage
//   film F1374 -> F1375), or, landed, snapped to the new box. Now it goes on from where it is drawn. Judged on every
//   60 Hz frame the compositor drew (helpers/carry-frames.mjs): no edge of the chip may move further from one frame to
//   the next than the chip's own motion moves it in that frame (+3 px), in single presses and quick back-and-forth runs,
//   with a person's press (down, 90 ms, up).
//
//   --set looks=friendly-light,...   --set film=1 (marks for a recording)   --set sandbox=0|1 (both surfaces: run twice)
import { RECORD, TAKE, RESET, frames, steps, modelError } from '../helpers/carry-frames.mjs';

const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const HOLD = 90;

async function offset(t, f) {
	if (f === t.page.mainFrame()) return { x: 0, y: 0 };
	const fe = await f.frameElement(); const b = await fe.boundingBox(); return { x: b.x, y: b.y };
}
// a person's press on the first visible element matching sel: down, 90 ms, up
async function hold(t, f, sel, label) {
	const off = await offset(t, f);
	const c = await f.evaluate((sel) => { const e = [...document.querySelectorAll(sel)].find((x) => x.getClientRects().length && x.getBoundingClientRect().width > 4); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
	if (!c) return false;
	await t.page.mouse.move(off.x + c[0], off.y + c[1]);
	// a film's marks carry the page's clock too, so every frame the kit rebuilds can be found in the film
	if (t.args.film && label) { const pt = await f.evaluate(() => performance.now()); await t.mark(label); (t.__pageMarks || (t.__pageMarks = [])).push({ label, pt }); }
	await t.page.mouse.down(); await t.page.waitForTimeout(HOLD); await t.page.mouse.up();
	return true;
}

const RAIL = { sel: '#sidePanelSlot .pm-segtab', active: '.pm-segtab-item.active' };
const tab = (name) => `#sidePanelSlot .pm-segtab .pm-segtab-item[data-tab="${name}"]`;

export const tests = {
	async 'FO-195 the rail switcher carries on from where it is drawn'(t) {
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'no-preference' });
		const looks = list(t.args.looks, ['friendly-light', 'friendly-dark', 'basic-light', 'basic-dark']);
		const keep = [];
		for (const look of looks) {
			const f = await t.app.open();
			await t.app.look(look);
			await f.waitForFunction((s) => !!document.querySelector(s), tab('changed'), { timeout: 20000 });
			// start on Explorer, at rest
			await f.evaluate((s) => { const e = document.querySelector(s); if (e && !e.classList.contains('active')) e.click(); }, tab('explorer'));
			await t.page.waitForTimeout(1200);
			await f.evaluate(RECORD, RAIL);
			await t.page.waitForTimeout(200);
			await f.evaluate(RESET);
			const phases = [];
			const phase = async (name, seq, gap, settle) => {
				const t0 = await f.evaluate(() => performance.now());
				for (const s of seq) { await hold(t, f, tab(s), `${look} ${name} ${s}`); if (gap) await t.page.waitForTimeout(gap); }
				await t.page.waitForTimeout(settle);
				phases.push({ name, from: t0, to: await f.evaluate(() => performance.now()), last: seq[seq.length - 1] });
			};
			await phase('single', ['changed'], 0, 1300);
			await phase('single', ['explorer'], 0, 1300);
			await phase('single', ['open'], 0, 1300);
			await phase('single', ['changed'], 0, 1300);
			await phase('back-and-forth', ['explorer', 'changed', 'explorer', 'changed', 'open', 'explorer'], 110, 1500);
			const data = await f.evaluate(TAKE);
			const fr = frames(data, RAIL.sel);
			const carries = new Set(fr.filter((x) => x.rec).map((x) => x.rec.id)).size;
			await t.check(`${look}: the chip was carried (${carries} carried blocks, ${fr.length} drawn frames)`, carries >= 5, `${carries} carries`);
			const me = modelError(fr);
			await t.check(`${look}: the keyframe rebuild matches the block the page drew (worst ${me.toFixed(2)} px)`, me <= 3, `${me.toFixed(2)} px`);
			for (const ph of phases) {
				const r = steps(fr, { from: ph.from, to: ph.to });
				await t.check(`${look} ${ph.name} to ${ph.last}: no frame moves the chip further than its own motion (worst excess ${r.worst.excess} px)`, r.bad.length === 0,
					r.bad.slice(0, 4).map((b) => `t${b.t} ${b.from}->${b.to} moved ${b.moved} allow ${b.allow} [${b.a}]->[${b.b}]`).join('; '));
			}
			const end = data.samples[data.samples.length - 1].s[RAIL.sel];
			const onEnd = end && end.lens && end.onBox && end.lensOp > 0.5 && Math.abs(end.lens[0] + end.lens[2] / 2 - (end.onBox[0] + end.onBox[2] / 2)) < 3;
			await t.check(`${look}: the chip rests on the chosen tab (${end && end.on})`, !!onEnd, JSON.stringify(end));
			keep.push({ look, phases, frames: fr.map((x) => ({ t: +x.t.toFixed(2), box: x.box.map((v) => +v.toFixed(2)), src: x.src, gap: !!x.gap, real: x.real ? x.real.map((v) => +v.toFixed(2)) : undefined })), data });
		}
		if (t.args.dump) { const fs = await import('node:fs'); fs.writeFileSync(String(t.args.dump), JSON.stringify(keep.map((k) => ({ ...k, pageMarks: t.__pageMarks || [] })))); }
	}
};
