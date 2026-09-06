/* Working-animation takes — group a. Registered into window.PM56_WORKING.
   Each take is (ctx) => htmlString. See makeWorkCtx() in app.js for ctx.

   Takes 8..11. Four deliberately different readings of "the assistant is
   working". They share the measured motion vocabulary in motion.css but
   nothing structural:

     8  Step Rail     an accumulating rail of tool discs + bold verb,
                      collapsing to "14 tools used" with a rotating chevron
     9  Word Stream   prose only; tools fold inline as quiet chips
     10 Tool Collapse the tools are the content; an overlapping avatar-stack
                      that fans out on click with a FLIP
     11 Diff Tape     a receipt-printer tape of numeric diff lines

   Patch discipline (renderApp reconciles with pmPatch, it does not
   replace innerHTML):
     - a CSS entrance fires only when a node is genuinely NEW,
     - data-k is the identity that decides "new",
     - anything that must survive the 1050ms tick carries a constant key,
     - anything that must replay on a step change carries the step id.
   ===================================================================== */
(() => {
  'use strict';
  const W = window.PM56_WORKING;
  const M = window.PM56_MOTION;
  const esc = M.esc;

  /* =====================================================================
     8 — STEP RAIL
     ---------------------------------------------------------------------
     The reference mechanic. Measured from sheets/rail3.jpg:
       f0477  old label out, new label in at ~0.3 alpha        (~90ms)
       f0480  new disc begins to grow, ~65ms after the label   (~150ms)
       f0486  disc settled, tint and ring resolved
       f0494+ shimmer band crosses the bold verb only
     and sheets/collapse_rail.jpg for the collapse to "13 tools used" plus
     the chevron rotation, and sheets/hover_open.jpg for hover-to-reopen.
     ===================================================================== */

  /* [gerund, past participle, grey count] — the reference label is always
     "bold verb" + "grey count"; unknown ids (the mcp/skill subjects) fall
     back to the instance's own verb/label/stat. */
  const RAIL = {
    prepare:  ['Preparing',  'Prepared',  '3 checks'],
    think:    ['Thinking',   'Thought',   '4 signals'],
    files:    ['Exploring',  'Explored',  '3 files'],
    search:   ['Searching',  'Searched',  '3 sources'],
    fetch:    ['Fetching',   'Fetched',   '4 pages'],
    browser:  ['Inspecting', 'Inspected', '2 traces'],
    bash:     ['Profiling',  'Profiled',  '3 benchmarks'],
    agents:   ['Delegating', 'Delegated', '2 agents'],
    edit:     ['Making',     'Made',      '3 edits'],
    app:      ['Driving',    'Drove',     '1 inspector'],
    test:     ['Testing',    'Tested',    '14 assertions'],
    validate: ['Validating', 'Validated', '42 checks'],
    render:   ['Rendering',  'Rendered',  '2 artifacts'],
    complete: ['Finishing',  'Finished',  '14 tools']
  };
  const railMeta = (s) => RAIL[s.id] || [s.verb || s.label, s.label, s.stat || ''];

  /* Per-card UI, keyed by ctx.cardId: `pin` (subject index; null = follow
     live/last) and `expanded` (the rows region; null = the default — open
     while running, shut once completed or superseded). The old design had no
     state at all: "opening" a subject emitted inspect-work-step, which
     REWOUND the record (rec.completed flipped false), stranding the card
     with dead discs and no chevron. Pinning is a view concern now and never
     touches the record. */
  const RAIL8_UI = {};
  const rail8Ui = (id) => RAIL8_UI[id] || (RAIL8_UI[id] = { pin: null, expanded: null, _eff: true });

  /* This file loads BEFORE the EXT shim (see build.py), so the actions are
     wired on the first take-8 render instead of at module scope. The
     lifecycle hooks CHAIN the previously-registered handler — orbit.js owns
     one too, and the registry chains declared owners, so replacing it would strand
     orbit's per-card UI. */
  let rail8Wired = false;
  const rail8Wire = () => {
    const EXT = window.PM56_EXT;
    if (rail8Wired || !EXT || !EXT.action) return;
    rail8Wired = true;
    const uiOf = (btn) => {
      const card = btn && btn.closest ? btn.closest('.working-card') : null;
      return card ? rail8Ui(card.dataset.cardUi || 'work') : null;
    };
    EXT.action('rail8-pin', (ctx, btn) => {
      const ui = uiOf(btn); if (!ui) return false;
      const i = Number(btn.dataset.value);
      /* Clicking the CURRENT disc always returns to following the live run
         (the rails equivalent of orbit's core); any other disc pins, and
         clicking the pinned disc again unpins. */
      if (btn.classList.contains('current')) ui.pin = null;
      else ui.pin = ui.pin === i ? null : i;
      ui.expanded = true;
      ctx.renderApp();
      return true;
    });
    EXT.action('rail8-toggle', (ctx, btn) => {
      const ui = uiOf(btn); if (!ui) return false;
      ui.expanded = !ui._eff;
      ctx.renderApp();
      return true;
    });
    /* Only RESET clears the view state — play/complete respect the pin and
       the collapse. Chains orbit.js's reset hook exactly once. */
    {
      // The registry invokes the previous owner once when this hook declines.
      EXT.chainAction('reset-working', (ctx, btn) => {
        const card = btn && btn.closest ? btn.closest('.working-card') : null;
        if (card) { const ui = RAIL8_UI[card.dataset.cardUi]; if (ui) { ui.pin = null; ui.expanded = null; } }
        return false;
      });
    }
  };

  /* Rows come from the INSTANCE (per-occurrence content, duplicates safe)
     and stream against the record's clock exactly like the Orbit panel. */
  const rail8Rows = (ctx, inst) => {
    const rows = inst.rows || [];
    return ctx.completed ? rows : rows.filter((r) => ctx.rowVisible(inst, r));
  };
  const rail8Row = (ctx, inst, r, j, key) => {
    let meta = '';
    if (r.add != null) {
      meta = `<span class="rail8-meta"><b class="rail8-add">+${r.add}</b>${r.del != null ? `<b class="rail8-del">−${r.del}</b>` : ''}</span>`;
    } else if (r.url) {
      meta = `<span class="rail8-meta"><b class="rail8-tag">${esc(r.url)}</b></span>`;
    } else if (r.tag) {
      meta = `<span class="rail8-meta"><b class="rail8-tag">${esc(r.tag)}</b></span>`;
    }
    const body = r.stream
      ? `<span class="rail8-rowtext rail8-prose pm-stream">${M.words(r.text)}</span>`
      : `<span class="rail8-rowtext">${esc(r.text)}</span>`;
    const wrap = ctx.shellRowWrap;
    if (wrap) return wrap(ctx.cardId, inst, r, j, body + meta, key, 'rail8-row', Math.min(j, 6));
    return `<span class="rail8-row pm-materialize" data-k="${key}" style="--pm-stagger:${Math.min(j, 6)}">${body}${meta}</span>`;
  };

  W[8] = (ctx) => {
    rail8Wire();
    const { icon, index, total, completed, running, workReceipt } = ctx;
    const rec = ctx.rec || ctx.state.work;
    const ui = rail8Ui(ctx.cardId);
    const steps = ctx.steps;

    /* An accumulating rail: only STARTED subjects have discs, keyed by uid so
       duplicate subjects never collide and `enter` fires exactly once. */
    const spawned = completed ? steps : steps.slice(0, index + 1);
    const n = spawned.length;
    const superseded = !!rec.supersededBy;
    const expanded = ui.expanded != null ? ui.expanded : (!completed && !superseded);
    ui._eff = expanded;
    const liveIdx = Math.min(index, n - 1);
    const pin = ui.pin != null && ui.pin >= 0 && ui.pin < n ? ui.pin : null;
    const selIdx = pin != null ? pin : liveIdx;
    const sel = steps[selIdx];
    const shut = completed && !expanded;

    const track = spawned.map((s, i) => {
      const cur = !completed && i === liveIdx;
      const cls = 'pm-rail-item rail8-item ' + (cur ? 'current enter' : 'done') + (i === selIdx && pin != null ? ' pinned' : '');
      const st = i < liveIdx ? 'completed' : cur ? 'in progress' : 'completed';
      const statBit = s.stat ? `${s.label} · ${s.stat}` : s.label;
      return `<button type="button" class="${cls}" data-k="ri:${esc(s.uid)}" data-action="rail8-pin" data-value="${i}" data-step-kind="${esc(s.kind)}" data-hover-key="${esc(ctx.cardId + ':r8:' + s.uid)}" data-hover-tip="${esc(statBit + '\n' + s.verb + ' (' + st + ')')}" aria-pressed="${i === selIdx && pin != null ? 'true' : 'false'}" aria-label="${esc(s.label)}${s.stat ? ', ' + esc(s.stat) : ''}">${icon(s.icon, 11)}</button>`;
    }).join('');

    const m = railMeta(sel);
    const past = completed || selIdx < liveIdx;
    const label = shut
      ? `<span class="rail8-head-label" data-k="l8"><span class="rail8-sum">${M.roll(total)} tools used</span></span>`
      : `<span class="rail8-head-label" data-k="l8"><span class="rail8-verb ${running && pin == null && !completed ? 'pm-shimmer' : 'pm-shimmer pm-settled'}" data-k="v8:${esc(sel.uid)}">${esc(past ? m[1] : m[0])}</span><span class="rail8-count" data-k="c8:${esc(sel.uid)}">${esc(sel.stat || m[2])}</span></span>`;

    /* The chevron is a REAL region toggle now — present live and completed,
       and it never touches the record. */
    const chev = `<button type="button" class="rail8-chev ${expanded ? 'open' : ''}" data-k="chev8" data-action="rail8-toggle" data-hover-key="${esc(ctx.cardId + ':chev8')}" data-hover-tip="${esc(expanded ? 'Collapse the detail rows' : 'Show the detail rows')}" aria-expanded="${expanded ? 'true' : 'false'}">${icon('down', 12)}</button>`;

    let under = '';
    if (expanded) under = rail8Rows(ctx, sel).map((r, j) => rail8Row(ctx, sel, r, j, `r8:${sel.uid}:${j}`)).join('');
    else if (completed) under = `<span class="rail8-idle" data-k="idle8">${workReceipt({ elapsed: false })}</span>`;

    return `<div class="rail8 ${completed ? 'done8' : ''}" data-k="rail8" style="--rail8-n:${n}">`
      + `<div class="rail8-head" data-k="rail8-head"><span class="pm-rail rail8-track" data-k="rail8-track">${track}</span><div class="rail8-head-tail" data-k="t8">${label}<span class="rail8-spacer"></span>${chev}</div></div>`
      + `<div class="rail8-under pm-rows${expanded && !completed ? ' rail8-live' : ''}" data-k="u8">${under}</div>`
      + `</div>`;
  };
  W[8].ownsAgents = true;

  /* =====================================================================
     9 — WORD STREAM
     ---------------------------------------------------------------------
     Prose, and effectively nothing else. Measured from sheets/prose_stream.jpg:
     one word arrives every 2 frames (~43-65ms), each word resolving out of
     blur and out of grey on its own rather than the paragraph fading as a
     block. Tool calls are not rows here — they fold into the sentence as
     quiet chips, so the reader never leaves the reading path.

     Only the last three clauses stay mounted; older ones recede by opacity
     (a transition on a surviving node, not a re-entrance).
     ===================================================================== */
  const NARR = {
    prepare: ['I have the thread pinned to ', { i: 'branch', t: 'feature/query-index' }, ' and the tool policy read, so nothing here will surprise us later.'],
    think: ['The shape of this is read-heavy, about ninety-five percent reads, so the real question is selectivity against write pressure.'],
    files: ['Reading ', { i: 'folder-search', t: 'queries.rs' }, ' and ', { i: 'document', t: 'schema.rs' }, ', the fan-out sits exactly where I expected: three call sites resolving events one row at a time.'],
    search: ['I checked ', { i: 'search', t: 'multicolumn index order' }, ' against primary documentation rather than trusting memory on column order.'],
    fetch: ['Pulled ', { i: 'download', t: '4 primary pages' }, ' and kept only the seven sections that actually govern the leading column.'],
    browser: ['On the live dashboard the slow path reproduces cleanly at ', { i: 'globe', t: 'p95 482 ms' }, ', and the console is quiet, so this is the database and not the client.'],
    bash: ['A single ', { i: 'terminal', t: 'EXPLAIN ANALYZE' }, ' over a hundred and twenty-eight thousand rows confirms the sequential scan.'],
    agents: ['I handed the two independent reviews to ', { i: 'users', t: 'Query Analyzer' }, ' and ', { i: 'users', t: 'Schema Reviewer' }, ' so they can read in parallel while I write.'],
    edit: ['Now the change itself. ', { i: 'file-edit', t: 'migration 0043' }, ' adds the tenant-first composite index, and two call sites collapse into one batched query.'],
    app: ['I refreshed the inspector so the planner can see the new index, and it picks it up immediately.'],
    test: ['Replayed the real dashboard workflow at both widths; ', { i: 'flask', t: '14 assertions' }, ' pass with nothing clipped.'],
    validate: ['Everything is green: ', { i: 'check-circle', t: '42 tests' }, ', lint and types clean, and p95 lands at seventy-one milliseconds.'],
    render: ['I rendered the comparison as ', { i: 'chart', t: 'Query Benchmark Dashboard' }, ' so the numbers stay inspectable instead of quoted.'],
    complete: ['That is the whole change: eighty-six percent off p95, three files touched, and the rollback is one dropped index.']
  };

  /* Prose and chips share one cascade counter, so a chip lands on the beat
     the sentence would have given that word. */
  function clause9(tokens, icon) {
    let n = 0, out = '';
    for (const t of tokens) {
      if (typeof t === 'string') { out += M.words(t, n); n += M.wordCount(t); }
      else {
        out += `<span class="ws-chip" style="--pm-stagger:${n}">${icon(t.i, 10)}<b>${esc(t.t)}</b></span>`;
        n += 1;
      }
    }
    return out;
  }

  W[9] = (ctx) => {
    const { steps, index, running, completed, icon, formatElapsed, elapsed } = ctx;
    const from = Math.max(0, index - 2);
    let body = '';
    for (let i = from; i <= index; i++) {
      const s = steps[i];
      const tokens = NARR[s.id] || [s.detail];
      /* data-step-kind re-resolves --pm-step inside the clause, so each
         sentence keeps the hue of the tool it is describing. */
      body += `<span class="ws-clause pm-stream" data-k="wc:${s.id}" data-step-kind="${esc(s.kind)}" data-age="${index - i}">`
        + clause9(tokens, icon)
        + (i === index && running ? `<span class="ws-caret" data-k="ws-caret"></span>` : '')
        + `</span>`;
    }
    const coda = completed
      ? `<span class="ws-coda" data-k="ws-coda">Worked for ${esc(formatElapsed(elapsed))} · 14 tools · 3 files · 2 agents · 42 tests · 2 artifacts.</span>`
      : '';
    return `<div class="ws9" data-k="ws9"><div class="ws9-flow" data-k="ws9-flow">${body}</div>${coda}</div>`;
  };
  W[9].ownsAgents = true;

  /* =====================================================================
     10 — TOOL COLLAPSE
     ---------------------------------------------------------------------
     Inverse emphasis: the tools are the subject, the prose is a footnote.
     A live avatar-stack of tool discs grows as the run proceeds behind a
     rolling "N tools used"; clicking unpacks it into a full row.

     The fan state is take-local, held here rather than in app state, and
     is re-emitted into the class list every render so the 1050ms tick
     cannot silently close it. The unpack itself is a real FLIP: measure,
     swap the margins, invert, play.
     ===================================================================== */
  let fanOpen = false;
  const A = (window.PM56_A = window.PM56_A || {});
  A.fan = function (el) {
    const root = el.closest ? el.closest('.tc10') : null;
    if (!root) return;
    const items = Array.prototype.slice.call(root.querySelectorAll('.tc10-item'));
    fanOpen = !fanOpen;
    const mutate = () => { root.classList.toggle('fanned', fanOpen); };
    if (M.reduced()) mutate();
    else M.flip(items, mutate, { duration: 340, easing: 'cubic-bezier(.22,.80,.28,1)' });
  };

  W[10] = (ctx) => {
    const { steps, index, completed, running, icon, commandForStep, step } = ctx;
    const list = completed ? steps : steps.slice(0, index + 1);
    const n = list.length;

    /* Run order, right-anchored. Reversing the list made every disc move --
       which was the point -- but it also made the unpacked summary read
       backwards, with "Preparing" last. Anchoring the pile on its right edge
       gets the same displacement from chronological order: tools append at
       the end, the right edge stays put, so everything already in the pile
       slides left to make room. data-flip-move plays that back over 420ms
       instead of teleporting; the key is the step id, which never changes,
       so a disc that MOVES is never also re-mounted -- only the genuinely
       new one pops. Newest sits on top, so z-index climbs with position. */
    const shown = list;
    const stack = shown.map((s, i) => {
      const live = !completed && i === n - 1;
      return `<span class="tc10-item ${live ? 'live' : ''}" data-flip-move data-k="tk:${s.id}" style="z-index:${i + 1}" title="${esc(s.label)}">${icon(s.icon, 13)}</span>`;
    }).join('');

    const names = shown.map((s, i) => `<span class="tc10-name" data-k="tn:${s.id}" style="--pm-stagger:${i}">${esc(s.label)}</span>`).join('');

    return `<div class="tc10 ${fanOpen ? 'fanned' : ''} ${completed ? 'done10' : ''}" data-k="tc10">`
      + `<div class="tc10-top" data-k="tc10-top"><span class="tc10-count"><b>${M.roll(n)}</b> tool${n === 1 ? '' : 's'} used</span><span class="tc10-spacer"></span><button type="button" class="tc10-chev" onclick="PM56_A.fan(this)" data-k="tc10-chev" title="Fan the tool stack out or pack it back">${icon('chevron', 12)}</button></div>`
      + `<div class="tc10-stackwrap" onclick="PM56_A.fan(this)" data-k="tc10-stackwrap" title="Click to unpack the stack"><span class="tc10-stack" data-k="tc10-stack">${stack}</span></div>`
      + `<div class="tc10-foot pm-rows" data-k="tc10-foot">`
      + `<span class="tc10-line" data-k="tl:${step.id}"><b class="${running ? 'pm-shimmer' : 'pm-shimmer pm-settled'}">${esc(step.label)}</b><code>${esc(commandForStep(step))}</code></span>`
      + `<span class="tc10-names" data-k="tc10-names">${names}</span>`
      + `</div></div>`;
  };
  W[10].ownsAgents = true;

  /* =====================================================================
     11 — DIFF TAPE
     ---------------------------------------------------------------------
     Typographic and numeric: no discs, no icons. A receipt tape whose
     newest lines print in at the bottom and push everything above them up
     out of frame. The upward scroll is not a transform — each new row
     animates its own height from zero, so a bottom-anchored clipped column
     does the scrolling for free and every line above moves in step.

     One row per step was too little event: a single work step really
     produces several tape entries, so each step emits two or three — a
     read, a measurement, a write — and they print in sequence, one per
     140ms beat, not as a block. Within a beat the line does two things:
     the paper advances (height 0 -> 20px) and then the ink lands, column
     by column, verb -> path -> leader -> number. The head counters are
     odometers that step once per landing row rather than jumping on the
     handoff frame, so there is something continuous to track while the
     paper moves.

     Numerals roll on change; additions flash green once and deletions red
     once, on the beat their line arrives, then settle to muted.
     ===================================================================== */
  const TAPE = {
    prepare:  [{ v: 'read', p: '.pm/policy.toml',                      k: 'ln', n: 38 },
               { v: 'head', p: 'git · feature/query-index',            k: 'no', n: 1, u: 'ref' },
               { v: 'list', p: 'tools · allowlist',                    k: 'no', n: 9, u: 'tools' }],
    think:    [{ v: 'note', p: 'selectivity vs write pressure',        k: 'no', n: 4, u: 'signals' },
               { v: 'calc', p: 'workload mix · read vs write',         k: 'no', n: '95%', u: 'reads' },
               { v: 'rank', p: 'index shapes · tenant-first',          k: 'no', n: 3, u: 'options' }],
    files:    [{ v: 'read', p: 'src/analytics/queries.rs',             k: 'ln', n: 412 },
               { v: 'read', p: 'src/analytics/schema.rs',              k: 'ln', n: 196 },
               { v: 'grep', p: 'resolve_events · call sites',          k: 'no', n: 3, u: 'sites' }],
    search:   [{ v: 'find', p: 'postgresql.org · multicolumn',         k: 'no', n: 3, u: 'hits' },
               { v: 'find', p: 'postgresql.org · concurrent refresh',  k: 'no', n: 2, u: 'hits' },
               { v: 'keep', p: 'primary sources only',                 k: 'no', n: 5, u: 'kept' }],
    fetch:    [{ v: 'get',  p: 'docs/pg/indexes-multicolumn',          k: 'no', n: 7, u: 'sections' },
               { v: 'get',  p: 'docs/pg/rules-materializedviews',      k: 'no', n: 4, u: 'sections' },
               { v: 'cite', p: 'leading-column rule',                  k: 'no', n: 2, u: 'quotes' }],
    browser:  [{ v: 'open', p: 'dashboard/query-performance',          k: 'no', n: 1, u: 'route' },
               { v: 'trace',p: 'analytics.events · p50',               k: 'ms', n: 96 },
               { v: 'trace',p: 'analytics.events · p95',               k: 'ms', n: 482 }],
    bash:     [{ v: 'gen',  p: 'fixtures/events.ndjson',               k: 'ln', n: 128400 },
               { v: 'plan', p: 'EXPLAIN ANALYZE · seq scan',           k: 'no', n: 0, u: 'index' },
               { v: 'run',  p: 'cargo bench analytics_query',          k: 'ms', n: 482 }],
    agents:   [{ v: 'spawn',p: 'agent/query-analyzer · read-only',     k: 'no', n: 1, u: 'agent' },
               { v: 'spawn',p: 'agent/schema-reviewer · read-only',    k: 'no', n: 1, u: 'agent' },
               { v: 'wait', p: 'two reviews in parallel',              k: 'no', n: 2, u: 'agents' }],
    edit:     [{ v: 'new',  p: 'migrations/0043_tenant_created.sql',   k: 'diff', a: 18, d: 0 },
               { v: 'edit', p: 'src/analytics/queries.rs',             k: 'diff', a: 51, d: 14 },
               { v: 'edit', p: 'src/analytics/bench.rs',               k: 'diff', a: 31, d: 3 }],
    app:      [{ v: 'open', p: 'app/database-inspector',               k: 'no', n: 1, u: 'window' },
               { v: 'sync', p: 'schema · metadata refresh',            k: 'no', n: 1, u: 'refresh' },
               { v: 'check',p: 'planner · idx_tenant_created',         k: 'no', n: 1, u: 'index' }],
    test:     [{ v: 'run',  p: 'query-dashboard.spec · 1280px',        k: 'ok', n: 9 },
               { v: 'run',  p: 'query-dashboard.spec · 720px',         k: 'ok', n: 5 },
               { v: 'pass', p: 'no clipped rows at either width',      k: 'ok', n: 14 }],
    validate: [{ v: 'pass', p: 'cargo test --all',                     k: 'ok', n: 42 },
               { v: 'lint', p: 'clippy · rustfmt · lsp',               k: 'ok', n: 3 },
               { v: 'stat', p: 'working tree · staged',                k: 'no', n: 3, u: 'files' }],
    render:   [{ v: 'make', p: 'artifact/benchmark-dashboard',         k: 'no', n: 2, u: 'artifacts' },
               { v: 'write',p: 'artifact/p95-series.csv',              k: 'ln', n: 128 }],
    complete: [{ v: 'p95',  p: 'analytics.events · 482 ms → 71 ms',    k: 'ms', n: 71 },
               { v: 'drop', p: 'rollback · one index',                 k: 'no', n: 1, u: 'step' }]
  };

  function tape11Right(r) {
    if (r.k === 'diff') return `<b class="dt-add">+${esc(r.a)}</b><b class="dt-del">−${esc(r.d)}</b>`;
    if (r.k === 'ms') return `<b class="dt-ms">${esc(r.n)}</b><i>ms</i>`;
    if (r.k === 'ok') return `<b class="dt-ok">${esc(r.n)}</b><i>ok</i>`;
    if (r.k === 'ln') return `<b class="dt-ln">${esc(r.n.toLocaleString('en-US'))}</b><i>ln</i>`;
    return `<b class="dt-ln">${esc(r.n)}</b><i>${esc(r.u || 'hits')}</i>`;
  }

  /* A head counter that steps once per landing row instead of jumping on
     the handoff frame. seq[0] is the value already on screen; every later
     entry carries `b`, the row index within the step whose beat it should
     land on. The whole odometer is keyed by its final value, so pmPatch
     re-mounts it — and so replays it — exactly when the number really
     changes, and never on the 1050ms tick. */
  function dtOdo(seq, name) {
    const n = seq.length;
    const body = seq.map((s, i) => {
      const outB = i + 1 < n ? seq[i + 1].b : null;
      const cls = ['dt-odo-v'];
      const st = [];
      if (s.b != null) { cls.push('in'); st.push(`--dt-in:${esc(s.b)}`); }
      if (outB != null) { cls.push('out'); st.push(`--dt-out:${esc(outB)}`); }
      else cls.push('now');
      return `<i class="${cls.join(' ')}" style="${st.join(';')}">${esc(s.v)}</i>`;
    }).join('');
    return `<span class="dt-odo" data-k="odo:${esc(name)}:${esc(seq[n - 1].v)}">${body}</span>`;
  }

  W[11] = (ctx) => {
    const { steps, index, completed, formatElapsed, elapsed } = ctx;
    let add = 0, del = 0, touched = 0;
    const rows = [];
    steps.slice(0, index + 1).forEach((s, si) => {
      (TAPE[s.id] || []).forEach((e, j) => {
        if (e.k === 'diff') { add += e.a; del += e.d; touched += 1; }
        rows.push(Object.assign({ sid: s.id, kind: s.kind, j: j, fresh: si === index }, e));
      });
    });

    /* The rows this step is printing right now. Their index within the step
       is both the print beat and the beat the counters step on. */
    const cur = rows.filter((r) => r.fresh);
    const base = rows.length - cur.length;
    const lineSeq = [{ v: base }].concat(cur.map((r, i) => ({ v: base + i + 1, b: r.j })));
    let a0 = add, d0 = del;
    cur.forEach((r) => { if (r.k === 'diff') { a0 -= r.a; d0 -= r.d; } });
    const addSeq = [{ v: a0 }], delSeq = [{ v: d0 }];
    let ar = a0, dr = d0;
    cur.forEach((r) => {
      if (r.k !== 'diff') return;
      if (r.a) { ar += r.a; addSeq.push({ v: ar, b: r.j }); }
      if (r.d) { dr += r.d; delSeq.push({ v: dr, b: r.j }); }
    });

    /* Six 20px rows fit the 120px window. A row further than six from the end
       is behind the clip once the step has finished printing -- but it cannot
       be unmounted, because the column is bottom-anchored and those rows are
       what the new ones push against; dropping them would collapse the tape
       for the length of the print. So it is *retired* instead: it keeps its
       place in flow and stays painted through the print, then takes
       visibility:hidden once it is genuinely behind the edge (dt-retire, 620ms,
       comfortably after the last row reaches full height at 460ms).
       Pixel-wise this changes nothing -- those rows are already clipped, and a
       control render with them deleted is byte-identical. What it changes is
       the geometry: getBoundingClientRect() reports a clipped row at its
       unclipped position, which is above the tape and therefore on top of the
       header, and that had a rect-based probe reporting the header count as
       colliding with a row nobody can see. A retired row is honestly invisible
       to any probe that reads visibility. */
    /* Six when the window is all rows; five once the completion total is in
       it, because that row is 26px plus a 4px rule and eats a row and a half
       of the 120px. */
    const FOLD = completed ? 5 : 6;
    const last = rows.length - 1;
    let tape = rows.map((r, ri) => (
      `<span class="dt-row${r.fresh ? ' fresh' : ''}${ri < rows.length - FOLD ? ' retired' : ''}"`
      + ` data-k="dt:${r.sid}:${r.j}"`
      + ` data-step-kind="${esc(r.kind)}" style="--pm-stagger:${esc(r.j)}">`
      + `<i class="dt-v">${esc(r.v)}</i>`
      + `<i class="dt-p">${esc(r.p)}</i>`
      + `<i class="dt-lead"></i>`
      + `<i class="dt-n">${tape11Right(r)}</i>`
      + (ri === last && !completed ? `<i class="dt-feed" data-k="dt-feed"></i>` : '')
      + `</span>`
    )).join('');

    if (completed) {
      tape += `<span class="dt-row dt-total" data-k="dt:total" style="--pm-stagger:${esc(cur.length)}">`
        + `<i class="dt-v">total</i><i class="dt-p">${esc(touched)} files changed</i><i class="dt-lead"></i>`
        + `<i class="dt-n"><b class="dt-add">+${esc(add)}</b><b class="dt-del">−${esc(del)}</b></i></span>`;
    }

    const head = `<div class="dt-head" data-k="dt-head">`
      + `<span class="dt-clock">${M.roll(formatElapsed(elapsed))}</span>`
      + `<span class="dt-sep">/</span>`
      + `<span class="dt-lines">${dtOdo(lineSeq, 'lines')}<i>lines</i></span>`
      + `<span class="dt-spacer"></span>`
      + `<span class="dt-tot"><b class="dt-add">+${dtOdo(addSeq, 'add')}</b>`
      + `<b class="dt-del">−${dtOdo(delSeq, 'del')}</b></span>`
      + `</div>`;

    return `<div class="dt11 ${completed ? 'done11' : ''}" data-k="dt11">${head}`
      + `<div class="dt-tape" data-k="dt-tape">${tape}</div></div>`;
  };
  W[11].ownsAgents = true;
})();
