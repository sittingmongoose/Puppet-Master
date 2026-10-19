import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const summaryTool = fileURLToPath(new URL('./coverage_summary.mjs', import.meta.url));
function summarize(text, extra = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'pm7-coverage-summary-test-'));
  try {
    const sheet = createHash('sha256').update(text).digest('hex').slice(0, 16);
    const startOffset = text.indexOf('.spinner'), endOffset = text.indexOf('}', startOffset) + 1;
    writeFileSync(join(dir, 'page.html'), `<style id="fixture">${text}</style>`);
    writeFileSync(join(dir, 'raw.json'), JSON.stringify({ version: 2, js: [],
      css: [{ sheet, startOffset, endOffset, used: true }], ...extra }));
    execFileSync(process.execPath, [summaryTool, join(dir, 'page.html'), join(dir, 'raw.json'),
      join(dir, 'summary'), '--complete-union', join(dir, 'complete.json')]);
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
  const text = '.spinner { color: red; } .idle { color: blue; }';
  const { summary, complete } = summarize(text);
  assert.equal(summary.unsampled_navigations, null);
  assert.deepEqual(summary.css_rules.map(r => [r.usage_state, r.navigation_unchecked]),
    [['used', false], ['unknown', true]]);
  assert.equal(summary.totals.css_rules_unused, 0);
  assert.equal(summary.totals.css_rules_unmeasured, 1);
  assert.ok(complete.css.every(r => r.used));
});
