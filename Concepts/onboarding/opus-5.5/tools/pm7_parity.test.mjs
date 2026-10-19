import test from 'node:test';
import assert from 'node:assert/strict';
import { encodePng, decodePng, diffPng } from './pm7_parity_png.mjs';
import { parseArgs, selectMatrix, differingPaths } from './pm7_parity.mjs';
import { normalizeBlobValue } from './pm7_parity_browser.mjs';

test('PNG round trip, single-pixel sensitivity and explicit RGBA tolerances', () => {
  const a = { width: 2, height: 2, data: Buffer.from([0, 1, 2, 255, 40, 50, 60, 255, 70, 80, 90, 255, 100, 110, 120, 255]) };
  const png = encodePng(a); assert.deepEqual(decodePng(png), a);
  assert.equal(diffPng(png, png).diffPixels, 0);
  const changed = Buffer.from(a.data); changed[4]++;
  const b = encodePng({ ...a, data: changed });
  const exact = diffPng(png, b);
  assert.equal(exact.diffPixels, 1); assert.equal(exact.rawDiffPixels, 1);
  assert.equal(exact.pass, false); assert.deepEqual(exact.bounds, [1, 0, 1, 0]);
  assert.equal(decodePng(exact.heatmap).data[4], 255);
  assert.equal(diffPng(png, b, 1).diffPixels, 0);
  assert.equal(diffPng(png, b, 1).rawDiffPixels, 1);
  assert.equal(diffPng(png, b, 0, 1).pass, true);
  changed[3]--; assert.equal(diffPng(png, encodePng({ ...a, data: changed })).diffPixels, 2);
});
test('reject corrupt PNG and unequal dimensions', () => {
  const png = encodePng({ width: 1, height: 1, data: Buffer.from([1, 2, 3, 255]) });
  const corrupt = Buffer.from(png); corrupt[29] ^= 1;
  assert.throws(() => decodePng(corrupt), /CRC/);
  assert.throws(() => diffPng(png, encodePng({ width: 2, height: 1, data: Buffer.alloc(8) })), /dimensions/);
});
test('CLI rejects silent tolerance, unknown flags, invalid concurrency and empty subset', () => {
  const args = ['a.html', 'b.html'];
  assert.equal(parseArgs(args).tolerance, 0);
  assert.equal(parseArgs(args).maxDiffPixels, 0);
  assert.throws(() => parseArgs([...args, '--concurrency', '7']), /concurrency/);
  assert.throws(() => parseArgs([...args, '--tolerance', '256']), /tolerance/);
  assert.throws(() => parseArgs([...args, '--surprise', 'true']), /Unknown/);
  assert.throws(() => parseArgs([...args, '--subset', 'looks=']), /Subset/);
});
test('matrix filters preserve page-specific states and reject misspelled IDs', () => {
  const matrix = { version: 1, looks: ['basic-dark'], viewports: [{ id: 'wide', width: 1600, height: 900 }],
    pages: [{ id: 'home' }, { id: 'chat' }], states: [{ id: 'rest', pages: '*' }, { id: 'composer', pages: ['chat'] }] };
  assert.equal(selectMatrix(matrix, {}).count, 3);
  assert.equal(selectMatrix(matrix, { pages: ['chat'] }).count, 2);
  assert.throws(() => selectMatrix(matrix, { pages: ['hat'] }), /Unknown pages/);
  assert.throws(() => selectMatrix(matrix, { pages: ['home'], states: ['composer'] }), /no reachable/);
});
test('style comparison detects pseudo changes, missing and inserted elements', () => {
  const a = [['/html[1]', 'a'], ['/html[1]/body[1]::before', 'b'], ['/gone', 'z']];
  const b = [['/html[1]', 'a'], ['/html[1]/body[1]::before', 'c'], ['/new', 'z']];
  assert.deepEqual(differingPaths(a, b), ['/html[1]/body[1]::before', '/gone', '/new']);
});
test('Blob identities preserve bytes/MIME/fragments and reject untracked resources', () => {
  const a = { 'blob:null/a': 'blob:pm7-sha256:abc;type=image%2Fpng' }, b = { 'blob:null/b': a['blob:null/a'] };
  assert.equal(normalizeBlobValue('url("blob:null/a#filter")', a), normalizeBlobValue('url("blob:null/b#filter")', b));
  assert.notEqual(normalizeBlobValue('url("blob:null/a")', a), normalizeBlobValue('url("blob:null/b")', { 'blob:null/b': 'blob:pm7-sha256:def;type=image%2Fpng' }));
  assert.equal(normalizeBlobValue('"blob:null/a"', a), '"blob:null/a"');
  assert.equal(normalizeBlobValue('"url(blob:null/a)"', a), '"url(blob:null/a)"');
  assert.throws(() => normalizeBlobValue('url("blob:null/missing")', a), /Untracked Blob/);
});
