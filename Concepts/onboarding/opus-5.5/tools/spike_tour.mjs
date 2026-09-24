/* M0 tour spike: prove the real-shell mechanics the Guided Tour depends on, in the built concept.
 * Usage: node tools/spike_tour.mjs <out-dir>
 * Checks: guided Teacher thread through the real composer (local stream, zero usage), ELI5 toggle, Teacher persona,
 * Chat drag to dock_left via real pointer input, layout snapshot -> o55RestoreSnapshot, Approval queue widget add,
 * Planning Wizard workspace stage structure. Writes spike.json + screenshots to <out-dir>. */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const built = resolve(here, '../../../TestOpus5.5PmConcept.html');
const out = resolve(process.argv[2] || '/tmp/o55/spike');
mkdirSync(out, { recursive: true });
const facts = {};
const { page, close } = await launch({ width: 1600, height: 1000 });
const shot = (n) => page.screenshot(join(out, n + '.png'));
try {
  await page.goto(pathToFileURL(built).href + '?o55=off');
  await sleep(2600);
  facts.counters0 = await page.evaluate(() => {
    const d = window.PM_DEMO; d && d.clock && d.clock.pause && d.clock.pause();
    window.__o55fetch = 0; const f = window.fetch; window.fetch = function () { window.__o55fetch++; return f.apply(this, arguments); };
    const X = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function () { window.__o55fetch++; return X.apply(this, arguments); };
    return { ledger: d.state.usage && d.state.usage.ledger ? d.state.usage.ledger.length : null, ctxUsed: d.state.chat && d.state.chat.context ? d.state.chat.context.used : null,
      attempts: window.PM7_USAGE && window.PM7_USAGE.projectedAttempts ? JSON.stringify(window.PM7_USAGE.projectedAttempts()).length : null,
      bridge: JSON.stringify(window.PM7_USAGE_BRIDGE_STATS || null).length };
  });

  /* 1. layout snapshot before anything moves */
  facts.snapshot = await page.evaluate(() => { window.__o55snap = JSON.parse(JSON.stringify(window.PM_HOME_WORKSPACE.layout)); return window.__o55snap.surfaces.map((s) => s.surface_id + '@' + s.host + (s.visible ? '' : '(hidden)')); });

  /* 2. guided Teacher thread + local send adapter (same pattern the tour will use) */
  facts.teacher = await page.evaluate(async () => {
    const d = window.PM_DEMO, api = window.PM_HOME_WORKSPACE;
    api.setSurfaceVisible('chat', true, 'cmd.panel.switch');
    const created = d.chat.newThread('teacher'); const id = created.threadId;
    const th = d.state.chat.threads[id]; th.title = 'Guided example'; th.guided_example = true;
    if (window.PM6_CHAT_THREADS && window.PM6_CHAT_THREADS[id]) window.PM6_CHAT_THREADS[id].title = 'Guided example';
    await new Promise((r) => setTimeout(r, 200));
    const row = document.querySelector('.chat-thread-item[data-thread="' + id + '"]'); if (row) row.click();
    const original = d.chat.send;
    window.__o55sent = [];
    d.chat.send = function (threadId, text) {
      const thread = d.state.chat.threads[threadId];
      if (!thread || !thread.guided_example) return original.apply(d.chat, arguments);
      window.__o55sent.push(text);
      thread.messages.push({ role: 'user', text, guided_example: true });
      d.emit('chat.stream', { threadId, type: 'user', text });
      const msgId = 'o55-teacher-' + Date.now();
      d.emit('chat.stream', { threadId, msgId, type: 'start', intent: 'guided_teacher' });
      const html = '<p>Before work begins, Puppet Master turns your request into a plan. You can review the important choices, correct anything that looks wrong, and decide when to begin. Your Project permissions still control what the work may change.</p>';
      d.stream.start((chunk) => d.emit('chat.stream', { threadId, msgId, type: 'chunk', html: chunk }), html, { onDone: () => { thread.messages.push({ role: 'assistant', html, guided_example: true }); d.emit('chat.stream', { threadId, msgId, type: 'done' }); } });
      return { ok: true, local_deterministic: true };
    };
    return { id, rowFound: !!row, header: (document.querySelector('#chatPanel .chatHeaderTitle') || {}).textContent };
  });
  await sleep(300);
  facts.composer = await page.evaluate(() => {
    const ta = [...document.querySelectorAll('textarea.pm6-chat-input')].find((t) => t.getClientRects().length && t.offsetWidth > 0);
    if (!ta) return { found: false };
    ta.focus(); ta.value = 'What happens before Puppet Master changes my files?'; ta.dispatchEvent(new Event('input', { bubbles: true }));
    const r = ta.getBoundingClientRect();
    const send = [...document.querySelectorAll('.pm6-chat-send')].find((b) => b.getClientRects().length);
    const sr = send && send.getBoundingClientRect();
    return { found: true, rect: [r.x, r.y, r.width, r.height], send: sr ? { x: sr.x + sr.width / 2, y: sr.y + sr.height / 2 } : null };
  });
  if (facts.composer.send) await page.mouse(facts.composer.send.x, facts.composer.send.y);
  await sleep(2600);
  facts.afterSend = await page.evaluate(() => {
    const d = window.PM_DEMO; const panel = document.querySelector('#chatPanel');
    const texts = [...panel.querySelectorAll('.pm6-chat-sink, .message')].map((n) => n.textContent.trim()).filter(Boolean).slice(-3);
    return { sent: window.__o55sent, lastMessages: texts, fetches: window.__o55fetch, ledger: d.state.usage && d.state.usage.ledger ? d.state.usage.ledger.length : null, ctxUsed: d.state.chat.context ? d.state.chat.context.used : null };
  });
  await shot('01-teacher-answer');

  /* 3. ELI5 toggle (the practised control) */
  facts.eli5 = await page.evaluate(() => {
    const t = [...document.querySelectorAll('span.chat-toggle-btn.toggle-eli5')].find((x) => x.getClientRects().length);
    if (!t) return { found: false };
    const before = t.classList.contains('active'); t.click(); return { found: true, before, after: t.classList.contains('active'), label: t.textContent.trim() };
  });

  /* 4. Teacher persona in the guide picker */
  facts.persona = await page.evaluate(async () => {
    const btn = [...document.querySelectorAll('.pm6-chat-personabtn')].find((b) => b.getClientRects().length);
    if (!btn) return { found: false };
    btn.click(); await new Promise((r) => setTimeout(r, 350));
    const item = [...document.querySelectorAll('.pm6-chat-personaitem[data-persona="Teacher"]')].find((b) => b.getClientRects().length);
    const names = [...document.querySelectorAll('.pm6-chat-personaitem')].filter((b) => b.getClientRects().length).map((b) => b.getAttribute('data-persona'));
    if (item) item.click(); await new Promise((r) => setTimeout(r, 250));
    return { found: true, names, label: (document.querySelector('#chatPanel .persona-label') || {}).textContent };
  });
  await shot('02-persona-eli5');

  /* 5. drag Chat to dock_left through real pointer input on the handle */
  const handle = await page.evaluate(() => { const h = [...document.querySelectorAll('[data-pm-home-handle="chat"]')].find((x) => x.getClientRects().length); if (!h) return null; const r = h.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  facts.handle = handle;
  if (handle) {
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: handle.x, y: handle.y });
    await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: handle.x, y: handle.y, button: 'left', clickCount: 1 });
    const target = { x: 330, y: 420 };
    for (let i = 1; i <= 24; i++) { const t = i / 24; await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: handle.x + (target.x - handle.x) * t, y: handle.y + (target.y - handle.y) * t, button: 'left', buttons: 1 }); await sleep(25); }
    facts.midDrag = await page.evaluate(() => ({ dropActive: [...document.querySelectorAll('.pm-home-drop-active')].map((e) => e.getAttribute('data-pm-home-host') || e.className.slice(0, 60)), placeholder: !!document.querySelector('.pm-home-drop-placeholder') }));
    await shot('03-mid-drag');
    await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: target.x, y: target.y, button: 'left', clickCount: 1 });
    await sleep(700);
  }
  facts.afterDrag = await page.evaluate(() => window.PM_HOME_WORKSPACE.layout.surfaces.filter((s) => s.surface_id === 'chat').map((s) => s.host + (s.visible ? '' : '(hidden)')));
  await shot('04-after-drag');

  /* 6. widget: Add widget -> Approval queue */
  facts.widget = await page.evaluate(async () => {
    const add = document.getElementById('pm6DashAddBtn'); if (!add) return { found: false };
    add.click(); await new Promise((r) => setTimeout(r, 400));
    const items = [...document.querySelectorAll('.pm6-dash-catalog-item')].filter((x) => x.getClientRects().length);
    const names = items.map((x) => x.textContent.trim().split('\n')[0].slice(0, 30));
    const aq = items.find((x) => /approval queue/i.test(x.textContent)); if (aq) aq.click();
    await new Promise((r) => setTimeout(r, 600));
    return { found: true, names, clicked: !!aq, widgetInGrid: [...document.querySelectorAll('[data-widget-id], .pm6-dash-widget')].some((w) => /approval queue/i.test(w.textContent)) };
  });
  await shot('05-widget');

  /* 7. restore the original layout through the layout owner */
  facts.restore = await page.evaluate(() => { const r = window.PM_HOME_WORKSPACE.o55RestoreSnapshot(window.__o55snap); return { r, chat: window.PM_HOME_WORKSPACE.layout.surfaces.filter((s) => s.surface_id === 'chat').map((s) => s.host) }; });
  await sleep(500);
  await shot('06-restored');

  /* 8. Planning Wizard workspace stage */
  facts.wizard = await page.evaluate(async () => {
    window.PM_PAGES.go('wizard'); await new Promise((r) => setTimeout(r, 700));
    const stages = [...document.querySelectorAll('[data-wiz-stage]')].map((s) => s.getAttribute('data-wiz-stage') + (s.classList.contains('active') ? '*' : ''));
    const work = document.getElementById('pm6WizStageWork');
    return { current: window.PM_PAGES.current, stages, workHidden: work ? getComputedStyle(work).display : null, approve: !!document.querySelector('.pm6-wiz-approve') };
  });
  await shot('07-wizard');
  facts.counters1 = await page.evaluate(() => { const d = window.PM_DEMO; return { ledger: d.state.usage && d.state.usage.ledger ? d.state.usage.ledger.length : null, ctxUsed: d.state.chat.context ? d.state.chat.context.used : null, fetches: window.__o55fetch }; });
  facts.errors = page.errors.slice(0, 10);
} finally { await close(); }
writeFileSync(join(out, 'spike.json'), JSON.stringify(facts, null, 2));
console.log(JSON.stringify(facts, null, 1).slice(0, 4000));
