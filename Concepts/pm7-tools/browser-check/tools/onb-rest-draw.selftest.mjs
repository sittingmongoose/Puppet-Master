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
const watch = async (st, frames) => {
	host.__pipStage = st;
	const p = DRAW_WATCH(frames);
	for (let i = 0; i <= Math.max(...frames) + 1; i++) { const q = rafQ; rafQ = []; q.forEach((fn) => fn()); }
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
console.log('PASS the draw oracle: a healthy cache draws the same cached and fresh; a stale protractor or bracket cache is reported with both draws; NieR\'s kept box is judged against a fresh boxInScene with nierKey left alone');
