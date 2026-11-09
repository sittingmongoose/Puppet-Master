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
//         from there while the line is up. NieR's box is CSS-fixed; its painted box against the unscaled stage is judged at the same 1 px bound.
//   QA-6: each drawn string passes within .05 scene units of its rest suspension; the suspension's offset/height
//         stay within .05 units per scene. Its other end lies on the painted prop's attachment (read independently
//         through SVG matrices), within the renderer's .01-grid precision. A visible top crossing must be explained
//         by those two points, with their rounding uncertainty propagated. Retro's intentional 10/20 Hz draws are
//         not treated as 60 Hz jumps; a line wholly above the pane has no visible top crossing yet.
//   QA-4b: no prop's destination (restBox) changes within a scene (a destination that refits mid-scene is the jump
//         a retained prop made when bubble clearance changed).
// Route: every onboarding screen (ui.go, a real pointer arrival first so Pip wakes and talks), dwelt on while its
// props enter, swing and settle. `--set looks=a,b`, `--set screens=a,b`, `--set size=740x900`, `--set motion=reduce`,
// `--set frames=1 --set counter=1` retains per-frame geometry and encoded film tags; `--set secs=` dwell seconds (default 4), `--set sandbox=1` for T3's sandbox. Headless or --record (the film judged
// by the same sampler; string-top motion on film must read as the swing's own). All ten looks and every screen is
// about an hour; the defaults below keep the committed-page run to the full route.
// Hover regression: --set screens=begin,s-kind,r-source keeps the real pointer over the choices as they open.
// A preview changes the cast while the question is still being read. V19 moved that same line103–191px;
// preserving its occupied room without validating retained destinations (V20) moved string anchors53–169u.
// The ordinary full-line, suspension and destination assertions below reject both, without new tolerances.
// Creating retains its completed owner transaction across this walk's later look changes. stage-ground-fit starts
// a fresh transaction for EACH look/surface and applies the same exported string-law judge to every entry frame.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCREENS = ['welcome', 'look', 'begin', 'where', 'away', 'name', 'safe', 'protect', 'online-service', 'online-signin', 'online-details', 'ai', 'ai-none', 'ai-all', 'review', 'creating', 'c-review', 'c-ready', 'free', 'like', 'ready', 'ex-folder', 'ex-repos', 's-kind', 's-wait', 's-confirm', 's-ready', 'away-setup', 'c-route', 'c-pair', 'nas-find', 'nas-identity', 'nas-pmpair', 'nas-key', 'nas-install', 'nas-smb', 'nas-nfs', 'nas-mounted', 'nas-folder', 'nas-signin', 'r-source', 'r-pick', 'r-preview', 'r-unlock', 'r-done'];

