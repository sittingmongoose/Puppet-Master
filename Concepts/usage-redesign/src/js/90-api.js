/* window.PM7_USAGE: the Usage page's contract with the rest of the concept (understand/cur-xref.md section 10).
   Consumers: the pm6-js-usage bridge (10 PM_DEMO usage.* actions + usage.tick / usage.alert / page.changed: spinRefresh,
   exportJson, data.accounts, data.providers, rerender, injectIcons, setCooldown, pm7FlushCooldown, appendUsageAttempt,
   and its write of active_account_id), the globals' liquid-ink boot (syncNavInk), NieR Mode's status-bar readout and
   Pod 042 (data.context.used / .limit), the chat context module (command, completeCommandReceipt, usageEvent,
   data.context, rerender('context')), and the verifier and tour vocabulary (state, rooms, roomWidgets, setRoomDetail,
   render, the *_log arrays, wiring). Owner: engine. Every member is kept (ARCHITECTURE.md section 8). */

function rangeHours() { return { '5h': 5, '24h': 24, '7d': 168, '30d': 720 }[state.range] || 24; }
function projectedAttempts() {
  var cutoff = Date.now() - rangeHours() * 3600000;
  return DATA.attempts.filter(function (attempt) {
    if (new Date(attempt.occurred_at).getTime() < cutoff) return false;
    if (state.scope === 'work' || state.scope === 'personal') return attempt.scope === state.scope;
    if (state.scope.indexOf('provider:') === 0) return attempt.provider_id === state.scope.slice(9);
    return true;
  });
}

/* Widget ids of a room at the current detail level, in board order (the board engine owns layout and levels). */
function roomWidgets(room) { return PMU.board ? PMU.board.visible(room || state.room) : []; }

function injectIcons() {
  if (!app) return;
  $$('[data-icon]', app).forEach(function (element) {
    element.innerHTML = SVG[element.getAttribute('data-icon')] || SVG.grid;
  });
}

/* render(): the shell and the current room, in place (no entrance). */
function render() {
  if (!app) return;
  if (!ROOM[state.room]) state.room = 'overview';
  if (!DETAIL[state.detail]) state.detail = 'glance';
  PMU.shell.render();
  if (PMU.board) PMU.board.mount(state.room, { instant: true });
}

/* rerender(room?): a known room re-renders only while it is showing (in place); anything else (no argument, or a reason
   such as the bridge's 'stable_account_identity') refreshes the page. */
function rerender(room) {
  if (room && ROOM[room] && room !== state.room) return false;
  if (PMU.roster) PMU.roster.invalidate();
  PMU.shell.render();
  if (PMU.board) PMU.board.refresh(room ? 'data' : 'page');
  return true;
}

function selectRoom(room, source) {
  if (!ROOM[room] || room === state.room) return false;
  return PMU.shell.setView({ room: room }, source || 'rail');
}

function usageExportJson(kind) {
  var payload = kind === 'ledger' ? projectedAttempts() : { schema_id: 'pm7.usage.prototype.snapshot.v1', state: state, attempts: projectedAttempts() };
  try {
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = kind === 'ledger' ? 'puppet-master-usage-ledger.json' : 'puppet-master-usage.json';
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { URL.revokeObjectURL(link.href); }, 0); return true;
  } catch (error) { return false; }
}

