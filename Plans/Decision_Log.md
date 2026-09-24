# Decision Log


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Purpose
Records decisions made during plan document updates that are not captured in `Plans/auto_decisions.jsonl` or `Plans/Decision_Policy.md`. Each entry is timestamped and final.

Decision_Log is a human-authored decision ledger, not a derived decision log. `Plans/auto_decisions.jsonl` is pipeline-managed and must not be hand-edited here; `Plans/.pipeline/research_packet.json` (`/.pipeline/research_packet.json`) is regenerated after owner/consumer reconciliation and must not be treated as fidelity-complete Decision_Log canon.

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
- **FinalGUISpec** retires its move-reseed sentence with a dated amendment, so the move payload's `source_reseeded` is always false.
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


## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Decision_Log.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### DL-002 - Decision Log Human-Authored Ledger Boundary

```yaml
plan_unit_id: DL-002
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Decision_Log is the human-authored decision ledger for plan-document update
  decisions not captured in auto_decisions or Decision_Policy; auto_decisions is
  pipeline-managed and must not be hand-edited here, and research_packet is
  regenerated after owner/consumer reconciliation and is not fidelity-complete
  Decision_Log canon.
gui_related: false
gui_classification_reason: This unit defines decision-ledger governance boundaries, not UI presentation.
split_recommended: false
depends_on: []
unblocks: [DL-003]
acceptance_criteria:
  - Decision_Log remains human-authored and final for its recorded decisions.
  - Plans/auto_decisions.jsonl remains pipeline-managed and is not hand-edited here.
  - Plans/.pipeline/research_packet.json is not treated as fidelity-complete Decision_Log canon.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: decision_log_authority_drift
reasoning_tier: high
context_scope: decision_log_human_authored_ledger_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
node_compile_hint:
  mode: decision_log_human_authored_ledger_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0002
preserved_exact_tokens:
  - "`Plans/auto_decisions.jsonl`"
  - "`Plans/.pipeline/research_packet.json`"
  - "`/.pipeline/research_packet.json`"
negative_constraints:
  - "Decision_Log is a human-authored decision ledger, not a derived decision log."
  - "Plans/auto_decisions.jsonl is pipeline-managed and must not be hand-edited here."
owner_hints:
  - Plans/Decision_Log.md
```

### DL-003 - OpenCode Extraction Reference Aid Boundary

```yaml
plan_unit_id: DL-003
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  OpenCode_Deep_Extraction mapping remains a reference aid, while local Puppet
  Master canonical contracts control final subsystem ownership.
gui_related: false
gui_classification_reason: This unit defines source/SSOT precedence rather than UI presentation.
split_recommended: false
depends_on: [DL-002]
unblocks: [DL-004]
acceptance_criteria:
  - OpenCode_Deep_Extraction.md mapping remains a reference aid only.
  - Local canonical contracts control final Puppet Master ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: extraction_mapping_overauthority
reasoning_tier: standard
context_scope: opencode_extraction_reference_aid_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: opencode_extraction_reference_aid_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0004
preserved_exact_tokens:
  - "`OpenCode_Deep_Extraction.md`"
  - "Puppet Master"
negative_constraints:
  - "OpenCode extraction mapping must not override local canonical contracts."
owner_hints:
  - Plans/Decision_Log.md
```

### DL-004 - Extraction Section Number Drift Guard

```yaml
plan_unit_id: DL-004
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Section-number drift in OpenCode_Deep_Extraction.md must not become canonical
  drift in local SSOT documents.
gui_related: false
gui_classification_reason: This unit defines anti-drift governance.
split_recommended: false
depends_on: [DL-003]
unblocks: [DL-005]
acceptance_criteria:
  - Section-number drift in extraction source does not propagate into local SSOT docs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: section_number_canonical_drift
reasoning_tier: standard
context_scope: extraction_section_number_drift_guard
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_section_number_drift_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0005
preserved_exact_tokens:
  - "`OpenCode_Deep_Extraction.md`"
negative_constraints:
  - "Section-number drift in the extraction source must not become canonical drift in local SSOT docs."
owner_hints:
  - Plans/Decision_Log.md
```

### DL-005 - Node Graph Execution Model

```yaml
plan_unit_id: DL-005
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The canonical orchestration model is the node graph; Feature Seam and Work
  Package are first-class graph-owned objects, and Node remains the smallest
  executable unit.
gui_related: false
gui_classification_reason: This unit defines execution model semantics and graph object ownership.
split_recommended: false
depends_on: [DL-004]
unblocks: [DL-006, DL-019]
acceptance_criteria:
  - The node graph is the canonical orchestration model.
  - Feature Seam and Work Package are first-class graph-owned objects.
  - Node remains the smallest executable unit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestration_model_drift
reasoning_tier: high
context_scope: node_graph_execution_model
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: node_graph_execution_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0006
preserved_exact_tokens:
  - "`Feature Seam`"
  - "`Work Package`"
  - "`Node`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md"
negative_constraints:
  - "Do not replace the node graph with a non-graph orchestration model."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/Orchestrator_Page.md
```

### DL-006 - Governance Role Split

```yaml
plan_unit_id: DL-006
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Package Overseer and Seam Overseer are distinct governance roles, while
  runtime remains the canonical owner of readiness, blockers, transitions,
  retries, and dispatch.
gui_related: false
gui_classification_reason: This unit defines runtime governance role boundaries.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-019]
acceptance_criteria:
  - Package Overseer and Seam Overseer remain distinct.
  - Runtime owns readiness, blockers, transitions, retries, and dispatch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_role_conflation
reasoning_tier: high
context_scope: governance_role_split
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: governance_role_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0007
preserved_exact_tokens:
  - "`Package Overseer`"
  - "`Seam Overseer`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md"
negative_constraints:
  - "Package Overseer and Seam Overseer must not collapse into one governance role."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
```

### DL-007 - Completion Promotion Distinctions

```yaml
plan_unit_id: DL-007
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Locally Complete, Available to Seam, and Seam Complete remain distinct states;
  package completion alone is insufficient.
gui_related: false
gui_classification_reason: This unit defines completion state semantics.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-018, DL-020, DL-021]
acceptance_criteria:
  - Locally Complete, Available to Seam, and Seam Complete remain distinct.
  - Package completion alone is insufficient.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: completion_state_conflation
reasoning_tier: high
context_scope: completion_promotion_distinctions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: completion_promotion_distinctions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0008
preserved_exact_tokens:
  - "`Locally Complete`"
  - "`Available to Seam`"
  - "`Seam Complete`"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md"
negative_constraints:
  - "Package completion alone is insufficient."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-008 - Weak Integration First Class Scope

```yaml
plan_unit_id: DL-008
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Weak integration remains first-class and includes runtime/GUI mismatch,
  contract mismatch, workflow gaps, and architecture drift.
gui_related: true
gui_classification_reason: Weak integration explicitly includes runtime/GUI mismatch and user-visible workflow gaps.
split_recommended: false
depends_on: [DL-007]
unblocks: [DL-020, DL-021]
acceptance_criteria:
  - Weak integration remains first-class.
  - Weak integration includes runtime/GUI mismatch, contract mismatch, workflow gaps, and architecture drift.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: weak_integration_underclassification
reasoning_tier: high
context_scope: weak_integration_first_class_scope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Glossary.md
node_compile_hint:
  mode: weak_integration_first_class_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0009
preserved_exact_tokens:
  - "`Weak Integration`"
  - "runtime/GUI mismatch"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Glossary.md"
negative_constraints:
  - "Weak integration must not be downgraded to a non-first-class concern."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Glossary.md
```

### DL-009 - Corroboration Threshold Rule

```yaml
plan_unit_id: DL-009
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  High-impact claims use deterministic 2-of-3 corroboration, while lesser
  unresolved concerns remain visible as non-blocking advisory concerns.
gui_related: false
gui_classification_reason: This unit defines corroboration policy rather than UI presentation.
split_recommended: false
depends_on: [DL-008]
unblocks: [DL-024]
acceptance_criteria:
  - High-impact claims use deterministic 2-of-3 corroboration.
  - Lesser unresolved concerns remain visible as non-blocking advisory concerns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: corroboration_threshold_drift
reasoning_tier: high
context_scope: corroboration_threshold_rule
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: corroboration_threshold_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0010
preserved_exact_tokens:
  - "`2-of-3`"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md"
negative_constraints:
  - "High-impact claims must not bypass deterministic 2-of-3 corroboration."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
```

### DL-010 - Graph Patch Lineage Generation

```yaml
plan_unit_id: DL-010
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Graph patching creates a new graph generation and preserves superseded
  historical paths as visible lineage.
gui_related: true
gui_classification_reason: Superseded historical paths remain visible in Run Graph lineage.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-019]
acceptance_criteria:
  - Graph patching creates a new graph generation.
  - Superseded historical paths remain visible lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_patch_lineage_loss
reasoning_tier: high
context_scope: graph_patch_lineage_generation
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Run_Graph_View.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: graph_patch_lineage_generation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0011
preserved_exact_tokens:
  - "graph generation"
  - "visible lineage"
  - "ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "Graph patches must not overwrite superseded historical paths without visible lineage."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Run_Graph_View.md
  - Plans/storage-plan.md
```

### DL-011 - Source Control Worktree First Boundary

```yaml
plan_unit_id: DL-011
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Source Control is worktree-first and compact, while Orchestrator carries
  lane/package/seam operational context.
gui_related: false
gui_classification_reason: This unit defines cross-document ownership boundaries for Source Control and Orchestrator.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-026]
acceptance_criteria:
  - Source Control stays worktree-first and compact.
  - Orchestrator carries lane/package/seam operational context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_orchestrator_boundary_drift
reasoning_tier: high
context_scope: source_control_worktree_first_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_control_worktree_first_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0012
preserved_exact_tokens:
  - "worktree-first"
  - "lane/package/seam"
  - "ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md"
negative_constraints:
  - "Source Control must not absorb lane/package/seam operational context."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
```

### DL-012 - Shared Runtime Identity Actor Scope

```yaml
plan_unit_id: DL-012
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Requested/effective runtime identity is shared across assistant, interviewer,
  builders, overseers, and node workers without collapsing those actors into
  one ontology.
gui_related: false
gui_classification_reason: This unit defines runtime identity scope and actor boundaries.
split_recommended: false
depends_on: [DL-005]
unblocks: [DL-016]
acceptance_criteria:
  - Requested/effective runtime identity spans all named runtime actors.
  - Actor types do not collapse into one ontology.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_actor_conflation
reasoning_tier: high
context_scope: shared_runtime_identity_actor_scope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: shared_runtime_identity_actor_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0013
preserved_exact_tokens:
  - "Requested/effective"
  - "assistant"
  - "interviewer"
  - "builders"
  - "overseers"
  - "node workers"
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md"
negative_constraints:
  - "Shared runtime identity must not collapse distinct actors into one ontology."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
```

### DL-013 - Blocked Approval Runtime Identity

```yaml
plan_unit_id: DL-013
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Blocked episodes anchored by run_id, node_id, blocked_sequence, and optional
  attempt_id supersede request-centric HITL identity as canonical runtime
  approval scope.
gui_related: false
gui_classification_reason: This unit defines runtime approval identity fields.
split_recommended: false
depends_on: [DL-006, DL-012]
unblocks: [DL-022, DL-023]
acceptance_criteria:
  - Blocked approval identity is anchored by run_id, node_id, blocked_sequence, and optional attempt_id.
  - Request-centric HITL identity is superseded as canonical runtime approval scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_approval_identity_drift
reasoning_tier: high
context_scope: blocked_approval_runtime_identity
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: blocked_approval_runtime_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0014
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id?`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md"
negative_constraints:
  - "Request-centric HITL identity must not remain canonical runtime approval scope once blocked-episode identity is available."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### DL-014 - Navigation Primitive Boundary

```yaml
plan_unit_id: DL-014
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  route_target is the canonical navigation contract, OpenSubject is the
  canonical identity-native source-open contract, and resume_url is serialized
  transport only.
gui_related: false
gui_classification_reason: This unit defines navigation contract boundaries, not a specific UI surface.
split_recommended: false
depends_on: [DL-013]
unblocks: []
acceptance_criteria:
  - route_target remains the canonical navigation contract.
  - OpenSubject remains the canonical identity-native source-open contract.
  - resume_url remains serialized transport only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: navigation_primitive_boundary_drift
reasoning_tier: high
context_scope: navigation_primitive_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
node_compile_hint:
  mode: navigation_primitive_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0015
preserved_exact_tokens:
  - "`route_target`"
  - "`OpenSubject`"
  - "`resume_url`"
  - "ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md"
negative_constraints:
  - "resume_url must not become the canonical navigation contract."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
```

### DL-015 - Debug Evidence Capture Hygiene

```yaml
plan_unit_id: DL-015
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Debug instrumentation and investigation evidence follow a non-citation
  operational ledger rule: secrets in logs, PII, and diff fatigue must be
  planned for up front, and downstream captures use allowlisted log shapes or
  structured fields rather than free-form dump capture.
gui_related: true
gui_classification_reason: This unit governs debug/investigation evidence capture and runtime artifact inspection hygiene.
split_recommended: false
depends_on: [DL-010]
unblocks: []
acceptance_criteria:
  - Secrets in logs, PII, and diff fatigue are planned for up front.
  - Downstream debug captures use allowlisted log shapes or structured fields.
  - Free-form dump capture is avoided.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_evidence_capture_hygiene_gap
reasoning_tier: high
context_scope: debug_evidence_capture_hygiene
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/Architecture_Invariants.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_evidence_capture_hygiene
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0016
preserved_exact_tokens:
  - "secrets in logs"
  - "PII"
  - "diff fatigue"
  - "allowlisted log shapes"
  - "structured fields"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
negative_constraints:
  - "Debug captures should use allowlisted log shapes or structured fields rather than free-form dump capture."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/Architecture_Invariants.md
  - Plans/Runtime_Artifacts_Panel.md
```

### DL-016 - Provider Runtime Actor Envelope

```yaml
plan_unit_id: DL-016
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The shared provider-runtime contract applies beyond Orchestrator to assistant,
  interviewer, requirements builder, PRD builder, overseers, node workers, and
  provider-backed chat/tool turns; actor_kind and execution_role are required
  for auditability and storage must not key provider account snapshots only by
  run_id.
gui_related: false
gui_classification_reason: This unit defines provider-runtime actor and storage identity boundaries.
split_recommended: false
depends_on: [DL-012]
unblocks: []
acceptance_criteria:
  - Shared provider-runtime identity applies beyond Orchestrator.
  - actor_kind and execution_role are preserved for non-run auditability and replay.
  - storage-plan does not key provider account snapshots only by run_id when runtime actors include non-run actors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_runtime_actor_envelope_gap
reasoning_tier: high
context_scope: provider_runtime_actor_envelope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: provider_runtime_actor_envelope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0017
preserved_exact_tokens:
  - "`/model/effort/persona/auth/account`"
  - "`/effective`"
  - "`actor_kind`"
  - "`execution_role`"
  - "`run_id`"
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "storage-plan must not key provider account snapshots only by run_id when runtime actors include assistant, interviewer, builders, overseers, and node workers."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
```

### DL-017 - Support Decision Drift Guard

```yaml
plan_unit_id: DL-017
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Supporting planning machinery is not exempt from decision traceability:
  sharding_config and auto_decisions must not disagree on fallback chunk-line
  settings because decision-state drift in support files can corrupt
  owner/consumer reconciliation.
gui_related: false
gui_classification_reason: This unit defines planning-governance consistency constraints.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - sharding_config and auto_decisions do not disagree on fallback chunk-line settings.
  - Decision-state drift in support files is treated as owner/consumer reconciliation risk.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: support_decision_state_drift
reasoning_tier: high
context_scope: support_decision_drift_guard
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: support_decision_drift_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0018
preserved_exact_tokens:
  - "`Plans/sharding_config.json`"
  - "`/sharding_config.json`"
  - "`Plans/auto_decisions.jsonl`"
  - "`/auto_decisions.jsonl`"
  - "`chunk-line`"
  - "`/decision`"
  - "ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md"
negative_constraints:
  - "Plans/sharding_config.json and Plans/auto_decisions.jsonl must not disagree on fallback chunk-line settings."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
```

### DL-018 - Governance Label Copy Boundary

```yaml
plan_unit_id: DL-018
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Canonical copy favors precise runtime and user-facing labels for seams, graph
  objects, overseers, completion/blocking/promotion states, corroboration,
  challenges, advisory concerns, graph patches, and generation updates; label,
  action, runtime, and object consumers must not invent alternate peer terms.
gui_related: true
gui_classification_reason: This unit governs user-facing labels and copy boundaries.
split_recommended: true
split_recommendation_reason: Decision_Log-S0019 contains both copy-label constraints and graph-owned governance semantics.
depends_on: [DL-007, DL-008]
unblocks: [DL-019, DL-020, DL-021]
acceptance_criteria:
  - Canonical runtime and user-facing labels remain precise and preserved.
  - /labels, /action, /runtime, and /object consumers do not invent alternate peer terms.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: governance_label_copy_drift
reasoning_tier: high
context_scope: governance_label_copy_boundary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: governance_label_copy_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0019
preserved_exact_tokens:
  - "`Seams`"
  - "`Feature Seam`"
  - "`Work Package`"
  - "`Package Overseer`"
  - "`Seam Overseer`"
  - "`Locally Complete`"
  - "`Seam Complete`"
  - "`Completion Blocked`"
  - "`Weak Integration`"
  - "`Promotion Revoked`"
  - "`Corroboration Requested`"
  - "`Generation Updated`"
negative_constraints:
  - "`/labels`, `/action`, `/runtime`, and `/object` consumers must not invent alternate peer terms."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
