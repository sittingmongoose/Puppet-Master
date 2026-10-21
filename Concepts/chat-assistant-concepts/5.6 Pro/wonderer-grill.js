/* wonderer-grill.js - feature module. OWNER: DL-218 in the chat (2026-10-20): the Wonderer runs alongside a Crew, a
 * Chat Room or a BrainStorm and feeds its leads to the agents, who decide each one; Grill Me is a switch that makes
 * whoever already talks to you grill you. Canon: Plans/Decision_Log.md DL-218; Plans/Collaborative_Workflows.md
 * section 9 and CWR-041..043; Plans/Skills_System.md SS-037, SS-038; Plans/Assistant_Plan_Runtime.md APR-072;
 * Plans/FinalGUISpec.md F3-594, F3-595. This concept is a behaviour reference, not production (DL-220).
 *
 * WHAT THIS FILE OWNS
 *   - The one lead engine on runs (wonderer-protocol.js) and the Grill Me sessions (grill-protocol.js), on runs and,
 *     for Plan and Deep Plan, on threads. The kind protocols call PM56_WG; they never keep a second copy.
 *   - How a Wonderer pass shows: one Wonderer message per pass, in the main chat and in the run's conversation, that
 *     lists its leads, each with its angle, its tether, its source and ONE status that changes in place (waiting for
 *     the team, exploring, using, set aside, supported, not supported) with the reason and who recorded it, and Check
 *     it while the run takes requests; a participant message that takes up a lead links to it; the run card's summary
 *     line and the Wonderer lane (exploring, then the lead count; never "waits its turn"); the Wonderer section of
 *     every run view.
 *   - How Grill Me shows: no seat, no row, no lane of its own. The Coordinator or the Moderator stands behind the
 *     kettle (module-shell.js) and its lane reads "Grilling you · round N"; the rounds go through the existing
 *     questionnaire (questions.js, the Ask Card): numbered questions, the recommended answer preselected, Accept all
 *     and Wrap up; the session ends in one What we agreed card with Confirm and Keep going, and the split, round 1, the
 *     blind proposals or the Plan wait for Confirm.
 * The Demo Studio flows that play all of it are wonderer-grill-demos.js (Crew, Chat Room, Deep Plan) and
 * lens-wonderer-batch13.js (BrainStorm). Every record is a concept fixture: no provider, network or native call. */
