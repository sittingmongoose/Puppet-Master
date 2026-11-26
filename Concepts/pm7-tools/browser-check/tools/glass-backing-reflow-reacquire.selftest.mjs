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
const bcLayoutSig = layoutSigSrc ? new Function(layoutSigSrc + '\nreturn bcLayoutSig;')() : () => 'base-stub';
const readThrough = new Function('shot', 'backingVerdict', 'bcLayoutSig', 'motionMask', readThroughSrc + '\nreturn readThrough;')(
	shot, backingVerdict, bcLayoutSig, motionMask);

const W = 236, H = 200, SEL = '#sidePanelSlot';
const BG = [20, 20, 24], TEXT = [230, 230, 230], ICON1 = [100, 217, 255], ICON2 = [234, 236, 240];
const REAL = { 'color': 'rgb(230, 230, 230)', '-webkit-text-fill-color': 'rgb(230, 230, 230)', 'text-shadow': 'none', 'caret-color': 'rgb(230, 230, 230)' };
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
// the pane: five visible rows plus three scrolled below the clip; every row carries a non-text icon and a
// shrink-wrapped <i data-work-time> timer leaf whose width ticks without moving the row (the real pane's 22
// live timers, R136-N2). A wrap tick shifts rows 2-4 up 15 px (the witness's dy).
function world(tickShots, { afterShots = [], widthShots = [], offscreenOnly = false, pulseShots = [], onShot = null } = {}) {
	let shifted = false, wide = false, shots = 0, appended = null;
	const inline = new Map();
	const rowY = (i) => 20 + i * 34 + (shifted && i >= 2 ? -15 : 0);
	const timerW = (i) => (wide && (!offscreenOnly || i >= 5) ? 47 : 40);
	const rows = [], icons = [], timers = [];
	for (let i = 0; i < 8; i++) {
		const row = {
			offsetParent: null, parentElement: null, children: [], // set below; getters keep the signature live
			get offsetTop() { return rowY(i); }, offsetLeft: 0, offsetHeight: 30, offsetWidth: W,
			getBoundingClientRect: () => ({ top: 57 + rowY(i), left: 61, bottom: 57 + rowY(i) + 30, right: 61 + W, width: W, height: 30 }),
		};
		const icon = { // the .wk-lead svg: non-text, survives color:transparent
			offsetParent: row, parentElement: row, children: [],
			offsetTop: 2, offsetLeft: 8, offsetHeight: 12, offsetWidth: 12,
			getBoundingClientRect: () => ({ top: 57 + rowY(i) + 2, left: 69, bottom: 57 + rowY(i) + 14, right: 81, width: 12, height: 12 }),
		};
		const timer = { // the <i data-work-time> text leaf: width ticks, the row does not move
			offsetParent: row, parentElement: row, children: [],
			offsetTop: 6, offsetLeft: 200, offsetHeight: 10,
			get offsetWidth() { return timerW(i); },
			getBoundingClientRect: () => ({ top: 57 + rowY(i) + 6, left: 261, bottom: 57 + rowY(i) + 16, right: 261 + timerW(i), width: timerW(i), height: 10 }),
		};
		row.children = [icon, timer];
		rows.push(row); icons.push(icon); timers.push(timer);
	}
	const e = {
		attrs: new Map(),
		getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; },
		setAttribute(n, v) { this.attrs.set(n, String(v)); },
		removeAttribute(n) { this.attrs.delete(n); if (n === 'style') inline.clear(); },
		style: { setProperty(p, v) { inline.set(p, v); } },
		getBoundingClientRect: () => ({ left: 61, top: 57, right: 61 + W, bottom: 57 + H, width: W, height: H }),
		scrollTop: 0, scrollHeight: 1200, clientWidth: W, clientHeight: H,
		querySelectorAll: (sel) => (sel === '*' ? rows.flatMap((r, i) => [r, icons[i], timers[i]]) : sel.includes('svg') ? icons : []),
	};
	rows.forEach((r) => { r.offsetParent = e; r.parentElement = e; });
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
			if (tickShots.includes(shots)) shifted = !shifted; // the wrap tick lands before this shot
			if (pulseShots.includes(shots)) shifted = !shifted; // A -> B before the stalled framebuffer read
			if (widthShots.includes(shots)) wide = !wide; // a width-only timer tick lands before this shot
			const full = render();
			if (pulseShots.includes(shots)) shifted = !shifted; // B -> A before the screenshot promise resolves
			const lx = clip.x - 61, ly = clip.y - 57, out = new Uint8Array(clip.width * clip.height * 4);
			for (let y = 0; y < clip.height; y++) for (let x = 0; x < clip.width; x++) {
				const s = ((y + ly) * W + (x + lx)) * 4, d = (y * clip.width + x) * 4;
				out[d] = full[s]; out[d + 1] = full[s + 1]; out[d + 2] = full[s + 2]; out[d + 3] = full[s + 3];
			}
			const png = encodePng({ width: clip.width, height: clip.height, data: out });
			if (afterShots.includes(shots)) shifted = !shifted; // the tick lands DURING this shot: framebuffer pre-wrap, signature post-wrap
			onShot?.(shots);
			return png;
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
// R136-N2 RED: a timer-label width change that moves no visible row is not reflow. The base signature hashed
// every descendant's offsetWidth (the real pane's 22 live <i data-work-time> flex items), so a width-only tick
// flipped sigA !== sigB on every acquisition and exhausted all 3 into could-not-judge on a quiet host.
{
	const w = world([], { widthShots: [4, 9, 14] });
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed, `a width-only timer tick must not reacquire (base reflowed: ${m && m.reflowed})`);
	assert.equal(m.share, 0);
	assert.equal(w.shots(), 5, 'one quiet acquisition');
}
// R136-N2 RED: rows scrolled outside the visible clip paint nothing; even their width ticks must not count.
{
	const w = world([], { widthShots: [4, 9, 14], offscreenOnly: true });
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed, 'off-screen rows are outside the signature');
	assert.equal(m.share, 0);
	assert.equal(w.shots(), 5);
}
// R136-N3 RED: a wrap tick landing DURING shot(a2) (framebuffer pre-wrap, signature post-wrap) must be caught:
// the signature brackets every plate, before a1 and after c. The base read sigA after a2 and sigB before c,
// so sigA === sigB passed the mixed sequence through un-reacquired.
{
	const w = world([], { afterShots: [2] });
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed && m.share <= 0.002, 'the reacquired quiet sequence judges clean');
	assert.equal(w.shots(), 10, 'the tick during a2 is caught and the sequence reacquired');
	assert.ok(w.logs.some((l) => /reflowed/.test(l) && /reacquir/.test(l)), 'the reacquisition is logged');
}
// R136-N3 RED: a tick during shot(c) is caught too (the base left c unguarded).
{
	const w = world([], { afterShots: [5] });
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed && m.share <= 0.002);
	assert.equal(w.shots(), 10, 'the tick during c is caught and the sequence reacquired');
}
// R137-F1 RED: the real pane's 1-second reversible wrap pulse ("MM minutes 0 seconds" [2 lines, state A] ->
// "1 second" [1 line, state B, -15 px] -> "2 seconds" [2 lines, state A again], the sol-max-15 rows). One
// acquisition spans 1.5-2 s > the 1 s timer period, so Tick 1 (A->B) can land between sigStart and shot(a1)
// and Tick 2 (B->A) 1000 ms later between c0 and b: the six samples read A, B, B, B, A, A. The endpoint-only
// guard sigStart === sigEnd judges the mixed sequence and falsely fails on the shifted icons (the direct
// repro read 5.813% with zero reacquisitions). Every plate must be bracketed: judge only when EVERY sample
// equals the first, else reacquire into the quiet second acquisition.
{
	const w = world([1, 4]); // Tick 1 before a1, Tick 2 before b: samples A, B, B, B, A, A
	const m = await readThrough(w.t, w.f, SEL);
	assert.ok(m && !m.reflowed && m.share <= 0.002, `the A->B->A pulse must reacquire, not judge (base share ${m && (m.share * 100).toFixed(3)}%)`);
	assert.equal(w.shots(), 10, 'the mid-sequence pulse is caught and the quiet reacquisition judges');
	assert.ok(w.logs.some((l) => /reflowed/.test(l) && /reacquir/.test(l)), 'the reacquisition is logged');
}
// R137-H2 RED: SVG leaves have no offset boxes, and CSS-only painted leaves outside NON_TEXT were omitted.
// Moving either inside an unchanged row must change the signature.
{
	const saved = { document: globalThis.document, innerWidth: globalThis.innerWidth, innerHeight: globalThis.innerHeight };
	let svgX = 10, badgeX = 40;
	const e = {
		scrollTop: 0, scrollHeight: 500, clientWidth: 236, clientHeight: 200,
		getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 200, right: 236 }),
	};
	const svg = {
		namespaceURI: 'http://www.w3.org/2000/svg', offsetParent: null, parentElement: e,
		getBoundingClientRect: () => ({ top: 20, left: svgX, bottom: 32, right: svgX + 12, width: 12, height: 12 }),
	};
	const badge = {
		offsetParent: e, parentElement: e, offsetTop: 20, get offsetLeft() { return badgeX; }, offsetHeight: 8,
		getBoundingClientRect: () => ({ top: 20, left: badgeX, bottom: 28, right: badgeX + 8 }),
	};
	e.querySelectorAll = (sel) => sel === '*' ? [svg, badge] : sel.includes('svg') ? [svg, badge] : sel.includes('span') ? [badge] : [];
	Object.assign(globalThis, { document: { querySelector: (s) => s === SEL ? e : null }, innerWidth: 1920, innerHeight: 1080 });
	try {
		const svgBefore = bcLayoutSig(SEL); svgX += 12;
		assert.notEqual(bcLayoutSig(SEL), svgBefore, 'a direct-child SVG movement must change the signature');
		const badgeBefore = bcLayoutSig(SEL); badgeX += 9;
		assert.notEqual(bcLayoutSig(SEL), badgeBefore, 'a CSS-only painted leaf movement must change the signature');
	} finally { Object.assign(globalThis, saved); }
}

// R138-H1 RED: a >650 ms clip capture can contain both ticks of a 1 s A -> B -> A pulse while every layout
// signature still reads A. The capture duration itself must force a fresh acquisition.
{
	let clock = 0;
	const w = world([], { pulseShots: [1], onShot: (n) => { if (n === 1) clock += 700; } });
	const m = await readThrough(w.t, w.f, SEL, { now: () => clock });
	assert.ok(m && !m.reflowed && m.share <= 0.002, `a stalled pulse capture must be reacquired, not judged (share ${m && (m.share * 100).toFixed(3)}%)`);
	assert.equal(w.shots(), 10, 'the stalled first acquisition is replaced by a quiet second acquisition');
}
console.log('PASS own-pane reflow is detected from the layout signatures bracketing every plate: a single tick is reacquired into a clean verdict, persistent reflow ends in a bounded named could-not-judge (never a pass), a quiet pane keeps its first-acquisition pass, width-only timer ticks (visible or off-screen) are not reflow, ticks during a2 or c are caught, a 1-second A->B->A wrap pulse inside one acquisition is caught mid-sequence, direct SVG plus CSS-only painted-leaf movement changes the signature, and a >650 ms capture that spans a full pulse is reacquired');
