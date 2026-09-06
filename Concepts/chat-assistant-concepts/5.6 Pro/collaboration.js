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
 *    slots below. Crew's full panel, participant transcripts and hover-equivalent
 *    summary are instead always reachable through this module's OWN dialog
 *    overlay (`collab-open-panel` / `collab-open-participant`), which every
 *    other kind also uses as its primary "Open Panel" destination for the same
 *    reason: it never depends on Activity Detail's per-domain gating or its
 *    "all scope" per-section body (which has no per-domain override slot at
 *    all — only one aggregate `activityPanelBody` call per panel render).
 *    Exact integrator asks are in this wave's report.
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
  var KIND_ICON = { crew: 'users', brainstorm: 'brain', review: 'eye', chat_room: 'users' };
  var RUN_STATE_LABEL = {
    configuring: 'Configuring', running: 'Running', paused: 'Paused', waiting: 'Waiting',
    blocked: 'Blocked', completed: 'Completed', canceled: 'Cancelled', failed: 'Failed'
  };
  var RUN_STATE_TONE = {
    configuring: 'idle', running: 'working', paused: 'idle', waiting: 'idle',
    blocked: 'blocked', completed: 'done', canceled: 'idle', failed: 'blocked'
  };

  /* =====================================================================
     1. DEFINITIONS — Settings-sourced defaults per kind (owner doc §14).
     Settings_System.md owns the actual persisted keys; this is the read-time
     projection this module needs to prefill a modal. Field names mirror the
     `assistant.multi_agent.*` keys named in §14 so a reader can line them up.
     ===================================================================== */
  var DEFINITIONS_SEED = {
    crew: {
      coordinator: 'parent_assistant', assignmentStrategy: 'manager_directed',
      memberCount: 3, parallelism: 3, autoEnabled: false, autoComplexity: 'high',
      autoMaxMembers: 4, contextSharing: 'shared', synthesisPolicy: 'coordinator_adjudicated',
      timeLimitMinutes: 45, tokenLimit: 400000, costLimitUsd: 6
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
    msgSeq[run.id] = (msgSeq[run.id] || 0) + 1;
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
    bs.messages.push(mkMsg(bs, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Phase 1 (Intake and frontier): 9 of 15 baseline questions asked and resolved; 2 duplicates merged; 2 factual questions routed to research instead of asked. Grill Me is off, so the ceiling stays at 15.' }));
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
     5. SHARED RENDERERS — one card, one participant row, one message line,
     reused by the card, the panel and the participant transcript. Kind
     bodies (§B-E below) plug into `kindInline`/`kindPanelSections` only.
     ===================================================================== */
  var UI = { expanded: {}, more: {}, panel: null, dialogTab: {} };

  function fmtClock(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  function fmtMoney(n) { return '$' + Number(n || 0).toFixed(2); }
  function fmtTokens(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function statusChip(status, blockedReason) {
    var label = RUN_STATE_LABEL[status] || status;
    var tone = RUN_STATE_TONE[status] || 'idle';
    return '<span class="collab-status collab-status-' + esc(tone) + '" data-k="collab-status" title="' + esc(blockedReason || label) + '">' +
      '<i class="collab-status-dot"></i>' + esc(label) + '</span>';
  }

  /* Requested-versus-effective disclosure. Always renders the requested route;
     only adds the effective/reason chrome when they differ, per §2.2 "shown
     wherever the participant appears... when a selected route is unavailable
     or degraded" — showing it unconditionally for identical values would just
     be noise, and the packet's own examples only light this up on divergence. */
  function reqEff(ctx, p) {
    var out = '<span class="collab-route" data-k="collab-route">' + esc(p.requestedModelName) + '</span>';
    if (p.effectiveModelId !== p.requestedModelId || p.status === 'disabled') {
      /* Whole class names, not 'prefix-' + ternary. A static analyser (and
         tests/orphan-gate.mjs) cannot see through concatenation, so the two
         rules that style these badges read as dead CSS and were nearly
         deleted -- which would have silently stripped the colour off the
         effective-substitute and slot-disabled states. */
      out += '<span class="collab-route-eff ' + (p.status === 'disabled' ? 'collab-route-eff-failed' : 'collab-route-eff-sub') + '" data-k="collab-route-eff">' +
        ctx.icon('warning', 11) + (p.effectiveModelName ? 'effective ' + esc(p.effectiveModelName) : 'no substitute available') +
        '</span>';
    }
    return out;
  }

  var PSTATE_LABEL = { pending: 'Pending', waiting: 'Waiting', working: 'Working', blocked: 'Blocked', done: 'Done', failed: 'Failed', disabled: 'Disabled' };
  var PSTATE_TONE = { pending: 'idle', waiting: 'idle', working: 'working', blocked: 'blocked', done: 'done', failed: 'blocked', disabled: 'blocked' };

  /* Every participant row is clickable across its whole surface (§4.3 /
     COLLAB-006) — the button IS the row, not a small glyph inside it. */
  function participantRow(ctx, run, p) {
    var tone = PSTATE_TONE[p.status] || 'idle';
    return '<button class="collab-participant" data-action="collab-open-participant" data-run="' + esc(run.id) + '" data-participant="' + esc(p.id) + '" data-k="collab-p-' + esc(p.id) + '" data-tone="' + tone + '">' +
      '<span class="collab-p-avatar" aria-hidden="true">' + esc((p.name || '?').slice(0, 2).toUpperCase()) + '</span>' +
      '<span class="collab-p-copy">' +
      '<strong>' + esc(p.role) + (p.additiveRoleKind !== 'none' ? ' <i class="collab-additive-tag">' + esc(p.additiveRoleKind === 'wonderer' ? 'Wonderer' : 'Grill Me') + '</i>' : '') + '</strong>' +
      '<span class="collab-p-route">' + reqEff(ctx, p) + ' · Persona ' + esc(p.effectivePersona || p.requestedPersona) + '</span>' +
      (p.current ? '<span class="collab-p-current">' + esc(p.current) + '</span>' : '') +
      (p.blockedReason ? '<span class="collab-p-blocked">' + ctx.icon('lock', 10) + esc(p.blockedReason) + '</span>' : '') +
      (p.outcome ? '<span class="collab-p-outcome collab-p-outcome-' + esc(p.outcome) + '">' + esc(OUTCOME_LABEL[p.outcome] || p.outcome) + '</span>' : '') +
      (p.waiver ? '<span class="collab-p-waiver">waived by ' + esc(p.waiver.actor) + ' — ' + esc(p.waiver.reason) + '</span>' : '') +
      (p.attempts && p.attempts.length > 1 ? '<span class="collab-p-attempts">' + p.attempts.length + ' attempts</span>' : '') +
      '<span class="collab-p-req">' + (p.required ? 'required' : 'optional') + '</span>' +
      '</span>' +
      '<span class="collab-p-status collab-p-status-' + tone + '">' + esc(PSTATE_LABEL[p.status] || p.status) + '</span>' +
      '</button>';
  }

  var MTYPE_LABEL = { message: '', request: 'Request', response: 'Response', warning: 'Warning', conflict: 'Conflict', dependency: 'Dependency', handoff: 'Handoff', vote: 'Vote', finding: 'Finding', pass: 'Pass' };
  function messageLine(ctx, run, m) {
    var badge = MTYPE_LABEL[m.messageType] ? '<span class="collab-msg-type collab-msg-type-' + esc(m.messageType) + '">' + esc(MTYPE_LABEL[m.messageType]) + '</span>' : '';
    return '<div class="collab-msg collab-msg-' + esc(m.senderKind) + '" data-k="collab-msg-' + esc(m.id) + '">' +
      '<div class="collab-msg-head"><strong>' + esc(m.senderName) + '</strong>' + badge + '<span class="collab-msg-clock">' + esc(fmtClock(m.createdAt)) + '</span></div>' +
      '<p class="collab-msg-body">' + esc(m.body) + '</p>' +
      '</div>';
  }

  function usageStrip(run) {
    var u = run.usage || {};
    return '<div class="collab-usage" data-k="collab-usage-' + esc(run.id) + '">' +
      '<span>' + fmtTokens(u.inputTokens) + ' in</span><span>' + fmtTokens(u.outputTokens) + ' out</span><span>' + fmtMoney(u.costUsd) + '</span>' +
      '</div>';
  }

  /* =====================================================================
     6. KIND-SPECIFIC INLINE BLOCKS (expanded card — bounded, not the full
     transcript) and the one-line "current phase / latest meaningful
     activity" the collapsed card header shows (§7.3 of the packet).
     ===================================================================== */
  function latestSummary(run) {
    if (run.kind === 'crew') {
      var asg = (run.crew && run.crew.assignments) || [];
      var done = asg.filter(function (a) { return a.status === 'done'; }).length;
      var blocked = asg.filter(function (a) { return a.status === 'blocked'; }).length;
      return done + '/' + asg.length + ' assignments done' + (blocked ? ' · ' + plural(blocked, 'assignment', 'assignments') + ' blocked' : '');
    }
    if (run.kind === 'brainstorm') {
      var b = run.brainstorm || {};
      var qb = b.questionBank || {};
      var eff = qb.baselineLimit + (qb.grillMeEnabled ? qb.grillExtension : 0);
      return 'Phase: ' + (b.phase || 'intake') + ' · ' + (qb.askedIds || []).length + '/' + eff + ' questions used · ' + (b.proposals || []).length + ' proposals';
    }
    if (run.kind === 'review') {
      var r = run.review || {};
      var f = r.findings || [];
      var conf = f.filter(function (x) { return x.disposition === 'confirmed'; }).length;
      var unc = f.filter(function (x) { return x.disposition === 'uncertain'; }).length;
      var excl = (r.excludedFindings || []).length;
      return conf + ' confirmed · ' + unc + ' uncertain' + (excl ? ' · ' + excl + ' excluded (stale pack)' : '');
    }
    if (run.kind === 'chat_room') {
      var c = run.chatRoom || {};
      return 'Round ' + (c.roundsSoFar || 0) + ' of ' + ((run.config || {}).maxRounds || '—') + ' · ' + (c.turnPolicy || 'moderated') + (c.promotions && c.promotions.length ? ' · ' + c.promotions.length + ' promoted' : ' · nothing promoted yet');
    }
    return '';
  }

  function crewInline(ctx, run) {
    var c = run.crew || { assignments: [] };
    var rows = c.assignments.map(function (a) {
      var deps = a.dependsOn && a.dependsOn.length ? ' · depends on ' + a.dependsOn.join(', ') : '';
      var evidence = a.status === 'done' ? '<p class="collab-evidence">' + esc(a.evidenceNote) + '</p>' : '';
      var blockNote = a.status === 'blocked' ? '<p class="collab-blocked-note">' + ctx.icon('lock', 10) + esc((participantByRole(run, a.assignedRole) || {}).blockedReason || 'Blocked') + '</p>' : '';
      return '<div class="collab-assignment collab-assignment-' + esc(a.status) + '" data-k="collab-a-' + esc(a.id) + '">' +
        '<div class="collab-assignment-head"><strong>' + esc(a.title) + '</strong><span class="collab-assignment-status">' + esc(a.status) + '</span></div>' +
        '<p class="collab-assignment-meta">' + esc(a.assignedRole) + deps + ' · expects: ' + esc(a.expectedOutput) + '</p>' +
        evidence + blockNote +
        (a.status !== 'done' ? '<div class="collab-assignment-actions"><button class="text-button" data-action="collab-crew-complete" data-run="' + esc(run.id) + '" data-assignment="' + esc(a.id) + '">Mark complete with evidence…</button></div>' : '') +
        '</div>';
    }).join('');
    var bound = c.boundPlanId ? '<p class="collab-bound-plan">' + ctx.icon('document', 11) + 'Bound to Plan <b>' + esc(c.boundPlanId) + ' · V' + esc(c.boundPlanVersion) + '</b> and ' + plural((c.boundTodoIds || []).length, 'To-Do', 'To-Dos') + ' at build time. A Plan revision after this point requires stopping current execution first.</p>' : '';
    return bound + '<div class="collab-assignments">' + rows + '</div>';
  }
  function participantByRole(run, role) {
    var arr = run.participants;
    for (var i = 0; i < arr.length; i++) if (arr[i].role === role) return arr[i];
    return null;
  }

  function brainstormInline(ctx, run) {
    var b = run.brainstorm || {};
    var qb = b.questionBank || {};
    var eff = qb.baselineLimit + (qb.grillMeEnabled ? qb.grillExtension : 0);
    var qLine = qb.grillMeEnabled
      ? 'Maximum questions: ' + eff + ' (' + qb.baselineLimit + ' + Grill Me ' + qb.grillExtension + ')'
      : 'Maximum questions: ' + qb.baselineLimit;
    var votes = (b.votes || []).map(function (v) {
      return '<div class="collab-vote collab-vote-' + esc(v.position) + '" data-k="collab-vote-' + esc(v.id) + '"><b>' + esc(v.participantRole) + '</b> <span>' + esc(v.position) + '</span> <i>' + esc(v.confidence) + '</i><p>' + esc(v.reason) + '</p></div>';
    }).join('');
    var hard = (b.hardConstraintViolations || []).map(function (h) {
      return '<div class="collab-hardconflict" data-k="collab-hc"><strong>Disqualified regardless of vote count</strong><p>' + esc(h.approach) + ' — violates: ' + esc(h.constraint) + '</p><p class="collab-sub">' + esc(h.detail) + '</p></div>';
    }).join('');
    var dissent = (b.dissent || []).map(function (d) {
      return '<div class="collab-dissent" data-k="collab-dissent"><strong>' + ctx.icon('warning', 11) + 'Preserved dissent · ' + esc(d.participantRole) + '</strong><p>' + esc(d.reason) + '</p></div>';
    }).join('');
    var wonder = (b.wondererLeads || []).map(function (w) {
      /* One vocabulary: state + tether. The old `status`/`connection` names are
         still read so an older stored run renders rather than showing
         `undefined`, but nothing writes them any more. */
      var state = w.state || w.status || 'hypothesis';
      var tether = w.tether || w.connection || '';
      return '<div class="collab-lead" data-k="collab-lead-' + esc(w.id) + '" data-lead-state="' + esc(state) + '">' +
        '<span class="collab-lead-tag">' + esc(state) + '</span><p>' + esc(w.lead) + '</p>' +
        (w.seed ? '<p class="collab-sub">Seed: ' + esc(w.seed) + '</p>' : '') +
        '<p class="collab-sub">Tether: ' + esc(tether) + '</p></div>';
    }).join('');
    return '<p class="collab-qmax" data-k="collab-qmax">' + esc(qLine) + '</p>' +
      (votes ? '<div class="collab-votes">' + votes + '</div>' : '') +
      (hard ? '<div class="collab-hardconflicts">' + hard + '</div>' : '') +
      (dissent ? '<div class="collab-dissents">' + dissent + '</div>' : '') +
      (wonder ? '<div class="collab-leads"><strong>Wonderer leads (hypotheses)</strong>' + wonder + '</div>' : '');
  }

  var SEV_LABEL = { critical: 'Critical', major: 'Major', minor: 'Minor', suggestion: 'Suggestion' };
  var DISP_LABEL = { confirmed: 'Confirmed', rejected: 'Rejected', duplicate: 'Duplicate', uncertain: 'Uncertain' };
  function reviewInline(ctx, run) {
    var r = run.review || {};
    var pack = r.targetPack || {};
    var findings = (r.findings || []).map(function (f) {
      return '<div class="collab-finding collab-disp-' + esc(f.disposition) + '" data-k="collab-f-' + esc(f.id) + '">' +
        '<div class="collab-finding-head"><span class="collab-sev collab-sev-' + esc(f.severity) + '">' + esc(SEV_LABEL[f.severity]) + '</span>' +
        '<span class="collab-disp">' + esc(DISP_LABEL[f.disposition]) + '</span><strong>' + esc(f.claim) + '</strong></div>' +
        (f.dissent ? '<p class="collab-dissent-inline">' + ctx.icon('warning', 10) + esc(f.dissent) + '</p>' : '') +
        '</div>';
    }).join('');
    var excluded = (r.excludedFindings || []).map(function (x) {
      return '<div class="collab-finding collab-excluded" data-k="collab-fx-' + esc(x.id) + '"><strong>Excluded — different frozen pack</strong><p>' + esc(x.claim) + '</p><p class="collab-sub">target_hash ' + esc(x.targetHash) + ' vs frozen ' + esc(pack.targetHashes && pack.targetHashes.primary) + '. ' + esc(x.reason) + '</p></div>';
    }).join('');
    return '<p class="collab-targetpack" data-k="collab-targetpack">Frozen target <b>' + esc(pack.targetKind) + '</b> · hash <code>' + esc(pack.targetHashes && pack.targetHashes.primary) + '</code> · frozen ' + esc(fmtClock(pack.frozenAt)) + '</p>' +
      '<div class="collab-findings">' + findings + excluded + '</div>' +
      '<p class="collab-readonly-note">' + ctx.icon('lock', 10) + 'Review is read-only and never auto-repairs. assistant.multi_agent.review.auto_repair is locked off.</p>';
  }

  function roomInline(ctx, run) {
    var c = run.chatRoom || {};
    var recent = run.messages.slice(-4).map(function (m) { return messageLine(ctx, run, m); }).join('');
    var promos = (c.promotions || []).map(function (p) {
      return '<div class="collab-promotion" data-k="collab-promo-' + esc(p.id) + '">' + ctx.icon('check', 11) + 'Promoted to <b>' + esc(p.target) + '</b> — ' + esc(p.summary) + '</div>';
    }).join('');
    return '<div class="collab-room-recent">' + recent + '</div>' +
      (promos ? '<div class="collab-promotions">' + promos + '</div>' : '<p class="collab-sub">Nothing promoted yet — ordinary discussion never creates a To-Do, Plan or Goal on its own.</p>');
  }

  function kindInline(ctx, run) {
    if (run.kind === 'crew') return crewInline(ctx, run);
    if (run.kind === 'brainstorm') return brainstormInline(ctx, run);
    if (run.kind === 'review') return reviewInline(ctx, run);
    return roomInline(ctx, run);
  }

  /* =====================================================================
     7. THE SHARED TRANSCRIPT CARD — one shape for all four kinds (§4.1 /
     COLLAB-005). Registered once on `transcriptMessage`, declining ('') for
     every message type this module does not own so built-in cards keep
     rendering (contract §4 / plans.js and bsd.js use the same pattern).
     ===================================================================== */
  function canPause(run) { return run.status === 'running'; }
  function canResume(run) { return run.status === 'paused' || (run.status === 'waiting' && !run.blockedReason); }
  function canCancel(run) { return ['running', 'paused', 'waiting', 'blocked', 'configuring'].indexOf(run.status) >= 0; }

  function moreRow(ctx, run) {
    var pauseBtn = canPause(run)
      ? '<button class="soft-button" data-action="collab-pause" data-run="' + esc(run.id) + '">' + ctx.icon('pause', 12) + ' Pause</button>'
      : '<button class="soft-button" disabled title="Only a running workflow can pause.">' + ctx.icon('pause', 12) + ' Pause</button>';
    var resumeBtn = canResume(run)
      ? '<button class="soft-button" data-action="collab-resume" data-run="' + esc(run.id) + '">' + ctx.icon('play', 12) + ' Resume</button>'
      : '<button class="soft-button" disabled title="' + esc(run.blockedReason || 'Not paused, so there is nothing to resume.') + '">' + ctx.icon('play', 12) + ' Resume</button>';
    var cancelBtn = canCancel(run)
      ? '<button class="soft-button danger" data-action="collab-cancel" data-run="' + esc(run.id) + '">' + ctx.icon('close', 12) + ' Cancel</button>'
      : '<button class="soft-button" disabled title="Already terminal.">' + ctx.icon('close', 12) + ' Cancel</button>';
    var reconfigBtn = '<button class="soft-button" data-action="collab-open-configure" data-kind="' + esc(run.kind) + '" data-reconfigure="' + esc(run.id) + '">' + ctx.icon('edit', 12) + ' Reconfigure</button>';
    var exportBtn = '<button class="soft-button" data-action="collab-export" data-run="' + esc(run.id) + '">' + ctx.icon('download', 12) + ' Export</button>';
    var kindExtra = '';
    if (run.kind === 'review') kindExtra = '<button class="soft-button" data-action="collab-review-run-again" data-run="' + esc(run.id) + '">' + ctx.icon('refresh', 12) + ' Run Another Review</button>';
    if (run.kind === 'brainstorm') kindExtra = '<button class="soft-button" data-action="collab-brainstorm-synthesize" data-run="' + esc(run.id) + '">' + ctx.icon('sparkles', 12) + ' Synthesize Deep Plan</button>';
    if (run.kind === 'chat_room') kindExtra = '<button class="soft-button" data-action="collab-room-summarize" data-run="' + esc(run.id) + '">' + ctx.icon('document', 12) + ' Summarize Now</button>';
    return '<div class="collab-more-row" data-k="collab-more-' + esc(run.id) + '">' + pauseBtn + resumeBtn + cancelBtn + kindExtra + reconfigBtn + exportBtn + '</div>';
  }

  /* PART-008/010/016..019/023. The completion truth, on the card, in words.
     Requested-versus-completed counts, unresolved required slots, missing
     outputs, coordinator failure, quorum and ties are all stated -- a generic
     `Running` label that hides partial state is exactly what this replaces. */
  function completionLine(ctx, run) {
    var c = completionProjection(run);
    if (c.clean_completion && !c.review_truth && !c.vote) return '';
    var bits = [];
    if (c.review_truth) bits.push('<span class="collab-truth-review">' + esc(c.review_truth.label) + '</span>');
    if (c.vote) bits.push('<span class="collab-truth-vote">' +
      esc('support ' + c.vote.support + ' · oppose ' + c.vote.oppose + ' · abstain ' + c.vote.abstain +
          (c.vote.support_pct != null ? ' · ' + c.vote.support_pct + '% of ' + c.vote.denominator + ' eligible' : '') +
          (c.vote.tie ? ' · TIE — resolved by constraints, evidence and feasibility, never by response order' : '')) + '</span>');
    if (c.unresolved_required.length) bits.push('<span class="collab-truth-warn">' +
      esc(c.unresolved_required.length + ' required slot(s) unresolved') + '</span>');
    if (c.failed_slots.length) bits.push('<span class="collab-truth-warn">' + esc(c.failed_slots.length + ' failed') + '</span>');
    if (c.waived_slots.length) bits.push('<span class="collab-truth-note">' + esc(c.waived_slots.length + ' explicitly waived') + '</span>');
    if (c.missing_outputs.length) bits.push('<span class="collab-truth-warn">' +
      esc('missing required output: ' + c.missing_outputs.join(', ')) + '</span>');
    if (c.coordinator_failed) bits.push('<span class="collab-truth-warn">' +
      'Coordinator failed — needs explicit replacement, retry or cancellation. No other participant becomes coordinator.</span>');
    if (!bits.length) return '';
    return '<div class="collab-truth' + (c.clean_completion ? '' : ' collab-truth-attention') + '" data-k="collab-truth-' + esc(run.id) + '"' +
      ' data-attention="' + esc(c.attention_reason || 'none') + '" data-quorum="' + esc(c.quorum_status) + '">' +
      (c.clean_completion ? '' : '<strong>Needs attention</strong>') + bits.join('') + '</div>';
  }

  function renderCard(ctx, run) {
    var expanded = !!UI.expanded[run.id];
    var shownP = run.participants.slice(0, 4);
    var moreP = run.participants.length - shownP.length;
    var recentGeneric = run.kind !== 'chat_room' ? run.messages.slice(-3).map(function (m) { return messageLine(ctx, run, m); }).join('') : '';
    var body = expanded
      ? '<div class="collab-card-body" data-k="collab-body-' + esc(run.id) + '">' +
          '<div class="collab-participants">' + shownP.map(function (p) { return participantRow(ctx, run, p); }).join('') + (moreP > 0 ? '<button class="text-button" data-action="collab-open-panel" data-run="' + esc(run.id) + '">+' + moreP + ' more…</button>' : '') + '</div>' +
          '<div class="collab-kind-inline">' + kindInline(ctx, run) + '</div>' +
          (recentGeneric ? '<div class="collab-recent"><strong>Recent</strong>' + recentGeneric + '</div>' : '') +
          usageStrip(run) +
        '</div>'
      : '';
    return '<article class="event-card collab-card collab-kind-' + esc(run.kind) + '" data-k="collab-card-' + esc(run.id) + '" data-run-id="' + esc(run.id) + '">' +
      '<div class="collab-card-head">' +
        '<span class="collab-kind-badge">' + ctx.icon(KIND_ICON[run.kind], 13) + esc(KIND_LABEL[run.kind]) + '</span>' +
        '<strong class="collab-card-title">' + esc(run.title) + '</strong>' +
        statusChip(run.status, run.blockedReason) +
      '</div>' +
      '<p class="collab-card-meta">' + plural(run.participants.length, 'participant', 'participants') + ' · ' + esc(latestSummary(run)) + '</p>' +
      completionLine(ctx, run) +
      body +
      '<div class="collab-card-foot">' +
        '<button class="text-button" data-action="collab-toggle-expand" data-run="' + esc(run.id) + '">' + ctx.icon(expanded ? 'collapse' : 'expand', 12) + ' ' + (expanded ? 'Collapse' : 'Expand') + '</button>' +
        '<button class="soft-button" data-action="collab-open-panel" data-run="' + esc(run.id) + '">' + ctx.icon('expand', 12) + ' Open Panel</button>' +
        '<button class="soft-button" data-action="collab-message" data-run="' + esc(run.id) + '">' + ctx.icon('send', 12) + ' Message</button>' +
        '<button class="icon-button" data-action="collab-toggle-more" data-run="' + esc(run.id) + '" title="More">' + ctx.icon('more', 13) + '</button>' +
      '</div>' +
      (UI.more[run.id] ? moreRow(ctx, run) : '') +
      '</article>';
  }

  EXT.slot('transcriptMessage', function (ctx) {
    var m = ctx.m;
    if (!m || m.type !== 'collab-run') return '';
    var run = findRun(m.runId);
    if (!run) return '<div class="event-card danger"><div class="event-copy"><strong>Collaborative run missing</strong><p>runId ' + esc(m.runId) + ' was referenced but no longer exists in this session.</p></div></div>';
    return renderCard(ctx, run);
  });

  /* =====================================================================
     8. SHARED LIFECYCLE ACTIONS
     ===================================================================== */
  EXT.action('collab-toggle-expand', function (ctx, btn) { UI.expanded[btn.dataset.run] = !UI.expanded[btn.dataset.run]; ctx.renderApp(); return true; });
  EXT.action('collab-toggle-more', function (ctx, btn) { var id = btn.dataset.run; UI.more[id] = !UI.more[id]; ctx.renderApp(); return true; });

  EXT.action('collab-pause', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run || !canPause(run)) return true;
    run.status = 'paused'; run.stopEpoch += 1;
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Paused at a safe boundary. Participant state, the pending inbox and the transcript are preserved; nothing in flight was torn down.' }));
    ctx.renderApp();
    ctx.toast(KIND_LABEL[run.kind] + ' paused', 'Composer text targeting this run, if any, is kept.');
    return true;
  });
  EXT.action('collab-resume', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    if (!canResume(run)) { ctx.toast('Cannot resume', run.blockedReason || 'Not paused.'); return true; }
    run.status = 'running';
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Resumed the same run. No participant work is duplicated.' }));
    ctx.renderApp();
    ctx.toast(KIND_LABEL[run.kind] + ' resumed', 'Continuing the same run identity: ' + run.id + '.');
    return true;
  });
  EXT.action('collab-cancel', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run || !canCancel(run)) return true;
    run.status = 'canceled'; run.completedAt = nowIso(); run.stopEpoch += 1;
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Cancelled. New admissions stopped; the card, transcript, participants and artifacts remain with truthful cancelled state.' }));
    if (RT.composer.destination && RT.composer.destination.refId === run.id) {
      var buf = RT.composer.bufferFor ? RT.composer.bufferFor(ctx.state.selectedThread) : null;
      var emptyBuf = !buf || (!buf.text && !(buf.attachments && buf.attachments.length));
      if (emptyBuf) { RT.composer.destination = null; if (buf) buf.destination = null; }
      else { RT.composer.destination.label = '(ended) ' + RT.composer.destination.label; RT.composer.destination.detail = 'This workflow has ended — retarget or clear.'; }
    }
    ctx.renderApp();
    ctx.addReceipt('collab-receipt', KIND_LABEL[run.kind] + ' cancelled', run.title + ' — transcript and artifacts remain, marked cancelled.');
    return true;
  });
  EXT.action('collab-export', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    ctx.toast('Export not yet wired to a file', '`cmd.collaboration.export` is not registered in the central command catalog yet (Collaborative_Workflows.md §10). The transcript and any artifact version/hash are ready to export the moment it is.');
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
    return {
      kind: p ? 'participant' : 'workflow', destinationKind: run.kind,
      refId: run.id, participantId: p ? p.id : null,
      label: (p ? run.title + ' → ' + p.role : KIND_LABEL[run.kind] + ' · ' + run.title),
      detail: p ? 'direct to participant' : plural(run.participants.length, 'participant', 'participants'),
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
        if (['completed', 'canceled', 'failed'].indexOf(run.status) >= 0) return;
        out.push({ id: 'collab:' + run.id, kind: 'workflow', destinationKind: run.kind, refId: run.id, label: KIND_LABEL[run.kind] + ' · ' + run.title, detail: plural(run.participants.length, 'participant', 'participants'), glyph: destinationGlyph(run.kind) });
        run.participants.forEach(function (p) {
          out.push({ id: 'collab:' + run.id + ':' + p.id, kind: 'participant', destinationKind: run.kind, refId: run.id, participantId: p.id, label: run.title + ' → ' + p.role, detail: 'direct to participant', glyph: destinationGlyph(run.kind) });
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
    if (RTC.draft) RTC.draft.heldRequest = held;
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
      var ended = !run || ['completed', 'canceled', 'failed'].indexOf(run.status) >= 0;
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
     10. PARTICIPANT TRANSCRIPT + FULL PANEL — a shared dialog overlay used
     by every kind (§4.2/§4.3). This is the primary "Open Panel" destination
     for all four kinds — see honesty note 3 at the top of this file for why
     Crew never registers through `activityPanelBody`/`activityHoverCard`.
     ===================================================================== */
  function panelTabsFor(kind) {
    var t = ['overview', 'transcript', 'participants', 'usage'];
    return t;
  }
  var TAB_LABEL = { overview: 'Overview', transcript: 'Transcript', participants: 'Participants', usage: 'Usage' };

  function renderParticipantView(ctx, run, p) {
    var own = run.messages.filter(function (m) { return m.senderId === p.id; });
    var body = own.length
      ? own.map(function (m) { return messageLine(ctx, run, m); }).join('')
      : '<p class="collab-empty">No output from this participant yet. This is a truthful empty transcript, not a summary standing in for one.</p>';
    return '<div class="collab-participant-view" data-k="collab-pv-' + esc(p.id) + '">' +
      '<button class="text-button" data-action="collab-close-participant" data-run="' + esc(run.id) + '">' + ctx.icon('left', 11) + ' Back to panel</button>' +
      '<h3>' + esc(p.role) + '</h3>' +
      '<p class="collab-p-identity">Requested <b>' + esc(p.requestedModelName) + '</b>' + (p.effectiveModelId !== p.requestedModelId ? ' · effective <b>' + esc(p.effectiveModelName || 'none') + '</b>' : '') + ' · Persona ' + esc(p.effectivePersona) + '</p>' +
      (p.substitutionReason ? '<p class="collab-sub-reason">' + ctx.icon('warning', 11) + esc(p.substitutionReason) + '</p>' : '') +
      (p.blockedReason ? '<p class="collab-p-blocked">' + ctx.icon('lock', 11) + esc(p.blockedReason) + '</p>' : '') +
      '<p class="collab-p-state">State: ' + esc(PSTATE_LABEL[p.status] || p.status) + (p.current ? ' — ' + esc(p.current) : '') + '</p>' +
      '<button class="soft-button" data-action="collab-message" data-run="' + esc(run.id) + '" data-participant="' + esc(p.id) + '">' + ctx.icon('send', 12) + ' Message this participant</button>' +
      '<div class="collab-participant-transcript">' + body + '</div>' +
      '</div>';
  }

  function renderPanel(ctx, d) {
    var run = findRun(d.runId);
    if (!run) return '<section class="dialog collab-panel" style="width:min(720px,calc(100vw - 20px))"><div class="drawer-head"><strong>Collaborative run not found</strong><span class="spacer"></span><button class="icon-button" data-action="close-dialog">' + ctx.icon('close', 13) + '</button></div><div class="dialog-body"><p>runId ' + esc(d.runId) + ' no longer exists in this session.</p></div></section>';
    if (d.participantId) {
      var p = participant(run, d.participantId);
      if (p) {
        return '<section class="dialog collab-panel" style="width:min(720px,calc(100vw - 20px))"><div class="drawer-head">' +
          '<span class="event-icon">' + ctx.icon(KIND_ICON[run.kind], 13) + '</span><strong>' + esc(run.title) + '</strong><span class="spacer"></span>' +
          '<button class="icon-button" data-action="close-dialog">' + ctx.icon('close', 13) + '</button></div>' +
          '<div class="dialog-body">' + renderParticipantView(ctx, run, p) + '</div></section>';
      }
    }
    var tab = d.tab || 'overview';
    var tabs = panelTabsFor(run.kind);
    var tabStrip = '<div class="collab-tabs" role="tablist">' + tabs.map(function (t) {
      return '<button class="collab-tab' + (t === tab ? ' active' : '') + '" role="tab" aria-selected="' + (t === tab) + '" data-action="collab-panel-tab" data-run="' + esc(run.id) + '" data-tab="' + t + '">' + esc(TAB_LABEL[t]) + '</button>';
    }).join('') + '</div>';
    var body = '';
    if (tab === 'overview') body = kindInline(ctx, run) + (run.kind === 'chat_room' ? '<div class="collab-recent"><strong>Full transcript is under the Transcript tab</strong></div>' : '');
    else if (tab === 'transcript') body = '<div class="collab-full-transcript">' + (run.messages.length ? run.messages.map(function (m) { return messageLine(ctx, run, m); }).join('') : '<p class="collab-empty">No messages yet.</p>') + '</div>';
    else if (tab === 'participants') body = '<div class="collab-participants collab-participants-full">' + run.participants.map(function (p2) { return participantRow(ctx, run, p2); }).join('') + '</div>';
    else if (tab === 'usage') {
      body = usageStrip(run) + '<div class="collab-usage-table">' + run.participants.map(function (p3) {
        return '<div class="collab-usage-row"><b>' + esc(p3.role) + '</b><span>' + reqEff(ctx, p3) + '</span></div>';
      }).join('') + '</div>';
    }
    /* Crew has no extra follow-on row here: `moreRow` below already carries
       a generic Reconfigure control for every kind, and Build With Crew is
       its own invocation surface (`collab-build-with-crew`), not a per-run
       follow-on action. */
    var followOn = '';
    if (run.kind === 'review') followOn = renderReviewFollowOn(ctx, run);
    if (run.kind === 'brainstorm') followOn = renderBrainstormFollowOn(ctx, run);
    if (run.kind === 'chat_room') followOn = renderRoomFollowOn(ctx, run);
    return '<section class="dialog collab-panel" style="width:min(880px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="' + esc(run.title) + '">' +
      '<div class="drawer-head"><span class="event-icon">' + ctx.icon(KIND_ICON[run.kind], 13) + '</span><strong>' + esc(run.title) + '</strong>' + statusChip(run.status, run.blockedReason) +
      '<span class="spacer"></span><button class="icon-button" data-action="close-dialog">' + ctx.icon('close', 13) + '</button></div>' +
      tabStrip +
      '<div class="dialog-body collab-panel-body">' + body + '</div>' +
      '<div class="collab-panel-foot">' + moreRow(ctx, run) + followOn + '</div>' +
      '</section>';
  }

  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'collab-panel') return '';
    return renderPanel(ctx, d);
  });

  EXT.action('collab-open-panel', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    ctx.openDialog({ type: 'collab-panel', runId: run.id, tab: (ctx.state.dialog && ctx.state.dialog.runId === run.id && ctx.state.dialog.tab) || 'overview', participantId: null });
    return true;
  });
  EXT.action('collab-panel-tab', function (ctx, btn) {
    if (!ctx.state.dialog || ctx.state.dialog.type !== 'collab-panel') return true;
    ctx.state.dialog.tab = btn.dataset.tab; ctx.state.dialog.participantId = null;
    ctx.renderOverlays(); return true;
  });
  EXT.action('collab-open-participant', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    ctx.openDialog({ type: 'collab-panel', runId: run.id, tab: 'participants', participantId: btn.dataset.participant });
    return true;
  });
  EXT.action('collab-close-participant', function (ctx, btn) {
    if (!ctx.state.dialog || ctx.state.dialog.type !== 'collab-panel') return true;
    ctx.state.dialog.participantId = null; ctx.renderOverlays(); return true;
  });

  /* =====================================================================
     11. REVIEW FOLLOW-ON — read-only, never auto-repairs (§7.6/REVIEW-012).
     ===================================================================== */
  UI.selectedFindings = UI.selectedFindings || {};
  function renderReviewFollowOn(ctx, run) {
    var r = run.review || {};
    var sel = UI.selectedFindings[run.id] || {};
    var confirmed = (r.findings || []).filter(function (f) { return f.disposition === 'confirmed'; });
    var picks = confirmed.map(function (f) {
      return '<label class="collab-finding-pick" data-k="collab-pick-' + esc(f.id) + '"><input type="checkbox" data-action="collab-review-toggle-finding" data-run="' + esc(run.id) + '" data-finding="' + esc(f.id) + '"' + (sel[f.id] ? ' checked' : '') + (f.convertedToTodo ? ' disabled' : '') + '><span>' + esc(f.claim) + (f.convertedToTodo ? ' — <i>To-Do requested</i>' : '') + '</span></label>';
    }).join('');
    var anySelected = confirmed.some(function (f) { return sel[f.id] && !f.convertedToTodo; });
    return '<div class="collab-followon collab-review-followon" data-k="collab-review-followon-' + esc(run.id) + '">' +
      '<strong>Confirmed findings</strong>' + (picks || '<p class="collab-empty">No confirmed findings yet.</p>') +
      '<div class="collab-followon-actions">' +
      '<button class="soft-button" data-action="collab-review-create-todos" data-run="' + esc(run.id) + '"' + (anySelected ? '' : ' disabled') + '>' + ctx.icon('todo', 12) + ' Create To-Dos</button>' +
      '<button class="soft-button" data-action="collab-review-send-findings" data-run="' + esc(run.id) + '"' + (anySelected ? '' : ' disabled') + '>' + ctx.icon('send', 12) + ' Send Findings To Agent</button>' +
      '</div></div>';
  }
  EXT.action('collab-review-toggle-finding', function (ctx, btn) {
    var rid2 = btn.dataset.run, fid = btn.dataset.finding;
    UI.selectedFindings[rid2] = UI.selectedFindings[rid2] || {};
    UI.selectedFindings[rid2][fid] = !UI.selectedFindings[rid2][fid];
    ctx.renderOverlays(); return true;
  });
  EXT.action('collab-review-create-todos', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var sel = UI.selectedFindings[run.id] || {};
    var made = [];
    (run.review.findings || []).forEach(function (f) {
      if (sel[f.id] && f.disposition === 'confirmed' && !f.convertedToTodo) { f.convertedToTodo = true; made.push(f); }
    });
    if (!made.length) { ctx.toast('Nothing selected', 'Select at least one confirmed finding first.'); return true; }
    run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'request', body: 'To-Do request recorded for ' + made.length + ' confirmed finding(s): ' + made.map(function (f) { return f.claim; }).join('; ') + '. `cmd.review.create_todos` is not yet registered in the central command catalog, so this is recorded here with lineage back to each finding rather than claiming it landed on the To-Do owner’s list.' }));
    ctx.renderApp();
    ctx.toast('To-Do request recorded', made.length + ' finding(s) marked for conversion, with lineage back to their finding IDs.');
    return true;
  });
  EXT.action('collab-review-send-findings', function (ctx, btn) {
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
    var fresh = mkRun({
      kind: 'review', threadId: old.threadId, title: old.title.replace(/\s*\(re-run.*\)$/, '') + ' (re-run)',
      purpose: old.purpose, status: 'running', config: old.config,
      coordinator: old.coordinator,
      participants: old.participants.map(function (p) { return mkParticipant({ role: p.role, requestedModelId: p.requestedModelId, persona: p.requestedPersona, status: 'working', current: 'Fresh-context pass against the newly frozen pack.' }); }),
      review: { targetPack: { targetKind: old.review.targetPack.targetKind, targetRefs: old.review.targetPack.targetRefs, targetHashes: { primary: Math.random().toString(16).slice(2, 10) }, frozenAt: nowIso(), userConstraintRefs: old.review.targetPack.userConstraintRefs, acceptanceRefs: old.review.targetPack.acceptanceRefs }, findings: [], excludedFindings: [] }
    });
    fresh.participants.forEach(function (p) { p.runId = fresh.id; });
    fresh.messages.push(mkMsg(fresh, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'New review started against a freshly frozen target pack (hash ' + fresh.review.targetPack.targetHashes.primary + '). This is a new run identity — it never merges into ' + old.id + '.' }));
    RTC.runs.push(fresh);
    attachCardToThread(ctx, fresh);
    ctx.closeDialog && ctx.closeDialog();
    ctx.renderApp();
    ctx.toast('New review started', 'A new frozen target pack was captured. The prior run and its findings are untouched.');
    return true;
  });

  /* =====================================================================
     12. BRAINSTORM FOLLOW-ON — protocol phases, Grill Me mid-flow, and an
     honestly-disclosed synthesis handoff (§10.5/§8.7, BRAIN-004/BRAIN-015).
     ===================================================================== */
  var BS_PHASES = ['intake', 'blind_proposals', 'normalize', 'debate', 'evidence', 'vote', 'synthesis'];
  var BS_PHASE_LABEL = { intake: 'Intake and frontier', blind_proposals: 'Blind proposals', normalize: 'Normalize', debate: 'Debate', evidence: 'Evidence round', vote: 'Vote', synthesis: 'Synthesis' };
  function renderBrainstormFollowOn(ctx, run) {
    var b = run.brainstorm;
    var idx = BS_PHASES.indexOf(b.phase);
    var next = idx >= 0 && idx < BS_PHASES.length - 1 ? BS_PHASES[idx + 1] : null;
    var qb = b.questionBank;
    return '<div class="collab-followon collab-brainstorm-followon" data-k="collab-bs-followon-' + esc(run.id) + '">' +
      '<label class="collab-grill-toggle"><input type="checkbox" data-action="collab-brainstorm-toggle-grill" data-run="' + esc(run.id) + '"' + (qb.grillMeEnabled ? ' checked' : '') + '><span>Grill Me (raises the question maximum without resetting the ' + qb.askedIds.length + ' already asked)</span></label>' +
      (b.synthesis ? '<div class="collab-synthesis"><strong>Synthesis</strong><p>' + esc(b.synthesis.summary) + '</p><p class="collab-sub">' + esc(b.synthesis.disclosure) + '</p></div>'
        : '<button class="soft-button" data-action="collab-brainstorm-next-round" data-run="' + esc(run.id) + '"' + (next ? '' : ' disabled') + '>' + ctx.icon('play', 12) + (next ? ' Advance to ' + esc(BS_PHASE_LABEL[next]) : ' Protocol complete') + '</button>') +
      '</div>';
  }
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
  function renderRoomFollowOn(ctx, run) {
    var c = run.chatRoom;
    var lastCoord = null;
    for (var i = run.messages.length - 1; i >= 0; i--) if (run.messages[i].senderKind === 'coordinator') { lastCoord = run.messages[i]; break; }
    var promoteRow = lastCoord ? '<div class="collab-promote-row" data-k="collab-promote-row-' + esc(run.id) + '">' +
      '<span>Promote the moderator’s latest wrap-up:</span>' +
      '<button class="text-button" data-action="collab-room-promote" data-run="' + esc(run.id) + '" data-target="plan" data-message="' + esc(lastCoord.id) + '">to Plan</button>' +
      '<button class="text-button" data-action="collab-room-promote" data-run="' + esc(run.id) + '" data-target="todo" data-message="' + esc(lastCoord.id) + '">to To-Do</button>' +
      '<button class="text-button" data-action="collab-room-promote" data-run="' + esc(run.id) + '" data-target="goal" data-message="' + esc(lastCoord.id) + '">to Goal</button>' +
      '</div>' : '';
    return '<div class="collab-followon collab-room-followon" data-k="collab-room-followon-' + esc(run.id) + '">' +
      '<button class="soft-button" data-action="collab-room-next-round" data-run="' + esc(run.id) + '"' + (c.roundsSoFar >= run.config.maxRounds ? ' disabled' : '') + '>' + ctx.icon('play', 12) + ' Next Round (' + c.roundsSoFar + '/' + run.config.maxRounds + ')</button>' +
      promoteRow +
      '</div>';
  }
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
     14. SHARED CONFIGURATION MODAL (§3, COLLAB-002/COLLAB-003, CWR-002) —
     every invocation opens this, prefilled from `RTC.definitions[kind]`.
     Settings defaults prefill; they never skip it, and cancelling starts
     nothing, creates no run, no card, and no Usage.
     ===================================================================== */
  var DEFAULT_ROLE_NAMES = {
    crew: ['Migration Engineer', 'Benchmark Runner', 'Rollback Auditor', 'Extra Member'],
    brainstorm: ['Architecture', 'Product', 'Implementation', 'Adversarial Review', 'Extra Core'],
    review: ['Reviewer 1', 'Reviewer 2', 'Reviewer 3', 'Reviewer 4', 'Reviewer 5', 'Reviewer 6', 'Reviewer 7', 'Reviewer 8'],
    chat_room: ['Participant 1', 'Participant 2', 'Participant 3', 'Participant 4']
  };
  var DEFAULT_ROW_MODEL = ['sonnet46', 'opus5', 'qwen38-coder', 'glm52', 'kimi-k3', 'gpt53', 'sonnet46-personal', 'haiku46'];
  var KIND_PARTICIPANT_LIMIT = { crew: [1, 8], brainstorm: [2, 8], review: [1, 8], chat_room: [2, 8] };

  function draftRow(role, modelId, persona, additive) {
    return { rowId: rid('draftp'), role: role, requestedModelId: modelId, persona: persona || 'Implementer', requestedEffort:'', requestedFast:false, additiveRoleKind: additive || 'none' };
  }

  function openConfigureDraft(kind, reconfigureRunId, autoMode) {
    var def = RTC.definitions[kind];
    var run = reconfigureRunId ? findRun(reconfigureRunId) : null;
    var rows = [];
    if (run) {
      run.participants.filter(function (p) { return p.additiveRoleKind === 'none'; }).forEach(function (p) {
        rows.push(draftRow(p.role, p.requestedModelId, p.requestedPersona, 'none'));
      });
    } else {
      var count = kind === 'crew' ? def.memberCount : kind === 'brainstorm' ? def.coreParticipants : kind === 'review' ? def.reviewerCount : def.participantCount;
      for (var i = 0; i < count; i++) rows.push(draftRow(DEFAULT_ROLE_NAMES[kind][i] || (KIND_LABEL[kind] + ' member ' + (i + 1)), DEFAULT_ROW_MODEL[i % DEFAULT_ROW_MODEL.length], kind === 'review' ? 'Reviewer' : 'Implementer'));
    }
    var wonderer = run ? run.participants.some(function (p) { return p.additiveRoleKind === 'wonderer'; }) : false;
    var grillMe = run ? (run.brainstorm && run.brainstorm.questionBank && run.brainstorm.questionBank.grillMeEnabled) : false;
    RTC.draft = {
      kind: kind, reconfigureRunId: reconfigureRunId || null, autoMode: !!autoMode,
      name: run ? run.title : (KIND_LABEL[kind] + ' · New'),
      purpose: run ? run.purpose : '',
      rows: rows, wonderer: wonderer, grillMe: grillMe,
      config: JSON.parse(JSON.stringify(run ? run.config : def))
    };
  }

  function draftRowHtml(ctx, row, idx) {
    const pick=window.PM56_PICKERS;
    const attrs='data-row="'+esc(row.rowId)+'"';
    const fallback=UNAVAILABLE_DEMO[row.requestedModelId]?fallbackModelFor(row.requestedModelId):null;
    return '<div class="collab-participant-editor-row" data-k="collab-draftrow-'+esc(row.rowId)+'">'+
      '<div class="collab-member-name"><span class="collab-member-number">'+(idx+1)+'</span><input class="collab-field-role" aria-label="Participant role" type="text" data-collab-input="role" data-row="'+esc(row.rowId)+'" value="'+esc(row.role)+'" placeholder="Role">'+
      '<button class="icon-button" data-action="collab-modal-duplicate-participant" data-row="'+esc(row.rowId)+'" title="Duplicate participant">'+ctx.icon('copy',12)+'</button>'+
      '<button class="icon-button" data-action="collab-modal-remove-participant" data-row="'+esc(row.rowId)+'" title="Remove participant">'+ctx.icon('close',12)+'</button></div>'+
      '<div class="collab-member-pickers"><label>Model'+pick.modelButton('collab-pick-model','collab-model-'+row.rowId,row.requestedModelId,attrs)+'</label>'+
      '<label>Persona'+pick.personaButton('collab-pick-persona','collab-persona-'+row.rowId,row.persona,attrs)+'</label></div>'+
      (row.requestedEffort?'<span class="collab-config-effort">'+esc(row.requestedEffort)+(row.requestedFast?' · Fast':'')+'</span>':'')+
      (UNAVAILABLE_DEMO[row.requestedModelId]?'<span class="collab-route-eff">Requested model unavailable · '+(fallback?'Uses '+esc(modelLabel(fallback.id)):'No substitute')+'</span>':'')+'</div>';
  }
  ['model','persona'].forEach(function(kind){
    EXT.action('collab-pick-'+kind,function(ctx,btn){
      var draft=RTC.draft, row=draft&&draft.rows.find(function(r){return r.rowId===btn.dataset.row;});
      if(!row)return true;
      window.PM56_PICKERS[kind==='model'?'openModel':'openPersona'](btn,{model:row.requestedModelId,persona:row.persona,effort:row.requestedEffort,fast:row.requestedFast},function(v){
        if(RTC.draft!==draft||!draft.rows.includes(row)||!['collab-configure','collaboration-configure'].includes(ctx.state.dialog?.type))return;
        row.requestedModelId=v.model;row.persona=v.persona;row.requestedEffort=v.effort;row.requestedFast=v.fast;
        ctx.renderOverlays();
      });return true;
    });
  });

  function kindConfigFields(ctx, d) {
    if (d.kind === 'crew') {
      return '<div class="collab-field-row"><label>Coordinator<select data-collab-input="cfg-coordinator"><option value="parent_assistant"' + (d.config.coordinator === 'parent_assistant' ? ' selected' : '') + '>Parent assistant</option><option value="dedicated_synthesis_model"' + (d.config.coordinator !== 'parent_assistant' ? ' selected' : '') + '>Dedicated synthesis model</option></select></label>' +
        '<label>Assignment strategy<select data-collab-input="cfg-assignmentStrategy"><option value="manager_directed"' + (d.config.assignmentStrategy === 'manager_directed' ? ' selected' : '') + '>Manager-directed</option><option value="explicit_static"' + (d.config.assignmentStrategy === 'explicit_static' ? ' selected' : '') + '>Explicit static</option><option value="adaptive"' + (d.config.assignmentStrategy === 'adaptive' ? ' selected' : '') + '>Adaptive</option></select></label>' +
        '<label>Parallelism<input type="number" min="1" max="8" data-collab-input="cfg-parallelism" value="' + esc(d.config.parallelism) + '"></label></div>' +
        '<span class="collab-authority" title="Cannot widen this thread’s permissions">Inherits thread permissions</span>';
    }
    if (d.kind === 'brainstorm') {
      var effShown = d.config.questionLimit + (d.grillMe ? '/' + (d.config.questionLimit + d.config.grillExtension) : '');
      return '<div class="collab-field-row"><label>Debate rounds<input type="number" min="1" max="4" data-collab-input="cfg-debateRounds" value="' + esc(d.config.debateRounds) + '"></label>' +
        '<label>Research strength<select data-collab-input="cfg-externalResearch"><option value="maximum"' + (d.config.externalResearch === 'maximum' ? ' selected' : '') + '>Maximum</option><option value="standard"' + (d.config.externalResearch === 'standard' ? ' selected' : '') + '>Standard</option></select></label></div>' +
        '<p class="collab-qmax">' + (d.grillMe ? 'Maximum questions: ' + (d.config.questionLimit + d.config.grillExtension) + ' (' + d.config.questionLimit + ' + Grill Me ' + d.config.grillExtension + ')' : 'Maximum questions: ' + d.config.questionLimit) + '</p>';
    }
    if (d.kind === 'review') {
      return '<div class="collab-field-row"><label>Strategy<select data-collab-input="cfg-strategy"><option value="multi_pass"' + (d.config.strategy === 'multi_pass' ? ' selected' : '') + '>Multi-Pass Review</option><option value="single_agent"' + (d.config.strategy === 'single_agent' ? ' selected' : '') + '>Single Agent</option></select></label>' +
        '<label>Reviewers (1–8, default 3)<input type="number" min="1" max="8" data-collab-input="cfg-reviewerCount" value="' + esc(d.rows.length) + '" disabled title="Add or remove reviewer rows below to change this count."></label></div>' +
        '<label class="collab-checkbox-row"><input type="checkbox" checked disabled><span>Independent first pass <small>Always on</small></span></label>' +
        '<label class="collab-checkbox-row"><input type="checkbox" disabled><span>Auto-repair <small>Off · review only</small></span></label>';
    }
    return '<div class="collab-field-row"><label>Turn policy<select data-collab-input="cfg-turnPolicy"><option value="moderated"' + (d.config.turnPolicy === 'moderated' ? ' selected' : '') + '>Moderated</option><option value="round_robin"' + (d.config.turnPolicy === 'round_robin' ? ' selected' : '') + '>Round robin</option><option value="free_discussion"' + (d.config.turnPolicy === 'free_discussion' ? ' selected' : '') + '>Free discussion</option><option value="ask_everyone_once"' + (d.config.turnPolicy === 'ask_everyone_once' ? ' selected' : '') + '>Ask everyone once</option></select></label>' +
      '<label>Max rounds<input type="number" min="1" max="20" data-collab-input="cfg-maxRounds" value="' + esc(d.config.maxRounds) + '"></label></div>';
  }

  function renderConfigureModal(ctx) {
    var d = RTC.draft; if (!d) return '';
    var limits = KIND_PARTICIPANT_LIMIT[d.kind];
    var supportsAdditive = d.kind === 'crew' || d.kind === 'brainstorm' || d.kind === 'chat_room';
    var overLimit = d.rows.length > limits[1] || d.rows.length < limits[0];
    return '<section class="dialog collab-configure" style="width:min(760px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="Configure ' + esc(KIND_LABEL[d.kind]) + '">' +
      '<div class="drawer-head"><span class="event-icon">' + ctx.icon(KIND_ICON[d.kind], 13) + '</span><strong>' + (d.reconfigureRunId ? 'Reconfigure ' : 'Configure ') + esc(KIND_LABEL[d.kind]) + '</strong>' +
      (d.autoMode ? '<span class="meta-pill">Crew Auto</span>' : '') +
      '<span class="spacer"></span><button class="icon-button" data-action="collab-modal-cancel">' + ctx.icon('close', 13) + '</button></div>' +
      '<div class="dialog-body collab-configure-body">' +
      '<div class="collab-field-row"><label>Name<input type="text" data-collab-input="name" value="' + esc(d.name) + '"></label></div>' +
      '<div class="collab-field-row"><label>Purpose<input type="text" data-collab-input="purpose" value="' + esc(d.purpose) + '" placeholder="One line — why this run exists"></label></div>' +
      '<h4>Participants (' + d.rows.length + ', ' + limits[0] + '–' + limits[1] + ')' + (overLimit ? ' <span class="collab-limit-warn">out of range</span>' : '') + '</h4>' +
      '<div class="collab-participant-editor">' + d.rows.map(function (r, i) { return draftRowHtml(ctx, r, i); }).join('') + '</div>' +
      '<button class="text-button" data-action="collab-modal-add-participant">' + ctx.icon('plus', 12) + ' Add participant</button>' +
      '<h4>' + esc(KIND_LABEL[d.kind]) + ' configuration</h4>' +
      kindConfigFields(ctx, d) +
      (supportsAdditive ? '<div class="collab-add-specialists"><strong>Add specialists</strong>' +
        '<label class="collab-checkbox-row"><input type="checkbox" data-collab-input="wonderer"' + (d.wonderer ? ' checked' : '') + '><span title="Explores adjacent leads; labels unresearched ideas as hypotheses">Wonderer</span></label>' +
        '<label class="collab-checkbox-row"><input type="checkbox" data-collab-input="grillMe"' + (d.grillMe ? ' checked' : '') + '><span>Grill Me' + (d.kind === 'brainstorm' ? ' — raises the question maximum by ' + d.config.grillExtension : '') + '</span></label>' +
        '</div>' : '') +
      '' +
      '</div>' +
      (d.lastFailure ? '<div class="collab-start-failure" data-failure="' + esc(d.lastFailure.error) + '"><strong>Start refused · ' + esc(d.lastFailure.error) + '</strong><p>' + esc(d.lastFailure.message) + '</p></div>' : '') +
      '<div class="dialog-body-foot collab-configure-foot"><button class="soft-button" data-action="collab-modal-cancel">Cancel</button><button class="primary-button" data-action="collab-modal-commit"' + (overLimit ? ' disabled' : '') + '>' + (d.reconfigureRunId ? 'Save reconfiguration' : 'Start ' + esc(KIND_LABEL[d.kind])) + '</button></div>' +
      '</section>';
  }
  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'collab-configure') return '';
    return renderConfigureModal(ctx);
  });

  /* Runtime-created runs (committed after boot) attach ONLY to the live
     `ctx.state.threads` clone, never to `D.threads`. `D.threads` is mutated
     exactly once, at module load, for the four seed runs (see
     `attachSeedCards` above) — that happens before app.js's
     `state.threads = clone(D.threads)`. A run created after boot and later
     cleared by `reset-all` must not leave an orphaned "run missing" card
     permanently baked into `D.threads`; restricting this to `state.threads`
     means `globalReset()`'s fresh clone drops it exactly like every other
     runtime thread mutation. */
  function attachCardToThread(ctx, run) {
    var stThread = (ctx.state.threads || []).filter(function (t) { return t.id === run.threadId; })[0];
    if (stThread) { if (!Array.isArray(stThread.messages)) stThread.messages = []; stThread.messages.push({ id: 'collab-card-' + run.id, role: 'system', type: 'collab-run', runId: run.id, time: run.createdAt, sentAt: run.createdAt }); }
  }

  EXT.action('collab-open-configure', function (ctx, btn) {
    var kind = btn.dataset.kind;
    if (KINDS.indexOf(kind) < 0) return true;
    openConfigureDraft(kind, btn.dataset.reconfigure || null, btn.dataset.auto === '1');
    /* Close the wand menu first. Without this the menu stayed open BEHIND the
       modal on all four kinds, so the dialog was not modal in practice and the
       menu's own outside-click handling fought the dialog's. goals.js and
       assistant-features.js already close the menu before opening a dialog;
       this now matches. */
    ctx.closeMenu && ctx.closeMenu();
    ctx.closeDialog && ctx.closeDialog();
    ctx.openDialog({ type: 'collab-configure' });
    return true;
  });
  /* MODAL-004/MODAL-012: cancel is a LOCAL view action. It discards the draft,
     emits no domain event, and restores a held natural-language request intact
     to the composer rather than running it with defaults. */
  EXT.action('collab-modal-cancel', function (ctx) {
    var d = RTC.draft;
    var held = d && d.heldRequest;
    RTC.draft = null;
    ctx.closeDialog();
    if (held) {
      var CS = window.PM56_COMPOSER_STATE;
      /* Prefer the durable hold: it returns the exact text AND attachments and
         clears the hold in one operation, so a restored request cannot later
         be released a second time. */
      if (CS && CS.restoreHeldRequest && CS.heldRequest && CS.heldRequest(held.threadId)) CS.restoreHeldRequest(held.threadId);
      else if (CS && CS.setBuffer) CS.setBuffer(held.threadId, held.text, held.attachments || []);
      else if (ctx.state) ctx.state.composer = held.text;
      ctx.renderApp();
      ctx.toast('BrainStorm cancelled', 'Your request was returned to the composer exactly as written. Nothing ran, and nothing ran with defaults.');
    }
    return true;
  });
  EXT.action('collab-modal-add-participant', function (ctx) {
    var d = RTC.draft; if (!d) return true;
    d.rows.push(draftRow((KIND_LABEL[d.kind] + ' member ' + (d.rows.length + 1)), DEFAULT_ROW_MODEL[d.rows.length % DEFAULT_ROW_MODEL.length], d.kind === 'review' ? 'Reviewer' : 'Implementer'));
    ctx.renderOverlays(); return true;
  });
  EXT.action('collab-modal-remove-participant', function (ctx, btn) {
    var d = RTC.draft; if (!d) return true;
    d.rows = d.rows.filter(function (r) { return r.rowId !== btn.dataset.row; });
    ctx.renderOverlays(); return true;
  });
  EXT.action('collab-modal-duplicate-participant', function (ctx, btn) {
    var d = RTC.draft; if (!d) return true;
    var src = d.rows.filter(function (r) { return r.rowId === btn.dataset.row; })[0];
    if (src) { var copy = draftRow(src.role + ' (copy)', src.requestedModelId, src.persona, 'none'); d.rows.push(copy); }
    ctx.renderOverlays(); return true;
  });

  /* One value-applying function, used by BOTH listeners. It has to be in the
     `change` path too: a browser fires input-then-change for a select, but a
     harness (and some assistive tooling) dispatches `change` alone, and when
     only the repaint ran the modal re-rendered from the unchanged draft and
     silently discarded the selection. Idempotent, so running it twice is fine. */
  function applyDraftInput(t) {
    var k = t.getAttribute('data-collab-input'); if (!k) return false;
    var d = RTC.draft; if (!d) return false;
    var rowId = t.getAttribute('data-row');
    if (rowId) {
      var row = d.rows.filter(function (r) { return r.rowId === rowId; })[0]; if (!row) return false;
      if (k === 'role') row.role = t.value;
      else if (k === 'model') row.requestedModelId = t.value;
      else if (k === 'persona') row.persona = t.value;
      return true;
    }
    if (k === 'name') d.name = t.value;
    else if (k === 'purpose') d.purpose = t.value;
    else if (k === 'wonderer') d.wonderer = !!t.checked;
    else if (k === 'grillMe') d.grillMe = !!t.checked;
    else if (k.indexOf('cfg-') === 0) {
      var field = k.slice(4);
      var num = ['parallelism', 'debateRounds', 'maxRounds', 'reviewerCount'].indexOf(field) >= 0;
      d.config[field] = num ? clamp(t.value, 1, 20) : t.value;
    }
    return true;
  }

  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    applyDraftInput(t);
  });
  /* `change` fires on commit for a select and on toggle for a checkbox, so it
     is the caret-safe place to repaint. The `input` listener above deliberately
     does NOT re-render: it also fires per keystroke in the role/name/purpose
     text fields, and re-rendering mid-keystroke would fight the caret the same
     way it did in goals.js's objective textarea.
     Repainting here is what makes the modal HONEST while it is open: selecting
     an unavailable model has to show its requested/effective substitution
     immediately, and checking Grill Me has to move "Maximum questions" from 15
     to 25 immediately. Before this the draft state was already correct but the
     modal kept printing the pre-change figure until some other action forced a
     re-render, so the user was reading a stale number at the moment of choice. */
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    if (!applyDraftInput(t)) return;
    var ctx = EXT.ctx && EXT.ctx();
    if (ctx && ctx.renderOverlays) {
      var active = document.activeElement;
      var key = active && active.getAttribute && active.getAttribute('data-collab-input');
      var row = active && active.getAttribute && active.getAttribute('data-row');
      ctx.renderOverlays();
      /* Give focus back to the control the user just used, so a keyboard pass
         through the modal is not reset by the repaint. */
      if (key) {
        var sel = '[data-collab-input="' + key + '"]' + (row ? '[data-row="' + row + '"]' : '');
        var again = document.querySelector(sel);
        if (again && again.focus) { try { again.focus(); } catch (err) { } }
      }
    }
  });

  /* Typed Start preflight. `forceFailure` exists so the refusal path is
     drivable in a concept that has no provider to fail; every other clause is
     a real check over the draft the user configured. */
  function startPreflight(d) {
    if (d.forceFailure)
      return { ok:false, error:String(d.forceFailure), slot:null,
               message:'Start was refused ('+d.forceFailure+'). Your configuration is unchanged; no run, card or participant record was created.' };
    for (var i = 0; i < d.rows.length; i++) {
      var r = d.rows[i], m = modelById(r.requestedModelId);
      if (!m)
        return { ok:false, error:'model_unresolved', slot:r.role,
                 message:'“'+r.role+'” names a model this project cannot resolve. Nothing was started; pick a model or remove the slot.' };
      if (UNAVAILABLE_DEMO[r.requestedModelId] && !fallbackModelFor(r.requestedModelId))
        return { ok:false, error:'provider_unavailable', slot:r.role,
                 message:'“'+r.role+'” is unavailable and no same-provider substitute is configured. Nothing was started, and no failed participant was recorded — no provider attempt was made.' };
    }
    return { ok:true };
  }

  EXT.action('collab-modal-commit', function (ctx) {
    var d = RTC.draft; if (!d) return true;
    var limits = KIND_PARTICIPANT_LIMIT[d.kind];
    if (d.rows.length < limits[0] || d.rows.length > limits[1]) { ctx.toast('Out of range', KIND_LABEL[d.kind] + ' supports ' + limits[0] + '–' + limits[1] + ' participants.'); return true; }
    /* Crew Auto's own modal commits a POLICY, not a run (§5.3/CREW-004): the
       checkmark becomes reachable only after this commits, and this creates
       no run, no card and no Usage — it stores the roster template and
       criteria for whatever request meets them later. */
    if (d.autoMode) {
      var crewDefA = RTC.definitions.crew;
      crewDefA.autoConfigured = true;
      crewDefA.autoEnabled = true;
      crewDefA.autoRosterTemplate = d.rows.map(function (r) { return { role: r.role, requestedModelId: r.requestedModelId, persona: r.persona, requestedEffort:r.requestedEffort, requestedFast:r.requestedFast }; });
      crewDefA.autoMaxMembers = clamp(d.rows.length, 1, 8);
      effect('settingsWrites');            /* MODAL-006/008: only HERE. */
      RTC.draft = null;
      ctx.closeDialog();
      ctx.renderOverlays();
      ctx.toast('Crew Auto configured and enabled', 'Committed with a ' + crewDefA.autoRosterTemplate.length + '-member roster template and a cap of ' + crewDefA.autoMaxMembers + '. It still cannot widen authority or override an explicit single-agent selection.');
      return true;
    }
    /* MODAL-005 / PART-021. PREFLIGHT, before anything durable exists. A
       required slot whose model cannot be resolved is a refused START: the
       draft keeps every value the user entered, the failure is typed, and no
       run, card, participant record or provider attempt is created. A model
       being unavailable at CONFIGURATION time is not a failed runtime
       participant -- claiming one would assert a provider attempt that never
       happened. */
    var preflight = startPreflight(d);
    if (!preflight.ok) {
      d.lastFailure = preflight;                 /* shown in the modal, values kept */
      ctx.renderOverlays();
      ctx.toast('Start refused', preflight.message);
      return true;
    }
    var coreParticipants = d.rows.map(function (r) { return mkParticipant({ role: r.role, requestedModelId: r.requestedModelId, persona: r.persona, requestedEffort:r.requestedEffort, requestedFast:r.requestedFast, status: 'waiting', current: 'Configured; waiting for the run to start.' }); });
    /* PART-002/PART-011/WONV-007: core slots are REQUIRED by definition;
       Wonderer and Grill Me are additive and therefore optional. An additive
       specialist never replaces a core role. */
    if (d.wonderer) coreParticipants.push(mkParticipant({ role: 'Wonderer', requestedModelId: 'sonnet46-personal', persona: 'Wonderer', additiveRoleKind: 'wonderer', required: false, status: 'waiting', current: 'Additive — explores adjacent leads. Abstains from the final vote by default.' }));
    if (d.grillMe && d.kind !== 'review') coreParticipants.push(mkParticipant({ role: 'Grill Me', requestedModelId: 'haiku46', persona: 'Implementer', additiveRoleKind: 'grill_me', required: false, status: 'waiting', current: 'Additive — maps the decision frontier. No automatic vote.' }));

    if (d.reconfigureRunId) {
      var run = findRun(d.reconfigureRunId);
      if (run) {
        run.definitionRevision += 1;
        run.title = d.name; run.purpose = d.purpose;
        run.config = JSON.parse(JSON.stringify(d.config));
        run.participants = coreParticipants.map(function (p) { p.runId = run.id; return p; });
        if (run.kind === 'brainstorm' && run.brainstorm) run.brainstorm.questionBank.grillMeEnabled = d.grillMe;
        run.messages.push(mkMsg(run, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Reconfigured. Definition revision bumped to ' + run.definitionRevision + '. Prior transcript attribution is unchanged.' }));
        ctx.toast('Reconfigured', run.title + ' is now on revision ' + run.definitionRevision + '.');
      }
    } else {
      var newRun = mkRun({
        kind: d.kind, threadId: ctx.state.selectedThread, title: d.name, purpose: d.purpose,
        status: 'running', config: JSON.parse(JSON.stringify(d.config)),
        coordinator: d.kind === 'crew' ? { kind: d.config.coordinator, label: d.config.coordinator === 'parent_assistant' ? 'Parent assistant (this thread)' : 'Dedicated synthesis model' } : d.kind === 'chat_room' ? { kind: 'dedicated_moderator', label: 'Moderator' } : { kind: 'dedicated_synthesis_model', label: 'Synthesis model' },
        participants: coreParticipants.map(function (p) { return p; })
      });
      newRun.participants.forEach(function (p) { p.runId = newRun.id; });
      if (d.kind === 'crew') newRun.crew = { boundPlanId: d.boundPlanId || null, boundPlanVersion: d.boundPlanVersion || null, boundTodoIds: d.boundPlanId ? ['Bound at Crew start — see the Plan owner for the current To-Do set.'] : [], assignments: [] };
      if (d.kind === 'review') newRun.review = { targetPack: { targetKind: 'assistant_response', targetRefs: ['latest assistant response on this thread'], targetHashes: { primary: Math.random().toString(16).slice(2, 10) }, frozenAt: nowIso(), userConstraintRefs: [], acceptanceRefs: [] }, findings: [], excludedFindings: [] };
      if (d.kind === 'chat_room') newRun.chatRoom = { roundsSoFar: 0, turnPolicy: d.config.turnPolicy, promotions: [] };
      if (d.kind === 'brainstorm') newRun.brainstorm = { phase: 'intake', questionBank: { baselineLimit: d.config.questionLimit, grillExtension: d.config.grillExtension, grillMeEnabled: d.grillMe, askedIds: [], resolvedIds: [], duplicateIds: [], researchRoutedIds: [] }, proposals: [], debateRounds: d.config.debateRounds, votes: [], hardConstraintViolations: [], dissent: [], wondererLeads: [], provisioning: [], synthesis: null };
      newRun.messages.push(mkMsg(newRun, { senderKind: 'system', senderName: 'System', messageType: 'message', body: 'Started from a committed configuration (revision 1). Settings defaults prefilled this modal; nothing started before you committed it.' }));
      /* MODAL-002: the ONLY place a durable collaborative effect is counted.
         Opening, editing and cancelling a modal reach none of these lines. */
      effect('runs'); effect('cards'); effect('events');
      effect('participants', newRun.participants.length);
      effect('providerCalls', newRun.participants.length);
      effect('usageRecords', newRun.participants.length);
      RTC.runs.push(newRun);
      attachCardToThread(ctx, newRun);
      ctx.toast(KIND_LABEL[d.kind] + ' started', newRun.title);
    }
    RTC.draft = null;
    ctx.closeDialog();
    ctx.renderApp();
    return true;
  });

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
    var autoChecked = !!(crewDef.autoEnabled && crewDef.autoConfigured);
    function row(kind, desc) {
      return '<button class="menu-item" data-action="collab-open-configure" data-kind="' + kind + '"><span class="menu-icon">' + ctx.icon(KIND_ICON[kind], 13) + '</span><span class="menu-copy"><strong>' + esc(KIND_LABEL[kind]) + '…</strong><span>' + esc(desc) + '</span></span></button>';
    }
    return '<div class="menu-divider" data-k="collab-div"></div>' +
      '<div class="menu-section-label">Multi-Agent Workflows</div>' +
      row('crew', 'Delegate bounded work to a coordinator and roles') +
      row('chat_room', 'Persistent multi-agent discussion, explicit promotion only') +
      row('brainstorm', 'Deep Plan → BrainStorm: independent proposals, debate, one Plan') +
      row('review', 'Single Agent or Multi-Pass, read-only, never auto-repairs') +
      '<div class="menu-divider"></div>' +
      '<label class="menu-item collab-auto-row" data-k="collab-auto-row"><input type="checkbox" data-action="collab-crew-auto-toggle"' + (autoChecked ? ' checked' : '') + '><span class="menu-copy"><strong>Crew Auto</strong><span>' + (crewDef.autoConfigured ? 'Configured · cap ' + crewDef.autoMaxMembers + ' · cannot widen authority' : 'Opens configuration before the check can appear') + '</span></span></label>' +
      '<button class="menu-item" data-action="collab-open-configure" data-kind="crew" data-auto="1"><span class="menu-icon">' + ctx.icon('settings', 13) + '</span><span class="menu-copy"><strong>Manage Defaults…</strong><span>Crew Auto criteria and roster template</span></span></button>' +
      '<button class="menu-item" data-action="collab-build-with-crew" data-plan-id="ap-index" data-plan-version="5"><span class="menu-icon">' + ctx.icon('document', 13) + '</span><span class="menu-copy"><strong>Build With Crew…</strong><span>Bind a Crew to Plan ap-index V5 and its To-Dos</span></span></button>';
  });

  EXT.action('collab-crew-auto-toggle', function (ctx) {
    var crewDef = RTC.definitions.crew;
    if (!crewDef.autoConfigured) {
      openConfigureDraft('crew', null, true);
      ctx.closeMenu && ctx.closeMenu();
      ctx.openDialog({ type: 'collab-configure' });
      return true;
    }
    crewDef.autoEnabled = !crewDef.autoEnabled;
    ctx.renderOverlays();
    ctx.toast('Crew Auto ' + (crewDef.autoEnabled ? 'enabled' : 'disabled'),
      crewDef.autoEnabled ? 'Admits automatically only when its committed criteria are met; it cannot widen authority or override an explicit single-agent route.' : 'Automatic admission is off. The stored configuration and roster template are kept for the next enable.');
    return true;
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
  function renderActivityHover(ctx,run){
    return '<button type="button" class="ab-row polish-collab-preview" data-k="collab-hover:'+esc(run.id)+'" data-action="collab-open-panel" data-run="'+esc(run.id)+'"><span class="ab-row-copy"><b>'+esc(run.title)+'</b><i>'+esc(KIND_LABEL[run.kind]||run.kind)+' · '+esc(run.status)+' · '+run.participants.length+' participants</i></span>'+ctx.icon('chevron',12)+'</button>';
  }

  function renderActivityBody(ctx, run) {
    return '<div class="collab-activity-body" data-k="collab-ab-' + esc(run.id) + '">' +
      '<div class="collab-activity-head"><strong>' + esc(run.title) + '</strong>' + statusChip(run.status, run.blockedReason) + '</div>' +
      '<p class="collab-card-meta">' + esc(latestSummary(run)) + '</p>' +
      '<div class="collab-participants">' + run.participants.map(function (p) { return participantRow(ctx, run, p); }).join('') + '</div>' +
      '<div class="collab-kind-inline">' + kindInline(ctx, run) + '</div>' +
      '<div class="collab-followon-actions">' +
      '<button class="soft-button" data-action="collab-open-panel" data-run="' + esc(run.id) + '">' + ctx.icon('expand', 12) + ' Open Panel</button>' +
      '<button class="soft-button" data-action="collab-message" data-run="' + esc(run.id) + '">' + ctx.icon('send', 12) + ' Message</button>' +
      '</div></div>';
  }
  EXT.slot('activityHoverCard', function (ctx) {
    var dom = ctx.domain;
    if (ACTIVITY_KINDS.indexOf(dom) < 0) return '';
    var runs = runsForThread(ctx.state.selectedThread).filter(function (r) { return r.kind === dom; });
    if (!runs.length) return '';
    return '<div class="hover-card ab-card" id="activity-domain-preview" data-overlay="hover" data-k="collab-hovercard" data-domain="' + esc(dom) + '" role="dialog" aria-modal="false" aria-label="' + esc(KIND_LABEL[dom]) + ' activity preview">' +
      runs.slice(0,4).map(function (r) { return renderActivityHover(ctx, r); }).join('') + '</div>';
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
  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'collab-evidence') return '';
    var run = findRun(d.runId);
    var a = run && run.crew ? run.crew.assignments.filter(function (x) { return x.id === d.assignmentId; })[0] : null;
    if (!run || !a) return '<section class="dialog" style="width:min(480px,calc(100vw - 20px))"><div class="dialog-body"><p>Assignment no longer exists.</p></div></section>';
    var over = !String(d.draft || '').trim();
    return '<section class="dialog collab-evidence-dialog" style="width:min(560px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="Mark complete with evidence">' +
      '<div class="drawer-head"><strong>Complete: ' + esc(a.title) + '</strong><span class="spacer"></span><button class="icon-button" data-action="collab-evidence-cancel">' + ctx.icon('close', 13) + '</button></div>' +
      '<div class="dialog-body">' +
      '<p class="collab-sub">Expected output: ' + esc(a.expectedOutput) + '</p>' +
      '<textarea class="collab-evidence-input" data-collab-evidence-input rows="4" placeholder="Describe the evidence that satisfies the expected-output contract — a tool succeeding is not by itself completion.">' + esc(d.draft || '') + '</textarea>' +
      '<div class="decision-actions"><button class="soft-button" data-action="collab-evidence-cancel">Cancel</button><button class="primary-button" data-action="collab-evidence-confirm" data-run="' + esc(run.id) + '" data-assignment="' + esc(a.id) + '"' + (over ? ' disabled' : '') + '>Mark complete</button></div>' +
      '</div></section>';
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    if (!t.hasAttribute('data-collab-evidence-input')) return;
    var ctx0 = EXT && EXT.ctx && EXT.ctx(); if (!ctx0) return;
    if (ctx0.state.dialog && ctx0.state.dialog.type === 'collab-evidence') { ctx0.state.dialog.draft = t.value; ctx0.renderOverlays(); }
  });
  EXT.action('collab-evidence-cancel', function (ctx) { ctx.closeDialog(); return true; });
  EXT.action('collab-evidence-confirm', function (ctx, btn) {
    var run = findRun(btn.dataset.run); if (!run) return true;
    var a = run.crew.assignments.filter(function (x) { return x.id === btn.dataset.assignment; })[0]; if (!a) return true;
    var note = String((ctx.state.dialog && ctx.state.dialog.draft) || '').trim();
    if (!note) { ctx.toast('Evidence required', 'A tool-success signal alone is not completion — describe what satisfies the expected-output contract.'); return true; }
    a.status = 'done'; a.evidenceNote = note;
    run.messages.push(mkMsg(run, { senderKind: 'coordinator', senderName: 'Coordinator', messageType: 'response', body: 'Marked "' + a.title + '" complete against its expected-output contract: ' + note }));
    ctx.closeDialog();
    ctx.renderApp();
    return true;
  });

  EXT.action('collab-build-with-crew', function (ctx, btn) {
    var planId = btn.dataset.planId || 'ap-index', planVersion = Number(btn.dataset.planVersion) || 5;
    openConfigureDraft('crew', null, false);
    RTC.draft.name = 'Crew · Build ' + planId + ' V' + planVersion;
    RTC.draft.purpose = 'Build With Crew — bound to Plan ' + planId + ' version ' + planVersion + ' and its current To-Dos.';
    RTC.draft.boundPlanId = planId; RTC.draft.boundPlanVersion = planVersion;
    ctx.openDialog({ type: 'collab-configure' });
    return true;
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
  function effect(kind, n){ RTC.effects[kind] = (RTC.effects[kind]||0) + (n||1); }
  function effectsSnapshot(){ return JSON.parse(JSON.stringify(RTC.effects)); }

  /* PART-001..004. One terminal outcome per slot, and never a silent swap. */
  function setOutcome(runId, pid, outcome, opts){
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

  /* =====================================================================
     18. RESET + PUBLIC SURFACE
     ===================================================================== */
  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function (ctx, btn, ev) {
    restoreFixture();
    UI.expanded = {}; UI.more = {}; UI.selectedFindings = {};
    return false;
  });

  window.PM56_COLLAB = {
    kinds: KINDS.slice(),
    definitions: function () { return RTC.definitions; },
    runs: function () { return RTC.runs; },
    run: findRun,
    runsForThread: runsForThread,
    draft: function () { return RTC.draft; },
    restore: restoreFixture,
    fixture: function () { return JSON.parse(SEED_RUNS_JSON); },
    openConfigure: function (kind, reconfigureRunId, autoMode) { openConfigureDraft(kind, reconfigureRunId, autoMode); },
    buildWithCrew: function (planId, planVersion) {
      openConfigureDraft('crew', null, false);
      RTC.draft.boundPlanId = planId; RTC.draft.boundPlanVersion = planVersion;
    },
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
      return ['configuring','running','paused','blocked','completed','canceled','failed'];
    }
  };
})();
