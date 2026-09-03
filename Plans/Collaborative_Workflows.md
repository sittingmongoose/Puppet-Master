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

The closed run states are `configuring | running | paused | waiting | blocked | completed | cancelled | failed`. `waiting` means the run is admitted and alive but is blocked on an owner-reported external condition such as a permission decision, a quota reset, or a scheduled window; `blocked` means the run itself cannot proceed and names the blocking reason. A collaborative run never displays a bare `Working` label when an owner reason exists.

### 2.2 Participant slots and identity

A participant slot is defined by `ParticipantSpec` and identified by `participant_slot_id`. The slot records role, `requested_provider_id`, `requested_account_id`, `requested_model_id`, `requested_persona_id`, `requested_skill_ids`, `requested_tool_profile_id`, and `additive_role_kind` closed to `none | wonderer | grill_me`. The runtime assignment record stores requested and effective fields separately with a substitution or failure reason drawn from the model, account, and permission owners. The same requested model may be assigned to several slots — this is required for Multi-Pass Review — and each slot still receives a distinct participant identity, a distinct attempt identity, and a distinct isolated session. Two slots that resolve to the same model are never collapsed, deduplicated, or shown as one participant.

Requested and effective identity is disclosed wherever the participant appears: modal row, card participant row, panel participant list, participant transcript header, and Usage attribution. When a selected model, account, provider, or Persona is unavailable, the surface states the requested value, the effective value, and the reason. Silent substitution is forbidden. When failure policy forbids substitution, the slot fails with a typed reason and the run reports the degraded roster rather than quietly proceeding with a different roster.

### 2.3 Transcript and message model

`CollaborationMessage` is the single durable transcript record for all four kinds. `sender_kind` is closed to `user | participant | coordinator | system`. `message_type` is closed to `message | request | response | warning | conflict | dependency | handoff | vote | finding | pass`. Messages carry `recipient_ids`, `reply_to`, `attachment_refs`, `created_at`, and a monotonic `sequence` per run. Mentions, replies, assignments, findings, and votes are message types plus typed side records; they are not four separate transcript stores.

A user message sent to a collaborative destination appears in both the main thread transcript and the collaboration transcript. It is written once and referenced twice; the duplicate presentation never creates two durable user messages, and participants receive it exactly once. Per-participant transcripts are filtered projections of the same message store plus that participant's private working slice; they are not independent logs.

### 2.4 Artifacts, Usage, and limits

Collaborative artifacts are ordinary Puppet Master artifacts created through the artifact owners and referenced by `artifact_refs`. This document owns which artifacts a protocol must produce and when; it does not own artifact version, retention, or export mechanics. Deleting a collaboration card or message cannot purge a shared referenced artifact.

Usage attribution is per participant and per run group through `usage_group_ref`. Participant rows, the panel, and the Usage surface show attributed cost and token consumption with requested/effective identity. Collaborative Workflows never fabricates totals, reset facts, or quota truth; it projects what the Usage owner reports and shows an explicit unknown state otherwise.

Configured `concurrency`, `time_limit_seconds`, `token_limit`, and `cost_limit` are workflow-level requests. They narrow admission; they never widen it. Child admission, crew concurrency, nesting depth, and total active agent ceilings resolve through the `executionLimits` contract owned by `Plans/orchestrator-subagent-integration.md`. This document must not restate, widen, or invent alternate ceiling numbers. A configured concurrency above the orchestrator ceiling is clamped, disclosed as requested-versus-effective, and never silently honored.

### 2.5 Permission ceiling

Every collaborative run inherits the parent thread, mode, and Plan permission ceiling. A participant cannot self-approve, cannot request its own escalation directly to the user outside the approval owner, and cannot acquire authority its parent does not hold. Permission requests raised inside a run route to `Plans/Permissions_System.md` with the run, participant slot, and requested capability attached, and the decision is recorded on the run. A coordinator has no additional authority over the permission layer; coordinating work is not authorizing work.

Mutation authority is inherited, never configured upward. Crew inherits the parent mode's mutation authority. BrainStorm and Review are read-only against the target project regardless of parent authority. Chat Room has no project mutation authority; it may only produce transcript, artifacts, and explicitly promoted records.

### 2.6 Pause, resume, cancel, and recovery

Every kind supports pause, resume, and cancel where its state allows, and disabled controls state the owner reason. Pause reaches a safe boundary rather than tearing down in-flight participant work, preserves participant state and pending inbox, and does not discard composer-target text or attachments. Resume continues the same run and does not duplicate already-delivered participant work. Cancel stops new admissions, retains the card, transcript, participants, and artifacts with truthful cancelled state, and records a cancellation receipt.

Restart restores collaborative runs, participant states, transcripts, artifacts, the Activity domains, and the current composer destination. Every asynchronous start command is idempotent: a double invocation returns the original `collaboration_run_id` and receipt and creates no second run. Replayed results return original object and receipt IDs with no second side effect. No client-local timer is authoritative for collaborative run state; a closed window does not cancel a run and does not resume one.

