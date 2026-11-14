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
// - FO-197 (Jared: "should the tab selection between the adjustable tabs on the home page also use the newer animations ...
//   Also on the settings page too? ... Yes to both, and also the usage page tab switching"): Home's panel tabs, Settings'
//   chapters and Usage's pages move their chosen chip with the switcher (glass.js STRIPS), in each look's own way. In one
//   look of each family (--set looks197=), each group: the chip is the switcher's (its strip lensed, the chip under the
//   labels) and after every press it rests on the chosen item; where the look carries (Friendly, Basic) every change is
//   carried and no frame moves the chip further than its own motion (as FO-195); under Reduce Motion, the OS's and the
//   page's own (data-motion="reduced"), nothing is carried and the chip is on the new item within two frames.
// - FO-196 ("the settings page when switching chapters has really janky animations on all themes"): a chapter switch has
//   one entrance. The chapter's heading, from its first painted frame, rises no more than its layout's own 4 px (the stage
//   added its own 4 px, so it rose 8), and the old chapter is not held dimmed (opacity under .9) while the new one builds.
//
//   --set looks=friendly-light,...   --set film=1 (marks for a recording)   --set sandbox=0|1 (both surfaces: run twice)
//   --set widths=1920,1440,1280 (FO-194)   --set looks197=friendly-light,basic-dark,retro-light,nier-dark,glass-light
import { RECORD, TAKE, RESET, frames, steps, modelError } from '../helpers/carry-frames.mjs';
import { setLookBySetting, setMotionApp } from '../helpers/settings-look.mjs';

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

// the three tab groups: how to reach them, their strip (as glass.js STRIPS names it) and items, and a press sequence
const GROUPS = [
	{ name: 'Settings chapters', page: 5, strip: { sel: '#pm-settings-root .rail-scroll', active: ':is(.side-link[data-action="home"], .domain-link).active' }, items: '#pm-settings-root .rail-scroll .domain-link', seq: [1, 2, 1, 3, 2] },
	{ name: 'Usage pages', page: 4, strip: { sel: '#pmuNav', active: '.pmu-navbtn.active' }, items: '#pmuNav .pmu-navbtn', seq: [1, 2, 1, 3, 2] },
	{ name: 'Home panel tabs', page: 0, mark: true, strip: { sel: '.pmw-strip[data-tsm]', active: '.pmw-tab[data-active]' }, items: '.pmw-strip[data-tsm] .pmw-tab', seq: [1, 0, 1, 0, 1] }
];
async function goPage(t, f, i) { await pressNth(t, f, '.title-bar nav.page-tabs .page-tab', i); await t.page.waitForTimeout(1600); }
async function pressNth(t, f, sel, i, label) {
	const off = await offset(t, f);
	const c = await f.evaluate(([sel, i]) => { const e = [...document.querySelectorAll(sel)].filter((x) => x.getClientRects().length && x.getBoundingClientRect().width > 4)[i]; if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [sel, i]);
	if (!c) return false;
	await t.page.mouse.move(off.x + c[0], off.y + c[1]);
	if (t.args.film && label) await t.mark(label);
	await t.page.mouse.down(); await t.page.waitForTimeout(HOLD); await t.page.mouse.up();
	return true;
}
// in the page: the strip's chosen item and the switcher's chip on it: a lens (under the labels, or in Glass's layers)
// whose box sits on the item (centres within 3 px), and whether a carried block is up
const CHIP_ON = ([sel, active]) => {
	const s = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length); if (!s) return { strip: false };
	const r = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; };
	const on = s.querySelector(active), ob = on ? r(on) : null;
	const lenses = [...s.querySelectorAll(':scope > lg-under > .lg-lens'), ...document.querySelectorAll('.lg-lenses-local > .lg-lens, #lg-lenses > .lg-lens, body > .lg-lenses > .lg-lens, .lg-lens:not(.lg-hop)')]
		.filter((l, i, a) => a.indexOf(l) === i && l.getClientRects().length && +getComputedStyle(l).opacity > 0.5 && getComputedStyle(l).visibility !== 'hidden');
	const near = ob && lenses.find((l) => { const b = r(l); return Math.abs(b[0] + b[2] / 2 - (ob[0] + ob[2] / 2)) < 3 && Math.abs(b[1] + b[3] / 2 - (ob[1] + ob[3] / 2)) < 3; });
	const ul = s.querySelector(':scope > lg-under > .lg-lens');
	return { strip: true, lensed: s.hasAttribute('data-lg-lensed'), under: !!ul, underBox: ul ? r(ul).map((v) => Math.round(v)) : null, on: ob, lens: near ? r(near) : null, block: !!s.querySelector(':scope > lg-over > .lg-carry'), motion: document.documentElement.getAttribute('data-motion') };
};