export function installSampler(counter) {
	if (window.__qbs) return;
	const S = window.__qbs = { on: false, frames: [], directN: 0, seq: 0 };
	let cells = null;
	if (counter) {
		const tag = document.createElement('div'); tag.style.cssText = 'position:fixed;left:0;top:0;width:168px;height:8px;contain:strict;z-index:2147483647;pointer-events:none';
		cells = Array.from({length:42}, (_,i) => { const e=document.createElement('i'); e.style.cssText=`position:absolute;left:${i*4}px;top:0;width:4px;height:8px;background:#808080`; tag.appendChild(e); return e; });
		document.documentElement.appendChild(tag);
	}
	S.cells = cells;
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
		const prop = st.placeProp;
		st.placeProp = function(pr) {
			const result=prop.call(this,pr), rp=pr.restFit, tg=this.propTarget(pr);
			const mid=pr.ties.reduce((s,t)=>s+t[0],0)/pr.ties.length;
			pr.__qbsPaint={ax:pr.ax,a:pr.a,grounded:!!(pr.spec.ground&&pr.landed),
				anch:rp?pr.ties.map(t=>[R2(pr.ax+rp.ax-tg.ax+(t[0]-mid)*rp.sc),R2(this.L.anchorY+rp.dy)]):null,
				restBox:pr.restBox?pr.restBox.map(R2):null};
			return result;
		};
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
			fr.stageRect = [sr.left,sr.top,sr.width,sr.height];
			const sm = st.svg?.getScreenCTM();
			fr.svgCTM = sm ? [sm.a,sm.b,sm.c,sm.d,sm.e,sm.f] : null;
			fr.screen = window.O55.S.sess && window.O55.S.sess.screen;
			fr.layout = st.layoutName; fr.fam = st.famName;
			fr.bub = { shown: +cs.opacity > 0.05 && cs.visibility !== 'hidden' && b.classList.contains('on') && /\S/.test(b.textContent || '') ? 1 : 0,
				text: (b.textContent || '').trim(), ow: b.offsetWidth, oh: b.offsetHeight,
				tr: tr ? [R2(+tr[1]), R2(+tr[2])] : null,
				rel: st.__relAtPlace || (tr ? [R2(+tr[1] - sp[0]), R2(+tr[2] - sp[1])] : null),
				boxRel: [R2(br.left - hr.left), R2(br.top - hr.top)],
				fixed: [R2((br.left-sr.left)/(sr.width/(st.screen.offsetWidth||sr.width))), R2((br.top-sr.top)/(sr.width/(st.screen.offsetWidth||sr.width)))] };
			fr.visY0 = st.vis ? R2(st.vis.y0) : null;
			fr.vis = st.vis ? [R2(st.vis.x0), R2(st.vis.y0), R2(st.vis.x1), R2(st.vis.y1)] : null;
			fr.keep = st.keepOff ? st.keepOff.map(R2) : null;
			fr.rn = st.renderN || 0;
			fr.mapK = st.map ? [st.map.k, st.map.ox, st.map.oy] : null;
			fr.anchorY = st.L.anchorY;
			if(window.__qbsDiagnostics) fr.pip = {C:{...st.ps.C},Ct:{...st.ps.Ct},th:st.ps.th,tilt:st.ps.tilt,tiltT:st.ps.tiltT,dy:st.ps.dy,phi:st.ps.phi,rel:st.bubbleRel,claim:st.bubbleClaim};
			fr.props = [];
			st.props.forEach((pr, id) => {
				if (!pr.el || !pr.el.isConnected || !pr.ties || !pr.ties.length) return;
				const rp = pr.restFit || null, tg = st.propTarget(pr);
				const lines = pr.strs.map((s) => { const m = /^M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/.exec(s.getAttribute('d') || ''); return m ? [+m[1], +m[2], +m[3], +m[4]] : null; });
				const tieMidX = pr.ties.reduce((mm, t2) => mm + t2[0], 0) / pr.ties.length;
				const offs = pr.ties.map((t2) => R2(t2[0] - tieMidX));
				// the anchor each string must hang from, from the destination the stage itself keeps (restPose): over the
				// pivot at the destination's fit offset; absent on a page built before the helper, which fails by name
				const painted = pr.__qbsPaint;
				const anch = painted ? painted.anch : rp ? offs.map((o) => [R2(pr.ax + (rp.ax - tg.ax) + o * rp.sc), R2(st.L.anchorY + rp.dy)]) : null;
				// Read the painted prop's attachment points independently of the string path. Parent-relative CTMs
				// cancel the SVG viewport transform; neither transform list nor product state is changed by this read.
				let ends = null;
				try {
					const local = pr.el.parentNode.getCTM().inverse().multiply(pr.el.getCTM());
					ends = pr.ties.map(t => [R2(local.a*t[0]+local.c*t[1]+local.e), R2(local.b*t[0]+local.d*t[1]+local.f)]);
				} catch (e) { /* missing geometry fails below */ }
				const tieTol = pr.ties.map(t => .03 + .006*Math.hypot(t[0]-tieMidX,t[1]-tg.tieY));
				fr.props.push({ id, kind: pr.spec && pr.spec.kind, state: pr.state, grounded: painted ? +painted.grounded : pr.spec.ground && pr.landed ? 1 : 0, op: +(pr.el.getAttribute('opacity')||0), ax: R2(painted?painted.ax:pr.ax), tgAx: R2(tg.ax),
					a: R2((painted?painted.a:pr.a)*57.3), dashed: !!pr.spec.preview, offs, anch, ends, tieTol, painted:!!painted, restBox: painted?painted.restBox:pr.restBox?pr.restBox.map(R2):null, lines });
			});
		} else fr.none = 1;
		if (cells) {
			fr.paintSeq = ++S.seq; const bits = [1,0];
			for(let i=0;i<20;i++) bits.push((S.seq>>i)&1);
			for(let i=0;i<20;i++) bits.push(1-((S.seq>>i)&1));
			bits.forEach((v,i)=>{cells[i].style.background=v?'#fff':'#000';});
		}
		S.frames.push(fr);
	}).observe(d);
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const lineDist = (ln, p) => { const L = Math.hypot(ln[2] - ln[0], ln[3] - ln[1]) || 1; return Math.abs((ln[2] - ln[0]) * (ln[1] - p[1]) - (ln[0] - p[0]) * (ln[3] - ln[1])) / L; };
const crossAt = (ln, y) => (ln[3] === ln[1] ? ln[0] : ln[0] + (ln[2] - ln[0]) * (y - ln[1]) / (ln[3] - ln[1]));

