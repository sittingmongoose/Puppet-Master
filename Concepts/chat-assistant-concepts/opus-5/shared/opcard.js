/* PMX operation card — Opus 5
 * Global: window.PMXOpCard
 *
 * WHY THIS EXISTS
 * ---------------
 * `reference/screenshots/pm7_popout.png` shows how PMConcept7 renders one unit of tool work, and it
 * is far denser than the one-line "Read file" row this workspace was building from prose alone:
 *
 *     🔍 Searching Web: schema.org Recipe markup coverage 2026        [COMPLETED ✓]
 *     Agent searched web because freshness was required for import coverage claims.
 *     COMMAND          cmd.chat.web.search
 *     PROVIDER         model-native · effective adapter model-native
 *     CACHE            miss
 *     PERMISSION       websearch scope * · granted
 *     COST             included in plan
 *     OPERATION_INPUT  { query: "schema.org Recipe markup coverage 2026" }
 *     [/sources · 5]  [Runtime Artifact ⇱ art-op-web-s1]                              ⌄
 *
 * That screenshot was supplied as loose prose in the original packet and was not indexed as media,
 * so none of it was built: `COMMAND`, `CACHE`, `PERMISSION` and `OPERATION_INPUT` appeared nowhere in
 * this workspace before this module.
 *
 * WHAT THIS IS NOT
 * ----------------
 * It is not a renderer. It returns ONE normalized record and every thread concept lays it out in its
 * own idiom — a spine node, a monospace log line, a card face, a footnote. That is the DRY line the
 * packet asks for: one contract, eight presentations, no shared markup to make them look alike.
 *
 * DERIVED VERSUS AUTHORED
 * -----------------------
 * `PROVIDER`, `PERMISSION` and `COST` are READ FROM THE LIVE SERVICES (PMXRoute, PMXAccess), so
 * switching route or narrowing the access profile changes every operation card in the transcript.
 * Only the facts that cannot be derived — what the operation was handed, whether the cache answered,
 * what it produced, why it ran — are authored on the stage record. Inventing provider or permission
 * text here would let a card claim a grant the access profile does not give.
 */
