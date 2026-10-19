/* node coverage_summary.mjs <page.html> <union.json> <out-prefix>
 * Requires css-tree, acorn and acorn-walk (PM7_ANALYSIS_MODULES may name their node_modules).
 * Reports UTF-8 bytes separately from Chrome/AST UTF-16 offsets. Absence is unobserved,
 * never a dead-code claim. The JSON includes every static CSS rule and JS function.
 */
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(process.env.PM7_ANALYSIS_MODULES ? join(resolve(process.env.PM7_ANALYSIS_MODULES), '_coverage.cjs') : import.meta.url);
const css = require('css-tree'), acorn = require('acorn'), walk = require('acorn-walk');
const [pageArg, unionArg, outArg] = process.argv.slice(2);
const completeIdx = process.argv.indexOf('--complete-union');
const completeFile = completeIdx >= 0 ? resolve(process.argv[completeIdx + 1]) : null;
if (!outArg) throw Error('usage: coverage_summary.mjs <page.html> <union.json> <out-prefix>');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const pageFile = resolve(pageArg), unionFile = resolve(unionArg), out = resolve(outArg);
const bytes = readFileSync(pageFile), html = bytes.toString('utf8'), union = JSON.parse(readFileSync(unionFile, 'utf8'));
const hash = (s) => createHash('sha256').update(s).digest('hex');
const len = (s) => Buffer.byteLength(s);
const rel = (p) => relative(root, p).split('\\').join('/');
const base = resolve(root, 'Concepts/onboarding/opus-5.5/base');
const manifest = JSON.parse(readFileSync(join(base, 'manifest.json'))).blocks;

function splitBlocks(page) {
  const blocks = []; let i = 0;
  const re = /<!--|<(style|script)\b([^>]*)>/gi;
  while (true) {
    re.lastIndex = i; const m = re.exec(page); if (!m) break;
    if (m[0] === '<!--') { const e = page.indexOf('-->', m.index + 4); i = e < 0 ? page.length : e + 3; continue; }
    const kind = m[1].toLowerCase(), start = m.index + m[0].length;
    const close = new RegExp('</' + kind + '\\s*>', 'gi'); close.lastIndex = start;
    const end = close.exec(page); if (!end) throw Error('unclosed ' + kind);
    blocks.push({ kind, id: /\bid=["']([^"']+)["']/.exec(m[2])?.[1] || kind + '@' + m.index,
      type: /\btype=["']([^"']+)["']/.exec(m[2])?.[1] || '', start, end: end.index, text: page.slice(start, end.index) });
    i = end.index + end[0].length;
  }
  return blocks;
}