## 3. Configuration modal contract

Crew, BrainStorm, Review, and Chat Room each open a configuration modal on every invocation. Settings defaults prefill the modal; they never skip it. There is no remembered "do not ask again" path, no silent reuse of the previous configuration, and no invocation route that starts a run without a committed configuration. Re-running an existing collaboration still opens the modal prefilled from the prior committed definition.

The shared modal shell and participant-row grammar are common to all four kinds. The shared fields are workflow name and purpose; participants and roles; provider, account, and model per participant; Persona per participant; optional Wonderer and Grill Me additions where the kind supports them; coordinator or synthesis model; context sharing and attachments; tool, MCP, and Skill policy; permission ceiling; concurrency; time, token, and cost limits; failure and substitution policy; transcript retention and detail; and output format.

Each participant row shows role, Persona picker, provider/account/model picker, tool and Skill summary, and remove/duplicate controls. Requested and effective identity is shown inline whenever a selected route is unavailable or degraded. Provider marks use the existing shared SVG marks; letter-only substitute marks are forbidden. Adding Wonderer or Grill Me from the footer `Add specialists` section creates a dedicated additive participant row; it never overwrites, repurposes, or consumes a core role row.

Committing the modal writes or bumps the `CollaborativeDefinition` revision and returns it with the run start request. The modal discloses any unavailable selection before start. Cancelling the modal starts nothing, creates no run, produces no card, and records no Usage.

## 4. Cards, panels, Activity, and composer targeting

### 4.1 Transcript card

All four kinds create a transcript card at start. The card uses the same dimensions, tokens, and existing spring motion for every kind. The collapsed card shows workflow identity, status, participant count, the current phase or the latest meaningful activity or the final result, and the actions `Expand`, `Open Panel`, `Message`, and `More`.

The expanded inline card shows participant rows, a bounded recent transcript slice, assignments or discussion or findings as the kind requires, warnings and disagreement, the current artifact or output preview, and a Usage summary. The expanded card is deliberately bounded: the full transcript belongs to the panel, never to the inline card. Expanded and collapsed state is local view state and is not domain truth.

### 4.2 Full panel

The full panel is one shared shell with kind-specific tabs and sections. It shows the full transcript, the participant list with clickable transcripts, assignments and questions and research and tool activity, artifacts and findings and votes, Usage with requested/effective identity, and history, recovery, and output actions. The panel pins or transient-docks under the existing Activity and side-panel constraints and must never hide the main composer destination state.

### 4.3 Participant rows and participant transcripts

Every participant row in the modal, card, panel, and Activity Detail is clickable across its entire row. Clicking opens that participant's transcript together with its requested and effective identity, assignment, tool and Skill set, artifacts, Usage, and current state. Restricting the click target to a small glyph is forbidden. A participant with no output yet opens a truthful empty transcript with its current state, never a fabricated summary.

### 4.4 Activity domains

Crew, BrainStorm, Review, and Chat Room each contribute a dynamic per-thread Activity domain alongside Goal, To-Dos, Subagents, Changes, and Artifacts. A domain appears only when the thread has current or historical records for that kind and is omitted otherwise. Domains show active and completed run counts plus latest status, respect the existing responsive compaction tiers and hover-card dwell, and route clicks to the corresponding card, panel, or participant transcript through Activity Detail. Cards remain in the transcript because a collaborative run is a conversational workflow record; the Activity domain is a projection, not a replacement.

### 4.5 Composer destination targeting

`Message` on any collaborative card or panel targets the ordinary composer. Puppet Master does not open a second input surface for collaborative messaging. The composer's destination is persisted with the composer buffer as `ComposerDestination` with `destination_kind` closed to `assistant | crew | brainstorm | review | chat_room | plan_revision`, plus `destination_id`, optional `participant_id`, `display_label`, and `state_generation`.

When a collaborative destination is active, the composer adds a narrow ribbon inside its top edge, changes the outer border and background tint, and illuminates the matching small destination glyph near the Attach and capability glyphs. The ribbon names the destination, for example `To: BrainStorm · Provider Architecture · 4 participants`, and carries a close control. The treatment stays theme-aware and subtle rather than a broad colored stripe or left accent. Clicking the destination glyph opens the list of eligible destinations. At narrow widths the ribbon label ellipsizes before the close control is removed and the participant cluster may collapse to a workflow icon plus count; a hidden send destination is never acceptable.

Dispatch revalidates that the target and `state_generation` can still accept input. The stored label alone is never sufficient. Changing destinations never clears composer text or attachments; attachments follow the selected destination on send. A direct collaborative message does not consume one of the primary Agent follow-up queue's two slots.

### 4.6 Destination edge cases