(function () {
  'use strict';
  var E = window.PM56_EXT; if (!E || !E.slot || !E.action) return;
  var WE = window.PM56_WONDERER_ENGINE, GE = window.PM56_GRILL_ENGINE;
  if (!WE || !GE) return;
  var engine = new WE.Protocol();
  var THREAD_GRILL = {};            /* threadId -> Grill Me session for Plan / Deep Plan (the assistant grills) */
  var HOOKS = {};                   /* key -> {onConfirm, onRound, onKeepGoing} from whoever started a session */
  var FLASH = { key: '', at: 0 };   /* the lead a "takes up" link pointed at, lit once in the run view */

  function C() { return window.PM56_COLLAB; }
  function S() { return window.PM56_SHELL; }
  function D() { return window.PM56_DATA; }
  function ctx() { return E.ctx(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function list(a) { return Array.isArray(a) ? a : []; }
  function copy(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function run(id) { var c = C(); return c && c.run ? c.run(id) : null; }
  function render() { var c = ctx(); c.renderApp(); c.renderOverlays(); }
  function words(list2) { return list2.length <= 1 ? (list2[0] || '') : list2.slice(0, -1).join(', ') + ' and ' + list2[list2.length - 1]; }

  /* ================================================================ 1. run facts */
  function leadRole(r) { return r && r.kind === 'chat_room' ? 'moderator' : 'coordinator'; }
  function leadName(r) { return r && r.kind === 'chat_room' ? 'Moderator' : 'Coordinator'; }
  function grillOn(r) { return !!(r && r.config && r.config.grill_me_enabled); }
  function wondererP(r) { return list(r && r.participants).filter(function (p) { return p.additiveRoleKind === 'wonderer'; })[0] || null; }
  function wState(r) { return engine.state(r); }
  function takesRequests(r) { return !!r && (r.status === 'running' || r.status === 'paused' || r.status === 'blocked'); }
  /* the session on a run, or on a thread for Plan and Deep Plan; key: 'run:<id>' | 'thread:<id>' */
  function keyOf(o) { return o && o.id && o.kind && o.participants ? 'run:' + o.id : String(o || ''); }
  /* every Grill Me session on a run, in order: the first gates the start (the split, round 1, the blind proposals);
     a later one (Grill Me turned on mid-run, or a later decision) gates only the one step that needs its answers */
  function sessionsOf(r) { return r ? (r.grills || (r.grill ? [r.grill] : [])) : []; }
  function activeSession(r) { var a = sessionsOf(r).filter(function (s) { return s.status === 'grilling' || s.status === 'agreeing'; }); return a[a.length - 1] || null; }
  function sessionOf(key, id) {
    key = keyOf(key);
    if (key.indexOf('run:') === 0) {
      var r = run(key.slice(4)); if (!r) return null;
      if (id) return sessionsOf(r).filter(function (s) { return s.id === id; })[0] || null;
      return activeSession(r) || r.grill || null;
    }
    if (key.indexOf('thread:') === 0) { var t = THREAD_GRILL[key.slice(7)]; return t && (!id || t.id === id) ? t : null; }
    return null;
  }
  function ownerThread(key) {
    key = keyOf(key);
    if (key.indexOf('run:') === 0) { var r = run(key.slice(4)); return r ? r.threadId : null; }
    return key.slice(7);
  }
  /* Grill Me holds what waits for Confirm: the split, round 1, the blind proposals, the Plan document (CWR-042) */
  function holds(r) { var s = r && r.grill; return !!s && !s.later && GE.holds(s); }
  /* a later session holds only its own step ('part:export', 'round:2', 'vote' ...); work already running continues */
  function stepHeld(r, step) { return sessionsOf(r).some(function (s) { return s.gate === step && GE.holds(s); }); }
  /* your move only while a round is open or What we agreed waits for Confirm (a lookup is not your move) */
  function syncPending(r) { if (!r || !r.participants) return; var s = activeSession(r); r.pendingUserDecision = !!(s && ((s.status === 'grilling' && GE.round(s)) || s.status === 'agreeing')); }
  /* what waits for the session's Confirm, in words */
  function waitsFor(r, s) {
    if (s && s.later) return s.gateLabel || 'the next step';
    if (!r) return 'the plan';
    return r.kind === 'crew' ? 'the split' : r.kind === 'chat_room' ? 'round 1' : 'the blind proposals';
  }
  function cap(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ---- the one question counter (QuestionBank; Plans/Collaborative_Workflows.md 8.4 and 9.3, QMAX-005..007) ----
     Every Grill Me session on a run or a thread borrows the same bank: a BrainStorm's budget (base plus extension),
     a Crew's or a Chat Room's (baseline 0, the extension is the whole maximum; it opens when Grill Me is first turned
     on), and a Deep Plan thread's (Deep Thorough 10 + 25). A question is charged once, on its first presentation. */
  var THREAD_BANK = {};
  function ownerBank(O, k) {
    return { limit: function () { return O.projection(k).effective_limit; }, asked: function () { return O.projection(k).questions_asked; },
      has: function (id) { var x = O.get(k); return !!(x && Object.prototype.hasOwnProperty.call(x.asked, 'grill:' + id)); },
      charge: function (items) { var res = O.admitMany(k, items.map(function (x) { return { question_item_id: 'grill:' + x.id, prompt: x.prompt }; })); return res.ok ? { ok: true, charged: res.charged_count } : { ok: false, error: res.error }; } };
  }
  function listBank(b) {
    return { limit: function () { return b.effective_limit; }, asked: function () { return b.asked.length; }, has: function (id) { return b.asked.indexOf(id) >= 0; },
      charge: function (items) {
        var fresh = items.filter(function (x) { return b.asked.indexOf(x.id) < 0; });
        if (fresh.length > b.effective_limit - b.asked.length) return { ok: false, error: 'question_budget_exhausted' };
        fresh.forEach(function (x) { b.asked.push(x.id); }); return { ok: true, charged: fresh.length };
      } };
  }
  /* a Crew's or Chat Room's bank, opened the first time Grill Me is on (earlier needs-you prompts are not charged) */
  function openRunBank(r) {
    if (!r || r.kind === 'brainstorm' || r.kind === 'review') return null;
    if (!r.grillBank) r.grillBank = { collaboration_run_id: r.id, kind: r.kind, baseline_limit: 0, grill_extension: 25, effective_limit: 25, asked: [], routed: [], openedAt: new Date().toISOString() };
    return r.grillBank;
  }
  function bankFor(key, bankKey) {
    key = keyOf(key);
    var P = window.PM56_PLANS, O = P && P.budgetOwner;
    /* a Plan's own counter (its Question budget), when the session grills you about that Plan */
    if (bankKey && O && O.get(bankKey)) return ownerBank(O, bankKey);
    if (key.indexOf('run:') === 0) {
      var r = run(key.slice(4)); if (!r) return null;
      var k = r.kind === 'brainstorm' && r.brainstorm && r.brainstorm.questionBank && r.brainstorm.questionBank.budgetKey;
      if (k && O && O.get(k)) return ownerBank(O, k);
      return listBank(openRunBank(r));
    }
    var tid = key.slice(7), tk = 'plan:wg-thread-' + tid;
    if (O) { if (!O.get(tk)) O.ensure(tk, 'deep_thorough', true); return ownerBank(O, tk); }
    THREAD_BANK[tid] = THREAD_BANK[tid] || { effective_limit: 35, asked: [] };
    return listBank(THREAD_BANK[tid]);
  }

  /* ================================================================ 2. attach at Start */
  /* collaboration.js calls this once a run exists (the wand's commit and admitCrewWork). The Wonderer's record and,
     with Grill Me on, the definition flag; a wand-started run is born waiting (nothing runs in this preview), so its
     first pass and its interview start only when a recorded example plays them. */
  function attach(r, d) {
    if (!r) return;
    r.config = r.config || {};
    if (r.kind !== 'review') r.config.grill_me_enabled = !!(d && d.grillMe);
    if (grillOn(r)) openRunBank(r);
    if (wondererP(r) && !wState(r)) engine.attach(r, { kind: r.kind, seed: r.purpose || r.title || 'the run’s topic', seedId: 'seed-' + r.id });
  }

  /* ================================================================ 3. words and marks */
  var STATUS_MARK = { waiting: 'pending', exploring: 'reviewing', using: 'mixed', set_aside: 'skipped', supported: 'complete', not_supported: 'skipped', held: 'waiting-dep' };
  var REFUSED = {
    wonderer_cannot_dispose: 'The Wonderer never decides its own leads.', wonderer_cannot_research: 'The Wonderer never explores its own leads.',
    wonderer_cannot_request_pass: 'The Wonderer never asks for its own pass.', coordinator_records_dispositions: 'The Coordinator records each decision.',
    moderator_records_dispositions: 'The Moderator records each decision.', one_line_reason_required: 'Every decision needs a one-line reason.',
    lead_held_until_proposals_in: 'Held until every blind proposal is in.', research_running: 'This lead is being checked already.',
    research_has_result: 'This lead already has its result.', run_takes_no_requests: 'This run has finished, so it takes no more requests.',
    pass_limit: 'This run already had its two extra passes.', pass_running: 'A pass is already exploring or queued.', pass_request_must_be_addressed: 'Ask the Wonderer in a message first.',
    lead_admission_closed: 'The team is writing the result.', at_most_five_leads: 'A pass hands over five leads at most.',
    pass_reserved: 'This recording asks the Wonderer for its next pass itself. Ask after that pass.'
  };
  function refusedText(code) { return REFUSED[code] || 'That didn’t change anything.'; }
  function wMark(size, state) { return S().pmxMark({ role: 'wonderer', seat: 7, size: size || 22, state: state || 'idle' }); }
  function leadMark(r, size, state, grill) { return S().pmxMark({ role: leadRole(r), size: size || 22, state: state || 'idle', grill: grill }); }
  function hostOf(url) {
    var m = /^https?:\/\/([^\/?#]+)([^?#]*)/i.exec(String(url || ''));
    if (!m) return String(url || '');
    var host = m[1].replace(/^www\./, ''), tail = m[2].replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
    tail = decodeURIComponent(tail).replace(/[-_]+/g, ' ').replace(/\.(html?|php|aspx?)$/i, '').replace(/^rfc(\d+)$/i, 'RFC $1');
    return tail ? host + ' · ' + tail : host;
  }
  function sourceLine(r, l) {
    var s = l.source || {}, G = S().pmxGlyph;
    if (s.kind === 'url') return '<p class="wg-lead-src">' + G('globe', 12) + '<a class="wg-src-link" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" data-hover-key="wg-src:' + esc(l.id) + '" data-hover-tip="' + esc(s.url) + '">' + esc(s.label || hostOf(s.url)) + '</a></p>';
    var m = list(r.messages).filter(function (x) { return x.id === s.messageId; })[0];
    var who = s.label || (m ? (m.senderKind === 'user' ? 'your message' : (m.senderName || 'a helper') + '’s message') : 'a message in this run');
    return '<p class="wg-lead-src">' + G('quote', 12) + '<span>From ' + esc(who) + (m && m.body ? ': <q>' + esc(String(m.body).split(/(?<=[.!?])\s/)[0].slice(0, 96)) + '</q>' : '') + '</span></p>';
  }
  function byLine(r, who, size) {
    var role = who && who.role ? who.role : leadRole(r);
    return '<span class="wg-by">' + S().pmxMark({ role: role, size: size || 12 }) + '<span>' + esc((who && who.name) || leadName(r)) + '</span></span>';
  }
  /* one status, in place, with the reason and who recorded it (CWR-043). The status line is what the lead is now; a
     research result overrides it (supported, not supported) WITHOUT erasing the team's decision: the decision line,
     with its quoted reason and who recorded it, stays under it (M4). A held BrainStorm lead stays "waiting for the
     team" and says when a Check it you asked for is researched (B1); research that happened is never hidden. */
  function statusMark(st) {
    /* research outcomes have their own marks, apart from a decision to set a lead aside (n4) */
    if (st === 'not_supported') return '<span class="wg-st-mark wg-st-flask" data-mark="not_supported">' + S().pmxGlyph('flask', 14) + '</span>';
    return '<span class="wg-st-mark">' + S().pmxStatus(STATUS_MARK[st] || 'pending', 14) + '</span>';
  }
  function whoLine(text) { return '<span class="wg-who">' + esc(text) + '</span>'; }
  function decisionLine(r, d) {
    return '<p class="wg-lead-decision"><span class="wg-dec-word">The team: <b>' + esc(WE.DISPOSITION_WORD[d.kind]) + '</b></span>' + byLine(r, d.by) + '</p>' +
      '<p class="wg-lead-why wg-quote wg-team-why"><q>' + esc(d.reason) + '</q></p>';
  }
  function statusLine(r, l) {
    var st = engine.status(l), w = wState(r), d = l.disposition, rs = l.research, pass = engine.passOf(r, l);
    var held = pass && pass.status === 'held', done = rs && (rs.status === 'supported' || rs.status === 'not_supported'), live = rs && (rs.status === 'queued' || rs.status === 'running');
    var bs = w.kind === 'brainstorm', head = '', note = '', dec = '';
    /* the mark sits in the number gutter now (D2), so the status line is the word and who */
    var line = function (key, word, extra) { return '<p class="wg-lead-status" data-status="' + key + '"><span class="wg-st-head"><b>' + esc(word) + '</b></span>' + (extra || '') + '</p>'; };
    if (done) {
      head = line(rs.status, WE.STATUS_WORD[rs.status], rs.by ? whoLine('checked by ' + rs.by.name + (rs.via === 'check_it' ? ', because you asked' : '')) : '');
      note = '<p class="wg-lead-why wg-quote wg-lead-result"><q>' + esc(rs.note) + '</q></p>';
      if (d) dec = decisionLine(r, d);
    } else if (held) {
      head = line('held', 'Waiting for the team');
      /* the pass's held note says why once (n-f); a row adds only what you asked for */
      note = live && rs.via === 'check_it' ? '<p class="wg-lead-why">You asked to check it: it is checked in the Evidence round.</p>' : '';
    } else if (live) {
      var who = rs.status === 'running' && rs.by ? rs.by.name + ' is on it' + (rs.via === 'check_it' ? ', because you asked' : '')
        : rs.via === 'check_it' ? (bs ? 'checked in the Evidence round, because you asked' : 'you asked to check it')
          : bs ? 'checked in the Evidence round' : w.kind === 'crew' ? 'a read-only part for one helper' : 'up for the next round';
      head = line('exploring', 'Exploring', whoLine(who));
      if (d) dec = decisionLine(r, d);
      else note = '<p class="wg-lead-why">' + esc(bs ? 'The Coordinator still records the team’s decision in the Debate.' : 'The ' + leadName(r) + ' still records the team’s decision.') + '</p>';
    } else if (d) {
      var hyp = l.hypothesis && st === 'using' ? '<span class="wg-hyp">still a hypothesis</span>' : '';
      head = line(st, WE.STATUS_WORD[st], hyp + '<span class="wg-by-wrap">' + byLine(r, d.by) + '</span>');
      note = '<p class="wg-lead-why wg-quote wg-team-why"><q>' + esc(d.reason) + '</q></p>';
    } else if (w.kind === 'chat_room' && r.status === 'completed') {
      head = line('waiting', 'Not taken up'); note = '<p class="wg-lead-why">The room left it undecided.</p>';
    } else {
      head = line('waiting', WE.STATUS_WORD.waiting);
      note = '<p class="wg-lead-why">' + esc(pass && pass.n > 1 ? 'The ' + leadName(r) + ' decides it now that it has arrived.' : w.kind === 'chat_room' ? 'The Moderator decides it as it arrives.' : w.kind === 'crew' ? 'The Coordinator decides it while it splits the job.' : 'The team decides it in the Debate.') + '</p>';
    }
    /* a row reads like the listing: the team's decision first, then what research found (n-h, D6) */
    return dec + head + note;
  }
  function evidenceLine(r, l) {
    var rs = l.research;
    if (!rs || !rs.evidence) return '';
    var e = rs.evidence;
    return '<p class="wg-lead-evidence">' + S().pmxGlyph('flask', 12) + '<span>Evidence: ' + (e.url ? '<a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' + esc(e.label) + '</a>' : esc(e.label)) + '</span></p>';
  }
  function checkBtn(r, l) {
    if (!takesRequests(r)) return '';
    var w = wState(r), rs = l.research;
    if (w && w.closedAt) return '<button type="button" class="text-button wg-check" disabled data-failure="team_writing_result" data-hover-key="wg-check:' + esc(l.id) + '" data-hover-tip="' + esc(refusedText('lead_admission_closed')) + '">' + S().pmxGlyph('search', 12) + 'Check it</button>';
    var tip = rs ? (rs.status === 'queued' || rs.status === 'running' ? 'Already in research: this shows it rather than starting another.' : 'Already checked: this shows the result.') : 'Sends this lead to research now, whatever the team decided. Only you can do this.';
    return '<button type="button" class="text-button wg-check" data-action="wg-check-it" data-run="' + esc(r.id) + '" data-lead="' + esc(l.id) + '" data-hover-key="wg-check:' + esc(l.id) + '" data-hover-tip="' + esc(tip) + '">' + S().pmxGlyph('search', 12) + 'Check it</button>';
  }
  /* a lead row. o.dossier: the dossier disclosure (run views); o.compact: the main chat's tighter row */
  function leadRow(r, l, o) {
    o = o || {};
    var st = engine.status(l), pass = engine.passOf(r, l), k = r.id + ':' + l.id;
    var flash = FLASH.key === k && Date.now() - FLASH.at < 2400 ? ' data-flash="1"' : '';
    var dossier = l.dossier ? S().pmxDisclosure({ key: 'wg-dos:' + k + (o.compact ? ':c' : ''), cls: 'wg-dossier', summary: 'Dossier', body:
      (l.dossier.found ? '<p><b>What it found</b> ' + esc(l.dossier.found) + '</p>' : '') + (l.dossier.why ? '<p><b>Why it’s interesting</b> ' + esc(l.dossier.why) + '</p>' : '') + (l.dossier.next ? '<p><b>Worth looking into next</b> ' + esc(l.dossier.next) + '</p>' : '') }) : '';
    var takes = list(l.takenUpBy).map(function (mid) { return list(r.messages).filter(function (m) { return m.id === mid; })[0]; }).filter(Boolean);
    var taken = o.compact || !takes.length ? '' : '<p class="wg-lead-taken">' + S().pmxGlyph('reply', 12) + '<span>Taken up by ' + esc(words(takes.map(function (m) { return m.senderName || 'a helper'; }).filter(function (v, i, a) { return a.indexOf(v) === i; }))) + '</span></p>';
    return '<li class="wg-lead" data-k="wg-lead:' + esc(k) + (o.compact ? ':c' : '') + '" data-lead="' + esc(l.id) + '" data-status="' + (pass && pass.status === 'held' ? 'held' : st) + '"' + flash + '>' +
      '<span class="wg-lead-n"><span aria-hidden="true">' + l.n + '</span>' + statusMark(pass && pass.status === 'held' ? 'held' : st) + '</span>' +
      '<div class="wg-lead-body">' +
        '<p class="wg-lead-title">' + esc(l.title) + '</p>' +
        '<p class="wg-lead-tether"><span class="wg-angle" data-angle="' + esc(l.angle) + '">' + angleMark(l.angle, 11) + esc(WE.ANGLES[l.angle] || l.angle) + '</span><span class="wg-tether">' + esc(l.tether) + '</span></p>' +
        sourceLine(r, l) + statusLine(r, l) + evidenceLine(r, l) + taken + dossier +
      '</div>' + checkBtn(r, l) + '</li>';
  }
  function passWhy(r, pass) {
    if (pass.by.kind === 'start') return 'started with the ' + (r.kind === 'chat_room' ? 'room' : r.kind === 'brainstorm' ? 'BrainStorm' : 'Crew');
    return 'asked for by ' + (pass.by.kind === 'user' ? 'you' : pass.by.name || 'a helper');
  }
  /* the eight angles of SS-037 as a compass: the ones a pass worked are lit, each with how many leads it gave; the
     territory reads at a glance before any sentence (25). Order runs clockwise from the top. */
  var COMPASS = ['history', 'adjacent', 'contradiction', 'inversion', 'scale', 'human', 'dependency', 'future'];
  function angleMark(key, size) {
    var i = COMPASS.indexOf(key); if (i < 0) return '';
    var z = size || 11, c = z / 2, rr = z / 2 - 1, a = (i / 8) * Math.PI * 2 - Math.PI / 2, x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr;
    return '<svg class="wg-angle-mark" width="' + z + '" height="' + z + '" viewBox="0 0 ' + z + ' ' + z + '" aria-hidden="true"><circle cx="' + c + '" cy="' + c + '" r="' + rr + '" fill="none" stroke="currentColor" stroke-opacity=".35"/><line x1="' + c + '" y1="' + c + '" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  }
  /* D2 (round 2): every one of the eight rim positions is a dot; a lit angle is a filled dot, sized by its leads, on a
     ray from the hub; an unlit one a small open dot. The caption counts them, and the legend beside it names each lit
     angle with its direction mark, so nothing needs a hover */
  function compass(pass, leads, size) {
    var z = size || 64, c = z / 2, R = z / 2 - 7, worked = {}, counts = {};
    pass.angles.forEach(function (a) { worked[a.key] = 1; });
    leads.forEach(function (l) { counts[l.angle] = (counts[l.angle] || 0) + 1; });
    var parts = COMPASS.map(function (k, i) {
      var a = (i / 8) * Math.PI * 2 - Math.PI / 2, x = c + Math.cos(a) * R, y = c + Math.sin(a) * R, on = !!worked[k], n = counts[k] || 0;
      var dot = on ? (n ? 2.4 + Math.min(n, 3) * 0.9 : 2.4) : 1.5;
      return '<g class="wg-cmp-ray" data-on="' + (on ? 1 : 0) + '" data-leads="' + n + '">' + (on ? '<line x1="' + c + '" y1="' + c + '" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '"/>' : '') +
        '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + dot.toFixed(1) + '"/><title>' + esc(WE.ANGLES[k]) + (on ? ': ' + (n ? plural(n, 'lead') : 'no lead') : ': not explored') + '</title></g>';
    }).join('');
    return '<figure class="wg-cmp"><svg class="wg-compass" width="' + z + '" height="' + z + '" viewBox="0 0 ' + z + ' ' + z + '" role="img" aria-label="' + esc(pass.angles.length + ' of 8 angles explored: ' + words(pass.angles.map(function (a) { return a.name; }))) + '"><circle class="wg-cmp-rim" cx="' + c + '" cy="' + c + '" r="' + R + '"/>' + parts + '<circle class="wg-cmp-hub" cx="' + c + '" cy="' + c + '" r="2"/></svg>' +
      '<figcaption class="wg-cmp-cap">' + pass.angles.length + ' of 8 angles</figcaption></figure>';
  }
  /* the lit angles by name, each with its direction mark and how many leads it gave (D2) */
  function compassLegend(pass, leads) {
    if (!pass.angles.length) return '';
    return '<p class="wg-cmp-legend">' + pass.angles.map(function (a) {
      var n = leads.filter(function (l) { return l.angle === a.key; }).length;
      return '<span class="wg-cmp-key" data-leads="' + n + '">' + angleMark(a.key, 11) + esc(a.name) + (n ? '<span class="wg-cmp-n">' + n + '</span>' : '') + '</span>';
    }).join('') + '</p>';
  }
  /* the second layer (SS-037): each angle explored with its brief signal and how many leads it gave */
  function anglesLayer(r, pass, leads, o) {
    if (!pass.angles.length) return '';
    var body = '<ul class="wg-angles">' + pass.angles.map(function (a) {
      var n = leads.filter(function (l) { return l.angle === a.key; }).length;
      return '<li data-angle="' + esc(a.key) + '"><span class="wg-angles-name">' + angleMark(a.key, 11) + '<b>' + esc(a.name) + '</b></span><span class="wg-angles-signal">' + esc(a.signal || 'no signal recorded') + '</span><span class="wg-angles-n">' + (n ? plural(n, 'lead') : 'no lead') + '</span></li>';
    }).join('') + '</ul>';
    return S().pmxDisclosure({ key: 'wg-ang:' + r.id + ':' + pass.id + ':' + (o.where || 'view'), cls: 'wg-angles-disc', summary: plural(pass.angles.length, 'angle') + ' explored, with what each turned up', body: body });
  }
  /* one pass: the Wonderer's message (CWR-043). o.where: 'chat' (the main chat card) | 'view' (run views) | 'conv'.
     Three layers, all reachable here (SS-037): the summary, the angles with their signals, and a dossier per lead. */
  function passBlock(r, pass, o) {
    o = o || {};
    var w = wState(r), leads = pass.leadIds.map(function (id) { return engine.lead(r, id); }).filter(Boolean);
    var exploring = pass.status === 'exploring', queued = pass.status === 'queued', held = pass.status === 'held', failed = pass.status === 'failed';
    var title = (o.where === 'conv' ? 'Pass ' + pass.n : 'Wonderer · pass ' + pass.n) + (pass.attempt > 1 ? ' · try ' + pass.attempt : '');
    var head = '<header class="wg-pass-head">' + (o.where === 'conv' ? '' : wMark(o.where === 'chat' ? 22 : 24, exploring ? 'working' : queued ? 'queued' : 'idle')) +
      '<p class="wg-pass-title"><b>' + esc(title) + '</b><span class="wg-fine">' + esc(passWhy(r, pass)) + (pass.about ? ' · around “' + esc(pass.about) + '”' : '') + '</span></p></header>';
    var say;
    /* a queued pass: the team keeps working, and (Crew, BrainStorm) the final result waits for it (R13) */
    if (queued) say = '<p class="wg-pass-say wg-exploring">' + S().pmxStatus('pending', 14) + '<span>Queued behind the team’s work: it starts as soon as a slot frees up. ' + (r.kind === 'chat_room' ? 'Nothing in the room waits for it.' : 'The team keeps working; the final result waits for this pass.') + '</span></p>';
    else if (exploring) say = '<p class="wg-pass-say wg-exploring">' + S().pmxStatus('working', 14) + '<span>' + (pass.about ? 'Exploring ' + esc(pass.about) : 'Exploring around <q>' + esc(String(w.seed).slice(0, 90)) + '</q>') + '. Its leads go to the team when the pass is done.' + (r.kind === 'chat_room' ? '' : ' The final result waits for it.') + '</span></p>';
    else if (failed) say = '<p class="wg-pass-say">' + S().pmxStatus('failed', 14) + '<span>This try ' + (pass.outcome === 'timed_out' ? 'ran out of time' : 'didn’t finish') + '. The run goes on without it, it doesn’t count toward the two extra passes, and a retry keeps the number ' + pass.n + '.</span></p>';
    else {
      var tally = leads.length ? '<span class="wg-tally">' + tallyHtml(r, leads) + '</span>' : '';
      var outcome = !leads.length ? '<b>No new leads.</b> ' + esc(pass.stopReason || 'Nothing it found connected to the topic in a way the team doesn’t already have.')
        : pass.stoppedEarly ? 'Stopped early with ' + plural(leads.length, 'lead') + (pass.stopReason ? ': ' + esc(pass.stopReason) : '.') + ' None of them is a fact yet.'
          : plural(leads.length, 'lead') + ' for the team to weigh; none of them is a fact yet.';
      say = '<div class="wg-territory">' + (pass.angles.length ? compass(pass, leads, o.where === 'chat' ? 56 : 64) : '') +
        '<div class="wg-territory-text"><p class="wg-pass-say">' + esc(pass.summary) + '</p>' + compassLegend(pass, leads) + '<p class="wg-pass-angles">' + outcome + '</p>' + tally + '</div></div>' + anglesLayer(r, pass, leads, o);
    }
    var heldNote = held ? '<p class="wg-held">' + S().pmxStatus('waiting-dep', 14) + '<span><b>Held until every proposal is in.</b> The helpers draft alone first; they see these leads when the options are lined up.</span></p>' : '';
    var rows = leads.length ? '<ol class="wg-leads' + (o.where === 'chat' ? ' wg-leads--chat' : '') + '">' + leads.map(function (l) { return leadRow(r, l, { compact: o.where === 'chat' }); }).join('') + '</ol>' : '';
    return '<section class="wg-pass" data-k="wg-pass:' + esc(r.id + ':' + pass.id) + (o.where ? ':' + o.where : '') + '" data-pass="' + esc(pass.id) + '" data-status="' + esc(pass.status) + '" data-where="' + esc(o.where || 'view') + '">' + head + say + heldNote + rows + '</section>';
  }
  /* where a pass's leads stand now, one mark and count per status (the pass reads at a glance at 4-5 leads) */
  function tallyHtml(r, leads) {
    var order = ['waiting', 'exploring', 'using', 'set_aside', 'supported', 'not_supported'], n = {};
    leads.forEach(function (l) { var pass = engine.passOf(r, l), st = pass && pass.status === 'held' ? 'waiting' : engine.status(l); n[st] = (n[st] || 0) + 1; });
    return order.filter(function (k) { return n[k]; }).map(function (k) { return '<span class="wg-tally-i" data-status="' + k + '">' + statusMark(k) + '<span>' + n[k] + ' ' + esc(WE.STATUS_WORD[k].toLowerCase()) + '</span></span>'; }).join('');
  }
  /* the card's summary line (CWR-043): leads explored, used, set aside and undecided; it agrees with the gate (m11) */
  function countsText(r) {
    var w = wState(r); if (!w || !w.leads.length) return '';
    var c = engine.counts(r), parts = [];
    if (c.explored) parts.push(c.explored + ' explored');
    if (c.used) parts.push(c.used + ' used');
    if (c.setAside) parts.push(c.setAside + ' set aside');
    if (c.undecided) parts.push(c.undecided + ' undecided');
    return 'Leads: ' + (parts.join(' · ') || plural(c.total, 'lead'));
  }
  /* the one reason a BrainStorm's Write the plan or a Crew's final result waits on the Wonderer (CWR-041/043) */
  function gateWords(r) {
    var g = engine.gate(r);
    if (g.ok) return { ok: true, code: '', reason: '' };
    var team = r.kind === 'brainstorm' ? 'the team' : 'the Coordinator';
    var reason = g.code === 'exploring' ? 'A Wonderer pass is in flight; its leads go to ' + team + ' first.'
      : g.code === 'held' ? 'The Wonderer’s leads are held until every blind proposal is in.'
        : g.code === 'undecided' ? 'Waiting for ' + team + ' to decide ' + plural(g.count, 'Wonderer lead') + '.'
          : 'Waiting for ' + plural(g.count, 'lead') + ' in research to come back.';
    return { ok: false, code: g.code, count: g.count, reason: reason };
  }

  /* ================================================================ 4. lanes and the decision row */
  /* the Wonderer lane (CWR-043): exploring during a pass, the lead count after it; never "waits its turn" */
  function lane(r, p) {
    var w = wState(r); p = p || wondererP(r); if (!p) return '';
    var passes = w ? w.passes : [], last = passes[passes.length - 1], c = engine.counts(r);
    var exploring = !!(last && last.status === 'exploring'), queued = !!(last && last.status === 'queued'), held = !!(last && last.status === 'held');
    /* a later pass with no slot free reads queued (steer 2026-10-20), never "waits its turn" */
    var verb = queued ? 'queued' : exploring ? 'exploring' : c.total ? plural(c.total, 'lead') : last && last.status === 'failed' ? 'pass didn’t finish' : last && last.status === 'delivered' ? 'no new leads' : 'starts with the run';
    var line2 = queued ? 'Pass ' + last.n + ' starts when a slot frees up' : exploring ? 'Pass ' + last.n + (last.about ? ' · around “' + last.about + '”' : ' · around the ' + (r.kind === 'chat_room' ? 'topic' : r.kind === 'crew' ? 'job' : 'question'))
      : held ? 'Held until every proposal is in'
        : last && last.status === 'delivered' && !last.leadIds.length ? 'Pass ' + last.n + ' found nothing new'
        : !c.total ? 'Its first pass starts when the run starts'
          : c.waiting ? plural(c.waiting, 'lead') + ' waiting for the team' + (c.exploring ? ' · ' + c.exploring + ' exploring' : '')
            : c.exploring ? plural(c.exploring, 'lead') + ' being checked'
              : 'Every lead decided · ' + engine.passesLeft(r) + ' more ' + (engine.passesLeft(r) === 1 ? 'pass' : 'passes') + ' if asked';
    var sub = String(p.effectiveModelName || p.requestedModelName || '').split(' · ')[0];
    return S().pmxLane({ key: 'pmx-lane:' + r.id + ':' + p.id, state: exploring ? 'working' : queued ? 'queued' : 'done', mark: wMark(22, exploring ? 'working' : queued ? 'queued' : 'idle'), name: 'Wonderer', sub: esc(sub),
      verb: esc(verb), verbKey: 'vb:' + p.id + ':' + S().pmxHash(verb), line2: esc(line2), line2Kind: 'detail', keepKey: 'l2:' + r.id + ':' + p.id + ':wg', cls: 'wg-lane',
      action: 'wg-open-leads', attrs: 'data-run="' + esc(r.id) + '"', time: '' });
  }
  /* the Coordinator's or Moderator's lane while Grill Me holds the run: "Grilling you · round N" (CWR-043) */
  function leadLane(r) {
    var s = activeSession(r); if (!s) return '';
    var rd = GE.round(s), n = rd ? rd.n : s.rounds.length, look = GE.lookups(s);
    var verb = s.status === 'grilling' ? (rd ? 'Grilling you · round ' + Math.max(1, n) : 'looking things up') : 'waiting for your Confirm';
    var only = s.later ? ' Only ' + waitsFor(r, s) + ' waits.' : '';
    var line2 = s.status === 'grilling'
      ? (rd ? plural(rd.ids.length, 'decision is', 'decisions are') + ' ready. Each has a recommended answer filled in.' + only : 'Looking up ' + words(look.map(function (x) { return String(x.title).charAt(0).toLowerCase() + String(x.title).slice(1); })) + '. The next round waits for it.')
      : 'Here is what we agreed. Nothing happens until you confirm.' + only;
    var looking = s.status === 'grilling' && !rd;
    return S().pmxLane({ key: 'pmx-lane:' + r.id + ':lead', state: looking ? 'working' : 'needs', mark: leadMark(r, 22, looking ? 'working' : 'needs', true), name: leadName(r), sub: esc(r.kind === 'chat_room' ? ((r.config && r.config.moderatorPersona) || '') : 'this chat’s assistant'),
      verb: esc(verb), verbKey: 'vb:lead:' + S().pmxHash(verb), line2: '<q>' + esc(line2.replace(/^“|”$/g, '')) + '</q>', line2Kind: 'quote', keepKey: 'l2:' + r.id + ':lead:' + S().pmxHash(line2), cls: 'wg-lane wg-lane--lead',
      action: 'wg-open-round', attrs: 'data-key="run:' + esc(r.id) + '"', time: '' });
  }
  /* decorateLanes(run, lanesHtml): while Grill Me holds the run the card shows the lead's lane, the Wonderer's, and
     one line for the helpers who wait for Confirm; after it, the kind's own lanes with the Wonderer's added while it
     explores or leads wait for the team (it never takes a helper's turn, so it never "waits its turn") */
  function decorateLanes(r, html) {
    if (!r || r.kind === 'review') return html;
    var wp = wondererP(r), S_ = S();
    if (holds(r)) {
      var core = list(r.participants).filter(function (p) { return p.additiveRoleKind !== 'wonderer'; }).length;
      var what = r.kind === 'crew' ? 'the split' : r.kind === 'chat_room' ? 'round 1' : 'the blind proposals';
      var lanes = leadLane(r) + (wp ? lane(r, wp) : '');
      return S_.pmxLanes({ key: 'lanes:' + r.id, cls: 'wg-lanes', lanesHtml: lanes, kind: r.kind, runId: r.id, narrow: false }).replace(/<\/div>$/,
        '<p class="wg-lanes-wait">' + S_.pmxStatus('pending', 12) + '<span>' + plural(core, r.kind === 'review' ? 'reviewer' : 'helper') + ' wait for your Confirm before ' + what + '.</span></p></div>');
    }
    /* a later session (Grill Me turned on mid-run, or a later decision): its lane goes first; the work keeps going */
    if (activeSession(r) && html) html = html.replace(/^(<div[^>]*>)/, '$1' + leadLane(r));
    if (!wp || !html) return html;
    var w = wState(r), last = w && w.passes[w.passes.length - 1], c = engine.counts(r);
    var relevant = !w || !w.passes.length || (last && (last.status === 'exploring' || last.status === 'queued' || last.status === 'held')) || c.waiting;
    if (!relevant || r.status === 'completed' || /data-k="pmx-lane:[^"]*:wg/.test(html)) return html;
    /* the Wonderer's lane goes in after the kind's lanes (and before its "+N more" row) */
    var cut = html.search(/<button type="button" class="pmx-lanes-more/);
    var tail = cut >= 0 ? html.slice(cut) : html.slice(html.lastIndexOf('</div>'));
    var headPart = cut >= 0 ? html.slice(0, cut) : html.slice(0, html.lastIndexOf('</div>'));
    return headPart + lane(r, wp) + tail;
  }
  /* the card's decision row while Grill Me holds the run: your move, in words (the one loud moment, accent) */
  function attention(r) {
    var s = activeSession(r); if (!s || !r.pendingUserDecision) return null;
    var rd = GE.round(s), what = cap(waitsFor(r, s)) + (/proposals$/.test(waitsFor(r, s)) ? ' wait' : ' waits'), rest = s.later ? ' Everything else keeps going.' : '';
    if (s.status === 'grilling' && rd) return { tone: 'accent', strong: 'Your move.', word: 'Your move', text: 'The ' + leadName(r) + (s.later ? ' has ' + plural(rd.ids.length, 'decision') + ' for you in Grill Me round ' + rd.n + '. ' : ' is grilling you: round ' + rd.n + ', ' + plural(rd.ids.length, 'decision') + '. ') + what + ' for your answers.' + rest,
      actions: [{ action: 'wg-open-round', attrs: 'data-key="run:' + esc(r.id) + '"', label: 'Answer round ' + rd.n, primary: true }, { action: 'wg-wrap-up', attrs: 'data-key="run:' + esc(r.id) + '"', label: 'Wrap up', soft: true }] };
    if (s.status === 'agreeing') return { tone: 'accent', strong: 'Your move.', word: 'Your move', text: 'Confirm what you agreed with the ' + leadName(r) + '. ' + what + ' for Confirm.' + rest,
      actions: [{ action: 'wg-show-agreed', attrs: 'data-key="run:' + esc(r.id) + '"', label: 'See what we agreed', primary: true }] };
    return null;
  }
  /* the card's sentence while the start session holds the run (a later session keeps the kind's own sentence) */
  function sentence(r) {
    if (!holds(r)) return null;
    var s = r.grill, rd = GE.round(s);
    if (s.status === 'grilling' && !rd) return { status: 'running', word: 'Looking things up', reason: 'The ' + leadName(r) + ' asks the next round once research finds ' + words(GE.lookups(s).map(function (x) { return String(x.title).charAt(0).toLowerCase() + String(x.title).slice(1); })) + '.' };
    return { status: 'yourmove', word: 'Your move', reason: s.status === 'grilling' ? 'The ' + leadName(r) + ' is grilling you · round ' + rd.n + '.' : 'Confirm what you agreed.' };
  }
  /* the card face Grill Me asks for: null, or {sentence, attention} (collaboration.js cardParts) */
  function face(r) {
    if (!r || r.kind === 'review') return null;
    if (holds(r)) return { sentence: sentence(r), attention: !!r.pendingUserDecision };
    if (activeSession(r) && r.pendingUserDecision) return { sentence: null, attention: true };
    return null;
  }

  /* ================================================================ 5. run views: the Wonderer section */
  function section(r, o) {
    o = o || {};
    var w = wState(r); if (!w) return '';
    var g = gateWords(r), c = engine.counts(r), S_ = S();
    var meta = w.passes.length ? plural(w.passes.length, 'pass', 'passes') + ' · ' + plural(c.total, 'lead') + ' · it never votes or takes a turn' : 'its first pass starts with the run';
    var wait = !g.ok && r.kind !== 'chat_room' ? '<p class="wg-gate" data-code="' + esc(g.code) + '">' + S_.pmxStatus('waiting-dep', 14) + '<span><b>' + (r.kind === 'brainstorm' ? 'Write the plan waits.' : 'The final result waits.') + '</b> ' + esc(g.reason) + '</span></p>' : '';
    var none = !w.passes.length ? '<p class="wg-empty">' + S_.pmxStatus('pending', 14) + '<span>Nothing yet. The Wonderer explores the ' + (r.kind === 'chat_room' ? 'topic' : r.kind === 'crew' ? 'job' : 'question') + ' when the run starts.</span></p>' : '';
    var ask = askState(r);
    var asks = w.passes.length && takesRequests(r) && o.ask !== false ? '<p class="wg-ask"><button type="button" class="text-button" data-action="wg-ask-pass" data-run="' + esc(r.id) + '"' + (ask.ok ? '' : ' disabled data-failure="' + esc(ask.code) + '"') + '>' + S_.pmxGlyph('sparkles', 12) + 'Ask the Wonderer for another pass</button><span class="wg-fine">' + esc(ask.say) + '</span></p>' : '';
    var body = wait + none + w.passes.slice().reverse().map(function (pass) { return passBlock(r, pass, { where: 'view' }); }).join('') + asks;
    return S_.pmxViewSection({ key: 'wg-sec:' + r.id + (o.key ? ':' + o.key : ''), cls: 'wg-section', title: 'Wonderer’s leads', meta: meta, body: body });
  }
  /* can you ask for another pass now, and if not, why (M1): never while a pass is in flight, never while a recorded
     example still owns the next pass (it asks for it itself), never past the two, never once the result is started */
  function askState(r) {
    var w = wState(r); if (!w) return { ok: false, code: 'wonderer_not_configured', say: '' };
    if (w.closedAt) return { ok: false, code: 'lead_admission_closed', say: refusedText('lead_admission_closed') };
    var live = w.passes.filter(function (x) { return x.status === 'queued' || x.status === 'exploring'; })[0];
    if (live) return { ok: false, code: 'pass_running', say: 'Pass ' + live.n + ' is ' + (live.status === 'queued' ? 'queued' : 'exploring') + ' now; ask again when it is in.' };
    if (!engine.passesLeft(r)) return { ok: false, code: 'pass_limit', say: 'Both extra passes are used' };
    if (w.reserved > 0) return { ok: false, code: 'pass_reserved', say: refusedText('pass_reserved') };
    return { ok: true, code: '', say: plural(engine.passesLeft(r), 'extra pass', 'extra passes') + ' left · a pass that fails doesn’t count' };
  }
  /* a recorded example keeps the next pass(es) for its own script; each scripted request uses one */
  function reservePasses(r, n) { var w = wState(r); if (w) w.reserved = Math.max(0, n | 0); }
  /* the leads a recording researches itself (Check it on one shows that scripted research, never a second one) */
  function scriptChecks(r, ids) { var w = wState(r); if (w) w.scripted = (ids || []).slice(); }
  /* a conversation entry for a Wonderer pass message, and the "takes up" links under a helper's message */
  function entryHtml(r, m) {
    if (!m || m.messageType !== 'wonderer_pass') return '';
    var pass = list((wState(r) || {}).passes).filter(function (x) { return x.id === m.passId; })[0];
    return pass ? passBlock(r, pass, { where: 'conv' }) : '';
  }
  /* the leads a message takes up: the message's own leadIds, or the engine's takenUpBy links (a delivered room reply is
     frozen, so its links live on the lead) */
  function leadLinks(r, m) {
    var w = wState(r); if (!m || !w) return '';
    var ids = list(m.leadIds).slice();
    w.leads.forEach(function (l) { if (list(l.takenUpBy).indexOf(m.id) >= 0 && ids.indexOf(l.id) < 0) ids.push(l.id); });
    if (!ids.length) return '';
    return '<p class="wg-takeup">' + ids.map(function (id) {
      var l = engine.lead(r, id); if (!l) return '';
      return '<button type="button" class="text-button wg-takeup-link" data-action="wg-show-lead" data-run="' + esc(r.id) + '" data-lead="' + esc(id) + '">' + S().pmxGlyph('link', 12) + '<span>Takes up lead ' + l.n + '</span><span class="wg-takeup-t">' + esc(l.title) + '</span></button>';
    }).join('') + '</p>';
  }
  /* the result, the Plan or the room summary lists every lead (CWR-041) */
  function listingHtml(r, o) {
    var rows = engine.listing(r); if (!rows.length) return '';
    o = o || {};
    /* every lead with the team's decision and reason and, when research came back, its outcome under it (M4) */
    return '<div class="wg-listing" data-k="wg-listing:' + esc(r.id) + '"><p class="wg-listing-head">' + wMark(16) + '<b>' + esc(o.title || 'Every Wonderer lead') + '</b><span class="wg-fine">' + esc(countsText(r)) + '</span></p><ol>' + rows.map(function (x) {
      var nt = x.word === 'Not taken up';
      var decision = x.disposition ? '<span class="wg-listing-d">The team: <b>' + esc(x.dispositionWord) + '</b> · ' + esc(x.recordedBy) + (x.dispositionReason ? ' · <q>' + esc(x.dispositionReason) + '</q>' : '') + '</span>' : '';
      var research = x.researchWord && x.researchNote ? '<span class="wg-listing-r">' + statusMark(x.research) + '<b>' + esc(x.researchWord) + '</b>' + (x.researchBy ? ' · checked by ' + esc(x.researchBy) + (x.checkedByUser ? ', because you asked' : '') : '') + ' · ' + esc(x.researchNote) + '</span>' : '';
      var head = nt ? '<span class="wg-listing-s">' + S().pmxStatus('pending', 12) + '<b>Not taken up</b></span>'
        : !x.disposition && !research ? '<span class="wg-listing-s">' + statusMark(x.status) + '<b>' + esc(x.word) + '</b></span>' : '';
      return '<li data-status="' + esc(nt ? 'not_taken_up' : x.status) + '"><span class="wg-lead-n">' + x.n + '</span><span class="wg-listing-t">' + esc(x.title) + (x.status === 'using' ? ' <span class="wg-hyp">a hypothesis, not a fact</span>' : '') + '</span>' + head + decision + research + '</li>';
    }).join('') + '</ol></div>';
  }
  /* the same, as text for a Plan, a Crew result and a room summary: "Explored (the team: …) → Supported: …" */
  function listingText(r) {
    return engine.listing(r).map(function (x) {
      if (x.word === 'Not taken up') return x.n + '. ' + x.title + ' — not taken up';
      var d = x.disposition ? x.dispositionWord + ' (the ' + x.recordedBy + ': ' + x.dispositionReason + ')' : 'Undecided';
      var res = x.researchNote ? ' → ' + x.researchWord + ': ' + x.researchNote : x.research ? ' → being checked' : '';
      return x.n + '. ' + x.title + ' — ' + d + res + (x.status === 'using' ? ' (a hypothesis, not a fact)' : '');
    });
  }

  /* ================================================================ 6. Wonderer actions on a run */
  /* a slot for a later pass: in a Crew it takes one of the parts' slots (steer 2026-10-20: a later pass queues behind
     core work when no slot is free); a BrainStorm and a Chat Room give it one between turns */
  function slotFree(r) {
    if (r.kind !== 'crew' || !r.crew || !r.crew.assignments) return true;
    var running = r.crew.assignments.filter(function (a) { return a.status === 'running'; }).length;
    return running < (r.crew.effectiveConcurrency || 1);
  }
  function startPass(r, by, about, messageId, o) {
    var queue = by && by.kind !== 'start' && (o && o.queue != null ? o.queue : !slotFree(r));
    var w0 = wState(r);
    /* a scripted request uses one of the passes the recording kept; a request of yours waits for them (M1) */
    if (w0 && by && by.kind !== 'start') { if (o && o.scripted) w0.reserved = Math.max(0, (w0.reserved || 0) - 1); else if (w0.reserved > 0 && by.kind === 'user') return { ok: false, error: 'pass_reserved' }; }
    var res = engine.requestPass(r, { by: by, about: about || '', messageId: messageId || null, queue: queue });
    if (!res.ok) return res;
    var p = wondererP(r);
    if (p && !res.queued) { p.status = 'working'; p.current = 'Exploring around the ' + (r.kind === 'chat_room' ? 'topic' : r.kind === 'crew' ? 'job' : 'question') + (about ? ': ' + about : ''); }
    if (p && res.queued) { p.status = 'waiting'; p.current = 'Pass ' + res.pass.n + ' is queued until a slot frees up'; }
    return res;
  }
  /* pump(run): a queued pass starts when a slot frees up; the kinds' drivers call it on their tick */
  function pump(r) {
    var w = wState(r); if (!w) return false;
    var q = w.passes.filter(function (x) { return x.status === 'queued'; })[0];
    if (!q || !slotFree(r)) return false;
    engine.startQueued(r);
    var p = wondererP(r); if (p) { p.status = 'working'; p.current = 'Exploring around the ' + (r.kind === 'chat_room' ? 'topic' : r.kind === 'crew' ? 'job' : 'question') + (q.about ? ': ' + q.about : ''); }
    return true;
  }
  /* a pass you ask for on a recorded example: the recording has nothing more, so it comes back truthfully empty */
  var USER_PASSES = {}, userTimer = 0;
  function userTick() {
    var any = false;
    Object.keys(USER_PASSES).forEach(function (k) {
      var x = USER_PASSES[k], r = run(x.runId), w = r && wState(r), pass = w && w.passes.filter(function (q) { return q.id === x.passId; })[0];
      if (!pass || !takesRequests(r)) { delete USER_PASSES[k]; return; }
      if (pass.status === 'queued') { pump(r); any = true; return; }
      if (pass.status !== 'exploring') { delete USER_PASSES[k]; return; }
      if (Date.now() - x.at < 2600) { any = true; return; }
      deliverPass(r, pass.id, { summary: 'Another look around the ' + (r.kind === 'chat_room' ? 'topic' : r.kind === 'crew' ? 'job' : 'question') + ', as you asked.', angles: [{ key: 'inversion' }, { key: 'dependency' }, { key: 'future' }],
        leads: [], stopReason: 'Three more searches came back with shapes the earlier passes already covered, so it stopped rather than hand over drift.' });
      delete USER_PASSES[k]; render();
    });
    /* a lead you sent with Check it that the recording has no step for: a core helper picks it up and reports back, so
       nothing waits on it forever (the Wonderer never researches its own leads) */
    Object.keys(USER_CHECKS).forEach(function (k) {
      var x = USER_CHECKS[k], r = run(x.runId), w = r && wState(r), l = w && engine.lead(r, x.leadId), rs = l && l.research;
      if (!rs || !takesRequests(r)) { delete USER_CHECKS[k]; return; }
      /* a lead the recording checks itself stays with the recording (M3) */
      if (list(w.scripted).indexOf(l.id) >= 0) { delete USER_CHECKS[k]; return; }
      any = true;
      if (r.status === 'paused') return;
      /* a BrainStorm researches it in the Evidence round, and never while it is held (B1, section 8.5) */
      if (r.kind === 'brainstorm' && (!engine.visible(r, l.passId) || !/^(evidence|vote|synthesis)$/.test(String(r.brainstorm && r.brainstorm.phase)))) { x.at = Date.now(); return; }
      if (rs.status === 'queued' && Date.now() - x.at >= 1400) {
        var p = helperFor(r);
        if (!p || !engine.startResearch(r, l.id, { id: p.id, name: p.name || p.role, role: 'participant' }).ok) { delete USER_CHECKS[k]; return; }
        x.started = Date.now(); render(); return;
      }
      if (rs.status === 'running' && x.started && Date.now() - x.started >= 3200) {
        /* the lead's own recorded result (every fixture lead carries one), else the BrainStorm recording's */
        var B = window.PM56_WONDERER, res = l.check ? copy(l.check) : r.kind === 'brainstorm' && B && B.researchResult ? B.researchResult(r, l.id) : null;
        /* a lead with no recorded result stays "on it" (a static seeded run has no clock to bring one back) */
        if (res) engine.finishResearch(r, l.id, res);
        delete USER_CHECKS[k]; render(); return;
      }
      if (rs.status !== 'queued' && rs.status !== 'running') delete USER_CHECKS[k];
    });
    if (!any && !Object.keys(USER_PASSES).length && !Object.keys(USER_CHECKS).length) { clearInterval(userTimer); userTimer = 0; }
  }
  var USER_CHECKS = {};
  /* who checks a lead you sent: a core helper, never the Wonderer, the Coordinator or the Moderator; an idle one first */
  function helperFor(r) {
    var core = list(r.participants).filter(function (p) { return !WE.isWonderer(p) && !/^(coordinator|moderator|lead)$/i.test(String(p.role || '')); });
    return core.filter(function (p) { return p.status !== 'working'; })[0] || core[0] || null;
  }
  function deliverPass(r, passId, out) {
    var res = engine.deliver(r, passId, out); if (!res.ok) return res;
    var pass = list(wState(r).passes).filter(function (x) { return x.id === passId; })[0], p = wondererP(r);
    if (p) { p.status = 'done'; p.current = (res.delivered.length ? plural(res.delivered.length, 'lead') : 'No new leads') + ' from pass ' + pass.n + (res.held ? ', held until every proposal is in' : ''); }
    /* one Wonderer message per pass in the run's transcript, and one card in the main chat (CWR-043) */
    var m = C().appendMessage(r.id, { senderKind: 'participant', senderId: p ? p.id : null, senderName: 'Wonderer', messageType: 'wonderer_pass', body: 'Pass ' + pass.n + ': ' + pass.summary });
    m.passId = passId; pass.messageId = m.id;
    var c = ctx(), t = c.state.threads.filter(function (x) { return x.id === r.threadId; })[0];
    if (t && !t.messages.some(function (x) { return x.type === 'wg-pass' && x.passId === passId; })) c.appendMessage({ id: 'wg-pass-' + passId, role: 'system', type: 'wg-pass', runId: r.id, passId: passId, time: new Date().toISOString() }, t);
    return res;
  }
  function dispose(r, id, kind, reason, extra) {
    extra = extra || {};
    return engine.dispose(r, id, { kind: kind, reason: reason, by: { role: leadRole(r), name: leadName(r) }, messageId: extra.messageId, assignmentId: extra.assignmentId });
  }

  /* ================================================================ 7. Grill Me: sessions, the questionnaire, What we agreed */
  /* begin(key, {by, subject, tree, cap, hooks}) - starts the interview on a run ('run:<id>') or a thread ('thread:<id>')
     and opens round 1 in the questionnaire */
  /* begin(key, {by, subject, tree, cap, gate, gateLabel, hooks}) - gate: 'start' (default), or the one later step that
     waits for this session's Confirm ('part:export', 'round:2', 'vote') while the rest of the run keeps going */
  function begin(key, o) {
    key = keyOf(key);
    var made = GE.create({ by: o.by, subject: o.subject, tree: o.tree, cap: o.cap, bank: bankFor(key, o.bankKey), gate: o.gate, gateLabel: o.gateLabel });
    if (!made.ok) return made;
    var s = made.session, r = null;
    if (key.indexOf('run:') === 0) {
      r = run(key.slice(4)); if (!r) return { ok: false, error: 'run_missing' };
      if (activeSession(r)) return { ok: false, error: 'a_session_is_already_open' };
      r.grills = r.grills || (r.grill ? [r.grill] : []); r.grills.push(s);
      if (!s.later) r.grill = s;
    } else THREAD_GRILL[key.slice(7)] = s;
    HOOKS[key] = o.hooks || {};
    var res = GE.next(s);
    if (r) syncPending(r);
    if (res.opened) { openRound(key, { auto: true }); if (HOOKS[key].onRound) HOOKS[key].onRound(res.opened); }
    else if (res.waiting) postLookup(key);
    /* a session that begins on an exhausted bank (or with nothing to ask) ends at once: its What we agreed is posted
       now, like every other ending (ACD-503: the safety cap shows that session's agreement; Astra F7) */
    else if (res.ended) postAgreed(key);
    return { ok: true, session: s };
  }
  /* the session is looking things up: one line in the chat, kept in place until research finds them (steer 2026-10-20) */
  function postLookup(key) {
    var s = sessionOf(key), c = ctx(), t = c.state.threads.filter(function (x) { return x.id === ownerThread(key); })[0];
    if (!s || !t) return;
    var ids = GE.lookups(s).map(function (x) { return x.id; }), id = 'wg-lookup-' + s.id + '-' + ids.join('-');
    if (!t.messages.some(function (m) { return m.id === id; })) c.appendMessage({ id: id, role: 'system', type: 'wg-lookup', key: key, sessionId: s.id, factIds: ids, time: new Date().toISOString() }, t);
  }
  function lookupLine(m) {
    var s = sessionOf(m.key, m.sessionId); if (!s) return '';
    var r = m.key.indexOf('run:') === 0 ? run(m.key.slice(4)) : null, facts = list(m.factIds).map(function (id) { return GE.node(s, id); }).filter(Boolean);
    var open = facts.filter(function (n) { return n.state === 'researching'; }), found = facts.filter(function (n) { return n.state === 'found'; });
    var mark = r ? leadMark(r, 16, open.length ? 'working' : 'idle', true) : S().pmxMark({ role: 'this-chat', size: 16, state: open.length ? 'working' : 'idle', grill: true });
    var lc = function (t) { return String(t).charAt(0).toLowerCase() + String(t).slice(1); };
    var head = open.length ? 'Looking things up: ' + words(open.map(function (n) { return lc(n.title); })) + ' · the next round waits for it, nothing for you yet'
      : 'Looked up, not asked: ' + found.map(function (n) { return lc(n.title) + ' (' + n.answer + ')'; }).join('; ');
    return S().pmxLedgerLine({ key: 'wg-lookup:' + m.id, cls: 'wg-round wg-lookup', kind: 'grill', markHtml: mark, kindWord: 'Grill Me', title: 'Looking things up', glyph: open.length ? '' : '',
      headline: esc(head), tip: 'A question that needs a fact goes to research instead of to you. The session waits for it rather than ending early.', actions: [] });
  }
  /* the round goes to the questionnaire (questions.js reads flow.grill: the round bar, the recommended answer
     preselected, Accept all, Not sure and Wrap up) */
  function openRound(key, o) {
    key = keyOf(key);
    var s = sessionOf(key), c = ctx(), rd = s && GE.round(s);
    if (!rd) return false;
    var tid = ownerThread(key);
    if (c.state.selectedThread !== tid) return false;
    var qs = GE.questions(s, rd).map(function (n) {
      return { id: 'wg-' + s.id + '-' + rd.n + '-' + n.id, type: 'choice', prompt: n.prompt, description: n.why || '', required: false,
        options: n.options.map(function (op) { return { id: op.label, label: op.label, description: op.description || '' }; }),
        answer: n.prev != null ? n.prev : n.recommended, recommended: n.recommended, grillNode: n.id, notSure: false, touched: false, revisit: n.prev != null };
    });
    var fid = 'wg-flow:' + s.id + ':' + rd.n, F = D().questionFlows;
    var flow = F.filter(function (f) { return f.id === fid; })[0];
    if (!flow) {
      flow = { id: fid, title: 'Grill Me · round ' + rd.n, threadId: tid, state: 'active', openedAt: 'Now', questions: copy(qs),
        note: 'The ' + s.byName + ' is grilling you. Each answer is filled in with the recommended one; change any, say Not sure, or accept them all.',
        grill: { key: key, by: s.by, byName: s.byName, round: rd.n, count: qs.length, asked: GE.counter(s).asked, cap: GE.counter(s).limit, later: !!s.later, gateLabel: s.gateLabel || '' } };
      F.push(flow);
    }
    var saved = c.state.wgGrill && c.state.wgGrill.flow === fid && Array.isArray(c.state.questions) && c.state.questions[0] && c.state.questions[0].id === qs[0].id;
    Object.assign(c.state, { decision: { type: 'question' }, wgGrill: { key: key, flow: fid, round: rd.n } });
    if (!saved) { c.state.questions = copy(qs); c.state.questionIndex = 0; }
    if (!(o && o.auto)) render(); else c.renderApp();
    /* keyboard: a new round takes the focus from the one you just sent (or from nowhere), never from a field you are
       typing in elsewhere (R11) */
    var was = document.activeElement;
    if (!saved && (!was || was === document.body || (was.closest && was.closest('.qs, .decision-host')))) {
      setTimeout(function () { var el = document.querySelector('.qs-grill .qs-ask-opt.is-on') || document.querySelector('.qs-grill .qs-ask-opt'); if (el && el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }, 260);
    }
    return true;
  }
  /* questions.js calls this when a grilling round leaves the questionnaire: mode 'submit' | 'accept' | 'wrap' */
  function grillAnswered(c, flow, qs, mode) {
    var key = flow.grill.key, s = sessionOf(key); if (!s) return;
    var rd = GE.round(s); if (!rd || rd.n !== flow.grill.round) return;
    (qs || []).forEach(function (q) {
      if (!q.grillNode) return;
      var own = String(q.other || '').trim();
      var v = q.notSure ? null : own || (q.answer != null && String(q.answer).trim() ? q.answer : null);
      /* Wrap up ends questioning without submitting the drafts: only an answer you picked, changed or typed counts, and
         Not sure stays Not sure; a preselected recommendation you never touched is no answer (ACD-503, B2) */
      if (mode === 'wrap') { if (q.notSure) GE.answer(s, q.grillNode, null); else if ((q.touched || own) && v != null) GE.answer(s, q.grillNode, v); return; }
      if (mode === 'accept' && v == null && !q.notSure) v = q.recommended;
      GE.answer(s, q.grillNode, v);
    });
    if (mode === 'accept') GE.acceptRound(s);
    var before = rd.n, res = mode === 'wrap' ? GE.wrapUp(s) : GE.submitRound(s);
    flow.state = 'completed';
    c.state.wgGrill = null;
    /* one line in the chat per answered round (the ledger grammar), then the next round or What we agreed */
    var answered = GE.questions(s, rd), took = answered.filter(function (n) { return n.state === 'answered'; });
    var rec = took.filter(function (n) { return n.took === 'recommended'; }).length;
    var t = c.state.threads.filter(function (x) { return x.id === ownerThread(key); })[0];
    if (t) c.appendMessage({ id: 'wg-round-' + s.id + '-' + before, role: 'system', type: 'wg-round', key: key, sessionId: s.id, round: before, decided: took.length, recommended: rec, notSure: answered.length - took.length, wrapped: mode === 'wrap', time: new Date().toISOString() }, t);
    if (key.indexOf('run:') === 0) syncPending(run(key.slice(4)));
    if (res.opened) { openRound(key, { auto: true }); if (HOOKS[key] && HOOKS[key].onRound) HOOKS[key].onRound(res.opened); }
    else if (res.ended) postAgreed(key);
    else if (res.waiting) { postLookup(key); if (HOOKS[key] && HOOKS[key].onResearch) HOOKS[key].onResearch(); }
  }
  function postAgreed(key) {
    var s = sessionOf(key), c = ctx(), t = c.state.threads.filter(function (x) { return x.id === ownerThread(key); })[0];
    if (!s || !t) return;
    var id = 'wg-agreed-' + s.id + '-' + (s.keepGoing || 0);
    if (!t.messages.some(function (m) { return m.id === id; })) c.appendMessage({ id: id, role: 'system', type: 'wg-agreed', key: key, sessionId: s.id, pass: s.keepGoing || 0, time: new Date().toISOString() }, t);
  }
  function factFound(key, nodeId, fact) {
    var s = sessionOf(key); if (!s) return { ok: false, error: 'no_session' };
    var res = GE.factFound(s, nodeId, fact);
    if (keyOf(key).indexOf('run:') === 0) syncPending(run(keyOf(key).slice(4)));
    if (res.opened) { openRound(key, { auto: true }); if (HOOKS[keyOf(key)] && HOOKS[keyOf(key)].onRound) HOOKS[keyOf(key)].onRound(res.opened); }
    else if (res.ended) postAgreed(key);
    else if (res.waiting) postLookup(key);
    return res;
  }
  /* ---- the design tree (SS-038 "maps the subject as a design tree"; a concept design choice, 2026-10-21) ----
     A calm map of the interview: what is settled, what the round asks now, what research is looking up, what waits
     and what each answer unlocks. Each decision hangs under the first decision it depends on; a second prerequisite is
     named on its line. A question in the open round is a button that takes the Ask Card to it. */
  var TREE_STATE = { settled: 'Settled', frontier: 'Asking now', lookup: 'Looking it up', found: 'Looked up', next: 'Next', waiting: 'Waits', open: 'Left open' };
  var TREE_MARK = { settled: 'complete', frontier: 'yourmove', lookup: 'reviewing', found: 'complete', next: 'pending', waiting: 'pending', open: 'skipped' };
  function tallyOf(count) {
    return ['settled', 'found', 'frontier', 'lookup', 'next', 'waiting', 'open'].filter(function (k) { return count[k]; }).map(function (k) {
      return '<span class="wg-tree-tally-i" data-state="' + k + '">' + S().pmxStatus(TREE_MARK[k], 12) + count[k] + ' ' + esc(TREE_STATE[k].toLowerCase()) + '</span>';
    }).join('');
  }
  /* the one-line tally of the map, for the round bar */
  function treeTally(key) { var s = sessionOf(key); if (!s) return ''; var count = {}; GE.map(s).forEach(function (n) { count[n.state] = (count[n.state] || 0) + 1; }); return tallyOf(count); }
  /* D1 (round 2): the tree draws its dependencies. Each decision hangs under the first decision it depends on, joined
     to it by a neutral connector (an inline line in --border-strong, never a coloured side box); the rows run flat, so
     the lines run unbroken down the left. In the Ask Card the map is compact (one line a decision, the question on
     screen marked) so it never pushes the question out of view; in What we agreed it is the structure alone, since the
     list above already gives each settled answer. The round bar carries the tally, so the map has none of its own. */
  function treeGuide(kind) {
    var top = kind === 'blank' ? '' : '<path d="M7 0V11' + (kind === 'pipe' ? '' : 'H14') + '"/>', more = kind === 'pipe' || kind === 'tee';
    return '<span class="wg-tg" data-g="' + kind + '" aria-hidden="true"><svg class="wg-tg-a" width="14" height="11" viewBox="0 0 14 11">' + top + '</svg>' +
      (more ? '<svg class="wg-tg-b" width="14" height="8" viewBox="0 0 14 8" preserveAspectRatio="none"><path d="M7 0V8" vector-effect="non-scaling-stroke"/></svg>' : '') + '</span>';
  }
  function treeHtml(key, o) {
    o = o || {};
    var s = sessionOf(key, o.sessionId); if (!s) return '';
    var nodes = GE.map(s), byId = {}, kids = {}, roots = [], rd = GE.round(s), qIndex = {};
    nodes.forEach(function (n) { byId[n.id] = n; kids[n.id] = []; });
    if (rd) rd.ids.forEach(function (id, i) { qIndex[id] = i; });
    nodes.forEach(function (n) { var p = n.dependsOn.filter(function (d) { return byId[d]; })[0]; if (p) kids[p].push(n); else roots.push(n); });
    var lc = function (t) { return String(t).charAt(0).toLowerCase() + String(t).slice(1); };
    var ask = o.where === 'ask', agreed = o.where === 'agreed';
    /* in the Ask Card the question on screen is "you are here": the accent is its mark's alone; every other frontier
       row reads in text ink with the your-move mark (ruling 4 / D1 of round 2) */
    var cq = ask ? (function () { var st = ctx().state, q = (st.questions || [])[st.questionIndex || 0]; return q && q.grillNode; })() : null;
    function detailOf(n) {
      var also = n.dependsOn.slice(1).map(function (d) { return byId[d]; }).filter(Boolean);
      var d = n.state === 'settled' ? (agreed ? '' : esc(n.answer) + (n.took === 'recommended' ? '<span class="wg-tree-fine"> · recommended</span>' : '<span class="wg-tree-fine"> · your answer</span>'))
        : n.state === 'found' ? (agreed ? 'looked up' : esc(n.answer))
          : n.state === 'frontier' ? (cq && n.id === cq ? 'on screen now' : 'asking now') + (n.unlocks.length && !ask ? '<span class="wg-tree-fine"> · unlocks ' + esc(words(n.unlocks.map(function (u) { return lc(byId[u].title); }))) + '</span>' : '')
            : n.state === 'lookup' ? (ask ? 'looking it up' : 'research is looking it up; nothing for you')
              : n.state === 'open' ? 'left open'
                : n.state === 'next' ? (ask ? 'next round' : 'ready for the next round')
                  : n.waitsOnLookup ? 'waits for the lookup' : 'waits for ' + esc(words(n.dependsOn.map(function (x) { return byId[x]; }).filter(function (x) { return x && x.state !== 'settled' && x.state !== 'found'; }).map(function (x) { return lc(x.title); })) || 'an earlier decision');
      if (also.length && n.state !== 'settled') d += '<span class="wg-tree-fine"> · also hangs on ' + esc(words(also.map(function (x) { return lc(x.title); }))) + '</span>';
      return d;
    }
    var rows = [];
    function walk(n, flags, last, depth) {
      var guides = depth ? flags.map(function (f) { return treeGuide(f ? 'pipe' : 'blank'); }).join('') + treeGuide(last ? 'elbow' : 'tee') : '';
      var d = detailOf(n);
      var label = '<span class="wg-tree-t">' + esc(n.title) + '</span>' + (d ? '<span class="wg-tree-d">' + d + '</span>' : '');
      var mark = '<span class="wg-tree-mark" data-kind="' + n.kind + '">' + (n.kind === 'fact' ? S().pmxGlyph('flask', 12) : S().pmxStatus(TREE_MARK[n.state], 12)) + '</span>';
      var body = n.state === 'frontier' && o.jump && qIndex[n.id] != null
        ? '<button type="button" class="wg-tree-node" data-action="qs-goto-question" data-index="' + qIndex[n.id] + '" aria-label="' + esc('Go to the question: ' + n.title) + '">' + mark + label + '</button>'
        : '<span class="wg-tree-node">' + mark + label + '</span>';
      rows.push('<li class="wg-tree-li" data-state="' + n.state + '" data-kind="' + n.kind + '" data-depth="' + depth + '"' + (cq && n.id === cq && n.state === 'frontier' ? ' data-current="1" aria-current="step"' : '') +
        ' role="treeitem" aria-level="' + (depth + 1) + '" aria-label="' + esc(n.title + ': ' + TREE_STATE[n.state]) + '">' + (guides ? '<span class="wg-tree-guides">' + guides + '</span>' : '') + body + '</li>');
      var ks = kids[n.id];
      ks.forEach(function (k, i) { walk(k, depth ? flags.concat([!last]) : [], i === ks.length - 1, depth + 1); });
    }
    roots.forEach(function (n, i) { walk(n, [], i === roots.length - 1, 0); });
    return '<div class="wg-tree-wrap" data-k="wg-tree:' + esc(s.id) + (o.where ? ':' + o.where : '') + '" data-where="' + esc(o.where || '') + '">' +
      '<ol class="wg-tree" role="tree" aria-label="' + esc('How the decisions hang together') + '">' + rows.join('') + '</ol></div>';
  }
  /* What we agreed: every decision with its answer and every decision left open, Confirm and Keep going (CWR-042),
     the run's one counter, and the map of how the decisions hang together */
  var ENDED = { wrap_up: 'you wrapped up', cap: 'the question limit was reached', switched_off: 'Grill Me was turned off', frontier_empty: 'no decision was left to ask' };
  function agreedCard(m) {
    var s = sessionOf(m.key, m.sessionId);
    if (!s) return '';
    var a = GE.agreed(s), current = (s.keepGoing || 0) === (m.pass || 0), S_ = S();
    var confirmed = s.status === 'confirmed' && current, superseded = !current, live = !superseded && !confirmed;
    var r = m.key.indexOf('run:') === 0 ? run(m.key.slice(4)) : null;
    var lead = r ? leadName(r) : 'assistant', what = waitsFor(r, s);
    var mark = r ? leadMark(r, 22, confirmed ? 'done' : 'needs', true) : S_.pmxMark({ role: 'this-chat', size: 22, state: confirmed ? 'done' : 'needs', grill: true });
    var rows = a.decisions.map(function (d, i) {
      return '<li class="wg-agreed-row"><span class="wg-agreed-n">' + (i + 1) + '</span><span class="wg-agreed-q">' + esc(d.title) + '</span><span class="wg-agreed-a"><b>' + esc(d.answer) + '</b><span class="wg-agreed-prov">' + (d.took === 'recommended' ? 'recommended' : 'your answer') + '</span></span></li>';
    }).join('');
    var open = a.open.length ? '<p class="wg-agreed-sub">' + S_.pmxStatus('pending', 14) + '<b>Left open</b><span class="wg-agreed-prov">' + plural(a.open.length, 'decision') + '</span></p><ul class="wg-agreed-open">' + a.open.map(function (o) {
      return '<li><span class="wg-agreed-q">' + esc(o.title) + '</span><span class="wg-agreed-prov">' + esc(o.why) + '</span>' +
        (live && o.canAsk ? '<button type="button" class="text-button wg-ask-again" data-action="wg-ask-again" data-key="' + esc(m.key) + '" data-node="' + esc(o.id) + '">Ask again</button>' : '') + '</li>';
    }).join('') + '</ul>' : '';
    /* n2: no parentheses inside the line's own */
    var facts = a.facts.length ? '<p class="wg-agreed-facts">' + S_.pmxGlyph('flask', 12) + '<span>Looked up, not asked: ' + esc(a.facts.map(function (f) { return f.title + ': ' + f.fact; }).join('; ')) + '</span></p>' : '';
    /* the map is a part of this card, never a transcript surface of its own (IMPACT A2-18), so it sits in a plain wrapper */
    var map = '<div class="wg-agreed-mapwrap">' + S_.pmxDisclosure({ key: 'wg-agreed-map:' + m.id, cls: 'wg-agreed-map', summary: 'How the decisions hang together', body: treeHtml(m.key, { sessionId: s.id, where: 'agreed' }) }) + '</div>';
    var foot = superseded ? '<p class="wg-agreed-note">' + S_.pmxStatus('skipped', 14) + '<span>You kept going after this; the newer What we agreed below replaces it.</span></p>'
      : confirmed ? '<p class="wg-agreed-note wg-agreed-done">' + S_.pmxStatus('done', 14) + '<span><b>Confirmed.</b> These are your decisions on this ' + (r ? 'run' : 'plan') + '. ' + (r ? 'The ' + lead + ' goes on with ' + esc(what) + ' now.' : 'The assistant writes the plan from them.') + '</span></p>'
        : '<div class="wg-agreed-acts"><button type="button" class="primary-button" data-action="wg-confirm" data-key="' + esc(m.key) + '">Confirm</button><button type="button" class="text-button" data-action="wg-keep-going" data-key="' + esc(m.key) + '">Keep going</button>' +
          '<p class="wg-agreed-prov">Nothing acts on these until you confirm. ' + (r ? esc(cap(what)) + (/proposals$/.test(what) ? ' wait' : ' waits') + ' for it' + (s.later ? '; everything else keeps going.' : '.') : 'The plan is not written until then.') + '</p></div>';
    var c = a.counter;
    return '<article class="wg-agreed" data-k="wg-agreed:' + esc(m.id) + '" data-state="' + (superseded ? 'superseded' : confirmed ? 'confirmed' : 'open') + '" data-ended="' + esc(a.endedBy || '') + '">' +
      '<header class="wg-agreed-head"><span class="wg-agreed-kettle">' + mark + '</span><div><p class="wg-agreed-title">What we agreed</p><p class="wg-agreed-prov">' + (s.later ? 'Before ' + esc(what) + ' · ' : '') + 'Grill Me with the ' + esc(lead) + ' · ' + plural(a.rounds, 'round') + ' · ended because ' + esc(ENDED[a.endedBy] || ENDED.frontier_empty) + ' · ' + c.asked + ' of up to ' + c.limit + ' questions asked ' + (r ? 'in this run' : 'in this plan') + '</p></div></header>' +
      (rows ? '<ol class="wg-agreed-list">' + rows + '</ol>' : '<p class="wg-agreed-prov">No decision was settled.</p>') + open + facts + map + foot + '</article>';
  }
  function roundLine(m) {
    var s = sessionOf(m.key, m.sessionId), r = m.key.indexOf('run:') === 0 ? run(m.key.slice(4)) : null;
    var who = r ? 'the ' + leadName(r) : 'the assistant';
    var parts = [plural(m.decided, 'decision') + ' settled'];
    if (m.recommended) parts.push(m.recommended === m.decided ? (m.decided === 1 ? 'the recommended answer' : 'all recommended') : m.recommended + ' recommended');
    if (m.notSure) parts.push(m.notSure + ' left open');
    if (!m.decided && m.wrapped) parts = [plural(m.notSure, 'question') + ' left open, not answered'];
    var mark = r ? leadMark(r, 16, 'idle', true) : S().pmxMark({ role: 'this-chat', size: 16, grill: true });
    return S().pmxLedgerLine({ key: 'wg-round:' + m.id, cls: 'wg-round', kind: 'grill', markHtml: mark, kindWord: 'Grill Me', title: 'Round ' + m.round,
      headline: 'Round ' + m.round + (m.wrapped ? ' · you wrapped up' : '') + ' · ' + esc(parts.join(' · ')), tip: 'Grill Me with ' + who + '. Each question counts once against the ' + (s && s.later ? 'same ' : '') + 'one question limit' + (s ? ': ' + GE.counter(s).asked + ' of up to ' + GE.counter(s).limit + ' asked so far' : '') + '.', actions: [] });
  }
  /* the main chat's Wonderer card: one per pass, statuses in place, Check it, and Open the leads */
  function passCard(m) {
    var r = run(m.runId); if (!r || !wState(r)) return '';
    var pass = list(wState(r).passes).filter(function (x) { return x.id === m.passId; })[0]; if (!pass) return '';
    var K = { crew: 'Crew', chat_room: 'Chat Room', brainstorm: 'BrainStorm' }[r.kind] || '';
    return '<article class="wg-card" data-k="wg-card:' + esc(m.id) + '" data-run="' + esc(r.id) + '">' + passBlock(r, pass, { where: 'chat' }) +
      '<footer class="wg-card-foot"><span class="wg-fine">For the ' + esc(K) + ' “' + esc(String(r.title || '').replace(/^\w[\w ]* · /, '')) + '” · the Wonderer never votes or takes a turn</span>' +
      '<button type="button" class="text-button" data-action="wg-open-leads" data-run="' + esc(r.id) + '">Open the leads</button></footer></article>';
  }

  /* ================================================================ 8. slots */
  E.slot('transcriptMessage', function (c) {
    var m = c.m; if (!m) return '';
    if (m.type === 'wg-pass') return passCard(m);
    if (m.type === 'wg-agreed') return agreedCard(m);
    if (m.type === 'wg-round') return roundLine(m);
    if (m.type === 'wg-lookup') return lookupLine(m);
    return '';
  });
  E.slot('transcriptFamily', function (c) {
    var t = c.m && c.m.type;
    return t === 'wg-pass' ? 'people' : t === 'wg-agreed' ? 'needs' : t === 'wg-round' || t === 'wg-lookup' ? 'ledger' : '';
  });

  /* ================================================================ 9. actions */
  function runOf(b) { return run(b && b.dataset && b.dataset.run); }
  E.action('wg-check-it', function (c, b) {
    var r = runOf(b); if (!r) return true;
    var res = engine.checkIt(r, b.dataset.lead, { takesRequests: takesRequests(r) });
    if (!res.ok) { c.toast('Nothing changed', refusedText(res.error)); return true; }
    if (res.existing) {
      /* already in research (or already checked): show that research instead of starting another */
      var rl = engine.lead(r, b.dataset.lead), rs = res.research;
      c.toast('Lead ' + rl.n + ' is ' + (rs.status === 'running' ? 'being checked by ' + (rs.by ? rs.by.name : 'a helper') : rs.status === 'queued' ? 'already queued for research' : 'already checked: ' + WE.STATUS_WORD[rs.status].toLowerCase()), 'Showing that check rather than starting another.');
      var x = document.createElement('button'); x.dataset.run = r.id; x.dataset.lead = b.dataset.lead; E.run('wg-show-lead', x, new Event('click'));
      return true;
    }
    C().appendMessage(r.id, { senderKind: 'user', senderName: 'You', messageType: 'request', body: 'Check it: lead ' + engine.lead(r, b.dataset.lead).n + ', “' + engine.lead(r, b.dataset.lead).title + '”' });
    document.dispatchEvent(new CustomEvent('pm56:wg-check-it', { detail: { runId: r.id, leadId: b.dataset.lead } }));
    USER_CHECKS[r.id + ':' + b.dataset.lead] = { runId: r.id, leadId: b.dataset.lead, at: Date.now() };
    if (!userTimer) userTimer = setInterval(userTick, 600);
    render(); return true;
  });
  E.action('wg-open-leads', function (c, b) {
    var r = runOf(b); if (!r) return true;
    if (r.kind === 'brainstorm' && r.wonderer && window.PM56_BATCH13) { c.openEditor('wonderer:' + r.id); return true; }
    /* the kind's own document (a Crew's crew-work:, a Chat Room's room:) on the tab that holds the Wonderer section, so a
       run already open beside the chat is not opened a second time in another tab */
    var V = window.PM56_COLLAB_VIEW, own = { crew: ['crew-work:', 'overview'], chat_room: ['room:', 'transcript'] }[r.kind];
    if (V && V.open) V.open(r.id, own ? { tab: own[1], docId: own[0] + r.id } : { tab: 'overview' });
    /* the section's top lands below the view's sticky head (a Chat Room's), never under it */
    setTimeout(function () {
      var el = document.querySelector('[data-k^="wg-sec:' + r.id + '"]'); if (!el || !el.scrollIntoView) return;
      var v = el.closest('.pmx-view'), head = v && v.querySelector(':scope > .pmx-view-head');
      el.style.scrollMarginTop = (head && getComputedStyle(head).position === 'sticky' ? Math.ceil(head.getBoundingClientRect().height) + 12 : 0) + 'px';
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
    }, 60);
    return true;
  });
  E.action('wg-show-lead', function (c, b) {
    var r = runOf(b); if (!r) return true;
    FLASH = { key: r.id + ':' + b.dataset.lead, at: Date.now() };
    var inView = document.querySelector('.pmx-view [data-k="wg-lead:' + r.id + ':' + b.dataset.lead + '"]');
    if (!inView) { var x = document.createElement('button'); x.dataset.run = r.id; E.run('wg-open-leads', x, new Event('click')); }
    else c.renderApp();
    setTimeout(function () { var el = document.querySelector('.pmx-view [data-k="wg-lead:' + r.id + ':' + b.dataset.lead + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'auto' }); }, 90);
    return true;
  });
  E.action('wg-ask-pass', function (c, b) {
    var r = runOf(b); if (!r) return true;
    var ask = askState(r); if (!ask.ok) { c.toast('Nothing changed', ask.say || refusedText(ask.code)); return true; }
    /* the user's request is an addressed message (CWR-041): it goes in the run's transcript first */
    var m = C().appendMessage(r.id, { senderKind: 'user', senderName: 'You', messageType: 'request', recipientIds: [wondererP(r) && wondererP(r).id], body: 'Wonderer, take another pass around the ' + (r.kind === 'chat_room' ? 'topic' : 'job') + '.' });
    var res = startPass(r, { kind: 'user', name: 'you' }, '', m.id);
    if (!res.ok) { c.toast('Nothing changed', refusedText(res.error)); return true; }
    document.dispatchEvent(new CustomEvent('pm56:wg-pass-asked', { detail: { runId: r.id, passId: res.pass.id, by: 'user' } }));
    if (C().provenance && C().provenance(r.id) === 'recorded') { USER_PASSES[res.pass.id] = { runId: r.id, passId: res.pass.id, at: Date.now() }; if (!userTimer) userTimer = setInterval(userTick, 600); }
    render(); return true;
  });
  /* the lead's lane, the card's Answer button and the guide all land here; it goes where the session really is (R5):
     an open round opens the Ask Card, a lookup shows the lookup line (never What we agreed while research runs), an
     ended session shows What we agreed, a confirmed one says so */
  function scrollTo(sel) { setTimeout(function () { var el = document.querySelector(sel); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'auto' }); }, 60); }
  E.action('wg-open-round', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s) return true;
    var tid = ownerThread(key);
    if (c.state.selectedThread !== tid) c.switchThread(tid);
    if (s.status === 'grilling') {
      if (openRound(key)) return true;
      postLookup(key); render(); scrollTo('.wg-lookup:last-of-type, [data-k^="wg-lookup:"]');
      c.toast('Looking things up', 'The next round waits for research to come back. Nothing for you yet.');
      return true;
    }
    if (s.status === 'agreeing') { postAgreed(key); render(); scrollTo('.wg-agreed[data-state="open"]'); return true; }
    c.toast('Already confirmed', 'You confirmed what you agreed; the ' + (key.indexOf('run:') === 0 ? leadName(run(key.slice(4))) : 'assistant') + ' goes on from it.');
    return true;
  });
  /* the card's Wrap up and the Ask Card's: the same rule, only the answers you gave count (B2) */
  E.action('wg-wrap-up', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s || s.status !== 'grilling') return true;
    var fid = c.state.wgGrill && c.state.wgGrill.key === keyOf(key) && c.state.wgGrill.flow, flow = fid && D().questionFlows.filter(function (f) { return f.id === fid; })[0];
    if (flow && GE.round(s) && flow.grill.round === GE.round(s).n) { c.state.decision = null; grillAnswered(c, flow, c.state.questions, 'wrap'); render(); return true; }
    var before = GE.round(s), res = GE.wrapUp(s);
    if (before) { var t = c.state.threads.filter(function (x) { return x.id === ownerThread(key); })[0]; if (t) c.appendMessage({ id: 'wg-round-' + s.id + '-' + before.n, role: 'system', type: 'wg-round', key: keyOf(key), sessionId: s.id, round: before.n, decided: 0, recommended: 0, notSure: before.ids.length, wrapped: true, time: new Date().toISOString() }, t); }
    if (key.indexOf('run:') === 0) syncPending(run(key.slice(4))); if (res.ended) postAgreed(key);
    render(); return true;
  });
  /* What we agreed: Ask again on an open row (free when it was asked before; ACD-503) */
  E.action('wg-ask-again', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s) return true;
    var res = GE.reopen(s, b.dataset.node);
    if (!res.ok) { c.toast('Nothing changed', res.error === 'question_budget_exhausted' ? 'The question limit is reached: only questions already asked can come back.' : res.error === 'waits_on_another_decision' ? 'It waits on another decision that is still open.' : 'There is nothing to ask again.'); return true; }
    if (key.indexOf('run:') === 0) syncPending(run(key.slice(4)));
    if (res.opened) { openRound(key); if (HOOKS[keyOf(key)] && HOOKS[keyOf(key)].onRound) HOOKS[keyOf(key)].onRound(res.opened); }
    else if (res.waiting) postLookup(key);
    else if (res.ended) postAgreed(key);
    render(); return true;
  });
  E.action('wg-show-agreed', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s) return true;
    postAgreed(key);
    setTimeout(function () { var el = document.querySelector('[data-k^="wg-agreed:wg-agreed-' + s.id + '"]:last-of-type') || document.querySelector('.wg-agreed[data-state="open"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'auto' }); }, 60);
    c.renderApp(); return true;
  });
  E.action('wg-confirm', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s) return true;
    var res = GE.confirm(s); if (!res.ok) { c.toast('Nothing changed', 'There is nothing to confirm yet.'); return true; }
    if (key.indexOf('run:') === 0) { var r = run(key.slice(4)); if (r) { syncPending(r); C().appendMessage(r.id, { senderKind: 'user', senderName: 'You', messageType: 'message', body: 'Confirmed what we agreed' + (s.later ? ' before ' + waitsFor(r, s) : '') + ': ' + GE.agreed(s).decisions.map(function (d) { return d.title + ': ' + d.answer; }).join('; ') + '.' }); } }
    var h = HOOKS[keyOf(key)]; if (h && h.onConfirm) h.onConfirm(GE.agreed(s));
    document.dispatchEvent(new CustomEvent('pm56:wg-confirmed', { detail: { key: key } }));
    render(); return true;
  });
  E.action('wg-keep-going', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s) return true;
    var res = GE.keepGoing(s); if (!res.ok) { c.toast('Nothing changed', res.error === 'question_limit_reached' ? 'The question limit is reached, so there is nothing more to ask.' : 'There is nothing to go back to.'); return true; }
    if (key.indexOf('run:') === 0) syncPending(run(key.slice(4)));
    if (res.opened) { openRound(key); if (HOOKS[keyOf(key)] && HOOKS[keyOf(key)].onRound) HOOKS[keyOf(key)].onRound(res.opened); }
    else if (res.waiting) postLookup(key);
    else if (res.ended) postAgreed(key);
    render(); return true;
  });
  /* The Grill Me switch on a running run (CWR-042, ACD-503). On: the one who talks to you grills you at the next
     round, assignment or phase boundary (the kind's driver calls takeMidRun there and beginMidRun starts the
     session); work already running continues, and only the step that would use the answers waits for Confirm. A
     Crew's or a Chat Room's question bank opens now; a BrainStorm's raises its ceiling and never resets its count.
     Off: a pending request is cleared, and a session still questioning you ends like Wrap up, with the open items
     listed in What we agreed (its Confirm still gates its step). */
  var BOUNDARY = { chat_room: 'round', crew: 'assignment', brainstorm: 'chapter' };
  /* a BrainStorm's question numbers, folded into the one plain line a toggle writes (n-b) */
  function limitWords(r, on) {
    var qb = r.kind === 'brainstorm' && r.brainstorm && r.brainstorm.questionBank; if (!qb) return '';
    var eff = (qb.baselineLimit || 0) + (on ? (qb.grillExtension || 0) : 0), n = (qb.askedIds || []).length;
    return ' The question limit is ' + (on ? 'now ' : 'back to ') + eff + (n ? '; the ' + plural(n, 'question') + ' already asked still count.' : '.');
  }
  function setGrill(r, on) {
    if (!r || r.kind === 'review') return { ok: false, error: 'no_grill_here' };
    r.config = r.config || {};
    var was = grillOn(r); r.config.grill_me_enabled = !!on;
    if (r.kind === 'brainstorm' && r.brainstorm && r.brainstorm.questionBank) { try { r.brainstorm.questionBank.grillMeEnabled = !!on; } catch (e) {} }
    var say = function (body) { C().appendMessage(r.id, { senderKind: 'system', senderName: 'System', messageType: 'message', body: body + limitWords(r, on) }); };
    if (on) {
      openRunBank(r);
      if (!was && takesRequests(r) && !activeSession(r)) { r.grillPending = true; say('Grill Me is on. The ' + leadName(r) + ' will question you at the next ' + BOUNDARY[r.kind] + ' boundary; what is running keeps going.'); }
      else if (r.kind === 'brainstorm') say('Grill Me is on.');
      return { ok: true };
    }
    var hadPending = !!r.grillPending; r.grillPending = false;
    var s = activeSession(r);
    if (s && s.status === 'grilling') { switchOffSession('run:' + r.id, s); say('Grill Me is off. The ' + leadName(r) + ' stops questioning you; what you agreed so far, and what was left open, waits for your Confirm.'); }
    else if (was && hadPending) say('Grill Me is off again before the ' + leadName(r) + ' asked anything. Nothing waits for it.');
    else if (r.kind === 'brainstorm') say('Grill Me is off.');
    return { ok: true };
  }
  /* Grill Me turned off while a session questions you, for a run or a Plan's thread alike (CWR-042, ACD-503; Astra F3):
     the round in the Ask Card closes like Wrap up (the answers you picked count, Not sure stays Not sure, an untouched
     draft is no answer), the Ask Card and its binding go, and one current What we agreed waits for your Confirm */
  function switchOffSession(key, s) {
    var c = ctx(), bound = c.state.wgGrill && c.state.wgGrill.key === key ? c.state.wgGrill : null;
    var flow = bound && D().questionFlows.filter(function (f) { return f.id === bound.flow; })[0], rd = GE.round(s);
    if (flow && rd && flow.grill.round === rd.n) {
      (c.state.questions || []).forEach(function (q) { if (!q.grillNode) return; var own = String(q.other || '').trim(), v = q.notSure ? null : own || q.answer; if (q.notSure) GE.answer(s, q.grillNode, null); else if ((q.touched || own) && v) GE.answer(s, q.grillNode, v); });
    }
    if (flow) flow.state = 'completed';
    if (bound) { c.state.wgGrill = null; if (c.state.decision && c.state.decision.type === 'question') c.state.decision = null; c.state.questions = []; }
    GE.switchOff(s);
    if (key.indexOf('run:') === 0) syncPending(run(key.slice(4)));
    postAgreed(key);
    return { ok: true };
  }
  function requestMidRunGrill(r) { return setGrill(r, true); }
  /* the kind's driver at a boundary: take the pending request only while the switch is still on (M2) */
  function takeMidRun(r) { if (!r || !r.grillPending) return false; r.grillPending = false; return grillOn(r); }
  /* a fixture for the interview Grill Me starts mid-run (a recording sets its own; else a short default per kind) */
  var MIDRUN = {}, MIDRUN_DEFAULT = {
    crew: [{ id: 'd-next-part', title: 'The next part', prompt: 'Keep the next part to what the job asked, with nothing extra?', why: 'Only the next part waits for your answer; the parts already running keep going.', options: [{ label: 'Yes, keep it to the job' }, { label: 'Add what the helpers noticed' }], recommended: 'Yes, keep it to the job' }],
    chat_room: [{ id: 'd-next-round', title: 'The next round', prompt: 'Keep the next round on the question as you asked it?', why: 'Only the next round waits for your answer.', options: [{ label: 'Yes, keep it on the question' }, { label: 'Widen it to the follow-ups' }], recommended: 'Yes, keep it on the question' }],
    brainstorm: [{ id: 'd-next-step', title: 'The vote', prompt: 'Let the team vote on the options as they stand?', why: 'Only the vote waits for your answer; the debate goes on.', options: [{ label: 'Yes, vote on them as they stand' }, { label: 'Add an option first' }], recommended: 'Yes, vote on them as they stand' }]
  };
  /* a recording's fixture is a tree, or a function of the step it gates (gate, run) -> tree, so the question always
     asks about the step that actually waits for it (Astra F8) */
  function setMidRunFixture(r, tree) { if (r) MIDRUN[r.id] = typeof tree === 'function' ? tree : copy(tree); }
  /* An ordinary Plan or Deep Plan with Grill Me turned on (APR-072, m10): the assistant grills you on that Plan's
     thread, over the Plan's own question counter, and the next revision waits for your Confirm (the Plan's Revise
     says so). The decisions are the ones any revision of a plan turns on. */
  var PLAN_TREE = [
    { id: 'd-scope', title: 'Scope', prompt: 'Keep this plan’s scope as it stands?', why: 'It decides what the next revision may change.', options: [{ label: 'Yes, keep the scope' }, { label: 'Narrow it to the first step' }, { label: 'Widen it to what the plan leaves out' }], recommended: 'Yes, keep the scope' },
    { id: 'd-order', title: 'Order', prompt: 'Keep the steps in their current order?', why: 'Asked now that the scope is settled.', dependsOn: ['d-scope'], options: [{ label: 'Yes, keep the order' }, { label: 'Put the riskiest step first' }], recommended: 'Yes, keep the order' },
    { id: 'd-check', title: 'Checking', prompt: 'Check each step before the next one starts?', why: 'It sets how the revision says each step is verified.', options: [{ label: 'Yes, check each step' }, { label: 'Check once at the end' }], recommended: 'Yes, check each step' }
  ];
  function planGrill(rec) {
    if (!rec || !rec.thread_id) return { ok: false, error: 'plan_missing' };
    var key = 'thread:' + rec.thread_id, s = THREAD_GRILL[rec.thread_id];
    if (s && (s.status === 'grilling' || s.status === 'agreeing')) return { ok: true, reused: true };
    var c = ctx(), t = c.state.threads.filter(function (x) { return x.id === rec.thread_id; })[0];
    if (t) c.appendMessage({ id: 'wg-plan-ask-' + rec.plan_id + '-' + Date.now(), role: 'assistant', type: 'text', recordedExample: true, time: new Date().toISOString(),
      body: 'Grill Me is on for “' + rec.title + '”, so before its next revision I’ll ask the decisions it turns on, a round at a time, each with the answer I recommend filled in. Nothing changes in the plan until you confirm what we agreed.' }, t);
    return begin(key, { by: 'assistant', subject: rec.title, tree: copy(PLAN_TREE), gate: 'revise', gateLabel: 'the next revision', bankKey: 'plan:' + rec.plan_id,
      hooks: { onConfirm: function (a) { var t2 = ctx().state.threads.filter(function (x) { return x.id === rec.thread_id; })[0]; if (t2) ctx().appendMessage({ id: 'wg-plan-ok-' + rec.plan_id + '-' + Date.now(), role: 'assistant', type: 'text', recordedExample: true, time: new Date().toISOString(), body: 'Thanks. The next revision of “' + rec.title + '” follows what we agreed: ' + a.decisions.map(function (d) { return d.title.toLowerCase() + ', ' + d.answer.charAt(0).toLowerCase() + d.answer.slice(1); }).join('; ') + '.' }, t2); } } });
  }
  function planGrillOff(rec) { var s = rec && THREAD_GRILL[rec.thread_id]; if (s && s.status === 'grilling') switchOffSession('thread:' + rec.thread_id, s); return { ok: true }; }
  /* does a thread's Grill Me session still hold that step (the Plan's Revise asks) */
  function threadHolds(tid, gate) { var s = THREAD_GRILL[tid]; return !!s && (!gate || s.gate === gate) && GE.holds(s); }
  /* beginMidRun(run, gate, gateLabel): the session Grill Me turned on mid-run starts here, at the boundary */
  function beginMidRun(r, gate, gateLabel) {
    var fx = MIDRUN[r.id], tree = typeof fx === 'function' ? fx(gate, r) : fx;
    tree = tree || MIDRUN_DEFAULT[r.kind]; if (!tree) return { ok: false, error: 'no_grill_here' };
    C().appendMessage(r.id, { senderKind: 'coordinator', senderName: leadName(r), messageType: 'message', body: 'Grill Me is on now, so I have ' + (tree.filter(function (n) { return n.kind !== 'fact'; }).length === 1 ? 'one decision' : 'a few decisions') + ' for you before ' + gateLabel + '. What is running keeps going; only ' + gateLabel + ' waits for your answers.' });
    return begin('run:' + r.id, { by: leadRole(r), subject: r.purpose, tree: copy(tree), gate: gate, gateLabel: gateLabel });
  }
  /* the switch in a Crew's or a Chat Room's run view (BrainStorm keeps collab-brainstorm-toggle-grill) */
  E.action('wg-toggle-grill', function (c, b) { var r = runOf(b); if (!r) return true; setGrill(r, !grillOn(r)); render(); return true; });
  E.chainAction('reset-all', function () { THREAD_GRILL = {}; THREAD_BANK = {}; HOOKS = {}; MIDRUN = {}; USER_PASSES = {}; USER_CHECKS = {}; if (userTimer) clearInterval(userTimer); userTimer = 0; return false; });

  window.PM56_WG = {
    engine: engine, grill: GE, attach: attach, grillOn: grillOn, holds: holds, sessionOf: sessionOf, wondererP: wondererP, leadName: leadName, leadRole: leadRole,
    startPass: startPass, deliverPass: deliverPass, dispose: dispose, gate: gateWords, counts: function (r) { return engine.counts(r); }, countsText: countsText,
    lane: lane, leadLane: leadLane, decorateLanes: decorateLanes, attention: attention, sentence: sentence,
    section: section, passBlock: passBlock, treeHtml: treeHtml, treeTally: treeTally, leadRow: leadRow, entryHtml: entryHtml, leadLinks: leadLinks, listingHtml: listingHtml, listingText: listingText,
    begin: begin, openRound: openRound, grillAnswered: grillAnswered, factFound: factFound, postAgreed: postAgreed, refusedText: refusedText,
    askState: askState, reservePasses: reservePasses, scriptChecks: scriptChecks,
    stepHeld: stepHeld, activeSession: activeSession, sessionsOf: sessionsOf, face: face, pump: pump, slotFree: slotFree, requestMidRunGrill: requestMidRunGrill, takeMidRun: takeMidRun,
    setGrill: setGrill, beginMidRun: beginMidRun, setMidRunFixture: setMidRunFixture, bankFor: bankFor, planGrill: planGrill, planGrillOff: planGrillOff, threadHolds: threadHolds,
    close: function (r) { return engine.close(r); },
    threadSession: function (tid) { return THREAD_GRILL[tid] || null; }
  };
})();
