/* room-view.js — ROOM-B: PM56_ROOM.viewParts + RoomDiscussionVM renderer + the Chat Room run view (spec 8.3).

   DESIGN-SPEC 8.3 (room document), 8.0 IMPACT A1-50 (one view model, two adapters, one renderer per kind),
   7.9 (reopening the detail), 4.4 (run view primitives), 9 (copy), owner answer E-18 (queued messages). Presentation
   only: the room protocol (room-protocol.js) is read, never changed.

   - RoomDiscussionVM {runId, title, messages[], summary, promotions[], queued[], controls, ...} is built by one of two
     adapters: protocolVM(run) for rooms the protocol owns (PM56_ROOM.owns), legacyVM(run) for seed, legacy and
     wand-started rooms (COLLAB may replace the latter through PM56_COLLAB.viewModel.chat_room).
   - One renderer: viewParts(run, tab, ctx, generic) returns the kind's parts for COLLAB's shared run-view frame
     (PM56_COLLAB_VIEW, KIND INTERFACE view part): status, actions (merged with the frame's Pause / Message / More),
     tabs, main, aside, participant. The frame keeps the view state (PM56_COLLAB_VIEW.state).
   - The `room:{runId}` editor document draws that same frame: PM56_COLLAB_VIEW.render(ctx, runId,
     {cls:'room-document', attrs:'data-room-run="…"'}). This file is the room document's only renderer:
     room-protocol.js's documentHtml forwards to PM56_ROOM.viewDocument (set below, only when the frame is present). */