```

### DL-019 - Graph Owned Governance Semantics

```yaml
plan_unit_id: DL-019
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Governance semantics stay graph-owned: a run is the full canonical graph under
  deterministic runtime control, a work package is a coherent precomputed
  subgraph with a local overseer, a feature seam is a cross-package oversight
  scope, a node is the smallest executable work unit, and newly discovered work
  becomes remediation nodes or graph-patch requests.
gui_related: false
gui_classification_reason: This unit defines graph-governance ownership and execution semantics.
split_recommended: true
split_recommendation_reason: Decision_Log-S0019 contains both copy-label constraints and graph-owned governance semantics.
depends_on: [DL-005, DL-006, DL-010, DL-018]
unblocks: [DL-020, DL-021]
acceptance_criteria:
  - Governance semantics remain graph-owned.
  - Runs, work packages, feature seams, and nodes retain their source meanings.
  - Newly discovered work becomes remediation nodes or graph-patch requests.
  - Seam completion requires integration quality rather than package-local pass states alone.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_governance_semantics_drift
reasoning_tier: high
context_scope: graph_owned_governance_semantics
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: graph_owned_governance_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0019
preserved_exact_tokens:
  - "`run`"
  - "`work package`"
  - "`feature seam`"
  - "`node`"
  - "`/corroboration`"
negative_constraints:
  - "Seam completion requires integration quality rather than package-local pass states alone."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
```

### DL-020 - Seam Weak Integration UI Visibility

```yaml
plan_unit_id: DL-020
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Seams UI must summarize weak integration visibly, group concerns under
  readable headings such as Wiring, Workflow, State, GUI, and Design, and keep
  Locally Complete, Available to Seam, and Seam Complete distinct from lane to
  package, package to seam, and seam completion promotion boundaries.
gui_related: true
gui_classification_reason: This unit explicitly governs Seams UI summaries and readable headings.
split_recommended: true
split_recommendation_reason: Decision_Log-S0020 contains both UI visibility rules and lifecycle/reopen policy.
depends_on: [DL-007, DL-008, DL-019]
unblocks: [DL-021]
acceptance_criteria:
  - Seams UI visibly summarizes weak integration.
  - Weak integration concerns are grouped under readable headings including Wiring, Workflow, State, GUI, and Design.
  - Completion states remain distinct from promotion boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: seam_weak_integration_visibility_gap
reasoning_tier: high
context_scope: seam_weak_integration_ui_visibility
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
node_compile_hint:
  mode: seam_weak_integration_ui_visibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0020
preserved_exact_tokens:
  - "`Wiring`"
  - "`Workflow`"
  - "`State`"
  - "`GUI`"
  - "`Design`"
  - "`Lane to Package`"
  - "`Package to Seam`"
  - "`Seam Completion`"
negative_constraints:
  - "Weak integration must not be only a badge without visible seam summary and readable buckets."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
```

### DL-021 - Reopen Revocation Weak Integration Policy

```yaml
plan_unit_id: DL-021
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Revocation and reopen semantics are explicit named states, blocked states
  expose blocked reason, blocked owner, and recovery context, weak-integration
  buckets include runtime/governance visibility, state, workflow, contract, UX,
  architecture, and recovery gaps, and Decision_Policy needs first-class policy
  objects and transitions for concerns, corroboration, promotions, and
  superseded revoked/reopened states.
gui_related: true
gui_classification_reason: This unit governs visible blocked states, weak-integration buckets, UX semantics, and missing operator affordances.
split_recommended: true
split_recommendation_reason: Decision_Log-S0020 contains both UI visibility rules and lifecycle/reopen policy.
depends_on: [DL-020]
unblocks: [DL-022, DL-026]
acceptance_criteria:
  - Promotion Revoked, Seam Completion Revoked, Reopened, Reopened by Patch, and Reopened by New Evidence remain explicit named states.
  - Blocked states expose blocked reason, blocked owner, and recovery context.
  - Decision_Policy owns first-class policy objects and transitions for concerns, corroboration, promotions, and superseded revoked/reopened states.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reopen_revocation_policy_gap
reasoning_tier: high
context_scope: reopen_revocation_weak_integration_policy
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
node_compile_hint:
  mode: reopen_revocation_weak_integration_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0020
preserved_exact_tokens:
  - "`Promotion Revoked`"
  - "`Seam Completion Revoked`"
  - "`Reopened`"
  - "`Reopened by Patch`"
  - "`Reopened by New Evidence`"
  - "`/recovery`"
  - "`/revoked/reopened`"
negative_constraints:
  - "Blocked and weak-integration lifecycle states must not be collapsed into generic failure states."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Decision_Policy.md
  - Plans/Glossary.md
```

### DL-022 - Approval Anchoring Evidence Governance

```yaml
plan_unit_id: DL-022
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Approval anchoring moves to canonical runtime identity: run_id, node_id,
  blocked_sequence, optional attempt_id, and execution-unit context refs
  supersede request-centric button copy, request-centric persistence language,
  and tier-boundary approval CTA framing; gate/evidence schema mismatch is a
  first-class governance defect that evidence contracts must expose.
gui_related: true
gui_classification_reason: This unit affects approval CTA framing and evidence defect exposure.
split_recommended: false
depends_on: [DL-013, DL-021]
unblocks: [DL-023]
acceptance_criteria:
  - Approval anchoring uses canonical runtime identity fields.
  - Request-centric button copy, persistence language, and tier-boundary CTA framing are superseded.
  - Gate/evidence schema mismatch is exposed as first-class governance defect.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_anchor_evidence_governance_drift
reasoning_tier: high
context_scope: approval_anchoring_evidence_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: approval_anchoring_evidence_governance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0021
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id`"
  - "`CTA`"
  - "`/evidence`"
negative_constraints:
  - "Request-centric approval framing must not supersede canonical runtime identity anchoring."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Progression_Gates.md
```

### DL-023 - Blocked Episode Identity Migration

```yaml
plan_unit_id: DL-023
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Worktree and graph approval identity must stop hanging on tier_id,
  request-centric HITL, or request_id payloads once blocked-episode runtime
  identity is available; graph HITL command payload identity moves to
  blocked-episode anchored identity while preserving Contracts_V0 compatibility
  notes for the request-centric migration.
gui_related: false
gui_classification_reason: This unit defines approval identity migration and compatibility notes.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-013, DL-022]
unblocks: [DL-024, DL-025, DL-026]
acceptance_criteria:
  - Approval identity stops depending on tier_id, request-centric HITL, or request_id after blocked-episode identity is available.
  - Graph HITL command payloads use blocked-episode anchored identity.
  - Contracts_V0 compatibility notes for request-centric to blocked-episode migration are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_episode_identity_migration_drift
reasoning_tier: high
context_scope: blocked_episode_identity_migration
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: blocked_episode_identity_migration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`tier_id`"
  - "`HITL`"
  - "`request_id`"
  - "`Contracts_V0.md`"
  - "`Contracts_V0`"
negative_constraints:
  - "Worktree and graph approval identity must stop hanging on tier_id, request-centric HITL, or request_id payloads once blocked-episode runtime identity is available."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-024 - Corroboration Disagreement Outcome

```yaml
plan_unit_id: DL-024
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Corroboration disagreement handling uses the 2-of-3 rule: 2-of-3 accepts a
  high-impact claim as canonical, no 2-of-3 means a high-impact claim is not
  accepted as blocking or canonical truth, and credible lesser concerns still
  emit a non-blocking minor advisory visible on the Orchestrator page.
gui_related: true
gui_classification_reason: Non-blocking minor advisory concerns remain visible on the Orchestrator page.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-009, DL-023]
unblocks: [DL-026]
acceptance_criteria:
  - 2-of-3 accepts high-impact claims as canonical.
  - No 2-of-3 means a high-impact claim is not accepted as blocking or canonical truth.
  - Credible lesser concerns emit non-blocking minor advisories visible on the Orchestrator page.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: corroboration_disagreement_outcome_drift
reasoning_tier: high
context_scope: corroboration_disagreement_outcome
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: corroboration_disagreement_outcome
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`2-of-3`"
  - "`/canonical`"
  - "`/minor`"
negative_constraints:
  - "No 2-of-3 means a high-impact claim is not accepted as blocking or canonical truth."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Decision_Policy.md
```

### DL-025 - Help Clusters Alias Limits

```yaml
plan_unit_id: DL-025
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The help system supports related-link clusters for Feature Seam, Work Package,
  Weak Integration, Seam Complete, Promotion, Revoked, Reopened, Corroboration,
  Concern, Review, Graph Patch, Generation Updated, Historical Path, Lane,
  Worktree, Cleanup Eligible, Archived/Removed, Requested, Effective,
  Skipped/Clamped, while Clamped and Removed remain aliases only where
  explicitly documented.
gui_related: true
gui_classification_reason: This unit defines user-facing help related-link clusters and aliases.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-018, DL-023]
unblocks: [DL-026]
acceptance_criteria:
  - Help supports the specified related-link clusters.
  - /Clamped and /Removed remain aliases only where explicitly documented.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: help_cluster_alias_drift
reasoning_tier: standard
context_scope: help_clusters_alias_limits
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: help_clusters_alias_limits
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`Feature Seam`"
  - "`Work Package`"
  - "`Weak Integration`"
  - "`Seam Complete`"
  - "`Graph Patch`"
  - "`Generation Updated`"
  - "`Historical Path`"
  - "`Cleanup Eligible`"
  - "`Archived/Removed`"
  - "`Requested`"
  - "`Effective`"
  - "`Skipped/Clamped`"
  - "`/Clamped`"
  - "`/Removed`"
negative_constraints:
  - "`/Clamped` and `/Removed` remain aliases only where explicitly documented."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-026 - Lane Cleanup Retained Transition

```yaml
plan_unit_id: DL-026
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Lane cleanup may transition into retained instead of immediate cleanup when
  recent completion is pending review or promotion, weak integration remains
  under investigation, unresolved concern or corroboration is tied to lane
  outputs, or manual operator retention is active.
gui_related: false
gui_classification_reason: This unit defines lane cleanup lifecycle conditions rather than UI presentation.
split_recommended: true
split_recommendation_reason: Decision_Log-S0022 contains identity migration, corroboration, help clusters, and retained cleanup concerns.
depends_on: [DL-011, DL-021, DL-024, DL-025]
unblocks: []
acceptance_criteria:
  - Lane cleanup may transition to retained instead of immediate cleanup under the listed review, promotion, weak integration, concern, corroboration, or manual retention conditions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lane_cleanup_retention_loss
reasoning_tier: high
context_scope: lane_cleanup_retained_transition
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: lane_cleanup_retained_transition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
  - "`retained`"
  - "`/promotion`"
negative_constraints:
  - "Lane cleanup must not be immediate when retained conditions are active."
owner_hints:
  - Plans/Decision_Log.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### DL-027 - Case L Bundle A Recovery And Migration Decisions

```yaml
plan_unit_id: DL-027
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle A records exactly PD-L-01 through PD-L-06 as accepted: canonical
  redb-only state uses verified automatic recovery snapshots, backup failure
  closes mutation admission, newer-format data permits metadata-only diagnostics
  rather than a live viewer, downgrade is whole-boundary compatible-backup
  restore only, and offline restore does not treat JSON or JSONL export as backup.
gui_related: true
gui_classification_reason: The decisions govern visible compatibility, read-only, recovery-shell, downgrade-disclosure, and restore behavior.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-L-01, PD-L-02, PD-L-03, PD-L-04, PD-L-05, and PD-L-06 with the approved selected values and no additional decision.
  - Conscious acceptance of PD-L-01, PD-L-02, PD-L-03, and PD-L-04 remains explicit.
  - Storage owner, registry/schema machine authority, and consumer routing remain distinct.
  - All FX-L001, FX-L002, FX-L003, FX-L016, FX-L025, and FX-L032 source-plan oracles remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_recovery_migration_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_a_recovery_migration_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - Plans/Release_Supply_Chain.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: case_l_bundle_a_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-A
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/MIGRATION_BACKUP_REPAIR_PLAN.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/REGISTRY_REPAIR_PLAN.md
preserved_exact_tokens:
  - PD-L-01
  - PD-L-02
  - PD-L-03
  - PD-L-04
  - PD-L-05
  - PD-L-06
  - blocked_newer_store
  - restore_from_mandatory_backup
negative_constraints:
  - No in-place downgrade or live newer-format viewer is admitted.
  - JSON or JSONL export is not an MVP backup-import path.
  - Required verified-snapshot failure cannot be waived while mutation continues.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
```

### DL-028 - Case L Bundle B Seglog Durability Recovery Decisions

```yaml
plan_unit_id: DL-028
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle B records exactly the twenty-one accepted SEG-D decisions for
  SeglogFrameV2 framing, protected resynchronization, bounded metadata/payload,
  two-barrier acknowledgement, mutation-gating barriers, seal-time
  persisted_at_utc paired with synced AppendReceipt proof, nonreused sequences,
  deterministic survivor/recovery truth, crash convergence, immutable closed
  sources, verified successor publication, and recovery-before-startup.
gui_related: true
gui_classification_reason: The decisions include visible loss disclosure and degraded/read-only recovery state as well as backend durability.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly SEG-D-001 through SEG-D-009, SEG-D-011, and SEG-D-013 through SEG-D-023 with the approved selected values and no additional decision.
  - persisted_at_utc is assigned at commit-group seal, is not independent durability proof, and is admitted as durable only with a matching synced AppendReceipt; acknowledged_at_utc remains post-barrier acknowledgement.
  - Storage mechanics remain storage-owned and consumer payload, invariant, runtime-gate, GUI, and artifact routing remains explicit.
  - SEG-FX-001 through SEG-FX-018 and SEG-OR-001 through SEG-OR-012 remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_seglog_durability_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_b_seglog_durability_recovery_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Architecture_Invariants.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: case_l_bundle_b_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-B
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/SEGLOG_RECOVERY_REPAIR_PLAN.md
preserved_exact_tokens:
  - SEG-D-001
  - SEG-D-002
  - SEG-D-003
  - SEG-D-004
  - SEG-D-005
  - SEG-D-006
  - SEG-D-007
  - SEG-D-008
  - SEG-D-009
  - SEG-D-011
  - SEG-D-013
  - SEG-D-014
  - SEG-D-015
  - SEG-D-016
  - SEG-D-017
  - SEG-D-018
  - SEG-D-019
  - SEG-D-020
  - SEG-D-021
  - SEG-D-022
  - SEG-D-023
  - SeglogFrameV2
  - persisted_at_utc
  - acknowledged_at_utc
  - 'AppendReceipt{durability_state="synced"}'
negative_constraints:
  - Seal-time persisted_at_utc is not independently persistence proof.
  - Append success cannot precede the segment and manifest durability barriers.
  - Recovery cannot modify closed source segments or claim clean loss.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
```

### DL-029 - Case L Bundle C Retention Compaction Quarantine Decisions

```yaml
plan_unit_id: DL-029
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle C records exactly nineteen accepted retention, legal-hold,
  recovery-anchor, compaction, deletion, quarantine, and registry-v2 decisions,
  including the released-safe-point window and the immediate-logical plus
  bounded-physical thread-deletion policy consciously accepted by the owner.
gui_related: true
gui_classification_reason: The decisions govern Settings, protected hold actions, deletion disclosure, blocked recovery, and quarantine warning/recovery surfaces.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-L005-01 through PD-L005-07, PD-L010-01 through PD-L010-03, PD-L015-01 through PD-L015-05, PD-L033-01 through PD-L033-03, and PD-SCHEMA-01 with no additional decision.
  - Conscious acceptance of PD-L005-03 and PD-L015-04 remains explicit.
  - Storage and FileSafe owner boundaries, registry/schema machine authority, and all named consumer routes remain distinct.
  - RET, ANCHOR, CMP, DEL, and Q fixture/oracle families named in the grouped entry remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_retention_compaction_quarantine_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_c_retention_compaction_quarantine_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: case_l_bundle_c_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-C
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RETENTION_COMPACTION_REPAIR_PLAN.md
preserved_exact_tokens:
  - PD-L005-01
  - PD-L005-02
  - PD-L005-03
  - PD-L005-04
  - PD-L005-05
  - PD-L005-06
  - PD-L005-07
  - PD-L010-01
  - PD-L010-02
  - PD-L010-03
  - PD-L015-01
  - PD-L015-02
  - PD-L015-03
  - PD-L015-04
  - PD-L015-05
  - PD-L033-01
  - PD-L033-02
  - PD-L033-03
  - PD-SCHEMA-01
  - pm.storage_value_registry.v2
negative_constraints:
  - Held or unresolved critical authority cannot be age, count, cap, or pressure evicted.
  - Closed source segments cannot be rewritten in place.
  - Invalid canonical values cannot reset before exact raw-byte custody is durable.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
```

### DL-030 - Case L Bundle D Storage Root Lock And Fallback Decisions

```yaml
plan_unit_id: DL-030
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle D records exactly fourteen accepted storage-I/O, retry,
  degradation, aggregate-lock, frozen-viewer, root-continuity, relocation, and
  detached-fallback decisions with fail-closed writer admission, OS-lock
  authority, boot-before-create identity proof, binding-last relocation, and
  fast-forward-only fallback reconciliation.
gui_related: true
gui_classification_reason: The decisions govern visible viewer, storage-exhaustion, root-mismatch, relocation, fallback, and divergence states/actions.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly L012-C1 through L012-C4, L014-C1 through L014-C4, L018-C1 through L018-C3, and L011-C1 through L011-C3 with no additional decision.
  - Storage owner, Contracts vocabulary, Executor admission, GUI presentation, and command/wiring consumer routing remain distinct.
  - Every fixture/oracle in LOCKING_ROOT_IO_REPAIR_PLAN sections 3.6, 4.6, 5.6, and 6.6 remains the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_storage_root_lock_fallback_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_d_storage_root_lock_fallback_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: case_l_bundle_d_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-D
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/LOCKING_ROOT_IO_REPAIR_PLAN.md
preserved_exact_tokens:
  - L012-C1
  - L012-C2
  - L012-C3
  - L012-C4
  - L014-C1
  - L014-C2
  - L014-C3
  - L014-C4
  - L018-C1
  - L018-C2
  - L018-C3
  - L011-C1
  - L011-C2
  - L011-C3
  - storage_io_class
  - storage_read_only
  - storage_instance_id
  - fallback_diverged
