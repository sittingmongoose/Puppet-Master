# Glossary (Canonical)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Glossary and help governance


### Help entry template and related-concept clusters


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL TERMINOLOGY

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This glossary defines canonical terms used across plan documents.
It exists to prevent drift and synonym creep.

ContractRef: Primitive:Glossary

---

## 1. Canonical platform name
- **Puppet Master** -- the only correct platform name.
- **legacy naming** -- the only allowed way to refer to older platform naming.

ContractRef: Invariant:INV-010

---

## 2. Core terms

### Orchestrator rewrite terms


- **Execution Unit Context** -- the canonical runtime-facing object that names `execution_unit_id`, `execution_unit_type`, parent lineage, and the `execution_role` that owns execution.
- **Concern Record** -- the durable record for a concern lineage, including `concern_id`, `blocked_episode_id`, `blocked_sequence`, escalation frames, and recovery posture.
- **Trust State** -- the runtime trust decision for whether a route, provider, or mutation surface is readable, writable, degraded, or blocked.
- **Degraded State** -- a temporary runtime condition where read-only inspection may continue but write mutations or resumptions remain gated until recovery clears the degraded posture.
- **Inline Help** -- lightweight help rendered directly beside the active control, row, or blocked state without changing the canonical term name.
- **Context Help** -- a resolved help payload scoped to the active concern, execution context, route target, or inspector surface.
- **Canonical Help Entry** -- the durable help record keyed by canonical concern and state terms; inline help and context help both point back to this entry instead of minting new synonyms.
- **Worktree owner node (`owner_node_id`)** -- the orchestration-node lineage field used when a worktree is owned by a run/node rather than by an Assistant thread or manual workspace. Older tier-rooted ownership field names are migration/source-lineage aliases only.

Use these canonical names verbatim in rewrite docs so execution objects, states, trust semantics, and help layers stay stable across Orchestrator, inspectors, and recovery surfaces.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### Runtime and routing terms

Runtime and routing help entries use `help-entry` records with `canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `common_related_states`, `related_concepts`, and `surface_examples`; avoid two-column `Term | Definition` tables for durable glossary ownership. The wave-one `gap-006` and `gap-007` repairs keep `/chat/routing`, `/receipt/usage`, `Plans/Orchestrator_Page.md#11. Source Control boundary`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, `Plans/GitHub_Integration.md`, `Plans/WorktreeGitImprovement.md`, and `Plans/Glossary.md` routed through the live owner docs and their `/storage-plan.md`, `/FinalGUISpec.md`, `/Orchestrator_Page.md`, `/GitHub_Integration.md`, `/WorktreeGitImprovement.md`, and `/Glossary.md` aliases rather than stale broken anchors.

Glossary gap governance records `exact_items` for `gap-001`, `gap-002`, `gap-003`, `gap-004`, `gap-005`, `gap-006`, `gap-007`, and `gap-008`, including missing `5.1B`, `/help/blocked/storage`, `Plans/Glossary.md#Orchestrator rewrite terms`, `Plans/Orchestrator_Page.md#11. Source Control boundary`, `result_id`, `execution_unit_context`, `orchestrator.project_state`, `orchestrator.project_state.{project_id}`, `project_id`, usage-side account history, `/receipt`, `/orchestrator`, and broken-anchor cleanup evidence.

