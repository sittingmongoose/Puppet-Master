/* PMX run trace — Opus 5
 * Global: window.PMXRunTrace
 *
 * WHY THIS EXISTS
 * ---------------
 * `reference/videos/03_compact_execution_activity.mov` shows one evolving capsule rather than a
 * growing wall of tool rows, and reading it frame by frame turns up five behaviours this workspace
 * had none of. Timings are from the 38.89fps decode; frame indices are cited so a later reader can
 * check the claim rather than take it:
 *
 *   1. THE GLYPH CHAIN IS AN INDEX, NOT DECORATION. Each finished phase leaves exactly one glyph
 *      behind (f.208 two, f.390 three, f.780 four, f.910 six). Once the run condenses, every one of
 *      those glyphs is a BUTTON: clicking the pencil at f.1170 reopens `Made 1 create, 2 edits`,
 *      clicking the magnifier at f.1300 reopens `Explored 7 files`. Random access into a finished
 *      run, from a control that costs one glyph of space.
 *   2. THE COUNT IS REWRITTEN IN PLACE. `Exploring 5 files` becomes `6 files` becomes `7 files`
 *      (f.208 -> f.286 -> f.338) on the same row at the same y. Nothing relayouts.
 *   3. THE VERB CHANGES TENSE ON SETTLE. `Thinking / Exploring / Making` while running,
 *      `Thought / Explored / Made` once finished (f.194 vs f.1170, f.1300).
 *   4. CONDENSE IS THE RESTING STATE, NOT A DELETION. At f.910 the whole run becomes `13 tools
 *      used`; the prose answer, the verification row and the artifact card live BELOW it and are
 *      pushed down when a phase is reopened, never replaced.
 *   5. A PHASE HANDS OVER IN TWO BEATS. f.194-211: the label cross-fades first, and only then does
 *      the new glyph open its slot and push the label right. See motion.phaseHandover.
 *
 * WHAT THIS IS NOT
 * ----------------
 * It is not a renderer and it emits no DOM. It owns the RUN as a record — which phases have been
 * entered, which is running, what each one counts, which one is disclosed — and the eight thread
 * concepts each draw it in their own idiom: a margin index, a chip run, spine nodes, digest marks,
 * a lane rail, a numbered log, a segmented bar, gutter dots. One contract, eight presentations,
 * and deliberately no shared markup to make them converge.
 *
 * WHERE THE STATE LIVES
 * ---------------------
 * `store.view(tid).runTrace`. Not a module local and not an instance field: t8 kept its equivalent
 * flag on the concept instance (`this.showWork`) and therefore lost the reader's disclosure every
 * time the thread remounted at a different width. A fact about what the reader has opened has to
 * outlive the element that displayed it.
 *
 * WHAT IT DOES NOT DUPLICATE
 * --------------------------
 * Stage FACTS — kind, labels, target count, duration, the operation record — stay on
 * `thread.activityStages`, and PMXOpCard stays the owner of the operation fields. This module holds
 * only what is true of the RUN rather than of a stage: entry order, the running id, partial counts,
 * and which phase the reader has open.
 */
