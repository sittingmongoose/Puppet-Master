import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coverPage, executedRanges, mergeCoverage, normalizeJsCoverage, sampleCoverage } from './coverage_union.mjs';

test('a later branch sample cannot erase bytes touched by an earlier sample', () => {
  const script = (zero) => ({ script: 'same', functions: [{ functionName: '', ranges: [
    { startOffset: 0, endOffset: 100, count: 1 },
    { startOffset: zero, endOffset: zero + 10, count: 0 },
  ] }] });
  assert.deepEqual(executedRanges(script(20).functions), [
    { startOffset: 0, endOffset: 20 }, { startOffset: 30, endOffset: 100 },
  ]);
  const sample = (zero) => ({ js: normalizeJsCoverage([script(zero)], () => 'same'), css: [] });
  const union = mergeCoverage(mergeCoverage({ js: [], css: [] }, sample(20)), sample(60));
  assert.deepEqual(union.js[0].usedRanges, [{ startOffset: 0, endOffset: 100 }]);
  assert.equal(union.js[0].usedRangesProvenance, 'per-sample-v1');
});

test('an uncertified aggregate never becomes certified or rebuilds touched bytes', () => {
  const native = normalizeJsCoverage([{ functions: [{ functionName: '', ranges: [{ startOffset: 0, endOffset: 100, count: 1 }] }] }], () => 'same');
  const legacy = { script: 'same', functions: [{ functionName: '', ranges: [{ startOffset: 0, endOffset: 200, count: 1 }] }] };
  const union = mergeCoverage({ js: [legacy], css: [] }, { js: native, css: [] });
  assert.equal(union.js[0].usedRangesProvenance, 'unknown-merged-counters');
  assert.deepEqual(union.js[0].usedRanges, [{ startOffset: 0, endOffset: 100 }]);
  const unmarked = { ...native[0] }; delete unmarked.usedRangesProvenance;
  assert.equal(mergeCoverage({ js: native, css: [] }, { js: [unmarked], css: [] }).js[0].usedRangesProvenance, 'unknown-merged-counters');
  assert.equal(mergeCoverage(union, { js: native, css: [] }).js[0].usedRangesProvenance, 'unknown-merged-counters');
});

test('navigation flushes the old stylesheet before Chrome discards its ID', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pm7-coverage-test-'));
  let doc = 'blank';
  const calls = [];
  const page = {
    async goto(url) { calls.push('goto:' + url); doc = url; },
    async send(method, params) {
      calls.push(method + ':' + doc);
      if (method === 'Profiler.takePreciseCoverage') return { result: doc === 'blank' ? [] : [{ scriptId: doc, functions: [{ functionName: '', ranges: [{ startOffset: 0, endOffset: 10, count: 1 }] }] }] };
      if (method === 'Debugger.getScriptSource') return { scriptSource: params.scriptId };
      if (method === 'CSS.takeCoverageDelta') return { coverage: doc === 'blank' ? [] : [{ styleSheetId: doc, startOffset: 0, endOffset: 10, used: true }] };
      if (method === 'CSS.stopRuleUsageTracking') return { ruleUsage: [{ styleSheetId: doc, startOffset: 0, endOffset: 10, used: true }] };
      if (method === 'CSS.getStyleSheetText') { assert.equal(params.styleSheetId, doc); return { text: '.' + doc + '{}' }; }
      return {};
    },
  };
  const goto = page.goto, send = page.send;
  try {
    const finish = await coverPage(page, join(dir, 'union.json'));
    await page.goto('first'); await page.goto('second'); await finish();
    const union = JSON.parse(readFileSync(join(dir, 'union.json'), 'utf8'));
    assert.equal(union.css.length, 2); assert.equal(union.js.length, 2);
    assert.ok(calls.indexOf('CSS.getStyleSheetText:first') < calls.indexOf('goto:second'));
    assert.equal(page.goto, goto); assert.equal(page.send, send);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('disabled coverage neither sends CDP calls nor wraps navigation', async () => {
  const page = { goto() {}, send() { throw Error('coverage was not requested'); } }, goto = page.goto;
  await (await coverPage(page, null))(); assert.equal(page.goto, goto);
});

test('a stylesheet with no matched rules still has installed-source evidence', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pm7-coverage-test-'));
  const listeners = new Map();
  const page = {
    on(event, callback) { listeners.set(event, callback); return () => listeners.delete(event); },
    async send(method) {
      if (method === 'CSS.enable') listeners.get('CSS.styleSheetAdded')({ header: { styleSheetId: 'never-matched', startLine: 0, startColumn: 7 } });
      if (method === 'Profiler.takePreciseCoverage') return { result: [] };
      if (method === 'CSS.stopRuleUsageTracking') return { ruleUsage: [] };
      if (method === 'CSS.getStyleSheetText') return { text: '.never-matched {color: blue}' };
      return {};
    },
  };
  try {
    await (await coverPage(page, join(dir, 'union.json')))();
    const union = JSON.parse(readFileSync(join(dir, 'union.json'), 'utf8'));
    assert.equal(union.css.length, 0);
    assert.equal(union.stylesheets.length, 1);
    assert.equal(union.stylesheets[0].installed, true);
    assert.equal(listeners.size, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('page-initiated main-frame reloads count once; wrapped navigations and subframes do not', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pm7-coverage-navigation-test-'));
  const file = join(dir, 'union.json'), listeners = new Map();
  let url = 'about:blank';
  const navigated = () => listeners.get('Page.frameNavigated')({ frame: { id: 'main', url } });
  const page = {
    on(event, callback) { listeners.set(event, callback); return () => listeners.delete(event); },
    async goto(next) { if (next === 'reject') throw Error('navigation rejected'); url = next; navigated(); },
    async send(method) {
      if (method === 'Page.getFrameTree') return { frameTree: { frame: { id: 'main', url } } };
      if (method === 'Page.reload') navigated();
      if (method === 'Profiler.takePreciseCoverage') return { result: [] };
      if (method === 'CSS.takeCoverageDelta') return { coverage: [] };
      if (method === 'CSS.stopRuleUsageTracking') return { ruleUsage: [] };
      return {};
    },
  };
  try {
    const finish = await coverPage(page, file);
    await page.goto('first'); await page.send('Page.reload');
    assert.equal(JSON.parse(readFileSync(file)).unsampled_navigations, 0);
    url = 'page-initiated'; navigated();
    listeners.get('Page.frameNavigated')({ frame: { id: 'child', parentId: 'main', url } });
    await sampleCoverage(page, file); await sampleCoverage(page, file);
    assert.equal(JSON.parse(readFileSync(file)).unsampled_navigations, 1);
    await assert.rejects(page.goto('reject'), /navigation rejected/);
    url = 'reload-after-rejection'; navigated();
    await page.send('Page.navigate');
    listeners.get('Page.navigatedWithinDocument')({ frameId: 'main', url: url + '#hash' });
    navigated();
    await finish();
    assert.equal(JSON.parse(readFileSync(file)).unsampled_navigations, 3);
    assert.equal(listeners.size, 0);
    const sum = mergeCoverage({ js: [], css: [], unsampled_navigations: 2 },
      { js: [], css: [], unsampled_navigations: 3 });
    assert.equal(sum.unsampled_navigations, 5);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
