/* The Agent transcript kind (D9; CONTRACT section 2; digest 05 sections 6 and 12): a child agent's read-only live
   feed, the chat's Turn Stage feed moved into a tab. One head row (the shared header row): the agent's name, its
   status word and ticking elapsed time, the model as plain text, "Parent: <thread>" and "Read-only · live" with a lock
   glyph (no pill). Below it the feed: prose paragraphs and work stretches (a run of tool calls between two pieces of
   prose collapses into one quiet toggle row with a compact step rail; open, it lists one line per record, and a file
   name in a record opens the editor the D7 way: single click a preview tab, double click a kept one). Other records
   (a policy denial, a queue wait, a tool error, a route change) are plain lines with a glyph, never a coloured side
   stripe. While the tab is visible a working agent keeps streaming: a record or a paragraph every few seconds, the
   feed following the bottom unless the reader scrolled up ("Jump to latest" then waits at the bottom). Nothing moves
   while the tab is hidden, and under Reduced Motion paragraphs land whole and nothing pulses. Sizes key on the tab
   body (@container pmw-body): the step-rail discs hide below 420 px. */

var SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs, kids) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  return add(el, kids);
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? document.createTextNode(String(kids)) : kids);
  return el;
}
function sv(tag, attrs, kids) {
  var el = document.createElementNS(SVGNS, tag);
  for (var k in (attrs || {})) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
  return add(el, kids);
}

/* ---- drawn marks (no emoji, no text glyphs): status marks at 12 px, step glyphs at 10-13 px ---- */
function statusMark(status, size) {
  var s = sv('svg', { viewBox: '0 0 12 12', width: size || 12, height: size || 12, class: 'pmw-tx-smark is-' + status, 'aria-hidden': 'true' });
  if (status === 'working') { s.appendChild(sv('circle', { class: 'pmw-tx-smbg', cx: 6, cy: 6, r: 4.6 })); s.appendChild(sv('path', { class: 'pmw-tx-smarc', d: 'M6 1.4a4.6 4.6 0 0 1 4.6 4.6' })); }
  else if (status === 'complete') { s.appendChild(sv('circle', { cx: 6, cy: 6, r: 4.8 })); s.appendChild(sv('path', { d: 'M3.7 6.1l1.6 1.6 3-3.3' })); }
  else if (status === 'failed') { s.appendChild(sv('circle', { cx: 6, cy: 6, r: 4.8 })); s.appendChild(sv('path', { d: 'M4.3 4.3l3.4 3.4M7.7 4.3 4.3 7.7' })); }
  else if (status === 'blocked') { s.appendChild(sv('circle', { cx: 6, cy: 6, r: 4.8 })); s.appendChild(sv('path', { d: 'M4.8 4.2v3.6M7.2 4.2v3.6' })); }
  else if (status === 'retrying') { s.appendChild(sv('path', { d: 'M10.2 6a4.2 4.2 0 1 1-1.3-3M10.2 1.6v2.2H8' })); }
  else if (status === 'fallback') { s.appendChild(sv('path', { d: 'M2 9.5h3.2L8.5 3.2M6.8 3h2.2v2.2M5.2 9.5h4.8' })); }
  else if (status === 'queued' || status === 'waiting') { s.appendChild(sv('circle', { cx: 6, cy: 6, r: 4.8 })); s.appendChild(sv('path', { d: 'M6 3.6V6l1.6 1.1' })); }
  else s.appendChild(sv('circle', { cx: 6, cy: 6, r: 4.8 }));
  return s;
}
var STEP_PATHS = {
  read: 'M4 2h5.5L12.5 5v9H4zM9.5 2v3h3M6 8h4M6 10.5h3',
  search: 'M7 2.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zM10.2 10.2 13.5 13.5',
  run: 'M3 4.5l3.5 3.5L3 11.5M8.5 12H13',
  edit: 'M3 12.5h2l7-7-2-2-7 7zM9 4.5l2 2',
  check: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM5.6 8.2l1.7 1.7 3.2-3.6',
  test: 'M6.2 2.5h3.6M6.8 2.5v4L3.4 12.6a.8.8 0 0 0 .7 1.2h7.8a.8.8 0 0 0 .7-1.2L9.2 6.5v-4M5 10h6',
  hand: 'M8 10.5V2.5M5 5.2 8 2.2l3 3M3 9v4.5h10V9',
  agents: 'M2.5 3.5h5v5h-5zM8.5 7.5h5v5h-5z',
  note: 'M3.5 2.5h9v11h-9zM5.5 5.5h5M5.5 8h5M5.5 10.5h3'
};
function stepGlyph(kind, size) {
  var s = sv('svg', { viewBox: '0 0 16 16', width: size || 12, height: size || 12, class: 'pmw-ico pmw-tx-sglyph', 'aria-hidden': 'true', focusable: 'false' });
  s.appendChild(sv('path', { d: STEP_PATHS[kind] || STEP_PATHS.note }));
  return s;
}
var EVENT_KIND = {
  blocked: { icon: 'lock', state: 'warn' },
  waiting: { icon: 'clock', state: 'dim' },
  'tool-error': { icon: 'problems', state: 'bad' },
  'route-change': { icon: 'route', state: 'warn' }
};
function eventGlyph(type) {
  if (type === 'route-change') {
    var s = sv('svg', { viewBox: '0 0 16 16', width: 13, height: 13, class: 'pmw-ico', 'aria-hidden': 'true' });
    s.appendChild(sv('path', { d: 'M2.5 12.5h4l5-8.5M9 3.5h3v3M6.5 12.5h7' }));
    return s;
  }
  return PMW.icon(EVENT_KIND[type] ? EVENT_KIND[type].icon : 'eye', { size: 13, glyph: false });
}

/* ---- the agents (the chat's demo data, data.js:1475-1690; copy kept plain, ids never shown) ---- */
var THREAD_TITLE = { query: 'Query performance', subagents: 'Architecture review', debug: 'Browser debug session' };
var STATUS_WORD = { working: 'Working', blocked: 'Stalled', waiting: 'Waiting', complete: 'Complete', failed: 'Failed', queued: 'Queued', retrying: 'Retrying', fallback: 'Fallback route' };
var TICKS = { working: 1, retrying: 1, fallback: 1, waiting: 1 };
var LIVE_STATES = { working: 1, retrying: 1, fallback: 1 };

function P(text, o) { return Object.assign({ t: 'a', text: text }, o || {}); }
function W(title, detail, o) { return Object.assign({ t: 'w', title: title, detail: detail || '' }, o || {}); }
function E(type, title, detail, o) { return Object.assign({ t: type, title: title, detail: detail || '' }, o || {}); }

