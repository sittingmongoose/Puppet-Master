/* grill-protocol.js - the Grill Me session engine (DL-218, 2026-10-16; Plans/Collaborative_Workflows.md section 9.3,
 * CWR-042, CWR-043; Plans/Assistant_Plan_Runtime.md APR-072; the method itself is Plans/Skills_System.md SS-038).
 *
 * Grill Me is a SWITCH, never a participant: it has no seat, roster row, model, Persona, lane or vote. When it is on,
 * whoever already talks to you grills you: the Coordinator in a Crew (before it splits the job), the Moderator in a
 * Chat Room (before round 1), the Coordinator at BrainStorm intake (before the blind proposals), and the assistant in
 * Plan and Deep Plan. This file is that interview's rule book, on one record per session:
 *
 *   TREE     The subject is a design tree. A decision is ready when every decision it hangs off is settled.
 *   ROUNDS   Each round asks the whole frontier (every ready decision) at once, numbered, each with a recommended
 *            answer worded so that yes accepts it. A question that depends on one still open waits for a later round.
 *   FACTS    A question that needs a fact is routed to research, never asked; research never holds the round, so only
 *            the questions downstream of it wait. When every question left hangs on a lookup still running, the session
 *            WAITS and says it is looking things up (lookups()); it never jumps to What we agreed while a lookup runs.
 *   ANSWERS  "Not sure" (I don't know) is a real answer: the decision leaves the frontier and is listed as open in What
 *            we agreed. No agent answers for you.
 *   ENDING   The session ends by itself only when nothing is left to ask; Wrap up and the question cap can end it
 *            sooner, with the open items listed.
 *   GATES    A session gates one step (gate): 'start' (the split, round 1, the blind proposals, the Plan), or, for Grill
 *            Me turned on mid-run or a later decision asked mid-run, only the step that would use the answers
 *            ('part:export', 'round:2', 'vote' ...); work already running continues. (Steer of 2026-10-20.)
 *   CONFIRM  It ends in What we agreed (every decision with its answer, every decision left open) with Confirm and Keep
 *            going. Nothing acts on the answers until Confirm; Keep going reopens the open decisions within the cap.
 *
 * Every refusal is { ok:false, error }. Nothing here touches the DOM. wonderer-grill.js puts the rounds through the
 * existing questionnaire (questions.js, the Ask Card) and draws What we agreed. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PM56_GRILL_ENGINE = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  var copy = function (x) { return x == null ? x : JSON.parse(JSON.stringify(x)); };
  var fail = function (error) { return { ok: false, error: error }; };
  var text = function (x) { return typeof x === 'string' && x.trim().length > 0; };
  var BY = { coordinator: 'the Coordinator', moderator: 'the Moderator', assistant: 'the assistant' };
  var NAME = { coordinator: 'Coordinator', moderator: 'Moderator', assistant: 'Assistant' };
  var seq = 0;

  function node(s, id) { return s.tree.filter(function (n) { return n.id === id; })[0] || null; }
  function settled(n) { return !!n && (n.state === 'answered' || n.state === 'found'); }
  function ready(s, n) { return (n.dependsOn || []).every(function (d) { return settled(node(s, d)); }); }
  function openRound(s) { var r = s.rounds[s.rounds.length - 1]; return r && r.status === 'open' ? r : null; }

  /* create({by, subject, tree, cap, gate, gateLabel}) - by: coordinator | moderator | assistant (never a Grill Me
     participant); gate: the step that waits for Confirm ('start' by default), gateLabel its words ("the export part") */
  function create(o) {
    o = o || {};
    if (!BY[o.by]) return fail('grill_needs_the_one_who_talks_to_you');
    if (!Array.isArray(o.tree) || !o.tree.length) return fail('empty_design_tree');
    var ids = {}, bad = null;
    o.tree.forEach(function (n) {
      if (!n || !text(n.id) || ids[n.id]) bad = bad || 'invalid_or_duplicate_node';
      else ids[n.id] = 1;
      if (n && n.kind !== 'fact') {
        if (!text(n.prompt) || !Array.isArray(n.options) || n.options.length < 2) bad = bad || 'decision_needs_prompt_and_options';
        else if (!n.options.some(function (op) { return op.label === n.recommended; })) bad = bad || 'decision_needs_recommended_answer';
      }
    });
    if (bad) return fail(bad);
    o.tree.forEach(function (n) { (n.dependsOn || []).forEach(function (d) { if (!ids[d]) bad = bad || 'unknown_dependency'; }); });
    if (bad) return fail(bad);
    var s = {
      id: 'grill-' + (++seq), by: o.by, byName: NAME[o.by], subject: o.subject || '', status: 'grilling', cap: Math.max(1, o.cap || 25),
      asked: 0, tree: o.tree.map(function (n) {
        var x = copy(n); x.kind = x.kind === 'fact' ? 'fact' : 'decision'; x.state = 'pending'; x.answer = null; x.round = null; x.dependsOn = x.dependsOn || [];
        return x;
      }),
      rounds: [], routed: [], endedBy: null, confirmedAt: null, keepGoing: 0, log: [],
      gate: o.gate || 'start', gateLabel: o.gateLabel || '', later: !!o.gate && o.gate !== 'start'
    };
    return { ok: true, session: s };
  }

  /* next(s): route ready facts to research, then open the next round over the whole frontier, or end the session
     ({opened}, {waiting:'research'} or {ended}) */
  function next(s) {
    if (s.status !== 'grilling') return fail('session_not_grilling');
    if (openRound(s)) return { ok: true, reused: true, round: openRound(s).n };
    s.tree.forEach(function (n) {
      if (n.kind === 'fact' && n.state === 'pending' && ready(s, n)) { n.state = 'researching'; s.routed.push(n.id); s.log.push({ kind: 'routed', id: n.id }); }
    });
    var frontier = s.tree.filter(function (n) { return n.kind === 'decision' && n.state === 'pending' && ready(s, n); });
    var left = s.cap - s.asked;
    if (frontier.length && left <= 0) return end(s, 'cap');
    if (!frontier.length) {
      if (s.tree.some(function (n) { return n.state === 'researching'; })) return { ok: true, waiting: 'research' };
      return end(s, 'frontier_empty');
    }
    var take = frontier.slice(0, left), r = { n: s.rounds.length + 1, ids: take.map(function (n) { return n.id; }), status: 'open', acceptedAll: false };
    take.forEach(function (n) { n.state = 'asked'; n.round = r.n; n.answer = null; });
    s.asked += take.length;
    s.rounds.push(r);
    s.log.push({ kind: 'round', n: r.n, ids: r.ids.slice() });
    return { ok: true, opened: r.n, ids: r.ids.slice() };
  }
  function end(s, why) {
    var r = openRound(s);
    if (r) { r.ids.forEach(function (id) { var n = node(s, id); if (n.state === 'asked' && n.answer == null) n.state = 'open'; }); r.status = 'answered'; }
    s.status = 'agreeing'; s.endedBy = why;
    s.log.push({ kind: 'ended', why: why });
    return { ok: true, ended: why };
  }
  /* answer(s, id, value): value is an option label or your own words; null or 'not_sure' leaves it open */
  function answer(s, id, value) {
    var r = openRound(s); if (!r) return fail('no_open_round');
    var n = node(s, id); if (!n || r.ids.indexOf(id) < 0) return fail('not_in_this_round');
    if (value == null || value === 'not_sure') { n.answer = null; n.notSure = true; return { ok: true }; }
    if (!text(value)) return fail('answer_required');
    n.answer = String(value).trim(); n.notSure = false;
    return { ok: true };
  }
  /* one action accepts the whole round: every question you have not answered takes its recommended answer */
  function acceptRound(s) {
    var r = openRound(s); if (!r) return fail('no_open_round');
    r.ids.forEach(function (id) { var n = node(s, id); if (n.answer == null && !n.notSure) n.answer = n.recommended; });
    r.acceptedAll = true;
    return { ok: true };
  }
  function submitRound(s) {
    var r = openRound(s); if (!r) return fail('no_open_round');
    r.ids.forEach(function (id) {
      var n = node(s, id);
      if (n.answer != null) { n.state = 'answered'; n.took = n.answer === n.recommended ? 'recommended' : 'own'; }
      else { n.state = 'open'; n.openReason = 'not_sure'; }
    });
    r.status = 'answered';
    s.log.push({ kind: 'answered', n: r.n });
    return next(s);
  }
  /* Wrap up: you end the interview now; whatever was not settled is left open */
  function wrapUp(s) {
    if (s.status !== 'grilling') return fail('session_not_grilling');
    var r = openRound(s);
    if (r) r.ids.forEach(function (id) { var n = node(s, id); if (n.answer != null) { n.state = 'answered'; n.took = n.answer === n.recommended ? 'recommended' : 'own'; } });
    s.tree.forEach(function (n) { if (n.kind === 'decision' && n.state === 'pending') { n.state = 'open'; n.openReason = 'wrapped_up'; } });
    return end(s, 'wrap_up');
  }
  /* research comes back with a fact; only the questions that hung on it were waiting */
  function factFound(s, id, fact) {
    var n = node(s, id); if (!n || n.kind !== 'fact') return fail('fact_missing');
    if (n.state !== 'researching') return fail('fact_not_routed');
    if (!text(fact)) return fail('fact_required');
    n.state = 'found'; n.answer = fact.trim();
    s.log.push({ kind: 'found', id: id });
    return s.status === 'grilling' && !openRound(s) ? next(s) : { ok: true };
  }
  /* What we agreed: every decision with its answer, every decision left open (and why) */
  function agreed(s) {
    var dec = s.tree.filter(function (n) { return n.kind === 'decision'; });
    var why = function (n) {
      if (n.openReason === 'not_sure') return 'You said you weren’t sure yet.';
      if (n.openReason === 'wrapped_up') return 'Not asked: you wrapped up first.';
      var wait = (n.dependsOn || []).map(function (d) { return node(s, d); }).filter(function (d) { return d && !settled(d); });
      if (wait.length) return 'Waits on ' + wait.map(function (d) { return d.title || d.prompt; }).join(' and ') + '.';
      if (n.state === 'open' && s.endedBy === 'cap') return 'Not asked: the question limit was reached.';
      return n.openNote || 'Left open.';
    };
    return {
      decisions: dec.filter(function (n) { return n.state === 'answered'; }).map(function (n) { return { id: n.id, title: n.title || n.prompt, answer: n.answer, took: n.took, round: n.round }; }),
      open: dec.filter(function (n) { return n.state !== 'answered'; }).map(function (n) { return { id: n.id, title: n.title || n.prompt, why: why(n) }; }),
      facts: s.tree.filter(function (n) { return n.kind === 'fact' && n.state === 'found'; }).map(function (n) { return { id: n.id, title: n.title, fact: n.answer }; }),
      rounds: s.rounds.length, asked: s.asked, endedBy: s.endedBy
    };
  }
  function confirm(s) {
    if (s.status === 'confirmed') return { ok: true, reused: true };
    if (s.status !== 'agreeing') return fail('nothing_to_confirm_yet');
    s.status = 'confirmed'; s.confirmedAt = new Date().toISOString();
    s.log.push({ kind: 'confirmed' });
    return { ok: true };
  }
  /* Keep going: back to the interview, within the cap: the decisions left open come back to the frontier */
  function keepGoing(s) {
    if (s.status !== 'agreeing') return fail('nothing_to_keep_going_from');
    if (s.asked >= s.cap) return fail('question_limit_reached');
    s.status = 'grilling'; s.endedBy = null; s.keepGoing++;
    s.tree.forEach(function (n) { if (n.kind === 'decision' && n.state === 'open') { n.state = 'pending'; n.openReason = null; n.notSure = false; } });
    s.log.push({ kind: 'keep_going' });
    return next(s);
  }
  /* what waits for Confirm: the split, round 1, the blind proposals, the Plan document, or the one later step */
  function holds(s) { return !!s && s.status !== 'confirmed'; }
  /* what research is looking up right now (the session shows it while it waits) */
  function lookups(s) { return s.tree.filter(function (n) { return n.kind === 'fact' && n.state === 'researching'; }).map(function (n) { return { id: n.id, title: n.title }; }); }
  function waiting(s) { return !!s && s.status === 'grilling' && !openRound(s) && lookups(s).length > 0; }
  function round(s) { return openRound(s); }
  function questions(s, r) { r = r || openRound(s); return r ? r.ids.map(function (id) { return node(s, id); }) : []; }
  return { create: create, next: next, answer: answer, acceptRound: acceptRound, submitRound: submitRound, wrapUp: wrapUp, factFound: factFound,
    agreed: agreed, confirm: confirm, keepGoing: keepGoing, holds: holds, lookups: lookups, waiting: waiting, round: round, questions: questions, node: node, ready: ready, BY: BY, NAME: NAME, copy: copy };
});
