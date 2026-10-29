/* The chat column (D3): fixed on the right, full height of the work area, never a tab and never movable inside the
   layout; Pop out is the only way to move it. It reuses the page's own #chatPanel and #chatResizer nodes (other code
   holds references to both; never wrap, move or replace them). Width: an inline custom property on #chatPanel
   (--pmw-chat-w) that the narrow ladder writes; the default scales with the window (about 480 at 1470, 600 at 1920,
   at most 640); the user drags 400-760 on the existing resizer, taken over in the capture phase so the legacy resizer
   (which writes inline !important widths up to 1200) never starts. One command per committed change.
   The column's saved state is the layout record's chat column (canon's v2 chat_column, 10-model.js; none of it is a
   Settings value, SSYS-050): width_px, history_pinned and keep_open. A project switch shows that project's own; a named
   layout and Restore home layout keep it.
   Pinned History (D3): the 400-760 range and the saved width_px are the message area; while the chat on screen
   draws its History pinned, the column is wider by the History's own width (chatCol.historyW below: the width the
   chat draws it at, a width the person dragged included, else LADDER.chatHistoryW, 44-narrow.js) and the drag moves
   the same edge over the same message range. The chat surface that draws the History (the hosted 5.6 Pro chat,
   app.js claimSurface over pm7-port/js/00-host.js) registers itself as chatCol.surface (below). */

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
  chatCol.syncRailEntry();
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

/* the layout record's chat column (10-model.js), read through one place */
function chatColumn() { var l = state.layout; return l && l.chat_column ? l.chat_column : model.chatColumn(null); }

/* The width (D3): the message area's width the user dragged, the record's width_px (400-760), or null for the default
   for the window (44-narrow.js chatDefault). Written only by the one structural command
   cmd.workspace_layout.resize_surface { surface: 'chat', width } (a number, or null to go back to the default): one
   commit with its pm:command-dispatch, its receipt and the one workspace.layout_changed event, rolled back on a
   cancelled dispatch or a failed write. A drag commits once on release, the resizer's double-click once with null. */
chatCol.widthPx = function () { return chatColumn().width_px; };
chatCol.setWidth = function (w) {
  if (!state.layout) return { ok: false, reason: 'not_ready' };
  if (w != null && (typeof w !== 'number' || !isFinite(w))) return { ok: false, reason: 'invalid' };
  var width = w == null ? null : model.chatWidth(w);
  var res = commit(CMD.resize, { surface: 'chat', width: width }, function (d) {
    d.chat_column = Object.assign(model.chatColumn(d.chat_column), { width_px: width });
    return {};
  }, { animate: false });
  narrow.schedule();
  return { ok: res.ok, no_change: !!res.noChange, reason: res.reason, width_px: chatCol.widthPx() };
};

/* History pinned beside the messages, or a flyout (D3): the record's history_pinned, the typed local UI action
   ui.chat_column.pin_history (UCC-203), written like view state with the layout and no receipt, event or revision, as
   keep_open is; never a Settings row. The chat surface that draws the History (the pin in its list header and its
   header menu's "Keep History open") dispatches it; chat:column on the bus tells it to repaint. */
chatCol.historyPinned = function () { return chatColumn().history_pinned; };
chatCol.setHistoryPinned = function (on) {
  on = !!on;
  if (!state.layout) return { ok: false, reason: 'not_ready' };
  if (chatCol.historyPinned() === on) return { ok: true, no_change: true, history_pinned: on };
  viewAction(UI.pinHistory, function (lay) { lay.chat_column = Object.assign(model.chatColumn(lay.chat_column), { history_pinned: on }); }, { animate: false });
  bus.emit('chat:column', { history_pinned: on });
  narrow.schedule();
  announce(on ? 'History stays open' : 'History opens as a flyout');
  return { ok: true, history_pinned: on };
};
/* { history_pinned: true | false }; without it the action toggles */
COMMAND_HANDLERS[UI.pinHistory] = function (a) {
  return chatCol.setHistoryPinned(a && typeof a.history_pinned === 'boolean' ? a.history_pinned : !chatCol.historyPinned());
};

