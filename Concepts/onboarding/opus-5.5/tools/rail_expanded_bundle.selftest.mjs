// rail_expanded_states.mjs's bundleMismatch (PM7PERF-CENSUS-FORCING, R27 F5, R54 F3): the expanded census refuses a
// review bundle made from another commit than the page it judges, and one that does not record all four shared rail
// modules with text. No browser.
// node rail_expanded_bundle.selftest.mjs [--states=<a rail_expanded_states.mjs in this folder>]
//   the constructed cases only: a page made of the four real modules from Concepts/leftrail-redesign/src/js
// node rail_expanded_bundle.selftest.mjs <built page.html> <bundle.json from rail_expanded_prep.py at the page's commit>
//   also the built page and its bundle
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const states = process.argv.find((x) => x.startsWith('--states='))?.slice(9);
const { bundleMismatch } = await import(states ? pathToFileURL(resolve(states)).href : './rail_expanded_states.mjs');
const FOUR = ['00-core.js', '20-menu.js', '30-host.js', '90-boot.js'];
// R54 F3: constructed from the four real modules, wrapped as a page carries them
const real = Object.fromEntries(FOUR.map((n) => [n, readFileSync(new URL('../../../leftrail-redesign/src/js/' + n, import.meta.url), 'utf8')]));
const made = '<html><script>\n' + FOUR.map((n) => real[n]).join('\n') + '\n</script></html>';
assert.deepEqual(bundleMismatch({ head: 'x', shared: real }, made), [], 'all four real modules in the page: no mismatch');
assert.ok(bundleMismatch({ head: 'x', shared: { '00-core.js': real['00-core.js'] } }, made).length >= 3, 'only 00-core recorded: the other three are unproven');
assert.ok(bundleMismatch({ head: 'unrelated', shared: { '00-core.js': ' ' } }, '<html>wrong build</html>').length > 0, 'a blank entry proves nothing (R54\'s input)');
assert.deepEqual(bundleMismatch({ head: 'x', shared: { ...real, '30-host.js': '' } }, made), ['30-host.js is not recorded in the bundle (rebuild it with rail_expanded_prep.py)']);
assert.deepEqual(bundleMismatch({ head: 'x', shared: { ...real, '99-extra.js': 'x' } }, made), ['99-extra.js is not one of the shared rail modules']);
assert.deepEqual(bundleMismatch({ head: 'x', shared: { ...real, '20-menu.js': real['20-menu.js'] + '\n// changed' } }, made), ['20-menu.js differs from the page']);
const args = process.argv.slice(2).filter((x) => !x.startsWith('--'));
if (!args.length) { console.log('PASS bundleMismatch refuses a partial record, a blank or extra module and a changed one, and passes the four real modules (constructed; give a built page and its bundle for the full test)'); process.exit(0); }

const [pagePath, bundlePath] = args;
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
