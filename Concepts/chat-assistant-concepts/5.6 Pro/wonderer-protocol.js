/* wonderer-protocol.js - the Wonderer lead engine (DL-218, 2026-10-16; Plans/Collaborative_Workflows.md section 9.2,
 * CWR-041, CWR-043; the method itself is Plans/Skills_System.md SS-037).
 *
 * The Wonderer runs ALONGSIDE a Crew, a BrainStorm or a Chat Room and feeds what it finds back to the run's agents, who
 * decide what is worth exploring. This file is the rule book for that and nothing else: it keeps the passes and the
 * leads on run.wonderer and refuses whatever the canon refuses. Presentation is wonderer-grill.js; the BrainStorm
 * workspace document is lens-wonderer-batch13.js. It is UMD, so tests/wonderer-grill-verify.mjs runs it under node.
 *
 *   PASSES   The first pass starts with the run (in a BrainStorm, during intake, before the blind proposals take the
 *            concurrency). A further pass runs only when a core participant, the coordinator, the moderator or the user
 *            asks for one in an addressed message, at most two further passes; a failed pass does not count toward
 *            the two, and its retry keeps its number (2 or 3) with a new attempt identity; a pass asked for after a
 *            failed first pass is pass 2. A later pass queues behind core work when no slot is free (it is queued,
 *            never "waits its turn"). The Wonderer never asks itself. A pass works 3 or 4 of the method's eight angles; 3 to 5 leads is
 *            its target, not a minimum: it may stop early with one or two, or with none ("no new leads" is a truthful
 *            result), and it never returns more than 5. A lead without a tether is drift and is dropped; a lead
 *            without a source is not delivered. (Steer of 2026-10-20 from the two Plans reviews.)
 *   DELIVERY Every core participant and the coordinator or moderator get the pass summary; a lead's dossier opens on
 *            demand. In a BrainStorm a pass is HELD until every blind proposal is in, and released at Normalize.
 *   DECIDING The agents decide each lead as it arrives: explore | use | set_aside, with a one-line reason, recorded by
 *            the coordinator (Crew, BrainStorm) or the moderator (Chat Room): in the Debate for a BrainStorm's first
 *            pass, while splitting for a Crew, on delivery for any later pass. A disposition without a reason is
 *            refused. An explored lead ends supported (with evidence) or not supported (set aside, with the reason).
 *   CHECK IT The user's only override: it sends any lead to research, whatever its disposition, and never waits. On a
 *            lead already in research (or already checked) it shows that research instead of starting another. In a
 *            BrainStorm the request is recorded at once and researched in the Evidence round: no core participant
 *            reads a held lead, so research never starts on one (startResearch refuses).
 *   CLOSED   Once synthesis or a Crew's final result starts (close()), a new pass request and Check it are refused
 *            with lead_admission_closed: the team is writing the result.
 *   NEVER    The Wonderer never votes, never takes a debate or room turn, never argues for or against a proposal,
 *            never disposes, explores or sends its own leads to research.
 *   WAITS    BrainStorm's Write the plan and a Crew's final result are unavailable, with a stated reason, while a pass
 *            is in flight, a lead is undecided or a lead's research is in flight. A Chat Room never waits for the
 *            Wonderer: round 1 starts on time and a pass joins between turns; its summary lists every lead with its
 *            decision, or "not taken up".
 *   LISTING  A research result overrides the status shown, never the decision: the listing keeps the disposition, its
 *            reason and who recorded it beside the research outcome and its note (CWR-043).
 *
 * Every refusal is { ok:false, error } with a code; wonderer-grill.js words it (REFUSED). Nothing here touches the
 * DOM, a provider or the network. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PM56_WONDERER_ENGINE = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  var copy = function (x) { return x == null ? x : JSON.parse(JSON.stringify(x)); };
  var fail = function (error, extra) { var r = { ok: false, error: error }; if (extra) for (var k in extra) r[k] = extra[k]; return r; };
  var text = function (x) { return typeof x === 'string' && x.trim().length > 0; };
  var oneLine = function (x) { return text(x) && !/[\r\n]/.test(x) && x.trim().length <= 160; };
  var seq = 0;

  /* SS-037: the eight angles, by the words the run shows */
  var ANGLES = {
    history: 'History', adjacent: 'Adjacent field', contradiction: 'Contradiction', inversion: 'Inversion',
    scale: 'Scale boundary', human: 'Human dimension', dependency: 'Hidden dependency', future: 'Implied future'
  };
  var KINDS = { crew: 1, brainstorm: 1, chat_room: 1 };
  var DISPOSITIONS = { explore: 1, use: 1, set_aside: 1 };
  var MAX_PASSES = 3;              /* the first, plus at most two further passes that did not fail (CWR-041) */
  var MAX_FURTHER = 2;
  var TARGET_LEADS = [3, 5], MAX_LEADS = 5, MIN_ANGLES = 3, MAX_ANGLES = 4;   /* 3 to 5 is the target; 0 to 5 is allowed */
  var IN_FLIGHT = { queued: 1, exploring: 1 };

  /* the status a lead shows, in place (CWR-043): one word set, every surface reads it from here */
  var STATUS_WORD = {
    waiting: 'Waiting for the team', exploring: 'Exploring', using: 'Using', set_aside: 'Set aside',
    supported: 'Supported', not_supported: 'Not supported'
  };
  /* the team's decision, in the words a lead row and a listing show beside any research result */
  var DISPOSITION_WORD = { explore: 'Explore', use: 'Use', set_aside: 'Set aside' };

  function recorderOf(kind) { return kind === 'chat_room' ? 'moderator' : 'coordinator'; }
  function isWonderer(p) { return !!p && String(p.additiveRoleKind || '').toLowerCase() === 'wonderer'; }

  function Protocol(opts) {
    opts = opts || {};
    this.now = typeof opts.now === 'function' ? opts.now : function () { return new Date().toISOString(); };
  }
  var P = Protocol.prototype;

  P.receipt = function (r, kind, data) {
    var x = { id: 'wonder-receipt-' + (++seq), kind: kind, runId: r.id, at: this.now() };
    if (data) for (var k in data) x[k] = copy(data[k]);
    r.wonderer.receipts.push(x);
    return x;
  };
  P.state = function (r) { return r && r.wonderer && r.wonderer.version === 2 ? r.wonderer : null; };
  P.participant = function (r) { return ((r && r.participants) || []).filter(isWonderer)[0] || null; };

  /* attach(run, {seed, seedId, kind}) - a run with a Wonderer participant gets its record; the first pass starts with
     the run (startPass with by.kind 'start'). */
  P.attach = function (r, input) {
    if (!r) return fail('run_missing');
    if (this.state(r)) return { ok: true, reused: true };
    input = input || {};
    var kind = input.kind || r.kind;
    if (!KINDS[kind]) return fail('kind_has_no_wonderer');
    var p = this.participant(r);
    if (!p) return fail('wonderer_not_configured');
    if (!text(input.seed)) return fail('seed_required');
    r.wonderer = {
      version: 2, kind: kind, seed: input.seed, seedId: input.seedId || ('seed-' + r.id), participantId: p.id,
      persona: 'Wonderer', methodologySkill: 'builtin:wonderer', recorder: recorderOf(kind),
      held: kind === 'brainstorm', passes: [], leads: [], dropped: [], refused: [], receipts: [], defaultVote: 'abstain', closedAt: null
    };
    this.receipt(r, 'attached', { runKind: kind });
    return { ok: true };
  };

  /* who may ask for a pass: the run itself (the first pass), a core participant, the coordinator, the moderator or the
     user, in an addressed message. The Wonderer never asks itself. */
  /* the further passes that count toward the two: every later pass that did not fail */
  function further(w) { return w.passes.filter(function (x) { return x.by.kind !== 'start' && x.status !== 'failed'; }).length; }
  /* requestPass(run, {by, about, messageId, queue}) - queue: no slot is free for it yet (a later pass queues behind core
     work); startQueued() starts it when one frees up */
  P.requestPass = function (r, req) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    req = req || {};
    var by = req.by || {}, passes = w.passes;
    if (w.closedAt) return fail('lead_admission_closed');
    if (by.kind === 'start') {
      if (passes.length) return fail('first_pass_already_started');
    } else {
      if (by.kind === 'wonderer' || (by.id && by.id === w.participantId)) return fail('wonderer_cannot_request_pass');
      if (!/^(participant|coordinator|moderator|user)$/.test(String(by.kind || ''))) return fail('pass_request_needs_an_asker');
      if (!text(req.messageId)) return fail('pass_request_must_be_addressed');
      if (!passes.length) return fail('first_pass_not_started');
      if (further(w) >= MAX_FURTHER) { w.refused.push({ at: this.now(), by: copy(by), reason: 'pass_limit' }); return fail('pass_limit'); }
    }
    if (passes.some(function (x) { return IN_FLIGHT[x.status]; })) return fail('pass_running');
    var queued = !!req.queue && by.kind !== 'start';
    /* the pass number: 1 for the first; a further pass is 1 + the further passes delivered + 1, so a retry of a failed
       further pass keeps its number (2 or 3), and a pass after a failed first pass is pass 2 (CWR-041) */
    var delivered = passes.filter(function (x) { return x.by.kind !== 'start' && x.status !== 'failed'; }).length;
    var n = by.kind === 'start' ? 1 : 2 + delivered, attempt = passes.filter(function (x) { return x.n === n; }).length + 1;
    if (n > MAX_PASSES) return fail('pass_limit');
    var pass = { id: 'pass-' + r.id + '-' + n + (attempt > 1 ? '-a' + attempt : ''), n: n, attempt: attempt, attemptId: 'attempt-' + r.id + '-' + n + '-' + attempt, by: copy(by), about: req.about || '', askedIn: req.messageId || null, messageId: null,
      status: queued ? 'queued' : 'exploring', queuedAt: queued ? this.now() : null, startedAt: queued ? null : this.now(), deliveredAt: null, releasedAt: null, summary: '', territory: '', angles: [], leadIds: [] };
    passes.push(pass);
    this.receipt(r, queued ? 'pass_queued' : 'pass_started', { passId: pass.id, by: by });
    return { ok: true, pass: copy(pass), left: this.passesLeft(r), queued: queued };
  };
  P.startQueued = function (r) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var pass = w.passes.filter(function (x) { return x.status === 'queued'; })[0];
    if (!pass) return fail('nothing_queued');
    pass.status = 'exploring'; pass.startedAt = this.now();
    this.receipt(r, 'pass_started', { passId: pass.id, from: 'queue' });
    return { ok: true, passId: pass.id };
  };
  P.passesLeft = function (r) { var w = this.state(r); return w ? Math.max(0, MAX_FURTHER - further(w)) : 0; };
  /* close(): synthesis or a Crew's final result has started; nothing new reaches the team after this */
  P.close = function (r) { var w = this.state(r); if (!w) return { ok: true }; if (!w.closedAt) { w.closedAt = this.now(); this.receipt(r, 'closed'); } return { ok: true }; };

  /* deliver(run, passId, {summary, territory, angles:[{key, signal}], leads:[{id, angle, title, tether, source, dossier}]})
     A lead without a tether is drift (dropped); a lead without a source is not delivered. The pass needs 3-4 angles and,
     after the drops, at most 5 leads: 3 to 5 is the target, so 1, 2 or none is a truthful early stop (stoppedEarly).
     In a BrainStorm the pass is held until release(). */
  P.deliver = function (r, passId, out) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var pass = w.passes.filter(function (x) { return x.id === passId; })[0];
    if (!pass) return fail('pass_missing');
    if (pass.status !== 'exploring') return fail('pass_already_delivered');
    out = out || {};
    var angles = Array.isArray(out.angles) ? out.angles : [];
    if (angles.length < MIN_ANGLES || angles.length > MAX_ANGLES || angles.some(function (a) { return !ANGLES[a && a.key]; })) return fail('three_or_four_angles');
    if (!text(out.summary)) return fail('summary_required');
    if ((out.leads || []).length > MAX_LEADS) return fail('at_most_five_leads');
    var kept = [], dropped = [], self = this, seen = {};
    w.leads.forEach(function (l) { seen[l.id] = 1; });
    (out.leads || []).forEach(function (x) {
      if (!x || !text(x.id) || seen[x.id]) { dropped.push({ id: x && x.id, reason: 'invalid_or_duplicate' }); return; }
      if (!text(x.title) || !ANGLES[x.angle]) { dropped.push({ id: x.id, reason: 'invalid_lead' }); return; }
      if (!text(x.tether)) { dropped.push({ id: x.id, reason: 'drift_no_tether' }); return; }
      var s = x.source || {};
      if (!(s.kind === 'url' && text(s.url)) && !(s.kind === 'message' && text(s.messageId))) { dropped.push({ id: x.id, reason: 'no_source' }); return; }
      kept.push(x);
    });
    if (kept.length > MAX_LEADS) return fail('at_most_five_leads', { kept: kept.length, dropped: dropped });
    var n0 = w.leads.length;
    kept.forEach(function (x, i) {
      w.leads.push({ id: x.id, n: n0 + i + 1, passId: pass.id, angle: x.angle, title: x.title, tether: x.tether, source: copy(x.source),
        dossier: copy(x.dossier || null), check: copy(x.check || null), disposition: null, research: null, takenUpBy: [], checkedByUser: false, hypothesis: true });
      pass.leadIds.push(x.id);
    });
    dropped.forEach(function (d) { w.dropped.push({ passId: pass.id, id: d.id, reason: d.reason }); });
    pass.summary = out.summary; pass.territory = out.territory || ''; pass.angles = angles.map(function (a) { return { key: a.key, name: ANGLES[a.key], signal: a.signal || '' }; });
    /* fewer than the target is a truthful result: it stopped early, or found nothing new */
    pass.stoppedEarly = kept.length < TARGET_LEADS[0]; pass.stopReason = out.stopReason || '';
    pass.deliveredAt = this.now();
    pass.status = w.held ? 'held' : 'delivered';
    if (pass.status === 'delivered') pass.releasedAt = pass.deliveredAt;
    this.receipt(r, pass.status === 'held' ? 'pass_held' : 'pass_delivered', { passId: pass.id, leads: pass.leadIds, dropped: dropped });
    return { ok: true, held: pass.status === 'held', delivered: copy(pass.leadIds), dropped: dropped };
  };
  /* failPass: a Wonderer that fails, times out or is unavailable is recorded with that outcome; the run goes on. */
  P.failPass = function (r, passId, outcome) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var pass = w.passes.filter(function (x) { return x.id === passId; })[0];
    if (!pass || !IN_FLIGHT[pass.status]) return fail('pass_missing');
    pass.status = 'failed'; pass.outcome = /^(failed|timed_out|unavailable)$/.test(outcome) ? outcome : 'failed';
    this.receipt(r, 'pass_failed', { passId: passId, outcome: pass.outcome });
    return { ok: true };
  };
  /* release(run, {proposalsIn}) - BrainStorm, at Normalize: only once every blind proposal is in */
  P.release = function (r, o) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    if (!w.held) return { ok: true, reused: true };
    if (!(o && o.proposalsIn === true)) return fail('blind_proposals_not_in');
    w.held = false;
    var at = this.now(), released = [];
    w.passes.forEach(function (x) { if (x.status === 'held') { x.status = 'delivered'; x.releasedAt = at; released.push(x.id); } });
    this.receipt(r, 'passes_released', { passes: released });
    return { ok: true, released: released };
  };
  /* who sees a pass: nobody but the Wonderer while it is held (CWR-041: no core participant reads a BrainStorm pass
     before every blind proposal is in) */
  P.visible = function (r, passId) {
    var w = this.state(r); if (!w) return false;
    var pass = w.passes.filter(function (x) { return x.id === passId; })[0];
    return !!pass && pass.status === 'delivered';
  };
  P.lead = function (r, id) { var w = this.state(r); return w ? w.leads.filter(function (l) { return l.id === id; })[0] || null : null; };
  P.passOf = function (r, lead) { var w = this.state(r); return w && lead ? w.passes.filter(function (x) { return x.id === lead.passId; })[0] || null : null; };

  /* dispose(run, leadId, {kind, reason, by:{role, name, id}}) - the agents' decision, recorded by the coordinator or,
     in a Chat Room, the moderator, with a one-line reason that is shown */
  P.dispose = function (r, id, d) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var l = this.lead(r, id); if (!l) return fail('lead_missing');
    d = d || {};
    var by = d.by || {};
    if (by.role === 'wonderer' || (by.id && by.id === w.participantId)) return fail('wonderer_cannot_dispose');
    if (by.role !== w.recorder) return fail(w.recorder === 'moderator' ? 'moderator_records_dispositions' : 'coordinator_records_dispositions');
    if (!this.visible(r, l.passId)) return fail('lead_held_until_proposals_in');
    if (!DISPOSITIONS[d.kind]) return fail('unknown_disposition');
    if (!oneLine(d.reason)) return fail('one_line_reason_required');
    if (l.disposition) return l.disposition.kind === d.kind && l.disposition.reason === d.reason ? { ok: true, reused: true } : fail('already_decided');
    l.disposition = { kind: d.kind, reason: d.reason.trim(), by: { role: by.role, name: by.name || (by.role === 'moderator' ? 'Moderator' : 'Coordinator') }, at: this.now(), messageId: d.messageId || null };
    if (d.kind === 'explore' && !l.research) l.research = { status: 'queued', via: 'explore', by: null, assignmentId: d.assignmentId || null };
    this.receipt(r, 'lead_disposed', { leadId: id, disposition: l.disposition });
    return { ok: true };
  };
  /* Check it (cmd.collaboration.research_lead): the user's override, on any lead, whatever its disposition; it never
     waits for the agents. A lead already in research or with a result keeps it. */
  P.checkIt = function (r, id, o) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var l = this.lead(r, id); if (!l) return fail('lead_missing');
    if (o && o.takesRequests === false) return fail('run_takes_no_requests');
    if (w.closedAt) return fail('lead_admission_closed');
    /* a lead already in research, or already checked, shows that research; no second one starts */
    if (l.research) return { ok: true, existing: true, research: copy(l.research) };
    l.checkedByUser = true;
    /* in a BrainStorm the request is recorded now and researched in the Evidence round (section 8.5) */
    l.research = { status: 'queued', via: 'check_it', by: null, assignmentId: null, when: w.kind === 'brainstorm' ? 'evidence' : 'next' };
    this.receipt(r, 'check_it', { leadId: id });
    return { ok: true };
  };
  /* research is a core agent's job, never the Wonderer's */
  P.startResearch = function (r, id, by) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var l = this.lead(r, id); if (!l) return fail('lead_missing');
    by = by || {};
    if (by.role === 'wonderer' || (by.id && by.id === w.participantId)) return fail('wonderer_cannot_research');
    if (!l.research || l.research.status !== 'queued') return fail('nothing_to_research');
    /* no core participant reads a held lead (CWR-041), so research never starts on one */
    if (!this.visible(r, l.passId)) return fail('lead_held_until_proposals_in');
    l.research.status = 'running'; l.research.by = { id: by.id || null, name: by.name || 'A helper', role: by.role || 'participant' }; l.research.startedAt = this.now();
    this.receipt(r, 'research_started', { leadId: id, by: l.research.by });
    return { ok: true };
  };
  P.finishResearch = function (r, id, x) {
    var w = this.state(r); if (!w) return fail('wonderer_not_configured');
    var l = this.lead(r, id); if (!l) return fail('lead_missing');
    if (!l.research || l.research.status !== 'running') return fail('research_not_running');
    x = x || {};
    if (x.outcome === 'supported') {
      if (!x.evidence || !text(x.evidence.label)) return fail('supported_needs_evidence');
      l.hypothesis = false;
    } else if (x.outcome !== 'not_supported') return fail('unknown_outcome');
    if (!oneLine(x.note)) return fail('one_line_reason_required');
    l.research.status = x.outcome; l.research.note = x.note.trim(); l.research.evidence = copy(x.evidence || null); l.research.at = this.now();
    this.receipt(r, 'research_finished', { leadId: id, outcome: x.outcome });
    return { ok: true };
  };
  /* a participant message that takes up a lead links to it (CWR-043) */
  P.takeUp = function (r, id, messageId, who) {
    var l = this.lead(r, id); if (!l) return fail('lead_missing');
    if (!text(messageId)) return fail('message_required');
    var w = this.state(r);
    if (who && (who.role === 'wonderer' || (who.id && who.id === w.participantId))) return fail('wonderer_cannot_take_up_its_own_lead');
    if (l.takenUpBy.indexOf(messageId) < 0) l.takenUpBy.push(messageId);
    return { ok: true };
  };

  /* the Wonderer never votes and never takes a turn (CWR-041); every protocol asks these */
  P.canVote = function (p) { return !isWonderer(p); };
  P.canTakeTurn = function (p) { return !isWonderer(p); };

  /* one status per lead, in place: waiting for the team, exploring, using, set aside, supported, not supported */
  P.status = function (l) {
    if (!l) return 'waiting';
    var rs = l.research && l.research.status;
    if (rs === 'supported') return 'supported';
    if (rs === 'not_supported') return 'not_supported';
    if (rs === 'queued' || rs === 'running') return 'exploring';
    if (l.disposition && l.disposition.kind === 'use') return 'using';
    if (l.disposition && l.disposition.kind === 'set_aside') return 'set_aside';
    return 'waiting';
  };
  P.statusWord = function (l) { return STATUS_WORD[this.status(l)]; };
  /* the run card's summary line (CWR-043): leads explored, used, set aside and undecided. A lead the team has not
     decided counts undecided whatever its research, so the card agrees with the gate; held leads are undecided */
  P.counts = function (r) {
    var w = this.state(r), self = this, c = { total: 0, explored: 0, used: 0, setAside: 0, waiting: 0, exploring: 0, supported: 0, notSupported: 0, held: 0, undecided: 0, checking: 0, passes: 0 };
    if (!w) return c;
    c.passes = w.passes.length;
    w.leads.forEach(function (l) {
      var s = self.status(l), rs = l.research && l.research.status;
      c.total++;
      if (!self.visible(r, l.passId)) c.held++;
      if (rs === 'queued' || rs === 'running') c.checking++;
      if (rs === 'supported') c.supported++;
      if (rs === 'not_supported') c.notSupported++;
      if (!l.disposition) { c.undecided++; return; }
      if (s === 'exploring' || s === 'supported' || s === 'not_supported') c.explored++;
      if (s === 'exploring') c.exploring++;
      if (s === 'using') c.used++;
      if (s === 'set_aside') c.setAside++;
    });
    c.waiting = c.undecided;
    return c;
  };
  /* what waits (CWR-041): BrainStorm synthesis and a Crew's final result wait while a pass is in flight (exploring or
     queued), any lead is undecided or in research; a Chat Room never waits. code: '' | exploring | held | undecided |
     research */
  P.gate = function (r) {
    var w = this.state(r), self = this;
    if (!w || w.kind === 'chat_room') return { ok: true, code: '', count: 0 };
    if (w.passes.some(function (x) { return IN_FLIGHT[x.status]; })) return { ok: false, code: 'exploring', count: 0 };
    var held = w.leads.filter(function (l) { return !self.visible(r, l.passId); });
    if (held.length) return { ok: false, code: 'held', count: held.length };
    var undecided = w.leads.filter(function (l) { return !l.disposition; });
    if (undecided.length) return { ok: false, code: 'undecided', count: undecided.length, ids: undecided.map(function (l) { return l.id; }) };
    var research = w.leads.filter(function (l) { return l.research && (l.research.status === 'queued' || l.research.status === 'running'); });
    if (research.length) return { ok: false, code: 'research', count: research.length, ids: research.map(function (l) { return l.id; }) };
    return { ok: true, code: '', count: 0 };
  };
  /* the result, the Plan or the room summary lists every lead with its decision and reason, or "not taken up" */
  P.listing = function (r) {
    var w = this.state(r), self = this;
    if (!w) return [];
    return w.leads.map(function (l) {
      var s = self.status(l), d = l.disposition, rs = l.research, done = rs && (rs.status === 'supported' || rs.status === 'not_supported');
      return { id: l.id, n: l.n, pass: (self.passOf(r, l) || {}).n || 1, title: l.title, angle: ANGLES[l.angle], tether: l.tether, status: s,
        word: !d && !rs && w.kind === 'chat_room' ? 'Not taken up' : STATUS_WORD[s],
        /* the team's decision stays beside the research outcome (CWR-043) */
        disposition: d ? d.kind : null, dispositionWord: d ? DISPOSITION_WORD[d.kind] : '', dispositionReason: d ? d.reason : '', recordedBy: d ? d.by.name : '',
        research: rs ? rs.status : null, researchWord: done ? STATUS_WORD[rs.status] : rs ? 'Exploring' : '', researchNote: done ? rs.note : '', researchBy: rs && rs.by ? rs.by.name : '',
        reason: done ? rs.note : d ? d.reason : '',
        checkedByUser: l.checkedByUser, hypothesis: l.hypothesis, evidence: rs && rs.evidence ? copy(rs.evidence) : null };
    });
  };
  return { Protocol: Protocol, ANGLES: ANGLES, STATUS_WORD: STATUS_WORD, DISPOSITION_WORD: DISPOSITION_WORD, MAX_PASSES: MAX_PASSES, MAX_FURTHER: MAX_FURTHER, TARGET_LEADS: TARGET_LEADS, copy: copy, recorderOf: recorderOf, isWonderer: isWonderer };
});