var AGENTS = {
  'agent-query': {
    name: 'Query Analyzer', model: 'Claude Sonnet 4.6', status: 'working', elapsed: 126, start: '11:54', thread: 'query',
    current: 'Benchmarking tenant-scoped query alternatives',
    feed: [
      P('I have the read path isolated. Three queries do a full table scan and two of them are inside a per-tenant loop, so the cost scales with tenant count rather than with the page size.'),
      W('Read src/analytics/queries.rs', 'Found three full table scans and two N+1 patterns at lines 128 and 196.', { line: 128, gap: 40 }),
      W('Searched src/analytics for per-tenant loops', '2 call sites, both in dashboard.rs: each calls events_for_tenant() once per tenant.', { gap: 9 }),
      W('Read src/analytics/dashboard.rs', 'The N+1 is at lines 41 and 88; both loops can take one tenant-scoped query.', { line: 41, at: '11:56' }),
      P('The composite index is the safer first step. A materialized view would also work but it adds refresh lag and a second piece of operational state, and the read win is available without it.'),
      P('Column order matters more than I expected here. tenant_id has to lead: every read is tenant-scoped, so it is the highest-selectivity equality predicate, and created_at then serves both the range filter and the ORDER BY without a sort node.'),
      W('Created idx_events_tenant_created on the scratch database', '(tenant_id, created_at) on the benchmark copy, built in 3.1 s. Production is untouched.'),
      W('Ran EXPLAIN ANALYZE on the candidate index', 'Planner switches from Seq Scan to Index Scan using idx_events_tenant_created.', { gap: 18 }),
      W('Ran EXPLAIN ANALYZE with created_at leading', 'The planner keeps a Sort node and reads 9x more pages: the reversed column order loses.', { at: '12:01' }),
      P('Baseline is worse than the ticket said. p95 is 482 ms, not 310 ms — the ticket measured against the old 8x400 benchmark fixture, which is small enough that a sequential scan actually wins.'),
      W('Read benches/fixtures/events.rs', 'The old fixture is 8 tenants x 400 events = 3,200 rows, small enough that a sequential scan wins.'),
      W('Regenerated the benchmark fixture', '214 tenants x 600 events = 128,400 rows, matching production row shape.', { edits: 'benches/fixtures/events.rs', gap: 31 }),
      W('Ran the read benchmark', '3 cold and 3 warm runs per variant. p95 482 ms to 71 ms, p50 118 ms to 24 ms.', { at: '12:06' }),
      P('With the corrected fixture: p95 482 ms to 71 ms, p50 118 ms to 24 ms. Throughput goes from 1,420 to 3,980 rows per second.'),
      P('The honest cost is on the write side. Inserts are 4.8% slower with the extra index, measured over 50,000 inserts. That is worth stating next to the read win rather than only reporting the improvement.'),
      W('Ran the insert benchmark', '50,000 inserts with the index and 50,000 without, on the same fixture.'),
      W('Checked write amplification', '+4.8% insert cost across 50,000 inserts; no change to the p99 tail.', { gap: 12 }),
      W('Ran the analytics test suite', '42 passed, 0 failed (cargo test -p analytics) with the index in place.', { at: '12:13' }),
      P('One caveat for the migration: CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block, so it has to be its own migration file rather than part of the batch.'),
      P('I also want to say what I did not test. I have not measured this under concurrent write load, and I have not checked whether the index survives a statistics refresh with the current autovacuum settings. Both are cheap to check and both are ways this quietly regresses later, so I would rather flag them than let the benchmark read as more complete than it is.'),
      W('Handed the benchmark artifact to the parent', 'Query Benchmark Dashboard version 6 · read win and write cost recorded together.'),
      W('Benchmarking the index under concurrent writes', '4 writer threads beside the read benchmark, run 2 of 3. The first run held p95 at 74 ms.', { gap: 16 })
    ],
    tail: [
      W('Measured p95 under concurrent writes', 'Run 2 of 3 held p95 at 76 ms with 4 writer threads beside the reads.', { doing: 'Measuring p95 under concurrent writes' }),
      W('Ran the concurrent benchmark again', 'Run 3 of 3: p95 73 ms, p99 118 ms. Inserts kept their 4.8% cost.', { doing: 'Running the concurrent benchmark again' }),
      P('Concurrent writes barely move the read win: p95 stays between 73 and 76 ms across three runs with four writers, against 71 ms on a quiet table.'),
      W('Refreshed statistics with ANALYZE events', 'The same pass autovacuum would run, by hand, on the 128,400-row fixture.', { doing: 'Refreshing statistics with ANALYZE events' }),
      W('Ran EXPLAIN ANALYZE after the statistics refresh', 'The planner still picks idx_events_tenant_created: Index Scan, no Sort node.', { doing: 'Checking the plan after the statistics refresh' }),
      P('The index also survives a statistics refresh: after ANALYZE the planner keeps the Index Scan and the plan is unchanged. Both gaps I flagged are now measured rather than assumed.'),
      W('Handed the concurrency results to the parent', 'Three runs and the plan after ANALYZE, added to the benchmark dashboard as version 7.', { doing: 'Handing the concurrency results to the parent' }),
      P('Done. The read win holds under concurrent writes and after a statistics refresh, and the write cost stays at 4.8%. Nothing else is open on my side.'),
      { t: 'status', status: 'complete' }
    ]
  },
  'agent-schema': {
    name: 'Schema Reviewer', model: 'Qwen 3.8', status: 'blocked', elapsed: 101, start: '11:59', thread: 'query',
    standing: { state: 'warn', icon: 'lock', text: 'Stalled: production schema modification requires an explicit user override.' },
    feed: [
      W('Read src/analytics/schema.rs', 'Identified three denormalization candidates and one unused foreign key.'),
      P('The payload column is the real weight here: unbounded JSON is 61% of the average row width, which is why the sequential scan was so expensive in the first place.'),
      P('Dropping events_hourly_fk is safe — nothing references the rollup table any more once the composite index lands. Partitioning on created_at is the larger change and should not ride along with this one.'),
      E('blocked', 'Policy denial', 'Production schema modification requires an explicit user override. I stopped before the ALTER rather than asking for forgiveness.'),
      P('I am stopping here rather than proposing a workaround. The next safe action is a user decision on whether the payload bound applies to existing rows or only to new writes; I cannot make that call from inside a read-only review.')
    ]
  },
  'agent-bench': {
    name: 'Benchmark Runner', model: 'Kimi K3', status: 'queued', elapsed: 0, start: '13:28', thread: 'query',
    standing: { icon: 'clock', text: 'Queued, position 1: the 128,400-row fixture is still being generated by Query Analyzer.' },
    feed: [
      E('waiting', 'Queued', 'Position 1 · waiting on the fixture rebuild before any measurement is meaningful.'),
      P('I am not going to run against the old fixture just to have a number. An 8x400 fixture makes a sequential scan look competitive, which is exactly the measurement error that produced the original ticket.'),
      P('Plan once the fixture lands: three cold runs, three warm runs, and a separate insert benchmark so the write cost is measured rather than inferred.'),
      E('waiting', 'Still queued', 'No work started · no tokens spent · nothing to report yet.')
    ]
  },
  'agent-migration': {
    name: 'Migration Auditor', model: 'Claude Opus 5', status: 'complete', elapsed: 262, start: '11:32', thread: 'query',
    feed: [
      P('I read every migration from 0038 forward. The batch pattern this project uses wraps each file in a transaction, which is incompatible with CREATE INDEX CONCURRENTLY.'),
      W('Read migrations/0038..0042', 'All five are transactional; none use CONCURRENTLY.'),
      P('So 0043 has to be split out and marked no-transaction. That is the one required change, and it is a change to the migration harness expectation, not to the SQL.'),
      P('I also rehearsed the rollback. DROP INDEX CONCURRENTLY works and leaves the table readable throughout; the test now asserts both directions rather than only the forward one.'),
      W('Rollback rehearsed', 'apply, assert the index exists, roll back, assert it is gone, apply again. 12 assertions, all green.'),
      P('Done. One required change, one test added, no open questions from my side.')
    ]
  },
  'agent-rollback': {
    name: 'Rollback Rehearser', model: 'GLM 5.2', status: 'retrying', elapsed: 72, start: '13:44', thread: 'query',
    standing: { state: 'warn', icon: 'clock', text: 'Retrying, attempt 2 of 3: the server closed the stream during step 7.' },
    feed: [
      P('Starting a second rollback rehearsal against a fresh database so the result is not contaminated by the first run.'),
      E('tool-error', 'Server disconnected', 'The stream closed during step 7 of 11. Nothing was left half-applied: the migration harness rolls back on disconnect.'),
      P('Attempt 1 failed at the host, not at the migration. I am retrying rather than reporting a rollback failure, because those are different findings and only one of them is about this change.'),
      E('waiting', 'Backing off', 'Attempt 2 of 3 · 8 s backoff · the host reconnected 4 s ago.'),
      P('Retry is under way from step 1, not from step 7 — resuming mid-migration would prove nothing about the rollback path.')
    ],
    tail: [
      { t: 'status', status: 'working', standing: null },
      W('Restored the schema snapshot on a fresh database', 'Attempt 2 of 3 · step 3 of 11 · restore took 41 s.', { doing: 'Restoring the schema snapshot on a fresh database' }),
      W('Rehearsing the down migration', 'DROP INDEX CONCURRENTLY on the restored copy, step 6 of 11.')
    ]
  },
  'agent-motion': {
    name: 'Motion Reviewer', model: 'Claude Opus 5', status: 'working', elapsed: 48, start: '13:51', thread: 'subagents',
    feed: [
      P('The sidecar should inherit the root menu direction and stay mounted while the pointer crosses the gap between the two. Unmounting on pointerleave is what makes the submenu feel like it is fighting the cursor.'),
      W('Measured the menu entrance', 'opacity 160ms, transform 300ms cubic-bezier(0.22,1.55,0.36,1) from scale3d(.72,.48,1).'),
      P('The close is asymmetric on purpose: 220ms transform with the fade delayed to 45ms at 175ms, so the box stays opaque through most of the collapse. That is what reads as a spring rather than a fade-out.'),
      P('One thing to watch: animation-fill-mode both beats a declared value. Every new looping animation also has to be added to the reduced-motion stop list or it runs forever, which is the trap this codebase has already fallen into twice.'),
      W('Checked the reduced-motion sweep', '13 infinite animations normally, 0 under reduce. The working sequence still advances in both modes.')
    ],
    tail: [
      W('Measured the submenu gap', 'The pointer crosses a 6 px gap in 40 to 90 ms; the sidecar now stays mounted for 120 ms.', { doing: 'Measuring the submenu gap' }),
      W('Reviewing transform origins', 'Menus opened from the right edge scale from the wrong corner in 2 of 9 placements.')
    ]
  },
  'agent-test': {
    name: 'Browser Auditor', model: 'Kimi K3', status: 'waiting', elapsed: 36, start: '13:53', thread: 'subagents',
    standing: { icon: 'clock', text: 'Waiting for the parent’s render to settle before taking a baseline.' },
    feed: [
      E('waiting', 'Waiting for parent', 'The visual baseline must stabilise before any screenshot comparison is meaningful.'),
      P('I can see the parent re-rendering on the 2s work tick. Comparing screenshots across a tick would produce a diff on every run and tell us nothing.'),
      P('I will take the baseline once two consecutive frames are identical. That is a cheap check and it removes the whole class of flaky visual failures.'),
      E('waiting', 'Two frames still differ', 'Frame delta 0.4% · the working card phase trail is mid-transition.')
    ]
  },
  'agent-tokens': {
    name: 'Token Harvester', model: 'Qwen 3.8', status: 'complete', elapsed: 168, start: '13:06', thread: 'subagents',
    feed: [
      P('Static extraction over every class attribute, classList call and className assignment gives 480 tokens. A live MutationObserver harvest across the themes and recipes gives 499.'),
      W('Union computed', '554 live class names and 7 ids. Neither method alone is sufficient: interpolated names only appear while the page runs, and conditionally-rendered ones only appear statically.'),
      P('That union is what an orphan gate has to be measured against. A naive grep produces 19 false positives from interpolation alone, which is how a stylesheet accumulates rules for components that were never built.'),
      P('Handing over the union set. The gate should run after every wave, not once.'),
      W('Harvest written', 'classes.json and harvest.json · 554 names · reproducible from either side.')
    ]
  },
  'agent-orphan': {
    name: 'Orphan Gate', model: 'GLM 5.2', status: 'failed', elapsed: 22, start: '13:56', thread: 'subagents',
    standing: { state: 'bad', icon: 'problems', text: 'Failed: it read classes.json before Token Harvester finished writing it. Re-run after the harvest.' },
    feed: [
      P('Running the orphan gate over styles.css against the harvested class union.'),
      E('tool-error', 'Empty union', 'classes.json parsed to 0 names. Every one of the 554 selectors would be reported as an orphan.'),
      P('I am failing rather than reporting 554 orphans. A gate that reports everything as broken is not a finding, it is a bug in the gate, and shipping that number would have wasted a whole review cycle.'),
      E('tool-error', 'Gate aborted', 'Ordering failure, not a stylesheet failure. Re-run after Token Harvester completes.')
    ]
  },
  'agent-theme': {
    name: 'Theme Sweeper', model: 'Claude Sonnet 4.6', status: 'working', elapsed: 64, start: '13:49', thread: 'subagents',
    feed: [
      P('Six of eight themes are clean. Retro Light has one contrast failure on the subtle text token and Glass Dark has a 1px horizontal overflow at 700px that only appears with the activity panel pinned.'),
      W('Swept 8 themes at 4 viewports', '32 combinations · 24 assertions each · zero console errors.'),
      P('The overflow is the resizer, not the panel: it is 6px wide with a 3px negative margin and no min-width:0 on its flex parent.'),
      P('I am running this account rather than the work one because the work account is close to its five-hour cap and I did not want a theme sweep to be the thing that exhausts it.'),
      W('Contrast measured', 'Retro Light subtle text 3.9:1 against the raised surface. The bar is 4.5:1.')
    ],
    tail: [
      W('Checked Glass Dark at 700 px with the activity panel pinned', 'Overflow reproduced: 1 px, from the resizer’s negative margin.', { doing: 'Checking Glass Dark at 700 px with the activity panel pinned' }),
      P('Confirmed: removing the negative margin and adding min-width:0 to the flex parent clears the overflow in all eight themes.')
    ]
  },
  'agent-plan': {
    name: 'Plan Critic', model: 'Claude Opus 5', status: 'complete', elapsed: 192, start: '12:50', thread: 'debug',
    feed: [
      P('Three things the plan needs before it is approvable: an explicit rollback gate, a stated write-amplification threshold, and a named owner for the benchmark evidence.'),
      P('The rollback gate is the important one. The plan currently says the change is reversible without saying who proves it or when, and “reversible in principle” is how an irreversible migration ships.'),
      W('Read the plan document', 'Revision 3 · 6-step sequence · 4 acceptance criteria · no rollback owner.'),
      P('The write-amplification threshold matters because the plan reports an 86% read win with no ceiling on the write cost. Without a number, any write regression can be argued as acceptable after the fact.'),
      P('Critique complete. None of the three is a reason to reject the approach; all three are reasons not to approve the plan as written.')
    ]
  },
  'agent-probe': {
    name: 'Probe Runner', model: 'Kimi K3', status: 'working', elapsed: 55, start: '13:52', thread: 'debug',
    feed: [
      P('The old probe returned true for anything with a non-zero bounding box, which includes elements that are clipped, occluded, or mid-transition. That is how three fixes passed while being invisible on screen.'),
      W('Rewrote probeVisible', 'elementFromPoint at the centre, then a distinct-colour count over a screenshot crop.'),
      P('Distinct-colour count rather than mean luminance, because a solid placeholder box has a perfectly reasonable mean and exactly one colour.'),
      P('The hover probe is now a pair rather than a single assertion: absent at rest AND present on hover. Asserting only the second half passes on an element that was never hidden.'),
      W('Converted 31 probes', '+31 −10 in verification/interaction-probes.mjs.')
    ],
    tail: [
      W('Ran the converted probes', '31 passed, 0 failed on the current build.', { doing: 'Running the converted probes' }),
      W('Checking the probes against an older build', 'Three probes should fail there: they caught the invisible fixes.')
    ]
  },
  'agent-fallback': {
    name: 'Fallback Router', model: 'Qwen 3.8', status: 'fallback', elapsed: 151, start: '13:16', thread: 'debug',
    standing: { state: 'warn', icon: 'route', text: 'Running on the fallback account: Anthropic · Work reached its five-hour cap, so the turn continued on Alibaba · Coding Plan.' },
    feed: [
      P('Started on the work Anthropic account. Collecting the console and network evidence for the intermittent blank dashboard.'),
      E('route-change', 'Route changed mid-turn', 'Anthropic · Work reached its five-hour cap. Continued on Alibaba · Coding Plan rather than stopping the turn.'),
      P('Continuing on the fallback account. Flagging it rather than hiding it: half of this transcript was produced by a different model, and a reader comparing the two halves deserves to know that.'),
      P('The blank dashboard reproduces once in roughly forty loads, always after a route change. That is a strong hint that the renderer keys its cache on the model name, which is not unique once a provider has two accounts.'),
      W('Reproduced 3 times in 118 loads', 'All three followed a route change. None occurred on a stable route.')
    ]
  },
  'agent-evidence': {
    name: 'Evidence Collator', model: 'GLM 5.2', status: 'queued', elapsed: 0, start: '13:54', thread: 'debug',
    standing: { icon: 'clock', text: 'Queued, position 2: behind Probe Runner, whose probe suite is still being rewritten.' },
    feed: [
      E('waiting', 'Queued', 'Position 2 · behind Probe Runner.'),
      P('There is no point collating evidence against a probe suite that is mid-rewrite; the index would point at assertions that are about to stop existing.'),
      P('When it lands I need three things per gate: the assertion, the artefact it produced, and the run it came from. A gate without a run is a claim, not evidence.'),
      E('waiting', 'Still queued', 'No tokens spent.')
    ]
  }
};
var AGENT_ORDER = ['agent-query', 'agent-schema', 'agent-bench', 'agent-migration', 'agent-rollback', 'agent-motion', 'agent-test',
  'agent-tokens', 'agent-orphan', 'agent-theme', 'agent-plan', 'agent-probe', 'agent-fallback', 'agent-evidence'];

