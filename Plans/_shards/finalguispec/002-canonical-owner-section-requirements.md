# Shard 002: Canonical owner-section requirements

Source: `Plans/FinalGUISpec.md`

Source lines: L4-L136

Source SHA256: `72257af72eac43272b9727adffdac3668a6f5bbdd67a43d2a1eb36df9c6c9ac3`

---

## Canonical owner-section requirements


These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Concern record family definition


### Concern routing and object-first search behavior

Global search labels distinguish `Search in this tab` from `Search Orchestrator`: the former is local tab filtering, while the latter is object-first, cross-tab, and route-aware so concern, evidence, history, ledger, and graph results land on the canonical object route rather than a page-local text match.

The active split names `Orchestrator search` as object-first, run-aware, cross-tab routing and `tab-local search` as local `/filtering` within the active tab or `/view`.


### Concern action policy and authority model
- Concern surfaces map `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` views onto concern-linked `/evidence`, `/package` rollups, exact source references, `/split/supersession`, and acknowledgment `/dismissal` rationale instead of flattening concern history into one summary row.
- Concern record surfaces expose a canonical record schema with `/routing`, `/blocked/remediation`, `/corroboration/graph`, `/recovery`, and relationship links to reviews and graph patches; structural actions use `/split/supersession` instead of local free-text history.
- Concern lineage transitions use `merge`, `split`, and `superseded`; when one concern is reframed into several precise concerns, the original resolves with `resolution_kind = split` and retained lineage refs rather than being overwritten.
- Concern updates append new `/evidence` and can raise `/attention`; two duplicate concerns merge into one retained id and `/redirect` the `merged-away` ids, while an older framing replaced by a `/newer` concern is `resolved` with `resolution_kind = superseded`.
- Object-specific context menus show only operational actions valid for the current object state and use canonical labels from runtime semantics; mutation actions never appear because a generic shell menu has a matching verb.
- Structural concern actions such as `merge`, `split`, and `supersede` use guided flows instead of one-click menus because they change `/history/ledger` interpretation and lineage, not only presentation state.
### Projection trust and action gating

Projection-backed surfaces display `projection_freshness` and `projection_health` as the runtime trust grammar. Preview/browser `/UI` keeps `trust_tier` under `/browser`; runtime `/degraded` copy never reuses `trust_tier` as degraded trust. Artifact provenance `/trust` disclosure derives from persisted receipts and canonical refs, so reports remain inspectable after the live worktree or provider session is gone. `projection-backed` panels expose `trust state` and `last updated` as first-class UI fields.

Shared attention labels include `Waiting on user approval`, `Seam integration blocked`, `Graph patch required`, `Recovery in progress`, `Provider/account pressure`, and `Projection trust degraded`; each label carries owner route, projection state, and `/account` or provider context when relevant instead of acting as free-text status.

Projection-backed surfaces use `freshness_state` values `current`, `refreshing`, `stale`, `degraded`, and `unavailable`; `/current` projections may allow normal read/write interaction, while `stale` or `/degraded` surfaces narrow mutation-bearing actions, disable them, or require direct canonical/current revalidation before execution.

Visible projection trust grammar includes `last_updated_at`, `data_source_kind`, `degraded_reason`, and `action_gate_reason` so operators can see whether a blocked or disabled action comes from freshness, source quality, or an authoritative runtime gate.


