import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, runInContext } from 'node:vm';
import { capture, enterState, differingPaths, nonRenderedDomOnlyPaths } from './pm7_parity.mjs';
import { encodePng } from './pm7_parity_png.mjs';

// Browser-free execution of the actual page callbacks. The settle model matches
// pm7_parity_browser.mjs: the requested delta followed by three 32 ms ticks.
const screenshot = encodePng({ width: 1, height: 1, data: Buffer.from([0, 0, 0, 255]) });
const group = { look: 'basic-dark', page: { id: 'home' }, motion: 'reduced' };
const menuState = { id: 'timed-menu', steps: [{ action: 'eval', script: 'openMenu()' }], assert: '#menu', check: 'menuOwned' };

function timedBrowser({ lifetime = Infinity, expire = 'visibility', afterScreenshot = false } = {}) {
  const sequence = { now: 0, open: false, owned: true, focused: false, focusVisible: true, hovered: false, closeAt: Infinity, events: [] };
  const record = event => sequence.events.push({ event, at: sequence.now, open: sequence.open });
  const expireState = () => {
    if (expire === 'visibility') sequence.open = false;
    if (expire === 'ownership') sequence.owned = false;
    if (expire === 'focus') sequence.focused = false;
    if (expire === 'focus-visible') sequence.focusVisible = false;
    if (expire === 'hover') sequence.hovered = false;
  };
  const control = { id: 'control', className: '', blur() { sequence.focused = false; },
    focus() { sequence.focused = true; }, getClientRects: () => [1], closest: () => null,
    getBoundingClientRect: () => ({ width: 100, height: 30 }),
    matches: selector => selector === ':focus-visible' ? sequence.focused && sequence.focusVisible : sequence.hovered };
  const menu = { id: 'menu', className: '', closest: () => null,
    getBoundingClientRect: () => ({ width: sequence.open ? 100 : 0, height: sequence.open ? 30 : 0 }) };
  const neutral = { id: '', className: '', blur() {} };
  const root = { getAttribute: name => name === 'data-theme' ? 'basic-dark' : name === 'data-motion' ? 'reduced' : null };
  const document = { documentElement: root, fonts: { ready: Promise.resolve(), status: 'loaded' }, images: [],
    querySelectorAll(selector) { record('visibility:' + selector); return [selector === '#menu' ? menu : control]; } };
  Object.defineProperty(document, 'activeElement', { get: () => sequence.focused ? control : neutral });
  const context = { Promise, document, innerWidth: 1600, innerHeight: 900, devicePixelRatio: 1,
    getComputedStyle: el => el === root ? ['color', 'display'] : { display: el === menu && !sequence.open ? 'none' : 'block', visibility: 'visible', opacity: '1' },
    matchMedia: () => ({ matches: true }), PM_NIER: { on: () => false }, PM_PAGES: { current: 'dashboard' }, PM_WARM: { state: () => ({ off: true }) },
    scrollTo() {}, addEventListener() {},
    openMenu() { sequence.open = true; sequence.closeAt = sequence.now + lifetime; record('open'); },
    __pm7Parity: { async settle(delta) { sequence.now += delta + 96; record('settle'); if (sequence.now >= sequence.closeAt) expireState(); },
      setCaretHidden: () => ({}), blobIdentities: () => ({}), readCustomProperties: () => [], specialRules: () => [], blockedRequests: () => [],
      snapshot: () => ({ hash: 'deep-fixture', entries: [['/html[1]', 'deep-fixture']], elements: 1 }),
      get now() { return sequence.now; } } };
  context.window = context;
  Object.defineProperty(context, 'menuOwned', { get: () => sequence.owned });
  createContext(context);
  const browser = { standardProperties: ['color', 'display'], customReads: { names: [], prefixes: [] },
    interceptErrors: [], blocked: new Set(), failedRequests: [], storageAudit: { freshContext: true },
    page: { errors: [], bringToFront: async () => {}, key: async () => {}, mouse: async () => {},
      evaluate: async (fn, ...args) => runInContext(typeof fn === 'function' ? `(${fn.toString()})(${args.map(arg => JSON.stringify(arg)).join(',')})` : fn, context),
      screenshot: async () => { record('screenshot'); if (afterScreenshot) expireState(); return screenshot; },
      send: async method => {
        assert.equal(method, 'DOMSnapshot.captureSnapshot'); record('styles');
        return { strings: ['#document', 'HTML', 'BODY', 'black', 'block'], documents: [{
          nodes: { nodeType: [9, 1, 1], nodeName: [0, 1, 2], parentIndex: [-1, 0, 1] },
          layout: { nodeIndex: [1, 2], styles: [[3, 4], [3, 4]] } }] };
      } } };
  return { browser, sequence };
}

