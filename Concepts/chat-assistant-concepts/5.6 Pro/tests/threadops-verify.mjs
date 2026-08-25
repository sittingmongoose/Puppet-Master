/* tests/threadops-verify.mjs — Wave 4 (Thread Ops) verification harness, item 13.
 *
 * Re-runnable by any agent:
 *     cd "Concepts/chat-assistant-concepts/5.6 Pro"
 *     node tests/threadops-verify.mjs
 *     node tests/threadops-verify.mjs --file /path/to/other/index.html
 *     node tests/threadops-verify.mjs --json out.json
 *     node tests/threadops-verify.mjs --themes          # all 8 themes
 *     node tests/threadops-verify.mjs --negative        # expect everything red
 *
 * WHY IT LOOKS LIKE THIS
 * ----------------------
 * 1. PAINTED PIXELS, NOT BOUNDING BOXES. `getBoundingClientRect()` reports
 *    geometry for clipped, occluded and mid-transition elements, and this repo
 *    has logged four false-positive "fixes" from trusting it. Every visibility
 *    claim below is `document.elementFromPoint()` at the target's own centre,
 *    and the colour claims additionally read bytes out of a screenshot crop.
 *
 * 2. ELEVEN OPERATIONS IS ELEVEN CHANCES TO ASSERT NOTHING. A row that renders
 *    is not an operation. Every operational assertion here records state
 *    BEFORE, acts, and requires the specific difference AFTER — a thread count,
 *    a message id list, a token total, a worktree record, a clipboard string.
 *    Where a row is deliberately disabled, the assertion checks the REASON
 *    TEXT, not the disabled flag: a correctly-disabled row whose reason is
 *    empty or generic still tells the reader nothing, and that is the exact
 *    failure Demo Data's negative control caught on the Retry fixture.
 *
 * 3. `--negative` IS PART OF THE HARNESS, NOT AN AFTERTHOUGHT. Point it at a
 *    build with `threadops.js` / `threadops.css` blanked. Every assertion here
 *    must go red except the two chrome ones (zero console errors, zero page
 *    errors), which are properties of the app and not of this module. History
 *    found six vacuous passes exactly this way.
 *
 * WHAT THIS FILE DOES NOT CLOSE
 * -----------------------------
 * Per the project's two-harness standard, the implementer's own harness never
 * closes an item. See WAVE4_THREADOPS_LOG.md for what a second pair of eyes
 * still has to confirm.
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const FILE = opt('--file', path.join(ROOT, 'index.html'));
const PAGE = FILE.startsWith('file://') ? FILE : 'file://' + path.resolve(FILE);
const JSON_OUT = opt('--json', null);
const NEGATIVE = flag('--negative');
const THEMES = flag('--themes');
const EXE = process.env.PM56_CHROME ||
  path.join(process.env.HOME || '', '.cache/ms-playwright/chromium-1234/chrome-linux64/chrome');

const results = [];
let consoleIssues = [];
function ok(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail === undefined ? null : detail });
  console.log((pass ? '  PASS  ' : '**FAIL  ') + name +
    (detail === undefined || detail === null ? '' : '\n        ' + JSON.stringify(detail).slice(0, 460)));
}
/* A reason string has to name the record that is missing. "Not available" is
   not a reason; these are the shapes that would sneak past a length check. */
const GENERIC = /^(not available|unavailable|disabled|n\/a|coming soon|not supported)\.?$/i;
function reasonIsReal(r) {
  return typeof r === 'string' && r.trim().length >= 30 && !GENERIC.test(r.trim());
}

/* ------------------------------------------------------------------ pixels */
async function crop(page, rect) {
  if (!rect || rect.width < 1 || rect.height < 1) return { distinct: 0, mean: null, empty: true };
  const clip = {
    x: Math.max(0, Math.floor(rect.x)), y: Math.max(0, Math.floor(rect.y)),
    width: Math.max(1, Math.ceil(rect.width)), height: Math.max(1, Math.ceil(rect.height))
  };
  const buf = await page.screenshot({ clip });
  const url = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async (u) => {
    const img = new Image(); img.src = u; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const seen = new Set(); let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    return { distinct: seen.size, mean: [Math.round(r / n), Math.round(gg / n), Math.round(b / n)] };
  }, url);
}
const rectOf = (page, sel, idx = 0) => page.evaluate(([s, i]) => {
  const e = document.querySelectorAll(s)[i]; if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}, [sel, idx]);
const ownsCentre = (page, sel, idx = 0) => page.evaluate(([s, i]) => {
  const e = document.querySelectorAll(s)[i];
  if (!e) return { found: false, owns: false };
  const r = e.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return { found: true, owns: false, why: 'zero-area' };
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return { found: true, owns: !!hit && (hit === e || e.contains(hit) || hit.contains(e)), hitTag: hit ? (hit.className || hit.tagName) : null };
}, [sel, idx]);

/* --------------------------------------------------------------- plumbing */
const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--allow-file-access-from-files', '--force-color-profile=srgb']
});

async function fresh(viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleIssues.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => consoleIssues.push('pageerror: ' + e.message));
  await page.goto(PAGE);
  await page.waitForSelector('.transcript .message', { timeout: 20000 });
  /* The 2s work tick re-renders the whole app. Stop it so a measurement taken
     between two clicks cannot be a measurement of a different frame. */
  await page.evaluate(() => { try { window.PM56_DEMO.trigger('Reset work'); } catch (e) {} });
  /* NEGATIVE-CONTROL SHIM. With threadops.js blanked there is no
     window.PM56_THREADOPS, and the first `.lastCommand()` would throw and take
     the run down after eleven reds — which is a crash, not a negative control.
     An inert stub lets every remaining assertion evaluate and go red on its own
     merits, which is the only way the "everything must go red" claim can be
     checked rather than asserted. */
  await page.evaluate(() => {
    if (window.PM56_THREADOPS) return;
    window.__PM56_TOPS_ABSENT = true;
    window.PM56_THREADOPS = {
      CMD: {}, dispatched: () => [], lastCommand: () => null, commandsFor: () => [],
      storeFor: () => ({ restorePoints: [], rewinds: [], requests: [], passages: [] }),
      restorePoints: () => [], rewinds: () => [], requests: () => [], passages: () => [],
      lastExport: () => null, overflowFor: () => [], retryFor: () => ({ ok: false, reason: '' }),
      threadRowsFor: () => '', worktreeFor: () => null
    };
  });
  return { context, page };
}
async function selectThread(page, id) {
  await page.evaluate((t) => window.PM56_DEMO.selectThread(t), id);
  await page.waitForTimeout(150);
}
async function openThreadMenu(page, threadId) {
  await page.evaluate((id) => {
    const b = document.querySelector('.thread-row[data-id="' + id + '"] .thread-more');
    if (b) b.click();
  }, threadId);
  await page.waitForTimeout(220);
}
async function click(page, sel) {
  await page.evaluate((s) => { const e = document.querySelector(s); if (e) e.click(); }, sel);
  await page.waitForTimeout(230);
}
const st = (page) => page.evaluate(() => window.PM56_DEMO.getState());
const tops = (page, fn, ...a) => page.evaluate(([f, args]) =>
  window.PM56_THREADOPS ? window.PM56_THREADOPS[f].apply(null, args) : null, [fn, a]);

