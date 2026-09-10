/* Settings managers refresh — placement checkpoint (concept scope only).
 * node Concepts/pm7-tools/verify/settings_placement_checkpoint.mjs <artifact.html> <output-dir> [chrome]
 * Dependency-free: uses pm_cdp.mjs (Chrome DevTools over --remote-debugging-pipe).
 * Asserts the "manager-topic settings live inside their managers" contract of pass 2: every canonical
 * setting id renders exactly once across the managers (every tab) and the remaining plain pages, the
 * inline block sits before the view's single Advanced disclosure, the page index lists every inline
 * section, All Project Settings still counts every id, Details / search / refreshSettingRow keep working
 * for moved rows, and the runtime placement audit reports nothing unplaced or duplicated.
 * It is not native/runtime certification.
 */
import { launch, sleep } from './pm_cdp.mjs';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const [artifactArg, outArg, chromeArg] = process.argv.slice(2);
if (!artifactArg || !outArg) { console.error('usage: settings_placement_checkpoint.mjs <artifact.html> <out-dir> [chrome]'); process.exit(2); }
if (chromeArg) process.env.CHROME = chromeArg;
const artifact = resolve(artifactArg), out = resolve(outArg);
mkdirSync(out, { recursive: true });
const sha = b => createHash('sha256').update(b).digest('hex');
const report = { scope: 'browser concept checkpoint only; not native, runtime, provider, or delivery certification', artifact_sha256: sha(readFileSync(artifact)), checks: [], census: {}, errors: [] };
async function check(name, fn) { try { const detail = await fn(); report.checks.push({ name, pass: true, detail }); console.log('PASS', name); } catch (e) { report.checks.push({ name, pass: false, error: String(e && e.message || e) }); console.log('FAIL', name, '—', String(e && e.message || e).slice(0, 900)); } }

const { page, close } = await launch({ width: 1600, height: 1000 });
const nav = async (domain, ws) => {
  await page.evaluate((d, w) => window.PM12_KIMI.navigate(d, w), domain, ws);
  await page.waitFor(w => !!document.querySelector(`[data-workspace-block="${w}"] [data-workspace-mounted="true"], [data-workspace-block="${w}"] .settings-section, [data-workspace-block="${w}"] .pm51-mgr`), { args: [ws], timeout: 15000 });
  await sleep(320);
};
const clickTab = async (ws, tab) => { await page.evaluate((w, t) => { const b = document.querySelector(`[data-workspace-block="${w}"] .manager-tab[data-tab="${t}"]`); if (b) b.click(); }, ws, tab); await sleep(260); };
/* ids rendered inside one workspace block right now: engine rows (#setting-<id>) plus composed wrappers ([data-setting-id]) */
const idsIn = ws => page.evaluate(w => {
  const blk = document.querySelector(`[data-workspace-block="${w}"]`); if (!blk) return null;
  const out = [];
  blk.querySelectorAll('[id^="setting-"]').forEach(n => { if (n.classList.contains('setting-row') || n.matches('.setting-row, [data-setting]')) out.push(n.id.slice(8)); });
  blk.querySelectorAll('[data-setting-id]').forEach(n => { if (!n.closest('[id^="setting-"]')) out.push(n.getAttribute('data-setting-id')); });
  return out;
}, ws);

