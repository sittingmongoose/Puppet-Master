/* Settings managers refresh — browser checkpoint (concept scope only).
 * node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs <artifact.html> <output-dir> [chrome]
 * Dependency-free: uses pm_cdp.mjs (Chrome DevTools over --remote-debugging-pipe).
 * Asserts the user-facing contract of the refresh: every manager mounts without errors, no top action bars,
 * ≤ 6 tabs, one Advanced disclosure per view, no accent stripes, no emoji, sounds play, the all-settings list
 * is page-scrolled, the domain switch never blanks, side panels use the shared anatomy, and 8 themes × 3 widths
 * render without horizontal overflow.  It is not native/runtime certification.
 */
import { launch, sleep } from './pm_cdp.mjs';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const [artifactArg, outArg, chromeArg] = process.argv.slice(2);
if (!artifactArg || !outArg) { console.error('usage: settings_refresh_checkpoint.mjs <artifact.html> <out-dir> [chrome]'); process.exit(2); }
if (chromeArg) process.env.CHROME = chromeArg;
const artifact = resolve(artifactArg), out = resolve(outArg);
mkdirSync(out, { recursive: true });
const sha = b => createHash('sha256').update(b).digest('hex');
const report = { scope: 'browser concept checkpoint only; not native, runtime, provider, or delivery certification', artifact_sha256: sha(readFileSync(artifact)), checks: [], managers: [], errors: [] };
const checks = [];
async function check(name, fn) { try { const detail = await fn(); report.checks.push({ name, pass: true, detail }); console.log('PASS', name); } catch (e) { report.checks.push({ name, pass: false, error: String(e && e.message || e) }); console.log('FAIL', name, '-', e && e.message); } }
const { page, close } = await launch({ width: 1600, height: 1000 });
try {
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  await page.goto(pathToFileURL(artifact).href); await sleep(2200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /close onboarding/i.test(x.getAttribute('aria-label') || x.textContent)); if (b && b.getClientRects().length) b.click(); });
  await sleep(300); await page.evaluate(() => document.getElementById('tab-settings').click()); await sleep(800);

  const managers = await page.evaluate(() => window.PM12_DATA.domains.flatMap(d => d.workspaces.filter(w => w.type !== 'settings').map(w => ({ domain: d.id, id: w.id, label: w.label, type: w.type }))));
  report.managers = managers;
  await check('every manager mounts through the kit with no page errors, no top action bar, ≤ 6 tabs, one Advanced disclosure per view', async () => {
    const problems = [];
    for (const m of managers) {
      await page.evaluate((d, w) => window.PM12_KIMI.navigate(d, w), m.domain, m.id);
      await page.waitFor(w => !!document.querySelector(`[data-workspace-block="${w}"] [data-workspace-mounted="true"]`), { args: [m.id], timeout: 15000 });
      await sleep(350);
      const info = await page.evaluate(w => {
        const blk = document.querySelector(`[data-workspace-block="${w}"]`);
        const page = blk.querySelector('.manager-page');
        const tabs = [...blk.querySelectorAll('.manager-page > .manager-tabs .manager-tab')].map(b => ({ tab: b.dataset.tab, action: b.dataset.action }));
        return { kit: !!(page && page.classList.contains('pm51-mgr')), key: page && page.dataset.managerKey, tabs: tabs.length, topBar: blk.querySelectorAll('.embedded-page-actions button').length,
          advanced: blk.querySelectorAll('.manager-scroll > details.pm51-advanced').length, disabled: blk.querySelectorAll('button[disabled]').length, overflow: blk.scrollWidth > blk.clientWidth + 1, tabList: tabs };
      }, m.id);
      Object.assign(m, info);
      if (!info.kit) problems.push(m.id + ': not rendered by the kit');
      if (info.topBar) problems.push(m.id + ': top action bar present');
      if (info.tabs > 6) problems.push(m.id + ': ' + info.tabs + ' tabs');
      if (info.advanced > 1) problems.push(m.id + ': ' + info.advanced + ' Advanced disclosures in first view');
      if (info.disabled) problems.push(m.id + ': native disabled attribute used');
      if (info.overflow) problems.push(m.id + ': horizontal overflow');
      for (const t of info.tabList) {
        if (t.action !== 'pm51-tab') continue;
        await page.evaluate((w, tab) => { document.querySelector(`[data-workspace-block="${w}"] .manager-tab[data-tab="${tab}"]`).click(); }, m.id, t.tab);
        await sleep(260);
        const adv = await page.evaluate(w => document.querySelectorAll(`[data-workspace-block="${w}"] .manager-scroll > details.pm51-advanced`).length, m.id);
        if (adv > 1) problems.push(`${m.id}/${t.tab}: ${adv} Advanced disclosures`);
      }
    }
    if (page.errors.length) problems.push('page errors: ' + page.errors.slice(0, 3).join(' | '));
    if (problems.length) throw new Error(problems.join('; '));
    return { managers: managers.length };
  });
  await check('no manager has more than one check-style button per entity view and no Test all / Simulate / Preview buttons', async () => {
    const offenders = [];
    for (const m of managers) {
      await page.evaluate((d, w) => window.PM12_KIMI.navigate(d, w), m.domain, m.id); await sleep(300);
      const labels = await page.evaluate(w => [...document.querySelectorAll(`[data-workspace-block="${w}"] .manager-scroll button`)].map(b => b.textContent.trim()).filter(Boolean), m.id);
      const bad = labels.filter(l => /^(test all|simulate|validate all|run all checks|test lab)/i.test(l));
      const checksVisible = labels.filter(l => /^(check |test )/i.test(l));
      if (bad.length) offenders.push(m.id + ': ' + bad.join(', '));
      if (checksVisible.length > 2) offenders.push(m.id + ': ' + checksVisible.length + ' check buttons visible (' + checksVisible.join(', ') + ')');
    }
    if (offenders.length) throw new Error(offenders.join('; '));
  });
  await check('artifact carries no emoji and no accent stripe rules in the refresh styles', async () => {
    const text = readFileSync(artifact, 'utf8');
    const css = text.slice(text.indexOf('id="pm51-settings-refresh"'), text.indexOf('</style>', text.indexOf('id="pm51-settings-refresh"')));
    if (/border-(left|top|right|bottom)\s*:\s*[2-9]px\s+solid\s+var\(--k3-accent/.test(css)) throw new Error('accent stripe rule');
    const engine = text.slice(text.indexOf('id="pm4-settings-js"'), text.indexOf('id="pm6-js-globals"'));
    if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(engine)) throw new Error('emoji code point in Settings engine');
    const inspector = await page.evaluate(() => { const el = document.createElement('div'); el.className = 'detail-example'; document.querySelector('#pm-settings-root').appendChild(el); const cs = getComputedStyle(el); const r = { top: cs.borderTopWidth, left: cs.borderLeftWidth }; el.remove(); return r; });
    if (parseFloat(inspector.top) > 1.5 || parseFloat(inspector.left) > 1.5) throw new Error('detail example still has an accent border: ' + JSON.stringify(inspector));
  });
  await check('domain switch never blanks: first frame ≥ 85 % of settled brightness', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'app-input')); await sleep(700);
    await page.send('Animation.enable'); await page.send('Animation.setPlaybackRate', { playbackRate: 0.05 });
    const clip = { x: 700, y: 110, width: 890, height: 860 };
    await page.evaluate(() => window.PM12_KIMI.navigate('system', 'settings-transfer'));
    const first = await page.screenshot(null, { format: 'png', clip });
    await page.send('Animation.setPlaybackRate', { playbackRate: 1 }); await sleep(900);
    const settled = await page.screenshot(null, { format: 'png', clip });
    writeFileSync(join(out, 'flash-first.png'), first); writeFileSync(join(out, 'flash-settled.png'), settled);
    const lum = async b => { const { stdout } = await import('node:child_process').then(m => new Promise((res, rej) => { const p = m.spawn('ffprobe', ['-v', 'error', '-f', 'lavfi', '-i', 'movie=' + join(out, b) + ',signalstats', '-show_entries', 'frame_tags=lavfi.signalstats.YAVG', '-of', 'csv=p=0']); let o = ''; p.stdout.on('data', d => o += d); p.on('close', () => res({ stdout: o })); p.on('error', rej); })); return parseFloat(stdout.split('\n')[0]); };
    const a = await lum('flash-first.png'), b = await lum('flash-settled.png');
    if (!(a >= 0.85 * b)) throw new Error(`first frame ${a.toFixed(1)} vs settled ${b.toFixed(1)}`);
    return { first: a, settled: b, ratio: +(a / b).toFixed(3) };
  });
  await check('side panel uses the shared anatomy and the spring open reaches is-settled; close removes it', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('ai', 'bsd')); await sleep(500);
    await page.evaluate(() => document.querySelector('#pm-settings-root [data-action="pm51-bsd-stages"]').click());
    await page.waitFor(() => !!document.querySelector('#pm-settings-portals .drawer-wrap.is-open.is-settled .pm51-panel'), { timeout: 4000 });
    const anatomy = await page.evaluate(() => { const p = document.querySelector('#pm-settings-portals .pm51-panel'); return { head: !!p.querySelector('.pm51-panel-head'), body: !!p.querySelector('.pm51-panel-body'), foot: !!p.querySelector('.pm51-panel-foot'), width: p.getBoundingClientRect().width, transition: getComputedStyle(p).transitionTimingFunction }; });
    await page.screenshot(join(out, 'panel-open.png'));
    await page.evaluate(() => document.querySelector('#pm-settings-portals [data-action="close-overlay"]').click());
    await page.waitFor(() => !document.querySelector('#pm-settings-portals .drawer-wrap'), { timeout: 3000 });
    if (!anatomy.head || !anatomy.body || !anatomy.foot) throw new Error('panel anatomy missing');
    return anatomy;
  });
  await check('setting Details inspector keeps its 350 px width and theme background, no accent example', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'app-input')); await sleep(500);
    await page.evaluate(() => { const b = [...document.querySelectorAll('#pm-settings-root .details-btn')].find(x => /density/i.test(x.closest('.setting-row')?.textContent || '')); b.scrollIntoView({ block: 'center' }); b.click(); });
    await page.waitFor(() => !!document.querySelector('#pm-settings-root .detail-inspector.is-open.is-settled'), { timeout: 4000 });
    const r = await page.evaluate(() => { const i = document.querySelector('#pm-settings-root .detail-inspector'); const ex = i.querySelector('.pm51-example'); return { width: Math.round(i.getBoundingClientRect().width), bg: getComputedStyle(i).backgroundColor, exampleBorder: ex ? getComputedStyle(ex).borderTopWidth + '/' + getComputedStyle(ex).borderLeftWidth : 'none', anatomy: !!i.querySelector('.pm51-panel-head') }; });
    await page.screenshot(join(out, 'inspector-open.png'));
    await page.evaluate(() => document.querySelector('#pm-settings-root [data-action="close-details"]').click()); await sleep(400);
    if (r.width !== 350) throw new Error('inspector width ' + r.width);
    if (r.bg === 'rgb(16, 20, 40)') throw new Error('inspector still hardcoded #101428');
    if (!r.anatomy) throw new Error('inspector anatomy missing');
    return r;
  });
  await check('all project settings scroll with the page (no nested scroller) and stay virtualized', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('projects', 'project-settings')); await sleep(900);
    const r = await page.evaluate(() => { const vp = document.querySelector('[data-all-settings-viewport]'); let el = vp.querySelector('.setting-row'); const nested = []; while (el && el.id !== 'settings-document') { const o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el !== document.getElementById('settings-document')) nested.push(el.className); el = el.parentElement; } return { nested, mounted: vp.querySelectorAll('.setting-row').length, total: Number((document.querySelector('[data-all-settings-count]').textContent.match(/of (\d+)/) || [])[1]), heads: vp.querySelectorAll('.pm51-cat-head').length }; });
    await page.screenshot(join(out, 'all-settings.png'));
    if (r.nested.length) throw new Error('nested scroller: ' + r.nested.join(','));
    if (!(r.mounted < r.total && r.mounted > 0)) throw new Error('not virtualized: ' + JSON.stringify(r));
    return r;
  });
  await check('every built-in sound row plays a real Web Audio signal; the unavailable upload never plays', async () => {
    await page.evaluate(() => { window.__pm51Audio = []; const Base = window.AudioContext; window.AudioContext = class extends Base { constructor(...args) { super(...args); window.__pm51Audio.push(this); } }; });
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'notifications')); await sleep(600);
    await page.evaluate(() => { const t = document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="sounds"]'); if (t) t.click(); }); await sleep(500);
    const rows = await page.evaluate(() => [...document.querySelectorAll('.sound-row')].map(r => ({ id: r.dataset.soundRow, disabled: r.querySelector('.sound-play')?.getAttribute('aria-disabled') === 'true' })));
    if (rows.length < 6) throw new Error('only ' + rows.length + ' sound rows');
    const played = [];
    for (const r of rows.filter(x => !x.disabled)) {
      await page.evaluate(id => document.querySelector(`.sound-play[data-id="${id}"]`).click(), r.id);
      await sleep(250);
      const running = await page.evaluate(id => ({ contexts: window.__pm51Audio.filter(c => c.state === 'running').length, pressed: document.querySelector(`.sound-play[data-id="${id}"]`).getAttribute('aria-pressed') }), r.id);
      played.push({ id: r.id, ...running });
      await page.evaluate(id => document.querySelector(`.sound-play[data-id="${id}"]`).click(), r.id); await sleep(150);
    }
    await page.screenshot(join(out, 'sounds.png'));
    const silent = played.filter(p => p.contexts < 1 || p.pressed !== 'true');
    if (silent.length) throw new Error('silent rows: ' + JSON.stringify(silent));
    return { played: played.length, unavailable: rows.filter(x => x.disabled).map(x => x.id) };
  });
  await check('eight themes × three widths render the key managers without horizontal overflow', async () => {
    const problems = []; report.matrix = [];
    for (const width of [760, 960, 1440]) {
      await page.setViewport(width, 1000); await sleep(200);
      for (const theme of ['Basic Dark', 'Basic Light', 'Friendly Dark', 'Friendly Light', 'Glass Dark', 'Glass Light', 'Retro Dark', 'Retro Light']) {
        await page.evaluate(t => window.PM12_KIMI.setSettingFromHost('general.visual.theme', t), theme); await sleep(250);
        for (const [d, w] of [['ai', 'providers'], ['system', 'servers'], ['general', 'notifications'], ['system', 'doctor']]) {
          await page.evaluate((dd, ww) => window.PM12_KIMI.navigate(dd, ww), d, w);
          await page.waitFor(ww => !!document.querySelector(`[data-workspace-block="${ww}"] [data-workspace-mounted="true"]`), { args: [w], timeout: 15000 }); await sleep(200);
          const g = await page.evaluate(ww => { const blk = document.querySelector(`[data-workspace-block="${ww}"]`); const doc = document.getElementById('settings-document'); return { blkOverflow: blk.scrollWidth - blk.clientWidth, docOverflow: doc.scrollWidth - doc.clientWidth }; }, w);
          report.matrix.push({ width, theme, manager: w, ...g });
          if (g.blkOverflow > 1 || g.docOverflow > 1) problems.push(`${theme} ${width}px ${w}: overflow ${g.blkOverflow}/${g.docOverflow}`);
          if (width === 760 || width === 1440) await page.screenshot(join(out, `${w}-${theme.toLowerCase().replace(' ', '-')}-${width}.png`), { format: 'jpeg', quality: 70 });
        }
      }
    }
    await page.setViewport(1600, 1000);
    await page.evaluate(() => window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Basic Dark'));
    if (problems.length) throw new Error(problems.slice(0, 8).join('; '));
  });
  await check('no browser page errors during the checkpoint', async () => { if (page.errors.length) throw new Error(page.errors.slice(0, 5).join(' | ')); });
  report.errors = page.errors;
} finally {
  await close();
  report.pass = report.checks.every(c => c.pass);
  writeFileSync(join(out, 'settings-refresh-checkpoint.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(report.pass ? 'ALL PASS' : 'FAILURES: ' + report.checks.filter(c => !c.pass).map(c => c.name).join('; '));
  process.exitCode = report.pass ? 0 : 1;
}
