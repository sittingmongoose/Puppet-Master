# Collaborative Workflows

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **Authority:** This document is the sole canonical owner of the shared collaborative workflow runtime that Crew, BrainStorm, Review, and Chat Room all use: `CollaborativeDefinition`, `ParticipantSpec`, `CollaborativeRun`, `CollaborationMessage`, the BrainStorm question bank/proposal/vote records, the Review target pack and finding records, the mandatory configuration modal contract, requested-versus-effective participant disclosure, workflow transcript cards, expanded card detail, full panels, per-thread Activity domains, composer destination targeting, pause/resume/cancel, collaborative recovery, and the four kind-specific protocols. It does not own Persona identity, Skill identity or materialization, model/provider/account catalogs, permission evaluation, MCP registration, tool dispatch, child-run orchestration or crew admission ceilings, Plan document identity, To-Do identity, Goal identity, artifact storage, Usage totals, Settings persistence, or the central command/event/wiring catalogs.

## 1. Product boundary and terminology

Puppet Master has exactly four user-invocable collaborative workflow kinds, closed as `crew | brainstorm | review | chat_room`. They are one runtime with four protocols, not four products. A `Collaboration` is the durable configuration identity; a `CollaborativeRun` is one execution of that configuration; a `Participant` is one configured slot inside a run; a `CollaborationMessage` is one durable transcript entry. Every kind reuses the same participant assignment, transcript, artifact, card, panel, Activity, Usage, recovery, and composer-target infrastructure. A kind-specific protocol may add fields and actions, but it may not fork core storage, core lifecycle, or core identity. Four independent agent or session stores are forbidden.

Collaborative Workflows owns:

- the `Collaboration` and `CollaborativeRun` identities, revisions, and lifecycle states;
- participant slot definition, role semantics, and the requested-versus-effective assignment disclosure surface;
- the mandatory per-invocation configuration modal contract and the rule that Settings defaults prefill it but never skip it;
- collaborative transcript message semantics, ordering, sender kinds, and reply/mention edges;
- the shared collaborative transcript card, expanded card detail, full panel shell, and per-thread Activity domain projection;
- collaborative composer destination targeting semantics and destination revalidation;
- pause, resume, cancel, restart recovery, and idempotent start behavior for collaborative runs;
- the Crew delegation protocol and Crew Auto admission gate;
- the Chat Room discussion protocol, turn policies, and explicit promotion actions;
- the Review protocol, `ReviewTargetPack` freezing, blind concurrent passes, finding normalization, corroboration, adjudication, and the Review artifact contract;
- the BrainStorm protocol, shared question bank arithmetic, blind proposals, debate, evidence rounds, voting, dissent preservation, and synthesis handoff;
- the participant-role semantics of the additive Wonderer and Grill Me options inside these four workflows.

It does not own:

- Persona definition, storage layout, schema, or selection rules (`Plans/Personas.md`);
- Skill identity, discovery, `SKILL.md` format, or bounded materialization (`Plans/Skills_System.md`);
- provider/model/account catalogs, capability snapshots, or the shared model resolver (`Plans/Models_System.md`, `Plans/Multi-Account.md`);
- permission rule evaluation, ceilings, escalation, or approval dialogs (`Plans/Permissions_System.md`);
- MCP server registration, naming, availability, or credential binding (`Plans/MCP_Integration.md`);
- tool registry or tool dispatch (`Plans/Tools.md`);
- child-run spawn, supervision, timeout propagation, cancellation, lineage, the crew message board schema, or `executionLimits` crew admission ceilings (`Plans/orchestrator-subagent-integration.md`);
- capability provisioning lifecycle, `ObservableWork`, or installation coalescing (`Plans/Shared_Integration_Runtime.md`);
- the `AssistantPlan` record, Plan document identity, Plan version/hash, or Build control states (`Plans/Assistant_Plan_Runtime.md`);
- To-Do identity, hierarchy, or status transitions (`Plans/ToDo_Runtime.md`);
- Goal objective, revision, or continuation (`Plans/Goal_Runtime_System.md`);
- artifact version, retention, or physical storage (`Plans/Runtime_Artifacts_Panel.md`, `Plans/Project_Output_Artifacts.md`, `Plans/storage-plan.md`);
- Usage totals, quota truth, or reset facts (`Plans/usage-feature.md`);
- Settings values, managers, or persistence (`Plans/Settings_System.md`);
- command, event, or wiring registration (`Plans/UI_Command_Catalog.md`, `Plans/Commands_System.md`, `Plans/UI_Wiring_Rules.md`).

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Settings_System.md, ContractName:Plans/assistant-chat-design.md

The words `Crew`, `BrainStorm`, `Review`, and `Chat Room` are user-facing product names for the four kinds. `Subagents` remains a separate Activity domain and a separate concept: a subagent is a child run under `Plans/orchestrator-subagent-integration.md`, while a collaborative participant is a configured slot in a `CollaborativeRun` that may be realized by a child run. A collaborative participant is never displayed as a raw subagent row, and the Subagents domain never absorbs collaborative participant groups.

## 2. Shared collaborative foundation

### 2.1 One runtime, four protocols

Every collaborative invocation resolves to one `Collaboration` definition plus one `CollaborativeRun`. The definition carries `kind`, project and thread identity, name, purpose, revision, participant specs, coordinator spec, context/tool/permission policy refs, concurrency, and time/token/cost limits. The run carries `state`, participant run refs, coordinator run ref, transcript ref, artifact refs, usage group ref, the requested/effective snapshot ref, and optional links to an `assistant_plan_id`, `plan_version`, `goal_id`, or `parent_run_id`. Kind-specific records attach to the run by `collaboration_run_id`; they never create a second run identity, a second transcript identity, or a second participant identity.

The closed run states are `configuring | running | paused | waiting | blocked | completed | cancelled | failed`. `waiting` means the run is admitted and alive but is blocked on an owner-reported external condition such as a permission decision, a quota reset, or a scheduled window; `blocked` means the run itself cannot proceed and names the blocking reason. A collaborative run never displays a bare `Working` label when an owner reason exists. A run that reaches its time, cost or token limit settles `cancelled` with a `stop_reason` and is shown as `Stopped at your limit`, never as a failure; no run state is added (CWR-029, DL-131, 2026-09-27).

### 2.2 Participant slots and identity

A participant slot is defined by `ParticipantSpec` and identified by `participant_slot_id`. The slot records role, `requested_provider_id`, `requested_account_id`, `requested_model_id`, `requested_persona_id`, `requested_skill_ids`, `requested_tool_profile_id`, and `additive_role_kind` closed to `none | wonderer | grill_me`. The runtime assignment record stores requested and effective fields separately with a substitution or failure reason drawn from the model, account, and permission owners. The same requested model may be assigned to several slots — this is required for Multi-Pass Review — and each slot still receives a distinct participant identity, a distinct attempt identity, and a distinct isolated session. Two slots that resolve to the same model are never collapsed, deduplicated, or shown as one participant.

Requested and effective identity is disclosed wherever the participant appears: modal row, card participant row, panel participant list, participant transcript header, and Usage attribution. When a selected model, account, provider, or Persona is unavailable, the surface states the requested value, the effective value, and the reason. Silent substitution is forbidden. When failure policy forbids substitution, the slot fails with a typed reason and the run reports the degraded roster rather than quietly proceeding with a different roster. Before Start, a model the user chose that is unavailable blocks Start until the user picks a replacement, and no substitute is admitted for it (CWR-034, DL-121, 2026-09-27).

### 2.3 Transcript and message model

`CollaborationMessage` is the single durable transcript record for all four kinds. `sender_kind` is closed to `user | participant | coordinator | system`. `message_type` is closed to `message | request | response | warning | conflict | dependency | handoff | vote | finding | pass`. Messages carry `recipient_ids`, `reply_to`, `attachment_refs`, `created_at`, and a monotonic `sequence` per run. Mentions, replies, assignments, findings, and votes are message types plus typed side records; they are not four separate transcript stores.

A user message sent to a collaborative destination appears in both the main thread transcript and the collaboration transcript. It is written once and referenced twice; the duplicate presentation never creates two durable user messages, and participants receive it exactly once. Per-participant transcripts are filtered projections of the same message store plus that participant's private working slice; they are not independent logs.

A participant's or the coordinator's message is written once, when it is complete. While it is being written, its text streams in the writer's lane as a message in progress under the `collaboration_message_id` allocated for it; that text is presentation only, is never persisted or delivered, and is never a second record (CWR-040, EP-129..EP-131, DL-137, 2026-09-27).

### 2.4 Artifacts, Usage, and limits

Collaborative artifacts are ordinary Puppet Master artifacts created through the artifact owners and referenced by `artifact_refs`. This document owns which artifacts a protocol must produce and when; it does not own artifact version, retention, or export mechanics. Deleting a collaboration card or message cannot purge a shared referenced artifact.

Usage attribution is per participant and per run group through `usage_group_ref`. Participant rows, the panel, and the Usage surface show attributed cost and token consumption with requested/effective identity. Collaborative Workflows never fabricates totals, reset facts, or quota truth; it projects what the Usage owner reports and shows an explicit unknown state otherwise.

Configured `concurrency`, `time_limit_seconds`, `token_limit`, and `cost_limit` are workflow-level requests. They narrow admission; they never widen it, except that a run's own time and cost limits replace the general run limit for that run (CWR-032, DL-131, 2026-09-27). Child admission, crew concurrency, nesting depth, and total active agent ceilings resolve through the `executionLimits` contract owned by `Plans/orchestrator-subagent-integration.md`. This document must not restate, widen, or invent alternate ceiling numbers. A configured concurrency above the orchestrator ceiling is clamped, disclosed as requested-versus-effective, and never silently honored.

### 2.5 Permission ceiling

Every collaborative run inherits the parent thread, mode, and Plan permission ceiling. A participant cannot self-approve, cannot request its own escalation directly to the user outside the approval owner, and cannot acquire authority its parent does not hold. Permission requests raised inside a run route to `Plans/Permissions_System.md` with the run, participant slot, and requested capability attached, and the decision is recorded on the run. A coordinator has no additional authority over the permission layer; coordinating work is not authorizing work.

Mutation authority is inherited, never configured upward. Crew inherits the parent mode's mutation authority. BrainStorm and Review are read-only against the target project regardless of parent authority. Chat Room has no project mutation authority; it may only produce transcript, artifacts, and explicitly promoted records.

### 2.6 Pause, resume, cancel, and recovery

Every kind supports pause, resume, and cancel where its state allows, and disabled controls state the owner reason. Pause reaches a safe boundary rather than tearing down in-flight participant work, preserves participant state and pending inbox, and does not discard composer-target text or attachments. Resume continues the same run and does not duplicate already-delivered participant work. Cancel stops new admissions, retains the card, transcript, participants, and artifacts with truthful cancelled state, and records a cancellation receipt.

Restart restores collaborative runs, participant states, transcripts, artifacts, the Activity domains, and the current composer destination. Every asynchronous start command is idempotent: a double invocation returns the original `collaboration_run_id` and receipt and creates no second run. Replayed results return original object and receipt IDs with no second side effect. No client-local timer is authoritative for collaborative run state; a closed window does not cancel a run and does not resume one.

## 3. Configuration modal contract

Crew, BrainStorm, Review, and Chat Room each open a configuration modal on every invocation. Settings defaults prefill the modal; they never skip it. There is no remembered "do not ask again" path, no silent reuse of the previous configuration, and no invocation route that starts a run without a committed configuration. Re-running an existing collaboration still opens the modal prefilled from the prior committed definition.

The shared modal shell and participant-row grammar are common to all four kinds. The shared fields are workflow name and purpose; participants and roles; provider, account, and model per participant; Persona per participant; optional Wonderer and Grill Me additions where the kind supports them; coordinator or synthesis model; context sharing and attachments; tool, MCP, and Skill policy; permission ceiling; concurrency; time, token, and cost limits; failure and substitution policy; transcript retention and detail; and output format.

Each participant row shows role, Persona picker, provider/account/model picker, tool and Skill summary, and remove/duplicate controls. Requested and effective identity is shown inline whenever a selected route is unavailable or degraded. Provider marks use the existing shared SVG marks; letter-only substitute marks are forbidden. Adding Wonderer or Grill Me from the `Add specialists` shelf creates a dedicated additive participant row with its own model (CWR-028); it never overwrites, repurposes, or consumes a core role row.

Committing the modal writes or bumps the `CollaborativeDefinition` revision and returns it with the run start request. The modal discloses any unavailable selection before start. Cancelling the modal starts nothing, creates no run, produces no card, and records no Usage.

The modal is presented as a configuration sheet: its close path, In your chat preview, read-back, estimate, team presets, single Advanced page and card title are specified by CWR-018, and the definition fields its rows write by CWR-032 (2026-09-27). The substitution row is a sentence and never a choice (CWR-034), and each kind's team presets are CWR-039.

## 4. Cards, panels, Activity, and composer targeting

### 4.1 Transcript card

All four kinds create a transcript card at start. The card uses the same dimensions, tokens, and existing spring motion for every kind. The collapsed card shows workflow identity, status, participant count, the current phase or the latest meaningful activity or the final result, and the actions `Expand`, `Open Panel`, `Message`, and `More`. A collapsed or narrow card may keep some of these behind `Expand` or in its hover card, and its motion follows the theme family, as CWR-035 specifies (2026-09-27).

