// Stream F batch 12e, FO-227 / FO-231 / FO-234: the switcher's chip follows its own motion in every frame, in single
// selections and quick back-and-forth runs, on the four strips that share the switcher carry (glass.js carry(): the left
// rail's Files switcher, Home's panel tabs, Settings' chapters, Usage's pages), in every look and under Reduce Motion.
//
// The chip is read in a task queued from every frame callback (helpers/chip-sampler.mjs: a MessageChannel message, after
// the frame's paint, with the timeline's time at the read), beside the page's layout-shift entries, and every carried
// block's keyframes, start, hold and change are recorded as tab-selection-motion records them (helpers/carry-frames.mjs).
// Per look, strip and surface:
// - motion, every look: after each press the chip rests on the chosen item; no read shows an edge going out and back by
//   more than 6 px within two frames (FO-234's 120 px one-frame jump was read inside a frame callback, in the before
//   phase of a block whose compositor start had just arrived; read after the paint it is not there);
// - motion, Friendly and Basic (the looks that carry): every change is carried; no drawn frame moves the chip further than
//   its own motion (carry-frames steps(), 3 px, rebuilt from the task reads and the keyframes); a block that takes over
//   from another (a press while the chip moves, or its tab resized under it) draws the trip under way where the block it
//   replaced would have drawn it, from its first frame (1 px: FO-231, a block held at the age it was made at was drawn
//   9-37 ms later, that far behind its trip); its change (a retarget or a new trip) starts when it is committed (FO-227:
//   the last keyframe that still draws the trip under way is at most one frame after the moment its keyframes were set;
//   the 12e page started it a frame and a half on from then). The drawn frames use when each block and each change were
//   first drawn (a composited probe in the same commit, carry-frames RECORD), so a change drawn late, already begun, is
//   a step;
// - FO-240: during Home's first press, adjacent chip reads more than 80 ms apart also get the single-frame
//   edge bound. A stalled first activation can skip intermediate positions that the keyframes alone would predict.
// - Reduce Motion (the OS's and the page's own): nothing is carried, every read shows the chip on an item (never between
//   two), and after each press it rests on the chosen item;
// - FO-232, Reduce Motion: no travel, and no late jump. In every read whose frame paints an item chosen the chip is on that
//   item, so from each press the chip reaches the chosen item in the first frame that paints it chosen (the 12e page let
//   Home's panel tabs keep the chip on the tab left for 2 to 13 frames, 100-217 ms, after the chosen tab was painted: the
//   mark syncs it only through glass.js's 140 ms lazy timer). Beside the singles and the quick run, a run of rmPresses
//   presses 300 ms apart (default 10);
// - FO-235, motion, Friendly and Basic: the chip keeps one edge. Along the strip's own axis every read draws the corner
//   and the rim the chip at rest draws, through every trip and every handover (the chip under the labels to a block, a
//   block to the block taking over, a block to the chip under the labels): a block sized to the tab it is bound for and
//   scaled to its pose drew its 2 px rim 6 px wide and its 9 px corners 27 px long on leaving a wide tab for a narrow one
//   (and 0.6 px and 3 px the other way), so the chip changed its border and shape in the frame the block took over.
//
//   --set looks=friendly-dark,...   --set modes=motion,os-reduce,page-reduce   --set rmLooks=  (Reduce Motion looks; default
//   all ten for os-reduce; Friendly Light, Basic Dark and both Retro looks for page-reduce, the app's own Reduce animations,
//   since Retro fades its chip in under Reduce Motion)   --set groups=rail,home,settings,usage
//   --set rmPresses=10 (FO-232's extra Reduce Motion presses per strip, 300 ms apart)
//   --set sandbox=0|1 (both surfaces: run twice)   --set dump=<file.json>   --set raf=1 (also read inside the frame
//   callback, for comparison, in the dump)   --set film=1 (marks)
import { RECORD, TAKE, RESET, steps } from '../helpers/carry-frames.mjs';
import { CHIP_SAMPLER, CHIP_TAKE, CHIP_RESET, chipRows, drawnFrames, modelWitness, trusted, spikes, takeovers, changeStarts, offItems, stripShifts, rmOnChosen, edgeHolds, FRAME } from '../helpers/chip-sampler.mjs';
import { setLookBySetting, setMotionApp } from '../helpers/settings-look.mjs';
import { LOOKS } from '../browser-check.config.mjs';

const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const HOLD = 90, GAP = 110, RM_GAP = 300;

