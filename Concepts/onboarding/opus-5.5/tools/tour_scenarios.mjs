/* Guided Tour acceptance, driven by real CDP input against the built concept.
 * node tools/tour_scenarios.mjs <out-dir> [--only t1,t2] [--theme basic-dark] [--snaps] [--page <path>] [--coverage <file>]
 * t1 every step by hand (real clicks, a real mouse drag) then Restore; t2 every action through Show Me then Keep;
 * t3 Skip restores everything; t4 a reload resumes from the saved basis and Skip still restores; t5 a missing target offers Take me there; t6 Back rewinds a
 * step so it can be done again or watched with Show Me; t7 Run Onboarding Again (and a replay) start the tour over.
 * Each run asserts zero network requests and unchanged usage counters, and writes report.json + screenshots. */
import { launch, sleep } from './chrome.mjs';
import { takeCoverageFlag } from './coverage_union.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
/* Remove a run's Chrome profile (~150 MB). The helper's close() kills Chrome without waiting, and Chrome's helpers
   keep writing for a moment, so wait for the exit, then retry the removal; cleanup never fails the run. */
const dropProfile = async (dir, chrome) => {
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) await new Promise((r) => { chrome.once('exit', r); setTimeout(r, 3000); });
  for (let i = 0; i < 25; i++) { try { rmSync(dir, { recursive: true, force: true }); return; } catch (_) { await new Promise((r) => setTimeout(r, 200)); } }
};

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const coverageFile = takeCoverageFlag(argv);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/tour');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const PAGE = resolve(opt('page', resolve(here, '../../../PMConcept7.html')));
const only = opt('only', '') ? opt('only', '').split(',') : null;
const theme = opt('theme', 'basic-dark');
const snaps = argv.includes('--snaps');
mkdirSync(out, { recursive: true });
/* Each scenario starts with an independent owner layout and Chat state. A Keep result from an earlier
 * scenario must not change a later scenario's restoration basis. Profiles are removed after each case. */
const PROFILE_BASE = `${tmpdir()}/pm-cdp-profile-${process.pid}-tour`;

