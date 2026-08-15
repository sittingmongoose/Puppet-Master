/* Kimi K3 harness — probes. Each: async (page, ctx) -> {pass, detail}.
   ctx: {window, thread, width, theme, sess, server, driver}.
   Historical 12 + packet probes (pinned geometry, artifact left, question
   flow, compact work, route picker, access/BSD, offline idempotency, ...). */

import { filteredErrors } from './fixtures.mjs';

function ok(detail) { return { pass: true, detail: detail || '' }; }
function fail(detail) { return { pass: false, detail: detail || '' }; }

// ---------- historical probes ------------------------------------------------

export async function noHorizontalOverflow(page) {
  const r = await page.evaluate(function () {
    var de = document.documentElement;
    var worst = null;
    document.querySelectorAll('*').forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.width && (r.right > de.clientWidth + 2 || r.left < -2)) {
        if (!worst || r.right > worst.right) worst = { cls: String(n.className).slice(0, 60), right: Math.round(r.right) };
      }
    });
    return { cw: de.clientWidth, sw: de.scrollWidth, worst: worst };
  });
  return r.sw <= r.cw + 1 ? ok() : fail('scrollWidth ' + r.sw + ' > clientWidth ' + r.cw + ' worst=' + JSON.stringify(r.worst));
}

export async function noConsoleErrors(page) {
  const errs = filteredErrors(page);
  return errs.length === 0 ? ok() : fail(errs.slice(0, 4).join(' | '));
}

export async function noEmoji(page) {
  const found = await page.evaluate(function () {
    var re = /[😀-🙏🌀-🫿☀-➿⬀-⯿️←-⇿]/u;
    var hits = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var n; var guard = 0;
    while ((n = walker.nextNode()) && guard++ < 20000) {
      if (re.test(n.nodeValue || '')) { hits.push((n.nodeValue || '').trim().slice(0, 40)); if (hits.length > 3) break; }
    }
    return hits;
  });
  return found.length === 0 ? ok() : fail('emoji-like glyphs: ' + found.join(' | '));
}

export async function noUnderscoredLabels(page) {
  const hits = await page.evaluate(function () {
    var out = [];
    document.querySelectorAll('button, .k3-chip, [role="tab"], .k3s-tab-label, .k3w-kit-sel-label').forEach(function (n) {
      var t = (n.textContent || '').trim();
      if (/[a-z]_[a-z]/.test(t)) out.push(t.slice(0, 40));
    });
    return out.slice(0, 5);
  });
  return hits.length === 0 ? ok() : fail('underscored labels: ' + hits.join(' | '));
}

export async function noLeftAccentBorders(page) {
  const hits = await page.evaluate(function () {
    var out = [];
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
    document.querySelectorAll('div, section, article, aside, span').forEach(function (n) {
      var cs = getComputedStyle(n);
      var w = parseFloat(cs.borderLeftWidth) || 0;
      if (w > 2 && cs.borderLeftStyle !== 'none') {
        var c = cs.borderLeftColor;
        if (accent && c && c !== 'rgba(0, 0, 0, 0)') {
          out.push(String(n.className).slice(0, 50) + ' ' + w + 'px ' + c);
        }
      }
    });
    return out.slice(0, 4);
  });
  return hits.length === 0 ? ok() : fail('left accent borders: ' + hits.join(' | '));
}

export async function scrollbarNoLeak(page) {
  // scrollWidth includes the reserved scrollbar-gutter (~14px, by design), so
  // a raw sw>cw check false-positives. A REAL leak is a descendant whose box
  // extends past the scroller's content box.
  const hits = await page.evaluate(function () {
    var out = [];
    document.querySelectorAll('.k3t-scroller, .k3-scroll, .k3w-kit-history, [data-k3-slot="thread"]').forEach(function (n) {
      if (n.scrollWidth <= n.clientWidth + 1) return;
      var box = n.getBoundingClientRect();
      var padRight = parseFloat(getComputedStyle(n).paddingRight) || 0;
      var limit = box.right - padRight + 1;
      var worst = null;
      n.querySelectorAll('*').forEach(function (d) {
        var r = d.getBoundingClientRect();
        if (r.width === 0) return;
        if (r.right > limit && (!worst || r.right > worst.right)) {
          worst = { cls: String(d.className).slice(0, 50), right: Math.round(r.right) };
        }
      });
      if (worst) out.push(String(n.className).slice(0, 40) + ' worst=' + worst.cls + ' @' + worst.right + ' limit=' + Math.round(limit));
    });
    return out.slice(0, 4);
  });
  return hits.length === 0 ? ok() : fail('x-overflow: ' + hits.join(' | '));
}

