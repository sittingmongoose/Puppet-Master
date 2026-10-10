/* Usage fixtures: every fixture of the Prism Usage page's DATA object and the constants around it, ported unchanged
   from its script (PMConcept7.html / TestOpus5.5PmConcept.html, the IIFE bound to #pm7UsageApp, DATA at its line
   32390 through the room, detail, storage and widget-id constants at 32635). Only the two-space IIFE indent is gone.

   This file is data only: it reads nothing from window or document. The real page renders every room from it, so
   nothing here is dropped or rewritten; a value that needs to change is a decision to record, not an edit to make
   in passing. Derived identity axes (PM7 T34), the OpenCode setup row, the 20 attempt records and the current-thread
   context projection fields are built exactly as the old script built them. */
var DATA = {
  providers: [
    { id: 'claude', name: 'Claude Code', plan: 'Max · Work', tone: 'purple', status: 'watch', primaryLabel: '5-hour window', used: 78, reset: '1h 42m', weekly: 54, weeklyReset: '4d 11h', monthly: 18, requests: 184, tokens: 2864000, input: 2390000, output: 474000, cache: 95.4, cost: 0, pace: '+11% vs norm', forecast: '90% in 54m' },
    { id: 'codex', name: 'Codex', plan: 'ChatGPT Pro', tone: 'blue', status: 'ok', primaryLabel: '5-hour window', used: 63, reset: '3h 18m', weekly: 41, weeklyReset: '5d 2h', monthly: 23, requests: 141, tokens: 2189000, input: 1851000, output: 338000, cache: 97.2, cost: 0, pace: '+3% vs norm', forecast: 'healthy runway' },
    { id: 'qwen', name: 'Qwen Coding Plan', plan: 'Advanced · Work', tone: 'green', status: 'ok', primaryLabel: 'Weekly window', used: 44, reset: '2d 6h', weekly: 44, weeklyReset: '2d 6h', monthly: 31, requests: 96, tokens: 1548000, input: 1308000, output: 240000, cache: 91.8, cost: 0, pace: '-6% vs norm', forecast: '31% left at reset' },
    { id: 'gemini', name: 'Gemini Direct', plan: 'API · Work', tone: 'orange', status: 'ok', primaryLabel: 'Monthly budget', used: 29, reset: 'Sep 1', weekly: 22, weeklyReset: 'Mon', monthly: 29, requests: 68, tokens: 872000, input: 744000, output: 128000, cache: 84.6, cost: 14.82, pace: '+18% vs norm', forecast: '$21.40 month end' },
    { id: 'kimi', name: 'Kimi Coding Plan', plan: 'Team', tone: 'purple', status: 'ok', primaryLabel: 'Weekly window', used: 52, reset: '4d 11h', weekly: 52, weeklyReset: '4d 11h', monthly: 36, requests: 77, tokens: 1194000, input: 1018000, output: 176000, cache: 89.9, cost: 0, pace: '+2% vs norm', forecast: 'healthy runway' },
    { id: 'copilot', name: 'GitHub Copilot', plan: 'Business', tone: 'blue', status: 'ok', primaryLabel: 'Premium requests', used: 35, reset: 'Sep 1', weekly: 27, weeklyReset: 'Mon', monthly: 35, requests: 51, tokens: 684000, input: 596000, output: 88000, cache: 93.1, cost: 0, pace: '-4% vs norm', forecast: '65% remaining' }
  ],
  costs: { month: 184.62, api: 38.74, plans: 145.88, saved: 312.40, burn: 6.14, forecast: 201.30, budget: 250, overage: 12.40, planUtil: 79, apiUtil: 21 },
  context: { used: 42180, limit: 128000, pct: 33, cache: 96.8, input: 38200, output: 3980, reclaim: 18600, reserved: 16000, segments: [43, 21, 14, 12, 10], labels: ['Messages', 'Instructions', 'Tools', 'Skills', 'Memory'] },
  accounts: [
    { name: 'Anthropic · Work', family: 'Claude', status: 'Connected', requests: 184, cost: 'plan covered', last: '20s ago', scope: 'work', route: 'primary code', auth: 'OAuth', health: 99.9 },
    { name: 'OpenAI · Personal', family: 'Codex', status: 'Connected', requests: 141, cost: 'plan covered', last: '34s ago', scope: 'personal', route: 'fast edit fallback', auth: 'ChatGPT', health: 99.7 },
    { name: 'Alibaba · Work', family: 'Qwen', status: 'Connected', requests: 96, cost: 'plan covered', last: '1m ago', scope: 'work', route: 'long context', auth: 'Coding plan', health: 99.4 },
    { name: 'Google AI Studio', family: 'Gemini', status: 'Connected', requests: 68, cost: '$14.82', last: '2m ago', scope: 'work', route: 'vision helper', auth: 'API key', health: 98.8 },
    { name: 'Moonshot · Team', family: 'Kimi', status: 'Connected', requests: 77, cost: 'plan covered', last: '4m ago', scope: 'work', route: 'secondary code', auth: 'Coding plan', health: 99.2 },
    { name: 'GitHub · Work', family: 'Copilot', status: 'Connected', requests: 51, cost: 'plan covered', last: '6m ago', scope: 'work', route: 'completion fallback', auth: 'GitHub', health: 99.8 }
  ],
  runs: [
    { id: 'run-47', name: 'Tastebook initial build', state: 'Running', agents: 6, tokens: '428k', cost: '$4.82', elapsed: '38m' },
    { id: 'run-46', name: 'Search and comments', state: 'Complete', agents: 4, tokens: '312k', cost: '$3.10', elapsed: '26m' },
    { id: 'run-45', name: 'Auth hardening', state: 'Complete', agents: 3, tokens: '198k', cost: '$1.88', elapsed: '19m' },
    { id: 'run-44', name: 'Initial scaffold', state: 'Degraded', agents: 5, tokens: '404k', cost: '$4.07', elapsed: '41m' }
  ],
  alerts: [
    { title: 'Claude allowance pressure', detail: '5-hour window is 78%; current pace reaches 90% in 54 minutes.', state: 'warn', time: 'now', owner: 'run-47', score: 78 },
    { title: 'Gemini API burn changed', detail: 'Vision helper calls raised daily API spend by 18%.', state: 'warn', time: '12m', owner: 'Gemini Direct', score: 68 },
    { title: 'Qwen weekly runway', detail: 'Current pace leaves an estimated 31% at reset.', state: 'ok', time: '1h', owner: 'Qwen', score: 44 }
  ],
  tools: [
    ['run_shell_command', '284 calls', '0.8% errors', '3.8s median', '42.1k tokens'],
    ['browser_exec', '96 calls', '0 errors', '6.2s median', '18 recordings'],
    ['read_file', '412 calls', '0 errors', '0.4s median', '1.9M tokens'],
    ['image_gen', '18 calls', '1 retry', '22s median', '$3.62'],
    ['git', '71 calls', '0 errors', '1.1s median', '14 worktrees']
  ],
  ledger: [
    ['15:42:08', 'run.started', 'run-47', '6 specialists · 3 waves'],
    ['15:43:19', 'route.selected', 'Claude Code', 'Work account · Max'],
    ['15:47:44', 'context.compacted', 'thread-main', '18.6k reclaimed'],
    ['15:52:01', 'provider.fallback', 'Gemini Direct', 'vision helper only'],
    ['15:58:33', 'cache.hit', 'Codex', '96.8% effective'],
    ['16:02:16', 'limit.warning', 'Claude Code', '5h window 78%'],
    ['16:05:42', 'run.completed', 'run-46', '31 nodes · passed']
  ],
  cache: [
    ['Claude Code', '95.4%', '$82.14 saved', '2.39M read', '118k write'],
    ['Codex', '97.2%', '$119.30 saved', '1.85M read', '74k write'],
    ['Qwen', '91.8%', '$44.02 saved', '1.31M read', '93k write'],
    ['Gemini', '84.6%', '$18.10 saved', '744k read', '62k write']
  ],
  free: [
    ['GLM-4.5-Air', 'Ready', '0 cost', '128k', '82 calls left'],
    ['Qwen3-Coder-Free', 'Cooldown · 40m', '0 cost', '256k', 'resets 16:48'],
    ['Gemini Flash Free', 'Ready', '0 cost', '1M', '1,420 calls left'],
    ['Local Qwen 7B', 'Ready', 'local', '32k', 'RX 7900 XTX']
  ],
  signals: [
    ['Provider health', '6 of 6 healthy', 'ok', '20s old'],
    ['Usage sync', '20 seconds ago', 'ok', 'next in 40s'],
    ['Price catalog', '2 hours old', 'ok', '14 providers'],
    ['Unpriced events', '3 events', 'warn', '0.02% of total']
  ],
  authority: [
    ['Claude Code', 'provider reported', '18s old', 'allowance + reset'],
    ['Codex', 'provider reported', '31s old', 'allowance + cache'],
    ['Qwen', 'provider reported', '58s old', 'weekly window'],
    ['Gemini Direct', 'provider reported', '1m old', 'metered spend'],
    ['Cache savings', 'PM estimate', '20s old', 'catalog pricing'],
    ['Forecast', 'PM estimate', '20s old', 'local-time pace']
  ]
};


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

