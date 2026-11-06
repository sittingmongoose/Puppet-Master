// FO-30 negative regression: every look's one-frame paint loss (pip-steady-mutants.mjs), Astra's Friendly Light
// mutation and any reviewer's builds (--jobs), each filmed through the unchanged gate and required to be rejected at the
// frame each loss was painted in, in its own look.
//   node pip-steady-negatives.mjs --page <build.html> --out <fresh-dir> [--looks a,b | none] [--phases welcome]
//        [--astra <astra mutation-friendly.html>] [--jobs <more.json>] [--url-base http://host:port/dir/ --serve-dir <dir>]
//        (--looks takes look:kind for the extra losses of pip-steady-mutants.mjs, e.g. friendly-dark:hostscale)
//        [-- <browser-check args, e.g. --sole>]
//   node pip-steady-negatives.mjs --rejudge <out-dir>
// --jobs adds films of pages as they are: [{ "name", "page", "looks", "phases", "sandbox", "marker", "expect" }], marker the
// console prefix each loss logs ({look, kind, at, restore} with performance.now() times), expect how many losses a film
// holds. A page on another machine's browser (--host) must be served: --serve-dir is where the pages are written and
// --url-base the URL that serves it. Surfaces alternate (normal, sandbox, ...) unless --sandbox is given.
// Each loss passes only when: it fired once, in exactly one page frame the witness numbers; that page frame was declared
// visible, is in the loss's look and reached the film; the scan reports a missing paint in that look containing it; and
// the structural contract (paintContract) of that very page frame fails, except for the 'cover' mutation, which leaves
// Pip untouched and must pass it (the film half rejects it on its own). The film must hold no other missing-paint run,
// and the gate must fail. Anything else (not fired, not filmed, caught elsewhere) fails the negative.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUTATIONS, mutate, kindsOf } from './pip-steady-mutants.mjs';
import { readWitness, paintContract } from '../helpers/pip-witness.mjs';

const all = process.argv.slice(2), dd = all.indexOf('--'), args = dd < 0 ? all : all.slice(0, dd), extra = dd < 0 ? [] : all.slice(dd + 1);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const page = opt('page'), rejudge = opt('rejudge'), out = rejudge || opt('out');
if (!out || (!rejudge && !page)) { console.error('usage: pip-steady-negatives.mjs --page <build.html> --out <fresh-dir> [--looks a,b] [--phases welcome] [--astra file] [--jobs more.json] [--url-base U --serve-dir D] [-- browser-check args]\n       pip-steady-negatives.mjs --rejudge <out-dir>   (judge the kept runs again)'); process.exit(2); }
const gate = fileURLToPath(new URL('./pip-steady-gate.mjs', import.meta.url));
if (!rejudge) fs.mkdirSync(out, { recursive: false });
const serve = opt('serve-dir'), base = opt('url-base');
if (!!serve !== !!base) { console.error('--serve-dir and --url-base go together'); process.exit(2); }
const place = (name, html) => { const dir = serve || path.join(out, 'pages'); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, name), html); return serve ? base.replace(/\/?$/, '/') + name : path.resolve(dir, name); };
const html = rejudge ? null : fs.readFileSync(page, 'utf8');
const jobs = rejudge ? JSON.parse(fs.readFileSync(path.join(out, 'jobs.json'), 'utf8')) : (opt('looks') === 'none' ? [] : opt('looks') ? opt('looks').split(',') : Object.keys(MUTATIONS)).map((spec, i) => {
	const { look, name } = kindsOf(spec), { out: m, kind } = mutate(html, spec);
	return { name: `mutant-${name}`, look, kind, page: place(`fo30-mutant-${name}.html`, m), sandbox: opt('sandbox') ?? String(i % 2), phases: opt('phases', 'welcome'), marker: 'PIP_MUTANT ' };
});
if (!rejudge && opt('astra')) jobs.unshift({ name: 'astra-friendly-light', look: 'friendly-light', kind: 'opacity (Astra)', page: place('fo30-astra-mutation-friendly.html', fs.readFileSync(opt('astra'), 'utf8')), sandbox: opt('sandbox') ?? '0', phases: 'begin', marker: 'REVIEW_ONE_FRAME ' });
/* --jobs <file.json>: more negatives, each [{ name, page, looks, phases, sandbox, marker, expect, filmOnly }], one film
   each, several losses in a film allowed (expect); a reviewer's builds run unchanged this way */