When the targeted collaboration ends and the composer buffer is empty, the destination returns to Assistant automatically. When the targeted collaboration ends and the composer buffer is not empty, the destination does not silently redirect: the ribbon reports that the target has ended and the user must explicitly retarget or clear. Closing the ribbon returns to Assistant with text and attachments unchanged. A destination whose generation has advanced fails closed with an exact reason rather than delivering into a stale target.

## 5. Crew

### 5.1 Purpose and distinction

Crew divides bounded work among configured members and executes it under a coordinator. It is an execution workflow, not a discussion workflow. Crew is distinct from Chat Room, which discusses without delegated execution; from BrainStorm, which plans read-only and ends in one Plan document; and from Subagents, which is the raw child-run projection owned by `Plans/orchestrator-subagent-integration.md`. The older rule that Crew is merely an On/Off switch is retired. Crew is a configurable workflow with a coordinator, roles, models, Personas, tools, context, expected outputs, and dependencies.

### 5.2 Configuration

The Crew modal configures the coordinator, which is the parent assistant, a selected participant, or a dedicated synthesis model; member roles, models, Personas, Skills, tool subsets, and context visibility; assignment strategy closed to `manager_directed | explicit_static | adaptive`; dependencies and parallelism; expected output per assignment; shared versus private scratch behavior; synthesis and disagreement policy; and cost and time limits. Mutation authority is inherited from the parent mode and Plan permissions and is not a Crew modal field that can raise it.

Each assignment carries a description, an explicit expected-output contract, its dependency set, its tool set, and its context slice. The coordinator cannot mark an assignment complete without a result that satisfies its expected-output contract; a tool-success signal is evidence input, not completion. Assignments whose dependencies are unsatisfied are pending, not blocked. Independent assignments may run in parallel up to the effective concurrency, which is the configured concurrency clamped by the orchestrator `executionLimits` ceilings.

### 5.3 Crew Auto

Crew Auto is a checkable item in the Multi-Agent submenu:

```text
Crew…
Chat Room…
────────
✓ Crew Auto
Manage Defaults…
```

Selecting `Crew Auto` while unchecked opens its configuration modal first. The checkmark appears only after a configuration is committed. Cancelling the modal leaves Crew Auto unchecked and changes nothing. Unchecking Crew Auto disables automatic admission and retains the stored configuration for the next enable.

Crew Auto criteria may include independent subsystems, specialization fit, useful parallelism, a Plan recommendation, and a configurable complexity threshold. Crew Auto cannot widen authority beyond the parent ceiling, cannot raise the configured member cap, and cannot override an explicitly selected single-agent route. When criteria are not met, no Crew is created, no card appears, and no Usage is attributed; an unmet-criteria evaluation is not a failed run.

### 5.4 Build With Crew

`Build With Crew` on a Plan card binds a Crew run to the exact Plan version and hash and to the current To-Do set for that Plan. The binding is recorded on the run as `assistant_plan_id` and `plan_version`. Plan identity, Plan version, Build control states, and To-Do identity remain owned by `Plans/Assistant_Plan_Runtime.md` and `Plans/ToDo_Runtime.md`; Crew consumes them by reference and reports work outcomes back through the To-Do work-binding contract. A Plan revision after a Crew build has started requires stopping current execution under the Plan owner's rules; approved source cannot mutate beneath running Crew work.

### 5.5 Orchestrator boundary

Crew never duplicates orchestrator topology. Child spawn, supervision, timeout propagation, cancellation, lineage fields, retry identity, worktree allocation, and the crew message board schema, routing, priority, rate limiting, orchestrator visibility, and parent mediation remain owned by `Plans/orchestrator-subagent-integration.md`. Crew never introduces Goal phases, Goal tranches, child Goals, or a Goal-owned workflow budget; those models are retired. Crew never becomes a second scheduler, a second lane pool, or a second permission clamp. Provider-coupling rules that constrain a whole crew to one provider are orchestrator-owned; Crew discloses the resulting requested-versus-effective assignment but does not define the coupling rule.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Permissions_System.md

## 6. Chat Room

### 6.1 Purpose

Chat Room is a persistent multi-agent conversation used for debate, diagnosis, brainstorming discussion, question exploration, and multi-perspective analysis. It produces transcript, optional synthesis, and optional artifacts. It does not delegate execution, does not mutate the project, and does not automatically create To-Dos, Plans, or Goals.

### 6.2 Configuration

The Chat Room modal configures topic and room name; participants with model, account, and Persona per participant; moderator; turn policy closed to `moderated | round_robin | free_discussion | ask_everyone_once`; mention and reply behavior; tool policy; shared context and attachments; maximum rounds or stop condition; synthesis, vote, and unresolved-opinion output; and time and cost limits.

### 6.3 Turn policy and interaction

