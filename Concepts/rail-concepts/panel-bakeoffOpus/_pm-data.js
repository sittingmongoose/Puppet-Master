/* PANEL BAKEOFF — shared fixtures
   =====================================================================
   EVERY version renders from this file. That is the whole point: if two
   versions showed different content you would be comparing content, not
   design.

   TWO TESTS LIVE HERE, AND THEY ARE NOT THE SAME TEST.

   VOLUME asks whether a design FITS. VARIETY asks whether it WORKS.
   A design that survives five rows tells you nothing about a design that
   must survive forty, so this fixture was first grown to production
   volume. That worked: it exposed layout failures the thin data hid.

   But it exposed nothing else, because every row was NOMINAL. Every
   artifact had a title. Every blocked agent had elapsed '--'. There was
   exactly one redaction state and it was the clean one. A panel can pass
   a volume test by rendering forty copies of the easy case.

   The feature audit measured the cost: of 15 blind spots in
   research/AUDIT-SUMMARY.md, NINE were fixture-blocked. Kit rule 8 says
   all content comes from this file, so a version author who scored
   "absent" was obeying the rules -- the data simply never posed the
   question. A gate cannot be judged on a happy path. A status vocabulary
   cannot be judged with one token per shape. An identity fallback chain
   cannot be judged when every row already has a title.

   So the fixture now carries ADVERSARIAL STATE VARIETY alongside volume:
   not more rows, more KINDS of row. Failure states, absent fields,
   lifecycle tokens the spec reserves, blocked families with more than one
   member, identities that must be computed rather than read. Sections
   marked STATE VARIETY below are that layer. They are ADDITIONS -- every
   pre-existing row and key survives unchanged, so the previous audit
   stays comparable and a version that ignores the new fields renders
   exactly what it rendered before.

   Volume tests whether a design fits. Variety tests whether it works.

   THE VOLUME LAYER. Every collection is sized to a real working day on
   the demo project, not to a screenshot:

     search      48 matches across 14 files (2 files carry 8+ hits)
     source      9 staged / 7 unstaged, 12 worktrees, 14 commits,
                 12 branches, 3 stashes
     actions     26 runs, 8 workflows, 9 secrets, 4 pinned
     docker      24 containers, 16 images, 10 compose services,
                 4 registries, 5 publish stages, 5 hosts, 4 scenarios
     tests       16 runs, 9 failures, 11 artifacts, 7 capabilities
     agents      15 active, 13 completed, 16 available
     artifacts   47 rows across 5 families, covering all 19 runtime
                 artifact kinds that ship a schema
     files       45 tree nodes, 4 levels deep

   The strings are deliberately ADVERSARIAL. They are drawn from the demo
   project the concept already ships ("tastebook") but sized to the worst
   realistic case, because a fixture that always fits proves nothing. Each
   entry carries the character count that matters, so a version author can
   reason about the 240px band (~224px usable, ~30-36 characters at 11px)
   without measuring. The counts are machine-checked against the strings
   they annotate; if you change a string, recount it.

   Advertised counts are REAL counts. families says 38 because there are
   38 rows. subviews says 16/24 because 16 of the 24 containers are
   running. counts.commits says 14 because history has 14 entries. If you
   add a row, fix the count in the same edit.

   Collections long enough to page carry a paging block (shown, total,
   pageSize, initialWindow) so a version can honestly render "showing 24
   of 137" and exercise its load-older affordance.

   Every changed file carries `add` / `del` line counts. They were missing in
   the first pass, which silently made a whole design direction (a diff-stat
   magnitude rail, where 16 files scan as a shape rather than as text)
   unbuildable -- an author would have had to invent 32 numbers. Churn is
   correlated with the change code: a delete is all removal, an add all
   insertion, a rename mostly moves.

   THE VARIETY LAYER, and the rule that governs it. Optional means
   OPTIONAL: a version that never reads a new field must render byte for
   byte what it rendered before. So the variety layer is expressed three
   ways, in descending order of preference:

     1. New KEYS on existing objects (source.repo, docker.auth,
        search.records). Invisible until read.
     2. New FIELDS on existing rows (retention, lifecycle, severity).
        Invisible until read.
     3. New ROWS carrying states no existing row carries. Visible to
        everyone -- which is the point, because a state nobody renders is
        a state nobody has designed for. Where a version reads a fixed
        index (agents.active[2], artifacts.rows[0], docker.containers[3])
        the new rows are APPENDED so those indices never move.

   Two values were changed rather than added, both deliberately, both
   named here so no one has to diff to find them: the two blocked agents
   carried elapsed '--', which made a 30-second approval wait identical to
   a 3-hour one (FinalGUISpec.md:L3743), and they now carry real ages.

   Rules for anyone editing this file:
     - No emoji. Inline SVG only. (Project-wide hard rule.)
     - No backtick strings and no dollar-brace sequences anywhere.
     - Keep the long entries long. If a design only survives after you
       shorten a fixture, the design does not survive.
     - Every status value must come from PM_DATA.status, so the status
       vocabulary stays consistent across all seven panels.
     - Do not rename or remove a key. Fifteen version files destructure
       this data. Add fields, add rows.
     - Advertised counts are real counts. Add a row, fix the count in the
       same edit.
   ===================================================================== */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- status
     One vocabulary, all seven panels. Four non-color channels so the surface
     stays non-color-dependent (FinalGUISpec.md:1237): glyph SHAPE, rail DASH
     pattern, accessible label, and the status word itself at >=360px. */
  var status = {
    ok:         { word: 'ok',         glyph: 'check',    rail: 'solid',  tone: 'ok',    label: 'Succeeded' },
    running:    { word: 'running',    glyph: 'arc',      rail: 'solid',  tone: 'run',   label: 'Running' },
    queued:     { word: 'queued',     glyph: 'circle',   rail: 'solid',  tone: 'idle',  label: 'Queued' },
    attention:  { word: 'attention',  glyph: 'warn',     rail: 'solid',  tone: 'warn',  label: 'Needs attention' },
    blocked:    { word: 'blocked',    glyph: 'bar',      rail: 'dashed', tone: 'warn',  label: 'Blocked' },
    failed:     { word: 'failed',     glyph: 'x',        rail: 'solid',  tone: 'err',   label: 'Failed' },
    stale:      { word: 'stale',      glyph: 'clock',    rail: 'dotted', tone: 'idle',  label: 'Stale' },
    disabled:   { word: 'disabled',   glyph: 'square',   rail: 'solid',  tone: 'off',   label: 'Unavailable' },
    prohibited: { word: 'prohibited', glyph: 'slash',    rail: 'dotted', tone: 'err',   label: 'Prohibited by policy' },

    /* STATE VARIETY -- the vocabulary is EXTENDED here, from 9 tokens to 11,
       and this is the one change in this file that is not purely additive in
       effect. Read this before using either token.

       Two specs name run statuses the nine could not express:
         Automated_Testing_System.md:L2221-L2229 -- queued, running, passed,
           failed, CANCELLED, blocked, INCONCLUSIVE  ("exact, do not paraphrase")
         GitHub_Integration.md run vocabulary     -- queued, running, success,
           failed, CANCELLED, blocked, attention_required

       Before this edit the single cancelled run in the fixture was encoded as
       status 'stale' plus detail 'cancelled by jared', and inconclusive did not
       exist at all. Both are semantically wrong and both were inherited by six
       independent version authors, which is how a paraphrase becomes a finding.
       Mapping them onto 'failed' would be worse: blocked and inconclusive must
       never collapse into a red chip (audit-tests.md R11) -- blocked routes to
       an authority action, inconclusive routes to the receipt, and cancelled
       destroys no receipts at all.

       KNOWN LIMIT, do not discover this the hard way. _pm-kit.js:74-78 keeps
       its OWN copy of the glyph and dash maps, keyed by the original nine:

         K.statusMark  ->  K.icon(GLYPH[token] || 'circle')   and   DASH[token]

       So a version that calls K.statusMark('cancelled') gets a SOLID CIRCLE in
       the 'off' tone -- the same shape queued gets. Three of the four
       non-color channels collapse, which is exactly the FinalGUISpec.md:1237
       failure this vocabulary exists to prevent. A version that reads
       D.status[token].glyph and .rail -- the documented contract, and what the
       four-channel comment above promises -- gets the right shape and dash.
       Closing this properly needs a two-line edit to the GLYPH and DASH maps
       in _pm-kit.js. That file was out of scope for this pass. */
    cancelled:    { word: 'cancelled',    glyph: 'slash', rail: 'dashed', tone: 'off',
                    label: 'Cancelled' },
    inconclusive: { word: 'inconclusive', glyph: 'info',  rail: 'dotted', tone: 'idle',
                    label: 'Inconclusive' }
  };

  /* Which spec token each panel's rows actually mean. The shared vocabulary
     above is the RENDERING contract; these are the SPEC contracts, and they do
     not agree with each other. A row carries specStatus when its panel's spec
     names a token the shared map spells differently -- 'passed' renders as
     'ok', 'success' renders as 'ok', 'attention_required' renders as
     'attention'. A version that wants to print the exact spec word instead of
     the rendering word reads specStatus; one that does not, does not. */
  var statusSpec = {
    tests:   ['queued', 'running', 'passed', 'failed', 'cancelled', 'blocked', 'inconclusive'],
    actions: ['queued', 'running', 'success', 'failed', 'cancelled', 'blocked', 'attention_required'],
    agents:  ['running', 'queued', 'blocked', 'remediation', 'completed']
  };

  /* ------------------------------------------------------------- the project
     Shared context every panel's header strip can draw on. */
  var project = {
    name: 'tastebook',
    branch: 'main',
    account: 'jared-dev',
    runtime: 'docker',
    context: 'default',
    ahead: 2,
    behind: 0
  };

  /* ------------------------------------------------------------------ search
     48 matches, 14 files. Two files (the Svelte editor at 9 hits and the
     scaling module at 8) exist to force a per-file collapse decision, and
     the vendored minified bundle exists because one 190-character match
     line will destroy any design that does not window the match. */
  var search = {
    query: 'quantity',
    replace: '',
    flags: { regex: false, caseSensitive: false, wholeWord: false },
    scope: 'all',
    scopeOptions: [
      { value: 'all',    label: 'All files' },
      { value: 'open',   label: 'Open files' },
      { value: 'src',    label: 'src/ only' },
      { value: 'web',    label: 'web/ only' },
      { value: 'custom', label: 'Custom glob...' }
    ],
    index: {
      state: 'ok',                 // ok | stale | building | unindexed | fallback | disabled
      engine: 'tantivy',
      documents: 1284,
      builtAt: 'commit abc12ef, 4m ago',
      largeFileThresholdMb: 10,
      excludeGenerated: true,
      followSymlinks: false,
      /* STATE VARIETY -- blind spot 13. Three versions can turn indexing off
         and none says what happens to a build already in flight. Turning
         indexing OFF mid-build cancels through a CancellationToken, discards
         the partial generation, and a re-enable starts a FRESH build; it does
         not resume (FinalGUISpec.md:L699). That is a distinct terminal state
         with its own copy, not a variation on 'unindexed'. lastBuild is where
         it lives, so the live state above stays 'ok' and every existing
         version renders unchanged. */
      lastBuild: {
        state: 'cancelled',
        line: 'Index build cancelled',
        detail: 'Cancelled at 41 percent by turning indexing off. Partial generation discarded.',
        at: '2d', partialDiscarded: true, resumable: false,
        actions: [{ id: 'search.index.rebuild', label: 'Start a fresh build' }]
      },
      /* The full strip vocabulary, so a version can map all six rather than
         guessing which tokens exist (FinalGUISpec.md:L699, :L6511). */
      states: [
        { id: 'indexed',    line: 'Indexed',                annotateRows: false },
        { id: 'stale',      line: 'Stale - refreshing',     annotateRows: false },
        { id: 'unindexed',  line: 'Unindexed',              annotateRows: true  },
        { id: 'fallback',   line: 'Fallback - raw ripgrep', annotateRows: true  },
        { id: 'disabled',   line: 'Indexing off - grep only', annotateRows: true },
        { id: 'cancelled',  line: 'Index build cancelled',  annotateRows: true  }
      ]
    },
    /* STATE VARIETY -- blind spot 13, second half. All seven versions expose
       'Evict remote cache' and not one exposes whether remote acceleration is
       even available. GitHub_Integration.md:L1600 and :L1630-L1631 make
       no-silent-local-fallback mandatory: remote acceleration is NOT a
       fallback path, so when it is unavailable the panel must SAY SO rather
       than quietly searching locally and returning a plausible answer. The
       sentence is the requirement; the boolean alone would not satisfy it. */
    remote: {
      available: false,
      state: 'unavailable',
      reason: 'remote_acceleration_unavailable',
      sentence: 'Remote search acceleration is unavailable. These results are local only.',
      silentFallback: false,
      host: 'ssh://build-01.platyr.internal',
      checkedAt: '2m',
      actions: [{ id: 'search.remote.retry', label: 'Retry remote' },
                { id: 'search.remote.settings', label: 'Remote search settings...' }]
    },
    summary: { matches: 48, files: 14 },
    paging: { shown: 48, total: 132, pageSize: 48, initialWindow: 24 },
    /* STATE VARIETY -- blind spot 13, first half. F3-047
       (FinalGUISpec.md:L703, :L6524-L6571) requires Orchestrator-owned hits to
       expose object/record identity and a /record ROUTE TARGET rather than a
       bare text hit. Zero of seven do, because search.files carries only
       file/line/pre/hit/post and there was nothing else to render.

       These rows are deliberately NOT files. They have no path, no line
       number and no pre/hit/post triple, so a design whose row grammar is
       "path, then line, then windowed match" has nothing to put in any of its
       three slots. research/search.md:149 records that F3-047 ships no row
       spec at all -- no field list, no badge vocabulary, no statement of how
       such a row differs from a file match at 224px. That unanswered question
       is the point of these five rows.

       recordSummary is separate from summary on purpose: these are not part
       of the 48 text matches and must not be added to them. */
    recordSummary: { records: 5, kinds: 5 },
    records: [
      { objectKind: 'run',           id: 'run-47',            chars: 6,
        label: 'Orchestrator run #47', labelChars: 20,
        route: '/record/run/47',      routeChars: 14,
        owner: 'Orchestrator', field: 'goal', when: '9m',
        excerpt: 'normalise every ingredient quantity to a canonical metric base unit' },
      { objectKind: 'node',          id: 'n-19',              chars: 4,
        label: 'Node n-19 - parse_quantity remediation', labelChars: 38,
        route: '/record/run/47/node/n-19', routeChars: 24,
        owner: 'Orchestrator run #47', field: 'summary', when: '22m',
        excerpt: 'mixed fractions must not collapse: "1 1/2 cup" is 1.5, never 11/2' },
      { objectKind: 'investigation', id: 'inv-import-7x',     chars: 13,
        label: 'Mixed-fraction quantity collapse', labelChars: 32,
        route: '/record/investigation/inv-import-7x', routeChars: 35,
        owner: 'Import worker debugging', field: 'target_summary', when: '1h',
        excerpt: 'the quantity field survives import but the unit is dropped on retry' },
      { objectKind: 'thread',        id: 'thr-scaling-round', chars: 17,
        label: 'Servings scaling rounding investigation', labelChars: 39,
        route: '/record/thread/thr-scaling-round', routeChars: 32,
        owner: 'Manual', field: 'message', when: '4h',
        excerpt: 'a 1/3 cup quantity collapses to 0 under half-up rounding at 12x' },
      { objectKind: 'plan_step',     id: 'plan-v3-step-6',    chars: 14,
        label: 'Step 6 - backfill legacy quantity rows', labelChars: 38,
        route: '/record/plan/quantity-remediation-v3/step/6', routeChars: 43,
        owner: 'Orchestrator run #47', field: 'acceptance', when: '30m',
        excerpt: 'every legacy row has a non-null quantity and a resolved unit' }
    ],
    /* Match lines are routinely wider than the panel. That is the point. */
    files: [
      { path: 'src/services/import.rs', chars: 22, count: 5, hits: [
        { line: 41,  pre: 'fn parse_',        hit: 'quantity', post: '(raw: &str) -> Result<Qty, ParseError>' },
        { line: 58,  pre: '// mixed fractions: "1 1/2 cup" must not become ', hit: 'quantity', post: ' 11/2' },
        { line: 73,  pre: 'normalize_units(', hit: 'quantity', post: ', unit, locale.measurement_system())' },
        { line: 104, pre: 'let ',             hit: 'quantity', post: ' = raw.trim().replace(char::is_whitespace, " ");' },
        { line: 187, pre: 'return Err(ParseError::Ambiguous', hit: 'Quantity', post: ' { raw: raw.to_owned(), span });' }
      ] },
      { path: 'src/routes/recipes.rs', chars: 21, count: 4, hits: [
        { line: 112, pre: 'pub ',             hit: 'quantity', post: ': f32,' },
        { line: 240, pre: 'ingredient.',      hit: 'quantity', post: ' * servings_ratio.clamp(0.25, 12.0)' },
        { line: 318, pre: 'if row.',          hit: 'quantity', post: '.is_nan() { return Err(RecipeError::BadQuantity(row.id)); }' },
        { line: 402, pre: '.map(|i| i.',      hit: 'quantity', post: '.to_display_string(locale, precision_hint))' }
      ] },
      { path: 'web/src/lib/components/editor/IngredientQuantityEditor.svelte', chars: 61, count: 9, hits: [
        { line: 14,  pre: 'export let ',      hit: 'quantity', post: 'Step = 0.25;' },
        { line: 22,  pre: 'export let ',      hit: 'quantity', post: 'Locale: MeasurementSystem = "metric";' },
        { line: 57,  pre: 'function commit',  hit: 'Quantity', post: '(next: number, source: "input" | "stepper") {' },
        { line: 88,  pre: '<input bind:value={row.', hit: 'quantity', post: '} type="number" step={quantityStep} />' },
        { line: 131, pre: 'dispatch("change", { ', hit: 'quantity', post: ': next, unit: row.unit, dirty: true });' },
        { line: 166, pre: '  aria-label={"Ingredient " + row.name + " ', hit: 'quantity', post: '"}' },
        { line: 203, pre: 'const displayed = format', hit: 'Quantity', post: '(row.quantity, row.unit, quantityLocale);' },
        { line: 244, pre: '{#if invalid',     hit: 'Quantity', post: '}<span class="err">Enter a number greater than zero</span>{/if}' },
        { line: 281, pre: '.editor-row .',    hit: 'quantity', post: '-cell { grid-column: 2; min-width: 4.5rem; text-align: right; }' }
      ] },
      { path: 'src/services/scaling.rs', chars: 23, count: 8, hits: [
        { line: 27,  pre: 'pub fn scale_',    hit: 'quantity', post: '(base: Qty, ratio: f64, rounding: RoundingMode) -> Qty {' },
        { line: 44,  pre: 'let scaled = base.', hit: 'quantity', post: ' * ratio;' },
        { line: 61,  pre: '// half-up rounding keeps a 1/3 cup ', hit: 'quantity', post: ' from collapsing to 0' },
        { line: 89,  pre: 'debug_assert!(scaled.', hit: 'quantity', post: ' >= 0.0, "negative scale result: {:?}", scaled);' },
        { line: 118, pre: 'match rounding { RoundingMode::Culinary => snap_', hit: 'quantity', post: '(scaled),' },
        { line: 145, pre: 'fn snap_',         hit: 'quantity', post: '(q: Qty) -> Qty { q.round_to_nearest(CULINARY_STEPS) }' },
        { line: 190, pre: '/// Scaling a ',   hit: 'quantity', post: ' past 12x is rejected upstream, not clamped silently.' },
        { line: 233, pre: 'tracing::warn!(target = "scaling", ?base, ?ratio, "', hit: 'quantity', post: ' clamped at bound");' }
      ] },
      { path: 'src/models/ingredient.rs', chars: 24, count: 3, hits: [
        { line: 19,  pre: 'pub ',             hit: 'quantity', post: ': Quantity,' },
        { line: 64,  pre: 'impl From<RawIngredient> for ', hit: 'Quantity', post: ' { fn from(raw: RawIngredient) -> Self {' },
        { line: 97,  pre: '/// Canonical ',   hit: 'quantity', post: ' is stored in grams or millilitres, never in cups.' }
      ] },
      { path: 'web/src/lib/stores/recipeDraft.ts', chars: 33, count: 3, hits: [
        { line: 31,  pre: 'export const draft', hit: 'Quantity', post: ' = writable<number | null>(null);' },
        { line: 88,  pre: '  rows: rows.map((r) => ({ ...r, ', hit: 'quantity', post: ': clamp(r.quantity, 0, 9999) })),' },
        { line: 142, pre: 'if (!Number.isFinite(next.', hit: 'quantity', post: ')) return prev; // reject NaN from the stepper' }
      ] },
      /* Vendored + minified. One line, 190 characters of it. This row is the
         reason a design cannot simply print pre + hit + post. */
      { path: 'web/static/vendor/measurement-units.min.js', chars: 42, count: 2, vendored: true, hits: [
        { line: 1,   pre: '!function(e,t){"object"==typeof exports?module.exports=t():e.MU=t()}(this,function(){var n={cup:236.588,tbsp:14.7868,tsp:4.92892};function c(e,t){return e*n[t]}return{convert:c,parse', hit: 'Quantity', post: ':function(s){return parseFloat(String(s).replace(/[^0-9./]/g,""))||0}}});' },
        { line: 3,   pre: '//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lYXN1cmVtZW50LXVuaXRzLmpzIl0sIm5hbWVzIjpbInBhcnNl', hit: 'Quantity', post: 'Il0sIm1hcHBpbmdzIjoiQUFBQSJ9' }
      ] },
      { path: 'tests/import_fixtures/mixed_fractions.rs', chars: 40, count: 3, hits: [
        { line: 12,  pre: 'assert_eq!(parse_', hit: 'quantity', post: '("1 1/2").unwrap().value, 1.5);' },
        { line: 29,  pre: 'assert_eq!(parse_', hit: 'quantity', post: '("2 3/4 cups").unwrap().unit, Unit::Cup);' },
        { line: 55,  pre: '#[test] fn rejects_ambiguous_', hit: 'quantity', post: '_without_separator() {' }
      ] },
      { path: 'src/services/units.rs', chars: 21, count: 3, hits: [
        { line: 33,  pre: 'pub fn normalize_units(', hit: 'quantity', post: ': f64, unit: Unit, system: MeasurementSystem) -> Qty {' },
        { line: 71,  pre: '    Unit::Cup => ',  hit: 'quantity', post: ' * 236.588, // millilitres, US legal cup' },
        { line: 118, pre: '// Imperial to metric is lossy; round only at display time, never on ', hit: 'quantity', post: '.' }
      ] },
      { path: 'web/src/routes/recipes/[slug]/+page.server.ts', chars: 45, count: 2, hits: [
        { line: 46,  pre: 'const rows = data.ingredients.filter((i) => i.', hit: 'quantity', post: ' != null && i.quantity > 0);' },
        { line: 93,  pre: 'return { recipe, rows, scaled: scaleAll(rows, servings, "', hit: 'quantity', post: '-first") };' }
      ] },
      { path: 'src/bin/backfill_quantities.rs', chars: 30, count: 2, hits: [
        { line: 24,  pre: 'let stmt = "UPDATE ingredients SET ', hit: 'quantity', post: ' = $1 WHERE recipe_id = $2 AND unit IS NULL";' },
        { line: 88,  pre: 'info!("backfilled {} rows in {:?}", n, t0.elapsed()); // legacy ', hit: 'quantity', post: ' rows only' }
      ] },
      { path: 'docs/import-normalization.md', chars: 28, count: 2, hits: [
        { line: 17,  pre: 'A mixed fraction such as "1 1/2 cup" MUST normalise to a single ', hit: 'quantity', post: ' of 1.5.' },
        { line: 64,  pre: '| Field | Type | Notes | ... | "', hit: 'quantity', post: '" | f64 | canonical, metric base unit |' }
      ] },
      { path: 'web/src/lib/components/RecipeCard.svelte', chars: 40, count: 1, hits: [
        { line: 52,  pre: '  {row.', hit: 'quantity', post: '} {row.unit} <span class="name">{row.name}</span>' }
      ] },
      { path: 'migrations/0002_ratings.sql', chars: 27, count: 1, hits: [
        { line: 8,   pre: 'ALTER TABLE ingredients ALTER COLUMN ', hit: 'quantity', post: ' TYPE double precision USING quantity::double precision;' }
      ] }
    ]
  };

  /* ---------------------------------------------------------- source control
     9 staged / 7 unstaged with every status code the app can render: M, A,
     D, R (rename, which carries a second path), ? (untracked) and U
     (conflict, which must never be silently grouped with modified). */
  var source = {
    branches: ['main', 'orch/lane-a-core', 'orch/lane-b-api', 'orch/lane-c-web', 'orch/lane-d-infra',
               'thread/import-fixes', 'thread/scaling-rounding', 'spike/r2-storage',
               'spike/meilisearch-swap', 'release/v1.2', 'hotfix/exif-strip-panic',
               'dependabot/cargo/tokio-1.39.2'],
    counts: { staged: 9, unstaged: 7, worktrees: 12, commits: 14, branches: 12, stash: 3,
              conflicts: 2, untracked: 2 },
    paging: { commits: { shown: 14, total: 1842, pageSize: 14, initialWindow: 7 },
              branches: { shown: 12, total: 34, pageSize: 12, initialWindow: 6 } },
    /* STATE VARIETY -- blind spot 3, and it is the one blind spot in the whole
       audit caused by design convergence rather than by missing data. Ten of
       ten Source versions render branch and worktree. None renders the REPO.
       project.name has been sitting in this file unread since the first pass.

       GI-005's negative constraint (GitHub_Integration.md:L397) is that the
       model "never assumes a single repo context" -- so a header that shows
       only a branch is showing the shape the spec forbids. Giving repo its own
       object rather than leaning on project.name makes the identity renderable
       at every width and carries the GI-021 lifecycle with it, because a repo
       that is archived or historical_only disables mutation deterministically
       and the branch line has nowhere to say so.

       lifecycle here is 'active'. actions.repository below carries the same
       vocabulary in a non-active state, so a version can render both. */
    repo: {
      name: 'tastebook', chars: 9,
      owner: 'jared-dev', ownerChars: 9,
      nameWithOwner: 'jared-dev/tastebook', nwoChars: 19,
      host: 'github.com',
      remote: 'git@github.com:jared-dev/tastebook.git', remoteChars: 38,
      lifecycle: 'active',
      defaultBranch: 'main',
      visibility: 'private',
      /* More than one repo is resolvable in this workspace; the panel must not
         imply the branch line identifies it. */
      siblingCount: 2,
      siblings: ['jared-dev/tastebook-unraid-templates', 'jared-dev/platyr-shared']
    },
    /* STATE VARIETY -- blind spot 10. The two U-coded files below live in the
       unstaged list, and they still do; nothing was moved. But a conflicted
       file that lands in the unstaged group is unreachable from
       Open Conflict Assistant, open_merge_editor and mark_conflict_resolved,
       which is why vA's Source score carries a required addition rather than a
       gap. This is the group those commands attach to.

       WorktreeGitImprovement.md:L451: the resolver "must never auto-write a
       side". So sides carry their own line counts and neither is marked
       preferred -- a design that renders a one-click Take theirs from this
       data is rendering something the spec forbids, and now it can be seen
       doing it. resolved:false on both means the group has no happy path yet. */
    conflicts: [
      { path: 'web/src/lib/stores/recipeDraft.ts', chars: 33, code: 'U',
        conflict: 'both modified', kind: 'content',
        hunks: 3, resolved: false, markersRemaining: 3,
        sides: [
          { id: 'ours',   label: 'Ours - main',                 chars: 11, add: 62, del: 41 },
          { id: 'theirs', label: 'Theirs - thread/scaling-rounding', chars: 32, add: 50, del: 43 }
        ],
        base: 'a1b2c3d', actions: ['open_merge_editor', 'resolve_conflict_side',
                                   'conflict_apply_resolution', 'mark_conflict_resolved'] },
      { path: 'docker-compose.override.yml', chars: 27, code: 'U',
        conflict: 'both added', kind: 'add-add',
        hunks: 1, resolved: false, markersRemaining: 1,
        sides: [
          { id: 'ours',   label: 'Ours - main',                  chars: 11, add: 21, del: 0 },
          { id: 'theirs', label: 'Theirs - orch/lane-d-infra',   chars: 26, add: 34, del: 0 }
        ],
        base: null, actions: ['open_merge_editor', 'resolve_conflict_side',
                              'conflict_apply_resolution', 'mark_conflict_resolved'] }
    ],
    staged: [
      { path: 'src/routes/recipes.rs',                            chars: 21, code: 'M' , add: 93, del: 17 },
      { path: 'src/services/scaling.rs',                          chars: 23, code: 'M' , add: 113, del: 117 },
      { path: 'web/src/lib/components/RecipeCard.svelte',         chars: 40, code: 'A' , add: 176, del: 0 },
      { path: 'web/src/lib/components/editor/IngredientQuantityEditor.svelte', chars: 61, code: 'R',
        from: 'web/src/lib/components/IngredientEditor.svelte',   fromChars: 46 , add: 12, del: 10 },
      { path: 'web/src/lib/components/ServingsScaler.svelte',     chars: 44, code: 'A' , add: 161, del: 0 },
      { path: 'src/bin/backfill_quantities.rs',                   chars: 30, code: 'A' , add: 128, del: 0 },
      { path: 'src/services/legacy_qty.rs',                       chars: 26, code: 'D' , add: 0, del: 240 },
      { path: 'migrations/0003_quantity_precision.sql',           chars: 38, code: 'A' , add: 187, del: 0 },
      { path: 'docs/import-normalization.md',                     chars: 28, code: 'M' , add: 13, del: 108 }
    ],
    unstaged: [
      { path: 'src/services/image.rs',                            chars: 21, code: 'M' , add: 171, del: 7 },
      { path: 'src/services/import.rs',                           chars: 22, code: 'M' , add: 29, del: 1 },
      { path: 'Cargo.lock',                                       chars: 10, code: 'M' , add: 70, del: 124 },
      { path: 'web/src/lib/stores/recipeDraft.ts',                chars: 33, code: 'U',
        conflict: 'both modified' , add: 112, del: 84 },
      { path: 'docker-compose.override.yml',                      chars: 27, code: 'U',
        conflict: 'both added' , add: 21, del: 55 },
      { path: 'tests/import_fixtures/mixed_fractions_wide.rs',    chars: 45, code: '?' , add: 80, del: 0 },
      { path: '.worktrees/lane-d-infra/scratch-notes.md',         chars: 40, code: '?' , add: 62, del: 0 }
    ],
    /* W-014 ownership presentation and GI-020 responsive rows are the crux.
       Eight worktrees is the point where "which one am I in" stops being
       obvious from a list and starts needing a design. */
    /* STATE VARIETY on every row below: lifecycle, age, and the W-014 identity
       triple (laneId / nodeId / attemptId), plus the four flags at
       WorktreeGitImprovement.md:L439 that are supposed to DRIVE action
       enablement rather than decorate a row: locked, prunable, dirty,
       repairable. Before this pass lock state existed but prunable and
       repairable did not, so no version could disable Prune correctly and
       Recover appeared exactly once in the whole versions directory -- in a
       comment.

       lifecycle uses the RESERVED WORDS at WorktreeGitImprovement.md:L297:
       reserved | active | blocked_preserved | released | orphaned. These are
       reserved because each has both a Git-native and a Puppet-Master-specific
       meaning; they are not synonyms for the status pill and must not be
       paraphrased.

       KNOWN LIMIT, and a finding rather than an oversight. source.md 9.3 and
       audit-source.md 27 say blocked_preserved and orphaned must be PILL
       states, encoded in the status vocabulary itself rather than as an extra
       chip -- because a chip can be dropped at 240px and enablement cannot.
       The shared vocabulary in PM_DATA.status cannot express them: it is one
       vocabulary across seven panels and blocked_preserved is meaningless in
       Docker or Search. So lifecycle is its own field and every row also
       carries a status token that renders. A version that renders only the
       pill is losing information the spec says the pill must carry, and that
       gap is now visible in the data instead of hidden by its absence.

       age closes a smaller one: v0 prints 'main - age 2h' and the fixture had
       no age field, so v0 was fabricating it and nine of ten versions
       correctly declined to render it (audit section 5 item 6). Now it is real
       and declining to render it is a choice.

       Index 0 is the primary worktree several versions read directly.
       Append new worktrees below it, never above. */
    worktrees: [
      { branch: 'orch/lane-b-api',     chars: 15, kind: 'orch',   owner: 'Orchestrator lane-b API',
        path: '.worktrees/lane-b-api', base: 'main', dirty: false, ahead: 2, run: '#47',
        status: 'running', lockedBy: 'run #47', lockReason: 'worktree_owned_by_active_run',
        lifecycle: 'active', age: '3h', worktreeId: 'wt-lane-b-api', laneId: 'lane-b',
        nodeId: 'n-22', attemptId: 'att-3', locked: true, prunable: false, repairable: false },
      { branch: 'orch/lane-a-core',    chars: 16, kind: 'orch',   owner: 'Orchestrator lane-a core services',
        path: '.worktrees/lane-a-core', base: 'main', dirty: true, ahead: 7, run: '#47',
        status: 'running', lockedBy: 'run #47', lockReason: 'worktree_owned_by_active_run',
        lifecycle: 'active', age: '3h', worktreeId: 'wt-lane-a-core', laneId: 'lane-a',
        nodeId: 'n-19', attemptId: 'att-2', locked: true, prunable: false, repairable: false },
      { branch: 'orch/lane-c-web',     chars: 15, kind: 'orch',   owner: 'Orchestrator lane-c web client',
        path: '.worktrees/lane-c-web', base: 'main', dirty: true, ahead: 5, run: '#47',
        status: 'attention', lockedBy: 'run #47', lockReason: 'worktree_owned_by_active_run',
        lifecycle: 'active', age: '3h', worktreeId: 'wt-lane-c-web', laneId: 'lane-c',
        nodeId: 'n-24', attemptId: 'att-1', locked: true, prunable: false, repairable: false },
      { branch: 'orch/lane-d-infra',   chars: 17, kind: 'orch',   owner: 'Orchestrator lane-d infra',
        path: '.worktrees/lane-d-infra', base: 'main', dirty: true, ahead: 3, run: '#47',
        status: 'attention', lockedBy: null, lockReason: null,
        lifecycle: 'active', age: '2h', worktreeId: 'wt-lane-d-infra', laneId: 'lane-d',
        nodeId: 'n-27', attemptId: 'att-1', locked: false, prunable: false, repairable: false },
      { branch: 'thread/import-fixes', chars: 19, kind: 'thread', owner: 'Import worker debugging',
        path: '.worktrees/import-fixes', base: 'main', dirty: false, ahead: 2, run: null,
        status: 'ok', lockedBy: null, lockReason: null,
        lifecycle: 'active', age: '1d', worktreeId: 'wt-import-fixes', laneId: null,
        nodeId: null, attemptId: null, locked: false, prunable: true, repairable: false },
      { branch: 'thread/scaling-rounding', chars: 23, kind: 'thread', owner: 'Servings scaling rounding investigation',
        path: '.worktrees/scaling-rounding', base: 'main', dirty: true, ahead: 4, run: '#46',
        status: 'blocked', lockedBy: 'run #46', lockReason: 'worktree_locked_by_stopped_run',
        lifecycle: 'blocked_preserved', age: '2d', worktreeId: 'wt-scaling-rounding', laneId: null,
        nodeId: 'n-31', attemptId: 'att-4', locked: true, prunable: false, repairable: false,
        preservedReason: 'blocked_episode_preserved',
        preservedSentence: 'Kept for the blocked episode on run #46. Release it explicitly before pruning.' },
      { branch: 'spike/r2-storage',    chars: 16, kind: 'manual', owner: 'Manual',
        path: '.worktrees/r2-spike', base: 'main', dirty: false, ahead: 0, run: null,
        status: 'stale', lockedBy: null, lockReason: null,
        lifecycle: 'active', age: '3w', worktreeId: 'wt-r2-spike', laneId: null,
        nodeId: null, attemptId: null, locked: false, prunable: true, repairable: false },
      { branch: 'spike/meilisearch-swap', chars: 22, kind: 'manual', owner: 'Manual - search engine evaluation',
        path: '.worktrees/meilisearch-swap', base: 'release/v1.2', dirty: true, ahead: 1, run: null,
        status: 'stale', lockedBy: null, lockReason: null,
        lifecycle: 'active', age: '5w', worktreeId: 'wt-meilisearch-swap', laneId: null,
        nodeId: null, attemptId: null, locked: false, prunable: false, repairable: false },
      /* ---- STATE VARIETY: the four lifecycle states nothing rendered ------
         Each one changes which row actions are legal, which is the whole
         reason the vocabulary is reserved. UI_Command_Catalog.md:L730 and
         WorktreeGitImprovement.md:L224 forbid manual prune/remove/reuse while
         a worktree is active or blocked_preserved unless an override policy
         allows it AND RECORDS THE OVERRIDE -- so a design that greys out Prune
         is only half right; it also owes the override an audit trail. */
      { branch: 'orch/lane-e-search',  chars: 18, kind: 'orch',   owner: 'Orchestrator lane-e search',
        path: null, base: 'main', dirty: false, ahead: 0, run: '#47',
        status: 'queued', lockedBy: null, lockReason: null,
        lifecycle: 'reserved', age: '6m', worktreeId: 'wt-lane-e-search', laneId: 'lane-e',
        nodeId: 'n-33', attemptId: null, locked: false, prunable: false, repairable: false,
        reservedFor: 'run #47 lane-e',
        reservedSentence: 'Reserved for a queued lane. No checkout exists on disk yet.' },
      { branch: 'thread/exif-strip-panic', chars: 23, kind: 'thread', owner: 'EXIF strip panic investigation',
        path: '.worktrees/exif-strip-panic', base: 'main', dirty: true, ahead: 2, run: '#44',
        status: 'attention', lockedBy: null, lockReason: null,
        lifecycle: 'orphaned', age: '9d', worktreeId: 'wt-exif-strip-panic', laneId: null,
        nodeId: 'n-08', attemptId: 'att-1', locked: false, prunable: true, repairable: true,
        orphanReason: 'worktree_directory_missing',
        orphanSentence: 'The checkout is gone from disk. Lineage is still resolvable; recover or prune.' },
      { branch: 'thread/ratings-schema', chars: 21, kind: 'thread', owner: 'Ratings schema and migration 0002',
        path: '.worktrees/ratings-schema', base: 'main', dirty: false, ahead: 0, run: '#39',
        status: 'disabled', lockedBy: null, lockReason: null,
        lifecycle: 'released', age: '2w', worktreeId: 'wt-ratings-schema', laneId: null,
        nodeId: 'n-02', attemptId: 'att-1', locked: false, prunable: true, repairable: false,
        releasedAt: '2w', mergedInto: 'main',
        releasedSentence: 'Released after merge. The record is retained for lineage.' },
      { branch: 'orch/lane-f-media-thumbnailer', chars: 29, kind: 'orch', owner: 'Orchestrator lane-f media thumbnailer',
        path: '.worktrees/lane-f-media-thumbnailer', base: 'main', dirty: true, ahead: 6, run: '#46',
        status: 'blocked', lockedBy: 'safe point sp-11', lockReason: 'worktree_preserved_at_safe_point',
        lifecycle: 'blocked_preserved', age: '4d', worktreeId: 'wt-lane-f-media', laneId: 'lane-f',
        nodeId: 'n-11', attemptId: 'att-5', locked: true, prunable: false, repairable: true,
        preservedReason: 'safe_point_preserved',
        /* Crosswalk.md:L474 keeps 'safe point' and 'restore point' distinct.
           This one is a SAFE point. The restore point lives in artifacts. */
        preservedSentence: 'Preserved at safe point sp-11. Rebind or release it; do not start fresh.' }
    ],
    history: [
      { sha: 'abc12ef', subject: 'feat(search): tantivy index for recipe content', chars: 46, who: 'jared', when: '4m' },
      { sha: 'def34ab', subject: 'feat(ratings): schema + migration 0002', chars: 38, who: 'jared', when: '2h' },
      { sha: '9f0e1c2', subject: 'fix(import): reject mixed-fraction collapse', chars: 43, who: 'agent', when: '1d' },
      { sha: '4b7d3e8', subject: 'refactor(import): collapse unit normalisation into one locale-aware pass', chars: 72, who: 'agent', when: '1d' },
      { sha: 'a1b2c3d', subject: 'feat(scaling): culinary rounding mode for servings', chars: 50, who: 'jared', when: '2d' },
      { sha: '7e8f901', subject: 'chore(deps): bump tokio to 1.39.2', chars: 33, who: 'bot', when: '2d' },
      { sha: '2c3d4e5', subject: 'fix(web): stepper emits change on blur, not on every keypress', chars: 61, who: 'agent', when: '3d' },
      { sha: 'b5c6d7e', subject: 'test(import): fixtures for 1 1/2 cup and 2 3/4 cups', chars: 51, who: 'agent', when: '3d' },
      { sha: '0718293', subject: 'perf(search): cap large file indexing at 10 MB', chars: 46, who: 'jared', when: '4d' },
      { sha: 'f60a1c2', subject: 'feat(docker): unraid template publish workflow', chars: 46, who: 'jared', when: '5d' },
      { sha: '3e8f90a', subject: 'fix(media): strip EXIF before thumbnailing uploads', chars: 50, who: 'agent', when: '6d' },
      { sha: 'd4e5f60', subject: 'docs: rewrite import normalization guide', chars: 40, who: 'jared', when: '1w' },
      { sha: '8f90a1c', subject: 'revert: "feat(scaling): clamp ratio at 12x silently"', chars: 52, who: 'jared', when: '1w' },
      { sha: 'c6d7e8f', subject: 'chore(ci): split the workspace test job by feature matrix', chars: 57, who: 'jared', when: '1w' }
    ],
    branchList: [
      { name: 'main',                          chars: 4,  current: true,  ahead: 2, behind: 0 },
      { name: 'orch/lane-a-core',              chars: 16, current: false, ahead: 7, behind: 1 },
      { name: 'orch/lane-b-api',               chars: 15, current: false, ahead: 2, behind: 1 },
      { name: 'orch/lane-c-web',               chars: 15, current: false, ahead: 5, behind: 1 },
      { name: 'orch/lane-d-infra',             chars: 17, current: false, ahead: 3, behind: 1 },
      { name: 'thread/import-fixes',           chars: 19, current: false, ahead: 2, behind: 0 },
      { name: 'thread/scaling-rounding',       chars: 23, current: false, ahead: 4, behind: 2 },
      { name: 'spike/r2-storage',              chars: 16, current: false, ahead: 0, behind: 4 },
      { name: 'spike/meilisearch-swap',        chars: 22, current: false, ahead: 1, behind: 9 },
      { name: 'release/v1.2',                  chars: 12, current: false, ahead: 0, behind: 6 },
      { name: 'hotfix/exif-strip-panic',       chars: 23, current: false, ahead: 1, behind: 0 },
      { name: 'dependabot/cargo/tokio-1.39.2', chars: 29, current: false, ahead: 1, behind: 3 }
    ],
    stash: [
      { label: 'WIP on main: media uploader retry backoff', chars: 41, when: '3h' },
      { label: 'WIP on thread/scaling-rounding: half-even vs culinary rounding spike', chars: 68, when: '2d' },
      { label: 'On orch/lane-c-web: stepper aria-label experiment', chars: 49, when: '4d' }
    ],
    commitDraft: '',
    remote: { freshness: 'current', health: 'healthy', incoming: 0, outgoing: 2 }
  };

  /* -------------------------------------------------------------- gh actions
     26 runs across 8 workflows and 8 branches. Four carry triage blocks,
     because the panel must decide whether triage expands in place or opens
     a detail surface, and one run cannot answer that.

     STATE VARIETY in each triage block: changedFiles, changedCount and
     likelyNext. GitHub_Integration.md:L920 makes the failure triage capsule
     "changed files plus likely next action", and v0 renders both -- while all
     six Actions redesigns dropped them, because the fixture had only job, step
     and log lines and an author would have had to invent the rest. v0 was not
     better designed here; it was hard-coding two strings this file did not
     carry. Now it carries them, and whatever wins Actions no longer has to
     ship a triage capsule strictly less useful than the one already in
     PMConcept7. */
  var actions = {
    connection: {
      account: 'jared-dev',
      requested: 'jared-dev',
      effective: 'jared-dev',
      state: 'connected',
      scopes: ['repo', 'read:user', 'user:email'],
      missingScopes: ['workflow'],
      /* GI-017 blocked-state taxonomy: the code is rendered verbatim, never
         hidden behind a native title attribute. */
      blocked: {
        code: 'actions_missing_scope_runtime',
        sentence: 'Dispatch needs the workflow scope.',
        severity: 'blocked', retryable: true,
        allowedActionIds: ['github.reconnect', 'github.open_scopes'],
        actions: [{ id: 'github.reconnect', label: 'Reconnect' }]
      }
    },
    readiness: { branch: 'main', green: 6, of: 8, snapshot: 'webhook transport', age: '12s' },
    /* ---------------------------------------------- STATE VARIETY: blind spot 5
       The blocked banner is the largest element in this panel and it was the
       least stress-tested thing in the bakeoff. Before this pass the fixture
       carried TWO reason codes, both from the GI-017 family, both at 'blocked'
       severity, and both with sentences invented for the fixture. Whatever wins
       Actions has been proven against one shape of one code.

       blockedTable is the Actions Blocked Reason Table VERBATIM
       (GitHub_Integration.md:L2091-L2099): seven codes, each with the severity
       and retryability the spec assigns and the exact user message it mandates.
       The messages are not paraphrasable -- they are the spec's copy, and three
       of the seven are 'warning' rather than 'blocked', a severity tier that has
       never rendered anywhere in this bakeoff. A banner design that only knows
       how to be red has no answer for the bottom three rows.

       Note the longest message is 46 characters, which is two lines at 224px
       BEFORE any action buttons -- research/actions.md:160 works the arithmetic
       and concludes the banner can consume a third of the panel with no legal
       way to shrink it.

       KNOWN SPEC CONFLICT, carried rather than resolved because resolving it is
       an owner decision, not a fixture decision: GI-017 and this table share
       exactly ONE code, actions_auth_expired. actions_auth_required vs
       actions_auth_missing, and actions_branch_rule_mismatch vs
       actions_branch_protected, are near-synonyms spelled differently in the
       two lists. 13 of the 20 distinct codes have no user-facing message at
       all. Both vocabularies are here, spelled as their own specs spell them,
       so a version renders the collision instead of silently picking a side. */
    blockedTable: [
      { code: 'actions_auth_missing',       severity: 'blocked', retryable: true,
        message: 'Connect a GitHub account with Actions access.', chars: 45,
        allowedActionIds: ['github.connect_account'] },
      { code: 'actions_auth_expired',       severity: 'blocked', retryable: true,
        message: 'Refresh GitHub authentication.', chars: 30,
        allowedActionIds: ['github.reauthenticate'] },
      { code: 'actions_workflow_disabled',  severity: 'blocked', retryable: false,
        message: 'Enable the workflow in GitHub before retrying.', chars: 46,
        allowedActionIds: ['github.open_workflow_in_browser'] },
      { code: 'actions_branch_protected',   severity: 'blocked', retryable: false,
        message: 'Branch policy blocks this action.', chars: 33,
        allowedActionIds: ['github.open_branch_rules'] },
      { code: 'actions_rate_limited',       severity: 'warning', retryable: true,
        message: 'GitHub rate limit is active; retry later.', chars: 41,
        allowedActionIds: ['github.retry_later', 'github.open_rate_limit'] },
      { code: 'actions_runner_unavailable', severity: 'warning', retryable: true,
        message: 'No runner is available for this workflow.', chars: 41,
        allowedActionIds: ['github.open_runners'] },
      { code: 'actions_observation_stale',  severity: 'warning', retryable: true,
        message: 'Refresh workflow status before deciding.', chars: 40,
        allowedActionIds: ['github.refresh_observation'] }
    ],
    /* The GI-017 readiness taxonomy, all 14 codes verbatim
       (GitHub_Integration.md:L1047-L1060). These are actions_* details LAYERED
       ONTO shared blocked metadata; they must not redefine blocked_reason_code.
       Listed so a version can show that a code it renders belongs to a family
       of fourteen rather than looking like the only one that exists. */
    readinessCodes: [
      'actions_no_github_remote', 'actions_auth_required', 'actions_auth_expired',
      'actions_missing_scope_runtime', 'actions_missing_scope_admin',
      'actions_workflow_not_dispatchable', 'actions_missing_secret',
      'actions_missing_variable', 'actions_missing_environment',
      'actions_environment_review_required', 'actions_environment_wait_timer',
      'actions_branch_rule_mismatch', 'actions_dispatch_input_invalid',
      'actions_workflow_file_invalid'
    ],
    /* ------------------------------------ STATE VARIETY: GI-021 repo lifecycle
       Renders in zero versions, and one of the two things v0 does that all six
       redesigns dropped is state the effective capability IN PROSE rather than
       implying it with a disabled control (audit section 3).
       GitHub_Integration.md:L1271-L1275: archived, deleted and historical_only
       disable mutation DETERMINISTICALLY, and capability limits show as
       effective capability state, NOT as hidden controls. The canonical copy
       shapes are the two sentences below -- 'can view runs but cannot dispatch'
       and 'can dispatch but cannot manage secrets'.

       The live repo is 'archived' rather than 'active' on purpose: an active
       repo asks a design nothing. A version that hides its Dispatch button
       here is violating L1275; the button must stay visible and disabled with
       the capability cited. project.name is the ACTIVE repo -- source.repo
       carries lifecycle 'active' -- so both states are available at once. */
    repository: {
      nameWithOwner: 'jared-dev/tastebook-unraid-templates', chars: 36,
      lifecycle: 'archived',
      lifecycleStates: ['active', 'renamed_redirected', 'transferred', 'deleted',
                        'archived', 'remote_mismatch', 'historical_only'],
      mutationDisabled: true,
      capabilitySentence: 'You can view runs but cannot dispatch.', chars2: 38,
      capabilities: { view_runs: true, dispatch: false, manage_secrets: false,
                      rerun: false, cancel: false },
      /* The second canonical shape, for a version that wants to show that the
         sentence is a template rather than a string. */
      capabilitySentenceAlt: 'You can dispatch but cannot manage secrets.', chars3: 43,
      hostPolicy: 'github.com_only',
      sentence: 'This repository is archived. Runs remain readable; every mutation is disabled.'
    },
    paging: { runs: { shown: 26, total: 320, pageSize: 26, initialWindow: 12 } },
    /* INVARIANT: any run row with status 'blocked' MUST carry a blocked
       block. Every version renders blocked.code verbatim (GI-017) rather
       than hiding it, so a blocked row without one is a crash, not a
       cosmetic gap. */
    pinned: [
      { name: 'CI - build + test',           chars: 17, run: '#312', branch: 'main', age: '2h', status: 'ok', badge: 'build' },
      { name: 'Release',                     chars: 7,  run: '#88',  branch: 'main', age: '1d', status: 'failed', badge: 'deploy' },
      { name: 'Deploy to production',        chars: 20, run: '#41',  branch: 'release/v1.2', age: '2d', status: 'blocked', badge: 'deploy',
        blocked: { code: 'actions_environment_review_required', severity: 'blocked', retryable: false,
                   sentence: 'Production deploys need two approvals from the release group.',
                   allowedActionIds: ['github.open_environment', 'github.request_review'] } },
      { name: 'Nightly integration matrix',  chars: 26, run: '#902', branch: 'main', age: '9h', status: 'attention', badge: 'test' }
    ],
    runs: [
      { name: 'CI - build + test', chars: 17, run: '#312', branch: 'main', age: '2h', dur: '4m 02s', status: 'ok' },
      { name: 'CI - build + test', chars: 17, run: '#311', branch: 'orch/lane-b-api', age: '3h', dur: '3m 51s', status: 'ok' },
      { name: 'CI - build + test', chars: 17, run: '#310', branch: 'thread/import-fixes', age: '5h', dur: '4m 12s', status: 'failed',
        triage: { job: 'test', step: 'cargo test', lines: [
          'test import::normalize_units ... FAILED',
          'assertion failed: qty.value == 1.5',
          '  left: 11.5, right: 1.5' ],
          changedFiles: ['src/services/import.rs', 'src/services/units.rs'],
          changedCount: 2,
          likelyNext: 'Rerun after the parser fix lands on thread/import-fixes.' } },
      { name: 'CI - build + test', chars: 17, run: '#309', branch: 'orch/lane-c-web', age: '6h', dur: '5m 44s', status: 'failed',
        triage: { job: 'web', step: 'pnpm vitest run', lines: [
          'FAIL  src/lib/components/editor/IngredientQuantityEditor.test.ts',
          'AssertionError: expected dispatched quantity 1.5 to equal 11.5',
          '  at commitQuantity (IngredientQuantityEditor.svelte:57:9)',
          '  Tests  3 failed | 335 passed (338)' ],
          changedFiles: ['web/src/lib/components/editor/IngredientQuantityEditor.svelte'],
          changedCount: 1,
          likelyNext: 'Debounce the stepper so commitQuantity fires once per change.' } },
      { name: 'CI - build + test', chars: 17, run: '#308', branch: 'orch/lane-a-core', age: '7h', dur: '4m 31s', status: 'ok' },
      { name: 'CI - build + test', chars: 17, run: '#307', branch: 'main', age: '9h', dur: '3m 58s', status: 'ok' },
      { name: 'CI - build + test', chars: 17, run: '#306', branch: 'thread/scaling-rounding', age: '11h', dur: '2m 09s', status: 'stale', detail: 'cancelled by jared' },
      { name: 'CI - build + test', chars: 17, run: '#305', branch: 'dependabot/cargo/tokio-1.39.2', age: '1d', dur: '4m 05s', status: 'ok' },
      { name: 'CI - build + test', chars: 17, run: '#313', branch: 'orch/lane-d-infra', age: '3m', dur: '--', status: 'running', detail: 'job 2 of 5' },
      { name: 'Nightly integration matrix', chars: 26, run: '#902', branch: 'main', age: '9h', dur: '38m 17s', status: 'attention',
        detail: '2 of 14 matrix legs flaky' },
      { name: 'Nightly integration matrix', chars: 26, run: '#901', branch: 'main', age: '1d', dur: '41m 02s', status: 'failed',
        triage: { job: 'integration (postgres-16, metric)', step: 'docker compose up --wait', lines: [
          'tastebook-migrate exited with code 137 after 118s',
          'dependency failed to start: container tastebook-migrate is unhealthy',
          'Error: Process completed with exit code 1.' ],
          changedFiles: ['migrations/0003_quantity_precision.sql', 'docker-compose.yml'],
          changedCount: 2,
          likelyNext: 'Raise the migrate healthcheck timeout, then rerun the matrix leg.' } },
      { name: 'Nightly integration matrix', chars: 26, run: '#900', branch: 'main', age: '2d', dur: '39m 44s', status: 'ok' },
      { name: 'Deploy to staging', chars: 17, run: '#88', branch: 'main', age: '1d', dur: '--', status: 'blocked',
        blocked: { code: 'actions_environment_review_required', severity: 'blocked', retryable: false,
                   sentence: 'A reviewer must approve the staging environment.',
                   allowedActionIds: ['github.open_environment', 'github.request_review'] } },
      { name: 'Deploy to staging', chars: 17, run: '#87', branch: 'main', age: '2d', dur: '2m 33s', status: 'ok' },
      { name: 'Deploy to staging', chars: 17, run: '#86', branch: 'release/v1.2', age: '3d', dur: '2m 51s', status: 'ok' },
      { name: 'Deploy to production', chars: 20, run: '#41', branch: 'release/v1.2', age: '2d', dur: '--', status: 'blocked',
        blocked: { code: 'actions_environment_review_required', severity: 'blocked', retryable: false,
                   sentence: 'Production deploys need two approvals from the release group.',
                   allowedActionIds: ['github.open_environment', 'github.request_review'] } },
      { name: 'Deploy to production', chars: 20, run: '#40', branch: 'release/v1.2', age: '9d', dur: '6m 12s', status: 'ok' },
      { name: 'Release', chars: 7, run: '#88', branch: 'main', age: '1d', dur: '1m 04s', status: 'failed',
        triage: { job: 'publish', step: 'cargo publish --dry-run', lines: [
          'error: failed to verify package tarball',
          'caused by: 1 files in the working directory contain changes',
          '  Cargo.lock' ],
          changedFiles: ['Cargo.lock'],
          changedCount: 1,
          likelyNext: 'Commit the lockfile, then rerun Release.' } },
      { name: 'Release', chars: 7, run: '#87', branch: 'main', age: '8d', dur: '3m 22s', status: 'ok' },
      { name: 'CodeQL analysis', chars: 15, run: '#154', branch: 'main', age: '12h', dur: '11m 38s', status: 'ok' },
      { name: 'CodeQL analysis', chars: 15, run: '#153', branch: 'main', age: '1d', dur: '12m 01s', status: 'attention', detail: '3 new alerts' },
      { name: 'Publish Unraid template', chars: 23, run: '#19', branch: 'main', age: '5d', dur: '48s', status: 'ok' },
      { name: 'Publish Unraid template', chars: 23, run: '#18', branch: 'main', age: '6d', dur: '--', status: 'queued', detail: 'waiting for runner' },
      { name: 'Docs preview', chars: 12, run: '#233', branch: 'thread/import-fixes', age: '5h', dur: '1m 17s', status: 'ok' },
      /* ---- STATE VARIETY: two rows, two things nothing rendered -----------
         #304 is a CANCELLED run, encoded as cancelled. Compare it with #306
         above, which is the same event encoded the way the fixture used to
         force -- status 'stale' plus detail 'cancelled by jared'. #306 is
         deliberately left mis-encoded as the control: seven of seven versions
         render it as stale and drop the detail, so the paraphrase and the
         correct token now sit in the same list and the difference is visible
         without reading a report. Cancelling deletes no receipts, which is why
         this row still carries a duration and a triage block.

         #17 carries the first WARNING-severity blocked block in the bakeoff,
         with the verbatim message from the Blocked Reason Table. Its status is
         'queued', not 'blocked': GitHub_Integration.md:L1062-L1063 insists
         attention_required stays distinct from blocked, and a warning is not a
         wall. A banner that renders this row identically to #41 is wrong. */
      { name: 'CI - build + test', chars: 17, run: '#304', branch: 'spike/meilisearch-swap', age: '1d', dur: '1m 46s',
        status: 'cancelled', specStatus: 'cancelled', detail: 'cancelled by jared at job 2 of 5',
        cancelledBy: 'jared', receiptsRetained: true },
      { name: 'Publish Unraid template', chars: 23, run: '#17', branch: 'main', age: '7d', dur: '--',
        status: 'queued', specStatus: 'queued', detail: 'no runner matched labels self-hosted, unraid',
        blocked: { code: 'actions_runner_unavailable', severity: 'warning', retryable: true,
                   sentence: 'No runner is available for this workflow.',
                   allowedActionIds: ['github.open_runners'],
                   actions: [{ id: 'github.open_runners', label: 'Open runners' }] } }
    ],
    workflows: [
      { file: '.github/workflows/ci.yml',                          chars: 24, name: 'CI - build + test',          dispatchable: false },
      { file: '.github/workflows/release.yml',                     chars: 29, name: 'Release',                    dispatchable: false },
      { file: '.github/workflows/deploy-staging.yml',              chars: 36, name: 'Deploy to staging',          dispatchable: false },
      { file: '.github/workflows/deploy-production.yml',           chars: 39, name: 'Deploy to production',       dispatchable: false },
      { file: '.github/workflows/nightly-integration-matrix.yml',  chars: 48, name: 'Nightly integration matrix', dispatchable: false },
      { file: '.github/workflows/codeql-analysis.yml',             chars: 37, name: 'CodeQL analysis',            dispatchable: false },
      { file: '.github/workflows/unraid-template-publish.yml',     chars: 45, name: 'Publish Unraid template',    dispatchable: false },
      { file: '.github/workflows/docs-preview.yml',                chars: 34, name: 'Docs preview',               dispatchable: false }
    ],
    secrets: [
      { name: 'CARGO_REGISTRY_TOKEN',        chars: 20, scope: 'repo',        present: true },
      { name: 'DOCKERHUB_TOKEN',             chars: 15, scope: 'repo',        present: true },
      { name: 'UNRAID_TEMPLATE_PAT',         chars: 19, scope: 'repo',        present: false },
      { name: 'GHCR_PUBLISH_TOKEN',          chars: 18, scope: 'org',         present: true },
      { name: 'FLY_API_TOKEN',               chars: 13, scope: 'environment', present: true },
      { name: 'SENTRY_AUTH_TOKEN',           chars: 17, scope: 'org',         present: true },
      { name: 'MEILISEARCH_MASTER_KEY',      chars: 22, scope: 'environment', present: false },
      { name: 'CLOUDFLARE_R2_ACCESS_KEY_ID', chars: 27, scope: 'repo',        present: true },
      { name: 'STAGING_DATABASE_URL_READONLY', chars: 29, scope: 'environment', present: false }
    ]
  };

  /* ------------------------------------------------------------------ docker
     The largest surface in the app: 78 wired commands. Subview list follows
     CRAU-007; unavailable subviews stay VISIBLE with a disabled reason.
     24 containers is a normal monorepo day: the product stack, the
     observability stack, and whatever CI left running. Three names are
     over 33 characters and one image ref is 51, which is where a name-led
     row grammar stops working at 240px. */
  var docker = {
    /* STATE VARIETY on runtime: host, writable, stale and degraded.
       x-docker.js:258 already COMPUTES a stale / read-only runtime marker in
       runtimeOf and then discards it, because there was nothing in the fixture
       to compute it from. CRAU:L144 requires a stale/cached read-only marker
       whenever runtime access is unavailable, and CRAU-021 (:L218) requires
       every row to distinguish local from remote host and writable from
       read-only. The live runtime is local, writable and fresh, so nothing
       changes for a version that ignores these; hosts below carries the other
       three combinations. */
    runtime: { engine: 'docker', context: 'default', state: 'ok', detected: true,
               host: 'local', hostId: 'local-default', writable: true,
               stale: false, degraded: false, observedAt: '3s' },
    paging: { containers: { shown: 24, total: 137, pageSize: 24, initialWindow: 12 },
              images: { shown: 16, total: 64, pageSize: 16, initialWindow: 8 } },
    /* ---------------------------------------------- STATE VARIETY: blind spot 4
       The Requested vs Effective identity block. CRAU:L927 names SIX EXACT
       LABELS -- Requested, Effective, Reason, Support, Inherited from,
       Overridden by -- and they appear in no Docker panel in any of ten
       versions, because there was no auth block in this file to render.

       This is the spine of the docker.publish.blocked story. Without it
       effective_auth_provider_state has no surface and the DockerHub capability
       enum has nowhere to attach, which in turn means CRAU:L323's gating rule
       has nothing to gate: "if a surface requires a capability the effective
       set does not contain, the control MUST remain visible but disabled, with
       inline explanation that cites the missing capability and degraded_reason
       when present." Visible but disabled, citing the capability. Not hidden.

       Worth knowing before you build it: vC and vD already build this exact
       block -- in the ACTIONS panel, for the GitHub account. The pattern
       exists in the bakeoff; it just never had Docker data.

       The state here is 'degraded' rather than 'authenticated' on purpose.
       An authenticated account asks a design nothing. Here the requested
       identity and the effective identity DIVERGE, images:push is missing from
       the effective set, and Publish stage 2 depends on it -- so a correct
       panel shows a Push control that is present, disabled, and explains
       itself by naming images:push. labels is spelled out rather than left
       implicit so nobody has to guess the capitalisation. */
    auth: {
      labels: { requested: 'Requested', effective: 'Effective', reason: 'Reason',
                support: 'Support', inheritedFrom: 'Inherited from',
                overriddenBy: 'Overridden by' },
      requested: 'jared-dev (DockerHub)', requestedChars: 21,
      effective: 'anonymous (rate-limited)', effectiveChars: 24,
      reason: 'The stored DockerHub token expired 3 days ago.', reasonChars: 46,
      support: 'Docker Engine 27.0.3, credential helper osxkeychain',
      inheritedFrom: 'Workspace default identity', inheritedChars: 26,
      overriddenBy: 'Project setting Containers > Registry identity', overriddenChars: 46,
      state: 'degraded',
      states: ['authenticated', 'unauthenticated', 'degraded', 'expired'],
      degradedReason: 'credential_expired',
      /* The closed DockerHub capability set, CRAU:L309-L313. A version must
         not invent a sixth. present=false is the one that gates Publish. */
      capabilities: [
        { id: 'namespaces:list',          present: true },
        { id: 'repositories:list',        present: true },
        { id: 'repositories:read_private', present: false },
        { id: 'repositories:create',      present: false },
        { id: 'images:push',              present: false }
      ],
      gated: [
        { control: 'Push to registry', capability: 'images:push',
          sentence: 'Push needs images:push, which this identity does not have.' },
        { control: 'Create repository', capability: 'repositories:create',
          sentence: 'Create needs repositories:create, which this identity does not have.' }
      ],
      allowedActionIds: ['docker.registry.reconnect', 'docker.registry.open_settings']
    },
    /* ---------------------------------------------- STATE VARIETY: blind spot 9
       "Remote-host Docker is a whole operating mode the bakeoff never
       rendered." All ten versions render an exact disabled reason and not one
       distinguishes local from remote, or writable from read-only / degraded /
       offline (CRAU-021, :L2097-L2157, prose at :L218).

       These four rows carry the complete host/network state family from
       CRAU:L449 -- offline_cached, network_blocked_by_policy, host_unreachable,
       host_untrusted -- which is unrendered everywhere today. They are not
       interchangeable and the recovery differs for each: a cached offline host
       still serves reads, a policy-blocked host will not recover by retrying,
       an unreachable host might, and an untrusted host must not be trusted
       into working.

       Two rules that only become testable now:
         - Download / Save Local Copy stays available whenever source access is
           readable, EVEN IF remote or project-FS writes are blocked (:L218).
           So readable and writable are separate booleans, not one flag.
         - Open in Terminal disables only when no terminal-capable host or
           session path resolves -- hence terminalCapable. */
    hosts: [
      { id: 'local-default', name: 'local (docker desktop)', chars: 22,
        kind: 'local', context: 'default', state: 'ok',
        readable: true, writable: true, terminalCapable: true,
        containers: 24, age: '6h', reason: null, sentence: null },
      { id: 'unraid-tower', name: 'tower.platyr.lan', chars: 16,
        kind: 'remote', context: 'unraid-tower', state: 'stale',
        readable: true, writable: false, terminalCapable: true,
        containers: 11, age: '2h',
        reason: 'offline_cached',
        sentence: 'Showing a cached inventory from 2h ago. The host is offline; writes are disabled.' },
      { id: 'build-01', name: 'build-01.platyr.internal', chars: 24,
        kind: 'remote', context: 'build-01', state: 'blocked',
        readable: false, writable: false, terminalCapable: false,
        containers: 0, age: '--',
        reason: 'network_blocked_by_policy',
        sentence: 'Workspace policy blocks outbound Docker connections to this host.' },
      { id: 'ci-runner-pool', name: 'ci-pool-3.us-east.platyr.cloud', chars: 30,
        kind: 'remote', context: 'ci-pool-3', state: 'failed',
        readable: false, writable: false, terminalCapable: false,
        containers: 0, age: '18m',
        reason: 'host_unreachable',
        sentence: 'No route to the host. The last successful contact was 18m ago.' },
      { id: 'shared-lab', name: 'lab-shared.partner.example', chars: 26,
        kind: 'remote', context: 'shared-lab', state: 'prohibited',
        readable: false, writable: false, terminalCapable: false,
        containers: 0, age: '--',
        reason: 'host_untrusted',
        sentence: 'This host is not in the trusted set. Trust it in Settings before connecting.' }
    ],
    /* The four host/network reason codes as a set, so a version can show that
       the one it renders is a member of a family rather than a one-off. */
    hostReasons: ['offline_cached', 'network_blocked_by_policy', 'host_unreachable', 'host_untrusted'],
    subviews: [
      { id: 'containers', label: 'Containers',      count: '16/24', available: true },
      { id: 'images',     label: 'Images',          count: '16',    available: true },
      { id: 'compose',    label: 'Compose',         count: '10',    available: true },
      { id: 'registries', label: 'Registries',      count: '4',     available: true },
      { id: 'build',      label: 'Build / Bake',    count: '',      available: true },
      { id: 'publish',    label: 'Publish / Unraid',count: '',      available: true },
      { id: 'networks',   label: 'Networks',        count: '6',     available: true },
      { id: 'volumes',    label: 'Volumes',         count: '9',     available: true },
      { id: 'contexts',   label: 'Contexts',        count: '3',     available: true },
      { id: 'k8s',        label: 'Kubernetes',      count: '',      available: false,
        reason: 'k8s_kubeconfig_missing',
        sentence: 'No kubeconfig resolved for this project.' },
      /* STATE VARIETY: Docker/Hosts is a real subview with 11 wired commands
         (cmd.docker.host.*) and no home in any version. An eleventh lens is
         also a deliberate layout stress -- ten already crowd the strip at
         240px, and CRAU-007 says an unavailable subview stays VISIBLE with its
         reason rather than disappearing, so the strip cannot be trimmed by
         hiding things. degraded marks a subview whose content is partly
         unreachable without being unavailable: four of the five hosts cannot
         be written to, which is a third state between available and not. */
      { id: 'hosts',      label: 'Docker / Hosts',  count: '5',     available: true,
        degraded: true, degradedReason: 'host_partially_unreachable',
        sentence: 'Four of five hosts are read-only, unreachable or untrusted.' }
    ],
    containers: [
      { name: 'tastebook-postgres', chars: 18, image: 'postgres:16-alpine', imgChars: 18, ports: '5432', age: '6h', status: 'running' },
      { name: 'tastebook-redis', chars: 15, image: 'redis:7-alpine', imgChars: 14, ports: '6379', age: '6h', status: 'running' },
      { name: 'tastebook-web', chars: 13, image: 'jared/tastebook-web:v1.1', imgChars: 24, ports: '5173', age: '12m', status: 'running', url: 'http://localhost:5173' },
      { name: 'tastebook-worker', chars: 16, image: 'jared/tastebook-worker:v1.1', imgChars: 27, ports: '', age: '40m', status: 'failed', detail: 'exited (137)' },
      { name: 'tastebook-migrate', chars: 17, image: 'jared/tastebook-migrate:v1.1', imgChars: 28, ports: '', age: '1m', status: 'attention', detail: 'restarting 3/5' },
      { name: 'tastebook-media-thumbnailer-worker', chars: 34, image: 'ghcr.io/jared-dev/tastebook-thumbnailer:sha-a1b2c3d', imgChars: 51, ports: '9411', age: '22m', status: 'running' },
      { name: 'tastebook_integration-test-runner_1', chars: 35, image: 'jared/tastebook-e2e:v1.1', imgChars: 24, ports: '', age: '3m', status: 'running', detail: 'leg 6 of 14' },
      { name: 'tastebook_e2e-playwright-chromium_1', chars: 35, image: 'mcr.microsoft.com/playwright:v1.45.0-jammy', imgChars: 42, ports: '', age: '3m', status: 'failed', detail: 'exited (2)' },
      { name: 'tastebook-nginx-edge', chars: 20, image: 'nginx:1.27-alpine', imgChars: 17, ports: '8080, 8443', age: '6h', status: 'running' },
      { name: 'tastebook-pgbouncer', chars: 19, image: 'edoburu/pgbouncer:1.22', imgChars: 22, ports: '6432', age: '6h', status: 'running' },
      { name: 'tastebook-search-indexer', chars: 24, image: 'jared/tastebook-indexer:v1.1', imgChars: 28, ports: '', age: '55m', status: 'attention', detail: 'unhealthy 2/3' },
      { name: 'tastebook-cron-scheduler', chars: 24, image: 'jared/tastebook-cron:v1.1', imgChars: 25, ports: '', age: '6h', status: 'running' },
      { name: 'tastebook-mailer-worker', chars: 23, image: 'jared/tastebook-mailer:v1.0', imgChars: 27, ports: '', age: '4h', status: 'disabled', detail: 'paused' },
      { name: 'tastebook-backup-sidecar', chars: 24, image: 'offen/docker-volume-backup:v2.43.0', imgChars: 34, ports: '', age: '6h', status: 'running' },
      { name: 'observability-grafana', chars: 21, image: 'grafana/grafana:11.1.0', imgChars: 22, ports: '3000', age: '2d', status: 'running', url: 'http://localhost:3000' },
      { name: 'observability-prometheus', chars: 24, image: 'prom/prometheus:v2.53.0', imgChars: 23, ports: '9090', age: '2d', status: 'running' },
      { name: 'observability-loki', chars: 18, image: 'grafana/loki:3.0.0', imgChars: 18, ports: '3100', age: '2d', status: 'failed', detail: 'exited (1)' },
      { name: 'minio', chars: 5, image: 'quay.io/minio/minio:RELEASE.2024-06-13T22-14-59Z', imgChars: 48, ports: '9000, 9001', age: '2d', status: 'running' },
      { name: 'mailhog', chars: 7, image: 'mailhog/mailhog:v1.0.1', imgChars: 22, ports: '8025', age: '2d', status: 'running', url: 'http://localhost:8025' },
      { name: 'meilisearch', chars: 11, image: 'getmeili/meilisearch:v1.8', imgChars: 25, ports: '7700', age: '2d', status: 'ok', detail: 'exited (0)' },
      { name: 'traefik', chars: 7, image: 'traefik:v3.0', imgChars: 12, ports: '80, 443', age: '2d', status: 'running' },
      { name: 'buildkitd', chars: 9, image: 'moby/buildkit:v0.14.1', imgChars: 21, ports: '', age: '1d', status: 'running' },
      { name: 'ci-runner-9f0e1c2a4b7d3e8f', chars: 26, image: 'ghcr.io/jared-dev/ci-runner:v3', imgChars: 30, ports: '', age: '8m', status: 'queued', detail: 'created' },
      { name: 'ci-runner-ephemeral-4b7d3e8f90a1c2b3', chars: 36, image: 'ghcr.io/jared-dev/ci-runner:v3', imgChars: 30, ports: '', age: '2m', status: 'running' }
    ],
    images: [
      { ref: 'jared/tastebook-web:v1.1', chars: 24, size: '184 MB', age: '12m', digest: 'sha256:a1b2c3d4e5f60718293a4b5c6d7e8f90' },
      { ref: 'jared/tastebook-worker:v1.1', chars: 27, size: '176 MB', age: '40m', digest: 'sha256:b2c3d4e5f60718293a4b5c6d7e8f9012' },
      { ref: 'jared/tastebook-migrate:v1.1', chars: 28, size: '121 MB', age: '1h', digest: 'sha256:c3d4e5f60718293a4b5c6d7e8f901234' },
      { ref: 'jared/tastebook-indexer:v1.1', chars: 28, size: '198 MB', age: '55m', digest: 'sha256:1c2b3a4d5e6f708192a3b4c5d6e7f809' },
      { ref: 'ghcr.io/jared-dev/tastebook-worker:sha-a1b2c3d', chars: 46, size: '176 MB', age: '2h', digest: 'sha256:d4e5f60718293a4b5c6d7e8f90123456' },
      { ref: 'ghcr.io/jared-dev/tastebook-thumbnailer:sha-a1b2c3d', chars: 51, size: '242 MB', age: '22m', digest: 'sha256:e5f60718293a4b5c6d7e8f9012345678' },
      { ref: 'mcr.microsoft.com/playwright:v1.45.0-jammy', chars: 42, size: '1.74 GB', age: '4d', digest: 'sha256:f60718293a4b5c6d7e8f901234567890' },
      { ref: 'quay.io/minio/minio:RELEASE.2024-06-13T22-14-59Z', chars: 48, size: '183 MB', age: '2d', digest: 'sha256:0718293a4b5c6d7e8f90123456789012' },
      { ref: 'postgres:16-alpine', chars: 18, size: '241 MB', age: '3d', digest: 'sha256:718293a4b5c6d7e8f9012345678901ab' },
      { ref: 'redis:7-alpine', chars: 14, size: ' 41 MB', age: '3d', digest: 'sha256:18293a4b5c6d7e8f9012345678901abc' },
      { ref: 'nginx:1.27-alpine', chars: 17, size: ' 52 MB', age: '3d', digest: 'sha256:8293a4b5c6d7e8f9012345678901abcd' },
      { ref: 'grafana/grafana:11.1.0', chars: 22, size: '428 MB', age: '2d', digest: 'sha256:293a4b5c6d7e8f9012345678901abcde' },
      { ref: 'prom/prometheus:v2.53.0', chars: 23, size: '271 MB', age: '2d', digest: 'sha256:93a4b5c6d7e8f9012345678901abcdef' },
      { ref: 'getmeili/meilisearch:v1.8', chars: 25, size: ' 96 MB', age: '2d', digest: 'sha256:3a4b5c6d7e8f9012345678901abcdef0' },
      { ref: '<none>:<none>', chars: 13, size: '176 MB', age: '5h', digest: 'sha256:a4b5c6d7e8f9012345678901abcdef01', dangling: true },
      { ref: '<none>:<none>', chars: 13, size: '1.68 GB', age: '2d', digest: 'sha256:b5c6d7e8f9012345678901abcdef0123', dangling: true }
    ],
    compose: { project: 'tastebook', file: 'docker-compose.yml', services: [
      { name: 'db', chars: 2, status: 'running' },
      { name: 'cache', chars: 5, status: 'running' },
      { name: 'web', chars: 3, status: 'running' },
      { name: 'worker', chars: 6, status: 'failed' },
      { name: 'migrate', chars: 7, status: 'attention' },
      { name: 'mailer', chars: 6, status: 'disabled' },
      { name: 'indexer', chars: 7, status: 'attention' },
      { name: 'media-thumbnailer-worker', chars: 24, status: 'running' },
      { name: 'integration-test-runner', chars: 23, status: 'running' },
      { name: 'e2e-playwright-chromium', chars: 23, status: 'failed' }
    ],
    /* ------------------------------------------- STATE VARIETY: regression 1
       The compose scenario list with a stale badge and a repair CTA
       (CRAU:L148). This is the clearest regression in the whole audit: v0 has
       it, NINE OF NINE Docker redesigns dropped it, and shipping any redesign
       as-is loses users a feature they have today. xD3 reaches the four
       scenario commands through its command index; nobody renders the list,
       the badge, or the repair path -- because the fixture had a services
       array and no scenarios.

       stale is the state that matters and it needs the repair CTA beside it:
       a scenario goes stale when the compose file changed under it, and
       CRAU:L148 wants the drift shown and repairable, not silently re-read.
       driftSummary is what changed, because 'stale' alone tells a user
       nothing about whether running it is safe.

       Four commands attach here: cmd.docker.compose.scenario.save / .run /
       .edit / .delete, the last of which is destructive. */
    scenarios: [
      { id: 'sc-full-stack', name: 'Full stack', chars: 10,
        services: 10, profiles: ['default'], file: 'docker-compose.yml',
        status: 'ok', stale: false, valid: true, lastRun: '6h', drift: null, driftSummary: null },
      { id: 'sc-api-only', name: 'API only - no web, no workers', chars: 29,
        services: 4, profiles: ['api'], file: 'docker-compose.yml',
        status: 'ok', stale: false, valid: true, lastRun: '2d', drift: null, driftSummary: null },
      { id: 'sc-integration', name: 'Integration matrix (postgres-16, metric)', chars: 40,
        services: 7, profiles: ['ci', 'integration'], file: 'docker-compose.ci.yml',
        status: 'stale', stale: true, valid: true, lastRun: '1d',
        drift: 'compose_file_changed',
        driftSummary: '2 services added, 1 port remapped since this scenario was saved',
        repair: { id: 'docker.compose.scenario.repair', label: 'Repair scenario' } },
      { id: 'sc-observability', name: 'Observability only', chars: 18,
        services: 3, profiles: ['obs'], file: 'docker-compose.obs.yml',
        status: 'attention', stale: true, valid: false, lastRun: '5d',
        drift: 'compose_service_missing',
        driftSummary: 'Service tempo is referenced by this scenario and no longer exists',
        repair: { id: 'docker.compose.scenario.repair', label: 'Repair scenario' } }
    ] },
    registries: [
      { host: 'docker.io/jared', chars: 15, state: 'ok', capability: 'push_pull' },
      { host: 'ghcr.io', chars: 7, state: 'blocked', capability: 'none',
        reason: 'registry_not_configured',
        sentence: 'Add a token in Settings > Advanced > Containers to enable.' },
      { host: 'registry.gitlab.com/jared-dev/tastebook', chars: 39, state: 'attention', capability: 'pull_only',
        reason: 'registry_token_expiring',
        sentence: 'The deploy token for this registry expires in 6 days.' },
      { host: 'localhost:5000', chars: 14, state: 'disabled', capability: 'none',
        reason: 'registry_daemon_unreachable',
        sentence: 'The local registry container is not running.' }
    ],
    build: { tag: 'jared/tastebook-web:v1.2', chars: 24, context: '.', dockerfile: 'Dockerfile',
             digest: 'sha256:e5f60718293a4b5c6d7e8f9012345678' },
    publish: { stages: [
      { n: 1, id: 'build',    label: 'Build image',        status: 'ok' },
      { n: 2, id: 'push',     label: 'Push to registry',   status: 'running' },
      { n: 3, id: 'template', label: 'Generate Unraid XML',status: 'queued' },
      { n: 4, id: 'commit',   label: 'Commit template',    status: 'queued' },
      { n: 5, id: 'pr',       label: 'Open template PR',   status: 'queued' }
    ] }
  };

  /* ------------------------------------------------------------------- tests
     The five regions named by Automated_Testing_System.md GUI Result
     Surfacing are non-negotiable: run_list, active_run_detail, failure_list,
     artifact_preview, redaction_notice. Nine failures with real assertion
     text is what turns failure_list from a label into a layout problem. */
  var tests = {
    runtime: { enabled: true, adapter: 'cargo test', probe: 'available' },
    paging: { runs: { shown: 16, total: 208, pageSize: 16, initialWindow: 7 },
              failures: { shown: 9, total: 9, pageSize: 9, initialWindow: 5 } },
    /* STATE VARIETY: the Run precondition set (audit-tests.md R16). Run is the
       P0 32px button in this panel and no version can say why it is disabled,
       because the fixture stated no preconditions. Each entry is a gate; Run is
       legal only when every met is true. cancel_run is listed too because it is
       destructive-adjacent and needs a confirm the kit cannot currently express
       (blind spot 1 -- there is no PMK.confirm anywhere in this bakeoff). */
    runPreconditions: [
      { id: 'runtime_available',  label: 'Test runtime detected',   met: true },
      { id: 'adapter_resolved',   label: 'Adapter cargo test resolved', met: true },
      { id: 'permission_allowed', label: 'Permission to run tests', met: true },
      { id: 'no_run_in_flight',   label: 'No run already in flight', met: false,
        sentence: 'Run 214 is still running. Cancel it or wait before starting another.' },
      { id: 'workspace_clean',    label: 'Workspace resolves',      met: true }
    ],
    policy: {
      visibility: 'show_when_possible',
      capabilities: [
        { id: 'unit',    label: 'Unit',        mode: 'auto', state: 'ok' },
        { id: 'integr',  label: 'Integration', mode: 'on',   state: 'ok' },
        { id: 'browser', label: 'Browser',     mode: 'auto', state: 'blocked',
          reason: 'testing_needs_authority',
          sentence: 'Browser sessions need an authority grant for this project.' },
        { id: 'perf',    label: 'Performance', mode: 'off',  state: 'prohibited',
          reason: 'testing_prohibited_by_policy',
          sentence: 'Performance suites are disabled by workspace policy.' },
        { id: 'contract', label: 'Contract',   mode: 'auto', state: 'ok' },
        { id: 'a11y',    label: 'Accessibility', mode: 'auto', state: 'attention',
          reason: 'testing_adapter_degraded',
          sentence: 'The axe adapter reported 3 rules it could not evaluate headlessly.' },
        { id: 'mutation', label: 'Mutation',   mode: 'off',  state: 'disabled',
          reason: 'testing_adapter_missing',
          sentence: 'No mutation adapter is installed for the Rust workspace.' }
      ]
    },
    active: { name: 'cargo test - import worker suite', chars: 32, status: 'running',
              lane: 'lane-b', retry: '2 of 2', elapsed: '00:41',
              done: 118, total: 214, passed: 117, failed: 1, skipped: 0 },
    failures: [
      { test: 'import::normalize_units', chars: 23,
        message: 'assertion failed: qty.value == 1.5 (left: 11.5, right: 1.5) at import.rs:104' },
      { test: 'routes::recipes::servings_scaling', chars: 33,
        message: 'expected 2 ingredients scaled, found 1 - the second row was dropped by the clamp' },
      { test: 'import::mixed_fractions::two_and_three_quarters', chars: 47,
        message: 'parse_quantity("2 3/4 cups") returned Qty { value: 23.75, unit: Cup }, expected 2.75' },
      { test: 'services::units::imperial_to_metric_roundtrip', chars: 45,
        message: 'roundtrip drift 0.0041 exceeds tolerance 0.0001 for unit Tbsp at 3 decimal places' },
      { test: 'services::scaling::culinary_rounding_snaps_to_steps', chars: 51,
        message: 'expected snap to 0.25 increments, got 0.3333333333333333 after scaling by 1/3' },
      { test: 'web::IngredientQuantityEditor::emits_change_on_blur', chars: 51,
        message: 'AssertionError: expected dispatched quantity 1.5 to equal 11.5 (stepper fired twice)' },
      { test: 'web::RecipeCard::renders_scaled_quantity_column', chars: 47,
        message: 'Unable to find an element with the text: 1.5 cup - found "11/2 cup" instead' },
      { test: 'routes::recipes::rejects_nan_quantity', chars: 37,
        message: 'expected 422 Unprocessable Entity, received 500 Internal Server Error from the handler' },
      { test: 'media::thumbnailer::strips_exif_before_resize', chars: 45,
        message: 'EXIF block still present in output: GPSLatitude survived the strip pass' }
    ],
    artifacts: [
      { name: 'run.log', chars: 7, size: '212 KB', kind: 'document' },
      { name: 'screenshot-01.png', chars: 17, size: ' 88 KB', kind: 'screenshot' },
      { name: 'coverage-summary.json', chars: 21, size: ' 14 KB', kind: 'evidence' },
      { name: 'failed-attempts.json', chars: 20, size: '  6 KB', kind: 'failed_attempts' },
      { name: 'junit-workspace-feature-matrix.xml', chars: 34, size: '1.2 MB', kind: 'evidence' },
      { name: 'import-worker-stdout-retry-2.log', chars: 32, size: '844 KB', kind: 'document' },
      { name: 'ingredient-quantity-editor-240px.png', chars: 36, size: '141 KB', kind: 'screenshot' },
      { name: 'before-after-quantity-column.png', chars: 32, size: '206 KB', kind: 'before_after_snapshot' },
      { name: 'playwright-trace.zip', chars: 20, size: ' 18 MB', kind: 'browser_recording' },
      { name: 'cost-usage-run-214.json', chars: 23, size: '  3 KB', kind: 'cost_usage' },
      { name: 'flaky-leg-report-nightly-902.md', chars: 31, size: ' 27 KB', kind: 'document' }
    ],
    /* ---------------------------------------------- STATE VARIETY: blind spot 2
       The redaction gate had no failure path. Read this whole comment before
       wiring anything to it, because the shape here is deliberate.

       Automated_Testing_System.md:L83-L98: "Redaction failures block
       display/persistence until resolved or explicitly authorized." The gate
       exists FOR the failure case, and in seven of seven Tests implementations
       redaction_failed never suppressed artifact_preview -- every one rendered
       a clean-state notice and then rendered the artifacts. The whole bakeoff
       designed the happy path, because the fixture carried {fields, note} and
       nothing else, and {fields, note} can only describe a success.

       WHY THE LIVE STATE IS STILL CLEAN. redaction below is untouched --
       same fields, same note, same text -- so every existing version renders
       exactly what it rendered before and the previous audit stays comparable.
       Flipping the live gate to failed would have silently rewritten the
       result of an audit that is still being read. The failure case lives in
       redactionFailed instead, and any version can point its notice at it.

       THREE STATES, NOT TWO. research/tests.md:95 and :129 record that the
       spec names redacted_ok and redaction_failed and leaves the in-between
       unnamed, even though it is operationally certain. The proposed vocabulary
       is redaction_clean | redaction_pending | redaction_failed and it is
       spelled out in redactionStates. Pending is not a slower clean: it must
       render a placeholder and NEVER the raw asset.

       NON-DISMISSIBLE IS THE HARD PART. R28 passes in every version today by
       accident -- no version has a dismiss control, so no version can wrongly
       offer one -- and it regresses the moment somebody adds a close button.
       dismissible:false is here so the requirement is stated in the data
       rather than being satisfied by omission. Dismissal implies the user saw
       the artifact, which is exactly what the gate is preventing. */
    redaction: { fields: 4, note: '4 fields redacted before display', state: 'redaction_clean' },
    redactionStates: [
      { id: 'redaction_clean',   preview: 'render',      dismissible: true,
        line: '4 fields redacted before display' },
      { id: 'redaction_pending', preview: 'placeholder', dismissible: false,
        line: 'Redaction in progress. Previews are held until it completes.' },
      { id: 'redaction_failed',  preview: 'suppress',    dismissible: false,
        line: 'Redaction failed. Artifact previews are blocked until this is resolved.' }
    ],
    redactionFailed: {
      state: 'redaction_failed',
      fields: 4, attempted: 6, failed: 2,
      profileId: 'redact-default-v3',
      reason: 'redaction_profile_unavailable',
      sentence: 'Redaction failed on 2 of 6 fields. Artifact previews are blocked until this is resolved.',
      detail: 'The redaction profile redact-default-v3 could not load, so secrets in run 209 were not masked.',
      blocks: ['artifact_preview'],
      dismissible: false,
      authorize: { id: 'testing.authorize_unredacted', label: 'Authorize unredacted display',
                   destructive: true, needsConfirm: true },
      allowedActionIds: ['testing.retry_redaction', 'testing.open_redaction_profile',
                         'testing.authorize_unredacted'],
      affectedRunId: '209',
      affectedArtifacts: ['playwright-trace.zip', 'import-worker-stdout-retry-2.log']
    },
    /* STATE VARIETY on every row: specStatus, the EXACT token from
       Automated_Testing_System.md:L2221-L2229 -- queued, running, passed,
       failed, cancelled, blocked, inconclusive -- which the brief marks
       "exact, do not paraphrase". The shared vocabulary spells passed as 'ok',
       so six independent authors all rendered 'ok' where the spec says
       'passed'; they inherited it from this file and no design could have
       fixed it alone. status stays the rendering token, specStatus is the spec
       token, and a version that wants to be correct reads specStatus for the
       word while still reading status for the glyph and rail.

       The last two rows are the states that did not exist anywhere: cancelled
       and inconclusive. Both are distinct from failed and must never collapse
       into a red chip (audit-tests.md R11) -- blocked routes to an authority
       action, inconclusive routes to the receipt, and cancelled deletes no
       receipts at all, which is why 217 still has one. */
    runs: [
      { name: 'cargo test - import worker suite', chars: 32, id: '214', when: '4m', status: 'running', specStatus: 'running' },
      { name: 'cargo test - import worker suite', chars: 32, id: '213', when: '2h', status: 'failed', specStatus: 'failed' },
      { name: 'cargo test - full workspace', chars: 27, id: '212', when: '5h', status: 'ok', specStatus: 'passed' },
      { name: 'vitest - web components', chars: 23, id: '211', when: '1d', status: 'ok', specStatus: 'passed' },
      { name: 'cargo test - full workspace, feature matrix all', chars: 47, id: '210', when: '1d', status: 'failed', specStatus: 'failed' },
      { name: 'playwright - editor regression pack', chars: 35, id: '209', when: '1d', status: 'attention', specStatus: 'passed',
        redactionState: 'redaction_failed' },
      { name: 'cargo test - scaling and rounding', chars: 33, id: '208', when: '2d', status: 'ok', specStatus: 'passed' },
      { name: 'vitest - store contracts and reducers', chars: 37, id: '207', when: '2d', status: 'ok', specStatus: 'passed' },
      { name: 'axe - accessibility sweep, editor routes', chars: 40, id: '206', when: '2d', status: 'attention', specStatus: 'passed' },
      { name: 'cargo test - import worker suite', chars: 32, id: '205', when: '3d', status: 'stale', specStatus: 'passed' },
      { name: 'playwright - import wizard end to end', chars: 37, id: '204', when: '3d', status: 'blocked', specStatus: 'blocked',
        reason: 'testing_needs_authority',
        sentence: 'Browser sessions need an authority grant for this project.',
        allowedActionIds: ['testing.request_authority', 'testing.open_policy'] },
      { name: 'cargo bench - quantity parser throughput', chars: 40, id: '203', when: '4d', status: 'prohibited', specStatus: 'blocked' },
      { name: 'vitest - web components', chars: 23, id: '202', when: '4d', status: 'failed', specStatus: 'failed' },
      { name: 'cargo test - migrations forward and back', chars: 40, id: '201', when: '5d', status: 'ok', specStatus: 'passed' },
      { name: 'cargo test - import worker suite, retry sweep', chars: 45, id: '217', when: '6h',
        status: 'cancelled', specStatus: 'cancelled',
        detail: 'cancelled at case 118 of 214', cancelledBy: 'jared',
        receiptRetained: true, receiptId: 'rcpt-217',
        sentence: 'Cancelled by jared after 41s. The receipt is retained; no results were discarded.' },
      { name: 'playwright - import wizard end to end', chars: 37, id: '216', when: '8h',
        status: 'inconclusive', specStatus: 'inconclusive',
        detail: '3 legs never reported', receiptId: 'rcpt-216',
        reason: 'testing_result_indeterminate',
        sentence: 'The run ended without a verdict: 3 of 19 legs never reported. Open the receipt.',
        allowedActionIds: ['testing.open_receipt', 'testing.rerun'] }
    ]
  };

  /* ------------------------------------------------------------------ agents
     F3-452: the panel MIRRORS the subagent registry (active AND available)
     and provides lineage entrypoints. It holds no state of its own.
     15 active is a real orchestrator run, and it is the volume at which
     "which agent is blocked on what" stops being readable by accident.

     This is also the panel the brief already called "genuinely
     under-specified": zero wiring rows, no cmd.agents.* family, and a spread
     across six redesigns of 52-67% where the block of requirements NONE of
     them met is bigger than the spread. Seven MUSTs were absent in all seven
     versions. Five of the seven are fixture-blocked and are answered below --
     elapsed on blocked rows, unresolvable registry entries, requested-vs-
     effective persona, provenance badges, and disconnected/restoring as
     blocked. The remaining two (the 7.19 audit summary row with its
     time-range and export controls) are a whole second surface, not a field,
     and are left alone deliberately rather than faked with a stub. */
  var agents = {
    paging: { completed: { shown: 13, total: 215, pageSize: 13, initialWindow: 6 } },
    active: [
      { name: 'lane-b worker', chars: 13, persona: 'Implementer', target: 'API nodes',
        thread: 'Orchestrator run #47', run: '#47', elapsed: '4m 12s', status: 'running',
        note: 'waiting on approval: deploy' },
      { name: 'Auditor', chars: 7, persona: 'Reviewer', target: 'review loop',
        thread: 'Import worker debugging', run: '#47', elapsed: '40s', status: 'running', note: null },
      /* Index 2 must stay a BLOCKED agent carrying a reason and index 3 a
         QUEUED one: vD-drill-stack reads active[2].reason and active[3].name
         for its hub summaries. Append new agents below, never above. */
      /* STATE VARIETY -- blind spot 7, and the audit calls it the cheapest gap
         in the report to close and the most operationally costly to leave.
         Both blocked agents carried elapsed '--', so every version either
         suppressed the field or printed the placeholder, and a 30-second
         approval wait was indistinguishable from a 3-hour one. A blocked agent
         with no age is unrankable. FinalGUISpec.md:L3743 requires time since
         blocked; blockedFor states it as its own field so a design does not
         have to overload elapsed, and blockedAt gives the absolute anchor.
         These two rows are the only VALUE changes in this file -- '--' became a
         real duration. Nothing was renamed, nothing was removed. */
      { name: 'Deploy Sentinel', chars: 15, persona: 'Operator', target: 'staging deploy',
        thread: 'Orchestrator run #47', run: '#47', elapsed: '3h 12m', status: 'blocked',
        blockedFor: '3h 12m', blockedAt: '11:04',
        reason: 'needs_authority',
        allowedActionIds: ['orchestrator.grant_authority', 'orchestrator.abort_node'],
        sentence: 'Deploy authority has not been granted for staging.' },
      { name: 'Test Sleuth', chars: 11, persona: 'Investigator', target: 'debug thread',
        thread: 'Import worker debugging', run: null, elapsed: '--', status: 'queued', note: null },
      { name: 'lane-a core worker', chars: 18, persona: 'Implementer', target: 'import + scaling services',
        thread: 'Orchestrator run #47 lane-a', run: '#47', elapsed: '11m 38s', status: 'running',
        note: 'rewriting normalize_units call sites' },
      { name: 'lane-c web worker', chars: 17, persona: 'Implementer', target: 'IngredientQuantityEditor',
        thread: 'Orchestrator run #47 lane-c', run: '#47', elapsed: '9m 02s', status: 'attention',
        note: 'stepper test failing on second commit' },
      /* The second half of blind spot 7. 41 seconds against 3h 12m above: the
         whole point is that these two rows must not sort or read alike. */
      { name: 'Migration Warden', chars: 16, persona: 'Operator', target: 'migration 0003 precision change',
        thread: 'Release v1.2 preparation', run: '#47', elapsed: '41s', status: 'blocked',
        blockedFor: '41s', blockedAt: '14:15',
        reason: 'needs_approval',
        allowedActionIds: ['orchestrator.approve_node', 'orchestrator.open_for_edit',
                           'orchestrator.abort_node'],
        sentence: 'A destructive column type change needs human approval before it runs.' },
      { name: 'Rounding Investigator', chars: 21, persona: 'Investigator', target: 'culinary rounding drift',
        thread: 'Servings scaling rounding investigation', run: '#46', elapsed: '--', status: 'queued', note: null },
      { name: 'Perf Prospector', chars: 15, persona: 'Investigator', target: 'quantity parser throughput',
        thread: 'Performance baseline sweep', run: null, elapsed: '--', status: 'prohibited',
        reason: 'agent_prohibited_by_policy',
        sentence: 'Performance agents are disabled by workspace policy.' },
      { name: 'Doc Scribe', chars: 10, persona: 'Writer', target: 'import normalization guide',
        thread: 'Documentation refresh', run: null, elapsed: '2m 51s', status: 'running', note: null },
      { name: 'Dependency Steward', chars: 18, persona: 'Operator', target: 'tokio 1.39.2 bump review',
        thread: 'Dependency hygiene sweep', run: null, elapsed: '--', status: 'stale',
        note: 'no progress for 46m' },
      /* ---- STATE VARIETY: four rows, four MUSTs absent in all seven versions
         (blind spot 11). Appended, so active[2] and active[3] -- which
         vD-drill-stack reads by index for its hub summaries -- do not move.

         specStatus carries the EXACT lifecycle token from
         FinalGUISpec.md:L1720-L1728, preserved verbatim in F3-147: running,
         queued, blocked, remediation, completed. Five tokens, contractual, do
         not paraphrase and do not merge blocked into failed. The shared
         rendering vocabulary has no 'remediation', which is why the row below
         renders as 'attention' and states its real lifecycle in specStatus --
         the same shape the Tests rows use. */

      /* M16: disconnected and restoring are AGENT-SESSION states that surface
         as blocked with a reason code (FinalGUISpec.md:L3993-L3994). They are
         not a third status. A design that invents a 'disconnected' pill is
         wrong; a design that shows them as ordinary blocked rows loses the
         fact that one is recovering by itself and the other is not. */
      { name: 'Media Pipeline Wrangler', chars: 23, persona: 'Implementer', target: 'thumbnailer resize pipeline',
        thread: 'Orchestrator run #46 lane-f', run: '#46', elapsed: '52m 04s', status: 'blocked',
        specStatus: 'blocked', session: 'disconnected',
        blockedFor: '12m 31s', blockedAt: '13:58',
        reason: 'agent_session_disconnected',
        sentence: 'The agent session dropped 12m ago and has not reconnected.',
        allowedActionIds: ['orchestrator.reconnect_session', 'orchestrator.abort_node'] },
      { name: 'Schema Cartographer', chars: 19, persona: 'Planner', target: 'migration 0003 dependency map',
        thread: 'Release v1.2 preparation', run: '#47', elapsed: '18m 47s', status: 'blocked',
        specStatus: 'blocked', session: 'restoring',
        blockedFor: '38s', blockedAt: '14:16',
        reason: 'agent_session_restoring',
        sentence: 'The session is restoring from a checkpoint. No action is needed yet.',
        allowedActionIds: ['orchestrator.open_for_edit'] },

      /* M15: the remediation CEILING. FinalGUISpec.md:L3749-L3760 -- default 3,
         on exceed the node goes blocked with blocked_reason_code
         remediation_ceiling_exceeded, the remediation lineage STAYS VISIBLE,
         Replan / Manual fix / Abort are exposed, and there is NO AUTOMATIC
         RETRY AFFORDANCE. autoRetry:false is not decoration: a design that
         offers a Retry button here has broken the ceiling. Note the reason code
         is 28 characters, longer than most agent names, and
         research/agents.md:91 records that it needs its own line at 240px. */
      { name: 'Rounding Investigator', chars: 21, persona: 'Investigator', target: 'culinary rounding drift',
        thread: 'Servings scaling rounding investigation', run: '#46', elapsed: '1h 04m', status: 'blocked',
        specStatus: 'blocked',
        blockedFor: '1h 04m', blockedAt: '13:06',
        reason: 'remediation_ceiling_exceeded',
        sentence: 'Remediation limit reached after 3 attempts. No further automatic retries.',
        remediation: { generation: 3, ceiling: 3, autoRetry: false, lineageVisible: true,
                       lineageRef: 'cmd.runtime.open_remediation_lineage' },
        allowedActionIds: ['orchestrator.replan_node', 'orchestrator.open_for_edit',
                           'orchestrator.abort_node'] },

      /* M9: requested vs effective persona. orchestrator-subagent-integration
         .md:L1157 and :L1169 make the requested/effective runtime pipeline
         canonical, and a SILENTLY SUBSTITUTED persona is exactly the drift this
         panel exists to expose. Every other row in this array carries one
         persona field and therefore cannot diverge; this row asked for
         Investigator and got Implementer. persona keeps the effective value so
         a version that reads only persona still renders a real string. */
      { name: 'Import Regression Hunter', chars: 24, persona: 'Implementer', target: 'parse_quantity regression sweep',
        thread: 'Import worker debugging', run: '#47', elapsed: '6m 19s', status: 'running',
        specStatus: 'running',
        requestedPersona: 'Investigator', effectivePersona: 'Implementer',
        personaDiverged: true,
        personaReason: 'persona_not_available_in_tier',
        personaSentence: 'Investigator is not available in this tier; Implementer was substituted.',
        note: 'running with a substituted persona' }
    ],
    completed: [
      { name: 'Test Sleuth', chars: 11, persona: 'Investigator', outcome: 'verified_fix', when: '6m', status: 'ok' },
      { name: 'Doc Scribe', chars: 10, persona: 'Writer', outcome: 'completed', when: '1h', status: 'ok' },
      { name: 'Auditor', chars: 7, persona: 'Reviewer', outcome: 'remediation', when: '2h', status: 'attention' },
      { name: 'lane-a core worker', chars: 18, persona: 'Implementer', outcome: 'merged_to_lane', when: '3h', status: 'ok' },
      { name: 'Fixture Wrangler', chars: 16, persona: 'Implementer', outcome: 'completed', when: '4h', status: 'ok' },
      { name: 'Schema Cartographer', chars: 19, persona: 'Planner', outcome: 'plan_accepted', when: '5h', status: 'ok' },
      { name: 'Rounding Investigator', chars: 21, persona: 'Investigator', outcome: 'inconclusive', when: '7h', status: 'attention' },
      { name: 'Release Notary', chars: 14, persona: 'Reviewer', outcome: 'blocked_on_human', when: '9h', status: 'blocked' },
      { name: 'EXIF Strip Surgeon', chars: 18, persona: 'Implementer', outcome: 'verified_fix', when: '1d', status: 'ok' },
      { name: 'Compose Groundskeeper', chars: 21, persona: 'Operator', outcome: 'completed', when: '1d', status: 'ok' },
      { name: 'Nightly Matrix Triager', chars: 22, persona: 'Investigator', outcome: 'flake_confirmed', when: '1d', status: 'attention' },
      { name: 'Deploy Sentinel', chars: 15, persona: 'Operator', outcome: 'aborted', when: '2d', status: 'failed' },
      /* STATE VARIETY: 7.19 requires an outcome on completed rows and names
         success / failure / CANCELLED. Nothing in this array was cancelled, so
         the third outcome had never rendered. Now it uses the real status token
         rather than borrowing 'failed' -- a cancelled child run is not a
         failure and must not be read as one. */
      { name: 'Perf Prospector', chars: 15, persona: 'Investigator', outcome: 'cancelled', when: '3d',
        status: 'cancelled', specStatus: 'completed', cancelledBy: 'jared' }
    ],
    /* STATE VARIETY on the registry (blind spot 11, M22 and M8).

       provenance is the protected_core / bundled / user_created badge set from
       FinalGUISpec.md:L1398-L1415, absent in all seven versions. It is not
       cosmetic: protected_core entries cannot be edited or deleted, so the
       badge is what explains a disabled row action.

       resolution is the third state an available_subagents row can be in.
       Every registry entry must resolve to a Persona through persona_registry
       (orchestrator-subagent-integration.md:L1157) and the two registries are
       mandatorily separate, so an entry can name a Persona that does not
       resolve. The spec is emphatic about what to do then
       (:L1334): "Unknown subagent '[name]' in tier config. Available: [list].
       Do not silently filter." Render it, DISABLED, with the resolution error.
       A filtered-out row is indistinguishable from one that never existed --
       the exact failure the fail-fast rule exists to prevent.

       Registry names are stable kebab-case strings (:L1337), which is why the
       two unresolvable entries below are spelled that way and the resolvable
       ones keep their display names. */
    available: [
      { name: 'Implementer', chars: 11, persona: 'Implementer', resolution: 'resolved', provenance: 'protected_core' },
      { name: 'Reviewer', chars: 8, persona: 'Reviewer', resolution: 'resolved', provenance: 'protected_core' },
      { name: 'Investigator', chars: 12, persona: 'Investigator', resolution: 'resolved', provenance: 'protected_core' },
      { name: 'Writer', chars: 6, persona: 'Writer', resolution: 'resolved', provenance: 'protected_core' },
      { name: 'Operator', chars: 8, persona: 'Operator', resolution: 'resolved', provenance: 'protected_core' },
      { name: 'Planner', chars: 7, persona: 'Planner', resolution: 'resolved', provenance: 'protected_core' },
      { name: 'Refactorer', chars: 10, persona: 'Implementer', resolution: 'resolved', provenance: 'bundled' },
      { name: 'Test Author', chars: 11, persona: 'Implementer', resolution: 'resolved', provenance: 'bundled' },
      { name: 'Migration Warden', chars: 16, persona: 'Operator', resolution: 'resolved', provenance: 'bundled' },
      { name: 'Accessibility Auditor', chars: 21, persona: 'Reviewer', resolution: 'resolved', provenance: 'bundled' },
      { name: 'Dependency Steward', chars: 18, persona: 'Operator', resolution: 'resolved', provenance: 'user_created' },
      /* M9 again, on the registry side rather than the active side: this entry
         is selectable but will not run as the Persona it names. */
      { name: 'Performance Prospector', chars: 22, persona: 'Investigator', resolution: 'resolved',
        provenance: 'user_created',
        requestedPersona: 'Investigator', effectivePersona: 'Implementer', personaDiverged: true,
        personaSentence: 'Resolves to Implementer in this tier, not Investigator.' },
      { name: 'Release Notary', chars: 14, persona: 'Reviewer', resolution: 'resolved', provenance: 'user_created' },
      { name: 'Documentation Cartographer', chars: 26, persona: 'Writer', resolution: 'resolved', provenance: 'user_created' },
      /* ---- STATE VARIETY: M8, unresolvable. Disabled, never hidden. -------- */
      { name: 'security-auditor', chars: 16, persona: 'unresolved',
        resolution: 'unresolvable', provenance: 'user_created', enabled: false,
        error: 'Unknown subagent "security-auditor" in tier config.',
        detail: 'No Persona resolves this name in persona_registry. It is listed here rather than filtered out.',
        allowedActionIds: ['persona.open_registry'] },
      { name: 'schema-cartographer-v2', chars: 22, persona: 'unresolved',
        resolution: 'unresolvable', provenance: 'bundled', enabled: false,
        error: 'Unknown subagent "schema-cartographer-v2" in tier config.',
        detail: 'The bundled entry survived an upgrade that removed its Persona. Do not silently filter it.',
        allowedActionIds: ['persona.open_registry'] }
    ],
    /* The five contractual lifecycle tokens, plus the two agent-session states
       that surface AS blocked rather than beside it. Listed so a version can
       show that its status pill maps a spec vocabulary rather than inventing
       one. See the note in agents.active above: the shared rendering
       vocabulary has no 'remediation' token, so that lifecycle state renders as
       'attention' and declares itself in specStatus. */
    lifecycle: ['running', 'queued', 'blocked', 'remediation', 'completed'],
    sessionStates: ['disconnected', 'restoring'],
    outcomes: ['success', 'failure', 'cancelled'],
    lineageTargets: ['Open owning thread', 'Open target', 'Open artifacts',
                     'Open investigation record', 'Open review bundle', 'Open lineage']
  };

  /* --------------------------------------------------------------- artifacts
     One row grammar must serve every kind. 47 rows covering all 19 runtime
     artifact kinds that ship a schema in Plans/. The kind tokens are
     verbatim schema names, which is why before_after_snapshot (21
     characters) is in here twice: it is the single string that proved a
     kind chip cannot lead a row at 240px.

     STATE VARIETY: the last 9 rows exist to break the assumption the first 38
     quietly taught. Every one of those 38 has a title, is healthy, is current,
     and has a payload -- so the whole panel could be built as "print the title,
     print a chip" and score well. The new rows have no title, no summary,
     an evicted payload, an expired provider URL, an unacknowledged tail, and
     three blocked families that are not failures. Four of the panel's
     requirements could not be attempted before them and one of them (R3, the
     identity fallback chain) is the brief's own hardest question. */
  var artifacts = {
    families: [
      { id: 'all',      label: 'All',      count: 47 },
      { id: 'evidence', label: 'Evidence', count: 24 },
      { id: 'web',      label: 'Web',      count: 9 },
      { id: 'browser',  label: 'Browser',  count: 6 },
      { id: 'bundle',   label: 'Bundles',  count: 4 },
      { id: 'receipt',  label: 'Receipts', count: 4 }
    ],
    paging: { shown: 47, total: 421, pageSize: 47, initialWindow: 20 },
    /* ---------------------------------------------- STATE VARIETY: blind spot 6
       retention, freshness and health are now on EVERY row, injected above the
       title line. All three are REQUIRED envelope fields
       (runtime_artifact_envelope.schema.json, research/artifacts.md:43) and
       retention_class was the clearest case in the whole audit of a mandatory
       field the entire exercise never noticed: it rendered in no version,
       appeared in no menu, in no sheet, and was not in this file at all.

       retention uses the ENVELOPE SCHEMA enum -- ephemeral | session | project
       | governed | debug_retained. Be aware this conflicts with the prose at
       RAP:L174-L177, which says durable | session_bounded | ephemeral_view.
       Two incompatible vocabularies for one required field
       (audit-artifacts.md:218). The schema wins here because the schema is what
       validates; the conflict is real and is an owner decision, not a fixture
       decision, so it is recorded rather than silently resolved.

       freshness and health are the ONLY two universally guaranteed state chips
       (projection_freshness in current|refreshing|stale, projection_health in
       healthy|degraded|unavailable) and RAP:L2042 forbids collapsing them into
       one axis. All 38 original rows are healthy, so nothing changes for a
       version that ignores them; the new rows below carry degraded and
       unavailable. */
    rows: [
      /* ---- evidence: 19 ------------------------------------------------ */
      { kind: 'code_diff', family: 'evidence', status: 'ok',
        id: 'art-07513aa3', retention: 'project', freshness: 'current', health: 'healthy',
        title: 'Import quantity parser fix', chars: 26,
        preview: 'src/services/import.rs +38 -9',
        meta: ['2 files', 'node n-19', '6m'] },
      { kind: 'code_diff', family: 'evidence', status: 'ok',
        id: 'art-4f9f3b2f', retention: 'project', freshness: 'current', health: 'healthy',
        title: 'Servings scaling clamp and rounding rewrite', chars: 43,
        preview: 'src/services/scaling.rs +112 -47',
        meta: ['3 files', 'node n-24', '18m'] },
      { kind: 'code_diff', family: 'evidence', status: 'attention',
        id: 'art-8d1e5440', retention: 'project', freshness: 'current', health: 'healthy',
        title: 'IngredientQuantityEditor stepper accessibility pass', chars: 51,
        preview: 'web/src/lib/components/editor/IngredientQuantityEditor.svelte +64 -21',
        meta: ['1 file', 'lane-c', '35m'] },
      { kind: 'code_diff', family: 'evidence', status: 'stale',
        id: 'art-57cb6b65', retention: 'project', freshness: 'stale', health: 'healthy',
        title: 'Backfill binary for legacy quantity rows', chars: 40,
        preview: 'src/bin/backfill_quantities.rs +203 -0',
        meta: ['1 file', 'node n-31', '3h'] },
      { kind: 'validation_test', family: 'evidence', status: 'ok',
        id: 'art-6a92e037', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'cargo test - import worker suite', chars: 32,
        preview: '214 cases, 1 failed then fixed on retry',
        meta: ['retry 2 of 2', 'lane-b', '5m'] },
      { kind: 'validation_test', family: 'evidence', status: 'failed',
        id: 'art-347687cf', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'cargo test - full workspace, feature matrix all', chars: 47,
        preview: '1,482 cases, 9 failed, 2 flaky, 41 skipped',
        meta: ['no retry', 'lane-a', '1h'] },
      { kind: 'validation_test', family: 'evidence', status: 'ok',
        id: 'art-aefd8ed0', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'vitest - web components and store contracts', chars: 43,
        preview: '338 cases, 0 failed, coverage 84.2 percent',
        meta: ['retry 1 of 2', 'lane-c', '2h'] },
      { kind: 'screenshot', family: 'evidence', status: 'attention',
        id: 'art-05395e8a', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Recipe editor upload - before/after pair', chars: 40,
        preview: 'media uploader with EXIF strip applied',
        meta: ['2 captures', 'lane-c', '14m'] },
      { kind: 'screenshot', family: 'evidence', status: 'ok',
        id: 'art-1032df7c', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Ingredient quantity stepper at 240px width', chars: 42,
        preview: 'viewport 240x780, dpr 2, theme friendly-dark',
        meta: ['1 capture', 'lane-c', '48m'] },
      { kind: 'before_after_snapshot', family: 'evidence', status: 'ok',
        id: 'art-6f3d4ad3', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Quantity column alignment before and after', chars: 42,
        preview: 'left rail 12px, numeric column right aligned',
        meta: ['2 states', 'node n-24', '52m'] },
      { kind: 'before_after_snapshot', family: 'evidence', status: 'attention',
        id: 'art-a92db469', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Compose service list before and after prune', chars: 43,
        preview: '10 services, 3 removed, 1 renamed in place',
        meta: ['2 states', 'run #47', '1h'] },
      { kind: 'tool_llm_trace', family: 'evidence', status: 'stale',
        id: 'art-a4cd81ed', retention: 'debug_retained', freshness: 'stale', health: 'healthy',
        title: 'normalize_units diagnosis trace', chars: 31,
        preview: '6 tool calls, 2 retries, 1 fallback',
        meta: ['cache miss', 'node n-19', '1h'] },
      { kind: 'tool_llm_trace', family: 'evidence', status: 'ok',
        id: 'art-87de5db4', retention: 'debug_retained', freshness: 'current', health: 'healthy',
        title: 'Scaling rounding hypothesis exploration trace', chars: 45,
        preview: '18 tool calls, 4 retries, 0 fallbacks, 92s',
        meta: ['cache hit', 'node n-24', '2h'] },
      { kind: 'context_snapshot', family: 'evidence', status: 'ok',
        id: 'art-1293925d', retention: 'ephemeral', freshness: 'current', health: 'healthy',
        title: 'Context window snapshot before compaction', chars: 41,
        preview: '182,004 tokens in, 41 messages, 6 pinned',
        meta: ['pre-compact', 'run #47', '1h'] },
      { kind: 'implementation_plan', family: 'evidence', status: 'running',
        id: 'art-1c2698b5', retention: 'project', freshness: 'refreshing', health: 'healthy',
        title: 'Quantity normalisation remediation plan v3', chars: 42,
        preview: '11 steps, 4 done, 2 blocked on approval',
        meta: ['revision 3', 'run #47', '9m'] },
      { kind: 'reasoning_summary', family: 'evidence', status: 'ok',
        id: 'art-2def3f9f', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Why the mixed-fraction collapse reproduced', chars: 42,
        preview: 'summary of 6 candidate causes, 1 confirmed',
        meta: ['redacted 1', 'node n-19', '1h'] },
      { kind: 'suggested_next_steps', family: 'evidence', status: 'attention',
        id: 'art-78ba4cd4', retention: 'ephemeral', freshness: 'current', health: 'healthy',
        title: 'Next steps after the scaling clamp landed', chars: 41,
        preview: '5 suggestions, 2 accepted, 1 dismissed',
        meta: ['advisory', 'run #47', '25m'] },
      { kind: 'document', family: 'evidence', status: 'ok',
        id: 'art-b8d08e09', retention: 'project', freshness: 'current', health: 'healthy',
        title: 'docs/import-normalization.md rewrite draft', chars: 42,
        preview: '1,204 words, 3 diagrams, 2 tables',
        meta: ['draft 2', 'lane-d', '3h'] },
      { kind: 'artifact_version', family: 'evidence', status: 'ok',
        id: 'art-787ab7e5', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'Version 4 of the import remediation bundle', chars: 42,
        preview: 'supersedes v3, 2 members replaced',
        meta: ['v4', 'run #47', '30m'] },
      /* ---- web: 8 ------------------------------------------------------ */
      { kind: 'api_web_call', family: 'web', status: 'ok',
        id: 'art-2ec43a80', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Searching Web: schema.org Recipe microdata', chars: 42,
        preview: 'query = "schema.org Recipe microdata spec"',
        meta: ['cmd.chat.web.search', '5 sources', '12m'],
        provenance: 'Agent searched web because freshness was required for import coverage claims.' },
      { kind: 'api_web_call', family: 'web', status: 'ok',
        id: 'art-5d3683ba', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Fetching Web: seriouseats.com/measurement-conversions', chars: 53,
        preview: '200 OK, 148 KB, text/html, 2 redirects followed',
        meta: ['cmd.chat.web.fetch', '1 source', '18m'],
        provenance: 'Agent fetched the page to quote the cup-to-millilitre table verbatim.' },
      { kind: 'api_web_call', family: 'web', status: 'attention',
        id: 'art-23eebf8a', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Searching Web: USDA FoodData Central portion sizes', chars: 50,
        preview: 'query = "USDA FoodData Central household portion"',
        meta: ['cmd.chat.web.search', '9 sources', '31m'],
        provenance: 'Results disagreed on gram weights, so the agent flagged rather than adopted them.' },
      { kind: 'api_web_call', family: 'web', status: 'failed',
        id: 'art-5262f72d', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Fetching Web: cooking.nytimes.com robots disallow', chars: 49,
        preview: '403 Forbidden, robots.txt disallows /recipes/',
        meta: ['cmd.chat.web.fetch', '0 sources', '44m'],
        provenance: 'Agent stopped at the robots directive and did not retry with another user agent.' },
      { kind: 'api_web_call', family: 'web', status: 'ok',
        id: 'art-8562b56a', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Searching Web: mixed fraction parsing prior art', chars: 47,
        preview: 'query = "parse mixed fraction 1 1/2 to decimal"',
        meta: ['cmd.chat.web.search', '7 sources', '1h'],
        provenance: 'Agent searched web because the local crate index had no fraction parser.' },
      { kind: 'api_web_call', family: 'web', status: 'stale',
        id: 'art-032c702d', retention: 'session', freshness: 'stale', health: 'healthy',
        title: 'Fetching Web: unicode.org/reports/tr35 number formats', chars: 53,
        preview: '200 OK, 1.9 MB, cached copy is 9 days old',
        meta: ['cmd.chat.web.fetch', '1 source', '2d'],
        provenance: 'Cached because the spec is large and changes rarely; refresh before citing.' },
      { kind: 'api_web_call', family: 'web', status: 'prohibited',
        id: 'art-e3ed0ee5', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Fetching Web: paywalled recipe aggregator export API', chars: 52,
        preview: 'blocked before dispatch, no request was sent',
        meta: ['cmd.chat.web.fetch', '0 sources', '2d'],
        provenance: 'Workspace policy prohibits authenticated third-party exports without a grant.' },
      { kind: 'document', family: 'web', status: 'ok',
        id: 'art-4d80e0ec', retention: 'project', freshness: 'current', health: 'healthy',
        title: 'Saved page: schema.org/Recipe reference snapshot', chars: 48,
        preview: '41 KB of extracted text, 12 headings kept',
        meta: ['snapshot', 'run #47', '12m'] },
      /* ---- browser: 5 -------------------------------------------------- */
      { kind: 'browser_recording', family: 'browser', status: 'ok',
        id: 'art-9e00a003', retention: 'debug_retained', freshness: 'current', health: 'healthy',
        title: 'seriouseats.com/engineering/quantity-parsing', chars: 44,
        preview: '42 actions, 3 navigations, 1 download',
        meta: ['redacted 2', 'lane-c', '20m'] },
      { kind: 'browser_recording', family: 'browser', status: 'attention',
        id: 'art-c1ebcb21', retention: 'debug_retained', freshness: 'current', health: 'healthy',
        title: 'localhost:5173/recipes/braised-short-ribs/edit', chars: 46,
        preview: '118 actions, 7 navigations, 2 console errors',
        meta: ['redacted 1', 'lane-c', '38m'] },
      { kind: 'browser_recording', family: 'browser', status: 'failed',
        id: 'art-32503393', retention: 'debug_retained', freshness: 'current', health: 'healthy',
        title: 'staging.tastebook.app/import from paprika export', chars: 48,
        preview: '61 actions, aborted at step 12 of 19',
        meta: ['redacted 4', 'lane-c', '3h'] },
      { kind: 'screenshot', family: 'browser', status: 'ok',
        id: 'art-40c0af2d', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Browser capture: ingredient grid overflow at 320px', chars: 50,
        preview: 'viewport 320x900, dpr 2, theme glass-light',
        meta: ['1 capture', 'lane-c', '41m'] },
      { kind: 'before_after_snapshot', family: 'browser', status: 'ok',
        id: 'art-8df80bd3', retention: 'session', freshness: 'current', health: 'healthy',
        title: 'Editor DOM before and after the stepper patch', chars: 45,
        preview: '2 trees, 41 nodes changed, 3 aria attributes',
        meta: ['2 states', 'lane-c', '36m'] },
      /* ---- bundle: 3 --------------------------------------------------- */
      { kind: 'subagent_lineage', family: 'bundle', status: 'ok',
        id: 'art-bab5e10c', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'Investigation lineage: inv-import-7x', chars: 36,
        preview: '5 members, 3 agents, 2 handoffs, depth 3',
        meta: ['inv-import-7x', 'run #47', '22m'] },
      { kind: 'evidence', family: 'bundle', status: 'ok',
        id: 'art-17241930', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'Evidence bundle: servings scaling clamp regression', chars: 50,
        preview: '6 members, outcome fixed, confidence strong',
        meta: ['inv-scaling-3b', 'run #46', '4h'] },
      { kind: 'failed_attempts', family: 'bundle', status: 'attention',
        id: 'art-928a46c4', retention: 'debug_retained', freshness: 'current', health: 'healthy',
        title: 'Failed attempts before the scaling clamp fix', chars: 44,
        preview: '4 attempts, 3 reverted, 1 partially kept',
        meta: ['inv-scaling-3b', 'run #46', '5h'] },
      /* ---- receipt: 3 -------------------------------------------------- */
      { kind: 'cost_usage', family: 'receipt', status: 'ok',
        id: 'art-f0566699', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'Run #47 token and cost receipt', chars: 30,
        preview: '184,204 in / 22,118 out, $2.41',
        meta: ['measured', 'run #47', '22m'] },
      { kind: 'restore_point', family: 'receipt', status: 'ok',
        id: 'art-5e40d379', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'Pre-migration restore point 0002', chars: 32,
        preview: 'migrations/0002_ratings.sql',
        meta: ['verified', 'run #46', '2h'] },
      { kind: 'hitl_approval', family: 'receipt', status: 'blocked',
        id: 'art-de017da0', retention: 'governed', freshness: 'current', health: 'healthy',
        title: 'Staging deploy approval - awaiting reviewer', chars: 43,
        preview: 'requested 1d ago, 0 of 1 approvals recorded',
        meta: ['pending', 'run #47', '1d'] },

      /* ================================================================= *
       *  STATE VARIETY -- 9 rows, appended so rows[0] never moves.        *
       *  Every row above has a title. That single fact made the panel's   *
       *  hardest question unaskable and four other requirements           *
       *  unrenderable. These nine rows ask it.                            *
       * ================================================================= */

      /* ---- blind spot 15: the identity fallback chain (R3) --------------
         The identity line is spec-wise a COMPUTED field with 19 branches and
         it has been tested with zero of them, because every fixture row
         already carried a title and every version could just print it. The
         envelope guarantees only artifact_id and artifact_type; summary is
         OPTIONAL and 14 of the 19 kinds have no payload contract at all. R3:
         when summary is absent, derive a per-kind label from the 5 strict
         schemas, else fall back to a truncated artifact_id.

         Row 1 has NO title and a summary. A design must build an identity
         from the summary, or from the kind, and decide which.
         Row 2 has NO title, NO summary and NO preview. There is nothing to
         print but a label derived from the kind, or the id -- and
         art-9c4471e2 elided to 12 characters at 240px is not an identity a
         human can act on. That is the real question and it has never been put
         to anyone.

         Both rows keep meta, because meta is not optional in this fixture:
         several versions read meta[0], meta[1] and meta[length-1]
         unconditionally, so a row without it is a crash rather than a design
         question. Missing TITLE is the question; missing meta would just be a
         broken row. */
      { kind: 'tool_llm_trace', family: 'evidence', status: 'ok',
        id: 'art-3ab77f10', retention: 'debug_retained', freshness: 'current', health: 'healthy',
        summary: 'retry ladder for the unit normalisation call, 4 tool calls, 1 fallback',
        preview: '4 tool calls, 1 fallback, 38s',
        meta: ['cache miss', 'node n-27', '14m'] },
      { kind: 'context_snapshot', family: 'evidence', status: 'ok',
        id: 'art-9c4471e2', retention: 'ephemeral', freshness: 'current', health: 'healthy',
        meta: ['pre-compact', 'run #46', '2h'] },

      /* ---- R27 / RAP-020: evicted, and still browsable ------------------
         RAP:L314 and :L2056 -- evicted, missing and selected-but-gone
         artifacts degrade to RECORD-BACKED views. "A missing row is never an
         empty row and never an empty list." Selection persists, so restoring a
         selection whose artifact has since been evicted must render the
         unavailable reason rather than an empty pane. Exactly one version in
         the bakeoff models this (xA2), and only for bundle members. health is
         'unavailable' here, which is the envelope's own word for it: the
         record survives, the payload does not. */
      { kind: 'browser_recording', family: 'browser', status: 'disabled',
        id: 'art-1e08b3d5', retention: 'session', freshness: 'stale', health: 'unavailable',
        title: 'localhost:5173/recipes/import from paprika export', chars: 49,
        preview: 'record only - the trace payload was evicted',
        meta: ['evicted', 'lane-c', '6d'],
        availability: 'evicted', recordOnly: true,
        evictedAt: '2d', evictionReason: 'retention_window_elapsed',
        sentence: 'The payload was evicted after its session retention window. The record is intact.',
        allowedActionIds: ['artifacts.open_record', 'artifacts.show_in_ledger'] },

      /* ---- RAP-032 / RAP-033: generated media, expired ------------------
         There is no generated_media artifact type in the canonical 19
         (audit-artifacts.md:220) -- media rides on screenshot / document /
         evidence envelopes with provider fields in an unconstrained
         type_payload. That gap is carried here rather than papered over: kind
         stays 'screenshot' and the media block sits beside it.

         RAP-033 (:L475) requires provider receipt metadata, hashes, durable
         local refs, ORIGINAL PROVIDER URL REFS and EXPIRY WARNINGS; MiniMax
         Image-01 URL outputs specifically require a 24-hour expiry disclosure,
         and OpenAI/Codex Images 2 requires the account/route distinction plus
         C2PA/SynthID caveats. So a media row needs a persistent expiry
         indicator driven by a REAL CLOCK, not a generic status chip -- and
         this one has already expired, which is the state that actually costs a
         user something. */
      { kind: 'screenshot', family: 'evidence', status: 'failed',
        id: 'art-6d2f90ba', retention: 'ephemeral', freshness: 'stale', health: 'degraded',
        title: 'Generated plating illustration for the braise guide', chars: 51,
        preview: 'provider URL expired 4h ago, no durable local copy was kept',
        meta: ['minimax image-01', 'run #45', '1d'],
        media: {
          provider: 'MiniMax Image-01', route: 'image.generate',
          providerEntryId: 'mm-01-8837f2', accountProfileRef: 'acct-jared-dev',
          mediaRouteId: 'route-img-2',
          urlRef: 'https://provider.example/o/8837f2', durableLocalRef: null,
          sha256: 'sha256:c0ffee11d0d0feed8badf00d1234567890abcdef1122334455667788990aabbc',
          expiresIn: '--', expired: true, expiryWindow: '24h', expiredAgo: '4h',
          provenanceStandard: 'C2PA', provenancePresent: false,
          caveat: 'No C2PA manifest was returned, so provenance cannot be asserted for this image.'
        },
        sentence: 'The provider URL expired 4h ago and no durable copy was kept. Regenerate to restore it.',
        allowedActionIds: ['artifacts.regenerate', 'artifacts.open_receipt'] },

      /* ---- R29: truncation_state and gap rendering ----------------------
         RAP:L2037-L2042 distinguishes FIVE gap classes and forbids inferring
         lost identity from timestamps: unacknowledged tail, exact event, exact
         byte range, bounded sequence range, unknown segment remainder. No
         version renders any of them, and projection_health = degraded had no
         representation anywhere in the bakeoff. This row is degraded AND
         truncated, which are independent facts -- a design that shows one chip
         has to choose, and RAP:L2042 says choosing is not allowed. */
      { kind: 'document', family: 'evidence', status: 'attention',
        id: 'art-b74c1e93', retention: 'project', freshness: 'refreshing', health: 'degraded',
        title: 'Import worker stdout, retry 2 of 2', chars: 34,
        preview: '844 KB captured, tail unacknowledged after byte 812,004',
        meta: ['truncated', 'lane-b', '35m'],
        truncation: {
          state: 'truncated', gapClass: 'unacknowledged_tail',
          classes: ['unacknowledged_tail', 'exact_event', 'exact_byte_range',
                    'bounded_sequence_range', 'unknown_segment_remainder'],
          byteRange: '812004-unknown', sequenceRange: null,
          sentence: 'The tail was never acknowledged. Everything after byte 812,004 is unknown.',
          inferFromTimestamps: false
        },
        degradedReason: 'projection_incomplete' },

      /* ---- R12: the five blocked presentations --------------------------
         RAP:L2060 names five NON-INTERCHANGEABLE reasons and says they must
         not collapse into a generic failure: permission denial,
         approval-required, storage-read-only, integrity-block, preflight-drift.
         The fixture carried one prohibited row and one blocked row, so the
         best any version managed was two and six versions render only a gutter
         mark. These three complete the set.

         Each consumes {blocked_family, blocked_reason_code,
         allowed_action_ids[], permission_snapshot_id?, approval_scope_key?,
         executed:false}. executed:false matters -- none of these ran, so a
         design that renders them as failures is asserting something untrue. */
      { kind: 'restore_point', family: 'receipt', status: 'blocked',
        id: 'art-2f60c8a1', retention: 'governed', freshness: 'current', health: 'degraded',
        title: 'Pre-migration restore point 0003', chars: 32,
        preview: 'storage is read-only, the point cannot be written',
        meta: ['read only', 'run #47', '40m'],
        blockedFamily: 'storage_read_only', blockedReasonCode: 'artifact_storage_read_only',
        executed: false, permissionSnapshotId: 'perm-9a21',
        sentence: 'Artifact storage is mounted read-only. The restore point was not persisted.',
        allowedActionIds: ['artifacts.open_storage_settings', 'artifacts.retry_write'] },
      { kind: 'validation_test', family: 'evidence', status: 'blocked',
        id: 'art-5c19d7e4', retention: 'governed', freshness: 'current', health: 'degraded',
        title: 'cargo test - migrations forward and back', chars: 40,
        preview: 'content hash does not match the recorded digest',
        meta: ['integrity', 'lane-d', '3h'],
        blockedFamily: 'integrity_block', blockedReasonCode: 'artifact_integrity_mismatch',
        executed: false, permissionSnapshotId: null,
        sentence: 'The stored digest does not match this content. Display is blocked until it is re-verified.',
        allowedActionIds: ['artifacts.reverify', 'artifacts.open_record'] },
      { kind: 'evidence', family: 'bundle', status: 'blocked',
        id: 'art-8e33b6c7', retention: 'governed', freshness: 'stale', health: 'degraded',
        title: 'Evidence bundle: EXIF strip panic mitigation', chars: 44,
        preview: 'preflight drift - 2 members changed since the bundle was sealed',
        meta: ['preflight', 'run #44', '9d'],
        blockedFamily: 'preflight_drift', blockedReasonCode: 'artifact_preflight_drift',
        executed: false, approvalScopeKey: 'scope-bundle-export',
        sentence: 'Two members changed after this bundle was sealed. Re-seal it before exporting.',
        allowedActionIds: ['artifacts.reseal_bundle', 'artifacts.open_diff'] },

      /* ---- projection_freshness x projection_health, uncollapsed --------
         refreshing plus degraded on one row. RAP:L2042 says the two axes must
         not collapse, and at 240px research/artifacts.md:213 records there is
         room for exactly ONE indicator -- so the precedence order
         (blocked > expired > degraded > redacted > kind-native > nothing) is a
         decision the owner doc never makes and a design now has to. */
      { kind: 'api_web_call', family: 'web', status: 'attention',
        id: 'art-c1d0472b', retention: 'session', freshness: 'refreshing', health: 'degraded',
        title: 'Searching Web: culinary rounding conventions by locale', chars: 54,
        preview: 'partial result set, 2 of 9 sources timed out',
        meta: ['cmd.chat.web.search', '7 of 9 sources', '52m'],
        degradedReason: 'partial_source_set',
        provenance: 'Agent searched web because locale rounding rules are not in any local source.' }
    ],
    /* The single bundle every version already reads. bundles is the full
       set for versions that want to show more than one. */
    bundle: {
      id: 'inv-import-7x', chars: 13,
      title: 'Mixed-fraction quantity collapse', chars2: 32,
      outcome: 'fixed', confidence: 'strong',
      members: [
        { role: 'baseline',     kind: 'validation_test' },
        { role: 'repro',        kind: 'browser_recording' },
        { role: 'diagnosis',    kind: 'tool_llm_trace' },
        { role: 'fix',          kind: 'code_diff' },
        { role: 'verification', kind: 'validation_test' }
      ]
    },
    bundles: [
      { id: 'inv-import-7x', chars: 13,
        title: 'Mixed-fraction quantity collapse', chars2: 32,
        outcome: 'fixed', confidence: 'strong',
        members: [
          { role: 'baseline',     kind: 'validation_test' },
          { role: 'repro',        kind: 'browser_recording' },
          { role: 'diagnosis',    kind: 'tool_llm_trace' },
          { role: 'fix',          kind: 'code_diff' },
          { role: 'verification', kind: 'validation_test' }
        ] },
      { id: 'inv-scaling-3b', chars: 14,
        title: 'Servings scaling clamp drops the second row', chars2: 43,
        outcome: 'fixed', confidence: 'moderate',
        members: [
          { role: 'baseline',     kind: 'validation_test' },
          { role: 'repro',        kind: 'before_after_snapshot' },
          { role: 'diagnosis',    kind: 'reasoning_summary' },
          { role: 'attempts',     kind: 'failed_attempts' },
          { role: 'fix',          kind: 'code_diff' },
          { role: 'verification', kind: 'validation_test' }
        ] },
      { id: 'inv-exif-strip-panic-11', chars: 23,
        title: 'Thumbnailer panics when EXIF GPS block is malformed', chars2: 51,
        outcome: 'mitigated', confidence: 'weak',
        members: [
          { role: 'baseline',     kind: 'validation_test' },
          { role: 'repro',        kind: 'browser_recording' },
          { role: 'diagnosis',    kind: 'tool_llm_trace' },
          { role: 'fix',          kind: 'code_diff' },
          { role: 'verification', kind: 'screenshot' },
          { role: 'rollback',     kind: 'restore_point' }
        ] }
    ]
  };

  /* -------------------------------------------------------------- file tree
     The File Manager fixture. This is the panel the Cozy Shelves redesign is
     centred on (contract section 11), so it has to be big enough and awkward
     enough to expose the problems the redesign exists to fix. A 48-row, 3-deep
     toy tree cannot tell you whether a design stays readable.

     Shape: one FLAT, depth-first list. Depth is carried by `d`, never by
     nesting, because the tree must be portable to a Slint ListView (which
     recycles) and because a flat model is what makes virtualization honest.

       d   depth 0..9. Mass sits at 3-6, which is what real repos look like.
       t   'folder' | 'file'
       n   display name (folders keep their trailing slash)
       p   full repo-relative path
       g   git status, one char:
             A added    M modified   D deleted   ? untracked
             R renamed  U unmerged   C conflicted (needs resolution)
             ! ignored
       k   row SPECIES beyond plain file/folder - the second axis the spec
           requires and no implementation has:
             symlink | generated | ignored | binary | large-file
             remote | read-only
       x   folders only: 1 expanded, 0 collapsed
       c   collapsed folders only: number of hidden descendants
       s   size label
       m   relative modified time
       q   one short qualification phrase for line 2
       to  symlink target

     Deliberate stress cases, do not "tidy" them away:
       - vendor/tastebook-legacy/... is a nine-folder SINGLE-CHILD chain with no
         files until depth 9. It exercises folder-chain compaction and the
         depth-9 indent cap at the same time.
       - crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/
         tables/ is a second, branching depth-9 chain.
       - backfill_quantities_from_legacy_import.rs,
         RecipeCardWithNutritionFacts.svelte and the ~60 character generated
         snapshot/golden names force middle-elide that must keep the extension.
       - target/ and node_modules/ are present and ignored on purpose: a tree
         that only ever shows tracked source is not the tree users see. */
  var files = {
    root: 'main',
    project: 'tastebook',
    branch: 'feat/legacy-import-replay',
    count: 0,
    paging: { shown: 0, total: 12400, pageSize: 200, initialWindow: 60 },
    species: {
      symlink:     'Symlink',
      generated:   'Generated',
      ignored:     'Ignored',
      binary:      'Binary',
      'large-file': 'Large file',
      remote:      'Remote',
      'read-only': 'Read only'
    },
    tree: [
      /* ---------------------------------------------------------- .cargo */
      { d: 0, t: 'folder', n: '.cargo/', p: '.cargo/', x: 1 },
      { d: 1, t: 'file',   n: 'config.toml', p: '.cargo/config.toml', s: '1.1 kB' },

      /* --------------------------------------------------------- .github */
      { d: 0, t: 'folder', n: '.github/', p: '.github/', x: 1 },
      { d: 1, t: 'folder', n: 'workflows/', p: '.github/workflows/', x: 1 },
      { d: 2, t: 'file',   n: 'ci.yml', p: '.github/workflows/ci.yml', g: 'M', s: '6.4 kB', m: '2h' },
      { d: 2, t: 'file',   n: 'release.yml', p: '.github/workflows/release.yml', s: '3.9 kB' },
      { d: 2, t: 'file',   n: 'nightly-import-replay.yml', p: '.github/workflows/nightly-import-replay.yml', g: 'A', s: '2.2 kB', m: '2h' },
      { d: 2, t: 'file',   n: 'codeql.yml', p: '.github/workflows/codeql.yml', s: '1.4 kB' },
      { d: 1, t: 'folder', n: 'ISSUE_TEMPLATE/', p: '.github/ISSUE_TEMPLATE/', x: 1 },
      { d: 2, t: 'file',   n: 'bug_report.yml', p: '.github/ISSUE_TEMPLATE/bug_report.yml', s: '980 B' },
      { d: 2, t: 'file',   n: 'recipe_import_failure.yml', p: '.github/ISSUE_TEMPLATE/recipe_import_failure.yml', s: '1.3 kB' },
      { d: 1, t: 'file',   n: 'CODEOWNERS', p: '.github/CODEOWNERS', s: '640 B' },
      { d: 1, t: 'file',   n: 'dependabot.yml', p: '.github/dependabot.yml', g: 'A', s: '820 B', m: '1d' },

      /* --------------------------------------------- .puppet (remote work) */
      { d: 0, t: 'folder', n: '.puppet/', p: '.puppet/', x: 1 },
      { d: 1, t: 'folder', n: 'sandbox/', p: '.puppet/sandbox/', k: 'remote', x: 1, q: 'ssh://build-01' },
      { d: 2, t: 'file',   n: 'rustc-cache.idx', p: '.puppet/sandbox/rustc-cache.idx', k: 'remote', s: '2.1 GB', q: 'not fetched' },
      { d: 2, t: 'file',   n: 'target-cache.tar.zst', p: '.puppet/sandbox/target-cache.tar.zst', k: 'remote', s: '14.6 GB', q: 'not fetched' },
      { d: 1, t: 'file',   n: 'session.lock', p: '.puppet/session.lock', k: 'read-only', s: '48 B' },

      /* -------------------------------------------------------- .vscode */
      { d: 0, t: 'folder', n: '.vscode/', p: '.vscode/', x: 0, c: 4 },

      /* --------------------------------------------------------- assets */
      { d: 0, t: 'folder', n: 'assets/', p: 'assets/', x: 1 },
      { d: 1, t: 'folder', n: 'brand/', p: 'assets/brand/', x: 1 },
      { d: 2, t: 'file',   n: 'logo-mark.svg', p: 'assets/brand/logo-mark.svg', s: '4.2 kB' },
      { d: 2, t: 'file',   n: 'logo-wordmark.svg', p: 'assets/brand/logo-wordmark.svg', g: 'M', s: '7.8 kB', m: '6d' },
      { d: 2, t: 'file',   n: 'og-card-template.psd', p: 'assets/brand/og-card-template.psd', k: 'large-file', s: '96 MB', q: 'git-lfs pointer' },
      { d: 1, t: 'folder', n: 'screenshots/', p: 'assets/screenshots/', x: 1 },
      { d: 2, t: 'file',   n: 'recipe-detail@2x.png', p: 'assets/screenshots/recipe-detail@2x.png', k: 'binary', s: '1.8 MB' },
      { d: 2, t: 'file',   n: 'pantry-empty-state@2x.png', p: 'assets/screenshots/pantry-empty-state@2x.png', k: 'binary', g: 'A', s: '1.2 MB', m: '3h' },

      /* --------------------------------------------------------- crates */
      { d: 0, t: 'folder', n: 'crates/', p: 'crates/', x: 1 },

      { d: 1, t: 'folder', n: 'tastebook-api/', p: 'crates/tastebook-api/', x: 1 },
      { d: 2, t: 'file',   n: 'Cargo.toml', p: 'crates/tastebook-api/Cargo.toml', g: 'M', s: '2.4 kB', m: '2h' },
      { d: 2, t: 'folder', n: 'src/', p: 'crates/tastebook-api/src/', x: 1 },
      { d: 3, t: 'file',   n: 'main.rs', p: 'crates/tastebook-api/src/main.rs', s: '3.1 kB' },
      { d: 3, t: 'file',   n: 'lib.rs', p: 'crates/tastebook-api/src/lib.rs', s: '1.9 kB' },
      { d: 3, t: 'file',   n: 'error.rs', p: 'crates/tastebook-api/src/error.rs', g: 'M', s: '5.6 kB', m: '2h' },
      { d: 3, t: 'file',   n: 'state.rs', p: 'crates/tastebook-api/src/state.rs', s: '2.7 kB' },
      { d: 3, t: 'folder', n: 'routes/', p: 'crates/tastebook-api/src/routes/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-api/src/routes/mod.rs', g: 'M', s: '2.1 kB', m: '2h' },
      { d: 4, t: 'file',   n: 'recipes.rs', p: 'crates/tastebook-api/src/routes/recipes.rs', g: 'M', s: '18.4 kB', m: '18m' },
      { d: 4, t: 'file',   n: 'auth.rs', p: 'crates/tastebook-api/src/routes/auth.rs', s: '9.2 kB' },
      { d: 4, t: 'file',   n: 'ratings.rs', p: 'crates/tastebook-api/src/routes/ratings.rs', s: '6.8 kB' },
      { d: 4, t: 'file',   n: 'media_uploads.rs', p: 'crates/tastebook-api/src/routes/media_uploads.rs', g: 'M', s: '11.3 kB', m: '55m' },
      { d: 4, t: 'file',   n: 'pantry.rs', p: 'crates/tastebook-api/src/routes/pantry.rs', g: 'A', s: '7.4 kB', m: '40m' },
      { d: 4, t: 'file',   n: 'search.rs', p: 'crates/tastebook-api/src/routes/search.rs', s: '8.9 kB' },
      { d: 4, t: 'file',   n: 'legacy_import.rs', p: 'crates/tastebook-api/src/routes/legacy_import.rs', g: 'C', s: '12.7 kB', m: '12m', q: 'both modified' },
      { d: 4, t: 'folder', n: 'admin/', p: 'crates/tastebook-api/src/routes/admin/', x: 1 },
      { d: 5, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-api/src/routes/admin/mod.rs', s: '1.2 kB' },
      { d: 5, t: 'file',   n: 'reindex.rs', p: 'crates/tastebook-api/src/routes/admin/reindex.rs', g: 'A', s: '4.4 kB', m: '1h' },
      { d: 5, t: 'file',   n: 'feature_flags.rs', p: 'crates/tastebook-api/src/routes/admin/feature_flags.rs', s: '3.3 kB' },
      { d: 5, t: 'file',   n: 'import_replay_console.rs', p: 'crates/tastebook-api/src/routes/admin/import_replay_console.rs', g: 'A', s: '9.8 kB', m: '35m' },
      { d: 5, t: 'file',   n: 'audit_log.rs', p: 'crates/tastebook-api/src/routes/admin/audit_log.rs', s: '5.6 kB' },
      { d: 5, t: 'file',   n: 'health.rs', p: 'crates/tastebook-api/src/routes/admin/health.rs', s: '1.9 kB' },
      { d: 5, t: 'file',   n: 'queue_inspector.rs', p: 'crates/tastebook-api/src/routes/admin/queue_inspector.rs', g: 'M', s: '6.3 kB', m: '35m' },
      { d: 3, t: 'folder', n: 'middleware/', p: 'crates/tastebook-api/src/middleware/', x: 1 },
      { d: 4, t: 'file',   n: 'auth_layer.rs', p: 'crates/tastebook-api/src/middleware/auth_layer.rs', s: '5.1 kB' },
      { d: 4, t: 'file',   n: 'rate_limit.rs', p: 'crates/tastebook-api/src/middleware/rate_limit.rs', g: 'M', s: '4.7 kB', m: '3h' },
      { d: 4, t: 'file',   n: 'request_id.rs', p: 'crates/tastebook-api/src/middleware/request_id.rs', s: '1.6 kB' },
      { d: 4, t: 'file',   n: 'tracing_layer.rs', p: 'crates/tastebook-api/src/middleware/tracing_layer.rs', s: '2.9 kB' },
      { d: 3, t: 'folder', n: 'dto/', p: 'crates/tastebook-api/src/dto/', x: 1 },
      { d: 4, t: 'file',   n: 'recipe_dto.rs', p: 'crates/tastebook-api/src/dto/recipe_dto.rs', g: 'M', s: '6.2 kB', m: '20m' },
      { d: 4, t: 'file',   n: 'ingredient_dto.rs', p: 'crates/tastebook-api/src/dto/ingredient_dto.rs', g: 'M', s: '4.8 kB', m: '20m' },
      { d: 4, t: 'file',   n: 'pagination.rs', p: 'crates/tastebook-api/src/dto/pagination.rs', s: '1.8 kB' },
      { d: 4, t: 'file',   n: 'openapi_generated.rs', p: 'crates/tastebook-api/src/dto/openapi_generated.rs', k: 'generated', g: 'M', s: '212 kB', q: 'utoipa build step' },
      { d: 2, t: 'folder', n: 'tests/', p: 'crates/tastebook-api/tests/', x: 1 },
      { d: 3, t: 'file',   n: 'routes_recipes.rs', p: 'crates/tastebook-api/tests/routes_recipes.rs', g: 'M', s: '14.1 kB', m: '25m' },
      { d: 3, t: 'file',   n: 'routes_pantry.rs', p: 'crates/tastebook-api/tests/routes_pantry.rs', g: 'A', s: '8.3 kB', m: '40m' },
      { d: 3, t: 'folder', n: 'snapshots/', p: 'crates/tastebook-api/tests/snapshots/', x: 1 },
      { d: 4, t: 'file',   n: 'routes_recipes__list_recipes.snap', p: 'crates/tastebook-api/tests/snapshots/routes_recipes__list_recipes.snap', k: 'generated', s: '3.4 kB' },
      { d: 4, t: 'file',   n: 'routes_recipes__scale_servings_to_twelve_portions_v3.snap.new', p: 'crates/tastebook-api/tests/snapshots/routes_recipes__scale_servings_to_twelve_portions_v3.snap.new', k: 'generated', g: '?', s: '5.9 kB', m: '11m', q: 'insta pending' },
      { d: 4, t: 'file',   n: 'routes_pantry__empty_pantry.snap', p: 'crates/tastebook-api/tests/snapshots/routes_pantry__empty_pantry.snap', k: 'generated', g: 'A', s: '1.1 kB', m: '40m' },

      { d: 1, t: 'folder', n: 'tastebook-core/', p: 'crates/tastebook-core/', x: 1 },
      { d: 2, t: 'file',   n: 'Cargo.toml', p: 'crates/tastebook-core/Cargo.toml', s: '1.7 kB' },
      { d: 2, t: 'folder', n: 'src/', p: 'crates/tastebook-core/src/', x: 1 },
      { d: 3, t: 'file',   n: 'lib.rs', p: 'crates/tastebook-core/src/lib.rs', s: '2.3 kB' },
      { d: 3, t: 'file',   n: 'legacy_qty.rs', p: 'crates/tastebook-core/src/legacy_qty.rs', g: 'D', s: '0 B', m: '1h', q: 'deleted in worktree' },
      { d: 3, t: 'folder', n: 'models/', p: 'crates/tastebook-core/src/models/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-core/src/models/mod.rs', s: '900 B' },
      { d: 4, t: 'file',   n: 'recipe.rs', p: 'crates/tastebook-core/src/models/recipe.rs', g: 'M', s: '12.9 kB', m: '30m' },
      { d: 4, t: 'file',   n: 'ingredient.rs', p: 'crates/tastebook-core/src/models/ingredient.rs', g: 'M', s: '9.6 kB', m: '30m' },
      { d: 4, t: 'file',   n: 'quantity.rs', p: 'crates/tastebook-core/src/models/quantity.rs', g: 'M', s: '15.2 kB', m: '14m' },
      { d: 4, t: 'file',   n: 'unit.rs', p: 'crates/tastebook-core/src/models/unit.rs', s: '7.1 kB' },
      { d: 4, t: 'file',   n: 'pantry_item.rs', p: 'crates/tastebook-core/src/models/pantry_item.rs', g: 'A', s: '4.9 kB', m: '45m' },
      { d: 4, t: 'file',   n: 'rating.rs', p: 'crates/tastebook-core/src/models/rating.rs', s: '3.0 kB' },
      { d: 4, t: 'file',   n: 'user.rs', p: 'crates/tastebook-core/src/models/user.rs', s: '5.5 kB' },
      { d: 3, t: 'folder', n: 'units/', p: 'crates/tastebook-core/src/units/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-core/src/units/mod.rs', s: '1.4 kB' },
      { d: 4, t: 'file',   n: 'convert.rs', p: 'crates/tastebook-core/src/units/convert.rs', g: 'M', s: '11.8 kB', m: '22m' },
      { d: 4, t: 'file',   n: 'density_table.rs', p: 'crates/tastebook-core/src/units/density_table.rs', s: '18.6 kB' },
      { d: 4, t: 'file',   n: 'imperial.rs', p: 'crates/tastebook-core/src/units/imperial.rs', s: '6.3 kB' },
      { d: 4, t: 'file',   n: 'metric.rs', p: 'crates/tastebook-core/src/units/metric.rs', s: '5.2 kB' },
      { d: 4, t: 'folder', n: 'tables/', p: 'crates/tastebook-core/src/units/tables/', x: 1 },
      { d: 5, t: 'file',   n: 'generated_density_map.rs', p: 'crates/tastebook-core/src/units/tables/generated_density_map.rs', k: 'generated', g: 'M', s: '84 kB', q: 'build.rs output' },
      { d: 5, t: 'file',   n: 'volume_to_mass.rs', p: 'crates/tastebook-core/src/units/tables/volume_to_mass.rs', s: '22.4 kB' },
      { d: 5, t: 'file',   n: 'ingredient_density_overrides.rs', p: 'crates/tastebook-core/src/units/tables/ingredient_density_overrides.rs', g: 'A', s: '9.1 kB', m: '2h' },
      { d: 5, t: 'file',   n: 'metric_prefixes.rs', p: 'crates/tastebook-core/src/units/tables/metric_prefixes.rs', s: '2.7 kB' },
      { d: 5, t: 'file',   n: 'legacy_unit_aliases.rs', p: 'crates/tastebook-core/src/units/tables/legacy_unit_aliases.rs', g: 'M', s: '16.3 kB', m: '2h' },
      { d: 5, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-core/src/units/tables/mod.rs', s: '620 B' },
      { d: 3, t: 'folder', n: 'scaling/', p: 'crates/tastebook-core/src/scaling/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-core/src/scaling/mod.rs', s: '1.1 kB' },
      { d: 4, t: 'file',   n: 'servings.rs', p: 'crates/tastebook-core/src/scaling/servings.rs', g: 'M', s: '8.7 kB', m: '19m' },
      { d: 4, t: 'file',   n: 'rounding.rs', p: 'crates/tastebook-core/src/scaling/rounding.rs', g: 'M', s: '6.5 kB', m: '19m' },
      { d: 4, t: 'file',   n: 'pan_geometry.rs', p: 'crates/tastebook-core/src/scaling/pan_geometry.rs', s: '4.2 kB' },
      { d: 4, t: 'folder', n: 'strategies/', p: 'crates/tastebook-core/src/scaling/strategies/', x: 1 },
      { d: 5, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-core/src/scaling/strategies/mod.rs', s: '840 B' },
      { d: 5, t: 'file',   n: 'linear.rs', p: 'crates/tastebook-core/src/scaling/strategies/linear.rs', s: '3.9 kB' },
      { d: 5, t: 'file',   n: 'baker_percentage.rs', p: 'crates/tastebook-core/src/scaling/strategies/baker_percentage.rs', g: 'M', s: '8.4 kB', m: '19m' },
      { d: 5, t: 'file',   n: 'nonlinear_seasoning.rs', p: 'crates/tastebook-core/src/scaling/strategies/nonlinear_seasoning.rs', g: 'A', s: '6.1 kB', m: '19m' },
      { d: 2, t: 'folder', n: 'benches/', p: 'crates/tastebook-core/benches/', x: 1 },
      { d: 3, t: 'file',   n: 'scaling_bench.rs', p: 'crates/tastebook-core/benches/scaling_bench.rs', s: '2.8 kB' },
      { d: 3, t: 'file',   n: 'parse_bench.rs', p: 'crates/tastebook-core/benches/parse_bench.rs', s: '2.1 kB' },

      { d: 1, t: 'folder', n: 'tastebook-import/', p: 'crates/tastebook-import/', x: 1 },
      { d: 2, t: 'file',   n: 'Cargo.toml', p: 'crates/tastebook-import/Cargo.toml', g: 'M', s: '2.0 kB', m: '1h' },
      { d: 2, t: 'folder', n: 'src/', p: 'crates/tastebook-import/src/', x: 1 },
      { d: 3, t: 'file',   n: 'lib.rs', p: 'crates/tastebook-import/src/lib.rs', g: 'M', s: '3.6 kB', m: '1h' },
      { d: 3, t: 'file',   n: 'error.rs', p: 'crates/tastebook-import/src/error.rs', s: '4.1 kB' },
      { d: 3, t: 'folder', n: 'pipeline/', p: 'crates/tastebook-import/src/pipeline/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-import/src/pipeline/mod.rs', g: 'M', s: '5.4 kB', m: '50m' },
      { d: 4, t: 'file',   n: 'stage.rs', p: 'crates/tastebook-import/src/pipeline/stage.rs', s: '3.8 kB' },
      { d: 4, t: 'file',   n: 'dedupe.rs', p: 'crates/tastebook-import/src/pipeline/dedupe.rs', g: 'R', s: '7.2 kB', m: '50m', q: 'was dedup.rs' },
      { d: 4, t: 'file',   n: 'provenance.rs', p: 'crates/tastebook-import/src/pipeline/provenance.rs', g: 'A', s: '5.0 kB', m: '48m' },
      { d: 4, t: 'folder', n: 'legacy/', p: 'crates/tastebook-import/src/pipeline/legacy/', x: 1 },
      { d: 5, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-import/src/pipeline/legacy/mod.rs', g: 'M', s: '4.3 kB', m: '46m' },
      { d: 5, t: 'file',   n: 'schema_v1.rs', p: 'crates/tastebook-import/src/pipeline/legacy/schema_v1.rs', s: '9.9 kB' },
      { d: 5, t: 'file',   n: 'schema_v2.rs', p: 'crates/tastebook-import/src/pipeline/legacy/schema_v2.rs', g: 'M', s: '12.4 kB', m: '44m' },
      { d: 5, t: 'file',   n: 'reader.rs', p: 'crates/tastebook-import/src/pipeline/legacy/reader.rs', s: '6.7 kB' },
      { d: 5, t: 'file',   n: 'errors.rs', p: 'crates/tastebook-import/src/pipeline/legacy/errors.rs', s: '3.1 kB' },
      { d: 5, t: 'file',   n: 'telemetry.rs', p: 'crates/tastebook-import/src/pipeline/legacy/telemetry.rs', g: 'A', s: '4.8 kB', m: '44m' },
      { d: 5, t: 'folder', n: 'normalize/', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/', x: 1 },
      { d: 6, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/mod.rs', g: 'M', s: '3.2 kB', m: '42m' },
      { d: 6, t: 'file',   n: 'whitespace.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/whitespace.rs', s: '1.8 kB' },
      { d: 6, t: 'file',   n: 'synonyms.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/synonyms.rs', g: 'M', s: '14.6 kB', m: '38m' },
      { d: 6, t: 'file',   n: 'punctuation.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/punctuation.rs', s: '2.4 kB' },
      { d: 6, t: 'file',   n: 'numerals.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/numerals.rs', g: 'M', s: '7.3 kB', m: '40m' },
      { d: 6, t: 'file',   n: 'ranges.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/ranges.rs', s: '5.0 kB' },
      { d: 6, t: 'file',   n: 'casing.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/casing.rs', s: '1.6 kB' },
      { d: 6, t: 'folder', n: 'units/', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/', x: 1 },
      { d: 7, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/mod.rs', s: '2.6 kB' },
      { d: 7, t: 'file',   n: 'ambiguous.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/ambiguous.rs', g: 'U', s: '8.1 kB', m: '31m', q: 'unmerged, ours + theirs' },
      { d: 7, t: 'file',   n: 'abbreviations.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/abbreviations.rs', s: '5.3 kB' },
      { d: 7, t: 'folder', n: 'fraction/', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/', x: 1 },
      { d: 8, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/mod.rs', g: 'M', s: '4.0 kB', m: '29m' },
      { d: 8, t: 'file',   n: 'vulgar.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/vulgar.rs', s: '6.9 kB' },
      { d: 8, t: 'file',   n: 'mixed_number.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/mixed_number.rs', g: 'M', s: '7.7 kB', m: '27m' },
      { d: 8, t: 'folder', n: 'tables/', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/tables/', x: 1 },
      { d: 9, t: 'file',   n: 'unicode_vulgar_fractions.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/tables/unicode_vulgar_fractions.rs', k: 'generated', s: '31 kB', q: 'build.rs output' },
      { d: 9, t: 'file',   n: 'mixed_number_forms.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/tables/mixed_number_forms.rs', g: 'A', s: '12.2 kB', m: '26m' },
      { d: 9, t: 'file',   n: 'rounding_targets.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/tables/rounding_targets.rs', s: '3.5 kB' },
      { d: 9, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-import/src/pipeline/legacy/normalize/units/fraction/tables/mod.rs', s: '410 B' },
      { d: 3, t: 'folder', n: 'bin/', p: 'crates/tastebook-import/src/bin/', x: 1 },
      { d: 4, t: 'file',   n: 'backfill_quantities_from_legacy_import.rs', p: 'crates/tastebook-import/src/bin/backfill_quantities_from_legacy_import.rs', g: 'A', s: '16.8 kB', m: '9m' },
      { d: 4, t: 'file',   n: 'reindex_search.rs', p: 'crates/tastebook-import/src/bin/reindex_search.rs', s: '4.6 kB' },
      { d: 4, t: 'file',   n: 'replay_failed_imports.rs', p: 'crates/tastebook-import/src/bin/replay_failed_imports.rs', g: 'A', s: '11.0 kB', m: '15m' },
      { d: 2, t: 'folder', n: 'fixtures/', p: 'crates/tastebook-import/fixtures/', x: 1 },
      { d: 3, t: 'file',   n: 'allrecipes_sample.json', p: 'crates/tastebook-import/fixtures/allrecipes_sample.json', s: '640 kB' },
      { d: 3, t: 'file',   n: 'epicurious_sample.json', p: 'crates/tastebook-import/fixtures/epicurious_sample.json', s: '812 kB' },
      { d: 3, t: 'file',   n: 'legacy_dump_2019.sql', p: 'crates/tastebook-import/fixtures/legacy_dump_2019.sql', k: 'large-file', s: '184 MB', q: 'git-lfs pointer' },
      { d: 3, t: 'file',   n: 'legacy_dump_2019.sql.zst', p: 'crates/tastebook-import/fixtures/legacy_dump_2019.sql.zst', k: 'binary', s: '11.4 MB' },
      { d: 3, t: 'file',   n: 'latest-dump.sql', p: 'crates/tastebook-import/fixtures/latest-dump.sql', k: 'symlink', to: 'legacy_dump_2019.sql', s: '24 B' },

      { d: 1, t: 'folder', n: 'tastebook-search/', p: 'crates/tastebook-search/', x: 1 },
      { d: 2, t: 'file',   n: 'Cargo.toml', p: 'crates/tastebook-search/Cargo.toml', s: '1.5 kB' },
      { d: 2, t: 'folder', n: 'src/', p: 'crates/tastebook-search/src/', x: 1 },
      { d: 3, t: 'file',   n: 'lib.rs', p: 'crates/tastebook-search/src/lib.rs', s: '2.9 kB' },
      { d: 3, t: 'file',   n: 'index.rs', p: 'crates/tastebook-search/src/index.rs', g: 'M', s: '13.7 kB', m: '4h' },
      { d: 3, t: 'file',   n: 'query.rs', p: 'crates/tastebook-search/src/query.rs', g: 'M', s: '10.2 kB', m: '4h' },
      { d: 3, t: 'file',   n: 'tokenizer.rs', p: 'crates/tastebook-search/src/tokenizer.rs', s: '7.8 kB' },
      { d: 3, t: 'folder', n: 'ranking/', p: 'crates/tastebook-search/src/ranking/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-search/src/ranking/mod.rs', s: '1.3 kB' },
      { d: 4, t: 'file',   n: 'bm25.rs', p: 'crates/tastebook-search/src/ranking/bm25.rs', s: '9.4 kB' },
      { d: 4, t: 'file',   n: 'boosts.rs', p: 'crates/tastebook-search/src/ranking/boosts.rs', g: 'M', s: '5.7 kB', m: '4h' },
      { d: 4, t: 'file',   n: 'synonym_expansion.rs', p: 'crates/tastebook-search/src/ranking/synonym_expansion.rs', s: '6.1 kB' },
      { d: 4, t: 'folder', n: 'tables/', p: 'crates/tastebook-search/src/ranking/tables/', x: 1 },
      { d: 5, t: 'file',   n: 'stopwords_en.rs', p: 'crates/tastebook-search/src/ranking/tables/stopwords_en.rs', s: '11.2 kB' },
      { d: 5, t: 'file',   n: 'generated_synonyms.rs', p: 'crates/tastebook-search/src/ranking/tables/generated_synonyms.rs', k: 'generated', s: '96 kB', q: 'build.rs output' },
      { d: 5, t: 'file',   n: 'field_weights.rs', p: 'crates/tastebook-search/src/ranking/tables/field_weights.rs', g: 'M', s: '2.8 kB', m: '4h' },

      { d: 1, t: 'folder', n: 'tastebook-media/', p: 'crates/tastebook-media/', x: 1 },
      { d: 2, t: 'file',   n: 'Cargo.toml', p: 'crates/tastebook-media/Cargo.toml', s: '1.6 kB' },
      { d: 2, t: 'folder', n: 'src/', p: 'crates/tastebook-media/src/', x: 1 },
      { d: 3, t: 'file',   n: 'lib.rs', p: 'crates/tastebook-media/src/lib.rs', s: '2.2 kB' },
      { d: 3, t: 'file',   n: 'exif_strip.rs', p: 'crates/tastebook-media/src/exif_strip.rs', g: 'M', s: '6.6 kB', m: '5h' },
      { d: 3, t: 'file',   n: 'resize_pipeline.rs', p: 'crates/tastebook-media/src/resize_pipeline.rs', g: 'M', s: '14.9 kB', m: '5h' },
      { d: 3, t: 'file',   n: 'blurhash.rs', p: 'crates/tastebook-media/src/blurhash.rs', g: 'A', s: '4.5 kB', m: '5h' },
      { d: 3, t: 'folder', n: 'storage/', p: 'crates/tastebook-media/src/storage/', x: 1 },
      { d: 4, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-media/src/storage/mod.rs', s: '1.0 kB' },
      { d: 4, t: 'file',   n: 's3.rs', p: 'crates/tastebook-media/src/storage/s3.rs', g: 'M', s: '10.8 kB', m: '5h' },
      { d: 4, t: 'file',   n: 'local_fs.rs', p: 'crates/tastebook-media/src/storage/local_fs.rs', s: '5.9 kB' },
      { d: 4, t: 'file',   n: 'signed_url.rs', p: 'crates/tastebook-media/src/storage/signed_url.rs', g: 'A', s: '3.7 kB', m: '5h' },
      { d: 4, t: 'file',   n: 'legacy_local_disk.rs', p: 'crates/tastebook-media/src/storage/legacy_local_disk.rs', g: 'D', s: '0 B', m: '5h', q: 'deleted in worktree' },
      { d: 4, t: 'folder', n: 'variants/', p: 'crates/tastebook-media/src/storage/variants/', x: 1 },
      { d: 5, t: 'file',   n: 'mod.rs', p: 'crates/tastebook-media/src/storage/variants/mod.rs', s: '760 B' },
      { d: 5, t: 'file',   n: 'thumbnail.rs', p: 'crates/tastebook-media/src/storage/variants/thumbnail.rs', g: 'M', s: '5.4 kB', m: '5h' },
      { d: 5, t: 'file',   n: 'hero_crop.rs', p: 'crates/tastebook-media/src/storage/variants/hero_crop.rs', g: 'A', s: '6.9 kB', m: '5h' },
      { d: 5, t: 'file',   n: 'avif_encode.rs', p: 'crates/tastebook-media/src/storage/variants/avif_encode.rs', s: '8.1 kB' },

      { d: 1, t: 'folder', n: 'tastebook-migrate/', p: 'crates/tastebook-migrate/', x: 1 },
      { d: 2, t: 'file',   n: 'Cargo.toml', p: 'crates/tastebook-migrate/Cargo.toml', s: '1.2 kB' },
      { d: 2, t: 'folder', n: 'src/', p: 'crates/tastebook-migrate/src/', x: 1 },
      { d: 3, t: 'file',   n: 'main.rs', p: 'crates/tastebook-migrate/src/main.rs', s: '3.4 kB' },
      { d: 3, t: 'file',   n: 'plan.rs', p: 'crates/tastebook-migrate/src/plan.rs', g: 'M', s: '7.9 kB', m: '1d' },
      { d: 3, t: 'file',   n: 'apply.rs', p: 'crates/tastebook-migrate/src/apply.rs', s: '6.0 kB' },

      /* ----------------------------------------------------------- docs */
      { d: 0, t: 'folder', n: 'docs/', p: 'docs/', x: 1 },
      { d: 1, t: 'file',   n: 'architecture.md', p: 'docs/architecture.md', s: '18.2 kB' },
      { d: 1, t: 'file',   n: 'import-normalization.md', p: 'docs/import-normalization.md', g: 'M', s: '24.6 kB', m: '1h' },
      { d: 1, t: 'file',   n: 'runbook-import-replay.md', p: 'docs/runbook-import-replay.md', g: 'A', s: '9.3 kB', m: '1h' },
      { d: 1, t: 'folder', n: 'adr/', p: 'docs/adr/', x: 1 },
      { d: 2, t: 'file',   n: '0001-postgres-over-sqlite.md', p: 'docs/adr/0001-postgres-over-sqlite.md', s: '4.1 kB' },
      { d: 2, t: 'file',   n: '0002-quantity-as-rational.md', p: 'docs/adr/0002-quantity-as-rational.md', s: '6.8 kB' },
      { d: 2, t: 'file',   n: '0003-svelte-over-react.md', p: 'docs/adr/0003-svelte-over-react.md', s: '5.2 kB' },
      { d: 2, t: 'file',   n: '0004-vendored-legacy-importer.md', p: 'docs/adr/0004-vendored-legacy-importer.md', g: 'A', s: '7.4 kB', m: '2h' },
      { d: 1, t: 'folder', n: 'api/', p: 'docs/api/', x: 1 },
      { d: 2, t: 'file',   n: 'openapi.generated.yaml', p: 'docs/api/openapi.generated.yaml', k: 'generated', g: 'M', s: '186 kB', q: 'cargo xtask openapi' },
      { d: 2, t: 'file',   n: 'errors.md', p: 'docs/api/errors.md', s: '3.9 kB' },

      /* ---------------------------------------------------------- infra */
      { d: 0, t: 'folder', n: 'infra/', p: 'infra/', x: 1 },
      { d: 1, t: 'folder', n: 'terraform/', p: 'infra/terraform/', x: 1 },
      { d: 2, t: 'file',   n: 'main.tf', p: 'infra/terraform/main.tf', g: 'M', s: '8.4 kB', m: '3d' },
      { d: 2, t: 'file',   n: 'variables.tf', p: 'infra/terraform/variables.tf', s: '3.1 kB' },
      { d: 2, t: 'file',   n: 'outputs.tf', p: 'infra/terraform/outputs.tf', s: '1.2 kB' },
      { d: 2, t: 'file',   n: '.terraform.lock.hcl', p: 'infra/terraform/.terraform.lock.hcl', k: 'generated', s: '12.8 kB' },
      { d: 2, t: 'folder', n: 'modules/', p: 'infra/terraform/modules/', x: 1 },
      { d: 3, t: 'folder', n: 'media_bucket/', p: 'infra/terraform/modules/media_bucket/', x: 1 },
      { d: 4, t: 'file',   n: 'main.tf', p: 'infra/terraform/modules/media_bucket/main.tf', s: '4.7 kB' },
      { d: 4, t: 'file',   n: 'iam.tf', p: 'infra/terraform/modules/media_bucket/iam.tf', g: 'M', s: '3.3 kB', m: '3d' },
      { d: 4, t: 'file',   n: 'variables.tf', p: 'infra/terraform/modules/media_bucket/variables.tf', s: '1.5 kB' },
      { d: 3, t: 'folder', n: 'db/', p: 'infra/terraform/modules/db/', x: 1 },
      { d: 4, t: 'file',   n: 'main.tf', p: 'infra/terraform/modules/db/main.tf', s: '6.2 kB' },
      { d: 4, t: 'file',   n: 'backup.tf', p: 'infra/terraform/modules/db/backup.tf', g: 'A', s: '2.6 kB', m: '3d' },
      { d: 1, t: 'folder', n: 'k8s/', p: 'infra/k8s/', x: 1 },
      { d: 2, t: 'folder', n: 'base/', p: 'infra/k8s/base/', x: 1 },
      { d: 3, t: 'file',   n: 'deployment.yaml', p: 'infra/k8s/base/deployment.yaml', g: 'M', s: '5.8 kB', m: '2d' },
      { d: 3, t: 'file',   n: 'service.yaml', p: 'infra/k8s/base/service.yaml', s: '1.1 kB' },
      { d: 3, t: 'file',   n: 'kustomization.yaml', p: 'infra/k8s/base/kustomization.yaml', s: '740 B' },
      { d: 2, t: 'folder', n: 'overlays/', p: 'infra/k8s/overlays/', x: 1 },
      { d: 3, t: 'folder', n: 'staging/', p: 'infra/k8s/overlays/staging/', x: 1 },
      { d: 4, t: 'file',   n: 'kustomization.yaml', p: 'infra/k8s/overlays/staging/kustomization.yaml', s: '860 B' },
      { d: 4, t: 'file',   n: 'patch-replicas.yaml', p: 'infra/k8s/overlays/staging/patch-replicas.yaml', g: 'M', s: '420 B', m: '2d' },
      { d: 3, t: 'folder', n: 'production/', p: 'infra/k8s/overlays/production/', x: 1 },
      { d: 4, t: 'file',   n: 'kustomization.yaml', p: 'infra/k8s/overlays/production/kustomization.yaml', s: '910 B' },
      { d: 4, t: 'file',   n: 'patch-replicas.yaml', p: 'infra/k8s/overlays/production/patch-replicas.yaml', s: '430 B' },
      { d: 4, t: 'file',   n: 'secrets.sops.yaml', p: 'infra/k8s/overlays/production/secrets.sops.yaml', k: 'read-only', s: '2.9 kB', q: 'sops encrypted' },
      { d: 1, t: 'file',   n: 'Dockerfile', p: 'infra/Dockerfile', g: 'M', s: '2.7 kB', m: '6h' },
      { d: 1, t: 'file',   n: 'Dockerfile.web', p: 'infra/Dockerfile.web', s: '1.9 kB' },
      { d: 1, t: 'file',   n: '.dockerignore', p: 'infra/.dockerignore', s: '380 B' },

      /* ----------------------------------------------------- migrations */
      { d: 0, t: 'folder', n: 'migrations/', p: 'migrations/', x: 1 },
      { d: 1, t: 'file',   n: '0001_init.sql', p: 'migrations/0001_init.sql', s: '14.2 kB' },
      { d: 1, t: 'file',   n: '0002_ratings.sql', p: 'migrations/0002_ratings.sql', s: '2.4 kB' },
      { d: 1, t: 'file',   n: '0003_quantity_precision.sql', p: 'migrations/0003_quantity_precision.sql', g: 'M', s: '3.8 kB', m: '1h' },
      { d: 1, t: 'file',   n: '0004_pantry_items.sql', p: 'migrations/0004_pantry_items.sql', g: 'A', s: '4.6 kB', m: '1h' },
      { d: 1, t: 'file',   n: '0005_search_index.sql', p: 'migrations/0005_search_index.sql', g: 'A', s: '5.1 kB', m: '1h' },
      { d: 1, t: 'file',   n: '0006_drop_legacy_qty_columns.sql', p: 'migrations/0006_drop_legacy_qty_columns.sql', g: 'A', s: '1.7 kB', m: '55m' },
      { d: 1, t: 'file',   n: '0007_media_variants.sql', p: 'migrations/0007_media_variants.sql', g: '?', s: '2.2 kB', m: '8m' },
      { d: 1, t: 'folder', n: '.sqlx/', p: 'migrations/.sqlx/', k: 'generated', x: 1 },
      { d: 2, t: 'file',   n: 'query-3f9c1a7b4e2d8f60a1c5b39e77d0248c.json', p: 'migrations/.sqlx/query-3f9c1a7b4e2d8f60a1c5b39e77d0248c.json', k: 'generated', s: '1.8 kB' },
      { d: 2, t: 'file',   n: 'query-8b2e77d0c41f9a3e5602bd8471ce90fa.json', p: 'migrations/.sqlx/query-8b2e77d0c41f9a3e5602bd8471ce90fa.json', k: 'generated', g: 'M', s: '2.1 kB' },
      { d: 2, t: 'file',   n: 'query-c07a52ef913b6d84ff20a17c3e5b9d61.json', p: 'migrations/.sqlx/query-c07a52ef913b6d84ff20a17c3e5b9d61.json', k: 'generated', g: 'A', s: '1.4 kB' },

      /* -------------------------------------------------------- scripts */
      { d: 0, t: 'folder', n: 'scripts/', p: 'scripts/', x: 1 },
      { d: 1, t: 'file',   n: 'dev.sh', p: 'scripts/dev.sh', s: '1.6 kB' },
      { d: 1, t: 'file',   n: 'seed_db.sh', p: 'scripts/seed_db.sh', g: 'M', s: '2.9 kB', m: '2h' },
      { d: 1, t: 'file',   n: 'replay_imports.sh', p: 'scripts/replay_imports.sh', g: 'A', s: '3.4 kB', m: '30m' },
      { d: 1, t: 'file',   n: 'preflight', p: 'scripts/preflight', k: 'symlink', to: '../tools/preflight.sh', s: '21 B' },
      { d: 1, t: 'file',   n: 'lint_all.sh', p: 'scripts/lint_all.sh', s: '1.1 kB' },

      /* --------------------------------------------------------- target */
      { d: 0, t: 'folder', n: 'target/', p: 'target/', k: 'ignored', g: '!', x: 1, q: 'in .gitignore' },
      { d: 1, t: 'folder', n: 'debug/', p: 'target/debug/', k: 'ignored', g: '!', x: 0, c: 8931 },
      { d: 1, t: 'folder', n: 'release/', p: 'target/release/', k: 'ignored', g: '!', x: 1 },
      { d: 2, t: 'file',   n: 'tastebook-api', p: 'target/release/tastebook-api', k: 'binary', g: '!', s: '184 MB' },
      { d: 2, t: 'file',   n: 'tastebook-import', p: 'target/release/tastebook-import', k: 'binary', g: '!', s: '96 MB' },
      { d: 2, t: 'folder', n: 'build/', p: 'target/release/build/', k: 'ignored', g: '!', x: 0, c: 412 },
      { d: 2, t: 'folder', n: 'deps/', p: 'target/release/deps/', k: 'ignored', g: '!', x: 0, c: 3204 },
      { d: 1, t: 'file',   n: '.rustc_info.json', p: 'target/.rustc_info.json', k: 'generated', g: '!', s: '2.4 kB' },
      { d: 1, t: 'file',   n: 'CACHEDIR.TAG', p: 'target/CACHEDIR.TAG', k: 'generated', g: '!', s: '43 B' },

      /* ---------------------------------------------------------- tests */
      { d: 0, t: 'folder', n: 'tests/', p: 'tests/', x: 1 },
      { d: 1, t: 'folder', n: 'e2e/', p: 'tests/e2e/', x: 1 },
      { d: 2, t: 'file',   n: 'recipe_scaling.spec.ts', p: 'tests/e2e/recipe_scaling.spec.ts', g: 'M', s: '9.7 kB', m: '1h' },
      { d: 2, t: 'file',   n: 'import_legacy.spec.ts', p: 'tests/e2e/import_legacy.spec.ts', g: 'M', s: '12.3 kB', m: '1h' },
      { d: 2, t: 'file',   n: 'pantry_flow.spec.ts', p: 'tests/e2e/pantry_flow.spec.ts', g: 'A', s: '7.1 kB', m: '1h' },
      { d: 2, t: 'file',   n: 'auth_smoke.spec.ts', p: 'tests/e2e/auth_smoke.spec.ts', s: '3.6 kB' },
      { d: 2, t: 'folder', n: 'fixtures/', p: 'tests/e2e/fixtures/', x: 1 },
      { d: 3, t: 'file',   n: 'mixed_fractions.json', p: 'tests/e2e/fixtures/mixed_fractions.json', s: '18.4 kB' },
      { d: 3, t: 'file',   n: 'mixed_fractions_wide.json', p: 'tests/e2e/fixtures/mixed_fractions_wide.json', g: '?', s: '46.2 kB', m: '7m' },
      { d: 3, t: 'file',   n: 'seed_users.json', p: 'tests/e2e/fixtures/seed_users.json', s: '2.8 kB' },
      { d: 1, t: 'folder', n: 'integration/', p: 'tests/integration/', x: 1 },
      { d: 2, t: 'file',   n: 'import_replay.rs', p: 'tests/integration/import_replay.rs', g: 'M', s: '16.9 kB', m: '35m' },
      { d: 2, t: 'file',   n: 'search_reindex.rs', p: 'tests/integration/search_reindex.rs', s: '8.8 kB' },
      { d: 2, t: 'file',   n: 'media_pipeline.rs', p: 'tests/integration/media_pipeline.rs', s: '6.4 kB' },
      { d: 2, t: 'folder', n: 'golden/', p: 'tests/integration/golden/', x: 1 },
      { d: 3, t: 'file',   n: 'import_replay__legacy_2019_dump_normalized_output.golden.txt', p: 'tests/integration/golden/import_replay__legacy_2019_dump_normalized_output.golden.txt', k: 'generated', g: 'M', s: '4.2 MB', m: '33m' },
      { d: 3, t: 'file',   n: 'search_reindex__ranking_snapshot.golden.txt', p: 'tests/integration/golden/search_reindex__ranking_snapshot.golden.txt', k: 'generated', s: '840 kB' },
      { d: 1, t: 'folder', n: 'load/', p: 'tests/load/', x: 1 },
      { d: 2, t: 'file',   n: 'k6-recipe-read.js', p: 'tests/load/k6-recipe-read.js', s: '2.2 kB' },
      { d: 2, t: 'file',   n: 'k6-import-burst.js', p: 'tests/load/k6-import-burst.js', g: '?', s: '3.0 kB', m: '5m' },

      /* --------------------------------------------------------- vendor
         Single-child chain, nine folders deep before the first file. This is
         the compaction and indent-cap test case. */
      { d: 0, t: 'folder', n: 'vendor/', p: 'vendor/', x: 1 },
      { d: 1, t: 'folder', n: 'tastebook-legacy/', p: 'vendor/tastebook-legacy/', x: 1 },
      { d: 2, t: 'folder', n: 'src/', p: 'vendor/tastebook-legacy/src/', x: 1 },
      { d: 3, t: 'folder', n: 'main/', p: 'vendor/tastebook-legacy/src/main/', x: 1 },
      { d: 4, t: 'folder', n: 'java/', p: 'vendor/tastebook-legacy/src/main/java/', x: 1 },
      { d: 5, t: 'folder', n: 'com/', p: 'vendor/tastebook-legacy/src/main/java/com/', x: 1 },
      { d: 6, t: 'folder', n: 'tastebook/', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/', x: 1 },
      { d: 7, t: 'folder', n: 'legacy/', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/legacy/', x: 1 },
      { d: 8, t: 'folder', n: 'importer/', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/legacy/importer/', x: 1 },
      { d: 9, t: 'file',   n: 'LegacyQuantityParser.java', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/legacy/importer/LegacyQuantityParser.java', k: 'read-only', s: '38.6 kB', q: 'vendored, do not edit' },
      { d: 9, t: 'file',   n: 'LegacyRecipeReader.java', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/legacy/importer/LegacyRecipeReader.java', k: 'read-only', s: '21.4 kB', q: 'vendored, do not edit' },
      { d: 9, t: 'file',   n: 'LegacyUnitDictionary.java', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/legacy/importer/LegacyUnitDictionary.java', k: 'read-only', s: '55.9 kB', q: 'vendored, do not edit' },
      { d: 9, t: 'file',   n: 'package-info.java', p: 'vendor/tastebook-legacy/src/main/java/com/tastebook/legacy/importer/package-info.java', k: 'read-only', s: '310 B' },

      /* ------------------------------------------------------------ web */
      { d: 0, t: 'folder', n: 'web/', p: 'web/', x: 1 },
      { d: 1, t: 'folder', n: 'src/', p: 'web/src/', x: 1 },
      { d: 2, t: 'file',   n: 'app.html', p: 'web/src/app.html', s: '1.2 kB' },
      { d: 2, t: 'file',   n: 'app.css', p: 'web/src/app.css', g: 'M', s: '6.9 kB', m: '2h' },
      { d: 2, t: 'file',   n: 'hooks.server.ts', p: 'web/src/hooks.server.ts', g: 'M', s: '4.1 kB', m: '2h' },
      { d: 2, t: 'folder', n: 'lib/', p: 'web/src/lib/', x: 1 },
      { d: 3, t: 'folder', n: 'components/', p: 'web/src/lib/components/', x: 1 },
      { d: 4, t: 'file',   n: 'RecipeCard.svelte', p: 'web/src/lib/components/RecipeCard.svelte', g: 'M', s: '8.2 kB', m: '24m' },
      { d: 4, t: 'file',   n: 'RecipeCardWithNutritionFacts.svelte', p: 'web/src/lib/components/RecipeCardWithNutritionFacts.svelte', g: 'A', s: '14.6 kB', m: '21m' },
      { d: 4, t: 'file',   n: 'ServingsScaler.svelte', p: 'web/src/lib/components/ServingsScaler.svelte', g: 'M', s: '7.3 kB', m: '24m' },
      { d: 4, t: 'file',   n: 'IngredientList.svelte', p: 'web/src/lib/components/IngredientList.svelte', s: '5.8 kB' },
      { d: 4, t: 'file',   n: 'StepTimer.svelte', p: 'web/src/lib/components/StepTimer.svelte', g: 'A', s: '4.4 kB', m: '3h' },
      { d: 4, t: 'file',   n: 'PantryBadge.svelte', p: 'web/src/lib/components/PantryBadge.svelte', g: 'A', s: '1.9 kB', m: '3h' },
      { d: 4, t: 'file',   n: 'OldRecipeCard.svelte', p: 'web/src/lib/components/OldRecipeCard.svelte', g: 'D', s: '0 B', m: '24m', q: 'deleted in worktree' },
      { d: 4, t: 'folder', n: 'pantry/', p: 'web/src/lib/components/pantry/', x: 1 },
      { d: 5, t: 'file',   n: 'PantryShelf.svelte', p: 'web/src/lib/components/pantry/PantryShelf.svelte', g: 'A', s: '7.9 kB', m: '3h' },
      { d: 5, t: 'file',   n: 'PantryItemRow.svelte', p: 'web/src/lib/components/pantry/PantryItemRow.svelte', g: 'A', s: '5.3 kB', m: '3h' },
      { d: 5, t: 'file',   n: 'ExpiryChip.svelte', p: 'web/src/lib/components/pantry/ExpiryChip.svelte', g: 'A', s: '2.1 kB', m: '3h' },
      { d: 5, t: 'file',   n: 'PantryEmptyState.svelte', p: 'web/src/lib/components/pantry/PantryEmptyState.svelte', g: '?', s: '1.8 kB', m: '6m' },
      { d: 4, t: 'folder', n: 'editor/', p: 'web/src/lib/components/editor/', x: 1 },
      { d: 5, t: 'file',   n: 'IngredientQuantityEditor.svelte', p: 'web/src/lib/components/editor/IngredientQuantityEditor.svelte', g: 'R', s: '19.7 kB', m: '17m', q: 'was QuantityEditor.svelte' },
      { d: 5, t: 'file',   n: 'RichTextStepEditor.svelte', p: 'web/src/lib/components/editor/RichTextStepEditor.svelte', g: 'M', s: '16.2 kB', m: '17m' },
      { d: 5, t: 'file',   n: 'ImageDropzone.svelte', p: 'web/src/lib/components/editor/ImageDropzone.svelte', s: '6.5 kB' },
      { d: 5, t: 'file',   n: 'StepReorderList.svelte', p: 'web/src/lib/components/editor/StepReorderList.svelte', g: 'M', s: '9.8 kB', m: '17m' },
      { d: 5, t: 'file',   n: 'IngredientRowActions.svelte', p: 'web/src/lib/components/editor/IngredientRowActions.svelte', g: 'A', s: '4.7 kB', m: '17m' },
      { d: 5, t: 'folder', n: 'toolbar/', p: 'web/src/lib/components/editor/toolbar/', x: 1 },
      { d: 6, t: 'file',   n: 'ToolbarRoot.svelte', p: 'web/src/lib/components/editor/toolbar/ToolbarRoot.svelte', s: '3.8 kB' },
      { d: 6, t: 'file',   n: 'UnitToggle.svelte', p: 'web/src/lib/components/editor/toolbar/UnitToggle.svelte', g: 'M', s: '2.6 kB', m: '16m' },
      { d: 6, t: 'file',   n: 'FractionKeypad.svelte', p: 'web/src/lib/components/editor/toolbar/FractionKeypad.svelte', g: 'A', s: '9.1 kB', m: '16m' },
      { d: 6, t: 'file',   n: 'InsertIngredientButton.svelte', p: 'web/src/lib/components/editor/toolbar/InsertIngredientButton.svelte', s: '3.4 kB' },
      { d: 6, t: 'file',   n: 'ToolbarOverflowMenu.svelte', p: 'web/src/lib/components/editor/toolbar/ToolbarOverflowMenu.svelte', g: 'M', s: '5.1 kB', m: '16m' },
      { d: 6, t: 'folder', n: 'icons/', p: 'web/src/lib/components/editor/toolbar/icons/', x: 1 },
      { d: 7, t: 'file',   n: 'bold.svg', p: 'web/src/lib/components/editor/toolbar/icons/bold.svg', s: '420 B' },
      { d: 7, t: 'file',   n: 'italic.svg', p: 'web/src/lib/components/editor/toolbar/icons/italic.svg', s: '390 B' },
      { d: 7, t: 'file',   n: 'fraction-half.svg', p: 'web/src/lib/components/editor/toolbar/icons/fraction-half.svg', g: 'A', s: '510 B', m: '16m' },
      { d: 7, t: 'file',   n: 'index.generated.ts', p: 'web/src/lib/components/editor/toolbar/icons/index.generated.ts', k: 'generated', g: 'M', s: '2.2 kB', q: 'svgo pipeline' },
      { d: 4, t: 'folder', n: 'charts/', p: 'web/src/lib/components/charts/', x: 1 },
      { d: 5, t: 'file',   n: 'NutritionDonut.svelte', p: 'web/src/lib/components/charts/NutritionDonut.svelte', s: '7.6 kB' },
      { d: 5, t: 'file',   n: 'MacroBar.svelte', p: 'web/src/lib/components/charts/MacroBar.svelte', s: '4.3 kB' },
      { d: 5, t: 'file',   n: 'ServingsTrend.svelte', p: 'web/src/lib/components/charts/ServingsTrend.svelte', s: '5.5 kB' },
      { d: 5, t: 'file',   n: 'chartTheme.generated.ts', p: 'web/src/lib/components/charts/chartTheme.generated.ts', k: 'generated', s: '18.7 kB', q: 'token pipeline' },
      { d: 3, t: 'folder', n: 'stores/', p: 'web/src/lib/stores/', x: 1 },
      { d: 4, t: 'file',   n: 'recipeDraft.ts', p: 'web/src/lib/stores/recipeDraft.ts', g: 'C', s: '11.4 kB', m: '13m', q: 'both modified' },
      { d: 4, t: 'file',   n: 'pantry.ts', p: 'web/src/lib/stores/pantry.ts', g: 'A', s: '5.2 kB', m: '3h' },
      { d: 4, t: 'file',   n: 'session.ts', p: 'web/src/lib/stores/session.ts', s: '3.1 kB' },
      { d: 4, t: 'file',   n: 'toast.ts', p: 'web/src/lib/stores/toast.ts', s: '1.7 kB' },
      { d: 3, t: 'folder', n: 'api/', p: 'web/src/lib/api/', x: 1 },
      { d: 4, t: 'file',   n: 'client.ts', p: 'web/src/lib/api/client.ts', g: 'M', s: '6.8 kB', m: '2h' },
      { d: 4, t: 'file',   n: 'schema.generated.ts', p: 'web/src/lib/api/schema.generated.ts', k: 'generated', g: 'M', s: '318 kB', q: 'openapi-typescript' },
      { d: 4, t: 'file',   n: 'errors.ts', p: 'web/src/lib/api/errors.ts', s: '2.4 kB' },
      { d: 3, t: 'folder', n: 'utils/', p: 'web/src/lib/utils/', x: 1 },
      { d: 4, t: 'file',   n: 'format_quantity.ts', p: 'web/src/lib/utils/format_quantity.ts', g: 'M', s: '5.6 kB', m: '15m' },
      { d: 4, t: 'file',   n: 'debounce.ts', p: 'web/src/lib/utils/debounce.ts', s: '780 B' },
      { d: 4, t: 'file',   n: 'locale.ts', p: 'web/src/lib/utils/locale.ts', s: '2.9 kB' },
      { d: 2, t: 'folder', n: 'routes/', p: 'web/src/routes/', x: 1 },
      { d: 3, t: 'file',   n: '+layout.svelte', p: 'web/src/routes/+layout.svelte', g: 'M', s: '4.8 kB', m: '2h' },
      { d: 3, t: 'file',   n: '+layout.server.ts', p: 'web/src/routes/+layout.server.ts', s: '2.1 kB' },
      { d: 3, t: 'file',   n: '+page.svelte', p: 'web/src/routes/+page.svelte', s: '6.3 kB' },
      { d: 3, t: 'folder', n: 'recipes/', p: 'web/src/routes/recipes/', x: 1 },
      { d: 4, t: 'file',   n: '+page.svelte', p: 'web/src/routes/recipes/+page.svelte', g: 'M', s: '9.4 kB', m: '28m' },
      { d: 4, t: 'file',   n: '+page.server.ts', p: 'web/src/routes/recipes/+page.server.ts', g: 'M', s: '3.7 kB', m: '28m' },
      { d: 4, t: 'folder', n: '[slug]/', p: 'web/src/routes/recipes/[slug]/', x: 1 },
      { d: 5, t: 'file',   n: '+page.svelte', p: 'web/src/routes/recipes/[slug]/+page.svelte', g: 'M', s: '13.8 kB', m: '26m' },
      { d: 5, t: 'file',   n: '+page.server.ts', p: 'web/src/routes/recipes/[slug]/+page.server.ts', g: 'M', s: '5.9 kB', m: '26m' },
      { d: 5, t: 'file',   n: '+error.svelte', p: 'web/src/routes/recipes/[slug]/+error.svelte', s: '1.4 kB' },
      { d: 5, t: 'folder', n: 'print/', p: 'web/src/routes/recipes/[slug]/print/', x: 1 },
      { d: 6, t: 'file',   n: '+page.svelte', p: 'web/src/routes/recipes/[slug]/print/+page.svelte', s: '6.7 kB' },
      { d: 6, t: 'file',   n: '+page.server.ts', p: 'web/src/routes/recipes/[slug]/print/+page.server.ts', s: '2.3 kB' },
      { d: 6, t: 'file',   n: 'print.css', p: 'web/src/routes/recipes/[slug]/print/print.css', g: 'M', s: '3.1 kB', m: '26m' },
      { d: 5, t: 'folder', n: 'edit/', p: 'web/src/routes/recipes/[slug]/edit/', x: 1 },
      { d: 6, t: 'file',   n: '+page.svelte', p: 'web/src/routes/recipes/[slug]/edit/+page.svelte', g: 'M', s: '17.5 kB', m: '22m' },
      { d: 6, t: 'file',   n: '+page.server.ts', p: 'web/src/routes/recipes/[slug]/edit/+page.server.ts', g: 'M', s: '8.6 kB', m: '22m' },
      { d: 6, t: 'file',   n: '+error.svelte', p: 'web/src/routes/recipes/[slug]/edit/+error.svelte', s: '1.1 kB' },
      { d: 6, t: 'folder', n: 'components/', p: 'web/src/routes/recipes/[slug]/edit/components/', x: 1 },
      { d: 7, t: 'file',   n: 'EditHeader.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/EditHeader.svelte', s: '3.2 kB' },
      { d: 7, t: 'file',   n: 'UnsavedChangesGuard.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/UnsavedChangesGuard.svelte', g: 'A', s: '2.8 kB', m: '20m' },
      { d: 7, t: 'folder', n: 'panels/', p: 'web/src/routes/recipes/[slug]/edit/components/panels/', x: 1 },
      { d: 8, t: 'file',   n: 'IngredientsPanel.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/panels/IngredientsPanel.svelte', g: 'M', s: '11.1 kB', m: '19m' },
      { d: 8, t: 'file',   n: 'StepsPanel.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/panels/StepsPanel.svelte', s: '9.0 kB' },
      { d: 8, t: 'folder', n: 'fields/', p: 'web/src/routes/recipes/[slug]/edit/components/panels/fields/', x: 1 },
      { d: 9, t: 'file',   n: 'QuantityField.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/panels/fields/QuantityField.svelte', g: 'M', s: '6.4 kB', m: '18m' },
      { d: 9, t: 'file',   n: 'UnitField.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/panels/fields/UnitField.svelte', s: '4.1 kB' },
      { d: 9, t: 'file',   n: 'NoteField.svelte', p: 'web/src/routes/recipes/[slug]/edit/components/panels/fields/NoteField.svelte', g: 'A', s: '2.3 kB', m: '18m' },
      { d: 3, t: 'folder', n: 'pantry/', p: 'web/src/routes/pantry/', x: 1 },
      { d: 4, t: 'file',   n: '+page.svelte', p: 'web/src/routes/pantry/+page.svelte', g: 'A', s: '10.2 kB', m: '3h' },
      { d: 4, t: 'file',   n: '+page.server.ts', p: 'web/src/routes/pantry/+page.server.ts', g: 'A', s: '4.0 kB', m: '3h' },
      { d: 3, t: 'folder', n: 'api/', p: 'web/src/routes/api/', x: 1 },
      { d: 4, t: 'folder', n: 'health/', p: 'web/src/routes/api/health/', x: 1 },
      { d: 5, t: 'file',   n: '+server.ts', p: 'web/src/routes/api/health/+server.ts', s: '640 B' },
      { d: 1, t: 'folder', n: 'static/', p: 'web/static/', x: 1 },
      { d: 2, t: 'file',   n: 'favicon.png', p: 'web/static/favicon.png', k: 'binary', s: '18 kB' },
      { d: 2, t: 'file',   n: 'og-default.jpg', p: 'web/static/og-default.jpg', k: 'binary', s: '340 kB' },
      { d: 2, t: 'folder', n: 'fonts/', p: 'web/static/fonts/', x: 1 },
      { d: 3, t: 'file',   n: 'Inter-Variable.woff2', p: 'web/static/fonts/Inter-Variable.woff2', k: 'binary', s: '268 kB' },
      { d: 3, t: 'file',   n: 'JetBrainsMono-Regular.woff2', p: 'web/static/fonts/JetBrainsMono-Regular.woff2', k: 'binary', s: '92 kB' },
      { d: 1, t: 'folder', n: 'node_modules/', p: 'web/node_modules/', k: 'ignored', g: '!', x: 0, c: 12842 },
      { d: 1, t: 'folder', n: '.svelte-kit/', p: 'web/.svelte-kit/', k: 'generated', g: '!', x: 0, c: 1204 },
      { d: 1, t: 'file',   n: 'package.json', p: 'web/package.json', g: 'M', s: '2.8 kB', m: '2h' },
      { d: 1, t: 'file',   n: 'pnpm-lock.yaml', p: 'web/pnpm-lock.yaml', k: 'generated', g: 'M', s: '412 kB', q: 'lockfile' },
      { d: 1, t: 'file',   n: 'svelte.config.js', p: 'web/svelte.config.js', s: '980 B' },
      { d: 1, t: 'file',   n: 'vite.config.ts', p: 'web/vite.config.ts', g: 'M', s: '1.9 kB', m: '2h' },
      { d: 1, t: 'file',   n: 'tsconfig.json', p: 'web/tsconfig.json', s: '740 B' },
      { d: 1, t: 'file',   n: 'tailwind.config.ts', p: 'web/tailwind.config.ts', s: '2.2 kB' },
      { d: 1, t: 'file',   n: 'playwright.config.ts', p: 'web/playwright.config.ts', g: 'M', s: '1.5 kB', m: '1h' },

      /* --------------------------------------------------- root-level files */
      { d: 0, t: 'file', n: '.DS_Store', p: '.DS_Store', k: 'ignored', g: '!', s: '6.1 kB' },
      { d: 0, t: 'file', n: '.editorconfig', p: '.editorconfig', s: '410 B' },
      { d: 0, t: 'file', n: '.env', p: '.env', k: 'ignored', g: '!', s: '1.4 kB', q: 'values redacted' },
      { d: 0, t: 'file', n: '.env.example', p: '.env.example', g: 'M', s: '1.2 kB', m: '1h' },
      { d: 0, t: 'file', n: '.gitattributes', p: '.gitattributes', s: '320 B' },
      { d: 0, t: 'file', n: '.gitignore', p: '.gitignore', g: 'M', s: '890 B', m: '2h' },
      { d: 0, t: 'file', n: 'CHANGELOG.md', p: 'CHANGELOG.md', g: 'M', s: '31.7 kB', m: '1h' },
      { d: 0, t: 'file', n: 'Cargo.lock', p: 'Cargo.lock', k: 'generated', g: 'M', s: '286 kB', q: 'lockfile' },
      { d: 0, t: 'file', n: 'Cargo.toml', p: 'Cargo.toml', g: 'M', s: '3.2 kB', m: '1h' },
      { d: 0, t: 'file', n: 'LICENSE', p: 'LICENSE', k: 'read-only', s: '11.4 kB' },
      { d: 0, t: 'file', n: 'README.md', p: 'README.md', g: 'M', s: '14.9 kB', m: '2h' },
      { d: 0, t: 'file', n: 'clippy.toml', p: 'clippy.toml', g: 'A', s: '260 B', m: '2h' },
      { d: 0, t: 'file', n: 'current-schema.sql', p: 'current-schema.sql', k: 'symlink', to: 'migrations/0007_media_variants.sql', s: '34 B' },
      { d: 0, t: 'file', n: 'docker-compose.override.yml', p: 'docker-compose.override.yml', g: 'U', s: '1.8 kB', m: '10m', q: 'unmerged, ours + theirs' },
      { d: 0, t: 'file', n: 'docker-compose.yml', p: 'docker-compose.yml', g: 'M', s: '4.6 kB', m: '3h' },
      { d: 0, t: 'file', n: 'justfile', p: 'justfile', g: 'A', s: '2.1 kB', m: '2h' },
      { d: 0, t: 'file', n: 'latest-import-report.html', p: 'latest-import-report.html', k: 'generated', g: '?', s: '1.9 MB', m: '4m' },
      { d: 0, t: 'file', n: 'rust-toolchain.toml', p: 'rust-toolchain.toml', s: '180 B' },
      { d: 0, t: 'file', n: 'rustfmt.toml', p: 'rustfmt.toml', s: '240 B' }
    ]
  };
  files.count = files.tree.length;
  files.paging.shown = files.tree.length;

  /* ------------------------------------------------------------ panel roster
     Canonical ids and labels (FinalGUISpec.md:672). redesign marks the seven
     under test; files and run_debug are carried as untouched peers so the
     harness looks like the app. */
  var panels = [
    { id: 'search',    label: 'Search',         redesign: true  },
    { id: 'source',    label: 'Source Control', redesign: true  },
    { id: 'git',       label: 'GitHub Actions', redesign: true  },
    { id: 'docker',    label: 'Docker Manager', redesign: true  },
    { id: 'tests',     label: 'Testing',        redesign: true  },
    { id: 'agents',    label: 'Agents',         redesign: true  },
    { id: 'artifacts', label: 'Artifacts',      redesign: true  },
    { id: 'files',     label: 'File Manager',   redesign: true  }
  ];

  var themes = [
    { id: 'friendly-dark',  label: 'Friendly Dark',  family: 'friendly', dark: true  },
    { id: 'friendly-light', label: 'Friendly Light', family: 'friendly', dark: false },
    { id: 'glass-dark',     label: 'Glass Dark',     family: 'glass',    dark: true  },
    { id: 'glass-light',    label: 'Glass Light',    family: 'glass',    dark: false },
    { id: 'retro-dark',     label: 'Retro Dark',     family: 'retro',    dark: true  },
    { id: 'retro-light',    label: 'Retro Light',    family: 'retro',    dark: false },
    { id: 'basic-dark',     label: 'Basic Dark',     family: 'basic',    dark: true  },
    { id: 'basic-light',    label: 'Basic Light',    family: 'basic',    dark: false }
  ];

  /* Width tiers follow FinalGUISpec.md:2081 section 12.2. 220 is adversarial:
     it is what the app clamps to today, BELOW the 240px spec floor. It is
     selectable so regressions stay visible, but excluded from the matrix. */
  var widths = [
    { px: 220, label: '220', tier: 'below-spec', adversarial: true },
    { px: 240, label: '240', tier: 'essential' },
    { px: 320, label: '320', tier: 'compact' },
    { px: 380, label: '380', tier: 'standard', isDefault: true },
    { px: 480, label: '480', tier: 'full' }
  ];

  /* bucket(px) -> 0 essential | 1 compact | 2 standard | 3 full.
     Every measurement-dependent decision in every version keys off THIS, not
     off a continuum. That is what makes the designs portable to Slint, which
     cannot measure text mid-layout. */
  function bucket(px) {
    return px < 280 ? 0 : px < 360 ? 1 : px < 480 ? 2 : 3;
  }

  global.PM_DATA = {
    status: status, project: project,
    search: search, source: source, actions: actions, docker: docker,
    tests: tests, agents: agents, artifacts: artifacts, files: files,
    panels: panels, themes: themes, widths: widths, bucket: bucket
  };
})(window);
