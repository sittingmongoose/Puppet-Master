#!/usr/bin/env node
// Static self-check of the kit's changed-file map (../affects.mjs). No browser.
//   node Concepts/pm7-tools/browser-check/tools/affects-check.mjs                the static checks (under a second)
//   node .../affects-check.mjs --explain                                         each check's surfaces: shown by its
//                                                                                code, and given without a pattern
//   node .../affects-check.mjs --trace                                           also run build.py with every file it
//                                                                                opens recorded (about a minute)
//   node .../affects-check.mjs --selftest                                        broken copies of the map must fail
//   node .../affects-check.mjs --select <file> [<file> ...]                      what a change to these files selects
//   node .../affects-check.mjs --measure 20 [--ref origin/main] [--merges]       the selection for the last 20 commits
//                                                                                on ref that touched the product sources
//                                                                                (--merges: merged branches, each judged
//                                                                                by its diff from the first parent)
// Fails (exit 1) when: a row or list is malformed or names an unknown surface; a glob matches nothing; a file under the
// product sources is placed by no source row and not by affectsAll; a kit file is placed by nothing and is not a check;
// a check file has no checkSurfaces entry or no row selects it (affectsAlways aside); a check's code shows a surface its
// entry lacks; a kit or repository file a check imports or reads does not select that check; with --trace, a file the
// build opens is not a product source or is placed only by a row that selects nothing. Files are the tracked ones plus
// new files git does not ignore, so a check or source added but not yet committed is judged too.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KIT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = execFileSync('git', ['-C', KIT_DIR, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const KIT = path.relative(REPO, KIT_DIR).split(path.sep).join('/');
const BUILD = 'Concepts/onboarding/opus-5.5/tools/build.py';
const map = await import(pathToFileURL(path.join(KIT_DIR, 'affects.mjs')).href);

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i < 0 ? null : (args[i + 1] ?? ''); };

// ---- globs: `*` inside one segment, `**` any number of whole segments (none included) --------------------------
const globCache = new Map();
function globRe(glob) {
	if (globCache.has(glob)) return globCache.get(glob);
	const segs = glob.split('/');
	let re = '';
	segs.forEach((seg, i) => {
		const last = i === segs.length - 1;
		if (seg === '**') re += last ? '.*' : '(?:[^/]+/)*';
		else re += seg.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*') + (last ? '' : '/');
	});
	const out = new RegExp(`^${re}$`);
	globCache.set(glob, out);
	return out;
}
const matches = (globs, file) => globs.some((g) => globRe(g).test(file));

// ---- the repository and the kit -----------------------------------------------------------------------------------
const gitList = (...extra) => execFileSync('git', ['-C', REPO, 'ls-files', '-z', ...extra], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean);
const files = [...new Set([...gitList(), ...gitList('--others', '--exclude-standard')])];
const fileSet = new Set(files);
const kitFiles = files.filter((f) => f.startsWith(KIT + '/')).map((f) => f.slice(KIT.length + 1));
const checkFiles = kitFiles.filter((f) => f.endsWith('.check.mjs')).sort();
const runTarget = checkFiles.filter((f) => f.startsWith('checks/'));

// What each check depends on: relative imports, requires and dynamic imports are followed (their code runs in the
// check); new URL('...', import.meta.url) is a file read at run time, recorded and not followed.
const refsOf = (kitRel) => {
	const text = fs.readFileSync(path.join(KIT_DIR, kitRel), 'utf8');
	const to = (m) => path.posix.normalize(path.posix.join(KIT, path.posix.dirname(kitRel), m[1]));
	const imports = [...text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g)].map(to);
	const reads = [...text.matchAll(/new URL\(\s*['"](\.{1,2}\/[^'"]+)['"]/g)].map(to);
	return { imports: [...new Set(imports)], reads: [...new Set(reads)] };
};
const closure = (kitRel) => {
	const all = new Set(), code = new Set();
	const walk = (rel) => {
		const { imports, reads } = refsOf(rel);
		for (const ref of reads) all.add(ref);
		for (const ref of imports) {
			all.add(ref);
			if (!code.has(ref) && ref.startsWith(KIT + '/') && /\.(mjs|cjs|js)$/.test(ref) && fs.existsSync(path.join(REPO, ref))) { code.add(ref); walk(ref.slice(KIT.length + 1)); }
		}
	};
	walk(kitRel);
	return { all, code };
};
const deps = Object.fromEntries(checkFiles.map((f) => [f, closure(f)]));
const dependents = new Map();
for (const [check, d] of Object.entries(deps)) for (const r of d.all) dependents.set(r, [...(dependents.get(r) || []), check]);
const codeText = Object.fromEntries(checkFiles.map((f) => [f, [path.join(KIT_DIR, f), ...[...deps[f].code].filter((r) => r !== `${KIT}/browser-check.config.mjs`).map((r) => path.join(REPO, r))].map((p) => fs.readFileSync(p, 'utf8')).join('\n')]));

