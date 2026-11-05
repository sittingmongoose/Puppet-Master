// FO-30 negative regression: every look's one-frame paint loss (pip-steady-mutants.mjs) and Astra's Friendly Light
// mutation, each filmed through the unchanged gate and required to be rejected by the film scan, at the frame the loss
// was painted in, in its own look.
//   node pip-steady-negatives.mjs --page <build.html> --out <fresh-dir> [--looks a,b] [--phases welcome]
//        [--astra <astra mutation-friendly.html>] [--url-base http://host:port/dir/ --serve-dir <dir served there>]
//        [-- <browser-check args, e.g. --sole>]
// A page on another machine's browser (--host) must be served: --serve-dir is where the mutants are written and
// --url-base the URL that serves it. Surfaces alternate (normal, sandbox, ...) unless --sandbox is given.
// One negative passes only when: the mutation fired (PIP_MUTANT / REVIEW_ONE_FRAME in the console) in exactly the
// frames the witness numbers; that page frame was declared visible and reached the film; the scan reports a missing
// paint in that look containing that frame; and the gate fails. The structural half's paint or hanging assertion must
// fail as well (its other assertions, such as the witness's cost on a loaded host, are reported, not counted), except for the
// 'cover' mutation, which leaves Pip untouched (only the film can see it): there it must pass, which shows the film
// half rejects a loss on its own. Anything else (not fired, not filmed, caught elsewhere) fails the negative.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUTATIONS, mutate } from './pip-steady-mutants.mjs';

