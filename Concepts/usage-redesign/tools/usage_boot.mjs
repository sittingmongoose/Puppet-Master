/* Usage boot check: load a page with the redesigned Usage page and a reference page with the old Prism Usage page
 * headless on file:// with ?o55=off, and confirm the new page boots without new console errors and keeps every outside
 * contract of the old Usage page (understand/cur-xref.md section 10): the chat context module, the pm6-js-usage bridge,
 * NieR Mode's and Pod 042's PM7_USAGE.data.context, the status bar, Retro Light's darker green, Home, all eight themes
 * and NieR Mode.
 *   node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir>                    # see "which pages" below
 *   node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir> --published        # Concepts/PMConcept7.html
 *   node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir> --page /tmp/x.html # a private build.py --out build
 *   node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir> [page-under-test] [reference-page]
 * Which pages: the Usage page is published through opus-5.5 build.py (step 2b, usage_layer). Published mode tests
 * Concepts/PMConcept7.html (or --page) against a fresh private reference build without the Usage layer
 * (build.py --out <out-dir>/reference-no-usage.html --no-usage, the same sources with the old page). It is the default
 * once the review copy Concepts/UsageTestPMConcept7.html is gone; while it exists, the default is that review copy
 * against its input, Concepts/Onboarding concepts/TestOpus5.5PmConcept.html (or against the --no-usage reference build
 * when build.py --publish-pm7 has already put the new Usage page into TestOpus in this working tree).
 * Writes <out-dir>/usage-boot.json (never into the repository), prints the summary, exits 1 when a check fails.
 * Each browser gets a private profile that chrome.mjs deletes on close. No screenshots. */
import { launch, sleep } from '../../onboarding/opus-5.5/tools/chrome.mjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const concepts = resolve(here, '../..');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i === -1) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const pageArg = flag('--page');
const published = args.includes('--published') || !!pageArg; if (args.includes('--published')) args.splice(args.indexOf('--published'), 1);
const out = resolve(args[0] || '/tmp/usage-boot');
mkdirSync(out, { recursive: true });
const reviewCopy = join(concepts, 'UsageTestPMConcept7.html');
const testOpus = join(concepts, 'Onboarding concepts', 'TestOpus5.5PmConcept.html');
const USAGE_MARK = '<!-- USAGE:BODY:START -->';
/* the old-page reference: a fresh build.py --out <out-dir>/reference-no-usage.html --no-usage */
const referenceBuild = () => {
  const base = join(out, 'reference-no-usage.html');
  const r = spawnSync('python3', [join(concepts, 'onboarding', 'opus-5.5', 'tools', 'build.py'), '--out', base, '--no-usage'], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('reference build failed:', (r.stderr || '') + (r.stdout || '')); process.exit(2); }
  return base;
};
let pages;
if (args[1] && !published) {
  pages = { base: resolve(args[2] || testOpus), usage: resolve(args[1]) };
} else if (!published && existsSync(reviewCopy)) {
  /* review copy against its input; if build.py --publish-pm7 ran in this working tree, TestOpus already carries the new
   * Usage page and is no old-page reference, so use the --no-usage build instead */
  pages = { base: readFileSync(testOpus, 'utf8').includes(USAGE_MARK) ? referenceBuild() : testOpus, usage: reviewCopy };
} else {
  const usage = resolve(pageArg || join(concepts, 'PMConcept7.html'));
  if (!readFileSync(usage, 'utf8').includes(USAGE_MARK)) {
    console.error(`${usage} has no Usage band (${USAGE_MARK}): publish with opus-5.5 build.py --publish-pm7 first`);
    process.exit(2);
  }
  pages = { base: referenceBuild(), usage };
}
console.error(`usage_boot: page ${pages.usage} against reference ${pages.base}`);
const THEMES = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
/* the same error in both pages carries a different file and line; compare the message only */
const norm = (e) => e.replace(/file:\/\/\S+?\.html(:\d+)*(:\d+)?/g, '<page>').replace(/\s+/g, ' ').trim();

