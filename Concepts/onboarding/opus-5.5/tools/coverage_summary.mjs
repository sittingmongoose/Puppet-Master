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
import { unionRanges } from './coverage_union.mjs';

const require = createRequire(process.env.PM7_ANALYSIS_MODULES ? join(resolve(process.env.PM7_ANALYSIS_MODULES), '_coverage.cjs') : import.meta.url);
const css = require('css-tree'), acorn = require('acorn'), walk = require('acorn-walk');
const [pageArg, unionArg, outArg] = process.argv.slice(2);
const completeIdx = process.argv.indexOf('--complete-union');
const completeFile = completeIdx >= 0 ? resolve(process.argv[completeIdx + 1]) : null;
const receiptIdx = process.argv.indexOf('--provenance-receipt');
const receiptFile = receiptIdx >= 0 ? resolve(process.argv[receiptIdx + 1]) : null;
if (!outArg) throw Error('usage: coverage_summary.mjs <page.html> <union.json> <out-prefix>');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const pageFile = resolve(pageArg), unionFile = resolve(unionArg), out = resolve(outArg);
const bytes = readFileSync(pageFile), html = bytes.toString('utf8'), union = JSON.parse(readFileSync(unionFile, 'utf8'));
const hash = (s) => createHash('sha256').update(s).digest('hex');
const receiptBytes = receiptFile ? readFileSync(receiptFile) : null;
const receipt = receiptBytes ? JSON.parse(receiptBytes) : null;
const receiptEntry = receipt?.version === 1 && receipt.kind === 'pm7-coverage-per-sample-provenance'
  ? receipt.unions?.find((u) => u.path === unionFile && u.sha256 === hash(readFileSync(unionFile))
    && u.origin === 'union-of-input-usedRanges' && u.reconstructed_from_counters === false) : null;
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
const unresolvedJs = union.js.filter((s) => !/^[a-f0-9]{16}$/i.test(s.script));
const unresolvedUnbounded = unresolvedJs.some((s) => !Array.isArray(s.usedRanges) ||
  !(s.usedRangesProvenance === 'per-sample-v1' || receiptEntry?.script_hashes?.includes(s.script)));