export function judgeStringFrames(fr, look, screen) {
 const bad6=[],badDest=[],noHelper=[];let strings=0,dests=0;
		// ---- QA-6 + QA-4b: per (scene segment, prop). A segment ends where restPose itself is allowed to refit
		// (a new direct, a layout or visible-span change); a changing speech clearance is not a new scene
		const byProp = new Map();
		for (const x of fr) { for (const p of x.props || []) {
			const k = `${p.id}|${x.dn}|${x.layout}|${x.vis ? x.vis.join(',') : ''}`;
			if (!byProp.has(k)) byProp.set(k, []);
			byProp.get(k).push({ x, p });
		} }
		for (const [k, rows] of byProp) {
			// Direct/layout/span revisions delimit scenes. Every visible hanging frame is retained, including the
			// first: neither a preliminary destination nor changing speech clearance may move its suspension later.
			// a grounded prop's strings unhook and lift away by design; they are not judged as hanging strings
			const vis = rows.filter(({ p }) => p.op > 0.02 && p.state !== 'out' && !p.grounded);
			if (!vis.length) continue;
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
				if (!data.length) continue;
				strings++;
				// with no restPose on the page (a build before the helper), the anchor a string must keep is read from
				// where its settled line crosses the anchor height: the same distances then judge it by measurement
				const anchorOf = hasHelper ? (p) => p.anch[si] : (() => { const ax0 = median(data.slice(-20).map(({ x, p }) => crossAt(p.lines[si], x.anchorY))); return () => [ax0, data[0].x.anchorY]; })();
				const dists = data.map(({ p }) => lineDist(p.lines[si], anchorOf(p)));
				const offSpan = hasHelper ? Math.max(...data.map(({ p }) => p.anch[si][0] - p.ax)) - Math.min(...data.map(({ p }) => p.anch[si][0] - p.ax)) : 0;
				const hSpan = hasHelper ? Math.max(...data.map(({ p }) => p.anch[si][1])) - Math.min(...data.map(({ p }) => p.anch[si][1])) : 0;
				const visible = data.filter(({x,p}) => { const l=p.lines[si], y=x.visY0 == null ? x.anchorY : x.visY0; return Math.min(l[1],l[3]) <= y && Math.max(l[1],l[3]) >= y; });
				const crosses = visible.map(({ x, p }) => crossAt(p.lines[si], x.visY0 == null ? x.anchorY : x.visY0));
				const cSpan = Math.max(...crosses) - Math.min(...crosses);
				// A rope's top follows the line through its fixed suspension and its painted attachment. Check that
				// relation, rather than guessing a span from one side's sin(angle), or treating Retro's 100 ms draw
				// as a 16 ms jump. A line ending above the pane has no painted crossing of its visible top yet.
				let missing = false, worstTie = 0, worstTop = 0;
				for (const {x,p} of data) {
					if (hasHelper && !p.painted) missing=true;
					const end=p.ends?.[si], tolerance=p.tieTol?.[si];
					if (!end || tolerance == null) { missing=true; continue; }
					worstTie=Math.max(worstTie,lineDist(p.lines[si],end)/tolerance);
				}
				for (const {x,p} of visible) {
					const end=p.ends?.[si]; if(!end) continue;
					const a=anchorOf(p), y=x.visY0 == null ? x.anchorY : x.visY0;
					const expected=crossAt([a[0],a[1],end[0],end[1]],y);
					// Prop transforms render on a .01 grid; propagate their bounded rounding at the attachment
					// to the top. This matters for a rope initially almost zero length. Anchor error stays .05u.
					const tolerance=(p.tieTol[si]+.05)*(1+Math.abs(y-a[1])/Math.max(.01,Math.abs(end[1]-a[1])));
					worstTop=Math.max(worstTop,Math.abs(crossAt(p.lines[si],y)-expected)/tolerance);
				}
				const worstD = Math.max(...dists);
				if (missing || worstD > .05 || offSpan > .05 || hSpan > .05 || worstTie > 1 || worstTop > 1)
					bad6.push(`${look} ${screen} ${p0.id} (${p0.kind}) string ${si}: anchor error ${worstD.toFixed(3)} u, offset/height span ${offSpan.toFixed(3)}/${hSpan.toFixed(3)} u (each <=.05); painted-tie error ${worstTie.toFixed(2)}x and unexplained top ${worstTop.toFixed(2)}x their render-precision bounds; ${visible.length} visible crossings, span ${Number.isFinite(cSpan)?cSpan.toFixed(1):'none'} u, missing geometry ${missing}`);
			}
		}
 return {bad6,badDest,noHelper,strings,dests};
}