const GROUPS = [
	{ key: 'settings', name: 'Settings chapters', page: 5, vertical: true, strip: { sel: '#pm-settings-root .rail-scroll', active: ':is(.side-link[data-action="home"], .domain-link).active', items: '.domain-link' }, press: '#pm-settings-root .rail-scroll .domain-link', singles: [1, 2], rapid: [1, 2, 1, 2, 3, 1] },
	{ key: 'usage', name: 'Usage pages', page: 4, vertical: true, strip: { sel: '#pmuNav', active: '.pmu-navbtn.active', items: '.pmu-navbtn' }, press: '#pmuNav .pmu-navbtn', singles: [1, 2], rapid: [1, 2, 1, 2, 3, 1] },
	{ key: 'home', name: 'Home panel tabs', page: 0, mark: true, strip: { sel: '.pmw-strip[data-tsm]', active: '.pmw-tab[data-active]', items: '.pmw-tab' }, press: '.pmw-strip[data-tsm] .pmw-tab', singles: [1, 0], rapid: [1, 0, 1, 0, 1, 0] },
	{ key: 'rail', name: 'rail Files switcher', page: 0, strip: { sel: '#sidePanelSlot .pm-segtab', active: '.pm-segtab-item.active', items: '.pm-segtab-item' }, press: '#sidePanelSlot .pm-segtab .pm-segtab-item', singles: [1, 0, 2, 1], rapid: [0, 1, 0, 1, 2, 0] }
];

