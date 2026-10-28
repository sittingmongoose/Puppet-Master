/* rw-data.js — one store for both surfaces (Background activity concept, Opus 5.5).
 *
 * The point this file makes: the chat's Processes domain and the status bar's agents and processes are two FILTERS of one
 * projection, never two registries. In canon that projection is OperationalAwarenessProjection over ObservableWork
 * (Plans/Shared_Integration_Runtime.md §8.2, §9.2); here it is RW.items. The thread surface reads
 * items where thread === the open thread; the platform surface reads all of them.
 *
 * Item fields (a proposal for the Plans work, see IMPACT_TRACKER.md):
 *   id, kind (agent | process | scheduled | service), role (main | subagent | server | script | test | watcher |
 *   build | browser | db | lsp | mcp | index), title, detail, command, cwd, pid, ports[],
 *   surface (assistant | orchestrator | wizard | prd | scout | system), where, thread, owner (agent id or null for
 *   the thread's own agent), parent (agent id), model, state (a glyph-registry key, F3-658), word (override),
 *   ask (the literal question when it needs you), quick (answers offered inline), startedAt, endedAt, exit,
 *   progress {done,total,unit} or null (never invented), report (agent | me | quiet), waits (the thread waits for it),
 *   tail[] (bounded output), cpu, mem.
 */
