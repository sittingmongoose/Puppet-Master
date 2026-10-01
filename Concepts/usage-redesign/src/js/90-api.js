/* window.PM7_USAGE: the Usage page's contract with the rest of the concept (understand/cur-xref.md section 10).
   Consumers: the pm6-js-usage bridge (10 PM_DEMO usage.* actions + usage.tick / usage.alert / page.changed: spinRefresh,
   exportJson, data.accounts, data.providers, rerender, injectIcons, setCooldown, pm7FlushCooldown, appendUsageAttempt,
   and its write of active_account_id), the globals' liquid-ink boot (syncNavInk), NieR Mode's status-bar readout and
   Pod 042 (data.context.used / .limit), the chat context module (command, completeCommandReceipt, usageEvent,
   data.context, rerender('context')), and the verifier and tour vocabulary (state, rooms, roomWidgets, setRoomDetail,
   render, the *_log arrays, wiring). Placeholder: rooms switch and the stage names the room; the panels come later. */

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

/* The board engine supplies each room's widgets; until then every room is empty. */
function roomWidgets() { return []; }

function injectIcons() {
  if (!app) return;
  $$('[data-icon]', app).forEach(function (element) {
    element.innerHTML = SVG[element.getAttribute('data-icon')] || SVG.grid;
  });
}

function render() {
  if (!app) return;
  if (!ROOM[state.room]) state.room = 'overview';
  if (!DETAIL[state.detail]) state.detail = 'glance';
  var room = state.room;
  app.setAttribute('data-room', room);
  $$('.pmu-navbtn[data-room]', app).forEach(function (button) {
    var chosen = button.getAttribute('data-room') === room;
    button.classList.toggle('active', chosen);
    if (chosen) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  var title = $('#pmuRoomTitle', app), desc = $('#pmuRoomDesc', app), building = $('#pmuBuilding', app);
  if (title) title.textContent = ROOM[room].title;
  if (desc) desc.textContent = ROOM[room].desc;
  if (building) building.textContent = t('stage.building');
}

/* rerender(room?): a known room re-renders only while it is showing; anything else (no argument, or a reason such as
   the bridge's 'stable_account_identity') re-renders the page. */
function rerender(room) {
  if (room && ROOM[room] && room !== state.room) return false;
  render();
  return true;
}

function selectRoom(room, source) {
  if (!ROOM[room] || room === state.room) return false;
  state.room = room;
  viewAction('view.usage.room_selected', { room: room, source: source || 'rail' });
  render();
  return true;
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
  document.body.classList.toggle('pmu-page-active', usagePanel.classList.contains('active'));
}

if (app) {
  app.addEventListener('click', function (event) {
    var button = event.target.closest('.pmu-navbtn[data-room]');
    if (button && app.contains(button)) selectRoom(button.getAttribute('data-room'), 'rail');
  });
}
if (usagePanel) new MutationObserver(syncUsageLayer).observe(usagePanel, { attributes: true, attributeFilter: ['class'] });

window.PM7_USAGE = {
  render: render, rerender: rerender, syncNavInk: function () {},
  state: state, data: DATA, rooms: ROOM, details: DETAIL, widget_ids: KNOWN_USAGE_WIDGET_IDS,
  roomWidgets: roomWidgets, selectRoom: selectRoom,
  setRoomDetail: function (room, detail) { if (ROOM[room]) state.room = room; if (DETAIL[detail]) state.detail = detail; render(); },
  projectedAttempts: projectedAttempts,
  refresh: function () {
    command('cmd.usage.refresh', { room: state.room, range: state.range, scope: state.scope }, { requested: true });
    render();
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
  command: command, completeCommandReceipt: completeCommandReceipt, usageEvent: usageEvent, viewAction: viewAction,
  command_log: COMMANDS, receipt_log: RECEIPTS, event_log: EVENTS, view_action_log: VIEW_ACTIONS,
  wiring: {
    command_event: 'pm:command-dispatch', receipt_event: 'pm:dispatch-receipt', concept_event: 'pm:usage-event',
    local_view_action: 'pm:usage-view-action', prototype_store: null, legacy_store: WORKSPACE_KEY,
    canonical_layout_owner: 'widget_layout namespace via cmd.widget.*', persisted_domain_event_for_widget_layout: null,
    workspace_layout_changed_scope: 'Home workspace surface mutations only'
  }
};

injectIcons();
render();
syncUsageLayer();