async function offset(t, f) {
	if (f === t.page.mainFrame()) return { x: 0, y: 0 };
	const fe = await f.frameElement(); const b = await fe.boundingBox(); return { x: b.x, y: b.y };
}
// a person's press on the i-th visible item: down, 90 ms, up
async function pressNth(t, f, sel, i, label) {
	const off = await offset(t, f);
	const c = await f.evaluate(([sel, i]) => { const e = [...document.querySelectorAll(sel)].filter((x) => x.getClientRects().length && x.getBoundingClientRect().width > 4)[i]; if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [sel, i]);
	if (!c) return false;
	await t.page.mouse.move(off.x + c[0], off.y + c[1]);
	// a film's marks carry the page's clock too, so every frame the judges rebuild can be found in the film
	if (t.args.film && label) { const pt = await f.evaluate(() => performance.now()); await t.mark(label); (t.__pageMarks || (t.__pageMarks = [])).push({ label, pt }); }
	await t.page.mouse.down(); await t.page.waitForTimeout(HOLD); await t.page.mouse.up();
	return true;
}
async function goPage(t, f, i) { await pressNth(t, f, '.title-bar nav.page-tabs .page-tab', i); await t.page.waitForTimeout(1600); }
const centre = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
const onItem = (r) => r && r.box && r.on && Math.abs(centre(r.box)[0] - centre(r.on)[0]) < 3 && Math.abs(centre(r.box)[1] - centre(r.on)[1]) < 3;

export const tests = {
	async 'the switcher chip follows its own motion in every frame'(t) {
		await t.viewport(1920, 1080);
		const looks = list(t.args.looks, LOOKS), modes = list(t.args.modes, ['motion', 'os-reduce', 'page-reduce']);
		const groups = GROUPS.filter((g) => list(t.args.groups, GROUPS.map((x) => x.key)).includes(g.key));
		const dump = [];
		for (const mode of modes) {
			const ml = mode === 'motion' ? looks : list(t.args.rmLooks, mode === 'os-reduce' ? looks : ['friendly-light', 'basic-dark', 'retro-dark', 'retro-light'].filter((l) => looks.includes(l)));
			await t.emulate({ reducedMotion: mode === 'os-reduce' ? 'reduce' : 'no-preference' });
			for (const look of ml) {
				const f = await t.app.open();
				// the look and the app's own Reduce animations are set through Settings' rows, so every later render keeps them
				await goPage(t, f, 5);
				await setLookBySetting(t, f, look);
				if (mode === 'page-reduce') await setMotionApp(t, f, 'app');
				await f.evaluate(CHIP_SAMPLER, { strips: groups.map((g) => g.strip), raf: !!t.args.raf });
				for (const g of groups) await f.evaluate(RECORD, g.strip);
				let page = 5;
				const carrying = mode === 'motion' && /^(friendly|basic)/.test(look);
				for (const g of groups) {
					if (page !== g.page) { await goPage(t, f, g.page); page = g.page; }
					if (g.mark) await f.evaluate(() => { const s = [...document.querySelectorAll('.pmw-strip')].find((x) => x.getClientRects().length && [...x.querySelectorAll('.pmw-tab')].filter((e) => e.getClientRects().length).length >= 2); if (s) s.setAttribute('data-tsm', ''); });
					await t.page.waitForTimeout(500);
					const tag = `${mode} ${look} ${g.name}`;
					await f.evaluate(RESET); await f.evaluate(CHIP_RESET);
					await t.page.waitForTimeout(120);
					const ends = [];
					for (const i of g.singles) { await pressNth(t, f, g.press, i, `${tag} single ${i}`); await t.page.waitForTimeout(1000); ends.push(await f.evaluate(() => performance.now())); }
					const r0 = await f.evaluate(() => performance.now());
					for (const i of g.rapid) { await pressNth(t, f, g.press, i, `${tag} rapid ${i}`); await t.page.waitForTimeout(GAP); }
					await t.page.waitForTimeout(1400);
					ends.push(await f.evaluate(() => performance.now()));
					// FO-232: under Reduce Motion, many more presses, each judged from its own frame
					if (mode !== 'motion') {
						const nRm = t.args.rmPresses != null ? +t.args.rmPresses : 10;
						// (between two items, the first not the one the quick run left chosen, so every press changes the choice)
						const last = g.rapid[g.rapid.length - 1], pair = [g.singles.find((i) => i !== last), last];
						for (let k = 0; k < nRm; k++) { const i = pair[k % 2]; await pressNth(t, f, g.press, i, `${tag} rm ${i}`); await t.page.waitForTimeout(RM_GAP); }
						if (nRm) { await t.page.waitForTimeout(700); ends.push(await f.evaluate(() => performance.now())); }
					}
					const data = await f.evaluate(TAKE), smp = await f.evaluate(CHIP_TAKE);
					const sel = g.strip.sel, rows = chipRows(smp, sel);
					if (!(await t.check(`${tag}: the chip was read after every frame (${rows.length} reads)`, rows.filter((r) => r.box).length > 60, `${rows.length} reads, ${rows.filter((r) => r.box).length} with a chip`))) continue;
					// rests on the chosen item at the end of each single and of the quick run
					const restBad = ends.map((e) => [...rows].reverse().find((r) => r.now < e)).filter((r) => !onItem(r));
					await t.check(`${tag}: after each press the chip rests on the chosen item (${ends.length - restBad.length}/${ends.length})`, restBad.length === 0, restBad.map((r) => JSON.stringify({ box: r && r.box, on: r && r.on })).join(' | ').slice(0, 400));
					const anims = data.anims.filter((a) => a.strip === sel);
					const sp = mode === 'motion' ? spikes(rows) : [];
					const shifts = stripShifts(smp.shifts, (await f.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }, sel)));
					const cell = { tag, mode, look, group: g.key, ends, rapidFrom: r0, shifts: shifts.length };
					if (mode === 'motion') {
						await t.check(`${tag}: no read shows the chip out and back in one frame (${sp.length}; ${shifts.length} layout shifts in the strip)`, sp.length === 0, sp.slice(0, 4).map((s) => JSON.stringify(s)).join('; '));
					}
					if (carrying) {
						const presses = g.singles.length + g.rapid.length;
						await t.check(`${tag}: every change is carried (${anims.length} carried blocks, ${presses} presses)`, anims.length >= g.singles.length, `${anims.length}`);
						const mw = modelWitness(smp, sel, data.anims);
						await t.check(`${tag}: the keyframe rebuild matches the block the page reads (worst ${mw.worst} px over ${mw.n} reads)`, mw.worst <= 3, `${mw.worst} px`);
						const fr = drawnFrames(smp, sel, data.anims);
						const st = steps(fr);
						await t.check(`${tag}: no drawn frame moves the chip further than its own motion (worst excess ${st.worst.excess || 0} px)`, st.bad.length === 0, st.bad.slice(0, 3).map((b) => `t${b.t} ${b.from}->${b.to} moved ${b.moved} allow ${b.allow}`).join('; '));
						if (g.key === 'home') {
							// Check the actual post-paint samples before filling gaps from keyframes. A gap
							// at rest is a witness too. A carry can have an applied pose while it is held
							// or pending play, before it receives a compositor start time.
							const records = new Map(anims.map((a) => [a.id, a]));
							const samples = rows.filter((r) => r.now <= ends[0] && !r.stale && (r.heldPose || trusted(r))).map((r) => ({
								t: r.now, poseTime: r.t, src: r.src, rec: records.get(r.rec),
								box: [r.box[0] - r.so[0], r.box[1] - r.so[1], r.box[2], r.box[3]]
							}));
							const gap = steps(samples, { presentationGaps: true });
							await t.check(`${tag}: first press stays within one frame of travel across presentation gaps`, gap.bad.length === 0,
								gap.gaps.map((x) => `${x.dt} ms at t${x.t}: moved ${x.moved} px, allow ${x.allow} px`).join('; '));
							cell.presentationGaps = gap.gaps;
						}
						const tk = takeovers(data.anims, sel), tkw = tk.reduce((m, x) => Math.max(m, x.worst), 0);
						await t.check(`${tag}: a block that takes over draws the trip where the block it replaced would (${tk.length} takeovers, worst ${tkw} px)`, tkw <= 1, tk.filter((x) => x.worst > 1).slice(0, 4).map((x) => `rec${x.from}->rec${x.id} ${x.worst} px at t${x.at}${x.lagMs ? `, first drawn ${x.lagMs} ms after it was made` : ''}`).join('; '));
						const cs = changeStarts(data.anims, sel), late = cs.filter((x) => x.late > FRAME + 0.5);
						await t.check(`${tag}: each change starts when it is committed (${cs.length} changes, latest ${cs.reduce((m, x) => Math.max(m, x.late), -Infinity).toFixed(1)} ms after)`, late.length === 0, late.slice(0, 4).map((x) => `rec${x.id} committed t${x.commit}, trip under way drawn until t${x.lastSame} (+${x.late} ms)`).join('; '));
						Object.assign(cell, { steps: st.worst, witness: mw, takeovers: tk, changes: cs });
						const eh = edgeHolds(rows, { vertical: !!g.vertical }), ax = g.vertical ? ['ry', 'rimY'] : ['rx', 'rimX'];
						await t.check(`${tag}: the chip keeps one edge along the strip (corner ${eh.ref ? eh.ref[ax[0]] : '?'} px, rim ${eh.ref ? eh.ref[ax[1]] : '?'} px at rest; ${eh.along.length} of ${eh.n} reads off, ${eh.hand.length} handovers step)`, !!eh.ref && eh.along.length === 0 && eh.hand.length === 0,
							[...eh.hand.slice(0, 3).map((h) => `t${h.t} ${h.from}->${h.to} corner ${h.was[ax[0]]}->${h.now[ax[0]]} rim ${h.was[ax[1]]}->${h.now[ax[1]]}`), ...eh.along.slice(0, 3).map((x) => `t${x.t} ${x.src}${x.rec != null ? ':' + x.rec : ''} corner ${x.edge[ax[0]]} rim ${x.edge[ax[1]]}`)].join('; '));
						cell.edge = { ref: eh.ref, along: eh.along.length, hand: eh.hand, n: eh.n, worst: eh.along.slice(0, 6) };
					}
					if (mode !== 'motion') {
						await t.check(`${tag}: nothing is carried (${anims.length})`, anims.length === 0, `${anims.length}`);
						const off = offItems(rows);
						await t.check(`${tag}: every read shows the chip on an item, never between two (${off.length} off)`, off.length === 0, off.slice(0, 4).map((x) => JSON.stringify(x)).join('; '));
						const rc = rmOnChosen(rows, smp.ups), late = rc.presses.filter((p) => p.lagFrames !== 0), mk = rc.presses.map((p) => p.markFrames);
						const worst = rc.presses.reduce((m, p) => (p.lagFrames == null || (m && m.lagFrames != null && m.lagFrames >= p.lagFrames) ? m : p), null);
						await t.check(`${tag}: the chip is on the chosen item from the first frame that paints it chosen (${rc.presses.length - late.length}/${rc.presses.length} presses; ${rc.off.length} reads off, ${rc.stale} read after input left out${worst && worst.lagFrames ? `; worst ${worst.lagFrames} frames, ${worst.lagMs} ms late` : ''}; chosen mark painted ${mk.length ? Math.min(...mk) : '?'}-${mk.length ? Math.max(...mk) : '?'} frames after the press)`,
							rc.presses.length >= 4 && late.length === 0 && rc.off.length === 0,
							[...late.slice(0, 4).map((p) => `press t${p.up}: chosen painted t${p.mark}, chip on it ${p.chip == null ? 'never' : `t${p.chip} (${p.lagFrames} frames, ${p.lagMs} ms later)`}`), ...rc.off.slice(0, 3).map((x) => JSON.stringify(x))].join('; '));
						cell.rm = rc;
					}
					cell.spikes = sp;
					if (t.args.dump) dump.push({ ...cell, data, smp });
				}
				await t.app.resetLayout();   // the saved look and motion go: the next fresh page starts in Basic Dark
			}
		}
		if (t.args.dump) { const fs = await import('node:fs'); fs.writeFileSync(String(t.args.dump), JSON.stringify({ cells: dump, pageMarks: t.__pageMarks || [] })); }
	}
};
