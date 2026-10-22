#!/usr/bin/env node
// Hosted regression paths from Astra r2: visible editor reconciliation and the
// browser's remembered participant route, including composer intake and Send.
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { chatTarget, testGeometry, measureTestGeometry } from './chat-target.mjs';
import { launchGpuBrowser, gpuPage } from './gpu-browser.mjs';

const argv = process.argv.slice(2), opt = key => { const i = argv.indexOf(key); return i < 0 ? null : argv[i + 1]; };
const target = chatTarget(argv), results = [], errors = [];
if (target.kind !== 'pm7') throw new Error('Host contracts require --page pm7');
const browser = await launchGpuBrowser(chromium), page = gpuPage(browser);
page.on('pageerror', e => errors.push(e.message));
const ev = (fn, data) => page.evaluate(fn, data), sleep = ms => page.waitForTimeout(ms);
async function check(id, pass, measured) {
  await measureTestGeometry(page);
  results.push({ id, pass: !!pass, owner: 'c56port-fix', measured, sizeContext: testGeometry() });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ' ' + JSON.stringify(measured)}`);
}
async function snapshot() {
  return ev(() => {
    const id = 'crew-work:crew-query-perf', body = document.querySelector('.pmw-tabbody[data-pmw-tab="' + id + '"]');
    const r = body?.getBoundingClientRect();
    return { active: PM_HOME.active(), chat: { active: PM56_APP.state.activeEditor, revealed: PM56_APP.state.editorRevealed },
      runVisible: PM56_PMX.viewOpen('crew-query-perf'), body: r ? { width: r.width, height: r.height } : null };
  });
}
async function counts() { return ev(() => Object.fromEntries(PM56_APP.state.threads.map(t => [t.id, t.messages.length]))); }
function sameCounts(a, b) { return Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => a[k] === b[k]); }
const routeIs = (a, b) => a?.kind === b.kind && a?.refId === b.refId && a?.participantId === b.participantId;
async function bufferSnapshot(tid) {
  return ev(tid => {
    const b = PM56_RUNTIME.composer.bufferFor(tid);
    return { thread: PM56_APP.state.selectedThread, text: b.text, destination: b.destination,
      attachments: b.attachments.map(a => a.id), notice: [...document.querySelectorAll('.toast,.pmw-toast,.o55-toast,[role="status"]')].map(e => e.textContent.trim()).join('\n') };
  }, tid);
}
async function browserOrigin() {
  return ev(() => {
    const A = PM56_APP, CS = PM56_RUNTIME.composer, r = PM56_COLLAB.run('crew-query-perf');
    const wanted = { kind: 'participant', refId: r.id, participantId: r.participants[0].id, label: r.participants[0].name };
    A.switchThread(r.threadId); const b = CS.bufferFor(r.threadId);
    b.destination = wanted; CS.destination = wanted; b.text = 'Preserve this draft.'; A.state.composer = b.text;
    if (A.state.drafts) A.state.drafts[r.threadId] = b.text;
    A.render(); PM56_SURFACES.openBrowser();
    // A real earlier browser attachment must survive either restore or refusal.
    PMW.bus.emit('browser:capture', { tabId: 'browser:pm56-capture', capture: { kind: 'full', w: 414, h: 232, title: 'Earlier capture' } });
    b.destination = null; CS.destination = null; A.render(); A.switchThread('orbit-run');
    return { tid: r.threadId, wanted, runId: r.id };
  });
}
async function browserEvent(name, payload) { await ev(([name, payload]) => PMW.bus.emit(name, { tabId: 'browser:pm56-capture', ...payload }), [name, payload]); await sleep(350); }
function retained(before, after) { return before.attachments.length > 0 && before.attachments.every(id => after.attachments.includes(id)) && after.text.includes(before.text); }
function refused(before, after) {
  return after.text === before.text && JSON.stringify(after.attachments) === JSON.stringify(before.attachments) &&
    JSON.stringify(after.destination) === JSON.stringify(before.destination) && after.notice !== before.notice;
}

try {
  await page.setViewportSize({ width: 2400, height: 900 }); await target.load(page); await target.resize(page, { width: 760, height: 900 });
  await ev(() => PMW.applyNamed('home')); await sleep(400);
  await ev(() => PM56_SURFACES.openAs('context:query')); await sleep(400);
  let s = await snapshot();
  await check('HC-F2-CONTEXT', s.active?.tabId === 'context:query' && s.chat.active === 'context:query' && s.chat.revealed, s);
  await ev(() => PM_HOME.open({ kind: 'editor', path: 'src/host-contract-other.rs' })); await sleep(400);
  s = await snapshot(); await check('HC-F2-NONCHAT', s.active?.kind === 'editor' && !s.chat.active && !s.chat.revealed, s);
  const activeBefore = s.active?.tabId;
  await ev(() => PM56_SURFACES.openAs('doc:host-contract-background', { ctrl: true })); await sleep(400);
  s = await snapshot(); await check('HC-F2-BACKGROUND', s.active?.tabId === activeBefore && !s.chat.active && !s.chat.revealed, s);
  await ev(() => PM56_SURFACES.openAs('crew-work:crew-query-perf')); await sleep(400);
  s = await snapshot(); await check('HC-F2-EXPANDED', s.chat.active === 'crew-work:crew-query-perf' && s.chat.revealed && s.runVisible && s.body?.width > 0 && s.body?.height > 0, s);
  const panel = await ev(() => PM_HOME.tabs().find(t => t.tabId === 'crew-work:crew-query-perf')?.panelId);
  if (!panel) throw new Error('Run tab has no Home panel');
  await ev(id => PMW.setCollapsed(id, true), panel); await sleep(1800);
  s = await snapshot(); await check('HC-F2-COLLAPSED', (!s.body || !s.body.width || !s.body.height) && !s.chat.active && !s.chat.revealed && !s.runVisible, s);
  await ev(id => PMW.setCollapsed(id, false), panel); await sleep(400);
  await ev(() => PM_PAGES.go('usage')); await sleep(1800);
  s = await snapshot(); await check('HC-F2-USAGE', !s.chat.active && !s.chat.revealed && !s.runVisible, s);
  await ev(() => { PM_PAGES.go('dashboard'); PM56_APP.closeEditor('crew-work:crew-query-perf'); }); await sleep(500);
  s = await snapshot(); await check('HC-F2-CLOSED', !s.chat.active && !s.chat.revealed && !s.runVisible, s);

  await target.load(page); await target.resize(page, { width: 760, height: 900 });
  await ev(() => {
    PM56_APP.switchThread('query'); const CS = PM56_RUNTIME.composer;
    CS.bufferFor('query').destination = { kind: 'workflow', refId: 'host-contract-missing-run', label: 'Missing run' };
    CS.destination = CS.bufferFor('query').destination; PM56_SURFACES.openBrowser(); PM56_APP.switchThread('orbit-run');
  });
  const invalidBefore = await counts();
  await browserEvent('browser:send', { how: 'capture', what: { kind: 'full', w: 801, h: 601, title: 'Missing destination' } });
  const invalidAfter = await counts(); await check('HC-S2-MISSING', sameCounts(invalidBefore, invalidAfter), { before: invalidBefore, after: invalidAfter });

  let origin = await browserOrigin();
  const isolatedBefore = await counts(), runBefore = await ev(id => PM56_COLLAB.run(id).messages.length, origin.runId);
  await browserEvent('browser:send', { how: 'capture', what: { kind: 'full', w: 802, h: 602, title: 'Participant isolated capture' } });
  const isolatedAfter = await counts(), delivered = await ev(tid => {
    const t = PM56_APP.state.threads.find(t => t.id === tid), r = PM56_COLLAB.run('crew-query-perf');
    return { message: t.messages.at(-1), runCount: r.messages.length, recipients: r.messages.at(-1)?.recipientIds };
  }, origin.tid);
  await check('HC-S2-ISOLATED', isolatedAfter[origin.tid] === isolatedBefore[origin.tid] + 1 &&
    Object.keys(isolatedBefore).filter(k => k !== origin.tid).every(k => isolatedBefore[k] === isolatedAfter[k]) &&
    routeIs(delivered.message.destinationRef, origin.wanted) && delivered.runCount === runBefore + 1 && delivered.recipients?.includes(origin.wanted.participantId), { origin, before: isolatedBefore, after: isolatedAfter, delivered });

  origin = await browserOrigin(); let before = await bufferSnapshot(origin.tid);
  await browserEvent('browser:send', { how: 'insert', what: { comp: 'InsertCard', el: 'section', w: 200, h: 80 } });
  let after = await bufferSnapshot(origin.tid);
  await check('HC-S2-INSERT', retained(before, after) && (routeIs(after.destination, origin.wanted) || refused(before, after)), { origin, before, after });

  origin = await browserOrigin(); before = await bufferSnapshot(origin.tid);
  await browserEvent('browser:send', { how: 'list', what: { comp: 'QueryCard', el: 'section', w: 200, h: 80 } });
  const listed = await bufferSnapshot(origin.tid), listRefused = refused(before, listed);
  await check('HC-S2-LIST', retained(before, listed) && (routeIs(listed.destination, origin.wanted) || listRefused), { origin, before, after: listed });
  await browserEvent('browser:capture', { capture: { kind: 'full', w: 803, h: 603, title: 'New tray capture' } });
  const tray = await bufferSnapshot(origin.tid), trayRefused = refused(listed, tray);
  await check('HC-S2-TRAY', retained(listed, tray) && (routeIs(tray.destination, origin.wanted) || trayRefused), { origin, before: listed, after: tray });
  if (listRefused && trayRefused) {
    await check('HC-S2-SEND', true, { refusedBeforeSend: true, origin, tray });
  } else {
    const sendBefore = await counts(), runN = await ev(id => PM56_COLLAB.run(id).messages.length, origin.runId);
    await ev(tid => { PM56_APP.switchThread(tid); PMW.chatCol.show(); }, origin.tid); await sleep(500);
    const send = page.locator('#pmRoot [data-action="send"]').first(); await send.scrollIntoViewIfNeeded();
    await send.click({ timeout: 6000 }); await sleep(500);
    const sendAfter = await counts(), sent = await ev(tid => {
      const t = PM56_APP.state.threads.find(t => t.id === tid), r = PM56_COLLAB.run('crew-query-perf');
      return { messages: t.messages.slice(-3).map(m => ({ id: m.id, role: m.role, destinationRef: m.destinationRef, attachments: m.attachments?.map(a => a.id) })), runCount: r.messages.length, recipients: r.messages.at(-1)?.recipientIds };
    }, origin.tid);
    const newMessages = sent.messages.slice(-(sendAfter[origin.tid] - sendBefore[origin.tid]));
    await check('HC-S2-SEND', sendAfter[origin.tid] > sendBefore[origin.tid] && sent.runCount === runN + 1 &&
      sent.recipients?.includes(origin.wanted.participantId) && newMessages.some(m => routeIs(m.destinationRef, origin.wanted)) &&
      Object.keys(sendBefore).filter(k => k !== origin.tid).every(k => sendBefore[k] === sendAfter[k]), { origin, before: sendBefore, after: sendAfter, runBefore: runN, sent });
  }
} catch (e) { await check('HC-RUN', false, e.stack); }
finally { await browser.close(); }
if (errors.length) results.push({ id: 'HC-PAGEERROR', pass: false, owner: 'c56port-fix', measured: errors });
const failed = results.filter(r => !r.pass), report = { page: target.kind, file: target.file, checks: results.length, failed: failed.length, results };
if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify(report, null, 2));
console.log(`host-contract-verify: ${results.length - failed.length} PASS, ${failed.length} FAIL`);
process.exitCode = failed.length ? 1 : 0;