const all = process.argv.slice(2), dd = all.indexOf('--'), args = dd < 0 ? all : all.slice(0, dd), extra = dd < 0 ? [] : all.slice(dd + 1);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const page = opt('page'), rejudge = opt('rejudge'), out = rejudge || opt('out');
if (!out || (!rejudge && !page)) { console.error('usage: pip-steady-negatives.mjs --page <build.html> --out <fresh-dir> [--looks a,b] [--phases welcome] [--astra file] [--url-base U --serve-dir D] [-- browser-check args]\n       pip-steady-negatives.mjs --rejudge <out-dir>   (judge the kept runs again)'); process.exit(2); }
const gate = fileURLToPath(new URL('./pip-steady-gate.mjs', import.meta.url));
if (!rejudge) fs.mkdirSync(out, { recursive: false });
const serve = opt('serve-dir'), base = opt('url-base');
if (!!serve !== !!base) { console.error('--serve-dir and --url-base go together'); process.exit(2); }
const place = (name, html) => { const dir = serve || path.join(out, 'pages'); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, name), html); return serve ? base.replace(/\/?$/, '/') + name : path.resolve(dir, name); };
const html = rejudge ? null : fs.readFileSync(page, 'utf8');
const jobs = rejudge ? JSON.parse(fs.readFileSync(path.join(out, 'jobs.json'), 'utf8')) : (opt('looks') ? opt('looks').split(',') : Object.keys(MUTATIONS)).map((look, i) => {
	const { out: m, kind } = mutate(html, look);
	return { name: `mutant-${look}`, look, kind, page: place(`fo30-mutant-${look}.html`, m), sandbox: opt('sandbox') ?? String(i % 2), phases: opt('phases', 'welcome'), marker: 'PIP_MUTANT ' };
});
if (!rejudge && opt('astra')) jobs.unshift({ name: 'astra-friendly-light', look: 'friendly-light', kind: 'opacity (Astra)', page: place('fo30-astra-mutation-friendly.html', fs.readFileSync(opt('astra'), 'utf8')), sandbox: opt('sandbox') ?? '0', phases: 'begin', marker: 'REVIEW_ONE_FRAME ' });
if (!rejudge) fs.writeFileSync(path.join(out, 'jobs.json'), JSON.stringify(jobs, null, 1) + '\n');
const results = [];
for (const j of jobs) {
	const dir = path.join(out, j.name), surface = j.sandbox === '1' ? 'sandbox' : 'normal';
	if (rejudge && !fs.existsSync(path.join(dir, 'gate.json'))) { results.push({ name: j.name, look: j.look, kind: j.kind, surface, ok: false, problems: ['not run'] }); continue; }
	const g = rejudge ? { status: null } : spawnSync(process.execPath, [gate, '--page', j.page, '--out', dir, '--sandbox', j.sandbox, '--looks', j.look, '--phases', j.phases, '--', ...extra], { stdio: 'inherit' });
	const r = { name: j.name, look: j.look, kind: j.kind, surface, gateExit: g.status, problems: [] };
	try {
		const gj = JSON.parse(fs.readFileSync(path.join(dir, 'gate.json'), 'utf8')), s = gj.surfaces[0];
		const ev = JSON.parse(fs.readFileSync(path.join(dir, `run-${j.sandbox}`, 'events.json'), 'utf8'));
		const fired = ev.console.filter((c) => c.text.startsWith(j.marker)).map((c) => JSON.parse(c.text.slice(j.marker.length)));
		const lines = fs.readFileSync(path.join(dir, s.witness), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
		const h = lines[0], F = Object.fromEntries(h.fields.map((k, i) => [k, i])), recs = lines.filter((l) => l.kind === 'recs').flatMap((l) => l.recs);
		const strings = lines.filter((l) => l.kind === 'recs' && l.strings).flatMap((l) => l.strings);
		const scan = JSON.parse(fs.readFileSync(path.join(dir, `scan-${j.sandbox}.json`), 'utf8'));
		const filmed = new Set(fs.readFileSync(path.join(dir, `frames-${j.sandbox}.csv`), 'utf8').split('\n').slice(1).map((l) => l.split(',')[1]).filter(Boolean).map(Number));
		r.fired = fired.length;
		if (fired.length !== 1) r.problems.push(`mutation fired ${fired.length} times`);
		const m = fired[0] || {}, at = m.at ?? m.hide, until = m.restore;
		const hit = recs.filter((x) => x[F.t] >= at && x[F.t] < until);
		r.mutationSeqs = hit.map((x) => x[F.seq]);
		r.mutationClass = hit.map((x) => x[F.cls]);
		r.mutationLook = [...new Set(hit.map((x) => strings[x[F.look]]))];
		if (hit.length !== 1) r.problems.push(`the loss spans ${hit.length} page frames, not one`);
		if (hit.some((x) => x[F.cls] !== 'v')) r.problems.push('the loss fell in a frame the page did not declare visible');
		if (r.mutationLook.some((k) => k !== j.look)) r.problems.push(`the loss fell in ${r.mutationLook}`);
		r.filmed = hit.every((x) => filmed.has(x[F.seq]));
		if (!r.filmed) r.problems.push('the frame with the loss never reached the film (capture rate): inconclusive, run again');
		const dip = (s.dips || []).find((d) => d.look === j.look && r.mutationSeqs.some((q) => d.seqs.includes(q)));
		r.filmCaught = !!dip; r.dip = dip || null;
		r.otherDips = (s.dips || []).filter((d) => d !== dip).length;
		if (!dip) r.problems.push('the film scan did not report the loss');
		if (r.otherDips) r.problems.push(`${r.otherDips} other missing-paint runs (false failures?)`);
		r.structuralExit = s.structuralExit; r.scanVerdict = s.verdict; r.filmSha256 = s.filmSha256; r.coverage = s.coverage;
		/* the structural half judged by its own paint and hanging assertions (other assertions, such as the witness's
		   cost on a loaded host, are reported, not counted here) */
		const sum = JSON.parse(fs.readFileSync(path.join(dir, `run-${j.sandbox}`, 'summary.json'), 'utf8'));
		const paintChecks = (sum.results || []).filter((x) => /Pip's head, controller and strings are painted|Pip's head is placed and hangs on its strings/.test(x.name) && !/^.*› (welcome|tiles|begin|smb|start|end):/.test(x.name));
		r.structuralCaught = paintChecks.some((x) => !x.ok);
		r.otherStructuralFailures = (sum.results || []).filter((x) => !x.ok && !paintChecks.includes(x)).map((x) => x.name.split(' › ').pop());
		if (!paintChecks.length) r.problems.push('no structural paint assertion in the run');
		if (j.kind === 'cover' ? r.structuralCaught : !r.structuralCaught) r.problems.push(j.kind === 'cover' ? 'the structural half reported a change it cannot see (something else failed)' : 'the structural half passed a DOM-visible loss');
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
