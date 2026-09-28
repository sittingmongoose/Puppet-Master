/* collab-view.js — COLLAB-VIEW (parallel build, then COLLAB lane): the docked run view in the editor pane (spec 4.4, 7.9, 8.0 view bullets).
 *
 * WHAT THIS FILE OWNS
 * -------------------
 * The full record of a collaboration run (Crew, Chat Room, BrainStorm, Review), docked in the editor pane
 * (decision D-4). It replaces the centred `collab-panel` dialog and carries its test hooks (00-BRIEF B.5):
 *   - the view root is `article.pmx-view.collab-view.collab-panel[data-collab-view]`, whose first
 *     `.drawer-head strong` is the run title (pmxView's head carries `drawer-head`);
 *   - tabs are `[data-action="collab-panel-tab"][data-tab="overview|transcript|participants|usage"][data-run]`;
 *   - Team rows are `button.collab-participant[data-action="collab-open-participant"][data-run][data-participant]`;
 *   - the participant view is `.collab-participant-view` (h3 = the helper's job, `.collab-msg` per own
 *     message, `.collab-empty` "Nothing from {name} yet.").
 *
 * ENTRY POINT
 *   window.PM56_COLLAB_VIEW.open(runId, {tab, participantId, docId}) opens the editor document
 *   `collab-run:{runId}` (or `docId`) at that tab or helper.
 *   window.PM56_COLLAB_VIEW.render(ctx, runId, {cls, attrs}) returns the view's HTML, so a kind's own
 *   document (crew-work:, review:, brainstorm:, room:) can draw the same frame.
 *
 * KIND PARTS (spec 8.0 KIND INTERFACE, view half)
 *   PM56_<KIND>.viewParts(run, tab, ctx, generic) is looked up at render time. Every field it returns (not
 *   undefined) replaces the generic one: title (HTML), kindWord, mark, status, actions, more (extra More-row
 *   buttons), plate, tabs ([{value,label,count}] or HTML), main, aside, cls, attrs, participant (HTML for the
 *   participant view). `generic` is this file's complete part set for the run and tab, so a kind can wrap or
 *   extend a part; PM56_COLLAB_VIEW.common(run, tab) gives the common tabs alone (spec: viewCommon).
 *
 * Every surface is built from PM56_SHELL (pmxView, pmxTabs, pmxViewSection, pmxTimeline, pmxTeamRow,
 * pmxParticipant, pmxMd, pmxMark, pmxStandIn, pmxCost, pmxTime ...); no primitive is re-implemented here.
 * Actions reuse the existing collab-* names (pause, resume, cancel, message, export, open-configure, the
 * follow-ons); the only new actions are view state: collab-view-toggle (the More row, the in-place cancel
 * confirm, Technical details) and collab-view-filter (the Conversation's "Showing everyone" picker).
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT; if (!EXT || !EXT.slot || !EXT.action) return;

  var PREFIX = 'collab-run:';
  var KIND_WORD = { crew: 'Crew', brainstorm: 'BrainStorm', review: 'Review', chat_room: 'Chat Room' };
  var KIND_MOD = { crew: 'PM56_CREW', review: 'PM56_REVIEW', brainstorm: 'PM56_BRAINSTORM', chat_room: 'PM56_ROOM' };
  var OVERVIEW_WORD = { crew: 'Summary', review: 'Report', brainstorm: 'How they decided', chat_room: 'Discussion' };
  var TAB_KEYS = ['overview', 'transcript', 'participants', 'usage'];
  var SPECIAL = { wonderer: 1, grill_me: 1, grillme: 1, grill: 1 };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function S() { return window.PM56_SHELL; }
  function C() { return window.PM56_COLLAB; }
  function PMX() { return window.PM56_PMX; }
  function copy() { return (S() && S().PMX_COPY) || {}; }
  function fill(tpl, vars) { return S().pmxFill(tpl, vars); }
  function list(v) { return Array.isArray(v) ? v : []; }
  function findRun(id) { var c = C(); return c && c.run ? c.run(id) : null; }
  function kindModule(kind) { var n = KIND_MOD[kind]; return n ? window[n] : null; }
  function nowMs() { var k = window.PM56_CLOCK; return k && typeof k.now === 'function' ? k.now() : Date.now(); }
  function ms(iso) { var t = Date.parse(iso); return isFinite(t) ? t : NaN; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function glyph(name, size) { return S().pmxGlyph(name, size || 14); }
  function attr(name, v) { return ' ' + name + '="' + esc(v) + '"'; }
  function runAttr(run) { return attr('data-run', run.id); }
  function joinNames(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  /* ================================================================ view state (G-14)
     One record per run: the tab, the helper whose own view is open, the Conversation filter, and the three
     view-local toggles (More row, the in-place cancel confirm, Technical details). Reset on reset-all. */
  var VIEW = {};
  function vs(runId) {
    var v = VIEW[runId];
    if (!v) v = VIEW[runId] = { tab: 'overview', participantId: null, filter: 'all', more: false, confirm: false, tech: false };
    return v;
  }

  /* ================================================================ run facts */
  function specialKind(p) { var k = String(p && p.additiveRoleKind || 'none').toLowerCase(); return SPECIAL[k] ? (k === 'wonderer' ? 'wonderer' : 'grill') : ''; }
  function coreOf(run) { return list(run.participants).filter(function (p) { return !specialKind(p); }); }
  function specialsOf(run) { return list(run.participants).filter(function (p) { return !!specialKind(p); }); }
  function kindWord(run) {
    if (run.kind === 'review') {
      var single = (run.config && run.config.strategy === 'single_agent') || coreOf(run).length === 1;
      return 'Review · ' + (single ? 'Single Agent' : 'Multi-Pass');
    }
    return KIND_WORD[run.kind] || 'Collaboration';
  }
  function helperNoun(run, n) { return run.kind === 'review' ? plural(n, 'reviewer', 'reviewers') : plural(n, 'helper', 'helpers'); }
  function seatOf(run, p) {
    var k = specialKind(p);
    if (k === 'wonderer') return 7;
    if (k) return 8;
    var core = coreOf(run);
    for (var i = 0; i < core.length; i++) if (core[i].id === p.id) return i + 1;
    return 1;
  }
  function roleOf(p) { var k = specialKind(p); return k || (p.effectivePersona || p.requestedPersona || 'helper'); }
  function modelShort(name) { return String(name || '').split(' · ')[0]; }
  function provenance(run) { var c = C(); try { return c && c.provenance ? c.provenance(run.id) : ''; } catch (e) { return ''; } }
  function owned(run) {
    var m = kindModule(run.kind);
    try {
      if (run.kind === 'review') return !!(run.review && run.review.protocolVersion);
      return !!(m && typeof m.owns === 'function' && m.owns(run.id));
    } catch (e) { return false; }
  }

  /* One presentation state (IMPACT A1-20): COLLAB's presentState (waiting, starting, running, attention, paused,
     completed, cancelled, limit, failed), read here as the view's words: completed -> done, attention -> needs.
     Without it, the same reading of run.status, with the born-waiting rule for a wand run nobody has worked on. */
  var NORM = { completed: 'done', attention: 'needs' };
  function present(run) {
    var c = C();
    if (c && typeof c.presentState === 'function') { try { var p = c.presentState(run); if (p) return NORM[p] || String(p); } catch (e) { } }
    var st = String(run.status || '');
    if (st === 'completed') return 'done';
    if (st === 'canceled' || st === 'cancelled') return 'cancelled';
    if (st === 'failed') return 'failed';
    if (st === 'paused') return 'paused';
    if (st === 'blocked') return 'needs';
    if (st === 'waiting' || st === 'configuring') return 'waiting';
    if (provenance(run) === 'wand' && list(run.participants).every(function (q) { return !list(q.attempts).length; })) return 'waiting';
    return 'running';
  }
  function finished(state) { return state === 'done' || state === 'cancelled' || state === 'failed' || state === 'limit'; }
  function live(state) { return !finished(state) && state !== 'waiting'; }
  /* OWNER ANSWER E-31 (DL-137): a helper's words stream only while the run is going (running, or one helper needs you
     and the others keep working); a paused, stopped or finished run never shows words still arriving */
  function flowing(state) { return state === 'running' || state === 'needs'; }
  function canPause(run, st) { var c = C(); if (c && typeof c.canPause === 'function') { try { return !!c.canPause(run); } catch (e) { } } return st === 'running' || st === 'needs'; }
  function canCancel(run, st) { var c = C(); if (c && typeof c.canCancel === 'function') { try { return !!c.canCancel(run); } catch (e) { } } return !finished(st); }

  var HELPER_STATE = { pending: 'queued', waiting: 'waitingTurn', working: 'working', blocked: 'needs', done: 'done', failed: 'unfinished', disabled: 'unfinished' };
  function helperWord(p) { var k = HELPER_STATE[p.status] || 'queued'; return (copy().helper || {})[k] || 'Queued'; }
  function markState(p) {
    return { working: 'working', done: 'done', blocked: 'needs', failed: 'failed', disabled: 'failed', waiting: 'queued', pending: 'queued' }[p.status] || 'idle';
  }
  function standInOf(p) {
    if (!p || !p.requestedModelId) return null;
    var failed = p.status === 'disabled' || !p.effectiveModelId;
    if (!failed && p.effectiveModelId === p.requestedModelId) return null;
    return S().pmxStandIn({ requested: modelShort(p.requestedModelName || p.requestedModelId), effective: failed ? '' : modelShort(p.effectiveModelName || p.effectiveModelId), reason: 'unavailable', noSubstitute: failed });
  }
  function markOf(run, p, size) {
    var si = standInOf(p);
    return S().pmxMark({ role: roleOf(p), seat: seatOf(run, p), size: size || 22, state: markState(p), standin: !!si && si.tone !== 'failed' });
  }

  function elapsed(run) {
    var a = ms(run.createdAt), b = run.completedAt ? ms(run.completedAt) : Date.now();
    return isFinite(a) && isFinite(b) ? Math.max(0, b - a) : 0;
  }
  /* the one sentence: COLLAB's sentenceOf when it exists ({word, reason}), else the 9.1 forms */
  function sentence(run) {
    var c = C(), st = present(run);
    if (c && typeof c.sentenceOf === 'function') {
      try { var s = c.sentenceOf(run); if (s && typeof s === 'object' && s.word) return { word: esc(s.word), reason: esc(s.reason || '') }; } catch (e) { }
    }
    var W = copy().status || {};
    if (st === 'waiting') return { word: esc(W.waitingToStart || 'Waiting to start'), reason: esc(c && c.waitingReason ? c.waitingReason(run) : '') };
    if (st === 'paused') return { word: esc(W.paused || 'Paused'), reason: 'nothing is lost.' };
    if (st === 'cancelled') return { word: esc(W.cancelled || 'Cancelled'), reason: 'everything so far is kept.' };
    if (st === 'failed') return { word: esc(W.failed || 'Failed'), reason: esc(run.blockedReason || 'it stopped before a clean result.') };
    if (st === 'needs') return { word: esc(W.needs || 'Needs attention'), reason: esc(run.blockedReason || 'a helper is waiting for you.') };
    if (finished(st)) return { word: 'Completed', reason: '' };
    if (run.kind === 'chat_room' && run.chatRoom) {
      var m = (run.config && run.config.maxRounds) || 0, n = run.chatRoom.roundsSoFar || 0;
      return { word: esc(fill(W.round || 'Round {n} of {m}', { n: Math.max(1, n), m: Math.max(m, n, 1) })), reason: 'the Moderator calls on each helper in turn.' };
    }
    var working = coreOf(run).filter(function (p) { return p.status === 'working'; }).map(function (p) { return esc(p.role); });
    var waiting = coreOf(run).filter(function (p) { return p.status === 'waiting' || p.status === 'pending'; }).map(function (p) { return esc(p.role); });
    var reason = working.length ? joinNames(working) + (working.length === 1 ? ' is working.' : ' are working.') : 'the team is between steps.';
    if (waiting.length) reason += ' ' + joinNames(waiting) + (waiting.length === 1 ? ' waits its turn.' : ' wait their turn.');
    return { word: esc(W.running || 'Running'), reason: reason };
  }
  function costText(run, state) {
    var c = C();
    if (c && c.card && typeof c.card.cost === 'function') { try { var k = c.card.cost(run); if (k) return k; } catch (e) { } }
    var u = run.usage || {}, lim = run.config && run.config.costLimitUsd;
    if (provenance(run) === 'recorded') return S().pmxCost({ state: 'recorded' });
    if (state === 'waiting') return S().pmxCost({ state: 'before' });
    if (u.not_measured) return S().pmxCost({ state: 'unknown' });
    return S().pmxCost({ state: finished(state) ? 'done' : 'running', spent: u.costUsd, limit: lim });
  }
  function timeText(run, state) {
    var c = C();
    if (c && c.card && typeof c.card.clock === 'function') { try { var k = c.card.clock(run); if (k) return k; } catch (e) { } }
    if (state === 'waiting') return copy().clockIdle || 'not started';
    return finished(state) ? S().pmxTime.worked(elapsed(run)) : S().pmxTime.clock(elapsed(run));
  }

  /* ================================================================ the head: status, actions, More row (G-12) */
  function statusHtml(run) {
    var st = present(run), s = sentence(run), mine = provenance(run) === 'wand';
    var parts = ['<b>' + s.word + '</b>'];
    if (st !== 'running' && s.reason) parts.push(s.reason);
    /* a waiting run has not started: its word says so, so no "not started" clock and no "started by you" (COLLAB step 3);
       only a run the user started from the wand says who started it (a seed or a recorded example did not come from you) */
    if (st === 'waiting') { if (mine) parts.push('set up by you'); }
    else { parts.push(esc(timeText(run, st))); if (mine) parts.push('started by you'); }
    parts.push(esc(costText(run, st)));
    return parts.join(' · ');
  }
  function btn(o) {
    var c = o.primary ? 'primary-button' : (o.icon ? 'icon-button' : 'text-button');
    return '<button type="button" class="' + c + ' pmx-act' + (o.cls ? ' ' + o.cls : '') + '"' + (o.action ? attr('data-action', o.action) : '') + (o.attrs ? ' ' + o.attrs : '') +
      (o.disabled ? ' disabled' : '') + (o.icon ? attr('aria-label', o.label) : '') + '>' + (o.glyph ? glyph(o.glyph, o.icon ? 16 : 14) : '') + (o.icon ? '' : '<span>' + o.label + '</span>') + '</button>';
  }
  function reasoned(button, reason) { return '<span class="collab-view-item">' + button + '<span class="pmx-reason">' + reason + '</span></span>'; }
  function headActions(run) {
    var st = present(run), v = vs(run.id), A = copy().actions || {}, out = '';
    if (st !== 'paused' && canPause(run, st)) out += btn({ action: 'collab-pause', attrs: runAttr(run), glyph: 'pause', label: esc(A.pause || 'Pause') });
    else if (st === 'paused') out += btn({ action: 'collab-resume', attrs: runAttr(run), glyph: 'play', label: esc(A.resume || 'Resume') });
    if (!finished(st)) out += btn({ action: 'collab-message', attrs: runAttr(run), label: esc(A.message || 'Message') });
    out += btn({ action: 'collab-view-toggle', attrs: runAttr(run) + ' data-part="more" aria-expanded="' + !!v.more + '"', icon: true, glyph: 'more', label: esc(A.more || 'More') });
    return out;
  }
  var CMD = { crew: 'cmd.collaboration.crew', review: 'cmd.review', brainstorm: 'cmd.brainstorm', chat_room: 'cmd.chat_room' };
  function techLine(run) {
    var bits = ['Run ' + esc(run.id), esc(CMD[run.kind] || 'cmd.collaboration') + '.* (no command registered in this preview)', 'status ' + esc(run.status)];
    if (run.config_fingerprint) bits.push('fingerprint ' + esc(String(run.config_fingerprint).slice(0, 12)));
    return bits.join(' · ');
  }
  function moreRow(run, kp) {
    var v = vs(run.id), st = present(run), A = copy().actions || {}, kw = KIND_WORD[run.kind] || 'run';
    if (!v.more) return '';
    if (v.confirm && canCancel(run, st)) {
      var CC = copy().cancelConfirm || {};
      return '<div class="collab-view-more" data-k="cv-more:' + esc(run.id) + '">' + S().pmxInlineConfirm({ key: 'cv-confirm:' + run.id,
        sentence: esc(fill(CC.sentence || 'Cancel this {kind}? Everything so far is kept.', { kind: kw })),
        confirm: { action: 'collab-cancel', attrs: runAttr(run), label: esc(fill(CC.confirm || 'Cancel {kind}', { kind: kw })), tone: 'soft' },
        keep: { action: 'collab-view-toggle', attrs: runAttr(run) + ' data-part="confirm"', label: esc(CC.keep || 'Keep going') } }) + '</div>';
    }
    var items = '';
    if (canCancel(run, st)) items += btn({ action: 'collab-view-toggle', attrs: runAttr(run) + ' data-part="confirm"', label: esc(fill(A.cancelKind || 'Cancel {kind}…', { kind: kw })) });
    if (kp && kp.more) items += kp.more;
    else if (run.kind === 'review' && finished(st) && !owned(run)) items += btn({ action: 'collab-review-run-again', attrs: runAttr(run), label: 'Run Another Review' });
    var frozen = !!(run.crew && run.crew.planBinding);
    var cfg = btn({ action: 'collab-open-configure', attrs: attr('data-kind', run.kind) + attr('data-reconfigure', run.id), disabled: frozen, label: esc(finished(st) ? (A.runAgain || 'Run again with changes…') : (A.changeSetup || 'Change setup…')) });
    items += frozen ? reasoned(cfg, 'This Crew builds one plan version. Cancel it first.') : cfg;
    items += reasoned(btn({ action: 'collab-export', attrs: runAttr(run) + ' data-failure="command_not_registered"', disabled: true, label: esc(A.download || 'Download transcript') }), esc(copy().notAvailable || 'Not available in this preview.'));
    if (finished(st)) items += reasoned(btn({ action: 'collab-message', attrs: runAttr(run), disabled: true, label: esc(A.message || 'Message') }),
      esc(fill(copy().finishedMessage || 'This {kind} has finished, so it can’t take messages. Ask the assistant instead.', { kind: kw })));
    items += btn({ action: 'collab-view-toggle', attrs: runAttr(run) + ' data-part="tech" aria-expanded="' + !!v.tech + '"', label: esc(A.technical || 'Technical details') });
    var tech = v.tech ? '<p class="pmx-fine collab-view-tech">' + techLine(run) + '</p>' : '';
    return '<div class="collab-view-more" data-k="cv-more:' + esc(run.id) + '"><div class="collab-view-more-row">' + items + '</div>' + tech + '</div>';
  }

  /* ================================================================ the plate: the run's cast, drawn by COLLAB's own plate
     COLLAB's plates are built from a draft; the run's core helpers make that draft, and only the full mode is
     kept (the view has room for it and no plate slot to fit). Crews of 4+ and failures show no plate. */
  function plateHtml(run) {
    var c = C(), fn = c && c.sheet && c.sheet.plateParts && c.sheet.plateParts[run.kind];
    if (typeof fn !== 'function') return '';
    var core = coreOf(run);
    if (!core.length || core.length > 3) return '';
    var specs = specialsOf(run);
    var d = {
      kind: run.kind, rows: core.map(function (p) { return { rowId: p.id, role: p.role, requestedModelId: p.requestedModelId, persona: p.requestedPersona || p.effectivePersona }; }),
      config: Object.assign({}, run.config || {}), wonderer: specs.some(function (p) { return specialKind(p) === 'wonderer'; }), grillMe: specs.some(function (p) { return specialKind(p) === 'grill'; }),
      purpose: run.purpose || '', name: run.title || '', mustHaves: '', specialistRoutes: {}, reviewTargetChoice: 'latest_changes'
    };
    var html = '';
    try { html = String(fn(d) || ''); } catch (e) { return ''; }
    var m = /<figure class="pmx-plate[^"]*"[^>]*data-mode="full"[\s\S]*?<\/figure>/.exec(html);
    if (!m) return '';
    return m[0].replace(/\sdata-collab-mirror="[^"]*"/g, '').replace(/\sdata-k="([^"]*)"/g, function (x, v) { return ' data-k="cv:' + v + '"'; });
  }

  /* ================================================================ Conversation (D3, G-06, G-33) */
  var SEEN = {}, FRESH = {}, STREAMS = {};
  var TYPE_WORD = { handoff: 'handed out the parts', warning: 'raised a concern', conflict: 'needs a decision', vote: 'voted', finding: 'reported a finding', request: 'asked', dependency: 'is waiting on another part' };
  var SYSTEM_NOTE = [[/^Paused\b/i, 'paused'], [/^Resumed\b/i, 'resumed'], [/^Cancell?ed\b/i, 'cancelled']];
  /* G-33: recorded protocol messages as people say them (display only; the data and planPayload are untouched) */
  var SAY = [
    [/^Independent proposal submitted\.?$/i, function () { return 'Drafted its idea without seeing the others’.'; }],
    [/^(\d+) independent proposals consolidated into (\d+) alternatives\. All origins retained\.?$/i, function (m) { return m[1] + ' ideas boiled down to ' + m[2] + ' options. Every original idea is kept.'; }],
    [/^support · (.+?) — (.+)$/i, function (m) { return 'Voted for ' + m[1] + ': ' + m[2]; }],
    [/^oppose · (.+?) — (.+)$/i, function (m) { return 'Voted against ' + m[1] + ': ' + m[2]; }],
    [/^Deep Plan ready\. (\d+) dissenting position\(s\) preserved\. No build has started\.?$/i, function (m) { return 'Plan ready. ' + plural(+m[1], 'disagreement', 'disagreements') + ' kept. Nothing has been built yet.'; }]
  ];
  function sayOf(body) {
    body = String(body || '');
    for (var i = 0; i < SAY.length; i++) { var m = SAY[i][0].exec(body.trim()); if (m) return SAY[i][1](m); }
    return body;
  }
  function systemText(m) {
    var N = copy().notes || {};
    for (var i = 0; i < SYSTEM_NOTE.length; i++) if (SYSTEM_NOTE[i][0].test(m.body || '')) return N[SYSTEM_NOTE[i][1]] || m.body;
    return m.body || '';
  }
  function participantById(run, pid) { var out = null; list(run.participants).forEach(function (p) { if (p.id === pid) out = p; }); return out; }
  function sender(run, m) {
    if (m.senderKind === 'user') return { who: 'You', mark: S().pmxMark({ role: 'you', size: 22 }) };
    if (m.senderKind === 'coordinator') return { who: run.kind === 'chat_room' ? 'Moderator' : 'Coordinator', mark: S().pmxMark({ role: 'lead', size: 22 }) };
    var p = null;
    list(run.participants).forEach(function (q) { if (!p && (q.id === m.senderId || (!m.senderId && q.name === m.senderName))) p = q; });
    return { who: esc(p ? p.role : (m.senderName || 'Helper')), mark: p ? markOf(run, p, 22) : S().pmxMark({ role: 'helper', size: 22 }) };
  }
  function whenOf(run, m) {
    var a = ms(run.createdAt), b = ms(m.createdAt);
    var t = isFinite(a) && isFinite(b) ? S().pmxTime.clock(Math.max(0, b - a)) : '';
    return esc([t, TYPE_WORD[m.messageType]].filter(Boolean).join(' · '));
  }
  function plainOf(text) { return String(text || '').replace(/```[\s\S]*?```/g, ' ').replace(/[*_`#>|]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function reduced() { var P = PMX(); return !!(P && P.reduced && P.reduced()); }
  /* The first render of a run's view takes every message that exists as read. A message that appears later is
     fresh (one highlight wash, M4) and, on a live run's Conversation, streams in first. */
  function noteSeen(run, msgs, streamable) {
    var seen = SEEN[run.id], t = nowMs();
    if (!seen) { seen = SEEN[run.id] = {}; msgs.forEach(function (m) { seen[m.id] = 1; }); return; }
    msgs.forEach(function (m) {
      if (seen[m.id]) return;
      seen[m.id] = 1; FRESH[m.id] = t;
      if (streamable && m.senderKind !== 'system' && m.senderKind !== 'user' && !reduced()) STREAMS[m.id] = { text: plainOf(sayOf(m.body)), done: false, started: false };
    });
  }
  function entryOf(run, m, o) {
    o = o || {};
    var key = (o.keyPrefix || 'collab-msg-') + m.id;
    if (m.senderKind === 'system') return { key: key, mid: m.id, kind: 'system', cls: o.cls, bodyHtml: esc(systemText(m)) };
    var s = sender(run, m), st = STREAMS[m.id], t = nowMs();
    /* E-31: stop, pause, a failed helper or one that abstained end the stream at once. The message was written in full,
       so it lands whole (the same one-time swap as a stream that ran out); a partial is never shown as its words */
    if (st && !st.done && streamEnded(run, m)) settleStream(st);
    var streaming = !!(st && !st.done && o.stream);
    var fresh = FRESH[m.id] && t - FRESH[m.id] < 1400, swap = st && st.done && st.doneAt && t - st.doneAt < 600;
    return { key: key, mid: m.id, cls: o.cls, markHtml: s.mark, who: s.who, when: whenOf(run, m) + (streaming ? ' · writing now' : ''),
      attrs: (fresh ? 'data-cv-fresh="1"' : '') + (swap ? ' data-cv-swap="1"' : ''), streaming: streaming,
      bodyHtml: streaming ? '<p></p>' : S().pmxMd(sayOf(m.body), { mode: 'full' }) };
  }
  function streamEnded(run, m) {
    if (!flowing(present(run)) || reduced()) return true;
    var p = m.senderId ? participantById(run, m.senderId) : null;
    return !!(p && (p.status === 'failed' || p.status === 'disabled' || (p.outcome && p.outcome !== 'completed')));
  }
  function filterButton(run) {
    var v = vs(run.id), p = v.filter !== 'all' ? participantById(run, v.filter) : null;
    return S().pickerButton({ action: 'collab-view-filter', anchor: 'cv-filter-' + run.id, strong: p ? 'Showing ' + esc(p.role) : 'Showing everyone', extra: runAttr(run).trim() });
  }
  function ownMessages(run, p) {
    return list(run.messages).filter(function (m) {
      return m.senderId === p.id || (!m.senderId && m.senderKind === 'participant' && m.senderName === p.name) || (m.senderKind === 'user' && list(m.recipientIds).indexOf(p.id) >= 0);
    });
  }
  function conversation(run) {
    var v = vs(run.id), p = v.filter !== 'all' ? participantById(run, v.filter) : null;
    var msgs = p ? ownMessages(run, p) : list(run.messages);
    var entries = msgs.map(function (m) { return entryOf(run, m, { stream: true }); });
    var empty = entries.length ? '' : '<p class="collab-view-empty">' + (p ? esc(fill((copy().participant || {}).empty || 'Nothing from {name} yet.', { name: p.role })) : 'Nothing has been said yet.') + '</p>';
    return S().pmxTimeline({ key: 'cv-timeline:' + run.id, cls: 'collab-view-timeline', filterHtml: filterButton(run), entries: entries }) + empty;
  }

  /* ================================================================ Team (D4, G-17, G-30) */
  function outcomeOf(p) {
    var O = copy().outcome || {}, out = helperWord(p);
    if (p.outcome && p.outcome !== 'completed') out = ({ timed_out: O.timedOut, unavailable: O.unavailable, canceled: O.canceled }[p.outcome]) || out;
    if (specialKind(p) && p.status !== 'done') out = O.optional || 'Optional';
    return out;
  }
  function teamRow(run, p) {
    var route = esc(modelShort(p.effectiveModelName || p.requestedModelName)) + ' · ' + esc(p.effectivePersona || p.requestedPersona || '');
    return S().pmxTeamRow({ key: 'collab-p-' + p.id, cls: 'collab-participant', kind: run.kind, attrs: (runAttr(run) + attr('data-participant', p.id)).trim(),
      markHtml: markOf(run, p, 22), name: esc(p.role), route: route, standIn: standInOf(p), outcome: esc(outcomeOf(p)), cost: '' });
  }
  function team(run) {
    var core = coreOf(run), specs = specialsOf(run);
    var lead = run.kind === 'chat_room' ? ' · a Moderator calls on them' : run.kind === 'review' ? ' · each reads on its own' : ' · a Coordinator hands out the work';
    var html = S().pmxViewSection({ key: 'cv-core:' + run.id, title: run.kind === 'review' ? 'The reviewers' : 'Core team', meta: esc(helperNoun(run, core.length)) + lead,
      body: '<div class="collab-view-team">' + core.map(function (p) { return teamRow(run, p); }).join('') + '</div>' });
    if (specs.length) html += S().pmxViewSection({ key: 'cv-specs:' + run.id, cls: 'collab-view-specs', title: 'Specialists', meta: 'they never replace a helper, and their work isn’t counted as the team’s',
      body: '<div class="collab-view-team">' + specs.map(function (p) { return teamRow(run, p); }).join('') + '</div>' });
    return html;
  }

  /* ================================================================ Cost */
  function cost(run) {
    var st = present(run), u = run.usage || {}, cfg = run.config || {};
    var tokens = (Number(u.inputTokens) || 0) + (Number(u.outputTokens) || 0);
    var body = '<p class="collab-view-figure"><b>' + esc(costText(run, st)) + '</b>' + (tokens ? ' · ' + S().pmxTokens(tokens, { key: 'cv-tokens:' + run.id }) : '') + '</p>';
    if (tokens) body += '<p class="pmx-fine collab-view-help">' + esc(copy().tokensHover || 'Tokens measure AI use, roughly ¾ of a word each.') + ' It read about ' + esc(S().pmxTokens(u.inputTokens, { plain: true })) + ' and wrote about ' + esc(S().pmxTokens(u.outputTokens, { plain: true })) + '.</p>';
    var lim = [];
    if (Number(cfg.costLimitUsd) > 0) lim.push('It stops at ' + esc(S().pmxMoney(cfg.costLimitUsd)));
    if (Number(cfg.timeLimitMinutes) > 0) lim.push((lim.length ? 'or after ' : 'It stops after ') + esc(cfg.timeLimitMinutes) + ' min');
    var limits = lim.length ? S().pmxViewSection({ key: 'cv-limits:' + run.id, title: 'Your limit', body: '<p class="collab-view-line">' + lim.join(' ') + ', and keeps everything made so far.</p>' }) : '';
    var who = list(run.participants).map(function (p) {
      return '<li data-k="cv-cost:' + esc(p.id) + '">' + markOf(run, p, 18) + '<span><b>' + esc(p.role) + '</b><small>' + esc(modelShort(p.effectiveModelName || p.requestedModelName)) +
        (p.requestedProviderId ? ' · ' + esc(p.requestedProviderId) : '') + '</small></span></li>';
    }).join('');
    return S().pmxViewSection({ key: 'cv-spent:' + run.id, title: 'What it cost', meta: esc(timeText(run, st)), body: body }) + limits +
      S().pmxViewSection({ key: 'cv-payers:' + run.id, title: 'Who used what', meta: 'this preview doesn’t split the cost by ' + (run.kind === 'review' ? 'reviewer' : 'helper'), body: '<ul class="collab-view-lines">' + who + '</ul>' });
  }

  /* ================================================================ Summary: the generic overview and the legacy adapter (A1-50, G-15)
     A run a kind module owns is summarised from the common data, with a way into its own document. Seed and
     legacy runs (no protocol owner) also show their kind's record from run.* with the G-15 hooks. */
  var OPEN_KIND = { crew: ['crew-open-work', 'Open the Crew’s work'], review: ['review-open-report', 'Open the report'], brainstorm: ['brainstorm-open-results', 'Open how they decided'], chat_room: ['room-open-discussion', 'Open the discussion'] };
  function summary(run) {
    var html = '', st = present(run), isOwned = owned(run);
    if (isOwned && OPEN_KIND[run.kind]) {
      html += '<div class="collab-view-doc">' + glyph('file', 15) + '<p>The whole ' + esc(KIND_WORD[run.kind]) + ' record, with its evidence, has its own page.</p>' +
        btn({ action: OPEN_KIND[run.kind][0], attrs: runAttr(run), label: esc(OPEN_KIND[run.kind][1]) }) + '</div>';
    }
    if (run.purpose) html += S().pmxViewSection({ key: 'cv-job:' + run.id, title: 'The job', body: S().pmxMd(run.purpose, { mode: 'full' }) });
    html += S().pmxViewSection({ key: 'cv-team:' + run.id, title: run.kind === 'review' ? 'The reviewers' : 'The team', meta: esc(helperNoun(run, coreOf(run).length)),
      body: '<div class="collab-view-team">' + list(run.participants).map(function (p) {
        return S().pmxTeamRow({ key: 'cv-who:' + p.id, cls: 'collab-view-who', kind: run.kind, size: 's', attrs: (runAttr(run) + attr('data-participant', p.id)).trim(), markHtml: markOf(run, p, 18),
          name: esc(p.role), route: p.current ? esc(p.current) : '', outcome: esc(outcomeOf(p)), cost: '' });
      }).join('') + '</div>' });
    if (!isOwned) html += legacy(run, st);
    var msgs = list(run.messages).filter(function (m) { return m.senderKind !== 'system'; }).slice(-3);
    if (msgs.length) html += S().pmxViewSection({ key: 'cv-now:' + run.id, title: 'As it happens', meta: 'the latest ' + plural(msgs.length, 'message', 'messages'),
      body: S().pmxTimeline({ key: 'cv-latest:' + run.id, entries: msgs.map(function (m) { return entryOf(run, m, { keyPrefix: 'cv-latest:' }); }) }) });
    return html;
  }
  function legacy(run, st) {
    if (run.kind === 'crew') return legacyCrew(run);
    if (run.kind === 'review') return legacyReview(run, st);
    if (run.kind === 'brainstorm') return legacyBrainstorm(run, st);
    return '';
  }
  var PART_STATE = { done: 'Checked', pending: 'Waits its turn', working: 'Working', blocked: 'Needs your OK', failed: 'Didn’t finish' };
  function legacyCrew(run) {
    var c = run.crew || {};
    var asg = list(c.assignments);
    /* a plan-bound Crew keeps COLLAB's own block (.plan-crew-summary / -assignment / -participant-work, b18c) once
       COLLAB exports it as PM56_COLLAB.planCrewHtml(ctx, run) */
    if (c.planBinding) {
      var pc = C() && C().planCrewHtml;
      if (typeof pc !== 'function') return '';
      try { return S().pmxViewSection({ key: 'cv-plancrew:' + run.id, title: 'The plan', body: String(pc(EXT.ctx(), run) || '') }); } catch (e) { return ''; }
    }
    if (!asg.length) return '';
    var byId = {}; asg.forEach(function (a, i) { byId[a.id] = i + 1; });
    var rows = asg.map(function (a, i) {
      var after = list(a.dependsOn).map(function (d) { return byId[d] ? String(byId[d]) : esc(d); });
      var act = a.status !== 'done' ? btn({ action: 'collab-crew-complete', attrs: (runAttr(run) + attr('data-assignment', a.id)).trim(), label: 'Mark as done…' }) : '';
      return '<li data-k="collab-a-' + esc(a.id) + '"><span class="collab-view-part"><b>' + (i + 1) + '. ' + esc(a.title) + '</b>' +
        '<small>' + esc(a.assignedRole) + ' · ' + (after.length ? 'starts after part ' + joinNames(after) : 'can start right away') + ' · <span class="collab-view-state" data-state="' + esc(a.status) + '">' + esc(PART_STATE[a.status] || a.status) + '</span></small>' +
        '<small><b>Done when:</b> ' + esc(a.expectedOutput) + '</small>' + (a.status === 'done' && a.evidenceNote ? '<small><b>Proof:</b> ' + esc(a.evidenceNote) + '</small>' : '') + act + '</span></li>';
    }).join('');
    var bound = c.boundPlanId ? '<p class="collab-view-line">Builds the plan ' + esc(c.boundPlanId) + ', version ' + esc(c.boundPlanVersion) + '. To change the plan, stop the Crew first.</p>' : '';
    var done = asg.filter(function (a) { return a.status === 'done'; }).length;
    return S().pmxViewSection({ key: 'cv-plan:' + run.id, title: 'The plan', meta: done + ' of ' + plural(asg.length, 'part', 'parts') + ' checked',
      body: bound + '<ol class="collab-view-lines collab-view-parts">' + rows + '</ol>' +
        '<p class="pmx-fine collab-view-help">Mark as done asks what shows it’s finished, for example “tests pass: 42/42”. A command just running isn’t proof.</p>' });
  }
  var DISP_KEY = { confirmed: 'confirmed', uncertain: 'unsure', rejected: 'rejected', duplicate: 'duplicate' };
  function legacyReview(run, st) {
    var r = run.review || {}, pack = r.targetPack || {}, hash = (pack.targetHashes && pack.targetHashes.primary) || '';
    var sel = (C() && C().selectedFindings) ? C().selectedFindings(run.id) : {};
    var D = copy().disposition || {};
    var findings = list(r.findings);
    var toFix = findings.filter(function (f) { return f.disposition === 'confirmed' && f.severity !== 'suggestion'; }).length;
    var unsure = findings.filter(function (f) { return f.disposition === 'uncertain'; }).length;
    var rows = findings.map(function (f, i) {
      var confirmed = f.disposition === 'confirmed';
      var dword = (D[DISP_KEY[f.disposition]] || [f.disposition])[0];
      return S().pmxFinding({ key: 'collab-f-' + f.id, cls: 'collab-finding', n: i + 1, severity: S().pmxSeverity(f.severity), disposition: esc(dword),
        box: { attrs: 'data-action="collab-review-toggle-finding"' + runAttr(run) + attr('data-finding', f.id) + (confirmed ? '' : attr('data-hover-key', 'cv-unsure:' + f.id) + attr('data-hover-tip', 'Only confirmed findings can become To-Dos.')),
          checked: !!sel[f.id] || !!f.convertedToTodo, disabled: !confirmed || !!f.convertedToTodo },
        claim: esc(f.claim), why: f.dissent ? '<b>Still disagrees:</b> ' + esc(f.dissent) : (f.proposedRemediation ? '<b>Suggested fix:</b> ' + esc(f.proposedRemediation) : ''),
        todo: f.convertedToTodo ? glyph('check', 13) + 'To-Do created' : '' });
    }).join('');
    var excluded = list(r.excludedFindings).map(function (x) {
      return '<div class="collab-finding collab-excluded" data-k="collab-fx-' + esc(x.id) + '"><p class="collab-view-line"><b>Set aside:</b> this reviewer saw an older version of the file.</p>' +
        '<p class="collab-view-quote">' + esc(x.claim) + '</p><p class="pmx-fine">Technical details · different frozen pack · ' + esc(x.targetHash) + ' vs ' + esc(hash) + '</p></div>';
    }).join('');
    var anySel = findings.some(function (f) { return sel[f.id] && !f.convertedToTodo; });
    var follow = '<div class="collab-view-acts">' +
      btn({ action: 'collab-review-create-todos', attrs: runAttr(run), disabled: !anySel, label: 'Create To-Dos' }) +
      btn({ action: 'collab-review-send-findings', attrs: runAttr(run), disabled: !anySel, label: 'Send Findings To Agent' }) + '</div>' +
      '<p class="pmx-fine collab-view-help">' + (anySel ? 'Only ticked findings. Nothing is fixed for you.' : 'Tick the confirmed findings you want to act on first.') + '</p>';
    var target = '<div class="collab-targetpack collab-view-target" data-k="collab-targetpack"><p class="collab-view-line">Reviewed: ' + esc(pack.targetKind === 'changes' ? 'your latest changes' : (pack.targetKind || 'the snapshot')) +
      (pack.frozenAt ? ' · snapshot ' + esc(S().pmxTime.at(pack.frozenAt, null, { day: false })) : '') + '</p><p class="pmx-fine">Technical details · snapshot ' + esc(hash) + '</p></div>';
    return S().pmxViewSection({ key: 'cv-found:' + run.id, title: 'What they found', meta: esc(toFix + ' to fix · ' + unsure + ' unsure'), body: target + S().pmxFindings(rows, { key: 'cv-findings:' + run.id }) + follow }) +
      (excluded ? S().pmxViewSection({ key: 'cv-setaside:' + run.id, title: 'Set aside', body: excluded }) : '') +
      '<p class="collab-readonly-note collab-view-line">' + glyph('lock', 13) + '<span>Review never changes your files and never auto-repairs.</span></p>';
  }
  function legacyBrainstorm(run, st) {
    var b = run.brainstorm || {}, qb = b.questionBank || {};
    var eff = (qb.baselineLimit || 0) + (qb.grillMeEnabled ? (qb.grillExtension || 0) : 0);
    var qLine = qb.grillMeEnabled ? 'Maximum questions: ' + eff + ' (' + qb.baselineLimit + ' + Grill Me ' + qb.grillExtension + ')' : 'Maximum questions: ' + qb.baselineLimit;
    var asked = list(qb.askedIds).length;
    var questions = '<p class="collab-qmax collab-view-line" data-k="collab-qmax">' + esc(qLine) + '</p>' +
      '<p class="pmx-fine collab-view-help">' + asked + ' of ' + eff + ' asked so far. The team asks you only what research can’t answer.</p>' +
      S().pmxCheck({ key: 'cv-grill:' + run.id, cls: 'collab-view-check', attrs: ('data-action="collab-brainstorm-toggle-grill"' + runAttr(run)), checked: !!qb.grillMeEnabled, disabled: finished(st),
        label: 'Grill Me', helper: 'Allow up to ' + (qb.grillExtension || 25) + ' more questions. The ' + asked + ' already asked still count.' });
    var props = list(b.proposals), votes = list(b.votes), parts = list(run.participants);
    function pOf(role) { var out = null; parts.forEach(function (p) { if (p.role === role) out = p; }); return out; }
    var CONF = { high: 3, medium: 2, low: 1 };
    var options = props.map(function (pr) {
      var backers = votes.filter(function (v) { return v.proposalId === pr.id && v.position === 'support'; });
      return { key: 'cv-opt:' + pr.id, title: esc(pr.participantRole) + '’s idea', count: plural(backers.length, 'vote', 'votes') + ' for',
        backers: backers.map(function (v) { var p = pOf(v.participantRole); return { key: 'collab-vote-' + v.id, markHtml: p ? markOf(run, p, 18) : '', conf: CONF[v.confidence] || 2 }; }) };
    });
    var won = specialsOf(run).filter(function (p) { return specialKind(p) === 'wonderer'; })[0];
    var board = options.length ? S().pmxVoteBoard({ key: 'cv-votes:' + run.id, options: options, abstained: won ? markOf(run, won, 18) : '' }) : '';
    var voteRows = votes.map(function (v) {
      var pr = props.filter(function (x) { return x.id === v.proposalId; })[0];
      return '<li data-k="cv-vote-row:' + esc(v.id) + '"><span><b>' + esc(v.participantRole) + '</b> ' + (v.position === 'support' ? 'voted for ' : v.position === 'oppose' ? 'voted against ' : 'abstained on ') +
        esc(pr ? pr.participantRole + '’s idea' : v.proposalId) + ' (' + (v.confidence === 'high' ? 'very sure' : v.confidence === 'low' ? 'not sure' : 'fairly sure') + ')<small>' + esc(v.reason) + '</small></span></li>';
    }).join('');
    var ruled = list(b.hardConstraintViolations).map(function (h, i) {
      return '<div class="collab-hardconflict collab-view-ruled" data-k="' + (i ? 'collab-hc-' + i : 'collab-hc') + '">' + glyph('not', 14) + '<p><s>' + esc(h.approach) + '</s> is ruled out: it breaks your rule “' + esc(h.constraint) + '”. Votes can’t override a rule.' +
        '<small class="pmx-fine">Technical details · Disqualified regardless of vote count</small></p></div>';
    }).join('');
    var dissent = list(b.dissent).map(function (d, i) {
      return S().pmxQuote({ key: i ? 'collab-dissent-' + i : 'collab-dissent', cls: 'collab-dissent', text: esc(d.reason), who: esc(d.participantRole), note: 'still disagrees' });
    }).join('');
    var leads = list(b.wondererLeads).map(function (w) {
      return '<li data-k="collab-lead-' + esc(w.id) + '"><span><b>' + esc(w.lead) + '</b>' + (w.seed ? '<small>Relates to: ' + esc(w.seed) + '</small>' : '') +
        '<small>Why it matters: ' + esc(w.tether || w.connection || '') + '</small></span></li>';
    }).join('');
    var synth = b.synthesis ? '<p class="collab-view-line">The plan summary is ready, but this example can’t create the plan document yet.</p>' + S().pmxMd(b.synthesis.summary || '', { mode: 'full' })
      : '<div class="collab-view-acts">' + btn({ action: 'collab-brainstorm-synthesize', attrs: runAttr(run), primary: true, disabled: b.phase !== 'vote' || finished(st), label: 'Write the plan' }) +
        (b.phase === 'debate' && !finished(st) ? btn({ action: 'collab-brainstorm-next-round', attrs: runAttr(run), label: 'One more debate round' }) : '') + '</div>' +
        '<p class="pmx-fine collab-view-help">' + (b.phase === 'vote' ? 'Writes one plan from the winning idea. Disagreements and ruled-out ideas stay in it.' : 'Available once the votes are in.') + '</p>';
    return S().pmxViewSection({ key: 'cv-qs:' + run.id, title: 'Questions for you', body: questions }) +
      ((board || voteRows || ruled) ? S().pmxViewSection({ key: 'cv-vote:' + run.id, title: 'The vote', meta: plural(votes.length, 'vote', 'votes') + ' in · a rule always wins',
        body: board + (voteRows ? '<ul class="collab-view-lines collab-view-votes">' + voteRows + '</ul>' : '') + ruled }) : '') +
      (dissent ? S().pmxViewSection({ key: 'cv-dissent:' + run.id, title: 'Still disagrees', body: dissent }) : '') +
      (leads ? S().pmxViewSection({ key: 'cv-leads:' + run.id, title: 'Wonderer’s ideas', meta: 'hypotheses, not checked yet', body: '<ul class="collab-view-lines">' + leads + '</ul>' }) : '') +
      S().pmxViewSection({ key: 'cv-synth:' + run.id, title: 'The plan', body: synth });
  }
  /* Chat Room (legacy) Discussion: the room controls and Promote to above the conversation (G-15, G-16) */
  function roomExtras(run, st) {
    if (owned(run) || !run.chatRoom) return '';
    var c = run.chatRoom, maxR = (run.config && run.config.maxRounds) || 0, lastCoord = null;
    list(run.messages).forEach(function (m) { if (m.senderKind === 'coordinator') lastCoord = m; });
    var acts = '<div class="collab-view-acts">' +
      btn({ action: 'collab-room-next-round', attrs: runAttr(run), disabled: (c.roundsSoFar || 0) >= maxR || finished(st), label: 'Next Round (' + Math.min(maxR, (c.roundsSoFar || 0) + 1) + ' of ' + maxR + ')' }) +
      btn({ action: 'collab-room-summarize', attrs: runAttr(run), disabled: finished(st), label: 'Summarize Now' }) + '</div>' +
      '<p class="pmx-fine collab-view-help">Next Round: each helper speaks once more. Summarize Now: the Moderator writes where everyone agrees, where they differ, and what’s still open.</p>';
    var promote = lastCoord ? '<div class="collab-view-promote" data-k="collab-promote-row-' + esc(run.id) + '"><div class="collab-view-acts"><span class="collab-view-label">Promote to</span>' +
      ['todo', 'plan', 'goal'].map(function (t) { return btn({ action: 'collab-room-promote', attrs: (runAttr(run) + attr('data-target', t) + attr('data-message', lastCoord.id)).trim(), label: { todo: 'To-Do', plan: 'Plan', goal: 'Goal' }[t] }); }).join('') + '</div>' +
      '<p class="pmx-fine collab-view-help">Uses the Moderator’s latest wrap-up and keeps a link back to it.</p></div>' : '';
    var promos = list(c.promotions).map(function (p) {
      return '<p class="collab-view-line" data-k="collab-promo-' + esc(p.id) + '">' + glyph('check', 13) + '<span>Promoted to ' + esc({ todo: 'To-Do', plan: 'Plan', goal: 'Goal' }[p.target] || p.target) + ' · ' + esc(p.summary) + '</span></p>';
    }).join('');
    return S().pmxViewSection({ key: 'cv-room:' + run.id, title: 'Keep it going', meta: 'nothing becomes a To-Do until you promote it', body: acts + promote + promos });
  }

  /* ================================================================ the aside: the figures */
  function aside(run) {
    var st = present(run), cfg = run.config || {}, items = [];
    items.push('<p><b>' + esc(costText(run, st)) + '</b></p>');
    var n = coreOf(run).length, sp = specialsOf(run).length;
    items.push('<p><b>' + esc(helperNoun(run, n)) + '</b>' + (sp ? ' and ' + plural(sp, 'specialist', 'specialists') : '') + '</p>');
    var clamp = run.kind === 'crew' && run.crew && S().pmxClamp ? S().pmxClamp({ asked: cfg.parallelism, runs: run.crew.effectiveConcurrency, planBound: !!run.crew.planBinding }) : null;
    if (clamp) items.push('<p>' + esc(clamp.card) + '</p>');
    list(run.participants).forEach(function (p) { var si = standInOf(p); if (si) items.push('<p>' + (si.tone === 'failed' ? si.failed : si.card) + '</p>'); });
    items.push('<p class="pmx-fine">' + (run.kind === 'review' ? 'Reviewers only read. They can’t change your files.' : 'Helpers can’t do more than this chat: same tools and Skills, and it asks first.') + '</p>');
    return '<div class="collab-view-figures" data-k="cv-figures:' + esc(run.id) + '">' + items.join('') + '</div>';
  }

  /* ================================================================ the participant view (D5, 7.9) */
  function participantView(run, p) {
    var st = present(run), msgs = ownMessages(run, p), kw = KIND_WORD[run.kind] || 'run';
    noteSeen(run, list(run.messages), flowing(st));
    var entries = msgs.map(function (m) { return entryOf(run, m, { stream: true, cls: 'collab-msg' }); });
    var msgBtn = btn({ action: 'collab-message', attrs: (runAttr(run) + attr('data-participant', p.id)).trim(), disabled: finished(st), label: 'Message ' + esc(p.role) });
    var head = '<p class="collab-view-pstate">' + markOf(run, p, 18) + '<span><b>' + esc(helperWord(p)) + '</b>' + (p.current ? ' · ' + esc(p.current) : '') + '</span></p>' +
      '<p class="pmx-fine collab-view-pmodel">' + esc(modelShort(p.effectiveModelName || p.requestedModelName)) + ' · ' + esc(p.effectivePersona || p.requestedPersona || '') + '</p>' +
      /* 7.4 / 7.9: a helper waiting for your OK is answered in the chat card (Allow once · Don't allow), never here */
      (p.status === 'blocked' ? '<p class="collab-view-answer">' + S().pmxGlyph('warn', 14) + '<span><b>' + esc(p.role) + ' needs your OK.</b> ' + (p.blockedReason ? esc(String(p.blockedReason).replace(/\.?$/, '.')) + ' ' : '') + 'Answer in the chat card: Allow once or Don’t allow.</span></p>' : '') +
      '<div class="collab-view-acts">' + (finished(st) ? reasoned(msgBtn, esc(fill(copy().finishedMessage || 'This {kind} has finished, so it can’t take messages. Ask the assistant instead.', { kind: kw }))) : msgBtn) + '</div>';
    var pcp = run.crew && run.crew.planBinding && C() && C().planCrewParticipantHtml;
    if (typeof pcp === 'function') { try { head += String(pcp(run, p) || ''); } catch (e) { } }
    return S().pmxParticipant({ key: 'collab-pv-' + p.id, kind: run.kind, role: esc(p.role), standIn: standInOf(p), headHtml: head,
      messagesHtml: entries.length ? S().pmxTimeline({ key: 'cv-own:' + p.id, entries: entries }) : '',
      emptyText: esc(fill((copy().participant || {}).empty || 'Nothing from {name} yet.', { name: p.role })) });
  }

  /* ================================================================ generic parts and the frame */
  function tabItems(run) {
    var msgs = list(run.messages).filter(function (m) { return m.senderKind !== 'system'; }).length;
    var items = [
      { value: 'overview', label: OVERVIEW_WORD[run.kind] || 'Summary' },
      { value: 'transcript', label: 'Conversation', count: msgs || '' },
      { value: 'participants', label: 'Team', count: list(run.participants).length || '' },
      { value: 'usage', label: 'Cost' }
    ];
    if (run.kind === 'chat_room') { items.shift(); items[0].label = 'Discussion'; }
    return items;
  }
  function tabOf(run, v) {
    var t = TAB_KEYS.indexOf(v.tab) >= 0 ? v.tab : 'overview';
    if (run.kind === 'chat_room' && t === 'overview') t = 'transcript';
    return t;
  }
  function common(run, tab) {
    var st = present(run);
    if (tab === 'transcript') { noteSeen(run, list(run.messages), flowing(st)); return roomExtras(run, st) + conversation(run); }
    if (tab === 'participants') return team(run);
    if (tab === 'usage') return cost(run);
    noteSeen(run, list(run.messages), false);
    return summary(run);
  }
  function genericParts(run, tab) {
    return { title: esc(run.title), kindWord: esc(kindWord(run)), mark: S().pmxKindMark(run.kind, 20), status: statusHtml(run), actions: headActions(run),
      plate: plateHtml(run), tabs: tabItems(run), main: common(run, tab), aside: aside(run), cls: '', attrs: '' };
  }
  function merged(run, tab, ctx) {
    var g = genericParts(run, tab), m = kindModule(run.kind), kp = null;
    if (m && typeof m.viewParts === 'function') {
      try { kp = m.viewParts(run, tab, ctx, g) || null; } catch (e) { try { console.info('PM56_COLLAB_VIEW: ' + run.kind + ' viewParts threw', e); } catch (x) { } kp = null; }
    }
    var out = {};
    Object.keys(g).forEach(function (key) { out[key] = g[key]; });
    if (kp) Object.keys(kp).forEach(function (key) { if (kp[key] !== undefined) out[key] = kp[key]; });
    out._kind = kp;
    return out;
  }
  function render(ctx, runOrId, o) {
    o = o || {};
    var run = typeof runOrId === 'string' ? findRun(runOrId) : runOrId;
    if (!run) return '<article class="pmx-view collab-view" data-k="collab-view:missing"><header class="pmx-view-head drawer-head"><strong class="pmx-view-title">This run is no longer here</strong>' +
      '<p class="pmx-view-status">It was cleared when the demo was reset. Nothing else changed.</p></header></article>';
    var v = vs(run.id), tab = tabOf(run, v);
    var p = v.participantId ? participantById(run, v.participantId) : null;
    var parts = merged(run, p ? 'participants' : tab, ctx);
    var tabsHtml = Array.isArray(parts.tabs)
      ? S().pmxTabs({ key: 'cv-tabs:' + run.id, cls: 'collab-view-tabs', current: p ? 'participants' : tab, action: 'collab-panel-tab', attr: 'data-tab',
        items: parts.tabs.map(function (it) { return { value: it.value, label: it.label, count: it.count, attrs: runAttr(run).trim() + (it.attrs ? ' ' + it.attrs : '') }; }) })
      : String(parts.tabs || '');
    var main = p ? (parts._kind && parts._kind.participant !== undefined ? parts._kind.participant : participantView(run, p)) : parts.main;
    var pane = '<div class="collab-view-pane" data-k="cv-pane:' + esc(run.id) + ':' + (p ? 'p:' + esc(p.id) : tab) + '">' + main + '</div>';
    var plate = parts.plate ? '<figure class="pmx-view-plate collab-view-plate" data-k="cv-plate:' + esc(run.id) + '">' + parts.plate + '</figure>' : '';
    return S().pmxView({ key: 'collab-view:' + run.id, kind: run.kind, cls: 'collab-view collab-panel' + (parts.cls ? ' ' + parts.cls : '') + (o.cls ? ' ' + o.cls : ''),
      attrs: (attr('data-collab-view', run.id) + attr('data-state', present(run)) + (parts.attrs ? ' ' + parts.attrs : '') + (o.attrs ? ' ' + o.attrs : '')).trim(),
      markHtml: parts.mark, kindWord: parts.kindWord, title: parts.title, statusHtml: parts.status, actionsHtml: parts.actions,
      plateHtml: '', tabsHtml: moreRow(run, parts._kind) + plate + tabsHtml, mainHtml: pane, asideHtml: parts.aside });
  }

  /* ================================================================ opening it */
  function docIdOf(runId) { return PREFIX + runId; }
  function open(runId, o) {
    o = o || {};
    var run = findRun(runId), ctx = EXT.ctx && EXT.ctx();
    if (!run || !ctx) return false;
    var v = vs(run.id);
    if (o.tab && TAB_KEYS.indexOf(o.tab) >= 0) v.tab = o.tab;
    v.participantId = o.participantId || null;
    if (v.participantId) v.tab = 'participants';
    v.confirm = false;
    if (ctx.closeMenu) ctx.closeMenu();
    ctx.state.editorRevealed = true;
    ctx.openEditor(o.docId || docIdOf(run.id));
    return true;
  }
  function runIdOfDoc(id) { id = String(id || ''); return id.indexOf(PREFIX) === 0 ? id.slice(PREFIX.length) : null; }
  function viewRunOf(el) {
    var root = el && el.closest ? el.closest('[data-collab-view]') : null;
    return root ? root.getAttribute('data-collab-view') : null;
  }

  EXT.slot('editorTabLabel', function (c) {
    var id = runIdOfDoc(c && c.editorId); if (!id) return '';
    var run = findRun(id); if (!run) return 'Run';
    var t = String(run.title || '');
    return /^(Crew|BrainStorm|Chat Room|Review|Multi-Pass Review|Single Agent Review)\b/.test(t) ? t : (KIND_WORD[run.kind] || 'Run') + ' · ' + t;
  });
  EXT.slot('editorDocument', function (c) {
    var id = runIdOfDoc(c && c.editorId); if (!id) return '';
    return render(c, id);
  });

  /* ================================================================ actions
     The panel actions keep their names (MUST-KEEP B.5). This file extends them with chainAction for buttons
     inside a docked view (a later registrant runs first; returning false falls through to COLLAB's handler),
     so the centred panel keeps working until COLLAB wires Open Panel here. With PM56_COLLAB_VIEW.routeAll
     set to true, collab-open-panel and collab-open-participant from anywhere (a card lane, a receipt) open
     the docked view too, except for runs a kind module owns (it keeps its own document) and Activity rows. */
  function chain(name, fn) { if (typeof EXT.chainAction === 'function') EXT.chainAction(name, fn); else EXT.action(name, fn); }
  function reRender(ctx) { var c = ctx || (EXT.ctx && EXT.ctx()); if (c && c.renderApp) c.renderApp(); }
  function routable(b) {
    if (!API.routeAll || (b.closest && b.closest('.ab-card'))) return null;
    var r = findRun(b.dataset.run);
    return r && !owned(r) ? r : null;
  }
  chain('collab-panel-tab', function (ctx, b) {
    var id = viewRunOf(b); if (!id) return false;
    var v = vs(id); v.tab = TAB_KEYS.indexOf(b.dataset.tab) >= 0 ? b.dataset.tab : 'overview'; v.participantId = null; v.confirm = false;
    reRender(ctx); return true;
  });
  chain('collab-open-participant', function (ctx, b) {
    var id = viewRunOf(b);
    if (!id) { var r = routable(b); return r ? open(r.id, { participantId: b.dataset.participant }) : false; }
    var v = vs(id); v.participantId = b.dataset.participant || null; v.tab = 'participants';
    reRender(ctx); return true;
  });
  chain('collab-close-participant', function (ctx, b) {
    var id = viewRunOf(b); if (!id) return false;
    vs(id).participantId = null; reRender(ctx); return true;
  });
  chain('collab-open-panel', function (ctx, b) {
    var r = routable(b); if (!r) return false;
    return open(r.id, {});
  });
  /* a legacy review tick repaints only the overlays; the docked view repaints with the app */
  chain('collab-review-toggle-finding', function (ctx, b) {
    if (viewRunOf(b)) requestAnimationFrame(function () { reRender(ctx); });
    return false;
  });
  /* Cancel from the view's confirm closes the More row; the run's own handler runs next and cancels */
  chain('collab-cancel', function (ctx, b) { var id = b && b.dataset && b.dataset.run; if (id && VIEW[id]) { VIEW[id].confirm = false; VIEW[id].more = false; } return false; });
  chain('reset-all', function () { VIEW = {}; SEEN = {}; FRESH = {}; STREAMS = {}; return false; });
  EXT.action('collab-view-toggle', function (ctx, b) {
    var id = b.dataset.run; if (!id) return true;
    var v = vs(id), part = b.dataset.part;
    if (part === 'more') { v.more = !v.more; v.confirm = false; }
    else if (part === 'confirm') v.confirm = !v.confirm;
    else if (part === 'tech') v.tech = !v.tech;
    reRender(ctx); return true;
  });
  EXT.action('collab-view-filter', function (ctx, b) {
    var run = findRun(b.dataset.run); if (!run || !window.PM56_PICKERS) return true;
    var opts = [{ value: 'all', label: 'Everyone', description: 'Every message in this run, in order' }].concat(list(run.participants).map(function (p) {
      return { value: p.id, label: p.role, description: 'Only what ' + p.role + ' wrote, and what was sent to it' };
    }));
    window.PM56_PICKERS.openChoice(b, 'Show messages from', vs(run.id).filter, opts, function (val) { vs(run.id).filter = val || 'all'; reRender(); });
    return true;
  });

  /* ================================================================ streaming (M4, G-06)
     A message that arrives while a live run's Conversation or helper view is on screen streams its words into
     its data-pm-keep island through PM56_PMX.stream (which paces with Chat WOW's PM56_STREAM); once every word
     is in, the next render swaps the island for the full markdown (its key changes from stream:{mid} to
     body:{mid}; a 120 ms crossfade, the entry never moves). Live helper text is the owner's answer E-31 (DL-137,
     2026-09-27): the same streaming the replies use; stop, pause, fail and abstain end it (streamEnded). */
  var pollJob = 0;
  function settleStream(st) { st.done = true; st.doneAt = nowMs(); }
  function pollStreams() {
    pollJob = 0;
    var active = false, changed = false;
    Object.keys(STREAMS).forEach(function (mid) {
      var st = STREAMS[mid];
      if (st.done || !st.started) return;
      if (!st.island || !st.island.isConnected || !st.state || st.state.shown >= st.state.words.length) { settleStream(st); changed = true; return; }
      active = true;
    });
    if (changed) reRender();
    else if (active) pollJob = setTimeout(pollStreams, 200);
  }
  function afterApp() {
    var P = PMX();
    var islands = document.querySelectorAll('.collab-view .pmx-entry-body[data-pm-keep][data-k^="stream:"]');
    for (var i = 0; i < islands.length; i++) {
      var isl = islands[i], mid = isl.getAttribute('data-k').slice(7), st = STREAMS[mid];
      if (!st || st.done || st.island === isl) continue;
      st.island = isl; st.started = true;
      var target = isl.querySelector('p') || isl;
      st.state = P && P.stream ? P.stream(target, st.text) : null;
      if (!st.state) target.textContent = st.text;
    }
    var pending = false;
    Object.keys(STREAMS).forEach(function (mid) {
      var st = STREAMS[mid];
      if (st.done) return;
      if (st.started && (!st.island || !st.island.isConnected)) settleStream(st); else if (st.started) pending = true;
    });
    if (pending && !pollJob) pollJob = setTimeout(pollStreams, 200);
  }
  if (window.PM56_PMX && typeof window.PM56_PMX.after === 'function') window.PM56_PMX.after(function (ctx, phase) { if (phase === 'app') afterApp(); });

  /* ================================================================ public API */
  var API = {
    open: open,
    render: render,
    docId: docIdOf,
    state: function (runId) { var v = vs(runId); return { tab: v.tab, participantId: v.participantId }; },
    common: function (run, tab) { run = typeof run === 'string' ? findRun(run) : run; return run ? common(run, tab || 'overview') : ''; },
    generic: function (run, tab) { run = typeof run === 'string' ? findRun(run) : run; return run ? genericParts(run, tab || 'overview') : null; },
    isOpen: function (runId) { var P = PMX(); return !!(P && P.viewOpen && P.viewOpen(runId)); },
    routeAll: false
  };
  window.PM56_COLLAB_VIEW = API;
})();
