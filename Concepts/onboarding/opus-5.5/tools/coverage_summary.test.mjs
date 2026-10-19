import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const summaryTool = fileURLToPath(new URL('./coverage_summary.mjs', import.meta.url));
function summarize(text, extra = {}, args = []) {
  const sheet = createHash('sha256').update(text).digest('hex').slice(0, 16);
  const startOffset = text.indexOf('.spinner'), endOffset = text.indexOf('}', startOffset) + 1;
  return summarizePage(`<style id="fixture">${text}</style>`, { version: 2, js: [],
    css: [{ sheet, startOffset, endOffset, used: true }], ...extra }, args);
}

function summarizePage(html, union, args = []) {
  const dir = mkdtempSync(join(tmpdir(), 'pm7-coverage-summary-test-'));
  try {
    writeFileSync(join(dir, 'page.html'), html);
    writeFileSync(join(dir, 'raw.json'), JSON.stringify(union));
    execFileSync(process.execPath, [summaryTool, join(dir, 'page.html'), join(dir, 'raw.json'),
      join(dir, 'summary'), '--complete-union', join(dir, 'complete.json'), ...args]);
    return { summary: JSON.parse(readFileSync(join(dir, 'summary.json'))),
      complete: JSON.parse(readFileSync(join(dir, 'complete.json'))) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('a touched animation never certifies its standard or prefixed keyframe steps unused', () => {
  const text = `.spinner { animation: spin 1s infinite; }
@keyframes spin { from { opacity: 0; } 50% { opacity: .5; } to { opacity: 1; } }
@media (min-width: 1px) {
  @-webkit-keyframes vendor { from { opacity: 0; } 75% { opacity: .5; } to { opacity: 1; } }
  .wrapped { color: red; }
}
.idle { color: blue; }`;
  const { summary, complete } = summarize(text, { unsampled_navigations: 0 });
  assert.deepEqual(summary.css_rules.map(r => [r.selector, r.usage_state]),
    [['.spinner', 'used'], ['.wrapped', 'unused'], ['.idle', 'unused']]);
  assert.equal(summary.totals.css_rules_total, 3);
  assert.equal(summary.totals.css_rules_unused, 2);
  const falseRows = complete.css.filter(r => r.used === false);
  assert.equal(falseRows.length, 2);
  assert.ok(falseRows.every(r => /^\.(wrapped|idle)\b/.test(text.slice(r.startOffset, r.endOffset))));
  const keyframeSteps = [...text.matchAll(/(?:from|to|\d+%)\s*\{[^}]*\}/g)];
  assert.equal(keyframeSteps.length, 6);
  for (const step of keyframeSteps) assert.ok(complete.css.every(r =>
    r.endOffset <= step.index || r.startOffset >= step.index + step[0].length));
  const keyframeBytes = keyframeSteps.reduce((n, step) => n + Buffer.byteLength(step[0]), 0);
  assert.ok(summary.totals.css_unmeasured_bytes >= keyframeBytes);
  assert.equal(summary.totals.css_unused_bytes,
    summary.css_rules.filter(r => r.usage_state === 'unused').reduce((n, r) => n + r.bytes, 0));
});

test('an unsampled navigation keeps observed touches but cannot certify CSS absence', () => {
  const text = '.spinner { color: red; } .idle { color: blue; }';
  const { summary, complete } = summarize(text, { unsampled_navigations: 1 });
  assert.equal(summary.unsampled_navigations, 1);
  assert.deepEqual(summary.css_rules.map(r => r.usage_state), ['used', 'unknown']);
  assert.equal(summary.totals.css_rules_unused, 0);
  assert.equal(summary.totals.css_rules_unmeasured, 1);
  assert.ok(complete.css.every(r => r.used));
  assert.equal(complete.unsampled_navigations, 1);
});

test('a union with no navigation tracking cannot certify CSS absence', () => {
  const text = '.spinner { color: red; } .idle { color: blue; } @font-face { font-family: fixture; }';
  const sheet = createHash('sha256').update(text).digest('hex').slice(0, 16);
  const { summary, complete } = summarize(text, { css: [
    { sheet, startOffset: 0, endOffset: text.indexOf('}') + 1, used: true },
    { sheet, startOffset: text.indexOf('.idle'), endOffset: text.indexOf('}', text.indexOf('.idle')) + 1, used: false },
    // Neither row is a static selector rule: the census cannot clean them up.
    { sheet, startOffset: text.indexOf('@font-face'), endOffset: text.length, used: false },
    { sheet: 'unmatched-sheet', startOffset: 0, endOffset: 10, used: false },
  ] });
  assert.equal(summary.unsampled_navigations, null);
  assert.deepEqual(summary.css_rules.map(r => [r.usage_state, r.navigation_unchecked]),
    [['used', false], ['unknown', true]]);
  assert.equal(summary.totals.css_rules_unused, 0);
  assert.equal(summary.totals.css_rules_unmeasured, 1);
  assert.ok(complete.css.every(r => r.used));
});

test('JS absence needs tracked zero while native counts and positive touches remain intact', () => {
  const text = 'function idle(){ return 1; } function absent(){ return 2; } void 0;';
  const script = createHash('sha256').update(text).digest('hex').slice(0, 16);
  const native = [
    { functionName: '', ranges: [{ startOffset: 0, endOffset: text.length, count: 1 }] },
    { functionName: 'idle', ranges: [{ startOffset: 0, endOffset: text.indexOf('}') + 1, count: 0 }] },
  ];
  for (const count of [undefined, null, 0, 2]) {
    const union = { version: 2, js: [{ script, functions: native, usedRangesProvenance: 'per-sample-v1',
      usedRanges: [{ startOffset: text.indexOf('void'), endOffset: text.length }] }], css: [],
      ...(count === undefined ? {} : { unsampled_navigations: count }) };
    const { summary, complete } = summarizePage(`<script id="fixture">${text}</script>`, union);
    assert.equal(summary.totals.js_used_bytes, Buffer.byteLength('void 0;'));
    assert.deepEqual(complete.js[0].functions.slice(0, native.length), native);
    const idle = summary.js_functions.find(f => f.name === 'idle');
    const absent = summary.js_functions.find(f => f.name === 'absent');
    assert.equal(idle.count, 0);
    assert.equal(idle.navigation_unchecked, count == null);
    assert.equal(idle.unsampled_navigation_gap, count > 0);
    const projection = complete.js[0].functions.find(f => f.union_projection);
    if (count === 0) {
      assert.ok(summary.totals.js_unused_bytes > 0);
      assert.equal(idle.usage_state, 'unused');
      assert.equal(absent.count, 0);
      assert.ok(complete.js[0].functions.some(f => f.census));
      assert.ok(projection.ranges.some(r => r.count === 0));
    } else {
      assert.equal(summary.totals.js_unused_bytes, 0);
      assert.equal(summary.totals.js_unmeasured_bytes, Buffer.byteLength(text) - summary.totals.js_used_bytes);
      assert.equal(idle.usage_state, 'unknown');
      assert.equal(absent.count, null);
      assert.equal(absent.usage_state, 'unknown');
      assert.ok(!complete.js[0].functions.some(f => f.census));
      assert.ok(projection.ranges.every(r => r.count === 1));
      assert.equal(projection.navigation_unknown, true);
    }
  }
});

test('the evidence-bound opt-in certifies missing counts without hiding unchecked navigation', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pm7-navigation-assumption-'));
  try {
    const evidence = join(dir, 'navigation.md'), statement = 'Fixture only: no page-initiated navigation in this synthetic page.\n';
    writeFileSync(evidence, statement);
    const css = '.spinner { color: red; } .idle { color: blue; }';
    const js = 'function idle(){} void 0;';
    const sheet = createHash('sha256').update(css).digest('hex').slice(0, 16);
    const script = createHash('sha256').update(js).digest('hex').slice(0, 16);
    for (const count of [undefined, null, 0, 2]) {
      const raw = { version: 2, js: [{ script, functions: [], usedRangesProvenance: 'per-sample-v1',
        usedRanges: [{ startOffset: js.indexOf('void'), endOffset: js.length }] }], css: [
        { sheet, startOffset: 0, endOffset: css.indexOf('}') + 1, used: true },
        { sheet: 'unmatched-sheet', startOffset: 0, endOffset: 10, used: false },
      ], ...(count === undefined ? {} : { unsampled_navigations: count }) };
      const { summary, complete } = summarizePage(`<style id="fixture">${css}</style><script id="js">${js}</script>`, raw,
        ['--assume-navigation-clean', evidence]);
      assert.equal(summary.unsampled_navigations, count ?? null);
      assert.equal(complete.unsampled_navigations, count);
      assert.equal(Object.hasOwn(complete, 'unsampled_navigations'), count !== undefined);
      const assumption = summary.navigation_assumption;
      assert.equal(assumption.applied, count == null);
      assert.deepEqual(assumption.evidence, { path: evidence,
        sha256: createHash('sha256').update(statement).digest('hex') });
      assert.deepEqual(complete.census.navigation_assumption, assumption);
      assert.deepEqual(complete.census.caveats, summary.caveats);
      assert.ok(summary.caveats.some(s => s.includes(evidence) && s.includes(assumption.evidence.sha256)));
      if (count > 0) {
        assert.equal(summary.totals.css_rules_unused, 0);
        assert.equal(summary.totals.js_unused_bytes, 0);
        assert.equal(complete.css.filter(r => !r.used).length, 0);
        assert.equal(summary.js_functions[0].usage_state, 'unknown');
      } else {
        assert.equal(summary.totals.css_rules_unused, 1);
        assert.ok(summary.totals.js_unused_bytes > 0);
        const idle = summary.css_rules.find(r => r.selector === '.idle');
        assert.equal(idle.navigation_unchecked, count == null);
        assert.equal(idle.navigation_assumed_clean, count == null);
        assert.equal(summary.js_functions[0].navigation_unchecked, count == null);
        assert.equal(summary.js_functions[0].usage_state, 'unused');
        if (count == null) {
          assert.ok(complete.css.filter(r => !r.used).every(r => r.navigation_unchecked && r.navigation_assumed_clean));
          assert.ok(complete.js[0].functions.filter(f => f.census).every(f => f.navigation_unchecked && f.navigation_assumed_clean));
        }
      }
    }
    const empty = join(dir, 'empty.md'); writeFileSync(empty, '');
    const raw = { version: 2, js: [], css: [] };
    for (const args of [['--assume-navigation-clean'], ['--assume-navigation-clean', '--complete-union'],
      ['--assume-navigation-clean', empty], ['--assume-navigation-clean', join(dir, 'missing.md')]]) {
      assert.throws(() => summarizePage('<style></style>', raw, args));
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