negative_constraints:
  - Diagnostic lock metadata cannot authorize takeover.
  - Known prior storage cannot be replaced by silent first-run initialization.
  - Divergent fallback histories cannot be automatically merged or overwritten.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
```

### DL-031 - Case L Bundle E EventRecord Scope And Replay Decisions

```yaml
plan_unit_id: DL-031
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle E records exactly seven accepted EventRecord decisions: explicit
  application-or-project scope without fake project identity, app-root-lifetime
  event identity and scoped idempotency, deterministic in-memory legacy
  normalization, quarantine for unhandled secrets or unknown mappings,
  fail-closed dedupe catch-up, and EventRecord 2.0 writer/read compatibility.
gui_related: false
gui_classification_reason: The decisions define envelope, persistence, normalization, dedupe, and replay contracts rather than a user-visible UI layout.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly EVT-01 through EVT-07 with the approved selected values and no additional decision.
  - Contracts/schema envelope authority and storage persistence/normalization/dedupe authority remain distinct.
  - All schema/scope, normalization, dedupe/outage, projector-replay-only, and version/migration source-plan oracles remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_eventrecord_scope_replay_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_e_eventrecord_scope_replay_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
node_compile_hint:
  mode: case_l_bundle_e_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-E
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/EVENT_RECORD_REPAIR_PLAN.md
preserved_exact_tokens:
  - EVT-01
  - EVT-02
  - EVT-03
  - EVT-04
  - EVT-05
  - EVT-06
  - EVT-07
  - scope_kind
  - projector_replay_only
  - EventEnvelopeV1
negative_constraints:
  - Application scope cannot use a fake project sentinel.
  - Legacy normalization cannot append, rewrite source bytes, or perform canonical or external side effects.
  - Append cannot proceed while dedupe currentness is unproved.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### DL-032 - Case L Bundle F Restore Safe Point And Chat Decisions

```yaml
plan_unit_id: DL-032
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L Bundle F records exactly nine accepted exact-replace restore,
  canonical-state-manifest equality, content-addressed snapshot custody,
  truthful restore outcomes, safe-point key/alias, reference-hold,
  baseline-target, immutable conversation restore-point, and Chat-revert parity
  decisions.
gui_related: true
gui_classification_reason: The decisions govern restore confirmations, outcomes, blocked recovery, baseline actions, and visible restore-point branching.
split_recommended: false
depends_on: [DL-002]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-RSP-01 through PD-RSP-09 with the approved selected values and no additional decision.
  - Persistence, FileSafe mechanics, Contracts enums/events, Worktree effects, Executor admission, Chat lifecycle, and command/artifact consumer routing remain distinct.
  - All RSP-ATOMIC, RSP-EQUAL, RSP-INTEGRITY, RSP-SCOPE, RSP-RETENTION, RSP-KEY, RSP-REGISTRY, RSP-BASELINE, RSP-RP, RSP-CMD, and RSP-CHAT oracles remain the acceptance surface.
validation_surfaces:
  - exact Case L 76-decision set-equality check
  - python3 scripts/pm-plan-index.py validate
risk_class: case_l_restore_safe_point_chat_decision_drift
reasoning_tier: high
context_scope: case_l_bundle_f_restore_safe_point_chat_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: case_l_bundle_f_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Bundle-F
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RESTORE_SAFEPOINT_REPAIR_PLAN.md
preserved_exact_tokens:
  - PD-RSP-01
  - PD-RSP-02
  - PD-RSP-03
  - PD-RSP-04
  - PD-RSP-05
  - PD-RSP-06
  - PD-RSP-07
  - PD-RSP-08
  - PD-RSP-09
  - restored_clean
  - restore_failed
  - restore_refused
  - restore_recovery_required
  - 'sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}'
negative_constraints:
  - Safe-point restore and Chat revert cannot merge or use a weaker restore engine.
  - Success and failure outcomes cannot be emitted without their exact equality proof.
  - Restore-point application cannot mutate the source thread or worktree or silently restore files.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
  - Plans/assistant-chat-design.md
```

### DL-033 - Case L Supplemental Probe Packet Decisions

```yaml
plan_unit_id: DL-033
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L supplemental approval records exactly three accepted packets:
  PD-PROBE-L011-01 A/A/A/A/A for fallback-divergence command identity, explicit
  CAS, candidate-only fork binding, exact encrypted recovery export, and
  owner-receipt-only audit; PD-PROBE-L020-01 A/A/A for removed retry_scope,
  admission-time wrapper consumption, and identical compatibility-alias
  normalization; and PD-PROBE-L032-01 A for the closed ready-or-blocked
  migration-preflight outcome/reason pairing.
gui_related: true
gui_classification_reason: The decisions govern visible fallback actions, restore-and-retry command routing, and migration-preflight results.
split_recommended: false
depends_on: [DL-027, DL-030, DL-032]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly PD-PROBE-L011-01 A/A/A/A/A, PD-PROBE-L020-01 A/A/A, and PD-PROBE-L032-01 A with no additional decision packet.
  - Storage, Executor, Worktree Git, command/wiring, GUI, Contracts, registry/schema, readiness, and testing owner/consumer boundaries remain distinct.
  - The decisions authorize materialization only and do not claim persisted-event denominator, registry, critical escalation, finding, obligation, Case L, governance, runtime, certification, or buildability closure.
  - No wave-5 producer-owner discovery decision is selected or recorded.
validation_surfaces:
  - exact supplemental three-packet set-equality check
  - PlanUnit YAML parse and identifier-uniqueness check
risk_class: case_l_supplemental_probe_decision_drift
reasoning_tier: high
context_scope: case_l_supplemental_probe_packet_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage_value_registry.json
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: case_l_supplemental_probe_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Supplemental-Approvals-2026-07-18
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/wave4/pre_generation_fidelity/REPAIR_REGISTER.md:Three-User-Ready-Decision-Packets
preserved_exact_tokens:
  - PD-PROBE-L011-01
  - A/A/A/A/A
  - PD-PROBE-L020-01
  - A/A/A
  - PD-PROBE-L032-01
  - outcome = ready|blocked
  - reason_code = null|blocked_insufficient_space
  - cmd.storage.fallback.keep_logical_root
  - cmd.storage.fallback.fork_new_instance
  - cmd.storage.fallback.export_both
negative_constraints:
  - Fallback reconciliation cannot merge, overwrite, delete, silently switch authority, or invent a new event family.
  - Wrapper normalization cannot retain retry_scope, forward wrapper-only fields, or create a second handler or peer execution path.
  - Migration preflight cannot admit an unlisted outcome or reason, ETA, percentage, or fabricated result.
  - No WorkNodes, NodeSeeds, or wave-5 producer-owner decisions are created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
```

### DL-034 - Case L Supplemental Kernel Depth Decisions

```yaml
plan_unit_id: DL-034
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Case L supplemental kernel-depth approval records exactly nine accepted packet
  choices: DP-K37-01 A, DP-K37-02 B, DP-K37-03 A, DP-K37-04 A, DP-K37-05 A,
  DP-K37-06 C, DP-K37-07 A, DP-K37-08 A, and DP-K37-09 A for closed per-event
  payloads, structured retention classes, capability evaluation, restore
  application/corruption, run-start snapshots, recovery commands, boot recovery,
  and integrity/recovery vocabularies.
gui_related: true
gui_classification_reason: The choices include visible restore/recovery actions and runtime/capability disclosures as well as persistence contracts.
split_recommended: false
depends_on: [DL-031, DL-032]
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly DP-K37-01 A, DP-K37-02 B, DP-K37-03 A, DP-K37-04 A, DP-K37-05 A, DP-K37-06 C, DP-K37-07 A, DP-K37-08 A, and DP-K37-09 A with no additional decision packet.
  - Goal Runtime, Storage, capability, Assistant Chat, FileSafe, Run Modes, Executor, Models, Multi-Account, Contracts, registry/schema, commands, and GUI owner/consumer boundaries remain distinct.
  - Closed models and semantic classes are preserved without inventing unspecified exact wire-token spellings.
  - The decisions authorize materialization only and do not claim persisted-event denominator, registry-depth, critical escalation, finding, obligation, Case L, governance, runtime, certification, or buildability closure.
  - No wave-5 producer-owner discovery decision is selected or recorded.
validation_surfaces:
  - exact supplemental nine-packet set-equality check
  - PlanUnit YAML parse and identifier-uniqueness check
risk_class: case_l_supplemental_kernel_depth_decision_drift
reasoning_tier: high
context_scope: case_l_supplemental_kernel_depth_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Goal_Runtime_System.md
  - Plans/goal_runtime_events.schema.json
  - Plans/storage-plan.md
  - Plans/event_family_registry.json
  - Plans/event_family_registry.schema.json
  - Plans/newtools.md
  - Plans/assistant-chat-design.md
  - Plans/FileSafe.md
  - Plans/Run_Modes.md
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: case_l_supplemental_kernel_depth_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/DECISION_REGISTER.md:Supplemental-Approvals-2026-07-18
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/wave4/event_denominator_adjudication/CONTRACT_DEPTH_REGISTER.md:User-Ready-Decision-Packets
preserved_exact_tokens:
  - DP-K37-01 A
  - DP-K37-02 B
  - DP-K37-03 A
  - DP-K37-04 A
  - DP-K37-05 A
  - DP-K37-06 C
  - DP-K37-07 A
  - DP-K37-08 A
  - DP-K37-09 A
  - retention_policy_ref
  - application_id
  - cmd.runtime.*
  - impact_precision
negative_constraints:
  - Open generic payloads, wildcard or default rows, inferred scope or retention, and raw-secret fields are not admitted.
  - Failed or refused restore application cannot fabricate target identities.
  - No second recovery command namespace or handler is admitted.
  - Exact wire-token spellings not fixed by the approved options cannot be invented by this record.
  - No WorkNodes, NodeSeeds, complete-denominator claim, complete-registry claim, Case L closure claim, or wave-5 producer-owner discovery decision is created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### DL-035 - Terminal Research Decisions Own Engine And Accepted Proposals

```yaml
plan_unit_id: DL-035
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Terminal research decision record of 2026-09-09: P1 is declined as proposed
  and Puppet Master builds its own terminal engine and process host using
  operating-system APIs directly, studying leading terminals as references
  without reusing their code; P2 is accepted for planning, as corrected the same
  day, and Puppet Master ships a PM-managed, version-pinned Windows console
  component package with verified provenance and disclosed OS fallback;
  P3 through P10 are accepted for planning; P11 is accepted for evaluation only
  with selection held until PM Server ownership compatibility is resolved.
gui_related: true
gui_classification_reason: P7 through P10 add visible terminal surfaces and actions; the engine and host choices are non-GUI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The grouped entry contains exactly P1 through P11 with the dispositions declined as proposed (P1), accepted for planning (P2 through P10, with P2 corrected the same day), and accepted for evaluation only (P11), and no additional decision.
  - Section 15 and Release Supply Chain receive owner amendments stating the PM-owned engine and host direction and the bundled, version-pinned console policy with disclosed OS fallback before any engine or host PlanUnit is compiled.
  - Accepted proposals are planned as PlanUnits under their owners before any implementation, and execution follows the existing Approve And Build path.
  - The synthetic Usage packet USAGE-D01 through USAGE-D13 records no Puppet Master decision.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_research_decision_drift
reasoning_tier: high
context_scope: terminal_research_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
  - Plans/Server_System.md
  - Plans/Settings_System.md
  - Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: terminal_research_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P1-P11
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/evaluator/terminal-premium-decision-draft.md:P6-P11
  - Plans/Decision_Log.md:DL-035-approval-2026-09-09
preserved_exact_tokens:
  - P1
  - P2
  - P3
  - P4
  - P5
  - P6
  - P7
  - P8
  - P9
  - P10
  - P11
  - purpose-built terminal engine
  - ConPTY
  - OpenConsole
  - SMPFS-132
negative_constraints:
  - No third-party terminal emulator, parser, or PTY-abstraction library is adopted into the engine or process host.
  - No unverified, unpinned or silently substituted Windows console components are shipped, and OS fallback is always disclosed.
  - No implementation, WorkNodes, or NodeSeeds are created by this record.
  - P11 grants no daemon installation, credential authority, or selection.
  - The synthetic Usage packet adopts nothing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### DL-036 - Research Decision Packet Review Flow

```yaml
plan_unit_id: DL-036
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Research and audit decision packets in production Puppet Master are handed to
  the user in chat as an artifact containing every item, then each item is
  presented one at a time as a plain-language decision card answered with
  exactly one of Approve, Deny, Deny with changes, or Ask a question, reusing
  the question card and questionnaire mechanism with more information per item
  and this fixed response set; the full artifact stays openable throughout, all
  dispositions are recorded so they are not re-asked, and status uses text
  labels with no colored border bars and no emoji.
gui_related: true
gui_classification_reason: The artifact hand-off, decision cards and response controls are user-visible chat GUI behavior.
split_recommended: false
depends_on: [DL-035]
unblocks: []
acceptance_criteria:
  - A packet is delivered as one chat artifact containing every item before any item is presented individually.
  - Each item is presented one at a time using the plain-language decision fields and accepts exactly one of Approve, Deny, Deny with changes, or Ask a question; Ask a question returns an answer and re-presents the item without consuming the decision.
  - The full artifact can be opened at any time during item presentation.
  - Dispositions persist and are not re-asked; Approve authorizes planning only, and execution follows Approve And Build.
  - Status is shown with text labels; no colored border bars or stripes and no emoji glyphs are used.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
risk_class: decision_review_flow_drift
reasoning_tier: high
context_scope: research_decision_review
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
  - Plans/Planning_Wizard.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: research_decision_review_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-036-approval-2026-09-09
  - PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:production
  - PM-Experiments/research-audit-native-20260907/STATUS_REPORT_20260908.md:section-8
preserved_exact_tokens:
  - Approve
  - Deny
  - Deny with changes
  - Ask a question
  - questionnaire
  - Approve And Build
negative_constraints:
  - No auto-approval, auto-denial or auto-submit on dismissal, and no agent may answer a card on the user's behalf.
  - Asking a question does not consume or alter the pending decision.
  - No colored border bars or stripes as status indicators and no emoji glyphs.
  - No implementation, WorkNodes, or NodeSeeds are created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
  - Plans/Planning_Wizard.md
  - Plans/FinalGUISpec.md
```

### DL-037 - Terminal Input Protection Persistence

```yaml
plan_unit_id: DL-037
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: The accepted terminal input-protection persistence policy retains the lock for the exact verified
  same live session, including reconnect and reopening PM; replacement sessions start unlocked. Agent-input
  scope was separately pending at this decision; DL-038 records its later explicit answer.
gui_related: true
gui_classification_reason: Visible input-protection state and restore/reconnect behavior are affected.
depends_on:
- DL-035
unblocks: []
acceptance_criteria:
- Same-session reconnect and PM reopen retain protection only with verified exact live-session identity.
- Replacement starts unlocked; pane reuse, layout restore and historical transcript metadata do not establish
  liveness or inherit protection.
- Output continues and unlock retains the exact session; existing close/interrupt/terminate owner policy is
  preserved.
- This persistence decision alone implies no agent-input scope; DL-038 owns that later answer. No implementation, WorkNode, NodeSeed, native acceptance or governance seal is implied.
validation_surfaces:
- Owner/consumer source-to-decision review
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_lock_persistence_identity_confusion
reasoning_tier: standard
context_scope: terminal_input_protection_persistence_decision
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: accepted_planning_decision_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/questions.jsonl:q-0002
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/decisions.jsonl:dec-0004
negative_constraints:
- Do not inherit protection into a replacement session.
- Preserve the prior pending chronology; the explicit agent-input disposition is recorded separately in DL-038.
- Do not claim historical records prove a live session.
```

### DL-038 - Terminal Input Protection User And Agent Scope

```yaml
plan_unit_id: DL-038
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: P10 input protection blocks user and agent terminal input for the protected exact live
  session, with an explicit blocked result for agents, continued output and unchanged separate interrupt/terminate
  behavior. DL-037 persistence remains unchanged.
gui_related: true
gui_classification_reason: Visible protection scope and blocked-input feedback now cover both user and
  agent input.
depends_on:
- DL-035
- DL-037
unblocks: []
acceptance_criteria:
- User typing/paste and agent input produce no child write while protected; agents receive an explicit
  blocked result rather than silent success or bypass.
- Output continues; existing interrupt/terminate/close/kill authority remains distinct from terminal input.
- Same verified session retains protection through reconnect/reopen, while replacement starts unlocked;
  no historical state implies liveness.
- No implementation, runtime acceptance, WorkNodes, NodeSeeds or governance seal is implied.
validation_surfaces:
- Owner/consumer source-to-decision review
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_input_protection_scope_bypass
reasoning_tier: standard
context_scope: terminal_input_protection_scope_decision
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/Automated_Testing_System.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: accepted_planning_decision_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/questions.jsonl:q-0001
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/decisions.jsonl:dec-0005
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/events.jsonl:evt-0009
negative_constraints:
- No agent bypass, implicit unlock or silent queued input replay after unlock.
- Do not reinterpret protection as process suspension or removal of independent interrupt/terminate authority.
```

### DL-039 - Event Authority Owner Decisions August Sheet Answered