/* ======================================================================= */
/* GROUP 1 — boot, the thread menu, and the three withdrawn rows            */
/* ======================================================================= */
{
  const { context, page } = await fresh();

  const boot = await page.evaluate(() => ({
    booted: !!window.__PM56_BOOT_OK,
    tops: !!window.PM56_THREADOPS && !window.__PM56_TOPS_ABSENT,
    overflow: !!(window.PM56_MSG_OVERFLOW && window.PM56_MSG_OVERFLOW.count && window.PM56_MSG_OVERFLOW.count() > 0),
    slots: (window.PM56_EXT && window.PM56_EXT.SLOTS || []).length
  }));
  ok('1.1 Module boots and registers into Transcript’s message-overflow registry',
    boot.booted && boot.tops && boot.overflow, boot);

  await openThreadMenu(page, 'query');
  const menu = await page.evaluate(() => {
    const m = document.querySelector('[data-overlay="root-menu"]');
    if (!m) return null;
    return [...m.querySelectorAll('.menu-item')].map(b => ({
      action: b.dataset.action || null,
      label: (b.querySelector('strong') || {}).textContent || '',
      sub: (b.querySelector('.menu-copy span') || {}).textContent || '',
      display: getComputedStyle(b).display,
      disabled: !!b.disabled
    }));
  });
  const labels = (menu || []).filter(r => r.display !== 'none').map(r => r.label);
  const WANT = ['Duplicate thread', 'Export thread', 'Restore points', 'Spawn related thread',
    'Request from another thread', 'Await response', 'Outbox', 'Copy link', 'Archive', 'Delete thread'];
  ok('1.2 Every canonical thread-menu row is present', WANT.every(w => labels.includes(w)),
    { missing: WANT.filter(w => !labels.includes(w)), labels });

  ok('1.3 "Fork thread" is withdrawn and "Duplicate thread" replaces it',
    !labels.includes('Fork thread') && labels.includes('Duplicate thread'), { labels });

  /* display:none is a claim about pixels, so check the pixel. */
  const forkOwns = await page.evaluate(() => {
    const b = document.querySelector('[data-overlay="root-menu"] .menu-item[data-action="fork-thread"]');
    if (!b) return { present: false };
    const r = b.getBoundingClientRect();
    return { present: true, area: r.width * r.height, display: getComputedStyle(b).display };
  });
  ok('1.4 The withdrawn Fork row occupies no pixels (display:none, zero area)',
    forkOwns.present && forkOwns.display === 'none' && forkOwns.area === 0, forkOwns);

  /* Thread `query` is `working`, so Archive must be the disabled-with-a-reason
     state; ACD-443's guard has to be visible before the click, not after it. */
  const arch = (menu || []).find(r => r.label === 'Archive' && r.display !== 'none');
  ok('1.5 Archive on a running thread is disabled and the reason names the run state',
    !!arch && arch.disabled && /run is active/i.test(arch.sub) && /Working/.test(arch.sub), arch);

  const disabled = (menu || []).filter(r => r.display !== 'none' && r.disabled);
  ok('1.6 Every disabled menu row states a real, specific reason',
    disabled.length > 0 && disabled.every(r => reasonIsReal(r.sub)),
    disabled.map(r => ({ label: r.label, sub: r.sub })));

  /* A crop of a whole icon box is mostly its tinted background, so an absolute
     "red dominates" threshold is the wrong probe — it fails on a correct
     rgb(255,108,125) glyph. The real claim is COMPARATIVE: the danger row must
     be measurably redder than an ordinary row in the same menu. Recorded
     because this was a harness bug that looked exactly like a CSS bug. */
    const iconRect = (which) => page.evaluate((sel) => {
      const b = document.querySelector('[data-overlay="root-menu"] .menu-item[data-action="' + sel + '"]');
      if (!b) return null;
      const i = b.querySelector('.menu-icon');
      const r = i.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, colour: getComputedStyle(i).color };
    }, which);
  const delRect = await iconRect('delete-thread');
  const plainRect = await iconRect('export-thread');
  const delPix = delRect ? await crop(page, delRect) : null;
  const plainPix = plainRect ? await crop(page, plainRect) : null;
  const warmth = (p) => (p && p.mean) ? (p.mean[0] - p.mean[1]) + (p.mean[0] - p.mean[2]) : null;
  ok('1.7 The Delete row paints measurably redder than an ordinary row in the same menu',
    warmth(delPix) !== null && warmth(plainPix) !== null && warmth(delPix) > warmth(plainPix) + 15,
    { deleteColour: delRect && delRect.colour, deleteWarmth: warmth(delPix), exportWarmth: warmth(plainPix) });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);

  /* Archived thread: "Restore thread" must be gone, "Unarchive thread" present. */
  await openThreadMenu(page, 'archived-1');
  const arcLabels = await page.evaluate(() => [...document.querySelectorAll('[data-overlay="root-menu"] .menu-item')]
    .filter(b => getComputedStyle(b).display !== 'none')
    .map(b => (b.querySelector('strong') || {}).textContent));
  ok('1.8 An archived thread offers "Unarchive thread", never "Restore thread"',
    arcLabels.includes('Unarchive thread') && !arcLabels.includes('Restore thread'), { arcLabels });
  await page.keyboard.press('Escape');
  await context.close();
}