Turn policy is deterministic and replayable. `moderated` routes each turn through the configured moderator. `round_robin` cycles participants in configured order. `free_discussion` admits participants under the concurrency limit with recorded admission order. `ask_everyone_once` asks each participant exactly once and then stops. `Next Round` advances one round under the active policy and never silently changes the policy.

The user interacts through `Ask Everyone`, addressing selected participants, `@mention` of a participant, reply or thread where the policy supports it, adding or removing a participant through controlled reconfiguration, `Next Round`, `Pause`, `Resume`, `Cancel`, and `Summarize Now`. User messages reach the room through the ordinary targeted composer and are delivered to the addressed participants exactly once. Reconfiguration that adds or removes a participant bumps the definition revision and is recorded in the transcript as a `system` message; it never rewrites prior transcript attribution.

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

If the target changes after freeze, the existing review becomes stale. The user may finish the stale review with an explicit staleness disclosure, restart against a new freeze, or create a new review. Reviews taken against different `target_hashes` can never be silently merged, and a single `ReviewFinding` can never aggregate reviewer votes drawn from differing target hashes.

### 7.3 Single Agent

Single Agent Review creates one fresh-context reviewer with the selected model, account, and Persona against the frozen target pack. The modal selects model, Persona, target, included evidence, and review focus, and discloses the fresh-context boundary. Single Agent produces the same Review artifact contract as Multi-Pass with a single reviewer identity and no corroboration round.

### 7.4 Multi-Pass Review

Multi-Pass Review supports 1 to 8 reviewers with a default of 3. The same model may be selected for more than one reviewer slot; each slot still receives a unique attempt identity and an independent isolated session, and two slots on the same model are never collapsed. The modal configures target selector, strategy, reviewer count, per-reviewer model and Persona, fresh-context disclosure, inclusion of Plan, diff, artifacts, tests, and constraints, focus areas, and the coordinator or adjudicator.

All initial passes are admitted concurrently and run blind against the same frozen pack. A reviewer's initial prompt and context contain no other reviewer's findings, partial output, or identity. Sequential contamination, where a later pass sees an earlier pass, is a defect.

### 7.5 Normalization, corroboration, and adjudication

After the initial passes complete, findings are structured and normalized for likely duplicates. Normalization groups candidate findings under a `finding_key` without losing any originating reviewer identity or evidence reference; the origin set is preserved on `originating_reviewer_ids` and every original evidence ref is retained.

Reviewers then receive the normalized candidate findings — not necessarily the full reports, which limits anchoring and context cost — and mark each with a disposition drawn from `confirmed | rejected | duplicate | uncertain`, together with evidence and confidence. Review severity, closed to `critical | major | minor | suggestion`, is a separate axis from disposition; a confirmed finding may be minor and a rejected finding may have been proposed as critical.

The coordinator or adjudicator produces the final disposition per finding and preserves unresolved material disagreement as recorded dissent. Manufacturing consensus by discarding a dissenting reviewer is forbidden. Vote counts inform adjudication; they do not replace reasoning, and a finding supported by evidence is not dismissed for being in the minority.

### 7.6 Output and follow-on actions

Review produces one versioned Review artifact rendered in Rich Text with a Markdown toggle, from the same version, containing target identity and hash, configuration and reviewer identities, executive result, confirmed findings, rejected and duplicate findings, uncertain findings, the agreement matrix and dissent, evidence, and suggested next actions. The artifact is read-only. A concise summary appears in the thread and links the artifact and the card.

Review never automatically repairs the target, never edits files, and never starts remediation on its own. Follow-on actions are explicit: `Send Findings To Agent`, `Create To-Dos`, `Run Another Review`, `Export`, and `Open Panel`. `Create To-Dos` converts selected confirmed findings into bounded To-Do items through the To-Do owner with lineage back to the finding. The `assistant.multi_agent.review.auto_repair` setting is locked off for this feature and is not a user-reachable escape hatch.

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

BrainStorm runs seven ordered phases on one `CollaborativeRun`:

1. **Intake and frontier.** Establish constraints, gather research facts, and ask the unresolved user decisions that the shared question bank admits.
2. **Blind proposals.** Each core participant produces an independent proposal in a fresh context. No participant sees another participant's proposal, partial output, or identity before submitting its own. Proposal cross-contamination is a defect.
3. **Normalize.** Each proposal is normalized into approach, assumptions, benefits, costs, risks, migrations, cross-system effects, validation, and rollback, with evidence refs and the proposal round.
4. **Debate.** Participants challenge assumptions, expose conflicts and dependencies, propose hybrids, and request targeted research. Debate rounds default to two and are configurable.
5. **Evidence round.** Factual disagreements are resolved with bounded research rather than assertion. Research assignments are distinct per participant and cite sources.
6. **Vote.** Each participant records `position` closed to `support | oppose | abstain`, plus confidence, reason, evidence refs, and any hard-constraint conflicts it has identified.
7. **Synthesis.** The coordinator selects the best option or a justified hybrid, preserves material dissent, explains rejected alternatives, and produces the standardized Deep Plan content and ledger input.