async function openPage(profile) {
  const { page, close, chrome } = await launch({ width: 1600, height: 1000, profile, coverageFile });
  const [fam, mode] = theme.split('-');
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
  await page.goto(pathToFileURL(PAGE).href + '?o55=off');
  await sleep(1200);
  await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); localStorage.removeItem('pm.o55.tour.v1'); }, fam, mode);
  /* two invariants watched for the whole run: no raw copy key ever shows in the tour, and once the callout and the
     spotlight have settled the callout covers no part of the target and stays inside the window */
  await page.evaluate(() => {
    window.__o55raw = []; window.__o55cover = {}; window.__o55clicks = [];
    /* the last trusted clicks, for diagnosing a click that did not land */
    window.addEventListener('click', (e) => { if (!e.isTrusted) return; const el = e.target; window.__o55clicks.push(`${Math.round(e.clientX)},${Math.round(e.clientY)} ${(el.getAttribute && (el.getAttribute('data-o55t') || el.id || el.className) || el.tagName).toString().slice(0, 50)} @${window.O55 && window.O55.tour.state().step}`); if (window.__o55clicks.length > 24) window.__o55clicks.shift(); }, true);
    const re = /\b(?:tour|wizard|teacher)\.[a-z_]+\.[A-Za-z_.]+/;
    let pending = 0;
    const scan = () => { pending = 0; const r = document.getElementById('pm-o55-tour'); if (!r || r.hidden) return; const m = r.innerText.match(re); if (m && !window.__o55raw.includes(m[0])) window.__o55raw.push(m[0]); };
    new MutationObserver(() => { if (!pending) pending = setTimeout(scan, 200); }).observe(document.body, { subtree: true, childList: true, characterData: true });
    setInterval(() => {
      const TR = window.O55 && window.O55.tour; if (!TR || !TR.running) return;
      const st = TR.st, h = st && (st.dest || st.hole); if (!st || !st.step || !h || !st.cpos) return;
      const c = document.querySelector('#pm-o55-tour .o55t-callout'); if (!c) return;
      const a = c.getBoundingClientRect();
      if (Math.abs(a.left - st.cpos.x) > 2 || Math.abs(a.top - st.cpos.y) > 2) return; /* still gliding */
      /* while a tab is carried the guide steps back on purpose (the callout fades and holds still, the spotlight opens
         onto every edge the tab can land on), so the carry is not sampled */
      if (document.body.classList.contains('pm-home-dragging')) return;
      const ix = Math.max(0, Math.min(a.right, h.x + h.w) - Math.max(a.left, h.x)), iy = Math.max(0, Math.min(a.bottom, h.y + h.h) - Math.max(a.top, h.y));
      const rec = window.__o55cover[st.step.id] || (window.__o55cover[st.step.id] = { n: 0, bad: 0, out: 0, max: 0, multi: !!st.step.avoid });
      rec.n++;
      if (ix * iy > 300 && ix * iy > 0.02 * h.w * h.h) { rec.bad++; rec.max = Math.max(rec.max, Math.round((ix * iy) / (h.w * h.h) * 100)); if (!rec.first) rec.first = { hole: [h.x, h.y, h.w, h.h].map(Math.round), callout: [a.left, a.top, a.width, a.height].map(Math.round), side: st.side, W: innerWidth, H: innerHeight, page: (document.querySelector('.page-tab.active[data-page]') || {}).id || '', drag: document.body.classList.contains('pm-home-dragging') }; }
      if (a.left < 0 || a.top < 0 || a.right > innerWidth || a.bottom > innerHeight) rec.out++;
    }, 250);
  });
  let n = 0;
  const t = {
    page, close, chrome,
    ev: (fn, ...a) => page.evaluate(fn, ...a),
    step: () => page.evaluate(() => window.O55.tour.state().step),
    async until(fn, what, timeout = 12000) { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await page.evaluate(fn)) return true; await sleep(150); } throw new Error('timeout: ' + what + ' (step ' + await t.step() + ')'); },
    async untilStep(id, timeout = 9000) {
      // The step changes before enter() finishes; its previous callout can still expose the same controls.
      return t.until(new Function(`const st = window.O55.tour.st, c = document.querySelector('#pm-o55-tour .o55t-callout'); return !!(st.step && st.step.id === ${JSON.stringify(id)} && !st.entering && c && c.getAttribute('data-step') === ${JSON.stringify(id)})`), 'step ' + id, timeout);
    },
    /* a real mouse click at an element's centre */
    /* like a person: wait until the control has stopped moving and nothing covers it, then click its centre */
    async click(sel, what) {
      /* a control inside the tour callout counts as still only once the callout has arrived where it was placed: its
         slide can start a frame or two late when the page is busy, and two probes inside one frame read as still */
      const probe = (s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length && e.getBoundingClientRect().width > 0); if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const top = document.elementFromPoint(x, y); const co = el.closest('#pm-o55-tour .o55t-callout'), st = window.O55 && window.O55.tour.st; let arrived = true; if (co && st && st.cpos) { const cr = co.getBoundingClientRect(); arrived = Math.abs(cr.left - st.cpos.x) < 1 && Math.abs(cr.top - st.cpos.y) < 1; } return { x, y, w: r.width, h: r.height, arrived, hit: !!top && (top === el || el.contains(top)), over: top ? (top.id || top.className || top.tagName).toString().slice(0, 60) : '' }; };
      const t0 = Date.now(); let c = null, prev = null;
      while (Date.now() - t0 < 4000) {
        c = await page.evaluate(probe, sel);
        if (c && prev && c.hit && c.arrived && Math.abs(c.x - prev.x) < 0.5 && Math.abs(c.y - prev.y) < 0.5 && Math.abs(c.w - prev.w) < 0.5) break;
        prev = c; await sleep(60);
      }
      if (!c) throw new Error('no element ' + (what || sel) + ' at step ' + await t.step());
      if (!c.hit) throw new Error((what || sel) + ' is covered by ' + c.over + ' at step ' + await t.step());
      await page.mouse(c.x, c.y); await sleep(350);
    },
    /* like a person: the callout's controls are used once the step has arrived and its callout has been drawn */
    async callout(action, arg) {
      await t.until(() => !(window.O55.tour.st && window.O55.tour.st.entering), 'the step has settled', 9000);
      await t.click(`#pm-o55-tour .o55t-callout [data-o55t="${action}"]${arg ? `[data-arg="${arg}"]` : ''}`, 'callout ' + action);
    },
    /* a real mouse drag from an element to a point */
    async drag(sel, to) {
      /* like a person: wait until the grip has stopped moving (a new widget scrolls into view), then take hold of it */
      let a = null, prev = null; const t0 = Date.now();
      while (Date.now() - t0 < 4000) {
        a = await page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length); if (!el) return null; const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return { x, y, hit: !!top && (top === el || el.contains(top)) }; }, sel);
        if (a && prev && a.hit && Math.abs(a.x - prev.x) < 0.5 && Math.abs(a.y - prev.y) < 0.5) break;
        prev = a; await sleep(80);
      }
      if (!a || !a.hit) throw new Error('cannot take hold of ' + sel + ' at step ' + await t.step());
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
  await t.until(() => !window.O55.tour.st.entering && !!window.O55.tour.chat.personaBtn(), 'Teacher picker ready');
  await t.click('.pm6-chat-personabtn', 'persona picker');
  await t.until(() => !!window.O55.tour.chat.personaItem('Teacher'), 'Teacher choice ready');
  await t.click('.pm6-chat-personaitem[data-persona="Teacher"]', 'Teacher');
  await t.untilStep('send_question'); await t.snap('send_question');
  await t.callout('fillQuestion'); await t.click('#chatPanel .pm6-chat-send', 'Send');
  await t.untilStep('answer_stream');
  await t.until(() => window.O55.tour.chat.answered('a1'), 'answer streamed'); await sleep(400); await t.snap('answer');
  A.ok(await t.ev(() => { const el = window.O55.tour.chat.lastAnswerEl(); return !!el && /Guided example/.test(el.textContent) && !/Est\. Cost|Tokens/.test(el.textContent); }), 'answer labelled Guided example, no token or cost line');
  await t.callout('next');
  await t.untilStep('same_answer_eli5');
  /* DL-126: Explain this reply simply adds ONE simpler reply under the example answer, which is never rewritten; the
     quick ELI5 switch by the message box changes only replies written after it */
  A.ok(await t.ev(() => !document.querySelector('#chatPanel .toggle-eli5.active')), 'the example chat starts with ELI5 off');
  await t.until(() => { const c = window.O55.tour.chat, b = c.explainBtn(c.midFor('a1')); return !!b && b.getAttribute('aria-disabled') === 'false'; }, 'Explain this reply simply ready');
  await t.click('#chatPanel [data-o55-explain]', 'Explain this reply simply');
  await t.until(() => window.O55.tour.state().done.includes('same_answer_eli5'), 'one simpler reply'); await sleep(1300); await t.snap('eli5');
  const replies = () => t.ev(() => [...document.querySelectorAll('#chatPanel .pm6-chat-msg.assistant')].filter((m) => m.getClientRects().length).map((m) => (m.querySelector('.pm6-chat-sink') || {}).textContent.trim()));
  const two = await replies();
  A.eq(two.length, 2, 'exactly one extra reply: the example answer and its simpler reply');
  A.ok(/^Before work begins, Puppet Master turns your request into a plan\./.test(two[0] || ''), 'the example answer is unchanged');
  A.ok(/^First, Puppet Master writes down/.test(two[1] || ''), 'the simpler reply sits directly under it');
  A.ok(await t.ev(() => { const c = window.O55.tour.chat, x = c.simplerFor(c.midFor('a1')), el = x && document.querySelector(`#chatPanel [data-pm6-mid="${x}"] .o55-explains`); return !!el && /Simpler explanation of the reply above/.test(el.textContent); }), 'the simpler reply says what it is');
  A.ok(await t.ev(() => !document.querySelector('#chatPanel [data-o55-explain]') && !document.querySelector('#chatPanel .toggle-eli5.active')), 'Explain leaves once used, and the chat ELI5 did not change');
  await t.until(() => { const h = window.O55.tour.st.hole, el = window.O55.tour.chat.eli5Btn(); if (!h || !el) return false; const r = el.getBoundingClientRect(); return h.x <= r.left && h.y <= r.top && h.x + h.w >= r.right && h.y + h.h >= r.bottom && h.w < r.width + 40; }, 'the spotlight moves to the quick ELI5 switch');
  await t.click('span.chat-toggle-btn.toggle-eli5', 'quick ELI5'); await sleep(500);
  A.eq(JSON.stringify(await replies()), JSON.stringify(two), 'switching ELI5 rewrites no reply');
  await t.callout('askProject'); await t.until(() => window.O55.tour.chat.answered('a2'), 'a later reply'); await sleep(400);
  const three = await replies();
  A.eq(JSON.stringify(three.slice(0, 2)), JSON.stringify(two), 'earlier replies stay as they were');
  A.ok(/^A Project is one workspace/.test(three[2] || ''), 'the reply written after the switch is simple');
  A.ok(await t.ev(() => !document.querySelector('#chatPanel [data-o55-explain]')), 'a reply written simple offers no Explain');
  await t.snap('eli5_later');
  await t.callout('next');
}
/* the panels' tour hooks (home-redesign src/panels/js/52-tour.js) name what each workspace step points at; the test
   tags that element and then uses it like a person (a real click, a real drag, the keyboard) */
