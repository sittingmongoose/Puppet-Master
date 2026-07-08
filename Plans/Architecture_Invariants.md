# Architecture Invariants (Canonical)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- ARCHITECTURE INVARIANTS

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope


Invariants are cross-cutting rules that MUST hold across all plans and implementations.

ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§1

---

<a id="INV-001"></a>
## INV-001 -- Tool correlation integrity (normalized streams + persisted events)


  ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity
  - attempt_id
  - it still leaves no normalized path for account-switch, pressure/confidence, or actor-class disclosure
  - Add a versioned correlation block to bridged-provider normalized events and require actor/thread/attempt/lineage refs there.
  - likely owners for canonical correlation blocks, switch/pressure episodes, and blocked/approval identity linkage
  - any run-start/runtime snapshot events that already carry requested/effective auth-account fields
  - canonical `thread_id` remains PM correlation
  - thread_id
  - Add a versioned stream/provider correlation block for actor/attempt/account/trust metadata.
  - they are useful correlation fields
  - No durable approver identity is defined on approval/rejection events yet.
  - `tier_id` can still survive as a human-readable grouping label, but it should stop acting like the canonical execution correlation key.
  - tier_id
  - align project-artifact events to EventRecord-level identity,
  - requested/effective provider/model/auth/account disclosure fields by ref or normalized snapshot
  - args should carry a normalized subject/route target
  - `correlation_id` still lacks an explicit trace-through requirement into persisted dispatch/domain events.
  - correlation_id
  - The subject-first behavior is present in practice, but still looks like a set of special-case prose pockets instead of one normalized identity rule.
  - new producers/docs should emit the canonical normalized target model
  - Add explicit migration notes when replacing raw local IDs with normalized `subject_id` or `object_kind/object_id` forms.
  - subject_id
  - object_kind/object_id
  - otherwise it should reuse persisted shell state and local destination defaults
  - MUST NOT reuse persisted state when doing so would:
  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - `usage_event_ref` still appears as a special-case route concept in some docs instead of being normalized into `object_kind = usage_event`.
  - usage_event_ref
  - object_kind = usage_event
  - `usage_event_ref` still reads like a direct route field in some docs rather than a normalized object identity.
  - but they still carry `resume_url?`, which keeps navigation transport inside persisted state as if it were canonical identity
  - resume_url?
  - tier-start validation/persona/QA events
  - tier-keyed usage/evidence correlation
  - 1. owner-doc integrity and routing
  - `tier_id` worker-output correlation
  - Reconciliation should treat this as an owner-doc integrity stack, not three isolated docs:
  - `Run_Graph_View.md` and `usage-feature.md` still reinforce each other through `tier_id`, which keeps the old usage/evidence/runtime correlation alive.
  - Run_Graph_View.md
  - usage-feature.md
  - Route-aware schema/gate/evidence extensions remain incomplete relative to the ledger's normalized routing model.
**Rule:** Tool invocation correlation MUST be consistent:
- In normalized provider streams, every `tool_use` MUST have exactly one matching `tool_result` with the same `tool_use_id` (no orphan tool events).  
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md
- In persisted event streams, tool activity MUST be represented using the canonical tool event types (`tool.invoked`, `tool.denied`) and MUST include stable `run_id` + `thread_id` correlation.  
  ContractRef: ContractName:Contracts_V0.md

---

<a id="INV-002"></a>
## INV-002 -- No secrets in persistent storage

**Rule:** Secrets (tokens, credentials, private keys) MUST NOT be written to:
- seglog event stream
- redb projections
- Tantivy indexes
- sparse n-gram regex-index artifacts (`frequency_table.bin`, `postings.bin`, `lookup.bin`, `file_map.bin`, `index_meta.json`) except for secrets-scrubbed derived content and project-relative paths
- plaintext logs, evidence bundles, or state files

**Allowed persistence:** OS credential store only.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, SchemaID:evidence.schema.json, PolicyRule:no_secrets_in_storage, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

## INV-003 -- UI SSOT (no bespoke UI behavior)


**Rule:** UI copy, buttons, and view behavior MUST be specified in the canonical UI SSOT docs and typed command layer; plan docs may reserve IDs but must not invent ad-hoc UI behaviors.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand

---

<a id="INV-004"></a>
## INV-004 -- UI command boundary (no business logic in UI)


**Rule:** The UI layer MUST dispatch stable `UICommand` IDs and MUST NOT execute business logic directly.

ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-005"></a>
## INV-005 -- Deterministic ordering from SSOT lists


**Rule:** When multiple candidates exist (paths, names, servers, etc.), tie-break ordering MUST come from a single SSOT list owned by the relevant domain; no heuristic reordering.

ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-006"></a>
## INV-006 -- Providers are storage-isolated

**Rule:** Providers and provider adapters MUST NOT write directly to persistent storage (`seglog`, `redb`, `Tantivy`, sparse n-gram index files, or remote-cache state). They emit normalized events or tool results; PM-owned storage writers, projectors, and cache managers own persistence.

ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md

## INV-007 -- No stringly-typed IDs outside SSOT


**Rule:** Stable IDs (Tool IDs, UICommand IDs, ConfigKey names, schema IDs) MUST NOT be re-invented as ad-hoc string literals in multiple places. They must be defined once (SSOT) and referenced everywhere else.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

---

<a id="INV-008"></a>
## INV-008 -- GitHub operations are API-only


**Rule:** GitHub hosting/auth/repo/fork/PR operations MUST use the GitHub HTTPS API only; the GitHub CLI (`gh`) MUST NOT be used for these operations.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

<a id="INV-009"></a>
## INV-009 -- Cursor transport is invisible to consumers


**Rule:** Cursor must support both `stream-json` and ACP transports under one Provider facade; consumers MUST NOT branch on transport type.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md

---

<a id="INV-010"></a>
## INV-010 -- Platform naming compliance


**Rule:** The platform name is **Puppet Master** only.
Any older naming must be referred to only as **legacy naming** (without quoting the older name).

ContractRef: Primitive:Glossary

---

<a id="INV-011"></a>
## INV-011 -- UI command dispatch only (Rule 1)

Command ownership follows mutation domain, not menu location: `Add to Assistant Chat` dispatches `cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }` because it mutates chat `/context`; file-tree actions remain under `cmd.file` / `cmd.file.*`; `Open in Terminal` reveals through `cmd.terminal.open` and `Show Terminal` focuses through `cmd.terminal.show` rather than either action becoming a file command.


**Rule:** The UI layer MUST dispatch only typed `UICommand` envelopes to trigger non-trivial behavior. The UI MUST NOT call backend services, storage, domain logic, or provider integrations directly. All user-initiated interactions flow through the UI Command Dispatcher boundary.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-1, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

---

<a id="INV-012"></a>
## INV-012 -- Wiring matrix coverage (Rule 2)

**Rule:** UI command coverage MUST keep the command catalog, wiring matrix, examples, and templates mechanically consistent.

- `Plans/UI_Command_Catalog.md` command/catalog/template/example integrity is a gating invariant: if catalog examples, command templates, or wiring rows drift, surfaces can be miswired even when each individual `UICommandID` exists.

<a id="INV-013"></a>
## INV-013 -- Pre-dispatch tool validation


`policy.may_execute_tool()` MUST be called for every tool dispatch at every nesting depth regardless of invocation path. No child-run, plugin path, provider surface, or shell bridge may bypass this invariant.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Enforcement may be static (import-graph / compile-time gate) or runtime (central dispatch gate), but direct calls to tool implementations without this permission gate are prohibited.

ContractRef: Invariant:INV-013, ContractName:Plans/Architecture_Invariants.md

## INV-014 -- Shared mutable state requires RWMutex


### Rule

Any data structure shared across threads or async tasks that can be mutated MUST be protected by an `RwLock`/`RWMutex` (or equivalent). Lock-free approaches are allowed only when formally justified. Silent data races are prohibited. Permission state mutations in `Permissions_System` EXEC paths are covered by this invariant.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-014

<a id="INV-015"></a>
## INV-015 -- Monetary values are integer microdollars


### Rule

All persisted and in-memory monetary cost values MUST be stored as integer microdollars (`u64`). Float types MUST NOT be used for cost storage or accumulation at any layer. `cost_usd` is derived display copy only: `cost_microdollars / 1_000_000`, presentation-only, and never a persisted billing field.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

Enforcement: `clippy` or custom lint to reject `f64`/`f32` fields named `cost*`, `price*`, or `amount*` in persisted structs.
ContractRef: Invariant:INV-015

<a id="INV-016"></a>
## INV-016 -- Token fields are never aggregated at storage layer


### Rule

