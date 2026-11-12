// Settings rail coverage: execute its real markup and icon builders, then compare their HTML descendants with each
// applicable JSON allow-list. No fixture carries a hand-kept marker list. SVG internals are hydrated by the icon
// pipeline; their coverage is audited separately from these HTML text parts.
// Run: node Concepts/onboarding/opus-5.5/tools/selector_builder_coverage.test.mjs [--rule=0]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const rules = JSON.parse(read('./active_descendant_rules.json')).rules;
const src = read('../base/script/pm4-settings-js.js');
const fn = (name) => { const m = src.match(new RegExp('  function ' + name + '\\([^]*?\\n  \\}')); assert.ok(m, `${name}: real builder found`); return m[0]; };
const icons = src.slice(src.indexOf('  const iconPaths = {'), src.indexOf('  function icon('));
assert.ok(icons.startsWith('  const iconPaths = {'));
const ctx = vm.createContext({ window: { O55ProviderSummary: () => 'fixture provider status' },
 D: { domains: [{ id: 'one', icon: 'home', label: 'One', summary: 'Summary one' }, { id: 'two', icon: 'brain', label: 'Two', summary: 'Summary two' }] },
 state: { home: false }, escapeHtml: (s) => String(s), projectDisplayName: () => 'Fixture' });
vm.runInContext(icons + '\n' + fn('icon') + '\n' + fn('renderDomainRail'), ctx);
const parse = (html) => {
 const root = { tag: 'root', classes: [], children: [] }, stack = [root], nodes = [];
 for (const m of html.matchAll(/<\/?([a-z][\w:-]*)\b([^>]*?)>/gi)) {
  const tag = m[1].toLowerCase();
  if (m[0][1] === '/') { while (stack.length > 1 && stack.pop().tag !== tag) {} continue; }
  const classes = /\bclass="([^"]*)"/.exec(m[2])?.[1].trim().split(/\s+/).filter(Boolean) || [];
  const parent = stack.at(-1), node = { tag, classes, parent, children: [], svg: tag === 'svg' || parent.svg };
  parent.children.push(node); nodes.push(node);
  if (!m[0].endsWith('/>') && !['input', 'br', 'img', 'hr', 'meta', 'link'].includes(tag)) stack.push(node);
 }
 return nodes;
};
// Rightmost compound, ignoring spaces inside functional selectors and quoted attributes.
const last = (s) => {
 let depth = 0, bracket = 0, quote = '', cut = -1;
 for (let i = 0; i < s.length; i++) {
  const c = s[i]; if (quote) { if (c === quote && s[i - 1] !== '\\') quote = ''; continue; }
  if (c === '"' || c === "'") { quote = c; continue; }
  if (c === '[') bracket++; else if (c === ']') bracket--;
  if (bracket) continue;
  if (c === '(') depth++; else if (c === ')') depth--;
  if (!depth && /\s/.test(c)) cut = i;
 }
 return [s.slice(0, cut).trim(), s.slice(cut + 1)];
};
const state = new Set(['active', 'selected', 'is-active', 'is-current', 'is-selected', 'o55np-cur-over', 'pmh-on']);
const classesOf = (s) => [...s.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
const descendants = (node) => node.children.flatMap((child) => [child, ...descendants(child)]);
const only = process.argv.find((x) => x.startsWith('--rule='))?.split('=')[1];
const failures = new Set(), coverage = {};
for (const home of [false, true]) {
 ctx.state.home = home;
 const nodes = parse(vm.runInContext('renderDomainRail(D.domains[0])', ctx));
 for (const rule of rules.filter((r) => only === undefined || String(r.rule) === only)) for (const variant of rule.variants || [rule]) {
  const prefix = variant.original.replace(/\s+(?:\*|:where\(\*\))$/, '').replace(/\s*>$/, '');
  if (!rule.omit) assert.equal(variant.replacement.replace(/\s+:where\([^()]*\)$/, '').replace(/\s*>$/, ''), prefix, `rule ${rule.rule}: descendant rewrite must preserve its carrier`);
  const [left, compound] = last(prefix);
  const carriers = classesOf(compound).filter((c) => !state.has(c));
  const directParent = left.endsWith('>') ? classesOf(last(left.slice(0, -1).trim())[1]).filter((c) => !state.has(c)) : null;
  const allowed = new Set(classesOf(variant.replacement?.match(/:where\(([^()]*)\)$/)?.[1] || ''));
  for (const node of nodes.filter((n) => n.classes.some((c) => carriers.includes(c)) && (!directParent || n.parent.classes.some((c) => directParent.includes(c))))) {
   for (const child of descendants(node).filter((n) => !n.svg)) {
    coverage[rule.rule] = (coverage[rule.rule] || 0) + 1;
    if (rule.omit || !child.classes.some((c) => allowed.has(c))) failures.add(`rule ${rule.rule}: ${child.tag}${child.classes.length ? '.' + child.classes.join('.') : ' [no marker]'} from renderDomainRail is no longer matched`);
   }
  }
 }
}
assert.ok(coverage[only ?? 0] > 0, 'the requested rule must exercise real builder descendants');
console.log('Real builder coverage: ' + JSON.stringify(coverage));
for (const message of failures) console.log('FAIL ' + message);
assert.equal(failures.size, 0, `${failures.size} dropped rule/element pairs from the real builder`);
console.log('PASS JSON allow-lists cover the real Settings rail text builders');
