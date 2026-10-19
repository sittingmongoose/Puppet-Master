/* Chrome for onboarding tools: pm_cdp input through agent-browser, which owns the real private profile,
 * enforces the machine's cap and removes the profile at stop. close() also removes pm_cdp's empty pipe-launch
 * directory. Tools import { launch, sleep } from here; no recording is started. */
import { launch as cdpLaunch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { coverPage } from './coverage_union.mjs';

const executable = fileURLToPath(new URL('./agent-browser-pipe.mjs', import.meta.url));

let n = 0;
const openBrowsers = new Set();
/* an interrupted tool (Ctrl-C, kill) still closes its browsers and removes their profiles */
for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, async () => { await Promise.all([...openBrowsers].map((c) => c().catch(() => {}))); process.exit(sig === 'SIGINT' ? 130 : 143); });
export { sleep };
export async function launch(opts = {}) {
  const profile = opts.profile || `${tmpdir()}/pm-cdp-profile-${process.pid}-o55-${++n}`;
  let b;
  // The pipe runs in a child Node process. Pass the opt-in explicitly rather
  // than changing the parent's environment or every flag-off CDP connection.
  const args = [...(opts.args || [])];
  if (opts.coverageFile) args.push('--pm7-coverage-transport');
  try { b = await cdpLaunch(Object.assign({}, opts, { args, profile, chrome: executable })); }
  catch (err) { rmSync(profile, { recursive: true, force: true }); throw err; }
  let finishCoverage = null;
  if (opts.coverageFile) {
    try { finishCoverage = await coverPage(b.page, opts.coverageFile); }
    catch (err) { await b.close(); rmSync(profile, { recursive: true, force: true }); throw err; }
  }
  let closed = false;
  const close = async () => {
    if (closed) return; closed = true; openBrowsers.delete(close);
    let coverageError = null;
    if (finishCoverage) try { await finishCoverage(); } catch (err) { coverageError = err; }
    try { await b.close(); } catch (_) {}
    const c = b.chrome;
    if (c && c.exitCode === null && c.signalCode === null) await new Promise((r) => { c.once('exit', r); setTimeout(r, 3000); });
    for (let i = 0; i < 40; i++) { try { rmSync(profile, { recursive: true, force: true }); break; } catch (_) { await sleep(250); } }
    if (coverageError) throw coverageError;
  };
  openBrowsers.add(close);
  return Object.assign({}, b, { close, profile });
}