### 8.6 Voting and hard constraints

A hard user-constraint violation disqualifies an option regardless of vote count. A disqualified option is recorded with the exact constraint it violates and remains visible in the rejected-alternatives section; it is never silently dropped and never revived by a majority. Voting informs synthesis and is not a simplistic majority replacement for reasoning: the synthesis states why the selected approach won, including cases where a minority position carried better evidence.

Dissent that remains unresolved after the evidence round is preserved verbatim in the synthesis, with the dissenting participant identity, its position, its confidence, and its evidence. A synthesis that reports unanimity where dissent was recorded is a defect.

### 8.7 Plan handoff and card linkage

When synthesis completes, BrainStorm requests Plan creation through `cmd.brainstorm.synthesize_plan`, which returns the Plan owner's create result. The Plan card is created immediately after, or closely linked to, the BrainStorm card, and `Open Plan` routes to it. The BrainStorm process card remains in the transcript after the Plan exists, retains its full transcript, participants, proposals, votes, and dissent, and continues to open its panel. Replacing the BrainStorm card with the Plan card is a defect.

BrainStorm never claims child-Goal authority. Older BrainStorm canon that modeled the run as a child-Goal topology is retired; BrainStorm state is `CollaborativeRun` state, and a Goal may drive a BrainStorm by reference without absorbing its records.

## 9. Wonderer and Grill Me participant roles

### 9.1 Boundary

Wonderer is a built-in Persona plus a reusable built-in methodology Skill. Grill Me is a reusable methodology Skill applied through a dedicated participant role. Persona identity, storage, schema, and selection are owned by `Plans/Personas.md`; Skill identity, discovery, `SKILL.md` format, and bounded materialization are owned by `Plans/Skills_System.md`. This document owns only the participant-role semantics of Wonderer and Grill Me inside Crew, BrainStorm, and Chat Room, and it references the Persona and Skill owners for everything else.

Neither role is implemented as an external profile subsystem. There is no profile home, no profile configuration file, and no parallel profile registry. `additive_role_kind` on `ParticipantSpec`, closed to `none | wonderer | grill_me`, is the only workflow-side marker.

### 9.2 Wonderer role semantics

A Wonderer participant explores adjacent domains, precedents, inversions, contradictions, scale boundaries, hidden dependencies, and human factors around the seed topic. It selects a few promising exploration dimensions rather than browsing randomly, and it produces roughly three to five useful connected leads. Every lead states its connection back to the seed topic; a lead that cannot articulate that connection is drift and is dropped.

Wonderer output is labeled as hypothesis until researched. A Wonderer lead never becomes an accepted fact, a Plan decision, or an acceptance criterion without research, evidence, or an explicit user decision. Wonderer participates in debate and may hand leads to the evidence round; when its leads were not substantiated it should abstain from the final vote rather than voting on unsupported ground.

### 9.3 Grill Me role semantics

A Grill Me participant maps decision dependencies as a frontier: the set of decisions whose prerequisites are already settled. It asks the whole current frontier in one round, gives a recommended answer for each question, and waits before recomputing the frontier for the next round. A question whose answer depends on another question still open in the current round belongs to a later round.

Grill Me routes answerable factual questions to research agents instead of asking the user; finding facts is the workflow's job and deciding is the user's. Accepted answers are captured in the active Plan, PRD, or Wizard state through those owners. Grill Me has no implementation authority: it cannot mutate the target project, cannot start execution, and cannot approve anything.

Grill Me is what raises the effective question maximum. It uses the same shared question bank as every other participant, so enabling it adds allowance without adding duplicate questions, and per-agent duplicate inflation is impossible by construction.

### 9.4 Placement