/* the live state survives closing and reopening the tab (an agent keeps working whether or not you watch) */
var LIVE = {};
function liveOf(agentId) {
  var a = AGENTS[agentId];
  if (!a) return null;
  if (!LIVE[agentId]) LIVE[agentId] = { delivered: 0, status: a.status, standing: a.standing || null, since: Date.now(), base: a.elapsed, frozen: null };
  return LIVE[agentId];
}
function elapsedOf(L) {
  if (L.frozen != null) return L.frozen;
  return TICKS[L.status] ? L.base + Math.floor((Date.now() - L.since) / 1000) : L.base;
}
function fmtElapsed(s) {
  s = Math.max(0, Math.floor(s));
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm ' + ('0' + (s % 60)).slice(-2) + 's';
  return Math.floor(s / 3600) + 'h ' + ('0' + Math.floor((s % 3600) / 60)).slice(-2) + 'm';
}
function fmtClock(sec) {
  var m = Math.floor(sec / 60) % (24 * 60), hh = Math.floor(m / 60), mm = m % 60;
  return ((hh % 12) || 12) + ':' + ('0' + mm).slice(-2) + ' ' + (hh < 12 ? 'AM' : 'PM');
}
function parseClock(s) { var p = String(s).split(':'); return (Number(p[0]) * 60 + Number(p[1])) * 60; }

