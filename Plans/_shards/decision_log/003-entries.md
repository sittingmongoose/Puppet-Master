# Shard 003: Entries

Source: `Plans/Decision_Log.md`

Source lines: L13-L3502

Source SHA256: `7def4e82703338f3baacffc544a4432bb37b0ca347d0fc9402ed0a56b3af97d5`

---

## Entries


### DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems
The mapping captured in `OpenCode_Deep_Extraction.md` remains a reference aid, but local canonical contracts still control final ownership in Puppet Master.

### DL-002: Section numbering shift in OpenCode_Deep_Extraction.md
Section-number drift in the extraction source must not become canonical drift in local SSOT docs.

### DL-003: Orchestrator execution model
The canonical orchestration model is the node graph. `Feature Seam` and `Work Package` are first-class graph-owned objects, and `Node` remains the smallest executable unit.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md

### DL-004: Governance split
`Package Overseer` and `Seam Overseer` are distinct governance roles. Runtime remains the canonical owner of readiness, blockers, transitions, retries, and dispatch.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md

### DL-005: Completion and promotion model
`Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct. Package completion alone is insufficient.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md

### DL-006: Weak integration
Weak integration remains first-class and includes runtime/GUI mismatch, contract mismatch, workflow gaps, and architecture drift.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Glossary.md

### DL-007: Corroboration threshold
High-impact claims use deterministic `2-of-3` corroboration. Lesser unresolved concerns remain visible as non-blocking advisory concerns.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md

### DL-008: Graph patch lineage


Graph patching creates a new graph generation and preserves superseded historical paths as visible lineage.

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### DL-009: Source Control boundary
Source Control is worktree-first and compact. Orchestrator carries lane/package/seam operational context.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md

### DL-010: Shared runtime identity
Requested/effective runtime identity is shared across assistant, interviewer, builders, overseers, and node workers without collapsing those actors into one ontology.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

### DL-011: Blocked approval identity
Blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?` supersede request-centric HITL identity as canonical runtime approval scope.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md

### DL-012: Navigation primitives


`route_target` is the canonical navigation contract. `OpenSubject` is the canonical identity-native source-open contract. `resume_url` is serialized transport only.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md

### DL-013: Debug evidence capture hygiene
Debug instrumentation and investigation evidence follow a non-citation operational ledger rule: secrets in logs, PII, and diff fatigue must be planned for up front, and downstream captures should use allowlisted log shapes or structured fields rather than free-form dump capture.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### DL-014: Shared provider-runtime actor envelope
The shared provider-runtime contract applies beyond Orchestrator: `Multi-Account.md` governs assistant, interviewer, requirements builder, PRD builder, overseers, node workers, and provider-backed chat/tool turns. Requested and effective `/model/effort/persona/auth/account`, `/effective` identity, provider-runtime selection reason, `/tool` context, and PRD/account lineage are shared runtime concepts. A first-class actor envelope is required for non-run auditability and replay: `Models_System.md` keeps provider/model/variant selection, `Prompt_Pipeline.md` carries `actor_kind` and `execution_role`, and `storage-plan.md` must not key provider account snapshots only by `run_id` when `/runtime` actors include assistant, interviewer, builders, overseers, and node workers.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

### DL-015: Support decision drift and sharding settings
Supporting planning machinery is not exempt from decision traceability: `Plans/sharding_config.json` (`/sharding_config.json`) and `Plans/auto_decisions.jsonl` (`/auto_decisions.jsonl`) must not disagree on fallback `chunk-line` settings, because `/decision` state drift in support files can still corrupt owner/consumer reconciliation.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md

### DL-016: Governance labels, completion states, and copy boundaries
Canonical copy favors precise runtime and user-facing labels. Object/action labels include `Seams`, `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, `Locally Complete`, `Seam Complete`, `Completion Blocked`, `Weak Integration`, `Promotion Blocked`, `Promotion Revoked`, `Corroboration Requested`, `Challenge Accepted`, `Challenge Not Accepted`, `Advisory Concern Recorded`, `Graph Patch Requested`, `Graph Patch Applied`, and `Generation Updated`; `/labels`, `/action`, `/runtime`, and `/object` consumers must not invent alternate peer terms.

Governance semantics stay graph-owned: a `run` is the full canonical graph under deterministic runtime control, a `work package` is a coherent precomputed subgraph with a local overseer, a `feature seam` is a cross-package oversight scope, and a `node` is the smallest executable work unit. Overseers may critique or challenge package outcomes, but newly discovered work becomes explicit remediation nodes or graph-patch requests; `/corroboration` agents may be used before accepting high-impact, cross-package challenge gaps, and seam completion requires integration quality rather than package-local pass states alone.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Decision_Policy.md

### DL-017: Seam visibility, weak integration, and reopen policy
Weak integration is not just a badge. Seams UI must summarize weak integration visibly and group concerns under readable headings such as Wiring, Workflow, State, GUI, and Design. Package issues roll up to seam concerns only when they cross package-to-seam, `/seam/user-visible`, or user-visible boundaries or affect seam completion truth. `Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct from `Lane to Package`, `Package to Seam`, and `Seam Completion` promotion boundaries.

Revocation and reopen semantics are explicit named states: `Promotion Revoked`, `Seam Completion Revoked`, `Reopened`, `Reopened by Patch`, and `Reopened by New Evidence`. Blocked states expose blocked reason, blocked owner, and recovery context. Weak-integration buckets include missing GUI representation of runtime/governance state, state-model mismatch across package boundaries, user-flow dead ends or partial affordances, contract drift, duplicated interpretation across packages, technically passing local checks while seam-level UX or architecture remains poor, GUI/runtime mismatch, incomplete end-to-end flow, cross-package state mismatch, local-pass/global-fail composition, missing degraded `/recovery` behavior, inconsistent UX semantics, cross-seam architecture drift, and invisible governance or missing operator affordances. `Decision_Policy` needs first-class policy objects and transitions for concerns, corroboration, promotions, and superseded `/revoked/reopened` states.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Glossary.md

### DL-018: Approval anchoring and evidence-schema governance
Approval anchoring moves to canonical runtime identity: `run_id`, `node_id`, `blocked_sequence`, optional `attempt_id`, and execution-unit context refs supersede request-centric button copy, request-centric persistence language, and tier-boundary approval `CTA` framing in `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`). Gate/evidence schema mismatch is a first-class governance defect, not just a tooling gap, and `/evidence` contracts must expose the defect as such.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Progression_Gates.md

### DL-019: Identity migration, help clusters, and retained cleanup
Worktree and graph approval identity must stop hanging on `tier_id`, request-centric `HITL`, or `request_id` payloads once blocked-episode runtime identity is available. Replace graph HITL command payload identity with blocked-episode anchored identity while preserving `Contracts_V0.md` / `Contracts_V0` compatibility notes for the request-centric-to-blocked-episode migration.

Corroboration disagreement handling uses the `2-of-3` rule: `2-of-3` accepts a high-impact claim as `/canonical`, no `2-of-3` means a high-impact claim is not accepted as blocking or canonical truth, and credible lesser concerns still emit a non-blocking `/minor` advisory visible on the Orchestrator page.

The help system must support related-link clusters for `Feature Seam` <-> `Work Package` <-> `Weak Integration` <-> `Seam Complete`, `Promotion` <-> `Revoked` <-> `Reopened`, `Corroboration` <-> `Concern` <-> `Review`, `Graph Patch` <-> `Generation Updated` <-> `Historical Path`, `Lane` <-> `Worktree` <-> `Cleanup Eligible` <-> `Archived/Removed`, and `Requested` <-> `Effective` <-> `Skipped/Clamped`; `/Clamped` and `/Removed` remain aliases only where explicitly documented.

Lane cleanup may transition into `retained` instead of immediate cleanup when recent completion is pending review or `/promotion`, weak integration remains under investigation, unresolved concern or corroboration is tied to lane outputs, or manual operator retention is active.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md

### DL-027: Case L Bundle A — canonical recovery, backup, migration, downgrade, and restore

Approved on 2026-07-17. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly six accepted decisions:

- `PD-L-01` — Keep the eight launch-critical redb-only families canonical in redb; guarantee recovery with verified automatic snapshots rather than dual-homing them to seglog.
- `PD-L-02` — Take a verified baseline before mutation-capable startup; snapshot within five minutes of first dirty mutation, at least once per dirty 24-hour window, and at clean shutdown when dirty; retain three rolling snapshots plus protected pre-migration snapshots.
- `PD-L-03` — If a required snapshot cannot be verified, stop new mutation-capable work and enter recovery/read-only posture; diagnostics remain available.
- `PD-L-04` — A newer-format store may expose metadata-only compatibility diagnostics, but must not be opened as a live `/read-only` viewer.
- `PD-L-05` — No in-place downgrade. Downgrade is only whole-boundary restore of a backup supported by the running app, with the post-upgrade write-loss window disclosed.
- `PD-L-06` — Select restore from the startup recovery shell, execute with canonical stores offline, and do not treat JSON/JSONL exports as importable backups at MVP.

The approval consciously accepts `PD-L-01`, `PD-L-02`, `PD-L-03`, and `PD-L-04`. Storage plan owns store ceilings, migration execution, recovery snapshots, backup/restore, preflight, and alias lifecycle; the storage registry and recovery schemas are machine authorities. Release, Contracts, Architecture Invariants, Final GUI, commands/wiring, and Automated Testing consume that owner contract and must not create peer migration or recovery policy.

Negative constraints: no dual-home expansion is implied; no in-place downgrade; no live newer-store viewer; no ordinary writer/projector open on unsupported or half-migrated state; no export-as-backup import; no mutation when a required verified snapshot is unavailable; and no generated governance artifact is hand-edited from this decision record.

Acceptance is governed by all `FX-L001-*`, `FX-L002-*`, `FX-L003-*`, `FX-L016-*`, `FX-L025-*`, and `FX-L032-*` oracles in the source plan, including no-mutation tree-hash checks, crash convergence, receipt round-trip, shared-boundary restore, alias idempotence, and exact preflight/progress behavior.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#bundle-a--canonical-redb-recovery-backup-migration-downgrade-and-restore`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/MIGRATION_BACKUP_REPAIR_PLAN.md`; registry cross-check `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/REGISTRY_REPAIR_PLAN.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/storage_value_registry.schema.json, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Automated_Testing_System.md

### DL-028: Case L Bundle B — seglog frame, durability, corruption, recovery, and crash convergence

Approved on 2026-07-17. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly twenty-one accepted decisions:

- `SEG-D-001` — Begin implementation on `SeglogFrameV2`; generation 1 is compatibility-only and never mixed with V2 in one segment.
- `SEG-D-002` — Use a fixed, independently CRC-protected resynchronization prefix covering framing lengths, generation, sequence, and content CRCs.
- `SEG-D-003` — Use bounded canonical header metadata: at most 4 KiB metadata and 16 MiB inline payload; larger content uses `payload_ref`.
- `SEG-D-004` — Validate in a fixed order and resynchronize only to a candidate whose prefix, bounds, generation, monotonic sequence, metadata, payload, schema, and duplicated identities all validate.
- `SEG-D-005` — Pin exact loss units: one frame only when the next boundary validates; otherwise a byte range to the next valid frame or the segment remainder. Closed segments are never modified; acknowledged-range loss blocks mutation.
- `SEG-D-006` — Add a disk-first seglog generation manifest as the publication and recovery authority.
- `SEG-D-007` — Acknowledge append only after two durability barriers: frame bytes first, then committed manifest/watermark metadata.
- `SEG-D-008` — Permit bounded group commit for ordinary events, but force a durability barrier before any mutation-gating safe point, checkpoint marker, receipt, or approval can authorize downstream mutation.
- `SEG-D-009` — Assign `EventRecord.persisted_at_utc` at commit-group seal immediately before final frame encoding. It is not independently proof of persistence and is admissible as a durable fact only with the matching `AppendReceipt{durability_state="synced"}`; `AppendReceipt.acknowledged_at_utc` is the post-barrier acknowledgement time.
- `SEG-D-011` — Lease sequence ranges durably and never reuse an allocated sequence after crash or truncation; gaps are legal and detectable.
- `SEG-D-013` — Identify loss impact by ranked evidence from verified frame metadata/indexes, never by timestamps or speculation.
- `SEG-D-014` — Rebuild projections from the deterministic surviving-record set and retain degraded trust when acknowledged canon has a hole.
- `SEG-D-015` — Disclose lossy recovery, affected ranges/identities, trust impact, and available recovery actions; never label it clean.
- `SEG-D-016` — Emit deterministic storage-integrity and boot-recovery events with stable episode identity and no duplicate semantic episode on retry.
- `SEG-D-017` — Persist recovery intent before any destructive truncate, generation switch, or cleanup action.
- `SEG-D-018` — Rotation uses a zero-active, crash-convergent protocol; startup repairs zero/two-active states deterministically.
- `SEG-D-019` — Active-tail truncation is postcondition-driven and idempotent; acknowledged bytes are not silently discarded.
- `SEG-D-020` — Seal active midstream corruption as degraded and preserve closed bytes; do not rewrite the damaged source in place.
- `SEG-D-021` — Compaction publishes a verified successor generation through a durable manifest/pointer transition.
- `SEG-D-022` — Janitor and boot recovery are idempotent and summarize one recovery episode rather than emitting duplicate outcomes.
- `SEG-D-023` — Complete recovery before projector startup or mutation admission.

Storage plan owns framing, durability barriers, sequence allocation, survivor/recovery truth, manifest publication, rotation, truncation, and compaction. Contracts owns referenced EventRecord payload and `AppendReceipt` shapes; Architecture Invariants mirrors durability/immutability; Executor consumes mutation barriers; Final GUI and Runtime Artifacts consume truthful recovery state. No consumer may weaken or re-own storage mechanics.

Negative constraints: never acknowledge on write or buffer flush alone; never treat seal-time `persisted_at_utc` as independent durability proof; never claim one-record loss without a verified next boundary; never reuse a sequence; never mutate a closed source segment; never use timestamps as replay cursors or loss evidence; never start projectors or mutation admission before recovery convergence; and never label canonical loss clean.

Acceptance is governed by `SEG-FX-001` through `SEG-FX-018` and `SEG-OR-001` through `SEG-OR-012`, including byte-identical survivor determinism, two-barrier acknowledgement, mutation gating, sequence nonreuse, crash convergence, closed-segment immutability, checkpoint truth, degraded projection truth, recovery idempotence, directory durability, disclosure truth, and live pointer fidelity.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#bundle-b--seglog-frame-durability-corruption-recovery-and-crash-convergence`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/SEGLOG_RECOVERY_REPAIR_PLAN.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### DL-029: Case L Bundle C — retention, holds, compaction, deletion, and quarantine

Approved on 2026-07-17. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly nineteen accepted decisions:

- `PD-L005-01` — Retain approval, receipt, audit, deletion-tombstone, and source-lineage authority indefinitely; storage pressure fails closed instead of evicting it.
- `PD-L005-02` — Retain chat content while its thread exists; cap at 250,000 canonical chat-content events per thread, then roll into a linked successor rather than evict.
- `PD-L005-03` — Retain released safe points for 90 days, capped at 64 per run and 2,048 per project; held items are excluded from eviction.
- `PD-L005-04` — Run janitor at startup and every 6 hours, at most 10,000 keys or 512 MiB per pass; evaluate compaction every 24 hours and at 20% or 1 GiB reclaimable thresholds.
- `PD-L005-05` — Require `storage.legal_hold.manage` plus a reason for hold set/clear; legal holds never clear automatically.
- `PD-L005-06` — Add `Advanced > Storage & Retention` to search-first Settings; hold mutation remains a protected command.
- `PD-L005-07` — Automatically preserve the latest 25 terminal runs per project; only that automatic anchor clears when a run becomes 26th-oldest.
- `PD-L010-01` — Publish a `requires_safe_point_restore` blocked episode, safe point, snapshot refs, and recovery anchor as one durability unit.
- `PD-L010-02` — Release a recovery anchor only on `resolved`, `superseded_with_verified_successor`, or explicit `abandoned_by_user`.
- `PD-L010-03` — Missing required snapshot becomes `recovery_unavailable`; remain blocked/anchored and require explicit abandon, replan, or verified recovery.
- `PD-L015-01` — Compaction writes successor generations, preserves event/sequence identity, and never rewrites closed source segments.
- `PD-L015-02` — Publish compaction atomically by same-directory `CURRENT` pointer rename after successor files and pending redb metadata are durable.
- `PD-L015-03` — Make migration, compaction, restore, salvage, and backup-boundary capture mutually exclusive under one maintenance lease.
- `PD-L015-04` — Thread deletion is immediately logical and physically purged from active canon within 24 hours unless held; retain a content-free tombstone indefinitely.
- `PD-L015-05` — Keep “remove project from list” distinct from “delete Puppet Master project data”; only the latter compacts project content out of the shared seglog.
- `PD-L033-01` — Durably quarantine exact raw bytes plus custody metadata before reset, deletion, migration, or replacement of invalid canonical values.
- `PD-L033-02` — Only resettable GUI/projection state may quarantine then reset; authority, receipts, blocked state, safe points, and audit values fail closed.
- `PD-L033-03` — Never cap-evict unresolved critical quarantine; cap pressure blocks new mutation-capable writes.
- `PD-SCHEMA-01` — Rev the registry to `pm.storage_value_registry.v2` / `2.0.0` for structured retention fields; v1 prose is compatibility-only for one migration interval.

The approval consciously accepts `PD-L005-03` and `PD-L015-04`. Storage plan owns policy tables, hold/anchor state, janitor parameters, compaction, deletion/purge, and quarantine custody; FileSafe co-owns recovery-anchor triggers/releases. The registry/schema are machine authority; Contracts owns shared payload vocabulary; Chat, GUI, Settings, permissions, commands, and Automated Testing consume the owner contract.

Negative constraints: no authority eviction under storage pressure; no mtime/prefix-derived destructive policy; no automatic legal-hold release; no cleanup of an open recovery anchor; no active-segment or in-place closed-segment rewrite; no ambiguous project-content purge; no reset before raw custody; no critical-authority default/reset; no unresolved critical quarantine cap eviction; and no v1 prose treated as v2 machine authority.

Acceptance is governed by `RET-001` through `RET-006`, `ANCHOR-001` through `ANCHOR-005`, `CMP-001` through `CMP-006`, `DEL-001` through `DEL-004`, and `Q-001` through `Q-007`, including exact expiry/cardinality selection, hold composition, atomic blocked-anchor publication, generation swap/crash recovery, deletion SLO and tombstone behavior, and quarantine custody/cap/integrity oracles.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#bundle-c--retention-legal-holds-compaction-deletion-and-quarantine`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RETENTION_COMPACTION_REPAIR_PLAN.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/storage_value_registry.schema.json, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Automated_Testing_System.md

### DL-030: Case L Bundle D — storage I/O, locking, viewer, root continuity, relocation, and fallback

Approved on 2026-07-17. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly fourteen accepted decisions:

- `L012-C1` — Use a closed storage-I/O taxonomy; only `interrupted` and `transient_busy` auto-retry. Unknown codes fail closed as device-unavailable.
- `L012-C2` — Retry interrupted syscalls at most three immediate adapter attempts and transient-busy exactly once after 250 ms; no exponential/background retry for canonical writes.
- `L012-C3` — Exhausted/non-retryable canonical I/O flips the gate to viewer or blocked, retains the lock, stops all writers and mutation-capable admission, and never buffers pseudo-durable canon in memory.
- `L012-C4` — ENOSPC behavior is write-site-specific and fail-closed; recovery is an explicit `Retry storage` probe/revalidation. Use an optional 8 MiB diagnostic reserve only as best effort.
- `L014-C1` — The held OS lock is authority; PID/mtime/2-second heartbeat are diagnostics only, stale after 10 seconds, and never authorize takeover while the OS lock is held.
- `L014-C2` — Use one aggregate canonical-store lock per active root for MVP; avoid partial multi-family lock acquisition.
- `L014-C3` — Use handle-lifetime `flock` on Unix and `CreateFileW` + `LockFileEx` on Windows with one closed acquire result; unsupported semantics route to unsafe-root handling.
- `L014-C4` — Viewer is a frozen, manually refreshable snapshot with an explicit disabled-command envelope; promotion is never automatic and reruns every root/version/integrity/lock check.
- `L018-C1` — Persist both a stable out-of-root bootstrap binding and an in-root `storage_instance_id`/path-fingerprint manifest; probe before creating candidate roots.
- `L018-C2` — Root mismatch blocks writer startup and offers use previous, choose, copy-and-switch, or strongly confirmed new instance; never silently initialize or overwrite.
- `L018-C3` — Relocation is copy-validate-switch with binding update last; retain the verified source as a recovery copy.
- `L011-C1` — Use deterministic fallback `<bootstrap_root>/storage-fallbacks/<logical_root_fingerprint>/`; all canonical stores and the lock move together or fallback is refused.
- `L011-C2` — Treat fallback as a detached branch with an exact base fingerprint; detect divergence, close writes, and never claim cross-host single-writer safety.
- `L011-C3` — Return is explicit and fast-forward-only when the logical root still matches the base; otherwise no automatic merge/overwrite and both stores remain recoverable.

Storage plan owns root identities, I/O classification/recovery, aggregate locking, viewer admission/promotion, continuity/relocation, and fallback branch/reconciliation. Contracts owns shared operational-state vocabulary; Executor consumes write-admission and retry classification; Final GUI owns visible recovery/viewer/mismatch/divergence surfaces; Commands and the UI catalog/wiring consume registered actions without local authority tests.

Negative constraints: no blind retry outside the closed classes/budgets; no in-memory pseudo-durability; no canonical eviction to work around ENOSPC; no takeover from PID, mtime, heartbeat, or file existence; no writer-capable viewer subsystem or automatic promotion; no silent first-run replacement of known prior data; no raw path export; no split fallback roots; no cross-host exclusion claim; and no divergent auto-merge, overwrite, or deletion.

Acceptance is governed by every exact fixture/oracle in `LOCKING_ROOT_IO_REPAIR_PLAN.md` §§3.6, 4.6, 5.6, and 6.6: per-write-site class/retry/aftermath, ENOSPC mutation fencing, two-process Unix/Windows lock races, stale-owner takeover refusal, complete viewer command inventory and direct-handler gate, boot-before-create continuity, relocation crash boundaries, deterministic fallback location, two-host divergence, and fast-forward-only return.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#bundle-d--storage-io-lockingviewer-root-continuity-relocation-and-unsafe-root-fallback`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/LOCKING_ROOT_IO_REPAIR_PLAN.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json

### DL-031: Case L Bundle E — EventRecord application scope, legacy normalization, dedupe, and replay

Approved on 2026-07-17. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly seven accepted decisions:

- `EVT-01` — Add required `scope_kind = application | project`; application events carry `project_id = null`, project events a non-empty ID; never invent a fake project.
- `EVT-02` — Enforce `event_id` globally and idempotency within `(scope_partition, event_type)` for the lifetime of the app data root.
- `EVT-03` — Normalize legacy `EventEnvelopeV1` deterministically in memory for projection/replay; do not append or rewrite it.
- `EVT-04` — Quarantine legacy values containing unhandled secrets unless a registered versioned transform exists.
- `EVT-05` — Quarantine unknown scope or payload mappings rather than defaulting them.
- `EVT-06` — On dedupe-index outage, synchronously catch up through the seglog tail or fail closed without append.
- `EVT-07` — Publish EventRecord `2.0.0`; older writers never mutate it, and read-only access requires a validating 2.0 reader.

Contracts and the EventRecord schema own the closed envelope, replay policies, and event payload vocabulary; storage plan owns persistence, scope partitions, normalization formulas, dedupe lifetime/currentness, and index rebuild behavior. Storage registry/index rows and the event-family registry are machine consumers/authorities for their declared shapes; projectors and other producers must consume the owner contracts without inventing scope or compatibility behavior.

Negative constraints: no fake/default project sentinel; no ambiguous null scope; no legacy append or durable rewrite during ordinary replay; no random, read-time, path, mtime, or mutable-session normalization inputs; no heuristic secret redaction; no unknown scope/payload default; no append while dedupe currentness is unproved; no external/canonical side effect from `projector_replay_only`; and no older-writer mutation of EventRecord 2.0.

Acceptance is governed by all schema/scope, legacy-normalization, dedupe/outage, `projector_replay_only`, and version/migration fixtures in `EVENT_RECORD_REPAIR_PLAN.md` §8: exact scope-partition round-trip, byte-identical JCS/MessagePack normalization across runs, quarantine-without-checkpoint-advance negatives, store-lifetime dedupe and crash catch-up, zero side-effect spies, stable generation replay, and no 1.0 writer mutation.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#bundle-e--eventrecord-application-scope-legacy-normalization-dedupe-and-replay`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/EVENT_RECORD_REPAIR_PLAN.md`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/event_record.schema.json, ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/storage_value_registry.schema.json

### DL-032: Case L Bundle F — FileSafe restore, safe points, baseline targets, restore points, and Chat revert

Approved on 2026-07-17. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly nine accepted decisions:

- `PD-RSP-01` — Safe-point restore and Chat revert are exact-replace journaled operations with verified rollback and restart reconciliation; they do not merge.
- `PD-RSP-02` — Equality is a canonical manifest SHA-256 covering stated SCM identity, index, tracked/untracked, explicit mutation-scope ignored paths, and portable metadata boundaries.
- `PD-RSP-03` — Keep content-addressed snapshot manifests/blobs under the resolved storage root outside the worktree; persist only refs/hashes; remote projects keep custody on the authorized remote.
- `PD-RSP-04` — Add `restore_refused` and `restore_recovery_required`; emit `restore_failed` only after verified rollback equality.
- `PD-RSP-05` — Canonical key is `sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}`; migrate `safe_point.sp:{...}`, make `safe_point:<id>` lookup-only, and split registry families.
- `PD-RSP-06` — Persist reference-based holds for active attempts, unresolved restore-required episodes, nonterminal restore transactions, preserved runs, and legal holds.
- `PD-RSP-07` — `safe_point` exact-restores the named worktree; `historical_commit` creates an isolated clean worktree at an exact OID; `worktree_head` binds without restore to exact HEAD plus state digest.
- `PD-RSP-08` — Assistant Chat owns immutable conversation-boundary restore points; apply means branch to a new thread/branch without changing the source thread/worktree or restoring files.
- `PD-RSP-09` — `cmd.chat.revert` uses the same FileSafe manifest, journal, rollback, equality, and outcomes as safe-point restore.

Storage plan and the storage registry/schema own safe-point/restore-transaction/restore-point persistence and keys; FileSafe owns snapshot/equality/restore mechanics; Contracts owns outcome/reason enums and event payloads; Worktree owns baseline filesystem/Git effects; Executor owns admission and attempt lineage; Assistant Chat owns restore-point lifecycle; UI Catalog/Commands/Section 15/Runtime Artifacts consume those owners.

Negative constraints: no merge under safe-point or Chat revert; no portable whole-tree atomicity claim; no `restored_clean` without target equality; no `restore_failed` without verified rollback equality; no mutation after refusal; no new legacy-key primary write; no deferred bundled row used as launch authority; no timer-only release of the last legal recovery path; no branch-name substitute for immutable OID; no restore point that mutates its source or silently restores files; and no weaker Chat restore engine.

Acceptance is governed by every `RSP-ATOMIC-*`, `RSP-EQUAL-*`, `RSP-INTEGRITY-*`, `RSP-SCOPE-*`, `RSP-RETENTION-*`, `RSP-KEY-*`, `RSP-REGISTRY-*`, `RSP-BASELINE-*`, `RSP-RP-*`, `RSP-CMD-*`, and `RSP-CHAT-*` oracle in the source plan, including target-or-rollback crash convergence, exact digest truth, key/alias closure, retention holds, baseline effects, source-preserving conversation branching, complete command registration, and Chat/FileSafe parity.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#bundle-f--filesafe-restore-safe-points-baseline-targets-restore-points-and-chat-revert`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RESTORE_SAFEPOINT_REPAIR_PLAN.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/storage_value_registry.schema.json, ContractName:Plans/FileSafe.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### DL-033: Case L supplemental probes — fallback divergence, restore-command normalization, and migration preflight

Approved on 2026-07-18. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly three accepted decision packets:

- `PD-PROBE-L011-01` — Select `A/A/A/A/A`: expose the three independently permissioned IDs `cmd.storage.fallback.keep_logical_root`, `cmd.storage.fallback.fork_new_instance`, and `cmd.storage.fallback.export_both`; require the explicit expected storage-instance, logical-root, root-generation, fallback-branch/base, logical/fallback-head SHA-256, and bootstrap-binding SHA-256 CAS fields and handler revalidation; return a candidate fork binding without changing active bootstrap selection; export an exact-byte encrypted recovery-custody package to explicit `destination_ref` with a non-secret manifest and key ref while retaining both source roots until separate cleanup; and use an owner receipt without inventing a new event family.
- `PD-PROBE-L020-01` — Select `A/A/A`: remove `retry_scope`; validate `permission_snapshot_id` against current permission state and consume it before the sole handler so the normalized payload exactly equals the canonical payload; and make the compatibility alias accept the wrapper input and apply the identical deterministic transform.
- `PD-PROBE-L032-01` — Select `A`: use `outcome = ready|blocked` with required-present `reason_code = null|blocked_insufficient_space`; `ready` pairs only with null and `free_bytes >= required_free_bytes`, while `blocked` pairs only with `blocked_insufficient_space` and `free_bytes < required_free_bytes`.

Storage plan owns fallback continuity/reconciliation and migration preflight/progress semantics. Executor owns admitted retry identity and retry semantics; Worktree Git owns the affected safe-point worktree boundary. Commands, the UI catalog, production wiring, Final GUI, Contracts, the storage registry/recovery schema, readiness, and Automated Testing consume those owners without creating a second handler, authority test, or peer policy.

Negative constraints: no fallback merge, overwrite, deletion, authority change, or silent bootstrap switch outside the selected contract; no invented `storage.fallback_reconciled` event; no retained `retry_scope`, forwarded wrapper-only field, second handler, or receipt-only/no-event peer execution path; no unlisted preflight outcome/reason, fabricated schema-valid result, ETA, or percentage; and no WorkNode or NodeSeed creation.

These three decisions authorize owner-first materialization only. They do not establish the persisted-event denominator, complete the event-family registry, close `CL-CRIT-EVENT-AUTHORITY-001`, close any Case L finding or obligation, or prove shard, gate, governance, runtime, certification, or buildability state. They do not select or record any wave-5 producer-owner discovery decision.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#supplemental-approvals-and-critical-escalation--2026-07-18`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/wave4/pre_generation_fidelity/REPAIR_REGISTER.md#three-user-ready-decision-packets`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Automated_Testing_System.md

### DL-034: Case L supplemental kernel-depth packet choices

Approved on 2026-07-18. The approval source records the calendar date but not an exact UTC instant; this entry does not invent one. This grouped entry records exactly nine accepted decision packets:

- `DP-K37-01 A` — Close the 21 Goal and GoalRun payloads with one per-event schema per row and a shared common `$defs` base; each event schema has a const discriminator and a closed event-specific payload.
- `DP-K37-02 B` — Bind those 21 rows to a small closed owner-approved retention-class map, with every event row assigned to exactly one structured policy ref and no prefix-derived inference.
- `DP-K37-03 A` — Represent `platform.capability_evaluated` with catalog-referenced capability IDs, closed requested/effective evaluation-state enums, degradation reason, and evidence refs.
- `DP-K37-04 A` — For `restore_point.applied`, require `new_thread_id` and `new_branch_id` only for `branched`, forbid them for `refused|failed`, and use canonical `application_id`/command idempotency identity for replay.
- `DP-K37-05 A` — Use a restore-point-specific flat corruption-reason enum that distinguishes record-hash mismatch, unreadable record, corrupt referenced material, and unsupported content scope while keeping missing material on a distinct state/event path.
- `DP-K37-06 C` — Make `run.started` a hybrid: require the canonical runtime-policy snapshot ref and inline the minimum immutable requested/effective mode, overlay, strategy, provider/model/account/persona, and resolution-reason join fields needed for audit and indexing.
- `DP-K37-07 A` — Extend the canonical `cmd.runtime.*` recovery namespace for `safe_point.recovery_unavailable`, reusing registered replan/runtime actions and registering exact locate-verified-recovery and explicit-abandonment actions with typed payloads and receipts.
- `DP-K37-08 A` — Represent `storage.boot_recovery` with a closed coordinator-operation enum plus a prior-event repeat ref, distinguishing same-episode dedupe from a later boot summary that refers to the original event.
- `DP-K37-09 A` — Use dedicated flat integrity-failure and recovery-action enums derived from the Case L loss table for `storage.integrity_detected` and `storage.recovery_applied`, preserving the closed `impact_precision` boundary and preventing advisory evidence from becoming recovery authority.

Goal Runtime owns Goal and GoalRun event semantics; Storage owns retention, event persistence/registration, boot recovery, integrity, and recovery-action policy; platform/provider capability owners own capability-catalog meaning; Assistant Chat owns restore-point lifecycle; FileSafe owns restore/recovery mechanics; Run Modes, Executor, Models, and Multi-Account own requested/effective runtime selection. Contracts supplies shared envelopes/vocabulary, and the event-family registry/schema is machine authority only for rows actually materialized from those owners. Commands and GUI surfaces remain consumers of registered owner contracts.

Negative constraints: no shared open payload, generic object, wildcard/default row, inferred scope, inferred retention, or raw-secret field; no failed/refused restore target identities; no second recovery command namespace or handler; no exact wire-token spelling invented where the approved option defined only the closed model and semantic classes; no WorkNode or NodeSeed creation; and no wave-5 producer-owner discovery decision selected or recorded.

These nine decisions authorize owner-first materialization only. They do not establish the complete persisted-event denominator, make any registry row depth-complete, complete the event-family registry, close `CL-CRIT-EVENT-AUTHORITY-001`, close any Case L finding or obligation, or prove shard, gate, governance, runtime, certification, or buildability state.

SourceRef: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md#supplemental-approvals-and-critical-escalation--2026-07-18`; `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/wave4/event_denominator_adjudication/CONTRACT_DEPTH_REGISTER.md#user-ready-decision-packets`.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/goal_runtime_events.schema.json, ContractName:Plans/storage-plan.md, ContractName:Plans/event_family_registry.json, ContractName:Plans/event_family_registry.schema.json, ContractName:Plans/newtools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md

### DL-035: Terminal research decisions — own engine, bundled console, and ten accepted proposals

Approved on 2026-09-09 by Jared in conversation. The source records the calendar date but not an exact UTC instant; this entry does not invent one. The proposals are the terminal research decision packet P1–P11 produced by the September 8 discovery-to-plan pilot (`PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md`). This grouped entry records exactly eleven dispositions:

- `P1 declined as proposed` — Puppet Master builds its own terminal engine and process host. The VT parser, grid and scrollback model, selection, command-block overlay, renderer adapter and PTY host are PM-owned code using operating-system APIs directly. No third-party terminal emulator, parser, or PTY-abstraction library is adopted into the engine. Leading terminals (Alacritty, WezTerm, Ghostty, kitty, foot, Windows Terminal, VS Code/xterm.js, JetBrains) remain reference subjects for research: study how they work, do not reuse their code. The R1/R2 conformance checklists retarget from candidate-core admission to acceptance criteria for PM's own engine and host.
- `P2 accepted for planning` — Puppet Master ships a PM-managed, version-pinned Windows console component package (ConPTY/OpenConsole) with verified installation and provenance, and an explicit, disclosed fallback to the operating-system copy when the bundle is absent, untrusted or incompatible. Version-dependent behavior remains disclosed through the host-provenance doctor (SMPFS-132). Bundling does not by itself widen supported Windows versions. Correction recorded later on 2026-09-09: the first recorded disposition was `declined as proposed` (use the OS-shipped ConPTY); Jared reversed it after reviewing the plain-language decision sheet. No other disposition changed.
- `P3 accepted for planning` — optional negotiated enhanced keyboard protocols behind a versioned capability profile.
- `P4 accepted for planning` — richer capability-gated shell context (continuation and right-prompt boundaries, rich shell properties) in the PM-owned parser.
- `P5 accepted for planning` — a provider snapshot adapter that classifies cumulative or rewritten output as append, complete snapshot, rolling snapshot, or final result.
- `P6 accepted for planning` — explicit, per-host, opt-in remote terminal compatibility setup (verified terminfo installation or a disclosed conservative profile).
- `P7 accepted for planning` — pane-local advisory command progress from OSC 9;4 with a deterministic collision rule.
- `P8 accepted for planning` — insert-without-execute and open-retained-output-in-editor actions on existing command cards.
- `P9 accepted for planning` — redacted environment provenance and pending-for-next-launch display tied to explicit session replacement.
- `P10 accepted for planning` — explicit live-pane input protection with a visible state. Later same-day supplements DL-037 and DL-038 respectively resolve same-session persistence and blocking both user and agent input.
- `P11 accepted for evaluation only` — an optional external multiplexer transport adapter may be evaluated for persistent remote shells; selection is held until compatibility with PM Server ownership is resolved, and any adoption must respect the P1/P2 direction that PM's engine and host remain PM-owned.

Section 15 owns the engine, host, protocol and parser decisions; FinalGUI owns visible terminal surfaces; UI Command Catalog and Wiring own new actions; Automated Testing owns acceptance fixtures; Server System owns remote ownership for P11; Settings owns any user-facing toggles. Acceptance authorizes planning those features as PlanUnits under their owners; implementation follows the existing Approve And Build path.

The separate synthetic Usage decision packet (`USAGE-D01`–`USAGE-D13`) concerns a synthetic test fixture, not live Puppet Master, and records no PM decision.

Negative constraints: no third-party emulator, parser, or PTY-abstraction crate in the engine or host; no unverified, unpinned or silently substituted Windows console components, and no undisclosed local fallback; no implementation, WorkNodes, or NodeSeeds from this record; P11 grants no daemon installation, credential authority, or selection; the synthetic Usage packet adopts nothing.

These dispositions authorize planning only. They do not land any owner amendment, prove runtime behavior, or seal governance.

SourceRef: `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md`; `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/evaluator/terminal-premium-decision-draft.md`; Jared, conversation of 2026-09-09.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Server_System.md, ContractName:Plans/Settings_System.md, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Contracts_V0.md

### DL-036: Research decision packets in production — chat artifact plus one-at-a-time decision cards

Approved on 2026-09-09 by Jared in conversation, after reviewing the plain-language terminal decision sheet used for DL-035. This entry records the product behavior for bringing research and audit decisions to the user in production Puppet Master. It authorizes planning under the named owners, not implementation.

Recorded requirement, in Jared's terms:

- A decision packet produced by research or audit is handed to the user in chat as an artifact containing every item.
- Each item is then presented to the user in the chat window one at a time as a decision card built from the plain-language decision form: a plain name; the question in one sentence; why it came up; what you would get; what it costs; the options; the recommendation if there is one.
- The user answers each card with exactly one of four responses: Approve; Deny; Deny with changes, where the user states the change; Ask a question, where the question routes to research or the agent and the item is re-presented with the answer.
- While items are presented one at a time, the user can open the full artifact with all items at any time.
- The cards reuse the planned question card and questionnaire mechanism (`Plans/assistant-chat-design.md` section 7.4) modified for this purpose: more information per item than a question card, and this different, fixed set of responses. One-at-a-time sequencing is the presentation rule for this flow, not a change to the general questionnaire contract.
- Status and disposition are shown with text labels. No colored border bars or stripes as status indicators. No emoji glyphs.
- Approved, denied, denied-with-changes and pending dispositions are recorded so agents do not ask the same question again. Approval authorizes planning that feature; execution follows the existing Approve And Build path (PWIZ-010).
- The bootstrap and audit form of the same packet is a plain-language document; the production flow above is the product form.

Assistant Chat owns the artifact surface, the decision card, its responses and the question-flow reuse; Planning Wizard owns where the flow sits in a planning run and how dispositions feed topics, amendments and Approve And Build; Contracts own the typed envelope; FinalGUI owns visual presentation; Storage owns disposition persistence; UI Command Catalog and Wiring own the commands.

Negative constraints: no auto-approval, auto-denial or auto-submit on dismissal; no agent may answer a card on the user's behalf; asking a question does not consume or alter the pending decision; no colored status bars; no emoji; no implementation, WorkNodes or NodeSeeds from this record.

SourceRef: Jared, conversation of 2026-09-09; `PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md`; `PM-Experiments/research-audit-native-20260907/STATUS_REPORT_20260908.md` section 8.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

### DL-037: Terminal input protection — same-session persistence

On 2026-09-09, while compiling DL-035 P10, Jared answered the explicit persistence question **Keep for the same session**. The presented choice retained protection for the exact live session, including reconnect and reopening PM, with a replacement session starting unlocked. This supplemental decision resolved persistence only; the separately presented agent-input question was pending at that point and received no implicit disposition here. Jared later answered it explicitly in DL-038.

The lock follows verified `terminal_session_id` continuity across detach, reconnect and PM reopen. Replacing a session starts unlocked; a reused pane, copied preference, historical transcript or restored layout cannot confer a lock or prove a process is still live. Output keeps draining while protected, and unlock retains the same session. Existing close confirmation, interrupt and terminate behavior remains owner-defined. This is planning authority only, with no implementation, WorkNodes, NodeSeeds or runtime acceptance.

SourceRef: Jared, asynchronous question reply on 2026-09-09; Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/questions.jsonl:q-0002; Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/decisions.jsonl:dec-0004.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-165, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Settings_System.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/UI_Command_Catalog.md

### DL-038: Terminal input protection — block user and agent input

On 2026-09-09, Jared answered the pending P10 scope question **Block user and agent input**. The presented choice explicitly covered both user typing/paste and agent input, with an explicit blocked result for agents. This supplements DL-035 P10 and resolves the scope that was still pending when DL-037 recorded persistence; it does not revise that earlier chronology.

While the exact live session is protected, its input owner blocks user and agent terminal input before any child write. An agent receives an explicit blocked result; no silent bypass, implicit unlock or deferred write on unlock is permitted. Output continues. Separate interrupt and terminate controls retain their existing authority and behavior; this input guard does not suspend the process or change close/kill policy. DL-037 same-verified-session persistence and replacement-starts-unlocked remain unchanged.

This is accepted planning authority only; no implementation, command registration, native acceptance, WorkNodes, NodeSeeds or governance seal is created.

SourceRef: Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md; Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/questions.jsonl:q-0001; Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/decisions.jsonl:dec-0005; Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014; Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/events.jsonl:evt-0009.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-165, ContractName:Plans/FinalGUISpec.md#F3-549, ContractName:Plans/Settings_System.md#SSYS-034, ContractName:Plans/Automated_Testing_System.md#ATS-047, ContractName:Plans/UI_Command_Catalog.md#UCC-160, ContractName:Plans/UI_Wiring_Rules.md#UIW-021, ContractName:Plans/Wiring_Matrix.md#WM-052

### DL-039: Event Authority owner decisions — the August sheet answered, plus close path, checkpoint and schema authority

Approved on 2026-09-10 by Jared in conversation, answering the plain-language decision sheet of 2026-09-09 (`Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_PLAIN_20260909.md`). These are the genuine owner answers to the questions on `OWNER_DECISION_SHEET.json`, which still carries the voided responses stamped by a rogue agent on 2026-08-12 (see `DECERTIFICATION.md` in the same directory). Those forged values confer nothing and are replaced by the values below when Phase 1 of `FIXED_POINT_CLOSURE_RUNBOOK.md` is applied. This grouped entry records exactly twelve dispositions:

- `EXCL-OD-done_budget_exceeded` = `CONFIRM_EXACT_EXCLUDE`. `done.budget_exceeded` is not a persisted event; it remains in the exact-exclusion cohort.
- `EXCL-OD-stop_identical_failure` = `CONFIRM_EXACT_EXCLUDE`. `stop.identical_failure` is not a persisted event and is treated as an alias of `kill.identical_failure`.
- `COMPACT-001` = `ESCALATE_AS_PERSISTED_FAMILY`. Completion of context compaction (`context.compaction.completed`) is a persisted event. Application requires an owner-backed EventRecord or seglog contract and complete Event Authority depth; until that contract exists the row remains an evidence gap, and the production wiring's no-persist entry is repaired to match once the contract lands.
- `EMIT-PERSIST-026` = `ACCEPT_EMIT_OBLIGATION_ONLY`. The 26 wiring-obliged emit candidates are send-only obligations; none is admitted to the registry.
- `J40-VETO-BATCH` = `CONFIRM_UNRESOLVED_NO_ADMIT`. The 28 unclassified names remain unresolved and out of the registry.
- `AUG-CP-WLC-001` = `VETO_KEEP_REGISTERED_PROVISIONAL`. `workspace.layout_changed` stays registered; its consumers, projector and checkpoint remain unknown until cited from the Plans, and that depth work is authorized.
- `AUG-CP-TWM-001` = `VETO_KEEP_REGISTERED_PROVISIONAL`. `terminal.workgroup_moved` stays registered on the same terms.
- `J248-VETO-BATCH-252` = `CONFIRM_ALL_QUARANTINE_NO_ADMIT`, recorded 2026-09-11 after Jared asked on 2026-09-10 whether the 252 confirmed-persisted-unregistered rows should be worked through. All 252 rows are quarantined as an interim stance: counted in the denominator, not registered, with explicit acceptance that counted is not registered. An owner-batched registration campaign then works every row to exactly one outcome: registered with a full Event Authority contract through the Storage owner, excluded with cited evidence, or returned to Jared as a plain-language decision card. No bulk registration, no inference from sibling rows, and no row left silently in quarantine.
- Close path for the 54 leftover rows (26 emit-only plus 28 unresolved) = add a `quarantined_not_admitted` holding bucket recognized by the individual-disposition schema and the independent validator, fail-closed, implemented openly with a receipt by someone other than the seal applier. This is the honest form of the question the forged 2026-08-12 answers invented as `UNRESOLVED-54-CLOSE-PATH`.
- Registry checkpoint = approve `Plans/event_family_registry.json` revision `2026-08-27.1` (39 families; `workspace.layout_changed` payload 1.1.0) as the PNC-019 baseline, superseding the pinned `2026-08-04.1`.
- Goal Runtime payload schema authority (the historical "SS-001" question) = promote all 21 Goal Runtime event payload schemas from candidate draft to authoritative now, landed by the Goal Runtime System owner. Authoritative status does not satisfy contract depth; depth evidence is still required per family.
- Seal go/no-go = go, conditional: the seal proceeds only after these answers are applied, contract depth is complete, the 2026-08-13 review queues are adjudicated, and the independent validator passes without modification.

Storage owns the registry and persisted-event dispositions; Goal Runtime System owns the 21 payload schemas; Assistant Chat owns the compaction event contract; Shared Integration Runtime and Wiring own the emit obligations; Plan To Node Compilation owns PNC-019. These answers authorize Phase 1 application, the receipted holding-bucket change, the compaction contract work, the schema promotion, and the depth campaign. They do not seal the denominator, certify PNC-019, enable runtime or buildability, or register any of the 252.

Negative constraints: no bulk registration; no invented consumer, projector or checkpoint identifiers; no validator edits except the receipted holding-bucket change; no restamping of freeze digests or closure-registry hashes; the forged 2026-08-12 responses confer nothing; no WorkNodes or NodeSeeds.

SourceRef: `Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_PLAIN_20260909.md`; `Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_BRIEF.md`; `Plans/.audits/event-authority-2026-08-12/SEAL_PATH_MATRIX.md`; Jared, conversation of 2026-09-10.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/event_family_registry.json, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Automated_Testing_System.md

### DL-040: Compaction completion binding and permanent content-free audit history

On 2026-09-11 at 15:26:49.325818 UTC, Jared answered **Approve** to `EA-S6-001`, after asking whether the proposal affected the assistant's ability to search thread history. The clarification preserved agent search of retained thread history after compaction and the existing thread-deletion rules. The exact question, clarification and genuine answer are recorded in `reports/event-authority-20260911/decision-responses.jsonl`; the approved card is `reports/event-authority-20260911/step-06-decision-card.md`.

Assistant Chat and Storage, with Shared Integration Runtime, are authorized to **define and version the previously missing** consumer, projector and checkpoint bindings for `context.compaction.completed` using the existing focused-thread detail/replay path. Those exact identifiers become owner-defined contracts in ACD-461, SP-259 and SIR-038; this decision does not claim they pre-existed. Keep the bounded, content-free completion EventRecord indefinitely under `RP-AUTHORITY-INDEFINITE@1.0.0`, including after its thread is deleted. Detailed receipts, summaries, transcript and referenced content retain their own deletion/hold rules. An opaque audit reference neither retains deleted content nor authorizes its reconstruction, search, or retrieval.

DL-039 already authorizes persistence of successful completion. Started, failed, no-op and deferred outcomes do not gain new persisted families. This approval is limited to the compaction contract and its explicit binding/retention choice. It authorizes no other family's identifiers, validator changes, runtime enablement, WorkNodes, NodeSeeds or governance seal.

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-461, ContractName:Plans/storage-plan.md#SP-259, ContractName:Plans/Shared_Integration_Runtime.md#SIR-038, ContractName:Plans/Prompt_Pipeline.md#PP-078

### DL-041: Default DRY guard uses common Settings change identity

On 2026-09-11 at 16:19:32.266939 UTC, Jared answered **Approve** to `LC-SETTINGS-IDENTITY`. The genuine answer is `LC-SETTINGS-IDENTITY-RESPONSE-001` in `reports/event-authority-20260911/decision-responses.jsonl`; the card is in `reports/event-authority-20260911/step-08-likely-contested-cards.md`.

The selected future event identity is `settings.updated`, preserving the exact guard key `app.agent_rules.dry_method_default_guard` and the current Settings transaction identity. Settings, Command Catalog and Wiring reconcile the historical dedicated event requirement to this choice. The old `settings.agent_rules.dry_method_default_guard.updated` spelling remains read-only history/source lineage, with no assumed payload alias or byte rewrite. The retired per-setting command is not revived. The key spelling does not determine transaction scope or establish a valid ordinary setting ID; owner mapping and the existing transaction grammar remain required.

This approves the identity reconciliation and its explicit historical treatment. It does not admit an event, define missing consumer/projector/checkpoint IDs, widen a schema, change retained setting state, enable runtime, or modify validators or governance. Full payload and binding work is still required before EventRecord emission.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/UI_Command_Catalog.md#UCC-104, ContractName:Plans/Wiring_Matrix.md#WM-040, ContractName:Plans/UI_Wiring_Rules.md#UIW-014, ContractName:Plans/storage-plan.md#SP-223

### DL-042: Historical Chat plan changes remain readable as future To-Do mutations are mapped

On 2026-09-11 at 16:23:08.849454 UTC, Jared answered **Approve** to `LC-CHAT-TODO-MIGRATION`. The genuine answer is `LC-CHAT-TODO-MIGRATION-RESPONSE-001` in `reports/event-authority-20260911/decision-responses.jsonl`; the card is in `reports/event-authority-20260911/step-08-likely-contested-cards.md`.

Preserve existing `chat.plan_todo_updated` records as readable history under their original identity and existing access, retention and deletion rules. ToDo Runtime owns an operation-by-operation mapping for future mutations to the individually appropriate `todo.*` events, each subject to central admission and its full contract. No automatic alias to `todo.updated`, historical deletion or relabelling, bulk status event, revival of retired fields, or relaxation of proposal-only behavior is authorized. Status changes retain per-item causal receipts and expected/committed revisions. Historical fields without an established current destination remain readable historical fields, not permission to add current schema fields.

This approves the migration direction and owner reconciliation. It does not admit any event, supply missing binding identifiers, guarantee historical payload conformance, settle a new retention policy, or prove native execution. Atomic visibility, payload schemas, replay and identity bindings remain required before the corresponding future events can emit. Existing unregistered historical spellings cannot serve as a fallback writer.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

### DL-043: Jujutsu research decisions — 44 answers to the 11 September packet

Approved on 2026-09-11 by Jared in conversation, answering the plain-language decision packet published by the Jujutsu research goal (`reports/jujutsu-research-2026-09-11/d3/decision-packet.md`, SHA-256 `66e516daa5f3ee747be434bce53af8dcb89d40892df1de9b4aaa71aea1cde767`; technical companion SHA-256 `616dd3673eb9b83e8f37ade85eee0f476914087815306cebf84b0e63b305a702`). The source records the calendar date but not an exact UTC instant; this entry does not invent one. Card numbers J01–J44 follow the reviewer's grouped sheet; D-identifiers are the companion's decision ids. Every answer is quoted verbatim from the option or recommendation Jared chose. This grouped entry records exactly forty-four dispositions:

**Operation history and recovery.**

- `J01` / `D002` Named history markers — Add named markers on existing checkpoints (accepted for planning)
- `J02` / `D003` Grouped history actions — Group display and provide verified group undo (accepted for planning)
- `J03` / `D004` Recent actions and redo — Add recent actions and supported redo (accepted for planning)
- `J04` / `D005` Filter operation history — Add simple action and time filters (accepted for planning)
- `J05` / `D006` Readable operation descriptions — Add structured descriptions from existing receipts (accepted for planning)
- `J06` / `D007` History storage maintenance — Diagnose growth and offer explicit maintenance (accepted for planning)
- `J07` / `D042` Reverse one selected operation — Add a separately labeled reverse-selected-operation action (accepted for planning)
- `J08` / `D043` Preview a rewrite before applying it — Add an explicitly managed rewrite preview and apply workflow (accepted for planning)
- `J09` / `D044` Browse an earlier repository state — Add a clearly labeled earlier-state browsing mode (accepted for planning)
- `J10` / `D037` Export operation diagnostics — Add explicit sanitized export (accepted for planning)
- `J11` / `D038` View source-control commands — Add an optional technical log view (accepted for planning)

**Editing changes.**

- `J12` / `D010` Combine divergent versions — Add guided convergence when supported (accepted for planning)
- `J13` / `D011` Duplicate a change — Add a duplicate action (accepted for planning)
- `J14` / `D012` Create a merge change — Add a merge action (accepted for planning)
- `J15` / `D013` Absorb edits into earlier changes — Add absorption with preview (accepted for planning)
- `J16` / `D014` Back out a change — Add a back-out action (accepted for planning)
- `J17` / `D015` Compare versions of a change — Add a version-to-version comparison (accepted for planning)
- `J18` / `D016` Change evolution — Add a focused evolution view (accepted for planning)
- `J19` / `D031` Edit history by dragging — Add previewed drag actions and keyboard equivalents (accepted for planning)
- `J20` / `D019` Scriptable partial changes — Add a structured hunk selection interface (accepted for planning)

**Workspaces and repositories.**

- `J21` / `D001` Read-only repositories — Add a supported read-only browsing mode (accepted for planning)
- `J22` / `D008` Adopt existing workspaces — Add an explicit adoption and repair flow (accepted for planning)
- `J23` / `D009` Hide inactive workspaces — Add hide and unhide (accepted for planning)
- `J24` / `D036` Very large repository backends — Defer specialized storage (declined or deferred)

**Graph, comparison and review views.**

- `J25` / `D029` Prioritize graph lanes — Add explicit lane priorities (accepted for planning)
- `J26` / `D030` Help with history queries — Add native query assistance (accepted for planning)
- `J27` / `D032` Keep comparison context visible — Add pinned comparison and selected-change details (accepted for planning)
- `J28` / `D017` Line attribution and file history — Add bounded attribution and file history (accepted for planning)
- `J29` / `D018` Review marks that survive edits — Add conservative matching with stale markers (accepted for planning)
- `J30` / `D033` Review a workspace with AI — Use existing chat review workflows (declined or deferred)
- `J31` / `D020` New line endings in mixed-ending text — Use the nearest existing line ending; preserve existing endings on ordinary Save. (policy set)
- `J32` / `D021` Use an external diff or merge editor — Keep resolution inside Puppet Master (declined or deferred)

**Publishing, forges and conflicts.**

- `J33` / `D027` Publish unresolved conflicts — Block by default; add an advanced path only for qualified compatible targets. (accepted with the stated condition)
- `J34` / `D028` Resolve a conflicted bookmark — Add a guided picker only if it clarifies rather than hides the target states. (accepted with the stated condition)
- `J35` / `D039` Publish a stack of reviews — Add one explicitly supported forge workflow at a time. (accepted with the stated condition)
- `J36` / `D040` Additional review services — Add only for a concrete user workflow and keep local history independent. (accepted with the stated condition)
- `J37` / `D041` Custom actions around publishing — Keep publication within existing adapter behavior (declined or deferred)

**Architecture and integrations.**

- `J38` / `D022` How the adapter runs — Own a separate internal service (architecture choice)
- `J39` / `D023` Reuse a diff library — Keep an independently owned diff implementation (declined or deferred)
- `J40` / `D024` Connect external IDEs — Keep source-control interaction in Puppet Master (declined or deferred)
- `J41` / `D025` Shared source-control service — Use existing owner services only (declined or deferred)
- `J42` / `D026` Connect other agent tools — Keep existing internal agent routes (declined or deferred)

**Backups.**

- `J43` / `D034` Store or rebuild history indexes — Prefer rebuilding correctness-critical indexes in the isolated drill; keep captured indexes only as an optional speed aid. (policy set)
- `J44` / `D035` Complete missing repository data — Add a separately authorized completion workflow (accepted for planning)

Summary: 29 accepted for planning, 4 accepted with a stated condition, 2 policies set, 1 architecture choice, 8 declined or deferred.

Jujutsu Integration owns adapter, history, workspace and change-editing behavior; Source Control owns the shared receipt and command contracts; FinalGUI owns visible history, graph and comparison surfaces; UI Command Catalog and Wiring own new actions; Backup and Restore owns index and completion policy; Contracts owns typed envelopes; Permissions and FileSafe own authorization and file safety where the accepted items touch them. Acceptance authorizes planning those items as PlanUnits under their owners; implementation follows the existing Approve And Build path. `J38` (own a separate internal service) and `J39` (independently owned diff implementation) follow the DL-035 direction that Puppet Master owns its own engine code; `J41` and `J42` mean no shared public service and no external agent surface are planned now.

The one correction the same research produced, requiring a typed receipt on every terminal Jujutsu attempt (JJI-003), was landed separately under the existing repair authorization and is not a decision here.

Negative constraints: no implementation, WorkNodes, or NodeSeeds from this record; no third-party diff library or embedded third-party source-control library in the adapter; no external IDE client, shared multi-repository service, or MCP source-control surface is planned; declined and deferred items stay recorded and are never re-asked; nothing under `reports/` is canon.

These dispositions authorize planning only. They do not land any owner amendment, prove runtime behavior, or seal governance.

SourceRef: `reports/jujutsu-research-2026-09-11/d3/decision-packet.md`; `reports/jujutsu-research-2026-09-11/d3/technical-companion.json`; Jared, conversation of 2026-09-11.

ContractRef: ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### DL-044: Forge review wiring uses adapter vocabulary and one create command

Approved on 2026-09-11 by Jared, with this decision number selected after the originally requested number was found to be occupied.

The question was whether shared review actions should keep provider names and review terminology in their wiring rows, or take that wording from the selected adapter. It came up because the generic Create Review and Merge Review rows still said “pull request” and disabled the actions when there was no GitHub remote. The command catalog already defined provider-aware guards, and the provider contracts already supplied native review wording, including “Merge request” for GitLab. A separate GitHub create command also duplicated the generic create action.

The options were:

1. Use neutral descriptions in generic wiring rows, render varying labels through an optional adapter vocabulary reference, enforce that rule with the wiring validator, and make the GitHub create spelling a compatibility alias of the generic create command.
2. Correct the two review rows only, leaving future wording drift unchecked and keeping a separate GitHub create command.
3. Keep separate provider-specific wiring and command behavior, duplicating labels and availability rules for each provider.

The answer is option 1. One user action has one command; provider differences remain in the adapter. Review labels use the selected repository adapter's existing review noun and display vocabulary, following the automation shell's use of its selected binding adapter. Create and merge retain the command catalog's guards and provider-owner routes. The legacy create spelling still follows its recorded retirement path into the compatibility alias, and thread-bound worktree commands keep their separate scope.

This buys consistent provider wording and an executable check against the existing provider fixtures. It costs an optional wiring vocabulary object, template rendering in validation, and maintenance of alias normalization before availability, permission, telemetry, receipts, and dispatch. No new readiness predicate is needed on the adapter. The validator rejects provider names and review nouns in generic rows and prints the rendered labels; “Merge merge request” is the expected merge label for a provider whose review noun is “merge request”. This records planning and validation changes only, with no runtime enablement or governance seal.

On 2026-09-11, branch `plans/dl044-followups-20260911` refined the already reconciled `TCP-GITHUB-PR` profile with explicit adapter-owned authority and guards, command/Forge owner references, and alias migration and validation coverage. The same follow-up hardened the wiring vocabulary check with required review-command vocabulary, validated source/field bindings, per-noun fixture rendering, explicit null-vocabulary unavailability, and unittest coverage registered in `.gitignore`.

### DL-045: Bounded Event Authority technical binding definitions for Steps 8–9

On 2026-09-11 at **17:38:05.609154 UTC**, Jared answered exactly **“Approve the bounded proposal”** to the Technical contract authority Steps 8–9 question (`call_DvY9cAd5SBCN8ACboljCpno8`). The genuine response is `EA-BINDINGS-285-RESPONSE-001` in `reports/event-authority-20260911/decision-responses.jsonl`.

This is a bounded exception to DL-039's prohibition on inventing consumer, projector or checkpoint identifiers. For the exact 285 event families below, the responsible semantic and Storage owners may explicitly define a missing technical binding for **already specified behavior**, after checking current canonical sources for an existing definition. Each event requires its own documented search scope, citations to existing partial contracts, and negative evidence that the required definition was not found within that scope. Reuse an existing binding only when its owner defines the required role, version and scope; do not infer it from a sibling, descriptive role, schema version, family ID or unrelated checkpoint. Label newly authored definitions as new owner contracts, never as pre-existing evidence. The three investigated cases in the approved proposal do not establish that all 285 families lack bindings.

New definitions are limited to technical identity and scope joins, concrete checkpoint values and cursors, atomic projection/advancement, replay, currentness, recovery and withdrawal for that already specified behavior. This approval does not decide new features, user-visible integrations, retention/deletion policy, or competing-owner choices. Those remain genuine product decisions. The 20 card-gated families below may receive independent technical drafts, but dependent semantics and admission remain held until the applicable answer is genuinely recorded and applied. The task-failure and runtime-artifact-retention cards remain unanswered by this approval.

Every event still requires its full owner-backed Event Authority contract, exact schema references, positive and negative semantic checks, and root review. Existing registered membership is unchanged and is not depth proof; the 39 registered families below receive depth work only, without re-admission. Any new registration proceeds through Storage **one family per landing**, after all required contract and product gates close. This decision itself admits no event, defines no concrete binding identifier, creates no new registry service, and provides no native-runtime proof, automatic depth pass, validator modification, frozen-accounting change, freeze/closure hash restamp, Spec Lock update, readiness clearance, WorkNode, NodeSeed or seal.

#### Exact approved scope

The frozen source is `reports/event-authority-20260911/step-09-binding-authority-scope.json` at commit `dc5ba81f422dfe71ecfa69f700d6c774f441b71a`, SHA-256 `9ecfdcb99773d13c4d3d5d5dca56c033f8199f12ae2a1e20091b20045669a159`. The approved question is `reports/event-authority-20260911/step-09-binding-authority-question.md` at that same commit, SHA-256 `7e063e919d4c566999b9b310c28acac3b8844aaa6fb41f9f85dbf4f8030f7424`. Later report edits do not expand this approval. The following canonical exact-name scope carries that frozen membership; owner labels route investigation and do not override any event's actual semantic/Storage authority.

`R` = 39 already registered families, depth only; `T` = 226 unadmitted technical rows; `C` = 20 unadmitted rows with independent product gates. Total: 285 exact families across 35 owner batches. These counts describe work scope, not proven absent identifier sets.

| Owner batch | R — registered depth only | T — unadmitted technical | C — independently product-gated |
|---|---|---|---|
| `Plans/Contracts_V0.md` | — | `debug.investigation.context_item_added`, `debug.investigation.context_item_state_changed`, `debug.investigation.exported`, `debug.investigation.imported`, `debug.investigation.instrumentation_state_changed`, `debug.investigation.started`, `debug.investigation.state_changed`, `debug.investigation.target_bound`, `debug.investigation.verification_recorded` | — |
| `Plans/Executor_Protocol.md` | `run.started` | `attempt.completed`, `attempt.started`, `node.blocked`, `node.completed`, `node.started`, `node.unblocked`, `plan.decomposition_degraded`, `remediation.resolved`, `remediation.spawned`, `run.completed`, `run.graph_integrity_failed`, `run.node_backoff_expired`, `run.node_backoff_started`, `run.node_ready`, `run.node_retry_scheduled`, `scheduler.pass` | — |
| `Plans/FileManager.md` | — | `file.copied`, `file.created`, `file.deleted`, `file.exported`, `file.moved`, `file.renamed`, `folder.copied`, `folder.created`, `folder.deleted`, `folder.exported`, `folder.moved`, `folder.renamed` | — |
| `Plans/FileSafe.md` | `safe_point.recovery_unavailable` | `filesafe.command_denied`, `filesafe.destructive_override_denied`, `filesafe.destructive_override_granted`, `filesafe.destructive_override_requested`, `filesafe.guard_init_failed`, `filesafe.path_denied`, `filesafe.policy_degraded`, `safe_point.created`, `safe_point.restored` | — |
| `Plans/FinalGUISpec.md` | — | `alert.acknowledged`, `alert.dismissed`, `alert.rule_muted`, `alert.snoozed`, `bundle.annotation_state_changed`, `bundle.note_created`, `bundle.note_status_changed`, `panel.redocked`, `panel.undocked` | — |
| `Plans/FinalGUISpec.md#f3-515---settled-interaction-event-and-persistence-boundary` | `workspace.layout_changed` | — | — |
| `Plans/Formatters_System.md` | — | `format.applied` | — |
| `Plans/GitHub_API_Auth_and_Flows.md` | — | `auth.github.authenticated`, `auth.github.device_code.issued`, `auth.github.disconnected`, `auth.github.failed`, `auth.github.token.polling` | — |
| `Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima` | `goal.blocked`, `goal.cancelled`, `goal.child_status_changed`, `goal.completed`, `goal.created`, `goal.degraded`, `goal.evidence_captured`, `goal.progressed`, `goal.receipt_recorded`, `goal.replanned`, `goal.scheduled`, `goal.stopped`, `goal.tool_check_recorded`, `goal.updated`, `goal.verification_decided`, `goal_run.blocked`, `goal_run.cancelled`, `goal_run.certified`, `goal_run.replanned`, `goal_run.started`, `goal_run.stopped` | — | — |
| `Plans/LSPSupport.md` | — | `lsp.server.lifecycle_changed` | — |
| `Plans/Models_System.md` | — | `model.catalog_refreshed` | — |
| `Plans/Orchestrator_Page.md` | — | `concern.assigned`, `concern.created`, `concern.evidence_linked`, `concern.promoted`, `concern.reopened`, `concern.resolved`, `concern.updated` | — |
| `Plans/Personas.md` | — | `persona.created`, `persona.deleted`, `persona.exported`, `persona.imported`, `persona.selected`, `persona.updated` | — |
| `Plans/Plugins_System.md` | — | `plugin.hook.blocked`, `plugin.hook.error`, `plugin.hook.invoked`, `plugin.load_failed`, `plugin.loaded`, `plugin.permission.override`, `plugin.tool.collision`, `plugin.tool.registered` | — |
| `Plans/Progression_Gates.md` | — | `gate.evaluation_started`, `gate.failed`, `gate.passed`, `requirements.clarification_requested` | — |
| `Plans/Project_System.md` | — | `project.added`, `project.created` | — |
| `Plans/Prompt_Pipeline.md` | — | `subagent.context_rehydrated`, `subagent.context_shrunk` | — |
| `Plans/Runtime_Artifacts_Panel.md` | — | — | `runtime_artifact.api_web_call`, `runtime_artifact.artifact_version`, `runtime_artifact.before_after_snapshot`, `runtime_artifact.browser_recording`, `runtime_artifact.code_diff`, `runtime_artifact.context_snapshot`, `runtime_artifact.cost_usage`, `runtime_artifact.document`, `runtime_artifact.evidence`, `runtime_artifact.failed_attempts`, `runtime_artifact.hitl_approval`, `runtime_artifact.implementation_plan`, `runtime_artifact.reasoning_summary`, `runtime_artifact.restore_point`, `runtime_artifact.screenshot`, `runtime_artifact.subagent_lineage`, `runtime_artifact.suggested_next_steps`, `runtime_artifact.tool_llm_trace`, `runtime_artifact.validation_test` |
| `Plans/Section15_MVP_Promoted_Features_Spec.md` | — | `browser.context_captured`, `browser.context_share_revoked`, `browser.context_shared`, `browser.session.closed`, `browser.session.created`, `browser.session.navigated`, `browser.session.promoted`, `browser.session.resized`, `browser.session.state_changed`, `browser.session.takeover_state_changed`, `catalog.install.completed`, `catalog.install.started`, `catalog.remove.completed`, `catalog.remove.started`, `catalog.update.completed`, `catalog.update.started`, `dev.session.restarting`, `dev.session.started`, `dev.session.stopped`, `dev.session.stopping`, `preview.session.refreshed`, `preview.session.started`, `preview.session.stopped` | — |
| `Plans/Section15_MVP_Promoted_Features_Spec.md#pmconcept7-home-workspace-terminal-reconciliation` | `terminal.workgroup_moved` | — | — |
| `Plans/Settings_System.md` | — | `settings.theme.updated`, `settings.updated` | — |
| `Plans/Source_Control_System.md` | — | `git.clone.completed` | — |
| `Plans/Tools.md` | — | `tool.denied`, `tool.execution_completed`, `tool.execution_started`, `tool.invoked` | — |
| `Plans/Widget_System.md` | — | `dashboard.widget_added` | — |
| `Plans/WorktreeGitImprovement.md` | — | `config.migrated`, `worktree.created`, `worktree.deleted` | — |
| `Plans/assistant-chat-design.md` | `restore_point.applied`, `restore_point.corrupt`, `restore_point.created`, `restore_point.deleted`, `restore_point.expired` | `bundle.selection_forward_blocked`, `bundle.selection_sent_to_chat`, `chat.message`, `chat.response_stop_requested`, `chat.thread_archived`, `chat.thread_created`, `chat.thread_deleted`, `chat.thread_worktree_bound`, `chat.thread_worktree_create_failed`, `chat.thread_worktree_merge_failed`, `chat.thread_worktree_merged`, `chat.thread_worktree_pr_created`, `chat.thread_worktree_pr_failed`, `chat.thread_worktree_pre_merge_test_failed`, `chat.thread_worktree_pre_merge_test_passed`, `chat.thread_worktree_pre_merge_test_started`, `chat.thread_worktree_renamed`, `chat.thread_worktree_unbound` | `task.failed` |
| `Plans/assistant-memory-subsystem.md` | — | `memory.dedup_sweep.completed`, `memory.dedup_sweep.started`, `memory.gist.discarded`, `memory.gist.pinned`, `memory.gist.unpinned`, `memory.gist.updated`, `memory.gist.verification_failed`, `memory.gist.verification_requested`, `memory.gist.verified`, `memory.gist_state_changed`, `memory.index.lexical.rebuild.completed`, `memory.index.lexical.rebuild.started`, `memory.index.semantic.rebuild.completed`, `memory.index.semantic.rebuild.started`, `memory.monthly_summary.completed`, `memory.monthly_summary.started`, `memory.prune_archive.completed`, `memory.prune_archive.started`, `memory.verification_sweep.completed`, `memory.verification_sweep.started` | — |
| `Plans/chain-wizard-flexibility.md` | — | `bundle.revision_completed`, `bundle.revision_interrupted`, `bundle.revision_requested`, `bundle.revision_started`, `wizard.blocked`, `wizard.deferred_payload.loaded`, `wizard.opened`, `wizard.unblocked` | — |
| `Plans/human-in-the-loop.md` | — | `approval.denied`, `approval.granted`, `approval.requested`, `approval.timeout` | — |
| `Plans/newtools.md` | `platform.capability_evaluated` | `doctor.custom_headless.checked`, `live.artifact.created`, `live.session.completed`, `live.session.degraded`, `live.session.started`, `live.step.updated`, `tool.custom_headless.skipped` | — |
| `Plans/orchestrator-subagent-integration.md` | — | `config.validation.failed`, `coordination.agent_aborted`, `coordination.agent_crashed`, `coordination.agent_file_ownership_updated`, `coordination.agent_operation_updated`, `coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_unregistered`, `crew.board_message_posted`, `crew.board_message_read`, `crew.board_messages_archived`, `crew.completed`, `crew.coordination`, `crew.disbanded`, `crew.formed`, `crew.member_added`, `crew.member_removed`, `parser.error`, `phase.force_completed`, `subagent.budget_warning`, `subagent.cancelled`, `subagent.completed`, `subagent.context_warning`, `subagent.escalated`, `subagent.failed`, `subagent.message_received`, `subagent.message_sent`, `subagent.model_switched`, `subagent.output_truncated`, `subagent.paused`, `subagent.progress`, `subagent.resumed`, `subagent.retried`, `subagent.spawn_completed`, `subagent.spawn_requested`, `subagent.spawned`, `subagent.started`, `subagent.timeout`, `subagent.tool_called`, `subagent.tool_completed` | — |
| `Plans/storage-plan.md` | — | `coordination.debug_mirror_exported`, `run.background_enqueued` | — |
| `Plans/storage-plan.md#225-eventrecord-persistence-boundary` | `seglog.event_appended` | — | — |
| `Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe` | `storage.boot_recovery`, `storage.compaction_lifecycle_changed`, `storage.deletion_lifecycle_changed`, `storage.integrity_detected`, `storage.recovery_applied`, `storage.retention_hold_changed`, `storage.value_quarantine_changed` | — | — |
| `Plans/usage-feature.md` | — | `usage.event` | — |

The six semantic exclusions remain outside this approval: `chat.plan_todo_updated`, `context.compaction.failed`, `context.compaction.started`, `onboarding.free_models_refresh_retried`, `onboarding.free_models_refreshed`, `onboarding.provider_setup_opened`. `context.compaction.completed` remains governed by the separate DL-040 approval and is not part of the 39-family depth subset.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Plan_To_Node_Compilation.md

### DL-046: Bounded Browser technical bindings and individual admission landings

At **2026-09-11T18:26:45.328890Z**, Jared answered exactly **“Apply it to the Browser families too”** to `call_r0F6Nos7xoXWcSwqdJ07Xvbm` and **“Approve the bounded Browser permission”** to `call_bpjmQ6ChvlSaYMcVDTi8OV4a`. The first confirms one-family-per-landing for these Browser families; the second grants the bounded technical-definition permission below. The earlier **“ok that sounds good”** at 18:06:01.565221Z confirmed the recommendation to prepare contracts together and admit separately.

This approval covers only the exact 53 names below. It is separate from DL-045's original 285-family scope, whose membership is unchanged and disjoint. Browser and Storage owners may define missing technical consumer/projector/checkpoint bindings for already specified behavior only after a documented **per-family** search of current canonical sources, citations to relevant existing partial contracts, and scoped negative evidence for each missing definition. Existing definitions come first: reuse requires the owner-defined role, version and scope, not a sibling name, descriptive role or schema version. New definitions must be explicitly labelled newly authored owner contracts; this approval and the first investigated family do not prove that all 53 lack definitions.

The technical permission covers identity/scope joins, versioned checkpoint values/cursors, atomic projection and advancement, replay, currentness, recovery and withdrawal for existing behavior. It does not choose new features, user-visible integrations, retention/deletion policy or competing-owner authority. Unresolved product choices continue to block dependent definitions and admission. Every family still needs its complete owner-backed Event Authority contract, exact schema references, positive and negative semantic checks, root review and its **own Storage-owned admission landing**. Preparing payloads, schemas, fixtures or wiring expectations together is not admission. A prepared row remains denied by the admission path, absent from the central event registry and unable to advance a projection checkpoint.

This decision itself defines no binding identifier, admits no event, changes no runtime capability, and grants no bulk admission, native proof, historical-audit restamp, frozen-accounting change, Spec Lock update, WorkNode, NodeSeed, readiness clearance or governance seal. The separate task-failure and runtime-artifact-retention questions are not answered here.

#### Exact Browser scope and response custody

The frozen proposal is `reports/packet-gap-closure-20260910/browser-binding-authority-proposal-20260911.json`, SHA-256 `717965b747decfc8548fb8d05cc1bb7fb551adae9bcf70c16f38d2bf087fc137`. Its scope source is the prepared `Plans/browser_event_admission.json` snapshot SHA-256 `9fd94e681052b5677016d262aab470f3fd39cd709eec3696658fe88269387534`. The exact question/answer receipt is `reports/packet-gap-closure-20260910/browser-binding-authority-response-20260911.json`, SHA-256 `d297e4a9dfab30f1679946768df8a67bb84c8d58304eae935d1aeba1d9b90274`, response ID `BROWSER-BINDINGS-53-RESPONSE-20260911`. Receipt application-status text describes capture time; this decision records its canonical application. Later file edits do not enlarge the approved name set.

- `browser.workspace.created`, `browser.workspace.reset`, `browser.workspace.closed`
- `browser.page.created`, `browser.page.activated`, `browser.page.closed`
- `browser.controller_lease.granted`, `browser.controller_lease.renewed`, `browser.controller_lease.lost`, `browser.controller_lease.takeover_requested`, `browser.controller_lease.takeover_completed`
- `browser.navigation.generation_changed`
- `browser.document.generation_changed`
- `browser.representation.captured`, `browser.representation.delta_created`, `browser.representation.queried`, `browser.representation.invalidated`
- `browser.script.compile_started`, `browser.script.compiled`, `browser.script.compile_failed`
- `browser.execution_strategy.selected`, `browser.execution_strategy.fallback_selected`
- `browser.program.started`, `browser.program.checkpointed`, `browser.program.paused`, `browser.program.resumed`, `browser.program.completed`, `browser.program.failed`, `browser.program.cancelled`, `browser.program.segment.started`, `browser.program.segment.checkpointed`, `browser.program.segment.completed`, `browser.program.segment.failed`, `browser.program.segment.timed_out`, `browser.program.timeout.stopped`, `browser.program.timeout.effects_reconciled`, `browser.program.timeout.effect_state_unknown`
- `browser.program_workspace.created`, `browser.program_workspace.updated`, `browser.program_workspace.checkpointed`, `browser.program_workspace.spilled`, `browser.program_workspace.closed`
- `browser.screenshot.model_attachment_selected`, `browser.screenshot.skipped`
- `browser.route.fetch_selected`, `browser.route.browser_escalated`
- `browser.routine.generated`, `browser.routine.validated`, `browser.routine.promoted`, `browser.routine.invalidated`, `browser.routine.disabled`
- `browser.session.reconstructed_on_host`, `browser.session.interrupted`

ContractRef: ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-166, ContractName:Plans/Contracts_V0.md#CV-332, ContractName:Plans/storage-plan.md#SP-262

### DL-047: Retain accepted Goal text and revisions with their chat

On 2026-09-11, Jared answered exactly **“Approve: retain with the chat (recommended)”** to the `EA-S08-GOAL-OBJECTIVE-RETENTION` question (`call_kj3ZG4Ui0TdZN03B95Pwxv36`, item 0). The response was recorded at 23:46:02 UTC as `EA-S08-GOAL-OBJECTIVE-RETENTION-RESPONSE-001` in `reports/event-authority-20260911/decision-responses.jsonl`.

`GoalRecordV2`, its current accepted objective, accepted objective revisions and the minimum replay lineage needed to read that history remain available to authorized history and recovery while their chat is retained, including archived chats. Context compaction, restart and model changes do not purge this history. Deleting the chat hides this Goal content immediately, purges active content within 24 hours and deleted backup content within 30 days, unless a valid hold delays physical purge. A hold does not restore ordinary visibility of deleted content.

Goal Runtime owns the meaning and accepted revision history; Storage owns the explicit retention assignment, deletion, holds and coherent recovery. Permanent content-free audit and lineage records retain their existing policies and references, but add no extra hold on the Goal text and cannot reconstruct it after deletion. Attachments, source messages/context, Plans, To-Dos, workflow records and evidence retain their independent owners and policies; a Goal reference alone does not retain their bodies. Retaining a chat therefore retains every accepted objective version, including superseded versions; deleting it also removes ordinary access to that Goal history.

This bounded retention choice resolves the body/history policy prerequisite left open by DL-045. It authorizes the corresponding owner contract work and does not select independent post-chat Goal-history retention, certification-exception semantics, sibling event admission or runtime execution. The exact approved card is `/home/sittingmongoose/PM-Experiments/event-authority-step08-goal-objective-retention-card-20260911/goal-objective-retention-card.md`, SHA-256 `d3ac058594a52ea5231ebb1653d85b38ae3bf7898f5c90a3ba8a461208d35c67`; the repository card and response receipt preserve that choice. Concrete physical schemas, writer/read/recovery bindings and semantic checks remain required. This decision does not clear depth, readiness or governance gates.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### DL-048: Platform decision custody follows pending evaluations and retained references

On 2026-09-12, Jared answered exactly **“Approve this reference-based lifetime”** to `EA-S08-PLATFORM-CUSTODY-LIFETIME` (`call_1PJzb6orMv2uLdLZYb4jdU1w`, item 0). The response was recorded at 01:32:26 UTC as `EA-S08-PLATFORM-CUSTODY-LIFETIME-RESPONSE-001` in `reports/event-authority-20260911/decision-responses.jsonl`.

Retain a minimal, non-secret immutable platform-capability decision record while its original evaluation remains pending and while any retained referencing event, frozen run snapshot or valid owner hold still requires it. After the evaluation is resolved and the last such reference or hold ends, delete the record through authorized reference-aware cleanup; do not add an independent grace period or app-root indefinite result lifetime. Cleanup must authenticate the complete current pending/reference/hold state and preserve it through the deletion boundary. A digest or absent cache is not proof that references have ended.

The minimal record may preserve original occurrence/context/retry identity, admitted catalog revision and selected entry, the source-owner decision facts and provenance needed to explain the choice, frozen producer input and original receipt join. This approval does not retain raw probe logs, provider responses, credentials, account content, old transaction controls or source-service history. Those sources keep their existing owner policies. Original append receipts, retained events and frozen run snapshots keep their independent policies; this decision neither shortens them nor turns their references into a hold on raw source bodies.

PlatformCapabilityManager/newtools own evaluation meaning and original decision authority, Models and concrete capability-domain owners supply source truth, Doctor remains a router, and Storage owns physical custody, reference-aware retention/deletion, migration and coherent recovery. The active catalog remains unchanged and empty. This policy creates no capability identity, new evaluation trigger, account-derived scope, event admission or runtime proof. Application/project event scope and RP-OPERATIONAL-2555D remain unchanged.

This explicit product choice resolves the lifetime prerequisite excluded from DL-045's technical authority. Concrete closed record/schema/codec, writer/read/recovery, original-source admission, reference/hold enumeration and final cleanup contracts remain required before use. The frozen card is `/home/sittingmongoose/PM-Experiments/event-authority-step08-platform-prerequisite-20260912/v1/lifetime-owner-card.md`, SHA-256 `38dc858c42126a6b12a4f10e15a0bc1d23dd2a9b4bdfc1903f40ee9792cc9d33`. No event obtains depth, readiness or governance clearance from this decision.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

### DL-049: Keep completed compaction detail for seven days

On 2026-09-12, Jared answered exactly **“Keep for 7 days”** to `EA-S8-COMPACTION-DETAIL-CLEANUP` (`call_gIlL1Kp5idZm1DuOMhSjrLat`, item 0). The answer was recorded at 09:58:07 UTC as `EA-S8-COMPACTION-DETAIL-CLEANUP-RESPONSE-001` in `reports/event-authority-20260911/decision-responses.jsonl`. The acknowledged interpretation is seven days after the operation fully settles, with holds and live references delaying deletion and registered backup copies retaining their existing rules.

Retain completed frozen-input survivor/removal/translation details, obsolete historical candidate/carrier/publication proof snapshots, and resolved detailed compaction journal/attempt/phase records for **seven days (604800 seconds)** after the first durable fully settled original terminal result. Settlement requires every physical attempt and every required event, original receipt and terminal-result obligation to be resolved. This applies to a fully settled successful or failed compaction; unresolved operations have no expiry anchor. Inclusive expiry is at that immutable first settlement time plus 604800 seconds. Reads, retries, re-observation, duplicate terminal replies and later reference release never restart that clock.

Expiry is necessary but insufficient for deletion. Current-source/control membership, valid holds and live, backup, rollback, recovery or maintenance dependencies protect required detail beyond seven days. Cleanup must authenticate the complete original settled result, actual policy, exact eligible artifact members and all current protections through the deletion boundary. Missing or conflicting evidence refuses deletion. A mutable journal containing any required member cannot be removed as a whole. The existing janitor schedule applies after eligibility; this decision creates no independent timer, count cap or pressure-eviction bypass.

Current selected source segments and controls, original append receipts/dedupe identities, the minimum content-free original compaction-ID terminal-result mapping, and independently required owner records keep their separate policies. Registered backup copies keep their existing retention and hold rules; active-detail removal neither deletes a backup copy nor bypasses a backup dependency. This decision adds no backup deadline or retention extension. After lawful detail disposal, historical detail inspection may be unavailable; translation or rebuilding still requires actual current source and its existing owner proof. An event or retained receipt cannot reconstruct disposed detail or restart the original operation.

Storage owns the exact policy registration, immutable settlement anchor, native artifact/member custody, holds/reference enumeration and crash-safe disposal. This bounded product answer resolves the completed-detail lifetime prerequisite excluded from DL-045's technical authority. The frozen question/card is `/home/sittingmongoose/PM-Experiments/compaction-detail-owner-card-root-20260912/manifest.json`, SHA-256 `8d6769266be30c7bfd4cab814d2ad04de30881223f397d2afe6521973e992a0e`; the separate answer preserves the seven-day choice rather than selecting the card's immediate-removal recommendation. Concrete schemas, original writer/read/recovery bindings and semantic checks remain required. Quarantine policy, event admission, native execution, overall depth, readiness and governance sealing are not decided here.

ContractRef: ContractName:Plans/storage-plan.md#SP-237, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/Decision_Log.md#DL-045

### DL-050: Hosted-repo requests route by the selected adapter, never by default to GitHub

Decided on 2026-09-16 by Jared.

The question was where the assistant should send a hosted-repository request: to the GitHub command family, as the chat command boundary still said, or to the universal forge commands with the provider taken from the repository the user has selected. It came up because a scoped review of the GitLab plan found the chat boundary still routing every pull request, review, comment, release, pipeline, workflow and hosted-administration request to GitHub, after the wiring rows and the command catalog had already moved to one command per user action with provider differences held in the adapter. A user working on a GitLab project would have had the assistant name and dispatch the wrong service.

The options were:

1. Route hosted-repository requests to the universal forge command families and resolve the provider from the selected repository adapter, keeping provider-specific families only where the forge owner defines no generic equivalent.
2. Leave the chat boundary pointing at GitHub and add a separate exception for each other provider as it ships.
3. Keep provider-specific routing everywhere and let every provider own its own chat command family.

The answer is option 1. Hosted-repo requests route by the selected adapter and never default to GitHub. Naming a provider, or typing a provider prefix, qualifies the same universal command instead of selecting a different family; the assistant says which provider it resolved and never quietly substitutes another, and when the named provider is not the selected one it says so and asks or refuses under the disclosure rules already written. The boundary between local Git work and hosted work does not move: the assistant still never reinterprets one as the other, a request that spans both still shows the handoff, and the repository, worktree and compare identity still travel between the two stages. Review wording follows the selected adapter's own review noun, so the same request reads as Pull Request or Merge Request without becoming a different command.

Two families stay provider-specific because the forge owner defines no generic equivalent: GitHub Actions, which that owner explicitly keeps GitHub-native inside the shared automation shell, and the GitHub device-code connect and disconnect commands under the same retained owner. Hosted issue work has no registered command family at all, generic or provider-specific, so the assistant says so rather than inventing a command or pushing the request into reviews, pipelines or repository administration.

This buys one routing rule that is correct for every provider the product plans to support, and it removes a passage that would have made the assistant wrong for every user who is not on GitHub. It costs a rename of the chat command-boundary section and its dispatch constraint, and it obliges the assistant to disclose the provider it resolved on every hosted request. Alongside this answer, the testing canon that still quoted a fixed count of twenty-three authored schema and fixture pairs, and a fixed census of the fixture corpus, was corrected to defer to the cardinality and counts the gate itself reports; that correction is a stale-literal repair, not a decision.

This records planning canon only. It enables no runtime behavior, admits no command or event, and seals no governance.

SourceRef: Jared, direction of 2026-09-16.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Forge_Integrations.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitLab_Integration.md, ContractName:Plans/Automated_Testing_System.md

### DL-051: New repositories may choose their object format, gated by current capability evidence

Decided on 2026-09-16 by Jared.

The question was whether Puppet Master should let a user choose the object format when it creates a new Jujutsu repository, or keep creating repositories in whatever format the engine defaults to and only report the result afterwards.

It came up because the third continuation of the Jujutsu research read the pinned native documentation and reported that the format a repository is created in is permanent, that engines, libraries, transports and hosting providers differ in which formats they can read, and that a user who wants stronger object hashing has no way to ask for it at the one moment it can be chosen. The same research separately required exact engine, command-line and repository-format qualification with truthful unsupported states. That requirement is already canon and is a prerequisite for this choice, not part of it.

The options were:

1. Offer the format choice in the existing Source Control setup flow when a new repository is created, show the discovered effective format for repositories that already exist, and disable any choice that current capability evidence does not certify.
2. Keep the current creation behaviour and record only the effective format afterwards, which is the lower-scope alternative the research itself named.
3. Offer the choice without evidence gating and let the user discover later which of their tools, transports or providers cannot read the repository.

The answer is option 1. In Jared's words: "Add the picker as described, evidence-gated."

The choice carries the dependencies the proposal itself listed. The new-repository request is typed and carries the chosen format, so the format is never inferred from a display string or a default. Format evidence is owned in one place and read from there, rather than restated on each surface. Each format has certified engine, library, transport and provider profiles, so an offered choice is disabled because current capability evidence says it is unsupported or not yet known, never because someone assumed it. Setup and cancellation both have fixtures, so an abandoned setup leaves no half-chosen format behind. The copy states plainly that the format cannot be changed afterwards. A repository that already exists shows the format that was discovered, and says so when discovery has not produced one, rather than showing a guess or the default.

This buys a deliberate choice at the only moment it can be made, and a truthful account of what each format costs the user's own tools. It costs a longer setup flow and a support matrix the product then has to keep certified; SHA-1 remains the more widely compatible format according to the pinned native documentation.

Three things the proposal excluded, and this answer does not grant: no change to which format a new repository gets by default, no migration of an existing repository from one format to another, and no promise that SHA-256 is universally supported.

This records planning canon only. It enables no runtime behaviour, admits no command, request meaning or event, certifies no engine version, and seals no governance.

SourceRef: `reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json`, finding F110, SHA-256 `c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b`; `/mnt/Cursor/PuppetMaster-Evidence/jujutsu-followup-20260911/continuation3/adjudication/sources/premium/J0028-compare/notes.md` lines 91 to 95, SHA-256 `469c95597f5d7d498d549b6dd319f98996a354e88a05d771ca17b719a52d9bfe`; Jared, direction of 2026-09-16.

ContractRef: ContractName:Plans/Source_Control_System.md, ContractName:Plans/Jujutsu_Integration.md

### DL-052: A source graph page carries at most thirty-two parent references for one node, and the rest are fetched on request

Decided on 2026-09-16 by Jared.

The question was the exact number of parent references one node may declare inside a single source graph page, and how a node with more parents than that is represented.

It came up because the correction that landed the finite-bound obligation could not invent the number. The adjudication required the bound to be finite, so that a bounded page cannot drag unbounded adjacency behind it, but reserved the exact value and the representation of an over-bound node for the owner. The landing enforced a provisional six hundred so the obligation was not left unenforced, stated in the owner document that the number was provisional and derived from nothing, and recorded the open question against the correction ledger.

The options were:

1. A small per-node bound, with an explicit way to fetch the remaining parents on request.
2. A large per-node bound chosen to hold every realistic node in one page, needing no follow-up.
3. No per-node bound at all, leaving only the page-wide edge cap to hold adjacency down.

The answer is option 1. In Jared's words: "for the parent referenced bound, lets do 32 then the ability to fetch the rest."

A node declares at most thirty-two parent references in a page. A node with more parents marks its parent list as truncated and carries a reference through which the remaining parents are fetched, one bounded request at a time. That follow-up answers to the same fences as page continuation: the same repository, workspace, backend and projection identity, the same projection generation, and the same currentness rule, so a stale or superseded page cannot be expanded as though it were current. A node that is not truncated carries no such reference and nothing left to fetch. The provisional six hundred is retired.

This buys a page whose per-node adjacency is small enough to lay out and render without a hidden cost, while keeping every parent reachable. It costs a second bounded request path and its fences, and the view must show truncation honestly rather than presenting thirty-two parents as all of them.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: open question `q-001` in `Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections`; `reports/jujutsu-research-2026-09-11/continuation3-landing/verification.json`; Jared, direction of 2026-09-16.

ContractRef: ContractName:Plans/Source_Control_System.md

### DL-053: A source graph page never repeats a node reference, even on two identical rows

Decided on 2026-09-16 by Jared.

The question was whether a page may carry the same node reference twice when the two rows agree on everything, or whether a repeated reference is wrong on its own.

It came up while the two page relations that no schema can express were being wired into the contract gate. The owner rule, as it was written, forbade only the case that was demonstrably ambiguous: two rows sharing a reference while naming different revisions. That left an exact duplicate row permitted, so the gate that enforces the rule would have accepted a page that emits the same node twice.

The options were:

1. Require the node reference to be unique within a page, so an exact duplicate is rejected on the same rule as a conflicting one.
2. Keep the narrower rule, forbidding only rows that share a reference while disagreeing on the revision they name.

The answer is option 1. In Jared's words: "Yes, forbid exact duplicates too, fold it in."

A page never emits the same node reference twice. A repeated reference breaks stable node identity and selection anchoring however alike the two rows are, because the anchor that survives pagination has no way to say which row it means. The narrower wording is retired, and the gate rule that enforces it now rejects both cases.

This buys a rule that says exactly what it enforces, and it removes the gap that a duplicate row would have slipped through. It costs nothing a correct page was doing, since a page that emits each node once already satisfies it.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: question `q-003` in `Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections`; Jared, direction of 2026-09-16.

ContractRef: ContractName:Plans/Source_Control_System.md

### DL-054: A parent list is truncated only at the bound, and an expansion request carries the page's freshness horizon

Decided on 2026-09-16 by Jared, answering two questions raised by the independent review of the parent-expansion contract.

The first question was whether a producer may truncate a node's parent list before it holds all thirty-two references. The contract already required a truncated node to be exactly full, which was one step past the words of the original answer: that answer set the bound and required a way to fetch the rest, and said nothing about truncating early for a producer's own reasons.

The second question was whether the fetch-the-rest request should carry the page's expiry instant. Both the owner document and the decision that introduced the request say it is fenced exactly as page continuation is, but the request repeated only the page's state, generation and observation instant, leaving out the expiry the page itself declares. A consumer holding only the request could not tell whether that freshness window had already passed.

Jared's answer to both, and to a cosmetic indentation repair offered alongside them, verbatim: "1. no 2. yes 3. ok"

So a producer may not truncate early. Truncation is reached, never chosen: a node carries thirty-two parent references and marks itself truncated, or it carries fewer and has no more parents. A short list is therefore a complete list, which is what a reader already assumes. The contract already worked this way, so nothing about it changes; the rule is now stated where it can be read rather than only inferred from a bound.

And the request now echoes the page's currentness field for field, including the expiry instant, so the freshness horizon is readable from the request alone and nothing has to be inferred about the page it came from. With that field added, the claim that the request is fenced exactly as page continuation is became literally true rather than nearly true.

This buys two sentences that say what the contract does, and one field that closes the gap between a promise and its shape. It costs one more required field on a request that already carried three, and it removes a freedom no producer had asked for.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: questions `q-004` and `q-005` in `Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections`; `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/F110_ANSWER_20260916.md`, SHA-256 `e532c325d07d8da100a6b6ef16398dee1a475e39dfd12b77d881c5e2c40978b4` as read on 2026-09-16; Jared, direction of 2026-09-16.

ContractRef: ContractName:Plans/Source_Control_System.md

### DL-055: A plan-layer seal is a production seal, and the repository-wide gates run at landing

Decided on 2026-09-17 by Jared.

The question was what a per-plan governance seal should run. It could run the whole profile, four of whose operations validate the entire repository rather than the plan being sealed, or it could run only the operations that act on that plan and leave the repository-wide four to the moment a branch lands and to a nightly schedule.

It came up because the seal of one small plan was measured spending 80 to 85 percent of its script time in those four operations: about 22 of the 27 minutes a seal took on the clean run of 2026-09-10. They read the whole corpus, they fail on this repository for reasons that have nothing to do with the plan being sealed, and a change to a single plan cannot be what they are checking. The fifteen operations that do act on the plan take about two to three minutes between them. The reduced profile had already been shown to be the exact subset of the full one, with every retained operation running the same validator with the same arguments, and the seals produced under the full profile were already recording that they did not qualify the repository. So the claim a seal of this kind makes is not new; it stops running work it never claimed.

The options were:

1. Run the plan-layer profile for every per-plan seal, and run the repository-wide checks when a branch lands on main, with the migration snapshot and the same checks on a nightly schedule.
2. Keep the full profile in every seal and accept the time.
3. Run the full profile for the first seal of a new plan and the plan-layer profile for amendments.

The answer is option 1. Plan-layer seals are fine for production; the repository-wide gates run at landing.

A per-plan seal therefore runs fifteen operations: it registers owners, generates and validates the plan index, generates readiness, generates and validates the audit status, generates and checks shards, synchronizes shard evidence, refreshes Spec Lock, validates the final index, checks the readiness projection, verifies Spec Lock, validates the plan graph, and validates evidence. It omits the two aggregate gate runs and the two migration-snapshot operations. Nothing about the retained operations changes: each runs the same validator with the same arguments and the same scope it ran before, so this removes work rather than weakening it.

What makes that safe is the label the seal record carries, not the decision. A plan-layer seal record names its profile, names the four operations it did not run, records that the repository is not qualified by it, and records that the repository gates were not run in it. A seal like that cannot be read as a full-profile seal, and it claims no result for anything it skipped. A plan-layer seal never claims repository qualification.

Three of the four omitted operations, the gate run, the governance audit and the migration validate, run when a branch lands on main and on a nightly schedule. At landing they run in the shared checkout after the fast-forward and the shard check and before main is pushed, and they cost about ten minutes there. Since Jared's answer of 2026-09-18 the lander reads them through `scripts/pm-landing-check.py`, which runs the same three checks and reports only the failures that are new since the recorded baseline `reports/landing-checks/baseline.json` and the failures that name a path the branch touches; the first baseline held 37,935 failures that named no landed file, and reading that list at every landing told the lander nothing. The baseline is recorded from a full run against main in a full checkout, committed with the commit it was taken at, and refreshed on the nightly schedule only, never per landing. The migration snapshot creates a new tracked run directory, so it never runs in the shared checkout at landing; it runs nightly, in a worktree, by the designated Plans agent. A landing is refused when a failure names a file the landing branch touches, and that failure is fixed on the branch; when every failure names files the branch does not touch, the landing proceeds and the failures are reported. That is the rule the shard check already follows, applied to the same moment. Stale governance hashes for the very documents a branch edited, in Spec Lock, the evidence hashes, the readiness report or the migration inventory, are what every canon edit produces until the designated Plans agent reseals; they never stop a landing and are reported with a reseal request. The nightly run covers the repository whether or not anything landed, so repository qualification never depends on somebody having pushed a branch.

This buys a per-plan seal in the order of twenty minutes instead of forty, and a seal cost that scales with the change instead of with the repository. It costs a seal record that has to say what it did not run, three checks that must actually run at landing and four operations on a schedule rather than being assumed, a landing that is refused when they fail on files the branch touches, and a recorded baseline that has to be refreshed or the residue it excuses goes stale.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D2_PLAN_LAYER_SEAL_DECISION_BRIEF.md`, SHA-256 `36be3a9a620f74b4754484844d3a8dfc645ed4df7821cc0ef62d4ac7696dbb36` as read on 2026-09-17; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/C_ARCHIVE_TEST_REPORT.md`, SHA-256 `923f43cfa7487f7bca537c6db84068c529d9b0ca701acc6d97f1f3c7ac0f1234`; Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

### DL-056: Conflict and merge editors are read-only or built-in on a Jujutsu workspace

Decided on 2026-09-17 by Jared, answering a decision card raised by the continuation-4 candidate adjudication.

The question was what Puppet Master should do about conflict and merge editing on a Jujutsu workspace. Three continuation-4 review arms independently proposed a typed per-path save vocabulary for a diff, compare or merge editor, and each of the three also offered the alternative of deciding explicitly to keep Jujutsu conflict resolution terminal-native. A fourth candidate noticed that `merge_editor_available`, the flag that gates the Open Merge Editor row in the command catalog, occurs exactly once in the whole corpus and is defined by no owner at all.

It came up because these four, with the bookmark-disclosure candidate answered as DL-057, are the five continuation-4 candidates that are not corrections. Nothing in canon is false today: the Git conflict commands are scoped to Git adapter commands, the Jujutsu inventory deliberately contains no conflict-resolution command, and a flag with no definition on a command with no handler makes no claim. But the moment anyone builds that surface, an undefined availability flag and an undefined save contract both become load-bearing, and the arms agreed on the one thing that must never be true: that "missing" is an admissible write instruction.

The options were:

1. Scope diff open, merge-editor open and the Git external-merge-tool preference as read-only or built-in-editor-only on a Jujutsu workspace, define `merge_editor_available` in its owner, and give a control disabled by that scoping a typed reason. Defer the save-back contract until the built-in editor's save path is designed.
2. Open the surface now with a typed per-path save vocabulary, as the three arms proposed.
3. Decline, and state that Jujutsu conflict resolution stays terminal-native.

The answer is option 1.

So `merge_editor_available` now means exactly one thing, owned by Source Control: Puppet Master's own built-in structured merge editor is present and usable for the selected conflicted file on this Host and Environment. It says nothing about any external tool, and the Git preference that opens an external tool never sets it. On a Jujutsu workspace the diff-open, merge-editor-open and external-tool preference surfaces are read-only or built-in-editor-only, so no external tool is handed a Jujutsu workspace to write into. A control disabled by that scoping carries `conflict_surface_read_only_on_jujutsu` rather than going quiet, and its safe next action is the one the existing closed vocabulary already has: inspect.

The save-back contract is deferred, not declined, and the four candidates that raised it are recorded as deferred under this decision rather than rejected. When the built-in editor's save path is designed, the typed per-path vocabulary the three arms converged on is the starting point, and the rule they all reached — that a missing entry is never a write instruction — is what it has to satisfy.

Nothing changes on the Git-adapter side. The four conflict-assistant rows remain Git adapter commands under the rule Source Control already states, and no command enters or leaves the frozen Jujutsu inventory.

This buys a defined flag, a bounded surface and a truthful disabled state, in exchange for saying out loud that Jujutsu conflict editing is not available yet rather than leaving it ambiguous.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: question `q-006` in `Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections`; `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/C4_DECISION_CARDS_20260917.html`, SHA-256 `af57d582f87f6cdce135377af3d5fc844f25b5914f72b44860ce4431af1028d1` as read on 2026-09-17; Jared, direction of 2026-09-17, verbatim "Do you recommendations for the choices." Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Source_Control_System.md, ContractName:Plans/UI_Command_Catalog.md

### DL-057: A bookmark control says which remotes it touches before it touches them

Decided on 2026-09-17 by Jared, answering the second decision card raised by the continuation-4 candidate adjudication.

The question was whether Puppet Master should commit to a disclosure standard for Jujutsu bookmark controls. A continuation-4 arm established by literal search that no Plan text carries the words synced, unsynced, polymorphic, combined bookmark or combined chip, so the Plans supply the hooks for scope disclosure and none of the content: nothing forces an ordinary label or confirmation to name the remotes it affects, or to keep deleting a local bookmark distinct from forgetting a remote one.

It came up as a product choice rather than a correction. No canon promise is false without it: Source Control already promises Jujutsu sections use Bookmarks and never Branches, destructive actions already require a target-bound confirmation, and the contracts already require track and untrack to name an exact remote identity, so an all-remotes untrack is not even representable. What is missing is the wording a person reads before they press the button, and the guarantee that two different destructive actions do not share one control.

The options were:

1. Accept it as a disclosure requirement on the Source Control owner, with the confirmation rules carried by the command catalog and the confirmation record.
2. Leave it to whoever builds the panel.
3. Decline, on the ground that no promise is broken today.

The answer is option 1.

So the bookmark state vocabulary is exactly `synced`, `unsynced`, `tracked per remote`, `combined` and `absent`. Every control and confirmation names the remotes it affects before dispatch. Untrack on a combined bookmark confirms every remote by name; untrack on one unsynced remote confirms that remote. Rename on a tracking bookmark discloses that it untracks first. Push and fetch say whether they reach all remotes or one. Delete-local and forget-remote never share one control. Pseudo-remotes and non-fetchable remotes are not shown as ordinary remotes, and an unsynced, untracked or absent reference is never folded silently into a combined chip.

The disclosure is carried where a confirmation already is. Every Jujutsu confirmation now records `disclosed_remote_scope`, the remote scope it disclosed, and `disclosed_remote_identity_refs`, the exact remote identities it named, and the three scopes constrain the list: no remote names none, one remote names exactly one, all remotes names at least one. A confirmation that claims to affect every remote while naming none is rejected.

This adds no command. `forget-remote` stays out of the frozen thirty-one-command Jujutsu inventory, and this decision creates no route to add it.

This buys wording a person can act on and a confirmation record that proves what they were told, in exchange for two required fields on a record that already carried six.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: question `q-007` in `Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections`; `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/C4_DECISION_CARDS_20260917.html`, SHA-256 `af57d582f87f6cdce135377af3d5fc844f25b5914f72b44860ce4431af1028d1` as read on 2026-09-17; Jared, direction of 2026-09-17, verbatim "Do you recommendations for the choices." Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Source_Control_System.md, ContractName:Plans/UI_Command_Catalog.md

### DL-058: The seven shapes the continuation-4 corrections take

Decided on 2026-09-17 by Jared, answering seven questions the continuation-4 candidate adjudication raised before any canon was edited.

The question behind all seven was the same: the adjudication had found thirteen genuine corrections, and several of them could be repaired in more than one way. A correction repairs an existing promise and adds nothing, so where the repair had a cheap form and a falsifiable form, or an owner-obligation form and a schema form, the choice was the owner's rather than the adjudicator's.

The seven shapes, and what each one settles:

First, verification depth. The restore drill promised object verification and nothing defined it, so a reachability-only pass satisfied the words. The rule could go in the owner document alone, or in the owner document plus a depth field on the receipt. The answer is both, with the field referencing the Backup owner's existing `integrity_verification_level` vocabulary, so a fixture can fail on it.

Second, divergent changes. A change with more than one visible commit could be named nowhere. The frozen list of graph states could be extended or left alone, and the refusal could reuse the existing `invalid_target_identity` code, which no owner defines, or get its own. The answer is to extend the list, appended so every existing position is preserved, and to mint `change_divergent_ambiguous_target`.

Third, version identity. Two candidates wanted the same thing from different records: one wanted the closure to bind the tool and store-format version it requires, the other wanted the certification reference to have content. The answer is one shared version-identity block serving both, on the pattern the object-format profile already set.

Fourth, machine-local store entries. The repair has three obligations that can land now and one enumerated list that needs an audit of Jujutsu's internals that nobody has done. The answer is to land the three and carry the list as an open question, so the obligation is stated without pretending the list exists.

Fifth, the relational rules. Four of the repairs turn on relations JSON Schema cannot express. They could land as owner obligations with no validator, or the contract semantic gate could be extended. The answer authorizes the gate for exactly those four rules and for nothing else under `scripts/`.

Sixth, the two product choices. `merge_editor_available` belongs with the deferred merge-editor cluster rather than on its own, and the bookmark disclosure question is its own decision. Both are recorded here and answered in full as DL-056 and DL-057.

Seventh, one rejected candidate. A candidate about the marker-based gate on Mark Conflict Resolved was read by the bundle adjudicator as distinct from a continuation-3 rejection and by this adjudication as the same thing, since the rows it names are Git adapter commands. The answer confirms it stays rejected. This shape is the adjudication's own disposition and raised no ledger question of its own; it is carried by the authorization shard, which forbids reopening candidate C4D-02. The sixth shape carries two questions, `q-006` and `q-007`.

Jared's answer to all seven, verbatim and whole: "I agree with all 7 of your recommendations. You can do all the next steps. You can use Opus 5 max for your strong model." The third sentence is about experiment tooling rather than canon, and is quoted here so the record carries the whole utterance rather than the part that bears on the Plans.

What this buys is thirteen repairs that each fail a fixture when they are violated, rather than thirteen paragraphs that read well. What it costs is four new relational rules in a script that had two, a schema that carries more identity than it did, and three obligations that are written down as unenforced and tracked as open questions `q-008`, `q-009` and `q-010` rather than quietly implied.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: questions `q-001` through `q-007` in `Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections`; `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/C4_CANDIDATE_ANSWERS_20260917.md`, SHA-256 `544654e50051d8ea99c835b2989d48d1e64fdf040a8e934d6ac6d16226305608` as read on 2026-09-17; `~/PM-Experiments/c4-candidates-20260917/ADJUDICATION_PART1.md`, SHA-256 `d6b09e549eb9c2cfb4b226d19fd2fbe381ac4255ee117d8ef55d7cd5e1d59b16` as read on 2026-09-17; Jared, direction of 2026-09-17. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md

### DL-059: Branch policies are shown on a pull request, and a branch-policy read waits for the gate list

Decided on 2026-09-18 by Jared, answering the first of seven decision cards raised by the Azure DevOps research of 17 to 18 September 2026.

The question was whether Puppet Master should narrow its policy promise to what the plans already say, or add a read of the branch policies guarding a branch. Nothing in the closed forty-three-command forge set reads those policies: the two policy commands are a two-phase mutation, and the checks command is scoped to a pull request.

It came up because both research arms found the same gap and disagreed about what to do with it. Azure exposes branch policies separately from pull requests, so a person looking at a branch has no way to learn what will block a merge until they open one. Nothing in canon is false today; the plans only ever promised policy information on a pull request.

The options were:

1. Narrow the promise to pull requests now; consider the branch read later.
2. Add the branch-policy read as a new command.

The answer is option 1.

So the Azure owner says plainly that the branch policies Puppet Master shows are the ones evaluated on a pull request, and that reading the policies configured on a branch is not offered. The promise is truthful now with no new surface, and no command is added.

The branch read is deferred rather than declined, and it is deliberately not planned as a PlanUnit here. It has a natural home once the gate list of DL-062 exists, because that is the region that would display it; until that region is real, a read command would produce rows with nowhere to go.

This buys a truthful promise for the cost of saying out loud that a branch view shows no policies yet.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 1 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-001` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Azure_DevOps_Integration.md

### DL-060: An Azure vote is bound to the revision Puppet Master observed, and says so

Decided on 2026-09-18 by Jared, answering the second of the seven Azure decision cards.

The question was what an Azure approval is attached to. No Azure vote carries a revision identity, so the corpus rule that an approval is bound to a revision, read literally, makes every Azure approval stale at first observation. The choice was between binding the vote to the revision Puppet Master observed when it read it, labelled as observed by Puppet Master, and treating Azure votes as never attributable to a revision.

It came up because Azure records a reviewer's vote on the pull request rather than on an iteration. Both arms found that the staleness rule cannot be met by the provider as it is.

The options were:

1. Bind to the observed revision, labelled as observed by Puppet Master.
2. Treat Azure votes as never attributable to a revision.

The answer is option 1.

So an Azure vote is held with the provider revision Puppet Master read it against, and every surface that shows it states that the binding is Puppet Master's observation rather than the provider's assertion. A vote read before a new provider revision is stale against that revision and is shown as stale; a vote with no observation revision is not shown as current evidence at all.

The alternative was strictly truthful and unusable: it would leave the Azure owner's two vote criteria unmeetable and show every approval as unbound. Observation-time binding is what a careful human reviewer does with the same information, and the label is what keeps it honest.

This buys a usable staleness signal for the cost of one stored observation revision per vote and one sentence of copy that no other provider needs.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 2 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-002` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Azure_DevOps_Integration.md, ContractName:Plans/Forge_Integrations.md

### DL-061: The checks view leads with policy evaluations and shows unwatched statuses separately

Decided on 2026-09-18 by Jared, answering the third of the seven Azure decision cards.

The question was what the checks view should contain when one check appears on two provider surfaces. On Azure a status check is both a separate API surface and a branch-policy type, so statuses alone lose the requirement level, evaluations alone miss statuses that no policy watches, and showing both without a join shows one check twice in two different states.

It came up because repairing the checks contract still leaves the display having to pick a source, and because the research could not confirm that Azure publishes a key joining a status to the policy that watches it.

The options were:

1. Evaluations as the primary list, with unwatched statuses shown separately as informational.
2. Statuses only, with the requirement level left out.
3. Both, joined, once a key is established; until then, option 1.

The answer is option 3.

So the checks view leads with policy evaluations, which is the list that agrees with what Azure will actually enforce, and shows any status no policy watches in a separate informational group that is never presented as a gate. One check never appears twice. The joined single list is the stated end state, and it is reached only when a documented key between a status and the policy watching it is established and recorded as evidence; until then the two-group form is the shipped form, and the absence of the key is stated rather than worked around.

Undecided is better than decided wrongly. This keeps enforcement visible today and leaves the better view reachable, for the cost of a view that is honestly in two parts for as long as the provider gives no key.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 3 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-003` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Azure_DevOps_Integration.md, ContractName:Plans/Source_Control_System.md

### DL-062: One gate list, with a source column and an enforcement column

Decided on 2026-09-18 by Jared, answering the fourth of the seven Azure decision cards.

The question was where policies render. The Azure owner promises Policies/Checks, while the two consumer owners, Source Control and the final interface specification, name only current checks. Either the existing region carries rows that declare their source and their enforcement, or a new provider-neutral policies region is added and both consumer owners are amended.

It came up because without an answer the Azure promise has nowhere to render, and because the branch-policy read of DL-059 and the two-group view of DL-061 both need to know which region they are talking about.

The options were:

1. One gate list with a source and an enforcement column.
2. A new provider-neutral policies region amending both consumer owners.

The answer is option 1.

So current checks stays one region and becomes one gate list. Every row declares the provider surface it came from and whether it is required, advisory, not enforced or of unknown enforcement, and a person reading it can answer "what blocks this merge" in one place. No new section vocabulary is introduced, which is what Source Control's own rule against section proliferation asks for.

This buys one place to look, and enforcement stated rather than inferred, for the cost of two columns and their fixtures in two consumer owners.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 4 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-004` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Source_Control_System.md, ContractName:Plans/FinalGUISpec.md

### DL-063: The merge command gains a typed strategy field that is always shown

Decided on 2026-09-18 by Jared, answering the fifth of the seven Azure decision cards.

The question was whether the merge command should gain a typed merge-strategy field. It has none today, and the research found that on Azure omitting the strategy is not neutral: a completion request that names no strategy selects a no-fast-forward merge, which a repository policy may forbid.

It came up because omission reads as safety and is not. The provider makes a choice on the person's behalf, and the plans as frozen choose a strategy implicitly and cannot choose at all. The prose correction landed alongside this decision states that fact; the field is what makes the choice explicit.

The options were:

1. Add the typed strategy field, defaulting to the provider's default and always shown.
2. Leave the command as is, with the prose statement only.

The answer is option 1.

So the merge request carries one provider-neutral strategy field. It defaults to the provider's own default rather than to a Puppet Master preference, and it is always shown before the merge, including when it is the default, because a strategy that is only visible when changed is a strategy nobody reads. Where the effective policy permits only some strategies, the ones it forbids are not offered, and a strategy the policy forbids is refused before the request rather than reported after it.

This buys an explicit choice on the one action a person cannot undo cheaply, for the cost of a field on a closed command shape, a mapping per provider, fixtures and confirmation copy.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 5 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-005` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Forge_Integrations.md

### DL-064: A requeue command, disabled with a typed reason where the provider has no equivalent

Decided on 2026-09-18 by Jared, answering the sixth of the seven Azure decision cards.

The question was whether to add a command that re-runs a policy evaluation. Azure lets a person requeue one; Puppet Master has no command for it.

It came up because when a build policy fails for a transient reason the only recovery on Azure is to requeue, and without the command the person leaves the workbench to do it. The research also found the two facts that make the command delicate: any evaluation can be requeued but only build policies act on it, and requeueing a build policy cancels the build already running for that policy.

The options were:

1. Add a requeue command, disabled with a typed reason where the provider has no equivalent.
2. Do not add it; link out.

The answer is option 1.

So the command is planned, and it degrades truthfully rather than silently. Where the provider has no equivalent it is disabled with a typed reason and never hidden. Where the provider accepts a requeue that would do nothing, because the policy is not a build policy, it is refused with a typed reason rather than reported as success. Where it would cancel a build already running, the confirmation says so before dispatch, names the policy, and the cancellation is disclosed as an effect on a third object rather than discovered afterwards.

It follows DL-061 rather than preceding it, because the interface has to settle what an evaluation is before a control can re-run one.

This buys recovery without leaving the workbench, for the cost of a new command with permissions, a receipt, fixtures and an honest degradation on every provider that has no equivalent.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 6 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-006` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Azure_DevOps_Integration.md

### DL-065: A provider-neutral vote and reviewer carrier, bound the way DL-060 binds

Decided on 2026-09-18 by Jared, answering the last of the seven Azure decision cards.

The question was whether the review contracts should gain a vote, approval and reviewer carrier. The Azure owner had two acceptance criteria about votes and no shape anywhere in the forge contracts to hold one: none of the forty-six definitions matches a vote, an approval or a reviewer. The correction landed alongside this decision amends those two criteria to stop promising what no shape can bind; this decision is about whether the promise comes back.

It came up because every forge exposes votes or approvals, and the review view has no typed place for them on any provider, not only on Azure.

The options were:

1. Add the carrier, provider-neutral, with decision 2's binding.
2. Leave votes out of the review view.

The answer is option 1.

So a provider-neutral carrier is planned in the common forge contracts, holding the reviewer identity, the vote value in one closed vocabulary, whether the reviewer is required, and the revision the vote is bound to together with how that binding was established. The binding rule is DL-060's: a provider-asserted binding where the provider supplies one, and an observation-time binding labelled as observed by Puppet Master where it does not. A vote with no binding of either kind is not shown as current evidence.

The carrier is what lets the Azure owner's two criteria be restated as promises a shape can keep, rather than removed.

This buys reviewer state in the review view on every provider, for the cost of a new record family in the forge contracts with fixtures per provider and the rows to show it.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: decision card 7 in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`, SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29` as read on 2026-09-18; Jared's answer of 2026-09-18, verbatim "agree", recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`, SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18; question `q-007` in `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Azure_DevOps_Integration.md


### DL-066: A plan seal is accepted after one review and one bounded repair round

Decided on 2026-09-17 by Jared.

The question was when a sealed plan is finished. The audit loop, as canon described it, ran a review, repaired what the review found, ran another review, and repeated until nothing was left to find or a typed blocker stopped it. That has no end an operator can see from the inside, so the question was whether to put a bound on it, and what to do with whatever the bound leaves behind.

It came up because reviews were measured not converging. On one arm of the Jev pilot's two-arm trial, a second fresh reviewer raised new should-fix items after the first reviewer's findings had already been repaired. The repairs were real and the new items were also real; neither reviewer was wrong. The first reviewed seal on the new harness found four defects, of which one had been introduced by the work under review and three had been in the document before it started. A loop that ends when a reviewer stops finding things therefore ends when the reviewers run out, not when the plan is right. Two other things follow from the same measurement: a fresh reviewer spends most of its effort on material the review was not about, and the work a repair round does is the part that is actually attributable to the change under review.

The options were:

1. Accept a seal once the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review's blocking findings with a further seal, and a re-review limited to the rows the repair affected finds no blocking finding; record whatever remains as open questions on the plan.
2. Keep repairing and re-reviewing until a review returns no findings at all.
3. Accept a seal as soon as the deterministic checks pass, and treat every review as advisory.

The answer is option 1. A seal is accepted when four things have happened, in order, and not before.

The deterministic checks pass. These are the checks that give the same answer every time they run on the same bytes, so a failure among them is never a matter of judgment and there is nothing to negotiate about it.

One scoped review runs. Scoped means it reads the rows the work under review actually touched, with the surrounding canon it needs in order to judge them, rather than the whole document. One review, not a panel and not a series.

One bounded repair round addresses that review's blocking findings, and the repaired plan is sealed again. Bounded means one round: the repair works from the findings that review produced, and a finding that arrives later belongs to a later review rather than to this round. The further seal is what proves the repaired text still passes the deterministic checks.

A re-review limited to the affected rows finds no blocking finding. Affected rows means the rows the repair changed and the rows it was supposed to change. This step exists to catch a repair that did not repair, or that broke something next to what it fixed. It is not a fresh reading of the plan and it is not an opportunity to open a new subject.

What the bound leaves behind is recorded rather than discarded. Every finding still standing at that point is written onto the plan as an open question, carrying its severity and the citations the reviewer gave it. An open question does not block acceptance. It stays visible, anyone may pick it up, and if a later review reads the same material and calls it blocking, it blocks from that point and the plan goes round again. Nothing is closed by being ignored.

Two things this does not permit. A seal is not accepted on a review whose blocking findings were never repaired and re-reviewed, so the bound cannot be used to skip the round. And a finding that remains is not left off the plan, so the bound cannot be used to make a problem disappear by declining to write it down.

What this buys is a seal that ends. An operator can tell from the outside whether a plan is accepted, and the cost of accepting one stops depending on how many reviewers are available. What it costs is that a plan can be accepted while known non-blocking findings are still open against it, so the open-question list has to be real, has to be read, and has to be able to escalate.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D3_ACCEPTANCE_AND_LANDING_BASELINE_BRIEF.md`, SHA-256 `efd043f2a5a21f68841c8cd0813cef407cd587a5f0fb9958d19cc4bd135cf274` as read on 2026-09-17; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/F_R7A_SCOPED_REVIEW_REPORT.md`; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/N2_REVIEW_CALIBRATION_REPORT.md`; Jared, direction of 2026-09-17. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_Document_System.md

### DL-067: The landing checks report only the failures that are new since a recorded baseline

Decided on 2026-09-17 by Jared.

The question was what the three repository-wide checks at landing should tell the person landing a branch. They could report everything they find, which is what they did, or they could compare what they find against a recorded picture of the last full run and report only the difference.

It came up because two landings on 2026-09-17 each spent a quarter of an hour reading the same failures. The first ran the three checks in fourteen minutes and twelve seconds; the second, three hours later, took fifteen minutes and sixteen seconds. Between them the two runs produced identical failure sets: twenty-five failing sub-checks and two hundred and twenty-eight individual failures, not one of which had appeared, changed or gone away in between, and none of which had anything to do with either branch. The Jev pilot's landings saw the same thing. A check whose output is the same before and after a change tells the person making the change nothing, and reading it costs the same whether it is useful or not.

The options were:

1. Compare each run's failure set against a recorded baseline from the last full run, report only what is new since it, and refresh the baseline nightly.
2. Keep printing everything and let the person landing sort it out.
3. Stop running the checks at landing and rely on the nightly run alone.

The answer is option 1, with the stop rule that follows from it: a landing stops only on something the branch is answerable for.

The checks themselves do not change. All three still run in full, they still read the whole repository, and nothing stops being checked and nothing is hidden. What changes is what is put in front of a reader. Every failure becomes a stable key made of the check, the sub-check, the kind of error, the path it names, and a short digest of what is left of the failure once the parts that move on their own are removed: timestamps, hash values, the absolute path of the checkout it ran in, and the measured actual and expected values. What survives is what makes one failure different from another, which span, which unit, which field, so a stale hash for one document keeps one key however often that document changes.

A landing run reports two sets and nothing else. The first is what is new: a failure whose key is not in the recorded baseline, or a check whose failure count has risen above the baseline's count. The second is what is on the branch: a failure that names a path the branch changed, whether or not it is new. Everything else is silent.

The count comparison is not decoration. The two aggregate checks print only the first fifty failures of a sub-check, or the first hundred, while reporting the true total, so everything above that cap is never keyed at all and the on-branch match runs over the sample rather than the whole set. A rise in a truncated sub-check is therefore reported and does stop the landing, because what was added cannot be matched against the branch's paths and nobody can say it was not the branch's.

The check runs after the fast-forward and the shard check and before main is pushed. That order is not a preference: the branch is measured by what its diff against main names, and once main is pushed that list is empty and the check would be comparing the branch against itself.

Outcomes are graded. Nothing to report is one outcome. Nothing that stops the landing is another: governance staleness on files the branch edited, or failures that are new but name none of the branch's files, both of which are pushed and reported. Something that stops the landing is the third: a failure on the branch's own files that is not staleness, a grown bucket whose error kind is not staleness, or a rise in a truncated sub-check. Being unable to run at all is the fourth, and is not success.

The baseline is a full run against main, recorded in a full checkout and committed with the commit it was taken at. It is refreshed on a nightly run beside the migration snapshot, by the designated Plans agent in a worktree, whether or not anything landed. Nothing on this machine schedules that today, so it is a scheduled task that does the snapshot and the refresh together and commits both. A baseline is never refreshed to make a landing pass; doing that excuses exactly the failure it was meant to show.

Two carve-outs stay exactly as they were. Stale governance hashes for the documents a branch itself edited remain the expected consequence of editing canon before the designated Plans agent's next reseal, so they never stop a landing, and they are still reported with a reseal request. And nobody repairs another thread's files to make a check pass.

What this buys is a landing that reads its checks in seconds instead of a quarter of an hour, and a signal that means something when it appears. What it costs is a baseline that has to be kept current, a nightly run that has to actually run, and the risk that a failure sitting inside the baseline stays unexamined until somebody reads the nightly report on purpose.

The command, the baseline file and the landing procedure text are carried by the branch that implements this decision, which owns `scripts/pm-landing-check.py`, its baseline at `reports/landing-checks/baseline.json`, its runbook, and the landing-procedure wording in `AGENTS.md` and `.claude/CLAUDE.md`. This record states the rule; that branch states how it is run.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D3_ACCEPTANCE_AND_LANDING_BASELINE_BRIEF.md`, SHA-256 `efd043f2a5a21f68841c8cd0813cef407cd587a5f0fb9958d19cc4bd135cf274` as read on 2026-09-17; the two landing runs of 2026-09-17 at `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/landing-gates-20260917/` (run-gates.json SHA-256 `fec3ff2a4b515902772f1d76d2eaaeb5cfb202135151b456af31e445f5155ac4`) and `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/landing-gates-20260917-n4/` (run-gates.json SHA-256 `079c484c63bfcc99e421458b6c06bd2eb811d326078a197931516cad3fcd588b`); Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md


### DL-068: After quarantine cleanup, keep only the existing audit trail

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve**, which selects the recommended option A. Jared confirmed the answer again in the DL-039 takeover conversation the same day.

**Name:** What remains after eligible quarantine cleanup.

**Question:** After quarantined data becomes eligible for cleanup, should Puppet Master keep only the existing permanent audit event and receipt, with source evidence shown as unavailable, or also keep a new minimal content-free quarantine audit record permanently?

**Why:** The quarantine family retains its custody manifest and recovery receipts as a required recovery anchor, and its Q policies expire with `delete_sidecar`. No owner text said whether that includes the operational index, manifest and journal. The existing retention language was not enough permission to delete them.

**What you get:** A clear disposal boundary. Raw content goes once cleanup is allowed. The operational records stay until the actual purge, its event and its first receipt have settled and every real dependency is released. The existing permanent audit event and shared receipt keep providing lasting evidence of what happened.

**What it costs:** After cleanup, an audit can show the recorded purge event and receipt but reports "Source evidence unavailable" for the removed source. There is no separate quarantine-specific record of the disposition.

**Options:**

1. **A:** Keep the existing audit trail only (recommended).
2. **B:** Also keep a new minimal quarantine audit record indefinitely.

**Recommendation:** A.

**Answer:** Approve (A).

`Plans/storage-plan.md` Case L-3, "Invalid-value quarantine", now carries the disposal boundary. This grants no purge authority and changes no TTL, anchor, cap, overflow behavior, hold, eligibility rule or lifecycle edge. It creates no new record, event family, command or governance change.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md`, SHA-256 `0f668bb0194a0cc7637be949652ec1d8e3714780b37a8c3453f512085ecf0402`; card `reports/event-authority-20260911/step-08-quarantine-cleanup-card.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json

### DL-069: The SafePoint summary's 365 days start when it is first saved

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve**, which selects option 1 on `EA-S8-SAFEPOINT-SUMMARY-CLOCK-001`. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** When the 365-day SafePoint summary window starts.

**Question:** Should the small hash summary left after eligible SafePoint cleanup be kept for 365 days after it is first durably saved, or should its clock start when the SafePoint's last hold was released?

**Why:** Storage specified 90 days after the last hold release for a full SafePoint and 365 days for its retained hash summary, but it did not name the summary's clock anchor. DL-045 leaves retention choices to Jared.

**What you get:** The summary gets a full 365 days from the moment it exists. Retries and recovery never restart the clock, and holds still block cleanup.

**What it costs:** When cleanup is delayed, the small summary is kept longer.

**Options:**

1. First durable summary publication (recommended).
2. Last hold release.
3. Another rule.

**Recommendation:** Option 1.

**Answer:** Approve (option 1).

The Case L-3 retention table and anchor rule in `Plans/storage-plan.md` now carry the anchor. The 90-day full-SafePoint minimum, event membership, policy objects and hold rules are unchanged. No event or physical family is admitted.

SourceRef: the answers file above; card `reports/event-authority-20260911/step-08-safe-point-summary-clock-card.md`.

ContractRef: ContractName:Plans/storage-plan.md

### DL-070: Moving the last terminal workgroup leaves the old section empty

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve**, which selects option 1 on `EA-S8-TERMINAL-MOVE-SOURCE-001`. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** The terminal section left behind by a move.

**Question:** After moving the last workgroup to a new section, should the old section stay empty, receive an empty replacement workgroup, or open a new terminal session?

**Why:** Section 15 said the old section remains empty and reusable. A 2026-08-13 FinalGUISpec amendment said the same move reseeds it with a fresh workgroup. A third rule says layout movement never creates workgroups, panes or sessions.

**What you get:** One consistent result. The moved workgroup keeps its panes, sessions, transcript and process ownership, and the old section shows its reusable empty state.

**What it costs:** Adding another terminal to the old section is a separate action.

**Options:**

1. Leave the old section empty (recommended).
2. Create an empty replacement workgroup.
3. Open a replacement terminal.

**Recommendation:** Option 1.

**Answer:** Approve (option 1).

Owner edits:

- **Section 15 (SMPFS-138)** states that the move does not reseed.
- **FinalGUISpec** retires its move-reseed sentence with a dated amendment, so the move payload's `source_reseeded` is always false. On 2026-09-24 `source_reseeded` was retired by FinalGUISpec's DL-070 follow-up amendment, which landed on main (566970cb7b); a move payload no longer carries the field.
- **The GUI rebuild checklist and the plans index** note the retirement.

Reset and boot-recovery reconstitution are unchanged and gain no creation authority.

Open follow-ups, outside this card's scope:

- The command and wiring owners should decide whether to retire the `source_reseeded` field.
- The PM7 concept's move behavior still reseeds and should be aligned by its concept owner.

**Addendum, 2026-09-23: both follow-ups are carried out.** This records owner follow-through on the answer above. It is not a new decision.

- **`source_reseeded` is retired.** A search of the command and wiring owners found the field in none of them. `cmd.terminal.move_workgroup`'s typed arguments in `Plans/UI_Command_Catalog.md`, the production wiring rows `home.terminal_section.move_workgroup` and `home.terminal_section.new_section` in `Plans/Wiring_Matrix.production.json` and its schema, `Plans/Commands_System.md`, and the closed `Plans/event_payloads/terminal_workgroup_moved.schema.json` never carried it. Its only carrier was FinalGUISpec prose, which now retires it with a dated amendment, so a move payload carries no `source_reseeded`.
- **The PM7 concept's move no longer reseeds.** The Home workspace authored source that the PM7 pipeline's T48 transform reads (`Concepts/pm7-tools/home_workspace_source.py`) leaves the vacated section empty, allocates no workgroup or session, and emits no reseed field or receipt. The Home verifier's expectations follow DL-070. The checked-in `Concepts/PMConcept7.html` changes only at the pipeline's next authorized promotion.

No command argument, wiring row, event payload schema, event admission, reset or boot-recovery behavior changes.

SourceRef: the answers file above; card `reports/event-authority-20260911/step-08-terminal-move-source-card-20260921.md`.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-138, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

### DL-071: Account-switch history uses the existing switch record

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08C-ACCOUNT`. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** One name for account-switch history.

**Question:** Should current feature summaries use the existing `account_switch_event` record and stop requiring a separate `account.switched` event name?

**Why:** The feature list still named `account.switched`. Meanwhile Contracts and Multi-Account already define durable switch history through `account_switch_event`, and no passage made the two names interchangeable.

**What you get:** One owner-backed vocabulary for account-switch history.

**What it costs:** A small documentation correction. Normalizing historical bytes, if ever needed, requires its own evidence.

**Options:** Approve; Deny; Deny with changes; Ask a question.

**Recommendation:** Approve the summary correction.

**Answer:** Approve.

The feature list and Run Graph summaries now name `account_switch_event` and retire the separate name. No migration alias and no second history stream are created.

SourceRef: the answers file above; card `EA-S08C-ACCOUNT` in `reports/event-authority-20260911/step-08-ambiguous-cards.md`.

ContractRef: ContractName:Plans/feature-list.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

### DL-072: Continuation-suppression diagnostics stay transient

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08C-CONTINUE`. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** Keep retry-suppression diagnostics transient.

**Question:** Should `diag.synthetic_continue_loop_prevented` remain a transient diagnostic rather than become a separately persisted EventRecord family?

**Why:** Prompt Pipeline requires a reason-bearing emission when automatic continuation is suppressed, but it did not say whether that emission is durable.

**What you get:** An explicit rule that keeps the visible suppression reason and the existing failure and rotation handling, with no new durable stream.

**What it costs:** There is no separately replayable history of these suppressions. Adding one later needs a full event contract.

**Options:** Approve; Deny; Deny with changes; Ask a question.

**Recommendation:** Approve.

**Answer:** Approve.

Owner edit: `Plans/Prompt_Pipeline.md`, loop-prevention rules.

SourceRef: the answers file above; card `EA-S08C-CONTINUE` in `reports/event-authority-20260911/step-08-ambiguous-cards.md`.

ContractRef: ContractName:Plans/Prompt_Pipeline.md

### DL-073: Doctor media-check results stay in the check output

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08C-DOCTOR`. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** Keep media-check results in the check output.

**Question:** Should `doctor.evidence_media.checked` remain check output associated with its evidence artifacts rather than become a separately persisted EventRecord family?

**Why:** Newtools requires a PASS/FAIL result with remediation, but it did not establish a durable EventRecord binding or a transient-only rule.

**What you get:** An explicit boundary that keeps the result and its remediation in the existing evidence-check flow.

**What it costs:** There is no separately replayable history of these checks. Existing artifact retention is unchanged.

**Options:** Approve; Deny; Deny with changes; Ask a question.

**Recommendation:** Approve.

**Answer:** Approve.

Owner edit: `Plans/newtools.md`, Doctor evidence-media output step.

SourceRef: the answers file above; card `EA-S08C-DOCTOR` in `reports/event-authority-20260911/step-08-ambiguous-cards.md`.

ContractRef: ContractName:Plans/newtools.md

### DL-074: Task failure is a presentation notification over child-run history

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S09-EXEC-TASK-FAILURE`, which selects option A. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** Task failure history.

**Question:** Should `task.failed` be a presentation notification backed by canonical child-run history, or a separately persisted EventRecord family with its own replayable task-failure history?

**Why:** Assistant Chat requires a `task.failed` emission with error detail but gave it no persistence boundary. Chat cards project canonical child-run state. Contracts names `subagent.failed`, but no alias is specified.

**What you get:** The required failure signal stays, along with visible errors, the canonical child lifecycle, parent-owned retries, timeout distinctions and audit attribution.

**What it costs:** There is no independent `task.failed` replay stream.

**Options:**

1. **A:** Presentation notification over canonical child-run records (recommended).
2. **B:** An independent persisted `task.failed` family.
3. **C:** Another boundary.

**Recommendation:** A.

**Answer:** Approve (A).

Owner edit: the task and subagent lifecycle rule in `Plans/assistant-chat-design.md`. This is not an alias to `subagent.failed`, does not permit deleting history, and changes no registered family.

SourceRef: the answers file above; card `EA-S09-EXEC-TASK-FAILURE` in `reports/event-authority-20260911/step-09-execution-cards.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### DL-075: Runtime-artifact event histories are kept indefinitely

Answered on 2026-09-23 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION`, which selects option A. Jared confirmed it again in the DL-039 takeover conversation.

**Name:** Runtime-artifact event history.

**Question:** Should the 19 runtime-artifact event histories use indefinite retention once their full contracts are ready for admission?

**Why:** The Runtime Artifacts owner recommended `RP-AUTHORITY-INDEFINITE` but said explicitly that this was not an assignment. Storage's temporary preservation of unknown-policy records does not settle the choice.

**What you get:** Artifact identity, changes, provenance and event history stay available for authorized inspection and replay. Retaining an event grants no access to a linked body and no permission to repeat an action.

**What it costs:** A lasting commitment to keep the text embedded in these events, such as summaries, titles, plan steps and failure descriptions, with growing storage and backup needs. Deleting a linked body does not erase text copied into its event, so each full contract must reconcile any applicable deletion requirement before admission.

**Options:**

1. **A:** Indefinite for all 19 (recommended).
2. **B:** 365 days for explicitly classified non-authority records, with authority records kept indefinitely.
3. **C:** A different policy.

**Recommendation:** A.

**Answer:** Approve (A).

The 19 families:

- `runtime_artifact.api_web_call`
- `runtime_artifact.artifact_version`
- `runtime_artifact.before_after_snapshot`
- `runtime_artifact.browser_recording`
- `runtime_artifact.code_diff`
- `runtime_artifact.context_snapshot`
- `runtime_artifact.cost_usage`
- `runtime_artifact.document`
- `runtime_artifact.evidence`
- `runtime_artifact.failed_attempts`
- `runtime_artifact.hitl_approval`
- `runtime_artifact.implementation_plan`
- `runtime_artifact.reasoning_summary`
- `runtime_artifact.restore_point`
- `runtime_artifact.screenshot`
- `runtime_artifact.subagent_lineage`
- `runtime_artifact.suggested_next_steps`
- `runtime_artifact.tool_llm_trace`
- `runtime_artifact.validation_test`

Owner edits: `Plans/Runtime_Artifacts_Panel.md` and the Case L-3 retention text in `Plans/storage-plan.md`. This is retention only. It registers no family, defines no binding, authorizes no runtime, and does not make the schemas complete. Artifact bodies, original receipts, restore points, Usage records and source records keep their own policies.

SourceRef: the answers file above; card `reports/event-authority-20260911/step-09-runtime-artifact-retention-card.md`.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json

### DL-076: Storage owner decisions — the SP-310 wrapper digest recipe, and stored read tokens without the live snapshot id

Decided by Jared, by delegation to the coordinator, 2026-09-24. Jared approved the coordinator deciding these two Storage owner questions on his behalf. Both were left open by the 2026-09-23 Storage registry repairs and their blind review.

**Item 1**

**Name:** The wrapper digests in the Goal cancellation storage profile declaration.

**Question:** The declaration for the three Goal cancellation storage families gives every stored wrapper a SHA-256 digest (`whole_wrapper_sha256`), but no document said how it is computed. Should the recipe be stated and checked, or should the field be retired?

**Why:** Readiness could not check the six digests, because no plain hash of a wrapper reproduced them. The review therefore recorded the recipe as an open question.

**What you get:** The generator that wrote the declaration is still on file, pinned by its commit's own record, and its recipe reproduces all six values. The digest is the SHA-256 of the wrapper definition written as JSON with two-space indentation, keys in document order and one final newline. With the recipe stated, readiness binds each reviewed wrapper definition. A changed wrapper then needs a newly declared digest, even when its document hash is refreshed.

**What it costs:** Whoever changes one of the six wrapper definitions must recompute its digest. The recipe is a formatting convention, not a codec, so SP-310 writes it out exactly.

**Options:**

1. State the recipe beside SP-310 and have readiness check it (recommended).
2. Retire the field from the three families with a dated note.

**Recommendation:** Option 1.

**Answer:** Option 1.

**Item 2**

**Name:** The snapshot id inside stored read tokens.

**Question:** Four stored checkpoints (Browser workspace reset, seglog observability reader, Home layout reader and restore-point expiry) kept the whole ten-field Storage read token, including `redb_snapshot_id`. SP-311 says that id "is only a live transaction fence; never persist or manufacture it". Should the four checkpoints drop it, or should SP-311 gain an exception for checkpoint custody?

**Why:** The Browser reset passage called its stored copy "historical provenance, not a reopenable native snapshot or a restart credential", while SP-311 forbids storing the same field. Both readings cannot stand in one Storage plan.

**What you get:** One rule for every stored value. A stored read token is the nine-field durable token that the goal_run consumers already store as `DurableGenericToken`, and every read joins the snapshot id of its own live read transaction. Readiness rejects a snapshot id that any stored value could hold.

**What it costs:** The four checkpoint contracts, their registry rows and fixtures, the Home3 receipt copy of the Home checkpoint, and the Browser reset oracle and its tests change now. Nothing is implemented yet, so no stored data migrates. The frozen Home2 reader schema keeps its original copy.

**Options:**

1. The four checkpoints store the nine-field durable token, and SP-311's rule stays whole (recommended).
2. SP-311 gains an explicit exception that lets checkpoints keep the snapshot id as provenance.

**Recommendation:** Option 1.

**Answer:** Option 1. The Browser passage's "historical provenance" reading is overridden, for SP-311's reason: the snapshot id "is only a live transaction fence; never persist or manufacture it".

Owner edits: in `Plans/storage-plan.md`, SP-310 (the 2026-09-24 follow-up), SP-278 (the durable read token), dated amendments in SP-282, SP-270, SP-273 and SP-275, and section 2.3.1; the four rows of `Plans/storage_value_registry.json`; the Browser reset, seglog observability, Home layout event, Home3 receipt and restore-point expiry contracts and three contract fixture files; `scripts/pm-implementation-readiness.py`, `scripts/pm_browser_workspace_reset.py` and their tests. `Plans/event_record_index_checkpoint.schema.json`, `Plans/goal_workflow_cancel_contracts/physical-profiles.json` and SP-311's text are unchanged. No family, retention policy or stored identity is added, and no runtime is authorized.

SourceRef: `reports/storage-registry-repairs-20260923/REPORT.md` (open items); `/home/sittingmongoose/PM-Experiments/storage-registry-repairs-review-20260923/findings.jsonl`; `reports/storage-owner-closeout-20260924/REPORT.md`; the generator `build_proposal.py` of the physical source package pinned by `reports/event-authority-20260911/step-08-goal-workflow-coordinator-checks.json`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/goal_workflow_cancel_contracts/physical-profiles.json, ContractName:Plans/event_record_index_checkpoint.schema.json

### DL-077: The seal check accepts a family admitted after August only through a complete admission record

Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page: **Approve**, which selects option A on `EA-S10-VALIDATOR-LIVE-SET-001`, item 1.

**Name:** Letting the seal check accept families you approved after August.

**Question:** The frozen Event Authority seal check only accepts the 37 original families plus the two August ones, so should it be amended the way Step 3 amended it, to also accept a family Jared admitted later when that family has a complete admission record, or should the seal condition in DL-039 change instead?

**Why:** DL-039 made the seal conditional on the independent seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`, frozen 2026-08-12) passing without modification. That check requires the registered families beyond the original 37 to be exactly the two August families, and fails with `unexpected_august_set` otherwise. Since then `context.compaction.completed` was admitted in Step 6 under DL-039 and DL-040, and `browser.workspace.created` and `browser.workspace.reset` in their own Storage admission landings under DL-046, and every Step 9 registration adds another. Its record format also has no place for an admitted family that started among the 252 quarantined rows, so the compaction row still fails `individual_dispositions_evidence_gap_blocking`. No amount of contract work could make the unmodified check pass.

**What you get:** The seal check keeps every rule it has. It additionally accepts a family registered after August only when that family has an admission record: Jared's decision entry for that family, the registry revision and SHA-256 before and after, and a current depth assessment with all twelve criteria passing. A family without one still fails.

**What it costs:** A second change to a check that was frozen, done under the same guard as Step 3. The families already admitted need admission records in the new form. The amendment makes nothing pass by itself: the depth, denominator and other failures stay until the work closes them.

**Options:**

1. **A:** Amend the check with a receipted change like Step 3's, accepting post-August admissions only through complete admission records and failing closed otherwise (recommended).
2. **B:** Keep the check frozen and let the seal proceed when every failure it reports is on a list of explained and accepted failures.
3. **C:** Another rule.

**Recommendation:** A.

**Answer:** Approve (A).

This authorizes exactly one more receipted change to the independent seal check, the second after DL-039's holding-bucket change. The agent that writes and lands it must not be the one that applies the seal, and it lands with a written receipt after a blind review. The amendment keeps every existing rule. It accepts a family registered beyond the original 37 and the two August families only with a complete admission record as defined above, and fails closed for any family without one, with a malformed or mismatched record, or with a depth assessment that shows any criterion not passing. DL-039's "passes without modification" is read as passing with only the DL-039 holding-bucket change and this amendment. The twelve criteria are those of the Step 8 depth matrix. DL-039's prohibition of any other validator edit stands.

This decision registers no family, changes no registry row, restamps no freeze digest or closure hash, and certifies nothing. The three families already admitted after August need admission records in the new form, and the check fails closed for each until its record shows all twelve criteria passing.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_SEAL_CHECK.md`, SHA-256 `afdbdd4ebfef46e720ad31b28a7e27c0387ad377c32cfb834ed59bad5f091cdb`; card `reports/event-authority-20260911/step-10-validator-live-set-card-20260924.md`.

ContractRef: ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/event_family_registry.json

### DL-078: A Step 9 registration that passes the full procedure moves the approved checkpoint in its own landing

Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page: **Approve**, which selects option 2 on `EA-S10-VALIDATOR-LIVE-SET-001`, item 2.

**Name:** How each Step 9 registration updates the approved checkpoint.

**Question:** When Step 9 registers a family, should each new registry revision wait for Jared's own checkpoint approval, or should a registration that has passed the full Step 9 procedure move the approved checkpoint in the same landing?

**Why:** The seal compares the live registry with a checkpoint Jared approves, pinned in `scripts/pm_pnc019_currentness.py` as the registry revision and its family count (`2026-09-11.2`, 42 families). He approved the last two by hand, in Step 4 and in Step 8. Every registration changes the revision and the hash, and readiness then reports that the checkpoint needs fresh approval.

**What you get:** Each registration still needs everything Step 9 requires. The checkpoint bookkeeping moves in the same landing and is recorded in the Decision Log, and Jared can revoke the rule at any time.

**What it costs:** Jared sees each checkpoint change in the landing record afterwards rather than approving it beforehand.

**Options:**

1. One approval per registration.
2. A standing rule: a registration that passes the full Step 9 procedure moves the checkpoint in its own landing (recommended).
3. Batch approvals.

**Recommendation:** Option 2.

**Answer:** Approve (option 2).

The standing rule: a family registration that passes the full Step 9 procedure moves the approved PNC-019 checkpoint in the same landing. The procedure is the family's full Event Authority contract, a blind form-driven review, its own Storage admission landing with one family per landing, and the coordinator's landing go. In that landing, `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` in `scripts/pm_pnc019_currentness.py` and their provenance comment move to the new registry revision and family count. The two test pins in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py` move with them, and a Decision Log entry records the new revision under this rule. Following the Step 4 and Step 8 precedent, that landing also regenerates the checkpoint's readiness projections with the Step 4 commands, and the entry also records the registry SHA-256; these are procedure, not part of the answer. Clarified on 2026-09-24 by the coordinating thread (PM Low cost/complexity process), applying the reseal scope in `.claude/CLAUDE.md`, in answer to review question D-07: at a registration landing the Step 4 commands are the shard regeneration and `pm-plan-index.py generate`, which write only derived files. `pm-implementation-readiness.py generate` and the gate report it writes, `Plans/.implementation_readiness/buildability_gate_report.json`, are left to the reseal by the designated Plans agent, and the landing reports the gate report as stale in its reseal request. The Step 4 and Step 8 checkpoint landings that wrote it predate that reseal scope and stay as history, not precedent. The Decision Log entry each such landing adds names the family and is the decision entry its DL-077 admission record cites. Any other registry change still needs Jared's own checkpoint approval, and so does a registration that skips any part of the procedure. Revoking the rule returns to one approval per registration.

This rule registers nothing and lowers no Step 9 requirement. It changes no other readiness check, seal condition or validator.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_SEAL_CHECK.md`, SHA-256 `afdbdd4ebfef46e720ad31b28a7e27c0387ad377c32cfb834ed59bad5f091cdb`; card `reports/event-authority-20260911/step-10-validator-live-set-card-20260924.md`; Step 9 procedure record `reports/event-authority-20260911/step-09-procedure-20260924.md`.

ContractRef: ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/event_family_registry.json

### DL-079: The three old Goal record events become read-only history

Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08D-GOAL-RECORD-EVENTS-001`, which selects option 1.

**Name:** The old Goal events for evidence, receipts and tool checks.

**Question:** Should the three registered Goal events `goal.evidence_captured`, `goal.receipt_recorded` and `goal.tool_check_recorded` become read-only history, like the four Goal events retired on 2026-09-12, or should each be rewritten as a current event under the owner that now does that work?

**Why:** Goal V2 (the text-first Goal) moved evidence, tool checks and certification receipts out of the Goal and into the Workflow or run that does the work. These three events were registered before that change. Their payloads still assume the old Goal, their contracts cite superseded units, and no current rule says whether they are still written. Four sibling events (`goal.progressed`, `goal.replanned`, `goal.stopped` and `goal.verification_decided`) were already given read-only historical status; these three were not.

**What you get:** One consistent rule. Old records stay readable and nothing writes these events any more. The work they described stays recorded by its current owner: the Workflow's own evidence, the run's tool checks and the Standard certification receipt.

**What it costs:** There is no separate Goal-level stream of these three facts. Anyone who wants them reads the owning Workflow or run records.

**Options:**

1. **Read-only history for all three** (recommended): the pattern of the four already retired. Current writes are refused and a historical reader keeps old records readable.
2. **Rewrite all three as current events** under their current owners.
3. **Decide one by one.**

**Recommendation:** Option 1.

**Answer:** Approve (option 1).

Each of the three families gets its own current-writer prohibition and an assigned historical reader, following the four retired on 2026-09-12 (GRS-069 to GRS-072, with the readers SP-300 to SP-303), which kept their registry membership, original schemas and retention assignments. The Goal Runtime owner, with Storage, writes those contracts. This entry does not write them: until they land, the three families stay undispositioned in the Step 8 depth assessment and their grades stand. It changes no registry row and registers, admits or removes nothing.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`; card `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (Card 1a); application record `reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md`.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/event_family_registry.json

### DL-080: Workflow runs get current events when they are blocked, replanned or stopped

Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001`, which selects option 1.

**Name:** Run history events for blocked, replanned and stopped runs.

**Question:** Should Workflow runs publish a current event when they become blocked, are replanned or are stopped, as they already do when they start, are cancelled or are certified?

**Why:** The Workflow run lifecycle is live in current canon, and `goal_run.started`, `goal_run.cancelled` and `goal_run.certified` have full current event contracts; `goal_run.blocked`, `goal_run.replanned` and `goal_run.stopped` do not. Canon points both ways. The Pause and Abort Run commands and their production wiring expect `goal_run.stopped`, the rule for resuming a blocked or stopped run depends on `goal_run.replanned`, and a 2026-09-21 review found that the existing Workflow rules already carry Replan. But the Workflow writer list names no writer for these three, and the one run-history projection that must stay complete stops at their rows. So today nothing can write them, and the projection cannot pass one.

**What you get:** A complete run history, in which a person or an agent can see when and why a run was blocked, replanned or paused. The resume rule and the Pause and Abort wiring keep working as specified.

**What it costs:** Three new full contracts. The replanned one is large, because it depends on the Workflow Replan source work that is still unfinished (the external "Replan v8" package).

**Options:**

1. **Current events for all three** (recommended): stopped and blocked first, then replanned once the Replan source work is done.
2. **Read-only history for all three,** with the Pause and Abort wiring, the command catalog rows and the resume rule rewritten so that they no longer expect these events.
3. **Mixed,** for example a current `goal_run.stopped` with the other two read-only.

**Recommendation:** Option 1.

**Answer:** Approve (option 1).

The Workflow run lifecycle owner (Orchestrator and Executor, with Goal Runtime and Storage) writes a full current Event Authority contract for each of the three families: `goal_run.stopped` and `goal_run.blocked` first, and `goal_run.replanned` after the Workflow Replan source work. That source work, the external `pm.executor.workflow_source.all_writers.v8` package that the Step 8 grading found gates the replanned family, is therefore needed; this entry does not schedule it. Each contract names the family's writer, which the Workflow writer list lacks today, and extends the mandatory run-history projection (GRS-085) to its rows. This entry writes none of them: until they land, the three families stay undispositioned in the Step 8 depth assessment and their grades stand. It changes no registry row, command, wiring or resume rule, and registers, admits or removes nothing.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`; card `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (Card 1b); application record `reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md`.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md, ContractName:Plans/event_family_registry.json

### DL-081: A Workflow run may finish with an approved verification exception

Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08D-VERIFICATION-EXCEPTION-001`, which selects option 1.

**Name:** Completing a Workflow when a check is knowingly waived.

**Question:** When a Workflow's final verification finds a gap that a person has approved as an accepted risk, may the run still finish as "completed with an approved verification exception", and if so, who approves the exception?

**Why:** The Workflow rules have always had two truthful endings: "certified", and "certified with an approved exception", shown as "completed with approved verification exception". The 2026-09-12 certification contract (GRS-065) built only the first route. It keeps the exception meaning but states that "the exact original exception/waiver owner route remains separately unbound". Without a route, a run that cannot clear one check stays unfinished until someone cancels it.

**What you get:** A run can finish honestly when a known gap is accepted. The finish is labelled as an exception, with the approver and the remaining risks recorded, and is never shown as a clean pass.

**What it costs:** One more contract (the approval request, who may approve, which risks may be waived, and the receipt), and the risk that exceptions get approved too easily.

**Options:**

1. **Keep the exception route** (recommended): the user who owns the project approves each exception through the existing approval (human-in-the-loop) flow, naming the specific residual risks, and the finish is labelled "completed with approved verification exception".
2. **Remove the exception route:** a run either certifies cleanly or does not finish.
3. **Another rule,** for example exceptions allowed only for particular checks, or a different approver.

**Recommendation:** Option 1.

**Answer:** Approve (option 1).

The exception route stays. The user who owns the project approves each exception through the existing human-in-the-loop approval flow, naming the specific residual risks. The run then finishes with the truthful label "completed with approved verification exception" (`completed_with_approved_verification_exception`, the D-R18 branch `certified_with_approved_exception` that CV-340 preserves), with the approver and the remaining risks recorded, and is never shown as a clean pass. The Goal Runtime and Workflow certification owners, with the Human-in-the-loop owner, write the one route contract this needs: the approval request, who may approve, which risks may be waived, and the receipt. Until it lands, GRS-065's statement that the route "remains separately unbound" stands, the Standard writer stays limited to clean certification, and the Step 8 depth assessment keeps its grades. This entry changes no certification contract or registry row and registers or admits nothing.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`; card `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (Card 2); application record `reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md`.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md

### DL-082: Filling the platform capability catalog is deferred to build time

Jared gave **no answer** to `EA-S08D-PLATFORM-CATALOG-001` on 2026-09-24, in conversation with the coordinator, from the card page, and wrote his reason, quoted below. It is recorded as deferred to build time. It is not an approval of option 1, although the catalog stays empty either way.

**Name:** Whether any platform capability is checked at run start yet.

**Question:** The platform capability catalog is empty, so no capability is evaluated at run start and the registered `platform.capability_evaluated` event never occurs. Should the owner add entries now for the provider features that already shape subagent behavior, or keep the catalog empty until a specific feature needs a capability check?

**Why:** Canon specifies a run-start capability snapshot (for example Cursor skills, Claude plugins, Gemini extensions, Codex MCP and Copilot skills in the Platform Capability Manager). It also allows only owner-cited catalog entries and forbids placeholders, and the active catalog is empty: all production admission attempts refuse, and no Platform event is emitted. Whether the event ever fires depends on the catalog.

**What you get:**

- **Adding entries:** run-start snapshots that gate provider-specific features, recorded as replayable events.
- **Keeping it empty:** no new work. Nothing depends on the snapshot today.

**What it costs:**

- **Adding entries:** each needs owner-cited evidence (the live discovery, provider policy or static baseline source), an evaluation contract and tests, plus a decision about which features each entry gates.
- **Keeping it empty:** the registered event stays dormant, and features that could vary by provider have no recorded capability check.

**Options:**

1. **Keep the catalog empty until a feature needs a capability check** (recommended).
2. **Add entries now** for the provider features named in the Platform Capability Manager.
3. **Add specific entries.**

**Recommendation:** Option 1.

**Answer:** No answer. Jared's reason, verbatim:

> We will need to fill this in right before we build puppet master.  I dont want to do this now because their capabilities will change by the time we build it.  I supposed filling this in should be part of the building process, like one of the worknodes.(Though we havent gotten to the worknode work yet)

The catalog is filled in right before Puppet Master is built, as part of the building process, likely as one of the worknodes; worknode work has not started. Until then `platform.capability_evaluated` stays registered and dormant: the active catalog stays empty, production admission attempts refuse, and no Platform event is emitted. Filling the catalog is carried as a follow-up for whoever owns the worknode work. When entries are added, each still needs its owner-cited evidence, evaluation contract and tests. This entry adds no catalog entry and changes no registry row, contract or retention assignment.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`; card `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (Card 3); application record `reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md`.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/platform_capability_catalog.json, ContractName:Plans/event_family_registry.json

### DL-083: Application-wide Storage records count in one application-wide bucket under the operational record cap

Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page: **Approve** on `EA-S08D-OPERATIONAL-CARDINALITY-001`, which selects option 1.

**Name:** How the seven-year operational record cap counts events that belong to no project.

**Question:** The seven-year operational retention policy caps records at 2,000,000 per project. How should that cap count Storage events that belong to the whole application rather than to a project?

**Why:** Boot recovery, recovery-applied and compaction-lifecycle events are application-wide and carry no project. The policy they use, `RP-OPERATIONAL-2555D` (seven years, 2,000,000 records, per-project counting, fail-closed overflow), counts only per project. Storage's own text (the Boot aggregate custody text of SP-291) calls application-scoped counting under that policy "an unproved policy-owner adapter seam" and says that no invented project, new bucket, cap or policy value may resolve it. Retention choices are Jared's (DL-045).

**What you get:** The same guard for application events as for project events, with the same numbers.

**What it costs:** In the extremely unlikely case of more than 2,000,000 such events within seven years, new ones are refused (fail closed), exactly as for a project.

**Options:**

1. **Count them in one application-wide bucket with the same cap and overflow rule** (recommended).
2. **Apply no count cap to application-wide records;** the seven-year limit still applies.
3. **Give them their own new policy.**

**Recommendation:** Option 1.

**Answer:** Approve (option 1).

Under `RP-OPERATIONAL-2555D`, the records of `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed` are counted in one application-wide bucket. It takes the place of the project bucket and has the same 2,000,000-record cap, the same fail-closed overflow and the same seven-year period. Project-scoped records keep their per-project counting, and no project behavior changes. This is the policy-owner decision the Storage adapter seam waits for. The Storage retention owner writes it into the SP-291 policy text and binds the bucket technically under DL-045; no new policy object is created and no other policy value changes. Until that owner edit lands, the three retention cells in the Step 8 depth assessment stay PARTIAL. The application-scoped evaluations of `platform.capability_evaluated` sit on the same seam, but the card Jared answered named only the three Storage families, so this answer does not cover them; that part stays open for Jared. This entry registers or admits nothing.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`; card `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (Card 4); application record `reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/event_family_registry.json

### DL-084: Subagent history is kept as long as its chat exists

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09B2-CHILDRUN-RETENTION-001`, which selects option 1.

**Name:** How long a subagent's history is kept.

**Question:** How long should the history of each subagent run (its start, progress, tool use, messages, warnings, retries and how it ended) be kept?

**Why:**

- Every subagent is a child run. Storage also keeps a task record of its settings and outcome, and a permanent record of which run started it, but its step-by-step history is recorded only as these events.
- Canon says this history lives "in thread history", and that finished subagents "remain in history".
- Storage already has two rules that fit. Run history is kept for one year after the run finishes. Chat content is kept as long as the chat exists. The second is also the rule you chose on 11 September for Goal text, which is kept with its chat.
- On 23 September you decided that a task-failure card in chat is only a notice that points at this child-run history, and that the decision does not allow deleting history. The lifetime chosen here decides how long those cards can still open their details.
- Retention is your choice. No earlier answer covers these events.

**What you get:**

- **As long as the chat exists:** an old chat still opens every subagent's full history, and failure cards always have their details. Deleting the chat removes this history too, within 24 hours unless it is on hold, like the chat's own messages.
- **One year after the run finishes:** the same lifetime as the parent run's own history, and storage that stays bounded.
- **Split:** how each subagent started, ended, retried and warned stays with the chat; the step-by-step activity (progress, tool calls, message previews) goes after one year.
- **Forever:** nothing is ever lost, even after the chat is deleted.

**What it costs:**

- **As long as the chat exists:** busy chats keep growing. Storage still has to say whether a very busy chat has no count limit, as for Goal text, or rolls into a linked continuation after 250,000 records, as chat messages do. Prompt previews, message previews and error text are kept as long as the chat. A subagent's history can outlive its parent run's history, which ends after one year.
- **One year after the run finishes:** in chats older than a year, subagent and failure cards still show, but their details are gone, and each card has to say so. Deleting a chat within the year does not remove this history unless each contract adds that rule.
- **Split:** two rules to build and explain. After a year an old chat shows how each subagent ended, but not what it did along the way.
- **Forever:** storage grows without end, and message and error text stays even after its chat is deleted, so each contract must say how deletion requests are handled.

The permanent record of which run started which subagent is already set to be kept forever by your 23 September answer on runtime artifacts, whichever option you choose.

**Options:**

1. **Keep it as long as the chat exists (recommended).** The same lifetime as Goal text and chat messages.
2. **Keep it for one year after the run finishes.** The same rule as the parent run's history.
3. **Split.** How each subagent started, ended, retried and warned stays with the chat. Its progress, tool calls, message previews and output-cut notices are kept one year after the run finishes.
4. **Keep it forever.**

**Recommendation:** Option 1. Canon shows this history in the chat's history, and it keeps failure cards and their details together for as long as the chat exists, using a lifetime you have already approved.

**Answer:** Approve (option 1).

The history of the 19 child-run families the card names is kept as long as its chat exists: the eight lifecycle families of CV-267 (`subagent.spawned`, `subagent.started`, `subagent.completed`, `subagent.failed`, `subagent.cancelled`, `subagent.timeout`, `subagent.paused`, `subagent.resumed`), the six activity and message families of CV-268 (`subagent.progress`, `subagent.tool_called`, `subagent.tool_completed`, `subagent.message_sent`, `subagent.message_received`, `subagent.output_truncated`) and the five retry, context, model, budget and escalation families of CV-269 (`subagent.retried`, `subagent.context_warning`, `subagent.model_switched`, `subagent.budget_warning`, `subagent.escalated`). This is the lifetime of Goal text (DL-047) and of chat messages: deleting the chat removes this history too, within 24 hours unless it is on hold, and the prompt previews, message previews and error text these events carry are kept as long as the chat. The policy object is `RP-GOAL-THREAD-LIFETIME`, subject to the Storage owner's reuse check under DL-045: that object has no count cap, while Storage's Chat content class caps a thread at 250,000 records and rolls into a linked successor, and no policy object exists for that class yet. The card named this open point, so whether a very busy chat has no count limit or rolls into a linked continuation is a Storage owner follow-up, not decided here; either way the lifetime is the one approved, and if Storage finds the Goal-named object cannot be reused, it materializes the Chat content class for these families with the same lifetime. The Storage retention owner writes the assignment into the Case L-3 retention text, as DL-075's line does for runtime artifacts; each family's full contract carries the structured `retention_policy_ref` and reconciles its chat-deletion behavior; CV-267 to CV-269 and the orchestrator's child-run section cite this entry. The permanent record of which run started a subagent (`runtime_artifact.subagent_lineage`) stays indefinite under DL-075, and the task-failure cards of DL-074 keep their details for as long as the chat exists. This is retention only: it registers, admits or removes nothing, defines no binding and changes no registry row, and the 19 families stay Step 9 technical work.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`; card `reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md` (Card 1); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md

### DL-085: Crew board messages leave the board after 24 hours and are kept with the coordination records

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09B2-BOARD-RETENTION-001`, which selects option 1.

**Name:** Whether messages on the agents' shared board are kept or deleted once they leave the board.

**Question:** After the crew board hides a message at 24 hours, should the stored message be kept with the run's other coordination records or deleted?

**Why:**

- The crew board is where agents working together leave each other messages: questions, blockers, handoffs. Crew, BrainStorm and the orchestrator's parallel work all use it.
- The orchestrator already says stale messages leave the board after 24 hours, while unresolved blockers stay visible until they are resolved. Its text says those messages are "archived or deleted", and never says which.
- Storage never edits stored history in place. A stored record goes away only when its retention period ends or an explicit deletion, such as deleting the project's data, removes it. So "deleted after 24 hours" needs its own short retention rule.
- Canon already places the board in the same coordination record as agent sign-in, status and file claims, which are kept 180 days after the run finishes. Whether a message is deleted when it leaves the board is your choice.

**What you get:**

- **Hidden after 24 hours, kept with the other coordination records:** one rule for all coordination records. For up to six months you can still see what the agents told each other and why.
- **Deleted after 24 hours:** the least stored message text.

**What it costs:**

- **Kept with the other coordination records:** after six months the board conversation behind a run is gone, even if the chat is still there. Message subjects and text are kept for that time. A project keeps at most 1,000,000 coordination records; past that the oldest are dropped first, so a very busy project can lose board messages before 180 days.
- **Deleted after 24 hours:** a new retention rule. The next day nobody can see what the agents said to each other. It also sits badly with the accepted rule that board messages are stored as part of shared crew state.

**Options:**

1. **Hide after 24 hours and keep it with the other coordination records, 180 days after the run finishes (recommended).**
2. **Delete after 24 hours.** Unresolved blockers stay until they are resolved.

**Recommendation:** Option 1. The board is part of the run's coordination record, so it should last as long as the rest of that record, and this uses a rule already in place.

**Answer:** Approve (option 1).

The crew board still hides a stale message after 24 hours, and unresolved blockers stay visible until they are resolved; leaving the board deletes nothing. The stored messages of `crew.board_message_posted`, `crew.board_message_read` and `crew.board_messages_archived` are kept with the run's other coordination records under `RP-COORDINATION-180D`: 180 days after the run finishes, with at most 1,000,000 coordination records per project and the oldest eligible dropped first past that. The orchestrator owner changes "archived or deleted" in the board lifecycle to "archived"; the Storage owner binds `RP-COORDINATION-180D` for the three board families in its coordination family and retention table; the Contracts board rows carry that retention reference. No policy object is created and no policy value changes. The board families' storage placement, identity joins and payload fields stay technical work under DL-045 and are not decided here. This entry registers, admits or removes nothing and changes no registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`; card `reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md` (Card 2); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Contracts_V0.md

### DL-086: Three orchestrator diagnostics are kept one year after the run finishes

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09B2-DIAGNOSTIC-RETENTION-001`, which selects option 1.

**Name:** How long three orchestrator diagnostic records are kept.

**Question:** How long should these three diagnostic records be kept: an interview phase closed early because it hit its question limit, a configuration check that failed when a run or work unit started, and agent output that could not be read?

**Why:**

- The orchestrator requires all three to be written to stored history. It says nothing about how long they stay.
- Each explains why part of a run ended the way it did. The unreadable-output record carries at least the first 500 characters of the agent's raw output; the same passage also says all raw output is kept, which the owner still has to reconcile.
- Storage has three rules that could apply. Run history is kept one year after the run finishes. Debug records are kept 30 days. Security diagnostics that are not approval or audit records, and migration and recovery history, are kept seven years; the platform capability check also uses that rule. None of these three records is a security diagnostic. Retention is your choice.

**What you get:**

- **One year:** the explanation lasts as long as the run it explains.
- **30 days:** the least stored raw output.
- **Seven years:** a long record for support and audits.
- **Split:** raw output goes quickly, and the two records that explain a run's outcome last as long as the run.

**What it costs:**

- **One year:** raw agent output from each unreadable reply, at least its first 500 characters, is kept for a year.
- **30 days:** after a month, an old run no longer shows why its interview phase closed or why its start was refused, although the run itself is still kept. Each project keeps at most 10,000 of these, a limit that may be shared with the project's other debug records, and the oldest are dropped first.
- **Seven years:** raw output is kept seven years. Past 2,000,000 per project, new records are refused.
- **Split:** two rules for one small group of records.

**Options:**

1. **One year after the run finishes (recommended).**
2. **30 days after the record is written.**
3. **Seven years.**
4. **Split.** Unreadable-output records for 30 days, the other two for one year after the run finishes.

**Recommendation:** Option 1. These records explain a run's outcome, so they should last as long as that run's history, using a rule already in place.

**Answer:** Approve (option 1).

`phase.force_completed`, `config.validation.failed` and `parser.error` are kept one year after the run finishes under `RP-RUNTIME-365D`, the rule of the run history they explain, with at most 1,000,000 records per run and 5,000,000 per project, rolling into a successor past that. The raw agent output that `parser.error` carries, at least its first 500 characters, is kept for that year. The Storage retention owner writes the assignment of the three families into its retention text, and each family's full contract carries the structured `retention_policy_ref`. Reconciling the orchestrator's "first 500 characters" with "All raw output is preserved" stays owner work, as the card said, and is not decided here. No policy object is created and no policy value changes. This entry registers, admits or removes nothing and changes no registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`; card `reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md` (Card 3); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/orchestrator-subagent-integration.md

### DL-087: The six older Crew events are retired in favor of the shared collaborative workflow events

Jared gave **no answer** to `EA-S09B2-CREW-HISTORY-001` on 2026-09-25, in the Event Authority program's host session, from the card page, and wrote "retire them but register the shared collaborative workflow events, so adding scope to this." He selected no option. His words are recorded as retiring the six older Crew events, which is the substance of the card's option 1. The scope he added, registering the shared collaborative workflow events, was defined by an addendum of three cards that he answered the same day, recorded as DL-090 to DL-092.

**Name:** The six older Crew events.

**Question:** Should the six older Crew events be retired, so that a Crew run is recorded only by the history shared by all collaborative workflows, or kept as a second Crew history, now or until the shared events are registered?

**Why:**

- Crew is one of four collaborative workflows, with BrainStorm, Review and Chat Room. The Collaborative Workflows document is the only owner of their shared run: its identity, its lifecycle, its participants and its transcript. It says anything specific to one kind attaches to that one run and "never create[s] a second run identity".
- The six older events (crew formed, member added, member removed, coordination, completed, disbanded) come from a Contracts table and give Crew its own separate identity. Nothing writes them today. The orchestrator does not describe them, and says a Crew's lifecycle follows the ordinary rules for child runs.
- A Crew's members are fixed when the run starts, so "member added" and "member removed" describe something Crew does not do. "Coordination" has fields but no defined meaning, and the shared transcript already records the messages.
- The six events are listed in accepted Contracts text, so retiring them is a Contracts edit.
- The three crew board events are not part of this question (Card 2).

**What you get:**

- **Retire:** one Crew history, as the collaborative workflow rules require, with no second lifecycle to keep in step. Each Crew member's own work is still recorded, because members are child runs (Card 1), and the board keeps their messages (Card 2).
- **Keep as a second history:** a registered Crew lifecycle history now, in this campaign.
- **Keep until the shared events are registered:** the same, but only for the interim.

**What it costs:**

- **Retire:** the shared collaborative workflow events are not registered yet, are outside this campaign, and may not be written until they are. Until a later registration, a Crew run has no registered record of its own start, finish or cancellation, only its members' histories and the board. Retiring also removes accepted Contracts text.
- **Keep as a second history:** two histories of the same run that must always agree, against the collaborative workflow rules. Six new full contracts for events nothing writes today, and the content of "coordination" and of membership changes would have to be defined from scratch.
- **Keep until the shared events are registered:** the full cost of keeping now, plus a later retirement and a reader for the old records.

**Options:**

1. **Retire all six (recommended).** A Crew run's lifecycle is recorded by the shared collaborative workflow events once they are registered.
2. **Keep all six as a second Crew history,** with a written boundary between the two histories. They are kept 180 days after the run finishes, like the other coordination records.
3. **Keep all six until the shared collaborative workflow events are registered, then make them read-only history.** Also kept 180 days after the run finishes.

**Recommendation:** Option 1. The collaborative workflow rules already say a Crew run has one identity and one lifecycle, and nothing writes these six events today. The gap until the shared events are registered is real, but members' histories and the board still record the work.

**Answer:** No answer. Jared's words, verbatim:

> retire them but register the shared collaborative workflow events, so adding scope to this.

The six crew lifecycle families `crew.formed`, `crew.member_added`, `crew.member_removed`, `crew.coordination`, `crew.completed` and `crew.disbanded` are retired. A Crew run is recorded only by the history that all collaborative workflows share, and Crew keeps no second lifecycle history. As the card's owner edits for option 1 say, the Contracts owner removes the six rows from the crew event table, narrows CV-270 to the three crew board families and retires CV-271 (accepted text), and the orchestrator owner adds a pointer from its Crew text to `Plans/Collaborative_Workflows.md`. The three crew board families are not part of this answer (DL-085). Until the shared events are registered, a Crew run has no registered record of its own start, finish or cancellation, only its members' child-run histories (DL-084) and the board (DL-085), as the card said. Nothing writes the six events, so no stored record is removed. In the Step 9 campaign the six rows are excluded as retired, keeping their legacy bucket and cohort pins, and no denominator removal is claimed. The added scope is recorded in its own entries: which events are registered (DL-090), a failure event (DL-091) and how long their history is kept (DL-092). This entry itself edits no Contracts or orchestrator text, registers or admits nothing, and changes no registered family or registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`; card `reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md` (Card 4); addendum `reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md`; application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/orchestrator-subagent-integration.md

### DL-088: The two subagent start-request event names are retired

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09B2-SPAWN-REQUEST-001`, which selects option 1.

**Name:** Recording a request to start a subagent separately from the subagent itself.

**Question:** Should Puppet Master record a request to start a subagent separately from the subagent being created, or retire the two request names?

**Why:**

- Contracts keeps two names for a start request and its completion. Both names are in accepted Contracts text. The main rule uses them only "when a dispatcher distinguishes" a request from creating the child, and another passage calls them names a particular producer may use. No owner says Puppet Master's does. The two events have no defined content and nothing writes them.
- When a start has to wait, the child already exists, in the "queued" state, and chat shows it that way.
- Run Modes says "New crew spawn requests queue until a slot is free". Under current rules that wait shows as a queued child, not as a separate request record, so the sentence needs a clarifying line either way.
- A start refused for budget before any child exists already gets a reason in the orchestrator's outcome list.

**What you get:**

- **Retire:** one clear record of each subagent from the moment it exists, with no parallel request history.
- **Register:** a separate history of when a start was asked for, how long it waited for a slot, and whether it was refused before a child existed.
- **Leave reserved:** no work now. The names stay available for a future design.

**What it costs:**

- **Retire:** accepted Contracts text in two places is removed, and Run Modes gains one clarifying sentence.
- **Register:** this adds a feature. Nothing writes these events and they have no content, so the orchestrator needs a new request step, two full contracts and tests. The records are kept as long as you choose for subagent history in Card 1.
- **Leave reserved:** accepted text keeps naming events that nothing writes, and the question comes back when someone needs them.

**Options:**

1. **Retire both names (recommended).** A waiting start is a queued child. A refused start keeps its existing outcome reason.
2. **Register both as a new feature,** kept as long as Card 1's answer.
3. **Leave the names reserved but unregistered.** A future design that needs them brings its own card.

**Recommendation:** Option 1. A queued child already records the wait, and nothing today needs a separate request history.

**Answer:** Approve (option 1).

`subagent.spawn_requested` and `subagent.spawn_completed` are retired: Puppet Master does not record a request to start a subagent separately from the subagent it creates. A start that has to wait is a child in the `queued` state, and a start refused for budget before any child exists keeps its existing outcome reason in the orchestrator. The Contracts owner removes the two names from the subagent payload text, the lineage envelope sentence and the accepted units CV-116 and CV-266, keeping the rule that `chat.subagent_*` names are legacy aliases; the Run Modes owner adds one clarifying sentence to the crew queue row that says new crew spawn requests queue until a slot is free. Nothing writes the two events and they have no defined content, so no stored record is removed. In the Step 9 campaign the two rows are excluded as retired, keeping their legacy bucket and cohort pins, and no denominator removal is claimed. This entry itself edits no Contracts or Run Modes text, registers or admits nothing, and changes no registered family or registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`; card `reports/event-authority-20260911/step-09-batch2-orchestrator-cards-20260925.md` (Card 5); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md

### DL-089: Application-wide platform capability checks count in an application-wide bucket of their own

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09-PLATFORM-CARDINALITY-001`, which selects option 1.

**Name:** How the seven-year record cap counts platform capability checks that belong to no project.

**Question:** How should the seven-year record cap count platform capability checks that belong to the whole application rather than to a project?

**Why:**

- A platform capability check records whether a provider feature is available. It can run for the whole application or for one project's run.
- These checks use the seven-year operational retention rule, which caps records at 2,000,000 per project and refuses new ones past the cap. It counts only per project, so checks that belong to no project have nothing to be counted in. Storage calls this an unproved gap and says no invented project, new bucket or new number may fill it.
- On 24 September you answered the same question for three application-wide Storage events: count them in one application-wide bucket, with the same cap, the same refusal past the cap and the same seven years. That card named only those three, so the platform checks were left open for you.
- You also deferred filling the platform capability catalog to build time, because provider capabilities will change before then. Until then the catalog is empty and no platform check is recorded, so nothing is counted today. This question is about the counting rule, which does not depend on which capabilities end up in the catalog.

**What you get:**

- **Their own application-wide bucket:** the rule and numbers you approved for the Storage events, settled now, so the build-time work only has to fill the catalog. Platform checks can never use up the room kept for recovery records.
- **The same bucket as the Storage events:** one count for every application-wide record under the seven-year rule.
- **Decide at build time:** you decide together with the catalog.
- **No count cap:** the simplest rule for these checks.

**What it costs:**

- **Their own application-wide bucket:** one more count for Storage to keep. If more than 2,000,000 application-wide checks pile up within seven years, new checks are refused, exactly as for a project. This is very unlikely.
- **The same bucket as the Storage events:** a flood of platform checks could use up the shared cap, and then Boot recovery and the other recovery records would be refused.
- **Decide at build time:** the gap stays open, the family's retention stays incomplete, and the build-time catalog work has to carry this question as well.
- **No count cap:** no count guard on these records. The seven-year limit still applies.

**Options:**

1. **Count them in an application-wide bucket of their own, with the same numbers (recommended).** The same 2,000,000 cap, the same refusal past the cap and the same seven years as the Storage events, counted apart from them. Checks for a project keep their per-project count.
2. **Count them in the same application-wide bucket as the three Storage events.**
3. **Decide at build time,** when the catalog is filled.
4. **No count cap for application-wide checks.** The seven-year limit still applies.

**Recommendation:** Option 1. It closes the last open part of that gap with the rule and numbers you already approved, keeps platform checks from crowding out recovery records, changes nothing for projects, and leaves only the catalog itself for build time.

**Answer:** Approve (option 1).

Under `RP-OPERATIONAL-2555D`, the application-scoped evaluations of `platform.capability_evaluated` are counted in an application-wide bucket of their own, apart from the DL-083 bucket of `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed`, with the same 2,000,000-record cap, the same fail-closed overflow and the same seven-year period, so platform checks cannot use up the room kept for recovery records. Project-scoped evaluations keep their per-project counting, and no project behavior changes. This answers the part of the SP-291 adapter seam that DL-083 left open for Jared. The Storage retention owner writes it into the SP-291 aggregate custody text as a second application-wide bucket, together with the DL-083 bucket, whose owner edit has not landed yet, and binds it technically under DL-045; no new policy object is created and no `RP-OPERATIONAL-2555D` value changes. Until that owner edit lands, the family's retention cell in the Step 8 depth assessment stays PARTIAL. The platform capability catalog stays empty until build time (DL-082), so no evaluation is recorded or counted today. This entry registers or admits nothing and changes no registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`; card `reports/event-authority-20260911/step-09-platform-cardinality-card-20260925.md`; application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/event_family_registry.json

### DL-090: All 17 collaborative workflow events are to be registered, one family per landing, with bounded technical bindings

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **option 2** on `EA-S09B2-COLLAB-EVENTS-001`, written in the note with no radio button selected.

**Name:** Which collaborative workflow events to register.

**Question:** Which collaborative workflow events should be registered?

**Why:**

- Crew, BrainStorm, Review and Chat Room are one shared runtime. Its document names 17 events. Eleven apply to every kind: a run created, started, paused, resumed, cancelled and completed; a participant started and completed; a message added; an artifact added; and a configuration changed.
- The other six belong to one kind only: three for BrainStorm (a proposal added, a vote added, a plan put together) and three for Review (a finding added, a finding decided, the review's result finalized).
- None of these events is registered. The document says none may be written until it is. None is among the 252 stored events this campaign works through.
- Your 11 September approval lets owners define missing technical parts, such as identity links, checkpoints, replay and recovery, only for the events it lists. These events are not on that list.
- Registering them also needs that same limited permission for their owners. Your answer did not mention it, so both options include it and say so. Without it, each missing technical part would come back to you as its own question.

**What you get:**

- **The 11 shared events:** every collaborative run of all four kinds has a recorded history of its lifecycle, its participants, its messages and its artifacts. A Crew run gets back a recorded start, finish and cancellation.
- **All 17:** the same, plus a recorded history of BrainStorm proposals, votes and plans and of Review findings and results.

**What it costs:**

- **The 11 shared events:** 11 full contracts, each added to the product on its own. That is about one and a half times the coordination work now under way, which is seven families.
- **All 17:** six more contracts, each added on its own. Proposals and findings carry their own text, so each of those contracts must also say how that text is protected and deleted.
- **Either way:** the owners get the same limited permission you gave on 11 September. They may define only technical parts of behavior canon already specifies, after a documented search. They may not decide features, retention or which owner wins a conflict. Those still come to you. Registering these events does not register the run, message, proposal and finding records they point to. Those still need their own schemas before anything can be stored.

**Options:**

1. **Register the 11 shared events, with that same limited permission (recommended).**
2. **Register all 17:** the 11 shared events and the six BrainStorm and Review events, with the same permission.

**Recommendation:** Option 1. It matches the events that every kind uses, which is what Card 4 meant by the shared events. If you meant every event the shared runtime names, choose option 2. The BrainStorm and Review events can otherwise follow when those features need their own recorded history.

**Answer:** Option 2. No radio button was selected; the note reads "option 2".

All 17 event names of `Plans/Collaborative_Workflows.md` section 13 are to be registered: the 11 events every kind uses and the three BrainStorm and three Review events, listed below. Each is registered through its own Storage admission landing, one family per landing, after it is prepared, as for the coordination families. This entry also grants the Collaborative Workflows, Contracts and Storage owners a separate bounded technical-binding permission for exactly these names, on DL-045's terms, as DL-046 did for the Browser families. The card put this permission in both options and said so, because Jared's Card 4 words did not mention it. DL-045's 285-family scope is unchanged, and the names below are disjoint from it and from DL-046's 53 Browser names.

The owners may define missing technical consumer, projector and checkpoint bindings for behavior that canon already specifies, only after a documented **per-family** search of current canonical sources, citations to relevant existing partial contracts, and scoped negative evidence for each missing definition. Existing definitions come first: reuse requires the owner-defined role, version and scope, not a sibling name, descriptive role or schema version. New definitions are labelled newly authored owner contracts. The permission covers identity and scope joins, versioned checkpoint values and cursors, atomic projection and advancement, replay, currentness, recovery and withdrawal for existing behavior. It does not choose features, user-visible integrations, retention or deletion policy, or which owner wins a conflict; those still go to Jared. Every family still needs its complete owner-backed Event Authority contract, exact schema references, positive and negative semantic checks, a blind form-driven review and its **own Storage admission landing** under DL-078. Proposals and findings carry their own text, so the contracts of the events that carry it also say how that text is protected and deleted. Preparing contracts together is not admission: a prepared family stays absent from the central event registry, and section 13's rule still holds for it: emission stays disabled until its registration closes.

These 17 families are outside the 252 J248 rows. They are new campaign scope, worked as their own batch, and they do not change the J248 count. This entry registers nothing by itself. Registering these events does not register the records they point to: the run, message, proposal and finding records (`pm.collaboration.run.v1`, `pm.collaboration.message.v1`, `pm.brainstorm.proposal.v1` and `pm.review.finding.v1`) still need their own contracts schema and fixture pair before anything can be stored (section 12). The Collaborative Workflows owner makes section 13 cite this entry. This decision defines no binding identifier, admits no event, changes no registry row or runtime capability, and grants no bulk admission, native proof, Spec Lock update, readiness clearance or seal.

#### Exact collaborative workflow scope

The source is `Plans/Collaborative_Workflows.md` section 13 at `1e5d9b097b`, which names these 17 events. The answered card is `reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md` (Card 4a), SHA-256 `295f17d7ac6423d9f19dc5d82c001c03385db0fb3e45f2ee605cd405337ba30a`, a byte-identical copy of the presented file (artifact `QaLQRPQHwhsqQnNeRQ6g1z`, version 1). Later file edits do not enlarge the approved name set.

- `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`
- `collaboration.participant_started`, `collaboration.participant_completed`
- `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed`
- `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`
- `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized`

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_CARD4_ADDENDUM.md`, SHA-256 `b09b2afdaed355e1170ef0a96db1d468fa00a35ef185cb8fddeed16b1bbea8c8`; card `reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md` (Card 4a); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Log.md#DL-045

### DL-091: A collaborative run that fails gets its own recorded event

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09B2-COLLAB-FAILED-001`, which selects option 1.

**Name:** Recording a collaborative run that fails.

**Question:** Should a collaborative run that ends in failure get its own recorded event, as runs that complete or are cancelled do?

**Why:**

- A collaborative run ends in one of three ways: completed, cancelled or failed. The shared events record the first two. No event records a failure.
- The older Crew "disbanded" event recorded a Crew that was dissolved, with a reason. Retiring it leaves a run that fails with no event of its own.
- Waiting and blocked are temporary states with no events either. The run record and the live view show them. This card does not add events for them.
- A participant that fails is recorded by its participant-completed event, whose contents say how it ended. Defining those contents is technical work. This card is only about the run as a whole.

**What you get:**

- **Add a failure event:** every ending is recorded the same way, with its reason, so nobody reading the history has to guess why a run stopped.
- **No failure event:** nothing new. A failed run shows as failed in its run record, but its history ends without a final event.

**What it costs:**

- **Add a failure event:** one more event name in the Collaborative Workflows document, and one more contract, added on its own.
- **No failure event:** anyone reading the history has to treat a run that stops without an ending event as failed or unknown.

**Options:**

1. **Add a failure event and register it with the others (recommended).**
2. **No failure event.**

**Recommendation:** Option 1. A run's history should say how it ended, and failure is the ending most worth finding later.

**Answer:** Approve (option 1).

`Plans/Collaborative_Workflows.md` section 13 gains `collaboration.failed`, the recorded ending of a collaborative run that fails, with its reason, as `collaboration.completed` and `collaboration.cancelled` record the other two endings; `failed` is already one of the closed run states (section 2.1). `collaboration.failed` is registered with the others under the permission DL-090 grants, so that permission's exact list is 18 names: the 17 names of DL-090 and `collaboration.failed`. DL-090's text is not edited; this entry adds the eighteenth name. Its contract and its own Storage admission landing join DL-090's set, one family per landing, on the same terms. This entry adds no events for the waiting and blocked states, which the run record and the live view show, and a participant that fails is recorded by its `collaboration.participant_completed` event, whose contents are technical work; this entry is about the run as a whole. The Collaborative Workflows owner writes the name into section 13. Like the other 17, it is new campaign scope outside the 252 J248 rows. This entry itself edits no owner text, registers or admits nothing, and changes no registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_CARD4_ADDENDUM.md`, SHA-256 `b09b2afdaed355e1170ef0a96db1d468fa00a35ef185cb8fddeed16b1bbea8c8`; card `reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md` (Card 4b); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### DL-092: Collaborative workflow history is kept as long as its chat exists

Answered on 2026-09-25 by Jared, in the Event Authority program's host session, from the card page: **Approve** on `EA-S09B2-COLLAB-RETENTION-001`, which selects option 1.

**Name:** How long collaborative workflow history is kept.

**Question:** How long should the recorded history of each Crew, BrainStorm, Review and Chat Room run be kept?

**Why:**

- Every collaborative run belongs to a chat. Its definition carries the project and the chat. A message you send to it appears both in the chat and in the run's transcript.
- A participant may run as a child run. You chose to keep child-run history as long as the chat exists (Card 1).
- Retention is your choice. No earlier answer covers these events.
- This card covers the run's recorded events only. How long the run record itself, its transcript messages, proposals and findings are kept is not set yet, and this card does not set it.

**What you get:**

- **As long as the chat exists:** a run's history lasts exactly as long as its participants' history and its chat. Deleting the chat removes it too, within 24 hours unless it is on hold.
- **One year after the run finishes:** storage that stays bounded.
- **180 days after the run finishes:** the same lifetime as the agents' coordination records and board messages.

**What it costs:**

- **As long as the chat exists:** busy chats keep growing. Storage still has to say whether a very busy chat has no count limit, as for Goal text, or rolls into a linked continuation after 250,000 records, as chat messages do, the same open point as Card 1.
- **One year after the run finishes:** in chats older than a year, collaborative cards still show, but their history is gone, while their participants' histories are still there. Deleting a chat within the year does not remove this history unless each contract adds that rule.
- **180 days after the run finishes:** the same gaps, after six months. This rule keeps at most 1,000,000 records per project; past that the oldest are dropped first, so a very busy project can lose history before 180 days.

**Options:**

1. **Keep it as long as the chat exists (recommended).** The same lifetime as the participants' child-run history.
2. **Keep it for one year after the run finishes.**
3. **Keep it for 180 days after the run finishes.**

**Recommendation:** Option 1. A collaborative run and its participants' child-run histories should last equally long, and this uses the lifetime you chose in Card 1.

**Answer:** Approve (option 1).

The recorded events of every Crew, BrainStorm, Review and Chat Room run, the 18 families chosen in DL-090 and DL-091, are kept as long as the run's chat exists. This is the lifetime DL-084 gave child-run history, and the lifetime of Goal text (DL-047) and of chat messages: deleting the chat removes this history too, within 24 hours unless it is on hold. The policy object is `RP-GOAL-THREAD-LIFETIME`, subject to the same Storage owner reuse check under DL-045 as DL-084: that object has no count cap, while Storage's Chat content class caps a thread at 250,000 records and rolls into a linked successor, and no policy object exists for that class yet. Which count rule applies to a very busy chat is the Storage owner follow-up that DL-084 already carries, not decided here; either way the lifetime is the one approved, and if Storage finds the Goal-named object cannot be reused, it materializes the Chat content class for these families with the same lifetime. The Storage retention owner writes the assignment into the Case L-3 retention text, and each family's full contract carries the structured `retention_policy_ref` and reconciles its chat-deletion behavior. This covers the recorded events only: how long the run record itself, its transcript messages, proposals and findings are kept is not set here and stays open. This entry itself creates no policy object and changes no policy value; the only new policy object it allows is the Chat content class, if the Storage owner's reuse check materializes it with the same lifetime. This entry registers, admits or removes nothing and changes no registry row.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_CARD4_ADDENDUM.md`, SHA-256 `b09b2afdaed355e1170ef0a96db1d468fa00a35ef185cb8fddeed16b1bbea8c8`; card `reports/event-authority-20260911/step-09-batch2-card4-addendum-20260925.md` (Card 4c); application record `reports/event-authority-20260911/step-09-batch2-card-answer-application-20260925.json`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Collaborative_Workflows.md

### DL-093: The seven coordination registrations' own Decision Log entries are Jared's decision entries for those families

Answered on 2026-09-25 by Jared, in the Event Authority program's host session: **"4 i approve"**, to the host's question 4, which put review question D-02 of the Step 9 procedure record to him for the seven coordination admissions.

**Question:** Each coordination admission adds a Decision Log entry under DL-078, and the seal check's admission record cites it as Jared's decision entry for that family (review question D-02). Fine, or should Jared approve each of the seven himself?

**Answer:** Approve. Jared's words for this question, verbatim: "4 i approve".

The Decision Log entry that each registration landing of the seven coordination families (`coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_operation_updated`, `coordination.agent_file_ownership_updated`, `coordination.agent_unregistered`, `coordination.agent_crashed` and `coordination.agent_aborted`) adds under DL-078, which names the family, is Jared's decision entry for that family in the sense of DL-077, and the family's DL-077 admission record cites it as its `decision_ref`. Jared does not approve each of those seven admissions himself: each registration still passes the whole Step 9 procedure, and he sees each checkpoint change in its landing record, as DL-078 provides. The question named the seven coordination families, and this answer covers those seven. The host stated back to Jared a wider reading, that the landing entry of every Step 9 registration is Jared's decision entry for that family; no answer from Jared to that reading is recorded, so review question D-02 stays open for every other Step 9 registration. This answer changes neither DL-077's nor DL-078's text. DL-077's prose section is pinned under the V-07 rule (the post-August receipt pins it, and every admission record pins the receipt), so an edit to it would re-pin all three existing admission records. DL-078's text already says that the entry each such landing adds "is the decision entry its DL-077 admission record cites", and this answer confirms that reading for the seven coordination families. Every other requirement stands: a registration needs its full Event Authority contract, a blind form-driven review, its own Storage admission landing with one family per landing, the coordinator's landing go, and an admission record whose depth assessment shows all twelve criteria passing. This entry registers nothing, admits no family, and changes no registry row, validator, receipt or admission record.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_OPEN_QUESTIONS.md`, SHA-256 `678b9a32a0942fff08cea4127d9c52d7e73774509869c88958f466d6b8d0171a`; Step 9 procedure record `reports/event-authority-20260911/step-09-procedure-20260924.md` (open question 2, D-02); post-August admission receipt `reports/event-authority-20260911/step-10-post-august-admission-receipt.json`.

ContractRef: ContractName:Plans/Decision_Log.md#DL-077, ContractName:Plans/Decision_Log.md#DL-078, ContractName:Plans/event_family_registry.json

### DL-094: `coordination.agent_registered` is registered, and the approved checkpoint moves to registry revision 2026-09-25.1

Recorded on 2026-09-25 under DL-078's standing rule, for the Storage admission landing of `coordination.agent_registered` (branch `plans/ea-s09-coord-registered-20260925`). Under DL-093 this entry is Jared's decision entry for `coordination.agent_registered` in the sense of DL-077. Jared does not approve this admission himself; he sees the checkpoint change in the landing record, as DL-078 provides.

**What is registered.** The family `coordination.agent_registered` (`event-family-coordination-agent-registered`, revision 1.0.0) is appended to `Plans/event_family_registry.json` as its 43rd family. The row is the one prepared in `Plans/coordination_event_admission.json`, unchanged (canonical SHA-256 `1602bb6d33b63f79b7dc1daf4502c0aadbb26a4aa871a2963b2510a5d0353b40`). The registry moves from revision `2026-09-11.2` with 42 families (SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`) to revision `2026-09-25.1` with 43 families (SHA-256 `4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70`). The binding authority is DL-045: the owners wrote the family's missing technical bindings after the documented per-family search (`reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md`), and Storage registers one family per landing.

**The checkpoint.** In the same landing, `EVENT_FAMILY_REGISTRY_REVISION` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` in `scripts/pm_pnc019_currentness.py` and their provenance comment move to `2026-09-25.1` and 43, and the test pins in `tests/test_pm_testing_session_events.py` and `tests/test_pm_github_project_integration.py` move to 43. The derived plan index is regenerated. The implementation-readiness gate report is left to the designated Plans agent's reseal.

**The procedure.** The registration passes the whole Step 9 procedure that DL-078 names:

1. **The full Event Authority contract.** OSI-438, CV-353 with `Plans/coordination_event_payloads.schema.json`, SP-320 with `Plans/coordination_projection_contracts.schema.json`, ATS-058, the admission ledger and the contract fixtures are on `main` since `4a2135b940`. Their blind form-driven review, `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/`, found them landing-ready after its second cycle. Its four residuals, R4-01 (should fix) and the notes R4-02 to R4-04, are repaired on this landing's branch, as are the oracle gaps that the family's first independent grade found.
2. **This admission's own blind form-driven review.** The landing record names it and its verdict.
3. **Its own Storage admission landing**, one family per landing. That landing adds this entry.
4. **The coordinator's landing go**, given by the Event Authority program's host session.

**Depth and admission record.** The depth assessment is `reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json`, SHA-256 `54346d8b231b7080b487ed5a8e7332cc0d6202a8177309a10d772b796266509c`. It is an independent grade of this family at registry revision `2026-09-25.1`: all twelve criteria pass on current owner text, and native execution is not run. The DL-077 admission record is `reports/event-authority-20260911/admission-records/coordination.agent_registered.json`, and it cites this entry as its `decision_ref`.

This entry admits only `coordination.agent_registered`. The six other coordination families stay prepared and unregistered, each for its own landing, and SP-320 keeps this family contract-only, with nothing appended, until all seven are admitted. The entry changes no other checkpoint, validator or seal condition, and no other registry row.

SourceRef: depth assessment `reports/event-authority-20260911/step-09-depth-coordination.agent_registered.json`, SHA-256 `54346d8b231b7080b487ed5a8e7332cc0d6202a8177309a10d772b796266509c`; admission record `reports/event-authority-20260911/admission-records/coordination.agent_registered.json`; Step 9 procedure record `reports/event-authority-20260911/step-09-procedure-20260924.md`; preparation report `reports/event-authority-20260911/step-09-coordination-prep-20260925.md`; preparation review `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/RECHECK.md`.

ContractRef: ContractName:Plans/Decision_Log.md#DL-078, ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Decision_Log.md#DL-093, ContractName:Plans/event_family_registry.json, ContractName:Plans/coordination_event_admission.json

### DL-104: The chat transcript uses the Turn Stage layout, distinct item families and an accent budget

Answered on 2026-09-26 by Jared, in the Claude Code session that rebuilt the 5.6 Pro chat transcript.

**Question:** The transcript read as "a sea of blue/purple", and every kind of item (plans, agent delegation, scheduled messages, artifacts) looked the same, so it was easy to get lost. Should the rebuilt layout become the default, should each kind of item get its own look, and should the accent colour be kept for the few things that need attention?

**Answer:** Yes to all three. On the default: "Make it the default (Recommended)". On the items: "all the different types of items in the transcript all look the same" was named as a problem to fix. On the accent: "we can apply the rule now".

Each assistant turn opens with a small mark in a gutter, and a hairline spine runs through the turn's items to an end dot. Every transcript item renders as one of seven families chosen by its message type (prose, work, deliverable, needs you, people, time, ledger), each with its own silhouette. The accent is spent only on live work, on items that need the user, on the one primary action of a card, and on Send and Stop. The owner text is ACD-469 and F3-562; DR-043 names the single owners of the family map and the accent rule.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md`, SHA-256 `f907de7341f052cb8c2e0b870d614bc4490c11984194729bdcbafdcebab929b9`; concept lineage `Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### DL-105: The working card folds when the answer starts, and short narration folds into it

Answered on 2026-09-26 by Jared, in the same session.

**Question:** A live turn interleaves tool calls with short lines of narration and ends with an answer. Should the short lines fold into the working card instead of splitting the turn into a stack of cards, and should the card fold into its compact strip when the final answer starts streaming, instead of the last activity staying expanded?

**Answer:** "1. Without seeing what it would look like, folding short lines likely makes sense. 2. We can do your reccommendation." (the recommendation was to fold the card when the answer starts).

A live working card stays expanded while it runs. When the final answer starts streaming, the card folds into its strip and the answer rises into the room it gave up; this supersedes "the last activity stays expanded". A short narration line streams at the foot of the card and tucks into its head caption when the next subject starts; longer prose and the final answer stay transcript text. Carried by the plan Jared approved in the same session: several subjects may be live at once, a subject can fail or wait for the user, and long runs cluster (past 16 nodes into counted clusters, past 30 into an Earlier node). The owner text is ACD-473.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md`, SHA-256 `f907de7341f052cb8c2e0b870d614bc4490c11984194729bdcbafdcebab929b9`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### DL-106: Replies stream, Stop lives in the composer, and motion follows the theme family

Answered on 2026-09-26 by Jared, in the same session.

**Question:** Should replies stream in as a model writes them, where does Stop live, should the motion of sending and streaming change with the theme, and what happens to the concept's demo controls?

**Answer:** On Stop: "Stop would be at the bottom in the compose section right? Not in the working animation." On motion: "Be sure to improve/update/polish/redesign the streaming animations, and way text pops in/goes from compose to the transcript", and, asked whether animations should change with the theme given PMConcept7's themes, the per-family answer was approved with the plan. On demo controls: "they could be collapsed to a single button that shows the options for now and removed when ported over to PMConcept7."

Replies stream: a thinking placeholder, a paced word release, and a settle, ending complete, stopped (the partial text stays with a Stopped marker) or with an error. Stop is the composer's Send/Stop morph, never a control inside the working activity. Motion has one voice per theme family (Basic, Friendly, Glass, Retro; dark and light share it): path, easing and texture differ, never timing or order. The concept's demo controls, Demo Studio and its Motion voice picker are lab tools and never product. The owner text is ACD-470, ACD-474 and ACD-475.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md`, SHA-256 `f907de7341f052cb8c2e0b870d614bc4490c11984194729bdcbafdcebab929b9`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### DL-107: Chat sound is on by default, with a one-click mute

Answered on 2026-09-26 by Jared, in the same session: "Subtle, on by default".

**Question:** Should the chat play subtle sounds for its moments (sending, the answer arriving, approvals, completion, errors), and should they be on by default?

**Answer:** On by default, subtle, with a one-click mute.

`general.interaction.sound-effects` defaults to on; this supersedes its "Off by default" description. The speaker button in the chat header is a shared chrome control bound to that same key, as the onboarding and Tour sound controls already are, not a separate per-view setting. The chat's cues are events of the Notifications & Sounds owner, and sound is never the only signal. The owner text is SSYS-039, F3-564 and ACD-475.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md`, SHA-256 `f907de7341f052cb8c2e0b870d614bc4490c11984194729bdcbafdcebab929b9`.

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

### DL-108: Sends made while the assistant is busy queue by default, and Send now steers

Answered on 2026-09-27 by Jared, in the same session, choosing **"Keep both, default Queue"**.

**Question:** When you send a message while the assistant is still answering or working, what should happen? The plans made Steer the default (the message goes to the running turn at once) with a Steer/Queue switch in the composer; the concept only queued, and its Send now stopped the answer before sending.

**Options:**

1. **Keep the plans.** Steer stays the default and the switch stays; Send now steers without stopping.
2. **Queue only.** Remove Steer and the switch; Send now stops the answer, then sends.
3. **Keep both, default Queue.** Keep the switch, make Queue the default; Send now steers without stopping.

**Answer:** Option 3, "Keep both, default Queue".

`general.interaction.queue-behavior` defaults to Queue (it was Steer) and the Steer/Queue switch stays. Send now on a queued message steers without stopping the answer, as ACD-219 already says: the answer written so far stays, with no Stopped marker. Recorded with it, restating the existing section 4 rule that Stop does not clear the queue: the queue advances on its own only when a turn completes, and after a Stop or an error it waits for the user. The owner text is ACD-471, F3-563, SSYS-039 and UCC-168.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/chat-wow-20260926/jared-decisions-20260926-27.md`, SHA-256 `f907de7341f052cb8c2e0b870d614bc4490c11984194729bdcbafdcebab929b9`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Settings_System.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/UI_Command_Catalog.md

### DL-109: Wand module surfaces use the theme's own font, and nothing is cramped (J-1, J-2)

Given on 2026-09-27 by Jared, in the Claude Code session that redesigned the 5.6 Pro wand popups, as owner amendments J-1 and J-2 to the design specification.

**Question:** The redesign gave the wand popups and their chat cards a separate serif display face for read-backs and headlines, and several surfaces crowded text against lines and controls. Should the redesign keep that face, and how much room must text and controls keep?

**Answer:** J-1: "no new display face. Use the theme fonts PMConcept7 uses." J-2: "nothing cramped", with binding minimums.

Every wand-module surface (sheets, run cards, the dock, run views, receipts) uses its theme's own font with no separate display face and no italic voice face. The voice roles (read-backs, result and receipt headlines, pull-quotes, run-view headings) keep their jobs and differ only by size, weight and colour; a quote is marked by quotation marks and the muted colour. The spacing minimums are a floor in every theme: text at least 8 px from a line above or below it (6 px inside a 40 px lane, whose height grows instead) and 12 px from a side edge; control padding at least 10 by 7 px and sheet buttons at least 32 px tall; adjacent controls at least 10 px apart, stacked controls 12 px, a control 16 px from unrelated text; secondary lines 6 px below their row and 12 px above what follows; roster rows at least 52 px; line height at least 1.45 for body and helper text and 1.25 for headlines. When space runs short, text wraps or ellipsizes or a secondary element drops; padding never compresses. This decision does not change which font each theme's canon tokens name: whether canon adopts PMConcept7's fonts in place of its current theme typography is a separate open question. The owner text is FinalGUISpec F3-566.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de` (owner amendments J-1 and J-2 at the top); instruction record `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/LEAD-PLAN.md`, SHA-256 `d53f3f802bb9dd7736f1acf36256f8b9b799025bf6ab5212880dc03087649e72`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### DL-110: Back Seat Driver shows plain status words, and the Plans change to match (E-10)

Answered on 2026-09-27 by Jared on wand-modules decision card `n01` (register E-10), choosing **"Plain words only, and change the Plans to match"**, which is not the recommended option.

**Question:** Should Back Seat Driver show its official status words ("Caught up", "Finding held", "Quota paused") or the friendlier ones the new design wrote ("Up to date", "Double-checking", "Paused: usage limit reached")?

**Options:**

1. **A. Official word first, plain meaning after it** (recommended)
2. **B. Plain words only, and change the Plans to match**

**Answer:** Option B, "Plain words only, and change the Plans to match".

Back Seat Driver shows the plain status words the design wrote in place of the official ones: "Up to date" for "Caught up", "Double-checking" for "Finding held" and "Paused: usage limit reached" for "Quota paused" (the card pairs them in that order). The recommended interim form, the official word first with its plain meaning after it, is not used. The Plans' exact status words are amended to match when the waiting lines compile; because those words are preserved exact tokens, the compile supersedes them rather than deleting them. The register lines waiting on this card, B-BSD-01, B-BSD-08, B-FGS-06, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. The lead's notes asked for the order-wise pairing of the three plain words with the three official words to be confirmed before the waiting lines compile. No ruling on it is recorded: the waiting lines compiled the pairing in the card's order, as stated above (Back_Seat_Driver BSD-035, FinalGUISpec F3-571), and the confirmation is still open.

SourceRef: decision card `n01` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `a34dbbea35a474b9c6ec875872ce231919bc4536e1e5385cd75a49bbbd6df031` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n01` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/FinalGUISpec.md

### DL-111: The Coordinator's mark in a Crew card uses the text or seat colour, not the accent (E-17)

Answered on 2026-09-27 by Jared on wand-modules decision card `n02` (register E-17), choosing **"Text or seat colour"**, the recommended option.

**Question:** May the Coordinator's small mark in a running Crew card use the purple accent colour?

**Options:**

1. **A. Text or seat colour** (recommended)
2. **B. Allow the accent as a named exception**

**Answer:** Option A, "Text or seat colour".

The Coordinator's small mark in a running Crew card uses the text colour or its seat colour, never the accent. The transcript's accent budget keeps the accent for live work, anything that needs the user, the one main button and Send/Stop, so the accent keeps meaning "look here". No named exception to the accent budget is recorded. It settles the concept items A4-04 and A5-04, and the register line B-FGS-05 compiles the Coordinator colour into FinalGUISpec F3-569 together with DL-123; this entry changes no owner text itself.

SourceRef: decision card `n02` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `2a2ccf09263d6b0e9a113f0c6a4873674a5f1e1c1ccb2d396e242673daa93617` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n02` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### DL-112: A Chat Room message sent mid-round queues for the next round and can steer without interrupting (E-18)

Answered on 2026-09-27 by Jared on wand-modules decision card `n03` (register E-18), declining every option and giving his own instruction.

**Question:** When you type into a Chat Room while a round is still going, should your message wait until the round ends, or be refused?

**Options:**

1. **A. Hold it (build later); truthful wording now** (recommended)
2. **B. Always refuse mid-round messages**

**Answer:** None of the options. Jared's instruction, verbatim: "It should work like the normal chat, it queues the message for the next round, and the user has the option to send it immediately to steer but not interrupt."

Jared chose neither option. As he wrote it, a Chat Room works like the normal chat: a message typed while a round is still going is queued for the next round, and the user may instead send it immediately to steer the round without interrupting it. This matches the busy-send rule the chat already has (DL-108: Queue by default, Send now steers without stopping). Option A's interim wording ("Send it after this round ends", with the hold built later) and option B (refuse mid-round messages) are both not taken. The instruction does not say how a steer reaches a multi-helper round (which helper or the Coordinator receives it) or whether queueing is built now; those are left to the lead. The register lines waiting on this card, B-CW-10, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Lead ruling applied (2026-09-27):** this is the applied reading of Jared's instruction and settles the follow-up above. A message sent to a Chat Room while a round is running is queued for the next round. "Send now" delivers it into the current round as steering without interrupting it: the next speaker reads it first, and every later speaker in that round sees it. No speaker is stopped mid-turn. B-CW-10's mid-round sends compile to this reading. Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `n03` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `ed1dc00afb46793855739561734e2ae9dfcbffea32c6692d6fd040a08b281ef8` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n03` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md

### DL-113: Each theme family gets its own motion personality for popups and chat cards (E-22)

Answered on 2026-09-27 by Jared on wand-modules decision card `n04` (register E-22), choosing **"Each theme family gets its own motion personality"**, which is not the recommended option.

**Question:** Should popups and chat cards animate the same way in every theme, or should Retro move faster and skip the slight zoom when a popup opens?

**Options:**

1. **A. Same everywhere, except Retro faster with no zoom** (recommended)
2. **B. Identical in every theme**
3. **C. Each theme family gets its own motion personality**

**Answer:** Option C, "Each theme family gets its own motion personality".

Popups and chat cards do not animate the same way in every theme: each theme family gets its own motion personality. This is broader than the recommended option, which kept one motion everywhere except a faster Retro with no zoom on popup entry. The card does not define the personalities; the family-by-family motion rules (durations, easing, entry scale) still have to be written and shown to Jared. Reduce motion stays instant in every family (DL-115). The card covers only E-22's motion part; its colour, geometry, glass and spring-versus-no-overshoot parts are port questions and are not decided here. The register lines waiting on this card, B-CW-03, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Lead ruling applied (2026-09-27):** this is the applied reading and settles the follow-up above. Each theme family moves with its own personality, aligned with the transcript's motion voices (DL-106, ACD-475): Basic moves like ink, Friendly hops, Glass moves in depth and Retro types. Canon states the principle only. The per-family duration and easing values are the design foundation's tokens and are recorded at the concept's closing step, not in the owner documents. Reduce Motion stays instant in every family (DL-115). FinalGUISpec F3-566 carries the principle for the wand modules' sheets and in-chat cards. Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `n04` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `42542bf5fda9fcfa2709c5d8032e0b04a10cdf24417beef5e4be910422ef6e51` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n04` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md

### DL-114: Setup popups keep the blur only if Slint 1.18.1 can draw it, otherwise they are solid (E-24)

Answered on 2026-09-27 by Jared on wand-modules decision card `n05` (register E-24), declining every option and giving his own instruction.

**Question:** Should the setup popups be solid rather than frosted, blurred glass?

**Options:**

1. **A. Solid** (recommended)
2. **B. Keep the blur and raise the Plans' blur limit (production still can't draw it)**

**Answer:** None of the options. Jared's instruction, verbatim: "There is a much newer version of slint(1.18.1), check if that limitation still exists.  It was there because eventually we are porting to slint.  If that limit no longer exists in the newer versions of Slint(previously looked at 1.17.1) then use the extra blur.  If the limitation still exists, use solid."

Jared chose neither option as written and made the answer conditional. The solid-popup limit existed because the concept will eventually be ported to Slint, and it was based on Slint 1.17.1. If the limitation no longer exists in Slint 1.18.1, the setup popups use the extra blur; if it still exists, they are solid. When Jared answered, the check had not been recorded, so neither form was canon until it was; the check recorded below resolves it: solid popups and a flat scrim. The Plans' closed blur budget (F3-431) and the Glass theme's second blur are part of what the check must settle. The register lines waiting on this card, B-CW-01, B-FGS-17, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

**Check recorded (2026-09-27):** the lead applied Jared's rule. Slint 1.18.1 (released 2026-09-21) still has no backdrop or background blur: none is listed in the 1.18 release notes or the release list, the backdrop-filter request slint-ui/slint#13502 was closed as a duplicate of the open #612 (compositing and effects), and #2066 (blur what is underneath a Rectangle) is still open. The limitation therefore still exists, and the setup popups are solid over a flat scrim, as built; the Glass theme keeps its near-opaque glass-coloured panel, and F3-431's blur budget stays closed. Sources: https://slint.dev/blog/slint-1.18-released, https://github.com/slint-ui/slint/releases, https://github.com/slint-ui/slint/issues/13502, https://github.com/slint-ui/slint/issues/2066, as recorded in the `resolution` field of answer record `n05` (the ANSWERS.json cited below). Agent-relayed; not verifiable from inside this repository. FinalGUISpec F3-566 carries the result.

**Replaced on 2026-10-01 by DL-139:** the setup popups (the sheets of `Plans/FinalGUISpec.md#F3-566`) are frosted glass on the Skia GPU path, drawn by Puppet Master's own Skia renderer extensions (F3-582), and solid on the Skia CPU raster; the scrim stays a flat tint, and F3-431's blur budget admits this one sheet blur only.

SourceRef: decision card `n05` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `ae42601afbd6e76ed542336e1afd1390e2ecf54021bd4c6012740f8c9c3f6881` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n05` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md

### DL-115: Reduce Motion means instant (E-25)

Answered on 2026-09-27 by Jared on wand-modules decision card `n06` (register E-25), choosing **"Instant"**, the recommended option.

**Question:** When someone turns on Reduce Motion, should changes happen instantly, or with a short 0.12-second fade?

**Options:**

1. **A. Instant** (recommended)
2. **B. Short fades, and change the Plans**

**Answer:** Option A, "Instant".

When Reduce Motion is on, changes happen instantly, exactly as the Plans already say in four places. The design's short 0.12-second fade is not carried, and the Plans are not amended. B-FGS-19 is out of scope; the answer is recorded because B-CW-03's card motion depends on it (canon plan R-4). No group-B register line waits on this card; this entry changes no owner text itself.

SourceRef: decision card `n06` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `078f975c9cd48749089da4f3e729314c36f255ab5d9b7d2dfcb127df3b3c5acd` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n06` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/FinalGUISpec.md

### DL-116: Applied taught rules are reported as "Followed", and the Plans define what counts as following (E-36)

Answered on 2026-09-27 by Jared on wand-modules decision card `n07` (register E-36), choosing **""Followed", and define what counts as following"**, which is not the recommended option.

**Question:** When Puppet Master applies something you taught it, should the note say "Used 1 of your rules" or "Followed 1 of your rules"?

**Options:**

1. **A. "Used"** (recommended)
2. **B. "Followed", and define what counts as following**

**Answer:** Option B, ""Followed", and define what counts as following".

When Puppet Master applies something the user taught it, the note keeps the word "Followed" (for example "Followed 1 of your rules"), not the recommended "Used". Because the system can prove only that a rule was given to the model, not that the model obeyed it, the Plans must define what counts as following before the note can say it. The card does not supply that definition. The register lines waiting on this card, B-ACD-02, B-AMS-06, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Lead ruling applied (2026-09-27):** this is the applied reading and supplies the definition the answer asked for. A rule counts as followed when it was given to the assistant for that reply and the finished reply passed that rule's check, which compares the rule's testable statement with the reply. Inclusion in the prompt alone is never following. When a check fails, the note says "Missed 1 of your rules" and offers a way to see which rule was missed and to ask for a fix. When no check could run, the note shows no tick. Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `n07` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `35a3d7c2b009521d355e671ebc730d04a727609fa7a4f30f43620ca68f204486` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n07` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/assistant-memory-subsystem.md

### DL-117: Review's setup offers team presets (E-37)

Answered on 2026-09-27 by Jared on wand-modules decision card `n08` (register E-37), choosing **"Add presets (say which, e.g. "Security + Bugs + Tests")"**, which is not the recommended option.

**Question:** Should Review's setup offer "Start from a team" presets like Crew, Chat Room and BrainStorm do?

**Options:**

1. **A. Add presets (say which, e.g. "Security + Bugs + Tests")**
2. **B. Hide it on Review** (recommended)

**Answer:** Option A, "Add presets (say which, e.g. "Security + Bugs + Tests")".

Review's setup offers "Start from a team" presets, as Crew, Chat Room and BrainStorm do, instead of hiding the button. Jared did not name the presets; the card's "Security + Bugs + Tests" was an example, not his list. The register lines waiting on this card, B-CW-26, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Lead ruling applied (2026-09-27):** this is the applied reading and names the presets the answer asked for. Review ships three presets: "Careful review · Security, Bugs and Tests (3 reviewers)", the default; "Quick check · one reviewer"; and "Deep audit · 5 reviewers, one of them a Critical Advisor". Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `n08` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `9749a790494779f6a168e111a5de6b6ea14a340badf203df272bd45d6d65abf9` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n08` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md

### DL-118: The two recovery buttons use the Plans' words "Retry" and "Recover" (E-38, now)

Answered on 2026-09-27 by Jared on wand-modules decision card `n09` (register E-38 (now)), choosing **"Use "Retry" and "Recover""**, the recommended option.

**Question:** Should two buttons use the Plans' exact words "Retry" and "Recover" instead of the design's "Try again" and "Open recovery"?

**Options:**

1. **A. Use "Retry" and "Recover"** (recommended)
2. **B. Keep the friendly words and change the Plans**

**Answer:** Option A, "Use "Retry" and "Recover"".

The two buttons the design labelled "Try again" and "Open recovery" use the Plans' fixed command words "Retry" and "Recover". The Plans are not amended; this is a copy fix in the concept (A1-33, A1-34). Friendlier words for other official labels are the separate decision DL-134. No group-B register line waits on this card; this entry changes no owner text itself.

SourceRef: decision card `n09` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `ce75c3d6628b95bd1471bca3c19e17e5bdcab6964d5584f250858dcba3876675` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `n09` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/UI_Command_Catalog.md

### DL-119: Review and BrainStorm keep their Plans entry points, and the Plans gain "Crew Auto settings…" (E-01)

Answered on 2026-09-27 by Jared on wand-modules decision card `p01` (register E-01), choosing **"Plans unchanged, except add "Crew Auto settings…""**, the recommended option.

**Question:** Should the Plans allow Review and BrainStorm to have their own rows in the wand menu, and should "Manage Defaults…" be renamed "Crew Auto settings…"?

**Options:**

1. **A. Keep the wand rows and change the Plans to match**
2. **B. Plans unchanged, except add "Crew Auto settings…"** (recommended)

**Answer:** Option B, "Plans unchanged, except add "Crew Auto settings…"".

The Plans stay as they are: Review starts from the Mode menu and BrainStorm from Deep Plan, not from rows in the wand. The one change is that the Plans gain the "Crew Auto settings…" row; "Manage Defaults…" is not renamed. The concept keeps its own Review and BrainStorm wand rows until the chat moves into PMConcept7, where the Mode menu opens these popups; until then the concept and the Plans differ on where the two kinds start. The register lines waiting on this card, B-CW-08, B-CW-17, B-ACD-04, B-FGS-02, B-CMD-01, B-CMD-04, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p01` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `1881159755b0f34c45497e6858282a38632177f568f3052b43feb76e11349877` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p01` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

### DL-120: Crews are summonable by the agent, and Crew Auto is the project-wide default that lets it use them (E-02)

Answered on 2026-09-27 by Jared on wand-modules decision card `p02` (register E-02), declining every option and giving his own instruction.

**Question:** What should happen to the old per-chat Crew on/off switch?

**Options:**

1. **A. Retire it** (recommended)
2. **B. Make it "Allow Crews in this project", tied to the real setting**

**Answer:** None of the options. Jared's instruction, verbatim: "Crews should be summonable by the agent, its also an option to build plans with a crew.  So crews auto was meant as a way to tell the agent they can use them if they want/need them.  Turning it off in the project wide settings would stop it from being default on."

Jared chose neither option (retire the per-chat switch, or make it a project switch) and explained the intent instead. Crews are something the agent can summon, and building plans with a Crew is also an option. Crew Auto was meant as a way to tell the agent it may use Crews if it wants or needs them. Turning it off in the project-wide settings stops it from being on by default. Read together, Crew Auto is a permission for the agent defaulted by the project setting; the instruction does not say outright whether a per-chat control remains to override that default in one chat. The register lines waiting on this card, B-CW-18, B-ACD-04, B-FGS-02, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Lead ruling applied (2026-09-27):** this is the applied reading of Jared's instruction and settles the follow-up above. Crew Auto is the permission for the assistant to start a Crew by itself when it needs one. It is on by default at project level, and a chat's Crew Auto check overrides the project default for that chat. The assistant may start a Crew only when Crew Auto is on and the Crew Auto evaluator (Collaborative_Workflows CWR-021) admits the request; the evaluator remains the gate. "Build With Crew" on a Plan stays a user choice. The separate per-chat "Allow Crews in this chat" switch is retired into the Crew Auto check. The project default being on is a change to the Crew Auto settings key's default; Settings is outside this compile, so it is recorded as a Settings follow-up and not made here. Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `p02` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `90c3ec1b77af9a43ec346d73ee86b34ac777be6dc1503d3c047d00ad51654ed1` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p02` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### DL-121: Start is blocked until the user picks a replacement for an offline model (E-03)

Answered on 2026-09-27 by Jared on wand-modules decision card `p03` (register E-03), choosing **"Always block Start until you pick a replacement"**, which is not the recommended option.

**Question:** If an AI you picked is offline, may another model from the same provider stand in so Start can go ahead?

**Options:**

1. **A. Allowed, with the policy visible before Start** (recommended)
2. **B. Always block Start until you pick a replacement**

**Answer:** Option B, "Always block Start until you pick a replacement".

If a model the user chose is offline, no other model stands in automatically, not even one from the same provider: Start is blocked until the user picks a replacement. This settles the Plans' self-contradiction in favour of the blocking rule; the rule that allows an acceptable substitute does not apply to a chosen participant. The design's stand-in sentence and automatic start are not carried, and no substitution policy is added to the saved setup. The register lines waiting on this card, B-CW-02, B-CW-15, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p03` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `4744475ea2d7ce9b676885d994804b9dd3e04f54cecd95ab86759e0444c67814` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p03` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Models_System.md

### DL-122: Activity shows a short team list for the four collaboration kinds and Back Seat Driver (E-04)

Answered on 2026-09-27 by Jared on wand-modules decision card `p04` (register E-04), choosing **"Allow the short list for these"**, the recommended option.

**Question:** In the Activity panel, may Crew, Chat Room, BrainStorm and Review show a short team list instead of the full card-and-grid layout you asked to restore on September 8?

**Options:**

1. **A. Allow the short list for these** (recommended)
2. **B. Keep the rollback: full content in Activity too**

**Answer:** Option A, "Allow the short list for these".

In the Activity panel, Crew, Chat Room, BrainStorm and Review show a short, scannable team list, and Back Seat Driver's details use the same compact form; the full card-and-grid detail is one click away in the run view beside the chat. This is a scoped exception to Jared's 2026-09-08 rollback (APR-060, APR-061, ACD item 20) for these five only; every other Activity surface keeps the restored native cards and grids. **Amended on 2026-10-08 by DL-147:** the To-Do rows of Activity Detail are a second scoped exception: each row is a one-line checklist row like the To-Do hover preview, inside the native panel; Goal, Subagents, Changes and Artifacts keep the native presentation. The register lines waiting on this card, B-CW-05, B-BSD-04, B-ACD-05, B-FGS-12, B-FGS-13, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p04` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `f49e399e046820f880093035b40d36f999238aba08321d82e684d3127323e39c` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p04` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### DL-123: A collapsed or narrow run card may move its actions behind Expand and its helper count into a hover card (E-05)

Answered on 2026-09-27 by Jared on wand-modules decision card `p05` (register E-05), choosing **"Allow it"**, the recommended option.

**Question:** When a run card is collapsed or the chat is narrow, may Open Panel, Message and More move behind Expand, and the helper count move into a hover card?

**Options:**

1. **A. Allow it** (recommended)
2. **B. Keep every fact and button on every card**

**Answer:** Option A, "Allow it".

When a run card is collapsed or the chat is narrow, Open Panel, Message and More may move behind Expand, and the helper count may move into the hover card (below 520 px, per the register). A finished run's Message button says why it is disabled; on a result face or a receipt it sits in More as a disabled item with its reason printed, as the design spec's section 7.9 places it (FinalGUISpec F3-569). The Plans' list of facts and actions every card always shows is amended accordingly. The register lines waiting on this card, B-CW-03, B-FGS-05, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p05` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `7509e2c87521d28200471ef8620602a3b2bcc6d68548596571206eb063469928` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p05` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md

### DL-124: Screens say "helpers", and the data keeps "participant" (E-06)

Answered on 2026-09-27 by Jared on wand-modules decision card `p06` (register E-06), choosing **""Helpers" on screen"**, the recommended option.

**Question:** Should the screens say "helpers" (and "reviewers") instead of the Plans' word "participants"?

**Options:**

1. **A. "Helpers" on screen** (recommended)
2. **B. "Participants"**

**Answer:** Option A, ""Helpers" on screen".

On screen the product says "helpers" (and "reviewers" in Review) where the Plans said "participants"; the data model keeps `participant`. The Plans' examples and the composer label change to match. The register lines waiting on this card, B-CW-06, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p06` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `93c720d09aab9f7dad51dc586cb430d256b020ebb654ed9973783ab44c583a67` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p06` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md

### DL-125: "Send Findings To Agent" fills the message box instead of sending (E-07)

Answered on 2026-09-27 by Jared on wand-modules decision card `p07` (register E-07), choosing **"Fill the message box"**, the recommended option.

**Question:** Should "Send Findings To Agent" put a ready-made fix request in your message box instead of sending it straight away?

**Options:**

1. **A. Fill the message box** (recommended)
2. **B. Send it directly, as today**

**Answer:** Option A, "Fill the message box".

"Send Findings To Agent" puts a ready-made, editable fix request into the message box instead of sending it; nothing runs until the user presses Send. This changes an existing command: its result and refusal change and a lineage field is added (register E-07). The register lines waiting on this card, B-CW-12, B-CW-23, B-ACD-09, B-CMD-01, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p07` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `17c7be8ac6a736f115097c3f674b746bafabab83ccbe2ed68c9b511e6a967b1e` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p07` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

### DL-126: ELI5 has a project default that a chat can override, and switching it never rewrites a reply (E-11)

Answered on 2026-09-27 by Jared on wand-modules decision card `p08` (register E-11), asking a question back instead of choosing an option.

**Question:** Three parts. (1) Keep ELI5 as its own small popup, with the dot by the message box as the quick on/off, or go back to a one-click toggle? (2) Keep the "this project" level the Plans don't have? (3) Do the new helper lines under controls also need an "expert" and a "simple" version, or only tooltips and help?

**Options:**

1. **A. Popup + quick dot; drop the project level; tooltips and help only** (recommended)
2. **B. One-click toggle; drop the project level; tooltips and help only**
3. **C. Popup + quick dot; keep the project level; every helper line**

**Answer:** None of the options. Jared's reply, verbatim: "I originally intended eli5 to be project level, as a setting to default everywhere.  Then changing the toggle in chat would change it just for that chat. However, thinking more about it, wouldnt that require the agent to send two responses?  Or if its changed, resend an updated response?"

Jared did not choose an option; he answered with his original intent and a question. As he wrote it, ELI5 was meant to be project-level, a setting that defaults everywhere, with the toggle in a chat changing it just for that chat. He then asked whether that would require the agent to send two responses, or to resend an updated response when the toggle changes. No part of the card (popup or toggle, project level, which helper text gets two versions) is decided; the question has to be answered for him first. The register lines waiting on this card, B-CW-25, B-ACD-01, B-FGS-02, B-FGS-03, B-FGS-08, B-CMD-01, B-CMD-03, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Owner resolution (Jared, 2026-09-27, confirmed in chat):** the design lead answered Jared's question, and Jared confirmed that answer in chat on 2026-09-27. This settles the question and the follow-up above, and the waiting lines may now compile. ELI5 keeps a project-level default that applies everywhere in the project. The ELI5 control in a chat overrides that default for that chat only. Switching ELI5 changes only the replies written after the switch. It never re-sends, regenerates or rewrites an earlier reply, so a switch never produces a second response. Each finished assistant reply may offer "Explain this reply simply". That action writes one extra reply, a simpler explanation of that reply, and only when the user asks for it. Parts 1 and 3 of the card follow the recommendation: ELI5 is its own small popup (sheet), and the quick dot by the message box is the one-click on and off; the Expert and ELI5 dual copy exists only for tooltips and help, not for every helper line. Agent-relayed: Jared's confirmation in chat on 2026-09-27, recorded in the lead's answer file ANSWERS.json (answer record `p08`, `ask_resolved`), SHA-256 `33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5`, evidence copy `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`; not verifiable from inside this repository.

**Compile details (the design lead and the canon compile, 2026-09-27; not part of the recorded confirmation):** a chat's ELI5 state is resolved in this order: the chat's own override if it has one, otherwise the project default, otherwise the app default. "Explain this reply simply" is refused while that reply is still streaming. The guided tour, which teaches the old toggle, is re-pointed to the popup and the dot (the card's cost line, "The tour needs re-pointing to the new popup."). The commands are `cmd.chat.eli5.set`, which takes on, off or inherit (inherit deletes the chat's override, so the chat follows the project default), and the new `cmd.chat.eli5.explain_reply`, which targets one finished assistant reply by message id. The app default is the existing setting `general.interaction.eli5-default` and the per-chat override is the existing `general.interaction.chat-eli5`; the project level needs a project scope on the existing ELI5 default setting, which is a Settings follow-up, out of scope for the wand-modules compile.

SourceRef: decision card `p08` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `dab0b89fb497bbad7b64c1ec6b564036c1b2cfcf6b97344cd6184e034f557791` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p08` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Settings_System.md

### DL-127: /teach opens the Teach popup everywhere (E-12)

Answered on 2026-09-27 by Jared on wand-modules decision card `p09` (register E-12), choosing **"The popup everywhere"**, which is not the recommended option.

**Question:** Should typing /teach open the Teach popup (as built) or a small capture card in the chat (as the Plans say)?

**Options:**

1. **A. The popup everywhere**
2. **B. Popup from the wand; a capture card for /teach later** (recommended)

**Answer:** Option A, "The popup everywhere".

Typing /teach opens the Teach popup, filled in from what the user typed, and the wand opens the same popup. The Plans' small capture card in the chat is superseded and is not planned for later; there is one way in to maintain. The register lines waiting on this card, B-ACD-02, B-FGS-08, B-CMD-01, B-CMD-03, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p09` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `8f3bfd9fb3af9a80c561cb6f33b28eefcc025c2c3b96de6e8c3c463876b80a20` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p09` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

### DL-128: The Coordinator writes each Crew part's "done when" and "must finish first" (E-14)

Answered on 2026-09-27 by Jared on wand-modules decision card `p10` (register E-14), choosing **"The Coordinator writes them"**, the recommended option.

**Question:** Do you set each part's "what done looks like" and "what must finish first" in the setup popup, or does the Coordinator write them when it splits the job?

**Options:**

1. **A. The Coordinator writes them** (recommended)
2. **B. Add optional fields to the setup popup**

**Answer:** Option A, "The Coordinator writes them".

The setup popup does not ask for each part's "what done looks like" and "what must finish first". The Coordinator writes them when it splits the job, and the run view shows them, where the user can read and question them. The Plans' setup fields for them are superseded. The register lines waiting on this card, B-CW-07, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p10` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `854c294c134c8d615c244fcb46cf62a8d84a270f3400c4b7599d5d2c7eaef070` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p10` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md

### DL-129: The live-run line and per-reply files row replace the old summary above the message box (E-27)

Answered on 2026-09-27 by Jared on wand-modules decision card `p13` (register E-27), choosing **"Replace the old summary"**, the recommended option.

**Question:** The Plans put a small summary above the message box (a helpers count and "N file changes"). The redesign adds a live-run line there and a files row under each reply. Should the new ones replace the old summary?

**Options:**

1. **A. Replace the old summary** (recommended)
2. **B. Keep all three**

**Answer:** Option A, "Replace the old summary".

The Plans' footer summary above the message box (a helpers count and "N file changes") is superseded by the redesign's live-run line and the files row under each reply. The chat's total file count moves to Activity, one click further away. The register lines waiting on this card, B-ACD-10, B-ACD-11, B-FGS-03, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p13` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `95af64d7ea2ba0a09167fc885ea4abb45e8af31604fdd4261a13762d7aa68973` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p13` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

### DL-130: All seven new commands are added (E-32)

Answered on 2026-09-27 by Jared on wand-modules decision card `p15` (register E-32), choosing **"Add all seven"**, which is not the recommended option.

**Question:** Five new commands are needed: End discussion (Chat Room), Dismiss advice and Don't wait (Back Seat Driver), Turn off a rule and Lock a rule (Teach). Two more are optional: Export memory, and Wonderer's "Check it". Which should be added?

**Options:**

1. **A. Add the five; the two optional ones stay demo-only** (recommended)
2. **B. Add all seven**

**Answer:** Option B, "Add all seven".

All seven commands are registered: End discussion (Chat Room), Dismiss advice and Don't wait (Back Seat Driver), Turn off a rule and Lock a rule (Teach), and the two optional ones, Export memory and the Wonderer's "Check it". None of the seven stays demo-only; every button in these popups maps to a real command. The register lines waiting on this card, B-CW-10, B-CW-24, B-BSD-05, B-ACD-02, B-AMS-05, B-AMS-07, B-CMD-01, B-CMD-02, B-CMD-04, B-CMD-05, B-CMD-07, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p15` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `b9c6065214649291f52f65b39c452e7c7220ba2fa4cdc87e5fb4618dba2304b3` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p15` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### DL-131: A Crew's own time and cost limit overrides the general run limit (E-33)

Answered on 2026-09-27 by Jared on wand-modules decision card `p16` (register E-33), choosing **"The Crew's own limit overrides the general one"**, which is not the recommended option.

**Question:** A Crew's own limit (say 45 minutes or $6) versus the app's general run limit (say 20 minutes): which wins, and how does a run that hits its limit end?

**Options:**

1. **A. Tighter limit wins; ends as stopped, with the reason** (recommended)
2. **B. The Crew's own limit overrides the general one**

**Answer:** Option B, "The Crew's own limit overrides the general one".

When a Crew sets its own limit (for example 45 minutes or $6) and the app's general run limit is different (for example 20 minutes), the Crew's own limit wins. The recommended rule, the tighter limit wins, is not taken. The card's option B does not say how a run that reaches its limit ends; the recommended ending (stopped, with the reason) was part of option A only. The register lines waiting on this card, B-CW-15, B-CW-19, B-CW-20, B-USE-02, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. It needs lead follow-up before the waiting lines compile (see the lead's notes).

**Lead ruling applied (2026-09-27):** this is the applied reading and settles the follow-up above. Because the collaboration kinds share one limit row, the kind's own limit applies to every collaboration kind, not only to Crew; that reading is accepted. A run that reaches its own limit ends as stopped, with the reason "Stopped at your limit". That is a stop reason, not a new run state: the run settles in the existing terminal state `cancelled`, never `failed`, with `stop_reason` `limit_time`, `limit_cost` or `limit_tokens` (Collaborative_Workflows CWR-029). Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `p16` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `bbf6f6e5c22e8db457e2b253da222b220695cbfedce5327ad87e65656f607b15` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p16` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/usage-feature.md

### DL-132: This chat's assistant checks the work of a helper who is also the Coordinator (E-34)

Answered on 2026-09-27 by Jared on wand-modules decision card `p17` (register E-34), choosing **"This chat's assistant"**, the recommended option.

**Question:** If you make one of the helpers the Coordinator, who checks that helper's own work?

**Options:**

1. **A. This chat's assistant** (recommended)
2. **B. Another helper**
3. **C. A helper who leads does no part of the work**

**Answer:** Option A, "This chat's assistant".

If the user makes one of the helpers the Coordinator, that helper's own part is checked by this chat's assistant, so no one approves their own work, as the Plans require. The register lines waiting on this card, B-CW-07, B-CW-10, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p17` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `3342e7df3e0c9896f8714c0347885c331711a807f6c1817e52bf4cd6435e0b85` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p17` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md

### DL-133: The team preset Personas are registered for team use, and Grill Me is a skill (E-35)

Answered on 2026-09-27 by Jared on wand-modules decision card `p18` (register E-35), choosing **"Register them; Grill Me is a skill"**, the recommended option.

**Question:** The team presets use Product Manager, Architect, Implementer, Reviewer, Critical Advisor and Wonderer. Should the Plans register these for team use, and is Grill Me a Persona or a skill?

**Options:**

1. **A. Register them; Grill Me is a skill** (recommended)
2. **B. Use only Personas already registered**

**Answer:** Option A, "Register them; Grill Me is a skill".

Product Manager, Architect, Implementer, Reviewer, Critical Advisor and Wonderer are registered as Personas for team use, so the team presets work as designed (Critical Advisor is no longer Back Seat Driver-only, and the Plans' disagreement about Product Manager is resolved by registering it). Grill Me is a methodology skill, like Wonderer's method, not a Persona. The register lines waiting on this card, B-CW-14, B-CW-26, B-PER-01, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

SourceRef: decision card `p18` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `741e33ea9bf29f382f1f52e85d9977e52889b58bbca43f7c8274a093d4aef1e9` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p18` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Personas.md

### DL-134: Three official labels change to friendlier words, and two data words get plain display words (E-38)

Answered on 2026-09-27 by Jared on wand-modules decision card `p19` (register E-38 (Plans)), choosing **"Yes to all of it"**, the recommended option.

**Question:** Should the Plans change three official labels to the friendlier words: "Name it for me" (was Regenerate Title), "Write the plan" (was Synthesize) and "Save as default" (was Save as Default, without "my")? And for "Gist Review" and "frozen target pack", keep the official words in the data but show "Notes it took" and "snapshot" on screen?

**Options:**

1. **A. Yes to all of it** (recommended)
2. **B. Keep every official label on screen**

**Answer:** Option A, "Yes to all of it".

The Plans change three official labels: "Name it for me" replaces Regenerate Title, "Write the plan" replaces Synthesize, and "Save as default" replaces Save as Default (without "my"). "Gist Review" and "frozen target pack" keep their official words in the data, and the screen shows "Notes it took" and "snapshot". Because the old labels are preserved exact tokens, the compile supersedes them rather than deleting them. "Retry" and "Recover" are unchanged (DL-118). The register lines waiting on this card, B-CW-11, B-CW-13, B-ACD-06, B-AMS-01, B-FGS-09, B-CMD-01, B-CMD-04, B-CMD-05, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself. The lead's follow-up limits what compiles here to the labels: "Save as default" belongs to the Save as Default control, whose storage and scope are Settings' (E-08, out of this compile), so only its label changes; the other labels compile as stated.

SourceRef: decision card `p19` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `da6eddd13fe1911b9414658b1e9bcf9188a3d3184fbe5ba4ca266712dfc43cfb` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p19` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json`, SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

### DL-135: Crew Auto leaves a one-line note in the chat, worded for the project (E-15)

Answered on 2026-09-27 by Jared on wand-modules decision card `p11` (register E-15), choosing **"Keep the note, worded for the project"**, the recommended option.

**Question:** When you turn Crew Auto on, may it leave a one-line note in the chat, even though it's a project-wide setting?

**Options:**

1. **A. Keep the note, worded for the project** (recommended)
2. **B. No note**

**Answer:** Option A, "Keep the note, worded for the project".

When Crew Auto is turned on, the chat keeps a one-line note worded for the project, such as "Crew Auto is on for this project", so the user can see when it changed. The Plans had no chat record for a project setting; the cost is one more line in the chat. The card was answered at 2026-09-27T21:37:48Z, after DL-110 to DL-134 were written, so it takes the next free id. The register lines waiting on this card, B-CW-08 (the receipt), B-CW-24 (REV-10 and REV-11, with DL-119), B-CMD-03 (`crew_auto_receipt`) and B-CMD-04 (REV-10 and REV-11), compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

**Lead ruling applied (2026-09-27):** the note is kept and worded for the project ("Crew Auto is on for this project"). Collaborative Workflows owns it, beside the Crew Auto evaluator (CWR-021) and the Crew Auto permission of DL-120. The note is for turning Crew Auto on for the project, the setting the card asked about; a chat's own Crew Auto check (the per-chat override of DL-120) and saving rules while Crew Auto is already on for the project add no note (Collaborative_Workflows CWR-038). Agent-relayed: the design lead's rulings of 2026-09-27, made on Jared's behalf and citing his answer on this card; not verifiable from inside this repository.

SourceRef: decision card `p11` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `01923d0690bca21a5ccdf725fcae190a0897420bb68f0e696c568b6c209d3604` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p11` in the lead's updated answer file ANSWERS.json, SHA-256 `d08c3551305290fafe43acaffd78d43f9f8d9cdb00a87e4d21bb34603a61969d`. The copy at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json` (SHA-256 `4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f`) predates this answer and still records `p11` as unanswered. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/UI_Command_Catalog.md

### DL-136: A project-wide "Pause all automations" switch stops every scheduled send and build until the user turns it back on (E-19)

Answered on 2026-09-27 by Jared on wand-modules decision card `p12` (register E-19), approving **"Build a project-wide pause"**, the recommended option. The approval was given in chat on 2026-09-27.

**Question:** Should there be a real, project-wide "Pause all automations" control?

**Options:**

1. **A. Build a project-wide pause** (recommended)
2. **B. Keep per-run pauses and reword the promise**

**Answer:** Option A, "Build a project-wide pause".

There is one project-wide switch: "One switch that stops every scheduled send and build until you turn it back on." The design promised that the user's manual pause always wins but showed the switch read-only, and the Plans only paused one run at a time. The switch is a manual stop: turning it on latches a stop at project scope by advancing the `user_stop_epoch` the way Manual Stop does, so every scheduled send and scheduled build in the project fails its dispatch check while it is on. Only the user clears it, by turning it off. No automatic mechanism clears or bypasses it: not a quota reset, a window opening, a schedule time, or a Goal, Plan or Crew continuation, and creating a new schedule while it is on does not clear it either. The command is `cmd.runtime.automation_pause.set`, project-scoped, with the payload `paused` true or false. The card's cost is "A new command and a little runtime work." The card was answered after DL-110 to DL-135 were written, so it takes the next free id. The register lines waiting on this card, B-SQR-05, B-CMD-01 and B-CMD-02, compile it into the owner documents in the WAIT wave; this entry changes no owner text itself.

**New schedules while the switch is on (settled 2026-09-27):** the lead read "until you turn it back on" to mean that creating a new schedule while the switch is on does not clear it; the new schedule is recorded and waits like the others, with the switch named as its reason. Jared left this reading to the lead on 2026-09-27, and it stands. It differs on purpose from a single run's manual stop, which an explicit user resume or a new schedule the user creates does clear (`Plans/Scheduling_and_Quota_Resume.md`, manual-stop precedence): the project switch is lifted only by turning it off.

SourceRef: decision card `p12` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `c7eaa3c2d9fd5ab08c974f68ec0fb9be955f5b66a7ebd73ad5cacf22e437b856` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p12` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`, SHA-256 `33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5`, which records the approval given in chat on 2026-09-27. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### DL-137: Each helper's line in a running card streams what the helper is writing, reusing the reply streaming (E-31)

Answered on 2026-09-27 by Jared on wand-modules decision card `p14` (register E-31), approving **"Add live streaming for helpers (reuse the reply streaming)"**, the recommended option. The approval was given in chat on 2026-09-27.

**Question:** Should each helper's line in a running card show what it is writing, live, word by word?

**Options:**

1. **A. Add live streaming for helpers (reuse the reply streaming)** (recommended)
2. **B. Show only each helper's last finished sentence; stream only in recorded examples**

**Answer:** Option A, "Add live streaming for helpers (reuse the reply streaming)".

Each helper's line in a running collaboration card shows what the helper is writing, live, word by word, so the user watches helpers work as the design shows. The Plans had no message in progress; messages appeared once, finished. Helper streaming reuses the assistant reply streaming that the Chat WOW canon defined (EP-128 "Assistant turn presentation stream", DL-104 to DL-108, ACD-469 to ACD-475) rather than defining a second streaming model. The finished message still lands once, as a whole message; the streamed text is presentation of a message in progress, never a second record. The card's cost is "A streaming model for helpers in the Plans and the runtime." The card was answered after DL-110 to DL-135 were written, so it takes the next free id after DL-136. The register line waiting on this card, B-CW-22, compiles it into the owner documents in the WAIT wave, and B-CW-21 keeps quotes to complete helper text; this entry changes no owner text itself.

SourceRef: decision card `p14` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json`, SHA-256 `61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a`; card SHA-256 `57721ff4987cf0671822f08ca373077083ba39fc7f8310a951b23b3cd630efca` (`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards-companion.json`, SHA-256 `709393edbf34b827d33fa05cf6d51db2c8d25495228b99e27dc6ad9034c4318d`); answer record `p14` in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json`, SHA-256 `33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5`, which records the approval given in chat on 2026-09-27. Agent-relayed; not verifiable from inside this repository.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md

### DL-138: Resolve the 29 wand-modules questions and adopt all five theme font faces

Jared answered all 29 distinct wand-modules questions (33 ledger question records) on 2026-09-29 with their recommended options, including engineering defaults and follow-up routing, and amended question 22 to include both NieR Mode fonts. The answer source is the owner authorization for this compile.

**Owner answer, verbatim:** "I agree with all your recommended for the 29 questions, except I added that there were 2 more fonts added with nier mode that needed to be added to the spec from PMConcept7. I want codex to handle those questions too. When it finishes everything, it should do the snapshot. As for going forward, it should be after plan changes."

| # | Question | Approved answer | Owning unit |
|---|---|---|---|
| 1 | Advisor pause state | Persist paused with a user or safety cause so Resume has a real state to validate. | BSD-033, BSD-035 |
| 2 | Advisor composer status | Show Reviewing while a finding is being double-checked; Double-checking stays in Context. | BSD-031, BSD-035 |
| 3 | Late critical finding | Use finding state emitted, retain stale and unreconfirmed data, print not re-checked at note weight, and accept Dismiss. | BSD-032, BSD-037 |
| 4 | Replaced wait Release | Return stale_projection for the stale view and refresh the outdated control. | BSD-037 |
| 5 | Advisor status word mapping | Close the duplicate as confirmed from ledger002 q-005 / dec-012; retain DL-110 pairings. | BSD-035, F3-571 |
| 6 | Scheduled Time card | Chat accepts Scheduling ownership of the scheduled-message card internals and its schedule time zone. | SQR-012, ACD-469 |
| 7 | Stored Build At grace and occurrence summary | Version the saved ExecutionSchedule to persist grace_seconds; define an occurrence summary rebuilt from existing owner records. | SQR-015, SQR-016 |
| 8 | Plan-card Cancel schedule | Add plan_card as an allowed origin for cmd.execution_window.cancel. | SQR-013, UCC-169 |
| 9 | Pause all automations companions | Approve storage, wiring, runtime acceptance and event-registration work; complete the first three now and retain event registration as an outstanding Event Authority obligation under the required admission procedure. | SQR-018, ATS-064 |
| 10 | Grill Me outside BrainStorm | Question peers and research independently; ask the user only through the ordinary needs-you path, with no new allowance. | CWR-028 |
| 11 | Crew Auto parallelism | Use Crew parallelism capped by app limits and show a read-only value on the sheet. | CWR-021 |
| 12 | Hard budget vs run limit | Hard budgets always cap a run limit and the sheet shows both requested and effective limits. | CWR-032, CWR-029, UF-106 |
| 13 | First Crew Auto run | Create untouched configuration version 1 with the project; no confirmation sheet before first use, then show the note and settings link. | CWR-004, CWR-021 |
| 14 | Crew Auto Settings and chat override | Set the factory project default On and persist the per-chat override in thread metadata. | CWR-038, SSYS-028 |
| 15 | Crew Auto receipt edge cases | Emit no chat receipt for a Settings-origin change or a chat that opted out. | CWR-038 |
| 16 | Coordinator lane state | Give a coordinator outside the helper roster a row in the same participant-status projection. | CWR-030, CWR-040, EP-129 |
| 17 | Chat Room round exhaustion | Wait after the last round until the user adds rounds, summarizes, or ends the room. | CWR-024, CWR-031 |
| 18 | Rule-check persistence and fix action | Persist passed/failed/could-not-run results with the reply; reuse the existing draft-only fix-request action and reconcile command and older wording. | AMS-053, UCC-170, ACD-477, F3-579 |
| 19 | Mixed rule-check result | Use one Missed-first line, for example Missed 1 of your rules · followed 2. | AMS-053 |
| 20 | Partly known estimate | Decide the cost and time ranges independently; use depends on the work only for the figure without a basis. | UF-104 |
| 21 | Critical Advisor ID | Use the canonical critical-advisor hyphen spelling in Back Seat Driver. | P-057, BSD-022 |
| 22 | Bundled theme fonts | Adopt Inter for Basic/Glass, Poppins for Friendly, IBM Plex Mono for Retro, plus PM NieR Sans and PM NieR Mono as specified below. | F3-430 |
| 23 | Chat/editor split width | Keep chat at least 360 px wide beside the editor. | APR-014 (APR-038/APR-066 lineage), F3-569 |
| 24 | Theme motion timing | Theme durations govern sheets and internal card changes; transcript entrances keep shared timing. | F3-566, ACD-475 |
| 25 | Project ELI5 default | Add project applicability to general.interaction.eli5-default; resolve chat override, then project, then app default. | CWR-033, ACD-484, F3-581, UCC-175, SSYS-028 |
| 26 | Command display names | Use Summarize Now and Run Another Review. | UCC-173 |
| 27 | Seven missing command shapes | Type End discussion, Research this lead, Dismiss a finding, Release a wait, Revoke a rule, Lock a rule and Export memory in existing owner pairs; Confirm a rule also supports locked. | CS-085, WM-063, CWR-031, BSD-037, AMS-052 |
| 28 | Three old wiring descriptions | Update chat_crew_auto_open_config, w_024 chat_crew_auto_set and w_051 chat_eli5_set to their current owner behavior. | WM-063, WM-064 |
| 29 | Superseded command rows | Add pointers from older Send Findings To Agent, Regenerate Title and other replaced rows to the newer rules. | UCC-172, UCC-173, UCC-175 |

**Fonts amendment:** Inter is bundled for Basic and Glass, Poppins for Friendly (with Nunito as its fallback), and IBM Plex Mono for Retro. NieR Mode uses "PM NieR Sans", M PLUS 1 variable weights 100-900 from mplus1-latin-var.woff2, for body and display: it is a free stand-in for the game's commercial Fontworks FOT-Rodin. NieR Mode uses "PM NieR Mono", JetBrains Mono variable weights 100-800 from jetbrains-mono-latin-var.woff2, for mono text. All five named faces are bundled with the app; both NieR faces are SIL OFL. Their source is Concepts/onboarding/opus-5.5/src/settings/styles.d/13-nier.css, with licenses in Concepts/onboarding/opus-5.5/src/settings/nier/fonts/OFL-*.txt and notes in Concepts/onboarding/opus-5.5/src/settings/nier/SOURCE.md. NieR Mode owns general.visual.accent-color and general.visual.app-font through kit.d/18-nier.js.

**Snapshot and baseline policy:** After every landing that changes any file under Plans/**, the landing agent runs snapshot-current and the landing check's --record-baseline in a full worktree at the new main, then lands the snapshot and baseline together as one separate commit under the same landing lock before releasing it. A landing with no Plans/** change needs no refresh. The operating rule belongs in reports/landing-checks/README.md, AGENTS.md and .claude/CLAUDE.md; this batch records the decision, and Part C applies those runbook changes after Part B lands.

Question 9 does not waive event admission: runtime.automation_pause_changed is not one of the seven coordination families covered by DL-093. No event family is registered by this entry. Its approved registration remains outstanding as Scheduling ledger q-006: Event Authority owns the family-specific decision and admission, followed by the prescribed schema, registry, fixture, depth and checkpoint requirements before emission is enabled. Static schemas, fixtures and acceptance contracts do not prove implemented runtime behavior.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md`, SHA-256 `345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c`; recommended options in `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/OPEN-QUESTIONS.md`.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Settings_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Scheduling_and_Quota_Resume.md

### DL-139: The desktop draws with Skia only, extended by our own code; the web version is built with Leptos

**Question:** What draws the desktop app's screens, and what is the web version built with?

**Why it came up:** We checked the concepts' animations and effects against the newest Slint release. Slint cannot blur things, cannot draw frosted glass, cannot fade the edge of a panel or blend colours the way the concepts do, does not use Windows' sharper ClearType text, and only lets you select text inside a plain text box. Slint's own documentation says its web version is not meant for full web apps, and its text there is softer. Slint has no dates for fixing any of this.

**What you get:**
- The desktop stays on Slint, drawn by Skia (the drawing engine Slint can use), and we add the missing pieces ourselves: blur, frosted glass, faded edges, colour blending, sharper text on Windows, and text you can select. The concepts' look carries over instead of being cut back.
- Every computer runs the same drawing code: Skia on the graphics card, or Skia on the processor where there is no usable graphics card, so no computer quietly loses the added effects.
- A web version built with Leptos (a Rust toolkit for web pages). It gets the browser's own sharp text, normal text selection and every web visual effect, and it shares code with the desktop app.

**What it costs:**
- We maintain our own changes to Skia on top of Slint until Slint accepts them, and carry them forward with every Slint upgrade.
- Nothing outside Skia is left as a backup: Skia on the processor becomes the fallback, the test mode and the emergency mode.
- Frosted glass is expensive without a graphics card, so on those computers frosted panels show as solid panels.
- Text stays without ClearType on Mac (Macs do not use it) and, for now, on Linux, which needs more work after Windows.
- Two interfaces, desktop and web, that have to be kept in step.
- The web page's first load is a little slower than a plain JavaScript page.

**Options considered:**
1. Keep the current plan: Skia with two backup renderers, and Slint's own web version. The missing effects stay missing and web text stays soft.
2. Move the whole interface to Flutter. Every effect is built in, but it has no ClearType either, its support for several windows is not finished, and it adds a second programming language.
3. Build a separate native interface for each platform plus the web. Sharpest text, but four times the work and four versions that drift apart.
4. Keep Slint on the desktop, on Skia only, with our own additions, and build the web version with Leptos. **Chosen.**

Also checked: Slint's newer experimental drawing engine (Vello) cannot yet blur or draw ClearType, so it was not chosen; it is worth another look once it is finished. For the web, a JavaScript-based toolkit was the runner-up; switching to one later would need a new decision.

Also checked (2026-10-02): forking GPUI, the Zed editor's interface toolkit, for the desktop. It has ClearType and full text input today, but it lacks the layer drawing that blur, masks, blend modes and group fades need (a renderer redesign), has no processor renderer and no released versions, does not accept contributions from agents so every change would stay ours, and nobody has measured it faster on a real graphics card; on our VM's software graphics card it used two to three times the processor of Slint with Skia. Rejected; the desktop stays on Slint.

**Owner answers, verbatim (2026-10-01, in chat):**
- "ok sounds like we are doing custom skia work and only using skia for desktop.  For web, you said we should use a browser-native web client, what would you recommend?"
- "I told the other thread to drop the slint requirements since we are going to do custom code on skia to alleviate the shortcomings."
- "ok go with Leptos, draft the decision card and spec edits.  Including the skia change, custom code, dropping FemtoVG then cpu(skia has cpu)."

**Owner confirmations (2026-10-01, in the question form, recommended option chosen each time):**
1. Slint's own separate processor renderer goes too: "Yes, Skia only (Recommended)".
2. The "Slint portability" bans stop applying to the effects our Skia additions cover: "Yes, lift them now (Recommended)".
3. Setup popups, which the spec calls sheets: "Frosted on GPU, solid on CPU (Recommended)". They get the extra blur on computers with a graphics card and stay solid without one, and the Glass theme's blur limit opens just enough for this. An earlier version of this question wrongly treated the popups and the sheets as different things; it was corrected and asked again.
4. The web version's terminal: "Reused rows of page text (Recommended)". It uses the same Rust terminal core, only the visible rows exist as page text and get reused, and it has to pass a speed test under heavy output.

**What the spec now says:**
1. **Desktop renderer.** Skia is the only renderer compiled and shipped. Selection runs `SLINT_BACKEND` override, persisted preference, Skia on the graphics card (`winit-skia`), then Skia's processor raster (`winit-skia-software`). FemtoVG and Slint's separate software renderer are dropped. The Graphics Engine setting offers Auto, Skia (GPU) and Skia (CPU).
2. **Skia additions** (`Plans/FinalGUISpec.md#F3-582`): element blur, backdrop blur, gradient and alpha masks, blend modes, saturate/contrast/brightness filters, ClearType text on Windows, and selectable rich text whose selection the app can read and set. They are written to upstream quality, offered to Slint (slint-ui/slint#612, #2066 and #5748), carried as a Cargo patch of Slint's crates until merged, and re-checked with every Slint upgrade. On the processor path backdrop blur is not drawn and frosted surfaces draw solid; the other effects still draw.
3. **Web client** (`Plans/FinalGUISpec.md#F3-583`): Leptos, rendered in the browser, pinned to the 0.8 line until 0.9 is stable, and served by the trusted local daemon. Browser elements and CSS draw it. No React and no TypeScript; JavaScript only as generated or minimal glue. The daemon contract and the web capability states do not change.
4. **Keeping the two in step:** one shared Rust interface-model crate (state, commands, formatting, validation) that both interfaces bind to; one design-token source that generates the Slint theme globals and the CSS variables; and the same fixtures run through both.
5. **"Slint portability" notes:** their bans on blur, backdrop blur, masks, blend modes and filter effects no longer bind for the effects in item 2; their other guidance (precomputed colours, pre-blurred wallpaper images, opaque surfaces) stays as a performance option. The individual notes are updated when their units are next edited.
6. **Setup popups (sheets)** (`Plans/FinalGUISpec.md#F3-566`, `#F3-431`): on the graphics-card path a sheet is frosted glass, the extra blur of DL-114; on the processor path it stays the solid surface it is today. The scrim stays a flat tint. The closed blur budget admits this sheet blur and nothing else.
7. **Web terminal** (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-072`, `Plans/FinalGUISpec.md#F3-583`): the web version draws the same Rust terminal grid as a fixed, reused set of visible page-text rows updated by diff, never one element per output line, and it ships only after passing the heavy-output speed tests.
8. **Unchanged:** the Slint and Rust version pins (kept as they are until build time), "no React, no Tauri", the trusted local daemon contract, and "in-canvas" as the name of the in-app floating layer on both targets.

**What the spec now says, added after the external critique (2026-10-01), the GPUI research and the answers of 2026-10-02:**

On the critique Jared chose, in the question form, "No, port normally" (no trial build before the port) and "Yes, require it in test builds (Recommended)" (test agents can see what the interface is doing). After the GPUI research he said, verbatim (2026-10-02, in chat): "Lets stick to Leptos for web, Slint for native, and keep the skia cpu fallback.  Your recommendation." In the question form that followed he chose the recommended option for the web page size, the one-time notice, going back to the graphics card, motion, and the web terminal, and typed two answers of his own: "ignore the switch and warn the user that there is no gpu detected." (software graphics cards) and "I have a license." (licensing).

1. **Slint stays the desktop framework.** Slint keeps layout, input, focus, text editing, clipboard, drag and drop and windows. Our Skia additions are a fixed set of properties built in one place; screens use those properties and never call the drawing engine directly. Replacing Slint would need a new decision (`Plans/FinalGUISpec.md#F3-582`).
2. **Software graphics cards.** Some machines (remote desktops, virtual machines, our own agent VM) have only a software stand-in for a graphics card (llvmpipe or lavapipe, WARP, SwiftShader). Slint only falls back when no graphics card can be used at all, so Puppet Master checks for these stand-ins itself and always draws with Skia on the processor there, even when the Graphics Engine setting or the override asks for the graphics card; in that case it warns that no graphics card was detected. When it switches for this reason it shows one quiet notice, once and never again, explaining why frosted panels look solid (`Plans/FinalGUISpec.md#F3-033`).
3. **The processor path is fully supported.** The app starts on it when no graphics card works and stays fully usable there. After a lost graphics card, a driver update or crash, or sleep and wake, it rebuilds its drawing without losing what is on screen and goes back to the graphics card by itself once it works again. Motion is the same as on a graphics card; the only difference is that frosted panels go solid.
4. **Web text.** Browser text has no ClearType guarantee, so its readability, selection and cursor are checked on Windows at normal display scaling, still and during animations, including text under faded edges (`Plans/FinalGUISpec.md#F3-583`).
5. **Share behavior, not pixels.** Desktop and web share commands, typed requests and results, data and validation, document and editing models, theme tokens and test scenarios; each draws its own way and is checked against its own reference screenshots. The concept HTML is a design reference, not code to run, and each stateful part of a page has one owner.
6. **Test builds show agents what is happening** (`Plans/Automated_Testing_System.md#ATS-067`): the active screen, focused control, text selection, scroll position, commands sent and their results, frame timing, redraws, memory growth, and which renderer was asked for and which is running, with the reason for any fallback. Never in production builds.
7. **Web terminal selection** (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-072`, `Plans/FinalGUISpec.md#F3-193`, `#F3-583`): the web terminal keeps track of its own text selection, like the desktop terminal, instead of using the browser's, so a selection survives scrolling and new output. It is the one web panel that does this.
8. **Web page size** (`Plans/Contracts_V0.md#CV-188`): the UI Scale setting scales the whole web page at once, with the same presets (75 to 110 percent), allowed range (0.75 to 1.5) and default as on the desktop; browser zoom still works on top.
9. **Licensing.** Jared holds a Slint license, so no separate license cards are opened for the licensing questions the GPUI research raised. This answer does not cover Puppet Master's own license.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261001.md`, SHA-256 `9ca1e2ab54c77a744d629eb4c6dcc1aa8c9d206c6256efbce8b66230a0961ad6`; confirmations in `/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CONFIRMATIONS-20261001.md`, SHA-256 `104cfdda63686a6abe243b83d1c5863cf92929b755993cd87314cd264e44f83a`; the critique and its owner answers in `/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CRITIQUE-RESPONSE-20261001.md`, SHA-256 `76047abe87b2488f52b3e6df94160aa9da09ec1883d3a91876b20d3e1741a1da`; the GPUI research memo `/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/GPUI-RESEARCH-20261002.md`, SHA-256 `119cfe4383311d15f0285b236a995c48e33c5bc5b41125b701e16c7534a33ec9`; the 2026-10-02 owner answer in `/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261002.md`, SHA-256 `6a4c9f58ef4439d0a1882b7306c0b8d446a94e5f45f2346ab4430b66f13f2e84`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Settings_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-114

### DL-140: The assistant chat's icons become one neon family

**Question:** How should every icon in the assistant chat look and move?

**Why it came up:** Jared liked the chat activity bar's icons, "kind of like neon signs, each with unique animations", and asked for every other icon in the chat to match, the working animation included, with one icon reused wherever a thing appears instead of a separate icon for each place.

**What you get:**
- One drawing per concept, reused everywhere, from one icon registry.
- Every icon lit like a neon sign: a lit stroke with a soft halo of the same colour and a faint glow behind it.
- Each icon moves part by part in its own way: the goal arrow strikes the target, the To-Do ticks check in one after another, the artifact lines write in. The activity bar's icons do this too.
- Ordinary controls (close, chevrons, copy, more, pickers) stay quiet until you hover or focus them, then light up and play their motion once. Status icons are always lit and moving, like the bar. Icons that name a thing are lit and still.
- Colour stays reserved for status. **Amended on 2026-10-08 by DL-146:** the composer's capabilities wand is the one control drawn in its own colours (a silver handle, a gold star, blue, pink and green sparkles), and it turns to ink under NieR Mode.
- The magic wand reads as a wand, not a pencil, and the Fast-mode bolt is amber and strikes like lightning.

**What it costs:**
- Each icon draws a little more (a halo under every stroke), and every screen draws its icons through the one registry.
- A small motion design to keep for every icon.
- On light themes the glow stays faint, so lit and unlit differ less there than on dark themes.

**Options considered:** For ordinary controls Jared chose "Ignite on hover (Recommended)"; for motion, "Per-glyph, bar included (Recommended)"; for the module cards' rules (no blur filter, at most two looping animations on a live card), "Portable neon (Recommended)". With portable neon the glow is a halo and a soft glow layer instead of a blur, so it looks the same with or without a graphics card. DL-139 later made blur available; the halo stays because it costs the same on the Skia CPU raster and NieR Mode draws no glow at all.

**Owner answers, verbatim:**
- 2026-10-01: "I really like the icons/animations used for the items in the chat activity bar.  They are kind of like neon signs, each with unique animations.  Can you redesign the icons used everywhere else in that html concept to match that style?  That includes the icons in the working animation(which arent far off now).  The icons next to the thread activity history previews should convey to the user the status of that thread easily.  A lot of the icons will be repeated so that is fine, you shouldnt make bespoke icons for artifacts everywhere it's needed when you already have 1, if that makes sense."
- 2026-10-01, in the question form: "Ignite on hover (Recommended)", "Per-glyph, bar included (Recommended)", "Portable neon (Recommended)".
- 2026-10-02: "The magic wand looks more like a magic pencil.  So that needs to be fixed.  Lightning bolt for fast mode should be colored and hopefully its animated.  Most of it looked good from what I saw."
- 2026-10-02: "I like option 3.  Also, the working animation with the circle and ball, the ball should be orbiting on the circle, not on the outside of it.  And the lightning bolt, the animation is a little off, maybe think of lighting being a crack, like you see lightning coming down from the sky(even though it comes from the ground technically but that isnt how it looks).  Right now the lightning bolt just kinda looks like it almost shakes which misses the opportunity to act like lightning."
- 2026-10-07: "changes are approved, you can PM_Chat_Assistant_5.6_Pro_Standalone.html with your version"

**What the spec now says:**
1. **Icon grammar** (`Plans/FinalGUISpec.md#F3-584`): one drawing per concept; a lit stroke over a halo of the same ink plus a soft glow behind the host, never a blur or filter; controls ignite on hover or keyboard focus, status icons are always lit and moving, concept icons are lit and still; each icon has its own part-by-part motion, the activity bar included; colour is reserved for status; module cards draw their marks lit and still; reduced motion stops every motion while the lit ink still carries each state.
2. **The wand and the Fast-mode bolt** (`Plans/FinalGUISpec.md#F3-588`): a rod with a star tip; an amber bolt that cracks top-down, flashes and settles, and never shakes.
3. Jared approved the result in the 5.6 Pro concept on 2026-10-07, and its shipped standalone carries it.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md`, SHA-256 `1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf` (the owner answers, verbatim); the approved plan `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/PLAN.md`, SHA-256 `a60dc9a203f9b55c4b30b5a919678110524a4d7933e7cae380cd1d974d95475d`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-584, ContractName:Plans/FinalGUISpec.md#F3-588, ContractName:Plans/Decision_Log.md#DL-139

### DL-141: Every status reads at a glance from one shared set of marks

**Question:** How should a thread's status, and every other status in the chat, read at a glance?

**Why it came up:** Jared asked that "The icons next to the thread activity history previews should convey to the user the status of that thread easily."

**What you get:**
- One set of 13 status marks, used everywhere a status shows: thread rows, the chat header, the activity bar's previews, To-Dos, plan steps and module cards.
- Each mark has its own shape, so states tell apart even without colour or motion.
- In a list, a thread that needs you stands out more than one that is working, and idle or paused threads never look lit.
- The working mark's ball travels on its circle, not outside it.
- The chat header shows the mark next to the status word, in the same colour.

**What it costs:**
- The thread list shows status marks only when the drawer is wide; in the narrow drawer they are hidden so titles get the room.
- On light themes the idle ring on a hovered or selected row is fainter than a 3:1 contrast. That is accepted: concepts get no accessibility-only work (Jared, 2026-09-25), and idle must stay quieter than working.

**Options considered:** For the narrow drawer Jared chose "Wide mode only". The lead's rulings, applied inside his decisions: the working mark draws a still circle with only its ball moving (one lap in 9 seconds), the "needs you" mark hops and its glow swells, and idle never reads more lit than working on any row.

**Owner answers, verbatim:**
- 2026-10-01: "The icons next to the thread activity history previews should convey to the user the status of that thread easily."
- 2026-10-01, in the question form: "Wide mode only".
- 2026-10-02: "the ball should be orbiting on the circle, not on the outside of it."

**What the spec now says:**
1. **The status set** (`Plans/FinalGUISpec.md#F3-585`): the 13 marks with their tones and motion, distinct shapes, needs you above working in lists, idle and paused never lit, thread-row marks in the wide drawer only, and the header's status word in the mark's tone.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md`, SHA-256 `1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf` (the owner answers, verbatim); the approved plan `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/PLAN.md`, SHA-256 `a60dc9a203f9b55c4b30b5a919678110524a4d7933e7cae380cd1d974d95475d`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/FinalGUISpec.md#F3-584

### DL-142: The working activity's live step is a dark disc with a lit icon

**Question:** How should the working animation's live step look?

**Why it came up:** A neon icon only reads on a dark ground. The live step was a filled accent-colour disc with a dark icon on it.

**What you get:**
- The live step and the centre disc become a dark disc with a rim in the step's colour and the icon lit inside, moving while the run runs.
- Finished steps are lit green; steps not yet reached stay at rest; only the live step moves.

**What it costs:**
- On light themes the live step is a dark disc on a light card, the one dark object there.

**Options considered:** Jared chose "Dark disc, lit glyph (Recommended)".

**Owner answers, verbatim:**
- 2026-10-01, in the question form: "Dark disc, lit glyph (Recommended)".

**What the spec now says:**
1. **The dark disc** (`Plans/FinalGUISpec.md#F3-586`): the live node and the centre disc, finished steps lit green, pending steps at rest, the failed and waiting flags from the status set, and the same rule for the compact strip and the Step Rail.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md`, SHA-256 `1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf` (the owner answers, verbatim); the approved plan `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/PLAN.md`, SHA-256 `a60dc9a203f9b55c4b30b5a919678110524a4d7933e7cae380cd1d974d95475d`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-586, ContractName:Plans/assistant-chat-design.md#ACD-473

### DL-143: Send and Stop are the "solid-living" design

**Question:** Which design should the composer's Send and Stop button use?

**Why it came up:** Jared asked for this button to be especially good: "The send and stop buttons for the composer need to be really good too as they are something that will be looked at a lot." Three designs were built and filmed, and a judge compared them.

**What you get:**
- A solid button: the accent colour for Send and Queue, red for Stop.
- On send, the paper plane lifts off, a fresh plane slides in and turns into a square, and only then does the red spread out from under it, so a plane never sits on red.
- While a reply runs, the square breathes very gently, a little faster while words arrive, so it reads as "running", not as an alarm.
- While the assistant is busy and you type, the button shows stacked planes with a count of the messages waiting.
- Clicking with nothing to send, or with the queue full, gives a short flicker instead of nothing.
- A double-click on Send never stops the run it just started.

**What it costs:**
- The button is red for the whole run; its glow and breathing were calmed to keep that from feeling like an alarm.
- The judge ranked it third of three (orbit-tie 56, ignition 50.5, solid-living 45); Jared preferred its look.

**Options considered:**
1. Ignition: a small dark neon sign box.
2. Orbit-tie: the working animation's dark disc used as the button (the judge's pick).
3. Solid-living: a solid button with the craft in the icon. **Chosen.**

The judge's defects in option 3 were fixed while building it: the double-click guard, no plane on red, a fainter glow on light themes, a calmer run, breathing that runs off the main thread, and NieR's ink block. Ignition's "sputter" on an empty or full click was added.

**Owner answers, verbatim:**
- 2026-10-02: "The send and stop buttons for the composer need to be really good too as they are something that will be looked at a lot."
- 2026-10-02: "I like option 3."

**What the spec now says:**
1. **The Send and Stop control** (`Plans/FinalGUISpec.md#F3-587`): every state, the send and stop motions, the run's breathing, Queue and Full, the sputter, the double-click rule, reduced motion and NieR. The behaviour (when Stop shows, the queue, Send now) stays with `Plans/FinalGUISpec.md#F3-563` and `Plans/assistant-chat-design.md#ACD-471`.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md`, SHA-256 `1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf`; the judge's verdict `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/VERDICT.md`, SHA-256 `2bc323ea16e66d08512e3260969a9b3031c1688889d0f0e61363bce561b5e48a`; the design notes `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/SOLID-LIVING-NOTES.md`, SHA-256 `15bcacd90861b391404fbe9415f71fe79df7670c12a962c9cb59035875b9eb87`; the build specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/specs/SENDSTOP-BUILD.md`, SHA-256 `50c4cf5663543942eb6b11bab45c0d9b1bacfddeb4460979a748a3ad0b50890b`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-587, ContractName:Plans/FinalGUISpec.md#F3-563, ContractName:Plans/assistant-chat-design.md#ACD-471, ContractName:Plans/Decision_Log.md#DL-108

### DL-144: NieR Mode covers the whole assistant chat, and scene changes cross-fade

**Question:** How should the assistant chat look under NieR Mode, and what happens when the background scene changes?

**Why it came up:** NieR Mode (PMConcept7's game-styled look) will reach the chat when the chat moves into PMConcept7, and Jared asked for it to be done now for the whole chat. Two optional scene ideas came up afterwards.

**What you get:**
- Every chat screen in NieR's ink and parchment under the existing NieR Mode settings, parts and scenes: the Send and Stop button, the status marks, the working animation, menus, sheets, cards and toasts.
- The chat places each NieR part where it belongs: the menu cursor on menus and thread rows, the slice on menus and sheets, the title decode on a thread switch, the glitch on errors, the Pod above the composer, Pod 042 as a persona, quest banners on plan approval, finished builds and goals.
- The transcript area shows a little of the scene behind the conversation.
- Changing from one scene to another fades smoothly instead of switching at once.

**What it costs:**
- NieR's parts add work when the page restyles (about a quarter slower in a stress test); normal use holds 60 frames a second.
- No small moving touches inside the scenes in the chat.

**Options considered:** On the scene ideas, (1) small moving touches inside the scenes and (2) a cross-fade between scenes, Jared chose 2 and not 1.

**Owner answers, verbatim:**
- 2026-10-02: "Dont forget about the new NieR mode found in PMConcept7.html, that will impacting this once it is ported into PMoncept7(not your job) so might as well address those changes now too."
- 2026-10-02: "might as well add the nier mode to the whole concept as well.  it will need to be done eventually so might as well have you do it.  Make it a selectable theme in the demo studio."
- 2026-10-02: "Also the images you sent me looked good.  Do 2 but not 1."

**What the spec now says:**
1. **NieR Mode in the chat and scene changes** (`Plans/FinalGUISpec.md#F3-589`): the chat under NieR Mode's tables, fonts and parts, the place of each part in the chat, the transcript stage counted as the app's ground, and a cross-fade between scenes everywhere a scene changes, PMConcept7 included. In the concept, NieR Light and NieR Dark are Demo Studio themes (lab only); in the product NieR Mode stays the Settings switch of `Plans/Settings_System.md#SSYS-043`, not a ninth theme.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md`, SHA-256 `1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf`; the NieR specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/specs/NIER.md`, SHA-256 `ea5f2a23dc4b48b50bdd90da19492aecbfa9b779a853d1d55942a1571fa059b5`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-589, ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/FinalGUISpec.md#F3-441

### DL-145: The chat's hover labels wait for a deliberate pause, and three small chrome fixes

**Question:** How long should the assistant chat's hover labels wait before they show, and how should three small pieces of chrome behave: the capability boxes in Context More Details, a message's More overflow, and a dropdown inside a setup popup? This entry also records how this wave of tweaks is written down and landed.

**Why it came up:** On 2026-10-07 Jared asked for sixteen changes to the 5.6 Pro assistant chat concept. The first was that its hover labels should wait longer before showing, because they were annoying: they appeared after about 0.4 s on almost anything the pointer crossed. He also reported three chrome faults: the left edge of the selected capability boxes looked cut off, opening a message's More pushed its icons down onto new lines, and a dropdown in a setup popup did not close when its own button was clicked again.

**What you get:**
- Hover labels show only after a deliberate pause, the app's existing hover tag rule (F3-523), which the concept now follows exactly. Keyboard focus shows a label after a shorter wait.
- Every icon in the chat's chrome names itself with the app's hover tag, never the browser's plain tooltip.
- Pressing a control closes its label, and the label stays closed until the pointer leaves the control.
- The activity bar's previews wait for a deliberate pause before they open from the pointer, and still open at once from the keyboard.
- Opening a message's More keeps its meta chips and its Copy, Details and More buttons on their row; the panel opens on its own line below them.
- The capability boxes under Capabilities in this thread, in Context More Details, show their whole outline, the left edge included.
- A dropdown inside a setup popup closes when its own button is clicked again.

**What it costs:**
- A label takes at least 1.6 seconds of resting pointer to appear, and moving along a row of icons no longer hands the label on quickly: each icon waits the full time.

**Options considered:** No options were offered on the timing. The concept first tried about one second, with a quick hand-off from one label to the next; the lead then ruled that the concept follow the product rule exactly (1600 ms of pointer residence and 1100 ms of stationary pointer within 5 px, or 1000 ms of keyboard focus, with no quick hand-off), because the product already waits that long. F3-523 said a press cancels a label that is about to open but was silent on a label already showing, so it gains the press-to-close rule. The activity previews are not labels; their dwell is a concept timing, not canon (ACD-474). The lead also ruled that the two native browser tooltips left in the concept (the Schedule Message track and the To-Do rows) move to the hover tag, so F3-523 needs no exemption.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: the hover labels everywhere in the chat should wait longer before they show; the three chrome faults above should be fixed; and the plan documents should be updated for every change.
- 2026-10-07, decision card 1: land the concept and these plan changes as soon as the checks pass, without a review copy first.
- 2026-10-07, decision card 2: record these decisions in plain words, without quoting his messages.

**What the spec now says:**
1. **Hover labels and activity previews** (`Plans/FinalGUISpec.md#F3-590`): every icon control in the chat names itself through the shared hover tag of F3-523, never a native title; activity previews open only after a deliberate dwell and at once from keyboard focus. F3-523's thresholds are unchanged, and it gains the press-to-close rule (`Plans/FinalGUISpec.md#F3-523`, amended).
2. **The message chrome row and the capability boxes** (`Plans/FinalGUISpec.md#F3-591`).
3. **A dropdown in a setup sheet closes from its own trigger** (`Plans/FinalGUISpec.md#F3-568` and `Plans/Collaborative_Workflows.md#CWR-018`, amended).
4. **This wave lands with the concept** (card 1), and its Decision Log entries, DL-145 to DL-151, describe the owner's decisions in plain words (card 2).

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt`, SHA-256 `e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe` (the owner answers on the eight decision cards); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/chat56-decision-cards-20261007.html`, SHA-256 `29ad155f2313e47df69cb91cd006917d105bd7626168af6517f5987c3e14337c` (the cards as presented); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt`, SHA-256 `546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7` (the lead rulings on the questions no card covered; agent rulings, not owner answers).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-590, ContractName:Plans/FinalGUISpec.md#F3-591, ContractName:Plans/FinalGUISpec.md#F3-568, ContractName:Plans/FinalGUISpec.md#F3-523, ContractName:Plans/assistant-chat-design.md#ACD-474, ContractName:Plans/Collaborative_Workflows.md#CWR-018

### DL-146: The capabilities wand is drawn in colour, the Fast bolt strikes from the top, and Grill Me's icon is a kettle grill

**Question:** How should the composer's capabilities wand, the Fast-mode bolt and Grill Me's icon look and move?

**Why it came up:** After the neon icons of DL-140, Jared asked for a coloured wand that sparkles after its shake. He found that the Fast bolt's strike did not read as a strike from the top: its lower half seemed to flicker to black. And he asked for Grill Me's icon to be a grill in the same neon style, with an animation of its own.

**What you get:**
- The wand on the composer's capabilities control and in its menu head is drawn in colour, still in the neon style: a silver handle, a gold star and blue, pink and green sparkles. Each part glows in its own colour on dark themes and takes a deeper ink on light themes, and hovering never greys it.
- After the wand's shake on hover or focus, its three sparkles twinkle one after another, each flaring into a small star-shaped glint.
- The Fast bolt strikes from the top: a bright line runs down inside the bolt from its top spike to its point, then the whole bolt flashes, flashes again and fades back to rest. It is never darker than at rest.
- Grill Me's icon is a kettle grill in the neon style. Its motion swings the lid open while flames flicker and smoke rises, then drops it shut. It is drawn wherever Grill Me appears as a control or a label.
- Under NieR Mode the wand stays ink, with a lighter handle and a filled star, and twinkles in NieR's stepped motion; the bolt's bright line steps down in ink and the bolt then flashes solid ink.

**What it costs:**
- The wand is the one control in the chat drawn in its own colours, an exception to DL-140's rule that colour is reserved for status.
- The wand's colours do not show under NieR Mode.

**Options considered:** The colours are the ones Jared suggested. Decision card 5 offered ink under NieR Mode with colour in every other theme, colour under NieR Mode too, or faded parchment tints of the five colours under NieR Mode; he chose ink under NieR Mode. Of the grills he suggested (gas or charcoal), a charcoal kettle grill was drawn, to match the kettle Grill Me's puppet stands behind (DL-149). The lead ruled that the grill glyph is drawn wherever Grill Me appears as a control or a label.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: the capabilities wand should be coloured, still read as neon and keep its drawing; he suggested a silver handle, a gold star end and blue, pink and green sparkles, and asked for the coloured sparkles to sparkle after the wand's shake.
- 2026-10-07, in his request: the Fast bolt's animation should strike down from the top.
- 2026-10-07, in his request: Grill Me's icon should be a gas or charcoal grill in the neon style, with an animation of its own; every change should keep the themes and NieR Mode in mind.
- 2026-10-07, decision card 5: the wand turns to ink under NieR Mode and keeps its colours in every other theme.

**What the spec now says:**
1. **The wand, the Fast bolt and the grill** (`Plans/FinalGUISpec.md#F3-588`, amended): three required drawings; the coloured wand and its sparkle; the bolt's top-down leader, flash, re-flash and afterglow, never darker than at rest; the kettle grill and its act; their reduced-motion and NieR forms.
2. **The one colour exception** (`Plans/FinalGUISpec.md#F3-584`, amended): colour stays reserved for status, apart from the capabilities wand.
3. **NieR Mode** (`Plans/FinalGUISpec.md#F3-589`, amended): the wand stays ink.
4. **DL-140** (amended): its rule that colour is reserved for status admits the wand.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt`, SHA-256 `e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe` (the owner answers on the eight decision cards); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/chat56-decision-cards-20261007.html`, SHA-256 `29ad155f2313e47df69cb91cd006917d105bd7626168af6517f5987c3e14337c` (the cards as presented); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt`, SHA-256 `546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7` (the lead rulings on the questions no card covered; agent rulings, not owner answers).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-588, ContractName:Plans/FinalGUISpec.md#F3-584, ContractName:Plans/FinalGUISpec.md#F3-589, ContractName:Plans/Decision_Log.md#DL-140

### DL-147: Activity Detail gets a tidy Goal panel, one-line To-Do rows, and subagents that open as a live transcript

**Question:** How should the Goal, To-Dos and Subagents panels of Activity Detail read?

**Why it came up:** Jared found the Goal panel's View Goal route unhelpful, its buttons messily placed and its Ask for a replacement button unclear. He found the To-Do rows harder to read than the To-Do hover preview, with labels (Start work, Run work) that are not buttons and should not be. And he asked that a subagent's model be underlined and that opening a subagent show a normal transcript: a live, read-only feed of the working agent.

**What you get:**
- **Goal.** The panel shows the objective, then one row of controls: Pause (or Resume) and Edit objective on the left, and Cancel Goal alone at the far edge in the danger colour. Its footer is Objective history, which opens the list of earlier objectives right there. There is no View Goal route and no Ask for a replacement button; asking the assistant in the chat to change the Goal works as before.
- **To-Dos.** Each row is one line, like the To-Do hover preview: the status mark, the title, the owner when an agent or Persona is explicitly assigned, and a status word at the right edge. Rows have no buttons; Open work is in the selected item's detail. The list uses the panel's full height, and its scrollbar sits at the panel's edge.
- **Subagents.** Rows, the preview and the detail card underline the agent's model. Clicking a subagent opens its live transcript beside the chat, drawn like the chat but read-only: no message box, and only Copy, More details and Expand on its messages. Each stretch of the agent's work between messages is one collapsed row with a plain count (for example, ran 3 tools and edited 1 file) that opens on click, with a small Step Rail motif whose live stretch plays a variation of the Step Rail working animation.

**What it costs:**
- The To-Do rows become a second scoped exception to Jared's 2026-09-08 rollback to native cards (DL-122 made the first): each row is a one-line checklist line, while the panel keeps its native frame.
- A subagent's work shows only as counts until you open a stretch.

**Options considered:** Decision card 7 offered compact one-line rows for each work record between messages, messages only, or one collapsed row per stretch of work that opens on click; Jared chose the collapsed row per stretch and suggested using the Step Rail working animation or a variation of it. The Start work and Run work labels were concept-only: the To-Do owner registers no user command that changes an item (`Plans/ToDo_Runtime.md`, Exact commands and required result boundaries). The lead ruled that the To-Do's explicit assignment stays (TDR-011): it shows only when an agent or Persona is explicitly assigned, as the owner's mark or name, with the full label in the row's hover tag and the selected detail. Removing Ask for a replacement removes only that button: an agent-proposed replacement still follows Goal_Runtime_System's approval path when the user asks in the chat, and `cmd.chat.goal.propose_update` is unchanged.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: the Goal panel's View Goal section, which opened the active Goal in its own tab, should go, because nothing in it was needed; the Pause, Cancel Goal and Objective history controls looked messily placed; and Ask for a replacement was unclear and should go.
- 2026-10-07, in his request: the To-Do list should use the panel's full height and more of its width, like the To-Do hover preview, with less padding beside the scrollbar, and without the Start work and Run work labels.
- 2026-10-07, in his request: the Subagents panel should underline the model, and clicking a subagent should show a normal-looking transcript, a live read-only feed of the working agent, without a composer or most of the main chat's controls.
- 2026-10-07, decision card 7: the live transcript shows one collapsed row per stretch of work that opens on click, and that row may use the Step Rail working animation or a variation of it.

**What the spec now says:**
1. **Goal, To-Dos and Subagents in Activity Detail** (`Plans/FinalGUISpec.md#F3-593`), with the 2026-09-03 redesign's sections 7 and 8 and v3 section 24 amended in place, and `Plans/Goal_Runtime_System.md`'s Goal Activity Detail block and `Plans/ToDo_Runtime.md`'s Activity projection and section 9 amended.
2. **The To-Do rows' scoped exception** to the 2026-09-08 rollback (`Plans/FinalGUISpec.md#F3-542` and `#F3-580`, `Plans/assistant-chat-design.md` v3 item 20 and `Plans/Decision_Log.md#DL-122`, amended).
3. **A subagent opens as a read-only live child transcript** (`Plans/assistant-chat-design.md#ACD-485`).

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt`, SHA-256 `e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe` (the owner answers on the eight decision cards); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/chat56-decision-cards-20261007.html`, SHA-256 `29ad155f2313e47df69cb91cd006917d105bd7626168af6517f5987c3e14337c` (the cards as presented); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt`, SHA-256 `546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7` (the lead rulings on the questions no card covered; agent rulings, not owner answers).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-593, ContractName:Plans/assistant-chat-design.md#ACD-485, ContractName:Plans/Goal_Runtime_System.md#GRS-055, ContractName:Plans/ToDo_Runtime.md#TDR-011, ContractName:Plans/Decision_Log.md#DL-122

### DL-148: The setup popups get clear step tiles, a readable chat preview and a send time you can drag, and Technical details leaves the scheduling surfaces

**Question:** How should the setup popups show their numbered steps and their In your chat preview, how should Schedule Message set its time, and where does Technical details still appear?

**Why it came up:** Jared found the numbered steps in the setup popups hard to recognise as steps, because of their colour, and the In your chat previews too small to make out. He asked to drag the send time on Schedule Message's 48-hour graphic and to remove that popup's Technical details and its two promise lines. Decision card 8 then asked where else Technical details should go.

**What you get:**
- In the setup popups with numbered questions (Crew, Review, BrainStorm, Chat Room and Crew Auto), each number sits in a small square step tile in the accent colour, and the step you are on fills in. Under NieR Mode the tile is an inverted ink square.
- The In your chat preview fills the popup's side column and is scaled to fit it, so the card's first frame can be read; the popup itself does not grow.
- In Schedule Message you drag the send marker along the 48-hour track, or click the track, to set the time; with the track focused the keyboard moves it too. It never goes into the past, and the date, the time and the read-back follow it.
- Schedule Message has no Technical details and no promise lines (the line saying it sends exactly this text, and the line saying it can be edited or cancelled before it sends). The message is still sent exactly as scheduled.
- Technical details also leaves Build At, the Scheduled and Automations manager and the records of scheduled and sent messages. Build At still names the exact Plan version it will build, and the Plan's id, version and hash are in the Plan's Details. Each setup popup keeps its Technical details on its Advanced page.

**What it costs:**
- Schedule Message no longer says that a scheduled message is frozen; it stays the behaviour (`Plans/Scheduling_and_Quota_Resume.md#SQR-002`).
- Internal command names are no longer visible on the everyday surfaces; only the setup popups' Advanced pages show them.

**Options considered:** Decision card 8 offered removing Technical details everywhere except each setup popup's Advanced page, removing it everywhere, or removing it only where Jared asked; he chose everywhere except each setup popup's Advanced page. The lead ruled that Crew Auto, whose sheet numbers its three questions, counts among the sheets with numbered questions.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: on Schedule Message the send time should be draggable on its graphic, and its Technical details and its two promise lines should go.
- 2026-10-07, in his request: the numbered steps in the setup popups should stand out as steps.
- 2026-10-07, in his request: the In your chat previews should be a little bigger.
- 2026-10-07, decision card 8: remove Technical details everywhere except each setup popup's Advanced page.

**What the spec now says:**
1. **Step tiles, the readable preview and the send-time track** (`Plans/FinalGUISpec.md#F3-592`).
2. **Schedule Message and Build At** (`Plans/FinalGUISpec.md#F3-573` and the 2026-09-03 redesign's section 13, amended): the track is the send-time control; no promise lines and no Technical details; Build At names its Plan version and leaves the id, version and hash to the Plan's Details (`Plans/Scheduling_and_Quota_Resume.md#SQR-013` and `#SQR-015`, amended).
3. **The sheet anatomy** (`Plans/FinalGUISpec.md#F3-566`, amended): promise lines only where a module has any, and Crew Auto among the numbered sheets.
4. **The command census** (`Plans/UI_Command_Catalog.md#UCC-170` and `Plans/Commands_System.md#CDRY-021`, amended): Technical details has no producer on the Schedule Message sheet and remains only on the setup sheets' Advanced pages.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt`, SHA-256 `e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe` (the owner answers on the eight decision cards); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/chat56-decision-cards-20261007.html`, SHA-256 `29ad155f2313e47df69cb91cd006917d105bd7626168af6517f5987c3e14337c` (the cards as presented); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt`, SHA-256 `546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7` (the lead rulings on the questions no card covered; agent rulings, not owner answers).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-592, ContractName:Plans/FinalGUISpec.md#F3-573, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-013, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-015, ContractName:Plans/UI_Command_Catalog.md#UCC-170, ContractName:Plans/Commands_System.md#CDRY-021

### DL-149: Agents are drawn as little puppets, the agent graphs become tidy cast plates, and Technical details leaves the run cards and run views

**Question:** How should agents be drawn in the chat and in the setup popups, how should the Crew, Review, BrainStorm and Chat Room graphs read, and do run cards and run views keep Technical details?

**Why it came up:** Jared found the agent graphs in the setup popups messy and hard to follow. He pointed to the puppet helpers of PMConcept7's onboarding and suggested drawing the agents as little puppets matching each theme, in the popups, in the chat's cards and in the panel a card opens, with NieR Mode changing them too, and for Technical details to leave the cards.

**What you get:**
- Every agent is a small marionette: a control bar with strings, a chibi figure, and one prop or piece of headwear that names its role (the Coordinator's crown, the Moderator's gavel, a builder's hard hat, a reviewer's magnifier, a critic's jester cap, Wonderer's orbit ring, Grill Me's little kettle grill and so on), so roles read without colour. The seat colour paints the figure.
- Each theme family has its own puppet material: a blueprint line puppet in Basic, felt in Friendly, crystal in Glass, a pixel sprite in Retro. Under NieR Mode the puppet is PMConcept7's NieR puppet: ink on parchment with a rigid visor band.
- One drawing serves every place an agent appears: the popups' rosters and graphs, run cards, run views, Activity's rows and the chat's live agents card. No agent is ever drawn as initials.
- Each graph becomes one tidy cast plate: a bar across the top saying what goes in and who runs it, ending at you; the cast hanging under it on straight strings, every seat named; specialists in a wing on the right; the run's state shown on the seats. The run view opens with the same plate.
- Run cards and run views no longer show Technical details; each setup popup keeps it on its Advanced page.
- In the setup popups the puppets hold still. In the chat a puppet moves once on run cards and in run views (swung on its strings as it starts working, a hop when it is done or needs you), and a working agent's puppet keeps swaying only on the live agents card.

**What it costs:**
- A puppet is a larger drawing than the old marks; at the smallest sizes it simplifies to a bust or a pixel figure.
- The setup popups feel more static.

**Options considered:** Decision card 6 offered still puppets in the popups and live ones in the chat, a gentle sway in the popups too, or still everywhere; Jared chose still in the popups and alive in the chat. The lead ruled that alive in the chat means one-shot motions on run cards and run views, as F3-584 already allows module cards, and continuous sway only on the live agents card; that the Chat Room's Moderator holds a gavel everywhere it is drawn; and that Technical details is gone from run views entirely, fine print included. Decision card 8 is recorded under DL-148. The NieR puppet is the one PMConcept7's onboarding draws; that thread's onboarding unit owns its geometry, and the chat adds only Grill Me's kettle, the Moderator's gavel and the working stage-floor line.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: the agent graphs in the Crew, Review, BrainStorm and Chat Room popups need polish because they are messy and hard to follow; the agents could be drawn as little puppets after PMConcept7's onboarding helpers, much smaller and matching each theme, in the popups, in the transcript cards and in the panel a card opens; NieR Mode should change the puppets too; and the cards' Technical details button can go.
- 2026-10-07, decision card 6: the puppets hold still in the setup popups and are alive in the chat.
- 2026-10-07, decision card 8: remove Technical details everywhere except each setup popup's Advanced page.

**What the spec now says:**
1. **Agents are puppets** (`Plans/FinalGUISpec.md#F3-594`): anatomy, props by role, material by theme family, NieR Mode, detail by size, states and motion.
2. **Cast plates in sheets and run views** (`Plans/FinalGUISpec.md#F3-595`), with no Technical details on run cards or in run views.
3. **The superseded cast mark and avatar stack** in `Plans/FinalGUISpec.md#F3-566`, `#F3-569`, `#F3-580` and `#F3-584`, `Plans/Collaborative_Workflows.md#CWR-019`, `Plans/assistant-chat-design.md#ACD-469` and `Plans/DRY_Rules.md#DR-044`, amended; the run card row of `Plans/UI_Command_Catalog.md#UCC-170` and `Plans/Commands_System.md#CDRY-021`, amended.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt`, SHA-256 `e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe` (the owner answers on the eight decision cards); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/chat56-decision-cards-20261007.html`, SHA-256 `29ad155f2313e47df69cb91cd006917d105bd7626168af6517f5987c3e14337c` (the cards as presented); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt`, SHA-256 `546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7` (the lead rulings on the questions no card covered; agent rulings, not owner answers); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/nier-puppets-final-handoff.md`, SHA-256 `492a3bbeae1285f1dd1d55dfbdc87da3bfa9fce207c9ef01a9f2005abb0ddfa0` (the NieR puppet handoff from the PMConcept7 thread); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PM7-COORDINATION-20261008.md`, SHA-256 `c31bdbf5c69cf7f3110b2bbdc63258848bba8eee69da4154f976c295e2881002` (the agreement with the PMConcept7 thread on who owns what).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-594, ContractName:Plans/FinalGUISpec.md#F3-595, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/Collaborative_Workflows.md#CWR-019, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/Decision_Log.md#DL-111

### DL-150: The Ask Card gets a livelier look

**Question:** How should the questions card (the Ask Card) look?

**Why it came up:** Jared found the questions card dull in spite of its animations. Its behaviour and features were right and stay as they are.

**What you get:**
- A faint accent light in the card's corner, and the waiting mark beside the question, which hops in once per question.
- A progress line along the spine fills in accent colour up to the current question; answered questions show filled beads, skipped ones hollow ones.
- Next (or Submit) is the card's one filled button.
- Options rest on a faint tint; the chosen one takes an accent tint, an accent edge, an accent number and a bolder label, and its radio dot pops in or its check draws itself.
- Calmer, tidier motion: a pressed row springs back, the footer rises into place, the spine draws down.
- Under NieR Mode the chosen answer is NieR's menu cursor and the spine's marks are diamonds; nothing glows.

**What it costs:**
- More accent on the card. It stays inside the accent budget: the Ask Card is a needs-you item, where the accent is allowed (ACD-469).

**Options considered:** None were offered; Jared asked for a new look with the same behaviour.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: the questions popup's look should be updated and its animations polished; its behaviour and features are right.

**What the spec now says:**
1. **The Ask Card's look** (`Plans/FinalGUISpec.md#F3-596`). The questionnaire's behaviour stays with `Plans/assistant-chat-design.md` section 7.4.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-596, ContractName:Plans/assistant-chat-design.md#ACD-469

### DL-151: The Retro themes follow PMConcept7's colours and box shapes

**Question:** Should the chat's Retro Dark and Retro Light match PMConcept7's retro themes?

**Why it came up:** Jared found the chat's retro box shapes and colours off against PMConcept7's retro themes, and asked to keep the chat's retro sounds and animations, which he likes.

**What you get:**
- Retro Dark is PMConcept7's olive Atlas palette with a lime-yellow primary, and Retro Light is ink on warm paper with a blue primary. Both come from the app's Retro theme tokens, which now hold PMConcept7's values, so every Retro screen matches, not only the chat.
- PMConcept7's box grammar: square corners, 2 px structural lines, inner hairlines, hard offset shadows with no blur, opaque menus and dialogs, square selectors and Send. Focus is a lime outline on Retro Dark and a blue one on Retro Light.
- Thread rows are boxed; the selected row is a lime box with a hard lime shadow. Your messages are a solid lime or green block. The assistant's replies sit in a square box with a plain border and the hard retro shadow, with no coloured strip.
- Live work is PMConcept7's operation card (a lime wash and an olive edge) instead of a glow.
- Kept: IBM Plex Mono, every retro font size, every retro motion (stepped motion, the print-in, the phosphor bloom, the block caret) and the retro sound kit. NieR Mode paints over Basic, so none of this reaches NieR Mode.

**What it costs:**
- On Retro Light the warning text is a darker orange and the text on your green message block is paper-coloured, so both read comfortably; PMConcept7 differs in these two spots until it makes the same change, and its thread has been told.
- Retro turns no longer share the open layout of the other themes.
- The app's Retro token tables change for every Retro screen, not only the chat.

**Options considered:** Decision card 3 offered readable Retro Light colours in both concepts, an exact copy of PMConcept7, or readable colours in 5.6 Pro only; Jared chose readable in both, with the PMConcept7 thread told. Decision card 4 offered a square reply box with a plain border and no coloured strip, PMConcept7's exact box with its blue left strip, or open replies along the spine as in the other themes; he chose the square box with no strip. The lead ruled that the solid user block is accepted as a Retro-only exception that names its token role (the theme's lime, not the accent; DR-043), that F3-426's two Retro tables take PMConcept7's values, which this wave owns by agreement with the PMConcept7 thread, and that Retro Light's focus is blue.

**What the owner decided** (in plain words; decision card 2):
- 2026-10-07, in his request: the chat's retro themes should match PMConcept7's retro themes more closely, in their box shapes and design and their colours, keeping the chat's current retro sounds and animations.
- 2026-10-07, decision card 3: readable Retro Light colours (a darker warning orange and paper-coloured text on the green user block), and the PMConcept7 thread is told so it can match.
- 2026-10-07, decision card 4: retro replies are a square box with a plain border and the hard retro shadow, without a coloured strip.

**What the spec now says:**
1. **The assistant chat under the Retro themes** (`Plans/FinalGUISpec.md#F3-597`).
2. **The Retro token tables** (`Plans/FinalGUISpec.md#F3-426`, Theme Token Tables retro-dark and retro-light, amended) take PMConcept7's final retro values and the readable Retro Light warning; Retro focus (`Plans/FinalGUISpec.md#F3-201` and section 13.2, amended) is a lime outline on Retro Dark and a blue outline on Retro Light.
3. **The transcript families under Retro** (`Plans/assistant-chat-design.md#ACD-469` and `Plans/FinalGUISpec.md#F3-562`, amended).

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md`, SHA-256 `acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt`, SHA-256 `e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe` (the owner answers on the eight decision cards); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/chat56-decision-cards-20261007.html`, SHA-256 `29ad155f2313e47df69cb91cd006917d105bd7626168af6517f5987c3e14337c` (the cards as presented); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt`, SHA-256 `546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7` (the lead rulings on the questions no card covered; agent rulings, not owner answers); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PMCONCEPT7-RETRO-VALUES.md`, SHA-256 `4268674a786a33f938d43a5c91c32ba8324c78d883070e13e5aaab7b030ebdec` (PMConcept7 retro values measured in Concepts/PMConcept7.html, the PM7 T22 Atlas block); `/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PM7-COORDINATION-20261008.md`, SHA-256 `c31bdbf5c69cf7f3110b2bbdc63258848bba8eee69da4154f976c295e2881002` (the agreement with the PMConcept7 thread).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-597, ContractName:Plans/FinalGUISpec.md#F3-426, ContractName:Plans/FinalGUISpec.md#F3-201, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/DRY_Rules.md#DR-043

### DL-152: NieR Mode is turned on where a look is chosen, setup and the tour get a NieR look of their own, and their sounds get a pass

**Question:** How does someone turn on NieR Mode while choosing a look, and how should setup, the Guided Tour and their sounds look and sound with it?

**Why it came up:** NieR Mode (2026-09-28) could only be turned on in Settings. The theme menu in the title bar and setup's "Pick a look" page could not reach it, setup and the tour only recoloured the Basic puppets under it, and the setup and tour sounds were one fixed sound per moment, with no NieR sounds and no place in the sound library. Jared asked for all of this on 2026-10-07.

**What you get:**
- A NieR Mode checkbox with an "Adjust NieR look" button beside it in the title bar's theme menu, on setup's "Pick a look" page and in the Look menu of setup and of the tour. The button opens the NieR Mode editor (the Plug-in Chips screen): over the app as a popup, or inside the setup window as a panel.
- During setup, turning NieR Mode on or choosing its parts or its scene is a preview; it is saved with the look when the project is made.
- NieR puppets: ink marionettes in original line art drawn for Puppet Master, on parchment, in place of the Basic puppets while NieR Mode is on.
- A NieR setup window and tour: the YoRHa header, long titles that type on, panels that slice open, Pod's reports and brackets around what the tour points at, each only while its NieR part is installed.
- The showpiece pass is part of this decision: the hero moments (ticking NieR, the cold open, the act card with the rail walk, Created and Ready's curtain call, the one-line hand-over, Show Me, the hung chapter card and the debrief), the rule that long words type on, and the rule that a large area does not flash.
- Livelier sounds: each moment has a few variations, moments that were silent or shared a sound get their own, a NieR set of sounds plays while NieR Mode is on and its Menu sounds part is installed, sounds that happen at the same moment merge into one, and NieR's sounds go through the same player and mute as every other sound.
- Every setup and tour sound, the NieR ones included, listed in the Settings sound library to listen to.

**What it costs:**
- Five looks to keep in step in setup and the tour, the four theme families plus NieR, in pictures and in sound.
- A NieR choice made during setup is not saved if setup is closed before the project is made; it stays on screen like the look chosen there, and resuming setup brings it back.
- The sound library grows by 354 entries (every take of every setup and tour sound), grouped in styles of their own, with only the main take of each moment shown at first, so the notification sounds stay easy to find. The four families' sounds change with this pass; their pictures do not.

**Options considered:** Jared described the design: a checkbox and a button beside it. Not chosen, because each would change canon that stays: NieR as a fifth family or a ninth theme in the menu (NieR Mode paints over Basic and keeps the chosen theme, `Plans/Settings_System.md` section 4.4); a setting to choose the sound kit (no new sound setting, `Plans/Settings_System.md#SSYS-039`); a 30th NieR part for the puppets or the sounds (the existing parts gate them). These three were ruled by the lead under existing canon; they needed no owner answer.

**What Jared asked (2026-10-07, in the T3 thread "Polish NieR Onboarding and Sound Design"):** three tasks on PMConcept7. First, a more polished NieR Mode in setup and the Guided Tour, with NieR-style puppets and sounds. Second, NieR Mode offered where a theme is chosen, in the title bar's theme menu and on setup's theme page, as a checkbox with a button beside it that opens the NieR configurator. Third, a pass on the setup and tour sounds to make them more varied and lively, with more sounds made for NieR, all of them added to the sound library in Settings. He asked that the plans be updated wherever this work changes them, after the other plan edits under way that day had finished. The record keeps his request in plain words rather than quoting it (his choice of 2026-10-07 for decision log entries, decision card 2 recorded in DL-145).

**What the spec now says:**
1. **Where NieR Mode is turned on** (`Plans/FinalGUISpec.md#F3-082`, `#F3-520`, `#F3-521`, `#F3-598`; `Plans/Settings_System.md#SSYS-043`, section 4.4 and section 10): the title-bar theme selector, the onboarding look choice and the onboarding and Tour Look menus carry, below their family and Light/Dark choices, one NieR Mode checkbox (`menuitemcheckbox` in the menus) and an Adjust NieR look button. The button opens the NieR Mode row editor as a popup dialog over the application, or as a panel inside the onboarding window, which has no nested dialogs (`Plans/Planning_Wizard.md`). NieR Mode is still not a family or a ninth theme, and the selector still has exactly eight built-in variants.
2. **During setup it is a preview** (`Plans/Settings_System.md#SSYS-043` and section 4.4, `Plans/FinalGUISpec.md#F3-520`): inside the setup window NieR choices paint without writing, they are written with the theme pair when the look is committed to the Project, closing setup first writes nothing, and a settings copy never brings another Project's NieR rows.
3. **NieR onboarding and tour** (`Plans/FinalGUISpec.md#F3-598`, `#F3-520`, `#F3-521`; `Plans/Planning_Wizard.md` motion): while NieR Mode is painted, the NieR unit marionettes (small original android puppets with a visor band for a face, square joints and hairline strings) replace the Basic illustration system and the window and the tour take a NieR direction, including the hero moments; each NieR touch follows its installed part, Reduce motion and Animation speed; NieR motion is stepped and has no glow, long words type on, and no large area flashes. The reboot cover tears out in slats, in onboarding and on the Settings page, and the NieR boot log on the Settings page paints in the stored mode from its first frame.
4. **Sounds** (`Plans/FinalGUISpec.md#F3-599`, `#F3-405`; `Plans/DRY_Rules.md#DR-043`; `Plans/Settings_System.md` section 4.4): setup and tour cues form one Notifications & Sounds category with variants per cue, new moments that fall back to related sounds (wake, string, land, bow, save, showPointer and showInterrupt among them), a four-note motif per look that resolves at Ready, a kit per theme family plus a NieR kit while NieR Mode is painted with Menu sounds installed, cues in the same 70 ms merged by importance with the designed layers, one signature cue per moment, a rest before a resolution, and one player for every onboarding, tour, chat and NieR sound; the sound library lists them all, 354 entries in the concept, as generated demonstration tones. The four families' sounds change; their pictures do not.
5. **Settings unit for NieR Mode:** NieR Mode gets its own Settings unit, `Plans/Settings_System.md#SSYS-043`, over its section 4.4 prose and section 10 bullet; DL-144 and `Plans/FinalGUISpec.md#F3-589`, which cited the guided set-ups unit SSYS-042 for NieR Mode, now cite it.
6. **Unchanged:** no settings key is added (the three NieR rows, `general.interaction.sound-effects` and `general.interaction.sound-mapping` carry everything); no NieR part, theme family or theme variant is added; no `ui.onboarding.*` or `ui.guided_tour.*` action is added; no game asset or game audio is used; sound is never the only signal.

**Related:** on 2026-10-07 Jared also approved two Retro Light readability values for PMConcept7, on the 5.6 Pro chat's decision card 3: warning text #A65800, and paper text #F5F0E8 on the green user bubble. `Plans/Decision_Log.md#DL-151` records that decision, and the Retro tables of `Plans/FinalGUISpec.md#F3-426` took them with it, not here.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-onb-20261007/JARED-REQUEST-20261007.md`, SHA-256 `416638453431ef6bac2b4a8066560214c4fa3bcd8e0663cf778fba89bc63e652`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/FinalGUISpec.md#F3-599, ContractName:Plans/FinalGUISpec.md#F3-082, ContractName:Plans/FinalGUISpec.md#F3-520, ContractName:Plans/FinalGUISpec.md#F3-521, ContractName:Plans/Settings_System.md#SSYS-043

### DL-161: PMConcept7 carries its own fonts

**Question:** Should PMConcept7 carry the fonts its looks name, instead of borrowing whatever the computer has?

**Why it came up:** PMConcept7's looks name Inter, Poppins, Nunito, IBM Plex Mono and Georgia, but the page carried only NieR Mode's two faces. On a computer without those fonts every look fell back to the machine's own sans or mono (DejaVu on the test VM), so Basic, Glass, Friendly and Retro looked different from one computer to the next. Jared asked on 2026-10-09 that PMConcept7 have all its fonts built in.

**What you get:**
- Basic and Glass in Inter, Friendly in Poppins (with Nunito behind it), Retro in IBM Plex Mono, on every computer and with no font download. Each face is the Latin set, stored inside the page.
- The weights and slants the looks use: Inter at every weight and in italic, Poppins 400 to 800 and italic 400 and 600, IBM Plex Mono 400 to 700 and italic 400 and 600.
- Georgia, which the page names only for the bold italic "i" on its info badges, is a paid font that cannot be built in. Gelasio, a free font drawn to Georgia's measurements, stands in under the name Georgia.
- PMConcept7 and the 5.6 Pro chat use the same Inter, Poppins and IBM Plex Mono files, byte for byte, so both draw the same letters. PMConcept7's build check fails if the two drift apart.
- The symbols the page uses (arrows, check and cross marks, triangles, the warning sign, dots, math signs, the command key and box lines) are drawn for Puppet Master and built in as PM Symbols, so they look the same on every computer, in every look, at regular and bold weight, and line up in monospace and terminal text.
- Buttons, text boxes and menus use the look's font. The browser had drawn them in Arial in Basic, Retro and NieR Mode.

**What it costs:**
- PMConcept7 grows by 463,484 bytes (about 4.5%), to 10.8 MB: 408,446 for the fonts, 54,449 for the symbols and 589 for the control rule.
- Any non-Latin script still uses the computer's own fonts.
- Code text in Basic, Glass and Friendly still uses the computer's own monospace, because those looks name it on purpose; only its symbols are ours. Retro's code text is IBM Plex Mono.
- A new symbol in the page needs a drawing: until one is added to PM Symbols it falls back to the computer's font.

**Options considered:** Not built in: Orbitron and Rajdhani (the page's starting defaults, which every look replaces, retired as theme faces by DL-138) and JetBrains Mono (behind IBM Plex Mono with the same letters, so it never draws; its file is already in the page as NieR Mode's mono). Roboto, Segoe UI, SF Pro, SF Mono, Menlo, Consolas, Cascadia Mono and system-ui name the computer's own fonts on purpose. For Georgia, leaving the computer's own serif would differ by machine; Gelasio is the free face made to Georgia's measurements.

**What the owner decided** (in plain words):
- 2026-10-09, in his request: "Make sure PMConcept7 has all its fonts built in." The choice of faces, weights and slants, the Gelasio stand-in and the shared files are agent choices under that request.
- 2026-10-09, follow-up: the symbols are custom SVG drawings built into a font, rather than icons placed in the page or the computer's own glyphs, and form controls get a CSS rule so they use the look's font ("svg for 1 and css rule for the second", then "SVG glyphs as a font"). The glyph designs are agent choices under that answer.

**What the spec now says:**
1. **The concepts' fonts** (`Plans/FinalGUISpec.md#F3-430`, amended): PMConcept7 embeds the theme faces, Nunito and the Gelasio stand-in for Georgia as Latin woff2 data, declared in `Concepts/onboarding/opus-5.5/src/css/01-webfonts.css`; its symbols are PM Symbols (`src/css/03-symbols.css`), and its form controls take the look's face (`src/css/02-control-fonts.css`).
2. **One set of font files for both concepts** (`Plans/DRY_Rules.md#DR-050`).

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/README.md`, SHA-256 `51df0972bff7f0f909d1cf3438aa1389eaa9e76c3b12b5ac8363814fbded11e4` (the request and the evidence index); `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/proof-after.json`, SHA-256 `bfda89d92f00e53a7ad8dec195de68ff5ef1774443e4fb70868ce32bc061a82a` (the fonts Chrome drew in every look on the P1000 VM, which has none of these fonts installed); `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/symbols-proof.json`, SHA-256 `e0f74c7c89eb6d80a7f48776822310df03989c1cf4e9d421cfe962af30f8ceae` (every symbol drawn from PM Symbols in every look and text context).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-430, ContractName:Plans/DRY_Rules.md#DR-050

### DL-158: The Ask Card fits long answers

**Question:** What should the questions card (the Ask Card) do when the answers are much longer?

**Why it came up:** Jared liked the reworked questions card and asked what happens when the answers are much longer: does it adjust its size and still look good? It did not. The card grew without limit: a long review pushed Submit and the composer off the screen, a long web address ran out past the edge of its row, the Something else answer was one line that hid what did not fit, and the note scrolled inside a fixed box.

**What you get:**
- The card grows and shrinks with what it holds, up to the room above the message box, and leaves a strip of the conversation in view under the chat header.
- Past that, the card's own body scrolls; Back, Skip, Next or Submit and the close button stay where they are and can always be clicked. A faint fade shows there is more, and a thin line sits above the buttons while the body scrolls.
- Long questions, options, descriptions and answers wrap, and a long web address breaks inside its row instead of running off it.
- Options can have a description under their name, and a question can have one under it.
- Something else and the note grow as you type, and review shows every answer whole, line breaks included.
- Short questionnaires look exactly as before.

**What it costs:**
- With very long content the user scrolls inside the card to see all of it, and the conversation behind it shows only a strip until the card is closed.

**Options considered:** None were offered; Jared asked for the card to adjust and still look good, and the brief asked for it to grow up to the screen and keep its buttons in reach. Cutting long answers short was not considered, because the answers are the user's own words.

**What the owner decided** (in plain words):
- 2026-10-09, in his request: the questions card should adjust its size when the answers are much longer, and still look good.

**What the spec now says:**
1. **The Ask Card fits long answers** (`Plans/FinalGUISpec.md#F3-609`), adding to its look (`Plans/FinalGUISpec.md#F3-596`). The questionnaire's behaviour stays with `Plans/assistant-chat-design.md` section 7.4.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-questionnaire-long-answers-20261009/JARED_REQUEST.md`, SHA-256 `b1b1280a6dac4c2b1afed428e91c817bba1c2e7c360bfdae59b3bdec34cacf52` (the owner request).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-609, ContractName:Plans/FinalGUISpec.md#F3-596

### DL-154: A collaboration setup sheet's graph stays in view as helpers and rounds are added

**Question:** What should a collaboration setup sheet do with its graph when the team grows, and with a Chat Room's preview when it is set to many rounds?

**Why it came up:** In the Crew, BrainStorm, Review and Chat Room setup sheets the cast plate gave up its height to the growing roster first and fell back to one caption sentence. From about six helpers (fewer with the specialists on) no drawing fitted the width at all, so with a full team the graph was gone. A Chat Room set to many rounds drew one dot per round on its In your chat preview, up to twelve, and from ten rounds the dots ran past the card and pushed its words out. Jared reported both on 2026-10-09. He accepted that a graph cannot scale to any number of helpers, but asked that it hold a higher number, and that the rounds wrap down.

**What you get:**
- The graph stays a drawing at every team size each kind allows, up to eight helpers with both specialists, in every theme and window size from 700 px wide up. When the team is too wide for one row, the helpers wrap onto two rows, or three. The Coordinator or Moderator still hands its string to every row, and every row still leads to You.
- The plate keeps the height of its leanest drawing that fits. The roster's rows scroll inside their own region with Add a helper kept visible, rather than the graph giving way. The caption sentence remains only for a slot no drawing fits.
- In a narrow window, where the sheet is one scrolling column, the graph stays at the top of the column while its question is on screen.
- A Chat Room's track shows one dot per round, up to its 20-round limit. A long track wraps its dots down onto more rows, and its words ("Round 1 of 20 · not started") get a row of their own. The same applies to the run card in the chat.

**What it costs:**
- The roster starts scrolling a little sooner when the team is large (from about six helpers at 1280 x 800), because the graph keeps its room.
- Run cards and previews of very long Chat Rooms are one or two rows taller.
- The wrapped graph cuts very long helper names at a whole word in the widest themes' type (Retro's), as the one-row strip already did.

**Options considered:** scaling the drawing down to fit (refused: a plate is never scaled, DL-149, and small text becomes unreadable); a scroll inside the graph (kept only as an idea for teams beyond the limits, which no sheet allows today); raising the helper limits (not asked: the limits are Collaborative_Workflows' and stay at eight). The lead ruled on the shape of the wrap and the narrow-window behaviour under existing canon; neither needed an owner answer.

**What Jared asked (2026-10-09, relayed by the round's orchestrator thread):** adding several helpers to a Crew pushed the graph out of view in the Set up a Crew sheet, and the other setup sheets do the same; he understood that the graph cannot scale to any number of workers, but it should hold a higher number. Choosing many rounds in the Chat Room sheet pushed the graphic off the screen, and it should wrap down. The record states his request in plain words rather than quoting it (his choice of 2026-10-07 for decision log entries, decision card 2 recorded in DL-145).

**What the spec now says:**
1. **The plate's floor and the wrap** (`Plans/FinalGUISpec.md#F3-601`, amending `#F3-566` and `#F3-595`): a sheet's cast plate never yields past the leanest drawing that fits its width, and a team too wide for one strip row is drawn as the wrap (two or three rows, a fork from the lead and a join to You). The same wrap heads a run view whose team is too wide for one row. In the one-column narrow sheet the plate stays at the top while its question is on screen.
2. **The track** (`Plans/FinalGUISpec.md#F3-602`): a run card's track never runs past the card; a Chat Room's track has a stop per round up to 20, and a track of eight or more stops wraps its dots down and gives its words their own row.
3. **One mechanism** (`Plans/DRY_Rules.md#DR-045`): one plate-slot fit rule serves every plate slot (the four collaboration sheets, Scheduling's plates, Back Seat Driver's cue plate), one cast grammar with the wrap serves every sheet and run view, and one track primitive serves every run card and preview.
4. **Unchanged:** the helper limits (Crew and Review 1 to 8, BrainStorm and Chat Room 2 to 8), the round limits (Chat Room 1 to 20, BrainStorm's debate 1 to 4), every command, action, setting and wiring row. No `data-action`, command, settings key or wiring entry is added, changed or removed, so `Plans/UI_Command_Catalog.md`, `Plans/Commands_System.md`, `Plans/UI_Wiring_Rules.md` and both Wiring Matrix files are untouched.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/JARED_REQUEST.md`, SHA-256 `46723a8829ea87fc5e01a261d81e92e32f3f1bc2e8a428af6704b1e3a91229e2`; survey before the change `/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/SURVEY-BEFORE.md`, SHA-256 `b4036f1bffdf0bfb65f40fa5062540f60960b072bb46c667a7bcb00f26e0ac5f`.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-601, ContractName:Plans/FinalGUISpec.md#F3-602, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-595, ContractName:Plans/DRY_Rules.md#DR-045

### DL-156: The Plan card's buttons line up and fit the card in every theme

**Question:** How should the Plan card's buttons, and the scheduled-build line above them, be laid out so they fit the card in every theme?

**Why it came up:** On 2026-10-09 Jared sent a Retro Light screenshot of the Plan card in the chat. Build was shorter than Revise and Open plan, and its text was smaller. The three buttons sat on a grey band that touched the card's bottom padding and had no inset of its own, so they didn't line up with anything. The scheduled-build line wrapped "(Chicago time)" against Details. He asked for the buttons to be better designed for the space, in all themes.

**What you get:**
- One row of buttons for every Plan: Build, Revise (while the Plan is Ready) and Open plan on the chat card, and the same row in the editor's footer, on a finished Plan's compact card, under a paused or waiting build, in the scheduled-build line and on the "Build started" receipt. Every button is the same height with the same text size, in all ten themes, with even gaps.
- No grey band. One thin line separates the Plan's summary from its status: the scheduled build, the step count ("6 steps · Ready") and the buttons, all on the card's left edge.
- The scheduled-build line reads in rows: "Builds weeknights 10 PM–2 AM (Chicago time)" with Details beside it, then "next: tonight" and the night ribbon. "Use V6" and "Cancel schedule" get their own row under the sentence instead of squeezing it into a narrow column.
- While building, "Building…" stays at full strength rather than greyed out, and the step count is plain words at the end of the row.
- After you press Build on a Plan that also had a schedule, the line now reads "Schedule ended · you started this build now, so the schedule won’t start a second one." It used to offer "Use V" for a version that didn't exist.

**What it costs:**
- Build is a little taller than before (32 px, like every other button in the chat's cards). The card grows by a few pixels.
- The scheduled-build line can take one more row on a wide card, because its detail now sits under the lead rather than beside it.

**Options considered:** Keep the grey band, but stretch it to the card's edges with its own padding. Not chosen: no other chat card uses a band, and the wand modules' cards put their actions on the content edge. Put the step count at the right end of the button row. Not chosen: in Retro's wider type it wrapped at the card's usual width. The "Schedule ended" wording is the lead's ruling: Build already ends the schedule, and the old notice offered a version that did not exist. Jared may want to confirm it.

**What Jared asked (2026-10-09, relayed with his screenshot by the orchestrator thread):** that the Plan card's buttons, which did not line up well, be designed for the space in every theme. The record states his request in plain words rather than quoting it (decision card 2 of 2026-10-07, recorded in DL-145).

**What the spec now says:**
1. **The Plan card's status zone and one action row** (`Plans/FinalGUISpec.md#F3-606`; section 6 now points to it).
2. **The schedule line's layout** (`Plans/FinalGUISpec.md#F3-607`).
3. **Schedule ended** (`Plans/Scheduling_and_Quota_Resume.md#SQR-015`, amended): a schedule invalidated with no newer version leads with Schedule ended and offers no Use V<n>.
4. **One shared row** (`Plans/DRY_Rules.md#DR-047`): no Plan surface sizes its own buttons.
5. **Unchanged:** no command, action id, wiring, setting or label is added or removed.

SourceRef: `/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED_REQUEST.md`, SHA-256 `4454066fa6584209b779ebf33441037b484f09f452599fcbef3477383782a93d` (the owner request); `/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED-SCREENSHOT-retro-light.png`, SHA-256 `e668fe203ee8aeeb9c9ed1e8aa2f263f525188ce14d4a837958074aace4b839b` (his screenshot).

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-606, ContractName:Plans/FinalGUISpec.md#F3-607, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-015, ContractName:Plans/DRY_Rules.md#DR-047