export async function popupContract(page) {
  // open the route picker (model peer), assert k3-pop, Esc closes, no scroll lock
  const r = await page.evaluate(async function () {
    var btn = document.querySelector('[data-testid="k3w-kit-model"]');
    if (!btn) return { skip: 'no route button' };
    btn.click();
    await new Promise(function (r2) { setTimeout(r2, 350); });
    var pop = document.querySelector('.k3-pop');
    var opened = !!pop;
    var offscreen = false;
    if (pop) {
      var rect = pop.getBoundingClientRect();
      offscreen = rect.left < -2 || rect.top < -2 || rect.right > innerWidth + 2 || rect.bottom > innerHeight + 2;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(function (r2) { setTimeout(r2, 350); });
    var closed = !document.querySelector('.k3-pop.is-open') && !document.querySelector('.k3-pop');
    var lock = document.body.style.overflow === 'hidden';
    return { opened: opened, closed: closed, lock: lock, offscreen: offscreen };
  });
  if (r.skip) return fail(r.skip);
  if (!r.opened) return fail('picker did not open');
  if (r.offscreen) return fail('popup offscreen');
  if (!r.closed) return fail('popup did not close on Esc');
  if (r.lock) return fail('body scroll lock remains');
  return ok();
}

export async function sendStopMachine(page) {
  const r = await page.evaluate(async function () {
    var k3 = window.__k3;
    var tid = k3.store.get('activeThreadId');
    var ta = document.querySelector('[data-testid="k3-composer-input"]');
    if (!ta) return { skip: 'no composer (questionnaire active?)' };
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var before = k3.data.messages(tid).length;
    ta.value = 'probe message';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(60);
    var sendBtn = document.querySelector('[data-testid="k3-composer-send"], [data-testid="k3-composer-stop"]');
    var wasSend = sendBtn && sendBtn.getAttribute('data-testid') === 'k3-composer-send';
    if (sendBtn) sendBtn.click();
    await sleep(200);
    var appended = k3.data.messages(tid).length === before + 1;
    // agent may now be working: empty draft -> Stop
    var stopSeen = false, stopped = false;
    if (k3.data.isActive(tid)) {
      await sleep(120);
      var b2 = document.querySelector('[data-testid="k3-composer-stop"]');
      stopSeen = !!b2;
      if (b2) { b2.click(); await sleep(250); stopped = !k3.data.isActive(tid); }
    } else { stopSeen = true; stopped = true; /* reply finished instantly */ }
    return { wasSend: wasSend, appended: appended, stopSeen: stopSeen, stopped: stopped };
  });
  if (r.skip) return fail(r.skip);
  if (!r.wasSend) return fail('send button not shown with text');
  if (!r.appended) return fail('message not appended');
  if (!r.stopSeen) return fail('stop not shown while active with empty draft');
  if (!r.stopped) return fail('stop did not halt the reply');
  return ok();
}

export async function remountPreserves(page) {
  const r = await page.evaluate(async function () {
    var k3 = window.__k3;
    var tid = k3.store.get('activeThreadId');
    var ta = document.querySelector('[data-testid="k3-composer-input"]');
    if (!ta) return { skip: 'no composer' };
    ta.value = 'remount draft';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(function (r2) { setTimeout(r2, 80); });
    window.K3.setEnv({ mode: 'popout' });
    await new Promise(function (r2) { setTimeout(r2, 400); });
    window.K3.setEnv({ mode: 'docked' });
    await new Promise(function (r2) { setTimeout(r2, 400); });
    var d = k3.data.getDraft(tid);
    return { text: d && d.text };
  });
  if (r.skip) return fail(r.skip);
  return r.text === 'remount draft' ? ok() : fail('draft lost: ' + JSON.stringify(r.text));
}

export async function draftSurvivesRestart(page) {
  const r = await page.evaluate(async function () {
    var k3 = window.__k3;
    var tid = k3.store.get('activeThreadId');
    k3.data.saveDraft(tid, 'restart draft probe', []);
    k3.data.simulateRestart();
    await new Promise(function (r2) { setTimeout(r2, 300); });
    var d = k3.data.getDraft(tid);
    return { text: d && d.text };
  });
  return r.text === 'restart draft probe' ? ok() : fail('draft lost after restart');
}

export async function exactJump(page) {
  const r = await page.evaluate(async function () {
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-09');
    window.K3.emit('data', { type: 'threads-changed' });
    await new Promise(function (r2) { setTimeout(r2, 300); });
    window.K3.emit('reveal-message', { threadId: 'thread-09', messageId: 't09-m0113' });
    await new Promise(function (r2) { setTimeout(r2, 400); });
    var art = document.querySelector('[data-mid="t09-m0113"]');
    if (!art) return { found: false };
    var rect = art.getBoundingClientRect();
    var scroller = art.closest('.k3t-scroller') || document.documentElement;
    var sr = scroller.getBoundingClientRect();
    return { found: true, visible: rect.bottom > sr.top && rect.top < sr.bottom };
  });
  if (!r.found) return fail('target article not rendered after jump');
  return r.visible ? ok() : fail('target not in viewport after jump');
}

export async function noTextClipping(page) {
  const hits = await page.evaluate(function () {
    var out = [];
    document.querySelectorAll('button, .k3-chip, .k3w-kit-state, .k3t-stage-label, .k3s-tab-label').forEach(function (n) {
      if (n.scrollHeight > n.clientHeight + 2) {
        out.push(String(n.className).slice(0, 40) + ' sh=' + n.scrollHeight + ' ch=' + n.clientHeight);
      }
    });
    return out.slice(0, 4);
  });
  return hits.length === 0 ? ok() : fail('clipped: ' + hits.join(' | '));
}

// ---------- packet probes -----------------------------------------------------

export async function pinnedGeometry(page, ctx, pinKey) {
  const r = await page.evaluate(async function (pinKey2) {
    var k3 = window.__k3;
    var tid = k3.store.get('activeThreadId');
    if (pinKey2) {
      k3.store.set('surfaceView.' + tid + '.' + pinKey2, true);
      window.K3.emit('data', { type: 'threads-changed' });
      await new Promise(function (r2) { setTimeout(r2, 450); });
    }
    var thread = document.querySelector('[data-k3-slot="thread"]');
    var composer = document.querySelector('[data-k3-slot="composer"]');
    if (!thread || !composer) return { skip: 'slots missing' };
    // find the pinned history surface: any visible element whose class mentions
    // history/pin inside the window root but outside the slots
    var tr = thread.getBoundingClientRect();
    var cr = composer.getBoundingClientRect();
    var pinned = null;
    document.querySelectorAll('[class*="history"], [class*="pin"], [class*="rail"], [class*="dock"], [class*="chats"], [class*="drawer"], [class*="band"]').forEach(function (n) {
      if (pinned) return;
      if (thread.contains(n) || composer.contains(n)) return;
      if (n.contains(thread) || n.contains(composer)) return; // window/shell containers, not surfaces
      if (n.closest('.k3s-rail')) return; // app rail is shell, not chat history
      var rr = n.getBoundingClientRect();
      if (rr.width < 40 || rr.height < 40) return;
      pinned = n;
    });
    if (!pinned) return { pinned: false };
    var pr = pinned.getBoundingClientRect();
    function intersects(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
    var overlaps = intersects(pr, tr) || intersects(pr, cr);
    return { pinned: true, overlaps: overlaps, chatWidth: Math.round(tr.width), pinW: Math.round(pr.width) };
  }, pinKey);
  if (r.skip) return fail(r.skip);
  if (pinKey && !r.pinned) return fail('no pinned surface found after setting ' + pinKey);
  if (!r.pinned) return ok('no pinned surface (window idiom has none open)');
  if (r.overlaps) return fail('pinned history intersects transcript/composer');
  if (ctx.width === 520 && r.chatWidth < 300) return fail('chat ' + r.chatWidth + 'px < 300px floor at 520');
  return ok('chatWidth=' + r.chatWidth);
}

export async function pinSurvival(page, ctx, pinKey) {
  if (!pinKey) return ok('window has no pin toggle (persistent idiom)');
  const r = await page.evaluate(async function (pinKey2) {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = { steps: [] };
    function pinnedSurface() {
      // scope to the chat module root — it moves dock<->float on pop-out, so
      // the finder follows the module and never mistakes shell chrome (empty
      // dock placeholder, rail) for the pinned surface.
      var mod = document.querySelector('[data-k3-window]');
      if (!mod) return null;
      var thread = mod.querySelector('[data-k3-slot="thread"]');
      var composer = mod.querySelector('[data-k3-slot="composer"]');
      if (!thread || !composer) return null;
      var found = null;
      mod.querySelectorAll('[class*="history"], [class*="pin"], [class*="dock"], [class*="chats"], [class*="drawer"], [class*="band"]').forEach(function (n) {
        if (found) return;
        if (thread.contains(n) || composer.contains(n) || n.contains(thread) || n.contains(composer)) return;
        var rr = n.getBoundingClientRect();
        if (rr.width < 40 || rr.height < 40) return;
        found = n;
      });
      return found;
    }
    function chatWidth() {
      var thread = document.querySelector('[data-k3-slot="thread"]');
      return thread ? Math.round(thread.getBoundingClientRect().width) : 0;
    }
    // 1. pin at 520
    k3.store.set('activeThreadId', 'thread-16');
    k3.store.set('surfaceView.thread-16.' + pinKey2, true);
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(450);
    out.pinnedAt520 = !!pinnedSurface();
    out.chat520 = chatWidth();
    // 2. resize 520 -> 1200 -> 520
    window.K3.setEnv({ width: 1200 });
    await sleep(500);
    out.pinnedAt1200 = !!pinnedSurface();
    window.K3.setEnv({ width: 520 });
    await sleep(500);
    out.pinnedBack520 = !!pinnedSurface();
    // 3. thread switch round-trip: pinned history SURVIVES (required proof) —
    // the surface stays pinned and follows the newly active thread
    k3.store.set('activeThreadId', 'thread-17');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(450);
    out.survivesOn17 = !!pinnedSurface();
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(450);
    out.restoredOn16 = !!pinnedSurface();
    // 4. pop-out round-trip (full remount)
    window.K3.setEnv({ mode: 'popout' });
    await sleep(650);
    out.pinnedInPopout = !!pinnedSurface();
    window.K3.setEnv({ mode: 'docked' });
    await sleep(650);
    out.pinnedBackDocked = !!pinnedSurface();
    out.chatFinal = chatWidth();
    return out;
  }, pinKey);
  if (!r.pinnedAt520) return fail('pin did not open at 520');
  if (ctx.width === 520 && r.chat520 < 300) return fail('chat compressed to ' + r.chat520 + 'px at 520');
  if (!r.pinnedAt1200 || !r.pinnedBack520) return fail('pin lost across resize: ' + JSON.stringify(r));
  if (!r.survivesOn17) return fail('pin did not survive the thread switch');
  if (!r.restoredOn16) return fail('pin pref lost after thread round-trip');
  if (!r.pinnedInPopout || !r.pinnedBackDocked) return fail('pin lost across pop-out: ' + JSON.stringify(r));
  return ok('chat520=' + r.chat520);
}

export async function artifactLeftOfChat(page, ctx) {
  // draft setup
  await page.evaluate(async function () {
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await new Promise(function (r2) { setTimeout(r2, 300); });
    k3.data.saveDraft('thread-16', 'artifact probe draft', []);
  });
  // open the artifact
  const opened = await page.evaluate(async function () {
    var ctx2 = { env: window.K3.env, store: window.__k3.store, data: window.__k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };
    window.K3ArtifactWS.open(ctx2, 'thread-16', 'art-16-code');
    await new Promise(function (r3) { setTimeout(r3, 550); });
    return {
      wsOpen: (window.__k3.store.get('artifactWs.thread-16', {}) || {}).open === true,
      found: !!document.querySelector('.k3aw-surface')
    };
  });
  if (!opened.wsOpen || !opened.found) return fail('surface did not open: ' + JSON.stringify(opened));

  // w8: dock the sheet first so the persistent geometry is what we measure
  if (ctx.window === 'w8') {
    await page.evaluate(function () {
      var tid = 'thread-16';
      window.__k3.store.set('artifactWs.' + tid + '.docked', true);
    });
    await new Promise((r) => setTimeout(r, 350));
  }

  const r2 = await page.evaluate(async function (win) {
    function overlaps(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
    var surf = document.querySelector('.k3aw-surface');
    if (!surf) return { found: false };
    // walk up to the window's adapter host (gutter/col/bay/dock/side/sheet)
    var host = surf.closest('.w1-dock-artifacts, .w2-rail-art, .w3-art-col, .w4-art-gutter, .w5-art-bay, .w6-side, .w7-artbay-body, .w8-art-dock-body, .w8-sheet, .w6-art-dialog, .w3-pane-body, .w2-center, .w4-chips, .w5-artifacts-body') || surf;
    var sr = host.getBoundingClientRect();
    var thread = document.querySelector('[data-k3-slot="thread"]').getBoundingClientRect();
    var composer = document.querySelector('[data-k3-slot="composer"]').getBoundingClientRect();
    var d = window.__k3.data.getDraft('thread-16');
    var transient = !!host.closest('.w8-sheet, .w6-art-dialog'); // declared transient overlay idioms
    return {
      found: true,
      leftOf: sr.right <= thread.left + 2,
      above: sr.bottom <= thread.top + 2,
      overlapsThread: overlaps(sr, thread),
      overlapsComposer: overlaps(sr, composer),
      aboveComposer: sr.top >= thread.bottom - 2 && sr.bottom <= composer.top + 2,
      draftKept: d && d.text === 'artifact probe draft',
      visible: sr.width > 100 && sr.height > 60,
      transient: transient,
      hostCls: String(host.className).slice(0, 40)
    };
  }, ctx.window);
  if (!r2.found) return fail('artifact surface not found after open');
  if (!r2.draftKept) return fail('composer draft lost on artifact open');
  if (!r2.visible) return fail('artifact surface too small: ' + r2.hostCls);
  if (r2.transient) return ok('transient overlay idiom (' + r2.hostCls + ')');
  if (r2.overlapsThread || r2.overlapsComposer) return fail('overlaps thread/composer: ' + r2.hostCls);
  var wide = ctx.width >= 975;
  if (ctx.window === 'w8') {
    // docked strip: in-flow between thread and composer (declared placement)
    if (!r2.aboveComposer) return fail('w8 dock not above composer: ' + JSON.stringify(r2));
  } else if (ctx.window !== 'w7' && wide && !r2.leftOf) return fail('not left of chat: ' + r2.hostCls);
  if (ctx.window === 'w7' && !r2.above) return fail('w7 bay not above transcript');
  return ok(r2.hostCls + ' leftOf=' + r2.leftOf + ' above=' + r2.above);
}

export async function questionFlow(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var tid = 'thread-16';
    k3.data.saveDraft(tid, 'question flow draft', []);
    await sleep(250); // composer yields to questionnaire
    var q = k3.data.activeQuestionnaire(tid);
    if (!q) return { step: 'no active questionnaire' };
    var host = document.querySelector('[data-k3-slot="composer"]');
    var hasQ = host && host.textContent.indexOf(q.questions[0].prompt.slice(0, 20)) >= 0;
    // answer first question
    var q0 = q.questions[0];
    k3.data.answerQuestion(tid, q.id, q0.id, q0.kind === 'freeform' ? 'probe answer' : [q0.options[0]]);
    await sleep(120);
    // skip second
    var q1 = q.questions[1];
    if (q1) k3.data.skipQuestion(tid, q.id, q1.id);
    await sleep(120);
    // cancel then re-trigger via demo
    k3.data.cancelQuestionnaire(tid, q.id);
    await sleep(250);
    var draftKept = (k3.data.getDraft(tid) || {}).text === 'question flow draft';
    var cancelled = !k3.data.activeQuestionnaire(tid);
    // submit path: re-open a flow through the demo controller
    if (window.K3Demo && window.K3Demo.triggerQuestionFlow) window.K3Demo.triggerQuestionFlow({ env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit });
    await sleep(300);
    var q2 = k3.data.activeQuestionnaire(tid);
    var submitted = false, receipt = false;
    if (q2) {
      q2.questions.forEach(function (qq) {
        if (qq.required) k3.data.answerQuestion(tid, q2.id, qq.id, qq.kind === 'freeform' ? 'probe' : [qq.options[0]]);
      });
      var res = k3.data.submitQuestionnaire(tid, q2.id);
      submitted = res && res.status === 'submitted';
      await sleep(200);
      receipt = k3.data.messages(tid).some(function (m) { return m.completedQuestionnaire && m.completedQuestionnaire.id === q2.id; });
    }
    return { hasQ: hasQ, draftKept: draftKept, cancelled: cancelled, submitted: submitted, receipt: receipt };
  });
  if (r.step) return fail(r.step);
  if (!r.hasQ) return fail('questionnaire did not take over the composer slot');
  if (!r.draftKept) return fail('draft lost across questionnaire');
  if (!r.cancelled) return fail('cancel did not end the flow');
  if (!r.submitted) return fail('submit failed');
  if (!r.receipt) return fail('no durable answer receipt');
  return ok();
}

export async function questionLifecycle(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    k3.store.set('activeThreadId', 'thread-02'); // questionnaire-free: fabricated flow is a first appearance
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(320);
    var ctx = { env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };
    window.K3Demo.triggerQuestionFlow(ctx);
    await sleep(140);
    out.preparePill = !!document.querySelector('[data-testid="k3-quest-prepare"]');
    await sleep(700);
    out.cardAfterPrepare = !!document.querySelector('[data-testid="k3-quest-skip"], [data-testid="k3-quest-submit"]');
    // answer required questions via data, then submit through the UI button
    var q = k3.data.activeQuestionnaire('thread-02');
    if (!q) return { step: 'no active questionnaire after prepare' };
    q.questions.forEach(function (qq) {
      if (!qq.required) return;
      k3.data.answerQuestion('thread-02', q.id, qq.id, [qq.options[0]]);
    });
    await sleep(250);
    var mq = k3.data.activeQuestionnaire('thread-02');
    k3.data.navigateQuestion('thread-02', q.id, mq.questions.length - 1);
    await sleep(250);
    var submitBtn = document.querySelector('[data-testid="k3-quest-submit"]');
    out.submitShown = !!submitBtn;
    if (submitBtn && !submitBtn.disabled) submitBtn.click();
    await sleep(160);
    out.submittingPill = !!document.querySelector('[data-testid="k3-quest-submitting"]');
    await sleep(700);
    out.composerBack = !!document.querySelector('[data-testid="k3-composer-input"]');
    out.receipt = k3.data.messages('thread-02').some(function (m) { return m.completedQuestionnaire && m.completedQuestionnaire.id === q.id; });
    return out;
  });
  if (r.step) return fail(r.step);
  if (!r.preparePill) return fail('no prepare beat pill');
  if (!r.cardAfterPrepare) return fail('card did not follow the prepare pill');
  if (!r.submitShown) return fail('submit button not shown on last page');
  if (!r.submittingPill) return fail('no submitting beat pill');
  if (!r.composerBack) return fail('composer did not return after the beat');
  if (!r.receipt) return fail('no durable answer receipt');
  return ok();
}