### Progress-only widget hostability
- `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) six-tab `Tiers` carry-through is stale and predates the canonical Plan Compile tab: widget-based tabs `1, 2, 4, 5, 6`, `widget.tier_tree`, `widget.current_task`, `widget.progress_bars`, `tier_id`, `request_id`, `requested_persona_id`, `effective_persona_id`, `provider`, `model`, and `PuppetMasterEvent` / `PuppetMasterEvent::TierChanged` / `PuppetMasterEvent::UserInteractionRequired` / `TierChanged` / `UserInteractionRequired` inputs are compatibility signals, while new live-state UI uses native Orchestrator surfaces, the seven-tab shell, and explicit `HITL` runtime objects.
- `Plans/Widget_System.md` (`/Widget_System.md`) tier-centric `Orch/Tiers` and `/Tiers` entries, `widget.agent_terminal`, `widget.completed_prose`, `widget.tier_tree`, older `TierChanged` / `IterationStart` pushes, and `/task/subtask`-oriented `widget.current_task` remain compatibility vocabulary; only `Progress` is widget-hosted in the current Orchestrator model.
- Legacy `GUI` inventory entries such as `/current-task`, `7.7 Tiers`, tier-oriented Settings, `Orchestrator tabs`, `wizard_attention_required`, `resume_url`, and phase-task-subtask progress bars stay searchable compatibility copy, but primary navigation moves to native graph/package/lane/seam surfaces rather than treating `Tiers` as canonical.
- Legacy Progress widget catalog fields such as `widget.current_task`, `widget.progress_bars`, `widget.cta_stack`, `widget.agent_terminal`, and `widget.completed_prose` plus `PuppetMasterEvent`, `PuppetMasterEvent::UserInteractionRequired`, `UserInteractionRequired`, `tier_id`, `/tasks`, `/task/subtask`, and `/objective/elapsed` are compatibility inputs only; native Orchestrator views own live progress display.
- `Plans/Widget_System.md` / `/Widget_System.md` migrates `dashboard_layout:v1` to `widget_layout:v1:dashboard`; `widget_layout` is the active layout family while `dashboard_layout` and `dashboard_layout:v1` remain backup/migration names.
- `Widget_System` / `Widget_System.md` keeps `/Tiers`, `Orch/Tiers`, `Orch/Evidence`, `Orch/History`, `Orch/Ledger`, `/Evidence`, `/History`, and `/Ledger` as legacy widget-composed catalog aliases only; only `Progress` remains widget-composed in native Orchestrator.
- Widget persistence scope is explicit: `dashboard` layout may stay app-global, `orchestrator:progress` is project-scoped or app-default plus project override, and `usage` declares app-wide versus project-scoped mode rather than silently reusing one layout.
- `Orchestrator_Page` / `Orchestrator_Page.md` Progress widgets that still center active-tier or tier-targeted terminal semantics are legacy inputs; `widget.agent_terminal`, `widget.completed_prose`, `widget.current_task`, `widget.progress_bars`, `/task/subtask`, and `/objective/platform/model` resolve through native Progress and runtime views.
- The widget layout migration has one explicit persistence-rule: active layout state writes through `widget_layout`, while retired layout keys are read-only migration backups.
- FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling.
### Shared escalation ladder

Blocked-notice consumers keep `## Unified Thread Blocked-State Lifecycle`, `### Multi-episode display`, and `### 7.3 Shared route and open behavior` as owner-anchor / owner-heading carry-through, but `gap-002`, `exact_items`, `stale-survivor`, and `GUI` cleanup must expose `blocked_sequence`, `approval_scope_key`, `report_ref`, `startup_recovered`, `action_available`, and `escalation_level` instead of leaving those fields in a skeletal blocked-notice flow.

`Plans/Run_Graph_View.md` (`/Run_Graph_View.md`) `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` actions use `blocked_sequence` and ordered `allowed_action_ids[]`; legacy `hitl_request_id` is compatibility display metadata, not a second `HITL` approval identity.

`Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`) graph HITL command examples with `{ request_id, node_id, rationale }` and `{ request_id, node_id, rationale, resolution? }` map to the same runtime approval identity; `request_id` and `node_id` are routing/lineage args, not a replacement for `blocked_sequence`.


### Action-surface policy
- Bulk live actions such as `/remove`, `/recovery`, archive/prune, or worktree cleanup choose `light`, `strong`, or `hard_gate` confirmation based on blocked/recovery lineage and target preview; destructive `remove` defaults to `strong`, and blocked-lineage recovery can escalate to `hard_gate`.
- A `hard_gate` confirmation must show runtime-defined allowed actions, why the gate exists, the exact consequence of each allowed action, and no hidden alternative path.
- Runtime mutation and `/recovery` surfaces require `/schema/gate` preconditions for `allowed_action_ids`, `allowed_action_ids[]`, freshness `/trust`, account capability, and `/runtime` capability before the GUI exposes mutation controls.
- Bulk actions default to navigation, triage, and low-risk state updates; live execution mutations stay narrow unless the runtime exposes an explicit safe batch semantic for that exact action.
- Stale visibility is not action authority: when projection trust drops, `/recovery` controls and `allowed_action_ids[]` may become invalid, and destructive or topology-changing actions require stronger gating rather than ordinary undo.
- `Plans/Tools.md` (`/Tools.md`) DAE tool-event reconstruction requires richer event payloads and reconciled outcome taxonomy before GUI surfaces can replay DAE tool-event history as authoritative runtime state.
### Glossary and help governance
- The canonical term system owns stable object `/state/action` names from docs and `/runtime/contracts`; the help entry system owns explainer pages or `/cards`; the contextual help system owns inline tooltips, badges, hover copy, and small "what is this?" affordances.
### Notification routing policy

Notification and attention copy use the shared state/action label set: `alert-level`, `event-family`, backbone event, `/action`, and condition-aging taxonomy terms are routed through `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`), and `Plans/Glossary.md` (`/Glossary.md`) rather than ad hoc local labels.

