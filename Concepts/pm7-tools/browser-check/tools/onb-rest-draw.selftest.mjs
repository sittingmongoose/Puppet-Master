// The cached-draw-vs-fresh-draw oracle (helpers/onb-rest-draw.mjs) on a stub stage whose render draws from its caches
// when they are there and computes fresh when they are not (TOOLS-STAGEREST-K2). A healthy cache draws the same either
// way; a stale one (the value it kept is not the live value) must be reported, and NieR's kept box judged against a
// fresh boxInScene without dropping nierKey (dropping it would heal the box).
// node tools/onb-rest-draw.selftest.mjs [onb-rest-draw.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { DRAW_WATCH } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/onb-rest-draw.mjs');

// a minimal element tree: attributes as a sortable list, firstChild/nextSibling, textContent that clears the children
const el = (tag) => {
	const n = { nodeType: 1, tagName: tag.toUpperCase(), attributes: [], firstChild: null, nextSibling: null, parentElement: null };
	Object.defineProperty(n, 'textContent', { get() { let s = ''; for (let c = n.firstChild; c; c = c.nextSibling) s += c.nodeType === 3 ? c.data : c.textContent; return s; }, set(v) { n.firstChild = null; if (v) append(n, txt(String(v))); } });
	return n;
};
const txt = (s) => ({ nodeType: 3, data: s, firstChild: null, nextSibling: null, parentElement: null, textContent: s });
const append = (p, k) => { k.parentElement = p; let last = p.firstChild; if (!last) { p.firstChild = k; return; } while (last.nextSibling) last = last.nextSibling; last.nextSibling = k; };
const attr = (e, k, v) => { const a = e.attributes.find((x) => x.name === k); if (a) a.value = String(v); else e.attributes.push({ name: k, value: String(v) }); };

// the stub stage: Basic's protractor cache (gShadow.__pt) and NieR's bracket cache (gHud.__b). render writes the cached
// value when the cache is there; a fresh render (cache dropped) computes from st.live. nierBox is kept; boxInScene is fresh.
const stage = (fam) => {
	const gShadow = el('g'), gHud = el('g'), hudEl = el('div'), bubble = el('div');
	const st = {
		famName: fam, layoutName: 'wide', ps: {}, gShadow, gHud, hudEl, bubble,
		live: 'M0 0L1 1', nierBox: [0, 0, 10, 10], nierKey: ['map', 'cls', 'said', 'loaded'],
		boxInScene: () => [0, 0, 10, 10],
		render() {
			if (!gShadow.__pt) { gShadow.textContent = ''; const arc = el('path'); append(gShadow, arc); gShadow.__pt = { arc, d: this.live }; }
			attr(gShadow.__pt.arc, 'd', gShadow.__pt.d);
			if (!gHud.__b) { gHud.textContent = ''; const p = el('path'); append(gHud, p); gHud.__b = [p]; gHud.__bd = this.live; }
			attr(gHud.__b[0], 'd', gHud.__bd);
		}
	};
	return st;
};
const host = { __pipStage: null };
globalThis.document = { querySelector: (sel) => (sel === '#pm-o55-onboarding .o55-stage' ? host : null) };
let rafQ = [];
globalThis.requestAnimationFrame = (fn) => { rafQ.push(fn); return rafQ.length; };
const watch = async (st, arg) => {
	host.__pipStage = st;
	const fs = Array.isArray(arg) ? arg : arg.frames;
	const p = DRAW_WATCH(arg);
	for (let i = 0; i <= Math.max(...fs) + 1; i++) { const q = rafQ; rafQ = []; q.forEach((fn) => fn()); }
	return p;
};