(function (global) {
  'use strict';

  var store = null;
  function bind(s) { store = s; }
  function attach(s) { bind(s); }
  function data() { return global.PMXData ? global.PMXData.get() : null; }

  function threadOf(threadId) {
    var d = data();
    return d && d.threadById ? d.threadById(threadId) : null;
  }

  function stagesOf(threadId) {
    var t = threadOf(threadId);
    return (t && t.activityStages) || [];
  }

  /* One glyph per kind. The reference uses a product's own icon set; these are this workspace's,
   * chosen so the chain stays legible at 14px across eight themes rather than to match it. */
  var GLYPH_BY_KIND = {
    thought: 'sparkle',
    read: 'file',
    search: 'search',
    web: 'globe',
    browser: 'browser',
    test: 'beaker',
    edit: 'edit',
    generate: 'image',
    verify: 'check'
  };

  function glyphFor(kind) { return GLYPH_BY_KIND[kind] || 'dot'; }

  /* ------------------------------------------------------------------ the trace slice */

  function traceOf(threadId) {
    if (!store) return null;
    var v = store.view(threadId);
    if (!v) return null;
    if (!v.runTrace) {
      v.runTrace = {
        /* Entry ORDER, not stage order. The chain reads left to right in the order the run
         * actually did the work, which is the only order that makes a glyph a landmark. */
        order: [],
        runningId: null,
        counts: {},
        condensed: false,
        /* Which phase the reader has disclosed. Null while running (the running phase is its own
         * disclosure) and null when condensed with nothing opened. */
        openId: null
      };
    }
    return v.runTrace;
  }

  function announce() { if (store) store.touchView('runtrace'); }

  /* ------------------------------------------------------------------ headline construction
   *
   * The fixture authors both tenses (`runningLabel` / `label`) because a participle is not
   * mechanically derivable from a past-tense verb in English and guessing would produce
   * "Readed 7 files". What IS mechanical is the count, so only that is computed here. */

  /* `matches` -> `match`, `files` -> `file`, `checks` -> `check`. Applied only at exactly one,
   * because "1 files" is the tell that a count was substituted into a fixed string. */
  function singular(unit) {
    if (!unit) return unit;
    if (/(?:s|x|ch|sh)es$/.test(unit)) return unit.slice(0, -2);
    if (/[^s]s$/.test(unit)) return unit.slice(0, -1);
    return unit;
  }

  function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Rewrite the count in a template, and the unit beside it when the count reaches one.
   *
   * The digit run is located by its UNIT, never by position. Rewriting the first digit found is
   * what an earlier draft did, and it turned `Thinking for 4s` — whose stage carries count 1 and
   * unit `summary` — into `Thinking for 1s`, silently restating a four-second duration as a
   * one-second one. A digit in a headline is not automatically the count, and a stage whose
   * headline never states its count has nothing here to substitute.
   *
   * countMorph only animates the digits when the surrounding words are unchanged, so a headline
   * that also flips its noun falls back to a label swap — the honest outcome, because at that point
   * the sentence really did change. */
  function withCount(template, n, unit) {
    if (!template) return '';
    if (n == null || !unit) return template;
    var one = singular(unit);
    var re = new RegExp('(\\d+)(\\s+)(' + escapeRe(unit) + '|' + escapeRe(one) + ')\\b');
    var m = template.match(re);
    if (!m) return template;
    return template.slice(0, m.index) + n + m[2] + (n === 1 ? one : unit)
         + template.slice(m.index + m[0].length);
  }

  /* The reference sets the verb in the text colour and the argument in the muted one, so a reader
   * scanning the chain reads a column of verbs. `verbWords` lets a fixture declare a multi-word
   * verb ("List Components using Aurora", "Read Component Docs Card, SegmentedControl, Table");
   * one word is the common case and the default. */
  function splitHeadline(text, verbWords) {
    var s = String(text == null ? '' : text);
    var n = verbWords && verbWords > 0 ? verbWords : 1;
    var parts = s.split(' ');
    if (parts.length <= n) return { verb: s, argument: '' };
    return { verb: parts.slice(0, n).join(' '), argument: parts.slice(n).join(' ') };
  }

  /* ------------------------------------------------------------------ read */

  function phaseRecord(threadId, stage, tr) {
    var running = tr.runningId === stage.id;
    var entered = tr.order.indexOf(stage.id) >= 0;
    var seen = tr.counts[stage.id];
    var target = typeof stage.count === 'number' ? stage.count : null;
    var count = seen == null ? (entered ? target : null) : seen;

    var template = running ? (stage.runningLabel || stage.label) : stage.label;
    var headline = withCount(template, count, stage.unit);
    var split = splitHeadline(headline, stage.verbWords);

    return {
      id: stage.id,
      kind: stage.kind,
      glyph: glyphFor(stage.kind),
      /* Present participle while it runs, past tense once it has settled. This is the whole of
       * behaviour 3 and the reason both strings are authored rather than one being derived. */
      headline: headline,
      verb: split.verb,
      argument: split.argument,
      count: count,
      targetCount: target,
      unit: stage.unit || null,
      detail: stage.detail || null,
      durationMs: stage.durationMs || null,
      status: running ? 'running' : (entered ? 'done' : 'pending'),
      running: running,
      entered: entered,
      open: tr.openId === stage.id,
      rows: (stage.rows || []).slice(),
      op: stage.op || null
    };
  }

  /* read(threadId) -> the whole run, or null when the thread has no activity stages at all.
   *
   * Returning null rather than an empty husk is what lets a concept render NOTHING. An empty frame
   * that says "no activity" is a reserved space for a surface that is not active, which the work
   * surface contract forbids. */
  function read(threadId) {
    var stages = stagesOf(threadId);
    if (!stages.length) return null;
    var tr = traceOf(threadId);
    if (!tr) return null;

    var byId = {};
    var all = [];
    var i;
    for (i = 0; i < stages.length; i++) {
      var rec = phaseRecord(threadId, stages[i], tr);
      byId[rec.id] = rec;
      all.push(rec);
    }

    /* The chain is the ENTERED phases in entry order. A stage the run never reached has no glyph,
     * because a glyph is a claim that the work happened. */
    var chain = [];
    for (i = 0; i < tr.order.length; i++) {
      if (byId[tr.order[i]]) chain.push(byId[tr.order[i]]);
    }

    var running = tr.runningId ? byId[tr.runningId] || null : null;
    var openRec = tr.openId ? byId[tr.openId] || null : null;

    return {
      phases: all,
      chain: chain,
      running: running,
      open: openRec,
      openId: tr.openId,
      condensed: !!tr.condensed,
      started: chain.length > 0,
      /* `13 tools used` in the reference. Derived from what the run actually did, so it can never
       * disagree with the chain beside it. */
      summaryLabel: summaryLabel(threadId, chain),
      toolCount: toolCount(chain),
      workedSeconds: workedSeconds(threadId, chain)
    };
  }

  /* signature(run) -> a key that changes when the run's STRUCTURE changes and NOT when a count does.
   *
   * This exists because of a defect that would otherwise have made behaviour 2 unobservable in seven
   * of the eight concepts, in exactly the way the dead `pmx-m-*` classes were unobservable: silently,
   * while reporting success.
   *
   * `motion.countMorph` animates the digits only when the element's CURRENT text differs from the new
   * text by digits alone. A concept that empties its host and rebuilds the capsule on every store
   * change hands countMorph a brand new element whose textContent is the empty string, so the digit
   * comparison cannot match and it silently falls back to a whole-label cross-fade. The count still
   * ends up correct, which is why nothing looks broken — but `Exploring 5 files` becoming `6 files`
   * reads as the line being replaced rather than as a running tally, and that distinction is the
   * entire point of frames 208 through 338.
   *
   * So the capsule element has to SURVIVE a re-render whenever only a count changed. A concept
   * compares this signature against the one it built with: equal means patch the counts in place on
   * the element it already has, different means the structure really did change and a rebuild is
   * honest. The bookkeeping is here so eight concepts share one definition of "structurally the
   * same run"; the markup and the patching stay entirely theirs. */
  function signature(run) {
    if (!run) return 'none';
    var ids = [];
    for (var i = 0; i < run.chain.length; i++) {
      /* Status is part of the structure because the tense flip rewrites WORDS, not digits, and a
       * word change is a rebuild. */
      ids.push(run.chain[i].id + ':' + run.chain[i].status);
    }
    return ids.join('|') + '#' + (run.openId || '-') + '#' + (run.condensed ? 'c' : 'o');
  }

  function toolCount(chain) {
    var n = 0;
    for (var i = 0; i < chain.length; i++) {
      /* A thought is not a tool. Counting it would make `13 tools used` a count of phases wearing
       * a noun that promises something narrower. */
      if (chain[i].kind === 'thought') continue;
      n += chain[i].count == null ? 1 : chain[i].count;
    }
    return n;
  }

  function summaryLabel(threadId, chain) {
    if (!chain.length) return '';
    var n = toolCount(chain);
    if (!n) return chain.length === 1 ? '1 step' : chain.length + ' steps';
    return n === 1 ? '1 tool used' : n + ' tools used';
  }

  function workedSeconds(threadId, chain) {
    var ms = 0;
    for (var i = 0; i < chain.length; i++) ms += chain[i].durationMs || 0;
    return Math.round(ms / 1000);
  }

  /* ------------------------------------------------------------------ verbs */

  function stageByKind(threadId, kind) {
    var stages = stagesOf(threadId);
    for (var i = 0; i < stages.length; i++) if (stages[i].kind === kind) return stages[i];
    return null;
  }

  function stageById(threadId, id) {
    var stages = stagesOf(threadId);
    for (var i = 0; i < stages.length; i++) if (stages[i].id === id) return stages[i];
    return null;
  }

  /* enter(tid, kind) — a new phase takes over the capsule.
   *
   * The previous running phase SETTLES rather than disappearing: that is what leaves its glyph in
   * the chain and flips its label to past tense in the same beat. */
  function enter(threadId, kind) {
    var stage = stageByKind(threadId, kind);
    if (!stage) return false;
    var tr = traceOf(threadId);
    if (!tr) return false;

    if (tr.runningId && tr.runningId !== stage.id) settleInto(tr, threadId, tr.runningId);

    if (tr.order.indexOf(stage.id) < 0) tr.order.push(stage.id);
    tr.runningId = stage.id;
    /* Reopening the capsule by starting new work is the one case where an open phase should close:
     * the reader asked to see a finished phase, and the run has since moved on. */
    tr.condensed = false;
    tr.openId = null;

    var target = typeof stage.count === 'number' ? stage.count : 1;
    if (tr.counts[stage.id] == null) {
      /* Start part way when there is room to grow, so the next tick has somewhere to go. A
       * single-unit stage lands on its total immediately — there is nothing to count and
       * animating one would be a fabricated progression. */
      tr.counts[stage.id] = target > 2 ? Math.max(1, target - 2) : target;
    }
    announce();
    return true;
  }

  /* tick(tid, kind) — the running phase does one more unit of the same work. */
  function tick(threadId, kind) {
    var tr = traceOf(threadId);
    if (!tr) return false;
    var stage = kind ? stageByKind(threadId, kind) : (tr.runningId ? stageById(threadId, tr.runningId) : null);
    if (!stage) return false;
    if (tr.runningId !== stage.id) return enter(threadId, stage.kind);
    var target = typeof stage.count === 'number' ? stage.count : 1;
    var seen = tr.counts[stage.id];
    if (seen == null) seen = target > 2 ? Math.max(1, target - 2) : target;
    else seen = Math.min(target, seen + 1);
    tr.counts[stage.id] = seen;
    announce();
    return true;
  }

  /* step(tid, kind) — "the run did some work of this kind", which is what a single Director
   * trigger means. Enters the phase the first time and ticks it after that, so firing
   * `activity.read` three times walks 5 -> 6 -> 7 the way the reference does, instead of either
   * restarting the phase or jumping straight to the total. */
  function step(threadId, kind) {
    var tr = traceOf(threadId);
    var stage = stageByKind(threadId, kind);
    if (!tr || !stage) return false;
    if (tr.runningId === stage.id) return tick(threadId, kind);
    return enter(threadId, kind);
  }

  function settleInto(tr, threadId, id) {
    var stage = stageById(threadId, id);
    if (stage) tr.counts[id] = typeof stage.count === 'number' ? stage.count : 1;
    if (tr.runningId === id) tr.runningId = null;
  }

  /* settle(tid) — the running phase finishes. Its count lands on the authored total and its label
   * flips to past tense; the capsule itself stays open. */
  function settle(threadId) {
    var tr = traceOf(threadId);
    if (!tr || !tr.runningId) return false;
    settleInto(tr, threadId, tr.runningId);
    announce();
    return true;
  }

  /* condense(tid) — the run becomes one summary row.
   *
   * It does NOT touch `surfacesYielded`. The verb this replaces did, which meant firing it blanked
   * Goal, Todo, subagents and diffs entirely — the question-yield flag was being used to mean "the
   * activity is collapsed", and those are different facts about different surfaces. */
  function condense(threadId) {
    var tr = traceOf(threadId);
    if (!tr) return false;
    if (tr.runningId) settleInto(tr, threadId, tr.runningId);
    tr.condensed = true;
    tr.openId = null;
    announce();
    return true;
  }

  /* open(tid, phaseId) — RANDOM ACCESS back into a finished run. Behaviour 1.
   *
   * With no id this opens the most recent phase, which is what a chevron on the summary row means.
   * Opening a phase the run never entered is refused: there is nothing to show, and a capsule that
   * expanded to an empty body would claim work that did not happen. */
  function open(threadId, phaseId) {
    var tr = traceOf(threadId);
    if (!tr) return false;
    if (!tr.order.length) return false;
    var id = phaseId || tr.order[tr.order.length - 1];
    if (tr.order.indexOf(id) < 0) return false;
    /* Clicking the phase that is already open closes it, so one control both discloses and
     * dismisses and the reader never has to hunt for a separate close. */
    tr.openId = tr.openId === id ? null : id;
    announce();
    return true;
  }

  function close(threadId) {
    var tr = traceOf(threadId);
    if (!tr || tr.openId == null) return false;
    tr.openId = null;
    announce();
    return true;
  }

  /* reset(tid) — back to one known initial state, for the Director's reset. */
  function reset(threadId) {
    if (!store) return false;
    var v = store.view(threadId);
    if (!v) return false;
    v.runTrace = null;
    traceOf(threadId);
    announce();
    return true;
  }

  /* Replay the whole authored run to its finished, condensed state without stepping it. Used to
   * seed a thread whose fixture says the work is already complete, so a reader arriving at an old
   * thread still gets the chain and its random access. */
  function seedComplete(threadId) {
    var stages = stagesOf(threadId);
    if (!stages.length) return false;
    var tr = traceOf(threadId);
    if (!tr || tr.order.length) return false;
    for (var i = 0; i < stages.length; i++) {
      tr.order.push(stages[i].id);
      tr.counts[stages[i].id] = typeof stages[i].count === 'number' ? stages[i].count : 1;
    }
    tr.runningId = null;
    tr.condensed = true;
    tr.openId = null;
    announce();
    return true;
  }

  global.PMXRunTrace = {
    bind: bind,
    attach: attach,
    read: read,
    enter: enter,
    tick: tick,
    step: step,
    settle: settle,
    condense: condense,
    open: open,
    close: close,
    reset: reset,
    seedComplete: seedComplete,
    glyphFor: glyphFor,
    signature: signature,
    withCount: withCount,
    splitHeadline: splitHeadline,
    GLYPH_BY_KIND: GLYPH_BY_KIND
  };
})(window);