The expanded inline card shows participant rows, one line per lane for at most three lanes plus a `+N more` row (the writer's message in progress, live, while it streams, and otherwise a quote of its last complete message, CWR-040, DL-137), assignments or discussion or findings as the kind requires, warnings and disagreement, the current artifact or output preview, and a meta line that carries the Usage summary. The expanded card is deliberately bounded: the full transcript belongs to the run view, never to the inline card. Expanded and collapsed state is local view state and is not domain truth. The card's densities and their mapping from run state are specified by CWR-019, and each lane's state, verb and quote by the participant activity projection of CWR-030 (2026-09-27).

### 4.2 Full panel

The full panel is the run view: one editor-pane document per run with a kind-specific overview tab and the shared Conversation, Team and Cost tabs. It shows the full transcript, the participant list with clickable transcripts, assignments and questions and research and tool activity, artifacts and findings and votes, Usage with requested/effective identity, and history, recovery, and output actions. Opening it focuses the run's existing document and never duplicates it, and it must never hide the main composer destination state. Its document identity, tabs, narrow-width behavior and the one-control-set rule are specified by CWR-020 (2026-09-27).

### 4.3 Participant rows and participant transcripts

Every participant row in the modal, card, panel, and Activity Detail is clickable across its entire row. Clicking opens that participant's transcript together with its requested and effective identity, assignment, tool and Skill set, artifacts, Usage, and current state. Restricting the click target to a small glyph is forbidden. A participant with no output yet opens a truthful empty transcript with its current state, never a fabricated summary.

### 4.4 Activity domains

Crew, BrainStorm, Review, and Chat Room each contribute a dynamic per-thread Activity domain alongside Goal, To-Dos, Subagents, Changes, and Artifacts. A domain appears only when the thread has current or historical records for that kind and is omitted otherwise. Domains show active and completed run counts plus latest status, respect the existing responsive compaction tiers and hover-card dwell, and route clicks to the corresponding card, panel, or participant transcript through Activity Detail. Cards remain in the transcript because a collaborative run is a conversational workflow record; the Activity domain is a projection, not a replacement. The domain chip, its hover card and the compact Activity Detail body of the four kinds are specified by CWR-036 (2026-09-27).

### 4.5 Composer destination targeting

`Message` on any collaborative card or panel targets the ordinary composer. Puppet Master does not open a second input surface for collaborative messaging. The composer's destination is persisted with the composer buffer as `ComposerDestination` with `destination_kind` closed to `assistant | crew | brainstorm | review | chat_room | plan_revision`, plus `destination_id`, optional `participant_id`, `display_label`, and `state_generation`.

When a collaborative destination is active, the composer adds a narrow ribbon inside its top edge, changes the outer border and background tint, and illuminates the matching small destination glyph near the Attach and capability glyphs. The ribbon names the destination, for example `To: BrainStorm · Provider Architecture · 4 helpers`, and carries a close control. On screen the people in a run are helpers, and reviewers in Review, while `participant` stays the data term (CWR-036, DL-124, 2026-09-27). The treatment stays theme-aware and subtle rather than a broad colored stripe or left accent. Clicking the destination glyph opens the list of eligible destinations. At narrow widths the ribbon label ellipsizes before the close control is removed and the participant cluster may collapse to a workflow icon plus count; a hidden send destination is never acceptable.

Dispatch revalidates that the target and `state_generation` can still accept input. The stored label alone is never sufficient. Changing destinations never clears composer text or attachments; attachments follow the selected destination on send. A direct collaborative message does not consume one of the primary Agent follow-up queue's two slots.

### 4.6 Destination edge cases

When the targeted collaboration ends and the composer buffer is empty, the destination returns to Assistant automatically. When the targeted collaboration ends and the composer buffer is not empty, the destination does not silently redirect: the ribbon reports that the target has ended and the user must explicitly retarget or clear. Closing the ribbon returns to Assistant with text and attachments unchanged. A destination whose generation has advanced fails closed with an exact reason rather than delivering into a stale target.

## 5. Crew

### 5.1 Purpose and distinction

Crew divides bounded work among configured members and executes it under a coordinator. It is an execution workflow, not a discussion workflow. Crew is distinct from Chat Room, which discusses without delegated execution; from BrainStorm, which plans read-only and ends in one Plan document; and from Subagents, which is the raw child-run projection owned by `Plans/orchestrator-subagent-integration.md`. The older rule that Crew is merely an On/Off switch is retired. Crew is a configurable workflow with a coordinator, roles, models, Personas, tools, context, expected outputs, and dependencies. A Crew is started by the user, by the assistant itself when Crew Auto allows it (section 5.3), or by Build With Crew on a Plan (section 5.4). There is no separate per-chat switch that allows Crews: the one per-chat Crew control is the chat's `Crew Auto` check, which overrides the project's Crew Auto value for that chat (CWR-004, DL-120, 2026-09-27).

### 5.2 Configuration

The Crew modal configures the coordinator, which is the parent assistant, a selected participant, or a dedicated synthesis model, written as the typed `coordinator_spec`; member roles, models, Personas, Skills, tool subsets, and context visibility; assignment strategy closed to `manager_directed | explicit_static | adaptive`; parallelism; shared notes (`shared_notes_policy`, which replaces shared versus private scratch behavior); synthesis and disagreement policy; and cost and time limits. Each assignment's expected output and dependencies are authored by the coordinator when it splits the job, not set in the modal, and a coordinator that is also a participant has its own part checked by this chat's assistant (CWR-037, DL-128, DL-132, 2026-09-27). Mutation authority is inherited from the parent mode and Plan permissions and is not a Crew modal field that can raise it.

Each assignment carries a description, an explicit expected-output contract, its dependency set, its tool set, and its context slice. The coordinator cannot mark an assignment complete without a result that satisfies its expected-output contract; a tool-success signal is evidence input, not completion. Assignments whose dependencies are unsatisfied are pending, not blocked. Independent assignments may run in parallel up to the effective concurrency, which is the configured concurrency clamped by the orchestrator `executionLimits` ceilings.

### 5.3 Crew Auto

Crew Auto is a checkable item in the Multi-Agent submenu:

```text
Crew…
Chat Room…
────────
✓ Crew Auto
Crew Auto settings…
Manage Defaults…
```

Crew Auto is the assistant's permission to start a Crew by itself when it needs one (DL-120, 2026-09-27). It is on by default for a project. The project value is held by the Settings owner under `assistant.multi_agent.crew.auto_enabled` (section 14); bringing that key's default in line with DL-120 is the Settings owner's change, not this document's. The `Crew Auto` check in a chat shows the value in force for that chat: the chat's own override when it has one, otherwise the project value. Checking or unchecking it sets that chat's override only; it is committed before the check changes, and it never changes the project value or another chat. The rules and team Crew Auto uses are the project's stored Crew Auto configuration, which starts from the Settings defaults of section 14 and changes only when the Crew Auto sheet commits; a sheet draft that was never committed is never used. Unchecking Crew Auto stops the assistant starting Crews by itself in that chat and retains the stored configuration. `Crew Auto settings…` opens the Crew Auto sheet through `cmd.chat.crew_auto.open_config`, and `Manage Defaults…` keeps its route to the Settings manager (CWR-038, DL-119, 2026-09-27). Turning Crew Auto on for the project leaves one line in the chat, `Crew Auto is on for this project` (CWR-038, DL-135, 2026-09-27).

Crew Auto criteria may include independent subsystems, specialization fit, useful parallelism, a Plan recommendation, and a configurable complexity threshold. Crew Auto cannot widen authority beyond the parent ceiling, cannot raise the configured member cap, and cannot override an explicitly selected single-agent route. When criteria are not met, no Crew is created, no card appears, and no Usage is attributed; an unmet-criteria evaluation is not a failed run. Admission and the Crew Auto sheet's preview use one pure deterministic evaluator that makes no provider call, and every run records its `admission_source` and, when Crew Auto admitted it, its `crew_auto_revision` (CWR-021, 2026-09-27). The assistant decides when it wants a Crew; the evaluator decides whether it may start one. The assistant starts a Crew by itself only when Crew Auto is on for the chat and the evaluator admits that request, and a declined request stays with one assistant with nothing created (CWR-021, DL-120, 2026-09-27). Build With Crew on a Plan stays the user's choice: Crew Auto never starts it and is not required for it.

### 5.4 Build With Crew

`Build With Crew` on a Plan card binds a Crew run to the exact Plan version and hash and to the current To-Do set for that Plan. The binding is recorded on the run as `assistant_plan_id` and `plan_version`. Plan identity, Plan version, Build control states, and To-Do identity remain owned by `Plans/Assistant_Plan_Runtime.md` and `Plans/ToDo_Runtime.md`; Crew consumes them by reference and reports work outcomes back through the To-Do work-binding contract. A Plan revision after a Crew build has started requires stopping current execution under the Plan owner's rules; approved source cannot mutate beneath running Crew work. The sheet this opens is titled `Build this plan with a Crew`, refuses Start in place when the Plan changed while it was open, and admits the Crew run, the PlanRun and the To-Dos as one transaction (CWR-022, CWR-023, 2026-09-27).

### 5.5 Orchestrator boundary

Crew never duplicates orchestrator topology. Child spawn, supervision, timeout propagation, cancellation, lineage fields, retry identity, worktree allocation, and the crew message board schema, routing, priority, rate limiting, orchestrator visibility, and parent mediation remain owned by `Plans/orchestrator-subagent-integration.md`. Crew never introduces Goal phases, Goal tranches, child Goals, or a Goal-owned workflow budget; those models are retired. Crew never becomes a second scheduler, a second lane pool, or a second permission clamp. Provider-coupling rules that constrain a whole crew to one provider are orchestrator-owned; Crew discloses the resulting requested-versus-effective assignment but does not define the coupling rule.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Permissions_System.md

## 6. Chat Room

### 6.1 Purpose

Chat Room is a persistent multi-agent conversation used for debate, diagnosis, brainstorming discussion, question exploration, and multi-perspective analysis. It produces transcript, optional synthesis, and optional artifacts. It does not delegate execution, does not mutate the project, and does not automatically create To-Dos, Plans, or Goals.

### 6.2 Configuration

The Chat Room modal configures topic and room name; participants with model, account, and Persona per participant; moderator (its model and Persona write `coordinator_spec`, CWR-037); turn policy closed to `moderated | round_robin | free_discussion | ask_everyone_once`; mention and reply behavior; tool policy; shared context and attachments; maximum rounds or stop condition; synthesis, vote, and unresolved-opinion output; and time and cost limits.

### 6.3 Turn policy and interaction

Turn policy is deterministic and replayable. `moderated` routes each turn through the configured moderator. `round_robin` cycles participants in configured order. `free_discussion` admits participants under the concurrency limit with recorded admission order. `ask_everyone_once` asks each participant exactly once and then stops. `Next Round` advances one round under the active policy and never silently changes the policy.

The user interacts through `Ask Everyone`, addressing selected participants, `@mention` of a participant, reply or thread where the policy supports it, adding or removing a participant through controlled reconfiguration, `Next Round`, `Pause`, `Resume`, `Cancel`, `Summarize Now`, and `End discussion`, which ends the room as `completed` through `cmd.chat_room.end`. User messages reach the room through the ordinary targeted composer and are delivered to the addressed participants exactly once. A message sent while a round is in progress is queued for the next round unless the user sends it now to steer the round without interrupting it; a message sent now is read first by the next participant to speak, and every later speaker in that round sees it (CWR-024, DL-112, 2026-09-27). Reconfiguration that adds or removes a participant bumps the definition revision and is recorded in the transcript as a `system` message; it never rewrites prior transcript attribution. Adding rounds after the last one (`Add 2 more rounds`) is the same reconfiguration, and continuing without a member who never joined or failed is an explicit waiver through it (CWR-024, 2026-09-27).

### 6.4 Promotion

Room output becomes canon only through an explicit promotion action: promote a conclusion to a Plan, an action to a To-Do, an objective to a Goal, or an output to an artifact. Each promotion is a separate command, requires the ordinary owner's admission rules, and preserves source lineage back to the exact `collaboration_run_id`, `collaboration_message_id`, and participant identity that produced it. Promotion never bypasses the Plan, To-Do, or Goal owner; it produces a request that those owners admit or reject on their own terms. Discussion alone never changes the thread's To-Do list, never creates or edits a Plan, and never creates or edits a Goal.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Goal_Runtime_System.md

## 7. Review

### 7.1 Mode and strategies

Review is a primary Assistant mode with the submenu `Single Agent | Multi-Pass Review`. Multi-Pass Review is not retired; the earlier retirement of Multi-Pass Review as a user-facing capability is reversed. Selecting either choice opens the Review configuration modal. Review always reviews a frozen target and is always read-only.

The historical fixed Pass 1 / Pass 2 / Pass 3 model from the Requirements Doc Builder review flow in `Plans/chain-wizard-flexibility.md` is compatibility lineage only. Its records are source lineage for the Review runtime and must not be reactivated as live settings, and the new Review runtime must not adopt its fixed pass labels or its document-production coupling.

### 7.2 Frozen target pack

`ReviewTargetPack` freezes exactly what is being reviewed before any reviewer starts. It records `target_kind` closed to `assistant_response | agent_run | plan | changes | artifacts | task_result`, the exact `target_refs` and `target_hashes`, `user_constraint_refs`, `acceptance_refs`, `test_build_evidence_refs`, and `frozen_at`. The pack may include the assistant response or result, the latest Agent run, a Plan version, changes and diff, artifacts, test and build evidence, To-Dos and completion records, user constraints, and the requested review focus.

Reviewer context is fresh. It excludes the producer's hidden reasoning and self-justification while retaining the actual source and evidence required to review. A reviewer never inherits the producing agent's conversation state.

If the target changes after freeze, the existing review becomes stale. The user may finish the stale review with an explicit staleness disclosure, restart against a new freeze, or create a new review. Reviews taken against different `target_hashes` can never be silently merged, and a single `ReviewFinding` can never aggregate reviewer votes drawn from differing target hashes. On screen the frozen pack is called the snapshot (CWR-025, DL-134, 2026-09-27).

### 7.3 Single Agent

Single Agent Review creates one fresh-context reviewer with the selected model, account, and Persona against the frozen target pack. The modal selects model, Persona, target, included evidence, and review focus, and discloses the fresh-context boundary; its target control, focus-to-role mapping and Advanced rows are specified by CWR-025 (2026-09-27). Single Agent produces the same Review artifact contract as Multi-Pass with a single reviewer identity and no corroboration round.

### 7.4 Multi-Pass Review

Multi-Pass Review supports 1 to 8 reviewers with a default of 3. The same model may be selected for more than one reviewer slot; each slot still receives a unique attempt identity and an independent isolated session, and two slots on the same model are never collapsed. The modal configures target selector, strategy, reviewer count, per-reviewer model and Persona, fresh-context disclosure, inclusion of Plan, diff, artifacts, tests, and constraints, focus areas, which become reviewer roles, and the coordinator or adjudicator (CWR-025).

All initial passes are admitted concurrently and run blind against the same frozen pack. A reviewer's initial prompt and context contain no other reviewer's findings, partial output, or identity. Sequential contamination, where a later pass sees an earlier pass, is a defect.

### 7.5 Normalization, corroboration, and adjudication

After the initial passes complete, findings are structured and normalized for likely duplicates. Normalization groups candidate findings under a `finding_key` without losing any originating reviewer identity or evidence reference; the origin set is preserved on `originating_reviewer_ids` and every original evidence ref is retained.

Reviewers then receive the normalized candidate findings — not necessarily the full reports, which limits anchoring and context cost — and mark each with a disposition drawn from `confirmed | rejected | duplicate | uncertain`, together with evidence and confidence. Review severity, closed to `critical | major | minor | suggestion`, is a separate axis from disposition; a confirmed finding may be minor and a rejected finding may have been proposed as critical.

The coordinator or adjudicator produces the final disposition per finding and preserves unresolved material disagreement as recorded dissent. Manufacturing consensus by discarding a dissenting reviewer is forbidden. Vote counts inform adjudication; they do not replace reasoning, and a finding supported by evidence is not dismissed for being in the minority.

### 7.6 Output and follow-on actions

Review produces one versioned Review artifact rendered in Rich Text with a Markdown toggle, from the same version, containing target identity and hash, configuration and reviewer identities, executive result, confirmed findings, rejected and duplicate findings, uncertain findings, the agreement matrix and dissent, evidence, and suggested next actions. The artifact is read-only. A concise summary appears in the thread and links the artifact and the card.

Review never automatically repairs the target, never edits files, and never starts remediation on its own. Follow-on actions are explicit: `Send Findings To Agent`, `Create To-Dos`, `Run Another Review`, `Export`, and `Open Panel`. `Send Findings To Agent` fills the empty message box with a fix request and never sends it (CWR-031, DL-125, 2026-09-27). `Create To-Dos` converts selected confirmed findings into bounded To-Do items through the To-Do owner with lineage back to the finding; its default selection, the display-only re-run comparison and the partial and stale actions are specified by CWR-026 (2026-09-27). The `assistant.multi_agent.review.auto_repair` setting is locked off for this feature and is not a user-reachable escape hatch.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Runtime_Artifacts_Panel.md

## 8. BrainStorm

### 8.1 Position and output

BrainStorm is the third Deep Plan strategy, reached as `Deep Plan → BrainStorm`, and is a strict superset of Exhaustive. Everything Exhaustive does, BrainStorm does, plus multi-agent exploration, adversarial challenge, evidence rounds, voting, and adjudicated synthesis. BrainStorm is not a hidden routed overlay: the earlier model in which BrainStorm had no coherent configuration, card, or panel is retired. BrainStorm has its own configuration modal, its own transcript card, its own full panel, and its own Activity domain, exactly like the other three kinds.

BrainStorm always ends in exactly one synthesized Deep Plan document. The Plan document identity, version, hash, Rich Text and Markdown rendering, Build control, and the Deep Plan ledger and scoped PlanUnits are owned by `Plans/Assistant_Plan_Runtime.md`; BrainStorm owns the protocol that produces the content and hands it off. BrainStorm never creates a second Plan identity, never produces two competing Plans, and never bypasses the Plan owner's one-current-Plan-per-thread rule.

BrainStorm coverage is deliberately maximal: strongest external research, adversarial alternatives, cross-system effects, migrations, compatibility, security, performance, operations, rollback, and explicit uncertainty closure. A BrainStorm synthesis that omits a covered dimension states that it was considered and why it was not material rather than silently dropping it.

### 8.2 Authority and research provisioning

The target project is read-only for the entire BrainStorm run. No planning participant writes to the target project, and no participant mutates the host outside the approved provisioning service. Participants may use read, search, LSP, diff, browser, web, and artifact tools under the parent permission ceiling.

A participant request to install an MCP server, a media utility such as `ffmpeg`, or another research capability becomes a `ResearchCapabilityProvisioningOperation`. The operation resolves an existing capability first, prefers a temporary isolated run-scoped installation, and records source and version, license state, cost disclosure, credential requirement, elevation requirement, permission request ref, installation work ref, and cleanup requirement and receipt. Its state is closed to `resolving | approval_required | installing | ready | failed | cleaning | cleaned`, and the default effective scope is the run sandbox where feasible. A persistent project, host, or global installation requires ordinary explicit approval through the permission owner and is never implied by the BrainStorm run's own admission.

The provisioning record family is owned by `Plans/Shared_Integration_Runtime.md` together with `Plans/MCP_Integration.md` for MCP identity and `Plans/Permissions_System.md` for approval. BrainStorm owns only when a run may request provisioning and what the run must disclose; it does not own the installation lifecycle, coalescing, or `ObservableWork`.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md

### 8.3 Roster

The default roster is four core roles: Architecture, Product, Implementation, and Adversarial Review, each with its own model and Persona. Core count supports 2 to 8. The modal configures the effective question maximum, research strength, external browser and tool provisioning posture, blind proposals, debate rounds, voting mode, dissent preservation, core roles, additive roles, and time, token, cost, and concurrency limits.

Additive specialists — Wonderer and Grill Me — may push the total roster above the active concurrency. In that case the roster runs in waves rather than dropping or replacing a core role. A wave schedule never silently removes a configured participant, and the panel shows which participants are queued for a later wave.

### 8.4 Shared question bank

`QuestionBank` is one registry for the entire run, shared across every participant including additive specialists. It records `baseline_limit`, `grill_extension`, `effective_limit`, and the asked, resolved, duplicate, and research-routed question ID sets.

The BrainStorm base maximum of user-decision questions is 20. Grill Me raises the maximum by a configurable extension whose default is 25, so the default Grill Me effective maximum is 45. The modal states the arithmetic explicitly, showing `Maximum questions: 20` without Grill Me and `Maximum questions: 45 (20 + Grill Me 25)` with it; when Settings configure a different base or extension, the displayed arithmetic uses the configured values rather than the literals. The other five planning strategies carry their own bases -- Plan Quick 3, Standard 6, Thorough 8, Deep Thorough 10, Deep Exhaustive 15 -- and the same one extension, giving effective maxima of 28, 31, 33, 35, and 40. `Plans/Assistant_Plan_Runtime.md` (`QMAX-001..016`) owns the table, the single shared counter, the charge point, and typed exhaustion.

Questions already asked count toward the effective maximum. Enabling Grill Me mid-flow raises the ceiling and never resets the count. The allowance is a workflow-level shared budget, not a per-participant budget, so adding participants does not inflate the number of questions the user is asked.

Answered questions from the current thread are imported and are not asked again. Semantic duplicates across participants are merged into one registry entry with all requesting participants recorded. Factual questions that an agent can answer are routed to research rather than asked of the user, and the routed set is recorded on the bank. Remaining user-decision questions are batched through the existing questionnaire choreography rather than delivered as a stream of single prompts. The run stops asking before the maximum when the decision frontier is empty; reaching the maximum is a ceiling, not a target.

### 8.5 Protocol

BrainStorm runs seven ordered phases on one `CollaborativeRun`; their plain display labels are mapped one to one in CWR-027 (2026-09-27):

1. **Intake and frontier.** Establish constraints, gather research facts, and ask the unresolved user decisions that the shared question bank admits.
2. **Blind proposals.** Each core participant produces an independent proposal in a fresh context. No participant sees another participant's proposal, partial output, or identity before submitting its own. Proposal cross-contamination is a defect.
3. **Normalize.** Each proposal is normalized into approach, assumptions, benefits, costs, risks, migrations, cross-system effects, validation, and rollback, with evidence refs and the proposal round.
4. **Debate.** Participants challenge assumptions, expose conflicts and dependencies, propose hybrids, and request targeted research. Debate rounds default to two and are configurable.
5. **Evidence round.** Factual disagreements are resolved with bounded research rather than assertion. Research assignments are distinct per participant and cite sources.
6. **Vote.** Each participant records `position` closed to `support | oppose | abstain`, plus confidence, reason, evidence refs, and any hard-constraint conflicts it has identified.
7. **Synthesis.** The coordinator selects the best option or a justified hybrid, preserves material dissent, explains rejected alternatives, and produces the standardized Deep Plan content and ledger input.

### 8.6 Voting and hard constraints

A hard user-constraint violation disqualifies an option regardless of vote count. A disqualified option is recorded with the exact constraint it violates and remains visible in the rejected-alternatives section; it is never silently dropped and never revived by a majority. Voting informs synthesis and is not a simplistic majority replacement for reasoning: the synthesis states why the selected approach won, including cases where a minority position carried better evidence. Hard constraints are the definition's `hard_constraints[]`, frozen at Start; the voting labels, the synthesis-model and provisioning rows and the tie action `tie_resolution: coordinator` are specified by CWR-027 (2026-09-27).

Dissent that remains unresolved after the evidence round is preserved verbatim in the synthesis, with the dissenting participant identity, its position, its confidence, and its evidence. A synthesis that reports unanimity where dissent was recorded is a defect.

### 8.7 Plan handoff and card linkage

When synthesis completes, BrainStorm requests Plan creation through `cmd.brainstorm.synthesize_plan`, which returns the Plan owner's create result. The Plan card is created immediately after, or closely linked to, the BrainStorm card, and `Open Plan` routes to it. The BrainStorm process card remains in the transcript after the Plan exists, retains its full transcript, participants, proposals, votes, and dissent, and continues to open its panel. Replacing the BrainStorm card with the Plan card is a defect.

BrainStorm never claims child-Goal authority. Older BrainStorm canon that modeled the run as a child-Goal topology is retired; BrainStorm state is `CollaborativeRun` state, and a Goal may drive a BrainStorm by reference without absorbing its records.

## 9. Wonderer and Grill Me participant roles

### 9.1 Boundary

Wonderer is a built-in Persona plus a reusable built-in methodology Skill. Grill Me is a reusable methodology Skill applied through a dedicated participant role, and never a Persona (DL-133). Persona identity, storage, schema, and selection are owned by `Plans/Personas.md`; Skill identity, discovery, `SKILL.md` format, and bounded materialization are owned by `Plans/Skills_System.md`. This document owns only the participant-role semantics of Wonderer and Grill Me inside Crew, BrainStorm, and Chat Room, and it references the Persona and Skill owners for everything else.

Neither role is implemented as an external profile subsystem. There is no profile home, no profile configuration file, and no parallel profile registry. `additive_role_kind` on `ParticipantSpec`, closed to `none | wonderer | grill_me`, is the only workflow-side marker.

### 9.2 Wonderer role semantics

A Wonderer participant explores adjacent domains, precedents, inversions, contradictions, scale boundaries, hidden dependencies, and human factors around the seed topic. It selects a few promising exploration dimensions rather than browsing randomly, and it produces roughly three to five useful connected leads. Every lead states its connection back to the seed topic; a lead that cannot articulate that connection is drift and is dropped.

Wonderer output is labeled as hypothesis until researched. A Wonderer lead never becomes an accepted fact, a Plan decision, or an acceptance criterion without research, evidence, or an explicit user decision. Wonderer participates in debate and may hand leads to the evidence round; when its leads were not substantiated it should abstain from the final vote rather than voting on unsupported ground. The user may ask for one lead to be researched through `cmd.brainstorm.research_lead` (CWR-031, 2026-09-27).

### 9.3 Grill Me role semantics

A Grill Me participant maps decision dependencies as a frontier: the set of decisions whose prerequisites are already settled. It asks the whole current frontier in one round, gives a recommended answer for each question, and waits before recomputing the frontier for the next round. A question whose answer depends on another question still open in the current round belongs to a later round.

Grill Me routes answerable factual questions to research agents instead of asking the user; finding facts is the workflow's job and deciding is the user's. Accepted answers are captured in the active Plan, PRD, or Wizard state through those owners. Grill Me has no implementation authority: it cannot mutate the target project, cannot start execution, and cannot approve anything.

Grill Me is what raises the effective question maximum. It uses the same shared question bank as every other participant, so enabling it adds allowance without adding duplicate questions, and per-agent duplicate inflation is impossible by construction.

### 9.4 Placement

Wonderer and Grill Me appear as additive checkboxes in the BrainStorm, Crew, and Chat Room configuration modals in the `Add specialists` shelf. Selecting either adds a dedicated participant row with its own model (Wonderer also its Persona) and never overwrites or repurposes a core row; specialists are refused in Crew Auto teams and in scheduled-build Crews (CWR-028, 2026-09-27). The Deep Plan submenu footer carries a persistent `Grill Me` check option that applies to the next Deep Plan invocation and visually matches the existing auxiliary-row pattern without being confused with model effort.

PRD Builder and Planning Wizard start flows offer BSD, Wonderer, and Grill Me; Wonderer runs early and Grill Me runs near the end of discovery or topic work, with a shared global question history preventing repetition across topics. Those placements are owned by `Plans/PRD_Builder.md` and `Plans/Planning_Wizard.md` and are named here only to fix the shared-registry boundary. Wonderer and Grill Me do not participate in hidden PlanUnit, WorkNode, audit, execution, or certification stages unless explicitly invoked as ordinary agents for a relevant visible planning task; Back Seat Driver may cover those stages under `Plans/Back_Seat_Driver.md`.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Skills_System.md, ContractName:Plans/PRD_Builder.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Back_Seat_Driver.md

## 10. Exact commands and required result boundaries

The exact collaborative command IDs owned by this document are listed below. They are canonical owner requests. They are **not registered** until the central command catalog, event catalog, and production wiring rows adopt them. Until that registration closes, GUI controls bound to them remain disabled with `command_not_registered`; no page-local handler, alias, or fixture may simulate success. Existing IDs must be censused before new rows are added, and a legacy ID becomes a compatibility alias only where one-to-one semantics are provable.

| Command ID | Kind | Request / Result | Required result boundary |
|---|---|---|---|
| `cmd.collaboration.configure` | shell_view | `CollaborationConfigureRequest` / `CollaborationConfigureResult` | Opens the configuration modal prefilled from Settings defaults and any prior committed definition. Creates no run, no card, and no Usage; committing returns the definition revision only. |
| `cmd.collaboration.start` | domain_action | `CollaborationStartRequest` / `CollaborationStartResult` | Requires a committed definition revision. Idempotent: a repeated key returns the original `collaboration_run_id` and receipt. Returns run identity, state, participant slot identities, and the requested/effective snapshot ref. |
| `cmd.collaboration.pause` | domain_action | `CollaborationPauseRequest` / `CollaborationPauseResult` | Reaches a safe boundary, preserves participant state, inbox, transcript, artifacts, and composer-target text. Returns exact run state; never discards work. |
| `cmd.collaboration.resume` | domain_action | `CollaborationResumeRequest` / `CollaborationResumeResult` | Continues the same run. Creates no duplicate participant work and no second run identity. Fails closed when an owner condition still blocks resumption, naming the reason. |
| `cmd.collaboration.cancel` | domain_action | `CollaborationCancelRequest` / `CollaborationCancelResult` | Stops new admissions, retains card, transcript, participants, and artifacts with truthful `cancelled` state, and returns a cancellation receipt. Never deletes transcript or artifacts. |
| `cmd.collaboration.message` | domain_action | `CollaborationMessageRequest` / `CollaborationMessageResult` | Delivers one user message to the run or to addressed participants exactly once, writes one durable message referenced by both the thread and the collaboration transcript, and revalidates destination `state_generation` before dispatch. Unavailable on a `completed`, `cancelled` or `failed` run, with the printed reason. |
| `cmd.collaboration.open` | navigation_wrapper | `CollaborationOpenRequest` / `CollaborationOpenResult` | Navigation only. `target` is `card \| run_view \| activity_detail` with an optional `focus` (tab, `participant_id` or `finding_id`); `run_view` is the run's editor document (CWR-020). Cannot start, pause, resume, or mutate a run, and route success is not run success. |
| `cmd.collaboration.participant.open` | navigation_wrapper | `CollaborationParticipantOpenRequest` / `CollaborationParticipantOpenResult` | Navigation only. Opens the exact participant transcript with requested/effective identity, assignment, tools, artifacts, Usage, and state. An empty participant returns a truthful empty transcript. |
| `cmd.collaboration.export` | domain_action | `CollaborationExportRequest` / `CollaborationExportResult` | `content_kind` is `transcript \| result_artifact \| report`, beside the format. Exports the referenced transcript or artifact version and hash through the artifact and file owners. Never re-renders or re-generates content as part of export. |
| `cmd.collaboration.reconfigure` | domain_action | `CollaborationReconfigureRequest` / `CollaborationReconfigureResult` | Bumps the definition revision under an expected-revision check, records a `system` transcript entry, and never rewrites prior transcript attribution or widens the permission ceiling. Available only while the run is `waiting`, `running`, `blocked` or `paused`; a completed run is run again through configure and a new start. `accept_stale_target: true` finishes a stale Review on its old pack with a staleness disclosure and requires `target_pack_stale`. |
| `cmd.brainstorm.next_round` | domain_action | `BrainstormRoundRequest` / `BrainstormRoundResult` | Advances exactly one protocol round under the configured debate policy. Cannot skip the blind-proposal phase and cannot exceed configured debate rounds. |
| `cmd.brainstorm.synthesize_plan` | domain_action | `BrainstormSynthesisRequest` / `AssistantPlanCreateResult` | Requests Plan creation from the Plan owner and returns that owner's create result. Creates exactly one Plan, preserves dissent and rejected alternatives in the synthesis, and leaves the BrainStorm card in place. Accepts `tie_resolution: coordinator` on a tied vote. |
| `cmd.brainstorm.research_lead` | domain_action | `BrainstormLeadResearchRequest` / `BrainstormLeadResearchResult` | Asks a running or waiting BrainStorm run to research one Wonderer lead. The lead stays a hypothesis until research returns evidence; the result records that evidence or the reason the lead was set aside. Never accepts a lead as fact without evidence. |
| `cmd.review.create_todos` | domain_action | `ReviewCreateTodosRequest` / `ReviewCreateTodosResult` | Converts explicitly selected confirmed findings into bounded To-Do items through the To-Do owner with lineage back to each `finding_id`. Never converts rejected, duplicate, or uncertain findings implicitly. |
| `cmd.review.send_findings_to_agent` | domain_action | `ReviewSendFindingsRequest` / `ComposerBufferResult` | Writes a fix request built from the selected findings into the source thread's empty composer buffer and never sends it; refuses `composer_not_empty` when the buffer holds text. Lineage is in message metadata, never in the text. Performs no repair, no file mutation, and no automatic follow-on run. |
| `cmd.review.run_again` | domain_action | `ReviewRunAgainRequest` / `CollaborationStartResult` | Starts a new review run against a newly frozen target pack. Never merges results into the prior run and never reuses a stale `ReviewTargetPack`. |
| `cmd.chat_room.next_round` | domain_action | `ChatRoomRoundRequest` / `ChatRoomRoundResult` | Advances exactly one round under the active turn policy without changing that policy. Returns the deterministic participant order used. |
| `cmd.chat_room.summarize` | domain_action | `ChatRoomSummarizeRequest` / `ArtifactResult` | Produces a synthesis artifact through the artifact owner. Creates no To-Do, Plan, or Goal and does not end the room. |
| `cmd.chat_room.promote_to_plan` | domain_action | `ChatRoomPromotePlanRequest` / `ChatRoomPromotePlanResult` | Explicit promotion only. Routes to the Plan owner with source lineage to run, message, and participant. The Plan owner admits or rejects; promotion never bypasses its rules. |
| `cmd.chat_room.promote_to_todo` | domain_action | `ChatRoomPromoteTodoRequest` / `ChatRoomPromoteTodoResult` | Explicit promotion only. Routes to the To-Do owner with source lineage. Never mutates the thread To-Do list directly. |
| `cmd.chat_room.promote_to_goal` | domain_action | `ChatRoomPromoteGoalRequest` / `ChatRoomPromoteGoalResult` | Explicit promotion only. Routes to the Goal owner with source lineage and its approval rules. Never edits Goal text directly. |
| `cmd.chat_room.end` | domain_action | `ChatRoomEndRequest` / `ChatRoomEndResult` | Ends a running, waiting, or paused room: no further rounds or messages, and the run settles `completed`, never `cancelled`. Promotion of existing messages stays allowed. Distinct from `cmd.collaboration.cancel`. |
| `cmd.chat.crew_auto.set` | domain_action | `CrewAutoSetRequest` / `CrewAutoSetResult` | Sets Crew Auto at the scope its request names (CWR-038): `thread`, from a chat's check, sets only that chat's override of the project value; `project`, from the Crew Auto sheet, commits the rules and the team in one `CrewAutoSetRequest` and turns Crew Auto on for the project. An enable that finds no stored Crew Auto configuration returns `configuration_required` and changes no check. Commits before any check changes. Cannot widen authority. |
| `cmd.chat.crew_auto.open_config` | shell_view | `CrewAutoConfigRoute` / `RouteResult` | Opens the Crew Auto configuration modal. Route success is not enablement; the check state changes only through `cmd.chat.crew_auto.set`. |

Source surfaces for the ten `cmd.collaboration.*` rows are `workflow_modal`, `workflow_card`, `workflow_panel`, `activity`, and `composer`. `cmd.brainstorm.*` surfaces are `brainstorm_card` and `brainstorm_panel`, and `cmd.brainstorm.research_lead` also `wonderer_workspace`, the Wonderer workspace surface the central catalog registers (CWR-031; Plans/UI_Command_Catalog.md UCC-169, UCC-171); `cmd.review.*` surfaces are `review_card` and `review_panel`; `cmd.chat_room.*` surfaces are `chat_room_card` and `chat_room_panel`; `cmd.chat.crew_auto.set` surfaces are `multi_agent_menu` and `crew_auto_modal`; `cmd.chat.crew_auto.open_config` surfaces are `multi_agent_menu`, `workflow_modal` and `crew_auto_receipt` (CWR-038).

`cmd.chat.plan.build_with_crew`, owned by `Plans/Assistant_Plan_Runtime.md`, is produced by the Crew sheet in Build With Crew mode and never decomposes into `cmd.collaboration.start`. The revisions to `open`, `reconfigure`, `message`, `export`, `synthesize_plan` and `send_findings_to_agent` above, and the rows `cmd.chat_room.end` and `cmd.brainstorm.research_lead`, are specified by CWR-031 (2026-09-27).

## 11. Typed requests, results, errors, and availability

Every collaborative mutation request reuses the central command and runtime envelopes and carries, as applicable, `schema_id`, `schema_version`, `command_id`, `command_instance_id`, `project_id`, `thread_id`, `object_id`, `expected_revision`, `expected_currentness_hash`, `actor_identity`, `permission_snapshot_id`, `idempotency_key`, `source_surface`, `correlation_id`, `causation_id`, and `created_at`.

Every collaborative mutation result carries `status`, `committed`, the revision and currentness after the mutation, receipt refs, an `observable_work` ref when the work is asynchronous, an error or reason enum when not committed, and `replay_of` when the result is an idempotent replay. A UI acknowledgement is never domain success, and a rendered card is never proof that a run was admitted.

The typed error enumeration for this owner is `invalid_request`, `project_not_found`, `thread_not_found`, `collaboration_not_found`, `collaboration_run_not_found`, `participant_not_found`, `stale_definition_revision`, `stale_currentness`, `configuration_required`, `configuration_not_committed`, `duplicate_id_conflict`, `command_not_registered`, `permission_denied`, `permission_ceiling_exceeded`, `model_unavailable`, `persona_unavailable`, `account_unavailable`, `substitution_not_permitted`, `concurrency_ceiling_exceeded`, `target_pack_stale`, `target_hash_mismatch`, `question_limit_reached`, `provisioning_approval_required`, `read_only_violation`, `destination_generation_stale`, `destination_target_ended`, `run_state_invalid`, `owner_unavailable`, or `cancelled`. A failure remains a failure: it never advances run state, never emits a success-shaped receipt, and never produces a card that implies work occurred.

Availability payloads name the exact missing prerequisite — central catalog registration, Event Authority registration, native handler, storage binding, provider or model availability, permission decision, or production wiring row — rather than reporting a generic disabled state. `target_hash_mismatch` and `target_pack_stale` are always distinguishable so the Review surface can offer finish-stale, restart, or new-review without guessing.

## 12. Records, schemas, and data shapes

This document is the semantic owner of the following record families. Physical key encoding, seglog and index behavior, encryption, retention, and transaction implementation remain owned by `Plans/storage-plan.md` and the shared contracts.

| Schema ID | Record | Ownership note |
|---|---|---|
| `pm.collaboration.definition.v1` | `CollaborativeDefinition` | Owned here. Carries `collaboration_id`, `kind`, `project_id`, `thread_id`, `name`, `purpose`, `revision`, `participant_specs`, `coordinator_spec` (typed, CWR-037), `context_policy_ref`, `tool_policy_ref`, `permission_ceiling_ref`, `concurrency`, `time_limit_seconds`, `token_limit`, `cost_limit`, `transcript_policy`, `output_policy`, `stuck_policy`, `shared_notes_policy` (Crew), `evidence_citation_rule` (Review), `moderator_style`, `mention_policy`, `stop_condition`, `summary_style` (Chat Room), `hard_constraints` and `provisioning_posture` (BrainStorm); see CWR-032. |
| `pm.collaboration.participant_spec.v1` | `ParticipantSpec` | Owned here. Carries `participant_slot_id`, `role`, `requested_provider_id`, `requested_account_id`, `requested_model_id`, `requested_persona_id`, `requested_skill_ids`, `requested_tool_profile_id`, `additive_role_kind`. A specialist is a spec with `additive_role_kind` set and its own requested model (CWR-028). Effective values live in the runtime assignment record with a substitution or failure reason. |
| `pm.collaboration.run.v1` | `CollaborativeRun` | Owned here. Carries `collaboration_run_id`, `collaboration_id`, `definition_revision`, `kind`, `parent_run_id`, `assistant_plan_id`, `plan_version`, `goal_id`, `state`, `participant_run_refs`, `coordinator_run_ref`, `transcript_ref`, `artifact_refs`, `usage_group_ref`, `requested_effective_snapshot_ref`, `admission_source`, `crew_auto_revision`, `stop_reason` (on a `cancelled` run only, CWR-029), `created_at`, `completed_at`. |
| `pm.collaboration.message.v1` | `CollaborationMessage` | Owned here. Carries `collaboration_message_id`, `collaboration_run_id`, `sender_kind`, `sender_id`, `recipient_ids`, `message_type`, `body_ref`, `reply_to`, `attachment_refs`, `created_at`, `sequence`. The `collaboration_message_id` of a participant's or coordinator's message is allocated when the message starts streaming, and the record is written once, when the message is complete, with its `sequence` assigned at that write (EP-129, EP-130). |
| `pm.brainstorm.question_bank.v1` | `QuestionBank` | Owned here. Carries `brainstorm_run_id`, `baseline_limit`, `grill_extension`, `effective_limit`, `asked_question_ids`, `resolved_question_ids`, `duplicate_question_ids`, `research_routed_question_ids`. |
| `pm.brainstorm.proposal.v1` | `BrainstormProposal` | Owned here. Carries `proposal_id`, `participant_id`, `approach`, `assumptions`, `benefits`, `costs`, `risks`, `migrations`, `cross_system_effects`, `validation`, `rollback`, `evidence_refs`, `proposal_round`. |
| `pm.brainstorm.vote.v1` | `BrainstormVote` | Owned here. Carries `vote_id`, `proposal_id`, `participant_id`, `position`, `confidence`, `reason`, `evidence_refs`, `hard_constraint_conflicts`. |
| `pm.review.target_pack.v1` | `ReviewTargetPack` | Owned here. Carries `review_run_id`, `target_kind`, `target_refs`, `target_hashes`, `user_constraint_refs`, `acceptance_refs`, `test_build_evidence_refs`, `frozen_at`. |
| `pm.review.finding.v1` | `ReviewFinding` | Owned here. Carries `finding_id`, `review_run_id`, `finding_key`, `category`, `severity`, `claim`, `affected_object_refs`, `evidence_refs`, `originating_reviewer_ids`, `reviewer_votes`, `disposition`, `confidence`, `dissent`, `proposed_remediation`. A finding never aggregates votes drawn from differing target hashes. |
| `pm.chat.composer_destination.v1` | `ComposerDestination` | Consumed, not owned. The Chat and storage owners own the buffer and destination record; this document owns the collaborative `destination_kind` values, the revalidation rule, and the destination edge cases. |
| `pm.research.capability_provisioning.v1` | `ResearchCapabilityProvisioningOperation` | Consumed, not owned. `Plans/Shared_Integration_Runtime.md` owns the provisioning lifecycle; this document owns when a BrainStorm run may request it and what the run must disclose. |

The closed enumerations owned here are `kind` (`crew | brainstorm | review | chat_room`), run `state` (`configuring | running | paused | waiting | blocked | completed | cancelled | failed`), `sender_kind` (`user | participant | coordinator | system`), `message_type` (`message | request | response | warning | conflict | dependency | handoff | vote | finding | pass`), `additive_role_kind` (`none | wonderer | grill_me`), Crew `assignment_strategy` (`manager_directed | explicit_static | adaptive`), Chat Room `turn_policy` (`moderated | round_robin | free_discussion | ask_everyone_once`), Review `target_kind` (`assistant_response | agent_run | plan | changes | artifacts | task_result`), Review `disposition` (`confirmed | rejected | duplicate | uncertain`), Review `severity` (`critical | major | minor | suggestion`), BrainStorm vote `position` (`support | oppose | abstain`), run `admission_source` (`user | crew_auto | build_with_crew | scheduled_build`), Crew `shared_notes_policy` (`shared_space | private_per_participant`), BrainStorm `provisioning_posture` (`ask_first | never_install`), definition `coordinator_spec` kind (`parent_assistant | participant_slot | dedicated_model`, CWR-037), and run `stop_reason` (`user_cancel | limit_time | limit_cost | limit_tokens`). The closed value sets of command payloads, projections and presentation are closed in the units that define them, not in this list: `CollaborationOpenRequest` `target` and `CollaborationExportRequest` `content_kind` (section 10, CWR-031), `CrewAutoSetRequest` scope (CWR-038), the completion projection's `attention_reason` (CWR-029), the participant activity projection's `state` (CWR-030) and the card densities (CWR-019).

Schema and fixture closure for these records requires a dedicated contracts schema and fixture pair registered through the central contracts process. That pair is `Plans/collaborative_workflows_contracts.schema.json` with `Plans/collaborative_workflows_contract_fixtures.json`, registered in the closed `CONTRACT_PAIRS` manifest of `scripts/pm-new-contracts-verify.py` (ATS-062, 2026-09-27). It also holds the participant disposition, the completion and participant activity projections (CWR-029, CWR-030, with `live_message_id`), the presentation-only binding of a helper message in progress that Plans/Executor_Protocol.md EP-129 defines (DL-137), which the pair names `CollaborationMessageInProgress`, the team preset (CWR-039) and the request and result of every command in section 10. It proves shape only and admits no writer, storage key, EventRecord or handler, so no writer may persist these records and no surface may claim persistence proof until the storage and Event Authority registrations close.

## 13. Events

The required semantic event names owned by this document are:

```text
collaboration.created
collaboration.started
collaboration.paused
collaboration.resumed
collaboration.cancelled
collaboration.completed
collaboration.participant_started
collaboration.participant_completed
collaboration.message_added
collaboration.artifact_added
collaboration.configuration_changed
brainstorm.proposal_added
brainstorm.vote_added
brainstorm.plan_synthesized
review.finding_added
review.finding_dispositioned
review.artifact_finalized
```

These names require central EventRecord registration and payload schema adjudication before any emission. Until that registration closes, emission remains disabled and no surface may treat a rendered state change as an emitted event. Event envelopes carry project, thread, collaboration, run, and participant identity where applicable, definition revision, actor, correlation and causation IDs, idempotency key, currentness, and redacted source refs. A failed or replayed command emits no duplicate event.

The participant activity projection (CWR-030) is derived on read from these events, the run and attempt records, `tool.execution_*` events and the assistant-turn presentation stream of EP-128; it adds no event name and is never emitted (2026-09-27). A message in progress (CWR-040, EP-129) adds no event name either: `collaboration.message_added` is emitted once for a participant's or coordinator's message, when it is written, and never for a streamed frame or for a message in progress that is never written (EP-130, EP-131, DL-137).

## 14. Settings boundary

Settings stores ordinary project-bound defaults and renders the manager. This document stores the actual run and the frozen effective roster. Settings never stores a run, a transcript, a participant assignment, a finding, a vote, or a question bank; this document never becomes a second settings store.

Settings provides a **Multi-Agent Workflows** manager with `Crew`, `BrainStorm`, `Review`, and `Chat Room` tabs. The default keys it owns are `assistant.multi_agent.crew.participant_count` (3), `assistant.multi_agent.crew.coordinator` (`parent_assistant`), `assistant.multi_agent.crew.assignment_strategy` (`manager_directed`), `assistant.multi_agent.crew.parallelism` (3), `assistant.multi_agent.crew.auto_enabled` (false), `assistant.multi_agent.crew.auto_complexity` (`high`), `assistant.multi_agent.crew.auto_max_members` (4), `assistant.multi_agent.brainstorm.core_participants` (4), `assistant.multi_agent.brainstorm.question_limit` (20), `assistant.multi_agent.grill_me.question_extension` (25), `assistant.multi_agent.brainstorm.external_research` (`maximum`), `assistant.multi_agent.brainstorm.independent_proposals` (true), `assistant.multi_agent.brainstorm.debate_rounds` (2), `assistant.multi_agent.brainstorm.voting` (`evidence_weighted`), `assistant.multi_agent.brainstorm.preserve_dissent` (true), `assistant.multi_agent.review.strategy` (`multi_pass`), `assistant.multi_agent.review.reviewer_count` (3), `assistant.multi_agent.review.blind_initial_pass` (true), `assistant.multi_agent.review.peer_corroboration` (true), `assistant.multi_agent.review.preserve_dissent` (true), `assistant.multi_agent.review.auto_repair` (false, locked off for this feature), `assistant.multi_agent.chat_room.participant_count` (4), `assistant.multi_agent.chat_room.turn_policy` (`moderated`), and `assistant.multi_agent.chat_room.max_rounds` (5). The Deep Plan Grill Me toggle uses `assistant.chat.deep_plan.grill_me_default` (false).

These keys require Settings inventory census and registration through `Plans/Settings_System.md` and `Plans/settings_inventory.json`; they are named here to fix the ownership boundary, not to claim registration. A default read at modal-open time is a snapshot: changing a Settings default afterward never retroactively alters a committed definition or a running run. The effective roster frozen at start is the run's truth, and the panel shows it even after Settings change.

ContractRef: ContractName:Plans/Settings_System.md

## 15. Recovery, restart, and negative paths

A collaborative run is durable. Closing the client, switching threads, switching projects, reloading, or crashing does not cancel a run, does not lose participant transcripts, and does not silently restart a protocol round.

On restart the runtime rehydrates the `CollaborativeRun`, its frozen effective roster, every `CollaborationMessage`, and any produced artifacts from durable records rather than from conversation context. A participant whose attempt was in flight when the process stopped is reported by its executing owner; the runtime then records exactly one terminal result for that attempt. Replay of an already-recorded participant completion is idempotent on the attempt identity.

Negative paths that must behave exactly as stated:

- **A participant fails.** The run continues where the protocol permits it and records the failure against that participant. A failed participant never silently disappears from the roster and never has its output fabricated. Where a protocol requires that participant (a Review pass whose reviewer never produced findings, a BrainStorm proposal round with one proposer), the run reports a degraded result naming the missing participant rather than presenting a complete-looking consensus.
- **Requested identity is unavailable.** The requested model, account, or Persona is recorded, the effective one is recorded, and the difference is visible on the participant row and in the panel. There is no silent substitution. Where no acceptable substitute exists the participant is disabled with its reason rather than being run on an arbitrary model. Before Start, a chosen model that is unavailable blocks Start until the user replaces it (CWR-034, DL-121, 2026-09-27).
- **A permission is denied mid-run.** The affected participant stops, the denial reason is surfaced, and the rest of the run continues if the protocol allows. A participant never self-approves and never escalates its own ceiling.
- **The user Stops.** Manual Stop, Pause, and Cancel outrank every automatic continuation, Crew Auto included, under the precedence in `Plans/Scheduling_and_Quota_Resume.md` §1. A stopped run does not resume on a quota reset or a window opening.
- **Quota is exhausted mid-run.** The run enters the shared quota wait owned by `Plans/Scheduling_and_Quota_Resume.md`. Transcripts and the frozen roster are preserved; the run is not restarted from the beginning when it resumes.
- **The composer destination target disappears.** A destination pointing at a cancelled run or a removed participant is cleared with a visible reason, and the composer returns to the ordinary thread destination rather than sending into nothing.
- **A Review target changes.** Mixed target versions cannot form one consensus. A pass run against a different frozen target pack is excluded from corroboration and reported as such.

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

## 16. Provider boundary and control

Puppet Master owns the canonical collaborative state across direct, SDK, CLI, and server providers. A provider adapter may translate a Puppet Master participant request into a provider request and a provider event into a normalized Puppet Master event. Translation never transfers authority.

Provider-native multi-agent, sub-session, or team constructs are not the canonical run. Where a provider exposes one, it is disabled, redirected into the canonical run, or marked noncanonical, and its state is never read back as Puppet Master truth. Participant tools, MCP servers, skills, permissions, and artifacts remain owned by `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/Skills_System.md`, `Plans/Permissions_System.md`, and the artifact owners respectively.

Where an adapter genuinely cannot express a required capability — no per-participant model selection, no isolated context, no tool restriction — the constraint is **disclosed** on the participant row and in the configuration modal. It is never hidden and never described as full control. A workflow kind that cannot run faithfully on a given adapter is unavailable there with its reason, rather than degraded silently.

Temporary research capability provisioning — isolated MCP servers, packages, or tools granted for a BrainStorm or research participant — is requested through `Plans/MCP_Integration.md` and `Plans/Tools.md`, is permission-gated, is scoped to the run, and is torn down when the run ends. There is no workflow-local MCP or tool registry.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md

## 17. Migration and supersession

Two prior models are superseded and require migration.

**BrainStorm as a hidden routed overlay.** Prior BrainStorm behavior had no coherent configuration, card, or panel. Migration converts any retained BrainStorm state into a `CollaborativeRun` of kind `brainstorm` with a synthesized definition, records the participants that can be recovered, and marks the remainder as unrecoverable in the migration receipt. It never fabricates a proposal, a vote, or a dissent record that was not stored.

**Retirement of Multi-Pass Review.** That retirement is reversed. Multi-Pass Review is restored as a user-facing capability with 1–8 reviewers and a default of 3. Legacy fixed "Pass 1 / Pass 2 / Pass 3" structures migrate to a `review` run with three reviewer participants and a recorded note that the pass identities were positional rather than configured. The old fixed three-pass system is not preserved as an alternate code path.

**Crew as an On/Off switch.** That model is retired. A legacy Crew boolean migrates to a `crew` definition with the default participant count, coordinator, assignment strategy, and parallelism drawn from Settings at migration time, and `auto_enabled` set to the legacy boolean's value. Enabling Crew Auto still requires a committed configuration before a run may start. The redesign concept's per-chat "Allow Crews in this chat" switch is not adopted: the only per-chat Crew control is the chat's Crew Auto check, an override of the project value (section 5.3, CWR-004, DL-120, 2026-09-27).

Migration receipts record converted runs, unrecoverable state, synthesized defaults, and residual risk. A run whose thread or Project edge cannot validate quarantines rather than being attached to a guess.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## 18. Verification

Structural tests validate every record schema and fixture, the closed four-value kind enum, the participant requested-versus-effective fields, the frozen-roster invariant, and the absence of four parallel stores — one shared code path and one shared contract must be provably reused by all four kinds.

Behavioral tests must prove that each kind opens its configuration modal populated from Settings defaults; that a changed Settings default does not retroactively alter a committed definition or a running run; that per-participant model and Persona selection applies and that repeated model choices are permitted; that clicking a participant opens that participant's own transcript; that a card expands inline and opens the same run in its run view, the document docked in the editor pane (CWR-020); that `Message` targets the ordinary composer with visibly changed chrome naming the destination; and that the target ribbon and participant transcripts survive a restart.

Protocol tests must prove that Crew Auto cannot start without a committed configuration and cannot widen authority; that ordinary Chat Room discussion creates no To-Do, Plan, or Goal without an explicit promotion; that Review initial passes are concurrent, blind, and run against one frozen target pack, that mixed target versions cannot form one consensus, and that Review never auto-repairs; that BrainStorm runs independent proposals before debate, is read-only against the target project, preserves dissent, and outputs exactly one Deep Plan document; and that Grill Me raises the effective question maximum from the base of 20 by the configured extension of 25 to 45 without per-agent duplicate inflation.

Negative tests must prove that a failed participant produces a degraded, named result rather than a fabricated one; that an unavailable requested identity is disclosed rather than substituted; that a participant cannot self-approve; that a manual Stop defeats every automatic continuation; and that a provider-native multi-agent construct is never read back as canonical state.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Progression_Gates.md

## 19. Plan Units

### CWR-001 - One Collaborative Runtime With Four Protocols

```yaml
plan_unit_id: CWR-001
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Puppet Master has exactly four user-invocable collaborative workflow kinds, closed as crew, brainstorm, review, and chat_room. They are one runtime with four protocols, not four products. Every kind reuses the same participant assignment, transcript, artifact, card, panel, Activity, Usage, recovery, and composer-target infrastructure. A kind-specific protocol may add fields and actions but may not fork core storage, core lifecycle, or core identity, and four independent agent or session stores are forbidden. Collaboration is the durable configuration identity, CollaborativeRun is one execution of it, Participant is one configured slot, and CollaborationMessage is one durable transcript entry.
gui_related: true
gui_classification_reason: The shared card, panel, participant row, and Activity domain are rendered identically for all four kinds.
depends_on: []
unblocks: [CWR-002, CWR-003]
acceptance_criteria:
  - One shared code path and contract is provably reused by all four kinds.
  - No kind maintains its own agent, session, transcript, or artifact store.
  - The kind enum is closed at four values.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: four_duplicate_collaborative_runtimes
reasoning_tier: high
context_scope: collaborative_shared_runtime
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Concepts/chat-assistant-concepts/5.6 Pro/collaboration.js
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-001
  - pm-assistant-implementation-2026-09-02-recovered:07_DRY_OWNERSHIP_MAP.md#5
preserved_exact_tokens:
  - "crew | brainstorm | review | chat_room"
  - "CollaborativeRun"
negative_constraints:
  - Do not fork core storage or lifecycle per kind.
  - Do not add a fifth workflow kind without owner adjudication.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-002 - Configuration Modal, Settings Defaults, And Frozen Effective Roster

```yaml
plan_unit_id: CWR-002
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Every invocation opens its kind-specific configuration modal populated from Settings defaults, and each participant slot supports selectable model and Persona with repeated choices allowed. The default read at modal-open time is a snapshot: changing a Settings default afterwards never retroactively alters a committed definition or a running run. Starting a run freezes the effective roster, which becomes the run's truth and remains visible in the panel even after Settings change. Requested and effective model, account, and Persona are both recorded and the difference is disclosed on the participant row; there is no silent substitution, and where no acceptable substitute exists the participant is disabled with its reason.
gui_related: true
gui_classification_reason: This unit defines the modal, its participant rows, and the requested-versus-effective disclosure.
depends_on: [CWR-001]
unblocks: [CWR-004, CWR-005, CWR-006, CWR-007]
acceptance_criteria:
  - Each kind opens its modal populated from Settings defaults.
  - A later Settings change does not alter a committed definition or a running run.
  - Requested versus effective identity is visible wherever it differs.
  - Repeated model choices across participants are permitted.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: silent_model_substitution_or_retroactive_default
reasoning_tier: high
context_scope: collaborative_configuration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Settings_System.md
  - Plans/Models_System.md
  - Plans/Personas.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-002
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#11
preserved_exact_tokens:
  - "requested"
  - "effective"
  - "frozen effective roster"
negative_constraints:
  - Do not substitute a model, account, or Persona silently.
  - Do not let a Settings change mutate a running run.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-003 - Cards, Panels, Participant Transcripts, And Visibly Targeted Composer

```yaml
plan_unit_id: CWR-003
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Each run renders one transcript card that expands inline for recent transcript and details and pops out to a full panel showing the same run. Every participant is clickable and opens that participant's own transcript. Activity gains per-thread BrainStorm, Review, and Chat Room domains alongside Goal, Todo, Subagents, Crew, Changes, and Artifacts, preserving compact-before-clip behavior. Message targets the ordinary composer rather than a separate input: composer chrome visibly changes and names the destination, and a destination pointing at a cancelled run or removed participant is cleared with a visible reason and returns the composer to the ordinary thread destination. The target ribbon and participant transcripts survive a restart.
gui_related: true
gui_classification_reason: This is the complete rendering and targeting contract for collaborative surfaces.
depends_on: [CWR-001]
unblocks: []
acceptance_criteria:
  - A card expands inline and pops out to a panel showing the same run.
  - Clicking a participant opens that participant's transcript.
  - The composer visibly names its destination and clears it when the target disappears.
  - Ribbon and participant transcripts survive a restart.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
  - node tests/activity-detail-verify.mjs
risk_class: separate_workflow_input_or_invisible_destination
reasoning_tier: standard
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/collaboration.js
node_compile_hint:
  mode: collaborative_surface_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-003
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#12
preserved_exact_tokens:
  - "Message"
  - "Open Activity"
negative_constraints:
  - Do not add a second composer for workflow messages.
  - Do not leave a destination pointing at a removed target.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-004 - Crew Configuration And Crew Auto Admission

```yaml
plan_unit_id: CWR-004
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Crew is a configurable workflow, not an On/Off switch. Its configuration covers coordinator, roles, per-participant models and Personas, tools, and context; each assignment's expected outputs and dependencies are authored by the coordinator when it splits the job rather than configured (CWR-037, DL-128, 2026-09-27); and Crew remains distinct from Subagents. Crew Auto is the assistant's permission to start a Crew by itself when it needs one, on by default for a project; the checkable Crew Auto item of a chat's Multi-Agent submenu overrides the project value for that chat only, and there is no separate per-chat switch that allows Crews (DL-120, 2026-09-27). Crew Auto starts a run only from the project's stored Crew Auto configuration of section 5.3, which starts from the Settings defaults and changes only when the Crew Auto sheet commits; it never starts one from a sheet draft that was never committed, and it cannot widen the permission ceiling or the authority any participant already has. Build With Crew runs an exact Assistant Plan revision through a configured Crew rather than the single-agent build path, and the crew configuration is part of the build target rather than part of any schedule. Crew is not Orchestrator and must not be modelled as child-goal orchestration.
gui_related: true
gui_classification_reason: This defines the Crew modal, the checkable Crew Auto menu item, and the Build With Crew action.
depends_on: [CWR-002]
unblocks: []
acceptance_criteria:
  - Crew Auto starts only from the project's stored Crew Auto configuration, never from an uncommitted sheet draft.
  - Crew Auto cannot widen authority or the permission ceiling.
  - Crew remains distinct from Subagents and from Orchestrator.
  - Crew Auto is on by default for a project, and a chat's Crew Auto check changes only that chat.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: crew_auto_starts_unconfigured_or_widens_authority
reasoning_tier: high
context_scope: crew_protocol
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_protocol_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:CREW-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#8
  - "Plans/Decision_Log.md DL-128 (card p10, E-14; 2026-09-27 amendment)"
  - "Plans/Decision_Log.md DL-120 (card p02, E-02; 2026-09-27 amendment, per the design lead's ruling)"
  - "Design lead ruling of 2026-09-27 on the owner's behalf, relayed in the G1 follow-up task (not verifiable from inside this repository)"
preserved_exact_tokens:
  - "Crew Auto"
  - "Build With Crew"
negative_constraints:
  - Do not model Crew as an On/Off switch.
  - Do not add a per-chat Crew switch beside the chat's Crew Auto check.
  - Do not let Crew Auto start from an uncommitted sheet draft or from anything but the stored Crew Auto configuration.
  - Do not model Crew as child-goal orchestration.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-005 - Chat Room Interaction And Explicit Promotion Only

```yaml
plan_unit_id: CWR-005
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Chat Room supports room and moderator configuration, turn policy, maximum rounds, mentions, replies, user intervention through the ordinary composer, tool and context assignment, stop, and synthesis. Ordinary room discussion creates no To-Do, no Plan, and no Goal. State leaves the room only through an explicit promotion command -- promote to Plan, promote to To-Do, or promote to Goal -- each of which routes through the owning runtime under that owner's ordinary authority rules rather than writing directly.
gui_related: true
gui_classification_reason: This defines the Chat Room modal, the room surface, and its explicit promotion actions.
depends_on: [CWR-002]
unblocks: []
acceptance_criteria:
  - Ordinary discussion creates no To-Do, Plan, or Goal.
  - Each promotion is an explicit user action routed through the owning runtime.
  - User messages reach the room through the ordinary composer.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: implicit_promotion_from_room_discussion
reasoning_tier: standard
context_scope: chat_room_protocol
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/ToDo_Runtime.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: chat_room_protocol_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:ROOM-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#9
preserved_exact_tokens:
  - "Chat Room"
  - "promotion"
negative_constraints:
  - Do not create a To-Do, Plan, or Goal from ordinary room discussion.
  - Do not let a promotion bypass the owning runtime's authority rules.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-006 - Review Restored With Fresh Context And Blind Concurrent Passes

```yaml
plan_unit_id: CWR-006
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Review is a primary mode with Single Agent and Multi-Pass strategies; the retirement of Multi-Pass Review is reversed and it is restored as a user-facing capability. Single Agent creates a fresh-context reviewer subagent with the selected model and Persona. Multi-Pass supports one to eight reviewers with a default of three, and repeated model choices are allowed. Initial reviews run concurrently and blind against the same frozen target pack; findings are then normalized and exchanged for corroboration and disagreement. Mixed target versions cannot form one consensus, and a pass run against a different frozen pack is excluded from corroboration and reported as such. The final result is a Rich Text and Markdown review artifact plus a concise thread summary. Review is read-only and never automatically repairs; follow-on actions such as creating To-Dos or sending findings to the agent are explicit.
gui_related: true
gui_classification_reason: This defines the Review submenu, both modals, the reviewer count control, and the review artifact surface.
depends_on: [CWR-002]
unblocks: []
acceptance_criteria:
  - Multi-Pass Review is available with 1-8 reviewers defaulting to 3 and repeated models allowed.
  - Initial passes are concurrent, blind, and share one frozen target pack.
  - Mixed target versions cannot form one consensus.
  - Review performs no automatic repair.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: cross_version_review_consensus_or_auto_repair
reasoning_tier: high
context_scope: review_protocol
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Run_Modes.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: review_protocol_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:REVIEW-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#11
preserved_exact_tokens:
  - "Single Agent"
  - "Multi-Pass Review"
  - "frozen target pack"
negative_constraints:
  - Do not merge findings across different target versions.
  - Do not let Review mutate the project.
  - Do not restore the old fixed Pass 1/2/3 system as an alternate path.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-007 - BrainStorm As Exhaustive-Plus With Coherent Configuration And One Plan Output

```yaml
plan_unit_id: CWR-007
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  BrainStorm is the third Deep Plan choice and a strict superset of Exhaustive. It is no longer a hidden routed overlay: it has a coherent configuration modal, transcript card, and full panel. Its base maximum user question count is 20, raised by the configurable Grill Me extension whose default is plus twenty-five, for an effective maximum of 45. It applies the strongest external research together with adversarial alternatives, cross-system effects, migrations, compatibility, security, performance, operations, rollback, and uncertainty closure. It is read-only against the target project but may use research tools and permission-gated temporary isolated MCP, tool, and package provisioning scoped to the run and torn down at its end. The protocol runs independent proposals first, then evidence-driven debate, targeted research, voting, dissent preservation, and synthesis, and its final output is exactly one Deep Plan document whose identity is owned by the Assistant Plan Runtime.
gui_related: true
gui_classification_reason: This defines the BrainStorm modal, the effective question maximum display, the card, and the panel.
depends_on: [CWR-002]
unblocks: [CWR-008]
acceptance_criteria:
  - BrainStorm exposes a configuration modal, card, and panel.
  - The effective question maximum shows the baseline plus any Grill extension.
  - The run is read-only against the target project.
  - Independent proposals precede debate and dissent is preserved.
  - The run outputs exactly one Deep Plan document.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: hidden_brainstorm_overlay_or_target_mutation
reasoning_tier: high
context_scope: brainstorm_protocol
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/MCP_Integration.md
node_compile_hint:
  mode: brainstorm_protocol_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:BS-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#10
preserved_exact_tokens:
  - "BrainStorm"
  - "Exhaustive"
  - "15"
negative_constraints:
  - Do not route BrainStorm as a hidden overlay without configuration, card, or panel.
  - Do not mutate the target project from a BrainStorm run.
  - Do not emit more than one Deep Plan document per run.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-008 - Wonderer And Grill Me As Additive Participant Roles

```yaml
plan_unit_id: CWR-008
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Wonderer is a built-in Persona plus a reusable methodology Skill, explicitly not a Hermes profile subsystem; its Persona identity is owned by Personas and its Skill materialization by Skills System, while this document owns its participant-role semantics. Wonderer explores adjacent domains and overlooked possibilities and its leads remain hypotheses until researched. Grill Me is additive, uses a shared question frontier that avoids duplicates, researches answerable facts rather than asking the user for them, and raises the workflow question allowance without per-agent duplicate inflation. Both are additive options in BrainStorm, Crew, and Chat Room; the Deep Plan submenu carries a persistent Grill Me check option; and PRD Builder and Planning Wizard start flows offer BSD, Wonderer, and Grill Me with Wonderer running early and Grill Me near the end of discovery and topic work.
gui_related: true
gui_classification_reason: These are additive rows in the workflow modals and a persistent check option in the Deep Plan submenu.
depends_on: [CWR-007]
unblocks: []
acceptance_criteria:
  - Wonderer exists as both a Persona and a reusable Skill and is not a profile subsystem.
  - Grill Me raises the effective question maximum without duplicate-per-agent inflation.
  - Both appear as additive options in BrainStorm, Crew, and Chat Room.
  - PRD Builder and Planning Wizard start flows offer BSD, Wonderer, and Grill Me.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: duplicate_question_inflation_or_persona_skill_conflation
reasoning_tier: standard
context_scope: wonderer_and_grill_me_roles
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Personas.md
  - Plans/Skills_System.md
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: additive_participant_roles
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:WGM-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#12
preserved_exact_tokens:
  - "Wonderer"
  - "Grill Me"
negative_constraints:
  - Do not implement Wonderer as a Hermes profile subsystem.
  - Do not let Grill Me inflate the question count per agent.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-009 - Collaborative Recovery And Honest Degraded Results

```yaml
plan_unit_id: CWR-009
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  A collaborative run is durable: closing the client, switching threads or projects, reloading, or crashing neither cancels the run nor loses participant transcripts nor silently restarts a protocol round. On restart the runtime rehydrates the run, its frozen roster, every message, and produced artifacts from durable records rather than conversation context, records exactly one terminal result for an in-flight attempt, and treats replay as idempotent on attempt identity. A failed participant is recorded, never silently dropped and never given fabricated output; where a protocol requires that participant the run reports a degraded result naming what is missing rather than presenting a complete-looking consensus. A denied permission stops only the affected participant, which can never self-approve or escalate its own ceiling. A quota-exhausted run enters the shared quota wait with transcripts and roster preserved and is not restarted from the beginning.
gui_related: true
gui_classification_reason: Degraded results and failed participants must be visible in the card, panel, and Activity rather than hidden.
depends_on: [CWR-001]
unblocks: []
acceptance_criteria:
  - A restart rehydrates the run, roster, transcripts, and artifacts from durable records.
  - A failed participant produces a named degraded result, never a fabricated one.
  - A denied permission stops only that participant and no participant self-approves.
  - A quota wait preserves transcripts and does not restart the run.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: fabricated_participant_output_or_lost_transcript
reasoning_tier: high
context_scope: collaborative_recovery
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/storage-plan.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: collaborative_recovery_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-004
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#13
preserved_exact_tokens:
  - "degraded"
  - "frozen effective roster"
negative_constraints:
  - Do not fabricate output for a failed participant.
  - Do not restart a quota-paused run from the beginning.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-010 - Provider Boundary And Disclosed Adapter Constraints

```yaml
plan_unit_id: CWR-010
unit_type: constraint
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Puppet Master owns canonical collaborative state across direct, SDK, CLI, and server providers. An adapter may translate a participant request into a provider request and a provider event into a normalized Puppet Master event; translation never transfers authority. Provider-native multi-agent, sub-session, or team constructs are not the canonical run: they are disabled, redirected into the canonical run, or marked noncanonical, and their state is never read back as Puppet Master truth. Where an adapter genuinely cannot express a required capability the constraint is disclosed on the participant row and in the configuration modal and is never described as full control; a kind that cannot run faithfully on an adapter is unavailable there with its reason rather than silently degraded. Temporary research capability provisioning is requested through MCP Integration and Tools, is permission-gated, is scoped to the run, and is torn down at its end; there is no workflow-local MCP or tool registry.
gui_related: true
gui_classification_reason: Adapter constraints must be visible in the modal and on participant rows.
depends_on: [CWR-002]
unblocks: []
acceptance_criteria:
  - Provider-native multi-agent state is never read back as canonical.
  - A constrained adapter is disclosed as constrained on the participant row and in the modal.
  - Temporary provisioning is permission-gated, run-scoped, and torn down.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/collaboration-verify.mjs
risk_class: provider_native_collaborative_authority_or_hidden_constraint
reasoning_tier: high
context_scope: collaborative_provider_boundary
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/MCP_Integration.md
node_compile_hint:
  mode: collaborative_provider_boundary
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PROV-001
  - pm-assistant-implementation-2026-09-02-recovered:09_PROVIDER_CONTROL_AND_CAPABILITY_MATRIX.md
preserved_exact_tokens:
  - "noncanonical"
  - "disclosed"
negative_constraints:
  - Do not read provider-native multi-agent state back as canonical truth.
  - Do not claim full control for a constrained adapter.
  - Do not create a workflow-local MCP or tool registry.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-011 - Collaborative Migration And Retired Model Supersession

```yaml
plan_unit_id: CWR-011
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Three prior models are superseded. BrainStorm as a hidden routed overlay migrates into a brainstorm CollaborativeRun with a synthesized definition and recoverable participants, marking the remainder unrecoverable in the receipt and fabricating no proposal, vote, or dissent. The retirement of Multi-Pass Review is reversed: legacy fixed Pass 1/2/3 structures migrate to a review run with three reviewer participants and a recorded note that the pass identities were positional rather than configured, and the old fixed three-pass system is not preserved as an alternate code path. Crew as an On/Off switch is retired: a legacy boolean migrates to a crew definition with Settings-derived defaults and auto_enabled set to the boolean's value, and enabling Crew Auto still requires a committed configuration. Receipts record converted runs, unrecoverable state, synthesized defaults, and residual risk, and a run whose thread or Project edge cannot validate quarantines rather than being attached to a guess.
gui_related: false
gui_classification_reason: Migration is a storage and custody operation with no surface of its own.
depends_on: [CWR-001]
unblocks: []
acceptance_criteria:
  - No proposal, vote, or dissent is fabricated during migration.
  - Legacy three-pass reviews migrate to a configured review run without preserving the old code path.
  - A legacy Crew boolean becomes a definition that still requires committed configuration before Auto runs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py
  - python3 scripts/pm-plan-index.py validate
risk_class: fabricated_collaborative_history_on_migration
reasoning_tier: standard
context_scope: collaborative_migration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: collaborative_migration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:COLLAB-005
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#12.4
preserved_exact_tokens:
  - "Multi-Pass Review"
  - "auto_enabled"
negative_constraints:
  - Do not fabricate migrated collaborative history.
  - Do not keep the fixed three-pass review system as an alternate path.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

## Additive Correction v4 — Modal Transaction Boundary, Participant Outcomes, And Quorum (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`MODAL-001..018`,
`PART-001..024`, `WONV-003..007`) to this owner. It is additive to the v2 collaborative design:
Crew, Crew Auto, Chat Room, Single and Multi-Pass Review, BrainStorm, participant transcripts,
cards, panels, Activity entries, and the visibly targeted composer all stay as specified above.

### MODAL-001..002 — Opening a modal is not starting a run

Opening or editing any Crew, Crew Auto, BrainStorm, Review, Chat Room, BSD-workflow, or
Build-With-Crew modal creates exactly one thing: a local `WorkflowLaunchDraft`.

```text
pm.collaboration.launch_draft.v1     (composer/local UI state unless an owner already persists it)
  draft_id, kind, source_ref, configuration, target_ref, currentness, dirty
```

Before a confirmed Start or Apply there is **no** provider request, participant session, Usage
record, durable start event, workflow artifact, project mutation, permission grant, installed
package, settings write, card, or Activity entry. Instrumentation must be able to prove zero
side effects across open → configure → cancel. Showing which capabilities are available is a
preview, never an execution.

### MODAL-003..005 — Configure previews, Start commits

`cmd.collaboration.configure` validates and previews configuration only. `cmd.collaboration.start`
performs the idempotent run admission. One handler owns each semantic effect, and configure
never starts a run.

Cancel or close discards the draft and emits no domain event. It is a local view action, so no
domain cancel command is minted for a run that does not exist; unsent source text and
configuration remain available where applicable.

A **failed** Start keeps the modal values, shows the typed failure, and creates no card and no
partial participant records. Retry reuses the draft after a currentness refresh. Dispatch
failure never clears the user's configuration.

### MODAL-006..008 — Defaults and the Crew Auto checkmark

Settings defaults change only through an explicit `Save as Default` action routed through the
generic Settings transaction owner. Starting a workflow never rewrites defaults as a side
effect, and not every modal change is persisted.

Crew and Chat Room menu actions open their modal immediately, but a card or Activity entry
appears only after one run is durably admitted. Cancel leaves no transcript trace, and no
`Running` card is shown during configuration.

`Crew Auto` becomes checked only after configuration confirmation **and** a successful project
Settings commit. The menu check reflects effective stored state; cancel preserves the prior
enabled state; optimistic enabling before commit is prohibited. Since 2026-09-27 Crew Auto is on by
default for a project and a chat's check overrides it for that chat only (CWR-004, CWR-038, DL-120):
the sentence "`Crew Auto` becomes checked only after configuration confirmation **and** a successful
project Settings commit" applies to turning Crew Auto on for the project from the Crew Auto sheet, the
check shows the stored value in force for the chat, and no optimistic change is allowed for either
the project value or a chat's override.

### MODAL-009..010 — Review targets freeze at Start

Review target identity and hash freeze at Start, not when the modal opened, and currentness is
checked immediately before admission.

If the target changed while the modal was open, the user must refresh to current or explicitly
choose the identified old immutable target. There is no silent swap, and two target hashes never
form one review.

### MODAL-011..012 — Held BrainStorm requests

Selecting Deep Plan BrainStorm before submission stores the validated configuration and
destination in `ComposerBuffer`; the workflow starts only when the request is actually sent. A
thread switch or a crash restores the configuration together with the text.

A natural-language BrainStorm invocation **holds** the submitted request before provider
dispatch, opens configuration, and — on cancel — restores the request text and attachments
intact to `ComposerBuffer`. Cancel never runs the workflow with defaults.

### MODAL-013..014 — Build With Crew stays atomic

`cmd.chat.plan.build_with_crew` keeps its specialised atomic contract: `PlanRun` and `CrewRun`
commit together or neither commits. It is not replaced by a generic collaboration start followed
by a separate Plan build, and no race between two commands is introduced.

It freezes Plan version and hash at Start and refuses a Plan that changed while the modal was
open; the user reopens the modal against the new version. The sheet's title, read-only job and
in-place `stale_plan_version` refusal are specified by CWR-022, and the one-transaction admission
by CWR-023 (2026-09-27).

### MODAL-015..018 — BSD, provisioning, idempotency, and view state

Selecting BSD for PRD Builder or Planning Wizard creates no assignment and no stage binding
until the owning workflow's Start is committed. Cancel leaves no BSD Usage and no assignment, and
a configuration checkbox alone never starts an advisor call.

Temporary MCP, tool, or package provisioning requested by BrainStorm is admitted only after
workflow Start and normal permission and provisioning approval. The modal may show capability
availability; preflight never mutates host or project.

Repeated Start with the same command idempotency binding returns the original run; the same key
with changed configuration is rejected. Exactly one workflow card and run appear. Deduplication
by modal instance ID alone is insufficient.

Modal local selection, expand/collapse, hover, tab, and close use shared view-state primitives.
The command census marks them local or shared view-state reuse; no command ID is minted for a
visual toggle. The collaboration view-state census is CWR-033 (2026-09-27).

### PART-001..006 — Every slot reaches a stated outcome

Each participant slot reaches exactly one explicit terminal outcome: `completed`, `failed`,
`timed_out`, `unavailable`, `canceled`, or `explicitly_waived`. A missing callback is not
`completed`, and no card or panel implies a participant silently disappeared.

```text
pm.collaboration.participant_disposition.v1
  run_id, slot_id, required, attempt_id, outcome,
  requested_identity, effective_identity, waiver, currentness
```

Slots are declared `required` or `optional` by the workflow definition. A required slot prevents
clean completion until it is completed or explicitly waived, and a waiver identifies actor,
reason, and currentness. Optionality is a definition property, never inferred from whether a
model happened to be available.

No unavailable or failed participant is silently replaced. Replacement requires explicit
reconfiguration with requested-versus-effective disclosure, the original attempt stays in
history, and the old label is never kept while another model runs.

Retries create new attempt identities for the same slot; replacement creates a new assignment
revision. Epoch and currentness fencing rejects superseded attempts, and failed-attempt evidence
is never overwritten.

`cmd.collaboration.reconfigure` is reused or extended for retry, replacement, and explicit
waiver where the branch-current census permits. No per-workflow retry command is created unless
its semantics genuinely differ, and no duplicate retry or waive engine is built.

Usage and transcript projections retain the requested slot, every effective attempt, failures,
substitutions, waivers, and the final contribution status. Cost is never attributed to a slot
that did not run, and failed attempts are never hidden from totals or details.

### PART-007..010 — Review truth: one reviewer, partial passes, and quorum

A Multi-Pass Review configured with **one** reviewer performs one fresh independent review and
says so. It does not claim peer corroboration, agreement, quorum, or consensus, and the artifact
labels itself a single-pass result. No multi-agent agreement section is fabricated.

When fewer passes complete than were requested, the result discloses requested, completed, and
failed counts and stays attention-required until retry, reconfiguration, or an explicit
acceptance of partial review. The final artifact identifies partial coverage; it never finalises
silently as a full Multi-Pass.

Only admitted, current, completed attempts corroborate or vote. Failed, timed-out, unavailable,
canceled, stale, and waived attempts do not, so agreement counts are reproducible. Provider text
from a superseded attempt is never counted.

Finding disposition preserves unresolved disagreement. A lack of quorum is never rendered as
consensus, uncertain and disputed findings stay explicit, and the coordinator cannot manufacture
unanimity.

### PART-011..015, WONV-003..006 — BrainStorm quorum, abstention, ties

Core BrainStorm participant slots must complete or be explicitly waived before clean synthesis.
Wonderer and Grill Me have separately visible additive outcomes, so core coverage and specialist
coverage stay distinguishable and an additive specialist never silently replaces a core role.

An active **Wonderer abstains from the final vote by default** and is excluded from the
support/oppose quorum denominator while still contributing leads and debate. The UI shows
`Abstained` without depressing the support percentage, and abstention is never counted as
opposition. Wonderer may challenge proposals and argue before abstaining, and its transcript
remains part of synthesis evidence — it is not removed from the discussion because it cannot
vote.

If the user reconfigures a slot from Wonderer to an ordinary voting role, only the new role's
current attempt may vote. The earlier Wonderer attempt remains abstaining history and is never
retroactively converted into a vote.

**Grill Me** contributes questions and decision pressure and has no automatic final vote unless
it is explicitly configured as an additional ordinary voting role. Question count never implies
voting weight.

A tie or weak consensus is resolved by hard constraints, evidence quality, feasibility, risk, and
explicit synthesis reasoning, and the synthesis records why an approach or hybrid won. Ties are
never broken by first response, provider order, or model prestige.

A material choice left unresolved is recorded in the Plan as a disagreement. Build is disabled
only when that choice is an explicit build blocker; non-blocking dissent stays visible.

### PART-016..020 — Crew, Chat Room, completion, and cancellation

Crew clean completion requires every required expected output to exist or be explicitly waived
with a reason, and coordinator synthesis references the delivered outputs. Participant status
alone never marks a Crew complete.

Crew coordinator failure requires explicit replacement, retry, or cancellation. Another
participant never silently becomes coordinator; the card shows `Needs attention` with the allowed
actions and coordinator identity never mutates invisibly. The allowed actions and the attention
reason come from the completion projection below, which CWR-029 extends (2026-09-27).

Chat Room may continue with available members under its policy, but a failed member produces no
fabricated messages, moderator replacement is explicit, the roster and status stay truthful, and
synthesis is never attributed to a participant that failed.

A collaborative run completes only when its kind-specific completion predicate, required
participant dispositions, output and artifact finalisation, and any pending user decision are all
resolved. A provider turn completing is insufficient, and the last message is not lifecycle
truth.

```text
pm.collaboration.completion_projection.v1
  run_id, kind, required_slots, completed_slots, failed_slots, waived_slots,
  output_status, quorum_status, attention_reason, clean_completion, allowed_actions
```

Cancel fences every participant attempt and synthesis callback. Later results may be retained as
rejected or stale evidence but cannot alter the current run; no card or status mutates after
cancel, however useful a late result appears.

### PART-021..024 — Availability, independence, and constrained providers

A model unavailable **before** Start blocks Start until the user picks a replacement in the modal;
no stand-in is offered (CWR-034, 2026-09-27).
Configuration alone never creates a failed runtime participant, and no provider attempt is
claimed to have occurred.

Review slots that repeat the same model still use independent fresh sessions and distinct attempt
IDs and are never collapsed into one participant. Independence evidence is retained, or a
constrained disclosure is shown; hidden shared context is never reused while claiming blind
passes.

Cards, Activity, and full panels expose partial, failed, and waived participant counts and
currentness with details reachable from participant rows, without flooding the main transcript.
A generic `Running` label never hides partial state.

A provider adapter that cannot guarantee fresh sessions, parallelism, or participant isolation
discloses constrained execution **before** Start and again in the final artifact, showing the
requested and effective control tier. Independent review is never certified without evidence.

### WONV-007 — Wonderer stays additive everywhere

Wonderer remains additive in BrainStorm, Crew, Chat Room, PRD Builder, and Planning Wizard and
never replaces a required core participant. Where concurrency is lower than the logical roster,
the roster runs in waves; a core role is never dropped to fit a participant cap.

## Working Notebook Collaboration Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. One notebook capability serves collaborative workflows through the existing identities and ceilings: each participant slot already owns a distinct participant identity and private working slice; the notebook `participant` scope is that private slice made durable, and `shared_slice` scope is an explicitly shared set of exact note revisions to an explicit roster/phase policy. Personal working slices and shared findings are projections over the existing `CollaborativeRun`/slot records — no new parallel agent, session, or transcript store exists, and there is no implicit all-participant visibility.

Blind-phase protection is absolute across every notebook route: during Review initial passes (7.4) and BrainStorm blind proposals (phase 2), independent reviewer notes and proposals remain inaccessible to other participants through direct read, search, exact-ID read, import, resume capsule, checkpoint selection, or shared notes; no existence metadata, counts, titles, or snippets leak. Recovery, fresh-window continuation, and shared search cannot bypass the phase boundary; coordinator access follows the protocol (normalized findings at the release point), never role-name assumption.

```yaml
plan_unit_id: CWR-012
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: Collaborative notebooks use participant and shared_slice scopes over existing CollaborativeRun and participant_slot identities. Each participant retains a distinct current identity and private working slice; sharing selects exact revisions and explicit recipients; there is no implicit all-participant visibility and no new parallel transcript/agent/session store.
gui_related: false
gui_classification_reason: Scope semantics are runtime behavior, not GUI work.
depends_on: [CWR-011, WN-005]
unblocks: [CWR-013]
acceptance_criteria:
  - Each participant and coordinator retains a distinct current identity.
  - Sharing exposes exactly the selected revisions to exactly the permitted roster/phase.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: ambient_visibility
reasoning_tier: standard
context_scope: collaborative_workflows
implementation_surfaces: [Plans/Collaborative_Workflows.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I06
preserved_exact_tokens: ["participant", "shared_slice", "private working slice"]
negative_constraints:
  - Do not create implicit all-participant notebook visibility.
owner_hints: [Plans/Collaborative_Workflows.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: CWR-013
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: "Blind-phase notebook protection is absolute: independent reviewer notes and blind BrainStorm proposals stay inaccessible to other participants until the workflow owner releases them. Recovery, fresh-window continuation, shared search, exact-ID reads, imports, resume capsules, checkpoint selection, and shared notes all enforce the phase boundary at read time; no content or existence metadata leaks, and coordinator access follows the protocol release point rather than role-name assumption."
gui_related: false
gui_classification_reason: Phase protection is runtime/permission behavior, not GUI work.
depends_on: [CWR-012, PS-140]
unblocks: []
acceptance_criteria:
  - Every route (direct read, search, import, capsule, shared notes) is checked against blind access.
  - No forbidden content or existence metadata leaks during blind phases.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: blind_phase_breach
reasoning_tier: high
context_scope: collaborative_workflows
implementation_surfaces: [Plans/Collaborative_Workflows.md, Plans/Permissions_System.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I07
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A09
preserved_exact_tokens: ["blind", "release point", "existence metadata"]
negative_constraints:
  - Do not let recovery or shared search bypass the blind-phase boundary.
owner_hints: [Plans/Collaborative_Workflows.md, Plans/Permissions_System.md]
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Working_Notebook.md

## Cumulative v3 Collaboration Configuration and Semantics Specification (2026-09-07)

This section incorporates the cumulative collaboration configuration, selector primitives, and
operational invariants across Crew, Crew Auto, Chat Room, BrainStorm, and Review in accordance with
APR-021, APR-022, APR-029, APR-030, APR-051, APR-052, APR-053, APR-054, and APR-067.

### 8. Shared Collaborator Selectors and Destination Scoping (APR-029, APR-030)

- **Shared Selector Primitives:** All collaboration workflow modals (Crew, Crew Auto, Chat Room,
  BrainStorm, and Review) share the identical Model and Persona selection controls backed by the
  canonical catalogs in `Plans/Models_System.md` and `Plans/Personas.md`. Ad-hoc or diverging picker
  primitives are prohibited.
- **Explicit Destination Isolation:** Every model or persona picker activation explicitly binds to
  a precise target destination: the primary Assistant session, a specific draft participant slot
  within a collaborative roster, or a project-level default template row.
- **Cancellation Isolation:** Closing or canceling a picker leaves all other configuration fields,
  unrelated participant assignments, and draft states completely untouched. A cancelled picker
  never triggers global state resets or silent fallback rebindings.

### 9. Choice Controls, Plain-Language Labels, and Popup Spacing (APR-051, APR-052, APR-053)

- **Shared Choice Controls (APR-051):** Remaining collaboration configuration controls (including
  strategy selectors, consensus thresholds, and execution modes) use anchored dropdown popups with
  standardized option row geometry, clear keyboard focus rings, and search filtering.
- **Plain-Language Descriptions (APR-052):** Choice controls present clear, plain-language option
  labels accompanied by concise descriptions explaining the operational trade-offs (e.g., speed,
  depth of analysis, reviewer independence, token expenditure) without exposing raw internal enum
  names or developer jargon.
- **Consistent Inset Footers (APR-053):** Configuration modal footers enforce 16 px inset padding,
  distinct upper border separation, and a standardized button hierarchy featuring a primary action
  (Start / Save) on the right and secondary actions (Cancel) adjacent with clear visual distinction.

### 10. Single Agent Review Invariant and Dynamic Roster Sizing (APR-054)

- **One-Agent Roster Invariant:** When the user selects the "Single Agent" strategy in the Review
  configuration modal, the draft reviewer roster immediately and reactively collapses to exactly one
  reviewer. Single Agent Review strategy enforces exactly one reviewer at initial draft, during row
  edits, confirmation, serialization, and runtime admission.
- **State Preservation on Toggle:** If the user toggles back from Single Agent to Multi-Pass Review,
  the previous multi-reviewer roster configuration is restored intact without requiring re-entry of
  reviewer parameters and without resurrecting deleted rows.
- **Pass Semantics Independent of Reviewer Count:** Multi-Pass Review (§7.4) preserves multi-pass
  semantics across 1 to 8 reviewers, independent of reviewer count. Single Agent Review strategy
  execution renders as a single-reviewer result omitting consensus or agreement sections in transcript
  cards and Activity Detail.

### 11. Mode Entry Completeness and Read-Only Demographics (APR-021, APR-022, APR-067)

- **Authentic Mode Entry Paths:** Review must enter through the primary mode menu and its sidecars.
  BrainStorm must enter through Deep Plan sidecars. Neither mode may be bypassed or launched via
  disconnected demo hooks. Retained v2 and Additive Correction v4 contracts are fully preserved.
- **Read-Only Demonstration Semantics (APR-067):** Read-only inspection fixtures and demonstration
  cards display findings, static analysis, and code reviews without rendering interactive mutation
  controls or misleading action buttons.

```yaml
plan_unit_id: CWR-014
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Crew, Crew Auto, Chat Room, BrainStorm, and Review use shared Model and Persona selection controls
  backed by the canonical shared catalogs in Plans/Models_System.md and Plans/Personas.md. Picker
  destinations are explicitly scoped to the primary Assistant, a specific draft participant slot, or
  a default template row. Canceling a picker leaves all other configuration state and participant
  assignments intact without global mutations.
gui_related: true
gui_classification_reason: Governs collaborator selector controls and destination scoping in collaboration configuration popups.
depends_on: [CWR-011]
unblocks: [CWR-015]
acceptance_criteria:
  - All five collaboration workflows use identical Model and Persona pickers backed by shared catalogs.
  - Picker destination is explicitly bound to the intended slot or template.
  - Canceling a picker preserves all draft state without unintended rebindings.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: selector_divergence_or_unintended_rebinding
reasoning_tier: standard
context_scope: collaboration_selectors
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Models_System.md
  - Plans/Personas.md
node_compile_hint:
  mode: collaboration_selector_specification
  create_worknodes: false
source_lineage:
  - APR-029
  - APR-030
preserved_exact_tokens:
  - "shared catalogs"
  - "participant slot"
  - "destination"
negative_constraints:
  - Do not introduce diverging picker primitives across collaborative workflows.
  - Do not mutate global assistant state when canceling a participant picker.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Models_System.md, ContractName:Plans/Personas.md

```yaml
plan_unit_id: CWR-015
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Collaboration configuration popups enforce shared anchored dropdown choice controls with plain-language
  labels and option descriptions explaining trade-offs. Modal footers feature consistent 16 px inset
  padding, subtle top divider separation, and a clear button hierarchy between primary Start/Save and
  secondary Cancel actions.
gui_related: true
gui_classification_reason: Governs choice control presentation, plain-language option copy, and popup footer geometry.
depends_on: [CWR-014]
unblocks: [CWR-016]
acceptance_criteria:
  - Dropdown controls share anchored geometry, standard option rows, and keyboard navigation.
  - Option descriptions explain operational trade-offs in plain language.
  - Popups feature 16 px inset footers with distinct primary and secondary action styling.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: popup_layout_or_choice_control_inconsistency
reasoning_tier: standard
context_scope: collaboration_choice_controls
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaboration_ui_specification
  create_worknodes: false
source_lineage:
  - APR-051
  - APR-052
  - APR-053
preserved_exact_tokens:
  - "plain-language"
  - "inset footers"
  - "option descriptions"
negative_constraints:
  - Do not display raw enum identifiers as user-facing option labels.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: CWR-016
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Selecting the Single Agent strategy in the Review configuration modal immediately and reactively
  reduces the active draft reviewer roster to exactly one reviewer. Switching back to Multi-Pass restores
  the prior multi-reviewer roster without loss of choices and without resurrecting deleted rows. Single
  Agent Review strategy execution renders as a single-reviewer result omitting consensus sections,
  whereas Multi-Pass Review preserves multi-pass semantics across 1 to 8 reviewers independent of reviewer count.
gui_related: true
gui_classification_reason: Governs the reactive reviewer roster count and single-pass rendering invariant in Review configuration.
depends_on: [CWR-015]
unblocks: []
acceptance_criteria:
  - Single Agent Review immediately sets active draft reviewer roster to exactly 1.
  - Toggling back to Multi-Pass restores the multi-reviewer roster without resurrecting deleted rows.
  - Multi-Pass Review supports 1 to 8 reviewers with multi-pass semantics independent of count.
  - Single Agent Review execution renders as a single-reviewer result omitting agreement and consensus sections.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: review_roster_count_inconsistency
reasoning_tier: high
context_scope: review_roster_invariants
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: review_roster_specification
  create_worknodes: false
source_lineage:
  - APR-054
preserved_exact_tokens:
  - "Single Agent"
  - "Multi-Pass"
  - "single-pass result"
negative_constraints:
  - Do not permit more than one active reviewer when Single Agent is selected.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md

```yaml
plan_unit_id: CWR-017
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Review and BrainStorm enter through their designated product mode menu and sidecar paths, preserving
  retained v2 and correction-v4 semantics without bypasses. Read-only demonstration fixtures present
  inspection findings and static analysis without interactive mutation controls or misleading execution
  states.
gui_related: true
gui_classification_reason: Governs canonical mode entry completeness and read-only demonstration semantics.
depends_on: [CWR-014]
unblocks: []
acceptance_criteria:
  - Review enters via primary mode menu; BrainStorm enters via Deep Plan sidecar.
  - Retained v2 and correction-v4 semantics remain fully intact.
  - Read-only fixtures render findings without interactive mutation buttons.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: mode_entry_bypass_or_demo_mutation_leak
reasoning_tier: standard
context_scope: collaborative_mode_entry
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaborative_mode_entry_specification
  create_worknodes: false
source_lineage:
  - APR-021
  - APR-022
  - APR-067
preserved_exact_tokens:
  - "mode entry"
  - "read-only demonstration"
negative_constraints:
  - Do not expose interactive mutation controls on read-only demo fixtures.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md

## Wand Modules Redesign Addendum (2026-09-27)

This addendum compiles the wand-modules redesign of the collaboration configuration sheets, run cards and run view (ledger `pldg-20260927-001-wand-collab-workflows`). It carries the contract, not the concept: no class names, storage keys or harness hooks. It references the Chat WOW transcript canon (the family map of ACD-469 and the stream vocabulary of EP-128) and never redefines it. Items that waited on a product-owner decision card are compiled once the owner's answer is recorded in Plans/Decision_Log.md, and cite that DL entry: CWR-034..CWR-039 and the dated additions to CWR-004, CWR-018, CWR-024, CWR-025, CWR-027, CWR-028, CWR-031 and CWR-032. Where an answer left a part to the design lead, the lead's ruling of 2026-09-27 is compiled and cited beside the DL entry: the dated additions to CWR-004, CWR-021, CWR-024, CWR-029, CWR-038 and CWR-039. The closure wave compiles the owner's last answers the same way: live helper text (DL-137) as CWR-040 and a dated addition to CWR-030, with the helper message in progress owned by Plans/Executor_Protocol.md as EP-129..EP-131, and the ELI5 disclosure (DL-126) as a dated addition to CWR-033. Items still waiting, or answered with a question, are held in the ledger and are not stated here. Where this addendum and older text in sections 2 to 18, MODAL-006..018 or PART-016..020 disagree, the pointer in that section names the unit that wins.

### CWR-018 - Collaboration Configuration Sheet Contract

```yaml
plan_unit_id: CWR-018
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  The configuration modal of Crew, Crew Auto, Chat Room, BrainStorm and Review is presented as a
  configuration sheet over its own scrim. Scrim click, the close control, Cancel and Escape run one
  close path, which discards the local draft and emits no domain event (MODAL-003..005); a click
  outside an open dropdown closes only that dropdown. The sheet shows an In your chat preview of the
  card's first frame. The preview is local view state and becomes a transcript card only after a
  committed Start is admitted, never on open, configure or cancel. A read-back sentence restates the
  draft and is always true for the values on screen. An estimate line states likely time and cost;
  it is computed locally from the draft, makes no provider request, never claims precision and says
  "an estimate, not a promise", and when there is no basis it reads "Time and cost depend on the
  work". Where a sheet offers Start from a team (each kind's sheet, CWR-039), choosing a preset only
  prefills the draft: it writes
  no definition, no Settings value and no run. Each sheet has exactly one Advanced page whose shared
  rows map, in this order, to the section 3 fields that the sheet itself does not already show:
  time and cost limit, token limit,
  context sharing and attachments, tool, MCP and Skill policy, failure policy when a participant is
  stuck, substitution policy, transcript retention, output format, and the permission ceiling. The
  other section 3 fields (name and purpose, participants and roles, provider, account, model and
  Persona per participant, the Wonderer and Grill Me additions, and the coordinator or synthesis
  model) are on the sheet itself, and concurrency is set on the Crew sheet's own Working at the same
  time control, never on the Advanced page. The
  substitution row and the permission ceiling are sentences and never settings: an unavailable
  chosen model blocks Start until the user replaces it (CWR-034, DL-121), and the ceiling is never
  configured upward. Kind rows follow the shared rows, and no row repeats
  a control already visible on the sheet. The card title is the definition name: it is derived from
  the job text as its first sentence, at most 48 characters and cut at a word boundary, until the
  user edits it; the draft records that the name was edited and never derives it again.
gui_related: true
gui_classification_reason: This unit defines the configuration sheet, its close path, preview, read-back, estimate, presets, Advanced page and card title.
depends_on: [CWR-002]
unblocks: [CWR-032]
acceptance_criteria:
  - Scrim click, close control, Cancel and Escape share one close path that creates no run, card, event or Usage.
  - The In your chat preview never becomes a card before a committed Start is admitted.
  - Computing the estimate makes no provider request, and an estimate without a basis reads "Time and cost depend on the work".
  - Choosing a Start from a team preset writes nothing but the draft.
  - The Advanced page's shared rows map one to one to the section 3 fields the sheet does not already show, with the substitution row and the permission ceiling as sentences, and concurrency is never an Advanced row.
  - An edited card title is never re-derived from the job text.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: sheet_side_effect_before_start_or_false_estimate
reasoning_tier: standard
context_scope: collaborative_configuration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 6.1, 6.4, 8.0 (G-29), 8.1 (Working at the same time), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-01"
  - "Plans/Decision_Log.md DL-121 (card p03, E-03), DL-117 (card n08, E-37); 2026-09-27 WAIT-wave amendment"
preserved_exact_tokens:
  - "configuration sheet"
  - "In your chat"
  - "an estimate, not a promise"
  - "Start from a team"
  - "Advanced page"
negative_constraints:
  - Do not let opening, previewing, estimating or cancelling a sheet make a provider request or create a run, card or Usage.
  - Do not let a preset write a definition or a Settings value.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-019 - Run Card Densities And State Mapping

```yaml
plan_unit_id: CWR-019
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  A collaborative run has one transcript card, and its presentation takes exactly one density at a
  time, closed as `starting | waiting | live | collapsed | attention | result | failed | receipt`.
  Density is presentation derived from the run state, the completion projection (CWR-029), the
  participant activity projection (CWR-030) and view state. It is never domain truth, and a density
  change never creates a second card. starting: Start was admitted and no participant event has
  arrived yet. waiting: the run state is waiting and no participant attempt has started; the card
  shows the owner's reported reason. A run that waits after an attempt started stays live and
  carries the owner's reason in its status sentence, and a pending permission decision for any
  participant shows attention. live: the newest running run in the thread. collapsed: an older
  running run, or one the user closed; a pending decision survives the collapse. result: the run
  completed cleanly in this session (clean_completion is true), until the user's next message; a card
  never becomes result because the last message arrived or a stream stopped. failed: the run ended
  without a clean completion. Its face follows how the run ended: a run in the failed state shows
  its failure sentence with the danger mark and word; a cancelled run shows the cancelled face,
  which says everything so far is kept, and a run cancelled at its own limit reads Stopped at your
  limit in the warm tone, not the danger tone (CWR-029). A cancelled run, whatever its stop_reason,
  is never presented as a failure. receipt: a finished run after the chat moved on, and every finished run
  restored at startup. After cancel the card's face never changes again, whatever arrives late. The
  expanded card's transcript slice is one quoted line per lane for at most three lanes, chosen by
  priority (needs you, working, using tools, waiting, done), plus a "+N more" row when more
  participants exist; the full transcript belongs to the run view. The expanded card's Usage summary
  is its meta line: cost so far against the limit, effective concurrency and any
  requested-versus-effective disclosure, exactly as the Usage and model owners report them. The card
  head shows the roster as participant marks ringed by their live state, never as initials; this is
  the People-family roster whose internals ACD-469 leaves to this owner.
gui_related: true
gui_classification_reason: This unit maps run state to the card's density and bounds the card's transcript slice and meta line.
depends_on: [CWR-003, CWR-029, CWR-030]
unblocks: []
acceptance_criteria:
  - Every run maps to exactly one of the eight densities, derived without a second card.
  - A run that waits after any attempt started presents as live with the owner's reason, never as waiting.
  - A card shows result only when clean_completion is true.
  - The expanded card shows at most three lanes plus a "+N more" row and never the full transcript.
  - A cancelled run, including one stopped at its own limit, never shows the failure sentence or the danger mark; a limit stop reads Stopped at your limit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: card_state_disagrees_with_run_state
reasoning_tier: standard
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaborative_surface_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.1 (IMPACT A1-20, G-30), 7.2, 7.8"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-03 (NOW part)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 7.6 (the Cancelled row and amendment G-31), the design lead's ruling of 2026-09-27 after blind review cycle 1"
preserved_exact_tokens:
  - "starting | waiting | live | collapsed | attention | result | failed | receipt"
  - "clean_completion"
  - "+N more"
  - "meta line"
  - "Stopped at your limit"
negative_constraints:
  - Do not present a run that waits after it started as not started.
  - Do not present a cancelled run, or a run stopped at its own limit, as a failure.
  - Do not move a card to result on the last message or a stopped stream.
  - Do not put the full transcript in the card.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-020 - Run View As An Editor Document

```yaml
plan_unit_id: CWR-020
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Open Panel on a collaborative card or receipt opens the run view: one editor-pane document per
  run, identified by a stable document id made of the kind prefix and the collaboration_run_id
  (crew-work:, review:, brainstorm:, room:, and collab-run: for a run that no kind protocol owns).
  Opening focuses the existing document when it is already open and never creates a duplicate, and
  the id is stable for routing and session restore. The run view has the kind's overview tab
  (Summary for Crew, Report for Review, How they decided for BrainStorm, Discussion for Chat Room)
  and the common Conversation, Team and Cost tabs, which render identically for every kind. The
  chat, the composer and the composer destination ribbon stay visible beside it, and at narrow
  widths it follows the rules of the Plan document tab. A control that changes a run is rendered in
  exactly one place at a time: while the run view is the active editor tab, the card's follow-on
  controls and finding selections are replaced by one line saying the choice is made in the run
  view, and they return when it closes or another tab becomes active. Decisions owned by the approval
  owner stay in the card; the run view shows the same decision as a sentence with
  "Answer in the chat card".
gui_related: true
gui_classification_reason: This unit replaces the full panel with an editor-pane document and fixes where run controls render.
depends_on: [CWR-003]
unblocks: [CWR-031]
acceptance_criteria:
  - Opening a run view twice focuses one document and never duplicates it.
  - The run view document id survives restart and routes to the same run.
  - The composer destination stays visible while the run view is open.
  - A run-changing control is never actionable in the card and the run view at once.
  - Approval decisions are taken only in the card.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_run_controls_or_hidden_destination
reasoning_tier: standard
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaborative_surface_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.9 (G-14), 7.12 (G-13), 8.0"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-04"
preserved_exact_tokens:
  - "run view"
  - "crew-work:"
  - "collab-run:"
  - "Answer in the chat card"
negative_constraints:
  - Do not open a second document for a run that already has one.
  - Do not let the run view hide the composer destination.
  - Do not render a run-changing control in two places at once.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-021 - Crew Auto Deterministic Evaluator And Admission Source

```yaml
plan_unit_id: CWR-021
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Crew Auto admission is decided by one pure deterministic evaluator,
  evaluate(criteria, request_features), which for admission reads only the criteria of the project's
  stored Crew Auto configuration (section 5.3; never an uncommitted sheet draft) and the features of
  the submitted request and makes no provider call. The same evaluator produces the
  Crew Auto sheet's preview of sample requests and the live admission decision, so the preview can
  never disagree with admission, and opening or previewing the sheet creates no run, card or Usage
  (MODAL-001..002). Its criteria include the complexity threshold and the minimum number of parts
  that can run at the same time (2 or 3), beside the criteria of section 5.3. A declined evaluation
  creates nothing: no Crew, no card, no Usage and no failed run. An admitted evaluation starts an
  ordinary Crew run. Every CollaborativeRun records admission_source, closed as
  `user | crew_auto | build_with_crew | scheduled_build`, and a run admitted by Crew Auto also records
  crew_auto_revision, the revision of the stored Crew Auto configuration that admitted it, so the
  card can say which rules started it. The Crew Auto team never raises the configured member cap: a
  team larger than the cap is refused as invalid_request naming the cap, and the cap is never
  overwritten from the roster length.
  Crew Auto is the assistant's permission to start a Crew by itself when it needs one (DL-120,
  2026-09-27), and this evaluator remains its gate. The assistant decides when it wants a Crew; a
  Crew starts only when Crew Auto is on for the chat (the chat's override, otherwise the project
  value) and evaluate(criteria, request_features) admits that request. The assistant wanting a Crew
  is never an admission by itself: a request the evaluator declines stays with one assistant and
  creates nothing, and the evaluator never starts a Crew the assistant did not ask for. The sheet's
  preview therefore shows which requests the assistant would be allowed to hand to a Crew. Build
  With Crew on a Plan stays the user's choice and is not admitted through this evaluator.
gui_related: true
gui_classification_reason: The sheet's sample-request preview and the admitted card's origin line read this evaluator and these run fields.
depends_on: [CWR-004]
unblocks: []
acceptance_criteria:
  - The preview and admission call the same evaluator on the same criteria and agree for every request.
  - Evaluation makes no provider call.
  - A declined evaluation creates no run, card or Usage.
  - Every run records admission_source; a Crew Auto run also records crew_auto_revision.
  - A Crew Auto team above the member cap is refused and the cap is unchanged.
  - The assistant starts a Crew by itself only when Crew Auto is on for the chat and the evaluator admits the request.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_auto_preview_disagrees_with_admission
reasoning_tier: high
context_scope: crew_auto_admission
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 8.2 (IMPACT A1-32)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-08 (NOW part)"
  - "Plans/Decision_Log.md DL-120 (card p02, E-02), per the design lead's ruling"
  - "Design lead ruling of 2026-09-27 on the owner's behalf, relayed in the G1 follow-up task (not verifiable from inside this repository)"
preserved_exact_tokens:
  - "evaluate(criteria, request_features)"
  - "admission_source"
  - "user | crew_auto | build_with_crew | scheduled_build"
  - "crew_auto_revision"
negative_constraints:
  - Do not call a provider to decide or preview Crew Auto admission.
  - Do not create a card, run or Usage for a declined evaluation.
  - Do not overwrite the member cap from the team size.
  - Do not let the assistant start a Crew that the evaluator did not admit.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-022 - Build With Crew Sheet Title And Plan-Changed Refusal

```yaml
plan_unit_id: CWR-022
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Build With Crew on a Plan card opens the Crew configuration sheet in Build With Crew mode. The
  sheet's visible title is "Build this plan with a Crew"; the canon name Build With Crew stays on the
  Plan card action and in the sheet head's hover card. The job field is prefilled from the Plan's
  objective and is read-only, the sheet names the exact Plan title and version, and the Plan
  identity, version and hash appear in its technical details. The primary keeps the Start Crew
  prefix and dispatches cmd.chat.plan.build_with_crew, never cmd.collaboration.start. If the Plan
  gained a new version while the sheet was open, Start is refused in place with the Plan owner's
  stale_plan_version reason, stating that the plan changed while the sheet was open and offering to
  reopen it against the current version; the sheet keeps the user's configuration and nothing is
  created.
gui_related: true
gui_classification_reason: This unit fixes the Build With Crew sheet's title, read-only job and in-place refusal.
depends_on: [CWR-004, CWR-018]
unblocks: [CWR-023]
acceptance_criteria:
  - The Build With Crew sheet's title reads "Build this plan with a Crew" and the Plan card keeps "Build With Crew".
  - The primary dispatches cmd.chat.plan.build_with_crew only.
  - A Plan version change while the sheet is open refuses Start in place with stale_plan_version and creates nothing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: build_with_crew_against_changed_plan
reasoning_tier: standard
context_scope: build_with_crew
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.1 (G-28), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-09"
preserved_exact_tokens:
  - "Build this plan with a Crew"
  - "Build With Crew"
  - "cmd.chat.plan.build_with_crew"
  - "stale_plan_version"
negative_constraints:
  - Do not rename the Plan card action.
  - Do not start a Crew against a Plan version that changed while the sheet was open.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
```

### CWR-023 - Build With Crew One-Transaction Admission

```yaml
plan_unit_id: CWR-023
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Start in Build With Crew mode is one transaction: the CollaborativeRun, the PlanRun with
  execution_topology crew and the Plan's To-Do set are committed together or none of them is. A
  partial creation is rolled back and reported as a typed failure, never shown as a card. The
  transaction binds assistant_plan_id, plan_version and plan_hash, and the run records
  admission_source build_with_crew. A Plan version that changed between opening the sheet and Start
  refuses the whole transaction (CWR-022). This restates the atomicity that the Plan owner already
  requires under Build With Crew and Build At in Plans/Assistant_Plan_Runtime.md and adds no new
  contract.
gui_related: false
gui_classification_reason: Transaction atomicity is runtime behavior; the sheet's refusal is carried by CWR-022.
depends_on: [CWR-022]
unblocks: []
acceptance_criteria:
  - CollaborativeRun, PlanRun and To-Dos are all created or none is.
  - A partial creation rolls back and produces no card.
  - The run records admission_source build_with_crew and the bound Plan version and hash.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: partial_build_with_crew_admission
reasoning_tier: high
context_scope: build_with_crew
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 8.15 (IMPACT A3-08)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-28"
preserved_exact_tokens:
  - "CollaborativeRun"
  - "PlanRun"
  - "execution_topology"
  - "build_with_crew"
negative_constraints:
  - Do not create any of CollaborativeRun, PlanRun or To-Dos without the others.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Assistant_Plan_Runtime.md
```

### CWR-024 - Chat Room Round Extension, Waiver And Kind Rows

```yaml
plan_unit_id: CWR-024
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  When a Chat Room has used all its configured rounds, "Add 2 more rounds" is
  cmd.collaboration.reconfigure raising the definition's maximum rounds by two under the
  expected-revision check: it bumps the definition revision, records a system transcript entry and
  leaves prior attribution unchanged. When a member never joined or failed, "Continue without" is an
  explicit waiver of that participant slot through cmd.collaboration.reconfigure that identifies
  actor, reason and currentness (PART-001..006); the room then continues with the available members
  under its turn policy and never fabricates the waived member's messages. Replacing that member is a
  replacement through the same command, with requested-versus-effective disclosure. The Chat Room
  Advanced page adds four kind rows after the shared rows, each a CollaborativeDefinition field:
  moderator style (moderator_style), mentions and replies (mention_policy), when to stop
  (stop_condition) and summary style (summary_style, whose default groups the summary into what was
  agreed, what is still debated and open questions). The shared tools row of a Chat Room offers
  read-only tools only.
  A user message sent to a Chat Room while a round is in progress is queued by default and reaches
  its addressees when the next round starts; the user may instead use Send now, which delivers it
  into the round in progress as steering without interrupting it: no turn is cancelled, the
  participant speaking when it arrives finishes its turn, the next participant to speak reads it
  before taking its turn, every later speaker in that round sees it, and the round is not
  restarted.
  This is the chat's busy-send rule (DL-108) applied to a room (DL-112), and the message is still
  written once and delivered exactly once (section 2.3). End discussion ends a room through
  cmd.chat_room.end (CWR-031, DL-130): no further rounds or messages are taken, the run settles
  completed rather than cancelled, and promotion of the room's existing messages stays available.
  The Moderator row writes the room's coordinator_spec (CWR-037).
gui_related: true
gui_classification_reason: This unit maps Chat Room card actions and Advanced rows to commands and definition fields.
depends_on: [CWR-005, CWR-018]
unblocks: []
acceptance_criteria:
  - Adding two rounds bumps the definition revision and writes one system transcript entry.
  - Continuing without a member records an explicit waiver with actor, reason and currentness.
  - The four Chat Room kind rows persist as definition fields.
  - A message sent mid-round is queued for the next round unless the user sends it now, and sending it now cancels no turn.
  - A message sent now is read first by the next speaker and is seen by every later speaker in that round.
  - End discussion settles the room completed, never cancelled, and keeps promotion available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_silent_roster_change
reasoning_tier: standard
context_scope: chat_room
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.6, 8.3 (G-29), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-10 (NOW part)"
  - "Plans/Decision_Log.md DL-112 (card n03, E-18), DL-130 (card p15, E-32), DL-132 (card p17, E-34)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f n03, p15, p17"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-10 (WAIT part)"
  - "Design lead ruling of 2026-09-27 on DL-112's follow-up (who receives a steer), relayed in the G1 follow-up task"
preserved_exact_tokens:
  - "Add 2 more rounds"
  - "Continue without"
  - "cmd.collaboration.reconfigure"
  - "moderator_style"
  - "mention_policy"
  - "stop_condition"
  - "summary_style"
  - "cmd.chat_room.end"
  - "End discussion"
  - "coordinator_spec"
  - "Send now"
negative_constraints:
  - Do not waive or replace a room member without an explicit user action.
  - Do not fabricate messages for a waived member.
  - Do not cancel or restart a round because the user sent a message during it.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-025 - Review Sheet Target Preview, Focus Roles And Evidence Rule

```yaml
plan_unit_id: CWR-025
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  The Review sheet's target control lists the target kinds of the ReviewTargetPack (the last answer,
  the last agent run, a Plan version, file changes, artifacts, a task result), each with a size line
  such as files and changed lines. The size lines and the change indicator come from a read-only
  target preview query that returns each candidate's sizes and a pre-freeze digest; it freezes
  nothing and makes no provider call. When the digest differs from the one read when the sheet
  opened, the target shows "Changed since you opened this" and the user chooses between the current
  version and the version the sheet opened with; Start freezes the chosen side (MODAL-009..010).
  Focus areas become reviewer roles: each selected focus is written into a reviewer slot's role, and
  by default no two reviewer slots share a focus. The "Also give them" choices add to the pack: test
  results to test_build_evidence_refs, the Plan and the changes to its target and evidence refs, and
  the user's taught rules to user_constraint_refs. The Review Advanced page adds, after the shared
  rows, who compares the notes (the coordinator or adjudicator), the evidence each finding must cite
  (the definition field evidence_citation_rule, default file and line for every finding), the report
  format, and whether dissent is kept.
  On screen the frozen target pack is called the snapshot, for example in the line that names the
  exact version every reviewer read and when the snapshot was taken; ReviewTargetPack and
  frozen target pack stay the terms in records, commands and this document (DL-134).
gui_related: true
gui_classification_reason: This unit defines the Review sheet's target control, focus mapping and Advanced rows.
depends_on: [CWR-006, CWR-018]
unblocks: []
acceptance_criteria:
  - The target preview query freezes nothing and makes no provider call.
  - A target that changed while the sheet was open shows "Changed since you opened this" and Start freezes the side the user chose.
  - Each selected focus lands in a reviewer slot's role.
  - Taught rules reach the pack as user_constraint_refs.
  - evidence_citation_rule is recorded on the definition.
  - Screens say snapshot while records and commands keep ReviewTargetPack.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: review_target_swapped_silently
reasoning_tier: standard
context_scope: review
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 8.5 (G-30 MOD-15)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-11 (NOW part)"
  - "Plans/Decision_Log.md DL-134 (card p19, E-38)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p19"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-11 (WAIT part)"
preserved_exact_tokens:
  - "target preview query"
  - "Changed since you opened this"
  - "user_constraint_refs"
  - "evidence_citation_rule"
  - "snapshot"
  - "ReviewTargetPack"
negative_constraints:
  - Do not freeze a target or call a provider to preview it.
  - Do not swap the reviewed version without the user's choice.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-026 - Review Follow-On Selection, Re-Run Comparison, And Partial Or Stale Actions

```yaml
plan_unit_id: CWR-026
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Create To-Dos opens with a default selection of exactly the confirmed findings with evidence whose
  severity is critical, major or minor. Suggestions and findings whose disposition is uncertain are
  never preselected, and a finding that is not confirmed cannot be selected. The user may change the
  selection before the command runs, and cmd.review.create_todos converts only the final explicit
  selection. A re-run of a Review may show a display-only comparison with the earlier run that counts
  fixed, still open and new findings by comparing the finding_key sets of the two runs. The comparison
  crosses target hashes on purpose, is never persisted as a finding, never merges findings or votes
  across runs and never forms one consensus from two packs. A partial Review offers accept_partial, an
  explicit waiver of the unfinished reviewer slots through cmd.collaboration.reconfigure whose
  artifact identifies partial coverage. A stale Review offers restart_on_current, which is
  cmd.review.run_again against a newly frozen pack, and finish_stale, which is
  cmd.collaboration.reconfigure with accept_stale_target and finishes on the old pack with an
  explicit staleness disclosure. These three are allowed_actions ids of the completion projection
  (CWR-029).
gui_related: true
gui_classification_reason: This unit fixes the Review follow-on selection, the re-run comparison line and the partial and stale decision actions.
depends_on: [CWR-006, CWR-029]
unblocks: []
acceptance_criteria:
  - Only confirmed findings with evidence and severity critical, major or minor are preselected.
  - The re-run comparison is derived from finding_key sets and is never stored or merged.
  - accept_partial, restart_on_current and finish_stale each map to exactly one existing command.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: review_results_merged_across_targets
reasoning_tier: standard
context_scope: review
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/ToDo_Runtime.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.8, 8.5, 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-12 (NOW part)"
preserved_exact_tokens:
  - "cmd.review.create_todos"
  - "finding_key"
  - "fixed, still open and new"
  - "accept_partial"
  - "restart_on_current"
  - "finish_stale"
negative_constraints:
  - Do not preselect uncertain findings or suggestions.
  - Do not persist or merge the re-run comparison.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-027 - BrainStorm Voting Labels, Must-Haves, Synthesis Model, Provisioning And Phase Labels

```yaml
plan_unit_id: CWR-027
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  BrainStorm voting options are shown with plain labels that state the canon rule: under the default
  evidence_weighted voting, evidence decides, votes inform it, and a hard constraint always wins; no
  option label describes a simple majority. Must-haves are the definition's hard_constraints[], each
  {id, text, source}, entered one rule per line on the sheet, frozen with the definition at Start and
  never edited during the run. An option that violates one is disqualified, and each participant's
  conflicts are recorded in BrainstormVote.hard_constraint_conflicts by constraint id. The sheet's
  choice of who writes the plan sets the definition's coordinator or synthesis model, and its
  research-tool installation choice sets provisioning_posture, closed as `ask_first | never_install`,
  which governs when the run may request a ResearchCapabilityProvisioningOperation (section 8.2). The
  card and the run view show plain phase labels mapped one to one onto the seven phases of section
  8.5: Understand the ask (Intake and frontier), Draft ideas alone (Blind proposals), Line up the
  options (Normalize), Debate, Check the facts (Evidence round), Vote, and Write the plan (Synthesis), and
  each label keeps its canonical phase name reachable. A tie is resolved through
  cmd.brainstorm.synthesize_plan with tie_resolution coordinator: the coordinator adjudicates by hard
  constraints and evidence, never by response order, and dissent is preserved (PART-011..015).
  The action that asks for the plan is labelled Write the plan on screen, replacing the earlier
  Synthesize label; the command stays cmd.brainstorm.synthesize_plan (DL-134).
gui_related: true
gui_classification_reason: This unit fixes BrainStorm's voting labels, must-have field, synthesis and provisioning rows, phase labels and tie action.
depends_on: [CWR-007, CWR-018]
unblocks: []
acceptance_criteria:
  - No voting label describes a simple majority.
  - hard_constraints[] is frozen at Start and violations are recorded per vote by constraint id.
  - provisioning_posture never_install prevents any provisioning request.
  - Each plain phase label maps to exactly one section 8.5 phase.
  - A tie is synthesized with tie_resolution coordinator and dissent is preserved.
  - The synthesis action and phase read Write the plan, and the command id is unchanged.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: brainstorm_majority_or_constraint_bypass
reasoning_tier: standard
context_scope: brainstorm
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 8.4 (IMPACT A1-01, A1-25, G-29), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-13 (NOW part)"
  - "Plans/Decision_Log.md DL-134 (card p19, E-38)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p19"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-13 (WAIT part)"
preserved_exact_tokens:
  - "evidence_weighted"
  - "hard_constraints[]"
  - "BrainstormVote.hard_constraint_conflicts"
  - "provisioning_posture"
  - "ask_first | never_install"
  - "tie_resolution"
  - "Understand the ask"
  - "Write the plan"
  - "cmd.brainstorm.synthesize_plan"
negative_constraints:
  - Do not describe BrainStorm voting as a majority rule.
  - Do not let a vote revive an option that breaks a hard constraint.
  - Do not break a tie by response order or provider order.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-028 - Specialists In The Add Specialists Shelf

```yaml
plan_unit_id: CWR-028
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Wonderer and Grill Me are added from the Add specialists shelf of the Crew, Chat Room and
  BrainStorm sheets, never inside the core roster. An added specialist is its own participant row
  with its own model picker, and the Wonderer row also has a Persona picker. Each added specialist
  becomes a ParticipantSpec with additive_role_kind wonderer or grill_me and its own
  requested_model_id (and requested_persona_id for Wonderer); the canonical data shape is unchanged,
  and a specialist never consumes, overwrites or repurposes a core slot. Specialists are refused in
  Crew Auto teams and in Crews used for a scheduled build: the shelf shows them disabled with the
  reason, and a request that carries one is refused as invalid_request. Review has no specialists.
  Grill Me is a methodology Skill and never a Persona (DL-133), so its row has a model picker and no
  Persona picker.
gui_related: true
gui_classification_reason: This unit fixes where specialists are added, what their rows carry and where they are refused.
depends_on: [CWR-008]
unblocks: []
acceptance_criteria:
  - A specialist row carries its own model (and Persona for Wonderer) and never occupies a core slot.
  - Specialists map to ParticipantSpec additive_role_kind with no new record shape.
  - Crew Auto teams and scheduled-build Crews refuse specialists with a stated reason.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: specialist_replaces_core_role
reasoning_tier: standard
context_scope: collaborative_configuration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.0, 8.1, 8.2, 12 (D-13)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-14"
  - "Plans/Decision_Log.md DL-133 (card p18, E-35)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p18"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-14 (WAIT part)"
preserved_exact_tokens:
  - "Add specialists"
  - "additive_role_kind"
  - "requested_model_id"
  - "grill_me"
  - "methodology Skill"
negative_constraints:
  - Do not put a specialist in a core roster row.
  - Do not admit a specialist into a Crew Auto team or a scheduled-build Crew.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-029 - Completion Projection Drives Clean Results And Decision Rows

```yaml
plan_unit_id: CWR-029
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  The completion projection of PART-016..020, pm.collaboration.completion_projection.v1, is the only
  input to a card's clean result and to its decision row. Beside its existing fields it carries
  clean_completion, true only when the kind's completion predicate, the required participant
  dispositions, output and artifact finalisation and every pending user decision are all resolved,
  and allowed_actions, the recovery and follow-on action ids valid for the run now, each mapped to
  one existing command. attention_reason is closed as
  `coordinator_failed | required_participants_unresolved | missing_outputs | member_never_joined | tie | partial_review`.
  A decision row, a failed face and an attention face read only this projection; they never infer
  state from the last message, a finished stream or participant status alone. A coordinator failure
  sets attention_reason coordinator_failed, and the card shows Needs attention with its allowed
  actions (retry the coordinator, replace it through explicit reconfiguration, or cancel); another
  participant never silently becomes coordinator.
  A run that reaches its own time, cost or token limit (DL-131; the limits of CWR-032, which apply
  to every kind because the sheets share one limit row) ends as stopped, with a reason and without
  a new run state: it settles in the existing terminal state cancelled, never failed, and records
  stop_reason, closed as `user_cancel | limit_time | limit_cost | limit_tokens`. stop_reason is set
  on every cancelled run and on no other. The card's face reads Stopped at your limit and names the
  limit reached, everything the run produced so far is kept, and its allowed_actions offer running
  it again with changes (configure plus a new start, CWR-031) and opening the run view. Reaching a
  limit is a stop reason, not an attention reason, so attention_reason keeps its six values.
gui_related: true
gui_classification_reason: The card's result face and decision rows are driven only by this projection.
depends_on: [CWR-009]
unblocks: [CWR-019, CWR-026]
acceptance_criteria:
  - A card shows a clean result only when clean_completion is true.
  - Every decision-row action comes from allowed_actions.
  - attention_reason takes only the six listed values.
  - A coordinator failure shows Needs attention and never promotes another participant silently.
  - A run that reaches its limit settles cancelled with a limit stop_reason, never failed, and its card reads Stopped at your limit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: completion_inferred_from_last_message
reasoning_tier: high
context_scope: collaborative_recovery
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.1 (G-30), 7.4, 7.6 (IMPACT A1-28)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-19 (NOW part), B-CW-27 (NOW part)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-19 (WAIT part), B-CW-20"
  - "Plans/Decision_Log.md DL-131 (card p16, E-33), with the design lead's ruling of 2026-09-27 on how a run at its limit ends"
preserved_exact_tokens:
  - "pm.collaboration.completion_projection.v1"
  - "clean_completion"
  - "allowed_actions"
  - "coordinator_failed"
  - "Needs attention"
  - "stop_reason"
  - "user_cancel | limit_time | limit_cost | limit_tokens"
  - "Stopped at your limit"
negative_constraints:
  - Do not mint a second completion record; extend the existing projection.
  - Do not show a run stopped at its limit as failed, and do not add a run state for it.
  - Do not render a decision action that allowed_actions does not list.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-030 - Participant Activity Projection

```yaml
plan_unit_id: CWR-030
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  The participant activity projection gives each participant of a live run one presentation state.
  It is derived on read from records that already exist and is never persisted, never emitted as an
  event and never replayed. Its shape is {participant_id, state, verb, detail_text?,
  quote_source_id?, live_message_id?, since}, with state closed as
  `working | using_tools | waiting_on | needs_you | being_checked | retrying | done | failed`, and
  needs_you carries a decision_ref. Its sources are the participant's run and attempt records, the
  normalized provider stream of Plans/Contracts_V0.md section 2, the tool.execution_started and
  tool.execution_completed events, and the assistant-turn presentation vocabulary of EP-128, which
  it references and never redefines: using_tools corresponds to a tool subject in its running
  status, and a subject waiting on an approval bound to its tool_use_id makes the participant
  needs_you. Verbs change only at state boundaries and tool events, at most about once every 1.2
  seconds per participant, never per token. A lane quote comes only from the participant's own
  complete, durable message text, referenced by quote_source_id; raw tool output is never quoted as
  speech and becomes a verb with detail_text. Whether only one participant is waiting while the
  others keep working is computed from the projection, never written by hand.
  Live helper text (DL-137, 2026-09-27): while the participant is writing a message, the projection
  carries live_message_id, the collaboration_message_id allocated to that message in progress
  (EP-129), and the lane shows the streamed text as CWR-040 specifies. The projection never holds
  that text, and live_message_id is absent once the message is written or discarded (EP-130,
  EP-131). Live text is not a quote: a lane quote still comes only from a complete, durable message
  through quote_source_id, and streamed words never change the verb.
gui_related: true
gui_classification_reason: The card's lanes, decision sentence and run view team rows read this projection.
depends_on: [CWR-003, EP-128, EP-129]
unblocks: [CWR-019, CWR-040]
acceptance_criteria:
  - The projection is recomputable from existing records and is never stored or emitted.
  - state takes only the eight listed values.
  - Tool subject statuses are consumed from EP-128 without redefinition.
  - Lane quotes reference complete participant messages and never raw tool output.
  - live_message_id is present only while the participant's message is in progress, and the projection never holds streamed text.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: invented_or_persisted_live_activity
reasoning_tier: high
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.3, 7.4"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-21"
  - "Plans/Decision_Log.md DL-137 (card p14, E-31)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 p14"
preserved_exact_tokens:
  - "participant activity projection"
  - "working | using_tools | waiting_on | needs_you | being_checked | retrying | done | failed"
  - "quote_source_id"
  - "decision_ref"
  - "tool.execution_started"
  - "live_message_id"
negative_constraints:
  - Do not persist or emit the activity projection.
  - Do not redefine the EP-128 subject statuses.
  - Do not quote raw tool output as a participant's words.
  - Do not quote a message in progress, and do not store streamed text in the projection.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-031 - Collaborative Command Revisions And Payloads

```yaml
plan_unit_id: CWR-031
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  cmd.collaboration.open takes target, closed as `card | run_view | activity_detail`, and an optional
  focus naming a tab, a participant_id or a finding_id; run_view is the editor document of CWR-020,
  and route success is still not run success. cmd.collaboration.reconfigure is available only while
  the run is waiting, running, blocked or paused, and it carries participant retry, replacement and
  explicit waiver, coordinator or moderator replacement, added rounds, and adding Grill Me mid-run. A
  completed run is never reconfigured: running it again is configure plus a new start with a
  definition seeded from the prior one, or cmd.review.run_again for Review. With accept_stale_target
  true, reconfigure finishes a Review whose target changed on the old frozen pack as an explicit
  waiver with a staleness disclosure, and it is accepted only while the run reports
  target_pack_stale. cmd.collaboration.message, and setting a collaborative composer destination, are
  unavailable on a completed, cancelled or failed run, with the printed reason that the run has
  finished and cannot take messages. cmd.collaboration.export takes content_kind, closed as
  `transcript | result_artifact | report`, beside its format, so one command exports the transcript,
  a Crew result or a Review report. cmd.brainstorm.synthesize_plan accepts tie_resolution coordinator
  when the vote is tied, with no new command. cmd.chat.plan.build_with_crew, owned by
  Plans/Assistant_Plan_Runtime.md, is produced by the Crew sheet in Build With Crew mode and never
  decomposes into cmd.collaboration.start followed by a separate build.
  cmd.review.send_findings_to_agent writes a fix request built from the selected findings into the
  source thread's empty composer buffer and never sends it (DL-125); nothing runs until the user
  presses Send. It returns ComposerBufferResult, refuses composer_not_empty when the buffer already
  holds text, and records the findings' lineage (the run and its finding ids) in the message
  metadata, never in the text. Two commands are added (DL-130). cmd.chat_room.end ends a Chat Room
  that is running, waiting or paused, with ChatRoomEndRequest and ChatRoomEndResult: the room takes
  no further rounds or messages, the run settles completed, and promotion of existing messages stays
  allowed; it is distinct from cmd.collaboration.cancel, which settles cancelled.
  cmd.brainstorm.research_lead asks a BrainStorm run that is running or waiting to research one
  Wonderer lead, with BrainstormLeadResearchRequest and BrainstormLeadResearchResult; the lead stays
  a hypothesis until the research returns evidence, and the result records that evidence or the
  reason the lead was set aside (section 9.2). Its source surfaces are brainstorm_panel and
  wonderer_workspace, the Wonderer workspace document that the central catalog registers as a
  surface (Plans/UI_Command_Catalog.md UCC-169, UCC-171); this document adds no surface of its own
  for it.
gui_related: true
gui_classification_reason: Card, run view and sheet controls dispatch these revised commands and payloads.
depends_on: [CWR-020, CWR-022]
unblocks: []
acceptance_criteria:
  - cmd.collaboration.open accepts only the three targets and an optional focus.
  - Reconfigure is refused on a completed, cancelled or failed run.
  - accept_stale_target is accepted only while target_pack_stale holds.
  - Message is unavailable on a terminal run with a printed reason.
  - Export takes one of the three content kinds.
  - Build With Crew never dispatches cmd.collaboration.start.
  - Send Findings To Agent fills an empty composer and never sends; a composer that holds text refuses with composer_not_empty.
  - cmd.chat_room.end settles the room completed, never cancelled.
  - cmd.brainstorm.research_lead never makes a lead a fact without evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: command_precondition_drift
reasoning_tier: standard
context_scope: collaborative_commands
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: collaborative_command_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.9 (G-30 DEST-03), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-23 (NOW part: REV-1..REV-4), B-CW-24 (NOW part: N-9, N-10, REV-12)"
  - "Plans/Decision_Log.md DL-125 (card p07, E-07), DL-130 (card p15, E-32)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p07, p15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-12 and B-CW-23 (REV-5), B-CW-24 (N-1, N-8)"
  - "Plans/UI_Command_Catalog.md UCC-169 (the wonderer_workspace surface) and UCC-171 (the source surfaces of cmd.brainstorm.research_lead)"
preserved_exact_tokens:
  - "cmd.collaboration.open"
  - "card | run_view | activity_detail"
  - "cmd.collaboration.reconfigure"
  - "accept_stale_target"
  - "target_pack_stale"
  - "content_kind"
  - "transcript | result_artifact | report"
  - "tie_resolution"
  - "cmd.chat.plan.build_with_crew"
  - "cmd.review.send_findings_to_agent"
  - "ComposerBufferResult"
  - "composer_not_empty"
  - "cmd.chat_room.end"
  - "cmd.brainstorm.research_lead"
  - "wonderer_workspace"
negative_constraints:
  - Do not reconfigure a completed run.
  - Do not add a separate tie command or a separate export command per artifact.
  - Do not send findings to the agent before the user presses Send.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/UI_Command_Catalog.md
```

### CWR-032 - Configuration Fields The Sheets Expose

```yaml
plan_unit_id: CWR-032
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  CollaborativeDefinition carries every policy the sheets expose, so a committed sheet is fully
  described by its definition revision: context_policy_ref (what participants can see: the request
  and the files it mentions, and prior chat history only when chosen), tool_policy_ref (tools, MCP
  and Skills, never beyond the parent), stuck_policy (what happens when a participant is stuck;
  default ask_user, and under every value no participant is swapped, skipped or waived without an
  explicit user action), transcript_policy (retention and detail of the full record), output_policy
  (how the run finishes), and, for Crew, shared_notes_policy, closed as
  `shared_space | private_per_participant` and realized through the notebook shared_slice and
  participant scopes (CWR-012). Review adds evidence_citation_rule (CWR-025). Chat Room adds
  moderator_style, mention_policy, stop_condition and summary_style (CWR-024). BrainStorm adds
  hard_constraints[] and provisioning_posture (CWR-027), and its synthesis model is the definition's
  coordinator or synthesis model of section 3. The permission ceiling is shown and never configured
  upward. These fields are written into the definition at commit, and a later Settings change never
  alters them.
  The time and cost limits a definition sets (time_limit_seconds and cost_limit) are that run's own
  limits and override the general run limit for it, whether wider or narrower (DL-131): the
  run-envelope wall-clock default of Plans/Run_Modes.md does not end such a run early. token_limit,
  concurrency, the executionLimits ceilings and the permission ceiling keep the narrowing rule of
  section 2.4, and the card's meta line shows the run's own limit. The definition stores no
  substitution policy that could let a stand-in start (CWR-034).
gui_related: false
gui_classification_reason: This unit is the record shape behind the sheets; the sheets themselves are CWR-018 and the kind units.
depends_on: [CWR-018]
unblocks: []
acceptance_criteria:
  - Every sheet choice is recoverable from the committed definition revision.
  - stuck_policy never swaps, skips or waives a participant without a user action.
  - shared_notes_policy uses the notebook scopes and no parallel store.
  - A run's own time and cost limits replace the general run limit for that run.
  - token_limit and the concurrency ceilings still only narrow.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: sheet_choice_not_in_definition
reasoning_tier: standard
context_scope: collaborative_configuration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.0 (G-29), 8.1 (G-29), 8.3 (G-29), 8.4 (G-29), 8.5"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-15 (NOW part)"
  - "Plans/Decision_Log.md DL-131 (card p16, E-33), DL-121 (card p03, E-03)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p16, p03"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-15 (WAIT part)"
preserved_exact_tokens:
  - "stuck_policy"
  - "shared_notes_policy"
  - "shared_space | private_per_participant"
  - "context_policy_ref"
  - "output_policy"
  - "time_limit_seconds"
  - "cost_limit"
negative_constraints:
  - Do not keep a sheet choice outside the definition.
  - Do not create a second notes store for Crew shared notes.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-033 - Collaboration View-State Census

```yaml
plan_unit_id: CWR-033
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  These collaboration interactions are view state or draft state and mint no command (MODAL-015..018,
  CDRY-006): the card's expand state, with three values auto, open, closed, where the first
  activation on any card opens it; the in-card More row of real buttons and its in-place cancel
  confirmation, whose keep-going choice is view state; the run view's active tab and selected
  participant; revealing a card from the dock; opening and closing a sheet's Advanced page; the
  stashed Crew draft kept while the user detours to the Crew Auto sheet, restored on returning,
  cancelling or turning Crew Auto on, and dropped when both sheets close; restoring the last removed
  roster row for a few seconds; and the Revert document's view switch, revert-view, whose owner is
  Plans/assistant-chat-design.md. Only the command a surface finally dispatches is a command.
  The ELI5 disclosure is view state too (DL-126, 2026-09-27). The ELI5 sheet, owned by
  Plans/assistant-chat-design.md, has one disclosure that shows how the chat's explanation style is
  decided, and opening or closing it mints no command. It traces the resolution order and marks the
  level that decides, in the order ACD-484 owns: the chat's own override (general.interaction.chat-eli5,
  the existing per-conversation setting of Plans/Settings_System.md) if it has one,
  otherwise the project default, otherwise the app default (general.interaction.eli5-default). The
  project default needs a project scope on general.interaction.eli5-default, which is a Settings
  follow-up outside this document. Choosing a value in the disclosure is not view state: for this
  chat it dispatches cmd.chat.eli5.set with on, off or inherit, where inherit follows the project
  default (the command and its values are the catalog's, UCC-175), and at the project or app level
  it is a Settings transaction, never a command minted here.
gui_related: true
gui_classification_reason: This unit classifies card, sheet and run view interactions as view or draft state for the command census.
depends_on: [CWR-020]
unblocks: []
acceptance_criteria:
  - None of the listed interactions has a command ID.
  - The stashed Crew draft is restored on return, cancel or enable and dropped when both sheets close.
  - Opening or closing the ELI5 disclosure dispatches nothing; choosing this chat's value dispatches cmd.chat.eli5.set, and choosing the project or app value is a Settings transaction.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: command_minted_for_view_toggle
reasoning_tier: standard
context_scope: collaborative_commands
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: collaborative_command_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.1 (G-19), 8.0 (G-12), 8.2 (G-27), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-25 (NOW part)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-25 (WAIT part: the ELI5 disclosure)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 8.13"
  - "Plans/Decision_Log.md DL-126 (card p08, E-11; owner resolution confirmed in chat on 2026-09-27)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 p08"
  - "Plans/Settings_System.md general.interaction.chat-eli5 (the existing per-conversation ELI5 override) and general.interaction.eli5-default"
  - "Plans/assistant-chat-design.md ACD-484 (the ELI5 resolution order and the ELI5 popup)"
  - "Plans/UI_Command_Catalog.md UCC-175 (cmd.chat.eli5.set with on, off or inherit, and the eli5_sheet surface)"
preserved_exact_tokens:
  - "view state"
  - "auto, open, closed"
  - "revert-view"
  - "ELI5 disclosure"
  - "cmd.chat.eli5.set"
  - "general.interaction.chat-eli5"
  - "general.interaction.eli5-default"
negative_constraints:
  - Do not mint a command for a visual toggle, a tab, a disclosure or a draft edit.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-034 - An Unavailable Chosen Model Blocks Start Until Replaced

```yaml
plan_unit_id: CWR-034
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  A model set on a participant, coordinator or moderator row of a sheet, including one prefilled
  from a default, is the model the user chose for that row. If it, or the account or provider it
  runs on, is unavailable when Start is pressed, Start is blocked until the user picks a replacement
  for that row (DL-121). No other model stands in automatically, not even another model of the same
  provider, and no definition field, Advanced row or preset can allow a stand-in: the sheet's
  substitution row is a sentence stating this rule and offers no choice (CWR-018). The blocked sheet
  names the row, the chosen model and the owner's typed reason (model_unavailable or
  account_unavailable) and keeps every other choice. The refusal creates no run, card, participant
  disposition or Usage and claims no provider attempt (PART-021..024). A replacement the user picks
  becomes that row's chosen model, so Start never admits a participant that runs a different model
  from the one chosen for it. After Start, a participant whose model becomes unavailable is never
  replaced silently: it follows its stuck_policy and the explicit retry, replacement or waiver of
  cmd.collaboration.reconfigure (PART-001..006). This settles the substitution rule of sections 2.2
  and 15 for chosen participants in favour of blocking.
gui_related: true
gui_classification_reason: This unit fixes what the sheet shows and refuses when a chosen model is unavailable at Start.
depends_on: [CWR-018, CWR-032]
unblocks: []
acceptance_criteria:
  - Start with an unavailable chosen model is refused until the user replaces that row, and nothing is created.
  - No stand-in model is ever admitted for a chosen row, including a same-provider model.
  - The substitution row offers no choice.
  - A replacement becomes the row's chosen model before Start is admitted.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_stand_in_for_chosen_model
reasoning_tier: standard
context_scope: collaborative_configuration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Models_System.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md DL-121 (owner answer to card p03, E-03, 2026-09-27)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p03"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.0, 12 (E-03)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-02, B-CW-15 (substitution part)"
preserved_exact_tokens:
  - "model_unavailable"
  - "account_unavailable"
  - "stuck_policy"
  - "cmd.collaboration.reconfigure"
negative_constraints:
  - Do not let any model stand in for a chosen model at Start, whatever the provider.
  - Do not offer a substitution choice on the sheet or store one on the definition.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-035 - Compact Card Faces And Theme-Family Motion

```yaml
plan_unit_id: CWR-035
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  The facts and actions that section 4.1 lists are required of the card as a whole, not of every
  density (DL-123). A collapsed card and a receipt may keep Open Panel, Message and More behind
  Expand, and when the card is narrower than 520 px the participant count may move from the card
  head into the card's hover card. Expand is present at every density, so every listed fact and
  action stays one activation away. On every face of a run that has ended, completed, cancelled
  (including stopped at its own limit) or failed, that is the result, failed and receipt faces,
  Message sits in More as a disabled item with its printed reason, that the run has finished and cannot take messages
  (CWR-031). The card moves the same way for every kind but not for every theme: each theme family
  has its own motion personality for popups and chat cards (DL-113). The family rules themselves
  (durations, easing and entry scale) belong to the theme and motion owner, Plans/FinalGUISpec.md,
  and are not stated here, and this unit does not change the spring motion that section 4.1
  names. Under Reduce Motion every arrival, fold and density change of the card is instant in every
  family (DL-115). A density change never re-creates the card (CWR-019).
gui_related: true
gui_classification_reason: This unit fixes which card facts may move behind Expand or into the hover card, and how the card's motion varies by theme family.
depends_on: [CWR-019]
unblocks: []
acceptance_criteria:
  - A collapsed card or receipt reaches Open Panel, Message and More through Expand.
  - The participant count moves into the hover card only below 520 px of card width.
  - A completed, cancelled or failed run's Message is disabled in More with its printed reason on every face.
  - Under Reduce Motion the card's changes are instant in every theme family.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: card_hides_action_without_route
reasoning_tier: standard
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaborative_surface_contract
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md DL-123 (card p05, E-05), DL-113 (card n04, E-22), DL-115 (card n06, E-25)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p05, n04, n06"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 5.7, 7.1, 7.2, 7.9"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-03 (WAIT part)"
preserved_exact_tokens:
  - "Expand"
  - "520 px"
  - "motion personality"
  - "Reduce Motion"
negative_constraints:
  - Do not drop a card fact or action that is not reachable through Expand or the hover card.
  - Do not invent per-family motion values in this owner.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-036 - Activity Team List And Helper Wording

```yaml
plan_unit_id: CWR-036
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Clicking the Activity domain chip of Crew, Chat Room, BrainStorm or Review reveals the newest card
  of that kind in the thread. The chip's hover card lists at most four runs, each with its kind mark,
  its card title, its one status sentence and its clock, plus a row that shows the rest in Activity;
  clicking a hover row keeps the existing route, which pins Activity and selects that run in
  Activity Detail. For these four kinds Activity Detail shows a compact body (DL-122): the run's
  title and status sentence, its current step, a short team list with one row per participant (its
  mark, its name and one state word, plus a requested-versus-effective line only when they differ),
  and Open Panel and Message. The body never repeats the whole card or the kind's board; the full
  card-and-grid content is one activation away in the run view (CWR-020). This is a scoped exception
  to the 2026-09-08 rollback to native cards and grids (APR-060) for these four kinds only. Team rows
  stay clickable across the whole row (section 4.3). On screen the people in a run are called
  helpers, and reviewers in Review; participant stays the term in records, commands, events and this
  document (DL-124). The composer ribbon therefore reads, for example,
  `To: BrainStorm · Provider Architecture · 4 helpers`, and a user message sent to a Chat Room carries
  a meta line such as `Sent to the room · 3 replies`; no read marker is shown, because this owner
  defines none.
gui_related: true
gui_classification_reason: This unit fixes the Activity chip route, hover card, compact Activity Detail body and the on-screen word for participants.
depends_on: [CWR-020]
unblocks: []
acceptance_criteria:
  - The chip reveals the newest card of its kind, and hover rows still route to Activity Detail.
  - Activity Detail for the four kinds shows the short team list and never the whole card.
  - Screens say helpers (reviewers in Review) while records keep participant.
  - No read marker appears on a collaborative message.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: activity_detail_duplicates_run_view
reasoning_tier: standard
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: collaborative_surface_contract
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md DL-122 (card p04, E-04), DL-124 (card p06, E-06)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p04, p06"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.9 (IMPACT A1-40), 7.13 (G-24), 9.1"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-05, B-CW-06"
preserved_exact_tokens:
  - "Activity Detail"
  - "helpers"
  - "participant"
  - "4 helpers"
  - "3 replies"
negative_constraints:
  - Do not repeat the run view's full content in Activity Detail.
  - Do not rename participant in records, commands or events.
  - Do not show a read marker.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-037 - Coordinator Specification, Coordinator-Authored Parts And The Lead's Own Work

```yaml
plan_unit_id: CWR-037
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  coordinator_spec on CollaborativeDefinition is typed as {kind, participant_slot_id?,
  requested_provider_id?, requested_account_id?, requested_model_id?, requested_persona_id?}, with
  kind closed as `parent_assistant | participant_slot | dedicated_model`. parent_assistant is this
  chat's assistant; participant_slot names one of the run's participant slots, which then leads and
  also does a part; dedicated_model adds one lead with its own requested identity and cost. The Crew
  sheet's Coordinator choice writes it, and a Chat Room's Moderator row, with its model and Persona,
  writes the same field for the room. In a Crew the coordinator authors each assignment's expected
  output and its dependencies when it splits the job (DL-128); the sheet does not ask for them. They
  are stored on the assignment records, shown in the run view, and open to the user's question; a
  correction to one is recorded with its evidence and never silently replaces the earlier text.
  The Crew's former "shared versus private scratch" choice is the shared notes row
  (shared_notes_policy, CWR-032). No participant approves its own work: when coordinator_spec kind is
  participant_slot, the lead's own part is checked by this chat's assistant and never by the lead
  itself (DL-132). The participant_slot choice is offered only where the runtime enforces that
  check; elsewhere the sheet shows it disabled with its reason.
gui_related: true
gui_classification_reason: The Crew sheet's Coordinator choice, the Chat Room Moderator row and the run view's parts read this contract.
depends_on: [CWR-004, CWR-032]
unblocks: []
acceptance_criteria:
  - coordinator_spec takes only the three kinds and carries the slot or requested identity each needs.
  - The Crew sheet asks for no expected outputs or dependencies; the coordinator's are visible in the run view.
  - A corrected expected output keeps its earlier text and the correction's evidence.
  - A lead that also does a part never checks its own part; this chat's assistant does.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: coordinator_self_approval
reasoning_tier: high
context_scope: crew_protocol
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_protocol_contract
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md DL-128 (card p10, E-14), DL-132 (card p17, E-34)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p10, p17"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.1, 8.3, 12 (D-17)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-07, B-CW-10 (Moderator part)"
preserved_exact_tokens:
  - "coordinator_spec"
  - "parent_assistant | participant_slot | dedicated_model"
  - "participant_slot_id"
  - "shared_notes_policy"
negative_constraints:
  - Do not let a lead check its own part.
  - Do not ask for expected outputs or dependencies on the Crew sheet.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-038 - Crew Auto Settings Row, One-Command Commit And Kind Entry Points

```yaml
plan_unit_id: CWR-038
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  The Multi-Agent submenu of section 5.3 gains a Crew Auto settings… row directly under the Crew Auto
  check, and Manage Defaults… keeps its name and its route to the Settings manager (DL-119). Crew Auto
  settings… dispatches cmd.chat.crew_auto.open_config, whose surfaces are the multi-agent menu and
  the Crew sheet's own link to the Crew Auto sheet (workflow_modal); route success is still not
  enablement. The Crew Auto sheet's primary is one click and one command: it dispatches
  cmd.chat.crew_auto.set once, and CrewAutoSetRequest carries the Crew Auto rules (the criteria of
  section 5.3 and CWR-021) together with the Crew Auto team, which the command commits through the
  project Settings transaction that MODAL-006..008 requires. No second dispatch commits part of them,
  and where the values are stored stays the Settings owner's. Review and BrainStorm keep their entry
  points, Review through the primary mode menu and its sidecars and BrainStorm through Deep Plan
  (CWR-017): canon adds no wand row for either.
  CrewAutoSetRequest names its scope, closed as `project | thread` (DL-120, 2026-09-27): the Crew
  Auto sheet's primary sends project, which commits the rules and the team and turns Crew Auto on
  for the project; a chat's Crew Auto check sends thread, which sets only that chat's override of
  the project value. Turning Crew Auto on for the project leaves one line in the chat where it was
  turned on, worded for the project (DL-135, card p11, option A): Crew Auto is on for this project. The
  note is owned by this document. It records the setting change and is not a run, a card, an
  Activity entry or Usage; its Change control opens the Crew Auto sheet through
  cmd.chat.crew_auto.open_config from the crew_auto_receipt surface. Saving rules while Crew Auto
  is already on for the project, and changing one chat's check, add no note.
gui_related: true
gui_classification_reason: This unit fixes the Multi-Agent menu rows, the Crew Auto commit and the entry points of Review and BrainStorm.
depends_on: [CWR-004, CWR-021]
unblocks: []
acceptance_criteria:
  - The Multi-Agent submenu shows Crew Auto settings… under the Crew Auto check and keeps Manage Defaults….
  - Crew Auto settings… dispatches cmd.chat.crew_auto.open_config and never changes the check state.
  - One activation of the Crew Auto primary dispatches exactly one cmd.chat.crew_auto.set carrying the rules and the team.
  - Review and BrainStorm have no wand rows in canon.
  - Turning Crew Auto on for the project leaves exactly one Crew Auto is on for this project line in that chat and creates no run or card.
  - A chat's check sends scope thread and never changes the project value.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_auto_split_commit
reasoning_tier: standard
context_scope: crew_protocol
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: crew_protocol_contract
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md DL-119 (card p01, E-01)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p01"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de section 8.2 (D-3, G-27), 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-08 (E-01 part), B-CW-17, B-CW-24 (REV-10 and REV-11 parts)"
  - "Plans/Decision_Log.md DL-120 (card p02, E-02), per the design lead's ruling of 2026-09-27"
  - "Plans/Decision_Log.md DL-135 (card p11, E-15), option A, Keep the note, worded for the project"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 p11 (answered 2026-09-27T21:37:48Z)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-08 (E-15 part), B-CW-18, B-CW-24 (REV-10 crew_auto_receipt)"
preserved_exact_tokens:
  - "Crew Auto settings…"
  - "Manage Defaults…"
  - "cmd.chat.crew_auto.open_config"
  - "CrewAutoSetRequest"
  - "workflow_modal"
  - "project | thread"
  - "Crew Auto is on for this project"
  - "crew_auto_receipt"
negative_constraints:
  - Do not rename Manage Defaults….
  - Do not let a chat's check change the project value.
  - Do not post a Crew Auto note as a run, a card or Usage.
  - Do not commit the Crew Auto rules and team through two dispatches.
  - Do not add wand rows for Review or BrainStorm.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-039 - Team Presets Per Kind

```yaml
plan_unit_id: CWR-039
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  Start from a team offers a built-in catalog of team presets for each kind: Crew, Chat Room,
  BrainStorm and Review (DL-117). A preset is {id, label, helper, rows, config_overrides}: rows have
  the shape of participant specs (role, requested model, requested Persona, additive role and, for
  Review, the reviewer's focus), and config_overrides are definition fields the sheet exposes.
  Choosing a preset only prefills the draft (CWR-018); it never writes a definition, a Settings value
  or a run, never adds a specialist where specialists are refused (CWR-028), and never raises a cap
  or a limit beyond what the sheet itself allows. The built-in presets are, for Crew, Build and
  check, Split a big change and Try it two ways; for Chat Room, Quick opinions, Debate and Deep dive;
  for BrainStorm, Balanced four, Quick call and Wide search; for Review (DL-117, as the design lead
  named them on 2026-09-27), Careful review · Security, Bugs and Tests (3 reviewers), Quick check ·
  one reviewer, and Deep audit · 5 reviewers, one of them a Critical Advisor. Careful review is
  Review's default preset: its three reviewers take the Security, Bugs and Tests focus roles
  (CWR-025), and it is the preset a Review sheet shows as applied when it opens without a saved
  default roster. Preset rows use the Personas registered for team use in
  Plans/Personas.md: Product Manager, Architect, Implementer, Reviewer, Critical Advisor and Wonderer
  (DL-133). Grill Me is a methodology Skill and never a Persona, so a preset adds it only as a
  specialist row (CWR-028). A saved default roster is the Settings owner's and is not part of this
  catalog.
gui_related: true
gui_classification_reason: This unit defines the Start from a team catalog each sheet offers.
depends_on: [CWR-018, CWR-028]
unblocks: []
acceptance_criteria:
  - Every kind, Review included, offers Start from a team.
  - A preset changes only the draft.
  - Preset rows use only Personas registered for team use, and Grill Me appears only as a specialist row.
  - Review offers Careful review, Quick check and Deep audit, and Careful review is its default preset.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: preset_writes_state_or_uses_unregistered_persona
reasoning_tier: standard
context_scope: collaborative_configuration
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Personas.md
node_compile_hint:
  mode: collaborative_configuration_contract
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md DL-133 (card p18, E-35), DL-117 (card n08, E-37)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json sha256:4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f p18, n08"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.0, 8.1, 8.3, 8.4, 8.5"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-26"
  - "Design lead ruling of 2026-09-27 naming the Review presets DL-117 asked for, relayed in the G1 follow-up task"
preserved_exact_tokens:
  - "Start from a team"
  - "config_overrides"
  - "Critical Advisor"
  - "Grill Me"
  - "Careful review"
  - "Quick check"
  - "Deep audit"
negative_constraints:
  - Do not let a preset write a definition, a Settings value or a run.
  - Do not use a Persona that is not registered for team use.
  - Do not treat Grill Me as a Persona.
owner_hints:
  - Plans/Collaborative_Workflows.md
```

### CWR-040 - Live Helper Text In The Lanes

```yaml
plan_unit_id: CWR-040
unit_type: requirement
status: accepted
owner_doc: Plans/Collaborative_Workflows.md
canonical_text: >-
  While a participant or the coordinator is writing a message, its lane shows that message in
  progress, live, word by word (DL-137): in the card's lane line for each of the at most three lanes
  the card shows, and in the run view's Conversation tab and the writer's own transcript. It reuses
  the assistant reply streaming instead of defining a second streaming model: the text is the helper
  message in progress of Plans/Executor_Protocol.md EP-129..EP-131, presented over the stream
  vocabulary of EP-128, and its words are released with the reply pacing of ACD-470, which never
  delays, reorders or drops text. Lanes folded into the +N more row stream nothing on the card, and
  several lanes may stream at once. The streamed text is presentation of a message in progress,
  never a second record. The finished message lands once, whole (EP-130), and from then on the lane
  quotes it through quote_source_id (CWR-030); the settled lane shows the same text as the last
  streamed frame. A message in progress that does not finish, because its attempt is cancelled,
  fails, times out or is replaced, leaves the lane and is never quoted; the lane then shows the
  participant's outcome and its last complete quote, if it has one (EP-131). The lane's state and
  verb still come from the participant activity projection, streamed words never change the verb,
  and raw tool output is never shown as the helper's words. A provider tier that reports no
  streaming events shows the helper's message whole when it lands and never pseudo-streams it.
gui_related: true
gui_classification_reason: This unit defines the live text a person sees in a collaboration card's lanes and in the run view while helpers write.
depends_on: [CWR-030, EP-129, EP-130, EP-131, ACD-470]
unblocks: []
acceptance_criteria:
  - A lane of a participant that is writing shows its message in progress, and its text only grows until the message lands or is discarded.
  - The landed message is written once and its text equals the last streamed frame.
  - A message in progress that does not finish leaves the lane and is never quoted.
  - Streamed words never change the lane's verb.
  - A provider tier without streaming events shows the message whole and never pseudo-streams it.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: live_helper_text_persisted_or_quoted
reasoning_tier: high
context_scope: collaborative_surfaces
implementation_surfaces:
  - Plans/Collaborative_Workflows.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: collaborative_runtime_contract
  create_worknodes: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.3, 7.4"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-22, B-CW-21"
  - "Plans/Decision_Log.md DL-137 (card p14, E-31)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 p14"
preserved_exact_tokens:
  - "message in progress"
  - "word by word"
  - "never a second record"
  - "quote_source_id"
  - "+N more"
negative_constraints:
  - Do not define a second streaming model for helpers.
  - Do not persist, deliver or quote a message in progress.
  - Do not pseudo-stream a message whose provider reported no streaming events.
owner_hints:
  - Plans/Collaborative_Workflows.md
  - Plans/Executor_Protocol.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Personas.md, ContractName:Plans/Decision_Log.md
