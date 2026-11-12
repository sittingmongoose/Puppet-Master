// F1: evaluate the real renderer. The element that moves must own both acts;
// CSS selects the entrance for nx-still and the loop for a normal status mark.
// No browser. Run: node tests/working-bead-verify.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../neon-icons.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../neon-icons.css', import.meta.url), 'utf8');
let failed = 0;
for (const variant of ['basic', 'nier']) {
	let acts = '';
	const window = {};
	const document = {
		createElement: () => ({ textContent: '' }),
		head: { appendChild: (e) => { Object.defineProperty(e, 'textContent', { get: () => acts, set: (v) => { acts = v; } }); } },
		documentElement: { getAttribute: (k) => k === 'data-o55-nier' && variant === 'nier' ? 'on' : null }
	};
	vm.runInNewContext(src, { window, document });
	assert.ok(window.PM56_NEON, window.PM56_NEON_ERROR);
	for (const still of [false, true]) {
		try {
			const html = window.PM56_NEON.status('working', 14, still ? 'nx-still' : '');
			// On main the moving element is the inner group; the optimized renderer moves its SVG.
			const tags = [...html.matchAll(/<(svg|g)\b([^>]*)>/g)].map((m) => ({ tag: m[1], attrs: m[2] }));
			const moving = tags.find((e) => /\bnx-st-spin\b/.test(e.attrs)) || tags.find((e) => /\bnx-p\b/.test(e.attrs));
			assert.ok(moving, 'a moving element exists');
			for (const [prop, name] of [['--k1', 'nx-st-working-0A'], ['--kl', 'nx-st-working-0L']]) {
				assert.ok(moving.attrs.includes(`${prop}:${name}`), `${moving.tag} owns ${prop}:${name}: ${moving.attrs}`);
				assert.ok(acts.includes(`@keyframes ${name}{`), `${name} is generated`);
			}
			assert.equal(/\bnx-still\b/.test(html), still);
			assert.match(css, /\.nx-st\.nx-still \.nx-p\s*\{ animation: var\(--k1\) var\(--nx-d1\) var\(--nx-ease\) backwards;/);
			assert.match(css, /\.nx-st-working \.nx-p\s*\{ animation: var\(--kl\) 9000ms var\(--nx-le\) infinite;/);
			console.log(`PASS ${variant} ${still ? 'still entrance' : 'normal loop'}: ${moving.tag} owns both acts`);
		} catch (e) { failed++; console.log(`FAIL ${variant} ${still ? 'still entrance' : 'normal loop'}: ${e.message}`); }
	}
}
console.log(`${4 - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