// ---- the audit ------------------------------------------------------------------------------------------------------
function audit(m, { explain = false } = {}) {
	const problems = [];
	const fail = (msg) => problems.push(msg);
	const { affects, affectsAll, affectsAlways, checkSurfaces = {}, surfaces = {}, surfaceEvidence = {}, sourceRows = [], productSources = [] } = m;
	const isStrList = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string' && s.length > 0);
	if (!Array.isArray(affects)) return ['affects is not an array'];
	if (!isStrList(affectsAll)) return ['affectsAll is not a list of globs'];
	if (!isStrList(affectsAlways)) return ['affectsAlways is not a list of globs'];
	for (const [i, row] of affects.entries()) {
		if (!row || !isStrList(row.files) || !row.files.length) fail(`affects[${i}]: files must be a nonempty list of globs`);
		if (!row || !Array.isArray(row.checks) || !row.checks.every((s) => typeof s === 'string' && s)) fail(`affects[${i}]: checks must be a list of globs`);
		if (!row || typeof row.why !== 'string' || !row.why.trim()) fail(`affects[${i}]: no why`);
	}
	if (problems.length) return problems;
	for (const [i, row] of sourceRows.entries()) {
		const bad = (row.surfaces || []).filter((s) => !(s in surfaces));
		if (!row.surfaces?.length || bad.length) fail(`sourceRows[${i}] (${row.files?.[0]}): unknown or no surfaces ${bad.join(', ')}`);
		if (!affects[i] || affects[i].files !== row.files) fail(`sourceRows[${i}] is not affects[${i}]: keep sourceRows first in affects`);
		else if (!affects[i].checks.length) fail(`sourceRows[${i}] (${row.files[0]}): no check has any of its surfaces (${row.surfaces.join(', ')})`);
	}
	for (const [file, list] of Object.entries(checkSurfaces)) {
		const bad = list.filter((s) => !(s in surfaces));
		if (bad.length) fail(`checkSurfaces['${file}']: unknown surface ${bad.join(', ')}`);
		if (!checkFiles.includes(file)) fail(`checkSurfaces['${file}']: no such check file in the kit`);
	}
	for (const s of Object.keys(surfaceEvidence)) if (!(s in surfaces)) fail(`surfaceEvidence.${s}: not a surface`);

	// every glob matches something
	for (const g of new Set(affects.flatMap((r) => r.files).concat(affectsAll, productSources)))
		if (!files.some((f) => globRe(g).test(f))) fail(`files glob matches no file: ${g}`);
	for (const g of new Set(affects.flatMap((r) => r.checks).concat(affectsAlways)))
		if (!checkFiles.some((f) => globRe(g).test(f))) fail(`checks glob matches no check file: ${g}`);

	// placement
	const placedBy = (file) => affects.filter((r) => matches(r.files, file));
	const isAll = (file) => matches(affectsAll, file);
	for (const f of files.filter((f) => matches(productSources, f)))
		if (!isAll(f) && !sourceRows.some((r) => matches(r.files, f))) fail(`product source placed by no source row and not in affectsAll: ${f}`);
	for (const f of kitFiles) {
		if (f.endsWith('.check.mjs')) continue;
		if (!isAll(`${KIT}/${f}`) && !placedBy(`${KIT}/${f}`).length) fail(`kit file placed by no row and not in affectsAll: ${KIT}/${f}`);
	}
	for (const f of checkFiles) {
		if (!(f in checkSurfaces)) fail(`check file has no checkSurfaces entry: ${f}`);
		if (!matches(affectsAlways, f) && !affects.some((r) => matches(r.checks, f))) fail(`check file in no row and not in affectsAlways: ${f}`);
	}

	// what the checks import and read selects them
	for (const [ref, checks] of dependents) {
		if (!fileSet.has(ref)) { fail(`${checks[0]} reads ${ref}, which is not a file in the repository`); continue; }
		if (isAll(ref)) continue;
		const selected = new Set(placedBy(ref).flatMap((r) => checkFiles.filter((f) => matches(r.checks, f))));
		const missing = checks.filter((c) => !selected.has(c) && `${KIT}/${c}` !== ref);
		if (missing.length) fail(`${ref} is imported or read by ${missing.join(', ')}, which no row for it selects`);
	}

	// each check's surfaces against its code
	for (const f of checkFiles) {
		const own = checkSurfaces[f] || [];
		const shown = Object.keys(surfaceEvidence).filter((s) => surfaceEvidence[s].test(codeText[f]));
		const missing = shown.filter((s) => !own.includes(s));
		if (missing.length) fail(`${f}: its code shows ${missing.join(', ')} (surfaceEvidence), which its checkSurfaces entry lacks`);
		const extra = own.filter((s) => !shown.includes(s));
		if (explain) console.log(`${f.padEnd(48)} shown: ${shown.join(' ') || '-'}${extra.length ? ` | given without a pattern: ${extra.join(' ')}` : ''}`);
	}
	return problems;
}