try {
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  await page.goto(pathToFileURL(artifact).href); await sleep(2200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /close onboarding/i.test(x.getAttribute('aria-label') || x.textContent)); if (b && b.getClientRects().length) b.click(); });
  await sleep(300); await page.evaluate(() => document.getElementById('tab-settings').click()); await sleep(800);

  const layout = await page.evaluate(() => {
    const P = window.PM51 && window.PM51.placement;
    const ws = window.PM12_DATA.domains.flatMap(d => d.workspaces.map(w => ({ domain: d.id, domainLabel: d.label, id: w.id, label: w.label, type: w.type, virtual: !!w.virtualAllSettings,
      tabs: [...new Set((w.sections || []).filter(s => s.inline && s.tab).map(s => s.tab))], inline: (w.sections || []).filter(s => s.inline).map(s => ({ id: s.id, tab: s.tab || null, advanced: !!s.advanced, composed: !!s.composed, rows: (s.settings || []).length })) })));
    return { hasPlacement: !!P, ids: P ? Object.keys(P.byId).length : 0, workspaces: ws, audit: P ? P.audit() : null, domains: window.PM12_DATA.domains.map(d => d.id + ':' + d.label) };
  });
  report.census.layout = layout;
  const plain = layout.workspaces.filter(w => w.type === 'settings' && !w.virtual);
  const managers = layout.workspaces.filter(w => w.type !== 'settings');
  const expectedIds = layout.ids;

  await check('placement ran: 892 canonical ids resolved, six plain workspaces remain (five pages + All Project Settings), the reference pages are gone, the Assistant page is retired', async () => {
    if (!layout.hasPlacement) throw new Error('PM51.placement missing');
    const a = layout.audit;
    const problems = [];
    if (a.ids !== 892) problems.push('audit ids ' + a.ids);
    if (a.unplaced.length) problems.push('unplaced ' + a.unplaced.slice(0, 5).join(','));
    if (a.duplicates.length) problems.push('duplicates ' + a.duplicates.slice(0, 5).join(','));
    if (a.missingTabs.length) problems.push('missing tabs ' + a.missingTabs.slice(0, 5).join(','));
    const plainAll = layout.workspaces.filter(w => w.type === 'settings');
    if (plainAll.length !== 6) problems.push('plain workspaces ' + plainAll.map(w => w.id).join(','));
    if (layout.workspaces.some(w => /-reference$/.test(w.id) && !['code-reference', 'planning-reference'].includes(w.id))) problems.push('reference page survived');
    if (layout.workspaces.some(w => w.id === 'assistant')) problems.push('assistant page not retired');
    if (!layout.domains.some(d => d === 'planning:Planning')) problems.push('planning domain label ' + layout.domains.filter(d => d.startsWith('planning')).join());
    if (problems.length) throw new Error(problems.join('; '));
    return { ids: a.ids, placed: a.placed, sections: a.sections, deleted: a.deleted, retired: a.retired, plain: plainAll.map(w => w.id) };
  });

  const seen = new Map(); const walk = [];
  await check('exactly-once walk: every workspace and every manager tab rendered; the union of #setting-<id> and [data-setting-id] rows equals the 892 canonical ids, none twice, and each row sits where the placement map says', async () => {
    const problems = [];
    const record = (ws, tab, ids) => {
      walk.push({ ws, tab, rows: ids.length });
      for (const id of ids) {
        const where = ws + (tab ? '/' + tab : '');
        if (seen.has(id) && seen.get(id).split('/')[0] !== ws) problems.push(id + ' twice: ' + seen.get(id) + ' + ' + where);
        else if (!seen.has(id)) seen.set(id, where);
      }
    };
    for (const w of layout.workspaces) {
      if (w.virtual) continue;
      await nav(w.domain, w.id);
      const tabs = await page.evaluate(id => [...document.querySelectorAll(`[data-workspace-block="${id}"] .manager-page > .manager-tabs .manager-tab[data-action="pm51-tab"]`)].map(b => b.dataset.tab), w.id);
      if (!tabs.length) { const ids = await idsIn(w.id); if (!ids) { problems.push(w.id + ': block missing'); continue; } record(w.id, null, ids); continue; }
      const perTab = new Map();
      for (const t of tabs) { await clickTab(w.id, t); const ids = await idsIn(w.id); perTab.set(t, ids || []); record(w.id, t, ids || []); }
      // a row must not repeat across the tabs of one manager either
      const inTabs = new Map();
      for (const [t, ids] of perTab) for (const id of ids) { if (inTabs.has(id) && inTabs.get(id) !== t) problems.push(id + ' on two tabs of ' + w.id); inTabs.set(id, t); }
      await clickTab(w.id, tabs[0]);
    }
    const placement = await page.evaluate(ids => ids.map(id => { const e = window.PM51.placement.byId[id]; return [id, e ? e.workspace : null, e ? (e.tab || null) : null]; }), [...seen.keys()]);
    const handOnly = [];
    for (const [id, ws, tab] of placement) {
      const at = seen.get(id); const [aws, atab] = at.split('/');
      if (!ws) { handOnly.push(id + '@' + aws); seen.delete(id); continue; }
      if (ws !== aws) problems.push(id + ' rendered on ' + at + ', placed on ' + ws);
      else if (tab && atab && tab !== atab) problems.push(id + ' rendered on tab ' + atab + ', placed on ' + tab);
    }
    const missing = await page.evaluate(found => Object.keys(window.PM51.placement.byId).filter(id => !found.includes(id)), [...seen.keys()]);
    if (missing.length) problems.push('never rendered: ' + missing.slice(0, 8).join(', ') + (missing.length > 8 ? ' … +' + (missing.length - 8) : ''));
    if (seen.size !== expectedIds) problems.push('rendered ' + seen.size + ' distinct ids, expected ' + expectedIds);
    report.census.walk = walk; report.census.handOnlyRows = handOnly;
    // the concept's own hand rows may sit inside a manager only when placement.json moved them there (hand_moves)
    const strays = await page.evaluate(list => {
      // a hand row is legitimate inside a manager only when it sits in a synthetic placement section of that manager (hand_moves)
      const sectionOf = id => { for (const d of window.PM12_DATA.domains) for (const w of d.workspaces) for (const s of w.sections || []) if ((s.settings || []).some(st => st.id === id)) return { section: s.id, inline: !!s.inline, workspace: w.id }; return null; };
      const check = x => { const [id, ws] = x.split('@'); if (/^(app-input|editor-runtime|advanced|code-reference|planning-reference)$/.test(ws)) return null; const f = sectionOf(id); const meta = f && window.PM51.placement.sectionMeta(f.section); return f && f.inline && f.workspace === ws && meta && meta.workspace === ws ? null : x + (f ? '(' + f.section + ')' : '(no section)'); };
      return list.map(check).filter(Boolean);
    }, handOnly);
    if (strays.length) problems.push('non-canonical rows inside a manager that no hand_move placed: ' + strays.slice(0, 6).join(','));
    if (problems.length) throw new Error(problems.slice(0, 12).join('; '));
    return { distinct: seen.size, views: walk.length, handOnlyRows: handOnly.length };
  });

  await check('no manager-topic rows remain on the plain pages: every row on App & Input, Editor & Runtime, Containers & Execution, Planning & Interviews and Advanced is a page placement', async () => {
    const problems = [];
    for (const w of plain) {
      await nav(w.domain, w.id);
      const r = await page.evaluate(id => {
        const ids = [...document.querySelectorAll(`[data-workspace-block="${id}"] .setting-row[id^="setting-"]`)].map(n => n.id.slice(8));
        const off = ids.filter(x => { const e = window.PM51.placement.byId[x]; return e && (!e.page || e.workspace !== id); });
        const hand = ids.filter(x => window.PM51.placement.byId[x] && window.PM51.placement.byId[x].hand).length;
        return { rows: ids.length, off, hand };
      }, w.id);
      w.rows = r.rows; w.hand = r.hand;
      if (!r.rows) problems.push(w.id + ': no rows');
      if (r.off.length) problems.push(w.id + ': ' + r.off.slice(0, 4).join(','));
    }
    if (problems.length) throw new Error(problems.join('; '));
    return plain.map(w => `${w.id}:${w.rows}`).join(' ');
  });

  await check('inline block order: in every manager view the inline sections sit before the view\'s direct-child Advanced (or the quiet row), advanced placements are the first thing inside that Advanced, and no view carries a second Advanced', async () => {
    const problems = [];
    for (const m of managers) {
      await nav(m.domain, m.id);
      const tabs = await page.evaluate(id => [...document.querySelectorAll(`[data-workspace-block="${id}"] .manager-page > .manager-tabs .manager-tab[data-action="pm51-tab"]`)].map(b => b.dataset.tab), m.id);
      const views = tabs.length ? tabs : [null];
      for (const t of views) {
        if (t) await clickTab(m.id, t);
        const r = await page.evaluate(id => {
          const blk = document.querySelector(`[data-workspace-block="${id}"]`);
          const scroll = blk.querySelector('.manager-scroll'); if (!scroll) return { skip: 'no scroll' };
          const manual = !!blk.querySelector('[data-pm51-placed="manual"]');
          const advanced = [...scroll.querySelectorAll('details.pm51-advanced')];
          const direct = advanced.filter(d => d.parentElement === scroll);
          const inline = [...scroll.querySelectorAll('.pm51-settings-inline:not(.is-advanced)')].filter(n => !n.closest('details.pm51-advanced'));
          const advInline = [...scroll.querySelectorAll('.pm51-settings-inline.is-advanced')];
          const problems = [];
          if (advanced.length > 1) problems.push(advanced.length + ' Advanced');
          for (const n of inline) {
            if (manual) break;
            let sib = n.nextElementSibling, ok = true;
            while (sib) { if (!sib.matches('details.pm51-advanced, .pm51-quiet, .pm51-settings-inline, .pm51-page-foot')) { ok = false; break; } sib = sib.nextElementSibling; }
            if (!ok) problems.push('content after the inline block: ' + (n.nextElementSibling.className || n.nextElementSibling.tagName));
            if (direct.length && n.parentElement !== scroll && !n.closest('.pm51-split')) problems.push('inline block is not a direct child of the view');
          }
          for (const n of advInline) {
            const d = n.closest('details.pm51-advanced'); if (!d) { problems.push('advanced placement outside Advanced'); continue; }
            const body = n.parentElement;
            const first = [...body.children].find(c => !c.matches('summary'));
            if (first !== n && body !== d) problems.push('advanced placement is not first inside Advanced');
            else if (body === d && [...d.children].filter(c => !c.matches('summary'))[0] !== n) problems.push('advanced placement is not first inside Advanced');
          }
          return { manual, inline: inline.length, advInline: advInline.length, advanced: advanced.length, problems };
        }, m.id);
        if (r.skip) continue;
        if (r.problems.length) problems.push(`${m.id}${t ? '/' + t : ''}: ${r.problems.join(', ')}`);
      }
      if (tabs.length) await clickTab(m.id, tabs[0]);
    }
    if (problems.length) throw new Error(problems.slice(0, 10).join('; '));
    return { managers: managers.length };
  });

  await check('page index lists every non-advanced inline section of a manager under tab captions and each link scrolls to (and switches to) its section', async () => {
    const m = managers.find(w => w.id === 'commands'); if (!m) throw new Error('commands manager missing');
    await nav(m.domain, m.id);
    const r = await page.evaluate(() => {
      const links = [...document.querySelectorAll('.page-index [data-action="scroll-section"][data-workspace="commands"]')].map(b => ({ section: b.dataset.section, tab: b.dataset.tab || null, label: b.textContent.trim() }));
      const captions = [...document.querySelectorAll('.page-index .pm51-index-caption')].map(n => n.textContent.trim());
      const ws = window.PM12_DATA.domains.flatMap(d => d.workspaces).find(w => w.id === 'commands');
      const inline = (ws.sections || []).filter(s => s.inline && !s.advanced).map(s => s.id);
      const advanced = (ws.sections || []).filter(s => s.inline && s.advanced).map(s => s.id);
      return { links, captions, inline, advanced };
    });
    const missing = r.inline.filter(id => !r.links.some(l => l.section === id));
    if (missing.length) throw new Error('index lacks ' + missing.join(','));
    if (r.links.length !== r.inline.length) throw new Error('index lists ' + r.links.length + ' sections for ' + r.inline.length + ' inline sections');
    if (!r.captions.includes('Shortcuts') || !r.captions.includes('Commands')) throw new Error('tab captions ' + r.captions.join('|'));
    // a link on the other tab switches the tab and lands on the section
    await page.evaluate(() => document.querySelector('.page-index [data-action="scroll-section"][data-section="commands-behaviour"]').click());
    await sleep(900);
    const landed = await page.evaluate(() => {
      const sec = document.querySelector('#section-commands-behaviour'); if (!sec) return { sec: false };
      const tab = document.querySelector('[data-workspace-block="commands"] .manager-tab.active');
      const rect = sec.getBoundingClientRect(), sc = document.querySelector('#settings-document').getBoundingClientRect();
      return { sec: true, tab: tab && tab.dataset.tab, visible: rect.bottom > sc.top && rect.top < sc.bottom };
    });
    if (!landed.sec) throw new Error('commands-behaviour not rendered after the index click');
    if (landed.tab !== 'commands') throw new Error('tab after index click: ' + landed.tab);
    if (!landed.visible) throw new Error('section not in view after the index click');
    return { links: r.links.length, inline: r.inline.length, advancedNotListed: r.advanced.length, captions: r.captions };
  });

  await check('All Project Settings still counts every canonical id ("of 892"), offers 12 categories, and lists a moved Skills setting', async () => {
    await nav('projects', 'project-settings');
    const r = await page.evaluate(() => {
      const count = document.querySelector('[data-all-settings-count]');
      const sel = document.querySelector('[data-workspace-block="project-settings"] select[data-filter="category"]');
      const cats = sel ? [...sel.options].map(o => o.value).filter(v => v !== 'all') : [];
      const dd = sel && sel.closest('.pm51-dd') && sel.closest('.pm51-dd').querySelector('.pm51-dd-trigger');
      return { count: count && count.textContent.trim(), cats, themed: !!dd, nativeVisible: sel ? sel.getClientRects().length > 0 : null };
    });
    if (!/of 892 settings/.test(r.count || '')) throw new Error('count reads ' + r.count);
    if (r.cats.length !== 12) throw new Error('categories ' + r.cats.length + ': ' + r.cats.join(','));
    if (!r.themed || r.nativeVisible) throw new Error('category facet is not the themed dropdown');
    // filter by category through the hidden select (the engine change path) and look for a moved skills id
    await page.evaluate(() => { const sel = document.querySelector('[data-workspace-block="project-settings"] select[data-filter="category"]'); sel.value = 'extensions'; sel.dispatchEvent(new Event('change', { bubbles: true })); });
    await sleep(500);
    const found = await page.waitFor(() => { const c = document.querySelector('[data-all-settings-count]'); return c && /^\d+ of 892/.test(c.textContent.trim()) && !/^892 of/.test(c.textContent.trim()) ? c.textContent.trim() : false; }, { timeout: 4000 });
    const skills = await page.evaluate(() => !!document.querySelector('[data-workspace-block="project-settings"] .setting-row[id^="setting-extensions.skills."]'));
    if (!skills) throw new Error('no extensions.skills row in the filtered list (' + found + ')');
    await page.evaluate(() => { const sel = document.querySelector('[data-workspace-block="project-settings"] select[data-filter="category"]'); sel.value = 'all'; sel.dispatchEvent(new Event('change', { bubbles: true })); });
    await sleep(300);
    return { count: r.count, filtered: found };
  });

  await check('Details opens for a moved Skills setting from its inline row and names its inline section', async () => {
    await nav('code', 'skills');
    const r = await page.evaluate(() => {
      const row = document.querySelector('[data-workspace-block="skills"] .pm51-settings-inline .setting-row[id^="setting-extensions.skills."]'); if (!row) return { row: false };
      const btn = row.querySelector('[data-action="setting-details"]'); if (!btn) return { row: true, btn: false };
      btn.click(); return { row: true, btn: true, id: row.id.slice(8) };
    });
    if (!r.row) throw new Error('no inline skills row'); if (!r.btn) throw new Error('inline row has no Details button');
    await page.waitFor(() => !!document.querySelector('.detail-inspector.is-open'), { timeout: 5000 }); await sleep(500);
    const insp = await page.evaluate(id => {
      const ins = document.querySelector('.detail-inspector.is-open');
      const status = ins.querySelector('.pm51-panel-sub, .detail-status'); const title = ins.querySelector('.pm51-panel-title, .detail-title');
      const row = document.querySelector(`#setting-${CSS.escape(id)}`);
      return { title: title && title.textContent.trim(), status: status && status.textContent.trim(), rowStill: !!row && !!row.closest('.pm51-settings-inline'), width: Math.round(ins.getBoundingClientRect().width) };
    }, r.id);
    if (!/Skills settings|Skill permissions/.test(insp.status || '')) throw new Error('inspector section reads "' + insp.status + '"');
    if (!insp.rowStill) throw new Error('inline row vanished while the inspector is open');
    await page.evaluate(() => { const b = document.querySelector('.detail-inspector.is-open [data-action="close-details"]'); if (b) b.click(); });
    await sleep(500);
    const closed = await page.evaluate(() => !document.querySelector('.detail-inspector.is-open'));
    if (!closed) throw new Error('inspector did not close');
    return insp;
  });

  await check('search (rail ⌘K box) for a moved Commands setting lands on the Commands tab with the row in view and flashed', async () => {
    await nav('general', 'app-input');
    const has = await page.evaluate(() => { const i = document.querySelector('[data-global-search]'); if (!i) return false; i.focus(); i.value = 'command permissions override'; i.dispatchEvent(new Event('input', { bubbles: true })); return true; });
    if (!has) throw new Error('no rail search input');
    await page.waitFor(() => !!document.querySelector('.search-results .search-result'), { timeout: 5000 });
    const hit = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.search-results .search-result')];
      const b = rows.find(x => (x.getAttribute('data-search-payload') || '').includes('extensions.commands.command-permissions'));
      if (!b) return { found: false, first: rows.slice(0, 3).map(x => x.textContent.trim().slice(0, 60)) };
      b.click(); return { found: true };
    });
    if (!hit.found) throw new Error('search did not list the setting: ' + JSON.stringify(hit.first));
    await page.waitFor(() => { const r = document.querySelector('#setting-extensions\\.commands\\.command-permissions'); return !!r && r.classList.contains('is-flash'); }, { timeout: 6000 });
    await sleep(400);
    const landed = await page.evaluate(() => {
      const r = document.querySelector('#setting-extensions\\.commands\\.command-permissions');
      const rect = r.getBoundingClientRect(), sc = document.querySelector('#settings-document').getBoundingClientRect();
      const tab = document.querySelector('[data-workspace-block="commands"] .manager-tab.active');
      return { tab: tab && tab.dataset.tab, visible: rect.top >= sc.top - 1 && rect.bottom <= sc.bottom + 1, workspace: window.PM12_KIMI.getState().workspace, inline: !!r.closest('.pm51-settings-inline') };
    });
    if (landed.tab !== 'commands') throw new Error('active tab ' + landed.tab);
    if (!landed.visible) throw new Error('row not fully in view');
    if (!landed.inline) throw new Error('row is not inside the inline block');
    return landed;
  });

  await check('refreshSettingRow swaps a toggled inline row in place, the value survives a tab round-trip, and the inspector-open soft remount keeps the row inline', async () => {
    await nav('code', 'commands'); await clickTab('commands', 'commands');
    const id = 'extensions.commands.override-builtin';
    const sel = '#setting-extensions\\.commands\\.override-builtin';
    const before = await page.evaluate(s => { const r = document.querySelector(s); const t = r && r.querySelector('[data-action="toggle-setting"]'); return t ? { on: t.getAttribute('aria-pressed'), inline: !!r.closest('.pm51-settings-inline') } : null; }, sel);
    if (!before) throw new Error('row or toggle missing');
    await page.evaluate(s => document.querySelector(s + ' [data-action="toggle-setting"]').click(), sel); await sleep(350);
    const after = await page.evaluate(s => { const r = document.querySelector(s); const t = r.querySelector('[data-action="toggle-setting"]'); return { on: t.getAttribute('aria-pressed'), inline: !!r.closest('.pm51-settings-inline'), changed: r.classList.contains('is-changed') || !!r.querySelector('.changed-chip') }; }, sel);
    if (after.on === before.on) throw new Error('toggle did not flip'); if (!after.inline) throw new Error('row left the inline block after refresh');
    await clickTab('commands', 'shortcuts'); await clickTab('commands', 'commands');
    const round = await page.evaluate(s => { const r = document.querySelector(s); const t = r && r.querySelector('[data-action="toggle-setting"]'); return t ? t.getAttribute('aria-pressed') : null; }, sel);
    if (round !== after.on) throw new Error('value after tab round-trip ' + round);
    // inspector-open path: refreshSettingRow soft-remounts the whole app
    await page.evaluate(s => document.querySelector(s + ' [data-action="setting-details"]').click(), sel);
    await page.waitFor(() => !!document.querySelector('.detail-inspector.is-open'), { timeout: 5000 }); await sleep(400);
    await page.evaluate(s => document.querySelector(s + ' [data-action="toggle-setting"]').click(), sel); await sleep(700);
    const soft = await page.evaluate(s => { const r = document.querySelector(s); const t = r && r.querySelector('[data-action="toggle-setting"]'); const ins = document.querySelector('.detail-inspector.is-open'); return { on: t && t.getAttribute('aria-pressed'), inline: !!(r && r.closest('.pm51-settings-inline')), inspector: !!ins, tab: (document.querySelector('[data-workspace-block="commands"] .manager-tab.active') || {}).dataset?.tab }; }, sel);
    if (soft.on !== before.on) throw new Error('second toggle through the soft remount did not restore the value: ' + soft.on);
    if (!soft.inline) throw new Error('row not inline after the soft remount'); if (!soft.inspector) throw new Error('inspector closed by the soft remount'); if (soft.tab !== 'commands') throw new Error('tab after soft remount ' + soft.tab);
    await page.evaluate(() => { const b = document.querySelector('.detail-inspector.is-open [data-action="close-details"]'); if (b) b.click(); }); await sleep(400);
    return { before: before.on, after: after.on, restored: soft.on };
  });

  await check('a composed manager (Back Seat Driver) renders its canonical rows once through the kit and its presentation override survives an engine row refresh', async () => {
    const bsd = managers.find(w => w.id === 'bsd'); if (!bsd) throw new Error('bsd manager missing');
    await nav(bsd.domain, bsd.id);
    const r = await page.evaluate(() => {
      const blk = document.querySelector('[data-workspace-block="bsd"]');
      const rows = [...blk.querySelectorAll('.setting-row[id^="setting-safety.approvals.bsd-"]')].map(n => n.id.slice(8));
      const mode = blk.querySelector('#setting-safety\\.approvals\\.bsd-mode');
      const seg = mode && mode.querySelector('.segmented, [role="radiogroup"], .pm51-segmented');
      const manual = !!blk.querySelector('[data-pm51-placed="manual"]');
      return { rows, dupes: rows.filter((x, i) => rows.indexOf(x) !== i), segmented: !!seg, manual, segButtons: seg ? seg.querySelectorAll('button').length : 0 };
    });
    if (r.dupes.length) throw new Error('duplicate rows ' + r.dupes.join(','));
    if (!r.manual) throw new Error('bsd is not marked manual placement');
    if (!r.segmented) throw new Error('bsd-mode is not rendered as the segmented override');
    // click a different segment: the engine's change path refreshes the row; the override must come back
    const flipped = await page.evaluate(() => {
      const mode = document.querySelector('#setting-safety\\.approvals\\.bsd-mode');
      const btns = [...mode.querySelectorAll('.segmented button, [role="radiogroup"] button, .pm51-segmented button')];
      const other = btns.find(b => !(b.classList.contains('active') || b.classList.contains('is-active') || b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-checked') === 'true'));
      if (!other) return { clicked: false };
      other.click(); return { clicked: true, label: other.textContent.trim() };
    });
    if (!flipped.clicked) throw new Error('no inactive segment to click');
    await sleep(450);
    const again = await page.evaluate(() => { const mode = document.querySelector('#setting-safety\\.approvals\\.bsd-mode'); return { present: !!mode, segmented: !!(mode && mode.querySelector('.segmented, [role="radiogroup"], .pm51-segmented')), inline: !!(mode && mode.closest('.pm51-setting-rows')) }; });
    if (!again.present || !again.segmented || !again.inline) throw new Error('after the change: ' + JSON.stringify(again));
    return { rows: r.rows.length, segment: flipped.label };
  });

  await check('runtime placement audit reports nothing unplaced, duplicated, or on a missing tab; every id is reachable through findSettingGlobal', async () => {
    const r = await page.evaluate(() => {
      const a = window.PM51.placement.audit();
      const K = window.PM12_KIMI;
      const missing = K && typeof K.findSettingGlobal === 'function' ? Object.keys(window.PM51.placement.byId).filter(id => !K.findSettingGlobal(id)) : null;
      return { unplaced: a.unplaced, duplicates: a.duplicates, missingTabs: a.missingTabs, ids: a.ids, placed: a.placed, missing };
    });
    if (r.unplaced.length || r.duplicates.length || r.missingTabs.length) throw new Error(JSON.stringify(r));
    if (r.placed !== r.ids) throw new Error('placed ' + r.placed + ' of ' + r.ids);
    if (r.missing && r.missing.length) throw new Error('findSettingGlobal misses ' + r.missing.slice(0, 6).join(','));
    return { ids: r.ids, placed: r.placed, probedFind: r.missing !== null };
  });

  await check('no browser page errors during the placement checkpoint', async () => { if (page.errors.length) throw new Error(page.errors.slice(0, 5).join(' | ')); });
  report.errors = page.errors;
} finally {
  await close();
  report.pass = report.checks.every(c => c.pass);
  writeFileSync(join(out, 'settings-placement-checkpoint.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(report.pass ? 'ALL PASS' : 'FAILURES: ' + report.checks.filter(c => !c.pass).map(c => c.name).join('; '));
  process.exitCode = report.pass ? 0 : 1;
}