test('final 96 ms expiry is a state ERROR on baseline, candidate and measured repeats', async () => {
  for (const side of ['baseline', 'candidate', 'baseline repeat']) for (const deep of [false, true]) {
    const { browser, sequence } = timedBrowser({ lifetime: 1550 });
    await enterState(browser, menuState, group);
    assert.equal(sequence.now, 2572);
    assert.equal(sequence.open, true);
    await assert.rejects(capture(browser, false, deep, [], { state: menuState, side }),
      error => error.message.includes(`State capture ERROR (${side} timed-menu)`) && /not visible/.test(error.message));
    assert.equal(sequence.now, 2668);
    assert.equal(sequence.open, false);
    assert(!sequence.events.some(({ event }) => event === 'screenshot' || event === 'styles'));
  }
});

test('ownership is rechecked after final preparation even while the menu stays visible', async () => {
  const { browser, sequence } = timedBrowser({ lifetime: 1550, expire: 'ownership' });
  await enterState(browser, menuState, group);
  await assert.rejects(capture(browser, false, false, [], { state: menuState, side: 'candidate' }), /ownership\/readiness/);
  assert.equal(sequence.open, true);
  assert(!sequence.events.some(({ event }) => event === 'screenshot'));
});

test('focus, keyboard modality and hover must survive the final capture preparation', async () => {
  for (const expire of ['focus', 'focus-visible', 'hover']) {
    const { browser, sequence } = timedBrowser({ lifetime: 1550, expire });
    await enterState(browser, menuState, group);
    sequence.focused = true; sequence.hovered = true;
    const state = { id: expire, steps: [{ action: expire === 'hover' ? 'hover' : 'focus', selector: '#control' }] };
    await assert.rejects(capture(browser, false, false, [], { state, side: 'baseline' }), /State capture ERROR.*(focus|Hover)/);
    assert.equal(sequence.now, 2668);
    assert(!sequence.events.some(({ event }) => event === 'screenshot'));
  }
});

test('a state lost during screenshot is an ERROR before style sampling', async () => {
  const { browser, sequence } = timedBrowser({ afterScreenshot: true });
  await enterState(browser, menuState, group);
  await assert.rejects(capture(browser, false, false, [], { state: menuState, side: 'candidate' }), /State capture ERROR.*not visible/);
  assert.equal(sequence.events.filter(({ event }) => event === 'screenshot').length, 1);
  assert(!sequence.events.some(({ event }) => event === 'styles'));
});

test('a surviving state captures at the original clock; assertion calls never settle', async () => {
  const { browser, sequence } = timedBrowser();
  await enterState(browser, menuState, group);
  const before = sequence.events.filter(({ event }) => event === 'settle').length;
  const result = await capture(browser, false, false, [], { state: menuState, side: 'baseline' });
  assert.equal(result.state.time, 2668);
  assert.equal(sequence.events.filter(({ event }) => event === 'settle').length, before + 1);
  assert.deepEqual(sequence.events.filter(({ event }) => event === 'screenshot' || event === 'styles'),
    [{ event: 'screenshot', at: 2668, open: true }, { event: 'styles', at: 2668, open: true }]);
});

