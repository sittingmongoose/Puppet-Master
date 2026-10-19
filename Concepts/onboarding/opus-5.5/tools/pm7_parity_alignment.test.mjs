import test from 'node:test';
import assert from 'node:assert/strict';
import { alignRemovedEntries, verifyRemovedSnapshot } from './pm7_parity_alignment.mjs';
import { differingPaths, parseArgs } from './pm7_parity.mjs';

const body = '/html[1]/body[1]';
const hidden = { path: body + '/div[1]', selector: '#old-stage', display: 'none' };
function fixture(layoutNodes = [1, 3, 7, 8, 9, 12, 13]) {
  return { strings: ['#document', 'HTML', 'HEAD', 'BODY', 'DIV', 'SPAN', '#text'], documents: [{
    nodes: { nodeType: [9, 1, 1, 1, 1, 1, 3, 1, 1, 3, 1, 1, 1, 1],
      nodeName: [0, 1, 2, 3, 4, 5, 6, 4, 5, 6, 4, 4, 4, 5],
      parentIndex: [-1, 0, 1, 1, 3, 4, 5, 3, 7, 8, 3, 10, 3, 12] },
    layout: { nodeIndex: layoutNodes } }] };
}
const baseline = [
  [body, 'body'], [hidden.path, 'null'], [hidden.path + '/span[1]', 'null'],
  [body + '/div[2]', 'first'], [body + '/div[2]::before', 'pseudo'], [body + '/div[2]/span[1]', 'child'],
  [body + '/div[3]', 'null'], [body + '/div[3]/div[1]', 'null'],
  [body + '/div[4]', 'last'], [body + '/div[4]/span[1]', 'last-child']
];
const candidate = [
  [body, 'body'], [body + '/div[1]', 'first'], [body + '/div[1]::before', 'pseudo'],
  [body + '/div[1]/span[1]', 'child'], [body + '/div[2]', 'last'], [body + '/div[2]/span[1]', 'last-child']
];

test('repeatable removal CLI is opt-in and preserves the default options object', () => {
  assert.equal(Object.hasOwn(parseArgs(['a.html', 'b.html']), 'expectRemoved'), false);
  assert.deepEqual(parseArgs(['a.html', 'b.html', '--expect-removed', '#old-stage', '--expect-removed', '[data-retired]']).expectRemoved,
    ['#old-stage', '[data-retired]']);
  assert.throws(() => parseArgs(['a.html', 'b.html', '--expect-removed']), /requires a value/);
  assert.throws(() => parseArgs(['a.html', 'b.html', '--expect-removed', '#old-stage', '--deep']), /requires native DOMSnapshot/);
});
test('hidden removed subtrees align later sibling ordinals, descendants and pseudos', () => {
  const original = structuredClone(baseline);
  const removed = verifyRemovedSnapshot(fixture(), [hidden, { path: body + '/div[3]', selector: '#other', display: 'none' }]);
  assert(removed.every(row => row.layoutBoxes === 0));
  const result = alignRemovedEntries(baseline, removed);
  assert.deepEqual(result.entries, candidate);
  assert.equal(result.removedRecords, 4);
  assert.equal(result.toRaw.get(body + '/div[1]::before'), body + '/div[2]::before');
  assert.deepEqual(differingPaths(result.entries, candidate), []);
  assert.deepEqual(baseline, original);
});
test('without the option strict shifted-ordinal differences remain unchanged', () => {
  const result = alignRemovedEntries(baseline, []);
  assert.equal(result.entries, baseline);
  assert.deepEqual(differingPaths(result.entries, candidate), differingPaths(baseline, candidate));
  assert(differingPaths(baseline, candidate).length > 0);
});
test('any layout box rejects a matching removal, including zero-size/invisible boxes', () => {
  assert.throws(() => verifyRemovedSnapshot(fixture([4]), [hidden]), /layout box.*#old-stage/);
  assert.throws(() => verifyRemovedSnapshot(fixture([4]), [{ ...hidden, display: 'block' }]), /layout box/);
});
test('display:contents and hidden parents cannot conceal rendered descendants or text', () => {
  assert.throws(() => verifyRemovedSnapshot(fixture([6]), [{ ...hidden, display: 'contents' }]), /layout node 6/);
  assert.throws(() => verifyRemovedSnapshot(fixture([5]), [hidden]), /layout node 5/);
});
test('unknown snapshot nodes fail closed; nested/duplicate selectors do not double-shift', () => {
  assert.throws(() => verifyRemovedSnapshot(fixture(), [{ ...hidden, path: body + '/aside[1]' }]), /missing from snapshot/);
  const removed = verifyRemovedSnapshot(fixture(), [hidden, { ...hidden, selector: '.also-old' },
    { path: hidden.path + '/span[1]', selector: '#old-child', display: 'none' }]);
  const aligned = alignRemovedEntries(baseline, removed);
  assert.equal(aligned.removedRecords, 2);
  assert.equal(aligned.entries.find(([path]) => path === body + '/div[1]')[1], 'first');
  assert.equal(aligned.entries.find(([path]) => path === body + '/div[2]')[1], 'null');
});
test('alignment still detects a changed surviving property and a retained candidate stage', () => {
  const removed = verifyRemovedSnapshot(fixture(), [hidden, { path: body + '/div[3]', selector: '#other', display: 'none' }]);
  const aligned = alignRemovedEntries(baseline, removed).entries;
  const changed = candidate.map(([path, hash]) => [path, hash === 'first' ? 'changed' : hash]);
  assert.deepEqual(differingPaths(aligned, changed), [body + '/div[1]']);
  assert(differingPaths(aligned, baseline).length > 0);
});
