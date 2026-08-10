/* =====================================================================
   proto-data.js — static sample data for the 7 panels.
   Faithful to the canonical concept (Concepts/pm6-build/parts/12-html-side-
   panels.part.html) and the Plans feature requirements. Realistic but
   static — no live data plumbing in this prototype.
   Each design's render function consumes this data.
   ===================================================================== */
(function () {
  'use strict';

  var PANELS = ['search', 'source', 'actions', 'docker', 'tests', 'agents', 'artifacts'];

  var PANEL_META = {
    search:    { label: 'Search',          icon: 'search' },
    source:    { label: 'Source Control',  icon: 'git' },
    actions:   { label: 'GitHub Actions',  icon: 'github' },
    docker:    { label: 'Docker Manager',  icon: 'docker' },
    tests:     { label: 'Testing',         icon: 'check' },
    agents:    { label: 'Agents',          icon: 'robot' },
    artifacts: { label: 'Runtime Artifacts', icon: 'box' }
  };

  var DATA = {
    search: {
      index: { engine: 'tantivy', docs: 1284, lastIndexed: 'commit abc12ef · 4m ago', state: 'ready' },
      scopes: ['All Files', 'Open Files', 'src/ only', 'web/ only'],
      defaultScope: 'All Files',
      flags: { regex: false, case: false, word: false },
      query: 'quantity',
      results: {
        total: 7, fileCount: 3,
        files: [
          { path: 'src/services/import.rs', count: 3, hits: [
            { ln: 41,  html: 'fn parse_<em>quantity</em>(raw: &amp;str) -&gt; Result&lt;Qty&gt;' },
            { ln: 58,  html: '// mixed fractions: "1 1/2 cup" must not become <em>quantity</em> 11/2' },
            { ln: 73,  html: 'normalize_units(<em>quantity</em>, unit)' }
          ]},
          { path: 'src/routes/recipes.rs', count: 2, hits: [
            { ln: 112, html: 'pub <em>quantity</em>: f32,' },
            { ln: 240, html: 'ingredient.<em>quantity</em> * servings_ratio' }
          ]},
          { path: 'web/src/lib/Editor.svelte', count: 2, hits: [
            { ln: 88,  html: '&lt;input bind:value={row.<em>quantity</em>} /&gt;' },
            { ln: 131, html: 'export let <em>quantity</em>Step = 0.25;' }
          ]}
        ]
      }
    },

    source: {
      branch: 'main',
      branches: ['main', 'orch/lane-b-api', 'orch/lane-d-infra', 'thread/import-fixes', 'spike/r2-storage'],
      sections: ['Changes', 'Worktrees', 'History', 'Graph', 'Branches & Stash'],
      changes: {
        staged: [
          { path: 'src/routes/recipes.rs', status: 'M', note: 'HEAD vs index' },
          { path: 'web/src/lib/RecipeCard.svelte', status: 'A', note: 'HEAD vs index' }
        ],
        unstaged: [
          { path: 'src/services/image.rs', status: 'M', note: 'index vs working' }
        ]
      },
      commit: { incoming: 0, outgoing: 2 },
      projection: { freshness: 'current', health: 'healthy' },
      worktrees: [
        { branch: 'orch/lane-b-api', owner: 'Orch: lane-b API', state: 'orchestrator', status: 'clean', path: '.worktrees/lane-b-api', base: 'main · age 2h' },
        { branch: 'orch/lane-d-infra', owner: 'Orch: lane-d infra', state: 'orchestrator', status: 'dirty', path: '.worktrees/lane-d-infra', base: 'main · age 2h', pr: 'none yet — unlocks when run #47 completes' },
        { branch: 'thread/import-fixes', owner: 'Thread: Import worker debugging', state: 'thread', status: 'clean', path: '.worktrees/import-fixes', base: 'main · age 1d' },
        { branch: 'spike/r2-storage', owner: 'Manual', state: 'manual', status: 'clean', path: '.worktrees/r2-spike', base: 'main · age 3d' }
      ],
      history: [
        { sha: 'abc12ef', when: '4m ago',   msg: 'feat(search): tantivy query endpoint + ranked results' },
        { sha: 'def34ab', when: '2h ago',   msg: 'feat(ratings): schema + API + stars UI' },
        { sha: '789feed', when: 'yesterday', msg: 'chore: compose stack + registry cache' }
      ],
      stash: [{ name: 'stash@{0}', label: 'WIP image resize ladder', files: 2 }]
    },

    actions: {
      connection: { account: 'jared-dev', state: 'connected', scopes: ['repo', 'read:user', 'user:email'], missing: ['workflow'] },
      branch: 'main',
      readiness: '2 of 3 recent runs green',
      snapshot: 'webhook transport · 12s ago',
      runs: [
        { id: 'wf-312', name: 'CI — build + test', meta: '#312 · main · 2h ago', status: 'success', branch: 'main' },
        { id: 'wf-311', name: 'CI — build + test', meta: '#311 · lane-b-api · 3h ago', status: 'success', branch: 'lane-b-api' },
        { id: 'wf-310', name: 'CI — build + test', meta: '#310 · import-fixes · 5h ago', status: 'failed', branch: 'import-fixes',
          triage: { job: 'test', step: 'cargo test', changed: 'src/services/import.rs',
            log: ['test import::normalize_units ... FAILED', 'assertion failed: qty.value == 1.5 (got 11.5)', '↪ "1 1/2 cup" parsed as 11/2 — mixed fraction bug'],
            next: 'rerun after the parser fix (already patched by the debug thread)' } }
      ],
      workflows: [
        { name: 'CI — build + test', dispatchable: false, reason: 'not_configured' },
        { name: 'Release', dispatchable: false, reason: 'not_configured' }
      ],
      secrets: ['DOCKER_USER', 'DATABASE_URL', 'SENTRY_DSN']
    },

    docker: {
      runtime: { context: 'default', state: 'detected' },
      views: ['containers', 'images', 'compose', 'registries', 'build', 'publish'],
      defaultView: 'containers',
      containers: [
        { name: 'tastebook-web', image: 'jared/tastebook:v1.1', status: 'running',  ports: '5173', uptime: '2h 14m' },
        { name: 'tastebook-worker', image: 'jared/tastebook-worker:v1.1', status: 'running', ports: '—', uptime: '2h 14m' },
        { name: 'tastebook-db', image: 'postgres:16-alpine', status: 'running', ports: '5432', uptime: '2h 14m' },
        { name: 'tastebook-cache', image: 'redis:7-alpine', status: 'restarting', ports: '6379', uptime: '—' },
        { name: 'r2-spike', image: 'r2-storage:dev', status: 'exited', ports: '—', uptime: 'stopped 1h ago' }
      ],
      images: [
        { name: 'jared/tastebook:v1.1', size: '412 MB' },
        { name: 'jared/tastebook-worker:v1.1', size: '388 MB' },
        { name: 'postgres:16-alpine', size: '243 MB' },
        { name: 'redis:7-alpine', size: '41 MB' }
      ],
      compose: [
        { svc: 'db', image: 'postgres:16', status: 'running' },
        { svc: 'cache', image: 'redis:7', status: 'running' },
        { svc: 'web', image: 'tastebook:v1.1', status: 'idle' },
        { svc: 'worker', image: 'tastebook-worker:v1.1', status: 'idle' }
      ],
      scenarios: [
        { name: 'dev — web + db only', stale: false },
        { name: 'import-load — worker x3', stale: true }
      ],
      registries: [
        { name: 'Docker Hub', account: 'jared', state: 'authenticated' },
        { name: 'localhost:5000', account: 'registry-cache', state: 'reachable' },
        { name: 'ghcr.io', account: '—', state: 'not_configured' }
      ],
      build: { target: 'runtime', tag: 'jared/tastebook:v1.2', digest: '— not built yet', buildx: true, bake: false, arch: 'amd64+arm64' },
      publish: [
        { stage: 1, label: 'Local build', state: 'pending' },
        { stage: 2, label: 'Push tag + digest', state: 'pending' },
        { stage: 3, label: 'Hub repo jared/tastebook', state: 'exists' },
        { stage: 4, label: 'Unraid template repo', state: 'ready_to_push' },
        { stage: 5, label: 'Unraid follow-on', state: 'waiting' }
      ]
    },

    tests: {
      policy: 'show_when_possible',
      policyNote: 'Nodes surface test evidence whenever the runner reports it; silent runs are flagged stale.',
      lastRun: {
        command: 'cargo test',
        result: '214 passed',
        when: '4m ago · lane-b retry',
        history: '1 failed → fixed (import suite)'
      },
      sessions: [
        { id: 's-import', suite: 'import::normalize_units', cases: 24, status: 'pass', dur: '0.8s' },
        { id: 's-ratings', suite: 'ratings::*', cases: 18, status: 'pass', dur: '1.1s' },
        { id: 's-search', suite: 'search::tantivy', cases: 31, status: 'pass', dur: '1.5s' }
      ]
    },

    agents: {
      active: [
        { name: 'lane-b worker', meta: 'API nodes · run #47', status: 'running' },
        { name: 'Test Sleuth', meta: 'debug thread · 42s', status: 'done' },
        { name: 'Auditor', meta: 'review loop · queued', status: 'waiting' }
      ],
      note: 'Mirror of chat subagent chips — expand them in the thread for work streams.'
    },

    artifacts: {
      filters: ['all', 'web', 'browser', 'evidence'],
      defaultFilter: 'all',
      rows: [
        { family: 'evidence', type: 'code_diff', label: 'Import quantity parser fix', status: 'success', prev: 'src/services/import.rs +38 -9 · regression fixture added', meta: 'no fallback · 2 files · node n-19 · 6m ago' },
        { family: 'evidence', type: 'validation_test', label: 'cargo test — import suite', status: 'pass on retry', prev: '214 passed · 1 failed → fixed · 3.4s', meta: 'retry 2 of 2 · 214 cases · lane-b · 5m ago' },
        { family: 'evidence', type: 'screenshot', label: 'Recipe editor upload flow', status: 'success', prev: 'Before/after pair · media uploader with EXIF strip applied', meta: 'no fallback · 2 captures · lane-c · 14m ago' },
        { family: 'web', type: 'api_web_call', label: 'Searching Web: schema.org Recipe markup coverage 2026', status: 'completed', prev: 'operation_input: query = "schema.org Recipe markup coverage 2026"', meta: 'cmd.chat.web.search · provider model-native · no fallback · cache miss · 5 sources (3 read)' },
        { family: 'browser', type: 'browser_recording', label: 'Reading Site: seriouseats.com/.../quantity-parsing', status: 'completed', prev: 'Site Reader session sr-114 · 42 actions · 1 page · read receipt recorded', meta: 'Site Reader (primary) · no fallback · citation [3] in research run · 2 fields redacted' }
      ],
      investigation: {
        id: 'inv-import-7x',
        title: 'Import worker 7x quantity bug — bundle manifest',
        chips: [
          { label: 'final_state: fixed', ok: true },
          { label: 'stop_reason: verified_fix', ok: false },
          { label: 'artifacts: 5', ok: false },
          { label: 'verification: strong', ok: true }
        ],
        steps: [
          { role: 'baseline', type: 'validation_test', label: 'failing suite' },
          { role: 'repro', type: 'browser_recording', label: 'fixture import' },
          { role: 'diagnosis', type: 'tool_llm_trace', label: 'parse trace' },
          { role: 'fix', type: 'code_diff', label: 'parser patch' },
          { role: 'verification', type: 'validation_test', label: 'suite green' }
        ]
      }
    }
  };

  /* =====================================================================
     DENSITY SYSTEM — three content-volume tiers.
     The base DATA above is the "sparse / calm day" set (what the concept
     ships with). The generator below builds a deep-cloned EXPLODED set for
     the "extreme / nightmare" tier — the volume that made the OLD panel
     designs fall apart (40+ search hits, 20+ changed files, 30+ artifact
     rows, 60+ test cases, long code lines, long branch names, long image
     tags). The "realistic" tier sits between.
     Designs opt in by reading PROTO_DATA.getData() instead of .DATA.
     ===================================================================== */
  var density = 'sparse'; // 'sparse' | 'realistic' | 'extreme'

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function genExtreme() {
    var d = clone(DATA);

    /* ---- SEARCH: 14 files, 47 hits, long wrapping code lines ---- */
    var srchPaths = [
      'src/services/import.rs', 'src/routes/recipes.rs', 'src/routes/auth.rs',
      'src/services/image.rs', 'src/models/recipe.rs', 'src/models/ingredient.rs',
      'src/middleware/rate_limit.rs', 'src/db/migrations/0003_quantities.sql',
      'web/src/lib/Editor.svelte', 'web/src/lib/RecipeCard.svelte',
      'web/src/lib/IngredientRow.svelte', 'web/src/routes/recipe/[id]/+page.svelte',
      'web/tests/quantity.spec.ts', 'docs/api/recipes.md'
    ];
    var codeLines = [
      'fn parse_<em>quantity</em>(raw: &amp;str) -&gt; Result&lt;Qty, ParseQtyError&gt; { /* delegate to the fraction+unit normalizer, returning a strongly-typed Qty that carries value, unit, and an optional raw-text fallback for round-tripping */ }',
      '// mixed fractions: "1 1/2 cup" must not become <em>quantity</em> 11/2 — guard the whole/fraction split before unit normalization',
      'normalize_units(<em>quantity</em>, unit) // <-- the <em>quantity</em> arrives pre-scaled by servings_ratio; do NOT re-scale here',
      'pub <em>quantity</em>: f32, // serialized as fractional string on output for the recipe card; kept as f32 internally for servings math',
      'ingredient.<em>quantity</em> * servings_ratio // apply per-serving scaling AFTER unit normalization, before display formatting',
      '&lt;input bind:value={row.<em>quantity</em>} type="number" step="0.25" /&gt; // bound to the row model; the &lt;em&gt;quantity&lt;/em&gt; field drives the live preview',
      'export let <em>quantity</em>Step = 0.25; // default increment for the editor; overridden by per-unit steps (tsp=0.125, cup=0.25)',
      'const <em>quantity</em>Schema = z.number().positive().finite().max(9999); // runtime validation for inbound recipe payloads',
      'it("parses <em>quantity</em> with unicode vulgar fractions", () =&gt; { /* ¼ ½ ¾ ⅐ ⅑ ⅒ ⅓ ⅔ */ });',
      '### Recipe <em>quantity</em> field\n\nThe `<em>quantity</em>` field is a fractional decimal (f32) representing the numeric amount of the ingredient in its declared unit.'
    ];
    var files = [];
    var total = 0;
    for (var i = 0; i < srchPaths.length; i++) {
      var nhits = 2 + (i % 4); // 2..5 hits per file
      var hits = [];
      for (var j = 0; j < nhits; j++) {
        hits.push({ ln: 12 + i * 17 + j * 9, html: codeLines[(i + j) % codeLines.length] });
      }
      total += nhits;
      files.push({ path: srchPaths[i], count: nhits, hits: hits });
    }
    d.search.index.docs = 14837;
    d.search.index.lastIndexed = 'commit abc12ef · 18s ago · index rebuilding…';
    d.search.index.state = 'refreshing';
    d.search.results = { total: total, fileCount: files.length, files: files };

    /* ---- SOURCE: 18 staged + 12 unstaged + 6 worktrees + 15 commits + 4 stash ---- */
    var dirs = ['src/routes', 'src/services', 'src/models', 'src/middleware', 'web/src/lib', 'web/src/routes', 'migrations', 'tests'];
    var fns = ['recipes', 'auth', 'image', 'import', 'quantity', 'ratings', 'search', 'editor', 'parser', 'session'];
    var exts = ['.rs', '.svelte', '.ts', '.sql', '.toml'];
    var st = [], un = [];
    for (var k = 0; k < 18; k++) {
      st.push({ path: dirs[k % dirs.length] + '/' + fns[k % fns.length] + (k > 9 ? '-' + k : '') + exts[k % exts.length], status: k % 3 === 0 ? 'A' : 'M', note: 'HEAD vs index' });
    }
    for (var k = 0; k < 12; k++) {
      un.push({ path: dirs[(k + 2) % dirs.length] + '/' + fns[(k + 3) % fns.length] + '-wip' + exts[k % exts.length], status: 'M', note: 'index vs working' });
    }
    d.source.changes = { staged: st, unstaged: un };
    d.source.commit = { incoming: 0, outgoing: 18 };
    d.source.branches = ['main', 'orch/lane-b-api', 'orch/lane-d-infra', 'orch/lane-e-search', 'orch/lane-f-docs',
      'thread/import-fixes', 'thread/ratings-polish', 'thread/image-resize', 'spike/r2-storage', 'spike/vulgar-fractions',
      'release/1.2.0', 'hotfix/quant-overflow'];
    var wtOwners = ['Orch: lane-b API', 'Orch: lane-d infra', 'Orch: lane-e search', 'Thread: Import worker debugging', 'Thread: Ratings polish', 'Manual'];
    var wts = [];
    for (var k = 0; k < 6; k++) {
      wts.push({
        branch: d.source.branches[1 + (k % 5)],
        owner: wtOwners[k % wtOwners.length],
        state: k < 4 ? 'orchestrator' : (k === 4 ? 'thread' : 'manual'),
        status: k % 3 === 0 ? 'dirty' : 'clean',
        path: '.worktrees/' + d.source.branches[1 + (k % 5)].split('/').pop(),
        base: 'main · age ' + (k + 1) + 'h'
      });
    }
    d.source.worktrees = wts;
    var histMsgs = [
      'feat(search): tantivy query endpoint + ranked results with snippet highlighting',
      'feat(ratings): schema + API + stars UI plus aggregation endpoint',
      'chore: compose stack + registry cache and multi-arch build matrix',
      'fix(import): mixed-fraction parser — "1 1/2 cup" no longer becomes 11/2',
      'refactor(quantity): unify Qty type across f32 path and fraction path',
      'test: add 214 cases for the import normalization suite',
      'docs(api): document the recipe quantity field and serialization rules',
      'perf(image): lazy EXIF strip on upload, 40% faster thumbnails',
      'ci: split build and test into parallel jobs, -3m wall time',
      'feat(units): add metric/imperial conversion for 47 unit types',
      'fix(auth): session refresh edge case on token rotation',
      'chore(deps): bump axum to 0.8, tokio to 1.42',
      'feat(parser): vulgar-fraction support (¼ ½ ¾ ⅐ ⅑ ⅒ ⅓ ⅔)',
      'test(web): add Playwright spec for quantity editor edge cases',
      'fix(rate-limit): correct bucket key for recipe-scoped endpoints'
    ];
    d.source.history = histMsgs.map(function (msg, i) {
      return { sha: ('abc' + (1000 + i * 37).toString(16)).slice(0, 7), when: i === 0 ? '4m ago' : (i + 'h ago'), msg: msg };
    });
    d.source.stash = [
      { name: 'stash@{0}', label: 'WIP image resize ladder', files: 2 },
      { name: 'stash@{1}', label: 'experimental metric units branch', files: 7 },
      { name: 'stash@{2}', label: 'rate-limit refactor before ci split', files: 3 },
      { name: 'stash@{3}', label: 'tokio upgrade scratch', files: 12 }
    ];

    /* ---- ACTIONS: 12 runs (5 failing, 3 with triage) + 8 workflows + 12 secrets ---- */
    var runStatuses = ['success', 'success', 'success', 'failed', 'success', 'failed', 'cancelled', 'success', 'failed', 'success', 'in_progress', 'success'];
    var branches = ['main', 'lane-b-api', 'lane-d-infra', 'import-fixes', 'ratings-polish', 'image-resize', 'r2-spike', 'search'];
    d.actions.runs = runStatuses.map(function (st2, i) {
      var r = { id: 'wf-' + (313 - i), name: i % 4 === 0 ? 'Release' : 'CI — build + test',
        meta: '#' + (313 - i) + ' · ' + branches[i % branches.length] + ' · ' + (i * 37 % 60) + 'm ago',
        status: st2, branch: branches[i % branches.length] };
      if (st2 === 'failed' && i % 2 === 0) {
        r.triage = {
          job: i % 3 === 0 ? 'test' : 'build', step: i % 3 === 0 ? 'cargo test' : 'docker build',
          changed: 'src/services/import.rs',
          log: ['test import::normalize_units ... FAILED', '  assertion failed: qty.value == 1.5 (got 11.5)', '  note: "1 1/2 cup" parsed as 11/2 — mixed fraction bug', '  this failure has occurred on 3 consecutive runs'],
          next: 'rerun after the parser fix (already patched by the debug thread)'
        };
      }
      return r;
    });
    d.actions.readiness = '7 of 12 recent runs green · 5 failing';
    d.actions.workflows = [
      { name: 'CI — build + test', dispatchable: false, reason: 'not_configured' },
      { name: 'Release', dispatchable: false, reason: 'not_configured' },
      { name: 'Deploy — staging', dispatchable: false, reason: 'not_configured' },
      { name: 'Deploy — production', dispatchable: false, reason: 'not_configured' },
      { name: 'CodeQL analysis', dispatchable: false, reason: 'not_configured' },
      { name: 'Dependency review', dispatchable: false, reason: 'not_configured' },
      { name: 'PR labeler', dispatchable: false, reason: 'not_configured' },
      { name: 'Stale bot', dispatchable: false, reason: 'not_configured' }
    ];
    d.actions.secrets = ['DOCKER_USER', 'DOCKER_TOKEN', 'DATABASE_URL', 'SENTRY_DSN', 'STRIPE_KEY', 'JWT_SECRET', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'GH_TOKEN', 'NPM_TOKEN', 'POSTHOG_KEY', 'FEATURE_FLAGS'];

    /* ---- DOCKER: 18 containers, 14 images, 8 compose services, 6 registries ---- */
    var cnames = ['tastebook-web', 'tastebook-worker', 'tastebook-db', 'tastebook-cache',
      'tastebook-mailhog', 'tastebook-minio', 'tastebook-seed', 'r2-spike',
      'lane-b-web', 'lane-b-worker', 'lane-d-web', 'lane-d-worker',
      'migration-runner', 'cleanup-advisor', 'backup-sync', 'registry-cache',
      'playwright-runner', 'redis-insight'];
    var cimgs = ['jared/tastebook:v1.1', 'jared/tastebook-worker:v1.1', 'postgres:16-alpine',
      'redis:7-alpine', 'mailhog/mailhog:latest', 'minio/minio:latest', 'jared/tastebook-seed:1.0',
      'r2-storage:dev', 'jared/tastebook:v1.1-lane-b', 'jared/tastebook-worker:v1.1-lane-b'];
    var cstatus = ['running', 'running', 'running', 'restarting', 'running', 'running', 'exited',
      'exited', 'running', 'running', 'unhealthy', 'exited', 'exited', 'running', 'exited', 'running', 'exited', 'exited'];
    d.docker.containers = cnames.map(function (n, i) {
      return { name: n, image: cimgs[i % cimgs.length], status: cstatus[i % cstatus.length],
        ports: i % 3 === 0 ? String(5000 + i * 13) : '—', uptime: cstatus[i % cstatus.length] === 'running' ? (i + 1) + 'h ' + (i * 7 % 60) + 'm' : 'stopped' };
    });
    var imgs = ['jared/tastebook:v1.1', 'jared/tastebook:v1.0', 'jared/tastebook:v0.9',
      'jared/tastebook-worker:v1.1', 'jared/tastebook-worker:v1.0', 'jared/tastebook-seed:1.0',
      'jared/tastebook-seed:1.1', 'postgres:16-alpine', 'postgres:15-alpine',
      'redis:7-alpine', 'redis:6-alpine', 'minio/minio:latest',
      'mailhog/mailhog:latest', 'playwright:v1.49-jammy'];
    d.docker.images = imgs.map(function (n, i) {
      return { name: n, size: (120 + i * 47) % 600 + ' MB' };
    });
    d.docker.compose = ['web', 'worker', 'db', 'cache', 'mailhog', 'minio', 'seed', 'migration-runner'].map(function (svc, i) {
      var imgs2 = ['tastebook:v1.1', 'tastebook-worker:v1.1', 'postgres:16', 'redis:7', 'mailhog', 'minio', 'tastebook-seed:1.0', 'tastebook:v1.1'];
      return { svc: svc, image: imgs2[i], status: i < 4 ? 'running' : 'idle' };
    });
    d.docker.registries = [
      { name: 'Docker Hub', account: 'jared', state: 'authenticated' },
      { name: 'localhost:5000', account: 'registry-cache', state: 'reachable' },
      { name: 'ghcr.io', account: 'jared-dev', state: 'authenticated' },
      { name: 'registry.unraid.local', account: '—', state: 'not_configured' },
      { name: 'gcr.io', account: '—', state: 'not_configured' },
      { name: 'quay.io', account: '—', state: 'not_configured' }
    ];
    d.docker.scenarios = [
      { name: 'dev — web + db only', stale: false },
      { name: 'import-load — worker x3', stale: false },
      { name: 'test — full stack + playwright', stale: false },
      { name: 'migration — db + migration-runner', stale: true },
      { name: 'backup — db + backup-sync + minio', stale: false },
      { name: 'debug — web + db + mailhog + redis-insight', stale: true }
    ];

    /* ---- TESTS: 60 suites / 312 cases ---- */
    var suiteNames = ['import::normalize_units', 'import::vulgar_fractions', 'ratings::*', 'search::tantivy',
      'search::ranking', 'image::exif_strip', 'image::thumbnails', 'auth::session_refresh',
      'auth::token_rotation', 'middleware::rate_limit', 'db::migrations', 'parser::units_metric',
      'parser::units_imperial', 'routes::recipes_crud', 'routes::recipes_serving_scale',
      'web::quantity_editor', 'web::recipe_card_render', 'web::ingredient_row'];
    var statuses = ['pass', 'pass', 'pass', 'pass', 'pass', 'fail', 'pass', 'pass', 'pass', 'pass', 'pass', 'skip', 'pass', 'pass', 'fail', 'pass', 'pass', 'pass'];
    d.tests.sessions = [];
    var totalCases = 0;
    for (var i = 0; i < 60; i++) {
      var sn = suiteNames[i % suiteNames.length] + (i >= suiteNames.length ? ' #' + Math.floor(i / suiteNames.length) : '');
      var cases = 3 + (i * 7 % 22);
      totalCases += cases;
      d.tests.sessions.push({
        id: 's-' + i, suite: sn, cases: cases,
        status: statuses[i % statuses.length], dur: (0.3 + (i % 20) * 0.15).toFixed(1) + 's'
      });
    }
    d.tests.lastRun.result = totalCases + ' passed · 2 failed · 3 skipped';
    d.tests.lastRun.when = 'just now · 60 suites · 3.4s';

    /* ---- AGENTS: 9 active ---- */
    var agentNames = ['lane-b worker', 'lane-d worker', 'lane-e search worker', 'Test Sleuth',
      'Auditor', 'Migration Verifier', 'Image Optimizer', 'Docs Writer', 'Release Preflight'];
    var agentMeta = ['API nodes · run #47', 'infra nodes · run #47', 'search nodes · run #47',
      'debug thread · 42s', 'review loop · queued', 'migration suite · running',
      'thumbnail batch · 7/40', 'API docs · 12/30', 'bake + push · queued'];
    var agentStatus = ['running', 'running', 'running', 'done', 'waiting', 'running', 'running', 'running', 'waiting'];
    d.agents.active = agentNames.map(function (n, i) {
      return { name: n, meta: agentMeta[i], status: agentStatus[i] };
    });

    /* ---- ARTIFACTS: 32 rows + 7-step investigation ---- */
    var artTypes = ['code_diff', 'validation_test', 'screenshot', 'browser_recording', 'api_web_call', 'reasoning_summary', 'tool_llm_trace', 'cost_usage', 'evidence', 'document'];
    var artFams = ['evidence', 'evidence', 'evidence', 'browser', 'web', 'evidence', 'evidence', 'evidence', 'evidence', 'evidence'];
    var artLabels = [
      'Import quantity parser fix', 'cargo test — import suite', 'Recipe editor upload flow',
      'Reading Site: seriouseats.com/.../quantity-parsing', 'Searching Web: schema.org Recipe markup coverage 2026',
      'Reasoning: chose fraction-first parser over float', 'Tool trace: normalize_units call graph',
      'Cost attribution: lane-b API nodes', 'Evidence: mixed-fraction regression fixture',
      'Document: API contract for quantity field'
    ];
    var artPrev = [
      'src/services/import.rs +38 -9 · regression fixture added',
      '214 passed · 1 failed → fixed · 3.4s',
      'Before/after pair · media uploader with EXIF strip applied',
      'Site Reader session sr-114 · 42 actions · 1 page · read receipt recorded',
      'operation_input: query = "schema.org Recipe markup coverage 2026"',
      'model reasoning summary · 1,247 tokens · 3 alternatives considered',
      '12 tool calls · 8 file reads · 2 web reads · 1.8s total',
      '$0.043 · 47k input · 2.1k output · provider model-native',
      'fixture: blogs/import/serious-eats.html · expected qty 1.5 · got 11.5',
      'REST + GraphQL · 14 endpoints · OpenAPI 3.1 schema'
    ];
    d.artifacts.rows = [];
    for (var i = 0; i < 32; i++) {
      d.artifacts.rows.push({
        family: artFams[i % artFams.length], type: artTypes[i % artTypes.length],
        label: artLabels[i % artLabels.length] + (i >= artLabels.length ? ' (run #' + (47 - Math.floor(i / 10)) + ')' : ''),
        status: i % 7 === 0 ? 'failed' : 'success', prev: artPrev[i % artPrev.length],
        meta: 'node n-' + (19 - (i % 8)) + ' · ' + (i * 3 % 50) + 'm ago · lane-' + ['b', 'c', 'd', 'e'][i % 4]
      });
    }
    d.artifacts.investigation.steps = [
      { role: 'baseline', type: 'validation_test', label: 'failing suite (3 consecutive failures)' },
      { role: 'repro', type: 'browser_recording', label: 'fixture blog imported, qty exploded 7x' },
      { role: 'repro', type: 'screenshot', label: 'before/after editor state' },
      { role: 'diagnosis', type: 'tool_llm_trace', label: 'mixed-fraction parse traced to normalize_units' },
      { role: 'diagnosis', type: 'reasoning_summary', label: 'chose fraction-first over float parse' },
      { role: 'fix', type: 'code_diff', label: 'parser patch + 214 regression fixtures' },
      { role: 'verification', type: 'validation_test', label: 'suite green · verification strength strong' }
    ];
    d.artifacts.investigation.chips = [
      { label: 'final_state: fixed', ok: true }, { label: 'stop_reason: verified_fix', ok: false },
      { label: 'artifacts: 32', ok: false }, { label: 'verification: strong', ok: true },
      { label: 'cost: $0.31', ok: false }, { label: 'nodes: 8', ok: false }
    ];

    return d;
  }

  /* ---- realistic = a light expansion (2-3x sparse, not nightmare) ---- */
  function genRealistic() {
    var ex = genExtreme();
    var d = clone(DATA);
    d.search.results = { total: 14, fileCount: 5, files: ex.search.results.files.slice(0, 5) };
    d.source.changes = { staged: ex.source.changes.staged.slice(0, 5), unstaged: ex.source.changes.unstaged.slice(0, 3) };
    d.source.worktrees = ex.source.worktrees.slice(0, 4);
    d.source.history = ex.source.history.slice(0, 6);
    d.source.stash = ex.source.stash.slice(0, 2);
    d.actions.runs = ex.actions.runs.slice(0, 6);
    d.actions.workflows = ex.actions.workflows.slice(0, 4);
    d.docker.containers = ex.docker.containers.slice(0, 8);
    d.docker.images = ex.docker.images.slice(0, 6);
    d.tests.sessions = ex.tests.sessions.slice(0, 12);
    d.agents.active = ex.agents.active.slice(0, 5);
    d.artifacts.rows = ex.artifacts.rows.slice(0, 10);
    return d;
  }

  var cache = { sparse: DATA, realistic: null, extreme: null };

  function getData() {
    if (density === 'sparse') return cache.sparse;
    if (density === 'realistic') return cache.realistic || (cache.realistic = genRealistic());
    if (density === 'extreme') return cache.extreme || (cache.extreme = genExtreme());
    return cache.sparse;
  }

  function setDensity(mode) {
    if (['sparse', 'realistic', 'extreme'].indexOf(mode) >= 0) {
      density = mode;
    }
    return density;
  }
  function getDensity() { return density; }

  window.PROTO_DATA = {
    PANELS: PANELS,
    PANEL_META: PANEL_META,
    DATA: DATA,
    getData: getData,
    setDensity: setDensity,
    getDensity: getDensity
  };
})();