/* ---- reading a record: its step kind and what it reports (transcript-records.js:83-200, the same rules) ---- */
var VERB = {
  read: 'read', opened: 'read', inspected: 'read', scanned: 'read',
  searched: 'search', grepped: 'search', found: 'search',
  ran: 'run', running: 'run', profiled: 'run', executed: 'run', reproduced: 'run', benchmarked: 'run', benchmarking: 'run',
  created: 'edit', regenerated: 'edit', rewrote: 'edit', wrote: 'edit', written: 'edit', drafted: 'edit', edited: 'edit',
  updated: 'edit', converted: 'edit', generated: 'edit', restored: 'edit', refreshed: 'edit',
  checked: 'check', checking: 'check', measured: 'check', verified: 'check', validated: 'check', swept: 'check',
  computed: 'check', compared: 'check', confirmed: 'check', reviewing: 'check',
  rehearsed: 'test', rehearsing: 'test', tested: 'test', testing: 'test',
  handed: 'hand', shared: 'hand', published: 'hand', delegated: 'agents'
};
var STEP_WORD = { read: 'Read a file', search: 'Search', run: 'Ran a command', edit: 'Changed something', check: 'Checked', test: 'Tests', hand: 'Handed over', agents: 'Agents', note: 'Work note' };
var PASSED = /(\d[\d,]*)\s+(?:tests?\s+)?passed\b/i, GREEN = /(\d[\d,]*)\s+assertions?\b[^.]*?\b(?:all green|passed)\b/i, FAILED = /(\d[\d,]*)\s+(?:tests?\s+)?failed\b/i;
var GERUND = /^\s*([A-Z][a-z]+ing)\b\s*(.*)$/;
function stepOf(rec) {
  if (rec.edits) return 'edit';
  var words = String(rec.title || '').toLowerCase().match(/[a-z]+/g) || [];
  var v = VERB[words[0]];
  if (!v) { for (var i = 0; i < words.length; i++) if (VERB[words[i]] && /(?:ed|en|wrote|swept|ran)$/.test(words[i])) { v = VERB[words[i]]; break; } }
  var d = String(rec.detail || '');
  if (PASSED.test(d) || GREEN.test(d) || (v === 'run' && /\btests?\b|\btest suite\b/i.test(rec.title))) v = 'test';
  return v || 'note';
}
function readCount(rec, step) {
  if (step !== 'read') return null;
  var m = /^\s*\S+\s+(\S+)/.exec(String(rec.title || ''));
  if (!m) return null;
  var p = m[1];
  if (!/\/|\.[a-z0-9]{1,5}$/i.test(p)) return null;
  var r = /(\d+)\.\.(\d+)/.exec(p);
  return { path: p, n: r ? Math.max(1, Number(r[2]) - Number(r[1]) + 1) : 1 };
}
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
function stretchSummary(list, live) {
  var read = {}, edited = {}, tests = 0, asserts = 0, failed = 0;
  var num = function (x) { return Number(String(x).replace(/,/g, '')); };
  list.forEach(function (rec) {
    var rc = readCount(rec, stepOf(rec)); if (rc) read[rc.path] = rc.n;
    if (rec.edits) edited[rec.edits] = 1;
    var d = String(rec.detail || ''), pt = PASSED.exec(d), gr = !pt && GREEN.exec(d), fl = FAILED.exec(d);
    if (pt) tests += num(pt[1]); else if (gr) asserts += num(gr[1]);
    if (fl) failed += num(fl[1]);
  });
  var facts = [], nRead = 0;
  Object.keys(read).forEach(function (k) { nRead += read[k]; });
  if (nRead) facts.push('read ' + plural(nRead, 'file'));
  var nEd = Object.keys(edited).length;
  if (nEd) facts.push('edited ' + plural(nEd, 'file'));
  if (tests) facts.push(plural(tests, 'test') + ' passed');
  if (asserts) facts.push(plural(asserts, 'assertion') + ' passed');
  if (failed) facts.push(plural(failed, 'test') + ' failed');
  var n = list.length, title = String((live && list[n - 1].doing) || list[n - 1].title || '').trim() || 'Work note';
  if (live) {
    var g = GERUND.exec(title), tail = n > 1 ? [plural(n, 'tool') + ' so far'].concat(facts) : [];
    return { verb: g ? g[1] : 'Working', rest: [g ? g[2] : title].concat(tail).filter(Boolean).join(' · '), sep: g ? ' ' : ' · ' };
  }
  if (n === 1) return { verb: '', rest: title, sep: '' };
  return { verb: 'Ran', rest: [plural(n, 'tool')].concat(facts).join(' · '), sep: ' ' };
}