(function () {
  'use strict';
  var E = window.PM56_EXT, C = window.PM56_COLLAB, S = window.PM56_SHELL, R = window.PM56_ROOM;
  if (!E || !C || !S || !R) return;
  var esc = S.esc;
  function g(name, size) { return S.pmxGlyph(name, size); }
  function PMX() { return window.PM56_PMX || null; }
  function demos() { return window.PM56_ROOM_DEMOS || null; }

  /* ---------------------------------------------------------------- copy (9, 8.3 G-33) */
  var COPY = {
    kind: 'Chat Room',
    tabs: { transcript: 'Discussion', participants: 'Team', usage: 'Cost' },
    ask: { label: 'Ask Everyone', helper: 'Everyone gives an opening view.' },
    next: { label: 'Next Round', helper: 'Each helper speaks once more.' },
    summarize: { label: 'Summarize Now', helper: 'The Moderator writes where everyone agrees, where they differ, and what’s still open.' },
    end: { label: 'End discussion', helper: 'Locks the conversation. You can still promote messages.' },
    message: 'Message',
    recorded: 'Recorded example: these replies were pre-written, not live AI.',
    promoteLead: 'Promote to',
    promoteHelp: 'Keeps a link back to this message.',
    goalNo: 'Can’t make a Goal from a room yet',
    promoted: 'Promoted to {target}',
    open: 'Open',
    moderatorJob: 'Picks who speaks next and sums up each round.',
    promise: 'Talking changes nothing. You pick what, if anything, to keep.',
    download: 'Download transcript (.md)',
    speakingNow: 'speaking now',
    toYou: 'to you',
    landed: 'Where the room landed',
    table: 'At the table',
    emptyRoom: 'Nobody has spoken yet. Ask Everyone starts the first round.',
    emptyWaiting: 'Nothing has been said yet.',
    queued: 'Queued for the next round',
    queuedHeld: 'Queued · it goes when the next round ends',
    queuedPaused: 'Queued · the room is paused',
    steered: 'Sent during the round · the next speaker reads it, nobody was interrupted',
    readNote: 'read your note',
    firstMove: 'start the first round.'
  };
  /* 9.3: refusal codes read as sentences through the shared map (the code stays in data-failure) */
  function refusal(code) { var t = S.pmxRefusalText ? S.pmxRefusalText(code) : null; return t ? t.text : ''; }
  var TARGET = { todo: 'To-Do', plan: 'Plan', goal: 'Goal' };
  function fill(t, v) { return S.pmxFill ? S.pmxFill(t, v) : String(t).replace(/\{(\w+)\}/g, function (m, n) { return v[n] != null ? esc(v[n]) : m; }); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function firstSentence(text) {
    var t = String(text || '').replace(/[`*_#>]/g, '').replace(/\s+/g, ' ').trim();
    var m = t.match(/^(.+?[.!?])(\s|$)/);
    return (m ? m[1] : t).replace(/[.]$/, '');
  }
  function policyOf(v) {
    var opts = ((C.choices && C.choices().turnPolicy) || {}).options || [];
    for (var i = 0; i < opts.length; i++) if (opts[i].value === v) return opts[i];
    return { value: v, label: 'Moderator guides', read: 'the Moderator calls on whoever is most useful next' };
  }
  function when(iso) { var T = S.pmxTime; return T && iso ? T.at(iso, null, { day: false }) : ''; }

  /* ---------------------------------------------------------------- view state (7.9 G-14)
     The shared frame keeps it: PM56_COLLAB_VIEW.state(runId) -> {tab, participantId} (spec name PM56_COLLAB.viewState),
     set through PM56_COLLAB_VIEW.open. Tabs: transcript (Discussion), participants (Team), usage (Cost); "overview"
     lands on Discussion (8.3 G-14). This file keeps only rendering memory: which messages were already on screen (the
     M4 wash) and where a speaker's own view was opened from (its Back). */
  function CV() { var v = window.PM56_COLLAB_VIEW; return v && typeof v.render === 'function' && typeof v.open === 'function' ? v : null; }
  var UI = { seen: Object.create(null), from: Object.create(null) };
  function normTab(t) { return t === 'overview' || !COPY.tabs[t] ? 'transcript' : t; }
  function viewState(runId) { var w = (CV() && CV().state ? CV().state(runId) : null) || {}; return { tab: normTab(w.tab), participantId: w.participantId || null }; }
  /* open the room document on one speaker's own messages */
  function openDoc(c, runId, o) { CV().open(runId, { tab: o.tab || 'transcript', participantId: o.participantId || null, docId: 'room:' + runId }); c.renderApp(); }

  /* ---------------------------------------------------------------- the view model (A1-50)
     RoomDiscussionVM {
       runId, kind:'chat_room', source:'protocol'|'legacy', title, status, recorded, waiting, policy{value,label,read},
       maxRounds, roundsSoFar, round{number, complete, total, spoken} | null,
       speaking{pid, name, seat, persona, text, msPerWord, key} | null, upNext{pid, name} | null,
       moderator{pid, name, persona}, team[{pid, name, persona, seat, model, standIn}],
       messages[{id, key, kind:'helper'|'moderator'|'you', pid, who, seat, persona, when, body, chapter, replyTo,
         promotable, pinned, steered (E-18 Send now), readNote (the steering note this reply read)}],
       summary{messageId, headline, body, round, current} | null,
       promotions[{key, target, id, sourceMessageId, openable}],
       controls{primary{action, label, helper | disabled+reason+code, cmd}, secondary[], message},
       queued[{id, text, participantId}], queuedLine, queuedFailure (E-18: words only),
       hooks{msgKey, promoteAction, goal, legacy}, usage{costUsd, inputTokens, outputTokens}, cls } */
  function seatOf(run, pid) { for (var i = 0; i < run.participants.length; i++) if (run.participants[i].id === pid) return i + 1; return 1; }
  function personOf(run, pid) { for (var i = 0; i < run.participants.length; i++) if (run.participants[i].id === pid) return run.participants[i]; return null; }
  function teamOf(run) {
    return run.participants.map(function (p, i) {
      var req = p.requestedModelName || '', eff = p.effectiveModelName || '';
      var si = req && eff && req !== eff ? { requested: req, effective: eff, reason: 'offline', sameProvider: /same.provider/i.test(p.substitutionReason || '') } : null;
      return { pid: p.id, name: p.name || p.role || 'Helper', persona: p.effectivePersona || p.requestedPersona || '', seat: i + 1, model: eff || req, standIn: si };
    });
  }
  function moderatorOf(run) {
    var cfg = run.config || {};
    var persona = cfg.moderatorPersona || ((run.coordinator && run.coordinator.label || '').match(/\(([^)]+?) persona\)/) || [])[1] || 'Product Manager';
    return { pid: 'moderator', name: 'Moderator', persona: persona };
  }
  function promotionsOf(run, openable) {
    return ((run.chatRoom || {}).promotions || []).map(function (p) {
      return { key: p.key || (p.target + ':' + (p.sourceMessageId || p.id)), target: p.target, id: p.id, sourceMessageId: p.sourceMessageId, openable: !!openable && !!p.key };
    });
  }
  /* chapters: a helper's reply belongs to its round; your message belongs to the round that answered it (else it
     stays in the chapter it was sent in); the Moderator's summary belongs to the round it summed up. */
  function chapters(run, list) {
    var s = run.chatRoom || {}, replied = Object.create(null);
    list.forEach(function (m) { if (m.roomRound && m.replyTo && replied[m.replyTo] == null) replied[m.replyTo] = m.roomRound; });
    var cur = null;
    return list.map(function (m) {
      var ch = m.roomRound || (m.senderKind === 'user' ? replied[m.id] : null) || (m.roomConclusion && s.summary && s.summary.messageId === m.id ? s.summary.round : null) || cur;
      if (ch != null) cur = ch;
      return ch;
    });
  }
  function msgOf(run, m, ch, hooks) {
    var kind = m.senderKind === 'user' ? 'you' : m.senderKind === 'coordinator' ? 'moderator' : 'helper';
    var p = kind === 'helper' ? personOf(run, m.senderId) : null;
    var reply = null;
    if (m.replyTo) { var src = run.messages.filter(function (x) { return x.id === m.replyTo; })[0]; if (src && src.senderKind === 'user') reply = firstSentence(src.body); }
    /* E-18: a steered message (Send now mid-round) and the reply that read it */
    var note = null;
    (m.readSteering || []).forEach(function (sid) { var n = run.messages.filter(function (x) { return x.id === sid; })[0]; if (n && !note) note = firstSentence(n.body); });
    return {
      id: m.id, key: hooks.msgKey + m.id, kind: kind, pid: kind === 'helper' ? m.senderId : kind === 'moderator' ? 'moderator' : null,
      who: kind === 'you' ? 'You' : kind === 'moderator' ? 'Moderator' : (p ? (p.name || p.role) : m.senderName || 'Helper'),
      seat: p ? seatOf(run, p.id) : 0, persona: p ? (p.effectivePersona || p.requestedPersona) : '',
      when: when(m.createdAt), body: String(m.body || ''), chapter: ch, replyTo: reply, promotable: false, pinned: false,
      steered: kind === 'you' && !!m.roomSteer, readNote: note
    };
  }
  function msgById(run, id) { for (var i = 0; i < run.messages.length; i++) if (run.messages[i].id === id) return run.messages[i]; return null; }
  function protocolVM(run) {
    var s = run.chatRoom, hooks = { msgKey: 'room-msg-', promoteAction: 'room-promote', goal: false, legacy: false };
    var live = run.status === 'running', pol = policyOf(s.turnPolicy || (run.config || {}).turnPolicy);
    var max = pol.value === 'ask_everyone_once' ? 1 : +((run.config || {}).maxRounds || 1);
    var list = run.messages.filter(function (m) { return m.senderKind !== 'system'; });
    var chs = chapters(run, list);
    var msgs = list.map(function (m, i) {
      var v = msgOf(run, m, chs[i], hooks);
      v.promotable = v.kind !== 'you' && !!v.body.trim() && ['running', 'completed'].indexOf(run.status) >= 0;
      return v;
    });
    var round = s.round ? { number: s.round.number, complete: !!s.round.complete, total: s.round.participantIds.length, spoken: s.round.messages.length } : null;
    var speaking = null, upNext = null;
    if (s.round && !s.round.complete && live) {
      var pending = s.round.participantIds.filter(function (pid) { return !s.round.messages.some(function (mid) { var m = msgById(run, mid); return m && m.senderId === pid; }); });
      var d = demos(), hint = d && d.speaking ? d.speaking(run.id) : null;
      if (pending[0]) {
        var sp = personOf(run, pending[0]);
        speaking = { pid: pending[0], name: sp ? (sp.name || sp.role) : 'Helper', seat: seatOf(run, pending[0]), persona: sp ? (sp.effectivePersona || sp.requestedPersona) : '',
          text: hint && hint.pid === pending[0] ? hint.text : '', msPerWord: hint && hint.msPerWord || 0, key: run.id + ':' + s.round.number + ':' + pending[0] };
      }
      if (pending[1]) { var nx = personOf(run, pending[1]); upNext = { pid: pending[1], name: nx ? (nx.name || nx.role) : 'Helper' }; }
    }
    var summary = null;
    if (s.summary) {
      var sm = msgById(run, s.summary.messageId);
      if (sm) summary = { messageId: sm.id, headline: firstSentence(sm.body), body: sm.body, round: s.summary.round, current: s.summary.round === s.roundsSoFar };
    }
    var roundGoing = !!(s.round && !s.round.complete), left = s.roundsSoFar < max;
    var summaryCurrent = !!(summary && summary.current && s.round && s.round.complete);
    /* E-18: Message works while the room runs (a mid-round send is queued for the next round, never refused) */
    var controls = { primary: null, secondary: [], message: null };
    if (live) {
      if (!s.round) controls.primary = { action: 'collab-room-next-round', label: COPY.ask.label, helper: COPY.ask.helper, cmd: 'cmd.chat_room.next_round' };
      else if (roundGoing) controls.primary = { action: 'collab-room-next-round', label: COPY.next.label, disabled: true, reason: refusal('round_incomplete'), code: 'round_incomplete', cmd: 'cmd.chat_room.next_round' };
      else if (summaryCurrent) {
        controls.primary = { action: 'room-finish', label: COPY.end.label, helper: COPY.end.helper, cmd: 'cmd.chat_room.end' };
        if (left) controls.secondary.push({ action: 'collab-room-next-round', label: COPY.next.label + ' (' + (s.roundsSoFar + 1) + ' of ' + max + ')' });
      } else if (left) {
        controls.primary = { action: 'collab-room-next-round', label: COPY.next.label + ' (' + (s.roundsSoFar + 1) + ' of ' + max + ')', helper: COPY.next.helper, cmd: 'cmd.chat_room.next_round' };
        controls.secondary.push({ action: 'collab-room-summarize', label: COPY.summarize.label });
      } else controls.primary = { action: 'collab-room-summarize', label: COPY.summarize.label, helper: COPY.summarize.helper, cmd: 'cmd.chat_room.summarize' };
      controls.message = { action: 'collab-message', label: COPY.message };
    }
    /* E-18: the messages queued above the composer, shown here as words only (Edit and Send now live once, there) */
    var queued = (R.queued ? R.queued(run.id) : []).map(function (e) { return { id: e.id, text: e.text, participantId: e.participantId }; });
    var qs = queued.length && R.queueState ? R.queueState(run.id) : null;
    var qline = !qs ? '' : qs.can ? COPY.queued : ['finish_pending_delivery', 'finish_current_round'].indexOf(qs.code) >= 0 ? COPY.queuedHeld
      : run.status === 'paused' ? COPY.queuedPaused : 'Not sent · ' + (refusal(qs.code) || refusal('room_ended_or_paused'));
    var qfail = qs && !qs.can && run.status !== 'paused' && ['finish_pending_delivery', 'finish_current_round'].indexOf(qs.code) < 0 ? (qs.code || 'room_ended_or_paused') : '';
    /* the summary's promotion row is pinned at the top; the conclusion in the script carries none (one control set,
       G-13 / unique-controls) */
    if (summary) msgs.forEach(function (m) { if (m.id === summary.messageId) m.pinned = true; });
    return {
      runId: run.id, kind: 'chat_room', source: 'protocol', title: run.title, status: run.status, waiting: false,
      recorded: C.provenance ? C.provenance(run.id) === 'recorded' : true, policy: pol, maxRounds: max, roundsSoFar: s.roundsSoFar,
      round: round, speaking: speaking, upNext: upNext, moderator: moderatorOf(run), team: teamOf(run),
      messages: msgs, summary: summary, promotions: promotionsOf(run, true), controls: controls, hooks: hooks,
      queued: queued, queuedLine: qline, queuedFailure: qfail, usage: run.usage || {}, cls: 'room-discussion'
    };
  }
  /* Interim legacy adapter (seed chatroom-onboarding, wand-started rooms): the G-15 hooks travel in `hooks`
     (collab-msg-{mid} keys, collab-room-next-round "Next Round (3 of 5)", collab-room-summarize, and
     collab-room-promote To-Do · Plan · Goal under the Moderator's latest wrap-up). */
  function legacyVM(run) {
    var s = run.chatRoom || { roundsSoFar: 0, promotions: [] }, hooks = { msgKey: 'collab-msg-', promoteAction: 'collab-room-promote', goal: true, legacy: true };
    var pol = policyOf(s.turnPolicy || (run.config || {}).turnPolicy), max = +((run.config || {}).maxRounds || 1);
    var prov = C.provenance ? C.provenance(run.id) : 'seed';
    var waiting = run.status === 'waiting' || (prov === 'wand' && !(run.messages || []).some(function (m) { return m.senderKind === 'participant'; }));
    var list = (run.messages || []).filter(function (m) { return m.senderKind !== 'system'; });
    var msgs = list.map(function (m) { return msgOf(run, m, null, hooks); });
    var lastMod = null;
    msgs.forEach(function (m) { if (m.kind === 'moderator') lastMod = m; });
    var summary = lastMod ? { messageId: lastMod.id, headline: firstSentence(lastMod.body), body: lastMod.body, round: s.roundsSoFar || 0, current: true } : null;
    if (summary) msgs.forEach(function (m) { if (m.id === summary.messageId) m.pinned = true; });
    var live = run.status === 'running' && !waiting, left = (s.roundsSoFar || 0) < max;
    var controls = { primary: null, secondary: [], message: null };
    if (live) {
      controls.primary = left ? { action: 'collab-room-next-round', label: COPY.next.label + ' (' + ((s.roundsSoFar || 0) + 1) + ' of ' + max + ')', helper: COPY.next.helper, cmd: 'cmd.chat_room.next_round' }
        : { action: 'collab-room-summarize', label: COPY.summarize.label, helper: COPY.summarize.helper, cmd: 'cmd.chat_room.summarize' };
      if (left) controls.secondary.push({ action: 'collab-room-summarize', label: COPY.summarize.label });
      controls.message = { action: 'collab-message', label: COPY.message };
    }
    return {
      runId: run.id, kind: 'chat_room', source: 'legacy', title: run.title, status: waiting ? 'waiting' : run.status, waiting: waiting,
      recorded: prov === 'recorded', policy: pol, maxRounds: max, roundsSoFar: s.roundsSoFar || 0,
      round: null, speaking: null, upNext: null, moderator: moderatorOf(run), team: teamOf(run),
      messages: msgs, summary: summary, promotions: promotionsOf(run, false), controls: controls, hooks: hooks,
      queued: [], queuedLine: '', queuedFailure: '', usage: run.usage || {}, cls: 'room-discussion'
    };
  }
  function discussionVM(run) {
    if (!run || run.kind !== 'chat_room') return null;
    if (R.owns(run.id)) return protocolVM(run);
    var L = C.viewModel && C.viewModel.chat_room;
    return typeof L === 'function' ? L(run) : legacyVM(run);
  }

  /* ---------------------------------------------------------------- the renderer (one per kind, A1-50) */
  function mark(m, size) {
    if (m.kind === 'you') return S.pmxMark({ role: 'you', size: size });
    if (m.kind === 'moderator') return S.pmxMark({ role: 'moderator', size: size });
    return S.pmxMark({ role: m.persona || 'helper', seat: m.seat || 1, size: size });
  }
  function runAttr(vm) { return ' data-run="' + esc(vm.runId) + '"'; }
  function whoButton(vm, m) {
    if (m.kind === 'you') return esc(m.who);
    return '<button type="button" class="text-button pmx-rv-who" data-action="collab-open-participant"' + runAttr(vm) + ' data-participant="' + esc(m.pid || '') + '">' + esc(m.who) + '</button>';
  }
  function promoteButtons(vm, mid, withGoal) {
    var out = ['todo', 'plan'].map(function (t) {
      return '<button type="button" class="text-button" data-action="' + vm.hooks.promoteAction + '" data-target="' + t + '"' + runAttr(vm) + ' data-message="' + esc(mid) + '">' + TARGET[t] + '</button>';
    }).join('');
    if (withGoal) out += vm.hooks.goal ? '<button type="button" class="text-button" data-action="' + vm.hooks.promoteAction + '" data-target="goal"' + runAttr(vm) + ' data-message="' + esc(mid) + '">Goal</button>'
      : '<button type="button" class="text-button" data-target="goal" disabled data-failure="unsupported_promotion">Goal</button>';
    return out;
  }
  function receipts(vm, mid) {
    return vm.promotions.filter(function (p) { return p.sourceMessageId === mid; }).map(function (p) {
      return '<p class="pmx-rv-receipt" data-k="room-promo:' + esc(p.key) + '">' + g('chevron-right', 13) + '<span>' + fill(COPY.promoted, { target: TARGET[p.target] || p.target }) + '</span>' +
        (p.openable ? '<button type="button" class="text-button" data-action="room-open-promotion"' + runAttr(vm) + ' data-key="' + esc(p.key) + '">' + COPY.open + '</button>' : '') + '</p>';
    }).join('');
  }
  /* M4: a message that arrives while the view is open washes once (the template marks it for 700 ms). */
  function arriving(vm, id) {
    var seen = UI.seen[vm.runId], now = Date.now();
    if (!seen) return false;
    if (seen[id] == null) seen[id] = now;
    return now - seen[id] < 700;
  }
  function entry(vm, m) {
    var reply = m.replyTo ? '<p class="pmx-rv-reply">' + g('quote', 12) + '<span>' + COPY.toYou + ': “' + esc(m.replyTo) + '”</span></p>' : '';
    if (m.readNote) reply += '<p class="pmx-rv-reply" data-room-read-note="1">' + g('quote', 12) + '<span>' + COPY.readNote + ': “' + esc(m.readNote) + '”</span></p>';
    if (m.steered) reply += '<p class="pmx-rv-reply" data-room-steered="1">' + g('send', 12) + '<span>' + COPY.steered + '</span></p>';
    var acts = m.promotable && !m.pinned ? '<div class="pmx-rv-acts"><span class="pmx-fine">' + COPY.promoteLead + '</span>' + promoteButtons(vm, m.id, false) + '</div>' : '';
    return {
      key: m.key, mid: m.id, markHtml: mark(m, 22), who: whoButton(vm, m), when: esc(m.when), cls: 'pmx-rv-msg',
      attrs: ' data-room-message="' + esc(m.id) + '" data-who="' + m.kind + '"' + (arriving(vm, m.id) ? ' data-arrive="1"' : ''),
      bodyHtml: reply + S.pmxMd(m.body, { mode: 'full' }) + acts + (m.pinned ? '' : receipts(vm, m.id))
    };
  }
  function liveEntry(vm) {
    var sp = vm.speaking;
    return {
      key: 'room-live:' + sp.key, mid: 'live:' + sp.key, streaming: true, cls: 'pmx-rv-msg', attrs: ' data-who="helper" data-speaking="1"',
      markHtml: S.pmxMark({ role: sp.persona || 'helper', seat: sp.seat, size: 22, state: 'working' }),
      who: whoButton(vm, { kind: 'helper', pid: sp.pid, who: sp.name }), when: COPY.speakingNow,
      bodyHtml: '<p class="pmx-rv-live"><q data-room-stream="' + esc(sp.text || '') + '" data-ms="' + (sp.msPerWord || 0) + '"></q></p>'
    };
  }
  function script(vm) {
    var groups = [], cur = null;
    vm.messages.forEach(function (m) {
      if (!cur || m.chapter !== cur.n) { cur = { n: m.chapter, list: [] }; groups.push(cur); }
      cur.list.push(m);
    });
    if (vm.speaking) {
      var n = vm.round && vm.round.number;
      if (!cur || cur.n !== n) { cur = { n: n, list: [] }; groups.push(cur); }
      cur.live = true;
    }
    if (!groups.length) return '<p class="pmx-rv-empty">' + (vm.waiting ? COPY.emptyWaiting : COPY.emptyRoom) + '</p>' + queuedHtml(vm);
    return groups.map(function (gr) {
      var ents = gr.list.map(function (m) { return entry(vm, m); });
      if (gr.live) ents.push(liveEntry(vm));
      return (gr.n != null ? S.pmxDivider({ key: 'room-round:' + vm.runId + ':' + gr.n, cls: 'pmx-rv-round', text: 'Round ' + gr.n }) : '') +
        S.pmxTimeline({ key: 'room-tl:' + vm.runId + ':' + (gr.n == null ? 'open' : gr.n), cls: 'pmx-rv-script', entries: ents });
    }).join('') + queuedHtml(vm);
  }
  /* E-18: what you queued while a round was going, in the place it will land (after the script). Words only: its
     Edit and Send now live once, above the composer (one control set, 7.12). */
  function queuedHtml(vm) {
    if (!vm.queued || !vm.queued.length) return '';
    return S.pmxTimeline({ key: 'room-queued:' + vm.runId, cls: 'pmx-rv-script pmx-rv-queued', entries: vm.queued.map(function (q) {
      return { key: 'room-q:' + q.id, mid: 'q:' + q.id, markHtml: S.pmxMark({ role: 'you', size: 22 }), who: 'You', cls: 'pmx-rv-msg',
        when: vm.queuedFailure ? '<span data-failure="' + esc(vm.queuedFailure) + '">' + esc(vm.queuedLine) + '</span>' : esc(vm.queuedLine),
        attrs: ' data-who="you" data-queued="' + esc(q.id) + '"', bodyHtml: '<p class="pmx-rv-qtext">' + esc(q.text) + '</p>' };
    }) });
  }
  function pinnedSummary(vm) {
    var s = vm.summary; if (!s) return '';
    var rest = s.body.replace(/^\s*[^.!?]+[.!?]\s*/, '');
    var board = (rest ? '<div class="pmx-rv-sumbody">' + S.pmxMd(rest, { mode: 'full' }) + '</div>' : '') +
      '<div class="pmx-rv-promote" role="group" aria-label="' + COPY.promoteLead + '"><span class="pmx-fine">' + COPY.promoteLead + '</span>' + promoteButtons(vm, s.messageId, true) + '</div>' +
      (vm.hooks.goal ? '' : '<p class="pmx-reason pmx-rv-goalwhy">' + COPY.goalNo + '</p>') +
      '<p class="pmx-help pmx-rv-promhelp">' + COPY.promoteHelp + '</p>' + receipts(vm, s.messageId);
    return S.pmxViewSection({ key: 'room-landed:' + vm.runId, cls: 'pmx-rv-landed', title: COPY.landed, meta: 'Moderator · after round ' + s.round,
      body: S.pmxResult({ key: 'room-result:' + s.messageId, glyph: 'check', headline: esc(s.headline), sub: '', boardHtml: board }) });
  }
  /* The shared faces (waiting, paused, cancelled, stopped at your limit, failed) read PM56_COLLAB.sentenceOf, so the
     card and the document say the same thing (IMPACT A3-04); the room's own moments say where the discussion is. */
  var SHARED = { waiting: 1, paused: 1, cancelled: 1, limit: 1, failed: 1 };
  function statusHtml(vm) {
    var st = vm.status, out = '', run = C.run(vm.runId);
    var face = run && C.sentenceOf ? C.sentenceOf(run) : null;
    if (face && (SHARED[face.status] || vm.waiting)) out = '<b>' + esc(face.word) + '</b>' + (face.reason ? ' · ' + esc(face.reason) : '');
    else if (vm.waiting || st === 'waiting') out = '<b>Waiting to start</b> · ' + esc(C.waitingReason ? C.waitingReason(run) : '');
    else if (st === 'completed') {
      var counts = { todo: 0, plan: 0, goal: 0 };
      vm.promotions.forEach(function (p) { counts[p.target] = (counts[p.target] || 0) + 1; });
      var kept = [counts.todo ? plural(counts.todo, 'To-Do') : '', counts.plan ? plural(counts.plan, 'Plan') : '', counts.goal ? plural(counts.goal, 'Goal') : ''].filter(Boolean).join(', ');
      out = '<b>Finished</b> · ' + plural(vm.roundsSoFar, 'round') + ' · ' + (kept || 'nothing kept yet');
    } else if (vm.speaking) out = '<b>Round ' + vm.round.number + ' of ' + vm.maxRounds + '</b> · ' + esc(vm.speaking.name) + ' is speaking' + (vm.upNext ? ' · Up next: ' + esc(vm.upNext.name) : '') + '.';
    else if (vm.round && !vm.round.complete) out = '<b>Round ' + vm.round.number + ' of ' + vm.maxRounds + '</b> · The helpers are answering.';
    else if (vm.summary && vm.summary.current && vm.roundsSoFar) out = '<b>Round ' + vm.roundsSoFar + ' done</b> · The Moderator summed it up. Your move.';
    else if (vm.roundsSoFar) out = '<b>Round ' + vm.roundsSoFar + ' done</b> · Your move.';
    else if (st === 'running') out = '<b>Your move</b> · ' + COPY.firstMove;
    else out = '<b>Not started</b> · ' + plural(vm.team.length, 'helper') + ' · ' + esc(vm.policy.label) + '.';
    return '<span class="room-meta pmx-rv-say">' + out + '</span>' + (vm.recorded ? '<span class="pmx-rv-prov">' + g('play-ring', 13) + '<span>' + COPY.recorded + '</span></span>' : '');
  }
  /* The head's actions: the frame's own (Pause / Resume, Message, More) first, then the room's quiet words and its one
     primary, with the primary's helper (or the reason it is disabled) printed under them. Without the frame the
     room's own Message stands in for the frame's. */
  function actionsHtml(vm, generic) {
    var c = vm.controls, p = c.primary, out = generic && generic.actions != null ? String(generic.actions) : '';
    c.secondary.forEach(function (a) { out += '<button type="button" class="text-button" data-action="' + a.action + '"' + runAttr(vm) + '>' + esc(a.label) + '</button>'; });
    if (c.message && !(generic && generic.actions != null)) out += '<button type="button" class="text-button" data-action="' + c.message.action + '"' + runAttr(vm) + '>' + c.message.label + '</button>';
    if (p) out += '<button type="button" class="primary-button" data-action="' + p.action + '"' + runAttr(vm) + (p.disabled ? ' disabled data-failure="' + esc(p.code || '') + '"' : '') + '>' + esc(p.label) + '</button>';
    var say = p ? (p.disabled ? p.reason : p.helper) : '';
    return (out ? '<div class="room-controls pmx-rv-controls">' + out + '</div>' : '') + (say ? '<p class="' + (p && p.disabled ? 'pmx-reason' : 'pmx-help') + ' pmx-rv-acthelp">' + esc(say) + '</p>' : '');
  }
  function aside(vm) {
    var mod = vm.moderator;
    var rows = '<li>' + S.pmxMark({ role: 'moderator', size: 18 }) + '<span><b>Moderator</b> · ' + esc(mod.persona) + '<small>' + COPY.moderatorJob + '</small></span></li>' +
      vm.team.map(function (t) { return '<li>' + S.pmxMark({ role: t.persona || 'helper', seat: t.seat, size: 18 }) + '<span><b>' + esc(t.name) + '</b> · ' + esc(t.persona) + '</span></li>'; }).join('');
    /* no Technical details (2026-10-07, Jared): the commands stay on the sheet's Advanced page only */
    return '<p class="pmx-fine pmx-rv-asidehead">' + COPY.table + '</p><ul class="pmx-rv-table">' + rows + '</ul>' +
      '<p class="pmx-rv-policy"><b>' + esc(vm.policy.label) + '</b> · up to ' + plural(vm.maxRounds, 'round') + '</p>' +
      '<p class="pmx-rv-promise">' + g('not', 14) + '<span>' + COPY.promise + '</span></p>' +
      (vm.source === 'protocol' ? '<button type="button" class="text-button pmx-rv-export" data-action="room-export"' + runAttr(vm) + '>' + g('download', 14) + '<span>' + COPY.download + '</span></button>' : '');
  }
  /* A speaker's own messages (7.9): a helper replaces the frame's helper view (participant), the Moderator (not a
     participant record) is drawn as the Team tab's main while its view is open. */
  function participantView(vm, pid) {
    var isMod = pid === 'moderator', t = isMod ? null : vm.team.filter(function (x) { return x.pid === pid; })[0];
    var name = isMod ? 'Moderator' : t ? t.name : 'Helper';
    var html = vm.messages.filter(function (m) { return m.pid === pid; }).map(function (m) {
      return '<article class="collab-msg pmx-rv-pmsg" data-k="room-pmsg:' + esc(m.id) + '"><p class="pmx-fine">' + (m.chapter != null ? 'Round ' + m.chapter : '') + (m.when ? (m.chapter != null ? ' · ' : '') + esc(m.when) : '') + '</p>' + S.pmxMd(m.body, { mode: 'full' }) + '</article>';
    }).join('');
    return S.pmxParticipant({ key: 'room-part:' + vm.runId + ':' + pid, kind: 'chat_room', role: esc(name), standIn: t && t.standIn, messagesHtml: html,
      emptyText: fill('Nothing from {name} yet.', { name: name }), headHtml: isMod ? '<p class="pmx-help pmx-rv-pjob">' + COPY.moderatorJob + '</p>'
        : vm.controls.message ? '<p class="pmx-rv-pmessage"><button type="button" class="text-button" data-action="collab-message"' + runAttr(vm) + ' data-participant="' + esc(pid) + '">' + fill('Message {name}', { name: name }) + '</button></p>' : '' });
  }
  /* legacy seed titles already start with the kind word ("Chat Room · Onboarding …"); the room document's kind line
     says it, so its title and tab drop it (the shared frame keeps run.title: collaboration-verify reads it there) */
  function bareTitle(t) { return String(t || '').replace(/^Chat Room\s*·\s*/, ''); }
  function isRoomDoc(c) { return !!(c && c.editorId && String(c.editorId).indexOf('room:') === 0); }

  /* PM56_ROOM.viewParts(run, tab, ctx, generic) -> the kind's parts for COLLAB's run-view frame (KIND INTERFACE, view
     part). Discussion is the room's own (the pinned summary, the script in rounds, what you queued); Team and Cost are
     the frame's common tabs; the head's actions are the frame's Pause / Message / More followed by the room's. */
  /* the room's cast (2026-10-07): the same plate the Chat Room sheet draws (PM56_COLLAB.sheet.castRun, one grammar):
     the topic to the Moderator, the helpers hanging under it (the one speaking now is working), the turn policy and
     the round on one note line, You at the end. A compact plate: the Discussion is what the view is for. */
  function plateOf(run, vm) {
    var fn = C.sheet && C.sheet.castRun;
    if (typeof fn !== 'function') return '';
    var states = {}, speaking = vm.speaking && vm.speaking.pid;
    (vm.team || []).forEach(function (t) { states[t.pid] = speaking === t.pid ? 'working' : 'idle'; });
    var rounds = vm.roundsSoFar ? 'round ' + vm.roundsSoFar + ' of ' + (vm.maxRounds || vm.roundsSoFar) : '';
    try { return fn(run, { key: 'room-plate:' + run.id, live: { states: states, rounds: rounds, done: run.status === 'completed' } }) || ''; } catch (e) { return ''; }
  }
  function viewParts(run, tab, ctx, generic) {
    var vm = discussionVM(run); if (!vm) return null;
    var st = viewState(run.id);
    tab = normTab(tab);
    if (!UI.seen[run.id]) { UI.seen[run.id] = Object.create(null); vm.messages.forEach(function (m) { UI.seen[run.id][m.id] = 0; }); }
    var pid = st.participantId, main, participant;
    if (pid === 'moderator') main = participantView(vm, pid);
    else if (pid) participant = participantView(vm, pid);
    else if (tab === 'transcript') {
      var guide = demos() && demos().editorGuide ? demos().editorGuide(run.id) : '';
      main = guide + pinnedSummary(vm) + '<div class="pmx-rv-scriptwrap">' + script(vm) + '</div>';
    }
    var mess = vm.messages.length;
    return {
      title: esc(isRoomDoc(ctx) && vm.source === 'legacy' ? bareTitle(run.title) : run.title), kindWord: COPY.kind,
      status: statusHtml(vm), actions: actionsHtml(vm, generic || {}), plate: plateOf(run, vm),
      tabs: [{ value: 'transcript', label: COPY.tabs.transcript, count: mess || '' }, { value: 'participants', label: COPY.tabs.participants, count: vm.team.length + 1 },
        { value: 'usage', label: COPY.tabs.usage }],
      main: main, participant: participant, aside: !pid && tab === 'transcript' ? aside(vm) : undefined,
      cls: vm.cls, attrs: 'data-source="' + vm.source + '"', vm: vm
    };
  }
  function documentHtml(c, id) {
    var run = C.run(id); if (!run || run.kind !== 'chat_room' || !CV()) return '';
    return CV().render(c, id, { cls: 'room-document', attrs: 'data-room-run="' + esc(id) + '"' });
  }

  /* ---------------------------------------------------------------- the room: document (8.3, 7.9)
     Drawn by the shared frame, here only (room-protocol.js has no document of its own), so a room is drawn once. */
  E.slot('editorDocument', function (c) { return isRoomDoc(c) ? documentHtml(c, c.editorId.slice(5)) : ''; });
  E.slot('editorTabLabel', function (c) {
    if (!isRoomDoc(c)) return '';
    var run = C.run(c.editorId.slice(5));
    return esc(COPY.kind + (run && run.title ? ' · ' + bareTitle(run.title) : ''));
  });
  function inView(b) { return !!(b && b.closest && b.closest('[data-collab-view]')); }
  /* A card lane (or any button outside the view) naming a speaker opens the room document on that speaker (7.9);
     inside the view the frame keeps the state. The frame's Back returns to where the speaker was opened from:
     a speaker name in the Discussion goes back to the Discussion, a Team row back to Team. */
  E.chainAction('collab-open-participant', function (c, b) {
    var id = b.dataset.run; if (!id || b.classList.contains('ab-row') || !CV()) return false;
    if (inView(b)) { if (b.closest('.room-discussion')) UI.from[id] = viewState(id).tab; return false; }
    if (!R.owns(id)) return false;
    UI.from[id] = 'transcript'; openDoc(c, id, { participantId: b.dataset.participant || null }); return true;
  });
  E.chainAction('collab-close-participant', function (c, b) {
    var root = b && b.closest ? b.closest('.room-discussion[data-collab-view]') : null, id = root ? root.getAttribute('data-collab-view') : '';
    if (!id || !UI.from[id] || !CV()) return false;
    var back = UI.from[id]; delete UI.from[id];
    CV().open(id, { tab: back, docId: c.state.activeEditor || ('room:' + id) }); c.renderApp(); return true;
  });
  /* A card lane opens the document at that message (room-open-discussion, the protocol's): show the Discussion. */
  E.chainAction('room-open-discussion', function (c, b) {
    var id = b.dataset.run; if (id && R.owns(id) && CV()) CV().open(id, { tab: 'transcript', docId: 'room:' + id });
    return false;
  });
  /* Download transcript (.md) (8.3): the room document's export writes Markdown. */
  function exportMd(run) {
    var vm = discussionVM(run); if (!vm) return '';
    var lines = ['# ' + run.title, '', 'Chat Room · ' + vm.policy.label + ' · ' + plural(vm.roundsSoFar, 'round'), ''];
    if (vm.recorded) lines.push(COPY.recorded, '');
    lines.push('At the table: Moderator (' + vm.moderator.persona + '), ' + vm.team.map(function (t) { return t.name + ' (' + t.persona + ')'; }).join(', '), '');
    var ch = null;
    vm.messages.forEach(function (m) {
      if (m.chapter != null && m.chapter !== ch) { ch = m.chapter; lines.push('## Round ' + ch, ''); }
      lines.push('**' + m.who + '**' + (m.when ? ' · ' + m.when : ''), '');
      if (m.replyTo) lines.push('> to you: "' + m.replyTo + '"', '');
      if (m.steered) lines.push('> ' + COPY.steered, '');
      lines.push(m.body, '');
      vm.promotions.filter(function (p) { return p.sourceMessageId === m.id; }).forEach(function (p) { lines.push('→ ' + fill(COPY.promoted, { target: TARGET[p.target] || p.target }), ''); });
    });
    return lines.join('\n');
  }
  E.chainAction('room-export', function (c, b) {
    var run = C.run(b.dataset.run); if (!run || !R.owns(run.id)) return false;
    var text = exportMd(run), url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' })), a = document.createElement('a');
    a.href = url; a.download = 'chat-room-' + String(run.title || 'transcript').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) + '.md';
    a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000); return true;
  });
  E.chainAction('reset-all', function () { UI.seen = Object.create(null); UI.from = Object.create(null); return false; });

  /* ---------------------------------------------------------------- live words (M4)
     The current speaker's words stream into the kept island (data-pm-keep) of the "speaking now" entry, paced by
     PM56_PMX.stream (one pacer, IMPACT A1-47). When the reply lands, the finished message replaces the entry. */
  function feed() {
    var P = PMX(); if (!P || !P.stream) return;
    var qs = document.querySelectorAll('.room-discussion q[data-room-stream]');
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i], island = q.closest('[data-pm-keep]'), text = q.getAttribute('data-room-stream') || '';
      if (island && text) P.stream(island, text, { msPerWord: +q.getAttribute('data-ms') || undefined });
    }
  }
  if (PMX() && PMX().after) PMX().after(function (c, phase) { if (phase === 'app') feed(); });

  R.viewParts = viewParts;
  R.discussionVM = discussionVM;
  R.renderDiscussion = function (vm) { return vm ? script(vm) : ''; };
  R.exportMarkdown = function (id) { var r = C.run(id); return r ? exportMd(r) : ''; };
  R.viewState = viewState;
  /* the room document exists only with the shared frame (collab-view.js); without it there is no room: document */
  if (CV()) { R.viewDocument = documentHtml; R.renderView = function (run) { return run ? documentHtml(E.ctx(), run.id) : ''; }; }
})();