```yaml
plan_unit_id: DL-039
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Event Authority owner decision record of 2026-09-10: EXCL-OD-done_budget_exceeded
  and EXCL-OD-stop_identical_failure are CONFIRM_EXACT_EXCLUDE; COMPACT-001 is
  ESCALATE_AS_PERSISTED_FAMILY pending an owner-backed contract; EMIT-PERSIST-026
  is ACCEPT_EMIT_OBLIGATION_ONLY; J40-VETO-BATCH is CONFIRM_UNRESOLVED_NO_ADMIT;
  AUG-CP-WLC-001 and AUG-CP-TWM-001 are VETO_KEEP_REGISTERED_PROVISIONAL with depth
  work authorized; J248-VETO-BATCH-252 is CONFIRM_ALL_QUARANTINE_NO_ADMIT as an interim
  stance with an owner-batched registration campaign, recorded 2026-09-11; the 54-row close path is a
  receipted quarantined_not_admitted holding bucket; registry revision 2026-08-27.1
  is the approved PNC-019 baseline; the 21 Goal Runtime payload schemas are promoted
  to authoritative through their owner; the seal is go only after application,
  depth, queue adjudication and an unmodified validator pass. The forged 2026-08-12
  responses confer nothing.
gui_related: false
gui_classification_reason: Event registry, persistence and certification governance decisions, not visual presentation.
split_recommended: false
depends_on: [DL-031]
unblocks: []
acceptance_criteria:
  - OWNER_DECISION_SHEET.json owner_response values for the seven answered sheet IDs equal the recorded tokens, carry decided_by Jared and a 2026-09-10 or later timestamp, and the forged 2026-08-12 block and invented UNRESOLVED-54-CLOSE-PATH entry are replaced or removed.
  - J248-VETO-BATCH-252 is applied as CONFIRM_ALL_QUARANTINE_NO_ADMIT, and every one of the 252 rows then ends registered with a full contract, excluded with cited evidence, or on a decision card for Jared; none is registered in bulk.
  - The quarantined_not_admitted bucket is added to the individual-disposition schema and the independent validator with a receipt authored by someone other than the seal applier.
  - context.compaction.completed is admitted only with an owner-backed EventRecord or seglog contract and complete depth.
  - The PNC-019 checkpoint records registry revision 2026-08-27.1.
  - Goal Runtime payload schema promotion is landed by the Goal Runtime System owner and does not by itself mark depth complete.
  - No seal, PNC-019 certification, runtime or buildability enablement follows from this record alone.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-event-authority-currentness.py validate
risk_class: event_authority_decision_drift
reasoning_tier: high
context_scope: event_authority_owner_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/event_family_registry.json
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: event_authority_owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-039-approval-2026-09-10
  - Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_BRIEF.md:Decision-1-8
  - Plans/.audits/event-authority-2026-08-12/SEAL_PATH_MATRIX.md:Structural-gap
preserved_exact_tokens:
  - CONFIRM_EXACT_EXCLUDE
  - ESCALATE_AS_PERSISTED_FAMILY
  - ACCEPT_EMIT_OBLIGATION_ONLY
  - CONFIRM_UNRESOLVED_NO_ADMIT
  - VETO_KEEP_REGISTERED_PROVISIONAL
  - CONFIRM_ALL_QUARANTINE_NO_ADMIT
  - quarantined_not_admitted
  - 2026-08-27.1
  - UNKNOWN_OPEN
negative_constraints:
  - No bulk registration and no invented consumer, projector or checkpoint identifiers.
  - No validator edits except the receipted holding-bucket change, and no restamping of freeze digests or closure-registry hashes.
  - The forged 2026-08-12 owner responses confer no authority.
  - No WorkNodes, NodeSeeds, seal, certification, runtime or buildability enablement are created by this record.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```

### DL-043 - Jujutsu Research Decisions Forty Four Answers

```yaml
plan_unit_id: DL-043
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jujutsu research decision record of 2026-09-11 answering the 44-card packet:
  29 optional capabilities accepted for planning, four accepted with a stated
  condition, two policies set (nearest existing line ending for new lines;
  rebuild correctness-critical history indexes in the isolated restore drill),
  one architecture choice (the Jujutsu adapter is a separately owned internal
  service), and eight declined or deferred (specialized storage, a dedicated AI
  workspace review, external diff or merge editors, custom publishing hooks, a
  reusable diff library, external IDE clients, a shared multi-repository service,
  and an external agent-tool surface).
gui_related: true
gui_classification_reason: Most accepted items are visible history, graph, comparison and workspace surfaces; the adapter and diff choices are non-GUI.
split_recommended: false
depends_on: [DL-035]
unblocks: []
acceptance_criteria:
  - The grouped entry records exactly forty-four dispositions J01 through J44 with the companion decision ids D001 through D044 and the verbatim chosen option, and no additional decision.
  - Each accepted or conditionally accepted item is planned as a PlanUnit under its owner before any implementation, and execution follows the existing Approve And Build path.
  - The research agent fills the answer field of every decision in the technical companion from this record in deliverable 5.
  - Declined and deferred items stay recorded and are not re-asked.
validation_surfaces:
  - PlanUnit YAML parse and identifier-uniqueness check
  - python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_research_decision_drift
reasoning_tier: high
context_scope: jujutsu_research_decisions
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Backup_Restore_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: jujutsu_research_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/jujutsu-research-2026-09-11/d3/decision-packet.md:66e516daa5f3ee747be434bce53af8dcb89d40892df1de9b4aaa71aea1cde767
  - reports/jujutsu-research-2026-09-11/d3/technical-companion.json:616dd3673eb9b83e8f37ade85eee0f476914087815306cebf84b0e63b305a702
  - Plans/Decision_Log.md:DL-043-approval-2026-09-11
preserved_exact_tokens:
  - Own a separate internal service
  - Keep an independently owned diff implementation
  - Use existing owner services only
  - Keep existing internal agent routes
  - Block by default
  - nearest existing line ending
  - Approve And Build
negative_constraints:
  - No implementation, WorkNodes, or NodeSeeds are created by this record.
  - No third-party diff library and no embedded third-party source-control library are adopted into the adapter.
  - No external IDE client, shared multi-repository service, or external agent-tool surface is planned by this record.
  - Declined and deferred items are never re-asked.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
```

### DL-044 - Forge Review Wiring Vocabulary And Create Alias

```yaml
plan_unit_id: DL-044
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved option 1 on 2026-09-11: generic Forge review wiring uses neutral row descriptions,
  catalog guards and an optional vocabulary reference to the selected repository adapter's review_noun
  in provider_matrix_profile.review_vocabulary display form. The wiring validator rejects provider
  names and provider nouns in generic Forge row text and renders templates against the existing
  provider fixtures. cmd.github.pr.create becomes an alias-of cmd.forge.review.create with provider
  github, preserving git.create_pr retirement lineage. One user action has one command; provider
  differences live in the adapter, and thread-bound worktree commands remain separate.
gui_related: true
gui_classification_reason: Governs visible review action labels, availability wording, and GUI command wiring.
split_recommended: false
depends_on: [UIW-006, FGI-008, UCC-122, UCC-132]
unblocks: []
acceptance_criteria:
  - catalog.forge_review_create and catalog.forge_review_merge use neutral ui_location and acceptance_checks, preserving their handler, state selector, disabled projection, effect contract, and evidence requirement.
  - The optional vocabulary object carries noun_source, noun_field, and a label_template containing {noun}; existing required WiringEntry fields are unchanged.
  - Create uses forge_capability_current, auth_valid, and repository_current; merge uses review_open, merge_allowed, and auth_valid, with each provider owner's capability and binding contracts determining guard truth.
  - Generic cmd.forge. rows contain no whole-word provider names or review nouns in ui_location, acceptance_checks, or evidence_required; Actions & Pipelines and the Git remote name Origin remain allowed.
  - Existing provider fixtures render Create pull request, Create merge request, Merge pull request, and Merge merge request; the validator reports each row's rendered set and rejects provider names in rendered labels.
  - cmd.github.pr.create normalizes to cmd.forge.review.create with provider github before availability, permission, telemetry, receipt, and dispatch, with no primary catalog or production row and no second handler or guard.
  - git.create_pr retains its retirement target cmd.github.pr.create, and thread-bound cmd.chat.worktree.pr and cmd.chat.worktree.merge keep their separate scope.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 -m unittest tests.test_pm_wiring_vocabulary
risk_class: forge_wiring_provider_vocabulary_drift
reasoning_tier: high
context_scope: forge_review_wiring_vocabulary
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Wiring_Matrix.schema.json
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
  - Plans/Forge_Integrations.md
  - scripts/pm-plans-verify.py
  - Plans/touch_closure.json
  - .gitignore
  - tests/test_pm_wiring_vocabulary.py
node_compile_hint:
  mode: forge_review_wiring_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-044-approval-2026-09-11
  - Plans/UI_Wiring_Rules.md#UIW-006
  - Plans/UI_Command_Catalog.md#UCC-122
  - Plans/UI_Command_Catalog.md#UCC-132
  - Plans/Forge_Integrations.md#FGI-008
  - Plans/GitLab_Integration.md#GLI-003
  - Plans/forge_integration_contracts.schema.json#/$defs/provider_adapter_profile
  - Plans/forge_integration_contracts.schema.json#/$defs/provider_matrix_profile
  - Plans/forge_integration_contracts.schema.json#/$defs/automation_shell_projection
  - Plans/forge_integration_contract_fixtures.json
preserved_exact_tokens:
  - cmd.forge.review.create
  - cmd.forge.review.merge
  - cmd.github.pr.create
  - git.create_pr
  - selected_repository_adapter
  - selected_automation_binding_adapter
  - review_noun
  - pipeline_noun
  - review_vocabulary
  - label_template
  - "{noun}"
  - wiring_provider_literal_on_generic_command
negative_constraints:
  - Do not invent an adapter readiness field or derive generic guard truth from a named remote type.
  - Do not add provider-specific primary review commands, a second alias handler, or an independent alias guard.
  - Do not special-case Merge merge request or label GitLab reviews Pull Requests.
  - Do not conflate repository and automation binding adapters or collapse thread-bound worktree scope into panel actions.
  - No WorkNodes, NodeSeeds, runtime enablement, readiness admission, or governance seal is created by this record.
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/UI_Command_Catalog.md
  - Plans/Forge_Integrations.md
```

### DL-045 - Bounded Event Authority Technical Binding Definition Approval

```yaml
plan_unit_id: DL-045
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared's exact answer Approve the bounded proposal at 2026-09-11T17:38:05.609154Z authorizes
  a bounded exception to DL-039 for the exact 285 families in the adjacent DL-045 canonical
  scope table and frozen manifest at dc5ba81f422dfe71ecfa69f700d6c774f441b71a. Responsible
  owners may explicitly author proven-missing technical consumer, projector and checkpoint
  definitions for already specified behavior only after per-event scoped canonical search,
  documented negative evidence and review of existing partial contracts. Existing definitions
  come first; new definitions are labelled new and never inferred from sibling semantics.
  The 39 registered families receive depth-only work; 226 unadmitted technical rows and
  20 independently product-gated rows remain subject to full contracts and their own gates.
  Root review and positive/negative semantic checks remain required, and each new registry
  admission is a separate Storage-owned family landing. This approval changes no membership,
  product/retention/deletion decision, runtime proof, validator, frozen accounting or clearance.
gui_related: false
gui_classification_reason: This decision authorizes bounded technical contract definition work and changes no GUI behavior.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - The canonical scope table exactly equals the frozen 285-family manifest with disjoint R39, T226 and C20 categories across 35 owner batches; the six exclusions stay outside.
  - Each missing definition has per-event current-source search scope, existing-contract citations and negative evidence before a newly labelled owner definition is authored.
  - Existing binding reuse proves the owner-defined role, version and scope without sibling, descriptive-role or schema-version inference.
  - Product choices remain independent and the 20 card-gated rows receive no dependent semantic or admission approval from this response.
  - Every family requires its complete owner-backed contract, exact schema refs, positive and negative semantic checks and root review; new admission is one family per landing.
  - Registered membership, validator logic, frozen accounting, freeze/closure hashes, Spec Lock, readiness clearance and seal status are unchanged by this decision.
validation_surfaces:
  - Decision Log PlanUnit YAML parsing and exact canonical scope comparison to the pinned manifest
  - Exact response-byte preservation and source SHA-256 checks
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: event_authority_binding_scope_expansion
reasoning_tier: high
context_scope: event_authority_steps_8_9_technical_binding_approval
implementation_surfaces: [Plans/Decision_Log.md, Plans/storage-plan.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: bounded_technical_binding_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - EA-BINDINGS-285-RESPONSE-001
  - call_DvY9cAd5SBCN8ACboljCpno8
  - reports/event-authority-20260911/step-09-binding-authority-scope.json@dc5ba81f422dfe71ecfa69f700d6c774f441b71a
  - reports/event-authority-20260911/step-09-binding-authority-question.md@dc5ba81f422dfe71ecfa69f700d6c774f441b71a
preserved_exact_tokens: ["Approve the bounded proposal", "DL-039", "DL-040", "EA-BINDINGS-285-RESPONSE-001"]
negative_constraints:
  - Do not expand the frozen exact scope through later report edits or claim 285 proven absence findings.
  - Do not invent evidence, borrow sibling bindings, or represent newly authored identifiers as pre-existing definitions.
  - Do not decide feature, integration, retention, deletion or competing-owner questions through this technical approval.
  - Do not bulk admit, re-admit registered families, hardcode a pass, enable runtime or change validators, frozen accounting, clearance or seal state.
owner_hints: [Plans/Decision_Log.md, Plans/storage-plan.md, Plans/Contracts_V0.md]
```

### DL-046 - Bounded Browser Technical Binding Authority And Individual Admission

```yaml
plan_unit_id: DL-046
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared's two exact answers at 2026-09-11T18:26:45.328890Z apply individual Storage
  admission landings and bounded technical binding definition authority to the
  adjacent exact 53-family Browser scope. Browser and Storage owners must first
  search current canonical definitions per family and document existing partial
  contracts and scoped absence before labelling any missing technical binding as
  a new owner definition for already specified behavior. Existing owner-defined
  role, version and scope control reuse. Complete contracts, independent product
  gates, exact schema references, positive/negative semantic checks and root review
  precede each family's own admission landing. Prepared contracts are not admitted.
gui_related: false
gui_classification_reason: Records technical authority and admission constraints without changing presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - The exact canonical 53-name scope matches the pinned proposal and response and is disjoint from DL-045's original 285 families.
  - Each new definition has per-family current-source search, existing-contract citations and scoped negative evidence; neither all-family absence nor sibling-derived authority is presumed.
  - New technical definitions are labelled newly authored and remain limited to already specified behavior.
  - Feature, integration, retention/deletion and competing-owner decisions remain separate and block dependent work when unresolved.
  - Each family has full owner/schema/positive-negative/root review gates and an individual Storage admission landing; preparation alone does not authorize persistence or checkpoint advancement.
  - No binding identifier, event membership, runtime proof, historical accounting, Spec Lock, readiness or seal state changes through this decision.
validation_surfaces:
  - Exact response SHA-256 and scope-name comparison
  - python3 scripts/pm-browser-event-admission.py
  - python3 scripts/pm-plan-index.py validate
risk_class: browser_event_authority_scope_expansion
reasoning_tier: high
context_scope: browser_53_bounded_binding_authority
implementation_surfaces: [Plans/Decision_Log.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
node_compile_hint: {mode: bounded_technical_binding_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - BROWSER-BINDINGS-53-RESPONSE-20260911
  - reports/packet-gap-closure-20260910/browser-binding-authority-proposal-20260911.json
  - reports/packet-gap-closure-20260910/browser-binding-authority-response-20260911.json
preserved_exact_tokens: ["Apply it to the Browser families too", "Approve the bounded Browser permission", "DL-039", "DL-045"]
negative_constraints:
  - Do not expand the frozen 53-family scope or DL-045 membership.
  - Do not infer missing bindings or evidence from sibling names or turn technical permission into product or retention authority.
  - Do not bulk admit, enable runtime, restamp historical evidence or clear readiness/seal gates.
owner_hints: [Plans/Decision_Log.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### DL-047 - Goal Objective And Revision Retention Follows Chat

```yaml
plan_unit_id: DL-047
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: Jared approves retaining GoalRecordV2, current accepted objective, accepted revisions and minimum
  replay lineage with the owning chat, including archived chats. Compaction, restart and model changes do not delete
  that history. Chat deletion immediately hides the content, purges active content within 24 hours and deleted backup
  content within 30 days unless held; a valid hold delays physical purge without restoring ordinary visibility.
  Goal Runtime owns semantics and Storage owns explicit retention, deletion, holds and coherent recovery. Permanent
  content-free audits keep their policies and references without holding or reconstructing deleted Goal text. Referenced
  bodies remain under their independent owners and retention rules.
gui_related: true
gui_classification_reason: The accepted policy determines visibility and availability of Goal history on chat deletion
  and archival.
split_recommended: false
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- The exact affirmative response and frozen card SHA-256 are preserved with genuine question identity and capture
  time.
- Current and superseded accepted Goal objectives and minimum replay lineage remain available while the owning chat
  is retained, including archived chats.
- Compaction, restart and model changes do not purge accepted Goal history.
- Chat deletion immediately hides Goal content and purges active content within 24 hours and backups within 30 days
  unless a valid hold delays physical purge; held deleted content remains ordinarily hidden.
- Permanent content-free audit references do not add a body hold or reconstruct deleted Goal text.
- Attachments, source messages/context, Plans, To-Dos and workflow records/evidence retain their independent owners
  and policies.
- Concrete physical custody, versioned readers/writers, deletion/recovery bindings and semantic verification are
  still required; no event admission or depth/readiness/seal clearance follows from this decision alone.