Canonical runtime and provider wording:
- **Requested/effective identity fields** -- runtime identity uses the shared requested/effective vocabulary from the owner contracts. Persona fields are `requested_persona` and `effective_persona`; legacy `_id` substitutes such as `requested_persona_id` and `effective_persona_id` are migration/source-lineage aliases only.
- **Protected core Persona** -- a PM-owned built-in Persona ID from `Plans/Personas.md#RESERVED-PERSONAS`, including `assistant`, `general-purpose`, `overseer`, `bash`, `teacher`, `collaborator`, `researcher`, `deep-researcher`, and `explorer`. Protected core Personas are user-immutable and not deletable; eligibility for chat or child/subagent use is defined by `Plans/Personas.md`. `Document Writer` is legacy/source-lineage wording, not a protected core Persona unless a later owner decision explicitly reopens it.
- **Runtime vocabulary** -- use platform, model, auth, account policy, and effective account for requested/effective runtime state. Do not create duplicate top-level nouns such as `chat_model`; use the owner-owned field, for example `effective_model`.
- **Runtime identity consumers** -- `Plans/storage-plan.md` (`/storage-plan.md`) persists runtime identity fields and `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) displays `/displayed` runtime identity after the core contracts are updated; assistant/chat surfaces consume this owner boundary rather than redefining runtime identity semantics.
- **Provider Layer (`provider-layer`)** -- the web execution layer made of the provider capability registry and adapters. Provider-layer terms describe capability, routing, fallback, and adapter behavior; they must not be conflated with runtime identity terms.
- **Bare command (`bare-command`)** -- a slash-command invocation without a required subcommand or argument. Bare `/web` opens help/autocomplete and performs no default web operation.
- **provider_unavailable** -- a provider-routing state where the selected provider cannot execute the requested operation. The runtime falls back to the next eligible provider in priority order; if no fallback is available, the UI surfaces provider health, auth, and recovery guidance.
- **Raw finding (`raw-finding`)** -- an audit input, not a runtime state. Raw-finding clusters from `Plans/assistant-memory-subsystem.md` (`/assistant-memory-subsystem.md`) may identify delegated-run identity or persistence gaps, but the canonical fix must land in the owner contracts before delegated-run behavior is treated as wired end to end.
- **Browser automation handoff** -- the Debug workflow pause when PM needs user help with auth, CAPTCHA, one-off repro, or a blocked modal flow. PM pauses the live `automation_session`, focuses the exact browser tab and `/step`, moves the investigation to `attention_required`, and resumes only from the paused step pointer or an explicit retry of the current repro step after the user finishes the requested action.
- **Package/lane/worktree attribution** -- canonical attribution treats `/package/lane/worktree` lineage as first-class across `/usage` and `/storage`; `tier_id`, `/grouping`, and canonical-ish runtime-data labels are migration/source-lineage hints until mapped to package, seam, lane, worktree, and execution identity owners.
- **Derived decomposition context (`decomposition_context`)** -- optional derived context may carry human-readable `/titles`, language `/domain/framework`, former tier grouping for help or migration, `subtask-focus` heuristics, and `parent-summary` or `/dependency` prompt conveniences, but it must not override canonical node, package, seam, lane, worktree, or attempt identity.
- **Storage route identity** -- `Plans/storage-plan.md` / `/storage-plan.md` owns `usage_event_ref`, projection freshness, receipt pivots, bridge semantics, and project-scoped UI state naming for runtime/routing help entries.
- **Runtime artifact help** -- `Plans/Runtime_Artifacts_Panel.md` / `/Runtime_Artifacts_Panel.md` consumes `/Ledger`, `/link`, `task_id`, `cost_usage`, and cross-surface receipt linkage; artifact-panel and task-granularity wording are legacy/source-lineage aliases unless a current owner doc keeps them.
- **Orchestrator page help** -- `Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` owns historical mode, worktree partitioning, precise usage behavior, `/deep-link`, and `/acceptance` help entries consumed by runtime/routing glossary terms.
- **Final GUI route copy** -- `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` consumes `route_target` semantics; `resume_url` is not a stronger ad hoc primitive. Stale `Tiers` primary-surface wording is a source-lineage alias for the rewrite Orchestrator tab model, and widget-composition means only `Progress` is widget-composed inside Orchestrator.
- **Assistant chat runtime controls** -- `Plans/assistant-chat-design.md` / `/assistant-chat-design.md` maps resume and `/retry` controls to canonical runtime actions and must not invent thread-local resume paths.
- **Provider/persona orchestration wording** -- prompt, model, provider, and `/persona` docs retire `/task/subtask/iteration` ownership language in favor of runtime records with `node_id`, `attempt_id`, package, seam, lane, and execution identity.
- **Runtime account attempt context** -- `/account/attempt` binds account/runtime disclosure to attempt identity, so usage, worker identity, and per-node wording must resolve to account plus attempt context rather than lagging as worker-only or per-node shorthand.
- **Runtime-era gate and tombstone checks** -- runtime-era `/gate` schemas are machine-verifiable only when preconditions, freshness, mutation risk, deprecation `/tombstone` status, reverse coverage, and dispatcher obligations are explicit.
- **Tier-shaped compatibility** -- `tier` and tier-shaped glossary terms are migration/source-lineage aliases; live owner docs must map them to package, seam, lane, worktree, or Orchestrator tab concepts before consumer docs reconstruct tier-shaped surfaces or payloads.
- **Legacy Orchestrator surface vocabulary** -- consumer docs must not revive stale `tier-era` execution terms, `widget-era` non-`Progress` Orchestrator assumptions, `standalone-surface` page models, non-canonical persona fields, or `tier_type` as a core node UI field. `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` keeps `Tiers` only as source-lineage/page-level compatibility wording for the tab-first Orchestrator rewrite, while `/phase` and tier/phase labels remain derived or `compatibility-only` view context.
- **Widget hostability terms** -- `widget-hostability` and `widget-layout` are compatibility-only vocabulary for non-`Progress` Orchestrator surfaces; `/native` specialized tabs are not widget pages and must not be rebuilt as widget-hosted layouts.
- **Projection-era event vocabulary** -- rewrite migration replaces `TierChanged`, `IterationStart`, and `TierTree` terms with current run summary, current activity projection, attention `/blocker` projection, seam health projection, package activity projection, promotion queue projection, lane `/worktree` projection, `/usage` account-pressure projection, and recent major events projection.
- **Projects page runtime status** -- project list cards expose project name and `/path`, language badges, last-opened data, health indicator, and Orchestrator status values `idle/running/paused`; `/running/paused` is a source-lineage shorthand, not a separate state axis.
- **Provider/account runtime machinery** -- `/account/model/runtime` is shared provider/account/model/runtime machinery; object families keep different lifecycle semantics and UI surfaces while consuming common `/account`, `/builder`, `/effective`, auth-account visibility, and requested/effective runtime identity.
- **Plan/runtime projection split** -- GPT audit notes provide historical transfer context for the rule that plan structure and mutable runtime state stay separate; runtime truth lives in events, JSON sidecars, and `/projection` docs rather than plan-shard prose.
- **Post-rewrite Glossary anchor** -- `Glossary.md` is not a `pre-rewrite` platform-name stub; it anchors `/runtime` and cross-doc meaning for Orchestrator, Source Control, search, history, ledger, and help.
- **Route payload vocabulary** -- route payloads use canonical surface, `/tab/object`, and object terms; generic `page: string` payloads are retired or constrained when they hide non-canonical tab naming.
- **Evidence wrapper alias terms** -- `/wrapper/alias` evidence records route, wrapper, and alias verification failures in a structured machine-readable form so a generic evidence model does not hide whether a wrapper command normalized to the canonical target.
- **Glossary/Crosswalk rewrite routing** -- `Glossary.md` owns short term definitions and `/Crosswalk` owns primitive routing; both must absorb rewrite-era terms before downstream specs continue as append-only, contradictory consumer notes.
- **Crosswalk Orchestrator primitive drift** -- `Crosswalk.md` entries such as `OrchestratorPage` must not keep stale six-tab or `Tiers` primitive text; `Tiers` is compatibility wording and must not conflict with the rewrite tab model.
- **Blocked sequence runtime identity** -- runtime/blocking state uses node, attempt, `/attempt/blocked-sequence`, and `/blocking` identity; storage `tier_id` fields are compatibility aliases until mapped to node/attempt identity.
- **Attempt attribution migration** -- replace `tier-first` aggregation and event anchoring in `/storage/UI`, usage, and storage docs with `/node/lane/package/seam-aware` attempt/node/lane/package/seam-aware attribution; tier terms remain compatibility aliases.
- **Projects registry scope** -- `projects:v1` is project registry only: path, display metadata, detection metadata, `last-opened`, and stable config references. Free-form `health status` wording is sharply narrowed or removed from that registry scope.
- **Assistant chat compatibility drift** -- `assistant-chat-design` / `assistant-chat-design.md` is not broadly stale; remaining drift is local and `compatibility-oriented`.


**Route Target**: A destination for output or side-effects (file://, github://, workspace://, share://, etc.). Resolved through a cascading resolver and permission checks.

**OpenSubject**: A resource or concern being opened/inspected (file, concern, help_entry, project_state, run, artifact_storage). Normalized into a shared routing model so all surfaces handle them uniformly.

**Runtime Identity**: The execution context including requested_account_id, effective_account_id, execution_role, and account_switch_lineage. Persistent across retries and restarts.

**Account Switch Lineage**: The ordered list of account IDs that the execution has switched through, with metadata (switch_reason, switch_time_utc). Used for recovery and auditing.

**Artifact**: An output or byproduct of execution (log, diff, output, input, trace). Indexed by (concern_id, route_target, artifact_type, timestamp) and tied to the execution unit that produced it.

### Shell and workspace terms

**Source Control**: The Git-first repo/worktree surface for local SCM state: changes, history, graph, worktrees, branches/stash, review/compare, conflicts, and worktree-native recovery. Hosted workflow/admin behavior stays under GitHub Actions.

**GitHub Actions**: The GitHub-hosted workflow/admin/runtime surface for workflow runs, logs, dispatch, workflow files, repository Actions settings, secrets, variables, environments, and readiness. It is separate from Source Control.

**Docker Manager**: The container/runtime operations surface for Docker, Unraid, and Kubernetes state, including unhealthy containers, restart loops, rollout health, and runtime attention items before Dashboard or Orchestrator mirrors.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### Terminal runtime terms

**Terminal Section**: A docked or detached terminal component that owns section-level presentation continuity, visibility, and the tab strip it contains.

**Terminal Tab**: A terminal workspace inside a terminal section. It owns title, order, pin state, section membership, and selected-pane state, but it is not the same thing as a runtime PTY session.

**Terminal Pane**: A split-tree slot inside a terminal tab. It owns the visible binding location for one live or historical terminal session at a time.

**Terminal Session**: The runtime PTY continuity object identified by `terminal_session_id`; it owns shell process continuity, transcript identity, and live-versus-historical state.

**Dev Session**: A higher-level development workflow identity identified by `dev_session_id`. It may link terminal, output, problems, debug-console, and ports surfaces, but it must not replace `terminal_session_id` when exact shell reuse matters.

### Provider and account terms

**Provider Entry ID (`provider_entry_id`)**: The concrete provider-registry identifier for a runtime surface. In provider-registry and scheduler internals, `provider_entry_id` replaces ambiguous generic `platform` fields when the record must identify the actual selectable runtime entry rather than a vendor family or UI label.

**Projection Policy Fields**: Internal provider-registry or scheduler fields that describe how PM projects provider-facing configuration. `conflict_policy`, `drift_detection`, `overlay_policy`, `share_classes[]`, `deny_classes[]`, `projection_mode`, `selectable_unit`, and `root_path` stay internal/provider-registry/scheduler-only by default unless an owner doc proves a specific field must be audit-visible; provider-entry `/family/transport` mapping remains additive compatibility metadata over canonical runtime fields.

**Per-account `CODEX_HOME` sandbox**: An isolated account-scoped Codex home used for limit probing and account separation. Per-account `CODEX_HOME` sandboxes keep probe residue out of other accounts and reinforce that health state, usage-pressure state, and resolution outcome are separate concepts.

**Usage-pressure state**: The account/provider pressure signal derived from quota, cooldown, rate-limit, or usage-window evidence. It is distinct from general health state and from the final resolution outcome of a run or switch attempt.

### Projection freshness and health terms

- **Remote-state vocabulary** -- shared surface vocabulary for File Manager, Search, Source Control, Terminal, Problems, and LSP remote-backed projections. Freshness is `current | refreshing | stale` (`current`, `refreshing`, or `stale`); health is `healthy | degraded | unavailable` (`healthy`, `degraded`, or `unavailable`); write availability is `writable`, `pending_write`, `blocked`, or `read_only`. Do not flatten these axes into one generic `offline` badge.
- **Projection-trust clusters** -- current ledger projection-trust clusters are shared by `Plans/storage-plan.md`, `Plans/Contracts_V0.md`, `Plans/Glossary.md`, `/storage-plan.md`, `/Contracts_V0.md`, and `/Glossary.md`.
- **ProjectionHealth** -- the shared user-facing `/trust` record that spans Usage, Orchestrator, Source Control, widgets, `storage-plan`, and `storage-plan.md`; it records freshness, health, stale-data mitigation, and whether an action may read, route, or mutate.
- **Degraded-trust fallback** -- cross-doc projection consumers such as `Widget_System`, `Widget_System.md`, `Run_Graph_View`, `Run_Graph_View.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` use event-driven `/freshness`, degraded-trust, `/direct-record` Ledger fallback, and shared trust records rather than surface-local freshness rules.
- **Runtime-trust command layer** -- `UI_Command_Catalog.md` / `UI_Command_Catalog` command surfaces attach runtime-trust, direct-record, degraded-trust, projection-freshness, `/open`, `/surface`, `/recovery`, and `/provenance` context to cross-surface routing and mutation commands; any under-specified command must block mutation until these fields are known.
- **Blocked-state presentation** -- blocked-state and `dismissed` remain separate: `dismissed` is presentation state, not semantic resolution, and active blockers must not be dismissed into fake health.
- **Progress trust copy** -- `Progress` is summary-heavy and vulnerable to stale `/degraded` projection confusion, so it shows visible freshness state and routes users to native exact-record tabs for inspection when projection trust drops.
- **Concern trust contract** -- degraded-trust and `/concern` escalation across provider/runtime/UI must share one reusable trust/concern contract that carries auth/account health, switch pressure, provider confidence, projection freshness, the `/runtime/UI` boundary, under-owned ownership drift, and requested/effective auth-account visibility between assistant chat and interview/builder docs.


- **Projection Freshness** -- the recency of the projection relative to the live runtime source. It answers "how old is this copy?" and is evaluated with states such as `fresh`, `warm`, `stale`, and `expired`.
- **Projection Health** -- the quality and executability of the projection. It answers "is this state safe and complete enough to act on?" and is evaluated with states such as `healthy`, `degraded`, `blocked`, or `unknown`.
- Action gating uses both axes together: a projection can be fresh-but-unhealthy or healthy-but-stale, and either condition can block a route/open or mutation surface.
- `trust_tier` is reserved for preview/browser semantics such as DOM confidence, scraper provenance, or visual inspection confidence.
- Retire `trust_tier` from action-gating terminology; route/open admissibility and mutations key from `projection_freshness` plus `projection_health` instead.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Help architecture and project status terms

- **History/Ledger help links** -- `History` and `Ledger` keep exact records first while exposing concept help links for unfamiliar states and `/actions`.
- **Three-depth help contract** -- the three-depth help contract keeps inline help, context help, and canonical help entry as distinct layers: `inline help` is short tooltip, badge, or field helper text; `context help` is richer surface-local or popover guidance with examples and related concepts; `canonical help entry` is the durable cross-surface `/help` article for stable concepts.
- **Help-system ownership** -- `help-system` routing keeps `Glossary.md` as the owner for short canonical definitions, while richer help entries own examples and `related-concept` links; contextual help may simplify wording, but it must not mutate the underlying semantics.
- **Glossary concept inventory** -- `Glossary.md` and `/glossary` are the canonical concept inventory backbone for runtime, help, and `/provider` vocabulary even when richer help entries live in another surface.
- **Widget help entry ownership** -- `Plans/Widget_System.md` / `/Widget_System.md` may consume future Orchestrator help-entry copy, but the canonical `help-entry` term inventory remains owned here.
- **Deep-object help-linking** -- `help-linking` for deep objects decides whether clicking or hovering a term, `/badge/state`, badge, field, or state shows inline tooltip, context help, or routes to a dedicated canonical help entry.
- **Gap inventory supersession** -- `supersedes_prior` marks current gap artifacts when `canon_inventory.json` keeps only surviving canon clusters and `open_gaps.json` keeps unresolved blocker families plus exact missing items; the legacy `canon_inventory` and `open_gaps` names are source-lineage aliases unless a live owner requires them.
- **Stability sweep vocabulary** -- local stability sweeps across `/usage`, `/help/blocked/storage`, help, blocked, and storage clusters only transfer when they produce exact fields, headings, affected targets, or blocker families; otherwise they serve as no-new-gap evidence.
- **High-risk canonical word pairs** -- high-risk word pairs require explicit distinction guidance, and `FinalGUISpec.md` plus related UX docs must avoid informal synonyms when canonical terms are required.
- **Orchestrator contextual help** -- `Orchestrator` help remains concept-heavy; core concepts in `Seams`, `Progress`, and inspectors need clickable help affordances that route to canonical help entries when surface-local explanation is insufficient.
- **Tooltip and copy depth** -- help `/copy` may be `tooltip-oriented` for short labels and field helpers, but `tooltip-only` help is insufficient for dense rewrite concepts that need context help, examples, related concepts, or a canonical help entry.
- **Expert/ELI5 and chat-style copy** -- app-level Expert and `/ELI5` display is independent from `chat-style` simplification; simple help can change reading level, but it must not rename runtime truth or alter contract semantics.
- **First-class object help** -- as concepts become first-class `/objects`, stable `related-concept` links become part of the canonical help record rather than loose prose references.


- **Help Entry Architecture** -- the dedicated help-entry architecture with related-concept linking. Each help entry is keyed by canonical concern/state terms and can expose related concepts without renaming the underlying canon.
- **Project `activity_state`** -- the project-wide activity summary (`planning`, `running`, `waiting`, `blocked`, `cooling_down`, `archived`) that answers what the project is doing now.
- **Project `attention_state`** -- the project-wide urgency summary (`quiet`, `watch`, `needs_attention`, `urgent`) that answers how strongly the project should surface alerts, badges, and resurfacing reminders.
- **Blocked-owner taxonomy** -- the canonical owner classes for who must act next (`runtime_owner`, `approval_owner`, `account_owner`, `route_owner`, `policy_owner`).
- **Escalation ladder** -- the deterministic progression from inline help to context help to canonical help entry to owner-targeted remediation to explicit human escalation.
- **Resurfacing / aging rules** -- the thresholds that age unresolved blockers, raise `attention_state`, and resurface the same help entry until the blocker is resolved, dismissed, or reassigned.

This section defines project `activity_state`, project `attention_state`, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules so the same vocabulary can be reused across Orchestrator, project inspectors, and help surfaces.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

### Help-entry template and related-concept clusters


A dedicated help-entry template and related-concept linking cluster uses this canonical shape:

```text
Title
Canonical definition
When this appears
Affected execution context or surface
Recovery steps
Escalation path
Related concepts
Evidence / inspector links
```

Related-concept clusters group help entries by canonical concern/state families such as `auth`, `approval`, `route/open`, `runtime recovery`, and `projection health`. Each cluster keeps durable links between sibling help entries so inline help, context help, and full help views can pivot without inventing new terminology.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

### Runtime operation vocabulary and copy boundaries

The `/glossary` owns reserved runtime and operation wording for the blind-spot family where terminology discipline, provenance, `/legal` hold, and bulk `/undo/cost` semantics can otherwise blur together across user-facing surfaces.

- `Review` must be qualified by surface and required action: Source Control `Review Mode`, Docker/Unraid `needs_review`, GitHub Actions environment reviewer approval, and Orchestrator human review or `/final` approval are not interchangeable labels.
- Requested-vs-effective `/copy` uses the exact labels `Requested`, `Effective`, and `Why different?` for the vs-effective explanation model. Surfaces must not use `Actual`, `Resolved`, `Current`, `Available`, or `Fallback` as synonyms for the same requested/effective concept.
- `Health` means system or `/runtime/connectivity` condition. `Capability` means what provider, runtime, permission, auth, and `/runtime/policy` allow. `Readiness` means whether the requested action can proceed now. `Validation` means the act of checking schema, prerequisites, evidence, or proof.
- `Retry`, `Resume`, `Recover`, and `Restore` are distinct recovery verbs. `Retry` repeats the resolved operation; `Resume` continues a blocked or paused episode after a prerequisite or approval clears; `Recover` follows a canonical remediation flow; `Restore` uses an explicit restore point or preserved state.
- `wake reason` is the user/help label for the canonical `wake_reason` scheduler field. `queue analysis` names the scheduler or queue-state interpretation that led to a wake, and `remediation lineage` names the durable chain of blocked outcome, allowed action, retry/resume, and evidence refs.
- Provenance, `/legal` hold, receipt retention, and bulk `/undo/cost` disclosure remain separate blockers or explanations and must not be collapsed into generic Health, Capability, Readiness, or Validation copy.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

## 4. Evidence
- **Evidence bundle** -- a structured record of commands/checks/artifacts that demonstrates a requirement is met.
- **Wrapper and alias evidence** -- `evidence.schema.json` stores `/fail` checks plus wrapper-normalization and alias-resolution evidence when command wrappers or compatibility aliases prove a canonical action mapping.
- **Spec-integrity evidence** -- `spec-integrity` failures are separate from runtime health: ghost command IDs, missing catalog rows, missing `runtime-artifact` schema family or storage registration, duplicated executor canon, missing advertised sections, and dead glossary references block reconciliation until core owners are mechanically consistent.
- **Interview artifact evidence** -- `Project_Output_Artifacts` / `Project_Output_Artifacts.md` aligns interview-emitted `glossary` artifacts with `evidence/<node_id>.json` and `node_id` evidence records instead of treating those artifact types as generic output.

ContractRef: SchemaID:evidence.schema.json

---

## 5. Secret handling


- **Secret** -- any credential/token or material that could authenticate/authorize.
- **Credential store** -- OS-backed keychain/credential manager; the only allowed persistence for secrets.

ContractRef: Invariant:INV-002

---

## 6. Primitives

### DRYRules
The reuse-first methodology and tagging system (`DRY:WIDGET`, `DRY:DATA`, `DRY:FN`, `DRY:HELPER`) used to prevent code duplication. Canonical definition in `Plans/DRY_Rules.md`.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### PatchPipeline
The Git + PR workflow pipeline covering worktrees, branches, commits, push, and hosting operations. Local git operations are owned by `Plans/WorktreeGitImprovement.md`; hosting operations are owned by `Plans/GitHub_API_Auth_and_Flows.md`.

ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### SessionStore
The persistent storage boundary for sessions, runs, events, and artifacts. Implementation uses seglog (append-only event ledger), redb (durable KV state/projections), and Tantivy (full-text search). Secrets are forbidden.

`seglog` is canonical; redb, `/Tantivy/JSONL`, and search indexes are disposable projections. Replay and `/rebuild` target a deterministic `target_seq`, while freshness notifications derive from committed projection state instead of ad-hoc polling.

Runtime persistence records distinguish `attempt_record`, `tier_runtime_record`, `blocked_projection`, and `usage_record`; storage-plan and storage-plan.md own the durable overlay shape while glossary terms name the records consistently.

Runtime state is not stored in plan-node shards or project-local JSON sidecars; GPT audit context points mutable runtime truth to seglog, redb, and `/redb/projections` owned by storage projections.

ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage

### InstantGrep
The promoted feature name for transparent regex-grep acceleration. Instant Grep is not a second tool name and not a separate index family; it is the user-facing name for the sparse-n-gram SparseNgramIndex plus its `grep` and Search-panel integration.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### SparseNgramIndex
The per-project sparse-n-gram regex index that transparently accelerates `grep` and Search-panel regex queries. Build time extracts all sparse n-grams from normalized content; query time extracts only a minimal-covering set. Posting lists are Roaring Bitmaps keyed by xxh3 hashes; snapshots live in generation-numbered directories and publish via ArcSwap. The index narrows candidate files only; ripgrep verifies final correctness.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### DirtyLayer
The generation-aware in-memory map of dirty paths used by the SparseNgramIndex freshness model. PM-mediated writes update DirtyLayer synchronously before returning success. External file changes arrive via the file watcher. Dirty entries are always considered during verification, and generation-stamped clearing prevents long-running rebuilds from dropping new changes.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### SearchDomainSplit
SearchDomainSplit is the search-domain boundary for `grep-vs-keyword`: `grep` owns raw regex matching over file content, accelerated by SparseNgramIndex when possible. `codesearch` owns Tantivy and LSP-backed keyword, snippet, and symbol retrieval. File Manager search remains a local tree filter, and LSP symbol/reference surfaces keep their own semantics.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

## References
- `Plans/Architecture_Invariants.md`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
