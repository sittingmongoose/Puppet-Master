#!/usr/bin/env node
/* One command, sequential GPU sessions, both targets, one summary.
 * node tests/port-suite.mjs --page both --build --out /tmp/c56port-tests/integrated
 * --only wonderer|layout|hover|questions|turn|history|orbit|neon[,..] narrows a rerun.
 * --wg-only core|r1|r2|rx|ax narrows Wonderer (default: every existing check).
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, openSync, closeSync, rmSync } from 'node:fs';
import path from 'node:path';
import { CHAT_ROOT, chatTarget } from './chat-target.mjs';

const argv = process.argv.slice(2), opt = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : argv[i + 1]; };
const pageArg = opt('--page', 'both');
if (!['standalone', 'pm7', 'both'].includes(pageArg)) throw new Error('--page standalone|pm7|both');
const pages = pageArg === 'both' ? ['standalone', 'pm7'] : [pageArg];
const out = path.resolve(opt('--out', '/tmp/c56port-tests/suite')); mkdirSync(out, { recursive: true });
const repo = path.resolve(CHAT_ROOT, '../../..'), summary = [];
const stages = ['wonderer', 'layout', 'hover', 'questions', 'turn', 'history', 'orbit', 'neon'];
const only = opt('--only', stages.join(',')).split(',');
if (only.some(s => !stages.includes(s))) throw new Error('Unknown --only stage');
function run(command, args, log, env = {}) {
  return new Promise(resolve => {
    const fd = openSync(log, 'w'), child = spawn(command, args, { cwd: CHAT_ROOT, env: { ...process.env, ...env }, stdio: ['ignore', fd, fd] });
    const timer = setTimeout(() => child.kill('SIGTERM'), 45 * 60 * 1000);
    child.on('error', e => { clearTimeout(timer); closeSync(fd); resolve({ code: 2, error: e.message }); });
    child.on('exit', (code, signal) => { clearTimeout(timer); closeSync(fd); resolve({ code: code ?? 2, signal }); });
  });
}
if (argv.includes('--build')) {
  for (const target of pages) {
    const buildFile = target === 'pm7' ? path.join(out, 'PMConcept7.html') : path.join(CHAT_ROOT, 'index.html');
    const args = target === 'pm7' ? [path.join(repo, 'Concepts/onboarding/opus-5.5/tools/build.py'), '--out', buildFile] : [path.join(CHAT_ROOT, 'build.py')];
    const b = await run('python3', args, path.join(out, `${target}-build.log`));
    if (b.code) throw new Error(`Build failed: ${target}; see ${out}/${target}-build.log`);
  }
}
for (const page of pages) {
  const file = path.resolve(opt(page === 'pm7' ? '--pm7-file' : '--standalone-file', opt('--file', page === 'pm7' ? path.join(out, 'PMConcept7.html') : path.join(CHAT_ROOT, 'index.html'))));
  // Validate argument resolution once before opening a browser.
  chatTarget(['--page', page, '--file', file]);
  for (const suite of only) {
    const json = path.join(out, `${page}-${suite}.json`), log = path.join(out, `${page}-${suite}.log`);
    rmSync(json, { force: true });
    const script = suite === 'wonderer' ? 'tests/wonderer-grill-verify.mjs' : suite === 'layout' ? 'tests/carry-over-layout-verify.mjs' : `${suite === 'hover' ? 'hover-tip' : suite}-verify.mjs`;
    const args = [script, '--page', page, '--file', file];
    if (suite === 'wonderer') args.push('--browser');
    if (suite !== 'hover') args.push(suite === 'history' ? '--out' : '--json', json);
    if (suite === 'layout' && argv.includes('--sweep')) args.push('--sweep');
    if (argv.includes('--reduced') && ['questions', 'history', 'neon'].includes(suite)) args.push('--reduced');
    if (opt('--looks') && suite === 'layout') args.push('--looks', opt('--looks'));
    if (opt('--looks') && suite === 'neon') args.push('--themes', opt('--looks'));
    console.log(`RUN ${page} ${suite}`);
    const exit = await run(process.execPath, args, log, { WGV_ONLY: opt('--wg-only', ''), PM56_ROOT: CHAT_ROOT });
    let rows = [], report;
    try { report = JSON.parse(readFileSync(json, 'utf8')); rows = report.results || []; } catch {}
    if (suite === 'hover') rows = readFileSync(log, 'utf8').split('\n').filter(l => /^(PASS|FAIL)\s/.test(l)).map(l => ({ name: l.replace(/^(PASS|FAIL)\s+/, ''), pass: l.startsWith('PASS') }));
    const fail = rows.filter(r => r.pass === false || r.ok === false), skipped = rows.filter(r => r.skip || r.skipped || r.ok === null);
    const row = { page, suite, checks: rows.length, counts: report?.counts, pass: rows.length - fail.length - skipped.length, fail: fail.length, skip: skipped.length, exit: exit.code, file, log,
      failures: fail.map(r => ({ id: r.id || r.name || r.label, owner: r.owner || (suite === 'wonderer' ? 'c56port-found / c56port-looks / c56port-nier / c56port-demo (see check)' : 'c56port-tests (triage)'), detail: r.measured || r.detail || r.error })) };
    if (exit.code && !fail.length) { row.fail++; row.failures.push({ id: 'HARNESS', owner: 'c56port-tests', detail: exit.error || `exit ${exit.code}; see ${log}` }); }
    summary.push(row); writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`${page} ${suite}: ${row.pass} PASS ${row.fail} FAIL ${row.skip} SKIP (exit ${row.exit})`);
  }
}
for (const page of pages) {
  const rows = summary.filter(r => r.page === page);
  console.log(`${page}: ${rows.reduce((n, r) => n + r.pass, 0)} PASS, ${rows.reduce((n, r) => n + r.fail, 0)} FAIL, ${rows.reduce((n, r) => n + r.skip, 0)} SKIP`);
  for (const r of rows) for (const f of r.failures) console.log(`  ${r.suite} ${f.id} — ${f.owner}`);
}
console.log(`Summary: ${out}/summary.json`);
process.exitCode = summary.some(r => r.fail || r.exit) ? 1 : 0;
