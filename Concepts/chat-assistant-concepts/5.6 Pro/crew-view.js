/* crew-view.js — CREW-B: PM56_CREW.viewParts + CrewPlanVM renderer + the Crew run view (spec 8.1). */
/* The Crew run view (DESIGN-SPEC 8.1 "Run view", 8.0 KIND INTERFACE, IMPACT A1-50) for Crews the typed protocol
   owns (PM56_CREW.owns). Presentation only: no protocol state is written here, nothing is admitted, claimed or
   delivered, and no provider or Usage entry is ever made.
   - PM56_CREW.planVM(run)             the protocol adapter (crew-protocol.js, CREW-A): run.crew -> CrewPlanVM;
                                       a same-shape fallback here only for builds whose protocol lacks it
   - PM56_CREW.renderPlanVM(vm, part, {run})  the one CrewPlanVM renderer (the plan table with its disclosures, the
                                       result, the locked copy of the input, the plan-bound block); COLLAB's
                                       legacy adapter hands its own CrewPlanVM (seed, wand and plan-bound Crews)
                                       to the same renderer
   - PM56_CREW.viewParts(run, tab, ctx, generic) the 8.0 KIND INTERFACE. Called by COLLAB-VIEW's frame (with its
                                       generic parts) it returns only the Crew's own fields; called alone it returns
                                       the full set {key, cls, attrs, title, kindWord, status, actions, more, plate,
                                       tabs, main, aside, tab, vm} for this file's own pmxView composition
   - PM56_CREW.viewDocument(ctx, runId) the whole crew-work:{runId} document (pmxView), also published as the
                                       MUST-KEEP PM56_CREW.documentHtml
   The editor document crew-work:{runId}, its tab label and the view-state actions (tabs, participant view,
   the view's More row) are registered here. Everything the view shows is built by PM56_SHELL's pmx builders. */
