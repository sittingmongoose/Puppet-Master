
(function () {
  'use strict';

  var app = document.getElementById('pm7UsageApp');
  if (!app) return;

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  var board = $('#pm7uBoard');
  var boardScroll = $('#pm7uBoardScroll');
  var usagePanel = document.getElementById('panel-usage');

  /* PM7 T42: first-visible Usage slot restoration. */
  var usageVisibleLayoutFrame = 0;
  var usageVisibleLayoutReady = false;
  function restoreUsageLayoutWhenVisible() {
    usageVisibleLayoutFrame = 0;
    if (!usagePanel.classList.contains('active') || usageVisibleLayoutReady) return;
    /* A positive-width ResizeObserver notification retries a zero-geometry
       activation.  Pointer transactions retry on their next frame without
       letting render()'s operation guard masquerade as completed work. */
    if (board.clientWidth <= 0) return;
    if (document.body.classList.contains('pm7u-pointer-op')) return;
    render();
    usageVisibleLayoutReady = true;
  }
  function scheduleUsageVisibleLayout() {
    if (usageVisibleLayoutReady || usageVisibleLayoutFrame || !usagePanel.classList.contains('active')) return;
    usageVisibleLayoutFrame = requestAnimationFrame(restoreUsageLayoutWhenVisible);
  }
  function syncUsageLayer() {
    var active = usagePanel.classList.contains('active');
    document.body.classList.toggle('pm7u-page-active', active);
    if (active) scheduleUsageVisibleLayout();
  }
  new MutationObserver(syncUsageLayer).observe(usagePanel, { attributes: true, attributeFilter: ['class'] });
  syncUsageLayer();

  var navStrip = $('#pm7uNav', app);
  var navInkEl = $('#pm7uNavInk', app);
  var navInkCtl = null;
  var navInkReady = false;
  function ensureNavInk() {
    if (navInkCtl) return navInkCtl;
    if (!window.PM6_LIQUID_INK || !navStrip || !navInkEl) return null;
    navInkCtl = window.PM6_LIQUID_INK.attach({
      strip: navStrip,
      ink: navInkEl,
      axis: 'v',
      getActive: function () {
        return $('.pm7u-navbtn[data-room].active', app);
      }
    });
    return navInkCtl;
  }
  function syncNavInk(animate) {
    var ctl = ensureNavInk();
    if (!ctl) return;
    requestAnimationFrame(function () {
      ctl.resync(!!animate && navInkReady);
      navInkReady = true;
    });
  }
  if (navStrip && 'ResizeObserver' in window) {
    new ResizeObserver(function () { syncNavInk(false); }).observe(navStrip);
  }
  window.addEventListener('resize', function () { syncNavInk(false); });

  var STORE = {
    get: function (key, fallback) {
      try {
        var value = localStorage.getItem(key);
        return value == null ? fallback : JSON.parse(value);
      } catch (error) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
    }
  };

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

  $$('[data-icon]', app).forEach(function (element) {
    element.innerHTML = SVG[element.getAttribute('data-icon')] || SVG.grid;
  });

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
        if (!parts || !value || typeof value !== 'object' || Array.isArray(value)) return;
        var cols = Number(value.cols), rows = Number(value.rows);
        if (!Number.isInteger(cols) || !Number.isInteger(rows)) return;
        if (USAGE_RUNTIME_INVENTORY) {
          if (USAGE_RUNTIME_INVENTORY[parts[0]][parts[1]].sizes.indexOf(cols + 'x' + rows) < 0) return;
        } else if (cols < 1 || cols > 12 || rows < 1 || rows > 8) return;
        var record = { cols:cols, rows:rows };
        if (typeof value.slot_id === 'string') {
          var slot = /^usage-grid-v1:b(4|6|12):r([1-9][0-9]{0,2}):c([1-9][0-9]?)$/.exec(value.slot_id);
          var basisCols = Number(value.basis_cols), col = Number(value.col), row = Number(value.row);
          var colSpan = Number(value.col_span), rowSpan = Number(value.row_span);
          if (slot && Number(slot[1]) === basisCols && Number(slot[2]) === row && Number(slot[3]) === col &&
              Number.isInteger(colSpan) && Number.isInteger(rowSpan) && basisCols >= 4 && col >= 1 && row >= 1 &&
              colSpan >= 1 && colSpan <= basisCols && rowSpan >= 1 && rowSpan <= 8 && col + colSpan - 1 <= basisCols) {
            record.slot_id = value.slot_id;
            record.basis_cols = basisCols;
            record.col = col;
            record.row = row;
            record.col_span = colSpan;
            record.row_span = rowSpan;
          }
        }
        clean.layout[key] = record;
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
  var priorWorkspaceKeyPresent = false;
  try { priorWorkspaceKeyPresent = localStorage.getItem(PRIOR_WORKSPACE_KEY) != null; } catch (error) {}
  var priorStoredWorkspace = rawStoreGet(PRIOR_WORKSPACE_KEY, null);
  var priorWorkspace = !!(priorStoredWorkspace && priorStoredWorkspace.schema_version === 11 && priorStoredWorkspace.default_set_version === 'pm7-usage-defaults-2026-08-27' && priorStoredWorkspace.prototype_only === true && priorStoredWorkspace.state);
  var priorWorkspaceRejected = priorWorkspaceKeyPresent && !priorWorkspace;
  var legacyCandidate = readLegacyUsageCandidate();
  var shouldImportPriorWorkspace = !workspaceKeyPresent && priorWorkspace;
  var shouldImportLegacy = !workspaceKeyPresent && !shouldImportPriorWorkspace && legacyCandidate.present > 0;
  var sourceEnvelope = currentWorkspace ? storedWorkspace : shouldImportPriorWorkspace ? priorStoredWorkspace : null;
  var sourceState = sourceEnvelope ? sourceEnvelope.state : shouldImportLegacy ? legacyCandidate.state : usageDefaults();
  var workspaceState = sanitizeUsageState(sourceState);
  if (canonicalUsageJson(sourceState) !== canonicalUsageJson(workspaceState)) USAGE_STALE_VALUE_COUNT += 1;
  if (workspaceKeyPresent && !currentWorkspace) USAGE_STALE_VALUE_COUNT += 1;
  if (priorWorkspaceRejected) USAGE_STALE_VALUE_COUNT += 1;
  if (legacyCandidate.parse_failures) USAGE_STALE_VALUE_COUNT += legacyCandidate.parse_failures;
  if (legacyCandidate.present && !shouldImportLegacy) USAGE_STALE_VALUE_COUNT += legacyCandidate.present;
  var USAGE_WORKSPACE = {
    schema_version: WORKSPACE_SCHEMA_VERSION,
    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,
    prototype_only: true,
    committed_revision: sourceEnvelope && Number.isInteger(sourceEnvelope.committed_revision) && sourceEnvelope.committed_revision >= 0 ? sourceEnvelope.committed_revision : 0,
    legacy_import: sourceEnvelope && sourceEnvelope.legacy_import ? sourceEnvelope.legacy_import : { source:'pm7:usage:v10:*', completed:true, imported:false, accepted_values:0, rejected_values:legacyCandidate.parsed, partial_values:0, imported_at:null },
    prior_workspace_import: { source:PRIOR_WORKSPACE_KEY, completed:true, imported:shouldImportPriorWorkspace, imported_at:shouldImportPriorWorkspace ? new Date().toISOString() : null },
    state: workspaceState
  };
  var USAGE_MIGRATION_RECEIPT = {
    envelope_key: WORKSPACE_KEY, schema_version: WORKSPACE_SCHEMA_VERSION,
    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,
    prior_workspace_key: PRIOR_WORKSPACE_KEY,
    prior_workspace_detected: priorWorkspaceKeyPresent,
    prior_workspace_imported: shouldImportPriorWorkspace,
    prior_workspace_rejected: priorWorkspaceRejected,
    prior_workspace_removed: false,
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
  /* T39 defers the only boot write until runtime inventory validation. */
  USAGE_MIGRATION_RECEIPT.envelope_persisted = false;
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
      if (WORKSPACE_FIELDS.indexOf(field) < 0) return false;
      var candidate = liveUsageStateSnapshot();
      candidate[field] = value;
      var committed = persistUsageWholeState(candidate);
      if (!committed && typeof state !== 'undefined') {
        var prior = USAGE_WORKSPACE.state[field];
        state[field] = prior && typeof prior === 'object' ? JSON.parse(JSON.stringify(prior)) : prior;
      }
      return committed;
    }
    rawStoreSet(key, value);
    return true;
  };
  var state = {
    room: STORE.get(KEY + 'room', 'overview'), detail: STORE.get(KEY + 'detail', 'glance'),
    range: STORE.get(KEY + 'range', '24h'), scope: STORE.get(KEY + 'scope', 'all'),
    more: STORE.get(KEY + 'more', false), hidden: STORE.get(KEY + 'hidden', {}),
    layout: STORE.get(KEY + 'layout', {}), order: STORE.get(KEY + 'order', {})
  };
  if (!ROOM[state.room]) state.room = 'overview';
  if (!DETAIL[state.detail]) state.detail = 'glance';

  /* Usage is still a self-contained concept fixture, but every meaningful
     canonical mutations now travel through the typed command -> receipt seam;
     local room, scope, range, and disclosure choices remain explicit view actions that the native product will own. This keeps the prototype honest:
     local persistence is the adapter, not an invisible second behavior path. */
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
    try { dispatchAccepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record, cancelable:true })); } catch (error) { dispatchAccepted = false; }
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

  function money(value) { return '$' + Number(value).toFixed(2); }
  function num(value) { return Number(value).toLocaleString(); }
  function tok(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 1 : 2).replace(/\.0$/, '') + 'M';
    if (value >= 1000) return (value / 1000).toFixed(value >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(value);
  }
  function rangeHours() { return { '5h':5, '24h':24, '7d':168, '30d':720 }[state.range] || 24; }
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
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function scopeCaption() {
    if (state.scope === 'all') return 'all routes';
    if (state.scope === 'work') return 'work accounts';
    if (state.scope === 'personal') return 'personal accounts';
    if (state.scope.indexOf('provider:') === 0) return state.scope.split(':')[1] + ' routes';
    return state.scope;
  }

  function widget(id, title, meta, tone, cols, rows, minDetail, render, options) {
    options = options || {};
    var kind = options.kind || 'instrument';
    var defaultMaxRows = kind === 'list' ? 8 : kind === 'instrument' ? 8 : kind === 'chart' ? 6 : 5;
    return {
      id: id,
      title: title,
      meta: meta || '',
      tone: tone || 'blue',
      cols: cols,
      rows: rows,
      minCols: options.minCols == null ? (kind === 'instrument' ? 3 : 2) : options.minCols,
      maxCols: options.maxCols == null ? 6 : options.maxCols,
      minRows: options.minRows == null ? (kind === 'summary' ? 1 : 2) : options.minRows,
      maxRows: options.maxRows == null ? defaultMaxRows : options.maxRows,
      minDetail: minDetail || 'glance',
      kind: kind,
      contentCount: options.contentCount || 0,
      autoRows: options.autoRows !== false,
      defaultStart: options.defaultStart || 0,
      sizes: options.sizes || null,
      render: render
    };
  }
  function statRow(label, value, tier, className) {
    var tierClass = tier ? ' pm7u-tier-' + tier : '';
    return '<div class="pm7u-statrow' + tierClass + '">' +
      '<span class="pm7u-statlabel" title="' + esc(label) + '">' + esc(label) + '</span>' +
      '<b class="pm7u-statvalue ' + (className || '') + '" title="' + esc(value) + '">' + esc(value) + '</b></div>';
  }
  function meterLine(label, value, pct, color, tier) {
    var safePct = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    var tierClass = tier ? ' pm7u-tier-' + tier : '';
    var primary = value == null || value === '' ? '' : String(value);
    var percentText = safePct + '%';
    var repeatsPercent = primary.replace(/\s+/g, '') === percentText;
    var fullValue = primary ? (repeatsPercent ? primary : primary + ' · ' + percentText) : percentText;
    return '<div class="pm7u-meterline' + tierClass + '" data-meter-pct="' + safePct + '">' +
      '<div class="pm7u-metertrack" role="img" aria-label="' + esc(label) + ': ' + esc(fullValue) + '">' +
        '<i class="pm7u-meterfill ' + (color || '') + '" style="--fill:' + safePct + '%"></i>' +
        '<span class="pm7u-meterlabel" title="' + esc(label) + '">' + esc(label) + '</span>' +
        '<b class="pm7u-metervalue" title="' + esc(fullValue) + '">' +
          (primary ? '<span>' + esc(primary) + '</span>' : '') + ((!primary || !repeatsPercent) ? '<em>' + percentText + '</em>' : '') +
        '</b>' +
      '</div></div>';
  }
  function compactBarValue(value, formatter) {
    if (formatter === 'money-cents') return '$' + (Math.max(0, Number(value) || 0) / 100).toFixed(2);
    if (formatter === 'money') return '$' + compactBarValue(value, 'number');
    if (value >= 1000000) return (Math.round(value / 100000) / 10) + 'm';
    if (value >= 1000) return (Math.round(value / 100) / 10) + 'k';
    return String(value);
  }
  function miniBars(values, tier, label, formatter) {
    var clean = (values || []).map(function (value) {
      var numeric = Number(value);
      return Math.max(0, Math.round(isFinite(numeric) ? numeric : 0));
    });
    var latest = clean.length ? clean[clean.length - 1] : 0;
    var peak = Math.max.apply(Math, clean.concat([1]));
    var count = clean.length;
    var seriesLabel = label || 'Recent trend';
    var formatKind = formatter || 'number';
    var formatted = clean.map(function (value) { return compactBarValue(value, formatKind); });
    var seriesSummary = 'Latest ' + compactBarValue(latest, formatKind) + (peak !== latest ? ' · peak ' + compactBarValue(peak, formatKind) : '');
    var HEADROOM = 0.90;
    return '<div class="pm7u-mini-signal ' + (tier ? 'pm7u-tier-' + tier : '') + '" data-bars="' + count + '" data-bar-formatter="' + esc(formatKind) + '">' +
      '<div class="pm7u-signal-label"><span title="' + esc(seriesLabel) + '">' + esc(seriesLabel) + '</span><b title="' + esc(seriesSummary) + '">' + esc(seriesSummary) + '</b></div>' +
      '<div class="pm7u-mini-bars" style="--pm7u-bar-count:' + count + '" role="img" aria-label="' + esc(seriesLabel + ', values ' + formatted.join(', ') + '; ' + seriesSummary) + '">' + clean.map(function (value, index) {
        var recent = index >= count - 4;
        var visualHeight = value <= 0 ? 0 : Math.max(8, Math.min(Math.round(100 * HEADROOM), Math.round(value / peak * 100 * HEADROOM)));
        var short = visualHeight < 34;
        return '<span class="pm7u-barcol is-labeled' + (recent ? ' is-recent' : '') + (short ? ' is-short' : '') + '" style="--pm7u-bar-height:' + visualHeight + '%" data-value="' + value + '" data-display-value="' + esc(formatted[index]) + '" data-series-index="' + index + '" title="' + esc(seriesLabel + ': ' + formatted[index]) + '">' +
          '<span class="pm7u-barfill"></span><b class="pm7u-barvalue">' + esc(formatted[index]) + '</b></span>';
      }).join('') + '</div></div>';
  }
  function fitUsageBarLabels(root) {
    var scope = root && root.querySelectorAll ? root : board;
    var allFitted = true;
    $$('.pm7u-mini-bars', scope).forEach(function (plot) {
      var columns = $$('.pm7u-barcol', plot);
      plot.setAttribute('data-label-layout-valid', 'false');
      if (!columns.length) return;
      var plotRect = plot.getBoundingClientRect();
      if (!plotRect.width || !plotRect.height) { allFitted = false; return; }
      var MIN_LABEL_CLEARANCE = 4;
      function intersects(left, right) {
        var horizontalGap = Math.max(left.left, right.left) - Math.min(left.right, right.right);
        return horizontalGap < MIN_LABEL_CLEARANCE &&
          Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top) > .5;
      }
      function reset(mode) {
        plot.setAttribute('data-label-fit', mode);
        columns.forEach(function (column) {
          column.classList.add('is-labeled');
          column.classList.remove('is-label-suppressed','is-label-raised');
          var label = $('.pm7u-barvalue', column);
          if (label) {
            label.style.removeProperty('--pm7u-label-top');
            label.style.removeProperty('--pm7u-label-shift');
          }
        });
      }
      function entries() {
        return columns.map(function (column) {
          var labels = $$('.pm7u-barvalue', column), label = labels[0], fill = $('.pm7u-barfill', column);
          return { column:column, label:label, labelCount:labels.length, fill:fill, columnRect:column.getBoundingClientRect(), fillRect:fill ? fill.getBoundingClientRect() : null };
        });
      }
      function clampHorizontal(entry) {
        var labelRect = entry.label.getBoundingClientRect();
        if (labelRect.width > plotRect.width - 1) return false;
        var desiredLeft = Math.max(plotRect.left + .5, Math.min(plotRect.right - labelRect.width - .5, entry.columnRect.left + entry.columnRect.width / 2 - labelRect.width / 2));
        entry.label.style.setProperty('--pm7u-label-shift', (desiredLeft - labelRect.left) + 'px');
        return true;
      }
      function validPaint(all) {
        if (all.length !== columns.length || all.some(function (entry) {
          if (entry.labelCount !== 1 || !entry.label || !entry.fill || !entry.fillRect) return true;
          var style = getComputedStyle(entry.label);
          return !entry.label.getClientRects().length || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 ||
            entry.label.textContent.trim() !== String(entry.column.getAttribute('data-display-value') || '').trim();
        })) return false;
        var painted = all.map(function (entry) { return { entry:entry, rect:entry.label.getBoundingClientRect() }; });
        return painted.every(function (item) {
          return item.rect.left >= plotRect.left - .5 && item.rect.right <= plotRect.right + .5 &&
            item.rect.top >= plotRect.top - .5 && item.rect.bottom <= item.entry.fillRect.top - 2;
        }) && painted.every(function (item, index) {
          return !painted.slice(index + 1).some(function (other) { return intersects(item.rect, other.rect); });
        });
      }
      function directAttempt(mode) {
        reset(mode);
        var all = entries(), placed = [];
        if (all.some(function (entry) { return entry.labelCount !== 1 || !entry.label || !entry.fill || !entry.fillRect || !clampHorizontal(entry); })) return false;
        all.sort(function (left, right) {
          var heightDelta = left.fillRect.top - right.fillRect.top;
          return Math.abs(heightDelta) > .25 ? heightDelta : Number(left.column.getAttribute('data-series-index')) - Number(right.column.getAttribute('data-series-index'));
        });
        for (var index = 0; index < all.length; index += 1) {
          var entry = all[index], columnRect = entry.columnRect;
          var labelRect = entry.label.getBoundingClientRect();
          var step = labelRect.height + 2;
          var desiredTop = entry.fillRect.top - plotRect.top - labelRect.height - 3;
          var candidateTop = desiredTop;
          var fitted = false;
          while (candidateTop >= .5) {
            entry.label.style.setProperty('--pm7u-label-top', (candidateTop - (columnRect.top - plotRect.top)) + 'px');
            var painted = entry.label.getBoundingClientRect();
            var contained = painted.left >= plotRect.left - .5 && painted.right <= plotRect.right + .5 && painted.top >= plotRect.top - .5 && painted.bottom <= entry.fillRect.top - 2;
            if (contained && !placed.some(function (prior) { return intersects(prior, painted); })) {
              placed.push(painted); fitted = true; break;
            }
            candidateTop -= step;
          }
          if (!fitted) return false;
        }
        return validPaint(all);
      }
      function laneAttempt(mode) {
        reset(mode);
        var all = entries(), lanes = [];
        if (all.some(function (entry) { return entry.labelCount !== 1 || !entry.label || !entry.fill || !entry.fillRect || !clampHorizontal(entry); })) return false;
        all.sort(function (left, right) { return Number(left.column.getAttribute('data-series-index')) - Number(right.column.getAttribute('data-series-index')); });
        all.forEach(function (entry) {
          var rect = entry.label.getBoundingClientRect(), lane = 0;
          while (lane < lanes.length && rect.left < lanes[lane] + MIN_LABEL_CLEARANCE) lane += 1;
          if (lane === lanes.length) lanes.push(rect.right); else lanes[lane] = rect.right;
          entry.lane = lane;
        });
        var labelHeight = Math.max.apply(Math, all.map(function (entry) { return entry.label.getBoundingClientRect().height; }));
        var step = labelHeight + 1;
        var available = Math.min.apply(Math, all.map(function (entry) { return entry.fillRect.top - plotRect.top - 2; }));
        var used = labelHeight + Math.max(0, lanes.length - 1) * step;
        if (used > available || lanes.length > 3) return false;
        var firstTop = Math.max(.5, available - used);
        all.forEach(function (entry) {
          entry.label.style.setProperty('--pm7u-label-top', (firstTop + entry.lane * step - (entry.columnRect.top - plotRect.top)) + 'px');
        });
        return validPaint(all);
      }
      var fitted = directAttempt('normal') || directAttempt('tight') || directAttempt('ultra') ||
        laneAttempt('normal-lanes') || laneAttempt('tight-lanes') || laneAttempt('ultra-lanes');
      plot.setAttribute('data-label-layout-valid', String(!!fitted));
      if (!fitted) allFitted = false;
    });
    return allFitted;
  }
  var usageChartLabelFrame = 0;
  function scheduleUsageChartLabels(root) {
    if (usageChartLabelFrame) cancelAnimationFrame(usageChartLabelFrame);
    var scope = root || board, retries = 2;
    function settleLabels() {
      usageChartLabelFrame = 0;
      if (!fitUsageBarLabels(scope) && retries > 0) {
        retries -= 1;
        usageChartLabelFrame = requestAnimationFrame(settleLabels);
      }
    }
    usageChartLabelFrame = requestAnimationFrame(settleLabels);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleUsageChartLabels(board); });
  function seriesFromValue(value, salt) {
    var numeric = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 54;
    var seed = String(salt || value).split('').reduce(function (sum, character) { return sum + character.charCodeAt(0); }, 0);
    return [0,1,2,3,4,5,6,7,8,9,10,11].map(function (index) {
      var wave = Math.sin((index + seed % 7) * .78) * 11;
      var climb = (numeric - 34) * (index / 15);
      return Math.max(14, Math.min(96, Math.round(28 + wave + climb + (seed + index * 13) % 9)));
    });
  }
  function humanizeUsageEvent(eventKey) {
    var labels = {
      'run.started': 'Run started',
      'route.selected': 'Route selected',
      'context.compacted': 'Context compacted',
      'provider.fallback': 'Provider fallback',
      'cache.hit': 'Prompt cache hit',
      'limit.warning': 'Allowance warning',
      'run.completed': 'Run completed'
    };
    if (labels[eventKey]) return labels[eventKey];
    var words = String(eventKey || '').replace(/[._-]+/g, ' ').trim();
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Usage event';
  }

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

  function instrument(options) {
    var stats = options.stats || [];
    var meters = options.meters || [];
    var bars = options.bars || seriesFromValue(options.value, options.name);
    var details = (options.details || [
      ['Authority', options.authority || 'provider receipt'],
      ['Freshness', options.freshness || '20s']
    ].concat(selectorFactRows('Range'))).slice();
    var expandedDetails = (options.expandedDetails || []).slice();
    while (details.length < 8 && expandedDetails.length) details.push(expandedDetails.shift());
    return '<div class="pm7u-instrument">' +
      '<div class="pm7u-instrument-top"><div class="pm7u-instrument-name"><b title="' + esc(options.name) + '">' + esc(options.name) + '</b><span title="' + esc(options.subtitle || '') + '">' + esc(options.subtitle || '') + '</span></div>' +
      '<div class="pm7u-instrument-value"><b>' + esc(options.value) + '</b><span class="' + (options.statusClass || '') + '">' + esc(options.valueLabel || '') + '</span></div></div>' +
      '<div class="pm7u-instrument-divider"></div>' +
      '<div class="pm7u-instrument-core">' +
        '<div class="pm7u-statstack">' + stats.map(function (row, index) {
          var tier = row[2] || (index < 2 ? 'compact' : index < 4 ? 'standard' : index < 6 ? 'expanded' : 'maximum');
          return statRow(row[0], row[1], tier, row[3]);
        }).join('') + '</div>' +
        '<div class="pm7u-meters">' + meters.map(function (row, index) {
          var tier = row[4] || (index === 0 ? 'compact' : index === 1 ? 'standard' : index === 2 ? 'expanded' : 'maximum');
          return meterLine(row[0], row[1], row[2], row[3], tier);
        }).join('') + '</div>' +
      '</div>' +
      miniBars(bars, 'standard', options.activityLabel || 'Recent activity') +
      '<div class="pm7u-instrument-details pm7u-tier-expanded">' + details.map(function (detail, index) {
        var classes = [];
        if (index > 3) classes.push('pm7u-detail-extra');
        if (index > 5) classes.push('pm7u-tier-maximum');
        return '<div class="' + classes.join(' ') + '"><span title="' + esc(detail[0]) + '">' + esc(detail[0]) + '</span><b title="' + esc(detail[1]) + '">' + esc(detail[1]) + '</b></div>';
      }).join('') + '</div>' +
      '<div class="pm7u-instrument-foot pm7u-tier-standard"><div class="pm7u-footcopy"><span class="pm7u-foot-left" title="' + esc(options.footerLeft || '') + '">' + esc(options.footerLeft || '') + '</span><b class="pm7u-foot-right" title="' + esc(options.footerRight || '') + '">' + esc(options.footerRight || '') + '</b></div>' +
      (options.action ? '<button type="button" class="pm7u-viewlink" data-open-card="' + esc(options.action) + '">View details</button>' : '') + '</div></div>';
  }
  function summary(options) {
    var cells = (options.cells || []).slice();
    var extras = (options.extraCells || selectorFactRows('Window').concat([['Authority', 'named source'], ['Freshness', '20s']])).slice();
    while (cells.length < 8 && extras.length) cells.push(extras.shift());
    var bars = options.bars || seriesFromValue(options.value, options.label);
    return '<div class="pm7u-summary">' +
      '<div class="pm7u-summary-main"><b title="' + esc(options.value) + '">' + esc(options.value) + '</b><em class="' + (options.trendClass || '') + '" title="' + esc(options.trend || '') + '">' + esc(options.trend || '') + '</em></div>' +
      '<div class="pm7u-summary-label" title="' + esc(options.label || '') + '">' + esc(options.label || '') + '</div>' +
      '<div class="pm7u-summary-grid pm7u-tier-compact">' + cells.map(function (cell, index) {
        var tier = index < 4 ? 'compact' : index < 6 ? 'standard' : index < 8 ? 'expanded' : 'maximum';
        return '<div class="pm7u-summary-cell pm7u-tier-' + tier + '"><span title="' + esc(cell[0]) + '">' + esc(cell[0]) + '</span><b title="' + esc(cell[1]) + '">' + esc(cell[1]) + '</b></div>';
      }).join('') + '</div>' +
      '<div class="pm7u-summary-signal pm7u-tier-standard">' + miniBars(bars, '', options.signalLabel || 'Window trend', options.barFormatter || 'number') + '</div>' +
      '<div class="pm7u-summary-foot pm7u-tier-compact"><span title="' + esc(options.footerLeft || '') + '">' + esc(options.footerLeft || '') + '</span><b title="' + esc(options.footerRight || '') + '">' + esc(options.footerRight || '') + '</b></div></div>';
  }
  function richList(rows, clickable) {
    return '<div class="pm7u-list pm7u-rich-list" data-row-count="' + rows.length + '">' + rows.map(function (row, index) {
      var tier = row[4] || (index < 3 ? '' : index < 5 ? 'standard' : index < 8 ? 'expanded' : 'maximum');
      var tag = clickable ? 'button' : 'div';
      return '<div class="pm7u-row" data-tier="' + tier + '"><' + tag + (clickable ? ' type="button"' : '') + ' class="pm7u-rowmain' + (clickable ? ' pm7u-rowbtn' : '') + '" ' + (clickable ? 'data-open-row="' + index + '"' : '') + '>' +
        '<b title="' + esc(row[0]) + '">' + esc(row[0]) + '</b>' +
        (row[1] ? '<span class="pm7u-rowsub" title="' + esc(row[1]) + '">' + esc(row[1]) + '</span>' : '') +
        (row[5] ? '<span class="pm7u-rowextra pm7u-tier-expanded" title="' + esc(row[5]) + '">' + esc(row[5]) + '</span>' : '') +
        '</' + tag + '><span class="pm7u-rowval ' + (row[3] || '') + '" title="' + esc(row[2] || '') + '">' + esc(row[2] || '') + '</span></div>';
    }).join('') + '</div>';
  }
  function chartPanel(values, facts, label, note) {
    var allFacts = (facts || []).slice();
    var selectorFacts = selectorFactRows('Range');
    if (allFacts.length < 5) allFacts.push(selectorFacts[0]);
    if (allFacts.length < 6) allFacts.push(['Freshness', '20s']);
    if (allFacts.length < 7) allFacts.push(['Authority', 'named source']);
    if (allFacts.length < 8) allFacts.push(selectorFacts[1]);
    return '<div class="pm7u-splitview"><div class="pm7u-chartplot">' + miniBars(values, '', label || 'Recent trend', arguments.length > 4 ? arguments[4] : 'number') +
      (note ? '<div class="pm7u-chartnote pm7u-tier-expanded">' + esc(note) + '</div>' : '') +
      '</div><div class="pm7u-sidefacts">' + allFacts.map(function (fact, index) {
        var tier = index < 2 ? 'compact' : index < 4 ? 'standard' : index < 6 ? 'expanded' : 'maximum';
        return statRow(fact[0], fact[1], tier, fact[2] || '');
      }).join('') + '</div></div>';
  }
  function providerCard(provider) {
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
  function summaryCard(id, title, meta, tone, value, label, trend, trendClass, cells, footerLeft, footerRight, detail, options) {
    options = options || {};
    return widget(id, title, meta, tone, options.cols || 3, options.rows || 2, detail || 'glance', function () {
      return summary({ value: value, label: label, trend: trend, trendClass: trendClass, cells: cells, footerLeft: footerLeft, footerRight: footerRight, bars: seriesFromValue(value, id), signalLabel: selectorTrendLabel(), extraCells: options.extraCells });
    }, { kind: 'summary', minCols: options.minCols == null ? 2 : options.minCols, maxCols: options.maxCols || 6, minRows: options.minRows || 1, maxRows: options.maxRows || 5 });
  }

  function contextPanel() {
    var context = DATA.context;
    var contextAttempts = projectedAttempts();
    var contextAttempt = contextAttempts.length ? contextAttempts[contextAttempts.length - 1] : null;
    var contextEffectiveRoute = contextAttempt ? contextAttempt.effective_route_id + ' · ' + contextAttempt.model_id + (contextAttempt.requested_route_id !== contextAttempt.effective_route_id ? ' · fallback' : '') : 'No effective route in range';
    return '<div class="pm7u-context-v2"><div class="pm7u-context-v2-top"><div class="pm7u-donut" style="--pct:' + context.pct + '"><b>' + context.pct + '%</b></div><div class="pm7u-context-v2-copy"><b>' + tok(context.used) + ' / ' + tok(context.limit) + '</b><span>current effective window</span></div></div>' +
      '<div class="pm7u-statstack pm7u-tier-compact">' + statRow('Input / output', tok(context.input) + ' / ' + tok(context.output), 'compact') + statRow('Reclaimable', tok(context.reclaim), 'compact') + statRow('Reserved output', tok(context.reserved), 'standard') + statRow('Cache hit', context.cache.toFixed(1) + '%', 'standard') + statRow('Pinned context', tok(context.pinned), 'expanded') + statRow('Mutable context', tok(context.mutable), 'expanded') + '</div>' +
      '<div class="pm7u-segment-legend pm7u-tier-standard">' + context.labels.slice(0, 5).map(function (label, index) { return '<span><i></i>' + esc(label) + '<b>' + context.segments[index] + '%</b></span>'; }).join('') + '</div>' +
      meterLine('Context used', tok(context.limit - context.used) + ' free', context.pct, '', '') +
      '<div class="pm7u-context-foot pm7u-tier-expanded"><span>Effective route</span><b>' + esc(contextEffectiveRoute) + '</b><span>Compaction</span><b>' + (context.compacted ? 'compacted · 0 reclaimable' : tok(context.reclaim) + ' reclaimable') + '</b><span>Last maintenance</span><b>' + esc(context.last_maintenance) + '</b></div></div>';
  }
  function accountCard(account, index) {
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
  function freeCard(route, index) {
    var cooldown = route[1].indexOf('Cooldown') >= 0;
    return widget('free-' + index, route[0], route[2], cooldown ? 'warn' : 'green', 3, 3, 'glance', function () {
      return instrument({
        name: route[0], subtitle: route[3] + ' context', value: cooldown ? '40m' : 'Ready', valueLabel: cooldown ? 'cooldown' : 'available', statusClass: cooldown ? 'warn' : 'ok',
        stats: [['Capacity', route[4]], ['Price', route[2]], ['Context', route[3]], ['Eligibility', cooldown ? 'after reset' : 'current'], ['Route class', 'free'], ['Source', 'provider catalog']],
        meters: [['Availability', cooldown ? 'resets 16:48' : 'ready now', cooldown ? 42 : 100, cooldown ? 'orange' : 'green'], ['Context fit', route[3], route[3].indexOf('128') >= 0 ? 88 : 64, 'green'], ['Recent demand', cooldown ? 'high' : 'low', cooldown ? 76 : 28, cooldown ? 'orange' : '']],
        activityLabel: 'Availability history',
        details: [['Pricing', route[2]], ['Context window', route[3]], ['Capacity note', route[4]], ['Route state', cooldown ? 'cooldown' : 'eligible'], ['Eligibility', cooldown ? 'after reset' : 'current'], ['Catalog age', '2m']],
        footerLeft: 'free route', footerRight: cooldown ? 'wait' : 'eligible', action: 'free-' + index
      });
    }, { kind: 'instrument', minCols: 3, maxRows: 5 });
  }
  function autoRowsForCount(count, floorRows) {
    var rows = count <= 3 ? 2 : count <= 5 ? 3 : count <= 7 ? 4 : count <= 9 ? 5 : count <= 12 ? 6 : count <= 15 ? 7 : 8;
    return Math.max(floorRows || 2, rows);
  }
  function addFocusedWidgets(room, widgets) {
    var providers = visibleProviders();
    var costs = projectedCosts();
    if (room === 'overview') {
      widgets.push(summaryCard('completion-capacity', 'Completion capacity', 'current window', 'green', '74%', 'safe remaining completion capacity', '3 routes ready', '',
        [['Immediate', '2.8M tok'], ['Queued', '604k tok'], ['Fallback', '3 routes'], ['Blocked', '0']], 'At pace', '9h runway', 'detailed', { cols: 3, rows: 2, minCols: 2, maxRows: 4 }));
      widgets.push(widget('run-attribution', 'Run attribution', 'current work', 'blue', 2, 4, 'diagnostics', function () {
        return richList(DATA.runs.map(function (run, index) {
          return [run.name, run.agents + ' agents · ' + run.tokens, run.cost, run.state === 'Degraded' ? 'warn' : 'ok', index > 3 ? 'expanded' : '', run.elapsed + ' elapsed'];
        }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: DATA.runs.length  }));
    }
    if (room === 'plans') {
      widgets.push(widget('allowance-attribution', 'Allowance attribution', 'work versus probes', 'purple', 2, 4, 'diagnostics', function () {
        return richList([
          ['User work', 'product runs and chat', '71%', 'ok', '', '611 requests'],
          ['Validation', 'tests and quality gates', '17%', 'ok', '', '146 requests'],
          ['Helpers', 'titles, summaries, routing', '8%', 'ok', '', '69 requests'],
          ['Retries', 'provider and tool retries', '4%', 'warn', '', '34 requests']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: 4  }));
    }
    if (room === 'accounts') {
      widgets.push(widget('credential-ownership', 'Credential ownership', 'routing authority', 'green', 2, 4, 'diagnostics', function () {
        return richList([
          ['System managed', 'OAuth and internal credentials', '4 accounts', 'ok', '', 'no user key tracking'],
          ['User supplied', 'provider API credentials', '1 account', 'ok', '', 'Google AI Studio'],
          ['Plan session', 'provider subscription login', '3 accounts', 'ok', '', 'Claude, Codex, Qwen'],
          ['Recovery needed', 'expired or unavailable', '0', 'ok', '', 'all routes healthy']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: 4  }));
    }
    if (room === 'free') {
      widgets.push(widget('free-throughput', 'Free throughput', '24 hours', 'green', 3, 3, 'detailed', function () {
        return chartPanel([34,31,38,42,40,47,51,49,56,59,55,62,66,63,69,72],
          [['Requests', '188'], ['Tokens', '1.42M'], ['Cooldowns', '1'], ['Local share', '23%'], ['Ready routes', '3'], ['Blocked', '0']],
          'Free-route completions', 'Provider free allowances and local inference are separated from paid usage.');
      }, { kind: 'chart', minCols: 2, maxCols: 5, minRows: 3, maxRows: 5  }));
    }
    if (room === 'analytics') {
      widgets.push(widget('reasoning-mix', 'Reasoning mix', 'reported buckets', 'purple', 3, 3, 'detailed', function () {
        return chartPanel([18,22,20,25,27,24,31,29,34,36,33,39,42,40,44,46],
          [['Visible output', '1.18M'], ['Reasoning', '312k'], ['Unknown', '2 routes'], ['Coverage', '67%'], ['Inclusive', '4 providers'], ['Additive', '0']],
          'Reasoning share', 'Unknown remains unknown; reasoning is not added to inclusive provider totals.');
      }, { kind: 'chart', minCols: 2, maxCols: 5, minRows: 3, maxRows: 5  }));
    }
    if (room === 'ledger') {
      widgets.push(widget('settlement-states', 'Settlement states', state.range, 'green', 2, 4, 'detailed', function () {
        var attempts = projectedAttempts(), counts = {};
        attempts.forEach(function (attempt) { counts[attempt.settlement_status] = (counts[attempt.settlement_status] || 0) + 1; });
        var rows = Object.keys(counts).sort().map(function (status) { return [status, 'independent attempt receipt state', String(counts[status]), status.indexOf('pending') >= 0 ? 'warn' : 'ok', '', attempts.length ? Math.round(counts[status] / attempts.length * 100) + '%' : '0%']; });
        return richList(rows.length ? rows : [['No attempts', 'selected scope and range', '0', 'warn', '', 'no settlement inferred']]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: projectedAttempts().length || 1  }));
    }
    if (room === 'cache') {
      widgets.push(summaryCard('cache-break-even', 'Cache break-even', 'month', 'green', '2.6×', 'avoided spend versus write cost', '+0.3×', '',
        [['Read value', '$318.22'], ['Write cost', '$5.82'], ['Net saved', '$312.40'], ['Coverage', '96.8%']], 'Confidence', 'catalog weighted', 'diagnostics', { cols: 3, rows: 2, minCols: 2, maxRows: 4 }));
    }
    if (room === 'tools') {
      widgets.push(widget('operations-window', 'Maintenance & operations', '24 hours', 'blue', 2, 5, 'diagnostics', function () {
        return richList([
          ['CLI update', 'Codex CLI · rolled back', '14:22', 'warn', '', 'receipt ops-1'],
          ['Offline replay', 'client outbox recovered', '12:06', 'ok', '', '41 events'],
          ['Server continuity', 'Home Server kept running', '08:40', 'ok', '', '3 jobs'],
          ['Project backup', 'Project Vault snapshot', '03:15', 'ok', '', 'verified'],
          ['Environment check', 'cluster and WSL reachable', '00:41', 'ok', '', '2 hosts']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: 5  }));
    }
    if (room === 'authority') {
      widgets.push(widget('pricing-provenance', 'Pricing provenance', 'current range', 'orange', 2, 4, 'detailed', function () {
        return richList([
          ['Provider invoice', 'direct billed charges', '312 events', 'ok', '', '99.4% priced'],
          ['Plan catalog', 'included subscription value', '549 events', 'ok', '', 'catalog v18'],
          ['Local estimate', 'cache savings projection', '4 routes', 'warn', '', 'confidence 87%'],
          ['Unpriced', 'no usable catalog entry', '3 events', 'warn', '', '0.02%']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 6, contentCount: 4  }));
    }

    /* Round 8 restores information families that remained in the original U11
       concept but were still absent from the simplified port. They are focused
       Detailed/Diagnostics panels so the default board remains calm. */
    if (room === 'overview') {
      widgets.push(summaryCard('capacity-reservations', 'Capacity reservations', 'current runs', 'purple', '9 / 12', 'worker slots reserved', '3 available', '',
        [['Requested', '12'], ['Admitted', '9'], ['Queued', '3'], ['Reserved tokens', '604k'], ['Reserved spend', '$8.40'], ['Longest wave', '6 agents']], 'Forecast basis', 'completion capacity', 'detailed', { cols: 2, rows: 3, minCols: 2, maxRows: 4 }));
    }
    if (room === 'plans') {
      widgets.push(widget('counting-basis', 'Counting basis', 'inclusive versus additive', 'purple', 2, 5, 'diagnostics', function () {
        return richList([
          ['Claude Code', 'cache read is inside input', 'inclusive', 'ok', '', 'reasoning inside output'],
          ['Codex', 'cache read is inside input', 'inclusive', 'ok', '', 'reasoning inside output'],
          ['Qwen Coding Plan', 'cache reported separately', 'additive', 'warn', '', 'reasoning bucket separate'],
          ['Gemini Direct', 'input and output published', 'partial', 'warn', '', 'cache basis not published'],
          ['Kimi Coding Plan', 'input plus output', 'inclusive', 'ok', '', 'provider basis named'],
          ['GitHub Copilot', 'request allowance only', 'not exposed', 'warn', '', 'token total stays unknown']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 6 }));
      widgets.push(widget('native-allowance-units', 'Native allowance units', 'provider semantics', 'blue', 2, 5, 'diagnostics', function () {
        return richList([
          ['Claude Code', 'five-hour and weekly windows', 'percent used', 'ok', '', 'reset 1h 42m'],
          ['Codex', 'five-hour and weekly windows', 'percent used', 'ok', '', 'reset 3h 18m'],
          ['Qwen Coding Plan', 'weekly allowance', 'percent used', 'ok', '', 'reset 2d 6h'],
          ['Gemini Direct', 'monthly billed budget', 'USD', 'ok', '', 'September 1'],
          ['Kimi Coding Plan', 'weekly allowance', 'percent used', 'ok', '', 'reset 4d 11h'],
          ['GitHub Copilot', 'premium requests', 'requests', 'ok', '', 'September 1']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 6 }));
    }
    if (room === 'costs') {
      widgets.push(widget('cost-authority', 'Cost authority', 'one billing model', 'green', 2, 5, 'detailed', function () {
        return richList([
          ['API billed', 'provider invoices and settled receipts', money(costs.api), 'ok', '', 'counts against spending limit'],
          ['Plan included', 'subscription-covered work', money(costs.plans), 'ok', '', 'does not count against limit'],
          ['Cache avoided', 'catalog-priced PM estimate', money(costs.saved), 'warn', '', 'explicit estimate'],
          ['Unpriced', 'no usable catalog version', '3 events', 'warn', '', 'excluded from billed total'],
          ['Spending limit', 'user controlled', money(costs.budget), 'ok', '', 'not a provider allowance']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
      widgets.push(summaryCard('burn-basis', 'Burn basis', 'forecast inputs', 'orange', money(costs.burn) + '/d', 'current daily burn', '87% confidence', 'warn',
        [['Provider charges', money(costs.api)], ['Plan allocation', money(costs.plans)], ['Unpriced', '3 events'], ['Time zone', 'local 24h'], ['Month end', money(costs.forecast)], ['Overage buffer', money(costs.overage)]], 'Next refresh', '40s', 'diagnostics', { cols: 2, rows: 3, minCols: 2 }));
    }
    if (room === 'accounts') {
      widgets.push(widget('route-mismatches', 'Requested versus effective', 'fallback evidence', 'orange', 2, 5, 'detailed', function () {
        return richList([
          ['Tastebook build', 'requested Claude Code', 'Claude · Work', 'ok', '', 'no mismatch'],
          ['Vision helper', 'requested primary code', 'Gemini Direct', 'warn', '', 'capability fallback'],
          ['Fast edit', 'requested Claude Code', 'Codex Personal', 'warn', '', 'allowance pressure'],
          ['Long context', 'requested Codex', 'Qwen Work', 'warn', '', 'context fit'],
          ['Completion', 'requested Qwen', 'Copilot Work', 'warn', '', 'completion-only route']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
      widgets.push(widget('connection-authority', 'Connection authority', 'credential and receipt source', 'green', 2, 5, 'diagnostics', function () {
        return richList(visibleAccounts().map(function (account, index) {
          return [account.name, account.auth + ' · ' + account.scope, account.last, index === 3 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', 'connection receipt'];
        }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: DATA.accounts.length }));
    }
    if (room === 'free') {
      widgets.push(widget('cooldown-eligibility', 'Cooldown and eligibility', 'free-route state', 'orange', 2, 5, 'detailed', function () {
        return richList(DATA.free.map(function (route, index) {
          var cooling = route[1].indexOf('Cooldown') >= 0;
          return [route[0], route[3] + ' context · ' + route[2], cooling ? 'wait 40m' : 'eligible', cooling ? 'warn' : 'ok', index > 3 ? 'expanded' : '', route[4]];
        }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: DATA.free.length }));
      widgets.push(widget('free-source-state', 'Free source state', 'catalog versus local', 'purple', 2, 4, 'diagnostics', function () {
        return richList([
          ['Provider free allowance', 'remote catalog and receipts', '3 routes', 'ok', '', 'catalog age 2m'],
          ['Local inference', 'device-reported capacity', '1 route', 'ok', '', 'RX 7900 XTX'],
          ['Cooldown authority', 'provider reset clock', '1 active', 'warn', '', 'Qwen3-Coder-Free'],
          ['Unknown eligibility', 'no usable probe result', '0', 'ok', '', 'not treated as zero']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 8, contentCount: 4 }));
    }
    if (room === 'context') {
      widgets.push(widget('context-composition', 'Context composition', 'current thread', 'blue', 2, 5, 'detailed', function () {
        return richList(DATA.context.labels.map(function (label, index) {
          return [label, index === 0 ? 'conversation turns' : index === 1 ? 'system and goal instructions' : index === 2 ? 'tool results and schemas' : index === 3 ? 'loaded skills' : 'durable memory', DATA.context.segments[index] + '%', 'ok', index > 4 ? 'expanded' : '', Math.round(DATA.context.used * DATA.context.segments[index] / 100 / 100) / 10 + 'k'];
        }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: DATA.context.labels.length }));
      widgets.push(widget('compaction-history', 'Compaction history', 'current thread', 'purple', 2, 5, 'diagnostics', function () {
        return richList([
          ['15:47', 'automatic threshold compaction', '18.6k', 'ok', '', 'messages and tool results'],
          ['13:22', 'manual Compact Now', '9.4k', 'ok', '', 'no pinned context removed'],
          ['Yesterday', 'handoff compaction', '31.2k', 'ok', '', 'goal state retained'],
          ['Reserved output', 'current route guarantee', '16k', 'ok', '', 'not reclaimable']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 3, maxRows: 8, contentCount: 4 }));
    }
    if (room === 'analytics') {
      widgets.push(widget('token-counting-basis', 'Token counting basis', 'provider semantics', 'purple', 2, 6, 'diagnostics', function () {
        return richList([
          ['Inclusive input', 'cache read already included', '4 routes', 'ok', '', 'never added twice'],
          ['Additive cache', 'cache read is separate', '1 route', 'warn', '', 'added only where published'],
          ['Inclusive reasoning', 'reasoning inside output', '3 routes', 'ok', '', 'not added again'],
          ['Additive reasoning', 'separate provider bucket', '1 route', 'warn', '', 'named explicitly'],
          ['Unpublished basis', 'input plus output only', '1 route', 'warn', '', 'total labeled partial'],
          ['Missing provider count', 'unknown rather than zero', '4 events', 'warn', '', 'excluded from total']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 6 }));
      widgets.push(summaryCard('unknown-token-buckets', 'Unknown token buckets', 'current range', 'orange', '4', 'events without provider counts', 'not zero', 'warn',
        [['Input unknown', '1'], ['Output unknown', '1'], ['Cache unavailable', '2'], ['Reasoning unknown', '4'], ['Partial totals', '3'], ['Excluded totals', '4']], 'Policy', 'preserve unknown', 'diagnostics', { cols: 2, rows: 3, minCols: 2 }));
    }
    if (room === 'ledger') {
      widgets.push(widget('attempt-lineage', 'Attempt lineage', state.range + ' receipt chain', 'blue', 2, 6, 'detailed', function () {
        var attempts = projectedAttempts();
        return richList(attempts.map(function (attempt, index) { return [attempt.attempt_id, attempt.provider_id + ' · ' + attempt.account_id, attempt.effective_route_id, attempt.settlement_status.indexOf('pending') >= 0 ? 'warn' : 'ok', index > 5 ? 'expanded' : '', attempt.settlement_status]; }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: projectedAttempts().length }));
      widgets.push(widget('usage-record-state', 'Usage record state', state.range + ' settlement lifecycle', 'purple', 2, 5, 'diagnostics', function () {
        var attempts = projectedAttempts(), counts = {};
        attempts.forEach(function (attempt) { counts[attempt.settlement_status] = (counts[attempt.settlement_status] || 0) + 1; });
        return richList(Object.keys(counts).sort().map(function (status) { return [status, 'attempt receipt authority', String(counts[status]), status.indexOf('pending') >= 0 ? 'warn' : 'ok', '', 'never inferred from billing or entitlement']; }));
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: projectedAttempts().length }));
    }
    if (room === 'tools') {
      widgets.push(widget('tool-allowance', 'Tool allowance impact', 'provider-bearing calls', 'orange', 2, 5, 'diagnostics', function () {
        return richList([
          ['browser_exec', 'Gemini vision helper route', '68 calls', 'warn', '', 'counts against API budget'],
          ['run_shell_command', 'no provider usage', '284 calls', 'ok', '', 'local tool only'],
          ['read_file', 'context-bearing output', '1.9M tok', 'ok', '', 'affects context, not allowance'],
          ['image_gen', 'metered image generation', '$3.62', 'warn', '', 'separate billed surface'],
          ['git', 'no provider usage', '71 calls', 'ok', '', 'local tool only']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
      widgets.push(widget('catalog-refresh', 'Catalog refresh', 'never active probing', 'green', 2, 5, 'diagnostics', function () {
        return richList([
          ['Provider catalog', 'official pricing and model metadata', '2h old', 'ok', '', 'version 18'],
          ['Free allowance catalog', 'provider published limits', '2m old', 'ok', '', '4 routes'],
          ['CLI capability probe', 'installation feature state', '20m old', 'ok', '', 'no usage fabricated'],
          ['Failed probe', 'statistics command unavailable', '1 route', 'warn', '', 'usage stays unknown'],
          ['Next refresh', 'scheduled metadata fetch', '40s', 'ok', '', 'not a model call']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
    }
    if (room === 'signals') {
      widgets.push(widget('signal-authority-map', 'Signal authority map', 'reading provenance', 'purple', 2, 5, 'diagnostics', function () {
        return richList([
          ['Allowance', 'provider receipt or plan session', 'direct', 'ok', '', '4 routes'],
          ['Reset clock', 'provider reported', 'direct', 'ok', '', '4 routes'],
          ['Spend', 'provider invoice', 'direct', 'ok', '', '1 route'],
          ['Forecast', 'local-time pace model', 'estimate', 'warn', '', 'confidence 87%'],
          ['Cache savings', 'catalog price model', 'estimate', 'warn', '', 'labeled derived']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
    }
    if (room === 'authority') {
      widgets.push(widget('provider-probe-state', 'Provider probe state', 'per installation', 'orange', 2, 6, 'diagnostics', function () {
        return richList([
          ['Claude CLI', 'allowance and reset available', 'reported', 'ok', '', 'OAuth plan session'],
          ['Codex CLI', 'allowance and cache available', 'reported', 'ok', '', 'ChatGPT plan session'],
          ['Qwen CLI', 'weekly allowance available', 'reported', 'ok', '', 'coding plan session'],
          ['Gemini API', 'spend available; quota partial', 'partial', 'warn', '', 'API key route'],
          ['Copilot CLI', 'token statistics unavailable', 'unknown', 'warn', '', 'request allowance only'],
          ['Local Qwen', 'device capacity only', 'local', 'ok', '', 'no provider billing authority']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 6 }));
      widgets.push(widget('unknown-versus-zero', 'Unknown versus zero', 'reporting semantics', 'blue', 2, 5, 'diagnostics', function () {
        return richList([
          ['Measured zero', 'provider returned the field and value 0', 'valid 0', 'ok', '', 'retained as zero'],
          ['Not exposed', 'provider has no usable field', '—', 'warn', '', 'not converted to zero'],
          ['Probe unavailable', 'command failed or is missing', 'unknown', 'warn', '', 'no figure derived'],
          ['Not applicable', 'route cannot report this bucket', 'n/a', 'ok', '', 'excluded from total'],
          ['Estimated', 'Puppet Master derived reading', 'labeled', 'warn', '', 'never shown as provider reported']
        ]);
      }, { kind: 'list', minCols: 2, maxCols: 4, minRows: 4, maxRows: 8, contentCount: 5 }));
    }
    return widgets;
  }

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
    if (id === 'burn-basis') item.render = function () { var records=projectedAttempts(), costs=projectedCosts(); return summary({value:money(costs.burn)+'/d',label:'24h equivalent from selected records',trend:records.length+' attempts',cells:[['Settled charge',money(costs.api)],['Plan estimate',money(costs.plans)],['Pending',String(costs.pending)],['Window hours',String(rangeHours())]],footerLeft:scopeCaption(),footerRight:'projection only',bars:orderedAttemptSeries(records,'charge').map(function (charge) { return Math.round(charge * 100); }),barFormatter:'money-cents',signalLabel:'selected settled charges'}); };
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

  function curatedSizes(item) {
    if (item.sizes && item.sizes.length) return item.sizes;
    var source = PRESETS[item.kind] || PRESETS.instrument;
    return source.filter(function (preset) {
      return preset[0] >= item.minCols && preset[0] <= item.maxCols && preset[1] >= item.minRows && preset[1] <= item.maxRows;
    });
  }

  function roomWidgets(room) {
    var providers = visibleProviders();
    var costs = projectedCosts();
    var context = DATA.context;
    var widgets = [];

    if (room === 'overview') {
      widgets = [
        summaryCard('health', 'Usage health', '6 routes', 'green', '92.4%', 'provider readings healthy', '+1.8%', '', [['Fresh', '6 / 6'], ['Warnings', '2'], ['Sync age', '20s'], ['Unpriced', '0.02%']], 'All routes', 'within policy'),
        summaryCard('month', 'Selected window value', state.range, 'orange', money(costs.selected), 'attempt-backed charge plus plan allocation', costs.attempts+' attempts', '', [['Settled API', money(costs.api)], ['Plan estimate', money(costs.plans)], ['Cache estimate', money(costs.saved)], ['Pending', String(costs.pending)]], 'Projection basis', costs.window_label),
        summaryCard('cache-saved', 'Cache savings', 'estimated', 'green', money(costs.saved), 'avoided repeat input', '96.8%', '', [['Read', '6.29M'], ['Write', '347k'], ['Best route', 'Codex'], ['Low route', 'Gemini']], '30-day gain', '+12.4%'),
        summaryCard('active-runs', 'Active runs', 'right now', 'blue', '3', 'runs across 9 agents', '2 queued', '', [['Agents', '9'], ['Nodes', '47'], ['Oldest', '38m'], ['Projected', '$8.40']], 'Run 47', '6 specialists')
      ].concat(providers.slice(0, 4).map(providerCard));
      widgets.push(widget('context-now', 'Context window', 'current thread', 'blue', 3, 3, 'glance', contextPanel, { kind: 'instrument', minCols: 3 }));
      widgets.push(widget('budget-now', 'Budget projection', state.range, 'green', 3, 3, 'glance', function () {
        var remaining = Math.max(0, costs.budget - costs.forecast), used = Math.round(costs.forecast / costs.budget * 100);
        return instrument({ name: 'Monthly budget', subtitle: 'projection from ' + costs.window_label, value: money(remaining), valueLabel: 'projected remaining', statusClass: used > 90 ? 'warn' : 'ok', stats: [['Selected value', money(costs.selected)], ['Forecast estimate', money(costs.forecast)], ['Overage risk', money(costs.overage)], ['Attempts', String(costs.attempts)], ['24h equivalent', money(costs.burn)], ['Budget', money(costs.budget)]], meters: [['Forecast used', money(costs.forecast), used, used > 90 ? 'orange' : 'green'], ['Plan allocation share', costs.planUtil + '%', costs.planUtil, 'purple']], footerLeft: 'Budget ' + money(costs.budget), footerRight: 'estimate', action: 'budget' });
      }, { kind: 'instrument', minCols: 3 }));
      widgets.push(widget('plan-value-now', 'Plan allocation', state.range, 'purple', 3, 3, 'glance', function () {
        var records = projectedAttempts(), planRecords = records.filter(function (attempt) { return attempt.billing_basis === 'subscription'; });
        return instrument({ name: 'Estimated plan allocation', subtitle: 'explicit values on selected attempts', value: costs.planUtil + '%', valueLabel: 'value share', statusClass: 'ok', stats: [['Plan estimate', money(costs.plans)], ['Settled API', money(costs.api)], ['Plan attempts', String(planRecords.length)], ['Metered attempts', String(records.length-planRecords.length)], ['Plan providers', String(distinctCount(planRecords,'provider_id'))], ['Selected tokens', tok(projectionTotals(records).tokens)]], meters: [['Plan allocation', costs.planUtil + '%', costs.planUtil, 'purple'], ['Metered API', costs.apiUtil + '%', costs.apiUtil, 'orange']], footerLeft: costs.window_label, footerRight: 'estimate', action: 'coverage' });
      }, { kind: 'instrument', minCols: 3 }));
      widgets.push(widget('attention-now', 'Attention', '2 current', 'warn', 3, 4, 'glance', function () {
        return richList(DATA.alerts.map(function (alert, index) { return [alert.title, alert.detail, alert.time, alert.state === 'warn' ? 'warn' : 'ok', index > 2 ? 'standard' : '', alert.owner]; }), true);
      }, { kind: 'list', minCols: 3, contentCount: DATA.alerts.length, maxRows: 5 }));
      widgets.push(widget('forecast', 'Spend projection', state.range + ' basis', 'orange', 4, 3, 'detailed', function () { return chartPanel(projectedAttempts().map(function (attempt) { return Math.round((attempt.charge + attempt.plan_allocation_estimate) * 100); }), [['30d projection', money(costs.forecast)], ['Budget', money(costs.budget)], ['Selected value', money(costs.selected)], ['Attempts', String(costs.attempts)]], 'Attempt value sequence', 'Projection uses explicit attempt charges and labeled plan-allocation estimates.', 'money-cents'); }, { kind: 'chart', minCols: 3, minRows: 2 }));
      widgets.push(widget('route-pressure', 'Route pressure', 'current pace', 'orange', 4, 3, 'detailed', function () { return richList(providers.slice().sort(function (a,b) { return b.used-a.used; }).map(function (provider,index) { return [provider.name, provider.primaryLabel + ' · ' + provider.forecast, provider.used + '%', provider.used > 72 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', provider.pace]; })); }, { kind: 'list', minCols: 3, minRows: 2, contentCount: providers.length }));
      widgets.push(summaryCard('next-reset', 'Next reset', 'allowance clock', 'blue', '1h 42m', 'Claude five-hour window', '78% used', 'warn', [['Route', 'Claude Code'], ['Plan', 'Max · Work'], ['Weekly', '4d 11h'], ['Forecast', '90% in 54m']], 'After reset', 'full window', 'detailed', { cols: 4, rows: 3, minCols: 2 }));
    } else if (room === 'plans') {
      widgets = providers.map(providerCard);
      widgets.push(widget('reset-map', 'Upcoming resets', 'next 7 days', 'blue', 3, 4, 'detailed', function () { return richList(providers.slice().sort(function (a,b) { return b.used-a.used; }).map(function (provider,index) { return [provider.name, provider.primaryLabel + ' · ' + provider.used + '% used', provider.reset, provider.used > 72 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', provider.weeklyReset + ' weekly']; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));
      widgets.push(widget('plan-settlement', 'Billing, entitlement, settlement', state.range, 'green', 3, 4, 'detailed', function () { return richList(providers.map(function (provider,index) { var metrics=providerMetrics(provider); return [provider.name, provider.billing_basis + ' · ' + provider.entitlement_class, metrics.settlement_summary, metrics.settlement_summary.indexOf('pending') >= 0 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', metrics.requests + ' attempt-backed requests']; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));
      widgets.push(widget('plan-pressure', 'Pressure order', 'current pace', 'orange', 3, 4, 'diagnostics', function () { return richList(providers.slice().sort(function (a,b) { return b.used-a.used; }).map(function (provider,index) { return [provider.name, provider.pace, provider.status === 'watch' ? 'watch' : 'healthy', provider.status === 'watch' ? 'warn' : 'ok', index > 4 ? 'expanded' : '', provider.forecast]; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));
      widgets.push(widget('plan-authority', 'Allowance authority', 'diagnostics', 'purple', 3, 4, 'diagnostics', function () { return richList(DATA.authority.slice(0,6).map(function (row,index) { return [row[0], row[3], row[2], row[1].indexOf('estimate') >= 0 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', row[1]]; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: Math.min(6, DATA.authority.length), maxRows: 6 }));
    } else if (room === 'costs') {
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
      widgets.push(widget('cost-trend', 'Attempt value sequence', state.range, 'orange', 4, 3, 'detailed', function () { return chartPanel(costAttempts.map(function (attempt) { return Math.round((attempt.charge + attempt.plan_allocation_estimate) * 100); }), [['Selected', money(costs.selected)], ['30d projection', money(costs.forecast)], ['Budget', money(costs.budget)], ['24h equivalent', money(costs.burn)]], 'Attempt value sequence', 'Settled charges and labeled allocation estimates remain separate fields.', 'money-cents'); }, { kind: 'chart', minCols: 3, minRows: 2 }));
      widgets.push(widget('provider-cost', 'Provider value', state.range, 'purple', 4, 4, 'diagnostics', function () { return richList(providers.map(function (provider,index) { var metrics=providerMetrics(provider); return [provider.name, provider.billing_basis + ' · ' + metrics.attempts + ' attempts', money(metrics.cost + metrics.plans), metrics.settlement_summary.indexOf('pending') >= 0 ? 'warn' : 'ok', index > 4 ? 'expanded' : '', 'API ' + money(metrics.cost) + ' · plan estimate ' + money(metrics.plans)]; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: providers.length, maxRows: 6 }));
      widgets.push(widget('pricing-confidence', 'Value authority', state.range, 'green', 4, 4, 'diagnostics', function () { return richList([['Settled API', 'direct attempt receipt amount', money(costs.api), 'ok', '', costs.settled + ' settled attempts'], ['Plan allocation', 'explicit per-attempt estimate', money(costs.plans), 'warn', '', planAttempts.length + ' attempts'], ['Cache avoided', 'explicit per-attempt estimate', money(costs.saved), 'warn', '', costAttempts.length + ' attempts'], ['Pending settlement', 'not promoted to settled charge', String(costs.pending), costs.pending ? 'warn' : 'ok', '', 'independent settlement axis']]); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: 4, maxRows: 5 }));
    } else if (room === 'accounts') {
      widgets = visibleAccounts().map(accountCard);
      widgets.push(widget('routing', 'Account routing', 'current', 'blue', 3, 4, 'detailed', function () { return richList([['Code work', 'Claude · Work · Max', 'primary', 'ok', '', 'requested and effective match'], ['Fast edits', 'Codex · Personal', 'fallback', 'ok', '', 'latency preference'], ['Long context', 'Qwen · Work', 'secondary', 'ok', '', 'context fit'], ['Vision helper', 'Gemini · Work', 'helper', 'ok', '', 'vision-only route'], ['Completion', 'GitHub · Work', 'fallback', 'ok', '', 'editor completion']]); }, { kind: 'list', minCols: 2, minRows: 3, contentCount: 5, maxRows: 6 }));
      widgets.push(widget('account-fallbacks', 'Fallback reasons', 'last 24h', 'orange', 3, 4, 'detailed', function () { return richList([['Rate-limit pressure', 'Claude to Codex', '4', 'warn', '', 'requested account unchanged'], ['Vision requirement', 'Claude to Gemini', '11', 'ok', '', 'capability route'], ['Context fit', 'Codex to Qwen', '3', 'ok', '', 'long-window route'], ['Credential unavailable', 'Personal to Work', '1', 'warn', '', 'automatic recovery']]); }, { kind: 'list', minCols: 2, minRows: 3, contentCount: 4, maxRows: 6 }));
    } else if (room === 'free') {
      widgets = DATA.free.map(freeCard);
      widgets.push(widget('free-route', 'Fallback order', 'free routes', 'blue', 3, 4, 'detailed', function () { return richList(DATA.free.map(function (route,index) { return [(index+1)+'. '+route[0], route[1]+' · '+route[3], route[4], route[1].indexOf('Cooldown')>=0?'warn':'ok', index>4?'expanded':'', route[2]]; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: DATA.free.length, maxRows: 6 }));
      widgets.push(widget('free-history', 'Free usage', '7 days', 'green', 4, 3, 'diagnostics', function () { return chartPanel([18,36,24,48,42,65,54,72,61,58,76,69,82,74], [['Calls', '318'], ['Tokens', '2.4M'], ['Avoided', '$31.20'], ['Cooldowns', '4']], 'Free-route demand', 'Cooldowns are shown against successful free-route use.'); }, { kind: 'chart', minCols: 3, minRows: 2 }));
    } else if (room === 'context') {
      widgets = [
        widget('ctx-window', 'Current window', 'thread main', 'blue', 3, 3, 'glance', contextPanel, { kind: 'instrument', minCols: 3 }),
        summaryCard('ctx-cache', 'Context cache hit', 'current thread', 'green', context.cache.toFixed(1)+'%', 'effective prompt cache', '+2.1', '', [['Read',tok(context.input)],['Write',tok(context.output)],['Route','Claude'],['Age','20s']], 'Savings', '$1.82', 'glance', { cols: 2, rows: 2, minCols: 2 }),
        summaryCard('ctx-reclaim', 'Compactable', 'current thread', 'purple', tok(context.reclaim), context.compacted ? 'no tokens currently reclaimable' : 'tokens reclaimable', context.compacted ? 'done' : 'safe', '', [['Pinned',tok(context.pinned)],['Mutable',tok(context.mutable)],['Reserve',tok(context.reserved)],['Last compact',context.last_compact]], context.compacted ? 'Current' : 'Result', tok(context.compacted ? context.used : context.used-context.reclaim)+' used', 'glance', { cols: 2, rows: 2, minCols: 2 }),
        summaryCard('ctx-output', 'Output reserve', 'current thread', 'orange', tok(context.reserved), 'tokens held for response', '12.5%', '', [['Window','128k'],['Loaded',tok(context.used)],['Available',tok(context.limit-context.used)],['Hard stop','112k']], 'Current model', 'Sonnet 4.6', 'glance', { cols: 2, rows: 2, minCols: 2 }),
        summaryCard('ctx-route', 'Effective route', 'current thread', 'blue', 'Sonnet', 'requested Opus unavailable', 'fallback', 'warn', [['Requested','Opus 4.6'],['Effective','Sonnet 4.6'],['Reason','rate limited'],['Cache','reused']], 'Receipt', 'recorded', 'glance', { cols: 3, rows: 2, minCols: 2 })
      ];
      widgets.push(widget('ctx-sources', 'Source mix', tok(context.used)+' tokens', 'blue', 3, 4, 'detailed', function () { return richList(context.labels.map(function (label,index) { return [label, context.segments[index]+'% of current context', tok(Math.round(context.used*context.segments[index]/100)), '', index>4?'expanded':'', index===0?'conversation history':'loaded context']; })); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: context.labels.length, maxRows: 6 }));
      widgets.push(widget('ctx-limits', 'Model limits', 'effective routes', 'orange', 3, 4, 'detailed', function () { return richList([['Sonnet 4.6','current · 16k output reserve','128k','ok','','effective route'],['GPT-5.4','fallback · 32k output reserve','200k','ok','','secondary route'],['Qwen3 Coder','long context','256k','ok','','context route'],['Gemini 3.1 Pro','vision helper','1M','ok','','capability route']]); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: 4, maxRows: 6 }));
      widgets.push(widget('ctx-maint', 'Maintenance history', 'last 24h', 'purple', 3, 4, 'diagnostics', function () { return richList([['Context compacted','18.6k reclaimed','15:47','ok','','automatic threshold'],['Model switch repack','cache rebuilt','13:22','ok','','route change'],['Local prune','4.2k reclaimed','10:04','ok','','tool transcript'],['Pinned refresh','instructions updated','08:40','ok','','policy refresh']]); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: 4, maxRows: 6 }));
      widgets.push(widget('ctx-routing', 'Routing trace', 'requested vs effective', 'green', 3, 4, 'diagnostics', function () { return richList([['Requested model','Claude Opus 4.6','request','ok','','thread preference'],['Effective model','Claude Sonnet 4.6','selected','ok','','rate-limit fallback'],['Output reserve','16k tokens','held','ok','','response budget'],['Cache disposition','prefix reused','96.8%','ok','','provider reading']]); }, { kind: 'list', minCols: 2, minRows: 2, contentCount: 4, maxRows: 6 }));
    } else if (room === 'analytics') {
      widgets = providers.map(function (provider) { var metrics=providerMetrics(provider); return summaryCard('tok-'+provider.id, provider.name, state.range+' attempt records', provider.tone, tok(metrics.tokens), 'input plus output', metrics.requests+' calls', '', [['Input',tok(metrics.input)],['Output',tok(metrics.output)],['Attempts',String(metrics.attempts)],['Output ratio',metrics.tokens?Math.round(metrics.output/metrics.tokens*100)+'%':'n/a']], metrics.allowance_authority, metrics.allowance_freshness, 'glance', { cols: 2, rows: 2, minCols: 2 }); });
      widgets.push(widget('token-trend', 'Token volume', state.range, 'blue', 4, 3, 'detailed', function () { return chartPanel([19,26,31,28,40,37,49,55,46,62,58,67,73,69,79,84,76,88,82,92], [['Input','7.1M'],['Output','1.2M'],['Cache read','5.4M'],['Peak hour','15:00']], 'Token volume', 'Input, output, and cache reads remain separately attributable.'); }, { kind: 'chart', minCols: 3, minRows: 2 }));
      widgets.push(widget('model-mix', 'Model mix', 'attempts', 'purple', 4, 3, 'detailed', function () { return richList([['Sonnet 4.6','42% of attempts','3.8M','','','primary code'],['GPT-5.4','28% of attempts','2.4M','','','fast-edit fallback'],['Qwen3 Coder','18% of attempts','1.5M','','','long context'],['Other','12% of attempts','0.9M','','','specialists']]); }, { kind: 'list', minCols: 3, minRows: 2, contentCount: 4, maxRows: 5 }));
      widgets.push(widget('cache-read-share', 'Cache-read share', state.range, 'green', 4, 3, 'detailed', function () { return chartPanel([48,51,54,58,61,63,66,69,72,74,78,81,83,86,88,91,94,96], [['Read','5.4M'],['Write','347k'],['Hit rate','96.8%'],['Saved',money(costs.saved)]], 'Cache-read share', 'A higher share reduces repeated input settlement.'); }, { kind: 'chart', minCols: 3, minRows: 2 }));
    } else if (room === 'ledger') {
      var ledgerAttempts = projectedAttempts();
      var ledgerProviders = {}, ledgerAccounts = {}, ledgerRoutes = {}, pendingCount = 0;
      ledgerAttempts.forEach(function (attempt) { ledgerProviders[attempt.provider_id] = true; ledgerAccounts[attempt.account_id] = true; ledgerRoutes[attempt.effective_route_id] = true; if (attempt.settlement_status.indexOf('pending') >= 0) pendingCount += 1; });
      widgets = [
        widget('ledger-main', 'Recent attempts', state.range, 'blue', 4, 4, 'glance', function () { return richList(ledgerAttempts.map(function (attempt,index) { return ['Usage attempt', attempt.provider_id + ' · ' + attempt.model_id, new Date(attempt.occurred_at).toLocaleString(), attempt.settlement_status.indexOf('pending') >= 0 ? 'warn' : 'ok', index>5?'expanded':'', attempt.attempt_id + ' · ' + attempt.settlement_status]; }), true); }, { kind: 'list', minCols: 3, minRows: 3, contentCount: ledgerAttempts.length, maxRows: 6 }),
        summaryCard('ledger-count','Attempts',state.range,'blue',String(ledgerAttempts.length),'identity-bound usage attempts','records','',[['Settled',String(ledgerAttempts.length-pendingCount)],['Pending',String(pendingCount)],['Providers',String(Object.keys(ledgerProviders).length)],['Accounts',String(Object.keys(ledgerAccounts).length)]],'Projection','selected records','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-errors','Pending settlement',state.range,'orange',String(pendingCount),'attempt receipts not final',pendingCount?'open':'clear',pendingCount?'warn':'',[['Pending',String(pendingCount)],['Unknown','0'],['Inferred','0'],['Dropped','0']],'Policy','preserve state','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-routes','Effective routes',state.range,'green',String(Object.keys(ledgerRoutes).length),'stable effective route identities','attempt backed','',[['Providers',String(Object.keys(ledgerProviders).length)],['Accounts',String(Object.keys(ledgerAccounts).length)],['Attempts',String(ledgerAttempts.length)],['Unknown','0']],'Coverage',ledgerAttempts.length?'100%':'n/a','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('ledger-export','Receipts',state.range,'purple',String(ledgerAttempts.length),'attempt records available','JSON','',[['Attempts',String(ledgerAttempts.length)],['Providers',String(Object.keys(ledgerProviders).length)],['Redacted','0'],['Missing axes','0']],'Export','selected records','diagnostics',{cols:2,rows:2,minCols:2})
      ];
      widgets.push(summaryCard('ledger-coverage','Identity coverage',state.range,'green',ledgerAttempts.length?'100%':'n/a','attempts with all stable identity axes',ledgerAttempts.length+' records','',[['Attempts',String(ledgerAttempts.length)],['Providers',String(Object.keys(ledgerProviders).length)],['Accounts',String(Object.keys(ledgerAccounts).length)],['Unknown route','0']],'Authority','attempt fixture','diagnostics',{cols:2,rows:2,minCols:2}));
    } else if (room === 'attention') {
      widgets = DATA.alerts.map(function (alert,index) { return widget('alert-'+index, alert.title, alert.time, alert.state==='warn'?'warn':'green', 3, 3, 'glance', function () { return instrument({ name: alert.title, subtitle: alert.detail, value: alert.score+'%', valueLabel: alert.state==='warn'?'attention':'healthy', statusClass: alert.state==='warn'?'warn':'ok', stats: [['Owner',alert.owner],['Observed',alert.time],['Disposition',alert.state==='warn'?'route watch':'no action'],['Scope','all routes'],['Threshold',alert.score>70?'crossed':'clear'],['Receipt','linked']], meters: [['Current pressure',alert.time,alert.score,alert.state==='warn'?'orange':'green'],['Baseline','24-hour norm',Math.max(18,alert.score-18),'']], footerLeft: alert.state==='warn'?'Review route':'Within policy', footerRight: alert.owner, action:'alert-'+index }); }, { kind:'instrument', minCols:3 }); });
      widgets.push(widget('anom','Anomaly comparison','24h','orange',4,3,'detailed',function(){return chartPanel([22,18,21,24,23,27,30,29,42,68,77,54,43,38,33,31],[['Current','+18%'],['Baseline','normal'],['Peak','15:00'],['Cause','vision calls']],'Observed vs baseline','The spike is limited to vision-helper traffic.');},{kind:'chart',minCols:3,minRows:2}));
      widgets.push(widget('attention-history','Alert history','7 days','blue',4,3,'detailed',function(){return chartPanel([18,14,22,19,31,26,24,38,28,44,32,29,47,36],[['Raised','11'],['Resolved','9'],['Open','2'],['Median','18m']],'Alert volume','Only actionable provider and pricing signals are counted.');},{kind:'chart',minCols:3,minRows:2}));
      widgets.push(summaryCard('attention-policy','Policy state','current','green','4 / 4','alert rules reporting','healthy','',[['Allowance','on'],['Pricing','on'],['Freshness','on'],['Fallback','on']],'Last review','2d','detailed',{cols:4,rows:3,minCols:2}));
    } else if (room === 'cache') {
      widgets = DATA.cache.map(function (route,index) { return widget('cache-'+index, route[0], 'prompt cache', index===3?'orange':'green', 3, 3, 'glance', function () { var pct=parseFloat(route[1]); return instrument({ name:route[0], subtitle:'prompt cache', value:route[1], valueLabel:'effective hit', statusClass:pct<88?'warn':'ok', stats:[['Savings',route[2]],['Read',route[3]],['Write',route[4]],['Authority',index===3?'estimated':'reported'],['Age','20s'],['Scope','current route']], meters:[['Hit rate',route[2],pct,pct<88?'orange':'green'],['Write efficiency',route[4],Math.min(100,pct-8),''],['Read share',route[3],Math.min(100,pct+2),'green']], footerLeft:'Last sync 20s',footerRight:index===3?'estimate':'provider',action:'cache-'+index}); }, {kind:'instrument',minCols:3}); });
      widgets.push(widget('cache-trend','Savings trend','30 days','green',4,3,'detailed',function(){return chartPanel([28,30,34,38,37,43,48,52,50,59,63,61,68,71,76,79,84,88],[['Saved',money(costs.saved)],['Hit rate','96.8%'],['Read','6.29M'],['Write','347k']],'Avoided input cost','Savings use provider catalog prices where receipts do not expose them.');},{kind:'chart',minCols:3,minRows:2}));
      widgets.push(widget('cache-authority','Reporting state','routes','orange',4,4,'diagnostics',function(){return richList([['Claude','read and write','reported','ok','','provider receipt'],['Codex','read only','write not exposed','warn','','provider receipt'],['Qwen','read and write','reported','ok','','provider receipt'],['Gemini','no breakdown','estimated','warn','','PM estimate']]);},{kind:'list',minCols:2,minRows:2,contentCount:4,maxRows:6}));
      widgets.push(widget('cache-economics','Cache economics','month','purple',4,4,'diagnostics',function(){return richList([['Claude','95.4% hit','$82.14','ok','','2.3M read'],['Codex','97.2% hit','$119.30','ok','','2.1M read'],['Qwen','91.8% hit','$44.02','ok','','0.8M read'],['Gemini','84.6% hit','$18.10','warn','','0.3M read']]);},{kind:'list',minCols:2,minRows:2,contentCount:4,maxRows:6}));
    } else if (room === 'tools') {
      widgets = DATA.tools.map(function (tool,index) { return widget('tool-'+index, tool[0], tool[2], index===3?'orange':'blue', 2, 2, 'glance', function () { return summary({ value:tool[1].split(' ')[0], label:tool[0]+' calls', trend:tool[2], trendClass:tool[2].indexOf('0 errors')>=0?'':'warn', cells:[['Latency',tool[3]],['Volume',tool[4]],['Errors',tool[2]],['Share',Math.round(parseInt(tool[1],10)/8.8)+'%']], footerLeft:state.range, footerRight:'receipt linked' }); }, {kind:'summary',minCols:2,maxCols:5,maxRows:4}); });
      widgets.push(summaryCard('tool-health','Tool health','current','green','99.7%','successful tool calls','881 calls','',[['Tools','5'],['Retries','1'],['Median','2.7s'],['Receipts','100%']],'Current window','within policy','glance',{cols:2,rows:2,minCols:2}));
      widgets.push(widget('tool-list','Tool details',state.range,'blue',4,4,'detailed',function(){return richList(DATA.tools.map(function(tool,index){return[tool[0],tool[3]+' · '+tool[4],tool[1],tool[2].indexOf('0 errors')>=0?'ok':'warn',index>4?'expanded':'',tool[2]];}));},{kind:'list',minCols:2,minRows:2,contentCount:DATA.tools.length,maxRows:6}));
      widgets.push(widget('tool-latency','Tool latency',state.range,'purple',4,3,'diagnostics',function(){return chartPanel([18,24,21,28,35,31,42,38,47,44,52,49,57,54,61,58],[['Median','2.7s'],['P95','8.4s'],['Retries','1'],['Timeouts','0']],'Latency index','Browser and terminal calls dominate the long tail.');},{kind:'chart',minCols:3,minRows:2}));
      widgets.push(summaryCard('tool-receipts','Receipt coverage','current','green','100%','tool calls linked to receipts','881 linked','',[['Missing','0'],['Redacted','7'],['Retries','1'],['Errors','3']],'Retention','90d','diagnostics',{cols:4,rows:3,minCols:2}));
    } else if (room === 'signals') {
      widgets = DATA.signals.map(function (signal,index) { return widget('signal-'+index, signal[0], 'current', signal[2]==='warn'?'warn':'green', 2, 2, 'glance', function () { return summary({ value:signal[1].split(' ')[0], label:signal[0], trend:signal[1].split(' ').slice(1).join(' '), trendClass:signal[2]==='warn'?'warn':'', cells:[['Freshness',signal[3]],['State',signal[2]],['Scope','all routes'],['Authority',index<2?'provider':'PM']], footerLeft:'Current reading', footerRight:signal[3] }); }, {kind:'summary',minCols:2,maxCols:5,maxRows:4}); });
      widgets.push(widget('signal-list','All signals','current','blue',4,4,'glance',function(){return richList(DATA.signals.map(function(signal,index){return[signal[0],signal[3],signal[1],signal[2],index>4?'expanded':'',index<2?'provider authority':'PM authority'];}));},{kind:'list',minCols:2,minRows:2,contentCount:DATA.signals.length,maxRows:6}));
      widgets.push(widget('signal-history','Signal history','24h','purple',4,3,'diagnostics',function(){return chartPanel([92,94,93,95,96,95,97,96,98,97,98,99,98,99,99,100],[['Healthy','6'],['Warnings','2'],['Stale','0'],['Unpriced','3']],'Signal health','Freshness and pricing coverage are sampled together.');},{kind:'chart',minCols:3,minRows:2}));
      widgets.push(summaryCard('signal-coverage','Coverage','current','green','99.98%','events with usable signal data','3 unpriced','warn',[['Allowance','100%'],['Pricing','99.98%'],['Health','100%'],['Freshness','100%']],'Unknown','0','diagnostics',{cols:4,rows:3,minCols:2}));
    } else if (room === 'authority') {
      widgets = [
        widget('auth-list','Current sources','diagnostics','purple',4,4,'detailed',function(){return richList(DATA.authority.map(function(row,index){return[row[0],row[1]+' · '+row[3],row[2],row[1].indexOf('estimate')>=0?'warn':'ok',index>5?'expanded':'',row[1].indexOf('estimate')>=0?'derived reading':'direct authority'];}));},{kind:'list',minCols:2,minRows:2,contentCount:DATA.authority.length,maxRows:6}),
        summaryCard('auth-summary','Provider reported','current','green','4 / 6','top-level readings','fresh','',[['Allowance','4'],['Reset','4'],['Spend','1'],['Cache','3']],'Oldest','1m','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('auth-est','PM estimates','current','orange','2','derived readings','labeled','warn',[['Forecast','pace model'],['Savings','catalog price'],['Confidence','87%'],['Stale','0']],'Derived','explicit','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('auth-stale','Stale readings','current','green','0','older than policy','clear','',[['Policy','5m'],['Oldest','1m'],['Missing','0'],['Unknown','0']],'Freshness','pass','glance',{cols:2,rows:2,minCols:2}),
        summaryCard('auth-coverage','Authority coverage','current','blue','100%','readings with named authority','all labeled','',[['Provider','4'],['PM','2'],['Unknown','0'],['Expired','0']],'Policy','pass','glance',{cols:2,rows:2,minCols:2})
      ];
    }
    return balanceRoomDefaults(applySelectorTruth(room, addFocusedWidgets(room, widgets)));
  }

  function balanceRoomDefaults(widgets) {
    var policy = {
      health:[3,2], month:[3,2], 'cache-saved':[3,2], 'active-runs':[3,2],
      'context-now':[3,3], 'budget-now':[3,3], 'plan-value-now':[3,3], 'attention-now':[3,3],
      forecast:[3,3], 'route-pressure':[2,4], 'next-reset':[3,3], 'completion-capacity':[3,2], 'run-attribution':[2,4], 'capacity-reservations':[2,3],
      'reset-map':[2,4], 'plan-settlement':[2,4], 'plan-pressure':[2,4], 'plan-authority':[2,4], 'allowance-attribution':[2,4], 'counting-basis':[2,5], 'native-allowance-units':[2,5],
      budget:[3,4], 'cost-trend':[3,3], 'provider-cost':[2,4], 'pricing-confidence':[2,4], 'cost-authority':[2,5], 'burn-basis':[2,3],
      routing:[2,5], 'account-fallbacks':[2,4], 'credential-ownership':[2,4], 'route-mismatches':[2,5], 'connection-authority':[2,5],
      'free-route':[2,4], 'free-history':[3,3], 'free-throughput':[3,3], 'cooldown-eligibility':[2,5], 'free-source-state':[2,4],
      'ctx-window':[3,3], 'ctx-cache':[2,2], 'ctx-reclaim':[2,2], 'ctx-output':[2,2], 'ctx-route':[2,3],
      'ctx-sources':[2,4], 'ctx-limits':[2,4], 'ctx-maint':[2,4], 'ctx-routing':[2,4], 'context-composition':[2,5], 'compaction-history':[2,5],
      'token-trend':[3,3], 'model-mix':[2,4], 'cache-read-share':[3,3], 'reasoning-mix':[3,3], 'token-counting-basis':[2,6], 'unknown-token-buckets':[2,3],
      'ledger-main':[2,5], 'ledger-count':[2,2], 'ledger-errors':[2,2], 'ledger-routes':[2,2], 'ledger-export':[2,2], 'ledger-coverage':[2,2], 'settlement-states':[2,4], 'attempt-lineage':[2,6], 'usage-record-state':[2,5],
      anom:[3,3], 'attention-history':[3,3], 'attention-policy':[3,3],
      'cache-trend':[3,3], 'cache-authority':[2,4], 'cache-economics':[2,4], 'cache-break-even':[2,3],
      'tool-list':[2,5], 'tool-latency':[3,3], 'tool-receipts':[2,3], 'operations-window':[2,5], 'tool-allowance':[2,5], 'catalog-refresh':[2,5],
      'signal-list':[2,4], 'signal-history':[3,3], 'signal-coverage':[2,3], 'signal-authority-map':[2,5],
      'auth-list':[2,5], 'auth-summary':[2,2], 'auth-est':[2,2], 'auth-stale':[2,2], 'auth-coverage':[2,2], 'pricing-provenance':[2,4], 'provider-probe-state':[2,6], 'unknown-versus-zero':[2,5]
    };

    var narrowLists = {
      'route-pressure':1, 'reset-map':1, 'plan-settlement':1, 'plan-pressure':1, 'plan-authority':1, 'allowance-attribution':1, 'counting-basis':1, 'native-allowance-units':1,
      'provider-cost':1, 'pricing-confidence':1, 'cost-authority':1, routing:1, 'account-fallbacks':1, 'credential-ownership':1, 'route-mismatches':1, 'connection-authority':1,
      'free-route':1, 'cooldown-eligibility':1, 'free-source-state':1, 'ctx-sources':1, 'ctx-limits':1, 'ctx-maint':1, 'ctx-routing':1, 'context-composition':1, 'compaction-history':1,
      'model-mix':1, 'token-counting-basis':1, 'ledger-main':1, 'settlement-states':1, 'attempt-lineage':1, 'usage-record-state':1,
      'cache-authority':1, 'cache-economics':1, 'tool-list':1, 'operations-window':1, 'tool-allowance':1, 'catalog-refresh':1,
      'signal-list':1, 'signal-authority-map':1, 'auth-list':1, 'pricing-provenance':1, 'provider-probe-state':1, 'unknown-versus-zero':1
    };

    widgets.forEach(function (item) {
      if (/^(plan-|acct-|free-|cache-|alert-)/.test(item.id) && !policy[item.id]) policy[item.id] = [3,3];
      if (/^tok-/.test(item.id)) policy[item.id] = [2,2];
      if (/^tool-/.test(item.id) && !policy[item.id]) policy[item.id] = [2,2];
      if (/^signal-/.test(item.id) && !policy[item.id]) policy[item.id] = [2,2];

      if (narrowLists[item.id]) {
        item.minCols = 2;
        item.maxCols = Math.min(item.maxCols, 6);
        item.minRows = Math.max(2, item.minRows);
        item.maxRows = Math.max(item.maxRows, 8);
      }
      if (item.kind === 'list') {
        item.maxRows = Math.max(item.maxRows, 8);
        if (item.autoRows && item.contentCount && !policy[item.id]) policy[item.id] = [Math.max(2, item.minCols), autoRowsForCount(item.contentCount, item.minRows)];
      }
      if (item.kind === 'instrument') {
        item.minCols = Math.max(3, item.minCols);
        item.minRows = Math.max(2, item.minRows);
        item.maxRows = Math.max(8, item.maxRows);
      }

      var fit = policy[item.id] || [item.cols, item.rows];
      item.cols = Math.max(item.minCols, Math.min(item.maxCols, fit[0]));
      item.rows = Math.max(item.minRows, Math.min(item.maxRows, fit[1]));
      item.defaultStart = 0;
    });
    return widgets;
  }
  function centerDefaultRows(widgets) {
    widgets.forEach(function (item) { item.defaultStart = 0; });
    var customized = (state.order[state.room] || []).length > 0 || widgets.some(function (item) { return !!state.layout[state.room + ':' + item.id]; });
    if (customized) return widgets;
    var cursor = 0;
    while (cursor < widgets.length) {
      var row = [], used = 0;
      while (cursor < widgets.length) {
        var item = widgets[cursor];
        var width = Math.max(item.minCols, Math.min(item.maxCols, item.cols));
        if (row.length && used + width > 12) break;
        row.push(item); used += width; cursor += 1;
        if (used === 12) break;
      }
      if (row.length && used < 12) row[0].defaultStart = Math.floor((12 - used) / 2) + 1;
    }
    return widgets;
  }

  function rank(detailId) { return DETAIL[detailId] ? DETAIL[detailId].rank : 0; }
  function orderedWidgets(widgets) {
    var saved = state.order[state.room] || [];
    if (!saved.length) return widgets;
    return widgets.slice().sort(function (a, b) {
      var ai = saved.indexOf(a.id), bi = saved.indexOf(b.id);
      if (ai < 0) ai = 9999;
      if (bi < 0) bi = 9999;
      return ai - bi;
    });
  }
  function visibleWidgets() {
    return centerDefaultRows(orderedWidgets(roomWidgets(state.room).filter(function (item) {
      return rank(item.minDetail) <= DETAIL[state.detail].rank && !state.hidden[state.room + ':' + item.id];
    })));
  }
  function widgetById(id) {
    var widgets = roomWidgets(state.room);
    for (var i = 0; i < widgets.length; i += 1) if (widgets[i].id === id) return widgets[i];
    return null;
  }

  function clampLayout(item, cols, rows) {
    cols = isFinite(cols) ? Math.round(cols) : item.cols;
    rows = isFinite(rows) ? Math.round(rows) : item.rows;
    var targetCols = Math.max(item.minCols, Math.min(item.maxCols, Math.max(2, Math.min(12, cols))));
    var targetRows = Math.max(item.minRows, Math.min(item.maxRows, Math.max(1, Math.min(8, rows))));
    var sizes = curatedSizes(item);
    if (!sizes.length) return { cols: targetCols, rows: targetRows };
    var best = sizes[0], bestScore = Infinity;
    sizes.forEach(function (preset) {
      var score = Math.abs(preset[0] - targetCols) * 1.15 + Math.abs(preset[1] - targetRows) * 1.25;
      if (score < bestScore || (score === bestScore && preset[0] * preset[1] < best[0] * best[1])) {
        best = preset; bestScore = score;
      }
    });
    return { cols: best[0], rows: best[1] };
  }
  function resolveResizeIntent(item, before, rawCols, rawRows) {
    rawCols = isFinite(rawCols) ? Math.round(rawCols) : before.cols;
    rawRows = isFinite(rawRows) ? Math.round(rawRows) : before.rows;
    var colDirection = rawCols === before.cols ? 0 : rawCols > before.cols ? 1 : -1;
    var rowDirection = rawRows === before.rows ? 0 : rawRows > before.rows ? 1 : -1;
    if (!colDirection && !rowDirection) return { cols: before.cols, rows: before.rows };
    var sizes = curatedSizes(item);
    if (!sizes.length) return clampLayout(item, rawCols, rawRows);
    var directional = sizes.filter(function (preset) {
      var colProgress = !colDirection || (preset[0] - before.cols) * colDirection > 0;
      var rowProgress = !rowDirection || (preset[1] - before.rows) * rowDirection > 0;
      return colProgress && rowProgress;
    });
    if (!directional.length) return { cols: before.cols, rows: before.rows };
    directional.sort(function (left, right) {
      var leftActive = (colDirection ? Math.abs(left[0] - rawCols) : 0) + (rowDirection ? Math.abs(left[1] - rawRows) : 0);
      var rightActive = (colDirection ? Math.abs(right[0] - rawCols) : 0) + (rowDirection ? Math.abs(right[1] - rawRows) : 0);
      if (leftActive !== rightActive) return leftActive - rightActive;
      var leftInactive = (!colDirection ? Math.abs(left[0] - before.cols) : 0) + (!rowDirection ? Math.abs(left[1] - before.rows) : 0);
      var rightInactive = (!colDirection ? Math.abs(right[0] - before.cols) : 0) + (!rowDirection ? Math.abs(right[1] - before.rows) : 0);
      if (leftInactive !== rightInactive) return leftInactive - rightInactive;
      var leftDistance = Math.abs(left[0] - rawCols) + Math.abs(left[1] - rawRows);
      var rightDistance = Math.abs(right[0] - rawCols) + Math.abs(right[1] - rawRows);
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      var leftAreaDelta = Math.abs(left[0] * left[1] - before.cols * before.rows);
      var rightAreaDelta = Math.abs(right[0] * right[1] - before.cols * before.rows);
      return leftAreaDelta - rightAreaDelta || left[1] - right[1] || left[0] - right[0];
    });
    return { cols: directional[0][0], rows: directional[0][1] };
  }
  function quantizeResizeSteps(delta, step, positiveRoom, negativeRoom) {
    var steps = Math.round(delta / Math.max(1, step));
    if (steps || !delta) return steps;
    var room = delta > 0 ? positiveRoom : negativeRoom;
    /* A bottom-right grip can begin less than half a track from the viewport
       edge. Let a deliberate drag through most of that remaining edge band
       express one step; ordinary in-board grips keep the half-track rule. */
    if (!isFinite(room) || room >= step * .5) return 0;
    var edgeThreshold = Math.max(6, Math.min(step * .5, room * .65));
    return Math.abs(delta) >= edgeThreshold ? (delta > 0 ? 1 : -1) : 0;
  }
  function layoutFor(item) {
    var key = state.room + ':' + item.id;
    var saved = state.layout[key] || {};
    return clampLayout(item, saved.cols, saved.rows);
  }
  function setLayout(item, cols, rows, commandId, source) {
    var before = layoutFor(item);
    var next = clampLayout(item, cols, rows);
    if (before.cols === next.cols && before.rows === next.rows) return next;
    var candidate = clearUsageRoomSlots(liveUsageStateSnapshot(), state.room);
    candidate.layout[state.room + ':' + item.id] = next;
    var resizeSource = source || 'unknown', receipt = null;
    if (commandId) {
      receipt = command(
        commandId,
        { page:'usage', instance_id:item.id, col_span:next.cols, row_span:next.rows },
        { persisted:false, source:resizeSource },
        { defer_receipt:true }
      );
      if (receipt.dispatch_accepted === false) {
        completeCommandReceipt(receipt, { persisted:false, reason:'owner_rejected', rolled_back:true }, 'rejected');
        return before;
      }
    }
    if (!persistUsageWholeState(candidate)) {
      if (receipt) completeCommandReceipt(receipt, { persisted:false, reason:'usage_workspace_write_failed', rolled_back:true }, 'failed');
      return before;
    }
    if (receipt) {
      completeCommandReceipt(receipt, { persisted:true, source:resizeSource }, 'accepted');
      usageEvent('view.usage.widget_resized', { widget_id:item.id, source:resizeSource, before:before, after:next, content_density:densityFor(next, item) });
    }
    return next;
  }
  function densityFor(layout, item) {
    if (layout.rows === 1) return 'strip';
    if (layout.rows === 2) return 'compact';
    if (layout.rows === 3) return 'standard';
    if (layout.rows === 4) return 'expanded';
    return 'maximum';
  }
  function shapeFor(layout, item) {
    if (layout.rows === 1) return 'strip';
    if (layout.cols >= 5 && layout.rows >= 5) return 'canvas';
    if (layout.cols >= 4 && layout.rows >= 4) return 'wide';
    if (layout.cols <= 3 && layout.rows >= 3) return 'tower';
    return 'standard';
  }
  function densityLabel(id) { return id === 'strip' ? 'Essential strip' : id === 'compact' ? 'Compact content' : id === 'standard' ? 'Standard content' : id === 'expanded' ? 'Expanded content' : 'Maximum detail'; }

  function cardHTML(item, index) {
    var layout = layoutFor(item);
    var density = densityFor(layout, item);
    var shape = shapeFor(layout, item);
    var startStyle = item.defaultStart ? ';grid-column:' + item.defaultStart + ' / span ' + layout.cols : '';
    var gripSvg = '<svg aria-hidden="true" viewBox="0 0 20 20"><path class="pm7u-grip-groove" d="M9.5 4.5 L15.5 10.5 M4.5 4.5 L15.5 15.5" fill="none" stroke-width="1.5" stroke-linecap="round"/><path class="pm7u-grip-ring" d="M1.5 2 L16 2 Q18 2 18 4 L18 18.5 Z" fill="none" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    var menuSvg = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="5" r="1.25"/><circle cx="10" cy="10" r="1.25"/><circle cx="10" cy="15" r="1.25"/></svg>';
    var resizeSvg = '<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 14.5h9v-9"/></svg>';
    return '<article class="pm7u-card pm-sheen ' + (layout.cols >= 5 ? 'is-wide ' : '') + (layout.rows >= 2 ? 'is-tall ' : '') + (layout.rows === 1 ? 'is-compact ' : '') + '" data-widget="' + esc(item.id) + '" data-selector-applicability="' + esc(item.selectorApplicability) + '" data-kind="' + esc(item.kind) + '" data-tone="' + esc(item.tone) + '" data-cols="' + layout.cols + '" data-rows="' + layout.rows + '" data-density="' + density + '" data-shape="' + shape + '" style="--i:' + (index || 0) + ';--pm7u-cols:' + layout.cols + ';--pm7u-rows:' + layout.rows + startStyle + '">' +
      '<button type="button" class="pm7u-drag" title="Drag to move, or press Enter to move with the arrow keys" aria-label="Move ' + esc(item.title) + '" aria-grabbed="false">' + gripSvg + '</button>' +
      '<button type="button" class="pm7u-cardmenu" title="Panel options" aria-label="Options for ' + esc(item.title) + '">' + menuSvg + '</button>' +
      '<header class="pm7u-cardhead"><span class="pm7u-carddot"></span><span class="pm7u-cardtitle">' + esc(item.title) + '</span><span class="pm7u-cardmeta">' + esc(item.meta) + '</span></header>' +
      '<div class="pm7u-cardbody">' + renderWidgetBody(item, layout) + '</div><span class="pm7u-resize" role="button" tabindex="0" title="Resize panel" aria-label="Resize ' + esc(item.title) + '">' + resizeSvg + '</span></article>';
  }


  /* PM7 T35: derive disclosure from actual painted geometry. */
  function physicalContentTier(cardElement) {
    var rect = cardElement.getBoundingClientRect();
    var width = Math.round(rect.width), height = Math.round(rect.height);
    if (!width || !height) return null;
    var area = width * height;
    if (height < 150 || width < 150) return 'strip';
    if (height < 245 || width < 205 || area < 50000) return 'compact';
    if (height < 355 || width < 265 || area < 90000) return 'standard';
    if (height < 480 || area < 150000) return 'expanded';
    return 'maximum';
  }
  function applyPhysicalContentTier(cardElement) {
    var tier = physicalContentTier(cardElement);
    if (!tier) return null;
    cardElement.setAttribute('data-content-tier', tier);
    cardElement.setAttribute('data-content-width', cardElement.clientWidth < 300 ? 'narrow' : cardElement.clientWidth < 420 ? 'regular' : 'wide');
    return tier;
  }
  function applyPhysicalUsageLayout() {
    var width = Math.round(app.getBoundingClientRect().width);
    if (!width) return null;
    var layout = width <= 520 ? 'micro' : width <= 760 ? 'compact' : 'wide';
    app.setAttribute('data-physical-layout', layout);
    app.setAttribute('data-physical-width', String(width));
    return layout;
  }
  var physicalTierFrame = 0;
  function applyPhysicalContentTiers() {
    physicalTierFrame = 0;
    applyPhysicalUsageLayout();
    $$('.pm7u-card', board).forEach(applyPhysicalContentTier);
    scheduleUsageChartLabels(board);
  }
  function schedulePhysicalContentTiers() {
    if (physicalTierFrame) cancelAnimationFrame(physicalTierFrame);
    physicalTierFrame = requestAnimationFrame(applyPhysicalContentTiers);
  }

  function render() {
    if (document.body.classList.contains('pm7u-pointer-op')) return;
    var room = ROOM[state.room];
    app.setAttribute('data-room', state.room);
    app.setAttribute('data-detail', state.detail);
    $('#pm7uRoomCrumb').textContent = room.label;
    $('#pm7uRoomTitle').textContent = room.title;
    $('#pm7uRoomDesc').textContent = room.desc;
    $('#pm7uDetailLabel').textContent = DETAIL[state.detail].label;
    $$('.pm7u-navbtn[data-room]', app).forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-room') === state.room); });
    $('#pm7uMore').classList.toggle('open', state.more);
    $('#pm7uMoreBtn').setAttribute('aria-expanded', String(state.more));
    $$('.pm7u-diagnostics-only', app).forEach(function (element) { element.style.display = state.detail === 'diagnostics' ? '' : 'none'; });
    $$('#pm7uRange button', app).forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-range') === state.range); });
    var widgets = visibleWidgets();
    board.innerHTML = widgets.length ? widgets.map(function (item, i) { return cardHTML(item, i); }).join('') : '<div class="pm7u-empty">No panels are enabled for this room.<br>Use the panel chooser to restore one.</div>';
    applySettledUsageSlots();
    $('#pm7uBoardMeta').innerHTML = '<b>' + widgets.length + ' panel' + (widgets.length === 1 ? '' : 's') + '</b> &middot; ' + DETAIL[state.detail].label + ' &middot; content follows panel size';
    wireCards();
    schedulePhysicalContentTiers();
    syncNavInk(true);
  }

  function toast(text) {
    var element = $('#pm7uToast');
    element.textContent = text;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { element.classList.remove('show'); }, 1800);
  }
  function place(pop, anchor) {
    var rect = anchor.getBoundingClientRect();
    var popW = pop.offsetWidth || 0;
    var popH = pop.offsetHeight || 0;
    if (!popW || !popH) {
      requestAnimationFrame(function () { place(pop, anchor); });
      return;
    }
    var left = Math.max(8, Math.min(innerWidth - popW - 8, rect.right - popW));
    var top = rect.bottom + 6;
    if (top + popH > innerHeight - 8) top = rect.top - popH - 6;
    if (top < 8) top = 8;
    if (top + popH > innerHeight - 8) top = Math.max(8, innerHeight - popH - 8);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }
  function closePops(except) {
    $$('.pm7u-pop.open', app).forEach(function (pop) { if (pop !== except) pop.classList.remove('open'); });
    [$('#pm7uScopeBtn'), $('#pm7uDetailBtn'), $('#pm7uCustomize')].forEach(function (button) { if (button) button.setAttribute('aria-expanded', 'false'); });
  }
  function openPop(pop, anchor, html) {
    closePops(pop);
    pop.innerHTML = html;
    pop.classList.add('open');
    anchor.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { place(pop, anchor); });
  }
  function scopeDisplay(scope) {
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
  function detailHTML() {
    return '<div class="pm7u-poptitle">Workspace detail</div>' + ['glance', 'detailed', 'diagnostics'].map(function (id) {
      var detail = DETAIL[id];
      return '<button type="button" class="pm7u-poprow ' + (id === state.detail ? 'active' : '') + '" data-detail="' + id + '">' + SVG.layers + '<span class="pm7u-popcopy"><b>' + detail.label + '</b><span>' + detail.desc + '</span></span>' + (id === state.detail ? '<span class="pm7u-popcheck">' + SVG.check + '</span>' : '') + '</button>';
    }).join('');
  }
  function customizeHTML() {
    var all = roomWidgets(state.room);
    return '<div class="pm7u-poptitle">Panels in ' + ROOM[state.room].label + '</div><div class="pm7u-widgetlist">' + all.map(function (item) {
      var key = state.room + ':' + item.id;
      var on = !state.hidden[key];
      return '<button type="button" class="pm7u-poprow ' + (on ? 'active' : '') + '" data-toggle-widget="' + esc(item.id) + '"><span class="pm7u-popcopy"><b>' + esc(item.title) + '</b><span>' + esc(item.meta) + '</span></span><span class="pm7u-toggle"></span></button>';
    }).join('') + '</div><div class="pm7u-popsep"></div><button type="button" class="pm7u-poprow" data-reset-room>' + SVG.grid + '<span class="pm7u-popcopy"><b>Reset Usage layout</b><span>Restore curated panels, order, and sizes in every room</span></span></button>';
  }

  var PRESETS = {
    summary: [[2,1,'Narrow strip'],[3,1,'Strip'],[4,1,'Wide strip'],[2,2,'Narrow'],[3,2,'Standard'],[4,2,'Wide'],[2,3,'Narrow tall'],[3,3,'Tall'],[4,3,'Wide tall'],[2,4,'Narrow expanded'],[3,4,'Expanded'],[4,4,'Expanded wide'],[3,5,'Maximum detail'],[4,5,'Maximum wide']],
    instrument: [[3,2,'Compact'],[3,3,'Standard'],[3,4,'Expanded'],[3,5,'Detailed'],[3,6,'Maximum detail'],[3,7,'Long'],[3,8,'Maximum height'],[4,4,'Wide expanded'],[4,5,'Wide detailed'],[4,6,'Wide maximum'],[4,7,'Wide long'],[4,8,'Wide maximum height'],[5,5,'Canvas'],[5,6,'Detailed canvas'],[6,5,'Wide canvas'],[6,6,'Full canvas']],
    list: [[2,2,'Narrow compact'],[2,3,'Narrow'],[2,4,'Narrow tall'],[2,5,'Narrow detailed'],[2,6,'Narrow maximum'],[2,7,'Narrow long'],[2,8,'Narrow maximum height'],[3,2,'Compact'],[3,3,'Standard'],[3,4,'Tall'],[3,5,'Detailed'],[3,6,'Maximum detail'],[3,7,'Long'],[3,8,'Maximum height'],[4,4,'Two-column'],[4,5,'Two-column detailed'],[4,6,'Two-column maximum'],[4,7,'Two-column long'],[4,8,'Two-column maximum height'],[6,4,'Wide two-column'],[6,5,'Wide detailed'],[6,6,'Wide maximum'],[6,7,'Wide long'],[6,8,'Wide maximum height']],
    chart: [[2,3,'Narrow'],[2,4,'Narrow tall'],[2,5,'Narrow detailed'],[2,6,'Narrow maximum'],[3,3,'Standard'],[3,4,'Tall'],[3,5,'Detailed'],[3,6,'Maximum detail'],[4,4,'Expanded'],[4,5,'Detailed wide'],[4,6,'Maximum wide'],[5,5,'Canvas'],[5,6,'Detailed canvas'],[6,5,'Full canvas'],[6,6,'Maximum canvas']]
  };
  function sizePresets(item) {
    return curatedSizes(item);
  }
  function cardMenuHTML(item) {
    var layout = layoutFor(item);
    return '<div class="pm7u-poptitle">' + esc(item.title) + ' · size and content</div>' + sizePresets(item).map(function (preset) {
      var on = layout.cols === preset[0] && layout.rows === preset[1];
      var density = densityFor({ cols: preset[0], rows: preset[1] }, item);
      return '<button type="button" class="pm7u-poprow ' + (on ? 'active' : '') + '" data-card-size="' + preset[0] + 'x' + preset[1] + '"><span class="pm7u-popcopy"><b>' + preset[2] + '</b><span>' + preset[0] + ' columns · ' + preset[1] + ' row' + (preset[1] > 1 ? 's' : '') + ' · ' + densityLabel(density) + '</span></span>' + (on ? '<span class="pm7u-popcheck">' + SVG.check + '</span>' : '') + '</button>';
    }).join('') + '<div class="pm7u-popsep"></div><button type="button" class="pm7u-poprow" data-hide-card="' + esc(item.id) + '"><span class="pm7u-popcopy"><b>Remove panel</b><span>Restore it from the panel chooser</span></span></button>';
  }

  $('#pm7uScopeBtn').addEventListener('click', function (event) {
    event.stopPropagation();
    var pop = $('#pm7uScopePop');
    if (pop.classList.contains('open')) { closePops(); return; }
    openPop(pop, this, scopeHTML());
  });
  $('#pm7uDetailBtn').addEventListener('click', function (event) {
    event.stopPropagation();
    var pop = $('#pm7uDetailPop');
    if (pop.classList.contains('open')) { closePops(); return; }
    openPop(pop, this, detailHTML());
  });
  $('#pm7uCustomize').addEventListener('click', function (event) {
    event.stopPropagation();
    var pop = $('#pm7uCustomizePop');
    if (pop.classList.contains('open')) { closePops(); return; }
    openPop(pop, this, customizeHTML());
  });

  app.addEventListener('click', function (event) {
    var setupButton = event.target.closest('[data-provider-setup]');
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
    var roomButton = event.target.closest('[data-room]');
    if (roomButton && roomButton.classList.contains('pm7u-navbtn')) {
      var previousRoom = state.room;
      state.room = roomButton.getAttribute('data-room');
      STORE.set(KEY + 'room', state.room);
      viewAction('usage.room.set', { previous_room: previousRoom, room: state.room });
      usageEvent('view.usage.room_changed', { previous_room: previousRoom, room: state.room });
      if (roomButton.closest('.pm7u-more')) { state.more = true; STORE.set(KEY + 'more', true); }
      closePops(); render(); boardScroll.scrollTop = 0; return;
    }
    if (event.target.closest('#pm7uMoreBtn')) { state.more = !state.more; STORE.set(KEY + 'more', state.more); render(); return; }
    var scope = event.target.closest('[data-scope]');
    if (scope) {
      var previousScope = state.scope;
      state.scope = scope.getAttribute('data-scope'); STORE.set(KEY + 'scope', state.scope);
      viewAction('usage.scope.set', { previous_scope: previousScope, scope: state.scope });
      usageEvent('view.usage.scope_changed', { previous_scope: previousScope, scope: state.scope });
      var labels = scopeDisplay(state.scope);
      $('#pm7uScopeLabel').textContent = labels[0]; $('#pm7uScopeMeta').textContent = labels[1]; closePops(); render(); toast('Scope changed to ' + labels[0]); return;
    }
    var detail = event.target.closest('.pm7u-poprow[data-detail]');
    if (detail) {
      var before = visibleWidgets().length;
      var previousDetail = state.detail;
      state.detail = detail.getAttribute('data-detail'); STORE.set(KEY + 'detail', state.detail);
      viewAction('usage.disclosure.set', { previous_detail: previousDetail, detail: state.detail });
      usageEvent('view.usage.disclosure_changed', { previous_detail: previousDetail, detail: state.detail });
      closePops(); render();
      var after = visibleWidgets().length;
      toast(DETAIL[state.detail].label + ' shows ' + after + ' panels' + (after > before ? ' · ' + (after - before) + ' added' : '')); return;
    }
    var toggle = event.target.closest('[data-toggle-widget]');
    if (toggle) {
      var toggleId = toggle.getAttribute('data-toggle-widget');
      var toggleKey = state.room + ':' + toggleId;
      state.hidden[toggleKey] = !state.hidden[toggleKey]; STORE.set(KEY + 'hidden', state.hidden);
      command(state.hidden[toggleKey] ? 'cmd.widget.remove' : 'cmd.widget.add', state.hidden[toggleKey] ? { page: 'usage', instance_id: toggleId } : { page: 'usage', widget_id: toggleId }, { persisted: true, room: state.room });
      usageEvent('view.usage.widget_visibility_changed', { widget_key: toggleKey, visible: !state.hidden[toggleKey] });
      openPop($('#pm7uCustomizePop'), $('#pm7uCustomize'), customizeHTML()); render(); return;
    }
    if (event.target.closest('[data-reset-room]')) {
      var resetCandidate = liveUsageStateSnapshot();
      resetCandidate.layout = {}; resetCandidate.hidden = {}; resetCandidate.order = {};
      if (!persistUsageWholeState(resetCandidate)) { closePops(); toast('Usage layout could not be reset'); return; }
      command('cmd.widget.reset_layout', { page: 'usage' }, { persisted: true });
      usageEvent('view.usage.layout_reset', { page: 'usage' });
      closePops(); render(); toast('Usage layout reset'); return;
    }
    var size = event.target.closest('[data-card-size]');
    if (size && app._menuWidget) {
      var parts = size.getAttribute('data-card-size').split('x'); setLayout(app._menuWidget, +parts[0], +parts[1], 'cmd.widget.resize', 'size_menu'); closePops(); render(); return;
    }
    var hide = event.target.closest('[data-hide-card]');
    if (hide) {
      var hiddenKey = state.room + ':' + hide.getAttribute('data-hide-card');
      state.hidden[hiddenKey] = true; STORE.set(KEY + 'hidden', state.hidden);
      command('cmd.widget.remove', { page: 'usage', instance_id: hide.getAttribute('data-hide-card') }, { persisted: true, room: state.room });
      usageEvent('view.usage.widget_visibility_changed', { widget_key: hiddenKey, visible: false });
      closePops(); render(); return;
    }
    var range = event.target.closest('[data-range]');
    if (range) { var previousRange = state.range; state.range = range.getAttribute('data-range'); STORE.set(KEY + 'range', state.range); viewAction('usage.range.set', { previous_range: previousRange, range: state.range }); usageEvent('view.usage.range_changed', { previous_range: previousRange, range: state.range }); render(); toast('Range changed to ' + state.range); return; }
    var openRow = event.target.closest('[data-open-row]');
    if (openRow && state.room === 'ledger') { var eventIndex = +openRow.getAttribute('data-open-row'), selectedAttempt = projectedAttempts()[eventIndex]; if (!selectedAttempt) return; var attemptId = selectedAttempt.attempt_id; command('cmd.nav.open_usage_subject', { route_target: { object_kind: 'usage_attempt', object_id: attemptId }, attempt_id: attemptId, usage_event_ref: selectedAttempt.usage_event_ref, usage_record_id: selectedAttempt.usage_record_id, provider_attempt_ref: selectedAttempt.provider_attempt_ref, provider_id: selectedAttempt.provider_id, account_id: selectedAttempt.account_id, source_class: selectedAttempt.source_class, source_confidence: selectedAttempt.source_confidence, source_authority: selectedAttempt.source_authority, settlement_status: selectedAttempt.settlement_status, projection_freshness: selectedAttempt.projection_freshness, projection_health: selectedAttempt.projection_health }, { opened: true }); openInspector('Usage attempt', inspectorEvent(attemptId)); return; }
    var openCard = event.target.closest('[data-open-card]');
    if (openCard) { var cardId = openCard.getAttribute('data-open-card'), detail = localCardDetail(cardId); viewAction('usage.details.open', detail.payload); openInspector(detail.title, inspectorCard(cardId)); return; }
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.pm7u-pop') && !event.target.closest('[aria-haspopup]')) closePops();
  });

  $('#pm7uRefresh').addEventListener('click', function () {
    var button = this; button.classList.add('spinning');
    command('cmd.usage.refresh', { room: state.room, range: state.range, scope: state.scope }, { requested: true });
    setTimeout(function () { button.classList.remove('spinning'); usageEvent('view.usage.projection_refreshed', { room: state.room, range: state.range, freshness: 'just now' }); render(); toast('Usage refreshed just now'); }, 650);
  });

  function settleUsageCardAnimations() {
    $$('.pm7u-card', board).forEach(function (card) {
      /* T34 used a permanent inline animation override to stop a settled
         card replaying its entrance. Finish the current CSS animation at its
         end state instead, so no preview style survives the transaction. */
      card.style.removeProperty('animation');
      if (typeof card.getAnimations !== 'function') return;
      card.getAnimations().forEach(function (animation) {
        try { animation.finish(); }
        catch (error) { try { animation.cancel(); } catch (ignored) {} }
      });
    });
  }
  function renderSettledBoard() {
    render();
    settleUsageCardAnimations();
  }

  function rememberedUsageControl(event) {
    if (document.body.classList.contains('pm7u-pointer-op')) return null;
    var matches = [];
    $$('.pm7u-card', board).forEach(function (cardElement) {
      var magnet = cardElement.__pm8;
      if (!magnet || !magnet.controlTarget || magnet.controlPointerId !== event.pointerId) return;
      var age = Number(event.timeStamp) - Number(magnet.controlStamp || 0), halo = Number(magnet.controlHalo || 0);
      if (!(age >= 0 && age <= 400) ||
          event.clientX < magnet.controlLeft - halo || event.clientX > magnet.controlRight + halo ||
          event.clientY < magnet.controlTop - halo || event.clientY > magnet.controlBottom + halo) return;
      var control = $('.pm7u-' + magnet.controlTarget, cardElement);
      if (!control) return;
      var centerX = (magnet.controlLeft + magnet.controlRight) / 2;
      var centerY = (magnet.controlTop + magnet.controlBottom) / 2;
      matches.push({ card:cardElement, control:control, kind:magnet.controlTarget, magnet:magnet, score:Math.hypot(event.clientX-centerX,event.clientY-centerY) });
    });
    matches.sort(function (left, right) { return left.score - right.score; });
    return matches[0] || null;
  }
  function clearUsageCardControlLease(cardElement) {
    var magnet = cardElement && cardElement.__pm8;
    if (!magnet) return;
    magnet.controlTarget = null; magnet.controlX = Infinity; magnet.controlY = Infinity; magnet.controlStamp = 0;
    magnet.controlPointerId = null; magnet.controlLeft = Infinity; magnet.controlTop = Infinity;
    magnet.controlRight = -Infinity; magnet.controlBottom = -Infinity; magnet.controlHalo = 0;
  }
  document.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || event.pointerType === 'touch' ||
        (event.target.closest && event.target.closest('button,a,input,select,textarea,[role="button"]'))) return;
    var remembered = rememberedUsageControl(event);
    if (!remembered) return;
    var topHit = document.elementFromPoint(event.clientX, event.clientY);
    if (!topHit || !remembered.card.contains(topHit)) {
      clearUsageCardControlLease(remembered.card);
      return;
    }
    var item = widgetById(remembered.card.getAttribute('data-widget'));
    if (!item) return;
    clearUsageCardControlLease(remembered.card);
    try { remembered.control.focus({ preventScroll:true }); } catch (error) { remembered.control.focus(); }
    if (remembered.kind === 'drag') startDrag(event, remembered.card, remembered.control);
    else startResize(event, remembered.card, item, remembered.control);
  }, true);

  function wireCards() {
    $$('.pm7u-card', board).forEach(function (cardElement) {
      var item = widgetById(cardElement.getAttribute('data-widget'));
      if (!item) return;
      var menu = $('.pm7u-cardmenu', cardElement);
      var resize = $('.pm7u-resize', cardElement);
      var drag = $('.pm7u-drag', cardElement);
      menu.addEventListener('click', function (event) {
        event.stopPropagation(); app._menuWidget = item; openPop($('#pm7uCardPop'), menu, cardMenuHTML(item));
      });
      resize.addEventListener('pointerdown', function (event) { startResize(event, cardElement, item); });
      resize.addEventListener('keydown', function (event) {
        if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;
        var before = layoutFor(item), cols = before.cols, rows = before.rows;
        if (event.key === 'ArrowLeft') cols -= event.shiftKey ? 2 : 1;
        else if (event.key === 'ArrowRight') cols += event.shiftKey ? 2 : 1;
        else if (event.key === 'ArrowUp') rows -= 1;
        else if (event.key === 'ArrowDown') rows += 1;
        else return;
        event.preventDefault();
        var resolved = resolveResizeIntent(item, before, cols, rows);
        var applied = setLayout(item, resolved.cols, resolved.rows, 'cmd.widget.resize', 'keyboard');
        if (before.cols === applied.cols && before.rows === applied.rows) return;
        renderSettledBoard();
        var next = $('.pm7u-card[data-widget="' + item.id + '"] .pm7u-resize', board); if (next) next.focus();
      });
      drag.addEventListener('pointerdown', function (event) { startDrag(event, cardElement); });
      drag.addEventListener('keydown', function (event) { startKeyboardDrag(event, cardElement, drag); });
    });
  }

  function resetUsageMagnetState() {
    Array.prototype.forEach.call(document.querySelectorAll('.pm7u-card'), function (card) {
      var magnet = card.__pm8;
      if (magnet) {
        magnet.hover = false; magnet.neutral = false; magnet.controlGain = 1;
        magnet.controlTarget = null; magnet.controlX = Infinity; magnet.controlY = Infinity; magnet.controlStamp = 0;
        magnet.controlPointerId = null; magnet.controlLeft = Infinity; magnet.controlTop = Infinity;
        magnet.controlRight = -Infinity; magnet.controlBottom = -Infinity; magnet.controlHalo = 0;
        magnet.x = 0; magnet.y = 0; magnet.vx = 0; magnet.vy = 0;
        magnet.wx = Infinity; magnet.wy = Infinity; magnet.base = null;
      }
      card.style.translate = '';
      card.classList.remove('pm8-live', 'pm7u-control-neutral');
    });
  }
  function opOn() { document.body.classList.add('pm7u-pointer-op'); }
  function opOff() {
    resetUsageMagnetState();
    document.body.classList.remove('pm7u-pointer-op');
    scheduleUsageVisibleLayout();
  }
  function applyLiveLayout(cardElement, layout, item) {
    var oldDensity = cardElement.getAttribute('data-density');
    var density = densityFor(layout, item), shape = shapeFor(layout, item);
    cardElement.style.setProperty('--pm7u-cols', layout.cols);
    cardElement.style.setProperty('--pm7u-rows', layout.rows);
    cardElement.setAttribute('data-cols', layout.cols);
    cardElement.setAttribute('data-rows', layout.rows);
    cardElement.setAttribute('data-density', density);
    cardElement.setAttribute('data-shape', shape);
    cardElement.classList.toggle('is-wide', layout.cols >= 5);
    cardElement.classList.toggle('is-tall', layout.rows >= 2);
    cardElement.classList.toggle('is-compact', layout.rows === 1);
    if (oldDensity !== density) {
      cardElement.classList.remove('is-density-changing');
      void cardElement.offsetWidth;
      cardElement.classList.add('is-density-changing');
      setTimeout(function () { cardElement.classList.remove('is-density-changing'); }, 190);
    }
    applyPhysicalContentTier(cardElement);
    scheduleUsageChartLabels(cardElement);
    return density;
  }

  /* PM7 T43: live occupied-neighbor Usage resize preview. */
  function prepareUsageGridResize(session,intent) {
    if(!session||!intent)return null;
    return prepareUsageGridMove(session,intent,fullRoomOrder(session.originalOrder));
  }
  function commitUsageGridResize(session,intent,item,before,next,source) {
    var candidateState=prepareUsageGridResize(session,intent);
    if(!candidateState)return {committed:false,dispatched:false};
    var receipt=command(
      'cmd.widget.resize',
      {page:'usage',instance_id:item.id,col_span:next.cols,row_span:next.rows},
      {persisted:false,source:source},
      {defer_receipt:true}
    );
    if(receipt.dispatch_accepted===false){
      completeCommandReceipt(receipt,{persisted:false,reason:'owner_rejected',rolled_back:true},'rejected');
      return {committed:false,dispatched:true};
    }
    if(!persistUsageWholeState(candidateState)){
      completeCommandReceipt(receipt,{persisted:false,reason:'usage_workspace_write_failed',rolled_back:true},'failed');
      return {committed:false,dispatched:true};
    }
    completeCommandReceipt(receipt,{persisted:true,source:source},'accepted');
    usageEvent('view.usage.widget_resized',{widget_id:item.id,source:source,before:before,after:next,content_density:densityFor(next,item)});
    return {committed:true,dispatched:true};
  }
  function startResize(event, cardElement, item, controlHandle) {
    settleUsageCardAnimations();resetUsageMagnetState();
    clearUsageCardControlLease(cardElement);
    if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation(); closePops();
    var handle = controlHandle || event.currentTarget || event.target, pointerId = event.pointerId;
    var session=createUsageGridSession(cardElement);if(!session)return;
    var original = layoutFor(item), startX = event.clientX, startY = event.clientY;
    var boardStyle = getComputedStyle(board);
    var columnGap = parseFloat(boardStyle.columnGap) || 10;
    var rowGap = parseFloat(boardStyle.rowGap) || columnGap;
    var rowHeight = parseFloat(boardStyle.gridAutoRows) || 100;
    var trackCount=session.metrics.trackCount;
    var cellWidth=session.metrics.trackWidth;
    function physicalColumnSpan(logicalCols) {
      var liveStyle=getComputedStyle(cardElement),start=String(liveStyle.gridColumnStart||''),end=String(liveStyle.gridColumnEnd||'');
      if(start==='1'&&end==='-1')return trackCount;
      var explicitSpan=/span\s+([0-9]+)/.exec(end);
      return explicitSpan?Math.max(1,Math.min(trackCount,Number(explicitSpan[1]))):Math.max(1,Math.min(trackCount,logicalCols));
    }
    function physicalRowSpan(logicalRows) {
      var end=String(getComputedStyle(cardElement).gridRowEnd||''),explicitSpan=/span\s+([0-9]+)/.exec(end);
      return explicitSpan?Math.max(1,Number(explicitSpan[1])):Math.max(1,logicalRows);
    }
    var lastCols=original.cols,lastRows=original.rows,lastIntent=session.originalIntent;
    var changed=false,finished=false;
    var origin=cardElement.getBoundingClientRect();

    var placeholder=document.createElement('div');
    placeholder.className='pm7u-resize-placeholder';placeholder.setAttribute('aria-hidden','true');
    board.insertBefore(placeholder,cardElement);

    cardElement.classList.add('is-resizing','pm7u-resize-lift');
    cardElement.style.left=origin.left+'px';cardElement.style.top=origin.top+'px';
    cardElement.style.width=origin.width+'px';cardElement.style.height=origin.height+'px';
    /* Persisted grid slots are inline !important declarations. Removing,
       rather than assigning auto, exposes the current responsive CSS span. */
    cardElement.style.removeProperty('grid-column');cardElement.style.removeProperty('grid-row');
    /* A restored slot owns grid-column through [data-pm7-slot-id].  Suspend
       that selector while the fixed lift derives its responsive span from
       the requested logical size; the captured session restores or replaces
       the slot identity synchronously at terminal settlement. */
    cardElement.removeAttribute('data-pm7-slot-id');opOn();
    session.apply(lastIntent,placeholder,false);

    var hud=document.createElement('div');hud.className='pm7u-sizehud';document.body.appendChild(hud);
    function updateHud(pointerEvent,layout){
      hud.textContent=layout.cols+' columns · '+layout.rows+' row'+(layout.rows===1?'':'s')+' · '+densityLabel(densityFor(layout,item));
      hud.style.left=Math.min(innerWidth-215,pointerEvent.clientX+12)+'px';
      hud.style.top=Math.min(innerHeight-34,pointerEvent.clientY+12)+'px';
    }
    function alignLiftToPlaceholder(){
      var target=placeholder.getBoundingClientRect();
      cardElement.style.left=target.left+'px';cardElement.style.top=target.top+'px';
      cardElement.style.width=target.width+'px';cardElement.style.height=target.height+'px';
    }
    alignLiftToPlaceholder();updateHud(event,original);
    function move(moveEvent){
      if(moveEvent.pointerId!==pointerId)return;moveEvent.preventDefault();
      var colSteps=quantizeResizeSteps(moveEvent.clientX-startX,cellWidth+columnGap,Math.max(0,window.innerWidth-startX),Math.max(0,startX));
      var rowSteps=Math.round((moveEvent.clientY-startY)/(rowHeight+rowGap));
      var next=resolveResizeIntent(item,original,original.cols+colSteps,original.rows+rowSteps);
      if(next.cols===lastCols&&next.rows===lastRows){updateHud(moveEvent,next);return;}
      applyLiveLayout(cardElement,next,item);
      var intent=session.resizeIntent(physicalColumnSpan(next.cols),physicalRowSpan(next.rows));
      if(!intent){applyLiveLayout(cardElement,{cols:lastCols,rows:lastRows},item);updateHud(moveEvent,{cols:lastCols,rows:lastRows});return;}
      lastCols=next.cols;lastRows=next.rows;lastIntent=intent;
      changed=next.cols!==original.cols||next.rows!==original.rows;
      session.apply(lastIntent,placeholder,true);alignLiftToPlaceholder();
      applyPhysicalContentTier(cardElement);scheduleUsageChartLabels(cardElement);updateHud(moveEvent,next);
    }
    function clearTransient(){
      document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',commit,true);
      document.removeEventListener('pointercancel',cancel,true);document.removeEventListener('keydown',keydown,true);
      window.removeEventListener('blur',blur);handle.removeEventListener('lostpointercapture',lostCapture);
      try{if(handle.hasPointerCapture(pointerId))handle.releasePointerCapture(pointerId);}catch(error){}
      cardElement.classList.remove('is-resizing','pm7u-resize-lift','is-density-changing');
      cardElement.style.left='';cardElement.style.top='';cardElement.style.width='';cardElement.style.height='';
      cardElement.style.removeProperty('grid-column');cardElement.style.removeProperty('grid-row');
      if(placeholder.parentNode)placeholder.remove();if(hud.parentNode)hud.remove();
    }
    function finish(shouldCommit){
      if(finished)return;finished=true;
      var outcome={committed:false,dispatched:false};
      if(shouldCommit&&changed)outcome=commitUsageGridResize(session,lastIntent,item,original,{cols:lastCols,rows:lastRows},'pointer');
      if(outcome.committed){
        clearTransient();
        session.cards.forEach(cancelUsagePeerAnimation);
        setUsageGridStyle(cardElement,lastIntent.placements[session.movedId],usageSlotId(session.metrics,lastIntent.placements[session.movedId]));
        session.restoreBoardMinHeight();opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();
      }else{
        applyLiveLayout(cardElement,original,item);clearTransient();session.restore();
        opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();
      }
    }
    function validRelease(upEvent){
      var releaseX=Number(upEvent.clientX),releaseY=Number(upEvent.clientY);
      if(!isFinite(releaseX)||!isFinite(releaseY))return false;
      var horizontalStep=Math.max(1,cellWidth+columnGap),verticalStep=Math.max(1,rowHeight+rowGap);
      var viewportWidth=Math.max(1,document.documentElement.clientWidth||window.innerWidth||0);
      var viewportHeight=Math.max(1,document.documentElement.clientHeight||window.innerHeight||0);
      return releaseX>=-horizontalStep&&releaseX<=viewportWidth+horizontalStep&&releaseY>=-verticalStep&&releaseY<=viewportHeight+verticalStep;
    }
    function commit(upEvent){if(upEvent.pointerId!==pointerId)return;upEvent.preventDefault();finish(validRelease(upEvent));}
    function cancel(cancelEvent){if(cancelEvent&&cancelEvent.pointerId!=null&&cancelEvent.pointerId!==pointerId)return;finish(false);}
    function keydown(keyEvent){if(keyEvent.key!=='Escape')return;keyEvent.preventDefault();finish(false);}
    function blur(){finish(false);}
    function lostCapture(captureEvent){if(captureEvent.pointerId===pointerId)finish(false);}

    handle.addEventListener('lostpointercapture',lostCapture);
    try{handle.setPointerCapture(pointerId);}catch(error){}
    document.addEventListener('pointermove',move,{capture:true,passive:false});
    document.addEventListener('pointerup',commit,true);document.addEventListener('pointercancel',cancel,true);
    document.addEventListener('keydown',keydown,true);window.addEventListener('blur',blur);
  }


  function flipBefore() {
    var map = {};
    $$('.pm7u-card', board).forEach(function (element) { map[element.getAttribute('data-widget')] = element.getBoundingClientRect(); });
    return map;
  }
  function flipAfter(before) {
    $$('.pm7u-card', board).forEach(function (element) {
      var first = before[element.getAttribute('data-widget')], last = element.getBoundingClientRect();
      if (!first) return;
      var x = first.left - last.left, y = first.top - last.top;
      if (!x && !y) return;
      element.style.transition = 'none'; element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      requestAnimationFrame(function () { element.style.transition = 'transform 260ms cubic-bezier(.2,.8,.2,1)'; element.style.transform = ''; setTimeout(function () { element.style.transition = ''; element.style.transform = ''; }, 280); });
    });
  }
  function currentOrder() {
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
  function usageGridMetrics() {
    var style = getComputedStyle(board), rect = board.getBoundingClientRect();
    var tracks = String(style.gridTemplateColumns || '').trim().split(/\s+/).filter(function (track) { return track && track !== 'none'; });
    var trackCount = tracks.length || 12;
    var columnGap = parseFloat(style.columnGap) || 10, rowGap = parseFloat(style.rowGap) || columnGap;
    var paddingLeft = parseFloat(style.paddingLeft) || 0, paddingRight = parseFloat(style.paddingRight) || 0, paddingTop = parseFloat(style.paddingTop) || 0;
    var innerWidth = board.clientWidth - paddingLeft - paddingRight;
    return {
      rect:rect, trackCount:trackCount, columnGap:columnGap, rowGap:rowGap,
      trackWidth:(innerWidth-columnGap*Math.max(0,trackCount-1))/trackCount,
      rowHeight:parseFloat(style.gridAutoRows) || 108,
      contentLeft:board.clientLeft+paddingLeft, contentTop:board.clientTop+paddingTop
    };
  }
  function usageGridRect(position, metrics) {
    var left = metrics.contentLeft + (position.col-1)*(metrics.trackWidth+metrics.columnGap);
    var top = metrics.contentTop + (position.row-1)*(metrics.rowHeight+metrics.rowGap);
    var width = position.col_span*metrics.trackWidth + Math.max(0,position.col_span-1)*metrics.columnGap;
    var height = position.row_span*metrics.rowHeight + Math.max(0,position.row_span-1)*metrics.rowGap;
    return { left:left,top:top,right:left+width,bottom:top+height,width:width,height:height };
  }
  function usagePlacementFromRect(element, metrics) {
    var rect = element.getBoundingClientRect();
    var left = rect.left-metrics.rect.left-metrics.contentLeft, top = rect.top-metrics.rect.top-metrics.contentTop;
    return {
      col:Math.max(1,Math.min(metrics.trackCount,Math.round(left/Math.max(1,metrics.trackWidth+metrics.columnGap))+1)),
      row:Math.max(1,Math.round(top/Math.max(1,metrics.rowHeight+metrics.rowGap))+1),
      col_span:Math.max(1,Math.min(metrics.trackCount,Math.round((rect.width+metrics.columnGap)/Math.max(1,metrics.trackWidth+metrics.columnGap)))),
      row_span:Math.max(1,Math.round((rect.height+metrics.rowGap)/Math.max(1,metrics.rowHeight+metrics.rowGap)))
    };
  }
  function usageSlotId(metrics, position) { return 'usage-grid-v1:b' + metrics.trackCount + ':r' + position.row + ':c' + position.col; }
  function usagePositionsOverlap(left, right) {
    return left.col < right.col+right.col_span && left.col+left.col_span > right.col && left.row < right.row+right.row_span && left.row+left.row_span > right.row;
  }
  function usagePositionFree(position, occupied) { return !occupied.some(function (other) { return usagePositionsOverlap(position, other); }); }
  function setUsageGridStyle(element, position, slotId) {
    if (!element || !position) return;
    var column = position.col + ' / span ' + position.col_span, row = position.row + ' / span ' + position.row_span;
    if (element.classList.contains('pm7u-reorder-placeholder')) {
      element.setAttribute('data-grid-slot','true');
      element.style.setProperty('--pm7u-target-column',column);
      element.style.setProperty('--pm7u-target-row',row);
    } else if (element.classList.contains('pm7u-resize-placeholder')) {
      element.setAttribute('data-grid-slot','true');
      element.style.setProperty('--pm7-placeholder-column',column);
      element.style.setProperty('--pm7-placeholder-row',row);
    } else {
      element.style.setProperty('grid-column',column,'important');
      element.style.setProperty('grid-row',row,'important');
      element.style.setProperty('--pm7u-settled-column',column);
      element.style.setProperty('--pm7u-settled-row',row);
      if (slotId) element.setAttribute('data-pm7-slot-id',slotId); else element.removeAttribute('data-pm7-slot-id');
      element.setAttribute('data-pm7-slot-col',String(position.col));
      element.setAttribute('data-pm7-slot-row',String(position.row));
    }
  }
  function projectUsageSlot(saved, physical, metrics) {
    var sourceMax = Math.max(1,saved.basis_cols-saved.col_span+1), targetMax = Math.max(1,metrics.trackCount-physical.col_span+1);
    var ratio = sourceMax <= 1 ? 0 : (saved.col-1)/(sourceMax-1);
    return { col:Math.max(1,Math.min(targetMax,Math.round(ratio*Math.max(0,targetMax-1))+1)), row:saved.row, col_span:physical.col_span, row_span:physical.row_span };
  }
  function nearestFreeUsagePosition(preferred, occupied, metrics, rowLimit) {
    var best = null, bestScore = Infinity;
    for (var row=1; row<=rowLimit; row+=1) {
      for (var col=1; col<=metrics.trackCount-preferred.col_span+1; col+=1) {
        var candidate = { col:col,row:row,col_span:preferred.col_span,row_span:preferred.row_span };
        if (!usagePositionFree(candidate,occupied)) continue;
        var score = Math.abs(row-preferred.row)*metrics.trackCount*2 + Math.abs(col-preferred.col);
        if (score < bestScore) { bestScore=score; best=candidate; }
      }
    }
    return best;
  }
  function applySettledUsageSlots() {
    /* Persisted slots require physical card and board geometry.  Hidden-page
       boot renders keep their authored flow instead of projecting from zero. */
    if (!usagePanel.classList.contains('active') || board.clientWidth <= 0) return false;
    var cards = $$('.pm7u-card',board);
    if (!cards.length) return;
    var metrics = usageGridMetrics(), occupied=[];
    cards.forEach(function (card) {
      var key=state.room+':'+card.getAttribute('data-widget'), saved=state.layout[key];
      if (!saved || !saved.slot_id) return;
      var physical=usagePlacementFromRect(card,metrics);
      var projected=projectUsageSlot(saved,physical,metrics);
      if (!usagePositionFree(projected,occupied)) projected=nearestFreeUsagePosition(projected,occupied,metrics,Math.max(48,projected.row+physical.row_span+12));
      if (!projected) return;
      occupied.push(projected);
      setUsageGridStyle(card,projected,usageSlotId(metrics,projected));
    });
  }
  function captureUsageGridStyle(element) {
    return {
      column:element.style.getPropertyValue('grid-column'), columnPriority:element.style.getPropertyPriority('grid-column'),
      row:element.style.getPropertyValue('grid-row'), rowPriority:element.style.getPropertyPriority('grid-row'),
      settledColumn:element.style.getPropertyValue('--pm7u-settled-column'), settledRow:element.style.getPropertyValue('--pm7u-settled-row'),
      slotId:element.getAttribute('data-pm7-slot-id'), slotCol:element.getAttribute('data-pm7-slot-col'), slotRow:element.getAttribute('data-pm7-slot-row')
    };
  }
  function restoreUsageGridStyle(element, saved) {
    ['grid-column','grid-row','--pm7u-settled-column','--pm7u-settled-row'].forEach(function (name) { element.style.removeProperty(name); });
    if (saved.column) element.style.setProperty('grid-column',saved.column,saved.columnPriority);
    if (saved.row) element.style.setProperty('grid-row',saved.row,saved.rowPriority);
    if (saved.settledColumn) element.style.setProperty('--pm7u-settled-column',saved.settledColumn);
    if (saved.settledRow) element.style.setProperty('--pm7u-settled-row',saved.settledRow);
    [['data-pm7-slot-id',saved.slotId],['data-pm7-slot-col',saved.slotCol],['data-pm7-slot-row',saved.slotRow]].forEach(function (entry) { if (entry[1] == null) element.removeAttribute(entry[0]); else element.setAttribute(entry[0],entry[1]); });
  }
  function cancelUsagePeerAnimation(element) {
    if (element && element._pm7ReorderAnimation) { try { element._pm7ReorderAnimation.cancel(); } catch (error) {} element._pm7ReorderAnimation=null; }
    if (element) element.style.removeProperty('transform');
  }
  function createUsageGridSession(cardElement) {
    var metrics=usageGridMetrics(), cards=$$('.pm7u-card',board), movedId=cardElement.getAttribute('data-widget');
    if ([4,6,12].indexOf(metrics.trackCount)<0) return null;
    var cardsById={}, originalOrder=cards.map(function (card) { var id=card.getAttribute('data-widget'); cardsById[id]=card; return id; });
    var originalStyles={}, originalPlacements={}, maxBottom=1, totalRowSpans=0;
    cards.forEach(function (card) {
      var id=card.getAttribute('data-widget'), position=usagePlacementFromRect(card,metrics);
      originalStyles[id]=captureUsageGridStyle(card); originalPlacements[id]=position;
      maxBottom=Math.max(maxBottom,position.row+position.row_span-1);
      totalRowSpans+=position.row_span;
    });
    var moved=originalPlacements[movedId], maxTargetRow=maxBottom+moved.row_span+2, packingRowLimit=maxBottom+totalRowSpans+moved.row_span+4, originalIndex={};
    originalOrder.forEach(function (id,index) { originalIndex[id]=index; });
    function nearest(preferred,occupied) { return nearestFreeUsagePosition(preferred,occupied,metrics,packingRowLimit); }
    function simulate(target) {
      var placements={}, occupied=[];
      placements[movedId]=target; occupied.push(target);
      for (var orderIndex=0; orderIndex<originalOrder.length; orderIndex+=1) {
        var id=originalOrder[orderIndex];
        if (id===movedId) continue;
        var preferred=originalPlacements[id], position=usagePositionFree(preferred,occupied) ? Object.assign({},preferred) : nearest(preferred,occupied);
        if (!position) return null;
        placements[id]=position; occupied.push(position);
      }
      if (Object.keys(placements).length!==originalOrder.length) return null;
      var resultingOrder=originalOrder.slice().sort(function (left,right) {
        var a=placements[left], b=placements[right];
        return a.row-b.row || a.col-b.col || originalIndex[left]-originalIndex[right];
      });
      var movedIndex=resultingOrder.indexOf(movedId);
      return { placements:placements,resulting_order:resultingOrder,before_id:movedIndex+1<resultingOrder.length?resultingOrder[movedIndex+1]:null,after_id:movedIndex>0?resultingOrder[movedIndex-1]:null };
    }
    function resizeIntent(colSpan,rowSpan) {
      colSpan=Math.max(1,Math.min(metrics.trackCount,Math.round(colSpan)));
      rowSpan=Math.max(1,Math.round(rowSpan));
      var target={
        col:Math.max(1,Math.min(moved.col,metrics.trackCount-colSpan+1)),
        row:moved.row,col_span:colSpan,row_span:rowSpan
      };
      var simulated=simulate(target);if(!simulated)return null;
      var movedIndex=simulated.resulting_order.indexOf(movedId);
      return {
        token:usageSlotId(metrics,target)+':'+colSpan+'x'+rowSpan,
        slot_id:usageSlotId(metrics,target),col:target.col,row:target.row,index:movedIndex,
        before_id:simulated.before_id,after_id:simulated.after_id,
        rect:usageGridRect(target,metrics),placements:simulated.placements,resulting_order:simulated.resulting_order
      };
    }
    var candidates=[];
    for (var row=1; row<=maxTargetRow; row+=1) {
      for (var col=1; col<=metrics.trackCount-moved.col_span+1; col+=1) {
        var target={col:col,row:row,col_span:moved.col_span,row_span:moved.row_span}, simulated=simulate(target), rect=usageGridRect(target,metrics);
        if (!simulated) continue;
        candidates.push({ token:usageSlotId(metrics,target),slot_id:usageSlotId(metrics,target),col:col,row:row,index:simulated.resulting_order.indexOf(movedId),before_id:simulated.before_id,after_id:simulated.after_id,rect:rect,placements:simulated.placements,resulting_order:simulated.resulting_order });
      }
    }
    var originalMovedIndex=originalOrder.indexOf(movedId);
    var originalIntent={
      token:usageSlotId(metrics,moved),slot_id:usageSlotId(metrics,moved),col:moved.col,row:moved.row,index:originalMovedIndex,
      before_id:originalMovedIndex+1<originalOrder.length?originalOrder[originalMovedIndex+1]:null,
      after_id:originalMovedIndex>0?originalOrder[originalMovedIndex-1]:null,
      rect:usageGridRect(moved,metrics),placements:Object.assign({},originalPlacements),resulting_order:originalOrder.slice()
    };
    var originalBoardMinHeight=board.style.getPropertyValue('min-height'), originalBoardMinHeightPriority=board.style.getPropertyPriority('min-height');
    function snapshotRects() { var map={}; cards.forEach(function (card) { if (!card.classList.contains('is-reorder-source')) map[card.getAttribute('data-widget')]=card.getBoundingClientRect(); }); return map; }
    function animate(before) {
      var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
      cards.forEach(function (card) {
        var id=card.getAttribute('data-widget'), first=before[id]; cancelUsagePeerAnimation(card);
        if (!first || card.classList.contains('is-reorder-source')) return;
        var last=card.getBoundingClientRect(), x=first.left-last.left, y=first.top-last.top;
        if (Math.abs(x)<.5 && Math.abs(y)<.5 || reduce || typeof card.animate!=='function') return;
        var animation=card.animate([{transform:'translate3d('+x+'px,'+y+'px,0)'},{transform:'translate3d(0,0,0)'}],{duration:190,easing:'cubic-bezier(.2,.8,.2,1)'});
        card._pm7ReorderAnimation=animation;
        animation.onfinish=animation.oncancel=function(){if(card._pm7ReorderAnimation===animation)card._pm7ReorderAnimation=null;};
      });
    }
    function apply(intent,movingElement,animateChange) {
      var before=animateChange===false?null:snapshotRects(), maxPlacedBottom=1;
      Object.keys(intent.placements).forEach(function (id) {
        var element=id===movedId?movingElement:cardsById[id], position=intent.placements[id];
        setUsageGridStyle(element,position,usageSlotId(metrics,position));
        maxPlacedBottom=Math.max(maxPlacedBottom,position.row+position.row_span-1);
      });
      /* Preview positions are explicit grid slots. Keep peer DOM nodes mounted
         so their entrance animation and painted opacity cannot restart. */
      var reachableBottom=Math.max(maxPlacedBottom,maxTargetRow+moved.row_span-1);
      var minHeight=metrics.contentTop+reachableBottom*metrics.rowHeight+Math.max(0,reachableBottom-1)*metrics.rowGap+8;
      board.style.setProperty('min-height',Math.ceil(minHeight)+'px');
      if (before) animate(before);
    }
    function restoreBoardMinHeight() {
      if (originalBoardMinHeight) board.style.setProperty('min-height',originalBoardMinHeight,originalBoardMinHeightPriority); else board.style.removeProperty('min-height');
    }
    function restore() {
      cards.forEach(cancelUsagePeerAnimation);
      originalOrder.forEach(function (id) { restoreUsageGridStyle(cardsById[id],originalStyles[id]); });
      restoreBoardMinHeight();
    }
    return { metrics:metrics,cards:cards,cardsById:cardsById,movedId:movedId,originalOrder:originalOrder,originalPlacements:originalPlacements,originalStyles:originalStyles,candidates:candidates,originalIntent:originalIntent,resizeIntent:resizeIntent,apply:apply,restore:restore,restoreBoardMinHeight:restoreBoardMinHeight };
  }
  function liveUsageStateSnapshot() {
    var candidate={};
    WORKSPACE_FIELDS.forEach(function (field) { candidate[field]=state[field] && typeof state[field]==='object' ? JSON.parse(JSON.stringify(state[field])) : state[field]; });
    return candidate;
  }
  function persistUsageWholeState(candidateState) {
    var clean=sanitizeUsageState(candidateState), nextEnvelope={
      schema_version:WORKSPACE_SCHEMA_VERSION,default_set_version:WORKSPACE_DEFAULT_SET_VERSION,prototype_only:true,
      committed_revision:USAGE_WORKSPACE.committed_revision+1,legacy_import:USAGE_WORKSPACE.legacy_import,
      prior_workspace_import:USAGE_WORKSPACE.prior_workspace_import,state:clean
    };
    if (!persistUsageWorkspaceEnvelope(nextEnvelope)) return false;
    USAGE_WORKSPACE.committed_revision=nextEnvelope.committed_revision;
    USAGE_WORKSPACE.state=clean;
    WORKSPACE_FIELDS.forEach(function (field) { state[field]=clean[field] && typeof clean[field]==='object' ? JSON.parse(JSON.stringify(clean[field])) : clean[field]; });
    return true;
  }
  function clearUsageRoomSlots(candidateState,room) {
    Object.keys(candidateState.layout||{}).forEach(function (key) {
      if (key.indexOf(room+':')!==0) return;
      var record=candidateState.layout[key];
      if (!record||typeof record!=='object') return;
      ['slot_id','basis_cols','col','row','col_span','row_span'].forEach(function (field) { delete record[field]; });
    });
    return candidateState;
  }
  function prepareUsageGridMove(session,intent,fullOrder) {
    var candidateState=liveUsageStateSnapshot(), room=state.room;
    candidateState.order[room]=fullOrder.slice();
    intent.resulting_order.forEach(function (id) {
      var card=session.cardsById[id], position=intent.placements[id], key=room+':'+id;
      if (!card || !position) return;
      var prior=candidateState.layout[key] || {};
      candidateState.layout[key]={
        cols:Number(card.getAttribute('data-cols')) || prior.cols,
        rows:Number(card.getAttribute('data-rows')) || prior.rows,
        slot_id:usageSlotId(session.metrics,position),basis_cols:session.metrics.trackCount,
        col:position.col,row:position.row,col_span:position.col_span,row_span:position.row_span
      };
    });
    var clean=sanitizeUsageState(candidateState), valid=intent.resulting_order.length===session.originalOrder.length;
    intent.resulting_order.forEach(function (id) {
      var expected=candidateState.layout[room+':'+id], observed=clean.layout[room+':'+id];
      if (!expected || !observed || ['cols','rows','slot_id','basis_cols','col','row','col_span','row_span'].some(function (field) { return expected[field]!==observed[field]; })) valid=false;
    });
    return valid?clean:null;
  }
  function commitUsageGridMove(session,intent,source) {
    var original=session.originalPlacements[session.movedId], target=intent.placements[session.movedId];
    var orderChanged=!ordersEqual(session.originalOrder,intent.resulting_order);
    var slotChanged=original.col!==target.col || original.row!==target.row;
    if (!orderChanged && !slotChanged) { session.restore(); return false; }
    var fullOrder=fullRoomOrder(intent.resulting_order);
    var candidateState=prepareUsageGridMove(session,intent,fullOrder);
    if (!candidateState) { session.restore(); return false; }
    var settledPosition={col:target.col-1,row:target.row-1};
    var receipt=command('cmd.widget.move',{page:'usage',instance_id:session.movedId,col:settledPosition.col,row:settledPosition.row},{persisted:false,room:state.room,visual_order:fullOrder,source:source,slot_id:intent.slot_id},{defer_receipt:true});
    if (receipt.dispatch_accepted===false) {
      session.restore(); completeCommandReceipt(receipt,{persisted:false,reason:'owner_rejected',rolled_back:true},'rejected'); return false;
    }
    if (!persistUsageWholeState(candidateState)) {
      session.restore(); completeCommandReceipt(receipt,{persisted:false,reason:'usage_workspace_write_failed',rolled_back:true},'failed'); return false;
    }
    completeCommandReceipt(receipt,{persisted:true,room:state.room,visual_order:fullOrder,source:source,slot_id:intent.slot_id},'accepted');
    usageEvent('view.usage.widget_moved',{widget_id:session.movedId,room:state.room,order:fullOrder,settled_position:settledPosition,source:source});
    session.restoreBoardMinHeight();
    intent.resulting_order.forEach(function(id){var element=session.cardsById[id];if(element)board.appendChild(element);});
    return true;
  }
  function directionalUsageIntent(session,current,key) {
    var origin=current.rect, originX=origin.left+origin.width/2, originY=origin.top+origin.height/2, best=null, bestScore=Infinity;
    session.candidates.forEach(function (candidate) {
      var x=candidate.rect.left+candidate.rect.width/2, y=candidate.rect.top+candidate.rect.height/2;
      var primary=key==='ArrowLeft'?originX-x:key==='ArrowRight'?x-originX:key==='ArrowUp'?originY-y:y-originY;
      if (primary<=1) return;
      var cross=key==='ArrowLeft'||key==='ArrowRight'?Math.abs(y-originY):Math.abs(x-originX);
      var score=primary+cross*2;
      if(score<bestScore){bestScore=score;best=candidate;}
    });
    return best || current;
  }
  function finishKeyboardDrag(handle,cardElement,shouldCommit,restoreFocus) {
    var move=handle._pm7KeyboardMove;if(!move)return false;
    handle._pm7KeyboardMove=null;
    if(handle._pm7KeyboardBlur)handle.removeEventListener('blur',handle._pm7KeyboardBlur);
    if(handle._pm7KeyboardDocumentKeydown)document.removeEventListener('keydown',handle._pm7KeyboardDocumentKeydown,true);
    if(handle._pm7KeyboardBlurTimer)clearTimeout(handle._pm7KeyboardBlurTimer);
    handle._pm7KeyboardBlur=null;handle._pm7KeyboardDocumentKeydown=null;handle._pm7KeyboardBlurTimer=null;
    var changed=false;
    if(shouldCommit)changed=commitUsageGridMove(move.session,move.intent,'keyboard');else move.session.restore();
    board._pm7ActiveReorder=null;
    board._pm7LastReorder={widget_id:move.session.movedId,committed:changed,intent:{token:move.intent.token,slot_id:move.intent.slot_id,col:move.intent.col,row:move.intent.row,before_id:move.intent.before_id,after_id:move.intent.after_id},source:'keyboard'};
    handle.setAttribute('aria-grabbed','false');cardElement.classList.remove('is-keyboard-picked');opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();
    if(restoreFocus)handle.focus({preventScroll:true});return changed;
  }
  function startKeyboardDrag(event,cardElement,handle) {
    var key=event.key;
    if(!handle._pm7KeyboardMove){
      if(board._pm7ActiveReorder||document.body.classList.contains('pm7u-pointer-op'))return;
      if(key!=='Enter'&&key!==' ')return;
      event.preventDefault();
      var session=createUsageGridSession(cardElement);
      if(!session)return;
      handle._pm7KeyboardMove={session:session,intent:session.originalIntent};
      handle._pm7KeyboardDocumentKeydown=function(sessionEvent){if(!handle._pm7KeyboardMove)return;sessionEvent.stopImmediatePropagation();startKeyboardDrag(sessionEvent,cardElement,handle);};
      handle._pm7KeyboardBlur=function(){if(handle._pm7KeyboardBlurTimer)clearTimeout(handle._pm7KeyboardBlurTimer);handle._pm7KeyboardBlurTimer=setTimeout(function(){if(handle._pm7KeyboardMove&&document.activeElement!==handle)finishKeyboardDrag(handle,cardElement,false,false);},0);};
      handle.addEventListener('blur',handle._pm7KeyboardBlur);document.addEventListener('keydown',handle._pm7KeyboardDocumentKeydown,true);
      board._pm7ActiveReorder={widget_id:session.movedId,mode:'keyboard',candidates:session.candidates.map(function(candidate){return{token:candidate.token,slot_id:candidate.slot_id,col:candidate.col,row:candidate.row,before_id:candidate.before_id,after_id:candidate.after_id,rect:Object.assign({},candidate.rect)};}),intent:session.originalIntent.token};
      opOn();handle.setAttribute('aria-grabbed','true');cardElement.classList.add('is-keyboard-picked');return;
    }
    if(key==='Escape'){event.preventDefault();finishKeyboardDrag(handle,cardElement,false,true);return;}
    if(key==='Enter'||key===' '){event.preventDefault();finishKeyboardDrag(handle,cardElement,true,true);return;}
    if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].indexOf(key)<0)return;
    event.preventDefault();var move=handle._pm7KeyboardMove,next=directionalUsageIntent(move.session,move.intent,key);
    if(next.token!==move.intent.token){move.session.apply(next,cardElement,true);move.intent=next;if(board._pm7ActiveReorder)board._pm7ActiveReorder.intent=next.token;}
    queueMicrotask(function(){if(handle._pm7KeyboardMove)handle.focus({preventScroll:true});});
  }
  function startDrag(event,cardElement,controlHandle) {
    clearUsageCardControlLease(cardElement);
    if(event.button!==0)return;
    if(board._pm7ActiveReorder||document.body.classList.contains('pm7u-pointer-op'))return;
    event.preventDefault();event.stopPropagation();closePops();
    var handle=controlHandle||event.currentTarget||event.target,pointerId=event.pointerId,session=createUsageGridSession(cardElement);
    if(!session)return;
    var movedId=session.movedId;
    var rect=cardElement.getBoundingClientRect(),offsetX=event.clientX-rect.left,offsetY=event.clientY-rect.top;
    var ghost=cardElement.cloneNode(true);ghost.classList.add('pm7u-ghost');ghost.setAttribute('aria-hidden','true');ghost.inert=true;
    ghost.querySelectorAll('[id]').forEach(function(node){node.removeAttribute('id');});
    ghost.querySelectorAll('button,[href],input,select,textarea,[tabindex]').forEach(function(node){node.setAttribute('tabindex','-1');});
    ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';
    var placeholder=document.createElement('div');placeholder.className='pm7u-reorder-placeholder';placeholder.setAttribute('aria-hidden','true');
    board.insertBefore(placeholder,cardElement);cardElement.classList.add('is-reorder-source');document.body.appendChild(ghost);opOn();handle.setAttribute('aria-grabbed','true');
    var finished=false,validDrop=true,scrollFrame=0,pointerFrame=0,previewConfirmFrame=0,lastPointerX=event.clientX,lastPointerY=event.clientY;
    var paintedIntent=session.originalIntent,requestedIntent=session.originalIntent,intentSerial=0;
    session.apply(paintedIntent,placeholder,false);
    placeholder.setAttribute('data-drop-intent',paintedIntent.token);placeholder.setAttribute('data-drop-serial','0');
    board._pm7ActiveReorder={widget_id:movedId,mode:'pointer',candidates:session.candidates.map(function(candidate){return{token:candidate.token,slot_id:candidate.slot_id,col:candidate.col,row:candidate.row,before_id:candidate.before_id,after_id:candidate.after_id,rect:Object.assign({},candidate.rect)};}),intent:paintedIntent.token,pending_intent:null};
    function ghostAnchorPoint(clientX,clientY){var boardRect=board.getBoundingClientRect();return{x:clientX-offsetX-boardRect.left,y:clientY-offsetY-boardRect.top};}
    function anchorDistanceTo(candidate,point){var dx=point.x-candidate.rect.left,dy=point.y-candidate.rect.top;return dx*dx+dy*dy;}
    function chooseIntent(clientX,clientY){var point=ghostAnchorPoint(clientX,clientY),best=null,bestScore=Infinity;session.candidates.forEach(function(candidate){var score=anchorDistanceTo(candidate,point);if(score<bestScore){bestScore=score;best=candidate;}});if(!best||best.token===requestedIntent.token)return best||requestedIntent;var currentScore=anchorDistanceTo(requestedIntent,point),hysteresis=10;return Math.sqrt(currentScore)-Math.sqrt(bestScore)>hysteresis?best:requestedIntent;}
    function previewMatches(intent){if(!intent||!placeholder.parentNode)return false;var actual=placeholder.getBoundingClientRect(),boardRect=board.getBoundingClientRect(),expected=intent.rect;return Math.abs(actual.left-(boardRect.left+expected.left))<=1&&Math.abs(actual.top-(boardRect.top+expected.top))<=1&&Math.abs(actual.width-expected.width)<=1&&Math.abs(actual.height-expected.height)<=1;}
    function promotePaintedIntent(intent){paintedIntent=intent;if(board._pm7ActiveReorder){board._pm7ActiveReorder.intent=intent.token;board._pm7ActiveReorder.pending_intent=null;}}
    function confirmPreview(serial,retries){
      previewConfirmFrame=0;if(finished||serial!==intentSerial||!placeholder.parentNode)return;
      if(previewMatches(requestedIntent)){promotePaintedIntent(requestedIntent);return;}
      if(retries>0){previewConfirmFrame=requestAnimationFrame(function(){confirmPreview(serial,retries-1);});return;}
      var locked=boardScroll.scrollTop;requestedIntent=paintedIntent;intentSerial+=1;session.apply(paintedIntent,placeholder,false);boardScroll.scrollTop=locked;
      placeholder.setAttribute('data-drop-intent',paintedIntent.token);placeholder.setAttribute('data-drop-serial',String(intentSerial));
      if(board._pm7ActiveReorder){board._pm7ActiveReorder.intent=paintedIntent.token;board._pm7ActiveReorder.pending_intent=null;}
    }
    function placeIntent(intent){
      if(!intent)return;
      if(intent.token===requestedIntent.token){if(intent.token!==paintedIntent.token&&!previewConfirmFrame)previewConfirmFrame=requestAnimationFrame(function(){confirmPreview(intentSerial,2);});return;}
      var locked=boardScroll.scrollTop;requestedIntent=intent;intentSerial+=1;var serial=intentSerial;
      session.apply(intent,placeholder,true);boardScroll.scrollTop=locked;
      placeholder.setAttribute('data-drop-intent',intent.token);placeholder.setAttribute('data-drop-serial',String(serial));
      if(board._pm7ActiveReorder)board._pm7ActiveReorder.pending_intent=intent.token;
      if(previewConfirmFrame)cancelAnimationFrame(previewConfirmFrame);
      previewConfirmFrame=requestAnimationFrame(function(){confirmPreview(serial,2);});
    }
    function visibleScrollRect(){var scrollRect=boardScroll.getBoundingClientRect(),footer=document.querySelector('.pm7-statusbar'),footerRect=footer?footer.getBoundingClientRect():null;return{left:scrollRect.left,right:scrollRect.right,top:scrollRect.top,bottom:footerRect&&footerRect.top>scrollRect.top?Math.min(scrollRect.bottom,footerRect.top):scrollRect.bottom};}
    function pointInside(clientX,clientY){var visible=visibleScrollRect(),boardRect=board.getBoundingClientRect();return clientX>=Math.max(visible.left,boardRect.left)&&clientX<=Math.min(visible.right,boardRect.right)&&clientY>=visible.top&&clientY<=visible.bottom;}
    function paintPointer(){pointerFrame=0;if(finished)return;ghost.style.left=(lastPointerX-offsetX)+'px';ghost.style.top=(lastPointerY-offsetY)+'px';validDrop=pointInside(lastPointerX,lastPointerY);if(validDrop)placeIntent(chooseIntent(lastPointerX,lastPointerY));}
    function schedulePointer(){if(!pointerFrame)pointerFrame=requestAnimationFrame(paintPointer);}
    function edgeScrollVelocity(){var visible=visibleScrollRect(),edge=Math.min(78,Math.max(54,(visible.bottom-visible.top)*.18));if(lastPointerX<visible.left||lastPointerX>visible.right)return 0;if(lastPointerY<visible.top+edge&&boardScroll.scrollTop>0)return-Math.ceil(3+Math.max(0,Math.min(1,(visible.top+edge-lastPointerY)/edge))*9);if(lastPointerY>visible.bottom-edge&&boardScroll.scrollTop<boardScroll.scrollHeight-boardScroll.clientHeight)return Math.ceil(3+Math.max(0,Math.min(1,(lastPointerY-(visible.bottom-edge))/edge))*9);return 0;}
    function autoScrollTick(){scrollFrame=0;if(finished)return;var velocity=edgeScrollVelocity();if(!velocity)return;var before=boardScroll.scrollTop;boardScroll.scrollTop+=velocity;if(boardScroll.scrollTop!==before){paintPointer();scrollFrame=requestAnimationFrame(autoScrollTick);}}
    function ensureAutoScroll(){if(!scrollFrame&&edgeScrollVelocity())scrollFrame=requestAnimationFrame(autoScrollTick);}
    function move(moveEvent){if(moveEvent.pointerId!==pointerId)return;moveEvent.preventDefault();lastPointerX=moveEvent.clientX;lastPointerY=moveEvent.clientY;schedulePointer();ensureAutoScroll();}
    function cleanup(){if(pointerFrame)cancelAnimationFrame(pointerFrame);if(scrollFrame)cancelAnimationFrame(scrollFrame);if(previewConfirmFrame)cancelAnimationFrame(previewConfirmFrame);document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',commit,true);document.removeEventListener('pointercancel',cancel,true);document.removeEventListener('keydown',keydown,true);window.removeEventListener('blur',blur);handle.removeEventListener('lostpointercapture',lostCapture);try{if(handle.hasPointerCapture(pointerId))handle.releasePointerCapture(pointerId);}catch(error){}if(ghost.parentNode)ghost.remove();opOff();handle.setAttribute('aria-grabbed','false');}
    function finish(shouldCommit,restoreFocus){
      if(finished)return;finished=true;if(previewConfirmFrame)cancelAnimationFrame(previewConfirmFrame);previewConfirmFrame=0;
      if(shouldCommit&&requestedIntent.token!==paintedIntent.token){if(previewMatches(requestedIntent))promotePaintedIntent(requestedIntent);else shouldCommit=false;}
      var intent=paintedIntent;if(placeholder.parentNode)session.apply(intent,placeholder,false);var preview=placeholder.getBoundingClientRect(),changed=false,targetLanding;
      if(!shouldCommit){
        if(placeholder.parentNode)placeholder.remove();cardElement.classList.remove('is-reorder-source');session.restore();targetLanding=cardElement.getBoundingClientRect();
      }else{
        if(placeholder.parentNode)placeholder.parentNode.replaceChild(cardElement,placeholder);cardElement.classList.remove('is-reorder-source');
        setUsageGridStyle(cardElement,intent.placements[movedId],intent.slot_id);
        session.cards.forEach(cancelUsagePeerAnimation);settleUsageCardAnimations();targetLanding=cardElement.getBoundingClientRect();changed=commitUsageGridMove(session,intent,'pointer');
      }
      board._pm7ActiveReorder=null;cleanup();settleUsageCardAnimations();var finalLanding=cardElement.getBoundingClientRect();
      board._pm7LastReorder={widget_id:movedId,committed:changed,intent:{token:intent.token,slot_id:intent.slot_id,col:intent.col,row:intent.row,before_id:intent.before_id,after_id:intent.after_id},preview_rect:{left:preview.left,top:preview.top,width:preview.width,height:preview.height},target_landing_rect:{left:targetLanding.left,top:targetLanding.top,width:targetLanding.width,height:targetLanding.height},landing_rect:{left:finalLanding.left,top:finalLanding.top,width:finalLanding.width,height:finalLanding.height},source:'pointer'};
      schedulePhysicalContentTiers();if(restoreFocus!==false)handle.focus({preventScroll:true});
    }
    function commit(upEvent){if(upEvent.pointerId!==pointerId)return;upEvent.preventDefault();finish(validDrop&&pointInside(upEvent.clientX,upEvent.clientY),true);}
    function cancel(cancelEvent){if(cancelEvent&&cancelEvent.pointerId!=null&&cancelEvent.pointerId!==pointerId)return;finish(false,true);}
    function keydown(keyEvent){if(keyEvent.key!=='Escape')return;keyEvent.preventDefault();finish(false,true);}
    function blur(){finish(false,false);}
    function lostCapture(captureEvent){if(!finished&&captureEvent.pointerId===pointerId)finish(false,true);}
    handle.addEventListener('lostpointercapture',lostCapture);try{handle.setPointerCapture(pointerId);}catch(error){}
    document.addEventListener('pointermove',move,{capture:true,passive:false});document.addEventListener('pointerup',commit,true);document.addEventListener('pointercancel',cancel,true);document.addEventListener('keydown',keydown,true);window.addEventListener('blur',blur);
  }

  function inspectorEvent(attemptId) {
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
  function inspectorCard(id) {
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
  function openInspector(title, html) { $('#pm7uInspectorTitle').textContent = title; $('#pm7uInspectorBody').innerHTML = html; $('#pm7uInspector').classList.add('open'); $('#pm7uInspector').setAttribute('aria-hidden', 'false'); }
  function closeInspector() { $('#pm7uInspector').classList.remove('open'); $('#pm7uInspector').setAttribute('aria-hidden', 'true'); }
  $('#pm7uInspectorClose').addEventListener('click', closeInspector);

  /* U11 context module, mounted into every Assistant header. */
  var CTX = { used: 42180, limit: 128000, pct: 33, input: 38200, output: 3980, cache: 96.8, segments: [43, 21, 14, 12, 10], labels: ['Messages', 'Instructions', 'Tools', 'Skills', 'Memory'], compact: 0 };
  function ctxPopupHTML() {
    return '<div class="pm7ctx-head"><b>Context usage</b><span>' + tok(CTX.used) + ' / ' + tok(CTX.limit) + '</span></div><div class="pm7ctx-segbar">' + CTX.segments.map(function (value) { return '<i style="width:' + value + '%"></i>'; }).join('') + '</div><div class="pm7ctx-legend">' + CTX.labels.slice(0, 4).map(function (label, index) { return '<span class="pm7ctx-leg"><i></i>' + label + ' ' + CTX.segments[index] + '%</span>'; }).join('') + '</div><div class="pm7ctx-limit"><span>Current window</span><b>' + CTX.pct + '% used</b><span>Input / output</span><b>' + tok(CTX.input) + ' / ' + tok(CTX.output) + '</b><span>Reclaimable</span><b>' + (CTX.compact ? '0 tokens' : '18.6k tokens') + '</b></div><div class="pm7ctx-status ' + (CTX.compact ? 'show' : '') + '" data-pm7ctx-status>' + (CTX.compact ? '<b>Compacted</b> · 18.6k tokens reclaimed.' : '') + '</div><div class="pm7ctx-actions"><span class="pm7ctx-cache">Cache hit <b>' + CTX.cache.toFixed(1) + '%</b></span><button type="button" class="chm-compact-btn" ' + (CTX.compact ? 'disabled' : '') + '>' + (CTX.compact ? 'Compacted' : 'Compact now') + '</button><button type="button" class="chm-details-link">More details</button></div>';
  }
  function enhanceContext(root) {
    $$('.context-usage', root || document).forEach(function (wrap) {
      if (wrap.getAttribute('data-pm7-context-ready')) return;
      wrap.setAttribute('data-pm7-context-ready', '1'); wrap.setAttribute('aria-label', 'Context usage, ' + CTX.pct + '% used');
      var module = $('.context-hover-module', wrap); if (module) { module.classList.add('pm7ctx-pop'); module.innerHTML = ctxPopupHTML(); }
      var arc = $('circle:last-child', wrap); if (arc) { arc.style.strokeDasharray = '62.8'; arc.style.strokeDashoffset = (62.8 * (1 - CTX.pct / 100)).toFixed(2); arc.style.strokeLinecap = 'round'; arc.style.stroke = CTX.pct >= 90 ? '#e36b78' : CTX.pct >= 70 ? 'var(--accent-orange)' : 'var(--accent-primary)'; }
    });
  }
  function activePageName() { var page = document.querySelector('.page.active'); return page ? page.id.replace(/^panel-/, '') : 'dashboard'; }
  function currentChatMount(from) { return from.closest('#chatPanel,#floatingChat') || document.getElementById('chatPanel'); }
  function contextDrawerHTML(title) {
    var raw = JSON.stringify({ thread_id: 'thread-main', title: title, context_used: CTX.used, effective_window: CTX.limit, cache_hit_rate: CTX.cache, segments: CTX.labels.map(function (label, index) { return { family: label, pct: CTX.segments[index] }; }), provider_payload: 'redacted' }, null, 2);
    return '<div class="pm7ctx-dhead"><b>Context details · ' + esc(title) + '</b><button type="button" class="pm7ctx-close" data-pm7ctx-close aria-label="Close context details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="pm7ctx-tabs"><button type="button" class="pm7ctx-tab active" data-pm7ctx-tab="curated">Curated</button><button type="button" class="pm7ctx-tab" data-pm7ctx-tab="raw">Raw</button></div><div class="pm7ctx-dbody"><div class="pm7ctx-curated"><section class="pm7ctx-section"><h3>Current window</h3><div class="pm7ctx-overview"><div class="pm7ctx-tile"><b>' + CTX.pct + '%</b><span>used</span></div><div class="pm7ctx-tile"><b>' + tok(CTX.used) + '</b><span>tokens loaded</span></div><div class="pm7ctx-tile"><b>' + CTX.cache.toFixed(1) + '%</b><span>cache hit</span></div></div></section><section class="pm7ctx-section"><h3>Source composition</h3>' + CTX.labels.map(function (label, index) { return '<div class="pm7ctx-source"><i></i><span>' + label + '</span><b>' + CTX.segments[index] + '%</b><b>' + tok(Math.round(CTX.used * CTX.segments[index] / 100)) + '</b></div>'; }).join('') + '</section><section class="pm7ctx-section"><h3>Effective route</h3><div class="pm7ctx-kv"><span>Requested model</span><b>Claude Opus 4.6</b><span>Effective model</span><b>Claude Sonnet 4.6</b><span>Fallback reason</span><b>5h allowance pressure</b><span>Effective window</span><b>128k tokens</b><span>Context cache</span><b>' + CTX.cache.toFixed(1) + '% hit</b><span>Compaction state</span><b>' + (CTX.compact ? 'compacted just now' : '18.6k reclaimable') + '</b></div></section><section class="pm7ctx-section"><h3>Current limits</h3><div class="pm7ctx-kv"><span>Claude 5h window</span><b>78% · resets in 1h 42m</b><span>Codex 5h window</span><b>63% · resets in 3h 18m</b><span>Thread hard limit</span><b>128k tokens</b><span>Reserved output</span><b>16k tokens</b></div></section></div><pre class="pm7ctx-raw">' + esc(raw) + '</pre></div>';
  }
  function openContextDetails(trigger) {
    var mount = currentChatMount(trigger), title = ($('.chatHeaderTitle', mount) || {}).textContent || 'Current thread', drawer = $('.pm7ctx-drawer', mount);
    if (!drawer) { drawer = document.createElement('aside'); drawer.className = 'pm7ctx-drawer'; drawer.setAttribute('data-tab', 'curated'); mount.appendChild(drawer); }
    CONTEXT_DRAWER_TITLES.set(drawer, title.trim()); drawer.innerHTML = contextDrawerHTML(title.trim()); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    command('cmd.chat.open_thread_context_details', { thread_id: 'thread-main' }, { opened: true, source_page: activePageName() });
    usageEvent('view.chat.context_details_opened', { thread_id: 'thread-main', thread_title: title.trim(), source_page: activePageName() });
  }
  var CONTEXT_DRAWER_TITLES = new WeakMap();
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
  function compactContext(trigger) {
    if (CTX.compact) return;
    var compactionReceipt = command('cmd.chat.compact_context', { thread_id: 'thread-main' }, { requested: true, before_tokens: CTX.used, effective_window: CTX.limit, projection_state: 'started' }, { defer_receipt: true });
    CTX.compaction_receipt = compactionReceipt;
    CTX.compact = 1;
    var wrap = trigger.closest('.context-usage'), status = wrap && $('[data-pm7ctx-status]', wrap);
    if (status) { status.classList.add('show'); status.innerHTML = '<b>Compacting context</b> · preserving pinned instructions and current work.'; }
    setTimeout(function () {
      CTX.used = 23580; CTX.input = CTX.used - CTX.output; CTX.pct = Math.round(CTX.used / CTX.limit * 100); CTX.segments = [47, 24, 11, 9, 9];
      refreshContextModules();
      syncUsageContextProjection();
      refreshOpenContextDrawers();
      if (CTX.compaction_receipt) completeCommandReceipt(CTX.compaction_receipt, { projection_state: 'completed', after_tokens: CTX.used, reclaimed_tokens: 18600 });
      toast('Context compacted · 18.6k tokens reclaimed');
    }, 850);
  }
  document.addEventListener('click', function (event) {
    var close = event.target.closest('[data-pm7ctx-close]');
    if (close) { event.preventDefault(); event.stopImmediatePropagation(); var drawer = close.closest('.pm7ctx-drawer'); if (drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); } return; }
    var tab = event.target.closest('[data-pm7ctx-tab]');
    if (tab) { event.preventDefault(); event.stopImmediatePropagation(); var parent = tab.closest('.pm7ctx-drawer'), id = tab.getAttribute('data-pm7ctx-tab'); parent.setAttribute('data-tab', id); $$('[data-pm7ctx-tab]', parent).forEach(function (button) { button.classList.toggle('active', button === tab); }); return; }
    var more = event.target.closest('.context-usage .chm-details-link'); if (more) { event.preventDefault(); event.stopImmediatePropagation(); openContextDetails(more); return; }
    var compact = event.target.closest('.context-usage .chm-compact-btn'); if (compact) { event.preventDefault(); event.stopImmediatePropagation(); compactContext(compact); }
  }, true);
  var contextObserver = new MutationObserver(function (mutations) {
    /* Context affordances are local to the subtree that was just mounted.
       A document-wide enhancement pass on every Settings/content insertion
       made unrelated manager transitions pay for the entire application. */
    mutations.forEach(function (mutation) {
      Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
        if (node && node.nodeType === 1) enhanceContext(node);
      });
    });
  });
  contextObserver.observe(document.body, { childList: true, subtree: true });
  window.PM7_CONTEXT = { enhance: enhanceContext, openDetails: openContextDetails, compact: compactContext };

  $('#pm7uMore').classList.toggle('open', state.more);
  $('#pm7uMoreBtn').setAttribute('aria-expanded', String(state.more));
  function finalizeUsageWorkspace() {
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
    WORKSPACE_FIELDS.forEach(function (field) { state[field] = finalized[field] && typeof finalized[field] === 'object' ? JSON.parse(JSON.stringify(finalized[field])) : finalized[field]; });
    USAGE_WORKSPACE.state = JSON.parse(JSON.stringify(finalized));
    USAGE_MIGRATION_RECEIPT.stale_value_count = USAGE_STALE_VALUE_COUNT;
    USAGE_MIGRATION_RECEIPT.stale_values_evicted = USAGE_STALE_VALUE_COUNT > 0;
    USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);
    if (USAGE_MIGRATION_RECEIPT.envelope_persisted) {
      if (priorWorkspaceKeyPresent) { try { localStorage.removeItem(PRIOR_WORKSPACE_KEY); USAGE_MIGRATION_RECEIPT.prior_workspace_removed = localStorage.getItem(PRIOR_WORKSPACE_KEY) == null; } catch (error) {} }
      if (legacyCandidate.present) WORKSPACE_FIELDS.forEach(function (field) { try { localStorage.removeItem(LEGACY_KEY + field); } catch (error) {} });
      var remaining = 0; WORKSPACE_FIELDS.forEach(function (field) { try { if (localStorage.getItem(LEGACY_KEY + field) != null) remaining += 1; } catch (error) {} });
      USAGE_MIGRATION_RECEIPT.legacy_keys_remaining = remaining;
      USAGE_MIGRATION_RECEIPT.legacy_keys_removed = legacyCandidate.present > 0 && remaining === 0;
    }
  }
  finalizeUsageWorkspace();
  var initialScopeName = scopeDisplay(state.scope);
  $('#pm7uScopeLabel').textContent = initialScopeName[0]; $('#pm7uScopeMeta').textContent = initialScopeName[1];
  render(); enhanceContext(document);
  var physicalTierObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function () {
    schedulePhysicalContentTiers();
    scheduleUsageVisibleLayout();
  }) : null;
  if (physicalTierObserver) { physicalTierObserver.observe(app); physicalTierObserver.observe(board); }
  window.addEventListener('resize', schedulePhysicalContentTiers, { passive:true });
  function usageExportJson(kind) {
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
    clearLayout:function () { var candidate=liveUsageStateSnapshot(); candidate.layout={}; candidate.order={}; candidate.hidden={}; if (persistUsageWholeState(candidate)) render(); },
    setRoomDetail:function (room,detail) { if (ROOM[room]) state.room=room; if (DETAIL[detail]) state.detail=detail; render(); },
    showOnly:function (room,detail,id,cols,rows) { if (ROOM[room]) state.room=room; if (DETAIL[detail]) state.detail=detail; state.hidden={}; roomWidgets(state.room).forEach(function (item) { state.hidden[state.room+':'+item.id]=item.id!==id; }); state.layout={}; var item=widgetById(id); if (item) state.layout[state.room+':'+id]=clampLayout(item,cols,rows); render(); },
    openInspector:openInspector,
    refresh:function () { command('cmd.usage.refresh',{room:state.room,range:state.range,scope:state.scope},{requested:true}); render(); usageEvent('view.usage.projection_refreshed',{room:state.room,range:state.range}); toast('Usage refreshed just now'); },
    spinRefresh:function () { this.refresh(); }, exportJson:usageExportJson,
    rerender:function () { render(); }, injectIcons:function () { $$('[data-icon]',app).forEach(function (element) { element.innerHTML=SVG[element.getAttribute('data-icon')]||SVG.grid; }); },
    appendUsageAttempt:appendUsageAttempt, appendLedger:appendUsageAttempt,
    setCooldown:function (seconds) { this.cooldown_seconds=Math.max(0,Number(seconds)||0); }, pm7FlushCooldown:function () { return this.cooldown_seconds||0; },
    densityFor:densityFor, shapeFor:shapeFor, layoutFor:layoutFor, physicalContentTier:physicalContentTier, applyPhysicalUsageLayout:applyPhysicalUsageLayout, applyPhysicalContentTiers:applyPhysicalContentTiers, command:command,
    command_log:COMMANDS, receipt_log:RECEIPTS, event_log:EVENTS, view_action_log:VIEW_ACTIONS,
    wiring:{ command_event:'pm:command-dispatch', receipt_event:'pm:dispatch-receipt', concept_event:'pm:usage-event', local_view_action:'pm:usage-view-action', prototype_store:WORKSPACE_KEY, legacy_import:'pm7:usage:v10:* once', canonical_layout_owner:'widget_layout namespace via cmd.widget.*', persisted_domain_event_for_widget_layout:null, workspace_layout_changed_scope:'Home workspace surface mutations only' }
  };
})();
