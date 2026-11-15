// rail_expanded_states.mjs's bundleMismatch (PM7PERF-CENSUS-FORCING, R27 F5): the expanded census refuses a review
// bundle made from another commit than the page it judges. No browser.
// node rail_expanded_bundle.selftest.mjs <built page.html> <bundle.json from rail_expanded_prep.py at the page's commit>
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { bundleMismatch } from './rail_expanded_states.mjs';

const [pagePath, bundlePath] = process.argv.slice(2);
assert.ok(pagePath && bundlePath, 'usage: node rail_expanded_bundle.selftest.mjs <built page.html> <bundle.json>');
const page = readFileSync(pagePath, 'utf8');
const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
assert.deepEqual(Object.keys(bundle.shared).sort(), ['00-core.js', '20-menu.js', '30-host.js', '90-boot.js']);
assert.deepEqual(bundleMismatch(bundle, page), [], 'a bundle made at the page\'s commit matches it');
// the same bundle with the rail menu as it was before a96ee82140 (P3/P5, a commit that changed it) does not
const older = execFileSync('git', ['show', 'a96ee82140^:Concepts/leftrail-redesign/src/js/20-menu.js'], { encoding: 'utf8' });
assert.notEqual(older.trim(), bundle.shared['20-menu.js'].trim(), 'the older menu differs');
assert.deepEqual(bundleMismatch({ ...bundle, shared: { ...bundle.shared, '20-menu.js': older } }, page), ['20-menu.js differs from the page']);
// a bundle with no record proves nothing
assert.equal(bundleMismatch({ head: bundle.head }, page).length, 1);
assert.equal(bundleMismatch({ head: bundle.head, shared: {} }, page).length, 1);
console.log(`PASS the bundle (head ${bundle.head.slice(0, 10)}) matches the page by its four shared rail modules; a bundle with another commit's menu, or none recorded, is refused`);