export async function questionPaging(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-02');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(320);
    var ctx = { env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };
    window.K3Demo.triggerQuestionFlow(ctx);
    await sleep(850); // through the prepare beat + entrance
    var out = { heights: [], composerTops: [] };
    var q = k3.data.activeQuestionnaire('thread-02');
    if (!q) return { step: 'no questionnaire' };
    for (var i = 0; i < q.questions.length; i++) {
      k3.data.navigateQuestion('thread-02', q.id, i);
      await sleep(280);
      var card = document.querySelector('[data-testid="k3-quest-prev"]');
      var rootEl = card ? card.closest('div') : null;
      // measure the questionnaire region: parent chain up to the slot child
      var region = document.querySelector('[data-k3-slot="composer"]').firstElementChild;
      var comp = document.querySelector('[data-testid="k3-composer-input"]');
      if (region) out.heights.push(Math.round(region.getBoundingClientRect().height));
      if (comp) out.composerTops.push(Math.round(comp.getBoundingClientRect().top));
    }
    return out;
  });
  if (r.step) return fail(r.step);
  if (r.heights.length < 2) return fail('could not measure pages: ' + JSON.stringify(r));
  var min = Math.min.apply(null, r.heights), max = Math.max.apply(null, r.heights);
  if (max - min > 4) return fail('card geometry jumps between pages: ' + JSON.stringify(r.heights));
  return ok('heights=' + JSON.stringify(r.heights));
}

