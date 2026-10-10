/* Runs in <head>, before the page's old Home controller is parsed. It turns the home layer on (html[data-pmw-home]) and
   defines window.PM_HOME_WORKSPACE as a compatibility shim, so the old controller's own guard returns and only one Home
   model exists. Members the tour, the chat and the activity bar still call delegate lazily to PM_HOME; the rest answer
   { ok: false, reason: 'retired' }. ?home=current leaves today's Home running for an A/B in the review copy. */

if (/[?&]home=current\b/.test(location.search)) return;
var root = document.documentElement;
root.setAttribute('data-pmw-home', 'on');

function H() { return window.PM_HOME || null; }
function W() { return window.PMW || null; }
function chatEl() { return document.getElementById('chatPanel'); }
function chatVisible() { var c = chatEl(); return !!c && !c.classList.contains('hidden'); }
function chatRecord() {
  var c = chatEl();
  var strip = !!(c && c.closest && c.closest('.main-area[data-pmw-chat="strip"]'));
  return {
    surface_instance_id: 'chat', surface_id: 'chat', surface_kind: 'chat', domain_ref: { chat_surface_id: 'chat' },
    host: 'dock_right', slot_index: 0, visible: chatVisible(), collapsed: strip,
    size: { basis_px: c ? Math.round(c.getBoundingClientRect().width) : 0 },
    floating_bounds: null, last_docked_host: 'dock_right', last_docked_slot_index: 0
  };
}
function retired() { return { ok: false, reason: 'retired' }; }
var shimLogs = { command_log: [], receipt_log: [], event_log: [] };

var shim = {
  schema_id: 'pm.home_workspace_layout.v1',
  retired: true,
  storage_key: null,
  hosts: ['dock_right'],
  editor_panel_ids: [],
  get layout() {
    var w = W();
    return { schema_id: 'pm.home_workspace_layout.v1', layout_revision: w && w.state && w.state.layout ? w.state.layout.revision : 0,
      surfaces: [chatRecord()], pmw: w && w.snapshot ? w.snapshot() : null };
  },
  get draft_layout() { return null; },
  get command_log() { var h = H(); return h ? h.command_log : shimLogs.command_log; },
  get receipt_log() { var h = H(); return h ? h.receipt_log : shimLogs.receipt_log; },
  get event_log() { var h = H(); return h ? h.event_log : shimLogs.event_log; },
  get surface_registry() { return [chatRecord()]; },
  get host_registries() { return {}; },
  get terminal_workgroups() { return []; },
  get metrics() { return {}; },
  get identities() { return {}; },
  setSurfaceVisible: function (id, visible, commandId) {
    if (id !== 'chat') return retired();
    var w = W();
    if (w && w.chatCol) return w.chatCol.setVisible(!!visible, commandId || 'cmd.panel.switch');
    var c = chatEl(), r = document.getElementById('chatResizer');
    if (c) c.classList.toggle('hidden', !visible);
    if (r) r.classList.toggle('hidden', !visible);
    return { ok: true };
  },
  moveSurface: function () { return { ok: false, reason: 'retired', detail: 'The chat moves only by popping out (D3).' }; },
  popOutChat: function () { var w = W(); return w && w.chatCol ? w.chatCol.popOut() : retired(); },
  popOutPanel: retired,
  openPanel: retired,
  closePanel: retired,
  openBrowser: function () { var h = H(); return h ? h.open({ kind: 'browser' }) : retired(); },
  openFileInPanel: function (surfaceId, path) { var h = H(); return h ? h.open({ kind: 'editor', path: path, mode: 'keep' }) : retired(); },
  moveWorkgroup: retired,
  splitTerminalPane: retired,
  setTerminalPaneCount: retired,
  setCollapsed: retired,
  reset: function () { var w = W(); return w ? { ok: !!w.resetLayout() } : retired(); },
  /* The tour reads r.ok to decide whether the layout came back (and shows its own notice when it did not), so the
     layout restore runs first and its result is passed through; chat visibility follows only after it worked. */
  o55RestoreSnapshot: function (snapshot) {
    var w = W();
    if (!snapshot || !Array.isArray(snapshot.surfaces)) return { ok: false, reason: 'invalid_snapshot' };
    var restoreId = w && w.CMD && w.CMD.restore ? w.CMD.restore : 'cmd.workspace_layout.restore';
    if (w && w.restoreSnapshot) {
      if (!snapshot.pmw) return { ok: false, reason: 'snapshot_unavailable' };
      var r = w.restoreSnapshot(snapshot.pmw, 'guided_tour_restore');
      if (!r || !r.ok) return { ok: false, reason: (r && r.reason) || 'restore_failed' };
    }
    var chat = snapshot.surfaces.filter(function (s) { return s && s.surface_kind === 'chat'; })[0];
    if (chat) shim.setSurfaceVisible('chat', chat.visible !== false, 'cmd.panel.switch');
    return { ok: true, result: { command: { command_id: restoreId } } };
  },
  failNextPersistenceWrite: function () { var w = W(); if (w && w.faults) w.faults.failNextWrite = true; },
  validate: function () { var w = W(); return w && w.state && w.state.layout ? { ok: w.model.validate(w.state.layout).length === 0 } : { ok: true }; },
  recover: function () { return { ok: true }; },
  identityIntegrity: function () { return { ok: true }; },
  beginDrag: retired, updateDrag: retired, commitDrop: retired, cancelDrag: retired,
  beginResize: retired, resizeSurface: retired, updateResize: retired, commitResize: retired, cancelResize: retired
};
window.PM_HOME_WORKSPACE = shim;