(function (global) {
  'use strict';

  /* Command ids are concept-local CANDIDATES. The Commands registry is owned elsewhere and this
   * workspace must not edit it, so every id minted here is also recorded in
   * candidate-command-delta.json for the owner to accept, rename or reject. The `cmd.chat.` prefix
   * and dotted-noun shape follow the 75 ids already present in this workspace. */
  var COMMAND_BY_KIND = {
    thought:  'cmd.chat.activity.reasoning_summary',
    read:     'cmd.chat.activity.read',
    search:   'cmd.chat.activity.search',
    web:      'cmd.chat.web.search',
    browser:  'cmd.chat.browser.open_page',
    test:     'cmd.chat.activity.run_suite',
    edit:     'cmd.chat.activity.edit',
    generate: 'cmd.chat.activity.generate',
    verify:   'cmd.chat.activity.verify'
  };

  /* Which capability each kind consumes. `toolsFor(profile)` answers whether the current access
   * profile grants it, so PERMISSION is a real consequence of the profile rather than a label. */
  var TOOL_BY_KIND = {
    thought: null,
    read: 'Read files',
    search: 'Repository search',
    web: 'Web fetch',
    browser: 'Browser inspection',
    test: 'Command execution',
    edit: 'File edits',
    generate: 'File edits',
    verify: 'Command execution'
  };

  function svcOf(ctx, name) {
    return (ctx && ctx.services && ctx.services[name]) || global[name] || null;
  }

  /* ---- PROVIDER ---------------------------------------------------------------------------
   * The reference prints the requested route AND the adapter that actually served it, because the
   * two differ whenever a route falls back — and hiding that difference is how a surface ends up
   * claiming work was done by a model that never saw it. */
  function providerLine(ctx, threadId) {
    var route = svcOf(ctx, 'PMXRoute');
    if (!route || !route.effective) return null;
    var res = null;
    try { res = route.effective(threadId); } catch (e) { res = null; }
    if (!res || !res.effective) return null;
    var req = res.requested || {};
    var eff = res.effective;
    var out = (eff.provider || 'unknown provider') + ' \u00b7 ' + (eff.model || 'unknown model');
    /* The reference prints the adapter line unconditionally. Naming it only on divergence would
     * make the common case look like a different KIND of record instead of the same one agreeing
     * with itself, so it is always printed and divergence is called out explicitly. */
    out += ' \u00b7 effective adapter ' + (eff.model || 'unknown model');
    if (res.differs) {
      out += ' (requested ' + (req.model || 'unknown') + ' on ' + (req.account || 'unknown account') + ')';
    }
    return out;
  }


  /* ---- PERMISSION ------------------------------------------------------------------------- */
  function permissionLine(ctx, threadId, kind) {
    var tool = TOOL_BY_KIND[kind];
    if (!tool) return 'no tool required';
    var access = svcOf(ctx, 'PMXAccess');
    if (!access || !access.toolsFor) return tool + ' \u00b7 unknown';
    /* Grant is a fact about the MODE's tool ceiling (access.js TOOLS_BY_MODE), while the scope shown
     * is the access profile's own line — which already says when a mode has narrowed it. Reading one
     * and printing the other is what keeps "granted" from outliving the profile that allowed it. */
    var mode = null;
    try { mode = ctx && ctx.store ? ctx.store.runtime(threadId, 'mode') : null; } catch (e) { mode = null; }
    var tools = [];
    try { tools = access.toolsFor(mode) || []; } catch (e) { tools = []; }
    var granted = tools.indexOf(tool) >= 0;
    var scope = null;
    try {
      var effA = access.effective ? access.effective(threadId) : null;
      scope = effA ? (effA.line || effA.label || effA.profile) : null;
    } catch (e) { scope = null; }
    return tool + ' \u00b7 scope ' + (scope || '*') + ' \u00b7 ' + (granted ? 'granted' : 'not granted');
  }


  /* ---- COST -------------------------------------------------------------------------------
   * Cost follows the capacity forecast: an operation is "included in plan" only while the account
   * still has included allowance. Once the forecast says the allowance is spent, the same operation
   * is billed, and saying otherwise would understate what running it costs. */
  function costLine(ctx, threadId) {
    var cap = svcOf(ctx, 'PMXCapacity');
    var f = null;
    try { f = cap && cap.forecast ? cap.forecast(threadId) : null; } catch (e) { f = null; }
    if (!f) return 'included in plan';
    /* The forecast is the only thing that knows whether the included allowance can still absorb the
     * work. When it has to hold specialists back, saying "included in plan" without the reserve it
     * is reserving for would overstate what the plan actually covers. */
    if (f.reason) return 'included in plan \u00b7 ' + f.reason;
    return 'included in plan';
  }


  function statusOf(ctx, threadId, stage) {
    var store = ctx && ctx.store;
    var v = store ? store.view(threadId) : null;
    var running = v && v.surfaces && v.surfaces.runningId;
    if (running && running === stage.id) return { key: 'running', label: 'RUNNING' };
    return { key: 'completed', label: 'COMPLETED' };
  }

  /* The count the header prints. While a stage runs, the view holds a partial count that grows,
   * which is what reference 03 shows as `Exploring 5 files` becoming `7 files`. */
  function countOf(ctx, threadId, stage) {
    var store = ctx && ctx.store;
    var v = store ? store.view(threadId) : null;
    var seen = v && v.surfaces && v.surfaces.counts ? v.surfaces.counts[stage.id] : null;
    if (seen == null) return typeof stage.count === 'number' ? stage.count : null;
    return seen;
  }

  /* of(ctx, threadId, stage) -> normalized operation record, or null when the stage carries no
   * operation facts. Returning null rather than a husk matters: a concept must be able to tell the
   * difference between "no operation here" and "an operation with nothing to say about itself". */
  function of(ctx, threadId, stage) {
    if (!stage) return null;
    var op = stage.op;
    if (!op) return null;

    var st = statusOf(ctx, threadId, stage);
    var count = countOf(ctx, threadId, stage);
    var running = st.key === 'running';

    var fields = [
      { key: 'COMMAND', value: COMMAND_BY_KIND[stage.kind] || 'cmd.chat.activity.' + stage.kind },
      { key: 'PROVIDER', value: providerLine(ctx, threadId) || 'unknown' },
      { key: 'CACHE', value: op.cache || 'not applicable' },
      { key: 'PERMISSION', value: permissionLine(ctx, threadId, stage.kind) },
      { key: 'COST', value: costLine(ctx, threadId) },
      { key: 'OPERATION_INPUT', value: op.input || '{}' }
    ];

    var chips = [];
    if (op.sources) chips.push({ kind: 'sources', label: '/sources \u00b7 ' + op.sources, count: op.sources });
    if (op.runtimeArtifact) {
      chips.push({ kind: 'artifact', label: 'Runtime Artifact', artifactId: op.runtimeArtifact });
    }

    return {
      id: stage.id,
      kind: stage.kind,
      /* The header verb carries the tense rule from reference 03: a present participle while the
       * operation runs, past tense once it has finished. */
      verb: running ? op.verb : (stage.label || op.verb),
      target: op.target || '',
      headline: running
        ? (op.verb + ' ' + (op.target || ''))
        : (stage.label || (op.verb + ' ' + (op.target || ''))),
      status: st.key,
      statusLabel: st.label,
      running: running,
      count: count,
      unit: stage.unit || null,
      why: op.why || null,
      fields: fields,
      chips: chips,
      rows: (stage.rows || []).slice(),
      durationMs: stage.durationMs || null
    };
  }

  /* forThread(ctx, threadId) -> every operation on the thread, in authored order. */
  function forThread(ctx, threadId) {
    var data = (ctx && ctx.data) || (global.PMXData && global.PMXData.get());
    var t = data && data.threadById ? data.threadById(threadId) : null;
    var stages = (t && t.activityStages) || [];
    var out = [];
    for (var i = 0; i < stages.length; i++) {
      var rec = of(ctx, threadId, stages[i]);
      if (rec) out.push(rec);
    }
    return out;
  }

  /* The command ids this module mints, so a test and the candidate delta can both read them from
   * one place instead of restating the table. */
  function commandIds() {
    var out = [];
    for (var k in COMMAND_BY_KIND) {
      if (Object.prototype.hasOwnProperty.call(COMMAND_BY_KIND, k)) out.push(COMMAND_BY_KIND[k]);
    }
    return out;
  }

  global.PMXOpCard = {
    of: of,
    forThread: forThread,
    commandIds: commandIds,
    COMMAND_BY_KIND: COMMAND_BY_KIND,
    TOOL_BY_KIND: TOOL_BY_KIND,
    FIELD_ORDER: ['COMMAND', 'PROVIDER', 'CACHE', 'PERMISSION', 'COST', 'OPERATION_INPUT']
  };
})(window);
