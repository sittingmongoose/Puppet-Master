# Shard 045: Jujutsu D5 Owner Requirements (2026-09-11)

Source: `Plans/FileSafe.md`

Source lines: L14780-L14917

Source SHA256: `6d16dfafe642fb31ea1c6c55063ea55ccbfb9d2930b3b8be3e761f6fd4decb06`

---

## Jujutsu D5 Owner Requirements (2026-09-11)

These accepted requirements consume the native owner in `Plans/Jujutsu_Integration.md` and the shared Source Control boundary; planning acceptance is not runtime or readiness evidence.

### F2-211 - Native History Mutation And Inspection Safety Consumers

```yaml
plan_unit_id: F2-211
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: All accepted Jujutsu history and workspace operations consume existing FileSafe path/Host identity,
  protected metadata, mutation lease, recoverable pre-write state, currentness and authorization boundaries. Native
  operation semantics stay Jujutsu-owned; FileSafe safe-point exact replacement stays its existing distinct restore
  contract. A browse or preview grant cannot authorize apply, repair, maintenance, transport or operation reversal.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- F2-209
- JJI-008
unblocks: []
acceptance_criteria:
- Revalidate exact repository/workspace/Host identity, operation heads and expected revision at effect admission;
  stale previews, ambiguous identities, unavailable recovery material or failed safe-point persistence fail closed
  before modifying the target.
- Group undo proves the actual applied members and recovery target, including partial failure, rather than promising
  atomic native batch undo. Redo invalidation and reverse-selected-operation effects are checked against current
  native state; unsupported root/merge targets are rejected under exact-version qualification, overlapping later
  work exposes conflicts, and neither action aliases exact whole-state restore.
- 'Rewrite preview creation is separately admitted effectful work: native preview can write objects or permit external
  effects and is not a read-only dry run or backup alignment mechanism. Confine creation to explicitly managed isolated
  material with authorized effect scope, lifecycle and cleanup; later apply obtains a fresh authorization/currentness
  decision and cannot publish an unpublished preview implicitly.'
- Read-only or earlier-state browsing does not write original working-copy or native metadata through snapshot,
  migration, reconciliation or index rebuild. Adoption/repair is explicit and cannot silently rewrite stable workspace
  identity; hide/unhide cannot remove data or grant write authority.
- Explicit history maintenance preserves retained-history and backup closure/GC fencing, discloses recovery loss
  and follows destructive authorization. Growth diagnosis never starts automatic pruning.
- Guided convergence, duplicate, merge, absorption, back-out, structured hunk selection and drag/keyboard history
  edits use the same native effect admission; preview/selection alone does not bypass protected repository metadata
  or authorize unbounded mutation.
validation_surfaces:
- future focused F2-211 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_filesafe
implementation_surfaces:
- Plans/FileSafe.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/FileSafe.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

### F2-212 - Operation Diagnostic And Completion Boundaries

```yaml
plan_unit_id: F2-212
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: Operation diagnostic export, technical command views and structured descriptions consume existing
  redacted receipts and FileSafe sensitivity policy. Explicit export scopes only permitted diagnostics and never
  exposes protected authentication, secret bytes, credential-bearing arguments, unsafe configuration or private
  content by treating raw native output as safe. Backup history-index rebuild and missing-data completion retain
  separate isolated verification and current authorization boundaries.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- F2-209
- BRS-021
- BRS-022
unblocks: []
acceptance_criteria:
- Apply sanitization before durable storage, indexing, display, copy or export. Free-text descriptions, user marker
  text and command arguments remain untrusted data; receipt refs cannot rehydrate excluded secrets or protected
  browser content.
- Diagnostic export requires explicit scope and authorized destination; command-log inspection or diagnostic export
  never executes commands or adds transport authorization.
- BRS-021 rebuild cannot write to the original active repository. BRS-022 completion validates destination/path/Host
  and current source/remote identity, permits no automatic restored-secret or remote reuse and never treats fetch
  success as verified closure.
validation_surfaces:
- future focused F2-212 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_filesafe
implementation_surfaces:
- Plans/FileSafe.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d034
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/FileSafe.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-043, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md