/* Ported unchanged: an attempt is accepted only with every identity axis, real numbers and a fresh identity. */
function appendUsageAttempt(attempt) {
  var axes = ['attempt_id','usage_event_ref','usage_record_id','provider_attempt_ref','occurred_at','provider_id','installation_id','account_id','connection_id','product_id','model_id','requested_route_id','effective_route_id','billing_basis','entitlement_class','settlement_status','settlement_authority','charge_authority','plan_allocation_authority','cache_avoided_authority','source_class','source_confidence','source_authority','projection_freshness','projection_health','scope'];
  if (!attempt || axes.some(function (field) { return typeof attempt[field] !== 'string' || !attempt[field]; })) return false;
  var identityAxes = ['attempt_id','usage_event_ref','usage_record_id','provider_attempt_ref','provider_id','installation_id','account_id','connection_id','product_id','model_id','requested_route_id','effective_route_id'];
  if (identityAxes.some(function (field) { return /(^|:)(unavailable|unknown)(:|$)/.test(attempt[field]); })) return false;
  if (attempt.usage_event_ref === attempt.attempt_id || attempt.usage_record_id === attempt.attempt_id || attempt.provider_attempt_ref === attempt.attempt_id) return false;
  if (attempt.scope !== 'work' && attempt.scope !== 'personal') return false;
  if (!Number.isFinite(new Date(attempt.occurred_at).getTime())) return false;
  if (!Number.isFinite(attempt.input_tokens) || !Number.isFinite(attempt.output_tokens) || !Number.isFinite(attempt.request_count) || !Number.isFinite(attempt.charge) || !Number.isFinite(attempt.plan_allocation_estimate) || !Number.isFinite(attempt.cache_avoided_estimate)) return false;
  if (DATA.attempts.some(function (item) { return item.attempt_id === attempt.attempt_id || item.usage_event_ref === attempt.usage_event_ref || item.usage_record_id === attempt.usage_record_id || item.provider_attempt_ref === attempt.provider_attempt_ref; })) return false;
  DATA.attempts.unshift(attempt);
  rerender('ledger');
  return true;
}

/* While the Usage page shows, Home's workspace layer takes no pointer events (the old page's T21 rule, kept). */
function syncUsageLayer() {
  if (!usagePanel) return;
  var active = usagePanel.classList.contains('active');
  var was = document.body.classList.contains('pmu-page-active');
  document.body.classList.toggle('pmu-page-active', active);
  /* Settings may have changed while Usage was hidden: re-read it on the way in (ARCHITECTURE section 6) */
  if (active && !was && PMU.settings) { PMU.settings.invalidate('page'); if (PMU.roster) PMU.roster.invalidate(); if (state.room === 'accounts' && PMU.board) PMU.board.refresh('settings'); }
}

if (app) {
  app.addEventListener('click', function (event) {
    var button = event.target.closest('.pmu-navbtn[data-room]');
    if (button && app.contains(button)) selectRoom(button.getAttribute('data-room'), 'rail');
  });
}
if (usagePanel) new MutationObserver(syncUsageLayer).observe(usagePanel, { attributes: true, attributeFilter: ['class'] });

PMU.core.rangeHours = rangeHours;

