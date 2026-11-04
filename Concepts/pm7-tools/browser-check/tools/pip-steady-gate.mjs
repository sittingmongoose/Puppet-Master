// Complete FO-30 gate: structural assertions AND every encoded frame of the same GPU recording.
// node .../pip-steady-gate.mjs --page <build.html> --out <fresh-dir> [--sandbox 0|1] [--reps 3]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const kit = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const page = opt('page'), out = opt('out'), sandbox = opt('sandbox');
if (!page || !out || (sandbox !== undefined && !['0', '1'].includes(sandbox))) {
  console.error('usage: pip-steady-gate.mjs --page <build> --out <fresh-dir> [--sandbox 0|1] [--reps 3]'); process.exit(2);
}
fs.mkdirSync(out, { recursive: false });
const results = [];
for (const s of sandbox === undefined ? ['0', '1'] : [sandbox]) {
  const film = path.resolve(out, `pip-${s}.mp4`);
  const run = spawnSync('browser-check', ['run', path.join(kit, 'checks/pip-steady.check.mjs'), '--set', `page=${page}`, '--set', `sandbox=${s}`, '--set', `reps=${opt('reps', '3')}`, '--record', film, '--out', path.resolve(out, `run-${s}`)], { stdio: 'inherit' });
  // Scan even when structural assertions failed: the two observations are independent.
  const scan = spawnSync(process.execPath, [fileURLToPath(new URL('../../../onboarding/opus-5.5/tools/pip_body_scan.mjs', import.meta.url)), film, '--out', path.resolve(out, `counts-${s}.csv`)], { encoding: 'utf8' });
  fs.writeFileSync(path.join(out, `scan-${s}.json`), scan.stdout || '');
  fs.writeFileSync(path.join(out, `scan-${s}.stderr`), scan.stderr || '');
  let data;
  try { data = JSON.parse(scan.stdout); } catch { /* malformed/absent scan is a failure */ }
  const ok = run.status === 0 && scan.status === 0 && data?.frames > 0 && data?.median >= 800 && data?.dips?.length === 0;
  const result = { sandbox: s, structuralExit: run.status, scanExit: scan.status, frames: data?.frames, median: data?.median, dips: data?.dips, ok };
  results.push(result); console.log(JSON.stringify(result));
}
fs.writeFileSync(path.join(out, 'gate.json'), JSON.stringify(results, null, 2) + '\n');
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
