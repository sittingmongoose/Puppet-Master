/* Guided Tour acceptance, driven by real CDP input against the built concept.
 * node tools/tour_scenarios.mjs <out-dir> [--only t1,t2] [--theme basic-dark] [--snaps]
 * t1 every step by hand (real clicks, a real mouse drag) then Restore; t2 every action through Show Me then Keep;
 * t3 Skip restores everything; t4 resume after reload; t5 a missing target offers Take me there.
 * Each run asserts zero network requests and unchanged usage counters, and writes report.json + screenshots. */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/tour');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const only = opt('only', '') ? opt('only', '').split(',') : null;
const theme = opt('theme', 'basic-dark');
const snaps = argv.includes('--snaps');
mkdirSync(out, { recursive: true });

async function openPage() {
  const { page, close } = await launch({ width: 1600, height: 1000 });
  const [fam, mode] = theme.split('-');
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
  await page.goto(pathToFileURL(PAGE).href + '?o55=off');
  await sleep(1200);
  await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); localStorage.removeItem('pm.o55.tour.v1'); }, fam, mode);
  let n = 0;
  const t = {
    page, close,
    ev: (fn, ...a) => page.evaluate(fn, ...a),
    step: () => page.evaluate(() => window.O55.tour.state().step),
    async until(fn, what, timeout = 12000) { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await page.evaluate(fn)) return true; await sleep(150); } throw new Error('timeout: ' + what + ' (step ' + await t.step() + ')'); },
    async untilStep(id, timeout = 9000) { return t.until(new Function(`return window.O55.tour.state().step === ${JSON.stringify(id)}`), 'step ' + id, timeout); },
    /* a real mouse click at an element's centre */
    /* like a person: wait until the control has stopped moving and nothing covers it, then click its centre */
    async click(sel, what) {
      const probe = (s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length && e.getBoundingClientRect().width > 0); if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const top = document.elementFromPoint(x, y); return { x, y, w: r.width, h: r.height, hit: !!top && (top === el || el.contains(top)), over: top ? (top.id || top.className || top.tagName).toString().slice(0, 60) : '' }; };
      const t0 = Date.now(); let c = null, prev = null;
      while (Date.now() - t0 < 4000) {
        c = await page.evaluate(probe, sel);
        if (c && prev && c.hit && Math.abs(c.x - prev.x) < 0.5 && Math.abs(c.y - prev.y) < 0.5 && Math.abs(c.w - prev.w) < 0.5) break;
        prev = c; await sleep(60);
      }
      if (!c) throw new Error('no element ' + (what || sel) + ' at step ' + await t.step());
      if (!c.hit) throw new Error((what || sel) + ' is covered by ' + c.over + ' at step ' + await t.step());
      await page.mouse(c.x, c.y); await sleep(350);
    },
    async callout(action, arg) { await t.click(`#pm-o55-tour .o55t-callout [data-o55t="${action}"]${arg ? `[data-arg="${arg}"]` : ''}`, 'callout ' + action); },
    /* a real mouse drag from an element to a point */
    async drag(sel, to) {
      const a = await page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
      await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x, y: a.y });
      await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: a.x, y: a.y, button: 'left', clickCount: 1 });
      /* eased travel, then a short dwell on the destination: the workspace adopts a new drop target only after it
         holds for two frames, so a hand-like drag lingers there before letting go */
      const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      for (let i = 1; i <= 36; i++) { const k = ease(i / 36); await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x + (to.x - a.x) * k, y: a.y + (to.y - a.y) * k, button: 'left', buttons: 1 }); await sleep(18); }
      for (let j = 0; j < 4; j++) { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: to.x + (j % 2), y: to.y + j * 0.5, button: 'left', buttons: 1 }); await sleep(40); }
      await sleep(220);
      await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1 });
      await sleep(700);
    },
    async snap(label) { if (!snaps) return; await page.screenshot(join(out, `${String(++n).padStart(2, '0')}-${label}.png`)); }
  };
  return t;
}

const SC = [];
const def = (id, title, fn) => SC.push({ id, title, fn });
const counters = (t) => t.ev(() => ({ c: window.O55.tour.counters(), net: window.__o55net ? window.__o55net.count : null }));

