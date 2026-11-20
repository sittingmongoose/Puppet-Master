// R124 F4-2: the check's ARMED observer seeds the stage's root and NieR's kept bracket parts (gHud.__b) so a target
// change's re-inserted parts are not created nodes. It seeded the parts only, not their children: a label detached at
// arm time (a fly-in, or a target whose geometry hides it) comes back through show(8, true) with the text node it
// already had, and that old text counted as created (a false FAIL on 1 node). This runs the check's ARM against a stub
// stage and a constructed childList record; the base ARM counts the label's old text, this one does not.
// node tools/onb-rest-arm.selftest.mjs [perf-onb-rest.check.mjs with ARM exported]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createdAdded } from '../helpers/onb-rest-created.mjs';
const check = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-onb-rest.check.mjs');
const { ARM } = check;
assert.equal(typeof ARM, 'function', 'the check exports ARM (the stage observer) for this self-test');

// a minimal element tree: firstChild/nextSibling/parentElement, className for closest(), textContent for the words
const el = (tag, cls = '') => {
	const n = { nodeType: 1, tagName: tag.toUpperCase(), className: cls, firstChild: null, nextSibling: null, parentElement: null, textContent: '' };
	n.contains = (m) => { for (let p = m; p; p = p.parentElement) if (p === n) return true; return false; };
	n.closest = (sel) => { const want = sel.replace(/^\./, ''); for (let p = n; p; p = p.parentElement) if (p.nodeType === 1 && String(p.className || '').split(/\s+/).includes(want)) return p; return null; };
	n.querySelector = (sel) => {
		const want = sel.replace(/^\./, '');
		let hit = null;
		const walk = (x) => { if (hit || x.nodeType !== 1) return; if (String(x.className || '').split(/\s+/).includes(want)) { hit = x; return; } for (let c = x.firstChild; c && !hit; c = c.nextSibling) walk(c); };
		for (let c = n.firstChild; c && !hit; c = c.nextSibling) walk(c);
		return hit;
	};
	return n;
};
const txt = (s) => ({ nodeType: 3, textContent: s, parentElement: null, firstChild: null, nextSibling: null });
const append = (p, ...kids) => {
	for (const k of kids) {
		k.parentElement = p;
		let last = p.firstChild;
		if (!last) { p.firstChild = k; continue; }
		while (last.nextSibling) last = last.nextSibling;
		last.nextSibling = k;
	}
};
const detach = (p, k) => {
	let prev = null;
	for (let c = p.firstChild; c; prev = c, c = c.nextSibling) if (c === k) { if (prev) prev.nextSibling = c.nextSibling; else p.firstChild = c.nextSibling; break; }
	k.parentElement = null; k.nextSibling = null;
};

// the stub stage: the HUD target word, and the nine kept bracket parts with the label (__b[8]) detached at arm time
const root = el('div', 'pst-stage');
const hudEl = el('div', 'pst-hud');
const word = el('div', 'pst-target'), wordText = txt('WHERE');
append(word, wordText); append(hudEl, word);
const gHud = el('g', 'pst-hud');
const parts = ['path', 'path', 'path', 'path', 'path', 'rect', 'path', 'rect', 'text'].map((t) => el(t));
append(gHud, ...parts.slice(0, 8));
const label = parts[8], labelText = txt('WHERE');
append(label, labelText);             // the label was drawn once and then taken out; the fly-in can leave it detached
append(root, hudEl, gHud);
const st = { root, gHud: { __b: parts }, hudEl, render() { return 1; } };
const host = { __pipStage: st };

globalThis.window = {};
globalThis.document = { querySelector: (sel) => (sel === '#pm-o55-onboarding .o55-stage' ? host : null) };
globalThis.MutationObserver = function () { this.observe = () => {}; this.disconnect = () => {}; this.takeRecords = () => []; };
assert.equal(ARM(), '', 'ARM accepts the stage');

// show(8, true) re-inserts the label with the text node it already had; the record removes nothing
const reinsert = { type: 'childList', target: gHud, removedNodes: [], addedNodes: [label] };
globalThis.window.__onbr.take([reinsert]);
const rec = globalThis.window.__onbr.childRecords.at(-1);
const created = createdAdded(rec);
assert.equal(rec.added.length, 2, 'the record adds the label and its old text, as the walk counts them');
assert.deepEqual(rec.added.map((a) => a.text), [false, true], 'the label element and its text');
assert.equal(created.length, 0, `the label's old text was in the stage at arm time and is not created (${JSON.stringify(created)})`);

// a node made after arm still counts: the seeding is of the subtree that existed, not of everything under gHud
const made = el('path');
const added = { type: 'childList', target: gHud, removedNodes: [], addedNodes: [made] };
globalThis.window.__onbr.take([added]);
assert.equal(createdAdded(globalThis.window.__onbr.childRecords.at(-1)).length, 1, 'a new part made after arm counts');

// and the word comparison still decides a label reset: the same words count, changed words do not
const oldText = label.firstChild, newSame = txt('WHERE'), newWords = txt('STANDBY');
append(label, newSame); detach(label, oldText);
const same = { type: 'childList', target: label, removedNodes: [oldText], addedNodes: [newSame] };
globalThis.window.__onbr.take([same]);
assert.equal(createdAdded(globalThis.window.__onbr.childRecords.at(-1)).length, 1, 'the label re-created with the same words counts');
append(label, newWords); detach(label, newSame);
const words = { type: 'childList', target: label, removedNodes: [newSame], addedNodes: [newWords] };
globalThis.window.__onbr.take([words]);
assert.equal(createdAdded(globalThis.window.__onbr.childRecords.at(-1)).length, 0, 'a real word change is excused');

console.log('PASS ARM seeds each kept bracket part\'s subtree: a label re-inserted with its old text creates no node, a new part still counts, and the word comparison still decides a label reset');