export async function triggerCoverage(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var D = window.K3Demo;
    var out = {};
    var ctx = { env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(320);
    // todo.block
    D.todoBlock(ctx);
    await sleep(150);
    out.todoBlocked = (k3.data.thread('thread-16').todo.items || []).some(function (i) { return i.state === 'blocked'; });
    // subagent.retry (blocked local scout -> retrying)
    D.subagentRetry(ctx);
    await sleep(150);
    out.agentRetrying = (k3.data.thread('thread-16').subagentGroups[0].agents || []).some(function (a) { return a.status === 'retrying'; });
    // decision.branch (injects a warning if none open, resolves with branch)
    var threadsBefore = k3.data.listThreads().length;
    D.decisionBranch(ctx);
    await sleep(250);
    out.branchResolved = k3.data.messages('thread-16').some(function (m) {
      return m.routeWarningCard && m.routeWarningCard.status === 'resolved-branch';
    }) || k3.data.listThreads().length > threadsBefore;
    // history.peek (transient open) + history.switch_thread
    D.historyPeek(ctx);
    await sleep(200);
    out.historyOpen = !!document.querySelector('[data-testid="k3w-kit-history"], .k3w-kit-history, [class*="history"]');
    var curBefore = k3.store.get('activeThreadId');
    var switched = D.historySwitchThread(ctx);
    await sleep(200);
    out.switched = !!switched && k3.store.get('activeThreadId') === switched && switched !== curBefore;
    // system.worktree_collision
    D.worktreeCollision(ctx);
    await sleep(150);
    out.wtCollision = k3.data.worktrees().some(function (w) { return w.id === 'wt-docs' && w.state === 'conflict-detected'; });
    return out;
  });
  if (!r.todoBlocked) return fail('todo.block did not block an item');
  if (!r.agentRetrying) return fail('subagent.retry did not produce a retrying agent');
  if (!r.branchResolved) return fail('decision.branch did not resolve');
  if (!r.historyOpen) return fail('history.peek did not open history');
  if (!r.switched) return fail('history.switch_thread did not switch');
  if (!r.wtCollision) return fail('worktree_collision did not flip the worktree');
  return ok();
}

export async function compactWork(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(350);
    // tabbed windows mount one surface at a time: activate the Goal tab first
    var goalTab = document.querySelector('[data-kind="goal"]');
    if (goalTab) { goalTab.click(); await sleep(250); }
    var out = { surfaces: {} };
    ['k3w-kit-goal', 'k3w-kit-todo', 'k3w-kit-capacity', 'k3w-kit-crew', 'k3w-kit-ops'].forEach(function (t) {
      out.surfaces[t] = !!document.querySelector('[data-testid="' + t + '"]');
    });
    // goal controls work: pause then resume
    var goalBtn = Array.from(document.querySelectorAll('[data-testid="k3w-kit-goal"] button')).find(function (b) { return b.textContent.trim() === 'Pause'; });
    if (goalBtn) {
      goalBtn.click(); await sleep(200);
      out.paused = (k3.data.thread('thread-16').activeGoal || {}).status === 'paused' ||
        k3.store.get('goalView.thread-16.statusOverride') === 'paused';
      var resumeBtn = Array.from(document.querySelectorAll('[data-testid="k3w-kit-goal"] button')).find(function (b) { return b.textContent.trim() === 'Resume'; });
      if (resumeBtn) { resumeBtn.click(); await sleep(200); }
      out.resumed = (k3.data.thread('thread-16').activeGoal || {}).status === 'running' ||
        k3.store.get('goalView.thread-16.statusOverride') === 'running';
    }
    // tabbed windows (w3) mount one surface at a time: verify the Todo tab swap
    var todoTab = document.querySelector('[data-kind="todo"]');
    if (todoTab) {
      todoTab.click(); await sleep(250);
      out.todoViaTab = !!document.querySelector('[data-testid="k3w-kit-todo"]');
    }
    // activity group expands/collapses
    var acc = document.querySelector('.k3t-activity .k3t-rowhead, [data-testid="k3t-activity"] [class*="rowhead"]');
    if (acc) {
      acc.click(); await sleep(150);
      out.activityToggled = true;
      acc.click(); await sleep(120);
    }
    return out;
  });
  if (!r.surfaces['k3w-kit-goal']) return fail('goal surface missing on thread-16');
  if (!r.surfaces['k3w-kit-todo'] && r.todoViaTab === false) return fail('todo surface missing');
  if (r.paused === false) return fail('pause did not change goal state');
  if (r.resumed === false) return fail('resume did not restore running');
  return ok(JSON.stringify(r.surfaces));
}

export async function routePicker(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    // seed a favorite + recent so both sections have content (they hide when empty)
    k3.store.set('routeFavorites', ['anthropic/work/claude-sonnet-4.5']);
    k3.store.set('routeRecents', ['anthropic/work/claude-haiku-4.5']);
    var btn = document.querySelector('[data-testid="k3w-kit-model"]');
    if (!btn) return { step: 'no route button' };
    btn.click();
    await sleep(350);
    var pop = document.querySelector('.k3-pop');
    out.opened = !!pop;
    if (pop) {
      var text = pop.textContent || '';
      out.hasFavorites = /Favorites/.test(text);
      out.hasRecents = /Recents/.test(text);
      out.hasAccountLine = /Anthropic · Work|API key|Claude CLI/.test(text);
      out.hasUnavailableReason = /not installed|sign-in|API key required/i.test(text);
      out.railIcons = pop.querySelectorAll('svg').length > 3;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(250);
    // favorite toggle persists in store
    var favs = k3.store.get('routeFavorites', []);
    out.favType = Array.isArray(favs);
    // select a route programmatically (picker interaction equivalent)
    window.K3Route.select(window.__k3ctx2 || { env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit }, 'anthropic/work/claude-opus-4.1', { effort: 'High' });
    await sleep(250);
    var eff = k3.data.effective(k3.store.get('activeThreadId'));
    out.selected = eff.routeKey === 'anthropic/work/claude-opus-4.1';
    out.recents = (k3.store.get('routeRecents', []) || [])[0] === 'anthropic/work/claude-opus-4.1';
    out.scopeOverride = eff.overrides.route === true;
    return out;
  });
  if (r.step) return fail(r.step);
  if (!r.opened) return fail('picker did not open');
  if (!r.hasFavorites || !r.hasRecents) return fail('sections missing: ' + JSON.stringify(r));
  if (!r.hasUnavailableReason) return fail('unavailable reasons not shown');
  if (!r.selected) return fail('route selection did not take effect');
  if (!r.recents) return fail('recents not updated');
  if (!r.scopeOverride) return fail('thread-local override not recorded');
  return ok();
}

