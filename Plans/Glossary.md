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
- **Crosswalk Orchestrator primitive drift** -- `Crosswalk.md` entries such as `OrchestratorPage` must not keep stale six-tab text that omits `Plan Compile` or stale `Tiers` primitive text; `Tiers` is compatibility wording and must not conflict with the seven-tab rewrite model.
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

## Owner / Consumer Map

`Plans/Glossary.md` remains the owner doc for short canonical terminology, runtime/routing vocabulary, help-entry vocabulary, projection trust vocabulary, recovery/copy boundaries, evidence vocabulary, secret terminology, and primitive glossary definitions. Richer examples or workflow-specific copy may live in consumer docs, but consumers must preserve the canonical terms and negative constraints defined here.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### G-002 - Canonical Owner-Section Requirement

```yaml
plan_unit_id: G-002
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Glossary owner-section requirements preserve the product, runtime, storage, UI, and governance details required for this owner document in canonical live specification form.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: canonical_owner_section_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0002
preserved_exact_tokens:
- Canonical owner-section requirements
- product, runtime, storage, UI, and governance details
- owner document
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Glossary.md owns short canonical terminology and vocabulary for downstream plan documents.
owner_hints:
- Plans/Glossary.md
```

### G-003 - Glossary Authority Scope And Platform Naming

```yaml
plan_unit_id: G-003
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Glossary.md defines canonical terms to prevent drift and synonym creep, requires Puppet Master as the only correct platform name, allows legacy naming only as the unquoted older-name reference, and preserves help-entry/template governance setup.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: glossary_authority_scope_platform_naming
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0006
preserved_exact_tokens:
- PUPPET MASTER -- CANONICAL TERMINOLOGY
- Puppet Master
- legacy naming
- prevent drift and synonym creep
- Primitive:Glossary
- Invariant:INV-010
negative_constraints:
- Older platform naming may be referred to only as legacy naming and must not be quoted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:Glossary'
- 'ContractRef: Invariant:INV-010'
```

### G-004 - Orchestrator Rewrite Terms

```yaml
plan_unit_id: G-004
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Orchestrator rewrite terminology defines execution unit context, concern records, trust/degraded states, inline/context/canonical help layers, and owner_node_id lineage with tier-rooted owner fields retained only as source-lineage aliases.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: orchestrator_rewrite_terms
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0008
preserved_exact_tokens:
- Execution Unit Context
- Concern Record
- Trust State
- Degraded State
- Inline Help
- Context Help
- Canonical Help Entry
- owner_node_id
negative_constraints:
- Older tier-rooted ownership field names are migration/source-lineage aliases only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md'
```

### G-005 - Runtime Help-entry Routing And Gap Governance

```yaml
plan_unit_id: G-005
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Runtime and routing help entries use help-entry records with canonical fields and route gap governance through live owner docs, aliases, exact gap items, and broken-anchor cleanup evidence rather than durable two-column glossary tables.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: runtime_help_entry_routing_gap_governance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- help-entry
- canonical_name
- short_definition
- why_it_matters
- what_it_is_not
- common_related_states
- related_concepts
- surface_examples
- gap-001
- gap-008
- broken-anchor cleanup
negative_constraints:
- Avoid two-column Term | Definition tables for durable glossary ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
split_recommendation_reason: Glossary-S0009 contains many runtime/routing term families split across G-005 through G-008.
```

### G-006 - Requested Effective Identity Persona And Provider Vocabulary

