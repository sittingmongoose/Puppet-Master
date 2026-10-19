#!/usr/bin/env node
// Lead-owned GPU probe. H-fix supplies this script without running it.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { parseArgs, selectMatrix } from './pm7_parity.mjs';

const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '../../../..');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const help = `Usage: node pm7_parity_revalidate.mjs --out /absolute/evidence/new-run [options]
  --ref REF           Committed main ancestor to probe; default origin/main (fetch first)
  --page PATH         Published page; default Concepts/PMConcept7.html
  --subset FILTERS    looks/pages/viewports/motions only; same syntax as parity harness
  --concurrency N     Owned GPU browser cap, default 1; integer 1..4
  --list              Print transient selection without opening a browser or writing files
  --help              This help
Uses exact main-vs-itself captures with the new state guard. No removal/tolerance options.
Only menus, popovers, hover and focus are selected. Output retains input bytes and provenance.
`;

function main(argv) {
  const options = { ref: 'origin/main', page: 'Concepts/PMConcept7.html', concurrency: '1', subsets: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') { console.log(help); return 0; }
    if (arg === '--list') { options.list = true; continue; }
    if (!['--out', '--ref', '--page', '--subset', '--concurrency'].includes(arg)) throw Error('Unknown option ' + arg);
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
  const harnessArgs = ['main.html', 'main.html', '--concurrency', options.concurrency, '--subset', 'states=' + transientStates.join(',')];
  for (const subset of options.subsets) harnessArgs.push('--subset', subset);
  const selected = selectMatrix(matrix, parseArgs(harnessArgs).filters);
  if (options.list) { console.log(JSON.stringify(selected, null, 2)); return 0; }
  if (!options.out || !isAbsolute(options.out)) throw Error('--out requires a new absolute directory outside the repository');
  const out = resolve(options.out), fromRoot = relative(root, out);
  if (!fromRoot.startsWith('..' + sep) && !isAbsolute(fromRoot)) throw Error('Raw probe evidence must be outside the repository');
  if (existsSync(out)) throw Error('Output directory exists; choose a new --out');
  const git = args => execFileSync('git', args, { cwd: root });
  const inputHead = git(['rev-parse', '--verify', '--end-of-options', options.ref + '^{commit}']).toString().trim();
  git(['merge-base', '--is-ancestor', inputHead, 'origin/main']);
  const input = git(['show', inputHead + ':' + options.page]);
  mkdirSync(out, { recursive: true });
  const inputPath = join(out, 'main.html');
  writeFileSync(inputPath, input);
  harnessArgs.splice(0, 2, inputPath, inputPath);
  harnessArgs.push('--out', join(out, 'parity'));
  const record = { version: 1, started: new Date().toISOString(),
    input: { ref: options.ref, head: inputHead, page: options.page, sha256: sha256(input), bytes: input.length },
    harnessHead: git(['rev-parse', 'HEAD']).toString().trim(),
    scriptSha256: sha256(readFileSync(fileURLToPath(import.meta.url))), matrixSha256: sha256(matrixBytes),
    transientStates, planned: selected.count, command: [process.execPath, join(here, 'pm7_parity.mjs'), ...harnessArgs],
    scope: 'New guarded captures of the selected transient-state subset on pinned main. Rest and onboarding-welcome are omitted; no retrospective assertion about earlier screenshot files.',
    result: 'RUNNING' };
  const save = () => writeFileSync(join(out, 'probe.json'), JSON.stringify(record, null, 2) + '\n');
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
