// What Pip's stage paints at rest, and how much of it is the backdrop (diagnostic, asserts nothing about speed; pm7-perf
// lane X, 2026-11-17, step 1 of W2's step 6: "split the SVG so the backdrop does not repaint with Pip").
//   browser-check run diagnostics/stage-paint.check.mjs --set page=<build> [--set out=<file.json>]
//   --set looks=basic-dark,glass-dark,nier-dark,friendly-dark   --set screens=welcome,ready   --set ms=3000
//   --set variants=as,noback,still,paused,split,split-paused   --set keep=<dir> keeps each raw trace
// Per look and screen, at rest (the window open, Pip's line typed, its props settled, no input since a pointer journey
// that wakes Pip past Welcome), and per trial variant made in the page for the window and undone after it:
//   as            the page as built;
//   noback        the stage's backdrop group (.pst-back) not drawn: what painting it costs while Pip sways;
//   still         the motion clock stopped (O55.motion.setTimeScale(0)): Pip, its strings and props stand still, the
//                 backdrop's own CSS loops (motes, radar, data column, clouds, flies, drifts, bubbles, glow) run on;
//   paused        the backdrop's CSS loops paused, Pip swaying;
//   split         the backdrop group (and Glass's reflection and Retro's terrain) moved into an svg of its own behind
//                 the stage's svg, as W2 proposes (a trial in the page, not the product's change);
//   split-paused  the same with the backdrop's loops paused (the backdrop then holds nothing that changes);
//   split-layer   split, and the stage's own svg (Pip, its strings, props) on a compositor layer of its own (will-change);
//   noapp         the page behind the onboarding window not painted (content-visibility: hidden on body's other
//                 children): how much of the cost is the page's other layers, not the stage;
// it reads a DevTools trace (main-thread paint, pre-paint, layerize and commit ms a second, the paint group by event name,
// raster and GPU ms a second, main frames) and then the compositor's layers twice (LayerTree: paintCount per layer, so the
// layers that were painted again in every frame, with their size and the DOM node Chrome names for each).
// Normal surface only (the layers' DOM nodes are read through the top document).
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { traceEvents, summarise } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

const PAINT = /^(Paint$|PaintImage|LocalFrameView::RunPaintLifecyclePhase|PaintArtifactCompositor::|Paint::)/;

// self time per event name on the renderer's main thread, for the names of one group
function selfByName(events, renderer, re) {
	if (!renderer) return [];
	const evs = [], open = [];
	for (const e of events) {
		if (e.pid !== renderer.pid || e.tid !== renderer.tid || typeof e.name !== 'string') continue;
		if (e.ph === 'X') evs.push({ name: e.name, ts: e.ts, end: e.ts + (e.dur || 0) });
		else if (e.ph === 'B') open.push(e);
		else if (e.ph === 'E') { const b = open.pop(); if (b) evs.push({ name: b.name, ts: b.ts, end: e.ts }); }
	}
	evs.sort((a, b) => a.ts - b.ts || b.end - a.end);
	const self = new Map(), stack = [];
	const close = (upto) => { while (stack.length && stack[stack.length - 1].end <= upto) { const s = stack.pop(); self.set(s.name, (self.get(s.name) || 0) + Math.max(0, s.end - s.ts - s.child)); if (stack.length) stack[stack.length - 1].child += s.end - s.ts; } };
	for (const e of evs) { close(e.ts); const p = stack[stack.length - 1]; stack.push({ name: e.name, ts: e.ts, end: p ? Math.min(e.end, p.end) : e.end, child: 0 }); }
	close(Infinity);
	return [...self].filter(([n]) => re.test(n)).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

const SETTLED = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.ps) return false;
	if (st.bubble && st.bubble.classList.contains('typing')) return false;
	for (const p of st.props.values()) if (p.state === 'out' || !p.settled) return false;
	return true;
};

