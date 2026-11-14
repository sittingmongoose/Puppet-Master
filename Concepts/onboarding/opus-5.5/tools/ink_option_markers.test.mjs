// Run the real counted-option builder; compare its <small> with the three rewritten CSS arms.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read = p => readFileSync(new URL('../../../home-redesign/src/panels/' + p, import.meta.url), 'utf8');
const js = read('js/27-frames.js'), css = read('css/45-frames.css');
const source = js.match(/frames\.seg = function[^]*?\n};/)[0];
const h = (tag, attrs, children = []) => ({ tag, attrs, children,
 classList: { contains: c => (attrs.class || '').split(/\s+/).includes(c) },
 appendChild(child) { this.children.push(child); }, addEventListener() {},
 getAttribute(k) { return this.attrs[k]; }, setAttribute(k, v) { this.attrs[k] = v; }
});
const ctx = vm.createContext({ h, frames: { ink: () => ({}) }, segHandoff: null });
vm.runInContext(source, ctx);
const row = vm.runInContext("frames.seg([{value:'one', label:'One', count:3}, {value:'two', label:'Two'}], 'one', () => {})", ctx);
const count = row.children[0].children.find(e => e.tag === 'small');
assert.ok(count, 'the real optional count arm is exercised');
const markers = [...css.matchAll(/^.*\.pmw-ink-opt.*:where\(\.([\w-]+)\):is\(small\)/gm)].map(m => m[1]);
assert.equal(markers.length, 3, 'native, Retro and NieR count arms');
for (const marker of markers) assert.ok((count.attrs.class || '').split(/\s+/).includes(marker), `frames.seg count lacks the CSS arm's .${marker}`);
assert.equal(row.children[1].children.some(e => e.tag === 'small'), false, 'an uncounted option stays uncounted');
console.log('PASS real frames.seg count matches all three class-keyed small arms');
