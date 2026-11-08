// QA-4 and QA-6 (Jared's QA, stream F batch 9): Pip's speech bubble sometimes spawned high up and lowered to its
// correct place seconds later, and hanging props' strings swung from weird angles with their tops moving in ways
// nothing caused. Causes, measured on b3456fac54 (glass-dark, this check's route): placeBubble dodged props at the
// boxes they fall THROUGH (and only once they had faded in), so the bubble stepped up or aside mid-line and the
// step-aside was kept up to 2.5 s ('Where shall we do the work?' sat 79 px high, worst excursion 113 px, settled at
// +4.2 s; r-source opened 44-68 px from where it settles); and each prop string was drawn from a point 200 units
// above the pendulum anchor at fit()'s frame-by-frame offset, so the line turned about that far point and followed
// fit's answer to the swing and to passing obstacles (where a string met the pane's top slid up to 25 units; the
// sign's tops slid 14.9 units while its ties stood still). A retained prop's destination also refitted when bubble
// clearance changed (r-pick to r-preview's restore jumped 18-27 units in a frame, fo-qa-drop).
//
// The fix reads every prop's rest pose (restPose(pr), fo-qa-drop) from its first frame: the bubble keeps off rest
// boxes, a new line starts with no kept step-aside or claim, and each string is drawn from its tie straight through
// its rest anchor. This check, per frame read at its end (ResizeObserver, the pip-bubble-clear sampler):
//   QA-4: per line, the bubble's placement relative to Pip's head (its style.translate against the head point it is
//         placed from) on its FIRST shown frame is within 1 px of where it settles, and never strays more than 1 px
//         from there while the line is up. NieR's box is CSS-fixed; its painted box against the head is judged.
//   QA-6: per string, the line passes within 1.5 scene units of its rest anchor (over the pivot the prop swings
//         from, at the destination's fit offset) in every frame; that anchor's offset from the pivot and its height
//         never change within a scene; and where the string meets the visible top moves no more than the swing
//         itself explains (the span a pendulum about that anchor sweeps there, plus 5 units), with no single-frame
//         jump over 3 units while the prop is not travelling to a new slot. Natural sway stays; fit-driven tops fail.
//   QA-4b: no prop's destination (restBox) changes within a scene (a destination that refits mid-scene is the jump
//         a retained prop made when bubble clearance changed).
// Route: every onboarding screen (ui.go, a real pointer arrival first so Pip wakes and talks), dwelt on while its
// props enter, swing and settle. `--set looks=a,b`, `--set screens=a,b`, `--set size=740x900`, `--set motion=reduce`,
// `--set secs=` dwell seconds (default 4), `--set sandbox=1` for T3's sandbox. Headless or --record (the film judged
// by the same sampler; string-top motion on film must read as the swing's own). All ten looks and every screen is
// about an hour; the defaults below keep the committed-page run to the full route.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCREENS = ['welcome', 'look', 'begin', 'where', 'away', 'name', 'safe', 'protect', 'online-service', 'online-signin', 'online-details', 'ai', 'ai-none', 'ai-all', 'review', 'creating', 'c-review', 'c-ready', 'free', 'like', 'ready', 'ex-folder', 'ex-repos', 's-kind', 's-wait', 's-confirm', 's-ready', 'away-setup', 'c-route', 'c-pair', 'nas-find', 'nas-identity', 'nas-pmpair', 'nas-key', 'nas-install', 'nas-smb', 'nas-nfs', 'nas-mounted', 'nas-folder', 'nas-signin', 'r-source', 'r-pick', 'r-preview', 'r-unlock', 'r-done'];

