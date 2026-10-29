/* 20-fixture.js: the concept world the work projection shows (PM7 build, lane activity, 2026-10-29). OWNER: pm7-activity
 * (in pm7-found's work/ folder by agreement: found owns 10-pm-work.js, the projection's core; only lane activity edits
 * this file). It is fixture data, never runtime truth: in the product the projection reads OperationalAwareness over
 * ObservableWork (SIR §8.2, §9.2; DR-078). Ported from the approved background-activity concept
 * (Concepts/background-activity/opus-5.5/src/rw-data.js: busy(), many(), the output tails), with what the build adds:
 * a project on every item, delivery for report ('me' became 'user', cmd.work.set_completion_delivery), and the
 * servers and environments the Resources tab groups by (G4: one Project can run many).
 *
 * Scenarios (PM_WORK.fixture.define, the Demo Studio's Activity section switches them):
 *   busy     three things wait on you: 16 agents · 2 questions, 10 processes · 1 needs input (the concept's numbers)
 *   no-asks  the same work with nothing waiting on you and no failures
 *   quiet    nothing running: the chat's Processes icon is gone, the status bar reads No agents / No processes
 *   many     busy plus 34 more processes, for long lists and the narrow layouts
 *   stale    busy, last known 40 s ago (the feed is reconnecting; nothing has been stopped)
 *   restart  busy after Puppet Master restarted: two processes ended while it was closed (Lost)
 *   servers  busy on four servers and six environments, for the Resources tab
 * Times are relative to the moment a scenario loads. The live tick (PM_WORK.fixture.tick) moves output tails and
 * progress only; CPU, memory and ports are the core's samples, taken only while a sampler is open (D12). */
