// R133-FOLLOWUPS 1: helpers/press.mjs had no consumer and no self-test; the NieR Jujutsu engine switch in
// checks/shelf-route.check.mjs was pressed through Playwright's stability wait. This is the helper's contract on
// stubs: a fresh center hit-test decides the press point, a covered/disabled/hidden target receives NO press and
// returns its witness, and the point is carried through the frame chain with a cover refused in the host page too.
// node tools/press-helper.selftest.mjs
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { press } from '../helpers/press.mjs';

const el = (o = {}) => {
	const e = {
		localName: o.tag || 'button', id: o.id || 'sw',
		matches: (s) => s === ':disabled' && !!o.disabled,
		closest: (s) => (s === '[aria-disabled="true"]' && o.ariaDisabled ? e : null),
		checkVisibility: () => o.visible !== false,
		scrollIntoView: () => {},
		getBoundingClientRect: () => o.box || { left: 100, top: 200, width: 40, height: 20 },
		offsetWidth: (o.box || { width: 40 }).width, offsetHeight: (o.box || { height: 20 }).height,
		clientLeft: 0, clientTop: 0,
		contains: (h) => h === e,
	};
	return e;
};
// target.evaluate / iframe.evaluate run the helper's own page functions on the stubs
const harness = (targetEl, hitEl, host = null) => {
	const clicks = [];
	const doc = { elementFromPoint: () => hitEl };
	const target = { evaluate: async (fn) => runInNewContext('(' + fn.toString() + ')(el)', { el: targetEl, document: doc }) };
	const page = { mouse: { click: async (x, y) => clicks.push([x, y]) } };
	const frame = {
		parentFrame: () => (host ? host.frame : null),
		page: () => page,
		frameElement: async () => (host ? host.iframe : null),
	};
	if (host) {
		host.frame = { parentFrame: () => null, page: () => page, frameElement: async () => null };
		host.iframe = {
			evaluate: async (fn, arg) => runInNewContext('(' + fn.toString() + ')(el, arg)', {
				el: host.el, arg, document: host.doc, getComputedStyle: () => ({ paddingLeft: '0', paddingTop: '0' }),
			}),
			dispose: async () => {},
		};
	}
	return { target, frame, clicks };
};

test('a visible enabled hit-tested target is pressed at its fresh center, with its hit witness', async () => {
	const e = el();
	const { target, frame, clicks } = harness(e, e);
	const point = await press(frame, target);
	assert.equal(point.ok, true);
	assert.deepEqual([point.x, point.y], [120, 210]);
	assert.deepEqual({ ...point.hit }, { tag: 'button', id: 'sw' });
	assert.deepEqual(clicks, [[120, 210]]);
});
test('a disabled target receives no press and says why', async () => {
	for (const o of [{ disabled: true }, { ariaDisabled: true }]) {
		const e = el(o);
		const { target, frame, clicks } = harness(e, e);
		const point = await press(frame, target);
		assert.equal(point.ok, false);
		assert.equal(point.reason, 'target is disabled');
		assert.deepEqual(clicks, []);
	}
});
test('a hidden target receives no press and says why', async () => {
	const e = el({ visible: false });
	const { target, frame, clicks } = harness(e, e);
	const point = await press(frame, target);
	assert.equal(point.ok, false);
	assert.equal(point.reason, 'target is hidden');
	assert.deepEqual(clicks, []);
});
test('a covered target receives no press and reports the covering hit', async () => {
	const e = el();
	const cover = { localName: 'div', id: 'cover' };
	const { target, frame, clicks } = harness(e, cover);
	const point = await press(frame, target);
	assert.deepEqual({ ...point.hit }, { tag: 'div', id: 'cover' });
	assert.deepEqual(clicks, []);
});
test('the point is carried through the frame chain and pressed in host coordinates', async () => {
	const e = el();
	const hostEl = el({ id: 'appframe', box: { left: 10, top: 20, width: 800, height: 600 } });
	const host = { el: hostEl, doc: { elementFromPoint: () => hostEl } };
	const { target, frame, clicks } = harness(e, e, host);
	const point = await press(frame, target);
	assert.equal(point.ok, true);
	assert.deepEqual([point.x, point.y], [130, 230]);
	assert.deepEqual(clicks, [[130, 230]]);
});
test('a cover in the host page refuses the press too', async () => {
	const e = el();
	const hostEl = el({ id: 'appframe', box: { left: 10, top: 20, width: 800, height: 600 } });
	const cover = { localName: 'footer', id: 'hostcover' };
	const host = { el: hostEl, doc: { elementFromPoint: () => cover } };
	const { target, frame, clicks } = harness(e, e, host);
	const point = await press(frame, target);
	assert.equal(point.ok, false);
	assert.deepEqual({ ...point.hit }, { tag: 'footer', id: 'hostcover' });
	assert.deepEqual(clicks, []);
});
