# Shard 003: Entries

Source: `Plans/Decision_Log.md`

Source lines: L13-L657

Source SHA256: `a8d52cb9e484518facd55980413623284786a1848db131aa66cc2ee6fe025fda`

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