validation_surfaces:
- Exact approval/card SHA-256 and response preservation
- Decision Log PlanUnit YAML and pre-existing PlanUnit semantic preservation
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: goal_body_retention_and_deletion
reasoning_tier: high
context_scope: accepted_goal_objective_and_revision_chat_retention
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: bounded_retention_policy_approval
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- EA-S08-GOAL-OBJECTIVE-RETENTION-RESPONSE-001
- call_kj3ZG4Ui0TdZN03B95Pwxv36
- reports/event-authority-20260911/step-08-goal-objective-retention-card.md
preserved_exact_tokens:
- 'Approve: retain with the chat (recommended)'
- GoalRecordV2
- EA-S08-GOAL-OBJECTIVE-RETENTION
- 24 hours
- 30 days
negative_constraints:
- Do not retain Goal text independently after chat deletion or let archival/compaction act as deletion.
- Do not restore ordinary visibility merely because a valid hold delays purge.
- Do not extend permanent audit retention to Goal bodies or referenced attachments/workflow evidence.
- Do not infer certification exceptions, event admission, native execution, depth/readiness clearance or governance
  sealing.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
```

### DL-048 - Platform Decision Custody Reference Lifetime

```yaml
plan_unit_id: DL-048
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approves retaining minimal non-secret immutable platform-capability decision custody
  while its original evaluation is pending and while retained referencing events, frozen run
  snapshots or valid owner holds require it. After resolution and the last reference/hold,
  authorized reference-aware cleanup deletes it without an independent grace period.
  This does not extend raw probe logs, provider responses, credentials, account content or
  original transaction/source observation retention, shorten event/snapshot/receipt policies, populate the
  catalog or admit a platform event. Concrete owner/source/storage contracts remain required.
gui_related: false
gui_classification_reason: Defines retained decision evidence lifetime and owner custody, not visual presentation.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Preserve the exact affirmative answer, original question identity and frozen card SHA-256.
  - Pending evaluation and every retained referencing event, frozen run snapshot or valid owner hold protect the minimal decision record.
  - After resolution and the last reference/hold, authorized cleanup checks complete current authority through deletion without a new independent grace period.
  - Raw probe logs, provider responses, credentials, account content and original source controls keep their independent retention and deletion rules.
  - Event, frozen snapshot and append-receipt policies remain unchanged; no capability identity or application evaluation trigger is inferred.
  - Closed physical and semantic contracts, authentic source admission and cleanup/recovery proofs remain required; no native/depth/readiness/seal clearance follows.
validation_surfaces:
  - reports/event-authority-20260911/step-08-platform-lifetime-presentation.json
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: platform_decision_custody_retention_and_cleanup
reasoning_tier: high
context_scope: minimal_platform_decision_reference_lifetime
implementation_surfaces:
  - Plans/newtools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: bounded_retention_policy_approval
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - EA-S08-PLATFORM-CUSTODY-LIFETIME-RESPONSE-001
  - call_1PJzb6orMv2uLdLZYb4jdU1w
  - reports/event-authority-20260911/step-08-platform-lifetime-card.md
preserved_exact_tokens:
  - Approve this reference-based lifetime
  - EA-S08-PLATFORM-CUSTODY-LIFETIME
  - RP-OPERATIONAL-2555D
negative_constraints:
  - Do not retain raw probe/provider/account content or old source controls through decision references.
  - Do not infer app-root indefinite result custody, shorten independent policies, populate the catalog or create a new evaluation trigger.
  - Do not infer event admission, runtime proof, depth/readiness clearance or governance sealing.
owner_hints:
  - Plans/newtools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
```

### DL-049 - Completed Compaction Detail Seven-Day Retention

```yaml
plan_unit_id: DL-049
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Retain completed compaction survivor/removal/translation detail, obsolete historical
  candidate/carrier/publication snapshots and resolved detailed journal/attempt/phase
  records for 604800 seconds after the first durable fully settled original terminal
  result. Unresolved obligations have no expiry anchor. Inclusive expiry never resets
  on read, retry, duplicate result or reference release, and all current source, hold,
  live, backup, rollback, recovery and maintenance protections still block deletion.
  Preserve independent current controls, original receipts/dedupe and minimal terminal
  replay custody. Registered backup copies retain their existing rules. Exact original
  member retirement and policy bindings remain required before use.
gui_related: false
gui_classification_reason: Defines compaction artifact retention and original custody, not visual presentation.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - Preserve Jared's exact Keep for 7 days answer, original question identity and frozen card SHA-256 separately from the earlier recommendation.
  - The first fully settled successful or failed original terminal result anchors inclusive expiry at 604800 seconds; unresolved attempts or event/receipt/result obligations have no expiry anchor.
  - Reads, retries, duplicate results and later reference release never reset the anchor; current membership and all valid holds/references override age eligibility.
  - Only exact eligible completed-detail members may be removed after complete current proof; a journal containing needed members cannot be deleted as a whole.
  - Current source/controls, original receipt/dedupe and compact terminal-result custody preserve their policies; backup copies keep existing retention and hold rules.
  - Concrete policy/schema/codec and original custody/disposal contracts remain required; no quarantine answer, event admission, native proof, depth/readiness or governance clearance follows.
validation_surfaces:
  - reports/event-authority-20260911/step-08-compaction-detail-cleanup-answer.json
  - reports/event-authority-20260911/step-08-compaction-detail-cleanup-presentation.json
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: compaction_detail_retention_and_original_custody
reasoning_tier: high
context_scope: completed_compaction_detail_seven_day_retention
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: bounded_retention_policy_approval
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - EA-S8-COMPACTION-DETAIL-CLEANUP-RESPONSE-001
  - call_gIlL1Kp5idZm1DuOMhSjrLat
  - reports/event-authority-20260911/step-08-compaction-detail-cleanup-card.md
preserved_exact_tokens:
  - Keep for 7 days
  - '604800'
  - EA-S8-COMPACTION-DETAIL-CLEANUP
negative_constraints:
  - Do not expire unresolved obligations or reset the first settlement anchor on retry, read or reference release.
  - Do not shorten independent source/receipt/result or backup policies or infer a quarantine answer.
  - Do not infer event admission, native runtime proof, depth/readiness clearance or governance sealing.
owner_hints:
  - Plans/storage-plan.md
```

### DL-050 - Hosted Repo Requests Route By Selected Adapter

```yaml
plan_unit_id: DL-050
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16 that assistant hosted-repo requests route to the universal Forge
  command families with the provider resolved from the selected repository adapter, and never
  default to GitHub. A provider prefix or a named provider is a provider qualification of the same
  universal command; the assistant discloses the resolved provider, never silently substitutes
  another, and states the mismatch and asks or refuses when the named provider is not the selected
  adapter. Provider-specific families remain only where the Forge owner defines no generic
  equivalent: cmd.github.actions.* for GitHub Actions, and cmd.github.connect and
  cmd.github.disconnect for GitHub device-code connection. Hosted issue work has no registered
  command family and none is invented. The Git versus hosted boundary, cross-domain boundary
  disclosure, and repo/worktree/compare handoff identity are unchanged. Alongside this decision the
  contract-gate canon in ATS-041 drops its stale authored-pair and corpus-census literals and defers
  to the cardinality and counts the checker reports.
gui_related: true
gui_classification_reason: Governs the provider the assistant names and dispatches for visible hosted-repo requests and its disclosure.
split_recommended: false
depends_on: [DL-044, ACD-017]
unblocks: []
acceptance_criteria:
  - Plans/assistant-chat-design.md section 5.3 and ACD-017 route hosted-repo requests to the universal Forge families with the provider resolved from the selected repository adapter and no GitHub default.
  - The provider-specific hosted families are exactly GitHub Actions and GitHub device-code connect and disconnect, each carried by the retained-owner passage in Plans/Forge_Integrations.md.
  - A provider prefix or named provider qualifies the same universal command, the resolved provider is disclosed, and a provider that is not the selected adapter is stated and asked or refused rather than silently substituted.
  - Historical GitHub and Source Control pull-request spellings stay compatibility aliases of the generic review create and merge commands with provider github, with no second handler, guard, or catalog row.
  - The Git versus hosted boundary, the cross-domain boundary disclosure, and the repo/worktree/compare handoff identity fields survive unchanged.
  - ATS-041 carries no literal contract-pair count or corpus census and defers to the cardinality and counts scripts/pm-new-contracts-verify.py reports.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-new-contracts-verify.py
risk_class: assistant_hosted_routing_provider_default_drift
reasoning_tier: high
context_scope: assistant_hosted_repo_routing
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: assistant_hosted_routing_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-050-direction-2026-09-16
  - Plans/Decision_Log.md#DL-044
  - Plans/assistant-chat-design.md#ACD-017
  - Plans/Forge_Integrations.md#FGI-008
  - Plans/UI_Command_Catalog.md#UCC-132
  - Plans/GitLab_Integration.md#GLI-005
  - Plans/Automated_Testing_System.md#ATS-041
preserved_exact_tokens:
  - cmd.forge.review.create
  - cmd.forge.review.merge
  - cmd.github.pr.create
  - cmd.github.actions.*
  - cmd.github.connect
  - cmd.github.disconnect
  - selected_repository_adapter
negative_constraints:
  - Do not default a hosted-repo request to GitHub or treat a provider prefix or provider name as a separate command family.
  - Do not invent a hosted issue command family or any other family the command catalog does not register.
  - Do not weaken the Git versus hosted boundary, the cross-domain disclosure, or the handoff identity fields.
  - Do not restore a literal authored contract-pair count or corpus census to ATS-041.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/assistant-chat-design.md
```

### DL-051 - New Repository Object Format Picker Evidence Gated

```yaml
plan_unit_id: DL-051
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16, answering research finding F110 with "Add the picker as
  described, evidence-gated", that the existing Source Control setup flow offers a choice of
  object format when a new Jujutsu repository is created, shows the discovered effective format
  for repositories that already exist, and disables any choice that current capability evidence
  does not certify. The accepted scope is the proposal's own dependency list: a typed
  new-repository request extension carrying the chosen format, owner-owned format evidence read
  from one place, certified engine, library, transport and provider profiles per format, setup
  and cancellation fixtures, and copy stating that the format is permanent. Exact engine,
  command-line and repository-format qualification with truthful unsupported states is an
  existing prerequisite, not part of this acceptance. The answer changes no default, authorizes
  no cross-format migration, and promises no universal SHA-256 support.
gui_related: true
gui_classification_reason: The accepted capability is a visible setup-flow control, its disabled states, its discovered-format display and its permanence copy.
split_recommended: false
depends_on: [DL-043, SCS-004, SCS-015, JJI-006]
unblocks: []
acceptance_criteria:
  - The choice appears only in the existing Source Control setup flow for a repository being created, and an existing repository shows its discovered effective format with an explicit unknown state rather than a default or a guess.
  - The chosen format travels in a typed new-repository request extension and is never inferred from a display string, a label, or the engine default.
  - Format evidence has one owner and is read from there; per-format engine, library, transport and provider profiles are certified, and an offered choice is disabled by current capability evidence rather than by assumption.
  - Setup and cancellation both carry fixtures, and a cancelled or abandoned setup leaves no chosen format recorded anywhere.
  - The copy states that the object format of a repository is permanent once it is created.
  - No default object format changes, no cross-format migration of an existing repository is planned, and no universal SHA-256 support is claimed.
  - No command, request meaning, handler, event, certified engine version, or runtime capability is admitted by this record, and no WorkNodes, NodeSeeds or build tasks are created.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
risk_class: permanent_repository_format_chosen_without_evidence
reasoning_tier: high
context_scope: new_repository_object_format_selection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/Jujutsu_Integration.md
node_compile_hint:
  mode: optional_capability_acceptance_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json:c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b
  - /mnt/Cursor/PuppetMaster-Evidence/jujutsu-followup-20260911/continuation3/adjudication/sources/premium/J0028-compare/notes.md:469c95597f5d7d498d549b6dd319f98996a354e88a05d771ca17b719a52d9bfe
  - Plans/Decision_Log.md:DL-051-direction-2026-09-16
  - Plans/ledgers/v2/pldg-20260916-002-jujutsu-object-format-picker
preserved_exact_tokens:
  - Add the picker as described, evidence-gated.
  - object format
  - discovered effective format
  - SHA-1
  - SHA-256
negative_constraints:
  - Do not change which object format a new repository gets by default.
  - Do not plan or imply migration of an existing repository from one object format to another.
  - Do not claim that SHA-256 is universally supported by engines, libraries, transports or providers.
  - Do not offer a format choice that current capability evidence does not certify, and do not disable one by assumption instead of by evidence.
  - Do not restate the exact engine, command-line and repository-format qualification requirement; reference its owner.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/Jujutsu_Integration.md
```

### DL-052 - Source Graph Parent Reference Bound Thirty Two With Fetch The Rest

```yaml
plan_unit_id: DL-052
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16, answering the open parent-bound question with "for the parent
  referenced bound, lets do 32 then the ability to fetch the rest", that a node in a source graph
  page declares at most thirty-two parent references. A node with more parents marks its parent
  list truncated and carries a reference through which the remaining parents are fetched by a
  bounded follow-up request. That request is fenced exactly as page continuation is: same
  repository, workspace, backend and projection identity, same projection generation, and the
  same currentness rule, so a stale or superseded page cannot be expanded as current. A node that
  is not truncated carries no expansion reference. The provisional bound of six hundred is
  retired.
gui_related: true
gui_classification_reason: The bound and its truncation marker govern what the virtualized history-and-graph view can render and how honestly it shows an incomplete parent list.
split_recommended: false
depends_on: [SCS-017]
unblocks: []
acceptance_criteria:
  - A source graph node carries at most thirty-two parent references in one page, and the schema enforces that bound.
  - A node whose parents exceed the bound marks its parent list truncated and carries a non-null expansion reference; a node that is not truncated carries none.
  - The bounded fetch-the-rest request binds the same repository, workspace, backend and projection identity and the same projection generation as the page it came from, and is admitted only for a current page, exactly as page continuation is.
  - The retired provisional bound of six hundred appears nowhere as a current value, and the bound is not presented as derived from the 200-node page cap or the 600-edge adjacency cap.
  - Positive and negative fixtures cover the bound, the truncation marker and the expansion request.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
risk_class: unbounded_or_dishonest_parent_adjacency_in_a_bounded_page
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
node_compile_hint:
  mode: owner_bound_specification_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-001
  - reports/jujutsu-research-2026-09-11/continuation3-landing/verification.json
  - Plans/Decision_Log.md:DL-052-direction-2026-09-16
  - Plans/Source_Control_System.md#SCS-017
preserved_exact_tokens:
  - for the parent referenced bound, lets do 32 then the ability to fetch the rest
  - parent_refs
  - parent_refs_truncated
  - parent_expansion_cursor_ref
  - next_cursor_ref
negative_constraints:
  - Do not raise, lower or reinstate the parent bound without a new owner decision.
  - Do not present thirty-two parents as a complete parent list when the node is truncated.
  - Do not let an expansion request read a stale, partial or unavailable page as if it were current.
  - Do not require every parent of a node to appear in the same page; cross-page ancestry stays legitimate.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
```

### DL-053 - Source Graph Node Reference Unique Within A Page

```yaml
plan_unit_id: DL-053
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-16, answering whether an exact duplicate node row should be allowed with "Yes,
  forbid exact duplicates too, fold it in", that a source graph page never emits the same `node_ref`
  twice. Uniqueness within the page is the rule, not merely the absence of a revision conflict: two rows
  that share a `node_ref` are rejected whether or not they agree on `revision_ref`, because a repeated
  reference breaks stable node identity and selection anchoring however alike the rows are. The narrower
  wording, which forbade only rows sharing a reference while naming different revisions, is retired, and
  the contract semantic gate rejects both cases under one rule.
gui_related: true
gui_classification_reason: The rule governs what the virtualized history-and-graph view may render and whether a selection anchor can identify one row.
split_recommended: false
depends_on: [SCS-017, DL-052]
unblocks: []
acceptance_criteria:
  - SCS-017 states that `node_ref` is unique within one page and no longer conditions the rule on differing `revision_ref` values.
  - The `source_control_contracts` branch of the contract semantic gate reports one rule for both cases, and rejects a page that repeats a `node_ref` whether or not the rows agree.
  - Negative fixtures cover both a conflicting-revision duplicate and an exact duplicate row, each structurally valid and each failing for that rule.
  - A page that emits each node once is unaffected, and cross-page repetition of a node between different pages stays legitimate.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
  - python3 -m unittest tests.test_pm_source_control_effects
risk_class: repeated_node_reference_breaks_selection_anchoring
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contract_fixtures.json
  - scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_rule_refinement_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-003
  - Plans/Decision_Log.md:DL-053-direction-2026-09-16
  - Plans/Source_Control_System.md#SCS-017
preserved_exact_tokens:
  - Yes, forbid exact duplicates too, fold it in
  - node_ref
  - revision_ref
  - source_graph_duplicate_node_ref_in_page
negative_constraints:
  - Do not re-narrow the rule to conflicting `revision_ref` values only.
  - Do not treat an exact duplicate node row as harmless because its fields agree.
  - Do not extend the rule across pages; a node may legitimately appear on another page.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
```

### DL-054 - Parent List Truncates Only At The Bound And Expansion Echoes Currentness

```yaml
plan_unit_id: DL-054
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered two review questions about the source graph parent-expansion contract on 2026-09-16
  with "1. no 2. yes 3. ok". A producer may not truncate a node's parent list before it holds all
  thirty-two references, so `parent_refs_truncated=true` always accompanies a full list and a shorter
  list always means the node has no further parents; the schema already enforced this and SCS-017 now
  states it. The parent-expansion request's `projection_currentness` echoes the page's `currentness`
  field for field, gaining the page's `expires_at_utc` as a required field that keeps the page's
  nullable shape, so the freshness horizon is readable from the request alone and the claim that the
  request is fenced exactly as page continuation is becomes literally true. The third answer accepts a
  whitespace-only re-indentation of the fixture entries this work added.
