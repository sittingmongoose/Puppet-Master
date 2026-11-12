// Exercise the actual observer with a population that changes after the toggle, including SVG and pseudo parts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(process.argv[2] || new URL('../checks/perf-still-page.check.mjs', import.meta.url), 'utf8');
const start = source.indexOf('const MARKER ='), end = source.indexOf('// Until no finite', start);
assert.ok(start >= 0 && end > start);
const element = (tagName, cls, parts) => ({ tagName, className: cls, getAttribute: () => parts, getAnimations() { throw new Error('style read inside toggle observer'); } });
const elements = [element('SPAN', 'icon', 'self'), element('g', { baseVal: 'pml-fr pml-fr0' }, 'self'), element('SPAN', 'two-parts', 'before after')];
const catalog = new Map(elements.map((e, i) => [e, i === 2 ? [{ part: 'before', name: 'pulse', iterations: 'infinite' }, { part: 'after', name: 'spin', iterations: 'infinite' }] : [{ part: 'self', name: i ? 'pml-flip4' : 'spin', iterations: 'infinite' }]]));
const order = []; let observer, on = true;
const window = { __stillCatalog: catalog };
const context = vm.createContext({ window,
 document: { documentElement: { hasAttribute: () => on }, querySelectorAll: () => { order.push('attributes'); return elements; } },
 performance: { mark: (x) => order.push(x) },
 MutationObserver: class { constructor(fn) { observer = fn; } observe() {} }
});
vm.runInContext(source.slice(start, end) + '\nMARKER();', context);
observer();
const population = window.__stillTogglePopulation;
assert.ok(population, 'the old observer did not capture the toggle population');
assert.equal(population.marks, 3, 'count unique marked elements, not four animation parts');
assert.equal(population.held, 4);
assert.equal(order[0], 'pm-still:on', 'the timing mark precedes inspection');
assert.equal(population.marked[1].parts[0].animations[0].name, 'pml-flip4');
elements.push(element('SPAN', 'late-element', 'self'));
assert.equal(population.marks, 3, 'later DOM changes cannot inflate the measured toggle denominator');
assert.equal(population.marked.length, 3);
on = false; observer();
assert.equal(order.at(-1), 'pm-still:off');
assert.equal(window.__stillTogglePopulation.marks, 3);
on = true;
window.__stillToggleFinite = { usageFiniteCount: 8 };
elements[0].getAttribute = () => { throw new Error('population unavailable'); };
observer();
assert.equal(window.__stillTogglePopulation, null, 'a failed new snapshot must not reuse a previous toggle denominator');
assert.equal(window.__stillToggleFinite, null, 'a failed new snapshot must not reuse a previous finite-animation census');
console.log('PASS toggle population is captured at the mark without style reads; later DOM growth cannot inflate it');
