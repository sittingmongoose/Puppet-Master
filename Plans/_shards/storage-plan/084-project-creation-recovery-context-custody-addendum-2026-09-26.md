# Shard 084: Project Creation-Recovery Context Custody Addendum - 2026-09-26

Source: `Plans/storage-plan.md`

Source lines: L27131-L27205

Source SHA256: `48e6cafde1fe85243587e32d158900ca6c72e14b2890d8c749de081e853bba2b`

---

## Project Creation-Recovery Context Custody Addendum - 2026-09-26

This addendum owns the durable-custody disposition for the Project creation-recovery context declared by
`Plans/Project_System.md` section 3.1.1 (PJCT-007) and machine-bound by
`Plans/project_system_contracts.schema.json#/$defs/project_creation_recovery_context`. The semantic record shape
remains with the Project owner and its typed companion; this addendum proves a machine-readable durable/pending
decision only. `physical_family_registration_pending` is a blocker, not materialized storage: no writer, adapter,
restore path, or readiness admission exists until physical registration lands under the SP-251 layer.

A pre-listing recovery has no `ProjectRecord` row, so the recovery context is the durable owner record for the
unfinished creation. It persists under its recovery identity with original command-instance/idempotency lookup,
immutable original terminal-result and remote-effect evidence, composition currentness, and a one-active-resume
claim. It is custody, not a receipt family: owner results and receipts are referenced by ref and digest, never
re-minted here. No row in this addendum registers an EventRecord family, and the physical family census is
unchanged: this disposition adds no `families` row and no readiness admission.

### SP-321 - Project Creation-Recovery Context Durable Custody

```yaml
plan_unit_id: SP-321
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The `Plans/storage_value_registry.json#/contract_family_dispositions` row
  `scd.project.recovery_context.v1` classifies `pm.project.creation_recovery_context.v1`,
  machine-bound by `Plans/project_system_contracts.schema.json#/$defs/project_creation_recovery_context`,
  as `durable` with `physical_family_status` = `physical_family_registration_pending`.
  The declared key shape is `project_creation_recovery_context.v1:{recovery_id}`, looked up by
  recovery identity and by the original command instance and idempotency key; the value retains the
  immutable original terminal result ref and digest, the Forge create result and receipt refs with the
  verified repository binding, the reviewed draft binding, the settled effects with their result/receipt
  refs, the remaining effects, the composition revision and hash, and the one-active-resume claim. One
  atomic compare-and-swap claim admits a single active resume with a fresh claim generation bound to the
  winning attempt identity; a second Client presenting a new attempt for the same recovery is rejected or
  coalesced, never admitted alongside; child-effect execution and result adoption are fenced by claim
  generation and attempt identity; and a crash restarts into the retained recovery and reconciles any
  in-flight child effect through its owner before retrying it. Retention holds the context until the
  creation reaches a terminal Project outcome — listed registration or owner-confirmed abandonment after
  Forge-side reconciliation — and only then, with all references released, is the row eligible for cleanup;
  restart lookup always returns the retained recovery and never fabricates a new one. A durable-pending row
  cannot be written, restored, advertised as materialized, or used to enable a dependent command. No
  storage writer, adapter, EventRecord family, or receipt family is admitted, and the
  `cmd.project.resume_creation` and `cmd.forge.repository.delete` rows keep `handler_unavailable`.
gui_related: false
gui_classification_reason: This PlanUnit governs storage and contract custody rather than presentation.
depends_on: [SP-251]
unblocks: []
acceptance_criteria:
  - The disposition ID `scd.project.recovery_context.v1` is unique and schema-valid, and the row fixes `runtime_evidence=false`.
  - The row binds `pm.project.creation_recovery_context.v1` to `Plans/project_system_contracts.schema.json` with `persistence_disposition=durable` and `physical_family_registration_pending`.
  - The declared key shape `project_creation_recovery_context.v1:{recovery_id}` with original command-instance/idempotency lookup is stated, but no writer, adapter, restore path, or materialized advertisement exists until physical registration.
  - The registry physical `families` array membership and the readiness-enforced census are unchanged by this disposition.
  - The retained value keeps the immutable original terminal result ref/digest and the Forge create result/receipt refs with the verified repository binding; receipts are referenced, never re-minted, and no receipt family is created.
  - Exactly one atomic compare-and-swap claim admits one active resume; a second new attempt is rejected or coalesced; child effects and result adoption are fenced by claim generation and attempt identity; crash restart reconciles in-flight effects through their owner before retry.
  - The context is retained until a terminal listed or owner-confirmed-abandoned outcome with released references; restart lookup returns the retained recovery and never fabricates one.
  - No EventRecord family is admitted, and `cmd.project.resume_creation` plus `cmd.forge.repository.delete` keep `handler_unavailable`.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-implementation-readiness.py validate-case-l
  - Draft 2020-12 validation of Plans/storage_value_registry.json against Plans/storage_value_registry.schema.json
risk_class: prelisting_recovery_custody_loss_or_double_resume
reasoning_tier: high
context_scope: project_creation_recovery_durable_custody
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/Project_System.md]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Project_System.md#PJCT-007, Plans/Project_System.md#3.1.1-generic-remote-create-local-failure-recovery-composition, source_report:reports/packet-integration-completion-20260926/project-recovery.md]
preserved_exact_tokens: [scd.project.recovery_context.v1, pm.project.creation_recovery_context.v1, "project_creation_recovery_context.v1:{recovery_id}", physical_family_registration_pending]
negative_constraints:
  - No families-row registration, storage writer, adapter, restore path, EventRecord family, receipt family, runtime capability, or native proof.
  - No second active resume per recovery, no adopted effect or result from a superseded or unknown claim, and no fabricated recovery on restart.
  - No WorkNode, NodeSeed, readiness clearance, count override, or governance seal.
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-007, ContractName:Plans/storage-plan.md#SP-321, ContractName:Plans/project_system_contracts.schema.json, SchemaID:pm.project.creation_recovery_context.v1
