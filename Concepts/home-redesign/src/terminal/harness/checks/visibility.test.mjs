// A terminal that is not on screen draws nothing (70-view.js, B6 2026-10-16): visible is the host showing its tab
// (onShow/onHide) and its root being on screen (an IntersectionObserver; a page the host does not know about, such as
// Settings over Home, hides it without onHide). Hidden, no frame is drawn and image animation and effects wait; the
// terminal keeps its state, and one full repaint follows when it shows again.
// Run: node harness/checks/visibility.test.mjs
import assert from 'node:assert/strict';
import { loadT } from './load.mjs';

globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
let rafs = 0;
globalThis.requestAnimationFrame = () => ++rafs;
const T = loadT(['00-core.js', '70-view.js'], { window: {}, document: { documentElement: { getAttribute: () => null }, createElement: () => ({ getContext: () => null, style: {}, classList: { add() {}, toggle() {} }, appendChild() {} }) } });
const P = T.View.prototype;

/* a view as the constructor leaves it, with the parts _visibility talks to */
function view() {
  const log = [];
  const v = Object.create(P);
  Object.assign(v, {
    hostVisible: true, onScreen: true, visible: true, raf: 0, fullPending: false, pop: null,
    term: { images: { pause: on => log.push('images ' + (on ? 'paused' : 'running')) } },
    fx: { visible: on => log.push('fx ' + on) },
    layout: () => log.push('layout'), _groundSoon: () => {}
  });
  return { v, log };
}
const offScreen = (v, on) => { v.onScreen = !on; v._visibility(); };

let passed = 0;
function test(name, fn) { try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; } }

test('off screen (a page over Home): nothing is drawn, motion waits, the repaint is kept for later', () => {
  const { v, log } = view();
  rafs = 0;
  offScreen(v, true);
  assert.equal(v.visible, false);
  assert.deepEqual(log, ['images paused', 'fx false']);
  v.schedule(); v.schedule(true);                              /* a program keeps writing */
  assert.equal(rafs, 0);
  assert.equal(v.fullPending, true);
});

test('back on screen: laid out and repainted in full, once', () => {
  const { v, log } = view();
  offScreen(v, true); log.length = 0; rafs = 0;
  offScreen(v, false);
  assert.equal(v.visible, true);
  assert.deepEqual(log, ['images running', 'fx true', 'layout']);
  assert.equal(rafs, 1);
  assert.equal(v.fullPending, true);
  v.raf = rafs; v.schedule();
  assert.equal(rafs, 1);                                       /* one frame pending, not two */
});

test('the host hides the tab: hidden whatever the screen says, and on screen again changes nothing', () => {
  const { v, log } = view();
  v.onHide();
  assert.equal(v.visible, false);
  offScreen(v, true); offScreen(v, false);
  assert.equal(v.visible, false);
  rafs = 0; v.schedule(true);
  assert.equal(rafs, 0);
  log.length = 0;
  v.onShow();
  assert.equal(v.visible, true);
  assert.deepEqual(log, ['images running', 'fx true', 'layout']);
  assert.equal(rafs, 1);
});

test('the host shows a tab that already shows: it still lays out and repaints, as before', () => {
  const { v, log } = view();
  rafs = 0;
  v.onShow();
  assert.deepEqual(log, ['layout']);
  assert.equal(rafs, 1);
});

test('shown by the host while off screen: stays hidden until it is on screen', () => {
  const { v } = view();
  v.onHide(); offScreen(v, true);
  rafs = 0; v.onShow();
  assert.equal(v.visible, false);
  assert.equal(rafs, 0);
  offScreen(v, false);
  assert.equal(v.visible, true);
  assert.equal(rafs, 1);
});

console.log(`visibility.test: ${passed} passed`);
