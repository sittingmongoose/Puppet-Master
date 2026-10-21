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
  function holds(r) { var s = r && r.grill; return grillOn(r) && !!s && !s.later && GE.holds(s); }
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

  /* ================================================================ 2. attach at Start */
  /* collaboration.js calls this once a run exists (the wand's commit and admitCrewWork). The Wonderer's record and,
     with Grill Me on, the definition flag; a wand-started run is born waiting (nothing runs in this preview), so its
     first pass and its interview start only when a recorded example plays them. */
  function attach(r, d) {
    if (!r) return;
    r.config = r.config || {};
    if (r.kind !== 'review') r.config.grill_me_enabled = !!(d && d.grillMe);
    if (wondererP(r) && !wState(r)) engine.attach(r, { kind: r.kind, seed: r.purpose || r.title || 'the run’s topic', seedId: 'seed-' + r.id });
  }

  /* ================================================================ 3. words and marks */
  var STATUS_MARK = { waiting: 'pending', exploring: 'reviewing', using: 'mixed', set_aside: 'skipped', supported: 'complete', not_supported: 'skipped' };
  var REFUSED = {
    wonderer_cannot_dispose: 'The Wonderer never decides its own leads.', wonderer_cannot_research: 'The Wonderer never explores its own leads.',
    wonderer_cannot_request_pass: 'The Wonderer never asks for its own pass.', coordinator_records_dispositions: 'The Coordinator records each decision.',
    moderator_records_dispositions: 'The Moderator records each decision.', one_line_reason_required: 'Every decision needs a one-line reason.',
    lead_held_until_proposals_in: 'Held until every blind proposal is in.', research_running: 'This lead is being checked already.',
    research_has_result: 'This lead already has its result.', run_takes_no_requests: 'This run has finished, so it takes no more requests.',
    pass_limit: 'This run already had its two extra passes.', pass_running: 'A pass is already exploring or queued.', pass_request_must_be_addressed: 'Ask the Wonderer in a message first.',
    team_writing_result: 'The team is writing the result.', at_most_five_leads: 'A pass hands over five leads at most.'
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
  /* one status, in place, with the reason and who recorded it (CWR-043): line 1 is the status and who stands behind it,
     line 2 the one-line reason, so the reason never breaks the status line */
  function statusLine(r, l) {
    var st = engine.status(l), w = wState(r), d = l.disposition, rs = l.research, pass = engine.passOf(r, l);
    var held = pass && pass.status === 'held', word = held ? 'Waiting for the team' : WE.STATUS_WORD[st], who = '', why = '', quote = false;
    if (held) why = 'Held until every blind proposal is in.';
    else if (rs && (rs.status === 'supported' || rs.status === 'not_supported')) {
      who = rs.by ? '<span class="wg-who">checked by ' + esc(rs.by.name) + (rs.via === 'check_it' ? ', because you asked' : '') + '</span>' : '';
      why = rs.note;
    } else if (rs && (rs.status === 'queued' || rs.status === 'running')) {
      var by = rs.status === 'running' && rs.by ? rs.by.name + ' is on it' : w.kind === 'brainstorm' ? 'checked in the Evidence round' : w.kind === 'crew' ? 'a read-only part for one helper' : 'up for the next round';
      who = '<span class="wg-who">' + esc(by) + '</span>' + (d && rs.via !== 'check_it' ? byLine(r, d.by) : '');
      if (rs.via === 'check_it') why = 'You asked to check it.'; else if (d) { why = d.reason; quote = true; }
    } else if (d) { who = byLine(r, d.by); why = d.reason; quote = true; }
    else if (w.kind === 'chat_room' && r.status === 'completed') { word = 'Not taken up'; why = 'The room left it undecided.'; }
    else why = pass && pass.n > 1 ? 'The ' + leadName(r) + ' decides it now that it has arrived.' : w.kind === 'chat_room' ? 'The Moderator decides it as it arrives.' : w.kind === 'crew' ? 'The Coordinator decides it while it splits the job.' : 'The team decides it in the Debate.';
    var hyp = l.hypothesis && st === 'using' ? '<span class="wg-hyp">still a hypothesis</span>' : '';
    return '<p class="wg-lead-status" data-status="' + (held ? 'held' : st) + '"><span class="wg-st-head"><span class="wg-st-mark">' + S().pmxStatus(held ? 'waiting-dep' : STATUS_MARK[st], 14) + '</span><b>' + esc(word) + '</b></span>' + hyp + who + '</p>' +
      (why ? '<p class="wg-lead-why' + (quote ? ' wg-quote' : '') + '">' + (quote ? '<q>' + esc(why) + '</q>' : esc(why)) + '</p>' : '');
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
    if (w && w.closedAt) return '<button type="button" class="text-button wg-check" disabled data-failure="team_writing_result" data-hover-key="wg-check:' + esc(l.id) + '" data-hover-tip="' + esc(refusedText('team_writing_result')) + '">' + S().pmxGlyph('search', 12) + 'Check it</button>';
    var tip = rs ? (rs.status === 'queued' || rs.status === 'running' ? 'Already in research: this shows it rather than starting another.' : 'Already checked: this shows the result.') : 'Sends this lead to research now, whatever the team decided. Only you can do this.';
    return '<button type="button" class="text-button wg-check" data-action="wg-check-it" data-run="' + esc(r.id) + '" data-lead="' + esc(l.id) + '" data-hover-key="wg-check:' + esc(l.id) + '" data-hover-tip="' + esc(tip) + '">' + S().pmxGlyph('search', 12) + 'Check it</button>';
  }
  /* a lead row. o.dossier: the dossier disclosure (run views); o.compact: the main chat's tighter row */
  function leadRow(r, l, o) {
    o = o || {};
    var st = engine.status(l), pass = engine.passOf(r, l), k = r.id + ':' + l.id;
    var flash = FLASH.key === k && Date.now() - FLASH.at < 2400 ? ' data-flash="1"' : '';
    var dossier = o.dossier && l.dossier ? S().pmxDisclosure({ key: 'wg-dos:' + k, cls: 'wg-dossier', summary: 'Dossier', body:
      (l.dossier.found ? '<p><b>What it found</b> ' + esc(l.dossier.found) + '</p>' : '') + (l.dossier.why ? '<p><b>Why it’s interesting</b> ' + esc(l.dossier.why) + '</p>' : '') + (l.dossier.next ? '<p><b>Worth looking into next</b> ' + esc(l.dossier.next) + '</p>' : '') }) : '';
    var takes = list(l.takenUpBy).map(function (mid) { return list(r.messages).filter(function (m) { return m.id === mid; })[0]; }).filter(Boolean);
    var taken = o.compact || !takes.length ? '' : '<p class="wg-lead-taken">' + S().pmxGlyph('reply', 12) + '<span>Taken up by ' + esc(words(takes.map(function (m) { return m.senderName || 'a helper'; }).filter(function (v, i, a) { return a.indexOf(v) === i; }))) + '</span></p>';
    return '<li class="wg-lead" data-k="wg-lead:' + esc(k) + (o.compact ? ':c' : '') + '" data-lead="' + esc(l.id) + '" data-status="' + (pass && pass.status === 'held' ? 'held' : st) + '"' + flash + '>' +
      '<span class="wg-lead-n" aria-hidden="true">' + l.n + '</span>' +
      '<div class="wg-lead-body">' +
        '<p class="wg-lead-title">' + esc(l.title) + '</p>' +
        '<p class="wg-lead-tether"><span class="wg-angle">' + esc(WE.ANGLES[l.angle] || l.angle) + '</span><span class="wg-tether">' + esc(l.tether) + '</span></p>' +
        sourceLine(r, l) + statusLine(r, l) + evidenceLine(r, l) + taken + dossier +
      '</div>' + checkBtn(r, l) + '</li>';
  }
  function passWhy(r, pass) {
    if (pass.by.kind === 'start') return 'started with the ' + (r.kind === 'chat_room' ? 'room' : r.kind === 'brainstorm' ? 'BrainStorm' : 'Crew');
    return 'asked for by ' + (pass.by.kind === 'user' ? 'you' : pass.by.name || 'a helper');
  }
  /* one pass: the Wonderer's message (CWR-043). o.where: 'chat' (the main chat card) | 'view' (run views) | 'conv' */
  function passBlock(r, pass, o) {
    o = o || {};
    var w = wState(r), leads = pass.leadIds.map(function (id) { return engine.lead(r, id); }).filter(Boolean);
    var exploring = pass.status === 'exploring', queued = pass.status === 'queued', held = pass.status === 'held', failed = pass.status === 'failed';
    var head = '<header class="wg-pass-head">' + (o.where === 'conv' ? '' : wMark(o.where === 'chat' ? 22 : 24, exploring ? 'working' : queued ? 'queued' : 'idle')) +
      '<p class="wg-pass-title"><b>' + (o.where === 'conv' ? 'Pass ' + pass.n : 'Wonderer · pass ' + pass.n) + '</b><span class="wg-fine">' + esc(passWhy(r, pass)) + (pass.about ? ' · around “' + esc(pass.about) + '”' : '') + '</span></p></header>';
    var say;
    if (queued) say = '<p class="wg-pass-say wg-exploring">' + S().pmxStatus('pending', 14) + '<span>Queued behind the team’s work: it starts as soon as a slot frees up. Nobody waits for it.</span></p>';
    else if (exploring) say = '<p class="wg-pass-say wg-exploring">' + S().pmxStatus('working', 14) + '<span>' + (pass.about ? 'Exploring ' + esc(pass.about) : 'Exploring around <q>' + esc(String(w.seed).slice(0, 90)) + '</q>') + '. Its leads go to the team when the pass is done.</span></p>';
    else if (failed) say = '<p class="wg-pass-say">' + S().pmxStatus('failed', 14) + '<span>This pass ' + (pass.outcome === 'timed_out' ? 'ran out of time' : 'didn’t finish') + '. The run goes on without it, and it doesn’t count toward the two extra passes.</span></p>';
    else say = '<p class="wg-pass-say">' + esc(pass.summary) + '</p>' +
      (pass.angles.length ? '<p class="wg-pass-angles">Looked at ' + esc(words(pass.angles.map(function (a) { return a.name.toLowerCase(); }))) + '. ' +
        (!leads.length ? '<b>No new leads.</b> ' + esc(pass.stopReason || 'Nothing it found connected to the topic in a way the team doesn’t already have.')
          : pass.stoppedEarly ? 'Stopped early with ' + plural(leads.length, 'lead') + (pass.stopReason ? ': ' + esc(pass.stopReason) : '.') + ' None of them is a fact yet.'
            : plural(leads.length, 'lead') + ' for the team to weigh; none of them is a fact yet.') + '</p>' : '');
    var heldNote = held ? '<p class="wg-held">' + S().pmxStatus('waiting-dep', 14) + '<span><b>Held until every proposal is in.</b> The helpers draft alone first; they see these leads when the options are lined up.</span></p>' : '';
    var rows = leads.length ? '<ol class="wg-leads' + (o.where === 'chat' ? ' wg-leads--chat' : '') + '">' + leads.map(function (l) { return leadRow(r, l, { compact: o.where === 'chat', dossier: o.where === 'view' }); }).join('') + '</ol>' : '';
    return '<section class="wg-pass" data-k="wg-pass:' + esc(r.id + ':' + pass.id) + (o.where ? ':' + o.where : '') + '" data-pass="' + esc(pass.id) + '" data-status="' + esc(pass.status) + '" data-where="' + esc(o.where || 'view') + '">' + head + say + heldNote + rows + '</section>';
  }
  /* the card's summary line: leads explored, used, set aside and waiting (CWR-043) */
  function countsText(r) {
    var w = wState(r); if (!w || !w.leads.length) return '';
    var c = engine.counts(r), parts = [];
    if (c.explored) parts.push(c.explored + ' explored');
    if (c.used) parts.push(c.used + ' used');
    if (c.setAside) parts.push(c.setAside + ' set aside');
    if (c.waiting) parts.push(c.waiting + ' waiting');
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
    if (s.status === 'grilling' && rd) return { tone: 'accent', strong: 'Your move.', word: 'Your move', text: 'The ' + leadName(r) + (s.later ? ' has ' + plural(rd.ids.length, 'decision') + ' for you: round ' + rd.n + '. ' : ' is grilling you: round ' + rd.n + ', ' + plural(rd.ids.length, 'decision') + '. ') + what + ' for your answers.' + rest,
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
    var asks = w.passes.length && takesRequests(r) && o.ask !== false ? '<p class="wg-ask"><button type="button" class="text-button" data-action="wg-ask-pass" data-run="' + esc(r.id) + '"' + (w.closedAt || !engine.passesLeft(r) ? ' disabled' : '') + '>' + S_.pmxGlyph('sparkles', 12) + 'Ask the Wonderer for another pass</button><span class="wg-fine">' +
      (w.closedAt ? esc(refusedText('team_writing_result')) : engine.passesLeft(r) ? plural(engine.passesLeft(r), 'extra pass', 'extra passes') + ' left · a pass that fails doesn’t count' : 'Both extra passes are used') + '</span></p>' : '';
    var body = wait + none + w.passes.slice().reverse().map(function (pass) { return passBlock(r, pass, { where: 'view' }); }).join('') + asks;
    return S_.pmxViewSection({ key: 'wg-sec:' + r.id + (o.key ? ':' + o.key : ''), cls: 'wg-section', title: 'Wonderer’s leads', meta: meta, body: body });
  }
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
    return '<div class="wg-listing" data-k="wg-listing:' + esc(r.id) + '"><p class="wg-listing-head">' + wMark(16) + '<b>' + esc(o.title || 'Every Wonderer lead') + '</b><span class="wg-fine">' + esc(countsText(r)) + '</span></p><ol>' + rows.map(function (x) {
      return '<li data-status="' + esc(x.word === 'Not taken up' ? 'not_taken_up' : x.status) + '"><span class="wg-lead-n">' + x.n + '</span><span class="wg-listing-t">' + esc(x.title) + '</span><span class="wg-listing-s">' + S().pmxStatus(x.word === 'Not taken up' ? 'pending' : STATUS_MARK[x.status], 12) + '<b>' + esc(x.word) + '</b>' + (x.reason ? ' · ' + esc(x.reason) : '') + '</span></li>';
    }).join('') + '</ol></div>';
  }
  function listingText(r) {
    return engine.listing(r).map(function (x) { return x.n + '. ' + x.title + ' — ' + x.word + (x.reason ? ': ' + x.reason : '') + (x.status === 'using' ? ' (a hypothesis, not a fact)' : ''); });
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
      var x = USER_CHECKS[k], r = run(x.runId), l = r && wState(r) && engine.lead(r, x.leadId), rs = l && l.research;
      if (!rs || !takesRequests(r)) { delete USER_CHECKS[k]; return; }
      any = true;
      if (r.status === 'paused') return;
      if (rs.status === 'queued' && Date.now() - x.at >= 1400) {
        var p = helperFor(r);
        if (!p || !engine.startResearch(r, l.id, { id: p.id, name: p.name || p.role, role: 'participant' }).ok) { delete USER_CHECKS[k]; return; }
        x.started = Date.now(); render(); return;
      }
      if (rs.status === 'running' && x.started && Date.now() - x.started >= 3200) {
        var B = window.PM56_WONDERER, res = r.kind === 'brainstorm' && B && B.researchResult ? B.researchResult(r, l.id) : null;
        engine.finishResearch(r, l.id, res || { outcome: 'not_supported', note: 'Nothing in this example’s sources backs it up.' });
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
    var made = GE.create({ by: o.by, subject: o.subject, tree: o.tree, cap: o.cap, gate: o.gate, gateLabel: o.gateLabel });
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
        answer: n.answer != null ? n.answer : n.recommended, recommended: n.recommended, grillNode: n.id, notSure: false };
    });
    var fid = 'wg-flow:' + s.id + ':' + rd.n, F = D().questionFlows;
    var flow = F.filter(function (f) { return f.id === fid; })[0];
    if (!flow) {
      flow = { id: fid, title: 'Grill Me · round ' + rd.n, threadId: tid, state: 'active', openedAt: 'Now', questions: copy(qs),
        note: 'The ' + s.byName + ' is grilling you. Each answer is filled in with the recommended one; change any, say Not sure, or accept them all.',
        grill: { key: key, by: s.by, byName: s.byName, round: rd.n, count: qs.length, asked: s.asked, cap: s.cap } };
      F.push(flow);
    }
    var saved = c.state.wgGrill && c.state.wgGrill.flow === fid && Array.isArray(c.state.questions) && c.state.questions[0] && c.state.questions[0].id === qs[0].id;
    Object.assign(c.state, { decision: { type: 'question' }, wgGrill: { key: key, flow: fid, round: rd.n } });
    if (!saved) { c.state.questions = copy(qs); c.state.questionIndex = 0; }
    if (!(o && o.auto)) render(); else c.renderApp();
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
  /* What we agreed: every decision with its answer and every decision left open, Confirm and Keep going (CWR-042) */
  function agreedCard(m) {
    var s = sessionOf(m.key, m.sessionId);
    if (!s) return '';
    var a = GE.agreed(s), current = (s.keepGoing || 0) === (m.pass || 0), S_ = S();
    var confirmed = s.status === 'confirmed' && current, superseded = !current;
    var r = m.key.indexOf('run:') === 0 ? run(m.key.slice(4)) : null;
    var lead = r ? leadName(r) : 'assistant', what = waitsFor(r, s);
    var mark = r ? leadMark(r, 22, confirmed ? 'done' : 'needs', true) : S_.pmxMark({ role: 'this-chat', size: 22, state: confirmed ? 'done' : 'needs', grill: true });
    var rows = a.decisions.map(function (d, i) {
      return '<li class="wg-agreed-row"><span class="wg-agreed-n">' + (i + 1) + '</span><span class="wg-agreed-q">' + esc(d.title) + '</span><span class="wg-agreed-a"><b>' + esc(d.answer) + '</b><span class="wg-fine">' + (d.took === 'recommended' ? 'recommended' : 'your answer') + '</span></span></li>';
    }).join('');
    var open = a.open.length ? '<p class="wg-agreed-sub">' + S_.pmxStatus('pending', 14) + '<b>Left open</b><span class="wg-fine">' + plural(a.open.length, 'decision') + '</span></p><ul class="wg-agreed-open">' + a.open.map(function (o) {
      return '<li><span class="wg-agreed-q">' + esc(o.title) + '</span><span class="wg-fine">' + esc(o.why) + '</span></li>';
    }).join('') + '</ul>' : '';
    var facts = a.facts.length ? '<p class="wg-agreed-facts">' + S_.pmxGlyph('flask', 12) + '<span>Looked up, not asked: ' + esc(a.facts.map(function (f) { return f.title + ' (' + f.fact + ')'; }).join('; ')) + '</span></p>' : '';
    var foot = superseded ? '<p class="wg-agreed-note">' + S_.pmxStatus('skipped', 14) + '<span>You kept going after this; the newer What we agreed below replaces it.</span></p>'
      : confirmed ? '<p class="wg-agreed-note wg-agreed-done">' + S_.pmxStatus('done', 14) + '<span><b>Confirmed.</b> These are your decisions on this ' + (r ? 'run' : 'plan') + '. ' + (r ? 'The ' + lead + ' goes on with ' + esc(what) + ' now.' : 'The assistant writes the plan from them.') + '</span></p>'
        : '<div class="wg-agreed-acts"><button type="button" class="primary-button" data-action="wg-confirm" data-key="' + esc(m.key) + '">Confirm</button><button type="button" class="text-button" data-action="wg-keep-going" data-key="' + esc(m.key) + '"' + (s.asked >= s.cap ? ' disabled' : '') + '>Keep going</button>' +
          '<p class="wg-fine">Nothing acts on these until you confirm. ' + (r ? esc(cap(what)) + ' waits for it' + (s.later ? '; everything else keeps going.' : '.') : 'The plan is not written until then.') + '</p></div>';
    var ended = a.endedBy === 'wrap_up' ? 'you wrapped up' : a.endedBy === 'cap' ? 'the question limit was reached' : 'no decision was left to ask';
    return '<article class="wg-agreed" data-k="wg-agreed:' + esc(m.id) + '" data-state="' + (superseded ? 'superseded' : confirmed ? 'confirmed' : 'open') + '">' +
      '<header class="wg-agreed-head"><span class="wg-agreed-kettle">' + mark + '</span><div><p class="wg-agreed-title">What we agreed</p><p class="wg-fine">' + (s.later ? 'Before ' + esc(what) + ' · ' : '') + 'Grill Me with the ' + esc(lead) + ' · ' + plural(a.rounds, 'round') + ' · ' + plural(a.asked, 'question') + ' · ended because ' + ended + '</p></div></header>' +
      (rows ? '<ol class="wg-agreed-list">' + rows + '</ol>' : '<p class="wg-fine">No decision was settled.</p>') + open + facts + foot + '</article>';
  }
  function roundLine(m) {
    var s = sessionOf(m.key, m.sessionId), r = m.key.indexOf('run:') === 0 ? run(m.key.slice(4)) : null;
    var who = r ? 'the ' + leadName(r) : 'the assistant';
    var parts = [plural(m.decided, 'decision') + ' settled'];
    if (m.recommended) parts.push(m.recommended === m.decided ? (m.decided === 1 ? 'the recommended answer' : 'all recommended') : m.recommended + ' recommended');
    if (m.notSure) parts.push(m.notSure + ' left open');
    var mark = r ? leadMark(r, 16, 'idle', true) : S().pmxMark({ role: 'this-chat', size: 16, grill: true });
    return S().pmxLedgerLine({ key: 'wg-round:' + m.id, cls: 'wg-round', kind: 'grill', markHtml: mark, kindWord: 'Grill Me', title: 'Round ' + m.round,
      headline: 'Round ' + m.round + (m.wrapped ? ' · you wrapped up' : '') + ' · ' + esc(parts.join(' · ')), tip: 'Grill Me with ' + who + '. Your answers count once against the run’s one question limit' + (s ? ' (' + s.asked + ' of ' + s.cap + ')' : '') + '.', actions: [] });
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
    var V = window.PM56_COLLAB_VIEW;
    if (V && V.open) V.open(r.id, { tab: 'overview' });
    setTimeout(function () { var el = document.querySelector('[data-k^="wg-sec:' + r.id + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'auto' }); }, 60);
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
    if (wState(r) && wState(r).closedAt) { c.toast('Nothing changed', refusedText('team_writing_result')); return true; }
    if (!engine.passesLeft(r)) { c.toast('Nothing changed', refusedText('pass_limit')); return true; }
    /* the user's request is an addressed message (CWR-041): it goes in the run's transcript first */
    var m = C().appendMessage(r.id, { senderKind: 'user', senderName: 'You', messageType: 'request', recipientIds: [wondererP(r) && wondererP(r).id], body: 'Wonderer, take another pass around the ' + (r.kind === 'chat_room' ? 'topic' : 'job') + '.' });
    var res = startPass(r, { kind: 'user', name: 'you' }, '', m.id);
    if (!res.ok) { c.toast('Nothing changed', refusedText(res.error)); return true; }
    document.dispatchEvent(new CustomEvent('pm56:wg-pass-asked', { detail: { runId: r.id, passId: res.pass.id, by: 'user' } }));
    if (C().provenance && C().provenance(r.id) === 'recorded') { USER_PASSES[res.pass.id] = { runId: r.id, passId: res.pass.id, at: Date.now() }; if (!userTimer) userTimer = setInterval(userTick, 600); }
    render(); return true;
  });
  E.action('wg-open-round', function (c, b) {
    var key = b.dataset.key || ''; if (!sessionOf(key)) return true;
    var tid = ownerThread(key);
    if (c.state.selectedThread !== tid) c.switchThread(tid);
    if (!openRound(key)) postAgreed(key);
    return true;
  });
  E.action('wg-wrap-up', function (c, b) {
    var key = b.dataset.key || '', s = sessionOf(key); if (!s || s.status !== 'grilling') return true;
    var fid = c.state.wgGrill && c.state.wgGrill.flow, flow = fid && D().questionFlows.filter(function (f) { return f.id === fid; })[0];
    if (flow) { c.state.decision = null; grillAnswered(c, flow, c.state.questions, 'wrap'); render(); return true; }
    var res = GE.wrapUp(s); if (key.indexOf('run:') === 0) syncPending(run(key.slice(4))); if (res.ended) postAgreed(key);
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
  /* Grill Me turned on mid-run (steer 2026-10-20): the one who talks to you grills you at the next round or assignment
     boundary; work already running continues, and only the step that would use the answers waits for Confirm. The
     kind's driver starts the session at its boundary (takeMidRun). */
  function requestMidRunGrill(r) {
    if (!r || r.kind === 'review') return { ok: false, error: 'no_grill_here' };
    r.config = r.config || {};
    var was = grillOn(r); r.config.grill_me_enabled = true;
    if (!was && takesRequests(r) && !activeSession(r)) {
      r.grillPending = true;
      C().appendMessage(r.id, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Grill Me is on. The ' + leadName(r) + ' will question you at the next ' + (r.kind === 'chat_room' ? 'round' : r.kind === 'crew' ? 'assignment' : 'chapter') + ' boundary; what is running keeps going.' });
    }
    return { ok: true };
  }
  function takeMidRun(r) { if (!r || !r.grillPending) return false; r.grillPending = false; return true; }
  E.chainAction('reset-all', function () { THREAD_GRILL = {}; HOOKS = {}; USER_PASSES = {}; USER_CHECKS = {}; if (userTimer) clearInterval(userTimer); userTimer = 0; return false; });

  window.PM56_WG = {
    engine: engine, grill: GE, attach: attach, grillOn: grillOn, holds: holds, sessionOf: sessionOf, wondererP: wondererP, leadName: leadName, leadRole: leadRole,
    startPass: startPass, deliverPass: deliverPass, dispose: dispose, gate: gateWords, counts: function (r) { return engine.counts(r); }, countsText: countsText,
    lane: lane, leadLane: leadLane, decorateLanes: decorateLanes, attention: attention, sentence: sentence,
    section: section, passBlock: passBlock, leadRow: leadRow, entryHtml: entryHtml, leadLinks: leadLinks, listingHtml: listingHtml, listingText: listingText,
    begin: begin, openRound: openRound, grillAnswered: grillAnswered, factFound: factFound, postAgreed: postAgreed, refusedText: refusedText,
    stepHeld: stepHeld, activeSession: activeSession, sessionsOf: sessionsOf, face: face, pump: pump, slotFree: slotFree, requestMidRunGrill: requestMidRunGrill, takeMidRun: takeMidRun,
    close: function (r) { return engine.close(r); },
    threadSession: function (tid) { return THREAD_GRILL[tid] || null; }
  };
})();