async function runPage(name, file) {
  const { page, close } = await launch({ width: 1600, height: 1000 });
  try {
    const t0 = Date.now();
    await page.goto(pathToFileURL(file).href + '?o55=off');
    const wallLoadMs = Date.now() - t0;
    await sleep(3000);
    const r = { wallLoadMs };

    r.boot = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      const f = {};
      const U = window.PM7_USAGE;
      f.pmuApp = !!document.getElementById('pmuApp');
      f.oldApp = !!document.getElementById('pm7UsageApp');
      f.ctxApi = !!(window.PM7_CONTEXT && ['enhance', 'openDetails', 'compact'].every((k) => typeof window.PM7_CONTEXT[k] === 'function'));
      f.ctxWraps = document.querySelectorAll('.context-usage').length;
      f.ctxReady = document.querySelectorAll('.context-usage[data-pm7-context-ready]').length;
      f.ctxPops = document.querySelectorAll('.context-hover-module.pm7ctx-pop').length;
      const bs = window.PM7_USAGE_BRIDGE_STATS;
      f.bridge = bs ? { actions: bs.action_registration_count, subscriptions: bs.subscription_count, failures: bs.failure_count, init: bs.init_count,
        initialized: !!(window.__PM7_USAGE_BRIDGE_STATE_V1__ && window.__PM7_USAGE_BRIDGE_STATE_V1__.initialized) } : null;
      f.api = U ? ['spinRefresh', 'exportJson', 'rerender', 'injectIcons', 'setCooldown', 'pm7FlushCooldown', 'appendUsageAttempt', 'appendLedger',
        'syncNavInk', 'render', 'roomWidgets', 'setRoomDetail'].filter((k) => typeof U[k] !== 'function') : 'missing';
      f.apiData = U ? { accounts: (U.data.accounts || []).length, providers: (U.data.providers || []).length, rooms: Object.keys(U.rooms || {}).length,
        logs: ['command_log', 'receipt_log', 'event_log'].every((k) => Array.isArray(U[k])), state: !!U.state, wiring: !!U.wiring } : null;
      f.context = U && U.data && U.data.context ? { used: U.data.context.used, limit: U.data.context.limit } : null;
      const sb = document.querySelector('.pm7-statusbar');
      f.statusbar = sb ? { display: getComputedStyle(sb).display, h: Math.round(sb.getBoundingClientRect().height) } : null;
      const root = document.documentElement, prev = root.getAttribute('data-theme');
      root.setAttribute('data-theme', 'retro-light');
      f.retroLightLime = getComputedStyle(root).getPropertyValue('--accent-lime').trim();
      root.setAttribute('data-theme', prev);
      /* fixture parity: the data the new page carries against the old page's (timestamps are boot-relative) */
      f.dataJson = U ? JSON.stringify(U.data, (k, v) => (k === 'occurred_at' ? undefined : v)) : null;

      /* the Assistant context ring opens its pm7ctx popup */
      const wraps = [...document.querySelectorAll('.context-usage')];
      const wrap = wraps.find((w) => w.getClientRects().length) || wraps[0];
      if (wrap) {
        (wrap.querySelector('svg') || wrap).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        await sleep(500);
        const mod = document.querySelector('.context-hover-module.pm7ctx-pop.is-open');
        const rect = mod ? mod.getBoundingClientRect() : null;
        f.ctxPopOpen = { open: !!mod, w: rect ? Math.round(rect.width) : 0, h: rect ? Math.round(rect.height) : 0, head: !!(mod && mod.querySelector('.pm7ctx-head')) };
        (wrap.querySelector('svg') || wrap).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        await sleep(400);
      } else f.ctxPopOpen = null;

      /* the Usage page */
      window.PM_PAGES.go('usage'); await sleep(900);
      const panel = document.getElementById('panel-usage');
      f.usageActive = !!(panel && panel.classList.contains('active'));
      const shell = document.getElementById('pmuApp') || document.getElementById('pm7UsageApp');
      const sr = shell ? shell.getBoundingClientRect() : null;
      f.usageShell = sr ? { w: Math.round(sr.width), h: Math.round(sr.height) } : null;
      if (document.getElementById('pmuApp')) {
        const app = document.getElementById('pmuApp');
        f.rail = { buttons: app.querySelectorAll('.pmu-navbtn[data-room]').length, icons: app.querySelectorAll('.pmu-navbtn svg').length,
          rooms: [...app.querySelectorAll('.pmu-navbtn[data-room]')].map((b) => b.getAttribute('data-room')).join(',') };
        f.title0 = (document.getElementById('pmuRoomTitle') || {}).textContent;
        const before = U.view_action_log.length;
        app.querySelector('.pmu-navbtn[data-room="context"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        await sleep(100);
        f.roomSwitch = { room: U.state.room, title: (document.getElementById('pmuRoomTitle') || {}).textContent,
          active: (app.querySelector('.pmu-navbtn.active') || {}).getAttribute?.('data-room'), viewActions: U.view_action_log.length - before };
        f.bodyFlag = document.body.classList.contains('pmu-page-active');
      }

      /* Home */
      window.PM_PAGES.go('dashboard'); await sleep(700);
      const cards = document.querySelectorAll('#panel-dashboard .pm6-dash-card, .page-dashboard .pm6-dash-card');
      const head = document.querySelector('.pm6-dash-card .pm6-dash-card-head');
      f.home = { cards: cards.length, headH: head ? Math.round(head.getBoundingClientRect().height) : 0, dashWidgets: !!window.PM7_DASH_WIDGETS };
      f.bodyFlagAfterLeave = document.body.classList.contains('pmu-page-active') || document.body.classList.contains('pm7u-page-active');
      return f;
    });

    /* the chat context actions: More details opens the drawer (a usage event), Compact writes PM7_USAGE.data.context */
    r.ctxActions = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      const U = window.PM7_USAGE, f = {};
      const wraps = [...document.querySelectorAll('.context-usage')];
      const wrap = wraps.find((w) => w.getClientRects().length) || wraps[0];
      if (!wrap || !U) return null;
      const ev0 = U.event_log.length, cmd0 = U.command_log.length;
      const details = wrap.querySelector('.chm-details-link') || document.querySelector('.context-usage .chm-details-link');
      if (details) { details.click(); await sleep(300); }
      f.drawerOpen = !!document.querySelector('.pm7ctx-drawer.open');
      f.detailsEvent = U.event_log.slice(ev0).some((e) => e.event_type === 'view.chat.context_details_opened');
      const close = document.querySelector('.pm7ctx-drawer.open [data-pm7ctx-close]'); if (close) { close.click(); await sleep(150); }
      const compact = wrap.querySelector('.chm-compact-btn') || document.querySelector('.context-usage .chm-compact-btn');
      if (compact) { compact.click(); await sleep(1400); }
      f.afterCompact = { used: U.data.context.used, compacted: !!U.data.context.compacted, reclaim: U.data.context.reclaim };
      const cmds = U.command_log.slice(cmd0).map((c) => c.command_id);
      f.commands = cmds;
      const receipt = U.receipt_log.filter((x) => x.command_id === 'cmd.chat.compact_context').pop();
      f.compactReceipt = receipt ? receipt.status : null;
      return f;
    });

    /* every theme, on the Usage page and on Home */
    r.themes = {};
    for (const theme of THEMES) {
      const e0 = page.errors.length;
      const got = await page.evaluate(async (t) => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const [fam, mode] = t.split('-');
        window.PM_THEME.setFamily(fam, { persist: false }); window.PM_THEME.setMode(mode, { persist: false });
        window.PM_PAGES.go('usage'); await sleep(450);
        const shell = document.getElementById('pmuApp') || document.getElementById('pm7UsageApp');
        const w = shell ? Math.round(shell.getBoundingClientRect().width) : 0;
        window.PM_PAGES.go('dashboard'); await sleep(250);
        return { theme: document.documentElement.getAttribute('data-theme'), usageWidth: w };
      }, theme);
      r.themes[theme] = { ...got, newErrors: page.errors.slice(e0).length };
    }

    /* NieR Mode on, Usage page, then off again */
    const e0 = page.errors.length;
    r.nier = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      if (!window.PM_NIER) return { api: false };
      const set = window.PM_NIER.set(true); await sleep(2200);
      const f = { api: true, set, on: window.PM_NIER.on(), attr: document.documentElement.getAttribute('data-o55-nier'), theme: document.documentElement.getAttribute('data-theme') };
      window.PM_PAGES.go('usage'); await sleep(1200);
      const shell = document.getElementById('pmuApp') || document.getElementById('pm7UsageApp');
      f.usageWidth = shell ? Math.round(shell.getBoundingClientRect().width) : 0;
      f.title = ((document.getElementById('pmuRoomTitle') || document.getElementById('pm7uRoomTitle')) || {}).textContent || null;
      window.PM_PAGES.go('dashboard'); await sleep(500);
      f.off = window.PM_NIER.set(false); await sleep(1800);
      f.offAttr = document.documentElement.getAttribute('data-o55-nier');
      return f;
    });
    r.nier.newErrors = page.errors.slice(e0).length;
    r.errors = page.errors.slice(0, 40);
    r.errorCount = page.errors.length;
    return r;
  } finally { await close(); }
}

