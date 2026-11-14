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
// - FO-194, Friendly's page tabs (Home ... Settings): "in the friendly theme the page selector at top overlaps when you hover.
//   I like the new design a lot, it just needs to be tweaked." The hover marker (the F1 sticker's dashed echo, #pmh-frame)
//   sat 2 px round each tab, 2 px apart, sprang to 1.017 on arrival and overshot the tab it slid to by 4-8 px. In Friendly
//   Light and Dark at 1920, 1440 and 1280, with the pointer arriving on each tab from outside and sliding along the
//   strip both ways, every frame: an arriving marker stays inside its tab's box, a sliding one never passes the far edge
//   of the tab it slides to, and every marker at rest is inside its tab (0.5 px).
//
//   --set looks=friendly-light,...   --set film=1 (marks for a recording)   --set sandbox=0|1 (both surfaces: run twice)
//   --set widths=1920,1440,1280 (FO-194)
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

const PAGE_TAB = '.title-bar nav.page-tabs .page-tab';
// in the page: sample the hover marker and every page tab each frame until stop()
const HOVER_REC = () => {
	const W = window.__hovRec = { rows: [], on: true };
	const rr = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
	const tick = (ts) => {
		if (!W.on) return;
		const f = document.getElementById('pmh-frame');
		const vis = f && f.classList.contains('pmh-frame-on') && getComputedStyle(f).opacity > 0.05;
		W.rows.push({ t: ts, frame: vis ? rr(f) : null, tabs: [...document.querySelectorAll('.title-bar nav.page-tabs .page-tab')].filter((e) => e.getClientRects().length && e.getBoundingClientRect().width > 4).map((e) => ({ name: e.textContent.trim(), box: rr(e) })) });
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
	return true;
};

export const tests = {
	async 'FO-194 Friendly page tab hover marker stays inside its tab'(t) {
		const looks = list(t.args.looks194 || (t.args.looks && /friendly/.test(t.args.looks) ? t.args.looks : ''), ['friendly-light', 'friendly-dark']).filter((l) => /friendly/.test(l));
		const widths = list(t.args.widths, ['1920', '1440', '1280']).map(Number);
		await t.emulate({ reducedMotion: 'no-preference' });
		const TOL = 0.5, keep = [];
		for (const w of widths) {
			await t.viewport(w, 1080);
			for (const look of looks) {
				const f = await t.app.open();
				await t.app.look(look);
				const off = await offset(t, f);
				const tabs = await f.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length && e.getBoundingClientRect().width > 4).map((e) => { const r = e.getBoundingClientRect(); return { name: e.textContent.trim(), c: [r.left + r.width / 2, r.top + r.height / 2], box: [r.left, r.top, r.right, r.bottom] }; }), PAGE_TAB);
				if (!(await t.check(`${look} ${w}: page tabs shown (${tabs.length})`, tabs.length >= 2, tabs.map((x) => x.name).join(','))) || tabs.length < 2) continue;
				const away = [tabs[0].c[0], tabs[0].c[1] + 120];
				await t.page.mouse.move(off.x + away[0], off.y + away[1]); await t.page.waitForTimeout(500);
				await f.evaluate(HOVER_REC);
				const moves = [];   // { name, from (tab index or -1), t0 (page clock) }
				const go = async (i, from, dwell) => { const t0 = await f.evaluate(() => performance.now()); await t.page.mouse.move(off.x + tabs[i].c[0], off.y + tabs[i].c[1], { steps: 6 }); moves.push({ i, from, t0 }); await t.page.waitForTimeout(dwell); };
				// arrivals from outside, each tab
				for (let i = 0; i < tabs.length; i++) { await go(i, -1, 650); const t1 = await f.evaluate(() => performance.now()); await t.page.mouse.move(off.x + away[0], off.y + away[1], { steps: 4 }); moves.push({ i: -1, from: i, t0: t1 }); await t.page.waitForTimeout(450); }
				// a slide along the strip and back
				await go(0, -1, 500);
				for (let i = 1; i < tabs.length; i++) await go(i, i - 1, 380);
				for (let i = tabs.length - 2; i >= 0; i--) await go(i, i + 1, 380);
				await t.page.waitForTimeout(400);
				const rows = await f.evaluate(() => { window.__hovRec.on = false; return window.__hovRec.rows; });
				const bad = []; let worst = 0;
				// per hover: the marker comes in from where it was (its first sample after the pointer landed). While it
				// moves, an edge that began outside the tab is still coming in; an edge that began inside must never go out
				// (an overshoot past the tab). At rest it is inside on all four sides
				for (let k = 0; k < moves.length; k++) {
					const m = moves[k]; if (m.i < 0) continue;
					const end = k + 1 < moves.length ? moves[k + 1].t0 : Infinity;
					const seg = rows.filter((r) => r.t >= m.t0 + 34 && r.t < end && r.frame);   // two frames for the pointer to land
					if (!seg.length) continue;
					const T = tabs[m.i].box, F0 = seg[0].frame, cx = (b) => (b[0] + b[2]) / 2;
					const dx = cx(T) - cx(F0), o0 = { l: T[0] - F0[0], t: T[1] - F0[1], r: F0[2] - T[2], b: F0[3] - T[3] };
					const far = ['l', 't', 'r', 'b'].filter((x) => o0[x] <= TOL);
					seg.forEach((r, j) => {
						const F = r.frame, last = j === seg.length - 1;
						const out = { l: T[0] - F[0], t: T[1] - F[1], r: F[2] - T[2], b: F[3] - T[3] };
						const sides = last ? ['l', 't', 'r', 'b'] : far;
						const ex = sides.length ? Math.max(...sides.map((x) => out[x])) : 0;
						if (ex > worst) worst = ex;
						if (ex > TOL) bad.push(`${tabs[m.i].name}${m.from >= 0 ? ' (slid ' + (dx > 0 ? 'right' : 'left') + ')' : ' (arrived)'}${last ? ' at rest' : ''}: ${ex.toFixed(2)} px past its ${sides.find((x) => out[x] === ex)} edge at t${r.t.toFixed(0)}`);
					});
				}
				await t.check(`${look} ${w}: the hover marker stays inside the tab it marks (worst ${worst.toFixed(2)} px past an edge, ${moves.filter((m) => m.i >= 0).length} hovers)`, bad.length === 0, bad.slice(0, 6).join('; '));
				keep.push({ look, w, tabs, moves, worst, bad: bad.length });
			}
		}
		if (t.args.dump194) { const fs = await import('node:fs'); fs.writeFileSync(String(t.args.dump194), JSON.stringify(keep)); }
	},

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
