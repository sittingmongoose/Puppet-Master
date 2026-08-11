/* Demo fixtures for side-panel prototypes — comfortable + crowded packs. */
(function (global) {
  var themes = [
    'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light',
    'retro-dark', 'retro-light', 'basic-dark', 'basic-light'
  ];
  var themeLabels = {
    'friendly-dark': 'Friendly Dark',
    'friendly-light': 'Friendly Light',
    'glass-dark': 'Glass Dark',
    'glass-light': 'Glass Light',
    'retro-dark': 'Retro Dark',
    'retro-light': 'Retro Light',
    'basic-dark': 'Basic Dark',
    'basic-light': 'Basic Light'
  };
  var shells = [
    { id: '01', file: '01-stacked-rail.html', name: 'Stacked Rail', blurb: 'Zero nested cards; sticky rail + continuous list.' },
    { id: '02', file: '02-segment-strip.html', name: 'Segment Strip', blurb: 'Segmented subviews; pure list body; kebab overflow.' },
    { id: '03', file: '03-inspector-sheet.html', name: 'Inspector Sheet', blurb: 'List dominates; bottom sheet for detail.' },
    { id: '04', file: '04-command-toolbar.html', name: 'Command Toolbar', blurb: 'Icon toolbar + chips; pinned footer CTAs.' },
    { id: '05', file: '05-icon-spine.html', name: 'Icon Spine', blurb: 'Vertical subview spine; content beside.' },
    { id: '06', file: '06-focus-ladder.html', name: 'Focus Ladder', blurb: 'One open section; sprout for scope/branch.' }
  ];
  var panels = [
    { id: 'search', label: 'Search' },
    { id: 'source', label: 'Source' },
    { id: 'actions', label: 'Actions' },
    { id: 'docker', label: 'Docker' },
    { id: 'tests', label: 'Tests' },
    { id: 'agents', label: 'Agents' },
    { id: 'artifacts', label: 'Artifacts' }
  ];

  var ARTIFACT_TYPES = [
    'diff', 'plan', 'test', 'screenshot', 'evidence', 'doc', 'restore_point',
    'browser_recording', 'trace', 'context', 'cost_usage', 'hitl', 'failed_attempt',
    'lineage', 'before_after', 'next_steps', 'api_web_call', 'version', 'investigation'
  ];

  var comfortable = {
    search: {
      index: { status: 'Ready', engine: 'tantivy', docs: '1,284', last: 'abc12ef · 4m ago' },
      scopes: ['All Files', 'Open Files', 'src/ only', 'web/ only'],
      hits: [
        { file: 'src/services/import.rs', count: 3, lines: [
          { ln: 41, text: 'fn parse_quantity(raw: &str) -> Result<Qty>' },
          { ln: 58, text: '// mixed fractions must not become quantity 11/2' },
          { ln: 73, text: 'normalize_units(quantity, unit)' }
        ]},
        { file: 'src/routes/recipes.rs', count: 2, lines: [
          { ln: 112, text: 'pub quantity: f32,' },
          { ln: 240, text: 'ingredient.quantity * servings_ratio' }
        ]},
        { file: 'web/src/lib/Editor.svelte', count: 2, lines: [
          { ln: 88, text: '<input bind:value={row.quantity} />' },
          { ln: 131, text: 'export let quantityStep = 0.25;' }
        ]}
      ]
    },
    source: {
      branches: ['main', 'orch/lane-b-api', 'orch/lane-d-infra', 'thread/import-fixes', 'spike/r2-storage'],
      subviews: ['Changes', 'History', 'Graph', 'Worktrees', 'Branches', 'Stash'],
      staged: [
        { path: 'src/routes/recipes.rs', status: 'M' },
        { path: 'web/src/lib/RecipeCard.svelte', status: 'A' }
      ],
      unstaged: [{ path: 'src/services/image.rs', status: 'M' }],
      untracked: [{ path: 'tmp/scratch.md', status: 'U' }],
      conflicts: [{ path: 'src/services/import.rs', status: 'UU' }],
      history: [
        { hash: 'abc12ef', msg: 'Normalize quantity parsing', age: '4m' },
        { hash: '9f3aa10', msg: 'Wire recipe servings ratio', age: '2h' },
        { hash: '71c0bb2', msg: 'Add RecipeCard skeleton', age: '1d' }
      ],
      worktrees: [
        { name: 'main', owner: 'workspace', filter: 'All', status: 'clean' },
        { name: 'orch/lane-b-api', owner: 'Orch: lane-b', filter: 'Orchestrator', status: 'ahead 1' },
        { name: 'orch/lane-d-infra', owner: 'Orch: lane-d', filter: 'Orchestrator', status: 'diverged' },
        { name: 'thread/import-fixes', owner: 'Thread', filter: 'Threads', status: 'dirty' },
        { name: 'spike/r2-storage', owner: 'Manual', filter: 'Manual', status: 'clean' }
      ]
    },
    actions: {
      subviews: ['Current Branch', 'Workflows', 'Settings'],
      runs: [
        { name: 'CI', status: 'passed', age: '12m', pin: true },
        { name: 'Build & Publish', status: 'failed', age: '34m', pin: true },
        { name: 'Nightly E2E', status: 'running', age: '2m', pin: false },
        { name: 'Docs', status: 'passed', age: '1d', pin: false },
        { name: 'Deploy staging', status: 'waiting', age: '8m', pin: false, blocked: 'env approval' }
      ],
      workflows: [
        { name: 'ci.yml', health: 'ok', last: 'passed' },
        { name: 'publish.yml', health: 'stale', last: 'failed' },
        { name: 'e2e.yml', health: 'ok', last: 'running' }
      ],
      settings: [
        { k: 'Secrets', v: '12 names · view-only' },
        { k: 'Variables', v: '8 · project scope' },
        { k: 'Environments', v: 'staging · production' },
        { k: 'Runners', v: '2 online · 1 idle' }
      ]
    },
    docker: {
      subviews: ['Containers', 'Images', 'Compose', 'Registries', 'Build/Bake', 'Publish/Unraid', 'Networks', 'Volumes', 'Contexts', 'Kubernetes'],
      containers: [
        { name: 'tastebook-api', state: 'running', image: 'tastebook-api:dev' },
        { name: 'tastebook-web', state: 'running', image: 'node:22' },
        { name: 'postgres', state: 'running', image: 'postgres:16' },
        { name: 'redis', state: 'exited', image: 'redis:7' }
      ],
      images: [
        { name: 'tastebook-api:dev', size: '186 MB' },
        { name: 'postgres:16', size: '432 MB' },
        { name: 'redis:7', size: '41 MB' }
      ],
      compose: [
        { name: 'api', state: 'up' },
        { name: 'web', state: 'up' },
        { name: 'db', state: 'up' },
        { name: 'worker', state: 'restarting' }
      ]
    },
    tests: {
      policy: 'Auto',
      lastStatus: 'failed',
      runtimeReady: true,
      runs: [
        { id: 'tr-1842', label: 'import worker suite', status: 'failed', age: '6m' },
        { id: 'tr-1841', label: 'api unit', status: 'passed', age: '1h' },
        { id: 'tr-1840', label: 'web e2e smoke', status: 'passed', age: '3h' }
      ],
      failures: [
        { test: 'parse_quantity_mixed_fraction', file: 'import.rs:58' },
        { test: 'servings_ratio_scales_qty', file: 'recipes.rs:240' }
      ],
      artifacts: ['junit.xml', 'failure-shot.png', 'console.log']
    },
    agents: {
      active: [
        { name: 'Planner', parent: 'Goal #482', status: 'running' },
        { name: 'Coder', parent: 'Planner', status: 'waiting' },
        { name: 'Reviewer', parent: 'Coder', status: 'idle' }
      ],
      available: [
        { name: 'Researcher', caps: 'web · citations' },
        { name: 'Tester', caps: 'ATS runner' },
        { name: 'Docs', caps: 'markdown · PR' },
        { name: 'Docker Ops', caps: 'compose · publish' }
      ]
    },
    artifacts: {
      types: ARTIFACT_TYPES.slice(),
      rows: [
        { id: 'art-901', type: 'diff', title: 'recipes.rs quantity fix', fresh: '4m', health: 'ok' },
        { id: 'art-902', type: 'cost_usage', title: 'Goal #482 usage', fresh: '4m', health: 'ok' },
        { id: 'art-903', type: 'screenshot', title: 'E2E failure shot', fresh: '6m', health: 'warn' },
        { id: 'art-904', type: 'trace', title: 'import worker DAP', fresh: '12m', health: 'ok' },
        { id: 'art-905', type: 'lineage', title: 'Planner → Coder', fresh: '14m', health: 'ok' },
        { id: 'art-906', type: 'plan', title: 'Deep Plan pack', fresh: '1h', health: 'ok' },
        { id: 'art-907', type: 'test', title: 'junit import suite', fresh: '6m', health: 'err' },
        { id: 'art-908', type: 'hitl', title: 'Permission: docker.sock', fresh: '2h', health: 'warn' },
        { id: 'art-909', type: 'evidence', title: 'Browser evidence (gated)', fresh: '3h', health: 'blocked' }
      ]
    }
  };

  var crowded = {
    search: {
      index: { status: 'Ready', engine: 'tantivy', docs: '48,912', last: 'f7c91aa · 38s ago' },
      scopes: ['All Files', 'Open Files', 'src/ only', 'web/ only', 'Plans/', '*.rs', 'Exclude tests'],
      hits: [
        { file: 'src/services/import/quantity/normalize.rs', count: 4, lines: [
          { ln: 12, text: 'pub fn normalize_quantity(raw: &str) -> Result<Quantity, ParseError>' },
          { ln: 41, text: 'fn parse_quantity(raw: &str) -> Result<Qty>' },
          { ln: 58, text: '// mixed fractions must not become quantity 11/2' },
          { ln: 73, text: 'normalize_units(quantity, unit)' }
        ]},
        { file: 'src/services/import/quantity/scale.rs', count: 3, lines: [
          { ln: 19, text: 'quantity.scale_by(servings_ratio)' },
          { ln: 44, text: 'if quantity.is_mixed_fraction() { return Err(...); }' },
          { ln: 88, text: 'Ok(ScaledQuantity { quantity, unit })' }
        ]},
        { file: 'src/routes/recipes/servings.rs', count: 3, lines: [
          { ln: 112, text: 'pub quantity: f32,' },
          { ln: 240, text: 'ingredient.quantity * servings_ratio' },
          { ln: 311, text: 'recompute_quantity_display(quantity, unit)' }
        ]},
        { file: 'src/routes/recipes/mod.rs', count: 2, lines: [
          { ln: 55, text: 'mod quantity_helpers;' },
          { ln: 90, text: 'use crate::services::import::quantity;' }
        ]},
        { file: 'src/domain/ingredient/quantity_types.rs', count: 3, lines: [
          { ln: 8, text: 'pub struct Quantity { pub value: f32, pub unit: Unit }' },
          { ln: 34, text: 'impl Quantity { pub fn from_mixed(...) -> Self' },
          { ln: 67, text: '// quantity display prefers unicode fractions' }
        ]},
        { file: 'src/ui/panels/search_hit_row.rs', count: 2, lines: [
          { ln: 22, text: 'hit.preview.contains("quantity")' },
          { ln: 61, text: 'elide_path_with_quantity_context(path)' }
        ]},
        { file: 'web/src/lib/Editor/QuantityInput.svelte', count: 3, lines: [
          { ln: 14, text: 'export let quantity: number;' },
          { ln: 88, text: '<input bind:value={row.quantity} />' },
          { ln: 131, text: 'export let quantityStep = 0.25;' }
        ]},
        { file: 'web/src/lib/RecipeCard/QuantityBadge.svelte', count: 2, lines: [
          { ln: 9, text: 'formatQuantity(ingredient.quantity)' },
          { ln: 40, text: 'title={`quantity · ${unit}`}' }
        ]},
        { file: 'web/src/routes/recipes/[id]/+page.svelte', count: 2, lines: [
          { ln: 77, text: '$: scaled = base.quantity * servings' },
          { ln: 120, text: 'aria-label="Edit quantity"' }
        ]},
        { file: 'Plans/features/Import_Quantity_Parsing.md', count: 3, lines: [
          { ln: 14, text: '### Quantity tokenization' },
          { ln: 52, text: 'Reject ambiguous quantity 11/2 without space' },
          { ln: 88, text: 'Display quantity with unit elision at 220px' }
        ]},
        { file: 'crates/pm-index/src/query/quantity_boost.rs', count: 2, lines: [
          { ln: 31, text: 'boost_term("quantity", 1.4)' },
          { ln: 55, text: '// prefer quantity hits in src/services/import' }
        ]},
        { file: 'tests/fixtures/recipes/quantity_edge_cases.json', count: 3, lines: [
          { ln: 4, text: '"raw": "1 1/2 cups", "quantity": 1.5' },
          { ln: 18, text: '"raw": "11/2", "expect": "ambiguous_quantity"' },
          { ln: 33, text: '"quantity_unit": "tbsp"' }
        ]},
        { file: 'scripts/migrate_quantity_columns.sql', count: 2, lines: [
          { ln: 7, text: 'ALTER TABLE ingredients RENAME COLUMN qty TO quantity;' },
          { ln: 22, text: '-- backfill quantity from legacy strings' }
        ]},
        { file: 'docs/adr/0014-quantity-canonical-form.md', count: 2, lines: [
          { ln: 11, text: 'Canonical quantity is f32 + Unit enum' },
          { ln: 40, text: 'UI must not invent a second quantity type' }
        ]},
        { file: '.worktrees/orch-lane-b-api/src/services/import.rs', count: 3, lines: [
          { ln: 41, text: 'fn parse_quantity(raw: &str) -> Result<Qty>' },
          { ln: 99, text: 'lane-b override for quantity locale' },
          { ln: 140, text: 'conflict marker around quantity parse' }
        ]}
      ]
    },
    source: {
      branches: [
        'main', 'orch/lane-b-api', 'orch/lane-d-infra', 'orch/lane-e-search',
        'thread/import-fixes', 'thread/panel-crowding', 'spike/r2-storage',
        'spike/slint-side-panels', 'hotfix/quantity-crash'
      ],
      subviews: ['Changes', 'History', 'Graph', 'Worktrees', 'Branches', 'Stash'],
      staged: [
        { path: 'src/routes/recipes/servings.rs', status: 'M' },
        { path: 'src/services/import/quantity/normalize.rs', status: 'M' },
        { path: 'web/src/lib/RecipeCard/QuantityBadge.svelte', status: 'A' },
        { path: 'web/src/lib/Editor/QuantityInput.svelte', status: 'A' },
        { path: 'Plans/features/Import_Quantity_Parsing.md', status: 'M' },
        { path: 'crates/pm-index/src/query/quantity_boost.rs', status: 'A' },
        { path: 'tests/fixtures/recipes/quantity_edge_cases.json', status: 'M' }
      ],
      unstaged: [
        { path: 'src/services/image/thumbnail_pipeline.rs', status: 'M' },
        { path: 'src/ui/panels/search_hit_row.rs', status: 'M' },
        { path: 'src/domain/ingredient/quantity_types.rs', status: 'M' },
        { path: 'web/src/routes/recipes/[id]/+page.svelte', status: 'M' },
        { path: 'docs/adr/0014-quantity-canonical-form.md', status: 'M' },
        { path: 'scripts/migrate_quantity_columns.sql', status: 'A' }
      ],
      untracked: [
        { path: 'tmp/scratch-quantity-notes.md', status: 'U' },
        { path: 'tmp/panel-crowding-audit.html', status: 'U' },
        { path: '.worktrees/orch-lane-b-api/.pm-local.json', status: 'U' }
      ],
      conflicts: [
        { path: 'src/services/import/quantity/normalize.rs', status: 'UU' },
        { path: '.worktrees/orch-lane-b-api/src/services/import.rs', status: 'UU' },
        { path: 'web/src/lib/Editor/QuantityInput.svelte', status: 'UU' }
      ],
      history: [
        { hash: 'f7c91aa', msg: 'Crowding fixtures for side-panel stress', age: '38s' },
        { hash: 'abc12ef', msg: 'Normalize quantity parsing', age: '4m' },
        { hash: '9f3aa10', msg: 'Wire recipe servings ratio', age: '2h' },
        { hash: '71c0bb2', msg: 'Add RecipeCard skeleton', age: '1d' },
        { hash: 'd4e81c0', msg: 'Search hit elision at 220px', age: '1d' },
        { hash: '88a1f02', msg: 'Docker fleet long image tags', age: '2d' },
        { hash: 'c09bb7e', msg: 'Source worktree owner filters', age: '2d' },
        { hash: '15e0ad9', msg: 'Actions waiting/blocked meta', age: '3d' },
        { hash: 'b2f44c1', msg: 'Artifacts health rail groups', age: '4d' },
        { hash: '0aa91de', msg: 'Agents lineage tree depth', age: '5d' },
        { hash: 'e7712ac', msg: 'Tests receipt + failure stack', age: '6d' },
        { hash: '334f0b8', msg: 'Initial side-panel prototype kit', age: '1w' }
      ],
      worktrees: [
        { name: 'main', owner: 'workspace', filter: 'All', status: 'clean' },
        { name: 'orch/lane-b-api', owner: 'Orch: lane-b', filter: 'Orchestrator', status: 'ahead 1' },
        { name: 'orch/lane-d-infra', owner: 'Orch: lane-d', filter: 'Orchestrator', status: 'diverged' },
        { name: 'orch/lane-e-search', owner: 'Orch: lane-e', filter: 'Orchestrator', status: 'dirty' },
        { name: 'thread/import-fixes', owner: 'Thread', filter: 'Threads', status: 'dirty' },
        { name: 'thread/panel-crowding', owner: 'Thread', filter: 'Threads', status: 'ahead 3' },
        { name: 'spike/r2-storage', owner: 'Manual', filter: 'Manual', status: 'clean' },
        { name: 'spike/slint-side-panels', owner: 'Manual', filter: 'Manual', status: 'dirty' }
      ]
    },
    actions: {
      subviews: ['Current Branch', 'Workflows', 'Settings'],
      runs: [
        { name: 'CI', status: 'passed', age: '12m', pin: true },
        { name: 'Build & Publish', status: 'failed', age: '34m', pin: true },
        { name: 'Nightly E2E', status: 'running', age: '2m', pin: false },
        { name: 'Docs', status: 'passed', age: '1d', pin: false },
        { name: 'Deploy staging', status: 'waiting', age: '8m', pin: false, blocked: 'env approval' },
        { name: 'Deploy production', status: 'waiting', age: '15m', pin: false, blocked: 'HITL: release captain' },
        { name: 'Security scan', status: 'passed', age: '22m', pin: false },
        { name: 'Lint & format', status: 'passed', age: '25m', pin: false },
        { name: 'Typecheck web', status: 'failed', age: '28m', pin: false },
        { name: 'Docker bake matrix', status: 'running', age: '5m', pin: true },
        { name: 'Publish Unraid template', status: 'waiting', age: '41m', pin: false, blocked: 'registry token' },
        { name: 'Contract tests', status: 'passed', age: '2h', pin: false },
        { name: 'Perf budget', status: 'failed', age: '3h', pin: false },
        { name: 'Accessibility audit', status: 'passed', age: '5h', pin: false },
        { name: 'Release notes', status: 'passed', age: '1d', pin: false },
        { name: 'Canary rollforward', status: 'waiting', age: '9m', pin: false, blocked: 'metrics gate' }
      ],
      workflows: [
        { name: 'ci.yml', health: 'ok', last: 'passed' },
        { name: 'publish.yml', health: 'stale', last: 'failed' },
        { name: 'e2e.yml', health: 'ok', last: 'running' },
        { name: 'deploy-staging.yml', health: 'ok', last: 'waiting' },
        { name: 'deploy-prod.yml', health: 'warn', last: 'waiting' },
        { name: 'security.yml', health: 'ok', last: 'passed' },
        { name: 'docker-bake.yml', health: 'ok', last: 'running' },
        { name: 'perf.yml', health: 'stale', last: 'failed' }
      ],
      settings: [
        { k: 'Secrets', v: '28 names · view-only' },
        { k: 'Variables', v: '19 · project + org scope' },
        { k: 'Environments', v: 'dev · staging · production · unraid' },
        { k: 'Runners', v: '6 online · 2 busy · 1 offline' },
        { k: 'Required reviewers', v: 'release-captain · security' },
        { k: 'Concurrency', v: 'cancel-in-progress on main' }
      ]
    },
    docker: {
      subviews: ['Containers', 'Images', 'Compose', 'Registries', 'Build/Bake', 'Publish/Unraid', 'Networks', 'Volumes', 'Contexts', 'Kubernetes'],
      containers: [
        { name: 'tastebook-api', state: 'running', image: 'ghcr.io/puppetmaster/tastebook-api:dev-abc12ef' },
        { name: 'tastebook-web', state: 'running', image: 'node:22.14-bookworm-slim' },
        { name: 'tastebook-worker', state: 'running', image: 'ghcr.io/puppetmaster/tastebook-worker:dev-9f3aa10' },
        { name: 'tastebook-indexer', state: 'running', image: 'ghcr.io/puppetmaster/pm-index:0.4.2-tantivy' },
        { name: 'postgres', state: 'running', image: 'postgres:16.4-alpine' },
        { name: 'postgres-test', state: 'exited', image: 'postgres:16.4-alpine' },
        { name: 'redis', state: 'exited', image: 'redis:7.4.1-alpine' },
        { name: 'redis-cache-sidecar', state: 'running', image: 'redis:7.4.1-alpine' },
        { name: 'minio', state: 'running', image: 'minio/minio:RELEASE.2024-12-18T13-15-44Z' },
        { name: 'mailhog', state: 'exited', image: 'mailhog/mailhog:v1.0.1' },
        { name: 'traefik', state: 'running', image: 'traefik:v3.2.1' },
        { name: 'otel-collector', state: 'running', image: 'otel/opentelemetry-collector-contrib:0.115.0' },
        { name: 'prometheus', state: 'running', image: 'prom/prometheus:v2.55.1' },
        { name: 'grafana', state: 'restarting', image: 'grafana/grafana:11.3.1' },
        { name: 'unraid-publisher', state: 'exited', image: 'ghcr.io/puppetmaster/unraid-publish:0.2.0' },
        { name: 'buildkitd', state: 'running', image: 'moby/buildkit:v0.17.1' },
        { name: 'registry-mirror', state: 'running', image: 'registry:2.8.3' },
        { name: 'legacy-mongo-spike', state: 'exited', image: 'mongo:7.0.14' }
      ],
      images: [
        { name: 'ghcr.io/puppetmaster/tastebook-api:dev-abc12ef', size: '186 MB' },
        { name: 'ghcr.io/puppetmaster/tastebook-worker:dev-9f3aa10', size: '204 MB' },
        { name: 'ghcr.io/puppetmaster/pm-index:0.4.2-tantivy', size: '312 MB' },
        { name: 'ghcr.io/puppetmaster/unraid-publish:0.2.0', size: '88 MB' },
        { name: 'node:22.14-bookworm-slim', size: '198 MB' },
        { name: 'postgres:16.4-alpine', size: '246 MB' },
        { name: 'redis:7.4.1-alpine', size: '41 MB' },
        { name: 'minio/minio:RELEASE.2024-12-18T13-15-44Z', size: '168 MB' },
        { name: 'traefik:v3.2.1', size: '152 MB' },
        { name: 'otel/opentelemetry-collector-contrib:0.115.0', size: '220 MB' },
        { name: 'moby/buildkit:v0.17.1', size: '176 MB' },
        { name: 'grafana/grafana:11.3.1', size: '398 MB' }
      ],
      compose: [
        { name: 'api', state: 'up' },
        { name: 'web', state: 'up' },
        { name: 'worker', state: 'up' },
        { name: 'indexer', state: 'up' },
        { name: 'db', state: 'up' },
        { name: 'redis', state: 'exited' },
        { name: 'minio', state: 'up' },
        { name: 'observability', state: 'restarting' }
      ]
    },
    tests: {
      policy: 'Auto',
      lastStatus: 'failed',
      runtimeReady: true,
      runs: [
        { id: 'tr-1842', label: 'import worker suite', status: 'failed', age: '6m' },
        { id: 'tr-1841', label: 'api unit', status: 'passed', age: '1h' },
        { id: 'tr-1840', label: 'web e2e smoke', status: 'passed', age: '3h' },
        { id: 'tr-1839', label: 'quantity edge cases', status: 'failed', age: '3h' },
        { id: 'tr-1838', label: 'search index boost', status: 'passed', age: '5h' },
        { id: 'tr-1837', label: 'docker publish dry-run', status: 'passed', age: '8h' },
        { id: 'tr-1836', label: 'source conflict merge', status: 'failed', age: '9h' },
        { id: 'tr-1835', label: 'agents handoff contract', status: 'passed', age: '12h' },
        { id: 'tr-1834', label: 'artifacts gate matrix', status: 'passed', age: '1d' },
        { id: 'tr-1833', label: 'panel width 220 stress', status: 'failed', age: '1d' },
        { id: 'tr-1832', label: 'sprout menu a11y', status: 'passed', age: '2d' },
        { id: 'tr-1831', label: 'theme token parity', status: 'passed', age: '2d' },
        { id: 'tr-1830', label: 'actions blocked paths', status: 'passed', age: '3d' },
        { id: 'tr-1829', label: 'full regression nightly', status: 'failed', age: '3d' }
      ],
      failures: [
        { test: 'parse_quantity_mixed_fraction', file: 'normalize.rs:58' },
        { test: 'servings_ratio_scales_qty', file: 'servings.rs:240' },
        { test: 'elide_long_path_at_220', file: 'search_hit_row.rs:61' },
        { test: 'fleet_row_image_tag_wrap', file: 'docker_fleet.rs:118' },
        { test: 'conflict_banner_with_3_paths', file: 'source_radar.rs:44' },
        { test: 'replace_preview_multi_file', file: 'replace_studio.rs:91' },
        { test: 'sticky_rail_under_scroll', file: 'panel_chrome.rs:33' },
        { test: 'nightly_full_regression_timeout', file: 'runner.rs:502' }
      ],
      artifacts: [
        'junit.xml', 'failure-shot.png', 'console.log', 'trace.json',
        'coverage.lcov', 'perf-budget.json', 'a11y-report.html'
      ]
    },
    agents: {
      active: [
        { name: 'Planner', parent: 'Goal #482', status: 'running' },
        { name: 'Researcher', parent: 'Planner', status: 'running' },
        { name: 'Coder', parent: 'Planner', status: 'waiting' },
        { name: 'Tester', parent: 'Coder', status: 'waiting' },
        { name: 'Reviewer', parent: 'Coder', status: 'idle' },
        { name: 'Docs', parent: 'Reviewer', status: 'idle' },
        { name: 'Docker Ops', parent: 'Goal #482', status: 'running' },
        { name: 'Release Captain', parent: 'Docker Ops', status: 'waiting' }
      ],
      available: [
        { name: 'Researcher', caps: 'web · citations · deep' },
        { name: 'Tester', caps: 'ATS runner · junit' },
        { name: 'Docs', caps: 'markdown · PR · ADR' },
        { name: 'Docker Ops', caps: 'compose · publish · unraid' },
        { name: 'Perf', caps: 'budget · flamegraph' },
        { name: 'Security', caps: 'deps · secrets scan' },
        { name: 'A11y', caps: 'axe · keyboard' },
        { name: 'Indexer', caps: 'tantivy · boosts' },
        { name: 'Designer', caps: 'tokens · density' },
        { name: 'Migrator', caps: 'sql · backfill' }
      ]
    },
    artifacts: {
      types: ARTIFACT_TYPES.slice(),
      rows: [
        { id: 'art-901', type: 'diff', title: 'recipes/servings.rs quantity scale fix', fresh: '4m', health: 'ok' },
        { id: 'art-902', type: 'cost_usage', title: 'Goal #482 usage · Planner+Coder+Docker Ops', fresh: '4m', health: 'ok' },
        { id: 'art-903', type: 'screenshot', title: 'E2E failure · QuantityInput overflow at 220px', fresh: '6m', health: 'warn' },
        { id: 'art-904', type: 'trace', title: 'import worker DAP · parse_quantity', fresh: '12m', health: 'ok' },
        { id: 'art-905', type: 'lineage', title: 'Planner → Researcher → Coder → Reviewer', fresh: '14m', health: 'ok' },
        { id: 'art-906', type: 'plan', title: 'Deep Plan pack · side-panel crowding stress', fresh: '1h', health: 'ok' },
        { id: 'art-907', type: 'test', title: 'junit import suite · 8 failures', fresh: '6m', health: 'err' },
        { id: 'art-908', type: 'hitl', title: 'Permission: docker.sock · publish unraid', fresh: '2h', health: 'warn' },
        { id: 'art-909', type: 'evidence', title: 'Browser evidence pack (gated · release)', fresh: '3h', health: 'blocked' },
        { id: 'art-910', type: 'doc', title: 'ADR 0014 quantity canonical form', fresh: '5h', health: 'ok' },
        { id: 'art-911', type: 'restore_point', title: 'pre-migrate quantity columns', fresh: '8h', health: 'ok' },
        { id: 'art-912', type: 'browser_recording', title: 'Lab studio panel switch rehearsal', fresh: '9h', health: 'ok' },
        { id: 'art-913', type: 'context', title: 'Crowded fixture pack rationale', fresh: '10h', health: 'ok' },
        { id: 'art-914', type: 'failed_attempt', title: 'Replace studio hard-cut motion (retired)', fresh: '11h', health: 'err' },
        { id: 'art-915', type: 'before_after', title: 'Search hit rail · sparse vs crowded', fresh: '12h', health: 'ok' },
        { id: 'art-916', type: 'next_steps', title: 'Promote winner → Slint panel parts', fresh: '1d', health: 'ok' },
        { id: 'art-917', type: 'api_web_call', title: 'ghcr.io manifest list · tastebook-api', fresh: '1d', health: 'ok' },
        { id: 'art-918', type: 'version', title: 'pm-index 0.4.2-tantivy', fresh: '1d', health: 'ok' },
        { id: 'art-919', type: 'investigation', title: 'Why fleet labels clip at 220px', fresh: '2d', health: 'warn' },
        { id: 'art-920', type: 'diff', title: 'docker fleet long image tag elision', fresh: '2d', health: 'ok' },
        { id: 'art-921', type: 'screenshot', title: 'Source conflict radar · 3 UU paths', fresh: '2d', health: 'warn' },
        { id: 'art-922', type: 'test', title: 'panel width matrix 220/260/420', fresh: '3d', health: 'ok' },
        { id: 'art-923', type: 'cost_usage', title: 'Nightly E2E model spend', fresh: '3d', health: 'ok' },
        { id: 'art-924', type: 'hitl', title: 'Env approval · deploy production', fresh: '3d', health: 'blocked' },
        { id: 'art-925', type: 'trace', title: 'sticky rail scroll interaction', fresh: '4d', health: 'ok' },
        { id: 'art-926', type: 'plan', title: 'Demo density stress plan', fresh: '4d', health: 'ok' },
        { id: 'art-927', type: 'evidence', title: 'Audit runner crowded iframe pass', fresh: '5d', health: 'ok' },
        { id: 'art-928', type: 'lineage', title: 'Goal #482 full agent graph dump', fresh: '5d', health: 'ok' }
      ]
    }
  };

  function clonePack(pack) {
    return JSON.parse(JSON.stringify(pack));
  }

  function searchStats(hits) {
    hits = hits || [];
    var lines = 0;
    hits.forEach(function (f) { lines += (f.lines && f.lines.length) || f.count || 0; });
    return { files: hits.length, hits: lines };
  }

  function changeCount(src) {
    src = src || {};
    return (src.staged || []).length + (src.unstaged || []).length +
      (src.untracked || []).length + (src.conflicts || []).length;
  }

  var SPData = {
    themes: themes,
    themeLabels: themeLabels,
    shells: shells,
    panels: panels,
    packs: { comfortable: comfortable, crowded: crowded },
    density: 'crowded',
    search: null,
    source: null,
    actions: null,
    docker: null,
    tests: null,
    agents: null,
    artifacts: null,

    applyPack: function (mode) {
      if (mode !== 'comfortable' && mode !== 'crowded') mode = 'crowded';
      var pack = clonePack(this.packs[mode]);
      this.density = mode;
      this.search = pack.search;
      this.source = pack.source;
      this.actions = pack.actions;
      this.docker = pack.docker;
      this.tests = pack.tests;
      this.agents = pack.agents;
      this.artifacts = pack.artifacts;
      return mode;
    },

    setDensity: function (mode) {
      var applied = this.applyPack(mode);
      try {
        document.body.setAttribute('data-density', applied);
      } catch (e) { /* SSR / early */ }
      try {
        localStorage.setItem('pm.sidePanelProto.density', applied);
      } catch (e2) { /* private */ }
      try {
        document.dispatchEvent(new CustomEvent('sp-density', { detail: { density: applied } }));
      } catch (e3) { /* old browsers */ }
      return applied;
    },

    bootDensity: function () {
      var mode = 'crowded';
      try {
        var stored = localStorage.getItem('pm.sidePanelProto.density');
        if (stored === 'comfortable' || stored === 'crowded') mode = stored;
      } catch (e) { /* */ }
      return this.setDensity(mode);
    },

    searchStats: function () {
      return searchStats(this.search && this.search.hits);
    },

    changeCount: function () {
      return changeCount(this.source);
    }
  };

  SPData.applyPack('crowded');
  global.SPData = SPData;
})(window);
