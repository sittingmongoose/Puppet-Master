# Shard 028: PlanUnits

Source: `Plans/FileSafe.md`

Source lines: L2718-L2966

Source SHA256: `e1b21792c65a208210c56da93c97e04b6ff4f353643da088ea73c038f1eb5214`

---

## PlanUnits

### F2-001 - FileSafe -- Implementation Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: F2-001
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: Plans/FileSafe.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/FileSafe.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FileSafe-S0110
preserved_exact_tokens:
- FileSafe -- Implementation Plan
- DRY Method Compliance
- Rewrite alignment (2026-02-21)
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md'
- Executive Summary
- Part A -- FileSafe
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md'
- Part B -- Compiled-context safety boundary
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
- Table of Contents
- 1. Architecture Overview
- 1.1 Three-Layer Defense
- 1.1A Runtime and GUI configuration boundary
- 1.2 Integration Point
- 'ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command'
- 2. Implementation Details
- 2.0 Initialization Flow
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md'
- 2.1 Module Structure
- 2.2 Core Types
negative_constraints:
- 'Routing/open seams stay owner-doc inputs but become FileSafe verification inputs when they gate mutation or reveal behavior: `route_target` must not carry `source-buffer` realization details, `/file/evidence` and `/attempt/generated` surfaces must expose first-class project/attempt/generated identit'
- Doc-change mutation surfaces are narrowed to the shared `Plans/Contracts_V0.md` payload contract plus FileSafe guard outcomes; other docs may consume those records but must not mint a competing doc-change authority.
- Configuration rendering keeps `inherit/override`, `requested/effective`, and provider `honored/skipped/clamped` states visually distinct; `/override`, `/effective`, and `/skipped/clamped` labels must not be collapsed into one toggle state.
- 'Execution correlation must not drift back to tier-era labels: `tier_id` is human-readable grouping metadata only, and treating it as a canonical execution key is surface-drift.'
- '- invalid config may normalize only to a stricter safe default; it MUST NOT silently widen authority'
- '- Non-JSON `codex exec` exposes `session id`, selected model `/provider/effort`, and a final `tokens used` summary; FileSafe may record those values as execution metadata but must not treat them as authorization by themselves.'
- '- `provider_usage_source_kind?` and `provider_signal_confidence?` may annotate usage evidence quality; they must not cram live overlay policy or full projection details into every runtime snapshot.'
- '- PM MUST NOT maintain a second authoritative FileSafe append log alongside seglog, and recovery logic MUST NOT prefer a FileSafe-only mirror over the canonical event stream.'
- This checklist tracks implementation work for the already-locked FileSafe canon. Checklist items must implement the owner rules in Sections 11.1.1-11.1.2a and MUST NOT reopen those rules as design questions.
- '- replacement writes MUST use same-directory temp files only: `<target>.tmp.<random>` in the target directory, `fsync(temp)`, then atomic rename over the target; per-session temp directories are valid for scratch artifacts and janitor-managed temp state, but MUST NOT be used for replacement writes t'
- '- janitor cleanup MUST NOT delete live session backups or safe-point records that are still referenced by an active session lineage'
- '- The `nothing to commit` case may remain informational for commit-only flows, but it MUST NOT downgrade real staging, stash, or checkout failures into success-shaped state.'
- '- If attachment forwarding is blocked, the runtime must emit an explicit block result and visible reason code; it must not pretend the context was sent successfully.'
- Pending selection chips that cannot be restored safely because the source is missing, sensitivity is blocked, or the target thread was deleted must restore as explicit blocked or `/expired` chips instead of disappearing. Searchable records are `/searchable` only as bounded summaries plus `/provenanc
- 'AutoDecision: `approved_commands` matching is **exact** after normalization (`trim` + collapse whitespace). Do not use prefix/substring matching.'
- '- `maintenance_recovery` is reserved for restore/cleanup/recovery flows and must not silently broaden into general execution.'
- Profile selection derives from effective run mode, operation class, and target capabilities. It MUST NOT depend on legacy Phase/Task/Subtask/Iteration naming.
- '- Blocked-state payloads use `blocked_reason_code`, ordered `allowed_action_ids[]`, `blocked_sequence`, `preserved-local-work`, prerequisite metadata, and `detail_ref?`; deprecated field names such as `allowed_actions[]` and `blocked_reason` must not appear in new canonical schemas.'
- '- Bulk recovery actions require exact target preview: retry-many-node, graph-patch-multiple-scope, approve-many-`HITL` `/runtime` blocked actions, and cleanup `/remove` over live lanes or `/worktrees` must not share one generic confirm.'
- '- `UI_Command_Catalog.md` (`UI_Command_Catalog`) is a projection over canonical FileSafe `/recovery` payloads; catalog copy must not contradict the runtime action IDs or allowed-action ordering.'
- FileSafe must not silently convert a denial into a retryable transient error.
compatibility_only_notes:
- Prompt/context compilation is adjacent but separately owned. `Plans/Prompt_Pipeline.md` owns run/work-package/node/attempt-scoped context selection, delta compilation, cache heuristics, skill bundling, and compaction behavior. FileSafe consumes the compiled prompt, structured attachments, and run/no
- 'Config keys remain `bash_guard` / `file_guard` for backward compatibility; GUI labels: "Command blocklist", "Write scope", "Security filter".'
- 'Resolved fidelity blockers `LF-002` and `LF-005` are mutation-integrity obligations, not open checklist design items. The implementation checklist cross-references `#### 11.1.2a Optimistic concurrency for mutable rewrites` for the locked hard-error and post-staging verification behavior, and treats '
- '- [ ] Emit compatibility `filesafe.snapshot_created`, `filesafe.snapshot_conflict`, and `filesafe.snapshot_restore` events only when they map to the Contracts-owned `safe_point.created` / `safe_point.restored` payload contract, with stable snapshot/safe-point identifiers and conflict or restore outc'
- 'Storage and usage safety consumes `### Naming and migration rules`, the app-data-root selection, `/unsafe-filesystem` fallback, bounded-collections retention, and the canonical usage cost field `cost_microdollars: u64`. The legacy `estimated_cost_usd: f64` value is display or migration evidence only'
- 'Rewrite-conflict detection is not mtime-based alone: every managed-mutation records `read_revision={mtime_ns, content_sha256}` and re-checks both components before promotion. Mismatches emit the canonical `concurrent_edit_conflict` / `error.concurrent_edit_conflict` GuardError, preserve same-directo'
- Doc-set searches and stale-legacy-term audits are verification evidence, not FileSafe policy. EXEC/file-record map concerns are satisfied by the LRU cap above, and unresolved TODO items for symlink handling are closed by the realpath-before-scope-check and case-folding contracts.
- Profile selection derives from effective run mode, operation class, and target capabilities. It MUST NOT depend on legacy Phase/Task/Subtask/Iteration naming.
stale_retired_dispositions:
- 'Plans review synthesis informs FileSafe applicability without creating a new process artifact owner: `plans_review_findings` and `plans_review_summaries` recorded highest-confidence strengths in FileManager shared-buffer `/file-tree` behavior, preview `/file-type` behavior, source-canonical editors,'
- Guard-visible inputs include typed resource identity, `/open/reveal/save`, `/dirty/recovery/on-disk`, external-change detection, grouped `/undo` / `/redo`, `/symlink/case-sensitivity`, `/IME/accessibility`, `/browser/session`, `/webview`, search-in-diff, heat-map, `/change-marker`, and requested-vs-
- 'FileSafe treats the routing/open-by-identity tranche as ordered reconciliation rather than broad invention: first close the one owner-doc structural gap, then the one command/wiring normalization gap, and only then accept the bounded set of stale consumer reconciliations as guard-ready inputs.'
- FileSafe GUI configuration recomputes predicted requested/effective state for effective-runtime interactions when the user changes provider/account/model/threshold/effort settings, preserving the `/account/model/threshold/effort` context instead of showing stale state.
- 'Resolved fidelity blockers `LF-002` and `LF-005` are mutation-integrity obligations, not open checklist design items. The implementation checklist cross-references `#### 11.1.2a Optimistic concurrency for mutable rewrites` for the locked hard-error and post-staging verification behavior, and treats '
- '- boot/startup janitor sweeps stale `.tmp.*` artifacts from incomplete writes'
- '- stale-temp cleanup emits a structured recovery event when artifacts are removed'
- 'Packet anchor-staleness is guard evidence, not FileSafe ownership expansion. Adjacent owner routing stays outside FileSafe: orchestrator cleanup must hit the later `Gap #45`, `child-runtime`, and crew-summary sections rather than earlier executive/config blocks; `Plans/CLI_Bridged_Providers.md` owns'
- '`research_packet.json` path-level over-scope is also guard evidence only: a stale extra `Plans/MCP_Integration.md` (`/MCP_Integration.md`) packet path does not expand FileSafe ownership unless the MCP material creates a concrete compiled-prompt, executable-surface, write-scope, or mutation-safety co'
- 'Drift-risk checks that compare `Contracts_V0.md#4.1 AuthState` against omission/null-padding rules and `FileSafe.md#11.1.2a Optimistic concurrency for mutable rewrites` against exact contract identifiers are valid verification inputs, but stale packet over-coverage and stale replacement bodies must '
- '`LFA-002` remains the FileSafe managed-mutation integrity check: any stale packet body that omits the exact `#### 11.1.2a Optimistic concurrency for mutable rewrites` anchor, `/pre-promote` / pre-rename recheck, `read_revision={mtime_ns, content_sha256}`, `error.concurrent_edit_conflict`, or post-`g'
- 'Account and billing safety consumes `### 4.1 AuthState` and `### Billing entity field contract` from `Plans/Contracts_V0.md`: selected `billing_entity` values are omitted when not applicable and are not null-padded, with `/presence` determined by the owner contract. `/null-padding`, `auth_realm = nu'
- 'Atomic replacement uses the atomic-write contract from Section 11.1.2: same-directory temp-dir files, `temp -> fsync -> rename`, and boot/startup `/janitor` cleanup for stale rewrite remnants. File records remain bounded by the LRU cap above, and LRU eviction must rebuild from canonical event state '
- 'Rewrite-conflict detection is not mtime-based alone: every managed-mutation records `read_revision={mtime_ns, content_sha256}` and re-checks both components before promotion. Mismatches emit the canonical `concurrent_edit_conflict` / `error.concurrent_edit_conflict` GuardError, preserve same-directo'
- Doc-set searches and stale-legacy-term audits are verification evidence, not FileSafe policy. EXEC/file-record map concerns are satisfied by the LRU cap above, and unresolved TODO items for symlink handling are closed by the realpath-before-scope-check and case-folding contracts.
- '- `GATE-010` must have a verification home for route-aware FileSafe checks: stale or `/degraded` revalidation, `allowed_action_ids[]`, blocked-action admissibility, route-payload mismatch, alias/deprecation findings, and passthrough/correlation failures use named machine-readable-detail arrays align'
- Allow different guard strictness by **runtime profile**, not by deprecated tier names.
- '- The stale TODOs for real-worktree-root comparison and unresolved-alias rejection are already-resolved owner canon; checklist prose must use this /cross-reference instead of presenting them as open TODO / TODOs.'
- '- Blocked-state payloads use `blocked_reason_code`, ordered `allowed_action_ids[]`, `blocked_sequence`, `preserved-local-work`, prerequisite metadata, and `detail_ref?`; deprecated field names such as `allowed_actions[]` and `blocked_reason` must not appear in new canonical schemas.'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- emitting guard decisions, violations, and remediation into the canonical seglog event stream'
- Any UI or storage examples in this plan are illustrative unless they describe guard behavior, fail-closed execution, canonical logging, or explicit FileSafe-owned payload contracts.
- 'Plans review synthesis informs FileSafe applicability without creating a new process artifact owner: `plans_review_findings` and `plans_review_summaries` recorded highest-confidence strengths in FileManager shared-buffer `/file-tree` behavior, preview `/file-type` behavior, source-canonical editors,'
- FileSafe implementation guidance keeps a hard boundary between portable product ideas and implementation patterns tied to Electron/DOM-heavy stacks. Guard logic, canonicalization, mutation-safety, /durability, atomic write, optimistic concurrency, and event logging must remain safe for a Rust + Slin
- External implementation-reference findings refine this boundary without creating FileSafe ownership over FileManager, FinalGUI, preview/browser, terminal, platform-adapter, diff/review, SSH/remote, preview/media, drag/drop, or file explorer correctness. FileSafe consumes those adjacent contracts onl
- Guard-visible inputs include typed resource identity, `/open/reveal/save`, `/dirty/recovery/on-disk`, external-change detection, grouped `/undo` / `/redo`, `/symlink/case-sensitivity`, `/IME/accessibility`, `/browser/session`, `/webview`, search-in-diff, heat-map, `/change-marker`, and requested-vs-
- 'Orchestrator `live-status` dependencies must bind FileSafe-relevant actions through canonical runtime blocked identity: request-centric `HITL` bindings and blocked-projection bindings cannot compete or decide recovery authority independently.'
- 'Routing/open seams stay owner-doc inputs but become FileSafe verification inputs when they gate mutation or reveal behavior: `route_target` must not carry `source-buffer` realization details, `/file/evidence` and `/attempt/generated` surfaces must expose first-class project/attempt/generated identit'
- 'FileSafe treats the routing/open-by-identity tranche as ordered reconciliation rather than broad invention: first close the one owner-doc structural gap, then the one command/wiring normalization gap, and only then accept the bounded set of stale consumer reconciliations as guard-ready inputs.'
- '`runtime-era` concepts in adjacent docs are not sufficient until registration/verification/routing owners expose them as guard-ready contracts; if owner docs lag, FileSafe records the seam as a `/verification/routing` or `spec-integrity` failure instead of accepting broad claims from `Orchestrator_P'
- An advertised missing section in `Orchestrator_Page.md` is a `spec-integrity` failure, not merely a content gap, when FileSafe must rely on that owner claim for guard-visible routing or verification.
- Shell/view restore fields such as `active_subview`, compare target, widget configuration, panel docking state, split ratios, and per-project restore state are shell-state inputs layered under canonical routing; FileSafe may audit them only when they change mutation prompting, recovery, or guard-visi
- Execution/runtime transport remains a separate seam with explicit request/response/error ownership before spawn. FileSafe may block terminal-first, Unix-native, single-snippet, and `/browser-runner` flows that depend on direct `/bin/sh`, Unix signals, VTE/TTY, `/input/cursor/selection`, IME, platfor
- FileSafe is the canonical guardrail layer that blocks destructive commands before execution, constrains write scope, filters sensitive file access, validates compiled prompt content, and records guard outcomes in the canonical event stream.
- '2. **FileSafe: Write scope** -- Restricts writes to the canonical allowed-file scope for the execution.'
- '### Part B -- Compiled-context safety boundary'
- '### 1.1A Runtime and GUI configuration boundary'
- 'Execution correlation must not drift back to tier-era labels: `tier_id` is human-readable grouping metadata only, and treating it as a canonical execution key is surface-drift.'
- '- resolve FileSafe guard inputs and canonical roots'
- '- initialize `BashGuard` with canonical destructive-pattern sources'
- '- initialize `SecurityFilter` with canonical sensitive-path rules'
- '- bind the request''s canonical allowed-file scope'
- '- resolve the canonical root and path mode needed for scope/security checks'
owner_hints:
- Plans/FileSafe.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

