import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coverPage, executedRanges, mergeCoverage } from './coverage_union.mjs';

test('a later branch sample cannot erase bytes touched by an earlier sample', () => {
  const script = (zero) => ({ script: 'same', functions: [{ functionName: '', ranges: [
    { startOffset: 0, endOffset: 100, count: 1 },
    { startOffset: zero, endOffset: zero + 10, count: 0 },
  ] }] });
  assert.deepEqual(executedRanges(script(20).functions), [
    { startOffset: 0, endOffset: 20 }, { startOffset: 30, endOffset: 100 },
  ]);
  const union = mergeCoverage(mergeCoverage({ js: [], css: [] }, { js: [script(20)], css: [] }), { js: [script(60)], css: [] });
  assert.deepEqual(union.js[0].usedRanges, [{ startOffset: 0, endOffset: 100 }]);
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
