/* grill-protocol.js - the Grill Me session engine (DL-218, 2026-10-16; Plans/Collaborative_Workflows.md sections 8.4
 * and 9.3, CWR-042, CWR-043; Plans/assistant-chat-design.md ACD-503; Plans/Assistant_Plan_Runtime.md APR-072; the
 * method itself is Plans/Skills_System.md SS-038).
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
 *   ANSWERS  The recommended answer is a draft, never your answer: only an answer you change or pick, or a round you
 *            send or accept, is submitted (ACD-503: "Default selection is no submitted answer"). "Not sure" (I don't
 *            know) is a real answer: the decision leaves the frontier and is listed as open in What we agreed until
 *            you ask it again. No agent answers for you.
 *   COUNTER  One counter per run or thread (the QuestionBank, sections 8.4 and 9.3): every session on it, a later one
 *            too, borrows the same bank. A question is charged once, on its first presentation; asking it again, or
 *            changing its answer, charges nothing. At the limit no new question is admitted, but Keep going may still
 *            reopen and revisit the questions already asked. The bank is injected (create({bank})); without one the
 *            session keeps a private one of its own size (the node tests).
 *   ENDING   The session ends by itself only when nothing is ready, no lookup is pending and no branch is unsettled;
 *            Wrap up, the limit, and Grill Me turned off end it sooner, with the open items listed.
 *   GATES    A session gates one step (gate): 'start' (the split, round 1, the blind proposals, the Plan), or, for Grill
 *            Me turned on mid-run or a later decision asked mid-run, only the step that would use the answers
 *            ('part:export', 'round:2', 'vote' ...); work already running continues.
 *   CONFIRM  It ends in What we agreed (every decision with its answer, every decision left open) with Confirm and Keep
 *            going. Nothing acts on the answers until Confirm.
 *
 * Every refusal is { ok:false, error }. Nothing here touches the DOM. wonderer-grill.js puts the rounds through the
 * existing questionnaire (questions.js, the Ask Card), draws the design tree and draws What we agreed. */
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
  /* the bank behind each session; kept beside the record (a WeakMap), so the record stays plain data */
  var BANKS = typeof WeakMap === 'function' ? new WeakMap() : null;

  /* a private bank: the shape every injected bank has (limit, asked, has, charge) */
  function localBank(limit) {
    var asked = {}, order = [];
    return {
      limit: function () { return limit; },
      asked: function () { return order.length; },
      has: function (id) { return Object.prototype.hasOwnProperty.call(asked, id); },
      /* charge([{id, prompt}]): each new question once; refuses the whole batch past the limit */
      charge: function (items) {
        var fresh = items.filter(function (x) { return !Object.prototype.hasOwnProperty.call(asked, x.id); });
        if (fresh.length > limit - order.length) return fail('question_budget_exhausted');
        fresh.forEach(function (x) { asked[x.id] = 1; order.push(x.id); });
        return { ok: true, charged: fresh.length };
      }
    };
  }
  function bankOf(s) { return (BANKS && BANKS.get(s)) || (s._bank) || null; }
  function counter(s) { var b = bankOf(s); var lim = b ? b.limit() : s.cap, asked = b ? b.asked() : s.asked; return { asked: asked, limit: lim, left: Math.max(0, lim - asked) }; }

  function node(s, id) { return s.tree.filter(function (n) { return n.id === id; })[0] || null; }
  function settled(n) { return !!n && (n.state === 'answered' || n.state === 'found'); }
  function ready(s, n) { return (n.dependsOn || []).every(function (d) { return settled(node(s, d)); }); }
  function openRound(s) { var r = s.rounds[s.rounds.length - 1]; return r && r.status === 'open' ? r : null; }
  function charged(s, n) { var b = bankOf(s); return !!n.charged || !!(b && b.has(n.id)); }
  /* KEPT: a decision you answered keeps that submitted answer and its provenance (n.kept) while Keep going or Ask
     again reopens it for a revisit. A revisit you leave untouched withdraws nothing: Wrap up, the limit, Grill Me
     turned off or a natural end give it back as answered. Only a new answer you give, or Not sure, replaces it
     (Astra F1 = Opus N1, ruling 1 of round 2; ACD-503 "Keep going recomputes its frontier with the existing answers") */
  function keep(n) { if (n.state === 'answered' && n.answer != null) n.kept = { answer: n.answer, took: n.took }; n.prev = n.state === 'answered' ? n.answer : null; }
  function restore(n) { if (!n.kept) return false; n.state = 'answered'; n.answer = n.kept.answer; n.took = n.kept.took; n.openReason = null; n.notSure = false; n.kept = null; return true; }
  function settle(n, v) { n.answer = v; n.state = 'answered'; n.took = v === n.recommended ? 'recommended' : 'own'; n.openReason = null; n.kept = null; }

  /* create({by, subject, tree, cap, bank, gate, gateLabel}) - by: coordinator | moderator | assistant (never a Grill Me
     participant); bank: the run's or thread's one counter (else a private one of size cap); gate: the step that waits
     for Confirm ('start' by default), gateLabel its words ("the export part") */
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
    var bank = o.bank && typeof o.bank.charge === 'function' ? o.bank : localBank(Math.max(1, o.cap || 25));
    var s = {
      id: 'grill-' + (++seq), by: o.by, byName: NAME[o.by], subject: o.subject || '', status: 'grilling',
      asked: 0, tree: o.tree.map(function (n) {
        var x = copy(n); x.kind = x.kind === 'fact' ? 'fact' : 'decision'; x.state = 'pending'; x.answer = null; x.round = null; x.dependsOn = x.dependsOn || [];
        return x;
      }),
      rounds: [], routed: [], endedBy: null, confirmedAt: null, keepGoing: 0, log: [],
      gate: o.gate || 'start', gateLabel: o.gateLabel || '', later: !!o.gate && o.gate !== 'start'
    };
    if (BANKS) BANKS.set(s, bank); else Object.defineProperty(s, '_bank', { value: bank, enumerable: false });
    s.cap = bank.limit();
    return { ok: true, session: s };
  }

  /* next(s): route ready facts to research, then open the next round over the whole frontier, or end the session
     ({opened}, {waiting:'research'} or {ended}). The bank admits only as many NEW questions as it has left; a question
     it charged before comes back free. */
  function next(s) {
    if (s.status !== 'grilling') return fail('session_not_grilling');
    if (openRound(s)) return { ok: true, reused: true, round: openRound(s).n };
    s.tree.forEach(function (n) {
      if (n.kind === 'fact' && n.state === 'pending' && ready(s, n)) { n.state = 'researching'; s.routed.push(n.id); s.log.push({ kind: 'routed', id: n.id }); }
    });
    var frontier = s.tree.filter(function (n) { return n.kind === 'decision' && n.state === 'pending' && ready(s, n); });
    if (!frontier.length) {
      if (s.tree.some(function (n) { return n.state === 'researching'; })) return { ok: true, waiting: 'research' };
      return end(s, 'frontier_empty');
    }
    var b = bankOf(s), left = counter(s).left, admit = [], take = [];
    frontier.forEach(function (n) {
      if (charged(s, n)) take.push(n);
      else if (admit.length < left) { admit.push(n); take.push(n); }
    });
    if (!take.length) return end(s, 'cap');
    if (admit.length) {
      var ch = b.charge(admit.map(function (n) { return { id: n.id, prompt: n.prompt }; }));
      if (!ch.ok) return end(s, 'cap');
      s.asked += admit.length;
    }
    var r = { n: s.rounds.length + 1, ids: take.map(function (n) { return n.id; }), status: 'open', acceptedAll: false };
    take.forEach(function (n) { n.state = 'asked'; n.round = r.n; n.charged = true; n.answer = null; n.notSure = false; });
    s.rounds.push(r);
    s.log.push({ kind: 'round', n: r.n, ids: r.ids.slice(), charged: admit.length });
    return { ok: true, opened: r.n, ids: r.ids.slice() };
  }
  /* end(s, why): why is frontier_empty | wrap_up | cap | switched_off. A question in the open round that you did not
     answer stays open ("not answered"); a ready one never asked stays open ("not asked") */
  function end(s, why) {
    var r = openRound(s);
    if (r) { r.ids.forEach(function (id) { var n = node(s, id); if (n.state === 'asked' && n.answer == null) { if (!n.notSure && restore(n)) return; n.state = 'open'; n.openReason = n.notSure ? 'not_sure' : why === 'switched_off' ? 'off_unanswered' : 'wrapped_unanswered'; } }); r.status = 'answered'; }
    /* a revisited decision still waiting behind the round (or never re-asked) keeps the answer you submitted */
    s.tree.forEach(function (n) { if (n.kind === 'decision' && n.state === 'pending') restore(n); });
    if (why === 'cap') s.tree.forEach(function (n) { if (n.kind === 'decision' && n.state === 'pending' && ready(s, n)) { n.state = 'open'; n.openReason = 'cap'; } });
    s.status = 'agreeing'; s.endedBy = why;
    s.log.push({ kind: 'ended', why: why });
    return { ok: true, ended: why };
  }
  /* answer(s, id, value): an answer you gave (picked, changed or typed); null or 'not_sure' leaves it open */
  function answer(s, id, value) {
    var r = openRound(s); if (!r) return fail('no_open_round');
    var n = node(s, id); if (!n || r.ids.indexOf(id) < 0) return fail('not_in_this_round');
    if (value == null || value === 'not_sure') { n.answer = null; n.notSure = true; return { ok: true }; }
    if (!text(value)) return fail('answer_required');
    n.answer = String(value).trim(); n.notSure = false;
    return { ok: true };
  }
  /* one action accepts the whole round (cmd.questionnaire.submit): every question you have not answered takes its
     recommended answer; the ones you said Not sure about stay open */
  function acceptRound(s) {
    var r = openRound(s); if (!r) return fail('no_open_round');
    r.ids.forEach(function (id) { var n = node(s, id); if (n.answer == null && !n.notSure) n.answer = n.recommended; });
    r.acceptedAll = true;
    return { ok: true };
  }
  /* submitRound(s): the answers given in this round count; a question with none stays open as Not sure */
  function submitRound(s) {
    var r = openRound(s); if (!r) return fail('no_open_round');
    r.ids.forEach(function (id) {
      var n = node(s, id);
      if (n.answer != null) settle(n, n.answer);
      else { n.state = 'open'; n.openReason = 'not_sure'; n.kept = null; }
    });
    r.status = 'answered';
    s.log.push({ kind: 'answered', n: r.n });
    return next(s);
  }
  /* Wrap up (cmd.questionnaire.grill_me.wrap_up) ends questioning WITHOUT submitting incomplete drafts: the rounds you
     already sent stand, an answer you gave in this round stands, every other question in this round is open as not
     answered, and the ready ones not asked yet are open as not asked */
  function wrapUp(s, why) {
    if (s.status !== 'grilling') return fail('session_not_grilling');
    var r = openRound(s);
    if (r) r.ids.forEach(function (id) { var n = node(s, id); if (n.answer != null) settle(n, n.answer); });
    var off = why === 'switched_off';
    s.tree.forEach(function (n) { if (n.kind === 'decision' && n.state === 'pending' && !restore(n)) { n.state = 'open'; n.openReason = off ? 'off_unasked' : 'wrapped_up'; } });
    return end(s, off ? 'switched_off' : 'wrap_up');
  }
  /* Grill Me turned off while a session is open: it ends like Wrap up, with the open items listed */
  function switchOff(s) { return wrapUp(s, 'switched_off'); }
  /* research comes back with a fact; only the questions that hung on it were waiting */
  function factFound(s, id, fact) {
    var n = node(s, id); if (!n || n.kind !== 'fact') return fail('fact_missing');
    if (n.state !== 'researching') return fail('fact_not_routed');
    if (!text(fact)) return fail('fact_required');
    n.state = 'found'; n.answer = fact.trim();
    s.log.push({ kind: 'found', id: id });
    return s.status === 'grilling' && !openRound(s) ? next(s) : { ok: true };
  }
  var WHY = {
    not_sure: 'You said you weren’t sure yet.', wrapped_unanswered: 'Not answered: you wrapped up.', wrapped_up: 'Not asked: you wrapped up first.',
    cap: 'Not asked: the question limit was reached.', off_unanswered: 'Not answered: Grill Me was turned off.', off_unasked: 'Not asked: Grill Me was turned off.'
  };
  /* What we agreed: every decision with its answer, every decision left open (and why), the facts looked up, and the
     run's one counter */
  function agreed(s) {
    var dec = s.tree.filter(function (n) { return n.kind === 'decision'; });
    var why = function (n) {
      var wait = (n.dependsOn || []).map(function (d) { return node(s, d); }).filter(function (d) { return d && !settled(d); });
      if (n.state === 'open' && WHY[n.openReason]) return WHY[n.openReason];
      if (wait.length) return 'Waits on ' + wait.map(function (d) { return d.title || d.prompt; }).join(' and ') + '.';
      return n.openNote || 'Left open.';
    };
    var c = counter(s);
    return {
      decisions: dec.filter(function (n) { return n.state === 'answered'; }).map(function (n) { return { id: n.id, title: n.title || n.prompt, answer: n.answer, took: n.took, round: n.round }; }),
      open: dec.filter(function (n) { return n.state !== 'answered'; }).map(function (n) { return { id: n.id, title: n.title || n.prompt, why: why(n), reason: n.openReason || (n.state === 'pending' ? 'waits' : ''), canAsk: n.state === 'open' && ready(s, n) && (charged(s, n) || c.left > 0) }; }),
      facts: s.tree.filter(function (n) { return n.kind === 'fact' && n.state === 'found'; }).map(function (n) { return { id: n.id, title: n.title, fact: n.answer }; }),
      rounds: s.rounds.length, asked: s.asked, counter: c, endedBy: s.endedBy
    };
  }
  function confirm(s) {
    if (s.status === 'confirmed') return { ok: true, reused: true };
    if (s.status !== 'agreeing') return fail('nothing_to_confirm_yet');
    s.status = 'confirmed'; s.confirmedAt = new Date().toISOString();
    s.log.push({ kind: 'confirmed' });
    return { ok: true };
  }
  /* Keep going (cmd.questionnaire.grill_me.keep_going): back to the same interview, its answers and its counter. The
     questions that ended open because you wrapped up, the limit came or Grill Me went off come back; if none did, the
     ones you weren't sure about come back (you asked to keep going); if nothing is open, or the limit admits nothing
     left open, you revisit the answers you already gave, free: at the limit no NEW question is admitted (ACD-503). */
  function keepGoing(s) {
    if (s.status !== 'agreeing') return fail('nothing_to_keep_going_from');
    var c = counter(s), open = s.tree.filter(function (n) { return n.kind === 'decision' && n.state === 'open'; });
    var askable = function (n) { return ready(s, n) && (charged(s, n) || c.left > 0); };
    var back = open.filter(function (n) { return n.openReason !== 'not_sure' && askable(n); });
    if (!back.length) back = open.filter(askable);
    var revisit = !back.length;
    if (revisit) back = s.tree.filter(function (n) { return n.kind === 'decision' && n.state === 'answered'; });
    if (!back.length) return fail(c.left <= 0 ? 'question_limit_reached' : 'nothing_to_keep_going_from');
    s.status = 'grilling'; s.endedBy = null; s.keepGoing++;
    back.forEach(function (n) { keep(n); n.state = 'pending'; n.openReason = null; n.notSure = false; });
    /* the frontier is recomputed with the existing answers (ACD-503): a decision never asked because you wrapped up
       first, the limit came or Grill Me went off comes back too, and is asked once what it hangs off is settled */
    if (!revisit) open.forEach(function (n) { if (back.indexOf(n) < 0 && /^(wrapped_up|off_unasked|cap)$/.test(n.openReason || '') && (charged(s, n) || c.left > 0)) { n.state = 'pending'; n.openReason = null; } });
    s.log.push({ kind: 'keep_going', revisit: revisit, ids: back.map(function (n) { return n.id; }) });
    return next(s);
  }
  /* reopen(s, id): "Ask again" on an open row of What we agreed, or "Change" on an answered one; free when it was asked
     before, else it needs room in the bank */
  function reopen(s, id) {
    if (s.status !== 'agreeing') return fail('nothing_to_keep_going_from');
    var n = node(s, id); if (!n || n.kind !== 'decision') return fail('decision_missing');
    if (!ready(s, n)) return fail('waits_on_another_decision');
    if (!charged(s, n) && counter(s).left <= 0) return fail('question_budget_exhausted');
    s.status = 'grilling'; s.endedBy = null; s.keepGoing++;
    keep(n); n.state = 'pending'; n.openReason = null; n.notSure = false;
    s.log.push({ kind: 'reopen', id: id });
    return next(s);
  }
  /* what waits for Confirm: the split, round 1, the blind proposals, the Plan document, or the one later step */
  function holds(s) { return !!s && s.status !== 'confirmed'; }
  /* what research is looking up right now (the session shows it while it waits) */
  function lookups(s) { return s.tree.filter(function (n) { return n.kind === 'fact' && n.state === 'researching'; }).map(function (n) { return { id: n.id, title: n.title }; }); }
  function waiting(s) { return !!s && s.status === 'grilling' && !openRound(s) && lookups(s).length > 0; }
  function round(s) { return openRound(s); }
  function questions(s, r) { r = r || openRound(s); return r ? r.ids.map(function (id) { return node(s, id); }) : []; }
  /* map(s): the design tree as it stands, for the frontier map: settled (answered or found), frontier (in the open
     round), lookup (a fact research is finding), next (ready, not asked yet), waiting (hangs on something unsettled),
     open (left open); with what each node unlocks */
  function map(s) {
    var r = openRound(s);
    return s.tree.map(function (n) {
      var st = n.kind === 'fact' ? (n.state === 'found' ? 'found' : n.state === 'researching' ? 'lookup' : 'waiting')
        : n.state === 'answered' ? 'settled' : r && r.ids.indexOf(n.id) >= 0 ? 'frontier' : n.state === 'open' ? 'open' : ready(s, n) ? 'next' : 'waiting';
      return { id: n.id, kind: n.kind, title: n.title || n.prompt, state: st, answer: n.answer, took: n.took, dependsOn: (n.dependsOn || []).slice(),
        unlocks: s.tree.filter(function (x) { return (x.dependsOn || []).indexOf(n.id) >= 0; }).map(function (x) { return x.id; }),
        waitsOnLookup: (n.dependsOn || []).some(function (d) { var x = node(s, d); return x && x.kind === 'fact' && x.state === 'researching'; }) };
    });
  }
  return { create: create, next: next, answer: answer, acceptRound: acceptRound, submitRound: submitRound, wrapUp: wrapUp, switchOff: switchOff, factFound: factFound,
    agreed: agreed, confirm: confirm, keepGoing: keepGoing, reopen: reopen, holds: holds, lookups: lookups, waiting: waiting, round: round, questions: questions,
    node: node, ready: ready, map: map, counter: counter, localBank: localBank, BY: BY, NAME: NAME, copy: copy };
});