function sources(b) {
  const found = new Set();
  const old = manifest.find((m) => m.tag === b.kind && m.id === b.id);
  if (old) found.add(rel(resolve(base, old.file)));
  if (!old && /^(style|script)@/.test(b.id)) {
    for (const m of manifest.filter((m) => m.tag === b.kind && !m.id)) {
      const f = resolve(base, m.file), t = readFileSync(f, 'utf8').trim();
      if (b.text.includes(t.slice(0, 120))) found.add(rel(f));
    }
  }
  const packages = [
    ['pm-o55-', 'Concepts/onboarding/opus-5.5/src'], ['pm-rail-', 'Concepts/leftrail-redesign/src'],
    ['pm-home-', 'Concepts/home-redesign/src'], ['pm-usage-', 'Concepts/usage-redesign/src'],
    ['pm-glyph-', 'Concepts/glyph-system/opus-5.5'], ['lg-', 'Concepts/liquid-glass/opus-5.5'],
    ['wpk-', 'Concepts/wallpapers/opus-5.5'],
  ];
  const owner = packages.find(([prefix]) => b.id.startsWith(prefix))?.[1];
  const roots = owner ? [owner, owner + '/src'] : [];
  if (['pm4-settings-js', 'pm51-settings-refresh'].includes(b.id)) roots.push('Concepts/onboarding/opus-5.5/src/settings', 'Concepts/onboarding/opus-5.5/src/settings/managers');
  for (const m of b.text.matchAll(/\/\*\s*-{2,}\s*([^\n]*?\.(?:js|css|json))\s*-{2,}\s*\*\//g)) {
    for (const r of roots) { const f = resolve(root, r, m[1]); if (existsSync(f)) found.add(rel(f)); }
  }
  // Glyph assembly uses one-line comments relative to Concepts, without dashes.
  for (const m of b.text.matchAll(/^\/\* ([\w./ -]+\.(?:js|css)) \*\/$/gm)) {
    const f = resolve(root, 'Concepts', m[1]); if (existsSync(f)) found.add(rel(f));
  }
  const direct = {
    'lg-css': ['Concepts/liquid-glass/opus-5.5/src/glass.css'], 'lg-js': ['Concepts/liquid-glass/opus-5.5/src/glass.js'],
    'wpk-css': ['Concepts/wallpapers/opus-5.5/src/wallpapers.css'], 'wpk-js': ['Concepts/wallpapers/opus-5.5/src/wallpapers.js'],
    'pm4-settings-js': ['Concepts/onboarding/opus-5.5/src/settings/kit.js'],
    'pm51-settings-refresh': ['Concepts/onboarding/opus-5.5/src/settings/styles.css'],
    'pm7-settings-data': ['Plans/settings_inventory.json'],
  };
  for (const f of direct[b.id] || []) if (existsSync(resolve(root, f))) found.add(f);
  if (b.id === 'pm51-settings-refresh') found.delete('Concepts/onboarding/opus-5.5/base/style/pm51-settings-refresh.css');
  const generatedRail = 'Concepts/leftrail-redesign/src/concepts/d/d.css';
  if (found.delete(generatedRail)) {
    const folder = dirname(generatedRail);
    for (const f of readdirSync(resolve(root, folder)).filter((f) => f.endsWith('.src.css'))) found.add(folder + '/' + f);
  }
  const generators = {
    'pm4-settings-js': 'Concepts/onboarding/opus-5.5/tools/settings_layer.py',
    'pm51-settings-refresh': 'Concepts/onboarding/opus-5.5/tools/settings_layer.py',
    'lg-css': 'Concepts/liquid-glass/opus-5.5/tools/build_proto.py', 'lg-js': 'Concepts/liquid-glass/opus-5.5/tools/build_proto.py',
    'wpk-css': 'Concepts/wallpapers/opus-5.5/tools/build_walls.py', 'wpk-js': 'Concepts/wallpapers/opus-5.5/tools/build_walls.py',
    'pm-usage-ctx-css': 'Concepts/usage-redesign/tools/usage_layer.py',
  };
  if (generators[b.id]) found.add(generators[b.id]);
  return [...found].sort();
}

const blocks = splitBlocks(html), rules = [], functions = [], rows = [], errors = [];
const matchedCss = new Set(), matchedJs = new Set();
for (const b of blocks) {
  const digest = hash(b.text).slice(0, 16), sourceFiles = sources(b);
  const row = { block: b.id, kind: b.kind, type: b.type, hash: digest, page_startOffset: b.start, page_endOffset: b.end,
    units: b.text.length, bytes: len(b.text), source_files: sourceFiles, used_bytes: 0, unused_bytes: 0, unmeasured_bytes: len(b.text) };
  if (b.kind === 'style') {
    const coverage = union.css.filter((r) => r.sheet === digest);
    const sheetObserved = coverage.length > 0 || (union.stylesheets || []).some((s) => s.sheet === digest && s.installed);
    if (sheetObserved) matchedCss.add(digest);
    const byOffset = new Map(coverage.map((r) => [r.startOffset + ':' + r.endOffset, r]));
    let ast;
    try { ast = css.parse(b.text, { positions: true, parseValue: false, parseCustomProperty: false, onParseError: (e) => errors.push({ block: b.id, type: 'css-recovery', message: e.message }) }); }
    catch (e) { errors.push({ block: b.id, type: 'css', message: e.message }); rows.push(row); continue; }
    const found = [];
    css.walk(ast, { visit: 'Rule', enter(node) {
      if (node.prelude?.type !== 'SelectorList') return; // @font-face/keyframe entries are not style-rule usage.
      const startOffset = node.loc.start.offset, endOffset = node.loc.end.offset;
      const sample = byOffset.get(startOffset + ':' + endOffset);
      const touching = coverage.filter((r) => r.used && r.startOffset < endOffset && r.endOffset > startOffset);
      const rule = { block: b.id, sheet: digest, startOffset, endOffset,
        rule_hash: hash(b.text.slice(startOffset, endOffset)).slice(0, 16),
        selector: b.text.slice(node.prelude.loc.start.offset, node.prelude.loc.end.offset),
        bytes: len(b.text.slice(startOffset, endOffset)), used: !!sample?.used || touching.length > 0,
        observed: !!sample, sheet_observed: sheetObserved, conservative_overlap: !sample?.used && touching.length > 0 };
      found.push(rule); rules.push(rule);
    } });
    row.rules_total = found.length; row.rules_used = found.filter((r) => r.used).length;
    row.rules_unused = found.length - row.rules_used; row.rules_observed = found.filter((r) => r.observed).length;
    row.rule_bytes = found.reduce((n, r) => n + r.bytes, 0);
    row.used_bytes = found.filter((r) => r.used).reduce((n, r) => n + r.bytes, 0);
    row.unused_bytes = found.filter((r) => !r.used && r.sheet_observed).reduce((n, r) => n + r.bytes, 0);
    row.unmeasured_bytes = row.bytes - row.used_bytes - row.unused_bytes;
    row.cdp_rules = coverage.length;
    row.unmatched_cdp_rules = coverage.filter((r) => !found.some((s) => r.startOffset === s.startOffset && r.endOffset === s.endOffset)).length;
  } else if (!/json/i.test(b.type)) {
    const coverage = union.js.find((s) => s.script === digest);
    if (coverage) matchedJs.add(digest);
    row.observed = !!coverage;
    const used = coverage?.usedRanges;
    if (coverage && !used) throw Error('union lacks per-sample usedRanges; rerun with the updated collector');
    row.used_bytes = (used || []).reduce((n, r) => n + len(b.text.slice(r.startOffset, r.endOffset)), 0);
    row.unused_bytes = coverage ? row.bytes - row.used_bytes : 0;
    row.unmeasured_bytes = coverage ? 0 : row.bytes;
    let ast;
    try { ast = acorn.parse(b.text, { ecmaVersion: 'latest', sourceType: b.type === 'module' ? 'module' : 'script', allowReturnOutsideFunction: true }); }
    catch (e) { errors.push({ block: b.id, type: 'js', message: e.message }); }
    const seen = new Set();
    const v8 = (coverage?.functions || []).filter((fn) => !fn.union_projection);
    if (ast) walk.fullAncestor(ast, (node, _state, ancestors) => {
      if (!['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) return;
      const parent = ancestors.at(-2);
      const match = v8.find((fn) => fn.ranges[0]?.endOffset === node.end && Math.abs(fn.ranges[0].startOffset - node.start) < 80);
      if (match) seen.add(match);
      const name = match?.functionName || node.id?.name || (parent?.type === 'VariableDeclarator' ? parent.id.name : parent?.type === 'Property' || parent?.type === 'MethodDefinition' ? parent.key.name || parent.key.value : '') || '';
      functions.push({ block: b.id, script: digest, startOffset: node.start, endOffset: node.end, name,
        observed: !!match, count: match?.ranges[0]?.count ?? (coverage ? 0 : null),
        count_basis: match ? 'CDP' : coverage ? 'static function absent from observed script coverage' : 'unobserved script',
        v8_startOffset: match?.ranges[0]?.startOffset ?? null, v8_endOffset: match?.ranges[0]?.endOffset ?? null });
    });
    for (const fn of v8.filter((f) => !seen.has(f))) {
      const r = fn.ranges[0]; if (!r) continue;
      functions.push({ block: b.id, script: digest, startOffset: r.startOffset, endOffset: r.endOffset,
        name: fn.functionName, count: r.count, observed: true, v8_only: true, script_root: r.startOffset === 0 && r.endOffset === b.text.length });
    }
    const fs = functions.filter((f) => f.block === b.id && !f.script_root);
    row.functions_total = fs.length; row.functions_used = fs.filter((f) => f.count > 0).length;
    row.functions_unobserved = fs.filter((f) => !f.observed).length;
  } else row.executable = false;
  rows.push(row);
}
const sum = (kind, key) => rows.filter((r) => r.kind === kind && r.executable !== false).reduce((n, r) => n + (r[key] || 0), 0);
const report = { page: rel(pageFile), page_sha256: hash(bytes), union: unionFile, union_sha256: hash(readFileSync(unionFile)),
  offset_units: 'UTF-16 code units, relative to block body; bytes are UTF-8',
  caveats: ['Unused means not touched in these runs; it is not proof of dead code.', 'Unobserved CSS rules/functions are distinguished from explicit zero counts.', 'CSS used bytes count matched style-rule spans; fonts, keyframes, at-rules and whitespace are outside that metric.', 'JS usedRanges resolve nested zero ranges in each sample before taking the union.', 'Function counts sum samples, not independent users or test cases.'],
  totals: { css_rules_used: sum('style', 'rules_used'), css_rules_total: sum('style', 'rules_total'), css_bytes: sum('style', 'bytes'), css_used_bytes: sum('style', 'used_bytes'), css_unused_bytes: sum('style', 'unused_bytes'), css_unmeasured_bytes: sum('style', 'unmeasured_bytes'),
    js_bytes: sum('script', 'bytes'), js_used_bytes: sum('script', 'used_bytes'), js_unused_bytes: sum('script', 'unused_bytes'), js_unmeasured_bytes: sum('script', 'unmeasured_bytes'), js_functions: sum('script', 'functions_total'), js_functions_used: sum('script', 'functions_used') },
  blocks: rows, css_rules: rules, js_functions: functions, errors,
  runtime_css: [...new Set(union.css.filter((r) => !matchedCss.has(r.sheet)).map((r) => r.sheet))],
  runtime_js: union.js.filter((s) => !matchedJs.has(s.script)).map((s) => ({ script: s.script, url: s.url, functions: s.functions.length })) };
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out + '.json', JSON.stringify(report, null, 2) + '\n');
const md = ['# Coverage by page block', '', '`' + report.page + '`', '', 'Page SHA-256: `' + report.page_sha256 + '`', 'Union SHA-256: `' + report.union_sha256 + '`', '', ...report.caveats.map((s) => '- ' + s), '',
  '| Block | Kind | Used bytes | Unused bytes | Unmeasured bytes | Rules used/total | Functions used/total |', '|---|---|---:|---:|---:|---:|---:|',
  ...rows.map((r) => `| ${r.block} | ${r.executable === false ? 'data' : r.kind} | ${r.used_bytes} | ${r.unused_bytes} | ${r.unmeasured_bytes} | ${r.rules_total == null ? '' : r.rules_used + '/' + r.rules_total} | ${r.functions_total == null ? '' : r.functions_used + '/' + r.functions_total} |`), '',
  'Totals: `' + JSON.stringify(report.totals) + '`', '', 'Full selectors, function counts, UTF-16 offsets and live source paths are in the companion JSON.', '', '## Live source files', '',
  ...rows.map((r) => '- **' + r.block + '**: ' + (r.source_files.map((s) => '`' + s + '`').join(', ') || 'Unmapped; inspect with scripts/pm7-where.py.')), '', 'Parse/recovery notices: ' + errors.length, ''];
writeFileSync(out + '.md', md.join('\n'));
if (completeFile) {
  // Complete only observed content hashes. An entirely missing script/sheet remains
  // unknown; a census never invents a successful load of an unrecorded block.
  const entries = new Map(union.css.map((r) => [r.sheet + ':' + r.startOffset + ':' + r.endOffset, r]));
  for (const r of rules.filter((r) => r.sheet_observed)) {
    const key = r.sheet + ':' + r.startOffset + ':' + r.endOffset;
    const previous = entries.get(key);
    entries.set(key, { ...previous, sheet: r.sheet, startOffset: r.startOffset, endOffset: r.endOffset,
      used: !!previous?.used || r.used, block: r.block, rule_hash: r.rule_hash, census: true });
  }
  union.css = [...entries.values()];
  for (const script of union.js) {
    const block = rows.find((r) => r.kind === 'script' && r.hash === script.script);
    if (!block) continue;
    const missing = functions.filter((f) => f.script === script.script && !f.observed && f.count === 0);
    script.functions.push(...missing.map((f) => ({ functionName: f.name, isBlockCoverage: false, census: true,
      ranges: [{ startOffset: f.startOffset, endOffset: f.endOffset, count: 0 }] })));
    // The legacy v2 join reads functions/ranges, not usedRanges. Split an extra
    // projection at *all* boundaries so its byte union wins over a stale nested
    // zero from another sample. Native function counts remain untouched.
    const used = script.usedRanges || [];
    const points = [...new Set([0, block.units, ...script.functions.flatMap((f) => f.ranges.flatMap((r) => [r.startOffset, r.endOffset])), ...used.flatMap((r) => [r.startOffset, r.endOffset])])].sort((a, b) => a - b);
    const ranges = [];
    let j = 0;
    for (let i = 1; i < points.length; i++) {
      const startOffset = points[i - 1], endOffset = points[i];
      while (j < used.length && used[j].endOffset <= startOffset) j++;
      const count = used[j] && used[j].startOffset <= startOffset && used[j].endOffset >= endOffset ? 1 : 0;
      ranges.push({ startOffset, endOffset, count });
    }
    script.functions.push({ functionName: '[coverage-union-bytes]', isBlockCoverage: true, union_projection: true, ranges });
  }
  union.census = { page: report.page, page_sha256: report.page_sha256, raw_union_sha256: report.union_sha256,
    offset_units: report.offset_units, style_rules: rules.length, js_functions: functions.filter((f) => !f.script_root).length,
    policy: 'Static census completes only observed content hashes; union_projection is a touched-byte projection, not a function invocation count.' };
  mkdirSync(dirname(completeFile), { recursive: true });
  writeFileSync(completeFile, JSON.stringify(union) + '\n');
}
console.log(JSON.stringify({ output: out, totals: report.totals, blocks: rows.length, errors: errors.length, unmapped: rows.filter((r) => !r.source_files.length).map((r) => r.block) }));
