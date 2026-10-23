/* Browser verifiers share one GPU launcher. --cdp attaches to a caller-owned session;
 * otherwise agent-browser owns Chrome and is stopped on normal and error exits. */
import { execFileSync } from 'node:child_process';

const owned = new Set();
const pages = new WeakMap();
export function gpuPage(browser) { return pages.get(browser); }
export function ownGpuSession(id) { owned.add(id); return () => stop(id); }
function stop(id) {
  if (!owned.delete(id)) return;
  try { execFileSync('agent-browser', ['stop', id], { stdio: 'pipe', timeout: 30000 }); }
  catch (e) { console.error(`agent-browser stop ${id}: ${e.message}`); }
}
process.once('exit', () => { for (const id of [...owned]) stop(id); });
let stopping = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => {
  if (stopping) return;
  stopping = true;
  for (const id of [...owned]) stop(id);
  process.exit(sig === 'SIGINT' ? 130 : 143);
});

export async function launchGpuBrowser(chromium, argv = process.argv.slice(2)) {
  const i = argv.indexOf('--cdp');
  let endpoint = i >= 0 ? argv[i + 1] : null, session;
  if (i >= 0 && !endpoint) throw new Error('--cdp needs an endpoint');
  if (!endpoint) {
    session = JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank'], { encoding: 'utf8', timeout: 60000 }));
    owned.add(session.id); endpoint = session.cdp_endpoint;
    console.log(`GPU session: ${session.id} CDP: ${endpoint}`);
  }
  try {
    const browser = await chromium.connectOverCDP(endpoint);
    let attached;
    if (!session) try { attached = JSON.parse(execFileSync('agent-browser', ['list'], { encoding: 'utf8', timeout: 10000 })).find(s => s.cdp_endpoint === endpoint); } catch {}
    const recorder = session?.recorder_url || attached?.recorder_url;
    const probe = browser.contexts()[0].pages().find(p => !recorder || !p.url().startsWith(recorder));
    if (!probe) throw new Error('No non-recorder page in the GPU session');
    pages.set(browser, probe);
    const renderer = await probe.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl');
      return gl?.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
    });
    if (!renderer || /SwiftShader|llvmpipe|software/i.test(renderer)) throw new Error(`GPU required, renderer=${renderer}`);
    console.log(`GPU: ${renderer}`);
    const close = browser.close.bind(browser);
    browser.close = async () => { try { await close(); } finally { if (session) stop(session.id); } };
    return browser;
  } catch (e) { if (session) stop(session.id); throw e; }
}