Wonderer and Grill Me appear as additive checkboxes in the BrainStorm, Crew, and Chat Room configuration modals under `Add specialists`. Selecting either adds a dedicated participant row and never overwrites or repurposes a core row. The Deep Plan submenu footer carries a persistent `Grill Me` check option that applies to the next Deep Plan invocation and visually matches the existing auxiliary-row pattern without being confused with model effort.

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
| `cmd.collaboration.message` | domain_action | `CollaborationMessageRequest` / `CollaborationMessageResult` | Delivers one user message to the run or to addressed participants exactly once, writes one durable message referenced by both the thread and the collaboration transcript, and revalidates destination `state_generation` before dispatch. |
| `cmd.collaboration.open` | navigation_wrapper | `CollaborationOpenRequest` / `CollaborationOpenResult` | Navigation only. Opens the card, panel, or Activity Detail. Cannot start, pause, resume, or mutate a run, and route success is not run success. |
| `cmd.collaboration.participant.open` | navigation_wrapper | `CollaborationParticipantOpenRequest` / `CollaborationParticipantOpenResult` | Navigation only. Opens the exact participant transcript with requested/effective identity, assignment, tools, artifacts, Usage, and state. An empty participant returns a truthful empty transcript. |
| `cmd.collaboration.export` | domain_action | `CollaborationExportRequest` / `CollaborationExportResult` | Exports the referenced transcript or artifact version and hash through the artifact and file owners. Never re-renders or re-generates content as part of export. |
| `cmd.collaboration.reconfigure` | domain_action | `CollaborationReconfigureRequest` / `CollaborationReconfigureResult` | Bumps the definition revision under an expected-revision check, records a `system` transcript entry, and never rewrites prior transcript attribution or widens the permission ceiling. |
| `cmd.brainstorm.next_round` | domain_action | `BrainstormRoundRequest` / `BrainstormRoundResult` | Advances exactly one protocol round under the configured debate policy. Cannot skip the blind-proposal phase and cannot exceed configured debate rounds. |
| `cmd.brainstorm.synthesize_plan` | domain_action | `BrainstormSynthesisRequest` / `AssistantPlanCreateResult` | Requests Plan creation from the Plan owner and returns that owner's create result. Creates exactly one Plan, preserves dissent and rejected alternatives in the synthesis, and leaves the BrainStorm card in place. |
| `cmd.review.create_todos` | domain_action | `ReviewCreateTodosRequest` / `ReviewCreateTodosResult` | Converts explicitly selected confirmed findings into bounded To-Do items through the To-Do owner with lineage back to each `finding_id`. Never converts rejected, duplicate, or uncertain findings implicitly. |
| `cmd.review.send_findings_to_agent` | domain_action | `ReviewSendFindingsRequest` / `CollaborationMessageResult` | Sends selected findings to the agent as an explicit message. Performs no repair, no file mutation, and no automatic follow-on run. |
| `cmd.review.run_again` | domain_action | `ReviewRunAgainRequest` / `CollaborationStartResult` | Starts a new review run against a newly frozen target pack. Never merges results into the prior run and never reuses a stale `ReviewTargetPack`. |
| `cmd.chat_room.next_round` | domain_action | `ChatRoomRoundRequest` / `ChatRoomRoundResult` | Advances exactly one round under the active turn policy without changing that policy. Returns the deterministic participant order used. |
| `cmd.chat_room.summarize` | domain_action | `ChatRoomSummarizeRequest` / `ArtifactResult` | Produces a synthesis artifact through the artifact owner. Creates no To-Do, Plan, or Goal and does not end the room. |
| `cmd.chat_room.promote_to_plan` | domain_action | `ChatRoomPromotePlanRequest` / `ChatRoomPromotePlanResult` | Explicit promotion only. Routes to the Plan owner with source lineage to run, message, and participant. The Plan owner admits or rejects; promotion never bypasses its rules. |
| `cmd.chat_room.promote_to_todo` | domain_action | `ChatRoomPromoteTodoRequest` / `ChatRoomPromoteTodoResult` | Explicit promotion only. Routes to the To-Do owner with source lineage. Never mutates the thread To-Do list directly. |
| `cmd.chat_room.promote_to_goal` | domain_action | `ChatRoomPromoteGoalRequest` / `ChatRoomPromoteGoalResult` | Explicit promotion only. Routes to the Goal owner with source lineage and its approval rules. Never edits Goal text directly. |
| `cmd.chat.crew_auto.set` | domain_action | `CrewAutoSetRequest` / `CrewAutoSetResult` | Sets the Crew Auto check state. Enabling requires a committed Crew Auto configuration; without one the result is `configuration_required` and the check does not appear. Cannot widen authority. |
| `cmd.chat.crew_auto.open_config` | shell_view | `CrewAutoConfigRoute` / `RouteResult` | Opens the Crew Auto configuration modal. Route success is not enablement; the check state changes only through `cmd.chat.crew_auto.set`. |

Source surfaces for the ten `cmd.collaboration.*` rows are `workflow_modal`, `workflow_card`, `workflow_panel`, `activity`, and `composer`. `cmd.brainstorm.*` surfaces are `brainstorm_card` and `brainstorm_panel`; `cmd.review.*` surfaces are `review_card` and `review_panel`; `cmd.chat_room.*` surfaces are `chat_room_card` and `chat_room_panel`; `cmd.chat.crew_auto.set` surfaces are `multi_agent_menu` and `crew_auto_modal`; `cmd.chat.crew_auto.open_config` surfaces are `multi_agent_menu` only.

## 11. Typed requests, results, errors, and availability

Every collaborative mutation request reuses the central command and runtime envelopes and carries, as applicable, `schema_id`, `schema_version`, `command_id`, `command_instance_id`, `project_id`, `thread_id`, `object_id`, `expected_revision`, `expected_currentness_hash`, `actor_identity`, `permission_snapshot_id`, `idempotency_key`, `source_surface`, `correlation_id`, `causation_id`, and `created_at`.