/* file names inside a record's title open the editor (D7) */
var PATH_RX = /(?:[\w.-]+\/)+[\w.+-]+\.[a-z0-9]{1,5}\b|\b[\w-]+\.(?:rs|sql|json|mjs|css|toml|md)\b/g;
function withFileLinks(text, line, open) {
  var out = [], last = 0, m;
  PATH_RX.lastIndex = 0;
  while ((m = PATH_RX.exec(text))) {
    if (/\.\./.test(m[0])) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(fileLink(m[0], line, open));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function fileLink(path, line, open) {
  var b = h('button', { type: 'button', class: 'pmw-tx-file', 'data-pmh': 'icon', 'data-pm-hover-label': 'Open ' + path.split('/').pop(),
    'data-pm-hover-detail': 'Click: preview · double click: keep it open · Alt+click: new panel', text: path });
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    open({ kind: 'editor', path: path, line: line || null, mode: 'preview', where: e.altKey ? 'panel' : undefined, background: e.ctrlKey || e.metaKey || undefined });
  });
  b.addEventListener('dblclick', function (e) { e.stopPropagation(); open({ kind: 'editor', path: path, line: line || null, mode: 'keep' }); });
  return b;
}

/* ---- the tab ---- */
function mountTranscript(host, state, api) {
  state = state || {};
  var agentId = String(api.id).replace(/^thread-/, '');
  var agent = AGENTS[agentId];
  if (!agent) return mountMissing(host, api);
  var L = liveOf(agentId);
  var parentTitle = THREAD_TITLE[agent.thread] || 'the chat';
  var open = {};
  (state.open || []).forEach(function (k) { open[k] = 1; });
  var follow = state.follow !== false;
  var visible = false, gone = false, timer = 0, tick = 0, revealing = null, unseen = 0, programmatic = 0;

  function openFile(spec) { return api.open(spec); }
  function statusWord() { return STATUS_WORD[L.status] || 'Working'; }
  function isLive() { return !!LIVE_STATES[L.status]; }

  /* the head row: name, status and elapsed, model, parent, read-only marker */
  var statusEl = h('span', { class: 'pmw-tx-status' });
  var elapsedEl = h('span', { class: 'pmw-tx-elapsed' });
  var roEl = h('span', { class: 'pmw-tx-ro', 'data-pm-hover-label': 'Read-only child thread',
    'data-pm-hover-detail': 'There is no composer, and nothing in this feed acts on the parent thread.' });
  var parentBtn = h('button', { type: 'button', class: 'pmw-tx-parent', 'data-pmh': 'icon', 'data-pm-hover-label': 'Parent thread',
    'data-pm-hover-detail': parentTitle + ' · shows it in the chat' }, ['Parent: ', h('span', { text: parentTitle })]);
  parentBtn.addEventListener('click', showParent);
  function paintHead() {
    statusEl.textContent = '';
    statusEl.className = 'pmw-tx-status is-' + L.status;
    add(statusEl, [statusMark(L.status, 12), h('span', { text: statusWord() })]);
    elapsedEl.textContent = fmtElapsed(elapsedOf(L));
    roEl.textContent = '';
    add(roEl, [PMW.icon('lock', { size: 12, glyph: false }), h('span', { text: isLive() ? 'Read-only · live' : 'Read-only' })]);
    root.setAttribute('data-status', L.status);
  }
  function headLeft() {
    return [
      { id: 'tx-name', text: agent.name, strong: true },
      { id: 'tx-status', el: h('span', { class: 'pmw-tx-statwrap' }, [statusEl, elapsedEl]) },
      { id: 'tx-model', text: agent.model, title: 'Model' },
      { id: 'tx-parent', el: parentBtn },
      { id: 'tx-ro', el: roEl }
    ];
  }
  function actions() {
    var m = api.isMaximized();
    return [
      { id: 'follow', label: 'Follow', icon: 'target', pressed: follow, detail: follow ? 'On: the feed keeps to the newest line' : 'Off: the feed stays where you are', run: function () { setFollow(!follow, true); } },
      { id: 'more', label: 'More', icon: 'more', menu: function () {
        return [
          { id: 'copy', label: 'Copy transcript', icon: 'document', run: copyTranscript },
          { id: 'ctx', label: 'Context of ' + parentTitle, icon: 'context', run: function () {
            api.open({ id: 'context:' + agent.thread, kind: 'context', label: 'Context · ' + parentTitle });
          } },
          { id: 'parent', label: 'Show the parent thread', icon: 'chat', run: showParent }
        ];
      } },
      { id: 'max', label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); row.setAction('max', { label: api.isMaximized() ? 'Restore' : 'Maximize', icon: api.isMaximized() ? 'restore' : 'maximize' }); } }
    ];
  }

  var root = h('div', { class: 'pmw-tx' });
  var row = api.headerRow({ label: agent.name + ' transcript controls', left: [], actions: actions() });
  var scroll = h('div', { class: 'pmw-tx-scroll', 'data-pmh': 'off', tabindex: '-1' });
  var col = h('div', { class: 'pmw-tx-col' });
  var standingEl = h('div', { class: 'pmw-tx-standing' });
  var feed = h('div', { class: 'pmw-tx-feed', role: 'log', 'aria-live': 'polite', 'aria-label': agent.name + ' live transcript' });
  var foot = h('p', { class: 'pmw-tx-foot' });
  var jump = h('button', { type: 'button', class: 'pmw-tx-jump', hidden: true, 'data-pmh': 'icon', 'data-pm-hover-label': 'Jump to latest', 'data-pm-hover-detail': 'And follow the feed again' });
  jump.addEventListener('click', function () { setFollow(true, true); });
  add(col, [standingEl, feed, foot]);
  scroll.appendChild(col);
  add(root, [row.el, scroll, jump]);
  host.appendChild(root);
  paintHead();
  row.set({ left: headLeft() });

  /* ---- the feed model: groups of prose, stretches and other records ---- */
  var groups = [];
  var clockSec = parseClock(agent.start);
  function stamp(rec) {
    if (rec.at) clockSec = parseClock(rec.at);
    else clockSec += rec.gap != null ? rec.gap : 46 + ((groups.length * 37) % 90);
    rec._time = fmtClock(clockSec);
  }
  function pushRecord(rec, fresh) {
    if (rec.t === 'status') return;
    stamp(rec);
    var last = groups[groups.length - 1];
    if (rec.t === 'w') {
      if (last && last.type === 'stretch') { last.list.push(rec); last.fresh = fresh ? rec : null; return last; }
      var g = { type: 'stretch', id: 's' + groups.length, list: [rec], fresh: fresh ? rec : null };
      groups.push(g);
      return g;
    }
    var g2 = { type: rec.t === 'a' ? 'prose' : 'event', rec: rec, id: 'g' + groups.length, fresh: !!fresh };
    groups.push(g2);
    return g2;
  }
  var all = agent.feed.concat(agent.tail || []);
  for (var i = 0; i < agent.feed.length + L.delivered && i < all.length; i++) pushRecord(all[i], false);

  function groupEl(g, idx) {
    var lastIdx = groups.length - 1;
    var live = g.type === 'stretch' && idx === lastIdx && isLive();
    var el;
    if (g.type === 'prose') {
      el = h('div', { class: 'pmw-tx-item pmw-tx-prose' + (idx === lastIdx && isLive() ? ' is-live' : '') }, [h('p', { text: g.rec.text })]);
    } else if (g.type === 'event') {
      var ek = EVENT_KIND[g.rec.t] || { state: 'dim' };
      el = h('div', { class: 'pmw-tx-item pmw-tx-event is-' + ek.state }, [
        h('span', { class: 'pmw-tx-eglyph', 'aria-hidden': 'true' }, [eventGlyph(g.rec.t)]),
        h('span', { class: 'pmw-tx-ecopy' }, [h('b', { text: g.rec.title }), g.rec.detail ? h('span', { text: g.rec.detail }) : null]),
        h('span', { class: 'pmw-tx-time', text: g.rec._time })
      ]);
    } else el = stretchEl(g, live);
    if (g.fresh && !PMW.reduced() && (g.type !== 'stretch' || g.list.length === 1)) el.classList.add('pmw-tx-in');
    g.fresh = false;
    g.el = el;
    return el;
  }
  function stretchEl(g, live) {
    var list = g.list, n = list.length, isOpen = !!open[g.id];
    var sum = stretchSummary(list, live);
    var rowsId = 'pmw-tx-rows-' + api.id.replace(/[^\w-]/g, '_') + '-' + g.id;
    var rail = h('span', { class: 'pmw-tx-rail', 'aria-hidden': 'true' });
    var FOLD = 10, fold = n > FOLD ? n - (FOLD - 1) : 0;
    if (fold) rail.appendChild(h('span', { class: 'pmw-tx-node is-fold', text: '+' + fold }));
    list.slice(fold).forEach(function (rec, j) {
      var cur = live && j + fold === n - 1;
      var node = h('span', { class: 'pmw-tx-node' + (cur ? ' is-live' : '') + (rec === g.fresh && !PMW.reduced() ? ' pmw-tx-in' : ''), 'data-step': stepOf(rec),
        'data-pm-hover-label': cur && rec.doing ? rec.doing : rec.title, 'data-pm-hover-detail': (cur ? 'In progress. ' : '') + (rec.detail || '') });
      node.appendChild(stepGlyph(stepOf(rec), 10));
      rail.appendChild(node);
    });
    var sumEl = h('span', { class: 'pmw-tx-sum' });
    if (sum.verb) add(sumEl, [h('b', { class: 'pmw-tx-verb' + (live ? ' is-live' : ''), text: sum.verb }), h('span', { text: sum.sep + sum.rest })]);
    else sumEl.appendChild(h('span', { text: sum.rest }));
    var headBtn = h('button', { type: 'button', class: 'pmw-tx-shead', 'data-pmh': 'row', 'aria-expanded': isOpen ? 'true' : 'false', 'aria-controls': rowsId,
      'aria-label': (sum.verb ? sum.verb + sum.sep : '') + sum.rest + ', ' + list[n - 1]._time }, [
      rail, sumEl, h('span', { class: 'pmw-tx-time', text: list[n - 1]._time }),
      h('span', { class: 'pmw-tx-chev', 'aria-hidden': 'true' }, [PMW.icon('chevronDown', { size: 12, glyph: false })])
    ]);
    var rows = h('div', { class: 'pmw-tx-srows', id: rowsId, role: 'list', 'aria-label': (live ? 'Work so far' : 'Work records') + ', ' + plural(n, 'record'), hidden: !isOpen });
    list.forEach(function (rec, j) {
      var cur = live && j === n - 1, step = stepOf(rec);
      rows.appendChild(h('div', { class: 'pmw-tx-srow' + (cur ? ' is-live' : ''), role: 'listitem' }, [
        h('span', { class: 'pmw-tx-sglyphwrap', 'aria-hidden': 'true', title: null }, [stepGlyph(step, 13)]),
        h('span', { class: 'pmw-tx-scopy' }, [
          h('span', { class: 'pmw-tx-slabel' }, withFileLinks(cur && rec.doing ? rec.doing : rec.title, rec.line, openFile).concat(cur ? [h('span', { class: 'pmw-tx-now', text: ' · in progress' })] : [])),
          rec.detail ? h('span', { class: 'pmw-tx-sdetail' }, withFileLinks(rec.detail, null, openFile)) : null
        ]),
        h('span', { class: 'pmw-tx-time', text: rec._time })
      ]));
    });
    headBtn.addEventListener('click', function () {
      var now = !open[g.id];
      if (now) open[g.id] = 1; else delete open[g.id];
      headBtn.setAttribute('aria-expanded', now ? 'true' : 'false');
      rows.hidden = !now;
      wrap.setAttribute('data-open', now ? '1' : '0');
      if (now && !PMW.reduced()) rows.classList.add('pmw-tx-in'); else rows.classList.remove('pmw-tx-in');
    });
    var wrap = h('div', { class: 'pmw-tx-item pmw-tx-stretch' + (live ? ' is-live' : ''), 'data-open': isOpen ? '1' : '0' }, [headBtn, rows]);
    return wrap;
  }
  function paintFeed() {
    feed.textContent = '';
    groups.forEach(function (g, i) { feed.appendChild(groupEl(g, i)); });
    paintStanding();
  }
  function repaintGroup(g) {
    var idx = groups.indexOf(g);
    if (idx < 0) return;
    var old = g.el, fresh = groupEl(g, idx);
    if (old && old.parentNode === feed) feed.replaceChild(fresh, old); else feed.appendChild(fresh);
  }
  function paintStanding() {
    standingEl.textContent = '';
    if (L.standing) standingEl.appendChild(PMW.frames.notice(L.standing.text, { state: L.standing.state, icon: L.standing.icon === 'route' ? 'link' : L.standing.icon }));
    foot.textContent = isLive() ? 'Read-only: this agent’s work streams here; there is no composer.'
      : L.status === 'complete' ? 'Read-only: this agent has finished; there is no composer.'
      : 'Read-only: this agent’s work appears here when it moves; there is no composer.';
  }
  paintFeed();

  /* ---- following the bottom ---- */
  function atBottom() { return scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 28; }
  function toBottom(smooth) {
    programmatic = Date.now() + (smooth ? 700 : 80);
    if (smooth && !PMW.reduced() && scroll.scrollTo) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
    else scroll.scrollTop = scroll.scrollHeight;
  }
  function paintJump() {
    var show = !atBottom() && !follow;
    jump.hidden = !show;
    jump.textContent = '';
    add(jump, [PMW.icon('chevronDown', { size: 14, glyph: false }), h('span', { text: 'Jump to latest' }), unseen ? h('small', { text: unseen + ' new' }) : null]);
  }
  function setFollow(on, scrollNow) {
    follow = !!on;
    if (follow) { unseen = 0; if (scrollNow) toBottom(true); }
    row.setAction('follow', { pressed: follow, detail: follow ? 'On: the feed keeps to the newest line' : 'Off: the feed stays where you are' });
    paintJump();
  }
  scroll.addEventListener('scroll', function () {
    if (Date.now() < programmatic) { if (atBottom()) programmatic = 0; paintJump(); return; }
    if (atBottom()) { if (!follow) setFollow(true, false); }
    else if (follow) setFollow(false, false);
    paintJump();
  }, { passive: true });
  function afterGrow() {
    if (follow) toBottom(false); else { unseen += 1; paintJump(); }
  }

  /* ---- streaming (visible tab only) ---- */
  function nextGap() { return 3400 + ((L.delivered * 7) % 4) * 700; }
  function schedule() {
    clearTimeout(timer);
    if (!visible || gone || revealing) return;
    if (L.delivered >= (agent.tail || []).length) return;
    timer = setTimeout(deliver, nextGap());
  }
  function deliver() {
    if (!visible || gone) return;
    var rec = (agent.tail || [])[L.delivered];
    if (!rec) return;
    L.delivered += 1;
    if (rec.t === 'status') {
      L.base = elapsedOf(L); L.since = Date.now();
      L.status = rec.status;
      if ('standing' in rec) L.standing = rec.standing;
      if (rec.status === 'complete') { L.frozen = L.base; L.standing = null; api.announce(agent.name + ' finished'); }
      var lastG = groups[groups.length - 1];
      if (lastG) repaintGroup(lastG);
      paintHead(); paintStanding(); labels(); paintTicker();
      schedule();
      return;
    }
    var before = groups[groups.length - 1];
    var g = pushRecord(rec, true);
    if (before && before !== g && before.type === 'stretch') repaintGroup(before);   // a finished stretch sums itself up
    if (before && before !== g && before.type === 'prose') repaintGroup(before);
    repaintGroup(g);
    if (g.type === 'prose' && !PMW.reduced()) revealWords(g);
    afterGrow();
    schedule();
  }
  function revealWords(g) {
    var p = g.el && g.el.querySelector('p');
    if (!p) return;
    var words = g.rec.text.split(' '), n = 0;
    feed.setAttribute('aria-busy', 'true');
    p.textContent = '';
    revealing = setInterval(function () {
      n = Math.min(words.length, n + 2);
      p.textContent = words.slice(0, n).join(' ');
      if (follow) toBottom(false);
      if (n >= words.length || !visible || gone) finishReveal(g);
    }, 55);
    g.finish = function () { p.textContent = g.rec.text; };
  }
  function finishReveal(g) {
    clearInterval(revealing); revealing = null;
    if (g && g.finish) { g.finish(); g.finish = null; }
    feed.removeAttribute('aria-busy');
    if (follow) toBottom(false);
    schedule();
  }
  function paintTicker() {
    clearInterval(tick);
    if (visible && TICKS[L.status] && L.frozen == null) tick = setInterval(function () { elapsedEl.textContent = fmtElapsed(elapsedOf(L)); }, 1000);
    elapsedEl.textContent = fmtElapsed(elapsedOf(L));
  }

  function labels() {
    api.update({ label: agent.name, title: agent.name + ' · ' + statusWord() + ' · read-only agent transcript', busy: isLive() });
  }
  labels();

  function showParent() {
    var panel = document.getElementById('chatPanel');
    var target = panel && panel.querySelector('textarea, [contenteditable="true"], input, button');
    if (target) { try { target.focus({ preventScroll: true }); } catch (_) {} }
    PMW.toast(parentTitle + ' is the parent thread in the chat');
  }
  function copyTranscript() {
    var lines = [agent.name + ' · ' + statusWord() + ' · ' + agent.model, 'Parent: ' + parentTitle, ''];
    groups.forEach(function (g) {
      if (g.type === 'prose') lines.push(g.rec.text, '');
      else if (g.type === 'event') lines.push('[' + g.rec._time + '] ' + g.rec.title + ': ' + g.rec.detail, '');
      else { g.list.forEach(function (r) { lines.push('[' + r._time + '] ' + r.title + (r.detail ? ' — ' + r.detail : '')); }); lines.push(''); }
    });
    var text = lines.join('\n');
    try { navigator.clipboard.writeText(text).then(function () { PMW.toast('Transcript copied'); }, function () { PMW.toast('Copying is not allowed here'); }); }
    catch (_) { PMW.toast('Copying is not allowed here'); }
  }

  var restoredScroll = state.scrollTop;
  var firstResize = true;
  return {
    onShow: function () {
      visible = true;
      paintHead(); paintTicker();
      schedule();
    },
    onHide: function () {
      visible = false;
      clearTimeout(timer); clearInterval(tick);
      if (revealing) { var g = groups[groups.length - 1]; finishReveal(g); clearTimeout(timer); }
    },
    onResize: function () {
      if (firstResize) {
        firstResize = false;
        if (!follow && restoredScroll != null) scroll.scrollTop = restoredScroll; else toBottom(false);
        paintJump();
      } else if (follow) toBottom(false);
    },
    onLook: function () { paintJump(); },
    focus: function () { try { scroll.focus({ preventScroll: true }); } catch (_) {} },
    serialize: function () { return { agentId: agentId, follow: follow, open: Object.keys(open), scrollTop: Math.round(scroll.scrollTop) }; },
    unmount: function () { gone = true; clearTimeout(timer); clearInterval(tick); if (revealing) clearInterval(revealing); }
  };
}