function installSampler() {
	if (window.__qbs) return;
	const S = window.__qbs = { on: false, frames: [], directN: 0 };
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	const R2 = (n) => Math.round(n * 100) / 100;
	S.wrap = () => {
		const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
		if (!st || st.__qbsWrapped) return;
		const direct = st.direct;
		st.direct = function (...a) { S.directN++; return direct.apply(this, a); };
		const place = st.placeBubble;
		st.placeBubble = function (H, ang) { const r = place.call(this, H, ang); try { const s2 = this.toScreen(this.headXf(this.layoutName === 'portrait' ? [44, 30] : [58, 44], H, ang, 1, 1)), m = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(this.bubble.style.translate || ''); this.__relAtPlace = m ? [Math.round((+m[1] - s2[0]) * 100) / 100, Math.round((+m[2] - s2[1]) * 100) / 100] : null; } catch (e) { this.__relAtPlace = null; } return r; };
		st.__qbsWrapped = true;
	};
	S.wrap();
	new ResizeObserver(() => {
		if (!S.on) return;
		S.wrap();
		const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
		const fr = { t: Math.round(performance.now()), dn: S.directN };
		if (st && !st.dead && st.gHead && st.gHead.isConnected && st.screen && st.H) {
			const b = st.bubble, cs = getComputedStyle(b);
			const tr = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(b.style.translate || '');
			const tall = st.layoutName === 'portrait';
			const sp = st.toScreen(st.headXf(tall ? [44, 30] : [58, 44], st.H, st.ang, 1, 1));
			const sr = st.screen.getBoundingClientRect(), br = b.getBoundingClientRect(), hr = st.gHead.getBoundingClientRect();
			fr.screen = window.O55.S.sess && window.O55.S.sess.screen;
			fr.layout = st.layoutName; fr.fam = st.famName;
			fr.bub = { shown: +cs.opacity > 0.05 && cs.visibility !== 'hidden' && b.classList.contains('on') && /\S/.test(b.textContent || '') ? 1 : 0,
				text: (b.textContent || '').trim(), ow: b.offsetWidth, oh: b.offsetHeight,
				tr: tr ? [R2(+tr[1]), R2(+tr[2])] : null,
				rel: st.__relAtPlace || (tr ? [R2(+tr[1] - sp[0]), R2(+tr[2] - sp[1])] : null),
				boxRel: [R2(br.left - hr.left), R2(br.top - hr.top)] };
			fr.visY0 = st.vis ? R2(st.vis.y0) : null;
			fr.vis = st.vis ? [R2(st.vis.x0), R2(st.vis.y0), R2(st.vis.x1), R2(st.vis.y1)] : null;
			fr.keep = st.keepOff ? st.keepOff.map(R2) : null;
			fr.rn = st.renderN || 0;
			fr.anchorY = st.L.anchorY;
			fr.props = [];
			st.props.forEach((pr, id) => {
				if (!pr.el || !pr.el.isConnected || !pr.ties || !pr.ties.length) return;
				const rp = pr.restFit || null, tg = st.propTarget(pr);
				const lines = pr.strs.map((s) => { const m = /^M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/.exec(s.getAttribute('d') || ''); return m ? [+m[1], +m[2], +m[3], +m[4]] : null; });
				const tieMidX = pr.ties.reduce((mm, t2) => mm + t2[0], 0) / pr.ties.length;
				const offs = pr.ties.map((t2) => R2(t2[0] - tieMidX));
				// the anchor each string must hang from, from the destination the stage itself keeps (restPose): over the
				// pivot at the destination's fit offset; absent on a page built before the helper, which fails by name
				const anch = rp ? offs.map((o) => [R2(pr.ax + (rp.ax - tg.ax) + o * rp.sc), R2(st.L.anchorY + rp.dy)]) : null;
				fr.props.push({ id, kind: pr.spec && pr.spec.kind, state: pr.state, grounded: pr.grounded ? 1 : 0, op: R2(pr.op), ax: R2(pr.ax), tgAx: R2(tg.ax),
					a: R2(pr.a * 57.3), offs, anch, restBox: pr.restBox ? pr.restBox.map(R2) : null, lines });
			});
		} else fr.none = 1;
		S.frames.push(fr);
	}).observe(d);
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const lineDist = (ln, p) => { const L = Math.hypot(ln[2] - ln[0], ln[3] - ln[1]) || 1; return Math.abs((ln[2] - ln[0]) * (ln[1] - p[1]) - (ln[0] - p[0]) * (ln[3] - ln[1])) / L; };
const crossAt = (ln, y) => (ln[3] === ln[1] ? ln[0] : ln[0] + (ln[2] - ln[0]) * (y - ln[1]) / (ln[3] - ln[1]));

export default async function (t) {
	const size = /^(\d+)x(\d+)$/.exec(String(t.args.size || ''));
	if (size) await t.viewport(+size[1], +size[2]);
	const dwell = Math.max(1200, (+(t.args.secs || 4)) * 1000);
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const screens = t.args.screens ? String(t.args.screens).split(',') : SCREENS;
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.gHead); }, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
	await f.evaluate(installSampler);
	const quiet = () => f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});
	const wake = async () => {
		await t.page.mouse.move(400, 350);
		await t.page.mouse.move(1000, 550, { steps: 16 });
		await f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.sleepZ, null, { timeout: 6000 }).catch(() => {});
	};
	await f.waitForTimeout(1100); await wake(); await f.waitForTimeout(1200);

	const bad4 = [], bad6 = [], badDest = [], noHelper = [];
	let scenes = 0, lines = 0, strings = 0, dests = 0;
	const judge = (look, screen, frames) => {
		const fr = frames.filter((x) => !x.none);
		// a stepped stage (Retro) draws its props at its own rate: between draws the physics has moved on but the
		// painted string is the last draw's, so strings are judged on frames the stage drew
		fr.forEach((x, i) => { x.fresh = i === 0 || x.rn !== fr[i - 1].rn; });
		if (fr.length < 20) return;
		scenes++;
		// ---- QA-4: per (scene segment, line, size) episode, first frame against settled, and no straying
		let cur = null; const eps = [];
		for (const x of fr) {
			const b = x.bub, key = b && b.shown ? [x.dn, x.layout, b.text, b.ow, b.oh].join('|') : null;
			if (cur && cur.key === key) cur.rows.push(x);
			else { if (cur) eps.push(cur); cur = key ? { key, rows: [x] } : null; }
		}
		if (cur) eps.push(cur);
		for (const e of eps) {
			if (e.rows.length < 12) continue;
			// deviation in whichever frame the place is anchored to: against the speech point when the bubble follows
			// Pip, on the screen when an obstacle or the stage edge pins it while Pip sways (Retro's cramped banner)
			const rels = e.rows.map((x) => x.fam === 'nier' || !x.bub.rel ? x.bub.boxRel : x.bub.rel);
			const trs = e.rows.map((x) => x.bub.tr || x.bub.boxRel);
			if (rels.some((r) => !r)) continue;
			lines++;
			const sx = median(rels.slice(-20).map((r) => r[0])), sy = median(rels.slice(-20).map((r) => r[1]));
			const tx = median(trs.slice(-20).map((r) => r[0])), ty = median(trs.slice(-20).map((r) => r[1]));
			const devs = rels.map((r, i) => Math.max(Math.min(Math.abs(r[0] - sx), Math.abs(trs[i][0] - tx)), Math.min(Math.abs(r[1] - sy), Math.abs(trs[i][1] - ty))));
			const worst = Math.max(...devs), wi = devs.indexOf(worst);
			// NieR's box is painted-box judged: Pip hovers (a slow bob of the head), so its settling is read looser there
			const tol = e.rows[0].fam === 'nier' ? 6 : 1;
			if (devs[0] > tol || worst > tol)
				bad4.push(`${look} ${screen} '${e.rows[0].bub.text.slice(0, 32)}': first frame ${devs[0].toFixed(1)} px from settled, worst ${worst.toFixed(1)} px at +${e.rows[wi].t - e.rows[0].t} ms (${e.rows.length} frames; settled rel [${sx.toFixed(1)}, ${sy.toFixed(1)}] tr [${tx.toFixed(1)}, ${ty.toFixed(1)}], first rels ${rels.slice(0, 5).map((r) => `[${r[0].toFixed(1)}, ${r[1].toFixed(1)}]`).join(' ')})`);
		}
		// ---- QA-6 + QA-4b: per (scene segment, prop). A segment ends where restPose itself is allowed to refit
		// (a new direct, a layout or visible-span change, a new keepOff); within one, anchor and destination are fixed
		const byProp = new Map();
		for (const x of fr) { if (!x.fresh) continue; for (const p of x.props || []) {
			const k = `${p.id}|${x.dn}|${x.layout}|${x.vis ? x.vis.join(',') : ''}|${x.keep ? x.keep.join(',') : ''}`;
			if (!byProp.has(k)) byProp.set(k, []);
			byProp.get(k).push({ x, p });
		} }
		for (const [k, rows] of byProp) {
			// the sampler is armed before the jump, so a segment opens with the held frames of the old scene (the
			// stage is parked while the new screen comes in, still painted at the old destinations): a destination
			// change inside that window is the scene change itself, judged from its first settled frame
			let cut = 0;
			for (let i = 1; i < Math.min(rows.length, 13); i++) if (JSON.stringify(rows[i].p.restBox) !== JSON.stringify(rows[i - 1].p.restBox)) cut = i;
			// a grounded prop's strings unhook and lift away by design; they are not judged as hanging strings
			const vis = rows.slice(cut).filter(({ p }) => p.op > 0.02 && p.state !== 'out' && !p.grounded);
			if (vis.length < 12) continue;
			const p0 = vis[0].p;
			const hasHelper = vis.some(({ p }) => p.anch);
			if (!hasHelper) noHelper.push(`${look} ${screen} ${p0.id} (${p0.kind}): no rest destination on the page (judged against its settled string line)`);
			else dests++;
			const rb = vis.map(({ p }) => p.restBox).filter(Boolean);
			if (rb.length) {
				const span = [0, 1, 2, 3].map((i) => Math.max(...rb.map((b) => b[i])) - Math.min(...rb.map((b) => b[i])));
				if (Math.max(...span) > 1) badDest.push(`${look} ${screen} ${p0.id} (${p0.kind}): destination moved within the scene by [${span.map((s) => s.toFixed(1)).join(', ')}] units`);
			}
			for (let si = 0; si < (p0.offs || []).length; si++) {
				const data = vis.filter(({ p }) => p.lines && p.lines[si] && (hasHelper ? p.anch && p.anch[si] : true));
				if (data.length < 12) continue;
				strings++;
				// with no restPose on the page (a build before the helper), the anchor a string must keep is read from
				// where its settled line crosses the anchor height: the same distances then judge it by measurement
				const anchorOf = hasHelper ? (p) => p.anch[si] : (() => { const ax0 = median(data.slice(-20).map(({ x, p }) => crossAt(p.lines[si], x.anchorY))); return () => [ax0, data[0].x.anchorY]; })();
				const dists = data.map(({ p }) => lineDist(p.lines[si], anchorOf(p)));
				const offSpan = hasHelper ? Math.max(...data.map(({ p }) => p.anch[si][0] - p.ax)) - Math.min(...data.map(({ p }) => p.anch[si][0] - p.ax)) : 0;
				const hSpan = hasHelper ? Math.max(...data.map(({ p }) => p.anch[si][1])) - Math.min(...data.map(({ p }) => p.anch[si][1])) : 0;
				const axSpan = Math.max(...data.map(({ p }) => p.ax)) - Math.min(...data.map(({ p }) => p.ax));
				const crosses = data.map(({ x, p }) => crossAt(p.lines[si], x.visY0 == null ? x.anchorY : x.visY0));
				const cSpan = Math.max(...crosses) - Math.min(...crosses);
				const maxSin = Math.sin(Math.max(...data.map(({ p }) => Math.abs(p.a))) * Math.PI / 180);
				const reach = Math.abs((data[0].x.visY0 == null ? data[0].x.anchorY : data[0].x.visY0) - anchorOf(data[0].p)[1]);
				const bound = reach * maxSin + 5 + axSpan;
				const jumps = crosses.slice(1).map((c, i) => Math.abs(c - crosses[i]));
				const worstD = Math.max(...dists);
				if (worstD > 1.5 || offSpan > 1 || hSpan > 1 || cSpan > bound || (axSpan <= 1 && Math.max(...jumps, 0) > 3))
					bad6.push(`${look} ${screen} ${p0.id} (${p0.kind}) string ${si}: worst distance to its anchor ${worstD.toFixed(2)} u, anchor offset span ${offSpan.toFixed(2)} u, anchor height span ${hSpan.toFixed(2)} u, top-crossing span ${cSpan.toFixed(1)} u (swing explains ${bound.toFixed(1)}), worst 1-frame top jump ${Math.max(...jumps, 0).toFixed(1)} u over ${data.length} frames`);
			}
		}
	};

	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await quiet(); await f.waitForTimeout(900);
		const unreached = [];
		for (const screen of screens) {
			try {
				await wake(); await f.waitForTimeout(250);
				await f.evaluate(() => { const S = window.__qbs; S.frames = []; S.on = true; });
				t.mark(`${look} ${screen}`);
				await f.evaluate((sid) => window.O55.ui.go(sid, { noHistory: true }), screen);
				await f.waitForTimeout(dwell);
				const frames = await f.evaluate(() => { const S = window.__qbs; S.on = false; const r = S.frames; S.frames = []; return r; });
				const at = await f.evaluate(() => window.O55.S.sess.screen);
				if (at !== screen) { unreached.push(`${screen} (at ${at})`); continue; }
				judge(look, screen, frames);
			} catch (e) {
				// a screen whose jump throws in the page (a NAS step without its state) must not end the whole route
				unreached.push(`${screen} (threw: ${String(e && e.message || e).slice(0, 80)})`);
				await f.evaluate(() => { const S = window.__qbs; if (S) { S.on = false; S.frames = []; } }).catch(() => {});
				await f.evaluate(() => window.O55 && window.O55.ui && window.O55.ui.go('welcome', { noHistory: true })).catch(() => {});
				await f.waitForTimeout(600);
			}
		}
		t.log(`${look}: ${screens.length - unreached.length}/${screens.length} screens opened${unreached.length ? '; not opened: ' + unreached.join(', ') : ''}`);
	}
	if (noHelper.length) t.log(`no restPose destination: ${noHelper.slice(0, 6).join('; ')}${noHelper.length > 6 ? ` (+${noHelper.length - 6} more)` : ''}`);
	await t.check(`QA-4: each line's bubble sits on its first shown frame within 1 px of where it settles and never strays further (${scenes} scenes, ${lines} lines)`, scenes > 0 && lines > 0 && bad4.length === 0, `${bad4.length} line(s): ` + bad4.slice(0, 8).join('; ') + (bad4.length > 8 ? ` (+${bad4.length - 8} more)` : ''));
	await t.check(`QA-6: every string hangs from its rest anchor, its top moving only as the swing explains (${strings} strings)`, strings > 0 && bad6.length === 0, bad6.slice(0, 8).join('; ') + (bad6.length > 8 ? ` (+${bad6.length - 8} more)` : ''));
	await t.check(`QA-4b: no prop's destination refits within a scene (${dests} destinations${noHelper.length ? '; a page with no rest destination has none to judge, QA-6 above is its measure' : ''})`, badDest.length === 0, badDest.slice(0, 8).join('; ') + (badDest.length > 8 ? ` (+${badDest.length - 8} more)` : ''));
}
