# Shard 017: PlanUnits

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L547-L693

Source SHA256: `bb2bab7405a1bad86cade9ab323cb90ca003b3d096632e142ebfad0fb160ff38`

---

## PlanUnits

### AMS-001 - Assistant-Only Memory Subsystem (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: AMS-001
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Plans/assistant-memory-subsystem.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-memory-subsystem-S0040
preserved_exact_tokens:
- Assistant-Only Memory Subsystem (Canonical SSOT)
- Change Summary
- 0. Scope and boundary
- 'ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts'
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/rewrite-tie-in-memo.md'
- 1. Capability boundary (Assistant-only)
- 1.1 Memory provider contract
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-chat-design.md#17-context--truncation'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/agent-rules-context.md'
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, PolicyRule:Decision_Policy.md§2'
- 1.2 Assistant-only evidence boundary
- 'ContractRef: SchemaID:pm.evidence.schema.v1, ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§2'
- 2. Physical storage layout (per project)
- 'ContractRef: ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout'
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#8-integration-points, ContractName:Plans/assistant-chat-design.md#11-threads-and-chat-management'
- 3. Data model (Evidence-Backed Gists; GUI-first)
- 3.1 `MemoryGist` fields (required)
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-chat-design.md#17-context--truncation'
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract'
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#4-retrieval-indexes, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract'
- 3.2 `claims[]` model (atomic statements)
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2'
- 3.3 `EvidenceRef` model (structured, pointers only)
negative_constraints:
- 'Rule: Assistant memory MUST run fully in-process and local-only; it MUST NOT require external servers and MUST NOT use SQLite.'
- 'Rule: Assistant memory MUST NOT be forwarded to subagents through prompts, tools, handoffs, or hidden metadata.'
- 'Rule: MemoryGist records MUST NOT persist large diffs, full logs, or large artifacts; they MUST persist only compact claims/details plus EvidenceRefs to canonical sources.'
- 'Rule: Automatic prompt injection MUST use only Verified gists’ derived `summary` text and MUST NOT auto-inject `details`.'
- 'Rule: EvidenceRefs MUST be small pointers (IDs, hashes, paths) and MUST NOT embed large diffs/logs/artifact bodies.'
- 'Rule: A gist MUST NOT transition to `Verified` if `evidence_refs[]` is empty.'
- 'Rule: Capsule assembly MUST exclude `verification_state != Verified` gists by default. `Unverified` gists MAY be included only by explicit user action; pinned Unverified gists MUST NOT be auto-included unless `assistant.memory.allow_pinned_unverified_injection = true`.'
- 'Rule: Retrieval injection MUST NOT exceed max item count and MUST remain summary-only.'
- 'Rule: Retrieval injection MUST exclude `verification_state != Verified` gists by default. `Unverified` gists MAY be included only by explicit user action; pinned Unverified gists MUST NOT be auto-included unless `assistant.memory.allow_pinned_unverified_injection = true`.'
- 'Rule: All maintenance operations MUST run in-process and MUST NOT depend on external services.'
- '## 11. Non-goals'
compatibility_only_notes:
- 'Rule: AutoMilestone MUST create/promote at most one `Outcome` gist per run when any milestone occurs: tests transition failing→passing, a commit is created, a PR is opened, or the user confirms “done” via a GUI action.'
- 'Rule: A gist MUST transition to `Verified` if and only if ANY holds:'
- 'Rule: A gist MUST NOT transition to `Verified` if `evidence_refs[]` is empty.'
stale_retired_dispositions:
- Verification exists to prevent prompt injection of incorrect or stale continuity.
- 11. **Summary cache coherence:** Editing `claims[]` cannot cause stale cached `summary` text to be injected (cache invalidation required before injection).
owner_boundary_notes:
- '# Assistant-Only Memory Subsystem (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-26: Revised canonical Assistant-only memory SSOT to use **Evidence-Backed Gists** (MemoryGist + EvidenceRef), deterministic verification, AutoRunBoundary/AutoMilestone triggers, Tantivy/USearch indexing contracts, and GUI Gist Review panel.'
- '**Status:** Canonical plan/spec'
- '## 0. Scope and boundary'
- This document is the canonical SSOT for **Assistant-only** memory continuity in Puppet Master.
- It does not replace or redefine system event storage (`seglog` SSOT), system KV/search projections (`redb` + Tantivy), or the shared rules pipeline.
- 'ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts'
- <a id="1-capability-boundary"></a>
- '## 1. Capability boundary (Assistant-only)'
- 'Canonical interface names:'
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-chat-design.md#17-context--truncation'
- 'ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, PolicyRule:Decision_Policy.md§2'
- '### 1.2 Assistant-only evidence boundary'
- 'Rule: MemoryGist records MUST NOT persist large diffs, full logs, or large artifacts; they MUST persist only compact claims/details plus EvidenceRefs to canonical sources.'
- '- Assistant Memory DB (canonical): `.puppet-master/project/state/assistant_memory.redb`'
- 'Note: This document does not change the canonical system-storage default in `Plans/storage-plan.md` (app-global redb layout). The `system.redb` path above is the project-state reference path for memory-local packaging/project-scoped state mode.'
- 'Rule: Memory data MUST be project-scoped and project switching MUST swap active memory stores atomically at the project boundary.'
- 'Canonical record: `MemoryGist`.'
- 'Rule: GUI memory operations (list/edit/verify/pin/delete/half-life edits) MUST read and write `MemoryGist` records in `assistant_memory.redb` as the canonical source.'
- 'Supported variants (canonical contract):'
- 'Canonical indexed fields (minimum):'
- 'Canonical mapping:'
- 'Rule: Deletes/updates MUST use tombstones and MUST support deterministic periodic full rebuild (re-embed + repack) from canonical `assistant_memory.redb`.'
owner_hints:
- Plans/assistant-memory-subsystem.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