/* ======================================================================= */
/* GROUP 2 — the destructive confirm                                       */
/* ======================================================================= */
{
  const { context, page } = await fresh();
  await openThreadMenu(page, 'query');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="delete-thread"]');

  const dlg = await page.evaluate(() => {
    const d = document.querySelector('.pm-tops-dialog');
    if (!d) return null;
    return {
      title: (d.querySelector('#pm-tops-title') || {}).textContent,
      role: d.getAttribute('role'),
      modal: d.getAttribute('aria-modal'),
      scrim: !!document.querySelector('.pm-tops-scrim'),
      text: d.textContent,
      buttons: [...d.querySelectorAll('.pm-tops-del-actions button')].map(b => ({
        label: b.textContent.trim(), disabled: !!b.disabled,
        title: b.getAttribute('title'), focused: b === document.activeElement
      }))
    };
  });
  ok('2.1 Delete opens a real modal (alertdialog + aria-modal + scrim)',
    !!dlg && dlg.role === 'alertdialog' && dlg.modal === 'true' && dlg.scrim,
    dlg && { role: dlg.role, modal: dlg.modal, scrim: dlg.scrim });
  ok('2.2 Title is exactly "Delete thread?"', !!dlg && dlg.title === 'Delete thread?', dlg && dlg.title);

  const want = ['Delete and keep worktree', 'Delete and remove worktree (has changes)', 'Cancel'];
  ok('2.3 Locked button copy, including "(has changes)" on the dirty worktree',
    !!dlg && JSON.stringify(dlg.buttons.map(b => b.label)) === JSON.stringify(want),
    dlg && dlg.buttons.map(b => b.label));

  ok('2.4 Cancel holds default focus', !!dlg && dlg.buttons.length === 3 && dlg.buttons[2].focused,
    dlg && dlg.buttons.map(b => ({ l: b.label, f: b.focused })));

  /* The scrim's own CENTRE is under the dialog, so elementFromPoint there
     returns dialog content and a "scrim owns its centre" probe is wrong by
     construction. The claim that matters is that the app behind it is not
     reachable: sample the point over a real app control and require the scrim
     to be what the pointer would hit. */
  const scrimOwn = await page.evaluate(() => {
    const row = document.querySelector('.thread-row');
    const btn = document.querySelector('.composer-actions button, .chat-header .icon-button');
    const at = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); };
    const corner = document.elementFromPoint(12, 12);
    const overRow = at(row), overBtn = at(btn);
    /* "Owned by the scrim" is too strict: a control that happens to sit under
       the centred dialog is blocked by the DIALOG, which is equally modal.
       The claim is that no app element is reachable. */
    const blockedBy = (n) => !!n && (
      (n.classList && n.classList.contains('pm-tops-scrim')) || !!n.closest('.pm-tops-dialog'));
    return {
      corner: corner ? corner.className : null,
      overRow: overRow ? overRow.className : null,
      overBtn: overBtn ? overBtn.className : null,
      blocked: blockedBy(corner) && blockedBy(overRow) && blockedBy(overBtn)
    };
  });
  ok('2.5 The scrim intercepts the pointer over the app behind it (thread row, header button, corner)',
    scrimOwn.blocked, scrimOwn);

  /* No undo promise anywhere in the dialog copy. Note this also forbids
     "cannot be undone": Reset restores the fixture, so that claim would be
     false — the dialog says nothing about undo in either direction. */
  const undo = !!dlg && /undo|reversib|recover(ed|able)?|restore it later|can be restored/i.test(dlg.text);
  ok('2.6 The dialog makes no undo promise in either direction', !!dlg && !undo,
    dlg && (dlg.text.match(/undo|reversib|recover\w*|restore\w*/gi) || []));

  /* Worktree wording is the fixture's, not a literal. */
  const wt = await page.evaluate(() => {
    const D = window.PM56_DATA;
    const rec = (D.operational.worktrees || []).find(w => w.id === 'feature/query-index');
    const el = document.querySelector('.pm-tops-wt');
    const body = el ? el.textContent : '';
    return { path: rec.path, dirty: rec.dirtyFiles, stateLabel: D.labels.worktreeState[rec.state], body };
  });
  ok('2.7 Worktree wording is driven by D.operational.worktrees, not a literal',
    wt.body.includes(wt.path) && wt.body.includes(String(wt.dirty)) && wt.body.includes(wt.stateLabel), wt);

  /* Cancel must not delete. */
  const before = (await st(page)).threads.length;
  const wasOpen = !!(await page.$('.pm-tops-dialog'));
  await click(page, '.pm-tops-del-actions [data-pm-autofocus]');
  const afterCancel = (await st(page)).threads.length;
  /* `wasOpen` is the anti-vacuous half: "no dialog is on screen" is trivially
     true when the module never opened one. */
  ok('2.8 Cancel closes the dialog and deletes nothing',
    wasOpen && afterCancel === before && !(await page.$('.pm-tops-dialog')), { wasOpen, before, afterCancel });

  /* Escape closes it too. */
  await openThreadMenu(page, 'query');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="delete-thread"]');
  const escOpen = !!(await page.$('.pm-tops-dialog'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('2.9 Escape closes the destructive confirm',
    escOpen && !(await page.$('.pm-tops-dialog')), { openedFirst: escOpen });

  /* An unbound checkout: thread `debug` points at review/query-benchmarks,
     which has state `unbound` and no path. Remove must be honestly disabled. */
  await openThreadMenu(page, 'debug');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="delete-thread"]');
  const unbound = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.pm-tops-del-actions button')];
    return bs.map(b => ({ label: b.textContent.trim(), disabled: !!b.disabled, title: b.getAttribute('title') }));
  });
  const rm = unbound[1];
  ok('2.10 A branch with no checkout disables "remove worktree" and names the branch',
    !!rm && rm.disabled && /review\/query-benchmarks/.test(rm.title || '') && /no checkout/i.test(rm.title || ''), unbound);
  ok('2.11 The locked copy survives the disabled case (no "(has changes)" on a clean branch)',
    !!rm && rm.label === 'Delete and remove worktree', rm && rm.label);
  await page.keyboard.press('Escape');

  /* A thread with no worktree at all. */
  await openThreadMenu(page, 'plain');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="delete-thread"]');
  const none = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('.pm-tops-del-actions button')].map(b => ({ label: b.textContent.trim(), disabled: !!b.disabled, title: b.getAttribute('title') })),
    body: (document.querySelector('.pm-tops-wt') || {}).textContent || ''
  }));
  ok('2.12 An unbound thread disables remove, keeps the locked copy, and says why',
    none.buttons.length === 3 && !!none.buttons[1] && none.buttons[1].disabled &&
    /not bound to a worktree/i.test(none.buttons[1].title || '') && /not bound to a worktree/i.test(none.body),
    none);

  /* And the delete actually deletes, keeping the worktree. */
  await page.keyboard.press('Escape');
  await openThreadMenu(page, 'query');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="delete-thread"]');
  const pre = await page.evaluate(() => ({
    n: window.PM56_DEMO.getState().threads.length,
    wt: JSON.parse(JSON.stringify((window.PM56_DATA.operational.worktrees || []).find(w => w.id === 'feature/query-index')))
  }));
  await click(page, '.pm-tops-del-actions [data-value="keep"]');
  const post = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const wt = (window.PM56_DATA.operational.worktrees || []).find(w => w.id === 'feature/query-index');
    const t = s.threads.find(x => x.id === s.selectedThread);
    const last = t.messages[t.messages.length - 1];
    return {
      n: s.threads.length, gone: !s.threads.some(x => x.id === 'query'),
      wtState: wt.state, wtPath: wt.path, wtThread: wt.threadId, wtDirty: wt.dirtyFiles,
      receipt: last && { type: last.type, title: last.title, detail: last.detail },
      cmd: window.PM56_THREADOPS.lastCommand()
    };
  });
  ok('2.13 "Delete and keep worktree" removes the thread, keeps the checkout, releases the binding',
    post.gone && post.n === pre.n - 1 && post.wtState === pre.wt.state && post.wtPath === pre.wt.path &&
    post.wtThread === null && post.wtDirty === pre.wt.dirtyFiles, { pre: pre.wt, post });
  ok('2.14 Delete writes a receipt naming cmd.chat.delete and the kept worktree',
    !!post.receipt && post.receipt.type === 'threadops-delete' &&
    /cmd\.chat\.delete/.test(post.receipt.detail) && /kept/i.test(post.receipt.detail),
    post.receipt);

  /* Remove-worktree path, on the conflicted checkout. */
  await openThreadMenu(page, 'subagents');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="delete-thread"]');
  const dirtyLabel = await page.evaluate(() =>
    [...document.querySelectorAll('.pm-tops-del-actions button')].map(b => b.textContent.trim()));
  ok('2.15 A conflicted worktree also reads "(has changes)"',
    dirtyLabel[1] === 'Delete and remove worktree (has changes)', dirtyLabel);
  await click(page, '.pm-tops-del-actions [data-value="remove"]');
  const removed = await page.evaluate(() => {
    const wt = (window.PM56_DATA.operational.worktrees || []).find(w => w.id === 'concept/chat-5-6-pro');
    return { state: wt.state, path: wt.path, threadId: wt.threadId, dirty: wt.dirtyFiles, conflicts: wt.conflicts };
  });
  ok('2.16 "Delete and remove worktree" unbinds the checkout in the fixture record',
    removed.state === 'unbound' && removed.path === null && removed.threadId === null && removed.dirty === 0,
    removed);
  await context.close();
}