/* pinned History widens the column only while a chat surface on screen draws it (the hosted 5.6 Pro chat; never the
   page's own chat, which has no History list) */
chatCol.historyShown = function () {
  if (!chatCol.historyPinned()) return false;
  var sf = chatCol.surface;
  try { return !!(sf && sf.drawsHistory && sf.drawsHistory()); } catch (_) { return false; }
};
/* how much pinned History adds to the column beside a message area of mw px (D3, F3-637: "pinning it widens the chat
   by its own width instead of squeezing the messages"): the width the chat draws it at there, which the surface works
   out (historyWidth(mw): a width the person dragged, its own clamps), else LADDER.chatHistoryW; 0 while it is not
   shown pinned */
chatCol.historyW = function (mw) {
  if (!chatCol.historyShown()) return 0;
  var sf = chatCol.surface, w = null;
  try { w = sf && sf.historyWidth ? sf.historyWidth(mw) : null; } catch (_) { w = null; }
  return typeof w === 'number' && isFinite(w) && w > 0 ? w : LADDER.chatHistoryW;
};

/* drag 400-760 on the existing resizer (one command on release); with pinned History the column is the message area
   plus the History, and the range and the saved width stay the message area's */
chatCol.beginDrag = function (e, handle) {
  var c = chatPanel();
  if (!c) return;
  var startX = e.clientX, startW = c.getBoundingClientRect().width;
  var hist = narrow.state.hist || 0;
  // A width the person drags to is saved (width_px) and the ladder respects saved widths (44-narrow.js:
  // user-sized columns are never eased back), so on Home the drag takes the whole 400-760 range and the
  // centre gives — rail and chat can both be wide at once.
  // On the Usage page the board still keeps its 400 px floor (narrow.usageFloor eases the column there
  // regardless of the saved width, planner 2026-10-10), so the drag keeps that page's room rule; another
  // page (the centre is hidden there and measured 0, which froze the drag) takes the whole range
  var C = homeIsPage() && state.centre && state.centre.getClientRects().length ? state.centre.clientWidth : 0;
  var ub = qs('#panel-usage #pmuBoard'), room = Infinity;
  if (!C && ub && ub.offsetParent !== null) room = ub.getBoundingClientRect().width - LADDER.usageBoardMin;
  var lo = LADDER.chatMin + hist, hi = clamp(startW + Math.max(0, room), lo, LADDER.chatMax + hist);
  var last = startW, moved = false;
  try { handle.setPointerCapture(e.pointerId); } catch (_) {}
  handle.classList.add('resizing');
  doc.body.classList.add('pm-resizing', 'pmw-resizing');
  narrow.frozen = true;
  state.resizing = true;
  function noSelect(ev) { ev.preventDefault(); }
  doc.addEventListener('selectstart', noSelect, true);
  function move(ev) {
    var w = clamp(startW - (ev.clientX - startX), lo, hi);
    if (Math.abs(w - last) < 0.5) return;
    moved = true;
    last = w;
    c.style.setProperty('--pmw-chat-w', Math.round(w) + 'px');
  }
  function end(ev, cancel) {
    doc.removeEventListener('selectstart', noSelect, true);
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    handle.removeEventListener('pointercancel', cxl);
    handle.removeEventListener('lostpointercapture', cxl);
    window.removeEventListener('blur', cxl);
    doc.removeEventListener('keydown', esc, true);
    handle.classList.remove('resizing');
    doc.body.classList.remove('pm-resizing', 'pmw-resizing');
    narrow.frozen = false;
    state.resizing = false;
    /* the shell drag-end bus fires after the commit/rollback, not before: its parked catch-ups (and
       its own final resize flush) must measure the width that actually landed, not the dragged one */
    var fireDragEnd = function () { try { if (typeof window.PM_DRAGEND === 'function') window.PM_DRAGEND(); } catch (_) {} };
    if (cancel || !moved) { c.style.setProperty('--pmw-chat-w', Math.round(startW) + 'px'); narrow.schedule(); fireDragEnd(); render.flushResizes(true); return; }
    var w = clamp(Math.round(last) - hist, LADDER.chatMin, LADDER.chatMax);   // the message area; the History is never saved
    // one commit on release; a cancelled dispatch or a failed write leaves the saved width, which the ladder puts back
    var res = chatCol.setWidth(w);
    // say the width the ladder applies, never a width that is not on screen
    narrow.update();
    if (res.ok) {
      var applied = narrow.state.chat != null ? Math.round(narrow.state.chat) : w + hist;
      announce('Chat width ' + applied + ' pixels');
    }
    fireDragEnd();
    render.flushResizes(true);
  }
  function up(ev) { end(ev, false); }
  function cxl(ev) { end(ev, true); }
  function esc(ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); end(ev, true); } }
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', cxl);
  handle.addEventListener('lostpointercapture', cxl);
  window.addEventListener('blur', cxl);
  doc.addEventListener('keydown', esc, true);
};
/* the resizer's double-click: back to the default for the window, one commit with width null */
chatCol.resetWidth = function () {
  var res = chatCol.setWidth(null);
  if (res.ok) announce('Chat width reset');
  return res;
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
/* D32: a popped-out chat starts back in its column after a restart: the pop out is never saved, and Settings' Chat Layout
   row, whose saved value used to replay a pop out at start, is retired (opus-5.5 build.py: the paint sends no
   chat.layout, and a stored value is cleared on first read). */
chatCol.isFloating = function () { var ma = qs('.main-area'); return !!(ma && ma.hasAttribute('data-pmw-chat-float')); };

/* Keep the chat open in narrow windows (D4's pin; the lead's ruling of 2026-10-10). It is the typed local UI action
   ui.chat_column.keep_open, saved in the layout record's chat column as keep_open (default false) and written like view
   state, with the layout and no receipt, event or revision, as ui.panel_tab.activate is; never a Settings row. With it on
   the narrow ladder never folds the chat to its strip (44-narrow.js). Two menus carry it as the same checked row,
   keepOpenRow(), which dispatches the action: the title bar's Home options (49-titlebar.js) and the chat's own header
   menu (the hosted 5.6 Pro chat's, app.js renderColumnMenu). */
chatCol.keepOpen = function () { var l = state.layout; return !!(l && l.chat_column && l.chat_column.keep_open); };
chatCol.setKeepOpen = function (on) {
  on = !!on;
  if (!state.layout) return { ok: false, reason: 'not_ready' };
  if (chatCol.keepOpen() === on) return { ok: true, no_change: true, keep_open: on };
  viewAction(UI.keepChatOpen, function (lay) { lay.chat_column = Object.assign(model.chatColumn(lay.chat_column), { keep_open: on }); }, { animate: false });
  narrow.schedule();
  announce(on ? 'The chat stays open in narrow windows' : 'The chat folds to a strip in narrow windows');
  return { ok: true, keep_open: on };
};
chatCol.keepOpenRow = function () {
  var on = chatCol.keepOpen();
  return { id: 'chat-keep-open', label: 'Keep the chat open in narrow windows', sub: 'Instead of folding to a strip at the edge',
    action: UI.keepChatOpen, checked: on, run: function () { PM_HOME.command(UI.keepChatOpen, { keep_open: !on }); } };
};
/* { keep_open: true | false }; without it the action toggles */
COMMAND_HANDLERS[UI.keepChatOpen] = function (a) { return chatCol.setKeepOpen(a && typeof a.keep_open === 'boolean' ? a.keep_open : !chatCol.keepOpen()); };

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
    // the rail's Chat entry decides for itself (a click there hides the open chat, D40)
    if (e.target.closest && e.target.closest('#chatPanel, #pmw-chat-strip, #pmw-overlay .pmw-menu, ' + RAIL_CHAT)) return;
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

/* The rail's Chat entry (D40, Jared: "Chat stays a left-rail entry; it shows or hides the chat column"). A click on
   #activityBar's Chat icon, on every page, toggles the column and never changes the page in front: while the chat is
   on screen (isOpen) it hides it (one cmd.panel.switch with its receipt), otherwise show() brings it on screen, which
   follows the narrow ladder (where the chat is folded to its strip it opens over the centre). The listener sits in the
   window's capture phase, ahead of the tour core's document handler (that one only flipped visibility, so a folded
   chat was hidden instead of opened) and the shell's legacy title-matched branch, and it answers only that one icon.
   A press that turned into the rail's own drag (body.pm-ab-dragging at release, or a move past its 4 px threshold) is
   left to the rail: it reorders or hides the icon in More, and the rail's suppressor takes the click that follows.
   Enter and Space do the same when the page makes the icon focusable. The icon is lit while the column is shown (a
   folded strip counts; a hidden column does not), however that came about. */
var RAIL_CHAT = '#activityBar .icon[data-ab-id="chat"]';
chatCol.syncRailEntry = function () {
  var ic = qs(RAIL_CHAT);
  if (!ic) return;
  var on = chatCol.isVisible();
  if (ic.classList.contains('active') !== on) ic.classList.toggle('active', on);
};
chatCol.toggleFromRail = function () {
  if (chatCol.isOpen()) return chatCol.setVisible(false, 'cmd.panel.switch');
  chatCol.show();
  chatCol.syncRailEntry();
  return { ok: chatCol.isOpen() };
};
chatCol.installRailEntry = function () {
  var press = null;
  function entryOf(e) { return e.target && e.target.closest ? e.target.closest(RAIL_CHAT) : null; }
  window.addEventListener('pointerdown', function (e) {
    press = entryOf(e) && e.button === 0 ? { x: e.clientX, y: e.clientY, id: e.pointerId, dragged: false } : null;
  }, true);
  window.addEventListener('pointermove', function (e) {
    if (press && e.pointerId === press.id && (Math.abs(e.clientX - press.x) >= 4 || Math.abs(e.clientY - press.y) >= 4)) press.dragged = true;
  }, true);
  window.addEventListener('pointerup', function (e) {
    if (press && e.pointerId === press.id && doc.body.classList.contains('pm-ab-dragging')) press.dragged = true;
  }, true);
  window.addEventListener('click', function (e) {
    if (!entryOf(e)) return;
    var p = press;
    press = null;
    if (p && p.dragged) return;
    e.stopPropagation();
    e.preventDefault();
    chatCol.toggleFromRail();
  }, true);
  window.addEventListener('keydown', function (e) {
    if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat || e.altKey || e.ctrlKey || e.metaKey || !entryOf(e)) return;
    e.stopPropagation();
    e.preventDefault();
    chatCol.toggleFromRail();
  }, true);
  // its hover tag says what a click does (the tag controller gave it the generic "Choose this option.")
  var ic = qs(RAIL_CHAT);
  if (ic) { setAttr(ic, 'data-pm-hover-label', 'Chat'); setAttr(ic, 'data-pm-hover-detail', 'Shows or hides the chat column'); }
  // the lit state follows the column whoever shows or hides it (the chat's own close, a layout restore, the tour); the
  // tour core's own sync after each receipt sets the same thing
  var c = chatPanel();
  if (c && typeof MutationObserver === 'function') new MutationObserver(chatCol.syncRailEntry).observe(c, { attributes: true, attributeFilter: ['class'] });
  chatCol.syncRailEntry();
};

/* The chat hooks for the kinds (CONTRACT 6.1 additions). The chat surface on screen (the hosted 5.6 Pro chat, app.js
   claimSurface) registers chatCol.surface = { drawsHistory(), shown(), compose(text), reveal(o), historyWidth(mw) };
   without one, or while it is not shown (the Guided Tour teaching the page's own chat), compose writes into the page's
   own composer and reveal only shows the chat.
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
  var list = qsa('textarea, [contenteditable="true"]', c).filter(function (el) { return !el.closest('#pmw-chat56') && el.getClientRects().length; });
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
  chatCol.installRailEntry();
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
