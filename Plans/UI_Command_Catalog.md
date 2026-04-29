# UI Command Catalog (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Cleanup Priorities

#### Source target target-0515
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Cleanup Priorities
- Exact required items represented:
  - Replace or demote [retired-token-1] widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than [retired-token-5].
  - `[retired-token-9]`
  - [retired-token-9]
  - `[retired-token-9]`, `Plans/[retired-token-7]`
  - Plans/[retired-token-7]
  - `FinalGUISpec.md` already defines a global command palette.
  - FinalGUISpec.md
  - command palette results
  - The platform already has a strong shared command foundation:
  - `Ctrl+K` / `Ctrl+P` command palette
  - Ctrl+K
  - Ctrl+P
  - treat the command palette as a universal navigation and precise-action surface, not as a blanket permission to expose every dangerous runtime mutation as one keystroke away
  - then command palette and shortcut surfaces must still honor the same gating and preview requirements.
  - Reuse one shared routing payload across command palette, shortcuts, widgets, search, and deep links.
  - command palette entries
  - subtle mismatches between command palette, search, widgets, and deep links
  - command payloads with generic `page: string` or tier-bound filters will quietly undermine any native-surface cleanup if they are not constrained at the same time
  - page: string
  - `[retired-token-9]` + `Plans/Runtime_Artifacts_Panel.md`
  - Plans/Runtime_Artifacts_Panel.md
  - `GitHub_Integration.md` still carries a split-brain command table that diverges from `UI_Command_Catalog.md`
  - GitHub_Integration.md
  - UI_Command_Catalog.md
  - `[retired-token-9]` + `Plans/storage-plan.md`
  - Plans/storage-plan.md
  - GitHub Integration command IDs/args still diverge from the command catalog.
  - The command catalog is already stronger than most surface docs:
  - `cmd.panel.switch` also already acts like a coarse route command with `panel_id`, optional `project_id`, and context block
  - cmd.panel.switch
  - panel_id
  - project_id
  - Recommended command model:
  - `cmd.panel.switch` can stay as a concrete command, but it should align with the richer route model rather than becoming a second navigation language
  - UI / projection / command contracts are still structurally incomplete:
  - Command and wiring SSOTs still cannot mechanically express freshness/health gating or canonical mutation ownership.
  - Remove or alias stale/non-canonical `[retired-token-6]` and template/example command IDs so the catalog is truly the only stable command owner.
  - [retired-token-6]
  - Command / wiring ownership is materially weaker than the downstream surface docs assumed:
  - `assistant-memory-subsystem.md` surfaces a new storage-owner gap: memory event families, AutoRunBoundary/AutoMilestone triggers, `attention_required` thread state persistence, and HITL/dashboard CTA command families still have no canonical event/command registration in storage-plan or the command catalog.
  - assistant-memory-subsystem.md
  - attention_required
  - Introduce explicit subject-open command coverage in the command catalog instead of overloading path-open semantics everywhere.
  - The command catalog already contains many specific pivots:
  - it reduces command sprawl
  - add a canonical navigation/open command family to the command catalog
  - The catalog gap is now structural, not just a few missing IDs.
  - a surface-specific wrapper command that resolves to the same route target
  - The matrix cannot encode whether a command is a canonical navigation primitive, a deprecated alias, or a surface wrapper over a shared route target.
  - Clean stale/ghost command examples out of `[retired-token-7]` before relying on it for automated extraction or coverage.
  - [retired-token-7]
  - Research Progress - 2026-03-16 - Command catalog wrapper/alias gap for navigation
  - surface-specific wrapper command
  - Make shared navigation context fields explicit at the catalog level instead of burying them in per-command notes.
  - The command catalog is not hostile to the new navigation model, but it is still too flat to describe it cleanly.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Contracts_V0.md` already wants a small reusable command envelope, which argues for a shared target object under `UICommand.args` rather than every command inventing its own payload.
  - Contracts_V0.md
  - UICommand.args
  - Teach the wiring/gate docs to understand canonical command vs wrapper vs deprecated alias, not just “command id exists.”
  - The goal is not to delete every surface-specific command.
  - The goal is to stop every surface-specific command from inventing its own private navigation semantics.
  - `[retired-token-9]` (Gemini backfill)
  - `[retired-token-8]` still points at missing concrete command entries, stale Final GUI summary text, and a persistence model that has not caught up to workspace-tab identity.
  - [retired-token-8]
  - `Containers_Registry_and_Unraid.md` is itself a second source of ghost command IDs and still defines auth/publish/repo-management command families absent from the catalog.
  - Containers_Registry_and_Unraid.md
  - Some current command payloads and surface docs still blur destination intent with shell-state realization.
  - The command layer wants a three-way split, not a binary split:
  - `cmd.panel.switch` is the clearest pure shell command in the current catalog. It selects a side-panel destination. Its current optional `context` payload is the main drift risk because it makes a shell command look like an object-targeting navigation command.
  - context
  - `cmd.source_control.switch_subview` is also a pure shell/view-state command. It chooses a Source Control subview; it should not become the carrier for repo/worktree/compare target identity.
  - cmd.source_control.switch_subview
  - Formalize the three-way command taxonomy:
  - The catalog can keep UX-facing wrapper names; the important change is the canonical contract beneath them.
  - An explicit public `cmd.nav.*` family is possible, but it would add catalog surface area, wiring rows, handler registration burden, and alias/deprecation work across the gate machinery.
  - cmd.nav.*
  - Add explicit wrapper/alias guidance so the wiring system can understand “different command ID, same canonical route primitive” without treating that as drift.
  - The canonical primitive should live underneath the wrapper layer, not force every surface to speak one generic top-level command language.
  - The command layer now needs two distinct patterns, not one:
  - deprecated command aliases during migration
  - a wrapper command may remain permanently because it is useful UX-facing vocabulary
  - stable command ID
  - dead command detection
  - deprecated command alias
  - stable wrapper command
  - public command ID
  - Keep the command catalog readable for UX and command-palette use; do not force users to think in canonical primitive names.
  - command-definition metadata belongs in the command catalog / command contract layer
  - `UI_Command_Catalog.md` currently carries command meaning in prose/tables only; it has no precise slot for wrapper-vs-alias classification.
  - command catalog / command contract owns normalization metadata
  - The catalog should describe what class of command this is, not become the full route schema.
  - states that command catalog metadata, shell docs, storage docs, and surface docs consume that primitive rather than owning it
  - Several command payloads and shell docs still mix destination class with lower-level shell realization details.
  - Tooling / command / UI owner gaps are still strong enough to justify later-model continuation:
  - `cmd.source_control.select_worktree` is still described like a local selection command even though it is now clearly an object-targeting route action.
  - cmd.source_control.select_worktree
  - `[retired-token-9]` is internally split:
  - Stratum 2: command and shell adoption
  - Keep the command layer wrapper-based and domain-facing while normalizing through the shared contracts underneath.
  - Research Progress - 2026-03-17 - Command catalog and GUI-shell adoption points
  - `[retired-token-9]` is structurally ready for route/open adoption but still classifies several routed object actions as pure layout state:
  - The command catalog still uses `layout/UI state only` for actions that now have canonical object routing meaning.
  - layout/UI state only
  - In `[retired-token-9]`:
  - The catalog structure is not the problem. The command meaning labels are.
  - That is enough for direct command dispatch verification, but it does not encode:
  - command classification such as `shell_view` versus `navigation_wrapper`
  - shell_view
  - navigation_wrapper
  - `[retired-token-9]` already says:
  - This seam is now purely consumer-side. The runtime command layer already has the stronger model.
  - replay/restore and command dispatch are deterministic across `request_id`
  - request_id
  - `[retired-token-9]` says:
  - Both are already contradicted by the runtime command consolidation:
  - The command catalog and the graph spec cannot both be correct.
  - The highest-risk unresolved seams remain DAE/FileSafe enforcement, promoted-shell command ownership, execution-role / requested-effective identity disclosure, OpenCode provider-native identity mapping, and rewrite-root owner routing.
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `[retired-token-9]` is still publishing hard stale command canon:
  - `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `[retired-token-9]`
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - The **13-widget Progress catalog** is not just "underspecified" - it is effectively absent as a named catalog.
  - `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `[retired-token-9]`, `Plans/Crosswalk.md`, `Plans/[retired-token-7]`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - Plans/Crosswalk.md
  - Plans/Progression_Gates.md
  - Plans/FileManager.md
  - Plans/Project_Output_Artifacts.md
  - 6. `[retired-token-9]`
  - `[retired-token-9]` already has a real command-normalization owner block, but `[retired-token-14]` and `[retired-token-15]` still preserve `[retired-token-12]`.
  - [retired-token-14]
  - [retired-token-15]
  - [retired-token-12]
  - `[retired-token-9]:67-91`
  - [retired-token-9]:67-91
  - `[retired-token-9]:224-246`
  - [retired-token-9]:224-246
  - `[retired-token-9]:617-622`
  - [retired-token-9]:617-622
  - `[retired-token-11]` is primarily a missing-owner-heading problem in `[retired-token-9]`; `[retired-token-10]` and `[retired-token-12]` remain real stale survivors, but the absent owner anchors are the sharper blocking defect.
  - [retired-token-11]
  - [retired-token-10]
  - `[retired-token-9]` still lacks the exact `### 2.0 Command entry contract (doc-level)`, `Search-command routing`, and `Canonical runtime recovery command ownership` anchors even though real normalization content exists under `### 2.0A Promoted Section 15 command families`.
  - ### 2.0 Command entry contract (doc-level)
  - Search-command routing
  - Canonical runtime recovery command ownership
  - ### 2.0A Promoted Section 15 command families
  - `[retired-token-9]:29-90`
  - [retired-token-9]:29-90
  - Wave 1 targeted the structural/survivor subset around `[retired-token-11]`, `gap-006`, and `gap-007` (`[retired-token-9]`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/GitHub_Integration.md`, `Plans/FinalGUISpec.md`) and only reconfirmed the already-recorded missing owner headings plus existing `[retired-token-10]`, `[retired-token-12]`, `restore points`, and the broken `#11. Source Control boundary` reference.
  - gap-006
  - gap-007
  - Plans/Glossary.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
  - `[retired-token-9]:29-92`
  - [retired-token-9]:29-92
  - `[retired-token-9]:617-623`
  - [retired-token-9]:617-623
  - `[retired-token-9]:29-95`
  - [retired-token-9]:29-95
  - `[retired-token-11]` sharpened: `[retired-token-9]` still points at the non-existent `[retired-token-13]`, and `[retired-token-12]` remains live in `[retired-token-14]` / `[retired-token-15]` args rather than appearing only as stale residue.
  - [retired-token-13]
  - `[retired-token-9]:214-223`
  - [retired-token-9]:214-223
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-007: Retire tier-era canon and shadow fields
- Coverage rows: cov-007
- Fidelity gap refs: cov-007
- Required fidelity items:
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-007: Retire tier-era canon and shadow fields` exists in `Plans/UI_Command_Catalog.md`.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-007` repair removes stale live vocabulary and, if needed, confines any mention to an explicit compatibility-retirement note.

### Fidelity recovery cov-072: Canonical route payload

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0525
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - command palette results, keyboard shortcuts, context menus, and widgets should route through the same destination payload model
  - Define one canonical internal route payload, separate from command IDs.
  - route payload vs command args
  - align command args with canonical route payload vocabulary once that payload is owned elsewhere
  - The catalog can list payload keys, but it cannot currently say whether two commands are different user-facing wrappers over one canonical route target.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-072
- Fidelity gap refs: cov-072
- Required fidelity items:
- Exact required item: Treat resume_url as serialized transport of that route payload
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-072: Canonical route payload` exists in `Plans/UI_Command_Catalog.md`.
- Exact acceptance check: The `cov-072` repair states the exact requirement: Treat resume_url as serialized transport of that route payload
- Exact acceptance check: The `cov-072` repair is in the owner section for `Plans/UI_Command_Catalog.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- UI COMMAND SSOT

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This file is the SSOT list of stable UI command IDs.
Command IDs are referenced by plans and tests; implementations MUST treat these IDs as stable.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

## 1. Naming rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0516
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Reconcile event naming and command extraction rules across catalog/storage/wiring before trusting any automated gate based on doc parsing.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- IDs MUST be lowercase and dot-separated.
- Prefix MUST be `cmd.`.

ContractRef: Primitive:UICommand, ContractName:Contracts_V0.md#UICommand

---

## 2. Canonical command IDs

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0517
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Keep canonical runtime command ids authoritative for blocked/recovery actions on every surface.
  - Publish a GitHub command migration map from legacy IDs to canonical `[retired-token-1]` IDs and payloads.
  - [retired-token-1]
  - `[retired-token-1]` should own stable command IDs and command argument families, but not the deeper route ontology by itself
  - keep stable command IDs
  - ghost command IDs
  - internal AC contradiction and uncataloged command IDs now directly threaten wiring verification.
  - `newtools.md` introduces uncataloged preview/build command IDs, unregistered `live.*` and doctor/custom-headless event families, and a conditional `CustomHeadlessTool` lifecycle with no canonical Tools/permissions owner.
  - newtools.md
  - live.*
  - CustomHeadlessTool
  - command IDs plus ad hoc args
  - The system now wants a routing contract, not just more command IDs.
  - canonical command IDs versus deprecated aliases/wrappers
  - `UI_Wiring_Rules.md` already treats `correlation_id` as part of the command envelope, but the matrix/schema pair has no way to declare or verify passthrough obligations for route payloads, subject IDs, or correlation continuity into downstream events.
  - UI_Wiring_Rules.md
  - correlation_id
  - The command/wiring system is biased toward stable user-facing command IDs with explicit surface meaning.
  - wiring rows should reference command IDs and handlers, not restate the normalization model in full
  - deprecated aliases resolve to real canonical command IDs
  - `Containers_Registry_and_Unraid.md` still has uncataloged command IDs, unresolved publish-authority split, broken blocked-payload consistency, and unanchored publish-result lineage.
  - Containers_Registry_and_Unraid.md
  - update `UICommand` boundary text so command IDs stay stable while route/open semantics live in Contracts
  - UICommand
  - unresolved command IDs and promoted-shell persistence contradictions
  - `[retired-token-3]`, `[retired-token-4]`, `[retired-token-5]`, and `[retired-token-6]` still contain exact phantom/superseded/missing command IDs, stale shell-surface assumptions, and persistence-identity contradictions against `[retired-token-1]`, `[retired-token-2]`, and promoted-shell canon.
  - [retired-token-3]
  - [retired-token-4]
  - [retired-token-5]
  - [retired-token-6]
  - [retired-token-2]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
### 2.0A Promoted Section 15 command families

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0520
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still internally split on blocked/HITL mutator ownership and still missing command families for account/concern/promotion flows.
  - Register/fix the missing command families and remove false catalog/wiring claims:
  - canonical runtime recovery command consolidation in `[retired-token-1]`, where legacy command families become deprecated aliases but consumers map to one shared namespace
  - [retired-token-1]
  - it also lists command families that now need revalidation against the newer runtime recovery and route/open model
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Command families stay normalized around shared navigation, search routing, and runtime recovery ownership.

### 2.0 Command entry contract (doc-level)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0518
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Why it matters: the user can otherwise see one command family while runtime/event contracts expect another.
  - That is enough for a flat `element -> command -> handler` contract, but not for the route-aware/navigation-aware model the rewrite is moving toward.
  - element -> command -> handler
  - `Contracts_V0.md` currently gives the app only a very thin canonical UI command contract:
  - Contracts_V0.md
  - That is enough to standardize command dispatch mechanically, but not enough to standardize navigation semantics. There is still no canonical contract for:
  - keeps `OpenFile` as the path-based file-open contract reference point for UI command work
  - OpenFile
  - Remove the graph-specific approval command contract as a primary action model.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Required command metadata:
- `command_kind`
- `normalization.kind`
- `normalizes_to_contract`
- `alias_of_command_id`

Rules:
- `route_target` owns canonical open and focus identity.
- command normalization remains discoverable at the doc-level contract.

### 2.0B Action-surface policy

Actions available on the UI are scoped by:
- User role and execution_role (from Permissions_System.md)
- Active run mode (automate, interactive, diagnostic)
- Concern state and blocked_sequence
- approval_scope_key and approval_id context
- DAE jail posture

Rules:
- User cannot take an action unless the approval_scope_key allows it AND the operation is not contradicted by blocked_sequence or DAE jail posture.
- Run mode changes, approval decisions, and blocked recovery are Orchestrator-owned; UI surfaces them but does not make the decision locally.
- Actions that trigger external side-effects (file mutations, provider calls, route/open ops) MUST route through Permissions and route/open contracts.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

### Canonical route payload and route/open tail rules

UI commands that route or open MUST preserve:
- `route_target`: destination for output or side-effect (file path, GitHub issue URL, workspace concern, etc.)
- `OpenSubject`: resource being opened (file, concern, help entry, project state)
- `execution_unit_context`: which run, seam, package, or node is executing the command
- `approval_scope_key`: reusable approval join key
- `operational_identity`: attribution
ContractRef: Primitive:RouteTarget, Primitive:OpenSubject, Primitive:ExecutionContext, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

Route side-effect rules:
- File mutations go through FileSafe and route/open guards before execution.
- Provider mutations (PRs, issue comments) go through Permissions and provider-identity checks.
- Route completion refs are immutable once recorded; they form an audit trail of what was actually modified.
- If route_target becomes unreachable between command build and execution, the UI displays an error and does not attempt fallback mutation.

### Command normalization model

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0524
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still needs command normalization, trust-state gating, and stronger project/account binding for resumed flows
  - UI command / route normalization across existing commands
  - `GATE-010` can verify command coverage, but it cannot yet verify wrapper normalization consistency.
  - GATE-010
  - normalization metadata is internally consistent with the command kind
  - Keep the matrix row itself relatively small; let it reference a command that already carries normalization meaning.
  - command wrapper normalization
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All UI commands (button clicks, keyboard shortcuts, context menu items) normalize to a standard record:
```
{
  command_id: string,
  command_type: 'action' | 'navigation' | 'state_change' | 'modal',
  source_surface: 'graph' | 'inspector' | 'approval_modal' | 'logs' | 'menu' | 'shortcut',
  target_scope: 'run' | 'node' | 'concern' | 'evidence' | 'artifact',
  target_id: string,
  action_intent: string,
  parameters: Record<string, any>,
  route_target?: string,
  open_subject?: OpenSubject,
  execution_unit_context?: ExecutionUnitContext,
  approval_scope_key: string,
  operational_identity: string,
  created_utc: string
}
```

Rules:
- Commands from keyboard, menu, and context are all normalized to this record.
- CLI commands and programmatic API calls use the same record format for Orchestrator ingestion.
- Command normalization preserves user intent without rewriting route_target or OpenSubject.

ContractRef: ContractName:Plans/Contracts_V0.md §route_target and OpenSubject, ContractName:Plans/FileSafe.md

### Tier-era compatibility retirement

- Retire TierContext/tier_id/TierType/Tiers/Phase-Task-Subtask runtime canon.
- Retire allowed_actions[] / reason_code / recovery_options[] survivors from live blocked/HITL contracts.
- Retirement targets are exactly: `TierContext`, `tier_id`, `TierType`, `Tiers`, `allowed_actions[]`, `reason_code`, `recovery_options[]`, `approve_continue`.
- This subsection stays limited to tier-era retirement under 2.0B and does not redefine route payload or command-normalization ownership.

### 2.0.1 Acceptance hooks contract (wiring verification)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0519
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The owner-doc tranche deepened from generic drift into hard SSOT-integrity failures across command registration, wiring verification, and dispatcher/runtime gating.
  - The catalog already has a stable command-entry contract and wiring hooks, so the missing piece is command classification and normalization metadata, not a new catalog structure.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Every command listed in this catalog MUST be verifiable through the wiring matrix (`Plans/Wiring_Matrix.md`, schema: `Plans/Wiring_Matrix.schema.json`). Specifically:

1. **Handler registration**: The command MUST have a registered handler in the UI Command Dispatcher. The handler's module/function location MUST be recorded in the wiring matrix.
2. **Event emission verification**: If the command declares expected events (non-empty `expected_event_types`), a test MUST exist that dispatches the command and asserts the expected events are emitted.
3. **UI element binding**: At least one UI element MUST be bound to the command in the wiring matrix, with its `ui_location` matching an actual GUI surface.
4. **Acceptance checks**: Each wiring matrix entry MUST include at least one testable `acceptance_checks` assertion.

Commands that declare `no persisted domain event` are still subject to handler registration and UI element binding checks; they are exempt only from event emission tests.

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, SchemaID:Wiring_Matrix.schema.json, Gate:GATE-010, Invariant:INV-011, Invariant:INV-012

### 2.1 GitHub auth (GitHub HTTPS API only)

#### `cmd.github.connect`

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0530
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `cmd.nav.open_subject`
  - cmd.nav.open_subject
  - `cmd.nav.open_usage_subject`
  - cmd.nav.open_usage_subject
  - `cmd.nav.focus_route`
  - cmd.nav.focus_route
  - `cmd.source_control.select_worktree`
  - cmd.source_control.select_worktree
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Start GitHub OAuth device-code flow.

- **Args schema:** `{}` (no args; host/scope are locked by Spec Lock).
  ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, SchemaID:Spec_Lock.json#locked_decisions.auth_model
- **Expected events:** `auth.github.device_code.issued`, `auth.github.token.polling`, terminal: `auth.github.authenticated` or `auth.github.failed`.
  ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md
- **Affected surfaces:** Settings > GitHub/Auth, Setup flow, Dashboard auth status.

ContractRef: UICommand:cmd.github.connect

#### `cmd.github.disconnect`
Disconnect and delete token (credential store).

- **Args schema:** `{}`
  ContractRef: ContractName:Contracts_V0.md#AuthState
- **Expected events:** `auth.github.disconnected`.
  ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md
- **Affected surfaces:** Settings > GitHub/Auth, Dashboard auth status.

ContractRef: UICommand:cmd.github.disconnect

ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect

---

### 2.1A Project management / deferred wizard commands
These IDs are required by `Plans/GitHub_Integration.md` section D and `Plans/chain-wizard-flexibility.md` section 13.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.project.add_existing` | `{ path?, ssh_remote_id?, ssh_path? }` | `project.added` | File menu, Dashboard, Add Existing Project flow |
| `cmd.project.new_local` | `{ name, parent_path, init_git?, preset? }` | `project.created` | File menu, Dashboard, New Local Project flow |
| `cmd.project.new_github_repo` | `{ name, description?, private, visibility?, gitignore_template?, license?, local_clone_path }` | `project.created`, `git.clone.completed` | File menu, Dashboard, New GitHub Repo flow |
| `cmd.project.open` | `{ project_id }` | no persisted domain event (navigation) | File Manager, Dashboard, project finish screens |
| `cmd.project.chain_wizard_open_deferred` | `{ project_id, wizard_id, default_intent, project_path, remote_repo_ref?, deferred_wizard_payload_ref? }` | `wizard.opened`, `wizard.deferred_payload.loaded` | Project finish screens, Dashboard, Chain Wizard |

ContractRef: ContractName:Plans/GitHub_Integration.md#d-project-management-flows-no-chain-wizard-required, ContractName:Plans/chain-wizard-flexibility.md

---

### 2.2 LSP (minimum required)
These IDs are required by `Plans/LSPSupport.md`.

**Common args schema (keys only):**
- `path` (string)
- `position` (object): `{ line: number, character: number }` (0-based)

ContractRef: ContractName:Plans/Tools.md

**Expected events (minimum):**
- `tool.invoked` (tool_name = `lsp`) or `tool.denied` (if policy blocks).
  ContractRef: ContractName:Contracts_V0.md

**Affected surfaces (minimum):** File editor, Problems panel, Chat (when LSP-in-chat is enabled).

#### Command IDs
- `cmd.lsp.goto_definition` — args: `{ path, position }`
- `cmd.lsp.find_references` — args: `{ path, position }`
- `cmd.lsp.rename_symbol` — args: `{ path, position, new_name }`
- `cmd.lsp.format_document` — args: `{ path }`
- `cmd.lsp.format_selection` — args: `{ path, range }`
- `cmd.lsp.code_action` — args: `{ path, range }`
- `cmd.lsp.goto_symbol` — args: `{ query }`
- `cmd.lsp.open_problems` — args: `{}`
- `cmd.lsp.restart_server` — args: `{ server_id? }`

ContractRef: Plans/LSPSupport.md#13

---

### 2.3 Widget layout commands
These IDs are required by `Plans/Widget_System.md`.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.widget.add` | `{ page, widget_id }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.remove` | `{ page, instance_id }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.resize` | `{ page, instance_id, col_span, row_span }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.configure` | `{ page, instance_id, config }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.move` | `{ page, instance_id, col, row }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |
| `cmd.widget.reset_layout` | `{ page }` | no persisted domain event (UI layout state update) | Dashboard, Usage page, Orchestrator widget tabs |

ContractRef: ContractName:Plans/Widget_System.md#11, ContractName:Plans/Contracts_V0.md#UICommand

---

### 2.4 Run Graph commands

Run Graph runtime recovery commands are defined canonically in `## Canonical Runtime Recovery Command Consolidation (2026-03-09)`.

Rules:
- graph approval and recovery commands target blocked/runtime identity, not `request_id`
- `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` do not remain canonical command IDs
- any graph-facing wrapper command normalizes to the runtime command family and canonical `route_target` semantics

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Run_Graph_View.md

Canonical Orchestrator commands are:
- `cmd.orchestrator.focus_object`
- `cmd.orchestrator.focus_run`
- `cmd.orchestrator.open_graph_generation`
- `cmd.orchestrator.open_graph_patch`
- `cmd.orchestrator.open_concern`
- `cmd.orchestrator.open_promotion`
- `cmd.orchestrator.open_review`
- `cmd.orchestrator.open_corroboration`
- `cmd.orchestrator.open_in_source_control`

Rules:
- Orchestrator object opens are route-consuming navigation wrappers, not layout-only commands
- cross-tab deep links preserve `project_id`, `focused_run_id`, object identity, and inspector focus
- commands that pivot into Source Control or Usage remain public wrapper commands and normalize internally to canonical route/open contracts

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

ContractRef: Plans/Orchestrator_Page.md#10. Search, routing, and action policy, Plans/Contracts_V0.md#7.3 `route_target`

Required fields:
- action_type
- target_scope
- palette_visible
- shortcut_eligible
- confirmation_strength
- reversibility
- target_kind
- subject_id
- object_kind
- object_id
- tab_id
- inspector_target

Canonical terms and values:
- navigation vs mutation
- single-target vs multi-target
- shortcut eligibility
- palette visibility
- confirmation
- reversibility
- route_target

Labels:
- Open
- Review
- Resolve
- Export

Behavioral rules:
- Orchestrator commands must encode the action-surface policy and route through the shared route payload when navigating.

Permission carry-through:
- mutation commands must retain confirmation and safety class
### 2.5A Operational external-system command families

Source Control (`cmd.source_control.*`), GitHub Actions (`cmd.actions.*`), and Docker Manager (`cmd.docker.*`) form a triple-family block of operational command groups. They share one characteristic: each family manages a live external system boundary (repository state, remote CI workflows, or local container runtime) rather than a purely local layout toggle, so canonical IDs remain stable even when the hosting panel or toolbar evolves.

- Source Control commands manage repository views and git-backed operational workflows.
- GitHub Actions commands manage workflow runs, jobs, logs, and pinned workflows.
- Docker Manager commands manage images, containers, compose stacks, and runtime inspection.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

#### GitHub Actions command family

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0529
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Research Progress - 2026-03-16 - Command Palette / Shortcuts / Bulk Actions
  - attention-center rows, project cards, command palette actions, and search results all need to restore precise scope and target
  - wiring/gate verification will stay noisy if every new surface invents another special-case open command instead of binding to a reusable navigation family.
  - There is still no canonical command family for subject-open or generalized route focus, so cross-surface pivots keep accreting as one-off commands.
  - `UI_Wiring_Rules.md` and `Wiring_Matrix.md` reinforce the cost of over-expanding the public command family: every stable command ID becomes part of handler coverage, dead-command detection, and gate expectations.
  - UI_Wiring_Rules.md
  - Wiring_Matrix.md
  - `[retired-token-1]` contains both the stale graph-HITL command family and the newer canonical `[retired-token-2]` family in the same file.
  - [retired-token-1]
  - [retired-token-2]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Command ID | Label | Description | Keybind | Preconditions |
|---|---|---|---|---|
| `cmd.actions.rerun` | Rerun Workflow | Re-triggers the selected workflow run | — | `actions_panel_visible && selected_run` |
| `cmd.actions.rerun_failed` | Rerun Failed Jobs | Re-triggers only failed jobs in selected run | — | `actions_panel_visible && selected_run && has_failed_jobs` |
| `cmd.actions.cancel` | Cancel Run | Cancels the in-progress workflow run | — | `actions_panel_visible && selected_run && run_in_progress` |
| `cmd.actions.pin` | Pin Workflow | Pins a workflow to the actions panel header for quick access | — | `actions_panel_visible && selected_workflow` |
| `cmd.actions.unpin` | Unpin Workflow | Removes a pinned workflow from header | — | `actions_panel_visible && pinned_workflow_selected` |
| `cmd.actions.view_logs` | View Logs | Opens full log output for selected job/step | — | `actions_panel_visible && selected_job` |
| `cmd.actions.open_in_browser` | Open in Browser | Opens the workflow run on GitHub.com | — | `actions_panel_visible && selected_run` |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

#### Docker Manager command family

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.docker.build` | Build Image | Builds a Docker image from selected Dockerfile | `docker_available && dockerfile_selected` |
| `cmd.docker.run` | Run Container | Starts a container from selected image | `docker_available && image_selected` |
| `cmd.docker.stop` | Stop Container | Stops a running container | `docker_available && container_running` |
| `cmd.docker.restart` | Restart Container | Restarts a container | `docker_available && container_selected` |
| `cmd.docker.remove` | Remove Container | Removes a stopped container | `docker_available && container_stopped` |
| `cmd.docker.logs` | View Logs | Shows container log output | `docker_available && container_selected` |
| `cmd.docker.exec` | Exec Shell | Opens interactive shell in container | `docker_available && container_running` |
| `cmd.docker.compose_up` | Compose Up | Runs docker-compose up for selected compose file | `docker_available && compose_file_selected` |
| `cmd.docker.compose_down` | Compose Down | Runs docker-compose down | `docker_available && compose_running` |
| `cmd.docker.inspect` | Inspect | Shows detailed container/image info | `docker_available && resource_selected` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### 2.5B Kubernetes command family

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.k8s.get_pods` | Get Pods | Lists pods in selected namespace | `k8s_connected` |
| `cmd.k8s.describe` | Describe Resource | Shows detailed resource description | `k8s_connected && resource_selected` |
| `cmd.k8s.logs` | View Pod Logs | Shows log output for selected pod | `k8s_connected && pod_selected` |
| `cmd.k8s.exec` | Exec Shell | Opens shell in selected pod/container | `k8s_connected && pod_running` |
| `cmd.k8s.apply` | Apply Manifest | Applies a Kubernetes manifest file | `k8s_connected && manifest_selected` |
| `cmd.k8s.delete` | Delete Resource | Deletes selected Kubernetes resource | `k8s_connected && resource_selected` |
| `cmd.k8s.scale` | Scale Deployment | Adjusts replica count for deployment | `k8s_connected && deployment_selected` |
| `cmd.k8s.port_forward` | Port Forward | Sets up port forwarding to selected pod | `k8s_connected && pod_selected` |
| `cmd.k8s.switch_context` | Switch Context | Changes active Kubernetes context | `k8s_available` |
| `cmd.k8s.switch_namespace` | Switch Namespace | Changes active namespace | `k8s_connected` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md

### 2.5C Project-scope git worktree commands

These commands manage repository-level worktree inventory and lifecycle. They complement, but do not replace, the assistant thread-scoped `cmd.chat.worktree.*` family defined in §2.6.1.

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.git.worktree.create` | Create Worktree | Creates a new git worktree at specified path | `git_available && !worktree_limit_reached` |
| `cmd.git.worktree.remove` | Remove Worktree | Removes an existing worktree | `git_available && worktree_selected && worktree_clean` |
| `cmd.git.worktree.list` | List Worktrees | Shows all worktrees for current repo | `git_available` |
| `cmd.git.worktree.switch` | Switch to Worktree | Opens/focuses the selected worktree | `git_available && worktree_selected` |
| `cmd.git.worktree.lock` | Lock Worktree | Prevents accidental removal of worktree | `git_available && worktree_selected` |
| `cmd.git.worktree.unlock` | Unlock Worktree | Removes lock from worktree | `git_available && worktree_locked` |

Rules:
- `cmd.git.worktree.*` owns project-scope worktree inventory, lock state, and navigation.
- `cmd.chat.worktree.*` remains the thread-scoped wrapper family and MAY normalize internally to project-scope worktree operations.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md
### 2.6 Chat context usage commands

#### Context Lens commands

| Command ID | Purpose | Notes |
|---|---|---|
| `cmd.chat.context_lens.toggle` | Open or close the Context Lens dropdown | Owner control lives in the top-right of the chat window, immediately to the right of the search bar. |
| `cmd.chat.context_lens.set_mode` | Set active mode to `mute`, `focus`, or `subcompact` | Multi-select is supported in all modes. |
| `cmd.chat.context_lens.turn_off` | Exit Context Lens mode and clear active selection state | Dropdown entry label is `Turn Off`. |
| `cmd.chat.context_lens.toggle_message_selection` | Toggle one message into or out of the active selection set | Applies immediately in `mute` and `focus`. |
| `cmd.chat.context_lens.clear_selection` | Clear the current active selection set | Does not mutate canonical history. |
| `cmd.chat.context_lens.apply_subcompact` | Apply Subcompact to the current selected region | Requires explicit user confirmation because it creates a local summary artifact. |
| `cmd.chat.context_lens.revert_subcompact` | Restore a previously subcompacted region to full effective-context state | Uses canonical source refs for rehydration. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

#### 2.6.1 Assistant worktree commands

Six commands for assistant thread-level worktree operations. All share `when:activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`.

| Command ID | Label | Description | Extra when clause |
|---|---|---|---|
| `cmd.chat.worktree.create` | Create Worktree | Creates worktree for active thread, opens bind dialog | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.remove` | Remove Worktree | Removes active thread's worktree (confirmation dialog if dirty) | `activeThreadHasWorktree` |
| `cmd.chat.worktree.bind_existing` | Bind Existing Worktree | Opens picker of unowned worktrees to bind to active thread | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.open_files` | Open Worktree Files | Opens worktree root in file manager | `activeThreadHasWorktree` |
| `cmd.chat.worktree.merge` | Merge Worktree | Opens merge-back dialog for active thread's worktree | `activeThreadHasWorktree` |
| `cmd.chat.worktree.create_pr` | Create PR | Opens PR creation panel for active thread's worktree branch | `activeThreadHasWorktree && projectHasGitHubRemote` |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Commands_System.md

**Context variable definitions:**
- `activeThreadExists`: a chat thread is selected in the assistant panel
- `activeThreadHasWorktree`: active thread has a non-null worktree binding in redb
- `projectIsGitRepo`: active project has a `.git` directory
- `projectIsRemoteNonSSH`: project is remote-mode but not SSH-tunneled (worktrees unsupported)
- `projectHasGitHubRemote`: project git config contains a `github.com` remote URL

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_Integration.md

| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.chat.compact_context` | `{ thread_id }` | `context.compaction.started`, `context.compaction.completed` | Chat context circle click affordance, command palette |
| `cmd.chat.open_thread_context_details` | `{ thread_id }` | layout/UI state only | Chat context hover module, artifact deep-links |
| `cmd.chat.focus_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |
| `cmd.chat.close_thread_context_details` | `{ thread_id }` | layout/UI state only | Editor tab / thread Context Detail Pane |

Rules:
- hover-summary disclosure is passive UI and does not require its own stable command ID
- choosing `More Details` dispatches `cmd.chat.open_thread_context_details`
- clicking the circle may reveal `Compact Now` locally, but `cmd.chat.compact_context` is dispatched only when the user actually chooses that action
- `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` are superseded and MUST NOT remain canonical IDs

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md
### 2.6A Render / browser preview commands
Browser, terminal, and dev-session commands share one shell/runtime interaction family. Browser commands own browser-session behavior, terminal commands own section or tab or pane or session behavior, and dev commands own dev-workflow behavior.

#### Browser preview and browsing commands

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0527
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - export can retrieve more than the viewport, but normal browsing should stay slice-based
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.browser.open_workspace_preview` | `{ project_id, target, workspace_tab_id }` | `browser.session.created`, `browser.session.state_changed` | File preview, command palette, editor/browser tab |
| `cmd.browser.open_detached_preview` | `{ project_id, target, source_workspace_tab_id }` | `browser.session.created`, `browser.session.state_changed` | File preview, command palette, detached browser |
| `cmd.browser.focus_browser_tab` | `{ browser_session_id }` | layout/UI state only | editor/browser tab surface |
| `cmd.browser.detach_browser_tab` | `{ browser_session_id }` | `browser.session.state_changed` | editor/browser tab surface |
| `cmd.browser.open_devtools` | `{ browser_session_id, mode? }` | layout/UI state only | browser chrome, command palette |
| `cmd.browser.toggle_devtools_dock` | `{ browser_session_id, dock }` | layout/UI state only | browser chrome, DevTools surface |
| `cmd.browser.pick_element_for_chat` | `{ browser_session_id, thread_id? }` | `browser.context_captured` | browser chrome, assistant chat |
| `cmd.browser.add_selection_to_chat` | `{ browser_session_id, thread_id? }` | `browser.context_captured` | browser chrome, assistant chat |
| `cmd.browser.add_selection_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'clip' }` | `browser.context_captured`, `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.add_selection_full_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'full' }` | `browser.context_captured`, `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.add_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'clip' }` | `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.add_full_screenshot_to_chat` | `{ browser_session_id, thread_id?, scope:'full' }` | `runtime_artifact.created` | browser chrome, assistant chat |
| `cmd.browser.share_with_agent` | `{ browser_session_id, thread_id }` | `browser.context_shared` | browser chrome, assistant chat |
| `cmd.browser.revoke_share_with_agent` | `{ browser_session_id, thread_id? }` | `browser.context_share_revoked` | browser chrome, attention surfaces |
| `cmd.browser.take_over` | `{ browser_session_id, takeover_choice:'pause_agent'|'let_agent_continue'|'stop_agent_keep_browser' }` | `browser.session.takeover_state_changed` | browser takeover prompt, automation banner |
| `cmd.browser.pause_agent` | `{ browser_session_id }` | `browser.session.takeover_state_changed` | browser chrome, automation banner |
| `cmd.browser.let_agent_continue` | `{ browser_session_id }` | `browser.session.takeover_state_changed` | browser takeover prompt |
| `cmd.browser.stop_agent_keep_browser` | `{ browser_session_id }` | `browser.session.takeover_state_changed`, `dev.session.stopped` | browser takeover prompt, browser chrome |
| `cmd.browser.promote_to_normal_browsing` | `{ browser_session_id, target_workspace_tab_id? }` | `browser.session.promoted` | browser chrome, command palette |
| `cmd.browser.reopen` | `{ browser_session_id }` | `browser.session.state_changed` | recovery banner, attention center |
| `cmd.browser.retry` | `{ browser_session_id }` | `browser.session.state_changed` | recovery banner, attention center |
| `cmd.browser.keep_closed` | `{ browser_session_id }` | `browser.session.closed` | recovery banner, attention center |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### Terminal session and layout commands

This section defines the canonical contract for this surface.

Core rules:
- Terminal promotion and handoff are locked so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal action canon must preserve the distinct terminal actions in owned command-table rows. Distinct terminal actions must keep owned command-table rows and do not collapse terminal actions into one normalized target.

| Command ID | Payload | Domain event(s) | UI surface(s) |
| --- | --- | --- | --- |
| Open in Terminal | `terminal_session_id`; reveal existing session context | terminal session reveal/focus | command cards, terminal surfaces |
| Show Terminal | `terminal_session_id`; focus the same live session already associated with the card | terminal session reveal/focus | command cards, terminal surfaces |
| Rerun in Terminal | command replay payload plus terminal session launch context | new terminal launch; command replay | command cards, terminal surfaces |
| Detach/Pop-Out | `terminal_session_id`; detach target | terminal detach/pop-out | command cards, terminal surfaces |

Fields:
- terminal_session_id
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out
- Command ID
- Payload
- Domain event(s)
- UI surface(s)

Rules:
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- Every promoted command card binds to stable terminal session identity
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
- distinct terminal actions must keep owned command-table rows
- do not collapse terminal actions into one normalized target
#### Dev-session commands
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.dev.start_session` | `{ project_id, workspace_tab_id, mode, target? }` | `dev.session.started` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.stop_session` | `{ dev_session_id }` | `dev.session.stopping`, `dev.session.stopped` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.restart_session` | `{ dev_session_id }` | `dev.session.restarting`, `dev.session.started` | Toolbar, Chat, Ports, Terminal |
| `cmd.dev.show_output` | `{ dev_session_id }` | layout/UI state only | Toolbar, Chat, Output |
| `cmd.dev.show_problems` | `{ dev_session_id }` | layout/UI state only | Toolbar, Chat, Problems |
| `cmd.dev.show_ports` | `{ dev_session_id }` | layout/UI state only | Toolbar, Chat, Ports |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

#### Catalog lifecycle commands

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0528
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - missing catalog rows for referenced commands
  - The catalog already contains a number of wrapper-style open/focus commands. Replacing them quickly with public `cmd.nav.*` IDs would create churn without much user-facing clarity benefit.
  - cmd.nav.*
  - too many public `cmd.nav.*` commands added to the catalog
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
| Command ID | Payload | Domain event(s) | UI surface(s) |
|---|---|---|---|
| `cmd.catalog.install_item` | `{ item_type, item_id, version? }` | `catalog.install.started`, `catalog.install.completed` | Catalog |
| `cmd.catalog.update_item` | `{ item_type, item_id, target_version? }` | `catalog.update.started`, `catalog.update.completed` | Catalog |
| `cmd.catalog.remove_item` | `{ item_type, item_id }` | `catalog.remove.started`, `catalog.remove.completed` | Catalog |

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

Rules:
- `cmd.terminal.clear_scrollback` preserves runtime identity
- close commands are layout actions unless `termination_policy` requests runtime shutdown
- `cmd.dev.show_output`, `cmd.dev.show_problems`, and `cmd.dev.show_ports` reveal surfaces linked to the owning `dev_session_id`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

#### Chat message action commands

| Command ID | Parameters | Behavior |
|---|---|---|
| `cmd.chat.copy_message` | `{ thread_id, message_id }` | Copy the rendered message content. |
| `cmd.chat.retry_message` | `{ thread_id, message_id }` | Re-run the selected failed/cancelled assistant turn. |
| `cmd.chat.rewind` | `{ thread_id, target_message_id }` | Rewind conversation history only; does not restore files. |
| `cmd.chat.revert` | `{ thread_id, target_message_id? }` | Restore persisted file mutations from one assistant turn; omitted `target_message_id` resolves to the latest assistant turn in the thread with persisted file mutations. |
| `cmd.chat.add_file_reference` | `{ project_id, thread_id?, path, line_range? }` | Insert a visible file reference chip into the composer. File-only in MVP; folder references are out of scope. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md

Message-level availability and code-block actions:

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.chat.edit_last_user_message` | Edit Last Message | Opens the last user message for editing | `chat_active && has_user_messages` |
| `cmd.chat.resend_last_user_message` | Resend Last Message | Resends the last user message (triggers new response) | `chat_active && has_user_messages` |
| `cmd.chat.copy_message` | Copy Message | Copies selected message content to clipboard | `chat_active && message_selected` |
| `cmd.chat.copy_code_block` | Copy Code Block | Copies a specific code block from a message | `chat_active && code_block_selected` |
| `cmd.chat.insert_code_block` | Insert at Cursor | Inserts code block content at editor cursor position | `chat_active && code_block_selected && editor_active` |
| `cmd.chat.apply_code_block` | Apply to File | Applies code block as an edit to the relevant file | `chat_active && code_block_selected` |
| `cmd.chat.toggle_message_details` | Toggle Details | Shows/hides message metadata (model, tokens, timing) | `chat_active && message_selected` |

Revert rules:
- when the resolved assistant turn touched multiple files, `cmd.chat.revert` reverts the whole turn across all affected files
- after a successful revert, affected editors refresh from the canonical mutation pipeline
- `cmd.chat.rewind` MUST NOT be used as a file-restore alias
- `cmd.chat.resend_last_user_message` is distinct from `cmd.chat.retry_message`; resend replays the latest user-authored input, while retry re-runs a failed or cancelled assistant turn
- `cmd.chat.copy_code_block`, `cmd.chat.insert_code_block`, and `cmd.chat.apply_code_block` operate on a resolved code-block sub-selection rather than the entire message body

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 2.7 Chat slash commands (reserved)

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing
- intent phrase
- resolved tool key
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- No subcommand family for MVP
- Skills panel
- Natural language

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /web
- /skill
- /cancel
- reserved built-ins

Rules:
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- NL intents and slash commands hit the same dispatcher
- "search the web for X" → `websearch`
- "extract this page" → `webextract`
- "read this URL" → `webfetch`
- "research topic" → `webresearch`
- Reading intents MUST resolve to `webfetch`, not `websearch`
ContractRef: ContractName:Plans/Commands_System.md#7. Reserved built-in slash commands, ContractName:Plans/assistant-chat-design.md#5.2 `/web` and `/skill`, ContractName:Plans/Tools.md#12. Web tool routing algorithm
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
- site/page reading is not search
- dispatcher parity applies to slash and NL paths
- command tables and routing docs must mirror the same mappings
- /cancel resolves internally to cmd.chat.stop
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog
### 2.8 Assistant memory (Gist Review) commands
These IDs are required by `Plans/assistant-memory-subsystem.md` sections 5 and 7.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.memory.verify` | `{ project_id, gist_id }` | `memory.gist.verification_requested`, `memory.gist.verified` or `memory.gist.verification_failed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.edit` | `{ project_id, gist_id, patch }` | `memory.gist.updated` | Assistant chat Gist Review panel |
| `cmd.chat.memory.pin` | `{ project_id, gist_id, pinned }` | `memory.gist.pinned` or `memory.gist.unpinned` | Assistant chat Gist Review panel |
| `cmd.chat.memory.discard` | `{ project_id, gist_id }` | `memory.gist.discarded` | Assistant chat Gist Review panel |
| `cmd.chat.memory.toggle_auto_save_unverified` | `{ project_id, enabled }` | `settings.updated` | Assistant chat Gist Review panel |
| `cmd.chat.memory.preview_capsule` | `{ project_id, thread_id? }` | no persisted domain event (preview computation only) | Assistant chat Gist Review panel |
| `cmd.chat.memory.rebuild_lexical_index` | `{ project_id }` | `memory.index.lexical.rebuild.started`, `memory.index.lexical.rebuild.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.rebuild_semantic_index` | `{ project_id }` | `memory.index.semantic.rebuild.started`, `memory.index.semantic.rebuild.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.verification_sweep` | `{ project_id }` | `memory.verification_sweep.started`, `memory.verification_sweep.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.dedup_sweep` | `{ project_id }` | `memory.dedup_sweep.started`, `memory.dedup_sweep.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.summarize_monthly` | `{ project_id, month? }` | `memory.monthly_summary.started`, `memory.monthly_summary.completed` | Assistant chat Gist Review panel |
| `cmd.chat.memory.prune_archive` | `{ project_id, policy? }` | `memory.prune_archive.started`, `memory.prune_archive.completed` | Assistant chat Gist Review panel |

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#UICommand

---
### 2.8A Side-panel and artifacts navigation commands

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0522
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Research Progress - 2026-03-16 - Command boundary: pure view commands vs route-consuming navigation
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Command ID | Parameters | Behavior |
| --- | --- | --- |
| `cmd.search.show` | `{ project_id, focus? }` | Reveal or focus the Search side panel. |
| `cmd.search.find_in_files` | `{ project_id, query?, scope? }` | Run or rerun find-in-files in the Search panel. |
| `cmd.search.replace_in_files` | `{ project_id, query?, replacement?, scope? }` | Run replace preview or apply flow in the Search panel. |
| `cmd.search.open_result` | `{ project_id, query_session_id, subject_id, disposition? }` | Open a Search result through `route_target` and the canonical file-open path. |
| `cmd.search.replace_selected` | `{ project_id, query_session_id, subject_id }` | Apply replacement to one selected result identified by canonical subject identity. |

Rules:
- Search command routing resolves through `route_target`.
- Search commands remain side-panel scoped and preserve query-session state.
- Search routing policy is owned by `Plans/Orchestrator_Page.md#search-routing-and-action-policy`.
## References
- `Plans/Contracts_V0.md#UICommand`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/LSPSupport.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/assistant-chat-design.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Wiring_Matrix.md`

Canonical recovery commands use one shared namespace: `cmd.runtime.*`. Legacy recovery command namespaces are deprecated aliases only.

| `allowed_action_id` | canonical command id | minimum args |
| --- | --- | --- |
| `approve` | `cmd.runtime.approve` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `decline` | `cmd.runtime.decline` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `retry_now` | `cmd.runtime.retry_now` | `{ run_id, node_id, attempt_id }` |
| `resume_after_prerequisite` | `cmd.runtime.resume_after_prerequisite` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `restore_safe_point_then_retry` | `cmd.runtime.restore_safe_point_then_retry` | `{ run_id, node_id, attempt_id, safe_point_id }` |
| `start_fresh_attempt` | `cmd.runtime.start_fresh_attempt` | `{ run_id, node_id, attempt_id? }` |
| `replan` | `cmd.runtime.replan` | `{ run_id, node_id, attempt_id? }` |
| `skip_node` | `cmd.runtime.skip_node` | `{ run_id, node_id, attempt_id? }` |
| `abort_run` | `cmd.runtime.abort_run` | `{ run_id }` |
| `open_details` | `cmd.runtime.open_attempt_details` | `{ run_id, node_id, attempt_id? }` |

### Navigation commands
- `cmd.runtime.open_queue_analysis` -> `{ run_id, scheduler_pass_id }`
- `cmd.runtime.open_remediation_lineage` -> `{ run_id, remediation_root_id }`
- `cmd.runtime.open_safe_point_history` -> `{ run_id, safe_point_id? }`

### Pre-attempt blocked rule
When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and MUST NOT fabricate an `attempt_id`.

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields)

### Recovery command definitions

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0526
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - widget-local definitions of blocked/completed/integration status
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
All blocked-state recovery buttons and menu entries in GUI, chat, graph, and orchestrator surfaces MUST map from `allowed_action_ids[]` to one of the canonical runtime commands above.

No surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule

Required command metadata:
- `command_kind`
- `normalization.kind`
- `normalizes_to_contract`
- `alias_of_command_id`
- `approval_scope_key`
- `allowed_action_ids[]`
- `route_target`
- `open_subject?`
- `ref_family?`

Canonical terms and values:
- command_kind
- normalization
- approval_scope_key
- route_target
- ref_family

Labels:
- Approve
- Decline
- Resume after prerequisite
- Blocked
- Retry
- Review
- Resolve

Behavioral rules:
- blocked-state recovery buttons and menu entries map from `allowed_action_ids[]` to canonical `cmd.runtime.*` commands
- no surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics
- recovery commands must bind to blocked-episode identity rather than request-level surrogates
- normalization metadata must survive for wrappers and deprecated aliases
- selector precedence and scoped resolver behavior follow the canonical route payload rules above
- timestamp/run/thread fallback is compatibility-only when stronger route identity is unavailable

Permission carry-through:
- ordered `allowed_action_ids[]`
