/* brainstorm-view.js — STORM-B: PM56_BRAINSTORM.viewParts + BrainStormDecisionVM renderer + the BrainStorm run view (spec 8.4). */
/* One view model and one renderer (IMPACT A1-50). decisionVM(run) builds the BrainStormDecisionVM for both
   populations: the protocol adapter reads run.brainstorm as brainstorm-protocol.js records it (recorded examples);
   the interim legacy adapter reads seed and wand-started runs from run.brainstorm's older shape (COLLAB may replace
   it with its own). renderDecision(vm) is the one renderer; viewParts(run, tab, ctx) (8.0 KIND INTERFACE) and the
   brainstorm: document both call it. Hook classes travel in the model (`cls`), so the legacy hooks
   (.collab-hardconflict, .collab-dissent, the exact .collab-qmax node, the Grill Me toggle) and the protocol hooks
   (.bs-document, .bs-option[data-proposal], details[data-bs-section]) both keep matching. Presentation only:
   nothing here writes a run, and planPayload is never read or touched. */
(function () {
  'use strict';
  var E = window.PM56_EXT, B = window.PM56_BRAINSTORM, S = window.PM56_SHELL;
  if (!E || !B || !S || !S.pmxView) return;
  var esc = S.esc;
  function C() { return window.PM56_COLLAB; }
  function g(name, size) { return S.pmxGlyph(name, size || 14); }
  var DOC = 'brainstorm:', EVI = 'brainstorm-evidence:';
  var UIV = {};      /* runId -> {tab, participantId}; COLLAB's viewState wins once it exists (G-14) */
  var MODE = {};     /* runId -> 'rich' | 'markdown' (the protocol's own `brainstorm-view` handler still runs) */
  var DISC = {};     /* disclosure key -> open, so a reader's toggle survives the demo's 450 ms re-renders */

  /* ---------------------------------------------------------------- vocabulary (8.4, 9) */
  var STOPS = [
    ['intake', 'Understand the ask', 'Intake and frontier', 'Understand'],
    ['blind_proposals', 'Draft ideas alone', 'Blind proposals', 'Draft alone'],
    ['normalize', 'Line up the options', 'Normalize', 'Line up'],
    ['debate', 'Debate', 'Debate', 'Debate'],
    ['evidence', 'Check the facts', 'Evidence round', 'Check facts'],
    ['vote', 'Vote', 'Vote', 'Vote'],
    ['synthesis', 'Write the plan', 'Synthesis', 'Write the plan']
  ];
  var PHASE_WORD = { intake: 'Understanding the ask', blind_proposals: 'Drafting alone', normalize: 'Lining up the options', debate: 'Debating', evidence: 'Checking the facts', vote: 'Voting', synthesis: 'Ready to write the plan', completed: 'Plan ready' };
  var PHASE_GERUND = { intake: 'understanding the ask', blind_proposals: 'drafting', normalize: 'lining up the options', debate: 'debating', evidence: 'checking the facts', vote: 'voting', synthesis: 'writing the plan' };
  var SURE = { high: 'very sure', medium: 'fairly sure', low: 'unsure' };
  var POS = { support: 'For', oppose: 'Against', abstain: 'Abstained' };
  function stopIndex(phase) { if (phase === 'completed') return STOPS.length; for (var i = 0; i < STOPS.length; i++) if (STOPS[i][0] === phase) return i; return 0; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function joinAnd(list) { list = list.filter(Boolean); return list.length < 2 ? (list[0] || '') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
  function arr(v) { return Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]); }
  function words(v) { return arr(v).join(' '); }
  /* a short title from a sentence: its first clause, at most 44 characters, cut at a word boundary */
  function shortTitle(s) {
    s = String(s || '').split(/[.;:]/)[0].trim();
    if (s.length <= 44) return s;
    var cut = s.slice(0, 44), sp = cut.lastIndexOf(' ');
    return (sp > 20 ? cut.slice(0, sp) : cut) + '…';
  }

  /* ---------------------------------------------------------------- people */
  function core(r) { return (r.participants || []).filter(function (p) { return !p.additiveRoleKind || p.additiveRoleKind === 'none'; }); }
  /* DL-218: the Wonderer is the one specialist participant; Grill Me is a switch, never a participant */
  function specialists(r) { return (r.participants || []).filter(function (p) { return p.additiveRoleKind === 'wonderer'; }); }
  function markRole(p) { return p.additiveRoleKind === 'wonderer' ? 'wonderer' : (p.effectivePersona || p.requestedPersona || p.role); }
  /* seat hues follow the row order, the Wonderer keeps COLLAB's seat 7 (3.3: one hue per helper everywhere) */
  function seatOf(r, p) { if (p.additiveRoleKind === 'wonderer') return 7; var i = core(r).indexOf(p); return i < 0 ? 1 : i + 1; }
  function WG() { return window.PM56_WG || null; }
  function byRole(r, role) { return (r.participants || []).filter(function (p) { return p.role === role; })[0] || null; }
  function byId(r, id) { return (r.participants || []).filter(function (p) { return p.id === id; })[0] || null; }
  function modelShort(p) { return String(p.effectiveModelName || p.requestedModelName || '').split(' · ')[0]; }
  function markOf(r, p, size, state) { return p ? S.pmxMark({ role: markRole(p), seat: seatOf(r, p), size: size || 18, state: state || 'idle' }) : ''; }
  function prov(r) { var c = C(); return c && c.provenance ? c.provenance(r.id) : (r.brainstorm && r.brainstorm.protocolVersion ? 'recorded' : 'wand'); }
  function standIn(p) {
    if (!p || !S.pmxStandIn || !p.requestedModelName || p.requestedModelName === p.effectiveModelName) return null;
    return S.pmxStandIn({ requested: p.requestedModelName, effective: p.effectiveModelName, reason: p.substitutionReason, noSubstitute: !p.effectiveModelId });
  }

  /* ---------------------------------------------------------------- the view model (A1-50) */
  function qmaxOf(b, r) {
    var qb = b.questionBank || {}, base = Number(qb.baselineLimit) || 20, ext = Number(qb.grillExtension) || 25, on = !!qb.grillMeEnabled;
    /* DL-218: the Coordinator's grilling questions are charged to this same bank (one counter, M6/R2) */
    var asked = (qb.askedIds || []).length;
    return { cls: 'collab-qmax', text: on ? 'Maximum questions: ' + (base + ext) + ' (' + base + ' + Grill Me ' + ext + ')' : 'Maximum questions: ' + base,
      asked: asked, limit: on ? base + ext : base, grill: on, extension: ext, canToggle: r.status === 'running' || r.status === 'paused' };
  }
  function protocolVM(r, vm) {
    var b = r.brainstorm, input = b.input || {}, props = b.proposals || [], votes = b.votes || [];
    var titleOf = function (id) { var q = props.filter(function (x) { return x.id === id; })[0]; return q ? q.title : ''; };
    var src = function (ids) { return arr(ids).map(function (id) { var e = (input.evidence || []).filter(function (x) { return x.id === id; })[0]; return e ? { id: id, label: e.label } : null; }).filter(Boolean); };
    vm.objective = input.objective || r.purpose || '';
    /* review fix (honesty): a recorded run decides by the recording's own rules, whatever the sheet's field says;
       a run of the user's own decides by the must-haves they typed (run.brainstorm.mustHaves) */
    vm.rules = vm.rulesBy === 'recording' ? (input.constraints || []).filter(function (c) { return c.hard; }).map(function (c) { return c.text; }) : arr(b.mustHaves);
    vm.sourceHash = input.sourceHash || '';
    vm.sources = (input.evidence || []).map(function (e) { return { id: e.id, label: e.label }; });
    vm.answers = (input.answers || []).map(function (a) { return { q: a.question, a: a.answer }; });
    vm.counts = { ideas: (b.attempts || []).length, drafted: (b.attempts || []).filter(function (a) { return a.status === 'completed'; }).length, options: props.length, voted: votes.length, voters: (b.attempts || []).length };
    vm.options = props.map(function (q) {
      var ruled = (b.hardConstraintViolations || []).some(function (h) { return h.proposalId === q.id; });
      return { id: q.id, key: 'bs-opt:' + q.id, cls: 'bs-option', title: q.title, ruled: ruled, chosen: !!(b.decision && b.decision.selectedProposalId === q.id),
        rows: [['How', q.approach], ['Good', words(q.benefits)], ['Cost', words(q.costs)], ['Risk', words(q.risks)]].filter(function (x) { return x[1]; }),
        from: (q.originatingParticipantIds || []).length,
        backers: votes.filter(function (v) { return v.proposalId === q.id && v.position === 'support'; }).map(function (v) { return { name: v.participantRole, pid: v.participantId, sure: SURE[v.confidence] || '' }; }),
        sources: src(q.evidenceRefs) };
    });
    var seen = {};
    vm.ruledOut = (b.hardConstraintViolations || []).filter(function (h) { if (seen[h.proposalId]) return false; seen[h.proposalId] = 1; return true; })
      .map(function (h) { return { id: h.proposalId, key: 'bs-ruled:' + h.proposalId, cls: 'collab-hardconflict', title: h.approach, rule: h.constraint }; });
    vm.votes = votes.map(function (v) { return { key: 'bs-vote:' + v.id, who: v.participantRole, pid: v.participantId, word: POS[v.position] || v.position, option: titleOf(v.proposalId), sure: SURE[v.confidence] || '', why: v.reason }; });
    vm.dissent = (b.dissent || []).map(function (v) { return { key: 'bs-dis:' + (v.id || v.participantId), cls: 'collab-dissent', who: v.participantRole, sure: SURE[v.confidence] || '', text: v.reason, option: titleOf(v.proposalId), sources: src(v.evidenceRefs) }; });
    vm.debate = (b.debates || []).map(function (d) {
      return { round: d.round, entries: (d.messages || []).map(function (m, i) { var p = byId(r, m.participantId); return { key: 'bs-deb:' + d.round + ':' + i, who: p ? p.role : '', pid: m.participantId, text: m.body }; }) };
    });
    if (b.phase === 'evidence' || b.phase === 'vote') vm.deciding = core(r).filter(function (p) { return !votes.some(function (v) { return v.participantId === p.id; }); }).map(function (p) { return p.role; });
    if (b.decision) vm.recommendation = { title: titleOf(b.decision.selectedProposalId), reason: b.decision.reason };
    /* G-30 BS-12: "Also considered" from the recorded coverage notes ("Security: no collection upload. …") */
    vm.alsoConsidered = String(input.scopeNotes || '').split(/\.\s+(?=[A-Z][A-Za-z -]{2,30}:)/).map(function (s) {
      var m = s.match(/^([A-Z][A-Za-z -]{2,30}):\s*(.+?)\.?$/); return m ? { what: m[1], why: m[2].charAt(0).toUpperCase() + m[2].slice(1) + '.' } : null;
    }).filter(Boolean);
    /* DL-218 (CWR-041): Write the plan waits while a Wonderer lead is undecided or in research; the one reason string
       (PM56_WG.gate), so the card, this view and the Wonderer workspace agree */
    var ws = WG() && r.wonderer ? WG().gate(r) : { ok: true };
    if (b.synthesis) vm.synthesize = { state: 'done', planId: b.synthesis.planId, title: titleOf(b.synthesis.selected), dissent: b.synthesis.dissentPreserved };
    else if (b.phase === 'synthesis' && r.status === 'running' && !ws.ok) vm.synthesize = { state: 'waiting', wonderer: true, code: ws.code, count: ws.count, reason: ws.reason };
    /* Grill Me turned on late gates Write the plan until you confirm that session (CWR-042) */
    else if (b.phase === 'synthesis' && r.status === 'running' && WG() && WG().stepHeld(r, 'synthesis')) vm.synthesize = { state: 'waiting', reason: 'it waits for your Confirm of what you agreed with the Coordinator.' };
    else if (b.phase === 'synthesis' && r.status === 'running') vm.synthesize = { state: 'ready' };
    else vm.synthesize = { state: 'waiting', reason: r.status === 'paused' ? 'Resume the run first.' : r.status !== 'running' ? 'This run has stopped.' : 'after the last vote' };
  }
  function legacyVM(r, vm) {
    var b = r.brainstorm || {}, props = b.proposals || [], votes = b.votes || [];
    var titleOf = function (id) { var q = props.filter(function (x) { return x.id === id; })[0]; return q ? (q.title || shortTitle(q.approach)) : ''; };
    vm.objective = r.purpose || '';
    vm.rules = arr(b.mustHaves);
    vm.counts = { ideas: props.length, drafted: props.length, options: props.length, voted: votes.length, voters: core(r).length };
    vm.options = props.map(function (q) {
      return { id: q.id, key: 'bs-opt:' + q.id, cls: 'bs-option', title: q.title || shortTitle(q.approach), ruled: false, chosen: !!(b.synthesis && b.synthesis.selected === q.id),
        rows: [['How', q.approach], ['Good', words(q.benefits)], ['Cost', words(q.costs)], ['Risk', words(q.risks)]].filter(function (x) { return x[1]; }),
        from: 1, by: q.participantRole,
        backers: votes.filter(function (v) { return v.proposalId === q.id && v.position === 'support'; }).map(function (v) { var p = byRole(r, v.participantRole); return { name: v.participantRole, pid: p && p.id, sure: SURE[v.confidence] || '' }; }),
        sources: [] };
    });
    vm.ruledOut = (b.hardConstraintViolations || []).map(function (h, i) { return { id: 'hc' + i, key: 'collab-hc' + (i ? '-' + i : ''), cls: 'collab-hardconflict', title: h.approach, rule: h.constraint }; });
    vm.votes = votes.map(function (v) { var p = byRole(r, v.participantRole); return { key: 'collab-vote-' + v.id, who: v.participantRole, pid: p && p.id, word: POS[v.position] || v.position, option: titleOf(v.proposalId), sure: SURE[v.confidence] || '', why: v.reason }; });
    vm.dissent = (b.dissent || []).map(function (v, i) { return { key: 'collab-dissent' + (i ? '-' + i : ''), cls: 'collab-dissent', who: v.participantRole, sure: SURE[v.confidence] || '', text: v.reason, option: '', sources: [] }; });
    if (b.synthesis) vm.synthesize = { state: 'done', legacy: true, summary: b.synthesis.summary, title: titleOf(b.synthesis.selected) };
    else if ((b.phase === 'vote' || b.phase === 'synthesis') && r.status === 'running') vm.synthesize = { state: 'ready' };
    else vm.synthesize = { state: 'waiting', reason: r.status === 'running' ? 'after the last vote' : 'This run is not running.' };
  }
  /* BrainStormDecisionVM {options[], ruledOut[], dissent[], wonderer, qmax, synthesize} (8.0 A1-50), plus the facts
     both faces read: phase, stop, counts, votes, deciding, debate, recommendation, rules, sources, answers. */
  function decisionVM(r) {
    if (!r) return null;
    var b = r.brainstorm || {};
    var pv = prov(r);
    var vm = { runId: r.id, protocol: !!b.protocolVersion, provenance: pv, rulesBy: b.protocolVersion && pv === 'recorded' ? 'recording' : 'you', title: r.title, status: r.status, phase: b.phase || 'intake',
      options: [], ruledOut: [], votes: [], dissent: [], deciding: [], debate: [], sources: [], answers: [], rules: [], alsoConsidered: [], wonderer: null, recommendation: null, qmax: qmaxOf(b, r), synthesize: null, counts: {} };
    if (vm.protocol) protocolVM(r, vm); else legacyVM(r, vm);
    vm.stop = stopIndex(vm.phase);
    /* how every surface names the rules: "The recording’s rules: …" / "Your rules: …"; "breaks {ruleOwner} rule" */
    var one = vm.rules.length === 1;
    vm.rulesLabel = vm.rulesBy === 'recording' ? (one ? 'The recording’s rule' : 'The recording’s rules') : (one ? 'Your rule' : 'Your rules');
    vm.ruleOwner = vm.rulesBy === 'recording' ? 'the recording’s' : 'your';
    if (r.wonderer && r.wonderer.version === 2) vm.wonderer = { runId: r.id };
    return vm;
  }

  /* ---------------------------------------------------------------- disclosures */
  function disc(key, def) { return Object.prototype.hasOwnProperty.call(DISC, key) ? DISC[key] : def; }
  function details(o) {
    return '<details class="bs-sec" data-bs-section="' + o.section + '" data-bs-disc="' + esc(o.key) + '" data-k="' + esc(o.key) + '"' + (disc(o.key, !!o.open) ? ' open' : '') + '>' +
      '<summary><span class="bs-sec-head"><span class="bs-sec-title">' + o.title + '</span>' + (o.meta ? '<span class="bs-sec-meta">' + o.meta + '</span>' : '') + '</span>' + g('chevron-right', 14) + '</summary>' +
      '<div class="bs-sec-body">' + o.body + '</div></details>';
  }
  document.addEventListener('toggle', function (e) { var k = e.target && e.target.dataset && e.target.dataset.bsDisc; if (k) DISC[k] = !!e.target.open; }, true);

  /* ---------------------------------------------------------------- the one renderer (A1-50) */
  function srcButtons(vm, list) {
    if (!vm.protocol || !list.length) return '';
    return '<p class="bs-src"><span>Sources</span>' + list.map(function (s) { return '<button type="button" class="text-button" data-action="brainstorm-open-evidence" data-run="' + esc(vm.runId) + '" data-evidence="' + esc(s.id) + '">' + esc(s.label) + '</button>'; }).join('') + '</p>';
  }
  function backedLine(o) {
    if (!o.backers.length) return o.ruled ? 'Nobody can pick it: it breaks a rule.' : 'Nobody has backed it yet.';
    return 'Backed by ' + joinAnd(o.backers.map(function (b) { return esc(b.name) + (b.sure ? ' (' + b.sure + ')' : ''); }));
  }
  function nw(html) { return '<span class="bs-nw">' + html + '</span>'; }
  function nextRow(vm) {
    var s = vm.synthesize || {}, run = ' data-run="' + esc(vm.runId) + '"';
    if (s.state === 'done' && s.legacy) {
      return '<div class="bs-next" data-k="bs-next" data-state="done"><p class="bs-next-say">' + g('check', 15) + '<span><b>The plan summary is ready</b>, but this example can’t create the plan document yet.</span></p>' +
        (s.summary ? '<p class="bs-next-sum">' + esc(s.summary) + '</p>' : '') + '</div>';
    }
    if (s.state === 'done') {
      return '<div class="bs-next" data-k="bs-next" data-state="done"><p class="bs-next-say">' + g('check', 15) + '<span><b>Plan ready: ' + esc(s.title || '') + '.</b> ' + plural(s.dissent || 0, 'disagreement') + ' kept. Nothing has been built yet.</span></p>' +
        '<div class="bs-next-acts"><button type="button" class="primary-button" data-action="brainstorm-open-plan"' + run + '>Open Plan</button></div></div>';
    }
    if (s.state === 'ready') {
      return '<div class="bs-next" data-k="bs-next" data-state="ready"><p class="bs-next-say">' + g('ring-dot', 15) + '<span><b>Ready to write the plan.</b> One Deep Plan, with the disagreement kept in it. Nothing gets built yet.</span></p>' +
        '<div class="bs-next-acts"><button type="button" class="primary-button" data-action="collab-brainstorm-synthesize"' + run + '>Write the plan</button></div></div>';
    }
    if (s.wonderer) {
      /* review fix: never the "Ready…" sentence over a dead primary; the sentence says why Write the plan waits (the team's
         decisions or research, never yours: DL-218) and opens the leads */
      return '<div class="bs-next" data-k="bs-next" data-state="waiting"><p class="bs-next-say">' + g('ring-dashed', 15) + '<span><b>Write the plan waits.</b> ' + esc(s.reason) + '</span></p>' +
        '<div class="bs-next-acts"><button type="button" class="primary-button" data-action="collab-brainstorm-synthesize"' + run + ' disabled>Write the plan</button><button type="button" class="text-button" data-action="b13-open"' + run + '>Open the Wonderer’s leads</button></div></div>';
    }
    return '<div class="bs-next" data-k="bs-next" data-state="waiting"><p class="bs-next-say">' + g('ring-dashed', 15) + '<span><b>Write the plan</b> · ' + esc(s.reason || 'after the last vote') + '</span></p>' +
      '<div class="bs-next-acts"><button type="button" class="primary-button" data-action="collab-brainstorm-synthesize"' + run + ' disabled>Write the plan</button></div></div>';
  }
  function lede(vm) {
    var parts = [];
    if (vm.counts.options) parts.push(plural(vm.counts.ideas, 'idea') + ', drafted without seeing each other, boiled down to ' + plural(vm.counts.options, 'option') + '.');
    else if (vm.counts.ideas) parts.push(vm.counts.drafted + ' of ' + vm.counts.ideas + ' ideas are in. Nobody sees the others’ ideas until everyone is done.');
    else parts.push('Nothing has been drafted yet.');
    if (vm.rules.length) parts.push(vm.rulesLabel + ': ' + vm.rules.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join(' '));
    return '<p class="bs-lede">' + parts.join(' ') + '</p>';
  }
  function optionsHtml(vm) {
    if (!vm.options.length) return '';
    var cols = '<div class="bs-options" data-n="' + Math.min(3, vm.options.length) + '">' + vm.options.map(function (o) {
      return '<div class="' + o.cls + '" data-proposal="' + esc(o.id) + '" data-k="' + esc(o.key) + '"' + (o.ruled ? ' data-state="ruled"' : o.chosen ? ' data-state="chosen"' : '') + '>' +
        '<h3 class="bs-opt-title">' + (o.ruled ? '<s>' + esc(o.title) + '</s>' : esc(o.title)) + '</h3>' +
        (o.ruled ? '<p class="bs-opt-word">' + g('not', 13) + '<span>Ruled out</span></p>' : o.chosen ? '<p class="bs-opt-word">' + g('check', 13) + '<span>Picked</span></p>' : '') +
        '<dl class="bs-opt-rows">' + o.rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
        '<p class="bs-opt-backed">' + backedLine(o) + (o.by ? '. First drafted by ' + esc(o.by) + '.' : o.from > 1 ? '. ' + o.from + ' helpers drafted it on their own.' : '.') + '</p>' + (o.sources.length && o.sources.length < vm.sources.length ? srcButtons(vm, o.sources) : '') + '</div>';
    }).join('') + '</div>';
    var ruled = vm.ruledOut.map(function (h) {
      return '<p class="bs-ruled ' + h.cls + '" data-k="' + esc(h.key) + '">' + g('not', 14) + '<span><s>' + esc(h.title) + '</s> is ruled out: it breaks ' + vm.ruleOwner + ' rule “' + esc(String(h.rule || '').replace(/[.\s]+$/, '')) + '”. Votes can’t override a rule.</span></p>';
    }).join('');
    var meta = vm.phase === 'vote' || vm.phase === 'evidence' ? 'voting now · ' + vm.counts.voted + ' of ' + vm.counts.voters + ' in' : plural(vm.options.length, 'option');
    return S.pmxViewSection({ key: 'bs-v-opts', cls: 'bs-v-opts', title: 'The options', meta: meta, body: cols + ruled });
  }
  function votesTable(vm, r) {
    return '<div class="bs-vtable" role="table" aria-label="How each helper voted"><div class="bs-vrow bs-vhead" role="row"><span role="columnheader">Helper</span><span role="columnheader">Vote</span><span role="columnheader">How sure</span><span role="columnheader">Why</span></div>' +
      vm.votes.map(function (v) {
        var p = v.pid ? byId(r, v.pid) : byRole(r, v.who);
        return '<div class="bs-vrow" role="row" data-k="' + esc(v.key) + '"><span role="cell" class="bs-vwho">' + markOf(r, p, 18) + '<b>' + esc(v.who) + '</b></span><span role="cell">' + esc(v.word) + (v.option ? ' · ' + esc(v.option) : '') + '</span><span role="cell">' + esc(v.sure) + '</span><span role="cell" class="bs-vwhy">' + esc(v.why) + '</span></div>';
      }).join('') + '</div>';
  }
  function debateHtml(vm, r) {
    var entries = [];
    vm.debate.forEach(function (d) { d.entries.forEach(function (e) { var p = byId(r, e.pid); entries.push({ key: e.key, mid: e.key, markHtml: markOf(r, p, 22), who: esc(e.who), when: 'round ' + d.round, bodyHtml: S.pmxMd(e.text, { mode: 'full' }) }); }); });
    return S.pmxTimeline({ key: 'bs-debate', cls: 'bs-debate', entries: entries });
  }
  function evidenceHtml(vm) {
    return '<div class="bs-srcs">' + vm.sources.map(function (s) { return '<button type="button" class="text-button bs-srcrow" data-action="brainstorm-open-evidence" data-run="' + esc(vm.runId) + '" data-evidence="' + esc(s.id) + '">' + g('file', 14) + '<span>' + esc(s.label) + '</span></button>'; }).join('') + '</div>' +
      (vm.answers.length ? '<p class="bs-sub">Your earlier answers, so nobody asks them again</p><ul class="bs-answers">' + vm.answers.map(function (a) { return '<li><span>' + esc(a.q) + '</span> <b>' + esc(a.a) + '</b></li>'; }).join('') + '</ul>' : '');
  }
  /* DL-218: the Wonderer section is the shared one (wonderer-grill.js): every pass and lead with its status in place */
  function wondererHtml(vm) {
    var w = vm.wonderer, r = w && C() && C().run(w.runId); if (!r || !WG()) return '';
    return WG().section(r, { key: 'bs' });
  }
  /* renderDecision(vm, ctx, {guide}) -> the "How they decided" body, for both populations */
  function renderDecision(vm, ctx, o) {
    o = o || {};
    if (!vm) return '';
    var r = (C() && C().run && C().run(vm.runId)) || { participants: [] };
    var rec = vm.recommendation ? S.pmxViewSection({ key: 'bs-v-rec', cls: 'bs-rec', title: 'The recommendation', body: '<p class="bs-rec-pick">' + esc(vm.recommendation.title) + '</p><p class="bs-rec-why">' + esc(vm.recommendation.reason) + '</p>' }) : '';
    var dis = vm.dissent.length ? details({ key: 'bs-d-dissent:' + vm.runId, section: 'dissent', open: true, title: 'Still disagrees', meta: 'Kept in the plan so you can weigh it.',
      body: vm.dissent.map(function (d) { return S.pmxQuote({ key: d.key, cls: d.cls, text: esc(d.text), who: esc(d.who), note: (d.sure ? esc(d.sure) + ' · ' : '') + 'kept word for word' }) + srcButtons(vm, d.sources); }).join('') }) : '';
    var votes = vm.votes.length ? details({ key: 'bs-d-votes:' + vm.runId, section: 'votes', title: 'How they voted', meta: vm.counts.voted + ' of ' + vm.counts.voters + ' voted · the Wonderer never votes', body: votesTable(vm, r) }) : '';
    var debate = vm.debate.length ? details({ key: 'bs-d-debate:' + vm.runId, section: 'debate', title: 'The debate', meta: plural(vm.debate.length, 'round'), body: debateHtml(vm, r) }) : '';
    var evidence = vm.protocol ? details({ key: 'bs-d-evidence:' + vm.runId, section: 'evidence', title: 'Sources and earlier answers', meta: plural(vm.sources.length, 'source'), body: evidenceHtml(vm) }) : '';
    var also = vm.alsoConsidered.length ? S.pmxViewSection({ key: 'bs-v-also', cls: 'bs-also', title: 'Also considered', body: '<ul class="bs-alsolist">' + vm.alsoConsidered.map(function (a) { return '<li><b>' + esc(a.what) + '</b> · considered, not material: ' + esc(a.why) + '</li>'; }).join('') + '</ul>' }) : '';
    return (o.guide || '') + lede(vm) + nextRow(vm) + rec + optionsHtml(vm) + '<div class="bs-secs">' + dis + votes + debate + evidence + '</div>' + wondererHtml(vm) + also;
  }

  /* ---------------------------------------------------------------- plate: the run view's stage (8.4 plate, run states)
     2026-10-07: the same cast plate the BrainStorm sheet draws (PM56_COLLAB.sheet.castRun, one grammar): the seven
     chapters as the bar, lit up to the one the run is on and ending in the edge to You; the helpers behind their
     screens in their run state; the specialists in their own wing beside the helpers (never under the chapter names);
     the screens' meaning said once on the note line. */
  function plate(r, vm) {
    var c = C(), fn = c && c.sheet && c.sheet.castRun;
    if (typeof fn !== 'function') return '';
    var done = r.status === 'completed', states = {};
    core(r).forEach(function (p) { states[p.id] = done ? 'done' : p.status === 'working' && r.status === 'running' ? 'working' : 'idle'; });
    return fn(r, { key: 'bs-plate:' + r.id, live: { states: states, stop: vm.stop, done: done } });
  }

  /* ---------------------------------------------------------------- Conversation (always BrainStorm's: G-33), Team and Cost (this file's own frame) */
  var SENDER = { 'BrainStorm coordinator': 'Coordinator' };
  /* G-33: the recorded protocol messages as people say them (the run's data is untouched) */
  function sayAs(r, m, vm) {
    var t = String(m.body || ''), x;
    if (t === 'Independent proposal submitted.') return 'Drafted its idea without seeing the others’.';
    if ((x = t.match(/^(\d+) independent proposals consolidated into (\d+) alternatives\. All origins retained\.$/))) return x[1] + ' ideas boiled down to ' + x[2] + ' options. Every original idea is kept.';
    if ((x = t.match(/^(support|oppose|abstain) · (.+?) — ([\s\S]+)$/))) return (x[1] === 'support' ? 'Voted for ' : x[1] === 'oppose' ? 'Voted against ' : 'Abstained on ') + x[2] + ': ' + x[3];
    if ((x = t.match(/^Deep Plan ready\. (\d+) dissenting position/))) return 'Plan ready: ' + ((vm.synthesize && vm.synthesize.title) || r.title) + '. ' + plural(+x[1], 'disagreement') + ' kept. Nothing has been built yet.';
    if ((x = t.match(/^Evidence checked for every option\. (\d+) hard-constraint conflicts? retained\.$/))) return 'Checked the facts for every option. ' + (+x[1] ? plural(+x[1], 'option') + (+x[1] === 1 ? ' breaks a rule and is ruled out.' : ' break a rule and are ruled out.') : 'No option breaks a rule.');
    /* IMPACT A3-03: the recorded stamp reads provenance, never the message alone */
    if ((x = t.match(/^Recorded example: (.+?)\. (\d+) prior answers retained; no repeat questions\.$/))) return (vm.provenance === 'recorded' ? 'Recorded example: ' + x[1] + '. ' : '') + plural(+x[2], 'earlier answer') + ' kept, so nobody asks again.';
    return t;
  }
  function conversation(r, vm, pid) {
    return (r.messages || []).filter(function (m) { return !pid || m.senderId === pid; }).map(function (m) {
      var p = m.senderId ? byId(r, m.senderId) : null, sys = m.senderKind === 'system';
      var who = p ? p.role : (SENDER[m.senderName] || m.senderName || 'Coordinator');
      /* DL-218: the Wonderer's pass lists its leads; a helper's message that takes up a lead links to it */
      var pass = WG() ? WG().entryHtml(r, m) : '';
      return { key: 'collab-msg-' + m.id, mid: m.id, cls: 'collab-msg', kind: sys ? 'system' : 'message', markHtml: p ? markOf(r, p, 22) : S.pmxMark({ role: m.senderKind === 'user' ? 'you' : 'coordinator', size: 22 }), who: esc(m.senderKind === 'user' ? 'You' : who),
        bodyHtml: pass || (S.pmxMd(sayAs(r, m, vm), { mode: 'full' }) + (WG() ? WG().leadLinks(r, m) : '')) };
    });
  }
  function outcomeWord(p) {
    if (p.status === 'working') return 'Working';
    if (p.outcome === 'completed' || p.status === 'done') return 'Done';
    if (p.status === 'disabled') return 'Not available';
    if (p.outcome === 'failed') return 'Failed';
    return p.additiveRoleKind === 'wonderer' ? 'Never votes' : 'Waiting';
  }
  function teamRows(r, list) {
    return list.map(function (p) {
      return S.pmxTeamRow({ key: 'bs-team:' + p.id, cls: 'collab-participant', kind: 'brainstorm', attrs: 'data-run="' + esc(r.id) + '" data-participant="' + esc(p.id) + '"',
        markHtml: markOf(r, p, 22), name: esc(p.role), route: esc(modelShort(p)) + (p.effectivePersona && p.effectivePersona !== p.role ? ' · ' + esc(p.effectivePersona) : ''), standIn: standIn(p), outcome: outcomeWord(p), cost: '' });
    }).join('');
  }
  function teamHtml(r) {
    var spec = (r.participants || []).filter(function (p) { return p.additiveRoleKind && p.additiveRoleKind !== 'none'; });
    return S.pmxViewSection({ key: 'bs-v-team', title: 'Core team', meta: 'each drafts alone, debates and votes', body: '<div class="bs-team">' + teamRows(r, core(r)) + '</div>' }) +
      (spec.length ? S.pmxViewSection({ key: 'bs-v-spec', title: 'Specialists', meta: 'never counted as core votes', body: '<div class="bs-team">' + teamRows(r, spec) + '</div>' }) : '');
  }
  function costWords(r, vm) {
    var u = r.usage || {};
    if (vm.provenance === 'recorded') return S.pmxCost({ recorded: true });
    if (u.not_measured) return 'Cost not reported';
    return S.pmxCost({ spent: u.costUsd, limit: r.config && r.config.limitUsd, state: r.status === 'running' ? 'running' : 'done' });
  }
  function costHtml(r, vm) {
    var u = r.usage || {}, rec = vm.provenance === 'recorded';
    var toks = !rec && (u.inputTokens || u.outputTokens) ? S.pmxTokens((u.inputTokens || 0) + (u.outputTokens || 0), { plain: true }) : '';
    return S.pmxViewSection({ key: 'bs-v-cost', title: 'What it cost', body: '<ul class="bs-list"><li><b>' + costWords(r, vm) + '</b></li>' +
      (toks ? '<li>' + toks + ' in total. Tokens measure AI use, roughly ¾ of a word each.</li>' : '') +
      (rec ? '<li>Nothing was sent to an AI provider: the helpers’ words are a recording.</li>' : '') + '</ul>' });
  }
  /* ---------------------------------------------------------------- view state */
  function viewState(id) {
    var c = C(), v = c && typeof c.viewState === 'function' ? c.viewState(id) : null;
    return v || UIV[id] || (UIV[id] = { tab: 'overview', participantId: null });
  }

  /* ---------------------------------------------------------------- viewParts (8.0 KIND INTERFACE) */
  function statusHtml(r, vm) {
    var n = core(r).length, w = specialists(r).some(function (p) { return p.additiveRoleKind === 'wonderer'; });
    var who = plural(n, 'helper') + (w ? ' and a Wonderer' : '');
    if (r.status === 'completed' || (vm.synthesize && vm.synthesize.state === 'done' && !vm.synthesize.legacy)) return '<b>Done</b> · ' + who + ' · one plan, nothing built';
    if (r.status === 'paused') return '<b>Paused</b> · at ' + esc((STOPS[vm.stop] || STOPS[6])[1]) + ' · ' + who;
    if (r.status === 'canceled' || r.status === 'cancelled') return '<b>Cancelled</b> while ' + esc(PHASE_GERUND[vm.phase] || 'working') + ' · everything so far is kept';
    if (r.status === 'failed') return '<b>Failed</b> · ' + esc(r.blockedReason || 'it stopped before a result.');
    if (vm.provenance === 'wand' && !vm.protocol && C() && C().waitingReason) return '<b>Waiting</b> · ' + esc(C().waitingReason(r));
    var word = vm.synthesize && vm.synthesize.wonderer ? 'Deciding on the Wonderer’s leads' : PHASE_WORD[vm.phase] || 'Running';
    return '<b>' + esc(word) + '</b> · ' + who + ' · nothing gets built yet';
  }
  function asideHtml(r, vm) {
    var rows = [], q = vm.qmax, step = Math.min(vm.stop, 6);
    if (vm.phase === 'evidence' || vm.phase === 'vote') rows.push('<li><b>Voting</b> · ' + vm.counts.voted + ' of ' + vm.counts.voters + ' in.' + (vm.deciding.length ? ' ' + esc(joinAnd(vm.deciding)) + (vm.deciding.length === 1 ? ' is' : ' are') + ' still deciding.' : '') + '</li>');
    else rows.push('<li><b>' + esc(STOPS[step][1]) + '</b> · ' + nw('step ' + (step + 1) + ' of 7') + '</li>');
    if (specialists(r).some(function (p) { return p.additiveRoleKind === 'wonderer'; })) rows.push('<li><b>Wonderer</b> runs alongside and never votes: ' + esc(WG() ? (WG().countsText(r) || 'its leads go to the team at Line up') : 'its leads stay hypotheses until explored') + '.</li>');
    if (WG() && WG().grillOn(r)) {
      var ss = WG().sessionsOf(r), atStart = ss.some(function (s) { return !s.later; });
      rows.push('<li><b>Grill Me</b> is on: ' + (atStart ? 'the Coordinator grilled you at intake' : ss.length ? 'the Coordinator grilled you mid-run, and only the step that needed your answers waited' : 'the Coordinator questions you at the next chapter') + '. It adds nobody to the team.</li>');
    }
    /* the exact legacy .collab-qmax text is a hidden harness node (IMPACT A2-19); the reader sees the plain line */
    rows.push('<li class="bs-q"><p class="' + q.cls + '" data-k="collab-qmax" data-pmx-harness>' + esc(q.text) + '</p><p class="bs-q-line"><b>Questions for you</b> · ' + nw('up to ' + q.limit) + (q.grill ? ' ' + nw('(' + (q.limit - q.extension) + ' + Grill Me ' + q.extension + ')') : '') + '</p><p class="bs-q-help">' + (q.asked ? plural(q.asked, 'question') + ' asked so far' : 'No questions asked yet') + ', shared by everyone. It’s a limit, not a target.</p>' +
      (q.canToggle ? S.pmxCheck({ key: 'bs-grill:' + r.id, cls: 'bs-grill', attrs: 'data-action="collab-brainstorm-toggle-grill" data-run="' + esc(r.id) + '"', checked: q.grill, label: 'Grill Me', glyph: 'grill', helper: 'The Coordinator asks any later decision as a grilling round. Allows up to ' + q.extension + ' more questions.' + (q.asked ? ' The ' + q.asked + ' already asked still count.' : '') }) : '') + '</li>');
    rows.push('<li><b>' + costWords(r, vm).split(' · ').map(nw).join(' · ') + '</b></li>');
    var mode = MODE[r.id] || 'rich';
    var modes = vm.protocol ? '<p class="bs-modes"><span>Show as</span>' + [['rich', 'Formatted'], ['markdown', 'Plain text']].map(function (m) { return '<button type="button" class="text-button" data-action="brainstorm-view" data-run="' + esc(r.id) + '" data-mode="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '">' + m[1] + '</button>'; }).join('') + '</p>' : '';
    /* no Technical details (2026-10-07, Jared): the commands stay on the sheet's Advanced page only */
    return '<ul class="bs-aside">' + rows.join('') + '</ul>' + modes;
  }
  function actionsHtml(r) {
    var run = ' data-run="' + esc(r.id) + '"', out = '';
    if (r.wonderer) out += '<button type="button" class="text-button" data-action="b13-open"' + run + '>Wonderer’s leads</button>';
    if (r.status === 'running') out += '<button type="button" class="text-button" data-action="collab-pause"' + run + '>' + g('pause', 13) + 'Pause</button>';
    if (r.status === 'paused') out += '<button type="button" class="text-button" data-action="collab-resume"' + run + '>' + g('play', 13) + 'Resume</button>';
    return out;
  }
  function tabsHtml(r, tab) {
    var run = 'data-run="' + esc(r.id) + '"', msgs = (r.messages || []).length, team = (r.participants || []).length;
    return S.pmxTabs({ key: 'bs-tabs:' + r.id, cls: 'bs-tabs', current: tab, action: 'collab-panel-tab', attr: 'data-tab', items: [
      { value: 'overview', label: 'How they decided', attrs: run }, { value: 'transcript', label: 'Conversation', count: msgs || '', attrs: run },
      { value: 'participants', label: 'Team', count: team || '', attrs: run }, { value: 'usage', label: 'Cost', attrs: run }] });
  }
  function participantView(r, vm, p) {
    var own = (r.messages || []).some(function (m) { return m.senderId === p.id; });
    return S.pmxParticipant({ key: 'bs-part:' + p.id, kind: 'brainstorm', role: esc(p.role), standIn: standIn(p),
      messagesHtml: own ? S.pmxTimeline({ key: 'bs-pconv:' + p.id, entries: conversation(r, vm, p.id) }) : '', emptyText: 'Nothing from ' + esc(p.role) + ' yet.' });
  }
  /* viewParts(run, tab, ctx, generic): with `generic` (COLLAB-VIEW's frame, collab-view.js) only the parts BrainStorm
     owns are returned and every other field stays the frame's (undefined keeps it); without it (this file's own
     frame, used until collab-view.js lands) every part is returned. */
  function viewParts(run, tab, ctx, generic) {
    var r = run, vm = decisionVM(r); if (!vm) return null;
    ctx = ctx || E.ctx();
    var framed = !!generic, st = framed ? { tab: tab, participantId: null } : viewState(r.id);
    tab = tab || st.tab || 'overview';
    var D = window.PM56_BRAINSTORM_DEMOS, guide = D && D.editorGuide ? D.editorGuide(r.id) || '' : '';
    var main, p;
    if (tab === 'transcript') main = S.pmxTimeline({ key: 'bs-conv:' + r.id, entries: conversation(r, vm) });
    else if (tab === 'participants') main = framed ? undefined : (p = st.participantId ? byId(r, st.participantId) : null) ? participantView(r, vm, p) : teamHtml(r);
    else if (tab === 'usage') main = framed ? undefined : costHtml(r, vm);
    else if (vm.protocol && (MODE[r.id] || 'rich') === 'markdown') main = guide + '<pre class="bs-pre bs-plain">' + esc(B.markdown(r)) + '</pre>';
    else main = renderDecision(vm, ctx, { guide: guide });
    var wlink = r.wonderer ? '<button type="button" class="text-button" data-action="b13-open" data-run="' + esc(r.id) + '">Wonderer’s leads</button>' : '';
    return { status: statusHtml(r, vm), actions: framed ? (wlink ? wlink + (generic.actions || '') : undefined) : actionsHtml(r),
      plate: plate(r, vm), tabs: framed ? undefined : tabsHtml(r, tab), main: main, aside: asideHtml(r, vm), vm: vm };
  }

  /* ---------------------------------------------------------------- the documents */
  function viewDocument(ctx, id) {
    var r = C() && C().run(id);
    if (!r || !B.owns(id)) return '';
    var V = window.PM56_COLLAB_VIEW, attrs = 'data-brainstorm-run="' + esc(id) + '"';
    /* COLLAB-VIEW's shared frame (More row, Message, cancel confirm, common tabs) when it is there */
    if (V && typeof V.render === 'function') return V.render(ctx, id, { cls: 'bs-document', attrs: attrs });
    var parts = viewParts(r, null, ctx);
    return S.pmxView({ key: 'bs-view:' + id, cls: 'bs-document collab-panel', attrs: attrs, kind: 'brainstorm', kindWord: 'BrainStorm', title: esc(r.title),
      statusHtml: parts.status, actionsHtml: parts.actions, plateHtml: parts.plate, tabsHtml: parts.tabs, mainHtml: parts.main, asideHtml: parts.aside });
  }
  /* G-26: the evidence document, a pmxView without tabs */
  function evidenceDocument(ctx, id, eid) {
    var r = C() && C().run(id), input = r && r.brainstorm && r.brainstorm.input;
    var e = input && (input.evidence || []).filter(function (x) { return x.id === eid; })[0];
    if (!e) return '';
    return S.pmxView({ key: 'bs-evi:' + id + ':' + eid, cls: 'bs-document bs-evidence', attrs: 'data-brainstorm-evidence="' + esc(eid) + '"', kind: 'brainstorm', kindWord: 'BrainStorm evidence', title: esc(e.label),
      statusHtml: 'Source used in this BrainStorm' + (prov(r) === 'recorded' ? ' · recorded example' : ''),
      actionsHtml: '<button type="button" class="text-button" data-action="brainstorm-open-results" data-run="' + esc(id) + '">Back to how they decided</button>',
      mainHtml: '<pre class="bs-pre bs-source-text">' + esc(e.content) + '</pre>' + (e.provenance ? '<p class="bs-prov">' + esc(e.provenance) + '</p>' : '') });
  }
  E.slot('editorTabLabel', function (c) { var id = String(c.editorId || ''); return id.indexOf(EVI) === 0 ? 'BrainStorm evidence' : id.indexOf(DOC) === 0 ? 'BrainStorm' : ''; });
  E.slot('editorDocument', function (c) {
    var id = String(c.editorId || '');
    if (id.indexOf(EVI) === 0) { var rest = id.slice(EVI.length).split(':'); return evidenceDocument(c, rest[0], rest.slice(1).join(':')); }
    if (id.indexOf(DOC) === 0) return viewDocument(c, id.slice(DOC.length));
    return '';
  });

  /* ---------------------------------------------------------------- actions (chained; everything else falls through) */
  /* only this file's own frame; inside COLLAB-VIEW's frame ([data-collab-view]) its own chains keep the view state */
  function inDoc(btn) { return !!(btn && btn.closest && btn.closest('.bs-document:not([data-collab-view])')); }
  /* G-14: Open Panel on an owned run opens its document (Activity rows, schedule-completion and b13 dispatch it) */
  E.chainAction('collab-open-panel', function (c, btn) {
    var id = btn && btn.dataset.run; if (!id || !B.owns(id)) return false;
    var st = viewState(id); st.tab = 'overview'; st.participantId = null;
    if (c.closeDialog) c.closeDialog();
    if (typeof B.openResults === 'function') B.openResults(c, id); else { c.state.editorRevealed = true; c.openEditor(DOC + id); }
    return true;
  });
  E.chainAction('collab-panel-tab', function (c, btn) { if (!inDoc(btn)) return false; var st = viewState(btn.dataset.run); st.tab = btn.dataset.tab || 'overview'; st.participantId = null; c.renderApp(); return true; });
  E.chainAction('collab-open-participant', function (c, btn) { if (!inDoc(btn)) return false; var st = viewState(btn.dataset.run); st.tab = 'participants'; st.participantId = btn.dataset.participant || null; c.renderApp(); return true; });
  E.chainAction('collab-close-participant', function (c, btn) {
    if (!inDoc(btn)) return false;
    var root = btn.closest('[data-brainstorm-run]'), id = root && root.getAttribute('data-brainstorm-run');
    if (id) viewState(id).participantId = null;
    c.renderApp(); return true;
  });
  E.chainAction('brainstorm-view', function (c, btn) { if (btn && btn.dataset.run) MODE[btn.dataset.run] = btn.dataset.mode === 'markdown' ? 'markdown' : 'rich'; return false; });
  E.chainAction('reset-all', function () { UIV = {}; MODE = {}; DISC = {}; return false; });

  B.decisionVM = decisionVM;
  B.renderDecision = renderDecision;
  B.viewParts = viewParts;
  B.viewDocument = viewDocument;
  B.evidenceDocument = evidenceDocument;
  B.stops = function () { return STOPS.map(function (s) { return { key: s[0], label: s[1], canonical: s[2], short: s[3] }; }); };
})();