gui_related: true
gui_classification_reason: Both rules govern what the virtualized history-and-graph view may show about an incomplete parent list and how fresh the data behind an expansion is.
split_recommended: false
depends_on: [DL-052, SCS-017]
unblocks: []
acceptance_criteria:
  - SCS-017 states that a parent list is truncated only once it holds all 32 references, so early truncation is not permitted and a short list means the node has no further parents.
  - The parent-expansion request requires `expires_at_utc` in `projection_currentness`, with the same nullable timestamp shape the page's `currentness` uses, and the request's currentness is field-for-field identical to the page's.
  - A positive fixture carries the echoed horizon and matches the page it expands; a negative fixture omitting it is rejected.
  - No schema change was needed for the first answer, because the truncation conditional already required a truncated node to carry the full bound.
  - The fixture re-indentation changes whitespace only and the file parses to an identical document.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-new-contracts-verify.py
  - python3 -m unittest tests.test_pm_source_control_effects
risk_class: incomplete_parent_list_or_unreadable_expansion_freshness
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
node_compile_hint:
  mode: owner_rule_refinement_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-004
  - Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections:q-005
  - Plans/Decision_Log.md:DL-054-direction-2026-09-16
  - Plans/Decision_Log.md#DL-052
  - Plans/Source_Control_System.md#SCS-017
preserved_exact_tokens:
  - 1. no 2. yes 3. ok
  - parent_refs_truncated
  - projection_currentness
  - expires_at_utc
  - observed_at_utc
negative_constraints:
  - Do not permit a producer to truncate a parent list before it holds all 32 references.
  - Do not drop any field of the page's currentness from an expansion request, and do not give the request a currentness shape the page does not have.
  - Do not read a short parent list as possibly incomplete; only the truncation marker means there is more.
  - Do not treat the re-indentation as a content change; the fixture document is identical.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
```

### DL-055 - Plan Layer Seal Is A Production Seal With Repository Gates At Landing

```yaml
plan_unit_id: DL-055
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that a plan-layer seal is a production seal and that the
  repository-wide gates run at landing. A per-plan governance seal runs the fifteen plan-layer
  operations register_owners, index_generate, index_validate, readiness_generate,
  audit_status_generate, audit_status_validate, shards_generate, shards_check, shard_evidence_sync,
  spec_lock_refresh, final_index_validate, readiness_projection_check, spec_lock_verify,
  plan_graph_validate, and evidence_validate, and omits the four repository-wide operations
  run_gates, audit_governance, migration_snapshot, and migration_validate. The seal record carries
  seal_profile plan_layer, omitted_operations naming exactly those four, full_repository_qualified
  false, and repository_gates_status not_run_in_this_seal, so a plan-layer seal never claims
  repository qualification and reports no outcome for an operation it did not run. Every retained
  operation runs the same validator with the same arguments and scope as before. Three of the four omitted
  operations, run_gates, audit_governance, and migration_validate, run when a branch lands on main,
  in the shared checkout after the fast-forward and the shard check and before main is pushed, at a
  measured cost of about ten minutes, read through scripts/pm-landing-check.py, which reports only
  the failures that are new since the recorded baseline reports/landing-checks/baseline.json and the
  failures that name a path the branch touches, and on a nightly schedule from which the baseline is
  refreshed, never per landing; migration_snapshot runs only nightly, in a worktree, by the
  designated Plans agent, because it creates a new tracked run directory; a landing is
  refused when a failure names a file the branch touches, and proceeds with the failures reported
  when every failure names files the branch does not touch; stale governance hashes for the documents
  the branch itself edited are the expected state until the designated reseal and never stop a landing.
gui_related: false
gui_classification_reason: Seal profile composition and repository gate placement are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005, BPM-009]
unblocks: []
acceptance_criteria:
  - BPM-005 states the fifteen plan-layer operations, the four omitted operations, the labelled seal record, that a plan-layer seal never claims repository qualification, and that every retained operation runs unchanged.
  - BPM-009 places run_gates, audit_governance, and migration_validate at landing on main and all four, including migration_snapshot in a worktree, on a nightly schedule, with the landing refusal and reporting rule and the measured cost.
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md carries the repository-wide gates as one step after the fast-forward and the shard check and before the push, states the measured cost, and runs them through scripts/pm-landing-check.py against the recorded baseline.
  - The bootstrap seal prose no longer says that a per-plan seal runs the full gate set, and no passage in Plans says a seal qualifies the repository.
  - No validator, validator argument, or validator scope changes for any retained operation.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-landing-check.py --base origin/main
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: seal_claim_overreach_or_unrun_repository_gates
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/bootstrap/Bootstrap_Design_Brief.md
  - Plans/bootstrap/Codex_Prompts.md
  - AGENTS.md
  - .claude/CLAUDE.md
node_compile_hint:
  mode: governance_seal_profile_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-055-direction-2026-09-17
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - plan_layer
  - seal_profile
  - omitted_operations
  - full_repository_qualified
  - repository_gates_status
  - not_run_in_this_seal
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
negative_constraints:
  - Do not read a plan-layer seal as a full-profile seal or as evidence that the repository-wide gates passed.
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy the landing rule.
  - Do not weaken, reorder, or narrow the scope of any operation the plan-layer profile retains.
  - Do not land a branch whose own files fail a repository-wide gate, and do not fix another thread's files to make one pass.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```

### DL-056 - Conflict And Merge Editors Are Read Only Or Built In On A Jujutsu Workspace

```yaml
plan_unit_id: DL-056
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the continuation-4 conflict and merge editor decision card on 2026-09-17 by taking the
  recommendation, verbatim "Do you recommendations for the choices." `merge_editor_available` is owned by
  Source Control and means that Puppet Master's own built-in structured merge editor is present and usable for
  the selected conflicted file on this exact Host and Environment; it makes no claim about any external tool,
  and the Git conflict-assistant preference that opens an external tool never sets it. On a Jujutsu workspace
  the diff-open, merge-editor-open and Git external-merge-tool preference surfaces are read-only or
  built-in-editor-only, and a control disabled by that scoping carries the typed reason
  `conflict_surface_read_only_on_jujutsu`. The save-back contract for a Jujutsu conflict is deferred until the
  built-in editor's save path is designed. Candidates C4D-04, C4M-03, C4G-02 and C4G-03 are recorded as
  deferred under this decision, not declined; the rule they converged on, that a missing entry is never a write
  instruction, is what the deferred contract must satisfy. Nothing on the Git-adapter side changes and no
  command enters or leaves the frozen Jujutsu inventory.
gui_related: true
gui_classification_reason: The decision determines which conflict and merge controls a person sees enabled on a Jujutsu workspace and what a disabled one says.
split_recommended: false
depends_on: [SCS-015, JJI-005]
unblocks: []
acceptance_criteria:
  - SCS-015 defines `merge_editor_available` as the built-in structured merge editor's availability for the selected file on the exact Host and Environment, and states that no external-tool preference sets it.
  - SCS-015 scopes diff open, merge-editor open and the Git external-merge-tool preference as read-only or built-in-editor-only on a Jujutsu workspace.
  - '`source_control_command_disabled_reason.reason_code` admits `conflict_surface_read_only_on_jujutsu`, with a positive fixture carrying it and a negative fixture rejecting a near-miss code.'
  - The safe next action for that disabled state comes from the existing closed vocabulary and is `inspect`; no new safe-next-action value is introduced.
  - The save-back contract is deferred and the four cluster candidates are recorded as deferred rather than declined.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - Plans/source_control_contracts.schema.json#/$defs/source_control_command_disabled_reason
  - Plans/source_control_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: undefined_merge_editor_availability_or_unsafe_external_write_to_a_jujutsu_workspace
reasoning_tier: high
context_scope: source_control_conflict_and_merge_surfaces
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-006
  - Plans/Decision_Log.md:DL-056-direction-2026-09-17
  - Plans/Source_Control_System.md#SCS-015
preserved_exact_tokens:
  - Do you recommendations for the choices.
  - merge_editor_available
  - conflict_surface_read_only_on_jujutsu
  - inspect
negative_constraints:
  - Do not let any external merge tool write into a Jujutsu workspace through these surfaces.
  - Do not treat `merge_editor_available` as a statement about an external tool.
  - Do not record the deferred save-back candidates as declined.
  - Do not add a conflict-resolution command to the frozen Jujutsu inventory under this decision.
  - Do not change the Git-adapter scoping of the existing conflict-assistant rows.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/UI_Command_Catalog.md
```

### DL-057 - A Bookmark Control Says Which Remotes It Touches Before It Touches Them

```yaml
plan_unit_id: DL-057
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the continuation-4 bookmark control decision card on 2026-09-17 by taking the recommendation,
  verbatim "Do you recommendations for the choices." Source Control owns a bookmark state vocabulary of exactly
  `synced`, `unsynced`, `tracked per remote`, `combined` and `absent`. Every bookmark control and confirmation
  names the remotes it affects before dispatch: untrack on a combined bookmark confirms every remote by name,
  untrack on one unsynced remote confirms that remote, rename on a tracking bookmark discloses that it untracks
  first, and push and fetch say whether they reach all remotes or one. Delete-local and forget-remote never
  share one control. Pseudo-remotes and non-fetchable remotes are not presented as ordinary remotes, and an
  unsynced, untracked or absent reference is never folded silently into a combined chip. The Jujutsu
  confirmation record carries the disclosed remote scope and the exact remote identities it named. This adds no
  command and `forget-remote` stays out of the frozen thirty-one-command inventory.
gui_related: true
gui_classification_reason: The decision determines the words on every bookmark control and confirmation and which remotes a person is told about before dispatch.
split_recommended: false
depends_on: [SCS-005, JJI-003]
unblocks: []
acceptance_criteria:
  - SCS-005 states the five-value bookmark state vocabulary and the disclosure rules for untrack, rename, delete, forget, push and fetch.
  - >-
    The Jujutsu `confirmation` record requires `disclosed_remote_scope` and `disclosed_remote_identity_refs`, and
    the scope constrains the list. `no_remote` names none, `one_remote` names exactly one, and `all_remotes` names at
    least one.
  - Every shipped confirmation fixture carries the disclosure, and three negatives reject an all-remotes confirmation naming none, a one-remote confirmation naming two, and a no-remote confirmation naming one.
  - No command is added; `forget-remote` is not admitted to the frozen inventory by this record.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - Plans/jujutsu_integration_contracts.schema.json#/$defs/confirmation
  - Plans/jujutsu_integration_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: undisclosed_remote_scope_on_a_destructive_bookmark_action
reasoning_tier: high
context_scope: source_control_bookmark_presentation_and_confirmation
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/jujutsu_integration_contracts.schema.json
  - Plans/jujutsu_integration_contract_fixtures.json
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-007
  - Plans/Decision_Log.md:DL-057-direction-2026-09-17
  - Plans/Source_Control_System.md#SCS-005
preserved_exact_tokens:
  - Do you recommendations for the choices.
  - synced
  - unsynced
  - tracked per remote
  - combined
  - absent
  - disclosed_remote_scope
  - disclosed_remote_identity_refs
negative_constraints:
  - Do not present a bookmark control without naming the remotes it affects.
  - Do not share one control between delete-local and forget-remote.
  - Do not fold an unsynced, untracked or absent reference into a combined chip.
  - Do not show a pseudo-remote or a non-fetchable remote as an ordinary remote.
  - Do not add `forget-remote` or any other command to the frozen Jujutsu inventory under this decision.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/UI_Command_Catalog.md
```

### DL-058 - The Seven Shapes The Continuation 4 Corrections Take

```yaml
plan_unit_id: DL-058
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the seven shape questions the continuation-4 candidate adjudication raised on 2026-09-17,
  verbatim and whole "I agree with all 7 of your recommendations. You can do all the next steps. You can use Opus 5
  max for your strong model."; the third sentence is about experiment tooling rather than canon. Restore verification
  depth lands as a JJI-008 rule plus an `object_verification_depth` field on the receipt referencing the Backup
  owner's existing `integrity_verification_level` enum. Divergence lands by appending `divergent` to the frozen
  `graph_states` list, which preserves every existing position, and by minting
  `change_divergent_ambiguous_target` rather than reusing the undefined `invalid_target_identity`. Version
  identity lands as one shared block serving both the closure records and the certification profile, on
  JJI-022's pattern. The machine-local store entry repair lands as three obligations with the enumerated entry
  list carried as an open ledger question. The `jujutsu_integration_contracts` branch of the contract semantic
  gate is authorized for exactly four relational rules and for nothing else under `scripts/`. The two product
  choices are answered separately as DL-056 and DL-057. Candidate C4D-02 stays rejected as inside continuation
  3's marker-only conflict rejection.
gui_related: false
gui_classification_reason: The record settles the machine-contract and validator shape of thirteen corrections; the user-visible halves are carried by DL-056, DL-057 and the owner units the corrections edit.
split_recommended: false
depends_on: [JJI-003, JJI-006, JJI-008, SCS-014, SCS-017]
unblocks: []
acceptance_criteria:
  - Verification depth lands as both a JJI-008 acceptance criterion and a receipt field referencing the Backup owner's `integrity_verification_level` enum, so it is falsifiable by a fixture.
  - '`divergent` is appended to `graph_states` rather than inserted, so every existing frozen position is preserved, and `change_divergent_ambiguous_target` is minted rather than reusing an undefined code.'
  - One `native_toolchain_identity` block serves the closure record, the restore receipt and the effective-capability snapshot.
  - The machine-local entry repair lands three obligations and records the enumerated entry list as an open ledger question rather than inventing it.
  - The semantic gate carries exactly four Jujutsu rules, each with one authored negative fixture, and no other file under `scripts/` is changed by this wave.
  - The two product choices are recorded as DL-056 and DL-057, and candidate C4D-02 remains rejected.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 -m unittest tests.test_pm_jujutsu_closure_semantics
  - python3 -m unittest tests.test_pm_source_control_effects
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: correction_landed_in_a_shape_its_owner_did_not_choose
reasoning_tier: high
context_scope: jujutsu_continuation4_correction_wave
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
  - Plans/jujutsu_integration_contracts.schema.json
  - Plans/source_control_contracts.schema.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/final_gui_interaction_contracts.schema.json
  - scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_rule_refinement_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-001
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-002
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-003
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-004
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-005
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-006
  - Plans/ledgers/v2/pldg-20260917-001-jujutsu-continuation4-corrections:q-007
  - Plans/Decision_Log.md:DL-058-direction-2026-09-17
  - Plans/Decision_Log.md#DL-056
  - Plans/Decision_Log.md#DL-057
preserved_exact_tokens:
  - I agree with all 7 of your recommendations. You can do all the next steps. You can use Opus 5 max for your strong model.
  - object_verification_depth
  - integrity_verification_level
  - change_divergent_ambiguous_target
  - native_toolchain_identity
  - jujutsu_integration_contracts
negative_constraints:
  - Do not add a fifth Jujutsu semantic rule or any other change under scripts/ under this authorization.
  - Do not insert `divergent` into `graph_states` at a position that shifts an existing frozen value.
  - Do not invent the enumerated machine-local entry list before the source audit is done.
  - Do not reopen C4D-02 as a correction.
  - Do not claim runtime, native adapter, security, performance or readiness evidence from these static contracts.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
```

### DL-059 - Branch Policies Are Shown On A Pull Request And The Branch Read Is Deferred

```yaml
plan_unit_id: DL-059
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the first Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". Puppet Master's branch-policy promise is narrowed to what the plans already say: the branch policies
  it shows are the ones evaluated on a pull request. Reading the policies configured on a branch is not offered,
  and the closed forty-three-command forge set gains no command for it. The branch-policy read is deferred rather
  than declined; it is deliberately not planned as a PlanUnit, because its natural home is the gate list DL-062
  establishes and a read command before that region exists would produce rows with nowhere to render.
gui_related: true
gui_classification_reason: The decision settles what a person looking at a branch is told about the gates that will block a merge.
split_recommended: false
depends_on: [ADO-003, ADO-005]
unblocks: []
acceptance_criteria:
  - The Azure owner states that the branch policies Puppet Master shows are the ones evaluated on a pull request, and that reading the policies configured on a branch is not offered.
  - No command is added to the forge command set by this record, and the branch-policy read is recorded as deferred rather than declined.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: unrenderable_branch_policy_promise
reasoning_tier: high
context_scope: azure_devops_branch_policy_scope
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-001
  - Plans/Decision_Log.md:DL-059-direction-2026-09-18
  - Plans/Azure_DevOps_Integration.md#ADO-005
preserved_exact_tokens:
  - agree
  - pull request
  - deferred rather than declined
negative_constraints:
  - Do not add a branch-policy read command under this decision.
  - Do not record the branch-policy read as declined.
  - Do not present branch-scoped policy information that no command reads.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
```

### DL-060 - An Azure Vote Is Bound To The Revision Puppet Master Observed

```yaml
plan_unit_id: DL-060
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the second Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". Azure attaches no revision identity to a vote, so an Azure vote is bound to the provider revision
  Puppet Master read it against, and every surface that shows it states that the binding is observed by Puppet
  Master rather than provider-asserted. A vote observed before a new provider revision is stale against that
  revision and is shown as stale. A vote carrying neither a provider-asserted nor an observation-time binding is
  not shown as current evidence. The alternative, treating Azure votes as never attributable, was rejected
  because it leaves the Azure owner's two vote criteria unmeetable and shows every approval as unbound.
gui_related: true
gui_classification_reason: The label and the staleness state are what a person reads next to an approval before trusting it.
split_recommended: false
depends_on: [ADO-003, FGI-004]
unblocks: [DL-065]
acceptance_criteria:
  - An Azure vote carries the provider revision it was observed against, and the surface states that the binding is observed by Puppet Master rather than provider-asserted.
  - A vote observed against an earlier provider revision is shown as stale against the current one, and a vote with no binding of either kind is not shown as current evidence.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: silently_transferred_approval_evidence
reasoning_tier: high
context_scope: azure_devops_vote_binding
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
  - Plans/Forge_Integrations.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-002
  - Plans/Decision_Log.md:DL-060-direction-2026-09-18
  - Plans/Azure_DevOps_Integration.md#ADO-006
preserved_exact_tokens:
  - agree
  - observed by Puppet Master
  - provider-asserted
negative_constraints:
  - Do not present an observation-time binding as a provider assertion.
  - Do not show a vote with no binding as current evidence.
  - Do not carry a vote across a new provider revision without restating its staleness.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
  - Plans/Forge_Integrations.md
```