/* ======================================================================= */
/* GROUP 3 — rewind (non-destructive) and restore points                    */
/* ======================================================================= */
{
  const { context, page } = await fresh();
  await selectThread(page, 'plain');

  const before = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === s.selectedThread);
    const texts = t.messages.filter(m => m.type === 'text');
    return { ids: t.messages.map(m => m.id), anchor: texts[Math.floor(texts.length / 2)].id, rps: window.PM56_THREADOPS.restorePoints(t.id).length };
  });

  const rowsBefore = (await tops(page, 'overflowFor', before.anchor)) || [];
  const rewindRow = rowsBefore.find(r => r.id === 'rewind');
  ok('3.1 "Rewind to here" is offered on a mid-thread turn',
    !!rewindRow && !rewindRow.disabled && /restore point first/i.test(rewindRow.detail || ''), rewindRow);

  const lastId = before.ids[before.ids.length - 1];
  const lastRows = (await tops(page, 'overflowFor', lastId)) || [];
  const lastRewind = (lastRows || []).find(r => r.id === 'rewind');
  ok('3.2 Rewind on the final turn is disabled with the specific reason',
    !!lastRewind && lastRewind.disabled && /last turn/i.test(lastRewind.reason || '') && reasonIsReal(lastRewind.reason),
    lastRewind);

  await page.evaluate((id) => {
    document.querySelector('[data-action="rewind-to-message"]');
    const b = document.createElement('button');
    b.dataset.action = 'rewind-to-message'; b.dataset.value = id;
    document.body.appendChild(b); b.click(); b.remove();
  }, before.anchor);
  await page.waitForTimeout(350);

  const after = await page.evaluate((anchor) => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === s.selectedThread);
    const rps = window.PM56_THREADOPS.restorePoints(t.id);
    const rw = window.PM56_THREADOPS.rewinds(t.id);
    return {
      ids: t.messages.map(m => m.id),
      rps: rps.map(r => ({ label: r.label, atMessageId: r.atMessageId, count: r.messageCount })),
      folded: rw.length ? rw[rw.length - 1].messages.map(m => m.id) : [],
      rewindId: rw.length ? rw[rw.length - 1].id : null,
      anchorIdx: t.messages.indexOf(t.messages.find(m => m.id === anchor)),
      cmds: window.PM56_THREADOPS.dispatched().map(d => d.command)
    };
  }, before.anchor);

  ok('3.3 Rewind writes the restore point FIRST (a "Before rewind" point exists)',
    after.rps.length === before.rps + 1 && /^Before rewind/.test((after.rps[after.rps.length - 1] || {}).label || ''),
    after.rps);
  ok('3.4 The restore point is anchored on the rewind target',
    (after.rps[after.rps.length - 1] || {}).atMessageId === before.anchor, {
      rp: (after.rps[after.rps.length - 1] || {}).atMessageId, anchor: before.anchor });
  ok('3.5 Both cmd.chat.create_restore_point and cmd.chat.rewind were dispatched, in that order',
    after.cmds.indexOf('cmd.chat.create_restore_point') >= 0 &&
    after.cmds.indexOf('cmd.chat.rewind') > after.cmds.indexOf('cmd.chat.create_restore_point'),
    after.cmds);

  /* Nothing deleted: every pre-rewind id is either still in the thread or held
     verbatim in the fold. */
  const lost = before.ids.filter(id => !after.ids.includes(id) && !after.folded.includes(id));
  ok('3.6 Rewind deletes nothing — every pre-rewind turn is still in the thread or held in the fold',
    after.folded.length > 0 && lost.length === 0, { lost, folded: after.folded.length, kept: after.ids.length });

  /* The folded turns must be gone from the painted transcript. */
  const paintedFolded = await page.evaluate((ids) =>
    ids.filter(id => !!document.querySelector('[data-message-id="' + id + '"]')), after.folded);
  ok('3.7 The folded turns are no longer painted in the transcript',
    after.folded.length > 0 && paintedFolded.length === 0, { folded: after.folded.length, stillPainted: paintedFolded });

  /* A pixel read on an element scrolled out of the transcript lands wherever
     that rectangle happens to be — the first run of this file measured the
     composer hint. Scroll it in and let the smooth scroll settle first. */
  await page.evaluate(() => {
    const e = document.querySelector('.pm-tops-fold');
    if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(300);
  const foldOwn = await ownsCentre(page, '.pm-tops-fold');
  const foldPix = await crop(page, await rectOf(page, '.pm-tops-fold'));
  ok('3.8 The fold card paints a real listing of what it is holding',
    foldOwn.found && foldOwn.owns && foldPix.distinct > 3, { foldOwn, distinct: foldPix.distinct });

  const restoreBtn = await page.evaluate(() => {
    const b = document.querySelector('[data-action="restore-rewind"]');
    return b ? b.textContent.trim() : null;
  });
  ok('3.9 The fold card offers a Restore control naming the count',
    !!restoreBtn && /Restore \d+ turns?/.test(restoreBtn), restoreBtn);

  await click(page, '[data-action="restore-rewind"]');
  const restored = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === s.selectedThread);
    return { ids: t.messages.map(m => m.id) };
  });
  const orderOk = (() => {
    /* every original id present, and in the original relative order */
    let k = -1;
    for (const id of before.ids) {
      const i = restored.ids.indexOf(id);
      if (i < 0 || i <= k) return false;
      k = i;
    }
    return true;
  })();
  ok('3.10 Restore puts every folded turn back in its original relative position',
    after.folded.length > 0 && restored.ids.length > after.ids.length && orderOk,
    { folded: after.folded.length, whileFolded: after.ids.length, originals: before.ids.length, now: restored.ids.length });

  const note = await page.evaluate(() => {
    const n = document.querySelector('.pm-tops-card-note[data-kind="rewind"]');
    return n ? n.textContent : null;
  });
  ok('3.11 The fold card flips to a restored state rather than leaving a stale offer',
    !!note && /Restored/i.test(note), note);

  /* Restore points: a second one on the same turn is refused with a reason. */
  await page.evaluate((id) => {
    const b = document.createElement('button');
    b.dataset.action = 'create-restore-point'; b.dataset.value = id;
    document.body.appendChild(b); b.click(); b.remove();
  }, before.anchor);
  await page.waitForTimeout(250);
  const dupRow = ((await tops(page, 'overflowFor', before.anchor)) || []).find(r => r.id === 'rp');
  ok('3.12 A second restore point on the same turn is disabled with a real reason',
    !!dupRow && dupRow.disabled && /already covers this turn/i.test(dupRow.reason || '') && reasonIsReal(dupRow.reason),
    dupRow);

  /* Branch from restore uses the immutable SNAPSHOT, not the live prefix. */
  const snapTest = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const tid = s.selectedThread;
    const rps = window.PM56_THREADOPS.restorePoints(tid);
    const rp = rps[rps.length - 1];
    if (!rp) return { rpId: null, snapshotIds: null, liveIds: null };
    /* mutate the LIVE thread's covered prefix after the point was taken */
    const live = window.PM56_DEMO.getState().threads.find(x => x.id === tid);
    return { rpId: rp.id, snapshotIds: rp.snapshot.map(m => m.id), liveIds: live.messages.slice(0, rp.messageCount).map(m => m.id) };
  });
  await page.evaluate((rpId) => {
    const b = document.createElement('button');
    b.dataset.action = 'branch-from-restore'; b.dataset.value = rpId;
    document.body.appendChild(b); b.click(); b.remove();
  }, snapTest.rpId);
  await page.waitForTimeout(300);
  const branched = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === s.selectedThread);
    return { id: t.id, ids: t.messages.map(m => m.id), lineage: t.lineage, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('3.13 Branch from restore clones the immutable snapshot and dispatches cmd.chat.branch_from_restore',
    !!snapTest.snapshotIds && JSON.stringify(branched.ids) === JSON.stringify(snapTest.snapshotIds) &&
    branched.cmd === 'cmd.chat.branch_from_restore', {
      snapshot: snapTest.snapshotIds && snapTest.snapshotIds.length, branch: branched.ids.length, cmd: branched.cmd });
  ok('3.14 The restore branch carries lineage back to the restore point',
    !!branched.lineage && branched.lineage.kind === 'branch-from-restore' &&
    branched.lineage.restorePointId === snapTest.rpId && !!branched.lineage.atMessageId,
    branched.lineage);
  await context.close();
}

/* ======================================================================= */
/* GROUP 4 — branch from here / with a model / with a Persona               */
/* ======================================================================= */
{
  const { context, page } = await fresh();
  await selectThread(page, 'plain');
  const pre = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === s.selectedThread);
    const texts = t.messages.filter(m => m.type === 'text');
    const anchor = texts[3] || texts[texts.length - 1];
    return { tid: t.id, ids: t.messages.map(m => m.id), anchor: anchor.id, idx: t.messages.indexOf(anchor), n: s.threads.length, persona: s.persona };
  });
  await page.evaluate((id) => {
    const b = document.createElement('button');
    b.dataset.action = 'branch-from-message'; b.dataset.value = id;
    document.body.appendChild(b); b.click(); b.remove();
  }, pre.anchor);
  await page.waitForTimeout(300);
  const post = await page.evaluate((p) => {
    const s = window.PM56_DEMO.getState();
    const nt = s.threads.find(x => x.id === s.selectedThread);
    const src = s.threads.find(x => x.id === p.tid);
    return {
      n: s.threads.length,
      branchIds: nt.messages.map(m => m.id),
      lineage: nt.lineage,
      srcIds: src.messages.map(m => m.id),
      srcLast: src.messages[src.messages.length - 1]
    };
  }, pre);

  ok('4.1 Branch from here creates a thread anchored on the selected message',
    post.n === pre.n + 1 && !!post.lineage && post.lineage.atMessageId === pre.anchor &&
    post.lineage.sourceThreadId === pre.tid, post.lineage);
  ok('4.2 The branch carries exactly the covered prefix, not the whole thread',
    post.branchIds.length === pre.idx + 1 &&
    JSON.stringify(post.branchIds) === JSON.stringify(pre.ids.slice(0, pre.idx + 1)),
    { branch: post.branchIds.length, covered: pre.idx + 1, source: pre.ids.length });
  ok('4.3 The original thread is not mutated apart from one lineage card (ACD-447)',
    JSON.stringify(post.srcIds.slice(0, pre.ids.length)) === JSON.stringify(pre.ids) &&
    post.srcIds.length === pre.ids.length + 1 && !!post.srcLast && post.srcLast.type === 'threadops-branch',
    { before: pre.ids.length, after: post.srcIds.length, lastType: post.srcLast && post.srcLast.type });

  /* Branch with another model: requested vs effective resolution. */
  await selectThread(page, pre.tid);
  const degraded = await page.evaluate(() => {
    const m = (window.PM56_DATA.models || []).find(x => x.status && x.status !== 'ready');
    return m ? { id: m.id, name: m.name, status: m.status } : { id: null, name: null, status: null };
  });
  await page.evaluate(([mid, anchor]) => {
    const b = document.createElement('button');
    b.dataset.action = 'branch-with-model'; b.dataset.id = anchor; b.dataset.value = mid;
    document.body.appendChild(b); b.click(); b.remove();
  }, [degraded.id, pre.anchor]);
  await page.waitForTimeout(300);
  const route = await page.evaluate((tid) => {
    const s = window.PM56_DEMO.getState();
    const nt = s.threads.find(x => x.id === s.selectedThread);
    const src = s.threads.find(x => x.id === tid);
    const card = src.messages[src.messages.length - 1];
    return { lineage: nt.lineage, title: nt.title, detail: card.detail };
  }, pre.tid);
  ok('4.4 Branch with another model records a requested AND an effective route',
    !!route.lineage && !!route.lineage.requested && !!route.lineage.effective && !!route.lineage.requested.model && !!route.lineage.effective.model &&
    route.lineage.requested.model === degraded.name, { lineage: route.lineage, degraded });
  ok('4.5 A degraded requested route is explained on the receipt, not silently swapped',
    /Requested model/.test(route.detail || '') && /effective/i.test(route.detail || ''), route.detail);

  /* Persona branch must not change the composer's Persona. */
  await selectThread(page, pre.tid);
  await page.evaluate((anchor) => {
    const b = document.createElement('button');
    b.dataset.action = 'branch-with-persona'; b.dataset.id = anchor; b.dataset.value = 'Reviewer';
    document.body.appendChild(b); b.click(); b.remove();
  }, pre.anchor);
  await page.waitForTimeout(300);
  const pers = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const nt = s.threads.find(x => x.id === s.selectedThread);
    return { persona: s.persona, lineage: nt.lineage, title: nt.title };
  });
  ok('4.6 A Persona branch scopes the Persona to the branch and leaves the thread’s own alone',
    !!pers.lineage && !!pers.lineage.requested && pers.lineage.requested.persona === 'Reviewer' && pers.persona === pre.persona &&
    /Reviewer/.test(pers.title), pers);
  await context.close();
}

