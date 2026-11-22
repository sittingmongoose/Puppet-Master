// R135-F5: even with the baseline own-glyph plate (c0), the docked Agents pane's non-text .wk-lead/.wk-kind icons
// do not disappear under color:transparent. When a timer row reflows between c0 and b (the sol-max-15 witness:
// Probe Runner's icons shift dy=15 px, boxes [27..38, 932..944]/[27..38, 947..959]/[50..62, 948..960], archived
// under /mnt/Cursor/PuppetMaster-Evidence/tests/sol-max-15/glass-opaque-witness-1-head/witness/, pixel replay SHA-256
// 58b0dd75202e1a33261fafd43f13d5980c5f50a1d41cff9b3770ec218db2439b), a2/c0 paint the icons at the OLD position and
// b/c at the NEW: both footprints stay unmasked and count as read-through (0.38%-1.32% for the witness's six live
// rows, over the 0.20% bar). readThrough must record the pane's layout with the plates, reacquire when it reflowed
// (bounded attempts), and end in a named could-not-judge, never a pass and never a false read-through fail.
// This runs the check's own readThrough (extracted from the source, so the same test reads red on the base
// revision) against a fake pane whose timer tick shifts the rows below between c0 and b, with real PNG plates.
// node tools/glass-backing-reflow-reacquire.selftest.mjs [glass-backing.check.mjs to test instead]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { encodePng, decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const file = process.argv[2] ? resolve(process.argv[2]) : resolve(new URL('../checks/glass-backing.check.mjs', import.meta.url).pathname);
const src = readFileSync(file, 'utf8');
const { backingVerdict } = await import(pathToFileURL(file).href);
// extract a module-level function declaration up to its column-0 closing brace
function extract(name) {
	const start = src.indexOf(name);
	if (start < 0) return null;
	const end = src.indexOf('\n}\n', start);
	assert.ok(end > start, `${name} is unterminated`);
	return src.slice(start, end + 2);
}
const readThroughSrc = extract('async function readThrough(');
assert.ok(readThroughSrc && readThroughSrc.includes('__bcHideSurface'), 'readThrough extraction failed');
const layoutSigSrc = extract('function bcLayoutSig('); // absent on the base revision
const shot = async (t, r) => decodePng(await t.page.screenshot({ clip: r }));
// the base readThrough still calls motionMask for its dead mask variable; give the extracted function the real one
const motionMaskLine = src.split('\n').find((l) => l.startsWith('function motionMask('));
assert.ok(motionMaskLine, 'motionMask extraction failed');
const thresholdLine = src.split('\n').find((l) => l.startsWith('const THRESHOLD'));
const motionMask = new Function('THRESHOLD', motionMaskLine + '\nreturn motionMask;')(new Function(thresholdLine + '\nreturn THRESHOLD;')());
const readThrough = new Function('shot', 'backingVerdict', 'bcLayoutSig', 'motionMask', readThroughSrc + '\nreturn readThrough;')(
	shot, backingVerdict, layoutSigSrc ? new Function(layoutSigSrc + '\nreturn bcLayoutSig;')() : () => 'base-stub', motionMask);