### DL-061 - The Checks View Leads With Evaluations And Separates Unwatched Statuses

```yaml
plan_unit_id: DL-061
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the third Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". On Azure the checks view leads with policy evaluations, the list that agrees with what the provider
  will enforce, and shows any status check no policy watches in a separate informational group that is never
  presented as a gate. One check never appears twice. The single joined list is the stated end state and is
  reached only once a documented key between a status check and the policy that watches it is established and
  recorded as evidence; until then the two-group form is the shipped form and the absence of the key is stated
  rather than worked around.
gui_related: true
gui_classification_reason: The decision settles what the checks region contains, in what order, and what is presented as a gate rather than as information.
split_recommended: false
depends_on: [ADO-003, FGI-005]
unblocks: [DL-062]
acceptance_criteria:
  - Policy evaluations are the primary list; a status check no policy watches appears in a separate informational group and is not presented as a gate.
  - One provider check never appears in both groups at once.
  - The joined single list is admitted only on a documented and evidence-bearing key between a status check and the policy that watches it; without that key the two-group form stands and the missing key is stated.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicated_or_unenforced_check_presentation
reasoning_tier: high
context_scope: azure_devops_checks_view_composition
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-003
  - Plans/Decision_Log.md:DL-061-direction-2026-09-18
  - Plans/Azure_DevOps_Integration.md#ADO-007
preserved_exact_tokens:
  - agree
  - policy evaluations
  - status check
  - informational
negative_constraints:
  - Do not show one provider check in both groups at once.
  - Do not present an unwatched status check as a gate.
  - Do not join the two lists on an undocumented or inferred key.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Azure_DevOps_Integration.md
```

### DL-062 - One Gate List With A Source Column And An Enforcement Column

```yaml
plan_unit_id: DL-062
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the fourth Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". Source Control's current checks region stays one region and becomes one gate list. Every row declares
  the provider surface it came from and its enforcement, which is required, advisory, not enforced or unknown, so
  the question "what blocks this merge" is answered in one place. No provider-neutral policies region is added
  and no new section vocabulary is introduced, which is what Source Control's own rule against section
  proliferation asks for. The final interface specification carries the same two columns.
gui_related: true
gui_classification_reason: The decision settles the columns and the region a person reads to find what will block a merge.
split_recommended: false
depends_on: [SCS-005, ADO-005]
unblocks: [DL-059]
acceptance_criteria:
  - The current checks region is one gate list whose rows each carry a source and an enforcement value; no second policies region is added.
  - Enforcement is stated rather than inferred, and a row whose enforcement the provider does not publish reads unknown rather than required or advisory.
  - Source Control and the final interface specification name the same two columns.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: section_proliferation_or_unstated_enforcement
reasoning_tier: high
context_scope: source_control_gate_list_presentation
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-004
  - Plans/Decision_Log.md:DL-062-direction-2026-09-18
  - Plans/Source_Control_System.md#SCS-023
  - Plans/FinalGUISpec.md#F3-561
preserved_exact_tokens:
  - agree
  - current checks
  - gate list
  - enforcement
negative_constraints:
  - Do not add a second policies region or new section vocabulary under this decision.
  - Do not infer an enforcement value the provider does not publish.
  - Do not let the two consumer owners name different columns.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Source_Control_System.md
  - Plans/FinalGUISpec.md
```

### DL-063 - The Merge Command Gains A Typed Strategy Field That Is Always Shown

```yaml
plan_unit_id: DL-063
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the fifth Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". The forge merge request carries one provider-neutral typed merge strategy field. It defaults to the
  provider's own default rather than to a Puppet Master preference, and it is always shown before the merge,
  including when it is the default, because a strategy visible only when changed is a strategy nobody reads.
  Where the effective policy permits only some strategies the forbidden ones are not offered, and a completion
  the policy forbids is refused before the request rather than reported after it. This is the capability half of
  the TA-035 correction, whose prose half states that on Azure an omitted strategy silently selects
  no-fast-forward.
gui_related: true
gui_classification_reason: The strategy is a control a person sets and reads before the one action they cannot undo cheaply.
split_recommended: false
depends_on: [FGI-010, ADO-003]
unblocks: []
acceptance_criteria:
  - The merge request carries one typed provider-neutral merge strategy field whose default is the provider's own default.
  - The strategy is shown before every merge, including when it is the default.
  - A strategy the effective policy forbids is not offered, and a completion naming one is refused before the request rather than reported after it.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: implicit_merge_strategy_selection
reasoning_tier: high
context_scope: forge_merge_strategy
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-005
  - Plans/Decision_Log.md:DL-063-direction-2026-09-18
  - Plans/Forge_Integrations.md#FGI-018
preserved_exact_tokens:
  - agree
  - merge strategy
  - no-fast-forward
  - the provider's own default
negative_constraints:
  - Do not hide the strategy when it is the default.
  - Do not default the strategy to a Puppet Master preference rather than the provider's own default.
  - Do not offer a strategy the effective policy forbids.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
```

### DL-064 - A Requeue Command Disabled With A Typed Reason Where There Is No Equivalent

```yaml
plan_unit_id: DL-064
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the sixth Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". A command that re-runs a policy evaluation is planned. Where the provider has no equivalent it is
  disabled with a typed reason and never hidden. Where the provider would accept a requeue that does nothing,
  because the evaluation is not a build policy, it is refused with a typed reason rather than reported as
  success. Where it would cancel a build already running for that policy, the confirmation discloses the
  cancellation and names the policy before dispatch, as an effect on a third object rather than a discovery
  afterwards. The command follows DL-061, because the interface must settle what an evaluation is before a
  control can re-run one.
gui_related: true
gui_classification_reason: The control, its disabled reason and its confirmation copy are what a person sees when a gate has failed for a transient reason.
split_recommended: false
depends_on: [FGI-005, ADO-004]
unblocks: []
acceptance_criteria:
  - The requeue command is disabled with a typed reason, never hidden, where the provider has no equivalent.
  - A requeue that the provider would accept but not act on is refused with a typed reason rather than reported as success.
  - A requeue that cancels a build already running discloses the cancellation and names the policy in the confirmation before dispatch.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: silent_no_op_or_undisclosed_build_cancellation
reasoning_tier: high
context_scope: forge_policy_evaluation_requeue
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-006
  - Plans/Decision_Log.md:DL-064-direction-2026-09-18
  - Plans/Forge_Integrations.md#FGI-019
preserved_exact_tokens:
  - agree
  - requeue
  - build policy
  - typed reason
negative_constraints:
  - Do not hide the control where the provider has no equivalent.
  - Do not report a requeue that does nothing as success.
  - Do not cancel a running build without disclosing it in the confirmation first.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
```

### DL-065 - A Provider Neutral Vote And Reviewer Carrier Bound The Way DL-060 Binds

```yaml
plan_unit_id: DL-065
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the seventh Azure DevOps decision card on 2026-09-18 by taking the recommendation, verbatim
  "agree". A provider-neutral vote and reviewer carrier is planned in the common forge contracts. It holds the
  reviewer identity, the vote value from one closed vocabulary, whether that reviewer is required, and the
  revision the vote is bound to together with how that binding was established. The binding rule is DL-060's: a
  provider-asserted binding where the provider supplies one, and an observation-time binding labelled as
  observed by Puppet Master where it does not. A vote with neither binding is not shown as current evidence. The
  carrier is what lets the Azure owner's two vote acceptance criteria be restated as promises a shape can keep,
  rather than removed.
gui_related: true
gui_classification_reason: Reviewer state, the vote value and the required marker are what a review view shows about who has approved what.
split_recommended: false
depends_on: [FGI-004, DL-060]
unblocks: []
acceptance_criteria:
  - The carrier holds reviewer identity, a vote value from one closed vocabulary, a required-reviewer flag, the bound revision and the binding kind.
  - The binding kind is provider-asserted or observed by Puppet Master, following DL-060, and a vote with neither is not shown as current evidence.
  - The carrier is provider-neutral and is exercised by a fixture for more than one provider before it is claimed as common.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: unbindable_vote_promise
reasoning_tier: high
context_scope: forge_vote_and_reviewer_carrier
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
  - Plans/Azure_DevOps_Integration.md
node_compile_hint:
  mode: owner_product_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-007
  - Plans/Decision_Log.md:DL-065-direction-2026-09-18
  - Plans/Decision_Log.md#DL-060
  - Plans/Forge_Integrations.md#FGI-020
preserved_exact_tokens:
  - agree
  - vote value
  - required reviewer
  - observed by Puppet Master
negative_constraints:
  - Do not add a vote carrier that only one provider can populate.
  - Do not show a vote with no binding of either kind as current evidence.
  - Do not restore the Azure vote criteria before the carrier exists.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Forge_Integrations.md
  - Plans/Azure_DevOps_Integration.md
```

### DL-066 - Plan Seal Acceptance Is Bounded By One Review And One Repair Round

```yaml
plan_unit_id: DL-066
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that acceptance of a plan seal is bounded. A seal is accepted when
  the deterministic checks pass, one scoped review has run, one bounded repair round has addressed
  that review's blocking findings with a further seal, and a re-review limited to the rows the
  repair affected finds no blocking finding. The scoped review reads the rows the work under review
  touched together with the canon needed to judge them, not the whole document. The repair round is
  one round: it works from the findings that review produced, and a finding raised later belongs to
  a later review. The affected-rows re-review checks that the repair repaired what it claimed and
  broke nothing beside it; it is not a fresh reading of the plan. Findings that remain after that
  point are recorded as open questions on the plan, each carrying its severity and its citations,
  and they do not block acceptance unless a later review raises one of them to blocking. Acceptance
  never requires a review that returns no findings, never proceeds on a review whose blocking
  findings were not repaired and re-reviewed, and never omits a remaining finding from the plan.
gui_related: false
gui_classification_reason: Seal acceptance and review bounding are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [PWIZ-006, PWIZ-011, PWIZ-028]
unblocks: []
acceptance_criteria:
  - PWIZ-028 states the four acceptance conditions in order, the open-question disposition for remaining findings, and the escalation path by which a later review may raise an open question to blocking.
  - PWIZ-006 and PWIZ-011 carry the bound, so no reader of the topic audit loop or the final audit loop can read either as repairing and re-reviewing until a review returns no findings.
  - The bootstrap seal and audit prose in Plans/bootstrap/Bootstrap_Planning_Workflow.md states the same bound and the same open-question disposition.
  - A seal whose review raised blocking findings is not accepted until those findings were repaired in one bounded round, sealed again, and re-reviewed over the affected rows.
  - Every finding remaining at acceptance appears on the plan as an open question with its severity and citations.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Manual review of Plans/Planning_Wizard.md PWIZ-006, PWIZ-011, and PWIZ-028 against this record.
risk_class: unbounded_review_loop_or_suppressed_finding
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
node_compile_hint:
  mode: seal_acceptance_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-066-direction-2026-09-17
  - Plans/Planning_Wizard.md#PWIZ-006
  - Plans/Planning_Wizard.md#PWIZ-011
  - Plans/Planning_Wizard.md#PWIZ-028
preserved_exact_tokens:
  - deterministic checks
  - scoped review
  - bounded repair round
  - affected rows
  - open questions
  - blocking finding
negative_constraints:
  - Do not accept a seal on a review whose blocking findings were not repaired and re-reviewed.
  - Do not withhold a recorded open question from the plan.
  - Do not require a review that returns no findings before a seal may be accepted.
  - Do not widen the affected-rows re-review into a fresh review of the whole plan.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
```

### DL-067 - Landing Checks Report Only Failures New Since A Recorded Baseline

```yaml
plan_unit_id: DL-067
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that the three read-only repository-wide checks at landing report
  only what is new or what is on the branch. Each run still executes run_gates, audit_governance
  and migration_validate in full. Every failure becomes a stable key of check, sub-check, error
  kind, path, and a digest of the failure's remaining fields once timestamps, hash values, the
  absolute path of the checkout it ran in, and the measured actual and expected values are removed.
  A landing run reports two sets and nothing else: failures whose key is not in the recorded
  baseline or whose check's failure count rose above the baseline count, and failures that name a
  path the branch changed whether or not they are new. Because run_gates prints only fifty failures
  per sub-check and audit_governance only a hundred while reporting the true total, per-sub-check
  totals are compared as well, and a rise in a truncated sub-check is reported and stops the
  landing, since what was added cannot be matched against the branch's paths. The check runs after
  the fast-forward and the shard check and before main is pushed, because the branch is measured by
  its diff against main and that diff is empty once main is pushed. Outcomes are graded: nothing to
  report; nothing that stops the landing, being governance staleness on files the branch edited or
  new failures naming none of the branch's files, which are pushed and reported; something that
  stops the landing, being a non-staleness failure on the branch's own files, a grown bucket whose
  error kind is not staleness, or a rise in a truncated sub-check; and failing to run at all, which
  is not success. The baseline is a full run against main recorded in a full checkout and committed
  with the commit it was taken at, refreshed on a nightly run beside the migration snapshot by the
  designated Plans agent whether or not anything landed, and never refreshed to make a landing pass.
  The measured basis is two landings of 2026-09-17 that took fourteen minutes twelve seconds and
  fifteen minutes sixteen seconds and produced identical failure sets of twenty-five failing
  sub-checks and two hundred twenty-eight failures, none of which belonged to either branch. The
  command, its baseline file and the landing-procedure text are carried by the branch that
  implements this decision, which owns scripts/pm-landing-check.py and
  reports/landing-checks/baseline.json.
gui_related: false
gui_classification_reason: Landing check reporting and baseline placement are repository governance procedure, not GUI behavior.
split_recommended: false
depends_on: [BPM-009, DL-055]
unblocks: []
acceptance_criteria:
  - BPM-009 states the two reported sets, the stable failure key, the per-sub-check total comparison, the nightly baseline refresh, and the graded outcomes.
  - The landing procedure invokes scripts/pm-landing-check.py against the branch's base rather than the three commands separately, and runs before main is pushed.
  - The recorded baseline lives at reports/landing-checks/baseline.json, taken from a full run against main in a full checkout and committed with the commit it was taken at.
  - A rise in a sub-check whose failures are truncated is reported and stops the landing, because the on-branch match cannot see what was added.
  - The stale-hash carve-out survives the change and still applies to anything the comparison surfaces on the branch's own documents.
  - All three checks still run in full at landing, so the change alters what is read and not what is checked.
  - The nightly run refreshes the baseline against main independently of whether anything landed.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-landing-check.py --record-baseline
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: landing_signal_lost_in_preexisting_failures
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: landing_baseline_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-067-direction-2026-09-17
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_validate
  - reports/landing-checks/baseline.json
  - scripts/pm-landing-check.py
negative_constraints:
  - Do not narrow, skip or shorten any of the three checks in order to make a landing faster; only the reporting changes.
  - Do not stop a landing on a failure that is already in the baseline and whose count has not risen.
  - Do not treat an empty or missing baseline as an empty failure set.
  - Do not refresh the baseline to make a landing pass.
  - Do not let the nightly baseline refresh lapse and then read a stale baseline as current.
  - Do not run the landing check after main is pushed, when the branch diff it measures is already empty.
  - Do not repair or commit another thread's files to make a check pass at landing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```

### DL-068 - Quarantine Cleanup Keeps Only The Existing Audit Trail

```yaml
plan_unit_id: DL-068
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on 2026-09-23: after eligible quarantine cleanup,
  keep only the existing audit trail. Raw content is removed when the item is resolved,
  its Q policy permits cleanup and every hold and dependency allows it; the custody
  manifest, operation journal and operational quarantine index keep custody until the
  actual authorized purge, its purged event and first AppendReceipt settle and every
  real dependency is released, then retire. The existing indefinite audit event,
  original shared receipt and identity/dedupe custody keep their own policies, and a
  later audit reports Source evidence unavailable.
gui_related: false
gui_classification_reason: Defines quarantine record disposal and audit evidence, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - storage-plan Case L-3 states the operational-index disposal boundary with a DL-068 citation.
  - Raw content removal waits for resolution, Q-policy eligibility and every hold and dependency.
  - Manifest, journal and operational index retire only after the actual purge, its event and first AppendReceipt settle and every real dependency is released.
  - The existing audit event, shared receipt and identity/dedupe custody keep their own policies; no new quarantine audit record is created.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: quarantine_disposal_boundary_drift
reasoning_tier: high
context_scope: quarantine_cleanup_remainder
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-quarantine-cleanup-card.md
preserved_exact_tokens:
  - "Approve"
  - "Source evidence unavailable"
  - "AppendReceipt"
negative_constraints:
  - Do not treat this as purge authority or change any TTL, anchor, cap, overflow, hold, eligibility or lifecycle edge.
  - Do not delete a live, unresolved or still-needed quarantine index.
  - Do not create a new quarantine audit record or event family.
owner_hints:
  - Plans/storage-plan.md
```

### DL-069 - SafePoint Summary Retention Clock Starts At First Durable Publication