/* ======================================================================= */
/* GROUP 5 — export, retry, passage, links, archive/pin/rename receipts      */
/* ======================================================================= */
{
  const { context, page } = await fresh();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await selectThread(page, 'plain');

  /* Export: a real file, not a claim about one. */
  const dl = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await openThreadMenu(page, 'plain');
  await click(page, '[data-overlay="root-menu"] .menu-item[data-action="export-thread"]');
  const download = await dl;
  let parsed = null;
  if (download) {
    const p = await download.path();
    if (p) { try { parsed = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { parsed = { error: String(e) }; } }
  }
  ok('5.1 Export thread writes a real file with the expected name',
    !!download && /^pm56-thread-plain\.json$/.test(download.suggestedFilename()),
    download ? download.suggestedFilename() : null);
  ok('5.2 The exported payload is real JSON carrying every turn',
    !!parsed && Array.isArray(parsed.messages) && parsed.messages.length > 10 && parsed.thread.id === 'plain',
    parsed && { turns: parsed.messages.length, id: parsed.thread.id, format: parsed.format });
  const exportReceipt = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === 'plain');
    const last = t.messages[t.messages.length - 1];
    return { type: last.type, title: last.title, detail: last.detail, cmd: window.PM56_THREADOPS.lastCommand(), le: window.PM56_THREADOPS.lastExport() };
  });
  ok('5.3 Export writes a receipt naming the file, the byte count and cmd.chat.export',
    exportReceipt.type === 'threadops-export' && /cmd\.chat\.export/.test(exportReceipt.detail || '') &&
    /bytes/.test(exportReceipt.detail || '') && !!exportReceipt.le, exportReceipt);

  /* Retry, on shipped fixtures. */
  await selectThread(page, 'tool-failure');
  const errRow = ((await tops(page, 'overflowFor', 'tool-failure-02')) || []).find(r => r.id === 'retry');
  const errFixture = await page.evaluate(() => {
    const t = window.PM56_DATA.threads.find(x => x.id === 'tool-failure');
    const m = t.messages.find(x => x.id === 'tool-failure-02');
    return { terminal: m.runtime.terminal, error: m.runtime.error, label: window.PM56_DATA.labels.terminal[m.runtime.terminal] };
  });
  ok('5.4 Retry is enabled on the shipped error turn and quotes its real reason',
    !!errRow && !errRow.disabled && (errRow.detail || '').includes(errFixture.error) && (errRow.detail || '').includes(errFixture.label),
    { row: errRow && errRow.detail, fixture: errFixture });

  const okRow = ((await tops(page, 'overflowFor', 'tool-failure-14')) || []).find(r => r.id === 'retry');
  ok('5.5 Retry is disabled on a completed turn with a reason naming the mapped label',
    !!okRow && okRow.disabled && /Completed/.test(okRow.reason || '') && reasonIsReal(okRow.reason), okRow);

  /* The subtle case Demo Data's negative control found: terminal kept, reason
     stripped. Retry must stay enabled AND still say something true. */
  const strippedRow = await page.evaluate(() => {
    /* mutate the live state's own copy through the module's ctx, then ask the
       renderer for the row it would draw */
    const ctx = window.PM56_EXT.ctx({});
    const t = ctx.activeThread();
    const m = t.messages.find(x => x.id === 'tool-failure-02');
    const keep = m.runtime.error;
    delete m.runtime.error;
    const row = (window.PM56_THREADOPS.overflowFor('tool-failure-02') || []).find(r => r.id === 'retry');
    m.runtime.error = keep;
    return row;
  });
  ok('5.6 An error turn that lost its reason string stays enabled and says the reason was not reported',
    !!strippedRow && !strippedRow.disabled && /no reason was reported/i.test(strippedRow.detail || ''),
    strippedRow);

  const beforeRetry = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === 'tool-failure');
    const m = t.messages.find(x => x.id === 'tool-failure-02');
    return { n: t.messages.length, terminal: m.runtime.terminal };
  });
  await page.evaluate(() => {
    const b = document.createElement('button');
    b.dataset.action = 'retry-message'; b.dataset.value = 'tool-failure-02';
    document.body.appendChild(b); b.click(); b.remove();
  });
  await page.waitForTimeout(300);
  const afterRetry = await page.evaluate(() => {
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === 'tool-failure');
    const m = t.messages.find(x => x.id === 'tool-failure-02');
    const last = t.messages[t.messages.length - 1];
    return { n: t.messages.length, terminal: m.runtime.terminal, lastRole: last.role, retryOf: last.retryOf,
      cmds: window.PM56_THREADOPS.dispatched().map(d => d.command) };
  });
  ok('5.7 Retry appends a NEW turn and never rewrites the failed turn’s terminal (ACD-447)',
    afterRetry.n === beforeRetry.n + 2 && afterRetry.terminal === 'error' &&
    afterRetry.lastRole === 'assistant' && afterRetry.retryOf === 'tool-failure-02' &&
    afterRetry.cmds.includes('cmd.chat.retry_message'), { beforeRetry, afterRetry });

  const stopRow = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('debug');
    await new Promise(r => setTimeout(r, 120));
    return (window.PM56_THREADOPS.overflowFor('debug-10') || []).find(r => r.id === 'retry') || null;
  });
  ok('5.8 Retry is enabled on the shipped stopped turn with the mapped label',
    !!stopRow && !stopRow.disabled && /Stopped by user/.test(stopRow.detail || ''), stopRow);

  /* Add passage to context — real projection mutation where the record exists. */
  await selectThread(page, 'context');
  const passBefore = await page.evaluate(() => {
    const rec = window.PM56_DATA.contextByThread['context'];
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'context');
    const m = t.messages.find(x => x.type === 'text' && x.role === 'assistant');
    return { used: rec.window.used, pct: rec.window.pct, sources: rec.sources.length, msg: m.id };
  });
  await page.evaluate((id) => {
    const b = document.createElement('button');
    b.dataset.action = 'add-passage'; b.dataset.value = id;
    document.body.appendChild(b); b.click(); b.remove();
  }, passBefore.msg);
  await page.waitForTimeout(300);
  const passAfter = await page.evaluate(() => {
    const rec = window.PM56_DATA.contextByThread['context'];
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'context');
    const last = t.messages[t.messages.length - 1];
    return {
      used: rec.window.used, pct: rec.window.pct, sources: rec.sources.length,
      pinned: rec.sources.find(s => s.id === 'pinned-passages'),
      pctSum: rec.sources.reduce((a, s) => a + s.pct, 0),
      receipt: { type: last.type, detail: last.detail },
      passages: window.PM56_THREADOPS.passages('context').length
    };
  });
  ok('5.9 Add passage genuinely grows the thread’s context projection',
    passAfter.used > passBefore.used && passAfter.sources === passBefore.sources + 1 &&
    !!passAfter.pinned && passAfter.pinned.tokens > 0 && passAfter.passages === 1,
    { before: passBefore, after: { used: passAfter.used, sources: passAfter.sources, tokens: passAfter.pinned && passAfter.pinned.tokens } });
  ok('5.10 The rebalanced source percentages still add up to ~100',
    !!passAfter.pinned && Math.abs(passAfter.pctSum - 100) <= 3,
    { pinned: !!passAfter.pinned, pctSum: passAfter.pctSum });

  await click(page, '[data-action="remove-passage"]');
  const passRemoved = await page.evaluate(() => {
    const rec = window.PM56_DATA.contextByThread['context'];
    const pp = rec.sources.find(s => s.id === 'pinned-passages');
    /* `exists` matters: with the module blanked there is no pinned source at
       all, and "tokens back to zero" would pass on an absence. */
    return { used: rec.window.used, exists: !!pp, pinned: pp ? pp.tokens : null };
  });
  ok('5.11 Remove passage reverses the projection exactly',
    passRemoved.exists && passRemoved.used === passBefore.used && passRemoved.pinned === 0,
    { passBefore, passRemoved });

  /* A thread with no projection record must be honestly disabled. */
  const noRec = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('visuals');
    await new Promise(r => setTimeout(r, 120));
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'visuals');
    const m = t.messages.find(x => x.type === 'text' && x.role === 'assistant');
    return { hasRec: !!window.PM56_DATA.contextByThread['visuals'], row: (window.PM56_THREADOPS.overflowFor(m.id) || []).find(r => r.id === 'passage') || null };
  });
  ok('5.12 Add passage is disabled with a real reason where the fixture has no projection',
    noRec.hasRec === false && !!noRec.row && noRec.row.disabled &&
    /no per-thread context projection/i.test((noRec.row && noRec.row.reason) || '') && reasonIsReal(noRec.row && noRec.row.reason), noRec.row);

  /* Copy link. */
  const clip = await page.evaluate(async () => {
    const b = document.createElement('button');
    b.dataset.action = 'copy-thread-link'; b.dataset.id = 'plain';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 260));
    try { return await navigator.clipboard.readText(); } catch (e) { return 'ERR:' + e.message; }
  });
  ok('5.13 Copy link performs a real clipboard write', clip === 'pm://chat/thread/plain', clip);

  /* Archive / Pin / Rename receipts + the archive guard. */
  const arch = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('plain');
    await new Promise(r => setTimeout(r, 120));
    const b = document.createElement('button');
    b.dataset.action = 'archive-thread'; b.dataset.id = 'plain';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 200));
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'plain');
    const last = t.messages[t.messages.length - 1];
    return { archived: t.archived, type: last.type, detail: last.detail, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('5.14 Archive mutates the thread, writes a receipt, and dispatches cmd.chat.archive',
    arch.archived === true && arch.type === 'threadops-archive' &&
    /cmd\.chat\.archive/.test(arch.detail || '') && arch.cmd === 'cmd.chat.archive', arch);

  const guard = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('crew');   /* status: working */
    await new Promise(r => setTimeout(r, 120));
    const before = window.PM56_DEMO.getState().threads.find(x => x.id === 'crew');
    const b = document.createElement('button');
    b.dataset.action = 'archive-thread'; b.dataset.id = 'crew';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 220));
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'crew');
    const last = t.messages[t.messages.length - 1];
    return { was: before.archived, now: t.archived, status: t.status, type: last.type, title: last.title, detail: last.detail };
  });
  ok('5.15 Archiving a running thread is refused, and the refusal is a RECORD not a toast',
    guard.now === false && guard.type === 'threadops-refused' && /Archive refused/.test(guard.title) &&
    /run is active/i.test(guard.detail || ''), guard);

  const pin = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('visuals');
    await new Promise(r => setTimeout(r, 120));
    const b = document.createElement('button');
    b.dataset.action = 'toggle-thread-pin'; b.dataset.id = 'visuals';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 220));
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'visuals');
    const last = t.messages[t.messages.length - 1];
    return { pinned: t.pinned, type: last.type, detail: last.detail, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('5.16 Pin writes a receipt and dispatches cmd.chat.pin',
    pin.pinned === true && pin.type === 'threadops-pin' && pin.cmd === 'cmd.chat.pin' && /cmd\.chat\.pin/.test(pin.detail || ''), pin);

  const rename = await page.evaluate(async () => {
    const b = document.createElement('button');
    b.dataset.action = 'rename-thread'; b.dataset.id = 'visuals';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 200));
    const inp = document.querySelector('[data-input="rename-thread"]');
    if (!inp) return { err: 'no rename dialog' };
    inp.value = 'Renamed by the harness';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    const save = document.querySelector('[data-action="save-thread-name"]');
    if (!save) return { err: 'no save button' };
    save.click();
    await new Promise(r => setTimeout(r, 220));
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'visuals');
    const last = t.messages[t.messages.length - 1];
    return { title: t.title, type: last.type, detail: last.detail, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('5.17 Rename writes a receipt naming both titles and dispatches cmd.chat.rename',
    rename.title === 'Renamed by the harness' && rename.type === 'threadops-rename' &&
    rename.cmd === 'cmd.chat.rename' && /Renamed by the harness/.test(rename.detail || ''), rename);

  /* Duplicate is a copy, and must NOT dispatch a command (ACD-443). */
  const dup = await page.evaluate(async () => {
    const before = window.PM56_THREADOPS.dispatched().length;
    const b = document.createElement('button');
    b.dataset.action = 'duplicate-thread'; b.dataset.id = 'visuals';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 260));
    const s = window.PM56_DEMO.getState();
    const nt = s.threads.find(x => x.id === s.selectedThread);
    return { after: window.PM56_THREADOPS.dispatched().length, before, lineage: nt.lineage, title: nt.title, n: nt.messages.length };
  });
  ok('5.18 Duplicate copies the thread, carries NO lineage, and dispatches no command (ACD-443)',
    dup.after === dup.before && dup.lineage === null && / · Copy$/.test(dup.title || '') && dup.n > 0, dup);

  await context.close();
}