// ---- selection, as the engine is specified to do it --------------------------------------------------------------
function select(m, changed, pool = runTarget) {
	const unplaced = [];
	let all = false;
	const picked = new Set(pool.filter((f) => matches(m.affectsAlways, f)));
	for (const file of changed) {
		if (matches(m.affectsAll, file)) { all = true; continue; }
		const own = file.startsWith(KIT + '/') && file.endsWith('.check.mjs') ? file.slice(KIT.length + 1) : null;
		if (own && pool.includes(own)) picked.add(own);
		const rows = m.affects.filter((r) => matches(r.files, file));
		if (!rows.length && !own) { unplaced.push(file); continue; }
		for (const r of rows) for (const f of pool) if (matches(r.checks, f)) picked.add(f);
	}
	if (all || unplaced.length) return { all: true, unplaced, checks: [...pool] };
	return { all: false, unplaced, checks: [...picked].sort() };
}

// ---- --trace: every file build.py opens ----------------------------------------------------------------------------
function trace(m) {
	const problems = [];
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'affects-trace-'));
	try {
		const log = path.join(tmp, 'opened.txt');
		const py = [
			'import os, sys, runpy',
			`log = open(${JSON.stringify(log)}, "w")`,
			'def hook(ev, a):',
			'    if ev == "open" and isinstance(a[0], (str, bytes, os.PathLike)):',
			'        p = os.fsdecode(a[0])',
			'        if p.startswith(sys.prefix): return',
			'        p = os.path.abspath(p)',
			'        d, b = os.path.split(p)',
			'        if os.path.basename(d) == "__pycache__" and b.endswith(".pyc"):  # a cached module: name its source',
			'            p = os.path.join(os.path.dirname(d), b.split(".")[0] + ".py")',
			'        log.write(p + "\\n")',
			'sys.addaudithook(hook)',
			`sys.argv = [${JSON.stringify(path.join(REPO, BUILD))}, "--out", ${JSON.stringify(path.join(tmp, 'page.html'))}]`,
			'sys.path.insert(0, os.path.dirname(sys.argv[0]))  # as `python3 build.py` would',
			'def modules():  # a module imported from __pycache__ may never open its source: name it',
			'    for mod in list(sys.modules.values()):',
			'        f = getattr(mod, "__file__", None)',
			'        if f: log.write(os.path.abspath(f) + "\\n")',
			'try:',
			'    runpy.run_path(sys.argv[0], run_name="__main__")',
			'except SystemExit as e:',
			'    modules(); log.flush(); sys.exit(e.code)',
			'modules(); log.flush()'
		].join('\n');
		const r = spawnSync('python3', ['-c', py], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 });
		if (r.status !== 0) problems.push(`--trace: build.py exited ${r.status}: ${(r.stderr || '').trim().split('\n').slice(-3).join(' | ')}`);
		const opened = [...new Set(fs.readFileSync(log, 'utf8').split('\n').filter(Boolean))]
			.filter((p) => p.startsWith(REPO + path.sep)).map((p) => path.relative(REPO, p).split(path.sep).join('/'))
			.filter((p) => !p.includes('__pycache__') && fileSet.has(p));
		for (const f of opened) {
			if (!matches(m.productSources, f)) problems.push(`--trace: the build reads ${f}, which productSources does not name`);
			else if (!matches(m.affectsAll, f) && !m.affects.some((row) => row.checks.length && matches(row.files, f))) problems.push(`--trace: the build reads ${f}, which only a row that selects nothing places`);
		}
		const sources = files.filter((f) => matches(m.productSources, f));
		console.log(`trace: the build opened ${opened.length} repository files; ${sources.length} files match productSources, ${sources.filter((f) => !opened.includes(f)).length} of them not read by this build (placed anyway)`);
	} finally {
		fs.rmSync(tmp, { recursive: true, force: true });
	}
	return problems;
}