const unresolvedCss = union.css.filter((r) => !/^[a-f0-9]{16}$/i.test(r.sheet) && r.used);
const unsampledNavigations = union.unsampled_navigations ?? null;
const clip = (ranges, end) => unionRanges(ranges.map((r) => ({ startOffset: Math.max(0, r.startOffset), endOffset: Math.min(end, r.endOffset) })));
function subtractRanges(ranges, cuts) {
  const result = [];
  for (const r of ranges) {
    let at = r.startOffset;
    for (const c of cuts) {
      if (c.endOffset <= at) continue;
      if (c.startOffset >= r.endOffset) break;
      if (c.startOffset > at) result.push({ startOffset: at, endOffset: c.startOffset });
      at = Math.max(at, c.endOffset); if (at >= r.endOffset) break;
    }
    if (at < r.endOffset) result.push({ startOffset: at, endOffset: r.endOffset });
  }
  return result;
}
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
      // css-tree gives from/to/percentage keyframe steps a SelectorList too.
      // Chrome RuleUsage does not measure them, including prefixed keyframes.
      if (node.prelude?.type !== 'SelectorList' || /keyframes$/i.test(this.atrule?.name || '')) return;
      const startOffset = node.loc.start.offset, endOffset = node.loc.end.offset;
      const sample = byOffset.get(startOffset + ':' + endOffset);
      const touching = coverage.filter((r) => r.used && r.startOffset < endOffset && r.endOffset > startOffset);
      const rule = { block: b.id, sheet: digest, startOffset, endOffset,
        rule_hash: hash(b.text.slice(startOffset, endOffset)).slice(0, 16),
        selector: b.text.slice(node.prelude.loc.start.offset, node.prelude.loc.end.offset),
        bytes: len(b.text.slice(startOffset, endOffset)), used: !!sample?.used || touching.length > 0,
        observed: !!sample, sheet_observed: sheetObserved, conservative_overlap: !sample?.used && touching.length > 0 };
      rule.unresolved_source_overlap = !rule.used && unresolvedCss.some((r) => r.startOffset < endOffset && r.endOffset > startOffset);
      rule.unsampled_navigation_gap = !rule.used && unsampledNavigations > 0;
      rule.navigation_unchecked = !rule.used && unsampledNavigations == null;
      rule.usage_state = rule.used ? 'used' : sheetObserved && !rule.unresolved_source_overlap && !rule.unsampled_navigation_gap && !rule.navigation_unchecked ? 'unused' : 'unknown';
      found.push(rule); rules.push(rule);
    } });
    row.rules_total = found.length; row.rules_used = found.filter((r) => r.used).length;
    row.rules_unused = found.filter((r) => r.usage_state === 'unused').length;
    row.rules_unmeasured = found.filter((r) => r.usage_state === 'unknown').length;
    row.rules_observed = found.filter((r) => r.observed).length;
    row.rule_bytes = found.reduce((n, r) => n + r.bytes, 0);
    row.used_bytes = found.filter((r) => r.used).reduce((n, r) => n + r.bytes, 0);
    row.unused_bytes = found.filter((r) => r.usage_state === 'unused').reduce((n, r) => n + r.bytes, 0);
    row.unmeasured_bytes = row.bytes - row.used_bytes - row.unused_bytes;
    row.cdp_rules = coverage.length;
    row.unmatched_cdp_rules = coverage.filter((r) => !found.some((s) => r.startOffset === s.startOffset && r.endOffset === s.endOffset)).length;
  } else if (!/json/i.test(b.type)) {
    const coverage = union.js.find((s) => s.script === digest);
    if (coverage) matchedJs.add(digest);
    row.observed = !!coverage;
    const used = coverage?.usedRanges;
    const possible = clip([...(coverage?.uncertainRanges || []), ...unresolvedJs.flatMap((s) => s.usedRanges || []),
      ...(unresolvedUnbounded ? [{ startOffset: 0, endOffset: b.text.length }] : [])], b.text.length);
    const uncertain = subtractRanges(possible, unionRanges(used || []));
    row.uncertainRanges = uncertain;
    row.uncertain_bytes = uncertain.reduce((n, r) => n + len(b.text.slice(r.startOffset, r.endOffset)), 0);
    row.usedRangesProvenance = coverage?.usedRangesProvenance || 'unknown-merged-counters';
    row.byte_coverage_verified = Array.isArray(used) && (row.usedRangesProvenance === 'per-sample-v1'
      || !!receiptEntry?.script_hashes?.includes(digest));
    row.used_bytes = (used || []).reduce((n, r) => n + len(b.text.slice(r.startOffset, r.endOffset)), 0);
    row.navigation_unchecked = row.used_bytes < row.bytes && unsampledNavigations == null;
    row.unsampled_navigation_gap = row.used_bytes < row.bytes && unsampledNavigations > 0;
    row.unused_bytes = row.byte_coverage_verified && unsampledNavigations === 0 ? row.bytes - row.used_bytes - row.uncertain_bytes : 0;
    row.unmeasured_bytes = row.bytes - row.used_bytes - row.unused_bytes;
    let ast;
    try { ast = acorn.parse(b.text, { ecmaVersion: 'latest', sourceType: b.type === 'module' ? 'module' : 'script', allowReturnOutsideFunction: true }); }
    catch (e) { errors.push({ block: b.id, type: 'js', message: e.message }); }
    const seen = new Set();
    const v8 = (coverage?.functions || []).filter((fn) => !fn.union_projection);
    if (ast) walk.fullAncestor(ast, (node, _state, ancestors) => {
      if (!['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) return;
      const parent = ancestors.at(-2);
      // Nested expression-bodied arrows can share an end offset. Prefer the
      // closest start, and combine V8 name aliases of that exact source span.
      const match = v8.filter((fn) => fn.ranges[0]?.endOffset === node.end && Math.abs(fn.ranges[0].startOffset - node.start) < 80)
        .sort((a, z) => Math.abs(a.ranges[0].startOffset - node.start) - Math.abs(z.ranges[0].startOffset - node.start))[0];
      const aliases = match ? v8.filter((fn) => fn.ranges[0]?.startOffset === match.ranges[0].startOffset && fn.ranges[0]?.endOffset === match.ranges[0].endOffset) : [];
      for (const fn of aliases) seen.add(fn);
      const name = match?.functionName || node.id?.name || (parent?.type === 'VariableDeclarator' ? parent.id.name : parent?.type === 'Property' || parent?.type === 'MethodDefinition' ? parent.key.name || parent.key.value : '') || '';
      functions.push({ block: b.id, script: digest, startOffset: node.start, endOffset: node.end, name,
        observed: !!match, count: match ? aliases.reduce((n, fn) => n + fn.ranges[0].count, 0) : coverage && unsampledNavigations === 0 ? 0 : null,
        native_names: [...new Set(aliases.map((fn) => fn.functionName))],
        count_basis: match ? 'CDP' : !coverage ? 'unobserved script' : unsampledNavigations === 0 ? 'static function absent from observed script coverage' : 'navigation history incomplete',
        v8_startOffset: match?.ranges[0]?.startOffset ?? null, v8_endOffset: match?.ranges[0]?.endOffset ?? null });
    });
    for (const fn of v8.filter((f) => !seen.has(f))) {
      const r = fn.ranges[0]; if (!r) continue;
      functions.push({ block: b.id, script: digest, startOffset: r.startOffset, endOffset: r.endOffset,
        name: fn.functionName, count: r.count, observed: true, v8_only: true, script_root: r.startOffset === 0 && r.endOffset === b.text.length });
    }
    const fs = functions.filter((f) => f.block === b.id && !f.script_root);
    for (const f of fs) {
      f.unresolved_source_overlap = uncertain.some((r) => r.startOffset < f.endOffset && r.endOffset > f.startOffset);
      f.navigation_unchecked = !(f.count > 0) && unsampledNavigations == null;
      f.unsampled_navigation_gap = !(f.count > 0) && unsampledNavigations > 0;
      f.usage_state = f.count > 0 ? 'used' : f.count === 0 && unsampledNavigations === 0 && !f.unresolved_source_overlap ? 'unused' : 'unknown';
    }
    row.functions_total = fs.length; row.functions_used = fs.filter((f) => f.count > 0).length;
    row.functions_unobserved = fs.filter((f) => !f.observed).length;
  } else row.executable = false;
  rows.push(row);
}
const sum = (kind, key) => rows.filter((r) => r.kind === kind && r.executable !== false).reduce((n, r) => n + (r[key] || 0), 0);
const report = { page: rel(pageFile), page_sha256: hash(bytes), union: unionFile, union_sha256: hash(readFileSync(unionFile)),
  provenance_receipt: receiptFile ? { path: receiptFile, sha256: hash(receiptBytes), accepted_for_union: !!receiptEntry } : null,
  unresolved_js_sources: unresolvedJs.map((s) => ({ script: s.script, url: s.url, functions: s.functions.length, positive_ranges: s.usedRanges?.length || 0 })),
  unresolved_css_sources: [...new Set(unresolvedCss.map((r) => r.sheet))],
  unsampled_navigations: unsampledNavigations,
  offset_units: 'UTF-16 code units, relative to block body; bytes are UTF-8',
  caveats: ['Unused means not touched in these runs; it is not proof of dead code.', 'Unobserved CSS rules/functions are distinguished from explicit zero counts.', 'CSS used bytes count matched style-rule spans; fonts, keyframes, at-rules and whitespace are outside that metric.', 'JS unused bytes require per-sample-v1 provenance or a matching hash-bound receipt; otherwise the remainder is unmeasured.', 'Unresolved same-page script identities conservatively make compatible positive offsets uncertain in every canonical script. Function counts are counts from resolved sources, with unresolved overlaps flagged.', 'Function counts sum samples, not independent users or test cases.'],
  totals: { css_rules_used: sum('style', 'rules_used'), css_rules_total: sum('style', 'rules_total'), css_rules_unused: sum('style', 'rules_unused'), css_rules_unmeasured: sum('style', 'rules_unmeasured'), css_bytes: sum('style', 'bytes'), css_used_bytes: sum('style', 'used_bytes'), css_unused_bytes: sum('style', 'unused_bytes'), css_unmeasured_bytes: sum('style', 'unmeasured_bytes'),
    js_bytes: sum('script', 'bytes'), js_used_bytes: sum('script', 'used_bytes'), js_unused_bytes: sum('script', 'unused_bytes'), js_unmeasured_bytes: sum('script', 'unmeasured_bytes'), js_uncertain_bytes: sum('script', 'uncertain_bytes'), js_functions: sum('script', 'functions_total'), js_functions_used: sum('script', 'functions_used') },
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
  const entries = new Map(union.css.filter((r) => r.used !== false || unsampledNavigations === 0 && !unresolvedCss.some((u) => u.startOffset < r.endOffset && u.endOffset > r.startOffset))
    .map((r) => [r.sheet + ':' + r.startOffset + ':' + r.endOffset, r]));
  for (const r of rules.filter((r) => r.sheet_observed)) {
    const key = r.sheet + ':' + r.startOffset + ':' + r.endOffset;
    const previous = entries.get(key);
    if (r.usage_state === 'unknown') { if (previous?.used === false) entries.delete(key); continue; }
    entries.set(key, { ...previous, sheet: r.sheet, startOffset: r.startOffset, endOffset: r.endOffset,
      used: !!previous?.used || r.used, block: r.block, rule_hash: r.rule_hash, census: true });
  }
  union.css = [...entries.values()];
  for (const script of union.js) {
    const block = rows.find((r) => r.kind === 'script' && r.hash === script.script);
    if (!block) continue;
    script.uncertainRanges = block.uncertainRanges || [];
    if (script.uncertainRanges.length) script.uncertainSourceKeys = unresolvedJs.map((s) => s.script);
    const missing = functions.filter((f) => f.script === script.script && !f.observed && f.count === 0);
    script.functions.push(...missing.map((f) => ({ functionName: f.name, isBlockCoverage: false, census: true,
      ranges: [{ startOffset: f.startOffset, endOffset: f.endOffset, count: 0 }] })));
    // The legacy v2 join reads functions/ranges, not usedRanges. Split an extra
    // projection at *all* boundaries so its byte union wins over a stale nested
    // zero from another sample. Native function counts remain untouched.
    const used = script.usedRanges || [];
    // Older consumers must not interpret native zero counters or usedRanges
    // absence as proof when navigation tracking is incomplete. Preserve native
    // counters, but retain the whole block in their Boolean byte projection.
    const retain = unionRanges([...used, ...script.uncertainRanges,
      ...(unsampledNavigations !== 0 ? [{ startOffset: 0, endOffset: block.units }] : [])]);
    const points = [...new Set([0, block.units, ...script.functions.flatMap((f) => f.ranges.flatMap((r) => [r.startOffset, r.endOffset])), ...retain.flatMap((r) => [r.startOffset, r.endOffset])])].sort((a, b) => a - b);
    const ranges = [];
    let j = 0;
    for (let i = 1; i < points.length; i++) {
      const startOffset = points[i - 1], endOffset = points[i];
      while (j < retain.length && retain[j].endOffset <= startOffset) j++;
      const count = retain[j] && retain[j].startOffset <= startOffset && retain[j].endOffset >= endOffset ? 1 : 0;
      ranges.push({ startOffset, endOffset, count });
    }
    script.functions.push({ functionName: '[coverage-union-bytes]', isBlockCoverage: true, union_projection: true,
      includes_uncertain_ranges: !!script.uncertainRanges.length, navigation_unknown: unsampledNavigations !== 0, ranges });
  }
  union.census = { page: report.page, page_sha256: report.page_sha256, raw_union_sha256: report.union_sha256,
    provenance_receipt: report.provenance_receipt,
    offset_units: report.offset_units, style_rules: rules.length, js_functions: functions.filter((f) => !f.script_root).length,
    policy: 'Static census completes only observed content hashes. usedRanges holds resolved touches; uncertainRanges holds possible touches from unresolved identities. union_projection conservatively retains either, and is not a function invocation count.' };
  mkdirSync(dirname(completeFile), { recursive: true });
  writeFileSync(completeFile, JSON.stringify(union) + '\n');
}
console.log(JSON.stringify({ output: out, totals: report.totals, blocks: rows.length, errors: errors.length, unmapped: rows.filter((r) => !r.source_files.length).map((r) => r.block) }));