export default async function (t) {
	const size = /^(\d+)x(\d+)$/.exec(String(t.args.size || ''));
	if (size) await t.viewport(+size[1], +size[2]);
	const dwell = Math.max(1200, (+(t.args.secs || 4)) * 1000);
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const screens = t.args.screens ? String(t.args.screens).split(',') : SCREENS;
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.gHead); }, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
	await f.evaluate(installSampler, !!t.args.counter);
	await f.evaluate(v=>{window.__qbsDiagnostics=v;},!!t.args.diagnostics);
	const quiet = () => f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});
	const wake = async () => {
		await t.page.mouse.move(400, 350);
		await t.page.mouse.move(1000, 550, { steps: 16 });
		await f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.sleepZ, null, { timeout: 6000 }).catch(() => {});
	};
	await f.waitForTimeout(1100); await wake(); await f.waitForTimeout(1200);

	const bad4 = [], bad6 = [], badDest = [], noHelper = [], diagnostics = [], notOpened = [];
	let scenes = 0, lines = 0, strings = 0, dests = 0;
	const judge = (look, screen, frames) => {
		const fr = frames.filter((x) => !x.none);
		// Snapshot the suspension at placeProp's draw, then read its painted line/tie on EVERY frame. Retro's
		// physics may advance after an earlier synchronous draw in the same frame; a changed renderN alone
		// cannot establish that current physics and the visible pose are from the same instant.
		if (fr.length < 20) return;
		scenes++;
		// ---- QA-4: one full line on its screen/layout, including director updates while it stays visible.
		let cur = null; const eps = [];
		for (const x of fr) {
			const b = x.bub, key = b && b.shown ? [x.screen, x.layout, b.text].join('|') : null;
			if (cur && cur.key === key) cur.rows.push(x);
			else { if (cur) eps.push(cur); cur = key ? { key, rows: [x] } : null; }
		}
		if (cur) eps.push(cur);
		for (const e of eps) {
			// deviation in whichever frame the place is anchored to: against the speech point when the bubble follows
			// Pip, on the screen when an obstacle or the stage edge pins it while Pip sways (Retro's cramped banner).
			// Read in scene units, then scaled by the settled map: a stage that is still opening (the sandbox sheet)
			// rescales every px offset while the bubble keeps the same scene place
			const rels = e.rows.map((x) => { const r = x.fam === 'nier' ? x.bub.fixed : !x.bub.rel ? x.bub.boxRel : x.bub.rel; const k = x.fam === 'nier' ? 1 : x.mapK ? x.mapK[0] : 1; return r ? [r[0] / k, r[1] / k] : null; });
			const trs = e.rows.map((x) => { if(x.fam === 'nier') return x.bub.fixed; const r = x.bub.tr; if (!r || !x.mapK) return x.bub.boxRel; return [(r[0] - x.mapK[1]) / x.mapK[0], (r[1] - x.mapK[2]) / x.mapK[0]]; });
			if (rels.some((r) => !r)) continue;
			lines++;
			const kSet = e.rows[0].fam === 'nier' ? 1 : median(e.rows.slice(-20).map((x) => x.mapK ? x.mapK[0] : 1));
			const sx = median(rels.slice(-20).map((r) => r[0])), sy = median(rels.slice(-20).map((r) => r[1]));
			const tx = median(trs.slice(-20).map((r) => r[0])), ty = median(trs.slice(-20).map((r) => r[1]));
			const devs = rels.map((r, i) => Math.max(Math.min(Math.abs(r[0] - sx), Math.abs(trs[i][0] - tx)), Math.min(Math.abs(r[1] - sy), Math.abs(trs[i][1] - ty))) * kSet);
			const worst = Math.max(...devs), wi = devs.indexOf(worst);
			// NieR's fixed box is measured against the stage, so Pip's independent hover cannot inflate its bound.
			const tol = 1;
			if (devs[0] > tol || worst > tol) {
				if(t.args.diagnostics) diagnostics.push({look,screen,first:devs[0],worst,frames:e.rows});
				bad4.push(`${look} ${screen} '${e.rows[0].bub.text.slice(0, 32)}': first frame ${devs[0].toFixed(1)} px from settled, worst ${worst.toFixed(1)} px at +${e.rows[wi].t - e.rows[0].t} ms (${e.rows.length} frames; settled rel [${sx.toFixed(1)}, ${sy.toFixed(1)}] tr [${tx.toFixed(1)}, ${ty.toFixed(1)}], first rels ${rels.slice(0, 5).map((r) => `[${r[0].toFixed(1)}, ${r[1].toFixed(1)}]`).join(' ')})`);
			}
		}
		const sj = judgeStringFrames(fr, look, screen);
		bad6.push(...sj.bad6);badDest.push(...sj.badDest);noHelper.push(...sj.noHelper);strings+=sj.strings;dests+=sj.dests;
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
				await f.evaluate((sid) => { const O=window.O55, d=O.screens.defs[sid]; if(d && d.seed) d.seed(O.S); O.ui.go(sid, { noHistory: true }); }, screen);
				await f.waitForTimeout(dwell);
				const frames = await f.evaluate(() => { const S = window.__qbs; S.on = false; S.cells?.forEach(e=>{e.style.background='#808080';}); const r = S.frames; S.frames = []; return r; });
				if(t.args.frames) fs.appendFileSync(path.join(t.run.dir, 'anchors-frames.jsonl.gz'), zlib.gzipSync(JSON.stringify({look,screen,frames})+'\n'));
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
		notOpened.push(...unreached.map(s=>`${look}: ${s}`));
		t.log(`${look}: ${screens.length - unreached.length}/${screens.length} screens opened${unreached.length ? '; not opened: ' + unreached.join(', ') : ''}`);
	}
	if (noHelper.length) t.log(`no restPose destination: ${noHelper.slice(0, 6).join('; ')}${noHelper.length > 6 ? ` (+${noHelper.length - 6} more)` : ''}`);
	await t.check('every requested screen opened with its owner fixture',notOpened.length===0,notOpened.join('; '));
	if(t.args.diagnostics) fs.writeFileSync(path.join(t.run.dir,'anchors-diagnostics.json.gz'),zlib.gzipSync(JSON.stringify(diagnostics)));
	await t.check(`QA-4: each line's bubble sits on its first shown frame within 1 px of where it settles and never strays further (${scenes} scenes, ${lines} lines)`, scenes > 0 && lines > 0 && bad4.length === 0, `${bad4.length} line(s): ` + bad4.slice(0, 8).join('; ') + (bad4.length > 8 ? ` (+${bad4.length - 8} more)` : ''));
	await t.check(`QA-6: every string hangs from its rest anchor, its top moving only as the swing explains (${strings} strings)`, strings > 0 && bad6.length === 0, bad6.slice(0, 8).join('; ') + (bad6.length > 8 ? ` (+${bad6.length - 8} more)` : ''));
	await t.check(`QA-4b: no prop's destination refits within a scene (${dests} destinations${noHelper.length ? '; a page with no rest destination has none to judge, QA-6 above is its measure' : ''})`, badDest.length === 0, badDest.slice(0, 8).join('; ') + (badDest.length > 8 ? ` (+${badDest.length - 8} more)` : ''));
}