var ROOM = {
  overview: { label: 'Overview', title: 'Current usage', desc: 'Limits, costs, and run pressure at the current pace.' },
  plans: { label: 'Plans & limits', title: 'Allowance by plan', desc: 'Each route keeps its own windows, reset, and forecast.' },
  costs: { label: 'Costs', title: 'Spend and forecast', desc: 'Actual charges, covered work, savings, and monthly runway.' },
  accounts: { label: 'Accounts', title: 'Accounts and routes', desc: 'Connection health, scope, settlement, and effective route.' },
  free: { label: 'Free models', title: 'Free route capacity', desc: 'Ready capacity, cooldowns, context limits, and local fallback.' },
  context: { label: 'Context', title: 'Context and cache', desc: 'Window composition, reclaimable context, and effective limits.' },
  analytics: { label: 'Analytics', title: 'Token analytics', desc: 'Volume, cache contribution, output ratio, and provider mix.' },
  ledger: { label: 'Ledger', title: 'Usage ledger', desc: 'Receipt-linked usage events and effective route identity.' },
  attention: { label: 'Attention', title: 'Attention queue', desc: 'Current pressure and anomalies that can change routing.' },
  cache: { label: 'Prompt cache', title: 'Prompt cache', desc: 'Read/write volume, hit rate, and estimated savings.' },
  tools: { label: 'Tools', title: 'Tool usage', desc: 'Calls, latency, errors, and token-bearing tool traffic.' },
  signals: { label: 'Signals', title: 'Usage signals', desc: 'Freshness, health, pricing, and unpriced event coverage.' },
  authority: { label: 'Source authority', title: 'Source authority', desc: 'Which readings are provider-reported and which are PM estimates.' }
};