const tag = (t, hook, name) => t.ev((h, n) => { document.querySelectorAll(`[data-o55-test="${n}"]`).forEach((x) => x.removeAttribute('data-o55-test')); const el = window.PMW.tour[h](); if (el) el.setAttribute('data-o55-test', n); return !!el; }, hook, name);
const panelsState = (t) => t.ev(() => ({ tabs: window.PM_HOME.tabs().map((x) => x.tabId).sort().join('|'), panels: window.PM_HOME.panels().length }));
const homeBoard = (t) => t.ev(() => { const b = window.PMW.dashboard.board('home'); return b ? b.visible().slice().sort().join('|') : null; });
async function byHandChapter2(t, A) {
  await t.untilStep('workspace_orientation'); await t.until(() => !document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"][aria-disabled]') && !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 'orientation ready', 9000); await t.callout('next');
  /* open something from +: the panel's + button, then a row of its menu */
  await t.untilStep('open_from_plus'); await t.snap('plus');
  const tabs0 = (await panelsState(t)).tabs;
  await t.until(() => !!window.PMW.tour.plusButton(), 'the + button'); await tag(t, 'plusButton', 'plus');
  await t.click('[data-o55-test="plus"]', '+');
  await t.until(() => !!window.PMW.tour.plusRow(), 'the + menu'); await tag(t, 'plusRow', 'plusrow');
  await t.click('[data-o55-test="plusrow"]', 'a + menu row');
  await t.untilStep('open_file_from_rail', 8000);
  A.ok((await panelsState(t)).tabs !== tabs0, 'the + menu opened a new tab');
  /* open a file from the rail's Files list */
  await t.until(() => !!window.PMW.tour.fileRow(), 'a file row'); await tag(t, 'fileRow', 'file'); await t.snap('file');
  await t.click('[data-o55-test="file"]', 'a file in the Files list');
  await t.untilStep('split_by_drag', 8000);
  A.ok(await t.ev(() => window.PM_HOME.tabs().some((x) => x.kind === 'editor' && x.active)), 'the file opened in an editor tab');
  /* split by dragging the tab to a panel edge: a real mouse drag */
  const panels0 = (await panelsState(t)).panels;
  await t.until(() => !!window.PMW.tour.splitDrag(), 'a tab to split'); await t.snap('split');
  const to = await t.ev(() => { const d = window.PMW.tour.splitDrag(); document.querySelectorAll('[data-o55-test="splittab"]').forEach((x) => x.removeAttribute('data-o55-test')); d.el.setAttribute('data-o55-test', 'splittab'); return d.to; });
  await t.drag('[data-o55-test="splittab"]', to);
  await t.untilStep('widget_action', 8000);
  A.ok((await panelsState(t)).panels > panels0, 'the drag split the panel');
  /* add Upcoming resets to the Home dashboard from Add widget, then move it up (the board's keyboard move) */
  await t.until(() => !!window.PMW.tour.widgetAddButton(), 'Add widget'); await tag(t, 'widgetAddButton', 'addw');
  A.ok(!(await homeBoard(t) || '').split('|').includes('ov-resets'), 'the Home board starts without Upcoming resets');
  await t.click('[data-o55-test="addw"]', 'Add widget');
  await t.until(() => { const m = window.PMW.menu.current; return !!(m && [...m.el.querySelectorAll('.pmw-mitem')].some((x) => x._pmwRow && x._pmwRow.id === 'w-ov-resets')); }, 'the widget list');
  await t.ev(() => { const it = [...window.PMW.menu.current.el.querySelectorAll('.pmw-mitem')].find((x) => x._pmwRow && x._pmwRow.id === 'w-ov-resets'); it.scrollIntoView({ block: 'nearest' }); it.setAttribute('data-o55-test', 'resets'); });
  await t.click('[data-o55-test="resets"]', 'Upcoming resets');
  await t.until(() => (window.PMW.dashboard.board('home').visible() || []).includes('ov-resets'), 'Upcoming resets added', 4000);
  A.ok(!(await t.ev(() => window.O55.tour.state().done.includes('widget_action'))), 'adding alone does not finish the widget step');
  const y0 = await t.ev(() => window.PMW.dashboard.board('home').rect('ov-resets').y);
  await t.ev(() => { const c = window.PMW.dashboard.board('home').card('ov-resets'); c.focus({ preventScroll: true }); });
  await t.page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'm', code: 'KeyM', text: 'm', windowsVirtualKeyCode: 77 }); await t.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'm', code: 'KeyM', windowsVirtualKeyCode: 77 }); await sleep(250);
  for (let i = 0; i < 4; i++) { await t.page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 }); await t.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 }); await sleep(160); }
  await t.page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await t.page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await t.untilStep('open_planning', 8000); await t.snap('widget');
  A.ok(await t.ev((y) => window.PMW.dashboard.board('home').rect('ov-resets').y < y, y0), 'Upcoming resets moved up');
}
const reviewPartsReady = () => {
  const st = window.O55.tour.st;
  return st.step.id === 'review_parts' && !st.entering && st.partsDone === true && !!document.querySelector('#pm-o55-tour .o55t-callout[data-step="review_parts"] [data-o55t="next"]');
};
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
  await t.untilStep('review_parts', 6000);
  await t.until(reviewPartsReady, 'the plan read part by part', 20000);
  A.ok(await t.ev(() => window.O55.tour.st.partsDone === true), 'the review glides over every part of the plan before Next');
  await t.callout('next');
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
  const panels0 = await panelsState(t);
  await t.ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' })); await sleep(900);
  await byHandChapter1(t, A);
  const board0 = await homeBoard(t);
  await byHandChapter2(t, A); await byHandChapter3(t, A);
  await t.callout('finish', 'restore'); await sleep(1200); await t.snap('landed');
  const after = await counters(t);
  A.eq(after.net, before.net, 'no network requests during the tour');
  A.eq(JSON.stringify(after.c.ledger), JSON.stringify(before.c.ledger), 'usage ledger unchanged');
  A.eq(after.c.context, before.c.context, 'chat context unchanged');
  A.eq(await t.ev(() => window.PM_HOME_WORKSPACE.layout.surfaces.find((s) => s.surface_kind === 'chat').host), layout0, 'layout restored (Chat back where it was)');
  A.eq(JSON.stringify(await panelsState(t)), JSON.stringify(panels0), 'panels restored (the tabs the tour opened gone, the split joined)');
  A.eq(await homeBoard(t), board0, 'the Home dashboard restored (Upcoming resets as it was)');
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
  const actions = ['open_chat', 'select_teacher', 'send_question', 'same_answer_eli5', 'open_from_plus', 'open_file_from_rail', 'split_by_drag', 'widget_action', 'open_planning', 'book_club_goal', 'three_outcomes', 'access_answer', 'review', 'answer_edit'];
  for (const id of actions) {
    await t.untilStep(id, 12000);
    if (id === 'same_answer_eli5') await t.until(() => window.O55.tour.chat.answered('a1'), 'answer before ELI5');
    await sleep(300); await t.callout('showMe');
    await t.until(new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`), 'Show Me completes ' + id, 15000);
    A.ok(true, 'Show Me completed ' + id);
    if (id === 'send_question') { await t.untilStep('answer_stream', 8000); await t.until(() => window.O55.tour.chat.answered('a1'), 'answer'); await t.callout('next'); }
    if (id === 'same_answer_eli5') { await sleep(1400); await t.callout('next'); await t.untilStep('workspace_orientation'); await t.until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 'orientation ready', 9000); await t.callout('next'); }
    if (id === 'review') { await t.untilStep('review_parts', 8000); await t.until(reviewPartsReady, 'plan read part by part', 20000); await t.callout('next'); }
    if (id === 'answer_edit') { await t.untilStep('consequence_changed', 6000); await t.callout('next'); }
  }
  const kept = await t.ev(() => ({ panels: window.PM_HOME.panels().length, editors: window.PM_HOME.tabs().filter((x) => x.kind === 'editor').length }));
  await t.untilStep('completion_boundary'); await t.callout('finish', 'keep'); await sleep(1200);
  A.eq(JSON.stringify(await t.ev(() => ({ panels: window.PM_HOME.panels().length, editors: window.PM_HOME.tabs().filter((x) => x.kind === 'editor').length }))), JSON.stringify(kept), 'Keep this layout keeps the panels as Show Me left them (the split, the opened tabs)');
  A.ok(await t.ev(() => { const b = window.PMW.dashboard.board('home'); return b.visible().includes('ov-resets') && b.rect('ov-resets').y === 0; }), 'Keep this layout keeps Upcoming resets at the top of the Home dashboard, where Show Me placed it');
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
def('t4', 'A reload resumes from the saved basis, and Skip still restores', async (t, A) => {
  await t.ev(() => window.PM7_GUIDED_TOUR.start({})); await sleep(900);
  await byHandChapter1(t, A); await t.untilStep('workspace_orientation');
  const before = await t.ev(() => window.O55.tour.defs.findIndex((d) => d.id === window.O55.tour.state().step));
  await t.page.goto(pathToFileURL(PAGE).href + '?o55=off'); await sleep(1600);
  A.ok(await t.ev(() => { const s = JSON.stringify(window.O55.store.get('tour', {})); return !s.includes('draft') && !s.includes('layout') && s.includes('snapshot_ref'); }), 'bounded checkpoint holds refs only');
  A.ok(await t.ev(() => { const b = JSON.parse(localStorage.getItem('pm.o55.tour-basis.v1') || 'null'); return !!(b && b.snap && b.snap.layout && !('draft' in b.snap)); }), 'layout basis kept without the draft');
  await t.ev(() => window.O55.boot.tourChip()); await sleep(200);
  A.ok(await t.ev(() => !!document.getElementById('o55-tourchip')), 'resume chip offered');
  await t.click('#o55-tourchip [data-o55-chip="resume"]', 'Resume'); await sleep(1400);
  A.ok(await t.ev(() => window.O55.tour.running), 'the tour resumes');
  A.ok(await t.ev(() => !document.getElementById('o55-tour-recovery')), 'no recovery panel');
  const at = await t.ev(() => window.O55.tour.defs.findIndex((d) => d.id === window.O55.tour.state().step));
  A.ok(at >= 0 && at <= before, `resumes at or before the saved step (${at} <= ${before})`);
  await t.ev(() => window.O55.tour.skip()); await sleep(1400);
  A.eq(await t.ev(() => window.O55.store.get('tour', {}).status), 'skipped', 'Skip after a reload restores and completes');
  A.ok(await t.ev(() => !localStorage.getItem('pm.o55.tour-basis.v1')), 'basis removed once used');
});
def('t5', 'A missing target offers Take me there', async (t, A) => {
  await t.ev(() => window.PM7_GUIDED_TOUR.start({})); await sleep(700);
  await t.ev(() => window.O55.tour.go('book_club_goal')); await sleep(600);
  await t.ev(() => { const g = document.getElementById('o55pGoal'); if (g) g.remove(); document.querySelector('.page-tab[data-page="usage"]').click(); });
  await t.until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="takeMe"]'), 'missing-target state', 6000);
  await t.callout('takeMe'); await sleep(900);
  A.ok(await t.ev(() => !!document.querySelector('#o55pGoal') && (document.querySelector('.page-tab.active[data-page]') || {}).getAttribute('data-page') === 'wizard'), 'Take me there brings the target back');
});

/* ------------------------------------------------------------------------------------------ Back, starting over */
const done = (id) => new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`);
/* Show Me is offered once the step's callout is drawn (on a loaded machine that can take a few seconds) */
const showMeOffered = (t) => t.until(() => !(window.O55.tour.st && window.O55.tour.st.entering) && !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="showMe"]'), 'Show Me offered', 4000).then(() => true, () => false);
def('t6', 'Back rewinds a step, so it can be done again or watched with Show Me', async (t, A) => {
  const before = await counters(t);
  const persona0 = await t.ev(() => window.O55.tour.snapshot().persona);
  await t.ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' })); await sleep(900);
  await t.callout('next');
  /* open Chat by hand, then Back: Chat is tucked away again and Show Me opens it */
  await t.untilStep('open_chat'); await t.click('#activityBar .icon[data-ab-id="chat"]', 'Chat icon');
  await t.untilStep('select_teacher'); await t.callout('back'); await t.untilStep('open_chat'); await sleep(400);
  A.ok(!(await t.ev(done('open_chat'))), 'Back: Open Chat is not done any more');
  A.ok(!(await t.ev(() => window.O55.tour.chat.chatVisible())), 'Back: Chat is tucked away again');
  A.ok(await showMeOffered(t), 'Back: Show Me is offered on Open Chat');
  await t.callout('showMe'); await t.untilStep('select_teacher', 12000);
  /* choose Teacher by hand, then Back: the guide is what it was, and Show Me chooses Teacher */
  /* the same waits as t1: the step's entrance and the picker's list take a moment after Show Me hands back */
  await t.until(() => !window.O55.tour.st.entering && !!window.O55.tour.chat.personaBtn(), 'Teacher picker ready');
  await t.click('.pm6-chat-personabtn', 'persona picker');
  await t.until(() => !!window.O55.tour.chat.personaItem('Teacher'), 'Teacher choice ready');
  await t.click('.pm6-chat-personaitem[data-persona="Teacher"]', 'Teacher');
  await t.untilStep('send_question'); await t.callout('back'); await t.untilStep('select_teacher'); await sleep(500);
  A.eq(await t.ev(() => window.O55.tour.chat.persona()), persona0, 'Back: the guide is ' + persona0 + ' again');
  A.ok(await showMeOffered(t), 'Back: Show Me is offered on Choose Teacher');
  await t.callout('showMe'); await t.untilStep('send_question', 12000);
  /* send, read the answer, ask for the simpler reply; Back: the simpler reply is gone and Explain is offered again, the
     answer as it was; Back again: the exchange is gone */
  await t.callout('fillQuestion'); await t.click('#chatPanel .pm6-chat-send', 'Send');
  await t.untilStep('answer_stream'); await t.until(() => window.O55.tour.chat.answered('a1'), 'answer'); await t.callout('next');
  await t.untilStep('same_answer_eli5');
  await t.until(() => { const c = window.O55.tour.chat, b = c.explainBtn(c.midFor('a1')); return !!b && b.getAttribute('aria-disabled') === 'false'; }, 'Explain ready');
  await t.click('#chatPanel [data-o55-explain]', 'Explain this reply simply');
  await t.until(done('same_answer_eli5'), 'one simpler reply'); await sleep(1400);
  await t.callout('back'); await t.untilStep('answer_stream'); await sleep(1600);
  A.eq(await t.ev(() => [...document.querySelectorAll('#chatPanel .pm6-chat-msg.assistant')].filter((m) => m.getClientRects().length).length), 1, 'Back: the simpler reply is gone');
  A.ok(await t.ev(() => { const c = window.O55.tour.chat, el = document.querySelector(`#chatPanel [data-pm6-mid="${c.midFor('a1')}"] .pm6-chat-sink`); return !!el && /^Before work begins/.test(el.textContent.trim()) && !!c.explainBtn(c.midFor('a1')); }), 'Back: the answer is as it was and Explain is offered again');
  await t.callout('back'); await t.untilStep('send_question'); await sleep(500);
  A.eq(await t.ev(() => [...document.querySelectorAll('#chatPanel .pm6-chat-msg')].filter((m) => m.getClientRects().length).length), 0, 'Back: the question and its answer are gone from the Guided example');
  A.ok(!(await t.ev(done('send_question'))) && (await showMeOffered(t)), 'Back: the question is not counted as sent, and Show Me is offered');
  await t.callout('showMe'); await t.untilStep('answer_stream', 12000); await t.until(() => window.O55.tour.chat.answered('a1'), 'answer again'); await t.callout('next');
  await t.untilStep('same_answer_eli5'); await t.callout('showMe'); await t.until(done('same_answer_eli5'), 'ELI5 through Show Me'); await sleep(1400); await t.callout('next');
  /* open from +, open a file and split through Show Me, then Back from the widget step: the panels are back as they
     were before the split, and Show Me splits again */
  await t.untilStep('workspace_orientation'); await t.until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]:not([aria-disabled])'), 'orientation ready', 9000); await t.callout('next');
  await t.untilStep('open_from_plus'); await t.callout('showMe'); await t.untilStep('open_file_from_rail', 15000);
  await t.callout('showMe'); await t.untilStep('split_by_drag', 15000);
  const split0 = await panelsState(t);
  await t.callout('showMe'); await t.untilStep('widget_action', 15000);
  A.ok((await panelsState(t)).panels > split0.panels, 'Show Me split the panel');
  await t.callout('back'); await t.untilStep('split_by_drag'); await sleep(600);
  A.eq(JSON.stringify(await panelsState(t)), JSON.stringify(split0), 'Back: the panels are as they were before the split');
  A.ok(!(await t.ev(done('split_by_drag'))) && (await showMeOffered(t)), 'Back: the split is not counted, and Show Me is offered');
  await t.callout('showMe'); await t.untilStep('widget_action', 15000);
  /* add and move the widget through Show Me, then Back from Planning: it is gone from the Home board, Show Me adds it again */
  await showMeOffered(t);
  const board0 = await homeBoard(t);
  await t.callout('showMe'); await t.untilStep('open_planning', 20000);
  await t.callout('back'); await t.untilStep('widget_action'); await sleep(800);
  A.eq(await homeBoard(t), board0, 'Back: Upcoming resets is gone from the Home dashboard');
  await t.callout('showMe'); await t.untilStep('open_planning', 20000);
  /* planning: use the goal, open an outcome; Back twice: no outcome open, then no practice and the goal offered again */
  await t.callout('showMe'); await t.untilStep('book_club_goal', 12000);
  await t.callout('showMe'); await t.untilStep('three_outcomes', 12000);
  await t.callout('showMe'); await t.untilStep('access_answer', 12000);
  await t.callout('back'); await t.untilStep('three_outcomes'); await sleep(400);
  A.ok(await t.ev(() => window.O55.tour.practice.outcome == null) && (await showMeOffered(t)), 'Back: no outcome is open, and Show Me is offered');
  await t.callout('back'); await t.untilStep('book_club_goal'); await sleep(600);
  A.ok(await t.ev(() => !window.O55.tour.practice.active && !!document.getElementById('o55pGoal')), 'Back: the practice is gone and the goal is offered again');
  await t.callout('showMe'); await t.untilStep('three_outcomes', 12000);
  const after = await counters(t);
  A.eq(after.net, before.net, 'no network requests'); A.eq(JSON.stringify(after.c.ledger), JSON.stringify(before.c.ledger), 'usage ledger unchanged');
});
def('t7', 'Run Onboarding Again, and a replay, start the tour over', async (t, A) => {
  /* same page: a replay does not count the last run's question as sent */
  await t.ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' })); await sleep(900);
  await t.callout('next'); await t.untilStep('open_chat'); await t.callout('showMe');
  await t.untilStep('select_teacher', 12000); await t.callout('showMe');
  await t.untilStep('send_question', 12000); await t.callout('showMe'); await t.untilStep('answer_stream', 12000);
  await t.click('#pm-o55-tour .o55t-bar [data-o55t="skip"]', 'Skip Tour'); await sleep(1400);
  await t.ev(() => window.PM7_GUIDED_TOUR.replay({ project: 'tastebook' })); await sleep(900);
  A.eq(await t.step(), 'comfort_intro', 'a replay starts at the first step');
  await t.callout('next'); await t.untilStep('open_chat'); await t.callout('showMe');
  await t.untilStep('select_teacher', 12000); await t.callout('showMe');
  await t.untilStep('send_question', 12000); await sleep(1500);
  A.eq(await t.step(), 'send_question', 'the question sent in the last run does not count in this one');
  /* After a reload, Run Onboarding Again resets the tour completely: no recovery panel, no saved progress. */
  await t.page.goto(pathToFileURL(PAGE).href + '?o55=off'); await sleep(1600);
  A.eq(await t.ev(() => (window.O55.store.get('tour', {}) || {}).status), 'running', 'the unfinished tour is saved');
  await t.click('#pm-home-more-btn', 'Home more options'); await t.click('#pm-home-more-menu [data-pm-home-action="run-onboarding"]', 'Run Onboarding Again'); await sleep(1500);
  A.ok(await t.ev(() => !!(window.O55.S && window.O55.S.open)), 'onboarding opens');
  A.ok(await t.ev(() => !document.getElementById('o55-tour-recovery')), 'no recovery panel');
  A.eq(await t.ev(() => window.O55.store.get('tour', null)), null, 'tour progress cleared');
  A.ok(await t.ev(() => !localStorage.getItem('pm.o55.tour-basis.v1')), 'tour basis cleared');
  await t.ev(() => window.O55.ui.close('close')); await sleep(900);
  await t.ev(() => window.PM7_GUIDED_TOUR.start({})); await sleep(1400);
  A.eq(await t.step(), 'comfort_intro', 'the next tour starts at the first step');
  A.eq(await t.ev(() => window.O55.tour.state().done.length), 0, 'nothing counts as done');
});

