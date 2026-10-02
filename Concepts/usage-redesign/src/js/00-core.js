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

/* Toasts: the stage-local Usage note while the page shows (PMU.shell.toast), the app's notification layer otherwise. */
function toast(text) {
  if (window.PMU && PMU.shell && PMU.shell.toast) { PMU.shell.toast(text); return; }
  if (typeof window.toast === 'function') window.toast(text);
}

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
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z"/></svg>',
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
  if (!dispatchAccepted && !deferred) receipt.status = 'rejected';   /* a cancelled pm:command-dispatch rolls the change back (DESIGN-SPEC 6.5) */
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

/* ---- B v2 additions (owner: engine; ARCHITECTURE.md sections 3 and 4.1) ---------------------------------------------
   More icons for the new page, and the PMU namespace every other file fills. New files declare no top-level names:
   each is one IIFE that reads and writes PMU.<module>. */
Object.assign(SVG, {
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  'export': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4h6v3H9z"/><path d="M15 5h3v15H6V5h3"/><path d="M9 12h6M9 16h4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m7 10 5 5 5-5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
  checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3 22 20H2z"/><path d="M12 10v4M12 17v.5"/></svg>',
  hourglass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  minusCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>',
  slashCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m6 18 12-12"/></svg>',
  dashedCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"><circle cx="12" cy="12" r="9"/></svg>',
  halfCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
  clockCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  xCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 21 12 12 21 3 12z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  provider: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12h6"/></svg>'
});
/* [A1] credits, the 2 x 10 auto-switch notch glyph, a down chevron, an info glyph for scope caveats, plus/minus */
Object.assign(SVG, {
  coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>',
  notch: '<svg viewBox="0 0 6 14" fill="currentColor"><rect x="2" y="2" width="2" height="10" rx="1"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  resize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 20h6v-6M20 20l-7-7M10 4H4v6M4 4l7 7"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  tidy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16"/><rect x="5" y="8" width="6" height="6" rx="1"/><rect x="13" y="8" width="6" height="10" rx="1"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  size: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M13 17h4v-4M11 7H7v4"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M9 7V5h6v2M3.5 12h17"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
});
SVG.grip = SVG.drag;
/* the card head's four tools as one path each (PERF-3): the same drawings with 3 elements per button instead of 4-8, so a
   room's chrome (16 cards x 4 buttons) restyles about 140 fewer elements on the VM (45-90 us each) */
SVG.toolGrip = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM14.5 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM6.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM14.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM6.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM14.5 18a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z"/></svg>';
SVG.toolKebab = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.35 5a1.65 1.65 0 1 0 3.3 0a1.65 1.65 0 1 0-3.3 0zM10.35 12a1.65 1.65 0 1 0 3.3 0a1.65 1.65 0 1 0-3.3 0zM10.35 19a1.65 1.65 0 1 0 3.3 0a1.65 1.65 0 1 0-3.3 0z"/></svg>';
SVG.toolGear = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>';
SVG.toolSize = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h12a2.5 2.5 0 0 1 2.5 2.5v12a2.5 2.5 0 0 1-2.5 2.5h-12a2.5 2.5 0 0 1-2.5-2.5v-12a2.5 2.5 0 0 1 2.5-2.5zM13 17h4v-4M11 7H7v4"/></svg>';
SVG.kebab = SVG.dots;

var PMU = window.PMU = {
  version: 'pmu-b2-2026-10-02b',
  core: {
    $: $, $$: $$, t: t, esc: esc, toast: toast, STORE: STORE, state: state,
    command: command, completeCommandReceipt: completeCommandReceipt, usageEvent: usageEvent, viewAction: viewAction
  },
  icons: SVG,
  icon: function (name, cls) {
    return '<span class="pmu-ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + (SVG[name] || SVG.grid) + '</span>';
  }
};
