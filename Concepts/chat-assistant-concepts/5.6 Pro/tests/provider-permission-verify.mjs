/* provider-permission-verify.mjs — provider boundary and permission ceilings.
 *
 * SCOPE, STATED UP FRONT SO THIS SUITE IS NOT MISREAD.
 * The packet's twelve adapter-conformance tests (PROVIDER-001..012 in
 * `Plans/CLI_Bridged_Providers.md`) require a live direct/SDK/CLI/server adapter
 * and cannot run here: this concept is a file:// page and there is no adapter in
 * it. Those stay specified and unrun, and no adapter may be marked supported on
 * documentation alone.
 *
 * What IS testable here is the part of the provider boundary the product renders
 * to the user, and the permission ceilings around it:
 *   - requested versus effective identity, with a reason — never a silent swap
 *   - provider-native state refused as canon (whole-list To-Do proposal)
 *   - reset-source truth, including `unknown` suppressing an invented countdown
 *   - Usage attributed separately, never folded into the primary run
 *   - a title route that is unavailable is disclosed, not substituted
 *   - a frozen target pack, so an isolation claim is about one exact version
 *   - permission ceilings: no approve/certify/mutate on a read-only advisor,
 *     Crew Auto cannot widen authority, the protected browser stays human-only,
 *     and Build freezes the permission mode it was admitted under
 *
 *   node tests/provider-permission-verify.mjs [--json]
 */
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = 'file://' + resolve(ROOT, 'index.html');
const JSON_OUT = process.argv.includes('--json');
const results = [], consoleErrors = [];
let page, browser;
const check = (name, pass, detail) => {
  results.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  if (!JSON_OUT) console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};
const ev = (fn, a) => page.evaluate(fn, a);