function mountMissing(host, api) {
  api.update({ label: 'Agent transcript', title: 'Agent transcript' });
  var frame = PMW.frames.doc({ title: 'This agent’s transcript is not here', meta: ['Agent transcript', 'Read-only'],
    body: [h('p', { text: 'The agent may have finished in an earlier session. Open it again from the chat’s list of agents.' })] });
  frame._scroll.setAttribute('data-pmh', 'off');
  host.appendChild(frame);
  return {};
}

function labelFor(id) {
  var a = AGENTS[String(id).replace(/^thread-/, '')];
  return a ? a.name : 'Agent transcript';
}

PM_HOME.registerKind('transcript', {
  label: 'Agent transcript',
  group: 'Agents',
  icon: 'transcript',
  prefixes: ['thread-'],
  document: true,
  min: { w: 280, h: 160 },
  idFor: function (spec) { var a = spec.agentId || spec.agent; return a ? 'thread-' + String(a).replace(/^thread-/, '') : null; },
  mount: mountTranscript
});

PM_HOME.catalog.add('transcript', AGENT_ORDER.map(function (id) {
  var a = AGENTS[id];
  return { id: 'thread-' + id, label: a.name, sub: STATUS_WORD[a.status] + ' · ' + a.model + ' · ' + THREAD_TITLE[a.thread], icon: 'transcript',
    keywords: 'agent transcript ' + a.name + ' ' + STATUS_WORD[a.status], spec: { id: 'thread-' + id, kind: 'transcript', label: a.name } };
}));

/* a transcript opened in the background (an agent's own open, D8) is mounted lazily; name it now */
PM_HOME.on('open', function (e) {
  if (!e || e.kind !== 'transcript' || !e.created) return;
  var t = (PM_HOME.tabs() || []).filter(function (x) { return x.tabId === e.tabId; })[0];
  if (t && (t.label === 'Agent transcript' || !t.label)) PM_HOME.update(e.tabId, { label: labelFor(e.tabId) });
});
