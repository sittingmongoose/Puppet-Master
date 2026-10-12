// Test-only N1–N4 adapter. Product sources, frozen driver, and artifact bytes are never written.
// Recording uses only the installed agent-browser helper and its normal global admission.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => { const i = argv.indexOf(name); return i < 0 ? fallback : argv[i + 1]; };
const mode = arg('--mode', 'admission');
const pagePath = resolve(arg('--page'));
const driverPath = resolve(arg('--driver'));
const out = resolve(arg('--out'));
const candidateHead = arg('--candidate-head');
const worktreeHead = arg('--worktree-head', candidateHead);
const sha = (data) => createHash('sha256').update(data).digest('hex');
const pageSha = sha(readFileSync(pagePath));
if (pageSha !== arg('--page-sha256')) throw new Error('HOLD: current page hash does not match the bound artifact');
const driver = readFileSync(driverPath, 'utf8');
if (sha(driver) !== '2d2ed65deadf51b2d4ff1e53551cc37b9b77c85100319f14c9b0a56100180041') {
  throw new Error('HOLD: frozen pill_check.mjs bytes changed');
}
const scanStart = driver.indexOf('function scanScopes(R) {');
const scanEnd = driver.indexOf('\n}\n', scanStart) + 2;
if (scanStart < 0 || scanEnd < scanStart) throw new Error('HOLD: cannot locate the original self-contained collector');
const collectorSource = driver.slice(scanStart, scanEnd);
const collector = Function('return (' + collectorSource + ')')();
if (collector.toString() !== collectorSource) throw new Error('HOLD: collector serialization changed');
const oldScope = "el.closest('#o55-resume,.o55-demo')";
const newScope = "el.closest('#o55-resume,.o55-demo,#o55-tourchip')";
const oldRoots = "['#o55-resume', '.o55-demo']";
const newRoots = "['#o55-resume', '.o55-demo', '#o55-tourchip']";
for (const site of [oldScope, oldRoots]) {
  if (collectorSource.split(site).length !== 2) throw new Error('HOLD: supplementary collector site is not unique');
}
const companionSource = collectorSource.replace(oldScope, newScope).replace(oldRoots, newRoots);
const inverseSource = companionSource.replace(newScope, oldScope).replace(newRoots, oldRoots);
if (inverseSource !== collectorSource) throw new Error('HOLD: supplementary collector changes more than its two authorized selector sites');
const companion = Function('return (' + companionSource + ')')();
if (companion.toString() !== companionSource) throw new Error('HOLD: supplementary collector serialization changed');
mkdirSync(out, { recursive: true });
const result = {
  schema_version: 1, mode, started_utc: new Date().toISOString(), status: 'RUNNING',
  candidate_source_head: candidateHead, worktree_head_at_run: worktreeHead,
  page_sha256: pageSha, page_bytes: readFileSync(pagePath).length,
  helper_sha256: sha(readFileSync(new URL(import.meta.url))),
  frozen_driver_sha256: sha(driver), collector_sha256: sha(collectorSource),
  collector_bytes: Buffer.byteLength(collectorSource), collector_verbatim: true,
  collector_scope_gap: '#o55-tourchip is absent from the frozen scopeOf and rootsFor selectors; eligibility is unchanged.',
  supplementary_collector: { label: 'supplementary floaters/tourchip', sha256: sha(companionSource),
    inverse_projection_sha256: sha(inverseSource), inverse_byte_equal_original: true,
    exact_two_sites: [{ original: oldScope, supplementary: newScope }, { original: oldRoots, supplementary: newRoots }] },
  errors: [], actions: [], cases: [],
  sampling_limitations: 'Functional sampling only. Hardware video is not frame-perfect and this is not exclusive FPS/performance certification.',
};
const save = () => writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2) + '\n');
function command(args) {
  const r = spawnSync('agent-browser', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  const record = { argv: ['agent-browser', ...args], exit_code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message || null };
  result.helper_commands ||= []; result.helper_commands.push(record); save();
  if (r.status !== 0 || r.error) throw new Error('HOLD: normal helper failed: ' + JSON.stringify(record));
  return JSON.parse(r.stdout);
}
let session = null, browser = null;
function stopOwned() {
  if (!session) return;
  const id = session.id;
  result.stop_receipt = command(['stop', id]);
  session = null;
  save();
}
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => {
  result.status = 'HOLD'; result.errors.push('Interrupted: ' + signal); save();
  try { stopOwned(); } catch (e) { result.errors.push(String(e)); save(); }
  process.exit(130);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function setLook(page, look, reduced = false) {
  const [family, themeMode] = look.split('-');
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.evaluate(([f, m]) => {
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', cap(f === 'nier' ? 'basic' : f) + ' ' + cap(m));
    window.PM_NIER.set(f === 'nier');
  }, [family, themeMode]);
  await page.waitForFunction(([f, m]) => document.documentElement.dataset.theme === (f === 'nier' ? 'basic' : f) + '-' + m &&
    (document.documentElement.getAttribute('data-o55-nier') === 'on') === (f === 'nier'), [family, themeMode], { timeout: 10000 });
  await sleep(family === 'nier' ? 2000 : 800);
  return page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier'),
    reduced_media: matchMedia('(prefers-reduced-motion: reduce)').matches, motion: document.documentElement.getAttribute('data-motion') }));
}
async function admission(page) {
  result.environment = await page.evaluate(() => {
    const g = document.createElement('canvas').getContext('webgl');
    const x = g?.getExtension('WEBGL_debug_renderer_info');
    const renderer = x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'none';
    g?.getExtension('WEBGL_lose_context')?.loseContext();
    return { renderer, viewport: { width: innerWidth, height: innerHeight }, DPR: devicePixelRatio, user_agent: navigator.userAgent };
  });
  if (!/Quadro P1000/.test(result.environment.renderer) || /SwiftShader|llvmpipe/i.test(result.environment.renderer)) {
    throw new Error('HOLD: hardware renderer unavailable: ' + result.environment.renderer);
  }
  if (result.environment.viewport.width !== 1920 || result.environment.viewport.height !== 1080 || result.environment.DPR !== 1) {
    throw new Error('HOLD: unexpected normal recording viewport/DPR: ' + JSON.stringify(result.environment));
  }
  await page.goto(pathToFileURL(pagePath).href + '?o55=off', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.PM12_KIMI && window.PM7_SETTINGS_TOME && window.PM7_USAGE && window.O55 && window.PMH && window.toast,
    null, { timeout: 120000 });
  await setLook(page, 'glass-dark');
  await page.screenshot({ path: join(out, 'admission-glass-dark.png') });
  result.visible_state = await page.evaluate(() => ({
    pages: [...document.querySelectorAll('[data-page]')].slice(0, 20).map((e) => ({ tag: e.tagName, page: e.dataset.page, text: e.textContent.trim().slice(0, 70), role: e.getAttribute('role'), tabIndex: e.tabIndex })),
    toast_methods: Object.keys(window.toast),
    floater_glyphs: [...document.querySelectorAll('#o55-resume svg.nx,#o55-tourchip svg.nx,.o55-demopill svg.nx')].map((e) => ({ host: e.closest('[id]')?.id, glyph: e.dataset.nx })),
  }));
  await page.evaluate(() => window.PM_PAGES.go('usage'));
  await sleep(3000);
  result.bridge_targets = await page.evaluate(() => [...document.querySelectorAll('[data-pmh-kind]')].flatMap((e) => {
    const gs = [...e.querySelectorAll(':scope > svg.nx:not(.nx-self), :scope > :not(button,summary,[role="button"],[data-action]) > svg.nx:not(.nx-self)')];
    const r = e.getBoundingClientRect();
    if (!gs.length || r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight) return [];
    return [{ tag: e.tagName, cls: e.className, widget: e.dataset.widget, pmh_kind: e.dataset.pmhKind,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height }, glyphs: gs.map((g) => ({ name: g.dataset.nx, classes: g.getAttribute('class') })),
      menu_buttons: [...e.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim().slice(0, 40), label: b.getAttribute('aria-label'), action: b.dataset.action })) }];
  }));
  await page.screenshot({ path: join(out, 'admission-usage-targets.png') });
  await sleep(1500);
}
try {
  result.global_helper_sessions_before = command(['list']);
  session = command(['start', '--record', join(out, mode + '.mp4'), '--codec', 'h264']);
  result.admitted_session = session; save();
  const spec = arg('--playwright-module', 'playwright-core');
  const { chromium } = await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec);
  browser = await chromium.connectOverCDP(session.cdp_endpoint);
  const pages = browser.contexts()[0].pages().filter((p) => !session.recorder_url || !p.url().startsWith(session.recorder_url));
  if (pages.length !== 1) throw new Error('HOLD: expected exactly one admitted page');
  const page = pages[0];
  page.on('pageerror', (error) => { result.errors.push({ kind: 'pageerror', message: error.message }); save(); });
  page.on('console', (message) => { if (message.type() === 'error') { result.errors.push({ kind: 'console', message: message.text() }); save(); } });
  await admission(page);
  if (mode !== 'admission') throw new Error('HOLD: case mode not implemented: ' + mode);
  result.status = 'ADMISSION_VERIFIED';
} catch (error) {
  result.status = 'HOLD'; result.errors.push({ kind: 'harness', message: String(error), stack: error.stack }); process.exitCode = 2;
} finally {
  if (browser) { try { await browser.close(); } catch (error) { result.errors.push({ kind: 'disconnect', message: String(error) }); } }
  try { stopOwned(); } catch (error) { result.status = 'HOLD'; result.errors.push({ kind: 'stop', message: String(error) }); process.exitCode = 2; }
  result.finished_utc = new Date().toISOString(); save();
  console.log(JSON.stringify({ mode, status: result.status, errors: result.errors, environment: result.environment, cases: result.cases.length }));
}
