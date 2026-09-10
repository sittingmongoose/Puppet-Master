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
  await page.addInitScript(() => { window.__pm51Audio = []; const Base = window.AudioContext; window.AudioContext = class extends Base { constructor(...args) { super(...args); window.__pm51Audio.push(this); } }; });
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
  await check('one check per entity: at most one check-style button per section outside Advanced, and no Test all / Simulate / Validate all / Run all outside Advanced', async () => {
    const offenders = [];
    for (const m of managers) {
      await page.evaluate((d, w) => window.PM12_KIMI.navigate(d, w), m.domain, m.id); await sleep(300);
      const r = await page.evaluate(w => {
        const scroll = document.querySelector(`[data-workspace-block="${w}"] .manager-scroll`); if (!scroll) return { bad: [], groups: [] };
        const buttons = [...scroll.querySelectorAll('button')].filter(b => !b.closest('.pm51-advanced'));
        const label = b => b.textContent.trim().replace(/\s+/g, ' ');
        const bad = buttons.map(label).filter(l => /^(test all|simulate|validate all|run all|test lab|preview effective)/i.test(l));
        const groups = new Map();
        for (const b of buttons) {
          const l = label(b); if (!/^(check |test )/i.test(l)) continue;
          const g = b.closest('.pm51-section, .resource-detail, .pm51-panel') || scroll;
          const key = g === scroll ? 'view' : (g.querySelector('.pm51-section-title, .resource-detail-head, h3, h4')?.textContent.trim() || g.className);
          const entry = groups.get(key) || { head: 0, rows: 0, labels: [] };
          if (b.closest('.pm51-row, .pm51-step, .pm51-item, .resource-row')) entry.rows += 1; else entry.head += 1;
          entry.labels.push(l); groups.set(key, entry);
        }
        return { bad, groups: [...groups].map(([k, v]) => ({ key: k, ...v })) };
      }, m.id);
      if (r.bad.length) offenders.push(m.id + ': ' + r.bad.join(', '));
      // one check in the section head or detail head, plus at most one row-level fix/check per row group
      for (const g of r.groups) if (g.head > 1 || g.rows > 1) offenders.push(`${m.id}: "${g.key}" has ${g.labels.length} check buttons (${g.labels.join(', ')})`);
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
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'notifications')); await sleep(500);
    await page.evaluate(() => { const t = document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="events"]'); if (t) t.click(); }); await sleep(400);
    await page.evaluate(() => { const b = [...document.querySelectorAll('#pm-settings-root [data-action="pm51-notifications-event"]')].find(x => x.getClientRects().length); if (!b) throw new Error('no event row to open'); b.click(); });
    await page.waitFor(() => !!document.querySelector('#pm-settings-portals .drawer-wrap.is-open.is-settled .pm51-panel'), { timeout: 4000 });
    await sleep(900);
    const anatomy = await page.evaluate(() => { const p = document.querySelector('#pm-settings-portals .pm51-panel'); const reveals = [...p.querySelectorAll('.pm51-reveal')]; return { head: !!p.querySelector('.pm51-panel-head.pm51-hero .pm51-hero-icon svg'), body: !!p.querySelector('.pm51-panel-body'), foot: !!p.querySelector('.pm51-panel-foot'), footSticky: getComputedStyle(p.querySelector('.pm51-panel-foot')).position === 'sticky', cards: p.querySelectorAll('.pm51-panel-card').length, revealed: reveals.length && reveals.every(n => getComputedStyle(n).opacity === '1'), pills: p.querySelectorAll('.pm51-pill').length, width: p.getBoundingClientRect().width, transition: getComputedStyle(p).transitionTimingFunction }; });
    await page.screenshot(join(out, 'panel-open.png'));
    await page.evaluate(() => document.querySelector('#pm-settings-portals [data-action="close-overlay"]').click());
    await page.waitFor(() => !document.querySelector('#pm-settings-portals .drawer-wrap'), { timeout: 3000 });
    if (!anatomy.head || !anatomy.body || !anatomy.foot) throw new Error('panel anatomy missing: ' + JSON.stringify(anatomy));
    if (!anatomy.footSticky || !anatomy.revealed || anatomy.pills) throw new Error('hero sheet incomplete: ' + JSON.stringify(anatomy));
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
  await check('roster filters keep filtering after a re-render (stored filter is re-applied on mount)', async () => {
    const results = [], skipped = [];
    for (const m of managers) {
      await page.evaluate((d, w) => window.PM12_KIMI.navigate(d, w), m.domain, m.id); await sleep(250);
      // earlier checks walk every tab and leave tabbed managers on their last tab; rosters live on the first
      await page.evaluate(w => { const first = document.querySelector(`[data-workspace-block="${w}"] .manager-page > .manager-tabs .manager-tab`); if (first && first.getAttribute('aria-selected') !== 'true') first.click(); }, m.id); await sleep(200);
      const r = await page.evaluate(w => {
        const blk = document.querySelector(`[data-workspace-block="${w}"]`);
        if (!blk) return { skip: 'block missing' };
        const input = blk.querySelector('input[data-action="pm51-filter"]'); if (!input) return { skip: 'no filter' };
        const rows = [...blk.querySelectorAll('.roster-list .resource-row')]; if (rows.length < 2) return { skip: 'rows ' + rows.length };
        const probe = rows[rows.length - 1].textContent.trim().split(/\s+/).find(x => x.length > 3) || rows[rows.length - 1].textContent.trim().slice(0, 4);
        input.value = probe; input.dispatchEvent(new Event('input', { bubbles: true }));
        const hiddenLive = rows.filter(x => x.hidden).length;
        window.PM51.refresh(w, { swap: false });
        const after = [...blk.querySelectorAll('.roster-list .resource-row')];
        const hiddenAfter = after.filter(x => x.hidden).length;
        const value = blk.querySelector('input[data-action="pm51-filter"]')?.value;
        // clear again so later checks see every row
        const i2 = blk.querySelector('input[data-action="pm51-filter"]'); if (i2) { i2.value = ''; i2.dispatchEvent(new Event('input', { bubbles: true })); }
        return { probe, total: rows.length, hiddenLive, hiddenAfter, value };
      }, m.id);
      if (r.skip) { skipped.push(m.id + ': ' + r.skip); continue; }
      results.push(m.id + ':' + JSON.stringify(r));
      if (r.hiddenLive === 0) throw new Error(m.id + ': live filter hid nothing for ' + JSON.stringify(r));
      if (r.hiddenAfter !== r.hiddenLive || r.value !== r.probe) throw new Error(m.id + ': filter lost after refresh ' + JSON.stringify(r));
    }
    if (!results.length) throw new Error('no roster filter found in any manager');
    if (results.length < 5) throw new Error(`only ${results.length} roster filters checked; skipped: ${skipped.filter(s => !/no filter|rows [01]$/.test(s) || /block missing/.test(s)).join('; ') || skipped.join('; ')}`);
    return { checked: results.map(r => r.split(':')[0]), skipped };
  });
  await check('host-driven re-renders keep the active workspace and scroll offset (theme change while reading Doctor)', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('system', 'doctor')); await sleep(1200);
    const before = await page.evaluate(() => { const sc = document.getElementById('settings-document'); const b = document.querySelector('[data-workspace-block="doctor"]'); return { scrollTop: sc.scrollTop, workspace: window.PM12_KIMI.getState().workspace, top: Math.round(b.getBoundingClientRect().top) }; });
    await page.evaluate(() => window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Friendly Light')); await sleep(900);
    const after = await page.evaluate(() => { const sc = document.getElementById('settings-document'); const b = document.querySelector('[data-workspace-block="doctor"]'); return { scrollTop: sc.scrollTop, workspace: window.PM12_KIMI.getState().workspace, top: b ? Math.round(b.getBoundingClientRect().top) : null, theme: document.documentElement.getAttribute('data-theme') }; });
    await page.evaluate(() => window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Basic Dark')); await sleep(600);
    if (before.workspace !== 'doctor') throw new Error('setup: doctor not active ' + JSON.stringify(before));
    if (after.workspace !== 'doctor' || after.top == null || Math.abs(after.top - before.top) > 40) throw new Error(`lost place: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
    if (after.theme !== 'friendly-light') throw new Error('theme did not apply: ' + after.theme);
    return { before, after };
  });
  await check('a navigation issued right after a host re-render still lands (same-domain jump after theme re-apply)', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('system', 'settings-transfer')); await sleep(900);
    await page.evaluate(() => { window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Basic Dark'); window.PM12_KIMI.navigate('system', 'servers'); }); await sleep(1600);
    const r = await page.evaluate(() => { const sc = document.getElementById('settings-document'); const b = document.querySelector('[data-workspace-block="servers"]'); return { scrollTop: sc.scrollTop, workspace: window.PM12_KIMI.getState().workspace, top: b ? Math.round(b.getBoundingClientRect().top - sc.getBoundingClientRect().top) : null }; });
    if (r.workspace !== 'servers' || r.top == null || r.top < 0 || r.top > 140) throw new Error('did not land on Server & Project Location: ' + JSON.stringify(r));
    return r;
  });
  await check('no native select is visible anywhere in Settings, no native disabled, no pills; every hidden select has a dropdown trigger', async () => {
    let visible = 0, orphans = 0, disabled = 0, pills = 0, triggers = 0;
    const scan = async () => { const r = await page.evaluate(() => { const rootEl = document.getElementById('panel-settings'); const selects = [...rootEl.querySelectorAll('select')]; return { visible: selects.filter(s => s.getClientRects().length).length, orphans: selects.filter(s => !s.closest('.pm51-dd') || !s.closest('.pm51-dd').querySelector('.pm51-dd-trigger')).length, disabled: rootEl.querySelectorAll('button[disabled], select[disabled]').length, pills: rootEl.querySelectorAll('.pm51-pill').length, triggers: rootEl.querySelectorAll('.pm51-dd-trigger').length }; }); visible += r.visible; orphans += r.orphans; disabled += r.disabled; pills += r.pills; triggers += r.triggers; };
    for (const m of managers) { await page.evaluate((d, w) => window.PM12_KIMI.navigate(d, w), m.domain, m.id); await sleep(200); await scan(); }
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'app-input')); await sleep(400); await scan();
    await page.evaluate(() => window.PM12_KIMI.navigate('projects', 'project-settings')); await sleep(600); await scan();
    if (visible || orphans || disabled || pills) throw new Error(`visible selects ${visible}, selects without trigger ${orphans}, native disabled ${disabled}, pills ${pills}`);
    return { triggers };
  });
  await check('dropdown opens as a sprout popout inside the viewport and commits by keyboard through the engine change path', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'app-input')); await sleep(600);
    await page.evaluate(() => { const t = [...document.querySelectorAll('#pm-settings-root .setting-row .pm51-dd-trigger')].find(x => x.getClientRects().length); t.scrollIntoView({ block: 'center' }); window.__pm51chg = []; document.addEventListener('change', e => window.__pm51chg.push((e.target.dataset && e.target.dataset.action) + ':' + e.target.value), true); }); await sleep(600);
    await page.click('#pm-settings-root .setting-row .pm51-dd-trigger'); await sleep(450);
    const open = await page.evaluate(() => { const p = document.querySelector('.pm51-popout.pm51-dd-list.is-open'); if (!p) return null; const r = p.getBoundingClientRect(); const t = document.querySelector('.pm51-dd-trigger[aria-expanded="true"]'); return { inBody: p.parentElement === document.body, inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, sprout: p.dataset.sprout, transition: getComputedStyle(p).transitionDuration, items: p.querySelectorAll('[role="option"]').length, focusOnTrigger: document.activeElement === t, hasSelected: !!p.querySelector('[aria-selected="true"]') }; });
    if (!open || !open.inBody || !open.inView || !open.sprout || !/0\.3s/.test(open.transition) || !open.focusOnTrigger) throw new Error('dropdown did not open as a sprout popout: ' + JSON.stringify(open));
    await page.key('ArrowDown'); await sleep(80); await page.key('Enter'); await sleep(500);
    const after = await page.evaluate(() => ({ popouts: document.querySelectorAll('.pm51-popout').length, changes: window.__pm51chg }));
    if (after.popouts || !after.changes.some(c => c.startsWith('change-setting:'))) throw new Error('keyboard commit did not dispatch the engine change: ' + JSON.stringify(after));
    await page.evaluate(() => window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Basic Dark')); await sleep(500);
    await page.click('#pm-settings-root .setting-row .pm51-dd-trigger'); await sleep(400);
    await page.key('Escape'); await sleep(400);
    const closed = await page.evaluate(() => ({ popouts: document.querySelectorAll('.pm51-popout').length, expanded: document.querySelectorAll('.pm51-dd-trigger[aria-expanded="true"]').length }));
    if (closed.popouts || closed.expanded) throw new Error('Escape did not close the dropdown: ' + JSON.stringify(closed));
    return open;
  });
  await check('engine menus open in body with the sprout motion, focus the first item, and return focus on Escape', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('ai', 'providers')); await sleep(700);
    await page.click('[data-workspace-block="providers"] .pm51-detail-actions .pm51-icon-btn'); await sleep(450);
    const menu = await page.evaluate(() => { const p = document.querySelector('.pm51-popout.pm51-menu.is-open'); if (!p) return null; const r = p.getBoundingClientRect(); return { inBody: p.parentElement === document.body, inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, items: p.querySelectorAll('.pm51-menu-item').length, focused: document.activeElement.classList.contains('pm51-menu-item'), disabled: p.querySelectorAll('button[disabled]').length, legacy: document.querySelectorAll('#pm-settings-portals .popover').length }; });
    if (!menu || !menu.inBody || !menu.inView || !menu.items || !menu.focused || menu.disabled || menu.legacy) throw new Error('menu did not open through the popout engine: ' + JSON.stringify(menu));
    await page.key('Escape'); await sleep(400);
    const back = await page.evaluate(() => ({ popouts: document.querySelectorAll('.pm51-popout').length, focus: document.activeElement.className }));
    if (back.popouts || !/pm51-icon-btn/.test(back.focus)) throw new Error('menu did not close/return focus: ' + JSON.stringify(back));
    return menu;
  });
  await check('rosters scroll on their own inside the manager and the page still scrolls', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('memory', 'personas')); await sleep(900);
    const r = await page.evaluate(() => { const ro = document.querySelector('[data-workspace-block="personas"] .pm51-roster'); const list = ro.querySelector('.roster-list'); const sc = document.getElementById('settings-document'); const before = sc.scrollTop; list.scrollTop = 120; return { position: getComputedStyle(ro).position, listOverflow: getComputedStyle(list).overflowY, scrolls: list.scrollHeight > list.clientHeight, listMoved: list.scrollTop > 0, pageUnchanged: sc.scrollTop === before }; });
    if (r.position !== 'sticky' || r.listOverflow !== 'auto' || !r.scrolls || !r.listMoved || !r.pageUnchanged) throw new Error('roster does not scroll independently: ' + JSON.stringify(r));
    return r;
  });
  await check('every built-in sound row plays a real Web Audio signal; the unavailable upload never plays', async () => {
    await page.evaluate(() => window.PM12_KIMI.navigate('general', 'notifications')); await sleep(600);
    await page.evaluate(() => { const t = document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="sounds"]'); if (t) t.click(); }); await sleep(500);
    const rows = await page.evaluate(() => [...document.querySelectorAll('.sound-row')].map(r => ({ id: r.dataset.soundRow, disabled: r.querySelector('.sound-play')?.getAttribute('aria-disabled') === 'true' || /unavailable/i.test(r.textContent) })));
    if (rows.length < 6) throw new Error('only ' + rows.length + ' sound rows');
    const preexisting = await page.evaluate(() => window.__pm51Audio.length);
    if (preexisting !== 0) throw new Error(`${preexisting} AudioContext(s) existed before any sound was played (must be created on user action only)`);
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
  await check('eight themes × three widths render the key managers without horizontal overflow, and popouts stay in view with a themed plate', async () => {
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
          if (w === 'servers' && (width === 760 || width === 1440)) {
            // one dropdown and one menu per theme/width: popout inside the viewport, themed plate (never the old #171b31 in light themes)
            const probe = await page.evaluate(ww => {
              const blk = document.querySelector(`[data-workspace-block="${ww}"]`);
              const trig = [...blk.querySelectorAll('.pm51-dd-trigger')].find(x => x.getClientRects().length);
              const menuBtn = [...blk.querySelectorAll('.pm51-icon-btn')].find(x => x.getClientRects().length && /more/i.test(x.getAttribute('aria-label') || ''));
              return { trig: !!trig, menu: !!menuBtn };
            }, w);
            const check = async (selector) => {
              // instant scroll (the document scroller is smooth) so the click lands on a settled trigger
              await page.evaluate(sel => { const el = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length); const sc = document.getElementById('settings-document'); sc.style.scrollBehavior = 'auto'; el.scrollIntoView({ block: 'center' }); sc.style.scrollBehavior = ''; }, selector); await sleep(250);
              await page.click(selector);
              // glass themes paint slowly under software rendering: wait for the sprout to finish instead of a fixed delay
              try { await page.waitFor(() => { const p = document.querySelector('.pm51-popout.is-open'); return !!p && Number(getComputedStyle(p).opacity) > .9; }, { timeout: 2500 }); } catch (e) { /* reported below */ }
              const r = await page.evaluate(() => { const p = document.querySelector('.pm51-popout.is-open'); if (!p) return null; const b = p.getBoundingClientRect(); const cs = getComputedStyle(p); return { inView: b.left >= 0 && b.right <= innerWidth + 1 && b.top >= 0 && b.bottom <= innerHeight + 1, bg: cs.backgroundColor, visible: cs.visibility === 'visible' && Number(cs.opacity) > .9 }; });
              await page.key('Escape'); await sleep(350);
              return r;
            };
            if (probe.trig) { const r = await check(`[data-workspace-block="${w}"] .pm51-dd-trigger`); if (!r || !r.inView || !r.visible || (/Light/.test(theme) && r.bg === 'rgb(23, 27, 49)')) problems.push(`${theme} ${width}px dropdown popout ${JSON.stringify(r)}`); }
            if (probe.menu) { const r = await check(`[data-workspace-block="${w}"] .pm51-icon-btn[aria-label*="More" i]`); if (!r || !r.inView || !r.visible || (/Light/.test(theme) && r.bg === 'rgb(23, 27, 49)')) problems.push(`${theme} ${width}px menu popout ${JSON.stringify(r)}`); }
          }
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
