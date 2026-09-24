/* Chrome for the onboarding tools: pm_cdp's launch with one private profile per browser, and a close() that waits for
 * Chrome and its helper processes to exit and then removes the profile (each is ~150 MB, and the shared /tmp is a
 * 16 GB tmpfs that every agent on the machine writes to). Tools import { launch, sleep } from here. */
import { launch as cdpLaunch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

let n = 0;
const openBrowsers = new Set();
/* an interrupted tool (Ctrl-C, kill) still closes its browsers and removes their profiles */
for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, async () => { await Promise.all([...openBrowsers].map((c) => c().catch(() => {}))); process.exit(sig === 'SIGINT' ? 130 : 143); });
export { sleep };
export async function launch(opts = {}) {
  const profile = opts.profile || `${tmpdir()}/pm-cdp-profile-${process.pid}-o55-${++n}`;
  const b = await cdpLaunch(Object.assign({}, opts, { profile }));
  let closed = false;
  const close = async () => {
    if (closed) return; closed = true; openBrowsers.delete(close);
    try { await b.close(); } catch (_) {}
    const c = b.chrome;
    if (c && c.exitCode === null && c.signalCode === null) await new Promise((r) => { c.once('exit', r); setTimeout(r, 3000); });
    for (let i = 0; i < 40; i++) { try { rmSync(profile, { recursive: true, force: true }); return; } catch (_) { await sleep(250); } }
  };
  openBrowsers.add(close);
  return Object.assign({}, b, { close, profile });
}
