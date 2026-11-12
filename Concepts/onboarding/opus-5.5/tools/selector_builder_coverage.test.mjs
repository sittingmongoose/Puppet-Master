// Builder coverage: execute real Settings/project/chat/Jujutsu builders and read the real base shell with its rail
// decorators, then compare their HTML descendants with each
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
  const parent = stack.at(-1), node = { tag, classes, parent, children: [], attrs: m[2], svg: tag === 'svg' || parent.svg };
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
 return cut < 0 ? ['', s] : [s.slice(0, cut).trim(), s.slice(cut + 1)];
};
const state = new Set(['active', 'selected', 'is-active', 'is-current', 'is-selected', 'o55np-cur-over', 'pmh-on']);
const classesOf = (s) => [...s.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
const descendants = (node) => node.children.flatMap((child) => [child, ...descendants(child)]);
// Exercise the real Jujutsu strip and fallback icon builders too. The DOM shim serialises the builder's own
// tag/class arguments; it supplies no marker names. Operation Log takes the real JJ_SVG fallback.
const jj = read('../../../leftrail-redesign/src/concepts/d/15-jj.js');
const decl = (name) => { const m = jj.match(new RegExp('const ' + name + ' = [^]*?;')); assert.ok(m, name); return m[0]; };
const jjFn = (name) => { const m = jj.match(new RegExp('function ' + name + '\\([^]*?\\n}')); assert.ok(m, name); return m[0]; };
const h = (tag, attrs, ...kids) => ({
 tag, attrs, kids, innerHTML: '', addEventListener() {},
 toString() { const cls = [attrs.class || []].flat().filter(Boolean).join(' '); return `<${tag} class="${cls}">${this.innerHTML}${kids.flat(Infinity).filter(Boolean).join('')}</${tag}>`; }
});
const jjCtx = vm.createContext({ window: {}, PMR: { h, hover() {}, neonMap: {} } });
vm.runInContext(decl('JJ_SIZE') + '\n' + decl('JJ_TABS') + '\n' + decl('JJ_SVG') + '\nconst jh = (spec, attrs, ...kids) => PMR.h(spec, attrs, ...kids);\n' + jjFn('jjIco') + '\n' + jjFn('jjBuildStrip'), jjCtx);
const samples = [false, true].map((home) => { ctx.state.home = home; return { name: 'renderDomainRail', html: vm.runInContext('renderDomainRail(D.domains[0])', ctx), svgRoots: false }; });
samples.push({ name: 'jjBuildStrip/jjIco', html: String(vm.runInContext('jjBuildStrip()', jjCtx)), svgRoots: true });
const projects = read('../base/script/pm6-js-panels.js');
const projectFn = name => { const m = projects.match(new RegExp('  function '+name+'\\([^]*?\\n  }')); assert.ok(m,name); return m[0]; };
const projectCtx = vm.createContext({ window: {PMG:{calm:()=>''}}, projectInfo:()=>({id:'fixture',name:'Project'}), projectState:()=>({key:'waiting'}), projectWhere:()=>'/fixture', PROJECT_STATES:{waiting:{word:'Waiting'}}, projectEsc:String, projectMonogram:()=> 'P', projectIcon:()=>'', item:{classList:{contains:()=>false},setAttribute(){},removeAttribute(){}} });
vm.runInContext(projectFn('renderProjectRow')+'\n'+projectFn('renderProjectAll'),projectCtx);
vm.runInContext('renderProjectRow(item)',projectCtx);
samples.push({name:'renderProjectRow',html:'<button class="pm6-tb-menu-item">'+projectCtx.item.innerHTML+'</button>',svgRoots:false});
vm.runInContext("delete item.__pmProjectRow; renderProjectAll(item)",projectCtx);
samples.push({name:'renderProjectAll',html:'<button class="pm6-tb-menu-item">'+projectCtx.item.innerHTML+'</button>',svgRoots:false});
const chat = read('../base/script/pm6-js-chat.js');
const actions = chat.match(/  function headerActionsHtml\([^]*?\n  }/)[0];
const chatCtx = vm.createContext({SVG:{more:'',layout:'',close:'',duplicate:'',archive:'',popout:''}});
vm.runInContext(actions,chatCtx);
for (const mode of ['floating','docked']) samples.push({name:'headerActionsHtml '+mode,html:vm.runInContext('headerActionsHtml({actions:"'+mode+'"})',chatCtx),svgRoots:false});
const shell = { name: 'base/shell.html', html: read('../base/shell.html'), svgRoots: false, decorate: true };
samples.push(shell);
const railSources = ['10-skin.js','51-search.js','52-run.js'].map(p => read('../../../leftrail-redesign/src/concepts/d/'+p)).join('\n');
const rowSelectors = [...railSources.matchAll(/const (?:ROW_SEL|SRCH_ROWS|RDP_ROWS) = '([^']+)'/g)].flatMap(m => m[1].split(','));
const artifact = read('../../../leftrail-redesign/src/concepts/d/54-artifacts.js');
const testing = read('../../../leftrail-redesign/src/concepts/d/55-testing.js');
rowSelectors.push(...artifact.match(/LANE_E\.cursor\(panel, '([^']+)'/)[1].split(','), testing.match(/const head = run\.querySelector\('([^']+)'/)[1]);
const simple = (node, sel) => {
 if (!node || node.tag === 'root') return false;
 const not = [...sel.matchAll(/:not\(([^()]*)\)/g)].map(m => m[1]);
 if (not.some(s => simple(node,s))) return false;
 sel = sel.replace(/:not\([^()]*\)/g,'').replace(':scope','');
 if (!classesOf(sel).every(c => node.classes.includes(c))) return false;
 const id = /#([\w-]+)/.exec(sel); if (id && !new RegExp('\\bid="'+id[1]+'"').test(node.attrs)) return false;
 return [...sel.matchAll(/\[([\w-]+)\]/g)].every(m => new RegExp('(?:^|\\s)'+m[1]+'(?:[=\\s]|$)').test(node.attrs));
};
const rowMatch = (node, sel) => {
 const [left, comp] = last(sel.trim()); if (!simple(node,comp)) return false;
 if (!left || left === ':scope >') return true;
 if (left.endsWith('>')) return simple(node.parent,last(left.slice(0,-1).trim())[1]);
 let parent=node.parent; while(parent) { if(simple(parent,last(left)[1])) return true; parent=parent.parent; } return false;
};
const only = process.argv.find((x) => x.startsWith('--rule='))?.split('=')[1];
const failures = new Set(), coverage = {};
for (const sample of samples) {
 const nodes = parse(sample.html);
 if (sample.decorate) for (const n of nodes) if (rowSelectors.some(sel => rowMatch(n,sel))) n.classes.push('pmr-cur');
 for (const rule of rules.filter((r) => only === undefined || String(r.rule) === only)) for (const variant of rule.variants || [rule]) {
  const prefix = variant.original.replace(/\s+(?:\*|:where\(\*\))$/, '').replace(/\s*>$/, '');
  if (!rule.omit) assert.equal(variant.replacement.replace(/\s+:where\([^()]*\)$/, '').replace(/\s*>$/, ''), prefix, `rule ${rule.rule}: descendant rewrite must preserve its carrier`);
  if (sample.decorate && ![0,1,3,6,7,8,10,12,13,14].includes(rule.rule)) continue;
  const [left, compound] = last(prefix);
  let carriers = classesOf(compound.replace(/:not\([^()]*\)/g, '')).filter((c) => !state.has(c));
  if (sample.decorate && rule.rule === 0) carriers = ['fm-row','pm6-dash-catalog-item','pm6-tb-menu-item','pm6-chat-more-item'];
  if (sample.decorate && rule.rule === 1) carriers = ['project-dropdown','theme-select','fm-tbtn'];
  if (sample.decorate && rule.rule === 6) carriers = ['fm-row','pm6-tb-menu-item'];
  const directParent = left.endsWith('>') ? classesOf(last(left.slice(0, -1).trim())[1]).filter((c) => !state.has(c)) : null;
  const allowed = new Set(classesOf(variant.replacement?.match(/:where\(([^()]*)\)$/)?.[1] || ''));
  for (const node of nodes.filter((n) => n.classes.some((c) => carriers.includes(c)) && (!directParent || n.parent.classes.some((c) => directParent.includes(c))))) {
   for (const child of (variant.original.endsWith('> *') ? node.children : descendants(node)).filter((n) => !n.svg || (sample.svgRoots && n.tag === 'svg'))) {
    coverage[rule.rule] = (coverage[rule.rule] || 0) + 1;
    if (rule.omit || !child.classes.some((c) => allowed.has(c))) failures.add(`rule ${rule.rule}: ${child.tag}${child.classes.length ? '.' + child.classes.join('.') : ' [no marker]'} from ${sample.name} is no longer matched`);
   }
  }
 }
}
assert.ok(coverage[only ?? 0] > 0, 'the requested rule must exercise real builder descendants');
console.log('Real builder coverage: ' + JSON.stringify(coverage));
for (const message of failures) console.log('FAIL ' + message);
assert.equal(failures.size, 0, `${failures.size} dropped rule/element pairs from the real builder`);
console.log('PASS JSON allow-lists cover real Settings, project, chat, shell and decorated rail builders');
