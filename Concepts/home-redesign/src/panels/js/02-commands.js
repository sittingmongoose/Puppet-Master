/* Commands: the one table of command ids (names agreed with the Plans thread, 2026-10-09) and the commit pipeline.
   A committed structural change is exactly one command: the draft layout is built on a copy, normalized and validated,
   then swapped in, rendered and persisted; a rejection or a failed write rolls back to the previous layout. View-state
   actions (ui.*) change the layout's view block without a receipt or an event. Previews dispatch nothing. */

var CMD = PMW.CMD = {
  open: 'cmd.panel_tab.open',
  close: 'cmd.panel_tab.close',
  move: 'cmd.panel_tab.move',
  keep: 'cmd.panel_tab.keep',
  pin: 'cmd.panel_tab.pin',
  unpin: 'cmd.panel_tab.unpin',
  rename: 'cmd.panel_tab.rename',
  reopen: 'cmd.panel_tab.reopen_closed',
  split: 'cmd.workspace_layout.split',
  movePanel: 'cmd.workspace_layout.move_surface',
  resize: 'cmd.workspace_layout.resize_surface',
  collapse: 'cmd.workspace_layout.set_collapsed',
  closePanel: 'cmd.workspace_layout.close_panel',
  lock: 'cmd.workspace_layout.lock',
  applyNamed: 'cmd.workspace_layout.apply_named',
  saveNamed: 'cmd.workspace_layout.save_named',
  reset: 'cmd.workspace_layout.reset',
  // a whole-layout restore (the tour's snapshot, a project switch); the id still needs the Plans thread's agreement
  restore: 'cmd.workspace_layout.restore',
  chatPopOut: 'cmd.panel.undock',
  chatDockBack: 'cmd.panel.redock'
};
var UI = PMW.UI = {
  activate: 'ui.panel_tab.activate',
  maximize: 'ui.workspace_layout.maximize',
  focus: 'ui.workspace_layout.focus_panel'
};
/* Aliases other surfaces already dispatch; each resolves to one command above. */
var CMD_ALIASES = PMW.CMD_ALIASES = {
  'cmd.editor.close_tab': CMD.close,
  'cmd.file.open': CMD.open,
  'cmd.nav.open_subject': CMD.open,
  'cmd.browser.open_workspace_preview': CMD.open,
  'cmd.terminal.open': CMD.open
};
var LAYOUT_EVENT = 'workspace.layout_changed';

var LOG_MAX = 200;
var commandLog = PM_HOME.command_log = [];
var receiptLog = PM_HOME.receipt_log = [];
var eventLog = PM_HOME.event_log = [];
function pushLog(log, entry) { log.push(entry); if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX); }
var cmdSeq = 0;

/* commit(id, args, mutate): mutate(draft) changes a deep copy of the layout and returns a result object (or false to
   reject with no change). Returns { ok, result?, reason? }. */
function commit(id, args, mutate, opts) {
  opts = opts || {};
  cmdSeq += 1;
  var entry = { seq: cmdSeq, command_id: id, args: args || {}, at: Date.now() };
  pushLog(commandLog, entry);
  var before = PMW.state.layout;
  var draft = PMW.model.clone(before);
  var result;
  try {
    result = mutate(draft);
  } catch (err) {
    try { console.error('[pm-home] ' + id + ' failed', err); } catch (_) {}
    result = { ok: false, reason: 'error' };
  }
  if (result === false || (result && result.ok === false)) {
    var reason = (result && result.reason) || 'rejected';
    pushLog(receiptLog, { seq: cmdSeq, command_id: id, outcome: 'rejected', reason: reason });
    return { ok: false, reason: reason };
  }
  PMW.model.normalize(draft);
  var problems = PMW.model.validate(draft);
  if (problems.length) {
    pushLog(receiptLog, { seq: cmdSeq, command_id: id, outcome: 'rejected', reason: 'invalid', problems: problems });
    try { console.warn('[pm-home] ' + id + ' rejected', problems); } catch (_) {}
    return { ok: false, reason: 'invalid', problems: problems };
  }
  if (PMW.model.same(before, draft)) {
    pushLog(receiptLog, { seq: cmdSeq, command_id: id, outcome: 'no_change' });
    return { ok: true, result: result, noChange: true };
  }
  // the page's command seam: a cancelled pm:command-dispatch rolls the change back (the Usage and Home rule)
  var seq = cmdSeq;   // a dispatch listener may run another command; this one's receipts keep its own number
  var record = { command_id: id, command_instance_id: 'home-command-' + seq, issued_at: new Date().toISOString(), payload: args || {} };
  var accepted = true;
  try { accepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record, cancelable: true })); } catch (_) { accepted = true; }
  if (!accepted) {
    settle(seq, record, 'rejected', 'rejected', { reason: 'dispatch_cancelled' });
    return { ok: false, reason: 'dispatch_cancelled' };
  }
  draft.revision = (before.revision || 0) + 1;
  PMW.state.layout = draft;
  var saved = opts.persist === false ? true : PMW.persist.save();
  if (!saved) {
    PMW.state.layout = before;
    PMW.render.schedule({ animate: false });
    // the dispatch was accepted, so the page seam is owed a receipt for this instance id
    settle(seq, record, 'rolled_back', 'failed', { reason: 'write_failed' });
    PMW.toast && PMW.toast(opts.source === 'guided_tour_restore' ? 'Your layout could not be saved.' : 'Your layout could not be saved, so the change was undone.');
    return { ok: false, reason: 'write_failed' };
  }
  settle(seq, record, 'applied', 'applied', { revision: draft.revision });
  // normalize restores the panels when focus left the maximized panel; tell the strip menus and kind rows
  if (before.view && before.view.maximized && !draft.view.maximized) bus.emit('maximize', { panelId: null });
  var ev = { event: LAYOUT_EVENT, command_id: id, revision: draft.revision, seq: seq };
  pushLog(eventLog, ev);
  PMW.render.schedule({ animate: opts.animate !== false });
  bus.emit('layout', ev);
  return { ok: true, result: result };
}
PMW.commit = commit;
/* Every command_instance_id that went out in pm:command-dispatch gets exactly one pm:dispatch-receipt, whatever
   the exit (applied, dispatch_cancelled, write_failed), and receipt_log joins to command_log by it. */
function settle(seq, record, outcome, status, extra) {
  var receipt = Object.assign({ seq: seq, receipt_id: 'home-receipt-' + seq, command_instance_id: record.command_instance_id,
    command_id: record.command_id, outcome: outcome, status: status }, extra || {}, { completed_at: new Date().toISOString() });
  pushLog(receiptLog, receipt);
  dispatchReceipt(receipt);
  return receipt;
}
function dispatchReceipt(receipt) {
  try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: receipt })); } catch (_) {}
}

/* View-state actions: change the view block (focus, active tab, maximize); persisted quietly, no receipt, no event. */
function viewAction(id, mutate, opts) {
  opts = opts || {};
  var layout = PMW.state.layout;
  var changed = mutate(layout);
  if (changed === false) return false;
  if (opts.persist !== false) PMW.persist.saveSoon();
  PMW.render.schedule({ animate: opts.animate !== false });
  return true;
}
PMW.viewAction = viewAction;

/* PM_HOME.command(id, args): the scriptable entry the tour, the menus and other modules use. */
var COMMAND_HANDLERS = PMW.COMMAND_HANDLERS = {};
PM_HOME.command = function (id, args) {
  var real = CMD_ALIASES[id] || id;
  var fn = COMMAND_HANDLERS[real];
  if (!fn) return { ok: false, reason: 'unknown_command' };
  return fn(args || {});
};