Every collaborative mutation result carries `status`, `committed`, the revision and currentness after the mutation, receipt refs, an `observable_work` ref when the work is asynchronous, an error or reason enum when not committed, and `replay_of` when the result is an idempotent replay. A UI acknowledgement is never domain success, and a rendered card is never proof that a run was admitted.

The typed error enumeration for this owner is `invalid_request`, `project_not_found`, `thread_not_found`, `collaboration_not_found`, `collaboration_run_not_found`, `participant_not_found`, `stale_definition_revision`, `stale_currentness`, `configuration_required`, `configuration_not_committed`, `duplicate_id_conflict`, `command_not_registered`, `permission_denied`, `permission_ceiling_exceeded`, `model_unavailable`, `persona_unavailable`, `account_unavailable`, `substitution_not_permitted`, `concurrency_ceiling_exceeded`, `target_pack_stale`, `target_hash_mismatch`, `question_limit_reached`, `provisioning_approval_required`, `read_only_violation`, `destination_generation_stale`, `destination_target_ended`, `run_state_invalid`, `owner_unavailable`, or `cancelled`. A failure remains a failure: it never advances run state, never emits a success-shaped receipt, and never produces a card that implies work occurred.

Availability payloads name the exact missing prerequisite — central catalog registration, Event Authority registration, native handler, storage binding, provider or model availability, permission decision, or production wiring row — rather than reporting a generic disabled state. `target_hash_mismatch` and `target_pack_stale` are always distinguishable so the Review surface can offer finish-stale, restart, or new-review without guessing.

## 12. Records, schemas, and data shapes

This document is the semantic owner of the following record families. Physical key encoding, seglog and index behavior, encryption, retention, and transaction implementation remain owned by `Plans/storage-plan.md` and the shared contracts.

| Schema ID | Record | Ownership note |
|---|---|---|
| `pm.collaboration.definition.v1` | `CollaborativeDefinition` | Owned here. Carries `collaboration_id`, `kind`, `project_id`, `thread_id`, `name`, `purpose`, `revision`, `participant_specs`, `coordinator_spec`, `context_policy_ref`, `tool_policy_ref`, `permission_ceiling_ref`, `concurrency`, `time_limit_seconds`, `token_limit`, `cost_limit`, `transcript_policy`, `output_policy`. |
| `pm.collaboration.participant_spec.v1` | `ParticipantSpec` | Owned here. Carries `participant_slot_id`, `role`, `requested_provider_id`, `requested_account_id`, `requested_model_id`, `requested_persona_id`, `requested_skill_ids`, `requested_tool_profile_id`, `additive_role_kind`. Effective values live in the runtime assignment record with a substitution or failure reason. |
| `pm.collaboration.run.v1` | `CollaborativeRun` | Owned here. Carries `collaboration_run_id`, `collaboration_id`, `definition_revision`, `kind`, `parent_run_id`, `assistant_plan_id`, `plan_version`, `goal_id`, `state`, `participant_run_refs`, `coordinator_run_ref`, `transcript_ref`, `artifact_refs`, `usage_group_ref`, `requested_effective_snapshot_ref`, `created_at`, `completed_at`. |
| `pm.collaboration.message.v1` | `CollaborationMessage` | Owned here. Carries `collaboration_message_id`, `collaboration_run_id`, `sender_kind`, `sender_id`, `recipient_ids`, `message_type`, `body_ref`, `reply_to`, `attachment_refs`, `created_at`, `sequence`. |
| `pm.brainstorm.question_bank.v1` | `QuestionBank` | Owned here. Carries `brainstorm_run_id`, `baseline_limit`, `grill_extension`, `effective_limit`, `asked_question_ids`, `resolved_question_ids`, `duplicate_question_ids`, `research_routed_question_ids`. |
| `pm.brainstorm.proposal.v1` | `BrainstormProposal` | Owned here. Carries `proposal_id`, `participant_id`, `approach`, `assumptions`, `benefits`, `costs`, `risks`, `migrations`, `cross_system_effects`, `validation`, `rollback`, `evidence_refs`, `proposal_round`. |
| `pm.brainstorm.vote.v1` | `BrainstormVote` | Owned here. Carries `vote_id`, `proposal_id`, `participant_id`, `position`, `confidence`, `reason`, `evidence_refs`, `hard_constraint_conflicts`. |
| `pm.review.target_pack.v1` | `ReviewTargetPack` | Owned here. Carries `review_run_id`, `target_kind`, `target_refs`, `target_hashes`, `user_constraint_refs`, `acceptance_refs`, `test_build_evidence_refs`, `frozen_at`. |
| `pm.review.finding.v1` | `ReviewFinding` | Owned here. Carries `finding_id`, `review_run_id`, `finding_key`, `category`, `severity`, `claim`, `affected_object_refs`, `evidence_refs`, `originating_reviewer_ids`, `reviewer_votes`, `disposition`, `confidence`, `dissent`, `proposed_remediation`. A finding never aggregates votes drawn from differing target hashes. |
| `pm.chat.composer_destination.v1` | `ComposerDestination` | Consumed, not owned. The Chat and storage owners own the buffer and destination record; this document owns the collaborative `destination_kind` values, the revalidation rule, and the destination edge cases. |
| `pm.research.capability_provisioning.v1` | `ResearchCapabilityProvisioningOperation` | Consumed, not owned. `Plans/Shared_Integration_Runtime.md` owns the provisioning lifecycle; this document owns when a BrainStorm run may request it and what the run must disclose. |