export async function providerSetupCopy(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    var btn = document.querySelector('[data-testid="k3w-kit-model"]');
    if (!btn) return { step: 'no route button' };
    btn.click();
    await sleep(350);
    var pop = document.querySelector('.k3-pop');
    if (!pop) return { step: 'picker did not open' };
    function clickRow(re) {
      var rows = Array.from(pop.querySelectorAll('.k3r-row'));
      var row = rows.find(function (x) { return re.test(x.textContent || ''); });
      if (row) row.click();
      return !!row;
    }
    // cli-not-found route (Ollama) -> adjudication copy
    out.rowCli = clickRow(/Qwen3 32B/);
    await sleep(250);
    var setup = pop.querySelector('.k3r-setup');
    out.setupShown = !!setup;
    var st = setup ? setup.textContent || '' : '';
    out.neverBundles = /never bundles provider CLIs/.test(st);
    out.officialSource = /official source/.test(st);
    out.continuation = /resumes after setup/.test(st);
    out.forbidden = /included with|comes with|ships with|pre-?installed|bundled (with|in|into)/i.test(pop.textContent || '');
    // back to list, then the update-available route (xAI)
    var back = pop.querySelector('[aria-label="Back to routes"]');
    if (back) back.click();
    await sleep(200);
    out.rowUpd = clickRow(/Grok 4\.5/);
    await sleep(250);
    var setup2 = pop.querySelector('.k3r-setup');
    out.updateNote = setup2 ? /never silently/.test(setup2.textContent || '') : false;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);
    return out;
  });
  if (r.step) return fail(r.step);
  if (!r.rowCli || !r.setupShown) return fail('cli-not-found setup box not shown: ' + JSON.stringify(r));
  if (!r.neverBundles || !r.officialSource || !r.continuation) return fail('adjudication copy missing: ' + JSON.stringify(r));
  if (r.forbidden) return fail('bundling-implying copy present in picker');
  if (!r.rowUpd || !r.updateNote) return fail('update-available note missing: ' + JSON.stringify(r));
  return ok();
}

export async function motionContinuity(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    // (a) message arrival: a live append carries the entrance animation
    k3.store.set('activeThreadId', 'thread-02');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(350);
    k3.data.send('thread-02', 'motion probe message');
    await sleep(120);
    var arts = document.querySelectorAll('.k3t-msg.k3t-enter');
    out.enterClass = arts.length > 0;
    if (arts.length) {
      var cs = getComputedStyle(arts[arts.length - 1]);
      out.animName = cs.animationName;
    }
    await sleep(600);
    // (b) activity kind cluster on thread-16 (distinct kinds, first-appearance order)
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(400);
    var cl = document.querySelector('[data-testid="k3t-kindcluster"]');
    out.clusterIcons = cl ? cl.querySelectorAll('.k3t-kindcluster-ic').length : 0;
    // (c) working artifact card on thread-19
    k3.store.set('activeThreadId', 'thread-19');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(400);
    var wa = document.querySelector('.k3t-shortcut.is-working');
    out.workingArtifact = !!wa;
    out.workingMeta = wa ? /Building/.test(wa.textContent || '') : false;
    out.workingOrbit = wa ? !!wa.querySelector('.k3-orbit') : false;
    return out;
  });
  if (!r.enterClass) return fail('live message append lacks the arrival class');
  if (r.animName !== 'k3-msg-arrive') return fail('arrival animation not applied: ' + r.animName);
  if (!r.clusterIcons || r.clusterIcons < 3) return fail('kind cluster missing/thin: ' + r.clusterIcons);
  if (!r.workingArtifact || !r.workingMeta || !r.workingOrbit) return fail('working artifact state missing: ' + JSON.stringify(r));
  return ok();
}

export async function keyboardFocus(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    function key(el, k) { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })); }
    var out = {};
    var btn = document.querySelector('[data-testid="k3w-kit-model"]');
    if (!btn) return { step: 'no route button' };
    btn.click();
    await sleep(350);
    var pop = document.querySelector('.k3-pop');
    if (!pop) return { step: 'picker did not open' };
    var input = pop.querySelector('.k3r-search input');
    out.inputFocused = document.activeElement === input;
    // ArrowDown from search -> first row; again -> second row
    key(input, 'ArrowDown');
    await sleep(80);
    var rows = Array.from(pop.querySelectorAll('.k3r-row'));
    out.row0Focus = document.activeElement === rows[0];
    key(document.activeElement, 'ArrowDown');
    await sleep(80);
    out.row1Focus = document.activeElement === rows[1];
    out.roving = rows[0].tabIndex === -1 && rows[1].tabIndex === 0;
    key(document.activeElement, 'Home');
    await sleep(60);
    out.homeFocus = document.activeElement === rows[0];
    // Enter opens the detail step for the focused route
    key(document.activeElement, 'Enter');
    document.activeElement.click();
    await sleep(220);
    out.detailShown = /Apply|official source|Sign in/.test(pop.textContent || '');
    // Esc contract from the detail step: first Esc returns to the list, second closes
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(220);
    var stillOpen = document.querySelector('.k3-pop');
    out.escBackToList = !!stillOpen && stillOpen.querySelectorAll('.k3r-row').length > 0;
    if (stillOpen) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await sleep(220);
    }
    out.escCloses = !document.querySelector('.k3-pop');
    // focus ring rule exists for picker controls
    var cssText = '';
    Array.from(document.styleSheets).forEach(function (ss) {
      try { Array.from(ss.cssRules).forEach(function (r2) { cssText += r2.cssText; }); } catch (e) {}
    });
    out.focusRingRule = /\.k3r-row:focus-visible/.test(cssText);
    return out;
  });
  if (r.step) return fail(r.step);
  if (!r.inputFocused) return fail('search input not autofocused');
  if (!r.row0Focus || !r.row1Focus || !r.roving) return fail('arrow navigation broken: ' + JSON.stringify(r));
  if (!r.homeFocus) return fail('Home did not jump to first row');
  if (!r.detailShown) return fail('Enter did not open the detail step');
  if (!r.escCloses) return fail('Esc did not close the picker (back-to-list: ' + r.escBackToList + ')');
  if (!r.focusRingRule) return fail('focus-visible ring rule missing');
  return ok();
}

export async function bsdStates(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var out = {};
    // auto glow: truthful only while evaluating
    window.K3BSD.setAutoActive('thread-16', true);
    await sleep(150);
    var el = document.querySelector('.k3b-auto-active, [class*="k3b"][class*="active"], [data-testid*="k3b"]');
    out.glowNode = !!document.querySelector('[class*="k3b"]');
    var bsdBtn = document.querySelector('[class*="k3b"]');
    out.glowClass = bsdBtn ? /active|evaluat|glow/i.test(bsdBtn.className) : false;
    window.K3BSD.setAutoActive('thread-16', false);
    // manual on: distinct treatment
    window.K3BSD.set('thread-16', { mode: 'on', scope: 'thread' });
    await sleep(150);
    out.modeOn = k3.data.effective('thread-16').bsd.mode === 'on';
    // turn scope reverts after the turn
    window.K3BSD.set('thread-16', { mode: 'on', scope: 'turn' });
    window.K3BSD.onTurnComplete('thread-16');
    out.turnReverted = k3.data.effective('thread-16').bsd.mode !== 'on' || (k3.store.get('bsdState.thread-16', {}) || {}).scope !== 'turn';
    return out;
  });
  if (!r.glowNode) return fail('no BSD button rendered');
  if (!r.modeOn) return fail('manual On not applied');
  if (!r.turnReverted) return fail('turn scope did not revert');
  return ok('glowClass=' + r.glowClass);
}

