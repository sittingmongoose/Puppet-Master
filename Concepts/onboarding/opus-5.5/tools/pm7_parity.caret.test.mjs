// Opt-in GPU regression: one owned agent-browser at a time, sequential runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

test('caret-only changes and unsampled custom-layout paths cannot pass', {
  skip: process.env.PM7_PARITY_GPU_REGRESSION !== '1', timeout: 240_000
}, async () => {
  const command = promisify(execFile), directory = dirname(fileURLToPath(import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), 'pm7-caret-regression-'));
  const retained = !!process.env.PM7_PARITY_REGRESSION_OUT;
  const out = retained ? resolve(process.env.PM7_PARITY_REGRESSION_OUT) : join(scratch, 'results');
  mkdirSync(out);
  const baseline = `<!doctype html><html data-theme="basic-dark" data-motion="reduced"><head><meta charset="utf-8"><style>
body { margin:0; background:white; color:black; }
#probe { margin:20px; width:300px; height:100px; transition:all 1s; caret-color:rgb(10,20,30); }
</style></head><body><textarea id="probe">Caret transition probe</textarea><script>
window.PM_THEME={}; window.PM_NIER={setTransition(){},wanted(){return false},on(){return false},set(){}};
window.PM_PAGES={current:'dashboard',go(route){this.current=route}}; window.O55={};
window.PM7_SETTINGS_TOME={setChromeThemeFamily(){},setChromeThemeMode(){}};
window.PM12_KIMI={setSettingFromHost(key,value){document.documentElement.setAttribute('data-motion',value?'reduced':'full')}};
</script></body></html>`;
  const candidate = baseline.replace('caret-color:rgb(10,20,30)', 'caret-color:rgb(200,100,50)');
  const closed = baseline.replace('</script>', `
const closedHost=document.createElement('div'); document.body.appendChild(closedHost);
closedHost.attachShadow({mode:'closed'}).innerHTML='<span>Closed layout</span>';
getComputedStyle(document.documentElement).getPropertyValue('--probe-read');
</script>`);
  const matrix = { version: 1, looks: ['basic-dark'], motions: ['reduced'],
    viewports: [{ id: 'wide', width: 1600, height: 900 }],
    pages: [{ id: 'home', route: 'dashboard', assert: '#probe' }],
    states: [{ id: 'rest', pages: '*', steps: [] }, { id: 'focus', pages: '*',
      steps: [{ action: 'focus', selector: '#probe' }] }, { id: 'no-transition', pages: '*',
      steps: [{ action: 'eval', script: "document.getElementById('probe').style.transitionProperty='none'" }] }] };
  const paths = { baseline: join(scratch, 'baseline.html'), candidate: join(scratch, 'candidate.html'), closed: join(scratch, 'closed.html'), matrix: join(scratch, 'matrix.json') };
  writeFileSync(paths.baseline, baseline); writeFileSync(paths.candidate, candidate);
  writeFileSync(paths.closed, closed);
  writeFileSync(paths.matrix, JSON.stringify(matrix));
  const hash = value => createHash('sha256').update(value).digest('hex');
  writeFileSync(join(out, 'fixture-hashes.json'), JSON.stringify({ baseline: hash(baseline), candidate: hash(candidate), closed: hash(closed), matrix: hash(JSON.stringify(matrix)) }, null, 2) + '\n');
  async function run(name, right, left = paths.baseline, completeCoverage = true) {
    let exit = 0, stdout = '', stderr = '';
    try {
      ({ stdout, stderr } = await command(process.execPath, [join(directory, 'pm7_parity.mjs'), left, right,
        '--matrix', paths.matrix, '--concurrency', '1', '--out', join(out, name)],
      { cwd: resolve(directory, '../../../..'), env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, maxBuffer: 2 ** 20 }));
    } catch (error) {
      if (error.code !== 1) throw error;
      exit = error.code; stdout = error.stdout; stderr = error.stderr;
    }
    writeFileSync(join(out, name + '.log'), stdout + stderr);
    const report = JSON.parse(readFileSync(join(out, name, 'report.json')));
    assert.equal(report.counts.completed, 3); assert.equal(report.counts.errors, 0);
    assert(report.rows.every(row => row.customCoverageComplete === completeCoverage && row.stateEqual && row.requests.equal));
    assert(report.rows.every(row => row.pixels.rawDiffPixels === 0));
    assert(report.rows.every(row => row.caretPreparation.baseline.unsettledAnimations === 0 && row.caretPreparation.candidate.unsettledAnimations === 0));
    return { exit, report };
  }
  try {
    const control = await run('control', paths.baseline);
    assert.equal(control.exit, 0); assert.equal(control.report.rawExactVerdict, 'PASS');
    assert(control.report.rows.every(row => row.styles.differingElements === 0));
    const mutant = await run('mutation', paths.candidate);
    assert.equal(mutant.exit, 1); assert.equal(mutant.report.rawExactVerdict, 'FAIL');
    for (const row of mutant.report.rows) {
      assert.equal(row.verdict, 'FAIL'); assert.equal(row.styles.differingElements, 1);
      const changes = row.styles.differences.flatMap(item => item.properties || []);
      assert.equal(changes.length, 1); assert.equal(changes[0].property, 'caret-color');
      assert.equal(changes[0].baseline, 'rgb(10, 20, 30)');
      assert.equal(changes[0].candidate, 'rgb(200, 100, 50)');
    }
    assert(mutant.report.rows.find(row => row.state === 'rest').caretPreparation.baseline.finishedCaretTransitions > 0);
    const inaccessible = await run('inaccessible-layout', paths.closed, paths.closed, false);
    assert.equal(inaccessible.exit, 1); assert.equal(inaccessible.report.rawExactVerdict, 'FAIL');
    assert(inaccessible.report.rows.every(row => row.styles.differingElements === 0 && row.verdictReasons.includes('unsampled-custom-layout')));
    writeFileSync(join(out, 'validation.json'), JSON.stringify({ result: 'PASS', controlExit: control.exit, mutationExit: mutant.exit,
      inaccessibleLayoutExit: inaccessible.exit,
      states: mutant.report.rows.map(row => ({ state: row.state, verdict: row.verdict, rawPixels: row.pixels.rawDiffPixels, differingElements: row.styles.differingElements })) }, null, 2) + '\n');
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});