```yaml
plan_unit_id: G-006
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Runtime vocabulary uses requested/effective identity, protected core Persona, provider-layer, provider_unavailable, and raw-finding terms without creating duplicate runtime nouns, conflating provider-layer with runtime identity, or treating Document Writer as a protected Persona.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: requested_effective_identity_persona_provider_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- requested_persona
- effective_persona
- Protected core Persona
- assistant
- general-purpose
- overseer
- provider-layer
- provider_unavailable
- raw-finding
- effective_model
- Document Writer
negative_constraints:
- Do not create duplicate top-level nouns such as chat_model; use owner-owned fields such as effective_model.
- Provider-layer terms must not be conflated with runtime identity terms.
- Document Writer is legacy/source-lineage wording, not a protected core Persona unless a later owner decision reopens it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-007 - Route Artifact Decomposition And Account-attempt Boundaries

```yaml
plan_unit_id: G-007
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Route, artifact, decomposition, storage, runtime artifact help, Orchestrator page help, final GUI route copy, assistant chat controls, and account-attempt terms preserve canonical identity, usage, ledger, receipt, retry/resume, and route_target boundaries.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: route_artifact_decomposition_account_attempt_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- decomposition_context
- usage_event_ref
- /Ledger
- cost_usage
- route_target
- resume_url
- /retry
- /account/attempt
- task_id
- attempt_id
negative_constraints:
- decomposition_context must not override canonical node, package, seam, lane, worktree, or attempt identity.
- resume_url is not a stronger ad hoc primitive than route_target.
- Assistant chat surfaces must not invent thread-local resume paths.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-008 - Tier Compatibility Widget Hostability And Projection-era Migration

```yaml
plan_unit_id: G-008
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Tier-shaped, widget-hostability, projection-era event, route payload, evidence wrapper alias, Crosswalk drift, blocked sequence, attempt attribution, Projects registry, and assistant-chat compatibility terms are migration/source-lineage vocabulary that must not revive stale tier-era, widget-era, standalone, page:string, or six-tab models that omit Plan Compile.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: tier_compatibility_widget_hostability_projection_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- Tier-shaped compatibility
- widget-hostability
- widget-layout
- TierChanged
- IterationStart
- TierTree
- route payload vocabulary
- /wrapper/alias
- Crosswalk Orchestrator primitive drift
- Blocked sequence runtime identity
- Attempt attribution migration
- projects:v1
negative_constraints:
- Do not revive stale tier-era execution terms, widget-era non-Progress Orchestrator assumptions, standalone-surface page models, non-canonical persona fields, or tier_type as a core node UI field.
- widget-hostability and widget-layout are compatibility-only vocabulary for non-Progress Orchestrator surfaces.
- Crosswalk Orchestrator primitive text must not keep stale six-tab or Tiers wording that conflicts with the seven-tab rewrite model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-009 - Shell And Workspace Surface Vocabulary

```yaml
plan_unit_id: G-009
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Shell and workspace terms define Source Control as Git-first repo/worktree state, GitHub Actions as hosted workflow/admin/runtime state, and Docker Manager as container/runtime operations attention state.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: shell_workspace_surface_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0010
preserved_exact_tokens:
- Source Control
- GitHub Actions
- Docker Manager
- local SCM state
- workflow runs
- repository Actions settings
- unhealthy containers
negative_constraints:
- GitHub Actions is separate from Source Control.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
```

### G-010 - Terminal Runtime Vocabulary

```yaml
plan_unit_id: G-010
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Terminal runtime terms distinguish Terminal Section, Terminal Tab, Terminal Pane, Terminal Session, terminal_session_id, Dev Session, and dev_session_id so visible terminal binding and runtime PTY continuity stay separate.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: terminal_runtime_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0011
preserved_exact_tokens:
- Terminal Section
- Terminal Tab
- Terminal Pane
- Terminal Session
- terminal_session_id
- Dev Session
- dev_session_id
negative_constraints:
- Dev Session must not replace terminal_session_id when exact shell reuse matters.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-011 - Provider Entry Projection Policy And Usage Pressure Vocabulary

