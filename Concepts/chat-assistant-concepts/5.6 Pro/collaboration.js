/* collaboration.js — feature module.  OWNER: Collaborative Workflows (Assistant
 * redesign wave, 2026-09-03).  Canonical owner doc: Plans/Collaborative_Workflows.md.
 * Packet: 01_IMPLEMENTATION_SPEC.md §7-12, 04_GUI_IMPACTS.md §11-12.
 *
 * WHAT THIS FILE OWNS
 * --------------------
 * Puppet Master has exactly four user-invocable collaborative workflow kinds:
 * `crew | brainstorm | review | chat_room`.  They are ONE runtime with four
 * protocols, not four products.  This file is the whole runtime: one
 * definition/run/participant/message/artifact model on `RT.collab`, one
 * configuration-modal contract, one transcript card, one full panel, one
 * Activity projection (where the host lets it land — see note 3 below), one
 * composer-targeting path, and four thin kind-specific protocol layers on top
 * that add fields and actions without forking the shared store.
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * -------------------------------
 * 1. NOTHING HERE IS A NATIVE COMMAND.  Plans/Collaborative_Workflows.md §10
 *    lists every `cmd.collaboration.*`, `cmd.brainstorm.*`, `cmd.review.*` and
 *    `cmd.chat_room.*` ID as a canonical REQUEST that is not yet registered in
 *    the central command catalog.  Every control below mutates this module's
 *    own fixture state and renders a durable, re-readable result (never a
 *    toast alone) — but where the spec's own command boundary says a control
 *    would call an unregistered command (Plan synthesis, To-Do creation), the
 *    UI says so in the result rather than claiming a cross-module effect that
 *    did not happen. `demo:true` marks every fixture record.
 * 2. REQUESTED VERSUS EFFECTIVE IS NEVER COLLAPSED.  Every participant carries
 *    both, always rendered together the moment they differ, with a reason.  A
 *    demo "Simulate unavailable at start" control exists specifically so a
 *    reviewer can drive substitution instead of only reading about it in a
 *    seed fixture.
 * 3. THE 'crew' ACTIVITY DOMAIN IS DELIBERATELY NOT CLAIMED HERE.
 *    `activity-bar.js` (its `CARDS` map, ~line 506) and `activity-panel.js`
 *    (its hardcoded `DOMAINS`/`LABELS`/`ICONS`, ~line 37) already render a
 *    LEGACY pre-Collaborative-Workflows `crew` domain sourced from a `crew`-typed
 *    transcript message or the retired `state.capabilities.crew` toggle — not
 *    from this file's `RT.collab.runs`.  `activityHoverCard` and
 *    `activityPanelBody` are REPLACE slots whose registered functions are
 *    concatenated (see app.js `extEach`), not first-match-wins, so a second
 *    'crew' renderer here would show ALONGSIDE that legacy stub whenever it is
 *    live, rather than instead of it — a visible duplicate-card defect this
 *    module refuses to ship. `brainstorm`, `review` and `chat_room` have no
 *    such legacy owner (app.js's own `activityScope()`/`activityDefs()` already
 *    project them correctly from `RT.collab.runs` — see `COLLAB_DOMAINS` in
 *    app.js, ~line 1246), so those three ARE registered through the Activity
 *    slots below. Crew's full record, participant transcripts and hover-equivalent
 *    summary are instead always reachable through the docked run view in the
 *    editor pane (`collab-open-panel` / `collab-open-participant` open
 *    `collab-run:{runId}`, collab-view.js; COLLAB step 3 retired the centred
 *    dialog), which every other kind also uses as its primary "Open Panel"
 *    destination for the same reason: it never depends on Activity Detail's
 *    per-domain gating or its "all scope" per-section body.
 * 4. NO PROVIDER BRAND MARKS.  `ctx` does not expose `providerMark()` (only
 *    `icon()` is on the shared context), so participant rows show the provider
 *    name as text rather than inventing a letter-only substitute glyph, which
 *    the packet forbids outright.
 * 5. CROSS-RELOAD PERSISTENCE IS OUT OF SCOPE, LIKE ITS SIBLING MODULES.
 *    Matching goals.js and bsd.js, `RT.collab` is a live in-memory demo store
 *    seeded fresh on load; it is not written to localStorage. Composer buffers
 *    and destinations, which composer-state.js already persists, still survive
 *    reload — this module's OWN run/message/vote/finding records do not.
 *
 * OWNERSHIP BOUNDARY (what this file does NOT do)
 * -------------------------------------------------
 * No Persona/Skill identity system, no model/provider/account catalog, no
 * permission evaluator, no MCP registry, no tool dispatcher, no orchestrator
 * child-run topology, no Plan/To-Do/Goal identity, no artifact storage engine,
 * no Usage ledger, no Settings persistence. This module READS `D.models` for
 * picker options and PROJECTS a permission ceiling and a Usage total; it does
 * not implement any of those systems.
 *
 * RT.collab SHAPE
 * -----------------
 *   RT.collab.definitions[kind]  — Settings-sourced defaults per kind (§14).
 *   RT.collab.runs[]             — CollaborativeRun[] (this file's whole store).
 *   RT.collab.draft              — in-progress configuration-modal draft, or null.
 *   RT.collab.seq                — monotonic id counter.
 * Every run: {id,kind,threadId,title,purpose,status,blockedReason,
 *   definitionRevision,config,participants[],coordinator,messages[],artifacts[],
 *   usage,createdAt,completedAt,stopEpoch,degraded,crew|brainstorm|review|chatRoom}.
 * Participant: {id,runId,role,name,requestedProviderId,requestedAccountId,
 *   requestedModelId,requestedModelName,effectiveModelId,effectiveModelName,
 *   requestedPersona,effectivePersona,additiveRoleKind,status,substitutionReason,
 *   evidenceNote}.
 * CollaborationMessage: {id,runId,senderKind,senderId,senderName,recipientIds[],
 *   messageType,body,replyTo,createdAt,sequence}.
 *
 * Namespace: every action is `collab-*`. `window.PM56_COLLAB` exposes the store
 * and helpers for a harness, and `reset-all` is chained (never clobbered) to
 * restore every fixture, matching the pattern at the bottom of goals.js.
 */
(function () {
  'use strict';
  var D = window.PM56_DATA; if (!D) return;
  var EXT = window.PM56_EXT; if (!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function list(v) { return Array.isArray(v) ? v : []; }
  function nowIso() { return new Date().toISOString(); }
  function clamp(n, a, b) { n = Number(n); if (!isFinite(n)) return a; return Math.max(a, Math.min(b, n)); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /* =====================================================================
     0. SHARED RUNTIME
     ---------------------------------------------------------------------
     plans.js (loaded immediately before this module — see build.py MODULES)
     installs an identity-preserving merging accessor on window.PM56_RUNTIME
     before app.js's own end-of-file diagnostics assignment can shadow it, so
     the plain capture below stays valid for the life of the page. If a
     reviewer loads this module in isolation (plans.js absent), RT is simply
     the ordinary object app.js's shim already created — still correct, just
     without that extra durability guarantee.
     ===================================================================== */
  RT.composer = RT.composer || { buffers: {}, destination: null, history: {}, historyIndex: {}, destinationProviders: [], historyBlockers: [], commitHooks: [] };
  RT.composer.destinationProviders = RT.composer.destinationProviders || [];
  RT.composer.commitHooks = RT.composer.commitHooks || [];

  var KINDS = ['crew', 'brainstorm', 'review', 'chat_room'];
  var KIND_LABEL = { crew: 'Crew', brainstorm: 'BrainStorm', review: 'Review', chat_room: 'Chat Room' };
  /* neon icons (step 3B): the kind marks are the concept glyphs everywhere (one glyph per concept) */
  var KIND_ICON = { crew: 'kind-crew', brainstorm: 'kind-brainstorm', review: 'kind-review', chat_room: 'kind-chat_room' };

  /* =====================================================================
     1. DEFINITIONS — Settings-sourced defaults per kind (owner doc §14).
     Settings_System.md owns the actual persisted keys; this is the read-time
     projection this module needs to prefill a modal. Field names mirror the
     `assistant.multi_agent.*` keys named in §14 so a reader can line them up.
     ===================================================================== */
  var DEFINITIONS_SEED = {
    crew: {
      coordinator: 'parent_assistant', assignmentStrategy: 'manager_directed',
      /* Owner answer E-02 (2026-09-27): Crew Auto is the assistant's permission to call a Crew by itself when a job
         needs one, ON by default as the project default, with default rules; a chat's Crew Auto check overrides it
         for that chat (RTC.crewAutoChat). The policy shape is crew-protocol.js commitPolicy's. */
      memberCount: 3, parallelism: 3, autoEnabled: true, autoConfigured: true, autoComplexity: 'high',
      autoMaxMembers: 4, contextSharing: 'shared', synthesisPolicy: 'coordinator_adjudicated',
      timeLimitMinutes: 45, tokenLimit: 400000, costLimitUsd: 6,
      autoPolicy: { revision: 1, isDefault: true, name: 'Crew Auto default', purpose: '',
        rows: [{ rowId: 'auto-default-1', role: 'Builder', requestedModelId: 'sonnet46', persona: 'Implementer', requestedEffort: '', requestedFast: false, additiveRoleKind: 'none' },
          { rowId: 'auto-default-2', role: 'Builder', requestedModelId: 'sonnet46', persona: 'Implementer', requestedEffort: '', requestedFast: false, additiveRoleKind: 'none' },
          { rowId: 'auto-default-3', role: 'Checker', requestedModelId: 'sonnet46', persona: 'Reviewer', requestedEffort: '', requestedFast: false, additiveRoleKind: 'none' }],
        config: { coordinator: 'parent_assistant', assignmentStrategy: 'manager_directed', parallelism: 3, autoComplexity: 'high', autoMinIndependent: '2', timeLimitMinutes: 45, tokenLimit: 400000, costLimitUsd: 6 },
        maxMembers: 4 },
      autoRosterTemplate: [{ role: 'Builder', requestedModelId: 'sonnet46', persona: 'Implementer' }, { role: 'Builder', requestedModelId: 'sonnet46', persona: 'Implementer' }, { role: 'Checker', requestedModelId: 'sonnet46', persona: 'Reviewer' }]
    },
    brainstorm: {
      coreParticipants: 4, questionLimit: 20, grillExtension: 25,   /* Correction v4 QMAX-002/003 */
      externalResearch: 'maximum', independentProposals: true, debateRounds: 2,
      voting: 'evidence_weighted', preserveDissent: true, timeLimitMinutes: 90,
      tokenLimit: 900000, costLimitUsd: 14, concurrency: 4
    },
    review: {
      strategy: 'multi_pass', reviewerCount: 3, blindInitialPass: true,
      peerCorroboration: true, preserveDissent: true, autoRepair: false,
      timeLimitMinutes: 30, tokenLimit: 350000, costLimitUsd: 5
    },
    chat_room: {
      /* ROOM-002: the configuration a Chat Room actually has — participants,
         MODERATOR, turn policy, mentions/replies, tools, rounds/stop and the
         output. Only the counts and limits were declared before, so the modal
         had no default for the protocol it is defined by. */
      participantCount: 4,
      moderator: 'dedicated_moderator',
      moderatorPersona: 'Product Manager',
      turnPolicy: 'moderated',
      mentionsEnabled: true, repliesEnabled: true,
      tools: 'read_only',
      maxRounds: 5, stopCondition: 'rounds_or_moderator_close',
      output: 'transcript_plus_optional_summary',
      timeLimitMinutes: 60, costLimitUsd: 4
    }
  };
  RT.collab = RT.collab || {};
  var RTC = RT.collab;
  RTC.definitions = RTC.definitions || JSON.parse(JSON.stringify(DEFINITIONS_SEED));
  RTC.crewAutoChat = RTC.crewAutoChat || {};
  RTC.runs = RTC.runs || [];
  RTC.draft = RTC.draft || null;
  RTC.seq = RTC.seq || 0;

  function rid(prefix) { RTC.seq += 1; return prefix + '-' + RTC.seq; }

  /* =====================================================================
     2. MODEL / PROVIDER LOOKUP
     ===================================================================== */
  function modelById(id) {
    var arr = list(D.models);
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function modelLabel(id) {
    var m = modelById(id);
    return m ? m.name + ' · ' + m.provider : (id || 'Unassigned');
  }
  /* One demo-only "currently unavailable" route so a reviewer can DRIVE a
     substitution instead of only reading a pre-baked one. Never a hidden
     rule: the modal names it next to the picker (§B/COLLAB-004 build note). */
  var UNAVAILABLE_DEMO = { 'kimi-k3-turbo': 'Provider window exhausted on this account.' };
  function fallbackModelFor(id) {
    var m = modelById(id);
    if (!m) return null;
    var arr = list(D.models);
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].provider === m.provider && arr[i].id !== id && !UNAVAILABLE_DEMO[arr[i].id]) return arr[i];
    }
    for (var j = 0; j < arr.length; j++) if (!UNAVAILABLE_DEMO[arr[j].id]) return arr[j];
    return null;
  }

  /* =====================================================================
     3. PARTICIPANT + RUN CONSTRUCTORS
     ===================================================================== */
  function mkParticipant(o) {
    var reqId = o.requestedModelId;
    var unavailable = !!UNAVAILABLE_DEMO[reqId];
    var eff = unavailable ? fallbackModelFor(reqId) : modelById(reqId);
    return {
      id: o.id || rid('p'),
      runId: o.runId,
      role: o.role,
      name: o.name || o.role,
      requestedProviderId: (modelById(reqId) || {}).provider || o.requestedProviderId || '',
      requestedAccountId: (modelById(reqId) || {}).accountId || '',
      requestedModelId: reqId,
      requestedModelName: modelLabel(reqId),
      requestedEffort: o.requestedEffort || '', requestedFast: !!o.requestedFast,
      effectiveModelId: unavailable ? (eff ? eff.id : null) : reqId,
      effectiveModelName: unavailable ? (eff ? modelLabel(eff.id) : 'None available') : modelLabel(reqId),
      requestedPersona: o.persona,
      effectivePersona: o.persona,
      additiveRoleKind: o.additiveRoleKind || 'none',
      status: unavailable && !eff ? 'disabled' : (o.status || 'waiting'),
      substitutionReason: unavailable ? (UNAVAILABLE_DEMO[reqId] + (eff ? ' Substituted within the same provider.' : ' No same-provider substitute was configured, so the slot is disabled rather than run on an arbitrary model.')) : null,
      evidenceNote: o.evidenceNote || '',
      blockedReason: o.blockedReason || null,
      current: o.current || '',
      /* Additive Correction v4 (PART-001..006). `required` comes from the
         workflow DEFINITION, never from whether a model happened to be
         available. `outcome` is the single explicit terminal disposition:
         completed | failed | timed_out | unavailable | canceled |
         explicitly_waived. A slot with no callback is NOT completed. */
      /* An ADDITIVE role (Wonderer, Grill Me) is optional by definition: it
         supplements the core roster and can never gate clean completion. The
         old default made every slot required unless a caller remembered to say
         otherwise, so a seeded Wonderer became a required slot -- the exact
         "additive specialist silently replaces a core role" the correction
         forbids, inverted into "additive specialist blocks completion". */
      required: o.required !== undefined ? o.required !== false
              : ((o.additiveRoleKind || 'none') === 'none'),
      /* PART-022: repeated slots on the SAME model are independent passes, so
         each one carries its own session identity. Without it there was no way
         to tell a genuinely fresh pass from a reused context claiming to be
         blind, which is what the correction says must be evidenced or
         disclosed as constrained. */
      sessionId: o.sessionId || ('sess-' + (o.id || rid('p')) + '-' + Math.floor(Math.random()*1e6).toString(36)),
      sessionIsolation: o.sessionIsolation || 'fresh',
      outcome: o.outcome || null,
      vote: o.vote || null,
      votingRole: o.votingRole === undefined ? (o.additiveRoleKind ? o.additiveRoleKind === 'none' : true) : !!o.votingRole,
      waiver: o.waiver || null,
      attempts: o.attempts || [],
      assignmentRevision: o.assignmentRevision || 1,
      demo: true
    };
  }
  /* A stable digest of the configuration a Start was admitted with, so a
     replay carrying the same idempotency key but a DIFFERENT configuration is
     detectable rather than silently accepted. */
  function cfgFingerprint(config, participants){
    var basis = JSON.stringify([config, (participants||[]).map(function(p){
      return [p.role, p.requestedModelId, p.requestedPersona, p.additiveRoleKind, p.required];
    })]);
    var x=0x811c9dc5;
    for(var i=0;i<basis.length;i++){ x^=basis.charCodeAt(i); x=(x*0x01000193)>>>0; }
    return 'cfg:'+('00000000'+x.toString(16)).slice(-8);
  }

  function mkRun(o) {
    var runId = o.id || rid('run');
    return {
      id: runId,
      kind: o.kind,
      threadId: o.threadId,
      title: o.title,
      purpose: o.purpose || '',
      status: o.status || 'configuring',
      blockedReason: o.blockedReason || null,
      definitionRevision: o.definitionRevision || 1,
      config: o.config || {},
      participants: o.participants || [],
      coordinator: o.coordinator || null,
      messages: o.messages || [],
      artifacts: o.artifacts || [],
      usage: o.usage || { inputTokens: 0, outputTokens: 0, costUsd: 0 },
      createdAt: o.createdAt || nowIso(),
      completedAt: o.completedAt || null,
      stopEpoch: 0,
      degraded: !!o.degraded,
      /* Additive Correction v4 (PART-016/019): part of the ONE run shape, so a
         Crew with required outputs and a Chat Room without are still the same
         record. A seed that bolted these on afterwards produced a second
         shape and the uniform-shape predicate caught it. */
      expectedOutputs: o.expectedOutputs || [],
      pendingUserDecision: !!o.pendingUserDecision,
      /* MODAL-017: run admission is idempotent on THIS key, not on the modal
         instance. A repeated Start with the same key returns the original run;
         the same key with a changed configuration is rejected rather than
         quietly starting a second run under the old identity. */
      idempotency_key: o.idempotency_key ||
        ((o.kind||'run') + ':' + (o.threadId||'-') + ':' + runId + ':rev' + (o.definitionRevision || 1)),
      config_fingerprint: o.config_fingerprint || cfgFingerprint(o.config || {}, o.participants || []),
      crew: o.crew || null,
      brainstorm: o.brainstorm || null,
      review: o.review || null,
      chatRoom: o.chatRoom || null,
      demo: true
    };
  }
  var msgSeq = { };
  function mkMsg(run, o) {
    PM56_TX.set(msgSeq,run.id,(msgSeq[run.id] || 0) + 1);
    return {
      id: o.id || rid('msg'),
      runId: run.id,
      senderKind: o.senderKind || 'participant',
      senderId: o.senderId || null,
      senderName: o.senderName || 'System',
      recipientIds: o.recipientIds || [],
      messageType: o.messageType || 'message',
      body: o.body || '',
      replyTo: o.replyTo || null,
      createdAt: o.createdAt || nowIso(),
      sequence: msgSeq[run.id]
    };
  }
  function findRun(id) { var arr = RTC.runs; for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function runsForThread(tid) { return RTC.runs.filter(function (r) { return r.threadId === tid; }); }
  function participant(run, pid) { var arr = run.participants; for (var i = 0; i < arr.length; i++) if (arr[i].id === pid) return arr[i]; return null; }

  /* =====================================================================
     4. SEED RUNS — one worked example per kind, each on the demo thread its
     topic actually fits, continuing this wave's shared 'query' narrative
     (Goal + Plan already live there via goals.js / plans.js) rather than
     inventing a fifth thread. Every negative path the owner doc calls out by
     name is represented for real, not just described: a disabled participant
     with a substitution reason, a blocked assignment with a real permission
     reason, a hard-constraint disqualification, preserved dissent, an
     excluded stale-pack review pass, and a Chat Room message that created
     nothing until an explicit promotion.
     ===================================================================== */
  function buildSeedRuns() {
    var runs = [];

    /* --- CREW · 'query' — executes the plan.js plan-card-v2 'ap-index' V5,
       binding to it the way Build With Crew is specified to (§5.4/CREW-006). */
    var crew = mkRun({
      id: 'crew-query-perf', kind: 'crew', threadId: 'query',
      title: 'Crew · Query Performance Rollout',
      purpose: 'Execute the accepted index-and-batching plan under a coordinator, in parallel where assignments are independent.',
      status: 'running', definitionRevision: 1,
      config: { coordinator: 'parent_assistant', assignmentStrategy: 'manager_directed', parallelism: 3, contextSharing: 'shared', permissionCeiling: 'inherited from Agent mode on this thread' },
      coordinator: { kind: 'parent_assistant', label: 'Parent assistant (this thread)' },
      participants: [
        mkParticipant({ role: 'Migration Engineer', requestedModelId: 'sonnet46', persona: 'Implementer', status: 'working', current: 'Publishing the write-amplification comparison artifact.' }),
        mkParticipant({ role: 'Benchmark Runner', requestedModelId: 'qwen38-coder', persona: 'Implementer', status: 'waiting', current: 'Dependency ps-0/ps-1 satisfied; queued behind concurrency limit 3.' }),
        mkParticipant({ role: 'Rollback Auditor', requestedModelId: 'glm52', persona: 'Reviewer', status: 'blocked', blockedReason: 'Rehearsing the rollback requires restoring a schema snapshot on a shared host; that needs explicit approval this participant cannot self-grant.' })
      ],
      crew: {
        boundPlanId: 'ap-index', boundPlanVersion: 5,
        boundTodoIds: ['Add the concurrent-write-load check to the todo list'],
        assignments: [
          { id: 'a1', title: 'Split migration 0043 into a no-transaction file', description: 'CREATE INDEX CONCURRENTLY cannot run inside this repository’s default transaction wrapper.', assignedRole: 'Migration Engineer', dependsOn: [], expectedOutput: 'A no-transaction migration file plus a green migration test run.', status: 'done', evidenceNote: 'migrations/0043_events_tenant_created.sql landed with pm:no-transaction; migration test suite green.' },
          { id: 'a2', title: 'Measure write amplification at 50,000 inserts', description: 'Confirm the index stays under the accepted 8% ceiling under a realistic insert volume.', assignedRole: 'Benchmark Runner', dependsOn: ['a1'], expectedOutput: 'A measured (not estimated) write-overhead percentage against 50,000 inserts.', status: 'pending', evidenceNote: '' },
          { id: 'a3', title: 'Rehearse the rollback against a restored snapshot', description: 'Run the down migration against a restored snapshot before the forward migration ships.', assignedRole: 'Rollback Auditor', dependsOn: ['a1'], expectedOutput: 'A recorded rollback rehearsal log with restore and down-migration timings.', status: 'blocked', evidenceNote: '' }
        ]
      },
      usage: { inputTokens: 61200, outputTokens: 8800, costUsd: 0.34 }
    });
    crew.messages.push(mkMsg(crew, { senderKind: 'coordinator', senderName: 'Coordinator', messageType: 'handoff', body: 'Three independent-enough assignments: split the migration, measure amplification, rehearse rollback. The last two both depend on the first; they do not depend on each other.' }));
    crew.messages.push(mkMsg(crew, { senderKind: 'participant', senderId: crew.participants[0].id, senderName: crew.participants[0].name, messageType: 'response', body: 'Migration split and merged. Test suite is green. Publishing evidence now.' }));
    crew.messages.push(mkMsg(crew, { senderKind: 'participant', senderId: crew.participants[2].id, senderName: crew.participants[2].name, messageType: 'warning', body: 'The rollback rehearsal needs a restored snapshot on a shared host. I am not going to request that permission on my own authority — routing it to the parent ceiling.' }));
    crew.messages.push(mkMsg(crew, { senderKind: 'system', senderName: 'System', messageType: 'conflict', body: 'Permission request from Rollback Auditor is pending against the parent thread’s ceiling. The assignment is blocked, not failed, and the rest of the crew continues.' }));
    runs.push(crew);

    /* --- BRAINSTORM · 'plan-deep' — Deep Plan -> BrainStorm, mid-protocol at
       the vote phase, with a hard-constraint disqualification, a Wonderer
       lead, and one preserved dissent so synthesis has real material to keep. */
    var bs = mkRun({
      id: 'brainstorm-provider-failover', kind: 'brainstorm', threadId: 'plan-deep',
      title: 'BrainStorm · Provider Failover Strategy',
      purpose: 'Decide how the assistant fails over between model providers during a quota exhaustion.',
      status: 'running', definitionRevision: 1,
      config: { coreParticipants: 4, questionLimit: 20, grillExtension: 25, grillMeEnabled: false, externalResearch: 'maximum', independentProposals: true, debateRounds: 2, voting: 'evidence_weighted', preserveDissent: true },
      coordinator: { kind: 'dedicated_synthesis_model', label: 'Claude Opus 5 (synthesis)' },
      participants: [
        mkParticipant({ role: 'Architecture', requestedModelId: 'opus5', persona: 'Architect', status: 'done', current: 'Proposal submitted.' }),
        mkParticipant({ role: 'Product', requestedModelId: 'sonnet46', persona: 'Product Manager', status: 'done', current: 'Proposal submitted; dissenting on the final pick.' }),
        mkParticipant({ role: 'Implementation', requestedModelId: 'qwen38-coder', persona: 'Implementer', status: 'done', current: 'Proposal submitted.' }),
        mkParticipant({ role: 'Adversarial Review', requestedModelId: 'glm52', persona: 'Reviewer', status: 'done', current: 'Flagged a hard-constraint conflict on the fully automatic option.' }),
        mkParticipant({ role: 'Wonderer', requestedModelId: 'sonnet46-personal', persona: 'Wonderer', additiveRoleKind: 'wonderer', status: 'done', current: '4 connected leads handed to the evidence round.' })
      ],
      brainstorm: {
        phase: 'vote',
        questionBank: {
          baselineLimit: 20, grillExtension: 25, grillMeEnabled: false,
          askedIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
          resolvedIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
          duplicateIds: ['q6'], researchRoutedIds: ['q4', 'q7']
        },
        proposals: [
          { id: 'prop-a', participantRole: 'Architecture', approach: 'PM-owned failover pool with a health-checked ring per capability class.', assumptions: 'Provider health is cheap to probe every few seconds.', benefits: 'One canonical failover decision; no per-feature drift.', costs: 'New always-on health-check surface to operate.', risks: 'A flapping provider could thrash the ring without hysteresis.', migrations: 'Existing static routes migrate to ring membership behind a flag.', crossSystemEffects: 'Touches every provider adapter (Plans/CLI_Bridged_Providers.md, Plans/Provider_OpenCode.md).', validation: 'Chaos-test one provider outage per environment before rollout.', rollback: 'Ring disabled reverts to today’s static route instantly.', evidenceRefs: ['research: provider status-page latency samples'], proposalRound: 1 },
          { id: 'prop-b', participantRole: 'Product', approach: 'Automatic failover for work accounts; explicit confirmation before any personal-account spend.', assumptions: 'Users tolerate a short prompt during an outage more than an unexpected personal charge.', benefits: 'Protects the one constraint users have named unprompted twice already.', costs: 'One extra decision point mid-incident for personal-account users.', risks: 'A user who is away cannot approve, so the thread waits.', migrations: 'No schema change; a policy flag per account.', crossSystemEffects: 'Interacts with Plans/Multi-Account.md ceilings.', validation: 'Replay the last three real quota incidents against the policy.', rollback: 'Flag off returns to today’s behavior.', evidenceRefs: ['thread history: two independent prior asks not to auto-spend personal accounts'], proposalRound: 1 },
          { id: 'prop-c', participantRole: 'Implementation', approach: 'Shared resolver with a per-provider circuit breaker; failover is a resolver concern, not a UI concern.', assumptions: 'The existing model resolver already sits in the one place every route passes through.', benefits: 'Smallest surface area; reuses code that is already tested.', costs: 'Circuit-breaker thresholds need real incident data to tune.', risks: 'A silent resolver-level failover is invisible in the UI unless it also emits a requested/effective disclosure.', migrations: 'Wrap the resolver; no caller changes.', crossSystemEffects: 'All four collaborative kinds and the primary Assistant path share one resolver.', validation: 'Unit tests per breaker state plus one integration replay.', rollback: 'Breaker forced permanently closed.', evidenceRefs: ['code: existing resolver entry point'], proposalRound: 1 }
        ],
        debateRounds: 2,
        votes: [
          { id: 'v1', proposalId: 'prop-b', participantRole: 'Architecture', position: 'support', confidence: 'high', reason: 'Resolver-level breaker (prop-c) is the right mechanism, but the account-spend boundary in prop-b has to sit above it as policy.', evidenceRefs: [] },
          { id: 'v2', proposalId: 'prop-b', participantRole: 'Implementation', position: 'support', confidence: 'medium', reason: 'Can be built on the resolver from prop-c without conflict.', evidenceRefs: [] },
          { id: 'v3', proposalId: 'prop-b', participantRole: 'Adversarial Review', position: 'support', confidence: 'high', reason: 'Only option that does not violate the personal-account constraint.', evidenceRefs: [] },
          { id: 'v4', proposalId: 'prop-a', participantRole: 'Product', position: 'oppose', confidence: 'medium', reason: 'A fully automatic ring still risks a silent personal-account failover unless the confirmation gate is bolted back on — at which point it is prop-b with extra ring machinery.', evidenceRefs: [] }
        ],
        hardConstraintViolations: [
          { approach: 'Fully automatic cross-account failover (an early variant of prop-a)', constraint: 'Never spend from a personal account without explicit confirmation.', detail: 'Disqualified regardless of the ring design’s other merits; it is visible in the rejected-alternatives section and was never revived by discussion.' }
        ],
        dissent: [
          { participantRole: 'Product', position: 'oppose (of the synthesis leaning toward prop-c-as-mechanism)', confidence: 'medium', reason: 'The resolver-level breaker in prop-c is the right plumbing, but without prop-b’s explicit account-boundary sitting visibly above it, a future caller could still wire automatic personal-account failover through the resolver by accident. This dissent stays open until that boundary is a first-class resolver parameter, not a caller convention.' }
        ],
        /* WONV-002/005, WONDER-002/003: ONE lead vocabulary. This fixture used
           `connection`/`status` while the other used `seed`/`tether`/`state`,
           so the same object had two shapes and a reader could not tell a
           tethered hypothesis from a researched lead without knowing which
           fixture it came from. `seed` names what the lead hangs off,
           `tether` says how, `state` is the disposition, and `enteredPlan`
           records whether it has been allowed into a Plan. */
        wondererLeads: [
          { id: 'w1', lead: 'CDN edge-failover practice favors a gradual canary percentage over a binary cutover.',
            seed: 'health-checked ring in prop-a',
            tether: 'Suggests the health-checked ring in prop-a could shed traffic gradually instead of all-or-nothing, reducing the flapping risk Architecture flagged.',
            state: 'hypothesis', enteredPlan: false },
          { id: 'w2', lead: 'Airline overbooking policy publishes the compensation rule in advance rather than deciding case-by-case.',
            seed: 'account-spend policy in prop-b',
            tether: 'Argues for a fixed, disclosed account-spend policy (prop-b) over an ad hoc mid-incident judgment call.',
            state: 'hypothesis', enteredPlan: false }
        ],
        provisioning: [
          { id: 'rc-1', capability: 'provider-status-checker CLI', state: 'ready', scope: 'run-scoped, temporary', permissionRequestRef: 'perm-req-771', cleanupRequired: true, note: 'Resolved an existing capability first; nothing was installed persistently.' }
        ],
        synthesis: null
      },
      usage: { inputTokens: 214000, outputTokens: 31500, costUsd: 2.68 }
    });
    bs.messages.push(mkMsg(bs, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Phase 1 (Intake and frontier): Recorded history: 9 of 20 baseline questions asked and resolved; 2 duplicates merged; 2 factual questions routed to research instead of asked. Grill Me is off, so the ceiling stays at 20.' }));
    bs.messages.push(mkMsg(bs, { senderKind: 'participant', senderId: bs.participants[0].id, senderName: bs.participants[0].name, messageType: 'response', body: 'Blind proposal submitted before seeing any other participant’s output: a PM-owned, health-checked failover ring.' }));
    bs.messages.push(mkMsg(bs, { senderKind: 'participant', senderId: bs.participants[3].id, senderName: bs.participants[3].name, messageType: 'conflict', body: 'The early fully-automatic cross-account variant of the ring proposal violates a hard user constraint. Flagging it as disqualified regardless of how the vote goes.' }));
    bs.messages.push(mkMsg(bs, { senderKind: 'participant', senderId: bs.participants[1].id, senderName: bs.participants[1].name, messageType: 'vote', body: 'Dissenting from where the room is leaning: the account-spend boundary has to be first-class, not a caller convention on top of the resolver.' }));
    runs.push(bs);

    /* --- REVIEW · 'subagents' — Multi-Pass, 3 reviewers, one model reused on
       purpose (Opus 5 on R1 and R3) to prove two slots on the same model are
       never collapsed, and R3 deliberately excluded for a stale target pack
       (REVIEW-009 / CWR-006 negative path). */
    var rv = mkRun({
      id: 'review-orchestrator-boundary', kind: 'review', threadId: 'subagents',
      title: 'Multi-Pass Review · Orchestrator Boundary Changes',
      purpose: 'Review the changes that let a Crew run request child concurrency from the orchestrator.',
      status: 'running', definitionRevision: 1,
      config: { strategy: 'multi_pass', reviewerCount: 3, blindInitialPass: true, peerCorroboration: true, preserveDissent: true, autoRepair: false },
      coordinator: { kind: 'dedicated_synthesis_model', label: 'Claude Sonnet 4.6 (adjudicator)' },
      participants: [
        mkParticipant({ role: 'Reviewer 1', requestedModelId: 'opus5', persona: 'Reviewer', status: 'done', current: 'Pass complete against the frozen pack.' }),
        mkParticipant({ role: 'Reviewer 2', requestedModelId: 'glm52', persona: 'Reviewer', status: 'done', current: 'Pass complete against the frozen pack.' }),
        mkParticipant({ role: 'Reviewer 3', requestedModelId: 'opus5', persona: 'Reviewer', status: 'done', current: 'Pass complete, but against a superseded target pack — excluded from corroboration.' })
      ],
      review: {
        targetPack: {
          targetKind: 'changes', targetRefs: ['orchestrator-subagent-integration.md#executionLimits', 'crew.concurrency clamp'],
          targetHashes: { primary: 'a1c9f02e' }, frozenAt: nowIso(),
          userConstraintRefs: ['Never exceed the orchestrator’s posted concurrency ceiling.'],
          acceptanceRefs: ['Configured concurrency above the ceiling is clamped and disclosed, never silently honored.']
        },
        staleTargetHash: 'f77e10bb',
        /* MODAL-009/010: the target froze at Start, and it CHANGED while the
           modal was open. The user must choose; nothing may swap silently and
           the two hashes may never be combined into one mixed review. */
        staleTarget: {
          detected_at: nowIso(),
          frozen_hash: 'a1c9f02e',
          current_hash: 'f77e10bb',
          choices: [
            { id:'refresh_to_current', label:'Refresh to the current target', target_hash:'f77e10bb' },
            { id:'use_frozen_target',  label:'Review the identified frozen target', target_hash:'a1c9f02e', immutable:true }
          ],
          chosen: null,
          mixed: false
        },
        findings: [
          { id: 'f1', findingKey: 'child-spawn-bypasses-ceiling', category: 'correctness', severity: 'critical', claim: 'A nested Crew inside a Crew can request child concurrency that is never clamped against the orchestrator’s total active-agent ceiling.', affectedRefs: ['executionLimits.totalActiveAgents'], evidenceRefs: ['trace: nested-crew-concurrency-repro'], originatingReviewerIds: [0, 1], reviewerVotes: [{ reviewerIndex: 0, disposition: 'confirmed', confidence: 'high', evidence: 'Reproduced: nested request admits 6 when the ceiling is 4.' }, { reviewerIndex: 1, disposition: 'confirmed', confidence: 'high', evidence: 'Same repro from a different entry point.' }], disposition: 'confirmed', dissent: null, proposedRemediation: 'Clamp nested concurrency against the ceiling remaining at spawn time, not just at the top level.' },
          { id: 'f2', findingKey: 'retry-identity-not-logged', category: 'observability', severity: 'minor', claim: 'A retried child attempt does not log its own retry identity, only the original attempt id.', affectedRefs: ['retry pathway'], evidenceRefs: ['log sample'], originatingReviewerIds: [0], reviewerVotes: [{ reviewerIndex: 1, disposition: 'uncertain', confidence: 'low', evidence: 'Could not reproduce from the pack alone; the log sample may be from an older build.' }], disposition: 'uncertain', dissent: 'Reviewer 1 still holds this as a real minor finding; Reviewer 2 could not confirm it from the frozen pack. Recorded as uncertain rather than manufacturing agreement either way.', proposedRemediation: 'Add the retry attempt id to the child log line if reproduced against a current pack.' },
          { id: 'f3', findingKey: 'provider-coupling-undocumented', category: 'documentation', severity: 'major', claim: 'The rule that couples a whole crew to one provider is enforced but not documented anywhere a reviewer can cite.', affectedRefs: ['provider-coupling rule'], evidenceRefs: ['grep: no matching doc section'], originatingReviewerIds: [1], reviewerVotes: [], disposition: 'confirmed', dissent: null, proposedRemediation: 'Document the coupling rule in the orchestrator owner doc and cross-reference it from Collaborative_Workflows.md §5.5.' }
        ],
        excludedFindings: [
          { id: 'f4-excluded', reviewerIndex: 2, targetHash: 'f77e10bb', claim: 'A finding from Reviewer 3, produced against a target pack that changed mid-run.', reason: 'Different target_hash than the frozen pack (a1c9f02e vs f77e10bb). Excluded from corroboration and reported as excluded rather than silently merged or silently dropped.' }
        ]
      },
      /* REVIEW-010: the review OUTPUT is a versioned artifact with both
         projections plus a short thread summary. The transcript alone is not
         the deliverable. */
      artifacts: [{ id: 'rev-artifact-orchestrator-boundary', kind: 'review_report', version: 2,
        formats: ['rich', 'markdown'], title: 'Multi-Pass Review · Orchestrator Boundary Changes',
        coverage: 'multi_pass_3', target_hash: 'a1c9f02e',
        summary: 'Three passes over the frozen pack: one confirmed critical, one confirmed major, one uncertain with dissent retained, one excluded for a different target hash.' }],
      usage: { inputTokens: 96000, outputTokens: 12100, costUsd: 0.71 }
    });
    rv.messages.push(mkMsg(rv, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Target pack frozen at a1c9f02e. All three initial passes admitted concurrently; each reviewer’s prompt carried no other reviewer’s findings, output or identity.' }));
    rv.messages.push(mkMsg(rv, { senderKind: 'participant', senderId: rv.participants[2].id, senderName: rv.participants[2].name, messageType: 'warning', body: 'My pass ran against target_hash f77e10bb — the pack changed after I started. Reporting my findings as excluded from this run’s corroboration rather than folding them in.' }));
    rv.messages.push(mkMsg(rv, { senderKind: 'coordinator', senderName: 'Adjudicator', messageType: 'finding', body: 'Normalized 2 of 3 reports into 3 candidate findings (one duplicate merge). Corroboration round complete: 2 confirmed, 1 uncertain with preserved dissent, 1 excluded for a stale pack.' }));
    runs.push(rv);

    /* --- CHAT ROOM · 'plain' — ordinary discussion that has created nothing
       yet, so the "no auto-promotion" invariant (ROOM-004) has something real
       to hold. */
    var room = mkRun({
      /* NOT 'plain'. That thread is the concept's deliberate proof that an
         ordinary text-only conversation renders with zero cards, and
         tests/audit.mjs asserts exactly that; seeding a run there put one
         Chat Room card into it and broke the invariant. 'crew' is a
         collaboration thread already, so the run belongs there. */
      id: 'chatroom-onboarding', kind: 'chat_room', threadId: 'crew',
      title: 'Chat Room · Onboarding Redesign Options',
      purpose: 'Debate three onboarding directions before anything is written to a Plan.',
      status: 'running', definitionRevision: 1,
      config: { turnPolicy: 'moderated', maxRounds: 5, roundsSoFar: 2, moderator: 'Product Manager persona (dedicated)' },
      coordinator: { kind: 'dedicated_moderator', label: 'Moderator (Product Manager persona)' },
      participants: [
        mkParticipant({ role: 'Product', requestedModelId: 'sonnet46', persona: 'Product Manager', status: 'waiting', current: 'Waiting for the next moderated turn.' }),
        mkParticipant({ role: 'Design Systems', requestedModelId: 'opus5', persona: 'Architect', status: 'waiting', current: 'Waiting for the next moderated turn.' }),
        mkParticipant({ role: 'Growth', requestedModelId: 'qwen38-coder', persona: 'Implementer', status: 'waiting', current: 'Waiting for the next moderated turn.' })
      ],
      chatRoom: { roundsSoFar: 2, turnPolicy: 'moderated', promotions: [] },
      usage: { inputTokens: 38400, outputTokens: 5200, costUsd: 0.22 }
    });
    room.messages.push(mkMsg(room, { senderKind: 'user', senderName: 'You', messageType: 'message', body: 'Three options on the table: progressive disclosure, a guided checklist, or skip-by-default with a resume banner. Go.' }));
    room.messages.push(mkMsg(room, { senderKind: 'participant', senderId: room.participants[0].id, senderName: room.participants[0].name, messageType: 'message', body: 'Skip-by-default measures better in the first session but worse in week-two retention in every dataset I can cite — I would not default to it without a resume nudge that is louder than a banner.' }));
    room.messages.push(mkMsg(room, { senderKind: 'participant', senderId: room.participants[1].id, senderName: room.participants[1].name, messageType: 'message', recipientIds: [room.participants[0].id], replyTo: null, body: '@Product agreed on the nudge. Progressive disclosure is the safest default from a design-systems angle: it reuses components we already have, the guided checklist needs four new ones.' }));
    room.messages.push(mkMsg(room, { senderKind: 'participant', senderId: room.participants[2].id, senderName: room.participants[2].name, messageType: 'message', body: 'From growth data on the last three launches, the guided checklist has the best completion rate when it is under 5 steps. I would not rule it out purely on build cost.' }));
    room.messages.push(mkMsg(room, { senderKind: 'coordinator', senderName: 'Moderator', messageType: 'message', body: 'Round 2 close: leaning progressive disclosure with a louder resume nudge, growth dissenting toward a short guided checklist. Nothing here is a Plan yet — say the word and I will promote a conclusion.' }));
    runs.push(room);


    /* ------------------------------------------------------------------
       Additive Correction v4 seeds (CONCEPT-011). Each of these exists so a
       state the correction names is REAL on load rather than described:
         single   — a one-reviewer Review that refuses to claim corroboration
         partial  — 3 requested, 2 completed, 1 failed: attention-required
         tievote  — a BrainStorm tie with an ACTIVE Wonderer abstaining
         coordfail— a Crew whose coordinator failed and a missing output
         roomgone — a Chat Room continuing with a failed member, no fabrication
       ------------------------------------------------------------------ */
    var single = mkRun({
      kind:'review', threadId:'subagents', title:'Single Agent Review · migration guard',
      purpose:'One fresh independent pass over the migration guard change.',
      status:'completed', config:{ strategy:'single_agent', reviewerCount:1 },
      coordinator:{ kind:'dedicated_synthesis_model', label:'Synthesis model' },
      participants:[ mkParticipant({ role:'Reviewer', requestedModelId:'opus5', persona:'Reviewer',
        status:'done', outcome:'completed', required:true, current:'One independent pass, fresh context.' }) ]
    });
    single.review = { requestedPasses:1,
      targetPack:{ targetKind:'assistant_response', targetRefs:['migration guard diff'],
        targetHashes:{ primary:'a91c33f0' }, frozenAt:nowIso(), userConstraintRefs:[], acceptanceRefs:[] },
      findings:[], excludedFindings:[] };
    single.artifacts=[{ id:'rev-artifact-'+single.id, kind:'review_report', version:1,
      formats:['rich','markdown'], title:'Single Agent Review · migration guard',
      coverage:'single_pass', summary:'One independent pass. No corroboration is claimed.' }];
    single.messages.push(mkMsg(single,{ senderKind:'system', senderName:'System',
      body:'One reviewer was requested, so this is a single independent pass. It does not claim peer corroboration, agreement, quorum or consensus, and no multi-agent agreement section exists.' }));
    runs.push(single);

    var partial = mkRun({
      kind:'review', threadId:'subagents', title:'Multi-Pass Review · cache invalidation',
      purpose:'Three blind passes over the cache invalidation change.',
      status:'blocked', blockedReason:'Partial review: 2 of 3 requested passes completed.',
      config:{ strategy:'multi_pass', reviewerCount:3 },
      coordinator:{ kind:'dedicated_synthesis_model', label:'Synthesis model' },
      participants:[
        mkParticipant({ role:'Reviewer 1', requestedModelId:'opus5', persona:'Reviewer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Reviewer 2', requestedModelId:'opus5', persona:'Reviewer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Reviewer 3', requestedModelId:'opus5', persona:'Reviewer', status:'failed', outcome:'timed_out', required:true,
          current:'No response within the pass timeout.' })
      ]
    });
    partial.review = { requestedPasses:3,
      targetPack:{ targetKind:'assistant_response', targetRefs:['cache invalidation diff'],
        targetHashes:{ primary:'b7710a24' }, frozenAt:nowIso(), userConstraintRefs:[], acceptanceRefs:[] },
      findings:[], excludedFindings:[] };
    partial.participants[2].attempts=[{ attempt_id:'att-r3-1', outcome:'timed_out', at:nowIso(),
      requested_identity:'opus5', effective_identity:'opus5', reason:'pass timeout', epoch:0 }];
    /* REVIEW-010: the output is a versioned Rich/Markdown artifact, not only a
       transcript. A partial review still produces one; it is labelled partial
       rather than withheld. */
    partial.artifacts=[{ id:'rev-artifact-'+partial.id, kind:'review_report', version:1,
      formats:['rich','markdown'], title:'Multi-Pass Review · cache invalidation',
      coverage:'partial', summary:'2 of 3 requested passes completed; 1 timed out. Findings are reported with their coverage stated.' }];
    partial.messages.push(mkMsg(partial,{ senderKind:'system', senderName:'System',
      body:'2 of 3 requested passes completed and 1 timed out. This stays attention-required until retry, reconfiguration, or an explicit acceptance of partial review. It is not finalised as a full Multi-Pass.' }));
    runs.push(partial);

    var tievote = mkRun({
      kind:'brainstorm', threadId:'subagents', title:'BrainStorm · storage engine for the event log',
      purpose:'Two viable approaches; the vote did not separate them.',
      status:'blocked', blockedReason:'Vote tie — synthesis must resolve it on constraints and evidence.',
      config:{ questionLimit:20, grillExtension:25, debateRounds:2, voting:'evidence_weighted' },
      coordinator:{ kind:'dedicated_synthesis_model', label:'Synthesis model' },
      participants:[
        mkParticipant({ role:'Architect', requestedModelId:'opus5', persona:'Architect', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Implementer', requestedModelId:'sonnet46-personal', persona:'Implementer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Reviewer', requestedModelId:'opus5', persona:'Reviewer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Ops', requestedModelId:'haiku46', persona:'Implementer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Wonderer', requestedModelId:'sonnet46-personal', persona:'Wonderer',
          additiveRoleKind:'wonderer', required:false, status:'done', outcome:'completed',
          current:'Contributed three adjacent leads and argued in round 2, then abstained.' }),
        mkParticipant({ role:'Grill Me', requestedModelId:'haiku46', persona:'Implementer',
          additiveRoleKind:'grill_me', required:false, status:'done', outcome:'completed',
          current:'Raised the decision frontier; no automatic vote.' })
      ]
    });
    tievote.participants[0].vote='support'; tievote.participants[1].vote='support';
    tievote.participants[2].vote='oppose';  tievote.participants[3].vote='oppose';
    /* Deliberately set: an ACTIVE Wonderer that voted would be the defect. */
    tievote.participants[4].vote=null;
    tievote.brainstorm = { phase:'vote',
      questionBank:{ baselineLimit:20, grillExtension:25, grillMeEnabled:true,
                     askedIds:[], resolvedIds:[], duplicateIds:[], researchRoutedIds:[] },
      proposals:[], debateRounds:2, votes:[], hardConstraintViolations:[],
      dissent:[{ by:'Reviewer', text:'Append-only segments make compaction an operational problem nobody has owned yet.' }],
      /* WONV-002/005/008: a lead is TETHERED to its seed and carries an
         explicit disposition. `hypothesis` is not a conclusion, and only a
         `researched` or `user_decided` lead may enter a Plan. */
      wondererLeads:[
        { id:'lead-1',
          lead:'Content-addressed segment names would make replication a copy rather than a protocol.',
          seed:'append-only segment proposal',
          tether:'Follows directly from the append-only segment proposal raised in round 1.',
          state:'hypothesis', enteredPlan:false },
        { id:'lead-2',
          lead:'Compaction could be scheduled off the write path entirely.',
          seed:'compaction ownership objection',
          tether:'Follows from the Reviewer’s dissent about unowned compaction.',
          state:'researched', enteredPlan:true,
          research_ref:'research:compaction-off-path' }
      ],
      /* PART-014: the tie is broken on recorded grounds, never on response
         order or model prestige. The record names which grounds decided it. */
      synthesis:{
        outcome:'hybrid',
        decided_by:'synthesis_reasoning',
        grounds:[
          { kind:'hard_constraint', text:'The event log must survive a single-node loss; only the segmented proposal states a replication story.' },
          { kind:'evidence', text:'The 90-day retention measurement exists for segments and not for the single-table approach.' },
          { kind:'feasibility', text:'Segment compaction can be scheduled off the write path; the single-table vacuum cannot.' },
          { kind:'risk', text:'Unowned compaction is the Reviewer’s recorded objection and stays open as a To-Do rather than being resolved by the vote.' }
        ],
        rejected:'single-table with partition pruning',
        unresolved_disagreement:'Compaction ownership remains disputed and is retained, not treated as agreement.',
        not_decided_by:['response_order','model_prestige','random'] },
      provisioning:[] };
    tievote.messages.push(mkMsg(tievote,{ senderKind:'system', senderName:'System',
      body:'Support 2, oppose 2 across the four eligible voters. The Wonderer abstained by default and is excluded from the denominator — it is not counted as opposition, and the support percentage is 50% of 4, not 40% of 5. The tie is resolved by hard constraints, evidence quality, feasibility and risk in synthesis, never by response order.' }));
    runs.push(tievote);

    var coordfail = mkRun({
      kind:'crew', threadId:'subagents', title:'Crew · extract the report renderer',
      purpose:'Three specialists plus a coordinator.',
      status:'blocked', blockedReason:'Coordinator failed; a required output is missing.',
      config:{ coordinator:'dedicated_synthesis_model', parallelism:3 },
      participants:[
        mkParticipant({ role:'Coordinator', requestedModelId:'opus5', persona:'Architect',
          status:'failed', outcome:'failed', required:true, current:'Synthesis call failed twice.' }),
        mkParticipant({ role:'Extractor', requestedModelId:'sonnet46-personal', persona:'Implementer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Test author', requestedModelId:'haiku46', persona:'Implementer', status:'done', outcome:'completed', required:true }),
        mkParticipant({ role:'Doc author', requestedModelId:'haiku46', persona:'Teacher',
          status:'disabled', outcome:'explicitly_waived', required:false,
          waiver:{ actor:'user', reason:'Docs are tracked separately this sprint.', at:nowIso(), currentness:1 } })
      ]
    });
    coordfail.coordinator = coordfail.participants[0].id;
    coordfail.expectedOutputs.push(
      { id:'extracted-module', delivered:true },
      { id:'test-suite', delivered:true },
      { id:'synthesis-summary', delivered:false });
    coordfail.crew = { boundPlanId:null, boundPlanVersion:null, boundTodoIds:[], assignments:[] };
    coordfail.messages.push(mkMsg(coordfail,{ senderKind:'system', senderName:'System',
      body:'The coordinator failed. No other participant silently becomes coordinator: replacement, retry or cancellation must be explicit. The run also cannot complete cleanly while a required expected output is undelivered and unwaived.' }));
    runs.push(coordfail);

    var roomgone = mkRun({
      kind:'chat_room', threadId:'subagents', title:'Chat Room · pricing page copy',
      purpose:'Four voices on the pricing page.',
      status:'running', config:{ turnPolicy:'moderated', maxRounds:5 },
      coordinator:{ kind:'dedicated_moderator', label:'Moderator' },
      participants:[
        mkParticipant({ role:'Product', requestedModelId:'opus5', persona:'Product Manager', status:'working', required:true }),
        mkParticipant({ role:'Design', requestedModelId:'sonnet46-personal', persona:'Architect', status:'working', required:true }),
        mkParticipant({ role:'Growth', requestedModelId:'haiku46', persona:'Implementer',
          status:'failed', outcome:'unavailable', required:false,
          current:'Never joined: the account has no remaining quota for this model.' })
      ]
    });
    roomgone.chatRoom = { roundsSoFar:2, turnPolicy:'moderated', promotions:[] };
    roomgone.messages.push(mkMsg(roomgone,{ senderKind:'system', senderName:'System',
      body:'Growth never joined and is marked unavailable. The room continues under its policy with the members it has; no message is attributed to Growth, and nothing is synthesised on its behalf. Replacing the moderator would have to be explicit.' }));
    runs.push(roomgone);

    runs.forEach(function (r) { r.participants.forEach(function (p) { p.runId = r.id; }); });
    return runs;
  }

  var SEED_RUNS_JSON = JSON.stringify(buildSeedRuns());
  if (!RTC.runs.length) RTC.runs = JSON.parse(SEED_RUNS_JSON);

  function restoreFixture() {
    RTC.definitions = JSON.parse(JSON.stringify(DEFINITIONS_SEED));
    RTC.crewAutoChat = {};
    RTC.runs = JSON.parse(SEED_RUNS_JSON);
    RTC.draft = null;
    msgSeq = {};
    /* The effect ledger is the INSTRUMENT the zero-side-effect proof reads.
       A restore that left it holding a previous run's counters made every
       later "no durable effect on cancel" reading unreliable, because the
       baseline was already dirty. Rejected callbacks are evidence of a past
       run and belong to that run, so they reset with it. */
    RTC.effects = { runs:0, providerCalls:0, usageRecords:0, events:0,
                    cards:0, settingsWrites:0, installs:0, participants:0 };
    RTC.rejectedCallbacks = [];
  }

  /* Attach one `collab-run` reference message per seed run to its thread, ONCE,
     at module load — before app.js's `state.threads = clone(D.threads)`
     (app.js runs after every feature module; see build.py). This is the same
     "attach a fixture to the shared runtime" latitude goals.js uses for
     `D.goal`, applied to the one field that has to live on the thread's own
     message list for a card to appear in the transcript at all: `D.threads`
     is mutated in place, never reassigned, and never edited as a file. A
     `reset-all` never needs to repeat this — the reference message is
     permanent and always re-resolves against whatever `RTC.runs` currently
     holds by `runId`, including after `RTC.runs` itself is restored. */
  (function attachSeedCards() {
    var byId = {};
    var i;
    for (i = 0; i < list(D.threads).length; i++) byId[D.threads[i].id] = D.threads[i];
    var seeds = JSON.parse(SEED_RUNS_JSON);
    for (i = 0; i < seeds.length; i++) {
      var run = seeds[i];
      var th = byId[run.threadId];
      if (!th) continue;
      if (!Array.isArray(th.messages)) th.messages = [];
      var already = th.messages.some(function (m) { return m.type === 'collab-run' && m.runId === run.id; });
      if (already) continue;
      th.messages.push({ id: 'collab-card-' + run.id, role: 'system', type: 'collab-run', runId: run.id, time: run.createdAt, sentAt: run.createdAt });
    }
  })();

  /* =====================================================================
     5. RUN UI STATE — the card's view-local state (the run view keeps its own
     in collab-view.js; PM56_COLLAB.viewState reads it).
     ===================================================================== */
  /* step 2 (the card): face = the density last rendered, settling = a face held one beat (G-07), arriving = a
     card whose Start flight is in the air (M3), cancelAsk = the in-place Cancel confirm, last = the presentation
     state last seen, doneMark = when a run finished in this session (the card has no Technical details line:
     2026-10-07, Jared) */
  var UI = { expanded: {}, more: {}, face: {}, settling: {}, arriving: {}, cancelAsk: {}, last: {}, doneMark: {}, sentTo: {} };

  /* IMPACT A2-14: the phrase primitives replace the local formatters (fmtClock, fmtMoney, fmtTokens are gone). COLLAB step 3:
     the centred panel's own renderers (status chip, participant row, message line, usage strip, the kind inline blocks)
     went with it; the docked run view (collab-view.js) draws every tab from the pmx primitives. */

  /* =====================================================================
     7. THE RUN CARD (DESIGN-SPEC 7, 8.0 card bullets, 4.3; COLLAB step 2).
     One article per run (data-k collab-card-{runId}) carries every density:
     starting, waiting, live, collapsed, attention, result, failed, receipt.
     Only data-density and the body's children change, so a card never
     re-arrives. The frame is COLLAB's; a kind package supplies its parts
     through PM56_<KIND>.cardParts(run, ctx, generic), looked up lazily at
     render time: every field it returns (not undefined) replaces COLLAB's
     generic one. Seeds and legacy runs always use the generic parts. The
     shared faces (waiting, cancelled, paused, stopped at your limit, failed)
     are COLLAB's (IMPACT A3-04); kinds supply only nouns.
     ===================================================================== */
  var TERMINAL = { completed: 1, cancelled: 1, failed: 1, limit: 1 };
  var KIND_CLS = { crew: 'collab-kind-crew', brainstorm: 'collab-kind-brainstorm', review: 'collab-kind-review', chat_room: 'collab-kind-chat_room' };
  var START_REASON = { crew: 'The Coordinator is reading the job.', chat_room: 'The Moderator is opening the first round.', review: 'Taking the snapshot.', brainstorm: 'The team is reading the question.' };
  var LEAD_WORD = { crew: 'Coordinator', chat_room: 'Moderator', brainstorm: 'Coordinator', review: 'Coordinator' };

  /* a participant counts as started once it has an attempt, an outcome or a word of its own */
  function hasStarted(run) {
    return (run.participants || []).some(function (p) { return (p.attempts && p.attempts.length) || p.outcome || p.status === 'working' || p.status === 'done' || p.status === 'failed'; }) ||
      (run.messages || []).some(function (m) { return m.senderKind === 'participant'; });
  }
  /* a seed title that starts with its own kind word ("Crew · Query Performance…") shows without it: the kind word
     already leads the card head, the dock line and the destination label */
  function shownTitle(run) {
    var t = String(run.title || ''), K = KIND_LABEL[run.kind] || '';
    return K && t.indexOf(K + ' · ') === 0 ? t.slice(K.length + 3) : t;
  }
  function blockedHelper(run) { return (run.participants || []).filter(function (p) { return p.status === 'blocked'; })[0] || null; }

  /* IMPACT A1-20: the one presentation state. Everything that shows or acts on a run's state reads this (card, dock,
     receipt, Activity, canPause/canCancel, scheduled delivery, run-view status, the composer destination label). */
  function presentState(run) {
    if (!run) return 'waiting';
    var s = run.status;
    if (s === 'canceled' || s === 'cancelled') return 'cancelled';
    if (run.stopReason === 'limit') return 'limit';
    if (s === 'failed') return 'failed';
    if (s === 'completed') return completionProjection(run).clean_completion ? 'completed' : 'attention';
    if (s === 'paused') return 'paused';
    if (s === 'blocked' || run.pendingUserDecision || blockedHelper(run)) return 'attention';
    if (s === 'configuring') return 'waiting';
    if (UI.waiting[run.id] && !hasStarted(run)) return 'waiting';
    if (provenance(run.id) === 'recorded' && !hasStarted(run)) return 'starting';
    if (roomYourMove(run)) return 'attention';
    return 'running';
  }
  /* A Chat Room between rounds waits for you. The room view (room-view.js statusHtml, canon for rooms) reads its
     RoomDiscussionVM: nobody speaking, no round going and a primary to press = "Round N done · … Your move." The card,
     the dock, Activity and the composer read the same VM here, so all of them say the same thing (A1-20). Returns
     {round, summed, text, primary} or null. */
  function roomYourMove(run) {
    if (!run || run.kind !== 'chat_room' || run.status !== 'running') return null;
    var R = window.PM56_ROOM, vm = null;
    try { vm = R && typeof R.discussionVM === 'function' ? R.discussionVM(run) : null; } catch (e) { vm = null; }
    if (vm) {
      if (vm.waiting || vm.status !== 'running' || vm.speaking || (vm.round && !vm.round.complete)) return null;
      var pr = vm.controls && vm.controls.primary;
      if (!pr || pr.disabled) return null;
      var so = Number(vm.roundsSoFar || 0), summed = !!(vm.summary && vm.summary.current && so);
      return { round: so, summed: summed, primary: { action: pr.action, label: pr.label },
        text: so ? 'Round ' + so + ' done' + (summed ? ' · The Moderator summed it up.' : '.') : 'Start the first round.' };
    }
    /* no room view loaded: the record alone (a helper at work or a round going means the room is not waiting) */
    var c = run.chatRoom || {}, so2 = Number(c.roundsSoFar || 0);
    if ((run.participants || []).some(function (p) { return p.status === 'working'; }) || (c.round && !c.round.complete) || !so2) return null;
    return { round: so2, summed: false, primary: null, text: 'Round ' + so2 + ' done.' };
  }

  function names(list) {
    list = list.filter(Boolean);
    if (list.length <= 2) return list.join(' and ');
    return list.slice(0, 2).join(', ') + ' and ' + (list.length - 2) + ' more';
  }
  function crewProgress(run) {
    var a = (run.crew && run.crew.assignments) || [];
    return { all: a.length, done: a.filter(function (x) { return x.status === 'done'; }).length, list: a };
  }
  function reviewFindings(run) {
    var r = run.review || {};
    return (r.report && r.report.findings) || r.findings || [];
  }
  function roomRounds(run) { var c = run.chatRoom || {}; return { so: Number(c.roundsSoFar || (run.config || {}).roundsSoFar || 0), max: Number((run.config || {}).maxRounds || 5) }; }
  var STORM_SHORT = ['Ask', 'Drafts', 'Options', 'Debate', 'Facts', 'Vote', 'Plan'];
  var STORM_PHASE = { intake: 0, questions: 0, clarify: 0, proposals: 1, independent: 1, drafting: 1, normalize: 2, options: 2, debate: 3, evidence: 4, research: 4, vote: 5, voting: 5, synthesis: 6, synthesize: 6, done: 7 };

  /* the progress phrase a cancelled card keeps ("2 of 3 parts done") */
  function progressLine(run) {
    if (run.kind === 'crew') { var c = crewProgress(run); return c.all ? c.done + ' of ' + c.all + ' parts done' : ''; }
    if (run.kind === 'review') { var P = run.participants || []; var d = P.filter(function (p) { return p.outcome === 'completed' || p.status === 'done'; }).length; return P.length ? d + ' of ' + P.length + ' reviewers finished' : ''; }
    if (run.kind === 'chat_room') { var rr = roomRounds(run); return rr.so ? plural(rr.so, 'round', 'rounds') + ' done' : ''; }
    return '';
  }
  function limitText(run) {
    var cfg = run.config || {}, def = RTC.definitions[run.kind] || {};
    var usd = cfg.costLimitUsd || def.costLimitUsd, min = cfg.timeLimitMinutes || def.timeLimitMinutes;
    var S = S_();
    return '(' + [usd ? S.pmxMoney(usd) : '', min ? min + ' min' : ''].filter(Boolean).join(' or ') + ')';
  }

  /* IMPACT A1-20 / A1-28: the decision a run needs from you, in words (who needs what, and who is not blocked) */
  function attentionOf(run) {
    var c = completionProjection(run), K = KIND_LABEL[run.kind], lead = LEAD_WORD[run.kind] || 'Coordinator';
    var b = blockedHelper(run), noun = NOUN[run.kind];
    function mk(tone, strong, text, word) { return { tone: tone, strong: strong, text: text, word: word || 'Needs attention', plain: strong + (text ? ' ' + text : '') }; }
    if (c.coordinator_failed) return mk('warm', 'Needs attention', '· The ' + lead + ' stopped, ' + (run.kind === 'chat_room' ? 'so nobody is calling on speakers.' : 'so the final summary is missing.'));
    if (b) return mk('warm', b.role + ' needs your OK', 'to go on. Only this ' + noun + ' waits; the others keep working.', 'Needs you');
    if (c.unresolved_required.length && c.failed_slots.length) {
      var failed = (run.participants || []).filter(function (p) { return c.failed_slots.indexOf(p.id) >= 0 && p.required; });
      var all = (run.participants || []).filter(function (p) { return p.required; }).length;
      var done = all - c.unresolved_required.length;
      var why = failed.length && failed[0].outcome === 'timed_out' ? 'ran out of time' : failed.length && failed[0].outcome === 'not_allowed' ? 'wasn’t allowed to go on' : 'didn’t finish';
      if (run.kind === 'review') return mk('warm', 'Only ' + done + ' of ' + all + ' reviewers finished', '(' + names(failed.map(function (p) { return p.role; })) + ' ' + why + '). This is a partial review.');
      return mk('warm', plural(failed.length || 1, noun, noun + 's') + ' didn’t finish.', failed.length ? names(failed.map(function (p) { return p.role; })) + ' ' + why + '.' : '');
    }
    if (c.missing_outputs.length) return mk('warm', 'The final summary was never written.', '');
    if (c.attention_reason === 'vote_tie_unresolved') return mk('warm', 'The vote is tied.', 'Write the plan from your rules and the evidence, or run one more debate round.');
    var ym = roomYourMove(run);
    if (ym) return mk('accent', 'Your move.', ym.text, 'Your move');
    if (run.pendingUserDecision) return mk('accent', 'Your move.', 'The ' + K + ' is waiting for your decision.', 'Your move');
    return mk('warm', 'Needs attention', run.blockedReason ? '· ' + String(run.blockedReason) : '· Open the panel to see what it is waiting for.');
  }

  /* a Chat Room has one speaker at a time: the first helper at work speaks, the next one still able to take part is up
     next; the sentence, the lanes and the track all read this one pick */
  function roomSpeaker(run) {
    var P = run.participants || [], sp = P.filter(function (p) { return p.status === 'working'; })[0] || null;
    var next = P.filter(function (p) { return p !== sp && p.status !== 'done' && p.status !== 'failed' && p.status !== 'disabled' && !(p.outcome && p.outcome !== 'completed'); })[0] || null;
    if (!sp && next && roomYourMove(run)) next = null;
    return { sp: sp, next: next };
  }
  /* the live sentence, from the record (a kind replaces it through cardParts().sentence) */
  function runningSentence(run) {
    var k = run.kind, P = run.participants || [];
    var working = P.filter(function (p) { return p.status === 'working'; });
    if (run.status === 'waiting') return { status: 'waiting', word: 'Waiting', reason: run.blockedReason ? String(run.blockedReason) : 'for its turn to run.' };
    if (k === 'chat_room') {
      var rr = roomRounds(run);
      var pick = roomSpeaker(run), sp = pick.sp, next = pick.next;
      if (!rr.so && !sp) return { status: 'running', word: 'Running', reason: 'The Moderator is opening the first round.' };
      return { status: 'running', word: 'Round ' + Math.max(1, Math.min(rr.max, rr.so || 1)) + ' of ' + rr.max, reason: sp ? sp.role + ' is speaking' + (next ? ' · Up next: ' + next.role + '.' : '.') : 'The Moderator hasn’t called the next speaker yet.' };
    }
    if (k === 'brainstorm') {
      var b = run.brainstorm || {}, ph = STORM_PHASE[b.phase] != null ? STORM_PHASE[b.phase] : 1;
      var core = P.filter(function (p) { return p.required; });
      if (ph === 5) { var v = (b.votes || []).length; return { status: 'running', word: 'Voting', reason: v + ' of ' + core.length + ' have voted.' }; }
      if (ph === 3) return { status: 'running', word: 'Debating', reason: 'round ' + Math.max(1, Number(b.debateRound || 1)) + ' of ' + Number(b.debateRounds || (run.config || {}).debateRounds || 2) + '.' };
      return { status: 'running', word: 'Running', reason: ['The team is reading the question.', 'Each helper is drafting a plan on its own.', 'Lining up the options side by side.', '', 'Checking the facts behind each option.', '', 'Writing the plan from the vote and your rules.'][ph] || 'The team is working.' };
    }
    if (k === 'review') {
      var n = P.length, dn = P.filter(function (p) { return p.status === 'done' || p.outcome === 'completed'; }).length;
      var ri = stopIndex(run, 'running', runStops(run).length);
      if (ri >= runStops(run).length - 1) return { status: 'running', word: 'Running', reason: 'Writing the report from what the ' + (n === 1 ? 'reviewer' : 'reviewers') + ' found.' };
      if (ri === 2) return { status: 'running', word: 'Running', reason: 'All ' + n + ' reviewers have finished reading; now they compare notes.' };
      if (n <= 1) return { status: 'running', word: 'Running', reason: 'The reviewer is reading on its own.' };
      if (dn && dn < n) return { status: 'running', word: 'Running', reason: dn + ' of ' + n + ' reviewers have finished reading; the others are still on their own.' };
      return { status: 'running', word: 'Running', reason: n + ' reviewers are reading on their own; they can’t see each other’s notes yet.' };
    }
    var cp = crewProgress(run);
    var r = working.length ? names(working.map(function (p) { return p.role; })) + (working.length === 1 ? ' is working.' : ' are working.') : '';
    var nextA = cp.list.filter(function (a) { return a.status === 'pending' && a.dependsOn && a.dependsOn.length; })[0];
    if (nextA && r) {
      var deps = nextA.dependsOn.map(function (d) { var x = cp.list.filter(function (a) { return a.id === d; })[0]; return x ? x.title : d; });
      var extra = ' ' + nextA.assignedRole + ' starts after ' + names(deps) + '.';
      if ((r + extra).length <= 110) r += extra;
    }
    if (!r) r = cp.all ? cp.done + ' of ' + cp.all + ' parts checked.' : 'The Coordinator is splitting the job.';
    return { status: 'running', word: 'Running', reason: r };
  }

  function headlineOf(run) {
    var k = run.kind;
    if (k === 'crew') {
      var art = (run.artifacts || [])[0], cp = crewProgress(run);
      return art && art.label ? art.label + ' ready: all ' + cp.all + ' parts checked' : (cp.all ? 'Done: all ' + cp.all + ' parts checked' : 'Done: the Crew finished');
    }
    if (k === 'review') {
      var f = reviewFindings(run);
      var fix = f.filter(function (x) { return x.disposition === 'confirmed'; }).length, uns = f.filter(function (x) { return x.disposition === 'uncertain' || x.disposition === 'unsure'; }).length;
      if (!fix && !uns) return 'No problems found. Nothing was changed.';
      return (fix ? fix + (fix === 1 ? ' thing' : ' things') + ' to fix' : 'Nothing to fix') + (uns ? ', ' + uns + ' unsure' : '');
    }
    if (k === 'brainstorm') {
      var s = (run.brainstorm || {}).synthesis || {};
      var t = s.title || s.planTitle || s.chosen || '';
      return t ? 'Plan ready: ' + t : 'Decision ready: one plan to build';
    }
    var rr = roomRounds(run);
    return 'Discussion ended after ' + plural(Math.max(1, rr.so), 'round', 'rounds');
  }
  function failReason(run) { return run.blockedReason ? String(run.blockedReason).replace(/\.?$/, '.') : 'it stopped before a result.'; }

  /* IMPACT A1-20: the one sentence, as plain text parts {status, word, reason} (every surface escapes it) */
  function sentenceOf(run) {
    var st = presentState(run), k = run.kind;
    if (st === 'waiting') return { status: 'waiting', word: 'Waiting to start', reason: waitingReason(run) };
    if (st === 'starting') return { status: 'starting', word: 'Starting', reason: START_REASON[k] || 'Getting ready.' };
    if (st === 'paused') return { status: 'paused', word: 'Paused', reason: 'nothing is lost.' };
    if (st === 'cancelled') { var pl = progressLine(run); return { status: 'cancelled', word: 'Cancelled', reason: (pl ? pl + ' · ' : '') + 'everything so far is kept.' }; }
    if (st === 'limit') return { status: 'limit', word: 'Stopped at your limit', reason: limitText(run) + ' · everything so far is kept.' };
    if (st === 'failed') return { status: 'failed', word: 'Failed', reason: failReason(run) };
    if (st === 'completed') return { status: 'done', word: 'Completed', reason: headlineOf(run) };
    /* the reason is the card's whole decision sentence (strong clause + text); only the bare "Needs attention" form
       drops its own word and the "· " (A1-20: Activity, the view status and the composer destination read this) */
    if (st === 'attention') {
      var a = attentionOf(run);
      return { status: a.tone === 'accent' ? 'yourmove' : 'needs', word: a.word, reason: a.strong === 'Needs attention' ? a.text.replace(/^·\s*/, '') : a.strong === 'Your move.' && a.text ? a.text : a.plain };
    }
    return runningSentence(run);
  }

  /* ---- the stage track (C4): named stops, counted progress, never a percent ---- */
  function runStops(run) {
    if (run.kind === 'chat_room') { var rr = roomRounds(run), out = []; for (var i = 1; i <= Math.min(rr.max, 12); i++) out.push('Round ' + i); return out; }
    if (run.kind === 'review' && (run.config || {}).strategy === 'single_agent') return ['Snapshot', 'Reading on its own', 'Writing the report'];
    return KIND_STOPS[run.kind] || [];
  }
  function stopIndex(run, st, n) {
    if (st === 'waiting') return -1;
    if (st === 'completed') return n;
    if (st === 'starting') return 0;
    var k = run.kind;
    if (k === 'crew') { var cp = crewProgress(run); return !cp.all ? 0 : cp.done < cp.all ? 1 : 2; }
    if (k === 'review') {
      var r = run.review || {}, single = n === 3;
      if (r.report) return n - 1;
      if ((r.findings || []).length && !single) return 2;
      return 1;
    }
    if (k === 'brainstorm') { var b = run.brainstorm || {}; return STORM_PHASE[b.phase] != null ? Math.min(n - 1, STORM_PHASE[b.phase]) : 1; }
    var rr = roomRounds(run); return Math.max(0, Math.min(n - 1, (rr.so || 1) - 1));
  }
  function trackOf(run, st) {
    var stops = runStops(run), n = stops.length, idx = stopIndex(run, st, n);
    if (!n) return null;
    var cur = stops[Math.max(0, Math.min(n - 1, idx))];
    var count = '';
    if (st === 'waiting') count = 'not started';
    else if (st === 'completed') count = 'done';
    else if (run.kind === 'crew') { var cp = crewProgress(run); count = cp.all ? cp.done + ' of ' + cp.all + ' checked' : 'not split yet'; }
    else if (run.kind === 'review') { var P = run.participants || []; count = P.filter(function (p) { return p.status === 'done' || p.outcome === 'completed'; }).length + ' of ' + P.length + ' done'; }
    else if (run.kind === 'brainstorm') { var b = run.brainstorm || {}; count = idx === 5 ? (b.votes || []).length + ' of ' + (run.participants || []).filter(function (p) { return p.required; }).length + ' voted' : idx === 1 ? (b.proposals || []).length + ' drafts in' : 'in progress'; }
    else { var sp = roomSpeaker(run).sp; count = sp ? sp.role + ' is speaking' : roomYourMove(run) ? 'your move' : 'in progress'; }
    if (st === 'starting') count = 'starting';
    /* a stopped run (paused, cancelled, at your limit, failed) never says "in progress" or "is speaking", and its
       stop keeps no shimmer (5.6: no motion for work that is not happening); one that never started says so */
    var stopped = st === 'cancelled' || st === 'limit' || st === 'paused' || st === 'failed';
    if (stopped && !hasStarted(run)) count = 'not started';
    else if (stopped && /in progress|is speaking/.test(count)) count = st === 'paused' ? 'paused' : 'stopped here';
    /* at the L tier every stop shows its label beside its dot (C4): long tracks carry short dot labels (BrainStorm's
       seven chapters, a room past six rounds) so the row never runs wider than the card; nowText keeps the full name */
    /* a room between rounds: the round that just ended is done (no shimmer: nothing is happening until you move) */
    var ym = st === 'attention' ? roomYourMove(run) : null, roundDone = !!(ym && ym.round);
    var dotLabel = run.kind === 'brainstorm' ? function (l, i) { return STORM_SHORT[i] || l; } : n > 6 ? function (l, i) { return String(i + 1); } : function (l) { return l; };
    return {
      stops: stops.map(function (l, i) {
        var s = i < idx ? 'done' : i === idx ? (st === 'failed' || st === 'attention' && run.status === 'failed' ? 'failed' : stopped ? 'next' : roundDone ? 'done' : 'now') : 'next';
        return { key: 'pmx-stop:' + run.id + ':' + i, label: esc(dotLabel(l, i)), state: s };
      }),
      nowText: '<b>' + esc(st === 'completed' ? stops[n - 1] : cur) + '</b> · ' + esc(count)
    };
  }

  /* ---- marks, lanes and the head cluster (B1, C2, C5): identity is silhouette x spike x hue, never initials ---- */
  function markRole(p) {
    if (p.additiveRoleKind === 'wonderer') return 'Wonderer';
    if (p.additiveRoleKind === 'grill_me' || p.additiveRoleKind === 'grillMe') return 'Grill Me';
    return p.effectivePersona || p.requestedPersona || 'Implementer';
  }
  function markState(p) {
    if (p.status === 'blocked') return 'needs';
    if (p.status === 'working') return 'working';
    if (p.status === 'done' || p.outcome === 'completed') return 'done';
    if (p.status === 'failed' || p.status === 'disabled' || (p.outcome && p.outcome !== 'completed')) return p.outcome === 'explicitly_waived' ? 'abstained' : 'failed';
    return 'queued';
  }
  function standInOf(p) {
    if (p.effectiveModelId === p.requestedModelId && p.status !== 'disabled') return null;
    var S = S_(), req = String(p.requestedModelName || '').split(' · ')[0], eff = p.effectiveModelId ? String(p.effectiveModelName || '').split(' · ')[0] : '';
    return S.pmxStandIn ? S.pmxStandIn({ requested: req, effective: eff, reason: 'offline', noSubstitute: !eff, sameProvider: !!eff }) : null;
  }
  function seatNo(run, p) { var i = (run.participants || []).indexOf(p); return (Math.max(0, i) % 8) + 1; }
  function markOfP(run, p, size) {
    var si = standInOf(p);
    return S_().pmxMark({ role: markRole(p), seat: seatNo(run, p), size: size, state: markState(p), standin: !!(si && si.tone !== 'failed') });
  }
  function clusterOf(run, size, st) {
    var S = S_(), out = [];
    var leadState = st === 'waiting' ? 'queued' : st === 'completed' ? 'done' : (coordinatorSlot(run) && coordinatorSlot(run).outcome && coordinatorSlot(run).outcome !== 'completed') ? 'failed' : 'idle';
    if (run.kind !== 'review') out.push(S.pmxMark({ role: run.kind === 'chat_room' ? 'moderator' : 'lead', size: size, state: leadState }));
    var blind = run.kind === 'review' && (run.participants || []).length > 1 && (run.config || {}).blindInitialPass !== false;
    (run.participants || []).forEach(function (p, i) {
      if (blind && i) out.push('|');
      out.push(st === 'waiting' ? S.pmxMark({ role: markRole(p), seat: seatNo(run, p), size: size, state: 'queued' }) : markOfP(run, p, size));
    });
    return out;
  }
  var LANE_RANK = { needs: 0, failed: 0, working: 1, queued: 3, done: 4, abstained: 5 };
  function laneVerb(run, p, s) {
    if (s === 'needs') return 'needs your OK';
    if (run.kind === 'chat_room' && (s === 'working' || s === 'queued')) { var rp = roomSpeaker(run); return p === rp.sp ? 'speaking' : p === rp.next ? 'up next' : 'waiting its turn'; }
    if (s === 'working') return 'working';
    if (s === 'done') return run.kind === 'review' ? 'finished reading' : 'done';
    if (s === 'failed' && p.outcome === 'not_allowed') return 'not allowed';
    if (s === 'failed') return p.outcome === 'timed_out' ? 'ran out of time' : p.outcome === 'unavailable' || p.status === 'disabled' ? 'couldn’t take part' : 'didn’t finish';
    if (s === 'abstained') return 'skipped';
    return 'waiting its turn';
  }
  /* C26 (G-35): a helper's words quoted in a card go through the compact presenter (pmxMd on PM56_RICH), then keep
     only the first paragraph's inline markup (bold, code), since a lane's second line is one line */
  function quoteHtml(text) {
    var S = S_(), md = S && S.pmxMd ? S.pmxMd(String(text || ''), { mode: 'compact', max: 1, lines: 1 }) : '';
    var m = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(md);
    return m ? m[1].replace(/<(?!\/?(b|strong|code|em|i)\b)[^>]*>/g, '') : esc(plainLine(text));
  }
  function plainLine(text) {
    return String(text || '').replace(/```[\s\S]*?```/g, ' ').replace(/[*_`#>]+/g, '').replace(/\s+/g, ' ').trim();
  }
  /* a recorded vote's body leads with its stance enum ("support · Snapshot worker search"): quote it in words */
  var STANCE = { support: 'Backs', oppose: 'Against', against: 'Against', abstain: 'Abstains on', neutral: 'Undecided on' };
  function voteWords(body) {
    return String(body || '').replace(/^\s*(support|oppose|against|abstain|neutral)\s*[·:-]\s*/i, function (m, w) { return STANCE[w.toLowerCase()] + ' '; });
  }
  /* ---- OWNER ANSWER E-31 (DL-137, 2026-09-27): a helper's line streams live, reusing the reply streaming. A helper's
     message that arrives while its run is going streams its words into the lane's data-pm-keep island through
     PM56_PMX.stream (the one pacer: Chat WOW's PM56_STREAM pacing). Once every word is in, the next render swaps the
     island (its key goes from stream:{mid} to {mid}) for the whole message with its inline markup, once. Stop, pause,
     a failed helper or one that abstained end the stream at once: the island is dropped and the lane shows only what
     was written in full (a product partial is never kept or shown as the helper's words), never words still arriving
     for a helper that stopped. The first render of a run's lanes takes every message that exists as read, so nothing
     streams on open or on a thread switch; under reduced motion every message lands whole. ---- */
  var LANE_SEEN = {}, LANE_STREAM = {}, laneJob = 0;
  function laneClock() { var C = window.PM56_CLOCK; return C && C.now ? C.now() : performance.now(); }
  function laneReduced() { var P = PMX_(); return !!(P && P.reduced && P.reduced()); }
  function laneFlowing(run) { var st = presentState(run); return st === 'running' || st === 'attention'; }
  function noteLaneMessages(run) {
    var seen = LANE_SEEN[run.id], msgs = run.messages || [];
    if (!seen) { seen = LANE_SEEN[run.id] = {}; msgs.forEach(function (m) { seen[m.id] = 1; }); return; }
    var flowing = laneFlowing(run) && !laneReduced();
    msgs.forEach(function (m) {
      if (seen[m.id]) return;
      seen[m.id] = 1;
      if (flowing && m.senderKind === 'participant' && m.senderId && m.body) LANE_STREAM[m.id] = { text: plainLine(voteWords(m.body)), at: null, done: false, state: null };
    });
  }
  function laneStreaming(run, p, said) {
    var ls = LANE_STREAM[said.id];
    if (!ls || ls.done) return false;
    /* a helper that failed, was switched off or abstained (any outcome but completed) has stopped speaking */
    var stopped = p.status === 'failed' || p.status === 'disabled' || (p.outcome && p.outcome !== 'completed');
    if (!laneFlowing(run) || stopped || laneReduced()) { ls.done = true; return false; }
    return true;
  }
  function lanePoll() {
    laneJob = 0;
    var active = false, changed = false;
    Object.keys(LANE_STREAM).forEach(function (mid) {
      var ls = LANE_STREAM[mid];
      if (ls.done || !ls.state) return;
      if (ls.state.shown >= ls.state.words.length) { ls.done = true; changed = true; return; }
      if (ls.state.island && ls.state.island.isConnected) active = true;
    });
    if (changed) { var c = EXT.ctx && EXT.ctx(); if (c && c.renderApp) c.renderApp(); }
    else if (active) laneJob = setTimeout(lanePoll, 200);
  }
  function laneAfterApp() {
    var P = PMX_(), qs = document.querySelectorAll('.transcript .pmx-lane-l2[data-pm-keep] q[data-collab-stream]'), any = false;
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i], ls = LANE_STREAM[q.getAttribute('data-collab-stream')], isl = q.parentElement;
      if (!ls || ls.done || !isl) continue;
      if (ls.at == null) ls.at = laneClock();
      /* the same island keeps its stream; a remounted one (resize, pin, thread switch) catches up from when it began */
      ls.state = P && P.stream ? P.stream(isl, ls.text, { startAt: ls.at }) : null;
      if (!ls.state) { q.textContent = ls.text; ls.done = true; continue; }
      any = true;
    }
    if (any && !laneJob) laneJob = setTimeout(lanePoll, 200);
  }
  if (PMX_() && PMX_().after) PMX_().after(function (ctx, phase) { if (phase === 'app') laneAfterApp(); });
  function laneLine2(run, p, s) {
    noteLaneMessages(run);
    var said = (run.messages || []).filter(function (m) { return m.senderId === p.id && m.body; }).slice(-1)[0];
    if (said && s !== 'queued' && laneStreaming(run, p, said)) return { kind: 'quote', html: '<q data-collab-stream="' + esc(said.id) + '"></q>', src: 'stream:' + said.id, keep: true };
    if (said && s !== 'queued') return { kind: 'quote', html: '“' + quoteHtml(voteWords(said.body)) + '”', src: said.id };
    if (run.kind === 'crew' && s === 'queued') {
      var cp = crewProgress(run), a = cp.list.filter(function (x) { return x.participantId === p.id || x.assignedRole === p.role; })[0];
      if (a && a.dependsOn && a.dependsOn.length) return { kind: 'detail', html: 'starts after ' + esc(names(a.dependsOn.map(function (d) { var x = cp.list.filter(function (y) { return y.id === d; })[0]; return x ? x.title : d; }))), src: 'dep' };
    }
    var si = standInOf(p);
    if (si && si.card) return { kind: 'detail', html: si.card, src: 'route' };
    var t = s === 'needs' ? (p.blockedReason || '') : (p.current || '');
    return { kind: 'detail', html: esc(plainLine(t)), src: 'cur' };
  }
  function laneOf(run, p) {
    var S = S_(), s = markState(p);
    if (run.kind === 'chat_room' && s === 'working' && roomSpeaker(run).sp !== p) s = 'queued';
    var verb = laneVerb(run, p, s), l2 = laneLine2(run, p, s);
    var sub = String(p.effectiveModelName || p.requestedModelName || '').split(' · ')[0];
    return {
      rank: verb === 'up next' ? 2 : LANE_RANK[s] != null ? LANE_RANK[s] : 3, state: s,
      html: S.pmxLane({ key: 'pmx-lane:' + run.id + ':' + p.id, state: s === 'queued' ? 'queued' : s, mark: markOfP(run, p, 22), name: esc(p.role), sub: esc(sub), verb: esc(verb),
        verbKey: 'vb:' + p.id + ':' + S.pmxHash(verb), line2: l2.html, line2Kind: l2.kind, keep: !!l2.keep, keepKey: 'l2:' + run.id + ':' + p.id + ':' + l2.kind + ':' + l2.src,
        action: 'collab-open-participant', attrs: 'data-run="' + esc(run.id) + '" data-participant="' + esc(p.id) + '"', time: '' })
    };
  }
  /* "Show all" (G-19 keeps the chevron for the face): every lane shows once asked, else at most 3 (2 + "+N more").
     The narrow "+N more · Show all" row the builder adds is what an attention card shows under its first lane
     (collaboration.css), so the loud face keeps its budget (7.2) and the other helpers are one click away. */
  function lanesOf(run, open, rankOrder) {
    var S = S_(), all = (run.participants || []).map(function (p, i) { var l = laneOf(run, p); l.i = i; return l; });
    all.sort(function (a, b) { return a.rank - b.rank || a.i - b.i; });
    /* the rank picks which lanes show; they are drawn in the team's own order, so a state change never moves a row
       (a moved row re-enters: M6's settle face would lose lanes for a frame). The attention face keeps the rank
       order: its first lane is the helper that needs you. */
    function order(list) { return rankOrder ? list : list.slice().sort(function (a, b) { return a.i - b.i; }); }
    var runAttr = 'data-run="' + esc(run.id) + '"', narrow = open ? false : { action: 'collab-show-lanes', attrs: runAttr };
    if (open || all.length <= 3) return S.pmxLanes({ key: 'lanes:' + run.id, lanesHtml: order(all.slice(0, 8)).map(function (l) { return l.html; }).join(''), kind: run.kind, runId: run.id, narrow: narrow });
    var shown = order(all.slice(0, 2)), rest = all.slice(2), count = {};
    rest.forEach(function (l) { count[l.state] = (count[l.state] || 0) + 1; });
    var WORD = { working: 'working', queued: 'waiting', done: 'done', needs: 'need you', failed: 'didn’t finish', abstained: 'skipped' };
    var text = Object.keys(count).map(function (k) { return count[k] + ' ' + (WORD[k] || k); }).join(', ') + ' · Show all';
    return S.pmxLanes({ key: 'lanes:' + run.id, lanesHtml: shown.map(function (l) { return l.html; }).join(''), more: { count: rest.length, text: esc(text), action: 'collab-show-lanes', attrs: runAttr }, narrow: narrow, kind: run.kind, runId: run.id });
  }

  /* ---- time, cost and the meta line (C11; IMPACT A2-14: phrase primitives only) ---- */
  function clockOf(run, st) {
    var T = S_().pmxTime;
    /* a run that ended before anything started never worked: "not started", not a worked time */
    if (st === 'waiting' || (TERMINAL[st] && st !== 'completed' && !hasStarted(run))) return T.clock(null);
    var a = Date.parse(run.createdAt), b = run.completedAt ? Date.parse(run.completedAt) : Date.now();
    if (!isFinite(a)) return T.clock(null);
    return TERMINAL[st] ? T.worked(Math.max(0, b - a)) : T.clock(Math.max(0, b - a));
  }
  function costLimit(run) { var cfg = run.config || {}; return cfg.costLimitUsd || (RTC.definitions[run.kind] || {}).costLimitUsd; }
  function costOf(run, st) {
    var S = S_(), u = run.usage || {};
    if (provenance(run.id) === 'recorded') return S.pmxCost({ state: 'recorded' });
    if (st === 'waiting' || st === 'starting') return S.pmxCost({ state: 'before' });
    /* a run with no cost record (a seed whose helpers are speaking) says "Cost not reported", never "Nothing spent" */
    if (u.not_measured || u.costUsd == null || !isFinite(Number(u.costUsd)) || (provenance(run.id) === 'seed' && !(Number(u.costUsd) > 0) && hasStarted(run))) return S.pmxCost({ state: 'unknown' });
    return S.pmxCost({ state: TERMINAL[st] ? 'done' : 'running', spent: u.costUsd, limit: costLimit(run) });
  }
  function metaOf(run, st) {
    var S = S_(), rec = provenance(run.id) === 'recorded';
    if (st === 'waiting') return { recorded: false, parts: ['Nothing spent', 'your setup is saved on this card'] };
    var parts = [];
    if (!rec) parts.push(esc(costOf(run, st)));
    var asked = Number((run.config || {}).parallelism), eff = run.crew && run.crew.effectiveConcurrency;
    var cl = run.kind === 'crew' && S.pmxClamp ? S.pmxClamp({ asked: asked, runs: eff, planBound: !!(run.crew && run.crew.planBinding) }) : null;
    if (cl) parts.push(cl.card);
    var si = (run.participants || []).map(standInOf).filter(Boolean)[0];
    if (si && parts.length < 2) parts.push(si.card);
    return { recorded: rec, parts: parts.slice(0, 3) };
  }

  /* ---- the finished face (C8-C10): answer first ---- */
  function creditsOf(run) {
    var S = S_();
    return (run.participants || []).map(function (p) {
      var s = markState(p);
      /* a Crew helper's credit says what it did: its part's own title ("Map the fields"), not a generic phrase */
      var part = run.kind === 'crew' ? ((run.crew && run.crew.assignments) || []).filter(function (a) { return a.participantId === p.id || a.assignedRole === p.role; })[0] : null;
      var did = s === 'done' ? (part && part.title ? part.title : run.kind === 'review' ? 'read it on its own' : run.kind === 'chat_room' ? 'took part' : 'finished its part') : s === 'failed' ? 'didn’t finish' : s === 'abstained' ? 'skipped' : 'wasn’t needed';
      return { mark: markOfP(run, p, 18), name: esc(p.role), did: esc(did) };
    });
  }
  function outputOf(run) {
    var art = (run.artifacts || []).filter(function (a) { return a && a.body && a.kind === 'csv'; })[0];
    if (!art) return '';
    var lines = String(art.body).split(/\r?\n/).filter(Boolean);
    return S_().pmxOutput({ key: 'out:' + run.id, name: esc(art.label || 'Result'), meta: esc(plural(Math.max(0, lines.length - 1), 'row', 'rows')), lines: lines.slice(0, 3).map(esc) });
  }

  /* ---- actions: one control set per run (7.12), canon labels (9.1), every button carries data-run (G-19) ---- */
  function openActionOf(run) {
    if (window.PM56_CREW && window.PM56_CREW.owns && window.PM56_CREW.owns(run.id)) return 'crew-open-work';
    if (run.kind === 'review' && run.review && run.review.report && window.PM56_REVIEW) return 'review-open-report';
    if (window.PM56_BRAINSTORM && window.PM56_BRAINSTORM.owns && window.PM56_BRAINSTORM.owns(run.id)) return 'brainstorm-open-results';
    return 'collab-open-panel';
  }
  var DEMO_API = { crew: 'PM56_CREW_DEMOS', review: 'PM56_REVIEW_DEMOS', brainstorm: 'PM56_BRAINSTORM_DEMOS' };
  /* in-place playback of a recorded example (G-32): only what the kind's recorded example offers for this run */
  function playOf(ctx, run) {
    var api = window[DEMO_API[run.kind]];
    if (!api || typeof api.controls !== 'function') return null;
    var html = '';
    try { html = String(api.controls(ctx, run) || ''); } catch (e) { html = ''; }
    var a = /data-action="([^"]+)"/.exec(html), l = />([^<>]+)<\/button>/.exec(html);
    if (!a || /\sdisabled[\s>]/.test(html)) return null;
    return { action: a[1], label: esc(l ? l[1] : 'Play the recording') };
  }
  function decisionActions(run, att) {
    var K = KIND_LABEL[run.kind], c = completionProjection(run), b = blockedHelper(run), out = [];
    if (c.attention_reason === 'vote_tie_unresolved') {
      out.push({ action: 'collab-brainstorm-synthesize', label: 'Write the plan', primary: true });
      out.push({ action: 'collab-brainstorm-next-round', label: 'One more debate round', soft: true });
    }
    /* a helper that needs your OK gets the answer in the card (7.x needs-you: Allow once · Don't allow · Details);
       Cancel {Kind}… stays in More so the loud row holds only the decision */
    if (b) {
      var pa = 'data-participant="' + esc(b.id) + '"';
      out.push({ action: 'collab-approve', attrs: pa, label: 'Allow once', primary: true });
      out.push({ action: 'collab-deny', attrs: pa, label: 'Don’t allow' });
      out.push({ action: 'collab-open-participant', attrs: pa, label: 'Details', soft: true });
      return out;
    }
    /* a room between rounds: the room's own next step, as the view offers it and as room-protocol's owned rooms draw
       it (the primary, then Summarize Now while rounds are left); Cancel stays in More, Open Panel in the actions row */
    var ym = roomYourMove(run);
    if (ym && ym.primary) {
      out.push({ action: ym.primary.action, label: esc(ym.primary.label), primary: true });
      if (ym.primary.action === 'collab-room-next-round') out.push({ action: 'collab-room-summarize', label: 'Summarize Now', soft: true });
      return out;
    }
    out.push({ action: 'collab-open-panel', attrs: 'data-tab="participants"', label: 'Details', soft: !out.length });
    if (canCancel(run)) out.push({ action: 'collab-cancel-ask', label: 'Cancel ' + K + '…' });
    return out;
  }

  function genericCardParts(run, ctx, face, st) {
    var S = S_(), K = KIND_LABEL[run.kind];
    var s = sentenceOf(run), att = st === 'attention' ? attentionOf(run) : null;
    var play = (st === 'starting' || st === 'running' || st === 'attention') ? playOf(ctx, run) : null;
    var open = openActionOf(run);
    var parts = {
      sentence: { status: s.status, word: esc(s.word), reason: esc(s.reason) },
      decision: att ? { tone: att.tone, glyph: att.tone === 'accent' ? 'ring-dot' : 'warn', sentence: '<b>' + esc(att.strong) + '</b>' + (att.text ? ' ' + esc(att.text) : ''), actions: decisionActions(run, att) } : null,
      track: trackOf(run, st),
      lanes: null,
      board: '',
      meta: metaOf(run, st),
      cluster: clusterOf(run, 18, st),
      clusterMini: clusterOf(run, 12, st),
      clock: esc(clockOf(run, st)),
      openAction: open,
      actions: [],
      followOns: [],
      pointer: '',
      moreExtra: [],
      result: null,
      receipt: null,
      waitingNoun: WAIT_NOUN[run.kind],
      progressNoun: run.kind === 'review' ? 'reviewers' : run.kind === 'chat_room' ? 'rounds' : 'parts'
    };
    var openBtn = { action: open, label: 'Open Panel', core: true };
    var msgBtn = { action: 'collab-message', label: 'Message', core: true };
    if (st === 'waiting') {
      /* retro's wide monospace at the M tier says "Watch an example" (the hover card says it is recorded), so the chevron
         and More keep the actions row's one line (collaboration.css) */
      parts.actions = [{ action: 'collab-watch-example', label: '<span class="pmx-collab-wl">Watch a recorded example</span><span class="pmx-collab-ws">Watch an example</span>', glyph: 'play', attrs: 'data-hover-key="collab-example:' + esc(run.id) + '" data-hover-tip="' + esc(S.pmxFill(S.PMX_COPY.exampleHelper, { kind: K })) + '"' }, openBtn];
    } else if (TERMINAL[st]) {
      if (st === 'completed') {
        parts.actions = [{ action: open, label: 'Open Panel', primary: true, core: true }];
        var art = (run.artifacts || []).filter(function (a) { return a && a.kind === 'csv'; })[0];
        if (art && window.PM56_CREW && window.PM56_CREW.owns && window.PM56_CREW.owns(run.id)) parts.followOns.push({ action: 'crew-export-result', label: 'Download' });
      } else {
        parts.actions = [{ action: 'collab-open-configure', attrs: 'data-kind="' + esc(run.kind) + '" data-reconfigure="' + esc(run.id) + '"', label: 'Run again with changes…', core: true }, openBtn];
      }
    } else if (st === 'paused') {
      /* below 360 px the row keeps Resume and Open Panel; Message leaves it (pmx-act-extra) */
      parts.actions = [{ action: 'collab-resume', label: 'Resume', core: true }, openBtn, { action: 'collab-message', label: 'Message', extra: true }];
    } else {
      parts.actions = play ? [{ action: play.action, label: play.label, primary: true, core: true }, openBtn, { action: 'collab-message', label: 'Message', extra: true }] : [openBtn, msgBtn];
    }
    if (st === 'completed') {
      var n = (run.participants || []).length;
      var sub = [S.pmxFill(S.PMX_COPY.worked, { time: clockOf(run, st), n: n }).replace(/helpers$/, n === 1 ? NOUN[run.kind] : NOUN[run.kind] + 's'), esc(costOf(run, st))];
      /* the honesty label leads a recorded example's figures (C11), so a narrow card never cuts it */
      if (provenance(run.id) === 'recorded') sub.reverse();
      parts.result = { glyph: 'check', headline: esc(headlineOf(run)), sub: sub.join(' · '), outputHtml: outputOf(run), boardHtml: '', creditsHtml: S.pmxCredits({ key: 'cred:' + run.id, items: creditsOf(run) }) };
    }
    var glyph = st === 'completed' ? 'check' : st === 'cancelled' ? 'slash-circle' : 'warn';
    var rh = st === 'completed' ? headlineOf(run) : s.word + (st === 'cancelled' ? '' : ' · ' + s.reason);
    parts.receipt = { glyph: glyph, headline: esc(rh), time: esc(clockOf(run, st)), cost: esc(costOf(run, st)) };
    return parts;
  }
  /* KIND INTERFACE (card): PM56_<KIND>.cardParts(run, ctx, face, generic), looked up lazily per render. Every field
     it returns (not undefined) replaces COLLAB's generic one, in the reference build's C.card shape (proto-src
     40-collab.js) that wave 2 builds against. Tolerated shapes, normalised here: cluster [html | '|' | {html, mini}]
     (+ clusterMini [html]), meta [html] (+ recorded) or {parts, recorded}, result html or {glyph, headline, sub,
     outputHtml, boardHtml, creditsHtml}, more [{action, label, attrs, disabled, reason}] (the kind's More entries),
     nouns {waiting, progress, cancelExtra} (or waitingNoun / progressNoun), allowedActions (the recovery buttons
     of a failed face), density (the face the run would take by itself), dock {tone, sentence}. A card has no
     Technical details line (2026-10-07, Jared): the command a sheet would send stays in its Advanced page only.
     On the shared faces (waiting, paused, cancelled, stopped at your limit, a failed run with no decision of the
     kind's own) COLLAB's sentence and actions stay (IMPACT A3-04); the kind supplies nouns, track, lanes and marks. */
  var SHARED_OK = { track: 1, lanes: 1, cluster: 1, clusterMini: 1, clock: 1, openAction: 1, openAttrs: 1, kindWord: 1, nouns: 1, waitingNoun: 1, progressNoun: 1, allowedActions: 1, more: 1, recorded: 1, dock: 1 };
  var DENSITY_OK = { starting: 1, waiting: 1, live: 1, attention: 1, result: 1, failed: 1 };
  function kindParts(run, ctx, face, generic) {
    var mod = kindModule(run.kind);
    if (!mod || typeof mod.cardParts !== 'function') return null;
    try { var own = mod.cardParts(run, ctx, face, generic); return own && typeof own === 'object' ? own : null; }
    catch (e) { try { console.info('PM56_COLLAB: ' + run.kind + ' cardParts threw', e); } catch (e2) { } return null; }
  }
  function cardParts(run, ctx, face, st) {
    var generic = genericCardParts(run, ctx, face, st);
    var own = kindParts(run, ctx, face, generic);
    if (!own) return generic;
    var shared = st === 'waiting' || st === 'paused' || st === 'cancelled' || st === 'limit' || (st === 'failed' && !own.decision);
    var out = {};
    for (var k in generic) if (Object.prototype.hasOwnProperty.call(generic, k)) out[k] = generic[k];
    for (var k2 in own) if (Object.prototype.hasOwnProperty.call(own, k2) && own[k2] !== undefined && own[k2] !== null && (!shared || SHARED_OK[k2])) out[k2] = own[k2];
    if (!shared && own.decision === null) out.decision = null;
    /* normalise the tolerated shapes */
    if (Array.isArray(out.cluster)) {
      var objs = out.cluster.filter(function (x) { return x && typeof x === 'object'; });
      if (!own.clusterMini && objs.length) out.clusterMini = objs.map(function (x) { return x.mini || x.html; });
      out.cluster = out.cluster.map(function (x) { return x && typeof x === 'object' ? (x.html || '') : x; });
    }
    if (!out.clusterMini) out.clusterMini = clusterOf(run, 12, st);
    if (Array.isArray(out.meta)) out.meta = { parts: out.meta, recorded: own.recorded != null ? !!own.recorded : generic.meta.recorded };
    if (typeof out.result === 'string') out.result = out.result ? { html: out.result } : generic.result;
    if (Array.isArray(own.more)) out.moreExtra = own.more;
    var nouns = own.nouns || {};
    var prog = nouns.cancelExtra || nouns.progress;
    if (st === 'cancelled' && prog) out.sentence = { status: 'cancelled', word: 'Cancelled', reason: esc(prog) + ' · everything so far is kept.' };
    var wn = nouns.waiting || own.waitingNoun;
    if (st === 'waiting' && wn && !run.blockedReason) out.sentence = { status: 'waiting', word: 'Waiting to start', reason: esc('Nothing runs by itself in this preview, so ' + wn + ' yet.') };
    if (shared && TERMINAL[st] && Array.isArray(own.allowedActions) && own.allowedActions.length) out.actions = own.allowedActions.concat([{ action: out.openAction, attrs: own.openAttrs || '', label: 'Open Panel', core: true }]);
    if (own.openAction && (shared || !own.actions)) (out.actions || []).forEach(function (a) {
      if (a && a.core && /^(collab-open-panel|crew-open-work|review-open-report|brainstorm-open-results)$/.test(a.action)) { a.action = own.openAction; if (own.openAttrs) a.attrs = own.openAttrs; }
    });
    out.own = own;
    return out;
  }

  /* ---- the face (7.1, 7.8, G-07, G-19): which density this render shows ---- */
  function userCount(tid) {
    var th = ((EXT.ctx() || {}).state || {}).threads || [];
    for (var i = 0; i < th.length; i++) if (th[i].id === tid) return (th[i].messages || []).filter(function (m) { return m.role === 'user'; }).length;
    return 0;
  }
  function newestLive(run) {
    var live = runsForThread(run.threadId).filter(function (r) { var s = presentState(r); return !TERMINAL[s] && s !== 'waiting'; });
    return live.length ? live[live.length - 1] : null;
  }
  function fullFace(st) { return st === 'completed' ? 'result' : TERMINAL[st] ? 'failed' : st === 'attention' ? 'attention' : st === 'waiting' ? 'waiting' : st === 'starting' ? 'starting' : 'live'; }
  function faceOf(run, st) {
    var e = UI.expanded[run.id];
    if (e === 'open') return fullFace(st);
    if (e === 'closed') return TERMINAL[st] ? 'receipt' : 'collapsed';
    if (TERMINAL[st]) {
      var m = UI.doneMark[run.id];
      return m && userCount(run.threadId) === m.users && runsForThread(run.threadId).length === m.runs ? fullFace(st) : 'receipt';
    }
    /* a long chat with several wand-started runs keeps only the newest waiting one at full density; older ones fold
       to head + sentence like older live runs (F.9) */
    if (st === 'waiting') { var na = runsForThread(run.threadId).filter(function (r) { return !TERMINAL[presentState(r)]; }); return na.length && na[na.length - 1] !== run ? 'collapsed' : 'waiting'; }
    if (st === 'starting') return fullFace(st);
    var nl = newestLive(run);
    return nl && nl !== run ? 'collapsed' : fullFace(st);
  }
  /* a change of state is noted once per render: a run that finishes in this session keeps its finished face until
     your next message or a newer run in the thread (7.8); the two sound moments ride on it (G-35) */
  function noteState(run, st) {
    var prev = UI.last[run.id];
    if (prev && prev !== st) {
      if (TERMINAL[st] && !TERMINAL[prev]) UI.doneMark[run.id] = { users: userCount(run.threadId), runs: runsForThread(run.threadId).length };
      var P = PMX_();
      /* a room between rounds is your move (accent), not a helper that needs you: no needs chime for it */
      if (P && P.sound) { if (st === 'attention' && !roomYourMove(run)) P.sound('needs'); else if (st === 'completed') P.sound('complete'); }
    }
    UI.last[run.id] = st;
  }
  function tok(name, fallback) { var P = PMX_(); var v = P && P.t ? P.t(name) : 0; return v > 0 ? v : fallback; }
  function later(ms, fn) { var P = PMX_(); if (P && P.timeline && P.timeline.after) return P.timeline.after(ms, fn); return setTimeout(fn, clockMs(ms)); }
  /* G-07: live -> result (M6) and result -> receipt (M7) hold the old face one beat, decided in the template */
  function settleFace(run, face) {
    var id = run.id, prev = UI.face[id], s = UI.settling[id];
    if (s) return { face: s.from, settling: true };
    var fold = prev && prev !== face && !(PMX_() && PMX_().reduced && PMX_().reduced()) &&
      (((prev === 'live' || prev === 'attention') && face === 'result') || ((prev === 'result' || prev === 'failed') && face === 'receipt'));
    if (fold) {
      /* M6 beat 1 is 260 ms (the stop fill 240 + one 20 ms step), M7's hold is the 120 ms fade (FOUNDATION REQUEST 9) */
      var hold = face === 'receipt' ? tok('fade', 120) : tok('stop', 240) + tok('at-r1', 20);
      UI.settling[id] = { from: prev, to: face, ms: hold };
      later(hold, function () { UI.face[id] = face; UI.settling[id] = null; var c = EXT.ctx(); if (c && c.renderApp) c.renderApp(); });
      return { face: prev, settling: true };
    }
    UI.face[id] = face;
    return { face: face, settling: false };
  }

  function canPause(run) { return run.status === 'running' && presentState(run) !== 'waiting'; }
  function canResume(run) { return run.status === 'paused' || (run.status === 'waiting' && !run.blockedReason); }
  function canCancel(run) { return ['running', 'paused', 'waiting', 'blocked', 'configuring'].indexOf(run.status) >= 0; }

  /* the More row (G-12): an in-card row of real buttons that replaces the actions row in place (no Technical
     details: 2026-10-07, Jared) */
  function moreItems(run, st, p, shown) {
    var K = KIND_LABEL[run.kind], out = [], planBound = !!(run.crew && run.crew.planBinding);
    if (canPause(run) && !TERMINAL[st]) out.push({ action: 'collab-pause', label: 'Pause' });
    else if (canResume(run)) out.push({ action: 'collab-resume', label: 'Resume' });
    if (canCancel(run)) out.push({ action: 'collab-cancel-ask', label: 'Cancel ' + K + '…' });
    if (run.kind === 'review' && TERMINAL[st]) out.push({ action: 'collab-review-run-again', label: 'Run Another Review' });
    if (run.kind === 'chat_room' && !TERMINAL[st] && st !== 'waiting' && !(window.PM56_ROOM && window.PM56_ROOM.owns && window.PM56_ROOM.owns(run.id))) out.push({ action: 'collab-room-summarize', label: 'Summarize Now' });
    (p.moreExtra || []).forEach(function (x) { if (x && !out.some(function (y) { return y.action === x.action; })) out.push(x); });
    var re = { action: 'collab-open-configure', attrs: 'data-kind="' + esc(run.kind) + '" data-reconfigure="' + esc(run.id) + '"', label: TERMINAL[st] ? 'Run again with changes…' : 'Change setup…' };
    if (planBound) { re.disabled = true; re.reason = 'This Crew builds a frozen plan. Cancel it or change the plan first.'; }
    out.push(re);
    if (TERMINAL[st]) out.push({ action: 'collab-message', label: 'Message', disabled: true, reason: S_().pmxFill(S_().PMX_COPY.finishedMessage, { kind: K }) });
    /* A1-38: disabled with its reason, unless the kind's own More already has a working export (ROOM-A (d)) */
    /* a run that has not started has no transcript yet, so a waiting card's More does not offer one */
    if ((hasStarted(run) || TERMINAL[st]) && !out.some(function (y) { return /export/.test(y.action) && !y.disabled; })) out.push({ action: 'collab-export', label: 'Download transcript', disabled: true, reason: 'Not in this preview', attrs: 'data-failure="command_not_registered"' });
    /* DON'T 31: a control already on the card (decision row, actions row) is not repeated here */
    var seen = {};
    return out.filter(function (x) { var k = x.action + '|' + (x.attrs || ''); if (shown[x.action] || shown[k] || seen[k]) return false; seen[k] = 1; return true; });
  }
  function moreRowHtml(run, st, p, shown) {
    var ra = ' data-run="' + esc(run.id) + '"';
    var items = moreItems(run, st, p, shown).map(function (x) {
      var at = /(^|\s)data-run=/.test(x.attrs || '') ? ' ' + x.attrs : ra + (x.attrs ? ' ' + x.attrs : '');
      return '<span class="pmx-collab-mi"><button type="button" class="text-button pmx-act" data-action="' + esc(x.action) + '"' + at + (x.disabled ? ' disabled' : '') + '>' + x.label + '</button>' +
        (x.disabled && x.reason ? '<span class="pmx-collab-why">' + esc(x.reason) + '</span>' : '') + '</span>';
    }).join('');
    return '<div class="pmx-actions pmx-collab-more" data-k="collab-more-' + esc(run.id) + '">' + items + '<span class="pmx-grow"></span>' +
      '<button type="button" class="icon-button pmx-act" data-action="collab-toggle-more"' + ra + ' aria-label="Close More" aria-expanded="true">' + S_().pmxGlyph('close', 14) + '</button></div>';
  }
  function withRun(list, run) {
    return (list || []).filter(Boolean).map(function (a) {
      var o = {}; for (var k in a) o[k] = a[k];
      o.attrs = /(^|\s)data-run=/.test(a.attrs || '') ? a.attrs : 'data-run="' + esc(run.id) + '"' + (a.attrs ? ' ' + a.attrs : '');
      return o;
    });
  }

  var VIEW_FOLLOW_ON = /^collab-(brainstorm|review|room)-/;
  function renderCard(ctx, run) {
    if (run.crew && run.crew.planBinding) refreshPlanCrew(run.crew.planBinding.plan_id);
    var S = S_(), id = run.id, K = KIND_LABEL[run.kind], st = presentState(run);
    noteState(run, st);
    var face0 = faceOf(run, st), p = cardParts(run, ctx, face0, st);
    /* a kind may say which full face its run takes by itself (Review's partial pass is attention, 8.5) */
    if (p.own && DENSITY_OK[p.own.density] && face0 !== 'receipt' && face0 !== 'collapsed' && UI.expanded[run.id] !== 'closed' && p.own.density !== face0 && !(TERMINAL[st] && p.own.density !== 'result' && p.own.density !== 'failed')) {
      face0 = p.own.density; p = cardParts(run, ctx, face0, st);
    }
    var sf = settleFace(run, face0), face = sf.face;
    if (face !== face0) p = cardParts(run, ctx, face, st);
    var KW = p.kindWord ? p.kindWord : esc(K);
    var ra = 'data-run="' + esc(id) + '"';
    if (face === 'receipt') {
      var rc = p.receipt || {};
      var rrec = rc.recorded != null ? !!rc.recorded : provenance(id) === 'recorded';
      return S.pmxReceipt({ key: 'collab-card-' + id, cls: 'collab-card ' + KIND_CLS[run.kind], runId: id, kind: run.kind, kindWord: KW,
        cluster: p.clusterMini, title: esc(shownTitle(run)), headline: rc.headline, glyph: rc.glyph, time: rc.time, cost: rrec ? esc(S.PMX_COPY.cost.recorded) : rc.cost,
        /* one flex item, so "Open" and " Panel" keep one word space (the button's gap would open a second one) */
        recorded: rrec, open: { action: p.openAction, attrs: p.openAttrs || '', label: '<span>Open<span class="pmx-long"> Panel</span></span>' },
        headCls: 'collab-card-head', footCls: 'collab-card-foot', badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title', statusCls: 'collab-status', metaCls: 'collab-card-meta' });
    }
    var chevron = '<button type="button" class="icon-button pmx-collab-chev" data-action="collab-toggle-expand" ' + ra + ' aria-label="Expand" aria-expanded="false">' + S.pmxGlyph('chevron-down', 15) + '</button>';
    var head = S.pmxRunHead({ kind: run.kind, kindWord: KW, title: esc(shownTitle(run)), badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title', cluster: p.cluster, clock: p.clock, clockKey: 'clk:' + id, extra: face === 'collapsed' ? chevron : '' });
    var shown = {}, viewing = !!(PMX_() && PMX_().viewOpen && PMX_().viewOpen(id)), inView = false;
    function mark(list) { (list || []).forEach(function (a) { if (a) shown[a.action] = 1; }); }
    var body = '';
    if (face === 'result' && p.result && p.result.html) body = p.result.html;
    else if (face === 'result' && p.result) {
      var R = p.result;
      body = S.pmxResult({ key: 'res:' + id, cls: 'collab-status', glyph: R.glyph, headline: R.headline, sub: R.sub ? '<span class="collab-card-meta">' + R.sub + '</span>' : '', outputHtml: R.outputHtml, boardHtml: R.boardHtml, creditsHtml: R.creditsHtml });
    } else {
      var dec = p.decision && (face === 'attention' || face === 'collapsed' || face === 'failed') ? p.decision : null;
      if (dec) {
        var dacts = face === 'collapsed' ? dec.actions.filter(function (x) { return x.action !== 'collab-cancel-ask'; }) : dec.actions;
        /* 7.12 one control set: while the run view is open beside the chat, the legacy follow-ons it draws (Write the plan,
           One more debate round, Next Round, Create To-Dos…) leave the card, and the card points at the view instead */
        if (viewing) { var kept = dacts.filter(function (x) { return !VIEW_FOLLOW_ON.test(x.action); }); if (kept.length !== dacts.length) { inView = true; dacts = kept; } }
        var da = withRun(dacts, run); mark(dacts); body += S.pmxDecision({ key: 'dec:' + id, cls: 'collab-status', tone: dec.tone, glyph: dec.glyph, sentence: dec.sentence, actions: da });
      }
      else body += S.pmxSentence({ key: 'collab-status', cls: 'collab-status', status: p.sentence.status, word: p.sentence.word, reason: p.sentence.reason });
      /* a collapsed card has no meta row: its track's count line carries the .collab-card-meta hook (B.5) */
      if (p.track) body += S.pmxTrack({ key: 'trk:' + id, cls: ((face === 'collapsed' ? 'collab-card-meta' : '') + (p.track.cls ? ' ' + p.track.cls : '')).trim(), stops: p.track.stops, nowText: p.track.nowText });
      if (face !== 'collapsed') {
        if (p.board) body += p.board;
        if (face === 'live' || face === 'attention' || (face === 'failed' && hasStarted(run))) body += p.lanes != null ? p.lanes : lanesOf(run, !!UI.allLanes[id], face === 'attention');
        if (p.meta) body += S.pmxMeta({ key: 'meta:' + id, cls: 'collab-card-meta', parts: p.meta.parts, recorded: p.meta.recorded });
      }
    }
    var foot = '';
    if (face !== 'collapsed') {
      /* 7.12: only decision follow-ons (review ticks, To-Dos, Write the plan, Next Round…) move to the open view; an
         export such as the Crew's Download stays on the card, and the pointer shows only when a decision moved */
      var follow = (p.followOns || []).filter(function (x) { return !(viewing && x && !/export|download/i.test(x.action + ' ' + (x.label || ''))); });
      if (viewing && follow.length !== (p.followOns || []).length) inView = true;
      var acts = (p.actions || []).concat(follow);
      if (UI.cancelAsk[id] && canCancel(run)) {
        foot = S.pmxInlineConfirm({ key: 'cancelask:' + id, sentence: '<b>' + esc(S.pmxFill(S.PMX_COPY.cancelConfirm.sentence.split('?')[0] + '?', { kind: K })) + '</b> Everything so far is kept.',
          confirm: { action: 'collab-cancel', attrs: ra, label: esc('Cancel ' + K), tone: 'soft' }, keep: { action: 'collab-cancel-keep', attrs: ra, label: 'Keep going' } });
      } else if (UI.more[id]) {
        foot = moreRowHtml(run, st, p, shown);
      } else {
        foot = S.pmxActions({ key: 'acts:' + id, collabHooks: true, items: withRun(acts, run), expand: { attrs: ra, open: UI.expanded[id] === 'open' || face === 'live' || face === 'attention' || face === 'result' || face === 'failed' }, more: { attrs: ra } });
        var ptr = viewing && inView ? (p.pointer || (run.kind === 'review' ? S.PMX_COPY.oneControlSet.review : S.PMX_COPY.oneControlSet.panel)) : '';
        if (ptr) foot = foot.replace(/^(<div[^>]*>)/, '$1<span class="pmx-collab-choosing" data-k="choosing:' + esc(id) + '">' + S.pmxGlyph('chevron-right', 14) + '<span>' + esc(ptr) + '</span></span>');
      }
    }
    return S.pmxRun({ key: 'collab-card-' + id, runId: id, kind: run.kind, density: face, cls: 'collab-card ' + KIND_CLS[run.kind],
      tone: face === 'attention' && p.decision && p.decision.tone === 'accent' ? 'accent' : '', arriving: !!UI.arriving[id], settling: sf.settling,
      attrs: sf.settling && UI.settling[id] ? 'data-collab-settle="' + esc(UI.settling[id].to) + '"' : '',
      headHtml: head, bodyHtml: body, bodyKey: 'collab-body-' + id, bodyCls: 'collab-card-body', footHtml: foot, headCls: 'collab-card-head', footCls: 'collab-card-foot' });
  }

  EXT.slot('transcriptMessage', function (ctx) {
    var m = ctx.m;
    if (!m || m.type !== 'collab-run') return '';
    var run = findRun(m.runId);
    if (!run) return '<p class="pmx-collab-missing" data-k="collab-missing-' + esc(m.runId) + '">This ' + 'run is no longer in this session.</p>';
    return renderCard(ctx, run);
  });
  /* 7.14: a run card is a team, so the spine gives it the people tick (first answer wins; this module loads before
     turn-stage.js) */
  EXT.slot('transcriptFamily', function (ctx) { var m = ctx && ctx.m; return m && m.type === 'collab-run' ? 'people' : ''; });

  /* M6 beat 2 / M7 beat 1: the old body and foot fade before the template switches faces (opacity only; G-04: the
     app's flipHeights is the one height animator). The fade is a CSS animation keyed on the settling attributes the
     template writes (collaboration.css, motion tokens): it starts in the same DOM write as the hold, a film seek sees it
     from the first frame, and it ends by itself when the attribute goes at the switch (no fill left on a kept node). */

  /* ---- the dock (C14/C15, 7.8): a run whose card is off-screen keeps one line above the composer. Needs-you
     lines show until the whole card is visible; live lines once the card's head has been away 400 ms (the host
     decides). A waiting run is not doing anything, so it gets no line; finished runs get none. ---- */
  if (PMX_() && PMX_().dock) PMX_().dock.provide(function (ctx) {
    var S = S_(), out = [];
    if (!S || !S.pmxDockLine || !ctx || !ctx.state) return out;
    runsForThread(ctx.state.selectedThread).forEach(function (run) {
      var st = presentState(run);
      if (TERMINAL[st] || st === 'waiting') return;
      var att = st === 'attention' ? attentionOf(run) : null;
      var tone = att ? (att.tone === 'accent' ? 'yourmove' : 'needs') : 'live';
      var say = esc(att ? att.plain : sentenceOf(run).reason);
      /* a kind may word its own dock line ({tone, sentence} as HTML), e.g. a Chat Room round that is your move */
      var own = kindParts(run, ctx, UI.face[run.id] || 'live', null);
      if (own && own.dock && own.dock.sentence) { say = own.dock.sentence; if ({ live: 1, needs: 1, yourmove: 1 }[own.dock.tone]) tone = own.dock.tone; }
      out.push({ runId: run.id, tone: tone, at: Date.parse(run.createdAt) || 0,
        html: S.pmxDockLine({ key: 'pmx-dock:' + run.id, tone: tone, runId: run.id, markHtml: S.pmxKindMark(run.kind, 16), kindWord: esc(KIND_LABEL[run.kind]),
          sentence: tone === 'live' ? esc(shownTitle(run)) + ' · ' + say : say, time: tone === 'live' ? esc(clockOf(run, st)) : '',
          action: { action: 'pmx-dock-show', attrs: 'data-run="' + esc(run.id) + '"', label: tone === 'needs' ? 'Review' : 'Show' } }) });
    });
    return out;
  });

  /* G-30 DEST-04: a user message sent to a run says where it went; rooms add their replies (no "Read", A1-40) */
  EXT.slot('messageMeta', function (ctx) {
    var m = ctx && ctx.message;
    if (!m || m.role !== 'user' || !m.id || !UI.sentTo[m.id]) return '';
    var run = findRun(UI.sentTo[m.id]), S = S_();
    if (!run || !S || !S.pmxTick) return '';
    var txt = S.pmxFill(S.PMX_COPY.sentTo, { kind: KIND_LABEL[run.kind], title: shownTitle(run) });
    if (run.kind === 'chat_room') { var n = (run.messages || []).filter(function (x) { return x.replyTo === m.id; }).length; if (n) txt += ' · ' + plural(n, 'reply', 'replies'); }
    return S.pmxTick({ key: 'collab-sent:' + m.id, glyph: 'chevron-right', text: txt });
  });

  /* =====================================================================
     8. SHARED LIFECYCLE ACTIONS
     ===================================================================== */
  /* G-19: three states per card: auto (undefined), 'open', 'closed'; the first click on any card shows its body */
  UI.allLanes = UI.allLanes || {};
  /* view state (A3-07): "Show all" lists every helper's lane on the card; the run view's Team tab has the same list */
  EXT.action('collab-show-lanes', function (ctx, btn) { var id = btn.dataset.run; UI.allLanes[id] = !UI.allLanes[id]; ctx.renderApp(); return true; });
  EXT.action('collab-toggle-expand', function (ctx, btn) { var id = btn.dataset.run; UI.expanded[id] = UI.expanded[id] === 'open' ? 'closed' : 'open'; ctx.renderApp(); return true; });
  EXT.action('collab-toggle-more', function (ctx, btn) {
    var id = btn.dataset.run, run = findRun(id);
    UI.more[id] = !UI.more[id]; UI.cancelAsk[id] = false;
    /* a receipt has no room for the row: More opens its finished face with the row in place */
    if (UI.more[id] && run && UI.face[id] === 'receipt') UI.expanded[id] = 'open';
    ctx.renderApp(); return true;
  });
  /* new card actions (IMPACT A3-07): collab-cancel-ask / -keep are view state; collab-watch-example
     is demo (8.15: a demo action never becomes a command) */
  EXT.action('collab-cancel-ask', function (ctx, btn) { var id = btn.dataset.run; UI.cancelAsk[id] = true; UI.more[id] = false; ctx.renderApp(); return true; });
  EXT.action('collab-cancel-keep', function (ctx, btn) { UI.cancelAsk[btn.dataset.run] = false; ctx.renderApp(); return true; });
  var EXAMPLE_START = { crew: ['crew-demo-start', 'delegation'], review: ['review-demo-start', 'multi'], brainstorm: ['brainstorm-demo-start', 'synthesis'], chat_room: ['room-demo-start', 'discussion'] };
  /* G-32: a wand-started run never plays in place; the recorded example opens in a new chat with its own team */
  EXT.action('collab-watch-example', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var ex = EXAMPLE_START[run.kind]; if (!ex) return true;
    if (run.kind === 'review' && (run.config || {}).strategy === 'single_agent') ex = ['review-demo-start', 'single'];
    var b = document.createElement('button'); b.dataset.action = ex[0]; b.dataset.flow = ex[1];
    if (EXT.run) EXT.run(ex[0], b, new Event('click'));
    else if (EXT._actions && EXT._actions[ex[0]]) EXT._actions[ex[0]](ctx, b, new Event('click'));
    return true;
  });

  EXT.action('collab-pause', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run || !canPause(run)) return true;
    if(run.crew?.planBinding){PM56_PLANS.boundPause(run.crew.planBinding.plan_id);refreshPlanCrew(run.crew.planBinding.plan_id);ctx.renderApp();return true;}
    run.status = 'paused'; run.stopEpoch += 1;
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Paused. Nothing was lost.' }));
    ctx.renderApp();
    return true;
  });
  EXT.action('collab-resume', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    if(run.crew?.planBinding){const plan=PM56_PLANS.get(run.crew.planBinding.plan_id),v=crewExecutionGate(run.crew.planBinding.plan_id),stop=PM56_SCHED.checkEpoch(PM56_SCHED.stopSnapshot());if(!v.ok||!stop.ok||plan?.attention?.kind!=='paused'){ctx.toast('Can’t resume yet',v.error||stop.error||'Use the Plan recovery or scheduling owner for this condition.');return true;}PM56_PLANS.boundResume(run.crew.planBinding.plan_id);refreshPlanCrew(run.crew.planBinding.plan_id);ctx.renderApp();return true;}
    if (!canResume(run)) { ctx.toast('Can’t resume yet', run.blockedReason || 'It isn’t paused.'); return true; }
    run.status = 'running';
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Picked up where it left off.' }));
    ctx.renderApp();
    return true;
  });
  EXT.action('collab-cancel', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    UI.cancelAsk[run.id] = false; UI.more[run.id] = false;
    if (!canCancel(run)) { ctx.renderApp(); return true; }
    if(run.crew?.planBinding){PM56_PLANS.boundCancel(run.crew.planBinding.plan_id);refreshPlanCrew(run.crew.planBinding.plan_id);ctx.renderApp();return true;}
    run.status = 'canceled'; run.completedAt = nowIso(); run.stopEpoch += 1;
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Cancelled. Everything it produced so far is kept here.' }));
    if (RT.composer.destination && RT.composer.destination.refId === run.id) {
      var buf = RT.composer.bufferFor ? RT.composer.bufferFor(ctx.state.selectedThread) : null;
      var emptyBuf = !buf || (!buf.text && !(buf.attachments && buf.attachments.length));
      if (emptyBuf) { RT.composer.destination = null; if (buf) buf.destination = null; }
      else { RT.composer.destination.label = '(ended) ' + RT.composer.destination.label; RT.composer.destination.detail = 'This ' + KIND_LABEL[run.kind] + ' has ended. Pick another destination or clear it.'; }
    }
    ctx.renderApp();
    return true;
  });
  /* IMPACT A1-38: Download transcript renders disabled with its reason until export is wired; a dispatch that
     still reaches this (a harness, an old caller) is refused in the same words */
  EXT.action('collab-export', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    ctx.toast('Download transcript', 'Not available in this preview.');
    return true;
  });

  /* =====================================================================
     9. COMPOSER TARGETING (§4.5/4.6, COLLAB-007) — never render our own
     ribbon; composer-state.js owns `composerRibbon` and `clear-destination`.
     We only ever write `RT.composer.destination` and contribute rows through
     `destinationProviders`, exactly per that module's header contract.
     ===================================================================== */
  function destinationGlyph(kind) { return KIND_ICON[kind] || 'users'; }
  function runDestination(run, participantId) {
    var p = participantId ? participant(run, participantId) : null;
    /* 8.0: "{Kind} · {card title} · {n} helpers" (composer-state renders label and detail) */
    return {
      kind: p ? 'participant' : 'workflow', destinationKind: run.kind,
      refId: run.id, participantId: p ? p.id : null,
      label: KIND_LABEL[run.kind] + ' · ' + shownTitle(run) + (p ? ' · ' + p.role : ''),
      detail: p ? 'only this ' + NOUN[run.kind] : plural2(run.participants.length, NOUN[run.kind]),
      glyph: destinationGlyph(run.kind)
    };
  }
  EXT.action('collab-message', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    RT.composer.destination = runDestination(run, btn.dataset.participant || null);
    var buf = RT.composer.bufferFor ? RT.composer.bufferFor(ctx.state.selectedThread) : null;
    if (buf) buf.destination = RT.composer.destination;
    ctx.closeDialog && ctx.closeDialog();
    ctx.renderApp();
    return true;
  });
  if (RT.composer.destinationProviders) {
    RT.composer.destinationProviders.push(function (ctx) {
      var out = [];
      RTC.runs.forEach(function (run) {
        if (TERMINAL[presentState(run)]) return;
        out.push({ id: 'collab:' + run.id, kind: 'workflow', destinationKind: run.kind, refId: run.id, label: KIND_LABEL[run.kind] + ' · ' + shownTitle(run), detail: plural2(run.participants.length, NOUN[run.kind]), glyph: destinationGlyph(run.kind) });
        run.participants.forEach(function (p) {
          out.push({ id: 'collab:' + run.id + ':' + p.id, kind: 'participant', destinationKind: run.kind, refId: run.id, participantId: p.id, label: KIND_LABEL[run.kind] + ' · ' + shownTitle(run) + ' · ' + p.role, detail: 'only this ' + NOUN[run.kind], glyph: destinationGlyph(run.kind) });
        });
      });
      return out;
    });
  }
  /* §2.3 "written once and referenced twice": the ordinary composer send
     already wrote the one durable user message on the thread (composer-
     state.js's `commitBuffer`, which runs every registered commitHook right
     after that admission and before the buffer clears — see that module's
     header). This hook only REFERENCES it into the targeted run's own
     transcript; it creates no second durable user message. Never calls
     `ctx.renderApp()` here: `commitBuffer` runs mid-render, inside the
     `composerBelow` template string this module's own handler (below) also
     contributes to, so a nested render here would be reentrant. The send
     that triggered this hook already renders on its own next frame. */
  /* MODAL-012. A BrainStorm asked for in PROSE must be HELD before any
     provider dispatch, opened for configuration, and returned intact if the
     user cancels. The cancel handler below has always known how to restore a
     held request, but nothing ever produced one -- the restore path was
     unreachable, so a prose request would simply have been sent. This is the
     producer: it claims the submission, parks it in the durable ComposerBuffer
     (so a thread switch or a reload does not lose it) and opens the modal.
     It deliberately runs BEFORE the destination hook below. */
  var NL_BRAINSTORM = /\b(brain\s?storm|brainstorm)\b/i;
  function heldRequestFrom(thread, message, buffer){
    return { threadId: thread && (thread.id || thread) || (buffer && buffer.thread_id) || null,
             text: (message && (message.body || message.text)) || (buffer && buffer.text) || '',
             attachments: (buffer && buffer.attachments ? buffer.attachments.slice() : []),
             kind: 'brainstorm' };
  }
  RT.composer.preSendHooks = RT.composer.preSendHooks || [];
  RT.composer.preSendHooks.push(function (ctx, thread, raw) {
    if (RTC.draft) return false;                   /* already configuring */
    if (!NL_BRAINSTORM.test(String(raw || ''))) return false;
    var CS = window.PM56_COMPOSER_STATE;
    var buffer = CS && CS.bufferFor ? CS.bufferFor(thread && thread.id) : null;
    if (buffer && buffer.destination) return false; /* an explicit destination wins */
    var held = heldRequestFrom(thread, { body: raw }, buffer);
    if (CS && CS.holdRequest) CS.holdRequest(held.threadId, held);
    openConfigureDraft('brainstorm', null, false);
    if (RTC.draft) {
      RTC.draft.heldRequest = held;
      /* 8.2: the job field opens prefilled with the held request, word for word. */
      if (!String(RTC.draft.purpose || '').trim()) {
        RTC.draft.purpose = held.text;
        if (!RTC.draft.nameEdited) RTC.draft.name = deriveCardTitle(held.text) || RTC.draft.name;
      }
    }
    ctx.openDialog && ctx.openDialog({ type: 'collab-configure' });
    ctx.toast && ctx.toast('BrainStorm held',
      'Your request is held before any provider call. Configure it and press Start, or cancel and get the text back exactly as written.');
    return true;                                   /* claimed: nothing was sent */
  });

  if (RT.composer.commitHooks) {
    RT.composer.commitHooks.push(function (ctx, thread, message, buffer) {
      var dest = buffer && buffer.destination;
      if (!dest || (dest.kind !== 'workflow' && dest.kind !== 'participant') || !KIND_LABEL[dest.destinationKind]) return;
      var run = findRun(dest.refId);
      if (!run || !message) return;
      /* G-30 DEST-04: the user's side says where it went ("Sent to {Kind} · {card title}") */
      UI.sentTo[message.id || ''] = run.id;
      if(window.PM56_ROOM?.owns(run.id)){window.PM56_ROOM.receiveUser(run.id,message,buffer,thread);return;}
      run.messages.push(mkMsg(run, {
        senderKind: 'user', senderName: 'You', messageType: 'message',
        body: message.body || '', recipientIds: dest.participantId ? [dest.participantId] : [],
        createdAt: message.sentAt || message.time || nowIso()
      }));
      /* Chat Room specifically demonstrates the turn policy landing a real
         reply rather than leaving the user's message unanswered — still not
         a promotion, still not a To-Do/Plan/Goal (ROOM-004). Other kinds
         just receive the referenced message; their own protocol actions
         (Next Round, Advance, etc.) carry the response forward explicitly. */
      if (run.kind === 'chat_room' && run.chatRoom) {
        var p = dest.participantId ? participant(run, dest.participantId) : run.participants[0];
        if (p) run.messages.push(mkMsg(run, { senderKind: 'participant', senderId: p.id, senderName: p.name, messageType: 'response', body: 'Noted — folding that into the current round rather than answering in isolation.' }));
      }
    });
  }
  /* §4.6 destination edge cases: ended run + empty buffer clears silently;
     ended run + non-empty buffer disclosed rather than a hidden send. Runs as
     a side effect inside the composer's own APPEND slot, so it fires every
     render without this module drawing anything of its own there. */
  EXT.slot('composerBelow', function (ctx) {
    var d = RT.composer.destination;
    if (d && (d.kind === 'workflow' || d.kind === 'participant') && KIND_LABEL[d.destinationKind]) {
      var run = findRun(d.refId);
      var ended = !run || !!TERMINAL[presentState(run)];
      if (ended) {
        var buf = RT.composer.bufferFor ? RT.composer.bufferFor(ctx.state.selectedThread) : null;
        var empty = !buf || (!buf.text && !(buf.attachments && buf.attachments.length));
        if (empty) { RT.composer.destination = null; if (buf) buf.destination = null; }
        else if (d.label.indexOf('(ended)') !== 0) { d.label = '(ended) ' + d.label; d.detail = 'This workflow has ended — retarget or clear.'; }
      }
    }
    return '';
  });

  /* =====================================================================
     10. THE RUN VIEW (COLLAB step 3; spec 4.4, 7.9, 8.0 view bullets, G-14).
     Open Panel opens the docked run view in the editor pane: collab-view.js
     draws `collab-run:{runId}` (PM56_COLLAB_VIEW), a kind's own document
     (crew-work:, review:, brainstorm:, room:) draws the same frame through
     it. The kinds chainAction('collab-open-panel') for the runs they own and
     return false otherwise; this handler opens `collab-run:` for everything
     else. The centred `collab-panel` dialog is retired: an old caller that
     still sets state.dialog = {type:'collab-panel', …} is redirected (G-14).
     ===================================================================== */
  function CV() { return window.PM56_COLLAB_VIEW; }
  var VIEW_TABS = { overview: 1, transcript: 1, participants: 1, usage: 1 };
  /* M8: the view rises in place (collab-view.css); the card the user came from gets one perimeter pulse */
  function openView(ctx, runId, o, btn) {
    var run = findRun(runId), V = CV();
    if (!run) return false;
    /* collab-view.js is part of this module's unit: without it Open Panel must say so, never be a dead button */
    if (!V || typeof V.open !== 'function') {
      try { console.error('PM56_COLLAB: collab-view.js is not loaded, so the run view cannot open (build.py MODULES must list collab-view).'); } catch (e) { }
      if (ctx && ctx.toast) ctx.toast('The run view is not available', 'This build is missing the run view, so ' + KIND_LABEL[run.kind] + ' details cannot open here. Nothing was changed.');
      return false;
    }
    o = o || {};
    if (ctx && ctx.state && ctx.state.dialog && ctx.state.dialog.type === 'collab-panel') ctx.state.dialog = null;
    var ok = V.open(run.id, { tab: VIEW_TABS[o.tab] ? o.tab : undefined, participantId: o.participantId || null });
    var card = btn && btn.closest ? btn.closest('[data-run-id]') : null;
    if (ok && card && PMX_() && PMX_().reveal) requestAnimationFrame(function () { PMX_().reveal(run.id); });
    return ok;
  }
  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'collab-panel') return '';
    /* G-14 redirect: never an empty dialog; the view opens once this render is done */
    ctx.state.dialog = null;
    var go = { runId: d.runId, tab: d.tab, participantId: d.participantId };
    queueMicrotask(function () { openView(EXT.ctx(), go.runId, go, null); });
    return '';
  });
  /* Open Panel lands on the run's first tab (Summary / Report / How they decided / Discussion) unless it names one
     (Details names Team), as the centred panel did; the tabs inside the view keep their own state */
  EXT.action('collab-open-panel', function (ctx, btn) {
    openView(ctx, btn.dataset.run, { tab: btn.dataset.tab || 'overview' }, btn);
    return true;
  });
  /* collab-view.js chains these three for buttons inside a docked view; from anywhere else they open the view */
  EXT.action('collab-panel-tab', function (ctx, btn) {
    openView(ctx, btn.dataset.run, { tab: btn.dataset.tab }, btn);
    return true;
  });
  EXT.action('collab-open-participant', function (ctx, btn) {
    openView(ctx, btn.dataset.run, { tab: 'participants', participantId: btn.dataset.participant }, btn);
    return true;
  });
  EXT.action('collab-close-participant', function (ctx, btn) {
    openView(ctx, btn.dataset.run, { tab: 'participants' }, null);
    return true;
  });

  /* =====================================================================
     11. REVIEW FOLLOW-ON — read-only, never auto-repairs (§7.6/REVIEW-012).
     ===================================================================== */
  UI.selectedFindings = UI.selectedFindings || {};
  EXT.action('collab-review-toggle-finding', function (ctx, btn) {
    if(window.PM56_REVIEW && window.PM56_REVIEW.owns(btn.dataset.run)) return window.PM56_REVIEW.toggleFinding(ctx,btn);
    var rid2 = btn.dataset.run, fid = btn.dataset.finding;
    UI.selectedFindings[rid2] = UI.selectedFindings[rid2] || {};
    UI.selectedFindings[rid2][fid] = !UI.selectedFindings[rid2][fid];
    ctx.renderOverlays(); return true;
  });
  EXT.action('collab-review-create-todos', function (ctx, btn) {
    if(window.PM56_REVIEW) return window.PM56_REVIEW.createSelectedTodos(ctx,btn);
    ctx.toast('Review unavailable','The Review module is not loaded. No To-Dos were created.');
    return true;
  });
  EXT.action('collab-review-send-findings', function (ctx, btn) {
    if(window.PM56_REVIEW && window.PM56_REVIEW.owns(btn.dataset.run)) return window.PM56_REVIEW.sendSelected(ctx,btn);
    var run = findRun(btn.dataset.run); if (!run) return true;
    var sel = UI.selectedFindings[run.id] || {};
    var picked = (run.review.findings || []).filter(function (f) { return sel[f.id]; });
    if (!picked.length) { ctx.toast('Nothing selected', 'Select at least one confirmed finding first.'); return true; }
    var text = 'Findings from ' + run.title + ':\n' + picked.map(function (f) { return '- [' + f.severity + '] ' + f.claim; }).join('\n');
    RT.composer.destination = null;
    var tid = ctx.state.selectedThread;
    ctx.state.composer = text;
    if (ctx.state.drafts) ctx.state.drafts[tid] = text;
    if (RT.composer.bufferFor) { var buf = RT.composer.bufferFor(tid); buf.text = text; buf.destination = null; }
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'request', body: 'Findings drafted to the ordinary composer for an explicit send to the agent. No repair, file mutation or automatic follow-on run was performed.' }));
    ctx.closeDialog && ctx.closeDialog();
    ctx.renderApp();
    ctx.toast('Findings drafted to the composer', 'Review, edit if needed, then send — this module never sends on your behalf.');
    return true;
  });
  EXT.action('collab-review-run-again', function (ctx, btn) {
    var old = findRun(btn.dataset.run); if (!old) return true;
    openConfigureDraft('review',old.id,false);
    RTC.draft.reconfigureRunId=null;
    RTC.draft.rerunOf=old.id;
    RTC.draft.name=old.title.replace(/\s*\(re-run.*\)$/,'')+' (re-run)';
    /* IMPACT A1-01: a re-run writes the user field reviewTargetChoice, never the recorded reviewTarget */
    if(old.review&&old.review.targetPack) RTC.draft.reviewTargetChoice=targetChoiceOf(old.review.targetPack);
    ctx.openDialog({type:'collab-configure'});
    return true;
  });

  /* =====================================================================
     12. BRAINSTORM FOLLOW-ON — protocol phases, Grill Me mid-flow, and an
     honestly-disclosed synthesis handoff (§10.5/§8.7, BRAIN-004/BRAIN-015).
     ===================================================================== */
  var BS_PHASES = ['intake', 'blind_proposals', 'normalize', 'debate', 'evidence', 'vote', 'synthesis'];
  var BS_PHASE_LABEL = { intake: 'Intake and frontier', blind_proposals: 'Blind proposals', normalize: 'Normalize', debate: 'Debate', evidence: 'Evidence round', vote: 'Vote', synthesis: 'Synthesis' };
  EXT.action('collab-brainstorm-toggle-grill', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var qb = run.brainstorm.questionBank;
    qb.grillMeEnabled = !qb.grillMeEnabled;
    var eff = qb.baselineLimit + (qb.grillMeEnabled ? qb.grillExtension : 0);
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Grill Me ' + (qb.grillMeEnabled ? 'enabled' : 'disabled') + '. Effective question maximum is now ' + eff + '. The ' + qb.askedIds.length + ' questions already asked still count — the allowance did not reset.' }));
    ctx.renderOverlays(); ctx.renderApp();
    return true;
  });
  EXT.action('collab-brainstorm-next-round', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var b = run.brainstorm;
    var idx = BS_PHASES.indexOf(b.phase);
    if (idx < 0 || idx >= BS_PHASES.length - 1) return true;
    b.phase = BS_PHASES[idx + 1];
    run.messages.push(mkMsg(run, { senderKind: 'coordinator', senderName: 'Coordinator', messageType: 'message', body: 'Advancing to ' + BS_PHASE_LABEL[b.phase] + '.' }));
    ctx.renderApp();
    ctx.toast('Advanced one round', BS_PHASE_LABEL[b.phase] + ' — cannot skip ahead of it and cannot exceed the configured ' + run.config.debateRounds + ' debate rounds.');
    return true;
  });
  EXT.action('collab-brainstorm-synthesize', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var b = run.brainstorm;
    if (b.phase !== 'vote' && b.phase !== 'synthesis') { ctx.toast('Not ready to synthesize', 'Votes are not complete yet — advance the protocol first.'); return true; }
    b.phase = 'synthesis';
    if (!b.synthesis) {
      var winner = 'prop-b';
      b.synthesis = {
        selected: winner,
        summary: 'Selected ' + winner + ' (Product’s automatic-for-work / explicit-confirm-for-personal-account failover), built on the resolver-level circuit breaker from prop-c. prop-a’s fully automatic cross-account variant stays disqualified — see the hard-constraint section — and is not revived by the vote count in its favor on the ring mechanism itself.',
        dissentPreserved: (b.dissent || []).length,
        disclosure: '`cmd.brainstorm.synthesize_plan` is not yet registered in the central command catalog, so no Plan document was created from this synthesis. The content above is exactly what that handoff would send, including the ' + (b.dissent || []).length + ' preserved dissent record(s) and the disqualified alternative — nothing here claims a Plan exists.'
      };
      run.messages.push(mkMsg(run, { senderKind: 'coordinator', senderName: 'Coordinator', messageType: 'response', body: b.synthesis.summary }));
    }
    ctx.renderApp();
    ctx.toast('Synthesis recorded', 'Dissent and the disqualified alternative are preserved verbatim. This card stays in the transcript.');
    return true;
  });

  /* =====================================================================
     13. CHAT ROOM FOLLOW-ON — rounds, summarize, and explicit-only promotion
     (§6.3/§6.4, ROOM-004/ROOM-005).
     ===================================================================== */
  var ROOM_LINES = [
    ['Product', 0, 'One more data point: the resume nudge only needs to beat the banner on week-two retention, and we already have that number from the checklist pilot.'],
    ['Design Systems', 1, 'If the nudge is louder than a banner it has to be a first-class component, not a toast variant. That is a half-day, not a new epic.'],
    ['Growth', 2, 'Fine by growth if the nudge ships with it — that was the actual objection, not the disclosure pattern itself.']
  ];
  EXT.action('collab-room-next-round', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var c = run.chatRoom;
    if (c.roundsSoFar >= run.config.maxRounds) return true;
    c.roundsSoFar += 1;
    var pick = ROOM_LINES[(c.roundsSoFar - 1) % ROOM_LINES.length];
    var p = run.participants[pick[1]] || run.participants[0];
    run.messages.push(mkMsg(run, { senderKind: 'participant', senderId: p.id, senderName: p.name, messageType: 'message', body: pick[2] }));
    run.messages.push(mkMsg(run, { senderKind: 'coordinator', senderName: 'Moderator', messageType: 'message', body: 'Round ' + c.roundsSoFar + ' close. Still nothing promoted — say the word and I will promote a conclusion.' }));
    ctx.renderApp();
    return true;
  });
  EXT.action('collab-room-summarize', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    run.messages.push(mkMsg(run, { senderKind: 'coordinator', senderName: 'Moderator', messageType: 'response', body: 'Summary requested. `cmd.chat_room.summarize` is not yet registered, so this summary is recorded as a transcript message rather than a separate versioned artifact. It creates no To-Do, Plan or Goal and does not end the room.' }));
    ctx.renderApp();
    ctx.toast('Summary recorded', 'The room stays open.');
    return true;
  });
  EXT.action('collab-room-promote', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var target = btn.dataset.target, msgId = btn.dataset.message;
    var src = run.messages.filter(function (m) { return m.id === msgId; })[0];
    if (!src) return true;
    var TARGET_LABEL = { plan: 'Plan', todo: 'To-Do', goal: 'Goal' };
    var promo = { id: rid('promo'), target: target, summary: src.body.slice(0, 140), sourceMessageId: src.id, at: nowIso() };
    run.chatRoom.promotions.push(promo);
    run.messages.push(mkMsg(run, { senderKind: 'user', senderName: 'You', messageType: 'request', body: 'Explicit promotion to ' + TARGET_LABEL[target] + ', with lineage to message ' + src.id + ' and this run (' + run.id + ').' }));
    ctx.addReceipt('collab-receipt', 'Promoted to ' + TARGET_LABEL[target], 'Source: "' + src.body.slice(0, 90) + (src.body.length > 90 ? '…' : '') + '" from ' + run.title + '. The ' + TARGET_LABEL[target] + ' owner’s own admission command is not yet registered, so this is recorded here with full lineage rather than claimed as a ' + TARGET_LABEL[target] + ' mutation that did not happen.');
    ctx.renderApp();
    return true;
  });

  /* =====================================================================
     14. THE SHARED CONFIGURATION SHEET (DESIGN-SPEC 8.0, 8.2, 6; COLLAB step 1)
     ---------------------------------------------------------------------
     One frame draws every collaboration sheet (Crew, Chat Room, BrainStorm,
     Review and Crew Auto) from the pmx builders. The kind modules supply
     their parts through PM56_<KIND>.sheetParts(draft, ctx, generic), looked
     up lazily at render time; until a kind lands, COLLAB's generic parts
     below draw it. The draft is the transaction: opening, editing and
     cancelling create nothing (RTC.effects moves only in commit), and a
     refused Start keeps the sheet and every value.
     ===================================================================== */
  var KIND_PARTICIPANT_LIMIT = { crew: [1, 8], brainstorm: [2, 8], review: [1, 8], chat_room: [2, 8] };
  var DEFAULT_ROW_MODEL = ['sonnet46', 'opus5', 'qwen38-coder', 'glm52', 'kimi-k3', 'gpt53', 'sonnet46-personal', 'haiku46'];
  /* Default teams for a new draft (8.1, 8.3, 8.4, 8.5). The counts are MUST-KEEP (B.4: crew 3, brainstorm 4,
     review 3, chat_room 4), so the Chat Room's fourth helper is a Skeptic beside 8.3's three. */
  var DEFAULT_TEAM = {
    crew: [['Builder', 'Implementer'], ['Builder', 'Implementer'], ['Checker', 'Reviewer']],
    brainstorm: [['Architecture', 'Architect', 'opus5'], ['Product', 'Product Manager', 'gpt53'], ['Implementation', 'Implementer', 'sonnet46'], ['Adversarial Review', 'Critical Advisor', 'kimi-k3']],
    review: [['Security', 'Reviewer', 'sonnet46'], ['Bugs', 'Reviewer', 'opus5'], ['Fresh eyes', 'Critical Advisor', 'gpt53']],
    chat_room: [['Product', 'Product Manager', 'gpt53'], ['Design', 'Architect', 'opus5'], ['Engineering', 'Implementer', 'sonnet46'], ['Skeptic', 'Critical Advisor', 'glm52']]
  };
  /* The job a new row suggests ("Add a helper · Suggested next: Tester"), per kind, in order. */
  var SUGGEST = {
    crew: [['Tester', 'Reviewer'], ['Docs writer', 'Teacher'], ['Integrator', 'Implementer'], ['Architect', 'Architect'], ['Second checker', 'Reviewer']],
    brainstorm: [['Operations', 'Implementer'], ['User research', 'Product Manager'], ['Security', 'Critical Advisor'], ['Design', 'Architect']],
    review: [['Speed', 'Reviewer'], ['Tests', 'Reviewer'], ['Easy to read', 'Reviewer'], ['Anything', 'Critical Advisor'], ['Second look', 'Reviewer']],
    chat_room: [['Research', 'Product Manager'], ['Support', 'Teacher'], ['Operations', 'Implementer'], ['Design systems', 'Architect']]
  };
  /* IMPACT A3-02: one specialist default, read by the sheet's prefill and by commit (it used to be hard-coded in
     commit only, so the sheet never showed which AI a specialist would use). */
  var SPECIALIST_DEFAULTS = { wonderer: { modelId: 'sonnet46-personal', persona: 'Wonderer' }, grillMe: { modelId: 'haiku46', persona: 'Implementer' } };
  var SPECIALIST_SEAT = { wonderer: 7, grillMe: 8 };
  /* The plan's concurrency in this concept (the Crew example's capacity.maxConcurrent). "You asked for 3; your plan
     runs 2 at once" reads it; a recorded draft reads its own fixture capacity. */
  var PLAN_CAPACITY = 2;
  var NOUN = { crew: 'helper', brainstorm: 'helper', chat_room: 'helper', review: 'reviewer' };
  var KIND_ARTICLE_NAME = { crew: 'a Crew', brainstorm: 'a BrainStorm', review: 'a Review', chat_room: 'a Chat Room' };

  function S_() { return window.PM56_SHELL; }
  function PMX_() { return window.PM56_PMX || null; }
  function plural2(n, noun) { return n + ' ' + noun + (n === 1 ? '' : 's'); }
  function modelName(id) { var m = modelById(id); return m ? m.name : (id || 'No model'); }
  function modelShort(id) { return modelName(id).replace(/^Claude /, ''); }
  function chatModel(ctx) { var id = ctx && ctx.state && ctx.state.model; return modelById(id) ? id : 'sonnet46'; }
  function inkText(key, text) { var P = PMX_(); return P && P.ink ? P.ink(key, text) : esc(text); }
  function waitMs(name, fallback) { var P = PMX_(); var v = P && P.wait ? P.wait(name) : 0; return v > 0 ? v : fallback; }
  function clockMs(ms) { var C = window.PM56_CLOCK; return C && C.ms ? C.ms(ms) : ms; }

  function draftRow(role, modelId, persona, additive) {
    return { rowId: rid('draftp'), role: role, requestedModelId: modelId, persona: persona || 'Implementer', requestedEffort: '', requestedFast: false, additiveRoleKind: additive || 'none' };
  }
  function defaultRows(kind, ctx) {
    var team = DEFAULT_TEAM[kind] || [];
    var base = chatModel(ctx);
    return team.map(function (t) { return draftRow(t[0], t[2] || base, t[1]); });
  }

  /* ---- seats: a helper's hue is fixed by its row while the sheet is open (3.3) ---- */
  UI.seat = UI.seat || {};
  function seatOf(d, row) {
    if (UI.seat[row.rowId]) return UI.seat[row.rowId];
    var used = {};
    d.rows.forEach(function (r) { if (UI.seat[r.rowId]) used[UI.seat[r.rowId]] = 1; });
    for (var s = 1; s <= 8; s++) if (!used[s]) { UI.seat[row.rowId] = s; return s; }
    UI.seat[row.rowId] = ((d.rows.indexOf(row) % 8) + 1);
    return UI.seat[row.rowId];
  }
  function markOf(persona) { return String(persona || 'Implementer'); }

  /* ---- the card title: auto-derived from the job until edited (8.0): the first sentence, at most 48
     characters, cut at a word boundary ---- */
  function deriveCardTitle(v) {
    var s = String(v || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    s = (s.split(/(?<=[.!?])\s/)[0] || s).trim();
    if (s.length > 48) { var cut = s.slice(0, 48); var sp = cut.lastIndexOf(' '); s = (sp > 16 ? cut.slice(0, sp) : cut).replace(/[,;:\-]+$/, '') + '…'; }
    else s = s.replace(/[.!?]+$/, '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function cardTitleOf(d) { return (d.name && String(d.name).trim()) || deriveCardTitle(d.purpose) || ('New ' + KIND_LABEL[d.kind]); }
  /* the plate's "The job" paper mirrors the first four words, cut to what its 126 px of text fit (about 16
     characters in the widest theme font) at a word boundary, so the words never run under the paper's edge */
  /* the job (or the topic) on a plate's paper: its first words, up to 40 characters; the paper fits them to its own
     width with an ellipsis (module-shell.js paper), so a wide paper shows more of the job than "Export two…" */
  function jobWords(d) {
    var w = String(d.purpose || '').trim().split(/\s+/).filter(Boolean);
    if (!w.length) return 'Not written yet';
    var take = w.slice(0, 8), cut = w.length > 8;
    while (take.length > 1 && take.join(' ').length > 40) { take.pop(); cut = true; }
    var t = take.join(' ');
    if (t.length > 40) { t = t.slice(0, 39); cut = true; }
    return t + (cut ? '…' : '');
  }

  /* ---- provenance (IMPACT A3-03): a draft is recorded when a recorded example put it together. The demos set
     draft.recorded through PM56_COLLAB.markRecorded(); until every demo does, a draft carrying a fixture input
     counts as recorded, because since this step no user control writes crewInput, reviewTarget,
     brainstormInput or roomInput (IMPACT A1-01). ---- */
  function isRecordedDraft(d) {
    return !!(d && (d.recorded === true || d.crewInput || d.reviewTarget || d.brainstormInput || d.roomInput));
  }
  UI.prov = UI.prov || {};
  UI.waiting = UI.waiting || {};
  var SEED_IDS = {};
  JSON.parse(SEED_RUNS_JSON).forEach(function (r) { SEED_IDS[r.id] = 1; });
  function provenance(runId) {
    if (UI.prov[runId]) return UI.prov[runId];
    if (SEED_IDS[runId]) return 'seed';
    var r = findRun(runId);
    if (r && ((r.crew && r.crew.protocolVersion) || (r.review && r.review.protocolVersion) || (r.brainstorm && r.brainstorm.protocolVersion) || (r.chatRoom && r.chatRoom.protocolVersion))) return 'recorded';
    return 'wand';
  }

  /* ---- Save as my default (8.0): per kind, module-local and in localStorage (a Settings transaction in the
     product, 8.15; where it is stored is out of scope). Prefills new wand drafts only. ---- */
  var DEFAULTS_KEY = 'pm56-collab-defaults.v1';
  UI.savedDefaults = UI.savedDefaults || null;
  function loadDefaults() {
    if (UI.savedDefaults) return UI.savedDefaults;
    var all = {};
    try { all = JSON.parse(window.localStorage.getItem(DEFAULTS_KEY) || '{}') || {}; } catch (e) { all = {}; }
    UI.savedDefaults = all;
    return all;
  }
  function savedDefault(kind) { var all = loadDefaults(); return all && all[kind] ? all[kind] : null; }
  function storeDefault(kind, d) {
    var all = loadDefaults();
    all[kind] = {
      rows: d.rows.map(function (r) { return { role: r.role, requestedModelId: r.requestedModelId, persona: r.persona, requestedEffort: r.requestedEffort || '', requestedFast: !!r.requestedFast }; }),
      wonderer: !!d.wonderer, grillMe: !!d.grillMe,
      specialistRoutes: JSON.parse(JSON.stringify(d.specialistRoutes || {})),
      config: JSON.parse(JSON.stringify(d.config || {}))
    };
    UI.savedDefaults = all;
    try { window.localStorage.setItem(DEFAULTS_KEY, JSON.stringify(all)); } catch (e) { }
  }
  function applySaved(d, saved) {
    if (!saved) return;
    d.rows = (saved.rows || []).map(function (r) { var x = draftRow(r.role, r.requestedModelId, r.persona); x.requestedEffort = r.requestedEffort || ''; x.requestedFast = !!r.requestedFast; return x; });
    if (!d.rows.length) d.rows = defaultRows(d.kind);
    d.wonderer = !!saved.wonderer; d.grillMe = !!saved.grillMe;
    d.specialistRoutes = Object.assign(JSON.parse(JSON.stringify(SPECIALIST_DEFAULTS)), saved.specialistRoutes || {});
    d.config = Object.assign({}, d.config, saved.config || {});
    if (d.kind === 'review') { d._lastStrategy = d.config.strategy || 'multi_pass'; d._previousMultiRows = d.rows.slice(); d.config.reviewerCount = d.rows.length; }
  }

  function openConfigureDraft(kind, reconfigureRunId, autoMode) {
    if (findRun(reconfigureRunId)?.crew?.planBinding) return;
    var ctx = EXT.ctx && EXT.ctx();
    var def = RTC.definitions[kind];
    var run = reconfigureRunId ? findRun(reconfigureRunId) : null;
    var rows = [];
    var routes = JSON.parse(JSON.stringify(SPECIALIST_DEFAULTS));
    if (run) {
      run.participants.filter(function (p) { return p.additiveRoleKind === 'none'; }).forEach(function (p) {
        var r = draftRow(p.role, p.requestedModelId, p.requestedPersona, 'none');
        r.requestedEffort = p.requestedEffort || ''; r.requestedFast = !!p.requestedFast;
        rows.push(r);
      });
      run.participants.forEach(function (p) {
        if (p.additiveRoleKind === 'wonderer') routes.wonderer = { modelId: p.requestedModelId, persona: p.requestedPersona || 'Wonderer' };
        if (p.additiveRoleKind === 'grill_me') routes.grillMe = { modelId: p.requestedModelId, persona: p.requestedPersona || 'Implementer' };
      });
    } else {
      rows = defaultRows(kind, ctx);
    }
    var wonderer = run ? run.participants.some(function (p) { return p.additiveRoleKind === 'wonderer'; }) : false;
    var grillMe = run ? (run.participants.some(function (p) { return p.additiveRoleKind === 'grill_me'; }) || !!(run.brainstorm && run.brainstorm.questionBank && run.brainstorm.questionBank.grillMeEnabled)) : false;
    var config = JSON.parse(JSON.stringify(run ? run.config : def));
    RTC.draft = {
      kind: kind, reconfigureRunId: reconfigureRunId || null, autoMode: !!autoMode,
      name: run ? run.title : '',
      nameEdited: !!run,
      purpose: run ? run.purpose : '',
      rows: rows, wonderer: wonderer, grillMe: grillMe,
      specialistRoutes: routes,
      config: config
    };
    var d = RTC.draft;
    /* a run that has ended is never rewritten: "Run again with changes…" starts a fresh run from its setup and leaves
       the ended record as it is (only a live run changes its setup in place) */
    if (run && TERMINAL[presentState(run)]) { d.reconfigureRunId = null; d.rerunOf = run.id; }
    if (kind === 'brainstorm') d.mustHaves = run && run.brainstorm && Array.isArray(run.brainstorm.mustHaves) ? run.brainstorm.mustHaves.join('\n') : '';
    if (kind === 'review') {
      d.reviewTargetChoice = run && run.review && run.review.targetPack ? targetChoiceOf(run.review.targetPack) : defaultTarget(ctx);
      d.reviewFocus = run && run.review && run.review.focus ? JSON.parse(JSON.stringify(run.review.focus)) : { bugs: true, security: true };
      if (!d.config.alsoGive) d.config.alsoGive = { changes: true, tests: true, rules: true };
    }
    if (kind === 'chat_room') {
      if (!d.config.moderatorModelId) d.config.moderatorModelId = chatModel(ctx);
      if (!d.config.moderatorPersona) d.config.moderatorPersona = 'Product Manager';
    }
    if (kind === 'brainstorm' && !d.config.synthesisModelId) d.config.synthesisModelId = chatModel(ctx);
    if (kind === 'crew' && autoMode) {
      var pol = def.autoPolicy;
      if (pol && Array.isArray(pol.rows) && pol.rows.length) d.rows = pol.rows.map(function (r) { return draftRow(r.role, r.requestedModelId, r.persona); });
      if (!d.config.autoComplexity) d.config.autoComplexity = 'high';
      if (!d.config.autoMinIndependent) d.config.autoMinIndependent = '2';
      d.wonderer = false; d.grillMe = false;
    }
    if (kind === 'review') {
      d._lastStrategy = d.config.strategy || 'multi_pass';
      if (d._lastStrategy === 'single_agent') {
        d.rows = d.rows.slice(0, 1);
        d.config.reviewerCount = 1;
      } else {
        d._previousMultiRows = d.rows.slice();
        d.config.reviewerCount = d.rows.length;
      }
    }
    UI.seat = {};
    UI.removed = null;
    UI.saved = false;
  }

  /* ---- IMPACT A3-01: ONE option catalog per enum. Every collaboration choice (the How questions, the recipes,
     Review's target, the Advanced rows) comes from here, with a distinct line per option (C.5); a disabled
     option stays listed with its reason. ---- */
  var SCHEDULED_NO = 'Scheduled builds can’t use this: they run while you’re away.';
  var CONFIG_CHOICES = {
    coordinator: { title: 'Coordinator', options: [
      { value: 'parent_assistant', label: 'This chat’s assistant', description: 'No extra AI. The assistant you’re chatting with leads.', small: 'No extra AI', sub: 'This chat’s assistant', read: 'this chat’s assistant' },
      { value: 'one_of_helpers', label: 'One of the helpers', description: 'Your first helper leads and also does a part.', disabled: true, reason: 'Not available in this preview yet.', small: 'Leads and does a part', sub: 'One of the helpers', read: 'your first helper' },
      { value: 'dedicated_synthesis_model', label: 'A separate AI', description: 'A dedicated lead. Adds one more AI, and its cost.', small: 'One more AI, and its cost', sub: 'A separate AI', read: 'a separate Coordinator' }] },
    assignmentStrategy: { title: 'Who decides who does what', options: [
      { value: 'manager_directed', label: 'The Coordinator decides', description: 'Each helper gets the part that fits it best.' },
      { value: 'explicit_static', label: 'Everyone sticks to their job', description: 'Parts follow the jobs you wrote.' },
      { value: 'adaptive', label: 'The Coordinator can shift work as it goes', description: 'Parts can move to whoever is free.' }] },
    externalResearch: { title: 'Research depth', options: [
      { value: 'maximum', label: 'Extensive research', description: 'Checks outside sources before deciding. Slower, and costs more.', read: 'thoroughly' },
      { value: 'standard', label: 'Focused research', description: 'Checks only what the options disagree on.', read: 'where the options disagree' }] },
    strategy: { title: 'Review approach', options: [
      { value: 'multi_pass', label: 'Multi-Pass Review', description: 'Several reviewers check on their own, then compare notes. Slower, catches more, shows where they disagree.', small: 'Check alone, then compare' },
      { value: 'single_agent', label: 'Single Agent', description: 'One fresh reviewer checks the work. Fastest and cheapest; nothing to compare against.', small: 'One fresh reviewer' }] },
    turnPolicy: { title: 'Who talks when', options: [
      { value: 'moderated', label: 'Moderator guides', description: 'A Moderator calls on whoever is most useful next.', read: 'the Moderator calls on whoever is most useful next' },
      { value: 'round_robin', label: 'Take turns', description: 'Everyone speaks once per round, in order.', read: 'everyone speaks in turn' },
      { value: 'free_discussion', label: 'Open discussion', description: 'Anyone can jump in when they have something to add.', read: 'anyone can jump in' },
      { value: 'ask_everyone_once', label: 'One answer each', description: 'Everyone answers once, then it stops. Good for quick opinions.', read: 'everyone answers once' }] },
    autoComplexity: { title: 'When to call the Crew', options: [
      { value: 'high', label: 'Big jobs only', description: 'Most requests stay with one assistant. Recommended to start.', read: 'big' },
      { value: 'medium', label: 'Medium and big jobs', description: 'Calls the Crew more often, and uses your limits faster.', read: 'medium or big' }] },
    autoMinIndependent: { title: 'Only when the job splits into', options: [
      { value: '2', label: '2 or more parts that can run at the same time', description: 'A job with two parts that don’t wait for each other is enough.', read: '2 or more' },
      { value: '3', label: '3 or more parts that can run at the same time', description: 'Only wider jobs: three parts that can all run at once.', read: '3 or more' }] }
  };
  /* Start from a team (8.0 roster foot; 8.1, 8.3, 8.4). Review has its three too (owner answer E-37 A,
     2026-09-27, over IMPACT A1-39); a kind may hand its own list through sheetParts roster.recipes. */
  var RECIPES = {
    review: [
      { value: 'careful', label: 'Careful review', description: 'Security, Bugs and Tests (3 reviewers).', rows: [['Security', 'Reviewer', 'sonnet46'], ['Bugs', 'Reviewer', 'opus5'], ['Tests', 'Reviewer', 'gpt53']], config: { strategy: 'multi_pass' } },
      { value: 'quick', label: 'Quick check', description: 'One fresh reviewer.', rows: [['Bugs', 'Reviewer', 'sonnet46']], config: { strategy: 'single_agent' } },
      { value: 'deep', label: 'Deep audit', description: '5 reviewers, one of them a Critical Advisor.', rows: [['Security', 'Reviewer', 'sonnet46'], ['Bugs', 'Reviewer', 'opus5'], ['Tests', 'Reviewer', 'gpt53'], ['Speed', 'Reviewer', 'glm52'], ['Anything', 'Critical Advisor', 'qwen38-coder']], config: { strategy: 'multi_pass' } }],
    crew: [
      { value: 'build-check', label: 'Build and check', description: 'Two builders and one checker.', rows: [['Builder', 'Implementer'], ['Builder', 'Implementer'], ['Checker', 'Reviewer']] },
      { value: 'split', label: 'Split a big change', description: 'One helper per area you name.', rows: [['Front end', 'Implementer'], ['Back end', 'Implementer'], ['Tests', 'Reviewer']] },
      { value: 'two-ways', label: 'Try it two ways', description: 'Two builders take different approaches; one checker compares.', rows: [['First approach', 'Implementer'], ['Second approach', 'Architect'], ['Comparer', 'Reviewer']] }],
    chat_room: [
      { value: 'quick', label: 'Quick opinions', description: '3 helpers, one answer each.', rows: [['Product', 'Product Manager'], ['Design', 'Architect'], ['Engineering', 'Implementer']], config: { turnPolicy: 'ask_everyone_once', maxRounds: 1 } },
      { value: 'debate', label: 'Debate', description: '4 helpers, Moderator guides, 3 rounds.', rows: [['Product', 'Product Manager'], ['Design', 'Architect'], ['Engineering', 'Implementer'], ['Skeptic', 'Critical Advisor']], config: { turnPolicy: 'moderated', maxRounds: 3 } },
      { value: 'deep', label: 'Deep dive', description: '5 helpers, 5 rounds, and Wonderer.', rows: [['Product', 'Product Manager'], ['Design', 'Architect'], ['Engineering', 'Implementer'], ['Skeptic', 'Critical Advisor'], ['Research', 'Product Manager']], config: { turnPolicy: 'moderated', maxRounds: 5 }, wonderer: true }],
    brainstorm: [
      { value: 'balanced', label: 'Balanced four', description: 'The canonical roles.', rows: [['Architecture', 'Architect'], ['Product', 'Product Manager'], ['Implementation', 'Implementer'], ['Adversarial Review', 'Critical Advisor']] },
      { value: 'quick', label: 'Quick call', description: 'Product and Implementation.', rows: [['Product', 'Product Manager'], ['Implementation', 'Implementer']] },
      { value: 'wide', label: 'Wide search', description: 'Six roles and Wonderer.', rows: [['Architecture', 'Architect'], ['Product', 'Product Manager'], ['Implementation', 'Implementer'], ['Adversarial Review', 'Critical Advisor'], ['Operations', 'Implementer'], ['User research', 'Product Manager']], wonderer: true }]
  };
  /* Review's target (8.5): the user field draft.reviewTargetChoice (IMPACT A1-01). Each size line is measured
     from this chat where the concept has the data, never invented. */
  var TARGETS = [
    { value: 'changes', label: 'Your latest changes', read: 'your latest changes', kind: 'changes' },
    { value: 'answer', label: 'The last answer', read: 'the last answer', kind: 'assistant_response' },
    { value: 'run', label: 'The last agent run', read: 'the last agent run', kind: 'agent_run' },
    { value: 'plan', label: 'A Plan', read: 'the Plan', kind: 'plan' },
    { value: 'files', label: 'File changes', read: 'the file changes', kind: 'files' },
    { value: 'artifacts', label: 'Artifacts', read: 'the artifacts', kind: 'artifacts' },
    { value: 'task', label: 'A task result', read: 'the task result', kind: 'task_result' }];
  function targetOf(v) { for (var i = 0; i < TARGETS.length; i++) if (TARGETS[i].value === v) return TARGETS[i]; return TARGETS[0]; }
  function targetChoiceOf(pack) {
    var k = pack && pack.targetKind;
    for (var i = 0; i < TARGETS.length; i++) if (TARGETS[i].kind === k || TARGETS[i].value === k) return TARGETS[i].value;
    return 'answer';
  }
  function threadOf(ctx) { var t = ctx && ctx.state && (ctx.state.threads || []).filter(function (x) { return x.id === ctx.state.selectedThread; })[0]; return t || null; }
  function threadChanges(ctx) { var tid = ctx && ctx.state && ctx.state.selectedThread; return list(D.changes).filter(function (c) { return c.threadId === tid; }); }
  function defaultTarget(ctx) { return threadChanges(ctx).length ? 'changes' : 'answer'; }
  function targetSmall(ctx, v) {
    if (v === 'changes' || v === 'files') {
      var ch = threadChanges(ctx), lines = 0;
      ch.forEach(function (c) { (c.hunks || []).forEach(function (h) { (h.lines || []).forEach(function (l) { if (l.kind === 'add' || l.kind === 'del' || l.kind === 'remove') lines++; }); }); });
      return ch.length ? plural2(ch.length, 'file') + (lines ? ' · ' + lines + ' changed lines' : '') : 'No file changes in this chat yet';
    }
    if (v === 'answer') {
      var t = threadOf(ctx), last = null;
      (t && t.messages || []).forEach(function (m) { if (m.role === 'assistant' && m.type === 'text') last = m; });
      if (!last) return 'No answer in this chat yet';
      var words = String(last.body || '').trim().split(/\s+/).filter(Boolean).length;
      return '1 reply · ' + words + ' words';
    }
    if (v === 'plan') { var P = window.PM56_PLANS, p = P && P.current ? P.current(ctx.state.selectedThread) : null; return p ? (p.title || 'This chat’s Plan') + (p.version ? ' · V' + p.version : '') : 'No Plan in this chat'; }
    if (v === 'run') return 'The assistant’s most recent turn';
    if (v === 'artifacts') { var n = list(D.artifacts).filter(function (a) { return a.threadId === ctx.state.selectedThread; }).length; return n ? plural2(n, 'artifact') + ' in this chat' : 'No artifacts in this chat yet'; }
    return 'The most recent finished task';
  }
  /* Advanced (G-29): the nine shared rows, then the kind rows. Each value writes the draft config. */
  function limitOptions(kind) {
    var T = { crew: [[30, 4], [45, 6], [90, 12]], brainstorm: [[60, 10], [90, 14], [120, 20]], review: [[15, 3], [30, 5], [60, 8]], chat_room: [[30, 2], [60, 4], [90, 6]] }[kind] || [[45, 6]];
    return T.map(function (p) { return { value: p[0] + '|' + p[1], label: p[0] + ' minutes · $' + p[1].toFixed(2), description: 'Stops after ' + p[0] + ' minutes or $' + p[1].toFixed(2) + ', whichever comes first.' }; });
  }
  function tokenOptions(kind) {
    var base = { crew: 400000, brainstorm: 900000, review: 350000, chat_room: 300000 }[kind] || 400000;
    return [base / 2, base, base * 2].map(function (n) { return { value: String(n), label: n.toLocaleString('en-US') + ' tokens', description: 'About ' + Math.round(n * 0.75).toLocaleString('en-US') + ' words of reading and writing in all.' }; });
  }
  var ADV_CHOICES = {
    visibility: { title: 'What helpers can see', options: [
      { value: 'request_files', label: 'Your request and the files it mentions', description: 'Not your whole chat history unless you choose it.' },
      { value: 'whole_chat', label: 'Your whole chat and its files', description: 'More context, and more tokens.' }] },
    tools: { title: 'Tools they can use', options: [
      { value: 'same_as_chat', label: 'The same tools as this chat', description: 'Files, terminal and search; no new connections.' },
      { value: 'read_only', label: 'Read-only tools', description: 'Can read your project and the web. Can’t change anything.' }] },
    stuck: { title: 'If a helper gets stuck', options: [
      { value: 'ask_me', label: 'Ask me what to do', description: 'Nobody is swapped or skipped without you saying so.' },
      { value: 'retry_once', label: 'Retry once, then ask me', description: 'Starts that part again with the same helper, once.' }] },
    retention: { title: 'Keep the full record for', options: [
      { value: '30', label: '30 days', description: 'Everything each helper said and did, readable in the panel.' },
      { value: '7', label: '7 days', description: 'Kept for a week, then removed.' },
      { value: '90', label: '90 days', description: 'Kept for three months, then removed.' }] },
    output: { title: 'How it finishes', options: [
      { value: 'summary', label: 'One summary in this chat', description: 'The assistant writes it; the parts stay in the panel.' },
      { value: 'summary_parts', label: 'A summary and every part’s result', description: 'Each part’s result is posted under the summary.' }] },
    notes: { title: 'Shared notes', options: [
      { value: 'shared', label: 'Helpers share one notes space', description: 'Each helper can also keep private scratch notes.' },
      { value: 'private', label: 'Private notes per helper', description: 'Helpers can’t read each other’s notes.' }] },
    modStyle: { title: 'Moderator style', options: [
      { value: 'guides', label: 'Keeps the talk on the question', description: 'Calls on helpers and steers away from side tracks.' },
      { value: 'light', label: 'Steps in only to sum up', description: 'Lets the helpers talk and sums up each round.' }] },
    mentions: { title: 'Mentions and replies', options: [
      { value: 'both', label: 'Helpers can reply to each other and to you', description: 'A helper can answer another helper by name.' },
      { value: 'you', label: 'Helpers answer only you', description: 'Nobody replies to another helper directly.' }] },
    stop: { title: 'When to stop', options: [
      { value: 'rounds_or_moderator_close', label: 'After the last round, or when you end it', description: 'The room never runs past its rounds.' },
      { value: 'you', label: 'Only when you end it', description: 'Rounds keep going until you end the discussion.' }] },
    summaryStyle: { title: 'Summary style', options: [
      { value: 'three', label: 'Agreed · Still debated · Open questions', description: 'Three short lists, each point with who holds it.' },
      { value: 'short', label: 'A short paragraph', description: 'One paragraph that sums up where the room landed.' }] },
    provisioning: { title: 'Installing research tools', options: [
      { value: 'ask', label: 'Ask me first', description: 'Nothing is installed without your OK.' },
      { value: 'never', label: 'Never install', description: 'Research uses only tools that are already here.' }] },
    voting: { title: 'Voting', options: [
      { value: 'evidence_weighted', label: 'Evidence decides; votes inform it. A rule always wins.', description: 'A well-supported option can win over a head count.' },
      { value: 'majority', label: 'Most votes wins', description: 'Canon decides by evidence, not by a simple majority.', disabled: true, reason: 'Not available: canon decides by evidence.' }] },
    dissent: { title: 'Keep dissent', options: [
      { value: 'verbatim', label: 'Keep it word for word', description: 'Where helpers disagree, you read both sides as written.' },
      { value: 'note', label: 'Keep a one-line note', description: 'Each disagreement is noted in one line.' }] },
    compare: { title: 'Who compares the notes', options: [
      { value: 'coordinator', label: 'The Coordinator (this chat’s assistant)', description: 'It merges duplicates and asks each reviewer to vote.' },
      { value: 'separate', label: 'A separate AI', description: 'A dedicated compare step. Adds one more AI, and its cost.' }] },
    format: { title: 'Report format', options: [
      { value: 'rich', label: 'Formatted', description: 'Plain text is one click away.' },
      { value: 'markdown', label: 'Plain text', description: 'Formatted is one click away.' }] },
    cite: { title: 'Evidence they must cite', options: [
      { value: 'file_line', label: 'File and line for every finding', description: 'A finding without proof can’t become a To-Do.' },
      { value: 'quote', label: 'A quoted passage for every finding', description: 'The passage is shown with each finding.' }] }
  };
  /* The config key and default value of each Advanced choice. */
  var ADV_KEYS = { visibility: ['visibility', 'request_files'], tools: ['tools', 'same_as_chat'], stuck: ['stuck', 'ask_me'], retention: ['retentionDays', '30'],
    output: ['outputStyle', 'summary'], notes: ['contextSharing', 'shared'], modStyle: ['moderatorStyle', 'guides'], mentions: ['mentions', 'both'], stop: ['stopCondition', 'rounds_or_moderator_close'],
    summaryStyle: ['summaryStyle', 'three'], provisioning: ['provisioning', 'ask'], voting: ['voting', 'evidence_weighted'], dissent: ['dissent', 'verbatim'], compare: ['compare', 'coordinator'],
    format: ['reportFormat', 'rich'], cite: ['cite', 'file_line'] };
  function advValue(d, name) {
    var k = ADV_KEYS[name]; if (!k) return '';
    var v = d.config[k[0]];
    if (name === 'tools' && v == null && (d.kind === 'chat_room' || d.kind === 'review')) return 'read_only';
    return v == null || v === '' ? k[1] : String(v);
  }
  function optionOf(options, v) { for (var i = 0; i < options.length; i++) if (String(options[i].value) === String(v)) return options[i]; return options[0]; }

  /* Every choice the sheet offers, with how it reads and writes the draft. `collab-pick-choice` looks the field
     up here; the menu title comes from the catalog (C.js used to read the trigger's label node). */
  function choiceSpec(d, field, ctx) {
    var sched = !!d.scheduleIntent;
    if (CONFIG_CHOICES[field]) {
      var c = CONFIG_CHOICES[field];
      var opts = c.options.map(function (o) {
        var x = Object.assign({}, o);
        if (sched && ((field === 'coordinator' && o.value === 'dedicated_synthesis_model') || (field === 'assignmentStrategy' && o.value === 'adaptive'))) { x.disabled = true; x.reason = SCHEDULED_NO; }
        return x;
      });
      return { title: c.title, current: d.config[field], options: opts, set: function (v) {
        var prev = d.config[field];
        d.config[field] = v;
        if (d.kind === 'review' && field === 'strategy') handleReviewStrategyTransition(d, prev, v);
        else normalizeReview(d);
      } };
    }
    if (field === 'recipe') {
      var list0 = recipeList(d).slice();
      var saved = savedDefault(d.kind);
      if (saved) list0.unshift({ value: 'default', label: 'Your default', description: 'The team and settings you saved for ' + KIND_LABEL[d.kind] + '.' });
      return { title: 'Start from a team', current: '', options: list0, set: function (v) { applyRecipe(d, v); } };
    }
    if (field === 'target') {
      return { title: 'What to review', current: d.reviewTargetChoice, options: TARGETS.map(function (t) { return { value: t.value, label: t.label, description: targetSmall(ctx, t.value) }; }), set: function (v) { d.reviewTargetChoice = v; } };
    }
    if (field === 'adv-limit') {
      var lo = limitOptions(d.kind);
      return { title: 'Time and cost limit', current: d.config.timeLimitMinutes + '|' + d.config.costLimitUsd, options: lo, set: function (v) { var p = String(v).split('|'); d.config.timeLimitMinutes = Number(p[0]); d.config.costLimitUsd = Number(p[1]); } };
    }
    if (field === 'adv-tokens') {
      return { title: 'Token limit', current: String(d.config.tokenLimit || ''), options: tokenOptions(d.kind), set: function (v) { d.config.tokenLimit = Number(v); } };
    }
    if (field.indexOf('adv-') === 0 && ADV_CHOICES[field.slice(4)]) {
      var name = field.slice(4), a = ADV_CHOICES[name], key = ADV_KEYS[name][0];
      return { title: a.title, current: advValue(d, name), options: a.options, set: function (v) { d.config[key] = v; } };
    }
    return null;
  }
  /* the recipes a sheet offers: the kind's own list (sheetParts roster.recipes as an array, remembered by rosterHtml)
     or COLLAB's catalog above */
  function recipeList(d) { return UI.kindRecipes && UI.kindRecipes.kind === d.kind ? UI.kindRecipes.list : (RECIPES[d.kind] || []); }
  function applyRecipe(d, v) {
    if (v === 'default') { applySaved(d, savedDefault(d.kind)); UI.seat = {}; return; }
    var r = recipeList(d).filter(function (x) { return x.value === v; })[0];
    if (!r) return;
    var base = chatModel(EXT.ctx && EXT.ctx());
    d.rows = r.rows.map(function (t, i) { return draftRow(t[0], t[2] || (d.kind === 'crew' ? base : DEFAULT_ROW_MODEL[i % DEFAULT_ROW_MODEL.length]), t[1]); });
    if (r.config) d.config = Object.assign({}, d.config, r.config);
    if (d.kind === 'review') { d._previousMultiRows = null; d._lastStrategy = d.config.strategy; normalizeReview(d); }
    if (r.wonderer != null) d.wonderer = !!r.wonderer;
    clampCrewParallel(d);
    UI.seat = {};
    UI.removed = null;
    d.lastFailure = null;
  }

  function handleReviewStrategyTransition(d, oldStrategy, newStrategy) {
    if (!d || d.kind !== 'review') return;
    if (oldStrategy === newStrategy) return;
    d.config.strategy = newStrategy;
    if (newStrategy === 'single_agent') {
      if (d.rows && d.rows.length >= 1) d._previousMultiRows = d.rows.slice();
      if (!d.rows || !d.rows.length) d.rows = [draftRow('Security', 'sonnet46', 'Reviewer')];
      else d.rows = d.rows.slice(0, 1);
      d.config.reviewerCount = 1;
      d.wonderer = false;
      d.grillMe = false;
      d._lastStrategy = 'single_agent';
    } else if (newStrategy === 'multi_pass') {
      if (d._previousMultiRows && d._previousMultiRows.length >= 1) {
        if (d.rows && d.rows.length > 0) d._previousMultiRows[0] = d.rows[0];
        d.rows = d._previousMultiRows.slice();
      } else if (d.rows && d.rows.length >= 1) {
        d.rows = d.rows.slice();
      } else {
        d.rows = defaultRows('review');
      }
      if (d.rows.length < 2) while (d.rows.length < 2) d.rows.push(suggestedRow(d));
      d.config.reviewerCount = d.rows.length;
      d._previousMultiRows = d.rows.slice();
      d._lastStrategy = 'multi_pass';
    }
  }

  function normalizeReview(d) {
    if (!d || d.kind !== 'review') return;
    if (!d.config) d.config = {};
    if (!d.config.strategy) d.config.strategy = 'multi_pass';
    if (d._lastStrategy && d._lastStrategy !== d.config.strategy) {
      handleReviewStrategyTransition(d, d._lastStrategy, d.config.strategy);
      return;
    }
    d._lastStrategy = d.config.strategy;
    if (d.config.strategy === 'single_agent') {
      if (!d.rows || !d.rows.length) d.rows = [draftRow('Security', 'sonnet46', 'Reviewer')];
      else if (d.rows.length > 1) { d._previousMultiRows = d.rows.slice(); d.rows = d.rows.slice(0, 1); }
      d.config.reviewerCount = 1;
      d.wonderer = false;
      d.grillMe = false;
    } else if (d.config.strategy === 'multi_pass') {
      if (!d.rows || d.rows.length === 0) d.rows = defaultRows('review');
      else if (d.rows.length > 8) d.rows = d.rows.slice(0, 8);
      d.config.reviewerCount = d.rows.length;
      d._previousMultiRows = d.rows.slice();
    }
  }
  /* the stepper and the strategy stay in sync (8.5: 1 = Single Agent) */
  function setReviewerCount(d, n) {
    n = clamp(n, 1, 8);
    if (n === 1) { if (d.config.strategy !== 'single_agent') handleReviewStrategyTransition(d, d.config.strategy || 'multi_pass', 'single_agent'); return; }
    if (d.config.strategy === 'single_agent') handleReviewStrategyTransition(d, 'single_agent', 'multi_pass');
    while (d.rows.length < n) d.rows.push(suggestedRow(d));
    while (d.rows.length > n) d.rows.pop();
    d.config.reviewerCount = d.rows.length;
    d._previousMultiRows = d.rows.slice();
  }
  function suggestion(d) {
    var have = {};
    d.rows.forEach(function (r) { have[String(r.role || '').toLowerCase()] = 1; });
    var list0 = SUGGEST[d.kind] || [];
    for (var i = 0; i < list0.length; i++) if (!have[list0[i][0].toLowerCase()]) return list0[i];
    return [NOUN[d.kind] === 'reviewer' ? 'Reviewer ' + (d.rows.length + 1) : 'Helper ' + (d.rows.length + 1), d.kind === 'review' ? 'Reviewer' : 'Implementer'];
  }
  function suggestedRow(d) {
    var s = suggestion(d);
    var base = d.kind === 'crew' ? chatModel(EXT.ctx && EXT.ctx()) : DEFAULT_ROW_MODEL[d.rows.length % DEFAULT_ROW_MODEL.length];
    return draftRow(s[0], base, s[1]);
  }

  /* ---- an offline model (owner answer E-03 B, 2026-09-27): nothing stands in automatically. The chosen model
     going offline is a blocking notice on its row ("… is offline right now. Pick another model to start.") with a
     Fix that opens that row's model picker, and Start stays disabled with the same sentence (offlineReason). The
     notice keeps the .collab-route-eff hook. Returns null for an available model. ---- */
  function offlineSentence(modelId, verb) { return modelName(modelId) + ' is offline right now. Pick another model to ' + (verb || 'start') + '.'; }
  function standInFor(d, modelId) {
    if (!UNAVAILABLE_DEMO[modelId]) return null;
    return { tone: 'failed', offline: true, strong: esc(modelName(modelId)) + ' is offline right now.', text: 'Pick another model to ' + (d && d.autoMode ? 'save' : 'start') + '.', fine: '' };
  }
  function routeHtml(si, rowId) {
    if (!si) return '';
    /* the row's route slot (grid placement of .pmx-route[data-tone]) carrying the refusal's warn glyph and Fix */
    return S_().pmxRefusal({ cls: 'pmx-route collab-route-eff collab-route-eff-failed', attrs: 'data-tone="failed"', code: 'model_offline', strong: si.strong, text: si.text,
      fix: rowId ? { action: 'collab-refusal-fix', attrs: 'data-row="' + esc(rowId) + '"', label: 'Fix' } : null });
  }
  /* The first offline choice in the draft (helpers, then specialists that are on, then the Moderator/synthesis
     model), as the disabled-Start sentence; '' when every chosen model is available. */
  function offlineReason(d) {
    if (!d) return '';
    var verb = d.autoMode ? 'save' : 'start';
    for (var i = 0; i < d.rows.length; i++) if (UNAVAILABLE_DEMO[d.rows[i].requestedModelId]) return offlineSentence(d.rows[i].requestedModelId, verb);
    var sr = d.specialistRoutes || {};
    if (d.wonderer && sr.wonderer && UNAVAILABLE_DEMO[sr.wonderer.modelId]) return offlineSentence(sr.wonderer.modelId, verb);
    if (d.grillMe && sr.grillMe && UNAVAILABLE_DEMO[sr.grillMe.modelId]) return offlineSentence(sr.grillMe.modelId, verb);
    var c = d.config || {};
    if (d.kind === 'chat_room' && UNAVAILABLE_DEMO[c.moderatorModelId]) return offlineSentence(c.moderatorModelId, verb);
    if (UNAVAILABLE_DEMO[c.synthesisModelId]) return offlineSentence(c.synthesisModelId, verb);
    return '';
  }
  var EFFORT_SAY = { Low: 'Thinks lightly', low: 'Thinks lightly', Medium: 'Thinks a fair amount', medium: 'Thinks a fair amount', High: 'Thinks hard', high: 'Thinks hard', Max: 'Thinks as hard as it can', max: 'Thinks as hard as it can' };
  function effortNote(row) {
    var a = row.requestedEffort ? (EFFORT_SAY[row.requestedEffort] || 'Thinks ' + String(row.requestedEffort).toLowerCase()) : '';
    var b = row.requestedFast ? 'fast replies' : '';
    return a && b ? a + ' · ' + b : (a || (b ? 'Fast replies' : ''));
  }

  /* ---- one roster row (A6) with the MUST-KEEP hooks: .collab-participant-editor-row keyed
     collab-draftrow-{rowId}, exactly one collab-pick-model and one collab-pick-persona, the job input
     data-collab-input="role", Copy / Remove, and the stand-in sentence as .collab-route-eff ---- */
  function draftRowHtml(ctx, d, row, idx, parts) {
    var S = S_(), PK = window.PM56_PICKERS;
    var attrs = 'data-row="' + esc(row.rowId) + '"';
    var extra = parts && typeof parts.rowExtras === 'function' ? (parts.rowExtras(row, idx) || {}) : {};
    var failed = d.lastFailure && d.lastFailure.rowId === row.rowId;
    var noun = NOUN[d.kind];
    var note = extra.note != null ? extra.note : (sameModelNote(d, row, idx) || effortNote(row));
    var si = standInFor(d, row.requestedModelId);
    if (si && !failed) { failed = true; }
    return S.pmxRosterRow({
      key: 'collab-draftrow-' + row.rowId, cls: 'collab-participant-editor-row', attrs: attrs,
      state: failed ? 'error' : '', failure: failed ? (d.lastFailure && d.lastFailure.rowId === row.rowId ? d.lastFailure.error : 'model_offline') : '',
      mark: S.pmxMark({ role: extra.markRole || markOf(row.persona), seat: seatOf(d, row), size: 24, state: failed ? 'needs' : 'idle', standin: !!(si && si.tone !== 'failed') }),
      job: { attrs: 'data-collab-input="role" ' + attrs + ' aria-label="' + (d.kind === 'review' ? 'Looks for' : 'Job') + '"', value: row.role, placeholder: d.kind === 'review' ? 'e.g. Security' : 'e.g. Tester' },
      model: PK.modelButton('collab-pick-model', 'collab-model-' + row.rowId, row.requestedModelId, attrs),
      persona: PK.personaButton('collab-pick-persona', 'collab-persona-' + row.rowId, row.persona, attrs),
      actions: [
        { action: 'collab-modal-duplicate-participant', attrs: attrs, label: noun === 'reviewer' ? 'Copy reviewer' : 'Copy helper', glyph: 'copy' },
        { action: 'collab-modal-remove-participant', attrs: attrs, label: noun === 'reviewer' ? 'Remove reviewer' : 'Remove helper', glyph: 'trash' }],
      route: extra.route != null ? extra.route : routeHtml(si, row.rowId),
      note: si ? '' : note
    });
  }
  function sameModelNote(d, row, idx) {
    if (d.kind !== 'review' || idx === 0) return '';
    for (var i = 0; i < idx; i++) if (d.rows[i].requestedModelId === row.requestedModelId) return 'Same model as ' + (d.rows[i].role || 'reviewer ' + (i + 1)) + ', in its own fresh session, so it can’t see ' + (d.rows[i].role || 'its') + '’ notes.';
    return '';
  }

  /* The roster (A5): column heads with their one-line helpers (the hover card carries the rest), the rows in
     .collab-participant-editor, a pinned row (the Chat Room's Moderator) above them outside that list, and the
     foot: Add a helper, the suggestion or the Bring back line, and Start from a team. */
  var COL_HOVER = {
    Job: 'What this helper focuses on. Everyone also reads the job above.',
    'Looks for': 'What this reviewer checks. Each focus goes into a reviewer’s job.',
    'AI model': 'Which AI does this job, and which of your accounts pays for it (Work, Personal…). Stronger models think better but are slower and cost more.',
    Persona: 'How this helper works: its habits and instructions. Implementer builds, Reviewer checks, Architect weighs trade-offs.'
  };
  function rosterHtml(ctx, d, parts) {
    var S = S_();
    var R = parts.roster || {};
    /* five or more rows (a common case, 6.3): the column heads' one-line helpers go (their hover cards keep the words),
       so the plate keeps its 72 px strip instead of falling to the caption */
    var many = d.rows.length >= 5;
    var cols = (parts.rosterCols || []).map(function (c) {
      var hover = c.hover || COL_HOVER[c.label];
      return { label: hover ? '<span data-hover-key="collab-col-' + esc(c.label) + '" data-hover-tip="' + esc(hover) + '">' + esc(c.label) + '</span>' : esc(c.label), helper: many ? '' : esc(c.helper || '') };
    });
    var rows = d.rows.map(function (r, i) { return draftRowHtml(ctx, d, r, i, parts); }).join('');
    var n = d.rows.length, max = R.max || KIND_PARTICIPANT_LIMIT[d.kind][1];
    var removed = UI.removed && UI.removed.draft === d ? UI.removed : null;
    var addLabel = R.addLabel || (NOUN[d.kind] === 'reviewer' ? 'Add a reviewer' : 'Add a helper');
    var foot = S.pmxAddRow({ action: 'collab-modal-add-participant', label: addLabel, disabled: n >= max });
    if (removed) foot += '<span class="pmx-fine pmx-collab-removed" data-k="removed:' + esc(removed.row.rowId) + '">Removed ' + esc(removed.row.role || NOUN[d.kind]) + '</span><button type="button" class="text-button pmx-collab-bringback" data-action="collab-modal-undo-remove">Bring back</button>';
    else if (n >= max) foot += '<span class="pmx-fine">' + esc(KIND_LABEL[d.kind] + ' holds up to ' + max + ' ' + NOUN[d.kind] + 's.') + '</span>';
    else if (R.suggest !== false) foot += '<span class="pmx-fine">Suggested next: ' + esc(suggestion(d)[0]) + '</span>';
    foot += '<span class="pmx-grow"></span>';
    UI.kindRecipes = Array.isArray(R.recipes) && R.recipes.length ? { kind: d.kind, list: R.recipes } : null;
    if (R.recipes) foot += S.pickerButton({ action: 'collab-pick-choice', anchor: 'collab-choice-recipe', strong: 'Start from a team', extra: 'data-field="recipe" data-menu-title="Start from a team"' });
    var html = S.pmxRoster({ key: 'collab-roster', cols: cols, rowsHtml: rows, rowsCls: 'collab-participant-editor', rowsAttrs: 'data-count="' + n + '"', foot: foot, affects: parts.whoAffects || 'team' });
    if (R.pinned) html = html.replace('<div class="pmx-roster-rows', '<div class="pmx-collab-pinned">' + R.pinned + '</div><div class="pmx-roster-rows');
    return html;
  }

  /* ---- the preview's first frame (A16): the card's top frame, drawn by the same builders the card uses ---- */
  var KIND_STOPS = {
    crew: ['Split the job', 'Do the parts', 'Put it together'],
    chat_room: null,
    brainstorm: ['Understand the ask', 'Draft ideas alone', 'Line up the options', 'Debate', 'Check the facts', 'Vote', 'Write the plan'],
    review: ['Snapshot', 'Reading on their own', 'Comparing notes', 'Writing the report']
  };
  /* IMPACT A1-20: COLLAB owns the waiting sentence; each kind supplies only its noun phrase. */
  var WAIT_NOUN = { crew: 'the Coordinator hasn’t split the job', chat_room: 'the Moderator hasn’t opened the first round', review: 'the snapshot hasn’t been taken', brainstorm: 'the team hasn’t started drafting' };
  function waitingReason(run) {
    if (run && run.blockedReason) return String(run.blockedReason);
    var kind = run && run.kind, mod = kind ? kindModule(kind) : null;
    var noun = mod && typeof mod.waitingNoun === 'string' && mod.waitingNoun ? mod.waitingNoun : WAIT_NOUN[kind];
    return 'Nothing runs by itself in this preview, so ' + (noun || 'nothing has started') + ' yet.';
  }
  function draftStops(d) {
    if (d.kind === 'chat_room') { var n = clamp(d.config.maxRounds || 5, 1, 20); var out = []; for (var i = 1; i <= Math.min(n, 12); i++) out.push('Round ' + i); return out; }
    if (d.kind === 'review' && d.config.strategy === 'single_agent') return ['Snapshot', 'Reading on their own', 'Writing the report'];
    return KIND_STOPS[d.kind] || [];
  }
  function firstFrameOf(d) {
    var stops = draftStops(d);
    var recorded = isRecordedDraft(d);
    var first = stops[0] || '';
    return recorded
      ? { density: 'starting', status: 'starting', word: 'Starting', reason: d.kind === 'crew' ? 'The Coordinator is reading the job.' : d.kind === 'chat_room' ? 'The Moderator is opening the first round.' : d.kind === 'review' ? 'Taking the snapshot.' : 'The team is reading the question.', stops: stops, nowText: '<b>' + esc(first) + '</b> · starting' }
      : { density: 'waiting', status: 'waiting', word: 'Waiting to start', reason: waitingReason({ kind: d.kind }), stops: stops, nowText: '<b>' + esc(first) + '</b> · not started' };
  }
  function draftCluster(d, state) {
    var S = S_(), out = [];
    if (d.kind !== 'review') out.push(S.pmxMark({ role: d.kind === 'chat_room' ? 'moderator' : 'lead', size: 18, state: state }));
    d.rows.forEach(function (r) { out.push(S.pmxMark({ role: markOf(r.persona), seat: seatOf(d, r), size: 18, state: state, standin: !!(standInFor(d, r.requestedModelId) || {}).strong && (standInFor(d, r.requestedModelId) || {}).tone !== 'failed' })); });
    return out;
  }
  function previewCardHtml(d, ff) {
    var S = S_();
    var head = S.pmxRunHead({ kind: d.kind, kindWord: KIND_LABEL[d.kind], title: '<span data-collab-mirror="title">' + esc(cardTitleOf(d)) + '</span>', cluster: draftCluster(d, ff.density === 'starting' ? 'idle' : 'queued'), clock: esc(S.pmxTime ? S.pmxTime.clock(null) : 'not started') });
    var body = S.pmxSentence({ status: ff.status, word: esc(ff.word), reason: esc(ff.reason) }) +
      S.pmxTrack({ stops: ff.stops.map(function (l, i) { return { key: 'pv-stop:' + i, label: esc(l), state: 'next' }; }), nowText: ff.nowText });
    /* its whole top frame's height rides on the frame itself, so the M3 flight clone keeps it too (heroHtml, fitPreview) */
    return S.pmxRun({ key: 'collab-card-new', kind: d.kind, density: ff.density, preview: true, headHtml: head, bodyHtml: body })
      .replace(/^<article class="pmx-run"/, '<article class="pmx-run pmx-collab-pvrun" style="--collab-pv-h:' + Math.max(120, UI.previewH || 120) + 'px"');
  }
  /* the preview (R-02; owner tweak 2026-10-07: drawn at about .56 it was too small to make out) lays the card's top
     frame out at PV_LAYOUT_W, the narrowest M-tier card, and scales it to fit the tray's own box (module-shell.css: the
     tray fills the hero's side column), PV_PAD_X beside the frame and at least PV_PAD_Y above and below, never past
     1:1. heroHtml draws it at the scale for the last measured tray (resetPreview's guess when the sheet opens) and
     fitPreview measures the tray and the frame after the overlay render and redraws once, before the first paint, when
     either differs. The Start flight lays its clone out at the real card's width (measureCardWidth). */
  var PV_LAYOUT_W = 360, PV_PAD_X = 10, PV_PAD_Y = 5;
  function previewScale(trayW, trayH, frameH) {
    var s = Math.min((trayW - 2 * PV_PAD_X) / PV_LAYOUT_W, (trayH - 2 * PV_PAD_Y) / Math.max(120, frameH || 120), 1);
    return Math.max(0.3, Math.round(s * 1000) / 1000);
  }
  /* when a sheet opens: the frame's usual height at PV_LAYOUT_W (125 px: head, a two-line sentence, the track) and the
     tray box module-shell.css gives this window (340 x 134 beside the three-line field under the caption; 308 wide
     under 1168 px; 308 x 110 beside the two-line field in a window 820 px tall or less) */
  function resetPreview() {
    var tall = window.innerHeight > 820;
    UI.previewH = 125;
    UI.trayW = tall && window.innerWidth >= 1168 ? 340 : 308;
    UI.trayH = tall ? 134 : 110;
  }
  function measureCardWidth() {
    var el = document.querySelector('#pmRoot .transcript-inner');
    var w = 0;
    if (el) {
      var cs = getComputedStyle(el);
      w = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    }
    if (!(w > 200)) w = 417;
    /* the Start flight's layout width: the card's own, at the M tier at least (the landing re-lays the clone out at
       the card's exact width when it differs, M3) */
    return Math.max(360, Math.min(720, w));
  }

  /* =====================================================================
     14a. GENERIC SHEET PARTS (COLLAB's fallback for every kind; a kind's own
     PM56_<KIND>.sheetParts replaces any field it returns). Plates are built
     only from PM56_SHELL.pmxPlateParts, so no kind CSS is needed for them.
     ===================================================================== */
  function capacityOf(d) { return d.crewInput && d.crewInput.capacity && d.crewInput.capacity.maxConcurrent ? d.crewInput.capacity.maxConcurrent : PLAN_CAPACITY; }

  /* ---- the cast plates (8.1, 8.3, 8.4, 8.5; 2026-10-07, Jared: "messy, and a little hard to follow"). Each kind
     only describes its cast; PM56_SHELL.pmxCastFit / pmxCastPlate draw every mode in one grammar (module-shell.js:
     the bar with what goes in, who runs it and the accent edge to You; the cast hanging under it on orthogonal
     strings, one baseline, always named; the specialists' wing after a dotted rule; state on the seats only).
     The sheets and the run views draw from the same descriptions: live = {states: {rowId: state}, lead: state,
     done: bool, after: {rowId: [rowId...]}, stop: chapter index, rounds} gives the seats their run state instead
     of the sheet's plan (a queued seat in a run view is one that really waits, never the sheet's guess). ---- */
  var CAST_KEY = { crew: 'crew', review: 'rev', brainstorm: 'bs', chat_room: 'room' };
  function castWing(d, kind, live) {
    var k = CAST_KEY[kind] || kind, st = (live && live.states) || {}, out = [];
    if (d.wonderer) out.push({ key: 'pmx-p-seat:' + k + ':wonderer', role: 'wonderer', seat: SPECIALIST_SEAT.wonderer, label: 'Wonderer', sub: 'doesn’t vote', state: st.wonderer || (kind === 'brainstorm' && live ? 'abstained' : 'idle'), part: 'wonderer specialists' });
    if (d.grillMe) out.push({ key: 'pmx-p-seat:' + k + ':grill', role: 'grill', seat: SPECIALIST_SEAT.grillMe, label: 'Grill Me', sub: 'asks you first', state: st.grill || 'idle', part: 'grill specialists' + (kind === 'brainstorm' ? ' questions' : '') });
    return out;
  }
  function castSeats(d, kind, live, o) {
    var k = CAST_KEY[kind] || kind, st = live && live.states;
    return d.rows.map(function (r, i) {
      var si = standInFor(d, r.requestedModelId), waits = st ? st[r.rowId] === 'queued' : !!(o.waits && o.waits(r, i));
      var sub = si ? modelShort(r.requestedModelId) + ' · offline' : (r.modelName || modelShort(r.requestedModelId));
      return { key: 'pmx-p-seat:' + k + ':' + r.rowId, rowId: r.rowId, role: markOf(r.persona), seat: r.seat || seatOf(d, r), state: st ? (st[r.rowId] || 'idle') : waits ? 'queued' : 'idle',
        standin: !!(r.standin || (si && si.tone !== 'failed')), label: r.role || o.noun, sub: sub, part: o.part + (waits ? ' parallel' : ''), waits: waits && o.dash !== false };
    });
  }
  /* "starts after" (a Crew run view): the seat hangs a short arrow from the helper it waits for */
  function castAfter(seats, live) {
    var dep = live && live.after;
    if (!dep) return seats;
    var at = {}; seats.forEach(function (c, i) { at[c.rowId] = i; });
    seats.forEach(function (c, j) {
      var ds = (dep[c.rowId] || []).map(function (id) { return at[id]; }).filter(function (i) { return i != null && i < j; });
      if (ds.length) c.after = { from: Math.max.apply(null, ds), label: ds.length > 1 ? (ds.length === 2 ? 'after both' : 'after ' + ds.length) : 'after' };
    });
    return seats;
  }
  function crewCast(d, live) {
    var n = d.rows.length, eff = Math.min(clamp(d.config.parallelism || 1, 1, 8), capacityOf(d), n);
    var coord = optionOf(CONFIG_CHOICES.coordinator.options, d.config.coordinator), waiting = n - eff;
    var seats = castAfter(castSeats(d, 'crew', live, { noun: 'New helper', part: 'team', waits: function (r, i) { return i >= eff; } }), live);
    var caption = (eff >= n ? (n === 1 ? 'The Coordinator and 1 helper.' : 'All ' + n + ' work at once.') : eff + ' work at once; the other ' + waiting + (waiting === 1 ? ' waits its turn.' : ' wait their turn.')) + ' You get one checked result.';
    return { key: 'pmx-plate-crew', kind: 'crew', fitKey: 'pmx-plate-fit:crew', affects: 'team', busPart: 'assign',
      input: { label: 'The job', text: jobWords(d), mirror: 'job', part: 'job' },
      hub: { key: 'pmx-p-seat:crew:lead', role: 'coordinator', label: 'Coordinator', sub: (live && live.coordinator) || coord.sub || coord.label, state: (live && live.lead) || 'idle', part: 'lead' },
      seats: seats, wing: castWing(d, 'crew', live),
      you: { label: 'You', sub: live && live.done ? 'got one checked result' : 'one checked result', part: 'you' },
      waits: { label: 'waits its turn', many: 'wait their turn', part: 'parallel' },
      caption: '<span data-pmx-part="parallel job">' + esc(caption) + '</span>' };
  }
  function crewPlateFit(d) { return S_().pmxCastFit(crewCast(d)); }

  /* Review (8.5): the locked snapshot goes in; at the junction it goes down to each reviewer, who read alone behind
     screens; their notes come back up, are compared, and You get one report. Single Agent: one reviewer, no screens,
     nothing to compare. */
  function reviewCast(d, live) {
    var n = d.rows.length, single = n === 1 || d.config.strategy === 'single_agent', tgt = targetOf(d.reviewTargetChoice);
    var caption = single ? 'One fresh reviewer, nothing to compare against. You get one report.' : n + ' reviewers read on their own, then compare notes. You get one report.';
    return { key: 'pmx-plate-review', kind: 'review', fitKey: 'pmx-plate-fit:review', affects: 'count', busPart: 'target', junctionPart: 'target',
      input: { label: 'Locked at Start', short: tgt.label, sub: esc((live && live.target) || tgt.label), part: 'target job' },
      out: single ? null : { label: 'compare notes', part: 'blind' },
      seats: castSeats(d, 'review', live, { noun: 'Reviewer', part: 'count focus' }), screens: !single, wing: [],
      you: { label: 'You', sub: live && live.done ? 'got one report' : 'one report', part: 'you' },
      note: single ? null : { text: 'Screens: each reviewer reads alone.', part: 'blind' },
      caption: '<span data-pmx-part="blind job">' + esc(caption) + '</span>' };
  }
  function reviewPlateFit(d) { return S_().pmxCastFit(reviewCast(d)); }

  /* BrainStorm (8.4): the bar is the seven chapters, ending in the accent edge to You (one plan); the team hangs from
     a bar of its own under the chapter names, behind screens (each drafts alone). A must-have rule lights the Vote
     chapter ('rules': a rule beats the votes). Its slot also carries the lean mode (the compact at .86, about 99 tall)
     between compact and strip, so a slot of 99-117 (the recorded draft's beside its guide strip, where first-time users
     meet it, or a short window) keeps the chapters and the strings instead of dropping to the strip. */
  var BS_CHAPTERS = [['Understand', 'questions'], ['Draft alone', 'blind'], ['Line up', 'team'], ['Debate', 'rounds'], ['Check facts', 'research'], ['Vote', 'team'], ['Write the plan', 'you']];
  function brainstormCast(d, live) {
    var n = d.rows.length, rules = String(d.mustHaves || '').trim() ? ' rules' : '', stop = live && live.stop != null ? live.stop : -1;
    var caption = n + ' helpers draft alone, debate, check the facts and vote. You get one plan.';
    /* compact and strip at 576: the seven chapter names and four long helper names need the width, and BrainStorm's slot
       at 1024 x 768 holds the caption only */
    return { key: 'pmx-plate-bs', kind: 'brainstorm', fitKey: 'pmx-plate-fit:bs', affects: 'team', busPart: 'team', modes: ['full', 'compact', 'lean', 'strip'], w: { compact: 576, lean: 576, strip: 576 },
      chapters: BS_CHAPTERS.map(function (c, i) { return { label: c[0], state: stop < 0 ? 'next' : i < stop ? 'done' : i === stop ? 'now' : 'next', part: c[1] + (i === 0 ? ' job' : '') + (i === 5 ? rules : '') }; }),
      seats: castSeats(d, 'brainstorm', live, { noun: 'Helper', part: 'team blind', dash: false }), screens: n > 1,
      wing: castWing(d, 'brainstorm', live),
      you: { label: 'You', sub: 'one plan', part: 'you' },
      note: n > 1 ? { text: 'Screens: each drafts alone; nobody sees the others’ ideas.', part: 'blind' } : null,
      caption: '<span data-pmx-part="team job">' + esc(caption) + '</span>' };
  }
  function brainstormPlateFit(d) { return S_().pmxCastFit(brainstormCast(d)); }

  /* Chat Room (8.3): the topic goes to the Moderator, who calls on the helpers hanging under it; You pick what to keep.
     The turn policy is one note line, never arcs; the strip names sit beside the marks (40 tall: the Chat Room's
     slot is the shortest, because the roster pins the Moderator's row). Below the strip, the lean line (32 tall, every
     name whole: module-shell CAST.leanLine) takes the 32-34 px slot of a 1280 x 800 window before the caption does. */
  /* the topic's words are the job's (liveWords mirrors both papers with jobWords while you type) */
  function roomTopic(d) { return jobWords(d); }
  function roomCast(d, live) {
    var n = d.rows.length, cfg = d.config || {}, pol = optionOf(CONFIG_CHOICES.turnPolicy.options, cfg.turnPolicy || 'moderated');
    var R = pol.value === 'ask_everyone_once' ? 1 : clamp(cfg.maxRounds || 5, 1, 20);
    var note = pol.label + ' · ' + (live && live.rounds ? live.rounds : (R === 1 ? 'one round' : 'up to ' + R + ' rounds'));
    var caption = n + ' helpers and the Moderator talk it through. You pick what, if anything, to keep.';
    return { key: 'pmx-plate-room', kind: 'chat_room', fitKey: 'pmx-plate-fit:room', affects: 'team', busPart: 'policy', strip: 'line', modes: ['full', 'compact', 'strip', 'lean'],
      input: { label: 'The topic', text: roomTopic(d), mirror: 'job', part: 'job' },
      hub: { key: 'pmx-p-seat:room:mod', role: 'moderator', label: 'Moderator', sub: cfg.moderatorPersona || 'Product Manager', state: (live && live.lead) || 'idle', part: 'moderator' },
      seats: castSeats(d, 'chat_room', live, { noun: 'Helper', part: 'team', dash: false }), wing: castWing(d, 'chat_room', live),
      you: { label: 'You', sub: 'pick what to keep', part: 'you' },
      note: { text: note, part: 'policy rounds' },
      caption: '<span data-pmx-part="team job">' + esc(caption) + '</span>' };
  }
  function roomPlateFit(d) { return S_().pmxCastFit(roomCast(d)); }
  var CAST_SPEC = { crew: crewCast, review: reviewCast, brainstorm: brainstormCast, chat_room: roomCast };
  /* a run view's plate: the richest mode that fits 640 wide, with the run's live states (collab-view, crew-view,
     brainstorm-view, room-view, review-view) */
  function castView(kind, d, live, o) {
    var fn = CAST_SPEC[kind], S = S_();
    if (!fn || !d || !d.rows || !d.rows.length) return '';
    var sp = fn(d, live || {});
    o = o || {};
    sp.key = o.key || ('cv-plate-' + kind);
    sp.w = { full: o.w || 640, compact: o.w || 640, strip: o.w || 640, line: o.w || 640 };
    sp.cls = o.cls || '';
    var modes = o.modes || ['full', 'compact', 'strip'];
    /* every key in a view's plate is its own (cv:), so a sheet open over the view never shares one */
    for (var i = 0; i < modes.length; i++) { var h = S.pmxCastPlate(sp, modes[i]); if (h) return h.replace(/ data-k="(?!cv:)/g, ' data-k="cv:'); }
    return '';
  }
  /* castRun(run, {key, w, live}) - a run view's plate from the run itself: its core helpers on the seats in their run
     order and hue, each in its LIVE state (working, waits, needs you, done, failed; a run that has not started shows
     everyone idle, never "waits its turn"), its specialists in the wing, the Coordinator done when the run is. o.live
     adds or overrides (crew-view: the plan's "starts after"; brainstorm-view: the chapter it is on). */
  var CAST_SPECIAL = { wonderer: 'wonderer', grill_me: 'grill', grillme: 'grill', grill: 'grill' };
  var CAST_STATE = { working: 'working', done: 'done', completed: 'done', blocked: 'needs', failed: 'failed', disabled: 'failed', waiting: 'queued', pending: 'queued' };
  function castRun(run, o) {
    o = o || {};
    if (!run || !CAST_SPEC[run.kind]) return '';
    var ps = run.participants || [], sk = function (p) { return CAST_SPECIAL[String(p.additiveRoleKind || 'none').toLowerCase()] || ''; };
    /* a run whose Coordinator is one of its own participants (run.coordinator names its id: "extract the report
       renderer") draws that participant on the bar, in its own state, never a second time among the helpers */
    var hubP = null;
    if (typeof run.coordinator === 'string') ps.forEach(function (p) { if (p.id === run.coordinator) hubP = p; });
    var core = ps.filter(function (p) { return !sk(p) && p !== hubP; }), specs = ps.filter(function (p) { return !!sk(p); });
    if (!core.length) return '';
    var st = presentState(run), notYet = st === 'waiting', paused = st === 'paused', short = function (n) { return String(n || '').split(' · ')[0].replace(/^Claude /, ''); };
    var states = {};
    core.forEach(function (p) {
      var s = notYet ? 'idle' : (CAST_STATE[p.status] || 'idle');
      if (!notYet && /^(failed|timed_out|unavailable)$/.test(String(p.outcome || ''))) s = 'failed';
      if (paused && s === 'working') s = 'idle';
      states[p.id] = s;
    });
    specs.forEach(function (p) { states[sk(p)] = notYet ? 'idle' : (CAST_STATE[p.status] || (run.kind === 'brainstorm' && sk(p) === 'wonderer' ? 'abstained' : 'idle')); });
    var rows = core.map(function (p, i) {
      var req = p.requestedModelName || '', eff = p.effectiveModelName || '';
      return { rowId: p.id, role: p.role || p.name || 'Helper', requestedModelId: p.requestedModelId, modelName: short(eff || req || p.requestedModelId), persona: p.effectivePersona || p.requestedPersona || 'Implementer', seat: i + 1,
        standin: !!(req && eff && req !== eff && p.effectiveModelId) };
    });
    var cfg = Object.assign({}, run.config || {}), pack = run.review && run.review.targetPack, tgt = null;
    if (run.kind === 'chat_room') {
      cfg.turnPolicy = (run.chatRoom && run.chatRoom.turnPolicy) || cfg.turnPolicy;
      cfg.moderatorPersona = cfg.moderatorPersona || ((run.coordinator && run.coordinator.label || '').match(/\(([^)]+?) persona\)/) || [])[1] || 'Product Manager';
    }
    if (pack) TARGETS.forEach(function (t) { if (!tgt && t.kind === pack.targetKind) tgt = t; });
    var d = { kind: run.kind, rows: rows, config: cfg, wonderer: specs.some(function (p) { return sk(p) === 'wonderer'; }), grillMe: specs.some(function (p) { return sk(p) === 'grill'; }),
      purpose: run.purpose || run.title || '', name: run.title || '', mustHaves: '', reviewTargetChoice: tgt ? tgt.value : 'changes' };
    var cr = run.chatRoom, R = cfg.turnPolicy === 'ask_everyone_once' ? 1 : (+cfg.maxRounds || 0);
    var hubState = function () {
      var s = notYet ? 'idle' : (CAST_STATE[hubP.status] || 'idle');
      if (!notYet && /^(failed|timed_out|unavailable)$/.test(String(hubP.outcome || ''))) s = 'failed';
      return paused && s === 'working' ? 'idle' : s;
    };
    var live = Object.assign({ states: states, lead: hubP ? hubState() : run.status === 'completed' ? 'done' : 'idle', done: run.status === 'completed',
      coordinator: hubP ? short(hubP.effectiveModelName || hubP.requestedModelName || hubP.requestedModelId) : run.coordinator && run.coordinator.kind === 'parent_assistant' ? 'This chat’s assistant' : (run.coordinator && run.coordinator.label) || '',
      rounds: run.kind === 'chat_room' && cr && cr.roundsSoFar && R ? 'round ' + cr.roundsSoFar + ' of ' + R : '' }, o.live || {});
    if (o.live && o.live.states) live.states = Object.assign(states, o.live.states);
    return castView(run.kind, d, live, { key: o.key || ('cv-plate:' + run.id), w: o.w });
  }

  /* ---- a preserved choice trigger for a catalog field ---- */
  function choiceTrigger(d, field, small, ctx) {
    var S = S_(), spec = choiceSpec(d, field, ctx);
    var cur = optionOf(spec.options, spec.current);
    return S.pickerButton({ action: 'collab-pick-choice', anchor: 'collab-choice-' + field, strong: esc(cur.label), small: small === false ? '' : esc(small != null ? small : (cur.small || '')), extra: 'data-field="' + esc(field) + '" data-menu-title="' + esc(spec.title) + '"' });
  }
  function advTrigger(d, field, ctx) {
    var S = S_(), spec = choiceSpec(d, field, ctx);
    var cur = optionOf(spec.options, spec.current);
    return S.pickerButton({ action: 'collab-pick-choice', anchor: 'collab-choice-' + field, strong: esc(cur.label), extra: 'data-field="' + esc(field) + '" data-menu-title="' + esc(spec.title) + '"' });
  }
  function advSet(d, key, label, sentence, helper, control) { return S_().pmxSetting({ key: 'adv-' + key, label: esc(label), sentence: sentence, helper: helper ? esc(helper) : '', control: control || '' }); }
  function sharedAdvancedRows(d, ctx) {
    var cfg = d.config, noun = NOUN[d.kind];
    var rows = [
      advSet(d, 'limit', 'Time and cost limit', 'This ' + esc(KIND_LABEL[d.kind]) + ' stops after <b>' + (cfg.timeLimitMinutes || 45) + ' minutes</b> or <b>$' + Number(cfg.costLimitUsd || 6).toFixed(2) + '</b>, whichever comes first.', 'Its own limit, used instead of your general run limit. Everything done so far is kept.', advTrigger(d, 'adv-limit', ctx)),
      advSet(d, 'tokens', 'Token limit', 'About <b>' + Number(cfg.tokenLimit || 400000).toLocaleString('en-US') + '</b> tokens at most.', 'Tokens measure AI use, roughly ¾ of a word each.', advTrigger(d, 'adv-tokens', ctx)),
      advSet(d, 'visibility', 'What ' + noun + 's can see', esc(optionOf(ADV_CHOICES.visibility.options, advValue(d, 'visibility')).label) + '.', optionOf(ADV_CHOICES.visibility.options, advValue(d, 'visibility')).description, advTrigger(d, 'adv-visibility', ctx)),
      advSet(d, 'tools', 'Tools they can use', esc(optionOf(ADV_CHOICES.tools.options, advValue(d, 'tools')).label) + '.', optionOf(ADV_CHOICES.tools.options, advValue(d, 'tools')).description, advTrigger(d, 'adv-tools', ctx)),
      advSet(d, 'stuck', 'If a ' + noun + ' gets stuck', esc(optionOf(ADV_CHOICES.stuck.options, advValue(d, 'stuck')).label) + '.', optionOf(ADV_CHOICES.stuck.options, advValue(d, 'stuck')).description, advTrigger(d, 'adv-stuck', ctx)),
      advSet(d, 'offline', 'If a model is offline', 'Start waits until you pick another model.', 'Nothing stands in by itself: the helper’s line says which model is offline.', ''),
      advSet(d, 'retention', 'Keep the full record for', '<b>' + esc(optionOf(ADV_CHOICES.retention.options, advValue(d, 'retention')).label) + '</b>.', optionOf(ADV_CHOICES.retention.options, advValue(d, 'retention')).description, advTrigger(d, 'adv-retention', ctx)),
      advSet(d, 'output', 'How it finishes', esc(optionOf(ADV_CHOICES.output.options, advValue(d, 'output')).label) + '.', optionOf(ADV_CHOICES.output.options, advValue(d, 'output')).description, advTrigger(d, 'adv-output', ctx)),
      advSet(d, 'permissions', 'Permissions', 'Helpers can do what this chat can: ' + esc((ctx && ctx.state && ctx.state.mode) || 'Agent') + ', asking before commands.', 'This isn’t a setting.', '')
    ];
    return rows;
  }
  function kindAdvancedRows(d, ctx) {
    function pickRow(name, label) { var o = optionOf(ADV_CHOICES[name].options, advValue(d, name)); return advSet(d, name, label, esc(o.label) + (/[.!?]$/.test(o.label) ? '' : '.'), o.description, advTrigger(d, 'adv-' + name, ctx)); }
    if (d.kind === 'crew') return [pickRow('notes', 'Shared notes')];
    if (d.kind === 'chat_room') return [pickRow('modStyle', 'Moderator style'), pickRow('mentions', 'Mentions and replies'), pickRow('stop', 'When to stop'), pickRow('summaryStyle', 'Summary style')];
    if (d.kind === 'brainstorm') {
      var PK = window.PM56_PICKERS;
      return [advSet(d, 'synthesis', 'Who writes the plan', '<b>' + esc(modelName(d.config.synthesisModelId)) + '</b> writes the plan from the winning option.', 'Disagreements stay in the plan, word for word.', PK.modelButton('collab-pick-model', 'collab-model-synthesis', d.config.synthesisModelId, 'data-row="synthesis"')),
        pickRow('provisioning', 'Installing research tools'), pickRow('voting', 'Voting'),
        advSet(d, 'independent', 'Independent drafts first', 'Always on: every helper drafts alone before seeing the others.', 'This isn’t a setting.', ''),
        pickRow('dissent', 'Keep dissent')];
    }
    if (d.kind === 'review') return [pickRow('compare', 'Who compares the notes'), pickRow('format', 'Report format'), pickRow('cite', 'Evidence they must cite'), pickRow('dissent', 'Keep dissent')];
    return [];
  }
  /* A1-53 / 8.15: the Technical details line names the command the primary would send */
  function commandOf(d) {
    if (d.autoMode) return 'cmd.chat.crew_auto.set';
    if (d.buildWithCrew) return 'cmd.chat.plan.build_with_crew';
    if (d.scheduleIntent) return 'no command: it writes the Build At draft (cmd.chat.plan.schedule_build commits it)';
    if (d.reconfigureRunId) return 'cmd.collaboration.reconfigure';
    return 'cmd.collaboration.start';
  }
  function technicalRow(d) {
    var extra = d.buildWithCrew && d.boundPlanId ? ' Plan ' + esc(d.boundPlanId) + ' · version ' + esc(d.boundPlanVersion) + ' · fingerprint ' + esc(planFingerprint(d)) + '.' : '';
    return advSet(d, 'technical', 'Technical details', 'Start sends <code>' + esc(commandOf(d)) + '</code>.' + extra, 'What the product would send. This preview changes only its own records.', '');
  }
  function planFingerprint(d) { var P = window.PM56_PLANS, h = P && P.hash ? P.hash(d.boundPlanId) : ''; return String(h || cfgFingerprint(d.config, [])).replace(/^[a-z]+:/, '').slice(0, 8); }

  function specialistShelf(ctx, d) {
    var S = S_(), PK = window.PM56_PICKERS;
    var reason = d.autoMode ? 'Crew Auto teams can’t include specialists.' : d.scheduleIntent ? 'Scheduled builds can’t use specialists: they run while you’re away.' : '';
    var rec = isRecordedDraft(d);
    var routes = d.specialistRoutes || SPECIALIST_DEFAULTS;
    function item(key, name, helper, role) {
      var on = !!d[key];
      var state = reason ? 'disabled' : (rec && !on) ? 'disabled' : on ? 'on' : 'off';
      return { key: 'pmx-spec-' + key, name: name, helper: helper, state: state, reason: reason || (rec ? 'This recorded example uses its own team.' : ''),
        affects: (key === 'wonderer' ? 'wonderer' : 'grill') + ' specialists',
        /* item 11 (Jared, 2026-10-07: "The Grill me icon should be a grill ... in neon design like the rest"): the
           shelf's Grill Me item is the neon kettle grill in Grill Me's seat hue, and hovering the row or focusing its
           Add plays the grill's act (neon-icons.css 8d). Once added, Grill Me's puppet stands behind the same kettle in
           the plate and the roster. Wonderer keeps its puppet mark. */
        mark: key === 'grillMe' ? '<span class="pmx-spec-glyph" style="--nx-ink:var(--pmx-seat-' + SPECIALIST_SEAT[key] + ')">' + S.pmxGlyph('grill', 24) + '</span>'
          : S.pmxMark({ role: role, seat: SPECIALIST_SEAT[key], size: 24, state: on ? 'idle' : 'optional' }),
        input: { attrs: 'data-collab-input="' + key + '"' },
        control: PK.modelButton('collab-pick-model', 'collab-model-spec-' + key, (routes[key] || SPECIALIST_DEFAULTS[key]).modelId, 'data-specialist="' + key + '"') };
    }
    var grillHelp = d.kind === 'brainstorm' ? 'Asks you the key decisions first. Allows 25 more questions.' : 'Asks you the key decisions first, with suggested answers.';
    /* J-2 / 6.3: the canon helper ("Extra helpers that join the team. They never replace one.") rides in the
       title's hover card and a short meta, so the side column fits the 88 px hero at 1440 x 900 */
    return S.pmxShelf({ key: 'q-specialists', n: d.autoMode ? null : 4,
      title: '<span data-hover-key="collab-specialists" data-hover-tip="Extra helpers that join the ' + (d.kind === 'crew' ? 'Crew' : d.kind === 'chat_room' ? 'room' : 'team') + '. They never replace one.">Add specialists</span>',
      meta: 'Optional · they never replace a helper',
      items: [item('wonderer', 'Wonderer', 'Ideas from other fields, marked hypothesis. Doesn’t vote.', 'wonderer'), item('grillMe', 'Grill Me', grillHelp, 'grill')] });
  }

  /* E-02: the project default, or with a thread id this chat's answer (its Crew Auto check overrides the default) */
  function crewAutoOn(threadId) {
    var def = RTC.definitions.crew, proj = !!(def.autoEnabled && def.autoConfigured);
    if (threadId == null) return proj;
    var o = RTC.crewAutoChat[threadId];
    return def.autoConfigured && typeof o === 'boolean' ? o : proj;
  }

  /* the generic parts, per kind */
  function genericParts(d, ctx) {
    var S = S_(), PK = window.PM56_PICKERS;
    var n = d.rows.length, lim = KIND_PARTICIPANT_LIMIT[d.kind], noun = NOUN[d.kind];
    var recorded = isRecordedDraft(d);
    var cfg = d.config;
    var p = {
      mark: S.pmxKindMark(d.autoMode ? 'crew-auto' : d.kind, 26),
      cardTitle: true, save: !d.autoMode,
      whoAffects: 'team',
      rosterCols: [{ label: 'Job', helper: 'What it focuses on' }, { label: 'AI model', helper: 'Which AI, which account pays' }, { label: 'Persona', helper: 'How it works (builds, checks…)' }],
      roster: { recipes: !!RECIPES[d.kind] },
      shelf: true,
      firstFrame: firstFrameOf(d),
      primaryLabel: 'Start ' + KIND_LABEL[d.kind] + ' · <span data-k="pc:' + n + '">' + plural2(n, noun) + '</span>'
    };
    var rangeBad = n < lim[0] || n > lim[1];
    var needsJob = !String(d.purpose || '').trim();
    if (d.kind === 'crew' && !d.autoMode) {
      var coord = optionOf(CONFIG_CHOICES.coordinator.options, cfg.coordinator), asg = optionOf(CONFIG_CHOICES.assignmentStrategy.options, cfg.assignmentStrategy);
      /* the stepper stops at the team size (Crew Auto does the same at its 4), so the clamp sentence beside it only
         ever names helpers that exist */
      var maxC = Math.max(1, Math.min(8, n)), asked = Math.min(clamp(cfg.parallelism || 1, 1, 8), maxC), cap = capacityOf(d), eff = Math.min(asked, cap);
      var clamp1 = S.pmxClamp({ asked: asked, runs: cap });
      Object.assign(p, {
        title: 'Set up a Crew', lead: 'A small team of AIs splits your job into parts. A Coordinator hands them out and only accepts a part once its result is checked.',
        hero: { n: 1, title: 'What should the Crew get done?', helper: 'Describe the finished result in your own words. The Coordinator turns it into parts, and everyone in the Crew reads it.', placeholder: 'e.g. Export the collection to CSV without losing quotes or order' },
        whoTitle: 'Who’s in the Crew', whoMeta: '<span data-k="cnt:' + n + '">' + plural2(n, 'helper') + '</span> · up to 8',
        plate: crewPlateFit(d),
        howTitle: 'How should they work together?',
        howHtml:
          S.pmxCtl({ key: 'ctl-coordinator', label: 'Coordinator', helper: 'Splits the job, hands out the parts, checks and combines the results.', affects: 'lead', control: choiceTrigger(d, 'coordinator', null, ctx) }) +
          S.pmxCtl({ key: 'ctl-assign', label: 'Who decides who does what', helper: 'How parts are handed out.', affects: 'assign', control: choiceTrigger(d, 'assignmentStrategy', false, ctx) }) +
          S.pmxCtl({ key: 'ctl-parallel', label: 'Working at the same time', helper: 'More at once is faster but uses your limits faster.', capSay: clamp1 ? esc(clamp1.sheet) : '', affects: 'parallel',
            control: S.pmxStepper({ key: 'step-parallel', input: { key: 'cfg-parallelism', attrs: 'data-collab-input="cfg-parallelism"' }, value: asked, min: 1, max: maxC, cap: cap, unit: 'at once', affects: 'parallel' }) }),
        promises: [
          { key: 'pr-perm', glyph: 'lock', strong: 'Helpers can’t do more than this chat:', text: 'same tools and Skills, and it asks first.', part: 'permission' },
          crewAutoOn(ctx && ctx.state && ctx.state.selectedThread)
            ? { key: 'pr-auto', glyph: 'kind-crew-auto', strong: 'Crew Auto is on:', text: 'big jobs may get a Crew. <button type="button" class="text-button" data-action="collab-open-configure" data-kind="crew" data-auto="1">Settings…</button>', part: 'auto' }
            : { key: 'pr-auto', glyph: 'not', strong: 'Crew Auto is off:', text: 'no Crew starts by itself. <button type="button" class="text-button" data-action="collab-open-configure" data-kind="crew" data-auto="1">Settings…</button>', part: 'auto' }],
        advanced: { summary: 'This Crew stops after ' + (cfg.timeLimitMinutes || 45) + ' min or $' + Number(cfg.costLimitUsd || 6).toFixed(2) },
        readback: [
          { part: 'team', html: '<b>' + inkText('rb:crew:n', plural2(n, 'helper')) + '</b> work on it, ' },
          { part: 'parallel', html: '<b>' + inkText('rb:crew:eff', eff + ' at a time') + '</b>, ' },
          { part: 'lead', html: 'and <b>' + inkText('rb:crew:lead', coord.read || coord.label) + '</b> checks every part before it counts.' }],
        estimate: recorded ? { recorded: true } : { minutes: [5, 15], limitUsd: cfg.costLimitUsd || 6 },
        primaryDisabled: rangeBad || needsJob,
        primaryReason: rangeBad ? 'Crew needs 1 to 8 helpers.' : needsJob ? 'Add a job first.' : ''
      });
    } else if (d.kind === 'crew' && d.autoMode) {
      var capA = RTC.definitions.crew.autoMaxMembers || 4;
      var askedA = clamp(cfg.parallelism || 1, 1, 8), maxA = Math.max(1, Math.min(4, n));
      var cx = optionOf(CONFIG_CHOICES.autoComplexity.options, cfg.autoComplexity), mi = optionOf(CONFIG_CHOICES.autoMinIndependent.options, String(cfg.autoMinIndependent || '2'));
      Object.assign(p, {
        title: 'Crew Auto', lead: 'Nothing starts now. This sets when Puppet Master may bring in your Crew by itself, and which team it uses.',
        hero: null, cardTitle: false, firstFrame: null, save: false,
        main: S.pmxQuestion({ key: 'q-decide', title: 'How it would decide', helper: 'Four sample requests, judged by the rules on the right.', affects: 'auto', body: crewAutoDecide(d) }) +
          S.pmxQuestion({ key: 'q-who', title: 'Which team?', meta: '<span data-k="cnt:' + n + '">' + plural2(n, 'helper') + '</span> · up to ' + capA + ' for Crew Auto', affects: 'team', body: rosterHtml(ctx, d, Object.assign({}, p, { roster: { recipes: false, max: 8 } })) }),
        side:
          S.pmxQuestion({ key: 'q-when', n: 1, title: 'When should Puppet Master call the Crew?', helper: 'Small requests always stay with one assistant.', affects: 'auto', body: choiceTrigger(d, 'autoComplexity', false, ctx) }) +
          S.pmxQuestion({ key: 'q-split', n: 2, title: 'Only when the job splits into', helper: 'A job that can’t be split stays with one assistant.', affects: 'auto', body: choiceTrigger(d, 'autoMinIndependent', false, ctx) }) +
          S.pmxQuestion({ key: 'q-at-once', n: 3, title: 'Working at the same time', helper: 'How many of the Crew Auto team work at once. The team itself has at most ' + capA + ' helpers, and nothing here raises that.', affects: 'parallel',
            body: S.pmxStepper({ key: 'step-parallel', input: { key: 'cfg-parallelism', attrs: 'data-collab-input="cfg-parallelism"' }, value: Math.min(askedA, maxA), min: 1, max: maxA, unit: 'at once', affects: 'parallel' }) }) +
          /* the specialists, disabled with their reason (8.2), sit in the side column: under "Which team?" they pushed
             the roster's rows into a scroll at every size once J-2's 60 px rows landed */
          specialistShelf(ctx, d) +
          S.pmxPromises(
            S.pmxPromise({ key: 'pr-now', glyph: 'not', strong: 'Nothing starts now.', text: 'This only sets the rules.', part: 'auto' }) +
            S.pmxPromise({ key: 'pr-perm', glyph: 'lock', text: 'A Crew Auto team never gets more permission than this chat.', part: 'permission' }) +
            S.pmxPromise({ key: 'pr-quiet', glyph: 'eye', text: 'If one assistant is enough, you won’t see a Crew card at all.', part: 'auto' })) +
          crewAutoRefuseDemo(ctx),
        readback: [
          { part: 'auto', html: 'When a <b>' + inkText('rb:auto:cx', cx.read) + '</b> request splits into <b>' + inkText('rb:auto:mi', mi.read) + '</b> parts, ' },
          { part: 'team', html: 'Puppet Master starts <b>this Crew</b> by itself.' }],
        estimate: { text: crewAutoOn() ? 'Each Crew it starts has its own time and cost limit. Saving changes the rules for every chat.' : 'Each Crew it starts has its own time and cost limit. Turning it on saves these rules as your Crew Auto default.' },
        primaryLabel: crewAutoOn() ? 'Save Crew Auto rules' : 'Turn on Crew Auto',
        primaryDisabled: rangeBad, primaryReason: rangeBad ? 'Crew Auto needs 1 to 8 helpers.' : '',
        advanced: null
      });
    } else if (d.kind === 'chat_room') {
      var pol = optionOf(CONFIG_CHOICES.turnPolicy.options, cfg.turnPolicy), rounds = clamp(cfg.maxRounds || 5, 1, 20);
      Object.assign(p, {
        title: 'Set up a Chat Room', lead: 'Several AIs talk your question through with you. A Moderator keeps it on track. Nothing in your project changes, and nothing becomes a To-Do or Plan unless you pick it.',
        hero: { n: 1, title: 'What should the room talk about?', helper: 'Ask it the way you’d ask a group of colleagues. Everyone in the room reads this.', placeholder: 'e.g. Should search have a keyboard shortcut?' },
        whoTitle: 'Who’s in the room', whoMeta: '<span data-k="cnt:' + n + '">' + plural2(n, 'helper') + '</span> · up to 8',
        plate: roomPlateFit(d),
        roster: { recipes: true, pinned: moderatorRow(ctx, d) },
        howTitle: 'How should they talk?',
        howHtml:
          S.pmxCtl({ key: 'ctl-policy', label: 'Who talks when', helper: 'How the conversation moves from one helper to the next.', affects: 'policy', control: choiceTrigger(d, 'turnPolicy', false, ctx) }) +
          S.pmxCtl({ key: 'ctl-rounds', label: 'Rounds', helper: 'A round means everyone gets one turn. You can end early or add more.', affects: 'rounds',
            control: S.pmxStepper({ key: 'step-rounds', input: { key: 'cfg-maxRounds', attrs: 'data-collab-input="cfg-maxRounds"' }, value: rounds, min: 1, max: 20, cells: false, unit: 'rounds', affects: 'rounds' }) }),
        promises: [
          { key: 'pr-changes', glyph: 'not', strong: 'Talking changes nothing.', text: 'You pick what, if anything, to keep.', part: 'you' },
          { key: 'pr-read', glyph: 'lock', text: 'Helpers can read your project and the web, never change it.', part: 'permission' }],
        advanced: { summary: 'Stops after ' + (cfg.timeLimitMinutes || 60) + ' min or $' + Number(cfg.costLimitUsd || 4).toFixed(2) + ' · ' + (advValue(d, 'mentions') === 'both' ? 'mentions allowed' : 'answers only you') },
        readback: [
          { part: 'team', html: '<b>' + inkText('rb:room:n', plural2(n, 'helper')) + '</b> talk it through, ' },
          { part: 'policy', html: '<b>' + inkText('rb:room:pol', pol.read) + '</b>, ' },
          { part: 'rounds', html: 'for up to <b>' + inkText('rb:room:r', plural2(rounds, 'round')) + '</b>. Nothing changes unless you pick it.' }],
        estimate: recorded ? { recorded: true } : { text: 'About ' + (n * Math.min(rounds, 5)) + ' replies · usually 4–10 min · stops at $' + Number(cfg.costLimitUsd || 4).toFixed(2) + ' · an estimate, not a promise' },
        primaryDisabled: rangeBad || needsJob,
        primaryReason: rangeBad ? 'Chat Room needs 2 to 8 helpers.' : needsJob ? 'Add a question first.' : ''
      });
    } else if (d.kind === 'brainstorm') {
      var rs = optionOf(CONFIG_CHOICES.externalResearch.options, cfg.externalResearch), dr = clamp(cfg.debateRounds || 2, 1, 4);
      Object.assign(p, {
        title: 'Set up a BrainStorm', lead: 'Several AIs each draft a plan without peeking at the others. They debate, check the facts and vote, and you get one plan you can build.',
        hero: { n: 1, title: 'What should the team decide?', helper: 'This becomes the plan’s goal. Everyone reads it.', placeholder: 'e.g. How should search stay fast without uploading anything?', aside: mustHavesBlock(d) },
        whoTitle: 'Who’s on the team', whoMeta: '<span data-k="cnt:' + n + '">' + plural2(n, 'helper') + '</span> · 2 to 8',
        rosterCols: [{ label: 'Job', helper: 'What it looks at', hover: 'What this helper looks at. The role name is the job; everyone also reads the question above.' }, { label: 'AI model', helper: 'Which AI, which account pays' }, { label: 'Persona', helper: 'How it works (builds, checks…)' }],
        plate: brainstormPlateFit(d),
        howTitle: 'How should they decide?',
        howHtml:
          S.pmxCtl({ key: 'ctl-debate', label: '<span data-hover-key="collab-debate" data-hover-tip="Each round, every helper challenges the others’ ideas.">Rounds of debate</span>', helper: '2 rounds is usually enough.', affects: 'rounds',
            control: S.pmxStepper({ key: 'step-debate', input: { key: 'cfg-debateRounds', attrs: 'data-collab-input="cfg-debateRounds"' }, value: dr, min: 1, max: 4, unit: 'rounds', affects: 'rounds' }) }) +
          S.pmxCtl({ key: 'ctl-research', label: 'Research depth', affects: 'research', control: choiceTrigger(d, 'externalResearch', false, ctx) }) +
          qmaxBlock(d),
        promises: [
          { key: 'pr-built', glyph: 'not', strong: 'Nothing gets built.', text: 'You get one plan to review first.', part: 'you' },
          { key: 'pr-dissent', glyph: 'check', text: 'Disagreements are kept word for word in the plan.', part: 'team' },
          { key: 'pr-rules', glyph: 'lock', strong: 'Rules beat votes:', text: 'breaking a must-have rules an option out.', part: 'rules' }],
        advanced: { summary: 'Stops after ' + (cfg.timeLimitMinutes || 90) + ' min or $' + Number(cfg.costLimitUsd || 14).toFixed(2) + ' · dissent kept' },
        readback: [
          { part: 'team', html: '<b>' + inkText('rb:bs:n', plural2(n, 'helper')) + '</b> each draft a plan alone, ' },
          { part: 'rounds', html: 'debate for <b>' + inkText('rb:bs:r', plural2(dr, 'round')) + '</b>, ' },
          { part: 'research', html: 'check the facts <b>' + inkText('rb:bs:rs', rs.read) + '</b>, then vote. You get <b>one plan</b>.' }],
        estimate: recorded ? { recorded: true } : { text: 'About 10–40 min plus your answers · stops at $' + Number(cfg.costLimitUsd || 14).toFixed(2) + ' · an estimate, not a promise' },
        primaryDisabled: rangeBad || needsJob,
        primaryReason: rangeBad ? 'BrainStorm needs 2 to 8 helpers.' : needsJob ? 'Add a question first.' : ''
      });
    } else if (d.kind === 'review') {
      var single = d.config.strategy === 'single_agent', tgt = targetOf(d.reviewTargetChoice);
      var strat = optionOf(CONFIG_CHOICES.strategy.options, cfg.strategy);
      Object.assign(p, {
        title: d.rerunOf ? 'Run another Review' : 'Set up a Review', lead: 'Fresh AI reviewers check the work and list problems. They never change anything; you decide what to fix.',
        hero: { n: 1, title: 'What should they review?', helper: 'We take a snapshot when you press Start. Every reviewer sees that exact version, even if you keep working.', placeholder: 'Anything specific? e.g. Does search still handle padded queries?',
          before: '<div class="pmx-collab-target" data-pmx-affects="target">' + S.pickerButton({ action: 'collab-pick-choice', anchor: 'collab-choice-target', strong: esc(tgt.label), small: esc(targetSmall(ctx, tgt.value)), extra: 'data-field="target" data-menu-title="What to review"' }) + '</div>' },
        whoTitle: 'Who reviews', whoMeta: '<span data-k="cnt:' + n + '">' + plural2(n, 'reviewer') + '</span> · up to 8', whoAffects: 'count',
        rosterCols: [{ label: 'Looks for', helper: 'What it checks' }, { label: 'AI model', helper: 'Which AI, which account pays', hover: 'Which AI reviews, and which of your accounts pays for it. Different models notice different things.' }, { label: 'Persona', helper: 'How it works (checks, doubts…)' }],
        roster: { recipes: true, addLabel: 'Add a reviewer' },
        plate: reviewPlateFit(d, ctx),
        shelf: null,
        howN: 3, howTitle: '<span data-hover-key="collab-focus" data-hover-tip="Each focus goes into a reviewer’s job.">What should they look for?</span>', howAffects: 'focus',
        howHtml: reviewFocusBlock(d),
        sideExtra: S.pmxQuestion({ key: 'q-count', n: 4, title: 'How many reviewers?', helper: 'Set it to 1 for a Single Agent review.', affects: 'count',
          body: '<div class="pmx-collab-count">' + S.pmxStepper({ key: 'step-reviewers', input: { key: 'cfg-reviewerCount', attrs: 'data-collab-input="cfg-reviewerCount"' }, value: n, min: 1, max: 8, cells: false, unit: n === 1 ? 'reviewer' : 'reviewers', affects: 'count' }) +
            S.pickerButton({ action: 'collab-pick-choice', anchor: 'collab-choice-strategy', strong: esc(strat.label), small: esc(strat.small), extra: 'data-field="strategy" data-menu-title="Review approach"' }) + '</div>' }),
        promises: [
          single ? { key: 'pr-blind', glyph: 'eye-off', strong: 'A single pass:', text: 'one reviewer, so nothing is double-checked.', part: 'blind' }
            : { key: 'pr-blind', glyph: 'eye-off', strong: 'They check alone first:', text: 'no one sees another’s notes early.', part: 'blind' },
          { key: 'pr-ro', glyph: 'lock', strong: 'Review never changes your files.', text: 'You decide what to fix.', harness: '<label class="collab-checkbox-row"><input type="checkbox" disabled> Auto-repair: permanently off. Review never changes your files</label>' },
          { key: 'pr-fresh', glyph: 'check', strong: 'Fresh eyes:', text: 'reviewers don’t see how the work was made.' }],
        advanced: { summary: 'Stops after ' + (cfg.timeLimitMinutes || 30) + ' min or $' + Number(cfg.costLimitUsd || 5).toFixed(2) + ' · file and line cited' },
        readback: single
          ? [{ part: 'count', html: '<b>' + inkText('rb:rev:n', '1 reviewer') + '</b> reads a locked snapshot of ' }, { part: 'target', html: '<b>' + inkText('rb:rev:t', tgt.read) + '</b> in a single pass. <b>Nothing is changed.</b>' }]
          : [{ part: 'count', html: '<b>' + inkText('rb:rev:n', plural2(n, 'reviewer')) + '</b> read a locked snapshot of ' }, { part: 'target', html: '<b>' + inkText('rb:rev:t', tgt.read) + '</b> ' }, { part: 'blind', html: 'on their own, then compare notes. <b>Nothing is changed.</b>' }],
        estimate: recorded ? { recorded: true } : { text: single ? 'Usually under a minute · stops at $' + Number(cfg.costLimitUsd || 5).toFixed(2) + ' · an estimate, not a promise' : 'About 3–8 min · stops at $' + Number(cfg.costLimitUsd || 5).toFixed(2) + ' · an estimate, not a promise' },
        primaryDisabled: rangeBad, primaryReason: rangeBad ? 'Review needs 1 to 8 reviewers.' : ''
      });
      if (d.rerunOf) { var old = findRun(d.rerunOf), lt = old && lastTimeOf(old); if (lt) p.lead += ' Last time: ' + esc(lt) + '.'; }
    }
    /* modes: reconfigure, a finished run, scheduled, Build With Crew (8.1, G-28, 9.2) */
    if (!d.autoMode && (d.reconfigureRunId || d.rerunOf)) {
      var ended = !d.reconfigureRunId;
      if (!ended || d.kind !== 'review') p.title = ended ? 'Run this ' + KIND_LABEL[d.kind] + ' again' : 'Change this ' + KIND_LABEL[d.kind];
      if (ended && d.kind !== 'review') p.lead = 'Starts a fresh run; this one stays as it is.';
      if (!ended || d.kind !== 'review') p.primaryLabel = ended ? 'Run again with changes' : 'Save changes';
    }
    if (d.scheduleIntent) {
      var plan = scheduledPlan(d);
      if (!rangeBad) { p.primaryDisabled = false; p.primaryReason = ''; }
      p.title = 'Choose the Crew for this build';
      p.lead = 'Building <b>' + esc(plan ? plan.title : 'this plan') + '</b>' + (plan && plan.version ? ' (version ' + esc(plan.version) + ')' : '') + '. To change the plan, stop the Crew first.';
      p.primaryLabel = 'Use this Crew for the build';
      p.save = true;
    }
    if (d.buildWithCrew) {
      var bp = window.PM56_PLANS && window.PM56_PLANS.get ? window.PM56_PLANS.get(d.boundPlanId) : null;
      p.title = 'Build this plan with a Crew';
      p.lead = 'Building <b>' + esc(bp ? bp.title : d.boundPlanId) + '</b> (version ' + esc(d.boundPlanVersion) + ') now. To change the plan, stop the Crew first.';
      if (p.hero) { p.hero.readOnly = true; p.hero.helper = 'From the plan. The Crew reads it; to change it, revise the plan.'; }
    }
    if (p.advanced) p.advanced.rows = sharedAdvancedRows(d, ctx).concat(kindAdvancedRows(d, ctx)).concat([technicalRow(d)]).join('');
    return p;
  }
  function scheduledPlan(d) {
    var P = window.PM56_PLANS, id = d.scheduleIntent && d.scheduleIntent.expected && d.scheduleIntent.expected.plan_id;
    if (!id && window.PM56_SCHED && window.PM56_SCHED.currentCrewTarget) id = window.PM56_SCHED.currentCrewTarget();
    return P && P.get && id ? P.get(id) : null;
  }
  function moderatorRow(ctx, d) {
    var S = S_(), PK = window.PM56_PICKERS;
    return S.pmxRosterRow({ key: 'collab-modrow', cls: 'pmx-collab-modrow', attrs: 'data-row="moderator"',
      mark: S.pmxMark({ role: 'moderator', size: 24 }),
      job: { attrs: 'aria-label="Job" data-row="moderator" data-hover-key="collab-moderator" data-hover-tip="The Moderator picks who speaks next and sums up each round."', value: 'Moderator', readonly: true },
      model: PK.modelButton('collab-pick-model', 'collab-model-moderator', d.config.moderatorModelId || 'sonnet46', 'data-row="moderator"'),
      persona: PK.personaButton('collab-pick-persona', 'collab-persona-moderator', d.config.moderatorPersona || 'Product Manager', 'data-row="moderator"'),
      actions: [] });
  }
  /* BrainStorm's question budget (8.4): the exact .collab-qmax node (a harness hook, IMPACT A2-19), a 20-tick
     meter with 25 ghost ticks under Grill Me, and the helper as its sibling */
  function qmaxBlock(d) {
    var base = d.config.questionLimit || 20, ext = d.config.grillExtension || 25;
    var text = d.grillMe ? 'Maximum questions: ' + (base + ext) + ' (' + base + ' + Grill Me ' + ext + ')' : 'Maximum questions: ' + base;
    var ticks = '';
    for (var i = 0; i < base; i++) ticks += '<i data-on="1"></i>';
    if (d.grillMe) for (var j = 0; j < ext; j++) ticks += '<i data-on="0"></i>';
    return '<div class="pmx-collab-qmax" data-pmx-affects="questions grill">' +
      '<span class="pmx-ctl-label" data-hover-key="collab-qmax-help" data-hover-tip="The most questions the team may ask you, shared by everyone. It’s a limit, not a target: most runs ask far fewer, and anything research can settle doesn’t count.">Questions for you</span>' +
      '<span class="pmx-collab-qval">' + (d.grillMe ? 'Up to ' + (base + ext) + ' · ' + base + ' + Grill Me ' + ext : 'Up to ' + base) + '</span>' +
      /* IMPACT A2-19: the exact legacy text stays for the harnesses, never painted */
      '<p class="collab-qmax" data-k="collab-qmax" data-pmx-harness>' + esc(text) + '</p>' +
      '<span class="pmx-collab-meter" aria-hidden="true">' + ticks + '</span></div>';
  }
  /* 8.0: the hero's aside holds BrainStorm's must-haves (the user field draft.mustHaves, IMPACT A1-01): one rule per
     line in a one-line field that scrolls inside itself; the helper rides in the label's hover card and the
     "Rules beat votes" promise says what a rule does */
  function mustHavesBlock(d) {
    return '<label class="pmx-collab-must" data-pmx-affects="rules"><span class="pmx-ctl-label" data-hover-key="collab-must" data-hover-tip="Anything non-negotiable? One rule per line. Rules beat votes.">Must-haves</span>' +
      '<textarea rows="1" data-collab-input="mustHaves" aria-label="Must-haves, optional" placeholder="e.g. No uploads">' + esc(d.mustHaves || '') + '</textarea></label>';
  }
  var FOCUS = [['bugs', 'Bugs', 'Wrong results, crashes'], ['security', 'Security', 'Leaks, unsafe input'], ['speed', 'Speed', 'Slow paths, wasted work'], ['read', 'Easy to read', 'Confusing or tangled code'], ['tests', 'Tests', 'Missing or weak tests'], ['any', 'Anything', 'Whatever looks wrong']];
  var GIVE = [['plan', 'The plan'], ['changes', 'The changes'], ['tests', 'Test results'], ['rules', 'Your rules']];
  function reviewFocusBlock(d) {
    var S = S_(), f = d.reviewFocus || {}, give = d.config.alsoGive || {};
    return '<div class="pmx-collab-focus">' + FOCUS.map(function (x) { return S.pmxCheck({ key: 'focus-' + x[0], attrs: 'data-collab-input="focus-' + x[0] + '"', checked: !!f[x[0]], label: x[1], helper: x[2] }); }).join('') + '</div>' +
      '<div class="pmx-collab-give"><span class="pmx-ctl-label">Also give them</span>' +
      S.pmxWords({ key: 'give', action: 'collab-review-give', label: 'Also give them', items: GIVE.map(function (g) { return { value: g[0], label: g[1], on: !!give[g[0]], attrs: g[0] === 'rules' ? 'data-hover-key="collab-give-rules" data-hover-tip="Your rules = the rules you taught Puppet Master."' : '' }; }) }) + '</div>';
  }
  /* Crew Auto's "How it would decide" (8.2): four sample requests judged by the draft's rules. CREW's own
     evaluation replaces this list through PM56_CREW.sheetParts (8.2: "re-evaluated through PM56_CREW.evaluate");
     COLLAB's fallback applies the same two rules (size, and parts that can run at once) without calling it while
     PM56_CREW.evaluate has no dry run: today it admits a Crew when Crew Auto is on, and a settings sheet must start nothing. */
  var AUTO_SAMPLES = [
    { text: 'Fix the typo in the README', size: 'low', parts: 1, small: 'small request' },
    { text: 'Add a sort menu to the collection page', size: 'medium', parts: 2, small: 'it’s a medium job' },
    { text: 'Add CSV export with tests and a docs note', size: 'high', parts: 3, small: 'big job that splits into 3 parts' },
    { text: 'Rename the collection table, carefully', size: 'high', parts: 1, small: 'this can’t be split up' }];
  /* When CREW declares a side-effect-free dry run (PM56_CREW.evaluate.dryRun === true), every sample goes through
     PM56_CREW.evaluate(request, { dryRun: true, policy: { rows, config } }) and its { admitted, reason } decides
     the verdict; the reason keys are crew-protocol's (complexity_below_threshold, insufficient_independent_work). */
  function crewDryRun(d, s, i) {
    var CR = window.PM56_CREW;
    if (!CR || typeof CR.evaluate !== 'function' || CR.evaluate.dryRun !== true) return null;
    try {
      var r = CR.evaluate({ id: 'crew-auto-sample-' + i, threadId: 'crew-auto-sheet', explicitSingle: false, complexity: s.size, memberCount: d.rows.length,
        input: { label: s.text, objective: s.text, independentParts: s.parts, capacity: { maxMembers: d.rows.length } } },
        { dryRun: true, policy: { rows: d.rows, config: d.config } });
      return r && r.ok !== false ? r : null;
    } catch (e) { return null; }
  }
  function crewAutoDecide(d) {
    var S = S_(), need = d.config.autoComplexity === 'medium' ? 2 : 3, min = Number(d.config.autoMinIndependent || 2);
    var rank = { low: 1, medium: 2, high: 3 };
    return '<ul class="pmx-collab-decide">' + AUTO_SAMPLES.map(function (s, i) {
      var dry = crewDryRun(d, s, i);
      var sizeOk = dry ? dry.reason !== 'complexity_below_threshold' : rank[s.size] >= need;
      var split = dry ? dry.reason !== 'insufficient_independent_work' : s.parts >= min;
      var crew = dry ? !!dry.admitted : sizeOk && split;
      var why = crew ? 'Crew brought in: ' + s.small + '.' : 'One assistant is enough: ' + (!sizeOk ? (s.size === 'low' ? 'small request' : 'it’s a medium job') : s.parts < 2 ? 'this can’t be split up' : 'it splits into only ' + s.parts + ' parts') + '.';
      return '<li data-k="decide:' + i + '" data-verdict="' + (crew ? 'crew' : 'one') + '">' + S.pmxGlyph(crew ? 'check' : 'minus', 14) +
        '<span><span class="pmx-collab-decide-q">“' + esc(s.text) + '”</span><span class="pmx-help">' + inkText('decide:' + i, why) + '</span></span></li>';
    }).join('') + '</ul>';
  }
  /* The demo-only refuse control (8.2 last bullet): a quiet recorded-example line while the Crew demo is active */
  function crewAutoRefuseDemo(ctx) {
    var D5 = window.PM56_CREW_DEMOS, snap = D5 && D5.snapshot ? D5.snapshot() : null;
    if (!snap) return '';
    return '<p class="pmx-collab-demo-line" data-k="crew-auto-refuse-demo">' + S_().pmxGlyph('play-ring', 14) + '<span>Recorded example: ' +
      '<button type="button" class="text-button" data-action="collab-crew-auto-refuse-demo">try a request Crew Auto would refuse</button></span></p>';
  }

  /* =====================================================================
     14b. THE FRAME: parts -> pmxSheet
     ===================================================================== */
  function kindModule(kind) {
    return kind === 'crew' ? window.PM56_CREW : kind === 'review' ? window.PM56_REVIEW : kind === 'brainstorm' ? window.PM56_BRAINSTORM : kind === 'chat_room' ? window.PM56_ROOM : null;
  }
  /* KIND INTERFACE (step 1): PM56_<KIND>.sheetParts(draft, ctx, generic) returns any subset of the generic parts;
     every field it returns replaces COLLAB's, every field it leaves undefined keeps COLLAB's. */
  function sheetPartsFor(d, ctx) {
    var gen = genericParts(d, ctx);
    var K = kindModule(d.kind);
    var own = K && typeof K.sheetParts === 'function' ? K.sheetParts(d, ctx, gen) : null;
    if (!own) return gen;
    var out = Object.assign({}, gen);
    Object.keys(own).forEach(function (k) { if (own[k] !== undefined) out[k] = own[k]; });
    /* a kind's own "Working at the same time" stepper stops at the team size too (as COLLAB's and Crew Auto's do):
       the draft value is already clamped (clampCrewParallel), this keeps + disabled at the team size */
    if (d.kind === 'crew' && !d.autoMode && typeof out.howHtml === 'string' && out.howHtml !== gen.howHtml) {
      var S = S_(), maxC = Math.max(1, Math.min(8, d.rows.length)), val = Math.min(clamp(d.config.parallelism || 1, 1, 8), maxC);
      out.howHtml = out.howHtml.replace(/<div class="pmx-stepper"[^>]*data-k="step-parallel"[^>]*>[\s\S]*?<\/div>/, function () {
        return S.pmxStepper({ key: 'step-parallel', input: { key: 'cfg-parallelism', attrs: 'data-collab-input="cfg-parallelism"' }, value: val, min: 1, max: maxC, cap: capacityOf(d), unit: 'at once', affects: 'parallel' });
      });
    }
    /* the clamp sentence keeps one line in a short window with a specialist added (collaboration.css): its hover card
       carries the whole sentence */
    if (d.kind === 'crew' && !d.autoMode && typeof out.howHtml === 'string') out.howHtml = out.howHtml.replace(/<span class="pmx-step-capsay">([^<]*)<\/span>/, function (m, t) {
      return '<span class="pmx-step-capsay" data-hover-key="collab-capsay" data-hover-tip="' + t.replace(/"/g, '&quot;') + '">' + t + '</span>';
    });
    return out;
  }
  function refusalOf(d) {
    var f = d.lastFailure; if (!f) return null;
    var S = S_();
    var helper = f.helper || (d.rows.filter(function (r) { return r.rowId === f.rowId; })[0] || {}).role || '';
    var t = S.pmxRefusalText(f.error, { helper: helper, kind: KIND_LABEL[d.kind], version: f.version, over: f.over }) || null;
    var fix = f.rowId && t && t.fix === 'Fix' ? { action: 'collab-refusal-fix', attrs: 'data-row="' + esc(f.rowId) + '"', label: 'Fix' } : null;
    return S.pmxRefusal({ code: f.error, strong: t ? t.strong || S.PMX_COPY.refusal.strong : S.PMX_COPY.refusal.strong, text: t ? t.text : S.PMX_COPY.refusal.fallback, fix: fix });
  }
  function heroHtml(ctx, d, p) {
    var S = S_();
    if (!p.hero) return '';
    var h = p.hero;
    var ff = p.firstFrame;
    /* the frame is laid out at PV_LAYOUT_W and scaled to fit the tray's width AND height (previewScale), so a top frame
       whose sentence wraps is never cut at the tray edge */
    var pvH = Math.max(120, UI.previewH || 120);
    if (!(UI.trayW > 0)) resetPreview();
    var scale = previewScale(UI.trayW, UI.trayH, pvH);
    var preview = ff ? '<div class="pmx-collab-pv" style="--pmx-preview-w:' + PV_LAYOUT_W + 'px;--collab-pv-h:' + pvH + 'px">' + S.pmxPreview({ key: 'pmx-preview', scale: scale, cardHtml: previewCardHtml(d, ff) }) + '</div>' : '';
    var titleIn = p.cardTitle === false ? '' :
      '<span data-hover-key="collab-card-title" data-hover-tip="Shown on the card in your chat.">Card title</span>' +
      '<input type="text" data-collab-input="name" data-pmx-source="name" aria-label="Card title" value="' + esc(d.nameEdited ? d.name : deriveCardTitle(d.purpose)) + '" placeholder="Shown on the card">';
    var attrs = 'data-collab-input="purpose"' + (h.fieldAttrs ? ' ' + h.fieldAttrs : '') + (h.readOnly ? ' readonly' : '');
    var html = S.pmxHero({ key: 'pmx-hero', n: h.n, title: esc(h.title), helper: esc(h.helper), headAside: titleIn, cls: h.before ? 'pmx-collab-hero--before' : h.after ? 'pmx-collab-hero--after' : '',
      field: { tag: 'textarea', attrs: attrs, value: d.purpose || '', placeholder: h.placeholder || '' }, preview: preview, aside: h.aside || '' });
    if (h.before) html = html.replace('<div class="pmx-hero-box">', h.before + '<div class="pmx-hero-box">');
    /* after (owner tweak 2026-10-07): a block drawn beside the field, behind it (BrainStorm's must-haves, which left the
       side column so the preview could have its whole height); the field's value is escaped, so the first
       "</textarea></div>" closes the field's box */
    if (h.after) { var shut = '</textarea></div>', cut = html.indexOf(shut); if (cut >= 0) html = html.slice(0, cut + shut.length) + h.after + html.slice(cut + shut.length); }
    return html;
  }
  function renderConfigureModal(ctx) {
    var d = RTC.draft; if (!d) return '';
    normalizeReview(d);
    var S = S_();
    var p = sheetPartsFor(d, ctx);
    /* E-03: an offline chosen model keeps Start disabled with its sentence, over any kind's own primary state */
    var offline = offlineReason(d);
    if (offline) { p.primaryDisabled = true; p.primaryReason = offline; }
    var n = d.rows.length;
    UI.jobEmpty = !String(d.purpose || '').trim();
    var main = p.main != null ? p.main : S.pmxQuestion({ key: 'q-who', n: 2, title: esc(p.whoTitle), meta: p.whoMeta, affects: p.whoAffects || 'team', body: (p.plate || '') + rosterHtml(ctx, d, p) });
    var promises = (p.promises || []).map(function (x) { return S.pmxPromise(x); }).join('');
    /* the Crew Auto promise is the owner's E-02 statement and the sheet's only way to Crew Auto's settings (G-27): it
       stays in the side column at every size (collaboration.css keeps it there in short windows) */
    var side = p.side != null ? p.side :
      S.pmxQuestion({ key: 'q-how', n: p.howN || 3, title: p.howTitle, affects: p.howAffects || '', body: p.howHtml || '' }) +
      (p.sideExtra || '') +
      (p.shelf ? specialistShelf(ctx, d) : '') +
      (promises ? S.pmxPromises(promises) : '') +
      (p.advanced ? S.pmxAdvancedEntry({ key: 'pmx-adv', summary: esc(p.advanced.summary) }) : '');
    var adv = ctx.state.dialog && ctx.state.dialog.pmxAdvanced && p.advanced;
    var advancedHtml = adv ? S.pmxAdvancedPage({ key: 'pmx-adv-page', title: 'Advanced', intro: 'Every setting is written as what happens now.', rows: p.advanced.rows || '' }) : '';
    var refusal = refusalOf(d);
    var est = p.estimate ? S.pmxEstimate(typeof p.estimate === 'string' ? { text: esc(p.estimate) } : p.estimate) : '';
    /* 6.4: a disabled primary prints its reason. It takes the estimate's line in the say column (the foot's own
       reason row would push a two-line read-back through the 80 px foot; FOUNDATION REQUEST in COLLAB-NOTES) */
    var reason = p.primaryDisabled && p.primaryReason ? '<p class="pmx-estimate collab-limit-warn">' + esc(p.primaryReason) + '</p>' : '';
    if (reason) est = reason;
    var removedGone = UI.removed && UI.removed.draft !== d;
    if (removedGone) UI.removed = null;
    var stash = UI.stash && d.autoMode ? UI.stash : null;
    var foot = S.pmxFoot({
      cls: 'collab-configure-foot',
      save: p.save ? { action: 'collab-save-default', attrs: 'data-kind="' + esc(d.kind) + '"', state: UI.saved === d ? 'saved' : 'idle' } : null,
      readback: S.pmxReadback({ key: 'pmx-readback', parts: p.readback || [] }),
      estimate: est,
      refusal: refusal ? refusal : '',
      cancel: { action: 'collab-modal-cancel', label: stash ? 'Back to Crew' : 'Cancel' },
      primary: { action: 'collab-modal-commit', label: p.primaryLabel, disabled: !!p.primaryDisabled }
    });
    var guide = (window.PM56_CREW_DEMOS?.guide(ctx, true) || '') + (window.PM56_REVIEW_DEMOS?.guide(ctx, true) || '') + (window.PM56_BRAINSTORM_DEMOS?.guide(ctx, true) || '');
    var sheetKind = d.autoMode ? 'crew-auto' : d.kind;
    if (sheetKind === 'crew-auto') UI.autoWatch = { rev: (RTC.definitions.crew.autoPolicy && RTC.definitions.crew.autoPolicy.revision) || 0, stash: !!stash };
    return S.pmxSheet({
      type: 'collab-configure', kind: sheetKind, size: 'wide', cls: 'collab-configure',
      attrs: 'data-collab-kind="' + esc(d.kind) + '"' + (isRecordedDraft(d) ? ' data-recorded="1"' : ''),
      scrimClose: 'collab-modal-cancel', closeAction: 'collab-modal-cancel', closeAttrs: 'data-close-all="1"',
      markHtml: p.mark, title: p.title, lead: p.lead, titleText: String(p.title || '').replace(/<[^>]+>/g, ''),
      guide: guide, hero: heroHtml(ctx, d, p), main: main, side: side,
      advancedOpen: !!adv, advancedHtml: advancedHtml, foot: foot,
      state: d.lastFailure ? 'refused' : ''
    });
  }
  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'collab-configure') return '';
    return renderConfigureModal(ctx);
  });

  /* Runtime-created runs (committed after boot) attach ONLY to the live
     `ctx.state.threads` clone, never to `D.threads`. `D.threads` is mutated
     exactly once, at module load, for the seed runs (see `attachSeedCards`
     above) -- that happens before app.js's `state.threads = clone(D.threads)`.
     A run created after boot and later cleared by `reset-all` must not leave an
     orphaned "run missing" card baked into `D.threads`. This is the one funnel
     a new card enters a thread through (G-01). */
  function attachCardToThread(ctx, run) {
    var stThread = (ctx.state.threads || []).filter(function (t) { return t.id === run.threadId; })[0];
    if (!stThread) return;
    /* M3 (G-01): arm the Start flight while the sheet and its preview are still in #pmOverlayRoot (the handler is
       still running synchronously), and queue the landing to the render that creates the card. arm() sets the
       start exit hint (the sheet ghost leaves as one object, focus goes to the composer). A run with no open sheet
       (Crew Auto, a demo that committed itself) has no preview to fly from, so its card fades in. A refused Start
       never reaches this function, so nothing is armed. The preview's frame is laid out at the narrow PV_LAYOUT_W, so
       the clone is laid out at the real card's width for the flight (layoutWidth, as Teach's does). */
    var P = PMX_();
    if (P && P.handoff && ctx.state.selectedThread === run.threadId) {
      var id = run.id;
      P.handoff.arm({ layoutWidth: measureCardWidth() });
      UI.arriving[id] = true;
      var landed = function () { if (!UI.arriving[id]) return; UI.arriving[id] = false; var c = EXT.ctx(); if (c && c.renderApp) c.renderApp(); };
      P.handoff.land(id, { done: landed });
      /* the card is never left invisible: the landing's own latest time, then this */
      later(tok('land-max', 900) + tok('flight', 540), landed);
    }
    if (!Array.isArray(stThread.messages)) stThread.messages = [];
    stThread.messages.push({ id: 'collab-card-' + run.id, role: 'system', type: 'collab-run', runId: run.id, time: run.createdAt, sentAt: run.createdAt });
  }

  /* =====================================================================
     14c. SHEET ACTIONS
     ===================================================================== */
  function composerText(ctx) {
    var CS = window.PM56_COMPOSER_STATE, tid = ctx.state.selectedThread;
    var buf = CS && CS.bufferFor ? CS.bufferFor(tid) : null;
    var t = (buf && typeof buf.text === 'string' && buf.text) || ctx.state.composer || '';
    return String(t).trim();
  }
  function clearComposerText(ctx) {
    var CS = window.PM56_COMPOSER_STATE, tid = ctx.state.selectedThread;
    var buf = CS && CS.bufferFor ? CS.bufferFor(tid) : null;
    if (buf) { buf.text = ''; buf.revision = (buf.revision || 0) + 1; if (CS.touch) CS.touch(); }
    ctx.state.composer = '';
    if (ctx.state.drafts) ctx.state.drafts[tid] = '';
    /* the patcher keeps a focused field's value, so the textarea is cleared too */
    var ta = document.querySelector('textarea.composer-input'); if (ta) ta.value = '';
  }
  function openSheet(ctx, fresh) {
    resetPreview();
    if (fresh) { ctx.closeMenu && ctx.closeMenu(); ctx.closeDialog && ctx.closeDialog(); }
    ctx.openDialog({ type: 'collab-configure' });
  }
  EXT.action('collab-open-configure', function (ctx, btn) {
    var kind = btn.dataset.kind;
    if (KINDS.indexOf(kind) < 0) return true;
    if (findRun(btn.dataset.reconfigure)?.crew?.planBinding) { ctx.toast('Frozen build roster', 'Cancel or revise the Plan before scheduling another roster. The admitted run is unchanged.'); return true; }
    var auto = btn.dataset.auto === '1';
    var cur = RTC.draft, dlg = ctx.state.dialog;
    /* G-27: "Settings…" from an open Crew sheet stashes that draft and swaps to Crew Auto (one draft at a time) */
    if (auto && kind === 'crew' && cur && cur.kind === 'crew' && !cur.autoMode && dlg && dlg.type === 'collab-configure') {
      UI.stash = { draft: cur, advanced: !!dlg.pmxAdvanced };
      openConfigureDraft('crew', null, true);
      var P = PMX_(); if (P && P.exitHint) P.exitHint('swap');
      ctx.state.dialog = { type: 'collab-configure' };
      ctx.renderOverlays();
      return true;
    }
    UI.stash = null;
    openConfigureDraft(kind, btn.dataset.reconfigure || null, auto);
    var d = RTC.draft;
    /* a new wand draft: the saved default, and the job prefilled from the composer (8.1) */
    if (d && !btn.dataset.reconfigure && !auto) {
      applySaved(d, savedDefault(kind));
      var text = composerText(ctx);
      if (text && !d.purpose) { d.purpose = text; d.purposeFromComposer = text; }
    }
    openSheet(ctx, true);
    return true;
  });
  function restoreStash(ctx) {
    var st = UI.stash; UI.stash = null;
    if (!st) return false;
    RTC.draft = st.draft;
    var P = PMX_(); if (P && P.exitHint) P.exitHint('swap');
    ctx.state.dialog = { type: 'collab-configure', pmxAdvanced: !!st.advanced };
    ctx.renderOverlays();
    return true;
  }
  /* MODAL-004/MODAL-012: cancel is a LOCAL view action. It discards the draft, emits no domain event, and
     restores a held natural-language request intact to the composer. In the Crew Auto swap, Cancel and Escape
     go back to the Crew sheet; the x and the scrim (data-close-all) close both (G-27, IMPACT A1-36). */
  EXT.action('collab-modal-cancel', function (ctx, btn) {
    var P = PMX_();
    var all = !!(btn && btn.getAttribute && btn.getAttribute('data-close-all') === '1');
    UI.removed = null; UI.autoWatch = null;
    if (RTC.draft && RTC.draft.autoMode && UI.stash && !all) { restoreStash(ctx); return true; }
    UI.stash = null;
    if (RTC.draft?.scheduleIntent) { RTC.draft = null; if (P && P.exitHint) P.exitHint('swap'); PM56_SCHED.returnFromCrewConfiguration(); return true; }
    var d = RTC.draft;
    var held = d && d.heldRequest;
    RTC.draft = null;
    if (P && P.exitHint) P.exitHint('cancel');
    ctx.closeDialog();
    if (!held) ctx.renderApp();
    if (held) {
      var CS = window.PM56_COMPOSER_STATE;
      /* Prefer the durable hold: it returns the exact text AND attachments and clears the hold in one operation,
         so a restored request cannot later be released a second time. The textarea reads state.composer, so
         that is written too (the old path left the textarea empty while the buffer held the text). */
      if (CS && CS.restoreHeldRequest && CS.heldRequest && CS.heldRequest(held.threadId)) CS.restoreHeldRequest(held.threadId);
      else if (CS && CS.setBuffer) CS.setBuffer(held.threadId, held.text, held.attachments || []);
      if (ctx.state && (!held.threadId || held.threadId === ctx.state.selectedThread)) {
        ctx.state.composer = held.text;
        if (ctx.state.drafts) ctx.state.drafts[held.threadId || ctx.state.selectedThread] = held.text;
      }
      ctx.renderApp();
      ctx.toast('BrainStorm cancelled', 'Your request was returned to the composer exactly as written. Nothing ran, and nothing ran with defaults.');
    }
    return true;
  });
  function clearFailure(d, rowId) { if (d.lastFailure && (!rowId || !d.lastFailure.rowId || d.lastFailure.rowId === rowId)) d.lastFailure = null; }
  /* "Working at the same time" never asks for more helpers than the team has (Crew Auto: at most 4): a remove, a
     recipe or a typed value clamps it, so the sheet never promises a helper that isn't there */
  function clampCrewParallel(d) {
    if (!d || d.kind !== 'crew' || !d.config) return;
    d.config.parallelism = clamp(d.config.parallelism || 1, 1, Math.max(1, Math.min(d.autoMode ? 4 : 8, d.rows.length)));
  }
  EXT.action('collab-modal-add-participant', function (ctx) {
    var d = RTC.draft; if (!d) return true;
    var lim = KIND_PARTICIPANT_LIMIT[d.kind];
    if (d.kind === 'review' && d.config.strategy === 'single_agent') { setReviewerCount(d, 2); ctx.renderOverlays(); return true; }
    if (d.rows.length >= lim[1]) return true;
    var r = suggestedRow(d);
    d.rows.push(r);
    if (d.kind === 'review') { d.config.reviewerCount = d.rows.length; d._previousMultiRows = d.rows.slice(); }
    UI.removed = null; UI.saved = false;
    ctx.renderOverlays();
    /* focus lands in the new row's job field with the suggested text selected (M2) */
    requestAnimationFrame(function () { var inp = document.querySelector('#pmOverlayRoot [data-collab-input="role"][data-row="' + r.rowId + '"]'); if (inp) { try { inp.focus({ preventScroll: true }); inp.select(); } catch (e) { } } });
    return true;
  });
  EXT.action('collab-modal-remove-participant', function (ctx, btn) {
    var d = RTC.draft; if (!d) return true;
    if (d.kind === 'review' && d.config.strategy === 'single_agent') return true;
    if (d.rows.length <= KIND_PARTICIPANT_LIMIT[d.kind][0]) return true;
    var i = -1;
    d.rows.forEach(function (r, k) { if (r.rowId === btn.dataset.row) i = k; });
    if (i < 0) return true;
    var row = d.rows.splice(i, 1)[0];
    if (d.kind === 'review') { d.config.reviewerCount = d.rows.length; if (d.config.strategy === 'multi_pass') d._previousMultiRows = d.rows.slice(); }
    clearFailure(d, row.rowId);
    var parallel = d.config && d.config.parallelism;
    clampCrewParallel(d);
    /* "Removed Tester · Bring back" for 6 s (G-33) */
    var token = { draft: d, row: row, index: i, seat: UI.seat[row.rowId], parallel: parallel };
    UI.removed = token; UI.saved = false;
    setTimeout(function () { if (UI.removed === token) { UI.removed = null; var c = EXT.ctx && EXT.ctx(); if (c && RTC.draft === d) c.renderOverlays(); } }, clockMs(waitMs('undo', 6000)));
    ctx.renderOverlays();
    return true;
  });
  /* "Bring back" (G-33): draft state, never an undo command (8.15) */
  EXT.action('collab-modal-undo-remove', function (ctx) {
    var d = RTC.draft, u = UI.removed;
    if (!d || !u || u.draft !== d) return true;
    UI.removed = null;
    if (d.rows.length >= KIND_PARTICIPANT_LIMIT[d.kind][1]) { ctx.renderOverlays(); return true; }
    d.rows.splice(Math.min(u.index, d.rows.length), 0, u.row);
    if (u.seat) UI.seat[u.row.rowId] = u.seat;
    /* Bring back restores the team and the "at once" it had */
    if (d.kind === 'crew' && u.parallel != null) { d.config.parallelism = u.parallel; clampCrewParallel(d); }
    if (d.kind === 'review') { d.config.reviewerCount = d.rows.length; d._previousMultiRows = d.rows.slice(); }
    ctx.renderOverlays();
    return true;
  });
  EXT.action('collab-modal-duplicate-participant', function (ctx, btn) {
    var d = RTC.draft; if (!d) return true;
    var src = d.rows.filter(function (r) { return r.rowId === btn.dataset.row; })[0];
    if (src) {
      var copy = draftRow(src.role + ' 2', src.requestedModelId, src.persona, 'none');
      copy.requestedEffort = src.requestedEffort; copy.requestedFast = src.requestedFast;
      if (d.kind === 'review' && d.config.strategy === 'single_agent') {
        setReviewerCount(d, 2); d.rows[1] = copy; d._previousMultiRows = d.rows.slice();
      } else {
        if (d.rows.length >= KIND_PARTICIPANT_LIMIT[d.kind][1]) return true;
        d.rows.splice(d.rows.indexOf(src) + 1, 0, copy);
        if (d.kind === 'review') { d.config.reviewerCount = d.rows.length; if (d.config.strategy === 'multi_pass') d._previousMultiRows = d.rows.slice(); }
      }
    }
    UI.saved = false;
    ctx.renderOverlays(); return true;
  });
  /* Save as my default (D-3): a Settings transaction in the product (8.15); the saved state lasts 2.4 s in place */
  EXT.action('collab-save-default', function (ctx) {
    var d = RTC.draft; if (!d || d.autoMode) return true;
    storeDefault(d.kind, d);
    UI.saved = d;
    ctx.renderOverlays();
    setTimeout(function () { if (UI.saved === d) { UI.saved = false; var c = EXT.ctx && EXT.ctx(); if (c && RTC.draft === d) c.renderOverlays(); } }, clockMs(waitMs('saved', 2400)));
    return true;
  });
  /* A refusal's [Fix] opens that row's own model picker (6.4), so the row keeps exactly one collab-pick-model */
  EXT.action('collab-refusal-fix', function (ctx, btn) {
    var row = btn && btn.dataset.row;
    var trig = row && document.querySelector('#pmOverlayRoot [data-action="collab-pick-model"][data-row="' + row + '"]');
    if (trig) { try { trig.scrollIntoView({ block: 'nearest' }); } catch (e) { } trig.click(); }
    return true;
  });
  EXT.action('collab-review-give', function (ctx, btn) {
    var d = RTC.draft; if (!d || d.kind !== 'review') return true;
    var give = d.config.alsoGive = d.config.alsoGive || {};
    give[btn.dataset.value] = !give[btn.dataset.value];
    ctx.renderOverlays();
    return true;
  });
  ['model', 'persona'].forEach(function (what) {
    EXT.action('collab-pick-' + what, function (ctx, btn) {
      var draft = RTC.draft; if (!draft) return true;
      var spec = btn.dataset.specialist, rowId = btn.dataset.row;
      var row = rowId ? draft.rows.filter(function (r) { return r.rowId === rowId; })[0] : null;
      var P = window.PM56_PICKERS;
      function guard() { return RTC.draft === draft && ['collab-configure', 'collaboration-configure'].indexOf(ctx.state.dialog?.type) >= 0; }
      if (spec) {
        var routes = draft.specialistRoutes = draft.specialistRoutes || JSON.parse(JSON.stringify(SPECIALIST_DEFAULTS));
        var sr = routes[spec] = routes[spec] || JSON.parse(JSON.stringify(SPECIALIST_DEFAULTS[spec]));
        P.openModel(btn, { model: sr.modelId, persona: sr.persona }, function (v) { if (!guard()) return; sr.modelId = v.model; ctx.renderOverlays(); });
        return true;
      }
      if (rowId === 'moderator' || rowId === 'synthesis') {
        var mk = rowId === 'moderator' ? 'moderatorModelId' : 'synthesisModelId';
        if (what === 'model') P.openModel(btn, { model: draft.config[mk] }, function (v) { if (!guard()) return; draft.config[mk] = v.model; ctx.renderOverlays(); });
        else P.openPersona(btn, { persona: draft.config.moderatorPersona }, function (v) { if (!guard()) return; draft.config.moderatorPersona = v.persona; ctx.renderOverlays(); });
        return true;
      }
      if (!row) return true;
      P[what === 'model' ? 'openModel' : 'openPersona'](btn, { model: row.requestedModelId, persona: row.persona, effort: row.requestedEffort, fast: row.requestedFast }, function (v) {
        if (!guard() || draft.rows.indexOf(row) < 0) return;
        row.requestedModelId = v.model; row.persona = v.persona; row.requestedEffort = v.effort; row.requestedFast = v.fast;
        clearFailure(draft, row.rowId);
        if (draft.kind === 'review') {
          if (draft.config.strategy === 'multi_pass') draft._previousMultiRows = draft.rows.slice();
          else if (draft._previousMultiRows && draft._previousMultiRows.length > 0 && draft.rows.length > 0 && draft.rows[0].rowId === row.rowId) draft._previousMultiRows[0] = Object.assign({}, draft._previousMultiRows[0], row);
        }
        ctx.renderOverlays();
      });
      return true;
    });
  });
  /* IMPACT A2-30: one picker call contract (PM56_PMX.pick); the menu title comes from the catalog, with the
     trigger's data-menu-title as the fallback (C.js used to read the label node) */
  EXT.action('collab-pick-choice', function (ctx, btn) {
    var draft = RTC.draft, field = btn.dataset.field; if (!draft) return true;
    var spec = choiceSpec(draft, field, ctx); if (!spec) return true;
    var P = PMX_();
    var opts = spec.options.map(function (o) { return { value: o.value, label: o.label, description: o.description || '', disabled: !!o.disabled, reason: o.reason || '' }; });
    var done = function (v) {
      if (RTC.draft !== draft) return;
      spec.set(v);
      if (field === 'recipe') UI.removed = null;
      ctx.renderOverlays();
    };
    if (P && P.pick) P.pick(btn, { title: spec.title || btn.dataset.menuTitle || '', current: spec.current, options: opts, onChange: done });
    else window.PM56_PICKERS.openChoice(btn, spec.title || btn.dataset.menuTitle || '', spec.current, opts, done);
    return true;
  });

  /* One value-applying function, used by BOTH listeners. It has to be in the `change` path too: a harness (and some
     assistive tooling) dispatches `change` alone. Idempotent, so running it twice is fine. */
  function applyDraftInput(t) {
    var k = t.getAttribute('data-collab-input'); if (!k) return false;
    var d = RTC.draft; if (!d) return false;
    var rowId = t.getAttribute('data-row');
    if (rowId && rowId !== 'moderator') {
      var row = d.rows.filter(function (r) { return r.rowId === rowId; })[0]; if (!row) return false;
      if (k === 'role') row.role = t.value;
      else if (k === 'model') row.requestedModelId = t.value;
      else if (k === 'persona') row.persona = t.value;
      if (d.kind === 'review') {
        if (d.config.strategy === 'multi_pass') d._previousMultiRows = d.rows.slice();
        else if (d._previousMultiRows && d._previousMultiRows.length > 0 && d.rows.length > 0 && d.rows[0].rowId === row.rowId) d._previousMultiRows[0] = Object.assign({}, d._previousMultiRows[0], row);
      }
      return true;
    }
    if (k === 'name') { d.name = t.value; d.nameEdited = !!String(t.value || '').trim(); }
    else if (k === 'purpose') d.purpose = t.value;
    else if (k === 'mustHaves') d.mustHaves = t.value;
    else if (k === 'wonderer') d.wonderer = !!t.checked;
    else if (k === 'grillMe') d.grillMe = !!t.checked;
    else if (k.indexOf('focus-') === 0) { d.reviewFocus = d.reviewFocus || {}; d.reviewFocus[k.slice(6)] = !!t.checked; }
    else if (k === 'cfg-reviewerCount') { if (d.kind === 'review') setReviewerCount(d, t.value); }
    else if (k.indexOf('cfg-') === 0) {
      var field = k.slice(4);
      var LIM = { parallelism: [1, 8], debateRounds: [1, 4], maxRounds: [1, 20] };
      var lim = LIM[field];
      d.config[field] = lim ? clamp(t.value, lim[0], lim[1]) : t.value;
      if (field === 'parallelism') clampCrewParallel(d);
      normalizeReview(d);
    }
    UI.saved = false;
    return true;
  }
  /* caret-safe live words: the card title follows the job until edited, and the preview and the plate's job paper
     update as text nodes (never a repaint per keystroke) */
  function liveWords(d) {
    var root = document.getElementById('pmOverlayRoot'); if (!root) return;
    var title = cardTitleOf(d);
    if (!d.nameEdited) {
      var nameIn = root.querySelector('.pmx-sheet input[data-collab-input="name"]');
      var derived = deriveCardTitle(d.purpose);
      if (nameIn && document.activeElement !== nameIn && nameIn.value !== derived) nameIn.value = derived;
    }
    root.querySelectorAll('[data-collab-mirror="title"]').forEach(function (el) { if (el.textContent !== title) el.textContent = title; });
    var jw = jobWords(d);
    root.querySelectorAll('[data-collab-mirror="job"]').forEach(function (el) { if (el.textContent !== jw) el.textContent = jw; });
  }
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    var k = t.getAttribute('data-collab-input');
    if (!applyDraftInput(t)) return;
    if (k === 'purpose' || k === 'name') {
      var d = RTC.draft; if (d) liveWords(d);
      /* the Start button's "Add a job first." follows the job without a repaint while typing: the next change or
         blur repaints; a transition between empty and not-empty repaints now (the caret stays: pmPatch keeps the
         focused field) */
      if (k === 'purpose' && d) {
        var empty = !String(d.purpose || '').trim();
        if (empty !== !!UI.jobEmpty) { UI.jobEmpty = empty; var c = EXT.ctx && EXT.ctx(); if (c) c.renderOverlays(); }
      }
    }
  });
  /* `change` repaints (caret-safe): selecting an unavailable model shows its stand-in sentence at once, and
     checking Grill Me moves "Maximum questions" from 20 to 45 at once. Focus goes back to the control used. */
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    if (!applyDraftInput(t)) return;
    var ctx = EXT.ctx && EXT.ctx();
    if (ctx && ctx.renderOverlays) {
      var active = document.activeElement;
      var key = active && active.getAttribute && active.getAttribute('data-collab-input');
      var row = active && active.getAttribute && active.getAttribute('data-row');
      ctx.renderOverlays();
      if (key) {
        var sel = '[data-collab-input="' + key + '"]' + (row ? '[data-row="' + row + '"]' : '');
        var again = document.querySelector('#pmOverlayRoot ' + sel);
        if (again && again.focus && document.activeElement !== again) { try { again.focus({ preventScroll: true }); } catch (err) { } }
      }
    }
  });

  /* Typed Start preflight. `forceFailure` exists so the refusal path is drivable in a concept that has no provider
     to fail; every other clause is a real check over the draft. A stand-in is allowed only when its sentence was
     visible before Start, and the policy "none" refuses (guard A4-01). */
  function startPreflight(d) {
    normalizeReview(d);
    if (d.forceFailure)
      return { ok: false, error: String(d.forceFailure), slot: null, message: 'Start was refused (' + d.forceFailure + '). Your configuration is unchanged; no run, card or participant record was created.' };
    for (var i = 0; i < d.rows.length; i++) {
      var r = d.rows[i], m = modelById(r.requestedModelId);
      if (!m)
        return { ok: false, error: 'model_unresolved', slot: r.role, rowId: r.rowId, helper: r.role, message: '“' + r.role + '” names a model this project cannot resolve. Nothing was started; pick a model or remove the slot.' };
      if (UNAVAILABLE_DEMO[r.requestedModelId])
        return { ok: false, error: 'provider_unavailable', slot: r.role, rowId: r.rowId, helper: r.role, message: offlineSentence(r.requestedModelId) + ' Nothing was started.' };
    }
    /* E-03: a specialist, the Moderator or the synthesis model that is offline blocks Start the same way */
    var off = offlineReason(d);
    if (off) return { ok: false, error: 'provider_unavailable', slot: null, message: off + ' Nothing was started.' };
    return { ok: true };
  }

  function specialistParticipant(d, key) {
    var sr = (d.specialistRoutes && d.specialistRoutes[key]) || SPECIALIST_DEFAULTS[key];
    return key === 'wonderer'
      ? mkParticipant({ role: 'Wonderer', requestedModelId: sr.modelId, persona: sr.persona || 'Wonderer', additiveRoleKind: 'wonderer', required: false, status: 'waiting', current: 'Additive: explores adjacent leads. Abstains from the final vote by default.' })
      : mkParticipant({ role: 'Grill Me', requestedModelId: sr.modelId, persona: sr.persona || 'Implementer', additiveRoleKind: 'grill_me', required: false, status: 'waiting', current: 'Additive: maps the decision frontier. No automatic vote.' });
  }
  function mustHaveLines(d) { return String(d.mustHaves || '').split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean); }
  /* IMPACT A1-01: the review target comes from the user field draft.reviewTargetChoice */
  function targetPackOf(ctx, d) {
    var t = targetOf(d.reviewTargetChoice);
    var basis = [ctx.state.selectedThread, t.value, targetSmall(ctx, t.value), nowIso()].join('|');
    return { targetKind: t.kind, targetRefs: [t.label + ' · ' + targetSmall(ctx, t.value)], targetHashes: { primary: cfgFingerprint({ basis: basis }, []).slice(4) }, frozenAt: nowIso(), userConstraintRefs: [], acceptanceRefs: [] };
  }
  function lastTimeOf(run) {
    var f = (run.review && run.review.findings) || [];
    if (!f.length) return '';
    var fix = f.filter(function (x) { return x.disposition === 'confirmed'; }).length, uns = f.filter(function (x) { return x.disposition === 'uncertain' || x.disposition === 'unsure'; }).length;
    var T = S_().pmxTime, at = T ? T.at(run.completedAt || run.createdAt, null, { day: false }) : '';
    return fix + ' to fix, ' + uns + ' unsure' + (at ? ' (' + at + ')' : '');
  }
  function focusOf(d) { var f = d.reviewFocus || {}; return FOCUS.filter(function (x) { return f[x[0]]; }).map(function (x) { return x[0]; }); }

  EXT.action('collab-modal-commit', function (ctx) {
    var d = RTC.draft; if (!d) return true;
    var P = PMX_();
    /* E-03: an offline chosen model refuses every start, scheduled ones and Crew Auto's rules included; the row
       carries the notice and its Fix, the sheet and its values stay */
    var offline = offlineReason(d);
    if (offline) {
      var offRow = d.rows.filter(function (r) { return UNAVAILABLE_DEMO[r.requestedModelId]; })[0];
      d.lastFailure = { error: 'provider_unavailable', rowId: offRow ? offRow.rowId : null, helper: offRow ? offRow.role : '', message: offline + ' Nothing was started.' };
      ctx.renderOverlays(); return true;
    }
    if (d.scheduleIntent) {
      if (!String(d.purpose || '').trim()) { var sp = scheduledPlan(d); if (sp) d.purpose = sp.title || ''; }
      const out = preparePlanCrew(d.scheduleIntent.expected.plan_id || window.PM56_SCHED.currentCrewTarget(), d);
      if (!out.ok) { d.lastFailure = out; ctx.renderOverlays(); return true; }
      const used = PM56_SCHED.acceptCrewConfiguration(out.snapshot, d.scheduleIntent.expected);
      if (!used.ok) { d.lastFailure = used; ctx.renderOverlays(); return true; }
      if (P && P.exitHint) P.exitHint('swap');
      RTC.draft = null; return true;
    }
    normalizeReview(d);
    var limits = KIND_PARTICIPANT_LIMIT[d.kind];
    if (d.rows.length < limits[0] || d.rows.length > limits[1]) { ctx.renderOverlays(); return true; }
    /* Crew Auto's own sheet commits a POLICY, not a run (5.3/CREW-004): no run, no card and no Usage.
       crew-protocol.js claims this commit first (commitPolicy); this base path runs only without it. */
    if (d.autoMode) {
      var crewDefA = RTC.definitions.crew;
      if (d.wonderer || d.grillMe) { d.lastFailure = { error: 'invalid_policy_roster', message: 'Crew Auto teams can’t include specialists.' }; ctx.renderOverlays(); return true; }
      crewDefA.autoConfigured = true;
      crewDefA.autoEnabled = true;
      crewDefA.autoRosterTemplate = d.rows.map(function (r) { return { role: r.role, requestedModelId: r.requestedModelId, persona: r.persona, requestedEffort: r.requestedEffort, requestedFast: r.requestedFast }; });
      effect('settingsWrites');
      RTC.draft = null; UI.autoWatch = null;
      if (UI.stash) { restoreStash(ctx); return true; }
      if (P && P.exitHint) P.exitHint('save');
      ctx.closeDialog();
      ctx.renderApp();
      return true;
    }
    if (d.buildWithCrew && window.PM56_PLANS && window.PM56_PLANS.get) {
      var bp = window.PM56_PLANS.get(d.boundPlanId);
      if (bp && bp.version != null && Number(bp.version) !== Number(d.boundPlanVersion)) { d.lastFailure = { error: 'plan_version_changed', version: bp.version, message: 'This plan changed while this was open.' }; ctx.renderOverlays(); return true; }
    }
    /* MODAL-005 / PART-021. PREFLIGHT, before anything durable exists: a refused START keeps every value, the
       failure is typed, and no run, card, participant record or provider attempt is created. */
    var preflight = startPreflight(d);
    if (!preflight.ok) { d.lastFailure = preflight; ctx.renderOverlays(); return true; }
    var recorded = isRecordedDraft(d);
    if (!String(d.name || '').trim()) d.name = cardTitleOf(d);
    var coreParticipants = d.rows.map(function (r) { return mkParticipant({ role: r.role, requestedModelId: r.requestedModelId, persona: r.persona, requestedEffort: r.requestedEffort, requestedFast: r.requestedFast, status: 'waiting', current: '' }); });
    /* PART-002/PART-011/WONV-007: core slots are REQUIRED by definition; Wonderer and Grill Me are additive and
       optional, and they join on the models the sheet showed (PART-01, IMPACT A3-02) */
    if (d.wonderer) coreParticipants.push(specialistParticipant(d, 'wonderer'));
    if (d.grillMe && d.kind !== 'review') coreParticipants.push(specialistParticipant(d, 'grillMe'));

    if (d.reconfigureRunId) {
      var run = findRun(d.reconfigureRunId);
      if (run) {
        run.definitionRevision += 1;
        run.title = d.name; run.purpose = d.purpose;
        run.config = JSON.parse(JSON.stringify(d.config));
        run.participants = coreParticipants.map(function (p) { p.runId = run.id; return p; });
        if (run.kind === 'brainstorm' && run.brainstorm) { if (run.brainstorm.questionBank) run.brainstorm.questionBank.grillMeEnabled = d.grillMe; run.brainstorm.mustHaves = mustHaveLines(d); }
        run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Setup changed. Prior messages keep who said them.' }));
      }
      RTC.draft = null;
      if (P && P.exitHint) P.exitHint('save');
      ctx.closeDialog();
      ctx.renderApp();
      return true;
    }
    var newRun = mkRun({
      kind: d.kind, threadId: ctx.state.selectedThread, title: d.name, purpose: d.purpose,
      status: 'running', config: JSON.parse(JSON.stringify(d.config)),
      coordinator: d.kind === 'crew' ? { kind: d.config.coordinator, label: d.config.coordinator === 'parent_assistant' ? 'Parent assistant (this thread)' : 'Dedicated synthesis model' } : d.kind === 'chat_room' ? { kind: 'dedicated_moderator', label: 'Moderator', modelId: d.config.moderatorModelId || null, persona: d.config.moderatorPersona || 'Product Manager' } : { kind: 'dedicated_synthesis_model', label: 'Synthesis model' },
      participants: coreParticipants.map(function (p) { return p; })
    });
    newRun.participants.forEach(function (p) { p.runId = newRun.id; });
    if (d.rerunOf) newRun.rerunOf = d.rerunOf;
    if (d.kind === 'crew') newRun.crew = { boundPlanId: d.boundPlanId || null, boundPlanVersion: d.boundPlanVersion || null, boundTodoIds: d.boundPlanId ? ['Bound at Crew start: see the Plan owner for the current To-Do set.'] : [], assignments: [] };
    if (d.kind === 'review') newRun.review = { targetPack: targetPackOf(ctx, d), findings: [], excludedFindings: [], focus: focusOf(d) };
    if (d.kind === 'chat_room') newRun.chatRoom = { roundsSoFar: 0, turnPolicy: d.config.turnPolicy, promotions: [] };
    if (d.kind === 'brainstorm') newRun.brainstorm = { phase: 'intake', questionBank: { baselineLimit: d.config.questionLimit, grillExtension: d.config.grillExtension, grillMeEnabled: d.grillMe, askedIds: [], resolvedIds: [], duplicateIds: [], researchRoutedIds: [] }, proposals: [], debateRounds: d.config.debateRounds, votes: [], hardConstraintViolations: [], dissent: [], wondererLeads: [], provisioning: [], synthesis: null, mustHaves: mustHaveLines(d) };
    newRun.messages.push(mkMsg(newRun, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Started with ' + plural2(coreParticipants.length, NOUN[d.kind]) + '.' }));
    /* MODAL-002: the ONLY place a durable collaborative effect is counted. Opening, editing and cancelling a sheet
       reach none of these lines. A wand-started run with no recording makes no provider call (it is born waiting). */
    effect('runs'); effect('cards'); effect('events');
    effect('participants', newRun.participants.length);
    RTC.runs.push(newRun);
    /* IMPACT A1-01 / A1-23: only a draft flagged recorded hands its fixture input to a protocol owner */
    if (recorded) {
      if (newRun.kind === 'chat_room' && d.roomInput && window.PM56_ROOM) window.PM56_ROOM.admit(newRun, d);
      if (newRun.kind === 'review' && d.reviewTarget && window.PM56_REVIEW) window.PM56_REVIEW.admit(newRun, d);
      if (newRun.kind === 'brainstorm' && d.brainstormInput && window.PM56_BRAINSTORM) window.PM56_BRAINSTORM.admit(newRun, d);
    }
    if (d.wondererInput && window.PM56_WONDERER) window.PM56_WONDERER.admit(newRun, d);
    /* IMPACT A3-03 / D-6: provenance from the commit path, with no key on the run */
    UI.prov[newRun.id] = recorded ? 'recorded' : 'wand';
    if (!recorded) UI.waiting[newRun.id] = true;
    attachCardToThread(ctx, newRun);
    /* the job came from the composer (8.1): a Start consumes those words, so they cannot be sent again as an
       ordinary message (Cancel keeps them); only text still identical to what the sheet took is cleared */
    if (d.purposeFromComposer && composerText(ctx) === d.purposeFromComposer) clearComposerText(ctx);
    RTC.draft = null;
    /* M3: attachCardToThread armed the flight and the start exit (focus goes to the composer, 6.7, IMPACT A1-36) */
    ctx.closeDialog();
    ctx.renderApp();
    return true;
  });

  /* Crew Auto's commit is claimed by crew-protocol.js (commitPolicy), which closes the sheet itself. After that
     render: a successful commit leaves with the save exit, and a Crew sheet stashed by "Settings…" comes back in
     the same task, so the two sheets swap (G-27). */
  function afterOverlay(ctx) {
    var w = UI.autoWatch;
    if (!w || RTC.draft || (ctx.state && ctx.state.dialog)) return;
    UI.autoWatch = null;
    var pol = RTC.definitions.crew.autoPolicy, rev = (pol && pol.revision) || 0;
    var committed = rev > w.rev;
    var P = PMX_();
    if (!committed) { UI.stash = null; return; }
    if (UI.stash) { restoreStash(ctx); return; }
    if (P && P.exitHint) P.exitHint('save');
  }
  if (PMX_() && PMX_().after) PMX_().after(function (ctx, phase) { if (phase === 'overlay') { afterOverlay(ctx); fitPreview(ctx); } });
  /* the preview's natural top-frame height (head, sentence, track) at PV_LAYOUT_W, and the tray's own box (its layout
     size: the sheet's entrance scales what the rects read); when either differs from what heroHtml drew with, the
     overlay renders once more, synchronously, so the first paint already has the scale that fits */
  function fitPreview(ctx) {
    var run = document.querySelector('#pmOverlayRoot .pmx-collab-pv .pmx-preview-card > .pmx-run');
    var trk = run && run.querySelector('.pmx-track');
    var tray = run && run.closest('.pmx-preview-tray');
    if (!run || !trk || !tray || !(tray.clientWidth > 0 && tray.clientHeight > 0)) return;
    var rr = run.getBoundingClientRect(), k = run.offsetWidth ? rr.width / run.offsetWidth : 0;
    if (!(k > 0)) return;
    var nat = (trk.getBoundingClientRect().bottom - rr.top) / k + (parseFloat(getComputedStyle(run).paddingBottom) || 12);
    var h = Math.max(120, Math.ceil(nat));
    var drawn = previewScale(UI.trayW, UI.trayH, Math.max(120, UI.previewH || 120));
    UI.trayW = tray.clientWidth; UI.trayH = tray.clientHeight;
    var stale = Math.abs(h - Math.max(120, UI.previewH || 120)) > 1;
    if (stale) UI.previewH = h;
    if ((stale || Math.abs(previewScale(UI.trayW, UI.trayH, UI.previewH) - drawn) > 0.004) && ctx && ctx.renderOverlays) ctx.renderOverlays();
  }
  /* the tray's box follows the window (module-shell.css) and the frame follows the fonts, neither of which renders
     the overlay: a resize or a face that arrives with the sheet open fits the preview again (one frame later) */
  var fitRaf = 0;
  function refitPreview() {
    if (fitRaf) return;
    fitRaf = requestAnimationFrame(function () { fitRaf = 0; var c = EXT.ctx && EXT.ctx(); if (c && RTC.draft) fitPreview(c); });
  }
  window.addEventListener('resize', refitPreview);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refitPreview);


  /* =====================================================================
     15. MULTI-AGENT WORKFLOWS MENU + CREW AUTO (§5.3, CREW-003/004/005) —
     appended into the existing Wand menu (`wandRows` is an append slot; see
     contract §4). Includes BrainStorm/Review alongside Crew/Chat Room:
     Deep Plan's own "BrainStorm" strategy and the Mode menu's "Review" only
     ARM state for the next composer send (app.js `set-plan-strategy` /
     `set-review-strategy`, both self-contained hardcoded branches with no
     extension point reached before their own early `return` — see honesty
     note in this wave's report), so this module's menu is the actual,
     always-reachable invocation surface for all four kinds.
     ===================================================================== */
  EXT.slot('wandRows', function (ctx) {
    var crewDef = RTC.definitions.crew;
    var tid = ctx && ctx.state && ctx.state.selectedThread;
    var autoChecked = crewAutoOn(tid);
    function row(kind, desc) {
      return '<button class="menu-item" data-action="collab-open-configure" data-kind="' + kind + '"><span class="menu-icon">' + ctx.icon(KIND_ICON[kind], 13) + '</span><span class="menu-copy"><strong>' + esc(KIND_LABEL[kind]) + '…</strong><span>' + esc(desc) + '</span></span></button>';
    }
    /* E-02: the Crew Auto check is this chat's answer to "may the assistant call a Crew by itself?" (on by default) */
    var autoSub = !crewDef.autoConfigured ? 'Opens its settings first'
      : autoChecked ? 'The assistant may call a Crew when a job needs one' : 'Off in this chat: no Crew starts by itself';
    return '<div class="menu-divider" data-k="collab-div"></div>' +
      '<div class="menu-section-label">Multi-Agent Workflows</div>' +
      row('crew', 'Delegate bounded work to a coordinator and roles') +
      row('chat_room', 'Persistent multi-agent discussion, explicit promotion only') +
      row('brainstorm', 'Deep Plan → BrainStorm: independent proposals, debate, one Plan') +
      row('review', 'Single Agent or Multi-Pass, read-only, never auto-repairs') +
      '<div class="menu-divider"></div>' +
      '<label class="menu-item collab-auto-row" data-k="collab-auto-row"><input type="checkbox" data-action="collab-crew-auto-toggle"' + (autoChecked ? ' checked' : '') + '><span class="menu-copy"><strong>Crew Auto</strong><span>' + esc(autoSub) + '</span></span></label>' +
      '<button class="menu-item" data-action="collab-open-configure" data-kind="crew" data-auto="1"><span class="menu-icon">' + ctx.icon('settings', 13) + '</span><span class="menu-copy"><strong>Crew Auto settings…</strong><span>When the assistant calls a Crew, and which team</span></span></button>' +
      '<button class="menu-item" data-action="collab-build-with-crew" data-plan-id="ap-index" data-plan-version="5"><span class="menu-icon">' + ctx.icon('plan', 13) + '</span><span class="menu-copy"><strong>Build With Crew…</strong><span>Bind a Crew to Plan ap-index V5 and its To-Dos</span></span></button>';
  });

  EXT.action('collab-crew-auto-toggle', function (ctx) {
    var crewDef = RTC.definitions.crew;
    if (!crewDef.autoConfigured) {
      openConfigureDraft('crew', null, true);
      ctx.closeMenu && ctx.closeMenu();
      ctx.openDialog({ type: 'collab-configure' });
      return true;
    }
    var tid = ctx.state && ctx.state.selectedThread;
    var on = !crewAutoOn(tid);
    RTC.crewAutoChat[tid] = on;
    ctx.renderOverlays();
    ctx.toast(on ? 'Crew Auto is on in this chat' : 'Crew Auto is off in this chat',
      on ? 'The assistant may call a Crew when a job needs one. It can’t do more than this chat can.' : 'No Crew starts by itself here. Your Crew Auto settings are kept.');
    return true;
  });
  /* E-02: the wand's legacy "crew" capability and the Crew Auto check are one concept, so setting the capability
     answers Crew Auto for this chat too (app.js keeps its own handling: return false) */
  EXT.chainAction('set-crew-cap', function (ctx, btn) {
    var tid = ctx && ctx.state && ctx.state.selectedThread;
    if (tid != null && btn && btn.dataset) RTC.crewAutoChat[tid] = btn.dataset.value === 'On';
    return false;
  });
  EXT.action('collab-crew-auto-refuse-demo', function (ctx) {
    var crewDef = RTC.definitions.crew;
    ctx.addReceipt('collab-receipt', 'Crew Auto refused',
      'Criteria evaluated true against a request that already carries an explicit single-agent model selection on this thread. Crew Auto cannot override that explicit choice and cannot raise the configured member cap (' + (crewDef.autoMaxMembers || 4) + ') or the parent permission ceiling to admit anyway. No crew was created and no Usage was attributed — an unmet-criteria or overridden-criteria evaluation is not a failed run.');
    return true;
  });

  /* =====================================================================
     16. ACTIVITY DOMAINS — brainstorm, review, chat_room only (§4.4,
     COLLAB-005). `crew` is deliberately declined here; see honesty note 3.
     `activityPanelBody` additionally declines outside "focus" scope: the
     built-in aggregate fallback (`sections.map(renderActivitySection).join`)
     is a single call across every live domain at once with no per-domain
     override point, so returning content unconditionally would blank Goal/
     To-Do/Subagents/Changes/Artifacts out of the "all domains" view whenever
     the last-focused domain happened to be one of ours. Declining outside
     focus leaves that view exactly as it already renders. Every one of these
     three domains is still fully reachable at any time through this card's
     own "Open Panel", independent of Activity Detail.
     ===================================================================== */
  var ACTIVITY_KINDS = ['brainstorm', 'review', 'chat_room'];
  /* 7.13 hover rows: the kind mark and the card title, then the run's one true sentence, then its clock */
  function renderActivityHover(ctx, run) {
    var S = S_(), st = presentState(run), sn = sentenceOf(run);
    return '<button type="button" class="ab-row polish-collab-preview" data-k="collab-hover:' + esc(run.id) + '" data-action="collab-open-panel" data-run="' + esc(run.id) + '">' +
      '<span class="pmx-collab-abmark">' + S.pmxKindMark(run.kind, 16) + '</span>' +
      '<span class="ab-row-copy"><b>' + esc(shownTitle(run)) + '</b><span class="pmx-collab-absay"><span class="pmx-collab-absay-w">' + esc(sn.word) + '</span> · ' + esc(sn.reason) + '</span></span>' +
      '<span class="pmx-clock">' + esc(clockOf(run, st)) + '</span></button>';
  }

  /* 7.13 Activity Detail body: title, the sentence, the track's nowText, a compact team list (36 px rows with the
     stand-in sentence only where requested differs from effective), Open Panel and Message. Never the whole card. */
  function renderActivityBody(ctx, run) {
    var S = S_(), st = presentState(run), sn = sentenceOf(run), tr = trackOf(run, st), ra = 'data-run="' + esc(run.id) + '"';
    var team = (run.participants || []).map(function (p) {
      var si = standInOf(p);
      return S.pmxTeamRow({ key: 'collab-ab-p:' + p.id, kind: run.kind, size: 's', markHtml: markOfP(run, p, 18), name: esc(p.role),
        standIn: si ? { requested: String(p.requestedModelName || '').split(' · ')[0], effective: p.effectiveModelId ? String(p.effectiveModelName || '').split(' · ')[0] : '', noSubstitute: !p.effectiveModelId, sameProvider: true } : null,
        outcome: esc(laneVerb(run, p, markState(p))), attrs: ra + ' data-participant="' + esc(p.id) + '"' });
    }).join('');
    var ended = !!TERMINAL[st];
    return '<div class="collab-activity-body" data-k="collab-ab-' + esc(run.id) + '">' +
      '<p class="pmx-collab-ab-title">' + esc(shownTitle(run)) + '</p>' +
      S.pmxSentence({ status: sn.status, word: esc(sn.word), reason: esc(sn.reason) }) +
      (tr ? '<p class="pmx-fine pmx-collab-ab-now">' + tr.nowText + '</p>' : '') +
      '<div class="pmx-collab-ab-team">' + team + '</div>' +
      '<div class="pmx-actions pmx-collab-ab-acts">' +
        '<button type="button" class="text-button pmx-act" data-action="' + esc(openActionOf(run)) + '" ' + ra + '>Open Panel</button>' +
        (ended ? '' : '<button type="button" class="text-button pmx-act" data-action="collab-message" ' + ra + '>Message</button>') +
      '</div></div>';
  }
  EXT.slot('activityHoverCard', function (ctx) {
    var dom = ctx.domain;
    if (ACTIVITY_KINDS.indexOf(dom) < 0) return '';
    var runs = runsForThread(ctx.state.selectedThread).filter(function (r) { return r.kind === dom; });
    if (!runs.length) return '';
    /* newest first, at most four rows (delivery-polish caps them), then the rest named in one line */
    runs = runs.slice().reverse();
    return '<div class="hover-card ab-card" id="activity-domain-preview" data-overlay="hover" data-k="collab-hovercard" data-domain="' + esc(dom) + '" role="dialog" aria-modal="false" aria-label="' + esc(KIND_LABEL[dom]) + ' activity preview">' +
      runs.slice(0,4).map(function (r) { return renderActivityHover(ctx, r); }).join('') +
      (runs.length > 4 ? '<p class="pmx-fine pmx-collab-abmore">and ' + (runs.length - 4) + ' more · Show all in Activity</p>' : '') + '</div>';
  });
  /* 7.13: a collaboration kind's Activity chip reveals the newest card of that kind and pulses it once, instead of
     opening Activity Detail (which stays reachable from the hover rows). Hover rows (.ab-card) and CREW's rows
     (data-crew-run) keep their own routes; with no card of that kind on screen the chip opens Activity as before. */
  EXT.chainAction('open-activity', function (ctx, btn) {
    if (!btn || !btn.dataset || btn.dataset.crewRun || (btn.closest && btn.closest('.ab-card'))) return false;
    var dom = btn.dataset.domain;
    if (!KIND_LABEL[dom] || !ctx || !ctx.state) return false;
    var runs = runsForThread(ctx.state.selectedThread).filter(function (r) { return r.kind === dom; });
    for (var i = runs.length - 1; i >= 0; i--) {
      var el = document.querySelector('#pmRoot .transcript .pmx-run[data-run-id="' + String(runs[i].id).replace(/"/g, '') + '"]');
      if (el && PMX_() && PMX_().reveal) { ctx.state.hover = null; PMX_().reveal(runs[i].id); return true; }
    }
    return false;
  });
  EXT.slot('activityPanelBody', function (ctx) {
    var dom = ctx.domain;
    if (ACTIVITY_KINDS.indexOf(dom) < 0) return '';
    if (ctx.state.activity && ctx.state.activity.scope !== 'focus') return '';
    var runs = runsForThread(ctx.state.selectedThread).filter(function (r) { return r.kind === dom; });
    if (!runs.length) return '';
    const selected=ctx.state.activity.selected;
    if(selected?.domain===dom&&runs.some(r=>r.id===selected.id))runs=runs.filter(r=>r.id===selected.id);
    return runs.map(function (r) { return renderActivityBody(ctx, r); }).join('');
  });

  /* =====================================================================
     17. CREW — assignment completion requires evidence (§5.2: "a tool-
     success signal is evidence input, not completion") and Build With Crew
     (§5.4/CREW-006).
     ===================================================================== */
  EXT.action('collab-crew-complete', function (ctx, btn) {
    ctx.openDialog({ type: 'collab-evidence', runId: btn.dataset.run, assignmentId: btn.dataset.assignment, draft: '' });
    return true;
  });
  /* needs-you answers (cmd.runtime.approve / cmd.runtime.decline): the one helper that waits for your OK is let go on
     once, or told no; the others were never blocked. Nothing else about the run changes. */
  function blockedOf(run, pid) { return (run.participants || []).filter(function (p) { return p.id === pid && p.status === 'blocked'; })[0] || null; }
  function assignmentsOf(run, p) { return ((run.crew && run.crew.assignments) || []).filter(function (a) { return a.status === 'blocked' && (a.participantId === p.id || a.assignedRole === p.role); }); }
  EXT.action('collab-approve', function (ctx, btn) {
    var run = findRun(btn.dataset.run), p = run && blockedOf(run, btn.dataset.participant);
    if (!p) return true;
    p.status = 'working'; p.current = 'Allowed once by you: ' + String(p.blockedReason || 'going on.').replace(/;.*$/, '').replace(/\.?$/, '.'); p.blockedReason = '';
    assignmentsOf(run, p).forEach(function (a) { a.status = 'in_progress'; });
    if (run.status === 'blocked') run.status = 'running';
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'You allowed ' + p.role + ' once. The next time it needs this, it asks again.' }));
    ctx.renderApp();
    return true;
  });
  EXT.action('collab-deny', function (ctx, btn) {
    var run = findRun(btn.dataset.run), p = run && blockedOf(run, btn.dataset.participant);
    if (!p) return true;
    p.status = 'failed'; p.outcome = 'not_allowed'; p.current = 'Not allowed by you. Its part was not done.'; p.blockedReason = '';
    assignmentsOf(run, p).forEach(function (a) { a.status = 'skipped'; });
    if (run.status === 'blocked') run.status = 'running';
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'You didn’t allow ' + p.role + ' to go on. Its part was not done; the others keep working.' }));
    ctx.renderApp();
    return true;
  });

  /* G-26: the evidence sheet (seed and legacy Crews; protocol-owned Crews chain it to their Crew work view). A compact
     pmxSheet; typing writes the draft and toggles only the primary and its printed reason, never a repaint (D.6) */
  var EVIDENCE_WHY = 'Write what shows it’s finished first.';
  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'collab-evidence') return '';
    var S = S_(), run = findRun(d.runId);
    var a = run && run.crew ? run.crew.assignments.filter(function (x) { return x.id === d.assignmentId; })[0] : null;
    var base = { type: 'collab-evidence', kind: 'crew', size: 'compact', height: 390, cls: 'collab-evidence-dialog', closeAction: 'collab-evidence-cancel', scrimClose: 'collab-evidence-cancel', ariaLabel: 'Mark this part as done' };
    if (!run || !a) {
      return S.pmxSheet(Object.assign(base, { height: 260, title: 'This part is no longer here', lead: 'Nothing was changed.', body: '',
        foot: '<footer class="mdl-foot pmx-foot" data-save="0"><div class="pmx-foot-say"></div><button type="button" class="soft-button pmx-cancel" data-action="collab-evidence-cancel">Close</button></footer>' }));
    }
    var empty = !String(d.draft || '').trim();
    var hero = S.pmxHero({ key: 'collab-ev-hero', title: 'What shows it’s done?', affects: 'job',
      field: { rows: 3, value: d.draft || '', placeholder: 'e.g. tests pass: 42/42, and the CSV opens with quotes intact', attrs: ' data-collab-evidence-input aria-label="What shows it’s done?"' },
      helper: 'The Coordinator records this as the proof for ' + esc(a.title) + '.' });
    var body = '<p class="pmx-fine pmx-collab-evdone" data-k="collab-ev-done">Done when: ' + esc(a.expectedOutput || 'the part’s result is checked.') + '</p>';
    var foot = S.pmxFoot({
      readback: '<p class="pmx-estimate collab-limit-warn" data-collab-evidence-why' + (empty ? '' : ' hidden') + '>' + esc(EVIDENCE_WHY) + '</p>',
      cancel: { action: 'collab-evidence-cancel' },
      primary: { action: 'collab-evidence-confirm', attrs: ' data-run="' + esc(run.id) + '" data-assignment="' + esc(a.id) + '"', label: 'Mark as done', disabled: empty }
    });
    return S.pmxSheet(Object.assign(base, { title: 'Mark this part as done?', lead: 'Say what shows it’s finished. A command just running isn’t proof.', hero: hero, body: body, foot: foot }));
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    if (!t.hasAttribute('data-collab-evidence-input')) return;
    var ctx0 = EXT && EXT.ctx && EXT.ctx(); if (!ctx0) return;
    var dlg = ctx0.state.dialog;
    if (!dlg || dlg.type !== 'collab-evidence') return;
    dlg.draft = t.value;
    var sheet = t.closest('.collab-evidence-dialog'), empty = !String(t.value || '').trim();
    if (!sheet) return;
    var btn = sheet.querySelector('[data-action="collab-evidence-confirm"]'), why = sheet.querySelector('[data-collab-evidence-why]');
    if (btn) btn.disabled = empty;
    if (why) why.hidden = !empty;
  });
  EXT.action('collab-evidence-cancel', function (ctx) { ctx.closeDialog(); return true; });
  EXT.action('collab-evidence-confirm', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var a = run.crew.assignments.filter(function (x) { return x.id === btn.dataset.assignment; })[0]; if (!a) return true;
    var note = String((ctx.state.dialog && ctx.state.dialog.draft) || '').trim();
    /* the primary is disabled with its reason printed while the field is empty; a stray confirm changes nothing */
    if (!note) { var f = document.querySelector('.collab-evidence-dialog [data-collab-evidence-input]'); if (f) f.focus(); return true; }
    a.status = 'done'; a.evidenceNote = note;
    run.messages.push(mkMsg(run, { senderKind: 'coordinator', senderName: 'Coordinator', messageType: 'response', body: 'Marked “' + a.title + '” as done. What shows it: ' + note }));
    ctx.closeDialog();
    ctx.renderApp();
    return true;
  });

  /* G-28 Build With Crew mode: the hero comes from the Plan and is read-only; Start dispatches
     cmd.chat.plan.build_with_crew (8.15, IMPACT A3-08). One path for the wand row, the Plan card's More > Build With
     Crew (pd-build-crew, chained below so plans.js's old pd-crew dialog never opens) and PM56_COLLAB.buildWithCrew. */
  function openBuildWithCrew(ctx, planId, planVersion) {
    planId = planId || 'ap-index';
    var plan = window.PM56_PLANS && window.PM56_PLANS.get ? window.PM56_PLANS.get(planId) : null;
    planVersion = Number(planVersion) || (plan && Number(plan.version)) || 5;
    openConfigureDraft('crew', null, false);
    RTC.draft.buildWithCrew = true;
    RTC.draft.name = 'Build ' + (plan ? plan.title : planId);
    RTC.draft.nameEdited = true;
    RTC.draft.purpose = 'Build the plan “' + (plan ? plan.title : planId) + '” (version ' + planVersion + ') as written, with its current To-Dos.';
    RTC.draft.boundPlanId = planId; RTC.draft.boundPlanVersion = planVersion;
    UI.stash = null;
    openSheet(ctx, true);
    return true;
  }
  EXT.action('collab-build-with-crew', function (ctx, btn) { return openBuildWithCrew(ctx, btn.dataset.planId, btn.dataset.planVersion); });
  EXT.chainAction('pd-build-crew', function (ctx, btn) {
    var id = btn && btn.dataset && btn.dataset.id; if (!id) return false;
    if (ctx.closeMenu) ctx.closeMenu();
    return openBuildWithCrew(ctx, id, null);
  });


  /* =====================================================================
     17A. PARTICIPANT DISPOSITIONS, QUORUM AND THE MODAL TRANSACTION
          BOUNDARY — Additive Correction v4
          (MODAL-001..018, PART-001..024, WONV-003..007)
     ===================================================================== */

  var OUTCOMES = ['completed','failed','timed_out','unavailable','canceled','explicitly_waived'];
  var OUTCOME_LABEL = { completed:'Completed', failed:'Failed', timed_out:'Timed out',
    unavailable:'Unavailable', canceled:'Canceled', explicitly_waived:'Waived' };

  /* MODAL-002. An instrumented ledger of every DURABLE effect. Opening,
     editing and cancelling a modal must leave every counter untouched -- this
     is the thing the correction says must be provable rather than asserted. */
  RTC.effects = RTC.effects || { runs:0, providerCalls:0, usageRecords:0, events:0,
                                 cards:0, settingsWrites:0, installs:0, participants:0 };
  function effect(kind, n){ PM56_TX.set(RTC.effects,kind,(RTC.effects[kind]||0) + (n||1)); }
  function effectsSnapshot(){ return JSON.parse(JSON.stringify(RTC.effects)); }

  /* PART-001..004. One terminal outcome per slot, and never a silent swap. */
  function setOutcome(runId, pid, outcome, opts){
    if(findRun(runId)?.crew?.planBinding)return {ok:false,error:'plan_work_owner_required'};
    opts = opts || {};
    var run = findRun(runId); if(!run) return { ok:false, error:'run_not_found' };
    var p = participant(run, pid); if(!p) return { ok:false, error:'participant_not_found' };
    if(OUTCOMES.indexOf(outcome) < 0) return { ok:false, error:'invalid_outcome' };
    if(outcome === 'explicitly_waived' && !opts.reason)
      return { ok:false, error:'waiver_requires_reason' };
    p.attempts.push({ schema:'pm.collaboration.participant_disposition.v1',
      attempt_id:'att-'+p.id+'-'+(p.attempts.length+1),
      outcome:outcome, at:nowIso(),
      requested_identity:p.requestedModelId, effective_identity:p.effectiveModelId,
      reason:opts.reason || null, epoch:run.stopEpoch });
    p.outcome = outcome;
    p.status = outcome==='completed' ? 'done'
             : outcome==='explicitly_waived' ? 'disabled'
             : outcome==='canceled' ? 'disabled' : 'failed';
    if(outcome === 'explicitly_waived')
      p.waiver = { actor:opts.actor || 'user', reason:opts.reason,
                   at:nowIso(), currentness:run.definitionRevision };
    return { ok:true, participant:p };
  }

  /* PART-004. Retry = a NEW attempt identity on the SAME slot. The old failed
     attempt is preserved, never overwritten. */
  function retryParticipant(runId, pid){
    if(findRun(runId)?.crew?.planBinding)return {ok:false,error:'plan_work_owner_required'};
    var run=findRun(runId); if(!run) return { ok:false, error:'run_not_found' };
    var p=participant(run,pid); if(!p) return { ok:false, error:'participant_not_found' };
    if(!p.outcome) return { ok:false, error:'slot_not_terminal' };
    var before=p.attempts.length;
    p.outcome=null; p.status='working'; p.current='Retrying — new attempt identity.';
    p.attempts.push({ attempt_id:'att-'+p.id+'-'+(before+1)+'r', outcome:'in_flight',
      at:nowIso(), requested_identity:p.requestedModelId,
      effective_identity:p.effectiveModelId, reason:'retry', epoch:run.stopEpoch });
    return { ok:true, participant:p, priorAttempts:before };
  }

  /* PART-003. Replacement is EXPLICIT and creates a new assignment revision.
     The original attempt stays in history and the label never lies about which
     model ran. */
  function replaceParticipant(runId, pid, modelId, reason){
    if(findRun(runId)?.crew?.planBinding)return {ok:false,error:'plan_work_owner_required'};
    var run=findRun(runId); if(!run) return { ok:false, error:'run_not_found' };
    var p=participant(run,pid); if(!p) return { ok:false, error:'participant_not_found' };
    if(!reason) return { ok:false, error:'replacement_requires_reason' };
    var m=modelById(modelId); if(!m) return { ok:false, error:'model_unavailable' };
    p.assignmentRevision++;
    p.attempts.push({ attempt_id:'att-'+p.id+'-r'+p.assignmentRevision, outcome:'replaced',
      at:nowIso(), requested_identity:p.requestedModelId, effective_identity:p.effectiveModelId,
      reason:reason, epoch:run.stopEpoch });
    p.requestedModelId=modelId; p.requestedModelName=modelLabel(modelId);
    p.effectiveModelId=modelId;  p.effectiveModelName=modelLabel(modelId);
    p.substitutionReason='Explicitly replaced by the user: '+reason;
    p.outcome=null; p.status='working';
    return { ok:true, participant:p, assignmentRevision:p.assignmentRevision };
  }

  /* PART-020, PART-004. Epoch fencing: a result carrying a stale epoch or a
     superseded assignment revision is retained as REJECTED evidence and can
     never count toward a vote or a completion. */
  RTC.rejectedCallbacks = RTC.rejectedCallbacks || [];
  function acceptCallback(runId, pid, payload){
    if(findRun(runId)?.crew?.planBinding)return {ok:false,error:'plan_work_owner_required'};
    var run=findRun(runId); if(!run) return { ok:false, error:'run_not_found' };
    var p=participant(run,pid); if(!p) return { ok:false, error:'participant_not_found' };
    var why=null;
    if(payload.epoch !== run.stopEpoch)                                why='stale_epoch';
    else if(payload.assignmentRevision != null &&
            payload.assignmentRevision !== p.assignmentRevision)       why='stale_assignment_revision';
    else if(run.status==='canceled')                                   why='run_canceled';
    if(why){
      RTC.rejectedCallbacks.push({ runId:runId, participantId:pid, reason:why,
        at:nowIso(), payload:payload, retained_as_evidence:true });
      return { ok:false, error:why, retained_as_evidence:true };
    }
    return setOutcome(runId, pid, payload.outcome || 'completed', payload);
  }

  /* WONV-003, PART-012. An ACTIVE Wonderer abstains by default and leaves the
     denominator entirely -- it is not an oppose, and it does not depress the
     support percentage. Only admitted, current, completed attempts vote
     (PART-009). */
  function voteTally(run){
    if(window.PM56_BRAINSTORM?.owns(run.id))return window.PM56_BRAINSTORM.tally(run);
    var support=0, oppose=0, abstain=0, ineligible=0, i, p;
    for(i=0;i<run.participants.length;i++){
      p=run.participants[i];
      if(p.additiveRoleKind==='wonderer' && p.status!=='disabled'){ abstain++; continue; }
      /* Every producer writes `grill_me`; this branch used to test `grill`,
         so it never fired and a Grill Me slot carrying a vote would have been
         counted without ever being configured as an ordinary voting role. */
      if((p.additiveRoleKind==='grill_me'||p.additiveRoleKind==='grill') && !p.votingRole){ abstain++; continue; }
      if(p.outcome && p.outcome!=='completed'){ ineligible++; continue; }
      if(!p.outcome && p.status!=='done'){ ineligible++; continue; }
      if(p.vote==='oppose') oppose++; else if(p.vote==='support') support++; else abstain++;
    }
    var denom=support+oppose;
    return { support:support, oppose:oppose, abstain:abstain, ineligible:ineligible,
             denominator:denom,
             support_pct: denom ? Math.round(support*100/denom) : null,
             quorum: denom>0 && support!==oppose ? 'reached' : (denom===0 ? 'none' : 'tie'),
             tie: denom>0 && support===oppose };
  }

  /* PART-007..008, PART-016..019. The completion predicate for each kind. A
     provider turn ending is never enough, and a partial result never
     finalises as a full one. */
  /* The participant slot that IS the coordinator, when one exists. */
  function coordinatorSlot(run){
    var c=run.coordinator; if(!c) return null;
    if(typeof c==='string') return participant(run,c);
    if(c.participant_id) return participant(run,c.participant_id);
    for(var i=0;i<run.participants.length;i++) if(run.participants[i].isCoordinator) return run.participants[i];
    return null;
  }

  function completionProjection(run){
    if(run.crew?.planBinding)refreshPlanCrew(run.crew.planBinding.plan_id);
    var req=[], done=[], failed=[], waived=[], i, p;
    for(i=0;i<run.participants.length;i++){
      p=run.participants[i];
      if(p.required) req.push(p.id);
      if(p.outcome==='completed') done.push(p.id);
      else if(p.outcome==='explicitly_waived') waived.push(p.id);
      else if(p.outcome) failed.push(p.id);
    }
    var unresolvedRequired = req.filter(function(id){
      return done.indexOf(id)<0 && waived.indexOf(id)<0;
    });
    var outputs = run.expectedOutputs || [];
    var missingOutputs = outputs.filter(function(o){ return !o.delivered && !o.waived; })
                                .map(function(o){ return o.id; });
    /* `run.coordinator` is a DESCRIPTOR ({kind,label}), not a participant id,
       so `participant(run, run.coordinator)` was always undefined and this
       predicate could never become true -- a failed coordinator read as a
       healthy run. Resolve the coordinator's slot the way the roster does:
       by its explicit `participant_id` when it names one, otherwise by the
       slot flagged `isCoordinator`. A `parent_assistant` coordinator has no
       participant slot and legitimately cannot fail this way. */
    var coordinatorFailed = !!(run.coordinator && (function(){
      var c=coordinatorSlot(run);
      return c && c.outcome && c.outcome!=='completed';
    })());
    var tally = run.kind==='brainstorm' ? voteTally(run) : null;
    var reason=null;
    if(coordinatorFailed)             reason='coordinator_failed';
    else if(unresolvedRequired.length)reason='required_participants_unresolved';
    else if(missingOutputs.length)    reason='required_outputs_missing';
    else if(tally && tally.tie)       reason='vote_tie_unresolved';
    else if(run.pendingUserDecision)  reason='pending_user_decision';
    return {
      schema:'pm.collaboration.completion_projection.v1',
      run_id:run.id, kind:run.kind,
      required_slots:req, completed_slots:done, failed_slots:failed, waived_slots:waived,
      unresolved_required:unresolvedRequired,
      output_status: missingOutputs.length ? 'incomplete' : (outputs.length?'complete':'none'),
      missing_outputs:missingOutputs,
      coordinator_failed:coordinatorFailed,
      quorum_status: tally ? tally.quorum : 'n/a',
      vote: tally,
      /* PART-007: a one-reviewer Review is a SINGLE PASS. It never claims
         corroboration, agreement, quorum or consensus. */
      review_truth: run.kind==='review' ? reviewTruth(run) : null,
      clean_completion: !reason,
      attention_reason: reason,
      /* PART-008/017: an attention-required run states what the user may do.
         A disclosed count with no admitted action is a dead end, and a silent
         coordinator hand-over is the failure this list exists to prevent. */
      attention_required: !!reason,
      allowed_actions: reason ? ATTENTION_ACTIONS[reason].slice() : []
    };
  }
  var ATTENTION_ACTIONS = {
    coordinator_failed:              ['replace_coordinator','retry_coordinator','cancel','details'],
    required_participants_unresolved:['retry','replace','waive','accept_partial','cancel','details'],
    required_outputs_missing:        ['retry','waive_output','cancel','details'],
    vote_tie_unresolved:             ['synthesize','another_round','cancel','details'],
    pending_user_decision:           ['decide','cancel','details']
  };

  function reviewTruth(run){
    var requested = (run.review && run.review.requestedPasses) || run.participants.length;
    var completed = run.participants.filter(function(p){ return p.outcome==='completed'; }).length;
    var failed    = run.participants.filter(function(p){ return p.outcome && p.outcome!=='completed' && p.outcome!=='explicitly_waived'; }).length;
    return {
      requested_passes:requested, completed_passes:completed, failed_passes:failed,
      single_pass: requested===1,
      partial: completed>0 && completed<requested,
      claims_corroboration: false,
      label: requested===1
        ? 'Single independent pass — no peer corroboration, agreement, quorum or consensus is claimed.'
        : (completed<requested
            ? 'Partial: '+completed+' of '+requested+' requested passes completed, '+failed+' failed. Not a full Multi-Pass result.'
            : 'Multi-Pass: all '+requested+' requested passes completed.')
    };
  }

  window.__PM56_COLLAB_CORRECTION = true;

  function admitCrewWork(d, ctx) {
    const valid=window.PM56_CREW?.preflight(d,ctx);
    if(!valid?.ok)return valid||{ok:false,error:'crew_protocol_unavailable'};
    const pre=startPreflight(d);if(!pre.ok)return pre;
    const existing=RTC.runs.find(r=>r.idempotency_key===d.requestKey);
    const fingerprint=window.PM56_CREW.signature(d);
    if(existing)return existing.crew?.requestFingerprint===fingerprint?{ok:true,runId:existing.id,reused:true}:{ok:false,error:'conflicting_start'};
    const participants=d.rows.map(row=>mkParticipant({...row,persona:row.persona,status:'waiting',current:'Waiting for its assignment'}));
    const run=mkRun({kind:'crew',threadId:d.threadId||ctx.state.selectedThread,title:d.name,purpose:d.purpose,
      status:'running',config:JSON.parse(JSON.stringify(d.config)),participants,
      coordinator:{kind:d.config.coordinator,label:d.config.coordinator==='parent_assistant'?'Current assistant':'Selected coordinator'},
      idempotency_key:d.requestKey,definitionRevision:d.policyRevision||1});
    participants.forEach(p=>p.runId=run.id);
    window.PM56_CREW.admit(run,d,ctx,fingerprint);
    RTC.runs.push(run);effect('runs');effect('cards');effect('participants',participants.length);effect('events');
    // Local calculations create no provider call or billed Usage record.
    attachCardToThread(ctx,run);
    run.messages.push(mkMsg(run,{senderKind:'coordinator',senderName:'Coordinator',messageType:'message',body:'Three bounded assignments admitted. Waiting dependencies are pending; output contracts determine completion.'}));
    document.dispatchEvent(new CustomEvent('pm56:crew-example-admitted',{detail:{runId:run.id,rerun:String(d.requestKey).startsWith('crew-rerun:')}}));
    return {ok:true,runId:run.id,reused:false};
  }

  /* =====================================================================
     18. RESET + PUBLIC SURFACE
     ===================================================================== */
  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function (ctx, btn, ev) {
    restoreFixture();
    UI.expanded = {}; UI.more = {}; UI.selectedFindings = {};
    UI.face = {}; UI.settling = {}; UI.arriving = {}; UI.cancelAsk = {}; UI.last = {}; UI.doneMark = {}; UI.sentTo = {};
    UI.prov = {}; UI.waiting = {}; UI.allLanes = {};
    LANE_SEEN = {}; LANE_STREAM = {};
    return false;
  });

  /* Batch 18 continuation. These are adapters of THIS collaboration owner, not
     parallel run/message stores. Schedules carry frozen definitions; no provider
     session, usage, or server persistence is asserted by the local adapter. */
  const scheduledCopy=x=>JSON.parse(JSON.stringify(x));
  const scheduledBad=(error,message)=>({ok:false,error,message:message||error.replaceAll('_',' ')});
  function scheduledDestinationBasis(run,d){
    return {run_id:run.id,kind:run.kind,thread_id:run.threadId,definition_revision:run.definitionRevision,
      participant_id:d.participantId||null,assignments:run.participants.map(p=>({id:p.id,revision:p.assignmentRevision,model:p.requestedModelId,effective_model:p.effectiveModelId,provider:p.requestedProviderId,account:p.requestedAccountId,persona:p.requestedPersona}))};
  }
  function freezeScheduledDestination(d,scope){
    const r=findRun(d?.refId);if(!r||r.threadId!==scope.threadId||d.destinationKind!==r.kind)return scheduledBad('destination_scope_mismatch');
    const destination={kind:d.kind,refId:r.id,destinationKind:r.kind,participantId:d.participantId||null,label:d.label||r.title,detail:d.detail||'',glyph:d.glyph||KIND_ICON[r.kind],scheduled_binding:scheduledDestinationBasis(r,d)};
    const v=validateScheduledDestination(destination,scope);return v.ok?{ok:true,destination:PM56_ARTIFACTS.freeze(destination)}:v;
  }
  function validateScheduledDestination(d,scope,publishedMessage){
    const r=findRun(d?.refId);if(!r||r.threadId!==scope.threadId||!EXT.ctx().state.threads.some(t=>t.id===scope.threadId&&(t.projectId||'pm')===scope.projectId))return scheduledBad('destination_not_found');
    if(!['workflow','participant'].includes(d.kind)||d.destinationKind!==r.kind||!d.scheduled_binding||JSON.stringify(d.scheduled_binding)!==JSON.stringify(scheduledDestinationBasis(r,d)))return scheduledBad('destination_generation_changed');
    if(r.crew?.planBinding){const pr=PM56_PLANS.runs()[r.crew.planBinding.plan_run_id];if(!pr||['completed','cancelled','canceled','failed'].includes(pr.state))return scheduledBad('destination_ended');if(pr.state!=='running')return scheduledBad('destination_not_accepting');}
    /* IMPACT A1-20: a born-waiting run (status running, nothing started) does not accept deliveries either */
    if(r.status!=='running'||presentState(r)==='waiting')return scheduledBad(['completed','canceled','cancelled','failed'].includes(r.status)?'destination_ended':'destination_not_accepting');
    if(d.kind==='participant'&&!participant(r,d.participantId)||d.kind==='workflow'&&d.participantId)return scheduledBad('participant_not_found');
    if(window.PM56_ROOM?.owns(r.id)){
      const v=PM56_ROOM.canSend(r.id,d);
      if(!v.ok){
        // Post-delivery revalidation may observe THIS operation's pending inbox.
        // Another pending input must still hold; identity alone is not sufficient.
        const msg=publishedMessage,shared=msg&&r.messages.find(x=>x.id===msg.id),thread=EXT.ctx().state.threads.find(t=>t.id===r.threadId);
        const own=v.error==='finish_pending_delivery'&&shared&&thread?.messages.includes(shared)&&r.chatRoom.lastUserMessageId===msg.id&&shared.viaSchedule&&shared.scheduledDispatchId===msg.scheduledDispatchId&&shared.body===msg.body&&shared.time===msg.time&&JSON.stringify(shared.attachments)===JSON.stringify(msg.attachments)&&JSON.stringify(shared.recipientIds)===JSON.stringify(d.participantId?[d.participantId]:r.participants.map(p=>p.id));
        if(!own)return scheduledBad(v.reason||v.error||'destination_not_accepting');
      }
    }
    return {ok:true,run:r};
  }
  function deliverScheduledMessage(message,d){
    const TX=PM56_TX;if(!TX.isActive())return scheduledBad('collaboration_transaction_required');
    const c=EXT.ctx(),scope=PM56_GOAL.scope(d.scheduled_binding?.thread_id),v=scope&&validateScheduledDestination(d,scope);
    if(!v?.ok)return v||scheduledBad('destination_not_found');
    const r=v.run,t=c.state.threads.find(t=>t.id===r.threadId),old=r.messages.find(m=>m.id===message.id);
    const recipients=d.participantId?[d.participantId]:r.participants.map(p=>p.id);
    const deliveryKey=JSON.stringify([message.id,message.body,message.attachments,d.scheduled_binding,message.time]);
    if(old)return old.scheduled_delivery_key===deliveryKey&&t.messages.includes(old)?{ok:true,replayed:true,message_id:old.id}:scheduledBad('collaboration_message_conflict');
    if(t.messages.some(m=>m.id===message.id))return scheduledBad('collaboration_message_conflict');
    for(const a of message.attachments||[]){const retained=PM56_ARTIFACTS.retain(a.snapshot_ref,{kind:'collaboration_message',id:message.id});if(!retained.ok)TX.fail(retained.error);}
    const current=validateScheduledDestination(d,scope);if(!current.ok)TX.fail(current.error);
    const shared={...message,...mkMsg(r,{id:message.id,senderKind:'user',senderName:'You',messageType:'message',body:message.body,recipientIds:recipients,createdAt:message.time}),scheduled_delivery_key:deliveryKey,attachment_refs:message.attachments};
    // Construct the final object BEFORE either append, so rollback fingerprints
    // and both projections refer to the same completed message, not two copies.
    TX.append(r,'messages',shared);c.appendMessage(shared,t);
    TX.set(r,'scheduledDeliveries',(r.scheduledDeliveries||[]).concat({message_id:shared.id,recipient_ids:recipients.slice(),at:shared.time}));
    const final=validateScheduledDestination(d,scope);if(!final.ok)TX.fail(final.error);
    if(r.chatRoom){TX.set(r.chatRoom,'summary',null);TX.set(r.chatRoom,'lastUserMessageId',shared.id);TX.set(r.chatRoom,'pendingRecipientIds',recipients.slice());TX.set(r.chatRoom,'deliveries',(r.chatRoom.deliveries||[]).concat({messageId:shared.id,recipientIds:recipients.slice()}));}
    return {ok:true,message_id:shared.id,recipient_ids:recipients};
  }
  function planCrewSteps(plan){return (plan.revisions[plan.version]||[]).filter(b=>b.t==='plan_step');}
  function planCrewBasis(x){const y=scheduledCopy(x);delete y.content_key;return y;}
  function preparePlanCrew(planId,d){
    const plan=PM56_PLANS.get(planId),expected=PM56_PLANS.admissionSnapshot(planId);
    if(!plan||plan.status!=='ready'||!plan.workRef||!expected)return scheduledBad('plan_not_ready_for_crew');
    if(d?.kind!=='crew'||!Array.isArray(d.rows)||!d.rows.length||d.rows.length>8||new Set(d.rows.map(r=>r.rowId)).size!==d.rows.length)return scheduledBad('crew_configuration_required');
    if(d.scheduleIntent&&JSON.stringify(d.scheduleIntent.expected)!==JSON.stringify(expected))return scheduledBad('plan_changed_during_crew_configuration');
    const all=planCrewSteps(plan),leaves=all.filter(s=>!all.some(c=>c.parent_step_id===s.plan_step_id));
    if(d.rows.length>leaves.length)return scheduledBad('crew_more_required_slots_than_work','Choose at most '+leaves.length+' participants. Each required slot needs an actual bounded assignment.');
    const participants=[];
    for(const row of d.rows){const m=modelById(row.requestedModelId);if(!m||m.status!=='ready'||UNAVAILABLE_DEMO[m.id]||!row.role?.trim()||!row.persona)return scheduledBad('crew_route_unavailable',m&&UNAVAILABLE_DEMO[m.id]?offlineSentence(m.id):'Resolve every requested model and role before scheduling; this path never substitutes.');
      participants.push({id:row.rowId,role:row.role,model_id:m.id,model_name:m.name,provider_id:m.provider,account_id:m.accountId,persona:row.persona,effort:row.requestedEffort||'',fast:!!row.requestedFast,additive_role:row.additiveRoleKind||'none'});}
    if(d.wonderer||d.grillMe)return scheduledBad('scheduled_specialist_adapter_unavailable','Optional discovery specialists need their workflow adapter; this bounded execution does not simulate them.');
    if(d.config?.coordinator&&d.config.coordinator!=='parent_assistant')return scheduledBad('scheduled_coordinator_adapter_unavailable','Choose Current assistant for this bounded local execution. No dedicated provider coordinator is invoked.');
    if(d.config?.assignmentStrategy==='adaptive')return scheduledBad('scheduled_adaptive_adapter_unavailable','Use frozen assignments for this local schedule; adaptive reassignment is not simulated.');
    const requested=Number(d.config?.parallelism||1);if(!Number.isInteger(requested)||requested<1||requested>8)return scheduledBad('invalid_crew_concurrency');
    const result={schema:'pm.concept.scheduled_crew_definition.v1',kind:'crew',plan_id:planId,plan_version:plan.version,plan_hash:expected.hash,expected:scheduledCopy(expected),name:d.name||plan.title,purpose:d.purpose||plan.title,
      config:scheduledCopy(d.config||{}),participants,assignments:leaves.map((s,i)=>({plan_step_id:s.plan_step_id,participant_slot_id:participants[i%participants.length].id,expected_outcome:s.text})),
      requested_concurrency:requested,effective_concurrency:1,execution_adapter:'existing_plan_bounded_local_work',execution_disclosure:'Local work runs sequentially under the frozen roster. No provider sessions, tokens or cost are reported.'};
    result.content_key=PM56_ARTIFACTS.key(result);return {ok:true,snapshot:PM56_ARTIFACTS.freeze(result)};
  }
  function validatePlanCrew(x,planId,committed){
    const p=PM56_PLANS.get(planId);if(!x||x.schema!=='pm.concept.scheduled_crew_definition.v1'||x.plan_id!==planId||x.kind!=='crew'||!Array.isArray(x.participants)||!x.participants.length||!Array.isArray(x.assignments))return scheduledBad('crew_configuration_required');
    if(PM56_ARTIFACTS.key(planCrewBasis(x))!==x.content_key)return scheduledBad('crew_definition_changed');
    if(x.kind!=='crew'||x.participants.length>8||!x.config||typeof x.config!=='object'||Array.isArray(x.config)||x.participants.some(p=>typeof p.id!=='string'||!p.id||typeof p.role!=='string'||!p.role.trim()||typeof p.persona!=='string'||!p.persona)||x.config.coordinator&&x.config.coordinator!=='parent_assistant'||x.config.assignmentStrategy==='adaptive'||!Number.isInteger(x.requested_concurrency)||x.requested_concurrency<1||x.requested_concurrency>8)return scheduledBad('invalid_crew_configuration');
    if(!p||p.version!==x.plan_version||PM56_PLANS.hash(planId)!==x.plan_hash||JSON.stringify(PM56_PLANS.admissionSnapshot(planId))!==JSON.stringify(x.expected))return scheduledBad('crew_plan_binding_changed');
    if(committed&&RTC.scheduledDefinitions?.[x.content_key]!==x)return scheduledBad('crew_definition_not_committed');
    const leaves=planCrewSteps(p).filter(s=>!planCrewSteps(p).some(c=>c.parent_step_id===s.plan_step_id));
    if(x.effective_concurrency!==1||x.assignments.length!==leaves.length||new Set(x.participants.map(p=>p.id)).size!==x.participants.length||new Set(x.assignments.map(a=>a.plan_step_id)).size!==leaves.length)return scheduledBad('crew_assignment_invalid');
    for(const a of x.assignments)if(!leaves.some(s=>s.plan_step_id===a.plan_step_id&&s.text===a.expected_outcome)||!x.participants.some(p=>p.id===a.participant_slot_id))return scheduledBad('crew_assignment_invalid');
    for(const q of x.participants){const m=modelById(q.model_id);if(!m||m.status!=='ready'||UNAVAILABLE_DEMO[m.id]||m.provider!==q.provider_id||m.accountId!==q.account_id)return scheduledBad('crew_route_unavailable',m&&UNAVAILABLE_DEMO[m.id]?offlineSentence(m.id):undefined);if(!x.assignments.some(a=>a.participant_slot_id===q.id))return scheduledBad('crew_assignment_missing');}
    return {ok:true};
  }
  function commitPlanCrewDefinition(snapshot,planId){
    if(!PM56_TX.isActive())return scheduledBad('crew_transaction_required');const v=validatePlanCrew(snapshot,planId,false);if(!v.ok)return v;
    const prior=RTC.scheduledDefinitions?.[snapshot.content_key];if(prior){if(JSON.stringify(prior)!==JSON.stringify(snapshot))return scheduledBad('crew_definition_conflict');return {ok:true,snapshot:prior};}
    const frozen=PM56_ARTIFACTS.freeze(scheduledCopy(snapshot));PM56_TX.set(RTC,'scheduledDefinitions',{...(RTC.scheduledDefinitions||{}),[snapshot.content_key]:frozen});return {ok:true,snapshot:frozen};
  }
  function admitPlanCrew(snapshot,planRun){
    const TX=PM56_TX;if(!TX.isActive())return scheduledBad('crew_transaction_required');const valid=validatePlanCrew(snapshot,planRun.plan_id,true);if(!valid.ok)return valid;
    const id='crew-'+planRun.plan_run_id,old=findRun(id);if(old)return old.crew?.planBinding?.plan_run_id===planRun.plan_run_id&&old.crew.planBinding.definition_key===snapshot.content_key?{ok:true,run:old,replayed:true}:scheduledBad('crew_admission_conflict');
    if(RTC.runs.some(r=>r.crew?.planBinding?.plan_id===planRun.plan_id&&!['completed','canceled','failed'].includes(r.status)))return scheduledBad('crew_already_active');
    const participants=snapshot.participants.map(q=>mkParticipant({id:id+':'+q.id,runId:id,role:q.role,requestedModelId:q.model_id,persona:q.persona,requestedEffort:q.effort,requestedFast:q.fast,additiveRoleKind:q.additive_role,status:'waiting',sessionId:'local:'+id+':'+q.id,sessionIsolation:'local work adapter; no provider session'}));
    const items=PM56_TODOS.get(planRun.thread_id)||[];
    const assignments=snapshot.assignments.map(a=>{const item=items.find(t=>t.run_id===planRun.plan_run_id&&(t.plan_step_ids||[]).includes(a.plan_step_id));if(!item)TX.fail('crew_todo_mapping_missing');return {...a,todo_id:item.todo_id,participant_id:id+':'+a.participant_slot_id};});
    const run=mkRun({id,kind:'crew',threadId:planRun.thread_id,title:snapshot.name,purpose:snapshot.purpose,status:'running',participants,config:scheduledCopy(snapshot.config),coordinator:{kind:'parent_assistant'},idempotency_key:planRun.plan_run_id,config_fingerprint:snapshot.content_key,
      crew:{planBinding:{plan_id:planRun.plan_id,plan_run_id:planRun.plan_run_id,plan_version:planRun.plan_version,plan_hash:planRun.plan_hash,definition_key:snapshot.content_key},assignments,definition:snapshot},expectedOutputs:assignments.map(a=>({id:id+':output:'+a.plan_step_id,todo_id:a.todo_id,expected_outcome:a.expected_outcome,delivered:false}))});
    run.executionDisclosure=snapshot.execution_disclosure;run.usage={inputTokens:null,outputTokens:null,costUsd:null,not_measured:true};
    TX.set(RTC,'runs',RTC.runs.concat(run));
    const thread=EXT.ctx().state.threads.find(t=>t.id===planRun.thread_id);EXT.ctx().appendMessage({id:'card-'+id,role:'system',type:'collab-run',runId:id,time:planRun.created_at},thread);
    effect('runs');effect('cards');effect('participants',participants.length);
    return {ok:true,run};
  }
  function verifyPlanCrewAdmission(snapshot,planRun,run){
    if(!run||findRun(run.id)!==run||run.id!=='crew-'+planRun.plan_run_id||run.kind!=='crew'||run.threadId!==planRun.thread_id||run.status!=='running'||run.config_fingerprint!==snapshot.content_key||run.crew?.definition!==snapshot)return scheduledBad('crew_admission_binding_changed');
    const binding={plan_id:planRun.plan_id,plan_run_id:planRun.plan_run_id,plan_version:planRun.plan_version,plan_hash:planRun.plan_hash,definition_key:snapshot.content_key};
    if(JSON.stringify(run.crew.planBinding)!==JSON.stringify(binding)||JSON.stringify(run.config)!==JSON.stringify(snapshot.config)||run.participants.length!==snapshot.participants.length)return scheduledBad('crew_admission_binding_changed');
    const items=PM56_TODOS.get(planRun.thread_id)||[];
    const expected=snapshot.assignments.map(a=>{const item=items.find(t=>t.run_id===planRun.plan_run_id&&(t.plan_step_ids||[]).includes(a.plan_step_id));return item?{...a,todo_id:item.todo_id,participant_id:run.id+':'+a.participant_slot_id}:null;});
    if(expected.some(x=>!x)||JSON.stringify(expected)!==JSON.stringify(run.crew.assignments))return scheduledBad('crew_admission_binding_changed');
    for(const q of snapshot.participants){const p=run.participants.find(p=>p.id===run.id+':'+q.id);if(!p||p.runId!==run.id||p.requestedModelId!==q.model_id||p.effectiveModelId!==q.model_id||p.requestedAccountId!==q.account_id||p.requestedProviderId!==q.provider_id||p.requestedPersona!==q.persona||p.role!==q.role||p.outcome!==null)return scheduledBad('crew_admission_binding_changed');}
    return validatePlanCrew(snapshot,planRun.plan_id,true);
  }
  function refreshPlanCrew(planId){
    for(const r of RTC.runs.filter(r=>r.crew?.planBinding?.plan_id===planId)){
      const b=r.crew.planBinding,pr=PM56_PLANS.runs()[b.plan_run_id],p=PM56_PLANS.get(planId);if(!pr||!p)continue;
      const state=pr.state==='completed'?'completed':pr.state==='cancelled'||pr.state==='canceled'?'canceled':pr.state==='paused'?'paused':['waiting_window','waiting_quota'].includes(pr.state)?'waiting':p.attention?'blocked':'running';
      PM56_TX.set(r,'status',state);PM56_TX.set(r,'blockedReason',p.attention?.reason||null);
      const items=PM56_TODOS.get(r.threadId)||[];
      PM56_TX.set(r,'expectedOutputs',r.crew.assignments.map(a=>{const summary=PM56_TODOS.outcomeSummary(r.threadId,[a.todo_id]);return {id:r.id+':output:'+a.plan_step_id,todo_id:a.todo_id,expected_outcome:a.expected_outcome,delivered:summary.ok,evidence_refs:summary.evidenceRefs||[]};}));
      for(const q of r.participants){const assigned=r.crew.assignments.filter(a=>a.participant_id===q.id).map(a=>items.find(t=>t.todo_id===a.todo_id)).filter(Boolean),done=assigned.length>0&&assigned.every(t=>['completed','skipped'].includes(t.status)&&PM56_TODOS.outcomeSummary(r.threadId,[t.todo_id]).ok);
        PM56_TX.set(q,'status',done?'done':state==='canceled'?'disabled':assigned.some(t=>t.status==='in_progress')?'working':'waiting');PM56_TX.set(q,'outcome',done?'completed':state==='canceled'?'canceled':null);PM56_TX.set(q,'current',assigned.map(t=>t.title+' · '+t.status).join('; '));
      }
    }
  }
  function crewExecutionGate(planId){
    const p=PM56_PLANS.get(planId),pr=p&&PM56_PLANS.runs()[p.approved?.plan_run_id];if(!pr||pr.topology!=='crew')return {ok:true};
    const r=findRun(pr.crew_run_id);if(!r||r.crew?.planBinding?.plan_run_id!==pr.plan_run_id||r.crew.planBinding.plan_hash!==pr.plan_hash)return scheduledBad('crew_binding_missing');
    const v=validatePlanCrew(r.crew.definition,planId,true);if(!v.ok)return v;
    if(r.participants.length!==r.crew.definition.participants.length||r.participants.some(q=>!r.crew.definition.participants.some(s=>q.id===r.id+':'+s.id&&q.requestedModelId===s.model_id&&q.effectiveModelId===s.model_id&&q.requestedAccountId===s.account_id&&q.requestedPersona===s.persona)))return scheduledBad('crew_assignment_changed');
    return {ok:true};
  }
  function crewWorkBinding(item){
    const pr=PM56_PLANS.runs()[item.run_id];if(!pr||pr.topology!=='crew')return {ok:true,fields:{}};
    const gate=crewExecutionGate(pr.plan_id);if(!gate.ok)return gate;
    const r=findRun(pr.crew_run_id),a=r.crew.assignments.find(a=>a.todo_id===item.todo_id&&(item.plan_step_ids||[]).includes(a.plan_step_id));if(!a)return scheduledBad('crew_assignment_missing');
    return {ok:true,fields:{collaboration_run_id:r.id,participant_id:a.participant_id,collaboration_definition_key:r.crew.planBinding.definition_key,assignment_id:r.id+':'+a.plan_step_id}};
  }
  function renderPlanCrewParticipant(run,p){
    if(!run.crew?.planBinding)return '';
    const b=run.crew.planBinding,work=PM56_TODOS.bindings(run.threadId).filter(w=>w.run_id===b.plan_run_id&&w.participant_id===p.id);
    return '<section class="plan-crew-participant-work"><h4>Admitted local work</h4><p>No provider response is implied. These rows reference the shared To-Do work bindings.</p>'+
      (work.length?work.map(w=>'<div><strong>'+esc(w.operation||w.work_kind||w.todo_id)+'</strong><span>'+esc(w.state)+' · '+esc(w.attempt_id||w.work_binding_id)+'</span></div>').join(''):'<p>No local operation admitted for this slot yet.</p>')+
      '<button class="soft-button" data-action="pd-expand" data-id="'+esc(b.plan_id)+'">Open bound Plan and evidence</button></section>';
  }
  function renderPlanCrew(ctx,run){
    refreshPlanCrew(run.crew.planBinding.plan_id);const items=PM56_TODOS.get(run.threadId)||[];
    return '<section class="plan-crew-summary"><p>'+esc(run.executionDisclosure)+'</p><p>'+run.crew.definition.participants.length+' retained participants · requested concurrency '+run.crew.definition.requested_concurrency+' · effective 1</p><div>'+run.crew.assignments.map(a=>{const t=items.find(t=>t.todo_id===a.todo_id),q=participant(run,a.participant_id);return '<div class="plan-crew-assignment"><strong>'+esc(t?.title||a.plan_step_id)+'</strong><span>'+esc(q?.role)+' · '+esc(t?.status||'unavailable')+'</span></div>';}).join('')+'</div><button class="soft-button" data-action="pd-expand" data-id="'+esc(run.crew.planBinding.plan_id)+'">Open exact Plan</button></section>';
  }

  window.PM56_COLLAB = {
    freezeScheduledDestination,validateScheduledDestination,deliverScheduledMessage,preparePlanCrew,validatePlanCrew,commitPlanCrewDefinition,admitPlanCrew,verifyPlanCrewAdmission,crewExecutionGate,crewWorkBinding,refreshPlanCrew,
    openScheduledCrew:(expected,snapshot)=>{
      if(snapshot){const v=validatePlanCrew(snapshot,snapshot.plan_id,false);if(!v.ok)return v;}
      openConfigureDraft('crew',null,false);const d=RTC.draft;
      if(snapshot){d.name=snapshot.name;d.nameEdited=true;d.purpose=snapshot.purpose;d.config=scheduledCopy(snapshot.config);d.wonderer=false;d.grillMe=false;
        d.rows=snapshot.participants.map(q=>({rowId:q.id,role:q.role,requestedModelId:q.model_id,persona:q.persona,requestedEffort:q.effort,requestedFast:q.fast,additiveRoleKind:q.additive_role}));}
      d.scheduleIntent={expected:scheduledCopy(expected)};
      /* scheduled mode (8.1): the job is the Plan's, so the hero starts from its title */
      if(!d.purpose){const p=scheduledPlan(d);if(p)d.purpose='Build the plan “'+(p.title||'')+'” as written.';}
      UI.stash=null;resetPreview();
      EXT.ctx().openDialog({type:'collab-configure'});return {ok:true};
    },
    kinds: KINDS.slice(),
    definitions: function () { return RTC.definitions; },
    /* E-02: may the assistant call a Crew by itself in this chat? (the project default, or this chat's check) */
    crewAutoAllowed: function (threadId) { return crewAutoOn(threadId == null ? ((EXT.ctx && EXT.ctx() && EXT.ctx().state || {}).selectedThread) : threadId); },
    runs: function () { return RTC.runs; },
    run: findRun,
    runsForThread: runsForThread,
    draft: function () { return RTC.draft; },
    restore: restoreFixture,
    fixture: function () { return JSON.parse(SEED_RUNS_JSON); },
    openConfigure: function (kind, reconfigureRunId, autoMode) { openConfigureDraft(kind, reconfigureRunId, autoMode); },
    buildWithCrew: function (planId, planVersion) { var c = EXT.ctx && EXT.ctx(); return c ? openBuildWithCrew(c, planId, planVersion) : false; },
    /* Additive Correction v4 (MODAL / PART / WONV). */
    effects: effectsSnapshot,
    setOutcome: setOutcome,
    retryParticipant: retryParticipant,
    replaceParticipant: replaceParticipant,
    acceptCallback: acceptCallback,
    rejectedCallbacks: function(){ return RTC.rejectedCallbacks.slice(); },
    voteTally: function(runId){ var r=findRun(runId); return r?voteTally(r):null; },
    completion: function(runId){ var r=findRun(runId); return r?completionProjection(r):null; },
    outcomeVocabulary: function(){ return OUTCOMES.slice(); },
    /* One spelling of one state word. The run status said `cancelled` while
       every other terminal vocabulary in this concept — participant outcomes,
       scheduled-message states, Plan status, Goal status — says `canceled`.
       Two spellings of the same state inside one module is a trap for anyone
       porting it, so the state word is normalised and published here. */
    runStatusVocabulary: function(){
      return ['configuring','running','paused','waiting','blocked','completed','canceled','failed'];
    },
    appendMessage:function(runId,data){var r=findRun(runId);if(!r)return null;var m=mkMsg(r,data);PM56_TX.append(r,'messages',m);return m;},
    selectedFindings:function(runId){return UI.selectedFindings[runId]||(UI.selectedFindings[runId]={});},
    admitCrewWork: admitCrewWork,
    validateStart: startPreflight,
    normalizeReview: normalizeReview,
    /* COLLAB step 1 (KIND INTERFACE): provenance of a run (IMPACT A3-03), the recorded flag a demo sets on its
       draft, the waiting sentence (IMPACT A1-20), the option catalog (A3-01) and the specialist default (A3-02) */
    provenance: provenance,
    markRecorded: function (d) { d = d || RTC.draft; if (d) d.recorded = true; return d; },
    isRecordedDraft: isRecordedDraft,
    waitingReason: waitingReason,
    /* COLLAB step 2 (KIND INTERFACE, card): the one presentation state and sentence (IMPACT A1-20), the lifecycle
       predicates that read it, COLLAB's generic card parts (a kind's cardParts(run, ctx, generic) extends them) */
    presentState: function (r) { return presentState(typeof r === 'string' ? findRun(r) : r); },
    sentenceOf: function (r) { return sentenceOf(typeof r === 'string' ? findRun(r) : r); },
    canPause: function (r) { r = typeof r === 'string' ? findRun(r) : r; return !!r && canPause(r); },
    canCancel: function (r) { r = typeof r === 'string' ? findRun(r) : r; return !!r && canCancel(r); },
    card: {
      generic: function (r, ctx) { r = typeof r === 'string' ? findRun(r) : r; var st = presentState(r); return genericCardParts(r, ctx || EXT.ctx(), faceOf(r, st), st); },
      face: function (id) { return UI.face[id] || null; },
      marks: function (r, size) { r = typeof r === 'string' ? findRun(r) : r; return clusterOf(r, size || 18, presentState(r)); },
      lanes: function (r, open) { r = typeof r === 'string' ? findRun(r) : r; return lanesOf(r, !!open); },
      track: function (r) { r = typeof r === 'string' ? findRun(r) : r; return trackOf(r, presentState(r)); },
      attention: function (r) { r = typeof r === 'string' ? findRun(r) : r; return presentState(r) === 'attention' ? attentionOf(r) : null; },
      openAction: function (r) { r = typeof r === 'string' ? findRun(r) : r; return openActionOf(r); },
      /* the card's own clock and cost phrases, so the run view's status never disagrees with the card */
      clock: function (r) { r = typeof r === 'string' ? findRun(r) : r; return clockOf(r, presentState(r)); },
      cost: function (r) { r = typeof r === 'string' ? findRun(r) : r; return costOf(r, presentState(r)); }
    },
    /* COLLAB step 3 (KIND INTERFACE, view, G-14): the run view's state and common tabs (collab-view.js draws them), open
       it, and the plan-bound Crew blocks the view shows in its Summary and a helper's own view (b18c hooks) */
    viewState: function (runId) { var V = CV(); return V && V.state ? V.state(runId) : { tab: 'overview', participantId: null }; },
    viewCommon: function (r, tab) { var V = CV(); return V && V.common ? V.common(r, tab) : ''; },
    openView: function (runId, o) { return openView(EXT.ctx(), runId, o || {}, null); },
    planCrewHtml: function (ctx, r) { r = typeof r === 'string' ? findRun(r) : r; return r && r.crew && r.crew.planBinding ? renderPlanCrew(ctx || EXT.ctx(), r) : ''; },
    planCrewParticipantHtml: function (r, p) { r = typeof r === 'string' ? findRun(r) : r; if (r && p && typeof p === 'string') p = participant(r, p); return r && p ? renderPlanCrewParticipant(r, p) : ''; },
    choices: function () { return JSON.parse(JSON.stringify(CONFIG_CHOICES)); },
    specialistDefaults: function () { return JSON.parse(JSON.stringify(SPECIALIST_DEFAULTS)); },
    /* for kind sheetParts (requests from CREW-A, STORM-A, ROOM-A, REVIEW-A): the roster's seat hue, the mark role of a
       persona, the plan's concurrency, and Review's target catalogue with its measured size lines */
    seatOf: function (d, row) { return seatOf(d || RTC.draft, row); },
    markOf: function (persona) { return markOf(persona); },
    capacity: function (d) { return capacityOf(d || RTC.draft || {}); },
    targets: function (ctx) { var c = ctx || EXT.ctx(); return TARGETS.map(function (t) { return { value: t.value, label: t.label, read: t.read, kind: t.kind, small: targetSmall(c, t.value) }; }); },
    sheet: { generic: function (d, ctx) { return genericParts(d || RTC.draft, ctx || EXT.ctx()); }, plateParts: { crew: function (d) { return crewPlateFit(d); }, review: function (d) { return reviewPlateFit(d); }, brainstorm: function (d) { return brainstormPlateFit(d); }, chat_room: function (d) { return roomPlateFit(d); } },
      /* the cast plates' one description per kind (2026-10-07): castSpec[kind](draft, live); castView(kind, draft, live,
         {key, w, modes}) draws a run view's plate in the same grammar with the run's live states */
      castSpec: CAST_SPEC, castView: castView, castRun: castRun }
  };
})();