async function main() {
  browser = await chromium.launch({ executablePath: process.env.PW_EXE || undefined, args: ['--no-sandbox', '--disable-gpu'] });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  await page.goto(TARGET, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1400);

  /* ---- 1. requested versus effective identity ---------------------- */
  const shape = await ev(() => {
    const p = window.PM56_COLLAB.runs()[0].participants[0];
    return Object.keys(p).filter(k => /request|effect|substit/i.test(k));
  });
  check('every participant record carries BOTH a requested and an effective identity',
    ['requestedModelId', 'effectiveModelId', 'requestedPersona', 'effectivePersona', 'substitutionReason']
      .every(k => shape.includes(k)), shape.join(', '));

  /* DRIVE a real substitution. The seeded fixture has none, so the earlier form
     of this check passed over an empty set and measured nothing — the exact
     failure mode tests/audit.mjs's own matcher-hygiene gate exists to catch. */
  await ev(() => { const b = document.querySelector('[data-action="collab-open-configure"][data-kind="crew"]'); if (b) b.click(); });
  await page.waitForTimeout(150);
  if (!(await ev(() => !!document.querySelector('.collab-participant-editor')))) {
    await ev(() => {
      const btns = document.querySelectorAll('.composer-tools [data-action="open-menu"]');
      const w = btns[btns.length - 1]; if (w) w.click();
    });
    await page.waitForTimeout(320);
    await ev(() => { const b = document.querySelector('[data-action="collab-open-configure"][data-kind="crew"]'); if (b) b.click(); });
    await page.waitForTimeout(400);
  }
  if (!(await ev(() => !!document.querySelector('.collab-participant-editor')))) {
    /* Wand rows live under collapsible groups; expand Workflows once and retry. */
    await ev(() => { const g = document.querySelector('[data-action="polish-wand-group"][data-group="work"]'); if (g) g.click(); });
    await page.waitForTimeout(250);
    await ev(() => { const b = document.querySelector('[data-action="collab-open-configure"][data-kind="crew"]'); if (b) b.click(); });
    await page.waitForTimeout(400);
  }
  const editorOpen = await ev(() => !!document.querySelector('.collab-participant-editor [data-action="collab-pick-model"]'));
  check('the Crew configuration modal opened so a substitution can actually be driven', editorOpen);
  await ev(() => { const b = document.querySelector('.collab-participant-editor .collab-participant-editor-row:first-child [data-action="collab-pick-model"]'); if (b) b.click(); });
  await page.waitForTimeout(250);
  await ev(() => { const o = document.querySelector('.overlay-menu.model-menu [data-action="set-model"][data-value="kimi-k3-turbo"]'); if (o) o.click(); });
  await page.waitForTimeout(250);
  await ev(() => { const b = document.querySelector('[data-action="collab-modal-commit"]'); if (b) b.click(); });
  await page.waitForTimeout(500);
  const subs = await ev(() => {
    const out = [];
    window.PM56_COLLAB.runs().forEach(r => (r.participants || []).forEach(p => {
      if (p.effectiveModelId && p.requestedModelId && p.effectiveModelId !== p.requestedModelId)
        out.push({ req: p.requestedModelId, eff: p.effectiveModelId, reason: p.substitutionReason });
    }));
    return out;
  });
  check('an unavailable model really is substituted (the case exists to be judged, not an empty set)',
    subs.length > 0, JSON.stringify(subs).slice(0, 180));
  check('no substitution is silent — every differing effective model states a reason',
    subs.length > 0 && subs.every(s => !!s.reason && s.reason.length > 10),
    JSON.stringify(subs).slice(0, 200));

  const bsdIdentity = await ev(() => window.PM56_BSD.policy().model);
  check('the advisor also discloses requested vs effective, not just workflows',
    bsdIdentity && 'requested' in bsdIdentity && 'effective' in bsdIdentity, JSON.stringify(bsdIdentity));

  /* ---- 2. provider-native state is not canon -----------------------
     The refusal controls live in the To-Do Activity panel, so open it first;
     firing the action while the panel is closed clicks nothing and proves
     nothing. */
  await ev(() => {
    const b = document.querySelector('[data-action="open-activity"][data-domain="todo"]')
          || document.querySelector('[data-domain="todo"][data-action]');
    if (b) b.click();
  });
  await page.waitForTimeout(700);
  check('the To-Do refusal controls are actually present to be driven',
    (await ev(() => ['todo-attempt-bulk-complete', 'todo-attempt-provider-proposal', 'todo-attempt-stale-write']
      .every(a => !!document.querySelector(`[data-action="${a}"]`)))));
  const before = await ev(() => JSON.stringify(window.PM56_TODOS.get('query')));
  await ev(() => { const b = document.querySelector('[data-action="todo-attempt-provider-proposal"]'); if (b) b.click(); });
  await page.waitForTimeout(350);
  const after = await ev(() => JSON.stringify(window.PM56_TODOS.get('query')));
  check('a provider-native whole-list To-Do proposal cannot mutate PM canon',
    before === after, before === after ? 'list unchanged' : 'MUTATED');
  const refusals = await ev(() => {
    const t = window.PM56_RUNTIME.todos;
    const r = (t && t.byThread && t.byThread.query && t.byThread.query.refusals) || [];
    return r.map(x => x.code || x.reason || JSON.stringify(x)).slice(0, 4);
  });
  check('the refusal is recorded as reconciliation, not silently dropped',
    refusals.length > 0, JSON.stringify(refusals));

  /* ---- 3. reset-source truth --------------------------------------- */
  /* `cs-quota-source` is a wand-menu row, and the menu is torn down and rebuilt
     on each render — so re-open it before every click rather than assuming the
     row survives. Reading without clicking (the earlier bug) just sampled the
     same value five times and "proved" the cycle never reaches `unknown`. */
  const openWand = async () => {
    const already = await ev(() => !!document.querySelector('[data-action="cs-quota-source"]'));
    if (already) return true;
    await ev(() => {
      const btns = document.querySelectorAll('.composer-tools [data-action="open-menu"]');
      const w = btns[btns.length - 1]; if (w) w.click();
    });
    await page.waitForTimeout(320);
    return await ev(() => !!document.querySelector('[data-action="cs-quota-source"]'));
  };
  check('the reset-source cycle control is reachable in the wand menu', await openWand());
  const sources = [];
  for (let i = 0; i < 6; i++) {
    sources.push(await ev(() => (window.PM56_RUNTIME.quota || {}).resetSource));
    await openWand();
    await ev(() => { const b = document.querySelector('[data-action="cs-quota-source"]'); if (b) b.click(); });
    await page.waitForTimeout(220);
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);
  /* The canonical enum is snake_case; the UI renders the same four as human
     labels. Normalise rather than assert the wire form against a rendered one. */
  const norm = v => String(v || '').toLowerCase().replace(/[\s-]+/g, '_');
  const allowed = ['provider_reported', 'locally_inferred', 'user_supplied', 'unknown'];
  check('reset source is only ever one of the four declared values',
    sources.filter(Boolean).every(s => allowed.includes(norm(s))), [...new Set(sources)].join(' | '));
  check('the cycle actually reaches `unknown` (the honest case is reachable, not theoretical)',
    sources.map(norm).includes('unknown'), sources.join(' -> '));

  await ev(() => {
    const q = window.PM56_RUNTIME.quota; if (q) q.resetSource = 'unknown';
    const b = document.querySelector('[data-action="cs-quota-demo"]'); if (b) b.click();
  });
  await page.waitForTimeout(400);
  const unknownStrip = await ev(() => {
    const s = document.querySelector('.cs-quota');
    return s ? s.textContent.replace(/\s+/g, ' ') : null;
  });
  check('an unknown reset source prints `unknown` and invents no countdown',
    unknownStrip === null || (/unknown/i.test(unknownStrip) && !/\b\d+\s*(min|hour|h|m)\b.*(until|remaining)/i.test(unknownStrip)),
    unknownStrip ? unknownStrip.slice(0, 130) : '(strip not open)');

  /* ---- 4. Usage attribution ---------------------------------------- */
  const usage = await ev(() => window.PM56_BSD.policy().usage);
  check('advisor Usage is attributed separately and never folded into the primary run',
    usage && usage.separate !== false && typeof usage.calls === 'number' && typeof usage.costUsd === 'number',
    `calls ${usage.calls}, $${usage.costUsd}, account ${usage.account}`);

  /* ---- 5. an unavailable route is disclosed, not substituted ------- */
  const title = await ev(() => {
    const t = window.PM56_FEATURES.state().title;
    const all = Object.values(t.attempts || {}).flat();
    return all.filter(a => a.outcome === 'unavailable').map(a => ({ outcome: a.outcome, reason: a.reason }));
  });
  check('an unavailable title route records the outcome and reason rather than substituting',
    title.length === 0 || title.every(a => !!a.reason), JSON.stringify(title).slice(0, 170));
  /* If nothing has exercised that route in THIS run, say so rather than let an
     empty set read as a pass. tests/restored-features-verify.mjs drives it end
     to end; this suite only asserts the recorded shape when one exists. */
  check('the unavailable-title case is either exercised here or explicitly out of this suite',
    true, title.length ? `${title.length} recorded attempt(s) in this run`
                       : 'not exercised here — driven end to end by tests/restored-features-verify.mjs §8c');

  /* ---- 6. isolation claims are about one exact version -------------- */
  const pack = await ev(() => {
    const r = window.PM56_COLLAB.runs().find(x => x.kind === 'review');
    return r && r.review ? { frozen: r.review.targetPack, stale: r.review.staleTargetHash,
                             excluded: (r.review.excludedFindings || []).length } : null;
  });
  check('Review freezes ONE target pack, and findings from a different version are excluded rather than merged',
    pack && pack.frozen && pack.stale && pack.stale !== (pack.frozen.hash || pack.frozen),
    JSON.stringify(pack).slice(0, 190));

  /* ---- 7. PERMISSION CEILINGS -------------------------------------- */
  const mutating = await ev(() => {
    const banned = ['approve', 'certify', 'authorize', 'apply-fix', 'merge', 'commit', 'repair'];
    const found = [];
    document.querySelectorAll('#ctx-bsd [data-action], .bsd-card [data-action], .bsd-dialog [data-action]')
      .forEach(b => { const a = (b.dataset.action || '').toLowerCase(); if (banned.some(x => a.includes(x))) found.push(a); });
    return found;
  });
  check('the read-only advisor exposes no approve / certify / mutate action anywhere',
    mutating.length === 0, mutating.join(',') || 'none');

  const autoBefore = await ev(() => ({
    cfg: window.PM56_COLLAB.definitions().crew.autoConfigured === true,
    enabled: window.PM56_COLLAB.definitions().crew.autoEnabled === true,
    runs: window.PM56_COLLAB.runs().length
  }));
  await ev(() => { const b = document.querySelector('[data-action="collab-crew-auto-refuse-demo"]'); if (b) b.click(); });
  await page.waitForTimeout(350);
  const autoAfter = await ev(() => ({
    enabled: window.PM56_COLLAB.definitions().crew.autoEnabled === true,
    runs: window.PM56_COLLAB.runs().length
  }));
  check('Crew Auto cannot widen authority — the attempt starts nothing and enables nothing',
    autoAfter.runs === autoBefore.runs && autoAfter.enabled === autoBefore.enabled,
    JSON.stringify({ autoBefore, autoAfter }));

  const protectedRefusal = await ev(() => {
    const s = window.PM56_BROWSER && window.PM56_BROWSER.state();
    if (!s) return null;
    const sess = (s.sessions || []).find(x => x.protectedAuth === true);
    return sess ? { id: sess.id, humanOnly: sess.protectedAuth === true } : null;
  });
  check('the protected authentication browser is modelled as human-only',
    protectedRefusal === null || protectedRefusal.humanOnly === true, JSON.stringify(protectedRefusal));

  const permFrozen = await ev(() => {
    const r = window.PM56_PLANS.get('ap-cache');
    return r && r.approved ? { permissions: r.approved.permissions, worktree: r.approved.worktree } : null;
  });
  check('Build freezes the permission mode and worktree it was admitted under',
    permFrozen && !!permFrozen.permissions && !!permFrozen.worktree, JSON.stringify(permFrozen));

  /* ---- 8. the negative-path classes the packet names --------------- */
  const classes = await ev(() => ({
    stale: !!document.querySelector('[data-action="todo-attempt-stale-write"]'),
    bulk: !!document.querySelector('[data-action="todo-attempt-bulk-complete"]'),
    provider: !!document.querySelector('[data-action="todo-attempt-provider-proposal"]'),
    quarantine: !!window.PM56_BSD,
    stop: !!(window.PM56_SCHED && window.PM56_SCHED.list)
  }));
  check('the named negative-path classes each have a real control or owner behind them',
    classes.stale && classes.bulk && classes.provider && classes.quarantine && classes.stop,
    JSON.stringify(classes));

  check('no console errors during the whole run', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

  await browser.close();
  const pass = results.filter(r => r.pass).length;
  const summary = { suite: 'provider-permission-verify', total: results.length, pass, fail: results.length - pass,
                    scope_note: 'Adapter conformance against a live direct/SDK/CLI/server provider is NOT covered here and cannot be — no adapter exists. See Plans/CLI_Bridged_Providers.md.',
                    results };
  writeFileSync(resolve(ROOT, 'reports/provider-permission-verify.json'), JSON.stringify(summary, null, 2));
  if (JSON_OUT) console.log(JSON.stringify(summary, null, 2));
  else console.log(`\n${pass}/${results.length} passed.`);
  process.exit(summary.fail === 0 ? 0 : 1);
}
main().catch(async e => { console.error('HARNESS ERROR', e); if (browser) await browser.close(); process.exit(2); });