```yaml
plan_unit_id: G-011
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Provider and account terms distinguish provider_entry_id, internal projection policy fields, per-account CODEX_HOME sandboxing, and usage-pressure state from generic platform fields, health state, and final resolution outcome.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: provider_entry_projection_policy_usage_pressure_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0012
preserved_exact_tokens:
- provider_entry_id
- conflict_policy
- drift_detection
- overlay_policy
- share_classes[]
- deny_classes[]
- projection_mode
- selectable_unit
- root_path
- per-account CODEX_HOME
- Usage-pressure state
negative_constraints:
- Projection policy fields stay internal/provider-registry/scheduler-only by default unless an owner doc proves audit visibility.
- Usage-pressure state is distinct from general health state and final resolution outcome.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-012 - Projection Freshness Health And Trust Axes

```yaml
plan_unit_id: G-012
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Projection freshness, health, trust, degraded fallback, runtime-trust command, blocked presentation, Progress trust, concern trust, and projection_freshness/projection_health terms keep recency, safety, write availability, dismissal, trust_tier, and mutation gating axes distinct.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: projection_freshness_health_trust_axes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0013
preserved_exact_tokens:
- current | refreshing | stale
- healthy | degraded | unavailable
- writable
- pending_write
- blocked
- read_only
- ProjectionHealth
- projection_freshness
- projection_health
- trust_tier
- dismissed
negative_constraints:
- Do not flatten freshness, health, and write availability into one generic offline badge.
- dismissed is presentation state, not semantic resolution.
- Retire trust_tier from action-gating terminology.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
```

### G-013 - Help Architecture Linking And Copy-depth Vocabulary

```yaml
plan_unit_id: G-013
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Help architecture terms define exact-record links, three-depth help, help-system ownership, concept inventory, widget help ownership, deep-object help-linking, gap supersession, stability sweeps, high-risk word pairs, Orchestrator contextual help, tooltip depth, Expert/ELI5 copy, and first-class object related-concept records without changing underlying semantics.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: help_architecture_linking_copy_depth_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0014
preserved_exact_tokens:
- History/Ledger help links
- Three-depth help contract
- inline help
- context help
- canonical help entry
- help-system
- help-linking
- supersedes_prior
- tooltip-oriented
- Expert
- /ELI5
- related-concept
negative_constraints:
- Contextual help may simplify wording, but it must not mutate underlying semantics.
- Simple help can change reading level, but it must not rename runtime truth or alter contract semantics.
- tooltip-only help is insufficient for dense rewrite concepts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
split_recommendation_reason: Glossary-S0014 contains help architecture and project-status term families split across G-013 and G-014.
```

### G-014 - Project Status Blocked Owner Escalation And Resurfacing Vocabulary

```yaml
plan_unit_id: G-014
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Project status terms define activity_state, attention_state, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules so Orchestrator, project inspectors, and help surfaces share blocker and project-state vocabulary.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: project_status_blocked_owner_escalation_resurfacing_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0014
preserved_exact_tokens:
- activity_state
- planning
- running
- waiting
- blocked
- cooling_down
- archived
- attention_state
- quiet
- watch
- needs_attention
- urgent
- Blocked-owner taxonomy
- runtime_owner
- approval_owner
- account_owner
- route_owner
- policy_owner
- Escalation ladder
- Resurfacing / aging rules
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
```

### G-015 - Help-entry Template And Related Concept Clusters

```yaml
plan_unit_id: G-015
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Help-entry template and related-concept cluster terms preserve canonical help shape, recovery/escalation/evidence fields, and concern/state cluster families such as auth, approval, route/open, runtime recovery, and projection health.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: help_entry_template_related_concept_clusters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0015
preserved_exact_tokens:
- Title
- Canonical definition
- When this appears
- Affected execution context or surface
- Recovery steps
- Escalation path
- Related concepts
- Evidence / inspector links
- auth
- approval
- route/open
- runtime recovery
- projection health
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
```

### G-016 - Runtime Operation Vocabulary And Copy Boundaries

```yaml
plan_unit_id: G-016
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Runtime operation vocabulary reserves copy for Review, Requested, Effective, Why different?, Health, Capability, Readiness, Validation, Retry, Resume, Recover, Restore, wake reason, queue analysis, and remediation lineage while keeping provenance, legal hold, receipt retention, and bulk undo/cost disclosure separate.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: runtime_operation_vocabulary_copy_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0016
preserved_exact_tokens:
- Review
- Requested
- Effective
- Why different?
- Health
- Capability
- Readiness
- Validation
- Retry
- Resume
- Recover
- Restore
- wake_reason
- queue analysis
- remediation lineage
- /legal
- /undo/cost
negative_constraints:
- Surfaces must not use Actual, Resolved, Current, Available, or Fallback as synonyms for Requested/Effective concepts.
- Provenance, legal hold, receipt retention, and bulk undo/cost disclosure must not collapse into generic Health, Capability, Readiness, or Validation copy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
```

### G-017 - Evidence And Spec-integrity Vocabulary

```yaml
plan_unit_id: G-017
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Evidence vocabulary distinguishes evidence bundles, wrapper/alias evidence, spec-integrity evidence, and interview artifact evidence so command proof, alias normalization, ghost IDs, missing schema/sections, dead references, and node evidence stay machine-consistent.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: evidence_spec_integrity_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0017
preserved_exact_tokens:
- Evidence bundle
- Wrapper and alias evidence
- evidence.schema.json
- /fail
- wrapper-normalization
- alias-resolution
- spec-integrity
- Interview artifact evidence
- Project_Output_Artifacts
- node_id
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json'
```

### G-018 - Secret Handling Vocabulary

```yaml
plan_unit_id: G-018
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Secret handling vocabulary defines Secret and Credential store and keeps OS-backed credential storage as the only allowed persistence for secrets.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: secret_handling_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0018
preserved_exact_tokens:
- Secret
- Credential store
- OS-backed keychain/credential manager
- only allowed persistence for secrets
negative_constraints:
- OS-backed credential store is the only allowed persistence for secrets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002'
```

### G-019 - DRYRules Primitive

```yaml
plan_unit_id: G-019
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: DRYRules primitive vocabulary defines reuse-first methodology and DRY tags for widget, data, function, and helper reuse under DRY_Rules ownership.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: dryrules_primitive
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0020
preserved_exact_tokens:
- DRYRules
- DRY:WIDGET
- DRY:DATA
- DRY:FN
- DRY:HELPER
- Plans/DRY_Rules.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### G-020 - PatchPipeline Primitive

