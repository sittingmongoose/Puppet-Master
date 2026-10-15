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
function applyDrop() {
  var stage = doc.getElementById('rsStage'), host = stage && stage.parentElement;
  if (!stage || !host) return;
  var d = noticeDrop(host) + 'px';
  if (stage.style.getPropertyValue('--pmw-notice-drop') !== d) stage.style.setProperty('--pmw-notice-drop', d);
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
  // a card arriving: measure before the browser paints it (a microtask after the DOM change)
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) if (list[i].addedNodes.length) { applyDrop(); return; }
  }).observe(stage, { childList: true });
  // an overlay opening or closing under cards already shown (a press, a key or focus moving): measure again two frames
  // later, once it has opened, and only while a card shows
  var pending = 0;
  function later() {
    if (pending || !stage.firstElementChild) return;
    pending = requestAnimationFrame(function () { requestAnimationFrame(function () { pending = 0; applyDrop(); }); });
  }
  ['pointerdown', 'keydown', 'focusin'].forEach(function (t) { doc.addEventListener(t, later, true); });
  /* a page change: measure again once the new page shows (its strips are laid out two frames on) */
  var main = doc.querySelector('.primary-content'), turn = 0;
  if (main) new MutationObserver(function () {
    if (turn) return;
    turn = requestAnimationFrame(function () { requestAnimationFrame(function () { turn = 0; applyDrop(); }); });
  }).observe(main, { attributes: true, subtree: true, attributeFilter: ['class'] });
  applyDrop();
  return true;
};
shell.noticeDrop = function () { var s = doc.getElementById('rsStage'); return s && s.parentElement ? noticeDrop(s.parentElement) : 0; };
})();