// ---- --selftest: broken copies of the map must fail, and selection must behave ----------------------------------
function selftest() {
	const O = 'Concepts/onboarding/opus-5.5';
	const parts = () => ({
		...map,
		checkSurfaces: structuredClone(map.checkSurfaces),
		sourceRows: map.sourceRows.map((r) => ({ ...r, files: [...r.files], surfaces: [...r.surfaces] })),
		kitRows: map.kitRows.map((r) => ({ ...r, files: [...r.files], checks: [...r.checks] })),
		noCheckRows: map.noCheckRows.map((r) => ({ ...r, files: [...r.files] })),
		affectsAll: [...map.affectsAll], affectsAlways: [...map.affectsAlways], productSources: [...map.productSources]
	});
	const rebuilt = (p) => ({ ...p, affects: map.buildRows(p) });
	const tour = map.sourceRows.findIndex((r) => r.files.includes(`${O}/src/js/8*.js`));
	const fields = map.kitRows.findIndex((r) => r.files.includes(`${KIT}/helpers/onboarding-fields.mjs`));
	const negatives = [
		['a source no row places', (p) => { p.sourceRows[tour].files = p.sourceRows[tour].files.filter((g) => g !== `${O}/src/js/8*.js`); }, 'product source placed by no source row and not in affectsAll: ' + `${O}/src/js/82-tour-wizard.js`],
		['a files glob that matches nothing', (p) => { p.noCheckRows[0].files.push('Concepts/no-such-folder/**'); }, 'files glob matches no file: Concepts/no-such-folder/**'],
		['a checks glob that matches nothing', (p) => { p.affectsAlways.push('checks/no-such.check.mjs'); }, 'checks glob matches no check file: checks/no-such.check.mjs'],
		['a check no row selects', (p) => { p.checkSurfaces['checks/widths.check.mjs'] = []; }, 'check file in no row and not in affectsAlways: checks/widths.check.mjs'],
		['a check without an entry', (p) => { delete p.checkSurfaces['checks/widths.check.mjs']; }, 'check file has no checkSurfaces entry: checks/widths.check.mjs'],
		['a surface the code shows, left out', (p) => { p.checkSurfaces['checks/nas-review.check.mjs'] = p.checkSurfaces['checks/nas-review.check.mjs'].filter((s) => s !== 'window'); }, 'checks/nas-review.check.mjs: its code shows window'],
		['a helper whose importers it does not select', (p) => { p.kitRows[fields].checks = p.kitRows[fields].checks.filter((c) => c !== 'checks/identity.check.mjs'); }, `${KIT}/helpers/onboarding-fields.mjs is imported or read by checks/identity.check.mjs`],
		['a kit file placed by nothing', (p) => { p.kitRows.splice(fields, 1); }, `kit file placed by no row and not in affectsAll: ${KIT}/helpers/onboarding-fields.mjs`],
		['an unknown surface', (p) => { p.sourceRows[tour].surfaces.push('no-such-surface'); }, 'unknown or no surfaces no-such-surface']
	];
	let ok = 0;
	for (const [name, mutate, expected] of negatives) {
		const p = parts();
		mutate(p);
		const got = audit(rebuilt(p));
		const caught = got.some((x) => x.includes(expected));
		console.log(`${caught ? 'ok  ' : 'MISS'} negative: ${name}${caught ? '' : ` (wanted "${expected}"; got ${got.length ? got.slice(0, 2).join(' / ') : 'no problem'})`}`);
		ok += caught;
	}
	const always = map.affectsAlways.length;
	const sel = (changed) => select(map, changed);
	const positives = [
		['the kit README selects only affectsAlways', sel([`${KIT}/README.md`]), (s) => !s.all && s.checks.length === always],
		['a changed check selects itself', sel([`${KIT}/checks/field-ring.check.mjs`]), (s) => !s.all && s.checks.includes('checks/field-ring.check.mjs') && s.checks.length === always + 1],
		['a changed helper selects its importers', sel([`${KIT}/helpers/painted-text.mjs`]), (s) => !s.all && ['failed-status-contrast', 'shell-scroll-contrast', 'shell-state'].every((n) => s.checks.includes(`checks/${n}.check.mjs`))],
		['an unplaced file selects everything', sel(['scripts/no-such-script.py']), (s) => s.all && s.unplaced.length === 1],
		['the kit config selects everything', sel([`${KIT}/browser-check.config.mjs`]), (s) => s.all && !s.unplaced.length],
		['an onboarding screen selects window checks, not chat-only ones', sel([`${O}/src/js/70-screens-nas.js`]), (s) => !s.all && s.checks.includes('checks/nas-review.check.mjs') && !s.checks.includes('checks/chat-detail-matrix.check.mjs')],
		['a chat source selects chat checks, not window-only ones', sel(['Concepts/chat-assistant-concepts/5.6 Pro/transcript.js']), (s) => !s.all && s.checks.includes('checks/chat-sweep.check.mjs') && !s.checks.includes('checks/nas-review.check.mjs')]
	];
	for (const [name, s, test] of positives) {
		const pass = test(s);
		console.log(`${pass ? 'ok  ' : 'MISS'} select: ${name} (${s.all ? 'everything' : `${s.checks.length} of ${runTarget.length}`})`);
		ok += pass;
	}
	const total = negatives.length + positives.length;
	console.log(`selftest: ${ok} of ${total} pass`);
	return ok === total ? [] : [`selftest: ${total - ok} of ${total} failed`];
}