```yaml
plan_unit_id: DL-069
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on EA-S8-SAFEPOINT-SUMMARY-CLOCK-001 on 2026-09-23:
  the retained SafePoint hash summary is kept for 365 days after its first successful
  durable publication. Preparation, retries, recovery and re-observation never start or
  reset that anchor; existing holds and dependencies still override age eligibility;
  the 90-day full-SafePoint minimum is unchanged.
gui_related: false
gui_classification_reason: Defines a retention anchor, not visual presentation.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - The storage-plan retention table and anchor rule name the first durable publication anchor with a DL-069 citation.
  - Retries and recovery never reset the anchor; holds still block cleanup.
  - The 90-day full-SafePoint minimum and existing policy objects are unchanged.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: safepoint_summary_retention_anchor_drift
reasoning_tier: high
context_scope: safepoint_summary_clock
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-safe-point-summary-clock-card.md
preserved_exact_tokens:
  - "EA-S8-SAFEPOINT-SUMMARY-CLOCK-001"
  - "365 days"
  - "first successful durable publication"
negative_constraints:
  - Do not anchor the summary clock on hold release or reset it on retry or recovery.
  - Do not admit an event or physical family from this decision.
owner_hints:
  - Plans/storage-plan.md
```

### DL-070 - Moving The Last Terminal Workgroup Leaves The Old Section Empty

```yaml
plan_unit_id: DL-070
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option 1) on EA-S8-TERMINAL-MOVE-SOURCE-001 on 2026-09-23:
  after the last workgroup moves out, the old terminal section stays empty and reusable
  with its guidance state. The move creates no replacement workgroup and opens no new
  terminal session; creating one there is a separate action. The FinalGUISpec
  2026-08-13 move reseed is retired, so source_reseeded is always false for a move.
  Reset and boot recovery reconstitution are unchanged and gain no creation authority.
gui_related: true
gui_classification_reason: Defines the user-visible terminal section state after a workgroup move.
split_recommended: false
depends_on: [DL-039, DL-045, SMPFS-138]
unblocks: []
acceptance_criteria:
  - SMPFS-138 states that the move does not reseed the vacated section, with a DL-070 citation.
  - FinalGUISpec carries a dated DL-070 amendment retiring the move reseed; reset text is unchanged.
  - The GUI rebuild checklist and plans index note the retirement.
  - Retiring the source_reseeded field and aligning the PM7 concept's move behavior remain open follow-ups for their owners.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_move_empty_section_drift
reasoning_tier: high
context_scope: terminal_move_vacated_section
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-terminal-move-source-card-20260921.md
preserved_exact_tokens:
  - "EA-S8-TERMINAL-MOVE-SOURCE-001"
  - "source_reseeded"
negative_constraints:
  - Do not reseed a vacated section or start a new terminal session as part of a move.
  - Do not grant reset or recovery new creation authority from this answer.
owner_hints:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/00-plans-index.md
```

### DL-071 - Account Switch History Uses The Existing Switch Record

```yaml
plan_unit_id: DL-071
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve on EA-S08C-ACCOUNT on 2026-09-23: current feature summaries
  use the existing durable account_switch_event record and the separate
  account.switched event-name requirement is retired as summary vocabulary, with no
  migration alias and no second history stream.
gui_related: false
gui_classification_reason: Corrects runtime history vocabulary in summaries, not visual presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - feature-list and Run_Graph_View summaries name account_switch_event and retire account.switched with a DL-071 citation.
  - No alias, migration or second history stream is created.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: account_switch_vocabulary_drift
reasoning_tier: high
context_scope: account_switch_history_name
implementation_surfaces:
  - Plans/feature-list.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-ambiguous-cards.md
preserved_exact_tokens:
  - "EA-S08C-ACCOUNT"
  - "account_switch_event"
  - "account.switched"
negative_constraints:
  - Do not create an account.switched alias or a second switch-history stream.
  - Do not normalize historical bytes without separate evidence.
owner_hints:
  - Plans/feature-list.md
  - Plans/Run_Graph_View.md
```

### DL-072 - Continuation Suppression Diagnostic Stays Transient

```yaml
plan_unit_id: DL-072
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve on EA-S08C-CONTINUE on 2026-09-23:
  diag.synthetic_continue_loop_prevented remains a transient diagnostic, not a
  persisted EventRecord family. The visible suppression reason and existing failure or
  rotation handling are preserved; a replayable history would need its own full event
  contract.
gui_related: false
gui_classification_reason: Sets an event persistence boundary, not visual presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - Prompt_Pipeline loop-prevention rules state the transient boundary with a DL-072 citation.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: diagnostic_persistence_boundary_drift
reasoning_tier: high
context_scope: continue_suppression_diagnostic
implementation_surfaces:
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-ambiguous-cards.md
preserved_exact_tokens:
  - "EA-S08C-CONTINUE"
  - "diag.synthetic_continue_loop_prevented"
negative_constraints:
  - Do not persist this diagnostic as an EventRecord family without a full event contract.
owner_hints:
  - Plans/Prompt_Pipeline.md
```

### DL-073 - Doctor Media Check Result Stays Check Output

```yaml
plan_unit_id: DL-073
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve on EA-S08C-DOCTOR on 2026-09-23: doctor.evidence_media.checked
  remains check output associated with its evidence artifacts, not a separately
  persisted EventRecord family. Existing artifact retention is unchanged.
gui_related: false
gui_classification_reason: Sets an event persistence boundary, not visual presentation.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - newtools Doctor evidence-media output step states the check-output boundary with a DL-073 citation.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: diagnostic_persistence_boundary_drift
reasoning_tier: high
context_scope: doctor_media_check_output
implementation_surfaces:
  - Plans/newtools.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-08-ambiguous-cards.md
preserved_exact_tokens:
  - "EA-S08C-DOCTOR"
  - "doctor.evidence_media.checked"
negative_constraints:
  - Do not persist this check result as an EventRecord family or infer a new retention duration.
owner_hints:
  - Plans/newtools.md
```

### DL-074 - Task Failure Is A Presentation Notification Over Child Run History

```yaml
plan_unit_id: DL-074
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on EA-S09-EXEC-TASK-FAILURE on 2026-09-23:
  task.failed is a presentation notification over canonical child-run records, not a
  separately persisted EventRecord family and not an alias of subagent.failed. Visible
  error detail, canonical child lifecycle, parent-owned retries, timeout distinctions
  and audit attribution are preserved.
gui_related: false
gui_classification_reason: Sets an event persistence boundary; chat card presentation is unchanged.
split_recommended: false
depends_on: [DL-039]
unblocks: []
acceptance_criteria:
  - assistant-chat-design states the non-persisted notification rule with a DL-074 citation.
  - Canonical child-run history and visible error detail are preserved.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: task_failure_persistence_boundary_drift
reasoning_tier: high
context_scope: task_failure_notification
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-09-execution-cards.md
preserved_exact_tokens:
  - "EA-S09-EXEC-TASK-FAILURE"
  - "task.failed"
  - "subagent.failed"
negative_constraints:
  - Do not alias task.failed to subagent.failed.
  - Do not delete child-run history or change any registered family.
owner_hints:
  - Plans/assistant-chat-design.md
```

### DL-075 - Runtime Artifact Event Histories Are Kept Indefinitely

```yaml
plan_unit_id: DL-075
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered Approve (option A) on EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION on
  2026-09-23: the 19 runtime_artifact.* event histories are assigned
  RP-AUTHORITY-INDEFINITE for the time their full contracts are admitted. This is
  retention only: no family is registered, no binding defined, no schema made complete.
  Embedded event text is retained with the event, and each full contract must make that
  and any applicable deletion requirement explicit before admission. Artifact bodies,
  original receipts, restore points, Usage and source records keep their own policies.
gui_related: false
gui_classification_reason: Assigns event retention, not visual presentation.
split_recommended: false
depends_on: [DL-039, DL-045]
unblocks: []
acceptance_criteria:
  - Runtime_Artifacts_Panel and storage-plan Case L-3 record the RP-AUTHORITY-INDEFINITE assignment for the 19 families with a DL-075 citation.
  - No family is admitted and no binding, schema completion or runtime authority follows.
  - Each full contract makes embedded-text retention and applicable deletion requirements explicit before admission.
validation_surfaces:
  - reports/event-authority-20260911/decision-responses.jsonl
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_artifact_retention_assignment_drift
reasoning_tier: high
context_scope: runtime_artifact_event_retention
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260923/ANSWERS.md
  - reports/event-authority-20260911/step-09-runtime-artifact-retention-card.md
preserved_exact_tokens:
  - "EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION"
  - "RP-AUTHORITY-INDEFINITE"
  - "runtime_artifact.*"
negative_constraints:
  - Do not treat the retention assignment as admission, binding or schema completion.
  - Do not let event retention grant access to a linked artifact body or override an applicable deletion requirement.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```

### DL-076 - Storage Wrapper Digest Recipe And Durable Read Token Without Snapshot Id

```yaml
plan_unit_id: DL-076
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared, by delegation to the coordinator, decided two Storage owner questions on
  2026-09-24. Each whole_wrapper_sha256 in the SP-310 physical profile declaration is
  the SHA-256 of the resolved wrapper definition written as two-space indented JSON
  with keys in document order and one final LF; SP-310 states the recipe and readiness
  checks it. A stored SP-278 read token is the nine-field durable token
  (DurableGenericToken) without redb_snapshot_id. The four filtered checkpoints that
  stored the whole token store the durable token, every read joins the snapshot id of
  its own live read, and SP-311's never-persist rule stays whole.
gui_related: false
gui_classification_reason: Decides Storage digest and persisted-token rules, not visual presentation.
split_recommended: false
depends_on: [DL-045, DL-046]
unblocks: []
acceptance_criteria:
  - SP-310 states the whole_wrapper_sha256 recipe with a DL-076 citation, and readiness rejects a member whose declared digest differs from the recomputed one.
  - SP-278 defines the nine-field durable read token; SP-282, SP-270, SP-273 and SP-275 store it, and no stored value holds redb_snapshot_id.
  - Readiness rejects any redb_snapshot_id property that a stored value could hold, with positive and negative self-tests.
  - Plans/event_record_index_checkpoint.schema.json, the frozen Home2 reader schema and SP-311's text are unchanged.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 -m unittest tests.test_pm_runtime_vocabulary_migration tests.test_pm_browser_workspace_reset
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_digest_recipe_or_persisted_live_fence_drift
reasoning_tier: high
context_scope: storage_owner_closeout_20260924
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/storage-registry-repairs-20260923/REPORT.md
  - reports/storage-owner-closeout-20260924/REPORT.md
  - reports/event-authority-20260911/step-08-goal-workflow-coordinator-checks.json
preserved_exact_tokens:
  - "whole_wrapper_sha256"
  - "redb_snapshot_id"
  - "DurableGenericToken"
negative_constraints:
  - Do not persist or manufacture a redb snapshot id in any stored value.
  - Do not change Plans/event_record_index_checkpoint.schema.json or the frozen Home2 reader schema for this decision.
  - Do not treat the wrapper digest as a stored-value hash or as the pm.goal.cancel_command_json.v1 codec.
owner_hints:
  - Plans/storage-plan.md
```

### DL-001 - Decision Log Source-Preserving Bridge Retired

```yaml
plan_unit_id: DL-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The former Decision Log source-preserving bridge is retired in place after
  Phase 2B atomized or structurally dispositioned Decision_Log-S0001 through
  Decision_Log-S0026 into DL-002 through DL-026 or explicit structural coverage.
  DL-001 remains only as migration lineage for the retired bridge span and must
  not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DL-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by DL-002 through DL-026 and structural coverage_map dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 043 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Log-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Log-S0022
preserved_exact_tokens:
- DL-001
- source_preserving_planunit
- DL-002
- DL-026
- Decision Log
- Purpose
- Entries
- 'DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems'
- 'DL-002: Section numbering shift in OpenCode_Deep_Extraction.md'
- 'DL-003: Orchestrator execution model'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md'
- 'DL-004: Governance split'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'DL-005: Completion and promotion model'
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md'
- 'DL-006: Weak integration'
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Glossary.md'
- 'DL-007: Corroboration threshold'
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md'
- 'DL-008: Graph patch lineage'
- 'ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md'
- 'DL-009: Source Control boundary'
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md'
- 'DL-010: Shared runtime identity'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md'
- 'DL-011: Blocked approval identity'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md'
- 'DL-012: Navigation primitives'
negative_constraints:
- "Do not remap atomized Decision_Log spans back to DL-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
- 'Decision_Log is a human-authored decision ledger, not a derived decision log. `Plans/auto_decisions.jsonl` is pipeline-managed and must not be hand-edited here; `Plans/.pipeline/research_packet.json` (`/.pipeline/research_packet.json`) is regenerated after owner/consumer reconciliation and must not '
- Section-number drift in the extraction source must not become canonical drift in local SSOT docs.
- 'The shared provider-runtime contract applies beyond Orchestrator: `Multi-Account.md` governs assistant, interviewer, requirements builder, PRD builder, overseers, node workers, and provider-backed chat/tool turns. Requested and effective `/model/effort/persona/auth/account`, `/effective` identity, p'
- 'Supporting planning machinery is not exempt from decision traceability: `Plans/sharding_config.json` (`/sharding_config.json`) and `Plans/auto_decisions.jsonl` (`/auto_decisions.jsonl`) must not disagree on fallback `chunk-line` settings, because `/decision` state drift in support files can still co'
- Canonical copy favors precise runtime and user-facing labels. Object/action labels include `Seams`, `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, `Locally Complete`, `Seam Complete`, `Completion Blocked`, `Weak Integration`, `Promotion Blocked`, `Promotion Revoked`, `Corrobora
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to DL-001 remain auditable."
- Worktree and graph approval identity must stop hanging on `tier_id`, request-centric `HITL`, or `request_id` payloads once blocked-episode runtime identity is available. Replace graph HITL command payload identity with blocked-episode anchored identity while preserving `Contracts_V0.md` / `Contracts
- Lane cleanup may transition into `retained` instead of immediate cleanup when recent completion is pending review or `/promotion`, weak integration remains under investigation, unresolved concern or corroboration is tied to lane outputs, or manual operator retention is active.
stale_retired_dispositions: []
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'Decision_Log is a human-authored decision ledger, not a derived decision log. `Plans/auto_decisions.jsonl` is pipeline-managed and must not be hand-edited here; `Plans/.pipeline/research_packet.json` (`/.pipeline/research_packet.json`) is regenerated after owner/consumer reconciliation and must not '
- '### DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems'
- The mapping captured in `OpenCode_Deep_Extraction.md` remains a reference aid, but local canonical contracts still control final ownership in Puppet Master.
- Section-number drift in the extraction source must not become canonical drift in local SSOT docs.
- The canonical orchestration model is the node graph. `Feature Seam` and `Work Package` are first-class graph-owned objects, and `Node` remains the smallest executable unit.
- '`Package Overseer` and `Seam Overseer` are distinct governance roles. Runtime remains the canonical owner of readiness, blockers, transitions, retries, and dispatch.'
- '### DL-009: Source Control boundary'
- Blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?` supersede request-centric HITL identity as canonical runtime approval scope.
- '`route_target` is the canonical navigation contract. `OpenSubject` is the canonical identity-native source-open contract. `resume_url` is serialized transport only.'
- 'Supporting planning machinery is not exempt from decision traceability: `Plans/sharding_config.json` (`/sharding_config.json`) and `Plans/auto_decisions.jsonl` (`/auto_decisions.jsonl`) must not disagree on fallback `chunk-line` settings, because `/decision` state drift in support files can still co'
- Canonical copy favors precise runtime and user-facing labels. Object/action labels include `Seams`, `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, `Locally Complete`, `Seam Complete`, `Completion Blocked`, `Weak Integration`, `Promotion Blocked`, `Promotion Revoked`, `Corrobora
- 'Governance semantics stay graph-owned: a `run` is the full canonical graph under deterministic runtime control, a `work package` is a coherent precomputed subgraph with a local overseer, a `feature seam` is a cross-package oversight scope, and a `node` is the smallest executable work unit. Overseers'
- 'Revocation and reopen semantics are explicit named states: `Promotion Revoked`, `Seam Completion Revoked`, `Reopened`, `Reopened by Patch`, and `Reopened by New Evidence`. Blocked states expose blocked reason, blocked owner, and recovery context. Weak-integration buckets include missing GUI represen'
- 'Approval anchoring moves to canonical runtime identity: `run_id`, `node_id`, `blocked_sequence`, optional `attempt_id`, and execution-unit context refs supersede request-centric button copy, request-centric persistence language, and tier-boundary approval `CTA` framing in `Plans/human-in-the-loop.md'
- 'Corroboration disagreement handling uses the `2-of-3` rule: `2-of-3` accepts a high-impact claim as `/canonical`, no `2-of-3` means a high-impact claim is not accepted as blocking or canonical truth, and credible lesser concerns still emit a non-blocking `/minor` advisory visible on the Orchestrator'
owner_hints:
- Plans/Decision_Log.md
split_recommendation_reason: The bridge has been retired after safe atomization and structural coverage dispositions.
```

## Migration Coverage

Original hash: `f2e60f840d40385942aad5a8875a8243bc33fcfa07959d008e3fe231cc4023f7`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Decision_Log-S0001` through `Decision_Log-S0026` are preserved in place. Phase 2B batch 043 atomized or structurally dispositioned those spans into `DL-002` through `DL-026`, the retired `DL-001` bridge, and explicit structural coverage_map dispositions. `DL-001` is retained only as migration-lineage compatibility coverage and must not re-own atomized source coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime decision-log rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6f04565ca3fcaa8bf3a4f6d`: `DecisionRecord` fields are `decision_id`, `title`, `status`, `owner_doc_ref`, `decided_at_utc`, `supersedes[]`, `rationale_ref`, `affected_policy_axes[]`, and `gui_surface_ref?`. GUI visibility is through Settings > Governance > Decisions when surfaced by FinalGUISpec.
- Repairs `sfk-1608f2e00293837927ad2df5`: "timestamped and final" applies to the historical decision entry, not to generated PlanUnit splits. Split-recommended PlanUnits may create derived records without mutating the original decision text.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 341` (explicitly_deferred; source line 1152; `sfk-f6f04565ca3fcaa8bf3a4f6d`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: steer asks about "decision record schema/GUI" no such schema or GUI exists anywhere in the file; every DL unit is a prose decision statement with governance metadata only.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
