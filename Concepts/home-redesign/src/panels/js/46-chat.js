/* The chat column (D3): fixed on the right, full height of the work area, never a tab and never movable inside the
   layout; Pop out is the only way to move it. It reuses the page's own #chatPanel and #chatResizer nodes (other code
   holds references to both; never wrap, move or replace them). Width: an inline custom property on #chatPanel
   (--pmw-chat-w) that the narrow ladder writes; the default scales with the window (about 480 at 1470, 600 at 1920,
   at most 640); the user drags 400-760 on the existing resizer, taken over in the capture phase so the legacy resizer
   (which writes inline !important widths up to 1200) never starts. One command per committed change.
   Pinned History (D3): the 400-760 range and the saved chat.width are the message area; while the chat on screen
   draws its History pinned, the column is that much wider (LADDER.chatHistoryW, 44-narrow.js) and the drag moves the
   same edge over the same message range. The chat surface that draws the History (the stand-in today, the 5.6 Pro
   chat after the port) registers itself as chatCol.surface (below). */

var chatCol = PMW.chatCol = {};
var CHAT_VIS_KEY = 'pm.home.chat:v1';

function chatPanel() { return qs('#chatPanel'); }
function chatResizer() { return qs('#chatResizer'); }

chatCol.isVisible = function () { var c = chatPanel(); return !!c && !c.classList.contains('hidden'); };
chatCol.setVisible = function (visible, commandId) {
  var c = chatPanel(), r = chatResizer();
  if (!c) return { ok: false, reason: 'missing' };
  if (chatCol.isVisible() === !!visible) return { ok: true, no_change: true };
  var id = commandId || 'cmd.panel.switch';
  var record = { command_id: id, command_instance_id: 'home-chat-' + Date.now().toString(36), issued_at: new Date().toISOString(), payload: { panel_id: 'chat', visible: !!visible } };
  var accepted = true;
  try { accepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record, cancelable: true })); } catch (_) {}
  if (!accepted) return { ok: false, reason: 'dispatch_cancelled' };
  c.classList.toggle('hidden', !visible);
  if (r) r.classList.toggle('hidden', !visible);
  var icon = qs('#activityBar .icon[data-ab-id="chat"]');
  if (icon) icon.classList.toggle('active', !!visible);
  if (!visible) { var ma = qs('.main-area'); if (ma) ma.removeAttribute('data-pmw-chat-peek'); }
  store.set(CHAT_VIS_KEY, { visible: !!visible });
  var receipt = { receipt_id: record.command_instance_id + '-r', command_instance_id: record.command_instance_id, command_id: id, status: 'applied', outcome: 'applied', completed_at: new Date().toISOString() };
  pushLog(commandLog, { seq: ++cmdSeq, command_id: id, args: record.payload, at: Date.now() });
  pushLog(receiptLog, Object.assign({ seq: cmdSeq }, receipt));
  try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: receipt })); } catch (_) {}
  try { if (window.PM7_SHELL_ADJUSTMENTS && PM7_SHELL_ADJUSTMENTS.seatChat) PM7_SHELL_ADJUSTMENTS.seatChat(); } catch (_) {}
  narrow.schedule();
  render.schedule({ animate: false });
  announce(visible ? 'Chat shown' : 'Chat hidden');
  return { ok: true, command: record, receipt: receipt };
};

/* pinned History widens the column only while a chat surface on screen draws it (the stand-in's layer; never the
   page's own chat, which has no History list) */
chatCol.historyShown = function () {
  if (PMW.settings.get('chat.history') !== 'pinned') return false;
  var sf = chatCol.surface;
  try { return !!(sf && sf.drawsHistory && sf.drawsHistory()); } catch (_) { return false; }
};

/* drag 400-760 on the existing resizer (one command on release); with pinned History the column is the message area
   plus the History, and the range and the saved width stay the message area's */