// ---- main ------------------------------------------------------------------------------------------------------------
const problems = audit(map, { explain: args.includes('--explain') });
if (args.includes('--trace')) problems.push(...trace(map));
if (args.includes('--selftest')) problems.push(...selftest());
console.log(`map: ${map.affects.length} rows (${map.sourceRows.length} source, ${map.kitRows.length} kit, ${map.noCheckRows.length} that select nothing), ${map.affectsAll.length} affectsAll globs, ${map.affectsAlways.length} affectsAlways`);
console.log(`files: ${files.filter((f) => matches(map.productSources, f)).length} product source files, ${kitFiles.length} kit files, ${checkFiles.length} check files (${runTarget.length} in checks/)`);

if (opt('--select') !== null) {
	const changed = args.slice(args.indexOf('--select') + 1).filter((a) => !a.startsWith('--'));
	const s = select(map, changed);
	console.log(s.all ? `select: everything (${s.checks.length} of ${runTarget.length})${s.unplaced.length ? `; unplaced: ${s.unplaced.join(', ')}` : ''}` : `select: ${s.checks.length} of ${runTarget.length}: ${s.checks.map((c) => c.replace(/^checks\/|\.check\.mjs$/g, '')).join(' ')}`);
}

if (opt('--measure') !== null) {
	const n = Number(opt('--measure')) || 20;
	const ref = opt('--ref') || 'origin/main';
	const isSource = (f) => matches(map.productSources, f) && f !== 'Concepts/PMConcept7.html';
	const merges = args.includes('--merges');
	const commits = execFileSync('git', ['-C', REPO, 'log', ref, merges ? '--merges' : '--no-merges', '--format=%h', '-n', '400'], { encoding: 'utf8' }).split('\n').filter(Boolean);
	const rows = [];
	for (const h of commits) {
		const changed = execFileSync('git', ['-C', REPO, ...(merges ? ['diff', '--name-only', '--no-renames', `${h}^1`, h] : ['show', '--format=', '--name-only', '--no-renames', h])], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(Boolean);
		if (!changed.some(isSource)) continue;
		const s = select(map, changed);
		const subject = execFileSync('git', ['-C', REPO, 'log', '-1', '--format=%ad %s', '--date=short', h], { encoding: 'utf8' }).trim();
		const why = s.all ? (s.unplaced.length ? `unplaced: ${s.unplaced.slice(0, 2).join(', ')}${s.unplaced.length > 2 ? ` +${s.unplaced.length - 2}` : ''}` : `affectsAll: ${changed.filter((f) => matches(map.affectsAll, f)).slice(0, 2).join(', ')}`) : '';
		rows.push({ h, subject, n: changed.length, sel: s.checks.length, why });
		if (rows.length >= n) break;
	}
	console.log(`\n| Commit | Files | Selected of ${runTarget.length} | Why everything |\n|---|---|---|---|`);
	for (const r of rows) console.log(`| \`${r.h}\` ${r.subject.slice(11, 80).replace(/\|/g, '/')} | ${r.n} | ${r.sel} | ${r.why.replace(/\|/g, '/')} |`);
	const total = rows.reduce((a, r) => a + r.sel, 0);
	console.log(`\n${rows.length} ${merges ? 'merges' : 'commits'} on ${ref}: ${total} check files selected in all, ${rows.length * runTarget.length} for full runs (${Math.round((100 * total) / Math.max(1, rows.length * runTarget.length))}%); ${rows.filter((r) => r.sel === runTarget.length).length} selected everything`);
}

if (problems.length) {
	for (const p of problems) console.log('FAIL', p);
	console.log(`affects-check: ${problems.length} problem${problems.length === 1 ? '' : 's'}`);
	process.exit(1);
}
console.log('affects-check: ok');
