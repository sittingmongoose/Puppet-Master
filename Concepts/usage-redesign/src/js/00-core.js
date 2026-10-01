/* Usage redesign: shared helpers. Every src/js file runs inside one strict wrapper that tools/usage_layer.py writes
   around them, so top-level names are shared across files (the lint refuses a name declared twice). The command,
   receipt, event and view-action seam is ported from the Prism Usage script unchanged: canonical mutations travel
   through command() -> receipt, local room/scope/range choices are view actions. */

var $ = function (selector, root) { return (root || document).querySelector(selector); };
var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
var app = document.getElementById('pmuApp');
var usagePanel = document.getElementById('panel-usage');
var COPY = window.PM_USAGE_COPY || {};

/* t('toast.refreshed', {name}): dotted copy lookup with {var} substitution; a missing key returns the key, so a gap
   shows on screen instead of a silent blank. */
function t(key, vars) {
  var node = COPY;
  String(key).split('.').forEach(function (part) { node = node == null ? node : node[part]; });
  var text = typeof node === 'string' ? node : key;
  if (vars) text = text.replace(/\{(\w+)\}/g, function (match, name) { return vars[name] == null ? match : String(vars[name]); });
  return text;
}

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
}
function money(value) { return '$' + Number(value).toFixed(2); }
function num(value) { return Number(value).toLocaleString(); }
function tok(value) {
  if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 1 : 2).replace(/\.0$/, '') + 'M';
  if (value >= 1000) return (value / 1000).toFixed(value >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(value);
}

/* Toasts go to the app's notification layer (the old page wrote into its own hidden element). */
function toast(text) { if (typeof window.toast === 'function') window.toast(text); }

var STORE = {
  get: function (key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value == null ? fallback : JSON.parse(value);
    } catch (error) { return fallback; }
  },
  set: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; }
  }
};

/* Icons: the Prism Usage SVG map, unchanged ([data-icon] elements are filled by PM7_USAGE.injectIcons()). */
var SVG = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15a8 8 0 1 1 16 0"/><path d="m12 15 4-5"/><path d="M5 19h14"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h14a2 2 0 0 1 2 2v9H4z"/><path d="M4 7V5h12"/><path d="M15 12h5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M3 19c0-4 2-6 6-6s6 2 6 6"/><circle cx="17" cy="9" r="2"/><path d="M16 14c3 0 5 2 5 5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/></svg>',
  ring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 8 8"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 6a5 5 0 0 0-6 6L3 17l4 4 5-5a5 5 0 0 0 6-6l-3 3-4-4z"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h4z"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.65"/><circle cx="12" cy="12" r="1.65"/><circle cx="12" cy="19" r="1.65"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 4 4L19 6"/></svg>'
};

/* Workspace state: the old page's defaults. The placeholder keeps nothing between visits; the board engine brings
   the persisted workspace (a new key, migrating pm7:usage:prototype:workspace:v12 once). */
var state = { room: 'overview', detail: 'glance', range: '24h', scope: 'all', more: false, hidden: {}, layout: {}, order: {} };

var COMMANDS = [];
var RECEIPTS = [];
var EVENTS = [];
var VIEW_ACTIONS = [];
var commandSequence = 0;
var eventSequence = 0;
var viewActionSequence = 0;
function command(commandId, payload, result, options) {
  options = options || {};
  var deferred = options.defer_receipt === true;
  var record = {
    command_id: commandId,
    command_instance_id: 'usage-command-' + (++commandSequence),
    issued_at: new Date().toISOString(),
    scope: { room: state.room, range: state.range, usage_scope: state.scope },
    payload: payload || {}
  };
  COMMANDS.push(record);
  var receipt = {
    receipt_id: 'usage-receipt-' + commandSequence,
    command_instance_id: record.command_instance_id,
    command_id: commandId,
    status: deferred ? 'pending' : 'accepted',
    result: result || {},
    completed_at: deferred ? null : new Date().toISOString()
  };
  RECEIPTS.push(receipt);
  var dispatchAccepted = true;
  try { dispatchAccepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record, cancelable: true })); } catch (error) { dispatchAccepted = false; }
  receipt.dispatch_accepted = dispatchAccepted;
  if (!deferred) {
    try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: receipt })); } catch (error) {}
  }
  return receipt;
}
function completeCommandReceipt(receipt, result, status) {
  if (!receipt || receipt.status !== 'pending' || receipt.completed_at) return receipt;
  var merged = {}, current = receipt.result || {}, terminal = result || {};
  Object.keys(current).forEach(function (key) { merged[key] = current[key]; });
  Object.keys(terminal).forEach(function (key) { merged[key] = terminal[key]; });
  receipt.result = merged;
  receipt.status = status || 'accepted';
  receipt.completed_at = new Date().toISOString();
  try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail: receipt })); } catch (error) {}
  return receipt;
}
function usageEvent(eventType, payload) {
  var record = {
    schema_id: 'pm.usage.concept_event.v1',
    event_id: 'usage-concept-event-' + (++eventSequence),
    event_type: eventType,
    occurred_at: new Date().toISOString(),
    room: state.room,
    range: state.range,
    scope: state.scope,
    authority: 'concept_fixture_only',
    payload: payload || {}
  };
  EVENTS.push(record);
  try { window.dispatchEvent(new CustomEvent('pm:usage-event', { detail: record })); } catch (error) {}
  return record;
}
function viewAction(actionType, payload) {
  var record = {
    schema_id: 'pm.usage.local_view_action.v1',
    action_id: 'usage-view-action-' + (++viewActionSequence),
    action_type: actionType,
    occurred_at: new Date().toISOString(),
    room: state.room,
    range: state.range,
    scope: state.scope,
    payload: payload || {}
  };
  VIEW_ACTIONS.push(record);
  try { window.dispatchEvent(new CustomEvent('pm:usage-view-action', { detail: record })); } catch (error) {}
  return record;
}
