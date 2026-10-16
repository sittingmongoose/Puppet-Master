/* The page frame's pieces no other thread owns (the planner, 2026-10-10, after the cross-look review). The concept demo
   widget (the onboarding's scenario switcher, #o55-demo) floated over the bottom-left corner as a capsule with a
   capsule chip, covering the status bar's text, the rail's footer and the bottom panel. It now docks into a slot the
   status bar reserves at its left end: the slot takes the widget's width in the bar's own flex row, so the bar's
   items move over for it, and the widget sits on the slot as one status item (20-shell.css). The widget stays a child
   of <body>: the onboarding window marks every other body child inert and keeps the widget usable, which it could not
   do from inside the bar.
   The notice anchor: the title bar's notifications (window.toast; NieR Mode voices the same cards as Pod 042 reports)
   stage their cards in #rsStage just under the bell and then fly up into it, so on Home they landed on the strip and
   header row of the panel below the bell, covering its tabs and controls. The stage keeps its place under the bell
   (the flight still reads), and drops just far enough to clear what is below it: the panel's strip and header row,
   or the chat's header. The drop is measured when a card arrives, before it paints. Other pages keep the page's own
   place. */

(function () {
/* its own scope: the names below never meet the core's */
var shell = PMW.pageShell = { installed: false };
var SLOT_CLASS = 'pmw-demo-slot';

function statusBar() { return doc.getElementById('pm7GlobalStatusBar'); }
function demoEl() { return doc.getElementById('o55-demo'); }

function slotIn(bar) {
  var s = bar.querySelector('.' + SLOT_CLASS);
  if (!s) {
    s = doc.createElement('span');
    s.className = SLOT_CLASS;
    s.setAttribute('aria-hidden', 'true');
    bar.insertBefore(s, bar.firstChild);
  }
  return s;
}

var queued = false;
function place() {
  queued = false;
  var bar = statusBar(), d = demoEl();
  if (!bar || !d) return;
  var slot = slotIn(bar);
  var btn = d.querySelector('button[data-demo="toggle"]');
  var w = btn ? Math.ceil(btn.getBoundingClientRect().width) : 0;
  if (w && slot.style.width !== w + 'px') slot.style.width = w + 'px';
  var r = slot.getBoundingClientRect(), br = bar.getBoundingClientRect();
  var vh = doc.documentElement.clientHeight;
  var cs = getComputedStyle(bar);
  d.style.setProperty('--pmw-demo-x', Math.round(r.left) + 'px');
  d.style.setProperty('--pmw-demo-y', Math.max(0, Math.round(vh - br.bottom)) + 'px');
  d.style.setProperty('--pmw-demo-h', Math.round(br.height || 25) + 'px');
  d.style.setProperty('--pmw-sb-font', cs.fontFamily);
  if (!d.hasAttribute('data-pmw-docked')) d.setAttribute('data-pmw-docked', '');
}
function schedule() { if (queued) return; queued = true; nextFrame(place); }

shell.install = function () {
  if (shell.installed) return true;
  var bar = statusBar(), d = demoEl();
  if (!bar || !d) {
    // the page builds its status bar and the onboarding mounts the widget on their own schedules: try again a few times
    shell.tries = (shell.tries || 0) + 1;
    if (shell.tries <= 40) setTimeout(shell.install, 250);
    return false;
  }
  shell.installed = true;
  place();
  if (typeof ResizeObserver === 'function') {
    var ro = new ResizeObserver(schedule);
    ro.observe(bar);
    ro.observe(d);   // the widget re-renders its button in place; the container keeps the button's size
  }
  window.addEventListener('resize', schedule);
  bus.on('look', schedule);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(schedule);
  shell.installNotices();
  return true;
};
shell.place = place;

/* ---- the notice anchor ---- */
var NOTICE_GAP = 10;     // the page's own gap between the bell and the first card
var CHAT_HEAD = 44;      // the chat's header row (the stand-in's 44 px; the page chat's is shorter)
function visibleIn(root, sel) {
  var els = root.querySelectorAll(sel);
  for (var i = 0; i < els.length; i++) if (els[i].offsetParent !== null && els[i].getClientRects().length) return els[i];
  return null;
}
/* the overlays a person works in that sit in a panel's top area: the terminal's Appearance popover and find bar, the
   editor's find bar, the panels' own open menus, and anything a kind marks data-pmw-overlay while it is open */
var OVERLAY_SEL = '.pmt-pop, .pmt-findbar, .pmw-ed-find:not([hidden]), [data-pmw-overlay]';
/* how far below its own place the stage has to start so that a card covers no strip, header row, chat header or open
   overlay in its column */
/* Jared #19 (2026-10-15, the coordinator's ruling A, by pm7-liquid-glass): on every page the stage hangs tight under the
   title bar at the bell (BAR_GAP below the bar's bottom edge), so the cards read as the bell's, and drops only past a
   tab strip right under it (within STRIP_REACH of the bar, across the cards' width). On Home it also clears the
   panel's strip, header row, chat header or an open overlay, as before. Home's drop used to be measured only when a card
   arrived on Home and was never cleared, so every other page kept it (cards 74 px down, mid-screen). The stage is now
   measured again on every page change. */
var BAR_GAP = 6, STRIP_REACH = 60;
var STRIP_SEL = '[role="tablist"], .pm-segtab, .pmw-strip, .workspace-tabs';
function noticeDrop(host) {
  var hr = host.getBoundingClientRect();
  var x = hr.left + hr.width / 2, top = hr.bottom + NOTICE_GAP, want = top;
  var bar = doc.querySelector('.title-bar'), br = bar && bar.getClientRects().length ? bar.getBoundingClientRect() : null;
  if (br && br.height) want = Math.max(want, br.bottom + BAR_GAP);
  var stage = doc.getElementById('rsStage'), half = (stage && stage.offsetWidth ? stage.offsetWidth : 344) / 2;
  var page = doc.querySelector('.primary-content > .page.active'), base = want;
  if (page) {
    var strips = page.querySelectorAll(STRIP_SEL);
    for (var s0 = 0; s0 < strips.length; s0++) {
      var sr = strips[s0].getClientRects().length ? strips[s0].getBoundingClientRect() : null;
      if (sr && sr.width && sr.right > x - half && sr.left < x + half && sr.top < base + STRIP_REACH && sr.bottom > base) want = Math.max(want, sr.bottom + 8);
    }
  }
  if (!homeIsPage() || !state.centre) return Math.max(0, Math.round(want - top));
  var panels = state.centre.querySelectorAll('.pmw-panel');
  for (var i = 0; i < panels.length; i++) {
    var pr = panels[i].getBoundingClientRect();
    if (!pr.width || x < pr.left || x > pr.right || pr.bottom < top || pr.top > top + 140) continue;
    var strip = visibleIn(panels[i], '.pmw-strip'), row = visibleIn(panels[i], '.pmw-hrow');
    var clear = Math.max(strip ? strip.getBoundingClientRect().bottom : pr.top, row ? row.getBoundingClientRect().bottom : 0);
    var ovs = panels[i].querySelectorAll(OVERLAY_SEL);
    for (var j = 0; j < ovs.length; j++) {
      var orr = ovs[j].getClientRects().length ? ovs[j].getBoundingClientRect() : null;
      if (orr && orr.width && x >= orr.left && x <= orr.right && orr.top < top + 140) clear = Math.max(clear, orr.bottom);
    }
    want = Math.max(want, clear + 8);
  }
  var menus = doc.querySelectorAll('#pmw-overlay .pmw-pop');
  for (var k = 0; k < menus.length; k++) {
    var mr = menus[k].getClientRects().length ? menus[k].getBoundingClientRect() : null;
    if (mr && mr.width && x >= mr.left && x <= mr.right && mr.top < top + 140) want = Math.max(want, mr.bottom + 8);
  }
  var chat = doc.getElementById('chatPanel');
  if (chat && !chat.classList.contains('hidden')) {
    var cr = chat.getBoundingClientRect();
    if (cr.width > 100 && x >= cr.left && x <= cr.right && cr.top < top + 40) want = Math.max(want, cr.top + CHAT_HEAD + 8);
  }
  return Math.max(0, Math.round(want - top));
}
/* review r3 (2026-10-15), the coordinator's ruling on #19: nothing the notices show may sit over a control. From the
   place above (under the bell), the cards' column moves to the nearest spot where it covers no button, field, link, tab
   or switch of the page: first down, then to either side, within reach of the bell. With no such spot it stays and says
   so (data-pmn-crowded); a toast staged there then shows for a shorter time (onboarding 19-notify.js). The controls are
   read once per placement from their boxes (no hit tests), and only while a card shows. */
var CONTROL_SEL = 'button, a[href], input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="menuitem"], [role="option"], [role="slider"], [contenteditable="true"]';
var SPOT_DOWN = 320, SPOT_SIDE = 280, SPOT_STEP = 12, SPOT_PAD = 4;
function controlsIn(x0, x1, y0, y1, stage) {
  /* the page that shows (the others keep their layout while hidden), the chat, the left column and the title bar */
  var out = [], roots = [doc.querySelector('.primary-content > .page.active'), doc.getElementById('chatPanel'), doc.querySelector('.left-panel'), doc.querySelector('.title-bar')];
  for (var r = 0; r < roots.length; r++) {
    if (!roots[r]) continue;
    var list = roots[r].querySelectorAll(CONTROL_SEL);
    for (var i = 0; i < list.length; i++) {
      var e = list[i]; if (stage.contains(e) || e.closest('#notifySlot')) continue;
      var b = e.getBoundingClientRect();
      if (b.width < 2 || b.height < 2 || b.right < x0 || b.left > x1 || b.bottom < y0 || b.top > y1) continue;
      out.push(b);
    }
  }
  return out;
}
function noticeSpot(host, stage) {
  var drop = noticeDrop(host), spot = { drop: drop, shift: 0, crowded: false };
  var cards = 0; for (var c = stage.firstElementChild; c; c = c.nextElementSibling) if (c.getClientRects().length && !c.classList.contains('pmn-flying') && !c.classList.contains('pmn-leaving')) cards++;
  if (!cards) return spot;
  var sr = stage.getBoundingClientRect(); if (sr.height < 4 || sr.width < 4) return spot;
  /* where the column starts with no drop and no shift: its top from the bell's slot (top: 100% + NOTICE_GAP + drop, in
     css/20-shell.css), its left from where it is now less the shift it has */
  var curShift = parseFloat(stage.style.getPropertyValue('--pmw-notice-shift')) || 0;
  var left0 = sr.left - curShift, top0 = host.getBoundingClientRect().bottom + NOTICE_GAP, w = sr.width, h = sr.height;
  var vw = doc.documentElement.clientWidth, vh = doc.documentElement.clientHeight;   /* the app's own frame */
  var cs = controlsIn(left0 - SPOT_SIDE, left0 + w + SPOT_SIDE, top0 + drop, top0 + drop + SPOT_DOWN + h, stage);
  function free(d, sh) {
    var x0 = left0 + sh - SPOT_PAD, x1 = left0 + sh + w + SPOT_PAD, y0 = top0 + d - SPOT_PAD, y1 = top0 + d + h + SPOT_PAD;
    if (x0 < 6 || x1 > vw - 6 || y1 > vh - 6) return false;
    for (var i = 0; i < cs.length; i++) { var b = cs[i]; if (b.right > x0 && b.left < x1 && b.bottom > y0 && b.top < y1) return false; }
    return true;
  }
  var best = null, bestCost = Infinity;
  for (var dd = 0; dd <= SPOT_DOWN; dd += SPOT_STEP) {
    if (dd > bestCost) break;
    for (var k = 0; k <= SPOT_SIDE; k += SPOT_STEP * 2) {
      var cost = dd + k * 0.8; if (cost >= bestCost) break;
      if (free(drop + dd, k)) { best = { drop: drop + dd, shift: k }; bestCost = cost; break; }
      if (k && free(drop + dd, -k)) { best = { drop: drop + dd, shift: -k }; bestCost = cost; break; }
    }
  }
  if (best) { spot.drop = best.drop; spot.shift = best.shift; } else spot.crowded = true;
  return spot;
}
function applyDrop() {
  var stage = doc.getElementById('rsStage'), host = stage && stage.parentElement;
  if (!stage || !host) return false;
  var spot = noticeSpot(host, stage), d = spot.drop + 'px', x = spot.shift + 'px';
  if (stage.style.getPropertyValue('--pmw-notice-drop') !== d) stage.style.setProperty('--pmw-notice-drop', d);
  if (stage.style.getPropertyValue('--pmw-notice-shift') !== x) stage.style.setProperty('--pmw-notice-shift', x);
  if (stage.hasAttribute('data-pmn-crowded') !== spot.crowded) stage.toggleAttribute('data-pmn-crowded', spot.crowded);
  return spot.crowded;
}
/* the notices ask before a toast's time starts (19-notify.js stage()) */
window.PM_NOTICE_PLACE = applyDrop;
/* A placement asked for by a frame (a scroll, an overlay opening, a page change) reads its boxes once that frame's own
   style and layout are done, from the first ResizeObserver delivery after them, not in an animation frame callback
   before them: there the read pulled a pending whole-page restyle (a look change, NieR Mode under its calm cover)
   forward into the frame that should first show the change (49 and 32 ms on the M3, final motion QA 2026-10-16). */
var layoutQ = [], layoutRo = null;
function afterLayout(fn) {
  /* the shell's one early observer (onboarding 11-motion-start.js): it is told before the page's other observers, so
     these reads come before any of them writes in the same delivery */
  if (typeof window.PM_AFTER_LAYOUT === 'function') { window.PM_AFTER_LAYOUT(fn); return; }
  if (typeof ResizeObserver !== 'function') { fn(); return; }
  if (layoutQ.indexOf(fn) < 0) layoutQ.push(fn);
  if (layoutRo) return;
  layoutRo = new ResizeObserver(function () {
    layoutRo.disconnect(); layoutRo = null;
    var q = layoutQ; layoutQ = [];
    for (var i = 0; i < q.length; i++) { try { q[i](); } catch (e) { /* the next ask places it */ } }
  });
  layoutRo.observe(doc.documentElement);
}
shell.installNotices = function () {
  if (shell.noticesOn) return true;
  var stage = doc.getElementById('rsStage');
  if (!stage || typeof MutationObserver !== 'function') {
    shell.noticeTries = (shell.noticeTries || 0) + 1;
    if (shell.noticeTries <= 40) setTimeout(shell.installNotices, 250);
    return false;
  }
  shell.noticesOn = true;
  // a card arriving: measured before the browser paints it, after the coming frame's layout (B5, Liquid Glass lane
  // profile: measured in the microtask after the DOM change, it forced the pending restyle of a NieR switch, and
  // every other ask in the same frame forced it again; asks made in one frame are placed once, after its layout)
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) if (list[i].addedNodes.length) { afterLayout(applyDrop); return; }
  }).observe(stage, { childList: true });
  // an overlay opening or closing under cards already shown (a press, a key or focus moving): measure again two frames
  // later, once it has opened, and only while a card shows
  var pending = 0;
  function later() {
    if (pending || !stage.firstElementChild) return;
    pending = requestAnimationFrame(function () { requestAnimationFrame(function () { pending = 0; afterLayout(applyDrop); }); });
  }
  ['pointerdown', 'keydown', 'focusin'].forEach(function (t) { doc.addEventListener(t, later, true); });
  /* the page scrolling controls under cards already shown: placed again once per frame */
  var scrollQ = 0;
  doc.addEventListener('scroll', function () {
    if (scrollQ || !stage.firstElementChild) return;
    scrollQ = requestAnimationFrame(function () { scrollQ = 0; afterLayout(applyDrop); });
  }, { capture: true, passive: true });
  /* a page change: measure again once the new page shows (its strips are laid out two frames on), while a card shows.
     Only a page's own class counts: every class change inside the pages measured too, and a Usage room change makes
     hundreds (review r3 R2, 2026-10-15: 95-165 ms of forced style and layout over eight room clicks) */
  var main = doc.querySelector('.primary-content'), turn = 0;
  if (main) new MutationObserver(function (list) {
    if (turn || !stage.firstElementChild) return;
    for (var i = 0; i < list.length; i++) {
      if (list[i].target.parentElement !== main) continue;
      turn = requestAnimationFrame(function () { requestAnimationFrame(function () { turn = 0; afterLayout(applyDrop); }); });
      return;
    }
  }).observe(main, { attributes: true, subtree: true, attributeFilter: ['class'] });
  applyDrop();
  return true;
};
shell.noticeDrop = function () { var s = doc.getElementById('rsStage'); return s && s.parentElement ? noticeDrop(s.parentElement) : 0; };
})();