// a healthy cache: the kept value is the live value; the flush rebuilds it the same
{
	const st = stage('basic'); st.render();
	const r = await watch(st, [0, 1, 2]);
	assert.equal(r.nbad, 0, `a healthy cache draws the same cached and fresh: ${JSON.stringify(r.bad)}`);
	assert.equal(r.checks, 3, 'every asked frame judged');
	assert.ok(st.gShadow.__pt, 'the flush rebuilt the cache (the stage draws on it again next frame)');
}
// a stale protractor cache: the kept value is not the live value (a resize the key missed)
{
	const st = stage('basic'); st.render(); st.gShadow.__pt.d = 'M0 0L9 9';
	const r = await watch(st, [0, 1, 2]);
	assert.ok(r.nbad > 0, 'a stale protractor cache is reported');
	assert.ok(r.bad.some((b) => /shadows/.test(b) && /M0 0L9 9/.test(b) && /M0 0L1 1/.test(b)), `the difference names the cached and fresh draws: ${JSON.stringify(r.bad)}`);
}
// a stale bracket cache
{
	const st = stage('nier'); st.render(); st.gHud.__bd = 'M0 0L9 9';
	const r = await watch(st, [0]);
	assert.ok(r.bad.some((b) => /hud/.test(b)), `a stale bracket cache is reported: ${JSON.stringify(r.bad)}`);
	assert.equal(r.boxes, 1, 'the NieR box judged');
}
// NieR's kept box stale against a fresh boxInScene, with nierKey left alone (dropping it would heal the box)
{
	const st = stage('nier'); st.render(); st.nierBox = [0, 0, 10, 5]; st.boxInScene = () => [0, 0, 10, 10];
	const key = st.nierKey;
	const r = await watch(st, [0, 1]);
	assert.ok(r.bad.some((b) => /nierBox kept 0,0,10,5 vs fresh 0,0,10,10/.test(b)), `the kept box judged against a fresh one: ${JSON.stringify(r.bad)}`);
	assert.equal(st.nierKey, key, 'nierKey is not dropped: the kept box stays stale for the judge to see');
	assert.equal(r.boxes, 2, 'every asked frame judged the box');
}
// a healthy NieR: kept box equals fresh, caches healthy
{
	const st = stage('nier'); st.render();
	const r = await watch(st, [0, 1, 2]);
	assert.equal(r.nbad, 0, `a healthy NieR draws the same cached and fresh: ${JSON.stringify(r.bad)}`);
}
// live Reduced Motion mismatch (FO-S3): browser/app report reduced, stage and data-reduced still report false/0
{
	const st = stage('nier'); st.reduced = false; st.root = { dataset: { reduced: '0' } }; st.still = () => st.reduced; st.render();
	let mq = true, dm = null;
	globalThis.window = { O55: { motion: { reduced: () => mq || dm === 'reduced' } }, matchMedia: () => ({ matches: mq }) };
	globalThis.document.documentElement = { getAttribute: (k) => (k === 'data-motion' ? dm : null) };
	const rBad = await watch(st, { frames: [0, 1], reduced: true, media: true });
	assert.ok(rBad.nbad > 0, 'stale stage.reduced/data-reduced under live Reduced Motion must fail');
	assert.ok(rBad.bad.some((b) => /stage\.reduced false vs expected true/.test(b)), `reports stage.reduced mismatch: ${JSON.stringify(rBad.bad)}`);
	assert.ok(rBad.bad.some((b) => /data-reduced 0 vs expected 1/.test(b)), `reports data-reduced mismatch: ${JSON.stringify(rBad.bad)}`);
	// once stage follows Reduced Motion, the same watch passes
	st.reduced = true; st.root.dataset.reduced = '1';
	const rGood = await watch(st, { frames: [0, 1], reduced: true, media: true });
	assert.equal(rGood.nbad, 0, `matching stage.reduced/data-reduced passes: ${JSON.stringify(rGood.bad)}`);
	// app data-motion toggle mismatch also fails, and passes once stage follows
	mq = false; dm = 'reduced'; st.reduced = false; st.root.dataset.reduced = '0';
	const rAttrBad = await watch(st, { frames: [0], reduced: true, attr: true });
	assert.ok(rAttrBad.nbad > 0, 'stale stage.reduced under data-motion="reduced" must fail');
	st.reduced = true; st.root.dataset.reduced = '1';
	const rAttrGood = await watch(st, { frames: [0], reduced: true, attr: true });
	assert.equal(rAttrGood.nbad, 0, `matching data-motion="reduced" passes: ${JSON.stringify(rAttrGood.bad)}`);
	delete globalThis.window; delete globalThis.document.documentElement;
}
// NM18-L1: a stale .pst-ncoord element reference (hudEl.__co kept a detached node after a HUD rebuild) is observed:
// the cached draw writes the coordinate to the detached node, the live label keeps its old text, and the fresh draw
// (cache dropped, coT opened) re-queries the live node and writes the current coordinate. The throttle is opened on
// both draws, so this is the element-reference cache failing, not the 4 Hz throttle.
{
	const gShadow = el('g'), gHud = el('g'), bubble = el('div'), hudEl = el('div');
	const live = el('span'); attr(live, 'class', 'pst-ncoord'); append(live, txt('X 000 Y 000')); append(hudEl, live);
	hudEl.querySelector = (sel) => (sel === '.pst-ncoord' ? live : null);
	const st = {
		famName: 'nier', layoutName: 'wide', ps: {}, gShadow, gHud, hudEl, bubble, t: 40, coT: 0, coord: 'X 000 Y 000',
		live: 'M0 0L1 1', nierBox: [0, 0, 10, 10], nierKey: ['k'], boxInScene: () => [0, 0, 10, 10],
		render() {
			if (!gShadow.__pt) { gShadow.textContent = ''; const a = el('path'); append(gShadow, a); gShadow.__pt = { arc: a, d: this.live }; }
			attr(gShadow.__pt.arc, 'd', gShadow.__pt.d);
			if (!gHud.__b) { gHud.textContent = ''; const p = el('path'); append(gHud, p); gHud.__b = [p]; gHud.__bd = this.live; }
			attr(gHud.__b[0], 'd', gHud.__bd);
			const co = hudEl.__co !== undefined ? hudEl.__co : (hudEl.__co = hudEl.querySelector('.pst-ncoord'));
			if (co && this.t - (this.coT || 0) > .25) { this.coT = this.t; co.textContent = this.coord; }
		}
	};
	st.render(); // healthy: __co caches the live label
	// a HUD rebuild swaps the live label, but __co still points at the old, detached node (stale text)
	const detached = live, fresh = el('span'); attr(fresh, 'class', 'pst-ncoord'); append(fresh, txt('X 000 Y 000'));
	hudEl.querySelector = (sel) => (sel === '.pst-ncoord' ? fresh : null);
	detached.textContent = 'X 999 Y 999'; st.coord = 'X 001 Y 002';
	const r = await watch(st, [0]);
	assert.ok(r.bad.some((b) => /ncoord/.test(b) && /X 000 Y 000/.test(b) && /X 001 Y 002/.test(b)), `a stale .pst-ncoord reference is reported with both draws: ${JSON.stringify(r.bad)}`);
	// once __co is re-queried to the live label, the same watch passes
	hudEl.__co = fresh; st.coord = 'X 001 Y 002'; fresh.textContent = 'X 001 Y 002';
	const rGood = await watch(st, [0]);
	assert.equal(rGood.nbad, 0, `a healthy .pst-ncoord draws the same cached and fresh: ${JSON.stringify(rGood.bad)}`);
}
// FO18-K2: anchor counts frames from the input mark (window.__k2Mark), not from the call. Before the mark the
// oracle draws nothing (frame 0 cannot precede the input); after the mark the next frame is frame 0.
{
	const st = stage('basic'); st.render();
	let renders = 0; const orig = st.render.bind(st); st.render = () => { renders++; orig(); };
	globalThis.window = { __k2Mark: null };
	host.__pipStage = st;
	const p = DRAW_WATCH({ frames: [0, 1], anchor: true });
	for (let i = 0; i < 5; i++) { const q = rafQ; rafQ = []; q.forEach((fn) => fn()); }
	assert.equal(renders, 0, 'anchored: no draw before the input mark (a settlement wait cannot move frame 0 past the input)');
	window.__k2Mark = 1; // the input event
	for (let i = 0; i <= 3; i++) { const q = rafQ; rafQ = []; q.forEach((fn) => fn()); }
	const r = await p;
	assert.equal(r.checks, 2, `both asked frames sampled after the mark: ${JSON.stringify(r)}`);
	assert.equal(r.nbad, 0, `a healthy cache anchored draws the same: ${JSON.stringify(r.bad)}`);
	assert.equal(window.__k2Mark, null, 'the input mark consumed');
	delete globalThis.window;
}
console.log('PASS the draw oracle: a healthy cache draws the same cached and fresh; a stale protractor or bracket cache is reported with both draws; NieR\'s kept box is judged against a fresh boxInScene with nierKey left alone; live Reduced Motion stage/app/browser mismatches fail');
