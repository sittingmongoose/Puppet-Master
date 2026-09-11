# Shard 052: Jujutsu D5 Owner Requirements (2026-09-11)

Source: `Plans/storage-plan.md`

Source lines: L19167-L19308

Source SHA256: `7d1d0bb2f109eb645d674e7848036caf8fc70e5c1ec095b730787e8ac16f5739`

---

## Jujutsu D5 Owner Requirements (2026-09-11)

These accepted requirements consume the native owner in `Plans/Jujutsu_Integration.md` and the shared Source Control boundary; planning acceptance is not runtime or readiness evidence.

### SP-260 - Native History Metadata And Isolated View Persistence Boundary

```yaml
plan_unit_id: SP-260
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage consumes Jujutsu/Source Control-owned identities and semantics for named existing-checkpoint
  markers, operation grouping and recovery refs, redo availability, review/currentness and presentation state, sanitized
  diagnostics, and managed isolated historical/preview material. Durable metadata and rebuildable views remain distinct
  from native operation/object authority. These requirements create no physical family or EventRecord admission
  and do not move the native history store into PM redb or seglog.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- SP-253
- SP-254
- JJI-008
unblocks: []
acceptance_criteria:
- Markers reference existing checkpoint and native operation identity; rename/display metadata creates no new native
  operation or independent recovery point. Missing/pruned targets remain explicit and marker storage alone does
  not establish a retention policy.
- Group metadata preserves ordered actual operation refs and partial outcomes; redo and reverse refs remain tied
  to their original repository/workspace and currentness evidence. Replay/retry does not duplicate effects or resurrect
  invalidated redo eligibility.
- Hide/unhide is presentation state, never workspace removal or object deletion. Adoption preserves explicit source-to-target
  identity mapping; no foreign absolute path becomes authority on restore.
- Historical views, version comparisons/evolution/attribution/file-history projections, pinned comparison, query
  assistance, graph priorities and review marks consume their owner identities and stale/missing semantics. Rebuild
  or reload cannot silently substitute current content or convert stale review evidence into valid review.
- Managed rewrite preview material has explicit owner/lifecycle references and safe cleanup of unreferenced temporary
  data; cleanup must not remove pinned recovery or active preview material. Preview persistence never implies apply
  authority.
- Sanitized descriptions and technical/diagnostic views follow SP-253/SP-254 before persistence and indexing. Growth
  diagnostics never silently prune native history or alter backup coverage.
validation_surfaces:
- future focused SP-260 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_storage-plan
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/storage-plan.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

### SP-261 - History Index Rebuild And Completion Receipt Consumers

```yaml
plan_unit_id: SP-261
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage supplies disposable rebuild-material custody and durable non-secret progress/receipt
  references to BRS-021/BRS-022 while Backup retains verification and missing-data-completion orchestration. Native history-index rebuild execution remains with the Jujutsu owner through the PM-owned internal adapter service. Correctness-critical
  indexes are rebuilt from retained native history in the isolated drill; captured compatible indexes are optional
  speed aids only. Completion attempts preserve missing-data and proved-closure distinctions without widening backup
  scope or activating restored content.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- SP-254
- BRS-021
- BRS-022
unblocks: []
acceptance_criteria:
- Rebuild in a disposable restored environment from verified native dependency closure; never repair, migrate, reconcile
  or write original active storage as a side effect of verification.
- Index/cache success cannot mask absent operation heads/views, required object dependencies or incomplete retained
  historical coverage. Missing/corrupt native data remains an explicit verification failure even if a captured index
  is readable.
- Captured speed aids retain exact capture generation/version and are dispensable to correctness proof. Derived-cache
  classification does not reclassify authoritative operation/object bytes as optional.
- Completion persists only existing-owner non-secret scope, attempt/idempotency, phase, partial-result and verification
  receipt refs; secret custody remains external. Crash/retry recovery preserves unproved closure and cannot infer
  completion from downloaded bytes.
- Physical storage-family registration, schemas and events remain separately governed; no storage key, EventRecord
  or materialization proof is allocated by this requirement.
validation_surfaces:
- future focused SP-261 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_storage-plan
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d034
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/storage-plan.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-043, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md
