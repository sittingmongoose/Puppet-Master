// The complete FO-30 gate: the structural check AND the paint scan of every film frame, per surface, on one GPU recording.
//   node pip-steady-gate.mjs --page <build.html> --out <fresh-dir> [--sandbox 0|1] [--reps 1] [--looks a,b] [--phases p,q]
//        [--min-coverage 0.9] [-- <more browser-check run arguments, e.g. --host windows --sole>]
//   node pip-steady-gate.mjs --rescan <gate out-dir> [--min-coverage 0.9]   (scan again the films and logs a gate kept)
// Per surface (both by default, one after the other): browser-check records checks/pip-steady.check.mjs, which writes
// the run's witness log (pip-witness-<surface>.jsonl in the run folder); then pip_body_scan.mjs judges every frame of
// that film against the reference of the look it shows. A surface passes only when the structural run exits 0 AND the
// scan's verdict is pass (exit 0). A missing film or log, an unreadable film, a look it cannot evaluate, a missing paint,
// an untagged visible frame or low coverage fail it. gate.json keeps both halves, film hashes and the scan summaries.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kit = fileURLToPath(new URL('..', import.meta.url));
const scanner = fileURLToPath(new URL('../../../onboarding/opus-5.5/tools/pip_body_scan.mjs', import.meta.url));
const all = process.argv.slice(2), dd = all.indexOf('--'), args = dd < 0 ? all : all.slice(0, dd), extra = dd < 0 ? [] : all.slice(dd + 1);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const usage = () => { console.error('usage: pip-steady-gate.mjs --page <build> --out <fresh-dir> [--sandbox 0|1] [--reps 1] [--looks a,b] [--phases p,q] [--min-coverage 0.9] [-- browser-check args]\n       pip-steady-gate.mjs --rescan <gate out-dir>'); process.exit(2); };
const sha = (f) => { try { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); } catch { return null; } };
const rescan = opt('rescan'), out = rescan || opt('out'), page = opt('page'), sandbox = opt('sandbox');
if (!out || (!rescan && !page) || (sandbox !== undefined && !['0', '1'].includes(sandbox))) usage();
const surfaces = sandbox === undefined ? ['0', '1'] : [sandbox];
const before = rescan ? JSON.parse(fs.readFileSync(path.join(out, 'gate.json'), 'utf8')) : null;
if (!rescan) fs.mkdirSync(out, { recursive: false });
const results = [];
for (const s of rescan ? before.surfaces.map((r) => r.sandbox) : surfaces) {
	const name = s === '1' ? 'sandbox' : 'normal', film = path.resolve(out, `pip-${s}.mp4`), runDir = path.resolve(out, `run-${s}`);
	let structuralExit;
	if (rescan) structuralExit = before.surfaces.find((r) => r.sandbox === s).structuralExit;
	else {
		const set = [['page', page], ['sandbox', s], ['reps', opt('reps', '1')], ...['looks', 'phases'].filter((k) => opt(k)).map((k) => [k, opt(k)])].flatMap(([k, v]) => ['--set', `${k}=${v}`]);
		const run = spawnSync('browser-check', ['run', path.join(kit, 'checks/pip-steady.check.mjs'), ...set, '--record', film, '--out', runDir, ...extra], { stdio: 'inherit' });
		structuralExit = run.status;
	}
	/* scan even when the structural run failed: the two halves are independent observations */
	const log = path.join(runDir, `pip-witness-${name}.jsonl`);
	let scan = { status: 2, stdout: '', stderr: '' };
	if (fs.existsSync(log) && fs.existsSync(film)) scan = spawnSync(process.execPath, [scanner, film, '--witness', log, '--out', path.join(out, `scan-${s}.json`), '--counts', path.join(out, `frames-${s}.csv`), '--min-coverage', opt('min-coverage', '0.9')], { encoding: 'utf8', maxBuffer: 1 << 26 });
	fs.writeFileSync(path.join(out, `scan-${s}.stderr`), scan.stderr || '');
	let data = null;
	try { data = JSON.parse(fs.readFileSync(path.join(out, `scan-${s}.json`), 'utf8')); } catch { /* absent or malformed: a failure */ }
	const ok = structuralExit === 0 && scan.status === 0 && data?.verdict === 'pass';
	const r = {
		sandbox: s, surface: name, ok, structuralExit, scanExit: scan.status, verdict: data?.verdict ?? (fs.existsSync(film) ? (fs.existsSync(log) ? 'no scan' : 'no witness log') : 'no film'),
		film: path.basename(film), filmSha256: sha(film), witness: path.relative(out, log), witnessSha256: sha(log), frames: data?.frames, tagged: data?.tagged,
		visiblePageFrames: data?.visiblePageFrames, observedVisiblePageFrames: data?.observedVisiblePageFrames, coverage: data?.coverage,
		looks: data?.looks ? Object.fromEntries(Object.entries(data.looks).map(([k, v]) => [k, { visible: v.visiblePageFrames, observed: v.observedPageFrames, judged: v.judgedFilmFrames, missing: v.missing, head: v.reference?.regions?.head && { threshold: v.reference.regions.head.threshold, painted: v.reference.regions.head.paintedMedian, hidden: v.reference.regions.head.hiddenMax, heldOut: v.reference.regions.head.heldOut }, ctl: v.reference?.regions?.ctl && { threshold: v.reference.regions.ctl.threshold, painted: v.reference.regions.ctl.paintedMedian, hidden: v.reference.regions.ctl.hiddenMax } }])) : null,
		dips: data?.dips, failures: data?.failures, cannotEvaluate: data?.cannotEvaluate, notJudged: data?.notJudged
	};
	results.push(r);
	console.log(JSON.stringify({ surface: name, ok, structuralExit, scanExit: scan.status, verdict: r.verdict, frames: r.frames, coverage: r.coverage, dips: (r.dips || []).length, failures: r.failures, cannotEvaluate: (r.cannotEvaluate || []).slice(0, 5) }));
}
const gate = { page: before ? before.page : page, pageSha256: before ? before.pageSha256 : sha(page), args: before ? before.args : { reps: opt('reps', '1'), looks: opt('looks') || 'all', phases: opt('phases') || 'all', extra }, minCoverage: Number(opt('min-coverage', '0.9')), rescanned: !!rescan, ok: results.every((r) => r.ok), surfaces: results };
fs.writeFileSync(path.join(out, 'gate.json'), JSON.stringify(gate, null, 2) + '\n');
console.log(`FO-30 gate: ${gate.ok ? 'PASS' : 'FAIL'} (${results.map((r) => `${r.surface} ${r.ok ? 'pass' : `structural exit ${r.structuralExit}, scan ${r.verdict}`}`).join('; ')})`);
process.exitCode = gate.ok ? 0 : 1;