(function () {
  'use strict';
  if (window.RW) return;
  var RW = window.RW = {};
  var listeners = [];
  RW.state = {
    scenario: 'busy',
    threadVariant: 'state',     /* state | owner | list */
    barVariant: 'compact',      /* compact (Numbers, the default) | words (the setting's other choice) */
    popVariant: 'tabs',         /* tabs | side | table */
    feed: 'current',            /* current | stale */
    restarted: false,
    thread: 'thr-qp',
    threadTitle: 'Query performance'
  };
  RW.on = function (fn) { listeners.push(fn); };
  RW.emit = function (why) { listeners.forEach(function (fn) { try { fn(why || 'change'); } catch (e) { console.error(e); } }); };

  /* ------------------------------------------------------------ helpers */
  RW.esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  RW.now = function () { return Date.now(); };
  function ago(sec) { return Date.now() - sec * 1000; }
  RW.dur = function (ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return s + 's';
    var m = Math.floor(s / 60); s %= 60;
    if (m < 60) return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
    var h = Math.floor(m / 60); m %= 60;
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  };
  RW.short = function (ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return s + 's';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm';
    return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
  };
  RW.clock = function (t) { var d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); };
  /* Glyphs come from the one registry (DR-051, F3-658) through PMConcept7's window.PMG; nothing here draws its own. */
  RW.st = function (key, size, cls) {
    var P = window.PMG;
    if (!P) return '';
    var k = P.hasStatus(key) ? key : (key === 'waiting-dep' && P.hasStatus('waiting') ? 'waiting' : 'idle');
    return P.status(k, size || 12, cls || 'nx-still');
  };
  RW.icon = function (name, size, cls) {
    var P = window.PMG;
    if (!P || !P.has(name)) name = 'terminal';
    return P ? P.icon(name, size || 12, cls || '') : '';
  };
  RW.toast = function (m) { try { if (typeof window.toast === 'function') window.toast(m); } catch (e) {} };

  /* ------------------------------------------------- state words + ranks */
  var WORD = {
    waiting: 'Needs you', blocked: 'Blocked', failed: 'Failed', warning: 'Lost', recovering: 'Retrying',
    reviewing: 'Checking', working: 'Running', 'waiting-dep': 'Waiting', pending: 'Queued', complete: 'Done',
    skipped: 'Stopped', paused: 'Paused', idle: 'Idle', off: 'Off', offline: 'Offline'
  };
  var TONE = {
    waiting: 'attention', blocked: 'blocked', failed: 'blocked', warning: 'attention', recovering: 'attention',
    reviewing: 'working', working: 'working', 'waiting-dep': 'attention', pending: 'idle', complete: 'done',
    skipped: 'idle', paused: 'paused', idle: 'idle', off: 'paused', offline: 'attention'
  };
  /* Needs-you leads every list (F3-658 "waiting ... Leads every list"; F3-477 blocked > running > queued > completed). */
  var RANK = { waiting: 0, blocked: 1, failed: 2, warning: 3, recovering: 4, working: 5, reviewing: 5, 'waiting-dep': 6, pending: 7, paused: 8, idle: 9, complete: 10, skipped: 11, off: 12, offline: 3 };
  RW.word = function (it) {
    if (it.stopping) return 'Stopping';
    if (it.word) return it.word;
    /* An agent waiting on you has a question; a process waiting on you needs input (the terminal's own word, F3-658's
       st-waiting map: "Needs input"). Two words, so the status bar and its panel can keep them apart. */
    if (it.state === 'waiting' && it.kind !== 'agent') return 'Needs input';
    if (it.kind === 'scheduled' && it.state === 'pending') return 'Scheduled';
    if (it.state === 'failed' && it.exit != null) return 'Failed';
    return WORD[it.state] || it.state;
  };
  RW.tone = function (it) { return it.stopping ? 'idle' : (TONE[it.state] || 'idle'); };
  RW.rank = function (it) { return it.stopping ? 6 : (RANK[it.state] == null ? 9 : RANK[it.state]); };
  RW.isLive = function (it) { return !it.stopping && /^(waiting|blocked|recovering|working|reviewing|waiting-dep)$/.test(it.state) || !!it.stopping; };
  RW.isDone = function (it) { return /^(complete|failed|skipped|warning)$/.test(it.state) && !it.stopping; };
  RW.needsYou = function (it) { return it.state === 'waiting' && !it.stopping; };
  RW.isQuestion = function (it) { return it.kind === 'agent' && RW.needsYou(it); };
  RW.needsInput = function (it) { return it.kind !== 'agent' && RW.needsYou(it); };
  RW.sort = function (list) {
    return list.slice().sort(function (a, b) {
      var r = RW.rank(a) - RW.rank(b);
      if (r) return r;
      if (RW.isDone(a) && RW.isDone(b)) return (b.endedAt || 0) - (a.endedAt || 0);
      return (b.startedAt || 0) - (a.startedAt || 0);
    });
  };
  RW.time = function (it) {
    var n = Date.now();
    if (it.kind === 'scheduled' && it.at) return it.at > n ? 'in ' + RW.short(it.at - n) : 'now';
    if (RW.needsYou(it)) return 'waiting ' + RW.short(n - (it.askedAt || it.startedAt));
    if (RW.isDone(it)) return RW.short(n - (it.endedAt || n)) + ' ago';
    if (it.state === 'pending' && it.queuePos) return 'position ' + it.queuePos;
    return RW.dur(n - (it.startedAt || n));
  };
  RW.byId = function (id) { for (var i = 0; i < RW.items.length; i++) if (RW.items[i].id === id) return RW.items[i]; return null; };
  RW.ownerName = function (it) {
    if (!it.owner) return it.surface === 'assistant' ? 'Puppet Master (this thread)' : '';
    var o = RW.byId(it.owner);
    return o ? o.title : it.owner;
  };
  RW.children = function (agentId) { return RW.items.filter(function (x) { return x.parent === agentId || x.owner === agentId; }); };
  RW.SURFACES = [
    ['assistant', 'Assistant', 'robot'], ['orchestrator', 'Orchestrator', 'pipeline'], ['wizard', 'Planning Wizard', 'route'],
    ['prd', 'PRD Builder', 'page'], ['scout', 'Scout', 'telescope'], ['system', 'System services', 'server']
  ];
  RW.roleIcon = function (it) {
    return { server: 'server', db: 'database', script: 'terminal', test: 'terminal', watcher: 'clock', build: 'hammer', browser: 'browser',
      lsp: 'server', mcp: 'plug', index: 'layers', main: 'robot', subagent: 'robot', agent: 'robot' }[it.role] || (it.kind === 'scheduled' ? 'clock' : 'terminal');
  };

  /* ---------------------------------------------------------- scenarios */
  var OUT = {
    dev: ['VITE v7.1.4  ready in 412 ms', 'Local:   http://localhost:5173/', 'Network: use --host to expose', '21:02:14 [vite] page reload src/routes/+page.svelte', '21:09:51 [vite] hmr update /src/lib/QuantityStepper.svelte', '21:12:03 [vite] hmr update /src/routes/recipe/[id]/+page.svelte'],
    db: ['postgres-1  | LOG:  database system is ready to accept connections', 'postgres-1  | LOG:  checkpoint starting: time', 'postgres-1  | LOG:  checkpoint complete: wrote 1203 buffers (7.3%)', 'postgres-1  | LOG:  automatic vacuum of table "tastebook.public.recipes"'],
    bench: ['starting vacuum...end.', 'progress: 10.0 s, 812.4 tps, lat 9.83 ms stddev 2.10', 'progress: 20.0 s, 826.9 tps, lat 9.66 ms stddev 1.97', 'progress: 30.0 s, 819.2 tps, lat 9.75 ms stddev 2.04', 'progress: 40.0 s, 1388.0 tps, lat 5.76 ms stddev 1.12', 'progress: 50.0 s, 1402.6 tps, lat 5.70 ms stddev 1.08'],
    watch: ['[Running \'cargo test -p analytics\']', '   Compiling analytics v0.4.2 (/home/jared/tastebook/api/analytics)', '    Finished test [unoptimized + debuginfo] target(s) in 6.41s', '     Running unittests src/lib.rs', 'test result: ok. 48 passed; 0 failed; 0 ignored', '[Finished running. Exit status: 0]'],
    migrate: ['Applying 0006_tenant_index (dry run)  ok', 'Applying 0007_normalize_units (dry run)', 'This migration rewrites 41,882 rows in recipes.quantity.', 'Apply 0007_normalize_units to staging? [y/N]'],
    lint: ['> web@0.9.0 lint', '> eslint . && svelte-check', '/web/src/routes/+page.svelte', '  42:7  error  \'tenant\' is defined but never used  no-unused-vars', '1 problem (1 error, 0 warnings)', 'ELIFECYCLE  Command failed with exit code 1.'],
    test: ['running 48 tests', 'test tenant_scope::reads_only_own_rows ... ok', 'test planner::uses_composite_index ... ok', 'test result: ok. 48 passed; 0 failed; 0 ignored; finished in 1.84s'],
    docs: ['astro  v5.2.0 ready in 288 ms', 'Local    http://localhost:4321/', '21:31:40 [watch] src/content/release-notes/0.9.md', '21:31:41 [astro] page reload'],
    build: ['   Compiling serde v1.0.219', '   Compiling tokio v1.47.1', '   Compiling sqlx-core v0.8.6', '   Compiling tastebook_api v0.9.0 (/home/jared/tastebook/api)'],
    orchTest: ['test import::normalize_units::grams_to_kg ... ok', 'test import::normalize_units::cups_to_ml ... ok', 'test import::normalize_units::fractions ... ok', 'test import::normalize_units::pinch_is_kept ... ok'],
    e2e: ['Running 22 tests using 4 workers', '  ok 1 recipe.spec.ts:14 opens a recipe (1.2s)', '  ok 2 stepper.spec.ts:8 steps quantities (0.9s)', '  ok 3 stepper.spec.ts:31 keeps units (1.1s)'],
    browse: ['open https://www.allrecipes.com/', 'read 3 pages, 2 screenshots', 'open https://www.mealie.io/features', 'read pricing table']
  };
  RW.OUT = OUT;

  function busy() {
    var t = 'thr-qp', tt = 'Query performance';
    return [
      /* ---------------- Assistant · Query performance (the open thread) */
      { id: 'a-qp', kind: 'agent', role: 'main', surface: 'assistant', thread: t, where: tt, title: tt, detail: 'Web search: checking primary documentation for composite indexes', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(406) },
      { id: 'agent-query', kind: 'agent', role: 'subagent', surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Query Analyzer', detail: 'Benchmarking tenant-scoped query alternatives', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(126) },
      { id: 'agent-schema', kind: 'agent', role: 'subagent', surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Schema Reviewer', detail: 'Production schema modification requires an explicit user override.', model: 'Qwen 3.8', state: 'blocked', startedAt: ago(101) },
      { id: 'agent-rollback', kind: 'agent', role: 'subagent', surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Rollback Rehearser', detail: 'Rehearsing the rollback on staging', model: 'GLM 5.2', state: 'recovering', startedAt: ago(72) },
      { id: 'agent-bench', kind: 'agent', role: 'subagent', surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Benchmark Runner', detail: 'Queued behind the fixture rebuild', model: 'Kimi K3', state: 'pending', startedAt: ago(0) },
      { id: 'agent-migration', kind: 'agent', role: 'subagent', surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Migration Auditor', detail: 'Completed with one required change', model: 'Claude Opus 5', state: 'complete', startedAt: ago(520), endedAt: ago(262) },
      { id: 'p-migrate', kind: 'process', role: 'script', surface: 'assistant', thread: t, where: tt, owner: 'agent-rollback', title: 'Migration dry run', command: 'sqlx migrate run --dry-run --target staging', cwd: '~/tastebook/api', pid: 48211, state: 'waiting', ask: 'Apply 0007_normalize_units to staging? [y/N]', quick: ['No', 'Yes'], startedAt: ago(70), askedAt: ago(46), report: 'agent', waits: true, tail: OUT.migrate.slice(), cpu: 0, mem: 38 },
      { id: 'p-bench', kind: 'process', role: 'script', surface: 'assistant', thread: t, where: tt, owner: 'agent-query', title: 'Benchmark: tenant read path', command: 'pgbench -c 8 -j 4 -T 120 -f bench/tenant_read.sql tastebook', cwd: '~/tastebook/api', pid: 48190, state: 'working', progress: { done: 54, total: 120, unit: 's', source: 'measured' }, startedAt: ago(54), report: 'agent', waits: true, tail: OUT.bench.slice(0, 4), gen: 'bench', cpu: 41, mem: 64 },
      { id: 'p-dev', kind: 'process', role: 'server', surface: 'assistant', thread: t, where: tt, owner: null, title: 'Web dev server', command: 'pnpm dev', cwd: '~/tastebook/web', pid: 47702, ports: [5173], state: 'working', startedAt: ago(852), report: 'me', waits: false, tail: OUT.dev.slice(0, 4), gen: 'dev', cpu: 3, mem: 212 },
      { id: 'p-db', kind: 'process', role: 'db', surface: 'assistant', thread: t, where: tt, owner: null, title: 'Postgres for benchmarks', command: 'docker compose up postgres', cwd: '~/tastebook', pid: 47655, ports: [5432], state: 'working', startedAt: ago(1335), report: 'me', waits: false, tail: OUT.db.slice(0, 2), gen: 'db', cpu: 6, mem: 486 },
      { id: 'p-watch', kind: 'process', role: 'watcher', surface: 'assistant', thread: t, where: tt, owner: null, title: 'Test watcher: analytics', detail: 'Last run passed 2m ago', command: 'cargo watch -x "test -p analytics"', cwd: '~/tastebook/api', pid: 47811, state: 'working', startedAt: ago(1090), report: 'quiet', waits: false, tail: OUT.watch.slice(), cpu: 1, mem: 140 },
      { id: 's-rerun', kind: 'scheduled', role: 'script', surface: 'assistant', thread: t, where: tt, owner: null, title: 'Re-run the benchmark after the index build', detail: 'Schedule Manager · runs once', at: Date.now() + 18 * 60000, state: 'pending', report: 'agent' },
      { id: 'p-lint', kind: 'process', role: 'script', surface: 'assistant', thread: t, where: tt, owner: null, title: 'Lint web', command: 'pnpm lint', cwd: '~/tastebook/web', pid: 47990, state: 'failed', exit: 1, startedAt: ago(250), endedAt: ago(204), report: 'agent', tail: OUT.lint.slice(), cpu: 0, mem: 0 },
      { id: 'p-test', kind: 'process', role: 'test', surface: 'assistant', thread: t, where: tt, owner: 'agent-migration', title: 'Analytics tests', command: 'cargo test -p analytics', cwd: '~/tastebook/api', pid: 47930, state: 'complete', exit: 0, startedAt: ago(470), endedAt: ago(362), report: 'agent', tail: OUT.test.slice() },

      /* ---------------- other Assistant threads */
      { id: 'a-rn', kind: 'agent', role: 'main', surface: 'assistant', thread: 'thr-rn', where: 'Release notes draft', title: 'Release notes draft', detail: 'Reply finished; its docs preview is still running', model: 'Claude Opus 5', state: 'idle', word: 'Idle', startedAt: ago(4300) },
      { id: 'p-docs', kind: 'process', role: 'server', surface: 'assistant', thread: 'thr-rn', where: 'Release notes draft', owner: null, title: 'Docs preview', command: 'pnpm docs:dev', cwd: '~/tastebook/docs', pid: 46120, ports: [4321], state: 'working', startedAt: ago(4320), report: 'me', waits: false, tail: OUT.docs.slice(), gen: 'docs', cpu: 2, mem: 168 },
      { id: 'a-onb', kind: 'agent', role: 'main', surface: 'assistant', thread: 'thr-onb', where: 'Onboarding copy', title: 'Onboarding copy', ask: 'Which tone should the welcome screen use: Friendly or Plain?', model: 'GPT-5.6', state: 'waiting', startedAt: ago(600), askedAt: ago(182) },
      { id: 'a-imp', kind: 'agent', role: 'main', surface: 'assistant', thread: 'thr-imp', where: 'Import fixes', title: 'Import fixes', detail: 'Building the API to check the unit fixes', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(940) },
      { id: 'p-build', kind: 'process', role: 'build', surface: 'assistant', thread: 'thr-imp', where: 'Import fixes', owner: null, title: 'Release build', command: 'cargo build --release', cwd: '~/tastebook/api', pid: 48302, state: 'working', startedAt: ago(96), report: 'agent', waits: true, tail: OUT.build.slice(0, 2), gen: 'build', cpu: 88, mem: 1410 },

      /* ---------------- Orchestrator · Run #47 */
      { id: 'o-run', kind: 'agent', role: 'main', surface: 'orchestrator', where: 'Run #47', title: 'Run #47', detail: 'Tenant analytics and import fixes · 3 lanes', model: 'Overseer', state: 'working', startedAt: ago(2280) },
      { id: 'o-mig', kind: 'agent', role: 'subagent', surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Migration Runner', ask: 'Overwrite migration 0007_normalize_units?', model: 'db-migrator', state: 'waiting', startedAt: ago(900), askedAt: ago(240) },
      { id: 'o-laneb', kind: 'agent', role: 'subagent', surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'lane-b worker', detail: 'Editing QuantityStepper.svelte (hunk 2/4)', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(120) },
      { id: 'o-laned', kind: 'agent', role: 'subagent', surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'lane-d infra', detail: 'Running the import tests', model: 'GPT-5.6', state: 'working', startedAt: ago(360) },
      { id: 'o-audit', kind: 'agent', role: 'subagent', surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Auditor', detail: 'Queued behind lane-b worker', model: 'security-auditor', state: 'pending', queuePos: '2/3', startedAt: ago(120) },
      { id: 'p-orchtest', kind: 'process', role: 'test', surface: 'orchestrator', where: 'Run #47', owner: 'o-laned', title: 'Import tests', command: 'cargo test import::normalize_units', cwd: '~/tastebook/.pm/worktrees/lane-d', pid: 48410, state: 'working', progress: { done: 96, total: 214, unit: 'tests', source: 'provider_reported' }, startedAt: ago(70), report: 'agent', waits: true, tail: OUT.orchTest.slice(), gen: 'orchTest', cpu: 72, mem: 620 },
      { id: 'p-e2e', kind: 'process', role: 'test', surface: 'orchestrator', where: 'Run #47', owner: 'o-laneb', title: 'Stepper end-to-end tests', command: 'pnpm playwright test --project=chromium stepper', cwd: '~/tastebook/.pm/worktrees/lane-b', pid: 48455, state: 'working', startedAt: ago(41), report: 'agent', waits: true, tail: OUT.e2e.slice(), gen: 'e2e', cpu: 54, mem: 910 },

      /* ---------------- Planning Wizard, PRD Builder, Scout */
      { id: 'w-int', kind: 'agent', role: 'main', surface: 'wizard', where: 'Tastebook v2 plan', title: 'Interviewer', detail: 'Step 4 of 7 · Data and storage · drafting follow-up questions', model: 'Claude Opus 5', state: 'working', startedAt: ago(1500) },
      { id: 'prd-main', kind: 'agent', role: 'main', surface: 'prd', where: 'Tastebook v2 PRD', title: 'PRD Builder', detail: 'Writing section 5 of 9: Permissions', model: 'Claude Opus 5', state: 'working', startedAt: ago(780) },
      { id: 'prd-check', kind: 'agent', role: 'subagent', surface: 'prd', where: 'Tastebook v2 PRD', parent: 'prd-main', title: 'Requirements checker', detail: 'Checking sections 1 to 4 against the plan', model: 'Qwen 3.8', state: 'reviewing', startedAt: ago(210) },
      { id: 'sc-main', kind: 'agent', role: 'main', surface: 'scout', where: 'Recipe apps survey', title: 'Scout', detail: 'Comparing 6 recipe apps', model: 'Gemini 3.5 Pro', state: 'working', startedAt: ago(1720) },
      { id: 'sc-web1', kind: 'agent', role: 'subagent', surface: 'scout', where: 'Recipe apps survey', parent: 'sc-main', title: 'Web researcher', detail: 'Reading Mealie and Paprika docs', model: 'Gemini 3.5 Flash', state: 'working', startedAt: ago(300) },
      { id: 'sc-web2', kind: 'agent', role: 'subagent', surface: 'scout', where: 'Recipe apps survey', parent: 'sc-main', title: 'Summarizer', detail: 'Waiting for both researchers', model: 'Gemini 3.5 Flash', state: 'waiting-dep', startedAt: ago(300) },
      { id: 'p-browse', kind: 'process', role: 'browser', surface: 'scout', where: 'Recipe apps survey', owner: 'sc-web1', title: 'Browser session', command: 'browser · allrecipes.com, mealie.io', cwd: '', pid: 48022, state: 'working', startedAt: ago(290), report: 'agent', waits: true, tail: OUT.browse.slice(), cpu: 12, mem: 730 },

      /* ---------------- System services (mirrors of System status; never owned here) */
      { id: 'sv-lsp', kind: 'service', role: 'lsp', surface: 'system', where: 'Language servers', title: 'rust-analyzer', command: 'rust-analyzer', pid: 45110, state: 'working', startedAt: ago(9800), cpu: 4, mem: 1260 },
      { id: 'sv-mcp1', kind: 'service', role: 'mcp', surface: 'system', where: 'MCP servers', title: 'github MCP', command: 'github-mcp-server stdio', pid: 45220, state: 'working', startedAt: ago(9790), cpu: 0, mem: 52 },
      { id: 'sv-mcp2', kind: 'service', role: 'mcp', surface: 'system', where: 'MCP servers', title: 'postgres MCP', command: 'postgres-mcp --read-only', pid: 45231, state: 'working', startedAt: ago(9790), cpu: 0, mem: 44 },
      { id: 'sv-idx', kind: 'service', role: 'index', surface: 'system', where: 'Search index', title: 'Search index', detail: 'Current · last refresh 3m ago', state: 'idle', word: 'Current', startedAt: ago(9800) },

      /* ---------------- recently finished elsewhere */
      { id: 'o-sleuth', kind: 'agent', role: 'subagent', surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Test Sleuth', detail: 'Found the flaky fixture', model: 'debug-prober', state: 'complete', startedAt: ago(600), endedAt: ago(540) },
      { id: 'o-docs', kind: 'agent', role: 'subagent', surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Docs Writer', detail: 'Updated 3 pages', model: 'docs-writer', state: 'complete', startedAt: ago(900), endedAt: ago(720) }
    ];
  }

  function many(list) {
    var cmds = [['pnpm test --filter', 'test'], ['cargo check -p', 'build'], ['node scripts/seed.js --tenant', 'script'], ['python tools/resize.py --batch', 'script'], ['pnpm storybook --port', 'server']];
    for (var i = 0; i < 34; i++) {
      var c = cmds[i % cmds.length], mine = i < 22;
      list.push({
        id: 'm-' + i, kind: 'process', role: c[1], surface: mine ? 'assistant' : (i % 2 ? 'orchestrator' : 'scout'), thread: mine ? 'thr-qp' : null,
        where: mine ? 'Query performance' : (i % 2 ? 'Run #47' : 'Recipe apps survey'), owner: mine ? (i % 3 ? null : 'agent-query') : (i % 2 ? 'o-laned' : 'sc-web1'),
        title: c[0].split(' ')[0] + ' job ' + (i + 1), command: c[0] + ' ' + (i + 1), cwd: '~/tastebook', pid: 49000 + i, ports: c[1] === 'server' ? [6006 + i] : [],
        state: i % 9 === 4 ? 'failed' : (i % 11 === 6 ? 'complete' : 'working'), exit: i % 9 === 4 ? 2 : (i % 11 === 6 ? 0 : null),
        startedAt: ago(30 + i * 37), endedAt: (i % 9 === 4 || i % 11 === 6) ? ago(10 + i) : null, report: 'agent', waits: false, tail: ['line ' + (i + 1)], cpu: i % 7, mem: 40 + i * 9
      });
    }
    return list;
  }

  RW.load = function (name) {
    var s = RW.state;
    s.scenario = name;
    s.feed = name === 'stale' ? 'stale' : 'current';
    s.restarted = name === 'restart';
    var list = busy();
    if (name === 'working') {
      list.forEach(function (x) { if (x.state === 'waiting') { x.state = 'working'; x.ask = null; x.quick = null; x.detail = x.detail || 'Running'; } });
      list = list.filter(function (x) { return x.state !== 'failed'; });
    } else if (name === 'quiet') {
      list = list.filter(function (x) { return x.kind === 'service' || x.id === 'p-test' || x.id === 'o-sleuth' || x.id === 'o-docs' || x.id === 'agent-migration'; });
      list.push({ id: 'a-qp', kind: 'agent', role: 'main', surface: 'assistant', thread: 'thr-qp', where: 'Query performance', title: 'Query performance', detail: 'Reply finished', model: 'Claude Sonnet 4.6', state: 'idle', word: 'Idle', startedAt: ago(800) });
    } else if (name === 'many') {
      list = many(list);
    } else if (name === 'restart') {
      list.forEach(function (x) {
        if (x.id === 'p-dev' || x.id === 'p-bench') { x.state = 'warning'; x.word = 'Lost'; x.endedAt = ago(95); x.exit = null; x.lost = 'Ended while Puppet Master was closed. No exit code was recorded; the agent was told once.'; }
      });
    }
    RW.items = list;
    RW.emit('scenario');
  };

  /* ------------------------------------------------------------ actions */
  RW.stop = function (id, by) {
    var it = RW.byId(id);
    if (!it || RW.isDone(it) || it.stopping) return;
    if (it.kind === 'scheduled') { it.state = 'skipped'; it.word = 'Cancelled'; it.endedAt = Date.now(); RW.emit('stop'); return; }
    it.stopping = true; RW.emit('stop');
    var wait = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 1400;
    setTimeout(function () {
      it.stopping = false; it.state = 'skipped'; it.word = 'Stopped'; it.stoppedBy = by || 'you'; it.endedAt = Date.now();
      if (it.tail) it.tail.push('^C  (stopped by ' + (by || 'you') + ': SIGTERM, then SIGKILL after 3 s if still running)');
      /* stopping an agent stops what it started */
      RW.items.forEach(function (x) { if ((x.parent === id || x.owner === id) && !RW.isDone(x)) { x.state = 'skipped'; x.word = 'Stopped'; x.endedAt = Date.now(); x.stoppedBy = 'its agent stopping'; } });
      RW.emit('stopped');
    }, wait);
  };
  RW.restart = function (id) {
    var it = RW.byId(id);
    if (!it || it.stopping) return;
    it.stopping = true; RW.emit('restart');
    setTimeout(function () {
      it.stopping = false; it.state = 'working'; it.word = null; it.exit = null; it.endedAt = null; it.startedAt = Date.now(); it.pid = it.pid + 7;
      it.tail = (OUT[it.gen] || it.tail || []).slice(0, 2);
      RW.emit('restarted');
    }, 1200);
  };
  RW.answer = function (id, reply) {
    var it = RW.byId(id);
    if (!it || !RW.needsYou(it)) return;
    var q = it.ask;
    it.state = 'working'; it.ask = null; it.quick = null; it.word = null;
    if (it.tail) it.tail.push('> ' + reply);
    RW.emit('answer');
    if (it.kind === 'process') {
      setTimeout(function () {
        it.state = 'complete'; it.exit = 0; it.endedAt = Date.now();
        if (it.tail) it.tail.push(/^n/i.test(reply) ? 'Skipped 0007_normalize_units. Dry run finished: 1 applied, 1 skipped.' : 'Dry run finished: 2 applied.');
        RW.emit('done');
      }, 2600);
    }
    RW.toast((it.kind === 'process' ? 'Sent “' + reply + '” to ' : 'Answered ') + it.title + (q ? ': ' + q : ''));
  };
  RW.clearFinished = function (pred) {
    RW.items = RW.items.filter(function (x) { return !(RW.isDone(x) && x.kind !== 'agent' && (!pred || pred(x))); });
    RW.emit('clear');
  };
  RW.setReport = function (id, v) { var it = RW.byId(id); if (it) { it.report = v; RW.emit('report'); } };

  /* ------------------------------------------------------- live ticking */
  var gi = {};
  setInterval(function () {
    var changed = false;
    RW.items.forEach(function (it) {
      if (it.state !== 'working' || it.stopping) return;
      if (it.progress && it.progress.unit === 's') {
        it.progress.done = Math.min(it.progress.total, Math.round((Date.now() - it.startedAt) / 1000));
        if (it.progress.done >= it.progress.total) {
          it.state = 'complete'; it.exit = 0; it.endedAt = Date.now(); it.tail.push('transaction type: tenant_read.sql', 'tps = 1398.204 (without initial connection time)'); changed = true; return;
        }
      } else if (it.progress && it.progress.unit === 'tests' && Math.random() < 0.5) {
        it.progress.done = Math.min(it.progress.total - 1, it.progress.done + 1 + Math.floor(Math.random() * 3));
      }
      if (it.gen && Math.random() < 0.35) {
        var src = OUT[it.gen]; gi[it.id] = ((gi[it.id] == null ? it.tail.length : gi[it.id]) + 1) % src.length;
        it.tail.push(src[gi[it.id]]);
        if (it.tail.length > 400) it.tail.splice(0, it.tail.length - 400);
        it.lines = (it.lines || 1200) + 1;
      }
      it.cpu = Math.max(0, Math.round((it.cpu || 0) + (Math.random() - 0.5) * 6));
      changed = true;
    });
    if (changed) RW.emit('tick');
  }, 1000);

  RW.load('busy');
})();