(function () {
  'use strict';
  var E = window.PM56_EXT, C = window.PM56_COLLAB, W = window.PM56_CREW;
  if (!E || !C || !W) return;
  function S() { return window.PM56_SHELL; }
  function esc(v) { return S().esc(v == null ? '' : String(v)); }
  function g(name, size) { return S().pmxGlyph(name, size || 14); }

  /* ---- module-local view state. G-14: COLLAB's UI.view / PM56_COLLAB.viewState() own the tab and the selected
     helper as soon as COLLAB exports them; the view's More row and its disclosures stay here. ---- */
  var UI = { view: {}, more: {}, open: {}, confirm: {} };
  function CV() { var v = window.PM56_COLLAB_VIEW; return v && typeof v.render === 'function' ? v : null; }
  function viewState(runId) {
    if (CV() && CV().state) { var w = CV().state(runId); if (w) return { tab: w.tab || 'overview', participantId: w.participantId || null }; }
    if (C.viewState) { var v = C.viewState(runId); if (v) return { tab: v.tab || 'overview', participantId: v.participantId || null }; }
    return UI.view[runId] || (UI.view[runId] = { tab: 'overview', participantId: null });
  }
  var TABS = ['overview', 'transcript', 'participants', 'usage'];

  /* ---- small readers ---- */
  function run(id) { return C.run(id); }
  function owns(id) { return !!(W.owns && W.owns(id)); }
  function modelShort(name) { return String(name || '').split(' · ')[0]; }
  function participant(r, pid) { return (r.participants || []).filter(function (p) { return p.id === pid; })[0] || null; }
  function seatOf(r, pid) { var i = (r.participants || []).map(function (p) { return p.id; }).indexOf(pid); return i < 0 ? 1 : i + 1; }
  function markRole(p) { return p && p.additiveRoleKind && p.additiveRoleKind !== 'none' ? p.additiveRoleKind : String((p && (p.effectivePersona || p.requestedPersona)) || 'Implementer'); }
  function standIn(p) {
    if (!p || !p.requestedModelId || !p.effectiveModelId || p.requestedModelId === p.effectiveModelId) return null;
    var req = modelShort(p.requestedModelName || p.requestedModelId), eff = modelShort(p.effectiveModelName || p.effectiveModelId);
    var sameProvider = String(p.requestedModelName || '').split(' · ')[1] === String(p.effectiveModelName || '').split(' · ')[1];
    return S().pmxStandIn({ requested: req, effective: eff, reason: p.substitutionReason ? 'unavailable' : 'offline', sameProvider: sameProvider });
  }
  function mark(r, p, size, state) {
    return S().pmxMark({ role: markRole(p), seat: seatOf(r, p.id), size: size || 22, state: state || 'idle', standin: !!standIn(p) });
  }
  function leadMark(size, state) { return S().pmxMark({ role: 'lead', size: size || 22, state: state || 'idle' }); }
  /* IMPACT A3-03: one provenance predicate */
  function recorded(r) { return C.provenance ? C.provenance(r.id) === 'recorded' : !!(r.crew && r.crew.protocolVersion); }
  function toMs(iso) { var t = Date.parse(iso || ''); return isFinite(t) ? t : null; }
  /* IMPACT A1-20: COLLAB's presentState when it exists, else the record's own status */
  function presentState(r) {
    if (C.presentState) { var s = C.presentState(r); if (s) return s; }
    return r.status;
  }
  var STATUS_WORD = { waiting: 'Waiting to start', starting: 'Starting', running: 'Running', live: 'Running', paused: 'Paused', completed: 'Completed', canceled: 'Cancelled', cancelled: 'Cancelled', failed: 'Failed', blocked: 'Needs attention', attention: 'Needs attention' };
  function isLive(r) { var s = presentState(r); return s === 'running' || s === 'live' || s === 'starting' || s === 'paused' || s === 'attention' || s === 'blocked' || s === 'waiting'; }
  function canAct(r) { var s = presentState(r); return s === 'running' || s === 'live' || s === 'starting' || s === 'paused'; }
  function assignments(r) { return (r.crew && r.crew.assignments) || []; }
  function doneCount(r) { return assignments(r).filter(function (a) { return a.status === 'done'; }).length; }
  function byId(A, id) { return A.filter(function (a) { return a.id === id; })[0] || null; }

  /* ---- the protocol record's own words, told plainly (DON'T 18: no enum or contract ids in a reading line).
     crew-protocol.js writes plain request / response / hand-off bodies at source (CREW-A-3); only the admission
     line (collaboration.js) and the lifecycle notes are still told here. ---- */
  function plainBody(r, m) {
    var b = String(m.body || ''), A = assignments(r);
    if (m.senderKind === 'system') {
      if (/^Paused/.test(b)) return 'Paused. Nothing was lost.';
      if (/^Resumed/.test(b)) return 'Picked up where it left off.';
      if (/^Cancell?ed/.test(b)) return 'Cancelled. Everything it produced so far is kept here.';
      return b;
    }
    if (/bounded assignments admitted/i.test(b)) {
      var free = A.filter(function (a) { return !(a.dependsOn || []).length; }).length, after = A.length - free;
      return 'Split the job into ' + A.length + ' parts. ' + (free === 1 ? 'Part 1 can' : 'Parts ' + A.slice(0, free).map(function (a, i) { return i + 1; }).join(' and ') + ' can') + ' start right away' +
        (after ? '; ' + (after === 1 ? 'part ' + A.length + ' starts' : 'the rest start') + ' after they are checked.' : '.');
    }
    return b;
  }
  /* 9.5 conversation verbs, in place of the old uppercase message-type tags */
  function verbOf(r, m) {
    var A = assignments(r);
    if (m.messageType === 'request') {
      var who = (m.recipientIds || []).map(function (id) { var p = participant(r, id); return p ? p.role : ''; }).filter(Boolean).join(', ');
      /* the body starts with the part's title ("Normalize titles. Done when: …") */
      var b = String(m.body || ''), part = A.filter(function (a) { return a.title && b.indexOf(a.title) === 0; })[0], t = part ? part.title : '';
      return who ? 'asked ' + who + ' to ' + (t ? t.charAt(0).toLowerCase() + t.slice(1) : 'take a part') : 'asked for a part';
    }
    if (m.messageType === 'response') return 'replied';
    if (m.messageType === 'handoff') return 'handed the result to you';
    if (m.messageType === 'warning') return 'raised a concern';
    if (m.messageType === 'conflict') return 'disagrees';
    return '';
  }

  /* =====================================================================
     CrewPlanVM (IMPACT A1-50): one view model for the Crew's board and document, two adapters, one renderer.
     The protocol adapter is crew-protocol.js's PM56_CREW.planVM(run) (CREW-A; its shape is the contract):
     { kind:'crew', runId, concurrency:{asked, runs}, admission, policyRevision,
       parts:[{id, title, status:'pending'|'running'|'done', checked, owner:{id, name, persona, seat, requestedModel,
               effectiveModel, standIn}, doneWhen, startsAfter:[titles], waitsOn:[titles], secondTry, evidence, did,
               cls, key}],
       evidence:[{partId, text}], result:{name, rowCount, lines:[<= 3], body, meta, downloadAction} | null,
       source:{rows:[{id, title}], hash, cls} | null, planBound: null }
     Text fields are plain text (the renderer escapes). COLLAB's legacy adapter (seed, wand and plan-bound Crews)
     fills the same shape and may add, per part, `markDone: {action:'collab-crew-complete', attrs}` and, for a
     plan-bound Crew, `planBound: {cls:'plan-crew-summary', summary, rows:[{title, who, state}], note}` (the
     plan-crew-* hooks). The renderer is PM56_CREW.renderPlanVM(vm, part, {run}); `run` (optional) lets it show
     what a protocol part actually returned. Until crew-protocol.js exports planVM (older builds), the fallback
     below produces the same shape from run.crew.
     ===================================================================== */
  var DID = { normalize: 'cleaned up titles', quoting: 'fixed quoting', export: 'built and tested it' };
  function fallbackVM(id) {
    var r = typeof id === 'string' ? run(id) : id;
    if (!r || !r.crew || !r.crew.protocolVersion) return null;
    var w = r.crew, A = w.assignments || [];
    var parts = A.map(function (a) {
      var p = participant(r, a.participantId) || {};
      return { id: a.id, title: a.title, status: a.status, checked: a.status === 'done',
        owner: { id: p.id, name: a.assignedRole, persona: p.requestedPersona || 'Implementer', seat: seatOf(r, p.id), requestedModel: p.requestedModelName || '', effectiveModel: p.effectiveModelName || '', standIn: !!standIn(p) },
        doneWhen: a.expectedOutput || a.expects || '', startsAfter: (a.dependsOn || []).map(function (d) { return (byId(A, d) || {}).title; }).filter(Boolean),
        waitsOn: (a.dependsOn || []).filter(function (d) { return (byId(A, d) || {}).status !== 'done'; }).map(function (d) { return (byId(A, d) || {}).title; }).filter(Boolean),
        secondTry: false, evidence: a.evidenceNote || '', did: DID[a.id] || 'did its part', cls: 'crew-work-row', key: 'crew-part:' + r.id + ':' + a.id };
    });
    var out = w.summary && (r.artifacts || []).filter(function (x) { return x.id === w.summary.artifactId; })[0];
    return { kind: 'crew', runId: r.id, parts: parts, evidence: parts.filter(function (x) { return x.checked; }).map(function (x) { return { partId: x.id, text: x.evidence }; }),
      result: out ? { name: out.label, rowCount: w.summary.rowCount, lines: csvLines(out.body).slice(0, 3), body: out.body, meta: w.summary.rowCount + (w.summary.rowCount === 1 ? ' row' : ' rows') + ' · original order kept · quotes checked', downloadAction: 'crew-export-result' } : null,
      planBound: null, concurrency: { asked: w.requestedConcurrency, runs: w.effectiveConcurrency }, admission: w.admissionKind, policyRevision: w.policyRevision,
      source: { rows: (w.input && w.input.rows) || [], hash: (w.input && w.input.sourceHash) || '', cls: 'crew-work-source' } };
  }
  function vmOf(r) { return (typeof W.planVM === 'function' ? W.planVM(r) : null) || fallbackVM(r); }
  function csvLines(body) { return String(body || '').replace(/\r\n/g, '\n').split('\n').filter(function (l) { return l !== ''; }); }

  /* ---- presentation of one part: its state word, what it returned (protocol runs only), and how it was checked ---- */
  var STATE_WORD = { done: 'Checked', working: 'Working', waiting: 'Waits its turn', ready: 'Can start', notstarted: 'Not started', stopped: 'Not finished', unchecked: 'Came back, not checked yet' };
  function partState(vm, p, r) {
    if (p.status === 'done') return p.checked === false ? 'unchecked' : 'done';
    if (p.status === 'running') return 'working';
    if (r && !isLive(r)) return 'stopped';
    var A = assignments(r || {});
    if (r && !A.some(function (a) { return a.attempt || a.status !== 'pending'; })) return 'notstarted';
    if ((p.waitsOn || []).length) return 'after';
    var running = vm.parts.filter(function (x) { return x.status === 'running'; }).length;
    return vm.concurrency && running >= (vm.concurrency.runs || 1) ? 'waiting' : 'ready';
  }
  function nOf(vm, title) { for (var i = 0; i < vm.parts.length; i++) if (vm.parts[i].title === title) return i + 1; return null; }
  function afterWords(vm, titles) { var ns = (titles || []).map(function (t) { return nOf(vm, t); }).filter(Boolean); return ns.length ? 'Starts after ' + ns.join(' and ') : 'Starts after ' + (titles || []).join(' and '); }
  function cameBack(a) {
    var res = a && a.result;
    if (!res) return null;
    if (res.kind === 'normalized_rows') return { sentence: (res.rows || []).length + ' titles trimmed. Ids and order kept.', code: (res.rows || []).map(function (x) { return x.id + '  ' + x.title; }).join('\n') };
    if (res.kind === 'quoting_checks') return { sentence: (res.cases || []).length + ' tricky titles tried. Each one stays inside its own cell.', code: (res.cases || []).map(function (x) { return JSON.stringify(x.input) + '  →  ' + String(x.encoded).replace(/\r?\n/g, '\\n'); }).join('\n') };
    if (res.kind === 'csv_export') return { sentence: res.filename + ' with ' + res.rowCount + (res.rowCount === 1 ? ' row' : ' rows') + ', in the original order.', code: csvLines(res.content).join('\n') };
    return { sentence: 'A result came back.', code: '' };
  }

  /* ---- the one renderer ---- */
  function disclosureOpen(runId, key) { return !!(UI.open[runId] && UI.open[runId][key]); }
  function stateCell(state, word) {
    var glyph = state === 'done' ? g('check', 13) : '';
    return '<span class="crew-plan-state" data-state="' + esc(state) + '">' + glyph + '<span>' + esc(word) + '</span></span>';
  }
  function partDetails(vm, p, a) {
    var came = cameBack(a), checked = p.status === 'done' && p.checked !== false;
    var body = '<div class="crew-plan-more">' +
      '<p class="crew-plan-h">What was asked</p><p class="crew-plan-p">' + esc(p.title) + '. Done when: ' + esc(p.doneWhen || 'nothing written') + '</p>' +
      '<p class="crew-plan-h">What came back</p>' +
      (came ? '<p class="crew-plan-p">' + esc(came.sentence) + '</p>' + (came.code ? '<pre class="pmx-code">' + esc(came.code) + '</pre>' : '')
        : p.status === 'done' ? '<p class="crew-plan-p">' + esc(p.owner && p.owner.name ? p.owner.name + ' ' + (p.did || 'did its part') + '.' : 'Its part is done.') + '</p>'
        : '<p class="crew-plan-p crew-plan-quiet">Nothing yet.</p>') +
      '<p class="crew-plan-h">How it was checked</p><p class="crew-plan-p' + (checked ? '' : ' crew-plan-quiet') + '">' +
        (checked ? 'The Coordinator checked it against the locked copy of the job and its “done when”. It counts only because it matched.' + (p.secondTry ? ' It passed on the 2nd try.' : '') : 'Not checked yet. A part counts only once its result matches what was asked.') + '</p>' +
      (a && a.result ? '<details class="crew-plan-raw" data-crew-view-disclosure="raw-' + esc(p.id) + '" data-run="' + esc(vm.runId) + '"' + (disclosureOpen(vm.runId, 'raw-' + p.id) ? ' open' : '') + '><summary>' + g('chevron-right', 12) + '<span>Show raw data</span></summary><pre class="pmx-code">' + esc(JSON.stringify(a.result, null, 2)) + '</pre></details>' : '') +
      (p.markDone && p.status !== 'done' ? '<p class="crew-plan-p"><button type="button" class="text-button" data-action="' + esc(p.markDone.action) + '" ' + (p.markDone.attrs || '') + '>Mark as done…</button></p><p class="pmx-fine">Say what shows it’s finished, for example ‘tests pass: 42/42’. A command just running isn’t proof.</p>' : '') +
      '</div>';
    return '<details class="crew-plan-disc" data-crew-disclosure="' + esc(p.id) + '" data-run="' + esc(vm.runId) + '"' + (disclosureOpen(vm.runId, p.id) ? ' open' : '') + '>' +
      '<summary>' + g('chevron-right', 12) + '<span>What was asked · What came back · How it was checked</span></summary>' + body + '</details>';
  }
  function renderPlanTable(vm, r) {
    var A = assignments(r || {});
    var rows = vm.parts.map(function (p, i) {
      var st = partState(vm, p, r), word = st === 'after' ? afterWords(vm, p.waitsOn).replace('Starts after', 'Waits for') : STATE_WORD[st];
      return '<tr class="crew-plan-row" data-k="crew-plan:' + esc(vm.runId) + ':' + esc(p.id) + '" data-state="' + esc(st) + '">' +
        '<td class="crew-plan-part"><b><span class="crew-clamp">' + (i + 1) + '. ' + esc(p.title) + '</span></b><small>' + ((p.startsAfter || []).length ? esc(afterWords(vm, p.startsAfter)) : 'Can start right away') + '</small></td>' +
        '<td class="crew-plan-who"><span class="crew-clamp">' + esc(p.owner ? p.owner.name : '') + '</span></td>' +
        '<td class="crew-plan-when"><span class="crew-clamp">' + esc(p.doneWhen || 'Nothing written.') + '</span></td>' +
        '<td class="crew-plan-st">' + stateCell(st, word) + '</td></tr>' +
        '<tr class="crew-plan-drow" data-k="crew-plan-d:' + esc(vm.runId) + ':' + esc(p.id) + '"><td colspan="4">' + partDetails(vm, p, byId(A, p.id)) + '</td></tr>';
    }).join('');
    return '<div class="crew-plan-wrap"><table class="crew-plan-table"><thead><tr><th scope="col">Part</th><th scope="col">Who</th><th scope="col">Done when</th><th scope="col">State</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function renderResult(vm) {
    var x = vm.result;
    if (!x) return '';
    return '<div class="crew-result" data-k="crew-result:' + esc(vm.runId) + '"><p class="crew-result-head">' + g('file', 14) + '<b>' + esc(x.name) + '</b><span class="crew-result-meta">' + esc(x.meta || '') + '</span></p>' +
      '<pre class="pmx-code">' + (x.lines || []).map(esc).join('\n') + '</pre>' +
      (x.downloadAction ? '<p class="crew-result-acts"><button type="button" class="text-button" data-action="' + esc(x.downloadAction) + '" data-run="' + esc(vm.runId) + '">' + g('download', 14) + '<span>Download</span></button></p>' : '') + '</div>';
  }
  function renderSource(vm, r) {
    var s = vm.source;
    if (!s) return '';
    var req = (r && r.crew && r.crew.input && r.crew.input.requirements) || s.requirements || [];
    return '<details class="crew-source ' + esc(s.cls || '') + '" data-crew-disclosure="source" data-run="' + esc(vm.runId) + '"' + (disclosureOpen(vm.runId, 'source') ? ' open' : '') + '>' +
      '<summary>' + g('chevron-right', 12) + '<span>The locked copy of the job</span></summary><div class="crew-plan-more">' +
      '<p class="crew-plan-h">The records</p><ul class="crew-source-rows">' + (s.rows || []).map(function (x) { return '<li><span class="crew-source-id">' + esc(x.id) + '</span><code>' + esc(x.title) + '</code></li>'; }).join('') + '</ul>' +
      (req.length ? '<p class="crew-plan-h">What the result must keep</p><ul class="crew-source-req">' + req.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="pmx-fine crew-source-fine">' + g('lock', 12) + '<span>The fingerprint proves the input didn’t change.</span></p>' +
      '<details class="crew-plan-raw" data-crew-view-disclosure="tech-source" data-run="' + esc(vm.runId) + '"' + (disclosureOpen(vm.runId, 'tech-source') ? ' open' : '') + '><summary>' + g('chevron-right', 12) + '<span>Technical details</span></summary><p class="pmx-fine">Fingerprint ' + esc(s.hash || '') + '</p></details>' +
      '</div></details>';
  }
  function renderPlanBound(vm) {
    var b = vm.planBound;
    if (!b) return '';
    return '<section class="crew-bound ' + esc(b.cls || 'plan-crew-summary') + '"><p class="crew-plan-p">' + esc(b.summary || '') + '</p><div class="crew-bound-rows">' + (b.rows || []).map(function (x) {
      return '<div class="plan-crew-assignment"><strong>' + esc(x.title) + '</strong><span>' + esc(x.who) + ' · ' + esc(x.state) + '</span></div>';
    }).join('') + '</div>' + (b.note || '') + '</section>';
  }
  /* renderPlanVM(vm, part, {run}): part = 'plan' | 'result' | 'source' | 'bound'; none = all four in reading order */
  function renderPlanVM(vm, part, o) {
    if (!vm) return '';
    var r = (o && o.run) || (vm.runId ? run(vm.runId) : null);
    if (part === 'plan') return renderPlanTable(vm, r);
    if (part === 'result') return renderResult(vm);
    if (part === 'source') return renderSource(vm, r);
    if (part === 'bound') return renderPlanBound(vm);
    return renderPlanBound(vm) + renderPlanTable(vm, r) + renderResult(vm) + renderSource(vm, r);
  }

  /* =====================================================================
     The live plate (8.1 run view: "the plate, live (working marks show floor bars, done marks check notches)").
     Built from PM56_SHELL.pmxPlateParts only; seats keep the foundation's J-2 label geometry.
     ===================================================================== */
  function fit(text, px) { text = String(text || ''); var max = Math.max(4, Math.floor(px / 6.9)); return text.length > max ? text.slice(0, max - 1).replace(/\s+$/, '') + '…' : text; }
  function jobWords(r) {
    var w = String(r.purpose || r.title || '').trim().split(/\s+/).filter(Boolean);
    if (!w.length) return 'Not written yet';
    var take = w.slice(0, 4), cut = w.length > 4;
    while (take.length > 1 && take.join(' ').length > 18) { take.pop(); cut = true; }
    return take.join(' ') + (cut ? '…' : '');
  }
  function seatState(r, p) {
    var a = assignments(r).filter(function (x) { return x.participantId === p.id; })[0];
    if (!a) return p.outcome === 'completed' ? 'done' : 'idle';
    if (a.status === 'done') return 'done';
    if (a.status === 'running') return presentState(r) === 'paused' ? 'queued' : 'working';
    return 'queued';
  }
  function livePlate(r) {
    var P = S().pmxPlateParts, ps = (r.participants || []).filter(function (p) { return !p.additiveRoleKind || p.additiveRoleKind === 'none'; });
    var n = ps.length || 1, LX = 350, LY = 33, HY = 124, EY = 198;
    var span = n === 1 ? 0 : Math.min(180, 520 / (n - 1)), lab = n === 1 ? 200 : Math.max(64, span - 18);
    var runs = (r.crew && r.crew.effectiveConcurrency) || 1, st = presentState(r);
    var leadState = st === 'completed' ? 'done' : 'idle';
    var coord = !r.coordinator || r.coordinator.kind === 'parent_assistant' ? 'This chat’s assistant' : (r.coordinator.label || 'A separate AI');
    /* the paper is 56 tall so its words keep >= 8 px from its edge even when the view draws the plate below 1:1 */
    var s = P.paper({ key: 'crew-vp-job', x: 20, y: 6, w: 160, h: 56, label: 'The job', sub: esc(jobWords(r)), part: 'job' });
    s += P.line({ key: 'crew-vp-l-job', from: { x: 180, y: 33 }, to: { x: LX - 20, y: 33 }, style: 'fixed', part: 'job' });
    s += '<g class="pmx-p-seat" data-k="crew-vp-lead" style="--x:' + LX + 'px;--y:' + LY + 'px" data-pmx-part="lead">' +
      P.seat({ x: 0, y: 0, role: 'lead', state: leadState }).replace(/^<g class="pmx-p-seat"[^>]*>/, '').replace(/<\/g>$/, '') +
      P.label({ x: 22, y: -2, text: 'Coordinator', cls: 'lab' }) + P.label({ x: 22, y: 16, text: esc(coord), cls: 'sub' }) + '</g>';
    ps.forEach(function (p, i) {
      var x = Math.round(LX + (i - (n - 1) / 2) * span), state = seatState(r, p), si = standIn(p);
      var floor = state === 'queued' && isLive(r) && i >= runs ? 'hatch' : 'bar';
      s += P.line({ key: 'crew-vp-hand:' + p.id, from: { x: LX, y: LY + 38 }, to: { x: x, y: HY - 20 }, style: 'hands', part: 'assign' });
      s += P.seat({ key: 'crew-vp-seat:' + p.id, x: x, y: HY, role: markRole(p), seat: i + 1, state: state, standin: !!si, floor: floor, part: 'team',
        label: esc(fit(p.role, lab)), sub: esc(fit(si ? modelShort(p.effectiveModelName) + ' · stands in' : modelShort(p.effectiveModelName || p.requestedModelName), lab)) });
    });
    /* J-2: the stage edge sits 11 px under the helpers' sub-lines' ink; You hangs 22 px under it */
    s += P.line({ key: 'crew-vp-edge', from: { x: 40, y: EY }, to: { x: 660, y: EY }, style: 'fixed', part: 'permission' });
    s += P.line({ key: 'crew-vp-toyou', from: { x: LX, y: EY }, to: { x: LX, y: EY + 10 }, style: 'toyou', part: 'you' });
    s += P.you({ x: LX, y: EY + 22, label: 'You', sub: st === 'completed' ? 'got one checked result' : 'get one checked result' });
    s += P.glyph('lock', 40, EY + 11, 12) + P.label({ x: 58, y: EY + 21, text: 'this chat’s permissions', part: 'permission' });
    return S().pmxPlate({ key: 'crew-vp:' + r.id, kind: 'crew', mode: 'full', w: 700, h: 256, svg: s, cls: 'crew-view-plate',
      legend: [{ sample: 'bar', label: 'works at once', part: 'parallel' }, { sample: 'hatch', label: 'waits its turn', part: 'parallel' }] });
  }

  /* =====================================================================
     viewParts(run, tab, ctx): the KIND INTERFACE for the run view
     ===================================================================== */
  function costLine(r) {
    if (recorded(r)) return S().pmxCost({ state: 'recorded' });
    var spent = r.usage && r.usage.costUsd != null ? Number(r.usage.costUsd) : null;
    return S().pmxCost({ state: isLive(r) ? 'running' : 'done', spent: spent, limit: (r.config || {}).costLimitUsd });
  }
  function startedBy(r) {
    var w = r.crew || {};
    if (w.admissionKind === 'auto') {
      var free = (w.assignments || []).filter(function (a) { return !(a.dependsOn || []).length; }).length;
      return 'started by Crew Auto: this job splits into ' + free + ' parts (rules v' + esc(w.policyRevision || 1) + ')';
    }
    return 'started by you';
  }
  function clockOf(r) {
    var T = S().pmxTime, a = toMs(r.createdAt), b = toMs(r.completedAt);
    if (a == null) return '';
    if (b != null) return 'worked ' + T.worked(b - a);
    return T.clock(Date.now() - a);
  }
  function statusHtml(r) {
    var st = presentState(r), word = STATUS_WORD[st] || 'Running';
    if (st === 'waiting') return '<b>' + word + '</b> · ' + esc(C.waitingReason ? C.waitingReason(r) : 'Nothing has started yet.');
    return '<b>' + word + '</b> · ' + clockOf(r) + ' · ' + startedBy(r) + ' · ' + costLine(r);
  }
  function actionsHtml(r, ctx) {
    var id = esc(r.id), st = presentState(r), out = '';
    var demo = window.PM56_CREW_DEMOS && window.PM56_CREW_DEMOS.controls ? window.PM56_CREW_DEMOS.controls(ctx, r) : '';
    if (demo) out += demo;
    if (st === 'paused') out += '<button type="button" class="text-button" data-action="collab-resume" data-run="' + id + '">' + g('play', 13) + '<span>Resume</span></button>';
    else if (canAct(r)) out += '<button type="button" class="text-button" data-action="collab-pause" data-run="' + id + '">' + g('pause', 13) + '<span>Pause</span></button>';
    if (canAct(r)) out += '<button type="button" class="text-button" data-action="collab-message" data-run="' + id + '">Message</button>';
    out += '<button type="button" class="icon-button crew-view-more-toggle" data-action="crew-view-more" data-run="' + id + '" aria-expanded="' + (UI.more[r.id] ? 'true' : 'false') + '" aria-label="More">' + g('more', 16) + '</button>';
    return out;
  }
  /* the view's More row (8.1 G-26 "The view's More row holds Run another Crew"): real buttons, not a menu (G-12) */
  function moreRow(r) {
    if (!UI.more[r.id]) return '';
    var id = esc(r.id), items = [];
    /* Cancel {Kind}… confirms in place, never a modal (9.1): "Cancel this Crew? Everything so far is kept." */
    if (canAct(r) && UI.confirm[r.id]) return '<div class="crew-view-more" data-k="crew-view-more:' + id + '">' + S().pmxInlineConfirm({ key: 'crew-view-confirm:' + r.id, sentence: 'Cancel this Crew? Everything so far is kept.',
      confirm: { action: 'collab-cancel', attrs: 'data-run="' + id + '"', label: 'Cancel Crew' }, keep: { action: 'crew-view-cancel-ask', attrs: 'data-run="' + id + '" data-value="0"', label: 'Keep going' } }) + '</div>';
    if (canAct(r)) items.push('<button type="button" class="text-button" data-action="crew-view-cancel-ask" data-run="' + id + '" data-value="1">Cancel Crew…</button>');
    else items.push('<button type="button" class="text-button" data-action="crew-run-again" data-run="' + id + '">Run another Crew</button>');
    /* IMPACT A1-38: disabled with its printed reason, never hidden */
    items.push('<span class="crew-view-off"><button type="button" class="text-button" disabled data-failure="command_not_registered">Download transcript</button><span class="pmx-fine">Not available in this preview.</span></span>');
    return '<div class="crew-view-more" data-k="crew-view-more:' + id + '">' + items.join('') + '</div>';
  }
  function tabsHtml(r, tab) {
    var msgs = (r.messages || []).length, team = (r.participants || []).length, at = 'data-run="' + esc(r.id) + '"';
    return S().pmxTabs({ key: 'crew-view-tabs:' + r.id, cls: 'crew-view-tabs', current: tab, action: 'collab-panel-tab', attr: 'data-tab', items: [
      { value: 'overview', label: 'Summary', attrs: at },
      { value: 'transcript', label: 'Conversation', count: msgs || '', attrs: at },
      { value: 'participants', label: 'Team', count: team || '', attrs: at },
      { value: 'usage', label: 'Cost', attrs: at }] });
  }
  function teamVerb(r, p) {
    var A = assignments(r), a = A.filter(function (x) { return x.participantId === p.id; })[0], st = presentState(r);
    if (!a) return p.current ? 'working on ' + esc(p.current) : 'ready';
    if (a.status === 'done') return esc(a.title) + ' checked';
    if (a.status === 'running') return (st === 'paused' ? 'paused on ' : 'working on ') + esc(a.title);
    if (!isLive(r)) return esc(a.title) + ' not finished';
    if (!A.some(function (x) { return x.attempt; })) return 'waits for the Coordinator’s plan';
    var deps = (a.dependsOn || []).map(function (d) { return (byId(A, d) || {}).title; }).filter(Boolean);
    var open = (a.dependsOn || []).some(function (d) { return (byId(A, d) || {}).status !== 'done'; });
    return open ? 'starts after ' + deps.map(esc).join(' and ') : 'waits its turn';
  }
  function teamSection(r) {
    var st = presentState(r), n = assignments(r).length, d = doneCount(r);
    var lead = '<li data-k="crew-team:' + esc(r.id) + ':lead">' + leadMark(18, st === 'completed' ? 'done' : 'idle') + '<span class="crew-team-line"><b>Coordinator</b><span>' +
      (st === 'completed' ? 'checked each part' : !assignments(r).some(function (a) { return a.attempt; }) ? 'reads the job and splits it into parts' : d ? 'checked ' + d + ' of ' + n + ' parts' : 'hands out the parts and checks each one') + '</span></span></li>';
    var rows = (r.participants || []).map(function (p) {
      return '<li data-k="crew-team:' + esc(r.id) + ':' + esc(p.id) + '">' + mark(r, p, 18, seatState(r, p)) + '<span class="crew-team-line"><b>' + esc(p.role) + '</b><span>' + teamVerb(r, p) + '</span></span></li>';
    }).join('');
    return S().pmxViewSection({ key: 'crew-v-team:' + r.id, title: 'The team', body: '<ul class="crew-team">' + lead + rows + '</ul>' });
  }
  function entriesOf(r, filterPid) {
    var t0 = toMs(r.createdAt);
    return (r.messages || []).filter(function (m) { return !filterPid || m.senderId === filterPid; }).map(function (m) {
      var t = toMs(m.at || m.createdAt), when = t0 != null && t != null ? S().pmxTime.clock(t - t0) : '';
      if (m.senderKind === 'system') return { key: 'collab-msg-' + m.id, mid: m.id, kind: 'system', bodyHtml: esc(plainBody(r, m)) };
      var p = m.senderId ? participant(r, m.senderId) : null, verb = verbOf(r, m);
      return { key: 'collab-msg-' + m.id, mid: m.id, markHtml: p ? mark(r, p, 22) : leadMark(22), who: esc(m.senderName || (p ? p.role : 'Coordinator')),
        when: (verb ? esc(verb) + ' · ' : '') + esc(when), bodyHtml: S().pmxMd(plainBody(r, m), { mode: 'full' }) };
    });
  }
  function conversation(r) {
    var ents = entriesOf(r);
    if (!ents.length) ents = [{ key: 'collab-msg-start-' + r.id, mid: 'start-' + r.id, kind: 'system', bodyHtml: 'Started with ' + (r.participants || []).length + ' helpers.' }];
    return S().pmxTimeline({ key: 'crew-v-conv:' + r.id, entries: ents });
  }
  function recentSection(r) {
    var ents = entriesOf(r).slice(-3);
    if (!ents.length) return '';
    return S().pmxViewSection({ key: 'crew-v-now:' + r.id, title: 'As it happens', meta: 'the last ' + (ents.length === 1 ? 'message' : ents.length + ' messages'), body: S().pmxTimeline({ key: 'crew-v-recent:' + r.id, entries: ents }) });
  }
  function teamTab(r, pid) {
    if (pid) {
      var p = participant(r, pid);
      if (p) {
        var own = (r.messages || []).filter(function (m) { return m.senderId === p.id; });
        return S().pmxParticipant({ kind: 'crew', key: 'crew-v-part:' + r.id + ':' + p.id, role: esc(p.role), standIn: standIn(p),
          messagesHtml: own.map(function (m) { return '<div class="collab-msg crew-view-msg" data-k="collab-msg-' + esc(m.id) + '">' + S().pmxMd(plainBody(r, m), { mode: 'full' }) + '</div>'; }).join(''),
          emptyText: 'Nothing from ' + esc(p.role) + ' yet.' });
      }
    }
    var core = (r.participants || []).filter(function (p) { return !p.additiveRoleKind || p.additiveRoleKind === 'none'; });
    var spec = (r.participants || []).filter(function (p) { return p.additiveRoleKind && p.additiveRoleKind !== 'none'; });
    function row(p) {
      var st = seatState(r, p), si = standIn(p);
      return S().pmxTeamRow({ key: 'collab-p-' + p.id, kind: 'crew', cls: 'collab-participant', attrs: 'data-run="' + esc(r.id) + '" data-participant="' + esc(p.id) + '"',
        markHtml: mark(r, p, 22, st), name: esc(p.role), standIn: si, route: si ? '' : esc(modelShort(p.effectiveModelName || p.requestedModelName)) + ' · ' + esc(p.effectivePersona || p.requestedPersona || ''),
        outcome: st === 'done' ? 'checked' : st === 'working' ? 'working' : isLive(r) ? 'waiting' : 'didn’t finish', cost: '' });
    }
    var body = '<p class="crew-view-lead">' + leadMark(18) + '<span>Coordinator: this chat’s assistant. It hands out the parts and checks each one.</span></p>' + core.map(row).join('');
    var out = S().pmxViewSection({ key: 'crew-v-core:' + r.id, title: 'Core team', meta: core.length + (core.length === 1 ? ' helper' : ' helpers'), body: body });
    if (spec.length) out += S().pmxViewSection({ key: 'crew-v-spec:' + r.id, title: 'Specialists', meta: 'never counted as core coverage', body: spec.map(row).join('') });
    return out;
  }
  function costTab(r) {
    var u = r.usage || {}, tokens = (Number(u.inputTokens) || 0) + (Number(u.outputTokens) || 0), rec = recorded(r);
    /* a recording says so once (the section line); its helper rows then name each helper's model, not a cost */
    var lines = '<p class="crew-cost-line">' + (rec ? 'Nothing was spent: this is a recording, so no AI was contacted.' : costLine(r) + (tokens ? ' · ' + S().pmxTokens(tokens, { key: 'crew-tokens-' + r.id }) : '')) + '</p>' +
      '<p class="pmx-fine crew-cost-fine">' + (rec ? 'A real Crew shows what each helper cost here.' : 'Tokens measure AI use, roughly ¾ of a word each.') + '</p>';
    var per = '<ul class="crew-cost-per">' + (r.participants || []).map(function (p) {
      return '<li data-k="crew-cost:' + esc(r.id) + ':' + esc(p.id) + '"><span class="crew-cost-mark">' + mark(r, p, 18) + '</span><b class="crew-cost-name">' + esc(p.role) + '</b><span class="crew-cost-amt">' +
        (rec ? esc(modelShort(p.effectiveModelName || p.requestedModelName)) : S().pmxCost({ state: isLive(r) ? 'running' : 'done', spent: p.costUsd != null ? p.costUsd : null })) + '</span></li>';
    }).join('') + '</ul>';
    return S().pmxViewSection({ key: 'crew-v-cost:' + r.id, title: 'Cost', meta: 'your limit ' + S().pmxMoney((r.config || {}).costLimitUsd || 6), body: lines + per });
  }
  function asideHtml(r, vm, tab) {
    var cl = vm && vm.concurrency ? S().pmxClamp({ asked: vm.concurrency.asked, runs: vm.concurrency.runs, planBound: vm.concurrency.planBound }) : null;
    var runs = (vm && vm.concurrency && vm.concurrency.runs) || 1;
    var out = '<ul class="crew-view-facts">';
    /* the Cost tab already says what was spent: the aside does not repeat it there */
    if (tab !== 'usage') out += '<li>' + costLine(r) + '</li>';
    out += '<li>' + (cl && cl.card.indexOf(' (') > 0 ? '<b>' + esc(cl.card.split(' (')[0]) + '</b> (' + esc(cl.card.split(' (')[1]) : '<b>' + runs + ' at a time</b>') + '</li>';
    (r.participants || []).forEach(function (p) { var si = standIn(p); if (si) out += '<li>' + si.card + '</li>'; });
    out += '<li>Helpers can do what this chat can: ' + esc(((r.crew && r.crew.parent) || {}).mode || 'Agent') + ', asking first.</li></ul>';
    out += '<details class="crew-view-tech" data-crew-view-disclosure="tech" data-run="' + esc(r.id) + '"' + (disclosureOpen(r.id, 'tech') ? ' open' : '') + '><summary>' + g('chevron-right', 12) + '<span>Technical details</span></summary>' +
      '<p class="pmx-fine">Opened with cmd.collaboration.open {target: run_view}. Pause and Resume: cmd.collaboration.pause / .resume. Download: cmd.collaboration.export {content_kind: result}. Tabs and disclosures: no command, view state.</p></details>';
    return out;
  }
  /* viewParts(run, tab, ctx, generic): with `generic` (COLLAB-VIEW's frame calls it so), the answer is the frame's
     interface: only the fields the Crew draws itself (status, actions = the recording's control + the frame's own,
     more = Run another Crew, the live plate, Summary and Conversation, the aside, the root hooks); the frame keeps its
     tabs, Team, Cost, the helper view, More and view state. Without it, the full set for this file's own frame. */
  function summaryMain(r, vm) {
    return (vm.result ? S().pmxViewSection({ key: 'crew-v-result:' + r.id, title: 'The result', body: renderPlanVM(vm, 'result', { run: r }) }) : '') +
      teamSection(r) +
      S().pmxViewSection({ key: 'crew-v-plan:' + r.id, title: 'The plan', meta: vm.parts.length + ' parts · ' + ((vm.concurrency && vm.concurrency.runs) || 1) + ' at a time', body: renderPlanVM(vm, 'plan', { run: r }) }) +
      recentSection(r) +
      S().pmxViewSection({ key: 'crew-v-source:' + r.id, title: 'What the Crew started from', body: renderPlanVM(vm, 'source', { run: r }) });
  }
  function viewParts(r, tab, ctx, generic) {
    if (!r || !owns(r.id)) return null;
    ctx = ctx || E.ctx();
    if (generic) {
      var gvm = vmOf(r), gtab = TABS.indexOf(tab) >= 0 ? tab : 'overview', demo = window.PM56_CREW_DEMOS && window.PM56_CREW_DEMOS.controls ? window.PM56_CREW_DEMOS.controls(ctx, r) : '';
      return { status: statusHtml(r), actions: demo + (generic.actions || ''), more: canAct(r) ? '' : '<button type="button" class="text-button" data-action="crew-run-again" data-run="' + esc(r.id) + '">Run another Crew</button>',
        plate: livePlate(r), aside: asideHtml(r, gvm, gtab), cls: 'crew-work-document', attrs: 'data-crew-run="' + esc(r.id) + '"',
        main: gtab === 'overview' ? summaryMain(r, gvm) : gtab === 'transcript' ? S().pmxViewSection({ key: 'crew-v-convs:' + r.id, title: 'Conversation', meta: 'everyone · ' + (r.messages || []).length + ((r.messages || []).length === 1 ? ' message' : ' messages'), body: conversation(r) }) : undefined };
    }
    var v = viewState(r.id);
    tab = TABS.indexOf(tab) >= 0 ? tab : (TABS.indexOf(v.tab) >= 0 ? v.tab : 'overview');
    var vm = vmOf(r), main;
    if (tab === 'transcript') main = S().pmxViewSection({ key: 'crew-v-convs:' + r.id, title: 'Conversation', meta: 'everyone · ' + (r.messages || []).length + ((r.messages || []).length === 1 ? ' message' : ' messages'), body: conversation(r) });
    else if (tab === 'participants') main = teamTab(r, v.participantId);
    else if (tab === 'usage') main = costTab(r);
    else main = summaryMain(r, vm);
    return {
      key: 'crew-work:' + r.id, cls: 'crew-work-document collab-panel', attrs: 'data-crew-run="' + esc(r.id) + '"',
      title: esc(r.title), kindWord: 'Crew', status: statusHtml(r), actions: actionsHtml(r, ctx), more: moreRow(r),
      plate: livePlate(r), tabs: tabsHtml(r, tab), main: main, aside: asideHtml(r, vm, tab), tab: tab, vm: vm
    };
  }
  /* the whole document: the pmxView frame. The recorded example's guide is the view's first row (C27 'doc'); the
     More row sits directly above the tabs, in the view's own flow (no box inside the view). */
  function viewDocument(ctx, runId) {
    var r = run(runId);
    if (!r || !owns(runId)) return '';
    var guide = window.PM56_CREW_DEMOS && window.PM56_CREW_DEMOS.editorGuide ? window.PM56_CREW_DEMOS.editorGuide(r.id) : '', html;
    /* COLLAB-VIEW's frame when it is loaded (one run view frame for every kind; it calls viewParts with its generic
       parts), else this file's own pmxView composition */
    if (CV()) html = CV().render(ctx, r.id, {});
    else {
    var p = viewParts(r, null, ctx);
    html = S().pmxView({ key: p.key, cls: p.cls, attrs: p.attrs, kind: 'crew', kindWord: p.kindWord, title: p.title, statusHtml: p.status,
      actionsHtml: p.actions, plateHtml: p.plate, tabsHtml: p.more + p.tabs, mainHtml: p.main, asideHtml: p.aside });
    }
    /* FOUNDATION REQUEST 1 (notes): pmxView has no guide slot; the guide goes in as the article's first child */
    if (guide) html = html.replace(/^(<article\b[^>]*>)/, function (m) { return m + guide; });
    return html;
  }

  /* =====================================================================
     Registration: the crew-work:{runId} document, its tab label, and the view-state actions.
     ===================================================================== */
  E.slot('editorTabLabel', function (c) {
    if (!c.editorId || c.editorId.indexOf('crew-work:') !== 0) return '';
    var r = run(c.editorId.slice(10));
    return 'Crew · ' + (r ? r.title : 'Crew');
  });
  E.slot('editorDocument', function (c) {
    if (!c.editorId || c.editorId.indexOf('crew-work:') !== 0) return '';
    return viewDocument(c, c.editorId.slice(10));
  });
  function openWork(c, runId, tab, pid) {
    if (CV() && CV().open) { if (c.state.dialog && c.state.dialog.type === 'collab-panel') c.closeDialog(); CV().open(runId, { tab: tab || undefined, participantId: pid || null, docId: 'crew-work:' + runId }); return; }
    if (!C.viewState) { var v = viewState(runId); if (tab) v.tab = tab; v.participantId = pid || null; }
    if (c.state.dialog && c.state.dialog.type === 'collab-panel') c.closeDialog();
    if (c.closeMenu) c.closeMenu();
    c.state.editorRevealed = true;
    c.openEditor('crew-work:' + runId);
  }
  function viewRun(b) { var el = b && b.closest && b.closest('.crew-work-document'); return el ? el.getAttribute('data-crew-run') : null; }
  /* G-14: collab-open-panel reaches the kind's document for the Crews this module owns (Activity hover rows keep
     their own route: pin Activity and select the run) */
  E.chainAction('collab-open-panel', function (c, b) {
    var id = b && b.dataset && b.dataset.run;
    if (!id || !owns(id) || (b.closest && b.closest('.ab-card, #activity-domain-preview'))) return false;
    openWork(c, id, b.dataset.tab || null, null); c.renderApp(); return true;
  });
  /* tabs, the participant view and Back to everyone inside the Crew document (view state, no command). Once COLLAB
     exports viewState it owns them; until then they live here. */
  E.chainAction('collab-panel-tab', function (c, b) {
    var id = viewRun(b);
    if (CV() || C.viewState || !id) return false;
    var v = viewState(id); v.tab = TABS.indexOf(b.dataset.tab) >= 0 ? b.dataset.tab : 'overview'; v.participantId = null; c.renderApp(); return true;
  });
  E.chainAction('collab-open-participant', function (c, b) {
    var id = b && b.dataset && b.dataset.run;
    if (!id || !owns(id) || (!CV() && C.viewState)) return false;
    openWork(c, id, 'participants', b.dataset.participant || null); c.renderApp(); return true;
  });
  E.chainAction('collab-close-participant', function (c, b) {
    var id = viewRun(b);
    if (CV() || C.viewState || !id) return false;
    viewState(id).participantId = null; c.renderApp(); return true;
  });
  /* the view's More row and its in-place cancel confirmation: view state, no command (8.15) */
  E.action('crew-view-more', function (c, b) { var id = b.dataset.run; UI.more[id] = !UI.more[id]; UI.confirm[id] = false; c.renderApp(); return true; });
  E.action('crew-view-cancel-ask', function (c, b) { UI.confirm[b.dataset.run] = b.dataset.value === '1'; c.renderApp(); return true; });
  E.chainAction('collab-cancel', function (c, b) { var id = b && b.dataset && b.dataset.run; if (id) { UI.confirm[id] = false; UI.more[id] = false; } return false; });
  /* disclosures keep their open state across renders (the protocol's toggle listener keeps its own map for its own
     legacy document; this one belongs to the view) */
  document.addEventListener('toggle', function (e) {
    var n = e.target;
    if (!n || !n.isConnected || !n.matches || !n.closest('.crew-work-document')) return;
    var key = n.matches('details[data-crew-disclosure]') ? n.dataset.crewDisclosure : n.matches('details[data-crew-view-disclosure]') ? n.dataset.crewViewDisclosure : null;
    if (!key) return;
    var id = n.dataset.run; (UI.open[id] = UI.open[id] || {})[key] = n.open;
  }, true);
  E.chainAction('reset-all', function () { UI.view = {}; UI.more = {}; UI.open = {}; UI.confirm = {}; return false; });

  if (typeof W.planVM !== 'function') W.planVM = fallbackVM;
  W.renderPlanVM = renderPlanVM;
  W.viewParts = function (r, tab, ctx, generic) { return viewParts(typeof r === 'string' ? run(r) : r, tab, ctx, generic); };
  W.viewDocument = viewDocument;
  W.documentHtml = viewDocument;
})();