function hiddenStylesBrowser(ids) {
  const fixture = timedBrowser();
  const element = (localName, id, children = []) => ({ localName, id, children,
    matches: selector => selector === 'style#' + id && localName === 'style' });
  const html = element('html', '', [element('head', '', ids.map(id => element('style', id))), element('body', '')]);
  const context = createContext({ document: { documentElement: html, children: [html] }, getComputedStyle: () => ({ display: 'none' }) });
  const originalEvaluate = fixture.browser.page.evaluate;
  fixture.browser.page.evaluate = async (fn, ...args) => fn.name === 'findExpectedRemoved'
    ? runInContext(`(${fn.toString()})(${JSON.stringify(args[0])})`, context) : originalEvaluate(fn, ...args);
  fixture.browser.page.send = async method => {
    assert.equal(method, 'DOMSnapshot.captureSnapshot');
    const strings = ['#document', 'HTML', 'HEAD', 'STYLE', 'BODY', 'black', 'block', 'id', ...ids];
    return { strings, documents: [{
      nodes: { nodeType: [9, 1, 1, ...ids.map(() => 1), 1], nodeName: [0, 1, 2, ...ids.map(() => 3), 4],
        parentIndex: [-1, 0, 1, ...ids.map(() => 2), 1], attributes: [[], [], [], ...ids.map((_, i) => [7, 8 + i]), []] },
      layout: { nodeIndex: [1, 3 + ids.length], styles: [[5, 6], [5, 6]] } }] };
  };
  return fixture;
}

test('expected removal rejects the wrong empty-style sibling despite identical aligned records', async () => {
  const baseline = hiddenStylesBrowser(['retire', 'keep']);
  const retained = hiddenStylesBrowser(['retire']);
  const a = await capture(baseline.browser, false, false, ['style#retire']);
  const unguarded = await capture(retained.browser, false, false);
  assert.equal(a.styles.hash, unguarded.styles.hash, 'empty styles alias after ordinal alignment');
  assert.equal(a.styles.skippedNodes.length, 1);
  retained.sequence.events.length = 0;
  await assert.rejects(capture(retained.browser, false, false, [],
    { side: 'candidate', expectAbsent: ['style#absent', 'style#retire'] }), /Expected removal ERROR.*style#retire.*style\[1\]/);
  assert(!retained.sequence.events.some(({ event }) => event === 'screenshot'));
});

test('candidate absence check accepts the named removal without excluding the surviving sibling', async () => {
  const a = await capture(hiddenStylesBrowser(['retire', 'keep']).browser, false, false, ['style#retire']);
  const b = await capture(hiddenStylesBrowser(['keep']).browser, false, false, [],
    { side: 'candidate', expectAbsent: ['style#retire'] });
  assert.equal(a.styles.hash, b.styles.hash);
  assert.equal(b.styles.entries.length, a.styles.raw.entries.length - 1);
  assert.equal(Object.hasOwn(b.styles, 'raw'), false);
});

test('DOM-only classification includes layout from text and generated pseudo descendants', async () => {
  const path = '/html[1]/body[1]/div[1]';
  const absent = await capture(timedBrowser().browser, false, false);
  for (const descendant of ['text', 'pseudo', 'none']) {
    const { browser } = timedBrowser();
    browser.page.send = async () => ({ strings: ['#document', 'HTML', 'BODY', 'DIV', '#text', 'before', 'black', 'block'], documents: [{
      nodes: { nodeType: [9, 1, 1, 1, descendant === 'text' ? 3 : 1], nodeName: [0, 1, 2, 3, descendant === 'text' ? 4 : 3],
        parentIndex: [-1, 0, 1, 2, 3], ...(descendant === 'pseudo' ? { pseudoType: { index: [4], value: [5] } } : {}) },
      layout: { nodeIndex: descendant === 'none' ? [1, 2] : [1, 2, 4],
        styles: descendant === 'none' ? [[6, 7], [6, 7]] : [[6, 7], [6, 7], [6, 7]] } }] });
    const present = await capture(browser, false, false);
    assert.equal(present.nativeDetails.get(path), null, 'parent has no own layout vector');
    const paths = differingPaths(present.styles.entries, absent.styles.entries);
    assert(paths.includes(path));
    assert.equal(nonRenderedDomOnlyPaths([present, absent], paths).includes(path), descendant === 'none');
    assert.notEqual(present.styles.hash, absent.styles.hash, 'all removals still fail exact styles');
  }
});