```yaml
plan_unit_id: G-020
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: PatchPipeline primitive vocabulary defines the Git and PR workflow pipeline and preserves local git ownership under WorktreeGitImprovement and hosting ownership under GitHub_API_Auth_and_Flows.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: patchpipeline_primitive
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0021
preserved_exact_tokens:
- PatchPipeline
- Git + PR workflow pipeline
- worktrees
- branches
- commits
- push
- hosting operations
- local git operations
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement owns local git operations; GitHub_API_Auth_and_Flows owns hosting operations.
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### G-021 - SessionStore Primitive And Runtime Persistence Boundary

```yaml
plan_unit_id: G-021
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: SessionStore primitive vocabulary defines session/run/event/artifact storage over seglog, redb, Tantivy, replay, projections, runtime records, and storage-owned overlay shape while forbidding secrets and keeping runtime state out of plan-node shards and project-local JSON sidecars.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: sessionstore_runtime_persistence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0022
preserved_exact_tokens:
- SessionStore
- seglog
- redb
- Tantivy
- target_seq
- freshness notifications
- attempt_record
- tier_runtime_record
- blocked_projection
- usage_record
- /redb/projections
negative_constraints:
- Secrets are forbidden in persistent storage.
- Runtime state is not stored in plan-node shards or project-local JSON sidecars.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage'
```

### G-022 - InstantGrep User-facing Name

```yaml
plan_unit_id: G-022
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: InstantGrep primitive vocabulary defines the promoted user-facing name for transparent regex-grep acceleration over SparseNgramIndex plus grep and Search-panel integration.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: instantgrep_user_facing_name
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0023
preserved_exact_tokens:
- InstantGrep
- Instant Grep
- SparseNgramIndex
- grep
- Search-panel integration
negative_constraints:
- Instant Grep is not a second tool name and not a separate index family.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
```

### G-023 - SparseNgramIndex Query And Storage Semantics

```yaml
plan_unit_id: G-023
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: SparseNgramIndex vocabulary defines sparse n-gram regex acceleration, build/query extraction, Roaring Bitmap postings keyed by xxh3, generation-numbered snapshots, ArcSwap publish, and ripgrep final verification.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: sparse_ngram_index_query_storage_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0024
preserved_exact_tokens:
- SparseNgramIndex
- sparse n-grams
- Roaring Bitmaps
- xxh3
- generation-numbered directories
- ArcSwap
- ripgrep
negative_constraints:
- The index narrows candidate files only; ripgrep verifies final correctness.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
```

### G-024 - DirtyLayer Freshness Model

```yaml
plan_unit_id: G-024
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: DirtyLayer vocabulary defines generation-aware dirty path tracking, synchronous PM-mediated write updates, external file watcher updates, verification inclusion, and generation-stamped clearing for SparseNgramIndex freshness.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: dirtylayer_freshness_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0025
preserved_exact_tokens:
- DirtyLayer
- generation-aware
- dirty paths
- PM-mediated writes
- file watcher
- generation-stamped clearing
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
```

### G-025 - SearchDomainSplit Boundary

```yaml
plan_unit_id: G-025
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: SearchDomainSplit vocabulary defines grep-vs-keyword ownership where grep owns raw regex over file content, codesearch owns Tantivy/LSP keyword/snippet/symbol retrieval, File Manager search remains tree filtering, and LSP symbol/reference surfaces keep their own semantics.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: search_domain_split_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0026
preserved_exact_tokens:
- SearchDomainSplit
- grep-vs-keyword
- grep
- codesearch
- Tantivy
- LSP-backed keyword
- File Manager search
- LSP symbol/reference
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md'
```

### G-001 - Glossary Retired Source-Preserving Bridge

```yaml
plan_unit_id: G-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: G-001 is retained only as migration-lineage compatibility disposition for the retired Glossary source-preserving bridge. Product coverage has been atomized into G-002 through G-025 or structurally dispositioned, and G-001 must not re-own Glossary product spans or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; the old bridge span mentions GUI/help tokens, but product GUI coverage is owned by fine-grained Glossary PlanUnits.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- G-001 no longer uses source_preserving_planunit compile mode.
- G-002 through G-025 own product coverage for atomized Glossary spans.
- Glossary-S0001, S0003, S0007, S0019, S0027, S0028, S0029, and S0031 are explicit structural dispositions.
- G-001 maps only to retired bridge lineage Glossary-S0030.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0030
preserved_exact_tokens:
- G-001
- Glossary-S0030
- source_preserving_planunit
- source_preserving_bridge_retired
- Glossary (Canonical)
- g-001-glossary-canonical-source-preserving-planunit
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- G-001 must not re-own Glossary-S0001 through Glossary-S0029 product coverage.
- G-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- G-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former G-001 residual source-preserving bridge is retired by Phase 2B batch 079.
owner_boundary_notes:
- G-002 through G-025 own atomized Glossary body coverage.
- Glossary-S0030 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/Glossary.md
```

## Migration Coverage

Original hash: `9c5a6506e244d091954f576977d8078604cedcd5402dd92a0a17f107acb49bd3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 078 atomized `Glossary-S0002`, `Glossary-S0004` through `Glossary-S0018`, and `Glossary-S0020` through `Glossary-S0026` into `G-002` through `G-025`, with dense runtime/routing and help spans split where safe. `Glossary-S0001`, `Glossary-S0003`, `Glossary-S0007`, `Glossary-S0019`, `Glossary-S0027`, `Glossary-S0028`, and `Glossary-S0029` are structural or reference dispositions. Phase 2B batch 079 retired `G-001` as migration-lineage compatibility coverage for `Glossary-S0030` and structurally dispositioned `Glossary-S0031`; `Glossary.md` has no residual source-preserving product coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### G-026 - Teach Help Glossary Content Pack