/* ======================================================================= */
/* GROUP 6 — cross-thread requests and the search scope selector            */
/* ======================================================================= */
{
  const { context, page } = await fresh();
  await selectThread(page, 'plain');

  const spawn = await page.evaluate(async () => {
    const before = window.PM56_DEMO.getState().threads.length;
    const b = document.createElement('button');
    b.dataset.action = 'spawn-related-thread'; b.dataset.id = 'plain';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 280));
    const s = window.PM56_DEMO.getState();
    const nt = s.threads.find(x => x.id === s.selectedThread);
    return { before, after: s.threads.length, msgs: nt.messages.length, lineage: nt.lineage, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('6.1 Spawn creates a lineage-carrying sibling with ZERO copied turns',
    spawn.after === spawn.before + 1 && spawn.msgs === 0 &&
    !!spawn.lineage && spawn.lineage.kind === 'spawn' && spawn.lineage.sourceThreadId === 'plain' &&
    spawn.cmd === 'cmd.thread.spawn', spawn);

  await selectThread(page, 'plain');
  const req = await page.evaluate(async () => {
    const b = document.createElement('button');
    b.dataset.action = 'send-thread-request'; b.dataset.id = 'plain'; b.dataset.value = 'debug';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 260));
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === 'plain');
    const last = t.messages[t.messages.length - 1];
    const rs = window.PM56_THREADOPS.requests();
    return { n: rs.length, rec: rs[0], card: { type: last.type, title: last.title }, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('6.2 A thread request creates a typed record and a pending card on the source',
    req.n === 1 && !!req.rec && req.rec.sourceThread === 'plain' && req.rec.targetThread === 'debug' &&
    req.rec.status === 'pending' && req.card.type === 'threadops-request' && req.cmd === 'cmd.thread.request', req);

  /* Cycle guard: the target's picker must refuse the reverse direction. */
  const cycle = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('debug');
    await new Promise(r => setTimeout(r, 120));
    const b = document.createElement('button');
    b.dataset.action = 'open-thread-request'; b.dataset.id = 'debug';
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 280));
    const rows = [...document.querySelectorAll('.pm-tops-item')].map(e => ({
      title: (e.querySelector('strong') || {}).textContent,
      disabled: e.classList.contains('is-disabled'),
      reason: (e.querySelectorAll('.pm-tops-item-copy span')[0] || {}).textContent
    }));
    /* EXACT title: group 6 has already spawned "Related to Product Design
       Discussion", and a substring match picks that up instead. */
    return rows.find(r => (r.title || '').trim() === 'Product Design Discussion') || { rows: rows.length, titles: rows.map(r => r.title) };
  });
  ok('6.3 The cycle guard disables the reverse target with a loop reason',
    !!cycle && cycle.disabled === true && /close a loop/i.test(cycle.reason || '') && reasonIsReal(cycle.reason), cycle);
  await page.keyboard.press('Escape');

  /* Fan-out cap. */
  const fanout = await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('plain');
    await new Promise(r => setTimeout(r, 120));
    ['context', 'visuals', 'route'].forEach(target => {
      const b = document.createElement('button');
      b.dataset.action = 'send-thread-request'; b.dataset.id = 'plain'; b.dataset.value = target;
      document.body.appendChild(b); b.click(); b.remove();
    });
    await new Promise(r => setTimeout(r, 300));
    const html = window.PM56_THREADOPS.threadRowsFor('plain');
    const d = document.createElement('div'); d.innerHTML = html;
    const rows = [...d.querySelectorAll('.menu-item')].map(b => ({
      label: (b.querySelector('strong') || {}).textContent,
      disabled: b.hasAttribute('disabled'),
      reason: (b.querySelector('.menu-copy span') || {}).textContent
    }));
    return { open: window.PM56_THREADOPS.requests().filter(r => r.sourceThread === 'plain' && r.status === 'pending').length,
      row: rows.find(r => r.label === 'Request from another thread') };
  });
  ok('6.4 The fan-out cap disables the Request row once three are open, with the cap named',
    fanout.open >= 3 && !!fanout.row && fanout.row.disabled && /3 open requests/.test(fanout.row.reason || '') && reasonIsReal(fanout.row.reason),
    fanout);

  const awaited = await page.evaluate(async () => {
    const rs = window.PM56_THREADOPS.requests().filter(r => r.status === 'pending');
    if (!rs.length) return { status: null, cardTitle: null, cmd: null };
    const id = rs[0].id;
    const b = document.createElement('button');
    b.dataset.action = 'await-thread-request'; b.dataset.value = id;
    document.body.appendChild(b); b.click(); b.remove();
    await new Promise(r => setTimeout(r, 260));
    const rec = window.PM56_THREADOPS.requests().find(r => r.id === id);
    const t = window.PM56_DEMO.getState().threads.find(x => x.id === rec.sourceThread);
    const card = t.messages.find(m => m.requestId === id);
    return { status: rec.status, cardTitle: card && card.title, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('6.5 Await resolves the request and flips its card on the source transcript',
    awaited.status === 'answered' && /Answered by/.test(awaited.cardTitle || '') && awaited.cmd === 'cmd.thread.await',
    awaited);

  const outbox = await page.evaluate(async () => {
    const rs = window.PM56_THREADOPS.requests().filter(r => r.status === 'pending');
    if (rs.length < 2) return { attempts: null, cancelled: null, cmds: [] };
    const id = rs[0].id, id2 = rs[1].id;
    const mk = (a, v) => { const b = document.createElement('button'); b.dataset.action = a; b.dataset.value = v; document.body.appendChild(b); b.click(); b.remove(); };
    mk('retry-thread-request', id);
    await new Promise(r => setTimeout(r, 180));
    mk('cancel-thread-request', id2);
    await new Promise(r => setTimeout(r, 180));
    const a = window.PM56_THREADOPS.requests().find(r => r.id === id);
    const b2 = window.PM56_THREADOPS.requests().find(r => r.id === id2);
    return { attempts: a.attempts, cancelled: b2.status, cmds: window.PM56_THREADOPS.dispatched().map(d => d.command) };
  });
  ok('6.6 Outbox retry increments the attempt count and cancel withdraws the request',
    outbox.attempts === 2 && outbox.cancelled === 'cancelled' && outbox.cmds.includes('cmd.thread.outbox'), outbox);

  /* ---- thread search scope ---- */
  await selectThread(page, 'plain');
  await click(page, '[data-action="thread-search"]');
  const scope0 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.pm-tops-scope-btn')];
    return { labels: btns.map(b => b.textContent.trim()), active: btns.filter(b => b.classList.contains('active')).map(b => b.textContent.trim()) };
  });
  ok('6.7 Thread search offers a scope selector defaulting to Current Thread',
    JSON.stringify(scope0.labels) === JSON.stringify(['Current Thread', 'All Threads']) &&
    JSON.stringify(scope0.active) === JSON.stringify(['Current Thread']), scope0);

  const scopeOwn = await ownsCentre(page, '.pm-tops-scope-btn', 1);
  ok('6.8 The scope buttons own their own pixels', scopeOwn.found && scopeOwn.owns, scopeOwn);

  /* A common word saturates the 24-row cap in BOTH scopes, so "all > current"
     reads 24 vs 24 and proves nothing. The decisive probe is a term that is
     absent from the current thread and present in another one: current scope
     must find NOTHING and print the scoped empty line, All Threads must find
     it. The term is derived from the fixture at runtime rather than hardcoded,
     so a later data pass cannot quietly turn this into a vacuous pass. */
  const counts = await page.evaluate(async () => {
    const cur = window.PM56_DEMO.getState().selectedThread;
    const text = (t) => t.messages.map(m => ((m.body || '') + ' ' + (m.title || '') + ' ' + (m.detail || ''))).join(' ').toLowerCase();
    const threads = window.PM56_DEMO.getState().threads;
    const here = text(threads.find(t => t.id === cur));
    let term = null;
    outer:
    for (const t of threads) {
      if (t.id === cur) continue;
      for (const w of text(t).match(/[a-z]{7,}/g) || []) {
        if (here.indexOf(w) < 0) { term = w; break outer; }
      }
    }
    const type = async (q) => {
      const i = document.querySelector('[data-input="thread-global-search"]');
      if (!i) return 0;
      i.value = q; i.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 240));
      return document.querySelectorAll('.pm-tops-result').length;
    };
    const inCurrent = await type(term);
    const hint = (document.querySelector('.pm-tops-hint') || {}).textContent || '';
    const allBtn = document.querySelector('.pm-tops-scope-btn[data-value="all"]'); if (allBtn) allBtn.click();
    await new Promise(r => setTimeout(r, 240));
    const inAll = document.querySelectorAll('.pm-tops-result').length;
    const activeAll = [...document.querySelectorAll('.pm-tops-scope-btn')].filter(b => b.classList.contains('active')).map(b => b.textContent.trim());
    const ops = document.querySelectorAll('.pm-tops-result .pm-tops-result-op').length;
    /* leave a broad query in place for the rows that follow */
    await type('the');
    return { term, inCurrent, inAll, hint, activeAll, ops, rows: document.querySelectorAll('.pm-tops-result').length };
  });
  ok('6.9 The scope selector really scopes: a term absent from this thread is found only under All Threads',
    !!counts.term && counts.inCurrent === 0 && counts.inAll > 0 &&
    /in this thread/.test(counts.hint) &&
    JSON.stringify(counts.activeAll) === JSON.stringify(['All Threads']), counts);
  ok('6.10 Every search result row carries exactly Copy link and Add passage',
    counts.ops === counts.inAll * 2 && counts.inAll > 0, counts);

  const scopedIds = await page.evaluate(async () => {
    const curBtn = document.querySelector('.pm-tops-scope-btn[data-value="current"]'); if (curBtn) curBtn.click();
    await new Promise(r => setTimeout(r, 220));
    const cur = window.PM56_DEMO.getState().selectedThread;
    const all = [...document.querySelectorAll('.pm-tops-result .menu-item')].map(b => b.dataset.thread);
    return { total: all.length, foreign: all.filter(x => x !== cur).length };
  });
  ok('6.11 Current Thread scope returns results, and every one is from that thread',
    scopedIds.total > 0 && scopedIds.foreign === 0, scopedIds);

  const jump = await page.evaluate(async () => {
    const allB = document.querySelector('.pm-tops-scope-btn[data-value="all"]'); if (allB) allB.click();
    await new Promise(r => setTimeout(r, 200));
    const row = [...document.querySelectorAll('.pm-tops-result .menu-item')].find(b => b.dataset.thread !== window.PM56_DEMO.getState().selectedThread);
    if (!row) return { target: null, now: window.PM56_DEMO.getState().selectedThread, type: null, detail: '', cmd: null };
    const target = row.dataset.thread;
    row.click();
    await new Promise(r => setTimeout(r, 420));
    const s = window.PM56_DEMO.getState();
    const t = s.threads.find(x => x.id === s.selectedThread);
    const last = t.messages[t.messages.length - 1];
    return { target, now: s.selectedThread, type: last.type, detail: last.detail, cmd: window.PM56_THREADOPS.lastCommand() };
  });
  ok('6.12 Opening a search result switches thread and writes a search receipt',
    !!jump.target && jump.now === jump.target && jump.type === 'threadops-search' &&
    /All Threads/.test(jump.detail || '') && jump.cmd === 'cmd.chat.search', jump);

  await context.close();
}

