"""Authored PM7 T34 Usage correction transform.

This module owns the 2026-08-27 Usage recovery corrections.  It transforms
the pinned PM7 base after T33; Concepts/PMConcept7.html remains generated
output and must not be patched directly. Its scope is GUI-01..GUI-10 plus
the 2026-08-28 authorized GUI-X01..GUI-X04 corrections; the redesigned Chat
Assistant remains a separate, protected GUI lineage.
"""

import json
import re

from pm7_transform_guards import assert_effect_delta, capture_effect_surfaces


TRANSFORM_MARKER = "PM7 T34: Usage audit corrections"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T34 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _sub_once(doc, pattern, replacement, need, label, flags=0):
    out, count = re.subn(pattern, replacement, doc, count=1, flags=flags)
    need(count == 1, "T34 %s: expected one regex anchor, found %d" % (label, count))
    return out


def _usage_widget_ids(doc, need):
    start = doc.find("<div class=\"pm7u-shell\" id=\"pm7UsageApp\"")
    end = doc.find("</script>", doc.find("var DATA = {", start))
    need(start >= 0 and end > start, "T34 widget inventory: Usage slice missing")
    source = doc[start:end]
    ids = set()
    for pattern in (r"widget\('([a-z0-9][a-z0-9-]*[a-z0-9])'",
                    r"summaryCard\('([a-z0-9][a-z0-9-]*[a-z0-9])'"):
        ids.update(re.findall(pattern, source))
    need(len(ids) >= 70, "T34 widget inventory unexpectedly small: %d" % len(ids))
    return sorted(ids)


