/* The page frame's pieces no other thread owns (the planner, 2026-10-10, after the cross-look review). The concept demo
   widget (the onboarding's scenario switcher, #o55-demo) floated over the bottom-left corner as a capsule with a
   capsule chip, covering the status bar's text, the rail's footer and the bottom panel. It now docks into a slot the
   status bar reserves at its left end: the slot takes the widget's width in the bar's own flex row, so the bar's
   items move over for it, and the widget sits on the slot as one status item (20-shell.css). The widget stays a child
   of <body>: the onboarding window marks every other body child inert and keeps the widget usable, which it could not
   do from inside the bar.
   The notice anchor: the title bar's notifications (window.toast; NieR Mode voices the same cards as Pod 042 reports)
   stage their cards in #rsStage just under the bell and then fly up into it. On every page the stage hangs tight under
   the title bar at the bell; nothing on the page moves it (Jared, 2026-10-29). The drop that puts it there is
   measured when a card arrives, before it paints. */

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
/* a resize or a look change places the dock after a frame's layout (afterLayout: the shell's PM_AFTER_LAYOUT), where
   its rects and the bar's style are already computed: from the panels' frame queue, before the frame's style, place()
   was a first reader of a look change's whole-page restyle (NieR switch, B5 census). While the bar or the widget has
   no box (hidden), nothing is read: the ResizeObserver below places it the moment it shows. */
function placeShown() {
  var bar = statusBar(), d = demoEl();
  if (!bar || !d || !bar.getClientRects().length || !d.getClientRects().length) { queued = false; return; }
  place();
}
/* through the next animation frame first: schedule is also the dock's own ResizeObserver callback, and asking for an
   after-layout read from inside another observer's delivery is one the browser cannot deliver that frame */
function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { afterLayout(placeShown); }); }

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
/* Jared, 2026-10-29: "Notifications tend to just randomly appear in the middle of the screen, somewhat below where the
   notification bar is but far far too low." The stage hung under the bell, then dropped past Home's panel strip and
   header row, a tab strip near the bar or the chat header (#19, ruling A), and then moved down (up to 320 px) or aside
   (up to 280 px) to the nearest spot that covered no control (review r3's ruling on #19). Every page and window size
   put the cards somewhere else: 74 px down on Home, 97 on Orchestrator, 49 down and 192 aside on Usage at 1440 x 900.
   The cards now always hang tight under the title bar at the bell (BAR_GAP below its bottom edge), on every page, and
   nothing on the page moves them. A card covers what is under it for its few seconds: hovering holds its time, its x
   or a swipe takes it away, and a lasting notice then joins the bell. */
var BAR_GAP = 6;
function noticeDrop(host) {
  var top = host.getBoundingClientRect().bottom + NOTICE_GAP;
  var bar = doc.querySelector('.title-bar'), br = bar && bar.getClientRects().length ? bar.getBoundingClientRect() : null;
  return br && br.height ? Math.max(0, Math.round(br.bottom + BAR_GAP - top)) : 0;
}
function applyDrop() {
  var stage = doc.getElementById('rsStage'), host = stage && stage.parentElement;
  if (!stage || !host) return;
  var d = noticeDrop(host) + 'px';
  if (stage.style.getPropertyValue('--pmw-notice-drop') !== d) stage.style.setProperty('--pmw-notice-drop', d);
}
/* the notices ask before a toast's time starts (19-notify.js stage()). Asked with a callback, the stage is placed after
   the coming frame's layout, before its paint, and the callback runs then: asked at once, a toast staged inside a look
   change's commit measured the page while that restyle was pending (B5). Asked without one, it is placed now. */
window.PM_NOTICE_PLACE = function (done) {
  if (typeof done !== 'function') { applyDrop(); return; }
  afterLayout(function () { try { applyDrop(); } catch (e) { /* placed by the next ask */ } done(); });
};
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
  // the title bar's height can change with the look or the window: placed again then, while a card shows
  var later = function () { if (stage.firstElementChild) afterLayout(applyDrop); };
  bus.on('look', later);
  window.addEventListener('resize', later);
  applyDrop();
  return true;
};
shell.noticeDrop = function () { var s = doc.getElementById('rsStage'); return s && s.parentElement ? noticeDrop(s.parentElement) : 0; };
})();