const report = {};
for (const [name, file] of Object.entries(pages)) report[name] = { file, ...(await runPage(name, file)) };
const b = report.base, u = report.usage;
const baseErrors = new Set(b.errors.map(norm));
const newErrors = u.errors.filter((e) => !baseErrors.has(norm(e)));
const ub = u.boot, ux = u.ctxActions || {};
const checks = {
  'no new console errors vs the reference page': newErrors.length === 0,
  '#pmuApp present': ub.pmuApp === true,
  '#pm7UsageApp absent': ub.oldApp === false,
  'PM7_CONTEXT present': ub.ctxApi === true,
  'PM7_CONTEXT enhances every .context-usage': ub.ctxWraps > 0 && ub.ctxReady === ub.ctxWraps && ub.ctxPops === ub.ctxWraps,
  '.pm7ctx-pop opens': !!(ub.ctxPopOpen && ub.ctxPopOpen.open && ub.ctxPopOpen.w > 0 && ub.ctxPopOpen.head),
  'bridge stats 10 actions / 3 subscriptions': !!(ub.bridge && ub.bridge.actions === 10 && ub.bridge.subscriptions === 3 && ub.bridge.failures === 0 && ub.bridge.initialized),
  'PM7_USAGE API complete': Array.isArray(ub.api) && ub.api.length === 0 && !!(ub.apiData && ub.apiData.logs && ub.apiData.state && ub.apiData.wiring),
  'PM7_USAGE.data.context.used > 0': !!(ub.context && ub.context.used > 0 && ub.context.limit > 0),
  'fixture data identical to the old page': ub.dataJson !== null && ub.dataJson === b.boot.dataJson,
  'status bar visible': !!(ub.statusbar && ub.statusbar.display !== 'none' && ub.statusbar.h > 0),
  'retro-light --accent-lime #2f7a3d': ub.retroLightLime === '#2f7a3d',
  'Usage page shows the new shell': ub.usageActive && !!(ub.usageShell && ub.usageShell.w > 0 && ub.usageShell.h > 0),
  'rail has the 13 rooms with icons': !!(ub.rail && ub.rail.buttons === 13 && ub.rail.icons === 13 &&
    ub.rail.rooms === 'overview,plans,costs,accounts,free,context,analytics,ledger,attention,cache,tools,signals,authority'),
  'room switch renders and logs a view action': !!(ub.roomSwitch && ub.roomSwitch.room === 'context' && ub.roomSwitch.title === 'Context and cache' &&
    ub.roomSwitch.active === 'context' && ub.roomSwitch.viewActions === 1),
  'Home dashboard renders': ub.home.cards > 0 && ub.home.headH > 0 && ub.home.dashWidgets && ub.home.headH === b.boot.home.headH,
  'context details drawer opens (usage event logged)': !!(ux.drawerOpen && ux.detailsEvent),
  'compaction writes PM7_USAGE.data.context': !!(ux.afterCompact && ux.afterCompact.used === 23580 && ux.afterCompact.compacted && ux.compactReceipt === 'accepted'),
  'all 8 themes load without errors': THEMES.every((t) => u.themes[t] && u.themes[t].theme === t && u.themes[t].newErrors === 0 && u.themes[t].usageWidth > 0),
  'NieR Mode on loads without errors': !!(u.nier.api && u.nier.on && u.nier.attr === 'on' && u.nier.newErrors === 0 && u.nier.usageWidth > 0)
};
const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
for (const r of [b, u]) delete r.boot.dataJson;
const summary = {
  ok: failed.length === 0, failed, checks,
  base: { errors: b.errorCount, wallLoadMs: b.wallLoadMs, ctx: `${b.boot.ctxReady}/${b.boot.ctxWraps}`, bridge: b.boot.bridge, home: b.boot.home },
  usage: { errors: u.errorCount, wallLoadMs: u.wallLoadMs, ctx: `${ub.ctxReady}/${ub.ctxWraps}`, ctxPop: ub.ctxPopOpen, bridge: ub.bridge, context: ub.context,
    statusbar: ub.statusbar, retroLightLime: ub.retroLightLime, rail: ub.rail, roomSwitch: ub.roomSwitch, home: ub.home, ctxActions: ux,
    themes: Object.fromEntries(Object.entries(u.themes).map(([k, v]) => [k, v.newErrors])), nier: u.nier },
  newErrors
};
writeFileSync(join(out, 'usage-boot.json'), JSON.stringify({ summary, report }, null, 2));
console.log(JSON.stringify(summary, null, 1));
process.exit(failed.length ? 1 : 0);