The closed enumerations owned here are `kind` (`crew | brainstorm | review | chat_room`), run `state` (`configuring | running | paused | waiting | blocked | completed | cancelled | failed`), `sender_kind` (`user | participant | coordinator | system`), `message_type` (`message | request | response | warning | conflict | dependency | handoff | vote | finding | pass`), `additive_role_kind` (`none | wonderer | grill_me`), Crew `assignment_strategy` (`manager_directed | explicit_static | adaptive`), Chat Room `turn_policy` (`moderated | round_robin | free_discussion | ask_everyone_once`), Review `target_kind` (`assistant_response | agent_run | plan | changes | artifacts | task_result`), Review `disposition` (`confirmed | rejected | duplicate | uncertain`), Review `severity` (`critical | major | minor | suggestion`), and BrainStorm vote `position` (`support | oppose | abstain`).

Schema and fixture closure for these records requires a dedicated contracts schema and fixture pair registered through the central contracts process. Until that registration exists, no writer may persist these records and no surface may claim persistence proof.

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
- **Requested identity is unavailable.** The requested model, account, or Persona is recorded, the effective one is recorded, and the difference is visible on the participant row and in the panel. There is no silent substitution. Where no acceptable substitute exists the participant is disabled with its reason rather than being run on an arbitrary model.
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

**Crew as an On/Off switch.** That model is retired. A legacy Crew boolean migrates to a `crew` definition with the default participant count, coordinator, assignment strategy, and parallelism drawn from Settings at migration time, and `auto_enabled` set to the legacy boolean's value. Enabling Crew Auto still requires a committed configuration before a run may start.

Migration receipts record converted runs, unrecoverable state, synthesized defaults, and residual risk. A run whose thread or Project edge cannot validate quarantines rather than being attached to a guess.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## 18. Verification

Structural tests validate every record schema and fixture, the closed four-value kind enum, the participant requested-versus-effective fields, the frozen-roster invariant, and the absence of four parallel stores — one shared code path and one shared contract must be provably reused by all four kinds.

Behavioral tests must prove that each kind opens its configuration modal populated from Settings defaults; that a changed Settings default does not retroactively alter a committed definition or a running run; that per-participant model and Persona selection applies and that repeated model choices are permitted; that clicking a participant opens that participant's own transcript; that a card expands inline and pops out to a full panel showing the same run; that `Message` targets the ordinary composer with visibly changed chrome naming the destination; and that the target ribbon and participant transcripts survive a restart.

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
  Crew is a configurable workflow, not an On/Off switch. Its configuration covers coordinator, roles, per-participant models and Personas, tools, context, expected outputs, and dependencies, and Crew remains distinct from Subagents. Crew Auto is a checkable Multi-Agent submenu item whose enabling opens configuration; it cannot start a run without a committed configuration and cannot widen the permission ceiling or the authority any participant already has. Build With Crew runs an exact Assistant Plan revision through a configured Crew rather than the single-agent build path, and the crew configuration is part of the build target rather than part of any schedule. Crew is not Orchestrator and must not be modelled as child-goal orchestration.
gui_related: true
gui_classification_reason: This defines the Crew modal, the checkable Crew Auto menu item, and the Build With Crew action.
depends_on: [CWR-002]
unblocks: []
acceptance_criteria:
  - Crew Auto cannot start without a committed configuration.
  - Crew Auto cannot widen authority or the permission ceiling.
  - Crew remains distinct from Subagents and from Orchestrator.
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
preserved_exact_tokens:
  - "Crew Auto"
  - "Build With Crew"
negative_constraints:
  - Do not model Crew as an On/Off switch.
  - Do not let Crew Auto start without committed configuration.
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
enabled state; optimistic enabling before commit is prohibited.

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
open; the user reopens the modal against the new version.

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
visual toggle.

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
actions and coordinator identity never mutates invisibly.

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
  output_status, quorum_status, attention_reason
```

Cancel fences every participant attempt and synthesis callback. Later results may be retained as
rejected or stale evidence but cannot alter the current run; no card or status mutates after
cancel, however useful a late result appears.

### PART-021..024 — Availability, independence, and constrained providers

A model unavailable **before** Start blocks Start or requires explicit replacement in the modal.
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
