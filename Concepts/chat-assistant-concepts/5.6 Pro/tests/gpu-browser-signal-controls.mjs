/* CPU-only subprocess controls. The fake CLI never starts or stops real Chrome. */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const dir = mkdtempSync(path.join(tmpdir(), 'c56-gpu-signal-'));
const helper = new URL('./gpu-browser.mjs', import.meta.url).href;
const cli = path.join(dir, 'agent-browser');
writeFileSync(cli, `#!${process.execPath}\nimport('node:fs').then(fs => fs.appendFileSync(process.env.C56_STOP_LOG, JSON.stringify(process.argv.slice(2))+'\\n'));\n`, { mode: 0o755 });
async function control(name, source, signal, expectedCode, expectedStops, forwarded) {
  const log = path.join(dir, name + '.jsonl');
  const child = spawn(process.execPath, ['--input-type=module', '-e', `import {ownGpuSession} from ${JSON.stringify(helper)}; ${source}`], {
    env: { ...process.env, PATH: dir + path.delimiter + process.env.PATH, C56_STOP_LOG: log },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let out = '', err = '';
  child.stdout.on('data', b => { out += b; }); child.stderr.on('data', b => { err += b; });
  const completion = new Promise(resolve => child.once('exit', code => resolve(code)));
  const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
  try {
    if (signal) {
      while (!out.includes('READY') && child.exitCode == null) await new Promise(r => setTimeout(r, 10));
      assert.ok(out.includes('READY'), `${name}: no ready marker: ${err}`);
      child.kill(signal);
    }
    assert.equal(await completion, expectedCode, `${name}: ${err}`);
    const calls = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
    assert.deepEqual(calls, expectedStops, name);
    assert.equal(out.includes('FORWARDED'), forwarded, name);
    console.log('PASS ' + name);
  } finally { clearTimeout(timer); if (child.exitCode == null) child.kill('SIGKILL'); }
}
try {
  await control('import-only parent forwards SIGTERM', `process.on('SIGTERM',()=>{console.log('FORWARDED');process.exit(0)}); console.log('READY');setInterval(()=>{},1000);`, 'SIGTERM', 0, [], true);
  await control('owned worker stops exactly once on SIGTERM', `ownGpuSession('mock-session');console.log('READY');setInterval(()=>{},1000);`, 'SIGTERM', 143, [['stop', 'mock-session']], false);
  await control('owned worker stops exactly once on normal exit', `ownGpuSession('mock-session');`, null, 0, [['stop', 'mock-session']], false);
  console.log('gpu-browser-signal-controls: 3/3 PASS (no real GPU sessions)');
} finally { rmSync(dir, { recursive: true, force: true }); }
