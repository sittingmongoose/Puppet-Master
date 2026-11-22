// R135-F3: getComputedStyle(e) is a LIVE CSSStyleDeclaration. The installer captured it before the c0 plate, but
// __bcOutsideOnly() read its property strings while the `${s}, ${s} *` transparent rule was still active, so shot b
// pinned color/-webkit-text-fill-color rgba(0, 0, 0, 0) !important on the surface: every Glass surface's text was
// transparent in b exactly as in c, and --set selftest=rerender passed vacuously. The pinned strings must be the
// surface's REAL colours, captured before the transparent rule is appended. This runs the check's own page-side
// installer (extracted from the source, so the same test reads red on the base revision) against a fake document
// whose getComputedStyle answers live, exactly as CSSOM does.
// node tools/glass-backing-live-style.selftest.mjs [glass-backing.check.mjs to test instead]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = process.argv[2] ? resolve(process.argv[2]) : resolve(new URL('../checks/glass-backing.check.mjs', import.meta.url).pathname);
const src = readFileSync(file, 'utf8');
// the installer is the f.evaluate((s) => { ... }, sel) call that creates the bc-through style element
const marker = src.indexOf("st.id = 'bc-through'");
assert.ok(marker >= 0, 'the bc-through style installer is missing from the check');
const call = src.lastIndexOf('f.evaluate((s) => {', marker);
assert.ok(call >= 0, 'the installer evaluate call is missing');
const open = src.indexOf('{', call + 'f.evaluate('.length);
const close = src.indexOf('\n\t}, sel);', marker);
assert.ok(close > open, 'the installer evaluate terminator is missing');
const body = src.slice(open + 1, close + 2);
const install = new Function('s', 'document', 'getComputedStyle', body);

const SEL = '#sidePanelSlot';
const REAL = { 'color': 'rgb(230, 230, 230)', '-webkit-text-fill-color': 'rgb(230, 230, 230)', 'text-shadow': 'none', 'caret-color': 'rgb(230, 230, 230)' };
const TRANSPARENT = { 'color': 'rgba(0, 0, 0, 0)', '-webkit-text-fill-color': 'rgba(0, 0, 0, 0)', 'text-shadow': 'none', 'caret-color': 'rgba(0, 0, 0, 0)' };
// a fake document whose computed style is live: the appended rule and inline !important declarations decide it
function fakeDom() {
	const inline = new Map();
	let appended = null;
	const e = {
		attrs: new Map(),
		getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; },
		setAttribute(n, v) { this.attrs.set(n, String(v)); },
		removeAttribute(n) { this.attrs.delete(n); if (n === 'style') inline.clear(); },
		style: { setProperty(p, v) { inline.set(p, v); } },
	};
	const st = { id: '', textContent: '', remove() { appended = null; } };
	const doc = {
		querySelector: (s) => (s === SEL ? e : null),
		createElement: () => st,
		getElementById: (id) => (appended && appended.id === id ? appended : null),
		head: { appendChild(node) { appended = node; } },
	};
	const getComputedStyle = () => ({
		getPropertyValue(p) {
			if (inline.has(p)) return inline.get(p);
			if (appended && appended.textContent.includes(`${SEL}, ${SEL} *`)) return TRANSPARENT[p];
			return REAL[p];
		},
	});
	return { doc, getComputedStyle, inline, st };
}

const { doc, getComputedStyle, inline, st } = fakeDom();
install(SEL, doc, getComputedStyle);
assert.equal(doc.getElementById('bc-through'), st, 'the installer appends the bc-through style element');
assert.ok(st.textContent.includes(`${SEL}, ${SEL} *`), 'the first plate makes only the surface text transparent');
// shot b's switch: pin the surface, then make only the OUTSIDE text transparent
st.__bcOutsideOnly();
assert.equal(inline.get('color'), REAL['color'],
	`shot b must pin the surface's real colour; the base read the live computed style under the transparent rule and pinned ${inline.get('color')}`);
assert.equal(inline.get('-webkit-text-fill-color'), REAL['-webkit-text-fill-color'],
	'shot b must pin the real -webkit-text-fill-color: it is inherited and overrides color for all text painting');
assert.ok(st.textContent.startsWith('body *:not(:is('), 'the outside-only rule replaces the surface rule');
assert.equal(getComputedStyle().getPropertyValue('color'), REAL['color'], 'the pinned surface keeps its colour while the outside is transparent');
// shot c: the surface's text goes transparent too, and the inline pin is restored away
st.__bcHideSurface();
assert.ok(st.textContent.includes(`${SEL}, ${SEL} *`) && st.textContent.includes('body *:not(:is('), 'shot c keeps both rules');
assert.equal(inline.size, 0, 'the inline pin is restored before the surface rule returns');
assert.equal(getComputedStyle().getPropertyValue('color'), TRANSPARENT['color'], 'the surface text is transparent again for shot c');
console.log('PASS shot b pins the surface\'s real colour and fill (captured before the transparent rule), the outside-only and surface rules switch cleanly, and the pin restores');