/* ------------------------------------------------------------------------------------------ runner */
const report = [];
for (const sc of SC) {
  if (only && !only.includes(sc.id)) continue;
  const profile = `${PROFILE_BASE}-${sc.id}`;
  const t = await openPage(profile); const asserts = []; let error = null, inv = null; const t0 = Date.now();
  const A = { ok: (c, m) => asserts.push({ ok: !!c, m }), eq: (a, b, m) => asserts.push({ ok: a === b, m: m + (a === b ? '' : ` (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`) }) };
  try { await sc.fn(t, A); } catch (e) { error = String(e.message || e).slice(0, 400); }
  try {
    inv = await t.ev(() => ({ raw: window.__o55raw, cover: window.__o55cover, clicks: window.__o55clicks }));
    A.ok(!inv.raw.length, 'no raw copy keys on screen' + (inv.raw.length ? ' (' + inv.raw.join(', ') + ')' : ''));
    const bad = Object.entries(inv.cover).filter(([, r]) => (r.bad && !r.multi) || r.out).map(([k, r]) => `${k} covers ${r.max}% in ${r.bad}/${r.n}${r.out ? `, outside ${r.out}` : ''}`);
    A.ok(!bad.length, 'the callout never covers its target' + (bad.length ? ' (' + bad.join('; ') + ')' : ''));
  } catch (_) {}
  try { await t.page.screenshot(join(out, sc.id + '.png')); } catch (_) {}
  const r = { id: sc.id, title: sc.title, ms: Date.now() - t0, pass: !error && asserts.every((x) => x.ok) && !t.page.errors.length, error, asserts, errors: t.page.errors.slice(0, 8), inv, state: await t.ev(() => window.O55.tour.state()).catch(() => null) };
  report.push(r);
  console.log((r.pass ? 'PASS ' : 'FAIL ') + sc.id + '  ' + sc.title + (error ? '  !! ' + error : '') + asserts.filter((x) => !x.ok).map((x) => '\n      x ' + x.m).join('') + (t.page.errors.length ? '\n      errors: ' + t.page.errors.slice(0, 3).join(' | ') : ''));
  try { await t.close(); }
  finally { await dropProfile(profile, t.chrome); }
}
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ scenarios: report.length, pass: report.filter((r) => r.pass).length, fail: report.filter((r) => !r.pass).map((r) => r.id) }));
if (report.some(r => !r.pass)) process.exitCode = 1;