chatCol.beginDrag = function (e, handle) {
  var c = chatPanel();
  if (!c) return;
  var startX = e.clientX, startW = c.getBoundingClientRect().width;
  var hist = narrow.state.hist || 0;
  // one rule with the ladder: the chat widens only while the centre stays at or above the step where the ladder starts
  // easing the chat (C 960); past it the ladder would ease the width straight back on release
  // On the Usage page the board keeps its 400 px floor (narrow.usageFloor); another page (the centre is hidden there and
  // measured 0, which froze the drag) takes the whole range
  var C = homeIsPage() && state.centre && state.centre.getClientRects().length ? state.centre.clientWidth : 0;
  var ub = qs('#panel-usage #pmuBoard'), room = Infinity;
  if (C) room = C - LADDER.chatEase;
  else if (ub && ub.offsetParent !== null) room = ub.getBoundingClientRect().width - LADDER.usageBoardMin;
  var lo = LADDER.chatMin + hist, hi = clamp(startW + Math.max(0, room), lo, LADDER.chatMax + hist);
  var last = startW, moved = false;
  try { handle.setPointerCapture(e.pointerId); } catch (_) {}
  handle.classList.add('resizing');
  doc.body.classList.add('pm-resizing', 'pmw-resizing');
  narrow.frozen = true;
  state.resizing = true;
  function move(ev) {
    var w = clamp(startW - (ev.clientX - startX), lo, hi);
    if (Math.abs(w - last) < 0.5) return;
    moved = true;
    last = w;
    c.style.setProperty('--pmw-chat-w', Math.round(w) + 'px');
  }
  function end(ev, cancel) {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    handle.removeEventListener('pointercancel', cxl);
    doc.removeEventListener('keydown', esc, true);
    handle.classList.remove('resizing');
    doc.body.classList.remove('pm-resizing', 'pmw-resizing');
    narrow.frozen = false;
    state.resizing = false;
    try { if (typeof window.PM_DRAGEND === 'function') window.PM_DRAGEND(); } catch (_) {}
    if (cancel || !moved) { c.style.setProperty('--pmw-chat-w', Math.round(startW) + 'px'); narrow.schedule(); render.flushResizes(true); return; }
    var w = clamp(Math.round(last) - hist, LADDER.chatMin, LADDER.chatMax);   // the message area; the History is never saved
    pushLog(commandLog, { seq: ++cmdSeq, command_id: CMD.resize, args: { surface: 'chat', width: w }, at: Date.now() });
    pushLog(receiptLog, { seq: cmdSeq, command_id: CMD.resize, outcome: 'applied' });
    try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: { command_id: CMD.resize, status: 'applied', payload: { surface: 'chat', width: w } } })); } catch (_) {}
    PMW.settings.set('chat.width', w);
    // say the width the ladder applies, never a width that is not on screen
    narrow.update();
    var applied = narrow.state.chat != null ? Math.round(narrow.state.chat) : w + hist;
    announce('Chat width ' + applied + ' pixels');
    render.flushResizes(true);
  }
  function up(ev) { end(ev, false); }
  function cxl(ev) { end(ev, true); }
  function esc(ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); end(ev, true); } }
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', cxl);
  doc.addEventListener('keydown', esc, true);
};
chatCol.resetWidth = function () {
  PMW.settings.set('chat.width', null);
  announce('Chat width reset');
  narrow.schedule();
};

/* Pop out (D3). In the native app the chat moves to its own window; the browser concept shows it floating over the
   page with Dock back, and the column closes so the panels take the room. */
