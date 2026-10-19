#!/usr/bin/env node
// Lead-owned guarded transient comparison. New evidence only; never historical validation.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { parseArgs, selectMatrix } from './pm7_parity.mjs';

const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '../../../..');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const scope = 'NEW EVIDENCE: guarded transient comparison of baseline and candidate inputs with the current harness. '
  + 'Rest and onboarding-welcome prefixes are omitted; original preparation, clocks and paint history are not reproduced. '
  + 'This does not validate or replace historical A captures. Historical A state validation remains open.';
const help = `Usage: node pm7_parity_revalidate.mjs --baseline-ref REF --candidate-ref REF --out /absolute/evidence/new-run [options]
  --baseline-ref REF  Committed baseline input (required for a comparison)
  --candidate-ref REF Committed candidate input (required for a comparison)
  --page PATH         Published page; default Concepts/PMConcept7.html
  --subset FILTERS    looks/pages/viewports/motions only; same syntax as parity harness
  --concurrency N     Owned GPU browser cap, default 1; integer 1..4
  --list              Print transient selection without opening a browser or writing files
  --help              This help
Runs both inputs through the current guarded harness. No removal/tolerance options.
Only menus, popovers, hover and focus are selected. Output retains both inputs and provenance.
${scope}
`;

function main(argv) {
  const options = { page: 'Concepts/PMConcept7.html', concurrency: '1', subsets: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') { console.log(help); return 0; }
    if (arg === '--list') { options.list = true; continue; }
    if (!['--out', '--baseline-ref', '--candidate-ref', '--page', '--subset', '--concurrency'].includes(arg)) throw Error('Unknown option ' + arg);
    const value = argv[++i];
    if (!value || value.startsWith('--')) throw Error(arg + ' requires a value');
    if (arg === '--subset') {
      if (value.split(';').some(part => !/^(looks|pages|viewports|motions)=/.test(part))) throw Error('Only looks/pages/viewports/motions subsets are allowed');
      options.subsets.push(value);
    } else options[arg.slice(2)] = value;
  }
  if (!/^\d+$/.test(options.concurrency) || Number(options.concurrency) < 1 || Number(options.concurrency) > 4) throw Error('Concurrency must be 1..4');
  const pages = ['Concepts/PMConcept7.html', 'Concepts/Onboarding concepts/TestOpus5.5PmConcept.html', 'Concepts/HomeTestPMConcept7.html', 'Concepts/LeftRailPMConcept7.html'];
  if (!pages.includes(options.page)) throw Error('Choose one of the four published pages');
  const matrixPath = join(here, 'pm7_parity_states.json'), matrixBytes = readFileSync(matrixPath), matrix = JSON.parse(matrixBytes);
  const transientStates = matrix.states.filter(state => /menu|popover/.test(state.id)
    || state.steps.some(step => step.action === 'hover' || step.action === 'focus')).map(state => state.id);
  const harnessArgs = ['baseline.html', 'candidate.html', '--concurrency', options.concurrency, '--subset', 'states=' + transientStates.join(',')];
  for (const subset of options.subsets) harnessArgs.push('--subset', subset);
  const selected = selectMatrix(matrix, parseArgs(harnessArgs).filters);
  console.log(scope);
  console.log(`Selected transient comparisons: ${selected.count} (${selected.groups.length} groups; derived from selectMatrix).`);
  if (options.list) { console.log(JSON.stringify(selected, null, 2)); return 0; }
  if (!options['baseline-ref'] || !options['candidate-ref']) throw Error('--baseline-ref and --candidate-ref are required');
  if (!options.out || !isAbsolute(options.out)) throw Error('--out requires a new absolute directory outside the repository');
  const out = resolve(options.out), fromRoot = relative(root, out);
  if (!fromRoot.startsWith('..' + sep) && !isAbsolute(fromRoot)) throw Error('Raw comparison evidence must be outside the repository');
  if (existsSync(out)) throw Error('Output directory exists; choose a new --out');
  const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 128 * 1024 ** 2 });
  const inputs = ['baseline', 'candidate'].map(side => {
    const ref = options[side + '-ref'];
    const head = git(['rev-parse', '--verify', '--end-of-options', ref + '^{commit}']).toString().trim();
    const bytes = git(['show', head + ':' + options.page]);
    return { side, ref, head, bytes, path: join(out, side + '.html') };
  });
  mkdirSync(out, { recursive: true });
  for (const input of inputs) writeFileSync(input.path, input.bytes);
  harnessArgs.splice(0, 2, ...inputs.map(input => input.path));
  harnessArgs.push('--out', join(out, 'parity'));
  const record = { version: 2, kind: 'pm7-guarded-transient-comparison', newEvidence: true, started: new Date().toISOString(),
    inputs: inputs.map(input => ({ side: input.side, ref: input.ref, head: input.head, page: options.page,
      path: input.path, sha256: sha256(input.bytes), bytes: input.bytes.length })),
    harnessHead: git(['rev-parse', 'HEAD']).toString().trim(),
    harnessSha256: sha256(readFileSync(join(here, 'pm7_parity.mjs'))),
    scriptSha256: sha256(readFileSync(fileURLToPath(import.meta.url))), matrixSha256: sha256(matrixBytes),
    transientStates, planned: selected.count, command: [process.execPath, join(here, 'pm7_parity.mjs'), ...harnessArgs],
    scope, historicalCaptureValidation: 'OPEN; this comparison makes no assertion about historical A captures',
    result: 'RUNNING' };
  const save = () => writeFileSync(join(out, 'comparison.json'), JSON.stringify(record, null, 2) + '\n');
  save();
  const child = spawnSync(process.execPath, [join(here, 'pm7_parity.mjs'), ...harnessArgs], { cwd: root, stdio: 'inherit' });
  record.finished = new Date().toISOString();
  record.exitCode = child.status; record.signal = child.signal;
  record.result = child.error ? String(child.error) : child.status === 0 ? 'PASS' : child.status === 1 ? 'DIFFERENCES' : 'ERROR';
  save();
  return child.status ?? 2;
}

try { process.exitCode = main(process.argv.slice(2)); }
catch (error) { console.error(String(error.stack || error)); process.exitCode = 2; }