export const tests = {
	async 'FO-197 Home panel tabs, Settings chapters and Usage pages move with the switcher'(t) {
		await t.viewport(1920, 1080);
		const looks = list(t.args.looks197, ['friendly-light', 'basic-dark', 'retro-light', 'nier-dark', 'glass-light']);
		const modes = list(t.args.modes197, ['motion', 'os-reduce', 'page-reduce']), dumps = [];
		for (const mode of modes) {
			await t.emulate({ reducedMotion: mode === 'os-reduce' ? 'reduce' : 'no-preference' });
			for (const look of (mode === 'motion' ? looks : looks.slice(0, 2))) {
				const f = await t.app.open();
				// the look and the app's own Reduce animations are set through Settings' rows, so they are saved and every
				// later render keeps them (Settings paints its saved state back on each action: helpers/settings-look.mjs);
				// Settings is left on its General chapter (its Home lays the left bar 12 px further right)
				await goPage(t, f, 5);
				await setLookBySetting(t, f, look);
				if (mode === 'page-reduce') await setMotionApp(t, f, 'app');
				for (const g of GROUPS) {
					await goPage(t, f, g.page);
					if (g.mark) await f.evaluate(() => { const s = [...document.querySelectorAll('.pmw-strip')].find((x) => x.getClientRects().length && [...x.querySelectorAll('.pmw-tab')].filter((e) => e.getClientRects().length).length >= 2); if (s) s.setAttribute('data-tsm', ''); });
					await t.page.waitForTimeout(500);
					const tag = `${mode} ${look} ${g.name}`;
					const st0 = await f.evaluate(CHIP_ON, [g.strip.sel, g.strip.active]);
					if (!(await t.check(`${tag}: the switcher's chip is on the chosen item`, st0.strip && !!st0.lens, JSON.stringify(st0)))) continue;
					await f.evaluate(RECORD, g.strip); await t.page.waitForTimeout(150); await f.evaluate(RESET);
					let rest = 0, restBad = [], quick = [];
					for (const i of g.seq) {
						const t0 = await f.evaluate(() => performance.now());
						await pressNth(t, f, g.items, i, `${tag} ${i}`);
						// two frames after the choice: under Reduce Motion the chip is there already
						if (mode !== 'motion') { await t.page.waitForTimeout(260); const q = await f.evaluate(CHIP_ON, [g.strip.sel, g.strip.active]); quick.push(q); }
						await t.page.waitForTimeout(mode === 'motion' ? 900 : 500);
						const st = await f.evaluate(CHIP_ON, [g.strip.sel, g.strip.active]);
						const ok = !!st.lens;
						if (ok) rest++; else restBad.push(JSON.stringify(st).slice(0, 160));
					}
					await t.check(`${tag}: after every press the chip rests on the chosen item (${rest}/${g.seq.length})`, rest === g.seq.length, restBad.join(' | '));
					const data = await f.evaluate(TAKE);
					if (t.args.dump197) dumps.push({ tag, data: JSON.parse(JSON.stringify(data)) });
					const carries = data.anims.filter((a) => a.strip === g.strip.sel).length;
					const carrying = /^(friendly|basic)/.test(look);
					if (mode === 'motion' && carrying) {
						await t.check(`${tag}: every change is carried (${carries} carried blocks, ${g.seq.length} presses)`, carries >= g.seq.length - 1, `${carries}`);
						const r = steps(frames(data, g.strip.sel));
						await t.check(`${tag}: no frame moves the chip further than its own motion (worst excess ${r.worst.excess || 0} px)`, r.bad.length === 0, r.bad.slice(0, 3).map((b) => `t${b.t} ${b.from}->${b.to} moved ${b.moved} allow ${b.allow}`).join('; '));
					}
					if (mode !== 'motion') {
						await t.check(`${tag}: nothing is carried (${carries})`, carries === 0, `${carries}`);
						const late = quick.filter((q) => !q.lens);
						await t.check(`${tag}: the chip is on the chosen item right after each press (${quick.length - late.length}/${quick.length})`, late.length === 0, late.map((q) => JSON.stringify(q).slice(0, 140)).join(' | '));
					}
					await f.evaluate(() => { const W = window.__carryRec; if (W) { W.strips.length = 0; } });
				}
				await t.app.resetLayout();   // the saved look and motion go: the next fresh page starts in Basic Dark
			}
		}
		if (t.args.dump197) { const fs = await import('node:fs'); fs.writeFileSync(String(t.args.dump197), JSON.stringify(dumps)); }
	},
	async 'FO-196 a Settings chapter switch has one entrance'(t) {
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'no-preference' });
		const looks = list(t.args.looks196, ['basic-dark', 'friendly-light', 'glass-dark', 'retro-light']), dump196 = [];
		for (const look of looks) {
			const f = await t.app.open();
			await goPage(t, f, 5);
			await t.app.look(look);
			await t.page.waitForTimeout(600);
			const worst = { rise: 0, dim: 1 }, seen = [];
			for (const i of [1, 2, 3]) {
				await f.evaluate(() => {
					const W = window.__chRec = { rows: [], on: true, stageAnims: [] };
					/* the stage's own animations: a fade it plays while the new chapter builds runs on the compositor inside the
					   build's long task, where no frame callback can see it */
					if (!window.__chAnimPatched) {
						window.__chAnimPatched = true;
						const animate = Element.prototype.animate;
						Element.prototype.animate = function (kf, timing) {
							try { if (this.id === 'workspace-stage' && Array.isArray(kf) && window.__chRec) window.__chRec.stageAnims.push({ minOpacity: Math.min(...kf.map((k) => (k.opacity == null ? 1 : +k.opacity))), duration: typeof timing === 'number' ? timing : timing && timing.duration }); } catch (e) { /* never break the page */ }
							return animate.call(this, kf, timing);
						};
					}
					const tick = (ts) => {
						if (!W.on) return;
						const st = document.querySelector('#workspace-stage'), h = st && st.querySelector('header.workspace-separator h2, h1, h2');
						let op = 1; for (let e = st; e && e !== document.body; e = e.parentElement) op *= +getComputedStyle(e).opacity;
						W.rows.push({ t: ts, op, y: h ? h.getBoundingClientRect().top : null, text: h ? h.textContent.trim().slice(0, 30) : '' });
						requestAnimationFrame(tick);
					};
					requestAnimationFrame(tick);
				});
				const before = await f.evaluate(() => { const h = document.querySelector('#workspace-stage header.workspace-separator h2, #workspace-stage h1, #workspace-stage h2'); return h ? h.textContent.trim().slice(0, 30) : ''; });
				await pressNth(t, f, '#pm-settings-root .rail-scroll .domain-link', i, `${look} chapter ${i}`);
				await t.page.waitForTimeout(1400);
				const rows = await f.evaluate(() => { window.__chRec.on = false; return window.__chRec.rows; });
				const fresh = rows.filter((r) => r.y != null && r.text && r.text !== before);
				if (!fresh.length) { seen.push(`press ${i}: no new chapter`); continue; }
				const settled = fresh[fresh.length - 1].y, rise = Math.max(...fresh.map((r) => r.y)) - settled;
				const stageAnims = await f.evaluate(() => window.__chRec.stageAnims);
				const dim = Math.min(...rows.filter((r) => r.text === before).map((r) => r.op), ...stageAnims.map((a) => a.minOpacity), 1);
				worst.rise = Math.max(worst.rise, rise); worst.dim = Math.min(worst.dim, dim);
				if (t.args.dump196) dump196.push({ look, press: i, before, rows, stageAnims });
				seen.push(`${before} -> ${fresh[0].text}: rose ${rise.toFixed(1)} px, old held at opacity ${dim.toFixed(2)}`);
			}
			await t.check(`${look}: the new chapter rises no more than its own 4 px entrance (worst ${worst.rise.toFixed(1)} px)`, worst.rise <= 4.5, seen.join('; '));
			await t.check(`${look}: the old chapter is not held dimmed while the new one builds (lowest opacity ${worst.dim.toFixed(2)})`, worst.dim >= 0.9, seen.join('; '));
		}
		if (t.args.dump196) { const fs = await import('node:fs'); fs.writeFileSync(String(t.args.dump196), JSON.stringify(dump196)); }
	},

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
				// quick reversals (FO-194 round 2: A -> B -> A turned with a 34.6 px snap): adjacent and not, both ways
				// (pairs within the marker's own travel: past --pmh-frame-max, 160 px in Friendly, it is placed at once by design)
				const revs = [], near = (a, b) => Math.abs(tabs[a].c[0] - tabs[b].c[0]) <= 150;
				const pairs = [[0, 1], [1, 2], [0, 2], [2, 3], [1, 3]].filter(([a, b]) => b < tabs.length && near(a, b));
				const plan = [];
				pairs.forEach(([a, b], k) => { plan.push([a, b, [30, 50, 80][k % 3]], [b, a, [80, 50, 30][k % 3]]); });
				for (const [a, b, dwell] of plan) {
					await t.page.mouse.move(off.x + tabs[a].c[0], off.y + tabs[a].c[1], { steps: 3 }); await t.page.waitForTimeout(500);
					const t0 = await f.evaluate(() => performance.now());
					if (t.args.film) await t.mark(`${look} ${w} reversal ${tabs[a].name} -> ${tabs[b].name} (${dwell} ms) -> back`);
					await t.page.mouse.move(off.x + tabs[b].c[0], off.y + tabs[b].c[1], { steps: 3 }); await t.page.waitForTimeout(dwell);
					await t.page.mouse.move(off.x + tabs[a].c[0], off.y + tabs[a].c[1], { steps: 3 }); await t.page.waitForTimeout(520);
					revs.push({ a, b, dwell, t0, t1: await f.evaluate(() => performance.now()) });
				}
				const rows = await f.evaluate(() => { window.__hovRec.on = false; return window.__hovRec.rows; });
				// a reversal turns on its spring: from the furthest it got toward B, the marker takes its spring's time to come
				// back to A (40 ms at least; the spring turns in 100-150 ms), where round 1 put it back on A in the next frame
				// (34.6 px, a velocity-signed clamp); and it comes to rest inside A. (A step per frame cannot judge it: on a
				// 180 Hz screen with the main thread stalling, the spring's own catch-up after a stall is as long as a snap.)
				const snaps = []; let worstStep = Infinity;
				for (const rv of revs) {
					const seg = rows.filter((r) => r.t >= rv.t0 && r.t <= rv.t1 && r.frame);
					if (seg.length < 3) continue;
					const dir = Math.sign(tabs[rv.b].c[0] - tabs[rv.a].c[0]), rest = seg[seg.length - 1].frame[0];
					let pk = 0; seg.forEach((r, j) => { if (dir * (r.frame[0] - seg[pk].frame[0]) > 0) pk = j; });
					const exc = dir * (seg[pk].frame[0] - rest);
					if (exc >= 8) {
						const back = seg.findIndex((r, j) => j > pk && Math.abs(r.frame[0] - rest) <= 2);
						const ms = back < 0 ? Infinity : seg[back].t - seg[pk].t;
						if (ms < worstStep) worstStep = ms;
						if (ms < 40) snaps.push(`${tabs[rv.a].name} -> ${tabs[rv.b].name} (${rv.dwell} ms) -> back: from ${exc.toFixed(1)} px out to its rest in ${ms.toFixed(1)} ms at t${seg[pk].t.toFixed(0)}`);
					}
					const F = seg[seg.length - 1].frame, T = tabs[rv.a].box;
					if (Math.max(T[0] - F[0], T[1] - F[1], F[2] - T[2], F[3] - T[3]) > TOL) snaps.push(`${tabs[rv.a].name} after the reversal: rests past its edge [${F.map((v) => v.toFixed(1))}]`);
				}
				await t.check(`${look} ${w}: a quick reversal turns on its spring, no snap (${revs.length} reversals, quickest return ${worstStep.toFixed(0)} ms)`, snaps.length === 0, snaps.slice(0, 5).join('; '));
				const bad = []; let worst = 0;
				// per hover: the marker comes in from where it was (its first sample after the pointer landed). While it
				// moves, an edge that began outside the tab is still coming in; an edge that began inside must never go out
				// (an overshoot past the tab). At rest it is inside on all four sides
				for (let k = 0; k < moves.length; k++) {
					const m = moves[k]; if (m.i < 0) continue;
					const end = k + 1 < moves.length ? moves[k + 1].t0 : revs.length ? revs[0].t0 : Infinity;
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
				keep.push({ look, w, tabs, moves, worst, bad: bad.length, revs, snaps, worstStep, revRows: revs.length ? rows.filter((r) => r.t >= revs[0].t0).map((r) => ({ t: r.t, frame: r.frame })) : [] });
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