```yaml
plan_unit_id: G-026
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Teach-specific Help/Glossary content includes canonical entries for Teach, Teacher, taught memory,
  memory scope, user-locked record, Sources used / PM context, guided GUI step, safe guided action, mutation confirmation,
  Teach model default/setting, Teacher handoff, missing PM coverage, Help icon, and summon phrases. Teach uses inline,
  context, and canonical help depths; Teacher resolves Help/Glossary content through current surface context, canonical
  owner entries, related-concept clusters, source confidence/currentness, and missing-coverage disclosure. Entries
  preserve owner refs, approved microcopy examples, context-help surface coverage, and auditable coverage matrix.
gui_related: true
gui_classification_reason: Help and Glossary entries are user-visible help content and context-help surfaces.
depends_on:
- PP-056
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_help_content_gap
reasoning_tier: high
context_scope: teach_help_glossary
implementation_surfaces:
- Plans/Glossary.md
- future Help surfaces
- future context help
node_compile_hint:
  mode: teach_help_glossary_content
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0111
- pldg-20260626-001-feature-name:atom-0112
- pldg-20260626-001-feature-name:atom-0113
- pldg-20260626-001-feature-name:atom-0114
- pldg-20260626-001-feature-name:atom-0115
- pldg-20260626-001-feature-name:atom-0116
- pldg-20260626-001-feature-name:atom-0117
- pldg-20260626-001-feature-name:atom-0118
- pldg-20260626-001-feature-name:atom-0119
- pldg-20260626-001-feature-name:atom-0120
- pldg-20260626-001-feature-name:atom-0121
- pldg-20260626-001-feature-name:atom-0122
- pldg-20260626-001-feature-name:atom-0123
- pldg-20260626-001-feature-name:atom-0124
- pldg-20260626-001-feature-name:atom-0125
- pldg-20260626-001-feature-name:atom-0126
- pldg-20260626-001-feature-name:atom-0127
- pldg-20260626-001-feature-name:atom-0128
- pldg-20260626-001-feature-name:atom-0129
- pldg-20260626-001-feature-name:atom-0130
- pldg-20260626-001-feature-name:atom-0131
- pldg-20260626-001-feature-name:atom-0132
- pldg-20260626-001-feature-name:atom-0133
- chat:teach-help-glossary-rest-request
- Plans/Glossary.md
- Plans/FinalGUISpec.md
- Plans/Glossary.md#Help-entry-template-and-related-concept-clusters
- Plans/assistant-chat-design.md#6-Teach
- Plans/assistant-chat-design.md
- chat:teach-gap-fill-correction
- q-0027
- dec-0022
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
source_atom_ids:
- atom-0111
- atom-0112
- atom-0113
- atom-0114
- atom-0115
- atom-0116
- atom-0117
- atom-0118
- atom-0119
- atom-0120
- atom-0121
- atom-0122
- atom-0123
- atom-0124
- atom-0125
- atom-0126
- atom-0127
- atom-0128
- atom-0129
- atom-0130
- atom-0131
- atom-0132
- atom-0133
decision_refs:
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- Help/Glossary
- Inline Help
- Context Help
- Canonical Help Entry
- Three-depth help contract
- help-entry
- Glossary.md
- Title
- Canonical definition
- Related concepts
- Teach
- Teacher
- taught memory
- memory scope
- user-locked
- Sources used
- guided GUI step
- mutation confirmation
- missing PM coverage
- canonical_name
- short_definition
- when_this_appears
- affected_surface_or_context
- teacher_explanation
- steps_teacher_can_show
- safe_actions
- mutation_requires_confirmation
- related_concepts
- source_owner_refs
- inline help
- context help
- canonical help entry
- tooltip
- popover
- card
- full durable help page
- current surface/control route
- Teach-specific help entry
- Glossary canonical definition
- owner Plans/PlanUnits
- command/settings/capability records
- scoped taught memory
- missing-help coverage callout
- auditable
- every Teach entrypoint
- guided action family
- model setting
- source disclosure state
- missing-coverage state
- no-help-needed disposition
- authored from canonical owner sources
- not hand-copied into UI strings
- owner docs
- PlanUnits
- GUI labels/tooltips
- canonical terms
- related-concept links
- acceptance tests
- Teach help entries exist
- related-concept links resolve
- inline/context/full help
- Teacher cites
- missing-help callouts
- source-owner refs
- does not rename canonical terms
- I accept it
- i dont think we finished speccing it out right?
- You just recorded the gap.
- We need to fill it right?
- recorded the gap
- fill it
- Assistant Chat
- /teach
- help icon
- not ordinary chat
- not silent automation
- not automatic memory persistence
- Persona
- low-end/fast default model
- effective model
- PM sources
- current context
- highlight
- open
- route UI surfaces
- durable
- user-approved
- current thread
- current project
- feature area
- scope selector
- edit/delete
- one-off Teacher instruction
- user-locked record
- must not silently overwrite
- rejects an update
- resolves a conflict
- pins a correction
- unlock/edit flow
- conflict display
- PM context
- current surface/control
- current thread/project
- help/glossary entry
- Plans/PlanUnits
- provider/model/account state
- runtime artifact
- stale
- missing
- disabled
- permission-required
- focus or open
- anchored caption
- Back
- Next
- Stop
- Let me try
- Do it
- do not cover the target
- return to the chat transcript
- safe guided action
- opening a route
- focusing a panel
- scrolling
- highlighting
- previewing
- explicit confirmation
- action name
- affected object
- risk
- rollback/undo
- Cancel
- low-end model
- low-end/fast model
- Auto/fast default
- selected override
- requested model
- provider availability
- fallback reason
- Reset to Auto
- Teacher persona details
- Teacher handoff
- non-teaching assistance
- implementation work
- high-capability reasoning
- external search
- another persona/tool path
- required help entry
- owner source
- capability record
- route/control record
- permission
- teach me
- show me how
- help me understand this
- new Assistant Chat thread
- Teacher mode
- current surface/control context
- Teacher badge
- context chip
- model chip
- continue with Teacher
- Assistant Chat thread header
- Teacher activity cards
- PM context panel
- guided overlay captions
- Teach memory capture prompts
- Settings > model row
- command palette `/teach` result
- Help/Glossary pages
- current-context example
- 'Teach: learn PM with sourced, step-by-step help'
- Teacher is using PM context from this screen
- Saved only if you approve
- 'Missing PM coverage: Teacher cannot verify this yet'
- 'Safe guided action: highlight or open only'
- Mutation requires confirmation
- owner sources
- Assistant Chat design
- Personas
- Models
- Final GUI Spec
- UI Command Catalog
- Permissions
- Prompt Pipeline
- Tools
- Runtime Artifacts
- Glossary
- coverage matrix
- one row per Teach entry
- canonical help page
- Teacher citation
- owner source refs
- related concepts
- GUI surface(s)
- missing-state behavior
- no-help-needed
negative_constraints:
- Do not assume the generic Help/Glossary architecture already contains Teach-specific content.
- Do not let Teacher rely on glossary architecture without checking whether a concrete help entry exists.
- Do not leave Teach-specific help entries implicit in Persona prose only.
- Do not make every Teacher answer invent local definitions instead of resolving canonical help entries.
- Do not use a two-column term table as the durable Teach help-entry format.
- Do not store Teach help examples without source owner refs or related-concept links.
- Do not make tooltip-only help sufficient for Teach concepts that require examples or related concepts.
- Do not let Teacher simplify wording by renaming runtime truth or canonical terms.
- Do not let Teacher silently skip missing help entries.
- Do not search/read external or cross-project sources unless the user explicitly approves that route.
- Do not use taught memory outside its scope.
- Do not let Teach ship with untracked missing help entries.
- Do not treat generic Glossary architecture as coverage for concrete Teach user flows.
- Do not fork Teach help copy into disconnected UI strings.
- Do not let short-copy variants drift from canonical terms or related concepts.
- Do not mark Help/Glossary support complete without concrete Teach help-entry coverage tests.
- Do not allow Teacher to cite missing or broken help-entry links as valid sources.
- Do not treat q-0027 acceptance as complete filled Teach help content.
- Do not call Teach Help/Glossary implementation-ready without concrete entries, surfaces, examples, and tests.
- Do not describe Teach as a standalone automation runner.
- Do not imply every Teacher interaction becomes durable taught memory.
- Do not hide the distinction between learning/help and mutating PM state.
- Do not present Teacher as a separate feature detached from Teach.
- Do not let Teacher claim authority without visible source/context disclosure.
- Do not allow Teacher to perform unsafe mutations as teaching gestures.
- Do not persist Teach conversation content as memory without confirmation.
- Do not use taught memory outside its approved scope.
- Do not bury edit/delete controls away from the memory explanation.
- Do not let later Teach runs overwrite locked corrections without explicit user action.
- Do not cite a locked record without showing its scope/source when relevant.
- Do not let Teacher present PM facts as unsourced hidden prompt lore.
- Do not collapse stale, missing, disabled, and permission-required states into generic uncertainty.
- Do not cite unavailable PlanUnits before a future compile creates them.
- Do not use raw cursor/click automation as the teaching UI.
- Do not let the caption obscure the control being taught.
- Do not make the overlay the only accessible explanation path.
- Do not let `Do it` execute mutations without a confirmation step.
- Do not make confirmation copy vague about the affected object.
- Do not default a destructive confirmation to proceed.
- Do not hide fallback from requested model to effective model.
- Do not make Teach model configuration raw-file only.
- Do not reuse a broad automation model setting when a scoped Teach/Teacher setting is intended.
- Do not let Teacher guess through missing PM coverage.
- Do not silently change persona/model/tool path without disclosure.
- Do not treat handoff as failure when it is the correct safer route.
- Do not silently switch an existing assistant conversation into Teacher mode.
- Do not launch Teacher without preserving current surface/control context when available.
- Do not require users to know slash commands before discovering Teach.
- Do not fork labels between surfaces.
- Do not make context help available only from the full Help page.
- Do not include generic examples when current surface context is available.
- Do not let microcopy examples become disconnected product truth.
- Do not use cheerful copy to soften missing coverage, unsafe mutation, or persistence warnings.
- Do not rename canonical terms in short-copy variants.
- Do not author Teach help as disconnected prose without owner refs.
- Do not cite future PlanUnits before compile creates them.
- Do not duplicate conflicting definitions across owners.
- Do not rely on a freeform list with no coverage matrix.
- Do not mark MVP complete with missing required Teach help rows.
- Do not accept no-help-needed dispositions without owner evidence.
owner_hints:
- Plans/Glossary.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/UI_Command_Catalog.md
- Plans/Automated_Testing_System.md
- Plans/Plan_Document_System.md
- Plans/Models_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
- Plans/Commands_System.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 322` (repaired; source line 1099; `sfk-ca8ac335e38bf1a7766e9217`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1391-1406 (G-022): "InstantGrep" cited as owned by Tools.md **confirmed via grep, zero occurrences of "InstantGrep" in Tools.md** the promoted user-facing name is undefined in its stated owner doc.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