Alert-state semantics remain explicit across Dashboard and attention-surface copy for `attention_required` and `blocked` states: `resolved` means the underlying condition changed; `dismissed` or `/acknowledged` only hides or confirms presentation while the condition may still exist, and active blockers must never appear unblocked through dismissal alone.

Local attention surfaces normalize through the shared notification model: Dashboard `Action Required`, thread badges, run-graph `/node` badges, warnings `/toasts/banners`, tray `/system` notifications, rate-limit banners, and blocked versus attention-required copy all preserve severity, source, and owner route instead of inventing local alert state.

Tab badges stay sparse and purposeful: the `Progress` badge represents meaningful `/action-required` count, while other tabs prefer targeted counts or simple dot-badges rather than noisy unread-like counters.


### Canonical route payload

Route payloads may target `source_control`, `github_actions`, `docker_manager`, or `document_pane`; panel-local subviews and `/selectors` refine the landing inside that destination, and remembered state supplies defaults only when the route does not override them.

Object-first deep-link recipes normalize `/message`, scheduler `/blocking/safe-point/remediation/attempt`, and `/package/lane/worktree/concern/promotion/graph` lineage through one route shape; `Plans/assistant-chat-design.md`, `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/WorktreeGitImprovement.md` consume the same object-first routing instead of inventing an SCM-local navigation identity.

`Contracts_V0` / `Contracts_V0.md` owns the canonical route payload and target model, including the `object_kind` enum; `Glossary.md` carries the user-facing `object_kind` vocabulary so help and downstream copy do not drift.


### Project summary projection


### Project attention projection

`project_summary` is a current-state projection overwritten by projector updates, while `project_attention_item` rows keep active versus resolved `/dismissed/quieted` semantics; when a source record owns durable history, the attention row may remain projection-level but preserves a stable `source_object_ref`.

`Contracts_V0` / `Contracts_V0.md` and `storage-plan` / `storage-plan.md` contradictions are resolved by shared families for `remediation.resolved`, concrete-account display, `/actor` dimensions in effective `/runtime` records, route-payload schema, and project-summary / project-attention projections rather than GUI-local inventions.


### Requested concrete-account fields

Provider dispatch surfaces show a concrete-account request separately from policy: `Prompt_Pipeline.md`, `CLI_Bridged_Providers.md`, `Models_System.md`, and `Prompt_Pipeline`/`Models_System` references must surface `ProviderRequestEnvelope`, `account_switch_reason`, `/account`, `execution-role`, `/model/variant`, role-scoped pool selection, and requested concrete-account intent.

`Plans/Multi-Account.md` / `/Multi-Account.md` binds operational identity and role-scoped pools into the shared runtime grammar, while `Plans/assistant-chat-design.md` / `/assistant-chat-design.md` surfaces thread-level `/account/role` switching and `/trust` disclosure without minting chat-local account truth.

Operational identities may display provider/account identity and `/account` source metadata, but the GUI must not imply shared token ownership across accounts, providers, or execution roles.

Requested-account event-schema precision is a visible GUI contract: identity projections expose account fields, requested concrete-account truth, role `/actor` identity, operational identity, switch-history, and trust-state anywhere a user-facing GUI surface claims to show runtime truth.

`Plans/Prompt_Pipeline.md` / `/Prompt_Pipeline.md` locks requested `/effective` identity semantics, including concrete-account intent, while tier-era override ownership is compatibility vocabulary only.


### Execution role and operational identity

Operational identity is distinct from provider-account identity: `Multi-Account.md`, `/registry/Kubernetes`, `/runtime/storage`, and side-effect surfaces expose operational-identity blocks beside provider-account displays rather than collapsing GitHub, registry, or Kubernetes actors into one provider credential.

Orchestrator worker identity rows from `Orchestrator_Page` / `Orchestrator_Page.md` that list `requested_persona_id`, `effective_persona_id`, provider, model, `attempt_id`, or `session_id` must also expose `execution_role` and operational target context before the GUI treats them as complete runtime identity.

`Plans/GitHub_Integration.md` (`/GitHub_Integration.md`) `Worktrees` copy must present lane-backed operational identity instead of centering raw worktree rows when the Source Control surface is showing branch, lane, package, or worktree state.


### Projection freshness vs projection health


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Dismissed vs resolved rationale enforcement
### Blocked-owner eight-kind taxonomy and escalation ladder surfaces


### Recommended minimum concern record shape


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Authoritative specification for AI agent implementation
**Tech Stack:** Rust + Slint 1.15.1 (.slint markup compiled via slint_build)
**Renderer:** Default winit + Skia; fallback winit + FemtoVG-wgpu; emergency software renderer

---