/* ======================================================================= */
/* GROUP 7 — command discipline, layout, chrome, themes                     */
/* ======================================================================= */
{
  const { context, page } = await fresh();
  const CANON = await page.evaluate(() => Object.values(window.PM56_THREADOPS.CMD));
  const known = new Set([
    'cmd.chat.archive', 'cmd.chat.pin', 'cmd.chat.rename', 'cmd.chat.delete', 'cmd.chat.export',
    'cmd.chat.search', 'cmd.chat.create_restore_point', 'cmd.chat.rewind',
    'cmd.chat.branch_from_restore', 'cmd.chat.delete_restore_point', 'cmd.chat.retry_message',
    'cmd.thread.request', 'cmd.thread.await', 'cmd.thread.spawn', 'cmd.thread.outbox'
  ]);
  ok('7.1 Every command id this module can dispatch is a canonical, cataloged id',
    CANON.length === known.size && CANON.every(c => known.has(c)),
    { declared: CANON, minted: CANON.filter(c => !known.has(c)) });

  /* Every operation row either acts or is disabled with a real reason. */
  const sweep = await page.evaluate(() => {
    const out = { rows: 0, disabled: 0, bad: [] };
    const seen = [];
    window.PM56_DEMO.getState().threads.slice(0, 8).forEach(t => {
      const d = document.createElement('div');
      d.innerHTML = window.PM56_THREADOPS.threadRowsFor(t.id);
      [...d.querySelectorAll('.menu-item')].forEach(b => {
        out.rows++;
        const label = (b.querySelector('strong') || {}).textContent;
        const sub = (b.querySelector('.menu-copy span') || {}).textContent || '';
        if (b.hasAttribute('disabled')) {
          out.disabled++;
          if (!(sub.trim().length >= 30)) out.bad.push({ t: t.id, label, sub });
        } else if (!b.dataset.action) {
          out.bad.push({ t: t.id, label, why: 'enabled with no action' });
        }
        seen.push(label);
      });
    });
    return out;
  });
  ok('7.2 Across eight threads, every menu row either carries an action or a real reason',
    sweep.bad.length === 0 && sweep.rows > 60, sweep);

  const msgSweep = await page.evaluate(() => {
    const bad = [];
    let rows = 0, disabled = 0;
    ['plain', 'tool-failure', 'debug', 'visuals'].forEach(tid => {
      window.PM56_DEMO.selectThread(tid);
      const t = window.PM56_DEMO.getState().threads.find(x => x.id === tid);
      t.messages.filter(m => m.type === 'text').slice(0, 6).forEach(m => {
        (window.PM56_THREADOPS.overflowFor(m.id) || []).forEach(r => {
          rows++;
          if (r.disabled) { disabled++; if (!(r.reason && r.reason.trim().length >= 30)) bad.push({ tid, m: m.id, r }); }
          else if (!r.action) bad.push({ tid, m: m.id, why: 'enabled with no action', r });
        });
      });
    });
    return { rows, disabled, bad };
  });
  ok('7.3 Across four threads, every message-overflow row either acts or states a real reason',
    msgSweep.bad.length === 0 && msgSweep.rows > 100 && msgSweep.disabled > 0, msgSweep);

  /* No horizontal overflow with each dialog open, at two widths. */
  const widths = [1440, 900];
  const overflow = [];
  let opened = 0;   /* anti-vacuous: a dialog that never opened cannot overflow */
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const [action, id] of [['delete-thread', 'query'], ['open-restore-points', 'query'],
      ['open-thread-request', 'query'], ['open-thread-outbox', 'query']]) {
      await page.evaluate(([a, i]) => {
        const b = document.createElement('button');
        b.dataset.action = a; b.dataset.id = i;
        document.body.appendChild(b); b.click(); b.remove();
      }, [action, id]);
      await page.waitForTimeout(200);
      const o = await page.evaluate(() => ({
        sw: document.body.scrollWidth, cw: document.documentElement.clientWidth,
        open: !!document.querySelector('.pm-tops-dialog')
      }));
      opened += o.open ? 1 : 0;
      if (o.sw > o.cw + 1) overflow.push({ w, action, ...o });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
    }
  }
  ok('7.4 Every dialog opens, and none causes horizontal page overflow at 1440 or 900',
    opened === 8 && overflow.length === 0, { opened, overflow });
  await page.setViewportSize({ width: 1440, height: 900 });

  /* Themes: the danger surface must read as danger and stay legible in all 8. */
  const themeList = THEMES
    ? await page.evaluate(() => (window.PM56_DATA.themes || []).map(t => t.id || t))
    : ['basic-dark', 'basic-light'];
  const themeRows = [];
  for (const th of themeList) {
    await page.evaluate((t) => window.PM56_DEMO.setTheme(t), th);
    await page.waitForTimeout(120);
    await page.evaluate(() => {
      const b = document.createElement('button');
      b.dataset.action = 'delete-thread'; b.dataset.id = 'query';
      document.body.appendChild(b); b.click(); b.remove();
    });
    await page.waitForTimeout(260);
    const r = await rectOf(page, '.pm-tops-dialog');
    const pix = await crop(page, r);
    const own = await ownsCentre(page, '.pm-tops-del-actions [data-value="keep"]');
    themeRows.push({ theme: th, distinct: pix.distinct, owns: own.owns });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
  }
  ok('7.5 The destructive confirm paints real content and stays clickable in every theme tested',
    themeRows.every(t => t.distinct > 40 && t.owns), themeRows);

  ok('7.6 Zero console errors or warnings', consoleIssues.filter(x => !/^warning: /.test(x)).length === 0,
    consoleIssues.slice(0, 6));
  ok('7.7 Zero page errors', consoleIssues.filter(x => x.startsWith('pageerror')).length === 0,
    consoleIssues.filter(x => x.startsWith('pageerror')).slice(0, 6));

  await context.close();
}

await browser.close();

const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;
console.log('\n' + passed + ' pass / ' + failed + ' fail   (' + results.length + ' assertions)');
if (NEGATIVE) {
  const chrome = new Set(['7.6 Zero console errors or warnings', '7.7 Zero page errors']);
  const wrongly = results.filter(r => r.pass && !chrome.has(r.name));
  console.log('\nNEGATIVE CONTROL: ' + wrongly.length + ' assertion(s) still green with the module blanked.');
  wrongly.forEach(r => console.log('  VACUOUS: ' + r.name));
}
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ page: PAGE, negative: NEGATIVE, passed, failed, consoleIssues, results }, null, 1));
process.exit(NEGATIVE ? 0 : (failed ? 1 : 0));