chatCol.popOut = function () {
  var ma = qs('.main-area');
  if (!ma) return { ok: false };
  var res = { ok: true, command: { command_id: CMD.chatPopOut } };
  pushLog(commandLog, { seq: ++cmdSeq, command_id: CMD.chatPopOut, args: { panel_id: 'chat' }, at: Date.now() });
  pushLog(receiptLog, { seq: cmdSeq, command_id: CMD.chatPopOut, outcome: 'applied' });
  ma.setAttribute('data-pmw-chat-float', '');
  if (!chatCol.isVisible()) chatCol.setVisible(true, 'cmd.panel.switch');
  try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: { command_id: CMD.chatPopOut, status: 'applied' } })); } catch (_) {}
  narrow.schedule();
  render.schedule({ animate: true });
  announce('Chat popped out. Use Dock back to return it to the right side.');
  bus.emit('chat', { floating: true });
  return res;
};
chatCol.dockBack = function () {
  var ma = qs('.main-area');
  if (!ma || !ma.hasAttribute('data-pmw-chat-float')) return { ok: true, no_change: true };
  ma.removeAttribute('data-pmw-chat-float');
  pushLog(commandLog, { seq: ++cmdSeq, command_id: CMD.chatDockBack, args: { panel_id: 'chat' }, at: Date.now() });
  pushLog(receiptLog, { seq: cmdSeq, command_id: CMD.chatDockBack, outcome: 'applied' });
  try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: { command_id: CMD.chatDockBack, status: 'applied' } })); } catch (_) {}
  narrow.schedule();
  render.schedule({ animate: true });
  announce('Chat docked on the right');
  bus.emit('chat', { floating: false });
  return { ok: true };
};
chatCol.isFloating = function () { var ma = qs('.main-area'); return !!(ma && ma.hasAttribute('data-pmw-chat-float')); };

/* the folded chat strip (D4, C < 480): a button opens the chat over the centre until Escape or a click outside */
function peeking() { var ma = qs('.main-area'); return !!(ma && ma.hasAttribute('data-pmw-chat-peek')); }
chatCol.isPeeking = peeking;
chatCol.peek = function (on) {
  var ma = qs('.main-area');
  if (!ma) return;
  if (on && !narrow.state.chatStrip) return;   // only a folded chat opens over the centre
  if (on) ma.setAttribute('data-pmw-chat-peek', ''); else ma.removeAttribute('data-pmw-chat-peek');
  bus.emit('chat:peek', { open: !!on });
};
/* the chat is on screen: shown, and docked full height, popped out, or opened over the centre from its strip */
chatCol.isOpen = function () {
  if (!chatCol.isVisible()) return false;
  if (chatCol.isFloating()) return true;
  return !narrow.state.chatStrip || peeking();
};
/* bring the chat on screen from any state (hidden, folded to its strip); true when it is */
chatCol.show = function () {
  if (!chatCol.isVisible()) chatCol.setVisible(true, 'cmd.panel.switch');
  narrow.update();
  if (narrow.state.chatStrip && !chatCol.isFloating() && !peeking()) chatCol.peek(true);
  return chatCol.isOpen();
};
chatCol.installStrip = function () {
  var btn = h('button', { type: 'button', id: 'pmw-chat-strip', class: 'pmw-chat-strip', hidden: true, 'aria-label': 'Open the chat', 'data-pm-hover-label': 'Chat', 'data-pm-hover-detail': 'The window is narrow, so the chat waits here' }, [icon('chat', { size: 16 })]);
  overlay().appendChild(btn);
  function setPeek(on) { chatCol.peek(on); }
  bus.on('chat:peek', function () { place(); });
  btn.addEventListener('click', function () { setPeek(true); });
  doc.addEventListener('pointerdown', function (e) {
    if (!peeking()) return;
    if (e.target.closest && e.target.closest('#chatPanel, #pmw-chat-strip, #pmw-overlay .pmw-menu')) return;
    setPeek(false);
  }, true);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && peeking()) setPeek(false); });
  function place() {
    // the button hides while the chat is open over the centre (it would sit on the chat's header); Escape or a click
    // outside closes the chat and brings it back
    var strip = narrow.state.chatStrip && chatCol.isVisible() && !chatCol.isFloating() && !peeking();
    btn.hidden = !strip;
    if (!strip) return;
    var c = chatPanel().getBoundingClientRect();
    btn.style.left = Math.round(c.left) + 'px'; btn.style.top = Math.round(c.top) + 'px'; btn.style.height = Math.round(c.height) + 'px';
  }
  bus.on('narrow', place);
  bus.on('paint', place);
};

