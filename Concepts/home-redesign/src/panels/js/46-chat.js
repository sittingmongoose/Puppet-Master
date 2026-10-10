/* The chat column (D3): fixed on the right, full height of the work area, never a tab and never movable inside the
   layout; Pop out is the only way to move it. It reuses the page's own #chatPanel and #chatResizer nodes (other code
   holds references to both; never wrap, move or replace them). Width: an inline custom property on #chatPanel
   (--pmw-chat-w) that the narrow ladder writes; the default scales with the window (about 480 at 1470, 600 at 1920,
   at most 640); the user drags 400-760 on the existing resizer, taken over in the capture phase so the legacy resizer
   (which writes inline !important widths up to 1200) never starts. One command per committed change. */

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

/* drag 400-760 on the existing resizer (one command on release) */
chatCol.beginDrag = function (e, handle) {
  var c = chatPanel();
  if (!c) return;
  var startX = e.clientX, startW = c.getBoundingClientRect().width;
  var maxByCentre = startW + Math.max(0, (state.centre ? state.centre.clientWidth : 0) - 600);   // never force one column
  var hi = Math.min(LADDER.chatMax, Math.max(LADDER.chatMin, maxByCentre)), lo = LADDER.chatMin;
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
    var w = Math.round(last);
    pushLog(commandLog, { seq: ++cmdSeq, command_id: CMD.resize, args: { surface: 'chat', width: w }, at: Date.now() });
    pushLog(receiptLog, { seq: cmdSeq, command_id: CMD.resize, outcome: 'applied' });
    try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: { command_id: CMD.resize, status: 'applied', payload: { surface: 'chat', width: w } } })); } catch (_) {}
    PMW.settings.set('chat.width', w);
    announce('Chat width ' + w + ' pixels');
    narrow.schedule();
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
chatCol.installStrip = function () {
  var btn = h('button', { type: 'button', id: 'pmw-chat-strip', class: 'pmw-chat-strip', hidden: true, 'aria-label': 'Open the chat', 'data-pm-hover-label': 'Chat', 'data-pm-hover-detail': 'The window is narrow, so the chat waits here' }, [icon('chat', { size: 16 })]);
  overlay().appendChild(btn);
  btn.addEventListener('click', function () { var ma = qs('.main-area'); if (ma) ma.setAttribute('data-pmw-chat-peek', ''); });
  doc.addEventListener('pointerdown', function (e) {
    var ma = qs('.main-area');
    if (!ma || !ma.hasAttribute('data-pmw-chat-peek')) return;
    if (e.target.closest && e.target.closest('#chatPanel, #pmw-chat-strip, #pmw-overlay .pmw-menu')) return;
    ma.removeAttribute('data-pmw-chat-peek');
  }, true);
  doc.addEventListener('keydown', function (e) { var ma = qs('.main-area'); if (e.key === 'Escape' && ma && ma.hasAttribute('data-pmw-chat-peek')) ma.removeAttribute('data-pmw-chat-peek'); });
  function place() {
    var strip = narrow.state.chatStrip && chatCol.isVisible() && !chatCol.isFloating();
    btn.hidden = !strip;
    if (!strip) return;
    var c = chatPanel().getBoundingClientRect();
    btn.style.left = Math.round(c.left) + 'px'; btn.style.top = Math.round(c.top) + 'px'; btn.style.height = Math.round(c.height) + 'px';
  }
  bus.on('narrow', place);
  bus.on('paint', place);
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