// One trial variant on, in the page; returns what it did. UNDO puts everything back.
const APPLY = (v) => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st) return 'no stage';
	const U = window.__spU = [];
	const pause = () => { for (const a of document.getAnimations()) { const el = a.effect && a.effect.target; if (el && el.closest && el.closest('.pst-back') && a.playState === 'running') { a.pause(); U.push(() => a.play()); } } };
	const split = () => {
		const NS = 'http://www.w3.org/2000/svg', svg = st.svg, back = document.createElementNS(NS, 'svg');
		for (const a of svg.attributes) back.setAttribute(a.name, a.value);
		back.classList.add('pst-trial-back');
		svg.parentNode.insertBefore(back, svg);
		const moved = [st.gBack, st.gTerrain, st.gReflect].filter(Boolean);
		const marks = moved.map((g) => { const m = document.createComment('x'); g.parentNode.insertBefore(m, g); return m; });
		moved.forEach((g) => back.appendChild(g));
		U.push(() => { moved.forEach((g, i) => marks[i].parentNode.insertBefore(g, marks[i])); marks.forEach((m) => m.remove()); back.remove(); });
		return moved.length;
	};
	if (v === 'noback') { st.gBack.style.display = 'none'; U.push(() => { st.gBack.style.display = ''; }); }
	else if (v === 'still') { O55.motion.setTimeScale(0); U.push(() => O55.motion.setTimeScale(1)); }
	else if (v === 'paused') pause();
	else if (v === 'split') split();
	else if (v === 'split-paused') { split(); pause(); }
	else if (v === 'split-layer') { split(); st.svg.style.willChange = 'transform'; U.push(() => { st.svg.style.willChange = ''; }); }
	else if (v === 'noapp') {
		/* the page behind the window not painted (content-visibility: hidden on every child of body that does not hold
		   the onboarding window): how much of the cost is the rest of the page's layers */
		const o = document.getElementById('pm-o55-onboarding');
		for (const el of document.body.children) { if (el.contains(o) || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue; const was = el.style.contentVisibility; el.style.contentVisibility = 'hidden'; U.push(() => { el.style.contentVisibility = was; }); }
	}
	else if (v !== 'as') return 'unknown variant ' + v;
	return '';
};
const UNDO = () => { const U = window.__spU || []; while (U.length) { try { U.pop()(); } catch (e) { /* gone */ } } };