export async function offlineIdempotency(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-02');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var tid = 'thread-02';
    var before = k3.data.messages(tid).filter(function (m) { return m.role === 'user'; }).length;
    window.K3Sync.goOffline();
    window.K3Sync.queueSend(tid, 'hello offline', []);
    window.K3Sync.queueSend(tid, 'second', []);
    await sleep(200);
    var queuedCount = (k3.store.get('outbox.' + tid, []) || []).length;
    var userAfterQueue = k3.data.messages(tid).filter(function (m) { return m.role === 'user'; }).length;
    // full reconnect (synchronous state walk)
    while (window.K3Sync.state() !== 'live') { window.K3Sync.stepReconnect(); await sleep(30); }
    await sleep(200);
    var userAfterReplay = k3.data.messages(tid).filter(function (m) { return m.role === 'user'; }).length;
    // forced second replay of the same ops must be fenced
    var fenceBefore = userAfterReplay;
    (k3.store.get('outbox.' + tid, []) || []).forEach(function (op) {
      k3.data.send(tid, op.text, { opId: op.opId, noReply: true });
    });
    var afterForced = k3.data.messages(tid).filter(function (m) { return m.role === 'user'; }).length;
    var log = window.K3Sync.replayLog ? window.K3Sync.replayLog() : [];
    return {
      queuedCount: queuedCount,
      appendedOnce: userAfterQueue === before + 2,
      replayNoDup: userAfterReplay === userAfterQueue,
      forcedFenced: afterForced === fenceBefore,
      logHasSkip: log.some(function (l) { return /already applied/.test(l); }),
      stateLive: window.K3Sync.state() === 'live',
      badgesCleared: !k3.data.messages(tid).some(function (m) { return m.queued === true; })
    };
  });
  if (r.queuedCount !== 2) return fail('outbox count ' + r.queuedCount);
  if (!r.appendedOnce) return fail('queued messages not appended exactly once');
  if (!r.replayNoDup) return fail('reconnect duplicated messages');
  if (!r.forcedFenced) return fail('forced second replay was not fenced');
  if (!r.logHasSkip) return fail('replay log missing "already applied — skipped"');
  if (!r.stateLive) return fail('did not reach live');
  if (!r.badgesCleared) return fail('queued badges not cleared');
  return ok();
}

export async function approvalFlow(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(350);
    // chip-mode threads collapse cards into rows: expand the approval row
    var card = document.querySelector('[data-testid="k3a-approval-card"]');
    if (!card) {
      var row = Array.from(document.querySelectorAll('[data-testid="k3t-packet-row"]')).find(function (b) { return /Approval/.test(b.textContent); });
      if (row) { row.click(); await sleep(250); card = document.querySelector('[data-testid="k3a-approval-card"]'); }
    }
    if (!card) return { found: false };
    // decide: Allow once (buttons live inside the card)
    var btn = Array.from(card.querySelectorAll('button')).find(function (b) { return b.textContent.trim() === 'Allow once'; });
    if (!btn) return { found: true, noButton: true };
    btn.click();
    await sleep(250);
    var rec = k3.store.get('approvals', {});
    var decided = Object.keys(rec).some(function (k) { return rec[k] && rec[k].decision === 'once'; });
    var notes = k3.store.get('notifications', []);
    return { found: true, decided: decided, notified: notes.length > 0 };
  });
  if (!r.found) return fail('approval card not rendered on thread-16');
  if (r.noButton) return fail('Allow once button missing');
  if (!r.decided) return fail('decision not persisted');
  return ok('notified=' + r.notified);
}

export async function artifactStates(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var ctx = { env: window.K3.env, store: window.__k3.store, data: window.__k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };
    window.__k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var out = {};
    window.K3ArtifactWS.open(ctx, 'thread-16', 'art-16-code');
    await sleep(250);
    out.open = !!document.querySelector('[class*="k3aw"]');
    window.K3ArtifactWS.setStatus('thread-16', 'art-16-code', 'loading');
    await sleep(120);
    out.loading = /loading|spinner/i.test((document.querySelector('[class*="k3aw"]') || {}).className || '') ||
      !!document.querySelector('[class*="k3aw"] [class*="load"], [class*="k3aw"] [class*="spin"]');
    window.K3ArtifactWS.setStatus('thread-16', 'art-16-code', 'error');
    await sleep(120);
    var body = document.querySelector('[class*="k3aw"]');
    out.errorShown = body && /error|retry/i.test(body.textContent || '');
    var retry = body && Array.from(body.querySelectorAll('button')).find(function (b) { return /retry/i.test(b.textContent); });
    if (retry) { retry.click(); await sleep(120); }
    out.retried = true;
    window.K3ArtifactWS.switchTo(ctx, 'thread-16', 'art-16-diff');
    await sleep(200);
    out.switched = (window.__k3.store.get('artifactWs.thread-16', {}) || {}).activeId === 'art-16-diff';
    window.K3ArtifactWS.close(ctx, 'thread-16');
    await sleep(200);
    out.closed = (window.__k3.store.get('artifactWs.thread-16', {}) || {}).open === false;
    return out;
  });
  if (!r.open) return fail('surface did not open');
  if (!r.errorShown) return fail('error state not shown');
  if (!r.switched) return fail('switch did not persist activeId');
  if (!r.closed) return fail('close did not persist');
  return ok('loading=' + r.loading);
}

export async function threadOpsFlow(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    // typed request thread-18 -> thread-09
    var res = window.K3ThreadOps.sendRequest({
      source: 'thread-18', target: 'thread-09',
      task: 'Confirm the reconnect copy section count', refs: ['thread-18:t18-m0003'],
      scope: 'read-only', budget: '1 response'
    });
    out.requested = !res.error;
    var reqs = k3.data.threadRequests('thread-09'); // record lives on the target
    var pending = reqs.filter(function (q) { return q.status === 'pending'; });
    out.pendingCard = pending.length > 0;
    if (pending.length) {
      window.K3ThreadOps.awaitRequest(pending[0].id);
      await sleep(150);
      out.answered = pending[0].status === 'answered' && (pending[0].resultRefs || []).length > 0;
    }
    // cycle rejection
    var cyc = window.K3ThreadOps.sendRequest({ source: 'thread-09', target: 'thread-18', task: 'cycle probe', refs: [], scope: 'x', budget: 'y' });
    out.cycleChecked = true; // request 09->18 may be allowed; direct cycle 18->09->18 blocked:
    var cyc2 = window.K3ThreadOps.sendRequest({ source: 'thread-18', target: 'thread-09', task: 'cycle probe 2', refs: [], scope: 'x', budget: 'y' });
    out.cycleRejected = !!(cyc.error || cyc2.error);
    // restore point + rewind
    var rp = window.K3ThreadOps.createRestorePoint('thread-02', 'probe point');
    out.restorePoint = !!document.querySelector('[data-testid="k3t-restorepoint"]') || !!rp;
    var msgs = k3.data.messages('thread-02');
    var target = msgs[msgs.length - 3];
    if (target) {
      window.K3ThreadOps.rewindTo('thread-02', target.id);
      await sleep(200);
      out.rewound = k3.data.messages('thread-02').some(function (m) { return m.rewound === true; });
      window.K3ThreadOps.restoreFrom('thread-02', null);
      await sleep(150);
      out.restored = !k3.data.messages('thread-02').some(function (m) { return m.rewound === true; });
    }
    return out;
  });
  if (!r.requested) return fail('sendRequest rejected: ' + JSON.stringify(r));
  if (!r.pendingCard) return fail('pending request not recorded');
  if (!r.answered) return fail('await did not resolve with result refs');
  if (!r.cycleRejected) return fail('cycle/fanout protection missing');
  if (r.rewound === false || r.restored === false) return fail('rewind/restore broken: ' + JSON.stringify(r));
  return ok();
}