The five canonical token fields (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`) MUST be stored individually in every usage record, with `total_tokens` derived without losing bucket detail. Pre-aggregation or collapsing at the storage or event layer is prohibited: provider records that AGGREGATES into fewer persisted DB fields are non-canonical. `token-bucket` persistence is part of the same usage/BILL invariant family.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

ContractRef: Invariant:INV-016

<a id="INV-017"></a>
## INV-017 -- File mutations are atomic (temp-fsync-rename)

All FileSafe-managed file write operations MUST use the atomic write pattern: write to a temp file, fsync, rename to the target path. Direct `os.WriteFile` or equivalent non-atomic write calls MUST NOT be used for managed files. Concurrent-edit safety is part of INV-017: managed rewrites capture `read_revision`, re-check before promote, and abort with `concurrent_edit_conflict` on concurrent-edit drift; any missing path is a MUST CHANGE item, not an implementation preference.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

ContractRef: Invariant:INV-017

<a id="INV-018"></a>
## INV-018 -- Seglog CRC32 is mandatory


### Rule

Every seglog record MUST include a CRC32 checksum. Checksum validation MUST occur on every read. A record that fails CRC32 validation MUST be skipped and a recovery event emitted. Silently processing a corrupt record is prohibited.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

ContractRef: Invariant:INV-018

**Rule:** Every interactive UI element MUST map to exactly one `UICommandID`. The mapping MUST be recorded in the wiring matrix (validated by `Plans/Wiring_Matrix.schema.json`). Every `UICommandID` listed in `Plans/UI_Command_Catalog.md` MUST have a registered handler. No interactive element may exist without a wiring matrix entry; no catalog command may lack a handler.

ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-2, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010

---

## Contract-driven code generation (lightweight; DRY)
To avoid duplicated shapes for tools/events/policy:
- JSON Schemas under `Plans/*.schema.json` are the canonical source for validation and (optionally) code generation.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md
- Generated Rust code MUST live under a single `generated/` boundary (path is implementation-defined) and MUST NOT be hand-edited.  
  ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2

---

## Validation (gated; autonomous)
Invariants are validated by progression gate `GATE-003`.

**Minimum automated checks (scriptable):**
- Validate schemas (plan graph, evidence, change budget, auto decisions).  
  ContractRef: Gate:GATE-001
- Enforce `INV-008` by scanning for GitHub CLI usage in build-governing docs and implementation surfaces.  
  ContractRef: Invariant:INV-008
- Enforce `INV-010` naming compliance in `Plans/` (platform name only).  
  ContractRef: Invariant:INV-010
- Enforce `INV-011` by verifying no UI code directly calls backend/storage/provider modules (static analysis or import-graph check).  
  ContractRef: Invariant:INV-011
- Enforce `INV-012` by validating wiring matrix coverage: every UICommandID in the catalog has a handler entry, and every interactive element has a wiring entry.  
  ContractRef: Invariant:INV-012, Gate:GATE-010

ContractRef: Gate:GATE-003

## Debug investigation invariants addendum (2026-03-23)


### Invariant A -- Debug overlay is not a runtime mode


`debug` MUST exist only in overlay identity and UI label state. The canonical runtime-mode enum remains `ask | plan | regular | yolo`.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Invariant B -- Visible evidence ingress only


Automatically collected Debug evidence MUST become visible Investigation Context or Runtime Artifacts state. PM MUST NOT rely on hidden prompt-only evidence injection for browser/debug payloads.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### Invariant C -- Cross-surface investigation identity


Any PM surface that participates in debugging MUST preserve `investigation_id` and, when applicable, `instrumentation_id` rather than minting surface-local debug identities that cannot be correlated later.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/orchestrator-subagent-integration.md

## INV-019 -- Runtime identity and blocked-policy continuity


### Rule

**Rule:** Canonical runtime identity and blocked-state policy MUST survive dispatch, restart recovery, approval, and usage attribution without being reminted or collapsed into provider-native aliases.
- `execution_role`, `requested_account_id`, requested/effective operational identity, and account-switch lineage remain part of the shared runtime packet and every blocked/recovery handoff.
- `blocked_sequence` is the canonical blocked-episode anchor; startup recovery rebinds unresolved blocked episodes to the preserved runtime identity instead of minting a new episode.
- DAE jail posture, approval posture, usage switch-history, and execution-role follow-through remain continuous across retries, resumes, restores, and recovered attempts.
- Cross-surface consumers reuse the frozen runtime `state-summary` instead of inventing local phrasing: `effective_health_state`, `effective_pressure_state`, and `effective_resolution_outcome` use the scheduler vocabulary and remain canonical effective-state fields even when Agent-Config, Health, Usage, or other surfaces show live current values.
- Runtime recovery invariants include safe-point vs restore-point boundaries, `graph-lock` non-degradation, `classification-before-policy`, `checkpoint-derived` projection freshness, and `attempt-boundary` identity freeze. `Plans/FileSafe.md` remains the DAE enforcement owner for post-approval arg mutation, `context_files` write-scope widening, `fail-open` initialization paths, and `recovery_options[]` vs `allowed_action_ids[]` schema drift; `Plans/MiscPlan.md` cleanup wording must not let best-effort prepare/cleanup invalidate safe-point prerequisites or let `mtime-based` evidence pruning cut across `attempt-lineage` retention.
- Runtime governance is a `governance-layer` invariant, not only UI/storage cleanup: `Plans/Decision_Policy.md` owns first-class concern / corroboration / promotion objects plus `/corroboration/promotion`, authority, and `/lifecycle` rules; `Plans/Permissions_System.md` consumes the stricter requested/effective identity model that `Plans/Contracts_V0.md` now makes canonical; and this document records scheduler lane ordering plus `mutation-safe-point` requirements.
- Cross-surface command wrappers remain route consumers, not runtime owners: `Plans/UI_Command_Catalog.md` entries such as `cmd.artifacts.show_in_ledger`, `cmd.artifacts.show_in_usage`, `cmd.orchestrator.open_in_source_control`, `cmd.orchestrator.open_in_github_actions`, `cmd.orchestrator.open_in_docker_manager`, and `cmd.panel.switch` may stay `navigation-like` wrappers only when they normalize through canonical route/runtime objects.
- `Plans/Run_Graph_View.md` must resolve its internal identity split before consumers treat it as runtime truth: older `tier_id` / `tier_type` detail panes, worker activity, verification streams, Usage links, and event correlation cannot compete with `scheduler_pass_id`, `blocked_sequence`, `safe_point_id`, and remediation lineage.
- Owner-level recovery invariants cover attempt immutability, `failure-vs-blocked` family separation, restore identity, projection authority, and shared `provider-pool` concurrency. `Plans/Executor_Protocol.md`, `Plans/FileSafe.md`, and `Plans/MiscPlan.md` must not keep same-doc contradictions around attempt reuse, DAE/FileSafe authority, `cleanup-vs-safe-point` validity, or blocked-recovery payload fields.
- Cross-surface navigation and usage consumers must demote `tier_id` from route identity and realign around runtime object routing plus canonical `usage-event` identity. `tier_id` may survive only as derived display/grouping compatibility metadata.
- `Plans/Run_Graph_View.md` and `Plans/Runtime_Artifacts_Panel.md` remain required consumers for concrete receipt/usage identity, `projection-trust` hooks, producer identity, trust/provenance, and stronger `cross-surface` linkage; runtime artifact or graph consumers must not replace those hooks with local pivots.
- Strong stale consumers for this runtime identity cluster are `Plans/Run_Graph_View.md` and `Plans/Orchestrator_Page.md`; their mirrors must reconcile to these invariants instead of preserving stale tier-era aggregation or route-local identity.
- Route transport invariants keep `resume_url` as serialized transport only. Attention flows, general-purpose search, and cross-surface pivots MUST resolve through canonical `route_target` / subject identity first; a URL may carry that target but must not be stronger or more exact than the owner route contract.
- `runtime-object-first` identity starts from `node_id`, `attempt_id`, `blocked_reason_code`, scheduler lane dispatch order, and safe points; policy, `/HITL/permission`, and approval docs must not fall back to stale tier context or looser ownership terms when evaluating blocked policy, permission state, or owner authority.
- Strong Orchestrator route consumers include `Plans/assistant-chat-design.md`, `/assistant-chat-design.md`, `Plans/Orchestrator_Page.md`, and `/Orchestrator_Page.md`; their UI surface / IA, execution model / state machine, cross-surface lineage and receipts, and recovery / rollback / blocked-state behavior must reconcile before local pages publish independent Orchestrator semantics.
- `resume_url` remains a `deep-link` transport: keep human-meaningful deep-link URLs for `/resume` and recovery, but normalize decoded payloads into the same cross-surface route contract used by in-app search, command routing, attention/CtA `/CtA` restoration, and `route-target` / highest-value focus recovery.
- `bridged-provider` normalized events require a versioned correlation block with actor/thread/attempt/lineage refs, including `/thread/attempt/lineage` refs, so provider events can join runtime identity without shadowing scheduler, HITL, permission, or usage ownership.
- Classification for cross-surface content identity belongs in `Plans/Contracts_V0.md` / `Contracts_V0`: `subject_id` remains frozen to the two canonical families until a new `cross-surface` content identity proves necessary, and `orchestrator.receipt` remains the cross-surface bridge record rather than a substitute for those identity families.
- `Plans/WorktreeGitImprovement.md` / `WorktreeGitImprovement.md` already contains the correct source-control surface boundary; the stale part is the identity anchor, not the product boundary, so worktree and Source Control surfaces must retarget to runtime route identity without reopening the product boundary.
- Consumer docs must not mix canonical blocked/scheduler/remediation lineage or `/scheduler/remediation` lineage with legacy `tier-event` push streams; blocked, scheduler, remediation, and tier-era event projections must all resolve through preserved runtime identity before surfacing status.
- Runtime/chat boundaries must avoid `over-unify` behavior that treats builder/interview/chat or `/interview/chat` runs as orchestration objects, and avoid `under-unify` behavior that duplicates provider/account/runtime or `/account/runtime` identity logic for conversational flows.
- Route identity keeps `subject_id` sparse while `object_kind` carries most `cross-surface` identity work; new route consumers must prefer owner-defined object kinds over ad hoc route fields.
- Cross-cutting owner gaps remain invariant obligations until resolved by their owner docs: `/session` scope, safe-point cleanup ordering, OpenCode server/session limits, project/session browser ownership, attention-center ownership, `runtime-recovery` command family coverage, and plugin `/skill/formatter` runtime safety must not be republished as local consumer behavior.
- PM-managed worktree visibility is part of runtime identity: managed Unraid template repos, `live-run` artifact directories, and other PM-owned git or `/file` roots must appear through Source Control / Orchestrator worktree visibility contracts rather than hidden side roots.
- Reconciliation order is owner-first: owner docs and `rewrite-root` routing are repaired before primary stale consumers, and mirror `/checklist` followers only update after their owners settle.
- Usage and evidence families must move away from `tier-first` cross-surface correlation: Usage/Ledger navigation keeps usage-event identity primary, while runtime and graph inspectors keep node/attempt identity primary.
- Runtime `/governance` verification must be visible to numbered gates and `script-enforcement` tables; mandatory checks cannot remain real only in addendum prose while invisible to gate registries.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

## INV-020 -- Project-driven capability activation

**Rule:** Puppet Master MUST remain one extensible platform with project-driven capability activation, not separate hard-forked products or rigid personalities.

- The `bench-03` deep-dive benchmark signal is canonical as an architecture constraint: Puppet Master is one extensible platform whose capabilities activate from the current project context.
- Project-open detection/import MUST run explicitly before capability activation. It reads project signals such as language markers, framework files, build/run metadata, hosted-repository state, remote-host state, provider/runtime capability reports, and user overrides.
- Project capability packs/modules for language, framework, build, review, remote, LSP/search, and source-control behavior activate from those project signals. Ambiguity MUST be visible and overridable: when multiple plausible interpretations exist, Puppet Master shows the alternatives, records the chosen/default interpretation, and allows the user to override it rather than hiding the choice as implicit automation.
- Indexing and `external-model sync` are first-class background subsystems. While indexes warm up or external model/capability reports are still synchronizing, affected features MUST disclose reduced-capability/degraded-mode state instead of pretending full readiness. Indexes, sync snapshots, and remote caches MUST be bounded/reused so startup and large-workspace responsiveness are not dominated by repeated full rebuilds or full syncs.
- diff/review/hosted-repository workflows MUST live in the same shell as local editing. Source Control, hosted review state, editor markers, Problems, and Search may each keep their own owner boundaries, but they must compose inside the shared IDE shell rather than becoming separate ad hoc tools.
- Remote architecture MUST use a thin local client/launcher with backend attachment/version management. Remote projects are not treated as local projects with different paths: host identity, backend attachment, helper-binary version, connection health, and requested/effective capability state stay explicit.
- Plugin/module breadth and dynamic-loading dependency debt MUST remain visible in implementation planning. New modules are loaded lazily and scoped to activated capabilities; module activation must not create unbounded startup work, hidden dependency chains, or duplicate project-detection logic.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md

## INV-021 -- Dependency-driven seam reconciliation order

**Rule:** When research or reconciliation work is converted into implementation-ready Puppet Master decisions, the work proceeds seam-by-seam in dependency-driven order rather than by cosmetic sequencing or more broad benchmark collection.

- A seam walkthrough may resume from a reconciliation-ready state only to work through all seams explicitly and turn existing research into seam-by-seam implementation-ready PM decisions and reconciliation guidance.
- The canonical seam queue labels are `seam-shell-identity-routing`, `seam-editor-core`, `seam-diff-review-source-control`, `seam-file-manager`, `seam-search`, `seam-preview-browser`, `seam-lsp-indexing-autodetect`, `seam-ssh-remote`, `seam-terminal-runtime-environment`, `seam-cross-cutting`, and `seam-reconciliation-synthesis`. When session SQL or another queue store tracks these seams, it must preserve those labels and their owner mapping.
- The working order starts with shell/identity/routing because open/reveal/reuse/ownership rules constrain nearly every later seam. After that, Puppet Master locks editor mutation truth, diff/review ownership, file-manager operations, search, preview, LSP/indexing, remote behavior, terminal/runtime behavior, and finally cross-cutting system rules.
- Seam reconciliation must leave each seam with explicit owner docs, consumer docs, unresolved risk if any, and implementation-ready acceptance guidance before moving the seam out of reconciliation.
- Addressing cannot assume rigid `<phase>/<task>/<subtask>` paths when package/seam architecture is active. `Plans/Contracts_V0.md` and `Plans/Executor_Protocol.md` consumers must route by canonical package, seam, node, lane, and attempt identity rather than forcing every artifact or runtime address into the legacy path shape.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md

## INV-022 -- Service-bound native workbench architecture

**Rule:** Puppet Master MUST keep the native workbench responsive by separating typed UI identity, platform adapters, and service-registered background work instead of letting editor placement or path strings become implicit architecture.

- The fourth implementation-reference complete-platform cluster preserves `bench-01`, `bench-04`, `bench-09`, `bench-17`, `bench-21`, `bench-29`, and `bench-32` as research-lineage anchors for one architecture rule: the desktop editor, layered IDE, editor control, collaborative room model, and agent workbench references differ at the product layer but converge on service boundaries.
- The AI-wrapped workbench and fast browser execution loop cluster preserves `bench-10`, `bench-21`, `bench-30`, and `bench-09`: a Rust/Tauri code editor with AI, terminal, Git/LSP, and policy controls organized as focused workspace crates/services; service boundaries for project, terminal, VCS, AI, LSP, remote, and extensions; file-explorer ergonomics, context menus, and terminal cwd behavior as real UX constraints; an AI-first desktop wrapper on top of an upstream editor/workbench with codebase-context/chat/refactor positioning but startup/bootstrap, extension sync, login/account linking, and remote/WSL parity risks; tight editor-to-execution loops with language templates, custom input, sharing/export, and browser/API-dependent reliability and persistence fragility; and layered virtual filesystem abstractions plus shared selection/navigation models for Puppet Master's workspace/file-manager and IDE design.
- `bench-29` is also a collaborative-workspace constraint: multi-file room-based collaboration may combine file tree, tabs, presence, chat, run output, settings, and AI actions in one lightweight workspace, but Puppet Master must keep app/file/socket/settings/view state separated and treat remote cursors/selections as decoration/state overlays rather than canonical document content. Backend/runtime outages, weak persistence, and polish/styling regressions are trust risks, not cosmetic follow-up work.
- Editor/view responsiveness is latency-sensitive and must stay separate from heavier background work such as file walking, git, indexing, remote RPC, PTY/runtime, and provider-dispatched services. Puppet Master therefore uses local UI plus background worker/proxy separation where a service can block, fan out, or outlive a view.
- Git/SCM subprocess work is never an editor or UI hot-path dependency. Source Control and worktree services coalesce, budget, and project SCM refreshes in the background; editor/file surfaces consume those projections and request explicit revalidation before mutation instead of shelling out per keystroke, paint, or tree-row render.
- OS-facing behavior is its own seam. Open/reveal, dialogs, drag/drop, file watching, URL handoff, path normalization, and process/PTY integration require platform adapters rather than scattered per-view shortcuts.
- Resource identity is explicit and typed: workspace file, scratch/history/generated/remote/session-bound resource, and provider-owned runtime object identity are not inferred from view placement or path strings alone.
- Ignore handling, search/index walks, and tree visibility share one deliberate policy layer so File Manager, Search, LSP/indexing, Source Control, and preview surfaces cannot diverge silently.
- File watchers, remote file-change notifications, and provider update streams are invalidation signals, not authoritative state. Missed, coalesced, overflowed, or untrusted events trigger bounded reconciliation or rescan through the owning service before File Manager, Search, LSP, Source Control, or preview surfaces may mark affected projections current.
- Search/index storage follows `storage-isolation` and `no-secrets-in-storage`: the regex index, sparse n-gram postings, dirty layer, and remote/local cache projections keep project/cache boundaries explicit, honor mandatory secret-path exclusions, and persist derived search metadata rather than credential-bearing file contents. Remote non-Git Instant Grep uses `remote-build`, `local-query`, `remote-verify`: build index artifacts where files live, query transferred artifacts locally, and verify matches against remote authoritative content.
- File/open/search/undo/terminal/diff/preview routing uses service-registered/provider-based seams, with each command or open path resolving through an owner contract before touching editor state.
- The fleet-synthesis research-lineage status is retained as constraint evidence: all 30 benchmark target todos were complete in session SQL, `fleet-synthesis` was persisted in `research_summaries`, and the product consequence is one PM platform with project-driven capability activation, Rust-owned core services, Slint shell/workbench UI, reusable diff/review and source-canonical preview pipelines, and explicit degraded/indexing/remote/offline/requested-vs-effective state visibility.
- The final implementation-reference synthesis is retained as source-lineage evidence: the full 32-target implementation-reference fleet was complete in session SQL as `implementation_ref_findings` plus `implementation_ref_summaries`. Its product rule is firm: copy the native workbench with explicit service boundaries pattern, reinterpret thin-editor/wrapper and IDE-shell lessons as bounded implementation tactics inside a PM-native Rust + Slint architecture, and avoid DOM-first core architecture, browser/session identity as workspace truth, approximate diff/review, monolithic request-layer file-manager design, or hidden delegated-backend ownership of core workbench state.
- External engines and CLIs may be reused only as adapters inside PM-owned boundaries; they do not define identity, storage, search/indexing, diff/review, runtime/terminal, remote, ignore-policy, OS-routing, or editor-adjacent shell ownership. Requested-vs-effective state must stay explicit across `/bootstrap/runtime/indexing` seams so setup, runtime, and indexing degradation are visible instead of being hidden behind an imported workbench or CLI wrapper.
- Browser-specific implementation assumptions must not shape Puppet Master architecture even when they make fast demos easy. DOM roots, service-worker persistence, hidden file inputs, Blob downloads, localStorage identity, query-string routing, and browser-only clipboard/selection hacks are implementation details of thin-wrapper/browser-editor references, not product architecture. Evidence quality for those references must also stay visible: shallow clones and local inspection can strengthen source coverage, unauthenticated GitHub API rate limits can limit issue-history depth, and many thin-wrapper/browser-editor repos rely more on issue-history signals than on meaningful builds/tests or focused seam tests for the PM seams that matter.
- The shared Rust core owns typed resource identity, the buffer/text model, save/recovery/on-disk change transactions, watcher/invalidation normalization, ignore policy, search/indexing/autodetection, LSP brokering, the diff/review engine, preview session state, terminal/runtime state, the remote/session state machine, command routing, and persistence schemas.
- Platform adapters own native dialogs, OS open/reveal/trash behavior, drag/drop payload translation, watcher backend specifics, PTY/process hosting, keychain/credential access, path/symlink/case-sensitivity queries, clipboard/IME/accessibility bridge details, and browser/webview embedding where needed.
- Portable product ideas may be copied broadly, but Puppet Master must avoid direct adoption of thin-wrapper, Electron, or DOM-first implementation assumptions as if they were native workbench foundations.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md

## INV-023 -- Investigation lifecycle budgets are typed

**Rule:** Debug/investigation flows MUST record typed budget exhaustion rather than collapsing every stop into a generic failure or blocked state.

- Investigation lifecycle records may carry `budget_kind?` when a budget or loop guard contributes to stop, failure, cleanup, or attention-required handling.
- Allowed `budget_kind?` values are `target_discovery_attempts`, `prepare_attempts`, `instrumentation_passes`, `invasive_instrumentation_passes`, `fix_candidates`, `repro_attempts`, `verification_attempts`, `package_or_tool_installs`, `browser_scenario_branches`, `no_new_evidence_loops`, `active_temporary_instrumentation_lanes`, `cleanup_retries`, `attention_required_resume_cycles`, and `elapsed_wall_time`.
- Budget exhaustion keeps its own typed reason even when the visible lifecycle state becomes `failed`, `failed_cleanup`, or `attention_required`; retry, resume, and cleanup surfaces must preserve the exact `budget_kind?` that tripped.
- MVP default ceilings remain explicit in the investigation contract: `max_verification_attempts_per_fix_candidate = 2` and `max_package_or_tool_installs = 2` per investigation, with the named keys `max_verification_attempts_per_fix_candidate` and `max_package_or_tool_installs` persisted or exported when they affect stop/retry decisions.
- Only package or tool installs that persist beyond a single process lifetime count against `max_package_or_tool_installs`; ephemeral per-process installs may be logged as investigation context but do not consume the install budget.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

## INV-024 -- Debug Mode evidence planes stay explicit

**Rule:** Debug Mode MUST preserve the difference between local ephemeral investigation, hosted runtime verification, production/data-plane observability, assistant-session diagnostics, terminal/test observe loops, and DAP-grade interactive inspection.

- Devin-style bug-from-report playbooks and MCP-to-observability flows are production/data-plane examples: they may inform imported evidence and external observability adapters, but they are fleet telemetry rather than the local ephemeral probes PM uses for an in-worktree investigation. Reference URL: `https://docs.devin.ai/use-cases/gallery/fix-bug-from-report`.
- Replit-style hosted runtime + verification, including agent self-testing and console/Ask AI feedback, is a tight feedback loop but remains cloud-coupled; PM MUST NOT make desktop Debug Mode depend on hosted runtime ownership or a remote desktop extension log server.
- OSS agents such as OpenHands, SWE-agent / mini-swe-agent, Cline, Roo Code, Continue, and Aider mainly establish the terminal/test observe loop + edits pattern. Continue additionally contributes rich LLM interaction logging at PR level plus debugger/stack context threads; that still does not become Cursor-style packaged instrumentation server behavior. Reference URL: `https://github.com/continuedev/continue/issues/4619`.
- Research-grade directions such as InspectCoder / InspectWare (arXiv 2510.18327, OSS framework) point toward LLM-to-interactive-debugger loops using breakpoints, state inspection, and perturbations, closer to DAP-grade feedback than printf loops. `snooper-ai` and PySnooper-style trace-to-LLM flows remain trace alternatives, not replacements for DAP, browser, terminal, or imported-bundle target identity.
- Debug Mode is a chat/workflow overlay, not a new execution-posture enum. `Plans/assistant-chat-design.md` may expose Debug alongside Ask, Agent, Plan, and Deep Plan, while `Plans/Run_Modes.md` keeps runtime posture separate and shared tools stay debug-capable across Assistant, `/Orchestrator/Interview`, and other owner flows.
- Deep Plan is a single-threaded read-only planning overlay in the same posture model; selecting it does not create a sub-task inheritance path or widen child authority.
- Debug Mode is MVP only when it preserves existing authority boundaries: remote targets keep `/no-local-fallback`, requested `/effective` capability `/state` stays visible, and the drift-risk seams for `investigation_id`, `instrumentation_id`, storage, `/contracts/prompt`, permissions, and browser evidence are owned explicitly rather than inferred from a debug label.
- Any browser evidence auto-feed must be a visible attach `/bundle` contract and must not contradict the no hidden browser-to-chat injection rule. A browser-backed investigation can auto-feed bounded evidence only through visible Investigation Context state, consented attach/revoke affordances, and owner-routed browser capture events.
- In-scope tool-emitted evidence for an active investigation enters the Investigation Context as `active` unless redaction, trust, or `/truncation` policy forces a narrower state; out-of-scope evidence remains referenced or rejected instead of being silently injected.
- Debug verification heuristics included in exported or replayed investigation evidence carry `heuristic_version = debug_verify.v1`; future `debug_verify` tuning must increment or preserve `heuristic_version` so older bundles remain interpretable.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md

## INV-025 -- Provider profile isolation is not shared mutable state

**Rule:** CLI/provider profile mechanisms used for account separation MUST be treated as isolated runtime profiles unless an owner contract explicitly marks a PM-managed overlay as safely shareable.

- Cursor's `--user-data-dir` workaround is an isolated-profile mechanism, not shared mutable state; `user-data-dir` profile separation does not authorize sharing auth, cooldown, usage, session history, runtime cache, or telemetry state between accounts.
- PM-managed overlays such as instructions, projected PM skills, selected MCP/tool definitions, and selected plugins/extensions may be shared only when the provider/runtime contract explicitly allows safe projection and drift handling.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Permissions_System.md

## INV-026 -- Web/provider recovery consumers defer to owner contracts

**Rule:** Web, Firecrawl, provider, and recovery consumers MUST preserve owner boundaries instead of reintroducing stale local assumptions.

- `Plans/FileManager.md` consumes file/browser/rendering repairs and MUST NOT keep stale inline visualizer or terminal-action assumptions; `/browser/rendering` behavior stays routed through the browser/rendering owners and any terminal-action surface remains a consumer of terminal/runtime contracts.
- `Plans/FinalGUISpec.md` consumes Firecrawl billing and audit disclosure; credit-warning and audit-surface UI copy MUST defer to `Plans/Tools.md` for thresholds, provider billing exceptions, cache/routing disclosure, and web-operation audit payload ownership.
- HITL, `Plans/Wiring_Matrix.md`, `Plans/usage-feature.md`, `Plans/assistant-memory-subsystem.md`, `Plans/Widget_System.md`, `Plans/Architecture_Invariants.md`, and `Plans/DRY_Rules.md` remain consumers in the web/provider recovery map: HITL patterns consume the shared approval ladder and batch permission UX; Wiring Matrix carries `research_session` and web-tool wiring; Usage tracks Firecrawl credit model and `/billing`; Assistant Memory persists web research session context without owning provider semantics; Widget System adds only owner-approved card widget types; Architecture Invariants records provider architecture changes; DRY Rules owns external reference policy, including Part Q-style external-reference constraints.
- Consumer drift remains blocking even when owner docs exist: slash-command consumers, questionnaire consumers, provider `/multi-account/runtime-identity` consumers, and log/audit GUI consumers MUST be reconciled in the same packet as the repaired owner docs so stale local assumptions do not mislead implementation.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Architecture_Invariants.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### AI-001 - Architecture Invariants Retired Source-Preserving Bridge

```yaml
plan_unit_id: AI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: AI-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 116 because Architecture_Invariants-S0001
  through S0040 are covered by AI-002 through AI-067 or explicit structural and migration-coverage dispositions. AI-001 no
  longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained Architecture_Invariants PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- AI-002
- AI-003
- AI-004
- AI-005
- AI-006
- AI-007
- AI-008
- AI-009
- AI-010
- AI-011
- AI-012
- AI-013
- AI-014
- AI-015
- AI-016
- AI-017
- AI-018
- AI-019
- AI-020
- AI-021
- AI-022
- AI-023
- AI-024
- AI-025
- AI-026
- AI-027
- AI-028
- AI-029
- AI-030
- AI-031
- AI-032
- AI-033
- AI-034
- AI-035
- AI-036
- AI-037
- AI-038
- AI-039
- AI-040
- AI-041
- AI-042
- AI-043
- AI-044
- AI-045
- AI-046
- AI-047
- AI-048
- AI-049
- AI-050
- AI-051
- AI-052
- AI-053
- AI-054
- AI-055
- AI-056
- AI-057
- AI-058
- AI-059
- AI-060
- AI-061
- AI-062
- AI-063
- AI-064
- AI-065
- AI-066
- AI-067
unblocks: []
acceptance_criteria:
- AI-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 116.
- Architecture_Invariants-S0001 through S0043 coverage is owned by AI-002 through AI-067 or explicit structural, retired,
  and migration-coverage dispositions.
- AI-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0042
preserved_exact_tokens:
- AI-001
- Architecture Invariants Residual Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
- Original hash
negative_constraints:
- AI-001 must not re-own Architecture_Invariants-S0001 through S0040 after Phase 2B batch 116.
- AI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- AI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former AI-001 residual source-preserving bridge is retired by Phase 2B batch 116.
owner_boundary_notes:
- Fine-grained PlanUnits AI-002 through AI-067 carry product/source coverage for Architecture_Invariants-S0001 through S0040;
  S0041 and S0043 are structural/metadata dispositions.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs: []
```

### AI-002 - Document Governance And Invariant Scope

```yaml
plan_unit_id: AI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The document preserves compliance with DRY and Contracts references, Puppet Master naming, legacy-naming compatibility,
  deterministic-default policy, and the scope that architecture invariants MUST hold across all plans and implementations.
gui_related: false
gui_classification_reason: This unit covers document governance, naming, and invariant scope, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_governance_and_invariant_scope
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: document_governance_and_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0002
preserved_exact_tokens:
- Architecture Invariants (Canonical)
- Compliance
- Puppet Master
- legacy naming
- No open questions
- deterministic defaults
- 0. Scope
- Invariants are cross-cutting rules
- MUST hold across all plans and implementations
negative_constraints: []
compatibility_only_notes:
- If older naming exists, refer to it only as "legacy naming" and do not quote the older name.
stale_retired_dispositions: []
owner_boundary_notes:
- Architecture_Invariants.md owns cross-cutting invariant declarations while cited SSOT docs own their own contracts.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§1'
```

### AI-003 - Normalized Provider Tool Correlation

```yaml
plan_unit_id: AI-003
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Normalized provider streams require every tool_use to have exactly one matching tool_result by tool_use_id,
  with a versioned bridged-provider correlation block carrying actor, thread, attempt, and lineage references.
gui_related: false
gui_classification_reason: This unit covers provider stream correlation and event identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: normalized_provider_tool_correlation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: normalized_provider_tool_correlation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0003
preserved_exact_tokens:
- INV-001 -- Tool correlation integrity (normalized streams + persisted events)
- tool_use
- tool_result
- tool_use_id
- versioned correlation block
- actor/thread/attempt/lineage refs
- bridged-provider normalized events
negative_constraints:
- Every tool_use MUST have exactly one matching tool_result with the same tool_use_id; orphan tool events are prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- CLI_Bridged_Providers owns provider stream mapping while Architecture_Invariants owns the cross-cutting invariant.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md'
```

### AI-004 - Runtime And Route Identity Normalization

```yaml
plan_unit_id: AI-004
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime identity demotes tier_id from canonical execution correlation, preserves thread_id and correlation_id
  tracing, migrates raw local IDs to subject_id or object_kind/object_id, normalizes usage_event_ref as object_kind = usage_event,
  and keeps resume_url? as transport rather than canonical identity.
gui_related: false
gui_classification_reason: This unit covers runtime and route identity normalization, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_and_route_identity_normalization
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_route_identity_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0003
preserved_exact_tokens:
- tier_id
- thread_id
- correlation_id
- subject_id
- object_kind/object_id
- usage_event_ref
- object_kind = usage_event
- resume_url?
- Route-aware schema/gate/evidence extensions
negative_constraints:
- MUST NOT reuse persisted state when doing so would violate normalized subject, route, or destination identity constraints.
compatibility_only_notes:
- tier_id may survive as a human-readable grouping label or derived display/grouping compatibility metadata, not as canonical
  execution correlation.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime and route identity reconcile through Contracts_V0 RouteTarget/OpenSubject and owner-doc integrity, not isolated
  consumer pockets.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject'
```

### AI-005 - Persisted Canonical Tool Events

```yaml
plan_unit_id: AI-005
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Persisted event streams represent tool activity with canonical tool event types tool.invoked and tool.denied
  and include stable run_id plus thread_id correlation.
gui_related: false
gui_classification_reason: This unit covers persisted event stream identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persisted_canonical_tool_events
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: persisted_canonical_tool_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0003
preserved_exact_tokens:
- persisted event streams
- tool.invoked
- tool.denied
- run_id
- thread_id
negative_constraints:
- Persisted tool activity must not be represented by non-canonical event aliases that lose run_id and thread_id correlation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Contracts_V0.md'
```

### AI-006 - No Secrets In Persistent Storage

```yaml
plan_unit_id: AI-006
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Secrets, tokens, credentials, and private keys MUST NOT be written to seglog, redb, Tantivy, sparse n-gram
  artifacts except scrubbed derived content and project-relative paths, plaintext logs, evidence bundles, or state files;
  OS credential store is the only allowed persistence.
gui_related: false
gui_classification_reason: This unit covers storage security and persistence policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: no_secrets_in_persistent_storage
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: no_secrets_in_persistent_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0004
preserved_exact_tokens:
- INV-002 -- No secrets in persistent storage
- seglog event stream
- redb projections
- Tantivy indexes
- frequency_table.bin
- postings.bin
- lookup.bin
- file_map.bin
- index_meta.json
- OS credential store only
negative_constraints:
- Secrets (tokens, credentials, private keys) MUST NOT be written to persistent storage, logs, evidence bundles, or state
  files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, SchemaID:evidence.schema.json, PolicyRule:no_secrets_in_storage,
  ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
```

### AI-007 - UI SSOT Behavior Boundary

```yaml
plan_unit_id: AI-007
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: UI copy, buttons, and view behavior MUST be specified in canonical UI SSOT docs and the typed command layer;
  plan docs may reserve IDs but must not invent ad-hoc UI behaviors.
gui_related: true
gui_classification_reason: This unit governs UI copy, buttons, view behavior, and typed command layer ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_ssot_behavior_boundary
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_ssot_behavior_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0005
preserved_exact_tokens:
- INV-003 -- UI SSOT (no bespoke UI behavior)
- UI copy
- buttons
- view behavior
- canonical UI SSOT docs
- typed command layer
- ad-hoc UI behaviors
negative_constraints:
- Plan docs may reserve IDs but must not invent ad-hoc UI behaviors.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical UI SSOT docs and the typed command layer own UI behavior; Architecture_Invariants records the invariant.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand'
```

### AI-008 - UI Command Business Logic Boundary

```yaml
plan_unit_id: AI-008
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The UI layer dispatches stable UICommand IDs and MUST NOT execute business logic directly.
gui_related: true
gui_classification_reason: This unit governs UI command dispatch and the UI/business-logic boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_business_logic_boundary
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_command_business_logic_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0006
preserved_exact_tokens:
- INV-004 -- UI command boundary (no business logic in UI)
- UICommand
- stable UICommand IDs
- business logic directly
negative_constraints:
- The UI layer MUST NOT execute business logic directly.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md'
```

### AI-009 - Deterministic SSOT Ordering

```yaml
plan_unit_id: AI-009
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: When multiple candidates exist, tie-break ordering comes from the relevant domain SSOT list and no heuristic
  reordering is allowed.
gui_related: false
gui_classification_reason: This unit covers deterministic ordering policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: deterministic_ssot_ordering
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: deterministic_ssot_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0007
preserved_exact_tokens:
- INV-005 -- Deterministic ordering from SSOT lists
- paths
- names
- servers
- single SSOT list
- no heuristic reordering
negative_constraints:
- Heuristic reordering is prohibited when a relevant domain SSOT list owns tie-break order.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Provider, ContractName:Plans/CLI_Bridged_Providers.md'
```

### AI-010 - Provider Storage Isolation

```yaml
plan_unit_id: AI-010
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Providers and provider adapters emit normalized events or tool results and MUST NOT write directly to seglog,
  redb, Tantivy, sparse n-gram index files, or remote-cache state; PM-owned storage writers, projectors, and cache managers
  own persistence.
gui_related: false
gui_classification_reason: This unit covers provider/storage ownership boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_storage_isolation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: provider_storage_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0008
preserved_exact_tokens:
- INV-006 -- Providers are storage-isolated
- seglog
- redb
- Tantivy
- sparse n-gram index files
- remote-cache state
- normalized events
- tool results
- PM-owned storage writers
negative_constraints:
- Providers and provider adapters MUST NOT write directly to persistent storage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters own normalized emissions; PM-owned storage writers, projectors, and cache managers own persistence.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Provider, Primitive:SessionStore, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md'
```

### AI-011 - No Stringly Typed IDs Outside SSOT

```yaml
plan_unit_id: AI-011
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Stable IDs such as Tool IDs, UICommand IDs, ConfigKey names, and schema IDs are defined once in their SSOT
  and referenced everywhere else instead of being reinvented as ad-hoc string literals.
gui_related: false
gui_classification_reason: This unit covers identifier governance and DRY ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: no_stringly_typed_ids_outside_ssot
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: no_stringly_typed_ids_outside_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0009
preserved_exact_tokens:
- INV-007 -- No stringly-typed IDs outside SSOT
- Tool IDs
- UICommand IDs
- ConfigKey names
- schema IDs
- ad-hoc string literals
- defined once
- SSOT
negative_constraints:
- Stable IDs MUST NOT be re-invented as ad-hoc string literals in multiple places.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### AI-012 - GitHub Operations Are API Only

```yaml
plan_unit_id: AI-012
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: GitHub hosting, auth, repo, fork, and PR operations use the GitHub HTTPS API only; the GitHub CLI gh MUST
  NOT be used for these operations.
gui_related: false
gui_classification_reason: This unit covers GitHub API integration policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_operations_are_api_only
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: github_operations_api_only
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0010
preserved_exact_tokens:
- INV-008 -- GitHub operations are API-only
- GitHub hosting/auth/repo/fork/PR operations
- GitHub HTTPS API
- GitHub CLI
- gh
negative_constraints:
- The GitHub CLI (`gh`) MUST NOT be used for GitHub hosting/auth/repo/fork/PR operations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-013 - Cursor Transport Provider Facade

```yaml
plan_unit_id: AI-013
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Cursor supports stream-json and ACP transports behind one Provider facade, and consumers MUST NOT branch on
  transport type.
gui_related: false
gui_classification_reason: This unit covers provider transport abstraction, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cursor_transport_provider_facade
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: cursor_transport_provider_facade
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0011
preserved_exact_tokens:
- INV-009 -- Cursor transport is invisible to consumers
- stream-json
- ACP
- Provider facade
- transport type
negative_constraints:
- Consumers MUST NOT branch on transport type.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/CLI_Bridged_Providers.md'
```

### AI-014 - Platform Naming Compliance

```yaml
plan_unit_id: AI-014
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The platform name is Puppet Master only, and older naming is referenced only as legacy naming without quoting
  the older name.
gui_related: false
gui_classification_reason: This unit covers platform naming policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_naming_compliance
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: platform_naming_compliance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0012
preserved_exact_tokens:
- INV-010 -- Platform naming compliance
- Puppet Master
- legacy naming
- without quoting the older name
negative_constraints: []
compatibility_only_notes:
- Any older naming must be referred to only as legacy naming without quoting the older name.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:Glossary'
```

### AI-015 - UI Command Dispatch Rule One

```yaml
plan_unit_id: AI-015
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Command ownership follows mutation domain rather than menu location, and the UI layer dispatches only typed
  UICommand envelopes for non-trivial behavior without calling backend services, storage, domain logic, or provider integrations
  directly.
gui_related: true
gui_classification_reason: This unit governs interactive UI command dispatch and user-initiated interaction routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_dispatch_rule_one
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_command_dispatch_rule_one
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0013
preserved_exact_tokens:
- INV-011 -- UI command dispatch only (Rule 1)
- Add to Assistant Chat
- cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }
- cmd.file
- cmd.terminal.open
- cmd.terminal.show
- typed UICommand envelopes
- UI Command Dispatcher boundary
negative_constraints:
- The UI MUST NOT call backend services, storage, domain logic, or provider integrations directly.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Command ownership follows mutation domain, not menu location.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-1, ContractName:Plans/Contracts_V0.md#7-uicommand,
  ContractName:Plans/UI_Command_Catalog.md'
```

### AI-016 - Wiring Matrix Rule Two Coverage

```yaml
plan_unit_id: AI-016
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: UI command coverage keeps the command catalog, wiring matrix, examples, and templates mechanically consistent
  so catalog examples, command templates, and wiring rows cannot drift into miswired surfaces.
gui_related: true
gui_classification_reason: This unit governs UI command catalog and wiring matrix consistency for interactive surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_rule_two_coverage
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: wiring_matrix_rule_two_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0014
preserved_exact_tokens:
- INV-012 -- Wiring matrix coverage (Rule 2)
- Plans/UI_Command_Catalog.md
- command/catalog/template/example integrity
- catalog examples
- command templates
- wiring rows
- miswired
negative_constraints:
- Command catalog, wiring matrix, examples, and templates must not drift from each other.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs: []
```

### AI-017 - Pre Dispatch Tool Validation

```yaml
plan_unit_id: AI-017
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: policy.may_execute_tool() is required for every tool dispatch at every nesting depth, regardless of child-run,
  plugin path, provider surface, or shell bridge; direct calls to tool implementations without this permission gate are prohibited.
gui_related: false
gui_classification_reason: This unit covers permission/tool dispatch enforcement, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pre_dispatch_tool_validation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: pre_dispatch_tool_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0015
preserved_exact_tokens:
- INV-013 -- Pre-dispatch tool validation
- policy.may_execute_tool()
- every tool dispatch
- every nesting depth
- child-run
- plugin path
- provider surface
- shell bridge
- direct calls
negative_constraints:
- No child-run, plugin path, provider surface, or shell bridge may bypass policy.may_execute_tool().
- Direct calls to tool implementations without this permission gate are prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md'
- 'ContractRef: Invariant:INV-013, ContractName:Plans/Architecture_Invariants.md'
```

### AI-018 - Shared Mutable State Lock Invariant

```yaml
plan_unit_id: AI-018
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Any mutable data structure shared across threads or async tasks requires RwLock, RWMutex, or equivalent protection;
  lock-free approaches require formal justification, and silent data races are prohibited, including permission state mutations
  in Permissions_System EXEC paths.
gui_related: false
gui_classification_reason: This unit covers concurrency and mutable state safety, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shared_mutable_state_lock_invariant
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: shared_mutable_state_lock_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0017
preserved_exact_tokens:
- INV-014 -- Shared mutable state requires RWMutex
- RwLock
- RWMutex
- lock-free
- formally justified
- Silent data races
- Permission state mutations
- Permissions_System
negative_constraints:
- Silent data races are prohibited.
- Lock-free approaches are allowed only when formally justified.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: Invariant:INV-014'
```

### AI-019 - Monetary Values Are Microdollars

```yaml
plan_unit_id: AI-019
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Persisted and in-memory monetary cost values are stored and accumulated as integer microdollars u64; float
  storage is forbidden, cost_usd is display-derived only, and linting rejects f64/f32 fields named cost*, price*, or amount*
  in persisted structs.
gui_related: false
gui_classification_reason: This unit covers usage/cost data representation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: monetary_values_are_microdollars
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: monetary_values_are_microdollars
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0019
preserved_exact_tokens:
- INV-015 -- Monetary values are integer microdollars
- integer microdollars
- u64
- Float types
- cost_usd
- cost_microdollars / 1_000_000
- clippy
- cost*
- price*
- amount*
negative_constraints:
- Float types MUST NOT be used for cost storage or accumulation at any layer.
- cost_usd is derived display copy only and never a persisted billing field.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: Invariant:INV-015'
```

### AI-020 - Token Buckets Are Not Storage Aggregated

```yaml
plan_unit_id: AI-020
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Usage records store input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, and
  reasoning_tokens individually, derive total_tokens without losing bucket detail, and prohibit pre-aggregation or collapsing
  at the storage or event layer.
gui_related: false
gui_classification_reason: This unit covers usage event/storage schema, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: token_buckets_are_not_storage_aggregated
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: token_buckets_not_storage_aggregated
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0021
preserved_exact_tokens:
- INV-016 -- Token fields are never aggregated at storage layer
- input_tokens
- output_tokens
- cache_read_input_tokens
- cache_creation_input_tokens
- reasoning_tokens
- total_tokens
- token-bucket
- AGGREGATES
negative_constraints:
- Pre-aggregation or collapsing at the storage or event layer is prohibited.
- Provider records that AGGREGATES into fewer persisted DB fields are non-canonical.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: Invariant:INV-016'
```

### AI-021 - FileSafe Atomic Mutation Pattern

```yaml
plan_unit_id: AI-021
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: All FileSafe-managed writes use temp file, fsync, and rename, while managed rewrites capture read_revision,
  re-check before promote, and abort with concurrent_edit_conflict on drift; non-atomic writes and missing safety paths are
  prohibited.
gui_related: false
gui_classification_reason: This unit covers FileSafe mutation safety, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: filesafe_atomic_mutation_pattern
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: filesafe_atomic_mutation_pattern
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0022
preserved_exact_tokens:
- INV-017 -- File mutations are atomic (temp-fsync-rename)
- temp file
- fsync
- rename
- os.WriteFile
- read_revision
- concurrent_edit_conflict
- MUST CHANGE
negative_constraints:
- Direct os.WriteFile or equivalent non-atomic write calls MUST NOT be used for managed files.
- Any missing path is a MUST CHANGE item, not an implementation preference.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: Invariant:INV-017'
```

### AI-022 - Seglog CRC32 Recovery

```yaml
plan_unit_id: AI-022
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Every seglog record includes CRC32, every read validates the checksum, failed records are skipped with a recovery
  event, and silently processing corrupt records is prohibited.
gui_related: false
gui_classification_reason: This unit covers storage/seglog integrity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: seglog_crc32_recovery
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: seglog_crc32_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0024
preserved_exact_tokens:
- INV-018 -- Seglog CRC32 is mandatory
- CRC32 checksum
- every read
- recovery event
- corrupt record
negative_constraints:
- Silently processing a corrupt record is prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: Invariant:INV-018'
```

### AI-023 - Interactive Element Command Mapping

```yaml
plan_unit_id: AI-023
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Every interactive UI element maps to exactly one UICommandID, the mapping is recorded in the wiring matrix,
  every catalog UICommandID has a registered handler, and missing wiring entries or handlers are prohibited.
gui_related: true
gui_classification_reason: This unit governs interactive UI element mapping, wiring matrix coverage, and handlers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interactive_element_command_mapping
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: interactive_element_command_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0024
preserved_exact_tokens:
- Every interactive UI element
- exactly one UICommandID
- wiring matrix
- Plans/Wiring_Matrix.schema.json
- registered handler
- No interactive element
- no catalog command
negative_constraints:
- No interactive element may exist without a wiring matrix entry; no catalog command may lack a handler.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/UI_Wiring_Rules.md#section-2, SchemaID:Wiring_Matrix.schema.json,
  Gate:GATE-010'
```

### AI-024 - Contract Driven Code Generation

```yaml
plan_unit_id: AI-024
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Plans/*.schema.json files are canonical sources for validation and optional code generation, and generated
  Rust code lives under one generated/ boundary that is not hand-edited.
gui_related: false
gui_classification_reason: This unit covers schema/codegen DRY policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: contract_driven_code_generation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: contract_driven_code_generation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0025
preserved_exact_tokens:
- Contract-driven code generation (lightweight; DRY)
- Plans/*.schema.json
- canonical source
- validation
- code generation
- generated/
- MUST NOT be hand-edited
negative_constraints:
- Generated Rust code MUST live under a single generated/ boundary and MUST NOT be hand-edited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- 'ContractRef: Primitive:Invariant, PolicyRule:Decision_Policy.md§2'
```

### AI-025 - GATE 003 Non UI Invariant Checks

```yaml
plan_unit_id: AI-025
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: GATE-003 validates schemas and enforces INV-008 GitHub API-only operations and INV-010 naming compliance in
  Plans and relevant implementation surfaces.
gui_related: false
gui_classification_reason: This unit covers non-UI automated governance checks, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gate_003_non_ui_invariant_checks
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: gate_003_non_ui_invariant_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0026
preserved_exact_tokens:
- Validation (gated; autonomous)
- GATE-003
- Validate schemas
- plan graph
- evidence
- change budget
- auto decisions
- INV-008
- GitHub CLI usage
- INV-010
- naming compliance
negative_constraints:
- GitHub CLI usage must be enforced out of build-governing docs and implementation surfaces where INV-008 applies.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Gate:GATE-001'
- 'ContractRef: Invariant:INV-008'
- 'ContractRef: Invariant:INV-010'
- 'ContractRef: Gate:GATE-003'
```

### AI-026 - GATE 003 UI Invariant Checks

```yaml
plan_unit_id: AI-026
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: GATE-003 enforces INV-011 by verifying no UI code directly calls backend, storage, or provider modules, and
  enforces INV-012 plus GATE-010 wiring coverage for UICommandID handlers and interactive element wiring entries.
gui_related: true
gui_classification_reason: This unit governs UI static analysis/import-graph checks and wiring coverage gates.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gate_003_ui_invariant_checks
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: gate_003_ui_invariant_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0026
preserved_exact_tokens:
- INV-011
- no UI code directly calls backend/storage/provider modules
- static analysis
- import-graph check
- INV-012
- wiring matrix coverage
- every UICommandID
- handler entry
- every interactive element
- GATE-010
negative_constraints:
- UI code must not directly call backend/storage/provider modules when enforcing INV-011.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-011'
- 'ContractRef: Invariant:INV-012, Gate:GATE-010'
- 'ContractRef: Gate:GATE-003'
```

### AI-027 - Debug Overlay Is Not Runtime Mode

```yaml
plan_unit_id: AI-027
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The Debug addendum preserves that debug exists only in overlay identity and UI label state; the canonical
  runtime-mode enum remains ask, plan, regular, and yolo.
gui_related: true
gui_classification_reason: This unit covers UI label state and debug overlay presentation semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_overlay_is_not_runtime_mode
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_overlay_not_runtime_mode
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0028
preserved_exact_tokens:
- Debug investigation invariants addendum (2026-03-23)
- Invariant A -- Debug overlay is not a runtime mode
- debug
- overlay identity
- UI label state
- ask | plan | regular | yolo
negative_constraints:
- debug MUST exist only in overlay identity and UI label state; it must not become a runtime-mode enum value.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md'
```

### AI-028 - Visible Evidence Ingress Only

```yaml
plan_unit_id: AI-028
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Automatically collected Debug evidence becomes visible Investigation Context or Runtime Artifacts state, and
  PM MUST NOT rely on hidden prompt-only evidence injection for browser or debug payloads.
gui_related: false
gui_classification_reason: This unit covers evidence ingress and prompt/storage boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_evidence_ingress_only
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: visible_evidence_ingress_only
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0029
preserved_exact_tokens:
- Invariant B -- Visible evidence ingress only
- Automatically collected Debug evidence
- Investigation Context
- Runtime Artifacts state
- hidden prompt-only evidence injection
- browser/debug payloads
negative_constraints:
- PM MUST NOT rely on hidden prompt-only evidence injection for browser/debug payloads.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
```

### AI-029 - Cross Surface Investigation Identity

```yaml
plan_unit_id: AI-029
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Any surface that participates in debugging preserves investigation_id and optional instrumentation_id instead
  of minting uncorrelatable surface-local debug identities.
gui_related: false
gui_classification_reason: This unit covers investigation identity correlation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_surface_investigation_identity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: cross_surface_investigation_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0030
preserved_exact_tokens:
- Invariant C -- Cross-surface investigation identity
- investigation_id
- instrumentation_id
- surface-local debug identities
- correlated later
negative_constraints:
- Participating debug surfaces must not mint surface-local debug identities that cannot be correlated later.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/orchestrator-subagent-integration.md'
```

### AI-030 - Runtime Identity Packet Continuity

```yaml
plan_unit_id: AI-030
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Canonical runtime identity and blocked-state policy survive dispatch, restart recovery, approval, and usage
  attribution; execution_role, requested_account_id, requested/effective operational identity, account-switch lineage, blocked_sequence,
  DAE jail posture, approval posture, usage switch-history, and execution-role follow-through remain continuous across retries,
  resumes, restores, and recovered attempts.
gui_related: false
gui_classification_reason: This unit covers runtime identity packet continuity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_packet_continuity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_identity_packet_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- INV-019 -- Runtime identity and blocked-policy continuity
- execution_role
- requested_account_id
- requested/effective operational identity
- account-switch lineage
- blocked_sequence
- DAE jail posture
- approval posture
- usage switch-history
- execution-role follow-through
negative_constraints:
- Canonical runtime identity and blocked-state policy MUST survive dispatch, restart recovery, approval, and usage attribution
  without being reminted or collapsed into provider-native aliases.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-031 - Frozen Runtime State Summary Consumers

```yaml
plan_unit_id: AI-031
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Cross-surface consumers reuse frozen runtime state-summary fields effective_health_state, effective_pressure_state,
  and effective_resolution_outcome with scheduler vocabulary instead of inventing local phrasing.
gui_related: true
gui_classification_reason: This unit governs user-visible cross-surface state phrasing and status display fields.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: frozen_runtime_state_summary_consumers
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: frozen_runtime_state_summary_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- state-summary
- effective_health_state
- effective_pressure_state
- effective_resolution_outcome
- scheduler vocabulary
- Agent-Config
- Health
- Usage
- live current values
negative_constraints:
- Cross-surface consumers must not invent local phrasing for frozen runtime state-summary fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-032 - Recovery Safe Points And Owner Constraints

```yaml
plan_unit_id: AI-032
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime recovery preserves safe-point versus restore-point boundaries, graph-lock non-degradation, classification-before-policy,
  checkpoint-derived projection freshness, attempt-boundary identity freeze, FileSafe DAE ownership, MiscPlan cleanup constraints,
  attempt immutability, failure-vs-blocked separation, restore identity, projection authority, and provider-pool concurrency.
gui_related: false
gui_classification_reason: This unit covers recovery and owner-contract invariants, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: recovery_safe_points_and_owner_constraints
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: recovery_safe_points_owner_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- safe-point vs restore-point
- graph-lock
- classification-before-policy
- checkpoint-derived
- attempt-boundary
- Plans/FileSafe.md
- context_files
- fail-open
- recovery_options[]
- allowed_action_ids[]
- mtime-based
- attempt-lineage
- provider-pool
negative_constraints:
- Owner docs must not keep same-doc contradictions around attempt reuse, DAE/FileSafe authority, cleanup-vs-safe-point validity,
  or blocked-recovery payload fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileSafe remains the DAE enforcement owner for post-approval arg mutation, context_files write-scope widening, fail-open
  initialization paths, and recovery_options[] vs allowed_action_ids[] schema drift.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-033 - Runtime Governance Layer And Gate Visibility

```yaml
plan_unit_id: AI-033
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime governance is a governance-layer invariant with Decision_Policy, Permissions_System, Contracts_V0,
  scheduler lane ordering, and mutation-safe-point ownership, and runtime /governance verification must be visible to numbered
  gates and script-enforcement tables.
gui_related: false
gui_classification_reason: This unit covers governance and validation surfaces, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_governance_layer_and_gate_visibility
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_governance_layer_gate_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- governance-layer
- Plans/Decision_Policy.md
- corroboration
- promotion
- Plans/Permissions_System.md
- requested/effective identity model
- scheduler lane ordering
- mutation-safe-point
- Runtime /governance
- numbered gates
- script-enforcement tables
negative_constraints:
- Mandatory runtime governance checks cannot remain real only in addendum prose while invisible to gate registries.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Decision_Policy owns concern, corroboration, promotion, authority, and lifecycle rules consumed by runtime governance.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-034 - Route Consuming Command Wrappers

```yaml
plan_unit_id: AI-034
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Cross-surface UI command wrappers such as artifact, orchestrator, and panel-switch commands remain navigation-like
  route consumers only when they normalize through canonical route/runtime objects rather than publishing local runtime semantics.
gui_related: true
gui_classification_reason: This unit governs UI command wrappers and navigation-like route consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_consuming_command_wrappers
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: route_consuming_command_wrappers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- cmd.artifacts.show_in_ledger
- cmd.artifacts.show_in_usage
- cmd.orchestrator.open_in_source_control
- cmd.orchestrator.open_in_github_actions
- cmd.orchestrator.open_in_docker_manager
- cmd.panel.switch
- navigation-like
- canonical route/runtime objects
negative_constraints:
- Local pages must not publish independent Orchestrator or runtime semantics before route consumers reconcile through canonical
  route/runtime objects.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-035 - Graph Artifact Stale Consumer Reconciliation

```yaml
plan_unit_id: AI-035
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Run Graph and Runtime Artifacts remain required consumers for receipt/usage identity, projection-trust hooks,
  producer identity, trust/provenance, and cross-surface linkage, while stale tier-era mirrors in Run_Graph_View and Orchestrator_Page
  must reconcile before surfacing runtime truth.
gui_related: true
gui_classification_reason: This unit covers user-visible graph/artifact consumers and stale runtime display reconciliation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: graph_artifact_stale_consumer_reconciliation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: graph_artifact_stale_consumer_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- Plans/Run_Graph_View.md
- Plans/Runtime_Artifacts_Panel.md
- receipt/usage identity
- projection-trust
- producer identity
- trust/provenance
- cross-surface linkage
- Plans/Orchestrator_Page.md
- stale tier-era aggregation
negative_constraints:
- Runtime artifact or graph consumers must not replace receipt/usage identity, projection-trust, producer identity, trust/provenance,
  or cross-surface hooks with local pivots.
compatibility_only_notes: []
stale_retired_dispositions:
- Strong stale consumers for this runtime identity cluster are Plans/Run_Graph_View.md and Plans/Orchestrator_Page.md; their
  mirrors must reconcile to these invariants.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-036 - Route Transport And Object Kind Identity

```yaml
plan_unit_id: AI-036
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: resume_url remains serialized deep-link transport only; attention flows, search, command routing, CtA restoration,
  and route-target recovery resolve through canonical route_target or subject identity first, tier_id is only derived compatibility
  metadata, and object_kind carries most cross-surface identity work.
gui_related: true
gui_classification_reason: This unit affects user-visible navigation, search, attention, CtA, and route restoration behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_transport_and_object_kind_identity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: route_transport_object_kind_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- resume_url
- deep-link
- route_target
- subject identity
- /CtA
- route-target
- highest-value focus recovery
- tier_id
- object_kind
- cross-surface identity
negative_constraints:
- A URL may carry a target but must not be stronger or more exact than the owner route contract.
- New route consumers must prefer owner-defined object kinds over ad hoc route fields.
compatibility_only_notes:
- tier_id may survive only as derived display/grouping compatibility metadata.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-037 - Bridged Provider And Content Identity Contracts

```yaml
plan_unit_id: AI-037
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Bridged-provider normalized events require a versioned correlation block with actor, thread, attempt, and
  lineage refs; subject_id remains frozen to canonical families until a new cross-surface content identity is proven, and
  orchestrator.receipt remains a bridge record rather than an identity substitute.
gui_related: false
gui_classification_reason: This unit covers provider/content identity contracts, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: bridged_provider_and_content_identity_contracts
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: bridged_provider_content_identity_contracts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- bridged-provider
- versioned correlation block
- actor/thread/attempt/lineage refs
- /thread/attempt/lineage
- subject_id
- cross-surface content identity
- orchestrator.receipt
- bridge record
negative_constraints:
- orchestrator.receipt must not substitute for canonical cross-surface identity families.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-038 - Worktree Source Control Runtime Visibility

```yaml
plan_unit_id: AI-038
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: WorktreeGitImprovement already owns the source-control product boundary, and worktree plus Source Control
  surfaces retarget stale identity anchors to runtime route identity while PM-managed worktree roots appear through Source
  Control / Orchestrator visibility contracts instead of hidden side roots.
gui_related: true
gui_classification_reason: This unit governs Source Control and Orchestrator user-visible worktree visibility.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_source_control_runtime_visibility
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: worktree_source_control_runtime_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- Plans/WorktreeGitImprovement.md
- WorktreeGitImprovement.md
- source-control surface boundary
- identity anchor
- runtime route identity
- PM-managed worktree visibility
- managed Unraid template repos
- live-run artifact directories
- Source Control / Orchestrator
negative_constraints:
- PM-owned git or /file roots must not remain hidden side roots outside Source Control / Orchestrator worktree visibility
  contracts.
compatibility_only_notes: []
stale_retired_dispositions:
- The stale part of WorktreeGitImprovement is the identity anchor, not the product boundary.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-039 - Legacy Tier Event And Usage Evidence Demotion

```yaml
plan_unit_id: AI-039
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Consumers must not mix canonical blocked, scheduler, remediation lineage, or /scheduler/remediation lineage
  with legacy tier-event push streams, and usage/evidence families move away from tier-first correlation toward usage-event
  or node/attempt identity as primary.
gui_related: true
gui_classification_reason: This unit affects user-visible status, usage, ledger, runtime, and graph inspection surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_tier_event_and_usage_evidence_demotion
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: legacy_tier_event_usage_evidence_demotion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- legacy `tier-event`
- blocked
- scheduler
- remediation
- /scheduler/remediation
- tier-first
- Usage/Ledger navigation
- usage-event identity
- runtime and graph inspectors
- node/attempt identity
negative_constraints:
- Consumer docs must not mix canonical blocked/scheduler/remediation lineage with legacy tier-event push streams.
compatibility_only_notes:
- Usage/evidence families must demote tier-first cross-surface correlation in favor of usage-event or node/attempt identity.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-040 - Runtime Chat Boundary And Owner First Repair

```yaml
plan_unit_id: AI-040
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Runtime/chat boundaries avoid over-unify and under-unify behavior, unresolved owner gaps remain owner obligations,
  and owner docs plus rewrite-root routing are repaired before primary stale consumers or checklist mirrors update.
gui_related: false
gui_classification_reason: This unit covers owner-first repair and runtime/chat boundary policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_chat_boundary_and_owner_first_repair
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: runtime_chat_boundary_owner_first_repair
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0032
preserved_exact_tokens:
- over-unify
- under-unify
- builder/interview/chat
- /interview/chat
- /account/runtime
- /session
- safe-point cleanup ordering
- OpenCode server/session limits
- project/session browser ownership
- attention-center ownership
- runtime-recovery
- plugin `/skill/formatter`
- rewrite-root
- /checklist
negative_constraints:
- Runtime/chat boundaries must avoid over-unify and under-unify behavior.
- Cross-cutting owner gaps must not be republished as local consumer behavior.
compatibility_only_notes: []
stale_retired_dispositions:
- Owner docs and rewrite-root routing are repaired before primary stale consumers, and mirror /checklist followers update
  only after owners settle.
owner_boundary_notes:
- Owner gaps remain invariant obligations until resolved by their owner docs.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### AI-041 - Project Activation Import And Visible Ambiguity

```yaml
plan_unit_id: AI-041
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: 'Puppet Master remains one extensible platform with project-driven capability activation: project-open detection/import
  runs before activation, project signals drive language/framework/build/review/remote/LSP/search/source-control capability
  packs, and ambiguous interpretations are visible, recorded, and overridable.'
gui_related: true
gui_classification_reason: This unit affects user-visible project activation, alternatives, defaults, and override behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_activation_import_and_visible_ambiguity
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: project_activation_import_visible_ambiguity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0033
preserved_exact_tokens:
- INV-020 -- Project-driven capability activation
- bench-03
- one extensible platform
- Project-open detection/import
- language markers
- framework files
- build/run metadata
- hosted-repository state
- remote-host state
- capability packs/modules
- Ambiguity MUST be visible and overridable
negative_constraints:
- Puppet Master MUST remain one extensible platform, not separate hard-forked products or rigid personalities.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md,
  ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md'
```

### AI-042 - Index Sync Degraded State And Shared Shell Workflow

```yaml
plan_unit_id: AI-042
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Indexing and external-model sync are first-class bounded background subsystems that disclose reduced-capability/degraded-mode
  state while warming, and diff/review/hosted-repository workflows compose inside the shared IDE shell rather than becoming
  separate ad hoc tools.
gui_related: true
gui_classification_reason: This unit affects user-visible readiness, degraded-mode disclosure, and IDE shell workflow composition.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: index_sync_degraded_state_and_shared_shell_workflow
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: index_sync_degraded_state_shared_shell
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0033
preserved_exact_tokens:
- Indexing
- external-model sync
- reduced-capability/degraded-mode state
- bounded/reused
- startup
- large-workspace responsiveness
- diff/review/hosted-repository workflows
- same shell
- Source Control
- Problems
- Search
negative_constraints:
- Affected features must not pretend full readiness while indexes or external model/capability reports are still synchronizing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md,
  ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md'
```

### AI-043 - Remote Attachment And Lazy Module Activation

```yaml
plan_unit_id: AI-043
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Remote projects use a thin local client/launcher with backend attachment and version management, while plugins/modules
  load lazily and stay scoped to activated capabilities without unbounded startup work, hidden dependency chains, or duplicate
  project-detection logic.
gui_related: false
gui_classification_reason: This unit covers remote/module architecture and startup dependency policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: remote_attachment_and_lazy_module_activation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: remote_attachment_lazy_module_activation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0033
preserved_exact_tokens:
- Remote architecture
- thin local client/launcher
- backend attachment/version management
- host identity
- helper-binary version
- connection health
- requested/effective capability state
- Plugin/module breadth
- dynamic-loading dependency debt
- loaded lazily
- unbounded startup work
- duplicate project-detection logic
negative_constraints:
- Module activation must not create unbounded startup work, hidden dependency chains, or duplicate project-detection logic.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md,
  ContractName:Plans/storage-plan.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/BinaryLocator_Spec.md'
```

### AI-044 - Dependency Driven Seam Reconciliation Order

```yaml
plan_unit_id: AI-044
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Reconciliation work converts research into implementation-ready decisions seam-by-seam in dependency-driven
  order, preserving canonical seam labels, owner mapping, shell/identity/routing first, explicit owner docs, consumer docs,
  unresolved risk, acceptance guidance, and package/seam/node/lane/attempt addressing instead of rigid phase/task/subtask
  paths.
gui_related: false
gui_classification_reason: This unit covers planning/reconciliation order and addressing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dependency_driven_seam_reconciliation_order
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: dependency_driven_seam_reconciliation_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0034
preserved_exact_tokens:
- INV-021 -- Dependency-driven seam reconciliation order
- seam-shell-identity-routing
- seam-editor-core
- seam-diff-review-source-control
- seam-file-manager
- seam-search
- seam-preview-browser
- seam-lsp-indexing-autodetect
- seam-ssh-remote
- seam-terminal-runtime-environment
- seam-cross-cutting
- seam-reconciliation-synthesis
- <phase>/<task>/<subtask>
- package, seam, node, lane, and attempt identity
negative_constraints:
- Addressing cannot assume rigid <phase>/<task>/<subtask> paths when package/seam architecture is active.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Each seam must leave explicit owner docs, consumer docs, unresolved risk if any, and implementation-ready acceptance guidance
  before moving out of reconciliation.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-045 - Native Workbench Service Bound Evidence

```yaml
plan_unit_id: AI-045
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Puppet Master keeps a PM-native Rust plus Slint service-bound workbench architecture, preserving benchmark/research
  lineage for service boundaries, collaborative room constraints, degraded/indexing/remote/offline/requested-vs-effective
  state visibility, and the anti-delegated-core rule from implementation-reference synthesis.
gui_related: true
gui_classification_reason: This unit covers native workbench product architecture and Slint shell/workbench UI constraints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_workbench_service_bound_evidence
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: native_workbench_service_bound_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- INV-022 -- Service-bound native workbench architecture
- bench-01
- bench-04
- bench-09
- bench-17
- bench-21
- bench-29
- bench-32
- bench-10
- bench-30
- Rust/Tauri
- Slint shell/workbench UI
- fleet-synthesis
- research_summaries
- implementation_ref_findings
- implementation_ref_summaries
- 32-target implementation-reference fleet
- hidden delegated-backend ownership
negative_constraints:
- Puppet Master must avoid hidden delegated-backend ownership of core workbench state.
compatibility_only_notes: []
stale_retired_dispositions:
- Thin-editor/wrapper and IDE-shell lessons are bounded implementation tactics inside PM-native Rust + Slint architecture,
  not direct architecture foundations.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-046 - UI Responsiveness And Background Service Projections

```yaml
plan_unit_id: AI-046
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Editor/view responsiveness stays separate from heavier file walking, git, indexing, remote RPC, PTY/runtime,
  and provider services; Git/SCM subprocess work is never an editor or UI hot-path dependency, and editor/file surfaces consume
  coalesced background projections with explicit revalidation before mutation.
gui_related: true
gui_classification_reason: This unit governs UI/editor responsiveness, source-control projections, and user-visible file/editor
  surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_responsiveness_and_background_service_projections
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ui_responsiveness_background_service_projections
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- Editor/view responsiveness
- latency-sensitive
- file walking
- git
- indexing
- remote RPC
- PTY/runtime
- provider-dispatched services
- background worker/proxy
- Git/SCM subprocess
- UI hot-path dependency
- coalesce
- budget
- explicit revalidation
negative_constraints:
- Git/SCM subprocess work is never an editor or UI hot-path dependency.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Source Control and worktree services own SCM refresh projections; editor/file surfaces consume projections and request explicit
  revalidation before mutation.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-047 - Platform Adapter Seam

```yaml
plan_unit_id: AI-047
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: OS-facing behavior is an explicit platform adapter seam for open/reveal, dialogs, drag/drop, file watching,
  URL handoff, path normalization, process/PTY integration, native dialogs, trash behavior, keychain/credential access, symlink/case
  sensitivity, clipboard, IME, accessibility bridges, and browser/webview embedding.
gui_related: true
gui_classification_reason: This unit affects user-visible native OS integration, dialogs, drag/drop, clipboard, accessibility,
  and embedded browser/webview behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_adapter_seam
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: platform_adapter_seam
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- OS-facing behavior
- Open/reveal
- dialogs
- drag/drop
- file watching
- URL handoff
- path normalization
- process/PTY integration
- platform adapters
- native dialogs
- trash behavior
- keychain/credential access
- symlink
- case-sensitivity
- clipboard/IME/accessibility
- browser/webview embedding
negative_constraints:
- OS-facing behavior must not be implemented as scattered per-view shortcuts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-048 - Shared Rust Core Ownership

```yaml
plan_unit_id: AI-048
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: The shared Rust core owns typed resource identity, buffer/text model, save/recovery/on-disk transactions,
  watcher/invalidation normalization, ignore policy, search/indexing/autodetection, LSP brokering, diff/review engine, preview
  session state, terminal/runtime state, remote/session state machine, command routing, and persistence schemas.
gui_related: false
gui_classification_reason: This unit covers core service ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shared_rust_core_ownership
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: shared_rust_core_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- Resource identity
- workspace file
- scratch/history/generated/remote/session-bound resource
- provider-owned runtime object identity
- shared Rust core
- buffer/text model
- save/recovery/on-disk change transactions
- watcher/invalidation normalization
- ignore policy
- search/indexing/autodetection
- LSP brokering
- diff/review engine
- preview session state
- terminal/runtime state
- remote/session state machine
- command routing
- persistence schemas
negative_constraints:
- Resource identity must not be inferred from view placement or path strings alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The shared Rust core owns cross-surface core services while platform adapters own OS specifics.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-049 - Ignore Search Index Invalidation And Storage Isolation

```yaml
plan_unit_id: AI-049
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Ignore handling, search/index walks, and tree visibility share one deliberate policy layer; watchers, remote
  notifications, and provider streams are invalidation signals only; search/index storage follows storage-isolation and no-secrets-in-storage
  with remote-build, local-query, and remote-verify for remote non-Git Instant Grep.
gui_related: false
gui_classification_reason: This unit covers search/index/storage policy and invalidation semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ignore_search_index_invalidation_and_storage_isolation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: ignore_search_index_invalidation_storage_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- Ignore handling
- search/index walks
- tree visibility
- File Manager
- Search
- LSP/indexing
- Source Control
- preview surfaces
- invalidation signals
- bounded reconciliation
- storage-isolation
- no-secrets-in-storage
- regex index
- sparse n-gram postings
- dirty layer
- remote/local cache projections
- remote-build
- local-query
- remote-verify
negative_constraints:
- File Manager, Search, LSP/indexing, Source Control, and preview surfaces cannot diverge silently on ignore/search/index
  visibility.
- File watchers, remote file-change notifications, and provider update streams are invalidation signals, not authoritative
  state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-050 - Service Routing External Adapters And Anti DOM Constraints

```yaml
plan_unit_id: AI-050
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: File/open/search/undo/terminal/diff/preview routing resolves through service-registered/provider seams and
  owner contracts; external engines and CLIs are adapters only; requested-vs-effective state remains explicit; browser-specific
  assumptions such as DOM roots, service-worker persistence, hidden file inputs, Blob downloads, localStorage identity, query-string
  routing, and browser-only clipboard/selection hacks must not shape PM architecture.
gui_related: false
gui_classification_reason: This unit covers service routing, adapter boundaries, and architecture constraints rather than
  GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: service_routing_external_adapters_and_anti_dom_constraints
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: service_routing_external_adapters_anti_dom_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0035
preserved_exact_tokens:
- service-registered/provider-based seams
- owner contract
- External engines and CLIs
- adapters only
- requested-vs-effective state
- /bootstrap/runtime/indexing
- DOM roots
- service-worker persistence
- hidden file inputs
- Blob downloads
- localStorage identity
- query-string routing
- browser-only clipboard/selection hacks
- thin-wrapper
- Electron
- DOM-first
negative_constraints:
- External engines and CLIs may be reused only as adapters inside PM-owned boundaries.
- Browser-specific implementation assumptions must not shape Puppet Master architecture.
- Puppet Master must avoid direct adoption of thin-wrapper, Electron, or DOM-first implementation assumptions as native workbench
  foundations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md,
  ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md'
```

### AI-051 - Typed Investigation Budget Exhaustion

```yaml
plan_unit_id: AI-051
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug/investigation flows MUST record typed budget exhaustion instead of collapsing every stop into generic
  failed, failed_cleanup, attention_required, failure, or blocked state; lifecycle records may carry budget_kind?, and retry,
  resume, and cleanup surfaces preserve the exact budget_kind? that tripped.
gui_related: false
gui_classification_reason: This unit covers investigation lifecycle state semantics and budget accounting, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: typed_investigation_budget_exhaustion
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: typed_investigation_budget_exhaustion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0036
preserved_exact_tokens:
- INV-023 -- Investigation lifecycle budgets are typed
- typed budget exhaustion
- generic failure
- blocked state
- budget_kind?
- failed
- failed_cleanup
- attention_required
- retry
- resume
- cleanup surfaces
negative_constraints:
- Debug/investigation flows MUST record typed budget exhaustion rather than collapsing every stop into a generic failure or
  blocked state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/FinalGUISpec.md'
```

### AI-052 - Investigation Budget Kinds And Defaults

```yaml
plan_unit_id: AI-052
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Allowed budget_kind? values are target_discovery_attempts, prepare_attempts, instrumentation_passes, invasive_instrumentation_passes,
  fix_candidates, repro_attempts, verification_attempts, package_or_tool_installs, browser_scenario_branches, no_new_evidence_loops,
  active_temporary_instrumentation_lanes, cleanup_retries, attention_required_resume_cycles, and elapsed_wall_time; MVP ceilings
  are max_verification_attempts_per_fix_candidate = 2 and max_package_or_tool_installs = 2, with named keys persisted or exported
  when they affect stop/retry decisions.
gui_related: false
gui_classification_reason: This unit covers investigation budget enumeration and defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: investigation_budget_kinds_and_defaults
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: investigation_budget_kinds_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0036
preserved_exact_tokens:
- target_discovery_attempts
- prepare_attempts
- instrumentation_passes
- invasive_instrumentation_passes
- fix_candidates
- repro_attempts
- verification_attempts
- package_or_tool_installs
- browser_scenario_branches
- no_new_evidence_loops
- active_temporary_instrumentation_lanes
- cleanup_retries
- attention_required_resume_cycles
- elapsed_wall_time
- max_verification_attempts_per_fix_candidate = 2
- max_package_or_tool_installs = 2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/FinalGUISpec.md'
```

### AI-053 - Package Install Budget Accounting

```yaml
plan_unit_id: AI-053
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Only package or tool installs that persist beyond a single process lifetime count against max_package_or_tool_installs;
  ephemeral per-process installs may be logged as investigation context but do not consume the install budget.
gui_related: false
gui_classification_reason: This unit covers investigation package/tool install budget accounting, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: package_install_budget_accounting
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: package_install_budget_accounting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0036
preserved_exact_tokens:
- package or tool installs
- persist beyond a single process lifetime
- max_package_or_tool_installs
- ephemeral per-process installs
- investigation context
- install budget
negative_constraints:
- Ephemeral per-process installs do not consume max_package_or_tool_installs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/FinalGUISpec.md'
```

### AI-054 - Debug Evidence Plane Separation

```yaml
plan_unit_id: AI-054
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug Mode MUST preserve local ephemeral investigation, hosted runtime verification, production/data-plane
  observability, assistant-session diagnostics, terminal/test observe loops, and DAP-grade interactive inspection as distinct
  evidence planes; Devin, Replit, OpenHands, SWE-agent / mini-swe-agent, Cline, Roo Code, Continue, Aider, InspectCoder /
  InspectWare, snooper-ai, and PySnooper remain examples and not collapsed owner models.
gui_related: false
gui_classification_reason: This unit covers debug evidence plane ownership and examples, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_evidence_plane_separation
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_evidence_plane_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- INV-024 -- Debug Mode evidence planes stay explicit
- local ephemeral investigation
- hosted runtime verification
- production/data-plane observability
- assistant-session diagnostics
- terminal/test observe loops
- DAP-grade interactive inspection
- Devin
- Replit
- OpenHands
- SWE-agent / mini-swe-agent
- Cline
- Roo Code
- Continue
- Aider
- InspectCoder / InspectWare
- snooper-ai
- PySnooper
negative_constraints:
- Debug Mode MUST preserve evidence planes instead of collapsing them into one owner model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-055 - Debug And Deep Plan Overlay Boundaries

```yaml
plan_unit_id: AI-055
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug Mode is a chat/workflow overlay and not a new execution-posture enum; assistant-chat-design may expose
  Debug alongside Ask, Agent, Plan, and Deep Plan while Run_Modes keeps runtime posture separate. Deep Plan is single-threaded
  read-only planning and does not create sub-task inheritance or widen child authority.
gui_related: true
gui_classification_reason: This unit covers user-visible Assistant mode labels and overlay behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_and_deep_plan_overlay_boundaries
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_deep_plan_overlay_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- Debug Mode
- chat/workflow overlay
- execution-posture enum
- Plans/assistant-chat-design.md
- Ask
- Agent
- Plan
- Deep Plan
- Plans/Run_Modes.md
- single-threaded read-only planning
- sub-task inheritance
- child authority
negative_constraints:
- Debug Mode must not become a new execution-posture enum.
- Deep Plan does not create a sub-task inheritance path or widen child authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- assistant-chat-design owns Debug exposure as a chat/workflow overlay; Run_Modes owns runtime posture.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-056 - Debug MVP Authority Seams

```yaml
plan_unit_id: AI-056
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Debug Mode is MVP only when remote targets keep /no-local-fallback, requested /effective capability /state
  stays visible, and seams for investigation_id, instrumentation_id, storage, /contracts/prompt, permissions, and browser
  evidence are explicitly owned rather than inferred from a debug label.
gui_related: false
gui_classification_reason: This unit covers authority seams and target/capability state, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_mvp_authority_seams
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: debug_mvp_authority_seams
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- /no-local-fallback
- requested /effective capability /state
- investigation_id
- instrumentation_id
- storage
- /contracts/prompt
- permissions
- browser evidence
- debug label
negative_constraints:
- Debug authority seams must not be inferred from a debug label.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Remote target, capability, storage, prompt, permission, and browser evidence seams require explicit owners.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-057 - Visible Browser Evidence Attachment

```yaml
plan_unit_id: AI-057
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Browser evidence auto-feed must be a visible attach /bundle contract and must not contradict the no hidden
  browser-to-chat injection rule; bounded auto-feed is allowed only through visible Investigation Context state, consented
  attach/revoke affordances, and owner-routed browser capture events.
gui_related: true
gui_classification_reason: This unit governs user-visible browser evidence attach/revoke affordances and Investigation Context
  state.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_browser_evidence_attachment
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: visible_browser_evidence_attachment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- browser evidence auto-feed
- visible attach `/bundle` contract
- no hidden browser-to-chat injection rule
- visible Investigation Context state
- consented attach/revoke affordances
- owner-routed browser capture events
negative_constraints:
- Browser evidence auto-feed must not contradict the no hidden browser-to-chat injection rule.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Browser-backed investigation evidence enters through visible owner-routed attach/bundle state, not hidden prompt injection.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-058 - Investigation Evidence State And Replay Heuristics

```yaml
plan_unit_id: AI-058
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: In-scope tool-emitted evidence for an active investigation enters Investigation Context as active unless redaction,
  trust, or /truncation policy narrows it; out-of-scope evidence remains referenced or rejected instead of silently injected.
  Exported or replayed Debug verification evidence carries heuristic_version = debug_verify.v1, and future debug_verify tuning
  increments or preserves heuristic_version.
gui_related: false
gui_classification_reason: This unit covers evidence state, redaction/trust/truncation policy, and replay metadata, not GUI
  behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: investigation_evidence_state_and_replay_heuristics
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: investigation_evidence_state_replay_heuristics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0037
preserved_exact_tokens:
- tool-emitted evidence
- Investigation Context
- active
- redaction
- trust
- /truncation
- referenced or rejected
- silently injected
- heuristic_version = debug_verify.v1
- debug_verify
- exported or replayed
negative_constraints:
- Out-of-scope evidence remains referenced or rejected instead of being silently injected.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md,
  ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/LSPSupport.md'
```

### AI-059 - Provider Profiles Are Runtime Isolated

```yaml
plan_unit_id: AI-059
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: CLI/provider profile mechanisms used for account separation MUST be treated as isolated runtime profiles;
  Cursor --user-data-dir and user-data-dir separation do not authorize sharing auth, cooldown, usage, session history, runtime
  cache, or telemetry state between accounts.
gui_related: false
gui_classification_reason: This unit covers provider/runtime profile isolation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_profiles_are_runtime_isolated
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: provider_profiles_runtime_isolated
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0038
preserved_exact_tokens:
- INV-025 -- Provider profile isolation is not shared mutable state
- CLI/provider profile mechanisms
- isolated runtime profiles
- Cursor
- --user-data-dir
- user-data-dir
- auth
- cooldown
- usage
- session history
- runtime cache
- telemetry state
negative_constraints:
- user-data-dir profile separation does not authorize sharing auth, cooldown, usage, session history, runtime cache, or telemetry
  state between accounts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/BinaryLocator_Spec.md,
  ContractName:Plans/Permissions_System.md'
```

### AI-060 - Provider Overlay Sharing Requires Owner Contract

```yaml
plan_unit_id: AI-060
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: PM-managed overlays such as instructions, projected PM skills, selected MCP/tool definitions, and selected
  plugins/extensions may be shared only when the provider/runtime contract explicitly allows safe projection and drift handling.
gui_related: false
gui_classification_reason: This unit covers provider/runtime overlay sharing contracts, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_overlay_sharing_requires_owner_contract
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: provider_overlay_sharing_owner_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0038
preserved_exact_tokens:
- PM-managed overlays
- instructions
- projected PM skills
- selected MCP/tool definitions
- selected plugins/extensions
- provider/runtime contract
- safe projection
- drift handling
negative_constraints:
- PM-managed overlays may be shared only when the provider/runtime contract explicitly allows safe projection and drift handling.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/runtime contracts own safe overlay projection and drift handling.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/BinaryLocator_Spec.md,
  ContractName:Plans/Permissions_System.md'
```

### AI-061 - File Browser Recovery Consumer Routing

```yaml
plan_unit_id: AI-061
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: FileManager consumes file/browser/rendering repairs and MUST NOT keep stale inline visualizer or terminal-action
  assumptions; /browser/rendering behavior stays routed through browser/rendering owners, and terminal-action surfaces remain
  consumers of terminal/runtime contracts.
gui_related: true
gui_classification_reason: This unit affects FileManager, browser/rendering, and terminal-action user-visible surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_browser_recovery_consumer_routing
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: file_browser_recovery_consumer_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Plans/FileManager.md
- file/browser/rendering repairs
- stale inline visualizer
- terminal-action assumptions
- /browser/rendering
- browser/rendering owners
- terminal-action surface
- terminal/runtime contracts
negative_constraints:
- Plans/FileManager.md MUST NOT keep stale inline visualizer or terminal-action assumptions.
compatibility_only_notes: []
stale_retired_dispositions:
- File/browser/rendering and terminal-action assumptions are stale if they bypass owner routing.
owner_boundary_notes:
- FileManager consumes browser/rendering and terminal/runtime owners instead of re-owning them.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-062 - Firecrawl Billing And Audit UI Ownership

```yaml
plan_unit_id: AI-062
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: FinalGUISpec consumes Firecrawl billing and audit disclosure, and credit-warning plus audit-surface UI copy
  MUST defer to Tools for thresholds, provider billing exceptions, cache/routing disclosure, and web-operation audit payload
  ownership.
gui_related: true
gui_classification_reason: This unit governs Firecrawl credit-warning, audit-surface UI copy, and user-visible disclosure
  ownership.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_billing_and_audit_ui_ownership
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: firecrawl_billing_audit_ui_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Plans/FinalGUISpec.md
- Firecrawl billing
- audit disclosure
- credit-warning
- audit-surface UI copy
- Plans/Tools.md
- thresholds
- provider billing exceptions
- cache/routing disclosure
- web-operation audit payload ownership
negative_constraints:
- Firecrawl credit-warning and audit-surface UI copy MUST defer to Plans/Tools.md for provider/billing/audit payload ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec consumes Firecrawl UI disclosure while Tools owns thresholds, billing exceptions, cache/routing disclosure,
  and audit payload semantics.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-063 - Web Provider Non GUI Consumer Map

```yaml
plan_unit_id: AI-063
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Wiring_Matrix carries research_session and web-tool wiring, usage-feature tracks Firecrawl credit model and
  /billing, assistant-memory-subsystem persists web research session context without owning provider semantics, Architecture
  Invariants records provider architecture changes, and DRY_Rules owns external reference policy including Part Q-style external-reference
  constraints.
gui_related: false
gui_classification_reason: This unit records non-GUI web/provider consumer ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_non_gui_consumer_map
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: web_provider_non_gui_consumer_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Plans/Wiring_Matrix.md
- research_session
- web-tool wiring
- Plans/usage-feature.md
- Firecrawl credit model
- /billing
- Plans/assistant-memory-subsystem.md
- web research session context
- provider semantics
- Plans/Architecture_Invariants.md
- provider architecture changes
- Plans/DRY_Rules.md
- external reference policy
- Part Q-style external-reference constraints
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumer docs remain consumers and do not own provider semantics unless their owner contract says so.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-064 - HITL And Widget Recovery Consumers

```yaml
plan_unit_id: AI-064
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: HITL patterns consume the shared approval ladder and batch permission UX, while Widget_System adds only owner-approved
  card widget types.
gui_related: true
gui_classification_reason: This unit affects HITL permission UX and user-visible widget card types.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_and_widget_recovery_consumers
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: hitl_widget_recovery_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- HITL patterns
- shared approval ladder
- batch permission UX
- Plans/Widget_System.md
- owner-approved card widget types
negative_constraints:
- Widget_System adds only owner-approved card widget types.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- HITL and Widget_System are consumers in the web/provider recovery map.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-065 - Owner First Consumer Drift Blocking

```yaml
plan_unit_id: AI-065
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: 'Consumer drift remains blocking even when owner docs exist: slash-command consumers, questionnaire consumers,
  and provider /multi-account/runtime-identity consumers MUST be reconciled in the same packet as repaired owner docs so stale
  local assumptions do not mislead implementation.'
gui_related: false
gui_classification_reason: This unit covers consumer drift and owner-first repair policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_first_consumer_drift_blocking
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: owner_first_consumer_drift_blocking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- Consumer drift remains blocking
- owner docs
- slash-command consumers
- questionnaire consumers
- provider `/multi-account/runtime-identity` consumers
- same packet
- repaired owner docs
- stale local assumptions
- mislead implementation
negative_constraints:
- Consumer drift remains blocking even when owner docs exist.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale local assumptions in slash-command, questionnaire, and provider runtime-identity consumers must be reconciled with
  owner docs.
owner_boundary_notes:
- Consumer repair happens in the same packet as repaired owner docs.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-066 - Log Audit GUI Drift Blocking

```yaml
plan_unit_id: AI-066
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Log/audit GUI consumers MUST be reconciled in the same packet as repaired owner docs so stale local assumptions
  do not mislead implementation.
gui_related: true
gui_classification_reason: This unit governs GUI log/audit consumer drift and visible audit surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: log_audit_gui_drift_blocking
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: log_audit_gui_drift_blocking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0039
preserved_exact_tokens:
- log/audit GUI consumers
- same packet
- repaired owner docs
- stale local assumptions
- mislead implementation
negative_constraints:
- Log/audit GUI consumers MUST be reconciled in the same packet as repaired owner docs.
compatibility_only_notes: []
stale_retired_dispositions:
- Log/audit GUI stale assumptions are blocking until reconciled with repaired owner docs.
owner_boundary_notes: []
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md,
  ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md'
```

### AI-067 - Architecture Owner Consumer Boundary Map

```yaml
plan_unit_id: AI-067
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: Architecture_Invariants.md remains the owner doc for behavior described by its preserved sections, and cross-doc
  ownership follows the ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: This unit records owner/consumer map boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered architecture-invariant fact is represented by a fine-grained PlanUnit instead of only the retired source-preserving
  bridge.
- Plans/Architecture_Invariants.md remains the owner for cross-cutting invariants while referenced owner docs retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: architecture_owner_consumer_boundary_map
reasoning_tier: standard
context_scope: architecture_invariants_standardization
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: architecture_owner_consumer_boundary_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Architecture_Invariants-S0040
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/Architecture_Invariants.md
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Architecture_Invariants.md remains the owner doc for behavior described by its preserved sections while cross-doc ownership
  follows ContractRefs and boundary notes.
owner_hints:
- Plans/Architecture_Invariants.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

## Migration Coverage

Original hash: `bc5fe0c3f06f26531d4c79e420f135da41f29e5c31e371784e9df7c35255a3a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batches 115 and 116 atomized `Architecture_Invariants-S0001` through `Architecture_Invariants-S0040` into fine-grained PlanUnits `AI-002` through `AI-067`. `Architecture_Invariants-S0041` is the PlanUnits heading/container, `Architecture_Invariants-S0042` is the retired `AI-001` source-preserving bridge, and `Architecture_Invariants-S0043` is Migration Coverage metadata. `AI-001` is now migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime architecture-invariant rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-60e840c059b6db237485d48c`: raw reconciliation fragments preceding INV-001 are audit-lineage only. The canonical invariant is that correlation, usage, permission, route, and artifact identity must be represented by named owner fields and must not be reintroduced as anonymous prose aliases.
- Keeps `sfk-ddd4dece078c664fd31f6de5` explicitly deferred: correlation_id trace-through and usage_event_ref special-case removal need a dedicated architecture/gate-owner slice before closure.
- Keeps `sfk-937c36d705a22bf16645cca2` explicitly deferred: GATE-001/GATE-003/GATE-010 authority needs gate registry owner reconciliation before closure.