// Boxes on the page: the stage's, its svg(s), Pip's and each prop's (for the layers' sizes against them)
const BOXES = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
	return { stage: r(st.root), svgs: [...st.root.querySelectorAll('svg.pst-svg')].map(r), pip: r(st.gPip), props: r(st.gProps), back: r(st.gBack), dpr: devicePixelRatio, fam: st.famName, asleep: !!st.sleepZ, nProps: st.props.size };
};

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,nier-dark,friendly-dark').split(',').filter(Boolean);
	const screens = String(t.args.screens || 'welcome,ready').split(',').filter(Boolean);
	const variants = String(t.args.variants || 'as,noback,still,paused,split,split-paused').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 3000);
	const keep = t.args.keep ? path.resolve(String(t.args.keep)) : null;
	if (keep) mkdirSync(keep, { recursive: true });
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const cdp = await t.page.context().newCDPSession(t.page);
	const gpu = await t.page.evaluate(() => { try { const c = document.createElement('canvas').getContext('webgl'); const e = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(e.UNMASKED_RENDERER_WEBGL); } catch (e) { return String(e); } });
	t.log('GPU ' + gpu + ' | ' + (await t.page.evaluate(() => navigator.userAgent)));
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screens[0] + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, open ? screens[0] : 'no window after 60 s');
	if (!open) return;
	if (f !== t.page.mainFrame()) t.log('NOTE the app is in a frame: layers are named through the top document only');
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 20000));

	// the compositor's layers: paintCount per layer over a window, with the DOM node each names
	const snapshot = () => new Promise((resolve) => {
		const on = (e) => { if (e.layers) { cdp.off('LayerTree.layerTreeDidChange', on); resolve(e.layers); } };
		cdp.on('LayerTree.layerTreeDidChange', on);
		cdp.send('LayerTree.enable').catch(() => resolve(null));
		setTimeout(() => { cdp.off('LayerTree.layerTreeDidChange', on); resolve(null); }, 4000);
	});
	const layers = async () => {
		const painted = []; const onP = (e) => painted.push(e);
		cdp.on('LayerTree.layerPainted', onP);
		const a = await snapshot(); const t0 = Date.now();
		await t.page.waitForTimeout(ms);
		await cdp.send('LayerTree.disable').catch(() => {});
		const b = await snapshot(); const secs = (Date.now() - t0) / 1000;
		await cdp.send('LayerTree.disable').catch(() => {});
		cdp.off('LayerTree.layerPainted', onP);
		if (!a || !b) return { error: 'no layer tree' };
		const before = new Map(a.map((l) => [l.layerId, l.paintCount || 0]));
		const rows = [];
		for (const l of b) {
			if (!l.drawsContent) continue;
			const d = (l.paintCount || 0) - (before.get(l.layerId) ?? 0);
			let node = '';
			if (l.backendNodeId) { try { const n = (await cdp.send('DOM.describeNode', { backendNodeId: l.backendNodeId })).node; node = n.localName + (n.attributes ? (() => { const at = {}; for (let i = 0; i < n.attributes.length; i += 2) at[n.attributes[i]] = n.attributes[i + 1]; return (at.id ? '#' + at.id : '') + (at.class ? '.' + at.class.trim().split(/\s+/).slice(0, 3).join('.') : ''); })() : ''); } catch (e) { node = 'node ' + l.backendNodeId; } }
			rows.push({ id: l.layerId, w: Math.round(l.width), h: Math.round(l.height), x: Math.round(l.offsetX), y: Math.round(l.offsetY), paintsPerSec: Math.round(d / secs * 10) / 10, node });
		}
		rows.sort((x, y) => y.paintsPerSec - x.paintsPerSec || y.w * y.h - x.w * x.h);
		const pe = new Map();
		for (const e of painted) { const k = e.layerId, s = pe.get(k) || { n: 0, area: 0, max: [0, 0] }; s.n++; const c = e.clip || {}; s.area += (c.width || 0) * (c.height || 0); if ((c.width || 0) * (c.height || 0) > s.max[0] * s.max[1]) s.max = [c.width, c.height]; pe.set(k, s); }
		return { secs: Math.round(secs * 10) / 10, n: b.length, drawn: rows.length, repainted: rows.filter((r) => r.paintsPerSec > 0).slice(0, 8), layerPainted: painted.length ? [...pe].map(([k, s]) => ({ id: k, perSec: Math.round(s.n / secs * 10) / 10, areaPerPaint: Math.round(s.area / s.n), max: s.max })) : 'none (Chrome sent no LayerTree.layerPainted)' };
	};

	const out = [];
	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${look}: the look is applied`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme')));
		if (!ok) continue;
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		for (const screen of screens) {
			const at = await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, screen);
			if (at !== screen) { await t.check(`${look} ${screen}: the screen opened`, false, String(at)); continue; }
			if (screen !== 'welcome') {
				await t.page.waitForTimeout(1200);
				for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
				await t.page.mouse.move(W - 6, Math.round(H / 2));
			}
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).catch(() => t.log(`${look} ${screen}: NOTE not settled after 16 s; measured as it was`));
			const boxes = await f.evaluate(BOXES);
			t.log(`${look} ${screen}: stage ${boxes.stage} svgs ${JSON.stringify(boxes.svgs)} Pip ${boxes.pip} props ${boxes.props} (${boxes.nProps}) dpr ${boxes.dpr}${boxes.asleep ? ' asleep' : ''}`);
			for (const v of variants) {
				const err = await f.evaluate(APPLY, v);
				if (err) { t.log(`${look} ${screen} ${v}: NOTE ${err}`); await f.evaluate(UNDO); continue; }
				await t.page.waitForTimeout(700);
				let x = null, names = [], e = '';
				try { const ev = await traceEvents(cdp, { ms }); if (keep) writeFileSync(path.join(keep, `${look}-${screen}-${v}.json`), JSON.stringify(ev)); x = summarise(ev, { url: f.url() }); names = selfByName(ev, x.renderer, PAINT).map(([n, us]) => [n, Math.round(us / 1000 / x.secs * 10) / 10]); } catch (er) { e = String(er && er.message || er); }
				const ly = await layers().catch((er) => ({ error: String(er) }));
				await f.evaluate(UNDO);
				const n = (k) => Math.round((x && x.split[k]) || 0);
				const fr = x ? Math.max(1, x.mainFrames.renderedPerSec || x.mainFrames.perSec) : 1;
				const row = { look, screen, variant: v, boxes, trace: x && { main: x.cost.main, split: x.split, raster: x.cost.raster, gpu: x.cost.gpuMain, viz: x.cost.viz, frames: x.mainFrames, drawn: x.drawn, style: x.style, layoutPerSec: x.layoutPerSec }, paintNames: names, layers: ly, error: e || undefined };
				out.push(row);
				if (x) t.log(`${look} ${screen} ${v.padEnd(12)}: main ${Math.round(x.cost.main)} ms/s | paint ${n('paint')} (${(n('paint') / fr).toFixed(2)} ms/frame) prepaint ${n('prepaint')} layerize ${n('layerize')} commit ${n('commit')} style ${n('style')} layout ${n('layout')} script ${n('script')} | raster ${Math.round(x.cost.raster)} gpu ${Math.round(x.cost.gpuMain)} viz ${Math.round(x.cost.viz)} | frames ${x.mainFrames.perSec}/s (rendered ${x.mainFrames.renderedPerSec}) drawn ${x.drawn.perSec}/s | paint by name: ${names.map(([k, v]) => `${k} ${v}`).join(', ')}`);
				else t.log(`${look} ${screen} ${v}: NOTE trace failed: ${e}`);
				if (ly && !ly.error) t.log(`${look} ${screen} ${v.padEnd(12)}: layers ${ly.drawn} drawn of ${ly.n}; painted again: ${ly.repainted.map((r) => `${r.paintsPerSec}/s ${r.w}x${r.h}@${r.x},${r.y} ${r.node}`).join(' | ') || 'none'}; layerPainted: ${typeof ly.layerPainted === 'string' ? ly.layerPainted : ly.layerPainted.map((p) => `${p.id} ${p.perSec}/s ${p.areaPerPaint} px a paint (max ${p.max})`).join(' | ')}`);
				else t.log(`${look} ${screen} ${v}: NOTE layers: ${ly && ly.error}`);
				if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(out, null, 1));
			}
		}
	}
	await cdp.detach().catch(() => {});
	await t.check('stage paint rows written', out.length > 0, String(out.length));
}