if (!rejudge && opt('jobs')) for (const x of JSON.parse(fs.readFileSync(opt('jobs'), 'utf8'))) jobs.push({ ...x, look: x.looks || x.look, page: place(`fo30-${x.name}.html`, fs.readFileSync(x.page, 'utf8')) });
if (!rejudge) fs.writeFileSync(path.join(out, 'jobs.json'), JSON.stringify(jobs, null, 1) + '\n');
const FILM_ONLY = new Set(['cover']);
const results = [];
for (const j of jobs) {
	const dir = path.join(out, j.name), surface = j.sandbox === '1' ? 'sandbox' : 'normal';
	if (rejudge && !fs.existsSync(path.join(dir, 'gate.json'))) { results.push({ name: j.name, look: j.look, kind: j.kind, surface, ok: false, problems: ['not run'] }); continue; }
	const g = rejudge ? { status: null } : spawnSync(process.execPath, [gate, '--page', j.page, '--out', dir, '--sandbox', j.sandbox, '--looks', j.look, '--phases', j.phases, '--', ...extra], { stdio: 'inherit' });
	const r = { name: j.name, look: j.look, kind: j.kind, surface, gateExit: g.status, problems: [], losses: [] };
	try {
		const gj = JSON.parse(fs.readFileSync(path.join(dir, 'gate.json'), 'utf8')), s = gj.surfaces[0];
		const ev = JSON.parse(fs.readFileSync(path.join(dir, `run-${j.sandbox}`, 'events.json'), 'utf8'));
		const fired = ev.console.filter((c) => c.text.startsWith(j.marker)).map((c) => JSON.parse(c.text.slice(j.marker.length)));
		const w = readWitness(fs.readFileSync(path.join(dir, s.witness), 'utf8')), F = w.F, recs = w.recs, strings = w.strings;
		const contract = paintContract(w);
		const filmed = new Set(fs.readFileSync(path.join(dir, `frames-${j.sandbox}.csv`), 'utf8').split('\n').slice(1).map((l) => l.split(',')[1]).filter(Boolean).map(Number));
		r.fired = fired.length;
		if (fired.length !== (j.expect || 1)) r.problems.push(`${fired.length} losses fired, ${j.expect || 1} expected`);
		const matched = new Set();
		for (const m of fired) {
			const look = m.look || j.look, kind = m.kind || j.kind, at = m.at ?? m.hide, until = m.restore;
			const hit = recs.filter((x) => x[F.t] >= at && x[F.t] < until), L = { look, kind, seqs: hit.map((x) => x[F.seq]), problems: [] };
			if (hit.length !== 1) L.problems.push(`the loss spans ${hit.length} page frames, not one`);
			if (hit.some((x) => x[F.cls] !== 'v')) L.problems.push(`the loss fell in a frame the page did not declare visible (${hit.map((x) => `${x[F.cls]}: ${strings[x[F.why]] || ''}`).join(', ')})`);
			if (hit.some((x) => strings[x[F.look]] !== look)) L.problems.push(`the loss fell in ${[...new Set(hit.map((x) => strings[x[F.look]]))]}`);
			L.filmed = hit.length > 0 && hit.every((x) => filmed.has(x[F.seq]));
			if (!L.filmed) L.problems.push('the frame with the loss never reached the film (capture rate): inconclusive, run again');
			const dip = (s.dips || []).find((d) => d.look === look && L.seqs.some((q) => d.seqs.includes(q)));
			L.filmCaught = !!dip; L.dip = dip || null; if (dip) matched.add(dip);
			if (!dip) L.problems.push('the film scan did not report the loss');
			/* the structural contract of that very page frame */
			L.structural = hit.flatMap((x) => contract.why(x));
			L.structuralCaught = L.structural.length > 0;
			if (FILM_ONLY.has(kind) ? L.structuralCaught : !L.structuralCaught) L.problems.push(FILM_ONLY.has(kind) ? 'the structural contract flagged a change it cannot see (something else changed)' : 'the structural contract passed a DOM-visible loss');
			r.losses.push(L);
		}
		r.mutationSeqs = r.losses.flatMap((L) => L.seqs);
		r.filmed = r.losses.every((L) => L.filmed); r.filmCaught = r.losses.every((L) => L.filmCaught); r.structuralCaught = r.losses.every((L) => L.structuralCaught);
		for (const L of r.losses) for (const p of L.problems) r.problems.push(`${L.look} ${L.kind}: ${p}`);
		r.otherDips = (s.dips || []).filter((d) => !matched.has(d)).length;
		if (r.otherDips) r.problems.push(`${r.otherDips} other missing-paint runs (false failures?)`);
		r.structuralExit = s.structuralExit; r.scanVerdict = s.verdict; r.filmSha256 = s.filmSha256; r.coverage = s.coverage;
		const sum = JSON.parse(fs.readFileSync(path.join(dir, `run-${j.sandbox}`, 'summary.json'), 'utf8'));
		const paintChecks = (sum.results || []).filter((x) => /Pip's head, controller and strings are painted|Pip's head is placed and hangs on its strings/.test(x.name) && !/^.*› (welcome|tiles|begin|smb|start|end):/.test(x.name));
		r.runStructuralFailed = paintChecks.some((x) => !x.ok);
		r.otherStructuralFailures = (sum.results || []).filter((x) => !x.ok && !paintChecks.includes(x)).map((x) => x.name.split(' › ').pop());
		const filmOnlyRun = r.losses.length > 0 && r.losses.every((L) => FILM_ONLY.has(L.kind));
		if (filmOnlyRun ? r.runStructuralFailed : !r.runStructuralFailed) r.problems.push(filmOnlyRun ? 'the run\'s structural paint assertion failed on a film-only change (something else changed)' : 'the run\'s structural paint assertion passed');
		if (gj.ok) r.problems.push('the gate passed');
		if (s.cannotEvaluate && s.cannotEvaluate.length) r.problems.push(`scan could not evaluate: ${s.cannotEvaluate.slice(0, 3).join('; ')}`);
	} catch (e) { r.problems.push(`unreadable result: ${e.message}`); }
	r.ok = !r.problems.length;
	results.push(r);
	console.log(JSON.stringify({ negative: j.name, ok: r.ok, surface, seqs: r.mutationSeqs, filmed: r.filmed, filmCaught: r.filmCaught, structuralCaught: r.structuralCaught, otherStructural: r.otherStructuralFailures, problems: r.problems }));
}
fs.writeFileSync(path.join(out, 'negatives.json'), JSON.stringify({ build: page ? path.resolve(page) : null, extra, rejudged: !!rejudge, ok: results.every((r) => r.ok), results }, null, 2) + '\n');
console.log(`FO-30 negatives: ${results.filter((r) => r.ok).length}/${results.length} rejected as required`);
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