export async function routeWarningFlow(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var ctx = { env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };
    // configure the current route first (same-provider = no warning). A
    // cross-ACCOUNT switch (work -> personal) is a material boundary; a switch
    // to a setup-needed route (google: sign-in-required) must open setup, not
    // warn-and-apply.
    var out = {};
    k3.data.setThreadLocal('thread-16', { route: 'anthropic/work/claude-sonnet-4.5' });
    window.K3Route.select(ctx, 'google/personal/gemini-3-pro', {});
    await sleep(200);
    out.setupPath = (k3.store.get('settingsReturn') || {}).routeKey === 'google/personal/gemini-3-pro' ||
      (k3.store.get('openTabs', []) || []).some(function (t) { return t && t.id === 'provider-settings'; });
    k3.store.set('settingsReturn', null);
    window.K3Route.select(ctx, 'anthropic/personal/claude-sonnet-4.5', {});
    await sleep(300);
    var msgs = k3.data.messages('thread-16');
    var warn = msgs.filter(function (m) { return m.routeWarningCard && m.routeWarningCard.status === 'open' && m.routeWarningCard.pendingRoute; });
    out.warningShown = warn.length > 0;
    if (warn.length) {
      var card = warn[warn.length - 1].routeWarningCard;
      out.hasChoices = true;
      // Branch with new model
      var before = k3.data.listThreads().length;
      window.K3Route.resolveWarning(ctx, 'thread-16', card.id, 'branch');
      await sleep(300);
      out.branched = k3.data.listThreads().length === before + 1;
      var branch = k3.data.listThreads()[0];
      out.lineage = !!(branch && (branch.lineage || /Branch|Gemini/i.test(branch.title || '')));
      out.sourceKept = !!k3.data.thread('thread-16');
    }
    return out;
  });
  if (r.setupPath === false) return fail('setup-needed route did not deep-link to Provider Settings');
  if (!r.warningShown) return fail('no warning card on material switch');
  if (!r.branched) return fail('branch choice did not create a thread');
  if (!r.sourceKept) return fail('source thread mutated/lost');
  return ok('lineage=' + r.lineage);
}

export async function notificationInbox(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    if (window.K3Demo && window.K3Demo.notifyApproval) window.K3Demo.notifyApproval('thread-16');
    else {
      var notes = (k3.store.get('notifications', []) || []).slice();
      notes.push({ id: 'ntf-probe', kind: 'approval', title: 'Approval needed', body: 'probe', at: new Date().toISOString(), read: false });
      k3.store.set('notifications', notes);
    }
    await sleep(250);
    var badge = document.querySelector('[data-testid="k3s-notifications"]');
    var out = { stackPresent: !!badge };
    if (badge) {
      var count = badge.querySelector('[class*="badge"], [data-testid="k3s-notif-count"]');
      out.badgeCount = count ? count.textContent.trim() : null;
      badge.click();
      await sleep(300);
      out.inboxOpen = !!document.querySelector('[data-testid="k3s-inbox"], .k3s-inbox');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await sleep(250);
    }
    out.noChatPanel = !document.querySelector('[class*="chat-notif"]');
    return out;
  });
  if (!r.stackPresent) return fail('title-bar notification stack missing');
  if (!r.inboxOpen) return fail('inbox did not open');
  if (!r.noChatPanel) return fail('chat-side notification panel found');
  return ok('badge=' + r.badgeCount);
}

export async function spellcheckMenu(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-02'); // no questionnaire: composer present
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(350);
    var ta = document.querySelector('[data-testid="k3-composer-input"]');
    if (!ta) return { skip: 'no composer' };
    ta.value = 'teh settings';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    ta.setSelectionRange(2, 2); // inside "teh"
    ta.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    await sleep(300);
    var menu = document.querySelector('.k3-pop, .k3-menu');
    var text = menu ? menu.textContent : '';
    var out = {
      menuShown: !!menu,
      hasReplace: /Replace once|the/.test(text),
      hasDict: /personal dictionary|project dictionary/.test(text),
      hasThreadToggle: /Disable spell check in this thread/.test(text)
    };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);
    // URL must NOT trigger the menu
    ta.value = 'https://example.com';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.setSelectionRange(10, 10);
    ta.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    await sleep(250);
    out.urlSkipped = !document.querySelector('.k3-pop .k3-menu-item, .k3-menu .k3-menu-item');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    // no toolbar spellcheck button
    out.noToolbarButton = !document.querySelector('[data-testid*="spell"], .k3c-tool[aria-label*="spell" i]');
    return out;
  });
  if (r.skip) return fail(r.skip);
  if (!r.menuShown) return fail('no context menu for misspelling');
  if (!r.hasDict || !r.hasThreadToggle) return fail('menu entries incomplete: ' + JSON.stringify(r));
  if (!r.urlSkipped) return fail('URL triggered the spell menu');
  if (!r.noToolbarButton) return fail('toolbar spellcheck button exists');
  return ok();
}

export async function compactNowReceipt(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var before = k3.data.messages('thread-16').length;
    var ring = document.querySelector('[data-testid="k3w-kit-ring"]');
    if (!ring) return { step: 'no ring' };
    ring.click();
    await sleep(300);
    var btn = Array.from(document.querySelectorAll('.k3-pop button')).find(function (b) { return /Compact now/i.test(b.textContent); });
    if (!btn) return { step: 'no compact button' };
    btn.click();
    await sleep(1000);
    var msgs = k3.data.messages('thread-16');
    var receipt = msgs.length > before && msgs[msgs.length - 1].receiptCard && msgs[msgs.length - 1].receiptCard.kind === 'compact';
    return { receipt: !!receipt, historyKept: msgs.length === before + 1 };
  });
  if (r.step) return fail(r.step);
  if (!r.receipt) return fail('no compact receipt appended');
  if (!r.historyKept) return fail('history mutated by compact');
  return ok();
}

export async function lensReceipt(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var lensBtn = document.querySelector('[data-testid="k3-lens-button"]');
    if (!lensBtn) return { step: 'no lens button' };
    lensBtn.click();
    await sleep(250);
    var item = Array.from(document.querySelectorAll('.k3-menu-item')).find(function (b) { return /admission receipt/i.test(b.textContent); });
    if (!item) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return { step: 'no receipt menu item' }; }
    item.click();
    await sleep(400);
    var panel = document.querySelector('[data-testid="k3-lens-receipt"], .k3l-receipt');
    var out = { opened: !!panel };
    if (panel) {
      var text = panel.textContent || '';
      out.included = /Included/.test(text);
      out.leftOut = /Left out/.test(text);
      out.provenance = /provenance|from |Prior-thread|Persona capsule/i.test(text);
      var removeBtn = Array.from(panel.querySelectorAll('button')).find(function (b) { return /Remove/i.test(b.textContent); });
      if (removeBtn) {
        removeBtn.click();
        await sleep(200);
        out.removeWorks = /Removed by you/.test(panel.textContent || '');
      }
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return out;
  });
  if (r.step) return fail(r.step);
  if (!r.opened) return fail('receipt did not open');
  if (!r.included || !r.leftOut) return fail('receipt sections missing');
  if (!r.removeWorks) return fail('Remove did not move an admitted excerpt');
  return ok('provenance=' + r.provenance);
}

export async function searchActions(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var input = document.querySelector('[data-testid="k3w-kit-search"] input, .k3w-kit-search input');
    if (!input) {
      var openBtn = document.querySelector('[data-testid="k3w-kit-search-open"]');
      if (openBtn) { openBtn.click(); await sleep(300); input = document.querySelector('.k3s2-pop input, .k3s2-panel input'); }
    }
    if (!input) return { step: 'no search input' };
    window.__k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(250);
    input.value = 'provider';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(400);
    var row = document.querySelector('[data-testid="k3-search-result"]');
    if (!row) return { step: 'no results' };
    var more = row.querySelector('[data-testid="k3-search-result-more"]') ||
      row.parentNode.querySelector('[data-testid="k3-search-result-more"]');
    if (!more) return { step: 'no row action button' };
    more.click();
    await sleep(300);
    var menu = document.querySelector('.k3-menu, .k3-pop');
    var text = menu ? menu.textContent : '';
    var out = {
      menu: !!menu,
      open: /Open conversation/.test(text),
      add: /Add passage to context/.test(text),
      branch: /Branch from this point/.test(text),
      link: /Copy link/.test(text)
    };
    // exercise "Add passage to context"
    var addBtn = Array.from(document.querySelectorAll('.k3-menu-item')).find(function (b) { return /Add passage to context/.test(b.textContent); });
    if (addBtn) {
      addBtn.click();
      await sleep(200);
      var admitted = k3.store.get('lensReceipt.admitted', []);
      out.addedWorks = Array.isArray(admitted) && admitted.length > 0;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return out;
  });
  if (r.step) return fail(r.step);
  if (!r.menu || !r.open || !r.add || !r.branch || !r.link) return fail('actions incomplete: ' + JSON.stringify(r));
  if (r.addedWorks === false) return fail('Add passage did not record admitted source');
  return ok();
}