const W = 236, H = 200, SEL = '#sidePanelSlot';
const BG = [20, 20, 24], TEXT = [230, 230, 230], ICON1 = [100, 217, 255], ICON2 = [234, 236, 240];
const REAL = { 'color': 'rgb(230, 230, 230)', '-webkit-text-fill-color': 'rgb(230, 230, 230)', 'text-shadow': 'none', 'caret-color': 'rgb(230, 230, 230)' };
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
// the pane: five rows; a tick wraps the second row's timer and shifts rows 2-4 up 15 px (the witness's dy)
function world(tickShots) {
	let shifted = false, shots = 0, appended = null;
	const inline = new Map();
	const rowY = (i) => 20 + i * 34 + (shifted && i >= 2 ? -15 : 0);
	const children = Array.from({ length: 5 }, (_, i) => ({
		offsetParent: null, // set below; a getter keeps the signature live
		get offsetTop() { return rowY(i); }, offsetLeft: 0, offsetHeight: 30, offsetWidth: W,
	}));
	const e = {
		attrs: new Map(),
		getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; },
		setAttribute(n, v) { this.attrs.set(n, String(v)); },
		removeAttribute(n) { this.attrs.delete(n); if (n === 'style') inline.clear(); },
		style: { setProperty(p, v) { inline.set(p, v); } },
		getBoundingClientRect: () => ({ left: 61, top: 57, right: 61 + W, bottom: 57 + H, width: W, height: H }),
		scrollTop: 0, scrollHeight: 1200, clientWidth: W, clientHeight: H,
		querySelectorAll: () => children,
	};
	children.forEach((c) => { c.offsetParent = e; });
	const st = { id: '', textContent: '', remove() { appended = null; } };
	const doc = {
		querySelector: (s) => (s === SEL ? e : null),
		createElement: () => st,
		getElementById: (id) => (appended && appended.id === id ? appended : null),
		head: { appendChild(node) { appended = node; } },
	};
	// live computed style, as CSSOM: the appended rule and the inline !important pin decide the surface's colour
	const surfaceColour = () => inline.has('color') ? inline.get('color')
		: (appended && appended.textContent.includes(`${SEL}, ${SEL} *`) ? TRANSPARENT : REAL['color']);
	const getComputedStyle = () => ({ visibility: 'visible', getPropertyValue: (p) => (p === 'color' || p === '-webkit-text-fill-color' ? surfaceColour() : REAL[p]) });
	const paint = (data, x, y, w, h, rgb) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { const i = (yy * W + xx) * 4; data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2]; data[i + 3] = 255; } };
	const render = () => {
		const data = new Uint8Array(W * H * 4);
		for (let p = 0; p < W * H; p++) { data[p * 4] = BG[0]; data[p * 4 + 1] = BG[1]; data[p * 4 + 2] = BG[2]; data[p * 4 + 3] = 255; }
		const textVisible = surfaceColour() !== TRANSPARENT;
		for (let i = 0; i < 5; i++) {
			const y = rowY(i);
			paint(data, 8, y + 2, 12, 12, ICON1);   // .wk-lead: non-text, survives color:transparent
			paint(data, 26, y + 2, 12, 12, ICON2);  // .wk-kind: non-text
			if (textVisible) paint(data, 44, y + 6, 160, 8, TEXT);
		}
		return data;
	};
	const logs = [];
	const t = {
		log: (m) => logs.push(m),
		page: { screenshot: async ({ clip }) => {
			shots++;
			if (tickShots.includes(shots)) shifted = !shifted; // the timer tick lands before this shot
			const full = render();
			const lx = clip.x - 61, ly = clip.y - 57, out = new Uint8Array(clip.width * clip.height * 4);
			for (let y = 0; y < clip.height; y++) for (let x = 0; x < clip.width; x++) {
				const s = ((y + ly) * W + (x + lx)) * 4, d = (y * clip.width + x) * 4;
				out[d] = full[s]; out[d + 1] = full[s + 1]; out[d + 2] = full[s + 2]; out[d + 3] = full[s + 3];
			}
			return encodePng({ width: clip.width, height: clip.height, data: out });
		} },
	};
	const f = {
		waitForTimeout: async () => {},
		evaluate: async (fn, arg) => {
			const saved = { document: globalThis.document, getComputedStyle: globalThis.getComputedStyle, innerWidth: globalThis.innerWidth, innerHeight: globalThis.innerHeight };
			Object.assign(globalThis, { document: doc, getComputedStyle, innerWidth: 1920, innerHeight: 1080 });
			try { return fn(arg); } finally { Object.assign(globalThis, saved); }
		},
	};
	return { t, f, logs, shots: () => shots };
}

// a tick between c0 and b of the FIRST acquisition only: the pane reflowed, the plates must be reacquired and the
// second acquisition (quiet) must judge clean — never the false read-through fail the base reads on the icons
{
	const w = world([4]); // shot order per acquisition: a1, a2, c0, b, c
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed, `the reflowed first acquisition must be reacquired, not judged (base share ${m && m.share})`);
	assert.ok(m.share <= 0.002, `the quiet reacquisition judges clean, got ${(m.share * 100).toFixed(3)}%`);
	assert.equal(w.shots(), 10, 'two acquisitions of five plates');
	assert.ok(w.logs.some((l) => /reflowed/.test(l) && /reacquir/.test(l)), 'the reacquisition is logged');
}
// a tick before EVERY b: no quiet window exists; the bounded attempts end in a named could-not-judge, never a pass
{
	const w = world([4, 9, 14]);
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && m.reflowed === true, 'persistent own-pane reflow must end could-not-judge, not a verdict');
	assert.equal(m.attempts, 3, 'the reacquisition is bounded');
	assert.equal(w.shots(), 15, 'three acquisitions of five plates');
	assert.equal(w.logs.filter((l) => /reacquir/.test(l)).length, 2);
}
// a quiet pane keeps its single acquisition and its pass
{
	const w = world([]);
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed && m.share === 0, 'a quiet pane judges clean on the first acquisition');
	assert.equal(w.shots(), 5);
}
console.log('PASS own-pane reflow between c0 and b is detected from the layout signatures: a single tick is reacquired into a clean verdict, persistent reflow ends in a bounded named could-not-judge (never a pass), and a quiet pane keeps its first-acquisition pass');