(function () {
  'use strict';
  var W = window.PM_WORK;
  if (!W || !W.fixture || typeof W.fixture.define !== 'function') return;
  function ago(sec) { return Date.now() - sec * 1000; }

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
    browse: ['open https://www.allrecipes.com/', 'read 3 pages, 2 screenshots', 'open https://www.mealie.io/features', 'read pricing table'],
    preview: ['preview deploy 0.9.0-rc.2 · tenant analytics', 'listening on :8080', 'GET /recipes 200 18ms', 'GET /recipes/412 200 22ms'],
    evals: ['eval: unit-normalizer · 1,200 cases', 'batch 4/12 · accuracy 0.987', 'batch 5/12 · accuracy 0.989', 'batch 6/12 · accuracy 0.988'],
    ci: ['ci: tastebook · pipeline 318', 'step 3/7  cargo clippy --all-targets', 'step 4/7  cargo test --workspace', '   Compiling tastebook_api v0.9.0']
  };

  /* Where work runs (G4). Busy uses this computer and the staging server; servers adds a GPU box and a CI runner. */
  function serversBusy() {
    return [
      { id: 'local', name: 'This computer', kind: 'local', host: 'jared-mbp.local', project: 'tastebook',
        environments: [{ id: 'dev', name: 'Development' }, { id: 'test', name: 'Tests' }, { id: 'pm', name: 'Puppet Master services' }] },
      { id: 'staging', name: 'Staging server', kind: 'remote', host: 'staging.tastebook.app', project: 'tastebook',
        environments: [{ id: 'staging', name: 'Staging' }] }
    ];
  }
  function serversMany() {
    var s = serversBusy();
    s[1].environments.push({ id: 'preview', name: 'Preview' });
    s.push({ id: 'gpu', name: 'GPU box', kind: 'remote', host: 'gpu-box.lan', project: 'tastebook', environments: [{ id: 'ml', name: 'Model evals' }] });
    s.push({ id: 'ci', name: 'CI runner', kind: 'container', host: 'runner-3 (Docker)', project: 'tastebook', environments: [{ id: 'ci', name: 'Pipelines' }] });
    return s;
  }

  function busy() {
    var t = 'thr-qp', tt = 'Query performance', P = 'tastebook';
    return [
      /* ---------------- Assistant · Query performance (the open thread) */
      { id: 'a-qp', kind: 'agent', role: 'main', project: P, surface: 'assistant', thread: t, where: tt, title: tt, detail: 'Web search: checking primary documentation for composite indexes', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(406) },
      { id: 'agent-query', kind: 'agent', role: 'subagent', project: P, surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Query Analyzer', detail: 'Benchmarking tenant-scoped query alternatives', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(126) },
      { id: 'agent-schema', kind: 'agent', role: 'subagent', project: P, surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Schema Reviewer', detail: 'Production schema modification requires an explicit user override.', model: 'Qwen 3.8', state: 'blocked', startedAt: ago(101) },
      { id: 'agent-rollback', kind: 'agent', role: 'subagent', project: P, surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Rollback Rehearser', detail: 'Rehearsing the rollback on staging', model: 'GLM 5.2', state: 'recovering', startedAt: ago(72) },
      { id: 'agent-bench', kind: 'agent', role: 'subagent', project: P, surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Benchmark Runner', detail: 'Queued behind the fixture rebuild', model: 'Kimi K3', state: 'pending', startedAt: ago(0) },
      { id: 'agent-migration', kind: 'agent', role: 'subagent', project: P, surface: 'assistant', thread: t, where: tt, parent: 'a-qp', title: 'Migration Auditor', detail: 'Completed with one required change', model: 'Claude Opus 5', state: 'complete', startedAt: ago(520), endedAt: ago(262) },
      { id: 'p-migrate', kind: 'process', role: 'script', project: P, surface: 'assistant', thread: t, where: tt, owner: 'agent-rollback', title: 'Migration dry run', command: 'sqlx migrate run --dry-run --target staging', cwd: '~/tastebook/api', pid: 48211, server: 'staging', environment: 'staging', state: 'waiting', ask: 'Apply 0007_normalize_units to staging? [y/N]', quick: ['No', 'Yes'], startedAt: ago(70), askedAt: ago(46), delivery: 'agent', waits: true, tail: OUT.migrate.slice(), cpu: 0, mem: 38 },
      { id: 'p-bench', kind: 'process', role: 'script', project: P, surface: 'assistant', thread: t, where: tt, owner: 'agent-query', title: 'Benchmark: tenant read path', command: 'pgbench -c 8 -j 4 -T 120 -f bench/tenant_read.sql tastebook', cwd: '~/tastebook/api', pid: 48190, server: 'local', environment: 'dev', state: 'working', progress: { done: 54, total: 120, unit: 's', source: 'measured' }, startedAt: ago(54), delivery: 'agent', waits: true, tail: OUT.bench.slice(0, 4), gen: 'bench', cpu: 41, mem: 64 },
      { id: 'p-dev', kind: 'process', role: 'server', project: P, surface: 'assistant', thread: t, where: tt, owner: null, title: 'Web dev server', command: 'pnpm dev', cwd: '~/tastebook/web', pid: 47702, ports: [5173], server: 'local', environment: 'dev', state: 'working', startedAt: ago(852), delivery: 'user', waits: false, tail: OUT.dev.slice(0, 4), gen: 'dev', cpu: 3, mem: 212 },
      { id: 'p-db', kind: 'process', role: 'db', project: P, surface: 'assistant', thread: t, where: tt, owner: null, title: 'Postgres for benchmarks', command: 'docker compose up postgres', cwd: '~/tastebook', pid: 47655, ports: [5432], server: 'local', environment: 'dev', state: 'working', startedAt: ago(1335), delivery: 'user', waits: false, tail: OUT.db.slice(0, 2), gen: 'db', cpu: 6, mem: 486 },
      { id: 'p-watch', kind: 'process', role: 'watcher', project: P, surface: 'assistant', thread: t, where: tt, owner: null, title: 'Test watcher: analytics', detail: 'Last run passed 2m ago', command: 'cargo watch -x "test -p analytics"', cwd: '~/tastebook/api', pid: 47811, server: 'local', environment: 'test', state: 'working', startedAt: ago(1090), delivery: 'quiet', waits: false, tail: OUT.watch.slice(), cpu: 1, mem: 140 },
      { id: 's-rerun', kind: 'scheduled', role: 'script', project: P, surface: 'assistant', thread: t, where: tt, owner: null, title: 'Re-run the benchmark after the index build', detail: 'Schedule Manager · runs once', at: Date.now() + 18 * 60000, state: 'pending', delivery: 'agent' },
      { id: 'p-lint', kind: 'process', role: 'script', project: P, surface: 'assistant', thread: t, where: tt, owner: null, title: 'Lint web', command: 'pnpm lint', cwd: '~/tastebook/web', pid: 47990, server: 'local', environment: 'dev', state: 'failed', exit: 1, startedAt: ago(250), endedAt: ago(204), delivery: 'agent', tail: OUT.lint.slice(), cpu: 0, mem: 0 },
      { id: 'p-test', kind: 'process', role: 'test', project: P, surface: 'assistant', thread: t, where: tt, owner: 'agent-migration', title: 'Analytics tests', command: 'cargo test -p analytics', cwd: '~/tastebook/api', pid: 47930, server: 'local', environment: 'test', state: 'complete', exit: 0, startedAt: ago(470), endedAt: ago(362), delivery: 'agent', tail: OUT.test.slice() },

      /* ---------------- other Assistant threads */
      { id: 'a-rn', kind: 'agent', role: 'main', project: P, surface: 'assistant', thread: 'thr-rn', where: 'Release notes draft', title: 'Release notes draft', detail: 'Reply finished; its docs preview is still running', model: 'Claude Opus 5', state: 'idle', word: 'Idle', startedAt: ago(4300) },
      { id: 'p-docs', kind: 'process', role: 'server', project: P, surface: 'assistant', thread: 'thr-rn', where: 'Release notes draft', owner: null, title: 'Docs preview', command: 'pnpm docs:dev', cwd: '~/tastebook/docs', pid: 46120, ports: [4321], server: 'local', environment: 'dev', state: 'working', startedAt: ago(4320), delivery: 'user', waits: false, tail: OUT.docs.slice(), gen: 'docs', cpu: 2, mem: 168 },
      { id: 'a-onb', kind: 'agent', role: 'main', project: P, surface: 'assistant', thread: 'thr-onb', where: 'Onboarding copy', title: 'Onboarding copy', ask: 'Which tone should the welcome screen use: Friendly or Plain?', model: 'GPT-5.6', state: 'waiting', startedAt: ago(600), askedAt: ago(182) },
      { id: 'a-imp', kind: 'agent', role: 'main', project: P, surface: 'assistant', thread: 'thr-imp', where: 'Import fixes', title: 'Import fixes', detail: 'Building the API to check the unit fixes', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(940) },
      { id: 'p-build', kind: 'process', role: 'build', project: P, surface: 'assistant', thread: 'thr-imp', where: 'Import fixes', owner: null, title: 'Release build', command: 'cargo build --release', cwd: '~/tastebook/api', pid: 48302, server: 'local', environment: 'dev', state: 'working', startedAt: ago(96), delivery: 'agent', waits: true, tail: OUT.build.slice(0, 2), gen: 'build', cpu: 88, mem: 1410 },

      /* ---------------- Orchestrator · Run #47 */
      { id: 'o-run', kind: 'agent', role: 'main', project: P, surface: 'orchestrator', where: 'Run #47', title: 'Run #47', detail: 'Tenant analytics and import fixes · 3 lanes', model: 'Overseer', state: 'working', startedAt: ago(2280) },
      { id: 'o-mig', kind: 'agent', role: 'subagent', project: P, surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Migration Runner', ask: 'Overwrite migration 0007_normalize_units?', model: 'db-migrator', state: 'waiting', startedAt: ago(900), askedAt: ago(240) },
      { id: 'o-laneb', kind: 'agent', role: 'subagent', project: P, surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'lane-b worker', detail: 'Editing QuantityStepper.svelte (hunk 2/4)', model: 'Claude Sonnet 4.6', state: 'working', startedAt: ago(120) },
      { id: 'o-laned', kind: 'agent', role: 'subagent', project: P, surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'lane-d infra', detail: 'Running the import tests', model: 'GPT-5.6', state: 'working', startedAt: ago(360) },
      { id: 'o-audit', kind: 'agent', role: 'subagent', project: P, surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Auditor', detail: 'Queued behind lane-b worker', model: 'security-auditor', state: 'pending', queuePos: '2/3', startedAt: ago(120) },
      { id: 'p-orchtest', kind: 'process', role: 'test', project: P, surface: 'orchestrator', where: 'Run #47', owner: 'o-laned', title: 'Import tests', command: 'cargo test import::normalize_units', cwd: '~/tastebook/.pm/worktrees/lane-d', pid: 48410, server: 'local', environment: 'test', state: 'working', progress: { done: 96, total: 214, unit: 'tests', source: 'provider_reported' }, startedAt: ago(70), delivery: 'agent', waits: true, tail: OUT.orchTest.slice(), gen: 'orchTest', cpu: 72, mem: 620 },
      { id: 'p-e2e', kind: 'process', role: 'test', project: P, surface: 'orchestrator', where: 'Run #47', owner: 'o-laneb', title: 'Stepper end-to-end tests', command: 'pnpm playwright test --project=chromium stepper', cwd: '~/tastebook/.pm/worktrees/lane-b', pid: 48455, server: 'local', environment: 'test', state: 'working', startedAt: ago(41), delivery: 'agent', waits: true, tail: OUT.e2e.slice(), gen: 'e2e', cpu: 54, mem: 910 },

      /* ---------------- Planning Wizard, PRD Builder, Scout */
      { id: 'w-int', kind: 'agent', role: 'main', project: P, surface: 'wizard', where: 'Tastebook v2 plan', title: 'Interviewer', detail: 'Step 4 of 7 · Data and storage · drafting follow-up questions', model: 'Claude Opus 5', state: 'working', startedAt: ago(1500) },
      { id: 'prd-main', kind: 'agent', role: 'main', project: P, surface: 'prd', where: 'Tastebook v2 PRD', title: 'PRD Builder', detail: 'Writing section 5 of 9: Permissions', model: 'Claude Opus 5', state: 'working', startedAt: ago(780) },
      { id: 'prd-check', kind: 'agent', role: 'subagent', project: P, surface: 'prd', where: 'Tastebook v2 PRD', parent: 'prd-main', title: 'Requirements checker', detail: 'Checking sections 1 to 4 against the plan', model: 'Qwen 3.8', state: 'reviewing', startedAt: ago(210) },
      { id: 'sc-main', kind: 'agent', role: 'main', project: P, surface: 'scout', where: 'Recipe apps survey', title: 'Scout', detail: 'Comparing 6 recipe apps', model: 'Gemini 3.5 Pro', state: 'working', startedAt: ago(1720) },
      { id: 'sc-web1', kind: 'agent', role: 'subagent', project: P, surface: 'scout', where: 'Recipe apps survey', parent: 'sc-main', title: 'Web researcher', detail: 'Reading Mealie and Paprika docs', model: 'Gemini 3.5 Flash', state: 'working', startedAt: ago(300) },
      { id: 'sc-web2', kind: 'agent', role: 'subagent', project: P, surface: 'scout', where: 'Recipe apps survey', parent: 'sc-main', title: 'Summarizer', detail: 'Waiting for both researchers', model: 'Gemini 3.5 Flash', state: 'waiting-dep', startedAt: ago(300) },
      { id: 'p-browse', kind: 'process', role: 'browser', project: P, surface: 'scout', where: 'Recipe apps survey', owner: 'sc-web1', title: 'Browser session', command: 'browser · allrecipes.com, mealie.io', cwd: '', pid: 48022, server: 'local', environment: 'dev', state: 'working', startedAt: ago(290), delivery: 'agent', waits: true, tail: OUT.browse.slice(), cpu: 12, mem: 730 },

      /* ---------------- System services (mirrors of System status; never owned or stopped here, D11) */
      { id: 'sv-lsp', kind: 'service', role: 'lsp', project: P, surface: 'system', where: 'Language servers', title: 'rust-analyzer', command: 'rust-analyzer', pid: 45110, server: 'local', environment: 'pm', state: 'working', startedAt: ago(9800), cpu: 4, mem: 1260 },
      { id: 'sv-mcp1', kind: 'service', role: 'mcp', project: P, surface: 'system', where: 'MCP servers', title: 'github MCP', command: 'github-mcp-server stdio', pid: 45220, server: 'local', environment: 'pm', state: 'working', startedAt: ago(9790), cpu: 0, mem: 52 },
      { id: 'sv-mcp2', kind: 'service', role: 'mcp', project: P, surface: 'system', where: 'MCP servers', title: 'postgres MCP', command: 'postgres-mcp --read-only', pid: 45231, server: 'local', environment: 'pm', state: 'working', startedAt: ago(9790), cpu: 0, mem: 44 },
      { id: 'sv-idx', kind: 'service', role: 'index', project: P, surface: 'system', where: 'Search index', title: 'Search index', detail: 'Current · last refresh 3m ago', server: 'local', environment: 'pm', state: 'idle', word: 'Current', startedAt: ago(9800) },

      /* ---------------- recently finished elsewhere */
      { id: 'o-sleuth', kind: 'agent', role: 'subagent', project: P, surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Test Sleuth', detail: 'Found the flaky fixture', model: 'debug-prober', state: 'complete', startedAt: ago(600), endedAt: ago(540) },
      { id: 'o-docs', kind: 'agent', role: 'subagent', project: P, surface: 'orchestrator', where: 'Run #47', parent: 'o-run', title: 'Docs Writer', detail: 'Updated 3 pages', model: 'docs-writer', state: 'complete', startedAt: ago(900), endedAt: ago(720) },

      /* ---------------- another Project: a scheduled run only, so harbor reads calm (B5) and the counts above hold */
      { id: 's-harbor', kind: 'scheduled', role: 'build', project: 'harbor', surface: 'orchestrator', where: 'Nightly build', owner: null, title: 'Nightly build', detail: 'Schedule Manager · every night at 02:00', at: Date.now() + 4 * 3600000, state: 'pending', delivery: 'user' }
    ];
  }

  function many(list) {
    var cmds = [['pnpm test --filter', 'test'], ['cargo check -p', 'build'], ['node scripts/seed.js --tenant', 'script'], ['python tools/resize.py --batch', 'script'], ['pnpm storybook --port', 'server']];
    for (var i = 0; i < 34; i++) {
      var c = cmds[i % cmds.length], mine = i < 22, failed = i % 9 === 4, done = i % 11 === 6;
      list.push({
        id: 'm-' + i, kind: 'process', role: c[1], project: 'tastebook', surface: mine ? 'assistant' : (i % 2 ? 'orchestrator' : 'scout'), thread: mine ? 'thr-qp' : null,
        where: mine ? 'Query performance' : (i % 2 ? 'Run #47' : 'Recipe apps survey'), owner: mine ? (i % 3 ? null : 'agent-query') : (i % 2 ? 'o-laned' : 'sc-web1'),
        title: c[0].split(' ')[0] + ' job ' + (i + 1), command: c[0] + ' ' + (i + 1), cwd: '~/tastebook', pid: 49000 + i, ports: c[1] === 'server' ? [6006 + i] : [],
        server: 'local', environment: c[1] === 'test' ? 'test' : 'dev',
        state: failed ? 'failed' : (done ? 'complete' : 'working'), exit: failed ? 2 : (done ? 0 : null),
        startedAt: ago(30 + i * 37), endedAt: (failed || done) ? ago(10 + i) : null, delivery: 'agent', waits: false, tail: ['line ' + (i + 1)], cpu: i % 7, mem: 40 + i * 9
      });
    }
    return list;
  }

  /* busy on four servers: the staging server gets a preview environment, a GPU box runs model evals, a CI runner runs
     a pipeline; each is work an agent started, so Agents and Processes count them too */
  function onServers(list) {
    var P = 'tastebook';
    list.push(
      { id: 'p-preview', kind: 'process', role: 'server', project: P, surface: 'orchestrator', where: 'Run #47', owner: 'o-laned', title: 'Preview deploy', command: 'pm deploy preview --tag 0.9.0-rc.2', cwd: '~/tastebook', pid: 3121, ports: [8080], server: 'staging', environment: 'preview', state: 'working', startedAt: ago(640), delivery: 'user', waits: false, tail: OUT.preview.slice(), gen: 'preview', cpu: 9, mem: 380 },
      { id: 'p-evals', kind: 'process', role: 'script', project: P, surface: 'assistant', thread: 'thr-imp', where: 'Import fixes', owner: null, title: 'Unit normalizer evals', command: 'python evals/run.py --suite unit-normalizer', cwd: '~/tastebook/evals', pid: 7714, server: 'gpu', environment: 'ml', state: 'working', progress: { done: 6, total: 12, unit: 'batches', source: 'provider_reported' }, startedAt: ago(1180), delivery: 'agent', waits: false, tail: OUT.evals.slice(), gen: 'evals', cpu: 22, mem: 6200 },
      { id: 'p-ci', kind: 'process', role: 'build', project: P, surface: 'orchestrator', where: 'Run #47', owner: 'o-laneb', title: 'CI pipeline 318', command: 'pm ci run --pipeline 318', cwd: '/workspace/tastebook', pid: 211, server: 'ci', environment: 'ci', state: 'working', progress: { done: 4, total: 7, unit: 'steps', source: 'provider_reported' }, startedAt: ago(410), delivery: 'agent', waits: true, tail: OUT.ci.slice(), gen: 'ci', cpu: 64, mem: 2100 }
    );
    return list;
  }

  W.fixture.define('busy', function () { return { items: busy(), servers: serversBusy() }; });
  W.fixture.define('no-asks', function () {
    var list = busy().filter(function (x) { return x.state !== 'failed'; });
    list.forEach(function (x) { if (x.state === 'waiting') { x.state = 'working'; x.ask = null; x.quick = null; x.askedAt = null; x.detail = x.detail || 'Running'; } });
    return { items: list, servers: serversBusy() };
  });
  W.fixture.define('quiet', function () {
    var keep = { 'p-test': 1, 'o-sleuth': 1, 'o-docs': 1, 'agent-migration': 1 };
    var list = busy().filter(function (x) { return x.kind === 'service' || keep[x.id]; });
    list.push({ id: 'a-qp', kind: 'agent', role: 'main', project: 'tastebook', surface: 'assistant', thread: 'thr-qp', where: 'Query performance', title: 'Query performance', detail: 'Reply finished', model: 'Claude Sonnet 4.6', state: 'idle', word: 'Idle', startedAt: ago(800) });
    return { items: list, servers: serversBusy() };
  });
  W.fixture.define('many', function () { return { items: many(busy()), servers: serversBusy() }; });
  W.fixture.define('stale', function () { return { items: busy(), servers: serversBusy(), feed: { state: 'stale', at: ago(40) } }; });
  W.fixture.define('restart', function () {
    var list = busy();
    list.forEach(function (x) {
      if (x.id === 'p-dev' || x.id === 'p-bench') { x.state = 'warning'; x.word = 'Lost'; x.endedAt = ago(95); x.exit = null; x.progress = null; x.lost = 'Ended while Puppet Master was closed. No exit code was recorded; the agent was told once.'; }
    });
    return { items: list, servers: serversBusy(), restarted: { at: ago(120), lost: 2 } };
  });
  W.fixture.define('servers', function () { return { items: onServers(busy()), servers: serversMany() }; });

  /* The live tick: what a running process prints and how far a measured run has got. Never CPU or memory (D12). */
  var gi = {};
  W.fixture.tick(function (items) {
    var changed = false, now = Date.now();
    items.forEach(function (it) {
      if (it.state !== 'working' || it.stopping) return;
      if (it.progress && it.progress.unit === 's') {
        it.progress.done = Math.min(it.progress.total, Math.round((now - it.startedAt) / 1000));
        if (it.progress.done >= it.progress.total) {
          it.state = 'complete'; it.exit = 0; it.endedAt = now; it.progress = null;
          if (it.tail) it.tail.push('transaction type: tenant_read.sql', 'tps = 1398.204 (without initial connection time)');
          changed = true; return;
        }
        changed = true;
      } else if (it.progress && it.progress.unit === 'tests' && Math.random() < 0.5) {
        it.progress.done = Math.min(it.progress.total - 1, it.progress.done + 1 + Math.floor(Math.random() * 3)); changed = true;
      }
      var src = it.gen && OUT[it.gen];
      if (src && it.tail && Math.random() < 0.35) {
        gi[it.id] = ((gi[it.id] == null ? it.tail.length : gi[it.id]) + 1) % src.length;
        it.tail.push(src[gi[it.id]]);
        if (it.tail.length > 400) it.tail.splice(0, it.tail.length - 400);
        it.lines = (it.lines || 1200) + 1;
        changed = true;
      }
    });
    return changed;
  });
})();
