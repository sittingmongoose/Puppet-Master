import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { capture, configurePage, drainInterceptions, loadGroup, differingPaths, nonRenderedDomOnlyPaths } from './pm7_parity.mjs';
import { encodePng, diffPng } from './pm7_parity_png.mjs';

const source = readFileSync(new URL('./pm7_parity.mjs', import.meta.url), 'utf8');
const screenshot = encodePng({ width: 1, height: 1, data: Buffer.from([0, 0, 0, 255]) });
const group = { look: 'basic-dark', page: { id: 'home' }, viewport: { id: 'wide', width: 1600, height: 900 }, motion: 'reduced' };
const state = { id: 'rest', steps: [] };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const interceptionError = () => Error('CDP -32602 Invalid InterceptionId (late product request fixture)');

function fixture() {
  const handlers = new Map(), commands = [], sampled = Promise.withResolvers();
  let pending, resets = 0;
  const browser = { input: { body: 'fixture' }, customReads: { names: [], prefixes: [] }, standardProperties: ['color', 'display'],
    storageAudit: { freshContext: true }, session: { id: 'fixture' }, chrome: { pid: 1 },
    resetContext: async () => { resets++; }, close: async () => {},
    page: { errors: [], on: (name, fn) => handlers.set(name, fn), bringToFront: async () => {},
      async send(method, args) {
        commands.push([method, args]);
        if (method.startsWith('Fetch.') && method !== 'Fetch.enable') return pending?.promise || {};
        if (method !== 'DOMSnapshot.captureSnapshot') return {};
        return { strings: ['#document', 'HTML', 'BODY', 'black', 'block'], documents: [{
          nodes: { nodeType: [9, 1, 1], nodeName: [0, 1, 2], parentIndex: [-1, 0, 1] },
          layout: { nodeIndex: [1, 2], styles: [[3, 4], [3, 4]] } }] };
      },
      async screenshot() { return screenshot; },
      async evaluate(fn) {
        const text = String(fn);
        if (text.includes('document.fonts.ready')) return { resolved: {}, hidden: {} };
        if (text.includes('setCaretHidden') || text.includes('blobIdentities')) return {};
        if (text.includes("p.startsWith('--')")) return [];
        if (text.includes('time: __pm7Parity.now')) return { time: 2668 };
        if (text.includes('__pm7Parity.snapshot(')) return { hash: 'deep', entries: [['/html[1]', 'deep']], elements: 1 };
        if (text.includes('blockedRequests')) { sampled.resolve(); return []; }
        if (text.includes('specialRules') || text.includes('readCustomProperties')) return [];
        throw Error('Unexpected evaluation: ' + text);
      } } };
  const pause = (url = 'https://fixture.invalid/product.png', resourceType = 'Image') => {
    pending = Promise.withResolvers();
    handlers.get('Fetch.requestPaused')({ requestId: 'late', resourceType, request: { url } });
    return pending;
  };
  return { browser, commands, sampled: sampled.promise, pause, get resets() { return resets; } };
}

for (const side of ['baseline', 'candidate', 'baseline repeat']) for (const deep of [false, true]) {
  test(`last ${side} capture drains a rejection after capture entry (${deep ? 'deep' : 'native'})`, async () => {
    const f = fixture(); await configurePage(f.browser);
    let pending, accepted = false;
    f.browser.page.screenshot = async () => { pending = f.pause(); return screenshot; };
    const taking = capture(f.browser, false, deep, [], { side, state }).then(result => { accepted = true; return result; });
    const rejected = assert.rejects(taking, /Fetch interception ERROR.*-32602 Invalid InterceptionId/);
    await f.sampled;
    assert.equal(accepted, false);
    assert.equal(f.browser.pendingInterceptions.size, 1);
    pending.reject(interceptionError());
    await rejected;
    assert.equal(accepted, false);
    assert.equal(f.browser.pendingInterceptions.size, 0);
  });
}

test('a pending rejection blocks context reset and cannot be cleared by configurePage', async () => {
  const f = fixture(); await configurePage(f.browser);
  const errors = f.browser.interceptErrors, pending = f.pause();
  const rejected = assert.rejects(loadGroup(f.browser, group), /Fetch interception ERROR/);
  assert.equal(f.resets, 0);
  pending.reject(interceptionError()); await rejected;
  assert.equal(f.resets, 0);
  const commands = f.commands.length;
  await assert.rejects(configurePage(f.browser), /Invalid InterceptionId/);
  assert.equal(f.commands.length, commands);
  assert.equal(f.browser.interceptErrors, errors);
  assert.equal(errors.length, 1);
});