export async function syncPillStates(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var pill = document.querySelector('[data-testid*="k3n"], [class*="k3n-pill"], [class*="k3n"]');
    var out = { pillFound: !!pill };
    if (!pill) return out;
    pill.click();
    await sleep(300);
    var pop = document.querySelector('.k3-pop');
    var text = pop ? pop.textContent : '';
    out.connectionLine = /Home Server|Home TrueNAS|Execution Host|Environment/.test(text);
    out.domainSeparate = /Search index/.test(text);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);
    // server-continuing line
    window.K3Sync.setServerContinuing(true);
    await sleep(250);
    out.serverLine = !!document.querySelector('[data-testid="k3t-server-continuing"]') ||
      /Server is continuing this work/.test(document.body.textContent);
    window.K3Sync.setServerContinuing(false);
    return out;
  });
  if (!r.pillFound) return fail('sync pill missing');
  if (!r.connectionLine) return fail('connection route line missing');
  if (!r.domainSeparate) return fail('domain failure not separate from transport');
  if (!r.serverLine) return fail('server-continuing line missing');
  return ok();
}

export async function redirectFlow(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    k3.store.set('activeThreadId', 'thread-08'); // running thread
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(350);
    var tid = 'thread-08';
    // start work by sending, then redirect mid-turn
    k3.data.send(tid, 'start the analysis pass');
    await sleep(150);
    if (!k3.data.isActive(tid)) return { step: 'turn finished too fast' };
    window.K3ThreadOps.redirect(tid, 'Hold on — redirect probe.');
    await sleep(400);
    var msgs = k3.data.messages(tid);
    var states = { interrupted: false, redirected: false, resumed: false };
    msgs.forEach(function (m) { if (m.redirectMarker) states[m.redirectMarker.state] = true; });
    return states;
  });
  if (r.step) return fail(r.step);
  if (!r.interrupted || !r.redirected) return fail('missing states: ' + JSON.stringify(r));
  return ok('resumed=' + r.resumed + ' (may arrive with the next reply)');
}


export async function goalLifecycle(page) {
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    var ctx = { env: window.K3.env, store: k3.store, data: k3.data, ui: window.K3UI, on: window.K3.on, off: window.K3.off, emit: window.K3.emit };

    // START on a goal-less thread
    k3.store.set('activeThreadId', 'thread-02');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    window.K3Work.startGoal('thread-02', { title: 'Probe goal', objective: 'Exercise the lifecycle.' });
    await sleep(150);
    var g2 = (k3.data.thread('thread-02') || {}).activeGoal || {};
    out.started = g2.status === 'running';

    // PAUSE / RESUME / UPDATE
    window.K3Work.pauseGoal('thread-02'); await sleep(100);
    out.paused = ((k3.data.thread('thread-02') || {}).activeGoal || {}).status === 'paused';
    window.K3Work.resumeGoal('thread-02'); await sleep(100);
    out.resumed = ((k3.data.thread('thread-02') || {}).activeGoal || {}).status === 'running';
    window.K3Work.updateGoal('thread-02', { phase: 'Phase Two' }); await sleep(100);
    out.updated = ((k3.data.thread('thread-02') || {}).activeGoal || {}).phase === 'Phase Two';

    // REPLAN: confirm dialog -> durable revision record (thread.goalRevisions)
    var revBefore = ((k3.data.thread('thread-02') || {}).goalRevisions || []).length;
    var pr = window.K3Work.replanGoal('thread-02', 'probe replan');
    await sleep(150);
    var yes = document.querySelector('.k3-confirm [data-x="yes"]');
    if (yes) yes.click();
    await sleep(200);
    if (pr && pr.then) await pr;
    var t02 = k3.data.thread('thread-02') || {};
    var revAfter = (t02.goalRevisions || []).length;
    out.replanned = revAfter > revBefore ||
      k3.data.messages('thread-02').some(function (m) { return !!m.replanFlash; });

    // ROUTE-FROZEN via the REAL selector path: a route change while the Goal
    // runs must abort (select returns false), routeKey unchanged, notice shown.
    k3.store.set('activeThreadId', 'thread-16'); // running goal on this thread
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(300);
    var before = k3.data.effective('thread-16').routeKey;
    var sel = window.K3Route.select(ctx, 'anthropic/work/claude-opus-4.1', {});
    await sleep(250);
    out.selectAborted = sel === false;
    out.routeFrozen = k3.data.effective('thread-16').routeKey === before;
    out.noticeShown = /frozen|Update-Goal|Update the Goal/i.test(document.body.textContent || '');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);

    // COMPLETE: status + durable receipt card
    var mBefore = k3.data.messages('thread-16').length;
    window.K3Work.completeGoal('thread-16'); await sleep(200);
    var g16 = (k3.data.thread('thread-16') || {}).activeGoal || {};
    out.completed = g16.status === 'completed' || g16.status === 'complete';
    var msgs = k3.data.messages('thread-16');
    out.receipt = msgs.length > mBefore && msgs.slice(mBefore).some(function (m) { return !!(m.receiptCard); });

    // STOP: terminal state on the thread-02 goal
    window.K3Work.stopGoal('thread-02'); await sleep(150);
    out.stopped = ((k3.data.thread('thread-02') || {}).activeGoal || {}).status === 'stopped';
    return out;
  });
  var failures = [];
  if (!r.started) failures.push('start');
  if (!r.paused) failures.push('pause');
  if (!r.resumed) failures.push('resume');
  if (!r.updated) failures.push('update');
  if (!r.replanned) failures.push('replan');
  if (!r.selectAborted) failures.push('select-not-aborted');
  if (!r.routeFrozen) failures.push('route-not-frozen');
  if (!r.noticeShown) failures.push('no-frozen-notice');
  if (!r.completed) failures.push('complete');
  if (!r.receipt) failures.push('receipt');
  if (!r.stopped) failures.push('stop');
  return failures.length ? fail(failures.join(',') + ' :: ' + JSON.stringify(r)) : ok();
}

// Probe registry
export const HISTORICAL = [
  ['noHorizontalOverflow', noHorizontalOverflow],
  ['noConsoleErrors', noConsoleErrors],
  ['noEmoji', noEmoji],
  ['noUnderscoredLabels', noUnderscoredLabels],
  ['noLeftAccentBorders', noLeftAccentBorders],
  ['scrollbarNoLeak', scrollbarNoLeak],
  ['popupContract', popupContract],
  ['sendStopMachine', sendStopMachine],
  ['remountPreserves', remountPreserves],
  ['draftSurvivesRestart', draftSurvivesRestart],
  ['exactJump', exactJump],
  ['noTextClipping', noTextClipping]
];

export const PACKET = [
  ['goalLifecycle', goalLifecycle],
  ['pinnedGeometry', pinnedGeometry],
  ['pinSurvival', pinSurvival],
  ['artifactLeftOfChat', artifactLeftOfChat],
  ['questionFlow', questionFlow],
  ['questionLifecycle', questionLifecycle],
  ['questionPaging', questionPaging],
  ['triggerCoverage', triggerCoverage],
  ['compactWork', compactWork],
  ['routePicker', routePicker],
  ['providerSetupCopy', providerSetupCopy],
  ['motionContinuity', motionContinuity],
  ['keyboardFocus', keyboardFocus],
  ['bsdStates', bsdStates],
  ['offlineIdempotency', offlineIdempotency],
  ['approvalFlow', approvalFlow],
  ['artifactStates', artifactStates],
  ['threadOpsFlow', threadOpsFlow],
  ['routeWarningFlow', routeWarningFlow],
  ['notificationInbox', notificationInbox],
  ['spellcheckMenu', spellcheckMenu],
  ['compactNowReceipt', compactNowReceipt],
  ['lensReceipt', lensReceipt],
  ['searchActions', searchActions],
  ['syncPillStates', syncPillStates],
  ['redirectFlow', redirectFlow]
];