/* The chat hooks for the kinds (CONTRACT 6.1 additions). The chat surface on screen (the stand-in layer today, the
   5.6 Pro chat after the port) registers chatCol.surface = { drawsHistory(), shown(), compose(text), reveal(o) };
   without one, or while it is not shown (switched off, or the Guided Tour teaching the page's own chat), compose
   writes into the page's own composer and reveal only shows the chat.
   PM_HOME.chat.compose(text): shows the chat, puts text in its composer and focuses it with the caret at the end (a
     draft already there is kept and the text follows it on a new line; empty or whitespace-only text changes nothing).
   PM_HOME.chat.reveal({ thread, messageId }): shows the chat, switches to the thread (an id such as 'query' or its
     title) when the chat knows it, scrolls the message into view and marks it briefly; a message it does not know
     shows the thread and announces "That message is not in this demo". Returns { ok, found, thread }.
   PM_HOME.chat.isOpen(): the chat is on screen (docked, popped out, or opened over the centre from its strip).
   Events on PM_HOME.on('chat', fn): { floating } when it pops out or docks back; { type: 'turn-finished', threadId }
   when a reply finishes. */
chatCol.surface = null;
function surfaceShown() { var sf = chatCol.surface; try { return !!(sf && (!sf.shown || sf.shown())); } catch (_) { return false; } }
function pageComposer() {
  var c = chatPanel();
  if (!c) return null;
  var list = qsa('textarea, [contenteditable="true"]', c).filter(function (el) { return !el.closest('#pmw-chat') && el.getClientRects().length; });
  return list.filter(function (el) { return /input|composer/i.test(el.className || ''); })[0] || list[0] || null;
}
function composePage(text) {
  var el = pageComposer();
  if (!el) { announce('The chat has no message box here'); return { ok: false, reason: 'no_composer' }; }
  var isField = 'value' in el;
  var cur = isField ? el.value : el.textContent;
  // empty or whitespace-only text adds nothing (a draft never gains a lone newline): the composer is only focused
  var tt = text.trim();
  var next = !tt ? cur : !cur || !cur.trim() ? text : (cur.replace(/\s+$/, '').slice(-tt.length) === tt ? cur : cur.replace(/\s+$/, '') + '\n' + text);
  if (next !== cur) {
    if (isField) el.value = next; else el.textContent = next;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
  }
  try { el.focus({ preventScroll: true }); } catch (_) {}
  try {
    if (isField) el.setSelectionRange(next.length, next.length);
    else { var r = doc.createRange(); r.selectNodeContents(el); r.collapse(false); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
  } catch (_) {}
  return { ok: true, surface: 'page' };
}
PM_HOME.chat = {
  compose: function (text) {
    text = String(text == null ? '' : text);
    chatCol.show();
    if (surfaceShown() && chatCol.surface.compose) return chatCol.surface.compose(text);
    return composePage(text);
  },
  reveal: function (o) {
    o = o || {};
    chatCol.show();
    if (surfaceShown() && chatCol.surface.reveal) return chatCol.surface.reveal(o);
    if (o.messageId) announce('That message is not in this demo');
    return { ok: true, found: false, thread: null };
  },
  isOpen: function () { return chatCol.isOpen(); }
};

chatCol.install = function () {
  var c = chatPanel(), r = chatResizer();
  if (!c) return;
  // shown at boot (the markup ships it hidden; the old controller used to un-hide it)
  var saved = store.get(CHAT_VIS_KEY);
  var visible = !saved || saved.visible !== false;
  c.classList.toggle('hidden', !visible);
  if (r) r.classList.toggle('hidden', !visible);
  var icon0 = qs('#activityBar .icon[data-ab-id="chat"]');
  if (icon0) icon0.classList.toggle('active', visible);
  window.addEventListener('pointerdown', function (e) {
    var h0 = e.target && e.target.closest && e.target.closest('#chatResizer');
    if (!h0 || e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    chatCol.beginDrag(e, h0);
  }, true);
  window.addEventListener('dblclick', function (e) {
    if (e.target && e.target.closest && e.target.closest('#chatResizer')) { e.stopPropagation(); e.preventDefault(); chatCol.resetWidth(); }
  }, true);
  // the chat's own "Pop out window" and layout cycle route through PM_HOME_WORKSPACE.popOutChat (the shim)
  chatCol.installStrip();
};