def apply(doc, notes, need):
    """Apply T34 with fail-closed source and postcondition assertions."""
    need(TRANSFORM_MARKER not in doc, "T34 marker already present")
    effects_before = capture_effect_surfaces(doc)
    known_widget_ids = _usage_widget_ids(doc, need)
    popup_gui_match = re.search(r"  function ctxPopupHTML\(\) \{.*?\n  \}\n(?=  function enhanceContext)", doc, re.S)
    drawer_gui_match = re.search(r"  function contextDrawerHTML\(title\) \{.*?\n  \}\n(?=  function openContextDetails)", doc, re.S)
    settings_css_match = re.search(r'<style id="pm4-settings-css">.*?</style>', doc, re.S)
    settings_js_match = re.search(r'<script id="pm4-settings-js">.*?</script>', doc, re.S)
    need(
        popup_gui_match is not None
        and drawer_gui_match is not None
        and settings_css_match is not None
        and settings_js_match is not None,
        "T34 protected Assistant/Settings source slices missing",
    )
    popup_gui_source = popup_gui_match.group(0)
    drawer_gui_source = drawer_gui_match.group(0)
    settings_css_source = settings_css_match.group(0)
    settings_js_source = settings_js_match.group(0)

    def assistant_css_rules(value):
        rules = []
        for block in re.findall(r"<style(?:\s[^>]*)?>(.*?)</style>", value, re.S):
            for match in re.finditer(r"([^{}]+)\{([^{}]*)\}", block, re.S):
                selector = match.group(1)
                if any(token in selector for token in ("pm7ctx", "chm-", "context-hover-module")):
                    rules.append(match.group(0))
        return rules

    assistant_gui_css = assistant_css_rules(doc)

    # All thirteen rooms must remain reachable in the horizontally scrolling
    # narrow rail.  The five secondary rooms become ordinary flex contents;
    # the desktop More disclosure remains unchanged.
    narrow_old = (
        "@media(max-width:860px){.pm7u-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}"
        ".pm7u-rail{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;padding:7px 10px;border-right:0;border-bottom:1px solid var(--border-light);overflow:visible}"
        ".pm7u-brand{padding:0}.pm7u-brand h1{font-size:15px}.pm7u-live{display:none}.pm7u-scope{width:150px;margin:0}"
        ".pm7u-nav{display:flex;flex-direction:row;overflow:auto;scrollbar-width:none}.pm7u-nav::-webkit-scrollbar{display:none}"
        ".pm7u-navbtn{width:auto;min-width:max-content;padding:6px 8px}.pm7u-navbtn.active:before{left:7px;right:7px;top:auto;bottom:0;width:auto;height:2px}"
        ".pm7u-navico,.pm7u-navmeta,.pm7u-sep,.pm7u-more-toggle,.pm7u-more,.pm7u-detailcopy span{display:none}"
        ".pm7u-detailbox{margin:0;padding:0}.pm7u-detailbtn{width:auto}.pm7u-detailcopy b{max-width:88px}"
        ".pm7u-head{padding-left:12px;padding-right:12px}.pm7u-boardscroll{padding-left:12px;padding-right:12px}"
        ".pm7u-boardhead{padding-left:12px;padding-right:12px}}"
    )
    narrow_new = narrow_old.replace(
        ".pm7u-more-toggle,.pm7u-more,.pm7u-detailcopy span{display:none}",
        ".pm7u-more-toggle,.pm7u-detailcopy span{display:none}.pm7u-more,.pm7u-more.open{display:contents}",
    )
    doc = _replace_once(doc, narrow_old, narrow_new, need, "narrow room reachability")
    doc = _replace_once(
        doc,
        'class="pm7u-navbtn pm7u-diagnostics-only" data-room="authority"',
        'class="pm7u-navbtn" data-room="authority"',
        need,
        "all-disclosure authority room reachability",
    )

    extra_css = (
        "              /* PM7 T34: Usage audit corrections. */\n"
        "              .pm7u-setup-cta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 10px 10px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--accent-orange) 62%,var(--border-light));border-radius:8px;background:color-mix(in srgb,var(--accent-orange) 10%,transparent);color:var(--text-primary);cursor:pointer;font:700 10px/1.2 var(--body-font);text-align:left}\n"
        "              .pm7u-setup-cta span{color:var(--text-secondary);font-weight:500}\n"
        "              .pm7u-reorder-placeholder{position:relative;z-index:18;isolation:isolate;box-sizing:border-box;min-height:88px;grid-column:auto / span var(--pm7-placeholder-cols,3);grid-row:auto / span var(--pm7-placeholder-rows,3);pointer-events:none;border:2px dashed color-mix(in srgb,var(--accent-primary) 68%,var(--border-light));border-radius:10px;background:color-mix(in srgb,var(--accent-primary) 12%,var(--surface-elevated));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent-primary) 28%,transparent)}\n"
        "              .pm7u-card.is-reorder-source{position:fixed!important;left:-10000px!important;top:-10000px!important;opacity:0!important;pointer-events:none!important}\n"
        "              .pm7u-pointer-op .pm7u-card{translate:none!important}\n"
        "              .pm7u-drag{clip-path:none!important}\n"
        "              .pm7u-card:has(.pm7u-drag:hover),.pm7u-card:has(.pm7u-resize:hover){translate:none!important}\n"
        "              .pm7u-card.is-keyboard-picked{outline:2px solid var(--accent-primary);outline-offset:2px}\n"
    )
    motion_anchor = "              @media(prefers-reduced-motion:reduce){.pm7u-card,.pm7u-pop,.pm7u-inspector,.pm7u-toast,.pm7ctx-drawer{transition:none!important;animation:none!important}.pm7u-iconbtn.spinning svg{animation:none!important}}"
    doc = _replace_once(doc, motion_anchor, extra_css + motion_anchor, need, "Usage correction CSS")

    # Normalize fixture identities and provide timestamped, identity-bound
    # attempts.  Every projection below is an aggregation over these records.
    data_insert = r'''

  /* PM7 T34: Usage audit corrections. Stable identity axes are fixture data,
     not labels inferred by the cards. */
  var PROVIDER_BY_FAMILY = { Claude: 'claude', Codex: 'codex', Qwen: 'qwen', Gemini: 'gemini', Kimi: 'kimi', Copilot: 'copilot' };
  DATA.providers.forEach(function (provider) {
    provider.provider_id = provider.id;
    provider.installation_id = 'installation:' + provider.id + ':desktop';
    provider.product_id = 'product:' + provider.id + ':coding';
    provider.model_id = 'model:' + provider.id + ':effective';
    provider.requested_route_id = 'route:' + provider.id + ':requested';
    provider.effective_route_id = 'route:' + provider.id + ':effective';
    provider.billing_basis = provider.cost ? 'metered API' : 'subscription';
    provider.entitlement_class = provider.cost ? 'pay as you go' : 'plan allowance';
    provider.settlement_status = 'per-attempt receipt state';
    provider.allowance_authority = 'provider reported';
    provider.allowance_freshness = '20s';
  });
  DATA.accounts.forEach(function (account, index) {
    var providerId = PROVIDER_BY_FAMILY[account.family] || account.family.toLowerCase();
    account.id = providerId + '-' + account.scope + '-' + (index + 1);
    account.provider_id = providerId;
    account.installation_id = 'installation:' + providerId + ':desktop';
    account.account_id = 'account:' + account.id;
    account.connection_id = 'connection:' + account.id;
    account.product_id = 'product:' + providerId + ':coding';
    account.model_id = 'model:' + providerId + ':effective';
    account.requested_route_id = 'route:' + providerId + ':requested';
    account.effective_route_id = 'route:' + providerId + ':effective';
    account.host = 'local-machine';
    account.environment = 'desktop';
    account.installation_status = 'Installed';
    account.authentication_status = account.status === 'Connected' ? 'Authenticated' : 'Not authenticated';
    account.billing_basis = account.cost && account.cost.charAt(0) === '$' ? 'metered API' : 'subscription';
    account.entitlement_class = account.cost && account.cost.charAt(0) === '$' ? 'pay as you go' : 'plan allowance';
    account.settlement_status = 'per-attempt receipt state';
  });
  DATA.providers.forEach(function (provider) {
    var accounts = DATA.accounts.filter(function (account) { return account.provider_id === provider.id; });
    provider.account_ids = accounts.map(function (account) { return account.account_id; });
    provider.connection_ids = accounts.map(function (account) { return account.connection_id; });
    provider.account_id = provider.account_ids[0] || 'account:' + provider.id + ':unavailable';
    provider.connection_id = provider.connection_ids[0] || 'connection:' + provider.id + ':unavailable';
  });
  DATA.accounts.push({
    id: 'opencode-personal-setup', name: 'OpenCode · Local', family: 'OpenCode',
    status: 'Provider Setup Required', requests: 0, cost: 'not established',
    last: 'no receipt yet', scope: 'personal', route: 'requested route preserved',
    auth: 'Not started', health: 0, provider_id: 'opencode',
    installation_id: 'installation:opencode:desktop',
    account_id: 'account:opencode:personal',
    connection_id: 'connection:opencode:pending',
    product_id: 'product:opencode:coding', model_id: 'model:opencode:requested',
    requested_route_id: 'route:opencode:requested', effective_route_id: 'route:none',
    attempt_id: 'attempt:opencode:setup-required',
    host: 'local-machine', environment: 'desktop',
    installation_status: 'Not installed', authentication_status: 'Not started',
    billing_basis: 'not established', entitlement_class: 'unknown until setup',
    settlement_status: 'not applicable before acquisition', setup_required: true,
    operation_id: 'provider-setup-op-001', continuation_id: 'provider-setup-cont-001',
    settings_category: 'ai', settings_focus: 'ai.accounts.provider-connections'
  });

  /* Explicit fixture amounts are values carried by the attempt record.  The
     projection never invents a per-request price or derives settlement from
     billing/entitlement. Columns: id, provider, age hours, scope, input,
     output, settled API charge, estimated plan allocation, estimated cache
     avoided value, request count, settlement status, usage event ref,
     usage record id, provider attempt ref. */
  var ATTEMPT_BLUEPRINTS = [
    ['a-001','claude',0.5,'work',184000,29000,0,3.24,1.16,18,'settled','ue-608','ur-608','pa-608'],
    ['a-002','codex',1.2,'personal',152000,24000,0,2.70,1.02,15,'settled','ue-609','ur-609','pa-609'],
    ['a-003','qwen',2.0,'work',132000,21000,0,1.92,.74,12,'settled','ue-610','ur-610','pa-610'],
    ['a-004','gemini',2.8,'work',76000,16000,0,0,.41,8,'pending provider receipt','ue-611','ur-611','pa-611'],
    ['a-005','kimi',3.4,'work',91000,18000,0,1.44,.55,9,'settled','ue-612','ur-612','pa-612'],
    ['a-006','copilot',4.2,'work',54000,9000,0,1.05,.32,7,'settled','ue-613','ur-613','pa-613'],
    ['a-007','claude',8,'work',220000,34000,0,3.96,1.38,22,'settled','ue-614','ur-614','pa-614'],
    ['a-008','codex',12,'personal',168000,27000,0,3.06,1.11,17,'settled','ue-615','ur-615','pa-615'],
    ['a-009','gemini',20,'work',82000,19000,2.14,0,.46,9,'adjusted and settled','ue-616','ur-616','pa-616'],
    ['a-010','qwen',23,'work',144000,25000,0,2.08,.81,13,'settled','ue-617','ur-617','pa-617'],
    ['a-011','claude',36,'work',248000,39000,0,4.50,1.57,25,'settled','ue-618','ur-618','pa-618'],
    ['a-012','codex',60,'personal',192000,31000,0,3.42,1.25,19,'settled','ue-619','ur-619','pa-619'],
    ['a-013','kimi',84,'work',126000,22000,0,1.92,.70,12,'settled','ue-620','ur-620','pa-620'],
    ['a-014','copilot',120,'work',73000,11000,0,1.20,.43,8,'settled','ue-621','ur-621','pa-621'],
    ['a-015','qwen',156,'work',173000,28000,0,2.40,.96,15,'settled','ue-622','ur-622','pa-622'],
    ['a-016','gemini',220,'work',98000,21000,2.73,0,.55,10,'settled','ue-623','ur-623','pa-623'],
    ['a-017','claude',312,'work',264000,42000,0,4.86,1.68,27,'settled','ue-624','ur-624','pa-624'],
    ['a-018','codex',408,'personal',214000,36000,0,3.78,1.39,21,'settled','ue-625','ur-625','pa-625'],
    ['a-019','kimi',552,'work',141000,26000,0,2.24,.79,14,'settled','ue-626','ur-626','pa-626'],
    ['a-020','copilot',696,'work',88000,14000,0,1.50,.51,10,'settled','ue-627','ur-627','pa-627']
  ];
  /* Explicit per-attempt operational facts support selected-record token,
     cache, tool, signal, and anomaly panels. Columns: attempt, tool, cache
     read, cache write, tool latency ms, tool errors, reasoning tokens,
     anomaly score. */
  var ATTEMPT_OPERATION_FIXTURE = [
    ['a-001','run_shell_command',151000,12000,820,0,6400,22],['a-002','read_file',129000,8100,390,0,5100,18],
    ['a-003','browser_exec',98000,9200,5900,0,4200,25],['a-004','image_gen',46000,6800,21800,1,3600,78],
    ['a-005','git',71000,7400,980,0,3900,31],['a-006','run_shell_command',42000,4300,760,0,1800,16],
    ['a-007','read_file',176000,13800,420,0,7200,28],['a-008','browser_exec',139000,9400,6400,0,5700,24],
    ['a-009','image_gen',52000,7100,22600,0,4100,66],['a-010','git',108000,10100,1120,0,4800,29],
    ['a-011','run_shell_command',198000,15100,910,0,8300,35],['a-012','read_file',157000,11200,450,0,6500,27],
    ['a-013','browser_exec',94000,8600,6100,1,4700,54],['a-014','image_gen',51000,5200,23100,0,2300,41],
    ['a-015','git',126000,11700,1050,0,5900,33],['a-016','run_shell_command',69000,7600,870,0,4400,72],
    ['a-017','read_file',211000,16200,410,0,9100,39],['a-018','browser_exec',171000,12600,6700,0,7600,37],
    ['a-019','image_gen',103000,9800,21900,1,5400,61],['a-020','git',65000,6100,1180,0,2900,44]
  ];
  DATA.attempts = ATTEMPT_BLUEPRINTS.map(function (row) {
    var provider = DATA.providers.filter(function (item) { return item.id === row[1]; })[0];
    var account = DATA.accounts.filter(function (item) { return item.provider_id === row[1] && item.scope === row[3] && !item.setup_required; })[0];
    var operation = ATTEMPT_OPERATION_FIXTURE.filter(function (item) { return item[0] === row[0]; })[0];
    return {
      attempt_id: row[0], usage_event_ref: row[11], usage_record_id: row[12], provider_attempt_ref: row[13], occurred_at: new Date(Date.now() - row[2] * 3600000).toISOString(),
      provider_id: provider.provider_id, installation_id: provider.installation_id,
      account_id: account.account_id, connection_id: account.connection_id,
      product_id: provider.product_id, model_id: provider.model_id, scope: row[3],
      requested_route_id: provider.requested_route_id, effective_route_id: provider.effective_route_id,
      input_tokens: row[4], output_tokens: row[5], charge: row[6],
      plan_allocation_estimate: row[7], cache_avoided_estimate: row[8], request_count: row[9],
      billing_basis: provider.billing_basis, entitlement_class: provider.entitlement_class,
      settlement_status: row[10], settlement_authority: 'attempt receipt fixture',
      source_class: 'provider_reported', source_confidence: 'high', source_authority: 'attempt receipt fixture',
      projection_freshness: 'current', projection_health: 'healthy',
      charge_authority: row[6] ? 'settled attempt receipt' : provider.billing_basis === 'metered API' ? 'no settled charge in this record' : 'not applicable to subscription attempt',
      plan_allocation_authority: row[7] ? 'explicit demo fixture estimate' : 'not applicable',
      cache_avoided_authority: row[8] ? 'explicit demo fixture estimate' : 'not exposed',
      tool_id: operation[1], cache_read_tokens: operation[2], cache_write_tokens: operation[3],
      tool_latency_ms: operation[4], tool_error_count: operation[5], reasoning_tokens: operation[6], anomaly_score: operation[7]
    };
  });
  /* Current-thread context is a mutable projection shared by the Usage room
     and the already-mounted Assistant context surfaces. Historical attempt
     fixtures remain immutable when that projection is compacted. */
  DATA.context.pinned = 11200;
  DATA.context.mutable = DATA.context.used - DATA.context.pinned;
  DATA.context.compacted = false;
  DATA.context.last_compact = '18m';
  DATA.context.last_maintenance = '18m ago';
  DATA.alerts.forEach(function (alert, index) { alert.provider_id = ['claude','gemini','qwen'][index] || null; });
  DATA.cache.forEach(function (row, index) { row.provider_id = ['claude','codex','qwen','gemini'][index]; });
  DATA.tools.forEach(function (row) { row.tool_id = row[0]; });
  DATA.authority.forEach(function (row, index) { row.provider_id = index < 4 ? ['claude','codex','qwen','gemini'][index] : null; });
'''
    doc = _replace_once(doc, "\n  var ROOM = {", data_insert + "\n  var ROOM = {", need, "identity attempt fixtures")

    state_old = r'''  var KEY = 'pm7:usage:v10:';
  var state = {
    room: STORE.get(KEY + 'room', 'overview'),
    detail: STORE.get(KEY + 'detail', 'glance'),
    range: STORE.get(KEY + 'range', '24h'),
    scope: STORE.get(KEY + 'scope', 'all'),
    more: STORE.get(KEY + 'more', false),
    hidden: STORE.get(KEY + 'hidden', {}),
    layout: STORE.get(KEY + 'layout', {}),
    order: STORE.get(KEY + 'order', {})
  };
  if (!ROOM[state.room]) state.room = 'overview';
  if (!DETAIL[state.detail]) state.detail = 'glance';'''
    state_new = r'''  var LEGACY_KEY = 'pm7:usage:v10:';
  var KEY = LEGACY_KEY; /* adapter-only compatibility prefix */
  var WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v11';
  var WORKSPACE_SCHEMA_VERSION = 11;
  var WORKSPACE_DEFAULT_SET_VERSION = 'pm7-usage-defaults-2026-08-27';
  var WORKSPACE_FIELDS = ['room','detail','range','scope','more','hidden','layout','order'];
  var KNOWN_USAGE_WIDGET_IDS = __KNOWN_WIDGET_IDS__;
  var rawStoreGet = STORE.get.bind(STORE), rawStoreSet = STORE.set.bind(STORE);
  var USAGE_RUNTIME_INVENTORY = null;
  var USAGE_STALE_VALUE_COUNT = 0;
  function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object || {}, key); }
  function canonicalUsageJson(value) {
    if (Array.isArray(value)) return '[' + value.map(canonicalUsageJson).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(function (key) { return JSON.stringify(key) + ':' + canonicalUsageJson(value[key]); }).join(',') + '}';
    return JSON.stringify(value);
  }
  function persistUsageWorkspaceEnvelope(envelope) {
    try {
      var serialized = canonicalUsageJson(envelope);
      localStorage.setItem(WORKSPACE_KEY, serialized);
      var observed = localStorage.getItem(WORKSPACE_KEY);
      if (observed == null) return false;
      return canonicalUsageJson(JSON.parse(observed)) === serialized;
    } catch (error) { return false; }
  }
  function usageDefaults() { return { room:'overview', detail:'glance', range:'24h', scope:'all', more:false, hidden:{}, layout:{}, order:{} }; }
  function validUsageScope(value) {
    if (value === 'all' || value === 'work' || value === 'personal') return true;
    if (String(value).indexOf('provider:') !== 0) return false;
    var id = String(value).slice(9);
    return DATA.providers.some(function (provider) { return provider.id === id; });
  }
  function validUsageWidget(id) {
    if (KNOWN_USAGE_WIDGET_IDS.indexOf(id) >= 0) return true;
    var providerIds = DATA.providers.map(function (provider) { return provider.id; });
    var accountIds = DATA.accounts.map(function (account) { return account.id; });
    if (String(id).indexOf('plan-') === 0 || String(id).indexOf('tok-') === 0) return providerIds.indexOf(String(id).replace(/^(plan|tok)-/, '')) >= 0;
    if (String(id).indexOf('acct-') === 0) return accountIds.indexOf(String(id).slice(5)) >= 0;
    var indexed = /^(free|cache|alert|tool|signal)-(\d+)$/.exec(String(id));
    if (!indexed) return false;
    var lengths = { free:DATA.free.length, cache:DATA.cache.length, alert:DATA.alerts.length, tool:DATA.tools.length, signal:DATA.signals.length };
    return +indexed[2] >= 0 && +indexed[2] < lengths[indexed[1]];
  }
  function splitWidgetKey(key) {
    var at = String(key).indexOf(':');
    if (at <= 0) return null;
    var room = String(key).slice(0, at), widgetId = String(key).slice(at + 1);
    if (!ROOM[room] || !validUsageWidget(widgetId)) return null;
    if (USAGE_RUNTIME_INVENTORY && (!USAGE_RUNTIME_INVENTORY[room] || !hasOwn(USAGE_RUNTIME_INVENTORY[room], widgetId))) return null;
    return [room, widgetId];
  }
  function sanitizeUsageState(candidate) {
    candidate = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {};
    var clean = usageDefaults();
    if (ROOM[candidate.room]) clean.room = candidate.room;
    if (DETAIL[candidate.detail]) clean.detail = candidate.detail;
    if (['5h','24h','7d','30d'].indexOf(candidate.range) >= 0) clean.range = candidate.range;
    if (validUsageScope(candidate.scope)) clean.scope = candidate.scope;
    clean.more = candidate.more === true;
    if (candidate.hidden && typeof candidate.hidden === 'object' && !Array.isArray(candidate.hidden)) {
      Object.keys(candidate.hidden).forEach(function (key) { if (splitWidgetKey(key) && typeof candidate.hidden[key] === 'boolean') clean.hidden[key] = candidate.hidden[key]; });
    }
    if (candidate.layout && typeof candidate.layout === 'object' && !Array.isArray(candidate.layout)) {
      Object.keys(candidate.layout).forEach(function (key) {
        var parts = splitWidgetKey(key), value = candidate.layout[key];
        if (!parts || !value || typeof value !== 'object') return;
        var cols = Number(value.cols), rows = Number(value.rows);
        if (!Number.isInteger(cols) || !Number.isInteger(rows)) return;
        if (USAGE_RUNTIME_INVENTORY) {
          if (USAGE_RUNTIME_INVENTORY[parts[0]][parts[1]].sizes.indexOf(cols + 'x' + rows) < 0) return;
        } else if (cols < 1 || cols > 12 || rows < 1 || rows > 8) return;
        clean.layout[key] = { cols:cols, rows:rows };
      });
    }
    if (candidate.order && typeof candidate.order === 'object' && !Array.isArray(candidate.order)) {
      Object.keys(candidate.order).forEach(function (room) {
        if (!ROOM[room] || !Array.isArray(candidate.order[room])) return;
        var seen = {};
        clean.order[room] = candidate.order[room].filter(function (id) {
          if (!validUsageWidget(id) || seen[id]) return false;
          if (USAGE_RUNTIME_INVENTORY && !hasOwn(USAGE_RUNTIME_INVENTORY[room], id)) return false;
          seen[id] = true; return true;
        });
      });
    }
    return clean;
  }
  function readLegacyUsageCandidate() {
    var legacy = {}, present = 0, parsed = 0, parseFailures = 0, presentFields = [], parsedFields = [], defaults = usageDefaults();
    WORKSPACE_FIELDS.forEach(function (field) {
      var raw = null;
      try { raw = localStorage.getItem(LEGACY_KEY + field); } catch (error) {}
      if (raw == null) { legacy[field] = defaults[field]; return; }
      present += 1; presentFields.push(field);
      try { legacy[field] = JSON.parse(raw); parsed += 1; parsedFields.push(field); }
      catch (error) { legacy[field] = defaults[field]; parseFailures += 1; }
    });
    return { state:legacy, present:present, parsed:parsed, parse_failures:parseFailures, present_fields:presentFields, parsed_fields:parsedFields };
  }
  function legacyImportAssessment(cleanState) {
    var accepted = 0, partial = 0;
    if (!shouldImportLegacy) return { accepted:0, rejected:legacyCandidate.parsed, partial:0 };
    legacyCandidate.parsed_fields.forEach(function (field) {
      var candidate = legacyCandidate.state[field], clean = cleanState[field], valid = false, partly = false;
      if (field === 'room') valid = !!ROOM[candidate] && clean === candidate;
      else if (field === 'detail') valid = !!DETAIL[candidate] && clean === candidate;
      else if (field === 'range') valid = ['5h','24h','7d','30d'].indexOf(candidate) >= 0 && clean === candidate;
      else if (field === 'scope') valid = validUsageScope(candidate) && clean === candidate;
      else if (field === 'more') valid = typeof candidate === 'boolean' && clean === candidate;
      else if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        valid = canonicalUsageJson(candidate) === canonicalUsageJson(clean);
        partly = !valid && clean && Object.keys(clean).length > 0;
        if (!Object.keys(candidate).length && clean && !Object.keys(clean).length) valid = true;
      }
      if (valid || partly) accepted += 1;
      if (partly) partial += 1;
    });
    return { accepted:accepted, rejected:Math.max(0, legacyCandidate.parsed - accepted), partial:partial };
  }
  var workspaceKeyPresent = false;
  try { workspaceKeyPresent = localStorage.getItem(WORKSPACE_KEY) != null; } catch (error) {}
  var storedWorkspace = rawStoreGet(WORKSPACE_KEY, null);
  var currentWorkspace = !!(storedWorkspace && storedWorkspace.schema_version === WORKSPACE_SCHEMA_VERSION && storedWorkspace.default_set_version === WORKSPACE_DEFAULT_SET_VERSION && storedWorkspace.prototype_only === true && storedWorkspace.state);
  var legacyCandidate = readLegacyUsageCandidate();
  var shouldImportLegacy = !workspaceKeyPresent && legacyCandidate.present > 0;
  var sourceState = currentWorkspace ? storedWorkspace.state : shouldImportLegacy ? legacyCandidate.state : usageDefaults();
  var workspaceState = sanitizeUsageState(sourceState);
  if (canonicalUsageJson(sourceState) !== canonicalUsageJson(workspaceState)) USAGE_STALE_VALUE_COUNT += 1;
  if (workspaceKeyPresent && !currentWorkspace) USAGE_STALE_VALUE_COUNT += 1;
  if (legacyCandidate.parse_failures) USAGE_STALE_VALUE_COUNT += legacyCandidate.parse_failures;
  if (legacyCandidate.present && !shouldImportLegacy) USAGE_STALE_VALUE_COUNT += legacyCandidate.present;
  var USAGE_WORKSPACE = {
    schema_version: WORKSPACE_SCHEMA_VERSION,
    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,
    prototype_only: true,
    committed_revision: currentWorkspace && Number.isInteger(storedWorkspace.committed_revision) && storedWorkspace.committed_revision >= 0 ? storedWorkspace.committed_revision : 0,
    legacy_import: currentWorkspace && storedWorkspace.legacy_import ? storedWorkspace.legacy_import : { source:'pm7:usage:v10:*', completed:true, imported:false, accepted_values:0, rejected_values:legacyCandidate.parsed, partial_values:0, imported_at:null },
    state: workspaceState
  };
  var USAGE_MIGRATION_RECEIPT = {
    envelope_key: WORKSPACE_KEY, schema_version: WORKSPACE_SCHEMA_VERSION,
    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,
    legacy_keys_detected: legacyCandidate.present,
    legacy_values_parsed: legacyCandidate.parsed,
    legacy_parse_failures: legacyCandidate.parse_failures,
    legacy_values_imported: 0,
    legacy_values_rejected: shouldImportLegacy ? legacyCandidate.parsed : 0,
    legacy_partial_values_preserved: 0,
    imported_legacy_once: false,
    stale_values_evicted: USAGE_STALE_VALUE_COUNT > 0,
    stale_value_count: USAGE_STALE_VALUE_COUNT,
    legacy_keys_removed: false,
    envelope_persisted: false
  };
  USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);
  if (legacyCandidate.present && USAGE_MIGRATION_RECEIPT.envelope_persisted) WORKSPACE_FIELDS.forEach(function (field) { try { localStorage.removeItem(LEGACY_KEY + field); } catch (error) {} });
  var legacyKeysRemaining = 0;
  WORKSPACE_FIELDS.forEach(function (field) { try { if (localStorage.getItem(LEGACY_KEY + field) != null) legacyKeysRemaining += 1; } catch (error) {} });
  USAGE_MIGRATION_RECEIPT.legacy_keys_remaining = legacyKeysRemaining;
  USAGE_MIGRATION_RECEIPT.legacy_keys_removed = legacyCandidate.present > 0 && legacyKeysRemaining === 0;
  STORE.get = function (key, fallback) {
    if (String(key).indexOf(LEGACY_KEY) === 0) {
      var field = String(key).slice(LEGACY_KEY.length);
      return hasOwn(USAGE_WORKSPACE.state, field) ? USAGE_WORKSPACE.state[field] : fallback;
    }
    return rawStoreGet(key, fallback);
  };
  STORE.set = function (key, value) {
    if (String(key).indexOf(LEGACY_KEY) === 0) {
      var field = String(key).slice(LEGACY_KEY.length);
      if (WORKSPACE_FIELDS.indexOf(field) < 0) return;
      var candidate = {};
      WORKSPACE_FIELDS.forEach(function (name) { candidate[name] = USAGE_WORKSPACE.state[name]; });
      candidate[field] = value;
      USAGE_WORKSPACE.state = sanitizeUsageState(candidate);
      USAGE_WORKSPACE.committed_revision += 1;
      return persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);
    }
    rawStoreSet(key, value);
  };
  var state = {
    room: STORE.get(KEY + 'room', 'overview'), detail: STORE.get(KEY + 'detail', 'glance'),
    range: STORE.get(KEY + 'range', '24h'), scope: STORE.get(KEY + 'scope', 'all'),
    more: STORE.get(KEY + 'more', false), hidden: STORE.get(KEY + 'hidden', {}),
    layout: STORE.get(KEY + 'layout', {}), order: STORE.get(KEY + 'order', {})
  };
  if (!ROOM[state.room]) state.room = 'overview';
  if (!DETAIL[state.detail]) state.detail = 'glance';'''.replace("__KNOWN_WIDGET_IDS__", json.dumps(known_widget_ids, separators=(",", ":")))
    doc = _replace_once(doc, state_old, state_new, need, "versioned Usage workspace")

    command_pattern = r"  function command\(commandId, payload, result\) \{.*?\n  \}\n  function usageEvent"
    command_new = r'''  function command(commandId, payload, result, options) {
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
    try { window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record })); } catch (error) {}
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
  function usageEvent'''
    doc = _sub_once(doc, command_pattern, command_new, need, "truthful deferred command receipt", re.S)

    projection_old = r'''  function scopeFactor() {
    if (state.scope === 'work') return 0.78;
    if (state.scope === 'personal') return 0.22;
    if (state.scope.indexOf('provider:') === 0) return 0.18;
    return 1;
  }
  function scaled(value) { return Math.round(value * scopeFactor()); }'''
    projection_new = r'''  function rangeHours() { return { '5h':5, '24h':24, '7d':168, '30d':720 }[state.range] || 24; }
  function projectedAttempts() {
    var cutoff = Date.now() - rangeHours() * 3600000;
    return DATA.attempts.filter(function (attempt) {
      if (new Date(attempt.occurred_at).getTime() < cutoff) return false;
      if (state.scope === 'work' || state.scope === 'personal') return attempt.scope === state.scope;
      if (state.scope.indexOf('provider:') === 0) return attempt.provider_id === state.scope.slice(9);
      return true;
    });
  }
  function projectionTotals(records) {
    return records.reduce(function (totals, attempt) {
      totals.requests += attempt.request_count; totals.input += attempt.input_tokens;
      totals.output += attempt.output_tokens; totals.tokens += attempt.input_tokens + attempt.output_tokens;
      totals.cost += attempt.charge; totals.plans += attempt.plan_allocation_estimate;
      totals.saved += attempt.cache_avoided_estimate; return totals;
    }, { requests:0, input:0, output:0, tokens:0, cost:0, plans:0, saved:0 });
  }
  function settlementSummary(records) {
    if (!records.length) return 'no attempts in selected window';
    var states = [];
    records.forEach(function (attempt) { if (states.indexOf(attempt.settlement_status) < 0) states.push(attempt.settlement_status); });
    return states.length === 1 ? states[0] : 'mixed: ' + states.join(' / ');
  }
  function distinctCount(records, field) {
    var seen = {};
    records.forEach(function (record) { if (record[field]) seen[record[field]] = true; });
    return Object.keys(seen).length;
  }
  function providerMetrics(provider) {
    var records = projectedAttempts().filter(function (attempt) { return attempt.provider_id === provider.id; });
    var totals = projectionTotals(records);
    totals.used = provider.used;
    totals.attempts = records.length;
    totals.settlement_summary = settlementSummary(records);
    totals.allowance_authority = provider.allowance_authority;
    totals.allowance_freshness = provider.allowance_freshness;
    return totals;
  }
  function projectedCosts() {
    var records = projectedAttempts(), totals = projectionTotals(records);
    var hours = Math.max(1, rangeHours()), totalValue = totals.cost + totals.plans;
    var daily = totalValue / hours * 24;
    return {
      selected:totalValue, api:totals.cost, plans:totals.plans, saved:totals.saved,
      burn:daily, forecast:daily * 30, budget:DATA.costs.budget,
      overage:Math.max(0,daily * 30 - DATA.costs.budget),
      planUtil:totalValue ? Math.round(totals.plans / totalValue * 100) : 0,
      apiUtil:totalValue ? Math.round(totals.cost / totalValue * 100) : 0,
      attempts:records.length, settled:records.filter(function (attempt) { return attempt.settlement_status.indexOf('settled') >= 0; }).length,
      pending:records.filter(function (attempt) { return attempt.settlement_status.indexOf('pending') >= 0; }).length,
      window_label:state.range + ' selected window'
    };
  }
  function visibleProviders() {
    if (state.scope.indexOf('provider:') === 0) {
      var only = state.scope.slice(9);
      return DATA.providers.filter(function (provider) { return provider.id === only; });
    }
    if (state.scope === 'work' || state.scope === 'personal') {
      var ids = {};
      DATA.accounts.forEach(function (account) { if (account.scope === state.scope) ids[account.provider_id] = true; });
      return DATA.providers.filter(function (provider) { return !!ids[provider.id]; });
    }
    return DATA.providers.slice();
  }
  function visibleAccounts() {
    return DATA.accounts.filter(function (account) {
      if (state.scope === 'work' || state.scope === 'personal') return account.scope === state.scope;
      if (state.scope.indexOf('provider:') === 0) return account.provider_id === state.scope.slice(9);
      return true;
    });
  }'''
    doc = _replace_once(doc, projection_old, projection_new, need, "record-backed projection")

    # The Usage Context room is part of Usage, not the protected Assistant
    # GUI.  Attribute it to the selected attempt instead of a fixed provider.
    doc = _replace_once(
        doc,
        "  function contextPanel() {\n    var context = DATA.context;",
        "  function contextPanel() {\n"
        "    var context = DATA.context;\n"
        "    var contextAttempts = projectedAttempts();\n"
        "    var contextAttempt = contextAttempts.length ? contextAttempts[contextAttempts.length - 1] : null;\n"
        "    var contextEffectiveRoute = contextAttempt ? contextAttempt.effective_route_id + ' · ' + contextAttempt.model_id + (contextAttempt.requested_route_id !== contextAttempt.effective_route_id ? ' · fallback' : '') : 'No effective route in range';",
        need,
        "fixture-derived Context route",
    )
    doc = _replace_once(
        doc,
        """<div class="pm7u-context-foot pm7u-tier-expanded"><span>Effective route</span><b>Claude Sonnet · fallback</b><span>Compaction</span><b>' + tok(context.reclaim) + ' reclaimable</b><span>Last maintenance</span><b>18m ago</b></div></div>""",
        """<div class="pm7u-context-foot pm7u-tier-expanded"><span>Effective route</span><b>' + esc(contextEffectiveRoute) + '</b><span>Compaction</span><b>' + (context.compacted ? 'compacted · 0 reclaimable' : tok(context.reclaim) + ' reclaimable') + '</b><span>Last maintenance</span><b>' + esc(context.last_maintenance) + '</b></div></div>""",
        need,
        "Context route attribution",
    )
    doc = _replace_once(
        doc,
        "statRow('Pinned context', '11.2k', 'expanded') + statRow('Mutable context', '30.9k', 'expanded')",
        "statRow('Pinned context', tok(context.pinned), 'expanded') + statRow('Mutable context', tok(context.mutable), 'expanded')",
        need,
        "mutable Context composition",
    )
    doc = _replace_once(
        doc,
        "summaryCard('ctx-cache', 'Context cache hit', 'current thread', 'green', context.cache.toFixed(1)+'%', 'effective prompt cache', '+2.1', '', [['Read','38.2k'],['Write','4.0k'],['Route','Claude'],['Age','20s']], 'Savings', '$1.82', 'glance', { cols: 2, rows: 2, minCols: 2 })",
        "summaryCard('ctx-cache', 'Context cache hit', 'current thread', 'green', context.cache.toFixed(1)+'%', 'effective prompt cache', '+2.1', '', [['Read',tok(context.input)],['Write',tok(context.output)],['Route','Claude'],['Age','20s']], 'Savings', '$1.82', 'glance', { cols: 2, rows: 2, minCols: 2 })",
        need,
        "current Context cache projection",
    )
    doc = _replace_once(
        doc,
        "summaryCard('ctx-reclaim', 'Compactable', 'current thread', 'purple', tok(context.reclaim), 'tokens reclaimable', 'safe', '', [['Pinned','11.2k'],['Mutable','30.9k'],['Reserve','16k'],['Last compact','18m']], 'Result', '23.6k used', 'glance', { cols: 2, rows: 2, minCols: 2 })",
        "summaryCard('ctx-reclaim', 'Compactable', 'current thread', 'purple', tok(context.reclaim), context.compacted ? 'no tokens currently reclaimable' : 'tokens reclaimable', context.compacted ? 'done' : 'safe', '', [['Pinned',tok(context.pinned)],['Mutable',tok(context.mutable)],['Reserve',tok(context.reserved)],['Last compact',context.last_compact]], context.compacted ? 'Current' : 'Result', tok(context.compacted ? context.used : context.used-context.reclaim)+' used', 'glance', { cols: 2, rows: 2, minCols: 2 })",
        need,
        "current Context compaction projection",
    )

    provider_pattern = r"  function providerCard\(provider\) \{.*?\n  \}\n  function summaryCard"
    provider_new = r'''  function providerCard(provider) {
    return widget('plan-' + provider.id, provider.name, provider.primaryLabel, provider.tone, 3, 3, 'glance', function () {
      var metrics = providerMetrics(provider);
      return instrument({
        name: provider.name, subtitle: provider.product_id + ' · ' + provider.model_id,
        value: metrics.used + '%', valueLabel: provider.status === 'watch' ? 'watch' : 'healthy',
        statusClass: provider.status === 'watch' ? 'warn' : 'ok',
        stats: [
          ['Requests', num(metrics.requests)], ['Tokens', tok(metrics.tokens)],
          ['Billing basis', provider.billing_basis], ['Entitlement', provider.entitlement_class],
          ['Settlement status', metrics.settlement_summary], ['Attempts', num(metrics.attempts)]
        ],
        meters: [
          [provider.primaryLabel, provider.reset, metrics.used, metrics.used > 72 ? 'orange' : provider.tone === 'green' ? 'green' : ''],
          ['Weekly pace', provider.weeklyReset, provider.weekly, provider.weekly > 72 ? 'orange' : 'green'],
          ['Monthly share', provider.monthly + '%', provider.monthly, 'purple']
        ],
        bars: projectedAttempts().filter(function (attempt) { return attempt.provider_id === provider.id; }).map(function (attempt) { return attempt.request_count; }),
        activityLabel: state.range + ' attempts',
        details: [
          ['Provider ID', provider.provider_id], ['Installation ID', provider.installation_id],
          ['Account IDs', provider.account_ids.join(', ')], ['Connection IDs', provider.connection_ids.join(', ')],
          ['Product / model', provider.product_id + ' / ' + provider.model_id],
          ['Requested route', provider.requested_route_id], ['Effective route', provider.effective_route_id],
          ['Attempt IDs', projectedAttempts().filter(function (attempt) { return attempt.provider_id === provider.id; }).map(function (attempt) { return attempt.attempt_id; }).join(', ') || 'none in range'],
          ['Billing / entitlement', provider.billing_basis + ' / ' + provider.entitlement_class],
          ['Settlement', metrics.settlement_summary],
          ['Allowance authority', metrics.allowance_authority + ' · ' + metrics.allowance_freshness]
        ],
        footerLeft: provider.pace, footerRight: provider.forecast, action: provider.id
      });
    }, { kind: 'instrument', minCols: 3, maxRows: 5 });
  }
  function summaryCard'''
    doc = _sub_once(doc, provider_pattern, provider_new, need, "provider identity card", re.S)

    account_pattern = r"  function accountCard\(account, index\) \{.*?\n  \}\n  function freeCard"
    account_new = r'''  function accountCard(account, index) {
    return widget('acct-' + account.id, account.name, account.family, account.setup_required ? 'warn' : index === 3 ? 'orange' : 'green', 3, 3, 'glance', function () {
      var attempts = projectedAttempts().filter(function (attempt) { return attempt.account_id === account.account_id; });
      var totals = projectionTotals(attempts);
      var setup = account.status === 'Provider Setup Required';
      var body = instrument({
        name: account.name, subtitle: 'Host/Environment · ' + account.host + ' / ' + account.environment,
        value: setup ? 'Setup' : account.health.toFixed(1) + '%',
        valueLabel: setup ? 'Provider Setup Required' : 'healthy', statusClass: setup ? 'warn' : 'ok',
        stats: [
          ['Installation', account.installation_status], ['Authentication', account.authentication_status],
          ['Requests', num(totals.requests)], ['Billing basis', account.billing_basis],
          ['Entitlement', account.entitlement_class], ['Settlement status', setup ? account.settlement_status : settlementSummary(attempts)]
        ],
        meters: setup ? [] : [
          ['Connection health', account.last, account.health, 'green'],
          ['Route share', totals.requests + ' calls', Math.min(100, Math.round(totals.requests / 2.2)), ''],
          ['Receipt freshness', account.last, Math.max(55, 100 - index * 6), index > 3 ? 'orange' : 'green']
        ],
        activityLabel: setup ? 'No acquisition attempted' : state.range + ' attempt cadence',
        details: [
          ['Provider ID', account.provider_id], ['Installation ID', account.installation_id],
          ['Account ID', account.account_id], ['Connection ID', account.connection_id],
          ['Product / model', account.product_id + ' / ' + account.model_id],
          ['Requested route', account.requested_route_id], ['Effective route', account.effective_route_id],
          [setup ? 'Attempt / operation / continuation' : 'Attempt IDs', setup ? account.attempt_id + ' / ' + account.operation_id + ' / ' + account.continuation_id : attempts.map(function (attempt) { return attempt.attempt_id; }).join(', ') || 'none in range']
        ],
        footerLeft: account.status, footerRight: setup ? 'No automatic acquisition or route change' : account.scope,
        action: 'account-' + account.id
      });
      if (setup) body += '<button type="button" class="pm7u-setup-cta" data-provider-setup="' + esc(account.id) + '"><b>Open Provider Connections</b><span>Settings · AI</span></button>';
      return body;
    }, { kind: 'instrument', minCols: 3, maxRows: 5 });
  }
  function freeCard'''
    doc = _sub_once(doc, account_pattern, account_new, need, "account setup card", re.S)

    free_old = "stats: [['Capacity', route[4]], ['Settlement', route[2]], ['Context', route[3]], ['Eligibility', cooldown ? 'after reset' : 'current'], ['Route class', 'free'], ['Source', 'provider catalog']]"
    free_new = "stats: [['Capacity', route[4]], ['Price', route[2]], ['Context', route[3]], ['Eligibility', cooldown ? 'after reset' : 'current'], ['Route class', 'free'], ['Source', 'provider catalog']]"
    doc = _replace_once(doc, free_old, free_new, need, "free route price label")

    # Both provider collections (focused diagnostic additions and normal room
    # construction) and both account collections use the record projection.
    need(doc.count("var providers = DATA.providers;") == 2, "T34 provider collection count drift")
    doc = doc.replace("var providers = DATA.providers;", "var providers = visibleProviders();")
    need(doc.count("var costs = DATA.costs;") == 2, "T34 cost collection count drift")
    doc = doc.replace("var costs = DATA.costs;", "var costs = projectedCosts();")
    doc = _replace_once(doc, "return richList(DATA.accounts.map(", "return richList(visibleAccounts().map(", need, "focused account projection")
    doc = _replace_once(doc, "widgets = DATA.accounts.map(accountCard);", "widgets = visibleAccounts().map(accountCard);", need, "account room projection")

    settlement_old = "widgets.push(widget('plan-settlement', 'Settlement mix', 'current window', 'green', 3, 4, 'detailed', function () { return richList(providers.map(function (provider,index) { return [provider.name, provider.plan, provider.cost ? money(provider.cost) : 'plan covered', provider.cost ? 'warn' : 'ok', index > 4 ? 'expanded' : '', provider.requests + ' requests']; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));"
    settlement_new = "widgets.push(widget('plan-settlement', 'Billing, entitlement, settlement', state.range, 'green', 3, 4, 'detailed', function () { return richList(providers.map(function (provider,index) { var metrics=providerMetrics(provider); return [provider.name, provider.billing_basis + ' · ' + provider.entitlement_class, metrics.settlement_summary, metrics.settlement_summary.indexOf('pending') >= 0 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', metrics.requests + ' attempt-backed requests']; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));"
    doc = _replace_once(doc, settlement_old, settlement_new, need, "billing entitlement card")

    analytics_old = "widgets = providers.map(function (provider) { return summaryCard('tok-'+provider.id, provider.name, state.range+' tokens', provider.tone, tok(scaled(provider.tokens)), 'input plus output', provider.requests+' calls', '', [['Input',tok(scaled(provider.input))],['Output',tok(scaled(provider.output))],['Cache',provider.cache.toFixed(1)+'%'],['Output ratio',Math.round(provider.output/provider.tokens*100)+'%']], provider.pace, provider.forecast, 'glance', { cols: 2, rows: 2, minCols: 2 }); });"
    analytics_new = "widgets = providers.map(function (provider) { var metrics=providerMetrics(provider); return summaryCard('tok-'+provider.id, provider.name, state.range+' attempt records', provider.tone, tok(metrics.tokens), 'input plus output', metrics.requests+' calls', '', [['Input',tok(metrics.input)],['Output',tok(metrics.output)],['Attempts',String(metrics.attempts)],['Output ratio',metrics.tokens?Math.round(metrics.output/metrics.tokens*100)+'%':'n/a']], metrics.allowance_authority, metrics.allowance_freshness, 'glance', { cols: 2, rows: 2, minCols: 2 }); });"
    doc = _replace_once(doc, analytics_old, analytics_new, need, "attempt-backed analytics cards")

    settlement_states_old = r'''      widgets.push(widget('settlement-states', 'Settlement states', 'current range', 'green', 2, 4, 'detailed', function () {
        return richList([
          ['Settled', 'final provider or plan receipt', '842', 'ok', '', '98.4%'],
          ['Streaming partial', 'response still open', '3', 'warn', '', '0.4%'],
          ['Adjusted', 'late price or usage correction', '7', 'ok', '', '0.8%'],
          ['Unknown', 'authority not exposed', '4', 'warn', '', '0.4%']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: 4  }));'''
    settlement_states_new = r'''      widgets.push(widget('settlement-states', 'Settlement states', state.range, 'green', 2, 4, 'detailed', function () {
        var attempts = projectedAttempts(), counts = {};
        attempts.forEach(function (attempt) { counts[attempt.settlement_status] = (counts[attempt.settlement_status] || 0) + 1; });
        var rows = Object.keys(counts).sort().map(function (status) { return [status, 'independent attempt receipt state', String(counts[status]), status.indexOf('pending') >= 0 ? 'warn' : 'ok', '', attempts.length ? Math.round(counts[status] / attempts.length * 100) + '%' : '0%']; });
        return richList(rows.length ? rows : [['No attempts', 'selected scope and range', '0', 'warn', '', 'no settlement inferred']]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: projectedAttempts().length || 1  }));'''
    doc = _replace_once(doc, settlement_states_old, settlement_states_new, need, "attempt-backed settlement states")

    attempt_lineage_old = r'''      widgets.push(widget('attempt-lineage', 'Attempt lineage', 'receipt chain', 'blue', 2, 6, 'detailed', function () {
        return richList([
          ['run-47', 'node-18 · attempt-03', 'Claude Work', 'ok', '', 'receipt rcpt-8421'],
          ['run-47', 'node-22 · attempt-01', 'Gemini Direct', 'ok', '', 'receipt rcpt-8429'],
          ['run-46', 'node-31 · attempt-02', 'Codex Personal', 'ok', '', 'receipt rcpt-8392'],
          ['run-45', 'node-12 · attempt-01', 'Qwen Work', 'ok', '', 'receipt rcpt-8314'],
          ['run-44', 'node-09 · attempt-04', 'Kimi Team', 'warn', '', 'adjusted receipt']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
      widgets.push(widget('usage-record-state', 'Usage record state', 'settlement lifecycle', 'purple', 2, 5, 'diagnostics', function () {
        return richList([
          ['Final', 'provider or plan receipt settled', '842', 'ok', '', 'immutable projection input'],
          ['Streaming partial', 'attempt still open', '3', 'warn', '', 'not yet billed final'],
          ['Adjusted', 'late catalog or provider correction', '7', 'warn', '', 'supersedes prior amount'],
          ['Unknown authority', 'route emitted no source', '4', 'warn', '', 'not converted to zero'],
          ['Redacted', 'sensitive payload removed', '7', 'ok', '', 'usage totals retained']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));'''
    attempt_lineage_new = r'''      widgets.push(widget('attempt-lineage', 'Attempt lineage', state.range + ' receipt chain', 'blue', 2, 6, 'detailed', function () {
        var attempts = projectedAttempts();
        return richList(attempts.map(function (attempt, index) { return [attempt.attempt_id, attempt.provider_id + ' · ' + attempt.account_id, attempt.effective_route_id, attempt.settlement_status.indexOf('pending') >= 0 ? 'warn' : 'ok', index > 5 ? 'expanded' : '', attempt.settlement_status]; }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: projectedAttempts().length }));
      widgets.push(widget('usage-record-state', 'Usage record state', state.range + ' settlement lifecycle', 'purple', 2, 5, 'diagnostics', function () {
        var attempts = projectedAttempts(), counts = {};
        attempts.forEach(function (attempt) { counts[attempt.settlement_status] = (counts[attempt.settlement_status] || 0) + 1; });
        return richList(Object.keys(counts).sort().map(function (status) { return [status, 'attempt receipt authority', String(counts[status]), status.indexOf('pending') >= 0 ? 'warn' : 'ok', '', 'never inferred from billing or entitlement']; }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: projectedAttempts().length }));'''
    doc = _replace_once(doc, attempt_lineage_old, attempt_lineage_new, need, "attempt-backed lineage widgets")

    ledger_main_old = r'''      widgets = [
        widget('ledger-main', 'Recent events', state.range, 'blue', 4, 4, 'glance', function () { return richList(DATA.ledger.map(function (row,index) { return [humanizeUsageEvent(row[1]), row[2]+' · '+row[3], row[0], '', index>5?'expanded':'', row[1]]; }), true); }, { kind: 'list', minCols: 3, minRows: 3, contentCount: DATA.ledger.length, maxRows: 6 }),
        summaryCard('ledger-count','Events',state.range,'blue',String(DATA.ledger.length),'visible usage events','+2','',[['Receipts','7'],['Routes','4'],['Runs','2'],['Warnings','2']],'Retention','90 days','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-errors','Warnings',state.range,'orange','2','limits or missing readings','open','warn',[['Allowance','1'],['Pricing','1'],['Resolved','4'],['Snoozed','0']],'Oldest','12m','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-routes','Routes',state.range,'green','9','effective route identities','all known','',[['Provider','6'],['Account','6'],['Fallback','3'],['Unknown','0']],'Coverage','100%','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-export','Receipts','retained 90d','purple','1.8k','receipt-linked events','JSON','',[['Runs','62'],['Providers','6'],['Redacted','4'],['Missing','0']],'Export','ready','diagnostics',{cols:2,rows:2,minCols:2})
      ];
      widgets.push(summaryCard('ledger-coverage','Event coverage',state.range,'green','99.98%','priced or plan-covered events','3 unpriced','warn',[['Priced','1.4k'],['Plan covered','411'],['Unpriced','3'],['Unknown route','0']],'Authority','usage ledger','diagnostics',{cols:2,rows:2,minCols:2}));'''
    ledger_main_new = r'''      var ledgerAttempts = projectedAttempts();
      var ledgerProviders = {}, ledgerAccounts = {}, ledgerRoutes = {}, pendingCount = 0;
      ledgerAttempts.forEach(function (attempt) { ledgerProviders[attempt.provider_id] = true; ledgerAccounts[attempt.account_id] = true; ledgerRoutes[attempt.effective_route_id] = true; if (attempt.settlement_status.indexOf('pending') >= 0) pendingCount += 1; });
      widgets = [
        widget('ledger-main', 'Recent attempts', state.range, 'blue', 4, 4, 'glance', function () { return richList(ledgerAttempts.map(function (attempt,index) { return ['Usage attempt', attempt.provider_id + ' · ' + attempt.model_id, new Date(attempt.occurred_at).toLocaleString(), attempt.settlement_status.indexOf('pending') >= 0 ? 'warn' : 'ok', index>5?'expanded':'', attempt.attempt_id + ' · ' + attempt.settlement_status]; }), true); }, { kind: 'list', minCols: 3, minRows: 3, contentCount: ledgerAttempts.length, maxRows: 6 }),
        summaryCard('ledger-count','Attempts',state.range,'blue',String(ledgerAttempts.length),'identity-bound usage attempts','records','',[['Settled',String(ledgerAttempts.length-pendingCount)],['Pending',String(pendingCount)],['Providers',String(Object.keys(ledgerProviders).length)],['Accounts',String(Object.keys(ledgerAccounts).length)]],'Projection','selected records','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-errors','Pending settlement',state.range,'orange',String(pendingCount),'attempt receipts not final',pendingCount?'open':'clear',pendingCount?'warn':'',[['Pending',String(pendingCount)],['Unknown','0'],['Inferred','0'],['Dropped','0']],'Policy','preserve state','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-routes','Effective routes',state.range,'green',String(Object.keys(ledgerRoutes).length),'stable effective route identities','attempt backed','',[['Providers',String(Object.keys(ledgerProviders).length)],['Accounts',String(Object.keys(ledgerAccounts).length)],['Attempts',String(ledgerAttempts.length)],['Unknown','0']],'Coverage',ledgerAttempts.length?'100%':'n/a','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-export','Receipts',state.range,'purple',String(ledgerAttempts.length),'attempt records available','JSON','',[['Attempts',String(ledgerAttempts.length)],['Providers',String(Object.keys(ledgerProviders).length)],['Redacted','0'],['Missing axes','0']],'Export','selected records','diagnostics',{cols:2,rows:2,minCols:2})
      ];
      widgets.push(summaryCard('ledger-coverage','Identity coverage',state.range,'green',ledgerAttempts.length?'100%':'n/a','attempts with all stable identity axes',ledgerAttempts.length+' records','',[['Attempts',String(ledgerAttempts.length)],['Providers',String(Object.keys(ledgerProviders).length)],['Accounts',String(Object.keys(ledgerAccounts).length)],['Unknown route','0']],'Authority','attempt fixture','diagnostics',{cols:2,rows:2,minCols:2}));'''
    doc = _replace_once(doc, ledger_main_old, ledger_main_new, need, "attempt-backed ledger room")

    ledger_open_old = "    if (openRow && state.room === 'ledger') { var eventIndex = +openRow.getAttribute('data-open-row'), usageEventRef = 'ue-' + (608 + eventIndex); command('cmd.nav.open_usage_subject', { route_target: { object_kind: 'usage_event', object_id: usageEventRef }, open_subject: { subject_kind: 'usage_event', subject_id: usageEventRef }, usage_event_ref: usageEventRef }, { opened: true }); usageEvent('view.usage.subject_opened', { detail_kind: 'event', usage_event_ref: usageEventRef }); openInspector('Usage event', inspectorEvent(eventIndex)); return; }"
    ledger_open_new = "    if (openRow && state.room === 'ledger') { var eventIndex = +openRow.getAttribute('data-open-row'), selectedAttempt = projectedAttempts()[eventIndex]; if (!selectedAttempt) return; var attemptId = selectedAttempt.attempt_id; command('cmd.nav.open_usage_subject', { route_target: { object_kind: 'usage_attempt', object_id: attemptId }, attempt_id: attemptId, usage_event_ref: selectedAttempt.usage_event_ref, usage_record_id: selectedAttempt.usage_record_id, provider_attempt_ref: selectedAttempt.provider_attempt_ref, provider_id: selectedAttempt.provider_id, account_id: selectedAttempt.account_id, source_class: selectedAttempt.source_class, source_confidence: selectedAttempt.source_confidence, source_authority: selectedAttempt.source_authority, settlement_status: selectedAttempt.settlement_status, projection_freshness: selectedAttempt.projection_freshness, projection_health: selectedAttempt.projection_health }, { opened: true }); openInspector('Usage attempt', inspectorEvent(attemptId)); return; }"
    doc = _replace_once(doc, ledger_open_old, ledger_open_new, need, "ledger row identity routing")

    open_card_old = "    if (openCard) { var cardId = openCard.getAttribute('data-open-card'); command('cmd.nav.open_usage_subject', { route_target: { object_kind: 'usage_provider', object_id: cardId }, open_subject: { subject_kind: 'usage_provider', subject_id: cardId } }, { opened: true }); usageEvent('view.usage.subject_opened', { detail_kind: 'panel', panel_id: cardId }); openInspector('Panel details', inspectorCard(cardId)); return; }"
    open_card_new = "    if (openCard) { var cardId = openCard.getAttribute('data-open-card'), detail = localCardDetail(cardId); viewAction('usage.details.open', detail.payload); openInspector(detail.title, inspectorCard(cardId)); return; }"
    doc = _replace_once(doc, open_card_old, open_card_new, need, "local non-Ledger details")

    overview_month_old = "summaryCard('month', 'Month to date', 'actual', 'orange', money(costs.month), 'actual provider charges', '+8.2%', 'warn', [['API', money(costs.api)], ['Plans', money(costs.plans)], ['Forecast', money(costs.forecast)], ['Budget', money(costs.budget)]], 'Daily burn', money(costs.burn))"
    overview_month_new = "summaryCard('month', 'Selected window value', state.range, 'orange', money(costs.selected), 'attempt-backed charge plus plan allocation', costs.attempts+' attempts', '', [['Settled API', money(costs.api)], ['Plan estimate', money(costs.plans)], ['Cache estimate', money(costs.saved)], ['Pending', String(costs.pending)]], 'Projection basis', costs.window_label)"
    doc = _replace_once(doc, overview_month_old, overview_month_new, need, "selected-window overview cost")

    budget_now_pattern = r"      widgets\.push\(widget\('budget-now'.*?\n      \}, \{ kind: 'instrument', minCols: 3 \}\)\);"
    budget_now_new = r'''      widgets.push(widget('budget-now', 'Budget projection', state.range, 'green', 3, 3, 'glance', function () {
        var remaining = Math.max(0, costs.budget - costs.forecast), used = Math.round(costs.forecast / costs.budget * 100);
        return instrument({ name: 'Monthly budget', subtitle: 'projection from ' + costs.window_label, value: money(remaining), valueLabel: 'projected remaining', statusClass: used > 90 ? 'warn' : 'ok', stats: [['Selected value', money(costs.selected)], ['Forecast estimate', money(costs.forecast)], ['Overage risk', money(costs.overage)], ['Attempts', String(costs.attempts)], ['24h equivalent', money(costs.burn)], ['Budget', money(costs.budget)]], meters: [['Forecast used', money(costs.forecast), used, used > 90 ? 'orange' : 'green'], ['Plan allocation share', costs.planUtil + '%', costs.planUtil, 'purple']], footerLeft: 'Budget ' + money(costs.budget), footerRight: 'estimate', action: 'budget' });
      }, { kind: 'instrument', minCols: 3 }));'''
    doc = _sub_once(doc, budget_now_pattern, budget_now_new, need, "attempt-backed budget projection", re.S)

    plan_value_pattern = r"      widgets\.push\(widget\('plan-value-now'.*?\n      \}, \{ kind: 'instrument', minCols: 3 \}\)\);"
    plan_value_new = r'''      widgets.push(widget('plan-value-now', 'Plan allocation', state.range, 'purple', 3, 3, 'glance', function () {
        var records = projectedAttempts(), planRecords = records.filter(function (attempt) { return attempt.billing_basis === 'subscription'; });
        return instrument({ name: 'Estimated plan allocation', subtitle: 'explicit values on selected attempts', value: costs.planUtil + '%', valueLabel: 'value share', statusClass: 'ok', stats: [['Plan estimate', money(costs.plans)], ['Settled API', money(costs.api)], ['Plan attempts', String(planRecords.length)], ['Metered attempts', String(records.length-planRecords.length)], ['Plan providers', String(distinctCount(planRecords,'provider_id'))], ['Selected tokens', tok(projectionTotals(records).tokens)]], meters: [['Plan allocation', costs.planUtil + '%', costs.planUtil, 'purple'], ['Metered API', costs.apiUtil + '%', costs.apiUtil, 'orange']], footerLeft: costs.window_label, footerRight: 'estimate', action: 'coverage' });
      }, { kind: 'instrument', minCols: 3 }));'''
    doc = _sub_once(doc, plan_value_pattern, plan_value_new, need, "attempt-backed plan allocation", re.S)

    forecast_old = "widgets.push(widget('forecast', 'Spend forecast', 'month end', 'orange', 4, 3, 'detailed', function () { return chartPanel([22,26,31,29,37,42,40,49,54,57,62,66,64,71,76,82,79,86], [['Forecast', money(costs.forecast)], ['Budget', money(costs.budget)], ['Runway', '11d'], ['Confidence', '87%']], 'Daily forecast', 'Forecast combines provider charges and allocated subscription value.'); }, { kind: 'chart', minCols: 3, minRows: 2 }))"
    forecast_new = "widgets.push(widget('forecast', 'Spend projection', state.range + ' basis', 'orange', 4, 3, 'detailed', function () { return chartPanel(projectedAttempts().map(function (attempt) { return Math.round((attempt.charge + attempt.plan_allocation_estimate) * 100); }), [['30d projection', money(costs.forecast)], ['Budget', money(costs.budget)], ['Selected value', money(costs.selected)], ['Attempts', String(costs.attempts)]], 'Attempt value sequence', 'Projection uses explicit attempt charges and labeled plan-allocation estimates.'); }, { kind: 'chart', minCols: 3, minRows: 2 }))"
    doc = _replace_once(doc, forecast_old, forecast_new, need, "attempt-backed spend projection")

    costs_branch_pattern = r"    \} else if \(room === 'costs'\) \{\n      widgets = \[.*?\n    \} else if \(room === 'accounts'\) \{"
    costs_branch_new = r'''    } else if (room === 'costs') {
      var costAttempts = projectedAttempts(), costTotals = projectionTotals(costAttempts);
      var meteredAttempts = costAttempts.filter(function (attempt) { return attempt.billing_basis === 'metered API'; });
      var planAttempts = costAttempts.filter(function (attempt) { return attempt.billing_basis === 'subscription'; });
      widgets = [
        summaryCard('cost-month', 'Selected window value', state.range, 'orange', money(costs.selected), 'attempt-backed charge plus estimates', costs.attempts+' attempts', '', [['Settled API', money(costs.api)], ['Plan estimate', money(costs.plans)], ['24h equivalent', money(costs.burn)], ['Pending', String(costs.pending)]], 'Basis', costs.window_label),
        summaryCard('cost-api', 'Settled API charges', state.range, 'blue', money(costs.api), 'settled metered attempt receipts', String(meteredAttempts.length)+' attempts', '', [['Metered attempts', String(meteredAttempts.length)], ['Providers', String(distinctCount(meteredAttempts,'provider_id'))], ['Pending', String(costs.pending)], ['Authority', 'attempt receipt']], 'Unpriced', 'not converted to zero'),
        summaryCard('cost-plan', 'Plan allocation estimate', state.range, 'purple', money(costs.plans), 'explicit per-attempt fixture values', costs.planUtil + '% share', '', [['Plan attempts', String(planAttempts.length)], ['Providers', String(distinctCount(planAttempts,'provider_id'))], ['Requests', String(projectionTotals(planAttempts).requests)], ['Authority', 'labeled estimate']], 'Settlement', 'separate axis'),
        summaryCard('cost-save', 'Cache avoided estimate', state.range, 'green', money(costs.saved), 'explicit per-attempt fixture values', costAttempts.length+' attempts', '', [['Input', tok(costTotals.input)], ['Output', tok(costTotals.output)], ['Providers', String(distinctCount(costAttempts,'provider_id'))], ['Authority', 'labeled estimate']], 'No runtime rate', 'fixture carried')
      ];
      widgets.push(widget('budget', 'Budget projection', state.range + ' basis', 'blue', 4, 3, 'glance', function () { var pct = Math.round(costs.forecast / costs.budget * 100); return instrument({ name: 'Monthly budget', subtitle: 'projection from selected attempt window', value: pct + '%', valueLabel: 'projected', statusClass: pct > 90 ? 'warn' : 'ok', stats: [['Selected value', money(costs.selected)], ['30d projection', money(costs.forecast)], ['Projected remaining', money(Math.max(0,costs.budget-costs.forecast))], ['Overage risk', money(costs.overage)], ['24h equivalent', money(costs.burn)], ['Attempts', String(costs.attempts)]], meters: [['Projection', money(costs.forecast), pct, pct > 90 ? 'orange' : 'green'], ['Plan allocation share', costs.planUtil + '%', costs.planUtil, 'purple']], details: [['Charge authority', 'settled attempt receipt'], ['Plan authority', 'explicit labeled estimate'], ['Basis', costs.window_label], ['Scope', scopeCaption()], ['Pending receipts', String(costs.pending)], ['No runtime rate', 'true']], footerLeft: 'budget ' + money(costs.budget), footerRight: 'estimate', action: 'budget' }); }, { kind: 'instrument', minCols: 3, maxRows: 5 }));
      widgets.push(widget('cost-trend', 'Attempt value sequence', state.range, 'orange', 4, 3, 'detailed', function () { return chartPanel(costAttempts.map(function (attempt) { return Math.round((attempt.charge + attempt.plan_allocation_estimate) * 100); }), [['Selected', money(costs.selected)], ['30d projection', money(costs.forecast)], ['Budget', money(costs.budget)], ['24h equivalent', money(costs.burn)]], 'Attempt value sequence', 'Settled charges and labeled allocation estimates remain separate fields.'); }, { kind: 'chart', minCols: 3, minRows: 2 }));
      widgets.push(widget('provider-cost', 'Provider value', state.range, 'purple', 4, 4, 'diagnostics', function () { return richList(providers.map(function (provider,index) { var metrics=providerMetrics(provider); return [provider.name, provider.billing_basis + ' · ' + metrics.attempts + ' attempts', money(metrics.cost + metrics.plans), metrics.settlement_summary.indexOf('pending') >= 0 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', 'API ' + money(metrics.cost) + ' · plan estimate ' + money(metrics.plans)]; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));
      widgets.push(widget('pricing-confidence', 'Value authority', state.range, 'green', 4, 4, 'diagnostics', function () { return richList([['Settled API', 'direct attempt receipt amount', money(costs.api), 'ok', '', costs.settled + ' settled attempts'], ['Plan allocation', 'explicit per-attempt estimate', money(costs.plans), 'warn', '', planAttempts.length + ' attempts'], ['Cache avoided', 'explicit per-attempt estimate', money(costs.saved), 'warn', '', costAttempts.length + ' attempts'], ['Pending settlement', 'not promoted to settled charge', String(costs.pending), costs.pending ? 'warn' : 'ok', '', 'independent settlement axis']]); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: 4, maxRows: 5 }));
    } else if (room === 'accounts') {'''
    doc = _sub_once(doc, costs_branch_pattern, costs_branch_new, need, "selected-window cost room", re.S)

    selector_truth_source = r'''
  function projectionSnapshot() {
    var records = projectedAttempts().slice().sort(function (left, right) { return left.attempt_id.localeCompare(right.attempt_id); });
    var totals = projectionTotals(records);
    totals.cache_read_tokens = records.reduce(function (sum, attempt) { return sum + (attempt.cache_read_tokens || 0); }, 0);
    totals.cache_write_tokens = records.reduce(function (sum, attempt) { return sum + (attempt.cache_write_tokens || 0); }, 0);
    totals.reasoning_tokens = records.reduce(function (sum, attempt) { return sum + (attempt.reasoning_tokens || 0); }, 0);
    totals.tool_errors = records.reduce(function (sum, attempt) { return sum + (attempt.tool_error_count || 0); }, 0);
    return { room:state.room, range:state.range, scope:state.scope, usage_event_refs:records.map(function (attempt) { return attempt.usage_event_ref; }), attempt_ids:records.map(function (attempt) { return attempt.attempt_id; }), totals:totals };
  }
  function groupedAttempts(records, field) {
    var groups = {};
    records.forEach(function (attempt) { var key = attempt[field] || 'unknown'; (groups[key] = groups[key] || []).push(attempt); });
    return groups;
  }
  function orderedAttemptSeries(records, field) {
    return records.slice().sort(function (left, right) { return new Date(left.occurred_at) - new Date(right.occurred_at); }).map(function (attempt) {
      return field === 'tokens' ? attempt.input_tokens + attempt.output_tokens : Number(attempt[field]) || 0;
    });
  }
  function selectedRecordRows(records, groupField) {
    var groups = groupedAttempts(records, groupField);
    return Object.keys(groups).sort().map(function (key) {
      var totals = projectionTotals(groups[key]);
      return [key, groups[key].length + ' attempts · ' + totals.requests + ' requests', tok(totals.tokens), groups[key].some(function (attempt) { return attempt.settlement_status.indexOf('pending') >= 0; }) ? 'warn' : 'ok', '', money(totals.cost) + ' settled · ' + money(totals.plans) + ' plan estimate'];
    });
  }
  var SELECTED_SELECTOR_IDS = {
    month:1,'cache-saved':1,'budget-now':1,'plan-value-now':1,forecast:1,'plan-settlement':1,'allowance-attribution':1,
    'cost-month':1,'cost-api':1,'cost-plan':1,'cost-save':1,budget:1,'cost-trend':1,'provider-cost':1,'pricing-confidence':1,'cost-authority':1,'burn-basis':1,
    'account-fallbacks':1,'route-mismatches':1,'free-history':1,'free-throughput':1,'token-trend':1,'model-mix':1,'cache-read-share':1,'reasoning-mix':1,'unknown-token-buckets':1,
    'ledger-main':1,'ledger-count':1,'ledger-errors':1,'ledger-routes':1,'ledger-export':1,'ledger-coverage':1,'settlement-states':1,'attempt-lineage':1,'usage-record-state':1,
    anom:1,'attention-history':1,'cache-trend':1,'cache-economics':1,'cache-break-even':1,'tool-list':1,'tool-latency':1,'tool-allowance':1,'signal-history':1,'pricing-provenance':1
  };
  var CURRENT_SELECTOR_IDS = {
    health:1,'active-runs':1,'context-now':1,'attention-now':1,'route-pressure':1,'next-reset':1,'completion-capacity':1,'run-attribution':1,'capacity-reservations':1,
    'reset-map':1,'plan-pressure':1,routing:1,'connection-authority':1,'free-route':1,'cooldown-eligibility':1,
    'ctx-window':1,'ctx-cache':1,'ctx-reclaim':1,'ctx-output':1,'ctx-route':1,'ctx-sources':1,'ctx-limits':1,'ctx-maint':1,'ctx-routing':1,'context-composition':1,'compaction-history':1,
    'tool-health':1,'tool-receipts':1,'operations-window':1,'signal-list':1,'signal-coverage':1,'auth-stale':1,'provider-probe-state':1
  };
  var CURRENT_SCOPE_SELECTOR_IDS = {
    'route-pressure':1,'reset-map':1,'plan-pressure':1,'connection-authority':1
  };
  function selectorApplicability(item, room) {
    if (SELECTED_SELECTOR_IDS[item.id] || item.id.indexOf('tok-') === 0 || /^tool-[0-9]+$/.test(item.id)) return 'selected_usage_attempts';
    if (item.id.indexOf('plan-') === 0 && DATA.providers.some(function (provider) { return item.id === 'plan-' + provider.id; })) return 'selected_attempts_plus_current_provider';
    if (item.id.indexOf('acct-') === 0) return item.id.indexOf('setup') >= 0 ? 'current_scope_filtered' : 'selected_attempts_plus_current_provider';
    if (CURRENT_SCOPE_SELECTOR_IDS[item.id] || item.id.indexOf('alert-') === 0 || /^cache-[0-9]+$/.test(item.id)) return 'current_scope_filtered';
    if (CURRENT_SELECTOR_IDS[item.id] || item.id.indexOf('alert-') === 0 || /^cache-[0-9]+$/.test(item.id) || /^free-[0-9]+$/.test(item.id) || /^signal-[0-9]+$/.test(item.id)) return 'current_operational';
    return 'invariant_semantics';
  }
  function selectorLabel(applicability) {
    return applicability === 'selected_usage_attempts' ? 'selected records' : applicability === 'selected_attempts_plus_current_provider' ? 'selected records + current provider' : applicability === 'current_scope_filtered' ? 'current provider reading; scope filters provider roster; range does not apply' : applicability === 'current_operational' ? 'current global reading; scope and range do not apply' : 'invariant; selectors do not apply';
  }
  function applySelectedRender(item) {
    var id = item.id;
    if (id === 'cache-saved') item.render = function () { var records=projectedAttempts(), snapshot=projectionSnapshot(); return summary({value:money(snapshot.totals.saved),label:'explicit cache-avoided estimates',trend:records.length+' attempts',cells:[['Cache read',tok(snapshot.totals.cache_read_tokens)],['Cache write',tok(snapshot.totals.cache_write_tokens)],['Providers',String(distinctCount(records,'provider_id'))],['Authority','fixture record estimate']],footerLeft:state.range,footerRight:scopeCaption(),bars:orderedAttemptSeries(records,'cache_read_tokens'),signalLabel:'selected cache-read records'}); };
    if (id === 'allowance-attribution') item.render = function () { var records=projectedAttempts(), rows=selectedRecordRows(records,'provider_id'); return richList(rows.length?rows:[['No attempts','selected scope and range','0','warn','','no allowance attribution inferred']]); };
    if (id === 'plan-settlement') item.render = function () { var records=projectedAttempts(), groups=groupedAttempts(records,'settlement_status'); return richList(Object.keys(groups).sort().map(function(status){return[status,'independent attempt state',String(groups[status].length),status.indexOf('pending')>=0?'warn':'ok','',Math.round(groups[status].length/Math.max(1,records.length)*100)+'%'];})); };
    if (id === 'cost-authority') item.render = function () { var records=projectedAttempts(), totals=projectionTotals(records), pending=records.filter(function(a){return a.settlement_status.indexOf('pending')>=0;}).length; return richList([['API billed','settled attempt receipts',money(totals.cost),'ok','','selected records'],['Plan allocation','explicit estimate fields',money(totals.plans),'warn','','selected records'],['Cache avoided','explicit estimate fields',money(totals.saved),'warn','','selected records'],['Pending','not promoted to settled charge',String(pending),pending?'warn':'ok','','independent settlement'],['Missing identities','rejected before append','0','ok','','fail closed']]); };
    if (id === 'burn-basis') item.render = function () { var records=projectedAttempts(), costs=projectedCosts(); return summary({value:money(costs.burn)+'/d',label:'24h equivalent from selected records',trend:records.length+' attempts',cells:[['Settled charge',money(costs.api)],['Plan estimate',money(costs.plans)],['Pending',String(costs.pending)],['Window hours',String(rangeHours())]],footerLeft:scopeCaption(),footerRight:'projection only',bars:orderedAttemptSeries(records,'charge'),signalLabel:'selected settled charges'}); };
    if (id === 'account-fallbacks' || id === 'route-mismatches') item.render = function () { var records=projectedAttempts(), mismatches=records.filter(function(a){return a.requested_route_id!==a.effective_route_id;}); return richList((mismatches.length?mismatches:records).map(function(a,index){return[a.attempt_id,a.requested_route_id,a.effective_route_id,a.requested_route_id===a.effective_route_id?'ok':'warn',index>5?'expanded':'',a.provider_id+' · '+a.account_id];})); };
    if (id === 'free-history' || id === 'free-throughput') item.render = function () { var records=projectedAttempts().filter(function(a){return a.charge===0;}), totals=projectionTotals(records); return chartPanel(orderedAttemptSeries(records,'request_count'),[['No metered charge',String(records.length)+' attempts'],['Requests',String(totals.requests)],['Tokens',tok(totals.tokens)],['Plan estimate',money(totals.plans)]],'Selected no-charge attempt cadence','No metered charge does not imply a free entitlement; billing and entitlement remain separate axes.'); };
    if (id === 'token-trend') item.render = function () { var records=projectedAttempts(), totals=projectionTotals(records); return chartPanel(orderedAttemptSeries(records,'tokens'),[['Input',tok(totals.input)],['Output',tok(totals.output)],['Attempts',String(records.length)],['Providers',String(distinctCount(records,'provider_id'))]],'Selected token volume','Input and output are summed only from selected identity-bound attempts.'); };
    if (id === 'model-mix') item.render = function () { var records=projectedAttempts(), rows=selectedRecordRows(records,'model_id'); return richList(rows.length?rows:[['No models','selected scope and range','0','warn','','no records']]); };
    if (id === 'cache-read-share') item.render = function () { var records=projectedAttempts(), snap=projectionSnapshot(), denominator=snap.totals.cache_read_tokens+snap.totals.cache_write_tokens, share=denominator?Math.round(snap.totals.cache_read_tokens/denominator*100):0; return chartPanel(orderedAttemptSeries(records,'cache_read_tokens'),[['Read',tok(snap.totals.cache_read_tokens)],['Write',tok(snap.totals.cache_write_tokens)],['Read share',share+'%'],['Saved estimate',money(snap.totals.saved)]],'Selected cache-read share','Cache fields are explicit facts on selected attempt fixtures.'); };
    if (id === 'reasoning-mix') item.render = function () { var records=projectedAttempts(), snap=projectionSnapshot(); return chartPanel(orderedAttemptSeries(records,'reasoning_tokens'),[['Visible output',tok(snap.totals.output)],['Reasoning',tok(snap.totals.reasoning_tokens)],['Unknown','0'],['Attempts',String(records.length)]],'Selected reasoning bucket','Reasoning is an explicit fixture field and is not added to inclusive output.'); };
    if (id === 'unknown-token-buckets') item.render = function () { var records=projectedAttempts(); return summary({value:'0',label:'selected records with missing required token facts',trend:'fail-closed append',cells:[['Attempts',String(records.length)],['Input unknown','0'],['Output unknown','0'],['Excluded','0']],footerLeft:state.range,footerRight:scopeCaption(),bars:orderedAttemptSeries(records,'request_count'),signalLabel:'accepted record cadence'}); };
    if (id === 'anom' || id === 'attention-history') item.render = function () { var records=projectedAttempts(), raised=records.filter(function(a){return (a.anomaly_score||0)>=50;}); return chartPanel(orderedAttemptSeries(records,'anomaly_score'),[['Selected',String(records.length)],['Raised',String(raised.length)],['Pending',String(records.filter(function(a){return a.settlement_status.indexOf('pending')>=0;}).length)],['Peak',String(Math.max.apply(Math,records.map(function(a){return a.anomaly_score||0;}).concat([0])))]],'Selected anomaly evidence','Scores belong to timestamped identity-bound attempt fixtures.'); };
    if (id === 'cache-trend') item.render = function () { var records=projectedAttempts(), snap=projectionSnapshot(); return chartPanel(orderedAttemptSeries(records,'cache_read_tokens'),[['Saved estimate',money(snap.totals.saved)],['Read',tok(snap.totals.cache_read_tokens)],['Write',tok(snap.totals.cache_write_tokens)],['Attempts',String(records.length)]],'Selected cache activity','No runtime price rate is inferred.'); };
    if (id === 'cache-economics') item.render = function () { var records=projectedAttempts(), groups=groupedAttempts(records,'provider_id'); return richList(Object.keys(groups).sort().map(function(provider){var snapRecords=groups[provider],totals=projectionTotals(snapRecords),read=snapRecords.reduce(function(s,a){return s+(a.cache_read_tokens||0);},0);return[provider,snapRecords.length+' attempts · '+tok(read)+' read',money(totals.saved),'ok','','explicit estimate fields'];})); };
    if (id === 'cache-break-even') item.render = function () { var records=projectedAttempts(), snap=projectionSnapshot(); return summary({value:money(snap.totals.saved),label:'selected cache-avoided estimate',trend:records.length+' attempts',cells:[['Cache read',tok(snap.totals.cache_read_tokens)],['Cache write',tok(snap.totals.cache_write_tokens)],['Providers',String(distinctCount(records,'provider_id'))],['Runtime rate','not used']],footerLeft:state.range,footerRight:scopeCaption(),bars:orderedAttemptSeries(records,'cache_avoided_estimate'),signalLabel:'selected estimate values'}); };
    if (/^tool-[0-9]+$/.test(id)) item.render = function () { var index=Number(id.slice(5)), tool=DATA.tools[index], records=projectedAttempts().filter(function(a){return tool&&a.tool_id===tool.tool_id;}), totals=projectionTotals(records), errors=records.reduce(function(s,a){return s+(a.tool_error_count||0);},0); return summary({value:String(records.length),label:(tool?tool.tool_id:'tool')+' attempts',trend:errors+' errors',trendClass:errors?'warn':'',cells:[['Requests',String(totals.requests)],['Tokens',tok(totals.tokens)],['Median latency',records.length?Math.round(records.reduce(function(s,a){return s+a.tool_latency_ms;},0)/records.length)+'ms':'n/a'],['Providers',String(distinctCount(records,'provider_id'))]],footerLeft:state.range,footerRight:scopeCaption(),bars:orderedAttemptSeries(records,'tool_latency_ms'),signalLabel:'selected tool latency'}); };
    if (id === 'tool-list' || id === 'tool-allowance') item.render = function () { var records=projectedAttempts(), groups=groupedAttempts(records,'tool_id'); return richList(Object.keys(groups).sort().map(function(tool){var totals=projectionTotals(groups[tool]);return[tool,groups[tool].length+' attempts · '+totals.requests+' requests',tok(totals.tokens),groups[tool].some(function(a){return a.tool_error_count;})?'warn':'ok','',money(totals.cost)+' settled'];})); };
    if (id === 'tool-latency') item.render = function () { var records=projectedAttempts(), values=orderedAttemptSeries(records,'tool_latency_ms'); return chartPanel(values,[['Attempts',String(records.length)],['Median',values.length?String(values.slice().sort(function(a,b){return a-b;})[Math.floor(values.length/2)])+'ms':'n/a'],['Errors',String(records.reduce(function(s,a){return s+(a.tool_error_count||0);},0))],['Tools',String(distinctCount(records,'tool_id'))]],'Selected tool latency','Latency facts belong to selected attempt fixtures.'); };
    if (id === 'signal-history') item.render = function () { var records=projectedAttempts(), complete=records.filter(function(a){return a.settlement_status&&a.provider_id&&a.account_id;}); return chartPanel(orderedAttemptSeries(records,'anomaly_score'),[['Attempts',String(records.length)],['Complete',String(complete.length)],['Pending',String(records.length-complete.filter(function(a){return a.settlement_status.indexOf('pending')<0;}).length)],['Providers',String(distinctCount(records,'provider_id'))]],'Selected signal evidence','Health is not inferred from absent Usage attempts.'); };
    if (id === 'pricing-provenance') item.render = function () { var records=projectedAttempts(), metered=records.filter(function(a){return a.billing_basis==='metered API';}), plan=records.filter(function(a){return a.billing_basis==='subscription';}); return richList([['Settled charge','attempt receipt authority',String(metered.filter(function(a){return a.settlement_status.indexOf('settled')>=0;}).length),'ok','','selected attempts'],['Plan allocation','explicit fixture estimate',String(plan.length),'warn','','selected attempts'],['Pending settlement','not promoted to charge',String(records.filter(function(a){return a.settlement_status.indexOf('pending')>=0;}).length),'warn','','independent state'],['Unpriced','rejected or preserved unknown','0','ok','','never converted to zero']]); };
    return item;
  }
  function applySelectorTruth(room, widgets) {
    var visibleProviderIds = {}; visibleProviders().forEach(function(provider){visibleProviderIds[provider.id]=true;});
    if (room === 'attention') widgets = widgets.filter(function(item){if(item.id.indexOf('alert-')!==0)return true;var alert=DATA.alerts[Number(item.id.slice(6))];return state.scope==='all'||!!(alert&&visibleProviderIds[alert.provider_id]);});
    if (room === 'cache') widgets = widgets.filter(function(item){if(!/^cache-[0-9]+$/.test(item.id))return true;var row=DATA.cache[Number(item.id.slice(6))];return state.scope==='all'||!!(row&&visibleProviderIds[row.provider_id]);});
    return widgets.map(function(item){
      item = applySelectedRender(item);
      item.selectorApplicability = selectorApplicability(item, room);
      item.selectorLabel = selectorLabel(item.selectorApplicability);
      item.meta = (item.meta ? item.meta + ' · ' : '') + item.selectorLabel;
      return item;
    });
  }
'''
    doc = _replace_once(doc, "\n  function curatedSizes(item) {", selector_truth_source + "\n  function curatedSizes(item) {", need, "selector truth classification and aggregation")
    doc = _replace_once(doc, "    return balanceRoomDefaults(addFocusedWidgets(room, widgets));", "    return balanceRoomDefaults(applySelectorTruth(room, addFocusedWidgets(room, widgets)));", need, "selector truth room application")
    doc = _replace_once(doc, "'\" data-kind=\"' + esc(item.kind) + '\" data-tone=\"'", "'\" data-selector-applicability=\"' + esc(item.selectorApplicability) + '\" data-kind=\"' + esc(item.kind) + '\" data-tone=\"'", need, "selector applicability card attribute")

    selector_fact_helpers = r'''
  var ACTIVE_SELECTOR_APPLICABILITY = 'invariant_semantics';
  function selectorFactRows(rangeLabel) {
    var applicability = ACTIVE_SELECTOR_APPLICABILITY;
    var selected = applicability === 'selected_usage_attempts' || applicability === 'selected_attempts_plus_current_provider';
    var scopeFiltered = applicability === 'current_scope_filtered';
    return [
      [rangeLabel || 'Range', selected ? state.range : 'does not apply'],
      ['Scope', selected || scopeFiltered ? scopeCaption() : 'does not apply']
    ];
  }
  function selectorTrendLabel() {
    if (ACTIVE_SELECTOR_APPLICABILITY === 'selected_usage_attempts' || ACTIVE_SELECTOR_APPLICABILITY === 'selected_attempts_plus_current_provider') return state.range + ' trend';
    if (ACTIVE_SELECTOR_APPLICABILITY === 'current_scope_filtered' || ACTIVE_SELECTOR_APPLICABILITY === 'current_operational') return 'current trend';
    return 'reference trend';
  }
  function renderWidgetBody(item, layout) {
    var previous = ACTIVE_SELECTOR_APPLICABILITY;
    ACTIVE_SELECTOR_APPLICABILITY = item.selectorApplicability || 'invariant_semantics';
    try { return item.render(layout); }
    finally { ACTIVE_SELECTOR_APPLICABILITY = previous; }
  }
'''
    doc = _replace_once(doc, "\n  function instrument(options) {", selector_fact_helpers + "\n  function instrument(options) {", need, "applicability-aware generic selector facts")
    instrument_details_old = r'''    var details = (options.details || [
      ['Authority', options.authority || 'provider receipt'],
      ['Freshness', options.freshness || '20s'],
      ['Range', state.range],
      ['Scope', scopeCaption()]
    ]).slice();'''
    instrument_details_new = r'''    var details = (options.details || [
      ['Authority', options.authority || 'provider receipt'],
      ['Freshness', options.freshness || '20s']
    ].concat(selectorFactRows('Range'))).slice();'''
    doc = _replace_once(doc, instrument_details_old, instrument_details_new, need, "instrument selector facts")
    doc = _replace_once(doc, "    var extras = (options.extraCells || [['Window', state.range], ['Scope', scopeCaption()], ['Authority', 'named source'], ['Freshness', '20s']]).slice();", "    var extras = (options.extraCells || selectorFactRows('Window').concat([['Authority', 'named source'], ['Freshness', '20s']])).slice();", need, "summary selector facts")
    chart_facts_old = r'''    if (allFacts.length < 5) allFacts.push(['Range', state.range]);
    if (allFacts.length < 6) allFacts.push(['Freshness', '20s']);
    if (allFacts.length < 7) allFacts.push(['Authority', 'named source']);
    if (allFacts.length < 8) allFacts.push(['Scope', scopeCaption()]);'''
    chart_facts_new = r'''    var selectorFacts = selectorFactRows('Range');
    if (allFacts.length < 5) allFacts.push(selectorFacts[0]);
    if (allFacts.length < 6) allFacts.push(['Freshness', '20s']);
    if (allFacts.length < 7) allFacts.push(['Authority', 'named source']);
    if (allFacts.length < 8) allFacts.push(selectorFacts[1]);'''
    doc = _replace_once(doc, chart_facts_old, chart_facts_new, need, "chart selector facts")
    doc = _replace_once(doc, "signalLabel: state.range + ' trend'", "signalLabel: selectorTrendLabel()", need, "summary selector trend label")
    doc = _replace_once(doc, "'<div class=\"pm7u-cardbody\">' + item.render(layout) + '</div><span class=\"pm7u-resize\"", "'<div class=\"pm7u-cardbody\">' + renderWidgetBody(item, layout) + '</div><span class=\"pm7u-resize\"", need, "card-scoped selector applicability")

    set_layout_pattern = r"  function setLayout\(item, cols, rows, commandId, source\) \{.*?\n  \}\n  function densityFor"
    set_layout_new = r'''  function setLayout(item, cols, rows, commandId, source) {
    var before = layoutFor(item);
    var next = clampLayout(item, cols, rows);
    if (before.cols === next.cols && before.rows === next.rows) return next;
    state.layout[state.room + ':' + item.id] = next;
    STORE.set(KEY + 'layout', state.layout);
    if (commandId) {
      command(commandId, { page: 'usage', instance_id: item.id, col_span: next.cols, row_span: next.rows }, { persisted: true, source: source || 'unknown' });
      usageEvent('view.usage.widget_resized', { widget_id: item.id, source: source || 'unknown', before: before, after: next, content_density: densityFor(next, item) });
    }
    return next;
  }
  function densityFor'''
    doc = _sub_once(doc, set_layout_pattern, set_layout_new, need, "no-op resize suppression", re.S)

    # Pointer resize is a transaction: the lifted card is only a preview.  A
    # settled, changed release persists exactly once. Pointer capture means an
    # edge growth may validly finish beyond the board's old footprint. A
    # release remains valid only inside the supported-geometry gesture
    # corridor (with one step of deliberate pointer overshoot); a far
    # outside-board release is cancellation. Cancellation, lost capture, blur,
    # and no-change release restore the authored DOM without a render,
    # command, receipt, or domain event.
    resize_pattern = r"  function startResize\(event, cardElement, item\) \{.*?\n  \}\n\n  function flipBefore"
    resize_new = r'''  function startResize(event, cardElement, item) {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation(); closePops();
    var handle = event.currentTarget || event.target, pointerId = event.pointerId;
    var original = layoutFor(item), startX = event.clientX, startY = event.clientY;
    var boardStyle = getComputedStyle(board);
    var columnGap = parseFloat(boardStyle.columnGap) || 10;
    var rowGap = parseFloat(boardStyle.rowGap) || columnGap;
    var rowHeight = parseFloat(boardStyle.gridAutoRows) || 100;
    var gridTracks = String(boardStyle.gridTemplateColumns || '').trim().split(/\\s+/).filter(function (track) { return track && track !== 'none'; });
    var trackCount = gridTracks.length || 12;
    var innerWidth = board.clientWidth - (parseFloat(boardStyle.paddingLeft) || 0) - (parseFloat(boardStyle.paddingRight) || 0);
    var cellWidth = (innerWidth - columnGap * Math.max(0, trackCount - 1)) / trackCount;
    function physicalColumnSpan(logicalCols) {
      var liveStyle = getComputedStyle(cardElement), start = String(liveStyle.gridColumnStart || ''), end = String(liveStyle.gridColumnEnd || '');
      if (start === '1' && end === '-1') return trackCount;
      var explicitSpan = /span\\s+([0-9]+)/.exec(end);
      if (explicitSpan) return Math.max(1, Math.min(trackCount, Number(explicitSpan[1])));
      return Math.max(1, Math.min(trackCount, logicalCols));
    }
    var lastCols = original.cols, lastRows = original.rows;
    var changed = false, finished = false;
    var origin = cardElement.getBoundingClientRect(), computed = getComputedStyle(cardElement);

    var placeholder = document.createElement('div');
    placeholder.className = 'pm7u-resize-placeholder'; placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.setProperty('--pm7-placeholder-column', computed.gridColumn);
    placeholder.style.setProperty('--pm7-placeholder-row', computed.gridRow);
    placeholder.style.width = origin.width + 'px'; placeholder.style.height = origin.height + 'px';
    board.insertBefore(placeholder, cardElement);

    cardElement.classList.add('is-resizing', 'pm7u-resize-lift');
    cardElement.style.left = origin.left + 'px'; cardElement.style.top = origin.top + 'px';
    cardElement.style.width = origin.width + 'px'; cardElement.style.height = origin.height + 'px';
    cardElement.style.gridColumn = 'auto'; cardElement.style.gridRow = 'auto'; opOn();

    var hud = document.createElement('div'); hud.className = 'pm7u-sizehud'; document.body.appendChild(hud);
    function updateHud(pointerEvent, layout) {
      hud.textContent = layout.cols + ' columns · ' + layout.rows + ' row' + (layout.rows === 1 ? '' : 's') + ' · ' + densityLabel(densityFor(layout, item));
      hud.style.left = Math.min(innerWidth - 215, pointerEvent.clientX + 12) + 'px';
      hud.style.top = Math.min(innerHeight - 34, pointerEvent.clientY + 12) + 'px';
    }
    updateHud(event, original);
    function move(moveEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      moveEvent.preventDefault();
      var next = clampLayout(item, original.cols + Math.round((moveEvent.clientX - startX) / (cellWidth + columnGap)), original.rows + Math.round((moveEvent.clientY - startY) / (rowHeight + rowGap)));
      if (next.cols === lastCols && next.rows === lastRows) { updateHud(moveEvent, next); return; }
      lastCols = next.cols; lastRows = next.rows;
      changed = next.cols !== original.cols || next.rows !== original.rows;
      applyLiveLayout(cardElement, next, item);
      var previewSpan = physicalColumnSpan(next.cols);
      cardElement.style.width = (previewSpan * cellWidth + Math.max(0, previewSpan - 1) * columnGap) + 'px';
      cardElement.style.height = (next.rows * rowHeight + Math.max(0, next.rows - 1) * rowGap) + 'px';
      updateHud(moveEvent, next);
    }
    function cleanup() {
      document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', commit, true);
      document.removeEventListener('pointercancel', cancel, true); document.removeEventListener('keydown', keydown, true);
      window.removeEventListener('blur', blur); handle.removeEventListener('lostpointercapture', lostCapture);
      try { if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId); } catch (error) {}
      cardElement.classList.remove('is-resizing', 'pm7u-resize-lift', 'is-density-changing');
      cardElement.style.left = ''; cardElement.style.top = ''; cardElement.style.width = ''; cardElement.style.height = '';
      cardElement.style.gridColumn = ''; cardElement.style.gridRow = '';
      if (placeholder.parentNode) placeholder.remove(); if (hud.parentNode) hud.remove(); opOff();
    }
    function finish(shouldCommit) {
      if (finished) return; finished = true;
      if (!shouldCommit || !changed) applyLiveLayout(cardElement, original, item);
      cleanup();
      if (shouldCommit && changed) { setLayout(item, lastCols, lastRows, 'cmd.widget.resize', 'pointer'); renderSettledBoard(); }
    }
    function validRelease(upEvent) {
      var releaseX = Number(upEvent.clientX), releaseY = Number(upEvent.clientY);
      if (!isFinite(releaseX) || !isFinite(releaseY)) return false;
      var horizontalStep = Math.max(1, cellWidth + columnGap);
      var verticalStep = Math.max(1, rowHeight + rowGap);
      var supported = curatedSizes(item);
      var minCols = item.minCols, maxCols = item.maxCols, minRows = item.minRows, maxRows = item.maxRows;
      if (supported.length) {
        minCols = Math.min.apply(null, supported.map(function (size) { return size[0]; }));
        maxCols = Math.max.apply(null, supported.map(function (size) { return size[0]; }));
        minRows = Math.min.apply(null, supported.map(function (size) { return size[1]; }));
        maxRows = Math.max.apply(null, supported.map(function (size) { return size[1]; }));
      }
      var minX = startX + (minCols - original.cols - 1) * horizontalStep;
      var maxX = startX + (maxCols - original.cols + 1) * horizontalStep;
      var minY = startY + (minRows - original.rows - 1) * verticalStep;
      var maxY = startY + (maxRows - original.rows + 1) * verticalStep;
      return releaseX >= minX && releaseX <= maxX && releaseY >= minY && releaseY <= maxY;
    }
    function commit(upEvent) {
      if (upEvent.pointerId !== pointerId) return;
      upEvent.preventDefault(); finish(validRelease(upEvent));
    }
    function cancel(cancelEvent) { if (cancelEvent && cancelEvent.pointerId != null && cancelEvent.pointerId !== pointerId) return; finish(false); }
    function keydown(keyEvent) { if (keyEvent.key !== 'Escape') return; keyEvent.preventDefault(); finish(false); }
    function blur() { finish(false); }
    function lostCapture(captureEvent) { if (captureEvent.pointerId === pointerId) finish(false); }

    handle.addEventListener('lostpointercapture', lostCapture);
    try { handle.setPointerCapture(pointerId); } catch (error) {}
    document.addEventListener('pointermove', move, { capture:true, passive:false });
    document.addEventListener('pointerup', commit, true); document.addEventListener('pointercancel', cancel, true);
    document.addEventListener('keydown', keydown, true); window.addEventListener('blur', blur);
  }

  function flipBefore'''
    doc = _sub_once(doc, resize_pattern, resize_new, need, "transactional pointer resize", re.S)

    scope_pattern = r"  function scopeHTML\(\) \{.*?\n  \}\n  function detailHTML"
    scope_new = r'''  function scopeDisplay(scope) {
    if (scope === 'all') return ['All current usage', 'Every configured route'];
    if (scope === 'work') return ['Work accounts', 'Company and team credentials'];
    if (scope === 'personal') return ['Personal accounts', 'Personal plans and keys'];
    if (scope.indexOf('provider:') === 0) {
      var id = scope.slice(9), provider = DATA.providers.filter(function (item) { return item.id === id; })[0];
      return [provider ? provider.name + ' only' : id + ' only', 'Only ' + (provider ? provider.name : id) + ' records'];
    }
    return [scope, 'Validated Usage scope'];
  }
  function scopeHTML() {
    var options = [['all','All current usage','Every configured route'],['work','Work accounts','Company and team credentials'],['personal','Personal accounts','Personal plans and keys']];
    DATA.providers.forEach(function (provider) { options.push(['provider:' + provider.id, provider.name + ' only', 'Only ' + provider.name + ' records']); });
    return '<div class="pm7u-poptitle">Scope</div>' + options.map(function (option) {
      return '<button type="button" class="pm7u-poprow ' + (option[0] === state.scope ? 'active' : '') + '" data-scope="' + option[0] + '">' + SVG.grid + '<span class="pm7u-popcopy"><b>' + option[1] + '</b><span>' + option[2] + '</span></span>' + (option[0] === state.scope ? '<span class="pm7u-popcheck">' + SVG.check + '</span>' : '') + '</button>';
    }).join('');
  }
  function detailHTML'''
    doc = _sub_once(doc, scope_pattern, scope_new, need, "provider scope options", re.S)

    scope_click_old = "      var labels = { all: ['All current usage', 'every configured route'], work: ['Work accounts', 'company and team credentials'], personal: ['Personal accounts', 'personal plans and keys'], 'provider:claude': ['Claude only', 'every Claude connection'], 'provider:codex': ['Codex only', 'every OpenAI connection'] };\n      $('#pm7uScopeLabel').textContent = labels[state.scope][0]; $('#pm7uScopeMeta').textContent = labels[state.scope][1]; closePops(); render(); toast('Scope changed to ' + labels[state.scope][0]); return;"
    scope_click_new = "      var labels = scopeDisplay(state.scope);\n      $('#pm7uScopeLabel').textContent = labels[0]; $('#pm7uScopeMeta').textContent = labels[1]; closePops(); render(); toast('Scope changed to ' + labels[0]); return;"
    doc = _replace_once(doc, scope_click_old, scope_click_new, need, "dynamic scope label")

    setup_click = r'''    var setupButton = event.target.closest('[data-provider-setup]');
    if (setupButton) {
      var setupAccount = DATA.accounts.filter(function (account) { return account.id === setupButton.getAttribute('data-provider-setup'); })[0];
      if (!setupAccount || setupAccount.status !== 'Provider Setup Required') return;
      command('cmd.settings.open', {
        route_id:'settings-route:usage-provider-setup',
        target:{ target_type:'setting', setting_id:'ai.accounts.provider-connections', manager_id:null, detail_id:null },
        origin_surface:'usage', origin_route:'usage/provider-setup',
        provider_id:setupAccount.provider_id, installation_id:setupAccount.installation_id,
        account_id:setupAccount.account_id, connection_id:setupAccount.connection_id,
        product_id:setupAccount.product_id, model_id:setupAccount.model_id,
        requested_route_id:setupAccount.requested_route_id, effective_route_id:setupAccount.effective_route_id,
        attempt_id:setupAccount.attempt_id, host:setupAccount.host, environment:setupAccount.environment,
        operation_id:setupAccount.operation_id, continuation_id:setupAccount.continuation_id,
        automatic_acquisition:false, automatic_authentication:false, automatic_route_change:false
      }, { opened:true, continuation_preserved:true });
      viewAction('usage.provider_setup.open_settings', { provider_id:setupAccount.provider_id, operation_id:setupAccount.operation_id, continuation_id:setupAccount.continuation_id });
      try { if (window.PM_PAGES && window.PM_PAGES.go) window.PM_PAGES.go('settings'); } catch (error) {}
      setTimeout(function () { if (window.PM7_SETTINGS_OPEN_BLOOM) window.PM7_SETTINGS_OPEN_BLOOM('ai', 'ai.accounts.provider-connections'); }, 0);
      return;
    }
'''
    doc = _replace_once(doc, "  app.addEventListener('click', function (event) {\n    var roomButton", "  app.addEventListener('click', function (event) {\n" + setup_click + "    var roomButton", need, "provider setup CTA wiring")

    # Transactional pointer reorder plus a real keyboard pickup/move/drop path.
    wire_old = "      drag.addEventListener('pointerdown', function (event) { startDrag(event, cardElement); });"
    wire_new = wire_old + "\n      drag.addEventListener('keydown', function (event) { startKeyboardDrag(event, cardElement, drag); });"
    doc = _replace_once(doc, wire_old, wire_new, need, "keyboard reorder binding")
    doc = _replace_once(doc, "  function render() {\n    var room = ROOM[state.room];", "  function render() {\n    if (document.body.classList.contains('pm7u-pointer-op')) return;\n    var room = ROOM[state.room];", need, "transaction render guard")
    doc = _replace_once(
        doc,
        "\n  function wireCards() {",
        "\n  function settleUsageCardAnimations() {\n    $$('.pm7u-card', board).forEach(function (card) { card.style.setProperty('animation', 'none', 'important'); });\n  }\n  function renderSettledBoard() {\n    render();\n    settleUsageCardAnimations();\n  }\n\n  function wireCards() {",
        need,
        "settled widget render without entrance replay",
    )
    doc = _replace_once(
        doc,
        "        event.preventDefault(); setLayout(item, cols, rows, 'cmd.widget.resize', 'keyboard'); render();",
        "        event.preventDefault(); setLayout(item, cols, rows, 'cmd.widget.resize', 'keyboard'); renderSettledBoard();",
        need,
        "keyboard resize settled render",
    )

    reorder_pattern = r"  function persistOrder\(\) \{.*?\n  \}\n\n  function inspectorEvent"
    reorder_new = r'''  function currentOrder() {
    return $$('.pm7u-card', board).filter(function (element) { return !element.classList.contains('is-reorder-source'); }).map(function (element) { return element.getAttribute('data-widget'); });
  }
  function ordersEqual(left, right) { return left.length === right.length && left.every(function (id, index) { return id === right[index]; }); }
  function restoreOrder(order) {
    order.forEach(function (id) { var element = $('.pm7u-card[data-widget="' + id + '"]', board); if (element) board.appendChild(element); });
  }
  function fullRoomOrder(visibleOrder) {
    var allIds = roomWidgets(state.room).map(function (item) { return item.id; });
    var saved = (state.order[state.room] || []).filter(function (id, index, list) { return allIds.indexOf(id) >= 0 && list.indexOf(id) === index; });
    allIds.forEach(function (id) { if (saved.indexOf(id) < 0) saved.push(id); });
    var visible = {}, queue = visibleOrder.slice();
    visibleOrder.forEach(function (id) { visible[id] = true; });
    return saved.map(function (id) { return visible[id] ? queue.shift() : id; });
  }
  function persistOrder(order) {
    state.order[state.room] = order.slice();
    STORE.set(KEY + 'order', state.order);
  }
  function settledGridPosition(cardElement) {
    if (!cardElement || cardElement.parentElement !== board) return { col:0, row:0 };
    var boardStyle = getComputedStyle(board), boardRect = board.getBoundingClientRect(), cardRect = cardElement.getBoundingClientRect();
    var tracks = String(boardStyle.gridTemplateColumns || '').trim().split(/\\s+/).filter(function (track) { return track && track !== 'none'; });
    var trackCount = tracks.length || 12;
    var columnGap = parseFloat(boardStyle.columnGap) || 10, rowGap = parseFloat(boardStyle.rowGap) || columnGap;
    var paddingLeft = parseFloat(boardStyle.paddingLeft) || 0, paddingRight = parseFloat(boardStyle.paddingRight) || 0;
    var paddingTop = parseFloat(boardStyle.paddingTop) || 0;
    var innerWidth = board.clientWidth - paddingLeft - paddingRight;
    var trackWidth = (innerWidth - columnGap * Math.max(0, trackCount - 1)) / trackCount;
    var rowHeight = parseFloat(boardStyle.gridAutoRows) || 100;
    var contentLeft = boardRect.left + board.clientLeft + paddingLeft, contentTop = boardRect.top + board.clientTop + paddingTop;
    return {
      col:Math.max(0, Math.min(trackCount - 1, Math.round((cardRect.left - contentLeft) / Math.max(1, trackWidth + columnGap)))),
      row:Math.max(0, Math.round((cardRect.top - contentTop) / Math.max(1, rowHeight + rowGap)))
    };
  }
  function commitOrder(originalOrder, movedId, source, cardElement) {
    var visibleOrder = currentOrder();
    if (ordersEqual(originalOrder, visibleOrder)) return false;
    var fullOrder = fullRoomOrder(visibleOrder);
    var settledPosition = settledGridPosition(cardElement || $('.pm7u-card[data-widget="' + movedId + '"]', board));
    persistOrder(fullOrder);
    command('cmd.widget.move', { page:'usage', instance_id:movedId, col:settledPosition.col, row:settledPosition.row }, { persisted:true, room:state.room, visual_order:fullOrder, source:source });
    usageEvent('view.usage.widget_moved', { widget_id:movedId, room:state.room, order:fullOrder, settled_position:settledPosition, source:source });
    return true;
  }
  function finishKeyboardDrag(handle, cardElement, shouldCommit, restoreFocus) {
    var move = handle._pm7KeyboardMove;
    if (!move) return false;
    handle._pm7KeyboardMove = null;
    if (handle._pm7KeyboardBlur) handle.removeEventListener('blur', handle._pm7KeyboardBlur);
    if (handle._pm7KeyboardDocumentKeydown) document.removeEventListener('keydown', handle._pm7KeyboardDocumentKeydown, true);
    if (handle._pm7KeyboardBlurTimer) clearTimeout(handle._pm7KeyboardBlurTimer);
    handle._pm7KeyboardBlur = null;
    handle._pm7KeyboardDocumentKeydown = null; handle._pm7KeyboardBlurTimer = null;
    if (!shouldCommit) { restoreOrder(move.original); settleUsageCardAnimations(); }
    handle.setAttribute('aria-grabbed', 'false'); cardElement.classList.remove('is-keyboard-picked');
    var changed = shouldCommit ? commitOrder(move.original, cardElement.getAttribute('data-widget'), 'keyboard', cardElement) : false;
    opOff(); if (restoreFocus) handle.focus(); return changed;
  }
  function startKeyboardDrag(event, cardElement, handle) {
    var key = event.key;
    if (!handle._pm7KeyboardMove) {
      if (key !== 'Enter' && key !== ' ') return;
      event.preventDefault();
      handle._pm7KeyboardMove = { original:currentOrder() };
      handle._pm7KeyboardDocumentKeydown = function (sessionEvent) {
        if (!handle._pm7KeyboardMove) return;
        sessionEvent.stopImmediatePropagation(); startKeyboardDrag(sessionEvent, cardElement, handle);
      };
      handle._pm7KeyboardBlur = function () {
        if (handle._pm7KeyboardBlurTimer) clearTimeout(handle._pm7KeyboardBlurTimer);
        handle._pm7KeyboardBlurTimer = setTimeout(function () {
          if (handle._pm7KeyboardMove && document.activeElement !== handle) finishKeyboardDrag(handle, cardElement, false, false);
        }, 0);
      };
      handle.addEventListener('blur', handle._pm7KeyboardBlur);
      document.addEventListener('keydown', handle._pm7KeyboardDocumentKeydown, true);
      opOn(); handle.setAttribute('aria-grabbed', 'true'); cardElement.classList.add('is-keyboard-picked');
      return;
    }
    if (key === 'Escape') { event.preventDefault(); finishKeyboardDrag(handle, cardElement, false, true); return; }
    if (key === 'Enter' || key === ' ') { event.preventDefault(); finishKeyboardDrag(handle, cardElement, true, true); return; }
    if (key !== 'ArrowLeft' && key !== 'ArrowUp' && key !== 'ArrowRight' && key !== 'ArrowDown') return;
    event.preventDefault();
    var originRect = cardElement.getBoundingClientRect(), originX = originRect.left + originRect.width / 2, originY = originRect.top + originRect.height / 2;
    var target = null, bestScore = Infinity;
    $$('.pm7u-card', board).forEach(function (candidate) {
      if (candidate === cardElement) return;
      var rect = candidate.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      var primary = key === 'ArrowLeft' ? originX - x : key === 'ArrowRight' ? x - originX : key === 'ArrowUp' ? originY - y : y - originY;
      if (primary <= 4) return;
      var cross = key === 'ArrowLeft' || key === 'ArrowRight' ? Math.abs(y - originY) : Math.abs(x - originX);
      var score = primary + cross * 1.75;
      if (score < bestScore) { bestScore = score; target = candidate; }
    });
    if (target) {
      var before = flipBefore();
      if (key === 'ArrowLeft' || key === 'ArrowUp') board.insertBefore(cardElement, target);
      else board.insertBefore(cardElement, target.nextElementSibling);
      flipAfter(before);
    }
    queueMicrotask(function () { if (handle._pm7KeyboardMove) handle.focus({ preventScroll:true }); });
  }
  function startDrag(event, cardElement) {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation(); closePops();
    var handle = event.currentTarget || event.target, pointerId = event.pointerId;
    var originalOrder = currentOrder(), movedId = cardElement.getAttribute('data-widget');
    var rect = cardElement.getBoundingClientRect(), offsetX = event.clientX - rect.left, offsetY = event.clientY - rect.top;
    var ghost = cardElement.cloneNode(true);
    ghost.classList.add('pm7u-ghost'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    ghost.querySelectorAll('button,[href],input,select,textarea,[tabindex]').forEach(function (node) { node.setAttribute('tabindex', '-1'); });
    ghost.style.width = rect.width + 'px'; ghost.style.height = rect.height + 'px'; ghost.style.left = rect.left + 'px'; ghost.style.top = rect.top + 'px';
    var placeholder = document.createElement('div');
    placeholder.className = 'pm7u-reorder-placeholder'; placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.setProperty('--pm7-placeholder-cols', cardElement.getAttribute('data-cols') || 3);
    placeholder.style.setProperty('--pm7-placeholder-rows', cardElement.getAttribute('data-rows') || 3);
    board.insertBefore(placeholder, cardElement); cardElement.classList.add('is-reorder-source');
    document.body.appendChild(ghost); opOn(); handle.setAttribute('aria-grabbed', 'true');
    var finished = false, validDrop = true, lastPlacement = 'source';
    var lastPointerX = event.clientX, lastPointerY = event.clientY, scrollFrame = 0;
    function peerElements() { return $$('.pm7u-card:not(.is-reorder-source)', board); }
    function snapshotPeers() {
      var positions = {};
      peerElements().forEach(function (peer) { positions[peer.getAttribute('data-widget')] = peer.getBoundingClientRect(); });
      return positions;
    }
    function clearPeerMotion(peer) {
      if (peer._pm7ReorderFrame) cancelAnimationFrame(peer._pm7ReorderFrame);
      if (peer._pm7ReorderTimer) clearTimeout(peer._pm7ReorderTimer);
      peer._pm7ReorderFrame = null; peer._pm7ReorderTimer = null;
      peer.style.removeProperty('transition'); peer.style.setProperty('animation', 'none', 'important'); peer.style.removeProperty('transform');
    }
    function animatePeers(before) {
      var moving = [];
      peerElements().forEach(function (peer) {
        var first = before[peer.getAttribute('data-widget')], last = peer.getBoundingClientRect();
        if (!first) return;
        var x = first.left - last.left, y = first.top - last.top;
        if (Math.abs(x) < .5 && Math.abs(y) < .5) return;
        peer.style.setProperty('transition', 'none', 'important');
        peer.style.setProperty('animation', 'none', 'important');
        peer.style.setProperty('transform', 'translate3d(' + x + 'px,' + y + 'px,0)', 'important');
        moving.push(peer);
      });
      if (!moving.length) return;
      void board.offsetWidth;
      moving.forEach(function (peer) {
        peer._pm7ReorderFrame = requestAnimationFrame(function () {
          peer._pm7ReorderFrame = null;
          if (finished || !peer.isConnected) return;
          peer.style.setProperty('transition', 'transform 190ms cubic-bezier(.2,.8,.2,1)', 'important');
          peer.style.removeProperty('transform');
          peer._pm7ReorderTimer = setTimeout(function () {
            peer._pm7ReorderTimer = null;
            if (!finished) { peer.style.removeProperty('transition'); peer.style.setProperty('animation', 'none', 'important'); peer.style.removeProperty('transform'); }
          }, 220);
        });
      });
    }
    function releasePeers() {
      peerElements().forEach(clearPeerMotion);
    }
    function placePlaceholder(target, insertBefore) {
      var placement = target ? target.getAttribute('data-widget') + ':' + (insertBefore ? 'before' : 'after') : 'end';
      if (placement === lastPlacement) return;
      var before = snapshotPeers();
      peerElements().forEach(clearPeerMotion);
      if (!target || target.parentElement !== board) board.appendChild(placeholder);
      else board.insertBefore(placeholder, insertBefore ? target : target.nextSibling);
      lastPlacement = placement;
      animatePeers(before);
    }
    function visibleScrollRect() {
      var rect = boardScroll.getBoundingClientRect();
      var footer = document.querySelector('.pm7-statusbar'), footerRect = footer ? footer.getBoundingClientRect() : null;
      var bottom = footerRect && footerRect.top > rect.top ? Math.min(rect.bottom, footerRect.top) : rect.bottom;
      return { left:rect.left, right:rect.right, top:rect.top, bottom:Math.max(rect.top + 8, bottom) };
    }
    function dragHit(clientX, clientY) {
      var rect = visibleScrollRect();
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top - 40 || clientY > innerHeight + 40) return null;
      var sampleX = Math.max(rect.left + 2, Math.min(rect.right - 2, clientX));
      var sampleY = Math.max(rect.top + 2, Math.min(rect.bottom - 2, clientY));
      return document.elementFromPoint(sampleX, sampleY);
    }
    function placeFromPointer(clientX, clientY) {
      var hit = dragHit(clientX, clientY);
      validDrop = !!(hit && board.contains(hit));
      if (!validDrop) return;
      var target = hit.closest ? hit.closest('.pm7u-card:not(.is-reorder-source)') : null;
      if (!target || target.parentElement !== board) return;
      var targetRect = target.getBoundingClientRect();
      var insertBefore = clientY < targetRect.top + targetRect.height / 2 || (Math.abs(clientY - (targetRect.top + targetRect.height / 2)) < targetRect.height * .22 && clientX < targetRect.left + targetRect.width / 2);
      placePlaceholder(target, insertBefore);
    }
    function edgeScrollVelocity() {
      var rect = visibleScrollRect(), edge = Math.min(78, Math.max(54, (rect.bottom - rect.top) * .18));
      if (lastPointerX < rect.left || lastPointerX > rect.right) return 0;
      if (lastPointerY < rect.top + edge && boardScroll.scrollTop > 0) {
        var upStrength = Math.max(0, Math.min(1, (rect.top + edge - lastPointerY) / edge));
        return -Math.ceil(3 + upStrength * 9);
      }
      if (lastPointerY > rect.bottom - edge && boardScroll.scrollTop < boardScroll.scrollHeight - boardScroll.clientHeight) {
        var downStrength = Math.max(0, Math.min(1, (lastPointerY - (rect.bottom - edge)) / edge));
        return Math.ceil(3 + downStrength * 9);
      }
      return 0;
    }
    function autoScrollTick() {
      scrollFrame = 0;
      if (finished) return;
      var velocity = edgeScrollVelocity();
      if (!velocity) return;
      var beforeScroll = boardScroll.scrollTop;
      boardScroll.scrollTop += velocity;
      if (boardScroll.scrollTop !== beforeScroll) {
        placeFromPointer(lastPointerX, lastPointerY);
        scrollFrame = requestAnimationFrame(autoScrollTick);
      }
    }
    function ensureAutoScroll() {
      if (!scrollFrame && edgeScrollVelocity()) scrollFrame = requestAnimationFrame(autoScrollTick);
    }
    function pointInsideBoard(pointerEvent) {
      var hit = dragHit(pointerEvent.clientX, pointerEvent.clientY);
      return !!(hit && board.contains(hit));
    }
    function move(moveEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      moveEvent.preventDefault();
      lastPointerX = moveEvent.clientX; lastPointerY = moveEvent.clientY;
      ghost.style.left = (moveEvent.clientX - offsetX) + 'px'; ghost.style.top = (moveEvent.clientY - offsetY) + 'px';
      placeFromPointer(moveEvent.clientX, moveEvent.clientY); ensureAutoScroll();
    }
    function cleanup() {
      if (scrollFrame) cancelAnimationFrame(scrollFrame); scrollFrame = 0;
      document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', commit, true);
      document.removeEventListener('pointercancel', cancel, true); document.removeEventListener('keydown', keydown, true);
      window.removeEventListener('blur', blur); handle.removeEventListener('lostpointercapture', lostCapture);
      try { if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId); } catch (error) {}
      if (ghost.parentNode) ghost.remove(); opOff(); handle.setAttribute('aria-grabbed', 'false');
    }
    function finish(shouldCommit, restoreFocus) {
      if (finished) return; finished = true;
      if (!shouldCommit && placeholder.parentNode) board.insertBefore(placeholder, cardElement);
      if (placeholder.parentNode) placeholder.parentNode.replaceChild(cardElement, placeholder);
      cardElement.classList.remove('is-reorder-source');
      if (!shouldCommit) restoreOrder(originalOrder);
      releasePeers();
      cleanup();
      if (shouldCommit) commitOrder(originalOrder, movedId, 'pointer', cardElement);
      if (restoreFocus !== false) handle.focus();
    }
    function commit(upEvent) {
      if (upEvent.pointerId !== pointerId) return;
      upEvent.preventDefault(); move(upEvent); finish(validDrop && pointInsideBoard(upEvent), true);
    }
    function cancel(cancelEvent) { if (cancelEvent && cancelEvent.pointerId != null && cancelEvent.pointerId !== pointerId) return; finish(false, true); }
    function keydown(keyEvent) { if (keyEvent.key !== 'Escape') return; keyEvent.preventDefault(); finish(false, true); }
    function blur() { finish(false, false); }
    function lostCapture(captureEvent) { if (captureEvent.pointerId === pointerId) finish(false, true); }
    handle.addEventListener('lostpointercapture', lostCapture);
    try { handle.setPointerCapture(pointerId); } catch (error) {}
    document.addEventListener('pointermove', move, { capture:true, passive:false });
    document.addEventListener('pointerup', commit, true); document.addEventListener('pointercancel', cancel, true); document.addEventListener('keydown', keydown, true); window.addEventListener('blur', blur);
  }

  function inspectorEvent'''
    doc = _sub_once(doc, reorder_pattern, reorder_new, need, "transactional reorder", re.S)

    inspector_event_pattern = r"  function inspectorEvent\(index\) \{.*?\n  \}\n  function inspectorCard"
    inspector_event_new = r'''  function inspectorEvent(attemptId) {
    var attempt = projectedAttempts().filter(function (item) { return item.attempt_id === attemptId; })[0];
    if (!attempt && Number.isInteger(attemptId)) attempt = projectedAttempts()[attemptId];
    if (!attempt) return '<div class="pm7u-inspsec"><h3>Attempt unavailable</h3><p>The selected identity is not present in the current scope and range.</p></div>';
    return '<div class="pm7u-inspsec"><h3>Attempt</h3><div class="pm7u-inspgrid"><span>Timestamp</span><b>' + esc(attempt.occurred_at) + '</b><span>Usage event ref</span><b>' + esc(attempt.usage_event_ref) + '</b><span>Usage record ID</span><b>' + esc(attempt.usage_record_id) + '</b><span>Attempt ID</span><b>' + esc(attempt.attempt_id) + '</b><span>Provider attempt ref</span><b>' + esc(attempt.provider_attempt_ref) + '</b><span>Provider / installation</span><b>' + esc(attempt.provider_id + ' / ' + attempt.installation_id) + '</b><span>Account / connection</span><b>' + esc(attempt.account_id + ' / ' + attempt.connection_id) + '</b><span>Product / model</span><b>' + esc(attempt.product_id + ' / ' + attempt.model_id) + '</b></div></div><div class="pm7u-inspsec"><h3>Route and settlement</h3><div class="pm7u-inspgrid"><span>Requested route</span><b>' + esc(attempt.requested_route_id) + '</b><span>Effective route</span><b>' + esc(attempt.effective_route_id) + '</b><span>Billing basis</span><b>' + esc(attempt.billing_basis) + '</b><span>Entitlement</span><b>' + esc(attempt.entitlement_class) + '</b><span>Settlement status</span><b>' + esc(attempt.settlement_status) + '</b></div></div>';
  }
  function localCardDetail(id) {
    var provider = DATA.providers.filter(function (item) { return item.id === id; })[0];
    if (provider) return { title:'Provider details', payload:{ detail_kind:'provider', provider_id:provider.provider_id } };
    var accountId = String(id).indexOf('account-') === 0 ? String(id).slice(8) : '';
    var account = DATA.accounts.filter(function (item) { return item.id === accountId; })[0];
    if (account) return { title:'Account details', payload:{ detail_kind:'account', provider_id:account.provider_id, account_id:account.account_id, connection_id:account.connection_id } };
    var fixture = null, match = /^alert-([0-9]+)$/.exec(String(id));
    if (match) fixture = DATA.alerts[Number(match[1])];
    match = /^cache-([0-9]+)$/.exec(String(id));
    if (match) fixture = DATA.cache[Number(match[1])];
    var payload = { detail_kind:'panel', panel_id:String(id) };
    if (fixture && fixture.provider_id) payload.provider_id = fixture.provider_id;
    return { title:'Panel details', payload:payload };
  }
  function inspectorCard'''
    doc = _sub_once(doc, inspector_event_pattern, inspector_event_new, need, "attempt inspector", re.S)

    inspector_card_pattern = r"  function inspectorCard\(id\) \{.*?\n  \}\n  function openInspector"
    inspector_card_new = r'''  function inspectorCard(id) {
    var provider = DATA.providers.filter(function (item) { return item.id === id; })[0];
    if (provider) {
      var metrics = providerMetrics(provider);
      var attempts = projectedAttempts().filter(function (attempt) { return attempt.provider_id === provider.id; });
      return '<div class="pm7u-inspsec"><h3>' + esc(provider.name) + '</h3><div class="pm7u-inspgrid"><span>Provider / installation</span><b>' + esc(provider.provider_id + ' / ' + provider.installation_id) + '</b><span>Account IDs</span><b>' + esc(provider.account_ids.join(', ')) + '</b><span>Connection IDs</span><b>' + esc(provider.connection_ids.join(', ')) + '</b><span>Product / model</span><b>' + esc(provider.product_id + ' / ' + provider.model_id) + '</b><span>Requested route</span><b>' + esc(provider.requested_route_id) + '</b><span>Effective route</span><b>' + esc(provider.effective_route_id) + '</b><span>Attempt IDs</span><b>' + esc(attempts.map(function (attempt) { return attempt.attempt_id; }).join(', ') || 'none in selected window') + '</b><span>Attempts / tokens</span><b>' + metrics.attempts + ' / ' + tok(metrics.tokens) + '</b><span>Billing basis</span><b>' + esc(provider.billing_basis) + '</b><span>Entitlement</span><b>' + esc(provider.entitlement_class) + '</b><span>Settlement status</span><b>' + esc(metrics.settlement_summary) + '</b><span>Allowance authority</span><b>' + esc(metrics.allowance_authority + ' · ' + metrics.allowance_freshness) + '</b></div></div>';
    }
    var accountId = String(id).indexOf('account-') === 0 ? String(id).slice(8) : '';
    var account = DATA.accounts.filter(function (item) { return item.id === accountId; })[0];
    if (account) {
      var accountAttempts = projectedAttempts().filter(function (attempt) { return attempt.account_id === account.account_id; });
      var setupIdentity = account.setup_required ? '<span>Attempt / operation / continuation</span><b>' + esc(account.attempt_id + ' / ' + account.operation_id + ' / ' + account.continuation_id) + '</b>' : '<span>Attempt IDs</span><b>' + esc(accountAttempts.map(function (attempt) { return attempt.attempt_id; }).join(', ') || 'none in selected window') + '</b>';
      return '<div class="pm7u-inspsec"><h3>' + esc(account.name) + '</h3><div class="pm7u-inspgrid"><span>State</span><b>' + esc(account.status) + '</b><span>Host/Environment</span><b>' + esc(account.host + ' / ' + account.environment) + '</b><span>Provider / installation</span><b>' + esc(account.provider_id + ' / ' + account.installation_id) + '</b><span>Account / connection</span><b>' + esc(account.account_id + ' / ' + account.connection_id) + '</b><span>Product / model</span><b>' + esc(account.product_id + ' / ' + account.model_id) + '</b><span>Requested route</span><b>' + esc(account.requested_route_id) + '</b><span>Effective route</span><b>' + esc(account.effective_route_id) + '</b>' + setupIdentity + '<span>Billing basis</span><b>' + esc(account.billing_basis) + '</b><span>Entitlement</span><b>' + esc(account.entitlement_class) + '</b><span>Settlement status</span><b>' + esc(account.setup_required ? account.settlement_status : settlementSummary(accountAttempts)) + '</b></div></div>';
    }
    return '<div class="pm7u-inspsec"><h3>Panel reading</h3><div class="pm7u-inspgrid"><span>Panel</span><b>' + esc(id) + '</b><span>Scope</span><b>' + esc(state.scope) + '</b><span>Range</span><b>' + esc(state.range) + '</b><span>Authority</span><b>provider reported or labeled PM estimate</b></div></div>';
  }
  function openInspector'''
    doc = _sub_once(doc, inspector_card_pattern, inspector_card_new, need, "identity inspector", re.S)

    # Keep Assistant compaction local-event silent and refresh any already-open
    # drawer without changing its tab, title, node, or open state.
    doc = _replace_once(doc, "drawer.innerHTML = contextDrawerHTML(title.trim()); drawer.classList.add('open');", "CONTEXT_DRAWER_TITLES.set(drawer, title.trim()); drawer.innerHTML = contextDrawerHTML(title.trim()); drawer.classList.add('open');", need, "context drawer title identity")
    refresh_drawers = r'''  var CONTEXT_DRAWER_TITLES = new WeakMap();
  function contextFocusToken(root) {
    var active = document.activeElement;
    if (!active || !root.contains(active)) return null;
    if (active.hasAttribute('data-pm7ctx-close')) return 'close';
    if (active.hasAttribute('data-pm7ctx-tab')) return 'tab:' + active.getAttribute('data-pm7ctx-tab');
    if (active.classList.contains('chm-compact-btn')) return 'compact';
    if (active.classList.contains('chm-details-link')) return 'details';
    return 'root';
  }
  function restoreContextFocus(root, token) {
    if (!token) return;
    var target = token === 'close' ? $('[data-pm7ctx-close]', root) : token.indexOf('tab:') === 0 ? $('[data-pm7ctx-tab="' + token.slice(4) + '"]', root) : token === 'compact' ? $('.chm-compact-btn', root) : token === 'details' ? $('.chm-details-link', root) : null;
    if (target && target.disabled) target = $('.chm-details-link', root);
    if (!target) target = $('[data-pm7ctx-tab].active', root) || $('[data-pm7ctx-close]', root) || root.closest('.context-usage');
    if (target && typeof target.focus === 'function') target.focus();
  }
  function syncUsageContextProjection() {
    var context = DATA.context;
    context.used = CTX.used; context.limit = CTX.limit; context.pct = CTX.pct;
    context.input = CTX.input; context.output = CTX.output; context.cache = CTX.cache;
    context.reclaim = CTX.compact ? 0 : context.reclaim;
    context.segments = CTX.segments.slice(); context.labels = CTX.labels.slice();
    context.mutable = Math.max(0, context.used - context.pinned);
    context.compacted = !!CTX.compact;
    context.last_compact = context.compacted ? 'just now' : context.last_compact;
    context.last_maintenance = context.compacted ? 'just now' : context.last_maintenance;
    if (state.room === 'context') render();
  }
  function refreshContextModules() {
    $$('.context-usage').forEach(function (element) {
      var module = $('.context-hover-module', element), token = module ? contextFocusToken(module) : null;
      if (module) module.innerHTML = ctxPopupHTML();
      var arc = $('circle:last-child', element); if (arc) arc.style.strokeDashoffset = (62.8 * (1 - CTX.pct / 100)).toFixed(2);
      element.setAttribute('aria-label', 'Context usage, ' + CTX.pct + '% used');
      if (module) restoreContextFocus(module, token);
    });
  }
  function refreshOpenContextDrawers() {
    $$('.pm7ctx-drawer.open').forEach(function (drawer) {
      var tab = drawer.getAttribute('data-tab') || 'curated';
      var title = CONTEXT_DRAWER_TITLES.get(drawer) || 'Current thread';
      var focusToken = contextFocusToken(drawer);
      var body = $('.pm7ctx-dbody', drawer), scrollTop = body ? body.scrollTop : 0;
      drawer.innerHTML = contextDrawerHTML(title); drawer.setAttribute('data-tab', tab);
      $$('[data-pm7ctx-tab]', drawer).forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-pm7ctx-tab') === tab); });
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
      body = $('.pm7ctx-dbody', drawer); if (body) body.scrollTop = scrollTop;
      restoreContextFocus(drawer, focusToken);
    });
  }
'''
    doc = _replace_once(doc, "  function compactContext(trigger) {", refresh_drawers + "  function compactContext(trigger) {", need, "open drawer refresh helper")
    compact_command_old = "    command('cmd.chat.compact_context', { thread_id: 'thread-main' }, { requested: true, before_tokens: CTX.used, effective_window: CTX.limit });"
    compact_command_new = "    var compactionReceipt = command('cmd.chat.compact_context', { thread_id: 'thread-main' }, { requested: true, before_tokens: CTX.used, effective_window: CTX.limit, projection_state: 'started' }, { defer_receipt: true });\n    CTX.compaction_receipt = compactionReceipt;"
    doc = _replace_once(doc, compact_command_old, compact_command_new, need, "receipt-linked compaction request")
    doc = _replace_once(doc, "    usageEvent('context.compaction.started', { thread_id: 'thread-main', before_tokens: CTX.used, effective_window: CTX.limit });\n", "", need, "remove compaction start event lookalike")
    context_modules_old = "      $$('.context-usage').forEach(function (element) { var module = $('.context-hover-module', element); if (module) module.innerHTML = ctxPopupHTML(); var arc = $('circle:last-child', element); if (arc) arc.style.strokeDashoffset = (62.8 * (1 - CTX.pct / 100)).toFixed(2); element.setAttribute('aria-label', 'Context usage, ' + CTX.pct + '% used'); });"
    doc = _replace_once(doc, context_modules_old, "      refreshContextModules();", need, "compaction module focus preservation")
    doc = _replace_once(
        doc,
        "CTX.used = 23580; CTX.input = 19940; CTX.pct = Math.round(CTX.used / CTX.limit * 100); CTX.segments = [47, 24, 11, 9, 9];",
        "CTX.used = 23580; CTX.input = CTX.used - CTX.output; CTX.pct = Math.round(CTX.used / CTX.limit * 100); CTX.segments = [47, 24, 11, 9, 9];",
        need,
        "coherent terminal Context token projection",
    )
    compact_complete_new = "syncUsageContextProjection();\n      refreshOpenContextDrawers();\n      if (CTX.compaction_receipt) completeCommandReceipt(CTX.compaction_receipt, { projection_state: 'completed', after_tokens: CTX.used, reclaimed_tokens: 18600 });"
    doc = _replace_once(doc, "usageEvent('context.compaction.completed', { after_tokens: CTX.used, effective_window: CTX.limit, reclaimed_tokens: 18600 });", compact_complete_new, need, "receipt-linked compaction completion refresh")

    bottom_scope_old = "  var scopeNames = { all: ['All current usage', 'every configured route'], work: ['Work accounts', 'company and team credentials'], personal: ['Personal accounts', 'personal plans and keys'], 'provider:claude': ['Claude only', 'every Claude connection'], 'provider:codex': ['Codex only', 'every OpenAI connection'] };\n  if (scopeNames[state.scope]) { $('#pm7uScopeLabel').textContent = scopeNames[state.scope][0]; $('#pm7uScopeMeta').textContent = scopeNames[state.scope][1]; }"
    bottom_scope_new = r'''  function finalizeUsageWorkspace() {
    var savedRoom = state.room, savedScope = state.scope, inventory = {};
    state.scope = 'all';
    Object.keys(ROOM).forEach(function (room) {
      state.room = room; inventory[room] = {};
      roomWidgets(room).forEach(function (item) {
        inventory[room][item.id] = { sizes:curatedSizes(item).map(function (size) { return size[0] + 'x' + size[1]; }) };
      });
    });
    state.room = savedRoom; state.scope = savedScope; USAGE_RUNTIME_INVENTORY = inventory;
    var before = canonicalUsageJson(state), finalized = sanitizeUsageState(state);
    if (before !== canonicalUsageJson(finalized)) USAGE_STALE_VALUE_COUNT += 1;
    if (shouldImportLegacy) {
      var legacyAssessment = legacyImportAssessment(sanitizeUsageState(legacyCandidate.state));
      USAGE_WORKSPACE.legacy_import = {
        source:'pm7:usage:v10:*', completed:true, imported:legacyAssessment.accepted > 0,
        accepted_values:legacyAssessment.accepted, rejected_values:legacyAssessment.rejected,
        partial_values:legacyAssessment.partial, imported_at:legacyAssessment.accepted > 0 ? new Date().toISOString() : null
      };
      USAGE_MIGRATION_RECEIPT.legacy_values_imported = legacyAssessment.accepted;
      USAGE_MIGRATION_RECEIPT.legacy_values_rejected = legacyAssessment.rejected;
      USAGE_MIGRATION_RECEIPT.legacy_partial_values_preserved = legacyAssessment.partial;
      USAGE_MIGRATION_RECEIPT.imported_legacy_once = legacyAssessment.accepted > 0;
    }
    WORKSPACE_FIELDS.forEach(function (field) { state[field] = finalized[field]; });
    USAGE_WORKSPACE.state = state;
    USAGE_MIGRATION_RECEIPT.stale_value_count = USAGE_STALE_VALUE_COUNT;
    USAGE_MIGRATION_RECEIPT.stale_values_evicted = USAGE_STALE_VALUE_COUNT > 0;
    USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);
  }
  finalizeUsageWorkspace();
  var initialScopeName = scopeDisplay(state.scope);
  $('#pm7uScopeLabel').textContent = initialScopeName[0]; $('#pm7uScopeMeta').textContent = initialScopeName[1];'''
    doc = _replace_once(doc, bottom_scope_old, bottom_scope_new, need, "initial scope label")

    usage_api_pattern = r"^  window\.PM7_USAGE = \{.*\};$"
    usage_api_new = r'''  function usageExportJson(kind) {
    var payload = kind === 'ledger' ? projectedAttempts() : { schema_id:'pm7.usage.prototype.snapshot.v1', state:state, attempts:projectedAttempts(), workspace:USAGE_WORKSPACE };
    try {
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
      var link = document.createElement('a'); link.href = URL.createObjectURL(blob);
      link.download = kind === 'ledger' ? 'puppet-master-usage-ledger.json' : 'puppet-master-usage.json';
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { URL.revokeObjectURL(link.href); }, 0); return true;
    } catch (error) { return false; }
  }
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
    DATA.attempts.unshift(attempt); if (state.room === 'ledger') render(); return true;
  }
  window.PM7_USAGE = {
    render:render, syncNavInk:syncNavInk, state:state, data:DATA, rooms:ROOM, details:DETAIL,
    roomWidgets:roomWidgets, visibleWidgets:visibleWidgets, widgetById:widgetById,
    sizePresets:sizePresets, setLayout:setLayout, projectedAttempts:projectedAttempts, projectionSnapshot:projectionSnapshot,
    migration_receipt:USAGE_MIGRATION_RECEIPT, workspace_envelope:USAGE_WORKSPACE,
    clearLayout:function () { state.layout={}; state.order={}; state.hidden={}; STORE.set(KEY+'layout',state.layout); STORE.set(KEY+'order',state.order); STORE.set(KEY+'hidden',state.hidden); render(); },
    setRoomDetail:function (room,detail) { if (ROOM[room]) state.room=room; if (DETAIL[detail]) state.detail=detail; render(); },
    showOnly:function (room,detail,id,cols,rows) { if (ROOM[room]) state.room=room; if (DETAIL[detail]) state.detail=detail; state.hidden={}; roomWidgets(state.room).forEach(function (item) { state.hidden[state.room+':'+item.id]=item.id!==id; }); state.layout={}; var item=widgetById(id); if (item) state.layout[state.room+':'+id]=clampLayout(item,cols,rows); render(); },
    openInspector:openInspector,
    refresh:function () { command('cmd.usage.refresh',{room:state.room,range:state.range,scope:state.scope},{requested:true}); render(); usageEvent('view.usage.projection_refreshed',{room:state.room,range:state.range}); toast('Usage refreshed just now'); },
    spinRefresh:function () { this.refresh(); }, exportJson:usageExportJson,
    rerender:function () { render(); }, injectIcons:function () { $$('[data-icon]',app).forEach(function (element) { element.innerHTML=SVG[element.getAttribute('data-icon')]||SVG.grid; }); },
    appendUsageAttempt:appendUsageAttempt, appendLedger:appendUsageAttempt,
    setCooldown:function (seconds) { this.cooldown_seconds=Math.max(0,Number(seconds)||0); }, pm7FlushCooldown:function () { return this.cooldown_seconds||0; },
    densityFor:densityFor, shapeFor:shapeFor, layoutFor:layoutFor, command:command,
    command_log:COMMANDS, receipt_log:RECEIPTS, event_log:EVENTS, view_action_log:VIEW_ACTIONS,
    wiring:{ command_event:'pm:command-dispatch', receipt_event:'pm:dispatch-receipt', concept_event:'pm:usage-event', local_view_action:'pm:usage-view-action', prototype_store:WORKSPACE_KEY, legacy_import:'pm7:usage:v10:* once', canonical_layout_owner:'widget_layout namespace via cmd.widget.*', persisted_domain_event_for_widget_layout:null, workspace_layout_changed_scope:'Home workspace surface mutations only' }
  };'''
    doc = _sub_once(doc, usage_api_pattern, usage_api_new, need, "PM7 Usage API", re.M)

    # The semantic settings deep link is an existing Settings action.  Expose
    # only the already-authored bloom opener to the Usage CTA.
    doc = _replace_once(doc, "\n  function closeBloom() {", "\n  window.PM7_SETTINGS_OPEN_BLOOM = openBloom;\n\n  function closeBloom() {", need, "Settings bloom exposure")

    # Repair the compatibility bridge without registering actions or engine
    # subscriptions more than once.  PM6 remains fallback-only.
    bridge_start = doc.find("<script id=\"pm6-js-usage\">")
    bridge_end = doc.find("</script>", bridge_start)
    need(bridge_start >= 0 and bridge_end > bridge_start, "T34 Usage bridge slice missing")
    bridge = doc[bridge_start:bridge_end]
    bridge_boot_old = "  function U() { return window.PM6_USAGE || null; }\n  function PD() { return window.PM_DEMO || null; }\n\n  function init() {"
    bridge_boot_new = r'''  function U() { return window.PM7_USAGE || window.PM6_USAGE || null; }
  function PD() { return window.PM_DEMO || null; }
  var BRIDGE_STATE_KEY = '__PM7_USAGE_BRIDGE_STATE_V1__';
  var bridgeState = window[BRIDGE_STATE_KEY] || {
    initialized:false, side_effects_started:false, actions:{}, subscriptions:{},
    stats:{ init_count:0, init_attempt_count:0, action_registration_count:0, subscription_count:0, preferred_surface:null, failure_count:0, rejected_attempt_count:0, failures:[] }
  };
  window[BRIDGE_STATE_KEY] = bridgeState;
  var bridgeStats = bridgeState.stats;
  window.PM7_USAGE_BRIDGE_STATS = bridgeStats;
  function recordBridgeFailure(kind, name, error) {
    bridgeStats.failure_count += 1;
    bridgeStats.failures.push({ kind:kind, name:name, message:String(error && error.message || error) });
  }

  function init() {
    if (bridgeState.initialized) return true;
    if (bridgeState.side_effects_started) return false;'''
    bridge = _replace_once(bridge, bridge_boot_old, bridge_boot_new, need, "global bridge preference and guard")
    bridge = _replace_once(bridge, "    if (!pd || !pd.actions || !pd.actions.register || !u) return false;", "    if (!pd || !pd.actions || !pd.actions.register || typeof pd.on !== 'function' || !u) return false;", need, "bridge dependency preflight")
    bridge_reg_new = r'''    bridgeState.side_effects_started = true; bridgeStats.init_attempt_count += 1;
    bridgeStats.preferred_surface = window.PM7_USAGE ? 'PM7_USAGE' : 'PM6_USAGE';
    var reg = function (name, handler) {
      if (bridgeState.actions[name]) return bridgeState.actions[name] === 'registered';
      bridgeState.actions[name] = 'attempting';
      try { pd.actions.register(name, handler); bridgeState.actions[name] = 'registered'; bridgeStats.action_registration_count += 1; return true; }
      catch (error) { bridgeState.actions[name] = 'failed'; recordBridgeFailure('action', name, error); return false; }
    };
    var sub = function (name, handler) {
      if (bridgeState.subscriptions[name]) return bridgeState.subscriptions[name] === 'registered';
      bridgeState.subscriptions[name] = 'attempting';
      try { pd.on(name, handler); bridgeState.subscriptions[name] = 'registered'; bridgeStats.subscription_count += 1; return true; }
      catch (error) { bridgeState.subscriptions[name] = 'failed'; recordBridgeFailure('subscription', name, error); return false; }
    };'''
    bridge = _replace_once(bridge, "    var reg = pd.actions.register;", bridge_reg_new, need, "idempotent bridge registrations")

    switch_pattern = r"    reg\('usage\.switch_account', function \(ctx\) \{.*?\n    \}\);\n\n    var acked"
    switch_new = r'''    reg('usage.switch_account', function (ctx) {
      var identity = ctx && ctx.arg, d = u.data, target = null;
      (d.accounts || []).forEach(function (account) {
        if (account.id === identity || account.account_id === identity || account.connection_id === identity) target = target || account;
      });
      if (!target) return { toast: 'That stable account identity is not in the demo roster.' };
      if (target.setup_required) return { disabled:true, reason:'provider_setup_required', toast:'Provider setup is required before this account can be selected.' };
      u.active_account_id = target.account_id;
      u.rerender('stable_account_identity'); u.injectIcons();
      return { toast:'Selected ' + target.account_id + ' locally; requested and effective routes remain explicit and unchanged.' };
    });

    var acked'''
    bridge = _sub_once(bridge, switch_pattern, switch_new, need, "stable account bridge action", re.S)

    anomaly_pattern = r"    var allowedOnce = false;\n    reg\('usage\.anomaly_allow', function \(\) \{.*?\n    \}\);"
    anomaly_new = r'''    var allowedOnce = false;
    reg('usage.anomaly_allow', function () {
      if (allowedOnce) return { disabled: true, reason: 'already_done' };
      allowedOnce = true;
      return { toast: 'Allowed once — this local guard action does not fabricate a provider Usage attempt.' };
    });'''
    bridge = _sub_once(bridge, anomaly_pattern, anomaly_new, need, "non-usage guard ledger suppression", re.S)

    map_pattern = r"      function mapEngineRow\(er\) \{.*?\n      \}\n\n      var seen"
    map_new = r'''      function identitySlug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
      function numericFact(value) { if (value == null || value === '') return NaN; var numeric = Number(value); return Number.isFinite(numeric) ? numeric : NaN; }
      function mapEngineRow(er) {
        var platform = String(er.platform || '').trim(), platformSlug = identitySlug(platform);
        var provider = (u.data.providers || []).filter(function (item) { return item.provider_id === er.provider_id || (platform && (item.id === platformSlug || String(item.name).toLowerCase() === platform.toLowerCase())); })[0];
        var providerId = typeof er.provider_id === 'string' && er.provider_id ? er.provider_id : provider ? provider.provider_id : '';
        var occurredAt = typeof er.occurred_at === 'string' && er.occurred_at ? er.occurred_at : typeof er.timestamp === 'string' ? er.timestamp : '';
        var settlement = typeof er.settlementStatus === 'string' ? er.settlementStatus.trim() : '';
        var observedCost = numericFact(er.cost), inputTokens = numericFact(er.tokensIn), outputTokens = numericFact(er.tokensOut), requestCount = numericFact(er.requestCount);
        var planEstimate = numericFact(er.planAllocationEstimate), cacheEstimate = numericFact(er.cacheAvoidedEstimate);
        var requiredIdentities = [er.id, er.usage_event_ref, er.usage_record_id, er.provider_attempt_ref, occurredAt, providerId, er.installation_id, er.account_id, er.connection_id, er.product_id, er.model_id, er.requested_route_id, er.effective_route_id, settlement];
        if (requiredIdentities.some(function (value) { return typeof value !== 'string' || !value.trim(); })) return null;
        if (er.scope !== 'work' && er.scope !== 'personal') return null;
        if (!Number.isFinite(new Date(occurredAt).getTime())) return null;
        if (![observedCost,inputTokens,outputTokens,requestCount,planEstimate,cacheEstimate].every(Number.isFinite)) return null;
        var normalizedSettlement = settlement.toLowerCase().trim();
        var finalSettlement = normalizedSettlement === 'settled' || normalizedSettlement === 'adjusted and settled';
        var settledCharge = finalSettlement && Number.isFinite(observedCost) ? observedCost : Number.isFinite(observedCost) && observedCost === 0 ? 0 : NaN;
        if (!Number.isFinite(settledCharge)) return null;
        return {
          attempt_id:String(er.id), usage_event_ref:er.usage_event_ref, usage_record_id:er.usage_record_id, provider_attempt_ref:er.provider_attempt_ref, occurred_at:occurredAt,
          provider_id:providerId, installation_id:er.installation_id,
          account_id:er.account_id, connection_id:er.connection_id,
          product_id:er.product_id, model_id:er.model_id,
          requested_route_id:er.requested_route_id, effective_route_id:er.effective_route_id,
          scope:er.scope,
          input_tokens:inputTokens, output_tokens:outputTokens, request_count:requestCount,
          charge:settledCharge, plan_allocation_estimate:planEstimate, cache_avoided_estimate:cacheEstimate,
          billing_basis:typeof er.billing_basis === 'string' && er.billing_basis ? er.billing_basis : provider ? provider.billing_basis : 'engine row; catalog enrichment unavailable',
          entitlement_class:typeof er.entitlement_class === 'string' && er.entitlement_class ? er.entitlement_class : provider ? provider.entitlement_class : 'engine row; catalog enrichment unavailable',
          settlement_status:settlement, settlement_authority:'engine UsageRecord',
          source_class:typeof er.source_class === 'string' && er.source_class ? er.source_class : 'provider_reported',
          source_confidence:typeof er.source_confidence === 'string' && er.source_confidence ? er.source_confidence : 'unknown',
          source_authority:typeof er.source_authority === 'string' && er.source_authority ? er.source_authority : 'engine UsageRecord',
          projection_freshness:typeof er.projection_freshness === 'string' && er.projection_freshness ? er.projection_freshness : 'current',
          projection_health:typeof er.projection_health === 'string' && er.projection_health ? er.projection_health : 'healthy',
          charge_authority:Number.isFinite(settledCharge) ? finalSettlement ? 'engine settled charge' : 'explicit zero; settlement not promoted' : 'not accepted without exact settlement and numeric cost',
          plan_allocation_authority:Number.isFinite(planEstimate) ? 'engine explicit estimate' : 'not exposed by engine',
          cache_avoided_authority:Number.isFinite(cacheEstimate) ? 'engine explicit estimate' : 'not exposed by engine',
          observed_unsettled_cost:Number.isFinite(observedCost) && !finalSettlement ? observedCost : null
        };
      }

      var seen'''
    bridge = _sub_once(bridge, map_pattern, map_new, need, "normalized engine attempt mapping", re.S)
    engine_loop_old = "              if (!er || !er.id || seen[er.id]) return;\n              seen[er.id] = true;\n              U().appendLedger(mapEngineRow(er));"
    engine_loop_new = "              if (!er || !er.id) { bridgeStats.rejected_attempt_count += 1; return; }\n              if (seen[er.id]) return;\n              var mapped = mapEngineRow(er);\n              if (!mapped) { bridgeStats.rejected_attempt_count += 1; return; }\n              seen[er.id] = true;\n              if (!U().appendUsageAttempt(mapped)) bridgeStats.rejected_attempt_count += 1;"
    bridge = _replace_once(bridge, engine_loop_old, engine_loop_new, need, "engine attempt preflight and acceptance receipt")
    ambient_quota_old = r'''          /* re-render quotas only when a percentage actually moved (avoids bar flicker) */
          if (Array.isArray(p.quotas)) {
            var sig = p.quotas.map(function (q) { return q.id + ':' + Math.round(q.pct || 0); }).join('|');
            if (sig !== lastQuotaSig) {
              lastQuotaSig = sig;
              U().rerender('quota_summary');
              U().injectIcons();
            }
          }'''
    ambient_quota_new = r'''          /* The PM7 Usage workspace is fixture-record projected; PM_DEMO quota
             ticks do not mutate that projection. Preserve the latest compatibility
             signature for diagnostics, but never remount the board for ambient time. */
          if (Array.isArray(p.quotas)) {
            lastQuotaSig = p.quotas.map(function (q) { return q.id + ':' + Math.round(q.pct || 0); }).join('|');
            bridgeStats.last_quota_signature = lastQuotaSig;
          }'''
    bridge = _replace_once(bridge, ambient_quota_old, ambient_quota_new, need, "ambient quota remount suppression")
    ambient_alert_old = r'''      pd.on('usage.alert', function (p) {
        try {
          if (!U()) return;
          if (p && p.kind === 'account_switch') {
            U().rerender('multi_account');
            U().injectIcons();
          } else {
            U().rerender('alert_thresholds');
            U().injectIcons();
          }
        } catch (e) { try { console.error('[pm6-js-usage] alert', e); } catch (e2) {} }
      });'''
    ambient_alert_new = r'''      pd.on('usage.alert', function (p) {
        try {
          if (!U()) return;
          /* Compatibility alerts do not alter PM7's identity-bound fixture
             records. Record receipt state without replacing interactive DOM. */
          bridgeStats.last_alert_kind = p && p.kind ? String(p.kind) : 'unknown';
        } catch (e) { try { console.error('[pm6-js-usage] alert', e); } catch (e2) {} }
      });'''
    bridge = _replace_once(bridge, ambient_alert_old, ambient_alert_new, need, "ambient alert remount suppression")
    need(bridge.count("      pd.on(") == 3, "T34 bridge subscription count drift")
    bridge = bridge.replace("      pd.on(", "      sub(")
    bridge_done_new = r'''    try { u.injectIcons(); } catch (e1) { recordBridgeFailure('icons', 'injectIcons', e1); }
    bridgeState.initialized = bridgeStats.action_registration_count === 10 && bridgeStats.subscription_count === 3 && bridgeStats.failure_count === 0;
    bridgeStats.init_count = bridgeState.initialized ? 1 : 0;
    return bridgeState.initialized;'''
    bridge = _replace_once(bridge, "    try { u.injectIcons(); } catch (e1) {}\n    return true;", bridge_done_new, need, "bridge initialized receipt")
    doc = doc[:bridge_start] + bridge + doc[bridge_end:]

    # Postconditions bind the transform to the intended source semantics.
    need(doc.count(TRANSFORM_MARKER) == 2, "T34 marker census mismatch")
    need("window.PM7_USAGE || window.PM6_USAGE" in doc, "T34 PM7 bridge preference missing")
    need("ambient quota remount suppression" not in doc and "bridgeStats.last_quota_signature = lastQuotaSig" in doc and "bridgeStats.last_alert_kind" in doc and "U().rerender('quota_summary')" not in bridge and "U().rerender('alert_thresholds')" not in bridge and "U().rerender('multi_account')" not in bridge, "T34 ambient bridge remount suppression missing")
    need("Provider Setup Required" in doc and "Host/Environment" in doc and "cmd.settings.open" in doc and "ai.accounts.provider-connections" in doc and "No acquisition attempted" in doc, "T34 provider setup state missing")
    need("installation_status: 'Not installed'" in doc and "authentication_status: 'Not started'" in doc and "operation_id: 'provider-setup-op-001'" in doc and "continuation_id: 'provider-setup-cont-001'" in doc, "T34 provider setup identity or separation missing")
    need("pm7:usage:prototype:workspace:v11" in doc and "legacy_import" in doc, "T34 workspace envelope missing")
    need("function legacyImportAssessment(cleanState)" in doc and "legacy_values_rejected" in doc and "legacy_partial_values_preserved" in doc, "T34 factual legacy import receipt missing")
    need("function persistUsageWorkspaceEnvelope(envelope)" in doc and "legacyCandidate.present && USAGE_MIGRATION_RECEIPT.envelope_persisted" in doc and "storedWorkspace.committed_revision >= 0" in doc, "T34 durable migration guard or revision validation missing")
    need("function projectedAttempts()" in doc and "function scopeFactor()" not in doc and "function scaled(" not in doc, "T34 scalar projection survived")
    need("DATA.accounts.forEach(function (account) { if (account.scope === state.scope) ids[account.provider_id] = true; });" in doc, "T34 provider roster still depends on selected range")
    need("function applySelectorTruth(room, widgets)" in doc and "data-selector-applicability" in doc and "projectionSnapshot:projectionSnapshot" in doc and "current_scope_filtered" in doc and "scope filters provider roster; range does not apply" in doc and "function selectorFactRows(rangeLabel)" in doc and "function selectorTrendLabel()" in doc and "renderWidgetBody(item, layout)" in doc, "T34 selector truth surface incomplete")
    need("DATA.ledger.map" not in doc and "costs.month" not in doc, "T34 stale scalar or ledger projection survived")
    need("provider.used *" not in doc and "totals.used = provider.used" in doc, "T34 native allowance semantics drifted")
    need("finalizeUsageWorkspace();" in doc and "USAGE_RUNTIME_INVENTORY = inventory" in doc, "T34 curated workspace finalization missing")
    need("__PM7_USAGE_BRIDGE_STATE_V1__" in doc and "appendUsageAttempt" in doc, "T34 bridge idempotency or attempt mapping missing")
    need("installation:unavailable" not in doc and "account:unavailable" not in doc and "route:unavailable" not in doc and "if (!mapped) { bridgeStats.rejected_attempt_count += 1; return; }" in doc, "T34 bridge missing-axis rejection incomplete")
    need("pointercancel', cancel" in doc and "aria-grabbed', 'true'" in doc and "startKeyboardDrag" in doc and "cross * 1.75" in doc and "function snapshotPeers()" in doc and "function animatePeers(before)" in doc and "placePlaceholder(target, insertBefore)" in doc and "transform 190ms cubic-bezier(.2,.8,.2,1)" in doc and "document.body.classList.contains('pm7u-pointer-op')" in doc and ".pm7u-pointer-op .pm7u-card{translate:none!important}" in doc and ".pm7u-drag{clip-path:none!important}" in doc and "_pm7KeyboardDocumentKeydown" in doc and "queueMicrotask(function ()" in doc, "T34 transactional reorder incomplete")
    need("function freezePeers()" not in doc and "col:fullOrder.indexOf(movedId), row:0" not in doc and "function settledGridPosition(cardElement)" in doc and "position:relative;z-index:18" in doc, "T34 reorder regression or false settled coordinates survived")
    need("transactional pointer resize" not in doc and "function startResize(event, cardElement, item)" in doc and "handle.addEventListener('lostpointercapture', lostCapture)" in doc and "window.addEventListener('blur', blur)" in doc and "function physicalColumnSpan(logicalCols)" in doc and "function validRelease(upEvent)" in doc and "finish(validRelease(upEvent));" in doc and "function settleUsageCardAnimations()" in doc and "function renderSettledBoard()" in doc and "restoreOrder(move.original); settleUsageCardAnimations();" in doc and "if (!shouldCommit || !changed) applyLiveLayout(cardElement, original, item);" in doc and "if (shouldCommit && changed) { setLayout(item, lastCols, lastRows, 'cmd.widget.resize', 'pointer'); renderSettledBoard(); }" in doc, "T34 transactional resize or settled keyboard rollback incomplete")
    need("function dragHit(clientX, clientY)" in doc and "function edgeScrollVelocity()" in doc and "function autoScrollTick()" in doc and "placeFromPointer(lastPointerX, lastPointerY)" in doc and "cancelAnimationFrame(scrollFrame)" in doc, "T34 responsive reorder edge auto-scroll missing")
    need("if (before.cols === next.cols && before.rows === next.rows) return next;" in doc, "T34 no-op resize guard missing")
    need("refreshOpenContextDrawers();" in doc, "T34 open drawer refresh missing")
    need(doc.count("function syncUsageContextProjection()") == 1 and doc.count("syncUsageContextProjection();") == 1, "T34 shared current Context projection sync is not singular")
    context_sync = re.search(r"  function syncUsageContextProjection\(\) \{.*?\n  \}", doc, re.S)
    need(context_sync is not None and "CTX.segments.slice()" in context_sync.group(0) and "CTX.labels.slice()" in context_sync.group(0), "T34 Context projection does not copy current composition")
    need(context_sync is not None and all(token not in context_sync.group(0) for token in ("DATA.attempts", "command(", "usageEvent(", "viewAction(")), "T34 Context projection sync mutates history or emits telemetry")
    need("['Read','38.2k']" not in doc and "['Mutable','30.9k']" not in doc and "CTX.input = CTX.used - CTX.output" in doc, "T34 Usage Context cards or terminal token projection remain stale")
    need("usageEvent('context.compaction." not in doc and "viewAction('chat.context_compaction." not in doc, "T34 compaction telemetry lookalike survived")
    need("projection_state: 'started'" in doc and "defer_receipt: true" in doc and "function completeCommandReceipt(receipt, result, status)" in doc and "completeCommandReceipt(CTX.compaction_receipt, { projection_state: 'completed'" in doc, "T34 terminal command-receipt compaction projection missing")
    need("Claude Sonnet · fallback" not in doc and "contextAttempt.effective_route_id" in doc, "T34 hard-coded Context attribution survived")
    need("data-context-title" not in doc and "setAttribute('tabindex', '-1')" not in refresh_drawers, "T34 Assistant GUI attribute drift survived")
    final_popup_gui = re.search(r"  function ctxPopupHTML\(\) \{.*?\n  \}\n(?=  function enhanceContext)", doc, re.S)
    final_drawer_gui = re.search(r"  function contextDrawerHTML\(title\) \{.*?\n  \}\n(?=  function openContextDetails)", doc, re.S)
    need(final_popup_gui is not None and final_popup_gui.group(0) == popup_gui_source, "T34 compact-menu GUI source changed")
    need(final_drawer_gui is not None and final_drawer_gui.group(0) == drawer_gui_source, "T34 context-details GUI source changed")
    need(assistant_css_rules(doc) == assistant_gui_css, "T34 Assistant GUI CSS changed")
    final_settings_css = re.search(r'<style id="pm4-settings-css">.*?</style>', doc, re.S)
    final_settings_js = re.search(r'<script id="pm4-settings-js">.*?</script>', doc, re.S)
    settings_seam = "\n  window.PM7_SETTINGS_OPEN_BLOOM = openBloom;\n"
    need(final_settings_css is not None and final_settings_css.group(0) == settings_css_source, "T34 Settings CSS changed")
    need(final_settings_js is not None and final_settings_js.group(0).replace(settings_seam, "", 1) == settings_js_source, "T34 Settings GUI source changed beyond the approved opener seam")
    need("route_target: { object_kind: 'usage_attempt', object_id: attemptId }" in doc and "object_kind: 'usage_event'" not in doc and "object_kind: 'usage_provider'" not in doc, "T34 Usage-attempt route identity drifted")
    need("open_subject: { subject_kind: 'usage_event'" not in doc, "T34 Usage-event route still carries document/artifact OpenSubject")
    need("var attemptId = selectedAttempt.attempt_id" in doc and "attempt.usage_event_ref === attempt.attempt_id" in doc, "T34 Usage event and attempt identity separation missing")
    need("usage_event_refs:records.map" in doc and "usage_record_id: selectedAttempt.usage_record_id" in doc and "provider_attempt_ref: selectedAttempt.provider_attempt_ref" in doc, "T34 Ledger correlation passthrough incomplete")
    need("usageEvent('view.usage.subject_opened'" not in doc and "viewAction('usage.details.open'" in doc, "T34 local details or route-receipt boundary incomplete")
    need(".pm7u-more,.pm7u-more.open{display:contents}" in doc, "T34 narrow secondary rooms missing")

    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {
            "command_ids": {"added": ["cmd.settings.open"], "removed": []},
            "domain_event_ids": {
                "added": ["usage.details.open", "usage.provider_setup.open_settings"],
                "removed": ["context.compaction.completed", "context.compaction.started", "view.usage.subject_opened"],
            },
            "dom_event_types": {"added": [], "removed": []},
            "persistence_targets": {
                "added": [
                    "localStorage.removeItem:LEGACY_KEY+field",
                    "localStorage.setItem:WORKSPACE_KEY",
                    "rawStoreSet:key",
                ],
                "removed": [],
            },
        },
        need,
        "T34",
    )
    notes.update({
        "decision": "authorized GUI-01..GUI-10 plus GUI-X01..GUI-X04 Usage repair; prototype lineage only",
        "known_widget_ids": len(known_widget_ids),
        "attempt_records": 20,
        "workspace_schema_version": 11,
        "workspace_default_set_version": "pm7-usage-defaults-2026-08-27",
        "bridge_preference": "PM7_USAGE then PM6_USAGE fallback",
        "primary_command_ids_minted": 0,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
