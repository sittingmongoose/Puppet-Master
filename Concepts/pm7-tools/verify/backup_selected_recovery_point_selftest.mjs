/* FS01 selected-recovery-point regression (BRS-014/BRS-019).
 *
 * Executes the authored backup manager module (settings_refresh/managers/54-backup.js) in a Node
 * sandbox with minimal PM51/page stubs and drives the real registered handlers. Checks that the
 * chosen/history recovery point keeps the same immutable snapshot identity across Verify, Browse,
 * Restore and confirmation, through list reordering, and reports unavailable instead of silently
 * falling back to latest when the selected snapshot vanishes. The explicit "Verify latest backup"
 * action must stay separate.
 *
 * Deterministic helper-level behavior only; no browser, storage mutation, provider operation, or
 * native/runtime claim.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const managerPath = fileURLToPath(new URL('../settings_refresh/managers/54-backup.js', import.meta.url));
const managerSource = readFileSync(managerPath, 'utf8');

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = v => JSON.parse(JSON.stringify(v));
const ds = (el, key, fallback = '') => el?.dataset?.[key] ?? fallback;

const SEED_HISTORY = [
  { time: 'Today · 2:00 AM', type: 'Incremental', destination: 'TrueNAS backup', size: '182 MB', result: 'Verified', receipt: 'BKP-2048' },
  { time: 'Yesterday · 2:00 AM', type: 'Incremental', destination: 'TrueNAS backup', size: '96 MB', result: 'Verified', receipt: 'BKP-2047' },
  { time: 'Sunday · 3:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.4 GB', result: 'Verified', receipt: 'BKP-2042' }
];

function fixture({ history = SEED_HISTORY } = {}) {
  const effects = { checks: [], toasts: [], confirms: [], panels: [], dialogs: [], refreshes: 0 };
  const state = {
    updates: { currentVersion: '0.8.0-dev' },
    backup: null,
    pm51: {
      tabs: {}, sel: {},
      backup: {
        automatic: true,
        recoveryKit: { saved: true, tested: false },
        protected: { pmData: true, files: true, history: true },
        destinationFamilies: [['Cloud account', ['Google Drive']]],
        destinations: [{ id: 'truenas', name: 'TrueNAS backup', type: 'Folder / NAS share', family: 'Another computer or NAS', account: 'Home NAS', path: 'Backups/Puppet-Master', state: 'Ready', encryption: 'Encrypted · key ready', usedBy: 'Daily incremental · Weekly full', lastCheck: 'Today · 2:00 AM', default: true }]
      }
    }
  };
  const D = { backupState: {
    destinations: clone(state.pm51.backup.destinations),
    schedules: [{ id: 'daily', name: 'Daily incremental', when: '2:00 AM', destination: 'TrueNAS backup', retention: '30 daily', enabled: true }],
    history: clone(history),
    retention: { conversations: 'Keep indefinitely' }
  } };
  const managers = {}, actions = {}, changes = {};
  const dataAttrs = data => Object.entries(data || {}).map(([k, v]) => ` data-${esc(k)}="${esc(v == null ? '' : v)}"`).join('');
  const PM51 = {
    h: esc, a: esc,
    style: () => {},
    s: () => state.pm51,
    manager: (type, def) => { managers[type] = def; },
    on: (name, fn) => { actions[name] = fn; },
    onChange: (name, fn) => { changes[name] = fn; },
    tab: (id, fallback) => state.pm51.tabs[id] || fallback,
    setTab: (id, tab) => { state.pm51.tabs[id] = tab; },
    sel: (id, fallback) => state.pm51.sel[id] || fallback,
    setSel: (id, value) => { state.pm51.sel[id] = value; },
    refresh: () => { effects.refreshes++; },
    check: box => { effects.checks.push(box); },
    toast: (title, message, type) => { effects.toasts.push({ title, message, type }); },
    confirm: (title, message, label, onConfirm, danger) => { effects.confirms.push({ title, message, label, onConfirm }); },
    panel: opts => { effects.panels.push(opts); return '<div class="pm51-panel"></div>'; },
    tone: label => ({ verified: 'ready', on: 'ready', off: 'off', 'not set up': 'off' }[String(label).toLowerCase()] || 'neutral'),
    status: (label, tone) => `<span class="pm51-status tone-${esc(tone || PM51.tone(label))}">${esc(label)}</span>`,
    pill: (label, tone) => PM51.status(label, tone),
    btn: ({ label, action, data, disabled, reason }) =>
      `<button type="button" data-action="${esc(disabled ? 'pm51-disabled' : (action || 'pm51-noop'))}"${dataAttrs(data)}${disabled ? ` aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${esc(reason || '')}"` : ''}>${label ? `<span>${esc(label)}</span>` : ''}</button>`,
    select: (value, options, opts = {}) =>
      `<select data-action="${esc(opts.action || 'pm51-noop')}" aria-label="${esc(opts.label || '')}">${(options || []).map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`,
    segmented: (value, options, opts = {}) =>
      `<div class="pm51-seg">${options.map(o => `<button data-action="${esc(opts.action || 'pm51-noop')}" data-value="${esc(o)}"${String(o) === String(value) ? ' class="active"' : ''}>${esc(o)}</button>`).join('')}</div>`,
    toggle: (on, opts = {}) => `<button class="pm51-toggle${on ? ' on' : ''}" data-action="${esc(opts.action || 'pm51-noop')}" aria-checked="${on ? 'true' : 'false'}"></button>`,
    section: ({ title, help, action, body }) => `<section class="pm51-section"><h3 class="pm51-section-title">${esc(title)}</h3>${help ? `<p class="pm51-section-help">${esc(help)}</p>` : ''}${action ? PM51.btn(action) : ''}<div class="pm51-section-body">${body || ''}</div></section>`,
    rows: rows => `<div class="pm51-rows">${rows.filter(Boolean).map(r => `<div class="pm51-row"><div class="pm51-row-label">${esc(r.label)}${r.pill ? ' ' + r.pill : ''}</div>${r.help ? `<div class="pm51-row-help">${esc(r.help)}</div>` : ''}<div class="pm51-row-control">${r.control || (r.value != null ? `<span class="pm51-row-value">${esc(String(r.value))}</span>` : '')}${r.action ? PM51.btn(r.action) : ''}</div></div>`).join('')}</div>`,
    list: items => `<div class="pm51-list">${items.map(it => `<div class="pm51-item"${it.action ? ` data-action="${esc(it.action)}"` : ''}${dataAttrs(it.data)}><div class="pm51-item-title">${esc(it.title)}</div><div class="pm51-item-meta">${esc(it.meta || '')}</div><div class="pm51-item-end">${it.end || ''}</div></div>`).join('')}</div>`,
    empty: (title, copy) => `<div class="pm51-empty"><div class="empty-title">${esc(title)}</div>${copy ? `<div class="empty-copy">${esc(copy)}</div>` : ''}</div>`,
    note: (text, tone) => `<p class="pm51-note tone-${esc(tone || 'info')}">${esc(text)}</p>`,
    kv: pairs => `<div class="pm51-kv">${pairs.filter(Boolean).map(([k, v]) => `<div class="pm51-kv-row"><span>${esc(k)}</span><span>${esc(String(v))}</span></div>`).join('')}</div>`,
    advanced: body => `<details class="pm51-advanced"><div class="pm51-advanced-body">${body}</div></details>`,
    steps: items => `<ol class="pm51-steps">${items.filter(Boolean).map(s => `<li class="pm51-step"><div class="pm51-step-title">${esc(s.title)}</div>${s.desc ? `<div class="pm51-step-desc">${esc(s.desc)}</div>` : ''}<div class="pm51-step-end">${s.action ? (typeof s.action === 'string' ? s.action : PM51.btn(s.action)) : ''}</div></li>`).join('')}</ol>`,
    panelSection: (title, body) => `<div class="pm51-panel-section"><h4>${esc(title)}</h4>${body}</div>`,
    field: (label, control, help) => `<label class="pm51-field">${esc(label)}${control}${help ? `<span>${esc(help)}</span>` : ''}</label>`,
    input: (value, opts = {}) => `<input class="${esc(opts.cls || '')}" value="${esc(value == null ? '' : value)}">`,
    form: fields => fields.map(f => PM51.field(f.label, '')).join(''),
    page: ({ body }) => `<div class="pm51-mgr">${body}</div>`,
    listDetail: ({ items, detail }) => `<div class="pm51-listdetail">${PM51.list(items)}<div class="pm51-detail">${esc(detail.title)}</div>${detail.body || ''}</div>`,
    menu: () => '<menu></menu>',
    quiet: items => `<div class="pm51-quiet">${items.map(i => `<button>${esc(i.label)}</button>`).join('')}</div>`
  };
  const sandbox = {
    PM51, state, D,
    clone, ds,
    uid: (prefix, name = '') => `${prefix}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    icon: name => `<i class="icon-${esc(name)}"></i>`,
    saveState: () => {},
    openDialog: opts => { effects.dialogs.push(opts); return '<div class="pm51-dialog"></div>'; },
    closeOverlay: () => {}
  };
  vm.runInNewContext(managerSource, sandbox, { filename: managerPath });
  const t = {
    state, D, effects, actions, changes, managers,
    hist: () => { if (!state.backup) state.backup = clone(D.backupState); return state.backup.history; },
    render: tab => { state.pm51.tabs.backup = tab; return managers.backup.render(); }
  };
  // warm eng() so tests can mutate history directly
  t.hist();
  return t;
}

let passed = 0;
async function test(label, fn) { await fn(); passed++; console.log(`PASS ${label}`); }

await test('manager loads and every tab renders with identity-keyed controls', () => {
  const t = fixture();
  const backupHtml = t.render('backup'), restoreHtml = t.render('restore'), historyHtml = t.render('history');
  assert.ok(backupHtml.includes('Verify latest backup') && backupHtml.includes('data-action="pm51-backup-verify"'));
  assert.ok(restoreHtml.includes('data-action="pm51-backup-verify-selected"'));
  assert.ok(!restoreHtml.includes('data-action="pm51-backup-verify"'));
  for (const receipt of ['BKP-2048', 'BKP-2047', 'BKP-2042']) {
    assert.ok(restoreHtml.includes(`value="${receipt}"`), `restore select carries ${receipt}`);
    assert.ok(historyHtml.includes(`data-id="${receipt}"`), `history row keyed by ${receipt}`);
  }
  assert.ok(!historyHtml.includes('data-index='));
});

await test('chosen older recovery point verifies itself, not latest', () => {
  const t = fixture();
  t.changes['backup-restore-which']({ dataset: {}, value: 'BKP-2047' });
  const html = t.render('restore');
  assert.ok(html.includes('Whole workspace from Yesterday · 2:00 AM'));
  assert.ok(html.includes('value="BKP-2047" selected'));
  t.actions['backup-verify-selected']({ dataset: {} });
  const check = t.effects.checks.at(-1);
  assert.equal(check.title, 'Verify backup · Yesterday · 2:00 AM');
  const evidence = JSON.stringify(check);
  assert.ok(evidence.includes('BKP-2047') && evidence.includes('Yesterday · 2:00 AM'));
  assert.ok(!evidence.includes('Today · 2:00 AM'), 'must not verify the newest backup');
});

await test('selected old point survives list reorder: prepend keeps Verify, Browse, Restore and confirmation pinned', () => {
  const t = fixture();
  t.changes['backup-restore-which']({ dataset: {}, value: 'BKP-2047' });
  t.hist().unshift({ time: 'Tomorrow · 1:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.6 GB', result: 'Verified', receipt: 'BKP-2049' });
  const html = t.render('restore');
  assert.ok(html.includes('Whole workspace from Yesterday · 2:00 AM'), 'review keeps the chosen point after a newer backup appears');
  assert.ok(html.includes('value="BKP-2047" selected'));
  t.actions['backup-verify-selected']({ dataset: {} });
  const check = t.effects.checks.at(-1);
  assert.ok(check.title.includes('Yesterday · 2:00 AM') && !JSON.stringify(check).includes('Tomorrow'));
  t.actions['backup-browse']({ dataset: {} });
  assert.ok(t.effects.panels.at(-1).subtitle.includes('Yesterday · 2:00 AM') && !t.effects.panels.at(-1).subtitle.includes('Tomorrow'));
  t.actions['backup-restore-start']({ dataset: {} });
  assert.equal(t.effects.confirms.length, 1);
  assert.ok(t.effects.confirms[0].message.includes('Yesterday · 2:00 AM'));
  assert.ok(!t.effects.confirms[0].message.includes('Tomorrow · 1:00 AM'), 'confirmation must not retarget to the new latest');
});

await test('selected snapshot vanished: selection retained, unavailable shown, never a silent latest fallback', () => {
  const t = fixture();
  t.changes['backup-restore-which']({ dataset: {}, value: 'BKP-2047' });
  t.state.backup.history = t.hist().filter(x => x.receipt !== 'BKP-2047');
  const html = t.render('restore');
  assert.ok(html.includes('The selected backup is no longer in the list.'));
  assert.ok(html.includes('Selected backup no longer listed'), 'control shows the unavailable state explicitly');
  assert.ok(html.includes('value="BKP-2047" selected'), 'vanished identity stays selected instead of silently moving');
  assert.ok(html.includes('data-pm51-disabled="1"'));
  assert.ok(html.includes('The selected backup is no longer listed.'));
  assert.equal(t.state.pm51.backupRestore.whichId, 'BKP-2047');
  const checks = t.effects.checks.length, confirms = t.effects.confirms.length, panels = t.effects.panels.length;
  t.actions['backup-verify-selected']({ dataset: { id: 'BKP-2047' } });
  assert.equal(t.effects.checks.length, checks, 'stale verify must not open a latest check');
  assert.ok(t.effects.toasts.at(-1).title.includes('not available'));
  t.actions['backup-restore-start']({ dataset: {} });
  assert.equal(t.effects.confirms.length, confirms, 'stale restore must not confirm against latest');
  t.actions['backup-browse']({ dataset: {} });
  assert.equal(t.effects.panels.length, panels, 'stale browse must not browse latest');
});

await test('history panel Verify and Restore-from carry the row snapshot identity', () => {
  const t = fixture();
  t.actions['backup-history-item']({ dataset: { id: 'BKP-2042' } });
  const panel = t.effects.panels.at(-1);
  assert.equal(panel.subtitle, 'Sunday · 3:00 AM');
  assert.ok(panel.body.includes('data-action="pm51-backup-verify-selected"') && panel.body.includes('data-id="BKP-2042"'));
  assert.ok(panel.body.includes('data-action="pm51-backup-restore-from"') && panel.body.includes('data-id="BKP-2042"'));
  t.actions['backup-verify-selected']({ dataset: { id: 'BKP-2042' } });
  assert.ok(t.effects.checks.at(-1).title.includes('Sunday · 3:00 AM'));
  t.actions['backup-restore-from']({ dataset: { id: 'BKP-2042' } });
  assert.equal(t.state.pm51.backupRestore.whichId, 'BKP-2042');
  assert.ok(t.render('restore').includes('Whole workspace from Sunday · 3:00 AM'));
  t.hist().unshift({ time: 'Tomorrow · 1:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.6 GB', result: 'Verified', receipt: 'BKP-2050' });
  assert.ok(t.render('restore').includes('Whole workspace from Sunday · 3:00 AM'), 'restore-from choice survives a newer backup');
  const panels = t.effects.panels.length;
  t.actions['backup-history-item']({ dataset: { id: 'BKP-9999' } });
  assert.equal(t.effects.panels.length, panels, 'unknown history id opens no panel');
  assert.ok(t.effects.toasts.at(-1).title.includes('not available'));
});

await test('Verify latest backup stays an explicit, separate latest-targeted action', () => {
  const t = fixture();
  const backupHtml = t.render('backup');
  assert.ok(backupHtml.includes('Verify latest backup') && backupHtml.includes('data-action="pm51-backup-verify"'));
  assert.ok(!backupHtml.includes('pm51-backup-verify-selected'));
  t.actions['backup-verify']({ dataset: {} });
  const check = t.effects.checks.at(-1);
  assert.equal(check.title, 'Verify latest backup');
  assert.ok(JSON.stringify(check).includes('Today · 2:00 AM'), 'latest verify targets the newest backup');
});

await test('legacy saved numeric offset migrates once to stable identity', () => {
  const t = fixture();
  t.state.pm51.backupRestore = { what: 'Whole workspace', which: 2, where: 'In place' };
  assert.ok(t.render('restore').includes('Whole workspace from Sunday · 3:00 AM'));
  assert.equal(t.state.pm51.backupRestore.whichId, 'BKP-2042');
  const t2 = fixture();
  t2.state.pm51.backupRestore = { what: 'Whole workspace', which: 9, where: 'In place' };
  const unavailable = t2.render('restore');
  assert.equal(t2.state.pm51.backupRestore.whichId, 'unavailable:legacy-index:9');
  assert.ok(unavailable.includes('Selected backup no longer listed'), 'an invalid saved offset cannot silently select newest');
});

await test('fresh state defaults to latest at first view, then holds that identity across refresh', () => {
  const t = fixture();
  assert.ok(t.render('restore').includes('Whole workspace from Today · 2:00 AM'));
  t.hist().unshift({ time: 'Tomorrow · 1:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.6 GB', result: 'Verified', receipt: 'BKP-2049' });
  assert.ok(t.render('restore').includes('Whole workspace from Today · 2:00 AM'), 'the defaulted recovery point keeps its identity; never silently retargets to newest');
  t.changes['backup-restore-which']({ dataset: {}, value: 'BKP-2047' });
  t.hist().unshift({ time: 'Later · 4:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.7 GB', result: 'Verified', receipt: 'BKP-2051' });
  assert.ok(t.render('restore').includes('Whole workspace from Yesterday · 2:00 AM'), 'after an explicit choice the pin holds');
});

await test('entries without an owner identity are unavailable, even if presentation fields match', () => {
  const t = fixture({ history: [
    { time: 'Today · 2:00 AM', type: 'Incremental', destination: 'TrueNAS backup', size: '182 MB', result: 'Verified' },
    { time: 'Yesterday · 2:00 AM', type: 'Incremental', destination: 'TrueNAS backup', size: '96 MB', result: 'Verified' }
  ] });
  t.changes['backup-restore-which']({ dataset: {}, value: 'Yesterday · 2:00 AM | Incremental | TrueNAS backup' });
  t.hist().unshift({ time: 'Tomorrow · 1:00 AM', type: 'Full', destination: 'TrueNAS backup', size: '2.6 GB', result: 'Verified' });
  assert.ok(t.render('restore').includes('Selected backup no longer listed'));
  t.actions['backup-verify-selected']({ dataset: {} });
  assert.equal(t.effects.checks.length, 0, 'an unidentified recovery point cannot be verified');
});

console.log(JSON.stringify({
  scope: 'authored backup manager handlers with stubbed PM51; no browser, storage, provider, or native claim',
  file: 'Concepts/pm7-tools/settings_refresh/managers/54-backup.js',
  passed
}));