test('fulfill, continue and fail rejections all remain fatal, including marker cancellations', async () => {
  for (const [url, type, method] of [
    ['document', 'Document', 'Fetch.fulfillRequest'], ['file:///product.png', 'Image', 'Fetch.continueRequest'],
    ['https://fixture.invalid/product.png', 'Image', 'Fetch.failRequest'], ['file:///__pm7_parity_asset__/marker', 'Image', 'Fetch.failRequest']
  ]) {
    const f = fixture(); await configurePage(f.browser);
    const pending = f.pause(url === 'document' ? f.browser.currentUrl : url, type);
    assert.equal(f.commands.at(-1)[0], method);
    const rejected = assert.rejects(drainInterceptions(f.browser), /Invalid InterceptionId/);
    pending.reject(interceptionError()); await rejected;
  }
});

test('configurePage preserves errors arriving during setup before replacing its tracking arrays', async () => {
  const f = fixture(); await configurePage(f.browser);
  const errors = f.browser.interceptErrors, pending = f.browser.pendingInterceptions;
  const send = f.browser.page.send;
  f.browser.page.send = async (method, args) => {
    if (method === 'Network.enable') f.pause().reject(interceptionError());
    return send(method, args);
  };
  await assert.rejects(configurePage(f.browser), /Invalid InterceptionId/);
  assert.equal(f.browser.interceptErrors, errors); assert.equal(errors.length, 1);
  assert.equal(f.browser.pendingInterceptions, pending);
});

test('draining includes another interception started while an earlier one is pending', async () => {
  const f = fixture(); await configurePage(f.browser);
  const first = f.pause(), draining = drainInterceptions(f.browser);
  const rejected = assert.rejects(draining, /Invalid InterceptionId/);
  const last = f.pause(); first.resolve({}); last.reject(interceptionError());
  await rejected;
  assert.equal(f.browser.pendingInterceptions.size, 0);
});

function comparator(report, writes) {
  const code = source.slice(source.indexOf('  async function compare('), source.indexOf('  async function worker('));
  return new Function('env', `const {options,report,selected,join,writeFileSync,appendFileSync,digest,diffPng,differingPaths,nonRenderedDomOnlyPaths,drainInterceptions}=env; ${code}; return compare;`)({
    options: { out: '/synthetic-no-files', tolerance: 0, maxDiffPixels: 0, baselineRepeats: 1, first: 8, deep: false },
    report, selected: { count: 1 }, join, writeFileSync: () => writes.push('artifact'), appendFileSync: () => writes.push('progress'),
    digest, diffPng, differingPaths, nonRenderedDomOnlyPaths, drainInterceptions
  });
}

test('comparison drains late errors before writing any PASS row', async () => {
  const f = fixture(); await configurePage(f.browser);
  const cap = await capture(f.browser, false, false);
  const pending = f.pause(), report = { rows: [] }, writes = [];
  const rejected = assert.rejects(comparator(report, writes)(group, state, [cap, cap], [f.browser, f.browser]), /Invalid InterceptionId/);
  pending.reject(interceptionError()); await rejected;
  assert.deepEqual(report.rows, []); assert.deepEqual(writes, []);
});

test('comparison rechecks errors raised while writing capture artifacts', async () => {
  const f = fixture(); await configurePage(f.browser);
  const cap = await capture(f.browser, false, false), report = { rows: [] };
  const writes = { push() { f.pause().reject(interceptionError()); } };
  await assert.rejects(comparator(report, writes)(group, state, [cap, cap], [f.browser]), /Invalid InterceptionId/);
  assert.deepEqual(report.rows, []);
});

test('worker completion drains interception errors raised during browser close', async () => {
  const f = fixture(); await configurePage(f.browser);
  let closed = false;
  f.browser.close = async () => { closed = true; f.pause().reject(interceptionError()); };
  const report = { rows: [], errors: [], browsers: [] }, telemetry = { live: new Set([f.browser]) };
  const code = source.slice(source.indexOf('  async function worker('), source.indexOf('  try { await Promise.all(Array.from'));
  const worker = new Function('env', `const {inputs,customReads,selected,report,telemetry,createBrowser,deadline,drainInterceptions,console}=env; let cursor=0; ${code}; return worker;`)({
    inputs: [{ body: 'fixture' }], customReads: f.browser.customReads, selected: { groups: [] }, report, telemetry,
    createBrowser: async () => f.browser, deadline: promise => promise, drainInterceptions, console: { log() {}, error() {} }
  });
  await worker(0);
  assert.equal(closed, true); assert.equal(telemetry.live.size, 0);
  assert.equal(report.errors.length, 1); assert.match(report.errors[0].error, /Invalid InterceptionId/);
});