var DETAIL = {
  glance: { label: 'At a glance', rank: 0, desc: 'Core operating panels only.' },
  detailed: { label: 'Detailed', rank: 1, desc: 'Adds forecasts and comparisons.' },
  diagnostics: { label: 'Diagnostics', rank: 2, desc: 'Adds source and quality panels.' }
};

var LEGACY_KEY = 'pm7:usage:v10:';
var KEY = LEGACY_KEY; /* adapter-only compatibility prefix */
var PRIOR_WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v11';
var WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v12';
var WORKSPACE_SCHEMA_VERSION = 12;
var WORKSPACE_DEFAULT_SET_VERSION = 'pm7-usage-defaults-2026-08-29';
var WORKSPACE_FIELDS = ['room','detail','range','scope','more','hidden','layout','order'];
var KNOWN_USAGE_WIDGET_IDS = ["account-fallbacks","active-runs","allowance-attribution","anom","attempt-lineage","attention-history","attention-now","attention-policy","auth-coverage","auth-est","auth-list","auth-stale","auth-summary","budget","budget-now","burn-basis","cache-authority","cache-break-even","cache-economics","cache-read-share","cache-saved","cache-trend","capacity-reservations","catalog-refresh","compaction-history","completion-capacity","connection-authority","context-composition","context-now","cooldown-eligibility","cost-api","cost-authority","cost-month","cost-plan","cost-save","cost-trend","counting-basis","credential-ownership","ctx-cache","ctx-limits","ctx-maint","ctx-output","ctx-reclaim","ctx-route","ctx-routing","ctx-sources","ctx-window","forecast","free-history","free-route","free-source-state","free-throughput","health","ledger-count","ledger-coverage","ledger-errors","ledger-export","ledger-main","ledger-routes","model-mix","month","native-allowance-units","next-reset","operations-window","plan-authority","plan-pressure","plan-settlement","plan-value-now","pricing-confidence","pricing-provenance","provider-cost","provider-probe-state","reasoning-mix","reset-map","route-mismatches","route-pressure","routing","run-attribution","settlement-states","signal-authority-map","signal-coverage","signal-history","signal-list","token-counting-basis","token-trend","tool-allowance","tool-health","tool-latency","tool-list","tool-receipts","unknown-token-buckets","unknown-versus-zero","usage-record-state"];