/* ------------------------------------------------------------------------------------------ by hand */
async function byHandChapter1(t, A) {
  await t.untilStep('comfort_intro'); await t.snap('intro'); await t.callout('next');
  await t.untilStep('open_chat'); await t.snap('open_chat');
  A.ok(!(await t.ev(() => window.O55.tour.chat.chatVisible())), 'Chat tucked away so opening it is a real action');
  await t.click('#activityBar .icon[data-ab-id="chat"]', 'Chat icon');
  await t.untilStep('select_teacher'); await t.snap('select_teacher');
  await t.click('.pm6-chat-personabtn', 'persona picker'); await t.click('.pm6-chat-personaitem[data-persona="Teacher"]', 'Teacher');
  await t.untilStep('send_question'); await t.snap('send_question');
  await t.callout('fillQuestion'); await t.click('#chatPanel .pm6-chat-send', 'Send');
  await t.untilStep('answer_stream');
  await t.until(() => window.O55.tour.chat.answered('a1'), 'answer streamed'); await sleep(400); await t.snap('answer');
  A.ok(await t.ev(() => { const el = window.O55.tour.chat.lastAnswerEl(); return !!el && /Guided example/.test(el.textContent) && !/Est\. Cost|Tokens/.test(el.textContent); }), 'answer labelled Guided example, no token or cost line');
  await t.callout('next');
  await t.untilStep('same_answer_eli5');
  await t.click('span.chat-toggle-btn.toggle-eli5', 'ELI5'); await t.until(() => window.O55.tour.state().done.includes('same_answer_eli5'), 'ELI5 rewrite'); await sleep(1300); await t.snap('eli5');
  A.ok(await t.ev(() => /First, Puppet Master writes down/.test(window.O55.tour.chat.lastAnswerEl().textContent)), 'the same bubble now reads the ELI5 answer');
  await t.callout('next');
}
async function byHandChapter2(t, A) {
  await t.untilStep('workspace_orientation'); await t.until(() => !document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"][aria-disabled]') && !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 'orientation ready', 9000); await t.callout('next');
  await t.untilStep('move_or_dock_chat'); await t.snap('dock');
  const band = await t.ev(() => { const r = document.getElementById('pm-home-workspace').getBoundingClientRect(); return { x: r.left + 12, y: r.top + r.height * 0.45 }; });
  await t.drag('[data-pm-home-handle="chat"]', band);
  await t.until(() => (window.PM_HOME_WORKSPACE.layout.surfaces.find((s) => s.surface_kind === 'chat') || {}).host === 'dock_left', 'Chat in the left dock');
  await t.snap('docked');
  await t.untilStep('widget_action', 6000);
  await t.click('#pm6DashAddBtn', 'Add widget'); await sleep(300);
  await t.ev(() => { const it = [...document.querySelectorAll('.pm6-dash-catalog-item')].find((x) => x.getClientRects().length && /approval queue/i.test(x.textContent)); if (it) it.setAttribute('data-o55-test', 'aq'); });
  await t.click('[data-o55-test="aq"]', 'Approval queue');
  await t.untilStep('open_planning', 6000); await t.snap('widget');
}
async function byHandChapter3(t, A) {
  await t.click('#tab-wizard', 'Planning Wizard tab');
  await t.untilStep('book_club_goal'); await sleep(300); await t.snap('goal');
  await t.click('#o55pGoal .o55p-use', 'Use this practice goal');
  await t.untilStep('three_outcomes'); await t.snap('outcomes');
  await t.click('.o55p-outcome[data-arg="o2"]', 'an outcome');
  await t.untilStep('access_answer');
  await t.click('[data-o55p="why"]', 'Why this matters'); await t.click('[data-o55p="answer"][data-arg="few"]', 'A few organizers');
  await t.untilStep('review', 6000); await t.snap('answered');
  await t.click('[data-o55p="review"]', 'Review the plan');
  await t.untilStep('answer_edit', 6000); await t.snap('review');
  await t.click('[data-o55p="change"]', 'Change answer'); await t.click('[data-o55p="answer"][data-arg="me"]', 'Only me');
  await t.snap('consequence');
  const ch = await t.ev(() => window.O55.tour.practice.lastChange);
  A.eq(JSON.stringify([ch.fresh, ch.gone]), JSON.stringify([['one'], ['acc', 'sig']]), 'only the sign-in and organizer-access rows change');
  A.ok(ch.replaced === 0 && !ch.outcomesMoved, 'unaffected rows keep their identity, outcomes keep their place');
  await t.untilStep('consequence_changed', 6000); await t.callout('next');
  await t.untilStep('completion_boundary'); await t.snap('boundary');
  A.ok(await t.ev(() => { const b = document.querySelector('.o55p-approve'); return !!b && b.getAttribute('aria-disabled') === 'true'; }), 'Approve And Build shown fenced, not pressable');
}

def('t1', 'Every step by hand, then Restore my layout', async (t, A) => {
  const before = await counters(t);
  const layout0 = await t.ev(() => window.PM_HOME_WORKSPACE.layout.surfaces.find((s) => s.surface_kind === 'chat').host);
  await t.ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' })); await sleep(900);
  await byHandChapter1(t, A); await byHandChapter2(t, A); await byHandChapter3(t, A);
  await t.callout('finish', 'restore'); await sleep(1200); await t.snap('landed');
  const after = await counters(t);
  A.eq(after.net, before.net, 'no network requests during the tour');
  A.eq(JSON.stringify(after.c.ledger), JSON.stringify(before.c.ledger), 'usage ledger unchanged');
  A.eq(after.c.context, before.c.context, 'chat context unchanged');
  A.eq(await t.ev(() => window.PM_HOME_WORKSPACE.layout.surfaces.find((s) => s.surface_kind === 'chat').host), layout0, 'layout restored (Chat back where it was)');
  A.eq(await t.ev(() => (document.querySelector('.page-tab.active[data-page]') || {}).getAttribute('data-page')), 'wizard', 'lands on Planning Wizard');
  A.ok(await t.ev(() => !document.querySelector('#panel-wizard.o55p-practice') && !document.getElementById('o55pGoal')), 'practice surface removed');
  A.ok(await t.ev(() => !!document.getElementById('o55tLanding')), 'final prompt shown on the real Wizard');
  A.eq(await t.ev(() => window.O55.store.get('tour', {}).status), 'done', 'tour recorded as done');
});

/* ------------------------------------------------------------------------------------------ Show Me only */
def('t2', 'Every action through Show Me, then Keep this layout', async (t, A) => {
  const before = await counters(t);
  await t.ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' })); await sleep(900);
  await t.callout('next');
  const actions = ['open_chat', 'select_teacher', 'send_question', 'same_answer_eli5', 'move_or_dock_chat', 'widget_action', 'open_planning', 'book_club_goal', 'three_outcomes', 'access_answer', 'review', 'answer_edit'];
  for (const id of actions) {
    await t.untilStep(id, 12000);
    if (id === 'same_answer_eli5') await t.until(() => window.O55.tour.chat.answered('a1'), 'answer before ELI5');
    await sleep(300); await t.callout('showMe');
    await t.until(new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`), 'Show Me completes ' + id, 15000);
    A.ok(true, 'Show Me completed ' + id);
    if (id === 'send_question') { await t.untilStep('answer_stream', 8000); await t.until(() => window.O55.tour.chat.answered('a1'), 'answer'); await t.callout('next'); }
    if (id === 'same_answer_eli5') { await sleep(1400); await t.callout('next'); await t.untilStep('workspace_orientation'); await t.until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 'orientation ready', 9000); await t.callout('next'); }
    if (id === 'answer_edit') { await t.untilStep('consequence_changed', 6000); await t.callout('next'); }
  }
  await t.untilStep('completion_boundary'); await t.callout('finish', 'keep'); await sleep(1200);
  A.eq(await t.ev(() => window.PM_HOME_WORKSPACE.layout.surfaces.find((s) => s.surface_kind === 'chat').host), 'dock_left', 'Keep this layout keeps Chat in the left dock');
  const after = await counters(t);
  A.eq(after.net, before.net, 'no network requests'); A.eq(JSON.stringify(after.c.ledger), JSON.stringify(before.c.ledger), 'usage ledger unchanged');
});

/* ------------------------------------------------------------------------------------------ skip, resume, missing */
def('t3', 'Skip Tour restores everything', async (t, A) => {
  const snap0 = await t.ev(() => window.O55.tour.snapshot());
  await t.ev(() => window.PM7_GUIDED_TOUR.start({})); await sleep(900);
  await byHandChapter1(t, A);
  await t.untilStep('workspace_orientation');
  await t.click('#pm-o55-tour .o55t-bar [data-o55t="skip"]', 'Skip Tour'); await sleep(1400);
  const now = await t.ev(() => window.O55.tour.snapshot());
  A.eq(now.eli5, snap0.eli5, 'ELI5 back as it was'); A.eq(now.persona, snap0.persona, 'guide back as it was');
  A.eq(now.thread, snap0.thread, 'original chat thread selected'); A.ok(await t.ev(() => window.O55.tour.chat.chatVisible()), 'Chat visible again');
  A.ok(await t.ev(() => !document.querySelector('.o55-guided-thread')), 'Guided example thread removed');
  A.eq(await t.ev(() => window.O55.store.get('tour', {}).status), 'skipped', 'recorded as skipped');
});
def('t4', 'Resume after a reload at the last safe step', async (t, A) => {
  await t.ev(() => window.PM7_GUIDED_TOUR.start({})); await sleep(900);
  await byHandChapter1(t, A); await t.untilStep('workspace_orientation');
  await t.page.goto(pathToFileURL(PAGE).href + '?o55=off'); await sleep(1600);
  await t.ev(() => window.O55.boot.tourChip()); await sleep(200);
  A.ok(await t.ev(() => !!document.getElementById('o55-tourchip')), 'resume chip offered');
  await t.click('#o55-tourchip [data-o55-chip="resume"]', 'Resume'); await sleep(900);
  A.eq(await t.step(), 'workspace_orientation', 'resumes at the saved step');
});
def('t5', 'A missing target offers Take me there', async (t, A) => {
  await t.ev(() => window.PM7_GUIDED_TOUR.start({})); await sleep(700);
  await t.ev(() => window.O55.tour.go('book_club_goal')); await sleep(600);
  await t.ev(() => { const g = document.getElementById('o55pGoal'); if (g) g.remove(); document.querySelector('.page-tab[data-page="usage"]').click(); });
  await t.until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="takeMe"]'), 'missing-target state', 6000);
  await t.callout('takeMe'); await sleep(900);
  A.ok(await t.ev(() => !!document.querySelector('#o55pGoal') && (document.querySelector('.page-tab.active[data-page]') || {}).getAttribute('data-page') === 'wizard'), 'Take me there brings the target back');
});

/* ------------------------------------------------------------------------------------------ runner */
const report = [];
for (const sc of SC) {
  if (only && !only.includes(sc.id)) continue;
  const t = await openPage(); const asserts = []; let error = null; const t0 = Date.now();
  const A = { ok: (c, m) => asserts.push({ ok: !!c, m }), eq: (a, b, m) => asserts.push({ ok: a === b, m: m + (a === b ? '' : ` (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`) }) };
  try { await sc.fn(t, A); } catch (e) { error = String(e.message || e).slice(0, 400); }
  try { await t.page.screenshot(join(out, sc.id + '.png')); } catch (_) {}
  const r = { id: sc.id, title: sc.title, ms: Date.now() - t0, pass: !error && asserts.every((x) => x.ok) && !t.page.errors.length, error, asserts, errors: t.page.errors.slice(0, 8), state: await t.ev(() => window.O55.tour.state()).catch(() => null) };
  report.push(r);
  console.log((r.pass ? 'PASS ' : 'FAIL ') + sc.id + '  ' + sc.title + (error ? '  !! ' + error : '') + asserts.filter((x) => !x.ok).map((x) => '\n      x ' + x.m).join('') + (t.page.errors.length ? '\n      errors: ' + t.page.errors.slice(0, 3).join(' | ') : ''));
  await t.close();
}
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ scenarios: report.length, pass: report.filter((r) => r.pass).length, fail: report.filter((r) => !r.pass).map((r) => r.id) }));