window.PM7_USAGE = {
  render: render, rerender: rerender, syncNavInk: function (animate) { PMU.shell.syncInk(animate !== false); },
  state: state, data: DATA, rooms: ROOM, details: DETAIL, widget_ids: KNOWN_USAGE_WIDGET_IDS,
  roomWidgets: roomWidgets, selectRoom: selectRoom,
  setRoomDetail: function (room, detail) { var patch = {}; if (ROOM[room]) patch.room = room; if (DETAIL[detail]) patch.detail = detail; return PMU.shell.setView(patch, 'api'); },
  projectedAttempts: projectedAttempts,
  refresh: function () {
    command('cmd.usage.refresh', { room: state.room, range: state.range, scope: state.scope }, { requested: true });
    var button = document.getElementById('pmuRefresh');
    if (button) { button.classList.add('spinning'); setTimeout(function () { button.classList.remove('spinning'); }, 650); }
    rerender();
    usageEvent('view.usage.projection_refreshed', { room: state.room, range: state.range });
    toast(t('toast.refreshed'));
  },
  spinRefresh: function () { this.refresh(); },
  exportJson: usageExportJson,
  injectIcons: injectIcons,
  appendUsageAttempt: appendUsageAttempt, appendLedger: appendUsageAttempt,
  cooldown_seconds: 0,
  setCooldown: function (seconds) { this.cooldown_seconds = Math.max(0, Number(seconds) || 0); },
  pm7FlushCooldown: function () { return this.cooldown_seconds || 0; },
  /* The bridge's usage.switch_account writes active_account_id; the Accounts room reads it. */
  active_account_id: null,
  setActiveAccount: function (identity) {
    var target = DATA.accounts.filter(function (account) { return account.id === identity || account.account_id === identity || account.connection_id === identity; })[0];
    if (!target || target.setup_required) return false;
    this.active_account_id = target.account_id;
    rerender('accounts');
    return true;
  },
  /* the effective accounts' windows, for a future NieR readout (DESIGN-SPEC section 13) */
  accountWindows: function () {
    if (!PMU.roster) return [];
    return PMU.roster.read().accounts.filter(function (a) { return a.effective; }).map(function (a) {
      var windows = {};
      a.windows.forEach(function (w) { windows[w.key] = { used_pct: w.pct, resets_at: w.resetAt ? new Date(w.resetAt).toISOString() : null, truth: w.truth }; });
      return { provider_id: a.providerId, account_id: a.id, windows: windows };
    });
  },
  /* the old verifier helpers over the new board (VERIFY.md notes) */
  visibleWidgets: function () { return roomWidgets(state.room); },
  widgetById: function (id) { return PMU.widgets ? PMU.widgets.get(id) : null; },
  sizePresets: function (id) { var d = PMU.widgets && PMU.widgets.get(id); var k = d && PMU_BOARDS.kinds[d.kind]; return k ? k.presets.slice() : []; },
  layoutFor: function (id) { return PMU.board ? PMU.board.layout(state.room).filter(function (r) { return r.id === id; })[0] || null : null; },
  setLayout: function (id, size) { return PMU.board ? PMU.board.resize(id, size || {}, 'api') : null; },
  showOnly: function (ids) { (PMU.board ? PMU.board.layout(state.room) : []).forEach(function (r) { var want = (ids || []).indexOf(r.id) >= 0; var hidden = !!(state.hidden[state.room] || {})[r.id]; if (want === hidden) PMU.board.setVisible(r.id, want); }); },
  clearLayout: function () { return PMU.board ? PMU.board.reset('all') : null; },
  openInspector: function (id) { var d = PMU.widgets && PMU.widgets.get(id); if (d && typeof d.inspect === 'function') PMU.inspector.open(d.inspect({ id: id, room: state.room, state: state }), PMU.board && PMU.board.card(id)); },
  projectionSnapshot: function () { return { schema_id: 'pm7.usage.prototype.snapshot.v1', state: { room: state.room, detail: state.detail, range: state.range, scope: state.scope }, attempts: projectedAttempts() }; },
  get migration_receipt() { return PMU.board ? PMU.board.envelope().migration_receipt : null; },
  get workspace_envelope() { return PMU.board ? PMU.board.envelope() : null; },
  get board() { return PMU.board; },
  get roster() { return PMU.roster; },
  command: command, completeCommandReceipt: completeCommandReceipt, usageEvent: usageEvent, viewAction: viewAction,
  command_log: COMMANDS, receipt_log: RECEIPTS, event_log: EVENTS, view_action_log: VIEW_ACTIONS,
  wiring: {
    command_event: 'pm:command-dispatch', receipt_event: 'pm:dispatch-receipt', concept_event: 'pm:usage-event',
    local_view_action: 'pm:usage-view-action', prototype_store: 'widget_layout:v1:usage', legacy_store: WORKSPACE_KEY,
    canonical_layout_owner: 'widget_layout namespace via cmd.widget.*', persisted_domain_event_for_widget_layout: null,
    workspace_layout_changed_scope: 'Home workspace surface mutations only'
  }
};

injectIcons();
PMU.charts.defs();
render();
syncUsageLayer();
